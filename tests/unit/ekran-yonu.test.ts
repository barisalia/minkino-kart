/**
 * Ekran yönü (uygulama): telefonda (kısa kenar < 600 dp) geniş sahneli oyunlar yatay kilitli (iki yatay yön), menü /
 * Kartlar / Çiz Canlansın cihazı izler; tablet her yerde serbest, yalnız film oynarken yatay.
 * Kilit çalışma anında (src/kabuk/yon-yonetici.ts → @capacitor/screen-orientation); yerel taraf yatay kilidi iki yönlü
 * yapar (Android MainActivity, iOS MinkinoBridgeViewController), uygulamanın tamamını zorlamaz.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { sayfaYonu, TELEFON_KISA_KENAR, telefonMu, YATAY_SAYFALAR, yonKarari } from '../../src/kabuk/yon';
import { yonYoneticisi, type YonEklentisi } from '../../src/kabuk/yon-yonetici';

const oku = (yol: string) => readFileSync(resolve(__dirname, '../..', yol), 'utf8');

describe('telefon mu', () => {
  it('kısa kenar 600 dp altı telefon, yön fark etmez', () => {
    for (const [en, boy] of [[390, 844], [844, 390], [430, 932], [375, 667], [428, 926], [412, 915], [360, 780]]) expect(telefonMu(en, boy), `${en}×${boy}`).toBe(true);
    for (const [en, boy] of [[768, 1024], [1024, 768], [744, 1133], [820, 1180], [834, 1194], [600, 960], [1280, 800]]) expect(telefonMu(en, boy), `${en}×${boy}`).toBe(false);
    expect(TELEFON_KISA_KENAR).toBe(600);
  });
});

describe('sayfa yönü (telefonda)', () => {
  it('geniş sahneli oyunlar yatay', () => {
    expect([...YATAY_SAYFALAR].sort()).toEqual(['dedektif', 'film', 'giysin', 'macera', 'pasta', 'pazar']);
    for (const y of ['/pasta/index.html', '/pazar/', '/macera/index.html', '/dedektif/index.html', '/film/', '/giysin/index.html']) expect(sayfaYonu(y), y).toBe('yatay');
  });
  it('menü, Kartlar, Canlan cihazı izler', () => {
    for (const y of ['/', '/index.html', '/kartlar/index.html', '/canlan/index.html', '/gizlilik/']) expect(sayfaYonu(y), y).toBe('serbest');
  });
});

describe('yön kararı', () => {
  it('telefonda sayfa karar verir, sayfa içi istek yok sayılır', () => {
    expect(yonKarari({ telefon: true, sayfa: 'yatay' })).toBe('kilitle');
    expect(yonKarari({ telefon: true, sayfa: 'yatay', istek: 'serbest' })).toBe('kilitle');
    expect(yonKarari({ telefon: true, sayfa: 'serbest' })).toBe('birak');
    expect(yonKarari({ telefon: true, sayfa: 'serbest', istek: 'yatay' })).toBe('birak');
  });
  it('tablette her sayfa serbest; film oynarken yatay, çıkınca serbest', () => {
    expect(yonKarari({ telefon: false, sayfa: 'yatay' })).toBe('birak');
    expect(yonKarari({ telefon: false, sayfa: 'serbest' })).toBe('birak');
    expect(yonKarari({ telefon: false, sayfa: 'yatay', istek: 'yatay' })).toBe('kilitle');
    expect(yonKarari({ telefon: false, sayfa: 'yatay', istek: 'serbest' })).toBe('birak');
  });
});

/** Sahte eklenti + ekran: çağrılar kaydedilir, görünüm yönü elle değiştirilir */
function sahte(o: { en: number; boy: number; tip?: string; bozuk?: boolean }) {
  const cagri: string[] = [];
  let yatay = o.en > o.boy;
  const dinleyenler = new Set<() => void>();
  const eklenti: YonEklentisi = {
    orientation: async () => {
      if (o.bozuk) throw new Error('yok');
      return { type: o.tip ?? (yatay ? 'landscape-primary' : 'portrait-primary') };
    },
    lock: async ({ orientation }) => {
      if (o.bozuk) throw new Error('yok');
      cagri.push(`kilit:${orientation}`);
    },
    unlock: async () => {
      if (o.bozuk) throw new Error('yok');
      cagri.push('birak');
    },
  };
  const y = yonYoneticisi({
    eklenti,
    ekran: () => ({ width: o.en, height: o.boy }),
    yatayMi: () => yatay,
    yonDegisince: (fn) => {
      dinleyenler.add(fn);
      return () => dinleyenler.delete(fn);
    },
    bekleMs: 200,
  });
  const dondur = (yeni: boolean) => {
    yatay = yeni;
    for (const f of [...dinleyenler]) f();
  };
  return { y, cagri, dondur, dinleyenSayisi: () => dinleyenler.size };
}

