import { describe, expect, it } from 'vitest';
import { menuOyunlari, yasaGore, INGILIZCE_KARTI, type OyunKarti } from '../../uygulama/src/oyunlar';
import { DENEY_OYUN_KARTI, DERSLER_MENUDE, ESKI_ETKINLIK_KARTLARI, bolumKartlari, bolumSirasi, deneyliKartlar, dersBolumuAcik } from '../../uygulama/src/menu-bolumleri';
import { DENEY_KARTI } from '../../deney/src/bayrak';

const ids = (l: OyunKarti[]) => l.map((k) => k.id);
const hepsi = menuOyunlari(false);
/** İngilizce ve Deney menüye girmiş gibi (bayrakları açılınca) */
const DENEY: OyunKarti = { id: 'deney', ad: 'Deney', adres: './deney/', renk: '#fff', katmanlar: [] };
const genis = [...hepsi, ...(hepsi.some((k) => k.id === 'ingilizce') ? [] : [INGILIZCE_KARTI]), DENEY];

describe('Dersler bölümü bayrağı', () => {
  it('bayrak bugün kapalı (Barış onaylayınca açılır)', () => {
    expect(DERSLER_MENUDE).toBe(false);
  });
  it('gerçek uygulamada yalnız bayrak açık ve simge varken görünür; simge yoksa eski dört bölüm', () => {
    expect(dersBolumuAcik({ bayrak: false, simgeVar: true, testModu: false, istek: null })).toBe(false);
    expect(dersBolumuAcik({ bayrak: true, simgeVar: false, testModu: false, istek: null })).toBe(false);
    expect(dersBolumuAcik({ bayrak: true, simgeVar: true, testModu: false, istek: null })).toBe(true);
    // test dışında ?dersler=1 bir şey açmaz
    expect(dersBolumuAcik({ bayrak: false, simgeVar: true, testModu: false, istek: '1' })).toBe(false);
  });
  it('test kipinde ?dersler=1 açar (simge yoksa yer tutucuyla), ?dersler=0 kapatır', () => {
    expect(dersBolumuAcik({ bayrak: false, simgeVar: false, testModu: true, istek: '1' })).toBe(true);
    expect(dersBolumuAcik({ bayrak: true, simgeVar: true, testModu: true, istek: '0' })).toBe(false);
    expect(dersBolumuAcik({ bayrak: false, simgeVar: false, testModu: true, istek: null })).toBe(false);
  });
});

describe('bölüm sırası', () => {
  it('kapalı: bugünkü dört bölüm', () => {
    expect(bolumSirasi(false)).toEqual(['etkinlik', 'kitap', 'oyun', 'film']);
  });
  it('açık: Dersler ilk sırada, beş bölüm', () => {
    expect(bolumSirasi(true)).toEqual(['ders', 'etkinlik', 'kitap', 'oyun', 'film']);
  });
});

describe('bayrak kapalı: kartlar bugünkü gibi', () => {
  it('Etkinlikler ve Oyunlar eski ayrımla', () => {
    const etk = ESKI_ETKINLIK_KARTLARI;
    expect(ids(bolumKartlari('etkinlik', hepsi, false))).toEqual(ids(hepsi.filter((k) => etk.includes(k.id))));
    expect(ids(bolumKartlari('oyun', hepsi, false))).toEqual(ids(hepsi.filter((k) => ![...etk, 'film', 'kitap'].includes(k.id))));
    expect(bolumKartlari('ders', hepsi, false)).toEqual([]);
  });
});

