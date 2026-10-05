/**
 * Poz ekleri (Gemini çizimi, şeffaf: assets/dedektif/poz-<ad>.webp): hikâyenin birkaç anında iskeletli karakterin
 * yerine kısa süre tek resim konur (Kino halıda kayar, mutfakta utanır; Mino vaka çözülünce rahatlar; Pamuk yatağın
 * altından sürünür, özür diler, el sallar). Geçiş yumuşak esneyip basılmadır (en çok %8; çizim %10'dan fazla
 * esnetilmez): iskelet basılıp söner, poz basık doğup esneyerek oturur; dönüşte tersi.
 *
 * Boy: poz, karakterin kutusunda (iskeletin tuvali) ayak çizgisine oturur; yüksekliği karakterin normal görünen boyuna
 * göre (src/karakter/boy.ts → CIZIM) POZ_OLCU'daki oranla. Oranlar başın büyüklüğü iskeletteki başla aynı olsun diye
 * ölçüldü (yan yana çizilip): ayakta duran pozlarda ~1, sürünen / oturan pozlarda daha az.
 *
 * Yalnız transform / opacity; hiçbir zaman dokunuşu bekletmez (poz katmanı dokunuşları geçirir).
 */
import { CIZIM, type Cizim } from '../../src/karakter/boy';
import { h, sure } from '../../src/ui/dom';
import { AZ_HAREKET } from './dunya';
import { resim } from './resimler';

export type PozAd =
  | 'kino-kayma'
  | 'kino-utanc'
  | 'mino-rahat'
  | 'pamuk-surunme'
  | 'pamuk-ozur'
  | 'pamuk-el-salla'
  // Vaka 2 (assets/dedektif2): Kino atkısız üzgün, Kino göğsüne sarılıp gülümser; Vakvak Anne yuvada, gagasında atkı
  | 'kino-uzgun'
  | 'kino-sarilma'
  | 'ordek-kulucka'
  | 'ordek-atki';
export const POZLAR: PozAd[] = ['kino-kayma', 'kino-utanc', 'mino-rahat', 'pamuk-surunme', 'pamuk-ozur', 'pamuk-el-salla', 'kino-uzgun', 'kino-sarilma', 'ordek-kulucka', 'ordek-atki'];

export interface PozOlcu {
  /** resmin görünen yüksekliği / karakterin normal görünen boyu (baş aynı büyüklükte kalsın) */
  boy: number;
  /** yatay kayma (görünen boy oranı, + sağa) */
  x?: number;
  /** dikey kayma (görünen boy oranı, + aşağı) */
  y?: number;
}

/**
 * Ölçüler (iskeletle üst üste konup başlar eşlenerek: tests/screens/dedektif-yeni-pozlar.png). Pamuk'un pozları
 * iskeletinden daha az "büyük kafalı" çizildi: başı eşlemek gövdeyi çok büyütürdü, arada tutuldu (baş ~%10-20 küçük).
 */
export const POZ_OLCU: Record<PozAd, PozOlcu> = {
  'kino-kayma': { boy: 0.95, x: 0.01 },
  'kino-utanc': { boy: 1.0 },
  'mino-rahat': { boy: 0.985 },
  'pamuk-surunme': { boy: 0.74, x: 0.06 },
  'pamuk-ozur': { boy: 0.98 },
  'pamuk-el-salla': { boy: 1.04, x: -0.02 },
  'kino-uzgun': { boy: 1.0 },
  'kino-sarilma': { boy: 1.0 },
  // yuvadaki ördek: resim yuvayla birlikte; ördek oturduğu için baş ayaktakinden alçakta
  'ordek-kulucka': { boy: 1.0 },
  'ordek-atki': { boy: 1.0 },
};

/** resimlerin çevresindeki şeffaf pay (gemini-esya.cjs: 6 px) */
const KENAR = 6;
/** esneme sınırı: çizim bundan fazla esnemez */
export const BAS = [1.07, 0.93] as const;
export const ESNE = [0.96, 1.05] as const;
const s = (x: number, y: number) => `scale(${x}, ${y})`;

