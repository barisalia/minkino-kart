import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  altTemasX, bilesenler, boyutKarari, denetle, farkSay, hucreyeDagit, izgaraSec, kenarRenginiYay, kirintiSil, macentaTemizle, macentalik, olc, pozKes, sinirKutusu, yerlestirme, zeminTuru,
  type Resim,
} from '../../doktor/araclar/gorsel-mantik';
import { AYNI_POZ, CIZIMLER, CIZIM_KILAVUZLARI, K1_DOSYALAR, ONIZLEME_AGIZLARI, ONIZLEME_DIZILERI, SAYFALAR, TUVALLER, altKlasorEsle, cizimBul, kaynakAdiCoz } from '../../doktor/araclar/k1-paket';
import { jsonGom, onizlemeHtml, ozetle, type OnizlemeCizimi, type OnizlemeVerisi } from '../../doktor/araclar/onizleme';

// Minik Doktor · Paket Doktor-K1'in bağlama betiği (doktor/araclar/bagla.ts): dökümü ve piksel mantığı.
// Betik Astra'nın çizimlerini temizler, tuvale oturtur, denetler ve tam boy önizleme sayfasını üretir.

type Renk = [number, number, number, number];
const MAC: Renk = [255, 0, 255, 255], BOS: Renk = [0, 0, 0, 0], KOYU: Renk = [48, 35, 63, 255], TURUNCU: Renk = [242, 140, 40, 255];
function resim(g: number, y: number, zemin: Renk): Resim {
  const d = new Uint8Array(g * y * 4);
  for (let i = 0; i < g * y; i++) d.set(zemin, i * 4);
  return { g, y, d };
}
function kare(r: Resim, x0: number, y0: number, g: number, y: number, renk: Renk): Resim {
  for (let yy = y0; yy < y0 + y; yy++) for (let xx = x0; xx < x0 + g; xx++) if (xx >= 0 && yy >= 0 && xx < r.g && yy < r.y) r.d.set(renk, (yy * r.g + xx) * 4);
  return r;
}
const piksel = (r: Resim, x: number, y: number): number[] => [...r.d.subarray((y * r.g + x) * 4, (y * r.g + x) * 4 + 4)];

