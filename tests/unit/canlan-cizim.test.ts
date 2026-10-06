/**
 * Çiz Canlansın çizim ekranı düzeltmeleri (Hata avı 2, #9-#14):
 * - Yol modu: Geri al / Temizle / Tamamla sonrası boyalı yol tuvaldeki çizgilerden baştan hesaplanır.
 * - Nokta modu "Tamamla": oyun biten şekillerden sonra devam eder (1. noktaya dönmez, eski çizgiler silinmez).
 * - Kart penceresi Android uygulamasında yapılamayacak bir şey (basılı tutup kaydet) söz vermez.
 * - iOS: Fotoğraflar'a ekleme izni metni var (yoksa kaydederken uygulama kapanır).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Cizgi } from '../../src/ui/tuval';
import { kartKayitIpucu } from '../../canlan/src/kart';
import { devamBasi } from '../../canlan/src/nokta';
import { YolIzi } from '../../canlan/src/yol-izi';
import type { Nokta } from '../../canlan/src/resimler';

const oku = (yol: string) => readFileSync(resolve(__dirname, '../..', yol), 'utf8');
const cizgi = (noktalar: Nokta[], silgi = false): Cizgi => ({ renk: '#000', kalinlik: 0.02, silgi, noktalar });

describe('yol modu: boyalı yol', () => {
  // 0.1 aralıkla 10 yol noktası (y = 0.5)
  const yol: Nokta[] = Array.from({ length: 10 }, (_, i) => [0.05 + i * 0.1, 0.5]);

  it('parmağın geçtiği noktalar dolar, aynı nokta iki kez sayılmaz', () => {
    const iz = new YolIzi(yol, 0.04);
    expect(iz.isle([0.05, 0.5])).toEqual([0]);
    expect(iz.isle([0.06, 0.5])).toEqual([]);
    expect(iz.sayi).toBe(1);
    expect(iz.oran()).toBeCloseTo(0.1);
  });

  it('Temizle sonrası boya sıfırlanır, Geri al sonrası yalnız kalan çizgi sayılır', () => {
    const iz = new YolIzi(yol, 0.04);
    const ilkYari = cizgi(yol.slice(0, 5));
    const ikinciYari = cizgi(yol.slice(5));
    for (const n of [...ilkYari.noktalar, ...ikinciYari.noktalar]) iz.isle(n);
    expect(iz.oran()).toBe(1);
    // Geri al: ikinci çizgi gitti
    iz.yenidenHesapla([ilkYari]);
    expect(iz.sayi).toBe(5);
    expect([...iz.dolu]).toEqual([1, 1, 1, 1, 1, 0, 0, 0, 0, 0]);
    // Temizle
    iz.yenidenHesapla([]);
    expect(iz.sayi).toBe(0);
    expect(iz.oran()).toBe(0);
    // Kendiliğinden bitiş (%93) eski sayımla tetiklenemez: tek yeni nokta oranı 0.1 yapar
    iz.isle(yol[9]);
    expect(iz.oran()).toBeLessThan(0.93);
  });

  it('Tamamla ile yüklenen çizgiler yolu boyar; silgi çizgileri sayılmaz', () => {
    const iz = new YolIzi(yol, 0.04);
    iz.yenidenHesapla([cizgi(yol.slice(0, 3)), cizgi(yol.slice(3, 6), true)]);
    expect([...iz.dolu]).toEqual([1, 1, 1, 0, 0, 0, 0, 0, 0, 0]);
  });
});

describe('nokta modu: Tamamla kaldığı yerden', () => {
  it('biten çizgi sayısı kadar şekil ileriden başlar, çizgiler korunur', () => {
    const devam = [cizgi([[0.1, 0.1], [0.2, 0.2]]), cizgi([[0.3, 0.3], [0.4, 0.4]])];
    const { s, bitenler } = devamBasi(4, devam);
    expect(s).toBe(2);
    expect(bitenler.map((c) => c.noktalar)).toEqual(devam.map((c) => c.noktalar));
    // kopyadır: oyun bitenlere ekledikçe sonuç ekranının çizgileri değişmez
    bitenler[0].noktalar.push([0.9, 0.9]);
    expect(devam[0].noktalar).toHaveLength(2);
  });

  it('devam yoksa baştan; şekil sayısından fazla çizgi gelirse taşmaz', () => {
    expect(devamBasi(3, undefined)).toEqual({ s: 0, bitenler: [] });
    const cok = Array.from({ length: 5 }, () => cizgi([[0.5, 0.5]]));
    expect(devamBasi(3, cok).s).toBe(3);
  });
});

describe('kart penceresi ipucu', () => {
  it('Android uygulamasında basılı tutup kaydetme sözü yok (orada çalışmaz)', () => {
    expect(kartKayitIpucu('android')).not.toMatch(/basılı/i);
    expect(kartKayitIpucu('android')).toMatch(/ekran görüntüsü/i);
    expect(kartKayitIpucu('ios')).toMatch(/basılı tutup kaydedebilirsin/i);
    expect(kartKayitIpucu(null)).toMatch(/basılı tutup kaydedebilirsin/i);
  });
});

describe('iOS Fotoğraflar izni', () => {
  it('Info.plist ve TR/EN InfoPlist.strings NSPhotoLibraryAddUsageDescription içerir', () => {
    const plist = oku('ios/App/App/Info.plist');
    const m = plist.match(/<key>NSPhotoLibraryAddUsageDescription<\/key>\s*<string>([^<]+)<\/string>/);
    expect(m?.[1]).toMatch(/^Büyükler için:/);
    const tr = oku('ios/App/App/tr.lproj/InfoPlist.strings');
    expect(tr).toContain(`"NSPhotoLibraryAddUsageDescription" = "${m![1]}";`);
    expect(oku('ios/App/App/en.lproj/InfoPlist.strings')).toMatch(/"NSPhotoLibraryAddUsageDescription" = "For grown-ups:/);
  });
});
