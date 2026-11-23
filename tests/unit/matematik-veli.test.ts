import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
// Bu dosya ek turlar kapalıyken (çizimleri gelmeden önceki kısa sıra) sınar; açık sıra: matematik-veli-ek.test.ts.
vi.mock('../../matematik/src/ek-turlar', () => ({ ekAcik: (n: number) => n < 100 }));
import { SIRALAR, turTuru, type Kose, type Yol } from '../../matematik/src/tur-sirasi';
import { DERSLER } from '../../matematik/src/ders-yolu-mantik';
import {
  EVDE_BASLANGIC, EVDE_DERS,
  BECERILER, HEPSI_BITTI_ONERISI, KOSELER, OYUNCAK_ADLARI, belirtme, kayitOneki, oyuncakKaydiCoz, turunBecerisi, veliOzeti,
  yasYolu, yonelme, zorKonuOzeti,
} from '../../matematik/src/veli-ozet';

const DERS = 'minkino-matematik-ceren-sayilar-v1';
/** Kayıt deposu: anahtar → değer (JSON'a çevrilir). */
const depo = (kayitlar: Record<string, unknown> = {}) => (anahtar: string) =>
  anahtar in kayitlar ? JSON.stringify(kayitlar[anahtar]) : null;
const tur = (adim: number, ek: Record<string, unknown> = {}) => ({ adim, yer: 0, secimler: [], hatira: false, surum: 2, ...ek });
const hepsi = (n: number) => Array.from({ length: n }, (_, i) => i + 1);
/** Bütün oyuncakları bitmiş, dersi tamam bir kayıt. */
function tamKayit(yol: Yol) {
  const sayilar = yol === 'minik' ? 5 : 10;
  const k: Record<string, unknown> = { [DERS]: { biten: hepsi(sayilar), simdi: sayilar, tanitildi: true, bitti: true } };
  for (const id of KOSELER) k[kayitOneki(yol) + id] = tur(SIRALAR[yol][id].length, { hatira: true, ...(id === 'sayi' ? { kuleTamam: true } : {}) });
  return k;
}

