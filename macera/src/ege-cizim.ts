/**
 * Bölüm 2 (Şşş, Ege Uyuyor!) görselleri.
 * Sıra: assets/ege/<ad>.webp (tasarımcının temiz kesimi) → assets/ege-gecici/<ad>.webp (scripts/ege/gecici-kes.mjs)
 * → mevcut bir görsel (ör. banyo/ordek) → stil kuralına uygun sade SVG yer tutucu. Görsel gelince kod değişmez.
 * El kuklaları iki katman: gövde + ağız/gaga (assets/ege/kukla-hizalama.json), ağız sesin gücüyle açılıp kapanır.
 */
import { h } from '../../src/ui/dom';
import { adres } from './gorsel';
import ANNE_HIZA from '../../assets/ege/anne-hizalama.json';

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
/**
 * Anne pozlarının tuvali (px). Tasarımcı üçünü aynı piksel ölçeğinde çizdi (assets/ege/anne-hizalama.json):
 * oyunda da aynı ölçekle (b / px) çizilir, baş boyu pozdan poza değişmez.
 */
export const ANNE_TUVAL: Record<'ayakta' | 'uyuyor' | 'sariliyor', [number, number]> = {
  ayakta: ANNE_HIZA['anne.webp'].tuval as [number, number],
  uyuyor: ANNE_HIZA['anne-uyuyor'].tuval as [number, number],
  sariliyor: ANNE_HIZA['anne-sariliyor.webp'].tuval as [number, number],
};
/** Uyuyan annenin nefesi: gövde pivot etrafında boyuna uzar, baş boyun noktasıyla birlikte kalkar */
export const ANNE_NEFES = { pivot: ANNE_HIZA['anne-uyuyor'].nefes.pivot as [number, number], boyun: ANNE_HIZA['anne-uyuyor'].nefes.boyunNoktasi as [number, number], olcek: 1.012 };
/** Uyuyan anne gövde + baş katmanlı mı (nefes için) */
export const anneKatmanli = () => !!(GORSEL['../../assets/ege/anne-uyuyor-govde.webp'] && GORSEL['../../assets/ege/anne-uyuyor-bas.webp']);

// ---------------------------------------------------------------- açık battaniyeler (kodla, çizim stiline uygun)
/**
 * Katlı battaniye çizimleri (battaniye-anne / battaniye-ege) örtülünce açılır: aynı renk, aynı desen (kalp / yıldız),
 * aynı fistolu kenar ve kalın kahve kontur. Şekil örtülen gövdeyi sarar; koordinatlar örtülen çizimin tuvalinde.
 */
type Nokta = [number, number];

/** Bir çizgi boyunca fisto: her dilim ayrı yarım daire (gövde üstüne çizilince yalnız dışa taşan yarısı görünür) */
function fistoYolu(noktalar: Nokta[], r: number, yon: 0 | 1): string {
  let d = '';
  for (let i = 1; i < noktalar.length; i++) {
    const [x0, y0] = noktalar[i - 1];
    const [x1, y1] = noktalar[i];
    const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / (r * 2)));
    for (let k = 0; k < n; k++) {
      const ax = x0 + ((x1 - x0) * k) / n;
      const ay = y0 + ((y1 - y0) * k) / n;
      const bx = x0 + ((x1 - x0) * (k + 1)) / n;
      const by = y0 + ((y1 - y0) * (k + 1)) / n;
      const rr = Math.hypot(bx - ax, by - ay) / 2;
      d += `M${ax.toFixed(1)} ${ay.toFixed(1)}A${rr.toFixed(1)} ${(rr * 0.95).toFixed(1)} 0 0 ${yon} ${bx.toFixed(1)} ${by.toFixed(1)}Z`;
    }
  }
  return d;
}

interface OrtuTarif {
  id: string;
  /** gövde: kapalı yol (fisto kenarı hariç) */
  govde: string;
  /** fistolu kenarın noktaları (gövdenin bir kenarı boyunca) */
  fisto: Nokta[];
  fistoR: number;
  /** fistonun taşma yönü (yay yönü; noktaların sırasına göre) */
  fistoYon: 0 | 1;
  /** kıvrım çizgileri */
  kivrim: string[];
  /** parlaklık (elips: cx, cy, rx, ry, açı) */
  parlak: [number, number, number, number, number];
  renk: { acik: string; koyu: string; fisto: string; desen: string };
  desen: 'kalp' | 'yildiz';
  desenOlcek: number;
  kontur: number;
}

