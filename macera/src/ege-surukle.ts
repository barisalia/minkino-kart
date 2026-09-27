/**
 * Bölüm 2 elle yapılan işler: sürükle-bırak (hedefe bırakınca yerleşir, yanlışsa yavaşça geri kayar ve hedefe
 * parlayan bir iz çıkar), parmak ipucu (2 yanlışta ya da 12 sn'de) ve FLIP ile yer değiştirme.
 * Sürüklenen eleman dünya içindedir (kamera ölçeğine göre düzeltilir); yalnız transform ile (translate).
 */
import { h, sure } from '../../src/ui/dom';

/** Ekran kutusunun (DOMRect) pay kadar büyütülmüş hâlinde nokta var mı */
const icinde = (r: DOMRect, x: number, y: number, pay: number) =>
  x > r.left - r.width * pay && x < r.right + r.width * pay && y > r.top - r.height * pay && y < r.bottom + r.height * pay;

export interface Hedef {
  ad: string;
  /** hedefin ekrandaki kutusu (her bırakışta yeniden ölçülür) */
  kutu: () => DOMRect;
  /** kutunun her yanına eklenecek pay (kutu boyunun oranı) */
  pay?: number;
}

export interface SurukleAyar {
  hedefler: Hedef[];
  /** bırakınca: hedefin adı (ya da null). true dönerse eleman bırakıldığı yerde kalır (yerleştirmeyi çağıran yapar). */
  birak: (hedef: string | null) => boolean | void;
  /** sürüklerken (ekran noktası) */
  kaydir?: (x: number, y: number) => void;
  /** tutunca */
  tut?: () => void;
  /** yanlış bırakışta iz gösterilecek hedef ve katman (mc-on) */
  iz?: { katman: HTMLElement; kutu: () => DOMRect };
}

/** Eleman sürüklenebilir olur; kapat() ile biter */
export class Surukle {
  yanlis = 0;
  private aktif: number | null = null;
  private bas = { x: 0, y: 0 };
  private son = { x: 0, y: 0 };
  private olcek = 1;
  private kapali = false;

  constructor(
    readonly el: HTMLElement,
    private a: SurukleAyar,
  ) {
    el.classList.add('eg-suruklenir');
    el.addEventListener('pointerdown', this.basla);
    el.addEventListener('pointermove', this.hareket);
    el.addEventListener('pointerup', this.bitir);
    el.addEventListener('pointercancel', this.bitir);
  }

  private basla = (e: PointerEvent) => {
    if (this.kapali || this.aktif !== null) return;
    e.stopPropagation();
    e.preventDefault();
    this.aktif = e.pointerId;
    try {
      this.el.setPointerCapture(e.pointerId);
    } catch {
      /* test ortamı */
    }
    this.el.getAnimations().forEach((a) => a.cancel());
    const r = this.el.getBoundingClientRect();
    this.olcek = r.width / Math.max(1, this.el.offsetWidth) || 1;
    this.bas = { x: e.clientX, y: e.clientY };
    this.son = { x: e.clientX, y: e.clientY };
    this.el.classList.add('tutuldu');
    this.a.tut?.();
  };

  private hareket = (e: PointerEvent) => {
    if (e.pointerId !== this.aktif) return;
    this.son = { x: e.clientX, y: e.clientY };
    const dx = (e.clientX - this.bas.x) / this.olcek;
    const dy = (e.clientY - this.bas.y) / this.olcek;
    this.el.style.translate = `${dx}px ${dy}px`;
    this.a.kaydir?.(e.clientX, e.clientY);
  };

  private bitir = (e: PointerEvent) => {
    if (e.pointerId !== this.aktif) return;
    this.aktif = null;
    this.el.classList.remove('tutuldu');
    const r = this.el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const hedef = this.a.hedefler.find((h) => icinde(h.kutu(), cx, cy, h.pay ?? 0.15) || icinde(h.kutu(), this.son.x, this.son.y, h.pay ?? 0.15));
    const kal = this.a.birak(hedef?.ad ?? null);
    if (kal) return;
    if (!hedef) {
      // yalnız gerçekten sürüklendiyse yanlış sayılır (dokunup bırakmak değil)
      if (Math.hypot(this.son.x - this.bas.x, this.son.y - this.bas.y) > 20) {
        this.yanlis++;
        if (this.a.iz) iz(this.a.iz.katman, this.el.getBoundingClientRect(), this.a.iz.kutu());
      }
    }
    this.geri();
  };

  /** Başladığı yere yavaşça kayar */
  geri(ms = 650) {
    const t = this.el.style.translate || '0px 0px';
    this.el.style.translate = '';
    this.el.animate([{ translate: t }, { translate: '0px 0px' }], { duration: sure(ms), easing: 'cubic-bezier(0.3, 0, 0.3, 1)' });
  }

  kapat() {
    this.kapali = true;
    this.el.classList.remove('eg-suruklenir', 'tutuldu');
    this.el.removeEventListener('pointerdown', this.basla);
    this.el.removeEventListener('pointermove', this.hareket);
    this.el.removeEventListener('pointerup', this.bitir);
    this.el.removeEventListener('pointercancel', this.bitir);
  }
}

/**
 * Elemanı yeni dünya konumuna taşır (FLIP): --x/--y/--w yazılır, eleman bulunduğu yerden (sürükleme dahil)
 * oraya kayar.
 */
