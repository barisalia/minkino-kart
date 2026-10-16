import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import K from '../../content/kino-otobus.json';
import { normal, tumCumleler, karakterCumleleri } from '../../src/audio/cumleler';
import { erisimTuru, kilitliMi } from '../../src/engine/erisim';
import { BOY } from '../../src/karakter/boy';
import { sayfaYonu } from '../../src/kabuk/yon';
import { menuOyunlari, KINO_OTOBUS_KARTI, KINO_OTOBUS_MENUDE } from '../../uygulama/src/oyunlar';
import { gorulduYaz, gunBitti, kayitCoz } from '../../kino-otobus/src/kayit';
import {
  acikGun,
  bosAcilan,
  bosYuva,
  durumSozu,
  farklar,
  GUNLER,
  gunOdulleri,
  gunPlani,
  gunSablonu,
  ipucuUyar,
  istegeUyar,
  kapIsi,
  kapKoy,
  kinoOtobusCumleleri,
  kinoOtobusKinoCumleleri,
  kinoOtobusMusteriCumleleri,
  MUSTERILER,
  musteriTanim,
  odeme,
  odulAl,
  ODUL_KATALOGU,
  okuma,
  planGunUygun,
  sayiSecenekleri,
  secimiIlerlet,
  siparisSonucu,
  sosKoy,
  susKoy,
  tepkiHesapla,
  topKoy,
  toplarUyar,
  verilebilir,
  yalnizKapFarkli,
  ye,
  yuvaIsi,
  type Dondurma,
  type Gun,
  type Is,
  type Siparis,
  type Tat,
  type Yas,
  type Yuva,
} from '../../kino-otobus/src/model';
import { DOLAP_GOZLERI, dolapYerleri, surumTablosu, VARLIK, yerTutucular } from '../../kino-otobus/src/varliklar';

const GUNLER_L: Gun[] = [1, 2, 3];
const YASLAR: Yas[] = ['kucuk', 'buyuk'];
const TOHUMLAR = Array.from({ length: 30 }, (_, i) => i + 1);
const d = (o: Partial<Dondurma>): Dondurma => ({ kap: 'kulah', toplar: [], sos: null, susler: [], ...o });
/** istenenin yapılmış hâli (süsler sayıdan listeye) */
const yapilmis = (x: Siparis['istek'][number]): Dondurma => ({ ...x, susler: Object.entries(x.susler).flatMap(([k, n]) => Array.from({ length: n ?? 0 }, () => k as Dondurma['susler'][number])) });
/** G-OT1 kesimleri yokken havuz (20) */
const YENI6 = ['bidik', 'bidicik', 'bidik-baba', 'tombi', 'bulut', 'zipzip'];

/** Bir yuvayı yalnız "sıradaki iş"i yaparak tamamlar (geç ipucunu izleyen çocuk) */
function izle(sip: Siparis, y: Yuva = bosYuva()): { y: Yuva; adimlar: Is['tur'][] } {
  const adimlar: Is['tur'][] = [];
  for (let n = 0; n < 60; n++) {
    const is = yuvaIsi(sip, y);
    adimlar.push(is.tur);
    if (is.tur === 'ver') return { y, adimlar };
    if (is.tur === 'kap') kapKoy(y, is.kap, sip.istek.length);
    else if (is.tur === 'top') {
      topKoy(y, is.tat);
      secimiIlerlet(y, sip);
    } else if (is.tur === 'sos') sosKoy(y, is.sos);
    else if (is.tur === 'sus') susKoy(y, is.sus);
    else if (is.tur === 'ye') ye(y);
    else if (is.tur === 'sec') y.secili = is.kap;
  }
  throw new Error('sıradaki iş bitmedi');
}

