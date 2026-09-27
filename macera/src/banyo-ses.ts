/**
 * Banyo sesleri: hepsi Web Audio sentezi (kredi harcamaz). Su akışı, şlap, gluk gluk, fıs, pıt, vık, hışırtı,
 * silkelenme, damla, diş takırtısı, Kino'nun uluması (çocuğun perdesini izleyen sinüs + vibrato), müzik kutusu,
 * "tertemiz" jingle'ı ve oyuncaklı banyo müziği.
 *
 * KURAL: oyun ses çıkarırken kulak susar (kulak.sustur), yoksa oyun kendi sesini çocuğun sesi sanır.
 * Müzik yalnız mikrofonun dinlemediği anlarda çalar (sesli görevlerde durdurulur).
 */
import { baglam, efektCikisi, muzikCikisi } from '../../src/audio/motor';
import { kulak } from '../../orman/src/kulak';

function hazir(cikisSec: 'efekt' | 'muzik' = 'efekt'): [AudioContext, AudioNode] | null {
  const c = baglam();
  const o = cikisSec === 'efekt' ? efektCikisi() : muzikCikisi();
  return c && o && c.state === 'running' ? [c, o] : null;
}

let gurultu: AudioBuffer | null = null;
function gurultuTamponu(c: AudioContext) {
  if (!gurultu || gurultu.sampleRate !== c.sampleRate) {
    gurultu = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = gurultu.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return gurultu;
}

/** Filtreli gürültü patlaması */
function hisir(c: AudioContext, cikis: AudioNode, bas: number, sure: number, tip: BiquadFilterType, f0: number, f1: number, ses: number, q = 1) {
  const s = c.createBufferSource();
  s.buffer = gurultuTamponu(c);
  const f = c.createBiquadFilter();
  f.type = tip;
  f.Q.value = q;
  f.frequency.setValueAtTime(f0, bas);
  f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), bas + sure);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, bas);
  g.gain.exponentialRampToValueAtTime(ses, bas + Math.min(0.03, sure * 0.2));
  g.gain.exponentialRampToValueAtTime(0.0001, bas + sure);
  s.connect(f).connect(g).connect(cikis);
  s.start(bas, Math.random());
  s.stop(bas + sure + 0.05);
}

/** Perdesi kayan ton */
function ton(c: AudioContext, cikis: AudioNode, bas: number, sure: number, f0: number, f1: number, ses: number, tip: OscillatorType = 'sine') {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = tip;
  o.frequency.setValueAtTime(f0, bas);
  o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), bas + sure);
  g.gain.setValueAtTime(0.0001, bas);
  g.gain.exponentialRampToValueAtTime(ses, bas + Math.min(0.015, sure * 0.2));
  g.gain.exponentialRampToValueAtTime(0.0001, bas + sure);
  o.connect(g).connect(cikis);
  o.start(bas);
  o.stop(bas + sure + 0.05);
}

const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

