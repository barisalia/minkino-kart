import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { HG_NESNELER, HIZLI_TURLAR, YENIDEN_KAT, dizilisSec, enBuyuk, hizliSorular, kendiniSay, nesneBoyu, secenekler, yerlesim, type HgYol } from '../../matematik/src/hizli-gozler';
import { SIRALAR, turTuru } from '../../matematik/src/tur-sirasi';

const YOLLAR: HgYol[] = ['minik', 'dort', 'bes'];

describe('Sayı masası · Hızlı Gözler (anlık sayılama)', () => {
  it('yaşa göre: 2–3 yaş 1–3 ve iki seçenek, 4 yaş 1–5, 5+ 1–10; tur 3–4 soru, art arda aynı adet yok', () => {
    for (const yol of YOLLAR)
      for (const n of HIZLI_TURLAR)
        for (const tekrar of [0, 1, 2]) {
          const sorular = hizliSorular(yol, n, tekrar);
          expect(sorular.length).toBeGreaterThanOrEqual(3);
          expect(sorular.length).toBeLessThanOrEqual(4);
          for (let i = 0; i < sorular.length; i++) {
            const s = sorular[i];
            expect(s.adet).toBeGreaterThanOrEqual(1);
            expect(s.adet).toBeLessThanOrEqual(enBuyuk(yol));
            expect(s.secenek).toContain(s.adet);
            expect(s.secenek).toHaveLength(yol === 'minik' ? 2 : 3);
            for (const r of s.secenek) { expect(r).toBeGreaterThanOrEqual(1); expect(r).toBeLessThanOrEqual(enBuyuk(yol)); }
            if (i) expect(s.adet, 'art arda aynı adet').not.toBe(sorular[i - 1].adet);
            // Çilek yok; çizim diskte.
            expect(s.nesne).not.toBe('cilek');
            expect(existsSync('assets/matematik/' + s.nesne + '.webp'), s.nesne).toBe(true);
          }
        }
    expect(Math.max(...hizliSorular('bes', 17).map((s) => s.adet))).toBe(10);
    expect(Math.max(...hizliSorular('minik', 16).map((s) => s.adet))).toBe(3);
  });

  it('gösterim küçükte uzun, büyükte kısa; ikinci tur daha hızlı; yanlıştan sonra daha uzun', () => {
    const sure = (yol: HgYol, n: number) => hizliSorular(yol, n)[0].sure;
    expect(sure('minik', 16)).toBeGreaterThan(sure('dort', 16));
    expect(sure('dort', 16)).toBeGreaterThan(sure('bes', 16));
    for (const yol of YOLLAR) expect(sure(yol, 17)).toBeLessThan(sure(yol, 16));
    expect(YENIDEN_KAT).toBeGreaterThan(1);
  });

  it('5’ten büyük adet beşlik dizilir (5 + kalan); diziliş çeşitlenir', () => {
    for (let a = 6; a <= 10; a++) expect(dizilisSec(a, 0)).toBe('beslik');
    const dizilisler = new Set([0, 1, 2, 3].map((i) => dizilisSec(4, i)));
    expect(dizilisler.size).toBeGreaterThanOrEqual(3);
    // Tek nesne "sıra" ya da "iki sıra" olmaz; tek sayı iki sıraya bölünmez.
    for (let i = 0; i < 4; i++) { expect(['zar', 'daginik']).toContain(dizilisSec(1, i)); expect(dizilisSec(3, i)).not.toBe('iki-sira'); }
  });

  it('nesneler kutunun içinde ve birbirine değmez; adet kadar yer var; az nesne büyük görünür', () => {
    const oran = 1.9; // kutu 1,9 : 1
    expect(nesneBoyu(2)).toBeGreaterThan(nesneBoyu(5));
    expect(nesneBoyu(5)).toBeGreaterThan(nesneBoyu(9));
    for (const d of ['zar', 'sira', 'iki-sira', 'daginik', 'beslik'] as const)
      for (let a = 1; a <= 10; a++) {
        if (dizilisSec(a, 0) !== d && ![0, 1, 2, 3].some((i) => dizilisSec(a, i) === d)) continue;
        const genislik = nesneBoyu(a);
        for (const tohum of [0, 1]) {
          const y = yerlesim(d, a, tohum);
          expect(y, d + ' ' + a).toHaveLength(a);
          for (const p of y) {
            expect(p.x - genislik / 2).toBeGreaterThanOrEqual(0);
            expect(p.x + genislik / 2).toBeLessThanOrEqual(1);
            expect(p.y - (genislik * oran) / 2).toBeGreaterThanOrEqual(-0.02);
            expect(p.y + (genislik * oran) / 2).toBeLessThanOrEqual(1.02);
          }
          for (let i = 0; i < a; i++)
            for (let j = i + 1; j < a; j++) {
              const dx = y[i].x - y[j].x, dy = (y[i].y - y[j].y) / oran;
              expect(Math.hypot(dx, dy), d + ' ' + a + ': ' + i + '-' + j).toBeGreaterThanOrEqual(genislik * 0.98);
            }
        }
      }
  });

  it('doğru cevaptan sonra kendini sayar; beşlikte "beş"ten sürer (üstüne sayma)', () => {
    expect(kendiniSay('zar', 3).map((a) => a.sayi)).toEqual([1, 2, 3]);
    const sekiz = kendiniSay('beslik', 8);
    expect(sekiz.map((a) => a.sayi)).toEqual([5, 6, 7, 8]);
    expect(sekiz[0].nesneler).toEqual([0, 1, 2, 3, 4]);
    expect(sekiz.flatMap((a) => a.nesneler).sort((x, y) => x - y)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it('her yaşın Sayı sırasında Hızlı Gözler var, ilk paylaştırmadan sonra; seçenekler doğruyu her yerde gösterir', () => {
    for (const yol of YOLLAR) {
      const sira = SIRALAR[yol].sayi;
      expect(sira.filter((n) => turTuru('sayi', n) === 'hizli').length).toBeGreaterThanOrEqual(1);
      expect(sira.slice(0, 2).map((n) => turTuru('sayi', n))).toEqual(['say', 'paylas']);
    }
    // Doğru rakam seçeneklerde farklı konumlara düşer.
    const konumlar = new Set([0, 1, 2].map((i) => secenekler('dort', 3, i).indexOf(3)));
    expect(konumlar.size).toBe(3);
    expect(HG_NESNELER).not.toContain('cilek');
  });
});
