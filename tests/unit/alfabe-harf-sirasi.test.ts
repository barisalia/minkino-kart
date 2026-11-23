import { describe, expect, it } from 'vitest';
import dersler from '../../alfabe/src/harfler.json';
import { HARF_SIRASI, SES_GRUPLARI, grupNo, siraNo, siradakiHarf, sonrakiHarf } from '../../alfabe/src/harf-sirasi';

// Harf derslerinin öğrenme sırası: okuldaki beş ses grubu (Barış, 20 Kasım 2026).
const harf = (id: string) => dersler.find(d => d.id === id)!.upper;

describe('ses grubu sırası', () => {
  it('29 harfin hepsi bir kez, beş grupta: A N E T İ L · O K U R I M · Ü S Ö Y D Z · Ç B G C Ş · P H V Ğ F J', () => {
    expect(HARF_SIRASI).toHaveLength(29);
    expect(new Set(HARF_SIRASI).size).toBe(29);
    expect([...HARF_SIRASI].sort()).toEqual(dersler.map(d => d.id).sort());
    expect(SES_GRUPLARI.map(g => g.map(harf).join(' '))).toEqual(['A N E T İ L', 'O K U R I M', 'Ü S Ö Y D Z', 'Ç B G C Ş', 'P H V Ğ F J']);
  });
  it('sıra ve grup numarası', () => {
    expect(siraNo('01')).toBe(0);
    expect(siraNo('13')).toBe(28);
    expect(grupNo('02')).toBe(3);
    expect(siraNo('99')).toBe(-1);
  });
  it('sıradaki harf yeni sıradaki ilk bitmemiş harftir; eski sırayla bitirilenler bitmiş sayılır', () => {
    expect(harf(siradakiHarf([])!)).toBe('A');
    expect(harf(siradakiHarf(['01'])!)).toBe('N');
    // Eski A–Z sırasıyla A, B, C, Ç bitmiş: sıradaki N.
    expect(harf(siradakiHarf(['01', '02', '03', '04'])!)).toBe('N');
    expect(siradakiHarf(HARF_SIRASI)).toBeUndefined();
  });
  it('ders sonunda bir sonraki bitmemiş harf (sonda başa döner)', () => {
    expect(harf(sonrakiHarf('01', ['01'])!)).toBe('N');
    expect(harf(sonrakiHarf('17', ['01', '17', '06'])!)).toBe('T');
    expect(harf(sonrakiHarf('13', ['13'])!)).toBe('A');
    expect(sonrakiHarf('01', HARF_SIRASI)).toBeUndefined();
  });
});

describe('Hece Evleri ev sırası', () => {
  it('evler harf derslerinin okul sırasını izler (ünlüler ve hece başında olmayan ğ hariç)', async () => {
    const veri = (await import('../../alfabe/src/hece-evleri-veri.json')).default as { unsuzler: string[] };
    const unluler = new Set(['a', 'e', 'ı', 'i', 'o', 'ö', 'u', 'ü', 'ğ']);
    const beklenen = HARF_SIRASI.map(id => dersler.find(d => d.id === id)!.lower).filter(h => !unluler.has(h));
    expect(veri.unsuzler).toEqual(beklenen);
    expect(veri.unsuzler.join(' ')).toBe('n t l k r m s y d z ç b g c ş p h v f j');
  });
});
