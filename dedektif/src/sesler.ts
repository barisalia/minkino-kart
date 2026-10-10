/**
 * Dedektif Mino küçük sesleri (Web Audio sentezi, dosya yok; ortak efekt ses düzeyine bağlı): büyüteç ışıltısı, ipucu
 * "ting"i, "buldun" patlaması, kartın ipucuna "tık" diye oturması, sekme, zürafanın tavana "tok"u, ördeğin "vak"ı,
 * horlama, koklama, iz notaları, lambanın düğmesi, "Bu bir vaka!" vuruşu, kamera geçişi.
 * Fon müziği: assets/muzik/film-merak.mp3 (araştırırken kısık döngü), film-kutlama (final), film-surpriz (Pamuk).
 */
import { DosyaMuzik } from '../../src/audio/dosya-muzik';
import { baglam, efektCikisi, muzikCikisi, sesMotorunuAc } from '../../src/audio/motor';
import { muzikAyarUygula } from '../../src/audio/muzik';
import { TEST_MODU } from '../../src/ui/dom';

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

/** Çan gibi tatlı nota (harmonikli) */
function can(frek: number, bas: number, ses = 0.16, sure = 0.5) {
  ton(frek, bas, sure, 'sine', ses);
  ton(frek * 2, bas, sure * 0.6, 'sine', ses * 0.35);
  ton(frek * 3.01, bas, sure * 0.3, 'triangle', ses * 0.1);
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
  g.gain.exponentialRampToValueAtTime(ses, t + Math.min(0.02, sure * 0.25));
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  s.connect(f).connect(g).connect(cikis);
  s.start(t, Math.random() * 0.5);
  s.stop(t + sure + 0.05);
}

export const NOTA = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

