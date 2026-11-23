import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import sozler from '../../matematik/src/ders-olcu-sozler.json';
import {
  GEREKLI_CIZIMLER, GEREKLI_SESLER, KAVRAMLAR, PLAN, TUVAL, bitisSesi, dersKavramlari, dizilis, dogruSesi, kaydiCoz, siradaki,
} from '../../matematik/src/ders-olcu-mantik';

describe('Ceren dersi 3 · Karşılaştır ve ölç', () => {
  it('yaşa göre: 2–3 yaşta büyük/küçük, uzun/kısa, çok/az; 4 yaştan sonra ağır/hafif de', () => {
    expect(dersKavramlari(true)).toEqual(['buyuk-kucuk', 'uzun-kisa', 'cok-az']);
    expect(dersKavramlari(false)).toEqual(KAVRAMLAR);
    expect(bitisSesi(dersKavramlari(true))).toBe('bitis_3');
    expect(bitisSesi(dersKavramlari(false))).toBe('bitis_4');
  });

  it('her kavramın tanıtımı ve soruları: doğru cevap çiftte, sorudan soruya yer değiştirir; her nesne Astra brief’inde', () => {
    const yerler: number[] = [];
    for (const k of KAVRAMLAR) {
      const p = PLAN[k];
      expect(p.sorular.length).toBeGreaterThanOrEqual(1);
      for (const ad of [...p.tanit.cift, ...p.sorular.flatMap((s) => s.cift)]) expect(TUVAL[ad], ad).toBeDefined();
      for (const s of p.sorular) {
        expect(s.cift).toContain(s.dogru);
        expect(new Set(s.cift.map((a) => TUVAL[a])).size).toBe(1);
        yerler.push(s.cift.indexOf(s.dogru));
      }
    }
    // Doğru cevap hep aynı tarafta değil; art arda iki soruda aynı yerde en çok bir kez.
    expect(new Set(yerler).size).toBe(2);
    expect(dizilis(['kalem-uzun', 'kalem-kisa'])).toBe('ust-uste');
    expect(dizilis(['sapka-kucuk', 'sapka-buyuk'])).toBe('yan-yana');
  });

  it('bütün sözler kayıtlı ve okunuyor; övgüler sırayla döner', () => {
    const okunan = new Set<string>(['giris', 'devam', 'ipucu', 'hatira', 'bitis_3', 'bitis_4', 'dogru_1', 'dogru_2', 'dogru_3']);
    for (const k of KAVRAMLAR) { PLAN[k].tanit.sozler.forEach((s) => okunan.add(s.soz)); PLAN[k].sorular.forEach((s) => okunan.add(s.soz)); }
    expect([...okunan].sort()).toEqual(Object.keys(sozler).sort());
    for (const id of GEREKLI_SESLER) expect(existsSync('assets/matematik/ders/olcu/ses/' + id + '.mp3'), id).toBe(true);
    expect([0, 1, 2, 3].map(dogruSesi)).toEqual(['dogru_1', 'dogru_2', 'dogru_3', 'dogru_1']);
  });

  it('kapı: M4’ün 21 çizimi tamam değilse ders uygulamada açılmaz', () => {
    expect(GEREKLI_CIZIMLER).toHaveLength(21);
    expect(new Set(GEREKLI_CIZIMLER).size).toBe(21);
    expect(GEREKLI_CIZIMLER).toEqual(expect.arrayContaining(['oyuncak-odasi', 'ceren-buyuk', 'ceren-kucuk', 'ceren-tart', 'hatira-mezura', 'tuy', 'karpuz']));
  });

  it('kayıt: yarım kayıt sürer; 2–3 yaşta biten ders 4 yaşta ağır/hafif ile açılır', () => {
    expect(kaydiCoz(null).simdi).toBe('buyuk-kucuk');
    const minik = JSON.stringify({ biten: ['buyuk-kucuk', 'uzun-kisa', 'cok-az'], simdi: 'cok-az', tanitildi: true, bitti: true });
    expect(kaydiCoz(minik, dersKavramlari(true)).bitti).toBe(true);
    const dort = kaydiCoz(minik, dersKavramlari(false));
    expect(dort.bitti).toBe(false);
    expect(siradaki(dort, dersKavramlari(false))).toBe('agir-hafif');
  });
});
