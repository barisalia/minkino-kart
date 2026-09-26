import { describe, expect, it } from 'vitest';
import karpuz from '../../content/film/mino-karpuz.json';
import { tumCumleler } from '../../src/audio/cumleler';

interface Olay { t: number; kim: string; yap: string; metin?: string }
const sahneler = karpuz.sahneler.filter((s): s is Extract<typeof s, { olaylar: unknown }> => 'olaylar' in s);
const cumleler = sahneler.flatMap((s) => (s.olaylar as Olay[]).filter((o) => o.yap === 'soyle').map((o) => o.metin as string));

describe('film: Mino’nun Karpuzu', () => {
  it('animatik: cümleler Barış onaylayana kadar seslendirme listesinde değil', () => {
    expect(karpuz.seslendir).toBe(false);
    const liste = new Set(tumCumleler());
    for (const c of [...cumleler, 'Paylaşmak güzeldir.']) expect(liste.has(c), c).toBe(false);
  });
  it('cümleler kısa: karakter ≤ 6 kelime', () => {
    for (const c of cumleler) expect(c.split(/\s+/).length, c).toBeLessThanOrEqual(6);
  });
  it('zaman çizelgesi sahne süresi içinde, her olayın kimi sahnede var', () => {
    for (const s of sahneler) {
      const varlar = new Set(['kamera', 'isik', 'efekt', 'parilti', 'anlatici', 'stand', ...Object.keys(s.oyuncular ?? {}), ...Object.keys(s.esyalar ?? {})]);
      for (const o of s.olaylar as Olay[]) {
        expect(o.t, `${s.ad} ${o.kim}`).toBeLessThanOrEqual(s.sure);
        expect(varlar.has(o.kim), `${s.ad}: ${o.kim}`).toBe(true);
      }
    }
  });
});
