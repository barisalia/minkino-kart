/**
 * Okula Hazırım! küçük sesleri (Web Audio sentezi, dosya yok; ortak efekt ses düzeyine bağlı): elmanın "pıt"ı,
 * sepete düşüş, çıkartmanın "tık"ı, tren düdüğü, kuş cıvıltısı, kanat, alkış, davul, Kino'nun "ham"ı.
 * Mikrofon açıkken (Kaç alkış?) ses çalan kod kulak.sustur(ms) çağırır (ekip/SES-SISTEMI.md).
 */
import { baglam, efektCikisi } from '../../src/audio/motor';

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

const NOTA = (n: number) => 440 * Math.pow(2, (n - 69) / 12);
const PENTA = [72, 74, 76, 79, 81, 84, 86, 88, 91, 93, 96];

export const ses = {
  /** elmaya, kuşa dokunuş: sayı arttıkça yükselen tatlı nota */
  pit(sira = 0) {
    ton(NOTA(PENTA[Math.min(PENTA.length - 1, sira)]), 0, 0.22, 'triangle', 0.16);
    ton(NOTA(PENTA[Math.min(PENTA.length - 1, sira)] + 12), 0.02, 0.12, 'sine', 0.05);
  },
  /** sepete / tabağa düşüş */
  dus() {
    ton(240, 0, 0.14, 'sine', 0.24, 110);
    gurultu(0, 0.07, 1600, 700, 0.06, 2);
  },
  /** kart yapıştı, çıkartma yapıştı: "tık" */
  tik() {
    ton(1400, 0, 0.05, 'square', 0.05, 900);
    ton(NOTA(88), 0.03, 0.18, 'sine', 0.12);
  },
  /** nazik "hı-hı" (yanlış değil, tekrar bakalım) */
  hmm() {
    ton(392, 0, 0.12, 'sine', 0.1, 370);
    ton(392, 0.16, 0.14, 'sine', 0.1, 330);
  },
  /** tren düdüğü: çuf çuf + düüt */
  duduk() {
    ton(NOTA(76), 0, 0.5, 'triangle', 0.1);
    ton(NOTA(80), 0, 0.5, 'triangle', 0.08);
    ton(NOTA(83), 0, 0.5, 'sine', 0.06);
    for (let i = 0; i < 3; i++) gurultu(0.55 + i * 0.2, 0.12, 900, 400, 0.08, 0.8);
  },
  /** kuş cıvıltısı */
  cik(sira = 0) {
    const f = 2200 + (sira % 4) * 180;
    ton(f, 0, 0.08, 'sine', 0.08, f * 1.4);
    ton(f * 1.1, 0.1, 0.07, 'sine', 0.07, f * 1.5);
  },
  /** kanat çırpışı */
  kanat() {
    gurultu(0, 0.16, 900, 1800, 0.08, 0.7);
  },
  /** alkış (Kino'nun alkışları) */
  alkis(bas = 0) {
    gurultu(bas, 0.07, 2600, 1800, 0.22, 0.9);
    gurultu(bas + 0.01, 0.05, 1200, 900, 0.12, 1.2);
  },
  /** davula vuruş */
  davul() {
    ton(150, 0, 0.22, 'sine', 0.32, 60);
    gurultu(0, 0.05, 900, 300, 0.1, 0.6, 'lowpass');
  },
  /** ham ham (Kino yer) */
  ham() {
    ton(180, 0, 0.09, 'square', 0.05, 140);
    ton(170, 0.14, 0.09, 'square', 0.05, 130);
  },
  /** yumuşak düşüş (yapraklara) */
  pof() {
    gurultu(0, 0.3, 900, 250, 0.2, 0.7);
    ton(220, 0, 0.18, 'sine', 0.1, 110);
  },
  /** sihirli parıltı (rakam canlanır, rozet) */
  sihir() {
    [79, 84, 88, 91, 96].forEach((n, i) => ton(NOTA(n), i * 0.07, 0.3, 'sine', 0.1));
    gurultu(0.1, 0.5, 4000, 9000, 0.05, 0.5);
  },
  /** çizgi boyanırken çok hafif kalem sesi */
  kalem() {
    gurultu(0, 0.05, 3000, 2600, 0.025, 1.5);
  },
};
