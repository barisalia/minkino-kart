/**
 * Dokun ya da sürükle-bırak (fırlat): parmak 8 px'ten az oynarsa dokunuş, çoksa sürükleme. Sürüklerken öğenin
 * hayaleti parmağı izler; bırakınca son hız da verilir (fırlatma). Hiçbir animasyon dokunuşu kilitlemez.
 */
import { h } from '../../src/ui/dom';
import type { Nokta } from './anim';

export interface Birakis {
  /** bırakılan nokta (kabın koordinatında) */
  n: Nokta;
  /** son hız (px/ms) */
  vx: number;
  vy: number;
  hayalet: HTMLElement;
}

export interface SurukleSecenek {
  /** kap: koordinatların göreli olduğu öğe (ekran) */
  kap: HTMLElement;
  /** hayaletin katmanı */
  katman: HTMLElement;
  /** hayaletin resmi ve boyu (px) */
  resim: () => { src: string; en: number; boy: number } | null;
  tik: (n: Nokta) => void;
  birak: (b: Birakis) => void;
  /** sürükleme başladı (yerini boşalt, ipucunu durdur) */
  basla?: () => void;
  /** sürüklerken (ör. hedefin üstünde mi) */
  tasi?: (n: Nokta) => void;
}

export function surukle(el: HTMLElement, s: SurukleSecenek) {
  el.style.touchAction = 'none';
  el.addEventListener('pointerdown', (e) => {
    if (e.button > 0) return;
    const kr = () => s.kap.getBoundingClientRect();
    const r0 = kr();
    const bas = { x: e.clientX - r0.left, y: e.clientY - r0.top };
    let hayalet: HTMLElement | null = null;
    const izler: { x: number; y: number; t: number }[] = [{ ...bas, t: performance.now() }];
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* eski tarayıcı */
    }
    const tasi = (ev: PointerEvent) => {
      const r = kr();
      const n = { x: ev.clientX - r.left, y: ev.clientY - r.top };
      izler.push({ ...n, t: performance.now() });
      if (izler.length > 6) izler.shift();
      if (!hayalet && Math.hypot(n.x - bas.x, n.y - bas.y) > 8) {
        const r = s.resim();
        if (!r) return;
        hayalet = h('img.mg-hayalet', { src: r.src, alt: '', draggable: 'false', style: `width:${r.en}px;height:${r.boy}px` });
        s.katman.append(hayalet);
        s.basla?.();
      }
      if (hayalet) {
        hayalet.style.transform = `translate(${n.x}px, ${n.y}px) translate(-50%, -50%)`;
        s.tasi?.(n);
      }
    };
    const bitir = (ev: PointerEvent) => {
      el.removeEventListener('pointermove', tasi);
      el.removeEventListener('pointerup', bitir);
      el.removeEventListener('pointercancel', bitir);
      const r = kr();
      const n = { x: ev.clientX - r.left, y: ev.clientY - r.top };
      if (!hayalet) {
        if (ev.type === 'pointerup') s.tik(n);
        return;
      }
      const a = izler[0];
      const b = izler[izler.length - 1];
      const dt = Math.max(16, b.t - a.t);
      s.birak({ n, vx: (b.x - a.x) / dt, vy: (b.y - a.y) / dt, hayalet });
    };
    el.addEventListener('pointermove', tasi);
    el.addEventListener('pointerup', bitir);
    el.addEventListener('pointercancel', bitir);
  });
}

/** Nokta kutunun (kabın koordinatında) içinde mi; pay: her yana genişletme */
export function icinde(n: Nokta, r: { x: number; y: number; w: number; h: number }, pay = 0) {
  return n.x >= r.x - pay && n.x <= r.x + r.w + pay && n.y >= r.y - pay && n.y <= r.y + r.h + pay;
}

/** Öğenin kutusu, kabın koordinatında */
export function kutu(el: Element, kap: HTMLElement) {
  const r = el.getBoundingClientRect();
  const k = kap.getBoundingClientRect();
  return { x: r.left - k.left, y: r.top - k.top, w: r.width, h: r.height };
}
