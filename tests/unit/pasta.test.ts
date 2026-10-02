import { describe, expect, it } from 'vitest';
import P from '../../content/pasta.json';
import { karakterCumleleri, normal, tumCumleler } from '../../src/audio/cumleler';
import {
  acikOlanlar,
  acikYukseltmeler,
  alinabilir,
  EN_COK_YIGIN,
  FIRIN,
  firinHali,
  GUNLER,
  gunPlani,
  hamurRengi,
  HAMUR_RENK,
  jetonHesapla,
  kalemSec,
  karsilastir,
  okuma,
  pisme,
  RAF,
  satinAl,
  sayim,
  siparisSonucu,
  siradakiIndeks,
  tesekkur,
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
    renk: k.urun === 'kurabiye' ? k.renk : null,
    yigin: k.urun === 'kapkek' ? Array.from({ length: k.yigin }, () => k.renk!) : [],
    susler: k.sus ? Array.from({ length: k.susAdet }, () => k.sus!) : [],
  })),
});

describe('sipariş üretimi', () => {
  it('Gün 1: altı müşteri (tavşan, ördek, Can ikişer), tek kurabiye, süs yok; ördek sarı kremalı', () => {
    for (let s = 1; s <= 40; s++) {
      const plan = gunPlani(1, acikOlanlar(1), tohum(s));
      expect(plan).toHaveLength(6);
      const say = new Map<string, number>();
      plan.forEach((p) => say.set(p.musteri, (say.get(p.musteri) ?? 0) + 1));
      expect([...say.entries()].sort()).toEqual([['can', 2], ['ordek', 2], ['tavsan', 2]]);
      // aynı karakter arka arkaya gelmez
      plan.forEach((p, i) => i && expect(p.musteri).not.toBe(plan[i - 1].musteri));
      for (const p of plan) {
        expect(p.kalemler).toHaveLength(1);
        const k = p.kalemler[0];
        expect(k).toMatchObject({ urun: 'kurabiye', adet: 1, sus: null, susAdet: 0 });
        expect(['yuvarlak', 'yildiz', 'kalp']).toContain(k.sekil);
        expect(['pembe', 'mavi', 'sari']).toContain(k.renk);
        if (p.musteri === 'ordek') expect(k.renk).toBe('sari');
      }
    }
  });

  it('Gün 2: ayı, Ada, Elif; her birinin bir siparişi yüzlü kurabiye, öbürü 2-3 kurabiye, süs 1-3 (üçte en çok 2); ayı ballı', () => {
    for (let s = 1; s <= 40; s++) {
      const plan = gunPlani(2, acikOlanlar(2), tohum(s));
      expect(new Set(plan.map((p) => p.musteri))).toEqual(new Set(['ayi', 'ada', 'elif']));
      for (const ad of ['ayi', 'ada', 'elif']) expect(plan.filter((p) => p.musteri === ad && p.kalemler[0].yuz)).toHaveLength(1);
      for (const p of plan) {
        const k = p.kalemler[0];
        if (k.yuz) {
          // yüzlü kurabiye: tek, düz kremalı, süssüz, serpintisiz; yüz yuvarlak ya da kalpte
          expect(k).toMatchObject({ adet: 1, desen: 'duz', serpinti: 0, sus: null });
          expect(['yuvarlak', 'kalp']).toContain(k.sekil);
          expect(['gulen', 'saskin', 'kirpan']).toContain(k.yuz);
          continue;
        }
        expect(k.adet).toBeGreaterThanOrEqual(2);
        expect(k.adet).toBeLessThanOrEqual(3);
        expect(k.sus).not.toBeNull();
        expect(k.susAdet).toBeGreaterThanOrEqual(1);
        expect(k.susAdet).toBeLessThanOrEqual(k.adet === 3 ? 2 : 3);
        expect(['cilek', 'havuc', 'bal']).toContain(k.sus);
        if (p.musteri === 'ayi') expect(k.sus).toBe('bal');
      }
    }
  });

  it('Gün 3: okul önü, herkes bir kez; kapkek, ikili sipariş ve tavşandan sonra ayının mantık siparişi', () => {
    expect(GUNLER[3].yer).toBe('okul');
    for (let s = 1; s <= 60; s++) {
      const plan = gunPlani(3, acikOlanlar(3), tohum(s));
      expect(plan.map((p) => p.musteri).sort()).toEqual(['ada', 'ayi', 'can', 'elif', 'ordek', 'tavsan']);
      const t = plan.findIndex((p) => p.musteri === 'tavsan');
      const a = plan.findIndex((p) => p.musteri === 'ayi');
      expect(t).toBeLessThan(a);
      const tavsan = plan[t].kalemler[0];
      expect(tavsan).toMatchObject({ urun: 'kurabiye', adet: 1, sus: 'cilek' });
      const ayi = plan[a];
      expect(ayi.mantik).toEqual({ kaynak: 'tavsan', kalem: tavsan, fazla: 1 });
      expect(ayi.kalemler[0]).toEqual({ ...tavsan, susAdet: tavsan.susAdet + 1 });
      expect(okuma(ayi)).toEqual([P.mino.mantik]);
      expect(plan.filter((p) => p.kalemler.length === 2)).toHaveLength(1);
      const ikili = plan.find((p) => p.kalemler.length === 2)!;
      expect(ikili.kalemler.map((k) => k.urun)).toEqual(['kurabiye', 'kapkek']);
      const kapkekler = plan.flatMap((p) => p.kalemler).filter((k) => k.urun === 'kapkek');
      expect(kapkekler.length).toBeGreaterThanOrEqual(3);
      for (const k of kapkekler) {
        expect(k.yigin).toBeGreaterThanOrEqual(1);
        expect(k.yigin).toBeLessThanOrEqual(EN_COK_YIGIN);
        expect(k.sekil).toBeNull();
      }
    }
  });

  it('dükkândan alınanlar siparişe girer (ay kalıbı, mor krema, muz, çikolata)', () => {
    const acik = acikOlanlar(2, ['kalip-ay', 'renk-mor', 'sus-muz', 'sus-cikolata']);
    expect(acik.sekiller).toContain('ay');
    expect(acik.renkler).toContain('mor');
    expect(acik.susler).toEqual(expect.arrayContaining(['muz', 'cikolata']));
    const hepsi = Array.from({ length: 60 }, (_, s) => gunPlani(2, acik, tohum(s + 1))).flat();
    expect(hepsi.some((p) => p.kalemler[0].sekil === 'ay')).toBe(true);
    expect(hepsi.some((p) => p.kalemler[0].renk === 'mor')).toBe(true);
    expect(acikOlanlar(1).susler).toEqual(['cilek']);
    expect(acikOlanlar(2).kapkek).toBe(false);
  });

  it('sıradaki müşteri: tezgâhta olan karakter ikinci kez gelmez', () => {
    const k = (m: string): Siparis => ({ musteri: m, kalemler: [] });
    expect(siradakiIndeks([k('tavsan'), k('can')], ['tavsan'])).toBe(1);
    expect(siradakiIndeks([k('tavsan')], ['tavsan'])).toBe(-1);
  });

  it('sipariş okunuşu parçalı: {sayı} {şekil} kurabiye, {renk} kremalı, {süs}lü!', () => {
    const k: Kalem = { urun: 'kurabiye', adet: 2, sekil: 'yildiz', renk: 'mavi', sus: 'cilek', susAdet: 1, yigin: 0 };
    expect(okuma({ musteri: 'ada', kalemler: [k] })).toEqual(['İki!', 'Yıldız kurabiye,', 'mavi kremalı,', 'çilekli!']);
    expect(okuma({ musteri: 'can', kalemler: [{ ...k, adet: 1, sus: null, susAdet: 0 }] })).toEqual(['Bir!', 'Yıldız kurabiye,', 'mavi kremalı!']);
    expect(okuma({ musteri: 'elif', kalemler: [{ urun: 'kapkek', adet: 1, sekil: null, renk: 'pembe', sus: null, susAdet: 0, yigin: 2 }] })).toEqual(['Bir!', 'Kapkek,', 'pembe kremalı!']);
  });
});

