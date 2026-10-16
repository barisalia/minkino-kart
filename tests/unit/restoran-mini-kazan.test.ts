/** Kazan mini oyununun saf kuralları (restoran/src/mini/kazan/mantik.ts; RESTORAN.md §8 M7, §3c) */
import { describe, expect, it } from 'vitest';
import { bosKazan, CIZGI, corbaRengi, hazir, kasePorsiyon, kazanPis, kazanPisme, kepceDok, kepceKaristir, KAZAN_TUR, tadim } from '../../restoran/src/mini/kazan/mantik';

const dolu = { ...bosKazan(), mercimek: 2, malzemeler: { havuc: 3 } };

describe('Kazan: pişme, yanma yok', () => {
  it('boş kazan pişmez; dolu kazan zamanla koyulaşır ve orada durur', () => {
    expect(kazanPis(bosKazan(), 100)).toBe(0);
    expect(kazanPisme(kazanPis(dolu, 7))).toBe('az');
    expect(kazanPisme(kazanPis(dolu, 13))).toBe('altin');
    expect(kazanPisme(kazanPis(dolu, 3600))).toBe('citir');
    expect(kazanPis(dolu, 3600)).toBeLessThan(4);
  });
  it('3-4 yaşta üç tur, 5-6 yaşta beş tur karıştırma', () => {
    const R = 100;
    const tur = 2 * Math.PI * R * 0.5;
    expect(kepceKaristir(0, tur * KAZAN_TUR.kucuk, R, 'kucuk')).toBe(1);
    expect(kepceKaristir(0, tur * 3, R, 'buyuk')).toBeLessThan(1);
  });
  it('hazır: karıştı ve (3-4) az / (5-6) altın pişti', () => {
    expect(hazir({ ...dolu, karisim: 1, p: 1.2 }, 'kucuk')).toBe(true);
    expect(hazir({ ...dolu, karisim: 1, p: 1.2 }, 'buyuk')).toBe(false);
    expect(hazir({ ...dolu, karisim: 0.6, p: 3 }, 'buyuk')).toBe(false);
  });
});

describe('Kazan: Mino tadımı (dolaylı ipucu)', () => {
  it('su, çiğ, tuzlu, acı, ekşi, tatsız, mmm', () => {
    expect(tadim(bosKazan())).toBe('su');
    expect(tadim({ ...dolu, p: 0.5, tuz: 1 })).toBe('cig');
    expect(tadim({ ...dolu, p: 2, tuz: 3 })).toBe('tuzlu');
    expect(tadim({ ...dolu, p: 2, tuz: 1, aci: 2 })).toBe('aci');
    expect(tadim({ ...dolu, p: 2, tuz: 1, eksi: 3 })).toBe('eksi');
    expect(tadim({ ...dolu, p: 2 })).toBe('tatsiz');
    expect(tadim({ ...dolu, p: 2, tuz: 1 })).toBe('mmm');
  });
});

describe('Kazan: kâseye doldurma', () => {
  it('3-4 yaşta çizgide kendiliğinden durur, taşmaz', () => {
    let d = 0;
    for (let i = 0; i < 6; i++) {
      const s = kepceDok(d, 'kucuk');
      expect(s.tasti).toBe(false);
      d = s.dolum;
    }
    expect(d).toBeCloseTo(CIZGI, 5);
  });
  it('5-6 yaşta dördüncü kepçe taşırır: porsiyon kocaman', () => {
    let d = 0;
    let tasti = false;
    for (let i = 0; i < 4; i++) {
      const s = kepceDok(d, 'buyuk');
      d = s.dolum;
      tasti ||= s.tasti;
    }
    expect(tasti).toBe(true);
    expect(kasePorsiyon(d, tasti)).toBe('kocaman');
    expect(kasePorsiyon(0.34, false)).toBe('az');
  });
  it('çorbanın rengi sudan mercimeğe döner', () => {
    expect(corbaRengi(bosKazan()).toLowerCase()).toBe('#cfe6ec');
    const r = corbaRengi({ ...bosKazan(), mercimek: 3, karisim: 1, p: 2 });
    expect(parseInt(r.slice(1, 3), 16)).toBeGreaterThan(parseInt(r.slice(5, 7), 16));
  });
});
