/**
 * MEYVE ŞİŞ · saf mantık (DOM yok, birim testli). ekip/senaryo/RESTORAN.md §8 M13 (v1.1).
 *
 * Tahtada şişler; meyve şişin ucuna götürülünce "tık" diye geçer, dibe doğru kayar. Sıra tamamen çocuğun.
 * 5-6 özel istek: ÖRÜNTÜ (çilek-muz-çilek-muz-?): tamamlanınca şiş parlar, müşteri bayılır; bozuk örüntü de yenir.
 * Dolu şişe bir meyve daha gelirse en dipteki "pıt" diye fırlar (komik: Mino yakalar, yer).
 */
import type { Malzeme, Yas, YemekOzelligi } from '../arayuz';

export type Meyve = 'cilek' | 'muz' | 'kavun' | 'uzum';
export const MEYVELER: readonly Meyve[] = ['cilek', 'muz', 'kavun', 'uzum'];
export const SIS_SAYI: Record<Yas, number> = { kucuk: 2, buyuk: 3 };
export const YER_SAYI: Record<Yas, number> = { kucuk: 4, buyuk: 5 };

export interface Sis {
  meyveler: Meyve[];
  bal: number;
}

/** Şişe meyve tak: dolu şişte en dipteki fırlar (döner) */
export function tak(s: Sis, m: Meyve, yas: Yas): { firlayan: Meyve | null } {
  s.meyveler.push(m);
  if (s.meyveler.length > YER_SAYI[yas]) return { firlayan: s.meyveler.shift() ?? null };
  return { firlayan: null };
}

export const dolu = (s: Sis, yas: Yas) => s.meyveler.length >= YER_SAYI[yas];

/** Dizi bir örüntüyü tamamlıyor mu (örüntü: tam dizi; '?' yerine ne gelmeli) */
export function oruntuTamam(dizi: readonly string[], oruntu: readonly string[]): boolean {
  if (dizi.length < oruntu.length) return false;
  return oruntu.every((m, i) => dizi[i] === m);
}

/** Kendiliğinden örüntü: en az 4 meyve, iki tür sırayla (ABAB…) */
export function sirayla(dizi: readonly string[]): boolean {
  if (dizi.length < 4) return false;
  const [a, b] = dizi;
  if (a === b) return false;
  return dizi.every((m, i) => m === (i % 2 ? b : a));
}

/** 5-6 örüntü isteği: ABAB + soru (son meyve çocuğun) */
export function oruntuUret(tohum: number): Meyve[] {
  const a = MEYVELER[tohum % 4];
  const b = MEYVELER[(tohum + 1 + (tohum % 3)) % 4] === a ? MEYVELER[(tohum + 2) % 4] : MEYVELER[(tohum + 1 + (tohum % 3)) % 4];
  return [a, b, a, b, a];
}

export function sisOzelligi(sisler: Sis[]): YemekOzelligi {
  const malzemeler: YemekOzelligi['malzemeler'] = {};
  let toplam = 0;
  let bal = 0;
  for (const s of sisler) {
    for (const m of s.meyveler) {
      malzemeler[m as Malzeme] = { adet: (malzemeler[m as Malzeme]?.adet ?? 0) + 1, kesim: m === 'uzum' ? 'butun' : m === 'kavun' ? 'kup' : 'dilim' };
      toplam++;
    }
    bal += s.bal;
  }
  if (bal) malzemeler.bal = { adet: Math.min(3, bal) };
  return {
    malzemeler,
    tatli: Math.min(3, (bal ? 1 + Math.min(2, bal) : 0) + (toplam ? 1 : 0)),
    sicak: false,
    porsiyon: toplam <= 4 ? 'az' : toplam >= 12 ? 'kocaman' : 'normal',
  };
}
