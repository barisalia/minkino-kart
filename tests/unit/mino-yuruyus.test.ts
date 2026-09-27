import { describe, expect, it } from 'vitest';
import profil from '../../ekip/mino/mino-profil.json';
import { BACAK_ACI, bacakEvresi, DONME, MINO_ADIM_YOLU, MINO_DONGU_YOLU, OLCU, patiDunya, yuruyusPozu } from '../../src/mino/yuruyus';

const ADIM = 400;
const fazlar = Array.from({ length: ADIM }, (_, i) => i / ADIM);

describe('Mino yandan yürüyüş döngüsü', () => {
  it('dönme noktaları tasarımcının iskeletiyle aynı', () => {
    for (const ad of ['bacak-on', 'bacak-arka', 'govde'] as const) expect(profil.donme[ad]).toEqual([...DONME[ad]]);
  });

  it('açılar temiz sınırlar içinde: bacak ±25, kol ±25 (en az ±18 sallanır), kuyruk ±6, kulak ±10’un altında (en az ±7 sallanır)', () => {
    let kol = 0;
    let kulak = 0;
    for (const f of fazlar) {
      for (const t of [0, 0.4, 1.3, 2.7]) {
        const z = yuruyusPozu(f, 1, t);
        expect(Math.abs(z.bacakOn)).toBeLessThanOrEqual(25);
        expect(Math.abs(z.bacakArka)).toBeLessThanOrEqual(25);
        expect(Math.abs(z.kolOn)).toBeLessThanOrEqual(25);
        expect(Math.abs(z.kolArka)).toBeLessThanOrEqual(25);
        expect(Math.abs(z.kuyruk)).toBeLessThanOrEqual(6);
        expect(Math.abs(z.kulak)).toBeLessThan(OLCU.KULAK);
        kol = Math.max(kol, Math.abs(z.kolOn), Math.abs(z.kolArka));
        kulak = Math.max(kulak, Math.abs(z.kulak));
      }
    }
    expect(OLCU.KULAK).toBe(10);
    expect(kol).toBeGreaterThanOrEqual(18);
    expect(kulak).toBeGreaterThanOrEqual(7);
  });

  it('bacaklar karşılıklı döner, kollar ters: yakın bacak öndeyken yakın kol geride', () => {
    const z = yuruyusPozu(0, 1, 0);
    expect(z.bacakOn).toBeLessThan(-20); // öne
    expect(z.bacakArka).toBeGreaterThan(20); // geriye
    expect(z.kolOn).toBeGreaterThan(15); // geriye
    expect(z.kolArka).toBeLessThan(-15); // öne
  });

  it('her karede bir pati tam yerinde, hiçbir pati yere gömülmüyor (dururken de)', () => {
    for (const guc of [1, 0.5, 0]) {
      for (const f of fazlar) {
        const z = yuruyusPozu(f, guc, 0.7);
        const on = patiDunya('bacak-on', z).yer;
        const arka = patiDunya('bacak-arka', z).yer;
        expect(Math.min(on, arka)).toBeCloseTo(0, 3);
        expect(on).toBeGreaterThan(-1e-3);
        expect(arka).toBeGreaterThan(-1e-3);
      }
    }
  });

  it('dururken çizim tasarımcının dinlenme duruşunda (bacaklar dönmez, kaymaz)', () => {
    const z = yuruyusPozu(0.3, 0, 0);
    for (const k of ['bacakOn', 'bacakArka', 'bacakOnY', 'bacakArkaY', 'bob'] as const) expect(z[k]).toBeCloseTo(0, 6);
  });

  it('basan pati yerde, havadaki kalkık (geçişte belirgin)', () => {
    // yakın bacak 0..0.5 basar, 0.5..1 havada
    for (const f of fazlar) {
      const z = yuruyusPozu(f, 1, 0);
      if (f < 0.5) expect(patiDunya('bacak-on', z).yer).toBeCloseTo(0, 3);
      else expect(patiDunya('bacak-arka', z).yer).toBeCloseTo(0, 3);
    }
    expect(patiDunya('bacak-on', yuruyusPozu(0.75, 1, 0)).yer).toBeGreaterThan(15);
    expect(patiDunya('bacak-arka', yuruyusPozu(0.25, 1, 0)).yer).toBeGreaterThan(15);
  });

  it('basan pati kaymıyor: gövde döngü yolunu sabit hızla alırken patinin taban noktası yerinde kalır', () => {
    for (const [ad, bas] of [['bacak-on', 0], ['bacak-arka', 0.5]] as const) {
      const xs: number[] = [];
      for (let i = 0; i <= 50; i++) {
        const f = bas + (i / 50) * 0.5;
        xs.push(patiDunya(ad, yuruyusPozu(f, 1, 0)).tabanX + (f - bas) * MINO_DONGU_YOLU);
      }
      expect(Math.max(...xs) - Math.min(...xs)).toBeLessThan(0.05 * MINO_DONGU_YOLU);
    }
  });

  it('iki adım eşit genişlikte: bacaklar öne ve geriye eşit açılır, iki bacak da aynı adım yolunu alır', () => {
    // basan patinin taban noktasının kalçaya göre gidişi (gövdenin bir adımda aldığı yol)
    const yol = (ad: 'bacak-on' | 'bacak-arka', bas: number) =>
      patiDunya(ad, yuruyusPozu(bas, 1, 0)).tabanX - patiDunya(ad, yuruyusPozu(bas + 0.4999, 1, 0)).tabanX;
    const y1 = yol('bacak-on', 0);
    const y2 = yol('bacak-arka', 0.5);
    expect(y1).toBeGreaterThan(0.9 * MINO_ADIM_YOLU);
    expect(Math.abs(y1 - y2)).toBeLessThan(0.02 * MINO_ADIM_YOLU);
    // iki temas anında bacaklar arasındaki açı aynı; her bacak öne ve geriye eşit döner
    const t1 = yuruyusPozu(0, 1, 0);
    const t2 = yuruyusPozu(0.5, 1, 0);
    expect(t1.bacakArka - t1.bacakOn).toBeCloseTo(t2.bacakOn - t2.bacakArka, 6);
    expect(t1.bacakOn).toBeCloseTo(-t2.bacakOn, 6);
    expect(t1.bacakArka).toBeCloseTo(-t2.bacakArka, 6);
    // açılar ±25 sınırını iyi kullanır
    expect(Math.max(BACAK_ACI['bacak-on'], BACAK_ACI['bacak-arka'])).toBeGreaterThanOrEqual(23);
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
