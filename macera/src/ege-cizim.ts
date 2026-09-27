/**
 * Bölüm 2 (Şşş, Ege Uyuyor!) görselleri.
 * Sıra: assets/ege/<ad>.webp (tasarımcının temiz kesimi) → assets/ege-gecici/<ad>.webp (scripts/ege/gecici-kes.mjs)
 * → mevcut bir görsel (ör. banyo/ordek) → stil kuralına uygun sade SVG yer tutucu. Görsel gelince kod değişmez.
 * El kuklaları iki katman: gövde + ağız/gaga (assets/ege/kukla-hizalama.json), ağız sesin gücüyle açılıp kapanır.
 */
import { h } from '../../src/ui/dom';
import { adres } from './gorsel';

const K = '#4b1917';
const GORSEL = import.meta.glob<string>(['../../assets/ege/*.webp', '../../assets/ege-gecici/*.webp', '../../assets/banyo/*.webp'], { eager: true, query: '?url', import: 'default' });

/** Görselin adresi (yoksa '') */
export function egeAdres(ad: string, yedek?: string): string {
  return GORSEL[`../../assets/ege/${ad}.webp`] ?? GORSEL[`../../assets/ege-gecici/${ad}.webp`] ?? (yedek ? GORSEL[`../../assets/${yedek}.webp`] ?? adres(yedek) : '') ?? '';
}

/** Anne çizimi: tasarımcının temiz kesimi gelince assets/ege/anne.webp; pozlar gelince assets/ege/anne-<poz>.webp */
export const ANNE_GORSEL = 'anne';
export type AnnePoz = 'ayakta' | 'uyuyor' | 'gulumsuyor' | 'sariliyor';
/** Pozun kendi çizimi var mı (yoksa ayakta çizimi döndürülüp eğilerek kullanılır) */
export const annePozVar = (p: AnnePoz) => p !== 'ayakta' && !!GORSEL[`../../assets/ege/${ANNE_GORSEL}-${p}.webp`];

/** Yer tutucular: [viewBox en, boy, içerik] (yalnız görsel yoksa) */
const SVG: Record<string, [number, number, string]> = {
  besik: [260, 206, `<path d="M20 60Q20 20 60 24L200 24Q240 20 240 60Q240 150 130 156Q20 150 20 60Z" fill="#d9a878" stroke="${K}" stroke-width="7"/><ellipse cx="130" cy="62" rx="96" ry="22" fill="#f6e3b8" stroke="${K}" stroke-width="6"/><path d="M20 190Q130 150 240 190" fill="none" stroke="${K}" stroke-width="9" stroke-linecap="round"/><path d="M70 150L60 184M190 150L200 184" stroke="${K}" stroke-width="8"/>`],
  'mama-sandalyesi': [180, 240, `<rect x="40" y="10" width="100" height="120" rx="40" fill="#f4f4f4" stroke="${K}" stroke-width="6"/><rect x="14" y="110" width="152" height="24" rx="12" fill="#fff" stroke="${K}" stroke-width="6"/><path d="M90 134V214M50 226H130" stroke="${K}" stroke-width="12" stroke-linecap="round"/>`],
  kase: [175, 140, `<path d="M10 40H165Q160 130 88 132Q15 130 10 40Z" fill="#4c5fa8" stroke="${K}" stroke-width="7"/><ellipse cx="88" cy="40" rx="78" ry="18" fill="#e7c07a" stroke="${K}" stroke-width="6"/>`],
  kasik: [170, 140, `<path d="M20 110Q10 70 50 70Q90 76 76 110Q60 130 20 110Z" fill="#eef1f3" stroke="${K}" stroke-width="6"/><path d="M70 86L150 20" stroke="${K}" stroke-width="20" stroke-linecap="round"/><path d="M70 86L150 20" stroke="#f08a3a" stroke-width="10" stroke-linecap="round"/>`],
  onluk: [164, 180, `<path d="M20 20Q82 70 144 20Q160 40 150 60Q170 160 82 170Q-6 160 14 60Q4 40 20 20Z" fill="#fbeeb0" stroke="${K}" stroke-width="6"/>`],
  pecete: [200, 140, `<path d="M10 40L150 14L190 90L50 126Z" fill="#fff" stroke="${K}" stroke-width="6" stroke-linejoin="round"/>`],
  cingirak: [164, 172, `<circle cx="100" cy="64" r="52" fill="#e0525d" stroke="${K}" stroke-width="7"/><path d="M58 110L20 150" stroke="${K}" stroke-width="16" stroke-linecap="round"/><path d="M58 110L20 150" stroke="#a978c9" stroke-width="8" stroke-linecap="round"/>`],
  sepet: [156, 170, `<path d="M20 80H136L124 160H32Z" fill="#d8a45e" stroke="${K}" stroke-width="7" stroke-linejoin="round"/><path d="M36 80Q78 0 120 80" fill="none" stroke="${K}" stroke-width="8"/>`],
  kup: [160, 154, `<rect x="16" y="20" width="124" height="120" rx="14" fill="#c99a6a" stroke="${K}" stroke-width="7"/>`],
  kitap: [220, 134, `<path d="M10 40L160 14L210 60L60 110Z" fill="#d84848" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>`],
  emzik: [130, 156, `<circle cx="65" cy="110" r="36" fill="none" stroke="#a978c9" stroke-width="14"/><ellipse cx="65" cy="70" rx="56" ry="20" fill="#9fd2f2" stroke="${K}" stroke-width="6"/><circle cx="65" cy="36" r="24" fill="#c9c9c9" stroke="${K}" stroke-width="6"/>`],
  'gece-lambasi': [178, 153, `<path d="M20 110A69 80 0 0 1 158 110Z" fill="#9b8fd0" stroke="${K}" stroke-width="7"/><path d="M40 132H138" stroke="${K}" stroke-width="16" stroke-linecap="round"/>`],
  'battaniye-ege': [320, 260, `<path d="M20 90L220 20L300 150L100 230Z" fill="#8fb8e0" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>`],
  'battaniye-anne': [320, 260, `<path d="M20 90L220 20L300 150L100 230Z" fill="#f2a2b4" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>`],
  'perde-kapali': [284, 280, `<path d="M12 20H272V270H12Z" fill="#4a6fa8" stroke="${K}" stroke-width="7"/>`],
  'perde-acik': [284, 280, `<path d="M12 20H80L60 270H12Z M272 20H204L224 270H272Z" fill="#efe3cf" stroke="${K}" stroke-width="7"/>`],
  anne: [266, 720, `<rect x="90" y="330" width="90" height="360" rx="30" fill="#9b9ba6" stroke="${K}" stroke-width="7"/><path d="M70 240Q133 200 196 240L204 400Q133 420 62 400Z" fill="#c898d8" stroke="${K}" stroke-width="7"/><circle cx="133" cy="170" r="80" fill="#e8a27c" stroke="${K}" stroke-width="7"/><circle cx="133" cy="70" r="46" fill="#5a3226" stroke="${K}" stroke-width="7"/><path d="M104 180Q114 186 124 180M142 180Q152 186 162 180" stroke="${K}" stroke-width="6" fill="none" stroke-linecap="round"/>`],
};

