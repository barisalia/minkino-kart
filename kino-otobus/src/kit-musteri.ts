/**
 * Kino'nun Otobüsü V3: Kino'nun ailesi müşteri (Lokum, Anne, Baba, Babaanne, Dede). Seri 2 kesme kukla kitleri
 * (assets/karakter/<ad>/<ad>.json, film/src/kukla.ts) YALNIZ dinlenme duruşunda çizilir: eklem açısı 0, parça
 * döndürme yok. Canlılık yüz setleriyle (göz kırpma, mutlu / şaşkın / kapalı göz, konuşurken ağız, kaş) ve bütün
 * gövdeyle (nefes, hop, ezilme-esneme: CSS / WAAPI) verilir.
 *
 * Çizim canvas'a, ekrandaki boy × DPR (kitin kendi pikselini aşmaz: netlik). Yüz kutuları (src/karakter/yuz.ts) için
 * görünmez .m-goz / .m-agiz işaretleri kitin göz ve ağız yuvalarının yerinde durur.
 */
import { Kukla, type KuklaIskelet } from '../../film/src/kukla';
import anneJson from '../../assets/karakter/anne/anne.json';
import babaJson from '../../assets/karakter/baba/baba.json';
import lokumJson from '../../assets/karakter/lokum/lokum.json';
import babaanneJson from '../../assets/karakter/babaanne/babaanne.json';
import dedeJson from '../../assets/karakter/dede/dede.json';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { AZ_HAREKET } from './efekt';

