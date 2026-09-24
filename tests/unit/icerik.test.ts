import { describe, expect, it } from 'vitest';
import { dosyaDogrula } from '../../src/engine/dogrula';
import { KARTLAR, TEMALAR, tumIcerikDosyalari } from '../../src/engine/katalog';
import { TEMA_SORU_EN_AZ } from '../../src/engine/kurallar';
import { YASLAR } from '../../src/engine/types';

describe('içerik', () => {
  const dosyalar = tumIcerikDosyalari();

  it('kart id’leri benzersiz', () => {
    expect(new Set(KARTLAR.map((k) => k.id)).size).toBe(KARTLAR.length);
  });

  for (const yas of YASLAR) {
    for (const t of TEMALAR) {
      it(`${yas} yaş / ${t.id}: en az ${TEMA_SORU_EN_AZ} geçerli soru`, () => {
        const d = dosyalar.find((f) => f.yas === yas && f.tema === t.id);
        expect(d, 'dosya yok').toBeDefined();
        expect(dosyaDogrula(d!)).toEqual([]);
        expect(d!.sorular.length).toBeGreaterThanOrEqual(TEMA_SORU_EN_AZ);
      });
    }
  }

  it('toplam 250+ soru', () => {
    const toplam = dosyalar.reduce((t, d) => t + d.sorular.length, 0);
    expect(toplam).toBeGreaterThanOrEqual(250);
  });
});
