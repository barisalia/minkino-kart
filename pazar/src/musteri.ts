/**
 * Pazar müşterisi: ortak karakter bileşeninin (src/karakter) üstüne pazara özgü davranış.
 * Kendi yürüyüşüyle soldan tezgâha gelir, beklerken huyunu gösterir, isteğini söylerken ağzı oynar,
 * yanlış üründe kafasını sallar; doğru üründe ürünü ağzına götürüp ısırır ("nyam" kırıntıları), kendi dansını yapar,
 * sonra kendi yürüyüşüyle gider. Karakterin iskeleti (assets/karakter-iskelet) varsa parça parça, yoksa tek görselle.
 *
 * Katmanlar: .pz-musteri (yol: giriş/çıkış, WAAPI) > balon + gölge + karakter (duruş: karakter motoru).
 */
import { Karakter } from '../../src/karakter/karakter';
import { h, sure, TEST_MODU } from '../../src/ui/dom';

const AZ = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const ms = (x: number) => (AZ ? Math.min(x, 200) : sure(x));
const ras = (a: number, b: number) => a + Math.random() * (b - a);

export class Musteri {
  readonly el: HTMLElement;
  readonly ad: string;
  readonly karakter: Karakter;
  private huyZaman = 0;
  private mesgul = false;

  constructor(ad: string, cizim: HTMLElement, balon: HTMLElement) {
    this.ad = ad;
    this.karakter = new Karakter(ad, cizim);
    this.el = h('div.pz-musteri.pz-kisilik', { 'data-musteri': ad, 'data-yuruyus': this.karakter.k.yuruyus }, balon, h('i.pz-m-golge'), h('div.pz-m-govde', {}, this.karakter.el));
  }

  private get k() {
    return this.karakter.k;
  }

  /** Kendi yürüyüşüyle soldan tezgâha gelir; varınca basıp durur */
  async gel() {
    this.mesgul = true;
    const k = this.k;
    const yol: Keyframe[] =
      k.yuruyus === 'uc'
        ? [
            { transform: 'translate(-110%, -120%)', easing: 'cubic-bezier(0.3, 0.1, 0.4, 1)' },
            { transform: 'translate(-30%, -45%)', offset: 0.6, easing: 'cubic-bezier(0.4, 0, 0.3, 1)' },
            { transform: 'translate(0, 0)' },
          ]
        : [{ transform: 'translateX(-120%)', easing: k.yuruyus === 'agir' ? 'cubic-bezier(0.3, 0, 0.5, 1)' : 'cubic-bezier(0.25, 0.1, 0.35, 1)' }, { transform: 'translateX(0)' }];
    const git = this.el.animate(yol, { duration: ms(k.gelis), fill: 'both' });
    // adım sayısı tam olsun: varışta ayak yere basmış olur
    const adim = Math.max(1, Math.round(k.gelis / k.adim));
    void this.karakter.oynat('yuru', adim * k.adim);
    await git.finished.catch(() => undefined);
    git.cancel();
    await this.karakter.oynat('var', 420);
    this.mesgul = false;
  }

  /** Beklerken ara sıra kendi huyunu gösterir */
  bekle(acik: boolean) {
    clearTimeout(this.huyZaman);
    if (!acik || AZ || TEST_MODU) return;
    const plan = () => {
      this.huyZaman = window.setTimeout(async () => {
        if (!this.el.isConnected) return;
        if (!this.mesgul && !this.karakter.mesgul) await this.karakter.oynat('huy', this.k.huy === 'esne' ? 1700 : 1000);
        plan();
      }, ras(2600, 4800));
    };
    plan();
  }

  /** İsteğini söylerken ağzı açılıp kapanır */
  konus(acik: boolean) {
    this.karakter.konus(acik);
  }

  /** Yanlış ürün: kafasını iki yana sallar; üzgün ifadesi olan karakter kısa süre üzülür */
  hayir() {
    this.karakter.ifade('uzgun', 1500);
    return this.karakter.oynat('hayir', 650);
  }

