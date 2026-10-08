/**
 * "Elektrikler Kesildi!" eşyaları. Sıra: assets/elektrik/<ad>.webp (tasarımcının çizimi gelince) → mevcut görsel
 * (parti/masa, parti/koltuk, ege/battaniye-anne, ege/gece-lambasi) → stil kuralına uygun, kodla çizilmiş SVG
 * (kalın kahve kontur #3A1210, parlak düz renk, yumuşak degrade, beyaz parlama; ege-cizim.ts üslubu).
 * Görsel gelince kod değişmez.
 *
 * Adobe'den beklenen pozlar (ad sözleşmesi, ekip/senaryo/elektrik.md): assets/elektrik/kino-buzulmus.webp,
 * assets/elektrik/mino-avlaniyor.webp. Yoksa pozlar kodla verilir (elektrik.ts).
 */
import { h } from '../../src/ui/dom';
import { adres } from './gorsel';

const K = '#3a1210';
const GORSEL = import.meta.glob<string>(['../../assets/elektrik/*.webp', '../../assets/ege/*.webp'], { eager: true, query: '?url', import: 'default' });

/** Bölümün kendi görseli (assets/elektrik/<ad>.webp), yoksa yedek yol (ör. 'ege/gece-lambasi', 'parti/masa'), yoksa '' */
export function elAdres(ad: string, yedek?: string): string {
  return GORSEL[`../../assets/elektrik/${ad}.webp`] ?? (yedek ? (GORSEL[`../../assets/${yedek}.webp`] ?? adres(yedek)) : '') ?? '';
}
/** Adobe pozu geldi mi (kino-buzulmus, mino-avlaniyor) */
export const pozVar = (ad: 'kino-buzulmus' | 'mino-avlaniyor') => !!GORSEL[`../../assets/elektrik/${ad}.webp`];

