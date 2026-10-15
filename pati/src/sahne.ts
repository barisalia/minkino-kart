/**
 * Pati Dükkânı: salon sahnesi ve kamerası.
 *
 * Sahne, salon resminin kendi ölçüsünde (2752×1536 "sahne birimi") kurulur; hayvanlar, köşeler, lamba ipi ve ışık
 * katmanları bu birimle yerleşir. Kamera yalnız sahnenin transform'unu değiştirir (Pazar'ın kamerasıyla aynı yol:
 * yakın çekimde köşe büyür, salon resminin büyütülmüş hâli; hayvanlar ayrı çizim olduğu için keskin kalır).
 *
 * - Yatay telefon: salon ekranı doldurur (kapla), köşelerin ortası ortada.
 * - Dikey telefon: üç köşe yan yana ekranın üst kısmında (genişliğe sığar); altı salonun zemin rengiyle süren
 *   şerit (Nehir abla orada boydan durur, yakın çekimde bakım rafı).
 */
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import type { HayvanAdi } from './ihtiyac';
import { adres, GECE_LAMBASI, IP, IP_KUTU, SALON, SALON_GECE } from './varliklar';

export const SAHNE_W = 2752;
export const SAHNE_H = 1536;

export interface Kutu {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}
/** Üç köşe (salon resmindeki duvar oyukları, dış çerçeve) */
export const KOSE: Record<HayvanAdi, Kutu> = {
  findik: { x0: 690, y0: 490, x1: 1289, y1: 1045 },
  tarcin: { x0: 1373, y0: 490, x1: 1979, y1: 1045 },
  piril: { x0: 2062, y0: 490, x1: 2658, y1: 1045 },
};
/**
 * Köşe takımları (G5, kose-sayfasi): oyukların içinde, hayvanların arkasında. Akvaryum gelince Pırıl onun suyunda
 * yüzer (su kutusu resimden ölçüldü: x %7.8-92.2, y %8.8-53.8); gelmediyse oyuğun içi su olur.
 */
export const KOSE_TAKIM = {
  kopek: { ad: 'kose-kopek', x: 990, en: 600 },
  kedi: { ad: 'kose-kedi', x: 1676, en: 600 },
  akvaryum: { ad: 'kose-akvaryum', x: 2360, en: 600 },
} as const;
export const TAKIM_TABAN = 1040;
const TANK = adres('kose-akvaryum');
const TANK_BOY = 600 * (615 / 707);
/** Akvaryumun suyu (sahne birimi) */
export const AKVARYUM: Kutu = TANK
  ? { x0: 2060 + 600 * 0.078, y0: TAKIM_TABAN - TANK_BOY + TANK_BOY * 0.088, x1: 2060 + 600 * 0.922, y1: TAKIM_TABAN - TANK_BOY + TANK_BOY * 0.538 }
  : { x0: 2110, y0: 536, x1: 2590, y1: 1000 };
/** Pırıl'ın boyu: akvaryumda küçük (gerçek boy), oyukta büyük */
export const BALIK_BOY = TANK ? 150 : 250;
/** Köşelerin ortası (kadrajın odağı) */
const KOSELER_ORTA = (KOSE.findik.x0 + KOSE.piril.x1) / 2;
/** Dikey telefonda genişliğe sığacak alan */
const DIKEY_EN = KOSE.piril.x1 - KOSE.findik.x0 + 60;

export const AZ = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const EGRI = 'cubic-bezier(0.42, 0, 0.18, 1)';

/** Yakın çekimde odak alanı (ekran koordinatı; kökün içinde) */
export interface Alan {
  sol: number;
  sag: number;
  ust: number;
  alt: number;
}

export class Sahne {
  /** kök: ekranı kaplar, taşanı keser */
  readonly el: HTMLElement;
  /** sahne: 2752×1536, kamera bunu ölçekler ve kaydırır */
  readonly sahne: HTMLElement;
  /** hayvanlar, köşe dokunma alanları, balonlar */
  readonly katman: HTMLElement;
  readonly aksamEl: HTMLElement;
  readonly geceEl: HTMLElement;
  readonly ipEl: HTMLElement;
  readonly suEl: HTMLElement;
  readonly suIc: HTMLElement;
  s = 1;
  tx = 0;
  ty = 0;
  /** yakın çekimdeki köşe (yoksa null: geniş salon) */
  odak: HayvanAdi | null = null;
  private odakAlan: (() => Alan) | null = null;
  private ro: ResizeObserver | null = null;
  /** her kadraj değişiminde (ölçek, yakın mı) */
  degisti: (s: number, yakin: boolean) => void = () => undefined;

