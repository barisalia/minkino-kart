import { describe, expect, it } from 'vitest';
import { boyaBolgesi, sihirliBoya, tumAlanlar, type Cizgi } from '../../canlan/src/boya';
import { puanla } from '../../canlan/src/puan';
import { daire, RESIMLER, resim, type Nokta } from '../../canlan/src/resimler';
import { SUS } from '../../canlan/src/susler';

const BIR = { s: 1, tx: 0, ty: 0 };
const cz = (n: Nokta[], kalinlik = 0.025): Cizgi => ({ n, kalinlik });
const alan = (m: Uint8Array) => m.reduce((a, v) => a + v, 0) / m.length;

describe('Çiz Canlansın: boyama', () => {
  it('kapalı şeklin içine dokununca yalnızca içi boyanır', () => {
    const r = resim('top')!;
    const b = boyaBolgesi(r, [cz(daire(0.5, 0.5, 0.3))], BIR, [0.5, 0.5])!;
    expect(b.parca).toBe('top');
    // π·0.3² ≈ 0.283; çizginin altına kadar uzanır ama dışarı taşmaz
    expect(alan(b.maske)).toBeGreaterThan(0.24);
    expect(alan(b.maske)).toBeLessThan(0.32);
  });

  it('küçük boşluk bırakılmış (tam kapanmamış) şekil yine taşmadan boyanır', () => {
    const r = resim('top')!;
    const acik = daire(0.5, 0.5, 0.3).slice(0, -2); // uçlar arasında ~0.06'lık boşluk yerine kısa bir aralık
    const b = boyaBolgesi(r, [cz(acik)], BIR, [0.5, 0.5])!;
    expect(alan(b.maske)).toBeLessThan(0.32);
  });

  it('büyük boşlukta boya taşarsa şablon şekli boyanır', () => {
    const r = resim('top')!;
    const yarim = daire(0.5, 0.5, 0.3).slice(0, 18); // yarım daire
    const b = boyaBolgesi(r, [cz(yarim)], BIR, [0.5, 0.5])!;
    expect(b.parca).toBe('top');
    expect(alan(b.maske)).toBeGreaterThan(0.2);
    expect(alan(b.maske)).toBeLessThan(0.32);
  });

  it('resmin dışına dokunmak boyamaz', () => {
    const r = resim('top')!;
    expect(boyaBolgesi(r, [cz(daire(0.5, 0.5, 0.3))], BIR, [0.05, 0.05])).toBeNull();
  });

  it('evde kapıya dokununca kapı, duvara dokununca duvar boyanır', () => {
    const r = resim('ev')!;
    const c = r.cizgiler.map((x) => cz(x.n));
    expect(boyaBolgesi(r, c, BIR, [0.5, 0.78])!.parca).toBe('kapi');
    expect(boyaBolgesi(r, c, BIR, [0.33, 0.75])!.parca).toBe('duvar');
    expect(boyaBolgesi(r, c, BIR, [0.5, 0.4])!.parca).toBe('cati');
  });

  it('başka yerde küçük çizilmiş resimde de doğru parça bulunur (hizalamayla)', () => {
    const r = resim('balik')!;
    const cocuk = r.cizgiler.map((x) => x.n.map(([a, b]): Nokta => [a * 0.6 + 0.3, b * 0.6 + 0.35]));
    const p = puanla(r, cocuk, 'kopya', 5);
    const kuyruk: Nokta = [0.17 * 0.6 + 0.3, 0.5 * 0.6 + 0.35];
    expect(boyaBolgesi(r, cocuk.map((n) => cz(n, 0.02)), p.donusum, kuyruk)!.parca).toBe('kuyruk');
  });

  it('sihirli boya her resimde önerilen renkli bütün alanları boyar', () => {
    for (const r of RESIMLER) {
      const renkli = tumAlanlar(r).filter(([p]) => SUS[r.id].boya[p]);
      const b = sihirliBoya(r, r.cizgiler.map((x) => cz(x.n)), BIR);
      expect(b.length, r.id).toBe(renkli.length);
      for (const x of b) expect(alan(x.maske), `${r.id} ${x.parca}`).toBeGreaterThan(0.001);
    }
  });

  it('her resmin süsü ve boya bilgisi var, süsler var olan parçalara bağlı', () => {
    for (const r of RESIMLER) {
      const g = SUS[r.id];
      expect(g, r.id).toBeTruthy();
      const parcalar = new Set(r.cizgiler.map((c) => c.parca));
      for (const s of g.sus) expect(parcalar.has(s.parca), `${r.id}: ${s.parca}`).toBe(true);
      for (const p of Object.keys(g.boya)) expect(parcalar.has(p), `${r.id}: ${p}`).toBe(true);
    }
  });
});