describe('Matematik veli sayfası: kayıtlardan özet', () => {
  it('boş kayıt: hiçbir şey başlamadı, sırada 1 var, Sayı masası Ceren’in dersini bekler, iki başlangıç önerisi', () => {
    const o = veliOzeti({ yas: 5, oku: depo() });
    expect(o.bos).toBe(true);
    expect(o.yol).toBe('bes');
    expect(o.yasYazi).toBe('5 yaş');
    expect(o.ders).toMatchObject({ ogrenilen: 0, toplam: 10, enBuyuk: 0, sirada: 1, durum: 'yok' });
    expect(o.ders.sayilar.map((s) => s.durum)).toEqual(['sirada', ...Array(9).fill('bekliyor')]);
    expect(o.ders.yazi).toContain('Henüz başlamadı');
    expect(o.oyuncaklar.map((t) => [t.id, t.durum, t.tamam, t.toplam, t.hatira])).toEqual([
      ['sayi', 'bekliyor', 0, 10, false], ['sekil', 'yok', 0, 10, false], ['olcu', 'yok', 0, 6, false], ['fener', 'yok', 0, 6, false],
    ]);
    expect(o.oyuncaklar[0].yazi).toBe("Ceren'in dersinden sonra başlar");
    expect(o.turlar).toEqual({ yapilan: 0, toplam: 32 });
    expect(o.hatiralar).toBe(0);
    expect(o.beceriler.map((b) => b.durum)).toEqual(['yok', 'yok', 'yok', 'yok', 'yok']);
    expect(o.oneriler.map((x) => x.beceri)).toEqual(['sayma', 'bakis']);
    expect(o.oneriler[0].metin).toBe('Merdiven çıkarken basamakları birlikte sayın: bir, iki, üç…');
    expect(o.zorlananlar).toEqual([]);
  });

  it('yarım kayıt (4 yaş): üç sayı öğrendi, sırada 4; Şekil evi 3/10; öneriler öğrendiği yere göre', () => {
    const o = veliOzeti({
      yas: 4,
      oku: depo({
        [DERS]: { biten: [1, 2, 3], simdi: 4, tanitildi: true, bitti: false },
        'minkino-matematik-1-dort-sekil': tur(3),
        // Başka yaşın kaydı okunmaz.
        'minkino-matematik-1-olcu': tur(5),
      }),
    });
    expect(o.bos).toBe(false);
    expect(o.yol).toBe('dort');
    expect(o.ders).toMatchObject({ ogrenilen: 3, toplam: 10, enBuyuk: 3, sirada: 4, durum: 'suruyor', yazi: '3 sayı öğrendi. Sırada 4 var.' });
    expect(o.ders.sayilar.slice(0, 5).map((s) => s.durum)).toEqual(['ogrendi', 'ogrendi', 'ogrendi', 'sirada', 'bekliyor']);
    const sekil = o.oyuncaklar.find((t) => t.id === 'sekil')!;
    expect(sekil).toMatchObject({ durum: 'suruyor', tamam: 3, toplam: 10, bitti: false, yazi: '3 / 10 tur' });
    expect(sekil.oran).toBeCloseTo(0.3);
    expect(o.oyuncaklar.find((t) => t.id === 'olcu')!.durum).toBe('yok');
    expect(o.turlar).toEqual({ yapilan: 3, toplam: 32 });
    const b = Object.fromEntries(o.beceriler.map((x) => [x.id, x]));
    // Sayma: Ceren'in 10 sayısı + kule + 9 Sayı masası turu (Hızlı Gözler hariç).
    expect(b.sayma).toMatchObject({ yapilan: 3, toplam: 20, durum: 'suruyor', sonraki: 'ders' });
    // Şekil evinin ilk üç turu: tekne, konum, araba; sıradaki bina.
    expect(b.sekil).toMatchObject({ yapilan: 3, toplam: 7, durum: 'suruyor', sonraki: 'bina' });
    expect(b.bakis.durum).toBe('yok');
    // Merdivende sayma en üstteki Bugün Evde kartında; Evde birlikte yinelemez.
    expect(o.bugun).toEqual({ ders: 'sayilar', baslik: "Ceren'le 3'e kadar saydı", metin: "Merdiven çıkarken birlikte sayın; 4'ü çocuğunuz söylesin." });
    expect(o.oneriler).toEqual([
      { beceri: 'sekil', metin: 'Bloklarla siz küçük bir ev yapın; aynısını o kursun, alttaki parçadan başlasın.' },
      { beceri: 'bakis', metin: 'Zarla oynayın: zarı atınca noktaları saymadan söylesin.' },
    ]);
  });

  it('tam kayıt: her şey bitti, dört hatıra; kutlayan öneri', () => {
    const o = veliOzeti({ yas: 6, oku: depo(tamKayit('bes')) });
    expect(o.yasYazi).toBe('6 yaş ve üzeri');
    expect(o.ders).toMatchObject({ ogrenilen: 10, durum: 'tamam', sirada: undefined, yazi: "1'den 10'a kadar bütün sayıları öğrendi." });
    expect(o.oyuncaklar.every((t) => t.bitti && t.hatira && t.oran === 1 && t.yazi === `Bitirdi · ${t.toplam} tur`)).toBe(true);
    expect(o.turlar).toEqual({ yapilan: 32, toplam: 32 });
    expect(o.hatiralar).toBe(4);
    expect(o.beceriler.every((b) => b.durum === 'tamam' && b.yapilan === b.toplam && b.sonraki === undefined)).toBe(true);
    expect(o.oneriler[0]).toEqual({ beceri: 'hepsi', metin: HEPSI_BITTI_ONERISI });
    expect(o.oneriler).toHaveLength(2);
  });

  it('üç yaş yolu: ders 1–5, kayıtlar minik- önekinde, bir bakışta 3’e kadar', () => {
    for (const yas of [2, 3]) {
      const bos = veliOzeti({ yas, oku: depo({ 'minkino-matematik-1-sayi': tur(4) }) });
      expect(bos.yol).toBe('minik');
      expect(bos.ders.toplam).toBe(5);
      expect(bos.oyuncaklar[0].tamam).toBe(0);
      expect(bos.turlar.toplam).toBe(28);
      expect(bos.beceriler.find((b) => b.id === 'bakis')!.aciklama).toContain("3'e kadar");
      expect(bos.oneriler[1].metin).toContain('Avucunuzda');
    }
    const tam = veliOzeti({ yas: 3, oku: depo(tamKayit('minik')) });
    expect(tam.ders).toMatchObject({ ogrenilen: 5, toplam: 5, durum: 'tamam', yazi: "1'den 5'e kadar bütün sayıları öğrendi." });
    expect(tam.hatiralar).toBe(4);
    expect(tam.beceriler.every((b) => b.durum === 'tamam')).toBe(true);
    // 4 yaşta 1–10 öğrenmiş çocuk 3 yaşa geçerse 2–3 yaşın dersi (1–5) tamamdır; 6–10 gösterilmez.
    const gecis = veliOzeti({ yas: 3, oku: depo({ [DERS]: { biten: hepsi(10), simdi: 10, tanitildi: true, bitti: true } }) });
    expect(gecis.ders.sayilar.map((s) => s.n)).toEqual([1, 2, 3, 4, 5]);
    expect(gecis.ders.durum).toBe('tamam');
  });

  it('yeniden oynanan oyuncak bitmiş sayılır; Sayı masasının Ceren’den gelen hatırası bitiş sayılmaz', () => {
    const o = veliOzeti({
      yas: 5,
      oku: depo({
        [DERS]: { biten: hepsi(10), simdi: 10, tanitildi: true, bitti: true },
        // Ders bitince hatıra Sayı masasına verilir (main.ts → cerenDersiniAc); oyuncak turları henüz başlamadı.
        'minkino-matematik-1-sayi': tur(0, { hatira: true }),
        'minkino-matematik-1-sekil': tur(2, { hatira: true, tekrar: 1 }),
      }),
    });
    const [sayi, sekil] = o.oyuncaklar;
    expect(sayi).toMatchObject({ bitti: false, hatira: true, durum: 'yok', yazi: 'Henüz başlamadı' });
    expect(sekil).toMatchObject({ bitti: true, hatira: true, durum: 'bitti', oran: 1, yazi: 'Bitirdi · yeniden oynuyor (2/10)' });
    expect(o.hatiralar).toBe(2);
    expect(o.turlar.yapilan).toBe(10);
    const b = Object.fromEntries(o.beceriler.map((x) => [x.id, x]));
    expect(b.sekil.durum).toBe('tamam');
    // Ders bitti, kule henüz kurulmadı: öneri kuleye geçer.
    expect(b.sayma).toMatchObject({ yapilan: 10, toplam: 19, durum: 'suruyor', sonraki: 'kule' });
    expect(o.oneriler[0]).toEqual({ beceri: 'sayma', metin: 'Kutuları ya da bardakları üst üste dizin; her katta sayıyı birlikte söyleyin: bir, iki, üç…' });
  });

  it('öneriler düzeye göre değişir: sıradaki işe göre başka oyun, yaşa göre başka sayı', () => {
    const oneri = (yas: number, kayitlar: Record<string, unknown>) => veliOzeti({ yas, oku: depo(kayitlar) }).oneriler.map((x) => x.metin);
    const dersBitti = { [DERS]: { biten: hepsi(10), simdi: 10, tanitildi: true, bitti: true } };
    const ilk = oneri(5, dersBitti);
    const kule = oneri(5, { ...dersBitti, 'minkino-matematik-1-sayi': tur(0, { kuleTamam: true }) });
    const paylas = oneri(5, { ...dersBitti, 'minkino-matematik-1-sayi': tur(1, { kuleTamam: true }) });
    const ekle = oneri(5, { ...dersBitti, 'minkino-matematik-1-sayi': tur(5, { kuleTamam: true }) });
    expect(new Set([ilk[0], kule[0], paylas[0], ekle[0]]).size).toBe(4);
    expect(paylas[0]).toContain('paylaştırsın');
    expect(ekle[0]).toContain('kaç kaldı');
    // Hızlı Gözler yaşa göre: 2–3 yaşta avuçta 2–3 oyuncak, 4 yaşta zar, 5+ parmakla beş ve iki.
    expect(oneri(3, {})[1]).toContain('Avucunuzda');
    expect(oneri(4, {})[1]).toContain('Zarla');
    expect(oneri(5, {})[1]).toContain('beş ve iki');
    // Ceren'in dersi ilerledikçe sayı değişir.
    expect(veliOzeti({ yas: 5, oku: depo({ [DERS]: { biten: [1, 2, 3, 4, 5, 6], simdi: 7, tanitildi: true, bitti: false } }) }).bugun.metin)
      .toBe("Merdiven çıkarken birlikte sayın; 7'yi çocuğunuz söylesin.");
    // Hepsi bitince başka öneri.
    expect(oneri(5, tamKayit('bes'))[0]).toBe(HEPSI_BITTI_ONERISI);
  });

  it('öneri sahneleri (Astra MV2): merdiven, sofra, şekil avı, ritim; sahnesi olmayan öneride resim yok', () => {
    const resimler = (yas: number, k: Record<string, unknown>) => veliOzeti({ yas, oku: depo(k) }).oneriler.map((x) => x.resim);
    expect(resimler(5, {})).toEqual(['evde-merdiven', undefined]);
    const dersBitti = { [DERS]: { biten: hepsi(10), simdi: 10, tanitildi: true, bitti: true } };
    expect(resimler(5, { ...dersBitti, 'minkino-matematik-1-sayi': tur(1, { kuleTamam: true }) })[0]).toBe('evde-sofra');
    // Sayı masası bitti (sayma, bir bakışta tamam): öneriler başlamamış Şekiller (şekil avı) ve Ölçme (sahnesi yok).
    const sayiBitti = { ...dersBitti, 'minkino-matematik-1-sayi': tur(10, { kuleTamam: true, hatira: true }) };
    expect(resimler(5, sayiBitti)).toEqual(['evde-sekil-avi', undefined]);
    expect(resimler(5, tamKayit('bes'))).toEqual([undefined, undefined]);
  });

  it('zorlandığı sayılar: veri yoksa boş (bölüm görünmez), varsa süzülmüş ve sıralı', () => {
    expect(veliOzeti({ yas: 5, oku: depo() }).zorlananlar).toEqual([]);
    expect(veliOzeti({ yas: 5, oku: depo(), zorlananlar: [7, 3, 3, 99, 2.5, -1] }).zorlananlar).toEqual([3, 7]);
  });

  it('zorlandığı konular: veli diliyle, sıra korunur; tanınmayan ve yinelenen atlanır; en çok altı', () => {
    expect(veliOzeti({ yas: 5, oku: depo() }).zorKonular).toEqual([]);
    const z = veliOzeti({ yas: 5, oku: depo(), zorKonular: [
      { alan: 'olcu', konu: 'uzun-kisa' }, { alan: 'sekil', konu: 'ucgen' }, { alan: 'sekil', konu: 'ucgen' },
      { alan: 'oruntu', konu: 'ses' }, { alan: 'siniflama', konu: 'boy' }, { alan: 'muzik', konu: 'davul' }, { alan: 'sekil', konu: 'besgen' },
    ] }).zorKonular;
    expect(z.map((x) => x.alanAdi + ' · ' + x.ad)).toEqual(['Ölçü · uzun ve kısa', 'Şekiller · üçgen', 'Örüntü · ses örüntüsü', 'Sınıflama · boya göre ayırma']);
    const cok = ['daire', 'kare', 'ucgen', 'dikdortgen'].map((konu) => ({ alan: 'sekil', konu }))
      .concat(['renk', 'sekil', 'ses'].map((konu) => ({ alan: 'oruntu', konu })));
    expect(zorKonuOzeti(cok)).toHaveLength(6);
  });

  it('kayıtlar kayit.ts gibi yorumlanır: eski 16 turluk kayıt oranlanır, bozuk kayıt boş sayılır, okuma hatası düşürmez', () => {
    expect(oyuncakKaydiCoz(JSON.stringify({ adim: 8, yer: 0, secimler: [], hatira: false }), 'bes', 'sekil')).toMatchObject({ adim: 5, hatira: false });
    expect(oyuncakKaydiCoz(JSON.stringify({ adim: 16, yer: 0, secimler: [] }), 'bes', 'sekil')).toMatchObject({ adim: 10, hatira: true });
    // Sırası kısalmış yeni kayıt sona taşınır, hatıra alınmış sayılır.
    expect(oyuncakKaydiCoz(JSON.stringify(tur(9)), 'bes', 'olcu')).toMatchObject({ adim: 6, hatira: true });
    for (const bozuk of ['{"adim":2,"yer":11,"secimler":[]}', '{"adim":"x"}', 'xx', '{"adim":1,"yer":0,"secimler":[1,"a"]}', null]) {
      expect(oyuncakKaydiCoz(bozuk, 'bes', 'sayi')).toEqual({ adim: 0, hatira: false, tekrar: 0, kuleTamam: false });
    }
    const hata = veliOzeti({ yas: 5, oku: () => { throw new Error('depolama kapalı'); } });
    expect(hata.bos).toBe(true);
  });

  it('her yaşın her turu tek bir beceriye sayılır; adlar tezgâhla aynı', () => {
    for (const yol of ['minik', 'dort', 'bes'] as Yol[])
      for (const k of KOSELER) {
        const sira = SIRALAR[yol][k];
        sira.forEach((n, i) => expect(turunBecerisi(k, turTuru(k, n, i, sira.length)), `${yol} ${k} ${i}`).toBeDefined());
      }
    expect(BECERILER).toEqual(['sayma', 'bakis', 'sekil', 'olcme', 'oruntu']);
    const kayitKaynagi = readFileSync('matematik/src/kayit.ts', 'utf8');
    for (const k of KOSELER as Kose[]) expect(kayitKaynagi).toContain(`${k}: '${OYUNCAK_ADLARI[k]}'`);
    expect([yasYolu(null), yasYolu(2), yasYolu(3), yasYolu(4), yasYolu(5), yasYolu(6)]).toEqual(['bes', 'minik', 'minik', 'dort', 'bes', 'bes']);
  });

  it('Türkçe sayı ekleri', () => {
    expect(hepsi(10).map(yonelme)).toEqual(["1'e", "2'ye", "3'e", "4'e", "5'e", "6'ya", "7'ye", "8'e", "9'a", "10'a"]);
    expect(hepsi(10).map(belirtme)).toEqual(["1'i", "2'yi", "3'ü", "4'ü", "5'i", "6'yı", "7'yi", "8'i", "9'u", "10'u"]);
  });

  it('Bugün Evde 1 Dakika: her derse bir ipucu; en son bitirilen derse göre; ilerleme yoksa başlangıç', () => {
    for (const d of DERSLER) {
      expect(EVDE_DERS[d], d).toBeTruthy();
      expect(EVDE_DERS[d].length).toBeLessThan(120);
      expect(EVDE_DERS[d].toLocaleLowerCase('tr')).not.toContain('çilek');
    }
    expect(veliOzeti({ yas: 5, oku: depo() }).bugun).toEqual({ baslik: 'Başlarken', metin: EVDE_BASLANGIC });
    // Sayılar yarıda.
    expect(veliOzeti({ yas: 5, oku: depo({ [DERS]: { biten: [1, 2, 3], simdi: 4, tanitildi: true } }) }).bugun)
      .toEqual({ ders: 'sayilar', baslik: "Ceren'le 3'e kadar saydı", metin: "Merdiven çıkarken birlikte sayın; 4'ü çocuğunuz söylesin." });
    const sayilarBitti = { [DERS]: { biten: hepsi(10), simdi: 10, tanitildi: true, bitti: true } };
    expect(veliOzeti({ yas: 5, oku: depo(sayilarBitti) }).bugun.ders).toBe('sayilar');
    // Şekiller ve Örüntü bitti: ders yolunda en ileri olan Örüntü.
    const ileri = { ...sayilarBitti, 'minkino-matematik-ceren-sekiller-v1': { bitti: true }, 'minkino-matematik-ceren-oruntu-v1': { bitti: true } };
    expect(veliOzeti({ yas: 5, oku: depo(ileri) }).bugun).toEqual({ ders: 'oruntu', baslik: 'Örüntü dersini bitirdi', metin: EVDE_DERS.oruntu });
    // 2–3 yaşta Sayılar 1–5; 5+ dersleri (toplama) küçük yaşta sayılmaz.
    const minik = veliOzeti({ yas: 3, oku: depo({ [DERS]: { biten: hepsi(5), simdi: 5, tanitildi: true, bitti: true }, 'minkino-matematik-ceren-topla-v1': { bitti: true } }) });
    expect(minik.bugun.baslik).toBe('Sayılar 1–5 dersini bitirdi');
  });
});
