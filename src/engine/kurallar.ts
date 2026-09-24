import type { SoruTipi, Yas } from './types';

/** Yaşa göre izin verilen soru tipleri. */
export const YAS_TIPLERI: Record<Yas, SoruTipi[]> = {
  3: ['BUL', 'ESLESTIR'],
  4: ['BUL', 'ESLESTIR', 'SAY', 'HAFIZA'],
  5: ['BUL', 'ESLESTIR', 'SAY', 'FARKLI', 'SIRADAKI', 'HAFIZA'],
  6: ['BUL', 'ESLESTIR', 'SAY', 'FARKLI', 'SIRADAKI', 'HAFIZA'],
};

/** Yaşa göre seçenek sayısı. */
export const SECENEK_SAYISI: Record<Yas, number> = { 3: 2, 4: 3, 5: 4, 6: 4 };

/** HAFIZA oyununda çift sayısı (kart sayısı = 2 × çift). */
export const HAFIZA_CIFT: Record<Yas, number> = { 3: 2, 4: 2, 5: 3, 6: 4 };

/** SAY sorularında en büyük sayı. */
export const SAY_UST: Record<Yas, number> = { 3: 3, 4: 5, 5: 10, 6: 10 };

export const TUR_SORU_SAYISI = 8;
export const TEMA_SORU_EN_AZ = 12;
