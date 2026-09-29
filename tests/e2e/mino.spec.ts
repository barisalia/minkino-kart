import { expect, test } from '@playwright/test';
import { hataTopla } from './yardimci';

test('Mino: açılıştan girilir, doğru kartı verince yeni tur başlar, dokununca tepki verir', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./?test=1');
  await page.getByRole('button', { name: 'Mino ile oyna' }).click();
  await expect(page.locator('.mino-svg')).toBeVisible();
  await expect(page.locator('.mino-tepsi .kart')).toHaveCount(3);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `tests/screens/${info.project.name}-10-mino.png` });

  // Yanlış kart: kabul edilmez
  await page.locator('.mino-tepsi .kart:not([data-dogru])').first().click();
  await expect(page.locator('.mino-tepsi [data-dogru="1"]')).toBeVisible();

  // Doğru kart → Mino yer, yeni istek gelir. Yeni tur kartları yeniden kurar: eski ızgarayı işaretleyip
  // yenisini bekleriz (aynı kart rastgele yeniden seçilse de test şaşmaz)
  await page.locator('.mino-tepsi .izgara').evaluate((e) => e.setAttribute('data-eski', '1'));
  await page.locator('.mino-tepsi [data-dogru="1"]').click();
  await expect(page.locator('.mino-tepsi .izgara:not([data-eski])')).toBeVisible({ timeout: 8000 });
  await expect(page.locator('.mino-tepsi .izgara:not([data-eski]) [data-dogru="1"]')).toHaveCount(1);

  // Mino'nun farklı yerlerine dokun
  const r = (await page.locator('.mino-svg').boundingBox())!;
  for (const [x, y] of [[0.4, 0.25], [0.45, 0.65], [0.85, 0.45], [0.4, 0.95]]) {
    await page.mouse.click(r.x + r.width * x, r.y + r.height * y);
    await page.waitForTimeout(750);
  }
  await page.getByRole('button', { name: 'Ana ekran' }).click();
  await expect(page.locator('.oyna-dugme')).toBeVisible();
  expect(hatalar).toEqual([]);
});

test('Mino: tepkiler (zıpla, dans, ağız açık, göz kapalı, mutlu) ekran görüntüsü', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./?test=1&yas=4&ekran=mino');
  await expect(page.locator('.mino-svg')).toBeVisible();
  await page.waitForTimeout(1500);
  // Görüntü Mino kutusunun biraz dışını da alsın: zıplayınca / dansta kulaklar kutudan taşar (sayfada taşma serbest)
  const k = (await page.locator('.mino').boundingBox())!;
  const pay = k.height * 0.3;
  const alan = { x: Math.max(0, k.x - 20), y: Math.max(0, k.y - pay), width: k.width + 40, height: k.height + pay };
  const mino = { screenshot: (o: { path: string }) => page.screenshot({ ...o, clip: alan }) };
  const tepki = (ad: string) => page.evaluate((a) => (window as unknown as { __mino: { tepki(t: string): void } }).__mino.tepki(a), ad);
  for (const [ad, ms, dosya] of [['zipla', 380, '11-mino-zipla'], ['dans', 450, '12-mino-dans'], ['sasir', 500, '13-mino-agiz-acik'], ['evet', 350, '14-mino-mutlu']] as const) {
    await tepki(ad);
    await page.waitForTimeout(ms);
    await mino.screenshot({ path: `tests/screens/${info.project.name}-${dosya}.png` });
    await page.waitForTimeout(2600);
  }
  // göz kırpma ve uyku aynı kapalı göz çizimini kullanır
  await page.evaluate(() => (window as unknown as { __mino: { uyu(): void } }).__mino.uyu());
  await expect(page.locator('.mino.gozkapali')).toBeVisible();
  await mino.screenshot({ path: `tests/screens/${info.project.name}-15-mino-goz-kapali.png` });
  expect(hatalar).toEqual([]);
});

test('Mino: pozlar (kalkık kol, oturma, düşünme, işaret, sarılma) doğru katmanları gösterir', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./?test=1&yas=4&ekran=mino');
  await expect(page.locator('.mino-svg')).toBeVisible();
  type M = { kol(y: string, a: number): void; otur(a: boolean): Promise<void>; poz(p: string | null): Promise<void> };
  const m = (f: string) => page.evaluate((f) => new Function('m', f)((window as unknown as { __mino: M }).__mino), f);
  const gorunur = (s: string) => page.locator(`.mino ${s}`).first().evaluate((e) => getComputedStyle(e).display !== 'none' && getComputedStyle(e).opacity !== '0');
  // varsayılan: poz eki yok (tembel paket yüklenmedi)
  await expect(page.locator('.mino .m-poz')).toHaveCount(0);
  await m("m.kol('sol', 130); m.kol('sag', 90); return m.otur(true)");
  await expect(page.locator('.mino.otur.kol-sol-yukari.kol-sag-yukari')).toHaveCount(1);
  expect(await gorunur('.m-poz-kol-sol-yukari')).toBe(true);
  expect(await gorunur('.m-poz-otur')).toBe(true);
  expect(await gorunur('.kl')).toBe(false);
  expect(await gorunur('.q > .m-asil')).toBe(false);
  await page.locator('.mino').screenshot({ path: `tests/screens/${info.project.name}-16-mino-poz-kol-otur.png` });
  await m("m.kol('sol', 0); m.kol('sag', 0); m.otur(false); return m.poz('dusun')");
  await expect(page.locator('.mino.poz-dusun')).toHaveCount(1);
  await expect(page.locator('.mino.otur, .mino.kol-sol-yukari')).toHaveCount(0);
  expect(await gorunur('.m-poz-kol-dusun')).toBe(true);
  expect(await gorunur('.kr')).toBe(false);
  await m("return m.poz('isaret-sag')");
  await expect(page.locator('.mino.kol-sag-yukari.poz-bak-sag')).toHaveCount(1);
  await m("return m.poz('sarilma')");
  await expect(page.locator('.mino.poz-sarilma.gozkapali')).toHaveCount(1);
  expect(await gorunur('.m-poz-sarilma')).toBe(true);
  await page.locator('.mino').screenshot({ path: `tests/screens/${info.project.name}-17-mino-poz-sarilma.png` });
  // bırakınca normale döner
  await m('return m.poz(null)');
  await expect(page.locator('.mino:is(.poz-sarilma, .poz-dusun, .kol-sag-yukari, .otur)')).toHaveCount(0);
  expect(await gorunur('.kl')).toBe(true);
  expect(hatalar).toEqual([]);
});
