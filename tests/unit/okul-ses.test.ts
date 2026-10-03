/**
 * Okula Hazırım! · Ses Kulesi mantığı: harf tablosu (Maarif sırası, sesler), kelimeler ve ilk sesleri, tur
 * üreticileri, oda sırası, izleme toleransı (bağışlayıcı ama karalamayı saymayan), oda içi kayıt, seslendirme cümleleri.
 */
import { describe, expect, it } from 'vitest';
import S from '../../content/okul-ses.json';
import { normal, tumCumleler, karakterCumleleri } from '../../src/audio/cumleler';
import { ERISIM, erisimTuru, kilitliMi } from '../../src/engine/erisim';
import {
  avTurlari,
  BENZER,
  celdiriciler,
  CIZILECEK,
  farkliTurlari,
  HARFLER,
  HAZIR_RESIM,
  ilkHarf,
  kelime,
  kutuTuru,
  odaAcik,
  odaId,
  sesKulesiCumleleri,
  sesKulesiKinoCumleleri,
  sesleBaslar,
} from '../../okul/src/ses/harfler';
import { HARF_YOLU, izBaslat, izGecis, izIlerle, izOran, izToleransi, kinoYolu, type Iz } from '../../okul/src/ses/harf-yolu';
import { odaAdimi, odaAdimiYaz, ODA_ANAHTARI } from '../../okul/src/ses/oda-kayit';
import type { Nokta } from '../../canlan/src/resimler';

