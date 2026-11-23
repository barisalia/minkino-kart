// Matematik · yeni turların derinliği (derinlik.ts): her tur en az üç farklı geliş, aynı soru art arda iki gelişte
// gelmez, akıllı tekrar defterindeki zor sayı öne alınır; her basamak yaşın sınırlarında kalır.
import { describe, expect, it } from 'vitest';
import { basamak, gelisSorusu, havuzdanSec } from '../../matematik/src/derinlik';
import * as Y from '../../matematik/src/yeni-turlar';
import { paySorulari, ritimSecenekleri, ritimSiralari } from '../../matematik/src/ritim-pay';
import { enAz, enCok, fazlaSecenekleri, geriSayimlar, grafikVerisi, kacFazla, kelebekDesenleri, MEYVELER } from '../../matematik/src/roket-kelebek-grafik';
import { turlar } from '../../matematik/src/tahterevalli-mantik';
import { kaydirakTuru, saklambacTuru } from '../../matematik/src/konum-sira';
import { sofraTuru } from '../../matematik/src/aile-sofrasi';
import { esTuru } from '../../matematik/src/es-kartlar';
import { kutuTuru } from '../../matematik/src/sekil-kutusu';
import type { Yol } from '../../matematik/src/tur-sirasi';

const YOLLAR: Yol[] = ['minik', 'dort', 'bes'];
const j = (x: unknown) => JSON.stringify(x);
type Uretec = (yol: Yol, tekrar: number, zor?: number[]) => unknown;
/** Her yeni turun soru üreteci (yaş, geliş, defterdeki zor sayılar). */
const URETEC: Record<string, Uretec> = {
  lokum: (y, t, z) => Y.lokumSayisi(y, t, z),
  zipzip: (y, t, z) => Y.sakliSorular(y, t, z),
  baba: (y, t) => Y.babaOlcutleri(y, t),
  sandik: (y, t, z) => Y.elmaSayisi(y, t, z),
  kurabiye: (y, t, z) => Y.kurabiyeSayilari(y, t, z),
  tren: (y, t, z) => Y.trenTuru(y, t, z),
  balon: (y, t, z) => Y.balonTuru(y, t, z),
  kek: (y, t, z) => Y.kekIslemleri(y, t, z),
  asansor: (y, t, z) => Y.asansorTuru(y, t, z),
  sekilbahce: (y, t) => Y.sekilBahcesiTuru(y, t),
  resim: (y, t) => Y.resimSirasi(y, t).map((r) => [r.resim.ad, r.hazir]),
  buyuyen: (y, t) => Y.buyuyenDesenler(y, t),
  bayrak: (y, t) => Y.bayrakDizileri(y, t),
  calgi: (y, t) => Y.calgiTuru(y, t),
  surahi: (y, t, z) => Y.surahiSorulari(y, t, z),
  yarim: (y, t, z) => Y.yarimTuru(y, t, z),
  gun: (y, t) => Y.gunTuru(y, t),
  ritim: (_y, t, z) => ritimSiralari(t, z),
  pay: (_y, t, z) => paySorulari(t, z),
  roket: (y, t, z) => geriSayimlar(y, t, z),
  kelebek: (y, t) => kelebekDesenleri(y, t),
  grafik: (_y, t, z) => grafikVerisi(t, z),
  tahterevalli: (y, t) => turlar(y, t),
  saklambac: (y, t, z) => saklambacTuru(y, t, z),
  kaydirak: (y, t) => kaydirakTuru(y, t),
  sofra: (y, t) => sofraTuru(y, t),
  eskart: (y, t) => esTuru(y, t),
  kutu: (y, t) => kutuTuru(y, t),
};
/** Yaşa bağlı olmayan turlar (yalnız 5+): bir yaşta denetlemek yeter. */
const TEK_YAS = new Set(['ritim', 'pay', 'grafik']);