  /** Ürünü alır, ağzına götürüp üç ısırıkta yer (her ısırıkta kırıntılar, "Nyam!"); para ise yalnız sevinir */
  async ye(resim: HTMLElement | null, renk: string, nyam: string) {
    this.mesgul = true;
    this.bekle(false);
    if (!resim) return;
    const [ax, ay] = this.k.agiz;
    const lokma = h('div.pz-m-lokma', { style: `left:${ax * 100}%;top:${ay * 100}%` }, resim);
    this.el.append(lokma);
    await lokma
      .animate(
        [
          { transform: 'translate(-50%, -50%) translate(-60%, 60%) scale(0.2)', opacity: 0 },
          { transform: 'translate(-50%, -50%) scale(1.15)', opacity: 1, offset: 0.7 },
          { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        ],
        { duration: ms(380), easing: 'cubic-bezier(0.3, 1.5, 0.5, 1)', fill: 'forwards' },
      )
      .finished.catch(() => undefined);
    const yazi = h('b.pz-m-nyam', { style: `left:${ax * 100}%;top:${ay * 100 - 18}%` }, nyam);
    this.el.append(yazi);
    void this.karakter.oynat('ye', 1100);
    await new Promise((r) => setTimeout(r, ms(120)));
    for (let i = 0; i < 3; i++) {
      const kalan = 1 - (i + 1) / 3;
      lokma.animate(
        [{ transform: `translate(-50%, -50%) scale(${(kalan + 1 / 3).toFixed(2)})` }, { transform: `translate(-50%, -50%) scale(${Math.max(0.05, kalan).toFixed(2)}) rotate(${i % 2 ? -8 : 8}deg)` }],
        { duration: ms(200), fill: 'forwards' },
      );
      this.kirinti(ax, ay, renk);
      await new Promise((r) => setTimeout(r, ms(330)));
    }
    lokma.remove();
    setTimeout(() => yazi.remove(), ms(500));
  }

  /** Kırıntı parçacıkları: ağızdan saçılıp yerçekimiyle düşer */
  private kirinti(ax: number, ay: number, renk: string) {
    if (AZ || TEST_MODU) return;
    for (let i = 0; i < 6; i++) {
      const p = h('i.pz-m-kirinti', { style: `left:${ax * 100}%;top:${ay * 100}%;background:${renk}` });
      this.el.append(p);
      const dx = ras(-60, 60);
      const dy = ras(-50, -15);
      p.animate(
        [
          { transform: 'translate(0, 0) scale(1)', opacity: 1 },
          { transform: `translate(${dx * 0.6}px, ${dy}px) scale(0.9)`, opacity: 1, offset: 0.35, easing: 'ease-in' },
          { transform: `translate(${dx}px, ${-dy * 1.6}px) scale(0.6) rotate(120deg)`, opacity: 0 },
        ],
        { duration: 650, easing: 'ease-out' },
      ).finished.then(
        () => p.remove(),
        () => p.remove(),
      );
    }
  }

  /** Kendi sevinç dansı */
  dans() {
    const d = this.k.dans;
    return this.karakter.oynat('dans', d === 'gobek' || d === 'don' || d === 'kanat' ? 1400 : d === 'salto' ? 1100 : 1300);
  }

  /** Sevinçle kendi yürüyüşüyle sola doğru gider */
  async git() {
    this.mesgul = true;
    this.bekle(false);
    const k = this.k;
    const sure = Math.max(700, k.gelis * 0.7);
    const yol: Keyframe[] = k.yuruyus === 'uc' ? [{ transform: 'translate(0, 0)' }, { transform: 'translate(-120%, -130%)' }] : [{ transform: 'translateX(0)' }, { transform: 'translateX(-125%)' }];
    const git = this.el.animate(yol, { duration: ms(sure), easing: 'cubic-bezier(0.5, 0, 0.75, 0.4)', fill: 'forwards' });
    void this.karakter.oynat('yuru', sure);
    await git.finished.catch(() => undefined);
  }

  kapat() {
    clearTimeout(this.huyZaman);
    this.karakter.kapat();
    this.el.getAnimations({ subtree: true }).forEach((a) => a.cancel());
  }
}
