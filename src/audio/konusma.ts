import { durum } from '../engine/ilerleme';
import { TEST_MODU } from '../ui/dom';
import { normal } from './cumleler';
import { kayitCal, kayitDurdur, kayitlariBekle, kayitVar, onYukle } from './kayit';
import type { KayitSecenegi } from './karakter-ses';
import { baglam, muzikKis, sesMotorunuAc } from './motor';

/**
 * Konuşma: şimdilik cihazın Türkçe sesi (Web Speech API, tr-TR).
 * Metin bir ses dosyası yoluysa (.mp3/.m4a/.ogg/.wav) o dosya çalınır — gerçek kayıtlara geçişte kod değişmez.
 */
const HIZ = 0.92;
const TON = 1.1;

let turkceSes: SpeechSynthesisVoice | null = null;
let sayac = 0;
let aktifDosya: HTMLAudioElement | null = null;
let bitir: (() => void) | null = null;

const destek = () => typeof window !== 'undefined' && 'speechSynthesis' in window && !TEST_MODU;

function sesSec() {
  if (!destek()) return;
  const sesler = speechSynthesis.getVoices().filter((v) => v.lang?.toLowerCase().replace('_', '-').startsWith('tr'));
  const tercih = ['yelda', 'google', 'emel', 'filiz', 'seda', 'natural', 'premium', 'enhanced'];
  sesler.sort((a, b) => puan(b) - puan(a));
  function puan(v: SpeechSynthesisVoice) {
    const ad = v.name.toLowerCase();
    return tercih.reduce((p, t, i) => (ad.includes(t) ? p + (tercih.length - i) : p), 0) + (v.localService ? 1 : 0);
  }
  turkceSes = sesler[0] ?? null;
}
if (destek()) {
  sesSec();
  speechSynthesis.addEventListener?.('voiceschanged', sesSec);
}

/** iOS: ilk dokunuşta boş bir konuşma ile motoru uyandır. */
export function konusmaMotorunuAc() {
  if (!destek()) return;
  try {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    u.lang = 'tr-TR';
    speechSynthesis.speak(u);
  } catch {
    /* yok say */
  }
}

export function sus() {
  sayac++;
  // yarıda kesilen cümle müziği/efektleri kısık bırakmasın (yeni cümle hemen yine kısar)
  if (konusuyor) muzikKis(false);
  konusuyor = false;
  ani = null;
  kayitDurdur();
  if (destek()) speechSynthesis.cancel();
  if (aktifDosya) {
    aktifDosya.pause();
    aktifDosya = null;
  }
  bitir?.();
  bitir = null;
}

const DOSYA = /\.(mp3|m4a|ogg|wav|aac)$/i;

export type Soylenecek = string | undefined | null | (string | undefined | null)[];

/**
 * Metni (ya da parçalarını sırayla) söyler; bittiğinde çözülür.
 * Her parça için önce gerçek kayıt aranır (public/ses), yoksa cihazın Türkçe sesi kullanılır.
 */
let konusuyor = false;
/** Şu an bir cümle söyleniyor mu (kayıt ya da cihaz sesi). */
export const konusuyorMu = () => konusuyor;

/**
 * Şu an çalan parça (dudak senkronu, src/audio/dudak.ts): 'kayit' = Web Audio'dan geçen gerçek kayıt (ses
 * ölçülebilir), 'cihaz' = cihazın sesi ya da düz ses dosyası (ölçülemez; ağız metnin ritmiyle oynar).
 * bas: parçanın başladığı an (performance.now). Parça başlamadan / bitince null.
 */
export interface KonusmaAni {
  kaynak: 'kayit' | 'cihaz';
  metin: string;
  bas: number;
}
let ani: KonusmaAni | null = null;
export const konusmaAni = (): KonusmaAni | null => ani;

