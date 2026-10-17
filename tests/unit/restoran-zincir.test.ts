/**
 * Tıkır Tıkır Lokanta · malzeme zinciri (restoran/src/mini/arayuz.ts): Yıka ve Soy'un çıktısı (temiz, soyuldu)
 * Doğra'dan Tava / Kazan / Kızart / Tabakla'ya ve müşterinin zevkine akar. Ceza yok: yıkanmamış sebze komik tepki.
 */
import { describe, expect, it } from 'vitest';
import { durumTopla, hazirlikMi, hazirlikStogu, sebzeHali, urunlerdekiHal, yemekTemizligi, type Urun, type YemekOzelligi } from '../../restoran/src/mini/arayuz';
import { tabakOzelligi } from '../../restoran/src/mini/tabakla/mantik';
import { L, MUSTERILER, restoranCumleleri, tepkiHesapla, type Istek } from '../../restoran/src/model';

const urun = (tur: string, ozellik: YemekOzelligi, ek: Partial<Urun> = {}): Urun => ({ id: `${tur}-${Math.random()}`, tur, ozellik, gorsel: () => null as unknown as HTMLElement, ...ek });
const salataIstegi: Istek = { tur: 'resimli', tarif: 'salata' };

describe('tek sebzenin hâli (sebzeHali)', () => {
  it('lavabo kapalıyken sorulmaz; açıkken yıkanmamış topraklı, yıkanmış temiz', () => {
    expect(sebzeHali('domates', [])).toEqual({});
    expect(sebzeHali('domates', [], true)).toEqual({ temiz: false });
    expect(sebzeHali('domates', [{ temiz: true }], true)).toEqual({ temiz: true });
    expect(sebzeHali('domates', [{ temiz: false }], true)).toEqual({ temiz: false });
    // yıkanamayan malzeme (yumurta) hiç topraklı sayılmaz
    expect(sebzeHali('yumurta', [], true)).toEqual({});
  });
  it('soyulan sebzenin toprağı kabuğuyla gider', () => {
    expect(sebzeHali('patates', [{ soyuldu: true }], true)).toEqual({ temiz: true, soyuldu: true });
    expect(sebzeHali('patates', [{ soyuldu: true }])).toEqual({ soyuldu: true });
    expect(sebzeHali('patates', [{ soyuldu: false }], true)).toEqual({ temiz: false, soyuldu: false });
    // yıkanıp soyulan: iki kaynaktan
    expect(sebzeHali('havuc', [{ temiz: true }, { soyuldu: true }], true)).toEqual({ temiz: true, soyuldu: true });
  });
});

describe('aynı malzemenin kısımları birleşir (durumTopla, yemekTemizligi)', () => {
  it('adet toplanır; bir kısım topraklıysa bütünü topraklı; bilinmeyen alan yazılmaz', () => {
    expect(durumTopla(undefined, { adet: 2, temiz: true })).toEqual({ adet: 2, temiz: true });
    expect(durumTopla({ adet: 2, temiz: true, kesim: 'dilim' }, { adet: 1, temiz: false })).toEqual({ adet: 3, temiz: false, kesim: 'dilim' });
    expect(durumTopla({ adet: 1 }, { adet: 1 })).toEqual({ adet: 2 });
    expect(durumTopla({ adet: 1, soyuldu: true }, { adet: 1, soyuldu: true, temiz: true })).toEqual({ adet: 2, soyuldu: true, temiz: true });
  });
  it('yemeğin temizliği: sorulmadıysa undefined (eski oyunlar ve deneme sayfası değişmez)', () => {
    expect(yemekTemizligi({ malzemeler: { domates: { adet: 2 } } })).toBeUndefined();
    expect(yemekTemizligi({ malzemeler: { domates: { adet: 2, temiz: true }, limon: { adet: 1 } } })).toBe(true);
    expect(yemekTemizligi({ malzemeler: { domates: { adet: 2, temiz: true }, salatalik: { adet: 1, temiz: false } } })).toBe(false);
    expect(yemekTemizligi({ malzemeler: { domates: { adet: 1 } }, temiz: false })).toBe(false);
  });
});