describe('karşılaştırma', () => {
  const k: Kalem = { urun: 'kurabiye', adet: 2, sekil: 'yildiz', renk: 'mavi', sus: 'cilek', susAdet: 1, yigin: 0 };
  it('tam aynıysa fark yok', () => {
    expect(karsilastir(k, aynisi(k))).toEqual([]);
    const kk: Kalem = { urun: 'kapkek', adet: 1, sekil: null, renk: 'pembe', sus: 'bal', susAdet: 1, yigin: 3 };
    expect(karsilastir(kk, aynisi(kk))).toEqual([]);
  });
  it('farklı olan şeyleri tek tek bulur', () => {
    const p = aynisi(k);
    expect(karsilastir(k, { ...p, sekil: 'kalp' })).toEqual(['sekil']);
    expect(karsilastir(k, { ...p, parcalar: p.parcalar.slice(0, 1) })).toEqual(['adet']);
    const renk = aynisi(k);
    renk.parcalar[1].renk = 'pembe';
    expect(karsilastir(k, renk)).toEqual(['renk']);
    const kremasiz = aynisi(k);
    kremasiz.parcalar[0].renk = null;
    expect(karsilastir(k, kremasiz)).toEqual(['renk']);
    const sus = aynisi(k);
    sus.parcalar[0].susler.push('cilek');
    expect(karsilastir(k, sus)).toEqual(['sus']);
    const baska = aynisi(k);
    baska.parcalar[1].susler = ['havuc'];
    expect(karsilastir(k, baska)).toEqual(['sus']);
    expect(karsilastir(k, null)).toEqual(['urun']);
    // kapkekte yığın sayısı
    const kk: Kalem = { urun: 'kapkek', adet: 1, sekil: null, renk: 'sari', sus: null, susAdet: 0, yigin: 2 };
    const az = aynisi(kk);
    az.parcalar[0].yigin.pop();
    expect(karsilastir(kk, az)).toEqual(['yigin']);
    expect(karsilastir(kk, aynisi(k))).toContain('urun');
  });
  it('çok kalemli siparişte parti aynı ürünün boş kalemine gider; sonuç kalem kalem', () => {
    const kur: Kalem = { ...k, adet: 1, sus: null, susAdet: 0 };
    const kap: Kalem = { urun: 'kapkek', adet: 1, sekil: null, renk: 'pembe', sus: null, susAdet: 0, yigin: 1 };
    const sip: Siparis = { musteri: 'can', kalemler: [kur, kap] };
    expect(kalemSec(sip, [null, null], aynisi(kap))).toBe(1);
    expect(kalemSec(sip, [null, null], aynisi(kur))).toBe(0);
    expect(kalemSec(sip, [null, aynisi(kap)], aynisi(kap))).toBe(0);
    expect(kalemSec(sip, [aynisi(kur), aynisi(kap)], aynisi(kap))).toBe(-1);
    expect(siparisSonucu(sip, [aynisi(kur), aynisi(kap)])).toEqual({ ayni: true, farklar: [[], []] });
    const r = siparisSonucu(sip, [aynisi(kur), { ...aynisi(kap), parcalar: [{ renk: null, yigin: ['mavi'], susler: [] }] }]);
    expect(r.ayni).toBe(false);
    expect(r.farklar).toEqual([[], ['renk']]);
  });
  it('teşekkür: sevdiği şey tabaktaysa onu söyler', () => {
    const havuclu: Parti = { urun: 'kurabiye', sekil: 'kalp', parcalar: [{ renk: 'pembe', yigin: [], susler: ['havuc'] }] };
    expect(tesekkur('tavsan', [havuclu])).toBe(P.musteri.tavsan[0]);
    expect(tesekkur('tavsan', [{ ...havuclu, parcalar: [{ renk: 'pembe', yigin: [], susler: [] }] }])).toBe(P.musteri.tavsan[1]);
    expect(tesekkur('ordek', [{ ...havuclu, parcalar: [{ renk: 'sari', yigin: [], susler: [] }] }])).toBe(P.musteri.ordek[0]);
  });
});

