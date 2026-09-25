import { existsSync } from 'node:fs';
import { chromium as pw, expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';
import { alkis, sessiz, ton, ufleme, wav } from './ses-yardimci';

const CHROMIUM = '/opt/pw-browsers/chromium';
/** Sahte mikrofonu verilen dosyayı "söyleyen" bir tarayıcıda test sayfasını açar */
async function mikrofonla(dosya: string, test: string, fn: (page: Page) => Promise<void>) {
  const b = await pw.launch({
    ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}),
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-audio-capture=${dosya}`, '--autoplay-policy=no-user-gesture-required'],
  });
  try {
    const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, baseURL: 'http://localhost:4173/', permissions: ['microphone'] });
    const page = await c.newPage();
    const hatalar = hataTopla(page);
    await page.goto('./ses-testi/');
    await page.getByRole('button', { name: 'Mikrofonu aç' }).click();
    await expect(page.locator('.st-durum.hazir')).toBeVisible({ timeout: 8000 });
    await page.locator(`[data-test="${test}"]`).click();
    await fn(page);
    expect(hatalar).toEqual([]);
  } finally {
    await b.close();
  }
}

test('Mikrofon testi: 3 alkışı sayar', async ({}, info) => {
  test.skip(info.project.name !== 'iphone', 'bir kez yeter');
  await mikrofonla(wav('alkis', sessiz(2.2), alkis(1), sessiz(0.38), alkis(2), sessiz(0.38), alkis(3), sessiz(4)), 'alkis', async (page) => {
    await expect(page.locator('.st-panel .st-sonuc')).toContainText('3 alkış', { timeout: 10000 });
    await page.screenshot({ path: 'tests/screens/iphone-50-ses-testi-alkis.png', fullPage: true });
  });
});

test('Mikrofon testi: üflemeyi algılar, mum söner, süreyi ölçer', async ({}, info) => {
  test.skip(info.project.name !== 'iphone', 'bir kez yeter');
  await mikrofonla(wav('ufleme', sessiz(2.2), ufleme(1.6), sessiz(4)), 'ufleme', async (page) => {
    await expect(page.locator('.st-mum.sondu')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.st-panel .st-sonuc')).toContainText('saniye', { timeout: 10000 });
    await page.screenshot({ path: 'tests/screens/iphone-51-ses-testi-ufleme.png', fullPage: true });
  });
});

test('Mikrofon testi: iki kısa ses = köpek', async ({}, info) => {
  test.skip(info.project.name !== 'iphone', 'bir kez yeter');
  await mikrofonla(wav('havhav', sessiz(2.2), ton(0.22, 350), sessiz(0.25), ton(0.22, 350), sessiz(4)), 'sekil', async (page) => {
    await expect(page.locator('.st-hayvan.tanindi')).toContainText('Köpek', { timeout: 10000 });
    await page.screenshot({ path: 'tests/screens/iphone-52-ses-testi-sekil.png', fullPage: true });
  });
});