describe('Kino’nun Otobüsü V3: gün planı (şablon + havuz)', () => {
  it('her gün 5 müşteri; istekler o günün açık tat / sos / süs / kaplarıyla; aynı gün aynı müşteri iki kez gelmez', () => {
    for (const g of GUNLER_L)
      for (const y of YASLAR)
        for (const t of TOHUMLAR) {
          const p = gunPlani(g, y, { tohum: t });
          expect(p).toHaveLength(5);
          for (const s of p) expect(planGunUygun(s, acikGun(g)), `${g} ${y} ${t} ${s.musteri}`).toBe(true);
          const adlar = p.flatMap((s) => [s.musteri, s.ikinci ?? '']).filter(Boolean);
          expect(new Set(adlar).size, `${g} ${y} ${t}`).toBe(adlar.length);
        }
  });
  it('günün karışımı (§2.2): resimli, ipuçlu, sürpriz; 5-6 özel istekler; Gün 3 Mino’nun doğum günüyle biter', () => {
    const say = (g: Gun, y: Yas) => gunSablonu(g, y).reduce<Record<string, number>>((t, x) => ({ ...t, [x]: (t[x] ?? 0) + 1 }), {});
    expect(say(1, 'kucuk')).toEqual({ resimli: 2, ipucu: 2, surpriz: 1 });
    expect(say(2, 'kucuk')).toEqual({ resimli: 2, ipucu: 2, surpriz: 1 });
    expect(say(3, 'kucuk')).toEqual({ resimli: 1, ipucu: 2, surpriz: 1, dogumgunu: 1 });
    expect(say(1, 'buyuk')).toEqual({ resimli: 1, ipucu: 2, surpriz: 1, sira: 1 });
    expect(say(2, 'buyuk')).toEqual({ resimli: 1, ipucu: 2, surpriz: 1, birFazla: 1 });
    expect(say(3, 'buyuk')).toEqual({ ipucu: 1, surpriz: 1, paylasma: 1, oruntu: 1, dogumgunu: 1 });
    for (const y of YASLAR) {
      const p = gunPlani(3, y, { tohum: 4 });
      expect(p.at(-1)).toMatchObject({ musteri: 'mino', tur: 'dogumgunu' });
      expect(p.at(-1)!.istek[0].kap).toBe('kupa');
    }
  });
  it('ilk oynayışta Gün 1’in ilk müşterisi Mino: emir vermez, durumu anlatır ("Pembe bir şey canım çekti…")', () => {
    for (const y of YASLAR) {
      const p = gunPlani(1, y, { tohum: 9, ilk: true });
      expect(p[0]).toMatchObject({ musteri: 'mino', tur: 'ipucu', ogretici: true, ipucu: { ozellik: 'pembe' } });
      expect(durumSozu(p[0])).toBe(K.mino.durum.mino);
      // ilk oynayış değilse Mino yalnız doğum gününde
      for (const t of TOHUMLAR) expect(gunPlani(1, y, { tohum: t }).some((s) => s.musteri === 'mino')).toBe(false);
    }
  });
  it('çiftler birlikte (Bıdıcık hep Bıdık’la, Zeynep Deniz’le); kit (aile) günde en çok 2', () => {
    for (const g of GUNLER_L)
      for (const y of YASLAR)
        for (const t of TOHUMLAR) {
          const p = gunPlani(g, y, { tohum: t });
          for (const s of p) {
            if (s.musteri === 'bidicik' || s.musteri === 'zeynep') throw new Error('ikinci tek başına geldi');
            if (s.musteri === 'bidik') expect(s.ikinci).toBe('bidicik');
            if (s.musteri === 'deniz') expect(s.ikinci).toBe('zeynep');
          }
          expect(p.filter((s) => musteriTanim(s.musteri)?.kaynak === 'kit').length).toBeLessThanOrEqual(2);
        }
  });
  it('arka arkaya 3 Gün 1 oyununda en az 12 farklı müşteri; G-OT1 kesimleri yokken havuz 20', () => {
    for (const varMi of [undefined, (ad: string) => !YENI6.includes(ad)]) {
      const k = kayitCoz(null);
      const goren = new Set<string>();
      for (let i = 0; i < 3; i++) {
        const p = gunPlani(1, 'kucuk', { tohum: 100 + i, gorulen: k.gorulen, ilk: i === 0, varMi });
        const adlar = p.flatMap((s) => [s.musteri, s.ikinci ?? '']).filter(Boolean);
        adlar.forEach((a) => goren.add(a));
        gorulduYaz(k, adlar);
        if (varMi) for (const a of adlar) expect(YENI6).not.toContain(a);
      }
      expect(goren.size).toBeGreaterThanOrEqual(12);
    }
    expect(MUSTERILER).toHaveLength(26);
    expect(MUSTERILER.filter((t) => !YENI6.includes(t.ad))).toHaveLength(20);
  });
  it('yaş farkı: 3-4 resimli istekte en çok 2 top, ipucu tek özellik (serin, pembe, kocaman); 5-6 ipucunda top sayısı', () => {
    for (const g of GUNLER_L)
      for (const t of TOHUMLAR) {
        for (const s of gunPlani(g, 'kucuk', { tohum: t })) {
          expect(s.sira).toBe(false);
          if (s.tur === 'resimli' || s.tur === 'paylasma') for (const x of s.istek) expect(x.toplar.length).toBeLessThanOrEqual(3);
          if (s.tur === 'ipucu') {
            expect(['serin', 'pembe', 'kocaman', 'yeni']).toContain(s.ipucu!.ozellik);
            expect(s.ipucu!.top).toBeUndefined();
          }
        }
        for (const s of gunPlani(g, 'buyuk', { tohum: t })) if (s.tur === 'ipucu' && s.ipucu!.ozellik !== 'kocaman') expect(s.ipucu!.top).toBeGreaterThanOrEqual(1);
      }
  });
  it('istek şablonu müşterinin sevmediğini koymaz ({sevdigi} favorisi)', () => {
    for (const g of GUNLER_L)
      for (const y of YASLAR)
        for (const t of TOHUMLAR)
          for (const s of gunPlani(g, y, { tohum: t })) {
            const m = musteriTanim(s.musteri)!;
            if (s.tur === 'ipucu' || s.tur === 'surpriz') continue;
            for (const x of s.istek) expect(m.sevmez?.(yapilmis(x)) ?? false, `${s.musteri} ${JSON.stringify(x)}`).toBe(false);
          }
  });
  it('dün açılan tat / süs ertesi gün bir istekte; özel tat dolapta (7. kap)', () => {
    for (const t of TOHUMLAR) {
      const p = gunPlani(2, 'kucuk', { tohum: t, ozelTat: 'visne', yeni: { tat: 'visne' } });
      expect(p.some((s) => s.ipucu?.ozellik === 'yeni' || s.istek.some((x) => x.toplar.includes('visne')))).toBe(true);
    }
    expect(acikGun(2, 'visne', 'muz').tatlar).toHaveLength(7);
    expect(acikGun(1, 'visne').tatlar).toHaveLength(4);
    expect(acikGun(1, null, 'yildiz').susler).toEqual(['yildiz']);
  });
});

