import { describe, expect, it } from 'vitest';
import { EK, EK_TURLAR, SIRALAR, SURUM2_YERINE, etkinSira, surum2Tasi, turTuru, type Kose, type Yol } from '../../matematik/src/tur-sirasi';
import {
  BOLUSUM, ELMA_BOY, FINDIK_BOY, KAP_GOZU, YENI_CIZIMLER, YENI_KLASOR, YENI_KOSE, YENI_SOZ, YENI_TUR, elmaKaplari, elmaSayisi, elmaYerleri, kapGozleri, babaOlcutleri, babaParcalari, bolusumTamam, etiket, farkliMi, findikYerleri, kutusu, lokumSayisi, sakliSoru,
  sakliSorular, tahterevalliYeri, yeniTur,
  KAT_Y, RESIMLER, asansorTuru, balonTuru, bardakSirasi, bayrakDizileri, bayrakSecenekleri, birimGecerli, buyuyenDesenler, calgiBirimi,
  desenCevabi, gunDizileri, gunKarisik, karisikSira, kekIslemleri, kurabiyeSayilari, parcaYereUyar, resimSirasi, sekilOrtusu, SEKIL_NESNESI,
  surahiSorulari, trenTuru, yarimTuru, yeniSekiller,
} from '../../matematik/src/yeni-turlar';

const YOLLAR: Yol[] = ['minik', 'dort', 'bes'];

