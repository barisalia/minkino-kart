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
  /** tavşan: hop hop */
  hop() {
    [0, 0.35, 0.7].forEach((b) => ton(420, b, 0.16, 'sine', 0.18, 900));
  },
  /** ördek: vak vak */
  vak() {
    [0, 0.28].forEach((b) => {
      ton(520, b, 0.14, 'sawtooth', 0.08, 360);
      hisirti(b, 0.12, 900, 700, 0.1, 4);
    });
  },
  /** kıtır kıtır ısırık */
  kitir() {
    for (let i = 0; i < 4; i++) hisirti(i * 0.09, 0.07, 3000, 1800, 0.22, 2.5);
  },
  /** sıcak kapanış: yükselen arpej */
  final() {
    [60, 64, 67, 72, 76, 79, 84].forEach((n, i) => ton(440 * Math.pow(2, (n - 69) / 12), i * 0.11, 0.9, 'sine', 0.09));
    ton(440 * Math.pow(2, (48 - 69) / 12), 0, 1.8, 'triangle', 0.1);
  },
  /** parıltı: çan */
  parilti() {
    [84, 88, 91].forEach((n, i) => ton(440 * Math.pow(2, (n - 69) / 12), i * 0.07, 0.4, 'sine', 0.1));
  },

  // ---------------------------------------------------------------- Kino ve Elma Kulesi
  /** elma yerine oturur: tahta üstünde küçük "tık" */
  tik() {
    ton(1650, 0, 0.06, 'sine', 0.22, 1100);
    hisirti(0, 0.04, 3200, 2600, 0.12, 3);
  },
  /** kule dökülürken tatlı "tık-tık-tok" (ksilofon gibi, inen) */
  tiktok() {
    ksilofon(84, 0, 0.16);
    ksilofon(79, 0.13, 0.16);
    ksilofon(72, 0.3, 0.2);
    ton(180, 0.3, 0.2, 'sine', 0.2, 90);
  },
  /** elmalar yuvarlanırken inen notalar (pıtır pıtır) */
  inen() {
    [91, 88, 86, 84, 81, 79, 76, 74, 72].forEach((n, i) => ksilofon(n, i * 0.085, 0.1));
  },
  /** tek elma yere seker: yumuşak "pıt" (her seferinde biraz farklı perde) */
  pit() {
    ton(900 + Math.random() * 500, 0, 0.09, 'sine', 0.2, 420);
  },
  /** elma kafaya konar: komik "pıt" */
  kafa() {
    ton(1300, 0, 0.12, 'sine', 0.28, 520);
    ton(2600, 0.02, 0.06, 'triangle', 0.06, 1600);
  },
  /** top: boing */
  boing() {
    const hz = hazir();
    if (!hz) return;
    const [c, cikis] = hz;
    const t = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(160, t);
    o.frequency.exponentialRampToValueAtTime(420, t + 0.08);
    o.frequency.exponentialRampToValueAtTime(230, t + 0.32);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.26, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.36);
    o.connect(g).connect(cikis);
    o.start(t);
    o.stop(t + 0.4);
  },
  /** kayma: vıııık (pati sürtünmesi, inen) */
  vin() {
    hisirti(0, 0.75, 2600, 700, 0.2, 6);
    ton(1250, 0, 0.7, 'sawtooth', 0.035, 520);
  },
  /** çarpma: gümm */
  gum() {
    ton(110, 0, 0.45, 'sine', 0.6, 42);
    hisirti(0, 0.18, 500, 150, 0.3, 0.8);
    ton(240, 0.02, 0.12, 'triangle', 0.12, 120);
  },
  /** hüzün: tek, yumuşak çello notası (korkutucu değil) */
  huzun() {
    const hz = hazir();
    if (!hz) return;
    const [c, cikis] = hz;
    const t = c.currentTime;
    for (const [f, ses] of [[196, 0.1], [392, 0.025]] as const) {
      const o = c.createOscillator();
      const lfo = c.createOscillator();
      const lg = c.createGain();
      const g = c.createGain();
      const fl = c.createBiquadFilter();
      o.type = 'sawtooth';
      o.frequency.value = f;
      lfo.frequency.value = 5;
      lg.gain.value = f * 0.006;
      lfo.connect(lg).connect(o.frequency);
      fl.type = 'lowpass';
      fl.frequency.value = 900;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(ses, t + 0.35);
      g.gain.linearRampToValueAtTime(ses * 0.7, t + 1.2);
      g.gain.linearRampToValueAtTime(0.0001, t + 2.2);
      o.connect(fl).connect(g).connect(cikis);
      o.start(t);
      lfo.start(t);
      o.stop(t + 2.3);
      lfo.stop(t + 2.3);
    }
    ksilofon(67, 0.9, 0.05);
  },
  /** çak: iki pati buluşur */
  cak() {
    hisirti(0, 0.08, 2400, 1600, 0.4, 1.2);
    hisirti(0.012, 0.1, 1200, 900, 0.25, 1);
    ton(1900, 0, 0.05, 'triangle', 0.08, 1500);
  },
  /** kısa kıkırdama (iki karakter gülüyor): yükselen minik notalar */
  kikir() {
    [76, 79, 76, 81, 79, 84].forEach((n, i) => ton(440 * Math.pow(2, (n - 69) / 12), i * 0.09, 0.08, 'triangle', 0.07));
  },
  /** koşu: pıt pıt pıt (yumuşak pati sesleri) */
  kosu() {
    for (let i = 0; i < 6; i++) hisirti(i * 0.15, 0.06, 900, 600, 0.12, 2);
  },
  /** kule sallanır: tıkır tıkır (elmalar birbirine değer) */
  tikir() {
    for (let i = 0; i < 5; i++) ton(1400 + (i % 2) * 300, i * 0.09, 0.04, 'sine', 0.08, 1000);
  },
  /** sabah kuşları: iki kısa cıvıltı */
  kus() {
    [0, 0.16, 0.7, 0.82, 0.94].forEach((b, i) => ton(2600 + (i % 2) * 500, b, 0.09, 'sine', 0.05, 3600 + (i % 3) * 300));
  },
  /** hızlı dalış: fiuuu */
  fiu() {
    hisirti(0, 0.35, 900, 3200, 0.16, 2);
  },
  // ---------------------------------------------------------------- Kino ve Kaydırak
  /** kaydırakta kayış: pürüzsüz vıııı (alçalan, hafif cızırtılı) */
  kaydir() {
    hisirti(0, 0.9, 1800, 500, 0.13, 4);
    ton(700, 0, 0.85, 'sine', 0.05, 320);
    ton(1400, 0.05, 0.7, 'triangle', 0.02, 800);
  },
  /** merdiven basamağı: tahta tıp tıp (çıkarken) */
  merdiven() {
    for (let i = 0; i < 5; i++) {
      ton(520 + i * 60, i * 0.24, 0.07, 'triangle', 0.16, 300);
      hisirti(i * 0.24, 0.03, 2200, 1500, 0.06, 3);
    }
  },
  /** sabırsız ayak: tıp tıp (tahta zemin gibi yumuşak) */
  ayak() {
    [0, 0.2, 0.4].forEach((b) => ton(240, b, 0.06, 'sine', 0.14, 140));
  },
  /** üzgün Mino iç çeker gibi: yumuşak nefes */
  nefes() {
    hisirti(0, 0.9, 700, 400, 0.05, 0.6);
  },
  // ---------------------------------------------------------------- Kino ve Sihirli Söz
  /** tezgâhında uyuklayan ayı: tatlı, kısa horlama (hırr… fiuu) */
  horul() {
    ton(85, 0, 0.7, 'sawtooth', 0.035, 70);
    hisirti(0, 0.7, 260, 180, 0.07, 1.5);
    hisirti(0.8, 0.55, 1400, 2200, 0.04, 1.2);
  },
  /** surat asan ayı: "hıh!" (kısa, burundan) */
  hih() {
    hisirti(0, 0.22, 1100, 650, 0.16, 2.2);
    ton(230, 0, 0.18, 'triangle', 0.08, 150);
  },
  /** yüreği eriyen ayı: yumuşak yükselen "ooo" (iki ince ton) */
  eri() {
    ton(523, 0, 0.6, 'sine', 0.1, 784);
    ton(659, 0.15, 0.7, 'sine', 0.08, 988);
  },
};

/** ksilofon notası: temel + parlak üst harmonik (kısa söner) */
function ksilofon(midi: number, bas: number, ses: number) {
  const f = 440 * Math.pow(2, (midi - 69) / 12);
  ton(f, bas, 0.45, 'sine', ses);
  ton(f * 4, bas, 0.08, 'sine', ses * 0.25);
}

// elma dizilirken her elmada bir yükselen nota (nota0 … nota9: pentatonik)
[72, 74, 76, 79, 81, 84, 86, 88, 91, 93].forEach((n, i) => {
  FILM_EFEKT[`nota${i}`] = () => ksilofon(n, 0, 0.16);
});
