import { test, expect, type Page } from '@playwright/test';

// Paket Harf-H14 (22 Kasım 2026, alfabe/src/h14-cizimler.ts): dersin en zayıf iki adımı.
//  · Dinle ve söyle → Ses Kutusu (konusma-dersi.ts): mikrofon yoksa yazılı düğme yerine kutuya üç dokunuş.
//  · Mıknatıslar → Mıknatıslı Olta (miknatis.ts): parçalar gölde yüzen balıklarda, doğru balığa dokununca olta tutar.
// Astra'nın çizimleri gelene kadar eski görünüş sürer (ilk iki test). ?h14=1 test kipinde yer tutucularla açar.
test.beforeEach(async ({ page }, bilgi) => {
  if (bilgi.project.name === 'iphone') await page.setViewportSize({ width: 844, height: 390 });
});

async function adimiAc(page: Page, adim: number, harf: string, sorgu: string, mikrofon = false) {
  if (!mikrofon) await page.addInitScript(() => {
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', { value: async () => { throw new DOMException('İzin yok', 'NotAllowedError'); } });
  });
  await page.addInitScript(([adim, harf]) => {
    if (sessionStorage.getItem('h14')) return;
    sessionStorage.setItem('h14', '1');
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: 6 }));
    localStorage.setItem('minkino-alfabe-v1', JSON.stringify({ adimlar: { [harf]: adim } }));
  }, [adim, harf] as const);
  await page.goto('./alfabe/?test=1' + sorgu);
  await page.locator(`.at-harf[data-id="${harf}"]`).click();
}

test('Ses Kutusu kapalıyken (?h14=0) Dinle ve söyle eski cebiyle oynar (yazılı düğme dahil)', async ({ page }) => {
  await adimiAc(page, 0, '02', '&h14=0');
  await expect(page.locator('.alf-soyle')).toHaveAttribute('data-durum', 'yardim', { timeout: 20_000 });
  await expect(page.locator('.alf-soyle')).not.toHaveClass(/alf-kutulu/);
  await expect(page.locator('.alf-resim-cebi')).toHaveCount(1);
  await expect(page.locator('.alf-kutu')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Dokunarak devam et' })).toBeVisible();
});

test('Olta kapalıyken (?h14=0) Mıknatıslar eski levhasıyla oynar', async ({ page }) => {
  await adimiAc(page, 4, '02', '&h14=0');
  await expect(page.locator('.mik-ders')).toBeVisible();
  await expect(page.locator('.mik-ders')).not.toHaveClass(/mik-olta/);
  await expect(page.locator('.mik-gol-resmi, .mik-balik, .mik-olta-resmi')).toHaveCount(0);
});

test('Ses Kutusu: mikrofon yoksa yazılı düğme yok; kutuya üç dokunuşta kapak fırlar, ders sonraki adıma geçer', async ({ page }) => {
  await adimiAc(page, 0, '02', '&h14=1');
  const sahne = page.locator('.alf-soyle');
  await expect(sahne).toHaveClass(/alf-kutulu/);
  await expect(page.locator('.alf-kutu > img')).toHaveCount(4);
  await expect(page.locator('.alf-resim-cebi')).toHaveCount(0);
  await expect(sahne).toHaveAttribute('data-durum', 'dokun', { timeout: 20_000 });
  await expect(page.getByRole('button', { name: 'Dokunarak devam et' })).toBeHidden();
  const oran = () => sahne.evaluate((s) => Number(getComputedStyle(s).getPropertyValue('--ses-oran')));
  await page.locator('.alf-soyle-kart').click();
  await expect.poll(oran).toBeGreaterThan(.3);
  await expect(sahne).toHaveAttribute('data-durum', 'dokun');
  await page.locator('.alf-soyle-kart').click();
  await expect.poll(oran).toBeGreaterThan(.6);
  await page.locator('.alf-soyle-kart').click();
  await expect(sahne).toHaveAttribute('data-durum', 'dogru');
  await expect(sahne).toHaveClass(/alf-alkis/);
  await expect(page.locator('.alf-ceren-poz[data-poz="alkis"]')).toBeVisible();
  await expect(page.locator('#atolye')).toHaveAttribute('data-adim', '1', { timeout: 15_000 });
});

test('Ses Kutusu: mikrofon dinlerken Ceren dinleme pozunda', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'sahte mikrofon yalnız chromium');
  await page.context().grantPermissions(['microphone']);
  await adimiAc(page, 0, '02', '&h14=1', true);
  const sahne = page.locator('.alf-soyle');
  await expect(sahne).toHaveAttribute('data-durum', /dinliyor|dogru|yardim|dokun/, { timeout: 20_000 });
  if ((await sahne.getAttribute('data-durum')) === 'dinliyor') await expect(page.locator('.alf-ceren-poz[data-poz="dinliyor"]')).toBeVisible();
});

test('Mıknatıslı Olta: parçalar balıklarda; yanlış balık kaçar, doğrular sırayla tutulur, resim sudan çıkar', async ({ page }) => {
  await adimiAc(page, 4, '02', '&h14=1');
  const ders = page.locator('.mik-ders');
  await expect(ders).toHaveClass(/mik-olta/);
  await expect(page.locator('.mik-gol-resmi')).toHaveCount(1);
  const parcalar = await page.locator('.mik-yuva').evaluateAll((l) => l.map((y) => y.textContent ?? ''));
  await expect(page.locator('.mik-tas .mik-balik')).toHaveCount(parcalar.length);
  // yanlış balık: ilerleme yok, balık yerinde
  const yanlis = page.locator(`.mik-tas:not([data-parca="${parcalar[0]}"])`).first();
  if (await yanlis.count()) {
    await yanlis.click({ force: true });
    await expect(page.locator('.mik-yuva.mik-dolu')).toHaveCount(0);
    await expect(yanlis).toBeEnabled();
  }
  for (const [i, parca] of parcalar.entries()) {
    const balik = page.locator(`.mik-tas[data-parca="${parca}"]:not([disabled])`).first();
    await balik.click({ force: true });
    await expect(page.locator('.mik-yuva.mik-dolu')).toHaveCount(i + 1);
    await expect(page.locator('.mik-tas.mik-tutuldu')).toHaveCount(i + 1);
  }
  await expect(page.locator('.mik-okundu')).toBeAttached({ timeout: 20_000 });
  await expect(page.locator('.mik-gol-odul.mik-cikti')).toBeAttached({ timeout: 5000 });
});
