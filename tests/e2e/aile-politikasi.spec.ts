/**
 * Google Play Aileler politikası / Teacher Approved (uygulama modu web derlemesinde taklit: ?test=1&uygulama=…):
 * - Kilitli bir oyuna / bölüme / filme / durağa dokunmak abonelik ekranını ya da ebeveyn kapısını DOĞRUDAN açmaz;
 *   çocuğa kilit anı ("Bunu anne-babanla açabilirsin") gelir. Abonelik ekranı yalnız "Büyükler için" + kapıdan sonra.
 * - Dış bağlantılar (gizlilik, koşullar, e-posta, mağaza) yalnız kapının arkasında.
 * Ekran görüntüsü: tests/screens/kilit-cocuk.png (çocuğun kilitli oyuna dokununca gördüğü).
 */
import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

async function kapiyiGec(page: Page) {
  const soru = page.locator('.ebeveyn-kapisi .kapi-soru');
  await expect(soru).toBeVisible();
  for (const r of (await soru.getAttribute('data-toplam'))!) await page.locator('.ebeveyn-kapisi .tus', { hasText: new RegExp(`^${r}$`) }).click();
  await page.getByRole('button', { name: 'tamam' }).click();
  await expect(page.locator('.ebeveyn-kapisi')).toHaveCount(0);
}

/** Kilitli içeriğe dokunulduktan sonra: kilit anı açık, kapı ve abonelik ekranı YOK */
async function kilitAniGorunur(page: Page) {
  const ani = page.locator('.kl-perde');
  await expect(ani).toBeVisible();
  await expect(ani.locator('.kl-baslik')).toHaveText('Bunu anne-babanla açabilirsin');
  await expect(ani.locator('.kl-mino .mino svg')).toBeVisible();
  await expect(ani.locator('.kl-kilit')).toBeVisible();
  // çocuğa satın alma, fiyat, geri sayım yok
  await expect(ani).not.toContainText(/Premium|abone|TL|₺|ücretsiz|deneme|sn\b/i);
  await expect(page.locator('.ebeveyn-kapisi')).toHaveCount(0);
  await expect(page.locator('.ab-perde')).toHaveCount(0);
  // dış bağlantı yok
  await expect(page.locator('a[href^="http"], a[href^="mailto"]')).toHaveCount(0);
  return ani;
}

/** Görünür dış bağlantı sayısı (gizli kart bağlantıları sayılmaz) */
const disBaglantilar = (page: Page) => page.locator('a[href^="http"]:visible, a[href^="mailto"]:visible');

test('Aile politikası: kilitli oyuna dokununca abonelik ekranı kapısız asla açılmaz', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./?test=1&uygulama=android');
  await expect(page.locator('.ug-menu .mino svg')).toBeVisible();
  // ana menüde dış bağlantı yok
  await expect(disBaglantilar(page)).toHaveCount(0);

  for (const id of ['pazar', 'canlan', 'dedektif', 'pasta']) {
    await page.locator(`.ug-kart[data-oyun="${id}"]`).click();
    const ani = await kilitAniGorunur(page);
    expect(page.url(), id).not.toContain(`/${id}/`);
    if (id === 'pazar') {
      await page.waitForTimeout(900);
      if (info.project.name === 'iphone') await page.screenshot({ path: 'tests/screens/kilit-cocuk.png' });
      await page.screenshot({ path: `tests/screens/kilit-cocuk-${info.project.name}.png` });
    }
    // çocuğun büyük düğmesi: Tamam → menüye döner, hiçbir şey açılmaz
    await ani.getByRole('button', { name: 'Tamam' }).click();
    await expect(page.locator('.kl-perde')).toHaveCount(0);
    await expect(page.locator('.ebeveyn-kapisi')).toHaveCount(0);
    await expect(page.locator('.ab-perde')).toHaveCount(0);
  }

  // perdeye dokunmak ve Esc de kapatır (abonelik açılmaz)
  await page.locator('.ug-kart[data-oyun="canlan"]').click();
  await kilitAniGorunur(page);
  await page.mouse.click(5, 5);
  await expect(page.locator('.kl-perde')).toHaveCount(0);
  await page.locator('.ug-kart[data-oyun="canlan"]').click();
  await kilitAniGorunur(page);
  await page.keyboard.press('Escape');
  await expect(page.locator('.kl-perde')).toHaveCount(0);
  await expect(page.locator('.ab-perde')).toHaveCount(0);

  // "Büyükler için" → yalnız ebeveyn kapısı (abonelik ekranı yok); kapı kapatılırsa abonelik hiç açılmaz
  await page.locator('.ug-kart[data-oyun="pazar"]').click();
  await (await kilitAniGorunur(page)).getByRole('button', { name: 'Büyükler için' }).click();
  await expect(page.locator('.kl-perde')).toHaveCount(0);
  await expect(page.locator('.ebeveyn-kapisi')).toBeVisible();
  await expect(page.locator('.ab-perde')).toHaveCount(0);
  await page.locator('.ebeveyn-kapisi').getByRole('button', { name: 'Kapat' }).click();
  await expect(page.locator('.ebeveyn-kapisi')).toHaveCount(0);
  await expect(page.locator('.ab-perde')).toHaveCount(0);

  // yanlış cevapta da abonelik açılmaz
  await page.locator('.ug-kart[data-oyun="pazar"]').click();
  await page.locator('.kl-perde').getByRole('button', { name: 'Büyükler için' }).click();
  const soru = page.locator('.ebeveyn-kapisi .kapi-soru');
  const yanlis = String(Number(await soru.getAttribute('data-toplam')) + 1);
  for (const r of yanlis) await page.locator('.ebeveyn-kapisi .tus', { hasText: new RegExp(`^${r}$`) }).click();
  await page.getByRole('button', { name: 'tamam' }).click();
  await expect(page.locator('.ab-perde')).toHaveCount(0);

  // ancak kapı geçilince abonelik ekranı (ve dış bağlantılar) görünür
  await kapiyiGec(page);
  const ab = page.locator('.ab-perde');
  await expect(ab).toBeVisible();
  await expect(ab.getByRole('link', { name: /Gizlilik politikası/ })).toBeVisible();
  await expect(ab.locator('a[href^="mailto:"]')).toHaveAttribute('href', 'mailto:minkinokids@gmail.com');
  expect(hatalar).toEqual([]);
});

