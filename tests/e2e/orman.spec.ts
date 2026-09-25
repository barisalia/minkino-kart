import { existsSync } from 'node:fs';
import { chromium as pw, expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';
import { alkis, sessiz, wav } from './ses-yardimci';

const BOLGELER = ['ruzgar', 'kus', 'ciftlik', 'davul', 'hece', 'dev'];

test('Uyuyan Orman: açılış → harita → bölge', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./orman/?test=1&yas=4&uyanan=ruzgar,davul');
  await expect(page.locator('.or-logo')).toBeVisible();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `tests/screens/${info.project.name}-60-orman-acilis.png` });
  await page.getByRole('button', { name: 'Oyna' }).click();
  await expect(page.locator('.or-madalyon[data-bolge]')).toHaveCount(6);
  await expect(page.locator('.or-madalyon.uyanik')).toHaveCount(2);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `tests/screens/${info.project.name}-61-orman-harita.png` });
  await page.locator('.or-madalyon[data-bolge="kus"]').click();
  await expect(page.locator('.or-bolge[data-bolge="kus"] .or-sahne > *').first()).toBeVisible();
  expect(hatalar).toEqual([]);
});

test('Uyuyan Orman: her bölge her yaşta açılır (ilk görev)', async ({ page }, info) => {
  test.skip(info.project.name !== 'iphone', 'bir kez yeter');
  const hatalar = hataTopla(page);
  for (const b of BOLGELER) {
    for (const y of [3, 4, 5, 6]) {
      await page.goto(`./orman/?test=1&ekran=bolge&bolge=${b}&yas=${y}`);
      await expect(page.locator('.or-sahne > *').first()).toBeVisible();
      await page.waitForTimeout(250);
      if (y === 4 || y === 6) await page.screenshot({ path: `tests/screens/iphone-7${BOLGELER.indexOf(b)}-orman-${b}-${y}.png` });
    }
  }
  expect(hatalar).toEqual([]);
});

/** sahnenin ortasına basılı tut */
async function tut(page: Page, ms: number) {
  const k = (await page.locator('.or-sahne').boundingBox())!;
  await page.mouse.move(k.x + k.width / 2, k.y + k.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(ms);
  await page.mouse.up();
}

test('Uyuyan Orman: Rüzgar Tepesi dokunarak baştan sona (3 yaş) ve bölge uyanır', async ({ page }, info) => {
  test.skip(info.project.name !== 'iphone', 'bir kez yeter');
  const hatalar = hataTopla(page);
  await page.goto('./orman/?test=1&ekran=bolge&bolge=ruzgar&yas=3&uyanan=');
  await expect(page.locator('.or-mum')).toBeVisible();
  await page.waitForTimeout(150);
  await tut(page, 700);
  await expect(page.locator('.or-mum.sondu')).toBeVisible();
  await expect(page.locator('.or-karahindiba')).toBeVisible({ timeout: 8000 });
  await page.waitForTimeout(150);
  await tut(page, 1300);
  await page.screenshot({ path: 'tests/screens/iphone-80-orman-karahindiba.png' });
  await tut(page, 1500);
  await expect(page.locator('.or-balon')).toBeVisible({ timeout: 8000 });
  await page.waitForTimeout(150);
  await tut(page, 2800);
  await expect(page.locator('.or-bitis')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('.or-ev.uyandi')).toBeVisible();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'tests/screens/iphone-81-orman-uyandi.png' });
  const uyanan = await page.evaluate(() => (window as unknown as { __orman: { kayit: { uyanan: string[] } } }).__orman.kayit.uyanan);
  expect(uyanan).toContain('ruzgar');
  expect(hatalar).toEqual([]);
});

test('Uyuyan Orman: ek modlar ve büyükler açılır', async ({ page }, info) => {
  test.skip(info.project.name !== 'iphone', 'bir kez yeter');
  const hatalar = hataTopla(page);
  for (const [e, n] of [['nefes', 90], ['papagan', 91], ['birlikte', 92], ['senlik', 93], ['buyukler', 94], ['izin', 95]] as const) {
    await page.goto(`./orman/?test=1&ekran=${e}&yas=4`);
    await page.waitForTimeout(700);
    await page.screenshot({ path: `tests/screens/iphone-${n}-orman-${e}.png` });
  }
  expect(hatalar).toEqual([]);
});

const CHROMIUM = '/opt/pw-browsers/chromium';
test('Uyuyan Orman: sahte mikrofonla alkış → havai fişek (Davul Köyü, 3 yaş)', async ({}, info) => {
  test.skip(info.project.name !== 'iphone', 'bir kez yeter');
  const dosya = wav('orman-alkis', sessiz(2), alkis(1), sessiz(0.5), alkis(2), sessiz(0.5), alkis(3), sessiz(1.5));
  const b = await pw.launch({
    ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}),
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-audio-capture=${dosya}`, '--autoplay-policy=no-user-gesture-required'],
  });
  try {
    const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, baseURL: 'http://localhost:4173/', permissions: ['microphone'] });
    const page = await c.newPage();
    const hatalar = hataTopla(page);
    await page.goto('./orman/?test=1&ekran=bolge&bolge=davul&yas=3&mik=1');
    await page.getByRole('button', { name: 'Mikrofonu aç' }).click();
    await expect(page.locator('.or-fisek-sayac')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('.or-kulak[data-durum="dinliyor"]')).toBeVisible();
    await expect(page.locator('.or-adimlar i.dolu')).toHaveCount(1, { timeout: 15000 });
    await page.screenshot({ path: 'tests/screens/iphone-82-orman-davul-mikrofon.png' });
    expect(hatalar).toEqual([]);
  } finally {
    await b.close();
  }
});
