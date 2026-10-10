/**
 * Kino'nun Otobüsü: dokunsal hazırlığın ortak parçaları. Bir eleman hem dokunulur (eski tek dokunuş, her zaman geçerli)
 * hem sürüklenir: parmak 10 px'ten fazla kımıldarsa sürükleme başlar ve o dokunuşun tıklaması yutulur. Sürüklenen
 * araç (kepçe, şişe, kavanoz, süs, sünger) efekt katmanında parmağı izler; hiçbir şey girdiyi kilitlemez.
 */
import { h, sure } from '../../src/ui/dom';
import type { Efekt } from './efekt';

/** Sürükleme sayılması için parmağın gitmesi gereken yol (px) */
const ESIK = 10;
/** Sürükleme bitince o dokunuşun tıklaması bu kadar süre yutulur (ms) */
const YUT_MS = 400;

export interface SurukleSecenek {
  /** sürükleme başlayabilir mi (false: yalnız dokunuş) */
  aktif?: () => boolean;
  /** sürükleme başladı (ekran koordinatı) */
  basla(x: number, y: number): void;
  /** parmak kımıldadı: konum ve son hareket (px) */
  tasi(x: number, y: number, dx: number, dy: number): void;
  /** parmak kalktı (ya da tarayıcı dokunuşu kesti) */
  birak(x: number, y: number): void;
}

/** Elemanı sürüklenebilir yapar; dokunuş (tıklama) aynen çalışır. Dönen: dinleyicileri kaldırır. */
export function elSurukle(el: HTMLElement, s: SurukleSecenek): () => void {
  let id: number | null = null;
  let suruklen = false;
  let x0 = 0;
  let y0 = 0;
  let sx = 0;
  let sy = 0;
  let bitis = -1e9;
  el.style.touchAction = 'none';
  const bas = (e: PointerEvent) => {
    if (id !== null || (e.pointerType === 'mouse' && e.button !== 0)) return;
    id = e.pointerId;
    suruklen = false;
    x0 = sx = e.clientX;
    y0 = sy = e.clientY;
    // parmak hızla çıksa da hareket bu elemana gelsin (dokunuşun tıklaması yine bu elemanda olur)
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* yok say */
    }
  };
  const kaydir = (e: PointerEvent) => {
    if (e.pointerId !== id) return;
    if (!suruklen) {
      if (Math.hypot(e.clientX - x0, e.clientY - y0) < ESIK) return;
      if (s.aktif && !s.aktif()) {
        id = null;
        try {
          el.releasePointerCapture(e.pointerId);
        } catch {
          /* yok say */
        }
        return;
      }
      suruklen = true;
      s.basla(x0, y0);
    }
    const dx = e.clientX - sx;
    const dy = e.clientY - sy;
    sx = e.clientX;
    sy = e.clientY;
    s.tasi(e.clientX, e.clientY, dx, dy);
  };
  const son = (e: PointerEvent) => {
    if (e.pointerId !== id) return;
    id = null;
    if (!suruklen) return;
    suruklen = false;
    bitis = performance.now();
    s.birak(e.clientX, e.clientY);
  };
  // sürüklemenin sonundaki tıklama dokunuş sayılmaz
  const tik = (e: MouseEvent) => {
    if (performance.now() - bitis > YUT_MS) return;
    e.stopImmediatePropagation();
    e.preventDefault();
  };
  el.addEventListener('pointerdown', bas);
  el.addEventListener('pointermove', kaydir);
  el.addEventListener('pointerup', son);
  el.addEventListener('pointercancel', son);
  el.addEventListener('click', tik, true);
  return () => {
    el.removeEventListener('pointerdown', bas);
    el.removeEventListener('pointermove', kaydir);
    el.removeEventListener('pointerup', son);
    el.removeEventListener('pointercancel', son);
    el.removeEventListener('click', tik, true);
  };
}

/** Elemanın ekrandaki ortası (Tutulan.don_ hedefi) */
export function ekranMerkez(e: Element): [number, number] {
  const r = e.getBoundingClientRect();
  return [r.left + r.width / 2, r.top + r.height / 2];
}

/** Bir dikdörtgenin (pay kadar genişletilmiş) içinde mi */
export const icinde = (r: DOMRect, x: number, y: number, pay = 0) => x > r.left - pay && x < r.right + pay && y > r.top - pay && y < r.bottom + pay;

/**
 * Parmağın tuttuğu araç: efekt katmanında, parmağın üstünde (tutma noktası tx, ty: aracın kutusunun oranı).
 * Dönüş ve ezilme (squash) parmağın hızına göre yumuşakça izler.
 */
