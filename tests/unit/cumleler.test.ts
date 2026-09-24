import { describe, expect, it } from 'vitest';
import { dogruCumlesi, kartSesi, normal, tumCumleler } from '../../src/audio/cumleler';
import { metin } from '../../src/audio/metin';
import { tumIcerikDosyalari } from '../../src/engine/katalog';

describe('seslendirme cümleleri', () => {
  const hepsi = new Set(tumCumleler());
  it('oyunun söyleyeceği her parça listede', () => {
    for (const d of tumIcerikDosyalari()) {
      for (const s of d.sorular) {
        expect(hepsi.has(normal(s.soru_ses ?? s.soru_metni))).toBe(true);
        if (s.ipucu) expect(hepsi.has(normal(s.ipucu))).toBe(true);
        if (s.tip !== 'HAFIZA') for (const p of dogruCumlesi(s)) expect(hepsi.has(normal(p))).toBe(true);
      }
    }
    expect(hepsi.has(normal(metin('tema_kilitli', { kalan: 6 })))).toBe(true);
    expect(hepsi.has('Üç yıldız!')).toBe(true);
    for (const p of kartSesi('kedi')) expect(hepsi.has(p)).toBe(true);
  });
  it('makul boyutta', () => {
    expect(hepsi.size).toBeGreaterThan(500);
    expect([...hepsi].reduce((t, c) => t + c.length, 0)).toBeLessThan(70000);
  });
});
