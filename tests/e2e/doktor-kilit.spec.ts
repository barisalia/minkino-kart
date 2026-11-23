/**
 * Minik Doktor menüde, tamamen premium (Barış, 23 Kasım 2026: "evet açılsın ama tamamen kilitli premium şekilde").
 * Mağaza uygulaması taklidiyle (?test=1&uygulama=android; satın alma sahte sağlayıcıyla: src/abonelik/sahte.ts):
 * - abonesi olmayan: menü kartında kilit rozeti; karta dokununca oyuna gidilmez, öbür kilitli oyunlardaki aynı kilit anı
 *   ("Büyükler için" düğmesiyle); sayfaya doğrudan gelinse de hiçbir vaka açılmaz.
 * - abone: rozet yok, kart bekleme odasını açar; odada yalnız çizimi tamam olan vaka sırada.
 * - web sitesinde (uygulama değil) kilit yok.
 */
import { expect, test, type Page } from '@playwright/test';

const ABONELIK_ANAHTARI = 'minkino-abonelik-v1';
const kart = (page: Page) => page.locator('.ym-icerik[data-oyun="doktor"]');

/** Ana menüde Oyunlar bölümünü açar */
async function oyunlaraGit(page: Page, sorgu: string) {
  await page.goto('./?test=1' + sorgu);
  await page.locator('.ym-ana .ym-kategori[aria-label="Oyunlar"]').click();
  await expect(page.locator('.ym-panel[aria-label="Oyunlar"]')).toBeVisible();
}

test('Doktor kilidi · abonesi olmayan: menü kartı kilit rozetli; dokununca oyun açılmaz, kilit anı ve "Büyükler için"', async ({ page }) => {
  const hatalar: string[] = [];
  page.on('pageerror', e => hatalar.push(e.message));
  await oyunlaraGit(page, '&uygulama=android');
  const k = kart(page);
  await expect(k).toBeVisible();
  await expect(k).toHaveAttribute('aria-label', 'Minik Doktor');
  await expect(k).toHaveAttribute('data-kilitli', '');
  // rozet kartın içinde durur (kutusu kartın kutusundan taşmaz)
  const rozet = page.locator('.ym-icerik-kap', { has: k }).locator('.mk-kilit');
  await expect(rozet).toBeVisible();
  const kb = (await k.boundingBox())!, rb = (await rozet.boundingBox())!;
  expect(rb.x).toBeGreaterThanOrEqual(kb.x - 1); expect(rb.y).toBeGreaterThanOrEqual(kb.y - 1);
  expect(rb.x + rb.width).toBeLessThanOrEqual(kb.x + kb.width + 1); expect(rb.y + rb.height).toBeLessThanOrEqual(kb.y + kb.height + 1);
  // öbür kilitli oyunla aynı düzen: Pazar da rozetli (yaş seçilmediyse menüde)
  await expect(page.locator('.ym-icerik[data-oyun="pazar"]')).toHaveAttribute('data-kilitli', '');
  // karta dokununca oyuna gidilmez: çocuğa kilit anı; abonelik ekranı ve ebeveyn kapısı kendiliğinden açılmaz
  await k.click({ position: { x: 14, y: 14 } });      // kartın köşesi: dar ekranda ortasını dinleme düğmesi örter
  await expect(page.locator('.kl-perde .kl-baslik')).toHaveText('Bunu anne-babanla açabilirsin');
  await expect(page.locator('.kl-perde').getByRole('button', { name: 'Büyükler için' })).toBeVisible();
  await expect(page.locator('.ab-perde')).toHaveCount(0);
  await expect(page.locator('.ebeveyn-kapisi')).toHaveCount(0);
  expect(page.url()).not.toContain('/doktor/');
  // "Büyükler için" → ebeveyn kapısı (satın alma çocuğa doğrudan gösterilmez)
  await page.locator('.kl-perde').getByRole('button', { name: 'Büyükler için' }).click();
  await expect(page.locator('.ebeveyn-kapisi .kapi-soru')).toBeVisible();
  expect(page.url()).not.toContain('/doktor/');
  expect(hatalar).toEqual([]);
});

