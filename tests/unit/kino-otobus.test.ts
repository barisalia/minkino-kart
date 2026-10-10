import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import K from '../../content/kino-otobus.json';
import { normal, tumCumleler, karakterCumleleri } from '../../src/audio/cumleler';
import { erisimTuru, kilitliMi } from '../../src/engine/erisim';
import { sayfaYonu } from '../../src/kabuk/yon';
import { menuOyunlari, KINO_OTOBUS_KARTI, KINO_OTOBUS_MENUDE } from '../../uygulama/src/oyunlar';
import { gunBitti, kayitCoz } from '../../kino-otobus/src/kayit';
import {
  bosYuva,
  dukkan,
  farklar,
  GUNLER,
  gunPlani,
  jetonHesapla,
  kapIsi,
  kapKoy,
  kinoOtobusCumleleri,
  kinoOtobusKinoCumleleri,
  okuma,
  OTOBUS_SUSLERI,
  planGunUygun,
  satinAl,
  sayim,
  secimiIlerlet,
  siparisSonucu,
  sosKoy,
  susKoy,
  topKoy,
  toplarUyar,
  verilebilir,
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

/** Bir yuvayı yalnız "sıradaki iş"i yaparak tamamlar (oyunun parlattığı yolu izleyen çocuk) */
function izle(sip: Siparis, y: Yuva = bosYuva(), acik: readonly Tat[] = GUNLER[3].tatlar): { y: Yuva; adimlar: Is['tur'][] } {
  const adimlar: Is['tur'][] = [];
  for (let n = 0; n < 60; n++) {
    const is = yuvaIsi(sip, y, acik);
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

describe('Kino’nun Otobüsü: gün planı', () => {
  it('her gün 5 müşteri, ekranda en çok 2; istekler o günün açık tat / sos / süs / kaplarıyla', () => {
    for (const g of GUNLER_L)
      for (const y of YASLAR) {
        const p = gunPlani(g, y);
        expect(p).toHaveLength(5);
        for (const s of p) expect(planGunUygun(s, g), `${g} ${y} ${s.musteri}`).toBe(true);
      }
  });
  it('Gün 1 Mino’yla başlar (öğretici); Gün 3 Mino’nun doğum günüyle biter', () => {
    for (const y of YASLAR) {
      expect(gunPlani(1, y)[0]).toMatchObject({ musteri: 'mino', tur: 'ogretici' });
      expect(gunPlani(3, y).at(-1)).toMatchObject({ musteri: 'mino', tur: 'dogumgunu' });
      expect(gunPlani(3, y).at(-1)!.istek[0].kap).toBe('kupa');
    }
  });
  it('yaş farkı top sayısında, sırada ve örüntüde: 3-4 en çok 3 top ve sıra serbest; örüntü ve bir fazla yalnız 5-6', () => {
    for (const g of GUNLER_L) {
      const k = gunPlani(g, 'kucuk');
      for (const s of k) {
        expect(s.sira).toBe(false);
        expect(['oruntu', 'birFazla']).not.toContain(s.tur);
        for (const d of s.istek) expect(d.toplar.length).toBeLessThanOrEqual(3);
      }
    }
    const turler = GUNLER_L.flatMap((g) => gunPlani(g, 'buyuk').map((s) => s.tur));
    expect(turler).toEqual(expect.arrayContaining(['oruntu', 'birFazla', 'sira', 'paylasma', 'sicak', 'ayni']));
    // Gün 3 (5-6): kupada 4 top
    expect(Math.max(...gunPlani(3, 'buyuk').flatMap((s) => s.istek.map((d) => d.toplar.length)))).toBeGreaterThanOrEqual(4);
  });
  it('3-4 ayarı içerik kesmez: aynı günde aynı tatlar ve süsler açık', () => {
    for (const g of GUNLER_L) expect(GUNLER[g].tatlar.length).toBe(g === 1 ? 3 : 6);
    expect(GUNLER[1].susler).toEqual([]);
    expect(GUNLER[3].kaplar).toContain('kupa');
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
    expect(r.tasan).toEqual([]);
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
  it('paylaşma: ikinci kâse yanına gelir; seçili kap tamamlanınca seçim öbürüne geçer', () => {
    const sip = gunPlani(3, 'kucuk').find((s) => s.tur === 'paylasma')!;
    const y = bosYuva();
    kapKoy(y, 'kase', 2);
    expect(kapKoy(y, 'kase', 2).olay).toBe('eklendi');
    expect(y.kaplar).toHaveLength(2);
    y.secili = 0;
    topKoy(y, 'cilek');
    expect(secimiIlerlet(y, sip)).toBe(true);
    expect(y.secili).toBe(1);
  });
});

describe('Kino’nun Otobüsü: kontrol', () => {
  const d = (o: Partial<Dondurma>): Dondurma => ({ kap: 'kulah', toplar: [], sos: null, susler: [], ...o });
  it('3-4 sıra serbest, 5-6 sıra önemli; sıcak günde limon ya da çilek', () => {
    expect(toplarUyar(['cikolata', 'vanilya'], ['vanilya', 'cikolata'], false)).toBe(true);
    expect(toplarUyar(['cikolata', 'vanilya'], ['vanilya', 'cikolata'], true)).toBe(false);
    expect(toplarUyar(['serin', 'serin'], ['cilek', 'limon'], false)).toBe(true);
    expect(toplarUyar(['serin'], ['vanilya'], false)).toBe(false);
    expect(farklar({ kap: 'kulah', toplar: ['cikolata', 'vanilya'], sos: null, susler: {} }, d({ toplar: ['vanilya', 'cikolata'] }), true)).toEqual(['sira']);
  });
  it('farklı olan parça bulunur; jeton aynıysa 3, farklıysa 2 (ret yok)', () => {
    const sip = gunPlani(1, 'kucuk')[2]; // ayı: kâse, çikolata, çikolata sos
    expect(siparisSonucu(sip, [d({ kap: 'kase', toplar: ['cikolata'], sos: 'cikolata' })]).ayni).toBe(true);
    const f = siparisSonucu(sip, [d({ kap: 'kulah', toplar: ['cikolata'] })]);
    expect(f.ayni).toBe(false);
    expect(f.farklar[0]).toEqual(['kap', 'sos']);
    expect(jetonHesapla(true)).toBe(3);
    expect(jetonHesapla(false)).toBe(2);
  });
  it('paylaşmada kâselerin sırası önemsiz', () => {
    const sip = gunPlani(3, 'buyuk').find((s) => s.tur === 'paylasma')!;
    const k = (t: Tat[]) => d({ kap: 'kase', toplar: t });
    expect(siparisSonucu(sip, [k(['cilek', 'vanilya']), k(['vanilya', 'cilek'])]).ayni).toBe(true);
    expect(siparisSonucu(sip, [k(['cilek', 'cilek']), k(['vanilya', 'vanilya'])]).ayni).toBe(false);
  });
});

describe('Kino’nun Otobüsü: sıradaki iş (parlayanı izleyen çocuk her isteği tam yapar)', () => {
  it('bütün günler, iki yaş: yalnız parlayan işle her sipariş tam aynı olur', () => {
    for (const g of GUNLER_L)
      for (const y of YASLAR)
        for (const sip of gunPlani(g, y)) {
          const { y: yuva, adimlar } = izle(sip, bosYuva(), GUNLER[g].tatlar);
          expect(verilebilir(yuva, sip), `${g} ${y} ${sip.musteri}`).toBe(true);
          expect(siparisSonucu(sip, yuva.kaplar).ayni, `${g} ${y} ${sip.musteri}`).toBe(true);
          expect(adimlar[0]).toBe('kap');
        }
  });
  it('yanlış top varsa önce "ye" (Kino yer), sonra doğrusu', () => {
    const sip = gunPlani(1, 'buyuk')[4]; // sıra: altta çikolata, üstte vanilya
    const y = bosYuva();
    kapKoy(y, 'kulah');
    topKoy(y, 'vanilya');
    expect(yuvaIsi(sip, y).tur).toBe('ye');
    const { y: son } = izle(sip, y);
    expect(siparisSonucu(sip, son.kaplar).ayni).toBe(true);
  });
  it('fazla süs ve istenmeyen sos da yenir', () => {
    const ist = { kap: 'kase' as const, toplar: ['cilek' as Tat], sos: null, susler: { kiraz: 1 } };
    expect(kapIsi(ist, { kap: 'kase', toplar: ['cilek'], sos: null, susler: ['kiraz', 'kiraz'] }, false).tur).toBe('ye');
    expect(kapIsi(ist, { kap: 'kase', toplar: ['cilek'], sos: 'cilek', susler: ['kiraz'] }, false).tur).toBe('ye');
    expect(kapIsi(ist, { kap: 'kase', toplar: ['cilek'], sos: null, susler: ['kiraz'] }, false).tur).toBe('ver');
  });
});

describe('Kino’nun Otobüsü: akşam', () => {
  it('3-4 tek tek (ona kadar), 5-6 beşer sayar; jeton kaybolmaz', () => {
    expect(sayim(4, 'kucuk')).toEqual({ soz: ['Bir!', 'İki!', 'Üç!', 'Dört!'], adim: [1, 1, 1, 1] });
    const k = sayim(13, 'kucuk');
    expect(k.soz).toHaveLength(10);
    expect(k.adim.reduce((a, b) => a + b, 0)).toBe(13);
    const b = sayim(15, 'buyuk');
    expect(b.soz).toEqual(['Beş!', 'On!', 'On beş!']);
    expect(sayim(12, 'buyuk').adim).toEqual([5, 5, 2]);
  });
  it('süs dükkânı: 8 çeşit (3 boya ayrı), fiyatlar en çok 10, ilk ikisi ücretsiz; jeton yetmezse alınmaz', () => {
    expect(new Set(OTOBUS_SUSLERI.map((s) => s.tur)).size).toBe(8);
    expect(OTOBUS_SUSLERI.every((s) => s.fiyat >= 1 && s.fiyat <= 10)).toBe(true);
    expect(OTOBUS_SUSLERI.filter((s) => s.ucretsiz).map((s) => s.id)).toEqual(['kemik-tabela', 'flama']);
    expect(dukkan(1).map((s) => s.id)).toEqual(['kemik-tabela', 'flama']);
    expect(dukkan(3)).toHaveLength(OTOBUS_SUSLERI.length);
    const k = { jeton: 5, alinan: [] as string[] };
    expect(satinAl(k, 'flama')).toBe(false);
    expect(satinAl(k, 'kemik-tabela')).toBe(true);
    expect(k).toEqual({ jeton: 0, alinan: ['kemik-tabela'] });
    expect(satinAl(k, 'kemik-tabela')).toBe(false);
  });
  it('kayıt: bozuk veri sıfırlanır; gün bitince jeton yazılır ve sonraki gün açılır', () => {
    const k = kayitCoz('{"jeton":"x","acikGun":9,"alinan":["yok","flama"],"boya":"mor","yas":"bebek"}');
    expect(k).toMatchObject({ jeton: 0, acikGun: 3, alinan: ['flama'], boya: 'buz', yas: null });
    const t = kayitCoz(null);
    gunBitti(t, 1, 14, 4);
    expect(t).toMatchObject({ jeton: 14, acikGun: 2, biten: [1], mutlu: { 1: 4 } });
  });
});

describe('Kino’nun Otobüsü: sözler, erişim, görseller', () => {
  it('okunan her parça seslendirme listesinde; Kino’nun sözleri kendi sesiyle de', () => {
    const hepsi = new Set(tumCumleler());
    for (const g of GUNLER_L) for (const y of YASLAR) for (const s of gunPlani(g, y)) for (const p of okuma(s)) expect(hepsi.has(normal(p)), p).toBe(true);
    for (const p of kinoOtobusCumleleri()) expect(hepsi.has(normal(p))).toBe(true);
    const kino = new Set(karakterCumleleri().kino);
    for (const p of kinoOtobusKinoCumleleri()) expect(kino.has(normal(p)), p).toBe(true);
  });
  it('sözler kısa (en çok 8 kelime) ve "öğüt" kelimesi yok', () => {
    for (const c of [...kinoOtobusCumleleri(), ...kinoOtobusKinoCumleleri()]) {
      expect(c.split(/\s+/).length, c).toBeLessThanOrEqual(8);
      expect(c.length, c).toBeLessThanOrEqual(34);
    }
    expect(JSON.stringify(K).toLocaleLowerCase('tr')).not.toContain('öğüt');
  });
  it('erişim: Gün 1 ücretsiz, Gün 2-3 ve süsler abonelikle; menü kartı (açılınca) ücretsiz görünür', () => {
    const ac = { etkin: true, premium: false };
    expect(kilitliMi('kino-otobus/gun-1', ac)).toBe(false);
    expect(kilitliMi('kino-otobus/gun-2', ac)).toBe(true);
    expect(kilitliMi('kino-otobus/gun-3', ac)).toBe(true);
    expect(kilitliMi('kino-otobus/susler', ac)).toBe(true);
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
  it('görsel haritası IS-LISTESI-YENI.md adlarıyla (A ve D bölümleri 43, Ek C 12 görsel); dosya gelince yer tutucu kalkar', () => {
    const adlar = Object.keys(VARLIK).filter((a) => !['jeton', 'kumbara-kavanoz'].includes(a));
    expect(adlar).toHaveLength(55);
    for (const a of ['otobus', 'top-cilek', 'kap-yabanmersini', 'sos-karamel-ust', 'serpinti-kavanoz', 'kalp-seker', 'pencere-dogumgunu', 'sus-kino-kiraz-sapka', 'kapak']) expect(adlar).toContain(a);
    const tablo = surumTablosu({ '/a/top-cilek.webp': 'u1', '/a/top-cilek-2.png': 'u2', '/a/kulah.png': 'u3', '/a/kulah.webp': 'u4' });
    expect(tablo.get('top-cilek')).toBe('u2');
    expect(tablo.get('kulah')).toBe('u4');
    expect(yerTutucular(tablo)).not.toContain('top-cilek');
    expect(yerTutucular(tablo)).toContain('otobus');
  });
  it('dolap v2 (tek sıra 4 göz): her tat kabının dokunma kutusu en az 72u, kutular çakışmaz', () => {
    // tezgâhta dolap 172u boyunda (kino-otobus.css → .ko-alt-kat 180u - 8u), eni görselin oranında
    const boy = 172;
    const en = boy * DOLAP_GOZLERI.oran;
    for (const n of [3, 6]) {
      const y = dolapYerleri(n);
      expect(y).toHaveLength(n);
      for (const k of y) {
        expect((k.en / 100) * en).toBeGreaterThanOrEqual(72);
        expect((k.boy / 100) * boy).toBeGreaterThanOrEqual(72);
        expect(k.kapBoy).toBeLessThanOrEqual(100);
      }
      for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++) {
          const a = y[i], b = y[j];
          const yatay = a.sol + a.en <= b.sol + 0.01 || b.sol + b.en <= a.sol + 0.01;
          const dikey = a.ust + a.boy <= b.ust + 0.01 || b.ust + b.boy <= a.ust + 0.01;
          expect(yatay || dikey, `${i}-${j}`).toBe(true);
        }
    }
  });
});
