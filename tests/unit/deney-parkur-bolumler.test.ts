import { describe, expect, it } from 'vitest';
import { BOLUM_SAYISI, bolum, yerindekiler } from '../../deney/src/parkur/bolumler';
import { oynatBolum, type Motor } from '../../deney/src/parkur/motor';
import type { Yay } from '../../deney/src/parkur/mekanizmalar';

// Deneyler · Zincirleme Top Parkuru, bölümler (yönetici 23 Kasım gecesi: "uzat, her bölüm yeni bir parçayla"). Her bölüm bütün
// parçalarıyla sonuna kadar gider; her yerleşir parça gerçekten gereklidir (yokken top kaçar: komik sonuç, ceza yok).
const hepsi = (no: number) => bolum(no).mekanizmalar.map((m) => m.id);
const anahtar = (r: ReturnType<typeof oynatBolum>) => r.olaylar.filter((o) => o.tur !== 'sek' && o.tur !== 'sallan').map((o) => o.tur + ('i' in o ? o.i : ''));
const ANAHTAR: Record<number, string[]> = {
  1: ['klank', 'boing', 'huni-gir', 'huni-cik', 'domino0', 'domino1', 'domino2', 'domino3', 'zil'],
  2: ['klank', 'kaykay-bin', 'kaykay-dur', 'ucus', 'domino0', 'domino1', 'domino2', 'zil'],
  3: ['klank', 'yay-bas', 'yay-firlat', 'pota', 'domino0', 'domino1', 'domino2', 'zil'],
  4: ['klank', 'musluk', 'kova-al', 'su', 'kova-birak', 'domino0', 'domino1', 'domino2', 'zil'],
  5: ['klank', 'koruk', 'balon-sisir', 'balon-it', 'domino0', 'domino1', 'domino2', 'domino3', 'zil'],
  6: ['klank', 'boing', 'huni-gir', 'huni-cik', 'kaykay-bin', 'kaykay-dur', 'ucus', 'pota', 'koruk', 'balon-sisir', 'balon-it', 'domino0', 'domino1', 'domino2', 'domino3', 'can'],
};

describe('Top parkuru · bölümler', () => {
  it('altı bölüm: beşi tek ekran, mega zincir iki ekran ve çan kulesiyle biter', () => {
    expect(BOLUM_SAYISI).toBe(6);
    for (let no = 1; no <= 5; no++) expect(bolum(no).dunya.w).toBe(1672);
    expect(bolum(6).dunya.w).toBe(3344);
    expect(bolum(6).final.tur).toBe('can');
  });
  for (let no = 1; no <= 6; no++) {
    it(`${no}. bölüm bütün parçalarıyla sonuna kadar gider; olaylar sırayla; tempo`, () => {
      const r = oynatBolum(bolum(no), hepsi(no));
      expect(r.sonuc).toBe('basari');
      expect(anahtar(r)).toEqual(ANAHTAR[no]);
      const son = r.olaylar.find((o) => o.tur === 'zil' || o.tur === 'can')!.t;
      expect(son).toBeLessThan(no === 6 ? 12 : 6);
    });
    it(`${no}. bölümde her çekmece parçası gereklidir; yaşların eksik hâli kaçar`, () => {
      const b = bolum(no);
      for (const e of b.eksik.bes) {
        const r = oynatBolum(bolum(no), hepsi(no).filter((id) => id !== e));
        expect(r.sonuc, no + ': ' + e + ' yokken').toBe('kacti');
        expect(r.dominolar.every((d) => d.durum === 'dik'), no + ': ' + e).toBe(true);
      }
      for (const yas of ['minik', 'dort', 'bes'] as const) {
        expect(oynatBolum(bolum(no), yerindekiler(b, yas)).sonuc, no + ' ' + yas).toBe('kacti');
        // Çekmecedekiler konunca tamamlanır.
        expect(oynatBolum(bolum(no), [...yerindekiler(b, yas), ...b.eksik[yas]]).sonuc, no + ' ' + yas + ' tam').toBe('basari');
      }
    });
  }
  it('3. bölüm: yay az gerilince top potaya yetişmez (üç kez geri düşer, kapta kalır); orta ve çok gerince olur', () => {
    const gucle = (g: 1 | 2 | 3) => (m: Motor) => { m.mekanizma<Yay>('yay')!.guc = g; };
    const az = oynatBolum(bolum(3), hepsi(3), 20, gucle(1));
    expect(az.sonuc).toBe('kacti');
    expect(az.olaylar.filter((o) => o.tur === 'yay-firlat')).toHaveLength(3);
    expect(az.olaylar.some((o) => o.tur === 'pota')).toBe(false);
    expect(oynatBolum(bolum(3), hepsi(3), 20, gucle(2)).sonuc).toBe('basari');
    expect(oynatBolum(bolum(3), hepsi(3), 20, gucle(3)).sonuc).toBe('basari');
    expect(bolum(3).yayGucu).toEqual({ minik: 2, dort: 2, bes: 1 });
  });
  it('2. bölüm: takoz yokken kaykay masanın ucundan topla düşer; 4. bölüm: oluk yokken su masaya taşar, çark dönmez', () => {
    const k = oynatBolum(bolum(2), hepsi(2).filter((id) => id !== 'takoz'));
    expect(k.olaylar.some((o) => o.tur === 'kaykay-dus')).toBe(true);
    const s = oynatBolum(bolum(4), hepsi(4).filter((id) => id !== 'oluk'));
    expect(s.olaylar.some((o) => o.tur === 'su-tasti')).toBe(true);
    expect(s.olaylar.some((o) => o.tur === 'kova-birak')).toBe(false);
  });
  it('5. bölüm: hortum ya da balon yokken hava kaçar', () => {
    for (const e of ['hortum', 'balon']) {
      const r = oynatBolum(bolum(5), hepsi(5).filter((id) => id !== e));
      expect(r.olaylar.some((o) => o.tur === 'hava-kacti')).toBe(true);
    }
  });
});
