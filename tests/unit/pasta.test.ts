/**
 * Pasta Otobüsü (sade sürüm): sipariş üretimi (3 gün × 4 müşteri), karşılaştırma, hedef kalem, fırın zamanı
 * (uzun altın penceresi, Gün 1'de yanmaz), jeton, yıldız, kayıt, zigzag kaydırması, seslendirme.
 */
import { describe, expect, it } from 'vitest';
import P from '../../content/pasta.json';
import { karakterCumleleri, normal, tumCumleler } from '../../src/audio/cumleler';
import { DESEN_YERI, desenHedefleri, kaydirmaSayilir, type Nokta } from '../../pasta/src/desen';
import { gunBitti, kayit, sifirla, toplamYildiz } from '../../pasta/src/kayit';
import {
  acikOlanlar,
  alinabilir,
  EN_COK_HAMUR,
  EN_COK_MUSTERI,
  FIRIN,
  firinHali,
  GUN_SAYISI,
  GUNLER,
  gunPlani,
  hamurRengi,
  HAMUR_RENK,
  hedefKalem,
  jetonHesapla,
  kalanIs,
  kalemSec,
  karsilastir,
  MUSTERI_SAYISI,
  okuma,
  pisme,
  RAF,
  RENKLER,
  satinAl,
  sayim,
  SEKILLER,
  siparisSonucu,
  siradakiIndeks,
  SON_OYNANAN,
  SUSLER,
  susYeri,
  tesekkur,
  yildizHesapla,
  type Gun,
  type Kalem,
  type Parti,
  type Siparis,
} from '../../pasta/src/model';

/** İç içe metinleri düzleştirir */
const duz = (v: unknown): string[] => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(duz) : v && typeof v === 'object' ? Object.values(v).flatMap(duz) : []);

