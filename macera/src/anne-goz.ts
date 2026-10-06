/**
 * Annenin göz kırpması (Ege ve Salıncak): ayakta ve sarılıyor çizimlerinin iskeletindeki gizli `goz-kapali` katmanı
 * (assets/karakter-iskelet/anne.svg, anne-sariliyor.svg) img'nin tam üstüne, aynı kutuya konur ve 3-6 sn'de bir
 * ~120 ms görünür (öbür karakterlerin kırpışı gibi). Katman yalnız kapalı göz yamasıdır: gerisi alttaki img.
 */
import { h } from '../../src/ui/dom';

const SVGLER = import.meta.glob<string>('../../assets/karakter-iskelet/anne*.svg', { query: '?url', import: 'default', eager: true });
export type AnneGozPoz = 'anne' | 'anne-sariliyor';

/** Çizimin kapalı göz katmanı (svg dizesi, viewBox'lı); yüklenemezse null */
const katmanlar = new Map<AnneGozPoz, Promise<string | null>>();
function katman(ad: AnneGozPoz): Promise<string | null> {
  let p = katmanlar.get(ad);
  if (!p) {
    const url = SVGLER[`../../assets/karakter-iskelet/${ad}.svg`];
    p = !url
      ? Promise.resolve(null)
      : fetch(url)
          .then((r) => (r.ok ? r.text() : ''))
          .then((t) => {
            const d = new DOMParser().parseFromString(t, 'image/svg+xml');
            const svg = d.documentElement;
            const g = d.getElementById('goz-kapali');
            const vb = svg.getAttribute('viewBox');
            if (!g || !vb) return null;
            g.removeAttribute('display');
            return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${vb}" width="100%" height="100%">${new XMLSerializer().serializeToString(g)}</svg>`;
          })
          .catch(() => null);
    katmanlar.set(ad, p);
  }
  return p;
}

export class AnneGoz {
  readonly el: HTMLElement;
  private ad: AnneGozPoz | null = null;
  private zaman = 0;
  private kapali = 0;
  private bitti = false;

  constructor() {
    this.el = h('div.anne-goz', { 'aria-hidden': 'true' });
    Object.assign(this.el.style, { position: 'absolute', left: '0', top: '0', width: '100%', pointerEvents: 'none', visibility: 'hidden', zIndex: '1' });
    this.sirala();
  }

  /** Görünen çizim (null: kırpışsız poz, ör. uyuyor) */
  poz(ad: AnneGozPoz | null) {
    if (ad === this.ad) return;
    this.ad = ad;
    this.el.innerHTML = '';
    this.el.style.visibility = 'hidden';
    if (!ad) return;
    void katman(ad).then((s) => {
      if (this.ad !== ad || !s || this.bitti) return;
      this.el.innerHTML = s;
      const vb = this.el.querySelector('svg')?.getAttribute('viewBox')?.split(/\s+/).map(Number);
      if (vb && vb[2] && vb[3]) this.el.style.aspectRatio = `${vb[2]} / ${vb[3]}`;
    });
  }

  private sirala() {
    this.zaman = window.setTimeout(() => {
      if (this.bitti) return;
      if (this.ad && this.el.firstChild) {
        this.el.style.visibility = 'visible';
        this.kapali = window.setTimeout(() => {
          this.el.style.visibility = 'hidden';
        }, 120);
      }
      this.sirala();
    }, 3000 + Math.random() * 3000);
  }

  kapat() {
    this.bitti = true;
    clearTimeout(this.zaman);
    clearTimeout(this.kapali);
  }
}
