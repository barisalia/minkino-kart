import { test, expect, type Page } from '@playwright/test';

// Mola anı (matematik/src/main.ts → molaGoster): oyuncağa girişten beri biten tur 2–3 yaşta her 3'te, büyüklerde her 4'te bir
// kısa kutlama ve iki seçenek. Test kipinde ?mola=1 her turdan sonra gösterir. Tur sayısı ve kayıt değişmez.
test.use({ reducedMotion: 'reduce' });
test.describe.configure({ timeout: 120000 });

async function ac(p: Page, adres = '/matematik/?test=1&mola=1') {
  const ekran = p.viewportSize();
  if (ekran && ekran.width < 600 && ekran.height > ekran.width) await p.setViewportSize({ width: ekran.height, height: ekran.width });
  await p.addInitScript(() => {
    if (sessionStorage.getItem('kuruldu')) return;
    sessionStorage.setItem('kuruldu', '1');
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: 4, ayarlar: { muzik: false } }));
    localStorage.setItem('minkino-matematik-ceren-sayilar-v1', JSON.stringify({ biten: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], simdi: 10, tanitildi: true, bitti: true }));
    // 4 yaş Sayı masası sırasının 3. adımı: Hızlı Gözler (tur 16).
    localStorage.setItem('minkino-matematik-1-dort-sayi', JSON.stringify({ adim: 2, yer: 0, secimler: [], kuleTamam: true, surum: 2 }));
  });
  await p.goto(adres);
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
}
const adim = (p: Page) => p.evaluate(() => JSON.parse(localStorage['minkino-matematik-1-dort-sayi']).adim);
async function hizliGozler(p: Page) {
  const soru = await p.locator('.hg-yildizlar i').count();
  for (let q = 0; q < soru; q++) {
    const yeni = p.locator('.pano.hizli-gozler[data-soru="' + q + '"]');
    await expect(yeni).toHaveAttribute('data-durum', 'sor', { timeout: 15000 });
    await p.getByRole('button', { name: String(await yeni.locator('.hg-nesne').count()), exact: true }).click();
  }
}

test('tur bitince mola: oyuncak, turların yıldızları, Ceren sorar; "Tezgâha dön" kaydı korur, oyuncak kaldığı turdan sürer', async ({ page: p }) => {
  await ac(p);
  await expect(p.locator('.pano.hizli-gozler')).toBeVisible();
  await hizliGozler(p);
  const mola = p.locator('.mola');
  await expect(mola).toBeVisible({ timeout: 20000 });
  await expect(mola.locator('.mola-yildizlar i')).toHaveCount(10);
  await expect(mola.locator('.mola-yildizlar i.dolu')).toHaveCount(3);
  expect(await adim(p)).toBe(3);
  const devam = mola.getByRole('button', { name: 'Devam', exact: true });
  const tezgah = mola.getByRole('button', { name: 'Tezgâha dön', exact: true });
  for (const d of [devam, tezgah]) {
    const k = (await d.boundingBox())!;
    expect(Math.min(k.width, k.height)).toBeGreaterThanOrEqual(56);
  }
  await tezgah.click();
  await expect(p.locator('#sahne')).toHaveAttribute('data-ekran', 'menu');
  expect(await adim(p)).toBe(3);
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
  await expect(p.locator('.mola')).toHaveCount(0);
  await expect(p.locator('#sahne')).not.toHaveAttribute('data-ekran', 'menu');
});

test('"Devam" sıradaki turu açar; kayıt aynı', async ({ page: p }) => {
  await ac(p);
  await hizliGozler(p);
  await expect(p.locator('.mola')).toBeVisible({ timeout: 20000 });
  await p.getByRole('button', { name: 'Devam', exact: true }).click();
  await expect(p.locator('.mola')).toHaveCount(0);
  await expect(p.locator('#sahne')).not.toHaveAttribute('data-ekran', 'menu');
  await expect(p.locator('.pano.hizli-gozler')).toHaveCount(0);
  expect(await adim(p)).toBe(3);
});

test('test kipinde mola parametresi yokken tek turdan sonra mola çıkmaz (4 yaşta dört turda bir)', async ({ page: p }) => {
  await ac(p, '/matematik/?test=1');
  await hizliGozler(p);
  await expect(p.locator('.basari')).toBeVisible({ timeout: 20000 });
  await expect(p.locator('.basari')).toHaveCount(0, { timeout: 15000 });
  await expect(p.locator('.mola')).toHaveCount(0);
});
