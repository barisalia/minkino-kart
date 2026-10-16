/**
 * Pati Dükkânı v2: bir arka plan resmi (2752×1536 "sahne birimi") ve üstündeki katman. Kamera yok, yakınlaşma yok:
 * resim ekrana yalnız sığdırılır ve kaydırılır.
 *
 * NETLİK (src/ui/netlik.ts, Barış: "zoom yapma"): ölçek en çok 1/3 (DPR 3'te 1 css px = 3 cihaz pikseli = 1 resim
 * pikseli). Yatay telefonda (844×390) kaplama ölçeği 0,307: sınırın altında. Daha büyük ekranda resim büyümez, kenarlar
 * zemin rengiyle kalır.
 *  - yatay: resim ekranı kaplar; `yatay` bölgesinin ortası ekranın ortasına (resmin dışına taşmadan)
 *  - dikey: `dikey` bölgesi ekranın genişliğine sığar, üstten `dikeyUst` px aşağıda başlar
 */
import { h } from '../../src/ui/dom';
import { NETLIK_DPR } from '../../src/ui/netlik';
import { ARKA_H, ARKA_W } from './varliklar';

export interface Bolge {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}
export interface DekorSecenek {
  yatay: Bolge;
  dikey: Bolge;
  dikeyUst?: (H: number) => number;
}

export const sinirla = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const ENCOK_OLCEK = 1 / NETLIK_DPR;

export class Dekor {
  readonly el: HTMLElement;
  readonly sahne: HTMLElement;
  readonly resim: HTMLImageElement;
  /** sahne biriminde yerleşen her şey (hayvanlar, dokunma alanları) */
  readonly katman: HTMLElement;
  s = 0.3;
  tx = 0;
  ty = 0;
  private ro: ResizeObserver | null = null;
  /** her kuruluşta (ekran döndü, boyut değişti) */
  degisti: () => void = () => undefined;

  constructor(
    url: string,
    private o: DekorSecenek,
    sinif = '',
  ) {
    this.resim = h('img.pt-dekor-resim', { src: url, alt: '', draggable: 'false' }) as HTMLImageElement;
    this.katman = h('div.pt-dekor-katman');
    this.sahne = h('div.pt-dekor-sahne', { style: `width:${ARKA_W}px;height:${ARKA_H}px` }, this.resim, this.katman);
    this.el = h(`div.pt-dekor${sinif ? `.${sinif}` : ''}`, {}, this.sahne);
    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver(() => this.kur());
      this.ro.observe(this.el);
    }
  }

  get dikey() {
    return this.el.clientHeight > this.el.clientWidth;
  }

  kur() {
    const W = this.el.clientWidth || 844;
    const H = this.el.clientHeight || 390;
    let s: number;
    let tx: number;
    let ty: number;
    if (H > W) {
      const b = this.o.dikey;
      s = Math.min(ENCOK_OLCEK, W / (b.x1 - b.x0));
      tx = sinirla(W / 2 - s * ((b.x0 + b.x1) / 2), Math.min(0, W - ARKA_W * s), 0);
      ty = (this.o.dikeyUst?.(H) ?? 0) - s * b.y0;
    } else {
      const b = this.o.yatay;
      s = Math.min(ENCOK_OLCEK, Math.max(W / ARKA_W, H / ARKA_H));
      const gw = ARKA_W * s;
      const gh = ARKA_H * s;
      tx = gw <= W ? (W - gw) / 2 : sinirla(W / 2 - s * ((b.x0 + b.x1) / 2), W - gw, 0);
      ty = gh <= H ? (H - gh) / 2 : sinirla(H / 2 - s * ((b.y0 + b.y1) / 2), H - gh, 0);
    }
    this.s = s;
    this.tx = tx;
    this.ty = ty;
    this.sahne.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${s.toFixed(5)})`;
    this.sahne.style.setProperty('--s', s.toFixed(5));
    this.degisti();
  }

  /** Sahne biriminden dekorun içindeki ekran noktasına */
  ekrana(x: number, y: number): [number, number] {
    return [this.tx + x * this.s, this.ty + y * this.s];
  }

  kapat() {
    this.ro?.disconnect();
  }
}
