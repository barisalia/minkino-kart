/** Kır ve Çırp mini oyununun saf kuralları (restoran/src/mini/kir-cirp/mantik.ts; RESTORAN.md §8 M5) */
import { describe, expect, it } from 'vitest';
import {
  AGIRLIK,
  bitti,
  bosDurum,
  cirp,
  ekle,
  kabukYakalandi,
  karisikRenk,
  katmanaEkle,
  katmanlariCirp,
  kenaraVurdu,
  kivam,
  ortalamaKarisim,
  TUR,
  unBulutu,
  urunTuru,
  type Katman,
} from '../../restoran/src/mini/kir-cirp/mantik';

const tur = (R: number) => 2 * Math.PI * R * 0.55;

describe('Kır ve Çırp: yumurta ve kabuk avı', () => {
  it('yumurta kenara dışarıdan girince vurur', () => {
    expect(kenaraVurdu(200, 110, 100, 'buyuk')).toBe(true);
    expect(kenaraVurdu(110, 105, 100, 'buyuk')).toBe(false);
  });
  it('kaygan kabuk 3-4 yaşta ikinci, 5-6 yaşta üçüncü dokunuşta yakalanır', () => {
    expect(kabukYakalandi(1, 'kucuk')).toBe(false);
    expect(kabukYakalandi(2, 'kucuk')).toBe(true);
    expect(kabukYakalandi(2, 'buyuk')).toBe(false);
    expect(kabukYakalandi(3, 'buyuk')).toBe(true);
  });
  it('her dördüncü kaşık unda bulut kalkar (Mino hapşırır)', () => {
    expect([1, 2, 3, 4, 5, 8].map(unBulutu)).toEqual([false, false, false, true, false, true]);
  });
});

describe('Kır ve Çırp: çırpma', () => {
  it('3-4 yaşta üç tur, 5-6 yaşta beş tur pürüzsüz yapar; yay da sayılır', () => {
    const R = 100;
    expect(cirp(0, tur(R) * 2.9, R, 'kucuk')).toBeLessThan(1);
    expect(cirp(0, tur(R) * TUR.kucuk, R, 'kucuk')).toBe(1);
    expect(cirp(0, tur(R) * 3, R, 'buyuk')).toBeLessThan(1);
    expect(cirp(0, tur(R) * TUR.buyuk, R, 'buyuk')).toBe(1);
    // yarım yaylar da birikir
    let k = 0;
    for (let i = 0; i < 6; i++) k = cirp(k, tur(R) / 2, R, 'kucuk');
    expect(k).toBe(1);
  });
  it('yeni katman çırpılmamış gelir: kâsenin karışması ağırlıkla düşer', () => {
    const k: Katman[] = [{ tur: 'yumurta', w: AGIRLIK.yumurta, m: 0 }];
    katmanlariCirp(k, tur(100) * 3, 100, 'kucuk');
    expect(ortalamaKarisim(k)).toBe(1);
    k.push({ tur: 'un', w: AGIRLIK.un, m: 0 });
    expect(ortalamaKarisim(k)).toBeCloseTo(1 / 1.5, 5);
    const sut: Katman = { tur: 'sut', w: 1.5, m: 1 };
    katmanaEkle(sut, 1.5);
    expect(sut.m).toBeCloseTo(0.5, 5);
  });
  it('5-6 yaşta un topak bırakır, 3-4 yaşta bırakmaz; topak varken bitmez', () => {
    let d = ekle(bosDurum(), 'yumurta', 1, 'buyuk');
    d = ekle(d, 'un', 2, 'buyuk');
    expect(d.topak).toBe(4);
    expect(bitti({ ...d, karisim: 1 })).toBe(false);
    expect(bitti({ ...d, karisim: 1, topak: 0 })).toBe(true);
    expect(ekle(bosDurum(), 'un', 2, 'kucuk').topak).toBe(0);
  });
});

describe('Kır ve Çırp: ürün', () => {
  it('unlu = pankek hamuru, yalnız süt = sütlaç, yoksa çırpılmış yumurta', () => {
    expect(urunTuru({ ...bosDurum(), yumurta: 1, un: 2, sut: 1 })).toEqual({ tur: 'hamur', yemek: 'pankek' });
    expect(urunTuru({ ...bosDurum(), sut: 1, seker: 2 }).tur).toBe('sut-karisimi');
    expect(urunTuru({ ...bosDurum(), yumurta: 2 }).yemek).toBe('menemen');
  });
  it('kıvam ve renk', () => {
    expect(kivam(bosDurum())).toBe('yok');
    expect(kivam({ ...bosDurum(), yumurta: 1, sut: 0.5, un: 2 })).toBe('iyi');
    expect(kivam({ ...bosDurum(), yumurta: 1, un: 6 })).toBe('koyu');
    expect(karisikRenk(bosDurum())).toBe('#FFFFFF');
    expect(karisikRenk({ ...bosDurum(), yumurta: 1 })).toMatch(/^#ff/i);
  });
});
