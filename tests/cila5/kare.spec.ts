import { test } from '@playwright/test';
const ON = process.env.ONEK ?? 'once';
const BOY: [number, number][] = [[844, 390], [932, 430], [390, 844], [1024, 768]];
const EKR: [string, string, number, string?][] = [
  ['m-acilis', '/macera/?test=1&yas=5', 1500],
  ['m-menu', '/macera/?test=1&ekran=bolum&yas=5', 1500],
  ['m-ege', '/macera/?onizleme=1&ekran=bolum&yas=5&bolum=ege', 6000],
  ['m-banyo', '/macera/?onizleme=1&ekran=bolum&yas=5&bolum=banyo', 6000],
  ['m-elektrik', '/macera/?onizleme=1&ekran=bolum&yas=5&bolum=elektrik', 6000],
  ['m-salincak', '/macera/?onizleme=1&ekran=bolum&yas=5&bolum=salincak', 6000],
  ['p-acilis', '/pasta/?test=1&sifirla=1', 1500],
  ['p-gun', '/pasta/?test=1&sifirla=1&ekran=gun&gun=2', 2500],
  ['p-aksam', '/pasta/?test=1&sifirla=1&ekran=aksam&gun=2&kazanc=6', 2500],
  ['p-dukkan', '/pasta/?test=1&sifirla=1&ekran=aksam&gun=2&kazanc=6&jeton=30', 4000, '.ps-kumbara'],
];
const SADECE = process.env.SADECE?.split(',');
for (const [w, hh] of BOY)
  test(`${w}x${hh}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: hh });
    for (const [ad, q, bekle, tik] of EKR) {
      if (SADECE && !SADECE.includes(ad)) continue;
      await page.goto(q);
      await page.waitForTimeout(bekle);
      if (tik) { await page.locator(tik).click(); await page.waitForTimeout(9000); }
      await page.screenshot({ path: `tests/screens/cila5/${ON}-${ad}-${w}x${hh}.png` });
    }
  });

