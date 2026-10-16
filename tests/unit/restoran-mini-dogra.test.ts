/** Doğra mini oyununun saf kuralları (restoran/src/mini/dogra/mantik.ts; RESTORAN.md §8 M1) */
import { describe, expect, it } from 'vitest';
import { bittiMi, dilimSayisi, gecis, itis, kes, kesimOzeti, kiy, ortadanGecti, sebzeKoy, seriPerde, seriSay, silkele, soy, yonBul, type SebzeDurum } from '../../restoran/src/mini/dogra/mantik';
import { miniSozleri, YASAK_DESEN } from '../../restoran/src/model';

const sabit = () => 0.5;
/** Bir sebzenin ilk parçasından (ya da id'si verilenden) geçen kesim */
const kesIlk = (d: SebzeDurum, yon: 'dik' | 'yatay' = 'dik', yas: 'kucuk' | 'buyuk' = 'buyuk', hangi = 0) => {
  const p = d.parcalar[hangi];
  return kes(d, p.id, yon, p.x, p.y, yas, sabit);
};

describe('Doğra: her sebze başka türlü kesilir', () => {
  it('salatalık: dik kaydırma şerit böler, ince şerit dilime devrilir, ses "kırt"', () => {
    const d = sebzeKoy('salatalik', 0.5, 0.5, 'buyuk');
    const s = kesIlk(d);
    expect(s.ses).toBe('kirt');
    expect(d.parcalar).toHaveLength(2);
    // sağdaki şeridi ucundan ucundan dilimle
    for (let i = 0; i < 12; i++) {
      const p = d.parcalar.filter((q) => q.gorunum === 'kirpik').sort((a, b) => b.w - a.w)[0];
      if (!p) break;
      kes(d, p.id, 'dik', p.x - p.w / 2 + p.w * 0.15, p.y, 'buyuk', sabit);
    }
    expect(d.parcalar.some((p) => p.gorunum === 'dilim')).toBe(true);
    expect(kesimOzeti(d, 'buyuk').kesim).toMatch(/dilim|ince/);
  });

  it('domates: ilk kesim iki yarım ("şlap"), yarımdan dilim, dilimden küp; aşırı kesim püre', () => {
    const d = sebzeKoy('domates', 0.5, 0.5, 'buyuk');
    const s = kesIlk(d);
    expect(s.olay).toBe('ikiye');
    expect(s.ses).toBe('slap');
    expect(d.parcalar.map((p) => p.gorunum)).toEqual(['yarim', 'yarim']);
    kesIlk(d);
    expect(d.parcalar.some((p) => p.gorunum === 'dilim')).toBe(true);
    const dilim = d.parcalar.find((p) => p.gorunum === 'dilim')!;
    kes(d, dilim.id, 'dik', dilim.x, dilim.y, 'buyuk', sabit);
    expect(d.parcalar.some((p) => p.gorunum === 'kup')).toBe(true);
    let son = s;
    for (let i = 0; i < 20 && !d.pure; i++) son = kesIlk(d);
    expect(d.pure).toBe(true);
    expect(son.olay).toBe('pure');
    expect(son.ses).toBe('vicik');
    expect(d.parcalar).toHaveLength(1);
    expect(kesimOzeti(d, 'buyuk')).toEqual({ adet: 1, kesim: 'pure' });
    // püreden sonra kesim bir şey yapmaz (vıcık)
    expect(kesIlk(d).olay).toBe('yok');
  });

  it('soğan: önce kabuk (3-4: tek çekiş, 5-6: üç), sonra yarım ve halka', () => {
    const k = sebzeKoy('sogan', 0.5, 0.5, 'kucuk');
    expect(k.kabuk).toBe(1);
    expect(soy(k)).toBe('kabukBitti');
    const d = sebzeKoy('sogan', 0.5, 0.5, 'buyuk');
    expect(d.kabuk).toBe(3);
    expect(bittiMi(d, 'buyuk')).toBe(false);
    // bıçak kabukta kayar, kabuk düşer (kilit yok)
    expect(kesIlk(d).olay).toBe('kabuk');
    expect(soy(d)).toBe('kabuk');
    expect(soy(d)).toBe('kabukBitti');
    expect(kesIlk(d).olay).toBe('ikiye');
    expect(d.kesim).toBe(1);
  });

  it('biber: ikiye kesilince çekirdek dökülür, silkeleyince kalanlar; yarım şeride ayrılır', () => {
    const d = sebzeKoy('biber', 0.5, 0.5, 'buyuk');
    const s = kesIlk(d);
    expect(s.olay).toBe('ikiye');
    expect(s.dokulen).toBeGreaterThan(0);
    const yarim = d.parcalar[0];
    expect(yarim.cekirdek).toBe(3);
    expect(silkele(d, yarim.id)).toBe(2);
    expect(silkele(d, yarim.id)).toBe(1);
    expect(silkele(d, yarim.id)).toBe(0);
    kesIlk(d);
    expect(d.parcalar.some((p) => p.gorunum === 'serit')).toBe(true);
  });

  it('maydanoz: vuruşla kıyılır, eşikten sonra ince kıyım', () => {
    const d = sebzeKoy('maydanoz', 0.5, 0.5, 'kucuk');
    expect(kesimOzeti(d, 'kucuk').kesim).toBe('butun');
    kiy(d, 0.5, 0.5, 'kucuk', sabit);
    expect(d.parcalar.every((p) => p.gorunum === 'kiyim')).toBe(true);
    expect(kesimOzeti(d, 'kucuk').kesim).toBe('iri');
    for (let i = 0; i < 5; i++) kiy(d, 0.5, 0.5, 'kucuk', sabit);
    expect(kesimOzeti(d, 'kucuk').kesim).toBe('kiyim');
    expect(bittiMi(d, 'kucuk')).toBe(true);
  });

  it('havuç ve patates sert: iki kaydırmada bir kesim (önce çentik)', () => {
    const d = sebzeKoy('havuc', 0.5, 0.5, 'kucuk');
    expect(kesIlk(d, 'yatay', 'kucuk').olay).toBe('centik');
    expect(d.parcalar).toHaveLength(1);
    expect(kesIlk(d, 'yatay', 'kucuk').ses).toBe('kitir');
    expect(d.parcalar).toHaveLength(2);
  });

  it('patates 5-6: boyuna dilim + enine kesim = çubuk', () => {
    const d = sebzeKoy('patates', 0.5, 0.5, 'buyuk');
    // boyuna (yatay kaydırma y'yi böler): iki kez, sert olduğu için her biri iki kaydırma
    for (let i = 0; i < 6; i++) {
      const p = d.parcalar.filter((q) => q.gorunum === 'kirpik').sort((a, b) => b.h - a.h)[0];
      kes(d, p.id, 'yatay', p.x, p.y, 'buyuk', sabit);
    }
    for (let i = 0; i < 30; i++) {
      const p = d.parcalar.filter((q) => q.gorunum === 'kirpik').sort((a, b) => b.w - a.w)[0];
      if (!p) break;
      kes(d, p.id, 'dik', p.x - p.w * 0.3, p.y, 'buyuk', sabit);
    }
    expect(d.parcalar.some((p) => p.gorunum === 'cubuk')).toBe(true);
  });

  it('3-4 yaş: parçalar iri (kesim yeri ortaya yakın), az kesimde biter', () => {
    const d = sebzeKoy('salatalik', 0.5, 0.5, 'kucuk');
    const p = d.parcalar[0];
    // parmak en uçtan geçse de parça iri kalır
    kes(d, p.id, 'yatay', p.x - p.w * 0.48, p.y, 'kucuk', sabit);
    const enler = d.parcalar.map((q) => q.w);
    expect(Math.min(...enler)).toBeGreaterThan(p.w * 0.25);
    let n = 1;
    while (!bittiMi(d, 'kucuk') && n < 20) {
      const q = d.parcalar.find((z) => z.gorunum === 'kirpik')!;
      kes(d, q.id, 'yatay', q.x, q.y, 'kucuk', sabit);
      n++;
    }
    expect(bittiMi(d, 'kucuk')).toBe(true);
    expect(n).toBeLessThanOrEqual(8);
    expect(dilimSayisi(d)).toBeGreaterThanOrEqual(3);
  });
});

