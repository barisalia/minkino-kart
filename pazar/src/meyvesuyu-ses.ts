/**
 * Meyve Suyu Köşesi sesleri: Web Audio sentezi (dosya yok, kredi yok).
 * Blender vızıltısı, meyvenin sürahiye "plop" düşüşü, bardağa akan suyun gluk gluk'u, pipetle içme "şlürp".
 */
import { baglam, efektCikisi } from '../../src/audio/motor';

function hazir(): [AudioContext, GainNode] | null {
  const c = baglam();
  const o = efektCikisi();
  if (!c || !o || c.state !== 'running') return null;
  return [c, o];
}

let gurultu: AudioBuffer | null = null;
function gurultuTamponu(c: AudioContext): AudioBuffer {
  if (gurultu) return gurultu;
  gurultu = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
  const d = gurultu.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return gurultu;
}

function blip(c: AudioContext, cikis: AudioNode, t: number, f1: number, f2: number, sure: number, ses: number) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(f1, t);
  o.frequency.exponentialRampToValueAtTime(f2, t + sure);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(ses, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  o.connect(g).connect(cikis);
  o.start(t);
  o.stop(t + sure + 0.03);
}

/** Blender: motor uğultusu (testere dalga + titreşim) ve bıçağın hışırtısı; yükselip alçalır. Dönen fonksiyon susturur. */
export function blenderSesi(sn: number): () => void {
  const h = hazir();
  if (!h) return () => undefined;
  const [c, cikis] = h;
  const t = c.currentTime;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.16, t + 0.25);
  g.gain.setValueAtTime(0.16, t + Math.max(0.3, sn - 0.35));
  g.gain.exponentialRampToValueAtTime(0.0001, t + sn);
  g.connect(cikis);
  const motor = c.createOscillator();
  motor.type = 'sawtooth';
  motor.frequency.setValueAtTime(70, t);
  motor.frequency.exponentialRampToValueAtTime(150, t + 0.4);
  motor.frequency.setValueAtTime(150, t + Math.max(0.45, sn - 0.35));
  motor.frequency.exponentialRampToValueAtTime(60, t + sn);
  const sf = c.createBiquadFilter();
  sf.type = 'lowpass';
  sf.frequency.value = 900;
  const lfo = c.createOscillator();
  const lfoG = c.createGain();
  lfo.frequency.value = 23;
  lfoG.gain.value = 10;
  lfo.connect(lfoG).connect(motor.frequency);
  motor.connect(sf).connect(g);
  const n = c.createBufferSource();
  n.buffer = gurultuTamponu(c);
  n.loop = true;
  const nf = c.createBiquadFilter();
  nf.type = 'bandpass';
  nf.Q.value = 0.9;
  nf.frequency.setValueAtTime(700, t);
  nf.frequency.exponentialRampToValueAtTime(2200, t + 0.5);
  const ng = c.createGain();
  ng.gain.value = 0.5;
  n.connect(nf).connect(ng).connect(g);
  motor.start(t);
  lfo.start(t);
  n.start(t);
  const son = t + sn + 0.05;
  motor.stop(son);
  lfo.stop(son);
  n.stop(son);
  return () => {
    const s = c.currentTime;
    g.gain.cancelScheduledValues(s);
    g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), s);
    g.gain.exponentialRampToValueAtTime(0.0001, s + 0.08);
    try {
      motor.stop(s + 0.1);
      lfo.stop(s + 0.1);
      n.stop(s + 0.1);
    } catch {
      /* zaten durdu */
    }
  };
}

/** Meyve sürahiye düşer: tok bir "plop" */
export function plopSesi() {
  const h = hazir();
  if (!h) return;
  const [c, cikis] = h;
  blip(c, cikis, c.currentTime, 520, 140, 0.16, 0.3);
}

/** Bardağa akan su: sn boyunca ara ara yükselen "gluk"lar (bardak doldukça ince) */
export function dokmeSesi(sn: number) {
  const h = hazir();
  if (!h) return;
  const [c, cikis] = h;
  const t0 = c.currentTime + 0.12;
  let t = 0;
  let i = 0;
  while (t < sn - 0.1) {
    const f = 260 + (t / sn) * 380 + Math.random() * 60;
    blip(c, cikis, t0 + t, f, f * 1.9, 0.07, 0.18);
    t += 0.1 + Math.random() * 0.07;
    i++;
  }
  // akışın hışırtısı
  const n = c.createBufferSource();
  n.buffer = gurultuTamponu(c);
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = 1400;
  f.Q.value = 1.4;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.05, t0 + 0.1);
  g.gain.setValueAtTime(0.05, t0 + Math.max(0.15, sn - 0.2));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + sn);
  n.connect(f).connect(g).connect(cikis);
  n.start(t0);
  n.stop(t0 + sn + 0.05);
  return i;
}

/** Pipetle içme: kısa, yükselen "şlürp" (adet kez) */
export function icmeSesi(adet = 3, aralik = 0.33) {
  const h = hazir();
  if (!h) return;
  const [c, cikis] = h;
  for (let k = 0; k < adet; k++) {
    const t = c.currentTime + k * aralik;
    const n = c.createBufferSource();
    n.buffer = gurultuTamponu(c);
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 3;
    f.frequency.setValueAtTime(600, t);
    f.frequency.exponentialRampToValueAtTime(2600, t + 0.2);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.14, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    n.connect(f).connect(g).connect(cikis);
    n.start(t);
    n.stop(t + 0.25);
    blip(c, cikis, t + 0.18, 180, 120, 0.09, 0.2); // yutkunma
  }
}

/** Yüz buruşturma: titrek "brrr" */
export function brrSesi() {
  const h = hazir();
  if (!h) return;
  const [c, cikis] = h;
  const t = c.currentTime;
  const o = c.createOscillator();
  o.type = 'triangle';
  o.frequency.setValueAtTime(320, t);
  o.frequency.exponentialRampToValueAtTime(180, t + 0.5);
  const lfo = c.createOscillator();
  const lg = c.createGain();
  lfo.frequency.value = 28;
  lg.gain.value = 60;
  lfo.connect(lg).connect(o.frequency);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.12, t + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
  o.connect(g).connect(cikis);
  o.start(t);
  lfo.start(t);
  o.stop(t + 0.6);
  lfo.stop(t + 0.6);
}

/** Ödül anı: yıldız büyürken yükselen parıltı ("vııııng") */
export function odulSesi() {
  const h = hazir();
  if (!h) return;
  const [c, cikis] = h;
  const t = c.currentTime;
  const o = c.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(700, t);
  o.frequency.exponentialRampToValueAtTime(2100, t + 0.35);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.08, t + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
  o.connect(g).connect(cikis);
  o.start(t);
  o.stop(t + 0.45);
}
