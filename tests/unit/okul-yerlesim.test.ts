/**
 * Okula Hazırım! · görsel yerleşim geometrisi (Gemini çizimleriyle): elmalar ağacın tacının içinde, kurabiyeler tabağın
 * içinde ve birbirine binmeden, piknik yerleri örtünün içinde, kuşlar dala sığar, kırpma kutuları tuvalin içinde.
 */
import { describe, expect, it } from 'vitest';
import { CIZIM_KUTUSU, cizimOrani, DAL_TUNEK, DAL_UST, dalUstu } from '../../okul/src/cizim';
import { dalDuzeni, sigar } from '../../okul/src/dal';
import { elmaYerleri } from '../../okul/src/etkinlikler/kac-elma';
import { kurabiyeYerleri, tabakYeri } from '../../okul/src/etkinlikler/hangisinde-cok';
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
  it('tabak düğmenin altında, oranı korunur', () => {
    const t = tabakYeri();
    expect(t.ust).toBeGreaterThan(0);
    expect(t.boy * cizimOrani('okul/tabak')).toBeCloseTo(1, 6);
    expect(t.ust + t.boy).toBeCloseTo(t.H, 6);
  });
  it('1-10 kurabiye tabağın üstünde, kutunun içinde, en çok %14 üst üste', () => {
    const t = tabakYeri();
    for (let n = 1; n <= 10; n++) {
      const k = kurabiyeYerleri(n);
      expect(k).toHaveLength(n);
      // kutu eni = 1 ölçüsüne çevir
      const p = k.map(({ x, y, c }) => ({ x: x / 100, y: (y / 100) * t.H, c: c / 100 }));
      for (const { x, y, c } of p) {
        expect(x - c / 2, `${n}`).toBeGreaterThanOrEqual(0);
        expect(x + c / 2, `${n}`).toBeLessThanOrEqual(1);
        expect(y - c / 2, `${n}`).toBeGreaterThanOrEqual(0);
        expect(y + c / 2, `${n}`).toBeLessThanOrEqual(t.H);
        // kurabiyenin dibi tabağın üst yüzünde (dış kenar elipsinin içinde)
        const d = ((x - t.dis.x) / t.dis.rx) ** 2 + ((y + c / 2 - t.dis.y) / t.dis.ry) ** 2;
        expect(d, `${n}: ${x},${y}`).toBeLessThanOrEqual(1);
      }
      for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++) expect(Math.hypot(p[i].x - p[j].x, p[i].y - p[j].y), `${n}: ${i}-${j}`).toBeGreaterThanOrEqual(p[i].c * 0.86);
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

describe('Dal gövdesi', () => {
  it('üst çizgi tünek boyunca kutunun içinde ve sürekli', () => {
    for (let i = 1; i < DAL_UST.length; i++) expect(DAL_UST[i][0]).toBeGreaterThan(DAL_UST[i - 1][0]);
    for (let u = DAL_TUNEK[0]; u <= DAL_TUNEK[1]; u += 0.01) {
      const v = dalUstu(u);
      expect(v).toBeGreaterThan(0.1);
      expect(v).toBeLessThan(0.6);
      expect(Math.abs(dalUstu(u + 0.01) - v)).toBeLessThan(0.02);
    }
  });
});

describe('Kırpma kutuları', () => {
  it('kutu, görselin gerçek (saydam olmayan) çizim kutusu: tuvalin oranı aynı', async () => {
    const sharp = (await import('sharp')).default;
    for (const [ad, [W, H, x, y, w, hh]] of Object.entries(CIZIM_KUTUSU)) {
      const { data, info } = await sharp(`assets/${ad}.webp`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      // tuval oranı aynı (görsel büyütülse de kutu oranlarla geçerli)
      expect(info.width / info.height, ad).toBeCloseTo(W / H, 2);
      const s = info.width / W;
      let x0 = info.width,
        y0 = info.height,
        x1 = -1,
        y1 = -1;
      for (let j = 0; j < info.height; j++)
        for (let i = 0; i < info.width; i++)
          if (data[(j * info.width + i) * 4 + 3] > 24) {
            x0 = Math.min(x0, i);
            x1 = Math.max(x1, i);
            y0 = Math.min(y0, j);
            y1 = Math.max(y1, j);
          }
      // %2 pay (kenar yumuşatması)
      const pay = 0.02;
      expect(Math.abs(x0 / s - x) / w, `${ad} x`).toBeLessThan(pay);
      expect(Math.abs(y0 / s - y) / hh, `${ad} y`).toBeLessThan(pay);
      expect(Math.abs((x1 + 1) / s - (x + w)) / w, `${ad} sağ`).toBeLessThan(pay);
      expect(Math.abs((y1 + 1) / s - (y + hh)) / hh, `${ad} alt`).toBeLessThan(pay);
    }
  });
  it('çizim kutusu tuvalin içinde', () => {
    for (const [ad, [W, H, x, y, w, h]] of Object.entries(CIZIM_KUTUSU)) {
      expect(x >= 0 && y >= 0 && w > 0 && h > 0, ad).toBe(true);
      expect(x + w, ad).toBeLessThanOrEqual(W);
      expect(y + h, ad).toBeLessThanOrEqual(H);
    }
  });
});
