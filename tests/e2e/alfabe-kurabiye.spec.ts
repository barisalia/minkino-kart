import { test, expect, type Page } from '@playwright/test';

// Mino'nun Harf Kurabiyesi (alfabe/src/kurabiye.ts): Harf Albümü'nün kumanda sırasından açılan isteğe bağlı küçük oyun,
// 2–3 ve 4 yaş. Çizimler (Paket Harf-H13) gelene dek yalnız test kipinde görünür.
test.beforeEach(async ({ page }, bilgi) => {
  if (bilgi.project.name === 'iphone') await page.setViewportSize({ width: 844, height: 390 });
});
const HEPSI = Array.from({ length: 29 }, (_, i) => String(i + 1).padStart(2, '0'));

async function albumuAc(page: Page, yas: number) {
  await page.addInitScript(([biten, yas]) => {
    localStorage.setItem('minkino-abonelik-v1', JSON.stringify({ premium: true, zaman: Date.now() }));
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas }));
    const ek = yas >= 5 ? '' : yas === 4 ? '-yas-4' : '-yas-2-3';
    localStorage.setItem('minkino-alfabe-v1' + ek, JSON.stringify({ akisSurumu: 2, biten, bekleyen: [], son: '29', adimlar: {} }));
  }, [HEPSI, yas] as const);
  await page.goto('./alfabe/?test=1');
  await page.locator('.at-album-ac').click();
}

for (const [yas, tane] of [[3, 5], [4, 6]] as const) {
  test(yas + ' yaş: albümden açılır; yanlış kurabiyenin farkı parlar, üç doğru kurabiye tabağı doldurur, albüme dönülür', async ({ page }) => {
    await albumuAc(page, yas);
    await page.locator('.ka-kurabiye').click();
    const sahne = page.locator('.kb-sahne');
    await expect(sahne).toHaveAttribute('data-evre', 'sec');
    const hedef = (await sahne.getAttribute('data-hedef'))!, es = (await sahne.getAttribute('data-es'))!;
    await expect(page.locator('.kb-tane')).toHaveCount(tane);
    await expect(page.locator('.kb-tane[data-harf="' + hedef + '"]')).toHaveCount(3);
    // Yanlış kurabiye: tabağa gitmez, farkı gösterilir.
    const yanlis = page.locator('.kb-tane[data-harf="' + es + '"]').first();
    await yanlis.click();
    await expect(yanlis).toHaveClass(/kb-goster/);
    await expect(page.locator('.kb-tabakta')).toHaveCount(0);
    await expect(page.locator('.kb-durum')).toContainText('Mino ' + hedef + ' istiyor');
    // Fark ya parlayan çizgi ya da eksik işaretin kesik hayaleti olarak kurabiyenin üstünde var.
    expect(await yanlis.locator('.kb-fark, .kb-hayalet').count()).toBeGreaterThan(0);
    for (let i = 0; i < 3; i++) await page.locator('.kb-tane:not(.kb-tabakta)[data-harf="' + hedef + '"]').first().click();
    await expect(page.locator('.kb-tabakta')).toHaveCount(3);
    await expect(sahne).toHaveAttribute('data-evre', /doldu|bitti/);
    await expect(page.locator('.kb-son')).toBeVisible({ timeout: 20_000 });
    await page.locator('.kb-geri').click();
    await expect(page.locator('.ka-album')).toBeVisible();
    await expect(page.locator('.ka-kurabiye')).toBeVisible();
  });
}

test('5+ yaşta albümde kurabiye düğmesi yok', async ({ page }) => {
  await albumuAc(page, 6);
  await expect(page.locator('.ka-album')).toBeVisible();
  await expect(page.locator('.ka-kurabiye')).toHaveCount(0);
});

test('sahne ekrana sığar, kurabiyeler parmakla dokunacak boyda ve üst üste binmez', async ({ page }) => {
  await albumuAc(page, 4);
  await page.locator('.ka-kurabiye').click();
  await expect(page.locator('.kb-sahne')).toHaveAttribute('data-evre', 'sec');
  const olcu = await page.evaluate(() => {
    const s = document.querySelector('.kb-sahne')!.getBoundingClientRect();
    const kutular = [...document.querySelectorAll('.kb-tane')].map(e => e.getBoundingClientRect());
    const disarida = kutular.filter(r => r.left < s.left || r.right > s.right || r.top < s.top || r.bottom > s.bottom).length;
    let carpisan = 0;
    kutular.forEach((a, i) => kutular.slice(i + 1).forEach(b => { if (a.left < b.right - 2 && b.left < a.right - 2 && a.top < b.bottom - 2 && b.top < a.bottom - 2) carpisan++; }));
    return { disarida, carpisan, enDar: Math.min(...kutular.map(r => r.width)), kayar: document.documentElement.scrollHeight > innerHeight + 1 };
  });
  expect(olcu.disarida).toBe(0);
  expect(olcu.carpisan).toBe(0);
  expect(olcu.enDar).toBeGreaterThanOrEqual(44);
  expect(olcu.kayar).toBe(false);
});
