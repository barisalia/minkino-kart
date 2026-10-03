import { describe, expect, it } from 'vitest';
import { karakterCumleleri, normal, tumCumleler } from '../../src/audio/cumleler';
import {
  ADIMLAR,
  CALISMA_IZLERI,
  Dosya,
  dedektifCumleleri,
  dedektifKinoCumleleri,
  ekranda,
  halka,
  halkaAdimi,
  HALKALAR,
  izNotasi,
  KADRAJ,
  kameraHesap,
  KARTLAR,
  kartSirasi,
  M,
  romanKareleri,
  ROMAN,
  sonrakiAdim,
  Soru,
  yolIzleri,
  yollariDiz,
  YARDIM,
} from '../../dedektif/src/mantik';
import { eksikler, EKSIK_LISTESI, resim, surumTablosu, YUVA } from '../../dedektif/src/resimler';
import { kayit, sifirla, vakaCozuldu } from '../../dedektif/src/kayit';

/** Basit tohumlu rastgele */
const rnd = (t: number) => () => {
  t = (t * 1664525 + 1013904223) >>> 0;
  return t / 4294967296;
};

describe('Dedektif Mino: vaka zinciri (ipucu → kart → demek ki)', () => {
  it('dört halka sırayla: kim (iz) / ne (tüy) / neden / nerede', () => {
    expect(HALKALAR.map((h) => h.id)).toEqual(['iz', 'tuy', 'neden', 'nerede']);
    expect(ADIMLAR).toEqual(['giris', 'iz', 'tuy', 'neden', 'nerede', 'final', 'roman']);
    expect(sonrakiAdim('giris')).toBe('iz');
    expect(sonrakiAdim('roman')).toBeNull();
    expect(halkaAdimi('tuy')).toBe('tuy');
    expect(halkaAdimi('final')).toBeNull();
  });

  it('kartlı her halkada 3 kart, doğrusu içinde; Kino hep yanlış bir kartı gösterir', () => {
    for (const h of HALKALAR.slice(0, 3)) {
      expect(h.kartlar).toHaveLength(3);
      expect(new Set(h.kartlar).size).toBe(3);
      expect(h.kartlar).toContain(h.dogru);
      expect(h.kinoKart && h.kartlar.includes(h.kinoKart)).toBe(true);
      expect(h.kinoKart).not.toBe(h.dogru);
      expect(h.ipuclari.length).toBeGreaterThan(0);
      // her yanlış kart kendini anlatır (öğretici ve komik; ceza yok)
      for (const k of h.kartlar) if (k !== h.dogru) expect(KARTLAR[k].tepki, k).toBeTruthy();
    }
    expect(halka('iz').dogru).toBe('kedi-pati-izi');
    expect(halka('tuy').dogru).toBe('kedi-beyaz');
    expect(halka('neden').dogru).toBe('sari-kelebek');
    // Halka 3'te iki ipucu: kanat tozu ve kelebek (ikisi de bulunmalı)
    expect(halka('neden').ipuclari.map((i) => i.id)).toEqual(['toz', 'kelebek']);
  });

  it('kart sorusu: yanlışlar soluklaşır, 2 yanlıştan sonra doğru kart parlar, doğruda çözülür; kilitlenmez', () => {
    const s = new Soru(halka('iz'));
    expect(s.acik).toHaveLength(3);
    expect(s.sec('zurafa-ayagi')).toEqual({ dogru: false, parla: false, yanlis: 1 });
    // aynı yanlış iki kez sayılmaz
    expect(s.sec('zurafa-ayagi').yanlis).toBe(1);
    expect(s.sec('ordek-ayagi')).toEqual({ dogru: false, parla: true, yanlis: 2 });
    expect(s.parlasin).toBe(true);
    expect(s.acik).toEqual(['kedi-pati-izi']);
    expect(s.sec('kedi-pati-izi').dogru).toBe(true);
    expect(s.cozuldu).toBe(true);
    expect(() => s.sec('yastik')).toThrow();
    expect(YARDIM.parlaYanlis).toBe(2);
    expect(YARDIM.koklaSn).toBe(10);
  });

  it('kart sırası karışır ama Kino\'nun gösterdiği kart ortada durmaz (atılıp gösterişi görünsün)', () => {
    for (let t = 1; t < 40; t++) {
      for (const h of HALKALAR.slice(0, 3)) {
        const s = kartSirasi(h, rnd(t));
        expect([...s].sort()).toEqual([...h.kartlar].sort());
        expect(s[1]).not.toBe(h.kinoKart);
      }
    }
  });

  it('vaka dosyası: ipuçları ve "demek ki" kartları gözlere girer; dört göz dolunca vaka çözülür', () => {
    const d = new Dosya();
    expect(d.cozulen).toBe(0);
    d.ipucuEkle('neden', 'toz');
    expect(d.ipuclariTamam('neden')).toBe(false);
    d.ipucuEkle('neden', 'kelebek');
    d.ipucuEkle('neden', 'kelebek');
    expect(d.goz('neden').ipuclari).toEqual(['toz', 'kelebek']);
    expect(d.ipuclariTamam('neden')).toBe(true);
    for (const h of HALKALAR) d.demekEkle(h.id);
    expect(d.tamam).toBe(true);
    // test kısayolu: Halka 3'ten başlayınca ilk iki halka çözülmüş sayılır
    const k = Dosya.adimdan('neden');
    expect(k.gozler.map((g) => g.demek)).toEqual([true, true, false, false]);
    expect(k.ipuclariTamam('iz')).toBe(true);
    expect(Dosya.adimdan('final').tamam).toBe(true);
  });

  it('çizgi roman: dosyadaki "demek ki" kartlarından 4 kare, sırayla', () => {
    const d = new Dosya();
    expect(romanKareleri(d)).toEqual([]);
    d.demekEkle('iz');
    d.demekEkle('neden');
    expect(romanKareleri(d).map((r) => r.sira)).toEqual([1, 3]);
    expect(ROMAN.map((r) => r.kurgu)).toEqual(['iz', 'zipla', 'devril', 'saklan']);
  });

  it('Halka 4: izler notası adım adım yükselir; yollar kapılara dağılır, kedi izleri tırnaksız ve küçük', () => {
    const notalar = CALISMA_IZLERI.map((_, i) => izNotasi(i));
    for (let i = 1; i < notalar.length; i++) expect(notalar[i]).toBeGreaterThan(notalar[i - 1]);
    expect(izNotasi(99)).toBe(izNotasi(98));
    const a = yollariDiz(() => 0.1);
    const b = yollariDiz(() => 0.9);
    expect(a).toEqual({ sol: 'mutfak', sag: 'yatak' });
    expect(b).toEqual({ sol: 'yatak', sag: 'mutfak' });
    // perspektif: kapıya doğru izler küçülür
    for (const yan of ['sol', 'sag'] as const) {
      const iz = yolIzleri(yan);
      for (let i = 1; i < iz.length; i++) expect(iz[i].h).toBeLessThan(iz[i - 1].h);
    }
  });
});

