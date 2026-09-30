/**
 * "Salıncak Kimin?" sesleri: hepsi Web Audio sentezi (kredi harcamaz); fon müziği ve tekerleme dosyadan.
 *
 * KURAL (ekip/SES-SISTEMI.md): oyun ses çıkarırken kulak susar (kulak.sustur), yoksa oyun kendi sesini çocuğun sesi
 * sanır. Müzik yalnız mikrofonun dinlemediği anlarda çalar (sesli görevlerde durdurulur). Tekerleme kaydı çalarken
 * mikrofon dinlemez.
 */
import { baglam, efektCikisi } from '../../src/audio/motor';
import { kulak } from '../../orman/src/kulak';
import type { SarkiJson } from '../../src/audio/sarki-kayit';

function hazir(pan = 0): [AudioContext, AudioNode] | null {
  const c = baglam();
  const o = efektCikisi();
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
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, s), t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
}

function hisir(c: AudioContext, cikis: AudioNode, bas: number, sure: number, tip: BiquadFilterType, f0: number, f1: number, ses: number, q = 1) {
  const s = c.createBufferSource();
  s.buffer = gurultu(c);
  const fl = c.createBiquadFilter();
  fl.type = tip;
  fl.Q.value = q;
  fl.frequency.setValueAtTime(f0, bas);
  fl.frequency.exponentialRampToValueAtTime(Math.max(20, f1), bas + sure);
  const g = c.createGain();
  zarf(g, bas, ses, Math.min(0.03, sure * 0.25), sure);
  s.connect(fl).connect(g).connect(cikis);
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

export const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

/** Zincir gıcırtısı (salınımın ucunda, çok hafif; güç 0..1) */
export function gicirti(guc = 0.5, pan = 0) {
  kulak.sustur(260);
  const h = hazir(pan);
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  const g = Math.max(0.1, Math.min(1, guc));
  ton(c, o, t, 0.16, 1900, 1500, 0.012 * g, 'triangle');
  hisir(c, o, t, 0.12, 'bandpass', 2600, 1800, 0.02 * g, 6);
  // zincir şıkırtısı
  for (let i = 0; i < 3; i++) ton(c, o, t + 0.02 + i * 0.03, 0.03, 4200 + i * 300, 3800, 0.006 * g, 'square');
}

/** Rüzgâr "vuuş" (salıncak dipten geçerken; güç yükseklikle artar) */
export function vuus(guc = 0.5, pan = 0) {
  kulak.sustur(420);
  const h = hazir(pan);
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  hisir(c, o, t, 0.34, 'bandpass', 500, 1400, 0.05 * Math.max(0.15, Math.min(1, guc)), 1.2);
}

/** Kaydırak "vızzz" (sure: sn; ses ilerlemeyle sürer) */
export function vizz(sure = 0.5) {
  kulak.sustur(sure * 1000 + 200);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  hisir(c, o, t, sure, 'bandpass', 1800, 700, 0.05, 2);
  ton(c, o, t, sure, 520, 300, 0.012, 'sawtooth');
}

/** Kuma gömülme "puf" */
export function puf() {
  kulak.sustur(600);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  hisir(c, o, t, 0.45, 'lowpass', 900, 160, 0.16, 0.7);
  ton(c, o, t, 0.22, 140, 60, 0.12);
}

/** Sıkışmadan çıkış "pop" */
export function pop() {
  kulak.sustur(400);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  ton(c, o, t, 0.12, 380, 1100, 0.14);
  hisir(c, o, t, 0.06, 'highpass', 2400, 1800, 0.05);
}

/** İtiş "hop" (küçük yay sesi; güç 0..1) */
export function hop(guc = 0.6) {
  kulak.sustur(320);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  ton(c, o, t, 0.18, 260, 520 + 280 * guc, 0.08 + 0.05 * guc, 'triangle');
}

/** İniş "pat" */
export function pat() {
  kulak.sustur(300);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  ton(c, o, t, 0.12, 180, 80, 0.14);
  hisir(c, o, t, 0.08, 'lowpass', 1200, 300, 0.07);
}

/** Pati sesleri (koşu) */
export function patiler(adet = 6, ara = 0.11) {
  kulak.sustur(adet * ara * 1000 + 200);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  for (let i = 0; i < adet; i++) {
    ton(c, o, t + i * ara, 0.05, 240 + (i % 2) * 40, 150, 0.06);
    hisir(c, o, t + i * ara, 0.04, 'lowpass', 1500, 500, 0.035);
  }
}

/** Alkış / sayı notası (ksilofon gibi) */
export function nota(midi: number, ses = 0.11) {
  kulak.sustur(420);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  ton(c, o, t, 0.5, hz(midi), hz(midi), ses, 'triangle');
  ton(c, o, t, 0.16, hz(midi) * 4, hz(midi) * 4, ses * 0.12);
}

/** Dokunma alkışı (parmak karşılığı): kısa şak */
export function sak() {
  kulak.sustur(260);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  hisir(c, o, t, 0.07, 'bandpass', 1600, 1200, 0.18, 1.4);
}

/** Fuların uçuşu "fırr" */
export function firr() {
  kulak.sustur(600);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  for (let i = 0; i < 4; i++) hisir(c, o, t + i * 0.08, 0.1, 'bandpass', 900 + i * 200, 1600, 0.035, 3);
}

/** Tüy kabarması "pof" */
export function pof() {
  kulak.sustur(400);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  hisir(c, o, t, 0.2, 'lowpass', 2400, 400, 0.12);
  ton(c, o, t, 0.16, 300, 700, 0.06, 'triangle');
}

/** Başarı yıldızları (sıra: 0, 1, 2 … yükselen) */
export function yildiz(sira = 0) {
  kulak.sustur(700);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  [72, 76, 79, 84].forEach((m, i) => ton(c, o, t + i * 0.07, 0.35, hz(m + sira), hz(m + sira), 0.06, 'triangle'));
}

/** Kuş cıvıltısı (park ortamı; çok hafif, yalnız dinlenmeyen anlarda) */
export function kus() {
  const h = hazir(Math.random() * 1.4 - 0.7);
  if (!h) return;
  kulak.sustur(700);
  const [c, o] = h;
  const t = c.currentTime;
  const n = 2 + Math.floor(Math.random() * 3);
  const f0 = 2600 + Math.random() * 900;
  for (let i = 0; i < n; i++) ton(c, o, t + i * 0.11, 0.07, f0, f0 * 1.35, 0.012, 'sine');
}

/** Yumuşak "mırr" (Mino keyiflenince) */
export function mirr() {
  kulak.sustur(1000);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  const s = c.createOscillator();
  const lfo = c.createOscillator();
  const lg = c.createGain();
  const g = c.createGain();
  s.type = 'sawtooth';
  s.frequency.value = 62;
  lfo.frequency.value = 24;
  lg.gain.value = 0.5;
  const fl = c.createBiquadFilter();
  fl.type = 'lowpass';
  fl.frequency.value = 320;
  lfo.connect(lg).connect(g.gain);
  zarf(g, t, 0.05, 0.1, 0.9);
  s.connect(fl).connect(g).connect(o);
  s.start(t);
  lfo.start(t);
  s.stop(t + 1);
  lfo.stop(t + 1);
}

// ---------------------------------------------------------------- tekerleme kaydı (Gemini)
/** assets/muzik/salincak-sozlu.mp3 + salincak-sozsuz.mp3 + salincak.json; yoksa null (sentez vuruşlarla oynanır) */
const SES = import.meta.glob<string>('../../assets/muzik/salincak-*.mp3', { eager: true, query: '?url', import: 'default' });
const JSON_ = import.meta.glob<SarkiJson>('../../assets/muzik/salincak.json', { eager: true, import: 'default' });
const FON = import.meta.glob<string>('../../assets/muzik/film-fon-pazar.mp3', { eager: true, query: '?url', import: 'default' });

/** Parkın fon müziği (film setinin neşeli fonu; dosya yoksa null) */
export const fonAdresi = (): string | null => FON['../../assets/muzik/film-fon-pazar.mp3'] ?? null;

export function tekerlemeKaydi(): { sozlu: string; sozsuz: string; kayit: SarkiJson } | null {
  const kayit = JSON_['../../assets/muzik/salincak.json'];
  const sozlu = SES['../../assets/muzik/salincak-sozlu.mp3'];
  const sozsuz = SES['../../assets/muzik/salincak-sozsuz.mp3'] ?? sozlu;
  return kayit && sozlu ? { sozlu, sozsuz, kayit } : null;
}

/** Kaydın bir parçasını çalar (başı–sonu ms); bitince çözülür. Mikrofon parça boyunca (ve biraz sonrasında) susar. */
export class TekerlemeCalar {
  private sesler: Record<'sozlu' | 'sozsuz', HTMLAudioElement>;
  private dur: ReturnType<typeof setTimeout> | null = null;
  private bitti: (() => void) | null = null;
  constructor(sozlu: string, sozsuz: string) {
    this.sesler = { sozlu: new Audio(sozlu), sozsuz: new Audio(sozsuz) };
    for (const a of Object.values(this.sesler)) a.preload = 'auto';
  }
  cal(tur: 'sozlu' | 'sozsuz', basMs: number, bitMs: number, ses = 1): Promise<void> {
    this.durdur();
    const ms = Math.max(80, bitMs - basMs);
    kulak.sustur(ms + 350);
    const a = this.sesler[tur];
    try {
      a.volume = Math.max(0, Math.min(1, ses));
      a.currentTime = basMs / 1000;
      void a.play().catch(() => undefined);
    } catch {
      /* ses yüklenemedi: oyun sürer */
    }
    return new Promise<void>((coz) => {
      this.bitti = coz;
      this.dur = setTimeout(() => {
        a.pause();
        this.bitti = null;
        coz();
      }, ms);
    });
  }
  durdur() {
    if (this.dur) clearTimeout(this.dur);
    this.dur = null;
    for (const a of Object.values(this.sesler)) a.pause();
    this.bitti?.();
    this.bitti = null;
  }
  kapat() {
    this.durdur();
    for (const a of Object.values(this.sesler)) a.src = '';
  }
}
