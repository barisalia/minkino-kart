/**
 * Okula Hazırım! · görsel yerleşim geometrisi (Gemini çizimleriyle): elmalar ağacın tacının içinde, kurabiyeler tabağın
 * içinde ve birbirine binmeden, piknik yerleri örtünün içinde, kuşlar dala sığar, kırpma kutuları tuvalin içinde.
 */
import { describe, expect, it } from 'vitest';
import { CIZIM_KUTUSU } from '../../okul/src/cizim';
import { dalDuzeni, sigar } from '../../okul/src/dal';
import { elmaYerleri } from '../../okul/src/etkinlikler/kac-elma';
import { kurabiyeYerleri } from '../../okul/src/etkinlikler/hangisinde-cok';
import { ortuYeri } from '../../okul/src/etkinlikler/piknik';

describe('Kaç elma? ağacı', () => {
  // tacın elipsi (agac.webp tuvalinin yüzdesi): merkez (50, 33), yarıçaplar 30 × 24.5
  const tacta = (x: number, y: number, W: number, H: number, pay: number) => ((x - 50) / (30 - (pay / W) * 100)) ** 2 + ((y - 33) / (24.5 - (pay / H) * 100)) ** 2 <= 1.0001;
  for (const [W, H] of [
    [500, 364],
    [342, 250],
    [527, 384],
  ])
    it(`1-10 elma tacın içinde, birbirine binmez (${W}×${H})`, () => {
      for (let n = 1; n <= 10; n++) {
        const { yer, boy } = elmaYerleri(n, W, H);
        expect(yer).toHaveLength(n);
        expect(boy).toBeGreaterThan(20);
        // elmanın merkezi, yarıçapının %40'ı kadar içeride (elma tacın yeşilinin üstünde)
        for (const [x, y] of yer) expect(tacta(x, y, W, H, boy * 0.4), `${n}: ${x},${y}`).toBe(true);
        for (let i = 0; i < n; i++)
          for (let j = i + 1; j < n; j++) {
            const d = Math.hypot(((yer[i][0] - yer[j][0]) / 100) * W, ((yer[i][1] - yer[j][1]) / 100) * H);
            expect(d, `${n}: ${i}-${j}`).toBeGreaterThanOrEqual(boy * 0.98);
          }
      }
    });
});

describe('Hangisinde çok? tabağı', () => {
  it('1-10 kurabiye tabağın iç dairesinde ve birbirine binmeden', () => {
    for (let n = 1; n <= 10; n++) {
      const k = kurabiyeYerleri(n);
      expect(k).toHaveLength(n);
      for (const { x, y, c } of k) expect(Math.hypot(x - 50, y - 50) + c / 2, `${n}`).toBeLessThanOrEqual(39.01);
      for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++) expect(Math.hypot(k[i].x - k[j].x, k[i].y - k[j].y), `${n}: ${i}-${j}`).toBeGreaterThanOrEqual(k[i].c * 0.99);
    }
  });
});

describe('Piknik örtüsü', () => {
  // örtü dörtgeni (kırpılmış kutu yüzdesi): sol (1, 47), üst (48, 2), sağ (100, 29), alt (60, 99)
  const KOSE: [number, number][] = [
    [1, 47],
    [48, 2],
    [100, 29],
    [60, 99],
  ];
  const icinde = ([x, y]: [number, number]) =>
    KOSE.every((a, i) => {
      const b = KOSE[(i + 1) % 4];
      return (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]) >= 0;
    });
  it('misafir yerleri soldan sağa, örtünün içinde', () => {
    for (const n of [3, 4]) {
      const yerler = Array.from({ length: n }, (_, i) => ortuYeri(i, n));
      for (let i = 1; i < n; i++) expect(yerler[i][0]).toBeGreaterThan(yerler[i - 1][0]);
      for (const y of yerler) expect(icinde(y), `${n}: ${y}`).toBe(true);
    }
  });
});

describe('Kuş dalları', () => {
  it('kuşlar seçilen düzende sığar; dar ekranda iki kat', () => {
    for (const [en, kus] of [
      [366, 64],
      [366, 52],
      [574, 64],
      [744, 92],
    ])
      for (let n = 1; n <= 10; n++) {
        const d = dalDuzeni(n, en, kus);
        const sigasi = d === 'tek' ? sigar('tek', en, kus) : 2 * sigar(d, en, kus);
        if (d !== 'iki-kat') expect(n, `${en}/${kus}: ${n} ${d}`).toBeLessThanOrEqual(sigasi);
      }
    expect(dalDuzeni(3, 366, 64)).toBe('yan');
    expect(dalDuzeni(10, 366, 52)).toBe('iki-kat');
  });
});

describe('Kırpma kutuları', () => {
  it('çizim kutusu tuvalin içinde', () => {
    for (const [ad, [W, H, x, y, w, h]] of Object.entries(CIZIM_KUTUSU)) {
      expect(x >= 0 && y >= 0 && w > 0 && h > 0, ad).toBe(true);
      expect(x + w, ad).toBeLessThanOrEqual(W);
      expect(y + h, ad).toBeLessThanOrEqual(H);
    }
  });
});