/** Kısa efektler (her biri kulağı kısa süre susturur) */
export const bs = {
  /** "Şlap!": suya düşüş (derin gümleme + su sıçraması) */
  slap() {
    kulak.sustur(1400);
    const h = hazir();
    if (!h) return;
    const [c, o] = h;
    const t = c.currentTime;
    ton(c, o, t, 0.35, 140, 45, 0.55);
    hisir(c, o, t, 0.7, 'lowpass', 5000, 300, 0.5, 0.7);
    for (let i = 0; i < 7; i++) ton(c, o, t + 0.12 + i * 0.07 + Math.random() * 0.05, 0.08, 900 + Math.random() * 900, 400, 0.08);
  },
  /** Gider: gluk gluk gluk */
  gluk(kez = 4) {
    kulak.sustur(kez * 380 + 500);
    const h = hazir();
    if (!h) return;
    const [c, o] = h;
    const t = c.currentTime;
    for (let i = 0; i < kez; i++) {
      const b = t + i * 0.36;
      ton(c, o, b, 0.14, 260, 700, 0.3);
      ton(c, o, b + 0.05, 0.12, 180, 520, 0.18);
      hisir(c, o, b, 0.1, 'bandpass', 700, 300, 0.12, 4);
    }
  },
  /** Şampuan / köpük şişesi: fıs */
  fis() {
    kulak.sustur(600);
    const h = hazir();
    if (!h) return;
    const [c, o] = h;
    hisir(c, o, c.currentTime, 0.32, 'highpass', 3500, 6000, 0.22, 0.8);
  },
  /** Baloncuk patlaması: pıt */
  pit() {
    kulak.sustur(350);
    const h = hazir();
    if (!h) return;
    const [c, o] = h;
    const t = c.currentTime;
    ton(c, o, t, 0.05, 1500, 2600, 0.22);
    hisir(c, o, t, 0.04, 'highpass', 4000, 5000, 0.08);
  },
  /** Baloncuk çıkar (yumuşak "blup") */
  blup(buyuk = false) {
    kulak.sustur(350);
    const h = hazir();
    if (!h) return;
    const [c, o] = h;
    ton(c, o, c.currentTime, buyuk ? 0.22 : 0.1, buyuk ? 300 : 600, buyuk ? 900 : 1500, 0.14);
  },
  /** Lastik ördek: vık */
  vik() {
    kulak.sustur(500);
    const h = hazir();
    if (!h) return;
    const [c, o] = h;
    const t = c.currentTime;
    const os = c.createOscillator();
    const f = c.createBiquadFilter();
    const g = c.createGain();
    os.type = 'sawtooth';
    os.frequency.setValueAtTime(700, t);
    os.frequency.linearRampToValueAtTime(1350, t + 0.06);
    os.frequency.linearRampToValueAtTime(1050, t + 0.22);
    f.type = 'bandpass';
    f.frequency.value = 1400;
    f.Q.value = 3;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
    os.connect(f).connect(g).connect(o);
    os.start(t);
    os.stop(t + 0.3);
  },
  /** Ovalama / köpük hışırtısı (kısa) */
  hisirti(guc = 1) {
    kulak.sustur(250);
    const h = hazir();
    if (!h) return;
    const [c, o] = h;
    hisir(c, o, c.currentTime, 0.14, 'bandpass', 2500 + Math.random() * 1500, 1800, 0.05 * guc, 1.5);
  },
  /** Havlu sürtme (yumuşak, kalın) */
  havlu() {
    kulak.sustur(300);
    const h = hazir();
    if (!h) return;
    const [c, o] = h;
    hisir(c, o, c.currentTime, 0.2, 'lowpass', 1400, 500, 0.08, 0.8);
  },
  /** Su damlası (plink) */
  damla() {
    kulak.sustur(250);
    const h = hazir();
    if (!h) return;
    const [c, o] = h;
    ton(c, o, c.currentTime, 0.09, 1700 + Math.random() * 600, 700, 0.1);
  },
  /** Silkelenme: kulak pırpır + damla sıçraması + kısa davul */
  silkele() {
    kulak.sustur(2000);
    const h = hazir();
    if (!h) return;
    const [c, o] = h;
    const t = c.currentTime;
    ton(c, o, t, 0.3, 130, 55, 0.4);
    for (let i = 0; i < 16; i++) hisir(c, o, t + 0.1 + i * 0.07, 0.06, 'bandpass', 900 + (i % 2) * 500, 700, 0.12, 2);
    for (let i = 0; i < 10; i++) ton(c, o, t + 0.2 + Math.random() * 1.1, 0.07, 1400 + Math.random() * 1000, 600, 0.07);
  },
  /** Diş takırtısı (soğuk su) */
  takir() {
    kulak.sustur(1100);
    const h = hazir();
    if (!h) return;
    const [c, o] = h;
    const t = c.currentTime;
    for (let i = 0; i < 12; i++) hisir(c, o, t + i * 0.07, 0.025, 'highpass', 2500, 3000, 0.1);
  },
  /** Buz sarkıtı: tın */
  tin() {
    kulak.sustur(700);
    const h = hazir();
    if (!h) return;
    const [c, o] = h;
    const t = c.currentTime;
    ton(c, o, t, 0.6, hz(96), hz(96), 0.08);
    ton(c, o, t, 0.4, hz(103), hz(103), 0.04);
  },
  /** Buhar: fısss (yumuşak) */
  buhar() {
    kulak.sustur(900);
    const h = hazir();
    if (!h) return;
    const [c, o] = h;
    hisir(c, o, c.currentTime, 0.8, 'highpass', 2000, 4000, 0.05, 0.5);
  },
  /** Müzik kutusu notası (baloncuk sahnesi) */
  kutu(midi: number, ses = 0.12) {
    kulak.sustur(700);
    const h = hazir();
    if (!h) return;
    const [c, o] = h;
    const t = c.currentTime;
    ton(c, o, t, 0.9, hz(midi), hz(midi), ses);
    ton(c, o, t, 0.4, hz(midi) * 3.01, hz(midi) * 3.01, ses * 0.25);
  },
  /** "Tertemiz" jingle'ı: yükselen 4 nota + parıltı */
  jingle() {
    kulak.sustur(2200);
    const h = hazir();
    if (!h) return;
    const [c, o] = h;
    const t = c.currentTime;
    [72, 76, 79, 84].forEach((m, i) => {
      ton(c, o, t + i * 0.14, 0.5, hz(m), hz(m), 0.14);
      ton(c, o, t + i * 0.14, 0.3, hz(m) * 2, hz(m) * 2, 0.04);
    });
    for (let i = 0; i < 8; i++) ton(c, o, t + 0.6 + i * 0.06, 0.2, hz(96 + (i % 4) * 2), hz(96 + (i % 4) * 2), 0.03);
    hisir(c, o, t + 0.55, 0.8, 'highpass', 6000, 9000, 0.03);
  },
  /** Kısa yükselen "vuu" (hızla kaçış) */
  vuu() {
    kulak.sustur(600);
    const h = hazir();
    if (!h) return;
    const [c, o] = h;
    const t = c.currentTime;
    hisir(c, o, t, 0.35, 'bandpass', 600, 3000, 0.12, 2);
    ton(c, o, t, 0.25, 400, 1200, 0.05, 'triangle');
  },
  /** "Pop": bir şey yerine oturdu */
  pop() {
    kulak.sustur(300);
    const h = hazir();
    if (!h) return;
    const [c, o] = h;
    ton(c, o, c.currentTime, 0.08, 500, 1100, 0.18);
  },
  /** Tıpa çıkar: "plop" */
  plop() {
    kulak.sustur(500);
    const h = hazir();
    if (!h) return;
    const [c, o] = h;
    const t = c.currentTime;
    ton(c, o, t, 0.12, 900, 220, 0.3);
    hisir(c, o, t, 0.1, 'bandpass', 1200, 500, 0.1, 3);
  },
};