describe('Matematik · yeni turların derinliği', () => {
  it('basamak: 1. geliş kolay, 2. orta, 3. ve sonrası zor', () => {
    expect([0, 1, 2, 3, 9].map((t) => basamak(t))).toEqual([0, 1, 2, 2, 2]);
  });

  it('her tur, her yaşta: ilk üç geliş üç farklı soru; on gelişte aynı soru art arda gelmez', () => {
    for (const [ad, f] of Object.entries(URETEC))
      for (const yol of TEK_YAS.has(ad) ? (['bes'] as Yol[]) : YOLLAR) {
        const g = Array.from({ length: 10 }, (_, t) => j(f(yol, t)));
        expect(new Set(g.slice(0, 3)).size, ad + ' ' + yol + ' ilk üç geliş').toBe(3);
        for (let t = 1; t < g.length; t++) expect(g[t], ad + ' ' + yol + ' geliş ' + (t + 1)).not.toBe(g[t - 1]);
      }
  });

  it('defterdeki zor sayı öne alınır; önceki gelişin sorusu art arda gelmez', () => {
    // 4 yaş Elma: kolay havuz 6, 7; zor havuz 10, 9, 8.
    expect(Y.elmaSayisi('dort', 0)).toBe(6);
    expect(Y.elmaSayisi('dort', 0, [7])).toBe(7);
    expect(Y.elmaSayisi('dort', 3, [9])).toBe(9);
    // 3. gelişte 10 sorulmuştu: 4. gelişte 10 zor olsa da art arda gelmez.
    expect(Y.elmaSayisi('dort', 2)).toBe(10);
    expect(Y.elmaSayisi('dort', 3, [10])).not.toBe(10);
    // Zor sayının havuzda karşılığı yoksa varsayılan soru.
    expect(Y.elmaSayisi('dort', 1, [3])).toBe(Y.elmaSayisi('dort', 1));
    // 2. gelişin sorusu, 3. gelişte defter isteseydi bile art arda gelmez (orta ve zor havuzda ortak soru).
    expect(Y.lokumSayisi('dort', 1)).toBe(4);
    expect(Y.lokumSayisi('dort', 2, [4])).not.toBe(4);
    // Genel: havuzdanSec önceki soruyu atlar, havuz tek soruysa onu verir.
    expect(havuzdanSec([1, 2, 3], 3, [2], (x) => [x], 2)).not.toBe(2);
    expect(havuzdanSec([5], 4, [], () => [], 5)).toBe(5);
    expect(gelisSorusu([[1], [2], [3, 4]], 2)).toBe(3);
    // Kek: zor cevap öne alınır (5+ kolay havuzda 7 ve 2 cevaplı işlem ikinci sırada).
    expect(Y.kekIslemleri('bes', 0, [2]).map((i) => i.cevap)).toContain(2);
  });

  it('sayı turları yaşın sınırında; basamak büyüdükçe sayılar büyür', () => {
    const UST = { minik: 5, dort: 10, bes: 20 } as const;
    for (const yol of YOLLAR) {
      const elma = [0, 1, 2].map((t) => Y.elmaSayisi(yol, t));
      expect(elma[1]).toBeGreaterThan(elma[0]);
      expect(elma[2]).toBeGreaterThan(elma[1]);
      for (let t = 0; t < 10; t++) {
        for (const n of Y.kurabiyeSayilari(yol, t)) expect(n).toBeLessThanOrEqual(UST[yol]);
        const b = Y.balonTuru(yol, t);
        expect(b.basta + b.gelen - b.ucan).toBeGreaterThanOrEqual(1);
        expect(b.basta + b.gelen).toBeLessThanOrEqual(yol === 'minik' ? 3 : yol === 'dort' ? 5 : 10);
        const z = Y.sakliSorular(yol, t);
        expect(z[0].gizli).not.toBe(z[1].gizli);
        for (const s of z) expect(Y.findikYerleri(s.toplam, s.gizli)).toHaveLength(s.toplam);
      }
    }
    // 5+ Kurabiye: 11–15 → 16–19 → 17–20.
    expect(Y.kurabiyeSayilari('bes', 0).every((n) => n >= 11 && n <= 15)).toBe(true);
    expect(Y.kurabiyeSayilari('bes', 1).every((n) => n >= 16 && n <= 19)).toBe(true);
    expect(Math.max(...Y.kurabiyeSayilari('bes', 2))).toBe(20);
  });

  it('Sayı Treni: 1. geliş sırala, 2. geliş eksik vagon (seçeneklerde eksikler ve trende olmayanlar), 3. geliş geri ya da ikişer', () => {
    for (const yol of YOLLAR) {
      expect(Y.trenTuru(yol, 0).is).toBe('sirala');
      const e = Y.trenTuru(yol, 1);
      expect(e.is).toBe('eksik');
      expect(e.eksik.length).toBeGreaterThanOrEqual(1);
      for (const i of e.eksik) { expect(i).toBeGreaterThan(0); expect(e.secenek).toContain(e.sayilar[i]); }
      expect(e.secenek).toHaveLength(e.eksik.length + 2);
      expect(new Set(e.secenek).size).toBe(e.secenek.length);
      for (const n of e.secenek) if (!e.eksik.some((i) => e.sayilar[i] === n)) expect(e.sayilar).not.toContain(n);
      for (let t = 2; t < 6; t++) expect(['geri', 'ikiser', 'sirala']).toContain(Y.trenTuru(yol, t).is);
    }
    expect(Y.trenTuru('dort', 2).is).toBe('geri');
    expect(Y.trenTuru('bes', 2).is).toBe('ikiser');
    expect(Y.trenTuru('bes', 1).eksik).toHaveLength(2);
  });

  it('Kek Fırını: 3. gelişte eksik toplanan (a + ? = sonuç); kolay ve orta basamakta sonuç sorulur', () => {
    for (const yol of ['dort', 'bes'] as Yol[]) {
      for (const i of [...Y.kekIslemleri(yol, 0), ...Y.kekIslemleri(yol, 1)]) expect(i.bilinmeyen).toBe('sonuc');
      for (let t = 2; t < 6; t++) for (const i of Y.kekIslemleri(yol, t)) {
        expect(i.bilinmeyen).toBe('b');
        expect(i.a + i.cevap).toBe(i.sonuc);
        expect(i.cevap).toBeGreaterThanOrEqual(1);
        expect(i.sonuc).toBeLessThanOrEqual(yol === 'dort' ? 5 : 10);
      }
    }
    for (let t = 0; t < 6; t++) for (const i of Y.kekIslemleri('minik', t)) { expect(i.isaret).toBe('+'); expect(i.bilinmeyen).toBe('sonuc'); }
  });

  it('Ölçü, Şekil ve Fener sınırları: yarımlar 2–6, sürahi 2–4 bardak, fener en çok on, bayrak boşlukları ortada, çalgı dizisi sığar', () => {
    for (const yol of YOLLAR) for (let t = 0; t < 8; t++) {
      const y = Y.yarimTuru(yol, t);
      if (y.kacYarim) { expect([2, 4, 6]).toContain(y.kacYarim); expect(y.bol.length).toBeGreaterThanOrEqual(1); }
      const s = Y.surahiSorulari(yol, t);
      if (s.kacBardak) expect([2, 3, 4]).toContain(s.kacBardak);
      if (yol === 'minik') expect(s.bul).not.toContain('yarim');
      for (const d of Y.buyuyenDesenler(yol, t)) expect(Y.desenCevabi(d)).toBeLessThanOrEqual(10);
      for (const d of Y.bayrakDizileri(yol, t)) for (const b of d.bosluk) { expect(b).toBeGreaterThan(0); expect(b).toBeLessThan(d.dizi.length - 1); }
      const c = Y.calgiTuru(yol, t);
      expect(c.birim * 3 + c.bos).toBeLessThanOrEqual(14);
      const g = Y.gunTuru(yol, t);
      if (g.celdirici) for (const d of g.diziler) expect(d).not.toContain(Y.gunCeldirici(d, t));
      const sb = Y.sekilBahcesiTuru(yol, t);
      for (const sk of sb.tanit) expect(sb.sekiller).toContain(sk);
      for (const o of Y.babaOlcutleri(yol, t)) expect(Y.babaParcalari(yol, t).filter((p) => Y.kutusu(o, p) === 0)).toHaveLength(3);
    }
    // 1. gelişte her şekil tanıtılır, 2. gelişte hiçbiri; zorlanılan şekil başa alınır.
    expect(Y.sekilBahcesiTuru('dort', 0).tanit).toHaveLength(3);
    expect(Y.sekilBahcesiTuru('dort', 1).tanit).toHaveLength(0);
    expect(Y.sekilBahcesiTuru('bes', 1, ['altigen']).sekiller[0]).toBe('altigen');
  });

  it('5+ turları: ritim sayıları okunur ve seçeneklerde doğru; paylaşım tam bölünür; grafikte tek en çok ve en az; roket en çok on blok', () => {
    for (let t = 0; t < 8; t++) {
      for (const d of ritimSiralari(t)) {
        for (const n of d.taslar) expect(n <= 20 || n === 25 || n === 35 || n % 10 === 0).toBe(true);
        for (let i = d.gosterilen; i < d.taslar.length; i++) expect(ritimSecenekleri(d.taslar[i - 1], d.adim)).toContain(d.taslar[i]);
      }
      for (const q of paySorulari(t)) expect(q.kurabiye % q.tabak).toBe(0);
      const v = grafikVerisi(t), say = MEYVELER.map((m) => v.sayilar[m]);
      expect(say.filter((n) => n === v.sayilar[enCok(v.sayilar)])).toHaveLength(1);
      expect(say.filter((n) => n === v.sayilar[enAz(v.sayilar)])).toHaveLength(1);
      expect(fazlaSecenekleri(kacFazla(v))).toContain(kacFazla(v));
      expect(fazlaSecenekleri(kacFazla(v))).toHaveLength(3);
      for (const yol of ['dort', 'bes'] as Yol[]) for (const g of geriSayimlar(yol, t)) expect(g.dizilen.length).toBeLessThanOrEqual(10);
    }
  });
});
