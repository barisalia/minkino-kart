// Matematik · Dede'nin Şekil Kutusu (sekil-kutusu.ts): şekil tanıma ve eşleme; 5+ yaşta çevirme.
import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import sozler from '../../matematik/src/sozler.json';
import { DELIK, KUTU, KUTU_CIZIMLERI, KUTU_SEKILLERI, KUTU_SOZ, PARCA_TUVALI, PARCA_YERI, DEDE, delikBul, girerMi, kutuTuru } from '../../matematik/src/sekil-kutusu';
import { EK, EK_TURLAR } from '../../matematik/src/tur-sirasi';
import { YENI_CIZIMLER, YENI_KOSE, YENI_SOZ } from '../../matematik/src/yeni-turlar';
import { BECERI_TURLERI } from '../../matematik/src/veli-ozet';

describe("Matematik · Dede'nin Şekil Kutusu", () => {
  it('şekil yalnız düz dururken (simetrisine göre) girer', () => {
    expect([0, 90, 180, 270].map((a) => girerMi('daire', a))).toEqual([true, true, true, true]);
    expect([0, 90, 180, 270].map((a) => girerMi('kare', a))).toEqual([true, true, true, true]);
    expect([0, 90, 180, 270].map((a) => girerMi('dikdortgen', a))).toEqual([true, false, true, false]);
    expect([0, 90, 180, 270].map((a) => girerMi('ucgen', a))).toEqual([true, false, false, false]);
    expect(girerMi('yildiz', 360)).toBe(true);
  });

  it('2–3 yaş daire, kare, üçgen (dört parça, düz); 4 yaş dikdörtgen de (beş, düz); 5+ beş şekil, ikisi çevrilmeli', () => {
    for (let t = 0; t < 6; t++) {
      const m = kutuTuru('minik', t), d = kutuTuru('dort', t), b = kutuTuru('bes', t);
      expect(m.parcalar).toHaveLength(4);
      expect(new Set(m.parcalar.map((p) => p.sekil))).toEqual(new Set(['daire', 'kare', 'ucgen']));
      expect(m.parcalar.every((p) => p.aci === 0) && !m.cevir).toBe(true);
      expect(d.parcalar).toHaveLength(5);
      expect(new Set(d.parcalar.map((p) => p.sekil))).toEqual(new Set(['daire', 'kare', 'ucgen', 'dikdortgen']));
      expect(d.parcalar.every((p) => p.aci === 0)).toBe(true);
      expect(new Set(b.parcalar.map((p) => p.sekil))).toEqual(new Set(KUTU_SEKILLERI));
      expect(b.cevir).toBe(true);
      expect(b.parcalar.filter((p) => !girerMi(p.sekil, p.aci))).toHaveLength(2);
      if (t > 0) expect(JSON.stringify(b)).not.toBe(JSON.stringify(kutuTuru('bes', t - 1)));
    }
  });

  it('delikler kutunun içinde ve ayrık; her parça kendi deliğinden küçük; parçalar ve Dede kutunun dışında', () => {
    for (const s of KUTU_SEKILLERI) {
      const d = DELIK[s];
      expect(d.x - d.w / 2 >= 0 && d.x + d.w / 2 <= KUTU.w && d.y - d.h / 2 >= 0 && d.y + d.h / 2 <= KUTU.h, s).toBe(true);
      expect(PARCA_TUVALI[s].w).toBeLessThan(d.w);
      expect(PARCA_TUVALI[s].h).toBeLessThan(d.h);
      expect(delikBul(KUTU.x + d.x, KUTU.y + d.y)).toBe(s);
    }
    for (const [x] of PARCA_YERI) expect(x - 80).toBeGreaterThan(KUTU.x + KUTU.w);
    expect(DEDE.x + DEDE.w).toBeLessThanOrEqual(KUTU.x);
  });

  it('bağlantı: ek tur 126 her yaşta Şekil\'de; sözler ve 10 Ceren kaydı yerinde', () => {
    expect(EK.kutu).toBe(126);
    for (const yol of ['minik', 'dort', 'bes'] as const) expect(EK_TURLAR[yol].sekil.at(-1)).toBe(EK.kutu);
    expect(YENI_KOSE.kutu).toBe('sekil');
    expect(BECERI_TURLERI.sekil.sekil).toContain('kutu');
    expect(YENI_CIZIMLER.kutu).toEqual(KUTU_CIZIMLERI);
    for (const s of KUTU_SEKILLERI) expect(sozler[KUTU_SOZ.girdi[s]]).toMatch(/^Tık! .+ girdi\.$/);
    const nolar = Object.values(YENI_SOZ.kutu) as number[];
    for (let i = 348; i <= 357; i++) expect(nolar, String(i)).toContain(i);
    for (const i of nolar) { expect(sozler[i], String(i)).toBeTruthy(); expect(existsSync('assets/matematik/ses/ses-' + i + '.mp3'), 'ses-' + i).toBe(true); }
  });
});
