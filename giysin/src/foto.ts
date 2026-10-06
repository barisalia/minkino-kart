/**
 * Fotoğraf karesi (polaroid ve albüm): dış sahne, kardan adam, giyinik Kino ve Mino. Durağan (iskelet yok):
 * Kino'nun ön çizimi + giysiler aynı 2048 tuvalde yüzde konumla.
 */
import { h } from '../../src/ui/dom';
import { giysi, PARCA_YERI, zSirasi, type GiysiId } from './model';
import { resim } from './resimler';

export function duraganKino(giyili: GiysiId[]): HTMLElement {
  const k = h('div.gy-durgun-kino', {}, h('img', { src: resim('kino-yedek'), alt: '', draggable: 'false' }));
  for (const id of zSirasi(giyili))
    for (const p of giysi(id).parcalar) {
      const [x, y, w, hh] = PARCA_YERI[p];
      k.append(h('img', { src: resim(`giysi/${p}`), alt: '', draggable: 'false', style: `left:${(x / 20.48).toFixed(3)}%;top:${(y / 20.48).toFixed(3)}%;width:${(w / 20.48).toFixed(3)}%;height:${(hh / 20.48).toFixed(3)}%` }));
    }
  return k;
}

/** Kardan adam (parçalar); göz ve gülüş kodla (kömür: koyu yuvarlak, parlak nokta) */
export function kardanAdam(): { el: HTMLElement; govde: HTMLElement; orta: HTMLElement; bas: HTMLElement; yuz: HTMLElement; gozSag: SVGElement; havuc: HTMLElement; dalSol: HTMLElement; dalSag: HTMLElement; atki: HTMLElement } {
  const img = (ad: string, sinif: string) => h(`img.${sinif}`, { src: resim(ad), alt: '', draggable: 'false' });
  const govde = img('kardan-buyuk', 'gy-ka-govde');
  const orta = img('kardan-orta', 'gy-ka-orta');
  const yuz = h('div.gy-ka-yuz', {
    html: `<svg viewBox="0 0 100 100" aria-hidden="true"><g class="gz-sol"><ellipse cx="33" cy="40" rx="8" ry="9" fill="#2a1d1b"/><circle cx="30.5" cy="36.5" r="2.6" fill="#fff"/></g><g class="gz-sag"><ellipse cx="67" cy="40" rx="8" ry="9" fill="#2a1d1b"/><circle cx="64.5" cy="36.5" r="2.6" fill="#fff"/></g><path d="M30 64 Q50 80 70 64" fill="none" stroke="#2a1d1b" stroke-width="5.5" stroke-linecap="round"/><circle cx="20" cy="58" r="6" fill="#ff9fb0" opacity=".55"/><circle cx="80" cy="58" r="6" fill="#ff9fb0" opacity=".55"/></svg>`,
  });
  const bas = h('div.gy-ka-bas', {}, img('kardan-orta', 'gy-ka-bas-top'), yuz);
  const havuc = img('kardan-havuc', 'gy-ka-havuc');
  const dalSol = img('kardan-dalSol', 'gy-ka-dal-sol');
  const dalSag = img('kardan-dalSag', 'gy-ka-dal-sag');
  const atki = img('kardan-atki', 'gy-ka-atki');
  const el = h('div.gy-kardan', {}, dalSol, dalSag, govde, orta, atki, bas, havuc);
  return { el, govde, orta, bas, yuz, gozSag: yuz.querySelector('.gz-sag') as SVGElement, havuc, dalSol, dalSag, atki };
}

export function fotoKaresi(giyili: GiysiId[], dikey = false): HTMLElement {
  const k = kardanAdam();
  k.el.classList.add('tam');
  return h(
    'div.gy-foto-kare',
    {},
    h('img.gy-foto-zemin', { src: resim(dikey ? 'dis-kis-dikey' : 'dis-kis-yatay'), alt: '', draggable: 'false' }),
    h('div.gy-foto-kardan', {}, k.el),
    h('div.gy-foto-kino', {}, duraganKino(giyili)),
  );
}

export function polaroid(giyili: GiysiId[]): HTMLElement {
  return h('div.gy-polaroid', {}, h('img.gy-polaroid-cerceve', { src: resim('polaroid'), alt: '', draggable: 'false' }), h('div.gy-polaroid-foto', {}, fotoKaresi(giyili)));
}
