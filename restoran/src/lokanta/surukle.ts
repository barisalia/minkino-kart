/**
 * Lokantada sürükle ya da dokun (tabak, müşteri, hesap tabağı): parmak 12 px'ten az kayıp 450 ms içinde kalkarsa
 * dokunuştur; yoksa sürüklemedir. Sürüklerken bir "hayalet" parmağın biraz üstünde durur (parmak örtmesin, §1d).
 */
import { h } from '../../../src/ui/dom';

export interface SurukleSecenek {
  /** sürüklenecek görüntünün kopyası (yoksa el'in klonu) */
  hayalet?: () => HTMLElement;
  /** sürükleme başladı */
  basla?: () => void;
  /** parmak her kaydığında (hedef vurgusu için) */
  kay?: (x: number, y: number) => void;
  /** bırakıldı; true dönerse hayalet orada kaybolur, false: geri süzülür */
  birak: (x: number, y: number) => boolean;
  /** kısa dokunuş */
  dokun?: () => void;
  /** açık mı (ör. müşteri yürürken sürüklenmez) */
  acik?: () => boolean;
}

export function surukleBagla(el: HTMLElement, kap: HTMLElement, s: SurukleSecenek): () => void {
  let bas: { x: number; y: number; t: number; id: number } | null = null;
  let hayalet: HTMLElement | null = null;
  let surukluyor = false;
  const kaldir = () => {
    hayalet?.remove();
    hayalet = null;
    surukluyor = false;
    el.classList.remove('rs-surukleniyor');
  };
  const konumla = (x: number, y: number) => {
    if (!hayalet) return;
    const r = kap.getBoundingClientRect();
    hayalet.style.left = `${x - r.left}px`;
    hayalet.style.top = `${y - r.top - 28}px`;
  };
  const asagi = (e: PointerEvent) => {
    if (s.acik && !s.acik()) return;
    if (bas) return;
    bas = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId };
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* yok say */
    }
    e.preventDefault();
  };
  const kay = (e: PointerEvent) => {
    if (!bas || e.pointerId !== bas.id) return;
    if (!surukluyor && Math.hypot(e.clientX - bas.x, e.clientY - bas.y) > 12) {
      surukluyor = true;
      const r = el.getBoundingClientRect();
      const ic = s.hayalet?.() ?? (el.cloneNode(true) as HTMLElement);
      hayalet = h('div.rs-hayalet', { style: `width:${r.width}px;height:${r.height}px` }, ic);
      kap.append(hayalet);
      el.classList.add('rs-surukleniyor');
      s.basla?.();
    }
    if (surukluyor) {
      konumla(e.clientX, e.clientY);
      s.kay?.(e.clientX, e.clientY);
    }
  };
  const yukari = (e: PointerEvent) => {
    if (!bas || e.pointerId !== bas.id) return;
    const kisa = !surukluyor && performance.now() - bas.t < 650;
    bas = null;
    if (surukluyor) {
      const tamam = s.birak(e.clientX, e.clientY);
      if (!tamam && hayalet) {
        const r = el.getBoundingClientRect();
        const kr = kap.getBoundingClientRect();
        const g = hayalet;
        hayalet = null;
        try {
          g.animate([{ left: g.style.left, top: g.style.top }, { left: `${r.left + r.width / 2 - kr.left}px`, top: `${r.top + r.height / 2 - kr.top}px` }], { duration: 260, easing: 'ease-out' }).finished.then(
            () => g.remove(),
            () => g.remove(),
          );
        } catch {
          g.remove();
        }
      }
      kaldir();
    } else if (kisa) s.dokun?.();
  };
  const iptal = () => {
    bas = null;
    kaldir();
  };
  el.addEventListener('pointerdown', asagi);
  el.addEventListener('pointermove', kay);
  el.addEventListener('pointerup', yukari);
  el.addEventListener('pointercancel', iptal);
  return () => {
    el.removeEventListener('pointerdown', asagi);
    el.removeEventListener('pointermove', kay);
    el.removeEventListener('pointerup', yukari);
    el.removeEventListener('pointercancel', iptal);
    kaldir();
  };
}

/** Nokta bir öğenin (biraz genişletilmiş) kutusunda mı */
export const ustunde = (el: Element, x: number, y: number, pay = 16) => {
  const r = el.getBoundingClientRect();
  return x > r.left - pay && x < r.right + pay && y > r.top - pay && y < r.bottom + pay;
};
