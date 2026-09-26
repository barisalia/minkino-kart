/**
 * Film eşyaları. Gerçek çizimler (Recraft/Gemini, assets/film/<film>/<ad>.webp) gelene kadar stil kurallarına uygun
 * SVG yer tutucular: yuvarlak hatlar, kalın koyu kahve kontur, az dozda parlaklık.
 */
import { h } from '../../src/ui/dom';

const K = '#5a3617';
const GORSELLER = import.meta.glob<string>('../../assets/film/**/*.webp', { eager: true, query: '?url', import: 'default' });

const SVG: Record<string, string> = {
  karpuz: `<svg viewBox="0 0 200 150"><ellipse cx="100" cy="80" rx="92" ry="64" fill="#3f9a3a" stroke="${K}" stroke-width="7"/>
    <path d="M30 60Q60 40 70 80T60 136M80 22Q110 60 95 100T105 144M130 20Q150 60 140 100T150 140M165 40Q185 70 175 110" fill="none" stroke="#1f6a24" stroke-width="10" stroke-linecap="round"/>
    <ellipse cx="62" cy="46" rx="26" ry="11" fill="#fff" opacity=".45" transform="rotate(-18 62 46)"/></svg>`,
  'karpuz-yarim': `<svg viewBox="0 0 200 120"><path d="M8 20h184a92 92 0 0 1-184 0z" fill="#3f9a3a" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M22 20h156a78 78 0 0 1-156 0z" fill="#f7f0c8"/><path d="M30 20h140a70 70 0 0 1-140 0z" fill="#ee3b43"/>
    <ellipse cx="100" cy="20" rx="92" ry="10" fill="#ee3b43" stroke="${K}" stroke-width="6"/><ellipse cx="100" cy="20" rx="80" ry="6" fill="#ff6c6f"/>
    ${[[60, 50], [85, 64], [115, 64], [140, 50], [100, 44], [72, 36], [128, 36]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4.5" ry="7" fill="#3a1f14"/>`).join('')}</svg>`,
  bicak: `<svg viewBox="0 0 200 60"><rect x="4" y="18" width="70" height="26" rx="12" fill="#b9793a" stroke="${K}" stroke-width="6"/>
    <path d="M74 20H176Q198 31 176 42H74Z" fill="#dfe6ee" stroke="${K}" stroke-width="6" stroke-linejoin="round"/><path d="M84 26H168" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`,
  kasa: `<svg viewBox="0 0 200 140"><rect x="6" y="10" width="188" height="124" rx="12" fill="#d8914c" stroke="${K}" stroke-width="7"/>
    <path d="M6 52H194M6 94H194" stroke="${K}" stroke-width="6"/><path d="M20 22H180M20 64H180M20 106H180" stroke="#f3b977" stroke-width="5" stroke-linecap="round" opacity=".8"/></svg>`,
  tabak: `<svg viewBox="0 0 200 60"><ellipse cx="100" cy="30" rx="94" ry="24" fill="#fff" stroke="${K}" stroke-width="6"/><ellipse cx="100" cy="28" rx="62" ry="13" fill="#eef3f7"/></svg>`,
};

/** Eşya elemanı: varsa gerçek görsel, yoksa SVG yer tutucu */
export function esyaCiz(tip: string, film: string): HTMLElement {
  const url = GORSELLER[`../../assets/film/${film}/${tip}.webp`];
  if (url) return h('img.fl-esya-resim', { src: url, alt: '', draggable: 'false' });
  return h('div.fl-esya-resim', { html: SVG[tip] ?? SVG.kasa, 'data-yer-tutucu': '1' });
}

/** Eşyanın en/boy oranı (yer tutucular için) */
export const ESYA_ORAN: Record<string, number> = { karpuz: 200 / 150, 'karpuz-yarim': 200 / 120, bicak: 200 / 60, kasa: 200 / 140, tabak: 200 / 60 };
