import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import sozler from '../../matematik/src/sozler.json';
import {
  BOY, KURBAGA_TUVAL, OLCU_CIZIMLERI, OLCU_SOZLERI, SERIT, SOZ, TUVAL, YAPRAK_EN, YER_TUTUCU, boyHayvanlari, olcuHazirMi, olcuTuru, yaprakSayisi,
  type Hayvan,
} from '../../matematik/src/olcu-yeni';

describe('Ölçü tezgâhı · Boy Duvarı ve Kurbağanın Yaprak Yolu', () => {
  it('Astra brief’indeki 27 çizim (assets/matematik/olcu/) ve tuval ölçüleri', () => {
    expect(OLCU_CIZIMLERI).toHaveLength(27);
    expect(OLCU_CIZIMLERI).toEqual(expect.arrayContaining(['zurafa-0', 'zurafa-2', 'kaplumbaga-1', 'tahta', 'tahta-yigini', 'boy-kosesi', 'kurbaga-0', 'kurbaga-5', 'yaprak', 'sepet-dolu', 'sepet-bos', 'nilufer-cicegi', 'su-halkasi', 'golet']));
    expect(TUVAL).toEqual({ en: 700, boy: 900, taban: 860, tahta: 160 });
    expect(KURBAGA_TUVAL).toEqual({ en: 500, boy: 500, temas: 440 });
    // Brief: poz 0'da tepe noktası zürafa y = 60, ördek 380, tavşan 540, kaplumbağa 700.
    const tepe = (h: Hayvan) => TUVAL.taban - BOY[h] * TUVAL.tahta;
    expect([tepe('zurafa'), tepe('ordek'), tepe('tavsan'), tepe('kaplumbaga')]).toEqual([60, 380, 540, 700]);
    // Altı yaprak, göletin boş su şeridini (x 330…1340) tam doldurur.
    expect(YAPRAK_EN * 6).toBeCloseTo(SERIT.sag - SERIT.sol, 9);
  });

  it('Ceren’in bütün sözleri sozler.json’da, kayıtları diskte; tekrar eden söz yok', () => {
    expect(new Set(OLCU_SOZLERI).size).toBe(OLCU_SOZLERI.length);
    for (const m of OLCU_SOZLERI) {
      const i = (sozler as string[]).indexOf(m);
      expect(i, m).toBeGreaterThan(0);
      expect(existsSync('assets/matematik/ses/ses-' + i + '.mp3'), m).toBe(true);
    }
    expect(SOZ.boySonuc('zurafa')).toBe('Zürafa beş tahta boyunda!');
    expect(SOZ.yolSonuc(4)).toBe('Yol dört yaprak uzunluğunda!');
  });

  it('kapı: çizimlerden biri bile eksikse yeni turlar açılmaz (eski kurdele turu kalır)', () => {
    const sesVar = (i: number) => existsSync('assets/matematik/ses/ses-' + i + '.mp3');
    expect(olcuHazirMi(() => true, sesVar)).toBe(true);
    expect(olcuHazirMi((ad) => ad !== 'su-halkasi', sesVar)).toBe(false);
    expect(olcuHazirMi(() => true, () => false)).toBe(false);
    // Bugün Astra'nın çizimleri henüz yok: uygulamada kapalı.
    const diskte = (ad: string) => existsSync('assets/matematik/olcu/' + ad + '.webp');
    expect(olcuHazirMi(diskte, sesVar)).toBe(OLCU_CIZIMLERI.every(diskte));
  });

  it('yaşa göre: 2–3 yaşta kısa hayvan ve 2–3 yaprak; 5+ yaşta iki dost karşılaştırılır', () => {
    for (const t of [0, 1]) {
      const minik = boyHayvanlari('minik', t);
      expect(minik).toHaveLength(1);
      expect(BOY[minik[0]]).toBeLessThanOrEqual(3);
      expect(yaprakSayisi('minik', t)).toBeLessThanOrEqual(3);
      const bes = boyHayvanlari('bes', t);
      expect(bes).toHaveLength(2);
      expect(BOY[bes[0]]).not.toBe(BOY[bes[1]]);
      expect(yaprakSayisi('bes', t)).toBeLessThanOrEqual(6);
    }
    expect(boyHayvanlari('dort', 0)).not.toEqual(boyHayvanlari('dort', 1));
    expect(olcuTuru(0)).toBe('boy');
    expect(olcuTuru(1)).toBe('yol');
  });

  it('yer tutucular yalnız test kipinde: her biri var olan bir çizim (uygulama yoluna girmez)', () => {
    for (const [ad, y] of Object.entries(YER_TUTUCU)) expect(existsSync('assets/' + y.yol + '.webp'), ad).toBe(true);
  });
});
