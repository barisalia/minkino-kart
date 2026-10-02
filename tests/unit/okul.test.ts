/**
 * Okula Hazırım! · Sayı Bahçesi mantığı: yaş aralığı, sayı üretimi, kart seçenekleri, eşleme, karşılaştırma,
 * +1/−1, merdiven, alkış, toplama-çıkarma, piknik planı; ilerleme kaydı (Depo) ve seslendirme cümleleri.
 */
import { describe, expect, it } from 'vitest';
import O from '../../content/okul.json';
import { normal, tumCumleler, karakterCumleleri } from '../../src/audio/cumleler';
import { bos, etkinlikBitti, kaydet, siradaki, yapistir, yukle, ANAHTAR } from '../../okul/src/kayit';
import { KABUL, RAKAM_YOLU, rakamResmi } from '../../okul/src/rakam';
import { puanla } from '../../canlan/src/puan';
import {
  alkisDurumu,
  alkisTurlari,
  basamakUyar,
  cizimRakamlari,
  dogruTaraf,
  elmaSigar,
  elmaTurlari,
  enBuyuk,
  havucTurlari,
  islemVar,
  kalipDoldur,
  kartUyar,
  kiyasla,
  kusSonucu,
  kusTurlari,
  merdivenTurlari,
  okulCumleleri,
  okulKinoCumleleri,
  piknikPlani,
  sayiSozu,
  secenekler,
  sepetDurumu,
  sepetTurlari,
  tabakTurlari,
  trenSonucu,
  trenTurlari,
} from '../../okul/src/sayi';

