import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { kelimeBul } from '../../ingilizce/src/icerik';
import { MINI_ANIMASYONLAR, ODUL_EN_COK, ODUL_SERISI, kelimeninAnimasyonu, kutlamaAnimasyonu, odulAnimasyonu, turSuresi } from '../../ingilizce/src/mini-animasyon-veri';

// Mini animasyonlar (22 Kasım 2026, ingilizce/src/mini-animasyon-veri.ts)
describe('ingilizce · mini animasyonlar', () => {
  it('her animasyon dört poz, bir tur 2–3 saniye; kelimeler gerçek, kayıtlar diskte, bir kelimede tek animasyon', () => {
    const kelimeler = new Set<string>();
    for (const a of MINI_ANIMASYONLAR) {
      expect(a.kareler, a.id).toHaveLength(4);
      expect(turSuresi(a), a.id).toBeGreaterThanOrEqual(2000);
      expect(turSuresi(a), a.id).toBeLessThanOrEqual(3200);
      for (const w of a.kelimeler) { expect(kelimeBul(w), `${a.id}/${w}`).toBeTruthy(); expect(kelimeler.has(w), w).toBe(false); kelimeler.add(w); }
      for (const s of a.ses) expect(existsSync(`assets/ingilizce/ses/${s}.mp3`), s).toBe(true);
    }
    expect(new Set(MINI_ANIMASYONLAR.map((a) => a.id)).size).toBe(MINI_ANIMASYONLAR.length);
    expect(kelimeninAnimasyonu('rain')?.id).toBe('semsiye');
    expect(kelimeninAnimasyonu('small')?.id).toBe('balon');
    expect(kelimeninAnimasyonu('cow')).toBeUndefined();
  });

  it('kutlama: her seferinde başka biri, derste oynamış olan gelmez, hazır olmayan gelmez', () => {
    const hepsi = () => true;
    let son: string | null = null;
    const gorulen: string[] = [];
    for (let i = 0; i < MINI_ANIMASYONLAR.length * 2; i++) {
      const id: string = kutlamaAnimasyonu(hepsi, new Set(), son)!.id;
      expect(id).not.toBe(son);
      gorulen.push(id); son = id;
    }
    expect(new Set(gorulen).size).toBe(MINI_ANIMASYONLAR.length);
    expect(kutlamaAnimasyonu(hepsi, new Set(['elma']), 'semsiye')?.id).toBe('soguk');
    expect(kutlamaAnimasyonu((a) => a.id === 'uyku', new Set(), 'uyku')?.id).toBe('uyku');
    expect(kutlamaAnimasyonu((a) => a.id === 'uyku', new Set(['uyku']), null)).toBeUndefined();
    expect(kutlamaAnimasyonu(() => false, new Set(), null)).toBeUndefined();
  });

  it('doğru cevap ödülü: üç doğru üst üste, derste en çok iki, kendi kelimesi önce, kapanışa biri kalır', () => {
    const hepsi = () => true;
    expect(ODUL_SERISI).toBe(3);
    expect(odulAnimasyonu(hepsi, new Set(), null, 'cow', ODUL_SERISI - 1, 0)).toBeUndefined();
    expect(odulAnimasyonu(hepsi, new Set(), null, 'cow', ODUL_SERISI, ODUL_EN_COK)).toBeUndefined();
    expect(odulAnimasyonu(hepsi, new Set(), null, 'apple', ODUL_SERISI, 0)?.id).toBe('elma');
    // kendi animasyonu bu derste oynadıysa sıradaki gelir
    expect(odulAnimasyonu(hepsi, new Set(['elma']), null, 'apple', ODUL_SERISI, 0)?.id).not.toBe('elma');
    // yalnız iki animasyon hazırsa biri ödül olur, öbürü kapanışa kalır
    const iki = (a: { id: string }) => a.id === 'semsiye' || a.id === 'elma';
    const odul = odulAnimasyonu(iki, new Set(), null, 'cow', ODUL_SERISI, 0)!;
    expect(['semsiye', 'elma']).toContain(odul.id);
    expect(odulAnimasyonu(iki, new Set([odul.id]), null, 'cow', ODUL_SERISI, 1)).toBeUndefined();
    expect(kutlamaAnimasyonu(iki, new Set([odul.id]), null)?.id).not.toBe(odul.id);
    // hiç çizim yoksa hiçbir şey
    expect(odulAnimasyonu(() => false, new Set(), null, 'apple', ODUL_SERISI, 0)).toBeUndefined();
  });
});
