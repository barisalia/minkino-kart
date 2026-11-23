import { existsSync } from 'node:fs';
import { describe, expect, it as test } from 'vitest';
import sozler from '../../matematik/src/ders-onluk-sozler.json';
import {
  GEREKLI_CIZIMLER, GEREKLI_SESLER, GOREV, GOREVLER, TELDE, abakusDegeri, abakusDurumu, basamaklar, dersAcilir, it, kaydiCoz, sayiSesi, siradaki, tekBoncuk,
} from '../../matematik/src/ders-onluk-mantik';

describe('Ceren dersi 5 · Sayılar 11–20', () => {
  test('her sayının Ceren kaydı var: 1–10 Sayılar dersinden, 11–20 bu dersten', () => {
    for (let n = 1; n <= 20; n++) {
      const id = sayiSesi(n)!;
      expect(id, String(n)).toBeTruthy();
      const yol = n <= 10 ? 'assets/matematik/ceren/ses/' : 'assets/matematik/ders/onluk/ses/';
      expect(existsSync(yol + id + '.mp3'), id).toBe(true);
    }
    expect(sayiSesi(0)).toBeNull();
    expect(sayiSesi(21)).toBeNull();
    expect(sayiSesi(14)).toBe('on_dort');
    expect(GEREKLI_SESLER).toEqual(Object.keys(sozler));
    for (const id of GEREKLI_SESLER) expect(existsSync('assets/matematik/ders/onluk/ses/' + id + '.mp3'), id).toBe(true);
  });

  test('basamaklar ve görevler: onluk 0→10, on üç 10→13, abaküs 16, yirmi 17→20; tek boncuk hedefe yeter', () => {
    expect(basamaklar(14)).toEqual([1, 4]);
    expect(basamaklar(20)).toEqual([2, 0]);
    expect(GOREVLER).toEqual(['onluk', 'on-uc', 'abakus', 'yirmi']);
    for (const g of GOREVLER) {
      const { bas, hedef } = GOREV[g];
      expect(hedef).toBeGreaterThan(bas);
      if (g !== 'abakus') expect(tekBoncuk(g)).toBeGreaterThanOrEqual(hedef - bas);
    }
    expect(tekBoncuk('onluk')).toBe(10);
    // On üçte ve yirmide iki fazla boncuk: çocuk saymayı bırakmaz, sayarak durur.
    expect(tekBoncuk('on-uc')).toBe(5);
  });

  test('abaküs: her telde on boncuk; it ve geri al sınırda kalır; hedef 16 = üstte 1, altta 6; fazlası "fazla"', () => {
    expect(TELDE).toBe(10);
    expect(it(0, true)).toBe(1);
    expect(it(0, false)).toBe(0);
    expect(it(10, true)).toBe(10);
    expect(abakusDegeri({ ust: 1, alt: 6 })).toBe(16);
    expect(abakusDurumu({ ust: 1, alt: 6 }, 16)).toBe('tamam');
    expect(abakusDurumu({ ust: 1, alt: 3 }, 16)).toBe('suruyor');
    expect(abakusDurumu({ ust: 0, alt: 6 }, 16)).toBe('suruyor');
    expect(abakusDurumu({ ust: 1, alt: 7 }, 16)).toBe('fazla');
    expect(abakusDurumu({ ust: 2, alt: 0 }, 16)).toBe('fazla');
  });

  test('açılış: yalnız 5+ yaşta ve Sayı masasının hatırası alındıktan sonra', () => {
    expect(dersAcilir(5, true)).toBe(true);
    expect(dersAcilir(6, true)).toBe(true);
    expect(dersAcilir(4, true)).toBe(false);
    expect(dersAcilir(5, false)).toBe(false);
  });

  test('kapı ve kayıt: Astra M6’nın 9 çizimi; yarım kayıt sürer', () => {
    expect(GEREKLI_CIZIMLER).toHaveLength(9);
    expect(new Set(GEREKLI_CIZIMLER).size).toBe(9);
    const k = kaydiCoz(JSON.stringify({ biten: ['onluk', 'on-uc'], simdi: 'abakus', tanitildi: true }));
    expect(siradaki(k)).toBe('abakus');
    expect(k.bitti).toBe(false);
    expect(kaydiCoz('bozuk').simdi).toBe('onluk');
  });
});