/** Eşyanın en/boy oranı (görsel yoksa yer tutucudan) */
export const OLCU: Record<string, [number, number]> = {
  besik: [780, 621],
  'mama-sandalyesi': [537, 723],
  kase: [531, 423],
  kasik: [507, 429],
  onluk: [498, 543],
  pecete: [609, 420],
  cingirak: [498, 522],
  sepet: [474, 513],
  kup: [495, 468],
  kitap: [669, 408],
  emzik: [396, 474],
  'gece-lambasi': [540, 465],
  'battaniye-ege': [972, 789],
  'battaniye-anne': [963, 786],
  'perde-acik': [864, 846],
  'perde-kapali': [858, 849],
  'kukla-ayi': [858, 1005],
  'kukla-civciv': [837, 1014],
  anne: [266, 720],
};
export const oran = (ad: string) => {
  const o = OLCU[ad] ?? (SVG[ad] ? [SVG[ad][0], SVG[ad][1]] : [1, 1]);
  return o[1] / o[0];
};

/** Eşya elemanı: görsel varsa <img>, yoksa yer tutucu SVG; `yedek` verilirse mevcut bir görsel (ör. banyo/ordek) */
export function esya(ad: string, yedek?: string, alt = ''): HTMLElement {
  const url = egeAdres(ad, yedek);
  if (url) return h('img.mc-resim.eg-resim', { src: url, alt, draggable: 'false' });
  const [w, hh, ic] = SVG[ad] ?? SVG.kup;
  return h('div.mc-resim.eg-resim', { html: `<svg viewBox="0 0 ${w} ${hh}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${ic}</svg>`, 'data-yer-tutucu': '1', role: 'img', 'aria-label': alt });
}

/**
 * El kuklası: gövde + ağız (ayı) / alt gaga (civciv) aynı çerçevede. `ac(0..1)` ağzı açar.
 * Katmanlı görsel yoksa tam çizim (kukla-<ad>.webp) bütün olarak kullanılır; ağız açma yerine kukla esner.
 */
export class Kukla {
  readonly el: HTMLElement;
  readonly katmanli: boolean;
  private agiz: HTMLElement | null = null;
  constructor(readonly ad: 'ayi' | 'civciv') {
    const govde = egeAdres(`kukla-${ad}-govde`);
    const agiz = egeAdres(ad === 'ayi' ? 'kukla-ayi-agiz' : 'kukla-civciv-gaga');
    this.katmanli = !!(govde && agiz);
    const ic = h('div.eg-kukla-ic');
    if (this.katmanli) {
      this.agiz = h('img.eg-kukla-agiz', { src: agiz, alt: '', draggable: 'false' });
      ic.append(h('img.mc-resim.eg-resim', { src: govde, alt: '', draggable: 'false' }), this.agiz);
    } else ic.append(esya(`kukla-${ad}`, ad === 'ayi' ? 'hayvanlar/ayi' : 'hayvanlar/civciv'));
    this.el = h(`div.eg-esya.eg-kukla.eg-kukla-${ad}`, {}, ic, h('div.eg-balon'));
    this.ac(0);
  }
  /** Ağız açıklığı 0 (kapalı) … 1 (tam açık) */
  ac(a: number) {
    const s = 0.15 + 0.85 * Math.max(0, Math.min(1, a));
    this.el.style.setProperty('--s', s.toFixed(3));
  }
  get balonEl() {
    return this.el.querySelector<HTMLElement>('.eg-balon')!;
  }
}