export const ses = {
  /** büyüteç bir ipucuna yaklaştı: ince kristal pırıltı (yakınlık arttıkça yüksek) */
  isilti(oran: number) {
    can(NOTA(88 + Math.round(oran * 7)), 0, 0.035, 0.18);
  },
  /** ipucu merceğin içine girdi: "ting" + parıltı */
  ting() {
    can(NOTA(93), 0, 0.16, 0.6);
    can(NOTA(100), 0.07, 0.1, 0.5);
    gurultu(0, 0.25, 6000, 9000, 0.04, 2, 'highpass');
  },
  /** "Buldun!": ipucu büyür ve dosyaya uçar */
  buldun() {
    ton(240, 0, 0.12, 'sine', 0.22, 520);
    [79, 84, 88, 91].forEach((n, i) => can(NOTA(n), 0.06 + i * 0.06, 0.13, 0.4));
  },
  /** dosyaya yapıştı */
  yapis() {
    ton(300, 0, 0.08, 'sine', 0.2, 120);
    gurultu(0, 0.06, 2500, 1300, 0.08, 2);
  },
  /** kart eline alındı / bırakıldı */
  kart() {
    gurultu(0, 0.09, 1400, 3600, 0.08, 1.2);
  },
  /** kart ipucuna tam oturdu: "tık" + çan */
  tik() {
    ton(1600, 0, 0.04, 'square', 0.05, 900);
    can(NOTA(84), 0.03, 0.16, 0.5);
    can(NOTA(91), 0.1, 0.12, 0.6);
  },
  /** yanlış kart ipucuna oturmadı: yumuşak sekme (ceza değil) */
  sek() {
    ton(330, 0, 0.18, 'sine', 0.16, 180);
    ton(200, 0.12, 0.2, 'sine', 0.12, 260);
  },
  /** zürafanın boynu uzar (kayan ıslık) */
  uza() {
    ton(220, 0, 0.7, 'triangle', 0.1, 880);
  },
  /** tavana "tok" */
  tok() {
    ton(180, 0, 0.12, 'square', 0.12, 90);
    gurultu(0, 0.08, 900, 300, 0.18, 1.4);
    [96, 100].forEach((n, i) => can(NOTA(n), 0.1 + i * 0.08, 0.05, 0.3));
  },
  /** ördeğin "vak"ı (burundan, kısa) */
  vak() {
    ton(520, 0, 0.16, 'sawtooth', 0.07, 380);
    ton(780, 0, 0.12, 'square', 0.03, 560);
  },
  /** horlama: hırr … fıss */
  horla() {
    gurultu(0, 0.7, 180, 320, 0.16, 3, 'lowpass');
    gurultu(0.85, 0.6, 2400, 1200, 0.05, 1);
  },
  /** başını iki yana sallar */
  hmm() {
    ton(392, 0, 0.12, 'sine', 0.09, 370);
    ton(392, 0.16, 0.14, 'sine', 0.09, 330);
  },
  /** Kino koklar: üç kısa burun sesi */
  kokla() {
    for (let i = 0; i < 3; i++) gurultu(i * 0.16, 0.09, 2600, 4200, 0.07, 3);
  },
  /** iz notası (marimba gibi) */
  iz(nota: number) {
    ton(NOTA(nota), 0, 0.3, 'triangle', 0.16);
    ton(NOTA(nota + 12), 0, 0.14, 'sine', 0.06);
  },
  /** "Bu bir vaka!": dan dan DAAN (şakacı) */
  vaka() {
    [
      [55, 0],
      [58, 0.18],
      [62, 0.36],
    ].forEach(([n, t], i) => {
      ton(NOTA(n), t, i === 2 ? 0.7 : 0.16, 'triangle', 0.13);
      ton(NOTA(n - 12), t, i === 2 ? 0.7 : 0.16, 'sine', 0.12);
    });
    gurultu(0.36, 0.5, 5000, 8000, 0.04, 1, 'highpass');
  },
  /** şapka kafaya oturdu: "pop" */
  pop() {
    ton(300, 0, 0.1, 'sine', 0.2, 700);
    can(NOTA(86), 0.05, 0.08, 0.3);
  },
  /** Kino kayıp halıya çarpar */
  kay() {
    gurultu(0, 0.5, 700, 2400, 0.12, 0.8);
  },
  bum() {
    ton(140, 0, 0.18, 'sine', 0.3, 60);
    gurultu(0, 0.12, 600, 200, 0.12, 0.8, 'lowpass');
  },
  /** kamera bir yere kayar / oda değişir */
  vuus() {
    gurultu(0, 0.45, 500, 2600, 0.07, 0.9);
  },
  /** lamba sallanır, devrilir */
  sallan() {
    ton(660, 0, 0.08, 'triangle', 0.06, 620);
    ton(600, 0.12, 0.08, 'triangle', 0.06, 640);
  },
  devril() {
    gurultu(0, 0.25, 1200, 300, 0.1, 0.8);
    ton(160, 0.2, 0.2, 'sine', 0.2, 70);
  },
  /** lambanın düğmesi: tık + ışık */
  dugme() {
    ton(2200, 0, 0.03, 'square', 0.05, 1600);
    [72, 79, 84, 88, 91].forEach((n, i) => can(NOTA(n), 0.08 + i * 0.07, 0.1, 0.6));
  },
  /** çizgi roman karesi belirir */
  kare(i: number) {
    gurultu(0, 0.08, 1800, 3600, 0.08, 1.2);
    can(NOTA([76, 79, 84, 88][i % 4]), 0.04, 0.14, 0.45);
  },
  /** "Çözüldü!" mührü */
  muhur() {
    ton(160, 0, 0.14, 'sine', 0.32, 70);
    gurultu(0, 0.1, 1200, 400, 0.14, 0.8, 'lowpass');
    [84, 88, 91, 96].forEach((n, i) => can(NOTA(n), 0.12 + i * 0.07, 0.12, 0.5));
  },
  /** kelebek kanadı */
  kanat() {
    gurultu(0, 0.12, 1800, 3200, 0.03, 0.9);
  },
  // ---------------------------------------------------------------- Vaka 2
  /** rüzgâr uğultusu (yapraklar uçuşur) */
  ruzgar(guc = 1) {
    gurultu(0, 1.3, 300, 1400, 0.09 * guc, 0.7);
    gurultu(0.25, 1.1, 900, 400, 0.05 * guc, 1.2);
  },
  /** çalı hışırtısı (dokununca sallanır) */
  hisirti() {
    for (let i = 0; i < 3; i++) gurultu(i * 0.07, 0.12, 3200, 5200, 0.05, 1.4);
  },
  /** kurbağa: "vırak!" (kalın, titrek) */
  virak(yuksek = false) {
    const v = yuksek ? 1.5 : 1;
    ton(160, 0, 0.09, 'sawtooth', 0.09 * v, 120);
    ton(150, 0.11, 0.2, 'sawtooth', 0.11 * v, 105);
    ton(300, 0.11, 0.18, 'square', 0.03 * v, 210);
  },
  /** arı: "vıjjj" (vızıltı: titreşen testere) */
  vizz(yuksek = false) {
    const h = hazir();
    if (!h) return;
    const [c, cikis] = h;
    const t = c.currentTime;
    const o = c.createOscillator();
    const lfo = c.createOscillator();
    const lg = c.createGain();
    const g = c.createGain();
    const f = c.createBiquadFilter();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(230, t);
    o.frequency.linearRampToValueAtTime(260, t + 0.45);
    o.frequency.linearRampToValueAtTime(215, t + 0.9);
    lfo.frequency.value = 24;
    lg.gain.value = 14;
    lfo.connect(lg).connect(o.frequency);
    f.type = 'bandpass';
    f.frequency.value = 900;
    f.Q.value = 1.2;
    const s = yuksek ? 0.14 : 0.09;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(s, t + 0.06);
    g.gain.setValueAtTime(s, t + 0.75);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.95);
    o.connect(f).connect(g).connect(cikis);
    o.start(t);
    lfo.start(t);
    o.stop(t + 1);
    lfo.stop(t + 1);
  },
  /** ördek: "vak… vak", ardından minik "çıt çıt" (yumurta kabuğu) */
  vakvak(yuksek = false, kabuk = true) {
    const v = yuksek ? 1.6 : 1;
    ton(520, 0, 0.16, 'sawtooth', 0.07 * v, 380);
    ton(780, 0, 0.12, 'square', 0.03 * v, 560);
    ton(500, 0.34, 0.18, 'sawtooth', 0.07 * v, 360);
    ton(760, 0.34, 0.13, 'square', 0.03 * v, 540);
    if (kabuk) for (const t of [0.78, 0.92]) ton(3200, t, 0.025, 'square', 0.04 * v, 2400);
  },
  /** yumurta "çıt" (n: kaçıncı dokunuş, gittikçe güçlü) */
  cit(n = 1) {
    ton(2600 - n * 200, 0, 0.03, 'square', 0.05 + n * 0.02, 1800);
    gurultu(0.01, 0.05, 4000, 2500, 0.05 + n * 0.02, 2);
  },
  /** yumurta "ÇAT!" ve civciv sevinci */
  cat() {
    ton(1400, 0, 0.05, 'square', 0.12, 700);
    gurultu(0, 0.18, 3000, 900, 0.18, 1);
    [84, 88, 91, 96].forEach((n, i) => can(NOTA(n), 0.15 + i * 0.07, 0.12, 0.45));
    // üç minik "cik"
    [0.5, 0.62, 0.74].forEach((t, i) => ton(2400 + i * 200, t, 0.07, 'sine', 0.08, 3000));
  },
  /** makas "şıp şıp" */
  makas() {
    for (const t of [0, 0.2]) {
      ton(3000, t, 0.03, 'square', 0.05, 1800);
      gurultu(t, 0.05, 5000, 3000, 0.06, 2);
    }
  },
  /** üşüyen yumurtalar: "brrr" titreme */
  brr() {
    for (let i = 0; i < 6; i++) ton(170 + (i % 2) * 20, i * 0.07, 0.06, 'triangle', 0.05);
  },
  /** sıcacık: atkı yumurtalara örtüldü */
  sicak() {
    [72, 76, 79, 84].forEach((n, i) => can(NOTA(n), i * 0.09, 0.11, 0.6));
  },
  // ---------------------------------------------------------------- Vaka 3
  /** kapının sürgüsü: "tak" */
  tak() {
    ton(900, 0, 0.04, 'square', 0.09, 500);
    gurultu(0, 0.06, 1800, 700, 0.12, 1.2);
    ton(180, 0.01, 0.12, 'sine', 0.2, 90);
  },
  /** baca kapağından buhar: "fıss" */
  fiss() {
    gurultu(0, 0.7, 5200, 2600, 0.07, 0.8, 'highpass');
  },
  /** kuyruk içeri kaçar: "fırr" */
  firr() {
    gurultu(0, 0.28, 900, 3400, 0.09, 1.4);
    ton(520, 0, 0.22, 'triangle', 0.05, 1100);
  },
  /** yanaklar boşalır: "pof" */
  pof() {
    ton(240, 0, 0.12, 'sine', 0.26, 110);
    gurultu(0, 0.1, 900, 300, 0.1, 0.7, 'lowpass');
  },
  /** çiğneme: "hap hap" */
  hapHap() {
    for (const t of [0, 0.22]) {
      ton(330, t, 0.07, 'triangle', 0.1, 220);
      gurultu(t, 0.06, 1400, 700, 0.06, 1.1);
    }
  },
  /** uyuyan baykuş: "hu" */
  hu() {
    ton(392, 0, 0.42, 'sine', 0.12, 370);
    ton(330, 0.5, 0.5, 'sine', 0.1, 300);
  },
  /** kırıntı fışkırması: minik "pıt" */
  pit() {
    ton(1500, 0, 0.04, 'triangle', 0.06, 900);
  },
};

