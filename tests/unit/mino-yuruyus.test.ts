import { describe, expect, it } from 'vitest';
import profil from '../../ekip/mino/mino-profil.json';
import { bacakEvresi, DONME, MINO_DONGU_YOLU, patiDunya, yuruyusPozu, ZEMIN } from '../../src/mino/yuruyus';

const ADIM = 400;
const fazlar = Array.from({ length: ADIM }, (_, i) => i / ADIM);

describe('Mino yandan yürüyüş döngüsü', () => {
  it('dönme noktaları tasarımcının iskeletiyle aynı', () => {
    for (const ad of ['bacak-on', 'bacak-arka', 'govde'] as const) expect(profil.donme[ad]).toEqual([...DONME[ad]]);
  });

  it('açılar temiz sınırlar içinde: bacak ±25, kol ±25 (en az ±18 sallanır), kuyruk ±6, kulak ±6', () => {
    let kol = 0;
    for (const f of fazlar) {
      for (const t of [0, 0.4, 1.3, 2.7]) {
        const z = yuruyusPozu(f, 1, t);
        expect(Math.abs(z.bacakOn)).toBeLessThanOrEqual(25);
        expect(Math.abs(z.bacakArka)).toBeLessThanOrEqual(25);
        expect(Math.abs(z.kolOn)).toBeLessThanOrEqual(25);
        expect(Math.abs(z.kolArka)).toBeLessThanOrEqual(25);
        expect(Math.abs(z.kuyruk)).toBeLessThanOrEqual(6);
        expect(Math.abs(z.kulak)).toBeLessThanOrEqual(6);
        kol = Math.max(kol, Math.abs(z.kolOn), Math.abs(z.kolArka));
      }
    }
    expect(kol).toBeGreaterThanOrEqual(18);
  });

  it('bacaklar karşılıklı döner, kollar ters: yakın bacak öndeyken yakın kol geride', () => {
    const z = yuruyusPozu(0, 1, 0);
    expect(z.bacakOn).toBeLessThan(-20); // öne
    expect(z.bacakArka).toBeGreaterThan(20); // geriye
    expect(z.kolOn).toBeGreaterThan(15); // geriye
    expect(z.kolArka).toBeLessThan(-15); // öne
  });

  it('her karede bir pati tam yerde, hiçbir pati yere gömülmüyor (dururken de)', () => {
    for (const guc of [1, 0.5, 0]) {
      for (const f of fazlar) {
        const z = yuruyusPozu(f, guc, 0.7);
        const on = patiDunya('bacak-on', z).enAlt;
        const arka = patiDunya('bacak-arka', z).enAlt;
        expect(Math.max(on, arka)).toBeCloseTo(ZEMIN, 3);
      }
    }
  });

  it('basan pati yerde, havadaki kalkık (geçişte belirgin)', () => {
    // yakın bacak 0..0.5 basar, 0.5..1 havada
    for (const f of fazlar) {
      const z = yuruyusPozu(f, 1, 0);
      if (f < 0.5) expect(patiDunya('bacak-on', z).enAlt).toBeCloseTo(ZEMIN, 3);
      else expect(patiDunya('bacak-arka', z).enAlt).toBeCloseTo(ZEMIN, 3);
    }
    const gecis = yuruyusPozu(0.75, 1, 0);
    expect(ZEMIN - patiDunya('bacak-on', gecis).enAlt).toBeGreaterThan(15);
  });

  it('basan pati kaymıyor: gövde döngü yolunu sabit hızla alırken patinin taban ucu yerinde kalır', () => {
    for (const [ad, bas] of [['bacak-on', 0], ['bacak-arka', 0.5]] as const) {
      const xs: number[] = [];
      for (let i = 0; i <= 50; i++) {
        const f = bas + (i / 50) * 0.5;
        xs.push(patiDunya(ad, yuruyusPozu(f, 1, 0)).tabanX + (f - bas) * MINO_DONGU_YOLU);
      }
      expect(Math.max(...xs) - Math.min(...xs)).toBeLessThan(0.1 * MINO_DONGU_YOLU);
    }
  });

  it('iki adım aynı: gövdenin iniş-kalkışı aksamıyor; evreler temas → çöküş (en alçak) → geçiş → yükseliş (en yüksek)', () => {
    const bob = (f: number) => yuruyusPozu(f, 1, 0).bob;
    for (const f of fazlar.slice(0, ADIM / 2)) expect(bob(f)).toBeCloseTo(bob(f + 0.5), 6);
    // bir adım (faz 0..0.5) içinde en alçak an çöküş, en yüksek an yükseliş
    const adim = fazlar.slice(0, ADIM / 2);
    const enAlcak = adim.reduce((a, f) => (bob(f) > bob(a) ? f : a), 0);
    const enYuksek = adim.reduce((a, f) => (bob(f) < bob(a) ? f : a), 0);
    expect(enAlcak).toBeGreaterThan(0.02);
    expect(enAlcak).toBeLessThan(0.15);
    expect(enYuksek).toBeGreaterThan(0.25);
    expect(enYuksek).toBeLessThan(0.45);
  });

  it('havadaki bacak ease’li döner (yerine yavaşlayarak oturur)', () => {
    const h = (q: number) => bacakEvresi(q).aci;
    const son = Math.abs(h(0.999) - h(0.99));
    const orta = Math.abs(h(0.755) - h(0.745));
    expect(son).toBeLessThan(orta * 0.3);
  });
});
