// Açılır kitap · göl masalının kanıt sayfası (ingilizce/src/adimlar/kitap.ts): test kipinde baştan sona.
// Taslak kipinde açılır: çizimi geri dönen parçalar gelene kadar yer tutucuyla oynanır (akış ve ölçüler aynıdır).
import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

const tik = { force: true, timeout: 4000 } as const;

async function ac(page: Page) {
  await page.goto('./ingilizce/?test=1');
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: 4 })); });
  await page.goto('./ingilizce/?test=1&taslak&kitap=gol');
  await expect(page.locator('.ing-kt')).toHaveAttribute('data-asama', 'kapali');
}
const enKucuk = async (page: Page, secici: string) => { const k = (await page.locator(secici).boundingBox())!; return Math.min(k.width, k.height); };

test('açılır kitap: kapak açılır, ördek fırlar, "Yes" şakası, "No" ile dalış, kitap kapanır', async ({ page }) => {
  const hatalar = hataTopla(page);
  await ac(page);
  const kt = page.locator('.ing-kt'), bant = page.locator('.ing-kt-bant');
  // kapalı kitap: kapakta masalın adı, açılımın parçaları görünmez
  await expect(page.locator('.ing-kt-kapak-ad')).toHaveText('Kino at the Lake');
  await expect(kt).toHaveAttribute('data-acik', '0');
  expect(await enKucuk(page, '.ing-kt-kapak-dugme')).toBeGreaterThanOrEqual(64);

  await page.locator('.ing-kt-kapak-dugme').click(tik);
  await expect(kt).toHaveAttribute('data-asama', 'acik');
  await expect(kt).toHaveAttribute('data-acik', '1');
  await expect(bant).toContainText('Bubbles');
  // katmanlar kalkmış: arka katman ekranda dik duruyor, Kino ve ön çimen onun önünde
  expect((await page.locator('[data-dik="arka"]').boundingBox())!.height).toBeGreaterThan(120);
  await expect(page.locator('[data-dik]')).toHaveCount(4);
  await expect(page.locator('[data-oyuncu="kino"]')).toHaveAttribute('data-poz', 'diz');
  expect(await enKucuk(page, '.ing-kt-kabarcik')).toBeGreaterThanOrEqual(64);

  await page.locator('.ing-kt-kabarcik').click(tik);
  await expect(kt).toHaveAttribute('data-asama', 'soru');
  await expect(page.locator('.ing-kt-yarik-kutu')).toHaveClass(/ing-kt-cikti/);
  await expect(page.locator('[data-oyuncu="kino"]')).toHaveAttribute('data-poz', 'sor');
  await expect(bant).toContainText('Is this my hat?');
  // etiketler yukarıdan sarkarak iner: yerine oturunca ölçülür ve dokunulur
  for (const c of ['yes', 'no']) {
    await expect(page.locator(`.ing-kt-etiket[data-cevap="${c}"]`)).toBeInViewport({ ratio: 0.95 });
    expect(await enKucuk(page, `.ing-kt-etiket[data-cevap="${c}"]`)).toBeGreaterThanOrEqual(64);
  }

  // "Yes": ceza yok; komik karşılık, soru yinelenir
  await page.locator('.ing-kt-etiket[data-cevap="yes"]').click(tik);
  await expect(kt).toHaveAttribute('data-saka', '1');
  await expect(kt).toHaveAttribute('data-asama', 'soru');
  await expect(page.locator('[data-oyuncu="ordek"]')).toHaveAttribute('data-poz', 'cik');
  await expect(page.locator('.ing-kt-etiket[data-cevap="no"]')).toBeInViewport({ ratio: 0.95 });

  await page.locator('.ing-kt-etiket[data-cevap="no"]').click(tik);
  await expect(kt).toHaveAttribute('data-asama', 'bitti');
  await expect(bant).toContainText('banana');
  await expect(page.locator('.ing-kt-yarik-kutu')).not.toHaveClass(/ing-kt-cikti/);
  await expect(page.locator('[data-muz]')).toHaveCount(1);
  await expect(page.locator('.ing-kt-etiketler')).toBeHidden();

  // sayfa tırnağı: kitap kapanır, masal biter
  expect(await enKucuk(page, '.ing-kt-kose')).toBeGreaterThanOrEqual(64);
  await page.locator('.ing-kt-kose').click(tik);
  await expect(page.locator('.ing')).toHaveAttribute('data-adim', 'sonuc', { timeout: 8000 });
  expect(hatalar).toEqual([]);
});

test('açılır kitap: kapak parmakla sola çekilince de açılır', async ({ page }) => {
  const hatalar = hataTopla(page);
  await ac(page);
  const kt = page.locator('.ing-kt');
  const k = (await page.locator('.ing-kt-kapak-dugme').boundingBox())!;
  const x = k.x + k.width * 0.7, y = k.y + k.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 60, y, { steps: 4 });
  // çekerken kapak aralanır (henüz açılmadı)
  await expect(kt).toHaveAttribute('data-acik', 'ara');
  await page.mouse.move(x - 260, y, { steps: 6 });
  await page.mouse.up();
  await expect(kt).toHaveAttribute('data-asama', 'acik');
  await expect(kt).toHaveAttribute('data-acik', '1');
  expect(hatalar).toEqual([]);
});
