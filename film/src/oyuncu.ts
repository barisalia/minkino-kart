/**
 * Filmde bir oyuncu: Mino (src/mino, katmanlı iskelet) ya da ortak karakter bileşeni (src/karakter: köpek, tavşan,
 * ördek… iskelet varsa parça parça, yoksa tek görsel). Motor ikisini aynı arayüzle yönetir.
 */
import { Karakter, type HareketAdi } from '../../src/karakter/karakter';
import { Mino, type MinoIfade, type Tepki } from '../../src/mino/mino';
import { h } from '../../src/ui/dom';

const HAYVAN = import.meta.glob<string>('../../assets/hayvanlar/*.webp', { eager: true, query: '?url', import: 'default' });

export class Oyuncu {
  readonly el: HTMLElement;
  /** kutunun en/boy oranı */
  readonly oran: number;
  private mino: Mino | null = null;
  private karakter: Karakter | null = null;

  constructor(readonly tip: string) {
    if (tip === 'mino') {
      this.mino = new Mino();
      this.el = h('div.fl-oyuncu.fl-mino', {}, this.mino.el);
      this.oran = 1360 / 1790;
    } else {
      const url = HAYVAN[`../../assets/hayvanlar/${tip}.webp`] ?? '';
      this.karakter = new Karakter(tip, h('img', { src: url, alt: '', draggable: 'false' }));
      this.el = h('div.fl-oyuncu', {}, this.karakter.el);
      this.oran = 1;
    }
  }

  /** Tepki / hareket (Mino: zipla, sasir, dans, zorlan, sersem, kararsiz, uzat…; karakter: dans, huy, kokla, bak, hayir, ye…) */
  tepki(ad: string, sure?: number) {
    if (this.mino) this.mino.tepki(ad as Tepki, sure);
    else this.karakter?.oynat(ad as HareketAdi, (sure ?? 1.2) * 1000);
  }

  /** Yürüyüş hareketi (karakterin kendi yürüyüşü); yol motorda */
  yuru(sure: number) {
    this.karakter?.oynat('yuru', sure * 1000);
  }

  ifade(ad: string | null, ms = 0) {
    this.mino?.ifade(ad as MinoIfade | null, ms);
    this.karakter?.ifade(ad, ms);
  }

  konus(acik: boolean) {
    if (this.mino) this.mino.agizOyna(acik);
    else this.karakter?.konus(acik);
  }

  kapat() {
    this.mino?.kapat();
    this.karakter?.kapat();
  }
}
