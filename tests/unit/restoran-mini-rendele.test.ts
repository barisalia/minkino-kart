/** Rendele mini oyununun saf kuralları (restoran/src/mini/rendele/mantik.ts; RESTORAN.md §8 M4) */
import { describe, expect, it } from 'vitest';
import { istekTuttu, rendeAdet, rendePorsiyon, surt, SURTME, yiginBoyu } from '../../restoran/src/mini/rendele/mantik';

describe('Rendele: sürtme', () => {
  it('kaşar 3-4 yaşta 4, 5-6 yaşta 6 tam sürtmede biter; giden yığına eklenir', () => {
    let k = 1;
    let toplam = 0;
    for (let i = 0; i < SURTME.kucuk; i++) {
      const s = surt(k, 200, 200, 'kasar', 'kucuk');
      k = s.kalan;
      toplam += s.rende;
    }
    expect(k).toBeCloseTo(0, 6);
    expect(toplam).toBeCloseTo(1, 6);
    expect(surt(1, 200 * 4, 200, 'kasar', 'buyuk').kalan).toBeGreaterThan(0);
  });
  it('havuç sert (yavaş), domates sulu (hızlı); bitmiş malzeme rende vermez', () => {
    expect(surt(1, 100, 200, 'havuc', 'kucuk').rende).toBeLessThan(surt(1, 100, 200, 'kasar', 'kucuk').rende);
    expect(surt(1, 100, 200, 'domates', 'kucuk').rende).toBeGreaterThan(surt(1, 100, 200, 'elma', 'kucuk').rende);
    expect(surt(0, 100, 200, 'kasar', 'kucuk').rende).toBe(0);
  });
  it('yığın boyu ve porsiyon', () => {
    expect([0, 0.2, 0.6, 1.2, 2].map(yiginBoyu)).toEqual([0, 1, 2, 3, 4]);
    expect(rendePorsiyon(0.2)).toBe('az');
    expect(rendePorsiyon(2)).toBe('kocaman');
    expect(rendeAdet(0.05)).toBe(1);
  });
  it('5-6 özel istek: az küçük yığın, çok ikinci kalıp', () => {
    expect(istekTuttu(0.4, 'az')).toBe(true);
    expect(istekTuttu(1, 'az')).toBe(false);
    expect(istekTuttu(1, 'cok')).toBe(false);
    expect(istekTuttu(1.3, 'cok')).toBe(true);
  });
});
