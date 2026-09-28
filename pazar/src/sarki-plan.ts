/**
 * Pazar şarkısının tablosu ve sayım planı (DOM'suz, birim testli: tests/unit/sarki-kayit.test.ts). Kayıt:
 * assets/muzik/pazar.json (Gemini). Oyun sözde sayılan meyveleri kaydın hece zamanlarıyla zıplatır (sarki.ts).
 */
import SARKI_JSON from '../../assets/muzik/pazar.json';
import { heceBul, sarkiTablosu, type SarkiJson, type SarkiTablosu } from '../../src/audio/sarki-kayit';

export const PAZAR_SARKI = sarkiTablosu(SARKI_JSON as SarkiJson);
/** Sözler (Barış onaylı; heceleri kayıttaki hecelerle eşleşir, tests/unit/sarki-kayit.test.ts) */
export const PAZAR_SOZ = ['Bir elma, iki armut', 'Üç çilek, dört de üzüm', 'Mino’nun pazarı', 'Hadi gel, say bizimle'];

/** Sözde sayılan meyveler: sayı sözü ve meyvenin adının ilk hecesi (satır, hece) */
export const SAYILAN = [
  { meyve: 'elma', adet: 1, sayi: [0, 'Bir'], ad: [0, 'el'] },
  { meyve: 'armut', adet: 2, sayi: [0, 'i'], ad: [0, 'ar'] },
  { meyve: 'cilek', adet: 3, sayi: [1, 'Üç'], ad: [1, 'çi'] },
  { meyve: 'uzum', adet: 4, sayi: [1, 'dört'], ad: [1, 'ü'] },
] as const;

/** Her sayılan meyve için tablodaki hece sıraları (sayı sözü, meyve adı) ve adın bittiği an (ms) */
export function sayimPlani(t: SarkiTablosu) {
  return SAYILAN.map((s, i) => {
    const sayi = heceBul(t, s.sayi[0], s.sayi[1]);
    const ad = heceBul(t, s.ad[0], s.ad[1]);
    const sonraki = SAYILAN[i + 1];
    const bitis = sonraki ? t.heceler[heceBul(t, sonraki.sayi[0], sonraki.sayi[1])]?.basMs : undefined;
    const satirSonu = t.satirlar[s.ad[0]][t.satirlar[s.ad[0]].length - 1].bitMs;
    const adBas = t.heceler[ad]?.basMs ?? 0;
    return { ...s, sayiHece: sayi, adHece: ad, sureMs: Math.max(200, (bitis && bitis > adBas ? bitis : satirSonu) - adBas) };
  });
}
