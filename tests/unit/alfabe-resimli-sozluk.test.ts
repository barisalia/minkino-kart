import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { bulHedefleri, EN_COK, harfinMi, hecelere, ornekMi, parlayanYer, sayfaSozcukleri, type SozlukSozcugu } from '../../alfabe/src/sozluk-secim';

// Resimli Sözlük'ün saf kuralları (alfabe/src/sozluk-secim.ts).
const s = (ad: string, id = ad.toLocaleLowerCase('tr')): SozlukSozcugu => ({ id, ad, gorsel: 'x', ses: 'y' });
const A = { id: '01', upper: 'A', lower: 'a', example: 'Armut' };
const G = { id: '09', upper: 'Ğ', lower: 'ğ', example: 'Dağ' };
const B = { id: '02', upper: 'B', lower: 'b', example: 'Balık' };

describe('Resimli Sözlük', () => {
  it('harfin sözcükleri: harfle başlayanlar; Ğ\'de içinde geçenler', () => {
    expect(harfinMi(A, 'Arı')).toBe(true);
    expect(harfinMi(A, 'Balon')).toBe(false);
    expect(harfinMi(G, 'Ağaç')).toBe(true);
    expect(harfinMi(G, 'Gemi')).toBe(false);
  });
  it('sayfa: örnek sözcük (adıyla da tanınır) önde, aynı ad bir kez, en çok 6', () => {
    const liste = ['Arı', 'Ayva', 'Ağaç', 'At', 'Armut', 'Ayı', 'Arı', 'Ateş', 'Balon'].map(x => s(x));
    const sayfa = sayfaSozcukleri(A, liste);
    expect(sayfa[0].ad).toBe('Armut');
    expect(sayfa).toHaveLength(EN_COK);
    expect(new Set(sayfa.map(x => x.ad)).size).toBe(sayfa.length);
    expect(sayfa.every(x => x.ad.startsWith('A'))).toBe(true);
    expect(ornekMi(A, s('Armut', '01'))).toBe(true);
  });
  it('heceler ve parlayan harf', () => {
    expect(hecelere('Balon')).toEqual([['ba', 'lon']]);
    expect(hecelere('Uğur böceği')).toEqual([['u', 'ğur'], ['bö', 'ce', 'ği']]);
    expect(parlayanYer(A, 'Arı')).toEqual([0, 0, 0]);
    expect(parlayanYer(G, 'Uğur böceği')).toEqual([0, 1, 0]);
    expect(parlayanYer(G, 'Dağ')).toEqual([0, 0, 2]);
  });
  it('bul hedefi: örnek sözcük değil; iki harfte aynı sözcük hedef olmaz', () => {
    const sayfalar = {
      '01': sayfaSozcukleri(A, ['Armut', 'Arı', 'Ağaç'].map(x => s(x))),
      '09': sayfaSozcukleri(G, ['Dağ', 'Ağaç'].map(x => s(x))),
      '02': sayfaSozcukleri(B, ['Balık', 'Balon'].map(x => s(x))),
    };
    const h = bulHedefleri(['01', '09', '02'], sayfalar, [A, G, B]);
    expect(h['01']).not.toBe('armut');
    expect(h['02']).toBe('balon');
    expect(new Set(Object.values(h)).size).toBe(Object.values(h).length);
    // Ğ'nin tek örnek dışı sözcüğü (ağaç) A'ya hedef olduysa Ğ'ye hedef verilmez, tekrar olmaz.
    if (h['01'] === 'ağaç') expect(h['09']).toBeUndefined();
  });
  it('Ceren\'in iki yönergesi kayıtlı', () => {
    for (const id of ['sozluk-giris', 'sozluk-bul']) expect(existsSync('assets/alfabe/ses/' + id + '.mp3'), id).toBe(true);
    const m = JSON.parse(readFileSync('alfabe/ses-metinleri.json', 'utf8'));
    expect(m['sozluk-giris']).toContain('sözlüğü');
    expect(m['sozluk-bul']).toContain('bul');
  });
});