describe('Yıka / Soy → Doğra: tepsideki hazırlık ürünleri sebze sebze kullanılır', () => {
  const suzgec = urun('yikanmis', { malzemeler: { domates: { adet: 2, temiz: true }, salatalik: { adet: 1, temiz: false } }, temiz: false, sicak: false });
  const soyulmus = urun('soyulmus', { malzemeler: { patates: { adet: 1, soyuldu: true } }, sicak: false });
  const dogranmis = urun('dogranmis', { malzemeler: { domates: { adet: 4, kesim: 'dilim', temiz: true } } });

  it('hazırlık ürünü: bütün, pişmemiş, hâli belli; doğranmış ya da servis ürünü değil', () => {
    expect(hazirlikMi(suzgec)).toBe(true);
    expect(hazirlikMi(soyulmus)).toBe(true);
    expect(hazirlikMi(dogranmis)).toBe(false);
    expect(hazirlikMi(urun('ayran', { malzemeler: { yogurt: { adet: 1 } } }, { servis: true }))).toBe(false);
  });

  it('raftan alınan sebze önce tepsidekinden gelir; bitince lavabo açıksa yıkanmamış', () => {
    const s = hazirlikStogu([suzgec, soyulmus, dogranmis], true);
    expect(s.al('domates')).toEqual({ temiz: true });
    expect(s.al('salatalik')).toEqual({ temiz: false });
    expect(s.al('patates')).toEqual({ temiz: true, soyuldu: true });
    expect(s.al('biber')).toEqual({ temiz: false });
    expect(s.kullanilan().sort()).toEqual([suzgec.id, soyulmus.id].sort());
    // süzgeçte bir domates artar: aynı tür, yeni kimlik, yalnız artan malzeme
    const a = s.artanlar();
    expect(a).toHaveLength(1);
    expect(a[0].tur).toBe('yikanmis');
    expect(a[0].id).not.toBe(suzgec.id);
    expect(a[0].ozellik.malzemeler).toEqual({ domates: { adet: 1, temiz: true } });
    expect(a[0].ozellik.temiz).toBe(true);
  });

  it('lavabo kapalıyken (Gün 1) hiçbir şey sorulmaz, tepsi el değmeden kalır', () => {
    const s = hazirlikStogu([dogranmis]);
    expect(s.al('domates')).toEqual({});
    expect(s.kullanilan()).toEqual([]);
    expect(s.artanlar()).toEqual([]);
  });

  it('Kazan / Kızart: kullanılan ürünlerin toplu hâli', () => {
    const k1 = urun('dogranmis', { malzemeler: { havuc: { adet: 3, kesim: 'kup', temiz: true, soyuldu: true } } });
    const k2 = urun('dogranmis', { malzemeler: { havuc: { adet: 2, kesim: 'kup', temiz: false } } });
    expect(urunlerdekiHal([k1], 'havuc')).toEqual({ temiz: true, soyuldu: true });
    expect(urunlerdekiHal([k1, k2], 'havuc')).toEqual({ temiz: false, soyuldu: true });
    expect(urunlerdekiHal([], 'havuc')).toEqual({});
  });
});

