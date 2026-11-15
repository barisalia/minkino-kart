/**
 * Gerçek seslendirme kayıtları (ElevenLabs ile üretilir, public/ses/ altında).
 * Bir cümlenin kaydı varsa Web Audio ile çalınır; yoksa cihazın Türkçe sesi devreye girer.
 * Karakter cümlesinde (ör. Kino) önce karakterin kendi kaydı aranır (src/audio/karakter-ses.ts → kayitSec).
 */
import { kayitSec, type KayitSecenegi, type SesManifest } from './karakter-ses';
import { baglam, konusmaCikisi } from './motor';
import { durum } from '../engine/ilerleme';

/** Kayıt: ayrı dosya adı ya da paket içindeki bayt aralığı (paket = art arda eklenmiş mp3'ler). */
type Kayit = string | { p: number; b: number; u: number };

interface Manifest extends SesManifest<Kayit> {
  paketler?: string[];
}

let manifest: Manifest | null = null;
/** Kayıtların bulunduğu klasör (alt klasördeki uygulamalar için, ör. Çiz Canlansın: '../ses/') */
let kok = './ses/';
/** Asıl klasörde kayıt bulunamazsa sırayla denenecek yedek klasörler (ör. tek dosyalık önizlemede './ses/') */
let yedekler: string[] = [];
const bolu = (y: string) => (y.endsWith('/') ? y : `${y}/`);
export function sesKokuAyarla(yol: string, ...yedek: string[]) {
  kok = bolu(yol);
  yedekler = yedek.map(bolu);
}
let manifestYukleniyor: Promise<void> | null = null;
/** Manifest yüklendi (ya da hiçbir klasörde bulunamadı): kayitVar'ın "yok" demesi artık kesin. */
let manifestBitti = false;
const tamponlar = new Map<string, Promise<AudioBuffer | null>>();
const paketVerisi = new Map<number, Promise<ArrayBuffer>>();

function paket(n: number): Promise<ArrayBuffer> {
  let p = paketVerisi.get(n);
  if (!p) {
    p = fetch(`${kok}${manifest!.paketler![n]}`).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))));
    p.catch(() => paketVerisi.delete(n));
    paketVerisi.set(n, p);
  }
  return p;
}

/** Ses motoru açılmadan önce indirilen ham kayıtlar (motor açılınca beklemeden çözülür). */
const hamVeri = new Map<string, Promise<ArrayBuffer>>();
const anahtarOf = (k: Kayit) => (typeof k === 'string' ? k : `${k.p}:${k.b}`);

function veri(k: Kayit): Promise<ArrayBuffer> {
  if (typeof k === 'string') {
    let p = hamVeri.get(k);
    if (!p) {
      p = fetch(`${kok}${k}`).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))));
      p.catch(() => hamVeri.delete(k));
      hamVeri.set(k, p);
    }
    // decodeAudioData veriyi tüketir: önbellekteki kopya bozulmasın
    return p.then((ab) => ab.slice(0));
  }
  return paket(k.p).then((ab) => ab.slice(k.b, k.b + k.u));
}
let calan: AudioBufferSourceNode | null = null;
/** Çalan kaydın kendi ses düğümü: susunca kayıt bir anda kesilmez, ~0.18 sn'de kısılır. */
let calanGuc: GainNode | null = null;
/** Çalan kaydın sözü: durdurulunca kısılmayı beklemeden hemen çözülür (eskisi gibi). */
let calanBitti: (() => void) | null = null;

/** Manifest'i bir kez yükler (uygulama açılışında çağrılır). */
export function kayitlariHazirla(): Promise<void> {
  manifestYukleniyor ??= (async () => {
    for (const k of [kok, ...yedekler]) {
      try {
        const r = await fetch(`${k}manifest.json`);
        if (!r.ok) continue;
        const m = (await r.json()) as Manifest;
        if (!m?.dosyalar) continue;
        kok = k;
        return m;
      } catch {
        /* sonraki klasör */
      }
    }
    return null;
  })()
    .then((m: Manifest | null) => {
      manifest = m;
      manifestBitti = true;
      // Paketli önizleme sürümü: paketleri sırayla arka planda indir
      if (m?.paketler?.length) void m.paketler.reduce<Promise<unknown>>((onceki, _, n) => onceki.then(() => paket(n)).catch(() => undefined), Promise.resolve());
    })
    .catch(() => {
      manifestBitti = true;
    });
  return manifestYukleniyor;
}

