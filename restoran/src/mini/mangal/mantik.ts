/**
 * MANGAL · saf mantık (DOM yok, birim testli). ekip/senaryo/RESTORAN.md §8 M9, §3c (hiçbir şey kömür olmaz).
 *
 * Izgaradaki her şeyin iki yüzü var; alttaki yüz közün sıcaklığıyla pişer (üstteki biraz ılır). Maşayla çevrilir.
 *  - 3-4: bir çevirme yeter: köfte çevrildiyse iki yüzü birlikte pişmiş sayılır.
 *  - 5-6: iki yüz ayrı pişer; ürünün pişmesi iki yüzün azı. Yüz ızgarada iz alır; köfte ızgarada yer değiştirince
 *    iz yönü değişir, aynı yüze ikinci iz gelirse ÇAPRAZ iz (yıldız parlar).
 *  - Yelpaze közü canlandırır (ateş 0.35 → 1), pişme hızlanır; ateş kendiliğinden söner. Çok yelpazelenirse duman
 *    bulutu kalkar (komik: Kino'nun yüzü is olur); köfte yine en çok "çıtır" olur.
 * Pişme sırası çiğ → az → altın → çıtır (son durak).
 */
import type { Pisme, Yas } from '../arayuz';

export type MangalTur = 'kofte' | 'biber' | 'domates';
export const ATES_TABAN = 0.35;
export const ATES_SONUM = 0.09; // saniyede
export const ATES_DALGA = 0.17; // bir yelpaze dalgası
/** bir yüzün altında saniyede pişme (ateş tabanda): 3-4 daha hızlı */
export const PISME_HIZ: Record<Yas, number> = { kucuk: 0.3, buyuk: 0.24 };
export const PISME_EN_COK = 3.6;
/** iz bu pişmede belirir */
export const IZ_ESIK = 1.1;
/** duman bulutu: son 5 sn'de bu kadar dalga (ateş zaten tepedeyken) */
export const DUMAN_DALGA = 7;

export interface MangalParca {
  id: number;
  tur: MangalTur;
  /** iki yüzün pişmesi (0 … 3.6) */
  yuz: [number, number];
  /** hangi yüz altta (ızgarada) */
  alt: 0 | 1;
  /** yüzlerdeki izler: 0 yok, 1 tek yön, 2 çapraz */
  iz: [number, number];
  /** iz yönü (yer değiştirince döner): 0 ızgara çubuklarına paralel, 1 dik */
  izYon: 0 | 1;
  /** son yer değiştirmede alttaki yüzün pişmesi (ikinci iz için en az bu kadar daha pişmeli) */
  tasindi: number | null;
  cevrildi: number;
}

export const pismeAdi = (p: number): Pisme => (p < 0.8 ? 'cig' : p < 2 ? 'az' : p < 3 ? 'altin' : 'citir');
const SIRA: Pisme[] = ['cig', 'az', 'altin', 'citir'];

let sayac = 1;
export function yeniParca(tur: MangalTur): MangalParca {
  return { id: sayac++, tur, yuz: [0, 0], alt: 0, iz: [0, 0], izYon: 0, tasindi: null, cevrildi: 0 };
}

/** Ateşin pişirme çarpanı */
export const atesCarpani = (ates: number) => 0.55 + ates * 1.1;

/**
 * sn saniye pişir. Döner: yeni iz alan yüzler ve çapraz olanlar (görsel için).
 * 3-4'te köfte bir kez çevrildiyse iki yüz birlikte pişer.
 */
export function pisir(p: MangalParca, sn: number, ates: number, yas: Yas): { iz: boolean; capraz: boolean } {
  const hiz = PISME_HIZ[yas] * atesCarpani(ates) * (p.tur === 'kofte' ? 1 : 1.3);
  const a = p.alt;
  const u = (1 - a) as 0 | 1;
  const once = p.yuz[a];
  p.yuz[a] = Math.min(PISME_EN_COK, p.yuz[a] + hiz * sn);
  // üstteki yüz biraz ılır (çiğ kalmaz ama altın da olmaz)
  p.yuz[u] = Math.min(Math.max(p.yuz[u], 0.6), p.yuz[u] + hiz * sn * 0.12);
  if (yas === 'kucuk' && p.cevrildi > 0) p.yuz[u] = Math.max(p.yuz[u], p.yuz[a]);
  let iz = false;
  let capraz = false;
  if (once < IZ_ESIK && p.yuz[a] >= IZ_ESIK && p.iz[a] === 0) {
    p.iz[a] = 1;
    iz = true;
  }
  if (p.tasindi !== null && p.iz[a] === 1 && p.yuz[a] >= p.tasindi + 0.6) {
    p.iz[a] = 2;
    p.tasindi = null;
    capraz = true;
    iz = true;
  }
  return { iz, capraz };
}

/** Maşayla çevir */
export function cevir(p: MangalParca) {
  p.alt = (1 - p.alt) as 0 | 1;
  p.cevrildi++;
  p.tasindi = null;
}

/** Izgarada yer değiştir: alttaki yüz izliyse ikinci iz dik gelir (çapraz) */
export function tasi(p: MangalParca) {
  p.izYon = (1 - p.izYon) as 0 | 1;
  if (p.iz[p.alt] === 1) p.tasindi = p.yuz[p.alt];
}

/** Üstte görünen yüzün pişmesi */
export const ustYuz = (p: MangalParca) => p.yuz[(1 - p.alt) as 0 | 1];

/** Ürünün pişmesi: hiç çevrilmediyse en çok "az" (üstü pembe); 3-4 çevrildiyse alttaki; 5-6 iki yüzün azı */
export function parcaPisme(p: MangalParca, yas: Yas): Pisme {
  if (!p.cevrildi) return SIRA[Math.min(1, SIRA.indexOf(pismeAdi(Math.max(p.yuz[0], p.yuz[1]))))];
  if (yas === 'kucuk') return pismeAdi(Math.max(p.yuz[0], p.yuz[1]));
  return pismeAdi(Math.min(p.yuz[0], p.yuz[1]));
}

/** Bir yemeğin pişmesi: köftelerin en az pişmişi (köfte yoksa öbürleri) */
export function toplamPisme(ps: MangalParca[], yas: Yas): Pisme | undefined {
  const k = ps.filter((p) => p.tur === 'kofte');
  const l = k.length ? k : ps;
  if (!l.length) return undefined;
  return SIRA[Math.min(...l.map((p) => SIRA.indexOf(parcaPisme(p, yas))))];
}

/** Doğal son: her köfte altın ya da çıtır (en az bir köfte) */
export function hazir(ps: MangalParca[], yas: Yas): boolean {
  const k = ps.filter((p) => p.tur === 'kofte');
  return k.length > 0 && k.every((p) => SIRA.indexOf(parcaPisme(p, yas)) >= 2);
}

/** Ateş: zamanla söner, tabanın altına inmez */
export const atesSon = (ates: number, sn: number) => Math.max(ATES_TABAN, ates - ATES_SONUM * sn);

/** Yelpaze dalgası: ateş artar. dalgalar: son dalgaların zamanları (ms). Duman bulutu kalkar mı? */
export function yelpazele(ates: number, dalgalar: number[], simdi: number): { ates: number; duman: boolean } {
  const yeni = Math.min(1, ates + ATES_DALGA);
  const son = dalgalar.filter((t) => simdi - t < 5000).length;
  return { ates: yeni, duman: ates >= 0.95 && son >= DUMAN_DALGA };
}
