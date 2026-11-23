import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { havuzHeceSesleri, havuzSozcukleri } from '../../alfabe/src/sozcuk-havuzu';
import { heceler as temel, parcaSesi } from '../../alfabe/src/hece-sozlugu';

// Sözcük havuzunun Pano ve Hece Kulağı'na bağlanması (alfabe/src/sozcuk-havuzu.ts, pano-sozcukleri.ts, hece-sozlugu.ts).
interface Sozcuk { sozcuk: string; resim: string; enKucukYas: string; ses: string; heceler: { hece: string; ses: string }[] }
const havuz = JSON.parse(readFileSync('ekip/alfabe/sozcuk-havuzu.json', 'utf8')).sozcukler as Sozcuk[];
const kayit = (id: string) => existsSync('assets/alfabe/ses/' + id + '.mp3');

describe('sözcük havuzu bağlantısı', () => {
  it('resmi gelmemiş sözcük oyunda görünmez', () => {
    const gelen = havuz.filter(s => existsSync(s.resim)).length;
    expect(havuzSozcukleri('5+')).toHaveLength(gelen);
  });
  it('hece sesi listedeki `ses` alanından gelir, önekten tahmin edilmez; her biri var', () => {
    for (const s of havuz) for (const h of s.heceler) {
      expect(parcaSesi(h.hece), s.sozcuk + ' · ' + h.hece).toBe(h.ses);
      expect(kayit(h.ses), h.ses).toBe(true);
    }
    expect(havuzHeceSesleri['rı']).toBe('ev-r-ii');
  });
  it('havuzdan önce var olan sözcüklerin heceleri kendi pano-hece kaydıyla çalmaya devam eder', () => {
    for (const h of new Set(Object.values(temel).flat())) {
      if (kayit('pano-hece-' + h)) expect(parcaSesi(h), h).toBe('pano-hece-' + h);
    }
  });
  it('aynı hece havuzda tek bir kayda bağlı', () => {
    const gorulen = new Map<string, string>();
    for (const s of havuz) for (const h of s.heceler) {
      if (gorulen.has(h.hece)) expect(h.ses, h.hece).toBe(gorulen.get(h.hece));
      gorulen.set(h.hece, h.ses);
    }
  });
});

describe('tek heceli sözcükler (jip, kuş, mum)', async () => {
  const { kullanimVar, panoyaGirer } = await import('../../alfabe/src/sozcuk-havuzu');
  const { kutuTurlari } = await import('../../alfabe/src/harf-kutusu-kartlari');
  const dersler = (await import('../../alfabe/src/harfler.json')).default;
  const bul = (s: string) => havuz.find(x => x.sozcuk === s)! as unknown as Parameters<typeof panoyaGirer>[0] & { kullanim?: ('pano' | 'ders' | 'cumle')[] };
  it('tek heceli sözcük Pano\'ya ve Hece Kulağı\'na girmez; derste ve Ceren\'le oku\'da kullanılır', () => {
    for (const s of ['jip', 'kuş', 'mum']) {
      expect(panoyaGirer(bul(s)), s).toBe(false);
      expect(kullanimVar(bul(s), 'ders'), s).toBe(true);
      expect(kullanimVar(bul(s), 'cumle'), s).toBe(true);
    }
    expect(panoyaGirer(bul('balon'))).toBe(true);
    expect(havuz.filter(s => s.heceler.length < 2).every(s => !panoyaGirer(s as never))).toBe(true);
  });
  it('derste görünür: resmi gelince Keşfet\'in ikinci sözcüğü günden güne havuz sözcüğüyle sırayla değişir', () => {
    const k = dersler.find(d => d.upper === 'K')!;
    const kus = { id: 'havuz-kus', ad: 'Kuş', gorsel: 'kus.webp', ses: 'pano-ad-kus' };
    const eski = kutuTurlari(k)[1].hedef.ad;
    const gunler = [0, 1, 2, 3].map(g => kutuTurlari(k, 3, Math.random, [kus], g)[1].hedef.ad);
    expect(gunler).toContain('Kuş');
    expect(gunler).toContain(eski);
    expect(new Set([0, 1, 2].map(g => kutuTurlari(k, 3, Math.random, [], g)[1].hedef.ad))).toEqual(new Set([eski]));
  });
});
