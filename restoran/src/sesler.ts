/**
 * Tıkır Tıkır Lokanta sesleri: Web Audio sentezi (dosya yok; ortak efekt düzeyine bağlı, src/audio/motor.ts).
 * Malzemeye özel kesim sesleri (salatalık "kırt", domates "şlap", soğan kabuğu "çıtır", havuç "kıtır"), pişme
 * döngüleri (cız, fokur, şırıl), mutfak ve salon sesleri (servis zili, kasa "çın", kapı zili, jeton, çiğneme).
 * Mini oyunlara sözleşmedeki `Sesler` olarak verilir (restoran/src/mini/arayuz.ts).
 */
import { baglam, efektCikisi } from '../../src/audio/motor';
import type { SesAdi, Sesler } from './mini/arayuz';

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
  g.gain.exponentialRampToValueAtTime(ses, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  o.connect(g).connect(cikis);
  o.start(t);
  o.stop(t + sure + 0.05);
}

let gurultuT: AudioBuffer | null = null;
function gurultuTamponu(c: AudioContext): AudioBuffer {
  if (!gurultuT) {
    gurultuT = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = gurultuT.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return gurultuT;
}
function gurultu(bas: number, sure: number, f1: number, f2: number, ses = 0.2, q = 1, tip: BiquadFilterType = 'bandpass') {
  const h = hazir();
  if (!h) return;
  const [c, cikis] = h;
  const t = c.currentTime + bas;
  const s = c.createBufferSource();
  s.buffer = gurultuTamponu(c);
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
  s.start(t, Math.random());
  s.stop(t + sure + 0.05);
}

const NOTA = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

/** Tek sesler: p = perde çarpanı (seri kesimde yükselir), k = güç (0-1) */
const TEKLER: Record<SesAdi, (p: number, k: number) => void> = {
  kirt: (p, k) => {
    gurultu(0, 0.06, 3200 * p, 1800 * p, 0.32 * k, 2.5);
    ton(900 * p, 0, 0.05, 'triangle', 0.08 * k, 500 * p);
  },
  slap: (p, k) => {
    gurultu(0, 0.16, 900 * p, 260 * p, 0.38 * k, 0.8, 'lowpass');
    gurultu(0.02, 0.1, 2400, 1200, 0.12 * k, 3);
  },
  citir: (p, k) => {
    for (let i = 0; i < 4; i++) gurultu(i * 0.035, 0.03, 4200 * p, 3000 * p, 0.16 * k, 4);
  },
  kitir: (p, k) => {
    gurultu(0, 0.05, 2400 * p, 1500 * p, 0.34 * k, 3);
    gurultu(0.05, 0.05, 2000 * p, 1200 * p, 0.24 * k, 3);
  },
  tok: (p, k) => ton(420 * p, 0, 0.09, 'triangle', 0.22 * k, 300 * p),
  vicik: (p, k) => {
    gurultu(0, 0.14, 500 * p, 1400 * p, 0.2 * k, 1.5, 'lowpass');
    ton(220 * p, 0.02, 0.12, 'sine', 0.1 * k, 440 * p);
  },
  ciz: (p, k) => gurultu(0, 0.5, 6000 * p, 3500 * p, 0.2 * k, 0.6, 'highpass'),
  fokur: (p, k) => {
    ton(240 * p, 0, 0.07, 'sine', 0.16 * k, 420 * p);
    ton(300 * p, 0.09, 0.06, 'sine', 0.12 * k, 520 * p);
  },
  pof: (p, k) => {
    gurultu(0, 0.18, 700 * p, 220 * p, 0.3 * k, 0.7, 'lowpass');
    ton(180 * p, 0, 0.14, 'sine', 0.16 * k, 90 * p);
  },
  tik: (p, k) => ton(1900 * p, 0, 0.035, 'square', 0.08 * k),
  cat: (p, k) => {
    gurultu(0, 0.06, 3000 * p, 1500 * p, 0.3 * k, 2);
    ton(1200 * p, 0, 0.05, 'triangle', 0.1 * k, 700 * p);
  },
  pit: (p, k) => ton(900 * p, 0, 0.07, 'sine', 0.2 * k, 1500 * p),
  siril: (p, k) => gurultu(0, 0.5, 2600 * p, 1800 * p, 0.12 * k, 0.8),
  kopuk: (p, k) => {
    for (let i = 0; i < 3; i++) ton((1100 + i * 260) * p, i * 0.05, 0.05, 'sine', 0.08 * k, (1500 + i * 300) * p);
  },
  ting: (p, k) => {
    ton(NOTA(88) * p, 0, 0.5, 'sine', 0.14 * k);
    ton(NOTA(95) * p, 0.02, 0.4, 'sine', 0.06 * k);
  },
  cin: (p, k) => {
    ton(NOTA(84) * p, 0, 0.5, 'triangle', 0.16 * k);
    ton(NOTA(88) * p, 0.05, 0.6, 'sine', 0.14 * k);
    gurultu(0, 0.06, 5000, 3000, 0.1 * k, 3);
  },
  zil: (p, k) => {
    ton(NOTA(91) * p, 0, 0.9, 'sine', 0.18 * k);
    ton(NOTA(91) * 2.76 * p, 0, 0.5, 'sine', 0.05 * k);
  },
  boing: (p, k) => ton(260 * p, 0, 0.28, 'sine', 0.2 * k, 520 * p),
  hop: (p, k) => ton(NOTA(74) * p, 0, 0.1, 'triangle', 0.14 * k, NOTA(79) * p),
  yanlis: (p, k) => {
    ton(NOTA(67) * p, 0, 0.14, 'triangle', 0.12 * k, NOTA(64) * p);
    ton(NOTA(64) * p, 0.15, 0.18, 'triangle', 0.1 * k, NOTA(62) * p);
  },
};

/** Sürekli sesler: gürültü + filtre, gücü ayarlanabilir */
function dongu(ad: 'ciz' | 'fokur' | 'siril') {
  const h = hazir();
  let bitti = false;
  let fokurZaman = 0;
  if (!h) return { guc: () => undefined, dur: () => undefined };
  const [c, cikis] = h;
  const s = c.createBufferSource();
  s.buffer = gurultuTamponu(c);
  s.loop = true;
  const f = c.createBiquadFilter();
  const g = c.createGain();
  if (ad === 'ciz') {
    f.type = 'highpass';
    f.frequency.value = 4200;
  } else if (ad === 'siril') {
    f.type = 'bandpass';
    f.frequency.value = 2200;
    f.Q.value = 0.7;
  } else {
    f.type = 'lowpass';
    f.frequency.value = 500;
  }
  let guc = 0.5;
  const taban = ad === 'ciz' ? 0.09 : ad === 'siril' ? 0.1 : 0.05;
  g.gain.value = 0.0001;
  g.gain.setTargetAtTime(taban * guc, c.currentTime, 0.15);
  s.connect(f).connect(g).connect(cikis);
  s.start();
  // cızırtı titrer, fokur kabarcık atar
  const titret = window.setInterval(() => {
    if (bitti) return;
    if (ad === 'ciz') g.gain.setTargetAtTime(taban * guc * (0.7 + Math.random() * 0.6), c.currentTime, 0.04);
    if (ad === 'fokur' && performance.now() > fokurZaman) {
      fokurZaman = performance.now() + 250 + Math.random() * 500;
      TEKLER.fokur(0.8 + Math.random() * 0.5, guc);
    }
  }, 90);
  return {
    guc(x: number) {
      guc = Math.max(0, Math.min(1, x));
      g.gain.setTargetAtTime(Math.max(0.0001, taban * guc), c.currentTime, 0.1);
    },
    dur() {
      if (bitti) return;
      bitti = true;
      clearInterval(titret);
      g.gain.setTargetAtTime(0.0001, c.currentTime, 0.08);
      s.stop(c.currentTime + 0.4);
    },
  };
}

export const sesler: Sesler = {
  cal(ad, s = {}) {
    try {
      TEKLER[ad]?.(s.perde ?? 1, s.guc ?? 1);
    } catch {
      /* ses yoksa oyun sürer */
    }
  },
  dongu,
};

/** Lokantaya özel küçük sesler (mini oyunlara verilmez) */
export const salonSes = {
  /** kapı zili (müşteri gelir) */
  kapi() {
    ton(NOTA(88), 0, 0.5, 'sine', 0.14);
    ton(NOTA(84), 0.16, 0.6, 'sine', 0.12);
  },
  /** jeton kasaya: çın (sayıldıkça hafif yükselir) */
  jeton(i = 0) {
    ton(NOTA(86 + Math.min(i, 6)), 0, 0.22, 'triangle', 0.14);
    ton(NOTA(93 + Math.min(i, 6)), 0.03, 0.18, 'sine', 0.06);
  },
  /** çiğneme: yumuşak ham ham */
  cigne() {
    for (let i = 0; i < 3; i++) gurultu(i * 0.16, 0.08, 700, 400, 0.1, 1, 'lowpass');
  },
  /** bayıldı: yükselen üç nota */
  bayildi() {
    [72, 76, 79, 84].forEach((n, i) => ton(NOTA(n), i * 0.09, 0.22, 'triangle', 0.13));
  },
  /** mmm: iki yumuşak nota */
  mmm() {
    [72, 76].forEach((n, i) => ton(NOTA(n), i * 0.12, 0.25, 'sine', 0.12));
  },
  /** komik: kayan "vuuup" */
  komik() {
    ton(NOTA(79), 0, 0.35, 'triangle', 0.12, NOTA(67));
    ton(NOTA(72), 0.38, 0.12, 'triangle', 0.1, NOTA(76));
  },
  /** adisyon kartı uçar */
  vuu() {
    gurultu(0, 0.3, 800, 2400, 0.08, 1.2);
  },
  /** tabela döner */
  tabela() {
    ton(NOTA(67), 0, 0.12, 'triangle', 0.14);
    ton(NOTA(74), 0.12, 0.12, 'triangle', 0.14);
    ton(NOTA(79), 0.24, 0.3, 'triangle', 0.14);
  },
  /** gün sonu kısa melodi */
  gunSonu() {
    [72, 76, 79, 84, 79, 84].forEach((n, i) => ton(NOTA(n), i * 0.14, 0.26, 'triangle', 0.12));
  },
};
