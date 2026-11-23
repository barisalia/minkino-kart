import { test, expect, type Page } from '@playwright/test';

// Kalite denetimi 22 Kasım gecesi (ekip/uygulama/KALITE-DENETIM-22.md, bölüm 1 menü, 4 Keşfet, 5 Hikâye Defteri;
// ekip/KALITE-KURALLARI.md 5–8): dokunma hedefleri 64 px, boş dokunuşa karşılık, telefonda harf rafı ilk ekrana sığar,
// öykü sayfasında resim büyük, bitiş kısa. Telefon yatay (844 × 390) ölçülür.
test.use({ viewport: { width: 844, height: 390 } });
test.beforeEach(async ({ page }) => { await page.routeWebSocket((u) => u.port === '5173', () => {}); });

async function yasla(page: Page, yas: number, ek: Record<string, unknown> = {}) {
  await page.addInitScript(([yas, ek]) => {
    if (sessionStorage.getItem('kalite')) return;
    sessionStorage.setItem('kalite', '1');
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas }));
    localStorage.setItem('minkino-menu-yas', '4–5 yaş');
    for (const [k, v] of Object.entries(ek as Record<string, unknown>)) localStorage.setItem(k, JSON.stringify(v));
  }, [yas, ek] as const);
}

test('Menü: ad hoparlörü ve yuvarlak düğmeler 64 px dokunma alanı taşır; boş yere dokununca parıltı çıkar', async ({ page }) => {
  await yasla(page, 6);
  await page.goto('./?test=1&dersler=1');
  const ses = page.locator('.ym-ana .ym-ses').first();
  await expect(ses).toBeVisible();
  const r = (await ses.boundingBox())!;
  // Çizimin 26 px dışı (çizim 30–44 px): yine hoparlöre düşer.
  const isabet = await page.evaluate(([x, y]) => !!document.elementFromPoint(x, y)?.closest('.ym-ses'), [r.x + r.width / 2, r.y + r.height / 2 + 26]);
  expect(isabet).toBe(true);
  const ayar = (await page.getByRole('button', { name: 'Ebeveyn ayarları' }).boundingBox())!;
  const ayarIsabet = await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest('button')?.getAttribute('aria-label'), [ayar.x + ayar.width / 2, Math.max(1, ayar.y + ayar.height / 2 - 26)]);
  expect(ayarIsabet).toBe('Ebeveyn ayarları');
  // Kartlar soluk alır
  expect(await page.locator('.ym-ana .ym-kategori-kap').first().evaluate((el) => getComputedStyle(el).animationName)).toBe('ym-nefes');
  // Boş yer: üst şeridin ortası
  await page.mouse.click(422, 30);
  await expect(page.locator('.ym-pirilti')).toHaveCount(1);
});

test('Harf rafı telefonda: üç sıra harf ilk ekrana sığar, karolar ve "ile başla" en az 64 px; Ceren açılışta karşılar', async ({ page }) => {
  await yasla(page, 6);
  await page.addInitScript(() => { (window as unknown as { calinan: string[] }).calinan = []; const ab = Response.prototype.arrayBuffer; Response.prototype.arrayBuffer = function () { (window as unknown as { calinan: string[] }).calinan.push(this.url); return ab.call(this); }; });
  await page.goto('./alfabe/');
  await expect(page.locator('.at-harf')).toHaveCount(29);
  const kutular = await page.locator('.at-harf').evaluateAll((l) => l.map((b) => b.getBoundingClientRect()).map((r) => ({ h: r.height, alt: r.bottom })));
  for (const k of kutular) { expect(k.h).toBeGreaterThanOrEqual(64); expect(k.alt).toBeLessThanOrEqual(390); }
  expect((await page.locator('.at-basla').boundingBox())!.height).toBeGreaterThanOrEqual(64);
  // Açılışta Ceren'in karşılama kaydı istenir (sinif-giris)
  await expect.poll(() => page.evaluate(() => (window as unknown as { calinan: string[] }).calinan.some((u) => u.includes('sinif-giris'))), { timeout: 15_000 }).toBe(true);
});

