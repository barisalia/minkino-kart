/**
 * Vaka dosyası (ekranın üstünde, kraft kâğıdı bir şerit): her halkaya bir göz. Bulunan ipucunun fotoğrafı göze yapışır;
 * halka çözülünce "Demek ki" kartı gözün üstüne oturur, yeşil tik mührü basılır. Sonunda gözler çizgi roman olur.
 * Vaka 1'de dört göz, Vaka 2'de beş (halkalar dosyanın kendi listesinden: Dosya.halkalar).
 */
import { h } from '../../src/ui/dom';
import { type Dosya, type DosyaHalkasi } from './mantik';
import { resim } from './resimler';
import { oynat } from './efekt';

export class DosyaSeridi {
  readonly el: HTMLElement;
  private gozler = new Map<string, HTMLElement>();

  constructor(readonly dosya: Dosya) {
    this.el = h('div.dd-dosya', { 'aria-label': 'Vaka dosyası', 'data-goz': String(dosya.halkalar.length) });
    for (const [i, hk] of dosya.halkalar.entries()) {
      const g = h('div.dd-goz', { 'data-halka': hk.id, style: `--i:${i}` }, h('i.dd-goz-no', {}, String(i + 1)), h('div.dd-goz-fotolar'), h('div.dd-goz-demek'));
      this.gozler.set(hk.id, g);
      this.el.append(g);
    }
    this.ciz();
  }

  private halka(id: string): DosyaHalkasi {
    return this.dosya.halkalar.find((x) => x.id === id)!;
  }

  goz(id: string): HTMLElement {
    return this.gozler.get(id)!;
  }

  /** Halkanın gözü açık (şu an bu halkada) */
  aktif(id: string | null) {
    for (const [k, g] of this.gozler) g.classList.toggle('dd-aktif', k === id);
  }

  /** İpucu fotoğrafı göze yapıştı */
  ipucu(id: string, foto: string) {
    const fotolar = this.goz(id).querySelector('.dd-goz-fotolar')!;
    const n = fotolar.childElementCount;
    fotolar.append(h('img', { src: foto, alt: '', draggable: 'false', style: `--n:${n}` }));
    oynat(this.goz(id), 'dd-yapis');
  }

  /** "Demek ki" kartı göze oturdu */
  demek(id: string) {
    const d = this.goz(id).querySelector('.dd-goz-demek')!;
    d.replaceChildren(h('img', { src: resim(this.halka(id).demekResim) ?? '', alt: '', draggable: 'false' }), h('i.dd-tik'));
    this.goz(id).classList.add('dd-cozuldu');
    oynat(this.goz(id), 'dd-yapis');
  }

  /** Dosyanın şimdiki durumunu çizer (test kısayoluyla ortadan başlanınca) */
  ciz() {
    for (const g of this.dosya.gozler) {
      const hk = this.halka(g.halka);
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
