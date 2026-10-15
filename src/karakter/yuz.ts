/**
 * Yüzü açık tutma: bir karakterin göz + kaş ve ağız kutuları (ekran koordinatı) ve uçan bir şeyin yolunu yüzlerden
 * kaçıran yay. Sevinç anında (şaşkın / mutlu yüz) hiçbir efekt, Kino ya da yiyecek göz ve kaşların önüne geçmesin diye.
 *
 * İskelet karakterlerde (src/karakter) yüz katmanları data-parca: goz-*, kas*, agiz* (ifade katmanları dahil, görünmeseler
 * de yerleri aynı); Mino'da (src/mino) .m-goz / .m-kapali-goz / .m-mutlu-goz ve .m-agiz / .m-agiz-sekil.
 */

export interface Kutu {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** Kutuların birleşimi (boş kutular sayılmaz) */
export function birlesim(kutular: (Kutu | null | undefined)[]): Kutu | null {
  const k = kutular.filter((r): r is Kutu => !!r && r.right - r.left > 0.5 && r.bottom - r.top > 0.5);
  if (!k.length) return null;
  return {
    left: Math.min(...k.map((r) => r.left)),
    top: Math.min(...k.map((r) => r.top)),
    right: Math.max(...k.map((r) => r.right)),
    bottom: Math.max(...k.map((r) => r.bottom)),
  };
}

export const genislet = (k: Kutu, pay: number): Kutu => ({ left: k.left - pay, top: k.top - pay, right: k.right + pay, bottom: k.bottom + pay });
export const kaydir = (k: Kutu, dx: number, dy: number): Kutu => ({ left: k.left + dx, top: k.top + dy, right: k.right + dx, bottom: k.bottom + dy });
export const kesisir = (a: Kutu, b: Kutu) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

const kutusu = (e: Element) => e.getBoundingClientRect();

export interface YuzKutulari {
  /** gözler ve kaşlar */
  goz: Kutu | null;
  agiz: Kutu | null;
  /** ikisinin birleşimi */
  yuz: Kutu | null;
}

/** Karakterin (iskelet ya da Mino) yüz kutuları, ekran koordinatında */
export function yuzKutulari(el: Element): YuzKutulari {
  const parcalar = [...el.querySelectorAll<SVGGElement>('[data-parca]')];
  let goz: Kutu | null;
  let agiz: Kutu | null;
  if (parcalar.length) {
    goz = birlesim(parcalar.filter((g) => /^(goz|kas)(-|$)/.test(g.dataset.parca ?? '')).map(kutusu));
    agiz = birlesim(parcalar.filter((g) => /^agiz(-|$)/.test(g.dataset.parca ?? '')).map(kutusu));
  } else {
    goz = birlesim([...el.querySelectorAll('.m-goz, .m-kapali-goz, .m-mutlu-goz')].map(kutusu));
    agiz = birlesim([...el.querySelectorAll('.m-agiz, .m-agiz-sekil')].map(kutusu));
  }
  return { goz, agiz, yuz: birlesim([goz, agiz]) };
}

/** Doğru parçası kutuyu kesiyor mu (Liang-Barsky) */
function parcaKeser(x0: number, y0: number, x1: number, y1: number, k: Kutu): boolean {
  let t0 = 0;
  let t1 = 1;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const p = [-dx, dx, -dy, dy];
  const q = [x0 - k.left, k.right - x0, y0 - k.top, k.bottom - y0];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return false;
      continue;
    }
    const r = q[i] / p[i];
    if (p[i] < 0) t0 = Math.max(t0, r);
    else t1 = Math.min(t1, r);
    if (t0 > t1) return false;
  }
  return true;
}

/**
 * Kavisli uçuşun (başlangıç → orta noktası kavis kadar yukarıda → hedef; WAAPI üç anahtar karesi) yüzlerden geçmeyen
 * kavisi: istenen yukarı kavisten (eksi) başlayıp düzleştirir, gerekirse aşağı kavise iner. Hiçbiri temiz değilse en az yüz
 * kesen. engeller: uçan şeyin yarı boyu kadar büyütülmüş yüz kutuları (aynı koordinatta).
 */
export function kavisKacir(bas: [number, number], hedef: [number, number], kavis: number, engeller: Kutu[]): number {
  if (!engeller.length) return kavis;
  const [x0, y0] = bas;
  const [x1, y1] = hedef;
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;
  const keser = (kv: number) => engeller.filter((k) => parcaKeser(x0, y0, mx, my + kv, k) || parcaKeser(mx, my + kv, x1, y1, k)).length;
  let enIyi = kavis;
  let enAz = keser(kavis);
  if (!enAz) return kavis;
  // yukarı kavis (eksi) adım adım düzleşir, en çok 80 px aşağı kavise kadar
  for (let kv = kavis + 8; kv <= 80; kv += 8) {
    const n = keser(kv);
    if (n < enAz) {
      enAz = n;
      enIyi = kv;
      if (!n) break;
    }
  }
  return enIyi;
}
