/**
 * Karakter: kişilikli, canlı bir hayvan (ortak bileşen: pazar müşterileri, ileride film ve diğer oyunlar).
 *
 * İki çizim biçimi, tek hareket motoru:
 * - İskelet varsa (assets/karakter-iskelet/<ad>.svg + .json; standart ekip/film/FILM-REHBERI.md §5) parçalar ayrı
 *   ayrı döner: kafa, kulaklar, kollar, bacak/ayak, kuyruk, gözler (kırpma), ağız / gaga (konuşma, yeme).
 * - Yoksa tek görsel (ör. assets/hayvanlar/<ad>.webp) bütün olarak esner, eğilir, seker.
 *
 * Hareketler işlemsel: her karede bir "poz" hesaplanır (bekleme nefesi + o anki hareket), sonra çizime uygulanır.
 * Mino'nun iskelet yaklaşımıyla aynı (src/mino/mino.ts): dönme noktaları çizimin 2048'lik koordinatlarında,
 * transform-box: view-box. Yalnız transform / opacity.
 */
import { h, TEST_MODU } from '../ui/dom';
import { kisilik, type Kisilik, type Yuruyus } from './kisilik';

interface IskeletBilgi {
  ad: string;
  boyut: number;
  sira: string[];
  gizli: string[];
  bagli: Record<string, string>;
  donme: Record<string, [number, number]>;
  /** isteğe bağlı: ifade setleri (yoksa gizli eklerin adlarından türetilir) */
  ifadeler?: Record<string, { goster: string[]; gizle: string[] }>;
}

/** İfade adları ve onları gösteren gizli eklerin son ekleri (goz-uzgun, kulak-sol-dusuk …) */
const IFADE_EKLERI: Record<string, string[]> = { uzgun: ['uzgun', 'dusuk'], mutlu: ['mutlu'], saskin: ['saskin'], kizgin: ['kizgin'] };

/**
 * Gizli eklerden ifade setleri: "<taban>-<ek>" katmanı gösterilir, tabanı gizlenir. Taban bir katmansa o
 * (kulak-sol-dusuk → kulak-sol), değilse tabanla başlayan görünür katmanlar (goz-uzgun → goz-sol, goz-sag).
 */
export function ifadeSetleri(b: Pick<IskeletBilgi, 'sira' | 'gizli' | 'ifadeler'>): Record<string, { goster: string[]; gizle: string[] }> {
  const setler: Record<string, { goster: string[]; gizle: string[] }> = {};
  for (const [ad, ekler] of Object.entries(IFADE_EKLERI)) {
    const goster: string[] = [];
    const gizle = new Set<string>();
    for (const id of b.gizli) {
      const ek = ekler.find((e) => id.endsWith('-' + e));
      if (!ek) continue;
      goster.push(id);
      const taban = id.slice(0, -(ek.length + 1));
      if (b.sira.includes(taban)) gizle.add(taban);
      else for (const x of b.sira) if (x.startsWith(taban + '-') && !b.gizli.includes(x)) gizle.add(x);
    }
    if (goster.length) setler[ad] = { goster, gizle: [...gizle] };
  }
  return { ...setler, ...(b.ifadeler ?? {}) };
}

const BILGILER = import.meta.glob<IskeletBilgi>('../../assets/karakter-iskelet/*.json', { eager: true, import: 'default' });
const SVGLER = import.meta.glob<string>('../../assets/karakter-iskelet/*.svg', { eager: true, query: '?url', import: 'default' });
const bilgi = (ad: string) => BILGILER[`../../assets/karakter-iskelet/${ad}.json`];
const svgAdresi = (ad: string) => SVGLER[`../../assets/karakter-iskelet/${ad}.svg`];
export const iskeletVar = (ad: string) => !!bilgi(ad) && !!svgAdresi(ad);

/** SVG metni bir kez indirilir, sonra aynı karakterin bütün kopyaları kullanır */
const onbellek = new Map<string, Promise<string | null>>();
function svgGetir(ad: string): Promise<string | null> {
  let p = onbellek.get(ad);
  if (!p) {
    p = fetch(svgAdresi(ad))
      .then((r) => (r.ok ? r.text() : null))
      .catch(() => null);
    onbellek.set(ad, p);
  }
  return p;
}

