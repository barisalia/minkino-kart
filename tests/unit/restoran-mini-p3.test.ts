/** P3 mini oyunlarının saf kuralları: Yıka, Soy, Kızart, Çalkala ve Doldur (RESTORAN.md §8 M2, M3, M11, M12; §3c) */
import { describe, expect, it } from 'vitest';
import { BARDAK, bosBardak, bosIcerik, calkala, dok, fiskir, icecekOzeti, icecekTuru, seviye } from '../../restoran/src/mini/icecek/mantik';
import { avucEkle, cogunluk, HIZ, kizartmaOzeti, pis, pismeAdi, salla, sepetPis, SEPET_EN_COK, TAVAN, tuzDuzeyi, tuzEkle, TUZ, type Parca } from '../../restoran/src/mini/kizart/mantik';
import { fircala, incelt, kaplama, ornekler, SOY, soyOzeti, soymaOrani, yeniSebze, yuzBitti, yuzTamam } from '../../restoran/src/mini/soy/mantik';
import { aciFarki, durula, kopukEkle, lekeOv, lekeUret, rastgele, temizMi, turSil, YIKA, yikamaOzeti } from '../../restoran/src/mini/yika/mantik';

describe('Yıka: çamur lekesi ovunca silinir, köpük musluk altında gider', () => {
  it('3-4: iki büyük leke; 5-6: 2-4 küçük leke, gövdenin içinde ve ayrık', () => {
    const r = rastgele(3);
    for (let i = 0; i < 20; i++) {
      const k = lekeUret('kucuk', r);
      expect(k).toHaveLength(2);
      const b = lekeUret('buyuk', r);
      expect(b.length).toBeGreaterThanOrEqual(2);
      expect(b.length).toBeLessThanOrEqual(4);
      for (const l of [...k, ...b]) expect(Math.hypot(l.u, l.v)).toBeLessThan(0.75);
      expect(b[0].boy).toBeLessThan(k[0].boy);
    }
  });
  it('3-4: iki ovalama turu bir lekeyi siler', () => {
    const l = lekeUret('kucuk', rastgele(9));
    turSil(l, 'kucuk');
    expect(temizMi(l)).toBe(false);
    turSil(l, 'kucuk');
    expect(l.filter((x) => x.kir <= 0.04)).toHaveLength(1);
    turSil(l, 'kucuk');
    turSil(l, 'kucuk');
    expect(temizMi(l)).toBe(true);
  });
  it('5-6: tur tek başına silmez, lekenin yakınından ovmak gerek; uzaktan ovmak işe yaramaz', () => {
    const l = lekeUret('buyuk', rastgele(4));
    expect(turSil(l, 'buyuk')).toBeNull();
    lekeOv(l[0], 1000, 0, 'buyuk');
    expect(l[0].kir).toBe(1);
    lekeOv(l[0], YIKA.buyuk.silme, 1, 'buyuk');
    expect(l[0].kir).toBe(0);
  });
  it('köpük ovdukça artar (en çok 1), durulayınca söner', () => {
    let k = kopukEkle(0, 200);
    expect(k).toBeGreaterThan(0);
    k = kopukEkle(k, 5000);
    expect(k).toBe(1);
    expect(durula(k, 5000)).toBe(0);
  });
  it('açı farkı en kısa yoldan', () => {
    expect(aciFarki(3, -3)).toBeCloseTo(2 * Math.PI - 6, 5);
    expect(Math.abs(aciFarki(0.1, -0.1))).toBeCloseTo(0.2, 5);
  });
  it('ürün: temiz olan ve olmayan ayrı sayılır; yıkamadan geçmek de bir seçim (temiz: false)', () => {
    const r = rastgele(1);
    const temiz = { m: 'domates' as const, lekeler: lekeUret('kucuk', r).map((x) => ({ ...x, kir: 0 })), kopuk: 0, suzgecte: true };
    const kirli = { m: 'domates' as const, lekeler: lekeUret('kucuk', r), kopuk: 0, suzgecte: true };
    expect(yikamaOzeti([temiz]).temiz).toBe(true);
    const o = yikamaOzeti([temiz, kirli]);
    expect(o.temiz).toBe(false);
    expect(o.malzemeler.domates).toEqual({ adet: 2, temiz: false });
  });
});

