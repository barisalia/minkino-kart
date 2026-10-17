/**
 * Lokantadaki kişi (müşteri ya da Kino): yer değiştirme (yürü: konum + hop), oturma, yeme, tepki, konuşma.
 * Animasyon kuralı (§7c): yalnız poz / yüz değişimi + bütün gövdenin ezilme-esnemesi. PARÇA DÖNDÜRME YOK.
 *
 * Görsel sırası (en iyisi önce):
 *  1. `assets/restoran/kisi/<ad>/<poz>.webp` (Gemini 8 pozlu lokanta sayfası; restoran-isle.cjs keser): giris, selam,
 *     otur, otur-kirp, ye, bayildi, sasir, eksi (Kino: tepsi, yuru-1, yuru-2, koy, yaz, sallan, patates, tabaklar).
 *  2. Kino ailesinin Seri 2 kesme kukla kitleri (dinlenme duruşu, eklem açısı 0; yüz setleri: göz kırpma, mutlu,
 *     şaşkın, kapalı göz, konuşurken ağız). Kukla canvas'a ekrandaki boy × DPR çizilir (kitin pikselini aşmaz).
 *  3. Kino'nun Otobüsü'nün durağan müşteri resimleri (Bıdık, Tombi, Zıpzıp, Bulut...; yalnız gövde hareketi).
 * Boy: src/karakter/boy.ts (Mino = 1) × --rs-u (olcek.ts).
 */
import { Kukla, type KuklaIskelet } from '../../../film/src/kukla';
import anneJson from '../../../assets/karakter/anne/anne.json';
import babaJson from '../../../assets/karakter/baba/baba.json';
import lokumJson from '../../../assets/karakter/lokum/lokum.json';
import babaanneJson from '../../../assets/karakter/babaanne/babaanne.json';
import dedeJson from '../../../assets/karakter/dede/dede.json';
import kinoJson from '../../../assets/karakter/kino-yeni/kino-yeni.json';
import olcuJson from '../../../assets/kino-otobus/musteri/olcu.json';
import { BOY } from '../../../src/karakter/boy';
import { h, sure, TEST_MODU } from '../../../src/ui/dom';
import { varlik, yeniden } from '../varliklar';

const AZ_HAREKET = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const sakin = () => TEST_MODU || AZ_HAREKET;