describe('fırın zamanlaması', () => {
  it('beyaz → altın ~6 sn → yanık 6 sn sonra', () => {
    expect(FIRIN).toEqual({ altin: 6000, yanik: 12000 });
    expect(firinHali(0)).toBe('cig');
    expect(firinHali(5999)).toBe('cig');
    expect(firinHali(6000)).toBe('altin');
    expect(firinHali(11999)).toBe('altin');
    expect(firinHali(12000)).toBe('yanik');
    expect(firinHali(500, { altin: 300, yanik: 900 })).toBe('altin');
  });
  it('renk geçişi: beyazdan altına, altından kahveye', () => {
    expect(pisme(0)).toBe(0);
    expect(pisme(3000)).toBeCloseTo(0.5);
    expect(pisme(6000)).toBe(1);
    expect(pisme(9000)).toBeCloseTo(1.5);
    expect(pisme(99999)).toBe(2);
    expect(hamurRengi(0).toLowerCase()).toBe(HAMUR_RENK.cig.toLowerCase());
    expect(hamurRengi(1).toLowerCase()).toBe(HAMUR_RENK.altin.toLowerCase());
    expect(hamurRengi(2).toLowerCase()).toBe(HAMUR_RENK.yanik.toLowerCase());
  });
});

describe('jeton', () => {
  it('aynıysa 3 jeton (+1 bahşiş hızlı servise), farklıysa 2; ret yok', () => {
    expect(jetonHesapla(true, 0.2, false)).toEqual({ jeton: 3, bahsis: 1 });
    expect(jetonHesapla(true, 0.9, false)).toEqual({ jeton: 3, bahsis: 0 });
    expect(jetonHesapla(true, 0.3, true)).toEqual({ jeton: 3, bahsis: 0 });
    expect(jetonHesapla(false, 0.1, false)).toEqual({ jeton: 2, bahsis: 0 });
  });
  it('akşam sayımı: 10a kadar tek tek, fazlası beşer beşer', () => {
    expect(sayim(3)).toEqual({ soz: ['Bir!', 'İki!', 'Üç!'], adim: [1, 1, 1] });
    const s = sayim(22);
    expect(s.soz).toEqual(['Beş!', 'On!', 'On beş!', 'Yirmi!']);
    expect(s.adim.reduce((a, b) => a + b, 0)).toBe(22);
    expect(sayim(24).adim.reduce((a, b) => a + b, 0)).toBe(24);
    expect(sayim(0)).toEqual({ soz: [], adim: [] });
  });
  it('dükkân rafı: jeton yeterse alınır, yetmezse alınmaz, iki kez alınmaz', () => {
    const c = { jeton: 6, alinan: [] as string[] };
    const sapka = RAF.find((r) => r.id === 'sapka')!;
    const boya = RAF.find((r) => r.id === 'boya-nane')!;
    expect(alinabilir(c, boya)).toBe(false);
    expect(satinAl(c, 'boya-nane')).toBe(false);
    expect(satinAl(c, 'sapka')).toBe(true);
    expect(c).toEqual({ jeton: 6 - sapka.fiyat, alinan: ['sapka'] });
    expect(satinAl(c, 'sapka')).toBe(false);
    expect(RAF.map((r) => r.tur)).toEqual(expect.arrayContaining(['sapka', 'kalip', 'sus', 'renk', 'boya']));
  });
});

