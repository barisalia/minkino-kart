/**
 * Dertteki arkadaşlar: Pamuk, Kino, Ege, Ada (hazır iskeletler, src/karakter/karakter.ts). Boylar tek tablodan
 * (src/karakter/boy.ts → boyGenislik: Mino'nun kutusuna göre). Bütün gövde hareketi .mg-ark-ic'te (taban pivotlu
 * ezilme-esneme, öteleme; döndürme yok). Konuşma balonu başın üstünde (Ege'nin sesi yok: balon; Pamuk: miyav).
 *
 * Pamuk'un ağaç pozları (G-MG2) geldiyse iskeletin yerine poz resmi görünür (120 ms ezilme-esneme geçişi);
 * gelmediyse iskelet ve ifadeleri (bekle: üzgün, korku: utanmış + titreme, sevinç: mutlu).
 */
import { boyGenislik, CIZIM } from '../../src/karakter/boy';
import { Karakter, type HareketAdi } from '../../src/karakter/karakter';
import { h, TEST_MODU } from '../../src/ui/dom';
import { bekle, hopla, ms, oynat } from './anim';
import type { Dert } from './model';
import { pamukPozlariVar, pamukPozu, type PamukPoz } from './resimler';

export class Arkadas {
  readonly el: HTMLElement;
  readonly ic: HTMLElement;
  readonly karakter: Karakter;
  private balonEl: HTMLElement;
  private pozEl: HTMLImageElement | null = null;
  private balonZaman = 0;
  private kirpZaman = 0;
  private pozSu: PamukPoz | null = null;

  constructor(readonly ad: Dert) {
    this.karakter = new Karakter(ad, h('div'));
    this.balonEl = h('div.mg-ark-balon', { 'aria-hidden': 'true' });
    this.ic = h('div.mg-ark-ic', {}, this.karakter.el);
    if (ad === 'pamuk' && pamukPozlariVar()) {
      this.pozEl = h('img.mg-ark-poz', { alt: '', draggable: 'false' }) as HTMLImageElement;
      this.ic.append(this.pozEl);
    }
    this.el = h('div.mg-ark', { 'data-kim': ad }, this.ic, this.balonEl);
  }

  /** Mino'nun kutu genişliğine göre kutu genişliği (tablodaki boy × ölçek) */
  static en(ad: Dert, minoW: number, olcek = 1): number {
    return boyGenislik(ad, minoW) * olcek;
  }
  /** Kutunun içinde figürün tepesi ve tabanı (oran) */
  static figur(ad: Dert): { tepe: number; taban: number } {
    const c = CIZIM[ad];
    return { tepe: c.tepe / c.kutu[1], taban: c.taban / c.kutu[1] };
  }

  ifade(ad: string | null, sure = 0) {
    if (!ad || this.karakter.ifadeVar(ad)) this.karakter.ifade(ad, TEST_MODU ? Math.min(sure, 30) : sure);
  }
  oynat(ad: HareketAdi, sure: number) {
    return this.karakter.oynat(ad, sure);
  }

  /** Pamuk'un poz resmi (yoksa iskelet ifadesi). 'bekle'de ara ara göz kırpar ('kirp' karosu) */
  poz(p: PamukPoz | null, yedekIfade: string | null = null) {
    clearInterval(this.kirpZaman);
    if (this.pozEl && p === 'bekle' && !TEST_MODU) {
      this.kirpZaman = window.setInterval(() => {
        if (!this.pozEl || this.pozSu !== 'bekle') return;
        this.pozEl.src = pamukPozu('kirp');
        window.setTimeout(() => this.pozSu === 'bekle' && this.pozEl && (this.pozEl.src = pamukPozu('bekle')), 150);
      }, 2600 + Math.random() * 1500);
    }
    this.pozSu = p;
    if (this.pozEl && p) {
      const src = pamukPozu(p);
      if (this.pozEl.getAttribute('src') !== src) {
        this.pozEl.src = src;
        void oynat(this.pozEl, [{ transform: 'scale(1.08, 0.9)' }, { transform: 'scale(0.97, 1.04)', offset: 0.6 }, { transform: 'scale(1,1)' }], 120);
      }
      this.el.classList.add('pozlu');
      return;
    }
    this.el.classList.remove('pozlu');
    this.ifade(yedekIfade);
  }

  /** Başın üstünde balon (yazı ya da küçük resim); ms sonra kapanır */
  balon(icerik: string | HTMLElement, sure = 1800) {
    clearTimeout(this.balonZaman);
    this.balonEl.replaceChildren(typeof icerik === 'string' ? h('span', {}, icerik) : icerik);
    this.balonEl.classList.add('acik');
    void oynat(this.balonEl, [{ transform: 'translateX(-50%) scale(0.4)', opacity: 0 }, { transform: 'translateX(-50%) scale(1.08)', opacity: 1, offset: 0.6 }, { transform: 'translateX(-50%) scale(1)', opacity: 1 }], 260);
    this.balonZaman = window.setTimeout(() => this.balonEl.classList.remove('acik'), ms(sure));
  }

  hopla(guc = 1) {
    return hopla(this.ic, guc);
  }

  /** Sevinç: mutlu yüz, hop hop */
  async sevin() {
    this.ifade(this.ad === 'ege' ? 'kikir' : this.ad === 'kino' ? 'heyecan' : 'mutlu', 2200);
    void this.oynat('sevin', 1400);
    await this.hopla(1);
    await this.hopla(0.7);
  }

  /** Titreme (korku, üşüme): yalnız yatay öteleme */
  async titre(sure = 700) {
    await oynat(this.ic, Array.from({ length: 9 }, (_, i) => ({ transform: `translateX(${i % 2 ? 3 : -3}px)` })).concat([{ transform: 'translateX(0)' }]), sure);
  }

  async bekle(n: number) {
    await bekle(n);
  }

  kapat() {
    clearTimeout(this.balonZaman);
    clearInterval(this.kirpZaman);
    this.karakter.kapat();
  }
}
