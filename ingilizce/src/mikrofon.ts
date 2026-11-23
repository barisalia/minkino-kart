/**
 * "Şimdi sen söyle": söz tanınamayan cihazlarda çocuğun sesi yalnız VAR / YOK diye ölçülür (bu dosya). Sözü tanıyabilen
 * cihazlarda söylenen sözcük yalnız cihazın içinde tanınır (src/audio/soz-tanima.ts; adimlar/ortak.ts → soylet).
 * Ses kaydedilmez, saklanmaz, hiçbir yere gönderilmez; telaffuz puanlanmaz. Mikrofon yoksa, izin verilmezse ya da ortam gürültülüyse çocuk aynı adımı
 * dokunarak geçer (her sesli görevin dokunma karşılığı vardır; oyun hiçbir koşulda kilitlenmez).
 * Sırayla konuşma: Polly ya da Ceren konuşurken dinlenmez; dinleme, kayıt bittikten sonra başlar.
 */
import { TEST_MODU } from '../../src/ui/dom';

const TERCIH = 'minkino-ingilizce-mikrofon';
let akim: MediaStream | undefined, baglam: AudioContext | undefined, cozumleyici: AnalyserNode | undefined;
let hal: 'bilinmiyor' | 'acik' | 'yok' = 'bilinmiyor';

/** Veli köşesindeki ayar: mikrofonla söyleme açık mı */
export function mikrofonTercihi(): boolean {
  try { return localStorage.getItem(TERCIH) !== 'kapali'; } catch { return true; }
}
export function mikrofonTercihiYaz(acik: boolean) {
  try { if (acik) localStorage.removeItem(TERCIH); else localStorage.setItem(TERCIH, 'kapali'); } catch { /* bu oturumda kalır */ }
  if (!acik) mikrofonKapat();
  else if (hal === 'yok') hal = 'bilinmiyor';
}

/** Mikrofonu açar (ilk seferde izin sorulur). Açılamazsa false; çağıran dokunma yoluna geçer. Çocuğun bir dokunuşunda çağrılmalı. */
export async function mikrofonAc(): Promise<boolean> {
  if (TEST_MODU || !mikrofonTercihi()) return false;
  if (hal === 'acik' && akim?.active && baglam?.state !== 'closed') { void baglam?.resume().catch(() => {}); return true; }
  if (hal === 'yok') return false;
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('mikrofon yok');
    akim = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    baglam = new AudioContext();
    cozumleyici = baglam.createAnalyser();
    cozumleyici.fftSize = 1024;
    baglam.createMediaStreamSource(akim).connect(cozumleyici);
    hal = 'acik';
    return true;
  } catch {
    hal = 'yok';
    return false;
  }
}

export function mikrofonKapat() {
  akim?.getTracks().forEach((t) => t.stop());
  if (baglam && baglam.state !== 'closed') void baglam.close().catch(() => {});
  akim = undefined; baglam = undefined; cozumleyici = undefined;
  if (hal === 'acik') hal = 'bilinmiyor';
}
export const mikrofonAcikMi = () => hal === 'acik' && !!akim?.active;

/** Ses var mı kararı (saf; birim testi): eşik, ortam gürültüsünün üç katı ve en az 0,02 */
export function sesEsigi(taban: number): number {
  return Math.max(0.02, taban * 3);
}

export interface Dinleme { birak(): void }

/**
 * Çocuğu dinler. `seviye(dolu, anlik)`: dolu 0–1 (yeterince konuştu mu), anlik 0–1 (o anki ses). Çocuk yaklaşık yarım
 * saniye ses çıkarıp susunca `bitti(true)`; süre dolarsa `bitti(false)` (çağıran dokunma düğmesini öne çıkarır).
 */
export function dinle(o: { seviye(dolu: number, anlik: number): void; bitti(konustu: boolean): void; sureMs?: number }): Dinleme {
  const c = cozumleyici;
  if (!c) { const z = window.setTimeout(() => o.bitti(false), 0); return { birak: () => clearTimeout(z) }; }
  const tampon = new Float32Array(c.fftSize);
  const HEDEF_MS = 380, SUSMA_MS = 420;
  let kare = 0, bitti = false, taban = 0.006, sesliMs = 0, susmaMs = 0, once = performance.now();
  const bas = once;
  const bitir = (konustu: boolean) => { if (bitti) return; bitti = true; cancelAnimationFrame(kare); o.bitti(konustu); };
  const olc = () => {
    if (bitti) return;
    const simdi = performance.now(), gecen = Math.min(100, simdi - once);
    once = simdi;
    c.getFloatTimeDomainData(tampon);
    let t = 0;
    for (let i = 0; i < tampon.length; i++) t += tampon[i] * tampon[i];
    const rms = Math.sqrt(t / tampon.length);
    const esik = sesEsigi(taban);
    if (rms > esik) { sesliMs += gecen; susmaMs = 0; } else { susmaMs += gecen; if (rms < taban * 1.6) taban = taban * 0.97 + rms * 0.03; }
    o.seviye(Math.min(1, sesliMs / HEDEF_MS), Math.min(1, rms / 0.12));
    if ((sesliMs >= HEDEF_MS && susmaMs >= SUSMA_MS) || sesliMs >= 1500) { bitir(true); return; }
    if (simdi - bas > (o.sureMs ?? 6000)) { bitir(sesliMs >= HEDEF_MS * 0.6); return; }
    kare = requestAnimationFrame(olc);
  };
  kare = requestAnimationFrame(olc);
  return { birak: () => { bitti = true; cancelAnimationFrame(kare); } };
}