describe('K1 dökümü (k1-paket)', () => {
  it('68 çizimin hepsini bir kez içerir; adlar sahne koduyla aynıdır', () => {
    expect(CIZIMLER).toHaveLength(68);
    expect(new Set(CIZIMLER.map(c => c.ad)).size).toBe(68);
    expect([...CIZIMLER.map(c => c.ad)].sort()).toEqual([...K1_DOSYALAR].sort());
  });
  it('brief\'teki gibi 22 çağrı; orta planda sayfada en çok 6, yakın planda 2 çizim', () => {
    expect(SAYFALAR).toHaveLength(22);
    for (const s of SAYFALAR) {
      expect(s.adlar.length, s.anahtar).toBeLessThanOrEqual(s.tuval === 'yakin' ? 2 : 6);
      expect(s.adlar.length, s.anahtar).toBeGreaterThan(0);
    }
    expect(new Set(SAYFALAR.map(s => s.anahtar)).size).toBe(22);
  });
  it('tuval ölçüleri brief\'te yazanlarla aynıdır', () => {
    const tum = readFileSync('CLAUDE-ASTRA-MESAJLAR.md', 'utf8');
    const bas = tum.indexOf('Paket Doktor-K1 · kanıt sahnesi');
    const brief = tum.slice(bas, tum.indexOf('\n## ', bas + 10));
    for (const t of Object.values(TUVALLER)) expect(brief, `${t.g} × ${t.y}`).toContain(`${t.g} × ${t.y}`);
    expect(TUVALLER.fon.zemin).toBe('opak');
    expect(Object.entries(TUVALLER).filter(([, t]) => t.zemin === 'opak').map(([ad]) => ad)).toEqual(['fon']);
    expect(cizimBul('zipzip-yakin-kirp')).toMatchObject({ g: 2048, y: 1536, altKesik: true, sayfa: 'b1' });
    expect(cizimBul('kino-gul-2')).toMatchObject({ g: 1300, y: 1600, altKesik: false, sayfa: 'c5' });
  });
  it('diziler, ağızlar, aynı poz çiftleri ve özel kılavuzlar yalnız dökümdeki adları kullanır', () => {
    const adlar = new Set(K1_DOSYALAR);
    for (const d of ONIZLEME_DIZILERI) { for (const k of d.kareler) expect(adlar.has(k), k).toBe(true); expect(d.sureler).toHaveLength(d.kareler.length); }
    for (const a of ONIZLEME_AGIZLARI) expect(a.kareler).toHaveLength(6);
    for (const p of AYNI_POZ) {
      expect(adlar.has(p.temel), p.temel).toBe(true); expect(adlar.has(p.es), p.es).toBe(true);
      // aynı poz çiftleri aynı tuvaldedir
      expect(cizimBul(p.temel)!.tuval).toBe(cizimBul(p.es)!.tuval);
      expect(p.enCok).toBeGreaterThan(0); expect(p.enCok).toBeLessThan(0.5);
    }
    for (const ad of Object.keys(CIZIM_KILAVUZLARI)) expect(adlar.has(ad), ad).toBe(true);
  });
  it('sayfadan kesilen pozların ölçek referansı ayakta bir pozdur; çapalar tuvalin içindedir', () => {
    for (const s of SAYFALAR) {
      if (s.boyReferansi) expect(s.boyReferansi.kare).toBeLessThan(s.adlar.length);
      const t = TUVALLER[s.tuval];
      for (const [ad, c] of Object.entries(s.capa ?? {})) { expect(s.adlar, ad).toContain(ad); expect(c[0]).toBeLessThanOrEqual(t.g); expect(c[1]).toBeLessThanOrEqual(t.y); }
    }
    expect(SAYFALAR.find(s => s.anahtar === 'a1')!.boyReferansi).toEqual({ kare: 0, boy: 1000 });
    expect(SAYFALAR.find(s => s.anahtar === 'c1')!.boyReferansi).toEqual({ kare: 0, boy: 1090 });
    // oturuş ve yakın plan sayfalarında ayakta poz yok: ölçek başka sayfadan ya da yerlesim.json'dan gelir
    expect(SAYFALAR.find(s => s.anahtar === 'a2')!.boyReferansi).toBeUndefined();
  });
  it('kaynak dosya adını çözer: tek çizim, sayfa, ızgaralı sayfa, dizi öneki', () => {
    expect(kaynakAdiCoz('zipzip-tirman-0.png')).toEqual({ tur: 'cizim', ad: 'zipzip-tirman-0' });
    expect(kaynakAdiCoz('Fon-Muayene.WEBP')).toEqual({ tur: 'cizim', ad: 'fon-muayene' });
    expect(kaynakAdiCoz('A1.PNG')).toEqual({ tur: 'sayfa', ad: 'a1', izgara: undefined });
    expect(kaynakAdiCoz('a1@3x2.png')).toEqual({ tur: 'sayfa', ad: 'a1', izgara: { sutun: 3, satir: 2 } });
    expect(kaynakAdiCoz('sheet-c5.jpg')).toMatchObject({ tur: 'sayfa', ad: 'c5' });
    expect(kaynakAdiCoz('zipzip-tirman.png')).toMatchObject({ tur: 'sayfa', ad: 'a1' });
    expect(kaynakAdiCoz('kino-gul@4x1.png')).toEqual({ tur: 'sayfa', ad: 'c5', izgara: { sutun: 4, satir: 1 } });
    expect(kaynakAdiCoz('perde.png')).toMatchObject({ tur: 'sayfa', ad: 'd4' });
    expect(kaynakAdiCoz('baska-bir-sey.png').tur).toBe('bilinmiyor');
    expect(kaynakAdiCoz('zipzip.png').tur).toBe('bilinmiyor');
  });
});