// ---------------------------------------------------------------- müzik (dosyadan)
const MUZIK = import.meta.glob<string>('../../assets/muzik/{film-merak,film-kutlama,film-surpriz}.mp3', { eager: true, query: '?url', import: 'default' });
const muzikAdres = (ad: string) => MUZIK[`../../assets/muzik/${ad}.mp3`] ?? null;

/** Araştırma fonu: kısık döngü (konuşurken daha da kısılır) */
export class Fon {
  private m = new DosyaMuzik(muzikAdres('film-merak'), 0.22);
  baslat() {
    this.m.baslat();
  }
  durdur() {
    this.m.durdur();
  }
}

/** Tek seferlik müzik (sürpriz, kutlama): müzik kanalından (ayara ve sessize almaya uyar) */
const tamponlar = new Map<string, Promise<AudioBuffer | null>>();
/** Döner: durdur (ekran kapanınca: henüz yüklenmediyse hiç çalmaz, çalıyorsa kesilir) */
export function muzikCal(ad: 'film-kutlama' | 'film-surpriz', duzey = 0.5): () => void {
  const url = muzikAdres(ad);
  if (!url || TEST_MODU) return () => undefined;
  const c = sesMotorunuAc();
  const kanal = muzikCikisi();
  if (!c || !kanal) return () => undefined;
  let durdu = false;
  let kaynak: AudioBufferSourceNode | null = null;
  muzikAyarUygula();
  let p = tamponlar.get(url);
  if (!p) {
    p = fetch(url)
      .then((r) => r.arrayBuffer())
      .then((b) => c.decodeAudioData(b))
      .catch(() => null);
    tamponlar.set(url, p);
  }
  void p.then((b) => {
    if (!b || durdu || c.state === 'closed') return;
    const s = c.createBufferSource();
    const g = c.createGain();
    g.gain.value = duzey;
    s.buffer = b;
    s.connect(g).connect(kanal);
    s.start();
    s.onended = () => g.disconnect();
    kaynak = s;
  });
  return () => {
    durdu = true;
    try {
      kaynak?.stop();
    } catch {
      /* zaten bitti */
    }
    kaynak = null;
  };
}