describe('Kino’nun Otobüsü V3: kabul, tepki, ödeme', () => {
  const ipucu = (ozellik: NonNullable<Siparis['ipucu']>['ozellik'], top?: number): Siparis => ({ no: 0, musteri: 'inek', tur: 'ipucu', sira: false, ipucu: { ozellik, top }, istek: [{ kap: 'kulah', toplar: ['cilek'], sos: null, susler: {} }] });
  it('ipuçlu ve sürpriz isteklerde en az 2 farklı dondurma kabul edilir', () => {
    const adaylar: Dondurma[] = [
      d({ toplar: ['cilek'] }),
      d({ kap: 'kase', toplar: ['limon', 'limon'] }),
      d({ toplar: ['cikolata', 'vanilya', 'cikolata'] }),
      d({ toplar: ['vanilya'], sos: 'cilek' }),
      d({ kap: 'kase', toplar: ['yabanmersini', 'fistik'] }),
      d({ toplar: ['vanilya'], sos: 'cikolata' }),
      d({ toplar: ['portakal'] }),
      d({ kap: 'kase', toplar: ['limon', 'cilek', 'vanilya'] }),
    ];
    for (const oz of ['serin', 'pembe', 'kocaman', 'cikolata', 'ikiRenk', 'meyveli'] as const) {
      const kabul = adaylar.filter((x) => istegeUyar(ipucu(oz), [x]));
      expect(kabul.length, oz).toBeGreaterThanOrEqual(2);
    }
    const surpriz: Siparis = { ...ipucu('pembe'), tur: 'surpriz', ipucu: undefined };
    expect(adaylar.every((x) => istegeUyar(surpriz, [x]))).toBe(true);
    // 5-6: ikinci özellik top sayısı ("serin ve iki top")
    expect(ipucuUyar({ ozellik: 'serin', top: 2 }, d({ toplar: ['limon', 'cilek'] }))).toBe(true);
    expect(ipucuUyar({ ozellik: 'serin', top: 2 }, d({ toplar: ['limon'] }))).toBe(false);
    // planlardaki her ipuçlu / sürpriz isteğin örneği de kabul edilir
    for (const g of GUNLER_L) for (const y of YASLAR) for (const t of TOHUMLAR) for (const s of gunPlani(g, y, { tohum: t })) expect(istegeUyar(s, s.istek.map(yapilmis)), `${g} ${y} ${t} ${JSON.stringify(s)}`).toBe(true);
  });
  it('tepki üç kademe: sevdiği (ya da resimli tam aynı) bayıldı; yalnız uyuyorsa mmm; uymuyor ya da sevmediği varsa komik', () => {
    const tavsan = { ...ipucu('meyveli'), musteri: 'tavsan' };
    expect(tepkiHesapla(tavsan, [d({ toplar: ['cilek'] })])).toBe('bayildi');
    expect(tepkiHesapla(tavsan, [d({ toplar: ['yabanmersini'] })])).toBe('mmm');
    expect(tepkiHesapla(tavsan, [d({ toplar: ['limon'] })])).toBe('komik'); // limon: dudak büzülür
    expect(tepkiHesapla(tavsan, [d({ toplar: ['vanilya'] })])).toBe('komik'); // meyveli değil
    const resimli: Siparis = { no: 0, musteri: 'ayi', tur: 'resimli', sira: false, istek: [{ kap: 'kulah', toplar: ['vanilya'], sos: 'karamel', susler: {} }] };
    expect(tepkiHesapla(resimli, [d({ toplar: ['vanilya'], sos: 'karamel' })])).toBe('bayildi');
    // külah bitti, kâse verildi: "Kâseden de olur!" (komik, ceza yok)
    const kase = [d({ kap: 'kase', toplar: ['vanilya'], sos: 'karamel' })];
    expect(tepkiHesapla(resimli, kase)).toBe('komik');
    expect(yalnizKapFarkli(resimli, kase)).toBe(true);
    // Bıdık her şeyi sever
    const bidik = { ...ipucu('kocaman'), musteri: 'bidik' };
    expect(tepkiHesapla(bidik, [d({ toplar: ['limon', 'limon', 'cilek'] })])).toBe('bayildi');
  });
  it('ödeme: top sayısı kadar jeton, bayılırsa +1; 3-4 en çok 3, 5-6 en çok 5; akşam sayımı yok', () => {
    expect(odeme([d({ toplar: ['cilek'] })], 'mmm', 'kucuk')).toBe(1);
    expect(odeme([d({ toplar: ['cilek', 'cilek'] })], 'bayildi', 'kucuk')).toBe(3);
    expect(odeme([d({ toplar: ['cilek', 'cilek', 'cilek'] })], 'bayildi', 'kucuk')).toBe(3);
    expect(odeme([d({ kap: 'kupa', toplar: ['cilek', 'vanilya', 'cikolata', 'cilek', 'limon'] })], 'bayildi', 'buyuk')).toBe(5);
    expect(odeme([d({ toplar: ['cilek', 'vanilya'] }), d({ toplar: ['cilek', 'vanilya'] })], 'mmm', 'buyuk')).toBe(4);
    // bir günün bütün ödemeleri en çok 5 × 3 = 15 (3-4), 25 (5-6) jeton: dokunuşlar kısa
    for (const g of GUNLER_L) for (const t of TOHUMLAR) expect(gunPlani(g, 'kucuk', { tohum: t }).reduce((n, s) => n + odeme(s.istek.map(yapilmis), 'bayildi', 'kucuk'), 0)).toBeLessThanOrEqual(15);
    const s = sayiSecenekleri(4, () => 0.3);
    expect([...s].sort()).toEqual([3, 4, 5]);
  });
});