const GORSEL: Record<string, string> = {
  ...import.meta.glob<string>('../../assets/karakter/anne/*.webp', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob<string>('../../assets/karakter/baba/*.webp', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob<string>('../../assets/karakter/lokum/*.webp', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob<string>('../../assets/karakter/babaanne/*.webp', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob<string>('../../assets/karakter/dede/*.webp', { eager: true, query: '?url', import: 'default' }),
};
type KitJson = KuklaIskelet & { tepe: number };
const KITLER: Record<string, KitJson> = {
  anne: anneJson as unknown as KitJson,
  baba: babaJson as unknown as KitJson,
  lokum: lokumJson as unknown as KitJson,
  babaanne: babaanneJson as unknown as KitJson,
  dede: dedeJson as unknown as KitJson,
};
export const kitVar = (ad: string) => !!KITLER[ad];

/** Kitin ölçüsü (src/karakter/boy.ts → Cizim gibi) ve bel (kalçanın üstü: tezgâh çizgisi), figürün oranı olarak */
export function kitOlcu(ad: string): { kutu: [number, number]; tepe: number; taban: number; bel: number } | null {
  const k = KITLER[ad];
  if (!k) return null;
  const kalca = k.parcalar.kalca?.kutu;
  const bel = kalca ? (kalca[1] - k.tepe) / (k.zemin - k.tepe) : 0.55;
  return { kutu: k.boyut, tepe: k.tepe, taban: k.zemin, bel };
}

const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, AZ_HAREKET ? Math.min(ms, 200) : sure(ms)));
const KONUSMA_AGIZ = ['agiz-orta', 'agiz-az', 'agiz-genis', 'agiz-o', 'agiz-az', 'agiz-e'];

/** Ailenin bir üyesi: dinlenme duruşunda kukla (canvas) */
export class KitKisi {
  readonly el: HTMLElement;
  readonly hazir: Promise<void>;
  private kukla: Kukla;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private govde: HTMLElement;
  private kapandi = false;
  private ifadeBitis = 0;
  private ifadeAd: 'mutlu' | 'saskin' | 'keyif' | null = null;
  private konusuyor = false;
  private kirpZaman = performance.now() + 1500 + Math.random() * 2000;
  private raf = 0;
  private sonCiz = '';
  private ro: ResizeObserver | null = null;
  /** elemanın eni (css px; dönüşümsüz) */
  private genislik = 0;

  constructor(
    readonly ad: string,
    stil: string,
  ) {
    const k = KITLER[ad];
    this.kukla = new Kukla(k, (d) => GORSEL[`../../assets/karakter/${ad}/${d}`]);
    this.canvas = h('canvas.ko-kit-canvas', { 'aria-hidden': 'true' }) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d');
    // yüz işaretleri: göz ve ağız yuvalarının yeri (kare koordinatı → kutunun yüzdesi)
    const [W, H] = k.boyut;
    const kutu = (p: string) => k.parcalar[p]?.kutu;
    const isaret = (sinif: string, b: [number, number, number, number] | undefined) =>
      b ? h(`i.${sinif}.ko-yuz-isaret`, { style: `left:${((b[0] / W) * 100).toFixed(2)}%;top:${((b[1] / H) * 100).toFixed(2)}%;width:${((b[2] / W) * 100).toFixed(2)}%;height:${((b[3] / H) * 100).toFixed(2)}%` }) : null;
    this.govde = h('div.ko-kit-govde', {}, this.canvas, isaret('m-goz', kutu('gozler-acik')), isaret('m-goz', kutu('kaslar-notr')), isaret('m-agiz', kutu('agiz-gulumse')));
    this.el = h('div.ko-kisi.ko-kisi-kit', { style: stil, 'data-kit': ad }, this.govde);
    this.hazir = this.kukla.yukle().then(
      () => this.ciz(true),
      () => undefined,
    );
    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver(() => this.ciz(true));
      this.ro.observe(this.el);
    }
    this.raf = requestAnimationFrame(this.kare);
  }

  /** Her kare: göz kırpma, konuşma ağzı, ifade süresi (yalnız değişince yeniden çizilir) */
  private kare = (t: number) => {
    if (this.kapandi) return;
    const s = this.kukla.secim;
    let gozler = 'gozler-acik';
    let agiz = 'agiz-gulumse';
    let kaslar = 'kaslar-notr';
    if (this.ifadeAd && t < this.ifadeBitis) {
      if (this.ifadeAd === 'mutlu') {
        gozler = 'gozler-mutlu';
        agiz = 'agiz-genis';
      } else if (this.ifadeAd === 'saskin') {
        gozler = 'gozler-saskin';
        agiz = 'agiz-o';
        kaslar = 'kaslar-kalkik';
      } else {
        gozler = 'gozler-kapali';
        agiz = 'agiz-kahkaha';
      }
    } else this.ifadeAd = null;
    if (this.konusuyor) agiz = KONUSMA_AGIZ[Math.floor(t / 110) % KONUSMA_AGIZ.length];
    if (!this.ifadeAd || this.ifadeAd === 'mutlu') {
      if (t >= this.kirpZaman && t < this.kirpZaman + 150) gozler = gozler === 'gozler-mutlu' ? gozler : 'gozler-kapali';
      else if (t >= this.kirpZaman + 150) this.kirpZaman = t + 2400 + Math.random() * 2200;
    }
    s.gozler = gozler;
    s.agiz = agiz;
    s.kaslar = kaslar;
    this.ciz();
    this.raf = requestAnimationFrame(this.kare);
  };

  /** Canvas'ı ekrandaki boyda (× DPR, kitin pikselini aşmadan) çizer; yüz seti değişmediyse çizmez */
  private ciz(zorla = false) {
    const ctx = this.ctx;
    if (!ctx) return;
    if (zorla || !this.genislik) this.genislik = this.el.offsetWidth;
    if (!this.genislik) return;
    const [W, H] = this.kukla.iskelet.boyut;
    const dpr = Math.min(3, globalThis.devicePixelRatio || 1);
    const cw = Math.max(1, Math.min(W, Math.round(this.genislik * dpr)));
    const ch = Math.max(1, Math.round((cw * H) / W));
    const anahtar = `${cw}:${this.kukla.secim.gozler}:${this.kukla.secim.agiz}:${this.kukla.secim.kaslar}`;
    if (!zorla && anahtar === this.sonCiz) return;
    this.sonCiz = anahtar;
    if (this.canvas.width !== cw || this.canvas.height !== ch) {
      this.canvas.width = cw;
      this.canvas.height = ch;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    // dinlenme duruşu: bütün eklemler 0
    this.kukla.poz = {};
    const o = cw / W;
    this.kukla.ciz(ctx, [o, 0, 0, o, 0, 0]);
  }

  /** Yüz ifadesi bir süre */
  private ifade(ad: 'mutlu' | 'saskin' | 'keyif', ms: number) {
    this.ifadeAd = ad;
    this.ifadeBitis = performance.now() + ms;
  }
  /** Bütün gövde: hop (ezilme-esneme), sevinç (iki hop), yeme (yanaklar: hafif ezilme), yürüme (seke seke) */
  oynat(ad: 'var' | 'sevin' | 'dans' | 'ye' | 'bak' | 'yuru', ms: number): Promise<void> {
    if (TEST_MODU || AZ_HAREKET) return bekle(Math.min(ms, 60));
    const g = this.govde;
    const hop = (y: number) => [
      { transform: 'none' },
      { transform: 'scale(1.04, 0.93)', offset: 0.15 },
      { transform: `translateY(${-y}%) scale(0.97, 1.05)`, offset: 0.45 },
      { transform: 'scale(1.03, 0.95)', offset: 0.8 },
      { transform: 'none' },
    ];
    let k: Keyframe[];
    if (ad === 'sevin' || ad === 'dans') k = [...hop(7).slice(0, 4), ...hop(5).slice(1)];
    else if (ad === 'ye') k = [{ transform: 'none' }, { transform: 'scale(1.02, 0.97)' }, { transform: 'none' }, { transform: 'scale(1.02, 0.97)' }, { transform: 'none' }];
    else if (ad === 'bak') k = [{ transform: 'none' }, { transform: 'translateY(-2%) scale(0.98, 1.03)', offset: 0.4 }, { transform: 'none' }];
    else if (ad === 'yuru') k = [{ transform: 'none' }, { transform: 'translateY(-3%)' }, { transform: 'none' }, { transform: 'translateY(-3%)' }, { transform: 'none' }];
    else k = hop(3);
    return g
      .animate(k, { duration: Math.max(200, ms), easing: 'ease-in-out' })
      .finished.then(
        () => undefined,
        () => undefined,
      );
  }
  mutlu(ms: number) {
    this.ifade('mutlu', ms);
  }
  saskin(ms: number) {
    this.ifade('saskin', ms);
    void this.oynat('var', 420);
  }
  gozKapa(ms: number) {
    this.ifade('keyif', ms);
  }
  /** konuşma (balondaki söz okunurken): ağız oynar */
  konus(acik: boolean) {
    this.konusuyor = acik;
  }
  kapat() {
    this.kapandi = true;
    cancelAnimationFrame(this.raf);
    this.ro?.disconnect();
  }
}