describe('ayrı poz dosyaları', () => {
  it('alt klasördeki numaralı dosyaları sayfanın adlarıyla eşler (00… ya da 1… ile başlasa da)', () => {
    const a = altKlasorEsle('zipzip-tirman', ['00.png', '01.png', '02.png', '03.png', '04.png', '05.png', 'sheet.png', 'hareket.json'])!;
    expect(a.sayfa).toBe('a1');
    expect(a.eslesme.filter(e => e.ad).map(e => e.ad)).toEqual(['zipzip-tirman-0', 'zipzip-tirman-1', 'zipzip-tirman-2', 'zipzip-tirman-3', 'zipzip-tirman-4', 'zipzip-tirman-5']);
    expect(a.eslesme.find(e => e.dosya === 'sheet.png')!.ad).toBeNull();
    expect(a.eslesme.some(e => e.dosya === 'hareket.json')).toBe(false);
    const b = altKlasorEsle('C5', ['1.webp', '2.webp', '3.webp', '4.webp'])!;
    expect(b.eslesme.map(e => e.ad)).toEqual(['kino-gul-0', 'kino-gul-1', 'kino-gul-2', 'kino-gul-3']);
  });
  it('karışık sayfada (a3) numara sayfadaki sıradır; K1 adıyla gelen dosya adıyla eşleşir', () => {
    const a = altKlasorEsle('a3', ['0.png', '1.png', '2.png', '3.png', '4.png', '5.png'])!;
    expect(a.eslesme.map(e => e.ad)).toEqual(['zipzip-otur-kirp', 'zipzip-otur-bak', 'zipzip-saklan-1', 'zipzip-saklan-2', 'zipzip-saklan-3', 'zipzip-saklan-4']);
    const b = altKlasorEsle('a3', ['zipzip-saklan-3.png', 'zipzip-otur-bak.png'])!;
    expect(b.eslesme.map(e => e.ad)).toEqual(['zipzip-otur-bak', 'zipzip-saklan-3']);
    // sayfaya ait olmayan K1 adı ve fazla numara eşleşmez
    expect(altKlasorEsle('a4', ['kino-gul-0.png', '9.png'])!.eslesme.map(e => e.ad)).toEqual([null, null]);
    expect(altKlasorEsle('baska', ['0.png'])).toBeNull();
  });
  it('poz yere bastığı yerin ortasından hizalanır: kol yana uzanınca kaymaz', () => {
    // gövde x 40…60, ayaklar aynı yerde; ikinci pozda sağa uzanan kol kutuyu genişletir
    const duz = kare(resim(200, 120, BOS), 40, 10, 20, 100, TURUNCU);
    const kollu = kare(kare(resim(200, 120, BOS), 40, 10, 20, 100, TURUNCU), 60, 30, 80, 10, TURUNCU);
    expect(altTemasX(duz)).toBe(50);
    expect(altTemasX(kollu)).toBe(50);
    expect(altTemasX(resim(10, 10, BOS))).toBe(5);
    // kutunun ortasıyla hizalansa kollu poz 40 piksel sola kayardı; temasla ikisi aynı yere oturur
    const a = yerlestirme(20, 100, 2, [650, 1440], 1300, 1500, 10);          // duz: kırpılmış kutu 20 × 100, temas ortada
    const b = yerlestirme(100, 100, 2, [650, 1440], 1300, 1500, 10);         // kollu: kutu 100 × 100, temas yine x 10
    expect(a.sol).toBe(630); expect(b.sol).toBe(630);
    expect(yerlestirme(100, 100, 2, [650, 1440], 1300, 1500).sol).toBe(550);
  });
});

