// Matematik · okul öncesinin eksik üç konusu (yönetici kararı 21 Kasım sabah): DOM'suz kurallar.
// "Roket Geri Sayımı" (geriye sayma; Sayı masası, 4 ve 5+), "Kelebeğin Kanadı" (simetri; Şekil evi, 4 ve 5+),
// "Meyve Grafiği" (veri: say, sütuna diz, karşılaştır; Ölçü tezgâhı, 5+). Çizimler: Astra Paket M30–M32
// (CLAUDE-ASTRA-MESAJLAR.md 21 Kasım 07:51). Sahneler main.ts'te.
import type { Yol } from './tur-sirasi';
import { gelisSorusu, type Havuzlar } from './derinlik';

// ----- M30 · Roket Geri Sayımı -----
export type GeriSayim = {
  /** Çocuğun panoya dizdiği sayılar, büyükten küçüğe. */
  dizilen: number[];
  /** Ceren'in sonra kendisi saydığı sayılar (20'den sayarken 10…1); sıfırda roket kalkar. */
  ceren: number[];
};
const azalan = (bas: number, son: number) => Array.from({ length: bas - son + 1 }, (_, i) => bas - i);
/** Bir kalkış: çocuk en çok on blok dizer (bas…), gerisini (10'un altı) Ceren'le birlikte sayarlar. */
const sayim = (bas: number): GeriSayim => ({ dizilen: azalan(bas, Math.max(1, bas - 9)), ceren: bas > 10 ? azalan(bas - 10, 1) : [] });
/**
 * Turun iki kalkışı gelişe göre: 4 yaş 5 ve 6'dan → 7 ve 8'den → 10 ve 9'dan (ya da 8 ve 7'den); 5+ 10 ve 13'ten → 15 ve 20'den
 * → 19 ve 17'den (ya da 20 ve 16'dan).
 */
export function geriSayimlar(yol: Yol, tekrar = 0, zor: readonly number[] = []): GeriSayim[] {
  const h: Havuzlar<readonly number[]> = yol === 'bes' ? [[[10, 13]], [[15, 20]], [[19, 17], [20, 16]]] : [[[5, 6]], [[7, 8]], [[10, 9], [8, 7]]];
  return gelisSorusu(h, tekrar, zor, (x) => x.flatMap((b) => azalan(b, 1).slice(0, 10))).map(sayim);
}
/** Blokların karışık sırası (yeniden oynayışta değişir; hiçbir zaman büyükten küçüğe dizili gelmez). */
export function karisikBloklar(dizi: readonly number[], tekrar = 0): number[] {
  // Tohumlu karıştırma (Park–Miller): aynı yeniden oynayışta aynı sıra; en büyük blok hiçbir zaman ilk yerde değil.
  let s = 7919 + tekrar * 104729 + dizi.length * 31;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const k = [...dizi];
  for (let i = k.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [k[i], k[j]] = [k[j], k[i]];
  }
  if (k.length > 1 && k[0] === dizi[0]) k.push(k.shift()!);
  return k;
}
/** Sıradaki doğru blok: dizilmemişlerin en büyüğü. */
export const siradakiBlok = (dizi: readonly number[], yerlesen: number) => dizi[yerlesen];
export const ROKET_SOZ = { yonerge: 236, ipucu: 237, kalkis: 238, ikinci: 239, birlikte: 240, bitti: 241, sifir: 31 } as const;

// ----- M31 · Kelebeğin Kanadı -----
export type BenekRengi = 'mavi' | 'turuncu';
/**
 * Kanattaki benek yerleri (Astra'nın `kanat-sol` tuvalinde, 400 × 560; beneğin merkezi). Üst lob büyük, alt lob küçük;
 * gövdeye bağlandığı kenar x 395. Sağ kanat sol kanadın aynası: x → 400 − x.
 * Teslim edilen kanatta (22 Kasım) her yer kanadın kenarına en az 53 px uzak (benek yarıçapı 45); yer 1 üst lobun
 * girintisinden taşmasın diye 105'ten 140'a alındı.
 */
export const BENEK_YERI: readonly { x: number; y: number }[] = [
  { x: 200, y: 95 }, { x: 140, y: 185 }, { x: 260, y: 200 }, { x: 175, y: 290 }, { x: 300, y: 405 }, { x: 245, y: 485 },
];
export const aynaX = (x: number) => 400 - x;
export type Benek = { yer: number; renk: BenekRengi };
/** Kısa yazım: "1m,4t" → benekler (m mavi, t turuncu). */
const desen = (y: string): Benek[] => y.split(',').map((b) => ({ yer: Number(b[0]), renk: b[1] === 'm' ? 'mavi' : 'turuncu' }));
/**
 * Turun iki kelebeği gelişe göre: 4 yaş 2 ve 3 benek tek renk → başka desenler → 4 benek tek renk ve 3 benek iki renk;
 * 5+ 3 ve 4 benek iki renk → 4 ve 5 → başka 4 ve 5 benek (iki renk).
 */
