/**
 * Banyo efektleri (hepsi kodla, yalnız transform / opacity animasyonu):
 * parçacıklar (su damlası, köpük, çamur, baloncuk, buhar, yıldız), çizgi roman yazısı ("ŞLAP!"),
 * ekrana sıçrayan damlalar (parmakla silinir), buğulu ayna (parmakla silinir), parmak ipucu, sürükleme ve ovalama.
 */
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { EL_SVG } from './banyo-gorsel';
import { AZ_HAREKET } from './banyo-karakter';

const r = (a: number, b: number) => a + Math.random() * (b - a);

/** Yerel koordinat (kabın %'si) */
function yerel(kap: HTMLElement, cx: number, cy: number): [number, number] {
  const k = kap.getBoundingClientRect();
  return [((cx - k.left) / Math.max(1, k.width)) * 100, ((cy - k.top) / Math.max(1, k.height)) * 100];
}

export type ParcaTuru = 'su' | 'kopuk' | 'camur' | 'baloncuk' | 'buhar' | 'yildiz' | 'kalp';

/** Parçacık katmanı: dünyanın içinde (kamerayla birlikte), dokunmaya kapalı */
export class Parcaciklar {
  readonly el: HTMLElement;
  constructor() {
    this.el = h('div.bn-parca-katman');
  }
  private yap(tur: ParcaTuru, x: number, y: number, boy: number) {
    const e = h(`i.bn-p.bn-p-${tur}`, { style: `left:${x.toFixed(2)}%;top:${y.toFixed(2)}%;--b:${boy.toFixed(1)}px` });
    this.el.append(e);
    return e;
  }
  /** Sıçrama: parçacıklar yay çizerek saçılır, yerçekimiyle düşer */
  sicrat(cx: number, cy: number, tur: ParcaTuru = 'su', adet = 12, guc = 1, yukari = 1) {
    if (AZ_HAREKET) adet = Math.ceil(adet / 3);
    const [x, y] = yerel(this.el, cx, cy);
    for (let i = 0; i < adet; i++) {
      const b = r(6, 16) * (tur === 'kopuk' ? 1.4 : 1);
      const e = this.yap(tur, x, y, b);
      const a = r(-Math.PI * 0.95, -Math.PI * 0.05);
      const v = r(40, 120) * guc;
      const vx = Math.cos(a) * v * (yukari ? 1 : 1.4);
      const vy = Math.sin(a) * v * yukari;
      const ms = sure(r(520, 900));
      e.animate(
        [
          { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 1 },
          { transform: `translate(calc(-50% + ${vx * 0.55}px), calc(-50% + ${vy * 0.8}px)) scale(1)`, opacity: 1, offset: 0.45, easing: 'cubic-bezier(0.3, 0, 0.7, 1)' },
          { transform: `translate(calc(-50% + ${vx}px), calc(-50% + ${vy * 0.2 + 70 * guc}px)) scale(0.7, 0.9)`, opacity: 0 },
        ],
        { duration: ms, easing: 'cubic-bezier(0.2, 0.6, 0.4, 1)' },
      ).onfinish = () => e.remove();
    }
  }
  /** Yükselen baloncuklar / buhar */
  yuksel(cx: number, cy: number, tur: 'baloncuk' | 'buhar' = 'baloncuk', adet = 6, yayilma = 30) {
    if (AZ_HAREKET) adet = Math.ceil(adet / 3);
    const [x, y] = yerel(this.el, cx, cy);
    for (let i = 0; i < adet; i++) {
      const b = tur === 'buhar' ? r(30, 60) : r(8, 20);
      const e = this.yap(tur, x, y, b);
      const dx = r(-yayilma, yayilma);
      const ms = sure(tur === 'buhar' ? r(1600, 2400) : r(1100, 1800));
      e.animate(
        [
          { transform: 'translate(-50%, -50%) scale(0.3)', opacity: 0 },
          { transform: `translate(calc(-50% + ${dx * 0.3}px), calc(-50% - 30px)) scale(${tur === 'buhar' ? 0.8 : 1})`, opacity: tur === 'buhar' ? 0.7 : 1, offset: 0.25 },
          { transform: `translate(calc(-50% + ${dx}px), calc(-50% - ${r(90, 160)}px)) scale(${tur === 'buhar' ? 1.8 : 1.1})`, opacity: 0 },
        ],
        { duration: ms, delay: sure(i * r(40, 140)), easing: 'ease-out', fill: 'backwards' },
      ).onfinish = () => e.remove();
    }
  }
  /** Parıltı yıldızları (merkezden saçılır) */
  parilti(cx: number, cy: number, adet = 9, tur: 'yildiz' | 'kalp' = 'yildiz') {
    if (AZ_HAREKET) return;
    const [x, y] = yerel(this.el, cx, cy);
    for (let i = 0; i < adet; i++) {
      const e = this.yap(tur, x, y, r(12, 22));
      const a = (i / adet) * Math.PI * 2 + r(-0.2, 0.2);
      const d = r(40, 80);
      e.animate(
        [
          { transform: 'translate(-50%, -50%) scale(0.2) rotate(0deg)', opacity: 1 },
          { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d}px)) scale(1) rotate(90deg)`, opacity: 1, offset: 0.6 },
          { transform: `translate(calc(-50% + ${Math.cos(a) * d * 1.2}px), calc(-50% + ${Math.sin(a) * d * 1.2}px)) scale(0.4) rotate(160deg)`, opacity: 0 },
        ],
        { duration: sure(900), delay: sure(i * 25), easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)', fill: 'backwards' },
      ).onfinish = () => e.remove();
    }
  }
  /** Su halkası (suya düşen bir şeyin dalgası) */
  halka(cx: number, cy: number, en = 120) {
    const [x, y] = yerel(this.el, cx, cy);
    for (let i = 0; i < 2; i++) {
      const e = h('i.bn-p.bn-p-halka', { style: `left:${x}%;top:${y}%;--b:${en}px` });
      this.el.append(e);
      e.animate(
        [
          { transform: 'translate(-50%, -50%) scale(0.2, 0.1)', opacity: 0.9 },
          { transform: 'translate(-50%, -50%) scale(1.3, 0.5)', opacity: 0 },
        ],
        { duration: sure(900), delay: sure(i * 220), easing: 'ease-out', fill: 'backwards' },
      ).onfinish = () => e.remove();
    }
  }
}

/** Çizgi roman yazısı ("ŞLAP!", "Pıt!"): kap içinde, ekran koordinatında */
export function yansiYazi(kap: HTMLElement, cx: number, cy: number, metin: string, renk = '#3e9df2', buyuk = false) {
  const [x, y] = yerel(kap, cx, cy);
  const e = h(`div.bn-yansi${buyuk ? '.buyuk' : ''}`, { style: `left:${x}%;top:${y}%;--r:${renk}` }, metin);
  kap.append(e);
  e.animate(
    [
      { transform: 'translate(-50%, -50%) scale(0.2) rotate(-12deg)', opacity: 0 },
      { transform: 'translate(-50%, -60%) scale(1.25) rotate(4deg)', opacity: 1, offset: 0.25 },
      { transform: 'translate(-50%, -62%) scale(1) rotate(-3deg)', opacity: 1, offset: 0.7 },
      { transform: 'translate(-50%, -80%) scale(0.9) rotate(-3deg)', opacity: 0 },
    ],
    { duration: sure(buyuk ? 1500 : 900), easing: 'cubic-bezier(0.3, 1.2, 0.5, 1)' },
  ).onfinish = () => e.remove();
}

// ---------------------------------------------------------------- ekran damlaları (Kino silkelenince)
export class EkranDamlalari {
  readonly el: HTMLElement;
  private damlalar: { el: HTMLElement; x: number; y: number; r: number; silindi: boolean }[] = [];
  private toplam = 0;
  onSil: (kalan: number) => void = () => undefined;
  constructor() {
    this.el = h('div.bn-ekran-damla');
    let bas = false;
    const sil = (e: PointerEvent) => {
      if (!bas) return;
      const k = this.el.getBoundingClientRect();
      const px = ((e.clientX - k.left) / k.width) * 100;
      const py = ((e.clientY - k.top) / k.height) * 100;
      const oran = k.width / k.height;
      let degisti = false;
      for (const d of this.damlalar) {
        if (d.silindi) continue;
        const dx = (px - d.x) * oran;
        const dy = py - d.y;
        if (Math.hypot(dx, dy) < d.r + 7) {
          d.silindi = true;
          degisti = true;
          d.el
            .animate(
              [
                { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                { transform: `translate(calc(-50% + ${e.movementX * 3}px), calc(-50% + ${e.movementY * 3 + 20}px)) scale(1.5, 0.4)`, opacity: 0 },
              ],
              { duration: sure(280), easing: 'ease-out', fill: 'forwards' },
            )
            .finished.then(() => d.el.remove(), () => undefined);
        }
      }
      if (degisti) this.onSil(this.kalanOran);
    };
    this.el.addEventListener('pointerdown', (e) => {
      bas = true;
      sil(e);
    });
    this.el.addEventListener('pointermove', sil);
    const bit = () => (bas = false);
    this.el.addEventListener('pointerup', bit);
    this.el.addEventListener('pointercancel', bit);
  }
  /** Ekrana adet kadar damla sıçrat */
  sicrat(adet: number) {
    this.el.classList.add('acik');
    for (let i = 0; i < adet; i++) {
      const rr = r(3.5, 8.5);
      const x = r(6, 94);
      const y = r(18, 86);
      const el = h('i.bn-ed', { style: `left:${x}%;top:${y}%;--r:${rr}` });
      this.el.append(el);
      const d = { el, x, y, r: rr, silindi: false };
      this.damlalar.push(d);
      el.animate(
        [
          { transform: 'translate(-50%, -50%) scale(0)', opacity: 0 },
          { transform: 'translate(-50%, -50%) scale(1.3, 0.8)', opacity: 1, offset: 0.4 },
          { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        ],
        { duration: sure(360), delay: sure(i * 30), easing: 'cubic-bezier(0.3, 1.5, 0.5, 1)', fill: 'backwards' },
      );
    }
    this.toplam = this.damlalar.length;
  }
  get kalanOran() {
    return this.toplam ? this.damlalar.filter((d) => !d.silindi).length / this.toplam : 0;
  }
  /** kalan damlaların merkezleri (ipucu için, ekran koordinatı) */
  kalanlar(): [number, number][] {
    const k = this.el.getBoundingClientRect();
    return this.damlalar.filter((d) => !d.silindi).map((d) => [k.left + (d.x / 100) * k.width, k.top + (d.y / 100) * k.height]);
  }
  temizle() {
    for (const d of this.damlalar) if (!d.silindi) d.el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: sure(300), fill: 'forwards' });
    this.damlalar.forEach((d) => (d.silindi = true));
    setTimeout(() => {
      this.el.classList.remove('acik');
      this.el.replaceChildren();
      this.damlalar = [];
    }, sure(350));
  }
}

// ---------------------------------------------------------------- buğu (ayna)
/** Buğulu cam: parmak geçtikçe açılır. Ölçüm kaba ızgarayla (telefon dostu). */
export class Bugu {
  readonly el: HTMLCanvasElement;
  private c: CanvasRenderingContext2D | null;
  private son: [number, number] | null = null;
  private olcZaman = 0;
  private acik = 0;
  onDegis: (acikOran: number) => void = () => undefined;
  constructor() {
    this.el = h('canvas.bn-bugu') as HTMLCanvasElement;
    this.c = this.el.getContext('2d', { willReadFrequently: true });
    this.el.addEventListener('pointerdown', (e) => {
      this.el.setPointerCapture?.(e.pointerId);
      this.son = this.nokta(e);
      this.sil(this.son, this.son);
    });
    this.el.addEventListener('pointermove', (e) => {
      if (!this.son) return;
      const n = this.nokta(e);
      this.sil(this.son, n);
      this.son = n;
    });
    const bit = () => (this.son = null);
    this.el.addEventListener('pointerup', bit);
    this.el.addEventListener('pointercancel', bit);
  }
  /** Boyutla ve buğula */
  kur() {
    const k = this.el.getBoundingClientRect();
    const g = Math.max(40, Math.round(k.width / 2));
    const y = Math.max(40, Math.round(k.height / 2));
    this.el.width = g;
    this.el.height = y;
    const c = this.c;
    if (!c) return;
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = 'rgba(236, 244, 248, 0.94)';
    c.fillRect(0, 0, g, y);
    // buğu lekeleri (düz beyaz olmasın)
    for (let i = 0; i < 26; i++) {
      c.fillStyle = `rgba(255,255,255,${r(0.2, 0.5).toFixed(2)})`;
      c.beginPath();
      c.arc(r(0, g), r(0, y), r(4, g / 6), 0, Math.PI * 2);
      c.fill();
    }
    this.acik = 0;
  }
  private nokta(e: PointerEvent): [number, number] {
    const k = this.el.getBoundingClientRect();
    return [((e.clientX - k.left) / k.width) * this.el.width, ((e.clientY - k.top) / k.height) * this.el.height];
  }
  private sil(a: [number, number], b: [number, number]) {
    const c = this.c;
    if (!c) return;
    c.globalCompositeOperation = 'destination-out';
    c.lineCap = 'round';
    c.lineWidth = Math.max(14, this.el.width * 0.16);
    c.beginPath();
    c.moveTo(a[0], a[1]);
    c.lineTo(b[0] + 0.1, b[1]);
    c.stroke();
    const simdi = performance.now();
    if (simdi - this.olcZaman > 120) {
      this.olcZaman = simdi;
      this.olc();
    }
  }
  private olc() {
    const c = this.c;
    if (!c) return;
    const { width: g, height: y } = this.el;
    const v = c.getImageData(0, 0, g, y).data;
    let bos = 0;
    let n = 0;
    for (let j = 2; j < y; j += 6)
      for (let i = 2; i < g; i += 6) {
        // elips cam: köşeler sayılmaz
        const ex = (i / g - 0.5) * 2;
        const ey = (j / y - 0.5) * 2;
        if (ex * ex + ey * ey > 0.85) continue;
        n++;
        if (v[(j * g + i) * 4 + 3] < 80) bos++;
      }
    this.acik = n ? bos / n : 0;
    this.onDegis(this.acik);
  }
  get acikOran() {
    return this.acik;
  }
  /** Hepsini aç (bitiş) */
  temizle() {
    this.el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: sure(700), fill: 'forwards' });
  }
}

// ---------------------------------------------------------------- parmak ipucu
export type IpucuTuru = 'dokun' | 'surukle' | 'ova' | 'bas' | 'cevir' | 'sil' | 'asagi';
/** Parmak ipucu: sahnenin üstünde bir el, hedefe gidip dokunmayı / sürüklemeyi / ovalamayı gösterir */
export class ParmakIpucu {
  readonly el: HTMLElement;
  private anim: Animation | null = null;
  private zaman = 0;
  constructor() {
    this.el = h('div.bn-ipucu-el', { html: EL_SVG, 'aria-hidden': 'true' });
  }
  /** a, b: ekran koordinatı (b: sürüklemenin bitişi) */
  goster(tur: IpucuTuru, a: [number, number], b?: [number, number]) {
    this.gizle();
    const kap = this.el.parentElement;
    if (!kap) return;
    const k = kap.getBoundingClientRect();
    const [x, y] = [a[0] - k.left, a[1] - k.top];
    this.el.style.left = `${x}px`;
    this.el.style.top = `${y}px`;
    this.el.classList.add('acik');
    const bx = b ? b[0] - a[0] : 0;
    const by = b ? b[1] - a[1] : 0;
    const t = (dx: number, dy: number, s = 1) => `translate(${dx}px, ${dy}px) scale(${s})`;
    let kf: Keyframe[];
    let ms = 1100;
    switch (tur) {
      case 'surukle':
      case 'asagi': {
        const dx = tur === 'asagi' ? 0 : bx;
        const dy = tur === 'asagi' ? 90 : by;
        kf = [
          { transform: t(0, 0), opacity: 0 },
          { transform: t(0, 0, 0.88), opacity: 1, offset: 0.15 },
          { transform: t(dx, dy, 0.88), opacity: 1, offset: 0.75 },
          { transform: t(dx, dy), opacity: 0 },
        ];
        ms = 1600;
        break;
      }
      case 'ova':
      case 'sil':
        kf = [
          { transform: t(-24, 0, 0.9), opacity: 0 },
          { transform: t(22, -10, 0.9), opacity: 1, offset: 0.2 },
          { transform: t(-22, 6, 0.9), offset: 0.4 },
          { transform: t(22, 14, 0.9), offset: 0.6 },
          { transform: t(-22, 20, 0.9), opacity: 1, offset: 0.8 },
          { transform: t(0, 20), opacity: 0 },
        ];
        ms = 1500;
        break;
      case 'cevir':
        kf = Array.from({ length: 9 }, (_, i) => {
          const aci = (i / 8) * Math.PI * 2;
          return { transform: t(Math.cos(aci) * 26, Math.sin(aci) * 26, 0.9), opacity: i === 0 || i === 8 ? 0 : 1 };
        });
        ms = 1400;
        break;
      case 'bas':
        kf = [
          { transform: t(0, -10), opacity: 0 },
          { transform: t(0, 0, 0.85), opacity: 1, offset: 0.25 },
          { transform: t(0, 0, 0.85), opacity: 1, offset: 0.85 },
          { transform: t(0, -10), opacity: 0 },
        ];
        ms = 1600;
        break;
      default:
        kf = [
          { transform: t(0, -14), opacity: 0 },
          { transform: t(0, -14), opacity: 1, offset: 0.3 },
          { transform: t(0, 0, 0.85), opacity: 1, offset: 0.5 },
          { transform: t(0, -10), opacity: 1, offset: 0.75 },
          { transform: t(0, -14), opacity: 0 },
        ];
    }
    this.anim = this.el.animate(kf, { duration: TEST_MODU ? 200 : ms, iterations: 3, easing: 'ease-in-out' });
    this.zaman = window.setTimeout(() => this.gizle(), TEST_MODU ? 700 : ms * 3);
  }
  gizle() {
    clearTimeout(this.zaman);
    this.anim?.cancel();
    this.anim = null;
    this.el.classList.remove('acik');
  }
}

// ---------------------------------------------------------------- sürükleme
export interface SurukleSecenek {
  /** parmak bastı */
  basla?(): void;
  /** her harekette (ekran koordinatı) */
  hareket?(cx: number, cy: number): void;
  /** bırakınca: true dönerse kabul (yerine dönmez) */
  birak(cx: number, cy: number): boolean;
  /** tutarken yukarı kalkma ölçeği */
  kalk?: number;
}
/** Bir öğeyi parmakla sürüklenebilir yapar (CSS translate/rotate; kamera ölçeği hesaba katılır). Döner: kapat() */
export function surukle(el: HTMLElement, s: SurukleSecenek): () => void {
  let id = -1;
  let bx = 0;
  let by = 0;
  let olcek = 1;
  let sonX = 0;
  let aci = 0;
  const bas = (e: PointerEvent) => {
    if (id !== -1) return;
    e.stopPropagation();
    e.preventDefault();
    id = e.pointerId;
    el.setPointerCapture?.(e.pointerId);
    const kutu = el.getBoundingClientRect();
    olcek = el.offsetWidth ? kutu.width / el.offsetWidth : 1;
    const [tx, ty] = (el.style.translate || '0px 0px').split(' ').map((v) => parseFloat(v) || 0);
    bx = e.clientX - tx * olcek;
    by = e.clientY - ty * olcek;
    sonX = e.clientX;
    el.classList.add('tutuluyor');
    el.style.scale = String(s.kalk ?? 1.12);
    s.basla?.();
  };
  const hareket = (e: PointerEvent) => {
    if (e.pointerId !== id) return;
    const dx = (e.clientX - bx) / olcek;
    const dy = (e.clientY - by) / olcek;
    el.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
    // hıza göre hafif eğilir (canlı dursun)
    aci = aci * 0.7 + Math.max(-14, Math.min(14, (e.clientX - sonX) * 0.8)) * 0.3;
    sonX = e.clientX;
    el.style.rotate = `${aci.toFixed(1)}deg`;
    s.hareket?.(e.clientX, e.clientY);
  };
  const birak = (e: PointerEvent) => {
    if (e.pointerId !== id) return;
    id = -1;
    el.classList.remove('tutuluyor');
    el.style.scale = '';
    el.style.rotate = '';
    if (!s.birak(e.clientX, e.clientY)) geriDon(el);
  };
  el.addEventListener('pointerdown', bas);
  el.addEventListener('pointermove', hareket);
  el.addEventListener('pointerup', birak);
  el.addEventListener('pointercancel', birak);
  el.classList.add('suruklenir');
  return () => {
    el.removeEventListener('pointerdown', bas);
    el.removeEventListener('pointermove', hareket);
    el.removeEventListener('pointerup', birak);
    el.removeEventListener('pointercancel', birak);
    el.classList.remove('suruklenir', 'tutuluyor');
  };
}
/** Yaylanarak yerine döner */
export function geriDon(el: HTMLElement) {
  const bas = el.style.translate || '0px 0px';
  el.style.translate = '';
  el.animate([{ translate: bas }, { translate: '0px 0px' }], { duration: sure(420), easing: 'cubic-bezier(0.3, 1.5, 0.5, 1)' });
}

/** Ovalama: basılıyken her harekette fn(cx, cy, yolPx). Döner: kapat() */
export function ovala(el: HTMLElement, fn: (cx: number, cy: number, yol: number) => void, bas?: (cx: number, cy: number) => void): () => void {
  let son: [number, number] | null = null;
  const b = (e: PointerEvent) => {
    e.stopPropagation();
    el.setPointerCapture?.(e.pointerId);
    son = [e.clientX, e.clientY];
    bas?.(e.clientX, e.clientY);
  };
  const m = (e: PointerEvent) => {
    if (!son) return;
    const yol = Math.hypot(e.clientX - son[0], e.clientY - son[1]);
    son = [e.clientX, e.clientY];
    fn(e.clientX, e.clientY, yol);
  };
  const bit = () => (son = null);
  el.addEventListener('pointerdown', b);
  el.addEventListener('pointermove', m);
  el.addEventListener('pointerup', bit);
  el.addEventListener('pointercancel', bit);
  return () => {
    el.removeEventListener('pointerdown', b);
    el.removeEventListener('pointermove', m);
    el.removeEventListener('pointerup', bit);
    el.removeEventListener('pointercancel', bit);
  };
}

/** Öğenin ekrandaki merkezi */
export function merkez(el: Element): [number, number] {
  const k = el.getBoundingClientRect();
  return [k.left + k.width / 2, k.top + k.height / 2];
}
/** Nokta kutunun (pay kadar genişletilmiş) içinde mi */
export function icinde(cx: number, cy: number, el: Element, pay = 0.15): boolean {
  const k = el.getBoundingClientRect();
  const px = k.width * pay;
  const py = k.height * pay;
  return cx >= k.left - px && cx <= k.right + px && cy >= k.top - py && cy <= k.bottom + py;
}
