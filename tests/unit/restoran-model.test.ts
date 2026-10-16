import { describe, expect, it } from 'vitest';
import { normal, tumCumleler, karakterCumleleri } from '../../src/audio/cumleler';
import { kayitCoz, bosKayit } from '../../restoran/src/kayit';
import { MALZEME_ADI, type YemekOzelligi } from '../../restoran/src/mini/arayuz';
import {
  gecerliIpuclari,
  gunPlani,
  ilkGunPlani,
  istekKabul,
  L,
  miniSozleri,
  MUSTERILER,
  musteriSayisi,
  odeme,
  restoranCumleleri,
  restoranKinoCumleleri,
  TARIFLER,
  tepkiHesapla,
  YASAK_DESEN,
  yemekTani,
  type Istek,
} from '../../restoran/src/model';
import { olc, SINIR } from '../../restoran/src/olcek';
import { BOY } from '../../src/karakter/boy';

const oz = (m: Record<string, number>, ek: Partial<YemekOzelligi> = {}): YemekOzelligi => ({
  malzemeler: Object.fromEntries(Object.entries(m).map(([k, n]) => [k, { adet: n }])),
  ...ek,
});
const salata = oz({ domates: 3, salatalik: 3 });
const menemen = oz({ domates: 3, biber: 2, yumurta: 2 }, { pisme: 'altin', sicak: true });

describe('Restoran · yemek tanıma ve istek', () => {
  it('özellikten yemek tanınır', () => {
    expect(yemekTani({ ozellik: salata })).toBe('salata');
    expect(yemekTani({ ozellik: menemen })).toBe('menemen');
    expect(yemekTani({ ozellik: oz({}) })).toBe('bos');
    expect(yemekTani({ yemek: 'menemen', ozellik: salata })).toBe('menemen');
  });

  it('resimli istek yalnız o yemeği kabul eder', () => {
    const i: Istek = { tur: 'resimli', tarif: 'salata' };
    expect(istekKabul(i, 'salata', salata)).toBe(true);
    expect(istekKabul(i, 'menemen', menemen)).toBe(false);
  });

  it('ipuçlu ve sürpriz istekte en az iki farklı yemek kabul edilir (Gün 1 menüsü)', () => {
    for (const ip of gecerliIpuclari(['salata', 'menemen'])) {
      const kabul = [['salata', salata], ['menemen', menemen]].filter(([y, o]) => istekKabul({ tur: 'ipuclu', ipucu: ip }, y as string, o as YemekOzelligi));
      // doyurucu: menemen ya da kocaman porsiyon salata
      const kocaman = istekKabul({ tur: 'ipuclu', ipucu: ip }, 'salata', oz({ domates: 6, salatalik: 6 }));
      expect(kabul.length + (kabul.length < 2 && kocaman ? 1 : 0)).toBeGreaterThanOrEqual(2);
    }
    expect(['salata', 'menemen'].every((y) => istekKabul({ tur: 'surpriz' }, y, y === 'salata' ? salata : menemen))).toBe(true);
    expect(istekKabul({ tur: 'surpriz' }, 'bos', oz({}))).toBe(false);
  });

  it('5-6 özel istek: tam sayı tutmalı', () => {
    const i: Istek = { tur: 'ozel', tarif: 'salata', ozel: { tur: 'adet', deger: { malzeme: 'salatalik', sayi: 3 } } };
    expect(istekKabul(i, 'salata', salata)).toBe(true);
    expect(istekKabul(i, 'salata', oz({ salatalik: 4 }))).toBe(false);
  });
});