// ---------------------------------------------------------------- su akışı (sürekli)
/** Musluktan akan su: gürültü + filtre; güç 0..1. Çalarken kulak susar. */
export class SuSesi {
  private kaynak: AudioBufferSourceNode | null = null;
  private g: GainNode | null = null;
  private f: BiquadFilterNode | null = null;
  private guc = 0;
  ayarla(guc: number, sicak = 0.5) {
    this.guc = guc;
    if (guc > 0) kulak.sustur(400);
    const h = hazir();
    if (!h) return;
    const [c, o] = h;
    if (!this.kaynak && guc > 0) {
      this.kaynak = c.createBufferSource();
      this.kaynak.buffer = gurultuTamponu(c);
      this.kaynak.loop = true;
      this.f = c.createBiquadFilter();
      this.f.type = 'bandpass';
      this.f.Q.value = 0.6;
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 3500;
      this.g = c.createGain();
      this.g.gain.value = 0.0001;
      this.kaynak.connect(this.f).connect(lp).connect(this.g).connect(o);
      this.kaynak.start();
    }
    if (this.g && this.f) {
      this.g.gain.setTargetAtTime(guc > 0 ? 0.05 + guc * 0.1 : 0.0001, c.currentTime, 0.12);
      this.f.frequency.setTargetAtTime(1100 + sicak * 900, c.currentTime, 0.2);
    }
  }
  /** her karede: akarken kulak susar */
  tik() {
    if (this.guc > 0) kulak.sustur(300);
  }
  durdur() {
    this.guc = 0;
    try {
      this.kaynak?.stop();
    } catch {
      /* zaten durdu */
    }
    this.kaynak = null;
    this.g = null;
    this.f = null;
  }
}

// ---------------------------------------------------------------- Kino'nun uluması
/** Uluma sesi: sinüs + iki üst ses + vibrato + "uuu" filtresi. frekanslar: konturu (Hz), süre sn. */
export function ulu(konturHz: number[], sure: number, ses = 0.16): number {
  const ms = sure * 1000 + 400;
  kulak.sustur(ms);
  const h = hazir();
  if (!h) return ms;
  const [c, o] = h;
  const t = c.currentTime;
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(700, t);
  lp.frequency.linearRampToValueAtTime(1600, t + sure * 0.4);
  lp.frequency.linearRampToValueAtTime(800, t + sure);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(ses, t + 0.12);
  g.gain.setValueAtTime(ses, t + Math.max(0.13, sure - 0.3));
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  lp.connect(g).connect(o);
  const vib = c.createOscillator();
  vib.frequency.value = 5.5;
  const vibG = c.createGain();
  vib.connect(vibG);
  vib.start(t);
  vib.stop(t + sure + 0.1);
  for (const [k, s] of [[1, 1], [2, 0.35], [3, 0.12]] as const) {
    const os = c.createOscillator();
    os.type = k === 1 ? 'sine' : 'triangle';
    const og = c.createGain();
    og.gain.value = s;
    const n = Math.max(1, konturHz.length);
    // uluma: hafif aşağıdan kayarak başlar ("a-uuu")
    os.frequency.setValueAtTime(konturHz[0] * k * 0.8, t);
    konturHz.forEach((f, i) => os.frequency.linearRampToValueAtTime(f * k, t + 0.1 + (sure - 0.2) * (i / n)));
    os.frequency.linearRampToValueAtTime(konturHz[konturHz.length - 1] * k * 0.85, t + sure);
    const vg = c.createGain();
    vg.gain.value = konturHz[0] * k * 0.02;
    vibG.connect(vg).connect(os.frequency);
    vibG.gain.value = 1;
    os.connect(og).connect(lp);
    os.start(t);
    os.stop(t + sure + 0.1);
  }
  return ms;
}

