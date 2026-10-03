/**
 * Vaka dosyası (ekranın üstünde, kraft kâğıdı bir şerit): her halkaya bir göz. Bulunan ipucunun fotoğrafı göze yapışır;
 * halka çözülünce "Demek ki" kartı gözün üstüne oturur, yeşil tik mührü basılır. Sonunda dört göz çizgi roman olur.
 */
import { h } from '../../src/ui/dom';
import { HALKALAR, type Dosya, type HalkaId } from './mantik';
import { resim } from './resimler';
import { oynat } from './efekt';

export class DosyaSeridi {
  readonly el: HTMLElement;
  private gozler = new Map<HalkaId, HTMLElement>();

  constructor(readonly dosya: Dosya) {
    this.el = h('div.dd-dosya', { 'aria-label': 'Vaka dosyası' });
    for (const [i, hk] of HALKALAR.entries()) {
      const g = h('div.dd-goz', { 'data-halka': hk.id, style: `--i:${i}` }, h('i.dd-goz-no', {}, String(i + 1)), h('div.dd-goz-fotolar'), h('div.dd-goz-demek'));
      this.gozler.set(hk.id, g);
      this.el.append(g);
    }
    this.ciz();
  }

  goz(id: HalkaId): HTMLElement {
    return this.gozler.get(id)!;
  }

  /** Halkanın gözü açık (şu an bu halkada) */
  aktif(id: HalkaId | null) {
    for (const [k, g] of this.gozler) g.classList.toggle('dd-aktif', k === id);
  }

  /** İpucu fotoğrafı göze yapıştı */
  ipucu(id: HalkaId, foto: string) {
    const fotolar = this.goz(id).querySelector('.dd-goz-fotolar')!;
    const n = fotolar.childElementCount;
    fotolar.append(h('img', { src: foto, alt: '', draggable: 'false', style: `--n:${n}` }));
    oynat(this.goz(id), 'dd-yapis');
  }

  /** "Demek ki" kartı göze oturdu */
  demek(id: HalkaId) {
    const hk = HALKALAR.find((x) => x.id === id)!;
    const d = this.goz(id).querySelector('.dd-goz-demek')!;
    d.replaceChildren(h('img', { src: resim(hk.demekResim) ?? '', alt: '', draggable: 'false' }), h('i.dd-tik'));
    this.goz(id).classList.add('dd-cozuldu');
    oynat(this.goz(id), 'dd-yapis');
  }

  /** Dosyanın şimdiki durumunu çizer (test kısayoluyla ortadan başlanınca) */
  ciz() {
    for (const g of this.dosya.gozler) {
      const hk = HALKALAR.find((x) => x.id === g.halka)!;
      const el = this.goz(g.halka);
      const fotolar = el.querySelector('.dd-goz-fotolar')!;
      fotolar.replaceChildren(
        ...g.ipuclari.map((id, n) => {
          const t = hk.ipuclari.find((i) => i.id === id);
          return h('img', { src: resim(t?.foto ?? t?.resim ?? '') ?? '', alt: '', draggable: 'false', style: `--n:${n}` });
        }),
      );
      if (g.demek) {
        el.querySelector('.dd-goz-demek')!.replaceChildren(h('img', { src: resim(hk.demekResim) ?? '', alt: '', draggable: 'false' }), h('i.dd-tik'));
        el.classList.add('dd-cozuldu');
      }
    }
  }
}
