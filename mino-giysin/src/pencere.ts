/**
 * Perdeli pencere (dikey ekranda duvarın boş üst yarısı: Mino'nun odası ve Kino'nun odası). Var olan çizimler:
 * giysin/pencere çerçevesi, camda yaz manzarası (pencere-yaz-arka/orta/on: gök, tepeler, çit, ağaç), bağlı perdeler
 * (perde-sol/sag). Yalnız gösterir, dokunuşu tutmaz. Ölçü (DPR 3): çerçeve 896 px → en çok 298 css px; perde 455 px →
 * pencere eni en çok 255 css px (pencereOlcu bunu gözetir).
 */
import { h } from '../../src/ui/dom';
import { gorsel } from './resimler';

export const PENCERE_ORAN = 1152 / 896;
export const PENCERE_EN_COK = 255;

export function pencereEl(): HTMLElement {
  return h(
    'div.mg-pencere',
    { 'aria-hidden': 'true' },
    h('div.mg-cam', {}, ...['arka', 'orta', 'on'].map((k) => h(`img.mg-manzara.${k}`, { src: gorsel(`giysin/pencere-yaz-${k}`), alt: '', draggable: 'false' }))),
    h('img.mg-pencere-cerceve', { src: gorsel('giysin/pencere'), alt: '', draggable: 'false' }),
    h('img.mg-perde.sol', { src: gorsel('giysin/perde-sol'), alt: '', draggable: 'false' }),
    h('img.mg-perde.sag', { src: gorsel('giysin/perde-sag'), alt: '', draggable: 'false' }),
  );
}

/**
 * Üst (ust) ile alt (alt) arasına, ortası x'te duran pencere kutusu; en çok enCok genişlikte. Yer azsa (90 px'ten kısa) null.
 */
export function pencereOlcu(x: number, ust: number, alt: number, enCok: number): { x: number; y: number; w: number; h: number } | null {
  const w = Math.min((alt - ust) / PENCERE_ORAN, PENCERE_EN_COK, enCok);
  const hh = w * PENCERE_ORAN;
  return hh >= 90 ? { x: x - w / 2, y: alt - hh, w, h: hh } : null;
}
