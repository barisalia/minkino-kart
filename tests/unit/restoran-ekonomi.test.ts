/**
 * Tıkır Tıkır Lokanta · P4 ekonomi ve büyüme (ekip/senaryo/RESTORAN.md §6, §12 P4): defter kartları, fiyatlar,
 * "her gün en az bir alım", masa / süs / bahçe yerleşimi, yeni tarifin ertesi gün istenmesi, kayıt göçü ve sıfırlama.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import {
  alinabilirMi,
  babaanneHediyesi,
  bosMasaYuvalari,
  defterKartlari,
  fiyat,
  fiyatJetonlari,
  kalem,
  KATALOG,
  masaSayisi,
  menuOnerisi,
  menuSecimiVar,
  satinAl,
  SEKMELER,
  yerlesmemisleriKoy,
  yerlestir,
  type EkonomiDurumu,
} from '../../restoran/src/ekonomi';
import { bosKayit, kayitCoz, KAYIT_ANAHTARI } from '../../restoran/src/kayit';
import { gunPlani, musteriSayisi, TARIFLER } from '../../restoran/src/model';
import defter from '../../content/restoran/defter.json';
import { YASAK_DESEN } from '../../restoran/src/model';

const hepsiOynanir = { oynanabilir: () => true };
const yeni = (): EkonomiDurumu => bosKayit();

describe('fiyatlar (§6b)', () => {
  it('her değer [3-4, 5-6] çifti; süs < masa < tarif < büyük alet < bahçe', () => {
    const f = (id: string) => kalem(id)!.fiyat;
    expect(f('ortu-kareli')).toEqual([3, 5]);
    expect(f('masa-3')).toEqual([5, 8]);
    expect(f('ayran')).toEqual([6, 10]);
    expect(f('pide')).toEqual([10, 16]);
    expect(f('bahce')).toEqual([14, 24]);
    for (const k of KATALOG) expect(k.fiyat[0]).toBeLessThan(k.fiyat[1]);
  });

  it('jeton resimleri: 3-4 tek tek (en çok 8), 5-6 beşlik + kalan', () => {
    for (const k of KATALOG.filter((x) => x.sekme !== 'bolum')) expect(fiyatJetonlari(fiyat(k, 'kucuk'), 'kucuk').tek).toBeLessThanOrEqual(10);
    expect(fiyatJetonlari(8, 'buyuk')).toEqual({ bes: 1, tek: 3 });
    expect(fiyatJetonlari(5, 'kucuk')).toEqual({ bes: 0, tek: 5 });
  });

  it('bütün tariflerin model.ts tarifi var', () => {
    for (const k of KATALOG.filter((x) => x.sekme === 'tarif')) expect(TARIFLER[k.id]).toBeTruthy();
  });
});

describe('defter kartları', () => {
  it('Gün 1: tarif, masa, süs sekmeleri dolu; 3-4 en çok 3 kart', () => {
    const k = defterKartlari(yeni(), { yas: 'kucuk', gun: 1, ...hepsiOynanir });
    expect(k.tarif.length).toBeGreaterThan(0);
    expect(k.masa.map((x) => x.id)).toEqual(['masa-3']);
    expect(k.sus.length).toBe(3);
    for (const s of SEKMELER) expect(k[s].length).toBeLessThanOrEqual(3);
    expect(k.tarif[0].id).toBe('ayran');
  });

  it('mini oyunu yazılmamış tarif görünmez (P3/P5 gelince kendiliğinden)', () => {
    const k = defterKartlari(yeni(), { yas: 'kucuk', gun: 3, oynanabilir: (t) => t === 'patates' });
    expect(k.tarif.map((x) => x.id)).toEqual(['patates']);
  });

  it('alınan kart bir daha çıkmaz; seçili örtü çıkmaz, diğer örtüler çıkar', () => {
    const d = yeni();
    d.jeton = 20;
    expect(satinAl(d, kalem('ortu-kareli')!, 'kucuk').ok).toBe(true);
    const k = defterKartlari(d, { yas: 'kucuk', gun: 2, ...hepsiOynanir });
    expect(k.sus.some((x) => x.id === 'ortu-kareli')).toBe(false);
    expect(d.ortu).toBe('kareli');
  });
});

describe('her gün en az bir alım (§6b)', () => {
  it('kasa yetmiyorsa Babaanne en ucuz karta yetecek kadar atar; yetiyorsa atmaz', () => {
    for (const yas of ['kucuk', 'buyuk'] as const) {
      const d = yeni();
      d.jeton = 1;
      const k = defterKartlari(d, { yas, gun: 1, ...hepsiOynanir });
      const h = babaanneHediyesi(d, k, yas);
      expect(h).toBeGreaterThan(0);
      d.jeton += h;
      expect(SEKMELER.flatMap((s) => k[s]).some((x) => alinabilirMi(x, d.jeton, yas))).toBe(true);
      expect(babaanneHediyesi(d, k, yas)).toBe(0);
    }
  });

  it('5 gün art arda: her gün bir şey alınır, masa müşteri sayısını artırır, tarif ertesi gün istenir', () => {
    const d = yeni();
    const yas = 'kucuk' as const;
    const gunluk = [9, 10, 10, 11, 12];
    const alinan: string[] = [];
    let oncekiMusteri = 0;
    for (let gun = 1; gun <= 5; gun++) {
      const masa = masaSayisi(d);
      const plan = gunPlani({ gun, yas, tohum: gun * 7, menu: menuOnerisi(d.acilan.tarif, [], yas, d.yeniTarif), masa, yeniTarif: d.yeniTarif ?? undefined });
      if (d.yeniTarif) expect(plan.musteriler[0].istek).toEqual({ tur: 'resimli', tarif: d.yeniTarif });
      expect(plan.musteriler.length).toBe(musteriSayisi(gun, yas, masa));
      if (gun > 2) expect(plan.musteriler.length).toBeGreaterThanOrEqual(oncekiMusteri);
      oncekiMusteri = plan.musteriler.length;
      d.yeniTarif = null;
      d.jeton += gunluk[gun - 1];
      const kartlar = defterKartlari(d, { yas, gun, ...hepsiOynanir });
      d.jeton += babaanneHediyesi(d, kartlar, yas);
      // her gün başka bir sekmeden (tarif → masa → süs → ...)
      const sira = [kartlar.masa, kartlar.tarif, kartlar.sus, kartlar.tarif, kartlar.masa].map((l) => l.find((k) => alinabilirMi(k, d.jeton, yas)));
      const sec = sira[gun - 1] ?? SEKMELER.flatMap((s) => kartlar[s]).find((k) => alinabilirMi(k, d.jeton, yas))!;
      const r = satinAl(d, sec, yas);
      expect(r.ok).toBe(true);
      if (r.yuvalar) expect(yerlestir(d, sec.id, r.yuvalar[r.yuvalar.length - 1])).toBe(true);
      alinan.push(sec.id);
    }
    expect(alinan.length).toBe(5);
    expect(new Set(alinan).size).toBe(5);
    expect(masaSayisi(d)).toBeGreaterThan(2);
    expect(d.acilan.tarif.length).toBeGreaterThan(2);
  });
});

describe('yerleşim', () => {
  it('masa: çocuk boş yuvalardan birini seçer; dolu yuvaya konmaz', () => {
    const d = yeni();
    d.jeton = 10;
    const r = satinAl(d, kalem('masa-3')!, 'kucuk');
    expect(r.yuvalar).toEqual(['2', '3']);
    expect(yerlestir(d, 'masa-3', '0')).toBe(false);
    expect(yerlestir(d, 'masa-3', '3')).toBe(true);
    expect(d.jeton).toBe(5);
    expect(bosMasaYuvalari(d)).toEqual(['2']);
    expect(masaSayisi(d)).toBe(3);
  });

  it('süs: kendi türündeki boş yuvalara (duvar, zemin, tavan); dolunca kart çıkmaz', () => {
    const d = yeni();
    d.jeton = 100;
    for (let i = 0; i < 3; i++) {
      const k = defterKartlari(d, { yas: 'kucuk', gun: 9, ...hepsiOynanir, enCok: 20 }).sus.find((x) => x.yer === 'zemin')!;
      const r = satinAl(d, k, 'kucuk');
      expect(r.yuvalar!.length).toBe(3 - i);
      yerlestir(d, k.id, r.yuvalar![0]);
    }
    expect(defterKartlari(d, { yas: 'kucuk', gun: 9, ...hepsiOynanir, enCok: 20 }).sus.some((x) => x.yer === 'zemin')).toBe(false);
  });

  it('bahçe: iki bahçe masası kendi yuvalarına kurulur, masa yuvası 6 olur', () => {
    const d = yeni();
    d.jeton = 30;
    expect(satinAl(d, kalem('bahce')!, 'kucuk').ok).toBe(true);
    expect(d.yerlesim.masa['4']).toBe('bahce-masa-1');
    expect(d.yerlesim.masa['5']).toBe('bahce-masa-2');
    expect(masaSayisi(d)).toBe(4);
    expect(bosMasaYuvalari(d)).toEqual(['2', '3']);
  });

  it('içecek tezgâhı bir kez yer kaplar (limonata ayranınkini paylaşır)', () => {
    const d = yeni();
    d.jeton = 50;
    expect(satinAl(d, kalem('ayran')!, 'kucuk').istasyon).toBe('icecek');
    expect(satinAl(d, kalem('limonata')!, 'kucuk').istasyon).toBeUndefined();
    expect(d.yeniTarif).toBe('limonata');
  });

  it('yerleşmemiş alım (uygulama kapandı) ilk boş yuvaya konur', () => {
    const d = yeni();
    d.acilan.masa.push('masa-3');
    d.acilan.sus.push('saksi');
    yerlesmemisleriKoy(d);
    expect(d.yerlesim.masa['2']).toBe('masa-3');
    expect(d.yerlesim.sus['zemin-1']).toBe('saksi');
  });
});

describe('menü tahtası', () => {
  it('yeni tarif başta; 3-4 iki yuva, 5-6 üç yuva; seçim yalnız açık tarif yuvadan çoksa', () => {
    expect(menuOnerisi(['salata', 'menemen', 'ayran'], ['salata', 'menemen'], 'kucuk', 'ayran')).toEqual(['ayran', 'salata']);
    expect(menuOnerisi(['salata', 'menemen', 'ayran'], [], 'buyuk', null)).toEqual(['salata', 'menemen', 'ayran']);
    expect(menuSecimiVar(['salata', 'menemen'], 'kucuk')).toBe(false);
    expect(menuSecimiVar(['salata', 'menemen', 'ayran'], 'kucuk')).toBe(true);
    expect(menuSecimiVar(['salata', 'menemen', 'ayran'], 'buyuk')).toBe(false);
  });
});

describe('kayıt göçü ve sıfırlama', () => {
  const depo = new Map<string, string>();
  beforeEach(() => {
    depo.clear();
    (globalThis as unknown as { localStorage: unknown }).localStorage = { getItem: (k: string) => depo.get(k) ?? null, setItem: (k: string, v: string) => depo.set(k, v), removeItem: (k: string) => depo.delete(k) };
  });

  it('sıfırla: kayıt boşa döner ve depodan silinir', async () => {
    const { kayit, kaydet, sifirla } = await import('../../restoran/src/kayit');
    kayit.jeton = 12;
    kayit.acilan.tarif.push('ayran');
    kaydet();
    expect(depo.has(KAYIT_ANAHTARI)).toBe(true);
    sifirla();
    expect(depo.has(KAYIT_ANAHTARI)).toBe(false);
    expect(kayit).toEqual(bosKayit());
  });

  it('P1 kaydı (yerleşimsiz) göç eder: masalar ilk yuvalara, yeniTarif açık değilse düşer', () => {
    const k = kayitCoz({ surum: 1, gun: 2, jeton: 7, acilan: { tarif: ['salata', 'menemen'], masa: ['masa-1', 'masa-2', 'masa-3'] }, yeniTarif: 'pide', ortu: 'cicekli' });
    expect(k.yerlesim.masa).toEqual({ '0': 'masa-1', '1': 'masa-2', '2': 'masa-3' });
    expect(k.yeniTarif).toBeNull();
    expect(k.ortu).toBe('cicekli');
    expect(k.jeton).toBe(7);
  });

  it('bozuk kayıt boş kayda döner; eksik ilk tarifler ve ilk masalar geri gelir', () => {
    expect(kayitCoz('bozuk')).toEqual(bosKayit());
    expect(kayitCoz(null)).toEqual(bosKayit());
    const k = kayitCoz({ acilan: { tarif: ['ayran'], masa: [] }, jeton: -5, gun: 'x' });
    expect(k.acilan.tarif).toEqual(expect.arrayContaining(['salata', 'menemen', 'ayran']));
    expect(Object.values(k.yerlesim.masa).sort()).toEqual(['masa-1', 'masa-2']);
    expect(k.jeton).toBe(0);
    expect(k.gun).toBe(0);
  });

  it('kaydedilen kayıt aynı geri okunur (bahçe masaları bahçe yuvalarında kalır)', () => {
    const d = bosKayit();
    d.jeton = 40;
    satinAl(d, kalem('bahce')!, 'kucuk');
    satinAl(d, kalem('ayran')!, 'kucuk');
    const geri = kayitCoz(JSON.parse(JSON.stringify(d)));
    expect(geri).toEqual(d);
    expect(KAYIT_ANAHTARI).toBe('minkino-restoran-v1');
  });
});

describe('defter sözleri', () => {
  it('Mino ve Babaanne sözleri kısa, emir yok', () => {
    const topla = (v: unknown): string[] => (typeof v === 'string' ? [v] : v && typeof v === 'object' ? Object.values(v).flatMap(topla) : []);
    const sozler = [...topla(defter.mino), ...topla(defter.babaanne), ...topla(defter.kino)];
    expect(sozler.length).toBeGreaterThan(5);
    for (const s of sozler) {
      expect(YASAK_DESEN.test(s)).toBe(false);
      expect(s.replace(/\[[^\]]*\]\s*/g, '').length).toBeLessThanOrEqual(34);
    }
  });
});
