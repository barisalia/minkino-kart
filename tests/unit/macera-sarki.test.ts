import { describe, expect, it } from 'vitest';
import { anlikFark, melodi, notaDegerlendir, referansBul, tepeNota } from '../../macera/src/sarki';

const hz = (midi: number, ref = 67, refHz = 300) => refHz * Math.pow(2, (midi - ref) / 12);

describe('Doğum günü şarkısı', () => {
  it('dört satır, satır başına 6-7 hece; en yüksek nota "ki"', () => {
    const m = melodi();
    expect(m.filter((n) => n.satir === 2).map((n) => n.hece).join('')).toBe('İyikidoğdunAda');
    expect(new Set(m.map((n) => n.satir)).size).toBe(4);
    expect(tepeNota(m).hece).toBe('ki');
    expect(melodi(2).length).toBe(12);
  });

  it('ton bağımsız: çocuk hangi tonda söylerse söylesin aralıklar doğruysa kabul', () => {
    for (const refHz of [220, 300, 420]) {
      const ref = referansBul(Array(8).fill(refHz))!;
      for (const n of melodi()) {
        const p = Array(10).fill(hz(n.midi, 67, refHz));
        expect(notaDegerlendir({ perdeler: p, sesli: 1, midi: n.midi, referans: ref, tolerans: 2.5, yalnizSes: false })).toBe('dogru');
      }
    }
  });

  it('bir oktav yukarı söylemek affedilir; çok ince/kalın yakalanır', () => {
    const ref = 300;
    expect(notaDegerlendir({ perdeler: Array(8).fill(hz(72 + 12)), sesli: 1, midi: 72, referans: ref, tolerans: 2.5, yalnizSes: false })).toBe('dogru');
    expect(notaDegerlendir({ perdeler: Array(8).fill(hz(72 + 5)), sesli: 1, midi: 72, referans: ref, tolerans: 2.5, yalnizSes: false })).toBe('tiz');
    expect(notaDegerlendir({ perdeler: Array(8).fill(hz(72 - 5)), sesli: 1, midi: 72, referans: ref, tolerans: 2.5, yalnizSes: false })).toBe('kalin');
    expect(anlikFark(hz(77.5), ref, 72)).toBeGreaterThan(4.5);
    expect(anlikFark(hz(66.5), ref, 72)).toBeLessThan(-4.5);
  });

  it('sessizlik ve küçük yaş: ses yoksa sessiz, 3-4 yaşta ses yeterli', () => {
    expect(notaDegerlendir({ perdeler: [], sesli: 0.1, midi: 67, referans: 300, tolerans: 3, yalnizSes: true })).toBe('sessiz');
    expect(notaDegerlendir({ perdeler: Array(8).fill(900), sesli: 0.8, midi: 67, referans: 300, tolerans: 3, yalnizSes: true })).toBe('dogru');
  });
});
