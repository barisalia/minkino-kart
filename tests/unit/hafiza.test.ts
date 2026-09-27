import { describe, expect, it } from 'vitest';
import { ciftSayisi, HAFIZA_DUZEN, hafizaDestesi, hafizaHavuzu, hafizaKartlariSec, HafizaDurumu, hafizaYildiz } from '../../src/engine/hafiza';
import { kart, sorular, TEMALAR } from '../../src/engine/katalog';
import { refCoz } from '../../src/engine/katalog';
import { YASLAR } from '../../src/engine/types';
import { tumCumleler } from '../../src/audio/cumleler';
import metinler from '../../content/metinler.json';

/** Tekrarlanabilir rastgele sayı üreteci (mulberry32) */
function tohumlu(t: number) {
  return () => {
    t |= 0;
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

describe('Hafıza Oyunu: düzen', () => {
  it('yaşa göre ızgara 2×2, 2×3, 3×4, 4×4', () => {
    expect(HAFIZA_DUZEN[3]).toEqual({ kolon: 2, satir: 2 });
    expect(HAFIZA_DUZEN[4]).toEqual({ kolon: 2, satir: 3 });
    expect(HAFIZA_DUZEN[5]).toEqual({ kolon: 3, satir: 4 });
    expect(HAFIZA_DUZEN[6]).toEqual({ kolon: 4, satir: 4 });
    expect(YASLAR.map(ciftSayisi)).toEqual([2, 3, 6, 8]);
  });
});

describe('Hafıza Oyunu: kart seçimi', () => {
  for (const yas of YASLAR) {
    for (const t of TEMALAR) {
      it(`${yas} yaş / ${t.id}: yeterli, farklı, temaya ait, albümde yeri olan kart`, () => {
        const secilen = hafizaKartlariSec(yas, t.id, tohumlu(yas * 31 + t.id.length), (id) => kart(id)?.album !== false);
        expect(secilen).toHaveLength(ciftSayisi(yas));
        expect(new Set(secilen).size).toBe(secilen.length);
        for (const id of secilen) expect(kart(id)?.tema).toBe(t.id);
      });
    }
  }

  it('önce o yaşın sorularında geçen kartlar seçilir (3 yaşta büyük sayılar gelmez)', () => {
    const yasaUygun = new Set(sorular(3, 'sayilar').flatMap((s) => [...s.kartlar, ...(s.gosterge ?? [])].map((g) => refCoz(g).kart)));
    for (let i = 0; i < 20; i++) for (const id of hafizaKartlariSec(3, 'sayilar', tohumlu(i))) expect(yasaUygun.has(id)).toBe(true);
  });

  it('uygun olmayan kartlar (ör. görseli yok) havuza girmez', () => {
    const havuz = hafizaHavuzu(6, 'hayvanlar', (id) => id !== 'kedi');
    expect(havuz).not.toContain('kedi');
    expect(havuz.length).toBeGreaterThanOrEqual(8);
  });

  it('deste her kartı iki kez içerir ve karışıktır', () => {
    const idler = ['a', 'b', 'c', 'd'];
    const deste = hafizaDestesi(idler, tohumlu(7));
    expect(deste).toHaveLength(8);
    for (const id of idler) expect(deste.filter((x) => x === id)).toHaveLength(2);
    expect(deste.join()).not.toBe('a,b,c,d,a,b,c,d');
  });
});

describe('Hafıza Oyunu: eşleştirme mantığı', () => {
  const yeni = () => new HafizaDurumu(['kedi', 'at', 'kedi', 'at']);

  it('ilk kart açılır, aynısı gelince eşleşir', () => {
    const o = yeni();
    expect(o.cevir(0)).toEqual({ tur: 'ilk', i: 0 });
    expect(o.cevir(2)).toEqual({ tur: 'eslesti', cift: [0, 2], id: 'kedi', bitti: false });
    expect(o.bulunan.has(0) && o.bulunan.has(2)).toBe(true);
    expect(o.acik).toEqual([]);
    expect(o.hamle).toBe(1);
    expect(o.hata).toBe(0);
  });

  it('farklı iki kart eşleşmez; kapanmadan üçüncü kart çevrilemez', () => {
    const o = yeni();
    o.cevir(0);
    expect(o.cevir(1)).toEqual({ tur: 'eslesmedi', cift: [0, 1] });
    expect(o.bekliyor).toBe(true);
    expect(o.cevir(2)).toEqual({ tur: 'gecersiz' });
    expect(o.kapat()).toEqual([0, 1]);
    expect(o.bekliyor).toBe(false);
    expect(o.hata).toBe(1);
    expect(o.cevir(2).tur).toBe('ilk');
  });

  it('aynı kart iki kez, bulunmuş kart ve sınır dışı çevrilemez', () => {
    const o = yeni();
    o.cevir(0);
    expect(o.cevir(0)).toEqual({ tur: 'gecersiz' });
    o.cevir(2);
    expect(o.cevir(2)).toEqual({ tur: 'gecersiz' });
    expect(o.cevir(-1)).toEqual({ tur: 'gecersiz' });
    expect(o.cevir(4)).toEqual({ tur: 'gecersiz' });
  });

  it('bütün çiftler bulununca biter', () => {
    const o = yeni();
    o.cevir(0);
    o.cevir(2);
    o.cevir(1);
    const son = o.cevir(3);
    expect(son).toEqual({ tur: 'eslesti', cift: [1, 3], id: 'at', bitti: true });
    expect(o.bitti).toBe(true);
    expect(o.ciftSayisi).toBe(2);
  });

  it('rastgele oyunlar her zaman biter (4×4)', () => {
    for (let t = 0; t < 30; t++) {
      const rnd = tohumlu(t);
      const o = new HafizaDurumu(hafizaDestesi(hafizaKartlariSec(6, 'hayvanlar', rnd), rnd));
      let adim = 0;
      while (!o.bitti && adim++ < 1000) {
        const kapali = o.deste.map((_, i) => i).filter((i) => !o.bulunan.has(i) && !o.acik.includes(i));
        const r = o.cevir(kapali[Math.floor(rnd() * kapali.length)]);
        if (r.tur === 'eslesmedi') o.kapat();
      }
      expect(o.bitti).toBe(true);
      expect(o.bulunan.size).toBe(16);
    }
  });

  it('yıldız: çift sayısı kadar hata 3 yıldız, çok hata 1 yıldız', () => {
    expect(hafizaYildiz(0, 8)).toBe(3);
    expect(hafizaYildiz(8, 8)).toBe(3);
    expect(hafizaYildiz(12, 8)).toBe(2);
    expect(hafizaYildiz(40, 8)).toBe(1);
  });
});

describe('Hafıza Oyunu: cümleler', () => {
  it('yeni cümleler kısa ve seslendirme listesinde', () => {
    const hepsi = new Set(tumCumleler());
    for (const k of ['hafiza_oyunu', 'hafiza_sor', 'hafiza_bitti'] as const) {
      const t = metinler[k];
      expect(t.length).toBeLessThanOrEqual(30);
      expect(hepsi.has(t)).toBe(true);
    }
    // eşleşince söylenen kart adı her kart için kayıt listesinde
    for (const t of TEMALAR) for (const id of hafizaHavuzu(6, t.id)) expect(hepsi.has(`${kart(id)!.ad}!`)).toBe(true);
  });
});