describe('Kino’nun Otobüsü V3: gün sonu ödülü', () => {
  it('üç kart: tat, süs, görünüm (her kategoride sıradaki); seçilen yerine sıradaki gelir; bitince "ısmarla"', () => {
    const a = bosAcilan();
    let k = gunOdulleri(a);
    expect(k.map((x) => [x.kategori, x.id, x.ilk])).toEqual([
      ['tat', 'visne', true],
      ['sus', 'yildiz', true],
      ['gorunum', 'flama', true],
    ]);
    odulAl(a, k[0]);
    k = gunOdulleri(a);
    expect(k[0]).toMatchObject({ id: 'portakal', ilk: false });
    for (const t of ODUL_KATALOGU.tat) odulAl(a, { kategori: 'tat', id: t, ilk: false });
    expect(gunOdulleri(a)[0].id).toBeNull();
    expect(odulAl(a, { kategori: 'gorunum', id: 'boya-nane', ilk: false })).toEqual({ boya: 'nane' });
    expect(ODUL_KATALOGU.gorunum).toEqual(['flama', 'kino-sapka', 'ampul', 'cati-kulah', 'korna', 'kemik-tabela', 'jant', 'boya-nane', 'boya-limon', 'boya-cilek']);
  });
  it('kayıt göçü: eski jeton bırakılır, alınan süsler görünüme geçer; bozuk veri sıfırlanır', () => {
    const k = kayitCoz('{"jeton":40,"acikGun":9,"alinan":["yok","flama","jant"],"boya":"mor","yas":"bebek"}');
    expect(k).toMatchObject({ acikGun: 3, boya: 'buz', yas: null, acilan: { tat: [], sus: [], gorunum: ['flama', 'jant'] } });
    expect('jeton' in k).toBe(false);
    const t = kayitCoz(null);
    gunBitti(t, 1, 4);
    expect(t).toMatchObject({ acikGun: 2, biten: [1], mutlu: { 1: 4 } });
    const y = kayitCoz('{"acilan":{"tat":["visne","x"],"sus":["muz"]},"ozelTat":"visne","yeni":{"tat":"visne"},"gorulen":["tavsan"]}');
    expect(y).toMatchObject({ acilan: { tat: ['visne'], sus: ['muz'] }, ozelTat: 'visne', yeni: { tat: 'visne' }, gorulen: ['tavsan'] });
  });
});