export function kelebekDesenleri(yol: Yol, tekrar = 0): Benek[][] {
  const h: Havuzlar<readonly string[]> = yol === 'bes'
    ? [[['1m,3t,4m', '0t,2m,3m,5t']], [['0m,2t,3m,4t', '0t,1m,2m,4t,5t']], [['1t,2m,3m,5t', '0m,1t,3t,4m,5m'], ['0t,1m,4m,5t', '1m,2t,3m,4t,5t']]]
    : [[['1m,4m', '0t,2t,5t']], [['2t,4t', '0m,3m,5m']], [['0m,2m,3m,5m', '1t,2m,4t'], ['1t,3t,4t,5t', '0m,3t,5m']]];
  return gelisSorusu(h, tekrar).map(desen);
}
/** Sağ kanattaki bir yere bir renk konabilir mi (sol kanatta o yerin aynasında aynı renk benek var ve yer boş). */
export const benekUyar = (desen: readonly Benek[], yer: number, renk: BenekRengi, konan: ReadonlySet<number>) =>
  !konan.has(yer) && desen.some((b) => b.yer === yer && b.renk === renk);
/** Desende kaç renk var (iki renkte önce renk seçilir). */
export const renkSayisi = (desen: readonly Benek[]) => new Set(desen.map((b) => b.renk)).size;
export const KELEBEK_SOZ = { yonerge: 242, ipucu: 243, ikiRenk: 244, uctu: 245, yeni: 246 } as const;

// ----- M32 · Meyve Grafiği -----
export type Meyve = 'elma' | 'armut' | 'muz';
export const MEYVELER: readonly Meyve[] = ['elma', 'armut', 'muz'];
export type GrafikVerisi = { sayilar: Record<Meyve, number>; fazla: [Meyve, Meyve] };
/**
 * Turun verisi gelişe göre (tek veri; tur kısa kalsın): 9 meyve, 1 fazla → 12 meyve, 2 fazla → 13 meyve, 3 ya da 4 fazla.
 * En çok, en az ve "kaç fazla" sorusunun tek cevabı var.
 */
export function grafikVerisi(tekrar = 0, zor: readonly number[] = []): GrafikVerisi {
  const V = (elma: number, armut: number, muz: number, fazla: [Meyve, Meyve]): GrafikVerisi => ({ sayilar: { elma, armut, muz }, fazla });
  const h: Havuzlar<GrafikVerisi> = [[V(3, 2, 4, ['elma', 'armut'])], [V(5, 3, 4, ['elma', 'armut'])], [V(4, 6, 3, ['armut', 'muz']), V(6, 2, 5, ['elma', 'armut'])]];
  const v = gelisSorusu(h, tekrar, zor, (x) => [kacFazla(x)]);
  return { sayilar: { ...v.sayilar }, fazla: [v.fazla[0], v.fazla[1]] };
}
/** Grafik panosunda bir sütun en çok kaç meyve alır (Astra'nın `grafik-panosu` şeridi 540 px, meyve yeri 90 px). */
export const SUTUN_BOYU = 6;
export const enCok = (s: Record<Meyve, number>) => MEYVELER.reduce((a, b) => (s[b] > s[a] ? b : a));
export const enAz = (s: Record<Meyve, number>) => MEYVELER.reduce((a, b) => (s[b] < s[a] ? b : a));
export const kacFazla = (v: GrafikVerisi) => v.sayilar[v.fazla[0]] - v.sayilar[v.fazla[1]];
/** "Kaç fazla" için üç sayı kartı: doğru, bir eksiği ve bir fazlası (en az 1), küçükten büyüğe. */
export const fazlaSecenekleri = (dogru: number) => (dogru > 1 ? [dogru - 1, dogru, dogru + 1] : [1, 2, 3]);
/** Sepetteki meyvelerin karışık sırası (sütun sütun değil). */
export function sepetSirasi(s: Record<Meyve, number>): Meyve[] {
  const kalan = { ...s }, sira: Meyve[] = [];
  for (let i = 0; sira.length < s.elma + s.armut + s.muz; i++) {
    const m = MEYVELER[i % 3];
    if (kalan[m] > 0) { sira.push(m); kalan[m]--; }
  }
  return sira;
}
export const GRAFIK_SOZ = {
  yonerge: 247, enCok: 248, enAz: 249, elmaArmut: 250, armutMuz: 251, ipucuCok: 252, ipucuAz: 253, ipucuFazla: 254, dogru: 255, bitti: 256,
} as const;
export const FAZLA_SORUSU: Record<string, number> = { 'elma-armut': GRAFIK_SOZ.elmaArmut, 'armut-muz': GRAFIK_SOZ.armutMuz };
