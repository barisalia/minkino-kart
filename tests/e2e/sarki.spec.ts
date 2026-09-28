/**
 * Şarkılar oyunlarda (Gemini kayıtları, assets/muzik): pazar açılış şarkısı (sayılan meyveler sözle zıplar, sayı
 * rozetleri, karaoke, dokunarak alkış) ve menü fon müziği (dosya yüklenir, ilk dokunuşta çalar).
 * Banyo köpük şarkısı macera-banyo.spec.ts içinde (köpürtmeden sonra). Görüntüler: tests/screens/sarki-*.png
 */
import { expect, test } from '@playwright/test';
import { hataTopla } from './yardimci';

test('Pazar şarkısı: 1 elma, 2 armut, 3 çilek, 4 üzüm sözle zıplar; alkış; sonra ilk müşteri', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  const p = info.project.name;
  // sarkihiz=1: test modunda şarkının saati gerçek hızda akar (ses çalmaz)
  await page.goto('./pazar/?test=1&yas=4&ekran=pazar&sarkihiz=1');
  await expect(page.locator('.pz-sarki-sira')).toBeVisible();
  await expect(page.locator('.pz-pazar')).toHaveAttribute('data-sarki', 'caliyor');
  // "Bir elma, iki armut" (ilk satır ~1-2.4 sn)
  await expect(page.locator('.pz-sarki-grup.sayildi')).toHaveCount(2, { timeout: 4000 });
  await page.screenshot({ path: `tests/screens/sarki-pazar-${p}-1.png` });
  // ritme alkış: vuruşlar ~570 ms arayla
  const e = (await page.locator('.pz-pazar').boundingBox())!;
  for (let i = 0; i < 6; i++) {
    await page.mouse.click(e.x + e.width * 0.5, e.y + e.height * 0.45);
    await page.waitForTimeout(570);
  }
  await expect(page.locator('.pz-sarki-grup.sayildi')).toHaveCount(4);
  await page.screenshot({ path: `tests/screens/sarki-pazar-${p}-2.png` });
  await expect(page.locator('.pz-sarki-rozet')).toHaveText(['1', '2', '3', '4']);
  // şarkı bitince tezgâh boşalır, ilk müşteri gelir
  await expect(page.locator('.pz-pazar')).toHaveAttribute('data-sarki', 'bitti', { timeout: 12000 });
  await expect(page.locator('.pz-sarki-sira')).toHaveCount(0);
  await expect(page.locator('.pz-pazar.pz-aktif')).toBeVisible({ timeout: 10000 });
  await page.screenshot({ path: `tests/screens/sarki-pazar-${p}-3.png` });
  expect(hatalar).toEqual([]);
});

test('Menü müziği: menu-dongu.mp3 ilk dokunuşta yüklenip çalar', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  const istek = page.waitForRequest(/menu-dongu.*\.mp3/, { timeout: 10000 });
  await page.goto('./uygulama/');
  await expect(page.locator('.ug-menu')).toBeVisible();
  await page.mouse.click(10, 10);
  await istek;
  await page.waitForTimeout(800);
  await page.screenshot({ path: `tests/screens/sarki-menu-${info.project.name}.png` });
  expect(hatalar).toEqual([]);
});
