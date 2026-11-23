import { test, expect } from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

test('Eski oyun kaydıyla da iki rafta yalnızca oynanabilir yemekler açılır', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.addInitScript(() => {
  localStorage.setItem('minkino-sef-v1', JSON.stringify({
    sessiz: true, gecmis: [{ tarifId: 'salata', puan: 3, sus: {id:'limon',x:0.5,y:0.5} }],
  }));
  });
  await page.goto('./sef/', {waitUntil:'domcontentloaded'});
  for (const raf of [1, 2]) {
    const yemekler = page.locator('.siparisler button');
    await expect(yemekler.first()).toBeVisible();
    await expect(page.locator('.siparisler button:not([data-tarif]):not([data-tezgah])')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /tarif kitabı|hazırladığım tabaklar/i })).toHaveCount(0);
    if (raf === 1) await page.getByRole('button', { name: 'Sonraki tarif rafı' }).click();
  }
  await page.locator('[data-tezgah="omlet"]').click();
  await expect(page.locator('.siparisler')).toHaveCount(0);
  await expect(page.locator('.sef-tarif-kitabi')).toHaveCount(0);
});