const AZ = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** O karedeki duruş. Açılar derece; kol/kulak/bacak için + = dışa / yukarı kalkar. y: boyun %'si, - = yukarı */
export interface Poz {
  x: number;
  y: number;
  don: number;
  sx: number;
  sy: number;
  kafa: number;
  kafaY: number;
  kulakSol: number;
  kulakSag: number;
  kolSol: number;
  kolSag: number;
  bacakSol: number;
  bacakSag: number;
  kuyruk: number;
  gozKapali: boolean;
  agizAcik: number;
  burun: number;
}
const bosPoz = (): Poz => ({ x: 0, y: 0, don: 0, sx: 1, sy: 1, kafa: 0, kafaY: 0, kulakSol: 0, kulakSag: 0, kolSol: 0, kolSag: 0, bacakSol: 0, bacakSag: 0, kuyruk: 0, gozKapali: false, agizAcik: 0, burun: 0 });

export type HareketAdi = 'yuru' | 'var' | 'huy' | 'hayir' | 'ye' | 'dans' | 'sevin' | 'kokla' | 'bak';
interface Hareket {
  ad: HareketAdi;
  bas: number;
  sure: number;
  coz: () => void;
}

const S = Math.sin;
const PI = Math.PI;
/** 0..1 arasında yumuşak aç-kapa zarfı */
const zarf = (u: number, kenar = 0.15) => Math.min(1, u / kenar, (1 - u) / kenar);

export class Karakter {
  readonly el: HTMLElement;
  readonly ad: string;
  readonly k: Kisilik;
  private tek: HTMLElement | null = null;
  private parca = new Map<string, SVGGElement>();
  private dn: Record<string, [number, number]> = {};
  private bagli: Record<string, string> = {};
  private gizli = new Set<string>();
  private setler: Record<string, { goster: string[]; gizle: string[] }> = {};
  private ifadeAd: string | null = null;
  private ifadeBitis = 0;
  private sonGorunum = new Map<string, boolean>();
  private raf = 0;
  private t0 = performance.now();
  private hareket: Hareket | null = null;
  private konusma = false;
  private sonrakiKirp = 1.5;
  private kirp = -1;

  /** yedek: iskelet yoksa (ya da yüklenene kadar) gösterilecek tek görselin adresi */
  constructor(ad: string, yedek: HTMLElement) {
    this.ad = ad;
    this.k = kisilik(ad);
    this.tek = h('div.kr-tek', {}, yedek);
    this.el = h('div.kr-karakter', { 'data-karakter': ad }, this.tek);
    if (iskeletVar(ad)) void this.iskeletKur();
    this.raf = requestAnimationFrame((t) => this.kare(t));
  }

  private async iskeletKur() {
    const b = bilgi(this.ad);
    const metin = await svgGetir(this.ad);
    if (!metin || !this.el.isConnected && this.raf === 0) return;
    const kap = h('div.kr-iskelet', { html: metin.replace(/<\?xml[^>]*>/, '') });
    const svg = kap.querySelector('svg');
    if (!svg) return;
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.setAttribute('aria-hidden', 'true');
    // kimlikler sayfada çakışmasın: id → data-parca
    for (const g of svg.querySelectorAll<SVGGElement>('g[id]')) {
      const id = g.id;
      g.removeAttribute('id');
      g.dataset.parca = id;
      if (b.gizli.includes(id)) {
        g.removeAttribute('display');
        g.style.opacity = '0';
      }
      this.parca.set(id, g);
    }
    // katman sırası JSON'daki "sira"dan (arkadan öne): SVG'deki sıra ne olursa olsun
    for (const id of b.sira) {
      const g = this.parca.get(id);
      if (g?.parentNode) g.parentNode.appendChild(g);
    }
    this.dn = b.donme;
    this.bagli = b.bagli;
    this.gizli = new Set(b.gizli);
    this.setler = ifadeSetleri(b);
    this.el.replaceChildren(kap);
    this.tek = null;
    this.el.classList.add('kr-iskeletli');
  }