test('Aile politikası: macera, film ve okulda kilitli bölüm de önce kilit anı; ücretsiz içerik en üstte', async ({ page }) => {
  const hatalar = hataTopla(page);
  // Sesli Maceralar: ücretsiz bölüm (Elektrikler Kesildi!) en üstte, kilitliye dokununca kilit anı
  await page.goto('./macera/?test=1&uygulama=ios');
  const kartlar = page.locator('.mc-acilis-ic > button[class*="bolum-kart"]');
  await expect(kartlar.first()).toHaveClass(/el-bolum-kart/);
  await expect(kartlar.first().locator('.mk-kilit')).toHaveCount(0);
  await page.locator('.sl-bolum-kart').click();
  await (await kilitAniGorunur(page)).getByRole('button', { name: 'Tamam' }).click();
  await expect(page.locator('.mc-acilis')).toBeVisible();

  // Çizgi Filmler: ücretsiz film (Mino'nun Karpuzu) ilk kart
  await page.goto('./film/?test=1&uygulama=ios');
  await expect(page.locator('.fl-film-kart').first()).toHaveAttribute('data-film', 'mino-karpuz');
  await page.locator('.fl-film-kart[data-film="kino-oyuncak"]').click();
  await (await kilitAniGorunur(page)).getByRole('button', { name: 'Tamam' }).click();
  await expect(page.locator('.fl-ekran')).toHaveCount(0);

  // Okula Hazırım: ilk 3 durak açık; 4. durakta küçük kilit rozeti, dokununca kilit anı
  await page.goto('./okul/?test=1&uygulama=android&sifirla=1&yas=6&ekran=bolge');
  await expect(page.locator('.ok-durak').first()).toBeVisible();
  for (const id of ['kac-elma', 'sayi-karti', 'sepete-koy']) await expect(page.locator(`.ok-durak[data-etkinlik="${id}"] .mk-kilit`), id).toHaveCount(0);
  const kilitliDurak = page.locator('.ok-durak[data-etkinlik="hangisinde-cok"]');
  await expect(kilitliDurak.locator('.mk-kilit')).toBeVisible();
  await kilitliDurak.click();
  await kilitAniGorunur(page);
  await page.keyboard.press('Escape');
  await expect(page.locator('.kl-perde')).toHaveCount(0);
  await expect(page.locator('.ok-etkinlik')).toHaveCount(0);
  expect(hatalar).toEqual([]);
});

test('Aile politikası: dış bağlantılar yalnız ebeveyn kapısının arkasında (Ebeveyn Köşesi)', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./?test=1&uygulama=ios');
  await expect(page.locator('.ug-menu')).toBeVisible();
  await expect(disBaglantilar(page)).toHaveCount(0);
  await page.locator('.ug-kapi').click();
  // kapı açıkken de bağlantı yok
  await expect(page.locator('.ebeveyn-kapisi')).toBeVisible();
  await expect(disBaglantilar(page)).toHaveCount(0);
  await kapiyiGec(page);
  await expect(page.locator('.ug-ayarlar')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Gizlilik politikası' })).toHaveAttribute('href', /\/gizlilik\/$/);
  await expect(page.getByRole('link', { name: 'Kullanım koşulları' })).toHaveAttribute('href', /\/sartlar\/$/);
  await expect(page.getByRole('link', { name: 'Aboneliği yönet' })).toHaveAttribute('href', /apps\.apple\.com/);
  await expect(page.locator('.ug-eposta')).toHaveAttribute('href', 'mailto:minkinokids@gmail.com');
  // gizlilik sayfası: COPPA, GDPR, KVKK ve iletişim
  await page.goto('./gizlilik/');
  for (const b of ['#tr', '#en']) {
    await expect(page.locator(b)).toContainText('COPPA');
    await expect(page.locator(b)).toContainText('GDPR');
    await expect(page.locator(b)).toContainText('KVKK');
    await expect(page.locator(`${b} a[href="mailto:minkinokids@gmail.com"]`).first()).toBeVisible();
  }
  expect(hatalar).toEqual([]);
});
