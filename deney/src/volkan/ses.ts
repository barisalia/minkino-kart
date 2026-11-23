// Deneyler · Köpüren Renk Volkanı: ses (efektler kodla üretilir: scripts/deney-volkan-efekt.mjs; sözler Ceren ve Kino, ElevenLabs).
// Efektler WebAudio tamponları; sözler sırayla (biri konuşurken yenisi kuyruğa), aynı söz art arda iki kez yok.
import { efektCikisi, konusmaCikisi, sesMotorunuAc } from '../../../src/audio/motor';
import sozler from './sozler.json';

const sesDosyalari = import.meta.glob<string>('../../../assets/deney/volkan/ses/*.mp3', { eager: true, query: '?url', import: 'default' });
const TEST = new URLSearchParams(location.search).has('test');

export type Soz = keyof typeof sozler;
const tamponlar = new Map<string, AudioBuffer>();
let yukleme: Promise<void> | null = null;
export function sesleriYukle() {
  const ctx = sesMotorunuAc();
  if (!ctx || yukleme) return yukleme;
  yukleme = Promise.all(Object.entries(sesDosyalari).map(async ([yol, url]) => {
    const ad = yol.split('/').pop()!.replace('.mp3', '');
    try { tamponlar.set(ad, await ctx.decodeAudioData(await (await fetch(url)).arrayBuffer())); } catch { /* ses yoksa oyun sessiz sürer */ }
  })).then(() => undefined);
  return yukleme;
}

/**
 * Efekt düzeyleri (ffmpeg ebur128 anlık en yüksek; sözler -12…-17 LUFS, konuşma kanalı +1,2 dB, efekt kanalı -0,9 dB): olaylar sözün
 * 2–4 dB altında, küçük tıkırtılar 6–8 dB altında; köpüğün taşması sevincin doruğu, söz düzeyinde. Ölçüm notu ORTAK_NOTLAR'da.
 */
const DUZEY: Record<string, number> = {
  fizz: 0.45, pirilti: 0.6, patlama: 1.25, dok: 0.8, girdap: 0.6, karbonat: 0.8, bidik: 0.9, kasik: 1.2, tik: 0.9,
  // İkinci yazım (23 Kasım ölçümü; kısa sesler 0,6 sn sessizlikle uzatılıp ölçüldü): kumaş -16,6, fırt -16,8, güm -23,6, çın -11,6,
  // puf -19,9, şıngır -21,7, blup -15, şap -23,4, fış -16, ting -10,7, sayfa -18,7, tak -27,4, çıt -27, vuu -16,2 LUFS.
  kumas: 1, cit: 1.6, firt: 0.9, gum: 1.8, cin: 0.45, puf: 1.2, singir: 1.35, blup: 0.7, sap: 1.6, fis: 0.8, ting: 0.4, sayfa: 1.1, tak: 1.6, vuu: 0.6,
};
/** Test kipinde ses kaydı (spec): ne, ne zaman, ne yüksek. */
export const sesKaydi: { ad: string; t: number; kazanc: number }[] = [];
export function efekt(ad: string, kazanc = 1) {
  kazanc *= DUZEY[ad] ?? 1;
  const ctx = sesMotorunuAc(), cikis = efektCikisi(), b = tamponlar.get('efekt-' + ad);
  if (TEST) sesKaydi.push({ ad: 'efekt-' + ad, t: performance.now(), kazanc });
  if (!ctx || !cikis || !b) return;
  const k = ctx.createBufferSource(), g = ctx.createGain();
  k.buffer = b;
  g.gain.value = kazanc;
  k.playbackRate.value = 0.94 + Math.random() * 0.12; // aynı efekt art arda birebir aynı çınlamasın
  k.connect(g).connect(cikis);
  k.start();
}

let konusan: AudioBufferSourceNode | null = null;
let sonSoz = '';
let sozBitti: (() => void) | null = null;
const kuyruk: (() => void)[] = [];
export const konusuyor = () => !!konusan;
export function sozuUnut() { sonSoz = ''; }
export function kuyruguBosalt() { kuyruk.length = 0; }
/** Ceren ya da Kino konuşur; aynı söz art arda iki kez söylenmez. Bitince `sonra` çağrılır. */
export function soyle(ad: Soz, sonra?: () => void) {
  if (ad === sonSoz) { sonra?.(); return; }
  sonSoz = ad;
  const ctx = sesMotorunuAc(), cikis = konusmaCikisi(), b = tamponlar.get(ad);
  if (TEST) sesKaydi.push({ ad, t: performance.now(), kazanc: 1 });
  try { konusan?.stop(); } catch { /* bitmiş */ }
  sozBitti = null;
  document.querySelector<HTMLElement>('#sahne')!.dataset.soz = ad;
  if (!ctx || !cikis || !b) { if (sonra) setTimeout(sonra, TEST ? 300 : 1200); return; }
  const k = ctx.createBufferSource();
  k.buffer = b;
  k.connect(cikis);
  konusan = k;
  sozBitti = sonra ?? null;
  k.onended = () => {
    if (konusan !== k) return;
    konusan = null;
    const f = sozBitti;
    sozBitti = null;
    f?.();
    if (!konusan && kuyruk.length) kuyruk.shift()!();
  };
  k.start();
}
/** Biri konuşuyorsa sözü sıraya koyar (bölmez), yoksa hemen söyler. */
export function sirayla(ad: Soz, sonra?: () => void) {
  if (konusan) kuyruk.push(() => soyle(ad, sonra)); else soyle(ad, sonra);
}
/** Sözleri sırayla söyler; sonuncusu bitince çözülür. */
export function dizi(adlar: Soz[]) {
  return new Promise<void>((bitti) => {
    const sonraki = (i: number) => { if (i >= adlar.length) { bitti(); return; } sirayla(adlar[i], () => sonraki(i + 1)); };
    sonraki(0);
  });
}

/** Döngü sesi (süngerin fış fışı): düzeyi sürekli ayarlanır. */
const donguler = new Map<string, { k: AudioBufferSourceNode; g: GainNode }>();
const acik = new Map<string, boolean>();
export function dongu(ad: string, duzey: number) {
  const ctx = sesMotorunuAc(), cikis = efektCikisi(), b = tamponlar.get('efekt-' + ad);
  const ac = duzey > 0.05;
  if (TEST && ac !== !!acik.get(ad)) sesKaydi.push({ ad: (ac ? 'dongu-bas-' : 'dongu-bit-') + ad, t: performance.now(), kazanc: duzey });
  acik.set(ad, ac);
  if (!ctx || !cikis || !b) return;
  let d = donguler.get(ad);
  if (!d) {
    const k = ctx.createBufferSource(), g = ctx.createGain();
    k.buffer = b;
    k.loop = true;
    g.gain.value = 0;
    k.connect(g).connect(cikis);
    k.start();
    d = { k, g };
    donguler.set(ad, d);
  }
  d.g.gain.setTargetAtTime(duzey * (DUZEY[ad] ?? 1), ctx.currentTime, 0.05);
}