  /** Bir hareketi oynatır (öncekini keser); bitince çözülür */
  oynat(ad: HareketAdi, sure: number): Promise<void> {
    this.hareket?.coz();
    const sn = TEST_MODU ? 0.03 : AZ ? Math.min(sure, 400) / 1000 : sure / 1000;
    return new Promise((coz) => {
      this.hareket = { ad, bas: this.zaman(), sure: sn, coz };
    });
  }

  /** Konuşuyor mu: açıkken ağız (agiz-acik katmanı ya da gaga) açılıp kapanır */
  /**
   * Yüz ifadesi (ör. 'uzgun'): o ifadenin katmanları görünür, yerine geçtikleri gizlenir. ms verilirse o süre
   * sonra normale döner; null normale döndürür. Karakterde o ifade yoksa (ya da tek görselse) bir şey olmaz.
   */
  ifade(ad: string | null, ms = 0) {
    this.ifadeAd = ad && this.setler[ad] ? ad : null;
    this.ifadeBitis = ms && this.ifadeAd ? performance.now() + (TEST_MODU ? 30 : ms) : 0;
  }

  /** Bu karakterde bu ifade var mı */
  ifadeVar(ad: string) {
    return !!this.setler[ad];
  }

  konus(acik: boolean) {
    this.konusma = acik;
  }

  get mesgul() {
    return !!this.hareket;
  }