  constructor() {
    const [ix0, iy0, ix1, iy1] = IP_KUTU;
    this.ipEl = h(
      'div.pt-ip',
      { style: `left:${ix0}px;top:${iy0}px;width:${ix1 - ix0}px;height:${iy1 - iy0}px` },
      h('img', { src: IP, alt: '', draggable: 'false' }),
    );
    this.suEl = h(`div.pt-su${TANK ? '.pt-su-tank' : ''}`, { style: kutuStil(AKVARYUM) });
    this.katman = h('div.pt-katman');
    // köşe takımları (hayvanların arkasında)
    for (const k of Object.values(KOSE_TAKIM)) {
      const u = adres(k.ad);
      if (u) this.katman.append(h('img.pt-kose-takim', { src: u, alt: '', draggable: 'false', 'data-takim': k.ad, style: `left:${k.x - k.en / 2}px;top:${TAKIM_TABAN}px;width:${k.en}px` }));
    }
    /** balığın yüzdüğü su: suyun dışına taşan balık kesilir (camın içinde) */
    this.suIc = h('div.pt-su-ic', { style: `clip-path: inset(${AKVARYUM.y0}px ${SAHNE_W - AKVARYUM.x1}px ${SAHNE_H - AKVARYUM.y1 - (TANK ? 0 : 60)}px ${AKVARYUM.x0}px)` });
    this.katman.append(this.suIc);
    this.aksamEl = h('div.pt-aksam');
    // gece: G7 resmi gündüzün hemen üstünde (hayvanlar onun önünde, kendi filtreleriyle kararır); yoksa lacivert örtü
    this.geceEl = SALON_GECE ? h('img.pt-salon.pt-salon-gece', { src: SALON_GECE, alt: '', draggable: 'false' }) : h('div.pt-gece');
    this.sahne = h(
      'div.pt-sahne',
      { style: `width:${SAHNE_W}px;height:${SAHNE_H}px` },
      h('img.pt-salon', { src: SALON, alt: '', draggable: 'false' }),
      // lamba ipi: salondaki ipin üstü duvar rengiyle örtülür, kesilmiş ip tam yerine konur (çekilince esner)
      h('i.pt-ip-ortu', { style: `left:${ix0 + 14}px;top:${iy0 + 8}px;width:${ix1 - ix0 - 28}px;height:${iy1 - iy0 - 10}px` }),
      SALON_GECE ? this.geceEl : null,
      TANK ? null : this.suEl,
      this.katman,
      TANK ? this.suEl : null,
      this.ipEl,
      this.aksamEl,
      SALON_GECE ? null : this.geceEl,
      // ay gece lambası (G4): soldaki dolabın üstünde, yalnız gece yanar (gece katmanının üstünde, karanlıkta parlak)
      GECE_LAMBASI ? h('img.pt-gece-lambasi', { src: GECE_LAMBASI, alt: '', draggable: 'false' }) : null,
    );
    this.el = h(`div.pt-sahne-kok${SALON_GECE ? '.pt-gece-resimli' : ''}`, {}, this.sahne);
    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver(() => this.kur(0));
      this.ro.observe(this.el);
    }
  }

  get dikey() {
    return this.el.clientHeight > this.el.clientWidth;
  }

  /** Geniş salon kadrajı */
  private genisKadraj(): [number, number, number] {
    const W = this.el.clientWidth || 844;
    const H = this.el.clientHeight || 390;
    if (H > W) {
      // dikey: köşeler genişliğe sığar; üst çubuk rafın mamalarını örtmesin diye sahne biraz aşağıda başlar
      const s = W / DIKEY_EN;
      return [s, sinirla(W / 2 - s * KOSELER_ORTA, W - SAHNE_W * s, 0), Math.min(64, H * 0.07)];
    }
    const s = Math.max(W / SAHNE_W, H / SAHNE_H);
    return [s, sinirla(W / 2 - s * KOSELER_ORTA, W - SAHNE_W * s, 0), (H - SAHNE_H * s) / 2];
  }

  /** Köşenin yakın çekimi: köşe, verilen alanı doldurur; sahne ekranın dışına taşmaz */
  private yakinKadraj(h_: HayvanAdi, a: Alan): [number, number, number] {
    const W = this.el.clientWidth || 844;
    const H = this.el.clientHeight || 390;
    const k = KOSE[h_];
    const kw = k.x1 - k.x0;
    const kh = k.y1 - k.y0 + 60;
    const s = Math.min(((a.sag - a.sol) * 0.97) / kw, ((a.alt - a.ust) * 0.97) / kh);
    const tx = sinirla((a.sol + a.sag) / 2 - s * (k.x0 + kw / 2), W - SAHNE_W * s, 0);
    // dikeyde sahnenin altı boş şeride kalabilir (zemin rengi); yalnız üstte boşluk olmasın
    const ty = Math.min(0, (a.ust + a.alt) / 2 - s * (k.y0 - 30 + kh / 2));
    return [s, tx, H > W ? ty : sinirla(ty, H - SAHNE_H * s, 0)];
  }

  /** Kadrajı yeniden kurar (ekran döndü / boyut değişti: geçişsiz) */
  kur(ms = 0) {
    const [s, tx, ty] = this.odak && this.odakAlan ? this.yakinKadraj(this.odak, this.odakAlan()) : this.genisKadraj();
    this.uygula(s, tx, ty, ms);
  }

  /** Köşeye yaklaş (alan: işlev, ekran dönünce yeniden ölçülür) */
  odakla(h_: HayvanAdi, alan: () => Alan, ms = 900) {
    this.odak = h_;
    this.odakAlan = alan;
    this.kur(ms);
  }

  /** Geniş salona dön */
  genis(ms = 800) {
    this.odak = null;
    this.odakAlan = null;
    this.kur(ms);
  }

  private uygula(s: number, tx: number, ty: number, ms: number) {
    this.s = s;
    this.tx = tx;
    this.ty = ty;
    const d = AZ || (TEST_MODU && !document.body.dataset.onizleme) ? 0 : sure(ms);
    this.sahne.style.transition = d ? `transform ${d}ms ${EGRI}` : 'none';
    this.sahne.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${s.toFixed(5)})`;
    this.sahne.style.setProperty('--s', s.toFixed(5));
    this.el.dataset.yakin = this.odak ?? '';
    this.degisti(s, !!this.odak);
  }

  /** Sahne biriminden kök içi ekran koordinatına (kadrajın varış hâline göre) */
  ekrana(x: number, y: number): [number, number] {
    return [this.tx + x * this.s, this.ty + y * this.s];
  }
  /** Ekran (client) koordinatından sahne birimine (o anki, geçişin ortasında da doğru) */
  sahneye(cx: number, cy: number): [number, number] {
    const r = this.sahne.getBoundingClientRect();
    const s = r.width / SAHNE_W || this.s;
    return [(cx - r.left) / s, (cy - r.top) / s];
  }

  /** Lamba ipi çekildi: ip esner, salon ışığı söner (ya da yanar) */
  ipCek() {
    this.ipEl.animate(
      [
        { transform: 'scaleY(1)' },
        { transform: 'scaleY(1.22)', offset: 0.35 },
        { transform: 'scaleY(0.94)', offset: 0.7 },
        { transform: 'scaleY(1)' },
      ],
      { duration: sure(420), easing: 'ease-out' },
    );
  }

  /** Işık katmanları: 'gun' | 'aksam' | 'gece' (geçiş ms) */
  isik(hal: 'gun' | 'aksam' | 'gece', ms = 1200) {
    const d = TEST_MODU ? 0 : sure(ms);
    for (const e of [this.aksamEl, this.geceEl]) e.style.transition = `opacity ${d}ms ease-in-out`;
    this.aksamEl.style.opacity = hal === 'aksam' ? '1' : '0';
    this.geceEl.style.opacity = hal === 'gece' ? '1' : '0';
    this.el.dataset.isik = hal;
    // sahne dışındakiler (Nehir abla) de aynı ışığa girsin
    if (this.el.parentElement) this.el.parentElement.dataset.isik = hal;
  }

  kapat() {
    this.ro?.disconnect();
  }
}

export const sinirla = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const kutuStil = (k: Kutu) => `left:${k.x0}px;top:${k.y0}px;width:${k.x1 - k.x0}px;height:${k.y1 - k.y0}px`;
