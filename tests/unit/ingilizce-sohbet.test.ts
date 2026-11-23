import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SOHBETLER, sohbetSesleri, sohbetTurlari } from '../../ingilizce/src/sohbet-veri';

// Karakterlerle sohbet (23 Kasım 2026): Polly, Mino, Zıpzıp, Lokum; dört tur, havuzdan üç soru ve son davet
const KARAKTERLER = Object.values(SOHBETLER);

describe('karakterlerle sohbet', () => {
  it('her sohbet dört tur: üç farklı soru ve sonda davet', () => {
    for (const k of KARAKTERLER) {
      for (let t = 1; t < 20; t++) {
        let n = t; const rnd = () => { n = (n * 9301 + 49297) % 233280; return n / 233280; };
        const l = sohbetTurlari(k, rnd);
        expect(l).toHaveLength(4);
        expect(new Set(l.map((s) => s.id)).size).toBe(4);
        expect(l[3]).toBe(k.son);
      }
    }
  });

  it('her soru üç cevaplı, davet iki cevaplı (yes / no); cümleler kısa', () => {
    for (const k of KARAKTERLER) {
      expect(k.havuz.length).toBeGreaterThanOrEqual(4);
      for (const s of k.havuz) {
        expect(s.cevaplar).toHaveLength(3);
        expect(s.en.split(' ').length).toBeLessThanOrEqual(8);
        for (const c of s.cevaplar) expect(c.en.split(' ').length).toBeLessThanOrEqual(9);
      }
      expect(k.son.cevaplar.map((c) => c.id)).toEqual(['yes', 'no']);
    }
  });

  it('cevapların resmi var', () => {
    for (const k of KARAKTERLER) for (const s of k.havuz) for (const c of s.cevaplar) expect(existsSync(`assets/ingilizce/kelime/${c.id}.webp`), `${k.karakter}:${c.id}`).toBe(true);
  });

  it('bütün kayıtlar diskte', () => {
    const eksik = KARAKTERLER.flatMap((k) => sohbetSesleri(k)).filter((id) => !existsSync(`assets/ingilizce/ses/${id}.mp3`));
    expect(eksik).toEqual([]);
  });
});
