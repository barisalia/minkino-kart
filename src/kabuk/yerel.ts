/**
 * Uygulama kabuğu (yalnız uygulama derlemesi: vite.config.ts bu dosyayı her sayfanın başına ekler, oyun kodundan
 * önce çalışır). Web sitesine girmez.
 *
 * - Kayıtlar: `minkino-*` localStorage kayıtları @capacitor/preferences'a yansır; silinmişse geri yüklenir.
 * - Arka plan (@capacitor/app appStateChange): ses, müzik, konuşma ve mikrofon durur; geri gelince ses devam eder.
 * - Ekran yönü (@capacitor/screen-orientation): film yatay kilitler, çıkınca serbest (src/kabuk/yon.ts).
 * - Android geri tuşu (@capacitor/app backButton): pencere kapanır / oyundan ana menüye / ana menüden çıkış.
 */
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { aynaDepo, aynala, geriYukle, kaliciMi, type KaliciDepo } from './kalici';
import { ARKA_PLAN_OLAYI, GERI_OLAYI, geriKarari, menuSayfasiMi, YON_OLAYI, type Yon } from './yon';

if (Capacitor.isNativePlatform()) kabuguKur();

function kabuguKur() {
  // ---------------------------------------------------------------- kayıtlar → Preferences
  const kalici: KaliciDepo = {
    get: async (key) => (await Preferences.get({ key })).value,
    set: (key, value) => Preferences.set({ key, value }),
    remove: (key) => Preferences.remove({ key }),
    keys: async () => (await Preferences.keys()).keys,
  };
  const ls = window.localStorage;
  const asil = { set: Storage.prototype.setItem, remove: Storage.prototype.removeItem };
  const yerel = { getItem: (k: string) => ls.getItem(k), setItem: (k: string, v: string) => asil.set.call(ls, k, v), removeItem: (k: string) => asil.remove.call(ls, k) };
  const ayna = aynaDepo(yerel, kalici);
  // sayfa açılırken yerelde olan kayıtlar (oyun kodu henüz çalışmadı)
  const ilk = new Set(Object.keys(ls));
  // geri yükleme denetimi bitene kadar aynaya yazılmaz: oyunun açılışta yazdığı varsayılan kayıt, Preferences'taki
  // asıl kaydı ezmesin
  let hazir = false;
  const bekleyen = new Set<string>();
  // bütün oyunlar localStorage kullanır: yazımlar buradan aynaya geçer (oyun kodu değişmeden)
  Storage.prototype.setItem = function (this: Storage, k: string, v: string) {
    if (this !== ls || !kaliciMi(String(k))) return asil.set.call(this, k, v);
    if (hazir) return ayna.setItem(String(k), String(v));
    asil.set.call(ls, k, v);
    bekleyen.add(String(k));
  };
  Storage.prototype.removeItem = function (this: Storage, k: string) {
    if (this !== ls || !kaliciMi(String(k))) return asil.remove.call(this, k);
    if (hazir) return ayna.removeItem(String(k));
    asil.remove.call(ls, k);
    bekleyen.add(String(k));
  };
  void (async () => {
    try {
      const n = await geriYukle(yerel, kalici, (k) => ilk.has(k));
      // iOS localStorage'ı silmişti: kayıtlar geri geldi, oyun onlarla yeniden açılsın (bir kez)
      if (n > 0 && !sessionStorage.getItem('kabuk-yeniden')) {
        sessionStorage.setItem('kabuk-yeniden', '1');
        location.reload();
        return;
      }
      hazir = true;
      for (const k of bekleyen) {
        const v = ls.getItem(k);
        await (v === null ? kalici.remove(k) : kalici.set(k, v));
      }
      bekleyen.clear();
      await aynala(Object.keys(ls), yerel, kalici);
    } catch {
      /* Preferences yoksa localStorage yeter */
      hazir = true;
    }
  })();

  // ---------------------------------------------------------------- arka plan: ses, müzik, mikrofon dursun
  const baglamlar = new Set<AudioContext>();
  const AC = window.AudioContext;
  if (AC) {
    class IzlenenBaglam extends AC {
      constructor(o?: AudioContextOptions) {
        super(o);
        baglamlar.add(this);
      }
    }
    window.AudioContext = IzlenenBaglam;
    (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext = IzlenenBaglam;
  }
  const medyalar = new Set<HTMLMediaElement>();
  const asilCal = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
    medyalar.add(this);
    return asilCal.call(this);
  };
  const akislar = new Set<MediaStream>();
  const md = navigator.mediaDevices;
  if (md?.getUserMedia) {
    const asilMik = md.getUserMedia.bind(md);
    md.getUserMedia = async (k?: MediaStreamConstraints) => {
      const s = await asilMik(k);
      akislar.add(s);
      return s;
    };
  }

  let duranMedya: HTMLMediaElement[] = [];
  let duranBaglam: AudioContext[] = [];
  const arkaPlan = (arkada: boolean) => {
    if (arkada) {
      duranMedya = [...medyalar].filter((m) => !m.paused && !m.ended);
      duranMedya.forEach((m) => m.pause());
      for (const m of medyalar) if (m.paused) medyalar.delete(m);
      duranBaglam = [...baglamlar].filter((c) => c.state === 'running');
      duranBaglam.forEach((c) => void c.suspend().catch(() => undefined));
      try {
        speechSynthesis.cancel();
      } catch {
        /* yok */
      }
      for (const s of akislar) s.getAudioTracks().forEach((t) => (t.enabled = false));
    } else {
      for (const s of akislar) {
        const canli = s.getAudioTracks().filter((t) => t.readyState === 'live');
        if (!canli.length) akislar.delete(s);
        canli.forEach((t) => (t.enabled = true));
      }
      duranBaglam.forEach((c) => void c.resume().catch(() => undefined));
      duranMedya.forEach((m) => void m.play().catch(() => undefined));
      duranMedya = [];
      duranBaglam = [];
    }
    window.dispatchEvent(new CustomEvent(ARKA_PLAN_OLAYI, { detail: { arkada } }));
  };
  void App.addListener('appStateChange', ({ isActive }) => arkaPlan(!isActive));

  // ---------------------------------------------------------------- Android geri tuşu
  // Açık pencere (kilit anı, ebeveyn kapısı, abonelik) kapanır; sayfa kendi işleyebilir (menüde Ebeveyn Köşesi → menü);
  // oyundan ana menüye dönülür; yalnız ana menüde uygulamadan çıkılır. (Dinleyici varken WebView'ın kendi geri
  // davranışı çalışmaz: geçmişte geri gidip aynı oyunu yeniden açmak yok.)
  let gidiliyor = false;
  window.addEventListener('pageshow', () => (gidiliyor = false));
  void App.addListener('backButton', () => {
    if (gidiliyor) return;
    const pencereAcik = !!document.querySelector('.kapi-perde, .ab-perde:not(.cikiyor), .kl-perde:not(.cikiyor)');
    const sayfaIsledi = !pencereAcik && !window.dispatchEvent(new CustomEvent(GERI_OLAYI, { cancelable: true }));
    const karar = geriKarari({ pencereAcik, sayfaIsledi, menude: menuSayfasiMi(location.pathname) });
    if (karar === 'pencere') document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    else if (karar === 'cik') void App.exitApp();
    else if (karar === 'menu') {
      gidiliyor = true;
      const menu = new URL('/index.html', location.href).href;
      // krem perde + sesin kısılması (gecis.ts oyun kodunda zaten yüklü; kabuk açılışta ona bağlanmasın diye geç yüklenir)
      void import('../ui/gecis').then((g) => g.sayfadanCik(() => location.assign(menu)), () => location.assign(menu));
    }
  });

  // ---------------------------------------------------------------- ekran yönü
  window.addEventListener(YON_OLAYI, (e) => {
    const yon = (e as CustomEvent<Yon>).detail;
    void (yon === 'yatay' ? ScreenOrientation.lock({ orientation: 'landscape' }) : ScreenOrientation.unlock()).catch(() => undefined);
  });
  // sayfa değişince (film sayfasından menüye) kilit kalmasın
  window.addEventListener('pagehide', () => void ScreenOrientation.unlock().catch(() => undefined));
}
