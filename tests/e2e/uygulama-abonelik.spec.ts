/**
 * Mağaza uygulaması modu (web derlemesinde taklit: ?test=1&uygulama=ios|android): kilit rozetleri, ebeveyn kapısı,
 * abonelik ekranı. Satın alma sahte sağlayıcıyla (src/abonelik/sahte.ts); RevenueCat'e hiç gidilmez.
 */
import { expect, test, type Page } from '@playwright/test';
import { menuOyunlari } from '../../uygulama/src/oyunlar';
import { hataTopla } from './yardimci';

/** menüdeki kart sayısı (8; Kino'nun Otobüsü bayrağı açılınca 9) */
const MENU_ADET = menuOyunlari(true).length;

const ekran = (ad: string, proje: string) => `tests/screens/${ad}-${proje}.png`;

/** Kilitli içerik: önce çocuğa kilit anı (abonelik ekranı değil); büyük "Büyükler için"e basar, kapı açılır */
async function buyuklerIcin(page: Page) {
  await expect(page.locator('.kl-perde .kl-baslik')).toHaveText('Bunu anne-babanla açabilirsin');
  await expect(page.locator('.ab-perde')).toHaveCount(0);
  await expect(page.locator('.ebeveyn-kapisi')).toHaveCount(0);
  await page.locator('.kl-perde').getByRole('button', { name: 'Büyükler için' }).click();
}

/** Ebeveyn kapısını doğru cevapla geçer (test modunda doğru toplam data-toplam'da) */
async function kapiyiGec(page: Page) {
  const soru = page.locator('.ebeveyn-kapisi .kapi-soru');
  await expect(soru).toBeVisible();
  const toplam = (await soru.getAttribute('data-toplam'))!;
  for (const r of toplam) await page.locator('.ebeveyn-kapisi .tus', { hasText: new RegExp(`^${r}$`) }).click();
  await page.getByRole('button', { name: 'tamam' }).click();
  await expect(page.locator('.ebeveyn-kapisi')).toHaveCount(0);
}

