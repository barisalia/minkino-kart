/**
 * Bölüm 2 (Ege Uyuyor) ses efektleri: Web Audio ile sentez. Kredi harcamaz; gerçekçi olması gerekenler
 * (bebek ağlaması, kıkırdama, gurultu) Barış onayından sonra ElevenLabs'e gidebilir, o zamana kadar bunlar çalar.
 * Oyun ses çıkarırken kulak susturulur (çocuğun sesi sanılmasın).
 */
import { baglam, efektCikisi } from '../../src/audio/motor';
import { resimSesi, resimSesiHazirla } from '../../canlan/src/ses';
import { kulak } from '../../orman/src/kulak';
import { nota } from '../../orman/src/sesler';

function hazir(): [AudioContext, AudioNode] | null {
  const c = baglam();
  const o = efektCikisi();
  return c && o && c.state === 'running' ? [c, o] : null;
}

let gurultuTampon: AudioBuffer | null = null;
function gurultu(c: AudioContext) {
  if (!gurultuTampon) {
    gurultuTampon = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = gurultuTampon.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return gurultuTampon;
}

/** Zarf: a saniyede s'ye çık, t+sure'de sön */
function zarf(g: GainNode, t: number, s: number, a: number, sure: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(s, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
}

/** Bebek ağlaması "ın-gaa": titreşimli testere dalga, ağız rezonansı (bant geçiren); guc 0..1 */
export function aglama(guc = 1) {
  kulak.sustur(1500);
  const h = hazir();
  if (!h) return;
  const [c, cikis] = h;
  const t = c.currentTime;
  const ses = 0.05 + guc * 0.1;
  const hece = (bas: number, sure: number, f0: number, f1: number, f2: number) => {
    const o = c.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(f0, bas);
    o.frequency.linearRampToValueAtTime(f1, bas + sure * 0.3);
    o.frequency.linearRampToValueAtTime(f2, bas + sure);
    const lfo = c.createOscillator();
    const lg = c.createGain();
    lfo.frequency.value = 7;
    lg.gain.value = 14;
    lfo.connect(lg).connect(o.frequency);
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1300;
    bp.Q.value = 1.2;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 3000;
    const g = c.createGain();
    zarf(g, bas, ses, 0.04, sure);
    o.connect(bp).connect(lp).connect(g).connect(cikis);
    o.start(bas);
    lfo.start(bas);
    o.stop(bas + sure + 0.05);
    lfo.stop(bas + sure + 0.05);
  };
  hece(t, 0.16, 470, 520, 500);
  hece(t + 0.24, 0.95, 520, 640, 430);
}

/** Karın gurultusu: kalın, dalgalanan gürültü */
export function gurul() {
  kulak.sustur(1300);
  const h = hazir();
  if (!h) return;
  const [c, cikis] = h;
  const t = c.currentTime;
  const s = c.createBufferSource();
  s.buffer = gurultu(c);
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(220, t);
  lp.frequency.linearRampToValueAtTime(120, t + 1);
  lp.Q.value = 6;
  const g = c.createGain();
  zarf(g, t, 0.5, 0.08, 1.05);
  const am = c.createGain();
  const lfo = c.createOscillator();
  lfo.frequency.setValueAtTime(9, t);
  lfo.frequency.linearRampToValueAtTime(5, t + 1);
  const lg = c.createGain();
  lg.gain.value = 0.5;
  am.gain.value = 0.5;
  lfo.connect(lg).connect(am.gain);
  s.connect(lp).connect(am).connect(g).connect(cikis);
  s.start(t);
  lfo.start(t);
  s.stop(t + 1.1);
  lfo.stop(t + 1.1);
}

/** Çıngırak: içindeki boncuklar (kısa tiz gürültü vuruşları) + minik çan */
export function cingirak(uzun = false) {
  kulak.sustur(450);
  const h = hazir();
  if (!h) return;
  const [c, cikis] = h;
  const t = c.currentTime;
  const adet = uzun ? 7 : 4;
  for (let i = 0; i < adet; i++) {
    const b = t + i * 0.045 + Math.random() * 0.012;
    const s = c.createBufferSource();
    s.buffer = gurultu(c);
    const hp = c.createBiquadFilter();
    hp.type = 'bandpass';
    hp.frequency.value = 4200 + Math.random() * 1800;
    hp.Q.value = 3;
    const g = c.createGain();
    zarf(g, b, 0.35, 0.003, 0.05);
    s.connect(hp).connect(g).connect(cikis);
    s.start(b, Math.random() * 0.5);
    s.stop(b + 0.06);
  }
  for (const [f, s] of [[2637, 0.05], [3520, 0.03]] as const) {
    const o = c.createOscillator();
    o.frequency.value = f;
    const g = c.createGain();
    zarf(g, t, s, 0.005, uzun ? 0.5 : 0.3);
    o.connect(g).connect(cikis);
    o.start(t);
    o.stop(t + 0.55);
  }
}

/** Lastik ördek "vık" */
export function vik() {
  kulak.sustur(400);
  const h = hazir();
  if (!h) return;
  const [c, cikis] = h;
  const t = c.currentTime;
  const o = c.createOscillator();
  o.type = 'square';
  o.frequency.setValueAtTime(820, t);
  o.frequency.exponentialRampToValueAtTime(1500, t + 0.07);
  o.frequency.exponentialRampToValueAtTime(1050, t + 0.2);
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 1400;
  bp.Q.value = 2;
  const g = c.createGain();
  zarf(g, t, 0.14, 0.01, 0.24);
  o.connect(bp).connect(g).connect(cikis);
  o.start(t);
  o.stop(t + 0.26);
}

/** "Am!": yumuşak, yukarı kayan pop */
export function am() {
  kulak.sustur(300);
  const h = hazir();
  if (!h) return;
  const [c, cikis] = h;
  const t = c.currentTime;
  const o = c.createOscillator();
  o.frequency.setValueAtTime(260, t);
  o.frequency.exponentialRampToValueAtTime(520, t + 0.09);
  const g = c.createGain();
  zarf(g, t, 0.2, 0.01, 0.14);
  o.connect(g).connect(cikis);
  o.start(t);
  o.stop(t + 0.16);
}

/** Kıkırdama (mevcut efekt; güçlüyse iki kez) */
export function kikir(guc = 0.5) {
  kulak.sustur(1200);
  void resimSesi('kikir');
  if (guc > 0.8) setTimeout(() => void resimSesi('kikir'), 420);
}

/** Civciv "cik cik" ve ayı homurtusu: mevcut hayvan efektleri */
export const cikcik = () => {
  kulak.sustur(1200);
  void resimSesi('kus');
};
export const ayiSesi = () => {
  kulak.sustur(1500);
  void resimSesi('ayi');
};

/** Kaşık kaseye: tok "klink" */
export function klink() {
  kulak.sustur(300);
  nota(88, 0.25, 0.06);
}

/** Buhar/üfleme sönümü: hafif tiz şşş */
export function fis() {
  const h = hazir();
  if (!h) return;
  const [c, cikis] = h;
  const t = c.currentTime;
  const s = c.createBufferSource();
  s.buffer = gurultu(c);
  const hp = c.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 3500;
  const g = c.createGain();
  zarf(g, t, 0.05, 0.05, 0.4);
  s.connect(hp).connect(g).connect(cikis);
  s.start(t);
  s.stop(t + 0.45);
}

/** Mama fırladı: "pıt" */
export function pit() {
  kulak.sustur(400);
  const h = hazir();
  if (!h) return;
  const [c, cikis] = h;
  const t = c.currentTime;
  const o = c.createOscillator();
  o.frequency.setValueAtTime(900, t);
  o.frequency.exponentialRampToValueAtTime(180, t + 0.18);
  const g = c.createGain();
  zarf(g, t, 0.18, 0.005, 0.2);
  o.connect(g).connect(cikis);
  o.start(t);
  o.stop(t + 0.22);
}

export function hazirla() {
  ['kikir', 'kus', 'ayi', 'yasasin'].forEach(resimSesiHazirla);
}
