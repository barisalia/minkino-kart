/**
 * Alet sepeti (assets/giysin/esya-sepet): 2 × 2. Arkada uzunlar (merdiven, kaşık) sepetin içinden yükselir; önde
 * stetoskop kenardan sarkar, sulama kabı sepetin önünde durur. Her aletin kendi dokunma kutusu (sepetin çeyreği).
 * Odada ve dert sahnesinde aynı sepet. Sepetin gövdesine hızlı üç dokunuş: banyo ördeği (gizli sürpriz 1).
 */
import { h } from '../../src/ui/dom';
import { aletParcasi, type Alet, type ParcaId } from './model';
import { gorsel, parcaKostum, parcaResmi } from './resimler';

/** Sepetin eni = 1 birim; kutunun boyu */
export const SEPET_BOY = 1.55;
/** sepet resminin (600×627) kutudaki yeri: alttan */
const SEPET_UST = SEPET_BOY - 627 / 600;

interface Yer {
  /** resmin merkezi x, üstü y (birim: sepetin eni), resmin boyu (eni oranından) */
  x: number;
  y: number;
  boy: number;
  on: boolean;
  /** dokunma kutusu [x0, y0, x1, y1] */
  kutu: [number, number, number, number];
}
const YERLER: Record<Alet, Yer> = {
  merdiven: { x: 0.3, y: 0.02, boy: 0.98, on: false, kutu: [0, 0, 0.5, 0.62] },
  kasik: { x: 0.7, y: 0.14, boy: 0.84, on: false, kutu: [0.5, 0, 1, 0.62] },
  stetoskop: { x: 0.25, y: 0.62, boy: 0.56, on: true, kutu: [0, 0.62, 0.48, 1.2] },
  sulama: { x: 0.72, y: 1.08, boy: 0.38, on: true, kutu: [0.5, 1.02, 1, SEPET_BOY] },
};
export const SEPET_SIRA: Alet[] = ['merdiven', 'kasik', 'stetoskop', 'sulama'];

export class Sepet {
  readonly el: HTMLElement;
  readonly govde: HTMLImageElement;
  readonly resim: Record<Alet, HTMLImageElement> = {} as Record<Alet, HTMLImageElement>;
  readonly dugme: Record<Alet, HTMLButtonElement> = {} as Record<Alet, HTMLButtonElement>;

  constructor(sinif = '') {
    this.govde = h('img.mg-sepet-govde', { src: gorsel('giysin/esya-sepet'), alt: '', draggable: 'false', style: `top:${((SEPET_UST / SEPET_BOY) * 100).toFixed(2)}%` }) as HTMLImageElement;
    const arka: HTMLElement[] = [];
    const on: HTMLElement[] = [];
    const dugmeler: HTMLElement[] = [];
    for (const a of SEPET_SIRA) {
      const y = YERLER[a];
      const id = aletParcasi(a);
      const [, , kw, kh] = parcaKostum(id).kutu;
      const en = (y.boy * kw) / kh;
      const im = h('img.mg-sepet-alet', {
        src: parcaResmi(id),
        alt: '',
        draggable: 'false',
        'data-alet': a,
        style: `left:${((y.x - en / 2) * 100).toFixed(2)}%;top:${((y.y / SEPET_BOY) * 100).toFixed(2)}%;width:${(en * 100).toFixed(2)}%;height:${((y.boy / SEPET_BOY) * 100).toFixed(2)}%`,
      }) as HTMLImageElement;
      this.resim[a] = im;
      (y.on ? on : arka).push(im);
      const [x0, y0, x1, y1] = y.kutu;
      const b = h('button.mg-sepet-dugme', {
        type: 'button',
        'data-parca': id,
        'data-alet': a,
        'aria-label': a,
        style: `left:${(x0 * 100).toFixed(2)}%;top:${((y0 / SEPET_BOY) * 100).toFixed(2)}%;width:${((x1 - x0) * 100).toFixed(2)}%;height:${(((y1 - y0) / SEPET_BOY) * 100).toFixed(2)}%`,
      }) as HTMLButtonElement;
      this.dugme[a] = b;
      dugmeler.push(b);
    }
    this.el = h(`div.mg-sepet${sinif ? '.' + sinif : ''}`, {}, ...arka, this.govde, ...on, ...dugmeler);
  }

  /** Aletin sepette olup olmadığı (Mino'nun elindeyse yeri boş) */
  bosalt(a: Alet | null) {
    for (const x of SEPET_SIRA) {
      this.resim[x].classList.toggle('elde', x === a);
      this.dugme[x].classList.toggle('elde', x === a);
    }
  }

  /** Aletin sepetteki merkezi (ekranda) ve boyu */
  aletKutusu(a: Alet): DOMRect {
    return this.resim[a].getBoundingClientRect();
  }

  static parca(a: Alet): ParcaId {
    return aletParcasi(a);
  }
}