/** sabit tohumlu rastgele (mulberry32) */
function tohum(t: number) {
  let a = t >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
const TOHUMLAR = Array.from({ length: 60 }, (_, i) => i + 1);
const YASLAR = [3, 4, 5, 6];

describe('yaş aralığı', () => {
  it('3-4 yaş 1-5, 5-6 yaş 1-10; toplama-çıkarma yalnız 5-6 yaş', () => {
    expect([3, 4, 5, 6].map(enBuyuk)).toEqual([5, 5, 10, 10]);
    expect([3, 4, 5, 6].map(islemVar)).toEqual([false, false, true, true]);
  });
});

describe('sayı üretimi', () => {
  it('Kaç elma: aralıkta, Kino turunda 5 yok (Kino’nun "beş"i hep yanlış)', () => {
    for (const y of YASLAR)
      for (const t of TOHUMLAR) {
        const [ilk, ikinci] = elmaTurlari(y, tohum(t));
        for (const n of [ilk, ikinci]) {
          expect(n).toBeGreaterThanOrEqual(2);
          expect(n).toBeLessThanOrEqual(enBuyuk(y));
        }
        expect(ilk).not.toBe(5);
      }
  });

  it('Sayı kartı: üç farklı sepet, aralıkta; 5-6 yaşta ilk turda 6 var (Kino ters tutar)', () => {
    for (const y of YASLAR)
      for (const t of TOHUMLAR) {
        const turlar = sepetTurlari(y, tohum(t));
        expect(turlar).toHaveLength(2);
        for (const s of turlar) {
          expect(new Set(s).size).toBe(3);
          for (const n of s) expect(n >= 1 && n <= enBuyuk(y)).toBe(true);
        }
        if (y >= 5) expect(turlar[0]).toContain(6);
      }
  });

  it('Sepete koy, alkış: istenen sayılar yaşa uygun', () => {
    for (const t of TOHUMLAR) {
      for (const n of [...havucTurlari(3, tohum(t)), ...alkisTurlari(4, tohum(t))]) expect(n >= 1 && n <= 5).toBe(true);
      for (const n of [...havucTurlari(6, tohum(t)), ...alkisTurlari(5, tohum(t))]) expect(n >= 1 && n <= 10).toBe(true);
    }
  });

  it('Rakamı çiz: üç farklı rakam (3-4 yaş 1-5, 5-6 yaş 1-9), ilki aynada farklı görünür', () => {
    for (const y of YASLAR)
      for (const t of TOHUMLAR) {
        const r = cizimRakamlari(y, tohum(t));
        expect(new Set(r).size).toBe(3);
        for (const n of r) expect(n >= 1 && n <= (y <= 4 ? 5 : 9)).toBe(true);
        expect([1, 8]).not.toContain(r[0]);
      }
  });

  it('sayı sözleri ve kalıplar mevcut kayıtlarla aynı', () => {
    expect(Array.from({ length: 10 }, (_, i) => sayiSozu(i + 1))).toEqual(['Bir!', 'İki!', 'Üç!', 'Dört!', 'Beş!', 'Altı!', 'Yedi!', 'Sekiz!', 'Dokuz!', 'On!']);
    expect(kalipDoldur(O.kalip.havuc, 4)).toBe('Dört havuç lütfen!');
    expect(kalipDoldur(O.kalip.vagon, 3)).toBe('Üç vagon var.');
  });
});

describe('kart seçenekleri', () => {
  it('doğru cevap içinde, üçü farklı, hepsi aralıkta', () => {
    for (const enCok of [5, 10])
      for (let dogru = 1; dogru <= enCok; dogru++)
        for (const t of TOHUMLAR.slice(0, 40)) {
          const s = secenekler(dogru, enCok, tohum(t));
          expect(s).toHaveLength(3);
          expect(s).toContain(dogru);
          expect(new Set(s).size).toBe(3);
          for (const n of s) expect(n >= 1 && n <= enCok).toBe(true);
        }
  });
  it('dar aralıkta (en çok 2) olabildiğince seçenek', () => {
    expect(secenekler(1, 2, tohum(1)).sort()).toEqual([1, 2]);
  });
});

describe('eşleme', () => {
  it('rakam kartı yalnız o kadar elmalı sepete uyar', () => {
    expect(kartUyar(3, 3)).toBe(true);
    expect(kartUyar(3, 4)).toBe(false);
    expect(kartUyar(6, 9)).toBe(false);
  });
  it('sepet: eksik / tam / fazla', () => {
    expect(sepetDurumu(4, 3)).toBe('eksik');
    expect(sepetDurumu(4, 4)).toBe('tam');
    expect(sepetDurumu(4, 5)).toBe('fazla');
  });
  it('merdiven: rakam kendi basamağına; eksikler farklı ve aralıkta', () => {
    expect(basamakUyar(4, 4)).toBe(true);
    expect(basamakUyar(4, 2)).toBe(false);
    for (const y of YASLAR)
      for (const t of TOHUMLAR) {
        const turlar = merdivenTurlari(y, tohum(t));
        expect(turlar.map((x) => x.eksik.length)).toEqual(y <= 4 ? [1, 2] : [2, 3]);
        for (const m of turlar) {
          expect(m.n).toBe(enBuyuk(y));
          expect(new Set(m.eksik).size).toBe(m.eksik.length);
          for (const e of m.eksik) expect(e >= 1 && e <= m.n).toBe(true);
        }
      }
  });
  it('piknik: herkese iki elma (ikinciden sonra sığmaz)', () => {
    expect([0, 1, 2, 3].map(elmaSigar)).toEqual([true, true, false, false]);
  });
});

describe('karşılaştırma', () => {
  it('kıyasla ve doğru taraf', () => {
    expect(kiyasla(5, 3)).toBe('cok');
    expect(kiyasla(2, 3)).toBe('az');
    expect(kiyasla(4, 4)).toBe('esit');
    expect(dogruTaraf({ soru: 'cok', sol: 2, sag: 5 })).toBe('sag');
    expect(dogruTaraf({ soru: 'az', sol: 2, sag: 5 })).toBe('sol');
    expect(dogruTaraf({ soru: 'esit', sol: 3, sag: 3 })).toBe('esit');
  });
  it('turlar çok / az / eşit; büyük tabakta hep az kurabiye (boyut ile miktar karışmasın)', () => {
    for (const y of YASLAR)
      for (const t of TOHUMLAR) {
        const turlar = tabakTurlari(y, tohum(t));
        expect(turlar.map((x) => x.soru)).toEqual(['cok', 'az', 'esit']);
        for (const x of turlar) {
          for (const n of [x.sol, x.sag]) expect(n >= 1 && n <= enBuyuk(y)).toBe(true);
          if (x.soru === 'esit') {
            expect(x.sol).toBe(x.sag);
            continue;
          }
          const buyuk = x.buyuk === 'sol' ? x.sol : x.sag;
          const kucuk = x.buyuk === 'sol' ? x.sag : x.sol;
          expect(buyuk).toBeLessThan(kucuk);
          // küçük yaşta fark en az 2 (gözle de seçilebilsin)
          if (y <= 4) expect(kucuk - buyuk).toBeGreaterThanOrEqual(2);
        }
      }
  });
  it('alkış: eksik / tam / fazla', () => {
    expect(alkisDurumu(4, 3)).toBe('eksik');
    expect(alkisDurumu(4, 4)).toBe('tam');
    expect(alkisDurumu(4, 6)).toBe('fazla');
  });
});

describe('işlemler', () => {
  it('tren: 3-4 yaş yalnız bir fazla (1-5), 5-6 yaş fazla ve eksik', () => {
    for (const t of TOHUMLAR) {
      for (const y of [3, 4]) {
        const turlar = trenTurlari(y, tohum(t));
        expect(turlar.every((x) => x.tur === 'fazla')).toBe(true);
        for (const x of turlar) expect(trenSonucu(x)).toBeLessThanOrEqual(5);
      }
      for (const y of [5, 6]) {
        const turlar = trenTurlari(y, tohum(t));
        expect(turlar.map((x) => x.tur)).toEqual(['fazla', 'eksik']);
        for (const x of turlar) {
          expect(trenSonucu(x)).toBeGreaterThanOrEqual(1);
          expect(trenSonucu(x)).toBeLessThanOrEqual(10);
        }
      }
    }
    expect(trenSonucu({ tur: 'fazla', bas: 3 })).toBe(4);
    expect(trenSonucu({ tur: 'eksik', bas: 3 })).toBe(2);
  });
  it('kuşlar: sonuç 1-5, ilk tur 2 + 1 (Kino kelebekle dört sayar)', () => {
    for (const t of TOHUMLAR) {
      const turlar = kusTurlari(tohum(t));
      expect(turlar.map((x) => x.tur)).toEqual(['topla', 'cikar', 'topla', 'cikar']);
      expect(turlar[0]).toEqual({ tur: 'topla', a: 2, b: 1 });
      for (const x of turlar) {
        expect(kusSonucu(x)).toBeGreaterThanOrEqual(1);
        expect(kusSonucu(x)).toBeLessThanOrEqual(5);
        expect(x.a).toBeLessThanOrEqual(5);
      }
    }
  });
  it('piknik: 3-4 yaş 3 misafir elmasız, 5-6 yaş 4 misafir iki elma; fazladan tabak var; çok alan belli', () => {
    for (const t of TOHUMLAR) {
      const k = piknikPlani(3, tohum(t));
      expect(k.misafirler).toHaveLength(3);
      expect(k.elma).toBe(false);
      const b = piknikPlani(6, tohum(t));
      expect(b.misafirler).toHaveLength(4);
      expect(b.elma).toBe(true);
      for (const p of [k, b]) {
        expect(p.misafirler).toContain('ayi');
        expect(p.tabak).toBeGreaterThan(p.misafirler.length);
        expect(p.kurabiye.kino).not.toBe(p.kurabiye.ayi);
        expect(Math.max(p.kurabiye.kino, p.kurabiye.ayi)).toBeLessThanOrEqual(enBuyuk(3) + 1);
      }
    }
  });
});

describe('rakam şablonları (Çiz Canlansın puanlaması)', () => {
  it('şablonun kendisi çizilince kabul edilir, karalama edilmez', () => {
    for (let n = 1; n <= 9; n++) {
      const r = rakamResmi(n);
      const iyi = puanla(r, RAKAM_YOLU[n], 'iz', 4);
      expect(iyi.kapsama, `${n}`).toBeGreaterThanOrEqual(KABUL.kapsama);
      expect(iyi.isabet, `${n}`).toBeGreaterThanOrEqual(KABUL.isabet);
      // başka bir rakam (ör. 1 yerine 7'nin yarısı) yetmez
      const kotu = puanla(r, [[[0.1, 0.9], [0.2, 0.92], [0.3, 0.9]]], 'iz', 4);
      expect(kotu.kapsama >= KABUL.kapsama && kotu.isabet >= KABUL.isabet).toBe(false);
    }
  });
});

describe('ilerleme kaydı (Depo)', () => {
  const bellek = () => {
    const m = new Map<string, string>();
    return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k), m };
  };
  it('kaydet → yükle; bozuk veri ve erişilemeyen depo boş kayda döner', () => {
    const d = bellek();
    const k = bos();
    expect(etkinlikBitti(k, 'kac-elma', 'sayi', ['kac-elma', 'sayi-karti'])).toEqual({ ilk: true, rozet: false, kez: 1 });
    kaydet(k, d);
    expect(yukle(d).biten).toEqual(['kac-elma']);
    d.setItem(ANAHTAR, '{bozuk');
    expect(yukle(d)).toEqual(bos());
    const hatali = {
      getItem: () => {
        throw new Error('gizli sekme');
      },
      setItem: () => {
        throw new Error('kota');
      },
      removeItem: () => undefined,
    };
    expect(yukle(hatali)).toEqual(bos());
    expect(() => kaydet(k, hatali)).not.toThrow();
  });
  it('çıkartma: bitince bekler, çocuk yapıştırınca albüme girer; tekrar oynanınca yeni çıkartma yok', () => {
    const k = bos();
    etkinlikBitti(k, 'kac-elma', 'sayi', ['kac-elma']);
    expect(k.bekleyen).toEqual(['kac-elma']);
    expect(yapistir(k, 'kac-elma')).toBe(true);
    expect(k.cikartma).toEqual(['kac-elma']);
    expect(k.bekleyen).toEqual([]);
    const ikinci = etkinlikBitti(k, 'kac-elma', 'sayi', ['kac-elma', 'x']);
    expect(ikinci.ilk).toBe(false);
    expect(ikinci.kez).toBe(2);
    expect(k.bekleyen).toEqual([]);
  });
  it('bölgedeki hepsi bitince rozet (bir kez); önerilen durak sıradaki bitmemiş', () => {
    const k = bos();
    const hepsi = ['a', 'b', 'c'];
    expect(siradaki(k, hepsi)).toBe('a');
    etkinlikBitti(k, 'a', 'sayi', hepsi);
    expect(siradaki(k, hepsi)).toBe('b');
    etkinlikBitti(k, 'c', 'sayi', hepsi);
    expect(etkinlikBitti(k, 'b', 'sayi', hepsi).rozet).toBe(true);
    expect(k.rozet).toEqual(['sayi']);
    expect(etkinlikBitti(k, 'a', 'sayi', hepsi).rozet).toBe(false);
    expect(siradaki(k, hepsi)).toBe('a');
  });
});

describe('seslendirme', () => {
  const hepsi = new Set(tumCumleler());
  const kino = new Set(karakterCumleleri().kino);
  it('oyunun bütün cümleleri listede; Kino’nunkiler Kino sesine gider', () => {
    for (const c of okulCumleleri()) expect(hepsi.has(normal(c)), c).toBe(true);
    for (const c of okulKinoCumleleri()) {
      expect(kino.has(normal(c)), c).toBe(true);
      expect(hepsi.has(normal(c)), c).toBe(true);
    }
    expect(hepsi.has('Dört havuç lütfen!')).toBe(true);
    expect(hepsi.has('On kere alkışla!')).toBe(true);
  });
  it('cümleler kısa (en çok 8 kelime; Kino’nun şakaları en çok 6)', () => {
    for (const c of okulCumleleri()) expect(c.split(/\s+/).length, c).toBeLessThanOrEqual(8);
    for (const c of okulKinoCumleleri()) expect(c.split(/\s+/).length, c).toBeLessThanOrEqual(6);
  });
});