  kapat() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.hareket?.coz();
    this.hareket = null;
  }

  private zaman() {
    return (performance.now() - this.t0) / 1000;
  }

  // ---------------------------------------------------------------- poz hesabı
  private kare(_: number) {
    this.raf = requestAnimationFrame((t) => this.kare(t));
    const t = this.zaman();
    const p = bosPoz();
    // bekleme: nefes, kulak salınımı, göz kırpma
    if (!AZ) {
      p.sy = 1 + S(t * 1.9) * 0.014;
      p.sx = 1 - S(t * 1.9) * 0.006;
      p.kulakSol = S(t * 1.3) * 3;
      p.kulakSag = S(t * 1.3 + 1.1) * 3;
      // kuyruk: çoğunda hafif salınım; köpekte (huy: kuyruk) hızlı sallanır
      p.kuyruk = this.k.huy === 'kuyruk' ? S(t * 7) * 16 : S(t * 2.2) * 4;
      p.kafa = S(t * 0.8) * 1.5;
    }
    if (t > this.sonrakiKirp) {
      this.kirp = t;
      this.sonrakiKirp = t + 2.4 + Math.random() * 3;
    }
    if (this.kirp >= 0 && t - this.kirp < 0.14) p.gozKapali = true;

    const hr = this.hareket;
    if (hr) {
      const u = Math.min(1, (t - hr.bas) / Math.max(0.001, hr.sure));
      this.uygula(hr, t - hr.bas, u, p);
      if (u >= 1) {
        this.hareket = null;
        hr.coz();
      }
    }
    // konuşurken ağız açılıp kapanır
    if (this.konusma) p.agizAcik = Math.max(p.agizAcik, S(t * 17) > 0 ? 1 : 0.2);
    this.ciz(p);
  }

  private uygula(hr: Hareket, gecen: number, u: number, p: Poz) {
    const k = this.k;
    switch (hr.ad) {
      case 'yuru':
        yuruyus(k.yuruyus, gecen / (k.adim / 1000), p);
        break;
      case 'var': {
        // varış: basıp toparlanır
        const e = S(Math.min(1, u * 1.4) * PI) * (1 - u * 0.4);
        p.sx *= 1 + 0.1 * e;
        p.sy *= 1 - 0.1 * e;
        p.kulakSol += 10 * e;
        p.kulakSag += 10 * e;
        break;
      }
      case 'hayir': {
        const a = k.hayir * S(u * PI * 4) * (1 - u);
        p.kafa += a;
        p.kulakSol -= a * 0.8;
        p.kulakSag += a * 0.8;
        p.don += a * 0.2;
        break;
      }
      case 'huy':
        huy(k.huy, gecen, u, p);
        break;
      case 'ye': {
        // koklar, sonra üç ısırık: kafa iner, ağız açılıp kapanır, yanaklar şişer
        const z = zarf(u, 0.1);
        p.kafa += 5 * Math.abs(S(u * PI * 3)) * z;
        p.agizAcik = S(u * PI * 6) > 0 ? 1 : 0;
        p.sx *= 1 + 0.03 * Math.abs(S(u * PI * 6)) * z;
        p.kulakSol += 6 * S(u * PI * 6);
        p.kulakSag += 6 * S(u * PI * 6);
        break;
      }
      case 'kokla': {
        // koklar: kafa öne uzanıp kısa kısa iner-kalkar, kulaklar dikilir
        const z = zarf(u, 0.12);
        p.kafa += (5 + 3 * S(gecen * 26)) * z;
        p.kafaY += 1.5 * z;
        p.burun = S(gecen * 40) * 5 * z;
        p.kulakSol += 10 * z;
        p.kulakSag += 10 * z;
        break;
      }
      case 'bak': {
        // merakla başını yana yatırıp bakar
        const z = zarf(u, 0.2);
        p.kafa += 9 * z;
        p.kulakSol += 8 * z;
        p.kulakSag -= 4 * z;
        break;
      }
      case 'dans':
      case 'sevin':
        dans(k.dans, gecen, u, p);
        break;
    }
  }

  // ---------------------------------------------------------------- çizim
  private ciz(p: Poz) {
    if (this.tek) {
      // tek görsel: bütün beden
      this.tek.style.transform = `translate(${p.x}%, ${p.y}%) rotate(${(p.don + p.kafa * 0.35).toFixed(2)}deg) scale(${p.sx.toFixed(3)}, ${p.sy.toFixed(3)})`;
      return;
    }
    if (!this.parca.size) return;
    const dn = this.dn;
    const olcek = 20.48; // % → çizim birimi (2048 / 100)
    const kokN = dn.govde ?? [1024, 1930];
    const kok = `translate(${(p.x * olcek).toFixed(1)}px, ${(p.y * olcek).toFixed(1)}px) ${etrafinda(kokN, p.don, p.sx, p.sy)}`;
    // karaktere özel sınırlar (ör. ayı: kafa ±6, kulak ±10, bacak ±5)
    const s = this.k.sinir ?? {};
    const sin = (a: number, m?: number) => (m === undefined ? a : Math.max(-m, Math.min(m, a)));
    // kafa eğilmesi iskelette genlik çarpanıyla (canlı dursun; eskiden kafa katmanı açının iki katı dönüyordu),
    // bağlı parçalar (kulak, göz, ağız) aynı dönüşü paylaşır; karaktere özel sınır en son uygulanır
    const kafaAci = sin(p.kafa * (this.k.kafaGenlik ?? 1.8), s.kafa);
    const kafaT = dn.kafa ? etrafinda(dn.kafa, kafaAci, 1, 1, 0, p.kafaY * olcek) : '';
    // kafa yalnız kafaT ile döner (bağlı parçalar da aynı dönüşü alır); açı tablosunda yok
    const aci: Record<string, number> = {
      'kulak-sol': -sin(p.kulakSol, s.kulak),
      'kulak-sag': sin(p.kulakSag, s.kulak),
      // kollar yalnız dışa doğru (sallama, uzatma, kaldırma): göbeğin önüne / karşıya geçmez
      'kol-sol': kolSinir(p.kolSol, this.k.kol),
      'kol-sag': -kolSinir(p.kolSag, this.k.kol),
      // kanatlar kolların yerine (kuş, ördek): + = açılır
      'kanat-sol': kanatSinir(p.kolSol),
      'kanat-sag': -kanatSinir(p.kolSag),
      'bacak-sol': sin(p.bacakSol, s.bacak),
      'bacak-sag': -sin(p.bacakSag, s.bacak),
      'ayak-sol': sin(p.bacakSol, s.bacak),
      'ayak-sag': -sin(p.bacakSag, s.bacak),
      kuyruk: p.kuyruk,
    };
    for (const [id, g] of this.parca) {
      let tr = kok;
      if (id === 'kafa') tr += ' ' + kafaT;
      else if (this.bagli[id] === 'kafa') tr += ' ' + kafaT;
      const a = aci[id];
      if (a && dn[id]) tr += ' ' + etrafinda(dn[id], a);
      if (id === 'agiz' && p.burun) tr += ` translate(0px, ${p.burun.toFixed(1)}px)`;
      // alt gaga menteşeden aşağı açılır, içi (gaga-ic) görünür
      if (id === 'gaga-alt' && dn[id] && p.agizAcik) tr += ' ' + etrafinda(dn[id], 0, 1, 1 + 0.12 * p.agizAcik, 0, 34 * p.agizAcik);
      g.style.transform = tr;
    }
    this.gorunurluk(p);
  }

  /** Hangi katman görünür: varsayılan (gizli ekler kapalı) → ifade → göz kırpma → konuşma ağzı */
  private gorunurluk(p: Poz) {
    if (this.ifadeBitis && performance.now() > this.ifadeBitis) this.ifade(null);
    const gor = new Map<string, boolean>();
    for (const id of this.parca.keys()) gor.set(id, !this.gizli.has(id));
    const set = this.ifadeAd ? this.setler[this.ifadeAd] : null;
    if (set) {
      for (const id of set.gizle) gor.set(id, false);
      for (const id of set.goster) gor.set(id, true);
    }
    // göz kırpma: açık göz görünüyorsa kapalı gözle değişir
    if (p.gozKapali && this.parca.has('goz-kapali') && (gor.get('goz-sol') || gor.get('goz-sag'))) {
      gor.set('goz-sol', false);
      gor.set('goz-sag', false);
      gor.set('goz-kapali', true);
    }
    // konuşma: normal ağız görünüyorsa açık ağızla değişir
    if (p.agizAcik > 0.5 && this.parca.has('agiz-acik') && gor.get('agiz')) {
      gor.set('agiz', false);
      gor.set('agiz-acik', true);
    }
    for (const [id, acik] of gor) {
      if (this.sonGorunum.get(id) === acik) continue;
      this.sonGorunum.set(id, acik);
      const g = this.parca.get(id);
      if (g) g.style.opacity = acik ? '1' : '0';
    }
  }
}

