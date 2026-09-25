import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium as pw, expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

/** Chrome'un sahte mikrofonuna verilecek WAV (48 kHz, 16 bit, mono) */
const SR = 48000;
function rastgele(tohum: number) {
  let s = tohum >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32) * 2 - 1;
}
const sessiz = (sn: number) => {
  const r = rastgele(1);
  return Array.from({ length: Math.round(sn * SR) }, () => r() * 0.0008);
};
const alkis = (t: number) => {
  const r = rastgele(t);
  return Array.from({ length: Math.round(0.06 * SR) }, (_, i) => r() * 0.7 * Math.exp(-i / (0.012 * SR)));
};
const ufleme = (sn: number) => {
  const r = rastgele(9);
  let y = 0;
  const n = Math.round(sn * SR);
  return Array.from({ length: n }, (_, i) => {
    y = y * 0.97 + r() * 0.3;
    return Math.min(1, i / 2400, (n - i) / 2400) * 0.3 * y;
  });
};
const ton = (sn: number, f: number) => {
  const n = Math.round(sn * SR);
  let faz = 0;
  return Array.from({ length: n }, (_, i) => {
    faz += (2 * Math.PI * f) / SR;
    return Math.min(1, i / 480, (n - i) / 480) * 0.2 * (Math.sin(faz) + 0.5 * Math.sin(2 * faz) + 0.3 * Math.sin(3 * faz));
  });
};
function wav(ad: string, ...parcalar: number[][]) {
  const x = parcalar.flat();
  const b = Buffer.alloc(44 + x.length * 2);
  b.write('RIFF', 0);
  b.writeUInt32LE(36 + x.length * 2, 4);
  b.write('WAVE', 8);
  b.write('fmt ', 12);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(1, 22);
  b.writeUInt32LE(SR, 24);
  b.writeUInt32LE(SR * 2, 28);
  b.writeUInt16LE(2, 32);
  b.writeUInt16LE(16, 34);
  b.write('data', 36);
  b.writeUInt32LE(x.length * 2, 40);
  x.forEach((v, i) => b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), 44 + i * 2));
  const klasor = resolve('test-results/ses');
  mkdirSync(klasor, { recursive: true });
  const yol = resolve(klasor, `${ad}.wav`);
  writeFileSync(yol, b);
  return yol;
}

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
