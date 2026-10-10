import { describe, expect, it } from 'vitest';
import { Dunya } from '../../pazar/src/fizik';
import { IC_SAG, IC_SOL, LEGEN_KESIT, legenDunyasi } from '../../pazar/src/tart-legen';

const kosu = (d: Dunya, sn: number) => {
  for (let t = 0; t < sn; t += 1 / 60) d.adim(1 / 60);
};

describe('çember fiziği', () => {
  it('düşen çember yere iner, seker, durur ve uyur', () => {
    const d = new Dunya();
    d.duvar(-100, 100, 200, 100);
    const c = d.ekle(50, 0, 10);
    const carpmalar: number[] = [];
    d.carpinca = (x) => carpmalar.push(x.hiz);
    kosu(d, 3);
    expect(c.y).toBeGreaterThan(88);
    expect(c.y).toBeLessThan(91);
    expect(c.uyuyor).toBe(true);
    expect(c.degdi).toBe(true);
    // ilk çarpma hızlı, sonra seker (en az iki çarpma)
    expect(carpmalar[0]).toBeGreaterThan(300);
    expect(carpmalar.length).toBeGreaterThan(1);
    expect(d.sakin).toBe(true);
  });

  it('eğik yüzeyde yuvarlanır (döner)', () => {
    const d = new Dunya();
    d.duvar(0, 0, 300, 100);
    const c = d.ekle(20, -20, 8);
    kosu(d, 0.6);
    expect(c.x).toBeGreaterThan(40);
    // saat yönünde döner (sağa yuvarlanan)
    expect(c.a).toBeGreaterThan(1);
  });

  it('çemberler iç içe girmez, üst üste yığılır', () => {
    const d = new Dunya();
    d.cizgi([
      [0, -200],
      [0, 100],
      [28, 100],
      [28, -200],
    ]);
    const a = d.ekle(14, 50, 9);
    const b = d.ekle(15, 0, 9);
    kosu(d, 3);
    expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(17.5);
    expect(b.y).toBeLessThan(a.y);
    expect(a.uyuyor && b.uyuyor).toBe(true);
  });

  it('sarsınca uyananlar yeniden oturur; çıkarınca üsttekiler düşer', () => {
    const d = new Dunya();
    // dar kutu: üstteki alttakinin üstünde kalsın (açıkta yuvarlak yuvarlağın üstünden kayar)
    d.cizgi([
      [38, -200],
      [38, 100],
      [62, 100],
      [62, -200],
    ]);
    const alt = d.ekle(50, 80, 10);
    const ust = d.ekle(50, 50, 10);
    kosu(d, 3);
    expect(ust.uyuyor).toBe(true);
    const y = ust.y;
    d.cikar(alt);
    kosu(d, 2);
    expect(ust.y).toBeGreaterThan(y + 15);
    d.sars(300);
    expect(ust.uyuyor).toBe(false);
    kosu(d, 3);
    expect(ust.uyuyor).toBe(true);
  });

  it('leğen: 11 meyve yukarıdan düşer, hepsi leğende kalır ve uyur (60 karede bir adım ucuz)', () => {
    const d = legenDunyasi();
    const cs = Array.from({ length: 11 }, (_, i) => d.ekle(20 + ((i * 37) % 60), -40 - i * 12, 8.2 + (i % 3) * 0.4));
    const t0 = performance.now();
    kosu(d, 6);
    const ms = performance.now() - t0;
    for (const c of cs) {
      expect(c.x).toBeGreaterThan(LEGEN_KESIT[0][0] - 2);
      expect(c.x).toBeLessThan(LEGEN_KESIT[LEGEN_KESIT.length - 1][0] + 2);
      expect(c.y).toBeLessThan(LEGEN_KESIT[3][1]);
      expect(c.uyuyor).toBe(true);
    }
    // 360 karelik benzetim bu makinede çok kısa sürer (telefonda kare başına < 1 ms)
    expect(ms).toBeLessThan(1500);
  });

  it('leğen: kenarın üstüne düşen meyve dudakta / sepetin önünde havada durmaz, içeri yuvarlanır', () => {
    const k = LEGEN_KESIT;
    const sy = k[0][1];
    // dolu leğen: 10 meyve, ikisi kenara en yakın yerden (kantar.birak bırakma yerini bu sınırlara kırpar)
    const d = legenDunyasi();
    const cs = Array.from({ length: 8 }, (_, i) => d.ekle(IC_SOL + 9 + ((i * 23) % (IC_SAG - IC_SOL - 18)), -30 - i * 14, 8.5));
    cs.push(d.ekle(IC_SOL + 9, -150, 8.5), d.ekle(IC_SAG - 9, -165, 8.5));
    kosu(d, 8);
    for (const c of cs) {
      expect(c.uyuyor).toBe(true);
      // gövdesi kenar çizgisinin üstüne çıkan meyve dudağın üstünde değil, içinde (rampaların arasında) durur
      if (c.y < sy - c.r * 0.5) {
        expect(c.x - c.r).toBeGreaterThan(IC_SOL - 0.6);
        expect(c.x + c.r).toBeLessThan(IC_SAG + 0.6);
      }
    }
  });
});
