/**
 * "Elektrikler Kesildi!" sesleri: hepsi Web Audio sentezi, kredi harcamaz.
 *
 * KURAL (ekip/SES-SISTEMI.md): oyun ses çıkarırken kulak susar (kulak.sustur), yoksa oyun kendi sesini çocuğun sesi
 * sanır. Müzik yalnız mikrofonun dinlemediği anlarda çalar (sesli görevlerde durdurulur).
 * Karanlığın sesleri (saat, damla, gıcırtı) sahnedeki yerine göre soldan / sağdan gelir (pan: −1 … 1).
 */
import { baglam, efektCikisi, muzikCikisi } from '../../src/audio/motor';
import { kulak } from '../../orman/src/kulak';
import type { KampKayit, KampParca } from './elektrik-mantik';

function hazir(cikis: 'efekt' | 'muzik' = 'efekt', pan = 0): [AudioContext, AudioNode] | null {
  const c = baglam();
  const o = cikis === 'efekt' ? efektCikisi() : muzikCikisi();
  if (!c || !o || c.state !== 'running') return null;
  if (!pan || typeof c.createStereoPanner !== 'function') return [c, o];
  const p = c.createStereoPanner();
  p.pan.value = Math.max(-1, Math.min(1, pan));
  p.connect(o);
  return [c, p];
}

let gurultuTampon: AudioBuffer | null = null;
function gurultu(c: AudioContext) {
  if (!gurultuTampon || gurultuTampon.sampleRate !== c.sampleRate) {
    gurultuTampon = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
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

function hisir(c: AudioContext, cikis: AudioNode, bas: number, sure: number, tip: BiquadFilterType, f0: number, f1: number, ses: number, q = 1) {
  const s = c.createBufferSource();
  s.buffer = gurultu(c);
  const f = c.createBiquadFilter();
  f.type = tip;
  f.Q.value = q;
  f.frequency.setValueAtTime(f0, bas);
  f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), bas + sure);
  const g = c.createGain();
  zarf(g, bas, ses, Math.min(0.03, sure * 0.25), sure);
  s.connect(f).connect(g).connect(cikis);
  s.start(bas, Math.random());
  s.stop(bas + sure + 0.05);
}

function ton(c: AudioContext, cikis: AudioNode, bas: number, sure: number, f0: number, f1: number, ses: number, tip: OscillatorType = 'sine') {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = tip;
  o.frequency.setValueAtTime(f0, bas);
  o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), bas + sure);
  zarf(g, bas, ses, Math.min(0.012, sure * 0.2), sure);
  o.connect(g).connect(cikis);
  o.start(bas);
  o.stop(bas + sure + 0.05);
}

const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

/** Pıt!: elektrik gider (kalın vızıltı aşağı kayarak söner + tık) */
export function pit() {
  kulak.sustur(1300);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  ton(c, o, t, 0.7, 120, 40, 0.12, 'sawtooth');
  ton(c, o, t, 0.5, 240, 70, 0.05, 'square');
  hisir(c, o, t, 0.04, 'highpass', 3000, 3000, 0.3);
  ton(c, o, t + 0.02, 0.25, 1800, 300, 0.08);
}

/** Küp düşer: tok vuruş + küçük sekme */
export function kupDus() {
  kulak.sustur(900);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  for (const [d, s] of [[0, 0.24], [0.28, 0.12], [0.45, 0.06]] as const) {
    ton(c, o, t + d, 0.12, 520, 360, s, 'triangle');
    hisir(c, o, t + d, 0.04, 'bandpass', 1800, 900, s * 0.5, 2);
  }
}

/** Kino'nun kaçışı: hızlı pati sesleri */
export function patiler(adet = 6) {
  kulak.sustur(adet * 90 + 300);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  for (let i = 0; i < adet; i++) ton(c, o, t + i * 0.075, 0.05, 300 + (i % 2) * 60, 200, 0.08, 'triangle');
}

