import { describe, expect, it } from 'vitest';
import { oynat, ZIL_ACISI } from '../../deney/src/parkur/fizik';
import { DOMINO, PARCA, ZEMIN_Y } from '../../deney/src/parkur/geometri';

// Deneyler · Zincirleme Top Parkuru (Paket Deney-Y1): fizik çizimlerin ölçüleriyle çalışıyor mu?
describe('Top parkuru · bütün parçalar yerinde', () => {
  const r = oynat(['rampa', 'huni', 'trambolin']);
  const sira = r.olaylar.map((o) => o.tur + ('i' in o ? o.i : ''));
  it('zincir sonuna kadar gider: kol, trambolin, huni, dört domino, zil', () => {
    expect(r.sonuc).toBe('basari');
    const anahtar = sira.filter((s) => ['klank', 'huni-gir', 'huni-cik', 'boing', 'domino0', 'domino1', 'domino2', 'domino3', 'zil'].includes(s));
    expect(anahtar).toEqual(['klank', 'boing', 'huni-gir', 'huni-cik', 'domino0', 'domino1', 'domino2', 'domino3', 'zil']);
  });
  it('tempo: koldan zile 4–8 sn, dominolar arası 0,1–0,5 sn (boş bekleme yok)', () => {
    const t = (tur: string) => r.olaylar.find((o) => o.tur + ('i' in o ? o.i : '') === tur)!.t;
    expect(t('zil')).toBeGreaterThan(3);
    expect(t('zil')).toBeLessThan(8);
    for (let i = 1; i < 4; i++) {
      const ara = t('domino' + i) - t('domino' + (i - 1));
      expect(ara).toBeGreaterThan(0.05);
      expect(ara).toBeLessThan(0.5);
    }
  });
  it('son domino zile yaslanır, öbürleri birbirine', () => {
    expect(r.dominolar[3].aci).toBeCloseTo(ZIL_ACISI, 2);
    for (const d of r.dominolar) expect(d.durum).toBe('yasli');
  });
});

describe('Top parkuru · eksik parça komik sonuç verir, ceza yok', () => {
  it('köprü rampa yokken (2–3 yaş başı) top başlangıç rampasından düşer, trambolinin yanına çarpıp geri seker; altına girmez', () => {
    const r = oynat(['huni', 'trambolin']);
    expect(r.sonuc).toBe('kacti');
    expect(r.olaylar.some((o) => o.tur === 'sek')).toBe(true);
    expect(r.olaylar.some((o) => o.tur === 'boing')).toBe(false);
    expect(r.top.x).toBeLessThan(PARCA.trambolin.yanlar[0][0].x - 33);
    expect(r.top.y).toBeCloseTo(ZEMIN_Y - 33, 0);
  });
  it('trambolin yokken (4 yaş) top masaya düşer, huninin ayağına çarpıp durur; zil çalmaz', () => {
    const r = oynat(['rampa', 'huni']);
    expect(r.sonuc).toBe('kacti');
    expect(r.olaylar.some((o) => o.tur === 'huni-gir')).toBe(false);
    expect(r.top.x).toBeLessThan(PARCA.huni.ayak[0].x - 32);
    expect(r.olaylar.some((o) => o.tur === 'zil')).toBe(false);
  });
  it('huni yokken (5+) trambolin topu fırlatır ama top masaya düşer, ilk dominoyu yalnız sallar', () => {
    const r = oynat(['rampa', 'trambolin']);
    expect(r.sonuc).toBe('kacti');
    expect(r.olaylar.some((o) => o.tur === 'boing')).toBe(true);
    expect(r.olaylar.some((o) => o.tur === 'zil')).toBe(false);
    expect(r.dominolar.every((d) => d.durum === 'dik')).toBe(true);
  });
  it('hiçbir parça yokken de top kaçar ve durur', () => {
    const r = oynat([]);
    expect(r.sonuc).toBe('kacti');
    expect(r.dominolar.every((d) => d.durum === 'dik')).toBe(true);
    expect(DOMINO.ortalar.length).toBe(4);
  });
});