/** Tekrarlanabilir rastgele sayı (mulberry32) */
function tohum(s: number) {
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Kalemin tam aynısı olan parti */
const aynisi = (k: Kalem): Parti => ({
  urun: k.urun,
  sekil: k.sekil,
  parcalar: Array.from({ length: k.adet }, () => ({
    renk: k.renk,
    yigin: [],
    susler: k.sus ? Array.from({ length: k.susAdet }, () => k.sus!) : [],
    desen: k.desen ?? 'duz',
  })),
});
const GUNLERI = [1, 2, 3] as Gun[];

describe('sade sürüm: günler ve tezgâh', () => {
  it('üç gün, günde dört müşteri, sırada en çok iki müşteri', () => {
    expect(GUN_SAYISI).toBe(3);
    expect(SON_OYNANAN).toBe(3);
    expect(Object.keys(GUNLER)).toHaveLength(3);
    expect(MUSTERI_SAYISI).toBe(4);
    expect(EN_COK_MUSTERI).toBe(2);
    for (const g of GUNLERI) {
      expect(GUNLER[g].musteriler).toHaveLength(4);
      expect(new Set(GUNLER[g].musteriler).size).toBe(4);
      // sabır uzun: yalnız uyuklatır
      expect(GUNLER[g].sabir).toBeGreaterThanOrEqual(90000);
    }
  });
  it('yalnız gereken istasyonlar: Gün 1 süs yok; şekiller, kremalar, süsler üçer', () => {
    expect(SEKILLER).toEqual(['yuvarlak', 'yildiz', 'kalp']);
    expect(RENKLER).toEqual(['pembe', 'mavi', 'sari']);
    expect(SUSLER).toEqual(['cilek', 'cikolata', 'muz']);
    expect(acikOlanlar(1)).toEqual({ sekiller: SEKILLER, renkler: RENKLER, susler: [], zigzag: false });
    expect(acikOlanlar(2).susler).toEqual(SUSLER);
    expect(acikOlanlar(2).zigzag).toBe(false);
    expect(acikOlanlar(3).zigzag).toBe(true);
  });
});

describe('sipariş üretimi', () => {
  it('Gün 1: dört müşteri bir kez, hep tek kurabiye, yalnız krema; ördek sarı kremalı', () => {
    for (let s = 1; s <= 40; s++) {
      const plan = gunPlani(1, acikOlanlar(1), tohum(s));
      expect(plan.map((p) => p.musteri).sort()).toEqual([...GUNLER[1].musteriler].sort());
      for (const p of plan) {
        expect(p.kalemler).toHaveLength(1);
        const k = p.kalemler[0];
        expect(k).toMatchObject({ urun: 'kurabiye', adet: 1, sus: null, susAdet: 0, desen: 'duz', serpinti: 0 });
        expect(SEKILLER).toContain(k.sekil);
        expect(RENKLER).toContain(k.renk);
        if (p.musteri === 'ordek') expect(k.renk).toBe('sari');
      }
    }
  });
  it('Gün 2-3: en çok 2 kurabiye, tek tür süs 1-3 (iki kurabiyede en çok 2); ilk müşteri tek kurabiye', () => {
    for (let s = 1; s <= 60; s++) {
      for (const g of [2, 3] as Gun[]) {
        const plan = gunPlani(g, acikOlanlar(g), tohum(s));
        expect(plan).toHaveLength(4);
        expect(plan[0].kalemler[0].adet).toBe(1);
        for (const p of plan) {
          expect(p.kalemler).toHaveLength(1);
          const k = p.kalemler[0];
          expect(k.adet).toBeGreaterThanOrEqual(1);
          expect(k.adet).toBeLessThanOrEqual(EN_COK_HAMUR);
          expect(SUSLER).toContain(k.sus);
          expect(k.susAdet).toBeGreaterThanOrEqual(1);
          expect(k.susAdet).toBeLessThanOrEqual(k.adet === 2 ? 2 : 3);
          // krema hep var; açık renk muz sarı kremada istenmez (görünmez, sayılamaz)
          expect(RENKLER).toContain(k.renk);
          expect(k.sus === 'muz' && k.renk === 'sari').toBe(false);
        }
      }
    }
  });
  it('zigzag krema yalnız Gün 3, günde iki sipariş', () => {
    for (let s = 1; s <= 40; s++) {
      expect(gunPlani(2, acikOlanlar(2), tohum(s)).some((p) => p.kalemler[0].desen === 'zigzag')).toBe(false);
      expect(gunPlani(3, acikOlanlar(3), tohum(s)).filter((p) => p.kalemler[0].desen === 'zigzag')).toHaveLength(2);
    }
  });
  it('sıradaki müşteri: tezgâhta olan karakter ikinci kez gelmez', () => {
    const k = (m: string): Siparis => ({ musteri: m, kalemler: [] });
    expect(siradakiIndeks([k('tavsan'), k('can')], ['tavsan'])).toBe(1);
    expect(siradakiIndeks([k('tavsan')], ['tavsan'])).toBe(-1);
  });
  it('sipariş okunuşu parçalı: {sayı} {şekil} kurabiye, {renk} kremalı, {desen}, {süs}lü!', () => {
    const k: Kalem = { urun: 'kurabiye', adet: 2, sekil: 'yildiz', renk: 'mavi', sus: 'cilek', susAdet: 1, yigin: 0 };
    expect(okuma({ musteri: 'ada', kalemler: [k] })).toEqual(['İki!', 'Yıldız kurabiye,', 'mavi kremalı,', 'çilekli!']);
    expect(okuma({ musteri: 'can', kalemler: [{ ...k, adet: 1, sus: null, susAdet: 0 }] })).toEqual(['Bir!', 'Yıldız kurabiye,', 'mavi kremalı!']);
    expect(okuma({ musteri: 'elif', kalemler: [{ ...k, adet: 1, desen: 'zigzag', sus: 'muz' }] })).toEqual(['Bir!', 'Yıldız kurabiye,', 'mavi kremalı,', 'zigzaglı!', 'muzlu!']);
  });
});

describe('karşılaştırma', () => {
  const k: Kalem = { urun: 'kurabiye', adet: 2, sekil: 'yildiz', renk: 'mavi', sus: 'cilek', susAdet: 1, yigin: 0 };
  it('tam aynıysa fark yok', () => {
    expect(karsilastir(k, aynisi(k))).toEqual([]);
    const z: Kalem = { ...k, adet: 1, desen: 'zigzag', sus: 'muz', susAdet: 3 };
    expect(karsilastir(z, aynisi(z))).toEqual([]);
  });
  it('farklı olan şeyleri tek tek bulur', () => {
    const p = aynisi(k);
    expect(karsilastir(k, { ...p, sekil: 'kalp' })).toEqual(['sekil']);
    expect(karsilastir(k, { ...p, parcalar: p.parcalar.slice(0, 1) })).toEqual(['adet']);
    const renk = aynisi(k);
    renk.parcalar[1].renk = 'pembe';
    expect(karsilastir(k, renk)).toEqual(['renk']);
    const sus = aynisi(k);
    sus.parcalar[0].susler.push('cilek');
    expect(karsilastir(k, sus)).toEqual(['sus']);
    const z = aynisi({ ...k, desen: 'zigzag' });
    expect(karsilastir(k, z)).toEqual(['desen']);
    expect(karsilastir(k, null)).toEqual(['urun']);
  });
  it('parti siparişin kalemine gider; sonuç kalem kalem', () => {
    const sip: Siparis = { musteri: 'can', kalemler: [k] };
    expect(kalemSec(sip, [null], aynisi(k))).toBe(0);
    expect(kalemSec(sip, [aynisi(k)], aynisi(k))).toBe(-1);
    expect(siparisSonucu(sip, [aynisi(k)])).toEqual({ ayni: true, farklar: [[]] });
  });
  it('tabaktaki parti için hedef kalem: şekil ve adet tutan, eşitse gelişi en eski; parti yoksa ilk bekleyen', () => {
    const a = { sip: { musteri: 'ada', kalemler: [{ ...k, sekil: 'kalp' as const }] }, verilen: [null] };
    const b = { sip: { musteri: 'can', kalemler: [k] }, verilen: [null] };
    expect(hedefKalem([a, b], aynisi(k))).toEqual(k);
    expect(hedefKalem([a, b], { ...aynisi(k), sekil: 'kalp' })?.sekil).toBe('kalp');
    expect(hedefKalem([a, b])).toEqual(a.sip.kalemler[0]);
    expect(hedefKalem([{ ...b, verilen: [aynisi(k)] }], aynisi(k))).toBeNull();
  });
  it('yarım süslü kurabiye günü kilitlemez: süsü tutan müşteri hedef kalır; konamayan süs beklenmez', () => {
    // B: kalp, çilek ×2; kurabiye yanlışlıkla yıldız yapıldı, kremalandı, bir çilek kondu. Sonra C (yıldız, muz ×2) gelir.
    const kB: Kalem = { urun: 'kurabiye', adet: 1, sekil: 'kalp', renk: 'pembe', sus: 'cilek', susAdet: 2, yigin: 0 };
    const kC: Kalem = { urun: 'kurabiye', adet: 1, sekil: 'yildiz', renk: 'mavi', sus: 'muz', susAdet: 2, yigin: 0 };
    const B = { sip: { musteri: 'ada', kalemler: [kB] }, verilen: [null] };
    const C = { sip: { musteri: 'can', kalemler: [kC] }, verilen: [null] };
    const parti: Parti = { urun: 'kurabiye', sekil: 'yildiz', parcalar: [{ renk: 'pembe', yigin: [], susler: ['cilek'] }] };
    // süssüzken şekil tutan C öne geçerdi; çilek konmuşken B hedef kalır, ikinci çilek konabilir
    expect(hedefKalem([B, C], { ...parti, parcalar: [{ renk: 'pembe', yigin: [], susler: [] }] })).toBe(kC);
    expect(hedefKalem([B, C], parti)).toBe(kB);
    expect(kalanIs(parti, kB)).toBe('sus');
    expect(susYeri(parti, 'cilek', kB)).toBe(0);
    expect(susYeri(parti, 'muz', kB)).toBe(-1);
    // C'ye göre: muz konamaz (üstünde çilek var), çilek de istenmiyor → süs beklenmez, farklı da olsa verilebilir
    expect(susYeri(parti, 'muz', kC)).toBe(-1);
    expect(susYeri(parti, 'cilek', kC)).toBe(-1);
    expect(kalanIs(parti, kC)).toBeNull();
    // iki kurabiyeli partide süs, başka süsü olmayan kurabiyeye gider
    const iki: Parti = { urun: 'kurabiye', sekil: 'kalp', parcalar: [{ renk: 'pembe', yigin: [], susler: ['muz'] }, { renk: 'pembe', yigin: [], susler: ['cilek'] }] };
    const kIki: Kalem = { ...kB, adet: 2 };
    expect(susYeri(iki, 'cilek', kIki)).toBe(1);
    expect(kalanIs(iki, kIki)).toBe('sus');
    iki.parcalar[1].susler.push('cilek');
    expect(susYeri(iki, 'cilek', kIki)).toBe(-1);
    expect(kalanIs(iki, kIki)).toBeNull();
    // hedefsiz (müşteri yokken) en çok EN_COK_SUS tane, tek tür
    expect(susYeri({ ...parti, parcalar: [{ renk: 'pembe', yigin: [], susler: ['cilek', 'cilek'] }] }, 'cilek', null)).toBe(0);
    expect(susYeri({ ...parti, parcalar: [{ renk: 'pembe', yigin: [], susler: ['cilek', 'cilek', 'cilek'] }] }, 'cilek', null)).toBe(-1);
    // kremasız parti önce krema ister
    expect(kalanIs({ ...parti, parcalar: [{ renk: null, yigin: [], susler: [] }] }, kB)).toBe('krema');
  });
  it('teşekkür: ördek sarı kremayı sever; tavşan ve ayı havuç/bal demez', () => {
    const sari: Parti = { urun: 'kurabiye', sekil: 'kalp', parcalar: [{ renk: 'sari', yigin: [], susler: [] }] };
    expect(tesekkur('ordek', [sari])).toBe(P.musteri.ordek[0]);
    expect(tesekkur('tavsan', [sari])).toBe(P.musteri.tavsan[1]);
    expect(tesekkur('ayi', [sari])).toBe(P.musteri.ayi[1]);
  });
});

describe('fırın zamanlaması', () => {
  it('beyaz → altın ~5 sn; altın en az 10 sn kalır, 10 sn daha sonra yanar', () => {
    expect(FIRIN.altin).toBeLessThanOrEqual(6000);
    expect(FIRIN.kizar - FIRIN.altin).toBeGreaterThanOrEqual(10000);
    expect(FIRIN.yanik - FIRIN.kizar).toBeGreaterThanOrEqual(10000);
    expect(firinHali(0)).toBe('cig');
    expect(firinHali(FIRIN.altin - 1)).toBe('cig');
    expect(firinHali(FIRIN.altin)).toBe('altin');
    expect(firinHali(FIRIN.yanik - 1)).toBe('altin');
    expect(firinHali(FIRIN.yanik)).toBe('yanik');
    // Gün 1: hiç yanmaz
    expect(firinHali(10 * 60 * 1000, { ...FIRIN, yanik: Infinity })).toBe('altin');
    expect(pisme(10 * 60 * 1000, { ...FIRIN, yanik: Infinity })).toBe(1);
  });
  it('renk geçişi: beyazdan altına; altın kizar anına kadar hiç koyulaşmaz, sonra kahveye', () => {
    expect(pisme(0)).toBe(0);
    expect(pisme(FIRIN.altin / 2)).toBeCloseTo(0.5);
    expect(pisme(FIRIN.altin)).toBe(1);
    expect(pisme(FIRIN.kizar - 1)).toBe(1);
    expect(pisme((FIRIN.kizar + FIRIN.yanik) / 2)).toBeCloseTo(1.5);
    expect(pisme(99999)).toBe(2);
    expect(hamurRengi(0).toLowerCase()).toBe(HAMUR_RENK.cig.toLowerCase());
    expect(hamurRengi(1).toLowerCase()).toBe(HAMUR_RENK.altin.toLowerCase());
    expect(hamurRengi(2).toLowerCase()).toBe(HAMUR_RENK.yanik.toLowerCase());
  });
});

describe('jeton, yıldız, kayıt', () => {
  it('aynıysa 3 jeton (+1 bahşiş uyuklamadan), farklıysa 2; ret yok', () => {
    expect(jetonHesapla(true, 0.2, false)).toEqual({ jeton: 3, bahsis: 1 });
    expect(jetonHesapla(true, 0.9, false)).toEqual({ jeton: 3, bahsis: 0 });
    expect(jetonHesapla(true, 0.3, true)).toEqual({ jeton: 3, bahsis: 0 });
    expect(jetonHesapla(false, 0.1, false)).toEqual({ jeton: 2, bahsis: 0 });
  });
  it('akşam sayımı: 10a kadar tek tek, fazlası beşer beşer', () => {
    expect(sayim(3)).toEqual({ soz: ['Bir!', 'İki!', 'Üç!'], adim: [1, 1, 1] });
    const s = sayim(16);
    expect(s.soz).toEqual(['Beş!', 'On!', 'On beş!']);
    expect(s.adim.reduce((a, b) => a + b, 0)).toBe(16);
    expect(sayim(0)).toEqual({ soz: [], adim: [] });
  });
  it('dükkân rafı yalnız süs: şapka ve boyalar; jeton yeterse alınır, iki kez alınmaz', () => {
    expect(RAF.map((r) => r.tur)).toEqual(['sapka', 'boya', 'boya']);
    const c = { jeton: 6, alinan: [] as string[] };
    const boya = RAF.find((r) => r.id === 'boya-nane')!;
    expect(alinabilir(c, boya)).toBe(false);
    expect(satinAl(c, 'sapka')).toBe(true);
    expect(c).toEqual({ jeton: 1, alinan: ['sapka'] });
    expect(satinAl(c, 'sapka')).toBe(false);
  });
  it('yıldız: 1 gün bitti, 2 iki mutlu müşteri, 3 üç mutlu müşteri (uyuklama yıldızı etkilemez)', () => {
    expect(yildizHesapla(0)).toBe(1);
    expect(yildizHesapla(1)).toBe(1);
    expect(yildizHesapla(2)).toBe(2);
    expect(yildizHesapla(3)).toBe(3);
    expect(yildizHesapla(4)).toBe(3);
  });
  it('kayıt: günün en iyi yıldızı kalır; sonraki gün açılır, Gün 3 sonrası açılmaz', () => {
    sifirla();
    gunBitti(1, 2);
    gunBitti(1, 1);
    expect(kayit.yildiz['1']).toBe(2);
    expect(kayit.acikGun).toBe(2);
    gunBitti(2, 3);
    expect(toplamYildiz()).toBe(5);
    gunBitti(3, 3);
    expect(kayit.acikGun).toBe(3);
    sifirla();
  });
  it('kayıt: günün jetonları gün bitince hemen kumbaraya yazılır (akşam sayımı beklenmez)', () => {
    sifirla();
    gunBitti(1, 3, 14);
    expect(kayit.jeton).toBe(14);
    expect(JSON.parse(globalThis.localStorage?.getItem('minkino-pasta-v1') ?? '{"jeton":14}').jeton).toBe(14);
    gunBitti(2, 2, 0);
    gunBitti(2, 2, -3);
    expect(kayit.jeton).toBe(14);
    gunBitti(2, 2, 6);
    expect(kayit.jeton).toBe(20);
    sifirla();
  });
});

describe('zigzag krema (kolay kaydırma)', () => {
  it('kabaca yatay her kaydırma sayılır; tek dokunuş ve minik kıpırtı sayılmaz', () => {
    expect(kaydirmaSayilir([[30, 50], [52, 52]])).toBe(true);
    expect(kaydirmaSayilir([[60, 40], [40, 46]])).toBe(true);
    // dikey ama uzun bir sürtme de olur (başarısızlık yok)
    expect(kaydirmaSayilir([[50, 20], [52, 50]])).toBe(true);
    expect(kaydirmaSayilir([[50, 50]])).toBe(false);
    expect(kaydirmaSayilir([[50, 50], [53, 51]])).toBe(false);
  });
  it('zigzag şablonu her şeklin kremasının ortasında, kurabiyenin içinde', () => {
    for (const s of SEKILLER) {
      const [h] = desenHedefleri('zigzag', s);
      const ys = h.yol.map((p: Nokta) => p[1]);
      const orta = (Math.min(...ys) + Math.max(...ys)) / 2;
      expect(Math.abs(orta - DESEN_YERI[s].cy), s).toBeLessThan(4);
      for (const [x, y] of h.yol) expect(x > 5 && x < 95 && y > 5 && y < 95, s).toBe(true);
    }
  });
});

describe('seslendirme', () => {
  const hepsi = new Set(tumCumleler());
  it('bütün parçalar ve cümleler listede, Kino cümleleri Kino sesinde', () => {
    for (let s = 1; s <= 20; s++) for (const g of GUNLERI) for (const sip of gunPlani(g, acikOlanlar(g), tohum(s))) for (const p of okuma(sip)) expect(hepsi.has(normal(p)), p).toBe(true);
    for (const t of duz(P.mino)) expect(hepsi.has(normal(t)), t).toBe(true);
    for (const t of duz(P.parca)) expect(hepsi.has(normal(t)), t).toBe(true);
    const kino = new Set(karakterCumleleri().kino);
    for (const t of duz(P.kino)) expect(kino.has(normal(t))).toBe(true);
  });
  it('cümleler kısa', () => {
    const metinler = [...duz(P.mino), ...duz(P.kino), ...duz(P.musteri), ...duz(P.parca)];
    for (const t of metinler) expect(t.length, t).toBeLessThanOrEqual(32);
  });
});