/** Manifest yüklenmesi bitti mi. */
export const kayitlarHazirMi = () => manifestBitti;

/**
 * Manifest yüklenene kadar bekler (en çok `ms`). Açılıştaki ilk cümle manifest gelmeden söylenince kayıt "yok"
 * sayılıp cihaz sesine düşüyordu (kalite denetimi 2026-10-16, K1): konuşma önce bunu bekler.
 */
export function kayitlariBekle(ms: number): Promise<void> {
  if (manifestBitti) return Promise.resolve();
  return new Promise<void>((coz) => {
    const t = setTimeout(coz, ms);
    void kayitlariHazirla().then(() => {
      clearTimeout(t);
      coz();
    });
  });
}

/** Cümle için çalınacak kayıt: karakterin kendi kaydı (hız 1) ya da anlatıcı kaydı (hız = ton). */
function dosya(metin: string, secenek: KayitSecenegi = {}) {
  return kayitSec(manifest, metin, secenek);
}

export function kayitVar(metin: string, secenek: KayitSecenegi = {}): boolean {
  return !!dosya(metin, secenek);
}

/** Karakterin bu cümle için KENDİ kaydı var mı (anlatıcı yedeği sayılmaz; ör. Otobüs müşterileri) */
export function karakterKaydiVar(metin: string, karakter: string): boolean {
  return dosya(metin, { karakter })?.karakter === karakter;
}

function tampon(metin: string, secenek: KayitSecenegi = {}): Promise<AudioBuffer | null> {
  const f = dosya(metin, secenek)?.kayit;
  const c = baglam();
  if (!f || !c) return Promise.resolve(null);
  const anahtar = anahtarOf(f);
  let p = tamponlar.get(anahtar);
  if (!p) {
    p = veri(f)
      .then((ab) => c.decodeAudioData(ab))
      .catch(() => {
        tamponlar.delete(anahtar);
        return null;
      });
    tamponlar.set(anahtar, p);
  }
  return p;
}

/** Sıradaki cümlelerin kayıtlarını önceden indirip çözer (gecikmesiz çalsın diye). */
export function onYukle(metinler: (string | undefined | null)[], secenek: KayitSecenegi = {}) {
  // iOS kayıtları doğrudan uygulama paketinden okur; aynı MP3'ü Web Audio için ayrıca çözme.
  if (kaydiElemanlaCal()) return;
  // manifest henüz gelmediyse gelince indir (ekran açılır açılmaz çağrılan ön yükleme boşa gitmesin)
  if (!manifestBitti && manifestYukleniyor) {
    void manifestYukleniyor.then(() => onYukle(metinler, secenek));
    return;
  }
  for (const m of metinler) {
    if (!m) continue;
    // ses motoru henüz açılmadıysa (ilk dokunuştan önce) yalnız indir; motor açılınca çözülür
    if (baglam()) void tampon(m, secenek);
    else {
      const f = dosya(m, secenek)?.kayit;
      if (f) void veri(f).catch(() => undefined);
    }
  }
}

