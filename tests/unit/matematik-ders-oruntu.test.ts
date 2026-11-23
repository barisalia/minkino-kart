import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import sozler from '../../matematik/src/ders-oruntu-sozler.json';
import {
  CALGILAR, ETKINLIKLER, GEREKLI_CIZIMLER, GEREKLI_SESLER, YUVA, beklenen, desen, dersEtkinlikleri, dogruSesi, gorunen, kaydiCoz, kendiDizisi, siradaki,
  type OYol,
} from '../../matematik/src/ders-oruntu-mantik';

const YOLLAR: OYol[] = ['minik', 'dort', 'bes'];

describe('Ceren dersi 4 · Örüntü', () => {
  it('yaşa göre: 2–3 yaşta renk, şekil, ses; 4 yaştan sonra kendi örüntüsü de', () => {
    expect(dersEtkinlikleri('minik')).toEqual(['renk', 'sekil', 'ses']);
    expect(dersEtkinlikleri('dort')).toEqual(ETKINLIKLER);
    expect(dersEtkinlikleri('bes')).toEqual(ETKINLIKLER);
  });

  it('her desen gerçek bir örüntü: birim tekrar eder, boşlukların cevabı seçeneklerde, görünen kısım birimi en az bir kez gösterir', () => {
    for (const yol of YOLLAR)
      for (const e of ['renk', 'sekil', 'ses'] as const) {
        const d = desen(e, yol);
        expect(d.dizi).toHaveLength(YUVA);
        expect(d.bosluk).toBe(yol === 'minik' ? 1 : 2);
        // Birimin uzunluğu (en kısa tekrar) bulunur ve dizi ona göre tekrar eder.
        const birim = [1, 2, 3].find((n) => d.dizi.every((x, i) => x === d.dizi[i % n]))!;
        expect(birim, e + ' ' + yol).toBeGreaterThan(1);
        expect(gorunen(d).length).toBeGreaterThanOrEqual(birim + 1);
        for (let k = 0; k < d.bosluk; k++) expect(d.secenek).toContain(beklenen(d, k));
        expect(new Set(d.secenek).size).toBe(d.secenek.length);
        expect(d.secenek.length).toBeGreaterThanOrEqual(3);
      }
    // 2–3 yaş AB; 5+ yaşta ABC (renk) ve AAB (şekil, ses).
    expect(desen('renk', 'minik').dizi.slice(0, 2)).toEqual(['bayrak-kirmizi', 'bayrak-mavi']);
    expect(desen('renk', 'bes').dizi.slice(0, 3)).toEqual(['bayrak-kirmizi', 'bayrak-mavi', 'bayrak-sari']);
    expect(desen('sekil', 'dort').dizi.slice(0, 3)).toEqual(['tas-kirmizi-daire', 'tas-kirmizi-daire', 'tas-mavi-kare']);
    expect(desen('ses', 'bes').dizi.slice(0, 3)).toEqual(['davul', 'davul', 'alkis']);
    expect(desen('ses', 'dort').secenek).toEqual([...CALGILAR]);
  });

  it('kendi örüntüsü: seçilen iki bayrak ipte sırayla tekrar eder', () => {
    expect(kendiDizisi(['bayrak-sari', 'bayrak-mavi'])).toEqual(['bayrak-sari', 'bayrak-mavi', 'bayrak-sari', 'bayrak-mavi', 'bayrak-sari', 'bayrak-mavi']);
  });

  it('bütün sözler kayıtlı; övgüler sırayla döner', () => {
    expect(GEREKLI_SESLER).toEqual(Object.keys(sozler));
    for (const id of GEREKLI_SESLER) expect(existsSync('assets/matematik/ders/oruntu/ses/' + id + '.mp3'), id).toBe(true);
    const kullanilan = new Set(['giris', 'devam', 'ipucu', 'kendi_basla', 'kendi_bitti', 'bitis', 'hatira', 'dogru_1', 'dogru_2', 'dogru_3']);
    for (const yol of YOLLAR) for (const e of ['renk', 'sekil', 'ses'] as const) { kullanilan.add(desen(e, yol).tanit); kullanilan.add(desen(e, yol).sor); }
    expect([...kullanilan].sort()).toEqual(Object.keys(sozler).sort());
    expect([0, 1, 2, 3].map(dogruSesi)).toEqual(['dogru_1', 'dogru_2', 'dogru_3', 'dogru_1']);
  });

  it('kapı: Astra M5’in 14 çizimi gerekir; kayıt yarıda kalırsa sıradakinden sürer', () => {
    expect(GEREKLI_CIZIMLER).toHaveLength(14);
    expect(new Set(GEREKLI_CIZIMLER).size).toBe(14);
    const minik = JSON.stringify({ biten: ['renk', 'sekil', 'ses'], simdi: 'ses', tanitildi: true, bitti: true });
    expect(kaydiCoz(minik, dersEtkinlikleri('minik')).bitti).toBe(true);
    const dort = kaydiCoz(minik, dersEtkinlikleri('dort'));
    expect(dort.bitti).toBe(false);
    expect(siradaki(dort, dersEtkinlikleri('dort'))).toBe('kendi');
  });
});
