import { describe, expect, it } from 'vitest';
import EL from '../../content/macera-elektrik.json';
import { normal, tumCumleler } from '../../src/audio/cumleler';
import elektrikKaynak from '../../macera/src/elektrik.ts?raw';
import dogumgunuKaynak from '../../macera/src/dogumgunu.ts?raw';
import KAMP from '../../assets/muzik/kamp.json';
import {
  aranan,
  cagriSonucu,
  cekmeceEsyalari,
  cikisAdimi,
  CIKIS_ADIM,
  elektrikAyar,
  ESYA_SESI,
  isaretSonuc,
  kabulMu,
  KAMP_SARKISI,
  kampNotalari,
  kampSatirBaslari,
  kampTurAyar,
  kampTurlari,
  RITIM_ALT,
  RITIM_UST,
  yankiSonuc,
  kucukMu,
  Oksama,
  SES_SIRASI,
  sessizlikIlerle,
  yon,
  YUKSEK_DB,
  YUKSEK_SURE,
  YuksekSes,
  ZIPLAMA_SAYISI,
  ZIPLAMA_YERLERI,
} from '../../macera/src/elektrik-mantik';

describe('Elektrikler Kesildi: yaş ayarları (yalnız senaryonun dediği yerlerde)', () => {
  it('3-4 ve 5-6 yaş', () => {
    expect(kucukMu(4)).toBe(true);
    expect(kucukMu(5)).toBe(false);
    const k = elektrikAyar(3);
    const b = elektrikAyar(6);
    expect([k.pilli, b.pilli]).toEqual([true, false]);
    expect([k.geriAdim, b.geriAdim]).toEqual([false, true]);
    expect([k.sessiz, b.sessiz]).toEqual([1.5, 2.5]);
    expect([k.kaynakKipir, b.kaynakKipir]).toEqual([true, false]);
    expect([k.isaretler, b.isaretler]).toEqual([
      [2, 3],
      [3, 5],
    ]);
    expect([k.alkis, b.alkis]).toEqual([6, 8]);
  });
  it('kolaylık: her yaşta 3. denemede kabul', () => {
    expect(kabulMu(0)).toBe(false);
    expect(kabulMu(1)).toBe(true);
    expect(kabulMu(2)).toBe(true);
  });
});

describe('Sahne 1: Kino masanın altından çıkar', () => {
  it('yumuşak ses bir adım ileri: kulak → burun → çıktı', () => {
    let a = 0;
    for (let i = 0; i < 5; i++) a = cikisAdimi(a, 'yumusak', false);
    expect(a).toBe(CIKIS_ADIM);
  });
  it('bağırmak: 3-4 yaşta yerinde titrer, 5-6 yaşta bir adım geri (0 altına inmez)', () => {
    expect(cikisAdimi(2, 'yuksek', false)).toBe(2);
    expect(cikisAdimi(2, 'yuksek', true)).toBe(1);
    expect(cikisAdimi(0, 'yuksek', true)).toBe(0);
  });
  it('fısıltı ve kısık ses yumuşak sayılır', () => {
    expect(cagriSonucu('fisilti')).toBe('yumusak');
    expect(cagriSonucu('kisik')).toBe('yumusak');
    expect(cagriSonucu('yuksek')).toBe('yuksek');
  });
  it('örtüyü okşamak: tek dokunuş ya da titreme sayılmaz, yol birikince bir adım', () => {
    const o = new Oksama(1);
    expect(o.hareket(0.001, 0)).toBe(false);
    let adim = 0;
    for (let i = 0; i < 16; i++) if (o.hareket(0.125, 0)) adim++;
    expect(adim).toBe(2);
    // büyük tek sıçrama en çok 0.25 sayılır
    const o2 = new Oksama(1);
    expect(o2.hareket(5, 0)).toBe(false);
  });
});