const PARCALAR: Record<string, string> = {
  ...import.meta.glob<string>('../../../assets/karakter/anne/*.webp', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob<string>('../../../assets/karakter/baba/*.webp', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob<string>('../../../assets/karakter/lokum/*.webp', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob<string>('../../../assets/karakter/babaanne/*.webp', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob<string>('../../../assets/karakter/dede/*.webp', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob<string>('../../../assets/karakter/kino-yeni/*.webp', { eager: true, query: '?url', import: 'default' }),
};
type KitJson = KuklaIskelet & { tepe?: number };
const KITLER: Record<string, { j: KitJson; klasor: string }> = {
  anne: { j: anneJson as unknown as KitJson, klasor: 'anne' },
  baba: { j: babaJson as unknown as KitJson, klasor: 'baba' },
  lokum: { j: lokumJson as unknown as KitJson, klasor: 'lokum' },
  babaanne: { j: babaanneJson as unknown as KitJson, klasor: 'babaanne' },
  dede: { j: dedeJson as unknown as KitJson, klasor: 'dede' },
  kino: { j: kinoJson as unknown as KitJson, klasor: 'kino-yeni' },
};
const OLCU = olcuJson as Record<string, { en: number; boy: number; tepe: number; taban: number; bel: number }>;
/** Lokanta için ayrıca çizilmemiş, başka oyunun durağan resmi (P6: Nehir abla, Pati Dükkânı'ndan) */
const YEDEK_RESIM: Record<string, { yol: string; en: number; boy: number; tepe: number; taban: number; bel: number }> = {
  nehir: { yol: 'pati/nehir-on', en: 494, boy: 1448, tepe: 8, taban: 1440, bel: 900 },
};
/** Gemini poz sayfalarının ölçüsü (ekip/illustrator/restoran/restoran-isle.cjs yazar): poz → tuval ve figür tepe / taban */
const POZ_OLCU = import.meta.glob<Record<string, { en: number; boy: number; tepe: number; taban: number }>>('../../../assets/restoran/kisi/*/olcu.json', { eager: true, import: 'default' });

/** Bir çizimin kutusu ve figürün tepe / taban / bel çizgisi (kutu yüksekliğinin oranı) */
export interface KisiOlcu {
  /** kutu en / boy */
  oran: number;
  tepe: number;
  taban: number;
  bel: number;
}

function kitTepe(j: KitJson): number {
  if (typeof j.tepe === 'number') return j.tepe;
  return Math.min(...Object.values(j.parcalar).map((p) => p.kutu[1]));
}

/** Kişinin hangi görselle çizileceği ve ölçüsü */
export function kisiOlcu(ad: string): KisiOlcu {
  const p = POZ_OLCU[`../../../assets/restoran/kisi/${ad}/olcu.json`];
  const ayakta = p?.giris ?? p?.selam ?? p?.mutlu ?? p?.tepsi ?? p?.konus;
  if (ayakta) return { oran: ayakta.en / ayakta.boy, tepe: ayakta.tepe / ayakta.boy, taban: ayakta.taban / ayakta.boy, bel: (ayakta.tepe + (ayakta.taban - ayakta.tepe) * 0.6) / ayakta.boy };
  const k = KITLER[ad];
  if (k) {
    const [W, H] = k.j.boyut;
    const kalca = k.j.parcalar.kalca?.kutu;
    return { oran: W / H, tepe: kitTepe(k.j) / H, taban: k.j.zemin / H, bel: kalca ? kalca[1] / H : 0.62 };
  }
  const o = OLCU[ad] ?? YEDEK_RESIM[ad];
  if (o) return { oran: o.en / o.boy, tepe: o.tepe / o.boy, taban: o.taban / o.boy, bel: o.bel / o.boy };
  return { oran: 0.7, tepe: 0.04, taban: 0.98, bel: 0.62 };
}

/** Boy (Mino = 1) */
export function kisiBoyu(ad: string, boyAnahtari?: string): number {
  const b = (BOY as Record<string, number>)[boyAnahtari ?? ad];
  return b ?? 1.25;
}

const KONUSMA_AGIZ = ['agiz-orta', 'agiz-az', 'agiz-genis', 'agiz-o', 'agiz-az', 'agiz-e'];
/** 8. karesi ekşi yüz değil komik gag pozu olan müşteriler (R-Gün 2 sayfaları; model.ts gag): 'eksi' istenince bu */
const GAG_POZ: Record<string, string> = { tombi: 'sapka', bidik: 'pecete', zipzip: 'kulak' };
/** Pozlu kişide ifade → geçici poz (yalnız sakin duruşlardayken; eylem pozu (tat, bayildi, sasir...) bozulmaz) */
const IFADE_POZ: Record<Exclude<Ifade, null>, (oturuyor: boolean) => string | null> = {
  saskin: () => 'sasir',
  eksi: () => 'eksi',
  mutlu: (o) => (o ? 'otur-kirp' : 'selam'),
  keyif: (o) => (o ? 'otur-kirp' : null),
};
const SAKIN_POZ = new Set(['otur', 'giris', 'selam', 'ye', 'mutlu', 'konus']);
export type Ifade = 'mutlu' | 'saskin' | 'keyif' | 'eksi' | null;
export type Hareket = 'hop' | 'sevin' | 'ye' | 'yuru' | 'bak' | 'titre' | 'kokla';

const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, sakin() ? Math.min(ms, 40) : ms));

export class Kisi {
  /** yerleşim kutusu (sahnede; sol-üst = ayak noktası, translate ile ortalanır) */
  readonly el: HTMLElement;
  /** gövde (hop, ezilme-esneme) */
  readonly govde: HTMLElement;
  readonly olcu: KisiOlcu;
  readonly boy: number;
  readonly hazir: Promise<void>;
  private kukla: Kukla | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private img: HTMLImageElement | null = null;
  /** Gemini poz kareleriyle mi çiziliyor (oturuş karesi gerçekten oturuyor) */
  pozlu = false;
  private ifadeAd: Ifade = null;
  private ifadeBitis = 0;
  private konusuyor = false;
  private kirpZaman = performance.now() + 1500 + Math.random() * 2500;
  private raf = 0;
  private sonCiz = '';
  private kapandi = false;
  private ro: ResizeObserver | null = null;
  private x = 0;
  private y = 0;
  private oturuyor = false;
  /** pozlu: asıl duruş (poz()) ve üstüne binen geçici ifade pozu */
  private temel = 'giris';
  private gecici: string | null = null;
  private geciciZaman = 0;
  private kirpZamanlayici = 0;

  constructor(
    readonly ad: string,
    boyAnahtari?: string,
  ) {
    this.boy = kisiBoyu(ad, boyAnahtari);
    this.olcu = kisiOlcu(ad);
    this.govde = h('div.rs-kisi-govde');
    this.el = h('div.rs-kisi', { 'data-kisi': ad });
    this.el.append(this.govde);
    this.boyutla();
    const pozResim = ['giris', 'otur', 'mutlu', 'tepsi', 'konus'].map((p) => varlik(`kisi/${ad}/${p}`)).find(Boolean);
    if (pozResim) {
      this.pozlu = true;
      this.img = h('img.rs-kisi-resim', { src: pozResim, alt: '', draggable: 'false' }) as HTMLImageElement;
      this.govde.append(this.img);
      this.hazir = this.img.decode().catch(() => undefined);
      // bütün poz kareleri önceden yüklenir: poz değişiminde boş kare / gecikme olmasın
      const olcu = POZ_OLCU[`../../../assets/restoran/kisi/${ad}/olcu.json`];
      for (const p of Object.keys(olcu ?? {})) {
        const u = varlik(`kisi/${ad}/${p}`);
        if (u) new Image().src = u;
      }
      this.kirpPlanla();
    } else if (KITLER[ad]) {
      const k = KITLER[ad];
      this.kukla = new Kukla(k.j, (d) => PARCALAR[`../../../assets/karakter/${k.klasor}/${d}`]);
      this.canvas = h('canvas.rs-kisi-canvas', { 'aria-hidden': 'true' }) as HTMLCanvasElement;
      this.govde.append(this.canvas);
      this.hazir = this.kukla.yukle().then(
        () => this.ciz(true),
        () => undefined,
      );
      if (typeof ResizeObserver !== 'undefined') {
        this.ro = new ResizeObserver(() => this.ciz(true));
        this.ro.observe(this.el);
      }
      this.raf = requestAnimationFrame(this.kare);
    } else {
      const u = yeniden(`kino-otobus/musteri/${ad}`) ?? (YEDEK_RESIM[ad] ? yeniden(YEDEK_RESIM[ad].yol) : null);
      this.img = h('img.rs-kisi-resim', { src: u ?? '', alt: '', draggable: 'false' }) as HTMLImageElement;
      if (!u) this.el.classList.add('rs-kisi-yok');
      this.govde.append(this.img);
      this.hazir = this.img.decode().catch(() => undefined);
      // göz kırpma yok (durağan resim): gövde nefesi CSS
    }
  }

  /** Kutu boyu: figür boyu = boy × --rs-u */
  private boyutla() {
    const o = this.olcu;
    const figur = o.taban - o.tepe;
    // kutu yüksekliği (u cinsinden) ve ayak noktasının kutu altından yukarıda kalan payı
    const kutuH = this.boy / figur;
    this.el.style.setProperty('--rs-kutu-h', kutuH.toFixed(4));
    this.el.style.setProperty('--rs-kutu-oran', o.oran.toFixed(4));
    this.el.style.setProperty('--rs-alt-pay', (1 - o.taban).toFixed(4));
    this.el.style.setProperty('--rs-bel', o.bel.toFixed(4));
    // e2e ölçüsü: kutunun hangi dilimi figür (tepe..taban)
    this.el.dataset.figur = `${o.tepe.toFixed(4)},${o.taban.toFixed(4)}`;
  }

  /** Ekrandaki figür boyu (u cinsinden) */
  get figurBoyu() {
    return this.boy;
  }

  // ---------------------------------------------------------------- kukla çizimi
  private kare = (t: number) => {
    if (this.kapandi || !this.kukla) return;
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
      } else if (this.ifadeAd === 'eksi') {
        gozler = 'gozler-kapali';
        agiz = s.agiz && this.kukla.iskelet.parcalar['agiz-uzgun'] ? 'agiz-uzgun' : 'agiz-az';
        kaslar = this.kukla.iskelet.parcalar['kaslar-uzgun'] ? 'kaslar-uzgun' : 'kaslar-notr';
      } else {
        gozler = 'gozler-kapali';
        agiz = 'agiz-kahkaha';
      }
    } else this.ifadeAd = null;
    if (this.konusuyor) agiz = KONUSMA_AGIZ[Math.floor(t / 110) % KONUSMA_AGIZ.length];
    if (!this.ifadeAd || this.ifadeAd === 'mutlu') {
      if (t >= this.kirpZaman && t < this.kirpZaman + 150) gozler = gozler === 'gozler-mutlu' ? gozler : 'gozler-kapali';
      else if (t >= this.kirpZaman + 150) this.kirpZaman = t + 2400 + Math.random() * 2400;
    }
    const p = this.kukla.iskelet.parcalar;
    s.gozler = p[gozler] ? gozler : 'gozler-acik';
    s.agiz = p[agiz] ? agiz : 'agiz-gulumse';
    s.kaslar = p[kaslar] ? kaslar : 'kaslar-notr';
    this.ciz();
    this.raf = requestAnimationFrame(this.kare);
  };

  private ciz(zorla = false) {
    const ctx = this.canvas?.getContext('2d');
    if (!ctx || !this.kukla || !this.canvas) return;
    const g = this.el.offsetWidth;
    if (!g) return;
    const [W, H] = this.kukla.iskelet.boyut;
    const dpr = Math.min(3, globalThis.devicePixelRatio || 1);
    const cw = Math.max(1, Math.min(W, Math.round(g * dpr)));
    const ch = Math.max(1, Math.round((cw * H) / W));
    const s = this.kukla.secim;
    const anahtar = `${cw}:${s.gozler}:${s.agiz}:${s.kaslar}`;
    if (!zorla && anahtar === this.sonCiz) return;
    this.sonCiz = anahtar;
    if (this.canvas.width !== cw || this.canvas.height !== ch) {
      this.canvas.width = cw;
      this.canvas.height = ch;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    this.kukla.poz = {};
    const o = cw / W;
    this.kukla.ciz(ctx, [o, 0, 0, o, 0, 0]);
  }

  // ---------------------------------------------------------------- yer ve hareket
  /** Ayak noktasını sahnenin yüzdesine koyar */
  yerKoy(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.el.style.left = `${x}%`;
    this.el.style.top = `${y}%`;
  }
  get konum() {
    return { x: this.x, y: this.y };
  }

  /** Yürü: konum kayar, gövde seke seke (hop), yön: sola giderken ayna YOK (çizim tek yön; döndürme yok) */
  async yuru(x: number, y: number, hiz = 26): Promise<void> {
    const dx = x - this.x;
    const dy = y - this.y;
    const mesafe = Math.hypot(dx, dy * 0.6);
    const ms = sakin() ? 40 : Math.max(450, (mesafe / hiz) * 1000);
    const bas = { left: `${this.x}%`, top: `${this.y}%` };
    this.yerKoy(x, y);
    this.poz('giris');
    if (sakin()) return;
    // yürüyüş kareleri varsa adım adım değişir (Kino: yuru-1 / yuru-2)
    const adimlar = this.pozlu ? ['yuru-1', 'yuru-2'].map((p) => varlik(`kisi/${this.ad}/${p}`)).filter((u): u is string => !!u) : [];
    let adimNo = 0;
    const adimZaman = adimlar.length === 2 && this.img ? window.setInterval(() => (this.img!.src = adimlar[adimNo++ % 2]), 220) : 0;
    const adim = Math.max(2, Math.round(ms / 300));
    const k: Keyframe[] = [];
    for (let i = 0; i <= adim * 2; i++) k.push({ transform: i % 2 ? 'translateY(-7%) scale(0.98, 1.03)' : 'scale(1.02, 0.97)', offset: i / (adim * 2) });
    k[0].transform = 'none';
    k[k.length - 1].transform = 'none';
    try {
      this.govde.animate(k, { duration: ms, easing: 'linear' });
      await this.el.animate([bas, { left: `${x}%`, top: `${y}%` }], { duration: ms, easing: 'ease-in-out' }).finished;
    } catch {
      await bekle(ms);
    }
    if (adimZaman) {
      clearInterval(adimZaman);
      this.poz(this.el.dataset.poz ?? 'giris');
    }
  }

  /** Masaya oturur (masa önünde, belden aşağısı masanın arkasında kalır) */
  otur(acik: boolean) {
    this.oturuyor = acik;
    this.el.classList.toggle('rs-oturuyor', acik);
    this.poz(acik ? 'otur' : 'giris');
  }
  get oturdu() {
    return this.oturuyor;
  }

  /** Poz karesinin adresi: kendi adı, 'eksi' yerine gag pozu; yoksa null */
  private pozUrl(ad: string): string | null {
    // Kino'nun garson sayfasında 'giris' yok: boştaki duruşu tepsiyle
    if (this.ad === 'kino' && ad === 'giris') ad = 'tepsi';
    return varlik(`kisi/${this.ad}/${ad}`) ?? (ad === 'eksi' && GAG_POZ[this.ad] ? varlik(`kisi/${this.ad}/${GAG_POZ[this.ad]}`) : null);
  }

  /** Kareyi değiştirir; ezilme-esneme ile (göz kırpma hariç) */
  private goster(u: string | null, esnet = true) {
    if (!u || !this.img) return;
    if (this.img.src === new URL(u, document.baseURI).href) return;
    this.img.src = u;
    if (!esnet || sakin()) return;
    try {
      this.img.animate([{ transform: 'scale(1.06, 0.93)' }, { transform: 'scale(0.98, 1.03)', offset: 0.55 }, { transform: 'none' }], { duration: 220, easing: 'ease-out' });
    } catch {
      /* yok say */
    }
  }

  /** Gemini poz karesi varsa ona geçer (yoksa hiçbir şey: kukla/resim aynı kalır) */
  poz(ad: string) {
    this.el.dataset.poz = ad;
    if (!this.pozlu || !this.img) return;
    this.temel = ad;
    this.gecici = null;
    clearTimeout(this.geciciZaman);
    this.goster(this.pozUrl(ad) ?? (this.oturuyor ? this.pozUrl('otur') : this.pozUrl('giris')));
  }

  ifade(ad: Ifade, ms = 1200) {
    this.ifadeAd = ad;
    this.ifadeBitis = performance.now() + (sakin() ? 60 : ms);
    // pozlu kişi: yüz ifadesi yerine geçici poz (şaşkın, ekşi / gag, keyifle göz kapalı), sonra asıl duruşa döner
    if (!this.pozlu || !this.img || !ad || !SAKIN_POZ.has(this.temel)) return;
    const p = IFADE_POZ[ad](this.oturuyor);
    const u = p ? this.pozUrl(p) : null;
    if (!u) return;
    this.gecici = p;
    this.goster(u);
    clearTimeout(this.geciciZaman);
    this.geciciZaman = window.setTimeout(() => {
      if (this.kapandi || !this.gecici) return;
      this.gecici = null;
      this.goster(this.pozUrl(this.temel) ?? this.pozUrl(this.oturuyor ? 'otur' : 'giris'));
    }, sakin() ? 60 : ms);
  }

  /** Masada otururken ara sıra göz kırpar (otur → otur-kirp → otur, esnemesiz) */
  private kirpPlanla() {
    if (this.kapandi || sakin()) return;
    this.kirpZamanlayici = window.setTimeout(() => {
      if (this.kapandi) return;
      const kirp = this.pozUrl('otur-kirp');
      if (kirp && this.temel === 'otur' && !this.gecici && !this.konusuyor) {
        this.goster(kirp, false);
        window.setTimeout(() => {
          if (!this.kapandi && this.temel === 'otur' && !this.gecici) this.goster(this.pozUrl('otur'), false);
        }, 170);
      }
      this.kirpPlanla();
    }, 2600 + Math.random() * 2600);
  }

  /** Bütün gövde hareketi (ezilme-esneme; döndürme yok) */
  oynat(ad: Hareket, ms = 500): Promise<void> {
    if (sakin()) return bekle(40);
    const hop = (y: number): Keyframe[] => [
      { transform: 'none' },
      { transform: 'scale(1.05, 0.92)', offset: 0.15 },
      { transform: `translateY(${-y}%) scale(0.97, 1.05)`, offset: 0.45 },
      { transform: 'scale(1.03, 0.95)', offset: 0.8 },
      { transform: 'none' },
    ];
    let k: Keyframe[];
    if (ad === 'sevin')
      k = [
        { transform: 'none' },
        { transform: 'scale(1.05, 0.92)', offset: 0.08 },
        { transform: 'translateY(-9%) scale(0.97, 1.05)', offset: 0.24 },
        { transform: 'scale(1.03, 0.95)', offset: 0.42 },
        { transform: 'none', offset: 0.5 },
        { transform: 'scale(1.04, 0.93)', offset: 0.58 },
        { transform: 'translateY(-7%) scale(0.98, 1.04)', offset: 0.74 },
        { transform: 'scale(1.02, 0.96)', offset: 0.9 },
        { transform: 'none' },
      ];
    else if (ad === 'ye') k = [{ transform: 'none' }, { transform: 'scale(1.03, 0.96)' }, { transform: 'none' }, { transform: 'scale(1.03, 0.96)' }, { transform: 'none' }];
    else if (ad === 'bak' || ad === 'kokla') k = [{ transform: 'none' }, { transform: 'translateY(-3%) scale(0.98, 1.03)', offset: 0.4 }, { transform: 'none' }];
    else if (ad === 'titre') k = [{ transform: 'none' }, { transform: 'translateX(-2%)' }, { transform: 'translateX(2%)' }, { transform: 'translateX(-2%)' }, { transform: 'translateX(2%)' }, { transform: 'none' }];
    else k = hop(5);
    try {
      return this.govde.animate(k, { duration: ms, easing: 'ease-in-out' }).finished.then(
        () => undefined,
        () => undefined,
      );
    } catch {
      return bekle(ms);
    }
  }

  konus(acik: boolean) {
    this.konusuyor = acik;
    this.el.classList.toggle('rs-konusuyor', acik);
  }

  /** Ekranda kafanın üstü (balon için; sahne yüzdesi değil, kişi kutusunun içinde) */
  kafaPayi() {
    return this.olcu.tepe;
  }

  kapat() {
    this.kapandi = true;
    clearTimeout(this.kirpZamanlayici);
    clearTimeout(this.geciciZaman);
    cancelAnimationFrame(this.raf);
    this.ro?.disconnect();
    this.el.remove();
  }
}

export const kisiSure = sure;
