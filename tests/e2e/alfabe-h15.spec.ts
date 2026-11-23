import { test, expect, type Page } from '@playwright/test';

// Paket Harf-H15 (22 Kasım 2026, alfabe/src/h14-cizimler.ts):
//  · Keşfet → Ses Balonları (ses-balonlari.ts, 4 ve 5+ yaş): farklı sesle başlayanın balonu patlatılır.
//  · 2–3 yaş harf boyaması → Harf uyanır (harf-boyama.ts → harfiUyandir): boyanan harfin yüzü açılır.
// Astra'nın çizimleri gelene kadar eski görünüş sürer. ?h15=1 test kipinde yer tutucularla açar.
test.beforeEach(async ({ page }, bilgi) => {
  if (bilgi.project.name === 'iphone') await page.setViewportSize({ width: 844, height: 390 });
});

async function adimiAc(page: Page, yas: number, adim: number, harf: string, sorgu: string) {
  const anahtar = yas <= 3 ? 'minkino-alfabe-v1-yas-2-3' : yas === 4 ? 'minkino-alfabe-v1-yas-4' : 'minkino-alfabe-v1';
  await page.addInitScript(([yas, anahtar, adim, harf]) => {
    if (sessionStorage.getItem('h15')) return;
    sessionStorage.setItem('h15', '1');
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas }));
    localStorage.setItem(anahtar as string, JSON.stringify({ adimlar: { [harf as string]: adim } }));
  }, [yas, anahtar, adim, harf] as const);
  await page.goto('./alfabe/?test=1' + sorgu);
  await page.locator(`.at-harf[data-id="${harf}"]`).click();
}

/** Harfin bütün yollarını fırçayla boyar (alfabe-boyama-hece.spec.ts ile aynı yol) */
async function harfiBoya(page: Page) {
  const yollar = page.locator('.boy-iz');
  for (let i = 0; i < await yollar.count(); i++) {
    await yollar.nth(i).evaluate((el) => {
      const path = el as unknown as SVGPathElement, svg = document.querySelector<SVGSVGElement>('.boy-harf')!;
      const matrix = path.getScreenCTM()!, uzunluk = path.getTotalLength();
      svg.setPointerCapture = () => {};
      const firca = (tip: string, d: number) => { const pt = path.getPointAtLength(d).matrixTransform(matrix); svg.dispatchEvent(new PointerEvent(tip, { pointerType: 'mouse', pointerId: 1, button: 0, clientX: pt.x, clientY: pt.y })); };
      firca('pointerdown', 0);
      for (let d = 2; d < uzunluk; d += 2) firca('pointermove', d);
      firca('pointerup', uzunluk);
    });
  }
}

test('Ses Balonları kapalıyken (?h15=0) Keşfet eski iki kartıyla oynar', async ({ page }) => {
  await adimiAc(page, 4, 5, '02', '&h15=0');
  await expect(page.locator('.hf-kesif')).toBeVisible();
  await expect(page.locator('.sb-sahne')).toHaveCount(0);
});

test('Ses Balonları: üç balon; aynı sesle başlayan patlamaz, farklı başlayan patlar, ders sonraki adıma geçer', async ({ page }) => {
  await adimiAc(page, 4, 5, '02', '&h15=1');
  const sahne = page.locator('.sb-sahne');
  await expect(sahne).toBeVisible();
  await expect(page.locator('.sb-balon')).toHaveCount(3);
  await expect(page.locator('.sb-balon[data-farkli]')).toHaveCount(1);
  await expect(sahne).toHaveAttribute('data-adim', 'sec', { timeout: 30_000 });
  // aynı sesle başlayan balon: patlamaz
  await page.locator('.sb-balon:not([data-farkli])').first().click({ force: true });
  await expect(page.locator('.sb-patladi')).toHaveCount(0);
  await expect(sahne).toHaveAttribute('data-adim', 'sec');
  await page.locator('.sb-balon[data-farkli]').click({ force: true });
  await expect(page.locator('.sb-balon[data-farkli]')).toHaveClass(/sb-patladi/);
  await expect(sahne).toHaveAttribute('data-adim', 'bulundu', { timeout: 3000 });
  await expect(page.locator('.sb-ilk.sb-parla')).toHaveCount(2);
  // dersin sonraki adımı: Dinle ve söyle
  await expect(page.locator('#atolye')).toHaveAttribute('data-adim', '0', { timeout: 30_000 });
});

test('Harf yüzü kapalıyken (?h15=0) 2–3 yaş boyamasında harfin yüzü açılmaz', async ({ page }) => {
  await adimiAc(page, 3, 6, '01', '&h15=0');
  await harfiBoya(page);
  await expect(page.locator('.boy-tamam')).toBeVisible();
  await expect(page.locator('#atolye')).toHaveAttribute('data-adim', '8', { timeout: 15_000 });
  await expect(page.locator('.boy-yuz')).toHaveCount(0);
});

test('Harf uyanır: boyanan harfin gözleri ve ağzı açılır, dokununca ağız açılır, ders sonra ilerler', async ({ page }) => {
  await adimiAc(page, 3, 6, '01', '&h15=1');
  await harfiBoya(page);
  await expect(page.locator('.boy-tamam')).toBeVisible();
  await expect(page.locator('.boy-yuz')).toHaveCount(2, { timeout: 5000 });
  await expect(page.locator('.boy')).toHaveClass(/boy-uyandi/);
  const agiz = page.locator('.boy-agiz');
  const once = await agiz.getAttribute('src');
  await page.locator('.boy-kagit').click({ position: { x: 20, y: 20 } });
  await expect.poll(() => agiz.getAttribute('src')).not.toBe(once);
  await expect(page.locator('#atolye')).toHaveAttribute('data-adim', '8', { timeout: 20_000 });
});
