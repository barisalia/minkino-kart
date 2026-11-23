import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { acikHeceSesi, hecele } from '../../alfabe/src/posta-kutusu-secim';

// Trambolin, Pano ve Hece Kulağı'nın ek sözcükleri (pano-sozcukleri.ts, 21 Kasım): Obur ve Harf Kutusu kartlarından,
// yalnız bütün heceleri Ceren kayıtlı olanlar. Bu test kuralın veri tarafını sınar (tarayıcısız).
const kayit = (id: string) => existsSync('assets/alfabe/ses/' + id + '.mp3');
const UNLU = /[aeıioöuü]/;
/** pano-sozcukleri.ts → parcaSesi ile aynı sıra: önce pano-hece, sonra açık hecede Hece Evleri kaydı. */
function heceKaydi(h: string): string | undefined {
  if (kayit('pano-hece-' + h)) return 'pano-hece-' + h;
  if (h.length === 2 && !UNLU.test(h[0]) && UNLU.test(h[1]) && kayit(acikHeceSesi(h[0], h[1]))) return acikHeceSesi(h[0], h[1]);
  return undefined;
}

describe('Pano ek sözcükleri', () => {
  const obur = readFileSync('alfabe/src/obur-resimleri.ts', 'utf8');
  const kartlar = [...obur.matchAll(/\{ id: '([^']+)', ad: '([^']+)', resim: [^,]+, ses: '([^']+)' \}/g)].map(m => ({ id: m[1], ad: m[2], ses: m[3] }));

  it('Obur kartları okunabiliyor ve her birinin ad kaydı var', () => {
    expect(kartlar.length).toBeGreaterThan(20);
    for (const k of kartlar) expect(kayit(k.ses), k.ses).toBe(true);
  });

  it('heceleme ve hece kaydı: açık hecede Hece Evleri kaydına düşer', () => {
    expect(hecele('lahana')).toEqual(['la', 'ha', 'na']);
    expect(heceKaydi('na')).toBeDefined();
    expect(hecele('kapı')).toEqual(['ka', 'pı']);
  });

  it('Pano\'ya giren her ek sözcüğün bütün heceleri kayıtlı (kayıtsız hece sözcüğü dışarıda bırakır)', () => {
    let giren = 0;
    for (const k of kartlar) {
      const ad = k.ad.toLocaleLowerCase('tr');
      if (ad.includes(' ')) continue;
      const hc = hecele(ad);
      if (hc.length < 2 || hc.length > 3) continue;
      if (hc.every(h => heceKaydi(h))) giren++;
    }
    expect(giren).toBeGreaterThan(5);
  });
});
