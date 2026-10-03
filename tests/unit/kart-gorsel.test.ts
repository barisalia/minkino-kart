import { describe, expect, it } from 'vitest';
import { KARTLAR } from '../../src/engine/katalog';
import { gorselUrl, KART_GORSEL_KLASORLERI } from '../../src/ui/kart';

// Kart resimleri yalnız seçili klasörlerden pakete girer (eskiden bütün assets/**/*.webp: mağaza ekran görüntüleri,
// pasta/okul çizimleri de Kartlar'a giriyordu). Her kartın resmi yine bulunmalı.
describe('kart görselleri', () => {
  it('her resimli kartın görseli pakette', () => {
    const eksik = KARTLAR.filter((k) => k.gorsel && !gorselUrl(k)).map((k) => k.gorsel);
    expect(eksik).toEqual([]);
  });

  it('kart görselleri yalnız kart klasörlerinden', () => {
    for (const k of KARTLAR) if (k.gorsel) expect(KART_GORSEL_KLASORLERI).toContain(k.gorsel.split('/')[0]);
  });

  it('Mino resmi açılış için var', () => {
    expect(gorselUrl({ id: 'mino', ad: 'Mino', tema: '', tur: 'resim', gorsel: 'karakter/mino.webp' })).toBeTruthy();
  });
});