/** Sabit tohumlu rastgele (mulberry32) */
function tohum(t: number) {
  let a = t >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

class BellekDepo {
  m = new Map<string, string>();
  getItem(k: string) {
    return this.m.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.m.set(k, v);
  }
  removeItem(k: string) {
    this.m.delete(k);
  }
}

describe('harf tablosu', () => {
  it('Maarif 1. sınıf ilk ses grubu sırasıyla: A N E T İ L', () => {
    expect(HARFLER.map((h) => h.buyuk)).toEqual(['A', 'N', 'E', 'T', 'İ', 'L']);
    expect(HARFLER.map((h) => h.kucuk)).toEqual(['a', 'n', 'e', 't', 'i', 'l']);
    expect(HARFLER.map(odaId)).toEqual(['ses-a', 'ses-n', 'ses-e', 'ses-t', 'ses-i', 'ses-l']);
  });

  it('harfin ADI değil SESİ: uzayan sesler uzatılmış, patlamalı t kısa ve asla "Te"', () => {
    for (const h of HARFLER) {
      const s = h.ses.replace(/!$/, '');
      if (h.id === 't') {
        expect(s.toLocaleLowerCase('tr')).not.toMatch(/^te/);
        expect(s.length).toBeLessThanOrEqual(2);
        continue;
      }
      // "Aaa", "Nnn", "İii": aynı ses en az 3 kez
      expect(s.length, h.ses).toBeGreaterThanOrEqual(3);
      expect(s.toLocaleLowerCase('tr').split('').every((c) => c === h.kucuk), h.ses).toBe(true);
    }
  });

  it('her harfin rengi, iki oda resmi, en az 3 kelimesi ve şekli benzeyen harfleri var', () => {
    for (const h of HARFLER) {
      expect(h.renk).toMatch(/^#[0-9A-F]{6}$/i);
      expect(h.oda).toHaveLength(2);
      expect(h.kelimeler.length).toBeGreaterThanOrEqual(3);
      for (const k of h.oda) expect(h.kelimeler).toContain(k);
      const [b, k] = BENZER[h.id];
      expect(b).not.toContain(h.buyuk);
      expect(k).not.toContain(h.kucuk);
    }
  });
});

describe('kelimeler ve ilk ses', () => {
  it('odanın bütün kelimeleri o sesle başlar; uzatılmış söyleyiş de', () => {
    for (const h of HARFLER) {
      for (const k of h.kelimeler) {
        expect(ilkHarf(k), k).toBe(h.buyuk);
        expect(sesleBaslar(k, h)).toBe(true);
        const u = kelime(k).uzun;
        expect(u.charAt(0).toLocaleUpperCase('tr'), u).toBe(h.buyuk);
        // uzayan seslerde ilk harf en az 3 kez ("Aaarı", "Lllimon"); t'de "Tttop"
        expect(u.slice(0, 3).toLocaleLowerCase('tr'), u).toBe(h.kucuk.repeat(3));
      }
    }
  });

  it('Türkçe büyük harf: inek → İ (I değil)', () => {
    expect(ilkHarf('inek')).toBe('İ');
    expect(ilkHarf('ip')).toBe('İ');
    expect(ilkHarf('igne')).toBe('İ');
  });

  it('çeldiriciler başka bir sesle başlar ve hazır çizimi olanlardır', () => {
    for (const h of HARFLER) {
      const c = celdiriciler(h);
      expect(c.length).toBeGreaterThanOrEqual(10);
      for (const k of c) {
        expect(sesleBaslar(k, h), `${h.id}: ${k}`).toBe(false);
        expect(HAZIR_RESIM[k], k).toBeTruthy();
      }
    }
  });

  it('her kelimenin adı ve söyleyişi var; çizilecekler listesi yalnız çizimi olmayanlar', () => {
    for (const k of [...HARFLER.flatMap((h) => h.kelimeler), ...S.celdiriciler]) {
      expect(S.kelimeler[k as keyof typeof S.kelimeler], k).toBeTruthy();
    }
    for (const k of CIZILECEK()) expect(HAZIR_RESIM[k]).toBeUndefined();
  });
});

describe('tur üreticileri', () => {
  it('İlk ses avı: 3 tur, her turda tek doğru + 2 farklı sesle başlayan', () => {
    for (const h of HARFLER) {
      for (let t = 1; t <= 20; t++) {
        const turlar = avTurlari(h, tohum(t));
        expect(turlar).toHaveLength(3);
        for (const tur of turlar) {
          expect(tur.secenekler).toHaveLength(3);
          expect(new Set(tur.secenekler).size).toBe(3);
          expect(tur.secenekler.filter((k) => sesleBaslar(k, h))).toEqual([tur.dogru]);
        }
      }
    }
  });

  it('Hangisi farklı?: 4 harf, yalnız biri farklı (önce büyük, sonra küçük)', () => {
    for (const h of HARFLER) {
      for (let t = 1; t <= 20; t++) {
        const [b, k] = farkliTurlari(h, tohum(t));
        for (const [tur, ayni] of [
          [b, h.buyuk],
          [k, h.kucuk],
        ] as const) {
          expect(tur.harfler).toHaveLength(4);
          expect(tur.harfler.filter((x) => x === ayni)).toHaveLength(3);
          expect(tur.harfler[tur.farkli]).not.toBe(ayni);
        }
      }
    }
  });

  it('Sesli kutu: 3 doğru + 2 öteki, karışık, tekrar yok', () => {
    for (const h of HARFLER) {
      const t = kutuTuru(h, tohum(7));
      expect(t.dogrular).toHaveLength(3);
      expect(t.digerleri).toHaveLength(2);
      expect(t.dogrular.every((k) => sesleBaslar(k, h))).toBe(true);
      expect(t.digerleri.some((k) => sesleBaslar(k, h))).toBe(false);
      expect(new Set(t.hepsi).size).toBe(5);
    }
  });

  it('odalar sırayla açılır: ilki hep, sonraki bir öncekisi bitince', () => {
    expect(odaAcik(0, [])).toBe(true);
    expect(odaAcik(1, [])).toBe(false);
    expect(odaAcik(1, ['ses-a'])).toBe(true);
    expect(odaAcik(2, ['ses-a'])).toBe(false);
    expect(odaAcik(5, ['ses-a', 'ses-n', 'ses-e', 'ses-t', 'ses-i'])).toBe(true);
  });
});

describe('Harfi izle: bağışlayıcı takip', () => {
  /** Çizginin üstünden (titrek) geçer; tamamlandı mı */
  const izle = (iz: Iz, cizgi: Nokta[], tol: number, sapma: number, ters = false) => {
    const n = (cizgi.length === 1 ? [cizgi[0], cizgi[0]] : cizgi).slice();
    if (ters) n.reverse();
    let son: Nokta | null = null;
    for (let i = 1; i < n.length; i++) {
      for (let s = 0; s <= 10; s++) {
        const p: Nokta = [n[i - 1][0] + ((n[i][0] - n[i - 1][0]) * s) / 10 + Math.sin(i * 7 + s) * sapma, n[i - 1][1] + ((n[i][1] - n[i - 1][1]) * s) / 10 + Math.cos(i * 3 + s) * sapma];
        izGecis(iz, son, p, tol);
        son = p;
      }
    }
    return iz.bitti;
  };

  it('her harfin şablonu 0..1 kutuda; i ve İ noktalı', () => {
    for (const h of HARFLER) {
      for (const harf of [h.buyuk, h.kucuk]) {
        const y = HARF_YOLU[harf];
        expect(y?.length, harf).toBeGreaterThan(0);
        for (const c of y) for (const [x, yy] of c) expect(x >= 0 && x <= 1 && yy >= 0 && yy <= 1, harf).toBe(true);
      }
    }
    expect(HARF_YOLU['İ'].some((c) => c.length === 1)).toBe(true);
    expect(HARF_YOLU.i.some((c) => c.length === 1)).toBe(true);
  });

  it('titrek ama yakın izleme her harfi tamamlar (3-4 ve 5-6 yaş)', () => {
    for (const yas of [3, 4, 5, 6]) {
      const tol = izToleransi(yas);
      for (const h of HARFLER) {
        for (const harf of [h.buyuk, h.kucuk]) {
          for (const c of HARF_YOLU[harf]) expect(izle(izBaslat(c), c, tol, tol * 0.55), `${yas} ${harf}`).toBe(true);
        }
      }
    }
  });

  it('küçükler daha bol tolerans alır', () => {
    expect(izToleransi(3)).toBeGreaterThan(izToleransi(5));
    expect(izToleransi(4)).toBeGreaterThanOrEqual(izToleransi(6));
  });

  it('uzaktan (tolerans dışında) çizmek ilerletmez; ters yönden başlamak da', () => {
    const tol = izToleransi(5);
    const c = HARF_YOLU.A[0];
    const uzak = c.map(([x, y]): Nokta => [x + 0.3, y]);
    const iz = izBaslat(c);
    izle(iz, uzak, tol, 0);
    expect(izOran(iz)).toBe(0);
    const ters = izBaslat(c);
    expect(izle(ters, c, tol, 0, true)).toBe(false);
    // ters yönde yalnız yeşil noktaya varınca başlangıç kadarı dolar
    expect(izOran(ters)).toBeLessThan(0.35);
  });

  it('çizgiyi atlayıp sona dokunmak tamamlamaz; kapalı halka (a) başta bitmez', () => {
    const tol = izToleransi(5);
    const c = HARF_YOLU.T[1];
    const iz = izBaslat(c);
    izIlerle(iz, c[0], tol);
    izIlerle(iz, c[c.length - 1], tol);
    expect(iz.bitti).toBe(false);
    const halka = izBaslat(HARF_YOLU.a[0]);
    izIlerle(halka, HARF_YOLU.a[0][0], tol);
    expect(halka.bitti).toBe(false);
    expect(izOran(halka)).toBeLessThan(0.2);
  });

  it('parmak kalkıp yeniden konabilir: ilerleme kalır', () => {
    const tol = izToleransi(5);
    const c = HARF_YOLU.L[0];
    const iz = izBaslat(c);
    izle(iz, [c[0], [0.32, 0.5]], tol, 0);
    const yari = izOran(iz);
    expect(yari).toBeGreaterThan(0.3);
    expect(iz.bitti).toBe(false);
    izle(iz, [[0.32, 0.45], c[1]], tol, 0);
    expect(iz.bitti).toBe(true);
  });

  it('bir çizgiden kayan parmak sonrakini kendiliğinden doldurmaz (başlangıç noktası şart)', () => {
    const tol = izToleransi(5);
    // a: halkanın sonu çubuğun ortasına değer; çubuk yine de yeşil noktadan başlamalı
    const cubuk = izBaslat(HARF_YOLU.a[1]);
    izle(cubuk, [[0.66, 0.76], [0.66, 0.62]], tol, 0);
    expect(izOran(cubuk)).toBe(0);
  });

  it('Kino\'nun yanlış çizimi aynada ya da baş aşağı', () => {
    expect(kinoYolu('N', 'ayna')[0][0][0]).toBeCloseTo(1 - HARF_YOLU.N[0][0][0]);
    expect(kinoYolu('A', 'ters')[0][0][1]).toBeCloseTo(1 - HARF_YOLU.A[0][0][1]);
  });
});

describe('oda içi kayıt ve erişim', () => {
  it('yarıda kalan oda kaldığı etkinlikten devam eder; bitince silinir', () => {
    const d = new BellekDepo();
    expect(odaAdimi('ses-a', d)).toBe(0);
    odaAdimiYaz('ses-a', 2, d);
    expect(odaAdimi('ses-a', d)).toBe(2);
    odaAdimiYaz('ses-a', 0, d);
    expect(odaAdimi('ses-a', d)).toBe(0);
    d.setItem(ODA_ANAHTARI, '{bozuk');
    expect(odaAdimi('ses-a', d)).toBe(0);
  });

  it('A odası ücretsiz, öteki odalar okul/* aboneliğiyle', () => {
    expect(erisimTuru('okul/ses-a')).toBe('ucretsiz');
    for (const id of ['ses-n', 'ses-e', 'ses-t', 'ses-i', 'ses-l']) expect(erisimTuru(`okul/${id}`)).toBe('abonelik');
    expect(kilitliMi('okul/ses-n', { etkin: true, premium: false })).toBe(true);
    expect(kilitliMi('okul/ses-a', { etkin: true, premium: false })).toBe(false);
    expect(ERISIM['okul/*']).toBe('abonelik');
  });
});

describe('seslendirme', () => {
  it('Ses Kulesi cümleleri seslendirme listesinde; Kino\'nunkiler Kino\'nun sesiyle', () => {
    const hepsi = new Set(tumCumleler());
    for (const c of sesKulesiCumleleri()) expect(hepsi.has(normal(c)), c).toBe(true);
    const kino = new Set(karakterCumleleri().kino);
    for (const c of sesKulesiKinoCumleleri()) expect(kino.has(normal(c)), c).toBe(true);
  });

  it('harf sesleri, uzatılmış kelimeler ve "Bu odanın sesi: Aaa!" birleşikleri listede', () => {
    const c = new Set(sesKulesiCumleleri());
    for (const h of HARFLER) {
      expect(c.has(h.ses)).toBe(true);
      expect(c.has(`${S.mino.oda_sesi} ${h.ses}`)).toBe(true);
      expect(c.has(`${h.ses} ${S.mino.avi}`)).toBe(true);
      for (const k of h.kelimeler) expect(c.has(kelime(k).uzun)).toBe(true);
    }
  });

  it('cümleler kısa: Mino en çok 8, Kino en çok 6 kelime', () => {
    for (const c of Object.values(S.mino)) expect(c.split(/\s+/).length, c).toBeLessThanOrEqual(8);
    for (const c of [S.kino.oda, S.kino.avi, S.kino.farkli, S.kino.kutu, ...S.kino.saka]) expect(c.split(/\s+/).length, c).toBeLessThanOrEqual(6);
  });
});
