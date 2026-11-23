import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import sozler from '../../matematik/src/ders-toplama-sozler.json';
import {
  ETKINLIKLER, GEREKLI_CIZIMLER, GEREKLI_SESLER, PENCERE, SORULAR, YOLCULAR, denklem, kaydiCoz, siradaki, sonuc, yasUygun, yerlesim,
} from '../../matematik/src/ders-toplama-mantik';

describe('Ceren dersi 6 · Toplama ve çıkarma (5+)', () => {
  it('dört iş, her biri başka: bir fazla, beşe tamamla, eksilme, ona tamamla', () => {
    expect(ETKINLIKLER).toEqual(['fazla', 'doldur', 'eksik', 'on']);
    expect(ETKINLIKLER.map((e) => denklem(SORULAR[e]))).toEqual([[2, '+', 1, 3], [3, '+', 2, 5], [5, '−', 2, 3], [8, '+', 2, 10]]);
    // Bir fazla 3'e, beşe tamamla 5'e (otobüs dolar), ona tamamla 10'a varır.
    expect(ETKINLIKLER.map((e) => sonuc(SORULAR[e]))).toEqual([3, 5, 3, 10]);
    expect(new Set(ETKINLIKLER.map((e) => SORULAR[e].is))).toEqual(new Set(['bin', 'in', 'tahmin']));
  });

  it('cevaplar seçeneklerde, doğru blok her işte aynı yerde değil; otobüse sığar', () => {
    const yerler = ETKINLIKLER.map((e) => {
      const s = SORULAR[e];
      expect(s.secenek, e).toContain(s.cevap);
      expect(new Set(s.secenek).size).toBe(3);
      for (const n of s.secenek) expect(n >= 1 && n <= 10).toBe(true);
      for (const n of s.otobusler) expect(n <= PENCERE).toBe(true);
      // Bindirme işlerinde durakta tam binecek kadar yolcu bekler; sonuç pencereleri aşmaz.
      if (s.is !== 'in') expect(s.durakta).toBe(s.adet);
      expect(sonuc(s)).toBeLessThanOrEqual(PENCERE * s.otobusler.length);
      return s.secenek.indexOf(s.cevap);
    });
    for (let i = 1; i < yerler.length; i++) expect(yerler[i], 'art arda aynı yer').not.toBe(yerler[i - 1]);
  });

  it('yolcular her işte başka sırada; onlukta beş çizim iki otobüse yeter', () => {
    const ilk = ETKINLIKLER.map((e) => yerlesim(e).otobusler[0][0]);
    expect(new Set(ilk).size).toBe(4);
    const on = yerlesim('on');
    expect(on.otobusler.map((o) => o.length)).toEqual([5, 3]);
    expect(on.durakta).toHaveLength(2);
    for (const ad of on.otobusler.flat()) expect(YOLCULAR).toContain(ad);
    // Aynı otobüste aynı yolcu iki kez yok.
    for (const o of on.otobusler) expect(new Set(o).size).toBe(o.length);
  });

  it('bütün sözler kayıtlı ve kullanılıyor', () => {
    expect(GEREKLI_SESLER).toEqual(Object.keys(sozler));
    for (const id of GEREKLI_SESLER) expect(existsSync('assets/matematik/ders/topla/ses/' + id + '.mp3'), id).toBe(true);
    const kullanilan = new Set(['giris', 'devam', 'gule', 'bitis', 'hatira']);
    for (const e of ETKINLIKLER) for (const k of ['tanit', 'sor', 'dogru', 'ipucu'] as const) kullanilan.add(SORULAR[e][k]);
    expect([...kullanilan].sort()).toEqual(Object.keys(sozler).sort());
  });

  it('kapı: Astra M7’nin 10 çizimi (brief’teki adlar); yalnız 5+; kayıt yarıda kalırsa sıradakinden sürer', () => {
    expect(GEREKLI_CIZIMLER).toEqual(['durak', 'otobus', 'yolcu-ayicik', 'yolcu-kedi', 'yolcu-kopek', 'yolcu-penguen', 'yolcu-koala', 'ceren-el-salla', 'ceren-bir-fazla', 'hatira-bilet']);
    expect([null, 2, 3, 4, 5, 6].map(yasUygun)).toEqual([true, false, false, false, true, true]);
    const k = kaydiCoz(JSON.stringify({ biten: ['fazla', 'doldur', 'x'], simdi: 'eksik', tanitildi: true, bitti: true }));
    expect(k).toEqual({ biten: ['fazla', 'doldur'], simdi: 'eksik', tanitildi: true, bitti: false });
    expect(siradaki(k)).toBe('eksik');
    expect(kaydiCoz('bozuk')).toEqual({ biten: [], simdi: 'fazla', tanitildi: false, bitti: false });
  });
});
