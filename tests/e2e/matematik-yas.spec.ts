import { expect, test } from '@playwright/test';
test.beforeEach(async ({page}) => {
  const ekran = page.viewportSize();
  if (ekran && ekran.width < 600 && ekran.height > ekran.width) await page.setViewportSize({width: ekran.height, height: ekran.width});
});

test('İlk açılışta seçilen beş yaş üç matematik yoluna bağlanır ve kaldığı turu korur', async ({ page }) => {
  test.setTimeout(120000);
  await page.goto('/?test=1&yassor=1');
  for (const [yas, baslangic, sonraki, anahtar] of [
    [2, 1, 2, 'minik-'], [4, 2, 2, 'dort-'], [5, 1, 2, ''],
  ] as const) {
    if (yas !== 2) await page.getByLabel('Yaş aralığını seç').click();
    await expect(page.locator('.ym-yas-kart')).toHaveCount(5);
    await page.getByRole('button', { name: yas + ' yaş', exact: true }).click();
    await page.getByRole('button', { name: 'Etkinlikler', exact: true }).click();
    await page.locator('[data-oyun="matematik"]').click();
    await page.getByLabel('Sayı masası', {exact: true}).click();
    for(let i=1;i<=10;i++){await page.getByLabel(i+' numaralı kutu',{exact:true}).click();await page.locator('.kule-hedef').click();}
    await expect(page.locator('.say-kumesi img')).toHaveCount(baslangic);
    await page.locator('.boncuk').nth(baslangic - 1).click();
    await page.locator('.onay').click();
    await expect.poll(() => page.evaluate(key => JSON.parse(localStorage[key]).adim, 'minkino-matematik-1-' + anahtar + 'sayi')).toBe(1);
    if (yas < 5) {
      await expect(page.locator('.pano .tabak')).toHaveCount(sonraki);
      await page.getByLabel('Çilekli piknik').click();
      await page.locator('.tabak').first().click();
      await page.reload();
      await page.getByLabel('Sayı masası', {exact: true}).click();
      await expect(page.locator('.tabak img').first()).toHaveAttribute('src', /cilek/);
    }
    await page.goto('/?test=1');
  }
  for (const [yas, etiket] of [[3,'3 yaş'],[6,'6 yaş ve üzeri']] as const) {
    await page.getByLabel('Yaş aralığını seç').click();
    await page.getByRole('button', {name:etiket,exact:true}).click();
    await expect(page.getByLabel('Yaş aralığını seç')).toHaveText(yas === 6 ? '6+' : '3');
    await page.goto('/matematik/');
    await page.getByLabel('Sayı masası', {exact: true}).click();
    if (yas === 3) await expect(page.locator('.tabak img')).toHaveCount(1);
    else await expect(page.locator('.say-kumesi img')).toHaveCount(2);
    await page.goto('/?test=1');
  }
});

for (const [yas, onek, araba, kopru, fener, tuslar] of [
  [3, 'minik-', 1, 11, 15, 2],
  [4, 'dort-', 2, 7, 15, 3],
  [6, '', 1, 8, 14, 4],
] as const) {
  test(yas + ' yaşta araba, ölçü köprüsü ve kendi fener gösterisi tamamlanır', async ({ page }) => {
    await page.addInitScript(y => localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: y })), yas);
    await page.goto('/matematik/');
    await page.evaluate(([grup, a, k, f]) => {
      for (const [oyun, adim] of [['sekil', a], ['olcu', k], ['fener', f]]) {
        localStorage.setItem('minkino-matematik-1-' + grup + oyun, JSON.stringify({ adim, yer: 0, secimler: [] }));
      }
    }, [onek, araba, kopru, fener] as const);
    await page.reload();
    await page.locator('.k1').click();
    if (yas > 3) await page.getByLabel('Gövde', { exact: true }).click();
    await page.getByLabel('Tekerlek', { exact: true }).click();
    await page.reload();
    await page.locator('.k1').click();
    await page.getByLabel('Tekerlek', { exact: true }).click();
    await expect(page.locator('.tezgah .parca')).toHaveCount(3);
    const kabin = page.locator('.blok-araba .kabin.sirada');
    const yuva = await kabin.boundingBox();
    expect(Math.abs(yuva!.width - yuva!.height)).toBeLessThan(1);
    await page.getByLabel('Gövde', { exact: true }).click();
    await expect(kabin).toBeVisible();
    await page.getByLabel('Kare kabin', { exact: true }).click();
    await expect(page.locator('.yola-cik')).toBeVisible();
    await page.locator('.ev').click();
    await page.locator('.k2').click();
    const tas = page.getByLabel('Bir ölçü taşı yerleştir');
    const adet = await page.locator('.taslar i').count();
    expect(adet).toBe(yas === 3 ? 3 : 4);
    for (let i = 0; i < adet; i++) await tas.click();
    await expect(page.locator('.kopru-tamam')).toBeVisible();
    await page.locator('.ev').click();
    await page.locator('.k3').click();
    await expect(page.locator('.parca')).toHaveCount(tuslar);
    const motif = yas < 5 ? [1, 0] : [2, 0, 1];
    for (const i of [...motif, ...motif]) await page.locator('.parca').nth(i).click();
    await expect(page.locator('.basari')).toBeVisible({ timeout: 8000 });
  });
}
