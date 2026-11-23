import { describe, expect, it } from 'vitest';
import {
  CEREN_SOZLERI, TUM_DERSLER, TUM_KELIMELER, UNITELER, cumle, dersKelimeleri, evetHayir, kelimeSesleri, ortakSesler, soru,
  SAYI_KELIMELERI, kelimeBul, uniteSesleri, yeniKelimeler,
} from '../../ingilizce/src/icerik';
import { ILERISI, dersIfadeleri, dersSesKimlikleri, ilerisiSesleri, ortakSesler2, type Ifade } from '../../ingilizce/src/icerik2';
import {
  ARALIKLAR, GUN_MS, bosKayit, cevapIsle, dersBitir, gunDamgasi, kayitCoz, siradakiDers, tekrarBitir, tekrarSec, toplamYildiz,
  vadesiGelenler, yildizHesapla, bugunTekrarEdildi, haftaDurumu, seri,
} from '../../ingilizce/src/ilerleme';
import {
  araliDizi, dersPlani, dogruMuSorulari, eksikTurlari, farkliOzneler, fenerPlani, kurTurlari, ogretSorulari, oyunPlani, rutinSec, secenekSayisi, senSorTurlari,
  soruSayisi, soruUret, type Adim, type Yas,
  postaPlani, hayvanPlani, sasirtTurlari,
} from '../../ingilizce/src/plan';

