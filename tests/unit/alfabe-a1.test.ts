import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { hareketi, KARELER } from '../../alfabe/src/kesfet-canlanma';
import { EFEKTLER, hepsiVarsa, kaynakAdi } from '../../alfabe/src/a1-kareler';
import { GOZ_KARELERI, TEPKI_POZLARI, gozKirpmaHazir } from '../../alfabe/src/ceren-tepki';

// Paket Harf-A1 (23 Kasım): Keşfet'te sözcüğe göre canlanan resim, Ceren'in göz kırpması ve tepkileri, Hikâye Defteri'nin
// kitap parçaları ve öykü katmanları. Kareler gelene kadar eski hâl; kod beklediği adları brief'ten alır.
describe('Paket Harf-A1', () => {
  it('her sözcüğün kendi hareketi var; bilinmeyen sözcük "hop" yapar', () => {
    expect(hareketi('Balon')).toBe('sis');
    expect(hareketi('balık')).toBe('yuz');
    expect(hareketi('Tavşan')).toBe('zipla');
    expect(hareketi('arı')).toBe('uc');
    expect(hareketi('Davul')).toBe('titre');
    expect(hareketi('Yıldız.')).toBe('parla');
    expect(hareketi('kuzgun')).toBe('hop');
    for (const k of Object.values(KARELER)) { expect(k.length).toBeGreaterThanOrEqual(3); expect(k[0].transform).toBeDefined(); }
  });
  it('dersin 29 örnek sözcüğünün hepsi bir harekete bağlı (hop dışında)', () => {
    const dersler = JSON.parse(readFileSync('alfabe/src/harfler.json', 'utf8')) as { example: string }[];
    const hoplar = dersler.map((d) => d.example).filter((s) => hareketi(s) === 'hop');
    expect(hoplar).toEqual([]);
  });
  it('kare kapısı: biri eksikse açılmaz; kart kimliğinden kaynak adı', () => {
    expect(hepsiVarsa(['a', 'b'], (x) => (x === 'a' ? 'u/a' : undefined))).toBeUndefined();
    expect(hepsiVarsa(['a', 'b'], (x) => 'u/' + x)).toEqual(['u/a', 'u/b']);
    expect(kaynakAdi('havuz-ari')).toBe('ari');
    expect(kaynakAdi('01')).toBe('01');
    expect(gozKirpmaHazir((ad) => ad === 'goz-yari')).toBe(false);
    expect(gozKirpmaHazir(() => true)).toBe(true);
  });
  it('kodun beklediği bütün dosya adları Astra brief\'inde yazılı', () => {
    const tum = readFileSync('CLAUDE-ASTRA-MESAJLAR.md', 'utf8');
    const brief = tum.slice(tum.lastIndexOf('Paket Harf-A1 ·'));
    for (const ad of [...GOZ_KARELERI, ...TEPKI_POZLARI]) expect(brief, ad).toContain('`' + ad + '.webp`');
    for (const ad of Object.values(EFEKTLER).flat()) expect(brief, ad).toContain(ad + '.webp');
    for (const ad of ['tus', 'tus-basili', 'tus-bulundu', 'tus-ipucu', 'kivrim-0', 'kivrim-1', 'kivrim-2', 'kose', 'ayrac', 'kapak', 'rozet', 'kirpinti']) expect(brief, ad).toContain('`' + ad + '.webp`');
    for (const k of ['assets/alfabe/ceren-tepki/', 'assets/alfabe/kesfet-efekt/', 'assets/alfabe/kesfet-hareket/', 'assets/alfabe/kitap/', 'assets/alfabe/oyku-katman/', '-zemin.webp', '-nesne.webp', '-nesne-2.webp']) expect(brief, k).toContain(k);
  });
  it('A1-ek: ikinci nesne ve ikinci ses grubu kareleri brief’te (kodun beklediği adlarla)', () => {
    const tum = readFileSync('CLAUDE-ASTRA-MESAJLAR.md', 'utf8');
    const ek = tum.slice(tum.lastIndexOf('Paket Harf-A1-ek ·'));
    for (const k of ['<sayfa>-nesne-b.webp', '<sayfa>-nesne-b-2.webp', 'iki nesne de çıkarılmış', 'assets/alfabe/kesfet-hareket/']) expect(ek, k).toContain(k);
    const kaynak = readFileSync('alfabe/src/a1-kareler.ts', 'utf8');
    expect(kaynak).toContain("'-nesne-b'");
    expect(kaynak).toContain("'-nesne-b-2'");
  });
});