/** iOS uygulamasında konuşma, oyun efektlerinin AudioContext durumundan bağımsız çalar. */
export const kaydiElemanlaCal = (): boolean => typeof location !== 'undefined' && location.protocol === 'capacitor:';
type KayitBasladi = (bas: number, gecenSaniye: () => number) => void;
let calanEleman: HTMLAudioElement | null = null;
function elemanCal(yol: string, hiz: number, iptalMi: () => boolean, basladi?: KayitBasladi): Promise<boolean> {
  if (iptalMi()) return Promise.resolve(true);
  return new Promise((coz) => {
    const a = new Audio(yol);
    let bitti = false;
    const son = (ok: boolean) => {
      if (bitti) return;
      bitti = true;
      clearInterval(bak);
      if (calanEleman === a) calanEleman = null;
      if (calanBitti === tamam) calanBitti = null;
      a.onended = a.onerror = null;
      a.pause();
      coz(ok);
    };
    const tamam = () => son(true);
    const bak = setInterval(() => iptalMi() && son(true), 120);
    a.volume = Math.max(0, Math.min(1, durum.i.ayarlar.seviye));
    a.muted = durum.i.ayarlar.seviye === 0;
    a.playbackRate = hiz;
    a.onended = tamam;
    a.onerror = () => son(false);
    calanEleman = a;
    calanBitti = tamam;
    a.play().then(() => {
      if (!bitti && !iptalMi()) basladi?.(baglam()?.currentTime ?? 0, () => a.currentTime);
    }, () => son(false));
  });
}

async function kayitElemani(kayit: Kayit, hiz: number, iptalMi: () => boolean, basladi?: KayitBasladi): Promise<boolean> {
  if (typeof kayit === 'string') return elemanCal(kok + kayit, hiz, iptalMi, basladi);
  const veriParcasi = await veri(kayit);
  if (iptalMi()) return true;
  const yol = URL.createObjectURL(new Blob([veriParcasi], { type: 'audio/mpeg' }));
  try {
    return await elemanCal(yol, hiz, iptalMi, basladi);
  } finally {
    URL.revokeObjectURL(yol);
  }
}

export async function kayitCal(metin: string, iptalMi: () => boolean, secenek: KayitSecenegi = {}, basladi?: KayitBasladi): Promise<boolean> {
  const d = dosya(metin, secenek);
  if (!d) return false;
  if (kaydiElemanlaCal() && await kayitElemani(d.kayit, d.hiz, iptalMi, basladi).catch(() => false)) return true;
  if (iptalMi()) return true;
  const c = baglam();
  const cikis = konusmaCikisi();
  if (!c || !cikis || c.state !== 'running') return false;
  const t = await tampon(metin, secenek);
  if (!t || iptalMi()) return !!t;
  return tamponCal(c, cikis, t, d.hiz, basladi);
}

/** Çözülmüş kaydı konuşma çıkışından çalar (kayitDurdur / sus ile yumuşakça kesilir); bitince true. */
function tamponCal(c: AudioContext, cikis: GainNode, t: AudioBuffer, hiz: number, basladi?: KayitBasladi): Promise<boolean> {
  return new Promise((coz) => {
    const src = c.createBufferSource();
    src.buffer = t;
    src.playbackRate.value = hiz;
    const guc = c.createGain();
    src.connect(guc);
    guc.connect(cikis);
    calan = src;
    calanGuc = guc;
    calanBitti = () => coz(true);
    const emniyet = setTimeout(() => coz(true), (t.duration / hiz) * 1000 + 800);
    src.onended = () => {
      clearTimeout(emniyet);
      if (calan === src) calan = null;
      guc.disconnect();
      coz(true);
    };
    const bas = c.currentTime;
    src.start();
    basladi?.(bas, () => (c.currentTime - bas) * hiz);
  });
}

// ---------------------------------------------------------------- manifest dışı kayıt dosyaları