/** Kol açısı: içe en çok 5°, dışa/yukarı en çok 110° (iskelet standardındaki aralık) */
const kolSinir = (a: number, sinir: [number, number] = [-5, 110]) => Math.max(sinir[0], Math.min(sinir[1], a));
/** Kanat açısı: -30 (kapanır) … +60 (açılır) */
const kanatSinir = (a: number) => Math.max(-30, Math.min(60, a));

/** bir noktanın etrafında dönme + ölçek (çizim birimleri) */
function etrafinda([x, y]: [number, number], aci: number, sx = 1, sy = 1, tx = 0, ty = 0) {
  return `translate(${(x + tx).toFixed(1)}px, ${(y + ty).toFixed(1)}px) rotate(${aci.toFixed(2)}deg) scale(${sx.toFixed(3)}, ${sy.toFixed(3)}) translate(${-x}px, ${-y}px)`;
}

// ---------------------------------------------------------------- hareket kütüphanesi
/** Yürüyüş: adim = geçen adım sayısı (ondalıklı) */
function yuruyus(y: Yuruyus, adim: number, p: Poz) {
  const n = Math.floor(adim);
  const s = adim - n; // adımın içindeki yer 0..1
  const yon = n % 2 ? -1 : 1;
  const yay = S(s * PI); // 0 → 1 → 0
  switch (y) {
    case 'paytak': // iki yana yalpalar, kısa adım, ayaklar sırayla kalkar
      p.don += yon * 9 * yay;
      p.y -= 3 * yay;
      p.bacakSol += yon > 0 ? 14 * yay : 0;
      p.bacakSag += yon < 0 ? 14 * yay : 0;
      p.kuyruk += yon * 10 * yay;
      p.kafa -= yon * 4 * yay;
      // denge: kanatlar hafif açık, yalpalanan tarafınki biraz daha
      p.kolSol += 14 + (yon > 0 ? 8 : 0) * yay;
      p.kolSag += 14 + (yon < 0 ? 8 : 0) * yay;
      break;
    case 'hop': {
      // yay gibi sıçrar: çömelir, uzar, havada toplanır, iner; kulaklar geriden gelir
      p.y -= 24 * yay;
      const bas = s < 0.14 ? S((s / 0.14) * PI) : s > 0.86 ? S(((1 - s) / 0.14) * PI) : 0;
      p.sx *= 1 + 0.12 * bas - 0.06 * yay;
      p.sy *= 1 - 0.14 * bas + 0.08 * yay;
      p.don -= 5 * yay;
      p.kulakSol -= 16 * Math.cos(s * PI);
      p.kulakSag -= 16 * Math.cos(s * PI);
      p.bacakSol += 12 * yay;
      p.bacakSag += 12 * yay;
      p.kolSol += 18 * yay;
      p.kolSag += 18 * yay;
      break;
    }
    case 'agir': {
      // ağır ağır: bacaklar az açılır (ayıda ±5), ağırlık asıl gövdede: her basışta çöker, sonra yaylanıp kalkar,
      // omuzlar adımla iki yana yatar, kafa gövdeden biraz geç gelir
      const bas = Math.pow(1 - yay, 2); // adımın başı ve sonu: ayak yere basmış
      p.y -= 1.5 * yay;
      p.don += yon * 3.5 * yay;
      p.sx *= 1 + 0.07 * bas;
      p.sy *= 1 - 0.08 * bas + 0.02 * yay;
      p.bacakSol += yon > 0 ? 5 * yay : -3 * yay;
      p.bacakSag += yon < 0 ? 5 * yay : -3 * yay;
      p.kafa -= yon * 3 * S(s * PI - 0.6);
      p.kolSol += yon * 12 * yay;
      p.kolSag -= yon * 12 * yay;
      p.kulakSol += 4 * bas;
      p.kulakSag += 4 * bas;
      break;
    }
    case 'salin':
      p.don += yon * 5 * yay;
      p.y -= 2.5 * yay;
      p.kafa -= yon * 3 * yay;
      p.kuyruk += yon * 12 * yay;
      break;
    case 'tiris':
      p.y -= 6 * yay;
      p.don += 4 + yon * 2 * yay;
      p.kuyruk += 18 * S(adim * PI * 2);
      p.kulakSol -= 8 * yay;
      p.kulakSag -= 8 * yay;
      break;
    case 'takla':
      p.don += s * 360;
      p.y -= 26 * yay;
      break;
    case 'uc':
      p.y -= 4 * S(s * PI * 2);
      p.sy *= 1 - 0.1 * yay;
      p.don -= 6;
      p.kolSol += 50 * yay;
      p.kolSag += 50 * yay;
      break;
  }
}

