import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { kopruAdaylari, kopruOturumu, OTURUM_SOZCUK, yanlisHece } from '../../alfabe/src/hece-koprusu-secim';
import type { HavuzSozcugu } from '../../alfabe/src/sozcuk-havuzu';

// "Lokum'un Hece Köprüsü"nün sözcük seçimi (alfabe/src/hece-koprusu-secim.ts).
const s = (id: string, heceler: string[], pano = true): HavuzSozcugu =>
  ({ id, ad: id, harf: id[0], gorsel: '', ses: '', heceler, heceSesleri: [], pano, ders: true });
const havuz = [
  s('ana', ['a', 'na']), s('nane', ['na', 'ne']), s('tane', ['ta', 'ne']), s('anten', ['an', 'ten']),
  s('etek', ['e', 'tek']), s('tencere', ['ten', 'ce', 're']), s('elma', ['el', 'ma']), s('kuş', ['kuş'], false),
  s('televizyon', ['te', 'le', 'viz', 'yon']),
];
const harfler = (...h: string[]) => new Set(h);
const ANET = harfler('a', 'n', 'e', 't');

describe('köprü sözcük seçimi', () => {
  it('4 yaş yalnız iki heceli sözcük alır', () => {
    const ad = kopruAdaylari(havuz, harfler(...'abcçdefgğhıijklmnoöprsştuüvyz'), '4');
    expect(ad.every(x => x.heceler.length === 2)).toBe(true);
    expect(ad.map(x => x.id)).toContain('elma');
  });
  it('5+ iki ve üç heceli alır; tek ve dört heceli girmez', () => {
    const ad = kopruAdaylari(havuz, harfler(...'abcçdefgğhıijklmnoöprsştuüvyz'), '5+').map(x => x.id);
    expect(ad).toContain('tencere');
    expect(ad).toContain('elma');
    expect(ad).not.toContain('kuş');
    expect(ad).not.toContain('televizyon');
  });
  it('yalnız bitirilen harflerle kurulan sözcükler gelir', () => {
    expect(kopruAdaylari(havuz, ANET, '5+').map(x => x.id).sort()).toEqual(['ana', 'anten', 'nane', 'tane']);
    expect(kopruAdaylari(havuz, harfler('a', 'n'), '4').map(x => x.id)).toEqual(['ana']);
    expect(kopruAdaylari(havuz, harfler('e', 't'), '4')).toEqual([]);
  });
  it('panoya girmeyen (tek heceli) sözcük köprüye de girmez', () => {
    expect(kopruAdaylari([s('kuşu', ['ku', 'şu'], false)], harfler('k', 'u', 'ş'), '4')).toEqual([]);
  });
  it('oturumda 3 sözcük, hiçbiri iki kez yok; hiç görülmeyenler önce', () => {
    const ad = kopruAdaylari(havuz, ANET, '5+');
    const gorulen = { ana: 4, nane: 2 };
    for (let tur = 0; tur < 20; tur++) {
      const o = kopruOturumu(ad, gorulen);
      expect(o).toHaveLength(OTURUM_SOZCUK);
      expect(new Set(o.map(x => x.id)).size).toBe(OTURUM_SOZCUK);
      expect(o.map(x => x.id).slice(0, 2).sort()).toEqual(['anten', 'tane']);
      expect(o[2].id).toBe('nane');
    }
  });
  it('yanlış taş oturumun başka sözcüğünden ve bu sözcükte olmayan bir hece', () => {
    const o = [havuz[0], havuz[2], havuz[3]];
    for (let i = 0; i < 20; i++) {
      const y = yanlisHece(o[0], o);
      expect(['ta', 'ne', 'an', 'ten']).toContain(y);
    }
    expect(yanlisHece(o[0], [o[0]])).toBeUndefined();
  });
  it('havuzdaki her hece Türk alfabesinin harflerinden: hiçbir sözcük ulaşılamaz kalmaz', () => {
    const liste = JSON.parse(readFileSync('ekip/alfabe/sozcuk-havuzu.json', 'utf8')).sozcukler as { heceler: { hece: string }[] }[];
    const abc = harfler(...'abcçdefgğhıijklmnoöprsştuüvyz');
    for (const k of liste) for (const h of k.heceler) for (const c of h.hece.toLocaleLowerCase('tr')) expect(abc.has(c), h.hece).toBe(true);
  });
});
