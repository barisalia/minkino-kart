/**
 * Bölüm 2 eşyaları ve anne: gerçek çizimler (Gemini → Adobe, assets/ege/<ad>.webp) gelene kadar stil kurallarına
 * uygun SVG yer tutucular (yuvarlak hatlar, kalın koyu kahve kontur, az parlaklık). Görsel gelince kod değişmez.
 */
import { h } from '../../src/ui/dom';
import { adres } from './gorsel';

const K = '#5a3617';
const GORSEL = import.meta.glob<string>('../../assets/ege/*.webp', { eager: true, query: '?url', import: 'default' });

/** Yer tutucular: [viewBox en, boy, içerik] */
const SVG: Record<string, [number, number, string]> = {
  'besik-arka': [220, 170, `<rect x="14" y="10" width="18" height="150" rx="9" fill="#e9b77e" stroke="${K}" stroke-width="6"/><rect x="188" y="10" width="18" height="150" rx="9" fill="#e9b77e" stroke="${K}" stroke-width="6"/>
    <path d="M30 40Q110 4 190 40V70H30Z" fill="#f4cfa0" stroke="${K}" stroke-width="6" stroke-linejoin="round"/><rect x="28" y="96" width="164" height="30" rx="12" fill="#bfe0f5" stroke="${K}" stroke-width="6"/>`],
  'besik-on': [220, 170, `<rect x="24" y="84" width="172" height="14" rx="7" fill="#e9b77e" stroke="${K}" stroke-width="6"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${38 + i * 20}" y="96" width="9" height="48" rx="4" fill="#f4cfa0" stroke="${K}" stroke-width="4"/>`).join('')}
    <rect x="20" y="140" width="180" height="16" rx="8" fill="#e9b77e" stroke="${K}" stroke-width="6"/><rect x="10" y="60" width="22" height="104" rx="10" fill="#e9b77e" stroke="${K}" stroke-width="6"/><rect x="188" y="60" width="22" height="104" rx="10" fill="#e9b77e" stroke="${K}" stroke-width="6"/>
    <path d="M20 164Q110 184 200 164" fill="none" stroke="${K}" stroke-width="6" stroke-linecap="round"/>`],
  'mama-sandalye': [160, 200, `<path d="M40 196L56 118M120 196L104 118M50 170H110" stroke="${K}" stroke-width="9" stroke-linecap="round"/><path d="M40 196L56 118M120 196L104 118M50 170H110" stroke="#f5a3b8" stroke-width="4" stroke-linecap="round"/>
    <rect x="34" y="20" width="92" height="104" rx="26" fill="#ffd1dc" stroke="${K}" stroke-width="6"/><rect x="12" y="92" width="136" height="22" rx="11" fill="#fff4e0" stroke="${K}" stroke-width="6"/>`],
  kase: [120, 70, `<path d="M10 22H110Q106 64 60 66Q14 64 10 22Z" fill="#8fd0f0" stroke="${K}" stroke-width="6" stroke-linejoin="round"/><ellipse cx="60" cy="22" rx="50" ry="10" fill="#f7d58a" stroke="${K}" stroke-width="5"/><ellipse cx="46" cy="19" rx="16" ry="4" fill="#fff4c7" opacity=".8"/><path d="M26 40Q60 50 94 40" stroke="#fff" stroke-width="4" fill="none" opacity=".5" stroke-linecap="round"/>`],
  kasik: [150, 44, `<rect x="6" y="16" width="86" height="12" rx="6" fill="#ff8fb1" stroke="${K}" stroke-width="5"/><ellipse cx="118" cy="22" rx="26" ry="16" fill="#e8eef3" stroke="${K}" stroke-width="5"/><ellipse cx="114" cy="17" rx="10" ry="4" fill="#fff"/>
    <g class="eg-kasik-mama"><ellipse cx="119" cy="18" rx="19" ry="10" fill="#f7d58a" stroke="${K}" stroke-width="3"/><ellipse cx="113" cy="15" rx="6" ry="2.5" fill="#fff4c7"/></g>`],
  onluk: [100, 96, `<path d="M18 12Q50 40 82 12Q96 20 88 36Q80 42 76 44Q86 86 50 90Q14 86 24 44Q20 42 12 36Q4 20 18 12Z" fill="#fff" stroke="${K}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M28 52Q50 60 72 52Q72 78 50 80Q28 78 28 52Z" fill="#9fd89a"/><circle cx="40" cy="64" r="4" fill="#fff"/><circle cx="58" cy="70" r="4" fill="#fff"/><circle cx="62" cy="58" r="3" fill="#fff"/>`],
  pecete: [90, 90, `<path d="M8 14Q45 4 82 14Q88 45 80 78Q45 88 10 78Q2 45 8 14Z" fill="#fff" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><path d="M16 22Q45 16 74 22" stroke="#bfe0f5" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M22 66Q45 72 70 66" stroke="#ffd1dc" stroke-width="4" fill="none" stroke-linecap="round"/>`],
  cingirak: [64, 120, `<rect x="26" y="58" width="12" height="56" rx="6" fill="#ffb347" stroke="${K}" stroke-width="5"/><circle cx="32" cy="116" r="7" fill="#ff7eb6" stroke="${K}" stroke-width="4"/>
    <circle cx="32" cy="34" r="27" fill="#ffd84a" stroke="${K}" stroke-width="6"/><circle cx="32" cy="34" r="15" fill="#ff7eb6" stroke="${K}" stroke-width="4"/><circle cx="22" cy="24" r="6" fill="#fff" opacity=".7"/>`],
  'sepet-arka': [220, 150, `<ellipse cx="110" cy="34" rx="100" ry="24" fill="#8a5a2b" stroke="${K}" stroke-width="6"/>`],
  'sepet-on': [220, 150, `<path d="M10 34Q14 132 40 140H180Q206 132 210 34Q110 70 10 34Z" fill="#d9a05b" stroke="${K}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M24 62Q110 92 196 62M28 90Q110 118 192 90M34 116Q110 140 186 116" stroke="#b27a3c" stroke-width="5" fill="none"/><path d="M10 34Q110 70 210 34" stroke="${K}" stroke-width="7" fill="none" stroke-linecap="round"/>`],
  kup: [80, 80, `<path d="M10 24L40 10L70 24V58L40 72L10 58Z" fill="#6ec1f0" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><path d="M10 24L40 38L70 24M40 38V72" fill="none" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><path d="M40 38L70 24V58L40 72Z" fill="#4aa3d8"/><text x="22" y="56" font-size="22" font-weight="700" fill="#fff" font-family="Fredoka, sans-serif">A</text>`],
  kitap: [100, 80, `<path d="M8 16Q30 6 50 16Q70 6 92 16V70Q70 60 50 70Q30 60 8 70Z" fill="#ffb347" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><path d="M50 16V70" stroke="${K}" stroke-width="5"/><path d="M16 28Q32 22 44 28M56 28Q70 22 84 28M16 40Q32 34 44 40" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="72" cy="48" r="9" fill="#ff7eb6"/>`],
  'kutu-arka': [200, 150, `<rect x="10" y="20" width="180" height="44" rx="10" fill="#b85a8a" stroke="${K}" stroke-width="6"/>`],
  'kutu-on': [200, 150, `<rect x="8" y="50" width="184" height="92" rx="14" fill="#ff8fb1" stroke="${K}" stroke-width="6"/><path d="M8 78H192" stroke="${K}" stroke-width="5"/><circle cx="54" cy="112" r="12" fill="#ffd84a" stroke="${K}" stroke-width="4"/><path d="M130 100l8 16h-16z" fill="#6ec1f0" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>`],
  'kutu-kapak': [200, 60, `<rect x="4" y="14" width="192" height="36" rx="12" fill="#ff6f9f" stroke="${K}" stroke-width="6"/><rect x="84" y="4" width="32" height="14" rx="6" fill="#ffd84a" stroke="${K}" stroke-width="4"/>`],
  'battaniye-anne': [170, 110, `<path d="M10 20Q85 2 160 20Q168 60 158 96Q85 110 12 96Q2 60 10 20Z" fill="#b99cf0" stroke="${K}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M30 36Q85 26 140 36M28 60Q85 50 142 60M30 84Q85 76 140 84" stroke="#d8c6ff" stroke-width="5" fill="none" stroke-linecap="round"/>${[[48, 48], [98, 46], [70, 72], [122, 72]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="#fff" opacity=".8"/>`).join('')}`],
  'anne-ayakta': [130, 280, `<path d="M40 150Q30 250 34 272H96Q100 250 90 150Z" fill="#7fb7e8" stroke="${K}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M36 110Q65 94 94 110L100 170Q65 180 30 170Z" fill="#f2a65a" stroke="${K}" stroke-width="6" stroke-linejoin="round"/><path d="M38 118Q16 160 28 190M92 118Q114 160 100 190" stroke="#f2a65a" stroke-width="16" stroke-linecap="round" fill="none"/><path d="M38 118Q16 160 28 190M92 118Q114 160 100 190" stroke="${K}" stroke-width="4" stroke-linecap="round" fill="none" opacity=".5"/>
    <circle cx="65" cy="62" r="36" fill="#f6c9a0" stroke="${K}" stroke-width="6"/><path d="M29 60Q30 18 66 20Q102 20 101 62Q92 34 64 36Q40 38 29 60Z" fill="#6b3a1f" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><circle cx="66" cy="16" r="14" fill="#6b3a1f" stroke="${K}" stroke-width="5"/>
    <path d="M48 66Q54 70 60 66M72 66Q78 70 84 66" stroke="${K}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M47 74Q54 78 60 75M72 75Q78 78 85 74" stroke="#b9a3e0" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/><ellipse cx="66" cy="86" rx="6" ry="4" fill="#b5523a"/>`],
  'anne-uyuyor': [170, 170, `<path d="M36 100Q30 160 40 166H130Q140 160 132 100Z" fill="#7fb7e8" stroke="${K}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M40 78Q86 62 128 80L134 120Q86 132 36 120Z" fill="#f2a65a" stroke="${K}" stroke-width="6" stroke-linejoin="round"/>
    <g transform="rotate(-16 70 54)"><circle cx="70" cy="50" r="33" fill="#f6c9a0" stroke="${K}" stroke-width="6"/><path d="M37 48Q38 10 71 12Q104 12 103 48Q94 24 70 26Q46 28 37 48Z" fill="#6b3a1f" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><circle cx="72" cy="8" r="12" fill="#6b3a1f" stroke="${K}" stroke-width="5"/>
    <path d="M52 54Q58 59 64 54M76 54Q82 59 88 54" stroke="${K}" stroke-width="4" fill="none" stroke-linecap="round"/><path class="eg-anne-agiz" d="M64 70Q70 72 76 70" stroke="${K}" stroke-width="4" fill="none" stroke-linecap="round"/><path class="eg-anne-gulus" d="M62 68Q70 78 78 68" stroke="${K}" stroke-width="4" fill="none" stroke-linecap="round"/></g>`],
};

/** Eşyanın en/boy oranı (yer tutucu viewBox'ından; gerçek görselde görselin kendi oranı kullanılır) */
export const oran = (ad: string) => (SVG[ad] ? SVG[ad][0] / SVG[ad][1] : 1);

/** Eşya elemanı: assets/ege/<ad>.webp varsa o, yoksa yer tutucu SVG; `yol` verilirse mevcut bir görsel (ör. hayvanlar/ayi) */
export function esya(ad: string, yol?: string): HTMLElement {
  const url = GORSEL[`../../assets/ege/${ad}.webp`] ?? (yol ? adres(yol) : '');
  if (url) return h('img.mc-resim.eg-resim', { src: url, alt: '', draggable: 'false' });
  const [w, hh, ic] = SVG[ad] ?? SVG.kup;
  return h('div.mc-resim.eg-resim', { html: `<svg viewBox="0 0 ${w} ${hh}" xmlns="http://www.w3.org/2000/svg">${ic}</svg>`, 'data-yer-tutucu': '1' });
}
