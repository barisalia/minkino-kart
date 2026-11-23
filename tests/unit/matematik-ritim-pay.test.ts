import { describe, expect, it } from 'vitest';
import sozler from '../../matematik/src/sozler.json';
import { ONLU_SOZ, OTUZ_BES_SOZ, PAY_SOZ, RITIM_SOZ, YIRMI_BES_SOZ, esitMi, paySorulari, ritimSecenekleri, ritimSiralari, teraziDurusu } from '../../matematik/src/ritim-pay';

describe('Matematik · Ritmik Zıplama ve Eşit Paylaşım (5+)', () => {
  it('ritmik diziler gelişe göre: 2\'şer (0 ve 8\'den) → 2\'şer ve 5\'er → 5\'er ve 10\'ar; altı taş; seçeneklerde doğru, birer yanılgısı ve bir adım fazlası', () => {
    expect(ritimSiralari(0).map((d) => [d.bas, d.taslar])).toEqual([[0, [2, 4, 6, 8, 10, 12]], [8, [10, 12, 14, 16, 18, 20]]]);
    expect(ritimSiralari(1).map((d) => [d.adim, d.bas])).toEqual([[2, 6], [5, 0]]);
    expect(ritimSiralari(2).map((d) => d.taslar)).toEqual([[10, 15, 20, 25, 30, 35], [10, 20, 30, 40, 50, 60]]);
    expect(ritimSiralari(3).map((d) => d.taslar)).toEqual([[50, 60, 70, 80, 90, 100], [5, 10, 15, 20, 25, 30]]);
    expect(ritimSecenekleri(6, 2)).toEqual([7, 8, 10]);
    expect(ritimSecenekleri(15, 5)).toEqual([16, 20, 25]);
    for (const d of [0, 1, 2, 3].flatMap((t) => ritimSiralari(t)))
      for (let i = d.gosterilen; i < d.taslar.length; i++) {
        const s = ritimSecenekleri(d.taslar[i - 1], d.adim);
        expect(s).toContain(d.taslar[i]);
        expect(s).toHaveLength(3);
      }
  });

  it('ritmik dizilerin her sayısının Ceren kaydı var (1–20 eski kayıtlar; 25, 35, 30…100 yeni sözler)', () => {
    const s = sozler as string[];
    for (const d of [0, 1, 2, 3, 4].flatMap((t) => ritimSiralari(t)))
      for (const n of d.taslar) if (n > 20) expect(n === 25 ? s[YIRMI_BES_SOZ] : n === 35 ? s[OTUZ_BES_SOZ] : s[ONLU_SOZ[n]], String(n)).toBeTruthy();
    for (const i of Object.values(RITIM_SOZ)) expect(s[i]).toBeTruthy();
    for (const i of Object.values(PAY_SOZ)) expect(s[i]).toBeTruthy();
  });

  it('eşit paylaşım: sorular tam bölünür; eşitlik ve terazinin duruşu', () => {
    for (let t = 0; t < 5; t++) for (const q of paySorulari(t)) expect(q.kurabiye % q.tabak).toBe(0);
    expect(esitMi({ kurabiye: 6, tabak: 2 }, [3, 3])).toBe(true);
    expect(esitMi({ kurabiye: 6, tabak: 2 }, [4, 2])).toBe(false);
    expect(esitMi({ kurabiye: 9, tabak: 3 }, [3, 3, 2])).toBe(false);
    expect(esitMi({ kurabiye: 9, tabak: 3 }, [3, 3, 3])).toBe(true);
    expect(teraziDurusu([3, 3])).toEqual({ aci: 0, ortaInis: 0 });
    expect(teraziDurusu([1, 4]).aci).toBeGreaterThan(0);
    expect(teraziDurusu([9, 0]).aci).toBe(-14);
    expect(teraziDurusu([2, 4, 2]).ortaInis).toBeGreaterThan(0);
    expect(teraziDurusu([3, 3, 3])).toEqual({ aci: 0, ortaInis: 0 });
  });
});
