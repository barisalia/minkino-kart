/** Karakter boy tablosu (src/karakter/boy.ts) */
import { describe, expect, it } from 'vitest';
import { altPayi, BOY, boyGenislik, boyOrani, boyTipi, CIZIM, COCUKLAR, gorunenBoy, minoBoyu, yanOlcek } from '../../src/karakter/boy';

const ISKELETLER = Object.keys(import.meta.glob('../../assets/karakter-iskelet/*.json', { eager: true, import: 'default' })).map((k) => k.replace(/^.*\/([^/]+)\.json$/, '$1'));

describe('boy tablosu', () => {
  it('oranlar: çocuk Mino’nun 1.3-1.4 katı, anne çocuğun ~1.35 katı, oturan Ege Mino’dan biraz büyük', () => {
    expect(BOY.cocuk).toBeGreaterThanOrEqual(1.3);
    expect(BOY.cocuk).toBeLessThanOrEqual(1.4);
    expect(BOY.anne / BOY.cocuk).toBeCloseTo(1.35, 2);
    expect(BOY.bebek).toBeGreaterThan(1);
    expect(BOY.bebek).toBeLessThan(BOY.cocuk);
    expect(BOY.kino).toBeLessThan(1);
  });
  it('hayvanlar: ayı en büyük (çocuktan uzun, anneden kısa), inek büyük; tavşan, ördek, köpek Mino ile çocuk arası; kuş küçük', () => {
    expect(BOY.ayi).toBeGreaterThan(BOY.cocuk);
    expect(BOY.ayi).toBeLessThan(BOY.anne);
    expect(BOY.inek).toBeGreaterThan(BOY.cocuk);
    expect(BOY.ayi).toBeGreaterThan(BOY.inek);
    for (const ad of ['tavsan', 'ordek', 'kopek', 'maymun'] as const) {
      expect(BOY[ad], ad).toBeGreaterThanOrEqual(BOY.mino);
      expect(BOY[ad], ad).toBeLessThan(BOY.cocuk);
    }
    expect(BOY.kus).toBeLessThan(BOY.kino);
  });
  it('her iskeletin (önden, yan, 3/4) ölçüsü var; tepe tabandan yukarıda, kutunun içinde', () => {
    for (const ad of ISKELETLER) {
      const c = CIZIM[ad];
      expect(c, ad).toBeTruthy();
      expect(c.tepe, ad).toBeGreaterThanOrEqual(0);
      expect(c.taban, ad).toBeLessThanOrEqual(c.kutu[1]);
      expect(c.taban - c.tepe, ad).toBeGreaterThan(c.kutu[1] * 0.6);
      expect(boyTipi(ad), ad).toBeTruthy();
    }
  });
  it('boyGenislik: hedef boy tutar; önden ve yan görünüş aynı boyda', () => {
    for (const ad of COCUKLAR) {
      const on = boyGenislik(ad, 10);
      const yan = boyGenislik(`${ad}-profil`, 10);
      expect(gorunenBoy(ad, on)).toBeCloseTo(BOY.cocuk * minoBoyu(10), 6);
      expect(gorunenBoy(`${ad}-profil`, yan)).toBeCloseTo(gorunenBoy(ad, on), 6);
      expect(yan / on).toBeCloseTo(yanOlcek(ad), 6);
    }
    expect(gorunenBoy('anne', boyGenislik('anne', 10)) / gorunenBoy('ada', boyGenislik('ada', 10))).toBeCloseTo(1.35, 6);
    expect(boyOrani(CIZIM.mino)).toBeCloseTo(1774 / 1360, 6);
  });
  it('ayak payı: yan görünüş ölçüleri eski film ölçümleriyle aynı', () => {
    const ESKI: Record<string, number> = { kino: 0.0771, ada: 0.0552, can: 0.043, elif: 0.0527, deniz: 0.0513, zeynep: 0.0449, ordek: 0.0205, kopek: 0.1113 };
    for (const [ad, a] of Object.entries(ESKI)) expect(altPayi(CIZIM[`${ad}-profil`]), ad).toBeCloseTo(a, 2);
  });
});