describe('Sahne 2: çekmece', () => {
  it('3-4 yaşta fener pilli (pil yok), 5-6 yaşta pil de çekmecede', () => {
    expect(cekmeceEsyalari(3)).not.toContain('pil');
    expect(cekmeceEsyalari(6)).toContain('pil');
    expect(cekmeceEsyalari(3)).toContain('fener');
  });
  it('önce fener, pilsizse sonra pil', () => {
    expect(aranan([], true)).toBe('fener');
    expect(aranan(['fener'], true)).toBeNull();
    expect(aranan(['fener'], false)).toBe('pil');
    expect(aranan(['fener', 'pil'], false)).toBeNull();
  });
  it('her eşyanın kendi sesi var (fener tık, pil tıkır)', () => {
    expect(ESYA_SESI.fener).toBe('tik');
    expect(ESYA_SESI.pil).toBe('tikir');
    expect(new Set(Object.values(ESYA_SESI)).size).toBe(4);
  });
});

describe('Sahne 3-6', () => {
  it('Mino üç farklı yere zıplar, sonra Kino', () => {
    expect(ZIPLAMA_SAYISI).toBe(3);
    expect(new Set(ZIPLAMA_YERLERI).size).toBe(ZIPLAMA_SAYISI);
  });
  it('karanlığın sesleri: saat, saksı, sonunda Kino\'nun kemiği', () => {
    expect(SES_SIRASI).toEqual(['saat', 'saksi', 'kemik']);
  });
  it('sessizlik: susunca dolar, ses olunca yavaşça iner, eksiye düşmez', () => {
    expect(sessizlikIlerle(1, 0.5, true)).toBe(1.5);
    expect(sessizlikIlerle(1, 0.2, false)).toBeCloseTo(0.7);
    expect(sessizlikIlerle(0.1, 1, false)).toBe(0);
  });
  it('stereo yön: sol −1, orta 0, sağ 1', () => {
    expect(yon(0)).toBe(-1);
    expect(yon(50)).toBe(0);
    expect(yon(100)).toBe(1);
  });
  it('Can\'ın işaretleri: doğru, az, çok', () => {
    expect(isaretSonuc(3, 3)).toBe('dogru');
    expect(isaretSonuc(3, 2)).toBe('az');
    expect(isaretSonuc(3, 5)).toBe('cok');
  });
  it('kamp şarkısı: alkış kadar nota, son nota do (şarkı bitmiş gibi)', () => {
    for (const n of [6, 8]) {
      const k = kampNotalari(n);
      expect(k).toHaveLength(n);
      expect(k[n - 1] % 12).toBe(0);
      expect(k.slice(0, -1)).toEqual(KAMP_SARKISI.slice(0, n - 1));
    }
  });
});

describe('Sahne 7: Geldiii! (Doğum Günü "Sürpriz!" kuralıyla aynı, yeni eşik yok)', () => {
  it('tabanın 24 dB üstünde 0.18 sn', () => {
    expect(YUKSEK_DB).toBe(24);
    expect(YUKSEK_SURE).toBe(0.18);
    expect(dogumgunuKaynak).toContain('if (ust > 24)');
    expect(dogumgunuKaynak).toContain('yuksek > 0.18');
    const kare = 1024 / 48000;
    const y = new YuksekSes();
    let tamam = false;
    for (let t = 0; t < 0.15; t += kare) tamam = y.kare(30, kare) || tamam;
    expect(tamam).toBe(false);
    for (let t = 0; t < 0.1; t += kare) tamam = y.kare(30, kare) || tamam;
    expect(tamam).toBe(true);
    const sessiz = new YuksekSes();
    for (let t = 0; t < 2; t += kare) expect(sessiz.kare(20, kare)).toBe(false);
  });
});

