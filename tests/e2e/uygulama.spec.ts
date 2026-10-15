import { expect, test } from '@playwright/test';
import { menuOyunlari } from '../../uygulama/src/oyunlar';
import { hataTopla } from './yardimci';

/** web menüsündeki kart sayısı (8; Kino'nun Otobüsü bayrağı açılınca 9) */
const MENU_ADET = menuOyunlari(false).length;

const BEKLENEN: Record<string, string> = {
  kartlar: './kartlar/',
  pazar: './pazar/',
  canlan: './canlan/',
  macera: './macera/',
  film: './film/',
  dedektif: './dedektif/',
  giysin: './giysin/',
  pasta: './pasta/',
};

test('Ana menü: açılışta Mino ve 8 (Kino’nun Otobüsü ile 9) oyun kartı, görseller yüklü', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./?test=1');
  await expect(page.locator('.ug-menu .mino svg')).toBeVisible();
  const kartlar = page.locator('.ug-kart');
  await expect(kartlar).toHaveCount(MENU_ADET);

  // her kart ekranda, doğru bağlantıda ve ekran dışına taşmıyor (giriş animasyonu bitince ölçülür: 9 kartta sonuncusu ~1,7 sn)
  await page.waitForTimeout(2000);
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
  await expect(page.locator('.ug-yeni')).toHaveCount(menuOyunlari(false).filter((k) => k.rozet).length);
  // Kino'nun Otobüsü (bayrak açıksa): kartın resmi Gemini kapağı
  if (MENU_ADET === 9) expect(await page.locator('.ug-kart[data-oyun="kino-otobus"] .ug-kart-resim').evaluate((e) => getComputedStyle(e).backgroundImage)).toContain('kapak');
  await expect(page.locator('.ug-kart[data-oyun="dedektif"] .ug-yeni')).toHaveText('Yeni');
  await expect(page.locator('.ug-kart[data-oyun="pasta"] .ug-yeni')).toHaveText('Yeni');
  await expect(page.locator('.ug-kart[data-oyun="pasta"] .ug-k-otobus svg')).toBeVisible();
  await expect(page.locator('.ug-kart[data-oyun="pazar"] .ug-yeni')).toHaveText('Meyve Suyu');
  await expect(page.locator('.ug-kart[data-oyun="kartlar"] .ug-yeni')).toHaveText('Hafıza');
  await expect(page.locator('.ug-kart[data-oyun="canlan"] .ug-yeni')).toHaveText('Müzem');
  // Çizgi Filmler kartı (eski adı Mini Filmler): resmi en yeni filmin kapağı
  await expect(page.locator('.ug-kart[data-oyun="film"] .ug-kart-ad')).toHaveText('Çizgi Filmler');
  await expect(page.locator('.ug-kart[data-oyun="film"]')).toHaveAttribute('aria-label', 'Çizgi Filmler');
  expect(await page.locator('.ug-kart[data-oyun="film"] .ug-kart-resim').evaluate((e) => getComputedStyle(e).backgroundImage)).toContain('kino-oyuncak');
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
    ['macera', 'Minkino’ya dön'],
    ['film', 'Geri'],
    ['pasta', 'Minkino’ya dön'],
    ['dedektif', 'Minkino’ya dön'],
  ];
  for (const [oyun, etiket] of oyunlar) {
    await page.goto(`./${oyun}/?test=1`);
    await page.getByRole('button', { name: etiket, exact: true }).click();
    await page.waitForURL((u) => u.pathname === '/', { timeout: 10000 });
    await expect(page.locator('.ug-menu'), oyun).toBeVisible();
  }
  expect(hatalar).toEqual([]);
});

test('Ana menü: ebeveyn kapısı yazılı toplama sorusuyla açılır', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./?test=1');
  const kapi = page.locator('.ug-kapi');
  await expect(kapi).toBeVisible();

  // dokununca soru (yazıyla); kapatınca ayarlar açılmaz
  await kapi.click();
  const soru = page.locator('.ebeveyn-kapisi .kapi-soru');
  await expect(soru).toHaveText(/ artı .* kaç eder\?$/);
  await page.locator('.ebeveyn-kapisi').getByRole('button', { name: 'Kapat' }).click();
  await expect(page.locator('.ebeveyn-kapisi')).toHaveCount(0);
  await expect(page.locator('.ug-ayarlar')).toHaveCount(0);

  // doğru cevap (test modunda data-toplam)
  await kapi.click();
  const toplam = (await soru.getAttribute('data-toplam'))!;
  for (const r of toplam) await page.locator('.ebeveyn-kapisi .tus', { hasText: new RegExp(`^${r}$`) }).click();
  await page.getByRole('button', { name: 'tamam' }).click();
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
  await expect(page.locator('.ug-kart')).toHaveCount(MENU_ADET);
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

test('Ana menü: kart canlanır (meyveler sepete, dinozor ve Kino zıplar, balon yükselir, otobüs seker, üç kart hoplar)', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./?test=1');
  await expect(page.locator('.ug-kart')).toHaveCount(MENU_ADET);
  // dokunuş sayfayı hemen değiştirir (test modu): canlanma sınıfı elle verilip her katmanın hareketi ölçülür
  const adlar = await page.evaluate(() => {
    for (const a of document.querySelectorAll('.ug-kart')) a.classList.add('canlan');
    const ad = (s: string) => [...document.querySelectorAll(s)].map((e) => getComputedStyle(e).animationName);
    return {
      meyve: ad('.ug-k-meyve > .ug-k-ic'),
      dinozor: ad('.ug-k-dinozor > .ug-k-ic'),
      balon: ad('.ug-k-balon > .ug-k-ic'),
      kino: ad('.ug-k-giysin > .ug-k-ic'),
      otobus: ad('.ug-k-otobus > .ug-k-ic'),
      mini: ad('.ug-k-mini > .ug-k-ic'),
    };
  });
  expect(adlar.meyve).toEqual(['ug-k-sepete', 'ug-k-sepete']);
  expect(adlar.dinozor).toEqual(['ug-k-hop']);
  expect(adlar.balon).toEqual(['ug-k-yuksel']);
  expect(adlar.kino).toEqual(['ug-k-hop']);
  expect(adlar.otobus).toEqual(['ug-k-hop']);
  expect(adlar.mini).toEqual(['ug-k-hop', 'ug-k-hop', 'ug-k-hop']);
  expect(hatalar).toEqual([]);
});

test('Ana menü: yatay telefonda logo ve Mino ile Kino solda, kartlar sağda ekrana sığar (844×390, 667×375)', async ({ browser }, info) => {
  test.skip(info.project.name !== 'iphone', 'yalnız telefon projesinde');
  for (const [width, height] of [
    [844, 390],
    [667, 375],
  ]) {
    const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: 'tr-TR', baseURL: info.project.use.baseURL });
    const page = await ctx.newPage();
    await page.goto('./?test=1');
    await expect(page.locator('.ug-kart')).toHaveCount(MENU_ADET);
    await page.waitForTimeout(2000);
    // derlemede ana.css menü css'inden sonra yükleniyor: '.mk-kok .ekran' sütun düzeni yatay düzeni ezmemeli
    expect(await page.locator('.ug-menu').evaluate((e) => getComputedStyle(e).flexDirection)).toBe('row');
    const g = (await page.locator('.ug-giris').boundingBox())!;
    const iz = (await page.locator('.ug-izgara').boundingBox())!;
    expect(g.x + g.width).toBeLessThanOrEqual(iz.x + 1);
    expect(iz.y + iz.height).toBeLessThanOrEqual(height + 1);
    await ctx.close();
  }
});
