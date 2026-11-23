import { test, expect, type Page } from '@playwright/test';

// Ceren Öğretmen dersi 5 · Sayılar 11–20 (matematik/src/ders-onluk.ts): 5+ yaşta, Sayı masasının hatırası alındıktan sonra
// Sayı masasına girerken açılır. Astra'nın M6 çizimleri gelene dek yalnız test kipinde (?test=1&onluk=1).
test.use({ reducedMotion: 'reduce' });
test.describe.configure({ timeout: 120000 });

const KAYIT = 'minkino-matematik-ceren-onluk-v1';
async function ac(p: Page, yas: number, hatira: boolean, kayit?: object, adres = '/matematik/?test=1&onluk=1&hizli=1') {
  const ekran = p.viewportSize();
  if (ekran && ekran.width < 600 && ekran.height > ekran.width) await p.setViewportSize({ width: ekran.height, height: ekran.width });
  await p.addInitScript(([y, h, k, a]) => {
    if (sessionStorage.getItem('kuruldu')) return;
    sessionStorage.setItem('kuruldu', '1');
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: y, ayarlar: { muzik: false } }));
    localStorage.setItem('minkino-matematik-ceren-sayilar-v1', JSON.stringify({ biten: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], simdi: 10, tanitildi: true, bitti: true }));
    const onek = y === 4 ? 'dort-' : '';
    localStorage.setItem('minkino-matematik-1-' + onek + 'sayi', JSON.stringify({ adim: h ? 10 : 2, yer: 0, secimler: [], hatira: h, kuleTamam: true, surum: 2 }));
    if (k) localStorage.setItem(a, JSON.stringify(k));
  }, [yas, hatira, kayit ?? null, KAYIT] as const);
  await p.goto(adres);
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
}
const kayit = (p: Page) => p.evaluate((a) => JSON.parse(localStorage.getItem(a) || 'null'), KAYIT);
const okunan = (p: Page) => p.evaluate(() => window.__onlukSesleri ?? []);
async function diz(p: Page, g: string, adet: number) {
  await expect(p.locator(`.cd-dunya[data-gorev="${g}"][data-adim="diz"]`)).toBeVisible({ timeout: 20000 });
  for (let i = 0; i < adet; i++) await p.locator('.dk-tek:not(.gitti)').first().click();
}
/** Telin sağ ucuna (it) ya da sol ucuna (geri al) dokunur. */
async function tel(p: Page, t: 'ust' | 'alt', sag: boolean) {
  const k = (await p.locator(`.dk-tel[data-tel="${t}"]`).boundingBox())!;
  await p.mouse.click(k.x + k.width * (sag ? 0.97 : 0.02), k.y + k.height / 2);
}

test('5 yaş: onluğu kur, on üç, abaküste on altı (fazlası geri alınır), on yediden yirmiye; hatıra ve kayıt', async ({ page: p }) => {
  await ac(p, 5, true);
  await expect(p.locator('.dk-sira .ds-sira-sekil')).toHaveCount(4);
  await diz(p, 'onluk', 10);
  // On boncuk bir onluk oldu; rakam blokları 1 ve 0.
  await expect(p.locator('.dk-rakamlar[data-sayi="10"]')).toBeVisible({ timeout: 20000 });
  await diz(p, 'on-uc', 3);
  await expect(p.locator('.dk-rakamlar[data-sayi="13"]')).toBeVisible({ timeout: 20000 });
  expect(await okunan(p)).toEqual(expect.arrayContaining(['say_1', 'say_10', 'onluk_oldu', 'on_bir', 'on_iki', 'on_uc', 'on_uc_sonuc']));
  // Abaküs: altta yedi birlik → "fazla"; birini geri al (altı), üstte bir onluk → on altı.
  await expect(p.locator('.cd-dunya[data-gorev="abakus"][data-adim="abakus"]')).toBeVisible({ timeout: 20000 });
  for (let i = 0; i < 7; i++) await tel(p, 'alt', true);
  await expect(p.locator('.dk-tel[data-tel="alt"]')).toHaveAttribute('data-sol', '7');
  await expect.poll(() => okunan(p).then((o) => o.at(-1))).toBe('fazla');
  await tel(p, 'alt', false);
  await expect(p.locator('.dk-tel[data-tel="alt"]')).toHaveAttribute('data-sol', '6');
  await tel(p, 'ust', true);
  await expect(p.locator('.dk-rakamlar[data-sayi="16"]')).toBeVisible({ timeout: 20000 });
  expect(await okunan(p)).toEqual(expect.arrayContaining(['say_6', 'on_alti']));
  // Yirmi: on yediden üç birlik; on birlik ikinci onluk olur.
  await expect(p.locator('.dk-rakamlar[data-sayi="17"]')).toBeVisible({ timeout: 20000 });
  await diz(p, 'yirmi', 3);
  await expect(p.locator('.dk-rakamlar[data-sayi="20"]')).toBeVisible({ timeout: 20000 });
  await expect(p.locator('.dk-onluk')).toHaveCount(2);
  await expect(p.locator('.cd-dunya[data-adim="hatira"]')).toBeVisible({ timeout: 20000 });
  await expect(p.locator('#sahne[data-ekran="menu"]')).toBeVisible({ timeout: 20000 });
  expect(await kayit(p)).toMatchObject({ bitti: true, tanitildi: true });
  expect(await okunan(p)).toEqual(expect.arrayContaining(['on_sekiz', 'on_dokuz', 'yirmi', 'yirmi_sonuc', 'bitis', 'hatira']));
});

