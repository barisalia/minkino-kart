/**
 * Dedektif Mino'nun dünyası: odalar (çalışma odası, koridor, yatak odası, mutfak) ve kamera.
 *
 * Her oda dünya biriminde (yükseklik ODA_H = 1000 px, en oda resminin oranında) kurulur; kamera dünyayı ölçekleyip
 * kaydırır (yalnız transform). Dünya ekranı hep tamamen kaplar (boş kenar yok); kadraj ekranın güvenli bölgesine
 * (üst çubuğun altı, karakterlerin arası) sığdırılır: mantik.ts → kameraHesap. Çalışma odası üç katmanlı (film/ev):
 * kamera kayınca uzak katman (duvar, pencere) biraz yavaş kayar (derinlik).
 *
 * Oda değişince yeni oda yandan kayarak gelir (kamera akıyormuş gibi). Eşyalar ve ipuçları oda oranıyla yerleşir;
 * ipuçları büyüteç için `bt-gizli` (çıplak gözle görünmez), bulununca `dd-bulundu`.
 */
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import {
  CALISMA,
  CALISMA_IZLERI,
  ekranda,
  KADRAJ,
  kameraHesap,
  KORIDOR_IZLERI,
  MUTFAK_IZLERI,
  ODA_H,
  odaW,
  YATAK,
  YATAK_IZLERI,
  calismaYerlesim,
  calismaDikey,
  type IpucuTanim,
  type IzNoktasi,
  type Kadraj,
  type KadrajAdi,
  type Kamera,
  type OdaId,
  yakinlikSiniri,
} from './mantik';
import { filmKatmani, resim } from './resimler';

export const AZ_HAREKET = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const px = (v: number) => `${v.toFixed(1)}px`;

/** Eşya (oda oranı; alt orta noktası x, y; boy h oda boyunun oranı) */
function esya(ad: string, o: { x: number; y: number; h: number; don?: number }, sinif = '', W: number): HTMLElement | null {
  const url = resim(ad);
  if (!url) return null;
  return h(`img.dd-esya${sinif ? '.' + sinif.split(' ').join('.') : ''}`, {
    src: url,
    alt: '',
    draggable: 'false',
    'data-esya': ad,
    style: `left:${px(o.x * W)};top:${px(o.y * ODA_H)};height:${px(o.h * ODA_H)};--don:${o.don ?? 0}deg`,
  });
}

/** Gizli ipucu (ortası x, y) */
function ipucuEl(t: IpucuTanim, W: number): HTMLElement {
  const url = resim(t.resim) ?? '';
  return h(
    `div.dd-ipucu${t.gizli ? '.bt-gizli' : ''}`,
    { 'data-ipucu': t.id, style: `left:${px(t.x * W)};top:${px(t.y * ODA_H)};height:${px(t.h * ODA_H)};--don:${t.don ?? 0}deg` },
    h('img', { src: url, alt: '', draggable: 'false' }),
  );
}

/** Pati izleri (gizli değil ama soluk; sırayla dokunulunca parlar) */
export function izlerEl(izler: IzNoktasi[], resimAd: string, W: number, yol?: string): HTMLElement[] {
  const url = resim(resimAd) ?? '';
  return izler.map((p, i) =>
    h(
      'button.dd-iz',
      {
        type: 'button',
        'aria-label': 'İz',
        'data-iz': String(i),
        'data-yol': yol,
        style: `left:${px(p.x * W)};top:${px(p.y * ODA_H)};height:${px(p.h * ODA_H)};--don:${p.don}deg;--i:${i}`,
      },
      h('img', { src: url, alt: '', draggable: 'false' }),
    ),
  );
}

export interface Oda {
  id: OdaId;
  el: HTMLElement;
  W: number;
  /** katmanlar (derinlik: uzak +, ön -) */
  katmanlar: { el: HTMLElement; derinlik: number }[];
  /** adıyla eşya / yer */
  e: Record<string, HTMLElement>;
}