/** Tekrarlanabilir rastgele sayı (mulberry32) */
function tohum(s: number) {
  return () => {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('ingilizce · müfredat', () => {
  it('24 ünite (13–24. adalar icerik3.ts), her ünitede 8 kelime (altı çekirdek + sonradan eklenen iki), kimlikler benzersiz', () => {
    expect(UNITELER).toHaveLength(24);
    for (const u of UNITELER) {
      expect(u.kelimeler, u.id).toHaveLength(8);
      // sonradan eklenenler hep sondadır: çizimi gelene kadar ünite ilk altı kelimesiyle oynanır
      expect(u.kelimeler.map((w) => !!w.ek), u.id).toEqual([false, false, false, false, false, false, true, true]);
    }
    expect(new Set(TUM_KELIMELER.map((w) => w.id)).size).toBe(192);
    expect(UNITELER.map((u) => u.no)).toEqual(Array.from({ length: 24 }, (_, i) => i + 1));
  });

  it('kelime kimlikleri dosya adı olmaya uygun, çilek yok', () => {
    for (const w of TUM_KELIMELER) {
      expect(w.id, w.id).toMatch(/^[a-z]+(-[a-z]+)*$/);
      expect(w.hece, w.id).toBeGreaterThan(0);
    }
    expect(TUM_KELIMELER.some((w) => w.id === 'strawberry')).toBe(false);
  });

  it('cümle kalıpları türe göre doğru kurulur', () => {
    const bul = (id: string) => TUM_KELIMELER.find((w) => w.id === id)!;
    expect(cumle(bul('sheep'))).toBe("It's a sheep.");
    expect(soru(bul('sheep'))).toBe('Where is the sheep?');
    expect(evetHayir(bul('sheep'))).toBe('Is it a sheep?');
    expect(evetHayir(bul('apple'))).toBe('Is it an apple?');
    expect(cumle(bul('apple'))).toBe('I like apples.');
    expect(cumle(bul('red'))).toBe("It's red.");
    expect(soru(bul('red'))).toBe('Which one is red?');
    expect(soru(bul('three'))).toBe('Where is number three?');
    expect(evetHayir(bul('three'))).toBe('Is it number three?');
    expect(soru(bul('jump'))).toBe('Jump!');
    expect(evetHayir(bul('jump'))).toBe('Is Kino jumping?');
    expect(cumle(bul('jump'))).toBe('I can jump!');
    expect(evetHayir(bul('milk'))).toBe('Is it milk?');
    expect(soru(bul('eyes'))).toBe('Where are the eyes?');
    expect(cumle(bul('mom'))).toBe('This is my mom.');
    expect(cumle(bul('elephant'))).toBe('I see an elephant.');
  });

  it('her ünitede 9 ders: ilk ikisi dörder yeni kelime, üçüncüsü hepsini çalışır; üst seviyelerde yeni kelime yok', () => {
    expect(TUM_DERSLER).toHaveLength(216);
    expect(new Set(TUM_DERSLER.map((d) => d.id)).size).toBe(216);
    for (const u of UNITELER) {
      const a = yeniKelimeler(u, 0), b = yeniKelimeler(u, 1);
      expect(a).toHaveLength(4);
      expect([...a, ...b].map((w) => w.id)).toEqual(u.kelimeler.map((w) => w.id));
      for (const no of [2, 3, 5, 8] as const) expect(yeniKelimeler(u, no)).toHaveLength(0);
      expect(dersKelimeleri(u, 2)).toHaveLength(8);
    }
  });

  it('ders yolu sarmaldır: iki ada sonra cümleler için, beş ada sonra konuşma için geri dönülür', () => {
    const sira = TUM_DERSLER.map((d) => d.id);
    const yer = (id: string) => sira.indexOf(id);
    expect(sira.slice(0, 3)).toEqual(['ciftlik-1', 'ciftlik-2', 'ciftlik-3']);
    expect(yer('ciftlik-4')).toBeGreaterThan(yer('sayilar-3'));
    expect(yer('ciftlik-4')).toBeLessThan(yer('yiyecekler-1'));
    expect(yer('ciftlik-7')).toBeGreaterThan(yer('ailem-3'));
    expect(yer('ciftlik-7')).toBeLessThan(yer('yuzum-1'));
    // bir adanın dersleri kendi içinde hep sırayla gelir
    for (const u of UNITELER) {
      const yerler = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => yer(`${u.id}-${n}`));
      expect(yerler, u.id).toEqual([...yerler].sort((x, y) => x - y));
    }
    expect(TUM_DERSLER.filter((d) => d.seviye === 2)).toHaveLength(72);
  });

  it('ses listesi: kimlikler benzersiz, her kelimeye beş İngilizce ve bir Türkçe kayıt', () => {
    const hepsi = [...ortakSesler(), ...UNITELER.flatMap(uniteSesleri)];
    expect(new Set(hepsi.map((s) => s.id)).size).toBe(hepsi.length);
    const koyun = kelimeSesleri(TUM_KELIMELER.find((w) => w.id === 'sheep')!);
    expect(koyun.map((s) => s.id)).toEqual(['en/w-sheep', 'en/w-sheep-yavas', 'en/c-sheep', 'en/q-sheep', 'en/y-sheep', 'tr/k-sheep']);
    expect(koyun[1].yavas).toBe(true);
    expect(koyun[5].metin).toBe('Koyun demek.');
    expect(kelimeSesleri(TUM_KELIMELER.find((w) => w.id === 'cow')!)[5].metin).toBe('İnek demek.');
    for (const s of hepsi) {
      expect(s.metin.trim().length, s.id).toBeGreaterThan(1);
      // KULLANICI-KURALLARI: bir kayıt en çok üç kısa cümle
      expect(s.metin.split(/[.!?…]+/).filter((p) => p.trim()).length, s.id).toBeLessThanOrEqual(3);
      // İngilizce kayıtta Türkçe harf, Türkçe kayıtta İngilizce kelime karışmasın
      if (s.dil === 'en') expect(s.metin, s.id).not.toMatch(/[çğıöşüÇĞİÖŞÜ]/);
    }
  });

  it("Ceren'in yönergelerinde İngilizce sözcük geçmez (Türkçe ses İngilizceyi bozuk okur)", () => {
    // Türkçe harfler de harf sayılsın diye sınırlar Unicode ile aranır ("doğru" içindeki "do" İngilizce sayılmasın)
    const ingilizce = /(?<!\p{L})(hello|goodbye|yes|no|sheep|apple|big|small|and|the|is|it|what|how|many|where|who|like|have|see|love|can|she|he|on|in|under|by|go|you|do|color)(?!\p{L})/iu;
    for (const [ad, metin] of Object.entries(CEREN_SOZLERI)) expect(metin, ad).not.toMatch(ingilizce);
    for (const s of [...ortakSesler2(), ...UNITELER.flatMap(ilerisiSesleri)]) if (s.dil === 'tr') expect(s.metin, s.id).not.toMatch(ingilizce);
  });
});

describe('ingilizce · ders planı', () => {
  const ciftlik = UNITELER[0], renkler = UNITELER[1];
  const tipler = (a: Adim[]) => a.map((x) => x.tip);

  it('1. ders: selam, dört tanışma, bul, Kino, söyle, veda', () => {
    const plan = dersPlani({ unite: ciftlik, no: 0, yas: '4', bilinen: [], isinma: [], ilk: true }, tohum(1));
    expect(tipler(plan)).toEqual(['selam', 'tanis', 'tanis', 'tanis', 'tanis', 'bul', 'ogret', 'soyle', 'veda']);
    const tanisilan = (p: Adim[]) => p.filter((a) => a.tip === 'tanis').map((a) => (a.tip === 'tanis' ? a.kelime.id : ''));
    expect(tanisilan(plan)).toEqual(['sheep', 'cow', 'duck', 'cat']);
    // Ceren ünitenin girişini yalnız ünitenin ilk dersinde söyler
    expect(plan[0].tip === 'selam' && plan[0].giris).toBe('tr/u-ciftlik');
    // sonradan eklenen kelimenin çizimi ve sesi gelmediyse ders onsuz kurulur
    const eksik = dersPlani({ unite: ciftlik, no: 1, yas: '4', bilinen: [], isinma: [], ilk: false, acik: (w) => !w.ek }, tohum(1));
    expect(tanisilan(eksik)).toEqual(['dog', 'horse']);
    expect(eksik[0].tip === 'selam' && eksik[0].giris).toBeUndefined();
    const tam = dersPlani({ unite: ciftlik, no: 1, yas: '4', bilinen: [], isinma: [], ilk: false }, tohum(1));
    expect(tanisilan(tam)).toEqual(['dog', 'horse', 'chicken', 'pig']);
  });

  it('üç dersin akışı birbirinden farklıdır: 2. ders balon ve Ne Eksik, şenlik konuşan resim, Obur ve eşleştirme', () => {
    const onceki = yeniKelimeler(ciftlik, 0);
    const b = dersPlani({ unite: ciftlik, no: 1, yas: '5+', bilinen: onceki, isinma: onceki.slice(0, 2), ilk: false }, tohum(2));
    expect(tipler(b)).toEqual(['selam', 'tekrar', 'tanis', 'tanis', 'tanis', 'tanis', 'balon', 'sasirt', 'eksik', 'soyle', 'veda']);
    const c = dersPlani({ unite: ciftlik, no: 2, yas: '5+', bilinen: [], isinma: [], ilk: false }, tohum(3));
    expect(tipler(c)).toEqual(['selam', 'resim', 'besle', 'eslestir', 'soyle', 'veda']);
    // şenlikte sekiz kelimenin hepsi değil, dördü söylenir
    const soyle = c.find((a) => a.tip === 'soyle');
    expect(soyle?.tip === 'soyle' && soyle.kelimeler).toHaveLength(4);
    const veda = c[c.length - 1];
    expect(veda.tip === 'veda' && veda.unite).toBe(true);
  });

  it('bul adımında her yeni kelime bir kez sorulur (18 Kasım: fazladan tur yok), aynı kelime art arda gelmez', () => {
    for (let s = 1; s <= 40; s++) {
      const plan = dersPlani({ unite: ciftlik, no: 0, yas: '5+', bilinen: [], isinma: [], ilk: false }, tohum(s));
      const bul = plan.find((a) => a.tip === 'bul');
      if (bul?.tip !== 'bul') throw new Error('bul adımı yok');
      const sira = bul.sorular.map((q) => q.hedef.id);
      expect(sira).toHaveLength(4);
      for (const id of ['sheep', 'cow', 'duck', 'cat']) expect(sira.filter((x) => x === id).length, id).toBe(1);
      for (let i = 1; i < sira.length; i++) expect(sira[i], `tohum ${s}`).not.toBe(sira[i - 1]);
      const kucuk = dersPlani({ unite: ciftlik, no: 0, yas: '2-3', bilinen: [], isinma: [], ilk: false }, tohum(s)).find((a) => a.tip === 'bul');
      expect(kucuk?.tip === 'bul' && kucuk.sorular).toHaveLength(4);
    }
  });

  it('her soruda hedef seçeneklerin içindedir, seçenekler birbirinden farklıdır', () => {
    const yaslar: Yas[] = ['2-3', '4', '5+'];
    for (const yas of yaslar) for (let s = 1; s <= 20; s++) {
      const bilinen = ciftlik.kelimeler;
      for (const no of [0, 1, 2] as const) {
        const plan = dersPlani({ unite: renkler, no, yas, bilinen, isinma: bilinen.slice(0, 2), ilk: false }, tohum(s * 7 + no));
        for (const a of plan) {
          const sorular = a.tip === 'bul' || a.tip === 'tekrar' || a.tip === 'balon' || a.tip === 'besle' || a.tip === 'ogret' ? a.sorular : [];
          for (const q of sorular) {
            expect(q.secenekler.some((w) => w.id === q.hedef.id)).toBe(true);
            expect(new Set(q.secenekler.map((w) => w.id)).size).toBe(q.secenekler.length);
            expect(q.secenekler.length).toBeGreaterThanOrEqual(2);
            expect(q.secenekler.length).toBeLessThanOrEqual(4);
          }
        }
        expect(soruSayisi(plan)).toBeGreaterThan(0);
      }
    }
  });

  it('küçük yaş grubunda seçenek hep iki tanedir', () => {
    expect(secenekSayisi('2-3', 0, 6)).toBe(2);
    expect(secenekSayisi('2-3', 5, 6)).toBe(2);
    expect(secenekSayisi('4', 0, 6)).toBe(2);
    expect(secenekSayisi('4', 5, 6)).toBe(3);
    expect(secenekSayisi('5+', 0, 6)).toBe(3);
    expect(secenekSayisi('5+', 5, 6)).toBe(4);
  });

  it('ısınma yalnız daha önce öğrenilmiş en az iki kelime varken eklenir', () => {
    const tek = dersPlani({ unite: ciftlik, no: 1, yas: '4', bilinen: [ciftlik.kelimeler[0]], isinma: [ciftlik.kelimeler[0]], ilk: false }, tohum(5));
    expect(tek.some((a) => a.tip === 'tekrar')).toBe(false);
  });

  it('aralı dizi: her kelime istenen kadar geçer', () => {
    const d = araliDizi(ciftlik.kelimeler, 2, tohum(5));
    expect(d).toHaveLength(16);
    for (const w of ciftlik.kelimeler) expect(d.filter((x) => x.id === w.id)).toHaveLength(2);
    for (let i = 1; i < d.length; i++) expect(d[i].id).not.toBe(d[i - 1].id);
  });

  it('çeldiriciler önce aynı dersin kelimelerinden seçilir', () => {
    const [a, b, c] = ciftlik.kelimeler;
    const q = soruUret(a, [a, b, c], renkler.kelimeler, 3, tohum(4));
    expect(q.secenekler.map((w) => w.id).sort()).toEqual([a.id, b.id, c.id].sort());
  });

  it("Kino'ya Öğret: hem doğru hem yanlış gösterilen soru vardır", () => {
    const q = ogretSorulari(ciftlik.kelimeler.slice(0, 3), [], 4, tohum(6));
    expect(q).toHaveLength(4);
    expect(q.some((x) => x.gosterilen.id === x.hedef.id)).toBe(true);
    expect(q.some((x) => x.gosterilen.id !== x.hedef.id)).toBe(true);
  });

  it('Ne Eksik: kaybolan kelime hem sahnede hem seçeneklerde', () => {
    for (const t of eksikTurlari(ciftlik.kelimeler, [], 5, '5+', tohum(8))) {
      expect(t.gosterilen.some((w) => w.id === t.eksik.id)).toBe(true);
      expect(t.secenekler.some((w) => w.id === t.eksik.id)).toBe(true);
      expect(t.gosterilen).toHaveLength(3);
    }
  });

  it('sayılar ünitesinde oyun adımı sayma işidir: adet hedef sayıya eşit, seçenekler küçükten büyüğe', () => {
    const unite = UNITELER[2];
    for (const no of [0, 1, 2] as const) {
      const plan = dersPlani({ unite, no, yas: '5+', bilinen: ciftlik.kelimeler, isinma: [], ilk: false }, tohum(11 + no));
      const adim = plan.find((a) => a.tip === 'say');
      if (adim?.tip !== 'say') throw new Error('Kaç Tane adımı yok');
      // üniteye özel oyun, genel ikinci oyunun (Kino, Ne Eksik, Obur) yerini alır
      expect(plan.some((a) => a.tip === 'ogret' || a.tip === 'eksik' || a.tip === 'besle'), `ders ${no}`).toBe(false);
      for (const t of adim.turlar) {
        expect(t.adet).toBe(SAYI_KELIMELERI.indexOf(t.hedef.id) + 1);
        expect(t.secenekler.some((w) => w.id === t.hedef.id)).toBe(true);
        const degerler = t.secenekler.map((w) => SAYI_KELIMELERI.indexOf(w.id));
        expect(degerler).toEqual([...degerler].sort((x, y) => x - y));
        expect(t.nesne && ciftlik.kelimeler.some((w) => w.id === t.nesne!.id)).toBe(true);
      }
    }
  });

  it('hareketler ünitesinde oyun adımı Polly Diyor ki: seçenekler yalnız hareket kelimeleri', () => {
    const unite = UNITELER[10];
    for (const no of [0, 1, 2] as const) {
      const plan = dersPlani({ unite, no, yas: '5+', bilinen: ciftlik.kelimeler, isinma: [], ilk: false }, tohum(11 + no));
      const adim = plan.find((a) => a.tip === 'yap');
      if (adim?.tip !== 'yap') throw new Error('Polly Diyor ki adımı yok');
      // üniteye özel oyun, genel ikinci oyunun (Kino, Ne Eksik, Obur) yerini alır
      expect(plan.some((a) => a.tip === 'ogret' || a.tip === 'eksik' || a.tip === 'besle'), `ders ${no}`).toBe(false);
      for (const q of adim.sorular) expect(q.secenekler.every((w) => w.tur === 'eylem')).toBe(true);
    }
  });

  it('ailem ünitesinde oyun adımı Kapıda Kim Var: seçenekler yalnız aile bireyleri', () => {
    const unite = UNITELER[5];
    for (const no of [0, 1, 2] as const) {
      const plan = dersPlani({ unite, no, yas: '5+', bilinen: ciftlik.kelimeler, isinma: [], ilk: false }, tohum(11 + no));
      const adim = plan.find((a) => a.tip === 'kapi');
      if (adim?.tip !== 'kapi') throw new Error('Kapıda Kim Var adımı yok');
      // üniteye özel oyun, genel ikinci oyunun (Kino, Ne Eksik, Obur) yerini alır
      expect(plan.some((a) => a.tip === 'ogret' || a.tip === 'eksik' || a.tip === 'besle'), `ders ${no}`).toBe(false);
      for (const q of adim.sorular) expect(q.secenekler.every((w) => w.tur === 'kisi')).toBe(true);
    }
  });

  it('oyun planı her oyun için üretilir', () => {
    for (const tip of ['bul', 'ogret', 'balon', 'eksik', 'besle', 'eslestir'] as const) {
      const a = oyunPlani(tip, ciftlik.kelimeler, renkler.kelimeler, '4', tohum(11));
      expect(a.tip).toBe(tip);
      expect(soruSayisi([a])).toBeGreaterThan(0);
    }
  });
});

describe('ingilizce · ilerleme ve aralıklı tekrar', () => {
  const T0 = new Date(2026, 10, 17, 10, 0, 0).getTime();

  it('bozuk ya da yabancı kayıt güvenle temizlenir', () => {
    expect(kayitCoz(null)).toEqual(bosKayit());
    expect(kayitCoz('{bozuk')).toEqual(bosKayit());
    const k = kayitCoz(JSON.stringify({ dersler: { 'ciftlik-1': 9, 'yok-1': 3 }, kelimeler: { sheep: { kutu: 99, son: 5 }, uydurma: { kutu: 1 } }, cikartmalar: ['sheep', 'sheep', 'uydurma', 7] }));
    expect(k.dersler).toEqual({ 'ciftlik-1': 3 });
    expect(k.kelimeler.sheep.kutu).toBe(ARALIKLAR.length);
    expect(k.kelimeler.uydurma).toBeUndefined();
    // bitmiş dersin çekirdek kelimeleri albüme eklenir (sonradan eklenenler eklenmez)
    expect(k.cikartmalar).toEqual(['sheep', 'cow', 'duck', 'cat']);
    expect(kayitCoz(JSON.stringify({ dersler: { 'ciftlik-2': 1 } })).cikartmalar).toEqual(['dog', 'horse']);
    // çıkartması olup tekrar kaydı olmayan kelime onarılır: tekrar seçimine girer
    const onarilan = kayitCoz(JSON.stringify({ cikartmalar: ['sheep', 'cow', 'duck'], kelimeler: {} }));
    expect(Object.keys(onarilan.kelimeler).sort()).toEqual(['cow', 'duck', 'sheep']);
    expect(tekrarSec(onarilan, T0, 6)).toHaveLength(3);
  });

  it('ders bitince yıldız ve çıkartmalar kaydedilir; daha düşük yıldız eskisini ezmez', () => {
    let k = dersBitir(bosKayit(), 'ciftlik-1', 3, ['sheep', 'cow', 'duck'], T0);
    expect(k.cikartmalar).toEqual(['sheep', 'cow', 'duck']);
    k = dersBitir(k, 'ciftlik-1', 1, ['sheep', 'cow', 'duck'], T0 + 1000);
    expect(k.dersler['ciftlik-1']).toBe(3);
    expect(k.cikartmalar).toHaveLength(3);
    expect(toplamYildiz(k)).toBe(3);
  });

  it('sıradaki ders yolu izler: hazır olmayan dersi atlar, üç ada sonra çiftliğin cümlelerine döner', () => {
    let k = bosKayit();
    expect(siradakiDers(k)?.id).toBe('ciftlik-1');
    k = dersBitir(k, 'ciftlik-1', 2, [], T0);
    expect(siradakiDers(k)?.id).toBe('ciftlik-2');
    for (const no of [2, 3]) k = dersBitir(k, `ciftlik-${no}`, 2, [], T0);
    expect(siradakiDers(k)?.id).toBe('renkler-1');
    expect(siradakiDers(k, (d) => d.unite.id !== 'renkler')?.id).toBe('sayilar-1');
    for (const u of ['renkler', 'sayilar']) for (const no of [1, 2, 3]) k = dersBitir(k, `${u}-${no}`, 2, [], T0);
    expect(siradakiDers(k)?.id).toBe('ciftlik-4');
    // üst seviyenin çizimi ya da sesi hazır değilse yol kelime dersleriyle sürer
    expect(siradakiDers(k, (d) => d.seviye === 1)?.id).toBe('yiyecekler-1');
    expect(siradakiDers(k, () => false)).toBeNull();
  });

  it('doğru cevap vadesi gelen kelimeyi üst kutuya çıkarır; aynı gün art arda bilmek kutuyu yükseltmez', () => {
    let k = dersBitir(bosKayit(), 'ciftlik-1', 3, ['sheep'], T0);
    k = cevapIsle(k, 'sheep', true, T0);
    for (let i = 0; i < 5; i++) k = cevapIsle(k, 'sheep', true, T0 + 60_000 * (i + 1));
    expect(k.kelimeler.sheep).toMatchObject({ kutu: 2, dogru: 6 });
    k = cevapIsle(k, 'sheep', true, T0 + GUN_MS + 1000); // ertesi gün: vadesi geldi
    expect(k.kelimeler.sheep.kutu).toBe(3);
    k = cevapIsle(k, 'sheep', false, T0 + GUN_MS + 2000);
    expect(k.kelimeler.sheep).toMatchObject({ kutu: 2, yanlis: 1 });
    // günler geçtikçe her vadede bir kutu yükselir, en üst kutuda durur
    let an = T0 + GUN_MS + 2000;
    for (let i = 0; i < 10; i++) { an += 9 * GUN_MS; k = cevapIsle(k, 'sheep', true, an); }
    expect(k.kelimeler.sheep.kutu).toBe(ARALIKLAR.length);
    expect(cevapIsle(k, 'uydurma', true, T0)).toBe(k);
  });

  it('vadesi gelen kelimeler: alt kutu önce, üst kutu beklemesi dolunca', () => {
    let k = dersBitir(bosKayit(), 'ciftlik-1', 3, ['sheep', 'cow', 'duck'], T0);
    k = cevapIsle(k, 'cow', true, T0); // kutu 2: 1 gün
    k = cevapIsle(k, 'duck', true, T0);
    k = cevapIsle(k, 'duck', true, T0 + GUN_MS); // ertesi gün bir daha: kutu 3, 2 gün
    expect(vadesiGelenler(k, T0 + 1000)).toEqual(['sheep']);
    expect(vadesiGelenler(k, T0 + GUN_MS + 1000)).toEqual(['sheep', 'cow']);
    expect(vadesiGelenler(k, T0 + 3 * GUN_MS + 1000)).toEqual(['sheep', 'cow', 'duck']);
  });

  it('tekrar seçimi: vadeliler yetmezse en eski sorulanlarla tamamlanır, dersin kelimeleri hariç tutulur', () => {
    let k = dersBitir(bosKayit(), 'ciftlik-1', 3, ['sheep', 'cow', 'duck'], T0);
    k = cevapIsle(k, 'cow', true, T0 + 10);
    k = cevapIsle(k, 'duck', true, T0 + 20);
    expect(tekrarSec(k, T0 + 100, 2)).toEqual(['sheep', 'cow']);
    expect(tekrarSec(k, T0 + 100, 2, ['sheep'])).toEqual(['cow', 'duck']);
    expect(tekrarSec(bosKayit(), T0, 4)).toEqual([]);
  });

  it('günün tekrarı gün değişince sıfırlanır', () => {
    let k = tekrarBitir(bosKayit(), T0);
    expect(bugunTekrarEdildi(k, T0 + 3600_000)).toBe(true);
    expect(bugunTekrarEdildi(k, T0 + GUN_MS)).toBe(false);
    k = tekrarBitir(k, T0 + 1000);
    expect(k.tekrar.adet).toBe(2);
    expect(gunDamgasi(T0)).toBe('2026-11-17');
  });

  it('çalışılan günler: seri art arda günleri sayar, bugün henüz yapılmadıysa bozulmuş görünmez, atlanınca sıfırlanır', () => {
    // T0 = 17 Kasım 2026 Salı
    let k = dersBitir(bosKayit(), 'ciftlik-1', 3, ['sheep'], T0 - 2 * GUN_MS);
    k = tekrarBitir(k, T0 - GUN_MS);
    expect(seri(k, T0)).toBe(2); // Pazar ve Pazartesi çalışıldı; Salı henüz yok
    k = dersBitir(k, 'ciftlik-2', 3, ['cat'], T0);
    k = dersBitir(k, 'ciftlik-3', 3, [], T0 + 3600_000); // aynı gün ikinci ders: gün bir kez sayılır
    expect(k.gunler).toEqual(['2026-11-15', '2026-11-16', '2026-11-17']);
    expect(seri(k, T0)).toBe(3);
    expect(seri(k, T0 + 2 * GUN_MS)).toBe(0); // Çarşamba atlandı
    const h = haftaDurumu(k, T0);
    expect(h.bugun).toBe(1); // Salı
    expect(h.gunler).toEqual([true, true, false, false, false, false, false]);
    expect(seri(bosKayit(), T0)).toBe(0);
    expect(kayitCoz(JSON.stringify({ gunler: ['2026-11-17', 'bozuk', 5, '2026-11-17'] })).gunler).toEqual(['2026-11-17']);
  });

  it('yıldız: hatasız 3, birkaç hata 2, çok hata 1', () => {
    expect(yildizHesapla(0, 16)).toBe(3);
    expect(yildizHesapla(2, 16)).toBe(3);
    expect(yildizHesapla(4, 16)).toBe(2);
    expect(yildizHesapla(9, 16)).toBe(1);
    expect(yildizHesapla(0, 0)).toBe(3);
  });
});

describe('ingilizce · seviye 2 ve 3', () => {
  const ciftlik = UNITELER[0];
  const tipler = (a: Adim[]) => a.map((x) => x.tip);
  const girdi = (no: 3 | 4 | 5 | 6 | 7 | 8, yas: Yas = '5+') => ({ unite: ciftlik, no, yas, bilinen: [], isinma: [], ilk: false });

  it('her adada sekiz yeni ifade, dört soru, dört kurulacak cümle ve dört sayfalık hikâye vardır', () => {
    const kimlikler = new Map<string, string>();
    for (const u of UNITELER) {
      const x = ILERISI[u.id];
      expect(x, u.id).toBeTruthy();
      expect(x.a.ifadeler, u.id).toHaveLength(4);
      expect(x.b.ifadeler, u.id).toHaveLength(4);
      expect(x.sohbet.turlar, u.id).toHaveLength(4);
      expect(x.kur, u.id).toHaveLength(4);
      expect(x.hikaye.sayfalar, u.id).toHaveLength(4);
      for (const f of [...x.a.ifadeler, ...x.b.ifadeler, ...x.kur, ...x.hikaye.sayfalar, ...x.sohbet.turlar.map((t) => t.dogru)]) {
        // aynı kimlik hep aynı cümledir
        if (kimlikler.has(f.id)) expect(kimlikler.get(f.id), f.id).toBe(f.en); else kimlikler.set(f.id, f.en);
        for (const k of [f.g.k, f.g.ile, ...f.parcalar.map((p) => p.g?.k)]) if (k) expect(kelimeBul(k), `${f.id}: ${k}`).toBeTruthy();
      }
      // cümle kurma taşları sırayla okununca cümlenin kendisini verir
      for (const f of [...x.a.ifadeler, ...x.b.ifadeler, ...x.kur]) {
        expect(f.parcalar.length, f.id).toBeGreaterThanOrEqual(2);
        expect(f.parcalar.map((p) => p.en).join(' '), f.id).toBe(f.en.replace(/[.!?]$/, ''));
        expect(new Set(f.parcalar.map((p) => p.en.toLowerCase())).size, f.id).toBe(f.parcalar.length);
      }
      // sabit seçenekli soruda doğru cevap seçeneklerin içindedir
      for (const t of x.sohbet.turlar) if (t.secenekler) expect(t.secenekler.some((c) => c.id === t.dogru.id), t.en).toBe(true);
    }
  });

  it('ses listesi: kimlikler benzersiz, bir kayıt en çok üç cümle, var olan kelime kayıtları yeniden üretilmez', () => {
    const kelimeKayitlari = new Set(UNITELER.flatMap(uniteSesleri).map((s) => s.id));
    const hepsi = [...ortakSesler2(), ...UNITELER.flatMap(ilerisiSesleri)];
    expect(new Set(hepsi.map((s) => s.id)).size).toBe(hepsi.length);
    for (const s of hepsi) {
      expect(kelimeKayitlari.has(s.id), s.id).toBe(false);
      expect(s.metin.split(/[.!?…]+/).filter((p) => p.trim()).length, s.id).toBeLessThanOrEqual(3);
      if (s.dil === 'en') expect(s.metin, s.id).not.toMatch(/[çğıöşüÇĞİÖŞÜ]/);
    }
    // dersin çaldığı her ses ya bu listede ya kelime kayıtlarında ya da Seviye 1'in ortak sözlerindedir
    const bilinen = new Set([...hepsi.map((s) => s.id), ...kelimeKayitlari, ...ortakSesler().map((s) => s.id)]);
    for (const u of UNITELER) for (const no of [3, 4, 5, 6, 7, 8] as const) for (const id of dersSesKimlikleri(u, no)) expect(bilinen.has(id), `${u.id}-${no + 1}: ${id}`).toBe(true);
  });

  it('Seviye 2 dersi: dört yeni cümle, Hangisi?, cümle kur; açıklamayı Ceren yalnız ilk cümlede yapar', () => {
    const plan = dersPlani(girdi(3), tohum(4));
    expect(tipler(plan)).toEqual(['selam', 'anlat', 'anlat', 'anlat', 'anlat', 'tarif', 'kur', 'veda']);
    const anlatilan = plan.filter((a) => a.tip === 'anlat');
    expect(anlatilan.map((a) => (a.tip === 'anlat' ? a.aciklama : ''))).toEqual(['tr/d-ciftlik-a', undefined, undefined, undefined]);
    const tarif = plan.find((a) => a.tip === 'tarif');
    if (tarif?.tip !== 'tarif') throw new Error('tarif yok');
    expect(tarif.sorular).toHaveLength(4);
    for (const q of tarif.sorular) {
      expect(q.secenekler.some((f) => f.id === q.hedef.id)).toBe(true);
      expect(new Set(q.secenekler.map((f) => f.id)).size).toBe(q.secenekler.length);
    }
    for (let i = 1; i < tarif.sorular.length; i++) expect(tarif.sorular[i].hedef.id).not.toBe(tarif.sorular[i - 1].hedef.id);
    expect(soruSayisi(plan)).toBeGreaterThan(6);
  });

  it('üst seviyenin altı dersinde oyunlar birbirinden farklıdır: Hangisi? yalnız iki derste, art arda iki derste aynı oyun yok', () => {
    const oyunlar = ([3, 4, 5, 6, 7, 8] as const).map((no) => tipler(dersPlani(girdi(no), tohum(4))).filter((t) => t !== 'selam' && t !== 'veda' && t !== 'anlat'));
    expect(oyunlar).toEqual([
      ['tarif', 'kur'], ['dogrumu', 'posta'], ['hafiza2', 'yakala', 'soyle2'],
      ['sohbet', 'sensor'], ['tarif', 'kur'], ['hikaye', 'masaloyun', 'sirala'],
    ]);
    // on iki adanın hepsinde: bir dersin oyun dizisi bir öncekinin aynısı değildir
    for (const u of UNITELER) {
      const dizi = ([3, 4, 5, 6, 7, 8] as const).map((no) => tipler(dersPlani({ unite: u, no, yas: '5+', bilinen: [], isinma: [], ilk: false }, tohum(no))).filter((t) => t !== 'selam' && t !== 'veda' && t !== 'anlat').join(','));
      for (let i = 1; i < dizi.length; i++) expect(dizi[i], `${u.id} ${i + 4}`).not.toBe(dizi[i - 1]);
    }
  });

  it('Doğru mu?: hem uyan hem uymayan resim vardır; uymayan resim söylenen cümleyle aynı şeyi göstermez', () => {
    for (const u of UNITELER) {
      const x = ILERISI[u.id];
      for (const liste of [x.a.ifadeler, x.b.ifadeler]) {
        for (let s = 1; s <= 12; s++) {
          const sorular = dogruMuSorulari(liste, 6, tohum(s));
          expect(sorular).toHaveLength(6);
          expect(sorular.some((q) => q.soylenen.id === q.gosterilen.id), u.id).toBe(true);
          expect(sorular.some((q) => q.soylenen.id !== q.gosterilen.id), u.id).toBe(true);
          for (const q of sorular) {
            expect(liste.some((f) => f.id === q.gosterilen.id)).toBe(true);
            if (q.soylenen.id === q.gosterilen.id) continue;
            // kalp gibi süsler dışında resim tarifi farklıdır (anne / kalpli anne aynı sayılır)
            const tarif = (f: Ifade) => JSON.stringify({ ...f.g, kalp: undefined });
            expect(tarif(q.gosterilen), `${q.soylenen.id} / ${q.gosterilen.id}`).not.toBe(tarif(q.soylenen));
          }
          for (let i = 1; i < sorular.length; i++) expect(sorular[i].soylenen.id).not.toBe(sorular[i - 1].soylenen.id);
        }
      }
    }
  });

  it('cümle şenliği: hafıza çiftlerinin özneleri farklıdır; sayılı kalıpların adasında Say ve Koy, ötekilerde dürbün oynanır', () => {
    const sayili: string[] = [];
    for (const u of UNITELER) {
      for (let s = 1; s <= 8; s++) {
        const plan = dersPlani({ unite: u, no: 5, yas: '5+', bilinen: [], isinma: [], ilk: false }, tohum(s));
        const hafiza = plan.find((a) => a.tip === 'hafiza2');
        if (hafiza?.tip !== 'hafiza2') throw new Error('hafıza yok');
        expect(hafiza.ifadeler, u.id).toHaveLength(4);
        const ozneler = hafiza.ifadeler.map((f) => f.g.ozel ?? `${f.g.k}+${f.g.ile ?? ''}`);
        expect(new Set(ozneler).size, u.id).toBe(4);
        // 13–24. adalarda Say ve Koy, adanın kendi oyununun yedeğidir (ada-oyunlari-veri.ts)
        const adaOyunu = plan.find((a) => a.tip === 'adaoyunu');
        const say = adaOyunu?.tip === 'adaoyunu' ? adaOyunu.yedek : plan.find((a) => a.tip === 'saykoy');
        if (say?.tip === 'saykoy') {
          if (s === 1) sayili.push(u.id);
          expect(say.turlar.length, u.id).toBeGreaterThanOrEqual(3);
          say.turlar.forEach((t, i) => {
            expect(t.adet).toBe(t.ifade.g.adet);
            expect(t.kelime.id).toBe(t.ifade.g.k);
            expect(t.adet).toBeGreaterThanOrEqual(1);
            expect(t.adet).toBeLessThanOrEqual(8);
            if (i) expect(t.adet, u.id).not.toBe(say.turlar[i - 1].adet);
          });
          expect(plan.some((a) => a.tip === 'yakala')).toBe(false);
        } else {
          expect(sayili.includes(u.id), `${u.id} tohum ${s}`).toBe(false);
          // 13–24. adaların beşinde Dürbün adanın kendi oyununun yedeğidir (ada-oyunlari-veri.ts)
          const oyun = plan.find((a) => a.tip === 'adaoyunu');
          const yakala = oyun?.tip === 'adaoyunu' ? oyun.yedek : plan.find((a) => a.tip === 'yakala');
          if (yakala?.tip !== 'yakala') throw new Error(`${u.id}: dürbün yok`);
          // söylenen resim mercekten ilk geçen resim değildir
          for (const q of yakala.sorular) { expect(q.secenekler.some((f) => f.id === q.hedef.id)).toBe(true); if (q.secenekler.length > 1) expect(q.secenekler[0].id).not.toBe(q.hedef.id); }
        }
        const soyle = plan.find((a) => a.tip === 'soyle2');
        if (soyle?.tip !== 'soyle2') throw new Error('sen söyle yok');
        expect(soyle.ifadeler).toHaveLength(3);
      }
    }
    expect(sayili.sort()).toEqual(['doga', 'oyuncaklar', 'sayilar', 'tasitlar']);
    expect(farkliOzneler(ILERISI.ciftlik.a.ifadeler, 4, tohum(1))).toHaveLength(2);
  });

  it('Sen Sor: aynı soru ikinci kez gelince örnek yinelenmez; evet / hayır sorularında Polly sırayla cevaplar', () => {
    for (const u of UNITELER) {
      const turlar = senSorTurlari(ILERISI[u.id].sohbet.turlar, 3, tohum(3));
      expect(turlar, u.id).toHaveLength(3);
      const gorulen = new Set<string>();
      for (const t of turlar) { expect(t.ornekli, t.soru.en).toBe(!gorulen.has(t.soru.en)); gorulen.add(t.soru.en); expect(t.cevap.ses).toBeTruthy(); }
    }
    const sever = senSorTurlari(ILERISI.yiyecekler.sohbet.turlar, 3, tohum(3));
    expect(new Set(sever.map((t) => t.cevap.id)).size).toBe(2);
  });

  it('selamlaşmanın günlük sözü dersten derse döner; Ceren yalnız ilk karşılaşmalarda açıklar', () => {
    expect([0, 1, 2, 3, 4, 5, 6, 7].map((n) => rutinSec(n).ad)).toEqual(['nasilsin', 'adin', 'yasin', 'nasilsin', 'adin', 'yasin', 'nasilsin', 'adin']);
    expect([0, 5, 6, 30].map((n) => rutinSec(n).aciklamali)).toEqual([true, true, false, false]);
    // kelime derslerinde (1. seviye) günlük söz yoktur; üst seviyede yalnız ders sayısı verilmişse gelir
    const ilk = dersPlani({ unite: ciftlik, no: 0, yas: '4', bilinen: [], isinma: [], ilk: false, ustDersSayisi: 3 }, tohum(1))[0];
    expect(ilk.tip === 'selam' && ilk.rutin).toBeFalsy();
    const ust = dersPlani({ ...girdi(3), ustDersSayisi: 4 }, tohum(1))[0];
    expect(ust.tip === 'selam' && ust.rutin).toEqual({ ad: 'adin', aciklamali: true });
    const eski = dersPlani(girdi(3), tohum(1))[0];
    expect(eski.tip === 'selam' && eski.rutin).toBeFalsy();
    // yeni oyunların ve günlük sözlerin kayıtları ses listesindedir
    const idler = new Set(ortakSesler2().map((s) => s.id));
    for (const id of ['tr/c-dogrumu-giris', 'tr/c-yakala-giris', 'tr/c-soyle2-giris', 'tr/c-anlat-sen', 'tr/c-saykoy-giris', 'tr/c-sensor-giris', 'tr/c-rutin-nasilsin', 'tr/c-rutin-adin', 'tr/c-rutin-yasin', 'en/g-how-are-you', 'en/g-im-fine', 'en/g-whats-your-name', 'en/g-my-name-is-polly', 'en/g-how-old-are-you', 'en/g-im-three']) expect(idler.has(id), id).toBe(true);
  });

  it('cümle kurma: taşlar karışık gelir, hepsi yerindedir; 5 yaş üstünde fazladan bir taş vardır', () => {
    const cumleler: Ifade[] = ILERISI.ciftlik.kur;
    for (let s = 1; s <= 30; s++) {
      for (const yas of ['4', '5+'] as Yas[]) {
        for (const t of kurTurlari(cumleler, yas, tohum(s))) {
          const dogru = t.ifade.parcalar.map((p) => p.en);
          for (const en of dogru) expect(t.taslar.some((p) => p.en === en)).toBe(true);
          expect(t.taslar).toHaveLength(dogru.length + (yas === '5+' ? 1 : 0));
          if (yas === '4') expect(t.taslar.map((p) => p.en)).not.toEqual(dogru);
          // fazladan taş cümlenin hiçbir taşıyla aynı yazılmaz (hangisinin doğru olduğu belirsiz kalmasın)
          const fazla = t.taslar.filter((p) => !dogru.includes(p.en));
          for (const p of fazla) expect(dogru.map((x) => x.toLowerCase())).not.toContain(p.en.toLowerCase());
        }
      }
    }
  });

  it('Seviye 3 dersleri: soru–cevap, cümle kurma, hikâye (dinle, resmini bul, sıraya diz)', () => {
    const sohbet = dersPlani(girdi(6), tohum(7));
    expect(tipler(sohbet)).toEqual(['selam', 'sohbet', 'sensor', 'veda']);
    const s = sohbet[1];
    if (s.tip !== 'sohbet') throw new Error('sohbet yok');
    expect(s.turlar).toHaveLength(4);
    for (const t of s.turlar) expect(t.secenekler.some((c) => c.id === t.soru.dogru.id)).toBe(true);
    expect(tipler(dersPlani(girdi(7), tohum(7)))).toEqual(['selam', 'tarif', 'kur', 'veda']);
    const hikaye = dersPlani(girdi(8), tohum(7));
    // 22 Kasım: masaldan sonra Masal Oyunu (resimli anlama soruları), yankı okuma yok
    expect(tipler(hikaye)).toEqual(['selam', 'hikaye', 'masaloyun', 'sirala', 'veda']);
    const oyun = hikaye[2];
    expect(oyun.tip === 'masaloyun' && oyun.uniteId).toBe('ciftlik');
    const sirala = hikaye[3];
    if (sirala.tip !== 'sirala') throw new Error('sirala yok');
    expect(sirala.karisik.map((f) => f.id).sort()).toEqual(sirala.sayfalar.map((f) => f.id).sort());
    expect(sirala.karisik.map((f) => f.id)).not.toEqual(sirala.sayfalar.map((f) => f.id));
    // seviyenin son dersi "seviye bitti" vedasıyla kapanır
    for (const no of [5, 8] as const) { const p = dersPlani(girdi(no), tohum(1)); const v = p[p.length - 1]; expect(v.tip === 'veda' && v.unite).toBe(true); }
    for (const u of UNITELER) for (const no of [3, 4, 5, 6, 7, 8] as const) {
      expect(dersIfadeleri(u, no).length, `${u.id}-${no + 1}`).toBeGreaterThanOrEqual(2);
      // soru – cevap dersinde yalnız konuşulur (yiyeceklerde bütün sorular çocuğun kendi cevabıdır): soru sayısı sıfır olabilir
      const sayi = soruSayisi(dersPlani({ unite: u, no, yas: '4', bilinen: [], isinma: [], ilk: false }, tohum(no)));
      if (no === 6) expect(sayi, `${u.id}-${no + 1}`).toBeGreaterThanOrEqual(0); else expect(sayi, `${u.id}-${no + 1}`).toBeGreaterThan(0);
    }
  });
});

describe('ingilizce · Fener Avı (Oyunlar bölümünün tek oyunu)', () => {
  const ada = (id: string, n: number) => {
    const u = UNITELER.find((x) => x.id === id)!;
    const kelimeler = u.kelimeler.slice(0, 8);
    return { uniteId: id, kelimeler, ogrenilen: kelimeler.slice(0, n) };
  };

  it('en çok iki ada; adada 3 soru (tek adaysa 4); sorular öğrenilmiş kelimelerden, tekrarsız', () => {
    for (let s = 1; s <= 30; s++) {
      const a = fenerPlani([ada('ciftlik', 6), ada('yiyecekler', 4), ada('renkler', 3)], [], tohum(s));
      if (a.tip !== 'fener') throw new Error('fener yok');
      expect(a.sahneler).toHaveLength(2);
      expect(new Set(a.sahneler.map((x) => x.uniteId)).size).toBe(2);
      for (const x of a.sahneler) {
        expect(x.sorular).toHaveLength(3);
        expect(new Set(x.sorular.map((w) => w.id)).size).toBe(3);
        const kaynak = [ada('ciftlik', 6), ada('yiyecekler', 4), ada('renkler', 3)].find((y) => y.uniteId === x.uniteId)!;
        for (const w of x.sorular) expect(kaynak.ogrenilen.some((o) => o.id === w.id)).toBe(true);
      }
      expect(soruSayisi([a])).toBe(6);
    }
    const tek = fenerPlani([ada('ciftlik', 5)], [], tohum(3));
    expect(tek.tip === 'fener' && tek.sahneler[0].sorular).toHaveLength(4);
  });

  it('unutulmak üzere olan kelimenin adası önce gelir ve o kelime sorulur; üçten az kelimeli ada oynanmaz', () => {
    const cift = ada('ciftlik', 6), yiyecek = ada('yiyecekler', 4);
    const vadeli = yiyecek.ogrenilen[2].id;
    for (let s = 1; s <= 20; s++) {
      const a = fenerPlani([cift, yiyecek, ada('renkler', 2)], [vadeli], tohum(s));
      if (a.tip !== 'fener') throw new Error('fener yok');
      expect(a.sahneler[0].uniteId).toBe('yiyecekler');
      expect(a.sahneler[0].sorular.some((w) => w.id === vadeli)).toBe(true);
      expect(a.sahneler.some((x) => x.uniteId === 'renkler')).toBe(false);
    }
  });
});

describe("ingilizce · Polly'nin Postası", () => {
  const tipler = (a: Adim[]) => a.map((x) => x.tip);
  it('evler dersin cümleleridir (küçükte 3, büyükte 4); üç mektup üç ayrı eve gider', () => {
    for (const yas of ['2-3', '4', '5+'] as const) {
      for (let t = 1; t <= 20; t++) {
        const adim = postaPlani(ILERISI.ciftlik.b.ifadeler, yas, tohum(t));
        if (adim.tip !== 'posta') throw new Error('posta değil');
        expect(adim.evler).toHaveLength(yas === '2-3' ? 3 : 4);
        expect(adim.mektuplar).toHaveLength(3);
        expect(new Set(adim.mektuplar.map((f) => f.id)).size).toBe(3);
        for (const m of adim.mektuplar) expect(adim.evler.some((e) => e.id === m.id)).toBe(true);
      }
    }
  });
  it("bir adada Cümle Kur yalnız iki derste (4. ve 8.), Polly'nin Postası 5. derste", () => {
    for (const u of UNITELER) {
      const dersler = ([3, 4, 5, 6, 7, 8] as const).map((no) => tipler(dersPlani({ unite: u, no, yas: '4', bilinen: [], isinma: [], ilk: false }, tohum(no))));
      expect(dersler.filter((d) => d.includes('kur')).length, u.id).toBe(2);
      expect(dersler[1], u.id).toContain('posta');
    }
  });
});

describe("ingilizce · Kino'yu Giydir", () => {
  it("kıyafetler adasının üç kelime dersinde oyun Kino'yu Giydir; istenenler askıda, askıda en çok altı giysi, yedek oyun hazır", () => {
    const u = UNITELER.find((x) => x.id === 'kiyafetler')!;
    for (const yas of ['2-3', '4', '5+'] as const) {
      for (const no of [0, 1, 2] as const) {
        const plan = dersPlani({ unite: u, no, yas, bilinen: [], isinma: [], ilk: false }, tohum(no + 3));
        const g = plan.find((a) => a.tip === 'giydir');
        if (g?.tip !== 'giydir') throw new Error(`giydir yok: ${no}`);
        expect(g.hedefler).toHaveLength(yas === '2-3' ? 3 : 4);
        expect(g.raf.length).toBeLessThanOrEqual(6);
        for (const w of g.hedefler) expect(g.raf.some((x) => x.id === w.id)).toBe(true);
        expect(g.yedek.tip).not.toBe('giydir');
      }
    }
  });
  it("başka adalarda Kino'yu Giydir yok", () => {
    for (const u of UNITELER.filter((x) => x.id !== 'kiyafetler')) {
      for (const no of [0, 1, 2] as const) expect(dersPlani({ unite: u, no, yas: '4', bilinen: [], isinma: [], ilk: false }, tohum(no)).some((a) => a.tip === 'giydir'), u.id).toBe(false);
    }
  });
});

describe('ingilizce · hayvan dersleri (12 · 30 · 100)', () => {
  const tipler = (a: Adim[]) => a.map((x) => x.tip);
  it('1. derste Hayvan Geçidi 12 hayvan, 2. derste 18 yeni (toplam 30), 3. derste Hayvanat Bahçesi 70 yeni (toplam 100)', () => {
    const p0 = hayvanPlani({ no: 0, yas: '4', ilk: true, isinma: [] }, tohum(1));
    const p1 = hayvanPlani({ no: 1, yas: '4', ilk: false, isinma: [] }, tohum(2));
    const p2 = hayvanPlani({ no: 2, yas: '4', ilk: false, isinma: [] }, tohum(3));
    expect(tipler(p0)).toEqual(['selam', 'gecit', 'bul', 'soyle', 'veda']);
    expect(tipler(p1)).toEqual(['selam', 'gecit', 'balon', 'sasirt', 'soyle', 'veda']);
    expect(tipler(p2)).toEqual(['selam', 'bahce', 'veda']);
    const g0 = p0.find((a) => a.tip === 'gecit'), g1 = p1.find((a) => a.tip === 'gecit'), b2 = p2.find((a) => a.tip === 'bahce');
    if (g0?.tip !== 'gecit' || g1?.tip !== 'gecit' || b2?.tip !== 'bahce') throw new Error('adım yok');
    expect(g0.hayvanlar).toHaveLength(12);
    expect(g1.hayvanlar).toHaveLength(18);
    expect(b2.bolumler).toHaveLength(6);
    const hepsi = [...g0.hayvanlar, ...g1.hayvanlar, ...b2.bolumler.flatMap((b) => b.hayvanlar)].map((w) => w.id);
    expect(hepsi).toHaveLength(100);
    expect(new Set(hepsi).size).toBe(100);
    // her bölümde iki soru, sorulan hayvan o bölümde
    for (const b of b2.bolumler) { expect(b.sorular).toHaveLength(2); for (const w of b.sorular) expect(b.hayvanlar).toContain(w); }
    // şarkı verilince 1. dersin sonunda çalar
    const sarkili = hayvanPlani({ no: 0, yas: '4', ilk: true, isinma: [], sarki: { id: 's', uniteId: 'ciftlik', en: 'S', tr: 'S', satirlar: [] } }, tohum(1));
    expect(tipler(sarkili)).toEqual(['selam', 'gecit', 'bul', 'sarki', 'soyle', 'veda']);
  });
  it('domuz yavrusu yok; 1. dersin 12 hayvanı şarkıdakilerin aynısı (domuz 2. derste)', () => {
    const p0 = hayvanPlani({ no: 0, yas: '5+', ilk: false, isinma: [] }, tohum(4));
    const g0 = p0.find((a) => a.tip === 'gecit');
    if (g0?.tip !== 'gecit') throw new Error('geçit yok');
    expect(g0.hayvanlar.map((w) => w.id).sort()).toEqual(['bird', 'cat', 'chicken', 'cow', 'dog', 'donkey', 'duck', 'goat', 'horse', 'mouse', 'rabbit', 'sheep']);
    const p2 = hayvanPlani({ no: 2, yas: '5+', ilk: false, isinma: [] }, tohum(4));
    const b2 = p2.find((a) => a.tip === 'bahce');
    if (b2?.tip !== 'bahce') throw new Error('bahçe yok');
    expect(b2.bolumler.flatMap((b) => b.hayvanlar).some((w) => w.id === 'piglet')).toBe(false);
  });
  it('açık olmayan hayvan (çizimi ya da sesi yok) derslere girmez', () => {
    const p0 = hayvanPlani({ no: 0, yas: '4', ilk: false, isinma: [], acik: (w) => w.id !== 'rabbit' && w.id !== 'goat' }, tohum(5));
    const g0 = p0.find((a) => a.tip === 'gecit');
    if (g0?.tip !== 'gecit') throw new Error('geçit yok');
    expect(g0.hayvanlar.map((w) => w.id)).not.toContain('rabbit');
    expect(g0.hayvanlar).toHaveLength(10);
  });
});

describe('ingilizce · Şakacı Polly', () => {
  it('iki tur: biri doğru, biri bilerek yanlış; yanlışta söylenen kelime dersin kelimelerinden değil', () => {
    const ciftlik = UNITELER[0];
    const yeni = ciftlik.kelimeler.slice(0, 4);
    for (let t = 1; t <= 30; t++) {
      const turlar = sasirtTurlari(yeni, tohum(t));
      expect(turlar).toHaveLength(2);
      const dogru = turlar.filter((x) => x.goster.id === x.soylenen.id);
      const saka = turlar.filter((x) => x.goster.id !== x.soylenen.id);
      expect(dogru).toHaveLength(1);
      expect(saka).toHaveLength(1);
      expect(yeni.some((w) => w.id === saka[0].soylenen.id)).toBe(false);
      for (const x of turlar) expect(yeni.some((w) => w.id === x.goster.id)).toBe(true);
    }
  });
});