export interface KonusmaSecenegi {
  /** Karakter sesi: kayıtlar bu hızda (ve tonda) çalınır, ör. 1.18 = daha ince, sevimli */
  ton?: number;
  /**
   * Konuşan karakter (ör. 'kino'): karakterin kendi ses kaydı varsa o normal tonda çalınır ve `ton` yok sayılır;
   * yoksa anlatıcı kaydı `ton` ile çalınır (content/seslendirme.json → karakter_sesleri).
   */
  karakter?: string | null;
  /**
   * false: kaydı çalınamayan parça (kayıt yok ya da ses motoru henüz açılmadı — ilk dokunuştan önce) cihazın robotik
   * Türkçe sesine düşmez; parçanın süresi kadar sessiz beklenir (ekrandaki balon / yazı yine görünür).
   */
  cihazSesi?: boolean;
  /**
   * Cihaz sesi bir kelimeye geçince (SpeechSynthesis 'boundary'): kelimenin metindeki yeri. Metin, ses etiketleri
   * ([giggles] …) silinmiş ve kırpılmış hâliyle sayılır. Kayıt çalarken ve olayı vermeyen cihazlarda çağrılmaz
   * (Kitaplar: okunan kelime vurgusu, kitap/src/okuyucu.ts; olay yoksa süreyle tahmin edilir).
   */
  kelime?: (karakterSirasi: number) => void;
}

/** Kino'nun konuşması: kendi sesi yoksa anlatıcı sesinin kalın tonu. */
export const KINO_SESI: KonusmaSecenegi = { karakter: 'kino', ton: 0.92 };

/** Söylenmekte olan cümlenin, çağıranın beklediği sözü (tekrarSoyle bunu devralır). */
interface Bekleyen {
  coz: () => void;
  devredildi: boolean;
}
let bekleyen: Bekleyen | null = null;

function sarmala(ic: Promise<void>, onceki: Bekleyen | null): Promise<void> {
  return new Promise<void>((coz, red) => {
    const b: Bekleyen = {
      devredildi: false,
      coz: () => {
        coz();
        onceki?.coz();
      },
    };
    bekleyen = b;
    ic.then(
      () => {
        if (!b.devredildi) b.coz();
      },
      (e) => {
        if (b.devredildi) return;
        red(e);
        onceki?.coz();
      },
    );
  });
}

export function konus(girdi: Soylenecek, secenek: KonusmaSecenegi = {}): Promise<void> {
  const ic = konusIc(girdi, secenek);
  // test / konuşma kapalı / boş metin: çalan bir şey yok, devralınacak bir şey de yok
  return konusuyor ? sarmala(ic, null) : ic;
}

/**
 * "Tekrar dinle": bir cümle söylenirken çağrılırsa o cümleyi baştan söyler ve cümleyi bekleyen akış (sahnede
 * `await konus(...)`) tekrar bitene kadar bekler; böylece hikâye sonraki cümleye atlamaz. Sessizken düz konus gibidir.
 */
export function tekrarSoyle(girdi: Soylenecek, secenek: KonusmaSecenegi = {}): Promise<void> {
  const eski = konusuyor ? bekleyen : null;
  if (eski) eski.devredildi = true;
  const ic = konusIc(girdi, secenek);
  if (!eski) return konusuyor ? sarmala(ic, null) : ic;
  if (konusuyor) return sarmala(ic, eski);
  void ic.then(eski.coz, eski.coz);
  return ic;
}

/**
 * İlk cümle yarışı (kalite denetimi 2026-10-16, K1): açılışta manifest ya da ses motoru hazır olmadan gelen cümle
 * kaydı olduğu hâlde cihazın robot sesiyle okunuyordu. Konuşma önce manifesti, kayıt varsa motorun çalışmasını
 * kısa bir süre bekler. Motor hiç açılmadıysa (sayfa dokunuşsuz açıldı) bir kez beklenir; sonraki cümleler beklemez.
 */
export const HAZIRLIK_MS = 1500;
let motorBeklendi = false;

function motorCalisiyor() {
  return baglam()?.state === 'running';
}