describe('Soy: şerit şerit soyulur, yüz yüz döner, fazlası kürdan', () => {
  it('3-4: üç çekiş bir yüzü soyar; 5-6 daha ince fırça', () => {
    const o = ornekler(43, 31);
    const s = new Uint8Array(o.length);
    const k = 43 / 31;
    for (const v of [-0.6, 0, 0.6]) fircala(o, s, { U: -k, V: v }, { U: k, V: v }, SOY.kucuk.firca);
    expect(yuzBitti(kaplama(s), 'kucuk')).toBe(true);
    const s2 = new Uint8Array(o.length);
    for (const v of [-0.6, 0, 0.6]) fircala(o, s2, { U: -k, V: v }, { U: k, V: v }, SOY.buyuk.firca);
    expect(yuzBitti(kaplama(s2), 'buyuk')).toBe(false);
  });
  it('iki yüz bitince soyuldu; oran yüzlerden', () => {
    const d = yeniSebze('patates');
    expect(soymaOrani(d, 0.4, 'kucuk')).toBeGreaterThan(0.2);
    expect(yuzTamam(d, 'kucuk')).toBe('don');
    expect(soymaOrani(d, 0, 'kucuk')).toBeCloseTo(0.5, 5);
    expect(yuzTamam(d, 'kucuk')).toBe('soyuldu');
    expect(soymaOrani(d, 0, 'kucuk')).toBe(1);
  });
  it('soyulmuşu soymaya devam: incelir, beşinci çekişte kürdan (bir kez)', () => {
    const d = yeniSebze('havuc');
    const sonuc = [1, 2, 3, 4, 5].map(() => incelt(d));
    expect(sonuc).toEqual([false, false, false, false, true]);
    expect(d.kurdan).toBe(true);
    expect(incelt(d)).toBe(false);
  });
  it('ürün: kürdan Mino\'nun bıyığı oldu, tepsiye gitmez; az soyulan "soyuldu" sayılmaz', () => {
    const o = soyOzeti([
      { m: 'patates', oran: 1, kurdan: false },
      { m: 'patates', oran: 0.4, kurdan: false },
      { m: 'havuc', oran: 1, kurdan: true },
    ]);
    expect(o.malzemeler.patates).toEqual({ adet: 2, soyuldu: false });
    expect(o.malzemeler.havuc).toBeUndefined();
  });
});

describe('Kızart: çiğ → az → altın → çıtır, kömür yok', () => {
  it('altına hızlı, altından sonra yavaş; bir saat de dursa çıtır', () => {
    expect(pismeAdi(pis(0, 2))).toBe('cig');
    expect(pismeAdi(pis(0, 3))).toBe('az');
    expect(pismeAdi(pis(0, 2 / HIZ.once + 1))).toBe('altin');
    // altın penceresi geniş (3-4 tek daldırışta altın görür)
    expect(pismeAdi(pis(0, 2 / HIZ.once + 7))).toBe('altin');
    expect(pismeAdi(pis(0, 30))).toBe('citir');
    expect(pis(0, 3600)).toBe(TAVAN);
    expect(pismeAdi(TAVAN)).toBe('citir');
  });
  it('5-6: üst katman yavaş; sallayınca karışır', () => {
    const sepet: Parca[] = [];
    avucEkle(sepet, 'patates', 'buyuk');
    avucEkle(sepet, 'patates', 'buyuk');
    expect(sepet.some((x) => x.ust)).toBe(true);
    sepetPis(sepet, 5, 'buyuk');
    const alt = sepet.filter((x) => !x.ust).map((x) => x.p);
    const ust = sepet.filter((x) => x.ust).map((x) => x.p);
    expect(Math.min(...alt)).toBeGreaterThan(Math.max(...ust));
    const r = (() => {
      let i = 0;
      return () => (i++ % 2 ? 0.9 : 0.1);
    })();
    const once = sepet.map((x) => x.ust);
    salla(sepet, r);
    expect(sepet.map((x) => x.ust)).not.toEqual(once);
  });
  it('3-4: katman yok, hepsi birlikte altın', () => {
    const sepet: Parca[] = [];
    avucEkle(sepet, 'patates', 'kucuk');
    sepetPis(sepet, 6, 'kucuk');
    expect(sepet.every((x) => pismeAdi(x.p) === 'altin')).toBe(true);
  });
  it('sepet en çok 14', () => {
    const sepet: Parca[] = [];
    for (let i = 0; i < 6; i++) avucEkle(sepet, 'patates', 'kucuk');
    expect(sepet).toHaveLength(SEPET_EN_COK);
  });
  it('tuz düzeyi ve tuz bulutu eşiği; ürün özeti', () => {
    let t = 0;
    for (let i = 0; i < 7; i++) t = tuzEkle(t, 'kucuk');
    expect(t).toBeGreaterThanOrEqual(TUZ.bulut);
    expect(tuzDuzeyi(0)).toBe(0);
    expect(tuzDuzeyi(0.5)).toBe(1);
    expect(tuzDuzeyi(1.5)).toBe(2);
    expect(tuzDuzeyi(4)).toBe(3);
    const kulah: Parca[] = Array.from({ length: 6 }, () => ({ m: 'patates' as const, p: 2.4, ust: false }));
    kulah.push({ m: 'patates', p: 0.2, ust: false });
    expect(cogunluk(kulah)).toBe('altin');
    const o = kizartmaOzeti(kulah, 1.5, 2);
    expect(o).toMatchObject({ pisme: 'altin', tuz: 2, sus: 2, sicak: true, porsiyon: 'normal' });
    expect(o.malzemeler.patates).toEqual({ adet: 7, kesim: 'cubuk' });
  });
});

