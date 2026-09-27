import { describe, expect, it } from 'vitest';
import elma from '../../content/film/kino-elma-kulesi.json';
import karpuz from '../../content/film/mino-karpuz.json';
import seslendirme from '../../content/seslendirme.json';
// efekt modülü Web Audio / document ister: adlar kaynaktan okunur (FILM_EFEKT'in yöntemleri + nota0…nota9)
import efektKaynak from '../../film/src/efekt.ts?raw';
const FILM_EFEKT = Object.fromEntries([...[...efektKaynak.matchAll(/^ {2}([a-z]+)\(\) \{/gm)].map((m) => m[1]), ...Array.from({ length: 10 }, (_, i) => `nota${i}`)].map((a) => [a, true]));
import { karakterCumleleri, tumCumleler } from '../../src/audio/cumleler';

interface Olay { t: number; kim: string; yap: string; metin?: string; ad?: string | null }
const sahneler = karpuz.sahneler.filter((s): s is Extract<typeof s, { olaylar: unknown }> => 'olaylar' in s);
const cumleler = sahneler.flatMap((s) => (s.olaylar as Olay[]).filter((o) => o.yap === 'soyle').map((o) => o.metin as string));

describe('film: Mino’nun Karpuzu', () => {
  // Barış 2026-09-27 gece seslendirmeyi onayladı: cümleler seslendirme listesinde olmalı
  it('seslendirme açık: bütün cümleler ve öğüt seslendirme listesinde', () => {
    expect(karpuz.seslendir).toBe(true);
    const liste = new Set(tumCumleler());
    for (const c of [...cumleler, 'Paylaşmak güzeldir.']) expect(liste.has(c), c).toBe(true);
  });
  it('cümleler kısa: karakter ≤ 6 kelime', () => {
    for (const c of cumleler) expect(c.split(/\s+/).length, c).toBeLessThanOrEqual(6);
  });
  it('zaman çizelgesi sahne süresi içinde, her olayın kimi sahnede var', () => {
    for (const s of sahneler) {
      const varlar = new Set(['kamera', 'isik', 'efekt', 'muzik', 'parilti', 'anlatici', 'stand', ...Object.keys(s.oyuncular ?? {}), ...Object.keys(s.esyalar ?? {})]);
      for (const o of s.olaylar as Olay[]) {
        expect(o.t, `${s.ad} ${o.kim}`).toBeLessThanOrEqual(s.sure);
        expect(varlar.has(o.kim), `${s.ad}: ${o.kim}`).toBe(true);
      }
    }
  });
});

// ---------------------------------------------------------------- Kino ve Elma Kulesi
interface ElmaOlay extends Olay { esya?: string; parca?: string }
interface ElmaSahne { ad: string; sure: number; gecis?: string; olaylar: ElmaOlay[]; oyuncular?: Record<string, { tip: string }>; esyalar?: Record<string, { tip: string }> }
const elmaSahneler = elma.sahneler.filter((s) => 'olaylar' in s) as unknown as ElmaSahne[];
const elmaSoz = (kim?: string) => elmaSahneler.flatMap((s) => s.olaylar.filter((o) => o.yap === 'soyle' && (!kim || o.kim === kim)).map((o) => o.metin as string));
const ELMA_OGUT = 'Hata yapınca özür dileriz.';

describe('film: Kino ve Elma Kulesi', () => {
  it('senaryodaki 7 cümle ve öğüt (Barış onayladı: seslendirme açık)', () => {
    expect(elma.seslendir).toBe(true);
    expect(elmaSoz('kino')).toEqual(['Top! Top! Top!', 'Özür dilerim, Mino.', 'Yaşasın!']);
    expect(elmaSoz('mino')).toEqual(['Günaydın! Kulemin son elması bu.', 'Kulem!', 'Olur böyle. Birlikte dizelim!', ELMA_OGUT]);
    expect(elma.sahneler.find((s) => 'ogut' in s)).toEqual({ ogut: ELMA_OGUT });
  });
  it('bütün cümleler seslendirme listesinde', () => {
    const liste = new Set(tumCumleler());
    for (const c of [...elmaSoz(), ELMA_OGUT]) expect(liste.has(c), c).toBe(true);
  });
  it("Kino'nun cümleleri Kino'nun sesine (karakter_sesleri.kino), Mino'nunkiler anlatıcı sesine gider", () => {
    expect(typeof seslendirme.karakter_sesleri.kino).toBe('string');
    const kino = new Set(karakterCumleleri().kino);
    for (const c of elmaSoz('kino')) expect(kino.has(c), c).toBe(true);
    for (const c of [...elmaSoz('mino'), ELMA_OGUT]) expect(kino.has(c), c).toBe(false);
  });
  it('cümleler kısa: Mino ≤ 5, Kino ≤ 3 kelime', () => {
    for (const c of elmaSoz('mino')) expect(c.split(/\s+/).length, c).toBeLessThanOrEqual(5);
    for (const c of elmaSoz('kino')) expect(c.split(/\s+/).length, c).toBeLessThanOrEqual(3);
  });
  it('5 sahne, yaklaşık 58-62 sn; zaman çizelgesi sahne içinde, her olayın kimi sahnede var', () => {
    expect(elmaSahneler.length).toBe(5);
    const toplam = elmaSahneler.reduce((t, s) => t + s.sure, 0);
    expect(toplam).toBeGreaterThanOrEqual(55);
    expect(toplam).toBeLessThanOrEqual(62);
    for (const s of elmaSahneler) {
      const varlar = new Set(['kamera', 'isik', 'efekt', 'muzik', 'parilti', 'anlatici', 'stand', 'toz', ...Object.keys(s.oyuncular ?? {}), ...Object.keys(s.esyalar ?? {})]);
      for (const o of s.olaylar) {
        expect(o.t, `${s.ad} ${o.kim}`).toBeLessThanOrEqual(s.sure);
        expect(varlar.has(o.kim), `${s.ad}: ${o.kim}`).toBe(true);
        // taşınan / bırakılan eşya sahnede olmalı
        if (o.yap === 'al' || o.yap === 'birak') expect(Object.keys(s.esyalar ?? {}), `${s.ad}: ${o.esya}`).toContain(o.esya);
      }
    }
  });
  it('efektler ve müzik ruhları tanımlı (Web Audio)', () => {
    for (const s of elmaSahneler)
      for (const o of s.olaylar) {
        if (o.kim === 'efekt') expect(Object.keys(FILM_EFEKT), o.yap).toContain(o.yap);
        if (o.kim === 'muzik' && o.ad) expect(['nese', 'uzgun', 'aydinlik', 'kapanis', 'yumusak']).toContain(o.ad);
      }
  });
  it('elma kulesi 4-3-2-1: on elma, en parlak elma tepede', () => {
    const ilk = elmaSahneler[0];
    const elmalar = Object.entries(ilk.esyalar ?? {}).filter(([, e]) => e.tip === 'elma');
    expect(elmalar.length).toBe(10);
    const kat = new Map<number, number>();
    for (const [, e] of elmalar) kat.set((e as unknown as { y: number }).y, (kat.get((e as unknown as { y: number }).y) ?? 0) + 1);
    expect([...kat.entries()].sort((a, b) => a[0] - b[0]).map(([, n]) => n)).toEqual([4, 3, 2, 1]);
    expect((ilk.esyalar?.e10 as unknown as { parla?: boolean }).parla).toBe(true);
  });
});
