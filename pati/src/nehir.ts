/**
 * Pati Dükkânı: Nehir abla, anlatıcı (belden yukarı, sol altta; dikey telefonda altta büyük).
 * Anlatıcı sayfası (G6) taban karesi "a" ağzıyla çizili (5. kare); konuşurken ağız yamaları (o, e, kapalı) dudak
 * senkronuyla değişir (src/audio/dudak.ts: kayıt varsa sesin zarfı, yoksa metnin hece ritmi). Susunca kapalı gülümseme.
 * Göz kırpma: kahkaha karesinin kapalı gözleri yama olarak 140 ms. Konuşurken bütün gövde hafifçe yaylanır.
 * "Yanlış" demez; övgüsünü hayvan üzerinden yapar. Cümleler content/pati.json → nehir.
 */
import agizJson from '../../assets/pati/nehir-agiz.json';
import gozJson from '../../assets/pati/goz-yama.json';
import { Dudak, type AgizSekli } from '../../src/audio/dudak';
import type { Soylenecek } from '../../src/audio/konusma';
import { konus } from '../../src/audio/ses';
import { h, TEST_MODU } from '../../src/ui/dom';
import { adres, NEHIR } from './varliklar';

const AZ = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
type Kutu = { x: number; y: number; w: number; h: number };
const kutuStil = (k: Kutu) => `left:${k.x * 100}%;top:${k.y * 100}%;width:${k.w * 100}%;height:${k.h * 100}%`;

/** Dudak şekli → ağız yaması (null: taban karenin kendi "a" ağzı) */
const AGIZ: Record<AgizSekli, 'o' | 'e' | 'kapali' | null> = { kapali: 'kapali', gulumse: 'kapali', az: 'o', yuvarlak: 'o', orta: null, dis: 'e' };

export class Nehir {
  readonly el: HTMLElement;
  private govde: HTMLElement;
  private agiz: HTMLImageElement | null = null;
  private goz: HTMLImageElement | null = null;
  private agizlar: Partial<Record<'o' | 'e' | 'kapali', string>> = {};
  private dudak = new Dudak();
  private sira = 0;
  private konusuyor = false;
  private raf = 0;
  private kirpZaman = performance.now() + 3000;
  private kapandi = false;

  constructor() {
    const taban = adres('nehir-anlatici-5');
    const resim = h('img.pt-nehir-resim', { src: taban ?? NEHIR, alt: 'Nehir abla', draggable: 'false' });
    const kat = h('div.pt-nehir-kat', {}, resim);
    const ak = (agizJson as { agiz?: Kutu }).agiz;
    if (taban && ak) {
      for (const a of ['o', 'e', 'kapali'] as const) {
        const u = adres(`nehir-agiz-${a}`);
        if (u) this.agizlar[a] = u;
      }
      if (this.agizlar.kapali) {
        this.agiz = h('img.pt-nehir-agiz', { src: this.agizlar.kapali, alt: '', style: kutuStil(ak) }) as HTMLImageElement;
        kat.append(this.agiz);
      }
      const gk = (gozJson as Record<string, Kutu>)['nehir-anlatici'];
      const gu = adres('nehir-anlatici-goz-yama');
      if (gk && gu) {
        this.goz = h('img.pt-nehir-goz', { src: gu, alt: '', style: kutuStil(gk) }) as HTMLImageElement;
        kat.append(this.goz);
      }
    }
    this.govde = h('div.pt-nehir-govde', {}, kat);
    this.el = h(`div.pt-nehir${taban ? '.pt-nehir-anlatici' : ''}`, { 'data-konusuyor': '0' }, this.govde);
    if (this.agiz || this.goz) this.raf = requestAnimationFrame(this.kare);
  }

  /** Her kare: ağız şekli ve göz kırpma */
  private kare = (t: number) => {
    if (this.kapandi) return;
    if (this.agiz) {
      const sekil = this.dudak.kare(t, this.konusuyor);
      const a = AGIZ[sekil];
      const u = a ? this.agizlar[a] : null;
      if (u) {
        if (this.agiz.getAttribute('src') !== u) this.agiz.src = u;
        this.agiz.hidden = false;
      } else this.agiz.hidden = true;
    }
    if (this.goz && t >= this.kirpZaman) {
      this.goz.classList.add('acik');
      const g = this.goz;
      setTimeout(() => g.classList.remove('acik'), 140);
      this.kirpZaman = t + 2400 + Math.random() * 3000;
    }
    this.raf = requestAnimationFrame(this.kare);
  };

  /** Söyler (bitince çözülür); konuşurken ağız oynar, gövde yaylanır */
  async soyle(metin: Soylenecek) {
    const no = ++this.sira;
    this.el.dataset.konusuyor = '1';
    this.konusuyor = true;
    this.dudak.hazirla({ metin: [metin].flat().filter(Boolean).join(' ') });
    if (!AZ && !TEST_MODU) this.govde.animate([{ transform: 'scale(1,1)' }, { transform: 'scale(1.03,.97)', offset: 0.3 }, { transform: 'scale(.99,1.02)', offset: 0.65 }, { transform: 'scale(1,1)' }], { duration: 320, easing: 'ease-out' });
    try {
      await konus(metin);
    } finally {
      if (no === this.sira) {
        this.el.dataset.konusuyor = '0';
        this.konusuyor = false;
      }
    }
  }

  kapat() {
    this.kapandi = true;
    cancelAnimationFrame(this.raf);
  }
}
