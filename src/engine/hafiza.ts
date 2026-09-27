/**
 * Hafıza Oyunu (yan dal): ters çevrilmiş kart çiftleri. Ekrandan bağımsız kurallar (birim testli).
 */
import { karistir } from '../ui/dom';
import { albumKartlari, KARTLAR, refCoz, sorular } from './katalog';
import type { Yas } from './types';

/** Yaşa göre ızgara: 3 yaş 2×2, 4 yaş 2×3, 5 yaş 3×4, 6 yaş 4×4. */
export const HAFIZA_DUZEN: Record<Yas, { kolon: number; satir: number }> = {
  3: { kolon: 2, satir: 2 },
  4: { kolon: 2, satir: 3 },
  5: { kolon: 3, satir: 4 },
  6: { kolon: 4, satir: 4 },
};

export const ciftSayisi = (yas: Yas) => (HAFIZA_DUZEN[yas].kolon * HAFIZA_DUZEN[yas].satir) / 2;

/**
 * Bu yaş × temanın kart havuzu: önce o yaşın sorularında geçen tema kartları (yaşa uygun: 3 yaşta 1-3 sayıları gibi),
 * yetmezse temanın albüm kartları, en son temanın bütün kartları. `uygun`: görseli olmayanları elemek için.
 */
export function hafizaHavuzu(yas: Yas, tema: string, uygun: (id: string) => boolean = () => true): string[] {
  const temadaki = KARTLAR.filter((k) => k.tema === tema && uygun(k.id));
  const temaIdler = new Set(temadaki.map((k) => k.id));
  const havuz = new Set<string>();
  for (const s of sorular(yas, tema)) {
    for (const g of [...s.kartlar, ...(s.gosterge ?? [])]) {
      const id = refCoz(g).kart;
      if (id && temaIdler.has(id)) havuz.add(id);
    }
  }
  for (const k of albumKartlari(tema)) if (temaIdler.has(k.id)) havuz.add(k.id);
  for (const k of temadaki) havuz.add(k.id);
  return [...havuz];
}

/** Oyunda kullanılacak birbirinden farklı kartlar (çift sayısı kadar). Yaşa uygun kartlar önce denenir. */
export function hafizaKartlariSec(yas: Yas, tema: string, rnd: () => number = Math.random, uygun?: (id: string) => boolean): string[] {
  const n = ciftSayisi(yas);
  const havuz = hafizaHavuzu(yas, tema, uygun);
  // yaşa uygun olanlar (havuzun başı) karıştırılır; yetmezse gerisinden tamamlanır
  const yasaUygun = new Set<string>();
  for (const s of sorular(yas, tema)) for (const g of [...s.kartlar, ...(s.gosterge ?? [])]) {
    const id = refCoz(g).kart;
    if (id && havuz.includes(id)) yasaUygun.add(id);
  }
  const once = karistir([...yasaUygun], rnd);
  const sonra = karistir(havuz.filter((id) => !yasaUygun.has(id)), rnd);
  return [...once, ...sonra].slice(0, n);
}

/** Hata sayısına göre 1-3 yıldız (çocuğu cezalandırmadan: çift sayısı kadar hata hâlâ 3 yıldız). */
export function hafizaYildiz(hata: number, cift: number): 1 | 2 | 3 {
  if (hata <= cift) return 3;
  if (hata <= cift * 2.5) return 2;
  return 1;
}

/** Her kartı ikiler ve karıştırır. */
export function hafizaDestesi(idler: string[], rnd: () => number = Math.random): string[] {
  return karistir([...idler, ...idler], rnd);
}

export type CevirSonucu =
  | { tur: 'gecersiz' }
  | { tur: 'ilk'; i: number }
  | { tur: 'eslesti'; cift: [number, number]; id: string; bitti: boolean }
  | { tur: 'eslesmedi'; cift: [number, number] };

/** Oyunun durumu: hangi kartlar açık, hangileri bulundu. */
export class HafizaDurumu {
  readonly deste: string[];
  /** şu an açık duran (henüz karara bağlanmamış) kartlar */
  acik: number[] = [];
  readonly bulunan = new Set<number>();
  hamle = 0;
  hata = 0;

  constructor(deste: string[]) {
    this.deste = deste;
  }

  get ciftSayisi() {
    return this.deste.length / 2;
  }

  get bitti() {
    return this.bulunan.size === this.deste.length;
  }

  /** Eşleşmeyen iki kart açık duruyor mu (kapanmadan yeni kart çevrilemez). */
  get bekliyor() {
    return this.acik.length === 2;
  }

  cevir(i: number): CevirSonucu {
    if (i < 0 || i >= this.deste.length || this.bulunan.has(i) || this.acik.includes(i) || this.bekliyor) return { tur: 'gecersiz' };
    this.acik.push(i);
    if (this.acik.length === 1) return { tur: 'ilk', i };
    this.hamle++;
    const [a, b] = this.acik as [number, number];
    if (this.deste[a] === this.deste[b]) {
      this.bulunan.add(a).add(b);
      this.acik = [];
      return { tur: 'eslesti', cift: [a, b], id: this.deste[a], bitti: this.bitti };
    }
    this.hata++;
    return { tur: 'eslesmedi', cift: [a, b] };
  }

  /** Eşleşmeyen açık çifti kapatır. */
  kapat(): number[] {
    const k = this.acik;
    this.acik = [];
    return k;
  }
}