function katman(sinif: string, derinlik: number, ...cocuk: (HTMLElement | null)[]) {
  return { el: h(`div.dd-katman.${sinif}`, {}, ...cocuk), derinlik };
}

/** Çalışma odası (film/ev katmanları): masa, devrik lamba, pencere, halı */
export function calismaOdasi(ipuclari: IpucuTanim[]): Oda {
  // dikey ekranda (boy > en) ve 9:16 çizim varsa: tek resimli dikey oda (mantik.ts → calismaYerlesim); yoksa yatay
  const dikeyUrl = filmKatmani('ev', 'oda-dikey');
  const dikey = !!dikeyUrl && typeof window !== 'undefined' && window.innerHeight > window.innerWidth;
  calismaYerlesim(dikey);
  const W = odaW('calisma');
  const zemin = (ad: 'arka-uzak' | 'arka-orta' | 'arka-on') =>
    dikey ? (ad === 'arka-uzak' ? h('img.dd-zemin', { src: dikeyUrl, alt: '', draggable: 'false' }) : null) : h('img.dd-zemin', { src: filmKatmani('ev', ad), alt: '', draggable: 'false' });
  const e: Record<string, HTMLElement> = {};
  const ipucu = (id: string) => {
    const t = ipuclari.find((i) => i.id === id);
    if (!t) return null;
    const el = ipucuEl(t, W);
    e[`ipucu-${id}`] = el;
    return el;
  };
  // pencerenin camı: kelebek bunun içinde uçar (camın dışında kalan kısmı görünmez)
  const c = CALISMA.cam;
  const kelebek = h('div.dd-kelebek', { 'data-ipucu': 'kelebek' }, h('img', { src: resim('kart-sari-kelebek') ?? '', alt: '', draggable: 'false' }));
  const kelebekT = ipuclari.find((i) => i.id === 'kelebek');
  const cam = h('div.dd-cam', { style: `left:${px(c.x0 * W)};top:${px(c.y0 * ODA_H)};width:${px((c.x1 - c.x0) * W)};height:${px((c.y1 - c.y0) * ODA_H)}` }, kelebek);
  const kx = kelebekT ? (kelebekT.x - c.x0) / (c.x1 - c.x0) : 0.35;
  const ky = kelebekT ? (kelebekT.y - c.y0) / (c.y1 - c.y0) : 0.5;
  kelebek.style.cssText = `left:${(kx * 100).toFixed(2)}%;top:${(ky * 100).toFixed(2)}%;height:${px((kelebekT?.h ?? 0.09) * ODA_H)}`;
  e.kelebek = kelebek;
  e.cam = cam;
  const uzak = katman('dd-k-uzak', dikey ? 0 : 0.035, zemin('arka-uzak'), cam, ipucu('toz'));
  const masa = esya('masa', CALISMA.masa, 'dd-masa', W);
  if (masa) e.masa = masa;
  const kalem = esya('kalemlik', CALISMA.kalem, 'dd-kalem', W);
  if (kalem) e.kalem = kalem;
  const lambaDik = esya('lamba-dik', CALISMA.lambaDik, 'dd-lamba-dik', W);
  if (lambaDik) e.lambaDik = lambaDik;
  const orta = katman('dd-k-orta', 0, zemin('arka-orta'), masa, kalem, lambaDik, ipucu('tuy'));
  const lambaDevrik = esya('lamba-devrik', CALISMA.lambaDevrik, 'dd-lamba-devrik', W);
  if (lambaDevrik) e.lambaDevrik = lambaDevrik;
  const izler = h('div.dd-izler.dd-izler-calisma.bt-yok', {}, ...izlerEl(CALISMA_IZLERI, 'kart-kedi-pati-izi', W, 'calisma'));
  e.izler = izler;
  const on = katman('dd-k-on', 0, zemin('arka-on'), ipucu('pati-hali'), lambaDevrik, izler);
  // sabah loşluğu (lamba yanınca aydınlanır) ve lambanın sıcak ışığı
  const los = h('div.dd-los.bt-yok');
  const isik = h('div.dd-lamba-isik.bt-yok', { style: `left:${px(CALISMA.lambaDik.x * W)};top:${px((CALISMA.lambaDik.y - CALISMA.lambaDik.h * 0.72) * ODA_H)}` });
  e.los = los;
  e.isik = isik;
  // geçmişe dönüş (Halka 3 canlandırması) katmanı
  const anı = h('div.dd-ani.bt-yok');
  e.ani = anı;
  const katmanlar = [uzak, orta, on];
  const el = h('div.dd-dunya', { 'data-oda': 'calisma', 'data-dikey': dikey ? '1' : undefined, style: `width:${px(W)};height:${px(ODA_H)}` }, ...katmanlar.map((k) => k.el), anı, isik, los);
  return { id: 'calisma', el, W, katmanlar, e };
}

