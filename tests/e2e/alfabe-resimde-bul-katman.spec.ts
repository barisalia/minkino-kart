// Resimde Bul · dokunma alanlarının üst üste bindiği yerde hangi nesne kazanır (19 Kasım 2026).
// Aranan nesne yanlış nesnenin üstünde olmalı (çiçeğin önündeki arı); resimde gerçekten aranan nesnenin önünde duran
// yanlış nesne ise veride `ustte` ile işaretli ve en üstte (ırmaktaki kano). Çocuk dokunduğu şeyin adını duyar.
import { expect, test, type Page } from '@playwright/test';

async function sahneyiAc(page: Page, harf: string) {
  await page.addInitScript((h) => {
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: 5 }));
    localStorage.setItem('minkino-alfabe-v1', JSON.stringify({ son: h, adimlar: { [h]: 8 } }));
  }, harf);
  await page.goto('./alfabe/?test=1');
  await page.locator(`.at-harf[data-id="${harf}"]`).click();
  await page.locator('.rb-hit').first().waitFor();
}

/** Haritadaki (0–100) noktada iki alanın da içinde olduğunu doğrular ve o noktada en üstteki alanın adını döner */
const ustteki = (page: Page, x: number, y: number, a: string, b: string) =>
  page.evaluate(({ x, y, a, b }) => {
    const map = document.querySelector<SVGSVGElement>('.rb-map')!;
    const alan = (ad: string) => map.querySelector<SVGPolygonElement>(`polygon[aria-label="${ad}"]`)!;
    const p = new DOMPoint(x, y);
    if (!alan(a).isPointInFill(p) || !alan(b).isPointInFill(p)) return 'nokta iki alanda değil';
    const r = map.getBoundingClientRect();
    return document.elementFromPoint(r.left + (x / 100) * r.width, r.top + (y / 100) * r.height)?.closest('.rb-hit')?.getAttribute('aria-label');
  }, { x, y, a, b });

test('aranan nesne öndeki yanlış alanın altında kalmaz: çiçeğin önündeki arıya dokununca Arı', async ({ page }) => {
  await sahneyiAc(page, '01');
  expect(await ustteki(page, 86, 82, 'Arı', 'Çiçek')).toBe('Arı');
});

test('resimde aranan nesnenin önündeki yanlış nesne üstte kalır: ırmaktaki kanoya dokununca Kano', async ({ page }) => {
  await sahneyiAc(page, '11');
  expect(await ustteki(page, 72, 79, 'Kano', 'Irmak')).toBe('Kano');
  // dokunuş sırası aynı: kanoya dokunmak yanlış sayılır, ırmak hâlâ aranır
  await page.locator('.rb-hit[aria-label="Kano"]').dispatchEvent('click');
  await expect(page.locator('.rb-stars')).toHaveAttribute('aria-label', 'İki nesne aranıyor');
});