/** Parlama (beyaz, yarı saydam): cx, cy, rx, ry, açı */
const parla = (cx: number, cy: number, rx: number, ry: number, a = -20, o = 0.55) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${a} ${cx} ${cy})" fill="#fff" opacity="${o}"/>`;
const deg = (id: string, a: string, b: string, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;

/**
 * Oyuncak küpler: Oyuncak Sepeti filmiyle aynı boyalı çizimler (assets/film/esya/kup-*.webp, Recraft, kırpılmış;
 * kırmızı daire, sarı yıldız, mavi kalp, yeşil üçgen). Eski kod küpün kutudaki yeri elektrik.css'te (.el-kup img).
 */
const KUP_RESIM = import.meta.glob<string>('../../assets/film/esya/kup-*.webp', { eager: true, query: '?url', import: 'default' });
export type KupRenk = 'kirmizi' | 'sari' | 'mavi' | 'yesil';
export function kupResim(renk: KupRenk): HTMLElement {
  return h('img', { src: KUP_RESIM[`../../assets/film/esya/kup-${renk}.webp`] ?? '', alt: '', draggable: 'false', decoding: 'async' });
}

/** Komodin (iki çekmeceli, ahşap): üst çekmecenin yeri boş (koyu oyuk); çekmece ayrı eleman (cekmeceSvg) */
export const KOMODIN_ORAN = 210 / 220;
/** Üst çekmece oyuğunun komodin kutusundaki yeri (oran): x, y, en, boy */
export const CEKMECE_YER = { x: 30 / 220, y: 62 / 210, w: 160 / 220, h: 52 / 210 };
export const KOMODIN_SVG = `<svg viewBox="0 0 220 210" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${deg('el-km-g', '#dca06a', '#b97a43')}${deg('el-km-u', '#ecc08a', '#d69a60')}</defs>
<g stroke="${K}" stroke-width="6" stroke-linejoin="round">
<path d="M30 186L26 206H46L48 186Z M174 186L176 206H194L190 186Z" fill="#9a5f33"/>
<rect x="16" y="46" width="188" height="144" rx="10" fill="url(#el-km-g)"/>
<rect x="6" y="28" width="208" height="24" rx="10" fill="url(#el-km-u)"/>
<rect x="30" y="62" width="160" height="52" rx="7" fill="#4a2414"/>
<rect x="30" y="124" width="160" height="52" rx="7" fill="#e3a86e"/>
</g>
<circle cx="110" cy="150" r="7" fill="#f6d27a" stroke="${K}" stroke-width="4"/>
<path d="M40 70H180" stroke="#2c1208" stroke-width="10" opacity=".5"/>
<path d="M22 36H120" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".45"/>
<path d="M40 132H150" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".35"/>
</svg>`;
/** Çekmecenin ön yüzü (160×52) */
export const CEKMECE_ON_SVG = `<svg viewBox="0 0 160 52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="none"><defs>${deg('el-co-g', '#eab47a', '#cf9158')}</defs>
<rect x="3" y="3" width="154" height="46" rx="7" fill="url(#el-co-g)" stroke="${K}" stroke-width="6"/>
<circle cx="80" cy="26" r="7" fill="#f6d27a" stroke="${K}" stroke-width="4"/>
<path d="M14 12H110" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".4"/></svg>`;
/** Açık çekmecenin içi (160×40): yandan görünen iç duvarlar */
export const CEKMECE_IC_SVG = `<svg viewBox="0 0 160 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="none">
<path d="M3 38L14 3H146L157 38Z" fill="#6b3a1e" stroke="${K}" stroke-width="5" stroke-linejoin="round"/>
<path d="M14 3L22 34H138L146 3" fill="none" stroke="#3e1d0e" stroke-width="4" opacity=".6"/></svg>`;

/** Yakın çekim: yukarıdan açık çekmece (içi koyu ahşap) */
export const CEKMECE_YAKIN_SVG = `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="none"><defs>
${deg('el-cy-ic', '#7a4424', '#5a2e16')}${deg('el-cy-on', '#eab47a', '#c98a52')}
<pattern id="el-cy-d" width="120" height="30" patternUnits="userSpaceOnUse"><path d="M0 15Q30 8 60 15T120 15" fill="none" stroke="#4a2412" stroke-width="3" opacity=".35"/></pattern></defs>
<path d="M20 20H580L560 330H40Z" fill="url(#el-cy-ic)" stroke="${K}" stroke-width="10" stroke-linejoin="round"/>
<path d="M20 20H580L560 330H40Z" fill="url(#el-cy-d)"/>
<path d="M20 20L58 58H542L580 20" fill="#8a5130" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>
<path d="M58 58L70 318M542 58L530 318" stroke="#3e1d0e" stroke-width="6" opacity=".5"/>
<rect x="14" y="318" width="572" height="70" rx="14" fill="url(#el-cy-on)" stroke="${K}" stroke-width="10"/>
<circle cx="300" cy="353" r="14" fill="#f6d27a" stroke="${K}" stroke-width="7"/>
<path d="M40 334H250" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".4"/></svg>`;

/** Saksı (komodinin üstünde): pembe çiçekli yeşil bitki, altında tabak */
export const SAKSI_ORAN = 150 / 120;
export const SAKSI_SVG = `<svg viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${deg('el-sk-g', '#f28a5c', '#d4623a')}</defs>
<g stroke="${K}" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round">
<path d="M60 90Q58 60 44 40M60 90Q64 58 80 34M60 90V52" fill="none" stroke="#3f7a2e" stroke-width="5"/>
<path d="M44 40Q22 40 20 22Q40 18 44 40Z M80 34Q100 30 104 14Q84 10 80 34Z M52 64Q30 70 22 56Q40 46 52 64Z M68 60Q90 66 98 52Q80 42 68 60Z" fill="#6cc04a"/>
<circle cx="60" cy="44" r="10" fill="#ff7eb6"/><circle cx="60" cy="44" r="4" fill="#ffd84a" stroke-width="3"/>
<path d="M28 88H92L84 136H36Z" fill="url(#el-sk-g)"/>
<rect x="22" y="80" width="76" height="14" rx="5" fill="#f5a07a"/>
<ellipse cx="60" cy="140" rx="40" ry="7" fill="#f5a07a"/>
</g>${parla(40, 106, 4, 13, 8, 0.5)}<path d="M30 84H70" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"/></svg>`;

/** Fener (yatay): kırmızı gövde, sarı başlık, cam; düğme üstte. Yanınca cam parlar (CSS: .yanik) */
export const FENER_ORAN = 80 / 170;
export const FENER_SVG = `<svg viewBox="0 0 170 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${deg('el-fn-g', '#ff6b5f', '#d23a36')}${deg('el-fn-b', '#ffd95c', '#f2a825')}
<radialGradient id="el-fn-c" cx=".45" cy=".45" r=".6"><stop offset="0" stop-color="#fffbe6"/><stop offset="1" stop-color="#bfe3f4"/></radialGradient></defs>
<g stroke="${K}" stroke-width="5" stroke-linejoin="round">
<rect x="10" y="22" width="92" height="36" rx="12" fill="url(#el-fn-g)"/>
<path d="M100 20L132 6H150Q160 6 160 18V62Q160 74 150 74H132L100 60Z" fill="url(#el-fn-b)"/>
<ellipse cx="154" cy="40" rx="8" ry="30" fill="url(#el-fn-c)" class="el-fener-cam"/>
<rect class="el-fener-dugme" x="44" y="12" width="22" height="13" rx="5" fill="#3e9df2"/>
</g>
<path d="M22 30H90" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55"/>
<path d="M110 20L130 12" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".55"/>
<g stroke="${K}" stroke-width="3" opacity=".45"><path d="M24 50V58M36 50V58M48 50V58"/></g></svg>`;

/** Pil: mavi gövde, sarı başlık, artı işareti */
export const PIL_ORAN = 50 / 110;
export const PIL_SVG = `<svg viewBox="0 0 110 50" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${deg('el-pl-g', '#6fb7ff', '#2f6fd6')}</defs>
<g stroke="${K}" stroke-width="4.5" stroke-linejoin="round">
<rect x="8" y="8" width="74" height="34" rx="9" fill="url(#el-pl-g)"/>
<path d="M82 8H92Q98 8 98 14V36Q98 42 92 42H82Z" fill="#ffd84a"/>
<rect x="98" y="17" width="7" height="16" rx="3" fill="#ffe27a"/>
</g>
<path d="M36 25H54M45 16V34" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
<path d="M16 16H70" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".5"/></svg>`;

/** Fırın eldiveni: turuncu-kırmızı, beyaz puantiyeli, askı halkası */
export const ELDIVEN_ORAN = 130 / 110;
export const ELDIVEN_SVG = `<svg viewBox="0 0 110 130" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${deg('el-ed-g', '#ff8a5b', '#e0493d')}</defs>
<g stroke="${K}" stroke-width="5" stroke-linejoin="round">
<path d="M34 118V62Q16 58 12 44Q10 30 22 30Q30 30 36 44V28Q36 8 58 8Q82 8 84 30V118Z" fill="url(#el-ed-g)"/>
<rect x="28" y="104" width="62" height="20" rx="7" fill="#fff4e0"/>
<path d="M80 116Q100 118 98 104" fill="none" stroke-width="4.5"/>
</g>
<g fill="#fff" opacity=".85"><circle cx="54" cy="34" r="5"/><circle cx="70" cy="54" r="5"/><circle cx="50" cy="66" r="5"/><circle cx="68" cy="84" r="5"/><circle cx="48" cy="92" r="4.5"/><circle cx="22" cy="42" r="3.5"/></g>
<path d="M44 18Q54 12 66 14" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".55"/></svg>`;

/** Rende: gümüş, delikli, üstte kırmızı sap */
export const RENDE_ORAN = 130 / 90;
export const RENDE_SVG = `<svg viewBox="0 0 90 130" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${deg('el-rn-g', '#eef3f7', '#aebbc6', 1, 0)}</defs>
<g stroke="${K}" stroke-width="4.5" stroke-linejoin="round">
<path d="M30 26Q30 6 45 6Q60 6 60 26" fill="none" stroke="#e0493d" stroke-width="9"/>
<path d="M30 26Q30 6 45 6Q60 6 60 26" fill="none"/>
<path d="M22 26H68L78 122H12Z" fill="url(#el-rn-g)"/>
</g>
<g fill="${K}" opacity=".7">${Array.from({ length: 5 }, (_, r) => Array.from({ length: 4 }, (_, c) => `<path d="M${26 + c * 12 + r * 0.4} ${40 + r * 16}q4 -5 8 0z"/>`).join('')).join('')}</g>
<path d="M28 34L22 112" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/></svg>`;

/** Duvar saati: ahşap yuvarlak kasa, beyaz kadran, akrep/yelkovan (.el-akrep / .el-yelkovan), sarkaç (.el-sarkac) */
export const SAAT_ORAN = 190 / 120;
export const SAAT_SVG = `<svg viewBox="0 0 120 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${deg('el-st-g', '#d99a5c', '#a8683a')}</defs>
<g class="el-sarkac"><path d="M60 96V160" stroke="${K}" stroke-width="5"/><circle cx="60" cy="166" r="14" fill="#ffd84a" stroke="${K}" stroke-width="5"/>${parla(55, 161, 4, 3, -20, 0.7)}</g>
<g stroke="${K}" stroke-width="5" stroke-linejoin="round">
<circle cx="60" cy="58" r="52" fill="url(#el-st-g)"/>
<circle cx="60" cy="58" r="40" fill="#fffaf0"/>
</g>
<g fill="${K}">${Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2;
  const r = i % 3 ? 2.2 : 3.6;
  return `<circle cx="${(60 + Math.sin(a) * 32).toFixed(1)}" cy="${(58 - Math.cos(a) * 32).toFixed(1)}" r="${r}"/>`;
}).join('')}</g>
<g class="el-akrep"><path d="M60 58V36" stroke="${K}" stroke-width="6" stroke-linecap="round"/></g>
<g class="el-yelkovan"><path d="M60 58L78 66" stroke="#e0493d" stroke-width="4.5" stroke-linecap="round"/></g>
<circle cx="60" cy="58" r="5" fill="${K}"/>
${parla(38, 30, 14, 5, -40, 0.5)}</svg>`;

/** Gıcırtılı lastik kemik */
export const KEMIK_ORAN = 60 / 130;
export const KEMIK_SVG = `<svg viewBox="0 0 130 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${deg('el-kk-g', '#8fd1ff', '#3e9df2')}</defs>
<path d="M28 18Q14 4 8 16Q2 26 14 30Q2 34 8 44Q14 56 28 42H102Q116 56 122 44Q128 34 116 30Q128 26 122 16Q116 4 102 18Z" fill="url(#el-kk-g)" stroke="${K}" stroke-width="5" stroke-linejoin="round"/>
<path d="M30 24H98" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".6"/></svg>`;

/** Sandalye (ahşap, kırmızı minderli); ön görünüş, arkalıklı */
export const SANDALYE_ORAN = 180 / 120;
export const SANDALYE_SVG = `<svg viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${deg('el-sd-g', '#d99a5c', '#b0703e')}</defs>
<g stroke="${K}" stroke-width="5.5" stroke-linejoin="round">
<path d="M24 100V172H36V110M84 110V172H96V100" fill="url(#el-sd-g)"/>
<rect x="22" y="8" width="76" height="16" rx="7" fill="url(#el-sd-g)"/>
<path d="M28 22V96M92 22V96" stroke-width="5.5"/>
<path d="M28 22V96M92 22V96" stroke="#c4854a" stroke-width="2"/>
<rect x="40" y="30" width="40" height="10" rx="4" fill="#c4854a"/>
<rect x="40" y="52" width="40" height="10" rx="4" fill="#c4854a"/>
<rect x="12" y="94" width="96" height="16" rx="7" fill="url(#el-sd-g)"/>
<path d="M16 94Q60 76 104 94Z" fill="#f05a5a"/>
</g>
<path d="M28 13H70" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".5"/>
<path d="M30 90Q52 82 70 84" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".5" fill="none"/></svg>`;

/** Mandal (ahşap, yaylı) */
export const MANDAL_ORAN = 100 / 40;
export function mandalSvg(renk: string): string {
  return `<svg viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<g stroke="${K}" stroke-width="4" stroke-linejoin="round">
<path d="M8 6H19V94Q13 98 8 94Z" fill="${renk}"/>
<path d="M21 6H32V94Q27 98 21 94Z" fill="${renk}"/>
<rect x="5" y="38" width="30" height="12" rx="5" fill="#c9d3dc"/>
</g>
<path d="M12 12V34M25 12V34" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".6"/></svg>`;
}

/** Ayaklı büyük lamba: şapka (.el-lamba-sapka yanınca parlar), direk, ipli düğme (.el-lamba-ip) */
export const LAMBA_ORAN = 420 / 140;
export const LAMBA_SVG = `<svg viewBox="0 0 140 420" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${deg('el-lb-s', '#fff4c9', '#ffd27a')}${deg('el-lb-d', '#c9a27a', '#8a5c38', 1, 0)}</defs>
<g stroke="${K}" stroke-width="6" stroke-linejoin="round">
<ellipse cx="70" cy="404" rx="44" ry="11" fill="#8a5c38"/>
<rect x="64" y="96" width="12" height="304" rx="5" fill="url(#el-lb-d)"/>
<g class="el-lamba-ip"><path d="M96 98V160" fill="none" stroke-width="3.5"/><circle cx="96" cy="166" r="7" fill="#ffd84a" stroke-width="4"/></g>
<path class="el-lamba-sapka" d="M36 12H104L132 102H8Z" fill="url(#el-lb-s)"/>
<path d="M8 102Q70 118 132 102" fill="none" stroke-width="5"/>
</g>
<g fill="#ff9fb8" opacity=".75"><circle cx="46" cy="60" r="5"/><circle cx="72" cy="40" r="5"/><circle cx="96" cy="66" r="5"/><circle cx="60" cy="86" r="4"/><circle cx="110" cy="92" r="4"/><circle cx="30" cy="92" r="4"/></g>
<path d="M44 22L28 90" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".6"/></svg>`;

/**
 * Battaniye çadırı (iki sandalyenin arasına gerilmiş; pembe, kalpli, fistolu kenar): ön yüzü üçgen, kapısı koyu.
 * Kapının içi (.el-cadir-ic) gece lambasıyla yanınca sıcak sarı parlar.
 */
export const CADIR_ORAN = 230 / 360;
export const CADIR_SVG = `<svg viewBox="0 0 360 230" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>
${deg('el-cd-g', '#f8b9c6', '#e5859c')}
<pattern id="el-cd-d" width="70" height="64" patternUnits="userSpaceOnUse" patternTransform="rotate(-10)"><path d="M18 22C12 12 0 16 2 26C4 34 12 38 18 44C24 38 32 34 34 26C36 16 24 12 18 22Z" fill="#d2566f" opacity=".85"/></pattern>
<radialGradient id="el-cd-i" cx=".5" cy=".85" r=".8"><stop offset="0" stop-color="#ffe7a3"/><stop offset=".5" stop-color="#f7b35a"/><stop offset="1" stop-color="#8a4a2a"/></radialGradient></defs>
<g stroke="${K}" stroke-width="7" stroke-linejoin="round">
<path d="M180 10L20 200Q14 214 30 214H330Q346 214 340 200Z" fill="url(#el-cd-g)"/>
</g>
<path d="M180 10L20 200Q14 214 30 214H330Q346 214 340 200Z" fill="url(#el-cd-d)"/>
<path class="el-cadir-kapi" d="M180 60L118 214H242Z" fill="#5a2a3a" stroke="${K}" stroke-width="6" stroke-linejoin="round"/>
<path class="el-cadir-ic" d="M180 60L118 214H242Z" fill="url(#el-cd-i)" opacity="0"/>
<path d="M180 60Q150 120 124 206M180 60Q210 120 236 206" fill="none" stroke="#f8b9c6" stroke-width="10" stroke-linecap="round"/>
<path d="M180 60Q150 120 124 206M180 60Q210 120 236 206" fill="none" stroke="${K}" stroke-width="4" stroke-linecap="round" opacity=".6"/>
<g fill="#fbd3dc" stroke="${K}" stroke-width="5">${Array.from({ length: 11 }, (_, i) => `<path d="M${30 + i * 30} 214a15 13 0 0 0 30 0"/>`).join('')}</g>
<path d="M170 30L60 170" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".35"/></svg>`;
/** Çökmüş çadır: yere yayılmış battaniye (altında tümsek ayrı eleman) */
export const COKUK_SVG = `<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${deg('el-ck-g', '#f8b9c6', '#e5859c')}
<pattern id="el-ck-d" width="70" height="64" patternUnits="userSpaceOnUse" patternTransform="rotate(-10)"><path d="M18 22C12 12 0 16 2 26C4 34 12 38 18 44C24 38 32 34 34 26C36 16 24 12 18 22Z" fill="#d2566f" opacity=".85"/></pattern></defs>
<path d="M10 104Q20 60 70 58Q120 40 180 44Q250 38 300 58Q350 62 352 104Z" fill="url(#el-ck-g)" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>
<path d="M10 104Q20 60 70 58Q120 40 180 44Q250 38 300 58Q350 62 352 104Z" fill="url(#el-ck-d)"/>
<g fill="#fbd3dc" stroke="${K}" stroke-width="5">${Array.from({ length: 11 }, (_, i) => `<path d="M${14 + i * 31} 104a15.5 12 0 0 0 31 0"/>`).join('')}</g>
<path d="M70 66Q120 50 170 52" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".35" fill="none"/></svg>`;

/** Karşı apartman (pencerenin içinde, gece): lacivert silüet, sarı pencereler; Can'ın penceresi ayrı eleman */
export const APARTMAN_SVG = `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMax slice">
<rect x="0" y="0" width="300" height="300" fill="transparent"/>
<path d="M-10 300V170H60V140H130V300Z" fill="#2c3470"/>
<path d="M150 300V120H230V96H310V300Z" fill="#343d7c"/>
<g fill="#ffd97a" opacity=".85"><rect x="10" y="190" width="18" height="22" rx="3"/><rect x="80" y="160" width="18" height="22" rx="3" opacity=".4"/><rect x="170" y="140" width="18" height="22" rx="3" opacity=".35"/><rect x="250" y="120" width="18" height="22" rx="3" opacity=".4"/><rect x="250" y="220" width="18" height="22" rx="3" opacity=".3"/></g>
<g fill="#1f2556"><rect x="36" y="236" width="18" height="22" rx="3"/><rect x="100" y="210" width="18" height="22" rx="3"/><rect x="170" y="200" width="18" height="22" rx="3"/></g></svg>`;

/**
 * Karanlığın sesleri: duvardaki büyümüş gölge önce tanınır bir "canavar" silueti (kulaklı, parlayan gözlü; korkutucu
 * değil, sevimli), ışık sesin sahibini bulunca asıl eşyanın siluetine döner ve ona akar (elektrik.ts → golgeKur/golgeAc).
 * Hepsi 120×150; kenarlar CSS'te yumuşatılır (elektrik.css → .el-golge-canavar).
 */
const GOLGE_GOZ = (y: number) =>
  `<g class="el-golge-goz"><ellipse cx="46" cy="${y}" rx="7" ry="8.5"/><ellipse cx="74" cy="${y}" rx="7" ry="8.5"/><circle cx="48" cy="${y - 3}" r="2.4" fill="#fff"/><circle cx="76" cy="${y - 3}" r="2.4" fill="#fff"/></g>`;
export const GOLGE_CANAVAR: Record<'saat' | 'saksi' | 'kemik', string> = {
  // saat → sivri kulaklı baykuş-canavar; sarkaç uzun, sallanan bir kuyruk olur
  saat: `<svg viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g class="el-golge-govde">
<path d="M24 60L13 10L44 34Q60 29 76 34L107 10L96 60Q106 92 92 113Q79 128 60 128Q41 128 28 113Q14 92 24 60Z"/>
<path d="M27 78Q6 88 9 112Q20 104 31 99Z"/><path d="M93 78Q114 88 111 112Q100 104 89 99Z"/>
<path class="el-golge-kuyruk" d="M55 124Q50 138 58 148Q70 146 66 124Z"/></g>${GOLGE_GOZ(70)}</svg>`,
  // saksı → yaprak boynuzlu, tüylü-dalgalı etekli canavar
  saksi: `<svg viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g class="el-golge-govde">
<path d="M42 64Q26 34 34 6Q52 30 54 60Z"/><path d="M56 58Q54 26 68 2Q78 30 68 58Z"/><path d="M72 64Q90 36 108 28Q100 54 82 70Z"/>
<path d="M20 146Q12 100 30 76Q43 58 60 58Q77 58 90 76Q108 100 100 146Q91 136 80 146Q70 136 60 146Q50 136 40 146Q30 136 20 146Z"/>
<path d="M27 98Q6 90 3 70Q18 76 30 86Z"/><path d="M93 98Q114 90 117 70Q102 76 90 86Z"/></g>${GOLGE_GOZ(94)}</svg>`,
  // oyuncak kemik → uzun kulaklı tavşan-canavar (kemiğin iki topuzu kulak olur)
  kemik: `<svg viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g class="el-golge-govde">
<path d="M38 70Q16 22 30 4Q50 16 52 64Z"/><path d="M82 70Q104 22 90 4Q70 16 68 64Z"/>
<path d="M60 54Q98 54 102 96Q106 138 82 144Q72 136 60 144Q48 136 38 144Q14 138 18 96Q22 54 60 54Z"/></g>${GOLGE_GOZ(90)}</svg>`,
};

let sayac = 0;
/**
 * SVG'deki kimlikleri (degrade, desen) bu kopyaya özel yapar: aynı çizimin iki kopyası sayfada olunca (ya da biri
 * gizliyken) degradeler birbirine karışmasın.
 */
export function tekil(svg: string): string {
  const ek = `-${++sayac}`;
  return svg.replace(/id="([^"]+)"/g, `id="$1${ek}"`).replace(/url\(#([^)]+)\)/g, `url(#$1${ek})`);
}