describe('zemin (gorsel-mantik)', () => {
  it('zemin türünü tanır: macenta, şeffaf, düz renk, opak', () => {
    expect(zeminTuru(kare(resim(60, 60, MAC), 20, 20, 20, 20, TURUNCU)).tur).toBe('macenta');
    expect(zeminTuru(kare(resim(60, 60, BOS), 20, 20, 20, 20, TURUNCU)).tur).toBe('seffaf');
    const beyaz = zeminTuru(kare(resim(60, 60, [255, 255, 255, 255]), 20, 20, 20, 20, TURUNCU));
    expect(beyaz.tur).toBe('duz'); expect(beyaz.kenarRenk).toEqual([255, 255, 255]);
    const fon = resim(60, 60, [0, 0, 0, 255]);
    for (let i = 0; i < 3600; i++) fon.d.set([(i * 37) % 256, (i * 91) % 256, (i * 53) % 256, 255], i * 4);
    expect(zeminTuru(fon).tur).toBe('opak');
  });
  it('macentayı saydam yapar, çizimi korur, kenarda mor saçak bırakmaz', () => {
    const r = kare(kare(resim(40, 40, MAC), 10, 10, 20, 20, KOYU), 12, 12, 16, 16, TURUNCU);
    // kenar pikseli: konturla macentanın yarı yarıya karışımı
    r.d.set([(48 + 255) >> 1, 35 >> 1, (63 + 255) >> 1, 255], (10 * 40 + 9) * 4);
    const t = macentaTemizle(r);
    expect(piksel(t.resim, 2, 2)[3]).toBe(0);
    expect(piksel(t.resim, 20, 20)).toEqual([...TURUNCU]);
    // zemine değen kontur pikseli opak kalır; mora çalan payı gider (48, 35, 63 → 35, 35, 50)
    expect(piksel(t.resim, 10, 10)).toEqual([35, 35, 50, 255]);
    const kenar = piksel(t.resim, 9, 10);
    expect(kenar[3]).toBeGreaterThan(0); expect(kenar[3]).toBeLessThan(255);
    expect(macentalik(kenar[0], kenar[1], kenar[2])).toBeLessThan(30);
    expect(t.kenar).toBe(1);
    expect(zeminTuru(t.resim).tur).toBe('seffaf');
  });
  it('çizimin içindeki pembe, lila ve mor kontur macenta sayılmaz', () => {
    const PEMBE: Renk = [252, 93, 163, 255], LILA: Renk = [196, 120, 230, 255];
    const r = kare(kare(kare(resim(60, 60, MAC), 10, 10, 40, 40, KOYU), 14, 14, 32, 32, PEMBE), 22, 22, 12, 12, LILA);
    const t = macentaTemizle(r).resim;
    expect(piksel(t, 16, 16)).toEqual([...PEMBE]);
    expect(piksel(t, 28, 28)).toEqual([...LILA]);
    expect(piksel(t, 13, 30)).toEqual([...KOYU]);                 // zeminden 4 piksel içeride: kontur olduğu gibi
    expect(piksel(t, 11, 30)).toEqual([35, 35, 50, 255]);         // zemine 2 piksel: mor payı çıkarılmış, opak
    expect(piksel(t, 5, 30)[3]).toBe(0);
    // kol ile gövde arasındaki kapalı macenta boşluk da saydam olur
    const delik = kare(kare(resim(60, 60, MAC), 10, 10, 40, 40, TURUNCU), 25, 25, 10, 10, MAC);
    expect(piksel(macentaTemizle(delik).resim, 30, 30)[3]).toBe(0);
  });
  it('macenta temizlik girdinin kendi saydamlığını korur', () => {
    const r = kare(resim(20, 20, MAC), 5, 5, 10, 10, [242, 140, 40, 128]);
    expect(piksel(macentaTemizle(r).resim, 10, 10)[3]).toBe(128);
  });
  it("saydam alandaki rengi çizimin kenar renginden yayar: webp'de macenta ya da beyaz saçak geri gelmez", () => {
    const t = macentaTemizle(kare(resim(40, 40, MAC), 10, 10, 20, 20, TURUNCU)).resim;
    expect(piksel(t, 9, 20)).toEqual([255, 0, 255, 0]);            // temizlikten sonra saydam ama rengi hâlâ macenta
    kenarRenginiYay(t);
    expect(piksel(t, 9, 20)).toEqual([242, 140, 40, 0]);            // kenara komşu: çizimin rengi
    expect(piksel(t, 6, 20)).toEqual([242, 140, 40, 0]);            // dört piksel dışa kadar
    expect(piksel(t, 2, 2)).toEqual([0, 0, 0, 0]);                  // uzakta: sıfır
    expect(piksel(t, 20, 20)).toEqual([...TURUNCU]);                // çizim değişmez
  });
  it('küçük kopuk lekeyi siler, çizimi bırakır', () => {
    const r = kare(kare(resim(60, 60, BOS), 10, 10, 30, 30, TURUNCU), 50, 50, 3, 3, KOYU);
    expect(kirintiSil(r)).toBe(9);
    expect(piksel(r, 51, 51)[3]).toBe(0);
    expect(piksel(r, 20, 20)[3]).toBe(255);
    expect(kirintiSil(r)).toBe(0);
  });
});

