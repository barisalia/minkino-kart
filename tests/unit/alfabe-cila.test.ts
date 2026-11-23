import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { cilaVurus, ipucuEklendi } from '../../alfabe/src/cila';

// Türkçe cila katmanı (22 Kasım gecesi; alfabe/src/cila.ts): yanlışın ceza tonu yerine komik ses çalar, doğru ve nötr
// vuruşlar kendi seslerini korur. Bütün adımlar oyun-sesi.ts üzerinden geçtiği için cila oradan kurulur.
describe('Türkçe cila katmanı', () => {
  it('yanlış (geri) vuruşunun eski sesi çalınmaz: yerine komik ses', () => {
    expect(cilaVurus('geri')).toBe(true);
  });
  it('doğru ve nötr vuruşlar kendi seslerini çalar', () => {
    for (const ad of ['birles', 'parilti', 'miknatis', 'kagit', 'kutu', 'damla', 'zil', 'korna']) expect(cilaVurus(ad), ad).toBe(false);
  });
  it('oyun-sesi.ts her vuruşta cilaya uğrar ve cilayı kendiliğinden kurar', () => {
    const kaynak = readFileSync('alfabe/src/oyun-sesi.ts', 'utf8');
    expect(kaynak).toMatch(/if \(cilaVurus\(ad\)\) return;/);
    expect(kaynak).toMatch(/^cilaKendiliginden\(\);$/m);
  });
  it('ipucu sınıfı yeni eklenince Ceren gösterir; zaten varsa ya da başka sınıfsa göstermez', () => {
    expect(ipucuEklendi('mik-tas', 'mik-tas mik-ipucu')).toBe(true);
    expect(ipucuEklendi('he-ev', 'he-ev salla')).toBe(true);
    expect(ipucuEklendi('mik-tas mik-ipucu', 'mik-tas mik-ipucu mik-alindi')).toBe(false);
    expect(ipucuEklendi('hk-kart', 'hk-kart hk-alindi')).toBe(false);
  });
});