test('yarıda kalan ders sıradaki görevden sürer; öğrenilen göreve sıradan dönülür', async ({ page: p }) => {
  await ac(p, 6, true, { biten: ['onluk', 'on-uc'], simdi: 'abakus', tanitildi: true });
  await expect.poll(() => okunan(p).then((o) => o[0])).toBe('devam');
  await expect(p.locator('.cd-dunya[data-gorev="abakus"][data-adim="abakus"]')).toBeVisible({ timeout: 20000 });
  await p.locator('.dk-sira .ds-sira-sekil[data-gorev="onluk"]').click();
  await expect(p.locator('.cd-dunya[data-gorev="onluk"]')).toBeVisible();
});

const ACILMAZ = [
  ['4 yaşta', 4, true, undefined],
  ['Sayı masası bitmeden', 5, false, undefined],
  ['test kipinde onluk parametresi olmadan', 5, true, '/matematik/?test=1'],
  ['çizimler gelmeden uygulamada', 5, true, '/matematik/'],
] as const;
for (const [ad, yas, hatira, adres] of ACILMAZ) {
  test('açılmaz (' + ad + '): Sayı masası kendi oyununu açar', async ({ page: p }) => {
    await ac(p, yas, hatira, undefined, adres);
    await expect(p.locator('.dk-dunya')).toHaveCount(0);
    await expect(p.locator('#sahne')).not.toHaveAttribute('data-ekran', 'menu');
  });
}

// Sayı masasında 5+ yaşın ders sırası: hatıradan sonra önce Toplama ve çıkarma (parça-bütün), o bitince (ya da çizimleri
// yoksa) 11–20 (Antigravity CEVAP-06 B2; yönetici kararı 20 Kasım).
const TOPLAMA_BITTI = { biten: ['fazla', 'doldur', 'eksik', 'on'], simdi: 'on', tanitildi: true, bitti: true };
test('ders sırası: Toplama bitmeden Sayı masası önce Toplama dersini açar', async ({ page: p }) => {
  await ac(p, 5, true, undefined, '/matematik/?test=1&onluk=1&toplama=1&hizli=1');
  await expect(p.locator('.dt-dunya')).toBeVisible();
  await expect(p.locator('.dk-dunya')).toHaveCount(0);
});
test('ders sırası: Toplama bitince Sayı masası 11–20 dersini açar', async ({ page: p }) => {
  await p.addInitScript((k) => { if (!sessionStorage.getItem('kuruldu')) localStorage.setItem('minkino-matematik-ceren-topla-v1', JSON.stringify(k)); }, TOPLAMA_BITTI);
  await ac(p, 5, true, undefined, '/matematik/?test=1&onluk=1&toplama=1&hizli=1');
  await expect(p.locator('.dk-dunya')).toBeVisible();
  await expect(p.locator('.dt-dunya')).toHaveCount(0);
});
test('ders sırası: Toplama dersi yokken hatıradan sonra 11–20 açılır', async ({ page: p }) => {
  await ac(p, 5, true, undefined, '/matematik/?test=1&onluk=1&hizli=1');
  await expect(p.locator('.dk-dunya')).toBeVisible();
});
