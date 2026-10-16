/** Tava mini oyununun saf kuralları (restoran/src/mini/tava/mantik.ts; RESTORAN.md §8 M6, §3c) */
import { describe, expect, it } from 'vitest';
import {
  cevir,
  fiskeMi,
  fiskeSonucu,
  HIZ,
  kabarcikMi,
  karisimEkle,
  kenaraVurdu,
  menemenBitti,
  pankekBitti,
  pankekPis,
  pankekPisme,
  pis,
  pismeAdi,
  porsiyon,
  TAVAN,
  ustYuz,
  yeniPankek,
  yumurtaKesim,
} from '../../restoran/src/mini/tava/mantik';

describe('Tava: pişme rengi çiğ → az → altın → çıtır, kömür yok', () => {
  it('zamanla ilerler, çıtırda durur', () => {
    expect(pismeAdi(0)).toBe('cig');
    expect(pismeAdi(pis(0, 7, HIZ.sebze))).toBe('az');
    expect(pismeAdi(pis(0, 14, HIZ.sebze))).toBe('altin');
    expect(pismeAdi(pis(0, 22, HIZ.sebze))).toBe('citir');
    // bir saat ocakta kalsa da çıtır (son durak)
    const p = pis(0, 3600, HIZ.sebze);
    expect(p).toBe(TAVAN);
    expect(pismeAdi(p)).toBe('citir');
  });
  it('menemen: yumurta karışınca ve altın olunca doğal son', () => {
    expect(menemenBitti(2.2, true, 0.2, true)).toBe(false);
    expect(menemenBitti(2.2, true, 0.6, true)).toBe(true);
    expect(menemenBitti(1.5, true, 1, true)).toBe(false);
    expect(menemenBitti(2.5, false, 0, false)).toBe(false);
  });
  it('yumurta: az karışırsa iri, çok karışırsa ince; 3-4 daha çabuk karışır', () => {
    expect(yumurtaKesim(karisimEkle(0, 400, 'buyuk'))).toBe('iri');
    expect(yumurtaKesim(karisimEkle(0, 1500, 'buyuk'))).toBe('ince');
    expect(karisimEkle(0, 600, 'kucuk')).toBeGreaterThan(karisimEkle(0, 600, 'buyuk'));
    expect(karisimEkle(0.9, 5000, 'kucuk')).toBe(1);
  });
  it('yumurta kenara dışarıdan girince vuruş sayılır (ortada değil)', () => {
    expect(kenaraVurdu(200, 115, 100, 'buyuk')).toBe(true);
    expect(kenaraVurdu(115, 110, 100, 'buyuk')).toBe(false);
    expect(kenaraVurdu(200, 30, 100, 'buyuk')).toBe(false);
    // 3-4: bant geniş
    expect(kenaraVurdu(200, 128, 100, 'kucuk')).toBe(true);
  });
});

describe('Tava: pankek', () => {
  it('alttaki yüz pişer, kabarcık çıkınca çevirme zamanı; çevirince öbür yüz', () => {
    const p = yeniPankek(0.6);
    expect(kabarcikMi(p)).toBe(false);
    pankekPis(p, 7);
    expect(kabarcikMi(p)).toBe(true);
    expect(pismeAdi(ustYuz(p))).toBe('cig');
    pankekPis(p, 5);
    cevir(p);
    expect(pismeAdi(ustYuz(p))).toBe('altin');
    pankekPis(p, 12);
    expect(pankekBitti(p)).toBe(true);
    expect(['altin', 'citir']).toContain(pankekPisme(p));
  });
  it('erken çevirmek öbür yüzü soluk bırakır (yine yenir)', () => {
    const p = yeniPankek(0.6);
    pankekPis(p, 1);
    cevir(p);
    pankekPis(p, 12);
    expect(pankekBitti(p)).toBe(false);
    expect(pismeAdi(ustYuz(p))).toBe('cig');
  });
  it('fiske: 3-4 yaşta yön önemsiz ve hep tavaya döner; 5-6 çok güçlü fiske tavana yapışır', () => {
    expect(fiskeMi(40, 200, 'kucuk')).toBe(true);
    expect(fiskeMi(40, 200, 'buyuk')).toBe(false);
    expect(fiskeMi(-60, 200, 'buyuk')).toBe(true);
    expect(fiskeMi(-60, 900, 'buyuk')).toBe(false);
    expect(fiskeSonucu(9, 'kucuk')).toBe('don');
    expect(fiskeSonucu(1.2, 'buyuk')).toBe('don');
    expect(fiskeSonucu(4, 'buyuk')).toBe('tavan');
  });
  it('tavandayken pişmez', () => {
    const p = yeniPankek(0.5);
    p.tavanda = true;
    pankekPis(p, 30);
    expect(p.yuz).toEqual([0, 0]);
  });
  it('porsiyon', () => {
    expect(porsiyon(1)).toBe('az');
    expect(porsiyon(2)).toBe('normal');
    expect(porsiyon(5)).toBe('kocaman');
  });
});