/** Koridor: önden ortaya ortak iz, iki kapıya ayrılan izler (yanlar: hangi kapı mutfak) */
export function koridor(yollar: Record<'sol' | 'sag', 'mutfak' | 'yatak'>, yolIzleri: (yan: 'sol' | 'sag') => IzNoktasi[]): Oda {
  const W = odaW('koridor');
  const e: Record<string, HTMLElement> = {};
  const ortak = h('div.dd-izler.dd-izler-ortak', {}, ...izlerEl(KORIDOR_IZLERI, 'kart-kedi-pati-izi', W, 'ortak'));
  const yan = (y: 'sol' | 'sag') => {
    const tur = yollar[y];
    // mutfağa gidenler Kino'nun büyük, tırnaklı izleri; yatak odasına gidenler küçük, yuvarlak kedi izleri
    const izler = yolIzleri(y).map((p) => (tur === 'mutfak' ? { ...p, h: p.h * 1.25 } : p));
    return h(`div.dd-izler.dd-izler-yol.dd-yol-${tur}`, { 'data-yol': tur, 'data-yan': y }, ...izlerEl(izler, tur === 'mutfak' ? 'ipucu-kopek-pati' : 'kart-kedi-pati-izi', W, tur));
  };
  e.ortak = ortak;
  e.sol = yan('sol');
  e.sag = yan('sag');
  const el = h('div.dd-dunya', { 'data-oda': 'koridor', style: `width:${px(W)};height:${px(ODA_H)}` }, katman('dd-k-tek', 0, h('img.dd-zemin', { src: resim('koridor') ?? '', alt: '', draggable: 'false' }), ortak, e.sol, e.sag).el);
  return { id: 'koridor', el, W, katmanlar: [], e };
}

/** Yatak odası: izler yatağın ayak ucuna; yatağın altında karanlık aralık, sallanan beyaz kuyruk ucu, saklanan Pamuk */
export function yatakOdasi(pamuk: HTMLElement, kuyruk: HTMLElement): Oda {
  const W = odaW('yatak');
  const e: Record<string, HTMLElement> = {};
  const url = resim('yatak-odasi') ?? '';
  const a = YATAK.alt;
  const alt = h('div.dd-yatak-alti', { style: `left:${px(a.x0 * W)};top:${px(a.y0 * ODA_H)};width:${px((a.x1 - a.x0) * W)};height:${px((a.y1 - a.y0) * ODA_H)}` }, h('i.dd-goz-parla'), h('i.dd-goz-parla'));
  const k = YATAK.kuyruk;
  kuyruk.style.cssText = `left:${px(k.x * W)};top:${px(k.y * ODA_H)};height:${px(k.h * ODA_H)}`;
  const s = YATAK.saklan;
  pamuk.style.left = px(s.x * W);
  pamuk.style.top = px(s.y * ODA_H);
  // yatağın önden görünen kısmı: aynı resim, yatağın çevresinden kırpılmış (Pamuk bunun arkasından çıkar)
  const cokgen = YATAK.on.map(([x, y]) => `${(x * 100).toFixed(2)}% ${(y * 100).toFixed(2)}%`).join(', ');
  const on = h('img.dd-zemin.dd-yatak-on', { src: url, alt: '', draggable: 'false', style: `clip-path:polygon(${cokgen})` });
  const izler = h('div.dd-izler.dd-izler-yatak', {}, ...izlerEl(YATAK_IZLERI, 'kart-kedi-pati-izi', W, 'yatak'));
  e.izler = izler;
  e.alt = alt;
  e.on = on;
  const el = h('div.dd-dunya', { 'data-oda': 'yatak', style: `width:${px(W)};height:${px(ODA_H)}` }, katman('dd-k-tek', 0, h('img.dd-zemin', { src: url, alt: '', draggable: 'false' }), alt, kuyruk, pamuk, on, izler).el);
  return { id: 'yatak', el, W, katmanlar: [], e };
}