/** Beklerken huy (u: 0..1, gecen: sn) */
function huy(h: Kisilik['huy'], gecen: number, u: number, p: Poz) {
  const z = zarf(u);
  switch (h) {
    case 'ayak': // ayak vurur: pat pat pat
      p.bacakSag += 16 * Math.abs(S(u * PI * 6)) * z;
      p.y -= 1.5 * Math.abs(S(u * PI * 6)) * z;
      p.don -= 3 * z;
      break;
    case 'burun': // burun kıpır kıpır, kulaklar sırayla seğirir
      p.burun = S(gecen * 55) * 5 * z;
      p.kulakSag += (u < 0.5 ? 12 * Math.abs(S(u * PI * 6)) : 0) * z;
      p.kulakSol += (u >= 0.5 ? 12 * Math.abs(S(u * PI * 6)) : 0) * z;
      p.kafa += 2 * S(u * PI * 2) * z;
      break;
    case 'esne': // gerinip esner
      p.sy *= 1 + 0.08 * S(u * PI);
      p.kolSol += 70 * S(u * PI);
      p.kolSag += 70 * S(u * PI);
      p.agizAcik = u > 0.3 && u < 0.7 ? 1 : 0;
      p.gozKapali = u > 0.3 && u < 0.7;
      break;
    case 'gevis': // geviş getirir
      p.kafa += 2.5 * S(u * PI * 4) * z;
      p.agizAcik = S(u * PI * 8) > 0.3 ? 0.6 : 0;
      break;
    case 'kuyruk': // kuyruk sallar, sonunda bir hop
      p.kuyruk += 25 * S(gecen * 26) * z;
      p.don += 4 * S(gecen * 26) * z;
      if (u > 0.7) p.y -= 8 * S(((u - 0.7) / 0.3) * PI);
      break;
    case 'kasin': // kaşınır: kol kafaya gider, yana eğilir
      p.don -= 8 * z;
      p.kolSag += 90 * z;
      p.kafa += 4 * S(gecen * 30) * z;
      break;
    case 'gaga': // iki kez gagalar
      p.kafa += 12 * Math.abs(S(u * PI * 2)) * z;
      p.kafaY += 1.5 * Math.abs(S(u * PI * 2)) * z;
      break;
  }
}

