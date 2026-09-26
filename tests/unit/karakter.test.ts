import { describe, expect, it } from 'vitest';
import kopek from '../../assets/karakter-iskelet/kopek.json';
import tavsan from '../../assets/karakter-iskelet/tavsan.json';
import { ifadeSetleri } from '../../src/karakter/karakter';

describe('karakter: ifade setleri (gizli eklerden)', () => {
  it('köpek üzgün: üzgün göz/kaş/ağız ve düşük kulaklar görünür, normalleri gizlenir', () => {
    const s = ifadeSetleri(kopek).uzgun;
    expect(new Set(s.goster)).toEqual(new Set(['goz-uzgun', 'kas-uzgun', 'agiz-uzgun', 'kulak-sol-dusuk', 'kulak-sag-dusuk']));
    expect(new Set(s.gizle)).toEqual(new Set(['goz-sol', 'goz-sag', 'kas', 'agiz', 'kulak-sol', 'kulak-sag']));
  });
  it('ifadesi olmayan karakterde set yok; göz kırpma / açık ağız ifade sayılmaz', () => {
    expect(ifadeSetleri(tavsan)).toEqual({});
  });
  it('JSON "ifadeler" alanı türetileni ezer', () => {
    const s = ifadeSetleri({ ...kopek, ifadeler: { uzgun: { goster: ['goz-uzgun'], gizle: ['goz-sol'] } } });
    expect(s.uzgun).toEqual({ goster: ['goz-uzgun'], gizle: ['goz-sol'] });
  });
});
