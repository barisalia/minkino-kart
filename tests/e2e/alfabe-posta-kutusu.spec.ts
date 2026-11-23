import { test, expect, type Page } from '@playwright/test';

// "Dede'nin Posta Kutusu" (alfabe/src/posta-kutusu.ts): Hece Oyunu'nda Köprü'den sonra dördüncü durak, yalnız 5+ yaş.
// Çizimler (Paket Harf-H10) gelene dek yalnız test kipinde görünür.
test.beforeEach(async ({ page }, bilgi) => {
  if (bilgi.project.name === 'iphone') await page.setViewportSize({ width: 844, height: 390 });
});
const HEPSI = Array.from({ length: 29 }, (_, i) => String(i + 1).padStart(2, '0'));

async function menuyuAc(page: Page, yas = 6) {
  await page.addInitScript(([biten, yas]) => {
    localStorage.setItem('minkino-abonelik-v1', JSON.stringify({ premium: true, zaman: Date.now() }));
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas }));
    const ek = yas >= 5 ? '' : yas === 4 ? '-yas-4' : '-yas-2-3';
    localStorage.setItem('minkino-alfabe-v1' + ek, JSON.stringify({ akisSurumu: 2, biten, bekleyen: [], son: '29', adimlar: {} }));
  }, [HEPSI, yas] as const);
  await page.goto('./alfabe/?test=1');
  await page.locator('.at-hece-ac').click();
}

/** Zarfın harflerini sırayla yapıştırır; zarf kutuya gidip sürpriz kart çıkana dek bekler. */
async function zarfiDoldur(page: Page) {
  const sahne = page.locator('.pk-sahne');
  await expect(sahne).toHaveAttribute('data-evre', 'diz', { timeout: 20_000 });
  const id = await sahne.getAttribute('data-sozcuk');
  const harfler = (await sahne.getAttribute('data-harfler'))!.split(' ');
  for (const h of harfler) await page.locator('.pk-pul:not(.pk-yapisti)[data-harf="' + h + '"]').first().click();
  await expect(sahne).toHaveAttribute('data-evre', 'gonder');
  // Sıradaki zarf (başka sözcük) ya da son ekran gelene dek bekle; "vardi" yarım saniye sürer, kaçırılabilir.
  await expect.poll(async () => (await sahne.getAttribute('data-evre')) === 'bitti' || (await sahne.getAttribute('data-sozcuk')) !== id,
    { timeout: 30_000 }).toBe(true);
  return harfler;
}

test('menüde dördüncü durak; yanlış pul yuvaya oturmaz, sırayla dolan zarf kutuya gider, 3 zarfta biter', async ({ page }) => {
  await menuyuAc(page);
  const kartlar = page.locator('.hm-menu > [data-dal]');
  await expect(kartlar).toHaveCount(4);
  await expect(kartlar.nth(3)).toHaveAttribute('data-dal', 'posta');
  await kartlar.nth(3).click();
  const sahne = page.locator('.pk-sahne');
  await expect(sahne).toHaveAttribute('data-evre', 'diz', { timeout: 20_000 });

  // Çeldirici pul: geri kayar, Ceren sözcüğü yeniden okur, ceza yok.
  const harfler = (await sahne.getAttribute('data-harfler'))!.split(' ');
  const pullar = await page.locator('.pk-pul').evaluateAll(l => l.map(x => (x as HTMLElement).dataset.harf!));
  expect(pullar.length).toBe(harfler.length + 1);
  const yanlis = pullar.find(h => !harfler.includes(h))!;
  await page.locator('.pk-pul[data-harf="' + yanlis + '"]').click();
  await expect(page.locator('.pk-durum')).toContainText('Sözcüğü dinle');
  await expect(page.locator('.pk-yapisti')).toHaveCount(0);
  await expect(sahne).toHaveAttribute('data-evre', 'diz');

  const gorulen = new Set<string>();
  for (let i = 0; i < 3; i++) {
    await expect(sahne).toHaveAttribute('data-evre', 'diz', { timeout: 30_000 });
    gorulen.add((await sahne.getAttribute('data-sozcuk'))!);
    const h = await zarfiDoldur(page);
    expect(h.length).toBeGreaterThanOrEqual(2);
    expect(h.length).toBeLessThanOrEqual(4);
  }
  expect(gorulen.size).toBe(3);
  await expect(page.locator('.pk-son')).toBeVisible({ timeout: 30_000 });
  await expect(sahne).toHaveAttribute('data-evre', 'bitti');
  // Mino'nun üç kartı sonda yan yana.
  await expect(page.locator('.pk-son-kartlar img')).toHaveCount(3);

  await page.locator('.at-geri').click();
  await expect(page.locator('.hm-menu [data-dal=posta]')).toBeVisible();
});

test('4 yaşta posta kutusu yok (durak 5+)', async ({ page }) => {
  await menuyuAc(page, 4);
  await expect(page.locator('.hm-menu > [data-dal]')).toHaveCount(3);
  await expect(page.locator('[data-dal=posta]')).toHaveCount(0);
});

test('sahne ekrana sığar; pullar parmakla dokunacak boyda', async ({ page }) => {
  await menuyuAc(page);
  await page.locator('[data-dal=posta]').click();
  await expect(page.locator('.pk-sahne')).toHaveAttribute('data-evre', 'diz', { timeout: 20_000 });
  const olcu = await page.evaluate(() => {
    const s = document.querySelector('.pk-sahne')!.getBoundingClientRect();
    const disarida = [...document.querySelectorAll('.pk-pul,.pk-yuva,.pk-zarf,.pk-dinle,.pk-kutu,.pk-dede')].filter(e => {
      const r = e.getBoundingClientRect();
      // Görünmeyen öğe sayılmaz: telefonda sahnedeki küçük dinle düğmesi gizlenir, büyüğü sağ panodadır (yan-pano.ts).
      return r.width > 0 && (r.left < s.left - 1 || r.right > s.right + 1 || r.top < s.top - 1 || r.bottom > s.bottom + 1);
    }).length;
    const enDar = Math.min(...[...document.querySelectorAll('.pk-pul')].map(e => e.getBoundingClientRect().width));
    return { disarida, sayfaKayar: document.documentElement.scrollHeight > innerHeight + 1, enDar };
  });
  expect(olcu.disarida).toBe(0);
  expect(olcu.sayfaKayar).toBe(false);
  expect(olcu.enDar).toBeGreaterThanOrEqual(44);
});
