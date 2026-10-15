/**
 * Pati Dükkânı: Nehir abla, anlatıcı (sol altta, belden yukarı; dikey telefonda yerde boydan durur).
 * Konuşurken bütün gövde hafifçe yaylanır (anlatıcı sayfası G6 ve ağızları gelince ağız da oynar; şimdilik model).
 * "Yanlış" demez; övgüsünü hayvan üzerinden yapar. Cümleler content/pati.json → nehir.
 */
import type { Soylenecek } from '../../src/audio/konusma';
import { konus } from '../../src/audio/ses';
import { h, TEST_MODU } from '../../src/ui/dom';
import { NEHIR } from './varliklar';

const AZ = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export class Nehir {
  readonly el: HTMLElement;
  private govde: HTMLElement;
  private sira = 0;
  constructor() {
    this.govde = h('div.pt-nehir-govde', {}, h('img.pt-nehir-resim', { src: NEHIR, alt: 'Nehir abla', draggable: 'false' }));
    this.el = h('div.pt-nehir', { 'data-konusuyor': '0' }, this.govde);
  }

  /** Söyler (bitince çözülür); konuşurken gövde yaylanır */
  async soyle(metin: Soylenecek) {
    const no = ++this.sira;
    this.el.dataset.konusuyor = '1';
    if (!AZ && !TEST_MODU) this.govde.animate([{ transform: 'scale(1,1)' }, { transform: 'scale(1.03,.97)', offset: 0.3 }, { transform: 'scale(.99,1.02)', offset: 0.65 }, { transform: 'scale(1,1)' }], { duration: 320, easing: 'ease-out' });
    try {
      await konus(metin);
    } finally {
      if (no === this.sira) this.el.dataset.konusuyor = '0';
    }
  }

  /** Kıkırdama (hayvan ona bir şey yapınca) */
  kikirda() {
    if (AZ || TEST_MODU) return;
    this.govde.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-3%)' }, { transform: 'translateY(0)' }, { transform: 'translateY(-2%)' }, { transform: 'translateY(0)' }], { duration: 520, easing: 'ease-in-out' });
  }
}