export class Tutulan {
  readonly el: HTMLElement;
  readonly ic: HTMLElement;
  private x = 0;
  private y = 0;
  private egim = 0;
  private hedefDon = 0;
  private don = 0;
  private olcek = 1;
  private ofs = 0;
  private hedefOfs = 0;
  private raf = 0;
  private bitti = false;
  constructor(
    private efekt: Efekt,
    icerik: string | HTMLElement,
    private o: { sinif?: string; en: number; boy: number; tx?: number; ty?: number },
  ) {
    this.ic = typeof icerik === 'string' ? h('div.ko-tutulan-ic', { html: icerik }) : icerik;
    this.el = h(`div.ko-tutulan${o.sinif ? `.${o.sinif}` : ''}`, { style: `width:${o.en.toFixed(1)}px;height:${o.boy.toFixed(1)}px;--tx:${((o.tx ?? 0.5) * 100).toFixed(1)}%;--ty:${((o.ty ?? 0.5) * 100).toFixed(1)}%` }, this.ic);
    efekt.el.append(this.el);
    const dongu = () => {
      if (this.bitti) return;
      this.egim *= 0.82;
      this.don += (this.hedefDon - this.don) * 0.22;
      this.ofs += (this.hedefOfs - this.ofs) * 0.2;
      this.ciz();
      this.raf = requestAnimationFrame(dongu);
    };
    this.raf = requestAnimationFrame(dongu);
  }
  /** ekran koordinatıyla konum; dx: son yatay hareket (sallanma) */
  yer(cx: number, cy: number, dx = 0) {
    const k = this.efekt.kutu();
    this.x = cx - k.left;
    this.y = cy - k.top;
    this.egim = Math.max(-18, Math.min(18, this.egim * 0.6 + dx * 0.9));
    this.ciz();
  }
  /** aracın duruş açısı (derece; ör. şişe dökerken 140) */
  dondur(derece: number) {
    this.hedefDon = derece;
  }
  /** şu anki dikey kaldırma (px) ve açı (derece): döndürülmüş araçta bir noktayı hesaplamak için */
  get kalkis() {
    return this.ofs;
  }
  get aci() {
    return this.don + this.egim;
  }
  /** aracı parmağın bu kadar üstüne kaldırır (px; ör. şişe dökerken akış görünsün) */
  yukari(px: number) {
    this.hedefOfs = -px;
  }
  buyut(o: number) {
    this.olcek = o;
  }
  private ciz() {
    this.el.style.transform = `translate(${this.x.toFixed(1)}px, ${(this.y + this.ofs).toFixed(1)}px) translate(calc(var(--tx) * -1), calc(var(--ty) * -1)) rotate(${(this.don + this.egim).toFixed(1)}deg) scale(${this.olcek})`;
  }
  /** efekt katmanına göre aracın içindeki bir nokta (ox, oy: kutunun oranı; dönüş hesaba katılmaz: ekrandaki yer) */
  nokta(ox: number, oy: number): [number, number] {
    const r = this.ic.getBoundingClientRect();
    const k = this.efekt.kutu();
    return [r.left - k.left + r.width * ox, r.top - k.top + r.height * oy];
  }
  /** efekt katmanına göre aracın içindeki bir nokta, dönüş ve ölçek hesaba katılarak (ör. eğik sürahinin ağzı) */
  donukNokta(ox: number, oy: number): [number, number] {
    const dx = (ox - (this.o.tx ?? 0.5)) * this.o.en * this.olcek;
    const dy = (oy - (this.o.ty ?? 0.5)) * this.o.boy * this.olcek;
    const a = ((this.don + this.egim) * Math.PI) / 180;
    return [this.x + dx * Math.cos(a) - dy * Math.sin(a), this.y + this.ofs + dx * Math.sin(a) + dy * Math.cos(a)];
  }
  /** yerine (ekran koordinatı) kayarak döner ve kalkar */
  async don_(hedef: [number, number] | null, ms = 300) {
    this.bitti = true;
    cancelAnimationFrame(this.raf);
    const bas = this.el.style.transform;
    if (hedef) {
      const k = this.efekt.kutu();
      const son = `translate(${(hedef[0] - k.left).toFixed(1)}px, ${(hedef[1] - k.top).toFixed(1)}px) translate(calc(var(--tx) * -1), calc(var(--ty) * -1)) rotate(0deg) scale(.9)`;
      await this.el.animate([{ transform: bas }, { transform: son, opacity: 0.6 }], { duration: sure(ms), easing: 'cubic-bezier(.3,.8,.4,1)', fill: 'forwards' }).finished.catch(() => undefined);
    } else if (ms > 0) {
      // yerine dönmeyen araç (kepçe, sünger): küçülüp söner
      await this.el.animate([{ transform: bas, opacity: 1 }, { transform: `${bas} scale(.7)`, opacity: 0 }], { duration: sure(Math.min(ms, 180)), easing: 'ease-in', fill: 'forwards' }).finished.catch(() => undefined);
    }
    this.el.remove();
  }
  kaldir() {
    this.bitti = true;
    cancelAnimationFrame(this.raf);
    this.el.remove();
  }
}