test('Keşfet: dokunulan sözcüğün harfleri 64 px yüksek; resimler ve Ceren boşta kıpırdar; boş dokunuşa parıltı', async ({ page }) => {
  await yasla(page, 6, { 'minkino-alfabe-v1': { adimlar: { '02': 5 } } });
  await page.goto('./alfabe/?test=1&h15=0');
  await page.locator('.at-harf[data-id="02"]').click();
  await expect(page.locator('.hf-kesif')).toHaveAttribute('data-adim', 'bul', { timeout: 30_000 });
  const boylar = await page.locator('.hf-kart:nth-child(2) button.hf-hucre').evaluateAll((l) => l.map((b) => b.getBoundingClientRect().height));
  expect(boylar.length).toBeGreaterThan(0);
  for (const h of boylar) expect(h).toBeGreaterThanOrEqual(64);
  expect(await page.locator('.hf-resim img').first().evaluate((el) => getComputedStyle(el).animationName)).toBe('hf-suzul');
  expect(await page.locator('.hf-hoca .alf-ceren').evaluate((el) => getComputedStyle(el).animationName)).toBe('hf-nefes');
  // Panonun boş köşesi (düğme değil)
  const pano = (await page.locator('.hf-pano').boundingBox())!;
  await page.mouse.click(pano.x + 8, pano.y + pano.height - 6);
  await expect(page.locator('.alf-cila-parilti').first()).toBeAttached({ timeout: 1000 });
  // Harf tuşu tok: kalın alt kenar; doğru harfte iki resim kendi hareketiyle canlanır (kesfet-canlanma.ts)
  expect(await page.locator('.hf-kart:nth-child(2) button.hf-hucre').first().evaluate((el) => parseFloat(getComputedStyle(el).borderBottomWidth))).toBeGreaterThanOrEqual(6);
  // Yanlış harf: komik pof (toz kabarır, tuş ezilir); ikinci yanlışta ipucu anı (doğru harf halkayla atar)
  const yanlis = page.locator('.hf-kart:nth-child(2) button.hf-hucre:not([data-hedef="evet"])').first();
  await yanlis.click();
  await expect(page.locator('.alf-cila-toz').first()).toBeAttached({ timeout: 1000 });
  await expect(page.locator('.hf-kesif')).toHaveAttribute('data-adim', 'bul', { timeout: 15_000 });
  await expect(page.locator('.hf-kart:nth-child(2) button.hf-hucre:not(:disabled)').first()).toBeVisible({ timeout: 15_000 });
  await yanlis.click();
  await expect(page.locator('.hf-kart:nth-child(2) button[data-hedef="evet"]')).toHaveClass(/hf-ipucu-ani/, { timeout: 1500 });
  await page.locator('.hf-kart:nth-child(2) button[data-hedef="evet"]').click();
  await expect.poll(() => page.locator('.hf-resim img').evaluateAll((l) => l.filter((i) => i.getAnimations().some((a) => a.playState === 'running' && a.effect?.getComputedTiming().iterations !== Infinity)).length), { timeout: 2000 }).toBe(2);
});

test('Hikâye Defteri telefonda: resim yüksekliğin çoğunu kaplar, sözcükler 64 px; resme dokununca kıpırdar; bitiş kısa', async ({ page }) => {
  await page.goto('./alfabe/cumle-onizleme/?test=1&hizli=1&harfler=01,17,06,24,12,15&yaptir=1&oyku=oyku-1');
  const sahne = page.locator('.co-sahne');
  await expect(sahne).toHaveAttribute('data-evre', 'cocuk', { timeout: 20_000 });
  const s = (await sahne.boundingBox())!, k = (await page.locator('.co-kart').boundingBox())!;
  expect(k.height).toBeGreaterThanOrEqual(s.height * 0.85);
  for (const b of await page.locator('.co-soz').all()) expect((await b.boundingBox())!.height).toBeGreaterThanOrEqual(64);
  // Ceren ve 'bütün cümle' düğmesi ekranın içinde (resmin iki yanında)
  for (const sec of ['.co-tumu', '.co-ceren']) { const b = (await page.locator(sec).boundingBox())!; expect(b.x).toBeGreaterThanOrEqual(0); expect(b.x + b.width).toBeLessThanOrEqual(844.5); }
  await page.locator('.co-kart').click({ position: { x: k.width * 0.3, y: k.height * 0.3 } });
  // Dokunulan yer jöle gibi büyüyüp yaylanır (cumle-okuma.ts → jole)
  expect(await page.locator('.co-kart').evaluate((el) => el.getAnimations({ subtree: true }).length)).toBeGreaterThan(0);
});

