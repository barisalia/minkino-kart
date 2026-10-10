/**
 * Tart Bakalım sesleri: Web Audio sentezi (dosya yok, kredi yok). Meyve leğene düşünce her meyvenin kendi
 * çarpma sesi (domates yumuşak "plop", elma tok "tok", portakal "pof", patates boğuk "güm"), leğen sarsılınca
 * pirinç tıngırtısı, kompost "hamm", para şıngırtısı.
 */
import { baglam, efektCikisi } from '../../src/audio/motor';
import type { TartMeyve } from './tart';

function hazir(): [AudioContext, GainNode] | null {
  const c = baglam();
  const o = efektCikisi();
  if (!c || !o || c.state !== 'running') return null;
  return [c, o];
}

let gurultu: AudioBuffer | null = null;
function gurultuTamponu(c: AudioContext): AudioBuffer {
  if (gurultu) return gurultu;
  gurultu = c.createBuffer(1, Math.floor(c.sampleRate * 0.5), c.sampleRate);
  const d = gurultu.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return gurultu;
}

function blip(c: AudioContext, cikis: AudioNode, t: number, tur: OscillatorType, f1: number, f2: number, sure: number, ses: number) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = tur;
  o.frequency.setValueAtTime(f1, t);
  o.frequency.exponentialRampToValueAtTime(f2, t + sure);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, ses), t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  o.connect(g).connect(cikis);
  o.start(t);
  o.stop(t + sure + 0.03);
}

function hisir(c: AudioContext, cikis: AudioNode, t: number, frek: number, sure: number, ses: number) {
  const n = c.createBufferSource();
  n.buffer = gurultuTamponu(c);
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = frek;
  f.Q.value = 1.2;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, ses), t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  n.connect(f).connect(g).connect(cikis);
  n.start(t);
  n.stop(t + sure + 0.02);
}

/** Meyve leğene / başka meyveye çarptı (guc 0..1). Meyveye çarpınca daha yumuşak. */
export function carpmaSesi(m: TartMeyve, guc: number, meyveye: boolean) {
  const h = hazir();
  if (!h) return;
  const [c, cikis] = h;
  const t = c.currentTime;
  const s = (0.08 + 0.32 * guc) * (meyveye ? 0.6 : 1);
  const kay = 1 + (Math.random() - 0.5) * 0.12;
  switch (m) {
    case 'domates':
      blip(c, cikis, t, 'sine', 420 * kay, 130, 0.13, s);
      hisir(c, cikis, t, 900, 0.05, s * 0.25);
      break;
    case 'elma':
      blip(c, cikis, t, 'triangle', 700 * kay, 260, 0.08, s * 0.9);
      blip(c, cikis, t, 'sine', 300 * kay, 150, 0.1, s * 0.6);
      break;
    case 'portakal':
      blip(c, cikis, t, 'sine', 360 * kay, 150, 0.14, s);
      hisir(c, cikis, t, 1400, 0.06, s * 0.3);
      break;
    case 'patates':
      blip(c, cikis, t, 'sine', 210 * kay, 75, 0.15, s * 1.1);
      hisir(c, cikis, t, 500, 0.07, s * 0.35);
      break;
  }
  // pirinç leğen çınlaması (leğene doğrudan düşünce)
  if (!meyveye && guc > 0.35) blip(c, cikis, t + 0.005, 'sine', 1850 * kay, 1800, 0.35, s * 0.12);
}

/** Leğen hafifçe sarsıldı: pirinç tıngırtısı */
export function sarsSesi() {
  const h = hazir();
  if (!h) return;
  const [c, cikis] = h;
  const t = c.currentTime;
  blip(c, cikis, t, 'sine', 1560, 1500, 0.4, 0.07);
  blip(c, cikis, t + 0.05, 'sine', 2090, 2050, 0.3, 0.04);
}

/** Kompost çürüğü yuttu: kapak "tak", gövde "hamm" (aşağı inen iki nota) */
export function kompostSesi() {
  const h = hazir();
  if (!h) return;
  const [c, cikis] = h;
  const t = c.currentTime;
  blip(c, cikis, t, 'triangle', 520, 300, 0.08, 0.2);
  blip(c, cikis, t + 0.16, 'sine', 330, 220, 0.18, 0.26);
  blip(c, cikis, t + 0.34, 'sine', 440, 660, 0.16, 0.18);
}

/** Bozuk para sepete düştü: şıngır */
export function paraSesi(gecikme = 0) {
  const h = hazir();
  if (!h) return;
  const [c, cikis] = h;
  const t = c.currentTime + gecikme;
  blip(c, cikis, t, 'sine', 2350, 2300, 0.18, 0.09);
  blip(c, cikis, t + 0.04, 'sine', 3100, 3050, 0.14, 0.06);
  hisir(c, cikis, t, 5000, 0.05, 0.05);
}