/** Parmakla ulurken canlı uluma (mikrofon zaten susuk): frekans anında değişir */
export class CanliUluma {
  private os: OscillatorNode[] = [];
  private g: GainNode | null = null;
  basla(f: number) {
    kulak.sustur(600);
    const h = hazir();
    if (!h || this.g) return;
    const [c, o] = h;
    const t = c.currentTime;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1400;
    this.g = c.createGain();
    this.g.gain.setValueAtTime(0.0001, t);
    this.g.gain.exponentialRampToValueAtTime(0.14, t + 0.12);
    lp.connect(this.g).connect(o);
    const vib = c.createOscillator();
    vib.frequency.value = 5.5;
    const vg = c.createGain();
    vg.gain.value = f * 0.02;
    vib.connect(vg);
    vib.start();
    this.os.push(vib);
    for (const [k, s] of [[1, 1], [2, 0.3]] as const) {
      const os = c.createOscillator();
      os.frequency.value = f * k;
      vg.connect(os.frequency);
      const og = c.createGain();
      og.gain.value = s;
      os.connect(og).connect(lp);
      os.start();
      this.os.push(os);
    }
  }
  frekans(f: number) {
    kulak.sustur(600);
    const c = baglam();
    if (!c) return;
    this.os.slice(1).forEach((o, i) => o.frequency.setTargetAtTime(f * (i + 1), c.currentTime, 0.05));
  }
  bitir() {
    const c = baglam();
    if (!c || !this.g) return;
    const t = c.currentTime;
    this.g.gain.setTargetAtTime(0.0001, t, 0.08);
    this.os.forEach((o) => o.stop(t + 0.4));
    this.os = [];
    this.g = null;
    kulak.sustur(700);
  }
}

// ---------------------------------------------------------------- banyo müziği
/**
 * Oyuncaklı, hafif banyo müziği: pizzicato bas + marimba gibi melodi + ara sıra baloncuk "blip"i.
 * Müzik kanalından çalar (konuşmada kısılır). Sesli görevlerde durdurulur (mikrofon duymasın).
 */
const MELODI = [
  67, 0, 72, 0, 76, 74, 72, 0, 74, 0, 76, 0, 79, 0, 0, 0,
  77, 0, 76, 0, 74, 72, 74, 0, 76, 0, 72, 0, 67, 0, 0, 0,
  69, 0, 72, 0, 77, 76, 74, 0, 72, 0, 74, 0, 76, 0, 79, 0,
  81, 0, 79, 76, 74, 0, 76, 0, 72, 0, 0, 0, 72, 0, 0, 0,
];
const BAS = [48, 55, 53, 55, 45, 53, 43, 48];

export class BanyoMuzik {
  private zaman: number | undefined;
  private sonraki = 0;
  private adim = 0;
  private kutuMod = false;
  private readonly vurus = 60 / 104 / 2;
  get caliyor() {
    return this.zaman !== undefined;
  }
  baslat(kutu = false) {
    this.kutuMod = kutu;
    const c = baglam();
    if (!c || this.zaman !== undefined) return;
    this.sonraki = c.currentTime + 0.1;
    this.zaman = window.setInterval(() => this.planla(), 100);
    this.planla();
  }
  durdur() {
    clearInterval(this.zaman);
    this.zaman = undefined;
  }
  private planla() {
    const h = hazir('muzik');
    if (!h) return;
    const [c, o] = h;
    while (this.sonraki < c.currentTime + 0.3) {
      const t = this.sonraki;
      const m = MELODI[this.adim % MELODI.length];
      if (m) {
        if (this.kutuMod) {
          ton(c, o, t, 1.1, hz(m + 12), hz(m + 12), 0.035);
          ton(c, o, t, 0.4, hz(m + 12) * 3.01, hz(m + 12) * 3.01, 0.008);
        } else {
          ton(c, o, t, 0.28, hz(m), hz(m), 0.04, 'triangle');
          ton(c, o, t, 0.16, hz(m) * 4, hz(m) * 4, 0.008);
        }
      }
      if (this.adim % 4 === 0 && !this.kutuMod) ton(c, o, t, 0.22, hz(BAS[Math.floor(this.adim / 8) % BAS.length]), hz(BAS[Math.floor(this.adim / 8) % BAS.length]) * 0.98, 0.07);
      if (this.adim % 16 === 13) ton(c, o, t, 0.12, 500, 1300, 0.018);
      this.sonraki += this.vurus;
      this.adim++;
    }
  }
}
