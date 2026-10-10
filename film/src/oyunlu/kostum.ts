/**
 * Kostüm takası (OYUNLU-FORMAT §10.6): aynı dönme noktalarıyla parça görselleri değişir. Kostüm parçaları kitin
 * alt klasöründe (ör. assets/karakter/kino-yeni/pijama/, üreten ekip/illustrator/kino-pijama.cjs).
 */
import type { KuklaIskelet } from '../kukla';

export interface Kostum {
  klasor: string;
  /** değişen parçalar (görsel ve varsa .dolgu katmanı klasörden) */
  parcalar: string[];
  /** kostümde görünmeyenler (pijamada fular yok) */
  gizle?: string[];
}
export const PIJAMA: Kostum = {
  klasor: 'pijama',
  parcalar: ['govde', 'kol-ust-sag', 'kol-ust-sol', 'kol-ust-sag-dikis', 'kol-ust-sol-dikis', 'kalca', 'bacak-ust-sag', 'bacak-ust-sol', 'ayak-sag', 'ayak-sol'],
  gizle: ['fular'],
};

/** iskeletin kostümlü kopyası (asıl iskelet değişmez) */
export function kostumGiydir(iskelet: KuklaIskelet, k: Kostum): KuklaIskelet {
  const parcalar = { ...iskelet.parcalar };
  for (const ad of k.parcalar) {
    const p = parcalar[ad];
    if (!p) continue;
    parcalar[ad] = { ...p, resim: `${k.klasor}/${p.resim}`, ...(p.dolgu ? { dolgu: `${k.klasor}/${p.dolgu}` } : {}) };
  }
  return { ...iskelet, parcalar, cizim: [...iskelet.cizim], gizli: [...(iskelet.gizli ?? []), ...(k.gizle ?? [])] };
}
