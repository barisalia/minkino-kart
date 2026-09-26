/** Film ses efektleri: Web Audio sentezi (dosya ve kredi gerekmez). Efekt kanalından çalar (sessize alma geçerli). */
import { baglam, efektCikisi } from '../../src/audio/motor';

function hazir(): [AudioContext, AudioNode] | null {
  const c = baglam();
  const o = efektCikisi();
  return c && o && c.state === 'running' ? [c, o] : null;
}
let gurultu: AudioBuffer | null = null;
function gurultuTamponu(c: AudioContext) {
  if (!gurultu) {
    gurultu = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = gurultu.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return gurultu;
}
function ton(frek: number, bas: number, sure: number, tip: OscillatorType, ses: number, bitis?: number) {
  const hz = hazir();
  if (!hz) return;
  const [c, cikis] = hz;
  const t = c.currentTime + bas;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = tip;
  o.frequency.setValueAtTime(frek, t);
  if (bitis) o.frequency.exponentialRampToValueAtTime(bitis, t + sure);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(ses, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  o.connect(g).connect(cikis);
  o.start(t);
  o.stop(t + sure + 0.05);
}
function hisirti(bas: number, sure: number, f1: number, f2: number, ses: number, q = 1) {
  const hz = hazir();
  if (!hz) return;
  const [c, cikis] = hz;
  const t = c.currentTime + bas;
  const s = c.createBufferSource();
  s.buffer = gurultuTamponu(c);
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.Q.value = q;
  f.frequency.setValueAtTime(f1, t);
  f.frequency.exponentialRampToValueAtTime(f2, t + sure);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(ses, t + sure * 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  s.connect(f).connect(g).connect(cikis);
  s.start(t);
  s.stop(t + sure + 0.05);
}

export const FILM_EFEKT: Record<string, () => void> = {
  /** yuvarlanma: gıcır gıcır (kısa tahta sürtünmeleri) */
  yuvarlan() {
    for (let i = 0; i < 6; i++) hisirti(i * 0.2, 0.16, 300, 700, 0.14, 3);
    ton(90, 0, 1.2, 'triangle', 0.06, 70);
  },
  /** tok: tahtaya çarpma */
  tok() {
    ton(160, 0, 0.25, 'sine', 0.5, 60);
    hisirti(0, 0.08, 1800, 900, 0.2, 2);
  },
  /** çat: kesme */
  cat() {
    hisirti(0, 0.09, 4000, 2000, 0.35, 1.5);
    ton(700, 0, 0.08, 'square', 0.05, 300);
    hisirti(0.05, 0.25, 1200, 400, 0.12, 0.8);
  },
  /** koklama: fıs fıs */
  kokla() {
    hisirti(0, 0.12, 2500, 3500, 0.12, 2);
    hisirti(0.2, 0.12, 2500, 3500, 0.12, 2);
    hisirti(0.4, 0.18, 2500, 3800, 0.14, 2);
  },
  /** karın gurultusu */
  gurul() {
    const hz = hazir();
    if (!hz) return;
    const [c, cikis] = hz;
    const t = c.currentTime;
    const o = c.createOscillator();
    const lfo = c.createOscillator();
    const lg = c.createGain();
    const g = c.createGain();
    o.type = 'sawtooth';
    o.frequency.value = 70;
    lfo.frequency.value = 9;
    lg.gain.value = 25;
    lfo.connect(lg).connect(o.frequency);
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 300;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.18, t + 0.15);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    o.connect(f).connect(g).connect(cikis);
    o.start(t);
    lfo.start(t);
    o.stop(t + 1.2);
    lfo.stop(t + 1.2);
  },
  /** kuyruk pervanesi: vuvuvu */
  vuvu() {
    for (let i = 0; i < 5; i++) hisirti(i * 0.14, 0.12, 500, 1400, 0.1, 1.2);
  },
  /** parıltı: çan */
  parilti() {
    [84, 88, 91].forEach((n, i) => ton(440 * Math.pow(2, (n - 69) / 12), i * 0.07, 0.4, 'sine', 0.1));
  },
};
