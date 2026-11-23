import { describe, expect, it } from 'vitest';
import { kareVar, kareleri } from '../../matematik/src/a1-kareler';

// Matematik · A1 kare bağlayıcısı (a1-kareler.ts): bir resmin kareleri ad kuralıyla çözülür; kare yoksa boş döner ve hiçbir
// şey bağlanmaz (bugün kareler henüz gelmedi).
describe('A1 kare bağlayıcısı', () => {
  it('mevcut resimler ada çözülür (klasör yoluyla)', () => {
    expect(kareVar('iki-kase/lokum-kase-0')).toBe(true);
    expect(kareVar('ceren/rakam-1')).toBe(true);
    expect(kareVar('yok/boyle-bir-resim')).toBe(false);
  });
  it('kareler gelmeden bütün alanlar boş (oyun bugünkü gibi sürer)', () => {
    const k = kareleri('iki-kase/lokum-kase-0');
    expect(k).toEqual({ goz: undefined, sevinc: undefined, saskin: undefined, hop: [], bos: [] });
  });
  it('dizi kareleri ancak hepsi varsa kullanılır', () => {
    expect(kareleri('ceren/rakam-1').hop).toEqual([]);
  });
});