describe('Tabakla: tabak zincirin hâlini taşır', () => {
  const bos = { urunPorsiyon: [], yemekParca: 6, sus: {}, bal: 0, yag: 0, yuz: false };
  it('yıkanmış kâse + yıkanmış kâse = temiz tabak; biri topraklıysa tabak topraklı', () => {
    const temiz = tabakOzelligi({ ...bos, urunler: [{ malzemeler: { domates: { adet: 3, kesim: 'dilim', temiz: true } } }, { malzemeler: { domates: { adet: 2, kesim: 'dilim', temiz: true }, salatalik: { adet: 3, kesim: 'dilim', temiz: true } } }] });
    expect(temiz.malzemeler.domates).toEqual({ adet: 5, kesim: 'dilim', temiz: true });
    expect(temiz.temiz).toBe(true);
    const kirli = tabakOzelligi({ ...bos, urunler: [{ malzemeler: { domates: { adet: 3, kesim: 'dilim', temiz: true } } }, { malzemeler: { domates: { adet: 2, kesim: 'dilim', temiz: false } } }] });
    expect(kirli.malzemeler.domates?.temiz).toBe(false);
    expect(kirli.temiz).toBe(false);
    // limon süsü sorulmaz, temizliği bozmaz
    const susle = tabakOzelligi({ ...bos, sus: { limon: 1 }, urunler: [{ malzemeler: { domates: { adet: 3, temiz: true } } }] });
    expect(susle.temiz).toBe(true);
    // eski ürün (temizlik bilgisi yok): alan yazılmaz
    expect('temiz' in tabakOzelligi({ ...bos, urunler: [{ malzemeler: { domates: { adet: 3 } } }] })).toBe(false);
  });
});

describe('müşteri zinciri görür (zevk tablosu, ceza yok)', () => {
  const temizSalata: YemekOzelligi = { malzemeler: { domates: { adet: 3, kesim: 'dilim', temiz: true }, salatalik: { adet: 3, kesim: 'dilim', temiz: true } }, temiz: true };
  const toprakliSalata: YemekOzelligi = { malzemeler: { domates: { adet: 3, kesim: 'dilim', temiz: true }, salatalik: { adet: 3, kesim: 'dilim', temiz: false } }, temiz: false };
  const eskiSalata: YemekOzelligi = { malzemeler: { domates: { adet: 3, kesim: 'dilim' }, salatalik: { adet: 3, kesim: 'dilim' } } };

  it('Babaanne yıkanmış salataya bayılır (keşif: temiz)', () => {
    expect(MUSTERILER.babaanne.sever).toContainEqual({ k: 'temiz' });
    expect(tepkiHesapla(MUSTERILER.babaanne, salataIstegi, { yemek: 'salata', ozellik: temizSalata })).toEqual({ tepki: 'bayildi', sevdigi: 'temiz' });
    expect(tepkiHesapla(MUSTERILER.babaanne, salataIstegi, { yemek: 'salata', ozellik: eskiSalata })).toEqual({ tepki: 'mmm' });
  });
  it('yıkanmamış sebze komik tepki ("toprak tadı"); sevmediği varsa ya da istek tutmadıysa o', () => {
    for (const m of [MUSTERILER.babaanne, MUSTERILER.anne, MUSTERILER.tombi]) expect(tepkiHesapla(m, salataIstegi, { yemek: 'salata', ozellik: toprakliSalata })).toEqual({ tepki: 'komik', neden: 'toprak' });
    expect(tepkiHesapla(MUSTERILER.anne, { tur: 'resimli', tarif: 'menemen' }, { yemek: 'salata', ozellik: toprakliSalata })).toEqual({ tepki: 'komik', neden: 'istek' });
    expect(tepkiHesapla(MUSTERILER.zipzip, salataIstegi, { yemek: 'salata', ozellik: { ...toprakliSalata, malzemeler: { ...toprakliSalata.malzemeler, sogan: { adet: 2 } } } })).toEqual({ tepki: 'komik', neden: 'sevmez' });
  });
  it('temizlik sorulmayan (Gün 1, eski ürün) tepkiler değişmez', () => {
    expect(tepkiHesapla(MUSTERILER.anne, salataIstegi, { yemek: 'salata', ozellik: eskiSalata })).toEqual({ tepki: 'mmm' });
    expect(tepkiHesapla(MUSTERILER.anne, salataIstegi, { yemek: 'salata', ozellik: temizSalata })).toEqual({ tepki: 'mmm' });
  });
  it('"Hmm, biraz toprak tadı var!" seslendirme listesinde, emir sözü yok', () => {
    expect(L.musteri_tepki.toprak).toContain('Hmm, biraz toprak tadı var!');
    expect(restoranCumleleri()).toContain(L.musteri_tepki.toprak);
  });
});