describe('seslendirme', () => {
  const hepsi = new Set(tumCumleler());
  it('bütün parçalar ve cümleler listede, Kino cümleleri Kino sesinde', () => {
    for (let s = 1; s <= 20; s++)
      for (const g of [1, 2, 3] as const)
        for (const sip of gunPlani(g, acikOlanlar(g, ['kalip-ay', 'renk-mor', 'sus-muz', 'sus-cikolata']), tohum(s))) for (const p of okuma(sip)) expect(hepsi.has(normal(p)), p).toBe(true);
    for (let s = 1; s <= 20; s++)
      for (const g of [4, 5, 6] as const)
        for (const sip of gunPlani(g, acikOlanlar(g, [], acikYukseltmeler(0, g)), tohum(s))) for (const p of okuma(sip)) expect(hepsi.has(normal(p)), p).toBe(true);
    for (const t of duz(P.mino)) expect(hepsi.has(normal(t)), t).toBe(true);
    for (const t of duz(P.parca)) expect(hepsi.has(normal(t)), t).toBe(true);
    for (const t of P.parca.besli) expect(hepsi.has(t)).toBe(true);
    const kino = new Set(karakterCumleleri().kino);
    for (const t of duz(P.kino)) expect(kino.has(normal(t))).toBe(true);
  });
  it('cümleler kısa', () => {
    const metinler = [...duz(P.mino), ...duz(P.kino), ...duz(P.musteri), ...duz(P.parca)];
    for (const t of metinler) expect(t.length, t).toBeLessThanOrEqual(32);
  });
});
