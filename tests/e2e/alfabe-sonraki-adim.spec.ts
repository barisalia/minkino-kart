import { test, expect } from '@playwright/test';

// Ders adımlarının "devam" düğmesi sonraki adımın adını taşır; son adımda albüm kartına gider (alfabe/src/main.ts → dersGoster).
// 19 Kasım: 4 yaşın "Yaz ve hayvanı çağır" düğmesi kısa düzenden sonra hâlâ Obur'un resmini ve "Obur'un tabağına geç"i gösteriyordu.
// Harf Atölyesi telefonda yataya kilitlidir (src/kabuk/yon.ts → YATAY_SAYFALAR); telefon projesi yatay boyda oynar.
test.beforeEach(async ({ page }, bilgi) => {
  if (bilgi.project.name === 'iphone') await page.setViewportSize({ width: 844, height: 390 });
});

for (const [yas, anahtar, adim, secici, yazi, nitelik] of [
  [4, 'minkino-alfabe-v1-yas-4', 7, '.hy-devam', 'Resimde bul bölümüne geç', 'aria-label'],
  [4, 'minkino-alfabe-v1-yas-4', 8, '.rb-next', 'Albüm kartımı gör', 'aria-label'],
  [6, 'minkino-alfabe-v1', 4, '.mik-bitir', 'Küçük harf bölümüne geç', 'metin'],
  [6, 'minkino-alfabe-v1', 8, '.rb-next', 'Albüm kartımı gör', 'aria-label'],
] as const) {
  test(yas + ' yaşta ' + adim + '. adımın devam düğmesi "' + yazi + '" der', async ({ page }) => {
    await page.addInitScript(([yas, anahtar, adim]) => {
      if (sessionStorage.getItem('sonraki-adim')) return;
      sessionStorage.setItem('sonraki-adim', '1');
      localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas }));
      localStorage.setItem(anahtar, JSON.stringify({ adimlar: { '01': adim } }));
    }, [yas, anahtar, adim] as const);
    await page.goto('./alfabe/');
    await page.locator('.at-harf[data-id="01"]').click();
    await expect(page.locator('#atolye')).toHaveAttribute('data-adim', String(adim));
    const dugme = page.locator(secici);
    if (nitelik === 'metin') await expect(dugme).toHaveText(yazi);
    else await expect(dugme).toHaveAttribute('aria-label', yazi);
    // Hayvan Çağırma'da devam düğmesinde artık resim yok, yalnız oyna simgesi.
    if (secici === '.hy-devam') await expect(dugme.locator('img')).toHaveCount(0);
  });
}