test('Uygulama: kilitli oyun → ebeveyn kapısı → abonelik ekranı → (sahte) satın alma → kilit kalkar', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  const p = info.project.name;
  await page.goto('./?test=1&uygulama=android');
  await expect(page.locator('.ug-menu .mino svg')).toBeVisible();

  // menü kartları; abonelikli oyunlarda kilit, ücretsizlerde (Kartlar) ve bölümlü oyunlarda (macera, film) yok
  await expect(page.locator('.ug-kart')).toHaveCount(MENU_ADET);
  for (const id of ['pazar', 'canlan', 'pasta', 'dedektif']) await expect(page.locator(`.ug-kart[data-oyun="${id}"] .mk-kilit`), id).toBeVisible();
  for (const id of ['kartlar', 'macera', 'film', 'giysin']) await expect(page.locator(`.ug-kart[data-oyun="${id}"] .mk-kilit`), id).toHaveCount(0);
  // ızgara boşluksuz, kartlar ekranda
  const boyut = page.viewportSize()!;
  for (const k of await page.locator('.ug-kart').all()) {
    const b = (await k.boundingBox())!;
    expect(b.x + b.width).toBeLessThanOrEqual(boyut.width + 1);
    expect(b.y + b.height).toBeLessThanOrEqual(boyut.height + 1);
  }
  await page.waitForTimeout(300);
  await page.screenshot({ path: ekran('uygulama-abonelik-menu', p) });

  // kilitli karta dokununca oyuna gitmez; çocuğa kilit anı, "Büyükler için" → ebeveyn kapısı (soru yazıyla, rakam yok)
  await page.locator('.ug-kart[data-oyun="pazar"]').click();
  await buyuklerIcin(page);
  const soru = page.locator('.ebeveyn-kapisi .kapi-soru');
  await expect(soru).toBeVisible();
  await expect(soru).toHaveText(/^[A-ZÇĞİÖŞÜ][a-zçğıöşü ]+ artı [a-zçğıöşü ]+ kaç eder\?$/);
  await expect(page.locator('.ebeveyn-kapisi h2')).toHaveText('Büyüğünü çağır!');
  expect(page.url()).not.toContain('/pazar/');
  await page.screenshot({ path: ekran('uygulama-kapi', p) });

  // yanlış cevap: kapı açılmaz, yeni soru gelir
  const ilkSoru = await soru.textContent();
  const toplam = Number(await soru.getAttribute('data-toplam'));
  for (const r of String(toplam + 1)) await page.locator('.ebeveyn-kapisi .tus', { hasText: new RegExp(`^${r}$`) }).click();
  await page.getByRole('button', { name: 'tamam' }).click();
  await expect(page.locator('.ebeveyn-kapisi')).toBeVisible();
  await expect(page.locator('.ab-perde')).toHaveCount(0);
  await expect.poll(async () => (await soru.getAttribute('data-toplam')) !== String(toplam) || (await soru.textContent()) !== ilkSoru).toBe(true);

  // doğru cevap: abonelik ekranı (Mino ve Kino üstte), fiyatlar mağazadan (sahte), deneme paketten
  await kapiyiGec(page);
  const ab = page.locator('.ab-perde');
  await expect(ab).toBeVisible();
  await expect(ab).toHaveAttribute('data-durum', 'hazir');
  // Mino ve Kino: Gemini kahraman görseli varsa o, yoksa canlı karakterler
  await expect(ab.locator('.ab-kahraman img, .ab-mino .mino svg').first()).toBeVisible();
  // başlık: asıl MINKINO logosu (resim) + Premium
  await expect(ab.getByRole('heading', { name: 'Minkino Premium' })).toBeVisible();
  await expect(ab.locator('.ab-baslik img.mk-logo')).toBeVisible();
  await expect(ab.locator('.ab-not')).toHaveText('Bu ekran büyükler içindir.');
  await expect(ab.locator('.ab-plan-aylik .ab-fiyat')).toContainText('₺99,00');
  await expect(ab.locator('.ab-plan-yillik .ab-fiyat')).toContainText('₺499,00');
  await expect(ab.locator('.ab-plan-yillik .ab-avantaj')).toHaveText('En avantajlı');
  await expect(ab.locator('.ab-plan-yillik')).toHaveAttribute('aria-checked', 'true');
  await expect(ab.locator('.ab-deneme')).toHaveText('7 gün ücretsiz dene');
  await expect(ab.locator('.ab-basla')).toHaveText('Ücretsiz denemeyi başlat');
  await expect(ab.locator('.ab-sonra')).toContainText('Deneme bitince ₺499,00 / yıl');
  await expect(ab.getByRole('button', { name: 'Satın alımları geri yükle' })).toBeEnabled();
  // Android: Google Play'in otomatik yenileme metni; gizlilik ve koşullar web sitesinde
  await expect(ab.locator('.ab-yasal').first()).toContainText('Google Play');
  await expect(ab.getByRole('link', { name: 'Gizlilik politikası' })).toHaveAttribute('href', /\/gizlilik\/$/);
  await expect(ab.getByRole('link', { name: 'Kullanım koşulları' })).toHaveAttribute('href', /\/sartlar\/$/);
  await page.waitForTimeout(400);
  await page.screenshot({ path: ekran('uygulama-abonelik-ekran', p) });
  await page.locator('.ab-kart').screenshot({ path: ekran('uygulama-abonelik-kart', p) });

  // aylık plan seçilir, (sahte) satın alma
  await ab.locator('.ab-plan-aylik').click();
  await expect(ab.locator('.ab-sonra')).toContainText('₺99,00 / ay');
  await ab.locator('.ab-basla').click();
  await expect(ab.locator('.ab-basari')).toBeVisible();
  await expect(ab.locator('.ab-basari h2')).toHaveText('Teşekkürler!');
  expect(await page.evaluate(() => (window as unknown as { __sahteSatin: { cagrilar: string[] } }).__sahteSatin.cagrilar)).toContain('satinAl:aylik');
  await page.screenshot({ path: ekran('uygulama-abonelik-basari', p) });
  await ab.getByRole('button', { name: 'Oynamaya başla' }).click();
  await expect(ab).toHaveCount(0);

  // kilitler kalktı, oyun açılır; son bilinen abonelik durumu kayıtlı (çevrimdışı için)
  await expect(page.locator('.mk-kilit')).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('minkino-abonelik-v1') ?? '{}').premium)).toBe(true);
  await page.locator('.ug-kart[data-oyun="pazar"]').click();
  await page.waitForURL(/\/pazar\//);
  expect(hatalar).toEqual([]);
});

