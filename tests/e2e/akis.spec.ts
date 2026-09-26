import { expect, test } from '@playwright/test';
import { hataTopla, soruDegisti, soruyuCevapla } from './yardimci';

const ekran = (proje: string, ad: string) => `tests/screens/${proje}-${ad}.png`;

test('açılış → yaş → tema → 8 soruluk tur → albüm', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  const p = info.project.name;
  await page.goto('./?test=1');
  await expect(page.locator('.oyna-dugme')).toBeVisible();
  // kart ve Mino resimleri çizilmeden görüntü alınmasın (yoksa kartlar boş görünür)
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => undefined))));
  await page.waitForTimeout(200);
  await page.screenshot({ path: ekran(p, '01-acilis') });

  await page.locator('.oyna-dugme').click();
  await expect(page.locator('.yas-kart')).toHaveCount(4);
  await page.screenshot({ path: ekran(p, '02-yas') });

  await page.locator('[data-yas="3"]').click();
  await expect(page.locator('.paket')).toHaveCount(6);
  await expect(page.locator('.paket.kilitli')).toHaveCount(4);
  await page.screenshot({ path: ekran(p, '03-temalar') });

  // Kilitli pakete dokunmak oyunu başlatmaz
  await page.locator('[data-tema="harfler"]').click();
  await expect(page.locator('.temalar')).toBeVisible();

  await page.locator('[data-tema="hayvanlar"]').click();
  await expect(page.locator('.oyun-alan')).toBeVisible();
  await expect(page.locator('.ilerleme i')).toHaveCount(8);

  for (let i = 0; i < 8; i++) {
    await expect(page.locator('.oyun-alan[data-tip]')).toBeVisible();
    await page.waitForTimeout(120);
    if (i === 0 || i === 3) await page.screenshot({ path: ekran(p, `04-soru-${i + 1}`) });
    await soruyuCevapla(page);
    if (i < 7) await soruDegisti(page, i);
  }

  await expect(page.locator('.tur-sonu')).toBeVisible({ timeout: 8000 });
  await expect(page.locator('.buyuk-yildiz.dolu')).toHaveCount(3);
  await expect(page.locator('.album-izgara .kart.yeni')).toHaveCount(8);

  // 8 kart toplandı → Taşıtlar paketi açıldı kutlaması
  await expect(page.locator('.kutlama')).toBeVisible({ timeout: 8000 });
  await page.screenshot({ path: ekran(p, '06-yeni-paket') });
  await page.locator('.kutlama').click();
  await expect(page.locator('.kutlama')).toHaveCount(0);
  await page.locator('.kaydir').evaluate((e) => (e.scrollTop = 0));
  await page.screenshot({ path: ekran(p, '05-tur-sonu') });

  await page.getByRole('button', { name: 'Yeni tema' }).click();
  await expect(page.locator('.paket.kilitli')).toHaveCount(3);
  await page.getByRole('button', { name: 'Albüm' }).click();
  await expect(page.locator('.album-izgara .kart.var')).toHaveCount(8);
  await page.screenshot({ path: ekran(p, '07-album') });

  // Albümde karta dokununca adı söylenir (hata vermemeli)
  await page.locator('.album-izgara .kart.var').first().click();
  await page.locator('.album-izgara .kart.yok').first().click();

  // İlerleme kalıcı: sayfa yenilenince albüm korunur
  await page.reload();
  await page.locator('.oyna-dugme').click();
  await expect(page.locator('.album-dugme .rozet')).toHaveText('8');

  expect(hatalar).toEqual([]);
});

test('ebeveyn köşesi: kapı, yaş değiştirme, ayarlar', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  const p = info.project.name;
  await page.goto('./?test=1');
  await page.getByRole('button', { name: 'Ebeveyn köşesi' }).click();
  const soru = page.locator('.kapi-soru');
  await expect(soru).toBeVisible();
  await page.screenshot({ path: ekran(p, '08-ebeveyn-kapisi') });

  // Yanlış cevap kapıyı açmaz
  await page.locator('.tus', { hasText: '1' }).first().click();
  await page.locator('.tus.tamam').click();
  await expect(page.locator('.ebeveyn-kapisi')).toBeVisible();

  const toplam = (await soru.getAttribute('data-toplam'))!;
  for (const r of toplam) await page.locator('.tus-takimi .tus', { hasText: new RegExp(`^${r}$`) }).click();
  await page.locator('.tus.tamam').click();
  await expect(page.locator('.ebeveyn .panel').first()).toBeVisible();
  await page.screenshot({ path: ekran(p, '09-ebeveyn'), fullPage: true });

  await page.locator('.bolumlu [data-yas="5"]').click();
  await page.getByRole('switch', { name: 'Müzik' }).click();
  const kayit = await page.evaluate(() => JSON.parse(localStorage.getItem('minkino-kartlar-v1')!));
  expect(kayit.yas).toBe(5);
  expect(kayit.ayarlar.muzik).toBe(false);
  expect(hatalar).toEqual([]);
});
