// Matematik · "Mila ile Pamuk'un Eş Kartları" (Fener tiyatrosu; yönetici, 22 Kasım sabahı: 2–3 yaş yolunda içeriği
// en az kalan ikinci oyuncak, Kino ailesinden başka kadro). Görsel bellek ve eşleme: kartlar kapalı, çocuk iki karta dokunur,
// aynı resmi bulursa eş açık kalır. Sonda eşler ikişer sayılır (4+). 2–3 yaşta 4 kart ve önce kısa bir bakış; 4 yaşta 6,
// 5+ yaşta 8 kart. DOM'suz kurallar. Çizimler: Astra Paket M36 (CLAUDE-ASTRA-MESAJLAR.md 22 Kasım). Sahne main.ts → esKartlar.
import type { Yol } from './tur-sirasi';
import { gelisSorusu, type Havuzlar } from './derinlik';

export const RESIMLER = ['tren', 'davul', 'gemi', 'semsiye', 'ucurtma', 'kardan-adam'] as const;
export type Resim = (typeof RESIMLER)[number];
export const RESIM_ADI: Record<Resim, string> = { tren: 'tren', davul: 'davul', gemi: 'gemi', semsiye: 'şemsiye', ucurtma: 'uçurtma', 'kardan-adam': 'kardan adam' };
export type EsTuru = { resimler: Resim[]; dizilis: Resim[]; onizleme: boolean };
/** Kartların masadaki sırası: tohumlu karıştırma (aynı gelişte hep aynı; yarıda kalan tur aynı dizilişle sürer). */
function karistir<T>(dizi: readonly T[], tohum: number): T[] {
  let s = 4801 + tohum * 7919;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const k = [...dizi];
  for (let i = k.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [k[i], k[j]] = [k[j], k[i]]; }
  return k;
}
/** Bir eşin iki kartı yan yana gelmesin (ilk bakışta bulunmasın). */
const yanYanaYok = (d: readonly Resim[], sutun: number) => d.every((x, i) => (i % sutun === sutun - 1 || d[i + 1] !== x) && d[i + sutun] !== x);
export const sutunSayisi = (kart: number) => (kart === 4 ? 2 : kart === 6 ? 3 : 4);
/**
 * Gelişe göre resimler: 2–3 yaş iki eş (4 kart), 4 yaş üç eş (6 kart), 5+ dört eş (8 kart); zor basamakta her gelişte başka
 * takım. 2–3 yaşta kartlar önce bir an açık gösterilir.
 */
export function esTuru(yol: Yol, tekrar = 0): EsTuru {
  const h: Havuzlar<readonly Resim[]> = yol === 'minik'
    ? [[['tren', 'davul']], [['gemi', 'semsiye']], [['ucurtma', 'kardan-adam'], ['tren', 'gemi']]]
    : yol === 'dort'
      ? [[['tren', 'davul', 'gemi']], [['semsiye', 'ucurtma', 'kardan-adam']], [['davul', 'gemi', 'semsiye'], ['kardan-adam', 'tren', 'ucurtma']]]
      : [[['tren', 'davul', 'gemi', 'semsiye']], [['ucurtma', 'kardan-adam', 'tren', 'gemi']], [['semsiye', 'davul', 'kardan-adam', 'ucurtma'], ['gemi', 'ucurtma', 'davul', 'tren']]];
  const resimler = [...gelisSorusu(h, tekrar)];
  const kartlar = resimler.flatMap((r) => [r, r]), sutun = sutunSayisi(kartlar.length);
  let dizilis = karistir(kartlar, tekrar * 31 + kartlar.length);
  for (let d = 1; !yanYanaYok(dizilis, sutun) && d < 50; d++) dizilis = karistir(kartlar, tekrar * 31 + kartlar.length + d * 101);
  return { resimler, dizilis, onizleme: yol === 'minik' };
}
/** İki açık kart eş mi. */
export const esMi = (d: readonly Resim[], a: number, b: number) => a !== b && d[a] === d[b];

/**
 * Fon `kis-penceresi` (1672 × 941): sıcak bir oda köşesi, kar yağan büyük pencere, ortada yuvarlak halı. Kartlar halının
 * üstünde (kart 150 × 205, ara 30); Mila solda, Pamuk sağda halıda oturur (taban y 900).
 */
export const KART = { w: 150, h: 205, ara: 30, ortaX: 836, ustY: 400 } as const;
export function kartYeri(i: number, kart: number) {
  const sutun = sutunSayisi(kart), satir = Math.ceil(kart / sutun);
  const enT = sutun * KART.w + (sutun - 1) * KART.ara, boyT = satir * KART.h + (satir - 1) * KART.ara;
  return { x: KART.ortaX - enT / 2 + (i % sutun) * (KART.w + KART.ara), y: KART.ustY + (440 - boyT) / 2 + Math.floor(i / sutun) * (KART.h + KART.ara) };
}
export const DOST = { mila: { x: 90, w: 400, h: 500 }, pamuk: { x: 1250, w: 360, h: 400 }, taban: 900 } as const;

export const ES_SOZ = {
  giris: 336, bak: 337, cevir: 338,
  es: { tren: 339, davul: 340, gemi: 341, semsiye: 342, ucurtma: 343, 'kardan-adam': 344 } as Record<Resim, number>,
  degil: 345, say: 346, bitti: 347,
  /** İkişer sayma: "İki. Dört. Altı. Sekiz." (sözler 33, 35, 37, 39). */
  sayi: { 2: 33, 4: 35, 6: 37, 8: 39 } as Record<number, number>,
} as const;
/** Astra M36 (`assets/matematik/es-kartlar/`): oda, kartın arkası ve önü, altı resim, Mila ve Pamuk'un ikişer pozu. */
export const ES_CIZIMLERI = ['kis-penceresi', 'kart-arka', 'kart-on', ...RESIMLER.map((r) => 'resim-' + r), 'mila-kart-0', 'mila-kart-1', 'pamuk-kart-0', 'pamuk-kart-1'] as const;
