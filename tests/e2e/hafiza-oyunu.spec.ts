import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

const ekran = (proje: string, ad: string) => `tests/screens/${proje}-${ad}.png`;

/** Açık olmayan bütün çiftleri bulur (test modunda kartın çifti data-cift ile belli). */
async function hepsiniBul(page: Page) {
  const kartlar = page.locator('.ho-izgara .hafiza-kart');
  const n = await kartlar.count();
  const ciftler = new Map<string, number[]>();
  for (let i = 0; i < n; i++) {
    const c = (await kartlar.nth(i).getAttribute('data-cift'))!;
    ciftler.set(c, [...(ciftler.get(c) ?? []), i]);
  }
  for (const [, [a, b]] of ciftler) {
    if (/eslesti/.test((await kartlar.nth(a).getAttribute('class')) ?? '')) continue;
    await expect(page.locator('.hafiza-oyun[data-kilit="0"]')).toBeVisible();
    await kartlar.nth(a).click();
    await kartlar.nth(b).click();
    await expect(kartlar.nth(b)).toHaveClass(/eslesti/);
  }
}

for (const [yas, kartSayisi] of [
  [3, 4],
  [6, 16],
] as const) {
  test(`Hafıza Oyunu ${yas} yaş: açılıştan girilir, ${kartSayisi} kart, yanlış çift kapanır, hepsi bulununca biter`, async ({ page }, info) => {
    const hatalar = hataTopla(page);
    const p = info.project.name;
    await page.goto('./kartlar/?test=1');
    await page.getByRole('button', { name: 'Hafıza Oyunu' }).click();
    // yaş henüz seçilmedi: önce yaş, sonra hafıza modunda paketler
    await page.locator(`[data-yas="${yas}"]`).click();
    await expect(page.locator('.temalar.mod-hafiza')).toBeVisible();
    await expect(page.locator('.paket')).toHaveCount(6);
    await expect(page.locator('.hafiza-serit')).toHaveCount(0);
    if (yas === 3) await page.screenshot({ path: ekran(p, 'hafiza-01-paketler') });
    await page.locator('.temalar.mod-hafiza [data-tema="hayvanlar"]').click();

    const oyun = page.locator('.hafiza-oyun[data-hazir="1"]');
    await expect(oyun).toBeVisible();
    const kartlar = page.locator('.ho-izgara .hafiza-kart');
    await expect(kartlar).toHaveCount(kartSayisi);
    await expect(page.locator('.hafiza-oyun .ilerleme i')).toHaveCount(kartSayisi / 2);
    await expect(page.locator('.hafiza-oyun .mino-svg')).toBeVisible();
    // ızgara yaşın düzeninde: 2×2 ya da 4×4 (satırdaki kart sayısı)
    const ilkSatir = await kartlar.evaluateAll((els) => {
      const y0 = els[0].getBoundingClientRect().top;
      return els.filter((e) => Math.abs(e.getBoundingClientRect().top - y0) < 2).length;
    });
    expect(ilkSatir).toBe(yas === 3 ? 2 : 4);
    await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => undefined))));
    await page.screenshot({ path: ekran(p, `hafiza-02-${yas}yas-kapali`) });

    // Yanlış çift: iki farklı kart açılır, sonra ikisi de kapanır
    const ilk = (await kartlar.nth(0).getAttribute('data-cift'))!;
    const cifler = await kartlar.evaluateAll((els) => els.map((e) => e.getAttribute('data-cift')));
    const farkli = cifler.findIndex((c) => c !== ilk);
    await kartlar.nth(0).click();
    await kartlar.nth(farkli).click();
    await expect(page.locator('.ho-izgara .hafiza-kart.acik')).toHaveCount(0);
    await expect(page.locator('.ho-izgara .hafiza-kart.eslesti')).toHaveCount(0);

    // Bir çift açıkken ekran görüntüsü
    const ikinci = cifler.findIndex((c, i) => i > 0 && c === ilk);
    await kartlar.nth(0).click();
    await kartlar.nth(ikinci).click();
    await expect(kartlar.nth(ikinci)).toHaveClass(/eslesti/);
    await expect(page.locator('.hafiza-oyun .ilerleme i.tamam')).toHaveCount(1);
    await page.screenshot({ path: ekran(p, `hafiza-03-${yas}yas-eslesti`) });

    await hepsiniBul(page);
    await expect(page.locator('.ho-izgara .hafiza-kart.eslesti')).toHaveCount(kartSayisi);
    await expect(page.locator('.ho-son')).toBeVisible();
    await expect(page.locator('.ho-son .buyuk-yildiz.dolu')).toHaveCount(3, { timeout: 5000 });
    // bulunan kartlar albüme eklendi
    const rozet = Number(await page.locator('.hafiza-oyun .album-dugme .rozet').textContent());
    expect(rozet).toBe(kartSayisi / 2);
    const kayit = await page.evaluate(() => JSON.parse(localStorage.getItem('minkino-kartlar-v1')!));
    expect(kayit.album.length).toBe(rozet);
    await page.screenshot({ path: ekran(p, `hafiza-04-${yas}yas-bitti`) });
    if (yas === 6) {
      // 8 yeni kart: Taşıtlar paketi açıldı kutlaması (dokununca kapanır)
      await expect(page.locator('.kutlama')).toBeVisible({ timeout: 8000 });
      await page.locator('.kutlama').click();
      await expect(page.locator('.kutlama')).toHaveCount(0);
    }

    // Tekrar: yeni tahta kurulur
    await page.getByRole('button', { name: 'Tekrar oyna' }).click();
    await expect(page.locator('.hafiza-oyun[data-hazir="1"] .ho-izgara .hafiza-kart')).toHaveCount(kartSayisi);
    await expect(page.locator('.ho-son')).toHaveCount(0);
    // Ev düğmesi hafıza modundaki paketlere döner
    await page.getByRole('button', { name: 'Paketlere dön' }).click();
    await expect(page.locator('.temalar.mod-hafiza')).toBeVisible();
    expect(hatalar).toEqual([]);
  });
}

test('Hafıza Oyunu: paket ekranındaki şeritten girilir', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./kartlar/?test=1&yas=5&ekran=temalar');
  await expect(page.locator('.hafiza-serit')).toBeVisible();
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => undefined))));
  await page.screenshot({ path: ekran(info.project.name, 'hafiza-00-serit') });
  await page.locator('.hafiza-serit').click();
  await expect(page.locator('.temalar.mod-hafiza')).toBeVisible();
  await page.locator('.temalar.mod-hafiza [data-tema="meyveler"]').click();
  await expect(page.locator('.hafiza-oyun[data-hazir="1"] .ho-izgara .hafiza-kart')).toHaveCount(12);
  await hepsiniBul(page);
  await expect(page.locator('.ho-son')).toBeVisible();
  expect(hatalar).toEqual([]);
});
