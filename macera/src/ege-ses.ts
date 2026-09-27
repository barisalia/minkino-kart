/**
 * Bölüm 2 (Ege Uyuyor) sesleri: hepsi Web Audio sentezi, kredi harcamaz. Senaryodaki ElevenLabs efektleri (bebek
 * ağlaması, kıkırdama, kahkaha, gurultu, hapşırık, hıpşu) Barış onayından sonra gelebilir; o zamana kadar bunlar.
 *
 * KURAL: oyun ses çıkarırken kulak susar (kulak.sustur), yoksa oyun kendi sesini çocuğun sesi sanır.
 * Müzik yalnız mikrofonun dinlemediği anlarda çalar (sesli görevlerde durdurulur).
 */
import { baglam, efektCikisi, muzikCikisi } from '../../src/audio/motor';
import { resimSesi, resimSesiHazirla } from '../../canlan/src/ses';
import { kulak } from '../../orman/src/kulak';

function hazir(cikis: 'efekt' | 'muzik' = 'efekt'): [AudioContext, AudioNode] | null {
  const c = baglam();
  const o = cikis === 'efekt' ? efektCikisi() : muzikCikisi();
  return c && o && c.state === 'running' ? [c, o] : null;
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

/** Zarf: a saniyede s'ye çık, t+sure'de sön */
function zarf(g: GainNode, t: number, s: number, a: number, sure: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(s, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
}

/** Filtreli gürültü patlaması */
function hisir(c: AudioContext, cikis: AudioNode, bas: number, sure: number, tip: BiquadFilterType, f0: number, f1: number, ses: number, q = 1) {
  const s = c.createBufferSource();
  s.buffer = gurultu(c);
  const f = c.createBiquadFilter();
  f.type = tip;
  f.Q.value = q;
  f.frequency.setValueAtTime(f0, bas);
  f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), bas + sure);
  const g = c.createGain();
  zarf(g, bas, ses, Math.min(0.04, sure * 0.25), sure);
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
  zarf(g, bas, ses, Math.min(0.015, sure * 0.2), sure);
  o.connect(g).connect(cikis);
  o.start(bas);
  o.stop(bas + sure + 0.05);
}

export const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

