/**
 * Pazarın kamerası: önemli anda kadraj yumuşakça o ana yaklaşır (yakın çekim), iş bitince geri açılır.
 * Müşteri isteğini söylerken müşteri ve balonu, meyve suyu yapılırken blender, içerken müşteri ekranı doldurur.
 *
 * Kamera katmanı (.pz-kamera: stand, Mino, müşteri) sahnenin içinde ölçeklenir ve kayar; arka plan katmanları
 * (gökyüzü, pazar resmi) aynı noktaya daha az yaklaşır (derinlik). Yalnız transform; ön tezgâh ve düğmeler
 * yerinde kalır (çocuk her an oynayabilir, bekleme yok). Test modunda ve "hareketi azalt" tercihinde kapalı.
 */
import { sure, TEST_MODU } from '../../src/ui/dom';

const AZ = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
/** Sinema eğrisi: yavaş kalkış, yumuşak duruş */
const EGRI = 'cubic-bezier(0.42, 0, 0.18, 1)';

/** Kamera katmanındaki bir kutu (sahneye göre, kamera dönüşümü olmadan) */
export interface Kutu {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface OdakSecenek {
  /** hedef, görünen alanın ne kadarını doldursun (0..1) */
  doluluk?: number;
  /** en çok yakınlaşma */
  enCok?: number;
  /** geçiş süresi (ms) */
  sure?: number;
  /** hedefin görünen alandaki dikey yeri (0 üst, 0.5 orta, 1 alt) */
  dikey?: number;
  /**
   * tam ekran yakın çekim: ön tezgâh aşağı kayıp kadrajdan çıkar (yalnız oyuncuların sahnesi kalır);
   * kadraj açılınca (genis) ya da çocuk ekrana dokununca hemen geri gelir
   */
  tamEkran?: boolean;
}

export interface DerinKatman {
  el: HTMLElement;
  /** 0: hiç yaklaşmaz, 1: kamerayla aynı */
  k: number;
}

export class Kamera {
  /** kamera açık mı (test modu / hareketi azalt: kapalı, her şey yerinde) */
  readonly acik: boolean;
  private s = 1;
  private tx = 0;
  private ty = 0;
  private son: (() => void) | null = null;
  private ro: ResizeObserver | null = null;

  constructor(
    private sahne: HTMLElement,
    private katman: HTMLElement,
    private derin: DerinKatman[],
    /** odaklanılabilecek görünen alan (ekran koordinatı): üst çubuğun altı, ön tezgâhın üstü (tam ekranda ekranın altı) */
    private alan: (tamEkran: boolean) => DOMRect,
    /** tam ekran yakın çekimde ön tezgâhı kadrajdan çıkarır / geri getirir */
    private tezgahGizle: (gizli: boolean) => void = () => undefined,
  ) {
    this.acik = !AZ && (!TEST_MODU || !!document.body.dataset.onizleme);
    katman.style.transformOrigin = '0 0';
    for (const d of derin) d.el.style.willChange = 'transform';
    if (this.acik && typeof ResizeObserver !== 'undefined') {
      // ekran dönünce / boyutu değişince son kadraj geçişsiz yeniden kurulur
      let ilk = true;
      this.ro = new ResizeObserver(() => {
        if (ilk) return void (ilk = false);
        const f = this.son;
        this.uygula(1, 0, 0, 0);
        if (f) f();
      });
      this.ro.observe(sahne);
    }
  }

  /** Şu an yakın çekimde mi */
  get yakin() {
    return this.s > 1.01;
  }

  /** Bir öğenin kamera katmanındaki dönüşümsüz kutusu */
  kutu(e: Element, pay: Partial<{ ust: number; alt: number; sol: number; sag: number }> = {}): Kutu {
    const r = e.getBoundingClientRect();
    const sr = this.sahne.getBoundingClientRect();
    // geçişin ortasında da doğru: katmanın o anki (canlandırılan) dönüşümü
    const m = new DOMMatrixReadOnly(getComputedStyle(this.katman).transform === 'none' ? undefined : getComputedStyle(this.katman).transform);
    const s = m.a || 1;
    const k = {
      x: (r.left - sr.left - m.e) / s,
      y: (r.top - sr.top - m.f) / s,
      w: r.width / s,
      h: r.height / s,
    };
    // pay: kutunun kendi boyuna oranla genişletme (ör. balon için üstüne)
    const ust = (pay.ust ?? 0) * k.h;
    const alt = (pay.alt ?? 0) * k.h;
    const sol = (pay.sol ?? 0) * k.w;
    const sag = (pay.sag ?? 0) * k.w;
    return { x: k.x - sol, y: k.y - ust, w: k.w + sol + sag, h: k.h + ust + alt };
  }

