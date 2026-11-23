// Matematik · Roket Geri Sayımı, Kelebeğin Kanadı, Meyve Grafiği (M30–M32) kuralları.
import { describe, expect, it } from 'vitest';
import sozler from '../../matematik/src/sozler.json';
import {
  BENEK_YERI, FAZLA_SORUSU, GRAFIK_SOZ, KELEBEK_SOZ, MEYVELER, ROKET_SOZ, SUTUN_BOYU, aynaX, benekUyar, enAz, enCok, fazlaSecenekleri,
  geriSayimlar, grafikVerisi, kacFazla, karisikBloklar, kelebekDesenleri, renkSayisi, sepetSirasi, siradakiBlok,
} from '../../matematik/src/roket-kelebek-grafik';
import { YENI_SOZ } from '../../matematik/src/yeni-turlar';

describe('Roket Geri Sayımı', () => {
  it('gelişe göre: 4 yaş 5 ve 6 → 7 ve 8 → 10 ve 9; 5+ 10 ve 13 → 15 ve 20 → 19 ve 17; çocuk en çok on blok dizer, gerisini Ceren sayar', () => {
    expect(geriSayimlar('dort').map((g) => g.dizilen)).toEqual([[5, 4, 3, 2, 1], [6, 5, 4, 3, 2, 1]]);
    expect(geriSayimlar('dort', 1).map((g) => g.dizilen[0])).toEqual([7, 8]);
    const bes = geriSayimlar('bes');
    expect(bes[0].dizilen).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
    expect([...bes[1].dizilen, ...bes[1].ceren]).toEqual(Array.from({ length: 13 }, (_, i) => 13 - i));
    const yirmi = geriSayimlar('bes', 1)[1];
    expect([...yirmi.dizilen, ...yirmi.ceren]).toEqual(Array.from({ length: 20 }, (_, i) => 20 - i));
    for (let t = 0; t < 5; t++) for (const g of [...geriSayimlar('bes', t), ...geriSayimlar('dort', t)]) {
      expect(g.dizilen.length).toBeLessThanOrEqual(10);
      const hepsi = [...g.dizilen, ...g.ceren];
      for (let i = 1; i < hepsi.length; i++) expect(hepsi[i]).toBe(hepsi[i - 1] - 1);
      expect(hepsi.at(-1)).toBe(1);
    }
  });
  it('karışık bloklar her sayıyı bir kez verir ve dizili gelmez; sıradaki en büyük dizilmemiş', () => {
    for (const g of [0, 1, 2, 3].flatMap((n) => [...geriSayimlar('bes', n), ...geriSayimlar('dort', n)])) for (let t = 0; t < 6; t++) {
      const k = karisikBloklar(g.dizilen, t);
      expect([...k].sort((a, b) => b - a)).toEqual(g.dizilen);
      expect(k).not.toEqual(g.dizilen);
    }
    expect(siradakiBlok([5, 4, 3, 2, 1], 2)).toBe(3);
  });
});

