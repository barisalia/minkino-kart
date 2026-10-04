/** Dedektif Mino poz ekleri (dedektif/src/poz.ts): her pozun resmi var, boylar karakterin boyunda, esneme %10'u geçmez */
import { describe, expect, it } from 'vitest';
import { BAS, ESNE, POZ_OLCU, POZLAR } from '../../dedektif/src/poz';
import { resim, YUVA } from '../../dedektif/src/resimler';

describe('Dedektif: poz ekleri', () => {
  it('her pozun yuvası ve resmi var', () => {
    for (const p of POZLAR) {
      expect(YUVA[`poz-${p}`], p).toBeTruthy();
      expect(resim(`poz-${p}`), p).toBeTruthy();
    }
  });
  it('poz boyu karakterin normal boyuna yakın (sürünme alçak, ayaktakiler ~1)', () => {
    for (const p of POZLAR) {
      const b = POZ_OLCU[p].boy;
      expect(b, p).toBeGreaterThan(0.6);
      expect(b, p).toBeLessThan(1.1);
    }
    expect(POZ_OLCU['kino-utanc'].boy).toBeCloseTo(1, 1);
  });
  it('geçişte çizim %10dan fazla esnemez', () => {
    for (const v of [...BAS, ...ESNE]) expect(Math.abs(v - 1)).toBeLessThanOrEqual(0.1);
  });
});
