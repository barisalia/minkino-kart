/** Pide fırını mini oyununun saf kuralları (restoran/src/mini/pide/mantik.ts; RESTORAN.md §8 M10, §3c) */
import { describe, expect, it } from 'vitest';
import { alan, delik, EN_COK, firinPis, hamurda, kabarma, kalinlik, kenardaMi, merdane, miknatis, pidePisme, pidePorsiyon, sekil, topHamur } from '../../restoran/src/mini/pide/mantik';

const r0 = 60;
const ac = (yon: 'x' | 'y', px: number, yas: 'kucuk' | 'buyuk', h = topHamur()) => merdane(h, yon === 'x' ? px : 0, yon === 'y' ? px : 0, r0, yas);

describe('Pide: merdane şekil verir', () => {
  it('top hamur; tek yöne açılınca kayık, iki yöne yuvarlak', () => {
    expect(sekil(topHamur())).toBe('top');
    expect(sekil(ac('x', 300, 'kucuk'))).toBe('kayik');
    expect(sekil(ac('y', 220, 'kucuk', ac('x', 220, 'kucuk')))).toBe('yuvarlak');
  });
  it('3-4 yaşta her sürükleme daha belirgin açar; en ve boy sınırı aşılmaz', () => {
    expect(ac('x', 100, 'kucuk').en).toBeGreaterThan(ac('x', 100, 'buyuk').en);
    const h = ac('y', 99999, 'buyuk', ac('x', 99999, 'buyuk'));
    expect(h.en).toBe(EN_COK.en);
    expect(h.boy).toBe(EN_COK.boy);
    expect(kalinlik(h)).toBe(0);
  });
  it('çok açılan hamur delinir: pencereli pide (3-4 yaşta daha geç)', () => {
    const ince = { en: 2.5, boy: 1.7 };
    expect(alan(ince)).toBeGreaterThan(4);
    expect(delik(ince, 'buyuk')).toBeGreaterThan(0);
    expect(delik(ince, 'kucuk')).toBe(0);
    expect(delik(topHamur(), 'buyuk')).toBe(0);
  });
});

describe('Pide: malzeme ve kenar', () => {
  it('hamurun içi, kenar bandı, hafif mıknatıs', () => {
    const h = { en: 2, boy: 1 };
    expect(hamurda(100, 0, h, r0)).toBe(true);
    expect(hamurda(0, 70, h, r0)).toBe(false);
    expect(kenardaMi(118, 0, h, r0)).toBe(true);
    expect(kenardaMi(10, 0, h, r0)).toBe(false);
    // hemen dışına bırakılan içeri çekilir, uzağa bırakılan tezgâhta kalır
    const m = miknatis(0, 66, h, r0)!;
    expect(hamurda(m.x, m.y, h, r0)).toBe(true);
    expect(miknatis(0, 200, h, r0)).toBeNull();
  });
  it('porsiyon: malzeme dağı kocaman, üç parça az', () => {
    expect(pidePorsiyon(25, topHamur())).toBe('kocaman');
    expect(pidePorsiyon(3, topHamur())).toBe('az');
    expect(pidePorsiyon(9, topHamur())).toBe('normal');
  });
});

describe('Pide: fırın, kömür yok', () => {
  it('çiğ → az → altın → çıtır, çıtırda durur; kabarır', () => {
    expect(pidePisme(firinPis(0, 1))).toBe('cig');
    expect(pidePisme(firinPis(0, 5))).toBe('az');
    expect(pidePisme(firinPis(0, 10))).toBe('altin');
    expect(pidePisme(firinPis(0, 3600))).toBe('citir');
    expect(firinPis(0, 3600)).toBeLessThan(4);
    expect(kabarma(0)).toBe(0);
    expect(kabarma(5)).toBe(1);
  });
});