/** Örtü / battaniye hışırtısı */
export function hisirti(uzun = false) {
  kulak.sustur(uzun ? 900 : 500);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  hisir(c, o, c.currentTime, uzun ? 0.8 : 0.35, 'bandpass', 1400, 2600, 0.07, 0.8);
}

/** Kino'nun titrek "ıııı"sı (korkunca) */
export function inilti() {
  kulak.sustur(900);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  const os = c.createOscillator();
  os.type = 'triangle';
  os.frequency.setValueAtTime(620, t);
  os.frequency.linearRampToValueAtTime(700, t + 0.3);
  os.frequency.linearRampToValueAtTime(520, t + 0.6);
  const lfo = c.createOscillator();
  lfo.frequency.value = 11;
  const lg = c.createGain();
  lg.gain.value = 18;
  lfo.connect(lg).connect(os.frequency);
  const g = c.createGain();
  zarf(g, t, 0.06, 0.05, 0.65);
  os.connect(g).connect(o);
  os.start(t);
  lfo.start(t);
  os.stop(t + 0.7);
  lfo.stop(t + 0.7);
}

/** Çekmece açılır / kapanır: ahşap gıcırtı + sürtme */
export function cekmece(kapan = false) {
  kulak.sustur(800);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  hisir(c, o, t, 0.45, 'bandpass', kapan ? 900 : 700, kapan ? 500 : 1100, 0.1, 2);
  ton(c, o, t + 0.05, 0.3, kapan ? 520 : 380, kapan ? 380 : 560, 0.03, 'sawtooth');
  if (kapan) ton(c, o, t + 0.42, 0.1, 300, 200, 0.2, 'triangle');
}

/** Fenerin düğmesi: tık */
export function tik() {
  kulak.sustur(350);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  hisir(c, o, t, 0.025, 'highpass', 3500, 3500, 0.35);
  ton(c, o, t, 0.05, 2200, 1500, 0.08, 'square');
}
/** Sallanan fener: tık tık */
export function tikTik() {
  tik();
  setTimeout(tik, 170);
  kulak.sustur(600);
}

/** Pil tıkırtısı (çekmecede sallanınca) */
export function tikir() {
  kulak.sustur(700);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  for (let i = 0; i < 6; i++) {
    const b = t + i * 0.07 + Math.random() * 0.02;
    hisir(c, o, b, 0.03, 'bandpass', 2600 + Math.random() * 900, 2400, 0.22, 4);
    ton(c, o, b, 0.03, 1700, 1500, 0.03, 'square');
  }
}

/** Fırın eldiveni: yumuşak pof */
export function pof() {
  kulak.sustur(500);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  hisir(c, o, t, 0.18, 'lowpass', 700, 200, 0.35, 0.8);
  ton(c, o, t, 0.12, 180, 90, 0.12);
}

/** Rende: şırr şırr */
export function sirr() {
  kulak.sustur(700);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  hisir(c, o, t, 0.22, 'bandpass', 3000, 5200, 0.12, 3);
  hisir(c, o, t + 0.26, 0.22, 'bandpass', 3200, 5600, 0.1, 3);
}

/** Pil fenere oturdu: tok klik */
export function yerlesti() {
  kulak.sustur(400);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  ton(c, o, t, 0.08, 900, 600, 0.14, 'triangle');
  hisir(c, o, t, 0.03, 'highpass', 2500, 2500, 0.2);
}

/** Fener yandı: tık + ışıltı */
export function yandi() {
  kulak.sustur(1100);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  hisir(c, o, t, 0.025, 'highpass', 3500, 3500, 0.35);
  [79, 84, 88, 91].forEach((m, i) => ton(c, o, t + 0.06 + i * 0.06, 0.6, hz(m), hz(m), 0.04));
}