test('Uygulama: macera ve çizgi filmlerde ücretsiz bölüm açık, diğerleri kilitli', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  const p = info.project.name;
  await page.goto('./macera/?test=1&uygulama=ios');
  await expect(page.locator('.el-bolum-kart')).toBeVisible();
  await expect(page.locator('.el-bolum-kart .mk-kilit')).toHaveCount(0);
  for (const s of ['.sl-bolum-kart', '.mc-bolum-kart', '.eg-bolum-kart', '.bn-bolum-kart']) await expect(page.locator(`${s} .mk-kilit`), s).toBeVisible();
  await page.screenshot({ path: ekran('uygulama-abonelik-macera', p), fullPage: true });
  // kilitli bölüm → kapı; kapatınca hiçbir şey açılmaz
  await page.locator('.sl-bolum-kart').click();
  await buyuklerIcin(page);
  await expect(page.locator('.ebeveyn-kapisi')).toBeVisible();
  await page.locator('.ebeveyn-kapisi').getByRole('button', { name: 'Kapat' }).click();
  await expect(page.locator('.ebeveyn-kapisi')).toHaveCount(0);
  await expect(page.locator('.ab-perde')).toHaveCount(0);
  await expect(page.locator('.mc-acilis')).toBeVisible();
  // ücretsiz bölüm açılır
  await page.locator('.el-bolum-kart').click();
  await expect(page.locator('.ebeveyn-kapisi')).toHaveCount(0);
  await expect(page.locator('.mc-acilis')).toHaveCount(0, { timeout: 10000 });

  await page.goto('./film/?test=1&uygulama=ios');
  await expect(page.locator('.fl-film-kart[data-film="mino-karpuz"]')).toBeVisible();
  await expect(page.locator('.fl-film-kart[data-film="mino-karpuz"] .mk-kilit')).toHaveCount(0);
  await expect(page.locator('.fl-film-kart[data-film="kino-oyuncak"] .mk-kilit')).toBeVisible();
  await page.screenshot({ path: ekran('uygulama-abonelik-film', p) });
  await page.locator('.fl-film-kart[data-film="kino-oyuncak"]').click();
  await buyuklerIcin(page);
  await expect(page.locator('.ebeveyn-kapisi')).toBeVisible();
  await kapiyiGec(page);
  // iOS: Apple'ın zorunlu yenileme metni
  await expect(page.locator('.ab-yasal').first()).toContainText('Apple Kimliği');
  await page.locator('.ab-perde').getByRole('button', { name: 'Kapat', exact: true }).click();
  await expect(page.locator('.ab-perde')).toHaveCount(0);
  await page.locator('.fl-film-kart[data-film="mino-karpuz"]').click();
  await expect(page.locator('.fl-ekran')).toBeVisible();
  expect(hatalar).toEqual([]);
});