describe('Çalkala ve Doldur: ayran, limonata, köpük, fışkırma, taşma', () => {
  it('içecek türü sürahiye konandan', () => {
    const s = bosIcerik();
    expect(icecekTuru(s)).toBe('bos');
    s.su = 2;
    expect(icecekTuru(s)).toBe('su');
    s.yogurt = 2;
    expect(icecekTuru(s)).toBe('ayran');
    s.limon = 2;
    expect(icecekTuru(s)).toBe('karisik');
    s.yogurt = 0;
    expect(icecekTuru(s)).toBe('limonata');
  });
  it('çalkalayınca karışır ve köpürür (yoğurtlu çok köpürür); kapaksız fışkırır', () => {
    const s = { ...bosIcerik(), yogurt: 2, su: 2 };
    const d = { karisim: 0, kopuk: 0 };
    for (let i = 0; i < 4; i++) calkala(d, s);
    expect(d.karisim).toBeGreaterThan(0.5);
    expect(d.kopuk).toBeGreaterThan(0.5);
    const l = { ...bosIcerik(), limon: 4, su: 2 };
    const dl = { karisim: 0, kopuk: 0 };
    for (let i = 0; i < 4; i++) calkala(dl, l);
    expect(dl.kopuk).toBeLessThan(d.kopuk);
    const once = seviye(s);
    fiskir(s);
    expect(seviye(s)).toBeCloseTo(once * 0.7, 5);
  });
  it('3-4: bardak çizgide kendiliğinden durur; 5-6 taşar', () => {
    const s = { ...bosIcerik(), yogurt: 3, su: 3 };
    const b = bosBardak();
    let durdu = false;
    for (let i = 0; i < 100 && !durdu; i++) durdu = dok(s, { karisim: 1, kopuk: 0.5 }, b, 0.1, 'kucuk').durdu;
    expect(b.dolum).toBeCloseTo(BARDAK.cizgi, 5);
    expect(b.tasan).toBe(0);
    const s2 = { ...bosIcerik(), yogurt: 5, su: 3 };
    const b2 = bosBardak();
    for (let i = 0; i < 60; i++) dok(s2, { karisim: 1, kopuk: 0.5 }, b2, 0.1, 'buyuk');
    expect(b2.dolum).toBe(1);
    expect(b2.tasan).toBeGreaterThan(0);
    expect(icecekOzeti(b2).porsiyon).toBe('kocaman');
  });
  it('boş sürahi dökmez; ürün özelliği: tuz, ekşi, tatlı, dolum', () => {
    const b = bosBardak();
    expect(dok(bosIcerik(), { karisim: 0, kopuk: 0 }, b, 1, 'buyuk').durdu).toBe(true);
    const s = { ...bosIcerik(), su: 3, limon: 4, seker: 2 };
    for (let i = 0; i < 30; i++) dok(s, { karisim: 0.5, kopuk: 0 }, b, 0.1, 'kucuk');
    const o = icecekOzeti(b);
    expect(o.malzemeler.limon?.adet).toBeGreaterThan(0);
    expect(o.eksi).toBeGreaterThan(0);
    expect(o.tatli).toBeGreaterThan(0);
    expect(o.sicak).toBe(false);
    expect(o.dolum).toBeCloseTo(BARDAK.cizgi, 5);
  });
});
