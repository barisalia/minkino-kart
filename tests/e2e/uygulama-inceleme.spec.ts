/**
 * Mağaza inceleme kodu (Ebeveyn Köşesi → "İnceleme kodu"): doğru kodla bütün kilitler kalkar.
 * Gerçek kod teste yazılmaz: test modunda beklenen özet adresle (&inceleme-ozet=…) deneme değerinin özetine çevrilir.
 * Gerçek kod yalnız INCELEME_KODU ortam değişkeni verilirse denenir.
 */
import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

const DENEME = 'deneme-kodu-123';
const DENEME_OZETI = '82ff9fef8e32f3ef9788e3f1865c57266508b655e8fecbff08c93bf4728b7ebe';

async function kapiyiGec(page: Page) {
  const soru = page.locator('.ebeveyn-kapisi .kapi-soru');
  await expect(soru).toBeVisible();
  const toplam = (await soru.getAttribute('data-toplam'))!;
  for (const r of toplam) await page.locator('.ebeveyn-kapisi .tus', { hasText: new RegExp(`^${r}$`) }).click();
  await page.getByRole('button', { name: 'tamam' }).click();
  await expect(page.locator('.ebeveyn-kapisi')).toHaveCount(0);
}

async function koseyeGit(page: Page) {
  await page.locator('.ug-kapi').click();
  await kapiyiGec(page);
  await expect(page.locator('.ug-ayarlar')).toBeVisible();
}

test('Inceleme kodu: yanlış kod sallanır (yazı yok), doğru kod bütün içeriği açar', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto(`./?test=1&uygulama=android&inceleme-ozet=${DENEME_OZETI}`);
  await expect(page.locator('.ug-kart[data-oyun="pazar"] .mk-kilit')).toBeVisible();

  await koseyeGit(page);
  const dugme = page.getByRole('button', { name: 'İnceleme kodu' });
  await dugme.scrollIntoViewIfNeeded();
  await expect(dugme).toBeVisible();
  if (info.project.name === 'iphone') await page.screenshot({ path: 'tests/screens/inceleme-kodu-kose.png', fullPage: true });

  // pencere: metin kutusu + Tamam / Kapat; Kapat hiçbir şey açmaz
  await dugme.click();
  const pencere = page.locator('.ik-perde');
  await expect(pencere).toBeVisible();
  await expect(pencere.locator('h2')).toHaveText('İnceleme kodu');
  await pencere.getByRole('button', { name: 'Kapat' }).click();
  await expect(pencere).toHaveCount(0);

  await dugme.click();
  const girdi = pencere.getByRole('textbox', { name: 'İnceleme kodu' });
  await expect(girdi).toBeFocused();

  // yanlış kod: yumuşak sallanma, kod hakkında yazı yok, pencere açık
  await girdi.fill('yanlis-kod');
  await pencere.getByRole('button', { name: 'Tamam' }).click();
  await expect(girdi).toHaveAttribute('data-yanlis', '1');
  await expect(pencere.locator('.ik-basari')).toHaveCount(0);
  await expect(pencere).not.toContainText(/yanlış|hatalı|geçersiz/i);
  expect(await page.evaluate(() => localStorage.getItem('minkino-inceleme'))).toBeNull();

  // doğru kod (küçük harf, boşluklu da olur; Enter ile)
  await girdi.fill(`  ${DENEME}  `);
  await expect(girdi).not.toHaveClass(/hata/);
  if (info.project.name === 'iphone') await page.screenshot({ path: 'tests/screens/inceleme-kodu.png' });
  await girdi.press('Enter');
  await expect(pencere.locator('.ik-basari')).toHaveText('Tüm içerik açıldı (inceleme)');
  if (info.project.name === 'iphone') await page.screenshot({ path: 'tests/screens/inceleme-kodu-acildi.png' });
  expect(await page.evaluate(() => localStorage.getItem('minkino-inceleme'))).toBe('1');
  await pencere.getByRole('button', { name: 'Tamam' }).click();
  await expect(pencere).toHaveCount(0);
  await expect(page.locator('.ug-abone-durum')).toHaveText('Tüm içerik açıldı (inceleme)');

  // ana menü: kilit yok; sayfa yeniden açılınca (mağaza "premium yok" der) yine açık
  await page.getByRole('button', { name: 'Ana menü' }).click();
  await expect(page.locator('.ug-kart')).toHaveCount(8);
  await expect(page.locator('.mk-kilit')).toHaveCount(0);
  await page.goto('./?test=1&uygulama=android');
  await expect(page.locator('.ug-kart')).toHaveCount(8);
  await page.waitForTimeout(300);
  await expect(page.locator('.mk-kilit')).toHaveCount(0);
  await page.locator('.ug-kart[data-oyun="pazar"]').click();
  await page.waitForURL(/\/pazar\//);
  expect(hatalar).toEqual([]);
});

test('Inceleme kodu: gerçek kod (INCELEME_KODU varsa)', async ({ page }) => {
  test.skip(!process.env.INCELEME_KODU, 'INCELEME_KODU verilmedi');
  const hatalar = hataTopla(page);
  await page.goto('./?test=1&uygulama=ios');
  await expect(page.locator('.ug-kart[data-oyun="pazar"] .mk-kilit')).toBeVisible();
  await koseyeGit(page);
  await page.getByRole('button', { name: 'İnceleme kodu' }).click();
  // deneme değeri gerçek kodun yerine geçmez
  const girdi = page.getByRole('textbox', { name: 'İnceleme kodu' });
  await girdi.fill(DENEME);
  await girdi.press('Enter');
  await expect(girdi).toHaveAttribute('data-yanlis', '1');
  await girdi.fill(process.env.INCELEME_KODU!.toLowerCase());
  await girdi.press('Enter');
  await expect(page.locator('.ik-basari')).toHaveText('Tüm içerik açıldı (inceleme)');
  await page.locator('.ik-perde').getByRole('button', { name: 'Tamam' }).click();
  await page.getByRole('button', { name: 'Ana menü' }).click();
  await expect(page.locator('.mk-kilit')).toHaveCount(0);
  expect(hatalar).toEqual([]);
});
