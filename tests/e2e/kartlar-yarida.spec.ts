/**
 * Kartlar: yarıda kalan işler (Hata avı 2 bulguları).
 * - Tur ortasında albüme bakıp Geri'ye basınca tur baştan başlamaz (Kartlar ve Hafıza Oyunu).
 * - Pakete / yaşa dokunup hemen Ana ekran / Geri / Ebeveyn köşesine basınca oyun kendiliğinden açılmaz.
 * - Kaçırılan "Yeni paket açıldı!" kutlaması bir sonraki tur sonunda gösterilir.
 */
import { expect, test, type Page } from '@playwright/test';
import { hataTopla, soruDegisti, soruyuCevapla } from './yardimci';

const ekran = (proje: string, ad: string) => `tests/screens/${proje}-${ad}.png`;

async function soruCevapla(page: Page, i: number) {
  await expect(page.locator('.oyun-alan[data-tip]')).toBeVisible();
  await page.waitForTimeout(120);
  await soruyuCevapla(page);
  await soruDegisti(page, i);
}

test('Kartlar: tur ortasında albüme bakıp geri dönünce tur kaldığı yerden sürer', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./kartlar/?test=1&yas=3&tema=hayvanlar');
  await expect(page.locator('.ilerleme i')).toHaveCount(8);
  for (let i = 0; i < 3; i++) await soruCevapla(page, i);
  // dördüncü soru ekranda: albüme bakılır
  await expect(page.locator('.ilerleme i.simdi')).toHaveCount(1);
  const soru = await page.locator('.oyun-alan').getAttribute('data-tip');
  await page.getByRole('button', { name: 'Albüm' }).click();
  await expect(page.locator('.album')).toBeVisible();
  await page.getByRole('button', { name: 'Geri' }).click();
  await expect(page.locator('.oyun-alan[data-tip]')).toBeVisible();
  // ilerleme korunur: üç nokta dolu, dördüncü soru sırada (aynı tip)
  await expect(page.locator('.ilerleme i.tamam')).toHaveCount(3);
  await expect(page.locator('.ilerleme i').nth(3)).toHaveClass(/simdi/);
  await expect(page.locator('.oyun-alan')).toHaveAttribute('data-tip', soru!);
  await page.screenshot({ path: ekran(info.project.name, 'yarida-01-albumden-donus') });
  for (let i = 3; i < 8; i++) {
    await expect(page.locator('.oyun-alan[data-tip]')).toBeVisible();
    await page.waitForTimeout(120);
    await soruyuCevapla(page);
    if (i < 7) await soruDegisti(page, i);
  }
  // tur biter: 8 kartın hepsi bu turun yenisi, 3 yıldız, Taşıtlar kutlaması
  await expect(page.locator('.tur-sonu')).toBeVisible({ timeout: 8000 });
  await expect(page.locator('.buyuk-yildiz.dolu')).toHaveCount(3);
  await expect(page.locator('.album-izgara .kart.yeni')).toHaveCount(8);
  await expect(page.locator('.kutlama')).toBeVisible({ timeout: 8000 });
  await page.locator('.kutlama').click();
  expect(hatalar).toEqual([]);
});

test('Hafıza Oyunu: oyun ortasında albüme bakıp geri dönünce bulunan çiftler kalır', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./kartlar/?test=1&yas=4&ekran=hafiza&tema=hayvanlar');
  await expect(page.locator('.hafiza-oyun[data-hazir="1"]')).toBeVisible();
  const kartlar = page.locator('.ho-izgara .hafiza-kart');
  const ciftler = await kartlar.evaluateAll((els) => els.map((e) => e.getAttribute('data-cift')));
  const ikinci = ciftler.findIndex((c, i) => i > 0 && c === ciftler[0]);
  await expect(page.locator('.hafiza-oyun[data-kilit="0"]')).toBeVisible();
  await kartlar.nth(0).click();
  await kartlar.nth(ikinci).click();
  await expect(kartlar.nth(ikinci)).toHaveClass(/eslesti/);
  await expect(page.locator('.hafiza-oyun .ilerleme i.tamam')).toHaveCount(1);

  await page.getByRole('button', { name: 'Albüm' }).click();
  await expect(page.locator('.album')).toBeVisible();
  await page.getByRole('button', { name: 'Geri' }).click();
  await expect(page.locator('.hafiza-oyun[data-hazir="1"]')).toBeVisible();
  // aynı deste, bulunan çift yerinde (silik yuva), ilerleme korunur
  expect(await kartlar.evaluateAll((els) => els.map((e) => e.getAttribute('data-cift')))).toEqual(ciftler);
  await expect(page.locator('.ho-izgara .hafiza-kart.eslesti')).toHaveCount(2);
  await expect(kartlar.nth(0)).toHaveClass(/alindi/);
  await expect(page.locator('.hafiza-oyun .ilerleme i.tamam')).toHaveCount(1);
  await page.screenshot({ path: ekran(info.project.name, 'yarida-02-hafiza-donus') });

  // kalan çiftler bulununca oyun biter
  for (const c of new Set(ciftler)) {
    const [a, b] = ciftler.flatMap((x, i) => (x === c ? [i] : []));
    if (/eslesti/.test((await kartlar.nth(a).getAttribute('class')) ?? '')) continue;
    await expect(page.locator('.hafiza-oyun[data-kilit="0"]')).toBeVisible();
    await kartlar.nth(a).click();
    await kartlar.nth(b).click();
    await expect(kartlar.nth(b)).toHaveClass(/eslesti/);
  }
  await expect(page.locator('.ho-son')).toBeVisible();
  await expect(page.locator('.hafiza-oyun .album-dugme .rozet')).toHaveText(String(ciftler.length / 2));
  expect(hatalar).toEqual([]);
});