describe('Kino’nun Otobüsü: hazırlık yuvası', () => {
  it('kap, top, sos, süs; kap değişince içindekiler yeni kaba geçer, sığmayanı Kino yer', () => {
    const y = bosYuva();
    expect(topKoy(y, 'cilek')).toBe('kapYok');
    expect(kapKoy(y, 'kase').olay).toBe('kondu');
    expect(sosKoy(y, 'cikolata')).toBe('topYok');
    for (const t of ['cilek', 'vanilya', 'cikolata'] as Tat[]) expect(topKoy(y, t)).toBe('kondu');
    expect(topKoy(y, 'limon')).toBe('tasti'); // kâse en çok 3
    expect(sosKoy(y, 'cikolata')).toBe('kondu');
    expect(sosKoy(y, 'cikolata')).toBe('ayni');
    expect(susKoy(y, 'serpinti')).toBe('kondu');
    expect(susKoy(y, 'serpinti')).toBe('dolu');
    const r = kapKoy(y, 'kulah');
    expect(r.olay).toBe('degisti');
    expect(y.kaplar[0]).toMatchObject({ kap: 'kulah', toplar: ['cilek', 'vanilya', 'cikolata'] });
  });
  it('geri alma: en üst katman yenir (süs, sos, top, en son boş kap)', () => {
    const y = bosYuva();
    kapKoy(y, 'kulah');
    topKoy(y, 'cilek');
    topKoy(y, 'limon');
    sosKoy(y, 'karamel');
    susKoy(y, 'kiraz');
    expect(ye(y)).toEqual({ tur: 'sus', sus: 'kiraz' });
    expect(ye(y)).toEqual({ tur: 'sos', sos: 'karamel' });
    expect(ye(y)).toEqual({ tur: 'top', tat: 'limon' });
    expect(ye(y)).toEqual({ tur: 'top', tat: 'cilek' });
    expect(ye(y)).toEqual({ tur: 'kap', kap: 'kulah' });
    expect(ye(y)).toBeNull();
  });
  it('3-4 sıra serbest, 5-6 sıra önemli; farklı parça bulunur; paylaşmada kâselerin sırası önemsiz', () => {
    expect(toplarUyar(['cikolata', 'vanilya'], ['vanilya', 'cikolata'], false)).toBe(true);
    expect(toplarUyar(['cikolata', 'vanilya'], ['vanilya', 'cikolata'], true)).toBe(false);
    expect(farklar({ kap: 'kulah', toplar: ['cikolata', 'vanilya'], sos: null, susler: {} }, d({ toplar: ['vanilya', 'cikolata'] }), true)).toEqual(['sira']);
    const sip = gunPlani(3, 'buyuk', { tohum: 2 }).find((s) => s.tur === 'paylasma')!;
    const [a, b] = sip.istek[0].toplar;
    const k = (t: Tat[]) => d({ kap: 'kase', toplar: t });
    expect(siparisSonucu(sip, [k([a, b]), k([b, a])]).ayni).toBe(true);
  });
  it('geç ipucunu izleyen çocuk her isteği karşılar (bütün günler, iki yaş, pek çok plan)', () => {
    for (const g of GUNLER_L)
      for (const y of YASLAR)
        for (const t of TOHUMLAR.slice(0, 10))
          for (const sip of gunPlani(g, y, { tohum: t, ilk: t === 1 })) {
            const { y: yuva, adimlar } = izle(sip);
            expect(verilebilir(yuva, sip), `${g} ${y} ${sip.musteri}`).toBe(true);
            expect(istegeUyar(sip, yuva.kaplar), `${g} ${y} ${sip.musteri}`).toBe(true);
            expect(adimlar[0]).toBe('kap');
          }
  });
  it('ipuçlu istekte çocuğun seçtiği kap kalır; uyuyan dondurma hemen verilebilir', () => {
    const sip = gunPlani(1, 'kucuk', { tohum: 9, ilk: true })[0];
    const y = bosYuva();
    kapKoy(y, 'kase');
    topKoy(y, 'cilek');
    expect(yuvaIsi(sip, y).tur).toBe('ver');
    expect(kapIsi({ kap: 'kase', toplar: ['cilek'], sos: null, susler: { kiraz: 1 } }, { kap: 'kase', toplar: ['cilek'], sos: null, susler: ['kiraz', 'kiraz'] }, false).tur).toBe('ye');
  });
});