/** Işık lekesi kayarken yumuşak "vuuş" (Mino zıplarken) */
export function hop() {
  kulak.sustur(600);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  ton(c, o, t, 0.3, 300, 900, 0.1, 'triangle');
  hisir(c, o, t, 0.3, 'bandpass', 800, 2400, 0.05, 1);
}
/** Yumuşak iniş (koltuk, yastık) */
export function pat() {
  kulak.sustur(400);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  hisir(c, o, t, 0.12, 'lowpass', 900, 200, 0.3, 0.8);
  ton(c, o, t, 0.1, 160, 80, 0.14);
}
/** Perdeden kayış: vızzt */
export function vizzt() {
  kulak.sustur(800);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  hisir(c, o, c.currentTime, 0.55, 'bandpass', 3800, 1200, 0.1, 5);
}

/** Saat: tik tak (pan: yön) */
export function tiktak(pan = 0, kez = 4) {
  kulak.sustur(kez * 480 + 400);
  const h = hazir('efekt', pan);
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  for (let i = 0; i < kez; i++) {
    const b = t + i * 0.48;
    hisir(c, o, b, 0.03, 'bandpass', i % 2 ? 2300 : 3100, 2000, 0.3, 6);
    ton(c, o, b, 0.04, i % 2 ? 1500 : 1900, 1200, 0.05, 'triangle');
  }
}

/** Saksıdan damla: tıp tıp (pan: yön) */
export function damla(pan = 0, kez = 3) {
  kulak.sustur(kez * 560 + 400);
  const h = hazir('efekt', pan);
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  for (let i = 0; i < kez; i++) {
    const b = t + i * 0.56;
    ton(c, o, b, 0.09, 700, 1900, 0.16);
    ton(c, o, b + 0.02, 0.18, 1400, 1200, 0.03);
  }
}

/** Gıcırtılı oyuncak: gıyk (pan: yön) */
export function giyk(pan = 0, kez = 1) {
  kulak.sustur(kez * 380 + 400);
  const h = hazir('efekt', pan);
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  for (let i = 0; i < kez; i++) {
    const b = t + i * 0.36;
    const os = c.createOscillator();
    os.type = 'square';
    os.frequency.setValueAtTime(900, b);
    os.frequency.exponentialRampToValueAtTime(1700, b + 0.08);
    os.frequency.exponentialRampToValueAtTime(1150, b + 0.24);
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1500;
    bp.Q.value = 3;
    const g = c.createGain();
    zarf(g, b, 0.16, 0.01, 0.26);
    os.connect(bp).connect(g).connect(o);
    os.start(b);
    os.stop(b + 0.28);
  }
}

/** Fener işareti (yanıp sönme): minik "vık" */
export function isaret(ince = false) {
  kulak.sustur(320);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  ton(c, o, t, 0.14, ince ? 1760 : 1320, ince ? 1760 : 1320, 0.05);
  ton(c, o, t, 0.1, ince ? 3520 : 2640, ince ? 3520 : 2640, 0.012);
}

/** Mandal: çıt */
export function cit() {
  kulak.sustur(350);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  hisir(c, o, t, 0.02, 'highpass', 4000, 4000, 0.4);
  ton(c, o, t, 0.06, 1200, 700, 0.12, 'triangle');
}

/** Bir şey yerine oturdu: "pop" */
export function pop() {
  kulak.sustur(300);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  ton(c, o, c.currentTime, 0.08, 500, 1100, 0.16);
}

/** Kamp şarkısının bir notası (ukulele gibi tıngırtı) + hafif davul; mikrofon notanın süresince susar */
export function kampNota(midi: number, davulKalin: boolean) {
  kulak.sustur(420);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  ton(c, o, t, 0.5, hz(midi), hz(midi), 0.12, 'triangle');
  ton(c, o, t, 0.3, hz(midi + 12), hz(midi + 12), 0.03);
  ton(c, o, t, 0.2, hz(midi - 12), hz(midi - 12), 0.05, 'sine');
  ton(c, o, t, 0.18, davulKalin ? 150 : 240, davulKalin ? 55 : 110, 0.3);
  hisir(c, o, t, 0.06, 'bandpass', davulKalin ? 900 : 2200, 900, 0.1);
}

