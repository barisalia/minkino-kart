import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  BUL, GEREKLI_CIZIMLER, NESNE_YERI, GEREKLI_SESLER, SEKILLER, bitisSesi, bulSecenekleri, dersSekilleri, kaydiCoz, sekilEtkinligi, sekilYolu, siradaki,
} from '../../matematik/src/ders-sekiller-mantik';

describe('Ceren dersi 2 · Şekiller', () => {
  it('yaşa göre: 2–3 yaşta daire, kare, üçgen; 4 yaştan sonra dikdörtgen de', () => {
    expect(dersSekilleri(true)).toEqual(['daire', 'kare', 'ucgen']);
    expect(dersSekilleri(false)).toEqual(['daire', 'kare', 'ucgen', 'dikdortgen']);
    expect(bitisSesi(dersSekilleri(true))).toBe('bitis_3');
    expect(bitisSesi(dersSekilleri(false))).toBe('bitis_4');
  });

  it('etkinlik art arda aynı gelmez: çiz · bul · çiz · bul; "bul"da nesneler doğal yerlerinde', () => {
    expect(SEKILLER.map(sekilEtkinligi)).toEqual(['ciz', 'bul', 'ciz', 'bul']);
    const k = bulSecenekleri('kare'), d = bulSecenekleri('dikdortgen');
    expect(k).toContain(BUL.kare.dogru);
    expect(d).toContain(BUL.dikdortgen.dogru);
    // Nesneler doğal yerlerinde (duvar, yer, masa); her turda üç yer bir kez; doğru cevap iki turda başka yerde.
    expect(new Set(k.map((n) => NESNE_YERI[n]))).toEqual(new Set(['duvar', 'yer', 'masa']));
    expect(new Set(d.map((n) => NESNE_YERI[n]))).toEqual(new Set(['duvar', 'yer', 'masa']));
    expect(NESNE_YERI[BUL.kare.dogru]).not.toBe(NESNE_YERI[BUL.dikdortgen.dogru]);
    // Sınıftaki altı nesnenin her biri derste bir kez görünür.
    expect(new Set([...k, ...d]).size).toBe(6);
  });

  it('çizim yolları kapanır, 1000’lik kutuda kalır, noktalar eşit aralıklı', () => {
    for (const s of SEKILLER) {
      const y = sekilYolu(s);
      expect(y.length).toBeGreaterThan(80);
      const [a, b] = [y[0], y[y.length - 1]];
      expect(Math.hypot(a[0] - b[0], a[1] - b[1])).toBeLessThan(15);
      for (const p of y) for (const v of p) { expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThanOrEqual(1000); }
      for (let i = 1; i < y.length; i++) expect(Math.hypot(y[i][0] - y[i - 1][0], y[i][1] - y[i - 1][1])).toBeLessThan(20);
    }
  });

  it('Astra M3’ün 19 çizimi ve Ceren’in 18 kaydı diskte (ders kendiliğinden açılır)', () => {
    expect(new Set(GEREKLI_CIZIMLER).size).toBe(GEREKLI_CIZIMLER.length);
    for (const ad of GEREKLI_CIZIMLER) expect(existsSync('assets/matematik/ders/sekiller/' + ad + '.webp'), ad).toBe(true);
    expect(GEREKLI_SESLER).toHaveLength(18);
    for (const id of GEREKLI_SESLER) expect(existsSync('assets/matematik/ders/sekiller/ses/' + id + '.mp3'), id).toBe(true);
  });

  it('kayıt: bozuk kayıt boş başlar; yarım kayıt sıradakinden sürer; 2–3 yaşta biten ders 4 yaşta dikdörtgenle açılır', () => {
    expect(kaydiCoz('{bozuk')).toEqual({ biten: [], simdi: 'daire', tanitildi: false, bitti: false });
    const yarim = kaydiCoz(JSON.stringify({ biten: ['daire', 'kare', 'yildiz'], simdi: 'ucgen', tanitildi: true }));
    expect(yarim.biten).toEqual(['daire', 'kare']);
    expect(siradaki(yarim, SEKILLER)).toBe('ucgen');
    const minikBitti = JSON.stringify({ biten: ['daire', 'kare', 'ucgen'], simdi: 'ucgen', tanitildi: true, bitti: true });
    expect(kaydiCoz(minikBitti, dersSekilleri(true)).bitti).toBe(true);
    const dort = kaydiCoz(minikBitti, dersSekilleri(false));
    expect(dort.bitti).toBe(false);
    expect(siradaki(dort, dersSekilleri(false))).toBe('dikdortgen');
  });
});
