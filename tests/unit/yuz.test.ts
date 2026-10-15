import { describe, expect, it } from 'vitest';
import { birlesim, kavisKacir, kesisir } from '../../src/karakter/yuz';

describe('yüzü açık tutma (src/karakter/yuz.ts)', () => {
  it('kutuların birleşimi boşları saymaz', () => {
    expect(birlesim([null, { left: 0, top: 0, right: 0, bottom: 0 }, { left: 1, top: 2, right: 3, bottom: 4 }, { left: -1, top: 5, right: 2, bottom: 6 }])).toEqual({ left: -1, top: 2, right: 3, bottom: 6 });
    expect(birlesim([null])).toBeNull();
  });
  it('kesişme', () => {
    expect(kesisir({ left: 0, top: 0, right: 10, bottom: 10 }, { left: 9, top: 9, right: 20, bottom: 20 })).toBe(true);
    expect(kesisir({ left: 0, top: 0, right: 10, bottom: 10 }, { left: 10, top: 0, right: 20, bottom: 10 })).toBe(false);
  });
  it('engel yoksa kavis aynen kalır', () => {
    expect(kavisKacir([0, 100], [200, 100], -90, [])).toBe(-90);
    expect(kavisKacir([0, 100], [200, 100], -90, [{ left: 80, top: 200, right: 120, bottom: 240 }])).toBe(-90);
  });
  it('yay yüzün önünden geçecekse alçalır (yüzün altından akar)', () => {
    // yüz yolun ortasının 60 px üstünde: -90 kavis yüzden geçer
    const yuz = { left: 80, top: 20, right: 120, bottom: 50 };
    const k = kavisKacir([0, 100], [200, 100], -90, [yuz]);
    expect(k).toBeGreaterThan(-90);
    expect(k).toBeLessThanOrEqual(-40);
  });
  it('hiçbir yol temiz değilse en az yüz keseni seçer', () => {
    const k = kavisKacir([0, 100], [200, 100], -60, [{ left: -10, top: -500, right: 210, bottom: 500 }]);
    expect(k).toBe(-60);
  });
});
