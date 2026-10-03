/**
 * Okula Hazırım! · Kelime Köprüsü mantığı: hece sayıları (Türkçe hecele), zıt çiftler, kategoriler, eksik kelime
 * seçenekleri, turların üretimi, köprü kaydı ve seslendirme cümleleri.
 */
import { describe, expect, it } from 'vitest';
import K from '../../content/okul-kelime.json';
import { karakterCumleleri, normal, tumCumleler } from '../../src/audio/cumleler';
import { erisimTuru } from '../../src/engine/erisim';
import {
  boyaTurlari,
  dinleTurlari,
  EKSIK_SECENEK,
  eksikTurlari,
  grubaUyar,
  grupResimleri,
  HECE_KELIMELERI,
  heceDurumu,
  heceler,
  heceSozleri,
  heceTurlari,
  kelime,
  KELIMELER,
  kelimeCumleleri,
  kelimeKinoCumleleri,
  KATEGORILER,
  KINO_GRUP,
  KINO_HECE,
  RENKLER,
  TERS_CIFTLER,
  tersTurlari,
  type Hazir,
} from '../../okul/src/kelime/model';
import { yeniTaslar } from '../../okul/src/kelime/kopru';

/** Sabit tohumlu rastgele (testte tekrarlanabilir) */
function tohum(t: number) {
  let a = t >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
/** Gemini yuvaları henüz yok (depodaki durum) */
const yuvasiz: Hazir = (r) => !r.startsWith('okul/kelime/');

describe('Alkışla hecele: hece sayıları', () => {
  it('Türkçe hece bölme', () => {
    expect(heceler('karpuz')).toEqual(['kar', 'puz']);
    expect(heceler('kelebek')).toEqual(['ke', 'le', 'bek']);
    expect(heceler('araba')).toEqual(['a', 'ra', 'ba']);
    expect(heceler('ucak')).toEqual(['u', 'çak']);
    expect(heceler('penguen')).toEqual(['pen', 'gu', 'en']);
    expect(heceler('helikopter')).toEqual(['he', 'li', 'kop', 'ter']);
    expect(heceler('salatalik')).toEqual(['sa', 'la', 'ta', 'lık']);
    expect(heceler('top')).toEqual(['top']);
  });
  it('her kelime listesindeki kelimeler o kadar heceli; ğ ile başlayan hece yok', () => {
    for (const [n, ids] of Object.entries(HECE_KELIMELERI)) {
      for (const id of ids) {
        expect(heceler(id).length, id).toBe(Number(n));
        for (const h of heceler(id)) expect(h.startsWith('ğ'), id).toBe(false);
      }
    }
  });
  it('turlar: ilk Kino’nun karpuzu; 3-4 yaş 1 ve 3 heceli, 5-6 yaş 3 ve 4 heceli', () => {
    for (let t = 1; t < 30; t++) {
      const k = heceTurlari(4, tohum(t));
      expect(k[0]).toBe(KINO_HECE);
      expect(k.map((id) => heceler(id).length)).toEqual([2, 1, 3]);
      expect(heceTurlari(6, tohum(t)).map((id) => heceler(id).length)).toEqual([2, 3, 4]);
    }
  });
  it('vuruş sayısı: eksik, tam, fazla', () => {
    expect(heceDurumu(2, 1)).toBe('eksik');
    expect(heceDurumu(2, 2)).toBe('tam');
    expect(heceDurumu(2, 5)).toBe('fazla');
  });
});

describe('Tersi ne?: zıt çiftler', () => {
  it('belgedeki altı çift', () => {
    expect(TERS_CIFTLER.map((c) => `${c.a}-${c.b}`)).toEqual(['açık-kapalı', 'büyük-küçük', 'sıcak-soğuk', 'uzun-kısa', 'dolu-boş', 'kuru-ıslak']);
    for (const c of TERS_CIFTLER) {
      const S = K.mino.tersi.ciftler[c.id];
      expect(S.a.toLocaleLowerCase('tr')).toBe(`${c.a}!`);
      expect(S.b.toLocaleLowerCase('tr')).toBe(`${c.b}!`);
      expect(K.kino.tersi[c.id]).toBeTruthy();
    }
  });
  it('turlar farklı çiftler; görseli olmayan çift (ıslak havlu) gelene kadar oynanmaz', () => {
    for (let t = 1; t < 30; t++) {
      const k = tersTurlari(4, tohum(t), yuvasiz);
      expect(k).toHaveLength(4);
      expect(new Set(k.map((c) => c.id)).size).toBe(4);
      expect(k.some((c) => c.id === 'kuru')).toBe(false);
      expect(tersTurlari(6, tohum(t), yuvasiz)).toHaveLength(5);
    }
    expect(tersTurlari(6, tohum(1)).length).toBe(5);
  });
});

describe('Hangi grup?: kategoriler', () => {
  it('her resim kendi sepetine uyar, başka sepete uymaz', () => {
    for (let t = 1; t < 30; t++) {
      for (const yas of [3, 6]) {
        const r = grupResimleri(yas, tohum(t));
        const n = yas <= 4 ? 2 : 3;
        expect(r).toHaveLength(3 * n);
        expect(new Set(r).size).toBe(r.length);
        expect(r).toContain(KINO_GRUP);
        for (const k of KATEGORILER) expect(r.filter((id) => kelime(id).kategori === k)).toHaveLength(n);
        for (const id of r) for (const k of KATEGORILER) expect(grubaUyar(id, k)).toBe(kelime(id).kategori === k);
      }
    }
    expect(grubaUyar('balik', 'tasit')).toBe(false);
    expect(grubaUyar('balik', 'hayvan')).toBe(true);
    expect(grubaUyar('muz', 'meyve')).toBe(true);
    expect(grubaUyar('ucak', 'tasit')).toBe(true);
  });
});

describe('Eksik kelime: cümle seçenekleri', () => {
  it('her cümlenin üç farklı seçeneği var, doğrusu ilk; yanlışların komik sahnesi var', () => {
    for (const [c, s] of Object.entries(EKSIK_SECENEK)) {
      expect(new Set(s).size).toBe(3);
      expect(s[0]).toBe(c);
      const C = K.mino.eksik.cumleler[c as keyof typeof EKSIK_SECENEK];
      expect(C.soru).toContain('…');
      expect(C.tam).toContain(kelime(c).ad.toLocaleLowerCase('tr'));
      for (const y of s.slice(1)) expect((K.kino.komik as Record<string, string>)[y], y).toBeTruthy();
    }
  });
  it('turlar: ilk Kino’nun cümlesi (kemik gelene kadar elma); seçenekler doğruyu içerir', () => {
    for (let t = 1; t < 20; t++) {
      const k = eksikTurlari(4, tohum(t), yuvasiz);
      expect(k[0].cumle).toBe('elma');
      expect(k).toHaveLength(3);
      expect(eksikTurlari(6, tohum(t), yuvasiz)).toHaveLength(4);
      for (const x of k) {
        expect(x.secenekler).toContain(x.dogru);
        expect(x.secenekler).toHaveLength(3);
      }
    }
    expect(eksikTurlari(4, tohum(1))[0].cumle).toBe('kemik');
  });
});

describe('Dinle, bul ve Boya kovası turları', () => {
  it('dinle: ilk tur kedi (köpekle); seçenekler farklı, hedef içinde; Gemini yuvası girmez', () => {
    for (let t = 1; t < 30; t++) {
      for (const yas of [3, 6]) {
        const k = dinleTurlari(yas, tohum(t), yuvasiz);
        expect(k).toHaveLength(4);
        expect(k[0].hedef).toBe('kedi');
        expect(k[0].secenekler).toContain('kopek');
        for (const x of k) {
          expect(x.secenekler).toHaveLength(yas <= 4 ? 3 : 4);
          expect(new Set(x.secenekler).size).toBe(x.secenekler.length);
          expect(x.secenekler).toContain(x.hedef);
          for (const id of x.secenekler) expect(yuvasiz(kelime(id).resim), id).toBe(true);
        }
      }
    }
  });
  it('boya: 4 farklı nesne; ilk turda mavi kova var ve hedef mavi değil; 3-4 yaş temel renkler', () => {
    for (let t = 1; t < 30; t++) {
      for (const yas of [3, 6]) {
        const k = boyaTurlari(yas, tohum(t));
        expect(k).toHaveLength(4);
        expect(new Set(k.map((x) => x.nesne)).size).toBe(4);
        expect(k[0].kovalar).toContain('mavi');
        expect(k[0].renk).not.toBe('mavi');
        for (const x of k) {
          expect(x.kovalar).toContain(x.renk);
          expect(x.kovalar).toHaveLength(yas <= 4 ? 3 : 4);
          expect(new Set(x.kovalar).size).toBe(x.kovalar.length);
          if (yas <= 4) for (const r of x.kovalar) expect(RENKLER.slice(0, 4).map((c) => c.id)).toContain(r);
        }
      }
    }
  });
  it('kelimelerin hepsinin adı ve görsel yolu var', () => {
    for (const k of Object.values(KELIMELER)) {
      expect(k.ad.length).toBeGreaterThan(1);
      expect(k.resim).toMatch(/^[a-z-]+\/[a-z/-]+$/);
    }
  });
});

describe('Köprü', () => {
  it('yeni taşlar: biten ama görülmemiş, köprü sırasıyla', () => {
    const sira = ['a', 'b', 'c'];
    expect(yeniTaslar(sira, ['c', 'a'], [])).toEqual(['a', 'c']);
    expect(yeniTaslar(sira, ['c', 'a'], ['a'])).toEqual(['c']);
    expect(yeniTaslar(sira, [], [])).toEqual([]);
  });
  it('erişim: ilk etkinlik ücretsiz, gerisi abonelikle', () => {
    expect(erisimTuru('okul/kelime-dinle')).toBe('ucretsiz');
    for (const id of ['kelime-hecele', 'kelime-tersi', 'kelime-boya', 'kelime-grup', 'kelime-eksik']) expect(erisimTuru(`okul/${id}`)).toBe('abonelik');
  });
});

describe('seslendirme', () => {
  const hepsi = new Set(tumCumleler());
  const kino = new Set(karakterCumleleri().kino);
  it('bütün cümleler listede; Kino’nunkiler Kino sesine gider', () => {
    for (const c of kelimeCumleleri()) expect(hepsi.has(normal(c)), c).toBe(true);
    for (const c of kelimeKinoCumleleri()) {
      expect(kino.has(normal(c)), c).toBe(true);
      expect(hepsi.has(normal(c)), c).toBe(true);
    }
    expect(hepsi.has('Kar!')).toBe(true);
    expect(hepsi.has('Puz!')).toBe(true);
    expect(hepsi.has('Kırmızı!')).toBe(true);
    expect(hepsi.has('Kedi!')).toBe(true);
  });
  it('heceler kelimelerden üretilir', () => {
    expect(heceSozleri()).toContain('Çak!');
    expect(heceSozleri()).toContain('Ter!');
  });
  it('cümleler kısa (en çok 8 kelime; Kino’nun şakaları en çok 6)', () => {
    for (const c of kelimeCumleleri()) expect(c.split(/\s+/).length, c).toBeLessThanOrEqual(8);
    for (const c of kelimeKinoCumleleri()) expect(c.split(/\s+/).length, c).toBeLessThanOrEqual(6);
  });
});