/** Mutfak (yanlış yol): Kino'nun izleri buzdolabının önünde biter */
export function mutfak(): Oda {
  const W = odaW('mutfak');
  const e: Record<string, HTMLElement> = {};
  const izler = h('div.dd-izler.dd-izler-mutfak', {}, ...izlerEl(MUTFAK_IZLERI, 'ipucu-kopek-pati', W, 'mutfak'));
  e.izler = izler;
  const sosis = esya('sosis', { x: 0.17, y: 0.885, h: 0.06, don: -12 }, 'dd-sosis', W);
  if (sosis) e.sosis = sosis;
  const el = h(
    'div.dd-dunya',
    { 'data-oda': 'mutfak', style: `width:${px(W)};height:${px(ODA_H)}` },
    katman('dd-k-tek', 0, h('img.dd-zemin', { src: filmKatmani('mutfak', 'arka-uzak'), alt: '', draggable: 'false' }), h('img.dd-zemin', { src: filmKatmani('mutfak', 'arka-orta'), alt: '', draggable: 'false' }), izler, sosis).el,
  );
  return { id: 'mutfak', el, W, katmanlar: [], e };
}

/** Kameranın kadrajı ekranda nereye sığsın: üst çubuğun altı; karakterlerin durduğu alt köşeler (dikeyde) dışarıda */
export type Guvenli = (w: number, hgt: number) => [number, number, number, number];

/**
 * Dikey (dar) ekranda oda ekranı boydan kaplar; bu kadar yakından bakılır ki pencere / gök yalnız bir şerit kalsın,
 * zemin, halı ve ipuçları ekranın ortasına gelsin (Barış: "ekranın yarısı gökyüzü"). Koridorda iki yol birlikte görünsün diye az.
 */
export const DAR_YAKIN: Record<OdaId, number> = { calisma: 2, koridor: 1.25, yatak: 1.6, mutfak: 1.4 };

/**
 * Odaların arka plan resminin doğal boyu (px; resim yüklenene dek). Kamera bu resmi cihazda doğal pikselinin
 * PIKSEL_SINIR (×2.2) katından fazla büyütmez: DAR_YAKIN o sınıra kadar uygulanır (daha büyük çizim gelince tamamı).
 */
const ZEMIN_BOY: Record<OdaId, number> = { calisma: 1536, koridor: 1080, yatak: 1080, mutfak: 1536 };

export class Dunya {
  readonly el: HTMLElement;
  oda: Oda | null = null;
  kamera: Kamera = { s: 1, tx: 0, ty: 0 };
  private kadraj: Kadraj = KADRAJ.genel;
  private yakin = 1;
  private anim: Animation[] = [];
  /** kamera bitti (büyüteç kopyası tazelensin) */
  kameraBitti: (() => void) | null = null;
  /** dikey ekranda bu çekim için oda yakınlığı (null: odanın kendi değeri, DAR_YAKIN) */
  darYakin: number | null = null;

  constructor(private guvenli: Guvenli) {
    this.el = h('div.dd-sahne');
  }

  get boyut() {
    return { w: this.el.clientWidth || window.innerWidth, h: this.el.clientHeight || window.innerHeight };
  }