/** Görsel elemanı: assets/elektrik/<ad>.webp varsa <img>, yoksa yedek görsel, yoksa kodla çizilmiş SVG */
export function esya(ad: string, svg: string, alt = '', yedek?: string): HTMLElement {
  const url = elAdres(ad, yedek);
  if (url) return h('img.mc-resim.el-resim', { src: url, alt, draggable: 'false' });
  return h('div.mc-resim.el-resim', { html: tekil(svg), role: 'img', 'aria-label': alt });
}

/** Kamp minderi (yastık): kamp şarkısında parmakla vurulur (alkışın dokunma karşılığı); ortasında yıldız */
export const YASTIK_ORAN = 110 / 160;
export const YASTIK_SVG = `<svg viewBox="0 0 160 110" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${deg('el-ys-g', '#8fd1ff', '#3e7fd6')}</defs>
<path d="M18 22Q14 8 30 10Q80 16 130 10Q146 8 142 22Q148 55 142 88Q146 102 130 100Q80 94 30 100Q14 102 18 88Q12 55 18 22Z" fill="url(#el-ys-g)" stroke="${K}" stroke-width="6" stroke-linejoin="round"/>
<path d="M80 34L87 49L103 51L91 62L94 78L80 70L66 78L69 62L57 51L73 49Z" fill="#ffd95c" stroke="${K}" stroke-width="4.5" stroke-linejoin="round"/>
<path d="M22 14L30 22M138 14L130 22M22 96L30 88M138 96L130 88" stroke="${K}" stroke-width="4" stroke-linecap="round"/>
${parla(46, 26, 18, 6, -8, 0.6)}</svg>`;