describe('Restoran · tepki kademeleri (ceza yok)', () => {
  it('bayıldı / mmm / komik', () => {
    const anne = MUSTERILER.anne;
    expect(tepkiHesapla(anne, { tur: 'resimli', tarif: 'salata' }, { ozellik: oz({ domates: 2, salatalik: 2, limon: 1 }) })).toMatchObject({ tepki: 'bayildi', sevdigi: 'limon' });
    expect(tepkiHesapla(anne, { tur: 'resimli', tarif: 'salata' }, { ozellik: salata }).tepki).toBe('mmm');
    expect(tepkiHesapla(anne, { tur: 'resimli', tarif: 'salata' }, { ozellik: menemen })).toMatchObject({ tepki: 'komik', neden: 'istek' });
    // Lokum soğanda ağlar (istek tutsa da)
    expect(tepkiHesapla(MUSTERILER.lokum, { tur: 'surpriz' }, { ozellik: oz({ domates: 2, sogan: 1 }) })).toMatchObject({ tepki: 'komik', neden: 'sevmez' });
    // Dede soğana bayılır
    expect(tepkiHesapla(MUSTERILER.dede, { tur: 'surpriz' }, { ozellik: oz({ domates: 2, sogan: 1 }) }).tepki).toBe('bayildi');
    // boş tabak: görünmez yemek
    expect(tepkiHesapla(MUSTERILER.baba, { tur: 'surpriz' }, { ozellik: oz({}) })).toMatchObject({ tepki: 'komik', neden: 'bos' });
    // Baba: az porsiyon komik, kocaman bayıldı
    expect(tepkiHesapla(MUSTERILER.baba, { tur: 'ipuclu', ipucu: 'doyurucu' }, { ozellik: oz({ domates: 1 }) }).tepki).toBe('komik');
    expect(tepkiHesapla(MUSTERILER.baba, { tur: 'ipuclu', ipucu: 'doyurucu' }, { ozellik: oz({ domates: 6, salatalik: 6 }) }).tepki).toBe('bayildi');
  });

  it('ödeme sınırları: taban 2 / 3, bahşişle en çok 3 / 4', () => {
    expect(odeme('mmm', 'kucuk')).toEqual({ taban: 2, bahsis: 0 });
    expect(odeme('komik', 'kucuk')).toEqual({ taban: 2, bahsis: 0 });
    expect(odeme('bayildi', 'kucuk')).toEqual({ taban: 2, bahsis: 1 });
    expect(odeme('bayildi', 'buyuk')).toEqual({ taban: 3, bahsis: 1 });
    for (const t of ['bayildi', 'mmm', 'komik'] as const) {
      const a = odeme(t, 'kucuk');
      const b = odeme(t, 'buyuk');
      expect(a.taban + a.bahsis).toBeLessThanOrEqual(3);
      expect(b.taban + b.bahsis).toBeLessThanOrEqual(4);
    }
  });
});

describe('Restoran · günün planı', () => {
  it('aynı gün aynı müşteri iki kez gelmez, aile ≤ 3, Bıdıcık Bıdık ile gelir', () => {
    for (let tohum = 1; tohum < 300; tohum++) {
      for (const yas of ['kucuk', 'buyuk'] as const) {
        for (const gun of [1, 2, 3]) {
          const p = gunPlani({ gun, yas, tohum, menu: ['salata', 'menemen'], masa: gun === 1 ? 2 : 3 });
          const adlar = p.musteriler.map((m) => m.musteri);
          expect(new Set(adlar).size).toBe(adlar.length);
          expect(adlar.filter((a) => MUSTERILER[a].aile).length).toBeLessThanOrEqual(3);
          expect(adlar).not.toContain('bidicik');
          for (const m of p.musteriler) if (m.musteri === 'bidik') expect(m.eslik).toBe('bidicik');
          expect(p.musteriler.length).toBe(musteriSayisi(gun, yas, p.masa));
          // gün 1'de gün 2 müşterileri yok
          if (gun === 1) expect(adlar.every((a) => MUSTERILER[a].gun <= 1)).toBe(true);
          // istekler menüdeki yemeklerden
          for (const m of p.musteriler) if (m.istek.tur === 'resimli') expect(['salata', 'menemen']).toContain(m.istek.tarif);
          // özel istek yalnız 5-6, günde en çok 1
          const ozel = p.musteriler.filter((m) => m.istek.tur === 'ozel').length;
          expect(ozel).toBeLessThanOrEqual(yas === 'buyuk' ? 1 : 0);
        }
      }
    }
  });

  it('Gün 1 müşteri sayısı 4 (3-4) / 5 (5-6); aynı anda masada 3-4 yaşta en çok 2', () => {
    expect(gunPlani({ gun: 1, yas: 'kucuk', tohum: 3, menu: ['salata', 'menemen'], masa: 2 }).musteriler).toHaveLength(4);
    expect(gunPlani({ gun: 1, yas: 'buyuk', tohum: 3, menu: ['salata', 'menemen'], masa: 2 }).musteriler).toHaveLength(5);
    expect(gunPlani({ gun: 3, yas: 'kucuk', tohum: 3, menu: ['salata'], masa: 4 }).ayniAnda).toBe(2);
  });

  it('ilk günün planı: resimli, ipuçlu ve sürpriz istek var', () => {
    const turler = new Set(ilkGunPlani('kucuk').map((m) => m.istek.tur));
    expect([...turler].sort()).toEqual(['ipuclu', 'resimli', 'surpriz']);
  });

  it('dün alınan yeni tarif bugün istenir; son günlerde gelmeyen önce gelir', () => {
    const p = gunPlani({ gun: 3, yas: 'kucuk', tohum: 7, menu: ['salata', 'menemen', 'ayran'], masa: 2, yeniTarif: 'ayran' });
    expect(p.musteriler[0].istek).toEqual({ tur: 'resimli', tarif: 'ayran' });
    const once = gunPlani({ gun: 2, yas: 'kucuk', tohum: 7, menu: ['salata'], masa: 2, once: ['zipzip', 'bulut'] });
    expect(once.musteriler.slice(0, 2).map((m) => m.musteri)).toEqual(['zipzip', 'bulut']);
  });
});

