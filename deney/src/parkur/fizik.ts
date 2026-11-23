// Deneyler · Zincirleme Top Parkuru: bölüm 1'in (Deney-Y1) eski arayüzü. Fizik artık bölümlerden bağımsız motorda (motor.ts);
// bu dosya ilk bölümün testleri ve eski çağrılar için ince bir köprüdür.
import { bolum } from './bolumler';
import { DominoSirasi, oynatBolum, type Olay } from './motor';

export type { Olay };
export { G, G_DOMINO } from './motor';
const b1 = bolum(1);
/** Son domino zilin düğmesine bu açıda değer. */
export const ZIL_ACISI = new DominoSirasi(b1.dominolar, b1.final).sonAci;

/** Bölüm 1'i sonuna kadar oynatır (testler ve denetim için): sonuç, olaylar ve süre. */
export function oynat(yerlesik: Iterable<string>, enCok = 12) {
  return oynatBolum(bolum(1), yerlesik, enCok);
}
