/**
 * Yandan yürüyen karakterlere özel yürüyüş ölçüleri (yoksa Mino'nunkiler; src/mino/yuruyus.ts → OLCU).
 * Yeni bir yan görünüş iskeleti (tavşan, ördek …) buraya bir şey eklenmeden de yürür; ince ayar gerekirse buraya.
 */
import type { YuruyusOlcu } from '../mino/yuruyus';

export const YANDAN_OLCULER: Record<string, Partial<YuruyusOlcu>> = {
  // köpek: kuyruk neşeyle hızlı sallanır, sarkık kulaklar biraz daha savrulur, patiler biraz daha kalkar (canlı yavru)
  kopek: { KUYRUK: 14, KUYRUK_SALLA: 7, KULAK: 12, KALDIR: 30, KOL_ON: 20, KOL_ARKA: 18 },
};
