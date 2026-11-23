import { test, expect } from '@playwright/test';

for (const [yas, grup, basamak, ilkAdim] of [
  // 18 Kasım 2026: ders kısaldı (2–3 yaş 2, 4 yaş 4, 5+ yaş 6 adım; alfabe/src/main.ts → dersAdimlari)
  [2,'2-3',2,'6'], [3,'2-3',2,'6'], [4,'4',4,'5'], [5,'5+',6,'5'], [6,'5+',6,'5'],
] as const) {
  test('menüde seçilen '+yas+' yaşın harf dersi açılır', async ({page})=>{
    await page.goto('./?test=1');
    await page.locator('.ym-ekran').waitFor();
    if(!await page.locator('.ym-yas-kartlar').isVisible())await page.getByRole('button',{name:'Yaş aralığını seç'}).click();
    await page.getByRole('button',{name:yas===6?'6 yaş ve üzeri':yas+' yaş',exact:true}).click();
    await page.getByRole('button',{name:'Etkinlikler',exact:true}).click();
    await page.locator('[data-oyun="alfabe"]').click();
    await expect(page.locator('#atolye')).toHaveAttribute('data-yas',grup);
    await page.locator('.at-harf[data-id="01"]').click();
    await expect(page.locator('.at-adim i')).toHaveCount(basamak);
    await expect(page.locator('#atolye')).toHaveAttribute('data-adim',ilkAdim);
  });
}