describe('Matematik · yeni turlar (Lokum, Zıpzıp, Baba)', () => {
  it("sıralar uzar: eski turlar yerinde, ek turlar sonda (Şekil'de gezginden önce); aynı tür en çok iki kez, arka arkaya değil; Lokum ve Baba yer değiştirir", () => {
    for (const yol of YOLLAR)
      for (const k of Object.keys(SIRALAR[yol]) as Kose[]) {
        const eski = SIRALAR[yol][k], sira = etkinSira(yol, k);
        expect(sira.filter((n) => n < 100), yol + ' ' + k).toEqual([...eski]);
        expect(sira.length).toBe(eski.length + EK_TURLAR[yol][k].length);
        if (k === 'sekil') expect(sira.at(-1)).toBe(eski.at(-1));
        for (const n of Object.keys(YENI_TUR[yol][k] ?? {})) expect(eski, yol + ' ' + k + ' ' + n).toContain(Number(n));
        const turler = sira.map((n, i) => (tahterevalliYeri(yol, k, n) ? 'tahterevalli' : undefined) ?? yeniTur(yol, k, n) ?? turTuru(k, n, i, sira.length));
        for (let i = 1; i < turler.length; i++) for (const a of turler[i].split('+')) expect(turler[i - 1].split('+'), yol + ' ' + k).not.toContain(a);
        const sayac = new Map<string, number>();
        for (const t of turler) for (const a of t.split('+')) sayac.set(a, (sayac.get(a) ?? 0) + 1);
        for (const [a, c] of sayac) expect(c, yol + ' ' + k + ' ' + a).toBeLessThanOrEqual(2);
        // Kapalı ek tur sırada görünmez (eski tur onun yerine oynamaz).
        expect(etkinSira(yol, k, (n) => n < 100)).toEqual(k === 'sekil' ? [...eski] : [...eski]);
      }
    // Yönetici kararı: Sayı 12 / 17 / 18, Şekil 11 / 14 / 14, Ölçü 9 / 10 / 12, Fener 10 / 10 / 11 (5+ ritim ve paylaşım; 4 ve 5+ roket,
    // kelebek; 5+ meyve grafiği; 21 Kasım; her yaşta Saklambaç ve Kaydırak Sırası, 22 Kasım). Çizimi gelmeyen tur sırada görünmez
    // (ek-turlar.ts). Kino Ailesinin Sofrası her yaşta Ölçü'de, Eş Kartları Fener'de sonda (22 Kasım sabahı).
    expect((['minik', 'dort', 'bes'] as Yol[]).map((y) => (['sayi', 'sekil', 'olcu', 'fener'] as Kose[]).map((k) => etkinSira(y, k).length)))
      .toEqual([[12, 12, 10, 11], [17, 15, 11, 11], [18, 15, 13, 12]]);
    // 2–3 yaşta parça-bütün ve gizli miktar yok; sınıflama her yaşta var. Zıpzıp ve Tahterevalli ek tur (yerinden ettikleri döndü).
    expect(Object.values(YENI_TUR.minik.sayi ?? {})).toEqual([]);
    for (const yol of YOLLAR) expect(Object.values(YENI_TUR[yol].sekil ?? {})).toContain('baba');
    expect(Object.values(YENI_TUR.bes.sayi ?? {})).toEqual(['lokum']);
    expect(EK_TURLAR.minik.sayi).not.toContain(EK.zipzip);
    expect(EK_TURLAR.bes.sayi).toContain(EK.zipzip);
    expect(SIRALAR.bes.sayi).toContain(13);
    expect(SIRALAR.bes.olcu).toContain(14);
    for (const yol of YOLLAR) expect(EK_TURLAR[yol].olcu[0]).toBe(EK.tahterevalli);
    expect(EK_TURLAR.minik.olcu).not.toContain(EK.yarim);
  });

  it('sürüm 2 kaydı: çocuk aynı eski turdan sürer; Şekil gezgini sona kayar; bitirmiş çocuk ilk yeni tura gelir, hatırası kalır', () => {
    for (const yol of YOLLAR)
      for (const k of Object.keys(SIRALAR[yol]) as Kose[]) {
        const eski = SIRALAR[yol][k], sira = etkinSira(yol, k);
        for (let a = 0; a < eski.length; a++) {
          const t = surum2Tasi(yol, k, a, false, sira);
          expect(sira[t.adim], yol + ' ' + k + ' ' + a).toBe(eski[a]);
          expect(t.hatira).toBe(false);
          expect(t.ayniYer).toBe(SURUM2_YERINE[yol][k] !== a);
        }
        const bitmis = surum2Tasi(yol, k, eski.length, true, sira);
        expect(bitmis.hatira).toBe(true);
        expect(sira[bitmis.adim]).toBeGreaterThanOrEqual(100);
        // Ek turlar kapalıyken bitirmiş çocuk sonda kalır.
        expect(surum2Tasi(yol, k, eski.length, true, [...eski]).adim).toBe(eski.length);
      }
  });

  it('Lokum: 4 yaş 3–5, 5+ 5–10 mandalina; ikisi de almalı; aynı bölüşüm sayılmaz; her sayıda en az iki farklı bölüşüm var', () => {
    for (let t = 0; t < 6; t++) {
      expect(lokumSayisi('dort', t)).toBeGreaterThanOrEqual(3);
      expect(lokumSayisi('dort', t)).toBeLessThanOrEqual(5);
      expect(lokumSayisi('bes', t)).toBeGreaterThanOrEqual(5);
      expect(lokumSayisi('bes', t)).toBeLessThanOrEqual(10);
    }
    expect([0, 1, 2].map((t) => lokumSayisi('bes', t))).toEqual([6, 8, 10]);
    expect(bolusumTamam(5, 3, 2)).toBe(true);
    expect(bolusumTamam(5, 5, 0)).toBe(false);
    expect(bolusumTamam(5, 2, 2)).toBe(false);
    expect(farkliMi([[3, 2]], [2, 3])).toBe(true);
    expect(farkliMi([[3, 2]], [3, 2])).toBe(false);
    // En küçük sayı (3) bile iki farklı bölüşüme izin verir: 1 + 2 ve 2 + 1.
    expect(BOLUSUM).toBeLessThanOrEqual(3 - 1);
  });

  it('Zıpzıp: gizli en az bir, dışarıda en az bir; seçeneklerde doğru cevap ve iki yakın sayı', () => {
    for (const yol of ['dort', 'bes'] as Yol[])
      for (let t = 0; t < 4; t++) {
        const s = sakliSoru(yol, t);
        expect(s.gizli).toBeGreaterThanOrEqual(1);
        expect(s.toplam - s.gizli).toBeGreaterThanOrEqual(1);
        expect(s.secenek).toHaveLength(3);
        expect(new Set(s.secenek).size).toBe(3);
        expect(s.secenek).toContain(s.gizli);
        for (const x of s.secenek) { expect(x).toBeGreaterThanOrEqual(1); expect(x).toBeLessThanOrEqual(s.toplam); }
        expect(s.toplam).toBeLessThanOrEqual(yol === 'dort' ? 5 : 9);
      }
  });

  it('Zıpzıp: turun iki sorusu aynı toplamın iki parçası; fındıklar kütükte üst üste binmez, gizliler sepetin altında', () => {
    for (const yol of ['dort', 'bes'] as Yol[])
      for (let t = 0; t < 4; t++) {
        const [a, b] = sakliSorular(yol, t);
        expect(b.toplam).toBe(a.toplam);
        expect(a.gizli + b.gizli).toBe(a.toplam);
        expect(b.gizli).not.toBe(a.gizli);
        expect(b.secenek).toContain(b.gizli);
        expect(new Set(b.secenek).size).toBe(3);
        for (const s of [a, b]) {
          const yer = findikYerleri(s.toplam, s.gizli);
          expect(yer).toHaveLength(s.toplam);
          expect(yer.filter((p) => p.gizli)).toHaveLength(s.gizli);
          for (let i = 0; i < yer.length; i++) for (let j = i + 1; j < yer.length; j++)
            expect(Math.hypot(yer[i].x - yer[j].x, yer[i].y - yer[j].y)).toBeGreaterThanOrEqual(FINDIK_BOY - 4);
          // Sepet x 630…1050, y 450…740 (gövdesi altta ~644…1034): gizliler içinde, dışarıdakiler solunda.
          for (const p of yer) {
            if (p.gizli) { expect(p.x - FINDIK_BOY / 2).toBeGreaterThan(690); expect(p.x + FINDIK_BOY / 2).toBeLessThan(990); expect(p.y + FINDIK_BOY / 2).toBeLessThan(740); }
            else expect(p.x + FINDIK_BOY / 2).toBeLessThan(640);
          }
        }
      }
  });

  it('Baba: 1. gelişte 2–3 yaş renk, 4 yaş şekil, 5+ şekil sonra boy; sonra başka ölçüt ve en son iki (5+ üç) ölçüt; her ölçütte altı parça üçe üç', () => {
    expect(babaOlcutleri('minik')).toEqual(['renk']);
    expect(babaOlcutleri('dort')).toEqual(['bicim']);
    expect(babaOlcutleri('bes')).toEqual(['bicim', 'boy']);
    expect(babaOlcutleri('bes', 2)).toHaveLength(3);
    for (const yol of YOLLAR)
      for (const o of [0, 1, 2, 3].flatMap((g) => babaOlcutleri(yol, g)))
        for (let t = 0; t < 6; t++) {
          const p = babaParcalari(yol, t);
          expect(p).toHaveLength(6);
          expect(p.filter((x) => kutusu(o, x) === 0)).toHaveLength(3);
          const [a, b] = etiket(o);
          expect(kutusu(o, a)).toBe(0);
          expect(kutusu(o, b)).toBe(1);
          const farkli = (['renk', 'bicim', 'boy'] as const).filter((oz) => a[oz] !== b[oz]);
          expect(farkli).toEqual([o === 'bicim' ? 'bicim' : o]);
        }
  });

  it('M14–M24 tabloları: her tür kendi klasörü ve çizim listesi; sözler benzersiz ve sözler.json içinde dolu', async () => {
    const sozler: string[] = (await import('../../matematik/src/sozler.json')).default;
    const hepsi = new Set<number>();
    for (const yt of Object.keys(YENI_KOSE) as (keyof typeof YENI_KOSE)[]) {
      expect(YENI_KLASOR[yt], yt).toMatch(/^[a-z-]+$/);
      expect(YENI_CIZIMLER[yt].length, yt).toBeGreaterThan(0);
      // Bilerek paylaşılan tek söz: Babaanne'nin "Afiyet olsun!"u (Kurabiye ve Bütün-Yarım).
      for (const i of Object.values(YENI_SOZ[yt]) as number[]) { // Paylaşılan sözler: "Afiyet olsun!" ve sayı sözcükleri ("Bir." … "On.", sözler 31–41).
      if (i !== YENI_SOZ.kurabiye.afiyet && i !== YENI_SOZ.lokum.afiyet && (i < 31 || i > 41)) expect(hepsi.has(i), yt + ' ' + i).toBe(false); hepsi.add(i); expect(sozler[i], yt + ' ' + i).toBeTruthy(); }
    }
    expect(new Set(Object.values(YENI_KLASOR)).size).toBe(Object.keys(YENI_KLASOR).length);
    // main.ts'teki çizim listesi (import.meta.glob) her klasörü içersin.
    const main = (await import('node:fs')).readFileSync('matematik/src/main.ts', 'utf8');
    for (const k of Object.values(YENI_KLASOR)) expect(main, k).toContain("'../../assets/matematik/" + k + "/*.webp'");
  });

  it('Elma Sandıkları: 2–3 yaş 3–5 beşlik sepete, 4 yaş 6–10 bir sandığa, 5+ 11–20 iki sandığa; ağaçta elmalar üst üste binmez', () => {
    for (let t = 0; t < 10; t++) {
      for (const yol of YOLLAR) {
        const n = elmaSayisi(yol, t);
        const [en, ust] = yol === 'minik' ? [3, 5] : yol === 'dort' ? [6, 10] : [11, 20];
        expect(n).toBeGreaterThanOrEqual(en);
        expect(n).toBeLessThanOrEqual(ust);
        expect(elmaKaplari(yol).reduce((a, k) => a + KAP_GOZU[k], 0)).toBeGreaterThanOrEqual(n);
        const yer = elmaYerleri(n);
        expect(yer).toHaveLength(Math.min(n, 10));
        // Telefonda "Oyuncaklara dön" düğmesinin altı (sol üst) boş.
        for (const p of yer) expect(p.x - ELMA_BOY / 2 < 150 && p.y - ELMA_BOY / 2 < 160).toBe(false);
        for (const p of yer) { expect(p.x - ELMA_BOY / 2).toBeGreaterThanOrEqual(60); expect(p.x + ELMA_BOY / 2).toBeLessThanOrEqual(600); expect(p.y - ELMA_BOY / 2).toBeGreaterThanOrEqual(60); expect(p.y + ELMA_BOY / 2).toBeLessThanOrEqual(440); }
        for (let i = 0; i < yer.length; i++) for (let j = i + 1; j < yer.length; j++) expect(Math.hypot(yer[i].x - yer[j].x, yer[i].y - yer[j].y)).toBeGreaterThanOrEqual(ELMA_BOY);
      }
    }
    expect(kapGozleri('sandik')).toHaveLength(10);
    expect(kapGozleri('sepet')).toHaveLength(5);
  });

  it('M15–M19 Sayı masası: yaşın aralıkları; seçeneklerde doğru cevap; işlemler 0–10; asansör beş katın içinde kalır', () => {
    const ARALIK = { minik: [1, 5], dort: [1, 10], bes: [11, 20] } as const;
    for (const yol of YOLLAR) for (let t = 0; t < 6; t++) {
      const [en, ust] = ARALIK[yol];
      for (const n of kurabiyeSayilari(yol, t)) {
        expect(n).toBeGreaterThanOrEqual(en); expect(n).toBeLessThanOrEqual(ust);
        const b = bayrakSecenekleri(n, en, ust);
        expect(b).toContain(n); expect(new Set(b).size).toBe(3);
        for (const x of b) { expect(x).toBeGreaterThanOrEqual(en); expect(x).toBeLessThanOrEqual(ust); }
      }
      const tt = trenTuru(yol, t), tren = tt.sayilar;
      const fark = tt.is === 'geri' ? -1 : tt.is === 'ikiser' ? 2 : 1;
      for (let i = 1; i < tren.length; i++) expect(tren[i]).toBe(tren[i - 1] + fark);
      for (const n of [...tren, ...tt.secenek]) { expect(n).toBeGreaterThanOrEqual(en); expect(n).toBeLessThanOrEqual(ust); }
      const k = karisikSira(tren.length, t);
      expect([...k].sort()).toEqual([...tren.keys()]);
      k.forEach((x, i) => expect(x).not.toBe(i));
      const bt = balonTuru(yol, t);
      expect(bt.basta + bt.gelen - bt.ucan).toBeGreaterThanOrEqual(1);
      expect(bt.basta + bt.gelen).toBeLessThanOrEqual(yol === 'minik' ? 3 : yol === 'dort' ? 5 : 10);
      for (const is of kekIslemleri(yol, t)) {
        expect(is.sonuc).toBeGreaterThanOrEqual(1);
        expect(Math.max(is.a, is.b, is.sonuc)).toBeLessThanOrEqual(yol === 'minik' ? 5 : yol === 'dort' ? 5 : 10);
        if (yol === 'minik') expect(is.isaret).toBe('+');
      }
      const at = asansorTuru(yol, t);
      let kat = at.bas;
      for (const a of at.adimlar) { kat += a; expect(kat).toBeGreaterThanOrEqual(at.pencere); expect(kat).toBeLessThan(at.pencere + KAT_Y.length); }
      if (yol === 'minik') expect(at.adimlar.every((a) => a === 1)).toBe(true);
      expect(at.pencere).toBeGreaterThanOrEqual(en); expect(at.pencere + 4).toBeLessThanOrEqual(Math.max(ust, at.pencere + 4));
    }
  });

  it('M20–M21 Şekil evi: örtüde şeklin iki nesnesi ve dört çeldirici; resim parçaları taslağın içinde, pencereler birbirinin yerine geçer', () => {
    expect(yeniSekiller('minik')).toEqual(['yildiz', 'kalp']);
    expect(yeniSekiller('bes')).toHaveLength(4);
    for (const s of yeniSekiller('bes')) for (let t = 0; t < 3; t++) {
      const o = sekilOrtusu(s, t);
      expect(o).toHaveLength(6);
      expect(o.filter((x) => x.dogru).map((x) => x.ad).sort()).toEqual([...SEKIL_NESNESI[s]].sort());
      expect(new Set(o.map((x) => x.ad)).size).toBe(6);
    }
    for (const r of Object.values(RESIMLER)) for (const p of r.parcalar) {
      expect(p.yer[0] + p.yer[2]).toBeLessThanOrEqual(r.tuval[0]); expect(p.yer[1] + p.yer[3]).toBeLessThanOrEqual(r.tuval[1]);
    }
    expect(parcaYereUyar(RESIMLER.ev, 3, 4)).toBe(true);
    expect(parcaYereUyar(RESIMLER.ev, 1, 0)).toBe(false);
    expect(resimSirasi('minik')[0].hazir).toEqual([3, 4]);
    expect([0, 1, 2].map((g) => resimSirasi('bes', g).map((x) => x.resim.ad))).toEqual([['ev'], ['roket'], ['roket', 'ev']]);
  });

  it('M22–M24 Fener tiyatrosu: büyüyen desenin cevabı; bayrak boşlukları ortada; çalgı birimi en az iki farklı çalgı', () => {
    expect(desenCevabi(buyuyenDesenler('dort')[0])).toBe(4);
    expect(desenCevabi(buyuyenDesenler('bes')[0])).toBe(7);
    for (const yol of YOLLAR) for (const d of bayrakDizileri(yol)) {
      for (const b of d.bosluk) { expect(b).toBeGreaterThan(0); expect(b).toBeLessThan(d.dizi.length - 1); }
      expect(d.bosluk.length).toBeLessThanOrEqual(2);
    }
    expect(calgiBirimi('dort')).toBe(2);
    expect(calgiBirimi('bes')).toBe(3);
    expect(birimGecerli(['davul', 'davul'])).toBe(false);
    expect(birimGecerli(['davul', 'alkis'])).toBe(true);
  });

  it('M25–M27 Ölçü: 2–3 yaşta yarım bardak sorulmaz; 5+ sürahi 2 → 3 → 4 bardak; yarımlar çift; zaman kartları karışık gelir', () => {
    expect([0, 1, 2].map((g) => surahiSorulari('bes', g).kacBardak)).toEqual([2, 3, 4]);
    for (let t = 0; t < 6; t++) {
      expect(surahiSorulari('minik', t).bul).not.toContain('yarim');
      expect([0, 2, 3, 4]).toContain(surahiSorulari('bes', t).kacBardak);
      expect(new Set(bardakSirasi(t, 0)).size).toBe(3);
      const y = yarimTuru('bes', t);
      expect(y.kacYarim % 2).toBe(0);
      expect(y.kacYarim).toBeLessThanOrEqual(6);
      expect(yarimTuru('dort', t).bol.length).toBeGreaterThanOrEqual(1);
    }
    expect(gunDizileri('minik')).toEqual([['oyun', 'uyku']]);
    expect(gunDizileri('bes')).toHaveLength(2);
    for (const d of gunDizileri('bes')) { const k = gunKarisik(d, 1); k.forEach((x, i) => expect(x).not.toBe(d[i])); }
  });
});
