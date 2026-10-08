import { describe, expect, it } from 'vitest';
import { KARTLAR } from '../../src/engine/katalog';
import { diziGenis, gorselUrl, gorunenOlcek, KART_GORSEL_KLASORLERI, renkResmi } from '../../src/ui/kart';

// Kart resimleri yalnız seçili klasörlerden pakete girer (eskiden bütün assets/**/*.webp: mağaza ekran görüntüleri,
// pasta çizimleri de Kartlar'a giriyordu). Her kartın resmi yine bulunmalı.
describe('kart görselleri', () => {
  it('her resimli kartın görseli pakette', () => {
    const eksik = KARTLAR.filter((k) => k.gorsel && !gorselUrl(k)).map((k) => k.gorsel);
    expect(eksik).toEqual([]);
  });

  it('kart görselleri yalnız kart klasörlerinden', () => {
    for (const k of KARTLAR) if (k.gorsel) expect(KART_GORSEL_KLASORLERI).toContain(k.gorsel.split('/')[0]);
  });

  it('renk ve şekil kartları resimli (kodla çizilmiş jöle leke / düz şekil değil)', () => {
    for (const k of KARTLAR.filter((k) => k.tur === 'renk')) {
      expect(renkResmi('boya', k), k.id).toBeTruthy();
      // renk sepeti (bicim: renk) da resimli
      expect(renkResmi('sepet', k), k.id).toBeTruthy();
    }
    for (const k of KARTLAR.filter((k) => k.tur === 'sekil')) expect(renkResmi('sekil', k), k.id).toBeTruthy();
  });

  it('boy sırası: en küçük kart da seçilebilir büyüklükte, sıra korunur', () => {
    const o = [0.3, 0.4, 0.5, 0.6, 0.75, 0.8, 1].map(gorunenOlcek);
    expect(o[0]).toBeGreaterThanOrEqual(0.62);
    expect(o.at(-1)).toBe(1);
    for (let i = 1; i < o.length; i++) expect(o[i]).toBeGreaterThan(o[i - 1]);
  });

  it('dizide 4+ adetli kart varsa hepsi aynı (geniş) boyda', () => {
    const dizi = [{ kart: 'elma', adet: 3 }, { kart: 'elma', adet: 5 }];
    expect(diziGenis(dizi)).toBe(true);
    expect(diziGenis([{ kart: 'elma', adet: 3 }, 'elma'])).toBe(false);
  });

  it('Mino resmi açılış için var', () => {
    expect(gorselUrl({ id: 'mino', ad: 'Mino', tema: '', tur: 'resim', gorsel: 'karakter/mino.webp' })).toBeTruthy();
  });
});
