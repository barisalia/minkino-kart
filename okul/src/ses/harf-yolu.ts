/**
 * Harfi izle: dik temel harf şablonları (0..1 kare; yazılış yönünde, her çizgi ayrı parmak hareketi) ve bağışlayıcı
 * iz takibi. DOM yok (tests/unit/okul-ses.test.ts denetler).
 *
 * Takip: parmak şablonun önündeki noktalara (en çok PENCERE kadar ileri) tolerans içinde yaklaştıkça çizgi dolar.
 * Çizgiden çıkmak bir şey bozmaz (ilerleme kalır), parmak kalkıp yeniden konabilir; çizginin sonuna az kala tamam
 * sayılır. Uzak bir yere dokunmak ya da çizgiyi atlamak ilerletmez. Örnekleme Çiz Canlansın'ın kodu (canlan/src/puan.ts).
 */
import { ornekle } from '../../../canlan/src/puan';
import { yay, type Nokta } from '../../../canlan/src/resimler';

const C = (...n: Nokta[]) => n;

/** Harf → çizgiler (büyük ve küçük; ı/i noktası tek noktalık çizgi: dokunmak yeter) */
export const HARF_YOLU: Record<string, Nokta[][]> = {
  A: [C([0.5, 0.12], [0.2, 0.88]), C([0.5, 0.12], [0.8, 0.88]), C([0.31, 0.6], [0.69, 0.6])],
  a: [yay(0.46, 0.66, 0.2, 0.22, -10, -370, 36), C([0.67, 0.44], [0.67, 0.88])],
  N: [C([0.27, 0.12], [0.27, 0.88]), C([0.27, 0.12], [0.73, 0.88]), C([0.73, 0.88], [0.73, 0.12])],
  n: [C([0.3, 0.44], [0.3, 0.88]), [...yay(0.5, 0.62, 0.2, 0.17, 180, 360, 20), [0.7, 0.88]]],
  E: [C([0.3, 0.12], [0.3, 0.88]), C([0.3, 0.12], [0.72, 0.12]), C([0.3, 0.5], [0.66, 0.5]), C([0.3, 0.88], [0.72, 0.88])],
  e: [[[0.29, 0.66], ...yay(0.5, 0.66, 0.21, 0.22, 0, -300, 32)]],
  T: [C([0.2, 0.12], [0.8, 0.12]), C([0.5, 0.12], [0.5, 0.88])],
  t: [[[0.45, 0.18], ...yay(0.57, 0.76, 0.12, 0.12, 180, 90, 10)], C([0.3, 0.42], [0.64, 0.42])],
  İ: [C([0.5, 0.3], [0.5, 0.88]), C([0.5, 0.13])],
  i: [C([0.5, 0.46], [0.5, 0.88]), C([0.5, 0.3])],
  L: [C([0.32, 0.12], [0.32, 0.88]), C([0.32, 0.88], [0.72, 0.88])],
  l: [C([0.5, 0.12], [0.5, 0.88])],
};

/** Kino'nun yanlış çizimi: aynada (x ters) ya da baş aşağı (y ters) */
export function kinoYolu(harf: string, tur: 'ayna' | 'ters'): Nokta[][] {
  return (HARF_YOLU[harf] ?? []).map((c) => c.map(([x, y]): Nokta => (tur === 'ayna' ? [1 - x, y] : [x, 1 - y])));
}

/** Çizgiyi SVG yoluna (0..100 kutu) çevirir */
export const yolD = (n: Nokta[]) => n.map((p, i) => `${i ? 'L' : 'M'}${(p[0] * 100).toFixed(2)} ${(p[1] * 100).toFixed(2)}`).join(' ');

// ---------------------------------------------------------------- iz takibi
/** Şablonun örnekleme aralığı (kutu kenarına oranla) */
export const ADIM = 0.012;
/** Parmak en çok bu kadar ileriyi doldurabilir (kapalı halkada başla-bitir aynı yerde: atlanmasın) */
const PENCERE = Math.ceil(0.2 / ADIM);
/** Sona bu kadar kala çizgi tamam */
const SON_PAY = Math.ceil(0.06 / ADIM);

/** Yaşa göre tolerans (kutu kenarına oranla; 300 px kutuda ~35-40 px): küçüklere daha bol */
export const izToleransi = (yas: number) => (yas <= 3 ? 0.14 : yas === 4 ? 0.13 : 0.115);

export interface Iz {
  /** eşit aralıklı şablon noktaları */
  n: Nokta[];
  /** ulaşılan son nokta */
  i: number;
  bitti: boolean;
}

export function izBaslat(cizgi: Nokta[]): Iz {
  return { n: cizgi.length > 1 ? ornekle(cizgi, ADIM) : cizgi.slice(), i: 0, bitti: false };
}

/** Doluluk (0..1) */
export const izOran = (iz: Iz) => (iz.bitti ? 1 : iz.n.length > 1 ? iz.i / (iz.n.length - 1) : 0);

/** Parmak p noktasında: ilerledi mi */
export function izIlerle(iz: Iz, p: Nokta, tol: number): boolean {
  if (iz.bitti) return false;
  const d = (q: Nokta) => Math.hypot(q[0] - p[0], q[1] - p[1]);
  if (iz.n.length === 1) {
    // nokta (i'nin noktası): yakınına dokunmak yeter
    if (d(iz.n[0]) > tol * 1.5) return false;
    iz.bitti = true;
    return true;
  }
  // başlamamış çizgi yalnız yeşil noktanın yakınından başlar (önceki çizgiden kayan parmak bunu doldurmasın)
  if (iz.i === 0 && d(iz.n[0]) > tol * 1.25) return false;
  let en = iz.i;
  const son = Math.min(iz.n.length - 1, iz.i + PENCERE);
  for (let j = iz.i; j <= son; j++) if (d(iz.n[j]) <= tol) en = j;
  if (en === iz.i) return false;
  iz.i = en;
  if (iz.i >= iz.n.length - 1 - SON_PAY) {
    iz.i = iz.n.length - 1;
    iz.bitti = true;
  }
  return true;
}

/** Parmak a'dan b'ye kaydı (hızlı harekette aradaki noktalar da denenir) */
export function izGecis(iz: Iz, a: Nokta | null, b: Nokta, tol: number): boolean {
  if (!a) return izIlerle(iz, b, tol);
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const k = Math.max(1, Math.ceil(L / 0.02));
  let oldu = false;
  for (let s = 1; s <= k; s++) oldu = izIlerle(iz, [a[0] + ((b[0] - a[0]) * s) / k, a[1] + ((b[1] - a[1]) * s) / k], tol) || oldu;
  return oldu;
}
