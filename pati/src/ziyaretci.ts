/**
 * Pati Dükkânı v2 · ziyaretçiler (PATI-V2 §9a): kişileri çizer ve canlandırır. PARÇA DÖNDÜRME YOK.
 *
 *  - Kino ailesi (Kino, Anne, Lokum, Baba, Babaanne, Dede): Seri 2 kesme kukla kitleri (assets/karakter/<ad>/<ad>.json,
 *    film/src/kukla.ts) YALNIZ dinlenme duruşunda (bütün eklem açıları 0). Canlılık yüz setleriyle (göz kırpma; mutlu,
 *    şaşkın, kapalı göz; konuşurken ağız) ve bütün gövdeyle (nefes, hop, ezilme-esneme). Kitin kendi parçaları açılıp
 *    kapanır: Babaanne'nin tepsisi ve buharı, Dede'nin kasketi (köpek kapınca kel kafa). Gemini "dükkân sayfası" (2.
 *    aşama) gelince poz değişimi eklenir (ekip/senaryo/PATI-V2.md §11d, 16-18, 33-35).
 *  - Sesli Maceralar çocukları (Can, Ada, Elif): Doğum Günü'nün ifade resimleri (assets/parti-ifade/<ad>/: normal,
 *    selam, şaşkın, alkış, dans …): POZ DEĞİŞİMİ + ezilme-esneme. Ege'nin annesi: tek resim (assets/ege/anne.webp).
 *  - Mino: eski Mino resmi (assets/karakter/mino.webp; kiti yok): bütün gövde.
 *  - Diken (gece misafiri kirpi): kadro resmi (assets/pati/kadro-b-diken.webp).
 *
 * Boylar aile boy tablosundan (assets/karakter/aile-boy.json: Kino 1, Anne 1.6, Baba 1.75, Lokum 0.7, Babaanne 1.52,
 * Dede 1.63). Netlik: kit canvas'a ekrandaki boy × DPR (kitin kendi pikselini aşmaz) çizilir; resimler kaynak
 * pikselinin üçte birinden büyük gösterilmez.
 */
import { Kukla, type KuklaIskelet } from '../../film/src/kukla';
import aileBoy from '../../assets/karakter/aile-boy.json';
import kinoJson from '../../assets/karakter/kino-yeni/kino-yeni.json';
import anneJson from '../../assets/karakter/anne/anne.json';
import babaJson from '../../assets/karakter/baba/baba.json';
import lokumJson from '../../assets/karakter/lokum/lokum.json';
import babaanneJson from '../../assets/karakter/babaanne/babaanne.json';
import dedeJson from '../../assets/karakter/dede/dede.json';
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { dogalBoyu, NETLIK_DPR } from '../../src/ui/netlik';
import type { Kisi } from './ziyaret-sahneleri';
import { adres } from './varliklar';

const AZ = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const sakin = () => AZ || TEST_MODU;
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, sakin() ? Math.min(ms, 60) : sure(ms)));

