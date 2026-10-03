/**
 * Yandan yürüyen karakterlere özel yürüyüş ölçüleri (yoksa Mino'nunkiler; src/mino/yuruyus.ts → OLCU).
 * Yeni bir yan görünüş iskeleti (tavşan, ördek …) buraya bir şey eklenmeden de yürür; ince ayar gerekirse buraya.
 */
import type { YuruyusOlcu } from '../mino/yuruyus';

export const YANDAN_OLCULER: Record<string, Partial<YuruyusOlcu>> = {
  // köpek: kuyruk neşeyle hızlı sallanır, sarkık kulaklar biraz daha savrulur, patiler biraz daha kalkar (canlı yavru)
  kopek: { KUYRUK: 14, KUYRUK_SALLA: 7, KULAK: 12, KALDIR: 30, KOL_ON: 20, KOL_ARKA: 18 },
  // tavşan (Adobe önerisi): uzun bacaklı ve dik; küçük adım, çok sekme (hoplar gibi), kulaklar geriden ±8
  // ördek (Adobe önerisi): paytak, kuyruk geriden ±10
  ayi: { BACAK: 19, KALDIR: 16, KOL_ON: 8, KULAK: 6, COKUS: 12, YUKSELIS: 12 },
  maymun: { BACAK: 19, KUYRUK: 12, KUYRUK_SALLA: 8, KOL_ON: 14, KALDIR: 20, COKUS: 12, YUKSELIS: 12, KULAK: 4 },
  inek: { BACAK: 19, KALDIR: 14, KOL_ON: 10, KUYRUK: 12, KUYRUK_SALLA: 8, COKUS: 10, YUKSELIS: 10 },
  kus: { BACAK: 22, KALDIR: 12, KOL_ON: 6, KOL_ARKA: 6, KUYRUK: 8, COKUS: 8, YUKSELIS: 8 },
  ordek: { BACAK: 18, KALDIR: 18, KUYRUK: 10, COKUS: 12, YUKSELIS: 10 },
  tavsan: { BACAK: 19, KOL_ON: 12, KOL_ARKA: 10, KALDIR: 20, KULAK: 8, COKUS: 16, YUKSELIS: 18 },
};