describe('sayfayı pozlara bölme', () => {
  const sayfa = (sutun: number, satir: number, n: number, g = 600, y = 400): Resim => {
    const r = resim(g, y, BOS);
    for (let i = 0; i < n; i++) {
      const cx = (g / sutun) * ((i % sutun) + 0.5), cy = (y / satir) * (Math.floor(i / sutun) + 0.5);
      kare(r, Math.round(cx - 30), Math.round(cy - 50), 60, 100 + i * 4, TURUNCU);
      kare(r, Math.round(cx + 34), Math.round(cy - 40), 6, 6, KOYU);   // gövdeden kopuk küçük parça (ter damlası gibi)
    }
    return r;
  };
  it('bağlı bölgeleri bulur', () => {
    const { liste } = bilesenler(kare(kare(resim(50, 30, BOS), 2, 2, 10, 10, TURUNCU), 30, 5, 8, 20, KOYU));
    expect(liste.map(b => b.alan)).toEqual([100, 160]);
    expect(liste[1].kutu).toEqual({ x0: 30, y0: 5, x1: 38, y1: 25 });
    expect(liste[0].cx).toBeCloseTo(6.5); expect(liste[0].cy).toBeCloseTo(6.5);
  });
  it('ızgarayı kendiliğinden seçer', () => {
    const sec = (r: Resim, n: number) => { const { liste } = bilesenler(r); return izgaraSec(liste, r.g, r.y, n); };
    expect(sec(sayfa(3, 2, 6), 6)).toEqual({ sutun: 3, satir: 2, tam: true });
    expect(sec(sayfa(4, 1, 4, 800, 220), 4)).toEqual({ sutun: 4, satir: 1, tam: true });
    expect(sec(sayfa(2, 2, 4), 4)).toEqual({ sutun: 2, satir: 2, tam: true });
    expect(sec(sayfa(2, 1, 2), 2)).toEqual({ sutun: 2, satir: 1, tam: true });
    expect(sec(sayfa(6, 1, 6, 1200, 220), 6)).toEqual({ sutun: 6, satir: 1, tam: true });
    // beklenenden az poz: tam tutmaz, betik sayfayı yazmaz
    expect(sec(sayfa(3, 2, 5), 6).tam).toBe(false);
  });
  it('her pozu kendi parçalarıyla keser; komşu pozun parçası karışmaz', () => {
    const r = sayfa(3, 2, 6);
    const { etiket, liste } = bilesenler(r);
    const hucre = hucreyeDagit(liste, r.g, r.y, 3, 2);
    expect(hucre.map(h => h.length)).toEqual([2, 2, 2, 2, 2, 2]);
    const p = pozKes(r, etiket, liste, hucre[4])!;
    expect(p.resim.g).toBe(70); expect(p.resim.y).toBe(116);
    expect([p.x, p.y]).toEqual([270, 250]);
    expect(sinirKutusu(p.resim)).toEqual({ x0: 0, y0: 0, x1: 70, y1: 116 });
    expect(pozKes(r, etiket, liste, [])).toBeNull();
  });
});