test('Hikâye Defteri: sıraya dizildikten sonra "okudun" ekranı en geç 3 sn içinde', async ({ page }) => {
  await page.goto('./alfabe/cumle-onizleme/?test=1&hizli=1&harfler=01,17,06,24,12,15&oyku=oyku-1&yas=5%2B');
  const sahne = page.locator('.co-sahne');
  let cevrildi = false;
  for (let i = 0; i < 4; i++) {
    await expect(sahne).toHaveAttribute('data-evre', 'cocuk', { timeout: 20_000 });
    if (i === 1) cevrildi = true;
    for (const s of await page.locator('.co-soz').all()) await s.tap();
    const onceki = await sahne.getAttribute('data-cumle');
    if (i === 0) await page.evaluate(() => { const w = window as unknown as { cevrilen: boolean }; w.cevrilen = false; new MutationObserver(() => { if (document.querySelector('.co-cevrilen')) w.cevrilen = true; }).observe(document.body, { subtree: true, childList: true }); });
    await page.getByRole('button', { name: 'Bütün cümleyi oku' }).tap();
    await page.waitForFunction((id) => { const s = document.querySelector<HTMLElement>('.co-sahne'); return !!s && (s.dataset.evre === 'yaptir' || s.dataset.evre === 'hangi' || s.dataset.cumle !== id); }, onceki, { timeout: 20_000 });
    if (await sahne.getAttribute('data-evre') === 'yaptir') await page.locator('.co-hedef').tap();
  }
  for (let k = 0; k < 2; k++) {
    await expect(sahne).toHaveAttribute('data-evre', 'hangi', { timeout: 15_000 });
    await expect(sahne).toHaveAttribute('data-soru', String(k), { timeout: 15_000 });
    await expect(sahne).toHaveAttribute('data-bekliyor', 'true', { timeout: 15_000 });
    await page.locator(`.co-sayfa[data-sayfa="${await sahne.getAttribute('data-hedef')}"]`).tap();
  }
  await expect(sahne).toHaveAttribute('data-evre', 'sirala', { timeout: 15_000 });
  await expect(sahne).toHaveAttribute('data-bekliyor', 'true', { timeout: 15_000 });
  for (let i = 0; i < 3; i++) await page.locator(`.co-karisik .co-sayfa[data-sira="${i}"]`).tap();
  const bas = Date.now();
  await page.locator('.co-karisik .co-sayfa[data-sira="3"]').tap();
  await expect(sahne).toHaveAttribute('data-evre', 'bitti', { timeout: 15_000 });
  expect(Date.now() - bas).toBeLessThan(3000);
  // Sayfa çevirme oldu (eski sayfa kıvrılıp kalktı); bitişte okunan öykü iri bir kitap
  expect(cevrildi && await page.evaluate(() => (window as unknown as { cevrilen: boolean }).cevrilen)).toBe(true);
  await expect(page.locator('.co-bitti-kitap')).toBeVisible();
  // düzen genişliği (dönerek gelme animasyonunun ölçeği sayılmaz)
  expect(await page.locator('.co-bitti-kitap').evaluate((el) => (el as HTMLElement).offsetWidth)).toBeGreaterThan(250);
});

test('Öbür adımlar telefonda: mıknatıs taşları, kalem renkleri ve "bir daha göster" en az 64 px; Ceren boşta nefes alır', async ({ page }) => {
  await yasla(page, 6, { 'minkino-alfabe-v1': { adimlar: { '02': 4 } } });
  await page.goto('./alfabe/?test=1&h14=0');
  await page.locator('.at-harf[data-id="02"]').click();
  await expect(page.locator('.mik-tas').first()).toBeVisible({ timeout: 20_000 });
  for (const t of await page.locator('.mik-tas').all()) { const b = (await t.boundingBox())!; expect(Math.min(b.width, b.height)).toBeGreaterThanOrEqual(64); }
  await page.evaluate(() => { localStorage.setItem('minkino-alfabe-v1', JSON.stringify({ adimlar: { '02': 1 } })); });
  await page.goto('./alfabe/?test=1');
  await page.locator('.at-harf[data-id="02"]').click();
  await expect(page.locator('.yz-palet button').first()).toBeVisible({ timeout: 20_000 });
  for (const t of await page.locator('.yz-palet button, .yz-yine').all()) { const b = (await t.boundingBox())!; expect(Math.min(b.width, b.height)).toBeGreaterThanOrEqual(64); }
  expect(await page.locator('.alf-ceren').first().evaluate((el) => getComputedStyle(el).animationName)).toMatch(/nefes/);
});