test('Uygulama: vazgeçilen satın alma, geri yükleme, mağazaya ulaşılamıyor', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./?test=1&uygulama=ios&satin=iptal');
  await page.locator('.ug-kart[data-oyun="canlan"]').click();
  await buyuklerIcin(page);
  await kapiyiGec(page);
  const ab = page.locator('.ab-perde');
  await expect(ab).toHaveAttribute('data-durum', 'hazir');
  await ab.locator('.ab-basla').click();
  await expect(ab.locator('.ab-basari')).toHaveCount(0);
  await expect(ab.locator('.ab-basla')).toBeVisible();
  await ab.getByRole('button', { name: 'Satın alımları geri yükle' }).click();
  await expect(ab.locator('.ab-durum')).toHaveText('Bu hesapta etkin bir abonelik bulunamadı.');
  await page.keyboard.press('Escape');
  await expect(ab).toHaveCount(0);
  await expect(page.locator('.ug-kart[data-oyun="canlan"] .mk-kilit')).toBeVisible();

  // mağaza yanıt vermiyor: ekran çökmez, tekrar dene görünür
  await page.goto('./?test=1&uygulama=ios&magaza=yok');
  await page.locator('.ug-kart[data-oyun="canlan"]').click();
  await buyuklerIcin(page);
  await kapiyiGec(page);
  await expect(page.locator('.ab-perde')).toHaveAttribute('data-durum', 'hata');
  await expect(page.getByRole('button', { name: 'Tekrar dene' })).toBeVisible();
  // deneme hakkı bilinmiyor: deneme vaat edilmez
  await expect(page.locator('.ab-deneme')).toBeHidden();
  await expect(page.locator('.ab-basla')).toHaveText('Abone ol');

  // satın alma sağlayıcısı kurulamadı (anahtar var): kilitler duruyor, "bütün oyunlar açık" denmez, tekrar dene görünür
  await page.goto('./?test=1&uygulama=ios&kurulum=hata');
  await expect(page.locator('.ug-kart[data-oyun="canlan"] .mk-kilit')).toBeVisible();
  await page.locator('.ug-kart[data-oyun="canlan"]').click();
  await buyuklerIcin(page);
  await kapiyiGec(page);
  await expect(page.locator('.ab-perde')).toHaveAttribute('data-durum', 'hata');
  await expect(page.locator('.ab-durum')).not.toContainText('bütün oyunlar açık');
  await expect(page.getByRole('button', { name: 'Tekrar dene' })).toBeVisible();
  // açılanlar listesi kilitli içeriğin hepsini anar
  await expect(page.locator('.ab-liste')).toContainText('Dedektif Mino');
  await expect(page.locator('.ab-liste')).toContainText('Kino Ne Giysin?');

  // deneme hakkı yok (iOS: denemeyi daha önce kullanan Apple Kimliği): "Abone ol", deneme yazısı yok
  await page.goto('./?test=1&uygulama=ios&deneme=yok');
  await page.locator('.ug-kart[data-oyun="canlan"]').click();
  await buyuklerIcin(page);
  await kapiyiGec(page);
  await expect(page.locator('.ab-perde')).toHaveAttribute('data-durum', 'hazir');
  await expect(page.locator('.ab-deneme')).toBeHidden();
  await expect(page.locator('.ab-basla')).toHaveText('Abone ol');
  await expect(page.locator('.ab-sonra')).toHaveText('₺499,00 / yıl. İstediğin zaman iptal edebilirsin.');

  // önceden abone (mağaza "premium" diyor): hiç kilit yok
  await page.goto('./?test=1&uygulama=ios&premium=1');
  await expect(page.locator('.ug-kart')).toHaveCount(MENU_ADET);
  await expect(page.locator('.mk-kilit')).toHaveCount(0);
  expect(hatalar).toEqual([]);
});

test('Uygulama, anahtar yok: kilit yok, abonelik ekranı "yakında" (çökmez)', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./?test=1&uygulama=ios&anahtar=yok');
  await expect(page.locator('.ug-kart')).toHaveCount(MENU_ADET);
  await expect(page.locator('.mk-kilit')).toHaveCount(0);
  // ebeveyn köşesi → abonelik
  await page.locator('.ug-kapi').click();
  await kapiyiGec(page);
  await expect(page.locator('.ug-ayarlar')).toBeVisible();
  await page.getByRole('button', { name: 'Minkino Premium' }).click();
  const ab = page.locator('.ab-perde');
  await expect(ab).toHaveAttribute('data-durum', 'yakinda');
  await expect(ab.locator('.ab-basla')).toHaveText('Yakında');
  await expect(ab.locator('.ab-basla')).toBeDisabled();
  // mağaza yokken yedek fiyat (bilgi), deneme yazısı
  await expect(ab.locator('.ab-fiyat b').first()).toHaveText('99 TL');
  await page.waitForTimeout(300);
  await page.screenshot({ path: ekran('uygulama-abonelik-yakinda', info.project.name) });
  expect(hatalar).toEqual([]);
});

test('Web sitesi: kilit yok, abonelik yok, 8 kart', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./?test=1');
  await expect(page.locator('.ug-kart')).toHaveCount(MENU_ADET);
  await expect(page.locator('.mk-kilit')).toHaveCount(0);
  await page.locator('.ug-kapi').click();
  await kapiyiGec(page);
  await expect(page.locator('.ug-ayarlar')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Minkino Premium' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Gizlilik politikası' })).toBeVisible();
  await page.goto('./macera/?test=1');
  await expect(page.locator('.sl-bolum-kart')).toBeVisible();
  await expect(page.locator('.mk-kilit')).toHaveCount(0);
  await page.goto('./gizlilik/');
  await expect(page.locator('#tr h1')).toHaveText('Gizlilik Politikası');
  await expect(page.locator('#en h1')).toHaveText('Privacy Policy');
  await page.goto('./sartlar/');
  await expect(page.locator('#tr h1')).toHaveText('Kullanım Koşulları');
  expect(hatalar).toEqual([]);
});
