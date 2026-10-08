/**
 * Google Play Aileler politikası / Teacher Approved bekçileri (kaynak taraması + saf mantık):
 * - Satın alma ekranı (abonelikEkrani) yalnız ebeveyn kapısının arkasından açılır; kilitli içerik önce çocuğa kilit anı.
 * - Dış bağlantılar (http, mailto, mağaza) yalnız kapının arkasındaki ekranlarda (abonelik ekranı, Ebeveyn Köşesi).
 * - Reklam / analitik SDK'sı yok; tek satın alma SDK'sı RevenueCat; ses kaydı yok.
 * - Kilit anının cümlesi kısa, seslendirme listesinde; art arda dokunuşta tekrarlanmaz.
 */
import { describe, expect, it } from 'vitest';
import paket from '../../package.json';
import metinler from '../../content/metinler.json';
import { tumCumleler } from '../../src/audio/cumleler';
import { KILIT_SES_ARALIGI, kilitSesiSoylensinMi } from '../../src/abonelik/kilit-ani';

/** Uygulamaya giren kaynaklar (orman, ses-testi, sunucu uygulama derlemesinde yok) */
const KAYNAK = import.meta.glob<string>(
  ['../../{src,uygulama,kartlar,pazar,canlan,macera,film,pasta,dedektif}/**/*.ts', '!../../**/*.d.ts'],
  { eager: true, query: '?raw', import: 'default' },
);
const dosyalar = Object.entries(KAYNAK).map(([yol, metin]) => ({ yol: yol.replace('../../', ''), metin }));
const dosya = (yol: string) => dosyalar.find((d) => d.yol === yol)!.metin;

