/** Kino ailesi kesme kukla kitleri (assets/karakter/{anne,baba,lokum}) ve boy tablosu (assets/karakter/aile-boy.json) */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { Kukla, type KuklaIskelet } from '../../film/src/kukla';
import boy from '../../assets/karakter/aile-boy.json';
import kino from '../../assets/karakter/kino-yeni/kino-yeni.json';
import anne from '../../assets/karakter/anne/anne.json';
import baba from '../../assets/karakter/baba/baba.json';
import lokum from '../../assets/karakter/lokum/lokum.json';

type Kit = KuklaIskelet & { tepe?: number; cizgi: { kalinlik: number } };
const KITLER: Record<string, { j: Kit; klasor: string }> = {
  kino: { j: kino as unknown as Kit, klasor: 'kino-yeni' },
  anne: { j: anne as unknown as Kit, klasor: 'anne' },
  baba: { j: baba as unknown as Kit, klasor: 'baba' },
  lokum: { j: lokum as unknown as Kit, klasor: 'lokum' },
};
const AILE = ['anne', 'baba', 'lokum'] as const;
/** motorun (film/src/kukla-hareket.ts, aile-test.ts) adla eriştiği parçalar */
const GEREKLI = ['kalca', 'govde', 'kafa', 'kuyruk', 'kulak-sag', 'kulak-sol', 'bacak-ust-sag', 'bacak-ust-sol', 'bacak-alt-sag', 'bacak-alt-sol', 'ayak-sag', 'ayak-sol', 'kol-ust-sag', 'kol-ust-sol', 'kol-alt-sag', 'kol-alt-sol', 'el-sag', 'el-sol'];
const YUZ = { gozler: ['acik', 'yari', 'kapali', 'mutlu', 'sola', 'saga', 'saskin'], kaslar: ['notr', 'kalkik', 'uzgun', 'kizgin'], agiz: ['gulumse', 'az', 'orta', 'genis', 'o', 'e', 'kahkaha', 'uzgun'] };
const kinoTepe = boy.birim === 'kino' ? kino.zemin - boy.kinoBoyKare : NaN;
const boyOlc = (j: Kit) => j.zemin - (j.tepe ?? kinoTepe);

describe('aile kukla kitleri', () => {
  for (const ad of AILE) {
    const { j, klasor } = KITLER[ad];
    it(`${ad}: parçalar, ebeveynler, çizim sırası, yüz setleri ve görseller tam`, () => {
      for (const p of GEREKLI) expect(j.parcalar[p], `${ad}/${p}`).toBeTruthy();
      for (const [p, b] of Object.entries(j.parcalar)) {
        if (b.ust) expect(j.parcalar[b.ust], `${ad}/${p} ebeveyni`).toBeTruthy();
        expect(existsSync(resolve(__dirname, '../../assets/karakter', klasor, b.resim)), `${ad}/${b.resim}`).toBe(true);
        if (b.dolgu) expect(existsSync(resolve(__dirname, '../../assets/karakter', klasor, b.dolgu)), `${ad}/${b.dolgu}`).toBe(true);
      }
      for (const c of j.cizim) {
        if (typeof c === 'string') expect(j.parcalar[c], `${ad} çizim ${c}`).toBeTruthy();
        else if ('yuva' in c) expect(j.yuvalar[c.yuva], `${ad} yuva ${c.yuva}`).toBeTruthy();
        else for (const p of c.parcalar) expect(j.parcalar[p]?.kume, `${ad} küme ${p}`).toBe(c.kume);
      }
      for (const [yuva, haller] of Object.entries(YUZ)) {
        expect(j.yuvalar[yuva].secenekler.sort()).toEqual(haller.map((h) => `${yuva}-${h}`).sort());
        expect(j.yuvalar[yuva].secenekler).toContain(j.yuvalar[yuva].varsayilan);
      }
    });
    it(`${ad}: çizgi kalınlığı Kino ile aynı`, () => {
      expect(j.cizgi.kalinlik).toBe(KITLER.kino.j.cizgi.kalinlik);
    });
  }

  it('boylar tek tablodan: Anne Kino × 1.6, Baba × 1.75, Lokum × 0.7 (çizilen boy tabloya ±%1.5)', () => {
    expect(boy.boy).toEqual({ kino: 1, anne: 1.6, baba: 1.75, lokum: 0.7 });
    for (const ad of AILE) expect(boyOlc(KITLER[ad].j) / boy.kinoBoyKare, ad).toBeCloseTo(boy.boy[ad], 1);
    for (const ad of AILE) expect(Math.abs(boyOlc(KITLER[ad].j) / boy.kinoBoyKare - boy.boy[ad]), ad).toBeLessThan(boy.boy[ad] * 0.015);
  });

  it('yetişkin gerçekten yetişkin: kafa sayısı 3.5-4, Lokum Kino’dan da bebeksi', () => {
    const kafaSayisi = (j: Kit) => {
      const k = j.parcalar.kafa.kutu;
      return boyOlc(j) / (k[1] + k[3] - 8 - (j.tepe ?? kinoTepe));
    };
    for (const ad of ['anne', 'baba'] as const) {
      expect(kafaSayisi(KITLER[ad].j), ad).toBeGreaterThanOrEqual(3.5);
      expect(kafaSayisi(KITLER[ad].j), ad).toBeLessThanOrEqual(4);
      expect(kafaSayisi(KITLER[ad].j), ad).toBeCloseTo(boy.kafaSayisi[ad], 0);
    }
    expect(kafaSayisi(KITLER.lokum.j)).toBeLessThan(boy.kafaSayisi.kino);
    expect(boy.kafaSayisi.lokum).toBeLessThan(boy.kafaSayisi.kino);
  });

  it('kukla motoru aile kitini kurar: kol kalkınca el yukarı ve dışa gider, eklem sınırı tutar', () => {
    const k = new Kukla(KITLER.anne.j, () => '');
    k.hesapla();
    const el0 = k.nokta('el-sag');
    k.poz = { 'kol-ust-sag': { a: 100 } };
    k.hesapla();
    const el1 = k.nokta('el-sag');
    expect(el1[1]).toBeLessThan(el0[1]);
    expect(el1[0]).toBeLessThan(el0[0]);
    k.poz = { 'kol-ust-sag': { a: 400 } };
    k.hesapla();
    const sinir = k.nokta('el-sag');
    k.poz = { 'kol-ust-sag': { a: KITLER.anne.j.parcalar['kol-ust-sag'].sinir![1] } };
    k.hesapla();
    expect(k.nokta('el-sag')[0]).toBeCloseTo(sinir[0], 6);
  });
});