export async function tasi(el: HTMLElement, x: number, y: number, ms = 450, w?: number) {
  const once = el.getBoundingClientRect();
  el.style.translate = '';
  el.getAnimations().forEach((a) => a.cancel());
  el.style.setProperty('--x', String(x));
  el.style.setProperty('--y', String(y));
  if (w !== undefined) el.style.setProperty('--w', String(w));
  const sonra = el.getBoundingClientRect();
  const olcek = sonra.width / Math.max(1, el.offsetWidth) || 1;
  const dx = (once.left + once.width / 2 - (sonra.left + sonra.width / 2)) / olcek;
  const dy = (once.top + once.height / 2 - (sonra.top + sonra.height / 2)) / olcek;
  const s = once.width / Math.max(1, sonra.width);
  await el
    .animate([{ translate: `${dx}px ${dy}px`, scale: String(s) }, { translate: '0px 0px', scale: '1' }], { duration: sure(ms), easing: 'cubic-bezier(0.3, 0, 0.3, 1.15)' })
    .finished.catch(() => undefined);
}

/** Yanlış bırakışta: elemandan hedefe parlayan kesikli iz (katman: mc-on, ekran koordinatı) */
export function iz(katman: HTMLElement, a: DOMRect, b: DOMRect) {
  const k = katman.getBoundingClientRect();
  const x1 = a.left + a.width / 2 - k.left;
  const y1 = a.top + a.height / 2 - k.top;
  const x2 = b.left + b.width / 2 - k.left;
  const y2 = b.top + b.height / 2 - k.top;
  const el = h('div.eg-iz', {
    html: `<svg width="100%" height="100%"><path d="M${x1} ${y1}Q${(x1 + x2) / 2} ${Math.min(y1, y2) - 60} ${x2} ${y2}" pathLength="100"/><circle cx="${x2}" cy="${y2}" r="${Math.max(24, Math.min(b.width, b.height) / 2.4)}"/></svg>`,
  });
  katman.append(el);
  setTimeout(() => el.remove(), sure(1700));
}

/**
 * Parmak ipucu: bir elemandan (varsa) hedefe sürükleme gösterir ya da elemana dokunmayı gösterir.
 * Döndürdüğü işlev ipucunu kaldırır.
 */
export function parmak(katman: HTMLElement, kaynak: () => DOMRect, hedef?: () => DOMRect): () => void {
  const el = h('div.eg-parmak', {
    html: '<svg viewBox="0 0 48 56"><path d="M18 4c3 0 5 2 5 5v17l3-1c2-6 11-4 10 2l4-1c3 0 5 3 4 6l-3 14c-1 5-5 8-10 8H21c-4 0-7-2-9-5L3 34c-2-3 1-7 5-5l5 4V9c0-3 2-5 5-5z" fill="#fff" stroke="#5a3617" stroke-width="3.5" stroke-linejoin="round"/></svg>',
  });
  katman.append(el);
  let dur = false;
  const k = () => katman.getBoundingClientRect();
  const dongu = async () => {
    while (!dur) {
      const a = kaynak();
      const kk = k();
      const x1 = a.left + a.width / 2 - kk.left;
      const y1 = a.top + a.height / 2 - kk.top;
      if (hedef) {
        const b = hedef();
        const x2 = b.left + b.width / 2 - kk.left;
        const y2 = b.top + b.height / 2 - kk.top;
        await el
          .animate(
            [
              { transform: `translate(${x1}px, ${y1}px) scale(1)`, opacity: 0 },
              { transform: `translate(${x1}px, ${y1}px) scale(0.85)`, opacity: 1, offset: 0.15 },
              { transform: `translate(${x2}px, ${y2}px) scale(0.85)`, opacity: 1, offset: 0.8 },
              { transform: `translate(${x2}px, ${y2}px) scale(1)`, opacity: 0 },
            ],
            { duration: 1700, easing: 'ease-in-out' },
          )
          .finished.catch(() => undefined);
      } else {
        await el
          .animate(
            [
              { transform: `translate(${x1}px, ${y1}px) scale(1)`, opacity: 0 },
              { transform: `translate(${x1}px, ${y1}px) scale(1)`, opacity: 1, offset: 0.2 },
              { transform: `translate(${x1}px, ${y1}px) scale(0.8)`, opacity: 1, offset: 0.45 },
              { transform: `translate(${x1}px, ${y1}px) scale(1)`, opacity: 1, offset: 0.7 },
              { transform: `translate(${x1}px, ${y1}px) scale(1)`, opacity: 0 },
            ],
            { duration: 1200 },
          )
          .finished.catch(() => undefined);
      }
    }
  };
  void dongu();
  return () => {
    dur = true;
    el.remove();
  };
}

/**
 * İpucu zamanlayıcı: "12 sn'de ya da 2 yanlışta parmak ipucu". goster() ipucunu açar (kaldırma işlevi döner).
 * yanlis() her hatada çağrılır; kapat() görev bitince.
 */
export class Ipucu {
  private zaman = 0;
  private hata = 0;
  private kaldir: (() => void) | null = null;
  constructor(
    private goster: () => () => void,
    private ms = 12000,
  ) {
    this.kur();
  }
  private kur() {
    clearTimeout(this.zaman);
    this.zaman = window.setTimeout(() => this.ac(), this.ms);
  }
  private ac() {
    if (!this.kaldir) this.kaldir = this.goster();
  }
  yanlis() {
    if (++this.hata >= 2) this.ac();
    else this.kur();
  }
  /** doğru bir adım: ipucu kalkar, sayaç yeniden başlar */
  ilerle() {
    this.kaldir?.();
    this.kaldir = null;
    this.hata = 0;
    this.kur();
  }
  kapat() {
    clearTimeout(this.zaman);
    this.kaldir?.();
    this.kaldir = null;
  }
}
