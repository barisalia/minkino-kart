/** Pazar görselleri: mevcut setler (hayvanlar, meyveler) + tasarımcının pazar seti (gelene kadar CSS yer tutucu). Mino canlı çizim (src/mino). */
import { h } from '../../src/ui/dom';

const RESIMLER = import.meta.glob<string>(
  ['../../assets/hayvanlar/*.webp', '../../assets/meyveler/*.webp', '../../assets/pazar/*.webp'],
  { eager: true, query: '?url', import: 'default' },
);

/** 'meyveler/elma', 'pazar/sepet' … → adres (yoksa '') */
export const adres = (yol: string) => RESIMLER[`../../assets/${yol}.webp`] ?? '';

/** Çizim (yoksa yedek renkli daire + harf) */
export function resim(yol: string, sinif = '', alt = ''): HTMLElement {
  const url = adres(yol);
  const s = sinif ? '.' + sinif.split(' ').join('.') : '';
  if (url) return h(`img.pz-resim${s}`, { src: url, alt, draggable: 'false' });
  return h(`div.pz-resim.pz-yedek${s}`, { role: 'img', 'aria-label': alt }, alt.charAt(0));
}

const AZ = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Ürün bir yere düşünce: iki yana kabaran küçük toz bulutları ve üç minik parıltı (x, y: 0..1, kaba göre).
 * Yalnız transform / opacity; hareketi azalt tercihinde hiç yok.
 */
export function tozKalkar(kap: HTMLElement, x: number, y: number) {
  if (AZ) return;
  const yer = h('div.pz-toz', { style: `left:${x * 100}%;top:${y * 100}%`, 'aria-hidden': 'true' });
  for (let i = 0; i < 4; i++) yer.append(h('i.pz-toz-bulut', { style: `--yon:${i % 2 ? 1 : -1};--u:${(0.7 + (i >> 1) * 0.45).toFixed(2)};--g:${(i >> 1) * 40}ms` }));
  for (let i = 0; i < 3; i++) yer.append(h('i.pz-toz-parilti', { style: `--a:${-60 + i * 60}deg;--g:${60 + i * 50}ms` }));
  kap.append(yer);
  setTimeout(() => yer.remove(), 900);
}

/** Uçuşan küçük parıltılar (x, y: 0..1, kaba göre) */
export function parilti(kap: HTMLElement, x: number, y: number, adet = 8) {
  for (let i = 0; i < adet; i++) {
    const p = h('i.pz-parilti', { style: `left:${x * 100}%;top:${y * 100}%;--dx:${Math.cos(i * 2.4) * 70}px;--dy:${Math.sin(i * 2.4) * 70 - 30}px;--g:${i * 40}ms` });
    kap.append(p);
    setTimeout(() => p.remove(), 1100);
  }
}
