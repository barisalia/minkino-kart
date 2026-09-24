import { describe, expect, it } from 'vitest';
import { dosyaDogrula } from '../../src/engine/dogrula';
import { KARTLAR, TEMALAR, tumIcerikDosyalari } from '../../src/engine/katalog';
import { TEMA_SORU_EN_AZ } from '../../src/engine/kurallar';
import { YASLAR } from '../../src/engine/types';
import metinler from '../../content/metinler.json';

/** Karakter sınırları: soru tek kısa cümle, ipucu ve açıklama birkaç kelime */
const SINIR = { soru: 45, soruKelime: 6, ipucu: 30, ipucuKelime: 4, metin: 30 };

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

  it('konuşma metinleri kısa (çocuk dikkati için)', () => {
    const uzun: string[] = [];
    const kelime = (t: string) => t.trim().split(/\s+/).length;
    for (const d of dosyalar) {
      for (const s of d.sorular) {
        const soru = s.soru_ses ?? s.soru_metni;
        if (soru.length > SINIR.soru || kelime(soru) > SINIR.soruKelime) uzun.push(`${d.yas}/${d.tema} soru: ${soru}`);
        if (s.ipucu && (s.ipucu.length > SINIR.ipucu || kelime(s.ipucu) > SINIR.ipucuKelime)) uzun.push(`${d.yas}/${d.tema} ipucu: ${s.ipucu}`);
      }
    }
    for (const [k, v] of Object.entries(metinler)) for (const t of [v].flat()) if (t.length > SINIR.metin) uzun.push(`metinler.${k}: ${t}`);
    expect(uzun).toEqual([]);
  });

  it('toplam 250+ soru', () => {
    const toplam = dosyalar.reduce((t, d) => t + d.sorular.length, 0);
    expect(toplam).toBeGreaterThanOrEqual(250);
  });
});