/** Çadır çöker: pof + hışırtı */
export function cokus() {
  kulak.sustur(1200);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  ton(c, o, t, 0.2, 320, 160, 0.12, 'triangle');
  hisir(c, o, t + 0.1, 0.7, 'lowpass', 1800, 300, 0.3, 0.8);
}

/** Lamba titreyip yanar: vızz vızz + tık */
export function vizilti() {
  kulak.sustur(1600);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  for (const [d, s] of [[0, 0.18], [0.35, 0.12], [0.6, 0.35]] as const) ton(c, o, t + d, s, 100, 104, 0.05, 'sawtooth');
  hisir(c, o, t + 0.95, 0.03, 'highpass', 3000, 3000, 0.3);
  [72, 76, 79, 84].forEach((m, i) => ton(c, o, t + 1 + i * 0.07, 0.5, hz(m), hz(m), 0.05));
}

/** Kino'nun uluması (sentez): a-uuu */
export function uluma(sure = 1.4) {
  const ms = sure * 1000 + 400;
  kulak.sustur(ms);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(700, t);
  lp.frequency.linearRampToValueAtTime(1600, t + sure * 0.4);
  lp.frequency.linearRampToValueAtTime(800, t + sure);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.14, t + 0.12);
  g.gain.setValueAtTime(0.14, t + sure - 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  lp.connect(g).connect(o);
  const vib = c.createOscillator();
  vib.frequency.value = 5.5;
  vib.start(t);
  vib.stop(t + sure + 0.1);
  for (const [k, s] of [[1, 1], [2, 0.35]] as const) {
    const os = c.createOscillator();
    os.type = k === 1 ? 'sine' : 'triangle';
    os.frequency.setValueAtTime(420 * k * 0.8, t);
    os.frequency.linearRampToValueAtTime(560 * k, t + sure * 0.35);
    os.frequency.linearRampToValueAtTime(470 * k, t + sure);
    const vg = c.createGain();
    vg.gain.value = 9 * k;
    vib.connect(vg).connect(os.frequency);
    const og = c.createGain();
    og.gain.value = s;
    os.connect(og).connect(lp);
    os.start(t);
    os.stop(t + sure + 0.1);
  }
}

/** Mino'nun miyavı (sentez, kısa) */
export function miyav() {
  kulak.sustur(900);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  const os = c.createOscillator();
  os.type = 'sawtooth';
  os.frequency.setValueAtTime(600, t);
  os.frequency.linearRampToValueAtTime(900, t + 0.18);
  os.frequency.linearRampToValueAtTime(560, t + 0.55);
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(900, t);
  bp.frequency.linearRampToValueAtTime(1800, t + 0.2);
  bp.frequency.linearRampToValueAtTime(800, t + 0.55);
  bp.Q.value = 3;
  const g = c.createGain();
  zarf(g, t, 0.1, 0.04, 0.6);
  os.connect(bp).connect(g).connect(o);
  os.start(t);
  os.stop(t + 0.62);
}

/** Yıldız yandı: minik çan */
export function yildiz(sira = 0) {
  kulak.sustur(500);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const m = 84 + ((sira * 2) % 12);
  ton(c, o, c.currentTime, 0.6, hz(m), hz(m), 0.035);
}

/** Gece lambası: tık + yumuşak parıltı */
export function lambaTik() {
  kulak.sustur(900);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  hisir(c, o, t, 0.03, 'highpass', 3000, 3000, 0.2);
  [84, 88, 91, 96].forEach((m, i) => ton(c, o, t + 0.08 + i * 0.07, 0.5, hz(m), hz(m), 0.03));
}

