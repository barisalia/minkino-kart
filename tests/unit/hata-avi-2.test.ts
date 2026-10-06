import { describe, expect, it } from 'vitest';
import { gosterilecekDeneme } from '../../src/abonelik/satin';
import { kutlanacakTemalar, kutlanmamisAcilanlar } from '../../src/engine/odul';
import { PERDE_KORUMA_MS, perdeKapatabilirMi } from '../../src/ui/dom';

describe('perde koruması (çift dokunuş açılan pencereyi hemen kapatmaz)', () => {
  it('açılıştan sonraki ilk 600 ms perdeye dokunmak kapatmaz, sonra kapatır', () => {
    expect(PERDE_KORUMA_MS).toBe(600);
    expect(perdeKapatabilirMi(1000, 1000)).toBe(false);
    expect(perdeKapatabilirMi(1000, 1250)).toBe(false);
    expect(perdeKapatabilirMi(1000, 1599)).toBe(false);
    expect(perdeKapatabilirMi(1000, 1600)).toBe(true);
    expect(perdeKapatabilirMi(1000, 5000)).toBe(true);
  });
});

describe('abonelik ekranındaki deneme yazısı', () => {
  it('iOS: deneme yalnız mağaza bu kullanıcı için "uygun" derse gösterilir', () => {
    expect(gosterilecekDeneme(7, true, true)).toBe(7);
    expect(gosterilecekDeneme(7, true, false)).toBeNull();
    // bilinmiyor / sorulamadı: deneme vaat edilmez
    expect(gosterilecekDeneme(7, true, undefined)).toBeNull();
    expect(gosterilecekDeneme(null, true, true)).toBeNull();
  });
  it('Android: mağazanın verdiği deneme olduğu gibi (Play yalnız hakkı olan teklifi verir)', () => {
    expect(gosterilecekDeneme(7, false, undefined)).toBe(7);
    expect(gosterilecekDeneme(null, false, undefined)).toBeNull();
  });
});

describe('kaçırılan "Yeni paket açıldı!" kutlaması', () => {
  it('kartla açılmış ama kutlanmamış paketler bulunur; baştan açık paketler sayılmaz', () => {
    expect(kutlanmamisAcilanlar(0, false, [])).toEqual([]);
    expect(kutlanmamisAcilanlar(5, false, [])).toEqual([]);
    expect(kutlanmamisAcilanlar(6, false, [])).toEqual(['tasitlar']);
    expect(kutlanmamisAcilanlar(6, false, ['tasitlar'])).toEqual([]);
    expect(kutlanmamisAcilanlar(30, false, ['tasitlar', 'sayilar'])).toEqual(['renkler', 'harfler']);
  });
  it('tur sonunda: bu turda açılan önce, sonra kaçırılanlar; her paket bir kez', () => {
    expect(kutlanacakTemalar(['renkler'], 14, false, [])).toEqual(['renkler', 'tasitlar']);
    expect(kutlanacakTemalar([], 14, false, ['renkler', 'tasitlar'])).toEqual([]);
    expect(kutlanacakTemalar(['renkler'], 14, false, ['renkler'])).toEqual(['tasitlar']);
  });
});
