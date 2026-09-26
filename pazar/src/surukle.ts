/**
 * Parmakla sürükleme: ürün parmağı izler, bırakılınca hedefin (sepet) üstündeyse `birak(true)`.
 * Kabul edilmezse ürün yumuşakça yerine döner (`geriGonder`).
 */
import { sure } from '../../src/ui/dom';

export interface Surukle {
  el: HTMLElement;
  /** bırakma alanı */
  hedef: () => HTMLElement;
  /** sürükleme başlayabilir mi */
  aktif: () => boolean;
  /** bırakıldı: hedefin üstünde mi */
  birak: (hedefte: boolean) => void;
  basla?: () => void;
}

/** Hedefin çevresine tolerans payı (küçük parmaklar tam isabet ettiremez) */
const PAY = 36;

function icinde(r: DOMRect, x: number, y: number) {
  return x > r.left - PAY && x < r.right + PAY && y > r.top - PAY && y < r.bottom + PAY;
}

export function surukle(s: Surukle): () => void {
  const { el } = s;
  let id: number | null = null;
  let x0 = 0;
  let y0 = 0;

  const bas = (e: PointerEvent) => {
    if (id !== null || !s.aktif() || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault();
    id = e.pointerId;
    x0 = e.clientX;
    y0 = e.clientY;
    try {
      el.setPointerCapture(id);
    } catch {
      /* yok say */
    }
    el.style.transition = 'none';
    el.classList.add('pz-tasiniyor');
    s.basla?.();
  };
  const kaydir = (e: PointerEvent) => {
    if (e.pointerId !== id) return;
    el.style.transform = `translate(${e.clientX - x0}px, ${e.clientY - y0}px) scale(1.18) rotate(-4deg)`;
    s.hedef().classList.toggle('pz-uzerinde', icinde(s.hedef().getBoundingClientRect(), e.clientX, e.clientY));
  };
  const son = (e: PointerEvent) => {
    if (e.pointerId !== id) return;
    id = null;
    el.classList.remove('pz-tasiniyor');
    const h = s.hedef();
    h.classList.remove('pz-uzerinde');
    s.birak(e.type === 'pointerup' && icinde(h.getBoundingClientRect(), e.clientX, e.clientY));
  };
  el.addEventListener('pointerdown', bas);
  el.addEventListener('pointermove', kaydir);
  el.addEventListener('pointerup', son);
  el.addEventListener('pointercancel', son);
  return () => {
    el.removeEventListener('pointerdown', bas);
    el.removeEventListener('pointermove', kaydir);
    el.removeEventListener('pointerup', son);
    el.removeEventListener('pointercancel', son);
  };
}

/** Ürünü bırakıldığı yerden yuvasına yumuşakça geri götürür. */
export function geriGonder(el: HTMLElement) {
  el.style.transition = `transform ${sure(420)}ms cubic-bezier(0.3, 1.4, 0.5, 1)`;
  el.style.transform = '';
  setTimeout(() => (el.style.transition = ''), sure(450));
}

/** Ürünü yeni kabına taşır ama ekranda eski yerinden oraya kayarak gider (FLIP). */
export function tasi(el: HTMLElement, kap: HTMLElement) {
  const once = el.getBoundingClientRect();
  el.style.transition = 'none';
  el.style.transform = '';
  kap.append(el);
  const sonra = el.getBoundingClientRect();
  const dx = once.left + once.width / 2 - (sonra.left + sonra.width / 2);
  const dy = once.top + once.height / 2 - (sonra.top + sonra.height / 2);
  el.style.transform = `translate(${dx}px, ${dy}px)`;
  void el.offsetWidth;
  el.style.transition = `transform ${sure(300)}ms cubic-bezier(0.3, 1.3, 0.5, 1)`;
  el.style.transform = '';
  setTimeout(() => (el.style.transition = ''), sure(320));
}
