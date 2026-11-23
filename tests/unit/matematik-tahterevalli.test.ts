import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import sozler from '../../matematik/src/tahterevalli-sozler.json';
import {
  EN_ACI, GEREKLI_CIZIMLER, GEREKLI_SESLER, aci, dengeSesi, durum, turlar, yasYolu, yayAdimi, yiginBoyu, type TYol,
} from '../../matematik/src/tahterevalli-mantik';

const YOLLAR: TYol[] = ['minik', 'dort', 'bes'];

describe("Bulut'un Tahterevalli Dengesi", () => {
  it('yaşa ve gelişe göre: 2–3 yaş 2 → 3 → 4 küp; 4 yaş 3 → 4 → 5; 5+ 4, ikinci turda iki nesneyle 6; denge sesleri 2–6', () => {
    expect([yasYolu(2), yasYolu(3), yasYolu(4), yasYolu(5), yasYolu(null)]).toEqual(['minik', 'minik', 'dort', 'bes', 'bes']);
    expect(turlar('minik').map((t) => t.hedef)).toEqual([2]);
    expect([0, 1, 2].map((n) => turlar('minik', n)[0].hedef)).toEqual([2, 3, 4]);
    expect([0, 1, 2, 3].map((n) => turlar('dort', n)[0].hedef)).toEqual([3, 4, 5, 6]);
    for (const y of ['minik', 'dort', 'bes'] as const) for (let n = 0; n < 6; n++) for (const t of turlar(y, n)) { expect(t.hedef).toBeGreaterThanOrEqual(2); expect(t.hedef).toBeLessThanOrEqual(6); }
    const bes = turlar('bes');
    expect(bes.map((t) => t.hedef)).toEqual([4, 6]);
    expect(bes[1].nesneler.map((n) => n.ad)).toEqual(['balkabagi', 'sulama-kabi']);
    // İkinci tur başka iş: iki nesnenin toplamı; aynı tur iki kez gelmez.
    expect(bes[0].soz).toBe('giris');
    expect(bes[1].soz).toBe('ikinci');
  });

  it('tahta: eksikte sola yatık ve her küpte düzelir; eşitte düz; fazlada sağa yatar', () => {
    for (const yol of YOLLAR)
      for (const t of turlar(yol)) {
        const acilar = Array.from({ length: t.hedef + 1 }, (_, k) => aci(k, t.hedef));
        expect(acilar[0]).toBe(-EN_ACI);
        for (let k = 1; k <= t.hedef; k++) expect(acilar[k]).toBeGreaterThan(acilar[k - 1]);
        expect(acilar[t.hedef]).toBe(0);
        expect(aci(t.hedef + 1, t.hedef)).toBeGreaterThan(0);
        expect(aci(t.hedef + 2, t.hedef)).toBeLessThanOrEqual(EN_ACI);
        expect([durum(0, t.hedef), durum(t.hedef, t.hedef), durum(t.hedef + 1, t.hedef)]).toEqual(['agir', 'denge', 'fazla']);
        // Fazla koymak mümkün: yığında iki küp artar.
        expect(yiginBoyu(t.hedef)).toBe(t.hedef + 2);
      }
  });

  it('yay: tahta hedefe bir iki salınımla oturur (park fiziği), sonsuza dek sallanmaz', () => {
    let s = { aci: -EN_ACI, hiz: 0 }, enCok = -Infinity;
    for (let i = 0; i < 240; i++) { s = yayAdimi(s, 0, 1 / 60); enCok = Math.max(enCok, s.aci); }
    expect(enCok).toBeGreaterThan(0.3); // hedefi biraz aşar: yaylanma
    expect(enCok).toBeLessThan(EN_ACI * 0.6); // ama sert değil
    expect(Math.abs(s.aci)).toBeLessThan(0.05); // 4 sn'de oturur
    // Yavaş cihazda büyük kare süresi de patlamaz.
    let y = { aci: -EN_ACI, hiz: 0 };
    for (let i = 0; i < 20; i++) y = yayAdimi(y, 0, 0.5);
    expect(Math.abs(y.aci)).toBeLessThan(EN_ACI);
  });

  it('sözler: her denge sayısının kaydı var, hepsi diskte; M13 adları brief’le aynı', () => {
    for (const yol of YOLLAR) for (const n of [0, 1]) for (const t of turlar(yol, n)) {
      expect(sozler).toHaveProperty(dengeSesi(t.hedef));
      expect(sozler).toHaveProperty(t.soz);
    }
    expect(GEREKLI_SESLER).toEqual(Object.keys(sozler));
    for (const id of GEREKLI_SESLER) expect(existsSync('assets/matematik/tahterevalli/ses/' + id + '.mp3'), id).toBe(true);
    expect(GEREKLI_CIZIMLER).toEqual(['bahce', 'mesnet', 'kol', 'balkabagi', 'kup', 'sulama-kabi', 'bulut-otur', 'bulut-kikirda', 'lokum-izle', 'lokum-alkis']);
  });
});
