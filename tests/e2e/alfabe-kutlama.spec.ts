import { test, expect, type Page } from '@playwright/test';

// Tamamlama kutlaması (20 Kasım 2026, alfabe/src/kutlama.ts, Astra Harf-H5): 29 harf bitince ya da Hece Evleri'nin bütün
// anahtarları toplanınca. Çizimler (assets/alfabe/odul/) gelene kadar uygulamada görünmez; test kipinde yer tutucularla oynanır.
test.beforeEach(async ({ page }, bilgi) => {
  if (bilgi.project.name === 'iphone') await page.setViewportSize({ width: 844, height: 390 });
});
const HEPSI = Array.from({ length: 29 }, (_, i) => String(i + 1).padStart(2, '0'));

async function kur(page: Page, bekleyen: string[]) {
  await page.addInitScript(([hepsi, bekleyen]) => {
    if (sessionStorage.getItem('kutlama')) return;
    sessionStorage.setItem('kutlama', '1');
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: 6 }));
    localStorage.setItem('minkino-alfabe-v1', JSON.stringify({ akisSurumu: 2, biten: hepsi, bekleyen, son: '29', adimlar: {} }));
  }, [HEPSI, bekleyen] as const);
}
async function sonKartiYapistir(page: Page, adres: string) {
  await page.goto(adres);
  await page.locator('.at-harf[data-id="29"]').click();
  await expect(page.locator('.ka-son h1')).toBeVisible();
  await page.locator('.ka-cikartma').click();
  await expect(page.locator('.ka-son h1')).toHaveText('29 harfi de tamamladın!');
}

test('çizimler gelmeden kutlama uygulamada görünmez', async ({ page }) => {
  await kur(page, ['29']);
  await sonKartiYapistir(page, './alfabe/');
  await page.waitForTimeout(3200);
  await expect(page.locator('.ku-sahne')).toHaveCount(0);
});

test('test kipinde 29. harfin kartı yapışınca kutlama açılır: harfler panoya dizilir, sertifika gelir, albüme dönülür', async ({ page }) => {
  await kur(page, ['29']);
  await sonKartiYapistir(page, './alfabe/?test=1');
  const sahne = page.locator('.ku-sahne');
  await expect(sahne).toBeVisible({ timeout: 5000 });
  await expect(sahne.locator('.ku-pano .ku-parca')).toHaveCount(29);
  await expect(sahne.locator('.ku-pano .ku-parca svg.ka-yazi')).toHaveCount(29);
  await expect(sahne.locator('.ku-belge')).toBeVisible({ timeout: 12_000 });
  await expect(sahne.locator('.ku-yazi strong')).toHaveText('29 harfi öğrendim!');
  await sahne.getByRole('button', { name: 'Albümüme dön' }).click();
  await expect(sahne).toHaveCount(0);
  await expect(page.locator('.ka-album')).toBeVisible();
});

test('test kipinde Hece Evleri kutlaması: 20 anahtarın harfi panoya dizilir, sertifika gelir', async ({ page }) => {
  await kur(page, []);
  await page.goto('./alfabe/?test=1&kutlama=anahtarlar');
  const sahne = page.locator('.ku-sahne.ku-anahtarlar');
  await expect(sahne).toBeVisible();
  await expect(sahne.locator('.ku-pano .ku-parca')).toHaveCount(20);
  await expect(sahne.locator('.ku-belge')).toBeVisible({ timeout: 12_000 });
  await expect(sahne.locator('.ku-yazi strong')).toHaveText('Bütün hece anahtarlarını topladım!');
  await sahne.getByRole('button', { name: 'Harflere dön' }).click();
  await expect(page.locator('.at-harfler')).toBeVisible();
});

test('az hareket ayarında sertifika hemen görünür', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await kur(page, []);
  await page.goto('./alfabe/?test=1&kutlama=harfler');
  await expect(page.locator('.ku-belge')).toBeVisible();
  await expect(page.locator('.ku-konfeti')).toHaveCount(0);
});