describe('boyut, yerleşim ve denetim', () => {
  it('boyut kararı: tam, aynı oran, başka oran', () => {
    expect(boyutKarari(1300, 1500, 1300, 1500)).toEqual({ karar: 'tam', olcek: 1 });
    expect(boyutKarari(650, 750, 1300, 1500)).toEqual({ karar: 'oran', olcek: 2 });
    expect(boyutKarari(1024, 1024, 1600, 1600).karar).toBe('oran');
    expect(boyutKarari(1024, 1536, 1300, 1500).karar).toBe('farkli');
    expect(boyutKarari(400, 620, 1300, 1600).karar).toBe('farkli');
  });
  it('pozun alt-orta noktası çapaya oturur; taşma bildirilir', () => {
    expect(yerlestirme(200, 480, 2.5, [650, 1440], 1300, 1500)).toEqual({ sol: 400, ust: 240, g: 500, y: 1200, tasan: false });
    expect(yerlestirme(200, 480, 2.5, [100, 1440], 1300, 1500).tasan).toBe(true);
    expect(yerlestirme(200, 700, 2.5, [650, 1440], 1300, 1500).tasan).toBe(true);
  });
  const beklenen = { g: 100, y: 120, zemin: 'seffaf' as const, altKesik: false };
  it('temiz çizimde bulgu yok', () => {
    const r = kare(resim(100, 120, BOS), 30, 20, 40, 80, TURUNCU);
    const o = olc(r);
    expect(o.kutu).toEqual({ x0: 30, y0: 20, x1: 70, y1: 100 });
    expect(o.koseSaydam).toEqual([true, true, true, true]);
    expect(denetle(o, 100, 120, beklenen)).toEqual([]);
  });
  it('yanlış boyut, temizlenmemiş zemin ve boş çizim hatadır', () => {
    const r = kare(resim(100, 120, BOS), 30, 20, 40, 80, TURUNCU);
    expect(denetle(olc(r), 100, 120, { ...beklenen, g: 130, y: 150 })[0]).toMatchObject({ seviye: 'hata' });
    const beyaz = kare(resim(100, 120, [255, 255, 255, 255]), 30, 20, 40, 80, TURUNCU);
    expect(denetle(olc(beyaz), 100, 120, beklenen).some(b => b.seviye === 'hata' && /köşe/.test(b.metin))).toBe(true);
    expect(denetle(olc(resim(100, 120, BOS)), 100, 120, beklenen).some(b => b.seviye === 'hata' && /boş/.test(b.metin))).toBe(true);
  });
  it('kenara değen çizim uyarıdır; yakın planda alt kenar serbesttir', () => {
    const alt = kare(resim(100, 120, BOS), 30, 40, 40, 80, TURUNCU);
    expect(denetle(olc(alt), 100, 120, beklenen).some(b => b.seviye === 'uyari' && /kenar/.test(b.metin))).toBe(true);
    expect(denetle(olc(alt), 100, 120, { ...beklenen, altKesik: true })).toEqual([]);
    const sol = kare(resim(100, 120, BOS), 0, 40, 40, 40, TURUNCU);
    expect(denetle(olc(sol), 100, 120, { ...beklenen, altKesik: true }).some(b => /sol/.test(b.metin))).toBe(true);
  });
  it('macenta kalıntısı ve saydam pikselli fon uyarıdır', () => {
    // kenardaki mor saçak sayılır; çizimin içindeki pembe-mor alan sayılmaz
    const sacak = kare(kare(resim(100, 120, BOS), 30, 20, 40, 80, TURUNCU), 30, 20, 2, 80, [220, 40, 220, 255]);
    expect(olc(sacak).macentaKalinti).toBe(160);
    expect(denetle(olc(sacak), 100, 120, beklenen).some(b => b.seviye === 'uyari' && /macenta/.test(b.metin))).toBe(true);
    const icte = kare(kare(resim(100, 120, BOS), 30, 20, 40, 80, TURUNCU), 40, 30, 10, 10, [220, 40, 220, 255]);
    expect(olc(icte).macentaKalinti).toBe(0);
    expect(denetle(olc(icte), 100, 120, beklenen)).toEqual([]);
    const fon = kare(resim(100, 120, [200, 180, 240, 255]), 0, 0, 5, 5, BOS);
    expect(denetle(olc(fon), 100, 120, { ...beklenen, zemin: 'opak' })).toEqual([{ seviye: 'uyari', metin: expect.stringContaining('25 saydam piksel') }]);
    expect(denetle(olc(resim(100, 120, [200, 180, 240, 255])), 100, 120, { ...beklenen, zemin: 'opak' })).toEqual([]);
  });
  it('mora çalan kontur uyarıdır; siyah ve koyu lacivert kontur değildir', () => {
    const cizim = (kontur: Renk) => kare(kare(resim(100, 120, BOS), 20, 20, 60, 80, kontur), 30, 30, 40, 60, TURUNCU);
    expect(olc(cizim([20, 20, 22, 255])).konturMor).toBe(0);
    expect(olc(cizim(KOYU)).konturMor).toBe(0);                    // 48, 35, 63: Minkino'nun koyu konturu, mor payı 13
    const mor = olc(cizim([90, 25, 85, 255]));
    expect(mor.konturMor).toBeGreaterThan(0.9);
    expect(denetle(mor, 100, 120, beklenen).some(b => b.seviye === 'uyari' && /kontur mora/.test(b.metin))).toBe(true);
    expect(denetle(olc(cizim(KOYU)), 100, 120, beklenen)).toEqual([]);
  });
  it('iki çizimin farkı: aynıysa sıfır, ağız değiştiyse yalnız o kutu', () => {
    const a = kare(resim(100, 120, BOS), 30, 20, 40, 80, TURUNCU);
    const b = kare(kare(resim(100, 120, BOS), 30, 20, 40, 80, TURUNCU), 45, 50, 10, 6, KOYU);
    expect(farkSay(a, a)).toEqual({ piksel: 0, kutu: null });
    expect(farkSay(a, b)).toEqual({ piksel: 60, kutu: { x0: 45, y0: 50, x1: 55, y1: 56 } });
    expect(farkSay(a, resim(50, 60, BOS)).piksel).toBe(-1);
  });
});