async function kayitIcinHazirlan(parcalar: string[], secenek: { karakter?: string | null; ton?: number }) {
  await kayitlariBekle(HAZIRLIK_MS);
  if (motorCalisiyor() || !parcalar.some((p) => kayitVar(p, secenek))) return;
  // önceki sayfadaki dokunuş bu sayfada da sesi açabilir (tarayıcı izin verirse): motor hemen kurulur
  const c = baglam() ?? sesMotorunuAc();
  if (!c || motorBeklendi) return;
  await new Promise<void>((coz) => {
    const bitti = () => {
      clearTimeout(t);
      c.removeEventListener?.('statechange', bak);
      coz();
    };
    const bak = () => c.state === 'running' && bitti();
    const t = setTimeout(() => {
      // ilk dokunuş hâlâ gelmedi: bundan sonraki cümleler beklemesin (akış yavaşlamasın)
      motorBeklendi = true;
      bitti();
    }, HAZIRLIK_MS);
    c.addEventListener?.('statechange', bak);
    bak();
  });
}

/**
 * İlk dokunuştan önce sessiz geçen kayıtlı cümle(ler): motor birkaç saniye içinde açılırsa (çocuk ekrana dokundu)
 * kayıttan bir kez söylenir; bu arada oyun yeni bir şey söylerse ya da süre geçerse unutulur.
 */
const KACAN_MS = 6000;
let kacan: { parcalar: string[]; secenek: KonusmaSecenegi; t: number } | null = null;
let izlenenBaglam: AudioContext | null = null;
function kacaniIzle() {
  const c = baglam();
  if (!c || c === izlenenBaglam) return;
  izlenenBaglam = c;
  c.addEventListener?.('statechange', () => {
    if (c.state !== 'running' || !kacan) return;
    // dokunuş bir düğmeye geldiyse oyunun kendi cümlesi önce başlasın (click pointerdown'dan sonra gelir)
    setTimeout(() => {
      const k = kacan;
      kacan = null;
      if (!k || konusuyor || performance.now() - k.t > KACAN_MS || !motorCalisiyor()) return;
      void konus(k.parcalar, k.secenek);
    }, 400);
  });
}

/** Kaydı olan ama motor açılmadığı için sessiz geçen parça: bu sırada motor açılırsa kayıt hemen çalar. */
function sessizKayitli(metin: string, benim: number, secenek: KayitSecenegi, basladi: () => void): Promise<boolean> {
  return new Promise<boolean>((coz) => {
    if (benim !== sayac) return coz(false);
    const c = baglam();
    let bitti = false;
    const t = setTimeout(() => son(false), 500 + metin.length * 55);
    function son(calindi: boolean) {
      if (bitti) return;
      bitti = true;
      clearTimeout(t);
      c?.removeEventListener?.('statechange', bak);
      coz(calindi);
    }
    function bak() {
      if (bitti || benim !== sayac || c?.state !== 'running') return;
      clearTimeout(t);
      c.removeEventListener?.('statechange', bak);
      void kayitCal(metin, () => benim !== sayac, secenek, basladi).then((ok) => son(ok));
    }
    c?.addEventListener?.('statechange', bak);
    bitir = () => son(false);
  });
}

