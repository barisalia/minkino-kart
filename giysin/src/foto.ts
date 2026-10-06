/**
 * Fotoğraf karesi (polaroid ve albüm): mevsimin dış sahnesi, sahnenin hatırası (kardan adam, kumdan kale,
 * su sıçraması, sepette çiçekler) ve giyinik Kino. Durağan (iskelet yok): Kino'nun ön çizimi + giysiler aynı
 * 2048 tuvalde yüzde konumla (açık şemsiye Kino'nun arkasında).
 */
import { h } from '../../src/ui/dom';
import { ACIK_SEMSIYE, ARKA_PARCA, giysi, KAPALI_SEMSIYE, PARCA_YERI, parcaDosyasi, zSirasi, type GiysiId, type Mevsim } from './model';
import { resim } from './resimler';

/** Sepetteki çiçek demeti (iskelet tuvalinde; sepetin arkasında, sapları sepetin içinde) */
export const SEPET_CICEK: [number, number, number, number] = [1190, 1265, 270, 353];

const yuzde = ([x, y, w, hh]: [number, number, number, number]) => `left:${(x / 20.48).toFixed(3)}%;top:${(y / 20.48).toFixed(3)}%;width:${(w / 20.48).toFixed(3)}%;height:${(hh / 20.48).toFixed(3)}%`;

export function duraganKino(giyili: GiysiId[], cicek = false): HTMLElement {
  const arka: HTMLElement[] = [];
  const on: HTMLElement[] = [];
  for (const id of zSirasi(giyili))
    for (const p of giysi(id).parcalar) {
      if (id === 'semsiye' && KAPALI_SEMSIYE.has(p)) continue;
      if (id !== 'semsiye' && ACIK_SEMSIYE.has(p)) continue;
      const yer = PARCA_YERI[p];
      if (!yer) continue;
      if (cicek && p === 'sepet') on.push(h('img', { src: resim('esya-cicek'), alt: '', draggable: 'false', style: yuzde(SEPET_CICEK) }));
      (ARKA_PARCA.has(p) ? arka : on).push(h('img', { src: resim(`giysi/${parcaDosyasi(p)}`), alt: '', draggable: 'false', style: yuzde(yer) }));
    }
  return h('div.gy-durgun-kino', {}, ...arka, h('img.gy-durgun-govde', { src: resim('kino-yedek'), alt: '', draggable: 'false' }), ...on);
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

/** Fotoğrafta sahnenin hatırası (Kino'nun yanında) */
function hatira(m: Mevsim): HTMLElement[] {
  const img = (ad: string, sinif: string) => h(`img.${sinif}`, { src: resim(ad), alt: '', draggable: 'false' });
  if (m === 'kis') {
    const k = kardanAdam();
    k.el.classList.add('tam');
    return [h('div.gy-foto-kardan', {}, k.el)];
  }
  if (m === 'yaz') return [img('esya-kale', 'gy-foto-kale')];
  if (m === 'ilkbahar') return [img('esya-ari', 'gy-foto-ari')];
  return [img('esya-birikinti', 'gy-foto-birikinti'), img('esya-sicrama', 'gy-foto-sicrama')];
}

export function fotoKaresi(m: Mevsim, giyili: GiysiId[], dikey = false): HTMLElement {
  return h(
    `div.gy-foto-kare.${m}`,
    {},
    h('img.gy-foto-zemin', { src: resim(dikey ? `dis-${m}-dikey` : `dis-${m}-yatay`), alt: '', draggable: 'false' }),
    ...hatira(m),
    h('div.gy-foto-kino', {}, duraganKino(giyili, m === 'ilkbahar' && giyili.includes('sepet'))),
  );
}

export function polaroid(m: Mevsim, giyili: GiysiId[]): HTMLElement {
  return h('div.gy-polaroid', {}, h('img.gy-polaroid-cerceve', { src: resim('polaroid'), alt: '', draggable: 'false' }), h('div.gy-polaroid-foto', {}, fotoKaresi(m, giyili)));
}