const KIT_GORSEL: Record<string, string> = {
  ...import.meta.glob<string>('../../assets/karakter/kino-yeni/*.webp', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob<string>('../../assets/karakter/anne/*.webp', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob<string>('../../assets/karakter/baba/*.webp', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob<string>('../../assets/karakter/lokum/*.webp', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob<string>('../../assets/karakter/babaanne/*.webp', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob<string>('../../assets/karakter/dede/*.webp', { eager: true, query: '?url', import: 'default' }),
};
type KitJson = KuklaIskelet & { tepe?: number; zemin: number; boyut: [number, number] };
const KITLER: Record<string, { j: KitJson; klasor: string }> = {
  kino: { j: kinoJson as unknown as KitJson, klasor: 'kino-yeni' },
  anne: { j: anneJson as unknown as KitJson, klasor: 'anne' },
  baba: { j: babaJson as unknown as KitJson, klasor: 'baba' },
  lokum: { j: lokumJson as unknown as KitJson, klasor: 'lokum' },
  babaanne: { j: babaanneJson as unknown as KitJson, klasor: 'babaanne' },
  dede: { j: dedeJson as unknown as KitJson, klasor: 'dede' },
};
const RESIM = import.meta.glob<string>(['../../assets/parti-ifade/{can,ada,elif}/*.webp', '../../assets/ege/anne.webp', '../../assets/karakter/mino.webp'], { eager: true, query: '?url', import: 'default' });
const resim = (yol: string) => RESIM[`../../assets/${yol}.webp`] ?? null;

/** Kişinin boyu (Kino = 1) */
export const BOY: Record<Kisi, number> = {
  ...(aileBoy.boy as Record<'kino' | 'anne' | 'baba' | 'lokum' | 'babaanne' | 'dede', number>),
  mino: 1.05,
  can: 1.3,
  ada: 1.25,
  elif: 1.3,
  'ege-anne': 1.6,
  diken: 0.5,
};

export type Ifade = 'normal' | 'mutlu' | 'saskin' | 'keyif';
export type Hareket = 'var' | 'sevin' | 'dans' | 'bak' | 'yuru' | 'konus';

/** İki hop (ezilme-esneme) */
const HOP2: Keyframe[] = [
  { transform: 'none', offset: 0 },
  { transform: 'scale(1.04, 0.92)', offset: 0.08 },
  { transform: 'translateY(-7%) scale(0.97, 1.05)', offset: 0.22 },
  { transform: 'scale(1.03, 0.95)', offset: 0.4 },
  { transform: 'none', offset: 0.5 },
  { transform: 'scale(1.03, 0.94)', offset: 0.58 },
  { transform: 'translateY(-5%) scale(0.98, 1.04)', offset: 0.72 },
  { transform: 'scale(1.02, 0.96)', offset: 0.9 },
  { transform: 'none', offset: 1 },
];
const KONUSMA_AGIZ = ['agiz-orta', 'agiz-az', 'agiz-genis', 'agiz-o', 'agiz-az', 'agiz-e'];

/** Bir ziyaretçi: dış kutusu (konum: ayakların ortası) ve gövdesi (canlandırma) */
export abstract class Ziyaretci {
  readonly el: HTMLElement;
  protected govde: HTMLElement;
  protected konusuyor = false;
  protected kapandi = false;
  /** görünen figürün en-boy oranı ve elemanın içindeki üst / alt payı (oran) */
  protected oran = 0.5;
  protected ustPay = 0;
  protected altPay = 0;
  protected hareket: Animation | null = null;
  private son: [number, number, number] | null = null;
  /** son yerleşimi yeniden (resim yüklenince oranı ve netlik sınırı belli olur) */
  protected yeniden() {
    if (this.son) this.yerlestir(...this.son);
  }

  constructor(readonly kim: Kisi) {
    this.govde = h('div.pt-zy-govde');
    this.el = h('div.pt-ziyaretci', { 'data-kim': kim }, h('div.pt-zy-nefes', {}, this.govde));
  }

  /** Görünen boy (css px; tepeden ayağa) ve ayakların ekrandaki yeri (katmanın içinde) */
  yerlestir(x: number, y: number, boy: number) {
    this.son = [x, y, boy];
    const enCok = this.enCokBoy();
    const b = enCok ? Math.min(boy, enCok) : boy;
    const kutuBoy = b / Math.max(0.2, 1 - this.ustPay - this.altPay);
    const en = kutuBoy * this.oran;
    this.el.style.width = `${en.toFixed(1)}px`;
    this.el.style.height = `${kutuBoy.toFixed(1)}px`;
    this.el.style.left = `${(x - en / 2).toFixed(1)}px`;
    this.el.style.top = `${(y - kutuBoy * (1 - this.altPay)).toFixed(1)}px`;
    this.cizYenile();
  }
  /** Netlik: en çok css boyu (null: sınır yok, kit kendi pikselinde çizilir) */
  protected enCokBoy(): number | null {
    return null;
  }
  protected cizYenile() {}
  /** Başının üstü (katmanın içinde): balon */
  basUstu(): [number, number] {
    const r = this.el.getBoundingClientRect();
    const p = (this.el.offsetParent as HTMLElement | null)?.getBoundingClientRect() ?? { left: 0, top: 0 };
    return [r.left - p.left + r.width / 2, r.top - p.top + r.height * this.ustPay];
  }
  /** Elinin hizası (ekran noktası): jeton buradan uçar */
  el_(): [number, number] {
    const r = this.el.getBoundingClientRect();
    return [r.left + r.width * 0.6, r.top + r.height * 0.55];
  }

  abstract ifade(i: Ifade, ms?: number): void;
  /** konuşma: ağız (kit) ya da bütün gövde yaylanır (resim) */
  konus(acik: boolean) {
    this.konusuyor = acik;
    if (acik && this.hareket === null && !sakin()) {
      const a = this.govde.animate([{ transform: 'none' }, { transform: 'scale(1.015, 0.985)' }, { transform: 'scale(0.995, 1.01)' }, { transform: 'none' }], { duration: 360, iterations: Infinity });
      this.konusAnim = a;
    } else if (!acik) {
      this.konusAnim?.cancel();
      this.konusAnim = null;
    }
  }
  private konusAnim: Animation | null = null;

  /** Bütün gövde hareketi (parça dönmez) */
  async oynat(ad: Hareket, ms = 700): Promise<void> {
    if (sakin()) return bekle(Math.min(ms, 60));
    let k: Keyframe[];
    if (ad === 'sevin' || ad === 'dans') k = HOP2;
    else if (ad === 'bak') k = [{ transform: 'none' }, { transform: 'translateY(-2%) scale(0.98, 1.03)', offset: 0.4 }, { transform: 'none' }];
    else if (ad === 'yuru') k = [{ transform: 'none' }, { transform: 'translateY(-4%) scale(.98,1.03)' }, { transform: 'scale(1.02,.97)' }, { transform: 'translateY(-4%) scale(.98,1.03)' }, { transform: 'none' }];
    else k = [{ transform: 'none' }, { transform: 'scale(1.04, 0.93)', offset: 0.15 }, { transform: 'translateY(-3%) scale(0.97, 1.05)', offset: 0.45 }, { transform: 'scale(1.03, 0.95)', offset: 0.8 }, { transform: 'none' }];
    try {
      this.hareket?.cancel();
      const a = this.govde.animate(k, { duration: Math.max(200, ms), easing: 'ease-in-out' });
      this.hareket = a;
      await a.finished.catch(() => undefined);
      if (this.hareket === a) this.hareket = null;
    } catch {
      await bekle(ms);
    }
  }
  /** Dans: ritimde hop + (resimli çocuklarda) dans pozları */
  async dans(vurus: number, aralik: number) {
    for (let i = 0; i < vurus && !this.kapandi; i++) {
      this.dansPozu(i);
      void this.oynat('dans', aralik * 0.95);
      await bekle(aralik);
    }
    this.dansPozu(-1);
  }
  protected dansPozu(_i: number) {
    if (_i >= 0) this.ifade(_i % 2 ? 'mutlu' : 'keyif', 400);
  }
  /** Kapıdan (soldan) seke seke girer */
  async gir(ms = 900) {
    if (sakin()) return;
    const a = this.el.animate([{ transform: 'translateX(-260%)' }, { transform: 'translateX(0)' }], { duration: sure(ms), easing: 'cubic-bezier(.3,.7,.4,1)' });
    void this.oynat('yuru', ms);
    await a.finished.catch(() => undefined);
  }
  /** El sallar, kapıya (sola) seke seke gider */
  async cik(ms = 900) {
    if (sakin()) return;
    void this.oynat('yuru', ms);
    await this.el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-260%)' }], { duration: sure(ms), easing: 'ease-in', fill: 'forwards' }).finished.catch(() => undefined);
  }
  /** Kitin bir parçasını açar / kapar (tepsi, kasket); kit değilse bir şey olmaz */
  parca(_ad: string, _gorunur: boolean) {}
  kapat() {
    this.kapandi = true;
    this.hareket?.cancel();
  }
}

// ---------------------------------------------------------------- Kino ailesi: kukla kiti (dinlenme duruşu)
class KitZiyaretci extends Ziyaretci {
  private kukla: Kukla;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private raf = 0;
  private ifadeAd: Ifade = 'normal';
  private ifadeBitis = 0;
  private kirpZaman = performance.now() + 1500 + Math.random() * 2000;
  private sonCiz = '';
  private acik: Record<string, number> = {};
  readonly hazir: Promise<void>;

  constructor(kim: 'kino' | 'anne' | 'baba' | 'lokum' | 'babaanne' | 'dede') {
    super(kim);
    const { j, klasor } = KITLER[kim];
    this.kukla = new Kukla(j, (d) => KIT_GORSEL[`../../assets/karakter/${klasor}/${d}`]);
    this.canvas = h('canvas.pt-zy-canvas', { 'aria-hidden': 'true' }) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.govde.append(this.canvas);
    const [W, H] = j.boyut;
    const tepe = j.tepe ?? Math.max(0, j.zemin - (aileBoy as { kinoBoyKare: number }).kinoBoyKare);
    this.oran = W / H;
    this.ustPay = tepe / H;
    this.altPay = (H - j.zemin) / H;
    this.hazir = this.kukla.yukle().then(
      () => this.ciz(true),
      () => undefined,
    );
    this.raf = requestAnimationFrame(this.kare);
  }
  private kare = (t: number) => {
    if (this.kapandi) return;
    const s = this.kukla.secim;
    let gozler = 'gozler-acik';
    let agiz = 'agiz-gulumse';
    let kaslar = 'kaslar-notr';
    const ifade = t < this.ifadeBitis ? this.ifadeAd : this.ifadeAd === 'keyif' && this.ifadeBitis === Infinity ? 'keyif' : 'normal';
    if (ifade === 'mutlu') {
      gozler = 'gozler-mutlu';
      agiz = 'agiz-genis';
    } else if (ifade === 'saskin') {
      gozler = 'gozler-saskin';
      agiz = 'agiz-o';
      kaslar = 'kaslar-kalkik';
    } else if (ifade === 'keyif') {
      gozler = 'gozler-kapali';
      agiz = 'agiz-kahkaha';
    }
    if (this.konusuyor) agiz = KONUSMA_AGIZ[Math.floor(t / 110) % KONUSMA_AGIZ.length];
    if (ifade === 'normal' || ifade === 'mutlu') {
      if (t >= this.kirpZaman && t < this.kirpZaman + 150) gozler = gozler === 'gozler-mutlu' ? gozler : 'gozler-kapali';
      else if (t >= this.kirpZaman + 150) this.kirpZaman = t + 2400 + Math.random() * 2200;
    }
    s.gozler = gozler;
    s.agiz = agiz;
    s.kaslar = kaslar;
    this.ciz();
    this.raf = requestAnimationFrame(this.kare);
  };
  protected cizYenile() {
    this.ciz(true);
  }
  private ciz(zorla = false) {
    const ctx = this.ctx;
    if (!ctx) return;
    const gen = this.el.offsetWidth;
    if (!gen) return;
    const [W, H] = this.kukla.iskelet.boyut;
    const dpr = Math.min(3, globalThis.devicePixelRatio || 1);
    const cw = Math.max(1, Math.min(W, Math.round(gen * dpr)));
    const ch = Math.max(1, Math.round((cw * H) / W));
    const s = this.kukla.secim;
    const anahtar = `${cw}:${s.gozler}:${s.agiz}:${s.kaslar}:${JSON.stringify(this.acik)}`;
    if (!zorla && anahtar === this.sonCiz) return;
    this.sonCiz = anahtar;
    if (this.canvas.width !== cw || this.canvas.height !== ch) {
      this.canvas.width = cw;
      this.canvas.height = ch;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    // dinlenme duruşu: bütün eklem açıları 0; yalnız açılıp kapanan parçalar (saydamlık)
    this.kukla.poz = Object.fromEntries(Object.entries(this.acik).map(([k, o]) => [k, { o }]));
    const o = cw / W;
    this.kukla.ciz(ctx, [o, 0, 0, o, 0, 0]);
  }
  ifade(i: Ifade, ms = 900) {
    this.ifadeAd = i;
    this.ifadeBitis = ms === Infinity ? Infinity : performance.now() + (TEST_MODU ? 30 : ms);
  }
  parca(ad: string, gorunur: boolean) {
    this.acik[ad] = gorunur ? 1 : 0;
    this.ciz(true);
  }
  kapat() {
    super.kapat();
    cancelAnimationFrame(this.raf);
  }
}

// ---------------------------------------------------------------- resimli: Mino, Ege'nin annesi, Diken; çocuklar (ifade resimleri)
const COCUK_IFADE: Record<string, Partial<Record<Ifade | 'dans' | 'dans2' | 'selam' | 'alkis', string>>> = {
  can: { normal: 'normal', mutlu: 'alkis', saskin: 'saskin', keyif: 'alkis', dans: 'dans', dans2: 'dans2', selam: 'selam' },
  elif: { normal: 'normal', mutlu: 'alkis', saskin: 'saskin', keyif: 'alkis', dans: 'dans', dans2: 'dans2', selam: 'selam' },
  ada: { normal: 'normal', mutlu: 'mutlu', saskin: 'saskin', keyif: 'alkis', dans: 'dans', dans2: 'dans2', selam: 'mutlu' },
};
class ResimZiyaretci extends Ziyaretci {
  private img: HTMLImageElement;
  private zaman = 0;
  constructor(kim: Kisi, private yol: (poz: string) => string | null) {
    super(kim);
    const u = yol('normal');
    this.img = h('img.pt-zy-resim', { src: u ?? '', alt: '', draggable: 'false' }) as HTMLImageElement;
    this.govde.append(this.img);
    const d = u ? dogalBoyu(u) : null;
    if (d) this.oran = d[0] / d[1];
    this.img.addEventListener('load', () => {
      if (!this.img.naturalWidth) return;
      this.oran = this.img.naturalWidth / this.img.naturalHeight;
      this.yeniden();
    }, { once: true });
    this.ustPay = 0.02;
    this.altPay = 0.01;
  }
  protected enCokBoy() {
    const d = dogalBoyu(this.img.src);
    return d ? (d[1] / NETLIK_DPR) * (1 - this.ustPay - this.altPay) : null;
  }
  /** Poz değişimi (resim) + ezilme */
  poz(ad: string) {
    const u = this.yol(ad);
    if (!u || this.img.getAttribute('src') === u) return;
    this.img.src = u;
    if (!sakin()) this.govde.animate([{ transform: 'scale(1,1)' }, { transform: 'scale(1.06,.92)', offset: 0.35 }, { transform: 'scale(.98,1.03)', offset: 0.7 }, { transform: 'scale(1,1)' }], { duration: 220, easing: 'ease-out' });
  }
  ifade(i: Ifade, ms = 900) {
    clearTimeout(this.zaman);
    const tablo = COCUK_IFADE[this.kim];
    if (!tablo) {
      // tek resim: yüz değişmez, bütün gövde söyler
      if (i === 'saskin') void this.oynat('var', 360);
      else if (i !== 'normal') void this.oynat('sevin', 600);
      return;
    }
    this.poz(tablo[i] ?? 'normal');
    if (ms !== Infinity) this.zaman = window.setTimeout(() => this.poz('normal'), TEST_MODU ? 30 : ms);
  }
  selam() {
    const s = COCUK_IFADE[this.kim]?.selam;
    if (s) {
      this.poz(s);
      clearTimeout(this.zaman);
      this.zaman = window.setTimeout(() => this.poz('normal'), TEST_MODU ? 30 : 1200);
    } else void this.oynat('sevin', 700);
  }
  protected dansPozu(i: number) {
    const t = COCUK_IFADE[this.kim];
    if (!t) return;
    if (i < 0) this.poz('normal');
    else this.poz(i % 2 ? t.dans2 ?? 'normal' : t.dans ?? 'normal');
  }
  kapat() {
    super.kapat();
    clearTimeout(this.zaman);
  }
}

/** Kişiyi kurar */
export function ziyaretciKur(kim: Kisi): Ziyaretci {
  if (kim in KITLER) return new KitZiyaretci(kim as 'kino');
  if (kim === 'mino') return new ResimZiyaretci(kim, () => resim('karakter/mino'));
  if (kim === 'ege-anne') return new ResimZiyaretci(kim, () => resim('ege/anne'));
  if (kim === 'diken') return new ResimZiyaretci(kim, () => adres('diken-bos', 'kadro-b-diken'));
  return new ResimZiyaretci(kim, (p) => resim(`parti-ifade/${kim}/${p}`) ?? resim(`parti-ifade/${kim}/normal`));
}
export const selamVer = (z: Ziyaretci) => (z instanceof ResimZiyaretci ? z.selam() : void z.oynat('sevin', 700));
export { bekle as zyBekle };
