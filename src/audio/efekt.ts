import { baglam, efektCikisi } from './motor';

/** Web Audio ile sentezlenen ses efektleri (dosya gerekmez). */

function hazir(): [AudioContext, GainNode] | null {
  const c = baglam();
  const o = efektCikisi();
  if (!c || !o || c.state !== 'running') return null;
  return [c, o];
}

function ton(frek: number, bas: number, sure: number, tip: OscillatorType = 'sine', ses = 0.3, bitisFrek?: number) {
  const h = hazir();
  if (!h) return;
  const [c, cikis] = h;
  const t = c.currentTime + bas;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = tip;
  o.frequency.setValueAtTime(frek, t);
  if (bitisFrek) o.frequency.exponentialRampToValueAtTime(bitisFrek, t + sure);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(ses, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  o.connect(g).connect(cikis);
  o.start(t);
  o.stop(t + sure + 0.05);
}

/** Çan gibi tatlı nota (iki harmonik). */
function can(frek: number, bas: number, ses = 0.22, sure = 0.5) {
  ton(frek, bas, sure, 'sine', ses);
  ton(frek * 2, bas, sure * 0.6, 'sine', ses * 0.35);
  ton(frek * 3.01, bas, sure * 0.3, 'triangle', ses * 0.12);
}

let gurultu: AudioBuffer | null = null;
function gurultuTamponu(c: AudioContext): AudioBuffer {
  if (gurultu) return gurultu;
  gurultu = c.createBuffer(1, c.sampleRate, c.sampleRate);
  const d = gurultu.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return gurultu;
}

function hisirti(bas: number, sure: number, f1: number, f2: number, ses = 0.25, q = 1.2) {
  const h = hazir();
  if (!h) return;
  const [c, cikis] = h;
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
  g.gain.exponentialRampToValueAtTime(ses, t + sure * 0.35);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  s.connect(f).connect(g).connect(cikis);
  s.start(t);
  s.stop(t + sure + 0.05);
}

const NOTA = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

export const efekt = {
  dokunma() {
    ton(520, 0, 0.09, 'sine', 0.22, 300);
  },
  secim() {
    ton(660, 0, 0.08, 'triangle', 0.16, 880);
  },
  dogru() {
    [72, 76, 79, 84].forEach((n, i) => can(NOTA(n), i * 0.075, 0.2, 0.55));
  },
  yanlis() {
    // "boing": aşağı-yukarı kayan yay sesi
    const h = hazir();
    if (!h) return;
    const [c, cikis] = h;
    const t = c.currentTime;
    const o = c.createOscillator();
    const lfo = c.createOscillator();
    const lfoG = c.createGain();
    const g = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(330, t + 0.09);
    o.frequency.exponentialRampToValueAtTime(120, t + 0.5);
    lfo.frequency.value = 17;
    lfoG.gain.setValueAtTime(40, t);
    lfoG.gain.exponentialRampToValueAtTime(2, t + 0.5);
    lfo.connect(lfoG).connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.32, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    o.connect(g).connect(cikis);
    o.start(t);
    lfo.start(t);
    o.stop(t + 0.6);
    lfo.stop(t + 0.6);
  },
  ucus() {
    hisirti(0, 0.55, 500, 3200, 0.2, 0.9);
    ton(500, 0.05, 0.45, 'sine', 0.08, 1400);
  },
  yapis() {
    ton(220, 0, 0.12, 'sine', 0.3, 90);
    hisirti(0, 0.08, 2500, 1200, 0.12, 2);
    can(NOTA(88), 0.06, 0.08, 0.3);
  },
  konfeti(sade = false) {
    hisirti(0, 0.16, 1800, 600, sade ? 0.12 : 0.22, 0.7);
    const penta = [79, 81, 84, 86, 88, 91, 93, 96];
    const adet = sade ? 4 : 9;
    for (let i = 0; i < adet; i++) can(NOTA(penta[Math.floor(Math.random() * penta.length)]), 0.04 + Math.random() * (sade ? 0.25 : 0.55), sade ? 0.05 : 0.07, 0.22);
  },
  yildiz(sira: number) {
    const n = [76, 79, 84][sira] ?? 84;
    can(NOTA(n), 0, 0.25, 0.7);
    can(NOTA(n + 12), 0.06, 0.1, 0.5);
  },
  cevir() {
    hisirti(0, 0.12, 900, 2600, 0.18, 1.5);
    ton(300, 0.02, 0.07, 'triangle', 0.1, 500);
  },
  eslesti() {
    [79, 84].forEach((n, i) => can(NOTA(n), i * 0.09, 0.2, 0.45));
  },
  kilitAcildi() {
    [67, 72, 76, 79, 84, 88].forEach((n, i) => can(NOTA(n), i * 0.09, 0.2, 0.6));
    hisirti(0.5, 0.5, 3000, 8000, 0.08, 0.5);
  },
  kilitli() {
    ton(300, 0, 0.1, 'square', 0.06, 250);
    ton(250, 0.1, 0.12, 'square', 0.06, 200);
  },
  sayfa() {
    hisirti(0, 0.25, 1200, 400, 0.15, 0.8);
  },
};
