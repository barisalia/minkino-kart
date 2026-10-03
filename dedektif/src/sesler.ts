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
export function muzikCal(ad: 'film-kutlama' | 'film-surpriz', duzey = 0.5) {
  const url = muzikAdres(ad);
  if (!url || TEST_MODU) return;
  const c = sesMotorunuAc();
  const kanal = muzikCikisi();
  if (!c || !kanal) return;
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
    if (!b || c.state === 'closed') return;
    const s = c.createBufferSource();
    const g = c.createGain();
    g.gain.value = duzey;
    s.buffer = b;
    s.connect(g).connect(kanal);
    s.start();
    s.onended = () => g.disconnect();
  });
}