function ortuSvg(t: OrtuTarif, vb: [number, number]): string {
  const desen =
    t.desen === 'kalp'
      ? `<path d="M0 -6C-6 -16 -22 -12 -20 1C-18 10 -6 16 0 22C6 16 18 10 20 1C22 -12 6 -16 0 -6Z" fill="${t.renk.desen}"/>`
      : `<path d="M0 -15L4.4 -5.4L15 -4.6L7 2.4L9.4 13L0 7.4L-9.4 13L-7 2.4L-15 -4.6L-4.4 -5.4Z" fill="${t.renk.desen}"/>`;
  const s = t.desenOlcek;
  return `<svg viewBox="0 0 ${vb[0]} ${vb[1]}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="none">
<defs>
  <linearGradient id="${t.id}-g" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="${t.renk.acik}"/><stop offset="1" stop-color="${t.renk.koyu}"/></linearGradient>
  <pattern id="${t.id}-d" width="${92 * s}" height="${84 * s}" patternUnits="userSpaceOnUse" patternTransform="rotate(-14)">
    <g transform="translate(${24 * s} ${22 * s}) scale(${s})">${desen}</g><g transform="translate(${70 * s} ${64 * s}) scale(${s * 0.85}) rotate(12)">${desen}</g>
  </pattern>
  <clipPath id="${t.id}-k"><path d="${t.govde}"/></clipPath>
</defs>
<g class="eg-ortu-govde">
  <path d="${fistoYolu(t.fisto, t.fistoR, t.fistoYon)}" fill="${t.renk.fisto}" stroke="#4b1917" stroke-width="${t.kontur * 0.85}" stroke-linejoin="round"/>
  <path d="${t.govde}" fill="url(#${t.id}-g)"/>
  <path d="${t.govde}" fill="url(#${t.id}-d)" opacity="0.9"/>
  <g clip-path="url(#${t.id}-k)" fill="none" stroke-linecap="round">
    ${t.kivrim.map((k) => `<path d="${k}" stroke="${t.renk.koyu}" stroke-width="${t.kontur * 2.2}" opacity="0.45"/><path d="${k}" stroke="#4b1917" stroke-width="${t.kontur * 0.55}" opacity="0.55"/>`).join('')}
    <ellipse cx="${t.parlak[0]}" cy="${t.parlak[1]}" rx="${t.parlak[2]}" ry="${t.parlak[3]}" transform="rotate(${t.parlak[4]} ${t.parlak[0]} ${t.parlak[1]})" fill="#fff" opacity="0.28"/>
  </g>
  <path d="${t.govde}" fill="none" stroke="#4b1917" stroke-width="${t.kontur}" stroke-linejoin="round"/>
</g>
</svg>`;
}

/**
 * Annenin açık battaniyesi (anne-uyuyor tuvali 781×896): omuzdan ve çenenin altından ayak bileklerine kadar kıvrılmış
 * gövdeyi sarar; baş katmanı (anne-uyuyor-bas) üstte kalır, terlikler dışarıda.
 */
export const ANNE_ORTU_SVG = ortuSvg(
  {
    id: 'eg-ao',
    govde:
      'M178 492C214 468 262 452 318 446C372 440 420 430 462 400C510 366 574 350 642 366C712 384 760 430 786 500C806 560 806 650 792 730C780 790 760 826 738 842' +
      'C640 850 540 846 470 818C420 798 360 780 290 772C240 766 200 758 172 748C158 690 156 610 162 560C166 530 170 510 178 492Z',
    fisto: [[738, 842], [640, 850], [540, 846], [470, 818], [400, 790], [290, 772], [172, 748]],
    fistoR: 17,
    fistoYon: 1,
    kivrim: ['M470 470C520 560 530 660 500 790', 'M620 400C650 500 660 640 640 830', 'M300 520C330 600 340 690 320 770', 'M720 460C745 560 750 680 735 800'],
    parlak: [560, 470, 150, 38, -18],
    renk: { acik: '#f8b9c6', koyu: '#e5859c', fisto: '#fbd3dc', desen: '#d2566f' },
    desen: 'kalp',
    desenOlcek: 1.25,
    kontur: 7,
  },
  [781, 896],
);

/**
 * Ege'nin açık battaniyesi (besik.webp tuvali 780×621): boynundan ayak ucuna, beşiğin içinde yatan Ege'yi örter;
 * alt kenarı fistolu ön kenarın arkasına sokulur (ön katman örter), ayak ucu sağ baş tahtasının arkasına girer.
 * Boyun tarafında katlanmış açık renkli kıvrım (fistolu).
 */
export const EGE_ORTU_SVG = ortuSvg(
  {
    id: 'eg-eo',
    // boyundan göğse kabarır, ayak ucunda küçük bir tümsek (ayaklar altında), sağ baş tahtasının arkasına girer
    govde: 'M262 138C290 106 334 94 380 96C414 98 436 102 452 94C470 70 504 60 524 78C534 90 536 108 536 130L536 330L250 330C246 262 246 190 262 138Z',
    fisto: [[262, 138], [258, 190], [256, 250], [252, 320]],
    fistoR: 13,
    fistoYon: 0,
    kivrim: ['M330 118C352 160 356 210 346 270', 'M446 104C458 150 458 200 450 262', 'M292 130C306 150 310 180 304 210', 'M478 84C490 110 494 140 490 170'],
    parlak: [372, 116, 80, 14, 4],
    renk: { acik: '#a9cdf0', koyu: '#6f9dcf', fisto: '#cfe4f7', desen: '#f5f7fb' },
    desen: 'yildiz',
    desenOlcek: 0.95,
    kontur: 6,
  },
  [780, 621],
);

/** Beşikteki yastık (besik.webp tuvali): Ege'nin başı üstünde durur */
export const YASTIK_SVG = `<svg viewBox="0 0 780 621" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="none">
<defs><linearGradient id="eg-yastik-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffdf4"/><stop offset="1" stop-color="#eadcc0"/></linearGradient></defs>
<path d="M96 170C92 142 118 126 150 128C196 130 240 132 270 140C298 148 304 176 298 208C292 242 262 254 226 254L130 252C100 250 94 226 96 200Z" fill="url(#eg-yastik-g)" stroke="#4b1917" stroke-width="6" stroke-linejoin="round"/>
<path d="M118 150C160 144 214 146 262 156" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity="0.8"/>
<path d="M124 236C170 242 220 242 268 232" fill="none" stroke="#c9b48c" stroke-width="5" stroke-linecap="round" opacity="0.6"/>
</svg>`;

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
  anne: [428, 1143],
  koltuk: [512, 396],
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
