/** Parmakla çizim tuvali: yumuşak çizgiler, geri al, temizle, silgi. */
export interface Cizgi {
  renk: string;
  kalinlik: number; // tuval genişliğine oranla
  silgi: boolean;
  noktalar: [number, number][]; // 0..1 arası
}

export class Tuval {
  readonly el: HTMLCanvasElement;
  renk = '#F0413F';
  kalinlik = 0.022;
  silgi = false;
  cizgiler: Cizgi[] = [];
  onDegisim: () => void = () => undefined;
  private ctx: CanvasRenderingContext2D;
  private aktif: Cizgi | null = null;
  private ro: ResizeObserver;

  constructor() {
    this.el = document.createElement('canvas');
    this.el.className = 'ms-tuval';
    this.el.style.touchAction = 'none';
    this.ctx = this.el.getContext('2d')!;
    this.ro = new ResizeObserver(() => this.boyutla());
    this.ro.observe(this.el);
    this.el.addEventListener('pointerdown', (e) => this.bas(e));
    this.el.addEventListener('pointermove', (e) => this.surukle(e));
    this.el.addEventListener('pointerup', () => this.birak());
    this.el.addEventListener('pointercancel', () => this.birak());
    this.el.addEventListener('pointerleave', () => this.birak());
  }

  private nokta(e: PointerEvent): [number, number] {
    const r = this.el.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
  }

  private bas(e: PointerEvent) {
    e.preventDefault();
    this.el.setPointerCapture?.(e.pointerId);
    this.aktif = { renk: this.renk, kalinlik: this.silgi ? this.kalinlik * 2.2 : this.kalinlik, silgi: this.silgi, noktalar: [this.nokta(e)] };
    this.cizgiler.push(this.aktif);
    this.ciz();
  }

  private surukle(e: PointerEvent) {
    if (!this.aktif) return;
    const olaylar = e.getCoalescedEvents?.() ?? [e];
    for (const o of olaylar) this.aktif.noktalar.push(this.nokta(o));
    this.ciz();
  }

  private birak() {
    if (!this.aktif) return;
    this.aktif = null;
    this.onDegisim();
  }

  geriAl() {
    this.cizgiler.pop();
    this.ciz();
    this.onDegisim();
  }

  temizle() {
    this.cizgiler = [];
    this.ciz();
    this.onDegisim();
  }

  bosMu() {
    return !this.cizgiler.some((c) => !c.silgi);
  }

  /** Son görünen boyut (tuval ekrandan kalkınca da çıktı alınabilsin) */
  private boyut = { w: 1, h: 1 };

  private boyutla() {
    const r = this.el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    this.boyut = { w: r.width, h: r.height };
    const dpr = Math.min(2.5, devicePixelRatio || 1);
    this.el.width = Math.max(1, Math.round(r.width * dpr));
    this.el.height = Math.max(1, Math.round(r.height * dpr));
    this.ciz();
  }

  /** Tüm çizgileri verilen bağlama çizer. */
  private cizgileriCiz(c: CanvasRenderingContext2D, W: number, H: number) {
    c.lineCap = 'round';
    c.lineJoin = 'round';
    for (const z of this.cizgiler) {
      c.globalCompositeOperation = z.silgi ? 'destination-out' : 'source-over';
      c.strokeStyle = z.renk;
      c.fillStyle = z.renk;
      c.lineWidth = z.kalinlik * W;
      const p = z.noktalar.map(([x, y]) => [x * W, y * H] as const);
      if (p.length === 1) {
        c.beginPath();
        c.arc(p[0][0], p[0][1], c.lineWidth / 2, 0, Math.PI * 2);
        c.fill();
        continue;
      }
      c.beginPath();
      c.moveTo(p[0][0], p[0][1]);
      for (let i = 1; i < p.length - 1; i++) {
        const mx = (p[i][0] + p[i + 1][0]) / 2;
        const my = (p[i][1] + p[i + 1][1]) / 2;
        c.quadraticCurveTo(p[i][0], p[i][1], mx, my);
      }
      const son = p[p.length - 1];
      c.lineTo(son[0], son[1]);
      c.stroke();
    }
    c.globalCompositeOperation = 'source-over';
  }

  private ciz() {
    const { width: W, height: H } = this.el;
    this.ctx.clearRect(0, 0, W, H);
    this.cizgileriCiz(this.ctx, W, H);
  }

  /** Çizimi beyaz zeminli kare PNG olarak verir (içeriğe göre ortalanır, kenar boşluklu). */
  async blob(boyut = 1024): Promise<Blob> {
    const W = this.boyut.w;
    const H = this.boyut.h;
    // içerik sınırları
    let x0 = 1, y0 = 1, x1 = 0, y1 = 0;
    for (const z of this.cizgiler) {
      if (z.silgi) continue;
      for (const [x, y] of z.noktalar) {
        x0 = Math.min(x0, x - z.kalinlik);
        y0 = Math.min(y0, y - (z.kalinlik * W) / H);
        x1 = Math.max(x1, x + z.kalinlik);
        y1 = Math.max(y1, y + (z.kalinlik * W) / H);
      }
    }
    if (x1 <= x0) [x0, y0, x1, y1] = [0, 0, 1, 1];
    const gen = (x1 - x0) * W;
    const yuk = (y1 - y0) * H;
    const kenar = Math.max(gen, yuk) * 1.18;
    const cx = ((x0 + x1) / 2) * W;
    const cy = ((y0 + y1) / 2) * H;
    const gecici = document.createElement('canvas');
    gecici.width = Math.round(W);
    gecici.height = Math.round(H);
    this.cizgileriCiz(gecici.getContext('2d')!, gecici.width, gecici.height);
    const cikti = document.createElement('canvas');
    cikti.width = cikti.height = boyut;
    const c = cikti.getContext('2d')!;
    c.fillStyle = '#fff';
    c.fillRect(0, 0, boyut, boyut);
    c.drawImage(gecici, cx - kenar / 2, cy - kenar / 2, kenar, kenar, 0, 0, boyut, boyut);
    return new Promise((coz) => cikti.toBlob((b) => coz(b!), 'image/png'));
  }

  kapat() {
    this.ro.disconnect();
  }
}
