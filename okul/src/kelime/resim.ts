/**
 * Kelime Köprüsü görselleri: depodaki hazır resimler + Gemini yuvaları (assets/okul/kelime/<ad>.webp). Yuva dosyası
 * yoksa yumuşak, yuvarlak bir yer tutucu çıkar (kodla nesne çizilmez); dosya gelince glob kendiliğinden bulur.
 */
import { h } from '../../../src/ui/dom';
import { kelime } from './model';

const GORSEL = import.meta.glob<string>(
  [
    '../../../assets/{hayvanlar,meyveler,tasitlar,renkler}/*.webp',
    '../../../assets/film/esya/*.webp',
    '../../../assets/ege/{perde-acik,perde-kapali}.webp',
    '../../../assets/banyo/havlu-mavi.webp',
    '../../../assets/pazar/sepet.webp',
    '../../../assets/parti/flama.webp',
    '../../../assets/canlan/bulut.webp',
    '../../../assets/orman-esya/{davul,golet}.webp',
    '../../../assets/sahne/{yol,cayir}.webp',
    '../../../assets/okul/*.webp',
    '../../../assets/okul/kelime/*.webp',
  ],
  { eager: true, query: '?url', import: 'default' },
);

/** assets/<yol>.webp adresi ('' = yok) */
export const kelimeGorsel = (yol: string) => GORSEL[`../../../assets/${yol}.webp`] ?? '';
/** Görsel depoda var mı */
export const hazir = (yol: string) => !!kelimeGorsel(yol);

/** Yer tutucu tonları (yumuşak pastel) */
const TON = ['#ffd9e6', '#d9ecff', '#fff0c2', '#dcf5d0', '#eadcff', '#ffe2cc'];
const ozet = (t: string) => [...t].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

/** Görsel (img) ya da yumuşak yer tutucu; yol: assets/ altında, uzantısız */
export function gorselEl(yol: string, sinif = ''): HTMLElement {
  const url = kelimeGorsel(yol);
  const ek = sinif ? '.' + sinif.split(' ').filter(Boolean).join('.') : '';
  if (url) return h(`img.ok-resim${ek}`, { src: url, alt: '', draggable: 'false' });
  return h(`span.ok-k-yer${ek}`, { 'data-yuva': yol, style: `--yt:${TON[ozet(yol) % TON.length]}`, 'aria-hidden': 'true' }, h('i'));
}
/** Kelimenin resmi */
export const kelimeEl = (id: string, sinif = '') => gorselEl(kelime(id).resim, sinif);

/**
 * Boyanabilen resim (Boya kovası, renkli kovalar): gri (boyasız) resmin üstünde resmin kendi şeklinde bir renk
 * katmanı (maske + çarpma karışımı): gölge, parlama ve kontur korunur. boyali(el, renk) ile boyanır.
 */
export function boyanabilir(yol: string, sinif = ''): HTMLElement {
  const url = kelimeGorsel(yol);
  const maske = url ? `-webkit-mask-image:url("${url}");mask-image:url("${url}")` : '';
  return h(`span.ok-k-boya${sinif ? '.' + sinif.split(' ').join('.') : ''}`, {}, gorselEl(yol, 'ok-k-gri'), h('span.ok-k-renk', { style: maske }));
}
/** Boyar (renk değeri; null: boyasız). anim: aşağıdan yukarı dolar */
export function boya(el: HTMLElement, deger: string | null, anim = true) {
  if (!deger) {
    el.classList.remove('ok-boyali', 'ok-boya-dol');
    return;
  }
  el.style.setProperty('--renk', deger);
  el.classList.add('ok-boyali');
  if (anim) {
    el.classList.remove('ok-boya-dol');
    void el.offsetWidth;
    el.classList.add('ok-boya-dol');
  }
}
