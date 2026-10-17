/**
 * P6 mini oyunlarının (Yoğur ve Yuvarla, Mangal, Bulaşık; v1.1 Şiş, Sar, Sütlaç) ortakları: küçük sentez sesleri
 * (Web Audio, dosya yok), lokantaya gizli sürpriz haberi (bağımsız: lokanta dosyası import edilmez), bekleme.
 * Ortak hareketler P2'nin dogra/efekt.ts'i, raf ve elde tutma P5'in kir-cirp/ortak.ts'i (yeniden yazılmaz).
 */
import { baglam, efektCikisi } from '../../../../src/audio/motor';
import { h, TEST_MODU } from '../../../../src/ui/dom';
import lokumKit from '../../../../assets/karakter/lokum/lokum.json';
import kinoKit from '../../../../assets/karakter/kino-yeni/kino-yeni.json';
import babaanneKit from '../../../../assets/karakter/babaanne/babaanne.json';
import './ortak.css';

export const sureMs = (ms: number) => (TEST_MODU ? Math.min(ms, 40) : ms);
export const bekle = (ms: number) => new Promise<void>((r) => window.setTimeout(r, sureMs(ms)));

/**
 * Lokantaya gizli sürpriz haberi (§9): mini oyun kendi kökünden kabarcıklanan bir olay atar; lokanta (surpriz.ts)
 * dinler. Lokanta yoksa (deneme sayfası) kimse duymaz, oyun sürer. ad: 'kino-isli' (mangal dumanı) ...
 */
export function surprizBildir(kok: HTMLElement, ad: string) {
  kok.dispatchEvent(new CustomEvent('rs-surpriz', { bubbles: true, detail: { ad } }));
}

// ------------------------------------------------------------------ sentez

