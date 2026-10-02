/**
 * Pasta Otobüsü v2 (ekip/senaryo/pasta-otobusu-v2.md): desen eşleme toleransı, günlük hedef ve yıldız, yükseltmeler,
 * iki kalemli sipariş (tatlı + içecek), özel müşteriler.
 */
import { describe, expect, it } from 'vitest';
import P from '../../content/pasta.json';
import {
  cizgiKabul,
  DESENLER,
  desenEsle,
  desenHedefleri,
  kapsama,
  noktaIsabet,
  serpintiSeviye,
  TOLERANS,
  yuzHedefleri,
  YUZLER,
  type Nokta,
} from '../../pasta/src/desen';
import { gunBitti, kayit, sifirla, toplamYildiz } from '../../pasta/src/kayit';
import {
  acikOlanlar,
  acikYukseltmeler,
  degisimUygula,
  dolumSonucu,
  firinGozSayisi,
  GUN_SAYISI,
  GUNLER,
  gunPlani,
  hedefKalem,
  kalemSec,
  karsilastir,
  okuma,
  SEKILLER,
  siparisSonucu,
  SON_OYNANAN,
  yildizHesapla,
  type Gun,
  type Kalem,
  type Parti,
  type Siparis,
} from '../../pasta/src/model';

function tohum(s: number) {
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const kaydir = (yol: Nokta[], dx: number, dy: number): Nokta[] => yol.map(([x, y]) => [x + dx, y + dy]);
/** Kalemin tam aynısı olan parti / bardak */
const aynisi = (k: Kalem): Parti =>
  k.urun === 'icecek'
    ? { urun: 'icecek', sekil: null, parcalar: [], bardak: { icecek: k.icecek!, boy: k.boy!, dolum: 1 } }
    : {
        urun: k.urun,
        sekil: k.sekil,
        parcalar: Array.from({ length: k.adet }, () => ({
          renk: k.urun === 'kurabiye' ? k.renk : null,
          yigin: k.urun === 'kapkek' && k.renk ? Array.from({ length: k.yigin }, () => k.renk!) : [],
          susler: k.sus ? Array.from({ length: k.susAdet }, () => k.sus!) : [],
          desen: k.desen ?? 'duz',
          serpinti: [0, 5, 16][k.serpinti ?? 0],
          yuz: k.yuz ?? null,
          mum: k.mum ?? 0,
        })),
      };

describe('desen eşleme (toleranslı çizgi çalışması)', () => {
  const zigzag = desenHedefleri('zigzag', 'yuvarlak')[0];
  it('şablonun tam üstünden çizilen çizgi kabul, desen tamam', () => {
    expect(cizgiKabul(zigzag, zigzag.yol)).toBe(true);
    expect(kapsama(zigzag, [zigzag.yol])).toBeGreaterThan(0.95);
    expect(desenEsle([zigzag], [zigzag.yol]).bitti).toBe(true);
  });
  it('biraz kayık (tolerans içinde) ve ters yönden çizilen de olur', () => {
    const kayik = kaydir(zigzag.yol, TOLERANS * 0.6, -TOLERANS * 0.4);
    expect(desenEsle([zigzag], [kayik]).bitti).toBe(true);
    expect(desenEsle([zigzag], [zigzag.yol.slice().reverse()]).bitti).toBe(true);
  });
  it('iki parça çizgiyle de tamamlanır; yarısı yetmez', () => {
    const y = zigzag.yol;
    const yari = Math.floor(y.length / 2);
    expect(desenEsle([zigzag], [y.slice(0, yari + 1)]).bitti).toBe(false);
    expect(desenEsle([zigzag], [y.slice(0, yari + 1)]).oran[0]).toBeLessThan(0.7);
    expect(desenEsle([zigzag], [y.slice(0, yari + 1), y.slice(yari)]).bitti).toBe(true);
  });
  it('çok uzaktan ya da karalama çizgi kabul edilmez', () => {
    expect(desenEsle([zigzag], [kaydir(zigzag.yol, 0, TOLERANS * 3)]).bitti).toBe(false);
    const r = tohum(7);
    const karalama: Nokta[] = Array.from({ length: 60 }, () => [10 + r() * 80, 10 + r() * 80]);
    expect(cizgiKabul(zigzag, karalama)).toBe(false);
    expect(desenEsle([zigzag], [karalama]).bitti).toBe(false);
    // tek dokunuş çizgi değil
    expect(cizgiKabul(zigzag, [zigzag.yol[0]])).toBe(false);
  });
  it('noktalı desen: her nokta bir dokunuş (biraz kayık olur), hepsi dokununca tamam', () => {
    const h = desenHedefleri('nokta', 'yuvarlak');
    expect(h).toHaveLength(9);
    const dokunus = h.map((x) => [x.yol[0][0] + 3, x.yol[0][1] - 3] as Nokta);
    expect(desenEsle(h, [], dokunus).bitti).toBe(true);
    expect(desenEsle(h, [], dokunus.slice(1)).bitti).toBe(false);
    expect(noktaIsabet(h[0], [h[0].yol[0][0] + TOLERANS * 3, h[0].yol[0][1]])).toBe(false);
  });
  it('bütün desenler ve yüzler her şeklin içinde, tam izlenince tamam', () => {
    for (const s of SEKILLER) {
      for (const d of DESENLER) {
        const h = desenHedefleri(d, s);
        if (d === 'duz') {
          expect(h).toEqual([]);
          continue;
        }
        for (const x of h) for (const [px, py] of x.yol) expect(px >= 0 && px <= 100 && py >= 0 && py <= 100, `${d} ${s}`).toBe(true);
        const cizgiler = h.filter((x) => x.tur === 'cizgi').map((x) => x.yol);
        const noktalar = h.filter((x) => x.tur === 'nokta').map((x) => x.yol[0]);
        expect(desenEsle(h, cizgiler, noktalar).bitti, `${d} ${s}`).toBe(true);
      }
      for (const y of YUZLER) {
        const h = yuzHedefleri(y, s);
        // iki göz (ya da göz + kırpma çizgisi), iki yanak, ağız
        expect(h).toHaveLength(5);
        const gozler = h.filter((x) => x.parca === 'goz').map((x) => x.yol[0][1]);
        const agiz = h.filter((x) => x.parca === 'agiz').flatMap((x) => x.yol.map((p) => p[1]));
        // gözler üstte, ağız altında
        expect(Math.max(...gozler)).toBeLessThan(Math.max(...agiz));
        expect(desenEsle(h, h.filter((x) => x.tur === 'cizgi').map((x) => x.yol), h.filter((x) => x.tur === 'nokta').map((x) => x.yol[0])).bitti, `${y} ${s}`).toBe(true);
      }
    }
  });
  it('serpinti: az salla az, çok salla çok', () => {
    expect([0, 1, 11, 12, 30].map(serpintiSeviye)).toEqual([0, 1, 1, 2, 2]);
  });
});

describe('günlük hedef, yıldız, yükseltme', () => {
  it('10 günlük tablo; Gün 1-6 oynanır; hedefler ve mekânlar', () => {
    expect(GUN_SAYISI).toBe(10);
    expect(SON_OYNANAN).toBe(6);
    expect(Object.keys(GUNLER)).toHaveLength(10);
    expect(([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as Gun[]).map((g) => GUNLER[g].hedef)).toEqual([3, 4, 4, 5, 5, 5, 6, 6, 6, 8]);
    expect(([1, 2, 3, 4, 5, 6] as Gun[]).map((g) => GUNLER[g].yer)).toEqual(['park', 'park', 'okul', 'okul', 'plaj', 'kar']);
  });
  it('yıldız: 1 gün bitti, 2 hedef tuttu, 3 hedef + hiç uyuyan yok', () => {
    expect(yildizHesapla(2, 3, false)).toBe(1);
    expect(yildizHesapla(3, 3, true)).toBe(2);
    expect(yildizHesapla(3, 3, false)).toBe(3);
    expect(yildizHesapla(6, 5, false)).toBe(3);
    expect(yildizHesapla(0, 3, true)).toBe(1);
  });
  it('yıldızlar yükseltme açar (belgedeki sırayla); yıldız yetmese de o gün gelince açık', () => {
    expect(acikYukseltmeler(0, 1)).toEqual([]);
    expect(acikYukseltmeler(3, 1)).toEqual(['firin-2']);
    expect(acikYukseltmeler(0, 3)).toEqual(['firin-2']);
    expect(acikYukseltmeler(6, 2)).toEqual(['firin-2', 'icecek']);
    expect(acikYukseltmeler(0, 4)).toEqual(['firin-2', 'icecek']);
    expect(acikYukseltmeler(9, 4)).toEqual(['firin-2', 'icecek', 'hizli-firin']);
    expect(firinGozSayisi([])).toBe(1);
    expect(firinGozSayisi(acikYukseltmeler(3, 1))).toBe(2);
    // içecek siparişi yalnız makine açıkken
    expect(acikOlanlar(3, [], acikYukseltmeler(0, 3)).icecek).toBe(false);
    expect(acikOlanlar(3, [], acikYukseltmeler(6, 3)).icecek).toBe(true);
    expect(gunPlani(3, acikOlanlar(3, [], acikYukseltmeler(6, 3)), tohum(3)).filter((s) => s.kalemler.some((k) => k.urun === 'icecek'))).toHaveLength(2);
  });
  it('kayıt: günün en iyi yıldızı kalır, toplam yıldız; Gün 6 sonrası açılmaz', () => {
    sifirla();
    gunBitti(1, 2);
    gunBitti(1, 1);
    expect(kayit.yildiz['1']).toBe(2);
    gunBitti(2, 3);
    expect(toplamYildiz()).toBe(5);
    expect(kayit.acikGun).toBe(3);
    gunBitti(6, 3);
    expect(kayit.acikGun).toBe(6);
    sifirla();
  });
});

describe('iki kalemli sipariş (tatlı + içecek)', () => {
  const kur: Kalem = { urun: 'kurabiye', adet: 1, sekil: 'kalp', renk: 'pembe', sus: null, susAdet: 0, yigin: 0, desen: 'zigzag', serpinti: 1 };
  const sut: Kalem = { urun: 'icecek', adet: 1, sekil: null, renk: null, sus: null, susAdet: 0, yigin: 0, icecek: 'sut', boy: 'buyuk' };
  const sip: Siparis = { musteri: 'can', kalemler: [kur, sut] };
  it('Gün 4-6: dört siparişte tatlı + içecek; mekâna göre içecek', () => {
    for (let s = 1; s <= 30; s++) {
      for (const g of [4, 5, 6] as const) {
        const plan = gunPlani(g, acikOlanlar(g, [], acikYukseltmeler(0, g)), tohum(s));
        expect(plan).toHaveLength(6);
        const ikili = plan.filter((p) => p.kalemler.length === 2);
        expect(ikili.length).toBeGreaterThanOrEqual(4);
        for (const p of ikili) expect(p.kalemler.map((k) => k.urun).filter((u) => u === 'icecek')).toHaveLength(1);
      }
    }
    const say = (g: Gun, i: string) => Array.from({ length: 30 }, (_, s) => gunPlani(g, acikOlanlar(g, [], acikYukseltmeler(0, g)), tohum(s + 1))).flat().flatMap((p) => p.kalemler).filter((k) => k.icecek === i).length;
    expect(say(5, 'limonata')).toBeGreaterThan(say(5, 'kakao'));
    expect(say(6, 'kakao')).toBeGreaterThan(say(6, 'limonata'));
  });
  it('bardak içecek kalemine, tatlı tatlı kalemine gider; her kalem ayrı teslim (balonda tik), sonuç kalem kalem', () => {
    expect(kalemSec(sip, [null, null], aynisi(sut))).toBe(1);
    expect(kalemSec(sip, [null, null], aynisi(kur))).toBe(0);
    expect(kalemSec(sip, [aynisi(kur), null], aynisi(sut))).toBe(1);
    expect(siparisSonucu(sip, [aynisi(kur), aynisi(sut)])).toEqual({ ayni: true, farklar: [[], []] });
  });
  it('bardak: çizgide tam, altında "az" (fark), taşan Kino silince tam; boy ve içecek ayrı fark', () => {
    expect([0.5, 0.86, 0.9, 1, 1.12, 1.2].map(dolumSonucu)).toEqual(['az', 'az', 'tam', 'tam', 'tam', 'tasti']);
    const b = (dolum: number, boy: 'kucuk' | 'buyuk' = 'buyuk', icecek: 'sut' | 'kakao' = 'sut'): Parti => ({ urun: 'icecek', sekil: null, parcalar: [], bardak: { icecek, boy, dolum } });
    expect(karsilastir(sut, b(1))).toEqual([]);
    expect(karsilastir(sut, b(0.6))).toEqual(['dolum']);
    expect(karsilastir(sut, b(1, 'kucuk'))).toEqual(['boy']);
    expect(karsilastir(sut, b(1, 'buyuk', 'kakao'))).toEqual(['icecek']);
    // içecek yerine kurabiye
    expect(karsilastir(sut, aynisi(kur))).toEqual(['urun']);
    const r = siparisSonucu(sip, [aynisi(kur), b(0.5)]);
    expect(r.ayni).toBe(false);
    expect(r.farklar).toEqual([[], ['dolum']]);
  });
  it('desen, yüz, serpinti, mum karşılaştırılır', () => {
    const p = aynisi(kur);
    expect(karsilastir(kur, p)).toEqual([]);
    expect(karsilastir(kur, { ...p, parcalar: [{ ...p.parcalar[0], desen: 'duz' }] })).toEqual(['desen']);
    expect(karsilastir(kur, { ...p, parcalar: [{ ...p.parcalar[0], serpinti: 0 }] })).toEqual(['serpinti']);
    expect(karsilastir(kur, { ...p, parcalar: [{ ...p.parcalar[0], serpinti: 14 }] })).toEqual(['serpinti']);
    expect(karsilastir({ ...kur, yuz: 'gulen', desen: 'duz', serpinti: 0 }, { ...p, parcalar: [{ ...p.parcalar[0], desen: 'duz', serpinti: 0 }] })).toEqual(['yuz']);
    const dg: Kalem = { urun: 'kapkek', adet: 1, sekil: null, renk: 'mavi', sus: null, susAdet: 0, yigin: 1, mum: 5 };
    expect(karsilastir(dg, aynisi(dg))).toEqual([]);
    expect(karsilastir(dg, { ...aynisi(dg), parcalar: [{ ...aynisi(dg).parcalar[0], mum: 4 }] })).toEqual(['mum']);
  });
  it('tabaktaki parti için hedef kalem: aynı ürün, şekil ve adet, gelişi en eski müşteri', () => {
    const a = { sip: { musteri: 'ada', kalemler: [{ ...kur, sekil: 'yildiz' as const }] }, verilen: [null] };
    const b2 = { sip, verilen: [null, null] };
    expect(hedefKalem([a, b2], aynisi(kur))).toEqual(kur);
    expect(hedefKalem([a, b2], { ...aynisi(kur), sekil: 'yildiz' })?.sekil).toBe('yildiz');
    expect(hedefKalem([b2], aynisi(sut))).toEqual(sut);
    expect(hedefKalem([{ sip, verilen: [aynisi(kur), null] }], aynisi(kur))).toBeNull();
  });
});

describe('özel müşteriler', () => {
  it('Gün 5 (plaj): kafası karışık ördek krema rengini değiştirir; doğum günü Elif: tek yığın, yaş kadar mum (4-6)', () => {
    for (let s = 1; s <= 30; s++) {
      const plan = gunPlani(5, acikOlanlar(5, [], acikYukseltmeler(0, 5)), tohum(s));
      const ordek = plan.find((p) => p.musteri === 'ordek')!;
      expect(ordek.ozel).toBe('karisik');
      expect(ordek.degisim?.renk).toBeTruthy();
      expect(ordek.degisim!.renk).not.toBe(ordek.kalemler[0].renk);
      const yeni = degisimUygula(ordek);
      expect(yeni.kalemler[0].renk).toBe(ordek.degisim!.renk);
      expect(yeni.kalemler[0].sekil).toBe(ordek.kalemler[0].sekil);
      expect(yeni.degisim).toBeUndefined();
      const elif = plan.find((p) => p.musteri === 'elif')!;
      expect(elif.ozel).toBe('dogumgunu');
      expect(elif.kalemler).toHaveLength(1);
      expect(elif.kalemler[0]).toMatchObject({ urun: 'kapkek', yigin: 1 });
      expect(elif.kalemler[0].mum).toBeGreaterThanOrEqual(4);
      expect(elif.kalemler[0].mum).toBeLessThanOrEqual(6);
      expect(okuma(elif)[0]).toBe(P.mino.dogumgunu);
      // plajda çikolata erir
      expect(plan.flatMap((p) => p.kalemler).some((k) => k.sus === 'cikolata')).toBe(false);
    }
  });
  it("Gün 6 (karlı bahçe): Ege'nin annesi: şekersiz (kremasız, serpintisiz) kurabiye + küçük süt", () => {
    for (let s = 1; s <= 20; s++) {
      const plan = gunPlani(6, acikOlanlar(6, [], acikYukseltmeler(0, 6)), tohum(s));
      const anne = plan.find((p) => p.musteri === 'anne')!;
      expect(anne.ozel).toBe('anne');
      expect(anne.kalemler[0]).toMatchObject({ urun: 'kurabiye', renk: null, serpinti: 0, sus: null });
      expect(anne.kalemler[1]).toMatchObject({ urun: 'icecek', icecek: 'sut', boy: 'kucuk' });
      expect(okuma(anne)[0]).toBe(P.mino.ege);
      expect(plan.find((p) => p.musteri === 'can')!.ozel).toBe('dogumgunu');
    }
    const k = gunPlani(6, acikOlanlar(6, [], acikYukseltmeler(0, 6)), tohum(1)).find((p) => p.musteri === 'anne')!.kalemler[0];
    const p = aynisi(k);
    expect(karsilastir(k, p)).toEqual([]);
    // şeker koyarsa (krema ya da serpinti) fark görünür
    expect(karsilastir(k, { ...p, parcalar: [{ ...p.parcalar[0], renk: 'pembe' }] })).toEqual(['renk']);
    expect(karsilastir(k, { ...p, parcalar: [{ ...p.parcalar[0], serpinti: 4 }] })).toEqual(['serpinti']);
  });
});