describe('önizleme sayfası', () => {
  const c = (ad: string, yol: string | null, bulgular: OnizlemeCizimi['bulgular'] = []): OnizlemeCizimi => ({ ad, sayfa: 'a1', tuval: 'zipzip', g: 1300, y: 1500, yol, koken: 'deneme', bulgular, kutu: null });
  const veri: OnizlemeVerisi = {
    uretildi: 'şimdi', hedef: 'assets/doktor/zipzip-diz', kaynak: 'ekip/doktor/k1-kaynak',
    cizimler: [c('a', 'a.webp'), c('b', 'b.webp', [{ seviye: 'uyari', metin: '</script><b>' }]), c('c', 'c.webp', [{ seviye: 'hata', metin: 'x' }, { seviye: 'uyari', metin: 'y' }]), c('d', null), c('e', 'e.webp', [{ seviye: 'bilgi', metin: 'z' }])],
    sayfalar: [], tuvaller: {}, diziler: [], agizlar: [], ayniPoz: [], kaynaklar: [], masa: { ad: 'muayene-masasi', sol: -350, ust: 600, g: 2000, y: 1000 },
  };
  it('özet: gelen, eksik, hatalı, uyarılı ve temiz çizimleri ayrı sayar', () => {
    expect(ozetle(veri)).toEqual({ beklenen: 5, gelen: 4, eksik: ['d'], hata: 1, uyari: 1, temiz: 2 });
  });
  it('veriyi ve betiği sayfaya güvenle gömer', () => {
    expect(jsonGom({ a: '</script>' })).not.toContain('</script>');
    expect(JSON.parse(jsonGom({ a: '</script>', b: 'ığüşöç' }))).toEqual({ a: '</script>', b: 'ığüşöç' });
    const html = onizlemeHtml(veri, 'body{color:red}', 'const s = "</script>";');
    expect(html.match(/<\/script>/g)).toHaveLength(2);
    expect(html).toContain('<style>body{color:red}</style>');
    expect(html).toContain('lang="tr"');
    const gomulu = html.slice(html.indexOf('type="application/json">') + 24, html.indexOf('</script>'));
    expect(JSON.parse(gomulu).cizimler).toHaveLength(5);
  });
});
