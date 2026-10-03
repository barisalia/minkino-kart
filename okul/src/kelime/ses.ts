/**
 * Kelime Köprüsü'nün küçük sesleri (Web Audio sentezi, dosya yok; ortak efekt ses düzeyine bağlı): su sıçraması,
 * zıplama "boing", araba "vın", boya "şlap", kurbağa gibi hoplama, fırça. okul/src/sesler.ts ile aynı yöntem.
 */
import { baglam, efektCikisi } from '../../../src/audio/motor';

function hazir(): [AudioContext, GainNode] | null {
  const c = baglam();
  const o = efektCikisi();
  if (!c || !o || c.state !== 'running') return null;
  return [c, o];
}

function ton(frek: number, bas: number, sure: number, tip: OscillatorType = 'sine', ses = 0.2, bitis?: number) {
  const h = hazir();
  if (!h) return;
  const [c, cikis] = h;
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

let tampon: AudioBuffer | null = null;
function gurultu(bas: number, sure: number, f1: number, f2: number, ses = 0.2, q = 1, tip: BiquadFilterType = 'bandpass') {
  const h = hazir();
  if (!h) return;
  const [c, cikis] = h;
  if (!tampon) {
    tampon = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = tampon.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = c.currentTime + bas;
  const s = c.createBufferSource();
  s.buffer = tampon;
  const f = c.createBiquadFilter();
  f.type = tip;
  f.Q.value = q;
  f.frequency.setValueAtTime(f1, t);
  f.frequency.exponentialRampToValueAtTime(f2, t + sure);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(ses, t + Math.min(0.01, sure * 0.2));
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  s.connect(f).connect(g).connect(cikis);
  s.start(t);
  s.stop(t + sure + 0.05);
}

export const kses = {
  /** suya düşen taş: şlup + sıçrama */
  sicrama() {
    ton(520, 0, 0.12, 'sine', 0.16, 160);
    gurultu(0.03, 0.35, 2600, 700, 0.14, 0.8);
    gurultu(0.12, 0.25, 4000, 1800, 0.05, 1.2);
  },
  /** zıplama (Kino taşı dener) */
  boing() {
    ton(220, 0, 0.22, 'triangle', 0.14, 520);
    ton(330, 0.05, 0.16, 'sine', 0.06, 700);
  },
  /** taşıt garaja girer: vın */
  vin() {
    ton(140, 0, 0.55, 'sawtooth', 0.045, 260);
    ton(70, 0, 0.55, 'square', 0.03, 120);
    gurultu(0, 0.5, 600, 1400, 0.04, 0.6);
  },
  /** hayvan ağıla hoplar */
  hop(sira = 0) {
    const f = 380 + (sira % 3) * 60;
    ton(f, 0, 0.12, 'sine', 0.12, f * 1.8);
    ton(f * 1.2, 0.14, 0.1, 'sine', 0.08, f * 2);
  },
  /** boya şlap */
  slap() {
    gurultu(0, 0.18, 1800, 500, 0.22, 0.7, 'lowpass');
    ton(180, 0, 0.12, 'sine', 0.12, 90);
  },
  /** davul hecesi: tok ve parlak (sayı arttıkça bir ton yukarı) */
  davul(sira = 0) {
    ton(150 + sira * 18, 0, 0.24, 'sine', 0.32, 60);
    gurultu(0, 0.06, 1000, 300, 0.12, 0.6, 'lowpass');
  },
  /** Kino'nun tersliği: ters dönen kayış sesi */
  ters() {
    ton(700, 0, 0.18, 'triangle', 0.08, 300);
    ton(300, 0.18, 0.18, 'triangle', 0.08, 700);
  },
};