  /** Odayı hemen kurar (geçişsiz) */
  kur(oda: Oda, kadraj: KadrajAdi | Kadraj = 'genel') {
    this.oda?.el.remove();
    this.oda = oda;
    this.el.append(oda.el);
    this.resimBekle(oda);
    this.kadraj = typeof kadraj === 'string' ? KADRAJ[kadraj] : kadraj;
    this.uygula(this.hesapla());
  }

  /** Yeni oda yandan kayarak gelir (yon 1: sağdan) */
  async gec(oda: Oda, kadraj: KadrajAdi | Kadraj, yon: 1 | -1 = 1, ms = 900) {
    const eski = this.oda;
    this.oda = oda;
    this.el.append(oda.el);
    this.resimBekle(oda);
    this.kadraj = typeof kadraj === 'string' ? KADRAJ[kadraj] : kadraj;
    const k = this.hesapla();
    this.uygula(k);
    if (!eski || TEST_MODU || AZ_HAREKET) {
      eski?.el.remove();
      this.kameraBitti?.();
      return;
    }
    const W = this.boyut.w;
    const egri = 'cubic-bezier(0.65, 0, 0.3, 1)';
    const t1 = eski.el.style.transform;
    const a1 = eski.el.animate([{ transform: t1 }, { transform: `translateX(${-yon * W * 1.05}px) ${t1}` }], { duration: sure(ms), easing: egri, fill: 'forwards' });
    const t2 = oda.el.style.transform;
    const a2 = oda.el.animate([{ transform: `translateX(${yon * W * 1.05}px) ${t2}` }, { transform: t2 }], { duration: sure(ms), easing: egri });
    await Promise.all([a1.finished.catch(() => undefined), a2.finished.catch(() => undefined)]);
    eski.el.remove();
    // eski odaya geri dönülebilir (koridor ↔ mutfak): kalıcı "dışarıda" animasyonu kalmasın
    a1.cancel();
    this.kameraBitti?.();
  }

  /** Kamerayı bir kadraja kaydırır (yalnız transform) */
  async git(kadraj: KadrajAdi | Kadraj, ms = 1100, yakin = 1) {
    this.kadraj = typeof kadraj === 'string' ? KADRAJ[kadraj] : kadraj;
    this.yakin = yakin;
    const eski = this.kamera;
    const yeni = this.hesapla();
    if (!this.oda) return;
    this.anim.forEach((a) => a.cancel());
    this.anim = [];
    const once = this.donusumler(eski);
    this.uygula(yeni);
    if (TEST_MODU || AZ_HAREKET || !ms) {
      this.kameraBitti?.();
      return;
    }
    const sonra = this.donusumler(yeni);
    const egri = 'cubic-bezier(0.55, 0.05, 0.25, 1)';
    this.anim = once.map(([el, t], i) => el.animate([{ transform: t }, { transform: sonra[i][1] }], { duration: sure(ms), easing: egri }));
    await Promise.all(this.anim.map((a) => a.finished.catch(() => undefined)));
    this.anim = [];
    this.kameraBitti?.();
  }

  /** Ekran boyu değişince kadraj korunur */
  yenile() {
    if (!this.oda) return;
    this.uygula(this.hesapla());
    this.kameraBitti?.();
  }

  /** Oda oranındaki nokta → sahne (ekran) px */
  ekranda(x: number, y: number): [number, number] {
    const W = this.oda?.W ?? 1;
    return ekranda(this.kamera, { w: W, h: ODA_H }, x, y);
  }
  /** Dünya biriminin ekrandaki karşılığı (px / dünya px) */
  get olcek() {
    return this.kamera.s;
  }
  /** Bir elemanın sahne içindeki merkezi ve yarıçapı (px) */
  merkez(el: Element): { x: number; y: number; r: number } {
    const a = el.getBoundingClientRect();
    const k = this.el.getBoundingClientRect();
    return { x: a.left - k.left + a.width / 2, y: a.top - k.top + a.height / 2, r: Math.max(a.width, a.height) / 2 };
  }

