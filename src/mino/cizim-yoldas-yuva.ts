/**
 * Çizim yoldaşının (Mino) tembel yuvası: yer hemen düzene girer, Mino'nun çizimi ayrı pakette arkadan yüklenir.
 * Mino gelmeden yapılan çağrılar yok sayılır (oyun beklemez, kilitlenmez).
 */
import type { CizimYoldas } from './cizim-yoldas';

export interface YoldasYuva {
  el: HTMLElement;
  hazir: Promise<CizimYoldas | null>;
  /** Mino yüklendiyse çalıştırır. */
  yap(fn: (y: CizimYoldas) => void): void;
  kapat(): void;
}

export function yoldasYuvasi(sinif = ''): YoldasYuva {
  const el = document.createElement('div');
  el.className = `cy-yuva ${sinif}`.trim();
  el.setAttribute('aria-hidden', 'true');
  let y: CizimYoldas | null = null;
  let kapandi = false;
  const hazir = import('./cizim-yoldas').then(
    (m) => {
      if (kapandi) return null;
      y = m.cizimYoldasi();
      el.append(y.el);
      el.classList.add('hazir');
      return y;
    },
    () => null,
  );
  return {
    el,
    hazir,
    yap(fn) {
      if (y && !kapandi) fn(y);
    },
    kapat() {
      kapandi = true;
      y?.kapat();
    },
  };
}
