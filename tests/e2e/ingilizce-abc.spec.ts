// Polly's ABC: ana ekrandan açılır; 5+ yaşta üç harf (tanıt, bul, eşleştir), 2–3 yaşta yalnız tanıtım. Test kipi.
import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

test.use({ viewport: { width: 844, height: 390 }, isMobile: false, hasTouch: true });
const tik = { force: true, timeout: 4000 } as const;
const iz = (p: Page) => p.evaluate(() => (window as unknown as { __abc?: string[] }).__abc ?? []);

async function ac(page: Page, yas: number) {
  await page.goto('./ingilizce/?test=1');
  await page.evaluate((y) => { localStorage.clear(); localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: y })); }, yas);
  await page.goto('./ingilizce/?test=1');
  await page.locator('.ing-abc-giris').click(tik);
  await expect(page.locator('.ing-abc-pano')).toBeVisible();
}

test('5+ yaş: üç harf tanıtılır, sesle başlayan resim bulunur, küçük harf eşleşir; yanlış seçim kilitlemez', async ({ page }) => {
  const hatalar = hataTopla(page);
  await ac(page, 6);
  const pano = page.locator('.ing-abc-pano');
  let yanlisYapildi = false;
  for (let k = 0; k < 6; k++) {
    await expect(pano).toHaveAttribute('data-bekliyor', 'true', { timeout: 15000 });
    const son = (await iz(page)).at(-1)!, [evre, harf] = son.split(' ');
    if (!yanlisYapildi) {
      const baska = (await pano.locator('[data-harf]').evaluateAll((l) => l.map((x) => (x as HTMLElement).dataset.harf!))).find((x) => x !== harf)!;
      await pano.locator(`[data-harf="${baska}"]`).click(tik);
      // Polly "No" der, dokunulanın adını ve soruyu yineler; sonra yeniden dokunulabilir
      await expect(pano).toHaveAttribute('data-bekliyor', 'true', { timeout: 15000 });
      yanlisYapildi = true;
      expect((await iz(page)).at(-1)).toBe(son); // yanlış seçim ilerletmez
    }
    await pano.locator(`[data-harf="${harf}"]`).click(tik);
    await expect.poll(async () => (await iz(page)).at(-1), { timeout: 15000 }).not.toBe(son);
    expect(['bul', 'eslestir']).toContain(evre);
  }
  await expect(pano).toHaveAttribute('data-evre', 'bitti', { timeout: 15000 });
  expect(await iz(page)).toEqual(['tanit a', 'bul a', 'eslestir a', 'tanit b', 'bul b', 'eslestir b', 'tanit c', 'bul c', 'eslestir c', 'bitti']);
  // kaldığı yer kaydedildi: sonraki oturum D ile başlar
  await page.getByRole('button', { name: 'Sonraki harfler' }).click(tik);
  await expect.poll(async () => (await iz(page)).includes('tanit d'), { timeout: 15000 }).toBe(true);
  expect(hatalar).toEqual([]);
});

test('2–3 yaş: yalnız harf, ses ve resim (seçim yok)', async ({ page }) => {
  const hatalar = hataTopla(page);
  await ac(page, 3);
  await expect(page.locator('.ing-abc-pano')).toHaveAttribute('data-evre', 'bitti', { timeout: 20000 });
  expect(await iz(page)).toEqual(['tanit a', 'tanit b', 'tanit c', 'bitti']);
  expect(hatalar).toEqual([]);
});

test('Alphabet Train (5+): 26 vagon A→Z soldan sağa, hepsine dokununca tren çıkar; üç eksik vagon bulunur', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./ingilizce/?test=1');
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: 6 })); });
  await page.goto('./ingilizce/?test=1&ekran=abc&tren=1');
  const vagonlar = page.locator('.ing-tren-dugme');
  await expect(vagonlar).toHaveCount(26);
  expect(await vagonlar.evaluateAll((l) => l.map((x) => (x as HTMLElement).dataset.harf).join(''))).toBe('abcdefghijklmnopqrstuvwxyz');
  for (const h of 'abcdefghijklmnopqrstuvwxyz') await page.locator(`.ing-tren-dugme[data-harf="${h}"]`).click(tik);
  const tren = () => page.evaluate(() => (window as unknown as { __tren?: string[] }).__tren ?? []);
  for (let k = 0; k < 3; k++) {
    await expect.poll(async () => (await tren()).filter((x) => x.startsWith('eksik')).length, { timeout: 15000 }).toBeGreaterThan(k);
    const eksik = (await tren()).filter((x) => x.startsWith('eksik')).at(-1)!.split(' ')[1];
    await expect(page.locator('.ing-tren-secimler')).toHaveAttribute('data-kilit', 'false', { timeout: 15000 });
    await page.locator(`.ing-tren-secim[data-harf="${eksik}"]`).click(tik);
  }
  await expect.poll(tren, { timeout: 15000 }).toContain('bitti');
  expect((await tren()).filter((x) => x.startsWith('vagon'))).toHaveLength(26);
  expect(hatalar).toEqual([]);
});