/** Sevinç dansı */
function dans(d: Kisilik['dans'], gecen: number, u: number, p: Poz) {
  const z = zarf(u, 0.08);
  switch (d) {
    case 'paytak':
      p.don += 12 * S(u * PI * 8) * z;
      p.y -= 8 * Math.abs(S(u * PI * 8)) * z;
      p.bacakSol += 18 * Math.max(0, S(u * PI * 8)) * z;
      p.bacakSag += 18 * Math.max(0, -S(u * PI * 8)) * z;
      p.kuyruk += 20 * S(u * PI * 16) * z;
      p.agizAcik = z > 0.5 ? 1 : 0;
      // sevinçle kanat çırpar
      p.kolSol += (15 + 45 * Math.abs(S(u * PI * 10))) * z;
      p.kolSag += (15 + 45 * Math.abs(S(u * PI * 10 + 0.4))) * z;
      break;
    case 'hop': {
      // tavşan: iki kol havaya, kulaklar sallanır, üç yüksek hop
      const s = (u * 3) % 1;
      const yay = S(s * PI);
      p.y -= 30 * yay * z;
      p.sx *= 1 - 0.06 * yay + 0.1 * (s < 0.1 || s > 0.9 ? 1 : 0) * z;
      p.sy *= 1 + 0.08 * yay;
      p.kolSol += 100 * z;
      p.kolSag += 100 * z;
      p.kulakSol += 16 * S(gecen * 16) * z;
      p.kulakSag += 16 * S(gecen * 16 + 1) * z;
      p.gozKapali = z > 0.6 && yay > 0.5;
      p.agizAcik = z > 0.3 ? 1 : 0;
      break;
    }
    case 'gobek':
      p.sx *= 1 + 0.08 * S(u * PI * 6) * z;
      p.sy *= 1 - 0.07 * S(u * PI * 6) * z;
      p.kolSol += 40 * Math.abs(S(u * PI * 3)) * z;
      p.kolSag += 40 * Math.abs(S(u * PI * 3)) * z;
      break;
    case 'don':
      p.sx *= Math.cos(u * PI * 2);
      p.don += 4 * S(u * PI * 4);
      p.y -= 5 * Math.abs(S(u * PI * 2));
      break;
    case 'kovala': {
      // köpek: kuyruk pervane gibi döner (3 tur), iki kez hoplar, patiler havada
      p.kuyruk += 1080 * u;
      const s = (u * 2) % 1;
      p.y -= 16 * S(s * PI) * z;
      p.sx *= 1 + 0.08 * (s < 0.12 || s > 0.88 ? 1 : 0) * z;
      p.sy *= 1 + 0.06 * S(s * PI) * z;
      p.kolSol += 55 * z;
      p.kolSag += 55 * z;
      p.kulakSol += 14 * S(gecen * 18) * z;
      p.kulakSag += 14 * S(gecen * 18 + 1) * z;
      p.agizAcik = z > 0.3 ? 1 : 0;
      p.gozKapali = z > 0.6 && S(s * PI) > 0.6;
      break;
    }
    case 'salto':
      p.don -= 360 * Math.min(1, Math.max(0, (u - 0.1) / 0.8));
      p.y -= 40 * S(Math.min(1, u) * PI);
      break;
    case 'kanat':
      p.y -= 45 * S(u * PI);
      p.sy *= 1 - 0.12 * Math.abs(S(u * PI * 8));
      p.kolSol += 70 * Math.abs(S(u * PI * 8));
      p.kolSag += 70 * Math.abs(S(u * PI * 8));
      break;
  }
}
