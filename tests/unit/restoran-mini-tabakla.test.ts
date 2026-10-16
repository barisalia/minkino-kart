/** Tabakla mini oyununun saf kuralları (restoran/src/mini/tabakla/mantik.ts; RESTORAN.md §8 M14) */
import { describe, expect, it } from 'vitest';
import { bicimBul, bosMu, miknatis, porsiyonBul, tabakOzelligi, yuzBul, type TabakOzeti, type TabakParca } from '../../restoran/src/mini/tabakla/mantik';

const goz = (u: number, v: number): TabakParca => ({ u, v, w: 0.16, h: 0.14, bicim: 'yuvarlak' });
const yay = (u: number, v: number): TabakParca => ({ u, v, w: 0.4, h: 0.12, bicim: 'uzun' });
const kucuk = (u: number, v: number): TabakParca => ({ u, v, w: 0.14, h: 0.14, bicim: 'yuvarlak' });

describe('Tabakla: yüz tanıma', () => {
  it('iki zeytin göz + altında ekmek ağız = yüz', () => {
    const y = yuzBul([goz(-0.35, -0.35), goz(0.35, -0.35), yay(0, 0.3)]);
    expect(y).not.toBeNull();
    expect(y!.gozler).toEqual([0, 1]);
    expect(y!.agiz).toEqual([2]);
  });
  it('üç küçük parçalı gülümseme de ağızdır; burun şart değil', () => {
    expect(yuzBul([goz(-0.3, -0.3), goz(0.3, -0.3), kucuk(0, -0.05), kucuk(-0.3, 0.3), kucuk(0, 0.38), kucuk(0.3, 0.3)])).not.toBeNull();
  });
  it('göz yok, ağız gözlerin üstünde, gözler çok uzak: yüz değil', () => {
    expect(yuzBul([yay(0, 0.3), goz(-0.35, -0.35)])).toBeNull();
    expect(yuzBul([goz(-0.35, 0.3), goz(0.35, 0.3), yay(0, -0.4)])).toBeNull();
    expect(yuzBul([goz(-0.8, -0.3), goz(0.8, -0.3), yay(0, 0.3)])).toBeNull();
    expect(yuzBul([goz(-0.3, -0.6), goz(0.3, 0.1), yay(0, 0.5)])).toBeNull();
  });
  it('biçimler: zeytin yuvarlak, ekmek uzun, şerit uzun, domates dilimi (yarım ay) uzun, salatalık dilimi yuvarlak', () => {
    expect(bicimBul('dilim', 'zeytin', 0.17, 0.14)).toBe('yuvarlak');
    expect(bicimBul('dilim', 'ekmek', 0.44, 0.3)).toBe('uzun');
    expect(bicimBul('serit', 'biber', 0.36, 0.1)).toBe('uzun');
    expect(bicimBul('dilim', 'domates', 0.27, 0.27)).toBe('uzun');
    expect(bicimBul('dilim', 'salatalik', 0.27, 0.27)).toBe('yuvarlak');
  });
});

describe('Tabakla: diziş ve özellik', () => {
  it('hafif mıknatıs: kenara yakın içeri çekilir, çok dışarısı tabaktan iner', () => {
    expect(miknatis(0.2, 0.1)).toEqual({ u: 0.2, v: 0.1 });
    const k = miknatis(1.1, 0)!;
    expect(k.u).toBeCloseTo(0.82);
    expect(miknatis(2, 0)).toBeNull();
  });
  it('limon ekşi, bal ve meyve tatlı, süs sayılır, yüz taşınır', () => {
    const o: TabakOzeti = {
      urunler: [{ malzemeler: { domates: { adet: 4, kesim: 'dilim' } }, pisme: 'altin', sicak: true, tuz: 1 }],
      urunPorsiyon: ['normal'],
      yemekParca: 4,
      sus: { limon: 2, zeytin: 2, muz: 1 },
      bal: 0.8,
      yag: 0,
      yuz: true,
    };
    const oz = tabakOzelligi(o);
    expect(oz.eksi).toBe(2);
    expect(oz.tatli).toBeGreaterThanOrEqual(2);
    expect(oz.sus).toBe(5);
    expect(oz.yuz).toBe(true);
    expect(oz.pisme).toBe('altin');
    expect(oz.sicak).toBe(true);
    expect(oz.tuz).toBe(1);
    expect(oz.malzemeler.domates?.adet).toBe(4);
    expect(oz.malzemeler.limon?.adet).toBe(2);
    expect(oz.porsiyon).toBe('normal');
  });
  it('boş tabak: en komik başarısızlık, yine de bir tabak', () => {
    const o: TabakOzeti = { urunler: [], urunPorsiyon: [], yemekParca: 0, sus: {}, bal: 0, yag: 0, yuz: false };
    expect(bosMu(o)).toBe(true);
    const oz = tabakOzelligi(o);
    expect(oz.malzemeler).toEqual({});
    expect(oz.porsiyon).toBe('az');
    expect(bosMu({ ...o, sus: { zeytin: 1 } })).toBe(false);
  });
  it('porsiyon', () => {
    expect(porsiyonBul(2, [])).toBe('az');
    expect(porsiyonBul(8, ['normal'])).toBe('normal');
    expect(porsiyonBul(8, ['kocaman'])).toBe('kocaman');
    expect(porsiyonBul(24, [])).toBe('kocaman');
  });
});
