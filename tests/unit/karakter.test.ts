import { describe, expect, it } from 'vitest';
import kopek from '../../assets/karakter-iskelet/kopek.json';
import tavsan from '../../assets/karakter-iskelet/tavsan.json';
import ayi from '../../assets/karakter-iskelet/ayi.json';
import inek from '../../assets/karakter-iskelet/inek.json';
import maymun from '../../assets/karakter-iskelet/maymun.json';
import kus from '../../assets/karakter-iskelet/kus.json';
import ordek from '../../assets/karakter-iskelet/ordek.json';
import { ifadeSetleri } from '../../src/karakter/karakter';

describe('karakter: ifade setleri (gizli eklerden)', () => {
  it('köpek üzgün: üzgün göz/kaş/ağız ve düşük kulaklar görünür, normalleri gizlenir', () => {
    const s = ifadeSetleri(kopek).uzgun;
    expect(new Set(s.goster)).toEqual(new Set(['goz-uzgun', 'kas-uzgun', 'agiz-uzgun', 'kulak-sol-dusuk', 'kulak-sag-dusuk']));
    expect(new Set(s.gizle)).toEqual(new Set(['goz-sol', 'goz-sag', 'kas', 'agiz', 'kulak-sol', 'kulak-sag']));
  });
  it('ifadesi olmayan karakterde set yok; göz kırpma / açık ağız ifade sayılmaz', () => {
    const yalin = { sira: ['kafa', 'goz-sol', 'goz-sag', 'goz-kapali', 'agiz', 'agiz-acik', 'agiz-gulumse'], gizli: ['goz-kapali', 'agiz-acik', 'agiz-gulumse'] };
    expect(ifadeSetleri(yalin)).toEqual({});
  });
  it('JSON "ifadeler" alanı türetileni ezer', () => {
    const s = ifadeSetleri({ ...kopek, ifadeler: { uzgun: { goster: ['goz-uzgun'], gizle: ['goz-sol'] } } });
    expect(s.uzgun).toEqual({ goster: ['goz-uzgun'], gizle: ['goz-sol'] });
  });
});

describe('müşteri hayvanları: mutlu / şaşkın / üzgün yüz (ekip/illustrator/hayvan-ifade.cjs)', () => {
  const hayvanlar = { ayi, inek, maymun, tavsan, kus, ordek, kopek };
  for (const [ad, b] of Object.entries(hayvanlar)) {
    it(`${ad}: üç ifade var, açık gözler ifadede gizlenir`, () => {
      const s = ifadeSetleri(b);
      for (const ifade of ['mutlu', 'saskin', 'uzgun']) {
        expect(s[ifade], `${ad} ${ifade}`).toBeDefined();
        expect(s[ifade].gizle).toEqual(expect.arrayContaining(['goz-sol', 'goz-sag']));
        // her ifade katmanı gizli başlar ve kafaya (varsa) bağlıdır
        for (const id of s[ifade].goster) {
          expect(b.gizli).toContain(id);
          if (b.sira.includes('kafa') && !id.startsWith('kulak-')) expect((b.bagli as Record<string, string>)[id]).toBe('kafa');
        }
      }
      // ağzı olanlarda mutlu/şaşkın ağız, gagalılarda alt gaga açılır
      const agiz = b.sira.includes('agiz') ? 'agiz' : 'gaga-alt';
      expect(s.mutlu.gizle).toContain(agiz);
      expect(s.saskin.gizle).toContain(agiz);
    });
  }
});