describe('bayrak açık: Dersler / Etkinlikler / Oyunlar', () => {
  it('Dersler: Türkçe, Matematik (İngilizce ve Deney yalnız menüdeyse), bu sırayla', () => {
    // İngilizce 22 Kasım'dan beri menüde (INGILIZCE_MENUDE); Deney yalnız bayrağı açılınca
    expect(ids(bolumKartlari('ders', hepsi, true))).toEqual(['alfabe', 'matematik', 'ingilizce']);
    expect(ids(bolumKartlari('ders', genis, true))).toEqual(['alfabe', 'matematik', 'ingilizce', 'deney']);
  });
  it('Etkinlikler: Okula Hazırlanalım, Çiz Canlansın, Bil Bakalım, Sesli Maceralar', () => {
    expect(ids(bolumKartlari('etkinlik', genis, true)).sort()).toEqual(['canlan', 'hazirlik', 'kartlar', 'macera']);
  });
  it('Oyunlar: derslerin ve etkinliklerin hiçbiri yok, öbür oyunlar eksiksiz', () => {
    const oyun = ids(bolumKartlari('oyun', genis, true));
    for (const id of ['alfabe', 'matematik', 'ingilizce', 'deney', 'hazirlik', 'canlan', 'kartlar', 'macera', 'kitap', 'film']) expect(oyun).not.toContain(id);
    expect(oyun).toEqual(ids(bolumKartlari('oyun', hepsi, false)));
  });
  it('her oyun kartı tam bir bölümde', () => {
    const say = new Map<string, number>();
    for (const b of ['ders', 'etkinlik', 'oyun'] as const) for (const k of bolumKartlari(b, genis, true)) say.set(k.id, (say.get(k.id) ?? 0) + 1);
    for (const k of genis.filter((k) => k.id !== 'kitap')) expect(say.get(k.id), k.id).toBe(1);
  });
  it('yaş süzgeci Dersler’de de geçerli (süzülen kart Dersler’e girmez)', () => {
    for (const yas of [2, 3, 4, 5, 6] as const) {
      const suzulmus = yasaGore(genis, yas);
      const ders = ids(bolumKartlari('ders', suzulmus, true));
      expect(ders.every((id) => suzulmus.some((k) => k.id === id))).toBe(true);
    }
  });
});

describe('bölüm adlarının kayıtları', () => {
  it('beş bölüm adının da kaydı var (Ceren Öğretmen sesi, public/ses)', async () => {
    const fs = await import('node:fs');
    const m = JSON.parse(fs.readFileSync('public/ses/manifest.json', 'utf8'));
    for (const ad of ['Dersler', 'Etkinlikler', 'Kitaplar', 'Oyunlar', 'Çizgi Filmler']) {
      const f = m.dosyalar[ad];
      expect(f, ad).toBeTruthy();
      expect(fs.statSync('public/ses/' + f).size, ad).toBeGreaterThan(5000);
    }
  });
});

describe('Deneyler kartı (deney/src/bayrak.ts)', () => {
  it('yalnız DENEY_MENUDE açıkken eklenir, İngilizce / Türkçe’nin ardına, bir kez', () => {
    expect(deneyliKartlar(hepsi, false).map((k) => k.id)).toEqual(ids(hepsi));
    const l = deneyliKartlar(hepsi, true);
    expect(l.filter((k) => k.id === 'deney')).toHaveLength(1);
    const once = Math.max(ids(hepsi).indexOf('ingilizce'), ids(hepsi).indexOf('alfabe'));
    expect(l[once + 1].id).toBe('deney');
    expect(deneyliKartlar(l, true)).toHaveLength(l.length);
    expect(DENEY_OYUN_KARTI.id).toBe(DENEY_KARTI.id);
  });
  it('Dersler açıkken Dersler’in sonunda; kapalıyken Etkinlikler’de, Oyunlar’da hiç değil', () => {
    const l = deneyliKartlar(hepsi, true);
    expect(ids(bolumKartlari('ders', l, true)).at(-1)).toBe('deney');
    expect(ids(bolumKartlari('etkinlik', l, false))).toContain('deney');
    expect(ids(bolumKartlari('oyun', l, false))).not.toContain('deney');
    expect(ids(bolumKartlari('oyun', l, true))).not.toContain('deney');
  });
  it('tamamen premium (Barış 23 Kasım: "kilitli bir şekilde açın"): kart ve bütün bölümler abonelikle', async () => {
    const { ERISIM, erisimTuru, kilitliMi } = await import('../../src/engine/erisim');
    for (const id of ['deney', 'deney/parkur', 'deney/bolum-1', 'deney/yeni']) expect(erisimTuru(id), id).toBe('abonelik');
    expect(Object.entries(ERISIM).filter(([k, v]) => (k === 'deney' || k.startsWith('deney/')) && v === 'ucretsiz')).toEqual([]);
    expect(kilitliMi('deney', { etkin: true, premium: false })).toBe(true);
    expect(kilitliMi('deney', { etkin: true, premium: true })).toBe(false);
    expect(kilitliMi('deney', { etkin: false, premium: false })).toBe(false);
  });
  it('giriş tek kapıdan: kilitliyse kilit anı, değilse parkur; parkur kilitten sonra yüklenir', async () => {
    const { readFileSync } = await import('node:fs');
    const giris = readFileSync('deney/src/giris.ts', 'utf8');
    expect(giris).toContain("if (kilitli('deney')) kilitliGiris(); else ac();");
    expect(giris).toContain('kilitliIcerik(katman)');
    expect(giris.slice(giris.indexOf("if (kilitli('deney'))"))).not.toContain('import(');
    expect(readFileSync('deney/index.html', 'utf8')).toContain('src="./src/giris.ts"');
  });
});
