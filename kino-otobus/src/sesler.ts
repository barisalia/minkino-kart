/**
 * Kino'nun Otobüsü'nün küçük sesleri (Web Audio sentezi, dosya yok; ortak efekt düzeyine bağlı):
 * kabın "tık"ı, kepçenin soğuk "şıkk"ı, topun "pof"u (kule yükseldikçe nota da yükselir: do-re-mi), kulenin "vuuu"su,
 * sosun "şlurp"u, serpintinin çıngırağı, süsün "pıt"ı, Kino'nun "ham"ı, verişin ksilofonu, jetonun "şıngır"ı,
 * otobüsün kornası ve süs dükkânındaki "Dondurmaaa!" kornası.
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
/** do re mi fa sol la si do: kule yükseldikçe */
const GAM = [72, 74, 76, 77, 79, 81, 83, 84];

export const ses = {
  /** kap yuvaya oturur: tok "tık" */
  tik() {
    ton(520, 0, 0.07, 'triangle', 0.22, 300);
    gurultu(0, 0.04, 2500, 1500, 0.08, 2);
  },
  /** kepçe soğuk kaba dalar: "şıkk" */
  sikk() {
    gurultu(0, 0.12, 5200, 2600, 0.12, 1.5);
    ton(1400, 0.02, 0.08, 'sine', 0.05, 900);
  },
  /** top iner: yumuşak "pof" + kulenin katına göre bir nota (do-re-mi) */
  pof(kat = 0) {
    gurultu(0, 0.16, 700, 260, 0.2, 0.8);
    ton(240, 0, 0.1, 'sine', 0.14, 140);
    ton(NOTA(GAM[Math.min(kat, GAM.length - 1)]), 0.03, 0.32, 'sine', 0.14);
  },
  /** üçüncü top: kule sallanır "vuuu" */
  vuuu() {
    ton(330, 0, 0.6, 'sine', 0.14, 520);
    ton(334, 0.05, 0.55, 'triangle', 0.05, 500);
  },
  /** sos süzülür: "şlurp" */
  slurp() {
    ton(600, 0, 0.22, 'sine', 0.12, 220);
    gurultu(0.05, 0.25, 1200, 500, 0.08, 1.2);
  },
  /** serpinti yağar: çıngırak */
  cingirak() {
    for (let i = 0; i < 6; i++) ton(NOTA(88 + ((i * 5) % 9)), i * 0.045, 0.12, 'sine', 0.06);
    gurultu(0, 0.2, 7000, 5000, 0.05, 4);
  },
  /** süs oturur: "pıt" */
  pit(sira = 0) {
    ton(NOTA(79 + [0, 2, 4, 7, 9][sira % 5]), 0, 0.14, 'triangle', 0.14);
    ton(900, 0, 0.04, 'square', 0.03, 600);
  },
  /** Kino yer: ham ham */
  ham() {
    ton(180, 0, 0.09, 'square', 0.05, 140);
    ton(170, 0.14, 0.09, 'square', 0.05, 130);
  },
  /** dondurma verilir: ksilofon */
  ksilofon() {
    [72, 76, 79, 84].forEach((n, i) => ton(NOTA(n), i * 0.08, 0.28, 'triangle', 0.13));
  },
  /** jeton şıngırtısı */
  singir(sira = 0) {
    const n = 88 + (sira % 4) * 2;
    ton(NOTA(n), 0, 0.25, 'sine', 0.14);
    ton(NOTA(n + 7), 0.04, 0.22, 'sine', 0.08);
    gurultu(0, 0.05, 6000, 4000, 0.05, 3);
  },
  /** otobüs kornası: iki tatlı düt */
  korna() {
    ton(NOTA(69), 0, 0.18, 'triangle', 0.16);
    ton(NOTA(73), 0, 0.18, 'triangle', 0.1);
    ton(NOTA(69), 0.24, 0.26, 'triangle', 0.16);
    ton(NOTA(73), 0.24, 0.26, 'triangle', 0.1);
  },
  /** süs dükkânının kornası: "Don-dur-maaa!" melodisi */
  dondurmaKorna() {
    [
      [72, 0, 0.18],
      [76, 0.2, 0.18],
      [79, 0.4, 0.6],
    ].forEach(([n, b, s]) => {
      ton(NOTA(n), b, s, 'triangle', 0.15);
      ton(NOTA(n + 12), b, s * 0.8, 'sine', 0.04);
    });
  },
  /** kapak açılır / kapanır */
  vuup(asagi = false) {
    ton(asagi ? 900 : 300, 0, 0.35, 'sine', 0.14, asagi ? 300 : 900);
    gurultu(0, 0.3, 600, 2400, 0.07, 0.7);
  },
  /** henüz değil: hafif "tık tık" */
  degil() {
    ton(520, 0, 0.06, 'sine', 0.1, 480);
    ton(520, 0.1, 0.06, 'sine', 0.1, 480);
  },
  /** hapşırık (Kino üşüdü) */
  hapsu() {
    gurultu(0, 0.08, 3000, 3000, 0.04, 1);
    gurultu(0.18, 0.25, 4000, 1500, 0.16, 0.6);
  },
  /** mum söner: kısa üfleme */
  ufle() {
    gurultu(0, 0.5, 1500, 600, 0.12, 0.5);
  },
  // ---------------------------------------------------------------- dokunsal hazırlık ve yan işler
  /** kepçe soğuk dondurmayı kazır: kısa, yumuşak "kırt" (sürüklerken seyrek) */
  kazi() {
    gurultu(0, 0.09, 2600 + Math.random() * 800, 1400, 0.07, 1.8);
  },
  /** top kepçede tamamlandı: tatlı "pop" */
  pop() {
    ton(380, 0, 0.12, 'sine', 0.16, 820);
    ton(NOTA(84), 0.05, 0.18, 'triangle', 0.07);
  },
  /** sos akarken: kısa, kalın damla sesi (kat kat yükselir) */
  damla(sira = 0) {
    ton(260 + sira * 40, 0, 0.12, 'sine', 0.1, 140);
  },
  /** serpinti kavanozu sallanır: minik tıkırtı (sallamaya göre nota) */
  tikir(sira = 0) {
    for (let i = 0; i < 3; i++) ton(NOTA(86 + ((sira * 3 + i * 4) % 10)), i * 0.03, 0.08, 'sine', 0.05);
    gurultu(0, 0.1, 6500, 4500, 0.05, 3);
  },
  /** sünger: ıslak gıcırtı (sürüklerken seyrek) */
  gicir() {
    ton(1100 + Math.random() * 300, 0, 0.09, 'sine', 0.05, 1500);
    gurultu(0, 0.08, 1800, 900, 0.04, 2);
  },
  /** pırıl pırıl: yükselen ince çan dizisi */
  piril() {
    [84, 88, 91, 96].forEach((n, i) => ton(NOTA(n), i * 0.07, 0.3, 'sine', 0.09));
  },
  /** sinek vızıldar ve uçar gider */
  vizz() {
    ton(190, 0, 0.5, 'sawtooth', 0.025, 260);
    ton(196, 0, 0.5, 'square', 0.015, 300);
  },
  /** külah makinesinin kapağı kapanır: tok "tak" ve cızırtı */
  tak() {
    ton(150, 0, 0.12, 'triangle', 0.22, 90);
    gurultu(0.04, 0.7, 5000, 3000, 0.07, 0.7);
  },
  /** gofret yuvarlanır: "fırrr" */
  firr() {
    gurultu(0, 0.35, 800, 2600, 0.09, 1);
    ton(300, 0, 0.3, 'sine', 0.06, 600);
  },
  /** Kino ile müşteri çak yapar */
  cak() {
    gurultu(0, 0.07, 2400, 1800, 0.25, 0.9);
    ton(NOTA(79), 0.02, 0.2, 'triangle', 0.1);
    ton(NOTA(84), 0.06, 0.24, 'triangle', 0.08);
  },
};
