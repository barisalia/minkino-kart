import { expect, test, type Page } from '@playwright/test';

// Mağaza öncesi denetim (uygulama derlemesinde de koşar): her oyunun açılışı ve oyun içi ekranları
// - eksik dosya (4xx/5xx, yüklenemeyen istek) yok, konsol hatası yok
// - dış sunucuya istek yok (uygulama çevrimdışı çalışmalı; RevenueCat yalnız gerçek cihazda)
// - sayfa yana taşmıyor
// - "Minkino'ya dön" ana menüye döner; menüden açılan oyundan dönünce geçmiş uzamaz (Android geri tuşu menüde
//   uygulamadan çıkar, oyuna geri dönmez)

const SAYFALAR: [string, string][] = [
  ['menu', './?test=1'],
  ['kartlar', './kartlar/?test=1'],
  ['kartlar-oyun', './kartlar/?test=1&ekran=oyun&yas=4&tema=hayvanlar'],
  ['pazar', './pazar/?test=1'],
  ['pazar-oyun', './pazar/?test=1&yas=5&ekran=pazar'],
  ['canlan', './canlan/?test=1'],
  ['macera', './macera/?test=1&yas=5'],
  ['macera-ege', './macera/?test=1&ekran=bolum&yas=5&bolum=ege'],
  ['macera-banyo', './macera/?test=1&ekran=bolum&yas=5&bolum=banyo'],
  ['macera-elektrik', './macera/?test=1&ekran=bolum&yas=5&bolum=elektrik'],
  ['macera-salincak', './macera/?test=1&ekran=bolum&yas=5&bolum=salincak'],
  ['film', './film/?test=1'],
];

function izle(page: Page) {
  const sorunlar: string[] = [];
  const dis: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') sorunlar.push(`konsol: ${m.text()}`);
  });
  page.on('pageerror', (e) => sorunlar.push(`hata: ${String(e)}`));
  page.on('request', (r) => {
    const u = new URL(r.url());
    if (u.protocol.startsWith('http') && u.hostname !== 'localhost' && u.hostname !== '127.0.0.1') dis.push(r.url());
  });
  page.on('response', (r) => {
    if (r.status() >= 400) sorunlar.push(`${r.status()}: ${r.url()}`);
  });
  page.on('requestfailed', (r) => {
    // sayfa değişirken yarıda kalan istekler sayılmaz
    if (!/ERR_ABORTED/.test(r.failure()?.errorText ?? '')) sorunlar.push(`istek: ${r.url()} ${r.failure()?.errorText}`);
  });
  return { sorunlar, dis };
}

for (const [ad, adres] of SAYFALAR) {
  test(`QA ${ad}: dosyalar yerelde, eksik yok, yana taşmıyor`, async ({ page }, info) => {
    const { sorunlar, dis } = izle(page);
    await page.goto(adres);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => undefined))));
    await page.screenshot({ path: `tests/screens/qa-${ad}-${info.project.name}.png` });
    const tasma = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(tasma, 'sayfa yana taşıyor').toBeLessThanOrEqual(1);
    const bozukResim = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute('src')).map((i) => i.src));
    expect(bozukResim).toEqual([]);
    expect(dis).toEqual([]);
    expect(sorunlar).toEqual([]);
  });
}

test('QA: menüden açılan oyundan "Minkino’ya dön" menüye döner, geçmiş uzamaz', async ({ page }) => {
  const { sorunlar, dis } = izle(page);
  await page.goto('./?test=1');
  for (const oyun of ['kartlar', 'pazar', 'canlan', 'macera', 'film']) {
    await page.locator(`.ug-kart[data-oyun="${oyun}"]`).click();
    await page.waitForURL(new RegExp(`/${oyun}/`));
    const geri = page.locator('button.yuvarlak[aria-label="Minkino’ya dön"], .fl-k-dugmeler button.yuvarlak[aria-label="Geri"]').first();
    await expect(geri).toBeVisible({ timeout: 15000 });
    await geri.click();
    await page.waitForURL((u) => new URL(u).pathname.replace(/index\.html$/, '') === '/');
    await expect(page.locator('.ug-kart').first()).toBeVisible();
    // menü kartları yeniden çalışır (önbellekten dönse bile)
    await expect(page.locator(`.ug-kart.secildi`)).toHaveCount(0);
  }
  // geri tuşu menüden oyuna dönmez
  await page.goBack().catch(() => null);
  expect(page.url()).not.toMatch(/\/(kartlar|pazar|canlan|macera|film)\//);
  expect(dis).toEqual([]);
  expect(sorunlar).toEqual([]);
});
