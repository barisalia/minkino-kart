/**
 * Pati Dükkânı'nın küçük sesleri (Web Audio sentezi, dosya yok; ortak efekt düzeyine bağlı). Hayvanlar konuşmaz:
 * Fındık "hav", Tarçın "miyav" ve mırıltı, Pırıl baloncuk "blup". Ayrıca mama "şıkır"ı, battaniye "fış"ı, lamba "çıt"ı,
 * polaroid "çık"ı ve ksilofon.
 */
import { baglam, efektCikisi } from '../../src/audio/motor';

function hazir(): [AudioContext, GainNode] | null {
  const c = baglam();
  const o = efektCikisi();
  if (!c || !o || c.state !== 'running') return null;
  return [c, o];
}

function ton(frek: number, bas: number, sure: number, tip: OscillatorType = 'sine', ses = 0.25, bitis?: number) {
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
  g.gain.exponentialRampToValueAtTime(ses, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  o.connect(g).connect(cikis);
  o.start(t);
  o.stop(t + sure + 0.05);
}

/** Frekansı bir eğri boyunca giden ton (miyav, hav gibi) */
function egri(noktalar: [number, number][], bas: number, tip: OscillatorType, ses: number) {
  const h = hazir();
  if (!h) return;
  const [c, cikis] = h;
  const t = c.currentTime + bas;
  const son = noktalar[noktalar.length - 1][0];
  const o = c.createOscillator();
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 2400;
  const g = c.createGain();
  o.type = tip;
  o.frequency.setValueAtTime(noktalar[0][1], t);
  for (const [z, fr] of noktalar.slice(1)) o.frequency.exponentialRampToValueAtTime(fr, t + z);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(ses, t + 0.03);
  g.gain.setValueAtTime(ses, t + son * 0.7);
  g.gain.exponentialRampToValueAtTime(0.0001, t + son);
  o.connect(f).connect(g).connect(cikis);
  o.start(t);
  o.stop(t + son + 0.05);
}

let gurultuT: AudioBuffer | null = null;
function gurultu(bas: number, sure: number, f1: number, f2: number, ses = 0.2, q = 1) {
  const h = hazir();
  if (!h) return;
  const [c, cikis] = h;
  if (!gurultuT) {
    gurultuT = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = gurultuT.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = c.currentTime + bas;
  const s = c.createBufferSource();
  s.buffer = gurultuT;
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.Q.value = q;
  f.frequency.setValueAtTime(f1, t);
  f.frequency.exponentialRampToValueAtTime(f2, t + sure);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(ses, t + sure * 0.25);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  s.connect(f).connect(g).connect(cikis);
  s.start(t);
  s.stop(t + sure + 0.05);
}

const NOTA = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

export const ses = {
  /** yavru köpek: tiz, kısa "hav" (iki kez: sevinç) */
  hav(kez = 1) {
    for (let i = 0; i < kez; i++) {
      egri([[0, 620], [0.05, 900], [0.16, 520]], i * 0.22, 'sawtooth', 0.07);
      gurultu(i * 0.22, 0.1, 1800, 900, 0.05, 1.5);
    }
  },
  /** yavru kedi: ince "miyav" */
  miyav() {
    egri([[0, 700], [0.12, 1150], [0.32, 1000], [0.5, 640]], 0, 'triangle', 0.09);
    egri([[0, 1400], [0.12, 2300], [0.32, 2000], [0.5, 1280]], 0, 'sine', 0.025);
  },
  /** kedi mırıltısı: alçak titreşim */
  mir() {
    for (let i = 0; i < 6; i++) ton(55 + (i % 2) * 6, i * 0.12, 0.11, 'sawtooth', 0.035, 50);
  },
  /** balık: baloncuk "blup" */
  blup(sira = 0) {
    ton(300 + sira * 70, 0, 0.12, 'sine', 0.13, 900 + sira * 120);
  },
  /** köpek yer: hapır hupur */
  hapir() {
    for (let i = 0; i < 4; i++) gurultu(i * 0.13, 0.08, 1400 + (i % 2) * 500, 800, 0.08, 2);
  },
  /** mama taneleri kaba yağar: şıkır şıkır */
  sikir() {
    for (let i = 0; i < 7; i++) ton(NOTA(84 + ((i * 5) % 12)), i * 0.035, 0.06, 'square', 0.02);
    gurultu(0, 0.28, 5200, 3000, 0.06, 3);
  },
  /** yem kutusu sallanır: tıkır */
  tikir(sira = 0) {
    for (let i = 0; i < 3; i++) ton(NOTA(88 + ((sira * 3 + i * 4) % 10)), i * 0.03, 0.07, 'sine', 0.05);
  },
  /** top sıçrar: boing */
  boing() {
    ton(220, 0, 0.3, 'sine', 0.16, 520);
    ton(440, 0, 0.2, 'triangle', 0.04, 880);
  },
  /** battaniye / minder iner: fış */
  fis() {
    gurultu(0, 0.35, 900, 300, 0.12, 0.6);
  },
  /** zıplama: hop */
  hop() {
    ton(330, 0, 0.14, 'sine', 0.12, 660);
  },
  /** iniş: tok "pıt" */
  pit() {
    ton(180, 0, 0.08, 'triangle', 0.12, 110);
  },
  /** lamba ipi: çıt */
  cit() {
    ton(1800, 0, 0.03, 'square', 0.05, 1200);
    gurultu(0, 0.04, 4000, 2500, 0.1, 2);
  },
  /** polaroid: çık ve flaş vızzı */
  cik() {
    gurultu(0, 0.05, 3000, 2000, 0.2, 1);
    ton(2200, 0.02, 0.25, 'sine', 0.04, 4000);
  },
  /** iş bitti: ksilofon */
  ksilofon() {
    [72, 76, 79, 84].forEach((n, i) => ton(NOTA(n), i * 0.08, 0.3, 'triangle', 0.12));
  },
  /** "hı?": yanlış eşyaya merakla bakar (yumuşak, iki nota yukarı) */
  hi() {
    ton(NOTA(67), 0, 0.12, 'sine', 0.08);
    ton(NOTA(71), 0.12, 0.16, 'sine', 0.08);
  },
  /** gerinme: yükselen yumuşak ses */
  gerin() {
    ton(260, 0, 0.5, 'sine', 0.08, 420);
  },
  /** ninni: üç yumuşak nota (akşam) */
  ninni() {
    [76, 72, 67].forEach((n, i) => ton(NOTA(n), i * 0.35, 0.5, 'sine', 0.07));
  },
};
