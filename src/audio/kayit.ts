/**
 * Gerçek seslendirme kayıtları (ElevenLabs ile üretilir, public/ses/ altında).
 * Bir cümlenin kaydı varsa Web Audio ile çalınır; yoksa cihazın Türkçe sesi devreye girer.
 */
import { normal } from './cumleler';
import { baglam, konusmaCikisi } from './motor';

/** Kayıt: ayrı dosya adı ya da paket içindeki bayt aralığı (paket = art arda eklenmiş mp3'ler). */
type Kayit = string | { p: number; b: number; u: number };

interface Manifest {
  ses_id: string | null;
  dosyalar: Record<string, Kayit>;
  paketler?: string[];
}

let manifest: Manifest | null = null;
/** Kayıtların bulunduğu klasör (alt klasördeki uygulamalar için, ör. Minik Sanatçı: '../ses/') */
let kok = './ses/';
/** Asıl klasörde kayıt bulunamazsa sırayla denenecek yedek klasörler (ör. tek dosyalık önizlemede './ses/') */
let yedekler: string[] = [];
const bolu = (y: string) => (y.endsWith('/') ? y : `${y}/`);
export function sesKokuAyarla(yol: string, ...yedek: string[]) {
  kok = bolu(yol);
  yedekler = yedek.map(bolu);
}
let manifestYukleniyor: Promise<void> | null = null;
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

function veri(k: Kayit): Promise<ArrayBuffer> {
  if (typeof k === 'string') return fetch(`${kok}${k}`).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))));
  return paket(k.p).then((ab) => ab.slice(k.b, k.b + k.u));
}
let calan: AudioBufferSourceNode | null = null;

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
      // Paketli önizleme sürümü: paketleri sırayla arka planda indir
      if (m?.paketler?.length) void m.paketler.reduce<Promise<unknown>>((onceki, _, n) => onceki.then(() => paket(n)).catch(() => undefined), Promise.resolve());
    })
    .catch(() => undefined);
  return manifestYukleniyor;
}

function dosya(metin: string): Kayit | undefined {
  return manifest?.dosyalar[normal(metin)];
}

export function kayitVar(metin: string): boolean {
  return !!dosya(metin);
}

function tampon(metin: string): Promise<AudioBuffer | null> {
  const f = dosya(metin);
  const c = baglam();
  if (!f || !c) return Promise.resolve(null);
  const anahtar = typeof f === 'string' ? f : `${f.p}:${f.b}`;
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
export function onYukle(metinler: (string | undefined | null)[]) {
  for (const m of metinler) if (m) void tampon(m);
}

/** Kaydı çalar; bittiğinde true. Kayıt yoksa/çalınamazsa false (çağıran cihaz sesine düşer). */
export async function kayitCal(metin: string, iptalMi: () => boolean, hiz = 1): Promise<boolean> {
  const c = baglam();
  const cikis = konusmaCikisi();
  if (!c || !cikis || c.state !== 'running') return false;
  const t = await tampon(metin);
  if (!t || iptalMi()) return !!t;
  return new Promise((coz) => {
    const src = c.createBufferSource();
    src.buffer = t;
    src.playbackRate.value = hiz;
    src.connect(cikis);
    calan = src;
    const emniyet = setTimeout(() => coz(true), (t.duration / hiz) * 1000 + 800);
    src.onended = () => {
      clearTimeout(emniyet);
      if (calan === src) calan = null;
      coz(true);
    };
    src.start();
  });
}

export function kayitDurdur() {
  try {
    calan?.stop();
  } catch {
    /* zaten durmuş */
  }
  calan = null;
}
