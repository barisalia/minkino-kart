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

/** Kardan adam (Gemini parçaları: üç top, kömür gözler ve düğmeler, dal kollar, havuç, atkı); gülüş kodla (ince yay) */
export function kardanAdam(): { el: HTMLElement; govde: HTMLElement; orta: HTMLElement; bas: HTMLElement; yuz: HTMLElement; gozSag: HTMLElement; havuc: HTMLElement; dalSol: HTMLElement; dalSag: HTMLElement; atki: HTMLElement } {
  const img = (ad: string, sinif: string) => h(`img.${sinif}`, { src: resim(ad), alt: '', draggable: 'false' });
  const govde = img('kardan-buyuk', 'gy-ka-govde');
  const orta = h('div.gy-ka-orta', {}, img('kardan-orta', 'gy-ka-orta-top'), img('kardan-dugme-1', 'gy-ka-dugme d1'), img('kardan-dugme-2', 'gy-ka-dugme d2'));
  const gozSag = img('kardan-goz-2', 'gy-ka-goz sag');
  const yuz = h(
    'div.gy-ka-yuz',
    {},
    img('kardan-goz-1', 'gy-ka-goz sol'),
    gozSag,
    h('div.gy-ka-gulus', { html: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M30 62 Q50 78 70 62" fill="none" stroke="#3a2a28" stroke-width="5" stroke-linecap="round"/><circle cx="18" cy="56" r="7" fill="#ff9fb0" opacity=".5"/><circle cx="82" cy="56" r="7" fill="#ff9fb0" opacity=".5"/></svg>` }),
  );
  const bas = h('div.gy-ka-bas', {}, img('kardan-kucuk', 'gy-ka-bas-top'), yuz);
  const havuc = img('kardan-havuc', 'gy-ka-havuc');
  const dalSol = img('kardan-dalSol', 'gy-ka-dal-sol');
  const dalSag = img('kardan-dalSag', 'gy-ka-dal-sag');
  const atki = img('kardan-atki', 'gy-ka-atki');
  const el = h('div.gy-kardan', {}, dalSol, dalSag, govde, orta, atki, bas, havuc);
  return { el, govde, orta, bas, yuz, gozSag, havuc, dalSol, dalSag, atki };
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
