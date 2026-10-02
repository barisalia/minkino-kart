/**
 * Çok hedefli sürükleme: Mino'nun Pazarı'nın sürükleme kodu (pazar/src/surukle.ts) üstüne; bırakılan yerin altındaki
 * hedef (sepet, basamak, tabak …) bulunur. Kabul edilmezse nesne yumuşakça yerine döner (geriGonder).
 */
import { geriGonder, surukle } from '../../pazar/src/surukle';

export { geriGonder };

/** Hedefin çevresine tolerans (küçük parmaklar tam isabet ettiremez) */
const PAY = 30;

export interface HedefliSurukle {
  el: HTMLElement;
  /** bırakma yerleri */
  hedefler: () => HTMLElement[];
  /** sürükleme başlayabilir mi */
  aktif?: () => boolean;
  basla?: () => void;
  /** bırakıldı: altındaki hedef (yoksa null) */
  birak: (hedef: HTMLElement | null) => void;
}

/** Noktaya en yakın hedef (PAY toleransıyla içindeyse) */
export function hedefBul(hedefler: HTMLElement[], x: number, y: number): HTMLElement | null {
  let en: HTMLElement | null = null;
  let enD = Infinity;
  for (const t of hedefler) {
    const r = t.getBoundingClientRect();
    if (x < r.left - PAY || x > r.right + PAY || y < r.top - PAY || y > r.bottom + PAY) continue;
    const d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2));
    if (d < enD) {
      enD = d;
      en = t;
    }
  }
  return en;
}

export function hedefliSurukle(o: HedefliSurukle): () => void {
  let x = 0;
  let y = 0;
  let isik: HTMLElement | null = null;
  const yak = (t: HTMLElement | null) => {
    if (isik === t) return;
    isik?.classList.remove('ok-uzerinde');
    isik = t;
    isik?.classList.add('ok-uzerinde');
  };
  // pazar'ın sürüklemesi tek hedef ister: bütün oyun kökü (ekranı kaplar; bırakınca altındaki hedefi biz buluruz)
  return surukle({
    el: o.el,
    hedef: () => o.el.closest<HTMLElement>('.mk-kok') ?? document.body,
    aktif: () => (o.aktif ? o.aktif() : true),
    basla: () => {
      o.el.classList.add('ok-tasiniyor');
      o.basla?.();
    },
    tasi: (px, py) => {
      x = px;
      y = py;
      yak(hedefBul(o.hedefler(), x, y));
    },
    birak: (bitti) => {
      o.el.classList.remove('ok-tasiniyor');
      yak(null);
      o.birak(bitti ? hedefBul(o.hedefler(), x, y) : null);
    },
  });
}