describe('Kelebeğin Kanadı', () => {
  it('gelişe göre: 4 yaş 2 ve 3 benek tek renk → başka desen → 4 tek renk ve 3 iki renk; 5+ hep iki renk, 3–5 benek; yerler kanadın içinde', () => {
    expect(kelebekDesenleri('dort', 0).map((d) => d.length)).toEqual([2, 3]);
    expect(kelebekDesenleri('dort', 2).map((d) => renkSayisi(d))).toEqual([1, 2]);
    for (let t = 0; t < 6; t++) {
      const d4 = kelebekDesenleri('dort', t), d5 = kelebekDesenleri('bes', t);
      for (const d of d4) { expect(d.length).toBeGreaterThanOrEqual(2); expect(d.length).toBeLessThanOrEqual(4); }
      for (const d of d5) { expect(renkSayisi(d)).toBe(2); expect(d.length).toBeGreaterThanOrEqual(3); expect(d.length).toBeLessThanOrEqual(5); }
      if (t < 2) for (const d of d4) expect(renkSayisi(d)).toBe(1);
      for (const d of [...d4, ...d5]) expect(new Set(d.map((b) => b.yer)).size).toBe(d.length);
    }
    for (const p of BENEK_YERI) { expect(p.x - 45).toBeGreaterThanOrEqual(0); expect(p.x + 45).toBeLessThanOrEqual(400); expect(p.y - 45).toBeGreaterThanOrEqual(0); expect(p.y + 45).toBeLessThanOrEqual(560); }
    for (let i = 0; i < BENEK_YERI.length; i++) for (let j = i + 1; j < BENEK_YERI.length; j++)
      expect(Math.hypot(BENEK_YERI[i].x - BENEK_YERI[j].x, BENEK_YERI[i].y - BENEK_YERI[j].y)).toBeGreaterThanOrEqual(95);
    expect(aynaX(105)).toBe(295);
  });
  it('benek yalnız aynasına ve aynı renkte oturur, aynı yere iki kez konmaz', () => {
    const d = kelebekDesenleri('bes', 0)[0];
    const b = d[0], baska = d.find((x) => x.renk !== b.renk)!;
    expect(benekUyar(d, b.yer, b.renk, new Set())).toBe(true);
    expect(benekUyar(d, b.yer, baska.renk, new Set())).toBe(false);
    expect(benekUyar(d, b.yer, b.renk, new Set([b.yer]))).toBe(false);
    const bos = [0, 1, 2, 3, 4, 5].find((y) => !d.some((x) => x.yer === y))!;
    expect(benekUyar(d, bos, 'mavi', new Set())).toBe(false);
  });
});

describe('Meyve Grafiği', () => {
  it('en çok, en az tek; kaç fazla seçeneklerinde doğru cevap; sütunlar panoya sığar; sepette karışık', () => {
    for (let t = 0; t < 2; t++) {
      const v = grafikVerisi(t), s = v.sayilar;
      const sirali = MEYVELER.map((m) => s[m]).sort((a, b) => a - b);
      expect(new Set(sirali).size).toBe(3);
      expect(s[enCok(s)]).toBe(sirali[2]);
      expect(s[enAz(s)]).toBe(sirali[0]);
      expect(kacFazla(v)).toBeGreaterThan(0);
      expect(fazlaSecenekleri(kacFazla(v))).toContain(kacFazla(v));
      expect(fazlaSecenekleri(kacFazla(v))).toHaveLength(3);
      for (const m of MEYVELER) expect(s[m]).toBeLessThanOrEqual(SUTUN_BOYU);
      expect(FAZLA_SORUSU[v.fazla.join('-')]).toBeDefined();
      const sira = sepetSirasi(s);
      expect(sira).toHaveLength(s.elma + s.armut + s.muz);
      expect(sira.slice(0, 3)).toEqual(['elma', 'armut', 'muz']);
    }
  });
  it('sözler sırada ve tabloyla aynı', () => {
    expect(sozler.length).toBeGreaterThanOrEqual(257);
    expect(YENI_SOZ.roket).toMatchObject({ yonerge: ROKET_SOZ.yonerge, kalkis: ROKET_SOZ.kalkis, bitti: ROKET_SOZ.bitti });
    expect(YENI_SOZ.kelebek).toEqual(KELEBEK_SOZ);
    expect(YENI_SOZ.grafik).toEqual(GRAFIK_SOZ);
    expect(sozler[ROKET_SOZ.sifir]).toBe('Sıfır.');
    expect(sozler[ROKET_SOZ.kalkis]).toBe('Kalkış!');
    expect(sozler[GRAFIK_SOZ.elmaArmut]).toContain('Elma, armuttan');
    expect(sozler[GRAFIK_SOZ.armutMuz]).toContain('Armut, muzdan');
  });
});