describe('satın alma ekranı ebeveyn kapısının arkasında', () => {
  it('abonelikEkrani yalnız kapı geçildikten sonra çağrılır (kilitliIcerik, Ebeveyn Köşesi, Kartlar ebeveyn ekranı)', () => {
    const cagiranlar = dosyalar.filter((d) => /abonelikEkrani\(/.test(d.metin.replace('export function abonelikEkrani(', ''))).map((d) => d.yol);
    expect(cagiranlar.sort()).toEqual(['src/abonelik/ekran.ts', 'src/screens/ebeveyn.ts', 'uygulama/src/ekranlar.ts']);
    // kilitliIcerik: önce kilit anı, sonra kapı, en son abonelik
    const ekran = dosya('src/abonelik/ekran.ts');
    const govde = ekran.slice(ekran.indexOf('export async function kilitliIcerik'), ekran.indexOf('export function abonelikEkrani'));
    const [ani, kapi, abone] = ['kilitAniAc(', 'ebeveynKapisiAc(', 'abonelikEkrani('].map((s) => govde.indexOf(s));
    expect(ani).toBeGreaterThan(0);
    expect(kapi).toBeGreaterThan(ani);
    expect(abone).toBeGreaterThan(kapi);
    // Ebeveyn Köşesi (abonelik düğmesi) menüden yalnız kapıyla açılır
    const menu = dosya('uygulama/src/ekranlar.ts');
    expect(menu).toMatch(/if \(await ebeveynKapisiAc\(app\.kok\)\) app\.git\('ayarlar'\)/);
  });

  it('kilitli içeriğe giden yollar kilitliIcerik / erisimVarMi üzerinden', () => {
    const cagiranlar = dosyalar.filter((d) => /kilitliIcerik\(/.test(d.metin) && d.yol !== 'src/abonelik/ekran.ts').map((d) => d.yol);
    expect(cagiranlar.sort()).toEqual(['src/abonelik/kilit.ts', 'uygulama/src/ekranlar.ts']);
  });
});

describe('dış bağlantılar ebeveyn kapısının arkasında', () => {
  it('http(s), mailto ve mağaza bağlantıları yalnız abonelik ekranı ve Ebeveyn Köşesi kodunda', () => {
    const baglantili = dosyalar
      .filter((d) => d.yol !== 'src/kabuk/ayar.ts')
      .filter((d) => /href:\s*[`'"](https?:|mailto:)|GIZLILIK_ADRESI|SARTLAR_ADRESI|ABONELIK_YONETIM|ILETISIM_EPOSTA|window\.open\(/.test(d.metin))
      .map((d) => d.yol);
    expect(baglantili.sort()).toEqual(['src/abonelik/ekran.ts', 'uygulama/src/ekranlar.ts']);
    // ana menünün kendisinde dış bağlantı yok (hepsi ayarlarEkrani = Ebeveyn Köşesi içinde)
    const menu = dosya('uygulama/src/ekranlar.ts');
    const menuGovde = menu.slice(menu.indexOf('export function menuEkrani'), menu.indexOf('export function ayarlarEkrani'));
    expect(menuGovde).not.toMatch(/GIZLILIK_ADRESI|SARTLAR_ADRESI|ABONELIK_YONETIM|ILETISIM_EPOSTA|mailto:|https?:\/\//);
  });
});

describe('paylaşım (sistem paylaşım penceresi) ebeveyn kapısının arkasında', () => {
  it('navigator.share yalnız kartPaylas içinde; kartPaylas yalnız kapı geçildikten sonra çağrılır', () => {
    const paylasan = dosyalar.filter((d) => /\.share\(|\.canShare\b/.test(d.metin)).map((d) => d.yol);
    expect(paylasan).toEqual(['canlan/src/kart.ts']);
    const cagiranlar = dosyalar.filter((d) => /kartPaylas\(/.test(d.metin.replace('export async function kartPaylas(', ''))).map((d) => d.yol);
    expect(cagiranlar).toEqual(['canlan/src/ekranlar.ts']);
    // Kartım düğmesi: önce ebeveyn kapısı, sonra paylaşım
    const ekran = dosya('canlan/src/ekranlar.ts');
    const govde = ekran.slice(ekran.indexOf("yuvarlakDugme(IKON.paylas, 'Kartım'"), ekran.indexOf("}, 'kucuk cc-kart')"));
    const [kapi, paylas] = ['if (!(await ebeveynKapisiAc(app.kok))) return;', 'kartPaylas('].map((s) => govde.indexOf(s));
    expect(kapi).toBeGreaterThan(0);
    expect(paylas).toBeGreaterThan(kapi);
  });
});

describe('reklam, analitik, üçüncü taraf SDK yok', () => {
  it('bağımlılıklarda yalnız Capacitor, yazı tipi ve RevenueCat', () => {
    const adlar = Object.keys(paket.dependencies);
    for (const ad of adlar) expect(ad, ad).toMatch(/^(@capacitor\/|@fontsource\/|@revenuecat\/purchases-capacitor$)/);
    const yasak = /admob|google-ads|analytics|firebase|sentry|amplitude|mixpanel|segment|appsflyer|adjust|facebook|crashlytics|onesignal/i;
    for (const ad of [...adlar, ...Object.keys(paket.devDependencies)]) expect(ad, ad).not.toMatch(yasak);
  });

  it('kaynakta ses kaydı (MediaRecorder) ve veri gönderme (sendBeacon) yok', () => {
    for (const d of dosyalar) expect(d.metin, d.yol).not.toMatch(/new MediaRecorder|navigator\.sendBeacon/);
  });
});

describe('kilit anı (çocuğa "Bunu anne-babanla açabilirsin")', () => {
  it('cümle kısa ve seslendirme listesinde (CI seslendirir)', () => {
    const c = metinler.kilit_cocuk;
    expect(c).toBe('Bunu anne-babanla açabilirsin.');
    expect(c.length).toBeLessThanOrEqual(30);
    expect(tumCumleler()).toContain(c);
  });

  it('art arda dokunuşta cümle tekrarlanmaz (ısrar yok)', () => {
    expect(kilitSesiSoylensinMi(1000, Number.NEGATIVE_INFINITY)).toBe(true);
    expect(kilitSesiSoylensinMi(5000, 1000)).toBe(false);
    expect(kilitSesiSoylensinMi(1000 + KILIT_SES_ARALIGI, 1000)).toBe(true);
  });

  it('kilit anında geri sayım, satın alma, fiyat sözü yok', () => {
    // yorumlar ve import satırları hariç (./abonelik.css stil dosyası)
    const kod = dosya('src/abonelik/kilit-ani.ts').replace(/\/\*[\s\S]*?\*\/|\/\/.*$|^import .*$/gm, '');
    expect(kod).not.toMatch(/setInterval|abone|premium|satın|fiyat|ücretsiz|deneme/i);
  });
});
