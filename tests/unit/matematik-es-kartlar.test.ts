// Matematik · Mila ile Pamuk'un Eş Kartları (es-kartlar.ts): görsel bellek ve eşleme; 2–3 yaş önceliği.
import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import sozler from '../../matematik/src/sozler.json';
import { DOST, ES_CIZIMLERI, ES_SOZ, KART, RESIMLER, esMi, esTuru, kartYeri, sutunSayisi } from '../../matematik/src/es-kartlar';
import { EK, EK_TURLAR } from '../../matematik/src/tur-sirasi';
import { YENI_CIZIMLER, YENI_KOSE, YENI_SOZ } from '../../matematik/src/yeni-turlar';
import { BECERI_TURLERI } from '../../matematik/src/veli-ozet';

const YOLLAR = ['minik', 'dort', 'bes'] as const;

describe("Matematik · Mila ile Pamuk'un Eş Kartları", () => {
  it('2–3 yaş 4 kart (önce bakış), 4 yaş 6, 5+ 8; her resim tam iki kez; bir eşin kartları yan yana ya da üst üste değil', () => {
    for (const yol of YOLLAR)
      for (let t = 0; t < 8; t++) {
        const e = esTuru(yol, t), n = yol === 'minik' ? 4 : yol === 'dort' ? 6 : 8, s = sutunSayisi(n);
        expect(e.dizilis).toHaveLength(n);
        for (const r of e.resimler) expect(e.dizilis.filter((x) => x === r)).toHaveLength(2);
        e.dizilis.forEach((x, i) => {
          if (i % s !== s - 1) expect(e.dizilis[i + 1], yol + ' ' + t + ' ' + i).not.toBe(x);
          if (i + s < n) expect(e.dizilis[i + s], yol + ' ' + t + ' ' + i).not.toBe(x);
        });
        expect(e.onizleme).toBe(yol === 'minik');
        // Aynı gelişte hep aynı diziliş (yarıda kalan tur aynı yerlerle sürer).
        expect(esTuru(yol, t)).toEqual(e);
      }
    expect(esMi(['tren', 'davul', 'tren', 'davul'], 0, 2)).toBe(true);
    expect(esMi(['tren', 'davul', 'tren', 'davul'], 0, 0)).toBe(false);
    expect(esMi(['tren', 'davul', 'tren', 'davul'], 0, 1)).toBe(false);
  });

  it('kartlar halıda üst üste binmez, Mila ve Pamuk\'un arasında kalır', () => {
    for (const n of [4, 6, 8]) {
      const y = Array.from({ length: n }, (_, i) => kartYeri(i, n));
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
        const a = y[i], b = y[j];
        expect(a.x + KART.w <= b.x || b.x + KART.w <= a.x || a.y + KART.h <= b.y || b.y + KART.h <= a.y).toBe(true);
      }
      expect(Math.min(...y.map((p) => p.x))).toBeGreaterThanOrEqual(DOST.mila.x + DOST.mila.w);
      expect(Math.max(...y.map((p) => p.x + KART.w))).toBeLessThanOrEqual(DOST.pamuk.x);
    }
  });

  it('sözler: her resmin eş sözü; ikişer sayma "İki. Dört. Altı. Sekiz."', () => {
    for (const r of RESIMLER) expect(sozler[ES_SOZ.es[r]]).toMatch(/^Eş! İki /);
    expect([2, 4, 6, 8].map((n) => sozler[ES_SOZ.sayi[n]])).toEqual(['İki.', 'Dört.', 'Altı.', 'Sekiz.']);
    expect(sozler[ES_SOZ.degil]).toMatch(/aklında tut/);
  });

  it('bağlantı: ek tur 125 her yaşta Fener\'in sonunda; çizimler ve 12 Ceren kaydı yerinde', () => {
    expect(EK.eskart).toBe(125);
    for (const yol of YOLLAR) expect(EK_TURLAR[yol].fener.at(-1)).toBe(EK.eskart);
    expect(YENI_KOSE.eskart).toBe('fener');
    expect(BECERI_TURLERI.oruntu.fener).toContain('eskart');
    expect(YENI_CIZIMLER.eskart).toEqual(ES_CIZIMLERI);
    expect(ES_CIZIMLERI).toHaveLength(13);
    const nolar = Object.values(YENI_SOZ.eskart) as number[];
    for (let i = 336; i <= 347; i++) expect(nolar, String(i)).toContain(i);
    for (const i of nolar) { expect(sozler[i], String(i)).toBeTruthy(); expect(existsSync('assets/matematik/ses/ses-' + i + '.mp3'), 'ses-' + i).toBe(true); }
  });
});