/** Ayrı manifestli kayıtlar (ör. kitap satırları, public/ses/kitap/): yol klasörüyle tam; çözülmüş hâli önbellekte */
const dosyaVerisi = new Map<string, Promise<ArrayBuffer>>();
const dosyaTamponlari = new Map<string, Promise<AudioBuffer | null>>();
function dosyaVeri(yol: string): Promise<ArrayBuffer> {
  let p = dosyaVerisi.get(yol);
  if (!p) {
    p = fetch(yol).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))));
    p.catch(() => dosyaVerisi.delete(yol));
    dosyaVerisi.set(yol, p);
  }
  return p.then((ab) => ab.slice(0));
}
function dosyaTamponu(yol: string): Promise<AudioBuffer | null> {
  const c = baglam();
  if (!c) return Promise.resolve(null);
  let p = dosyaTamponlari.get(yol);
  if (!p) {
    p = dosyaVeri(yol)
      .then((ab) => c.decodeAudioData(ab))
      .catch(() => {
        dosyaTamponlari.delete(yol);
        return null;
      });
    dosyaTamponlari.set(yol, p);
  }
  return p;
}

/** Sıradaki kayıt dosyalarını önceden indirir (motor açıksa çözer de) */
export function dosyaOnYukle(yollar: string[]) {
  if (kaydiElemanlaCal()) return;
  for (const y of yollar) {
    if (baglam()) void dosyaTamponu(y);
    else void dosyaVeri(y).catch(() => undefined);
  }
}

/**
 * Bir kayıt dosyasını çalar; bitince true. Motor açık değilse ya da dosya gelmezse false (kitap bu durumda cihaz
 * sesine düşmez, sessiz geçer). basladi: çalmanın başladığı an (AudioContext saati, sn).
 */
export async function dosyaCal(yol: string, iptalMi: () => boolean, basladi?: KayitBasladi): Promise<boolean> {
  if (kaydiElemanlaCal() && await elemanCal(yol, 1, iptalMi, basladi).catch(() => false)) return true;
  if (iptalMi()) return true;
  const c = baglam();
  const cikis = konusmaCikisi();
  if (!c || !cikis || c.state !== 'running') return false;
  const t = await dosyaTamponu(yol);
  if (!t || iptalMi()) return !!t;
  return tamponCal(c, cikis, t, 1, basladi);
}

export function kayitDurdur() {
  calanEleman?.pause();
  calanEleman = null;
  try {
    const c = baglam();
    if (calan && calanGuc && c) {
      // yumuşak kısılma (tık sesi ve kopma yok), sonra dur
      calanGuc.gain.cancelScheduledValues(c.currentTime);
      calanGuc.gain.setValueAtTime(calanGuc.gain.value, c.currentTime);
      calanGuc.gain.linearRampToValueAtTime(0, c.currentTime + 0.18);
      calan.stop(c.currentTime + 0.2);
    } else calan?.stop();
  } catch {
    /* zaten durmuş */
  }
  calan = null;
  calanGuc = null;
  const bitti = calanBitti;
  calanBitti = null;
  bitti?.();
}

/**
 * Bir cümlenin kaydı çözülmüş hâliyle ve kayitCal'ın çalacağı hızla (kayıt yoksa null). Filmin MP4 kaydında sesi
 * dosyaya işlemek için.
 */
export async function kayitTamponu(metin: string, secenek: KayitSecenegi = {}): Promise<{ tampon: AudioBuffer; hiz: number } | null> {
  const t = await tampon(metin, secenek);
  return t ? { tampon: t, hiz: dosya(metin, secenek)?.hiz ?? 1 } : null;
}

/**
 * Kaydın örnekleri (tek kanal) ve çalma hızı: ses bağlamı açılmadan da (filmin MP4 kaydı) çevrimdışı çözülür.
 * Dudak senkronunun önceden çıkarılan zarfı için (src/audio/dudak.ts). Kayıt yoksa null.
 */
export async function kayitOrnekleri(metin: string, secenek: KayitSecenegi = {}): Promise<{ ornek: Float32Array; hz: number; hiz: number } | null> {
  const s = dosya(metin, secenek);
  if (!s) return null;
  try {
    let t = baglam() ? await tampon(metin, secenek) : null;
    if (!t) t = await new OfflineAudioContext(1, 1, 48000).decodeAudioData(await veri(s.kayit));
    return t ? { ornek: t.getChannelData(0), hz: t.sampleRate, hiz: s.hiz } : null;
  } catch {
    return null;
  }
}
