// Deneyler · Zincirleme Top Parkuru: ses (efektler kodla üretilir: scripts/deney-parkur-efekt*.mjs; sözler Ceren ve Kino,
// ElevenLabs). Efektler WebAudio tamponları; sözler sırayla (biri konuşurken yenisi kuyruğa), aynı söz art arda iki kez yok.
import { efektCikisi, konusmaCikisi, sesMotorunuAc } from '../../../src/audio/motor';
import sozler from './sozler.json';

const sesDosyalari = import.meta.glob<string>('../../../assets/deney/parkur/ses/*.mp3', { eager: true, query: '?url', import: 'default' });
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
export const sesVar = (ad: string) => !!sesDosyalari['../../../assets/deney/parkur/ses/' + ad + '.mp3'];

/**
 * Efektlerin düzeyi (22–23 Kasım ölçümü, ffmpeg ebur128 anlık en yüksek; sözler -12…-17 LUFS, konuşma kanalı +1,2 dB, efekt
 * kanalı -0,9 dB): olaylar sözün 2–4 dB altında, küçük tıkırtılar 6–8 dB altında; zil ve çan sevincin doruğu, söz düzeyinde.
 */
const DUZEY: Record<string, number> = {
  zil: 1.2, konfeti: 0.4, uc: 0.4, boing: 0.8, klank: 1.6, yay: 1.6, puf: 1.4, tik: 0.85,
  'not-do': 0.85, 'not-re': 0.85, 'not-mi': 0.85, 'not-fa': 0.85,
  // Deney-A1 (23 Kasım ölçümü): balonun gıcırtısı -7 LUFS (çok yüksek), kaykay ve takoz -24 (kısık), çan doruk.
  balon: 0.25, su: 0.75, miknatis: 0.8, 'kaykay-bin': 1.4, takoz: 1.5, kaykay: 1.5, 'yay-sik': 0.7, can: 1.3, kova: 0.8, pota: 0.9,
};
/** Test kipinde ses kaydı (spec ve video): ne, ne zaman, ne yüksek. */
export const sesKaydi: { ad: string; t: number; kazanc: number; sure?: number }[] = [];
export function efekt(ad: string, kazanc = 1) {
  kazanc *= DUZEY[ad] ?? 1;
  const ctx = sesMotorunuAc(), cikis = efektCikisi(), b = tamponlar.get('efekt-' + ad);
  if (TEST) sesKaydi.push({ ad: 'efekt-' + ad, t: performance.now(), kazanc });
  if (!ctx || !cikis || !b) return;
  const k = ctx.createBufferSource(), g = ctx.createGain();
  k.buffer = b;
  g.gain.value = kazanc;
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
  if (TEST) sesKaydi.push({ ad, t: performance.now(), kazanc: 1, sure: b?.duration });
  try { konusan?.stop(); } catch { /* bitmiş */ }
  sozBitti = null;
  document.querySelector<HTMLElement>('#sahne')!.dataset.soz = ad;
  if (!ctx || !cikis || !b) { if (sonra) setTimeout(sonra, TEST ? 400 : 1200); return; }
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

/** Döngü sesleri (yuvarlanma, kaykay tekerleri, akan su): düzeyi ve hızı sürekli ayarlanır. */
const donguler = new Map<string, { k: AudioBufferSourceNode; g: GainNode }>();
const dongudeAcik = new Map<string, boolean>();
export function dongu(ad: string, duzey: number, hiz = 1) {
  const ctx = sesMotorunuAc(), cikis = efektCikisi(), b = tamponlar.get('efekt-' + ad);
  const acik = duzey > 0.05;
  if (TEST && acik !== !!dongudeAcik.get(ad)) sesKaydi.push({ ad: (acik ? 'dongu-bas-' : 'dongu-bit-') + ad, t: performance.now(), kazanc: duzey });
  dongudeAcik.set(ad, acik);
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
  d.g.gain.setTargetAtTime(duzey, ctx.currentTime, 0.04);
  d.k.playbackRate.setTargetAtTime(hiz, ctx.currentTime, 0.08);
}
export function donguleriKapat() { for (const ad of donguler.keys()) dongu(ad, 0); }