describe('Dedektif Mino: kamera', () => {
  const dunya = { w: 1792, h: 1000 };
  const kapliyor = (k: ReturnType<typeof kameraHesap>, e: { w: number; h: number }) => {
    expect(k.tx).toBeLessThanOrEqual(0.001);
    expect(k.ty).toBeLessThanOrEqual(0.001);
    expect(k.tx + dunya.w * k.s).toBeGreaterThanOrEqual(e.w - 0.001);
    expect(k.ty + dunya.h * k.s).toBeGreaterThanOrEqual(e.h - 0.001);
  };
  it('dünya ekranı hep tamamen kaplar (boş kenar yok), her kadrajda ve her ekran boyunda', () => {
    for (const e of [
      { w: 844, h: 390 },
      { w: 932, h: 430 },
      { w: 390, h: 844 },
      { w: 1024, h: 768 },
      { w: 768, h: 1024 },
    ])
      for (const kd of Object.values(KADRAJ)) {
        kapliyor(kameraHesap(kd, dunya, e), e);
        kapliyor(kameraHesap(kd, dunya, e, undefined, 1, 1.18), e);
      }
  });
  it('yatay telefonda kadraj güvenli bölgeye sığar ve ortalanır (halı yakın çekim)', () => {
    const e = { w: 844, h: 390 };
    const k = kameraHesap(KADRAJ.hali, dunya, e, [0, 60, 844, 390]);
    const [x0, y0] = ekranda(k, dunya, KADRAJ.hali[0], KADRAJ.hali[1]);
    const [x1, y1] = ekranda(k, dunya, KADRAJ.hali[2], KADRAJ.hali[3]);
    expect(x0).toBeGreaterThanOrEqual(-1);
    expect(x1).toBeLessThanOrEqual(845);
    expect(y1 - y0).toBeGreaterThan(300);
    expect(k.s).toBeGreaterThan(Math.max(844 / dunya.w, 390 / dunya.h));
  });
  it('dikeyde enAz ile oda biraz büyür (gök değil zemin görünür)', () => {
    const e = { w: 390, h: 844 };
    const a = kameraHesap(KADRAJ.hali, dunya, e);
    const b = kameraHesap(KADRAJ.hali, dunya, e, undefined, 1, 1.18);
    expect(b.s).toBeCloseTo(a.s * 1.18, 5);
    // zemin (alt kenar) ekranın altında kalır
    expect(b.ty + dunya.h * b.s).toBeCloseTo(e.h, 3);
  });
});

