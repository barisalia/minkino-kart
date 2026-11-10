import { expect, test } from '@playwright/test';
import { menuOyunlari } from '../../uygulama/src/oyunlar';
import { hataTopla } from './yardimci';

const KATEGORILER = ['Etkinlikler', 'Kitaplar', 'Oyunlar', 'Çizgi Filmler'];
const oyunlar = menuOyunlari(false).filter(k => !['hazirlik', 'canlan', 'kartlar', 'macera', 'film', 'kitap'].includes(k.id));

test('Ana menü: dört kategori ve gerçek içerik kartları', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./?test=1');
  await expect(page.locator('.ym-ana .ym-kategori')).toHaveCount(4);
  for (const ad of KATEGORILER) await expect(page.getByRole('button', { name: ad, exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Oyunlar', exact: true }).click();
  await expect(page.locator('.ym-icerik')).toHaveCount(oyunlar.length);
  expect(await page.locator('.ym-icerik').evaluateAll(l => l.map(k => k.getAttribute('data-oyun')))).toEqual(oyunlar.map(k => k.id));
  await expect(page.locator('.ym-icerik[data-oyun="otobus"]')).toHaveCount(1);
  await expect(page.locator('.ym-icerik[data-oyun="pasta"], .ym-icerik[data-oyun="mino-giysin"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Etkinlikler', exact: true }).click();
  await expect(page.locator('.ym-icerik')).toHaveCount(4);
  await expect(page.locator('.ym-icerik[data-oyun="hazirlik"]')).toBeVisible();
  await expect(page.locator('.ym-icerik[data-oyun="kartlar"]')).toBeVisible();
  await expect(page.locator('.ym-icerik[data-oyun="canlan"]')).toBeVisible();
  await expect.poll(() => page.locator('.ym-ekran img').evaluateAll(imgs => imgs.filter(i => !(i as HTMLImageElement).complete || !(i as HTMLImageElement).naturalWidth).map(i => (i as HTMLImageElement).src))).toEqual([]);
  expect(hatalar).toEqual([]);
});

test('Kartlar: menü yaşıyla açılır; oyunda yaş değiştirilince menü de güncellenir', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./?test=1');
  await page.getByRole('button', { name: 'Yaş aralığını seç' }).click();
  await expect(page.getByRole('dialog', { name: 'Kaç yaşındasın?' }).locator('.ym-yas-kart')).toHaveCount(4);
  await page.getByRole('button', { name: '5 yaş', exact: true }).click();
  await page.getByRole('button', { name: 'Etkinlikler', exact: true }).click();
  await page.locator('.ym-icerik[data-oyun="kartlar"]').click();
  await page.waitForURL(/\/kartlar\/$/);
  // Açılış düğmesi gerçek hızda sürekli seker; görünen düğmeye doğrudan dokunulur.
  await page.getByRole('button', { name: 'Oyna', exact: true }).click({ force: true });
  await expect(page.locator('.temalar')).toBeVisible();
  await expect(page.locator('.yas')).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('minkino-kartlar-v1')!).yas)).toBe(5);
  // Gerçek ortak yaş ekranı üzerinden değişiklik, menüde eski etiketi geri getirmemeli.
  await page.goto('./kartlar/?test=1&yas=5&ekran=yas');
  await page.locator('.yas-kart[data-yas="3"]').click();
  await expect(page.locator('.temalar')).toBeVisible();
  await page.goto('./?test=1');
  await expect(page.getByRole('button', { name: 'Yaş aralığını seç' })).toHaveText('3');
  await expect(page.getByRole('button', { name: 'Etkinlikler', exact: true })).toHaveAttribute('aria-pressed', 'true');
  expect(hatalar).toEqual([]);
});

for (const yas of [3, 4, 5, 6]) {
  test(`Yaş ${yas}: menü seçimi Pazar'da gerçek oyun ayarıdır`, async ({ page }) => {
    await page.goto('./?test=1');
    await page.getByRole('button', { name: 'Yaş aralığını seç' }).click();
    await page.getByRole('button', { name: `${yas} yaş`, exact: true }).click();
    await page.getByRole('button', { name: 'Oyunlar', exact: true }).click();
    await page.locator('.ym-icerik[data-oyun="pazar"]').click();
    await page.waitForURL(/\/pazar\/$/);
    await expect(page.getByRole('button', { name: 'Yaşı değiştir' })).toContainText(String(yas));
    // Test yalnız ekranı kısaltır, URL'de yaş verilmez: oynanan sahne menüden gelen yaşı kullanır.
    await page.goto('./pazar/?test=1&ekran=pazar');
    await expect(page.locator('.pz-pazar')).toHaveAttribute('data-yas', String(yas));
  });
}

