import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { UNITELER } from '../../ingilizce/src/icerik';
import { EVDE_CUMLELER, evdeSesMetinleri } from '../../ingilizce/src/evde-cumleler';

// Büyükler için · Evde 3 İngilizce Cümle (20 Kasım 2026, ingilizce/src/evde-cumleler.ts)
describe('ingilizce · Evde 3 İngilizce Cümle', () => {
  it('her adanın üç cümlesi var; her cümle o adanın bir kelimesini taşır, cümleler birbirini tekrarlamaz', () => {
    expect(Object.keys(EVDE_CUMLELER).sort()).toEqual(UNITELER.map((u) => u.id).sort());
    const hepsi = Object.values(EVDE_CUMLELER).flat().map((c) => c.en);
    expect(new Set(hepsi).size).toBe(hepsi.length);
    for (const u of UNITELER) {
      for (const c of EVDE_CUMLELER[u.id]) {
        const kucuk = c.en.toLowerCase();
        expect(u.kelimeler.some((w) => kucuk.includes(w.en.toLowerCase())), `${u.id}: ${c.en}`).toBe(true);
        expect(c.en.split(/\s+/).length, c.en).toBeLessThanOrEqual(8);
        expect(c.tr.length).toBeGreaterThan(3);
      }
    }
  });

  it('Polly’nin 72 kaydı diskte, her cümle ayrı kayıt', () => {
    const sesler = evdeSesMetinleri();
    expect(sesler).toHaveLength(72);
    expect(sesler.every((s) => s.kim === 'polly' && s.dil === 'en')).toBe(true);
    expect(sesler.filter((s) => !existsSync(`assets/ingilizce/ses/${s.id}.mp3`)).map((s) => s.id)).toEqual([]);
  });
});