describe('yön yöneticisi', () => {
  it('telefon: yatay oyun açılınca yatay kilit (dikeyde düz yatay), menüde bırakır', async () => {
    const s = sahte({ en: 390, boy: 844 });
    await s.y.sayfaAcildi('/pasta/index.html');
    await s.y.sayfaAcildi('/index.html');
    await s.y.sayfaAcildi('/kartlar/index.html');
    expect(s.cagri).toEqual(['kilit:landscape', 'birak', 'birak']);
  });
  it('telefon ters yatayda tutuluyorsa o yön istenir (ekran baş aşağı dönmez)', async () => {
    const s = sahte({ en: 844, boy: 390, tip: 'landscape-secondary' });
    await s.y.sayfaAcildi('/macera/index.html');
    expect(s.cagri).toEqual(['kilit:landscape-secondary']);
  });
  it('telefon: film sayfası hep yatay, oynatıcının istekleri yok sayılır', async () => {
    const s = sahte({ en: 844, boy: 390 });
    await s.y.istek('/film/index.html', 'yatay');
    await s.y.istek('/film/index.html', 'serbest');
    expect(s.cagri).toEqual(['kilit:landscape-primary', 'kilit:landscape-primary']);
  });
  it('tablet: sayfalar serbest; film oynarken yatay, kapanınca serbest', async () => {
    const s = sahte({ en: 1024, boy: 768 });
    await s.y.sayfaAcildi('/pasta/index.html');
    await s.y.istek('/film/index.html', 'yatay');
    await s.y.istek('/film/index.html', 'serbest');
    await s.y.gitmedenOnce('/dedektif/index.html');
    expect(s.cagri).toEqual(['birak', 'kilit:landscape-primary', 'birak', 'birak']);
  });
  it('telefon dikeyken yatay oyuna geçiş: kilit istenir, ekran dönene kadar beklenir', async () => {
    const s = sahte({ en: 390, boy: 844 });
    let bitti = false;
    const is = s.y.gitmedenOnce('/giysin/index.html').then(() => (bitti = true));
    await new Promise((r) => setTimeout(r, 20));
    expect(s.cagri).toEqual(['kilit:landscape']);
    expect(bitti).toBe(false);
    s.dondur(true);
    await is;
    expect(bitti).toBe(true);
    expect(s.dinleyenSayisi()).toBe(0);
  });
  it('ekran dönmezse en çok bekleMs beklenir, oyun yine açılır', async () => {
    const s = sahte({ en: 390, boy: 844 });
    const t0 = Date.now();
    await s.y.gitmedenOnce('/pazar/index.html');
    expect(Date.now() - t0).toBeGreaterThanOrEqual(150);
    expect(s.dinleyenSayisi()).toBe(0);
  });
  it('zaten yatayken ya da serbest sayfaya giderken beklemez', async () => {
    const s = sahte({ en: 844, boy: 390 });
    const t0 = Date.now();
    await s.y.gitmedenOnce('/dedektif/index.html');
    await s.y.gitmedenOnce('/index.html');
    expect(Date.now() - t0).toBeLessThan(100);
    expect(s.cagri).toEqual(['kilit:landscape-primary', 'birak']);
  });
  it('eklenti yoksa (hata) sessizce geçer', async () => {
    const s = sahte({ en: 844, boy: 390, bozuk: true });
    await expect(s.y.sayfaAcildi('/pasta/index.html')).resolves.toBeUndefined();
    await expect(s.y.sayfaAcildi('/index.html')).resolves.toBeUndefined();
  });
});

describe('yerel yön ayarları', () => {
  it('Android: uygulamanın tamamı zorlanmaz; yatay kilit iki yönlü (sensörle)', () => {
    expect(oku('android/app/src/main/AndroidManifest.xml')).not.toContain('screenOrientation');
    const etkinlik = oku('android/app/src/main/java/com/minkino/app/MainActivity.java');
    expect(etkinlik).toMatch(/public void setRequestedOrientation\(int yon\)/);
    expect(etkinlik).toContain('SCREEN_ORIENTATION_REVERSE_LANDSCAPE');
    expect(etkinlik).toContain('yon = ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE');
  });
  it('iOS: iPhone dikey + iki yatay (serbest sayfalar dikey de olur), iPad dört yön; yatay kilit iki yönlü', () => {
    const plist = oku('ios/App/App/Info.plist');
    const dizi = (anahtar: string) => {
      const m = plist.match(new RegExp(`<key>${anahtar.replace('~', '\\~')}</key>\\s*<array>([\\s\\S]*?)</array>`));
      return [...(m?.[1] ?? '').matchAll(/<string>(\w+)<\/string>/g)].map((x) => x[1]).sort();
    };
    expect(dizi('UISupportedInterfaceOrientations')).toEqual(['UIInterfaceOrientationLandscapeLeft', 'UIInterfaceOrientationLandscapeRight', 'UIInterfaceOrientationPortrait']);
    expect(dizi('UISupportedInterfaceOrientations~ipad')).toEqual([
      'UIInterfaceOrientationLandscapeLeft',
      'UIInterfaceOrientationLandscapeRight',
      'UIInterfaceOrientationPortrait',
      'UIInterfaceOrientationPortraitUpsideDown',
    ]);
    const sahne = oku('ios/App/App/SceneDelegate.swift');
    expect(sahne).toContain('rootViewController = MinkinoBridgeViewController()');
    expect(sahne).toMatch(/class MinkinoBridgeViewController: CAPBridgeViewController/);
    expect(sahne).toMatch(/maske == \.landscapeLeft \|\| maske == \.landscapeRight[\s\S]*return \.landscape/);
  });
});