describe('Restoran · sözler', () => {
  const hepsi = [...restoranCumleleri(), ...restoranKinoCumleleri(), ...miniSozleri()];

  it('anlatıcı sözlerinde emir yok ("dokun", "tıkla", "bas", "sürükle", "şimdi şunu")', () => {
    for (const c of hepsi) expect(c, c).not.toMatch(YASAK_DESEN);
    expect('Domatese dokun!').toMatch(YASAK_DESEN);
    expect('Bas!').toMatch(YASAK_DESEN);
    expect('Basamak').not.toMatch(YASAK_DESEN);
  });

  it('sözler kısa ve seslendirme listesinde', () => {
    const tum = new Set(tumCumleler());
    for (const c of restoranCumleleri()) {
      expect(tum.has(normal(c)), c).toBe(true);
      expect(c.replace(/\[[^\]]*\]\s*/g, '').length, c).toBeLessThanOrEqual(34);
    }
    const kino = new Set(karakterCumleleri().kino);
    for (const c of restoranKinoCumleleri()) expect(kino.has(normal(c)), c).toBe(true);
  });

  it('her müşterinin selam ve tepki sözü var (Bıdıcık hariç), her tarifin adı var', () => {
    for (const m of Object.values(MUSTERILER)) {
      if (m.eslikci || m.gun > 2) continue;
      const s = (L.musteri as Record<string, Record<string, string>>)[m.id];
      if (m.gun === 1) for (const k of ['selam', 'bayildi', 'komik', 'gule']) expect(s?.[k], `${m.id}.${k}`).toBeTruthy();
    }
    for (const t of Object.keys(TARIFLER)) expect((L.tarif as Record<string, string>)[t]).toBeTruthy();
  });

  it('malzeme adları Türkçe ve tek', () => {
    expect(new Set(Object.values(MALZEME_ADI)).size).toBe(Object.keys(MALZEME_ADI).length);
  });
});

describe('Restoran · ölçek ve kayıt', () => {
  it('en uzun karakter ekran yüksekliğinin %40ını geçmez (yatay telefonlar)', () => {
    const enUzun = Math.max(...Object.values(MUSTERILER).map((m) => (BOY as Record<string, number>)[m.boy] ?? 0));
    for (const [w, h] of [
      [844, 390],
      [932, 430],
      [667, 375],
    ]) {
      const o = olc(w, h);
      expect(o.yon).toBe('yatay');
      expect((enUzun * o.u) / h).toBeLessThanOrEqual(SINIR.enUzun);
    }
    const d = olc(390, 844);
    expect(d.yon).toBe('dikey');
    expect((enUzun * d.u) / 844).toBeLessThanOrEqual(SINIR.enUzun);
  });

  it('kayıt: bozuk veri sıfırlanır, eksik alanlar dolar, ilk tarifler hep açık', () => {
    expect(kayitCoz(null)).toEqual(bosKayit());
    expect(kayitCoz('saçma')).toEqual(bosKayit());
    const k = kayitCoz({ gun: '3', jeton: -5, acilan: { tarif: ['ayran'] }, pano: { anne: ['limon', 5] }, yas: 'buyuk' });
    expect(k.gun).toBe(3);
    expect(k.jeton).toBe(0);
    expect(k.acilan.tarif).toEqual(expect.arrayContaining(['salata', 'menemen', 'ayran']));
    expect(k.pano.anne).toEqual(['limon']);
    expect(k.yas).toBe('buyuk');
    expect(k.acilan.masa).toHaveLength(2);
  });
});
