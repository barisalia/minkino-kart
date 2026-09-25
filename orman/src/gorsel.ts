/** Görseller (Recraft çizimleri) ve küçük görsel efektler */
import { h } from '../../src/ui/dom';

const RESIMLER = import.meta.glob<string>(
  ['../../assets/hayvanlar/*.webp', '../../assets/renkler/*.webp', '../../assets/meyveler/*.webp', '../../assets/tasitlar/*.webp', '../../assets/orman/*.webp', '../../assets/orman-karakter/*.webp'],
  { eager: true, query: '?url', import: 'default' },
);

/** 'hayvanlar/inek', 'orman/ruzgar' … → adres (yoksa '') */
export const adres = (yol: string) => RESIMLER[`../../assets/${yol}.webp`] ?? '';

/** Çizim (yoksa yedek renkli daire + harf) */
export function resim(yol: string, sinif = '', alt = ''): HTMLElement {
  const url = adres(yol);
  if (url) return h(`img.or-resim${sinif ? '.' + sinif : ''}`, { src: url, alt, draggable: 'false' });
  return h(`div.or-resim.or-yedek${sinif ? '.' + sinif : ''}`, { role: 'img', 'aria-label': alt }, alt.charAt(0));
}

/** Havai fişek: renkli kıvılcımlar (x, y: 0..1, sahneye göre) */
export function fisek(sahne: HTMLElement, x: number, y: number, renk = '#FFC72C') {
  const f = h('div.or-fisek', { style: `left:${x * 100}%;top:${y * 100}%;--r:${renk}` });
  for (let i = 0; i < 14; i++) f.append(h('i', { style: `--a:${(i / 14) * 360}deg;--d:${0.7 + (i % 3) * 0.2}` }));
  sahne.append(f);
  setTimeout(() => f.remove(), 1300);
}

/** Uçuşan küçük parıltılar (başarı) */
export function parilti(sahne: HTMLElement, x: number, y: number, adet = 8) {
  for (let i = 0; i < adet; i++) {
    const p = h('i.or-parilti', { style: `left:${x * 100}%;top:${y * 100}%;--dx:${Math.cos(i * 2.4) * 60}px;--dy:${Math.sin(i * 2.4) * 60 - 30}px;--g:${i * 40}ms` });
    sahne.append(p);
    setTimeout(() => p.remove(), 1100);
  }
}

/** "Zzz" balonları (uyuyan karakterin üstünde) */
export function zzz(): HTMLElement {
  return h('div.or-zzz', { 'aria-hidden': 'true' }, h('i', {}, 'z'), h('i', {}, 'z'), h('i', {}, 'Z'));
}

export const RENKLER = ['#F0413F', '#FF8A2B', '#FFC72C', '#5DBE3F', '#3E9DF2', '#9B5CE0', '#FF7EB6'];
