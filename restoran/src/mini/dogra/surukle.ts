/**
 * P2 ortak sürükleme (Tava, Tabakla): parmağa basınca aynı karede tutulur, parmağın biraz üstünde izler (parmak
 * örtmez). Kısa ve az kayan dokunuş `dokun` sayılır (3-4 yaş için her aracın dokunarak da yolu var).
 * Sürükleme sırasında hız (px/ms) verilir: yumurtanın kenara vuruşu, fiske.
 */
export interface SurukleSecenek {
  /** parmak bastı (aynı karede görüntü): false dönerse sürükleme başlamaz */
  basla?(x: number, y: number, e: PointerEvent): boolean | void;
  /** parmak hareket (kap içi px), hız px/ms */
  hareket?(x: number, y: number, hiz: { vx: number; vy: number; v: number }): void;
  /** bıraktı (sürükleme) */
  birak?(x: number, y: number, hiz: { vx: number; vy: number; v: number; ms: number; dx: number; dy: number }): void;
  /** kısa dokunuş */
  dokun?(x: number, y: number): void;
}

export const DOKUNUS = { px: 12, ms: 420 } as const;

/** `el`e bağlı sürükleme; konumlar `kap`a göre. Kaldırma fonksiyonu döner. */
export function surukle(el: HTMLElement, kap: HTMLElement, s: SurukleSecenek): () => void {
  let id: number | null = null;
  let x0 = 0;
  let y0 = 0;
  let t0 = 0;
  let enUzak = 0;
  let son = { x: 0, y: 0, t: 0 };
  let hiz = { vx: 0, vy: 0, v: 0 };
  const yer = (e: PointerEvent) => {
    const r = kap.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const asagi = (e: PointerEvent) => {
    if (id !== null) return;
    const p = yer(e);
    if (s.basla?.(p.x, p.y, e) === false) return;
    e.preventDefault();
    e.stopPropagation();
    id = e.pointerId;
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* yok say */
    }
    x0 = p.x;
    y0 = p.y;
    t0 = performance.now();
    enUzak = 0;
    son = { x: p.x, y: p.y, t: t0 };
    hiz = { vx: 0, vy: 0, v: 0 };
  };
  const hareket = (e: PointerEvent) => {
    if (e.pointerId !== id) return;
    const p = yer(e);
    const t = performance.now();
    const dt = Math.max(1, t - son.t);
    const vx = (p.x - son.x) / dt;
    const vy = (p.y - son.y) / dt;
    // hız yumuşatılır (titrek parmak)
    hiz = { vx: hiz.vx * 0.4 + vx * 0.6, vy: hiz.vy * 0.4 + vy * 0.6, v: 0 };
    hiz.v = Math.hypot(hiz.vx, hiz.vy);
    son = { x: p.x, y: p.y, t };
    enUzak = Math.max(enUzak, Math.hypot(p.x - x0, p.y - y0));
    s.hareket?.(p.x, p.y, hiz);
  };
  const yukari = (e: PointerEvent) => {
    if (e.pointerId !== id) return;
    id = null;
    const p = yer(e);
    const ms = performance.now() - t0;
    if (enUzak < DOKUNUS.px && ms < DOKUNUS.ms && s.dokun) s.dokun(p.x, p.y);
    else s.birak?.(p.x, p.y, { ...hiz, ms, dx: p.x - x0, dy: p.y - y0 });
  };
  const iptal = (e: PointerEvent) => {
    if (e.pointerId !== id) return;
    id = null;
    s.birak?.(son.x, son.y, { ...hiz, ms: performance.now() - t0, dx: son.x - x0, dy: son.y - y0 });
  };
  el.addEventListener('pointerdown', asagi);
  el.addEventListener('pointermove', hareket);
  el.addEventListener('pointerup', yukari);
  el.addEventListener('pointercancel', iptal);
  return () => {
    el.removeEventListener('pointerdown', asagi);
    el.removeEventListener('pointermove', hareket);
    el.removeEventListener('pointerup', yukari);
    el.removeEventListener('pointercancel', iptal);
  };
}
