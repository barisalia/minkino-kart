/**
 * Pasta otobüsünün küçük sesleri (Web Audio sentezi, dosya yok): fırın "ding"i, kalıbın "pof"u, hamurun "plop"u,
 * jetonun "şıngır"ı, yanığın cızırtısı, kayan süsün düdüğü, otobüsün kornası. Ortak ses düzeyine (efekt) bağlı.
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
  g.gain.exponentialRampToValueAtTime(ses, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  o.connect(g).connect(cikis);
  o.start(t);
  o.stop(t + sure + 0.05);
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
  /** fırın: tam kıvamında "ding!" */
  ding() {
    ton(NOTA(88), 0, 0.9, 'sine', 0.22);
    ton(NOTA(100), 0, 0.5, 'sine', 0.08);
    ton(NOTA(95), 0.12, 0.7, 'sine', 0.12);
  },
  /** kalıp ve krema: yumuşak "pof" */
  pof() {
    gurultu(0, 0.22, 900, 300, 0.25, 0.8);
    ton(320, 0, 0.12, 'sine', 0.12, 160);
  },
  /** hamur topu tepsiye düşer */
  plop(sira = 0) {
    ton(260 + sira * 30, 0, 0.14, 'sine', 0.28, 120);
    gurultu(0, 0.06, 1800, 900, 0.06, 2);
  },
  /** süs konur: minik tıkırtı + nota */
  tik(sira = 0) {
    ton(NOTA(79 + [0, 2, 4, 7, 9][sira % 5]), 0, 0.18, 'triangle', 0.14);
  },
  /** krema sıkılır: kısa "fışş" */
  fis() {
    gurultu(0, 0.28, 2400, 900, 0.14, 0.6);
  },
  /** jeton şıngırtısı */
  singir(sira = 0) {
    const n = 88 + (sira % 4) * 2;
    ton(NOTA(n), 0, 0.25, 'sine', 0.14);
    ton(NOTA(n + 7), 0.04, 0.22, 'sine', 0.08);
    gurultu(0, 0.05, 6000, 4000, 0.05, 3);
  },
  /** yanık: cızırtı */
  cizir() {
    gurultu(0, 0.7, 3000, 1500, 0.12, 0.5);
  },
  /** kayan süs: aşağı inen düdük */
  kay() {
    ton(900, 0, 0.45, 'sine', 0.12, 260);
  },
  /** ham ham (Kino yer) */
  ham() {
    ton(180, 0, 0.09, 'square', 0.05, 140);
    ton(170, 0.14, 0.09, 'square', 0.05, 130);
  },
  /** otobüs kornası: iki tatlı düt */
  korna() {
    ton(NOTA(67), 0, 0.18, 'triangle', 0.16);
    ton(NOTA(71), 0, 0.18, 'triangle', 0.1);
    ton(NOTA(67), 0.24, 0.26, 'triangle', 0.16);
    ton(NOTA(71), 0.24, 0.26, 'triangle', 0.1);
  },
  /** kapak açılır: yukarı kayan "vuup" */
  vuup() {
    ton(300, 0, 0.35, 'sine', 0.16, 900);
    gurultu(0, 0.3, 600, 2400, 0.08, 0.7);
  },
  /** serpinti: şeker taneleri kavanozda tıkırdar */
  serp() {
    gurultu(0, 0.12, 7000, 5000, 0.07, 4);
    gurultu(0.06, 0.1, 6000, 4500, 0.05, 4);
  },
  /** içecek akar: yumuşak şırıltı (sure sn) */
  akis(sure = 0.3) {
    gurultu(0, sure, 900, 1300, 0.08, 1.2);
  },
  /** köpük: yıkama (bulaşık) */
  kopuk() {
    ton(700, 0, 0.12, 'sine', 0.08, 1100);
    ton(900, 0.1, 0.12, 'sine', 0.07, 1300);
  },
  /** henüz değil: hafif "tık tık" */
  degil() {
    ton(520, 0, 0.06, 'sine', 0.1, 480);
    ton(520, 0.1, 0.06, 'sine', 0.1, 480);
  },
};