describe('Elektrikler Kesildi: içerik ve kurallar', () => {
  it('Mino ve Kino cümleleri kısa (≤ 12 kelime) ve seslendirilecek listede', () => {
    const tum = new Set(tumCumleler().map(normal));
    for (const t of [...Object.values(EL.mino), ...Object.values(EL.kino)]) {
      expect(t.split(/\s+/).length).toBeLessThanOrEqual(12);
      expect(tum.has(normal(t))).toBe(true);
    }
  });
  it('balonlar, ipuçları ve düğme seslendirilmez; ipuçları kısa', () => {
    const tum = new Set(tumCumleler().map(normal));
    for (const t of Object.values(EL.ipucu)) {
      expect(t.split(/\s+/).length).toBeLessThanOrEqual(5);
      expect(tum.has(normal(t))).toBe(false);
    }
  });
  it('Kino kendi sesiyle konuşur; algılama kilitli sınıflardan (yeni eşik yok)', () => {
    expect(elektrikKaynak).toContain('konus(t, KINO_SESI)');
    expect(elektrikKaynak).toContain('new SesSeviyesi(kulak.ayar)');
    expect(elektrikKaynak).toContain('new SessizlikSayaci(kulak.ayar)');
    expect(elektrikKaynak).toContain('new Alkis(kulak.ayar)');
    // her sesli görev müziği durdurur ve parmak karşılığı var
    expect(elektrikKaynak.match(/sesliGorev\(/g)!.length).toBeGreaterThanOrEqual(5);
    expect(elektrikKaynak).toContain('ui.dugme(EL.dugme.geldi)');
    // doğum günü dosyası bu bölüm için değiştirilmez: salon yalnız karartılarak kullanılır
    expect(elektrikKaynak).toContain("new Sahne('parti-sahne/oda', 'parti-sahne/oda-dikey')");
  });
});

describe('Kamp şarkısı (Gemini kaydı; oyun şarkıya uyar)', () => {
  it('kayıt main\'de: 32 vuruş, dört satır; sözler ekranda (seslendirilmez)', () => {
    expect(KAMP.vuruslar_ms).toHaveLength(32);
    expect(kampSatirBaslari(KAMP)).toHaveLength(4);
    expect(EL.sarki).toHaveLength(4);
    const tum = new Set(tumCumleler().map(normal));
    for (const s of EL.sarki) expect(tum.has(normal(s))).toBe(false);
  });
  it('yankı turları: 3-4 yaşta 2 × 3, 5-6 yaşta 2 × 4 vuruş; vuruşlar kayıttan', () => {
    expect(kampTurAyar(3)).toEqual({ tur: 2, vurus: 3 });
    expect(kampTurAyar(6)).toEqual({ tur: 2, vurus: 4 });
    for (const yas of [3, 6]) {
      const t = kampTurlari(KAMP, yas);
      expect(t).toHaveLength(2);
      for (const x of t) {
        expect(x.vuruslar).toHaveLength(kampTurAyar(yas).vurus);
        expect(x.vuruslar[0]).toBeGreaterThan(0);
        expect(x.basMs + x.vuruslar[x.vuruslar.length - 1]).toBeLessThan(x.bitMs);
        expect(x.bitMs).toBeLessThanOrEqual(KAMP.sure_ms);
        expect(x.ara).toBeGreaterThan(500);
        expect(x.ara).toBeLessThan(650);
      }
    }
    expect(kampTurlari(null, 5)).toEqual([]);
  });
  it('değerlendirme: sayı tutmalı; ritim yumuşak toleransla (3-4 yaşta yalnız sayı)', () => {
    const ara = 575;
    const dogru = [0, 560, 1170, 1720];
    expect(yankiSonuc(dogru, 4, ara)).toBe('dogru');
    expect(yankiSonuc(dogru.slice(0, 3), 4, ara)).toBe('az');
    expect(yankiSonuc([...dogru, 2300], 4, ara)).toBe('cok');
    // yarı hızda da olur, çok hızlı telaşla vurmak olmaz
    expect(yankiSonuc([0, 1100, 2200, 3300], 4, ara)).toBe('dogru');
    expect(yankiSonuc([0, 150, 300, 450], 4, ara)).toBe('ritim');
    expect(yankiSonuc([0, 150, 300], 3, ara, false)).toBe('dogru');
    expect(RITIM_ALT).toBeLessThan(0.5);
    expect(RITIM_UST).toBeGreaterThan(2);
  });
});
