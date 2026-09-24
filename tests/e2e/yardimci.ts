import { expect, type Page } from '@playwright/test';

export function hataTopla(page: Page): string[] {
  const hatalar: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') hatalar.push(m.text());
  });
  page.on('pageerror', (e) => hatalar.push(String(e)));
  return hatalar;
}

/** Ekrandaki soruyu doğru cevaplar (test modunda doğru kart data-dogru ile işaretli). */
export async function soruyuCevapla(page: Page) {
  const alan = page.locator('.oyun-alan');
  const tip = await alan.getAttribute('data-tip');
  if (tip === 'HAFIZA') {
    const kartlar = page.locator('.hafiza-kart');
    await expect(kartlar.first()).toBeVisible();
    await page.waitForTimeout(80);
    const ciftler = new Map<string, number[]>();
    const n = await kartlar.count();
    for (let i = 0; i < n; i++) {
      const c = (await kartlar.nth(i).getAttribute('data-cift'))!;
      ciftler.set(c, [...(ciftler.get(c) ?? []), i]);
    }
    for (const [, [a, b]] of ciftler) {
      await kartlar.nth(a).click();
      await kartlar.nth(b).click();
      await page.waitForTimeout(60);
    }
  } else if (tip === 'ESLESTIR') {
    await suruklе(page, page.locator('[data-dogru="1"]'), page.locator('.gosterge-alan .kart').first());
  } else {
    await page.locator('[data-dogru="1"]').click();
  }
}

/** Kartı fareyle hedefe sürükler. */
export async function suruklе(page: Page, kaynak: ReturnType<Page['locator']>, hedef: ReturnType<Page['locator']>) {
  const a = (await kaynak.boundingBox())!;
  const b = (await hedef.boundingBox())!;
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) {
    await page.mouse.move(a.x + a.width / 2 + ((b.x + b.width / 2 - a.x - a.width / 2) * i) / 8, a.y + a.height / 2 + ((b.y + b.height / 2 - a.y - a.height / 2) * i) / 8);
  }
  await page.mouse.up();
}

export async function soruDegisti(page: Page, onceki: number) {
  await expect.poll(async () => page.locator('.ilerleme i.tamam').count(), { timeout: 5000 }).toBeGreaterThan(onceki);
}