describe('Doğra: dokunuş geometrisi ve his', () => {
  it('kaydırma parçanın merkez çizgisini geçerse kesim sayılır, kenara sürtmek kesmez', () => {
    const r = { x: 100, y: 100, w: 80, h: 40 };
    expect(ortadanGecti(100, 50, 100, 150, r)).toEqual({ x: 100, y: 100 });
    expect(ortadanGecti(100, 50, 100, 85, r)).toBeNull();
    expect(ortadanGecti(40, 100, 160, 100, r)).not.toBeNull();
    expect(gecis(0, 0, 10, 10, r)).toBeNull();
  });
  it('yön: dik ve yatay', () => {
    expect(yonBul(2, 30)).toBe('dik');
    expect(yonBul(30, 2)).toBe('yatay');
  });
  it('seri kesimde ses tonu hafifçe yükselir, ara verince başa döner', () => {
    let s = 0;
    s = seriSay(s, 100);
    s = seriSay(s, 100);
    s = seriSay(s, 100);
    expect(seriPerde(s)).toBeGreaterThan(1);
    expect(seriPerde(50)).toBeLessThanOrEqual(1.5);
    expect(seriSay(s, 2000)).toBe(1);
  });
  it('parçalar üst üste yığılmaz (itişir), tahtada kalır', () => {
    const ps = Array.from({ length: 6 }, (_, i) => ({ id: i, gorunum: 'dilim' as const, x: 0.5, y: 0.5 + i * 0.001, w: 0.1, h: 0.1 }));
    itis(ps, 1.5, 12);
    for (let i = 0; i < ps.length; i++)
      for (let j = i + 1; j < ps.length; j++) expect(Math.hypot(ps[i].x - ps[j].x, (ps[i].y - ps[j].y) / 1.5)).toBeGreaterThan(0.05);
    for (const p of ps) {
      expect(p.x).toBeGreaterThan(0);
      expect(p.x).toBeLessThan(1);
    }
  });
});

describe('Mini oyun sözleri', () => {
  it('Mino emir vermez (yasak sözler yok) ve sözler kısa', () => {
    const s = miniSozleri();
    expect(s.length).toBeGreaterThan(20);
    for (const t of s) {
      expect(t, t).not.toMatch(YASAK_DESEN);
      expect(t.replace(/\[[^\]]*\]\s*/g, '').length, t).toBeLessThanOrEqual(30);
    }
  });
});
