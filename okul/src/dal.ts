/**
 * Kuşların konduğu dallar (Kaç alkış?, Kuşlar geldi!). Dal görseli kısa (assets/okul/dal.webp: kalın ucu solda,
 * gövde çizimin soldan %69'una kadar düz, sonra yapraklı uca kıvrılır). Uzun bir tünek için dallar ekranın
 * kenarından girer (kalın, kesik uç ekranın dışında kalır):
 *  - 'yan': iki dal karşılıklı, biri soldan biri sağdan (aynalı); kuşlar ikiye bölünür
 *  - 'tek': soldan tek uzun dal
 *  - 'iki-kat': üstte soldan, altta sağdan iki uzun dal (dar ekranda çok kuş)
 * Kuşlar dalın düz gövdesinin üstünde, ayakları gövdeye basar (tünek: CSS .ok-tunek).
 */
import { h } from '../../src/ui/dom';
import { DAL } from './cizim';

export type DalDuzen = 'yan' | 'tek' | 'iki-kat';

/** Dalın düz gövdesi, dal boyunun bu oranı kadar (kalın uçtan) */
const GOVDE = 0.69;
/** Düzenlere göre dal boyu ve ekran dışında kalan kısım (alan eninin oranı) */
const OLCU: Record<DalDuzen, { boy: number; dis: number }> = {
  yan: { boy: 0.6, dis: 0.06 },
  tek: { boy: 1.15, dis: 0.1 },
  'iki-kat': { boy: 1.15, dis: 0.1 },
};

/** Bir tünekteki kuş sığası: kuşlar %8 üst üste binebilir */
export const sigar = (duzen: DalDuzen, en: number, kus: number) => Math.max(1, Math.floor(((OLCU[duzen].boy * GOVDE - OLCU[duzen].dis) * en) / (kus * 0.92)));

/** n kuş (kelebek dahil) için düzen: önce karşılıklı iki dal, sığmazsa tek uzun dal, o da sığmazsa iki kat */
export function dalDuzeni(n: number, en: number, kus: number): DalDuzen {
  if (n <= 2 * sigar('yan', en, kus)) return 'yan';
  if (n <= sigar('tek', en, kus)) return 'tek';
  return 'iki-kat';
}

/** Kabın --ks değeri (kuş boyu, px): ölçü için geçici bir eleman */
export function kusBoyu(kap: HTMLElement): number {
  const olcu = h('i', { style: 'position:absolute;display:block;visibility:hidden;width:var(--ks, 64px);height:1px' });
  kap.append(olcu);
  const w = olcu.getBoundingClientRect().width;
  olcu.remove();
  return w || 64;
}

export class Dallar {
  readonly el: HTMLElement;
  private tunekler: HTMLElement[];
  duzen: DalDuzen = 'yan';
  private n = 1;

  constructor(sinif = '') {
    const dal = (i: number) => {
      const t = h('div.ok-tunek');
      return { el: h(`div.ok-dal.ok-dal-${i}`, { html: DAL(i === 1) }, t), t };
    };
    const d = [dal(0), dal(1)];
    this.tunekler = d.map((x) => x.t);
    this.el = h(`div.ok-dallar${sinif ? '.' + sinif : ''}`, { 'data-duzen': this.duzen }, ...d.map((x) => x.el));
  }

  /** n konuk için düzeni seç (alanın eni ve kuş boyu px) */
  duzenle(n: number, en: number, kus: number) {
    this.n = Math.max(1, n);
    this.duzen = dalDuzeni(this.n, en, kus);
    this.el.dataset.duzen = this.duzen;
  }

  /** i. konuğun tüneği (konuklar sırayla: önce birinci dal dolar) */
  tunek(i: number): HTMLElement {
    if (this.duzen === 'tek') return this.tunekler[0];
    return this.tunekler[i < Math.ceil(this.n / 2) ? 0 : 1];
  }
}