/**
 * Çıkış: basılıp söner (200 ms). Giren 100 ms sonra başlar ve 150. ms'de tam görünür: çıkan onun arkasında
 * kaybolur (arada boşluk / yanıp sönme olmaz).
 */
function cik(el: HTMLElement, sil: boolean) {
  el.getAnimations().forEach((x) => x.cancel());
  const a = el.animate(
    [
      { transform: s(1, 1), opacity: 1 },
      { transform: s(...BAS), opacity: 1, offset: 0.55 },
      { transform: s(...BAS), opacity: 1, offset: 0.75 },
      { transform: s(...BAS), opacity: 0 },
    ],
    { duration: sure(200), easing: 'ease-in', fill: 'forwards' },
  );
  if (sil) void a.finished.then(() => el.remove(), () => el.remove());
}
/** Giriş: basık doğar, esneyip oturur (en çok %7 basık, %5 esnek) */
function gir(el: HTMLElement, fill: FillMode): Promise<void> {
  return el
    .animate(
      [
        { transform: s(...BAS), opacity: 0 },
        { transform: s(...BAS), opacity: 1, offset: 0.12 },
        { transform: s(...ESNE), opacity: 1, offset: 0.55 },
        { transform: s(1.015, 0.985), opacity: 1, offset: 0.8 },
        { transform: s(1, 1), opacity: 1 },
      ],
      { duration: sure(420), delay: sure(100), easing: 'cubic-bezier(.3,.7,.4,1)', fill },
    )
    .finished.then(() => undefined, () => undefined);
}

/** yüklenen resimlerin yüksekliği (şeffaf pay hesabı için) */
const YUKSEKLIK = new Map<string, number>();
/** Poz resimlerini önceden yükler (geçiş anında beklemesin) */
export function pozlariYukle(): void {
  // Pamuk pozlarının renk süzgeci (CSS: .dd-poz[data-poz^='pamuk']): R × 0.95, B × 1.07 (krem → iskeletin soğuk beyazı)
  if (typeof document !== 'undefined' && !document.getElementById('dd-pamuk-serin')) {
    const kap = h('div', {
      'aria-hidden': 'true',
      style: 'position:absolute;width:0;height:0;overflow:hidden',
      html: '<svg width="0" height="0"><filter id="dd-pamuk-serin" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.95 0 0 0 0  0 1 0 0 0  0 0 1.07 0 0  0 0 0 1 0"/></filter></svg>',
    });
    document.body.append(kap);
  }
  for (const ad of POZLAR) {
    const u = resim(`poz-${ad}`);
    if (!u || YUKSEKLIK.has(u)) continue;
    const i = new Image();
    i.onload = () => YUKSEKLIK.set(u, i.naturalHeight);
    i.src = u;
    void i.decode?.().catch(() => undefined);
  }
}

/**
 * Bir karakterin poz yuvası. kutu: karakterin kutusu (iskeletin tuvaliyle aynı en/boy; poz katmanı buraya eklenir),
 * rig: gizlenip geri gelen iskelet elemanı (kutunun içinde), cizim: tuvalin ölçüsü (ayak çizgisi, görünen boy).
 */
export class PozYuvasi {
  private aktif: { ad: PozAd; el: HTMLElement } | null = null;
  /** poz resminin üstüne binen ek (Mino'nun dedektif şapkası): ad → eleman */
  ekler: Partial<Record<PozAd, () => HTMLElement | null>> = {};

  constructor(
    private kutu: HTMLElement,
    private rig: HTMLElement,
    private cizim: Cizim,
  ) {}

