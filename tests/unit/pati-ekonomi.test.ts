import { describe, expect, it } from 'vitest';
import P from '../../content/pati.json';
import { baslangicJetonu, bosYer, doluYuvalar, esyaAl, etiketYuvalari, fiyat, jetonParcalari, kazanc, koseAc, koseGorunur, odemeDizisi, satinAl, vitrin, yerVar } from '../../pati/src/ekonomi';
import { adSecenekleri, HAYVAN_IDLERI, hayvanBilgi, KALP_SAYISI } from '../../pati/src/katalog';
import { bosKayit, kayitCoz } from '../../pati/src/kayit';
import { dansBitti, DINLENME_MS, kalpEkle } from '../../pati/src/mutluluk';

const top = (v: unknown): string[] => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(top) : v && typeof v === 'object' ? Object.values(v).flatMap(top) : []);

describe('Pati v2 ekonomi', () => {
  it('başlangıç jetonu ve başlangıç vitrini fiyatları (PATI-V2 §5b)', () => {
    expect(baslangicJetonu('kucuk')).toBe(4);
    expect(baslangicJetonu('buyuk')).toBe(8);
    expect([fiyat('tarcin', 'kucuk'), fiyat('findik', 'kucuk'), fiyat('pofuduk', 'kucuk')]).toEqual([3, 4, 3]);
    expect([fiyat('tarcin', 'buyuk'), fiyat('findik', 'buyuk'), fiyat('pofuduk', 'buyuk')]).toEqual([6, 7, 5]);
    // ilk alımdan sonra 3-4'te 0-1, 5-6'da 1-3 jeton kalır
    for (const id of ['tarcin', 'findik', 'pofuduk']) {
      expect(baslangicJetonu('kucuk') - fiyat(id, 'kucuk')).toBeGreaterThanOrEqual(0);
      expect(baslangicJetonu('kucuk') - fiyat(id, 'kucuk')).toBeLessThanOrEqual(1);
      expect(baslangicJetonu('buyuk') - fiyat(id, 'buyuk')).toBeGreaterThanOrEqual(1);
      expect(baslangicJetonu('buyuk') - fiyat(id, 'buyuk')).toBeLessThanOrEqual(3);
    }
    // 3-4'te en büyük hayvan fiyatı 8 jeton (sayılabilir)
    expect(Math.max(...HAYVAN_IDLERI.map((id) => fiyat(id, 'kucuk')))).toBeLessThanOrEqual(8);
  });

  it('kazanç tablosu (§5c)', () => {
    expect([kazanc('dans', 'kucuk'), kazanc('dans', 'buyuk')]).toEqual([2, 3]);
    expect([kazanc('sever', 'kucuk'), kazanc('sever', 'buyuk')]).toEqual([1, 2]);
    expect([kazanc('ziyaret_uyan', 'kucuk'), kazanc('ziyaret_uymayan', 'buyuk')]).toEqual([3, 2]);
  });

  it('jeton görünüşü: 3-4 hep tek, 5-6 beşlik büyük jeton', () => {
    expect(jetonParcalari(7, 'kucuk')).toEqual([1, 1, 1, 1, 1, 1, 1]);
    expect(jetonParcalari(7, 'buyuk')).toEqual([5, 1, 1]);
    expect(jetonParcalari(12, 'buyuk')).toEqual([5, 5, 1, 1]);
    expect(jetonParcalari(0, 'buyuk')).toEqual([]);
  });

  it('ödeme dizisi: "Bir! İki! Üç!", 5-6 "Beş! Altı! Yedi!"', () => {
    expect(odemeDizisi(3, 4, 'kucuk')).toEqual({ ucan: [1, 1, 1], soz: ['Bir!', 'İki!', 'Üç!'], odenen: 3, eksik: 0 });
    expect(odemeDizisi(7, 8, 'buyuk')).toEqual({ ucan: [5, 1, 1], soz: ['Beş!', 'Altı!', 'Yedi!'], odenen: 7, eksik: 0 });
    // yetmeyince eldeki hepsi uçar, eksik kalır
    const az = odemeDizisi(4, 1, 'kucuk');
    expect(az.ucan).toEqual([1]);
    expect(az.eksik).toBe(3);
    const az2 = odemeDizisi(7, 6, 'buyuk');
    expect(az2.ucan).toEqual([5, 1]);
    expect(az2.eksik).toBe(1);
    // kumbarada 4 varken büyük jeton yok: tek tek
    expect(odemeDizisi(7, 4, 'buyuk').ucan).toEqual([1, 1, 1, 1]);
    // hiç sözü atlanmaz, en çok 2 sn: 3-4'te en çok 8 jeton
    expect(odemeDizisi(8, 9, 'kucuk').soz).toHaveLength(8);
  });

  it('etiket yuvaları ödemeyle dolar, eksikler boş kalır', () => {
    expect(etiketYuvalari(4, 'kucuk')).toEqual([1, 1, 1, 1]);
    expect(doluYuvalar([1, 1, 1, 1], 1)).toEqual([true, false, false, false]);
    expect(doluYuvalar([5, 1, 1], 6)).toEqual([true, true, false]);
    expect(doluYuvalar([5, 1, 1], 4)).toEqual([false, false, false]);
  });

  it('vitrin: baştan 3 yavru sabit bölmede, ilk alımdan sonra renkler (çizimi varsa)', () => {
    const k = bosKayit();
    expect(vitrin(k)).toEqual(['tarcin', 'findik', 'pofuduk', null, null, null]);
    k.jeton = 4;
    expect(satinAl(k, 'tarcin', 'kucuk').durum).toBe('tamam');
    expect(k.jeton).toBe(1);
    const v = vitrin(k);
    expect(v.filter(Boolean)).toHaveLength(6);
    expect(v).toContain('pamuk');
    expect(v).not.toContain('tarcin');
    // çizimi gelmemiş renk yavrusu vitrine çıkmaz
    const yalniz = vitrin(k, (id) => !hayvanBilgi(id).temel);
    expect(yalniz).toEqual([null, 'findik', 'pofuduk', null, null, null]);
    // köşesi kapalı hayvan (hamster) gelmez
    expect(v).not.toContain('fistik');
  });

  it('satın alma: jeton yetmezse hiçbir şey değişmez; salon 3 yer', () => {
    const k = bosKayit();
    k.jeton = 2;
    expect(satinAl(k, 'findik', 'kucuk')).toEqual({ durum: 'jeton', eksik: 2 });
    expect(k.jeton).toBe(2);
    expect(k.hayvanlar).toHaveLength(0);
    k.jeton = 100;
    for (const id of ['tarcin', 'findik', 'pofuduk']) expect(satinAl(k, id, 'kucuk').durum).toBe('tamam');
    expect(k.hayvanlar.map((h) => h.yer)).toEqual([0, 1, 2]);
    expect(yerVar(k, 'pamuk')).toBe(false);
    const once = k.jeton;
    expect(satinAl(k, 'pamuk', 'kucuk').durum).toBe('yer');
    expect(k.jeton).toBe(once);
    expect(bosYer(k, 'salon')).toBe(-1);
    // aynı hayvan iki kez alınmaz
    expect(satinAl(k, 'tarcin', 'kucuk').durum).toBe('yok');
  });

  it('köşe ve eşya kancaları (paket 3)', () => {
    const k = bosKayit();
    k.jeton = 4;
    expect(koseAc(k, 'kemirgen', 'kucuk')).toBe(true);
    expect(k.jeton).toBe(0);
    expect(vitrin(k)).toContain('fistik');
    expect(koseGorunur(k, 'bahce')).toBe(false);
    k.ziyaretler.dede = 1;
    expect(koseGorunur(k, 'bahce')).toBe(true);
    k.jeton = 2;
    expect(esyaAl(k, 'kemik-biskuvi', 'kucuk')).toBe(true);
    expect(esyaAl(k, 'kemik-biskuvi', 'kucuk')).toBe(false);
    expect(esyaAl(k, 'top', 'kucuk')).toBe(false);
  });

  it('mutluluk: 3 kalp → dans → jeton, kalp hiç düşmez, dans sonrası dinlenme', () => {
    const k = bosKayit();
    k.jeton = 4;
    const r = satinAl(k, 'tarcin', 'kucuk');
    if (r.durum !== 'tamam') throw new Error();
    const h = r.hayvan;
    expect(KALP_SAYISI).toBe(3);
    expect(kalpEkle(h, 1000)).toEqual({ eklendi: true, dans: false });
    expect(kalpEkle(h, 1000)).toEqual({ eklendi: true, dans: false });
    expect(kalpEkle(h, 1000)).toEqual({ eklendi: true, dans: true });
    expect(kalpEkle(h, 1000).eklendi).toBe(false);
    expect(dansBitti(h, 5000, 'kucuk')).toBe(2);
    expect(h.kalp).toBe(0);
    expect(kalpEkle(h, 5000 + DINLENME_MS - 1).eklendi).toBe(false);
    expect(kalpEkle(h, 5000 + DINLENME_MS).eklendi).toBe(true);
  });

  it('ad seçenekleri: kendi adı + 8 ortak ad', () => {
    expect(adSecenekleri('findik')).toHaveLength(9);
    expect(adSecenekleri('findik')[0]).toBe('Fındık');
  });

  it('kayıt: v1 kaydından yalnız yaş taşınır, bozuk alanlar temizlenir', () => {
    const k = kayitCoz(null, '{"yas":"buyuk"}');
    expect(k.yas).toBe('buyuk');
    expect(k.jeton).toBe(0);
    expect(k.koseler).toEqual(['salon']);
    const b = kayitCoz('{"jeton":"x","hayvanlar":[{"id":"tarcin","ad":"Bal","yer":0,"minder":"mavi","kalp":2},{"bozuk":1}],"koseler":["akvaryum"]}');
    expect(b.jeton).toBe(0);
    expect(b.hayvanlar).toHaveLength(1);
    expect(b.hayvanlar[0]).toMatchObject({ id: 'tarcin', ad: 'Bal', minder: 'mavi', kalp: 2, kose: 'salon' });
    expect(b.koseler).toEqual(['salon', 'akvaryum']);
    expect(kayitCoz('{bozuk').yas).toBe(null);
  });

  it('Nehir abla "şunu yap" demez; sözler kısa (≤ 30 harf)', () => {
    for (const s of top(P.v2.nehir)) {
      expect(s.length).toBeLessThanOrEqual(30);
      expect(s.toLocaleLowerCase('tr')).not.toMatch(/dokun|tıkla|sürükle|bas\b|seç\b|getir/);
    }
  });
});
