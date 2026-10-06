/**
 * Ekran yönü: telefon (kısa kenar < 600 dp) uygulamada baştan sona yatay (iki yatay yön, sensörle); tablet serbest.
 * Kilit yerel tarafta: AndroidManifest sensorLandscape + MainActivity (tablette bırakır), iOS Info.plist (iPhone yalnız
 * yatay, iPad hepsi). JS (src/kabuk/yerel.ts) telefonda yöne dokunmaz; tablette film yatay kilitler, çıkınca bırakır.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { TELEFON_KISA_KENAR, telefonMu, yonKarari } from '../../src/kabuk/yon';

const oku = (yol: string) => readFileSync(resolve(__dirname, '../..', yol), 'utf8');

describe('telefon mu', () => {
  it('kısa kenar 600 dp altı telefon, yön fark etmez', () => {
    for (const [en, boy] of [[390, 844], [844, 390], [430, 932], [375, 667], [428, 926], [412, 915], [360, 780]]) expect(telefonMu(en, boy), `${en}×${boy}`).toBe(true);
    for (const [en, boy] of [[768, 1024], [1024, 768], [820, 1180], [834, 1194], [600, 960], [1280, 800]]) expect(telefonMu(en, boy), `${en}×${boy}`).toBe(false);
    expect(TELEFON_KISA_KENAR).toBe(600);
  });
});

describe('yön kararı', () => {
  it('telefonda yön hiç değişmez (yatay kilit yerel tarafta)', () => {
    expect(yonKarari('yatay', true)).toBe('yok');
    expect(yonKarari('serbest', true)).toBe('yok');
  });
  it('tablette film yatay kilitler, çıkınca bırakır', () => {
    expect(yonKarari('yatay', false)).toBe('kilitle');
    expect(yonKarari('serbest', false)).toBe('birak');
  });
});

describe('yerel yön ayarları', () => {
  it('Android: etkinlik sensorLandscape açılır (ilk karede dikey yok), MainActivity tablette bırakır', () => {
    const manifest = oku('android/app/src/main/AndroidManifest.xml');
    expect(manifest).toMatch(/android:name="\.MainActivity"[\s\S]*?android:screenOrientation="sensorLandscape"|android:screenOrientation="sensorLandscape"[\s\S]*?android:name="\.MainActivity"/);
    const etkinlik = oku('android/app/src/main/java/com/minkino/app/MainActivity.java');
    expect(etkinlik).toContain('smallestScreenWidthDp < 600');
    expect(etkinlik).toContain('SCREEN_ORIENTATION_SENSOR_LANDSCAPE');
    expect(etkinlik).toContain('SCREEN_ORIENTATION_UNSPECIFIED');
    // yön super.onCreate'ten önce ayarlanır
    expect(etkinlik.indexOf('yonuAyarla()')).toBeLessThan(etkinlik.indexOf('super.onCreate'));
  });
  it('iOS: iPhone yalnız iki yatay yön, iPad dört yön', () => {
    const plist = oku('ios/App/App/Info.plist');
    const dizi = (anahtar: string) => {
      const m = plist.match(new RegExp(`<key>${anahtar}</key>\\s*<array>([\\s\\S]*?)</array>`));
      return [...(m?.[1] ?? '').matchAll(/<string>(\w+)<\/string>/g)].map((x) => x[1]).sort();
    };
    expect(dizi('UISupportedInterfaceOrientations')).toEqual(['UIInterfaceOrientationLandscapeLeft', 'UIInterfaceOrientationLandscapeRight']);
    expect(dizi('UISupportedInterfaceOrientations~ipad')).toEqual([
      'UIInterfaceOrientationLandscapeLeft',
      'UIInterfaceOrientationLandscapeRight',
      'UIInterfaceOrientationPortrait',
      'UIInterfaceOrientationPortraitUpsideDown',
    ]);
  });
});
