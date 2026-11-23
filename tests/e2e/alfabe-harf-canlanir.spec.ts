import { test, expect, type Page } from '@playwright/test';

// "Harf canlanır" (19 Kasım 2026): 5+ yaşta büyük ve küçük harf yazmanın bitiş anı (alfabe/src/yazma.ts → harfCanlanir).
// Harf kalem rengiyle alttan yukarı dolar, sözcüğün resmi harfin içinden çıkar: büyük harfte dersin sözcüğü,
// küçük harfte Keşfet'in ikinci sözcüğü. İz sürerken mürekkebin ucunda ışıklar parlar.
// Harf Atölyesi telefonda yataya kilitlidir (src/kabuk/yon.ts → YATAY_SAYFALAR); telefon projesi yatay boyda oynar.
test.beforeEach(async ({ page }, bilgi) => {
  if (bilgi.project.name === 'iphone') await page.setViewportSize({ width: 844, height: 390 });
});

async function yazmayiAc(page: Page, adim: 1 | 2, adres = './alfabe/') {
  await page.addInitScript(adim => {
    if (sessionStorage.getItem('harf-canlanir')) return;
    sessionStorage.setItem('harf-canlanir', '1');
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: 6 }));
    localStorage.setItem('minkino-alfabe-v1', JSON.stringify({ adimlar: { '02': adim } }));
  }, adim);
  await page.goto(adres);
  await page.locator('.at-harf[data-id="02"]').click();
  await expect(page.locator('#atolye')).toHaveAttribute('data-adim', String(adim));
  // Dar ekranda çocuğun defteri Ceren örnek gösterirken gizlidir (alfabe/src/stil.css); görününce yazılır.
  await expect(page.locator('.yz-iz svg')).toBeVisible({ timeout: 20_000 });
}
// Klavyede her basış kalemi çizgi boyunca ilerletir (alfabe/src/cizim.ts); harf bitene dek basılır.
async function harfiBitir(page: Page) {
  const defter = page.locator('.yz-iz svg');
  await defter.focus();
  for (let i = 0; i < 80 && !(await page.locator('.yz-dolgu').count()); i++) await page.keyboard.press('Space');
}

test('büyük harf bitince harf renkle dolar ve dersin sözcüğünün resmi harften çıkar', async ({ page }) => {
  await yazmayiAc(page, 1);
  await page.locator('.yz-iz svg').focus();
  await page.keyboard.press('Space');
  // İz sürerken mürekkebin ucunda ışık parlar.
  await expect(page.locator('.yz-kagit .yz-isik').first()).toBeAttached();
  await harfiBitir(page);
  await expect(page.locator('.yz-dolgu .yz-dolgu-yol').first()).toBeAttached();
  const resim = page.locator('.yz-iz').locator('xpath=..').locator('.yz-cikan');
  await expect(resim).toHaveAttribute('alt', 'Balık');
  await expect(resim).toHaveCSS('opacity', '1', { timeout: 3000 });
  await expect(page.locator('.yz-soz')).toHaveText('Balık!');
  // Resim çocuğun kâğıdının içinde kalır, harfin sağına (dar kâğıtta altına) konur, harfin üstünü örtmez.
  await page.waitForTimeout(700);
  const yer = await resim.evaluate(img => {
    const i = img.getBoundingClientRect(), k = img.parentElement!.getBoundingClientRect();
    const g = document.querySelector('.yz-dolgu')!.getBoundingClientRect();
    return { ic: i.left >= k.left && i.right <= k.right && i.top >= k.top && i.bottom <= k.bottom,
      sagdaYaAltta: i.left >= g.right || i.top >= g.bottom };
  });
  expect(yer).toEqual({ ic: true, sagdaYaAltta: true });
  // Çocuğun defteri açık kalır (an çocuğun kendi harfinde olur).
  await expect(page.locator('.yz-masalar')).toHaveAttribute('data-sira', 'sen');
  // Ders akışı aynı: sonraki adım Mıknatıslar.
  await expect(page.locator('#atolye')).toHaveAttribute('data-adim', '4', { timeout: 15_000 });
});

test('küçük harfte resim Keşfet\'in ikinci sözcüğünden gelir, iki adım birbirinin tekrarı olmaz', async ({ page }) => {
  await yazmayiAc(page, 2);
  await harfiBitir(page);
  const resim = page.locator('.yz-iz').locator('xpath=..').locator('.yz-cikan');
  // Keşfet'in ikinci sözcüğü günden güne değişir (ders-sozcukleri.ts): B ile başlar, büyük harfin "Balık"ını tekrarlamaz.
  await expect(resim).toHaveAttribute('alt', /^B/);
  const ad = (await resim.getAttribute('alt'))!;
  expect(ad).not.toBe('Balık');
  await expect(page.locator('.yz-soz')).toHaveText(ad + '!');
});

test('az hareket ayarında ışık izi yok; harf hemen dolar, resim belirir', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await yazmayiAc(page, 1);
  await page.locator('.yz-iz svg').focus();
  await page.keyboard.press('Space');
  await harfiBitir(page);
  await expect(page.locator('.yz-kagit .yz-isik')).toHaveCount(0);
  const perde = page.locator('.yz-iz svg clipPath rect');
  expect(Number(await perde.getAttribute('height'))).toBeGreaterThan(60);
  await expect(page.locator('.yz-iz').locator('xpath=..').locator('.yz-cikan')).toHaveCSS('opacity', '1', { timeout: 2000 });
});

// Astra çizimleri (H1) gelince: çizilen harf dönerek resimli harfe geçer, sihirli kalem mürekkebin ucunu izler.
// Çizimler henüz yok; test kipinde yer tutucu (1 × 1 saydam) verilerek mekanik denenir (alfabe/src/yazma.ts → astraCizimi).
const YER_TUTUCU = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
test('resimli harf çizimi varsa çizilen harf resimli harfe döner, sihirli kalem izler', async ({ page }) => {
  await page.addInitScript(src => {
    (window as unknown as { __resimliHarf: Record<string, string> }).__resimliHarf = { '02': src, 'sihirli-kalem': src, 'parilti-0': src };
  }, YER_TUTUCU);
  await yazmayiAc(page, 1, './alfabe/?test=1');
  await page.locator('.yz-iz svg').focus();
  await page.keyboard.press('Space');
  await expect(page.locator('.yz-sihirli-kalem')).toBeVisible();
  await expect(page.locator('.yz-isik img').first()).toBeAttached();
  await harfiBitir(page);
  const resimli = page.locator('.yz-resimli');
  await expect(resimli).toHaveAttribute('src', YER_TUTUCU);
  await expect(resimli).toHaveCSS('opacity', '1', { timeout: 3000 });
  await expect(page.locator('.yz-dolgu')).toHaveCSS('opacity', '0');
  await expect(page.locator('.yz-sihirli-kalem')).toHaveClass(/yz-kalem-gitti/);
  await expect(page.locator('.yz-cikan')).toHaveCSS('opacity', '1', { timeout: 3000 });
  await expect(page.locator('#atolye')).toHaveAttribute('data-adim', '4', { timeout: 15_000 });
});
