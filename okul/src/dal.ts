/**
 * Kuşların konduğu dallar (Kaç alkış?, Kuşlar geldi!). Dal görseli uzun ve ince (assets/okul/dal.webp: kalın kesik
 * ucu solda, dik yükselir, sonra hafifçe inen ince gövde, ucunda yapraklar). Dal hiç esnemez (kutu çizimin oranında);
 * kesik uç ekranın kenarında kalır:
 *  - 'yan': iki dal karşılıklı, biri soldan biri sağdan (aynalı); kuşlar ikiye bölünür
 *  - 'tek': soldan tek uzun dal
 *  - 'iki-kat': üstte soldan, altta sağdan iki uzun dal (dar ekranda çok kuş)
 * Kuşlar gövdenin tünek kısmında (cizim.ts → DAL_TUNEK) durur; her kuşun ayağı, durduğu yerdeki gövde çizgisine
 * basar (DAL_UST: gövde eğimli, kuşlar da onunla iner).
 */
import { h } from '../../src/ui/dom';
import { cizimOrani, DAL, DAL_TUNEK, dalUstu } from './cizim';

export type DalDuzen = 'yan' | 'tek' | 'iki-kat';

/** Dalın tünek olan kısmı, dal boyunun bu oranı kadar */
const TUNEK = DAL_TUNEK[1] - DAL_TUNEK[0];
/** Düzenlere göre dal boyu (alan eninin oranı; CSS .ok-dal-0 / .ok-dal-1 ile aynı) */
const OLCU: Record<DalDuzen, { boy: number }> = {
  yan: { boy: 0.6 },
  tek: { boy: 1.15 },
  'iki-kat': { boy: 1.15 },
};

/** Bir tünekteki kuş sığası: kuşlar %8 üst üste binebilir */
export const sigar = (duzen: DalDuzen, en: number, kus: number) => Math.max(1, Math.floor((OLCU[duzen].boy * TUNEK * en) / (kus * 0.92)));

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
  private dallar: HTMLElement[];
  private tunekler: HTMLElement[];
  duzen: DalDuzen = 'yan';
  private n = 1;
  private gozcu: MutationObserver | null = null;
  private boyGozcu: ResizeObserver | null = null;

  constructor(sinif = '') {
    const dal = (i: number) => {
      const t = h('div.ok-tunek');
      return { el: h(`div.ok-dal.ok-dal-${i}`, { html: DAL(i === 1) }, t), t };
    };
    const d = [dal(0), dal(1)];
    this.dallar = d.map((x) => x.el);
    this.tunekler = d.map((x) => x.t);
    this.el = h(
      `div.ok-dallar${sinif ? '.' + sinif : ''}`,
      { 'data-duzen': this.duzen, style: `--dal-oran:${cizimOrani('okul/dal').toFixed(4)};--tunek-bas:${(DAL_TUNEK[0] * 100).toFixed(1)}%;--tunek-son:${((1 - DAL_TUNEK[1]) * 100).toFixed(1)}%` },
      ...d.map((x) => x.el),
    );
    // kuş eklenince / çıkınca, ekran boyu değişince ayaklar gövdeye yeniden oturur (çizimden önce: titreme yok)
    if (typeof MutationObserver !== 'undefined') {
      this.gozcu = new MutationObserver(() => this.otur());
      for (const t of this.tunekler) this.gozcu.observe(t, { childList: true });
    }
    if (typeof ResizeObserver !== 'undefined') {
      this.boyGozcu = new ResizeObserver(() => this.otur());
      this.boyGozcu.observe(this.el);
    }
  }

  /** n konuk için düzeni seç (alanın eni ve kuş boyu px) */
  duzenle(n: number, en: number, kus: number) {
    this.n = Math.max(1, n);
    this.duzen = dalDuzeni(this.n, en, kus);
    this.el.dataset.duzen = this.duzen;
    this.otur();
  }

  /** i. konuğun tüneği (konuklar sırayla: önce birinci dal dolar) */
  tunek(i: number): HTMLElement {
    if (this.duzen === 'tek') return this.tunekler[0];
    return this.tunekler[i < Math.ceil(this.n / 2) ? 0 : 1];
  }

  /**
   * Her konuğun ayağı durduğu yerdeki gövde çizgisine: tünek dalın üst kenarında, konuk gövde çizgisinin yüksekliği
   * kadar aşağı iner (yerleşim ölçüleri: dönüşümler, uçuş animasyonları sayılmaz).
   */
  otur() {
    if (!this.el.isConnected) return;
    this.dallar.forEach((dal, d) => {
      const en = dal.offsetWidth;
      const boy = dal.offsetHeight;
      if (!en || !boy) return;
      const t = this.tunekler[d];
      for (const k of t.children as HTMLCollectionOf<HTMLElement>) {
        const x = (t.offsetLeft + k.offsetLeft + k.offsetWidth / 2) / en;
        const u = d === 1 ? 1 - x : x;
        // ayaklar gövdenin çizgisine biraz gömülür (konuk boyunun %4'ü)
        k.style.marginBottom = `${-(dalUstu(u) * boy + k.offsetHeight * 0.043).toFixed(1)}px`;
      }
    });
  }
}