// ---------------------------------------------------------------- gece müziği
/**
 * Yumuşak gece müziği (müzik kutusu + derin bas): müzik kanalından (konuşmada kısılır). Sesli görevlerde durdurulur.
 * `canli`: ışıklar yanınca (sahne 7) daha parlak, oyuncaklı tını.
 */
const MELODI = [
  64, 0, 67, 0, 72, 0, 71, 0, 67, 0, 69, 0, 67, 0, 0, 0,
  62, 0, 65, 0, 69, 0, 67, 0, 64, 0, 65, 0, 64, 0, 0, 0,
  64, 0, 67, 0, 72, 0, 74, 0, 76, 0, 74, 72, 71, 0, 0, 0,
  69, 0, 71, 0, 72, 0, 67, 0, 64, 0, 62, 0, 60, 0, 0, 0,
];
const BAS = [48, 43, 45, 43];

export class GeceMuzik {
  private zaman: number | undefined;
  private sonraki = 0;
  private adim = 0;
  private readonly vurus = 60 / 84 / 2;
  canli = false;
  get caliyor() {
    return this.zaman !== undefined;
  }
  baslat() {
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
        if (this.canli) {
          ton(c, o, t, 0.3, hz(m + 12), hz(m + 12), 0.035, 'triangle');
          ton(c, o, t, 0.16, hz(m + 12) * 4, hz(m + 12) * 4, 0.006);
        } else {
          ton(c, o, t, 1.1, hz(m + 12), hz(m + 12), 0.03);
          ton(c, o, t, 0.4, hz(m + 12) * 3.01, hz(m + 12) * 3.01, 0.007);
        }
      }
      if (this.adim % 8 === 0) ton(c, o, t, 1.2, hz(BAS[Math.floor(this.adim / 16) % BAS.length]), hz(BAS[Math.floor(this.adim / 16) % BAS.length]), 0.045);
      this.sonraki += this.vurus;
      this.adim++;
    }
  }
}

// ---------------------------------------------------------------- kayıtlı kamp şarkısı (Gemini; varsa)
/** assets/muzik/kamp-sozlu.mp3 / kamp-sozsuz.mp3 + kamp.json gelirse sentez yerine kayıt çalar (yoksa boş) */
const KAMP_SES = import.meta.glob<string>('../../assets/muzik/kamp-*.mp3', { eager: true, query: '?url', import: 'default' });
const KAMP_JSON = import.meta.glob<KampKayit>('../../assets/muzik/kamp.json', { eager: true, import: 'default' });

export function kampKaydi(): { url: string; kayit: KampKayit } | null {
  const kayit = KAMP_JSON['../../assets/muzik/kamp.json'];
  const url = KAMP_SES['../../assets/muzik/kamp-sozlu.mp3'] ?? KAMP_SES['../../assets/muzik/kamp-sozsuz.mp3'];
  return kayit && url ? { url, kayit } : null;
}

/** Kaydı parça parça çalar: her alkış bir parça (vuruştan bir sonraki vuruşa); mikrofon parça boyunca susar */
export class KampCalar {
  private ses: HTMLAudioElement;
  private dur: ReturnType<typeof setTimeout> | null = null;
  constructor(url: string) {
    this.ses = new Audio(url);
    this.ses.preload = 'auto';
  }
  parca(p: KampParca) {
    const ms = Math.max(80, p.bitMs - p.basMs);
    kulak.sustur(ms + 250);
    if (this.dur) clearTimeout(this.dur);
    try {
      this.ses.currentTime = p.basMs / 1000;
      void this.ses.play().catch(() => undefined);
    } catch {
      /* ses yüklenemedi: oyun sürer */
    }
    this.dur = setTimeout(() => this.ses.pause(), ms);
  }
  kapat() {
    if (this.dur) clearTimeout(this.dur);
    this.ses.pause();
    this.ses.src = '';
  }
}
