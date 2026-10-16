/**
 * Mino Ne Giysin? sesleri. Konuşma: content/mino-giysin.json (ElevenLabs kayıtları; kaydı çalınamayan cümle cihazın
 * robotik sesine düşmez, sessiz geçer). Efektler Web Audio sentezi (kredi harcamaz) ya da var olan hayvan efektleri
 * (public/ses/efekt: kedi miyavı, ördek vakı, kıkırdama, yaşasın).
 */
import { baglam, efektCikisi } from '../../src/audio/motor';
import { konus, KINO_SESI } from '../../src/audio/konusma';
import { resimSesi } from '../../canlan/src/ses';

/** Mino (anlatıcı) */
export const minoSoyle = (t: string | string[]) => konus(t, { cihazSesi: false });
/** Kino'nun kendi sesi */
export const kinoSoyle = (t: string) => konus(t, { ...KINO_SESI, cihazSesi: false });

function hazir(): [AudioContext, AudioNode] | null {
  const c = baglam();
  const o = efektCikisi();
  return c && o && c.state === 'running' ? [c, o] : null;
}

let gurultuTampon: AudioBuffer | null = null;
function gurultu(c: AudioContext) {
  if (!gurultuTampon || gurultuTampon.sampleRate !== c.sampleRate) {
    gurultuTampon = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = gurultuTampon.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return gurultuTampon;
}
function zarf(g: GainNode, t: number, s: number, a: number, sure: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(s, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
}
/** Perdesi kayan ton */
function ton(gec: number, sure: number, f0: number, f1: number, ses: number, tip: OscillatorType = 'sine') {
  const h = hazir();
  if (!h) return;
  const [c, cikis] = h;
  const t = c.currentTime + gec;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = tip;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + sure);
  zarf(g, t, ses, Math.min(0.015, sure * 0.2), sure);
  o.connect(g).connect(cikis);
  o.start(t);
  o.stop(t + sure + 0.05);
}
/** Filtreli gürültü */
function hisir(gec: number, sure: number, tip: BiquadFilterType, f0: number, f1: number, ses: number, q = 1) {
  const h = hazir();
  if (!h) return;
  const [c, cikis] = h;
  const t = c.currentTime + gec;
  const s = c.createBufferSource();
  s.buffer = gurultu(c);
  const f = c.createBiquadFilter();
  f.type = tip;
  f.Q.value = q;
  f.frequency.setValueAtTime(f0, t);
  f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + sure);
  const g = c.createGain();
  zarf(g, t, ses, Math.min(0.03, sure * 0.25), sure);
  s.connect(f).connect(g).connect(cikis);
  s.start(t, Math.random() * 0.5);
  s.stop(t + sure + 0.05);
}

export const ses = {
  /** "pof": değişim bulutu */
  pof() {
    hisir(0, 0.22, 'lowpass', 1800, 300, 0.25, 0.8);
    ton(0, 0.12, 300, 140, 0.12);
  },
  /** "hop": yakalama zıplaması */
  hop() {
    ton(0, 0.14, 380, 760, 0.12, 'triangle');
  },
  /** fırlatma: kısa "fıııt" */
  firlat() {
    hisir(0, 0.3, 'bandpass', 900, 3200, 0.14, 1.2);
  },
  /** yardım balonu "pıt" diye açılır */
  pit(sira = 0) {
    ton(0, 0.09, 700 + sira * 120, 1300 + sira * 160, 0.12, 'sine');
  },
  /** tahta kaşık kaba: "tın" */
  tin(sira = 0) {
    const f = [1320, 1480, 1760][sira % 3];
    ton(0, 0.5, f, f * 0.995, 0.18);
    ton(0, 0.3, f * 2.7, f * 2.69, 0.04);
  },
  /** kalp: "güm" */
  gum() {
    ton(0, 0.18, 110, 60, 0.35);
    ton(0.2, 0.16, 100, 55, 0.25);
  },
  /** ağaç gövdesi / ağaçkakan: "tak" */
  tak(gec = 0) {
    hisir(gec, 0.05, 'bandpass', 2400, 1800, 0.3, 3);
    ton(gec, 0.05, 900, 500, 0.12, 'square');
  },
  /** uçak kaşık: "vınnn" */
  vin() {
    ton(0, 0.9, 260, 520, 0.08, 'sawtooth');
    ton(0, 0.9, 263, 525, 0.06, 'triangle');
  },
  /** merdiven basamağı: "tık" */
  tik(sira = 0) {
    ton(0, 0.07, 1100 + sira * 150, 900 + sira * 150, 0.14, 'triangle');
  },
  /** su: damla ve şırıltı */
  damla(sira = 0) {
    ton(0, 0.12, 900 + sira * 90, 1900 + sira * 90, 0.12);
  },
  su() {
    hisir(0, 0.6, 'bandpass', 3000, 1800, 0.12, 2);
  },
  /** hapşu (Kino'nun kaydı yoksa da duyulsun) */
  hapsu() {
    hisir(0, 0.22, 'bandpass', 900, 2200, 0.1, 1.5);
    hisir(0.2, 0.5, 'highpass', 5000, 2000, 0.35, 0.7);
  },
  /** çiçek dikilir: yukarı kayan "fiyuv" */
  dikil(sira = 0) {
    ton(0, 0.3, 400 + sira * 60, 900 + sira * 80, 0.12, 'triangle');
  },
  /** başarısızlık sonrası komik "boing" (sakin) */
  boing() {
    ton(0, 0.4, 160, 330, 0.12);
    ton(0.12, 0.35, 330, 140, 0.1);
  },
  /** çözüm: üç notalı sevinç */
  cozum() {
    [72, 76, 79, 84].forEach((n, i) => ton(i * 0.08, 0.25, 440 * Math.pow(2, (n - 69) / 12), 440 * Math.pow(2, (n - 69) / 12), 0.13, 'triangle'));
  },
  /** yıldız doldu */
  yildiz() {
    ton(0, 0.25, 1318, 1318, 0.12, 'triangle');
    ton(0.08, 0.3, 1975, 1975, 0.1, 'triangle');
  },
  /** ayna parıltısı */
  parilti() {
    [88, 91, 96].forEach((n, i) => ton(i * 0.06, 0.18, 440 * Math.pow(2, (n - 69) / 12), 440 * Math.pow(2, (n - 69) / 12), 0.06, 'sine'));
  },
  /** alkış (Ada, arkadaşlar) */
  alkis(kez = 6) {
    for (let i = 0; i < kez; i++) hisir(i * 0.12 + Math.random() * 0.03, 0.06, 'bandpass', 1800, 1200, 0.22, 1.2);
  },
  /** mantar sporu "pof" (büyük) */
  bufPof() {
    hisir(0, 0.6, 'lowpass', 1200, 200, 0.3, 0.6);
  },
  /** karın gurultusu (Ege) */
  gurul() {
    ton(0, 0.5, 90, 70, 0.2, 'triangle');
    ton(0.5, 0.4, 80, 60, 0.18, 'triangle');
  },
  miyav: () => void resimSesi('kedi'),
  vak: () => void resimSesi('ordek'),
  kikir: () => void resimSesi('kikir'),
  yasasin: () => void resimSesi('yasasin'),
};