for (const [yas, mod] of [[3, 'kucuk'], [6, 'buyuk']] as const) {
  test(`Otobüs: ${yas} yaş, Dondurma aşamasında ${mod} modunu açar`, async ({ page }) => {
    const hatalar = hataTopla(page);
    await page.goto('./?test=1');
    await page.getByRole('button', { name: 'Yaş aralığını seç' }).click();
    await page.getByRole('button', { name: `${yas} yaş`, exact: true }).click();
    await page.getByRole('button', { name: 'Oyunlar', exact: true }).click();
    await page.locator('.ym-icerik[data-oyun="otobus"]').click();
    await page.waitForURL(/\/otobus\/$/);
    await page.getByRole('button', { name: '1. aşama: Dondurma' }).click();
    await page.waitForURL(/\/kino-otobus\/$/);
    await expect(page.locator('.ko-yas-perde')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Yaş', exact: true })).toContainText(mod === 'kucuk' ? '3' : '5');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('minkino-kino-otobus-v1')!).yas)).toBe(mod);
    await page.getByRole('button', { name: 'Minkino’ya dön', exact: true }).click();
    await page.waitForURL(/\/otobus\/$/);
    await page.getByRole('button', { name: 'Ana menü', exact: true }).click();
    await expect(page.locator('.ym-panel')).toBeVisible();
    expect(hatalar).toEqual([]);
  });
}

test('Eski yaş etiketinden geçiş albümü ve yıldızları korur', async ({ page }) => {
  await page.goto('./?test=1');
  await page.evaluate(() => {
    localStorage.setItem('minkino-menu-yas', '6–7 yaş');
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ album: ['elma'], toplamYildiz: 7, yas: null }));
  });
  await page.reload();
  await expect(page.getByRole('button', { name: 'Yaş aralığını seç' })).toHaveText('6');
  const kayit = await page.evaluate(() => JSON.parse(localStorage.getItem('minkino-kartlar-v1')!));
  expect(kayit).toMatchObject({ yas: 6, album: ['elma'], toplamYildiz: 7 });
  await page.reload();
  await expect(page.getByRole('button', { name: 'Yaş aralığını seç' })).toHaveText('6');
});

test('Ebeveyn kapısı: iptal ayarları açmaz, doğru cevap açar', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./?test=1');
  const kapi = page.getByRole('button', { name: 'Ebeveyn ayarları' });
  await kapi.click();
  await expect(page.locator('.kapi-soru')).toHaveText(/ artı .* kaç eder\?$/);
  await page.locator('.ebeveyn-kapisi').getByRole('button', { name: 'Kapat' }).click();
  await expect(page.locator('.ug-ayarlar')).toHaveCount(0);
  await kapi.click();
  const toplam = (await page.locator('.kapi-soru').getAttribute('data-toplam'))!;
  for (const r of toplam) await page.locator('.ebeveyn-kapisi .tus', { hasText: new RegExp(`^${r}$`) }).click();
  await page.getByRole('button', { name: 'tamam', exact: true }).click();
  await expect(page.locator('.ug-ayarlar')).toBeVisible();
  await page.getByRole('button', { name: 'Ana menü', exact: true }).click();
  await expect(page.locator('.ym-ana')).toBeVisible();
  expect(hatalar).toEqual([]);
});

test('Eski menü ve Kartlar adresleri doğru sayfaya yönlenir', async ({ page }) => {
  await page.goto('./uygulama/?test=1');
  await page.waitForURL(u => u.pathname === '/' && u.search === '?test=1');
  await expect(page.locator('.ym-ekran')).toBeVisible();
  await page.goto('./?test=1&yas=5&ekran=temalar');
  await page.waitForURL(/\/kartlar\/\?test=1&yas=5&ekran=temalar$/);
  await expect(page.locator('.hafiza-serit')).toBeVisible();
});