  /** Kutuların hepsini içine alan kutu */
  static birlesik(...kutular: Kutu[]): Kutu {
    const x = Math.min(...kutular.map((k) => k.x));
    const y = Math.min(...kutular.map((k) => k.y));
    const r = Math.max(...kutular.map((k) => k.x + k.w));
    const b = Math.max(...kutular.map((k) => k.y + k.h));
    return { x, y, w: r - x, h: b - y };
  }

  /**
   * Kadrajı hedefe yaklaştırır: hedef görünen alanın `doluluk` kadarını kaplar (en çok `enCok` kat).
   * hedef bir işlevse ekran dönünce yeniden ölçülür.
   */
  odakla(hedef: Kutu | (() => Kutu), o: OdakSecenek = {}) {
    if (!this.acik) return;
    const kur = (ms: number) => {
      const k = typeof hedef === 'function' ? hedef() : hedef;
      if (!k.w || !k.h) return;
      const tam = !!o.tamEkran;
      this.tezgahGizle(tam);
      const a = this.alan(tam);
      const sr = this.sahne.getBoundingClientRect();
      const H = this.sahne.clientHeight;
      const f = o.doluluk ?? 0.8;
      const s = Math.max(1, Math.min(o.enCok ?? 1.8, (a.width * f) / k.w, (a.height * f) / k.h));
      const ax = a.left - sr.left + a.width / 2;
      const ay = a.top - sr.top + a.height * (o.dikey ?? 0.5);
      let tx = ax - s * (k.x + k.w / 2);
      let ty = ay - s * (k.y + k.h / 2);
      // kadrajın altı sahnenin altından yukarı kalkmaz (standın ayakları ön tezgâhın arkasında kalır)
      // (tam ekranda tezgâh çekildi: kadraj belden yukarı olduğundan ayaklar zaten ekranın altında kalır)
      if (!tam) ty = Math.max(ty, H - s * H);
      // yaklaşmadıysa kaydırma da yok
      if (s === 1) tx = ty = 0;
      this.uygula(s, tx, ty, ms);
    };
    this.son = () => kur(0);
    kur(o.sure ?? 1100);
  }

  /** Geniş kadraja döner */
  genis(ms = 900) {
    this.son = null;
    if (!this.acik) return;
    this.tezgahGizle(false);
    if (!this.yakin && !this.tx && !this.ty) return;
    this.uygula(1, 0, 0, ms);
  }

  private uygula(s: number, tx: number, ty: number, ms: number) {
    this.s = s;
    this.tx = tx;
    this.ty = ty;
    const d = sure(ms);
    const gecis = d ? `transform ${d}ms ${EGRI}` : 'none';
    this.katman.style.transition = gecis;
    this.katman.style.transform = s === 1 && !tx && !ty ? '' : `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${s.toFixed(4)})`;
    // derin katmanlar: aynı noktaya doğru, daha az
    const sr = this.sahne.getBoundingClientRect();
    for (const { el, k } of this.derin) {
      // katmanın dönüşümsüz yeri (offset): kökeni sahnenin sol üstü
      const p = (el.offsetParent ?? document.body).getBoundingClientRect();
      const ox = sr.left - (p.left + el.offsetLeft);
      const oy = sr.top - (p.top + el.offsetTop);
      const s2 = 1 + (s - 1) * k;
      el.style.transformOrigin = `${ox.toFixed(1)}px ${oy.toFixed(1)}px`;
      el.style.transition = gecis;
      el.style.transform = s === 1 && !tx && !ty ? '' : `translate(${(tx * k).toFixed(1)}px, ${(ty * k).toFixed(1)}px) scale(${s2.toFixed(4)})`;
    }
  }

  kapat() {
    this.ro?.disconnect();
    this.son = null;
  }
}
