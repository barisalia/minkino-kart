import { test, expect, type Page } from '@playwright/test';

// Resimli Sözlük (alfabe/src/resimli-sozluk.ts): Harf Albümü'nde her kartın "Sözlük" düğmesi harfin sözlük sayfasını açar.
// Bitmiş harfin sayfası açık, bitmemişinki kapalı. 4 ve 5+ hecelerle ve "bul" anıyla; 2–3 yaş yalnız dokun-dinle.
test.beforeEach(async ({ page }, bilgi) => {
  if (bilgi.project.name === 'iphone') await page.setViewportSize({ width: 844, height: 390 });
});
const BITEN = ['01', '17', '06', '24', '12', '15', '18', '14'];

async function sozluguAc(page: Page, yas: number, bulundu: string[] = []) {
  await page.addInitScript(([biten, yas, bulundu]) => {
    if (sessionStorage.getItem('sozluk-test')) return;
    sessionStorage.setItem('sozluk-test', '1');
    const ek = yas >= 5 ? '' : yas === 4 ? '-yas-4' : '-yas-2-3';
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas }));
    localStorage.setItem('minkino-alfabe-v1' + ek, JSON.stringify({ akisSurumu: 2, biten, bekleyen: [], son: '14', adimlar: {} }));
    localStorage.setItem('minkino-sozluk-v1' + ek, JSON.stringify({ bulundu }));
  }, [BITEN, yas, bulundu] as const);
  await page.goto('./alfabe/');
  await page.locator('.at-album-ac').click();
  await expect(page.locator('.ka-sozluk-ac')).toHaveCount(2);
  await page.locator('.ka-sozluk-ac.ka-sol').click();
  await expect(page.locator('.sz')).toHaveAttribute('data-harf', '01');
}

test('5+: sayfa örnek sözcükle başlar, heceli yazı; bul anında yanlış resim geçmez, doğru resim bulunur ve kaydedilir', async ({ page }) => {
  await sozluguAc(page, 6);
  const sz = page.locator('.sz');
  await expect(sz).toHaveAttribute('data-durum', 'acik');
  await expect(sz).toHaveAttribute('data-evre', 'bul');
  const kartlar = page.locator('.sz-kart');
  expect(await kartlar.count()).toBeGreaterThanOrEqual(4);
  await expect(kartlar.first()).toHaveAttribute('aria-label', 'Armut');
  await expect(page.locator('.sz-heceli').first()).toBeVisible();
  const hedef = await page.evaluate(async () => (await import('/alfabe/src/resimli-sozluk.ts')).sozlukVerisi().hedefler['01']);
  expect(hedef).toBeTruthy();
  const ids = await kartlar.evaluateAll(l => l.map(x => (x as HTMLElement).dataset.sozcuk!));
  await page.locator('.sz-kart[data-sozcuk="' + ids.find(x => x !== hedef) + '"]').click();
  await expect(sz).toHaveAttribute('data-evre', 'bul');
  await page.locator('.sz-kart[data-sozcuk="' + hedef + '"]').click();
  await expect(sz).toHaveAttribute('data-evre', 'dinle');
  await expect(page.locator('.sz-bulundu')).toHaveCount(1);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('minkino-sozluk-v1') || '{}').bulundu)).toContain('01');
});

test('harfler arasında gezilir; bitmemiş harfin sayfası kapalı; albüme dönülür', async ({ page }) => {
  await sozluguAc(page, 6, ['01', '17', '06', '24', '12', '15', '18', '14']);
  for (let i = 0; i < 8; i++) await page.locator('.sz-sonra').click();
  const sz = page.locator('.sz');
  await expect(sz).toHaveAttribute('data-harf', '25');
  await expect(sz).toHaveAttribute('data-durum', 'kapali');
  await expect(page.locator('.sz-kart')).toHaveCount(0);
  await expect(page.locator('.sz-kilit')).toBeVisible();
  await page.locator('.sz-once').click();
  await expect(sz).toHaveAttribute('data-harf', '14');
  await expect(sz).toHaveAttribute('data-durum', 'acik');
  await page.getByRole('button', { name: 'Albüme dön' }).click();
  await expect(page.locator('.ka-album')).toBeVisible();
});

test('2–3 yaş: yalnız dokun-dinle (bul anı ve hece noktaları yok)', async ({ page }) => {
  await sozluguAc(page, 3);
  await expect(page.locator('.sz')).toHaveAttribute('data-evre', 'dinle');
  await expect(page.locator('.sz-heceli')).toHaveCount(0);
  await page.locator('.sz-kart').nth(1).click();
  await expect(page.locator('.sz-kart').nth(1)).toHaveClass(/sz-parla/);
});

test('sayfa ekrana sığar; kartlar ve oklar parmakla dokunacak boyda', async ({ page }) => {
  await sozluguAc(page, 6, ['01']);
  const olcu = await page.evaluate(() => ({
    kayar: document.documentElement.scrollHeight > innerHeight + 1, genis: document.documentElement.scrollWidth > innerWidth + 1,
    kart: Math.min(...[...document.querySelectorAll('.sz-kart')].map(e => Math.min(e.getBoundingClientRect().width, e.getBoundingClientRect().height))),
    ok: Math.min(...[...document.querySelectorAll('.sz-once,.sz-sonra')].map(e => e.getBoundingClientRect().height)),
  }));
  expect(olcu.kayar).toBe(false);
  expect(olcu.genis).toBe(false);
  expect(olcu.kart).toBeGreaterThanOrEqual(44);
  expect(olcu.ok).toBeGreaterThanOrEqual(44);
});