function hazir(): [AudioContext, GainNode] | null {
  const c = baglam();
  const o = efektCikisi();
  if (!c || !o || c.state !== 'running') return null;
  return [c, o];
}
let gurultuT: AudioBuffer | null = null;
export function gurultu(bas: number, sure: number, f1: number, f2: number, ses: number, q = 1, tip: BiquadFilterType = 'bandpass') {
  const hz = hazir();
  if (!hz) return;
  const [c, cikis] = hz;
  if (!gurultuT) {
    gurultuT = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = gurultuT.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = c.currentTime + bas;
  const s = c.createBufferSource();
  s.buffer = gurultuT;
  const f = c.createBiquadFilter();
  f.type = tip;
  f.Q.value = q;
  f.frequency.setValueAtTime(f1, t);
  f.frequency.exponentialRampToValueAtTime(f2, t + sure);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(ses, t + Math.min(0.012, sure * 0.25));
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  s.connect(f).connect(g).connect(cikis);
  s.start(t, Math.random() * 0.5);
  s.stop(t + sure + 0.05);
}
export function ton(frek: number, bas: number, sure: number, tip: OscillatorType, ses: number, bitis?: number) {
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
  g.gain.exponentialRampToValueAtTime(ses, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  o.connect(g).connect(cikis);
  o.start(t);
  o.stop(t + sure + 0.05);
}
const NOTA = (n: number) => 440 * Math.pow(2, (n - 69) / 12);
export const nota = (n: number, bas: number, sure: number, tip: OscillatorType = 'triangle', ses = 0.1, kay?: number) => ton(NOTA(n), bas, sure, tip, ses, kay ? NOTA(n + kay) : undefined);

export const p6Ses = {
  /** harç sıkıştırma: ıslak "vıcık" (perde: kaçıncı sıkma) */
  vicik(perde = 1) {
    gurultu(0, 0.12, 420 * perde, 1300 * perde, 0.2, 1.4, 'lowpass');
    ton(180 * perde, 0.01, 0.1, 'sine', 0.08, 360 * perde);
    gurultu(0.09, 0.07, 900 * perde, 500 * perde, 0.1, 1.2, 'lowpass');
  },
  /** harçtan avuç kopar: "şlop" */
  slop() {
    gurultu(0, 0.16, 300, 1400, 0.22, 1, 'lowpass');
    ton(140, 0.02, 0.12, 'sine', 0.08, 300);
  },
  /** avuçta yuvarlanma: yumuşak "fır" (perde: hız) */
  fir(perde = 1) {
    gurultu(0, 0.07, 700 * perde, 400 * perde, 0.07, 0.9, 'lowpass');
  },
  /** bastırma: tok "pat" */
  pat(guc = 1) {
    gurultu(0, 0.1, 500, 160, 0.26 * guc, 0.8, 'lowpass');
    ton(110, 0, 0.09, 'sine', 0.12 * guc, 70);
  },
  /** krep: ince "flap" */
  flap() {
    gurultu(0, 0.12, 2400, 700, 0.18, 1.2);
    ton(520, 0.02, 0.1, 'triangle', 0.06, 330);
  },
  /** boş kâse: metal "tink" */
  tink(perde = 1) {
    ton(1800 * perde, 0, 0.22, 'sine', 0.08, 1700 * perde);
    ton(2700 * perde, 0, 0.12, 'sine', 0.03);
  },
  /** sıra sıra boing (ödül): i. köfte bir yarım ton yukarı */
  boing(i = 0) {
    ton(NOTA(62 + i * 2), 0, 0.22, 'sine', 0.16, NOTA(74 + i * 2));
  },
  /** maşa: metal "tık tık" */
  masa() {
    ton(2300, 0, 0.05, 'triangle', 0.07, 2000);
    ton(2900, 0.06, 0.04, 'triangle', 0.05, 2600);
  },
  /** yelpaze: "vuş" (yön değişimi) */
  vus(guc = 1) {
    gurultu(0, 0.2, 500, 1600, 0.12 * guc, 0.7, 'bandpass');
  },
  /** köz canlanır: alev "fuf" */
  fuf() {
    gurultu(0, 0.35, 260, 900, 0.16, 0.7, 'lowpass');
  },
  /** öksürük: "öhö öhö" */
  oksur() {
    for (let i = 0; i < 2; i++) {
      gurultu(i * 0.26, 0.11, 900, 500, 0.24, 2.2, 'bandpass');
      ton(240, i * 0.26, 0.09, 'sawtooth', 0.04, 170);
    }
  },
  /** sünger ovma: gıcır "şık" */
  sik(perde = 1) {
    gurultu(0, 0.05, 5200 * perde, 3800 * perde, 0.08, 3);
  },
  /** temiz tabak gıcırtısı: ince yükselen "gıııc" */
  gicir() {
    ton(1600, 0, 0.18, 'sine', 0.05, 2600);
    ton(3200, 0.02, 0.12, 'sine', 0.025, 4200);
  },
  /** tabak rafa: porselen "tın" */
  tin(i = 0) {
    ton(NOTA(84 + (i % 4) * 2), 0, 0.3, 'sine', 0.09);
    ton(NOTA(96 + (i % 4) * 2), 0.005, 0.18, 'sine', 0.03);
  },
  /** köpük balonu patlar: "pıt" */
  pit(perde = 1) {
    ton(1100 * perde, 0, 0.05, 'sine', 0.12, 1900 * perde);
  },
  /** kıkırdama */
  kikir() {
    [79, 81, 79, 83].forEach((n, i) => nota(n, i * 0.08, 0.07, 'triangle', 0.07));
  },
  /** ödül ezgisi: oyuna özel kısa cümle */
  ezgi(dizi: number[], ara = 0.1) {
    dizi.forEach((n, i) => nota(n, i * ara, 0.18, 'triangle', 0.1));
    nota(dizi[dizi.length - 1] + 12, dizi.length * ara + 0.05, 0.35, 'sine', 0.07);
  },
};

// ------------------------------------------------------------------ kukla kitinden yalnız baş (Lokum, Kino)

interface KitP {
  kutu: [number, number, number, number];
}
interface KitJ {
  boyut: [number, number];
  parcalar: Record<string, KitP>;
  sira: string[];
}
export type KafaKim = 'lokum' | 'kino' | 'babaanne';
const KAFA_KIT: Record<KafaKim, { j: KitJ; klasor: string }> = {
  lokum: { j: lokumKit as unknown as KitJ, klasor: 'lokum' },
  kino: { j: kinoKit as unknown as KitJ, klasor: 'kino-yeni' },
  babaanne: { j: babaanneKit as unknown as KitJ, klasor: 'babaanne' },
};
const KAFA_PARCA = import.meta.glob<string>('../../../../assets/karakter/{lokum,kino-yeni,babaanne}/*.webp', { eager: true, query: '?url', import: 'default' });
const KAFA_ADI = /^(kafa|kulak|yanak|burun|gozler-|kaslar-|agiz-|gozluk)/;

/**
 * Kukla kitinin yalnız başı (kulaklar dahil): köpük balonunun içinde Lokum, pencerede Kino ... Kutusunu doldurur,
 * oranı korur (contain gibi). Parça döndürme yok: yalnız yüz değişimi (göz, ağız).
 */
export function kafaEl(kim: KafaKim): { el: HTMLElement; yuz(goz: string, agiz: string): void; oran: number; kaynakEn: number } {
  const { j, klasor } = KAFA_KIT[kim];
  const adlar = j.sira.filter((a) => KAFA_ADI.test(a) && j.parcalar[a]);
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const a of adlar) {
    if (/^(gozler|kaslar|agiz)-|^gozluk/.test(a)) continue;
    const [x, y, w, hh] = j.parcalar[a].kutu;
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x + w);
    y1 = Math.max(y1, y + hh);
  }
  const W = x1 - x0;
  const H = y1 - y0;
  const ic = h('div.rs-p6-kafa-ic', { style: `aspect-ratio:${W}/${H}` });
  const el = h('div.rs-p6-kafa', { 'data-kim': kim, 'aria-hidden': 'true' }, ic);
  const imgler = new Map<string, HTMLImageElement>();
  for (const a of adlar) {
    const u = KAFA_PARCA[`../../../../assets/karakter/${klasor}/${a}.webp`];
    if (!u) continue;
    const [x, y, w, hh] = j.parcalar[a].kutu;
    const img = h('img', { src: u, alt: '', draggable: 'false', style: `position:absolute;left:${((x - x0) / W) * 100}%;top:${((y - y0) / H) * 100}%;width:${(w / W) * 100}%;height:${(hh / H) * 100}%` }) as HTMLImageElement;
    imgler.set(a, img);
    ic.append(img);
  }
  const yuz = (goz: string, agiz: string) => {
    const gozVar = imgler.has(`gozler-${goz}`);
    const agizVar = imgler.has(`agiz-${agiz}`);
    for (const [a, img] of imgler) {
      if (a.startsWith('gozler-')) img.hidden = a !== `gozler-${gozVar ? goz : 'acik'}`;
      else if (a.startsWith('agiz-')) img.hidden = a !== `agiz-${agizVar ? agiz : 'gulumse'}`;
      else if (a.startsWith('kaslar-')) img.hidden = a !== 'kaslar-notr';
    }
  };
  yuz('acik', 'gulumse');
  return { el, yuz, oran: W / H, kaynakEn: W };
}
