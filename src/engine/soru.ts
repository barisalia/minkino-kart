import { refCoz } from './katalog';
import type { Soru } from './types';

/** Doğru seçeneğin sırası (-1: yok). */
export function dogruIndeks(s: Soru): number {
  if (typeof s.dogru === 'number') return s.dogru >= 0 && s.dogru < s.kartlar.length ? s.dogru : -1;
  return s.kartlar.findIndex((g) => refCoz(g).kart === s.dogru);
}

export function cevapDogruMu(s: Soru, secilen: number): boolean {
  return secilen === dogruIndeks(s);
}
