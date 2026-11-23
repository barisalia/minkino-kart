// Matematik · 5+ yaşın iki yeni turu (yönetici kararı 21 Kasım; eksik beceriler): DOM'suz kurallar.
// "Zıpzıp'ın Ritmik Zıplaması" (ritmik sayma: 2'şer, 5'er, 10'ar) ve "Babaanne'nin Eşit Paylaşımı" (eşit paylaştırma).
// Çizimler: Astra Paket M28, M29 (CLAUDE-ASTRA-MESAJLAR.md 21 Kasım 06:40). Sahneler main.ts'te.
import { gelisSorusu, type Havuzlar } from './derinlik';

// ----- M28 · Zıpzıp'ın Ritmik Zıplaması -----
export type RitimSirasi = { adim: 2 | 5 | 10; bas: number; taslar: number[]; gosterilen: number };
/**
 * Turun iki dizisi gelişe göre: 2'şer (0'dan ve 8'den) → 2'şer (6'dan) ve 5'er → 5'er (5'ten, 35'e kadar) ve 10'ar (0'dan ya da
 * 40'tan, 100'e kadar). Başlangıç taşının levhasında `bas`; her dizide altı taş, ilk ikisini Zıpzıp gösterir (Ceren sayar),
 * kalan dördünün sayısını çocuk seçer.
 */
export function ritimSiralari(tekrar = 0, zor: readonly number[] = []): RitimSirasi[] {
  const dizi = ([adim, bas]: readonly [2 | 5 | 10, number]): RitimSirasi => ({ adim, bas, taslar: Array.from({ length: 6 }, (_, i) => bas + adim * (i + 1)), gosterilen: 2 });
  const h: Havuzlar<readonly (readonly [2 | 5 | 10, number])[]> = [[[[2, 0], [2, 8]]], [[[2, 6], [5, 0]]], [[[5, 5], [10, 0]], [[10, 40], [5, 0]]]];
  return gelisSorusu(h, tekrar, zor, (x) => x.flatMap(([a, b]) => Array.from({ length: 6 }, (_, i) => b + a * (i + 1)))).map(dizi);
}
/** Üç taş seçeneği: doğru sayı, birer sayma yanılgısı (önceki + 1) ve bir adım fazlası; küçükten büyüğe. */
export function ritimSecenekleri(onceki: number, adim: number): number[] {
  const dogru = onceki + adim;
  return [...new Set([dogru, onceki + 1, dogru + adim])].sort((a, b) => a - b);
}
/** Ceren'in onlu sayı sözleri (sozler.json sırası): 30…100. 1–10 oyuncak sözlerinden, 11–20 11–20 dersinden. */
export const ONLU_SOZ: Record<number, number> = { 30: 222, 40: 223, 50: 224, 60: 225, 70: 226, 80: 227, 90: 228, 100: 229 };
/** "Yirmi beş" ve "otuz beş" ayrı kayıt ister (5'er dizisi 35'e kadar; sozler.json 235, 257). */
export const YIRMI_BES_SOZ = 235;
export const OTUZ_BES_SOZ = 257;
export const RITIM_SOZ = { iki: 217, bes: 218, on: 219, ipucu: 220, vardi: 221 } as const;

// ----- M29 · Babaanne'nin Eşit Paylaşımı -----
export type PaySorusu = { kurabiye: number; tabak: 2 | 3 };
/** Turun iki sorusu gelişe göre: 6 iki ve üç tabağa → 8 iki, 9 üç tabağa → 10 iki, 12 üç tabağa (ya da 12 iki, 9 üç tabağa). */
export const paySorulari = (tekrar = 0, zor: readonly number[] = []): PaySorusu[] => {
  const P = (kurabiye: number, tabak: 2 | 3): PaySorusu => ({ kurabiye, tabak });
  const h: Havuzlar<readonly PaySorusu[]> = [[[P(6, 2), P(6, 3)]], [[P(8, 2), P(9, 3)]], [[P(10, 2), P(12, 3)], [P(12, 2), P(9, 3)]]];
  return gelisSorusu(h, tekrar, zor, (x) => x.map((q) => q.kurabiye / q.tabak)).map((q) => ({ ...q }));
};
/** Paylaşım eşit mi (bütün kurabiyeler tabaklarda ve her tabakta aynı sayı). */
export const esitMi = (soru: PaySorusu, tabaklar: readonly number[]) =>
  tabaklar.length === soru.tabak && tabaklar.reduce((a, b) => a + b, 0) === soru.kurabiye && tabaklar.every((x) => x === tabaklar[0]);
/**
 * Terazinin duruşu: çubuğun açısı (derece; sağ ağırsa artı) ve orta tabağın inişi (üç tabakta; tabak boyunun oranı).
 * Kurabiye başına 4°, en çok 14°; orta tabak yanlardaki ortalamadan her fazla kurabiye için 6 px iner.
 */
export function teraziDurusu(tabaklar: readonly number[]): { aci: number; ortaInis: number } {
  const sol = tabaklar[0] ?? 0, sag = tabaklar[tabaklar.length - 1] ?? 0;
  const aci = Math.max(-14, Math.min(14, (sag - sol) * 4));
  const ortaInis = tabaklar.length === 3 ? Math.max(-24, Math.min(24, (tabaklar[1] - (sol + sag) / 2) * 6)) : 0;
  return { aci, ortaInis };
}
export const PAY_SOZ = { ikiTabak: 230, ucTabak: 231, egildi: 232, esit: 233, ayni: 234, afiyet: 140 } as const;