  static kino(kutu: HTMLElement, rig: HTMLElement) {
    return new PozYuvasi(kutu, rig, CIZIM.kino);
  }
  static pamuk(kutu: HTMLElement, rig: HTMLElement) {
    return new PozYuvasi(kutu, rig, CIZIM.pamuk);
  }
  static mino(kutu: HTMLElement, rig: HTMLElement) {
    return new PozYuvasi(kutu, rig, CIZIM.mino);
  }
  static ordek(kutu: HTMLElement, rig: HTMLElement) {
    return new PozYuvasi(kutu, rig, CIZIM.ordek);
  }

  get su(): PozAd | null {
    return this.aktif?.ad ?? null;
  }

  /** Poz katmanı: resim ayak çizgisinde, ölçüye göre boyda */
  private kur(ad: PozAd, url: string): HTMLElement {
    const c = this.cizim;
    const [kw, kh] = c.kutu;
    const gorunen = (c.taban - c.tepe) / kh; // kutu yüksekliğinin oranı
    const o = POZ_OLCU[ad];
    const img = h('img.dd-poz-resim', { src: url, alt: '', draggable: 'false' });
    // resim yüklüyse şeffaf payı hesaba kat (görünen kısım tam ayak çizgisine otursun)
    const nh = YUKSEKLIK.get(url) || img.naturalHeight || 1000;
    const pay = KENAR / nh;
    const boy = (o.boy * gorunen) / (1 - 2 * pay);
    const alt = 1 - c.taban / kh - pay * boy - (o.y ?? 0) * gorunen;
    const x = 50 + ((o.x ?? 0) * gorunen * kh * 100) / kw;
    const ic = h('div.dd-poz-ic', {}, img);
    const el = h(
      'div.dd-poz',
      { 'data-poz': ad, 'aria-hidden': 'true', style: `height:${(boy * 100).toFixed(2)}%;bottom:${(alt * 100).toFixed(2)}%;left:${x.toFixed(2)}%;--poz-oy:${((1 - pay) * 100).toFixed(1)}%` },
      ic,
    );
    // ek (şapka) resimle birlikte nefes alır
    const ek = this.ekler[ad]?.();
    if (ek) ic.append(ek);
    return el;
  }

  /** İskeletin yerine pozu koyar (yumuşak esneme). Resim yoksa bir şey yapmaz. */
  goster(ad: PozAd): Promise<void> {
    const url = resim(`poz-${ad}`);
    if (!url || this.aktif?.ad === ad) return Promise.resolve();
    const eski = this.aktif;
    const el = this.kur(ad, url);
    this.aktif = { ad, el };
    this.kutu.append(el);
    const ayak = `50% ${((this.cizim.taban / this.cizim.kutu[1]) * 100).toFixed(1)}%`;
    if (AZ_HAREKET) {
      eski?.el.remove();
      this.rigGizle(true);
      return Promise.resolve();
    }
    if (eski) cik(eski.el, true);
    else {
      this.rig.style.transformOrigin = ayak;
      this.rig.getAnimations().forEach((x) => x.cancel());
      cik(this.rig, false);
    }
    return gir(el, 'both');
  }

  /** Pozu kaldırır, iskelet esneyerek geri gelir */
  birak(): Promise<void> {
    const a = this.aktif;
    if (!a) return Promise.resolve();
    this.aktif = null;
    if (AZ_HAREKET) {
      a.el.remove();
      this.rigGizle(false);
      return Promise.resolve();
    }
    cik(a.el, true);
    this.rig.getAnimations().forEach((x) => x.cancel());
    return gir(this.rig, 'backwards').then(() => {
      if (!this.aktif) this.rig.style.transformOrigin = '';
    });
  }

  /** Hemen kaldırır (ekran kapanırken) */
  temizle() {
    this.aktif?.el.remove();
    this.aktif = null;
    this.rigGizle(false);
  }

  private rigGizle(gizle: boolean) {
    this.rig.getAnimations().forEach((x) => x.cancel());
    this.rig.style.opacity = gizle ? '0' : '';
  }
}
