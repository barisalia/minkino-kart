import { test, expect, type Page } from '@playwright/test';

// "Lokum'un Hece Köprüsü" (alfabe/src/hece-koprusu.ts): Hece Oyunu'nda Trambolin ve Pano'dan sonra üçüncü durak.
// Çizimler (Paket Harf-H9) gelene dek yalnız test kipinde görünür; ?havuz=1 resmi gelmemiş havuz sözcüklerini de açar.
test.beforeEach(async ({ page }, bilgi) => {
  if (bilgi.project.name === 'iphone') await page.setViewportSize({ width: 844, height: 390 });
});
const HEPSI = Array.from({ length: 29 }, (_, i) => String(i + 1).padStart(2, '0'));

async function kopruyuAc(page: Page, yas = 6) {
  await page.addInitScript(([biten, yas]) => {
    localStorage.setItem('minkino-abonelik-v1', JSON.stringify({ premium: true, zaman: Date.now() }));
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas }));
    const ek = yas >= 5 ? '' : yas === 4 ? '-yas-4' : '-yas-2-3';
    localStorage.setItem('minkino-alfabe-v1' + ek, JSON.stringify({ akisSurumu: 2, biten, bekleyen: [], son: '29', adimlar: {} }));
  }, [HEPSI, yas] as const);
  await page.goto('./alfabe/?test=1&havuz=1');
  await page.locator('.at-hece-ac').click();
}

/** Sahnedeki sözcüğün hecelerini sırayla suya koyar ve Lokum'un karşıya varmasını bekler. */
async function sozcuguDiz(page: Page) {
  const sahne = page.locator('.hk-sahne');
  await expect(sahne).toHaveAttribute('data-evre', 'diz', { timeout: 20_000 });
  const heceler = (await sahne.getAttribute('data-heceler'))!.split(' ');
  for (const h of heceler) await page.locator('.hk-tas:not(.hk-suda)[data-hece="' + h + '"]').first().click();
  await expect(sahne).toHaveAttribute('data-evre', /gecis|vardi/);
  await expect(sahne).toHaveAttribute('data-evre', /vardi|diz|bitti/, { timeout: 20_000 });
  return heceler;
}

test('menüde üçüncü durak; yanlış taş sallanır ve suya girmez, doğru sırayla Lokum karşıya geçer; 3 sözcükte biter', async ({ page }) => {
  await kopruyuAc(page);
  const kartlar = page.locator('.hm-menu > [data-dal]');
  // 5+ yaşta dördüncü durak (Dede'nin Posta Kutusu) da var; köprü hep üçüncü.
  await expect(kartlar.nth(2)).toHaveAttribute('data-dal', 'kopru');
  await kartlar.nth(2).click();
  const sahne = page.locator('.hk-sahne');
  await expect(sahne).toHaveAttribute('data-evre', 'diz', { timeout: 20_000 });

  // Yanlış taş: oturumun başka sözcüğünden bir hece. Sallanır, Ceren sıradakini söyler, ceza yok.
  const heceler = (await sahne.getAttribute('data-heceler'))!.split(' ');
  const kiyida = await page.locator('.hk-tas:not(.hk-suda)').evaluateAll(l => l.map(x => (x as HTMLElement).dataset.hece!));
  const yanlis = kiyida.find(h => !heceler.includes(h));
  if (yanlis) {
    await page.locator('.hk-tas[data-hece="' + yanlis + '"]').click();
    await expect(page.locator('.hk-durum')).toHaveText('Sıradaki hece: ' + heceler[0]);
    await expect(page.locator('.hk-suda')).toHaveCount(0);
    await expect(sahne).toHaveAttribute('data-evre', 'diz');
  }

  const gorulen = new Set<string>();
  for (let i = 0; i < 3; i++) {
    // Önceki sözcük "vardi"dayken ad henüz değişmemiştir: yeni sözcük dizilmeye hazır olunca oku.
    await expect(sahne).toHaveAttribute('data-evre', 'diz', { timeout: 20_000 });
    gorulen.add((await sahne.getAttribute('data-sozcuk'))!);
    const h = await sozcuguDiz(page);
    expect(h.length).toBeGreaterThanOrEqual(2);
    expect(h.length).toBeLessThanOrEqual(3);
  }
  expect(gorulen.size).toBe(3);
  await expect(page.locator('.hk-son')).toBeVisible({ timeout: 20_000 });
  await expect(sahne).toHaveAttribute('data-evre', 'bitti');

  // Geri: Hece Oyunu menüsüne döner.
  await page.locator('.at-geri').click();
  await expect(page.locator('.hm-menu [data-dal=kopru]')).toBeVisible();
});

test('4 yaş: yalnız iki heceli sözcükler', async ({ page }) => {
  await kopruyuAc(page, 4);
  await page.locator('[data-dal=kopru]').click();
  const sahne = page.locator('.hk-sahne');
  for (let i = 0; i < 3; i++) {
    await expect(sahne).toHaveAttribute('data-evre', 'diz', { timeout: 20_000 });
    expect((await sahne.getAttribute('data-heceler'))!.split(' ')).toHaveLength(2);
    await expect(page.locator('.hk-yuva')).toHaveCount(2);
    await sozcuguDiz(page);
  }
});

test('2–3 yaşta köprü yok: Hece Oyunu doğrudan trambolinle açılır', async ({ page }) => {
  await kopruyuAc(page, 3);
  await expect(page.locator('#atolye')).toHaveAttribute('data-ekran', 'trambolin');
  await expect(page.locator('[data-dal=kopru]')).toHaveCount(0);
});

// Telefonda yatayda (geniş kap) kıyı taşları sol panodaki tepsiye geçer (yan-pano.ts, 23 Kasım): sahne dışındadır ama ekranın
// içinde ve en az 64 px; sahnedeki küçük dinle düğmesi gizlenir (yerine sağ panoda büyüğü). Görünmeyen öğe sayılmaz.
test('sahne ekrana sığar: taşlar, yuvalar ve sehpa sahnenin içinde', async ({ page }) => {
  await kopruyuAc(page);
  await page.locator('[data-dal=kopru]').click();
  await expect(page.locator('.hk-sahne')).toHaveAttribute('data-evre', 'diz', { timeout: 20_000 });
  const tasma = await page.evaluate(() => {
    const s = document.querySelector('.hk-sahne')!.getBoundingClientRect();
    const disarida = [...document.querySelectorAll('.hk-tas:not(.hk-tepside),.hk-yuva,.hk-sehpa,.hk-dinle')].filter(e => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && (r.left < s.left - 1 || r.right > s.right + 1 || r.top < s.top - 1 || r.bottom > s.bottom + 1);
    }).length;
    const tepside = [...document.querySelectorAll('.hk-tas.hk-tepside')].map(e => e.getBoundingClientRect());
    const tepsiTasar = tepside.filter(r => r.left < 0 || r.right > innerWidth || r.top < 0 || r.bottom > innerHeight || r.height < 64).length;
    return { disarida, tepsiTasar, sayfaKayar: document.documentElement.scrollHeight > innerHeight + 1, altTasar: s.bottom > innerHeight + 1 };
  });
  expect(tasma).toEqual({ disarida: 0, tepsiTasar: 0, sayfaKayar: false, altTasar: false });
});