  private hesapla(): Kamera {
    const { w, h: hgt } = this.boyut;
    const dar = w < hgt * 1.15;
    let yakin = dar ? (this.darYakin ?? DAR_YAKIN[this.oda?.id ?? 'calisma']) : 1;
    // dikey çalışma odası zaten ekran oranında: kamera az yaklaşır (halı ve ipuçları hep görünür)
    // Pencere çekimi (kadraj odanın üst şeridinde) hariç: pencere ince bir şerit, kelebek üst çubuğun altında kalmasın diye yaklaşılır
    const dikeyOda = this.oda?.id === 'calisma' && calismaDikey && this.kadraj[1] >= 0.05;
    if (dikeyOda) yakin = Math.min(yakin, 1.1);
    const enCok = yakinlikSiniri(this.dogalBoy(), window.devicePixelRatio || 1);
    let kd = this.kadraj;
    if (dikeyOda) {
      // dikey odada kadraj en az odanın %70'i boyunda ve tam eninde: kamera hafif yaklaşır, halı / masa / Mino-Kino birlikte
      const [, y0, , y1] = kd;
      const yuk = Math.max(0.7, y1 - y0);
      const a = Math.min(Math.max(0, (y0 + y1) / 2 - yuk / 2), 1 - yuk);
      kd = [0, a, 1, a + yuk];
    }
    return kameraHesap(kd, { w: this.oda?.W ?? w, h: ODA_H }, { w, h: hgt }, this.guvenli(w, hgt), this.yakin, yakin, enCok);
  }

  /** Odanın arka plan resimlerinin en küçük doğal boyu (px; yüklenmemişse bilinen boy) */
  private dogalBoy(): number {
    const oda = this.oda;
    if (!oda) return ZEMIN_BOY.calisma;
    const boylar = [...oda.el.querySelectorAll<HTMLImageElement>('img.dd-zemin')].map((i) => i.naturalHeight).filter((n) => n > 0);
    return boylar.length ? Math.min(...boylar) : ZEMIN_BOY[oda.id];
  }

  /** Arka plan resmi sonradan yüklenince yakınlık sınırı resmin gerçek boyuna göre yeniden hesaplanır */
  private resimBekle(oda: Oda) {
    for (const i of oda.el.querySelectorAll<HTMLImageElement>('img.dd-zemin')) {
      if (i.complete) continue;
      i.addEventListener(
        'load',
        () => {
          if (this.oda !== oda || this.anim.length) return;
          const k = this.hesapla();
          if (Math.abs(k.s - this.kamera.s) > 1e-3) this.yenile();
        },
        { once: true },
      );
    }
  }

  /** Dünyanın ve katmanların (derinlik) transform'ları */
  private donusumler(k: Kamera): [HTMLElement, string][] {
    const oda = this.oda;
    if (!oda) return [];
    const l: [HTMLElement, string][] = [[oda.el, `translate3d(${px(k.tx)}, ${px(k.ty)}, 0) scale(${k.s.toFixed(4)})`]];
    const { w } = this.boyut;
    // kameranın ortası odanın ortasından ne kadar uzak (dünya px): uzak katman o yöne biraz kayar (yavaş kalır).
    // Yalnız + derinlik: kayınca açılan kenar hep görünmeyen taraftadır (kamera kenara dayanınca kayma o yöne değil).
    const cx = (w / 2 - k.tx) / k.s - oda.W / 2;
    for (const kt of oda.katmanlar) {
      if (kt.derinlik <= 0) continue;
      l.push([kt.el, `translate3d(${px(cx * kt.derinlik)}, 0, 0)`]);
    }
    return l;
  }

  private uygula(k: Kamera) {
    this.kamera = k;
    for (const [el, t] of this.donusumler(k)) el.style.transform = t;
    this.el.style.setProperty('--olcek', k.s.toFixed(4));
  }
}
