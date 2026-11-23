// Matematik · yeni turların derinliği (yönetici kararı 21 Kasım öğleden sonra): her tur en az üç farklı geliş.
// Geliş = oyuncağın sırası bitip çocuk aynı oyuncağa yeniden başladığında (kayit.ts → sifirla, Tur.tekrar bir artar).
// 1. geliş kolay, 2. geliş orta, 3. ve sonraki gelişler zor; zor basamakta her gelişte havuzdan başka bir soru gelir.
// Aynı soru art arda iki gelişte gelmez. Akıllı tekrar defterindeki (akilli-tekrar.ts) zor sayıyı içeren soru öne alınır.
// DOM'suz: birim testleri buradan sınar.

export type Basamak = 0 | 1 | 2;
/** Gelişin basamağı: 0 kolay (1. geliş), 1 orta (2. geliş), 2 zor (3. geliş ve sonrası). */
export const basamak = (tekrar = 0): Basamak => (tekrar <= 0 ? 0 : tekrar === 1 ? 1 : 2);
/** Zor basamakta kaçıncı çeşit (3. gelişte 0, 4. gelişte 1, …); kolay ve orta basamakta 0. */
export const cesit = (tekrar = 0) => (tekrar < 2 ? 0 : tekrar - 2);
/** Yaşa göre seçilmiş havuzlar: [kolay, orta, zor]; zor havuzda en az iki soru. */
export type Havuzlar<T> = readonly [readonly T[], readonly T[], readonly T[]];
export const havuzu = <T>(h: Havuzlar<T>, tekrar = 0) => h[basamak(tekrar)];
const ayniSoru = <T>(a: T, b: T | undefined) => b !== undefined && JSON.stringify(a) === JSON.stringify(b);

/**
 * Havuzdan bu gelişin sorusu. Varsayılan: kolay ve orta basamakta ilk soru, zor basamakta sırayla. Defterde zorlanılan bir
 * sayı varsa onu içeren soru öne alınır. Önceki gelişin sorusu (`onceki`) art arda gelmez.
 */
export function havuzdanSec<T>(havuz: readonly T[], tekrar = 0, zor: readonly number[] = [], sayilari: (s: T) => readonly number[] = () => [], onceki?: T): T {
  if (!havuz.length) throw new Error('boş havuz');
  for (const n of zor) {
    const aday = havuz.find((s) => !ayniSoru(s, onceki) && sayilari(s).includes(n));
    if (aday !== undefined) return aday;
  }
  const v = basamak(tekrar) < 2 ? 0 : cesit(tekrar) % havuz.length;
  return ayniSoru(havuz[v], onceki) && havuz.length > 1 ? havuz[(v + 1) % havuz.length] : havuz[v];
}
/**
 * Bu gelişin sorusu: yaşın [kolay, orta, zor] havuzundan, defterdeki zor sayılar öne alınarak; bir önceki gelişin (defter
 * olmadan seçilen) sorusu art arda gelmez.
 */
export function gelisSorusu<T>(h: Havuzlar<T>, tekrar = 0, zor: readonly number[] = [], sayilari: (s: T) => readonly number[] = () => []): T {
  const onceki = tekrar > 0 ? gelisSorusu(h, tekrar - 1) : undefined;
  return havuzdanSec(havuzu(h, tekrar), tekrar, zor, sayilari, onceki);
}
