import { describe, expect, it } from 'vitest';
import P from '../../content/pazar.json';
import { normal, tumCumleler } from '../../src/audio/cumleler';
import { kart } from '../../src/engine/katalog';
import { YASLAR } from '../../src/engine/types';
import { denetle, istekUret, MUSTERI_SAYISI, PARA, paraMi, pazarCumleleri, PLAN, urunGrubu, urunRengi, uygunMu, type Istek } from '../../pazar/src/istek';

/** Tekrarlanabilir rastgele sayı (mulberry32) */
function tohumlu(t: number) {
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Her yaş × her müşteri sırası × birçok tohum */
function hepsi(): Istek[] {
  const l: Istek[] = [];
  for (const y of YASLAR) for (let s = 0; s < MUSTERI_SAYISI; s++) for (let t = 1; t <= 60; t++) l.push(istekUret(y, s, tohumlu(t * 97 + s)));
  return l;
}

/** İsteği doğru karşılayan sepet (tezgâhtan seçilerek) */
function dogruSepet(ist: Istek): string[] {
  if (ist.tur === 'ode') {
    const lira = ist.lira ?? 0;
    const bes = Math.floor(lira / 5);
    return [...Array.from({ length: bes }, () => 'para-5'), ...Array.from({ length: lira - bes * 5 }, () => 'para-1')];
  }
  return Object.entries(ist.istenen).flatMap(([id, n]) => Array.from({ length: n }, () => id));
}

describe('pazar: istek üretme', () => {
  it('yaş planı 5 müşteri, yaşa uygun türler', () => {
    for (const y of YASLAR) expect(PLAN[y]).toHaveLength(MUSTERI_SAYISI);
    expect(new Set(PLAN[3])).toEqual(new Set(['tek']));
    expect(new Set(PLAN[4])).toEqual(new Set(['renk', 'sayi']));
    expect(new Set(PLAN[5])).toEqual(new Set(['iki', 'ayir']));
    expect(new Set(PLAN[6])).toEqual(new Set(['toplama', 'ode']));
  });

  it('3 yaş: tek ürün, tezgâhta 3 farklı seçenek', () => {
    for (let t = 1; t <= 100; t++) {
      const ist = istekUret(3, t % 5, tohumlu(t));
      expect(ist.tur).toBe('tek');
      expect(ist.tezgah).toHaveLength(3);
      expect(new Set(ist.tezgah).size).toBe(3);
      const [u] = Object.keys(ist.istenen);
      expect(ist.istenen[u]).toBe(1);
      expect(ist.tezgah).toContain(u);
      expect(ist.dugmeli).toBe(false);
    }
  });

  it('4 yaş renk: tezgâhta istenen renkte tam bir ürün var', () => {
    for (let t = 1; t <= 100; t++) {
      const ist = istekUret(4, 1, tohumlu(t));
      expect(ist.tur).toBe('renk');
      expect(ist.tezgah.filter((id) => urunRengi(id) === ist.renk)).toHaveLength(1);
      expect(new Set(ist.tezgah.map(urunRengi)).size).toBe(3);
    }
  });

  it('sayılar yaşa uygun: 4 yaş 1-5, 5 yaş 1-3, 6 yaş toplam en çok 5', () => {
    for (const ist of hepsi()) {
      if (ist.tur === 'sayi') {
        const n = Object.values(ist.istenen)[0];
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(5);
      }
      if (ist.tur === 'iki') for (const n of Object.values(ist.istenen)) expect(n).toBeLessThanOrEqual(3);
      if (ist.tur === 'toplama') {
        const daha = Object.values(ist.istenen)[0];
        expect(ist.bende).toBeGreaterThanOrEqual(1);
        expect(daha).toBeGreaterThanOrEqual(1);
        expect((ist.bende ?? 0) + daha).toBeLessThanOrEqual(5);
      }
      if (ist.tur === 'ode') {
        expect(ist.lira).toBeGreaterThanOrEqual(2);
        expect(ist.lira).toBeLessThanOrEqual(9);
      }
    }
  });

  it('her istek tezgâhtakilerle yapılabilir (kilitlenme yok) ve tezgâh taşmaz', () => {
    for (const ist of hepsi()) {
      expect(ist.tezgah.length).toBeLessThanOrEqual(9);
      const sepet = dogruSepet(ist);
      const kalan = ist.tezgah.slice();
      for (const id of sepet) {
        const i = kalan.indexOf(id);
        expect(i, `${ist.tur}: ${id} tezgâhta yok`).toBeGreaterThanOrEqual(0);
        kalan.splice(i, 1);
      }
      for (const id of sepet) expect(uygunMu(ist, id)).toBe(true);
      expect(denetle(ist, sepet)).toBe('tamam');
    }
  });

  it('5 yaş ayırma: 3 meyve + 3 sebze, istenen hep aynı gruptan', () => {
    for (let t = 1; t <= 60; t++) {
      const ist = istekUret(5, 1, tohumlu(t));
      expect(ist.tur).toBe('ayir');
      expect(ist.tezgah.filter((id) => urunGrubu(id) === 'meyve')).toHaveLength(3);
      expect(ist.tezgah.filter((id) => urunGrubu(id) === 'sebze')).toHaveLength(3);
      for (const id of Object.keys(ist.istenen)) expect(urunGrubu(id)).toBe(ist.grup);
    }
  });

  it('bütün ürünler kart kataloğunda, renk ve grup bilgisiyle', () => {
    const ids = new Set([...P.urunler.say, ...P.urunler.meyve, ...P.urunler.sebze, ...Object.values(P.renkler).flat()]);
    for (const id of ids) {
      expect(kart(id), id).toBeDefined();
      expect(urunGrubu(id), id).toBeDefined();
    }
    for (const [renk, l] of Object.entries(P.renkler)) for (const id of l) expect(urunRengi(id), id).toBe(renk);
    for (const g of ['meyve', 'sebze'] as const) for (const id of P.urunler[g]) expect(urunGrubu(id), id).toBe(g);
  });
});

describe('pazar: doğru / yanlış', () => {
  const sabit = (o: Partial<Istek> & Pick<Istek, 'tur' | 'istenen'>): Istek => ({ tezgah: [], soz: [], yazi: '', dugmeli: true, ...o });

  it('tek: doğru ürün tamam, başka ürün uymaz', () => {
    const ist = sabit({ tur: 'tek', istenen: { elma: 1 }, dugmeli: false });
    expect(uygunMu(ist, 'elma')).toBe(true);
    expect(uygunMu(ist, 'muz')).toBe(false);
    expect(denetle(ist, ['elma'])).toBe('tamam');
    expect(denetle(ist, [])).toBe('az');
  });

  it('renk: aynı renkteki ürün uyar', () => {
    const ist = sabit({ tur: 'renk', istenen: { cilek: 1 }, renk: 'kırmızı', dugmeli: false });
    expect(uygunMu(ist, 'cilek')).toBe(true);
    expect(uygunMu(ist, 'domates')).toBe(true);
    expect(uygunMu(ist, 'muz')).toBe(false);
    expect(denetle(ist, ['cilek'])).toBe('tamam');
  });

  it('sayma: az, tamam, fazla', () => {
    const ist = sabit({ tur: 'sayi', istenen: { cilek: 3 } });
    expect(uygunMu(ist, 'muz')).toBe(false);
    expect(denetle(ist, ['cilek', 'cilek'])).toBe('az');
    expect(denetle(ist, ['cilek', 'cilek', 'cilek'])).toBe('tamam');
    expect(denetle(ist, ['cilek', 'cilek', 'cilek', 'cilek'])).toBe('fazla');
  });

  it('iki ürün: ikisi de doğru adette olmalı', () => {
    const ist = sabit({ tur: 'iki', istenen: { elma: 2, muz: 1 } });
    expect(denetle(ist, ['elma', 'elma', 'muz'])).toBe('tamam');
    expect(denetle(ist, ['muz', 'elma', 'elma'])).toBe('tamam');
    expect(denetle(ist, ['elma', 'elma'])).toBe('az');
    expect(denetle(ist, ['elma', 'muz', 'muz'])).toBe('fazla');
  });

  it('ayırma: yalnız gruptakiler uyar, hepsi konunca tamam', () => {
    const ist = sabit({ tur: 'ayir', grup: 'meyve', istenen: { elma: 1, muz: 1, kiraz: 1 }, dugmeli: false });
    expect(uygunMu(ist, 'armut')).toBe(true);
    expect(uygunMu(ist, 'havuc')).toBe(false);
    expect(denetle(ist, ['elma', 'muz'])).toBe('az');
    expect(denetle(ist, ['kiraz', 'elma', 'muz'])).toBe('tamam');
  });

  it('toplama: yalnız eklenenler sayılır', () => {
    const ist = sabit({ tur: 'toplama', istenen: { elma: 3 }, bende: 2 });
    expect(denetle(ist, ['elma', 'elma'])).toBe('az');
    expect(denetle(ist, ['elma', 'elma', 'elma'])).toBe('tamam');
  });

  it('para: 1 ve 5 liralarla toplam tutmalı', () => {
    const ist = sabit({ tur: 'ode', istenen: {}, lira: 7 });
    expect(paraMi('para-5') && PARA['para-5']).toBe(5);
    expect(uygunMu(ist, 'para-1')).toBe(true);
    expect(uygunMu(ist, 'elma')).toBe(false);
    expect(denetle(ist, ['para-5', 'para-1', 'para-1'])).toBe('tamam');
    expect(denetle(ist, ['para-1', 'para-1', 'para-1', 'para-1', 'para-1', 'para-1', 'para-1'])).toBe('tamam');
    expect(denetle(ist, ['para-5', 'para-1'])).toBe('az');
    expect(denetle(ist, ['para-5', 'para-5'])).toBe('fazla');
  });
});

describe('pazar: metinler', () => {
  const liste = new Set(tumCumleler());
  it('oyunun söyleyeceği her parça seslendirme listesinde', () => {
    for (const ist of hepsi()) for (const p of ist.soz) expect(liste.has(normal(p)), p).toBe(true);
    for (const p of pazarCumleleri()) expect(liste.has(normal(p)), p).toBe(true);
  });
  it('kısa: cümle ≤ 30 karakter, soru ≤ 6 kelime; arayüz yazısı ≤ 30 karakter', () => {
    for (const c of pazarCumleleri()) {
      expect(c.length, c).toBeLessThanOrEqual(30);
      expect(c.split(/\s+/).length, c).toBeLessThanOrEqual(6);
    }
    for (const t of Object.values(P.arayuz)) expect(t.length, t).toBeLessThanOrEqual(30);
  });
  it('"sıfır" hiç söylenmez', () => {
    for (const c of pazarCumleleri()) expect(c.toLocaleLowerCase('tr')).not.toContain('sıfır');
  });
});
