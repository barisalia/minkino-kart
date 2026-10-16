/**
 * Pati Dükkânı v2: mutluluk (saf; tests/unit/pati-ekonomi.test.ts).
 *
 * Her hayvanın 3 kalbi var. Kalp hiç düşmez: kalpler "bu hayvan için yaptıkların"dır (PATI-V2 §5c). Üç kalp dolunca
 * hayvan dans eder ve jeton bırakır; kalpler sıfırlanır, hayvan 30 sn dinlenir (bu sürede kalp dolmaz, okşanınca yine
 * mırlar). Kalp kaynakları:
 *  - paket 1: minderini ilk kez bulması, yavaş okşama
 *  - paket 2 (kanca): Bakım Odası tepkileri (sever / olur), ilk kez bulunan ★
 *  - paket 3 (kanca): ziyaretçi
 */
import { KALP_SAYISI, V2 } from './katalog';
import { kazanc } from './ekonomi';
import type { Yas } from './ihtiyac';
import type { SahipHayvan } from './kayit';

export type KalpKaynagi = 'minder' | 'oksama' | 'sever' | 'olur' | 'ilk-sever' | 'ziyaret';
export const DINLENME_MS = V2.dans_dinlenme_sn * 1000;

export const dinleniyor = (h: SahipHayvan, simdi: number, dinlenme = DINLENME_MS) => h.sonDans > 0 && simdi - h.sonDans < dinlenme;

/** Kalp ekler. eklendi: kalp doldu mu; dans: üçüncü kalp doldu, dans ve jeton zamanı */
export function kalpEkle(h: SahipHayvan, simdi: number, dinlenme = DINLENME_MS): { eklendi: boolean; dans: boolean } {
  if (dinleniyor(h, simdi, dinlenme) || h.kalp >= KALP_SAYISI) return { eklendi: false, dans: false };
  h.kalp += 1;
  return { eklendi: true, dans: h.kalp >= KALP_SAYISI };
}

/** Dans bitti: kalpler sıfırlanır, dinlenme başlar; dönen: bırakılacak jeton */
export function dansBitti(h: SahipHayvan, simdi: number, yas: Yas): number {
  h.kalp = 0;
  h.dans += 1;
  h.sonDans = simdi;
  return kazanc('dans', yas);
}