describe('Dedektif Mino: görseller ve seslendirme', () => {
  it('zorunlu her yuvanın görseli var (kendi dosyası ya da depodaki yedek)', () => {
    for (const [ad, y] of Object.entries(YUVA)) if (y.zorunlu) expect(resim(ad), ad).toBeTruthy();
    for (const k of Object.values(KARTLAR)) expect(resim(k.resim), k.id).toBeTruthy();
    for (const h of HALKALAR) for (const t of h.ipuclari) expect(resim(t.foto ?? t.resim), t.id).toBeTruthy();
  });
  it('sürüm eki: en büyük sürüm; sıra numaralı adlar (roman-1) kendi adıyla da bulunur', () => {
    const t = surumTablosu({ 'x/masa.webp': 'a', 'x/masa-2.webp': 'b', 'x/roman-1.webp': 'r1' });
    expect(t.get('masa')).toBe('b');
    expect(t.get('roman-1')).toBe('r1');
    expect(eksikler(new Map())).toContain('masa');
    // Gemini listesindeki her ad bir yuva
    for (const ad of Object.keys(EKSIK_LISTESI)) expect(Object.values(YUVA).some((y) => y.adaylar.includes(ad)), ad).toBe(true);
  });
  it('bütün cümleler seslendirme listesinde; Kino\'nunkiler Kino\'nun sesiyle de üretilir; kısa', () => {
    const hepsi = new Set(tumCumleler());
    for (const c of dedektifCumleleri()) expect(hepsi.has(normal(c)), c).toBe(true);
    const kino = new Set(karakterCumleleri().kino);
    for (const c of dedektifKinoCumleleri()) {
      expect(hepsi.has(normal(c)), c).toBe(true);
      expect(kino.has(normal(c)), c).toBe(true);
    }
    // hikâyenin son okuması dışında hepsi kısa (çocuk dinler, okumaz)
    for (const c of [...dedektifCumleleri(), ...dedektifKinoCumleleri()]) if (c !== M.hikaye) expect(c.split(/\s+/).length, c).toBeLessThanOrEqual(8);
    expect(dedektifCumleleri().length + dedektifKinoCumleleri().length).toBeGreaterThanOrEqual(35);
  });
  it('kayıt: çözülen vaka "Vaka Dosyam"a girer, tekrar çözülünce sayı artar', () => {
    sifirla();
    vakaCozuldu('vaka1');
    vakaCozuldu('vaka1');
    expect(kayit.cozulen).toEqual(['vaka1']);
    expect(kayit.sayi.vaka1).toBe(2);
    sifirla();
    expect(kayit.cozulen).toEqual([]);
  });
});
