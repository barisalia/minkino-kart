/** Sesli Maceralar görselleri (Recraft çizimleri + tasarımcıların Gemini pozları) */
import { h } from '../../src/ui/dom';

const RESIMLER = import.meta.glob<string>(
  [
    '../../assets/parti/*.webp',
    '../../assets/parti-sahne/*.webp',
    '../../assets/parti-ifade/*/*.webp',
    '../../assets/hayvanlar/*.webp',
    '../../assets/orman-karakter/*.webp',
    '../../assets/orman-esya/*.webp',
  ],
  { eager: true, query: '?url', import: 'default' },
);

/** 'parti/pasta' → adres (yoksa '') */
export const adres = (yol: string) => RESIMLER[`../../assets/${yol}.webp`] ?? '';

export function resim(yol: string, sinif = '', alt = ''): HTMLElement {
  const url = adres(yol);
  if (url) return h(`img.mc-resim${sinif ? '.' + sinif : ''}`, { src: url, alt, draggable: 'false' });
  return h(`div.mc-resim.mc-yedek${sinif ? '.' + sinif : ''}`, { role: 'img', 'aria-label': alt });
}
