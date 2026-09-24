/**
 * Gerçek seslendirme kayıtları (ElevenLabs ile üretilir, public/ses/ altında).
 * Bir cümlenin kaydı varsa Web Audio ile çalınır; yoksa cihazın Türkçe sesi devreye girer.
 */
import { normal } from './cumleler';
import { baglam, konusmaCikisi } from './motor';

interface Manifest {
  ses_id: string | null;
  dosyalar: Record<string, string>;
}

let manifest: Manifest | null = null;
let manifestYukleniyor: Promise<void> | null = null;
const tamponlar = new Map<string, Promise<AudioBuffer | null>>();
let calan: AudioBufferSourceNode | null = null;

/** Manifest'i bir kez yükler (uygulama açılışında çağrılır). */
export function kayitlariHazirla(): Promise<void> {
  manifestYukleniyor ??= fetch('./ses/manifest.json')
    .then((r) => (r.ok ? r.json() : null))
    .then((m: Manifest | null) => {
      manifest = m;
    })
    .catch(() => undefined);
  return manifestYukleniyor;
}

function dosya(metin: string): string | undefined {
  return manifest?.dosyalar[normal(metin)];
}

export function kayitVar(metin: string): boolean {
  return !!dosya(metin);
}

function tampon(metin: string): Promise<AudioBuffer | null> {
  const f = dosya(metin);
  const c = baglam();
  if (!f || !c) return Promise.resolve(null);
  let p = tamponlar.get(f);
  if (!p) {
    p = fetch(`./ses/${f}`)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
      .then((ab) => c.decodeAudioData(ab))
      .catch(() => {
        tamponlar.delete(f);
        return null;
      });
    tamponlar.set(f, p);
  }
  return p;
}

/** Sıradaki cümlelerin kayıtlarını önceden indirip çözer (gecikmesiz çalsın diye). */
export function onYukle(metinler: (string | undefined | null)[]) {
  for (const m of metinler) if (m) void tampon(m);
}

/** Kaydı çalar; bittiğinde true. Kayıt yoksa/çalınamazsa false (çağıran cihaz sesine düşer). */
export async function kayitCal(metin: string, iptalMi: () => boolean): Promise<boolean> {
  const c = baglam();
  const cikis = konusmaCikisi();
  if (!c || !cikis || c.state !== 'running') return false;
  const t = await tampon(metin);
  if (!t || iptalMi()) return !!t;
  return new Promise((coz) => {
    const src = c.createBufferSource();
    src.buffer = t;
    src.connect(cikis);
    calan = src;
    const emniyet = setTimeout(() => coz(true), t.duration * 1000 + 800);
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