/** Bebek ağlaması "ın-gaa": titreşimli testere dalga, ağız rezonansı; guc 0..1 */
export function aglama(guc = 1) {
  kulak.sustur(1500);
  const h = hazir();
  if (!h) return;
  const [c, cikis] = h;
  const t = c.currentTime;
  const ses = 0.04 + guc * 0.08;
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
export function cingirak(uzun = false, ses = 1) {
  kulak.sustur(450);
  const h = hazir();
  if (!h) return;
  const [c, cikis] = h;
  const t = c.currentTime;
  const adet = uzun ? 7 : 4;
  for (let i = 0; i < adet; i++) hisir(c, cikis, t + i * 0.045 + Math.random() * 0.012, 0.05, 'bandpass', 4200 + Math.random() * 1800, 4000, 0.3 * ses, 3);
  ton(c, cikis, t, uzun ? 0.5 : 0.3, 2637, 2637, 0.05 * ses);
  ton(c, cikis, t, uzun ? 0.5 : 0.3, 3520, 3520, 0.03 * ses);
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

/** Oyuncak sepetten çıkar: küp tok, kitap pat, top boing */
export function oyuncak(ad: string) {
  kulak.sustur(450);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  if (ad === 'top') {
    ton(c, o, t, 0.25, 180, 520, 0.2, 'triangle');
    ton(c, o, t + 0.22, 0.18, 200, 480, 0.12, 'triangle');
  } else if (ad === 'kitap') hisir(c, o, t, 0.12, 'lowpass', 1600, 400, 0.3);
  else {
    ton(c, o, t, 0.12, 520, 380, 0.2, 'triangle');
    hisir(c, o, t, 0.05, 'bandpass', 1800, 900, 0.12, 2);
  }
}

/** "Am!": yumuşak, yukarı kayan pop */
export function am() {
  kulak.sustur(300);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  ton(c, o, c.currentTime, 0.14, 260, 520, 0.2);
}

/** Kıkırdama / kahkaha (mevcut efekt; güçlüyse iki kez) */
export function kikir(guc = 0.5) {
  kulak.sustur(guc > 0.8 ? 1700 : 1200);
  void resimSesi('kikir');
  if (guc > 0.8) setTimeout(() => void resimSesi('kikir'), 420);
}

/** Civciv "cik cik" ve ayı homurtusu: mevcut hayvan efektleri */
export function cikcik() {
  kulak.sustur(1200);
  void resimSesi('kus');
}
export function ayiSesi() {
  kulak.sustur(1500);
  void resimSesi('ayi');
}
export function yasasin() {
  kulak.sustur(2000);
  void resimSesi('yasasin');
}

/** Kaşık kaseye: tok "klink" */
export function klink() {
  kulak.sustur(300);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  ton(c, o, t, 0.4, 1320, 1300, 0.08);
  ton(c, o, t, 0.25, 2710, 2700, 0.03);
}

/** Buhar/üfleme sönümü: hafif tiz şşş */
export function fis() {
  kulak.sustur(500);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  hisir(c, o, c.currentTime, 0.4, 'highpass', 3500, 5000, 0.05, 0.6);
}

/** Mama fırladı: "pıt" */
export function pit() {
  kulak.sustur(400);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  ton(c, o, c.currentTime, 0.2, 900, 180, 0.18);
}

/** Peçete: yumuşak sürtme */
export function sil() {
  kulak.sustur(250);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  hisir(c, o, c.currentTime, 0.14, 'bandpass', 2200, 1500, 0.05, 1.2);
}

/** Bir şey yerine oturdu: "pop" */
export function pop() {
  kulak.sustur(300);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  ton(c, o, c.currentTime, 0.08, 500, 1100, 0.16);
}

/** Battaniye / perde hışırtısı */
export function hisirti(uzun = false) {
  kulak.sustur(uzun ? 900 : 500);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  hisir(c, o, c.currentTime, uzun ? 0.8 : 0.35, 'bandpass', 1400, 2600, 0.07, 0.8);
}

/** Gece lambası tık + yumuşak parıltı */
export function lambaTik() {
  kulak.sustur(900);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  hisir(c, o, t, 0.03, 'highpass', 3000, 3000, 0.2);
  [84, 88, 91, 96].forEach((m, i) => ton(c, o, t + 0.08 + i * 0.07, 0.5, hz(m), hz(m), 0.03));
}

/** Emzik: cup cup */
export function cup() {
  kulak.sustur(700);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  for (let i = 0; i < 2; i++) ton(c, o, t + i * 0.22, 0.07, 700, 300, 0.12);
}

/** Müzik kutusu notası (tını: sinüs + 3. üst ses, uzun sönüm) */
export function kutuNota(midi: number, ses = 0.12, sn = 1.2) {
  kulak.sustur(sn * 700);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  ton(c, o, t, sn, hz(midi + 12), hz(midi + 12), ses);
  ton(c, o, t, sn * 0.4, hz(midi + 12) * 3.01, hz(midi + 12) * 3.01, ses * 0.22);
}

/** Yıldız yandı: minik çan */
export function yildiz(sira = 0) {
  kulak.sustur(600);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const m = 84 + ((sira * 2) % 12);
  ton(c, o, c.currentTime, 0.6, hz(m), hz(m), 0.035);
}

/** Mino'nun burnu kaşınıyor: "ha… ha… haa…" (yükselen nefes) */
export function haha(kez = 3) {
  kulak.sustur(kez * 600 + 400);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  for (let i = 0; i < kez; i++) {
    hisir(c, o, t + i * 0.55, 0.35 + i * 0.1, 'bandpass', 700 + i * 250, 1200 + i * 400, 0.05 + i * 0.03, 2);
    ton(c, o, t + i * 0.55, 0.3 + i * 0.1, 330 + i * 60, 420 + i * 90, 0.04, 'triangle');
  }
}

/** Kocaman HAPŞU */
export function hapsu() {
  kulak.sustur(1800);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  hisir(c, o, t, 0.25, 'bandpass', 900, 2200, 0.12, 1.5);
  hisir(c, o, t + 0.22, 0.55, 'highpass', 5000, 2000, 0.45, 0.7);
  ton(c, o, t + 0.22, 0.4, 420, 180, 0.22, 'sawtooth');
}

/** Minicik "hıpşu" (civciv sesi gibi) */
export function hipsu() {
  kulak.sustur(700);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  const t = c.currentTime;
  ton(c, o, t, 0.08, 1400, 1900, 0.08);
  hisir(c, o, t + 0.08, 0.14, 'highpass', 6000, 7000, 0.07, 0.7);
}

/** Tutma sırasında (gözler şişer, kulaklar titrer): gerilen hım */
export function zorlan() {
  kulak.sustur(1200);
  const h = hazir();
  if (!h) return;
  const [c, o] = h;
  ton(c, o, c.currentTime, 1, 180, 260, 0.05, 'triangle');
}

export function hazirla() {
  ['kikir', 'kus', 'ayi', 'yasasin'].forEach(resimSesiHazirla);
}

// ---------------------------------------------------------------- müzik
/**
 * Oyuncaklı, hafif akşam müziği (sahne 1-5): celesta gibi melodi + yumuşak bas. Müzik kanalından (konuşmada kısılır).
 * `kutu` modunda (sahne 6-7) yalnız müzik kutusuyla ninni ezgisi çalar. Sesli görevlerde durdurulur.
 */
const MELODI = [
  72, 0, 76, 0, 79, 0, 76, 0, 74, 0, 77, 0, 76, 74, 72, 0,
  71, 0, 74, 0, 77, 0, 74, 0, 72, 0, 76, 0, 74, 0, 0, 0,
  69, 0, 72, 0, 76, 0, 72, 0, 71, 0, 74, 0, 72, 71, 69, 0,
  67, 0, 71, 0, 74, 0, 72, 71, 72, 0, 0, 0, 0, 0, 0, 0,
];
const BAS = [48, 43, 45, 43];

export class EgeMuzik {
  private zaman: number | undefined;
  private sonraki = 0;
  private adim = 0;
  private kutuNotalar: { midi: number; vurus: number }[] = [];
  private readonly vurus = 60 / 92 / 2;
  get caliyor() {
    return this.zaman !== undefined;
  }
  /** Oyuncaklı müzik */
  baslat() {
    this.kutuNotalar = [];
    this.bas();
  }
  /** Müzik kutusu: verilen ezgiyi döngüde yavaşça çalar */
  kutu(notalar: { midi: number; vurus: number }[]) {
    this.durdur();
    this.kutuNotalar = notalar;
    this.bas();
  }
  private bas() {
    const c = baglam();
    if (!c || this.zaman !== undefined) return;
    this.sonraki = c.currentTime + 0.1;
    this.adim = 0;
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
      if (this.kutuNotalar.length) {
        const n = this.kutuNotalar[this.adim % (this.kutuNotalar.length + 2)];
        const v = 0.9;
        if (n) {
          ton(c, o, t, 1.4, hz(n.midi + 12), hz(n.midi + 12), 0.04);
          ton(c, o, t, 0.5, hz(n.midi + 12) * 3.01, hz(n.midi + 12) * 3.01, 0.009);
        }
        this.sonraki += (n?.vurus ?? 1) * v;
      } else {
        const m = MELODI[this.adim % MELODI.length];
        if (m) {
          ton(c, o, t, 0.7, hz(m + 12), hz(m + 12), 0.028);
          ton(c, o, t, 0.25, hz(m + 12) * 4, hz(m + 12) * 4, 0.005);
        }
        if (this.adim % 8 === 0) ton(c, o, t, 0.9, hz(BAS[Math.floor(this.adim / 16) % BAS.length]), hz(BAS[Math.floor(this.adim / 16) % BAS.length]), 0.05);
        this.sonraki += this.vurus;
      }
      this.adim++;
    }
  }
}
