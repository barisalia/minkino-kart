import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { CIFTLER, farkSesi, harfCizgileri, harfSesi, isteSesi, siradakiTepsi, tepsiHarfleri, uygunCiftler } from '../../alfabe/src/kurabiye-secim';

// Mino'nun Harf Kurabiyesi: saf kurallar (alfabe/src/kurabiye-secim.ts).
const kayit = (id: string) => existsSync('assets/alfabe/ses/' + id + '.mp3');
const harfler = (h: string) => new Set([...h]);

describe('Mino’nun Harf Kurabiyesi', () => {
  it('yalnız iki harfi de bitmiş çiftler', () => {
    expect(uygunCiftler(harfler('oö'))).toEqual([['O', 'Ö']]);
    expect(uygunCiftler(harfler('oucs'))).toEqual([]);
    expect(uygunCiftler(harfler('ıi')).map(c => c.join(''))).toEqual(['Iİ']);
    expect(uygunCiftler(harfler('abcçdefgğhıijklmnoöprsştuüvyz'))).toHaveLength(7);
  });
  it('tepsiler çiftler arasında döner, her turda aranan harf çiftin öbürüne geçer', () => {
    const c = uygunCiftler(harfler('oöuü'));
    expect([0, 1, 2, 3].map(n => siradakiTepsi(c, n)!.hedef)).toEqual(['O', 'U', 'Ö', 'Ü']);
    expect(siradakiTepsi([], 0)).toBeUndefined();
  });
  it('tepside 3 aranan; 2–3 yaşta 2, 4 yaşta 3 eş harf', () => {
    for (let i = 0; i < 20; i++) {
      const a = tepsiHarfleri('Ö', 'O', '2-3'), b = tepsiHarfleri('Ö', 'O', '4');
      expect([a.filter(h => h === 'Ö').length, a.filter(h => h === 'O').length]).toEqual([3, 2]);
      expect([b.filter(h => h === 'Ö').length, b.filter(h => h === 'O').length]).toEqual([3, 3]);
    }
  });
  it('fark çizgisi: işaretli harfte işaret parlar, işaretsizde eşin işareti kesik görünür; B/D’de karın', () => {
    const o = harfCizgileri('Ö', 'O');
    expect(o.fark).toEqual([1, 2]);
    expect(o.hayalet).toEqual([]);
    const oo = harfCizgileri('O', 'Ö');
    expect(oo.fark).toEqual([]);
    expect(oo.hayalet).toHaveLength(2);
    expect(harfCizgileri('Ç', 'C').fark).toEqual([1]);
    expect(harfCizgileri('İ', 'I').fark).toEqual([1]);
    expect(harfCizgileri('Ğ', 'G').fark).toEqual([1]);
    expect(harfCizgileri('B', 'D').fark).toEqual([1, 2]);
    expect(harfCizgileri('D', 'B').fark).toEqual([1]);
  });
  it('her istek, her fark cümlesi ve her harf sesi için Ceren kaydı var', () => {
    expect(kayit('kurabiye-giris') && kayit('kurabiye-zil')).toBe(true);
    for (const [a, b] of CIFTLER) for (const [h, y] of [[a, b], [b, a]]) {
      expect(kayit(isteSesi(h)), isteSesi(h)).toBe(true);
      expect(kayit(farkSesi(h, y)), farkSesi(h, y)).toBe(true);
      expect(kayit(harfSesi(h)), harfSesi(h)).toBe(true);
    }
  });
});