for (const yol of ['', 'oyun=klinik&', 'oyun=vaka&', 'oyun=disler&', 'oyun=ates&']) {
  test(`Doktor kilidi · abonesi olmayan: sayfaya doğrudan gelince de açılmaz (${yol || 'parametresiz'})`, async ({ page }) => {
    const hatalar: string[] = [];
    page.on('pageerror', e => hatalar.push(e.message));
    await page.goto('./doktor/index.html?' + yol + 'test=1&uygulama=android&yas=4');
    const kok = page.locator('#doktor');
    await expect(kok).toHaveAttribute('data-durum', 'kilitli', { timeout: 30_000 });
    await expect(page.locator('.kl-perde .kl-baslik')).toHaveText('Bunu anne-babanla açabilirsin', { timeout: 30_000 });
    await expect(page.locator('.kl-perde').getByRole('button', { name: 'Büyükler için' })).toBeVisible();
    // hiçbir oyun kurulmadı: sahne, çizim ve test kancası yok
    await expect(kok.locator('.vk-sahne')).toHaveCount(0);
    await expect(kok.locator('img')).toHaveCount(0);
    expect(await kok.getAttribute('data-oyun')).toBeNull();
    expect(await page.evaluate(() => ['__vaka', '__klinik', '__disler'].filter(a => a in window))).toEqual([]);
    // çocuk "Tamam" der: ana menüye dönülür, oyun yine açılmaz
    await page.locator('.kl-perde .kl-tamam').click();
    await expect.poll(() => page.url(), { timeout: 15_000 }).not.toContain('/doktor/');
    expect(hatalar).toEqual([]);
  });
}

test('Doktor kilidi · abone: menü kartında rozet yok; kart bekleme odasını açar, odada yalnız çizimi tamam olan vaka sırada', async ({ page }) => {
  const hatalar: string[] = [];
  page.on('pageerror', e => hatalar.push(e.message));
  await oyunlaraGit(page, '&uygulama=android&premium=1');
  const k = kart(page);
  await expect(k).toBeVisible();
  await expect(page.locator('.ym-icerik-kap', { has: k }).locator('.mk-kilit')).toHaveCount(0);
  await expect(k).not.toHaveAttribute('data-kilitli', '');
  // son bilinen abonelik durumu kayıtlı (oyun sayfası bunu okur)
  await expect.poll(() => page.evaluate(a => JSON.parse(localStorage.getItem(a) ?? '{}').premium === true, ABONELIK_ANAHTARI)).toBe(true);
  await k.click({ position: { x: 14, y: 14 } });      // kartın köşesi: dar ekranda ortasını dinleme düğmesi örter
  await expect.poll(() => page.url(), { timeout: 15_000 }).toContain('/doktor/');
  const kok = page.locator('#doktor');
  await expect(kok).toHaveAttribute('data-oyun', 'klinik', { timeout: 60_000 });
  await expect(page.locator('.kl-perde .kl-baslik')).toHaveCount(0);       // kilit anı yok (bekleme odasının kendi .kl-perde öğesi ayrı)
  await expect(kok).toHaveAttribute('data-durum', /hazir|eksik/, { timeout: 90_000 });
  expect(hatalar).toEqual([]);
});

test('Doktor kilidi · abone: uygulamada doğrudan açılış bekleme odası; yalnız çizimi tamam olan vaka seçilebilir', async ({ page }) => {
  const hatalar: string[] = [];
  page.on('pageerror', e => hatalar.push(e.message));
  await page.addInitScript(a => localStorage.setItem(a, JSON.stringify({ premium: true, zaman: Date.now() })), ABONELIK_ANAHTARI);
  await page.goto('./doktor/index.html?test=1&uygulama=android&yas=4');
  const kok = page.locator('#doktor');
  await expect(kok).toHaveAttribute('data-oyun', 'klinik', { timeout: 60_000 });
  await expect(kok).toHaveAttribute('data-durum', /hazir|eksik/, { timeout: 90_000 });
  await expect(page.locator('.kl-perde .kl-baslik')).toHaveCount(0);       // kilit anı yok (bekleme odasının kendi .kl-perde öğesi ayrı)
  test.skip((await kok.getAttribute('data-durum')) !== 'hazir', 'bekleme odasının çizimleri eksik');
  type Klinik = { acik(): string[]; sira(): string[]; odadakiler(): string[] };
  const K = <T>(f: keyof Klinik) => page.evaluate(ad => (window as unknown as { __klinik: Record<string, () => unknown> }).__klinik[ad](), f) as Promise<T>;
  const acik = await K<string[]>('acik');
  // yarım iş açılmaz: sırada yalnız çizimi tamam olan vakalar; bugün Dikenli Pati (Zıpzıp) kesin açık
  expect(acik).toContain('zipzip');
  for (const v of await K<string[]>('sira')) expect(acik, v).toContain(v);
  expect(hatalar).toEqual([]);
});

test('Doktor kilidi · web sitesinde kilit yok: menü kartı rozetsiz, sayfa açılır', async ({ page }) => {
  await oyunlaraGit(page, '');
  const k = kart(page);
  await expect(k).toBeVisible();
  await expect(page.locator('.ym-icerik-kap', { has: k }).locator('.mk-kilit')).toHaveCount(0);
  await page.goto('./doktor/index.html?test&yas=4');
  await expect(page.locator('#doktor')).toHaveAttribute('data-oyun', 'klinik', { timeout: 60_000 });
  await expect(page.locator('.kl-perde .kl-baslik')).toHaveCount(0);       // kilit anı yok (bekleme odasının kendi .kl-perde öğesi ayrı)
});
