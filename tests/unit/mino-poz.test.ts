import { describe, expect, it } from 'vitest';
import kaynak from '../../ekip/mino/mino-final.svg?raw';
import oyuncu from '../../film/src/oyuncu.ts?raw';
import { durusPozu, ISARET_ACI, kolCoz, KOL_EN_COK, KOL_YUKARI_EN_COK, KOL_YUKARI_ESIK, MINO_POZ_ALAN, pozKolu } from '../../src/mino/mino-poz';
import { MINO_POZ_SVG } from '../../src/mino/mino-poz-svg';
import { MINO_SVG } from '../../src/mino/mino-svg';

describe('Mino pozları: kol açısı', () => {
  it('poz yoksa eski davranış: kol -8 … 24° arasında kalır, kalkık kol hiç çıkmaz', () => {
    for (const a of [-30, -8, 0, 10, 24, 40, 90, 200]) {
      const k = kolCoz(0, a);
      expect(k.yukari).toBe(false);
      expect(k.aci).toBe(Math.max(-8, Math.min(KOL_EN_COK, a)));
    }
  });

  it('kol() açısı 30°’yi geçince kalkık kol aynı açıyla (en çok 160°); altında asıl kol', () => {
    expect(KOL_YUKARI_ESIK).toBe(30);
    for (const a of [40, 90, 130, 160]) expect(kolCoz(a, 0)).toEqual({ yukari: true, aci: a });
    expect(kolCoz(200, 0)).toEqual({ yukari: true, aci: KOL_YUKARI_EN_COK });
    expect(kolCoz(20, 0)).toEqual({ yukari: false, aci: 20 });
    expect(kolCoz(28, 0)).toEqual({ yukari: false, aci: KOL_EN_COK });
    // bekleme / tepki hareketi üstüne eklenir (el sallama)
    expect(kolCoz(140, 8)).toEqual({ yukari: true, aci: 148 });
  });

  it('kalkık kol çizimi yüklenmediyse asıl kol 24°’de durur', () => {
    expect(kolCoz(90, 0, false)).toEqual({ yukari: false, aci: KOL_EN_COK });
  });

  it('işaret: o yandaki kol 85°, öbürü ve diğer pozlar 0', () => {
    expect(ISARET_ACI).toBe(85);
    expect(pozKolu('isaret-sag', 'sag')).toBe(85);
    expect(pozKolu('isaret-sag', 'sol')).toBe(0);
    expect(pozKolu('isaret-sol', 'sol')).toBe(85);
    for (const p of ['dusun', 'sarilma', null] as const) for (const y of ['sol', 'sag'] as const) expect(pozKolu(p, y)).toBe(0);
  });
});

describe('Mino pozları: film duruşu (Kino ile aynı adlar)', () => {
  it('alanlar Kino’nun duruş alanlarını içerir', () => {
    const kino = oyuncu.match(/const KARAKTER_ALAN = \[([^\]]+)\]/)![1];
    for (const k of ['otur', 'yukSol', 'yukSag', 'dusun', 'bakan']) {
      expect(MINO_POZ_ALAN).toContain(k);
      expect(kino).toContain(`'${k}'`);
    }
  });

  it('yalnız verilen alanlar döner; öncelik sarılma > düşünme > bakış', () => {
    expect(durusPozu({ kafaAci: 4 })).toEqual({});
    expect(durusPozu({ otur: 1, yukSag: 150 })).toEqual({ otur: true, yukSag: 150 });
    expect(durusPozu({ otur: 0.3 })).toEqual({ otur: false });
    expect(durusPozu({ bakan: 1 }).poz).toBe('isaret-sag');
    expect(durusPozu({ bakan: -1 }).poz).toBe('isaret-sol');
    expect(durusPozu({ bakan: 0 }).poz).toBeNull();
    expect(durusPozu({ dusun: 1, bakan: 1 }).poz).toBe('dusun');
    expect(durusPozu({ saril: 1, dusun: 1 }).poz).toBe('sarilma');
    expect(durusPozu({ dusun: 0 }).poz).toBeNull();
  });
});

describe('Mino pozları: çizim ekleri (scripts/mino/rig.mjs)', () => {
  const hepsi = Object.values(MINO_POZ_SVG).join('');
  it('her poz grubu pakette, tasarımcının katmanlarıyla', () => {
    for (const id of ['kol-sol-yukari', 'kol-sag-yukari', 'govde-oturma', 'kuyruk-oturma', 'kol-sag-dusun', 'goz-dusun', 'agiz-dusun', 'goz-bak-sag', 'goz-bak-sol', 'kol-sol-sarilma', 'kol-sag-sarilma']) {
      expect(kaynak).toContain(`<g id="${id}" display="none"`);
    }
    expect(MINO_POZ_SVG.kuyruk).toContain('m-poz-otur');
    expect(MINO_POZ_SVG.govde).toContain('m-poz-otur');
    for (const s of ['m-poz-dusun-goz', 'm-poz-dusun-agiz', 'm-poz-bak-sag', 'm-poz-bak-sol']) expect(MINO_POZ_SVG.yuz).toContain(s);
    for (const s of ['m-poz-kol-sol-yukari', 'm-poz-kol-sag-yukari', 'm-poz-kol-dusun', 'm-poz-sarilma']) expect(MINO_POZ_SVG.kol).toContain(s);
    // gizli değil (görünürlüğü CSS sınıfları yönetir), kimlik yok (katman adları çıkar)
    expect(hepsi).not.toContain('display="none"');
    expect(hepsi).not.toMatch(/<g id="(kol|goz|agiz|govde|kuyruk)-/);
  });

  it('kırpma yolu kimlikleri m- önekli (Kino’nun f3-… kimlikleriyle çakışmaz), her url bir kimliğe gider', () => {
    const kimlik = new Set([...hepsi.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]));
    for (const id of kimlik) expect(id.startsWith('m-'), id).toBe(true);
    const ana = new Set([...MINO_SVG.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]));
    for (const [, id] of hepsi.matchAll(/url\(#([^)]+)\)/g)) expect(kimlik.has(id) || ana.has(id), id).toBe(true);
  });

  it('varsayılan çizim değişmedi: ana pakette poz eki yok', () => {
    expect(MINO_SVG).not.toContain('m-poz');
    expect(MINO_SVG).not.toContain('oturma');
  });
});
