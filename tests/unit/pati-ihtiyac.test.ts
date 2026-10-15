import { describe, expect, it } from 'vitest';
import P from '../../content/pati.json';
import { adimSayisi, gerekenEsya, GunAkisi, gununAni, planKaristir, rafEsyalari, yardimAdimlari, type HayvanAdi, type IhtiyacTuru } from '../../pati/src/ihtiyac';
import { normal, tumCumleler } from '../../src/audio/cumleler';

const PLAN = P.gun1 as [HayvanAdi, IhtiyacTuru][];
/** tekrarlanabilir rastgele */
const tohum = (n: number) => () => ((n = (n * 16807) % 2147483647) - 1) / 2147483646;

describe('Pati Dükkânı: gün akışı', () => {
  it('İlk Gün planı beş ihtiyaç: Fındık aç ve oyun, Tarçın oyun ve üşümüş, Pırıl aç', () => {
    expect(PLAN).toHaveLength(5);
    expect(new Set(PLAN.map((p) => p.join('-')))).toEqual(new Set(['findik-ac', 'findik-oyun', 'tarcin-oyun', 'tarcin-usudu', 'piril-ac']));
  });

  it('karışan planda aynı hayvan art arda gelmez, hiçbir ihtiyaç kaybolmaz', () => {
    for (let t = 1; t < 40; t++) {
      const d = planKaristir(PLAN, tohum(t));
      expect(d.map((p) => p.join('-')).sort()).toEqual(PLAN.map((p) => p.join('-')).sort());
      for (let i = 1; i < d.length; i++) expect(d[i][0]).not.toBe(d[i - 1][0]);
    }
  });

  it('3-4 yaşta aynı anda tek ihtiyaç; kapanınca 4-8 sn sonra sıradaki açılır', () => {
    const g = new GunAkisi(PLAN, 'kucuk', tohum(3), 0, 1000);
    expect(g.tik(500)).toHaveLength(0);
    const [ilk] = g.tik(1000);
    expect(ilk).toBeDefined();
    expect(g.tik(60_000)).toHaveLength(0);
    g.kapat(ilk.id, 60_000);
    expect(g.tik(63_999)).toHaveLength(0);
    expect(g.tik(68_000)).toHaveLength(1);
  });

  it('5-6 yaşta en çok iki ihtiyaç ve ikisi aynı hayvanda olmaz', () => {
    const g = new GunAkisi(PLAN, 'buyuk', tohum(5), 0, 0);
    g.tik(0);
    g.tik(20_000);
    g.tik(40_000);
    expect(g.acik).toHaveLength(2);
    expect(g.acik[0].hayvan).not.toBe(g.acik[1].hayvan);
  });

  it('her ihtiyaç kapatılınca gün biter (hiç dokunmasa da: yardım merdiveni kapatır)', () => {
    for (const yas of ['kucuk', 'buyuk'] as const) {
      const g = new GunAkisi(planKaristir(PLAN, tohum(7)), yas, tohum(9), 0, 0);
      let t = 0;
      while (!g.bitti && t < 600_000) {
        g.tik(t);
        // her açık ihtiyaç 30 sn sonra "birlikte" kapanır
        for (const a of [...g.acik]) g.kapat(a.id, t + 30_000);
        t += 30_000;
      }
      expect(g.bitti).toBe(true);
      expect(g.biten).toHaveLength(5);
    }
  });

  it('yanlış kimlikle kapatmak hiçbir şeyi bozmaz', () => {
    const g = new GunAkisi(PLAN, 'kucuk', tohum(2), 0, 0);
    g.tik(0);
    expect(g.kapat(999, 10)).toBeNull();
    expect(g.acik).toHaveLength(1);
  });

  it('her ihtiyacın eşyası o hayvanın rafında', () => {
    for (const [h, t] of PLAN) expect(rafEsyalari(h)).toContain(gerekenEsya(h, t));
    expect(rafEsyalari('piril')).not.toContain('minder');
  });

  it('yaşa göre adım: balığa 3-4 iki tutam, 5-6 bir tutam; mama iki ölçek', () => {
    expect(adimSayisi('yem', 'kucuk')).toBe(2);
    expect(adimSayisi('yem', 'buyuk')).toBe(1);
    expect(adimSayisi('mama', 'buyuk')).toBe(2);
  });

  it('yardım merdiveni: balon yalnız 3-4, sonra bakış, Nehir, gösterme, birlikte', () => {
    expect(yardimAdimlari(3500, 'kucuk')).toEqual(['balon']);
    expect(yardimAdimlari(3500, 'buyuk')).toEqual([]);
    expect(yardimAdimlari(31_000, 'buyuk')).toEqual(['bakis', 'soyle', 'goster', 'birlikte']);
  });

  it('günün fotoğrafı en çok tekrarlanan an', () => {
    expect(gununAni({})).toBeNull();
    expect(gununAni({ 'findik-top': 2, 'tarcin-kus': 3, 'piril-yem': 1 })).toBe('tarcin-kus');
  });

  it('Nehir abla cümleleri seslendirme listesinde ve kısa', () => {
    const hepsi = new Set(tumCumleler());
    const topla = (v: unknown): string[] => (typeof v === 'string' ? [v] : v && typeof v === 'object' ? Object.values(v).flatMap(topla) : []);
    for (const c of topla(P.nehir)) {
      expect(hepsi.has(normal(c))).toBe(true);
      expect(c.length).toBeLessThanOrEqual(30);
    }
  });
});