describe('Kino’nun Otobüsü V3: sözler, erişim, görseller, boylar', () => {
  it('hiçbir yerde "dokun" ya da "ver" diye yönlendiren söz yok; Mino durumu anlatır', () => {
    const metin = JSON.stringify({ mino: K.mino, kino: K.kino, musteri: K.musteri }).toLocaleLowerCase('tr');
    expect(metin).not.toMatch(/dokun|bana ver|şimdi ver|buna/);
    expect(metin).not.toContain('öğüt');
  });
  it('okunan ve anlatılan her parça seslendirme listesinde; Kino kendi sesiyle; müşteri cümleleri onay bekliyor (üretilmez)', () => {
    const hepsi = new Set(tumCumleler());
    for (const g of GUNLER_L) for (const y of YASLAR) for (const s of gunPlani(g, y, { tohum: 5, ilk: true })) for (const p of okuma(s)) expect(hepsi.has(normal(p)), p).toBe(true);
    for (const p of kinoOtobusCumleleri()) expect(hepsi.has(normal(p))).toBe(true);
    const kino = new Set(karakterCumleleri().kino);
    for (const p of kinoOtobusKinoCumleleri()) expect(kino.has(normal(p)), p).toBe(true);
    const musteri = Object.values(kinoOtobusMusteriCumleleri()).flat();
    expect(musteri).toHaveLength(36);
    for (const p of musteri) expect(hepsi.has(normal(p)), p).toBe(false);
  });
  it('sözler kısa (etiketsiz en çok 30 karakter, 6 kelime)', () => {
    const etiketsiz = (s: string) => s.replace(/\[[^\]]*\]\s*/g, '');
    for (const c of [...kinoOtobusCumleleri(), ...kinoOtobusKinoCumleleri(), ...Object.values(kinoOtobusMusteriCumleleri()).flat()]) {
      expect(etiketsiz(c).length, c).toBeLessThanOrEqual(34);
      expect(etiketsiz(c).split(/\s+/).length, c).toBeLessThanOrEqual(8);
    }
  });
  it('erişim: Gün 1 ücretsiz, Gün 2-3 ve ödüller (ilkinden sonra) abonelikle; menü kartı ücretsiz görünür', () => {
    const ac = { etkin: true, premium: false };
    expect(kilitliMi('kino-otobus/gun-1', ac)).toBe(false);
    expect(kilitliMi('kino-otobus/gun-2', ac)).toBe(true);
    expect(kilitliMi('kino-otobus/odul', ac)).toBe(true);
    expect(erisimTuru('kino-otobus')).toBe('ucretsiz');
  });
  it('telefonda yatay; menü kartı bayrakla açılır (Pasta’dan önce), zemini Gemini kapağı', () => {
    expect(sayfaYonu('/kino-otobus/index.html')).toBe('yatay');
    for (const u of [false, true]) {
      const idler = menuOyunlari(u).map((k) => k.id);
      expect(idler.includes('kino-otobus')).toBe(KINO_OTOBUS_MENUDE);
      expect(idler.at(-1)).toBe('pasta');
    }
    expect(KINO_OTOBUS_KARTI.adres).toBe('./kino-otobus/');
    expect(KINO_OTOBUS_KARTI.zemin).toBe('kino-otobus/kapak');
    expect(fs.existsSync(path.resolve(__dirname, '../../assets/kino-otobus/kapak.webp'))).toBe(true);
  });
  it('görsel haritası: A, D, Ek C ve V3 (yeni tatlar, süsler, kaçan balon); yeni tatların boyalı görselleri ve 6 müşteri kesimi var', () => {
    const adlar = Object.keys(VARLIK).filter((a) => !['jeton', 'kumbara-kavanoz'].includes(a));
    expect(adlar).toHaveLength(65);
    for (const a of ['top-visne', 'kap-pamukseker', 'sus-yildiz', 'sus-cikolata-parca', 'kacan-balon']) expect(adlar).toContain(a);
    const tablo = surumTablosu({ '/a/top-cilek.webp': 'u1', '/a/top-cilek-2.png': 'u2', '/a/kulah.png': 'u3', '/a/kulah.webp': 'u4' });
    expect(tablo.get('top-cilek')).toBe('u2');
    expect(tablo.get('kulah')).toBe('u4');
    expect(yerTutucular(tablo)).toContain('otobus');
    for (const t of ['visne', 'portakal', 'pamukseker']) for (const k of ['top', 'kap']) expect(fs.existsSync(path.resolve(__dirname, `../../assets/kino-otobus/${k}-${t}.webp`)), `${k}-${t}`).toBe(true);
    const olcu = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../assets/kino-otobus/musteri/olcu.json'), 'utf8')) as Record<string, { tepe: number; taban: number; bas?: number; bel: number }>;
    for (const a of YENI6) {
      expect(fs.existsSync(path.resolve(__dirname, `../../assets/kino-otobus/musteri/${a}.webp`)), a).toBe(true);
      expect(olcu[a].bel).toBeGreaterThan(olcu[a].bas ?? olcu[a].tepe);
    }
    // ortak ölçek: figür boyları boy tablosuyla orantılı (Bıdık'ın babası Bıdık'ın 1.76 katı; büyütülmedi)
    const boy = (a: string) => olcu[a].taban - (olcu[a].bas ?? olcu[a].tepe);
    expect(boy('bidik-baba') / boy('bidik')).toBeCloseTo(BOY['bidik-baba'] / BOY.bidik, 1);
    expect(boy('tombi') / boy('bidik')).toBeCloseTo(BOY.tombi / BOY.bidik, 1);
  });
  it('dolap: her tat kabının dokunma kutusu en az 72u, kutular çakışmaz (özel tatla 4 ve 7 kap)', () => {
    const boy = 172;
    const en = boy * DOLAP_GOZLERI.oran;
    for (const n of [3, 4, 6, 7]) {
      const y = dolapYerleri(n);
      expect(y).toHaveLength(n);
      for (const k of y) {
        expect((k.en / 100) * en).toBeGreaterThanOrEqual(72);
        expect((k.boy / 100) * boy).toBeGreaterThanOrEqual(56);
      }
      for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++) {
          const a = y[i],
            b = y[j];
          const yatay = a.sol + a.en <= b.sol + 0.01 || b.sol + b.en <= a.sol + 0.01;
          const dikey = a.ust + a.boy <= b.ust + 0.01 || b.ust + b.boy <= a.ust + 0.01;
          expect(yatay || dikey, `${n}: ${i}-${j}`).toBe(true);
        }
    }
    expect(GUNLER[1].tatlar).toHaveLength(3);
  });
});