function konusIc(girdi: Soylenecek, secenek: KonusmaSecenegi): Promise<void> {
  sus();
  kacan = null;
  const benim = sayac;
  let parcalar = (Array.isArray(girdi) ? girdi : [girdi]).map((p) => normal(p ?? '')).filter(Boolean);
  const kayitSecenegi = { karakter: secenek.karakter, ton: secenek.ton };
  if (!parcalar.length) return Promise.resolve();
  if (TEST_MODU) return new Promise((r) => setTimeout(r, 5));
  if (!durum.i.ayarlar.konusma) return new Promise((r) => setTimeout(r, 250));

  onYukle(parcalar, kayitSecenegi);
  muzikKis(true);
  konusuyor = true;
  return (async () => {
    try {
      await kayitIcinHazirlan(parcalar, kayitSecenegi);
      if (benim !== sayac) return;
      // Birleşik cümlenin tek parça kaydı varsa onu çal (daha doğal, arada boşluk yok)
      const butun = normal(parcalar.join(' '));
      if (parcalar.length > 1 && kayitVar(butun, kayitSecenegi)) {
        parcalar = [butun];
        onYukle(parcalar, kayitSecenegi);
      }
      const kacanlar: string[] = [];
      for (const p of parcalar) {
        if (benim !== sayac) return;
        const basladi = () => {
          if (benim === sayac) ani = { kaynak: 'kayit', metin: p, bas: performance.now() };
        };
        const kayitli = kayitVar(p, kayitSecenegi);
        const motorAcik = motorCalisiyor();
        const calindi = kayitli && motorAcik && (await kayitCal(p, () => benim !== sayac, kayitSecenegi, basladi));
        if (benim !== sayac) return;
        // kaydı olan cümle hiçbir zaman robot sese düşmez: motor açılmadıysa (ilk dokunuştan önce) sessiz geçer
        if (!calindi && kayitli && !motorAcik) {
          if (!(await sessizKayitli(p, benim, kayitSecenegi, basladi)) && benim === sayac) kacanlar.push(p);
        } else if (!calindi) await (secenek.cihazSesi === false && !DOSYA.test(p) ? sessizParca(p, benim) : tekParca(p, benim, secenek.ton ?? 1, secenek.kelime));
        if (benim === sayac) ani = null;
      }
      if (benim === sayac && kacanlar.length) {
        kacan = { parcalar: kacanlar, secenek, t: performance.now() };
        kacaniIzle();
      }
      if (benim === sayac) muzikKis(false);
    } finally {
      if (benim === sayac) {
        konusuyor = false;
        ani = null;
      }
    }
  })();
}

/** Cihaz sesi istenmeyen parça: söylenecekmiş gibi kısa süre beklenir (akış ve balonlar aynı ritimde sürer). */
function sessizParca(metin: string, benim: number): Promise<void> {
  return new Promise<void>((coz) => {
    if (benim !== sayac) return coz();
    const t = setTimeout(son, 500 + metin.length * 55);
    function son() {
      clearTimeout(t);
      coz();
    }
    bitir = son;
  });
}

function tekParca(metin: string, benim: number, ton = 1, kelime?: (i: number) => void): Promise<void> {
  const ayar = durum.i.ayarlar;
  return new Promise<void>((coz) => {
    let bitti = false;
    const son = () => {
      if (bitti) return;
      bitti = true;
      coz();
    };
    bitir = son;
    const emniyet = setTimeout(son, 1800 + metin.length * 95);

    if (DOSYA.test(metin)) {
      const a = new Audio(metin);
      aktifDosya = a;
      a.volume = ayar.seviye;
      a.onended = a.onerror = () => {
        clearTimeout(emniyet);
        son();
      };
      a.play().then(() => {
        if (benim === sayac) ani = { kaynak: 'cihaz', metin, bas: performance.now() };
      }, () => son());
      return;
    }
    if (!destek()) {
      clearTimeout(emniyet);
      setTimeout(son, 400);
      return;
    }
    // ses etiketleri ([yawns], [whispers] …) yalnız ElevenLabs içindir; cihaz sesi bunları okumasın
    const u = new SpeechSynthesisUtterance(metin.replace(/\[[^\]]*\]\s*/g, '').trim());
    u.lang = 'tr-TR';
    if (turkceSes) u.voice = turkceSes;
    u.rate = HIZ;
    u.pitch = Math.min(2, TON * ton);
    u.volume = ayar.seviye;
    u.onend = u.onerror = () => {
      clearTimeout(emniyet);
      son();
    };
    if (kelime)
      u.onboundary = (e) => {
        if (benim === sayac && (!e.name || e.name === 'word')) kelime(e.charIndex);
      };
    // ağız ritmi sesin gerçekten başladığı andan (onstart gelmeyen cihazda konuşma isteğinden) sayılır
    u.onstart = () => {
      if (benim === sayac) ani = { kaynak: 'cihaz', metin, bas: performance.now() };
    };
    // Chrome bazen cancel()'dan hemen sonra gelen konuşmayı yutar; kısa gecikme.
    setTimeout(() => {
      if (benim !== sayac) return;
      speechSynthesis.speak(u);
      ani ??= { kaynak: 'cihaz', metin, bas: performance.now() };
    }, 60);
  });
}