test('Pakete ya da yaşa dokunup hemen başka yere basınca oyun kendiliğinden açılmaz', async ({ page }) => {
  const hatalar = hataTopla(page);
  // paket + Ana ekran (aynı anda: "Başlıyoruz!" beklenirken)
  await page.goto('./kartlar/?test=1&yas=3&ekran=temalar');
  await expect(page.locator('.paket[data-tema="hayvanlar"]')).toBeVisible();
  await page.evaluate(() => {
    document.querySelector<HTMLElement>('.paket[data-tema="hayvanlar"]')!.click();
    document.querySelector<HTMLElement>('.temalar [aria-label="Ana ekran"]')!.click();
  });
  await page.waitForTimeout(800);
  await expect(page.locator('.ekran:not(.cikiyor)')).toHaveAttribute('data-ekran', 'acilis');
  await expect(page.locator('.oyun')).toHaveCount(0);

  // paket + Albüm
  await page.goto('./kartlar/?test=1&yas=3&ekran=temalar');
  await expect(page.locator('.paket[data-tema="hayvanlar"]')).toBeVisible();
  await page.evaluate(() => {
    document.querySelector<HTMLElement>('.paket[data-tema="hayvanlar"]')!.click();
    document.querySelector<HTMLElement>('.temalar .album-dugme')!.click();
  });
  await page.waitForTimeout(800);
  await expect(page.locator('.ekran:not(.cikiyor)')).toHaveAttribute('data-ekran', 'album');

  // paket + Ebeveyn köşesi: oyun kapının altında başlamaz; kapı kapanınca paketler yine çalışır
  await page.goto('./kartlar/?test=1&yas=3&ekran=temalar');
  await expect(page.locator('.paket[data-tema="hayvanlar"]')).toBeVisible();
  await page.evaluate(() => {
    document.querySelector<HTMLElement>('.paket[data-tema="hayvanlar"]')!.click();
    document.querySelector<HTMLElement>('.temalar [aria-label="Ebeveyn köşesi"]')!.click();
  });
  await page.waitForTimeout(800);
  await expect(page.locator('.ebeveyn-kapisi')).toBeVisible();
  await expect(page.locator('.oyun')).toHaveCount(0);
  await page.locator('.ebeveyn-kapisi').getByRole('button', { name: 'Kapat' }).click();
  await page.locator('.paket[data-tema="hayvanlar"]').click();
  await expect(page.locator('.oyun-alan')).toBeVisible();

  // yaş + Geri: açılışta kalır, paketlere çekilmez
  await page.goto('./kartlar/?test=1');
  await page.locator('.oyna-dugme').click();
  await expect(page.locator('.yas-kart')).toHaveCount(4);
  await page.evaluate(() => {
    document.querySelector<HTMLElement>('.yas-kart[data-yas="4"]')!.click();
    document.querySelector<HTMLElement>('.yas [aria-label="Geri"]')!.click();
  });
  await page.waitForTimeout(1000);
  await expect(page.locator('.ekran:not(.cikiyor)')).toHaveAttribute('data-ekran', 'acilis');
  expect(hatalar).toEqual([]);
});

test('Kaçırılan "Yeni paket açıldı!" kutlaması bir sonraki tur sonunda gösterilir', async ({ page }) => {
  const hatalar = hataTopla(page);
  // Taşıtlar 6 kartla açılmış ama kutlaması hiç gösterilmemiş (çocuk erken "Tekrar oyna"ya basmıştı)
  await page.goto('./kartlar/?test=1');
  await page.evaluate(() =>
    localStorage.setItem(
      'minkino-kartlar-v1',
      JSON.stringify({ surum: 1, yas: 3, album: ['elma', 'muz', 'cilek', 'portakal', 'uzum', 'karpuz'], enIyi: {}, toplamYildiz: 0, turSayisi: 1, kutlananTemalar: [], premium: false }),
    ),
  );
  await page.goto('./kartlar/?test=1&yas=3&tema=hayvanlar');
  for (let i = 0; i < 8; i++) {
    await expect(page.locator('.oyun-alan[data-tip]')).toBeVisible();
    await page.waitForTimeout(120);
    await soruyuCevapla(page);
    if (i < 7) await soruDegisti(page, i);
  }
  await expect(page.locator('.tur-sonu')).toBeVisible({ timeout: 8000 });
  // önce bu turda açılan Renkler (14 kart), sonra kaçırılan Taşıtlar
  await expect(page.locator('.kutlama .paket')).toHaveAttribute('data-tema', 'renkler', { timeout: 8000 });
  await page.locator('.kutlama').click();
  await expect(page.locator('.kutlama .paket')).toHaveAttribute('data-tema', 'tasitlar', { timeout: 8000 });
  await page.locator('.kutlama').click();
  await expect(page.locator('.kutlama')).toHaveCount(0);
  const kayit = await page.evaluate(() => JSON.parse(localStorage.getItem('minkino-kartlar-v1')!));
  // kayda geçti: bir kez kutlanır (sonraki turlarda yeniden çıkmaz; birim testi: tests/unit/hata-avi-2.test.ts)
  expect([...kayit.kutlananTemalar].sort()).toEqual(['renkler', 'tasitlar']);
  expect(hatalar).toEqual([]);
});
