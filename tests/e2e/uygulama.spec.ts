import { expect, test } from '@playwright/test';
import { hataTopla } from './yardimci';

const BEKLENEN: Record<string, string> = {
  kartlar: './kartlar/',
  pazar: './pazar/',
  canlan: './canlan/',
  sanatci: './sanatci/',
  macera: './macera/',
  film: './film/',
};

test('Ana menü: açılışta Mino ve 6 oyun kartı, görseller yüklü', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./?test=1');
  await expect(page.locator('.ug-menu .mino svg')).toBeVisible();
  const kartlar = page.locator('.ug-kart');
  await expect(kartlar).toHaveCount(6);

  // her kart ekranda, doğru bağlantıda ve ekran dışına taşmıyor
  const boyut = page.viewportSize()!;
  for (const [id, adres] of Object.entries(BEKLENEN)) {
    const kart = page.locator(`.ug-kart[data-oyun="${id}"]`);
    await expect(kart).toBeVisible();
    await expect(kart).toHaveAttribute('href', adres);
    const k = (await kart.boundingBox())!;
    expect(k.x).toBeGreaterThanOrEqual(0);
    expect(k.y).toBeGreaterThanOrEqual(0);
    expect(k.x + k.width).toBeLessThanOrEqual(boyut.width + 1);
    expect(k.y + k.height).toBeLessThanOrEqual(boyut.height + 1);
    expect(k.height).toBeGreaterThan(100);
  }

  // kart çizimleri gerçekten yüklendi
  await expect
    .poll(() => page.locator('.ug-kart img').evaluateAll((l) => l.filter((i) => !(i as HTMLImageElement).complete || (i as HTMLImageElement).naturalWidth === 0).length))
    .toBe(0);

  // Kino Mino'nun yanında (parçalı iskelet yüklendi), yan oyun rozetleri kartlarda
  await expect(page.locator('.ug-kino .kr-iskeletli svg')).toBeVisible();
  await expect(page.locator('.ug-yeni')).toHaveCount(4);
  await expect(page.locator('.ug-kart[data-oyun="pazar"] .ug-yeni')).toHaveText('Meyve Suyu');
  await expect(page.locator('.ug-kart[data-oyun="kartlar"] .ug-yeni')).toHaveText('Hafıza');
  await expect(page.locator('.ug-kart[data-oyun="canlan"] .ug-yeni')).toHaveText('Müzem');
  // Çizgi Filmler kartı (eski adı Mini Filmler): resmi en yeni filmin kapağı
  await expect(page.locator('.ug-kart[data-oyun="film"] .ug-kart-ad')).toHaveText('Çizgi Filmler');
  await expect(page.locator('.ug-kart[data-oyun="film"]')).toHaveAttribute('aria-label', 'Çizgi Filmler');
  expect(await page.locator('.ug-kart[data-oyun="film"] .ug-kart-resim').evaluate((e) => getComputedStyle(e).backgroundImage)).toContain('mino-sepet');
  await expect(page.getByText('Mini Film')).toHaveCount(0);
  // Kino'ya dokununca tepki verir
  await page.locator('.ug-kino-kap').click();
  await expect(page.locator('.ug-kino-kap')).toHaveAttribute('data-tepki', 'sevin');

  await page.waitForTimeout(300);
  await page.screenshot({ path: `tests/screens/${info.project.name}-uygulama-menu.png` });
  expect(hatalar).toEqual([]);
});

test('Ana menü: karta dokununca ilgili oyuna gider', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./?test=1');
  await page.locator('.ug-kart[data-oyun="pazar"]').click();
  await page.waitForURL(/\/pazar\/$/);
  await expect(page.locator('.pz-logo')).toBeVisible();
  expect(hatalar).toEqual([]);
});

test('Site kökü ana menüyü açar; Kartlar /kartlar/ adresinde, eski adresler yönlenir', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./');
  await expect(page.locator('.ug-menu')).toBeVisible();
  // kartın sallanması test modunda durur (tıklama için)
  await page.goto('./?test=1');
  await page.locator('.ug-kart[data-oyun="kartlar"]').click();
  await page.waitForURL(/\/kartlar\/$/);
  await expect(page.locator('.oyna-dugme')).toBeVisible();

  // eski menü adresi köke yönlenir (parametreler korunur)
  await page.goto('./uygulama/?test=1');
  await page.waitForURL((u) => u.pathname === '/' && u.search === '?test=1');
  await expect(page.locator('.ug-menu')).toBeVisible();

  // eski Kartlar bağlantısı (kökte ?yas=…) Kartlar'a yönlenir
  await page.goto('./?test=1&yas=5&ekran=temalar');
  await page.waitForURL(/\/kartlar\/\?test=1&yas=5&ekran=temalar$/);
  await expect(page.locator('.hafiza-serit')).toBeVisible();
  expect(hatalar).toEqual([]);
});

test('Her oyunun açılışındaki geri düğmesi ana menüye döner', async ({ page }) => {
  const hatalar = hataTopla(page);
  const oyunlar: [string, string][] = [
    ['kartlar', 'Minkino’ya dön'],
    ['pazar', 'Minkino’ya dön'],
    ['canlan', 'Minkino’ya dön'],
    ['sanatci', 'Minkino’ya dön'],
    ['macera', 'Minkino’ya dön'],
    ['film', 'Geri'],
  ];
  for (const [oyun, etiket] of oyunlar) {
    await page.goto(`./${oyun}/?test=1`);
    await page.getByRole('button', { name: etiket, exact: true }).click();
    await page.waitForURL((u) => u.pathname === '/', { timeout: 10000 });
    await expect(page.locator('.ug-menu'), oyun).toBeVisible();
  }
  expect(hatalar).toEqual([]);
});

test('Ana menü: ebeveyn kapısı kısa dokunuşta açılmaz, basılı tutunca açılır', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./?test=1');
  const kapi = page.locator('.ug-kapi');
  await expect(kapi).toBeVisible();

  // kısa dokunuş: yalnız ipucu
  await kapi.click();
  await expect(page.locator('.ug-kapi-ipucu')).toHaveClass(/gorunur/);
  await expect(page.locator('.ug-ayarlar')).toHaveCount(0);

  // basılı tut (test modunda süre kısa)
  const k = (await kapi.boundingBox())!;
  await page.mouse.move(k.x + k.width / 2, k.y + k.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(200);
  await page.mouse.up();
  await expect(page.locator('.ug-ayarlar')).toBeVisible();
  await page.screenshot({ path: `tests/screens/${info.project.name}-uygulama-ebeveyn.png` });

  await page.getByRole('button', { name: 'Ana menü' }).click();
  await expect(page.locator('.ug-menu')).toBeVisible();
  expect(hatalar).toEqual([]);
});

test('Ana menü: yatay ekranda da kartlar sığıyor', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  const { width, height } = page.viewportSize()!;
  await page.setViewportSize({ width: height, height: width });
  await page.goto('./?test=1');
  await expect(page.locator('.ug-kart')).toHaveCount(6);
  for (const kart of await page.locator('.ug-kart').all()) {
    const k = (await kart.boundingBox())!;
    expect(k.x + k.width).toBeLessThanOrEqual(height + 1);
    expect(k.y + k.height).toBeLessThanOrEqual(width + 1);
    expect(k.height).toBeGreaterThan(80);
  }
  await page.waitForTimeout(300);
  await page.screenshot({ path: `tests/screens/${info.project.name}-uygulama-yatay.png` });
  expect(hatalar).toEqual([]);
});
