import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import icerik from '../../content/oyunlu/kinonun-bir-gunu.json';
import kinoJson from '../../assets/karakter/kino-yeni/kino-yeni.json';
import type { KuklaIskelet } from '../../film/src/kukla';
import { sozSuresi } from '../../film/src/oyunlu/aktor';
import { kostumGiydir, PIJAMA } from '../../film/src/oyunlu/kostum';
import { kopukYolu } from '../../film/src/oyunlu/kum-saati';
import { ESIK, YardimMerdiveni } from '../../film/src/oyunlu/yardim';

const kelime = (m: string) => m.split(/\s+/).filter(Boolean).length;

describe("Kino'nun Bir Günü: sözler (OYUNLU-FORMAT §3, SERI-KITABI §5)", () => {
  const sozler = Object.entries(icerik.sozler) as [string, { kim: string; metin: string; tur?: string }][];
  it('oyun sesi: en çok 6 kelime / 30 harf, soru yok, "yanlış / tekrar dene" yok', () => {
    for (const [id, s] of sozler.filter(([, s]) => s.tur === 'oyun')) {
      expect(kelime(s.metin), id).toBeLessThanOrEqual(6);
      expect(s.metin.length, id).toBeLessThanOrEqual(30);
      expect(s.metin, id).not.toMatch(/\?/);
    }
    for (const [id, s] of sozler) expect(s.metin.toLocaleLowerCase('tr'), id).not.toMatch(/yanlış|tekrar dene|olmadı/);
  });
  it('karakter cümlesi en çok 7, anlatıcı en çok 12 kelime; anlatıcı izleyiciye soru sormaz', () => {
    for (const [id, s] of sozler) {
      if (s.kim === 'anlatici') {
        expect(kelime(s.metin), id).toBeLessThanOrEqual(12);
        expect(s.metin, id).not.toMatch(/\?/);
      } else expect(kelime(s.metin), id).toBeLessThanOrEqual(7);
    }
  });
  it('söylenme süresi metinle büyür, anlatıcı biraz daha yavaş', () => {
    expect(sozSuresi('Abi!')).toBeLessThan(sozSuresi('Ben büyüdüm artık! Hepsini kendim yaparım.'));
    expect(sozSuresi('Kum bitene kadar.', true)).toBeGreaterThan(sozSuresi('Kum bitene kadar.'));
  });
});

describe('yardım merdiveni (OYUNLU-FORMAT §4)', () => {
  const kos = (m: YardimMerdiveni, sn: number, ilerleme = false) => {
    const olan: string[] = [];
    for (let t = 0; t < sn; t += 0.1) {
      const b = m.adim(0.1, ilerleme);
      if (b) olan.push(b);
    }
    return olan;
  };
  it('5 parla, 10 söyle, 18 göster, 30 bitir; sırayla ve birer kez', () => {
    const m = new YardimMerdiveni();
    expect(kos(m, ESIK.parla - 0.3)).toEqual([]);
    expect(kos(m, 31 - ESIK.parla + 0.3)).toEqual(['parla', 'soyle', 'goster', 'bitir']);
    expect(m.bitiriyor).toBe(true);
  });
  it('çocuk ilerleyince süre baştan sayılır', () => {
    const m = new YardimMerdiveni();
    expect(kos(m, 9)).toEqual(['parla']);
    kos(m, 0.5, true);
    expect(m.parla).toBe(false);
    expect(kos(m, 4.5)).toEqual([]);
  });
  it('yalnız izle: hemen bitir basamağı; tavan 60 sn', () => {
    expect(kos(new YardimMerdiveni(true), 0.2)).toEqual(['bitir']);
    const m = new YardimMerdiveni();
    // her 4 sn'de biraz ilerleyen çocuk merdivene hiç çıkmaz ama 60 sn'de oyun kendiliğinden biter
    let bitti = false;
    for (let t = 0; t < 61 && !bitti; t += 0.1) bitti = m.adim(0.1, Math.floor(t * 10) % 40 === 0) === 'bitir';
    expect(bitti).toBe(true);
  });
  it('kaçırma: 2 parla, 4 mıknatıs, 6 el tutar', () => {
    const m = new YardimMerdiveni();
    m.kacir();
    expect(m.parla).toBe(false);
    m.kacir();
    expect(m.parla).toBe(true);
    m.kacir();
    m.kacir();
    expect(m.miknatis).toBeGreaterThan(1);
    expect(m.kacir()).toBeNull();
    expect(m.kacir()).toBe('el-tut');
  });
});

describe('Oyun 1 Kum Saati: köpüğün yolu', () => {
  it('3-4: üst dişler sağdan sola, alt dişler soldan sağa, düz çizgi', () => {
    const bas = kopukYolu(0, false), orta = kopukYolu(0.4, false), alt = kopukYolu(0.6, false), son = kopukYolu(1, false);
    expect(bas.sira).toBe('ust');
    expect(orta.p[0]).toBeLessThan(bas.p[0]);
    expect(alt.sira).toBe('alt');
    expect(son.p[0]).toBeGreaterThan(alt.p[0]);
    expect(son.p[1]).toBeGreaterThan(bas.p[1]);
  });
  it('5-6: dört bölge (üst sağ, üst sol, alt sol, alt sağ) ve yukarı-aşağı zikzak', () => {
    expect([0.1, 0.35, 0.6, 0.9].map((u) => kopukYolu(u, true).bolge)).toEqual([0, 1, 2, 3]);
    const ys = Array.from({ length: 40 }, (_, i) => kopukYolu(0.02 + i * 0.005, true).p[1]);
    expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(40);
  });
});

describe('pijama kostümü (KARAKTER-KITI §8.1 K8 yerine)', () => {
  it('aynı dönme noktaları, pijama parçaları, fular gizli; asıl iskelet değişmez', () => {
    const asil = kinoJson as unknown as KuklaIskelet;
    const p = kostumGiydir(asil, PIJAMA);
    expect(p.parcalar.govde.resim).toBe('pijama/govde.webp');
    expect(p.parcalar.govde.pivot).toEqual(asil.parcalar.govde.pivot);
    expect(p.parcalar['kol-ust-sag'].dolgu).toBe('pijama/kol-ust-sag.dolgu.webp');
    expect(p.gizli).toContain('fular');
    expect(asil.parcalar.govde.resim).toBe('govde.webp');
    expect(asil.gizli).not.toContain('fular');
    for (const ad of PIJAMA.parcalar) {
      const q = p.parcalar[ad];
      expect(existsSync(resolve('assets/karakter/kino-yeni', q.resim)), q.resim).toBe(true);
      if (q.dolgu) expect(existsSync(resolve('assets/karakter/kino-yeni', q.dolgu)), q.dolgu).toBe(true);
    }
  });
});
