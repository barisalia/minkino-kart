import { expect, test, type Page } from '@playwright/test';
import { existsSync } from 'node:fs';
test.use({ actionTimeout: 15_000, navigationTimeout: 30_000 });
// Harf Atölyesi telefonda yataya kilitli: öbür Alfabe testleri gibi dikey iphone projesinde boy 844×390'a çevrilir.
test.beforeEach(async ({ page }, bilgi) => {
  if (bilgi.project.name === 'iphone') await page.setViewportSize({ width: 844, height: 390 });
});

// "Ceren'le oku" rafa bağlanana kadar yalnız test kipindeki önizleme sayfasından açılır.
async function ac(page: Page, ek = '') {
  await page.routeWebSocket((u) => u.port === '5173', () => {});
  await page.goto('./alfabe/cumle-onizleme/?test=1&hizli=1' + ek);
}
const sahne = (p: Page) => p.locator('.co-sahne');

test('Ceren sözcükleri sırayla yakar, çocuk her sözcüğe sonra bütün cümleye dokunur, sahne canlanır', async ({ page }, info) => {
  // B, A, L, D, I: "Baba bal aldı." ve "Bal al." (ikisinde de okuduğunu yaptır yok).
  await ac(page, '&harfler=02,01,15,05,11');
  await expect(sahne(page)).toHaveAttribute('data-cumle', 'cumle-02');
  const sozler = page.locator('.co-soz');
  await expect(sozler).toHaveText(['Baba', 'bal', 'aldı']);
  await expect.poll(() => page.locator('.co-resim').evaluate((e) => (e as HTMLImageElement).naturalWidth)).toBeGreaterThan(50);
  await expect(sahne(page)).toHaveAttribute('data-evre', 'cocuk');
  const tumu = page.getByRole('button', { name: 'Bütün cümleyi oku' });
  await expect(tumu).toBeDisabled();
  for (const s of await sozler.all()) { await s.tap(); await expect(s).toHaveAttribute('data-okundu', 'true'); }
  await expect(tumu).toBeEnabled();
  await page.screenshot({ path: info.outputPath('cumle-dokun.png') });
  await tumu.tap();
  await expect(sahne(page)).toHaveAttribute('data-evre', 'canli');
  await expect(sahne(page)).toHaveAttribute('data-cumle', 'cumle-16');
  const dugmeler = await page.locator('button:visible').evaluateAll((l) => l.filter((b) => { const r = b.getBoundingClientRect(); return r.width < 43.9 || r.height < 43.9 || r.bottom > innerHeight + .5 || r.right > innerWidth + .5; }).map((b) => { const r = b.getBoundingClientRect(); return (b.textContent || b.getAttribute('aria-label') || b.className) + ' ' + [r.x, r.y, r.width, r.height].map(Math.round).join(','); }));
  expect(dugmeler).toEqual([]);
  const kayit = await page.evaluate(() => Object.entries(localStorage).find(([k]) => k.startsWith('minkino-cumle-okuma-v1'))?.[1]);
  expect(JSON.parse(kayit!)).toEqual({ okunan: ['cumle-02'] });
});

test('Yalnız bitirilen harflerden kurulan cümleler gelir; harf yoksa Ceren bekletir', async ({ page }) => {
  await ac(page, '&harfler=01,02,06,15,17');
  await expect(sahne(page)).toHaveAttribute('data-cumle', 'cumle-01');
  // "Anne bal al." ve "Bal al."; Astra'nın sahneleri geldikçe aynı harflerle yeni cümleler de açılır (en çok üç bir turda).
  expect(await page.locator('#ilerleme i').count()).toBeGreaterThanOrEqual(2);
  await ac(page, '&harfler=01');
  await expect(sahne(page)).toHaveAttribute('data-evre', 'bos');
});

test('Ücretsiz dört harf (A, N, E, T) bölümü açar; harf yoksa kalan harfler görünür ve Ceren bekletir', async ({ page }) => {
  await ac(page, '&harfler=01,17,06,24&yas=4');
  await expect(sahne(page)).toHaveAttribute('data-cumle', 'cumle-35');
  await expect(page.locator('.co-soz')).toHaveText(['Anne']);
  await expect(page.locator('#ilerleme i')).toHaveCount(3); // bir turda üç cümle ("Anne.", "Anne, tat!", "At.")
  const istekler: string[] = [];
  page.on('request', (r) => { const m = r.url().match(/\/alfabe\/ses\/(cumle-[a-z0-9-]+)\.mp3/); if (m) istekler.push(m[1]); });
  await page.routeWebSocket((u) => u.port === '5173', () => {});
  await page.goto('./alfabe/cumle-onizleme/?test=1&harfler=&yas=5%2B');
  await expect(sahne(page)).toHaveAttribute('data-evre', 'bos');
  await expect(page.locator('.co-eksik b')).toHaveText(['A', 'N', 'E', 'T']);
  await expect.poll(() => istekler).toContain('cumle-kart-bos');
});

test('Ceren gerçek kaydıyla okur: önce akıcı cümle, sözcükler sesle sırayla yanar; dokunulan sözcük kendi kaydıyla okunur', async ({ page }) => {
  const istekler: string[] = [];
  page.on('request', (r) => { const m = r.url().match(/\/alfabe\/ses\/(cumle-[a-z0-9-]+)\.mp3/); if (m) istekler.push(m[1]); });
  await page.routeWebSocket((u) => u.port === '5173', () => {});
  // Son sözcük ~0,3 sn yanık kalır; yoklama kaçırmasın diye yanma sırası kayda geçer.
  await page.addInitScript(() => {
    const w = window as unknown as { yananlar: string[] }; w.yananlar = [];
    new MutationObserver((l) => { for (const m of l) { const e = m.target as HTMLElement; if (e.classList?.contains('co-soz') && e.classList.contains('co-yanik') && w.yananlar.at(-1) !== e.textContent) w.yananlar.push(e.textContent!); } })
      .observe(document, { subtree: true, attributes: true, attributeFilter: ['class'] });
  });
  await page.goto('./alfabe/cumle-onizleme/?test=1&harfler=01,02,06,15,17');
  // Yönerge, sonra cümlenin akıcı kaydı; sözcükler kaydın zaman damgalarıyla sırayla yanar.
  await expect.poll(() => istekler).toContain('cumle-01');
  await expect(sahne(page)).toHaveAttribute('data-evre', 'cocuk', { timeout: 10000 });
  expect(await page.evaluate(() => (window as unknown as { yananlar: string[] }).yananlar)).toEqual(['Anne', 'bal', 'al']);
  await page.locator('.co-soz').nth(1).tap();
  await expect.poll(() => istekler).toContain('cumle-soz-bal');
  expect(istekler.indexOf('cumle-yonerge-ben')).toBeLessThan(istekler.indexOf('cumle-01'));
});

test('4 yaş bir ya da iki sözcüklü cümle okur', async ({ page }) => {
  await ac(page, '&yas=4');
  await expect(page.locator('.co-soz').first()).toBeVisible();
  expect(await page.locator('.co-soz').count()).toBeLessThanOrEqual(2);
});

test('Okuduğunu yaptır (5+, Astra\'nın çifti): yanlış yere dokununca cümle yeniden yanar, naneye dokununca Anne tadar', async ({ page }) => {
  const sira = () => page.evaluate(() => (window as unknown as { cerenSirasi: string[] }).cerenSirasi);
  await ac(page, '&harfler=01,17,06,24');
  await expect(sahne(page)).toHaveAttribute('data-cumle', 'cumle-38');
  await expect(sahne(page)).toHaveAttribute('data-evre', 'cocuk');
  for (const s of await page.locator('.co-soz').all()) { await s.tap(); await expect(s).toHaveAttribute('data-okundu', 'true'); }
  await page.getByRole('button', { name: 'Bütün cümleyi oku' }).tap();
  await expect(sahne(page)).toHaveAttribute('data-evre', 'yaptir');
  const hedef = page.locator('.co-hedef[aria-label="nane"]');
  await expect(hedef).toBeVisible();
  const kart = page.locator('.co-kart');
  const k = (await kart.boundingBox())!;
  // Nanenin uzağı (sol üst): iki kez şaşınca hedef parlar, cümle yeniden okunur.
  await page.touchscreen.tap(k.x + k.width * 0.15, k.y + k.height * 0.2);
  // Ceren "Bir daha okuyalım." der, cümle (cumle-01) bir kez daha okunup yanar.
  await expect.poll(async () => (await sira()).slice((await sira()).indexOf('cumle-yaptir'))).toEqual(['cumle-yaptir', 'cumle-yaptir-tekrar', 'cumle-38']);
  await page.touchscreen.tap(k.x + k.width * 0.15, k.y + k.height * 0.2);
  await expect(kart).toHaveClass(/co-ipucu/);
  await hedef.tap();
  await expect(sahne(page)).toHaveAttribute('data-evre', 'yapildi');
  await expect(page.locator('.co-sonra')).toHaveAttribute('src', /cumle-38-sonra\.webp/);
  await expect(sahne(page)).toHaveAttribute('data-cumle', 'cumle-39', { timeout: 10000 });
});

test('Okuduğunu yaptır yalnız yaptır verisi olan cümlede açılır (yer tutucu kipinde bile)', async ({ page }) => {
  // "Baba bal aldı." yaptır verisi taşımaz; yer tutucu yalnız yaptır verisi olan cümlede açılır.
  await ac(page, '&harfler=02,01,15,05,11&yaptir=1');
  for (const s of await page.locator('.co-soz').all()) { await s.tap(); await expect(s).toHaveAttribute('data-okundu', 'true'); }
  await page.getByRole('button', { name: 'Bütün cümleyi oku' }).tap();
  await expect(sahne(page)).toHaveAttribute('data-cumle', 'cumle-16');
  await expect(page.locator('.co-hedef')).toHaveCount(0);
});

test('Okuduğunu yaptır, Astra\'nın gerçek önce/sonra kareleriyle: bal kavanozuna dokununca Anne balı alır', async ({ page }) => {
  test.skip(!existsSync('assets/alfabe/cumle/cumle-01-sonra.webp'), 'cumle-01-sonra.webp henüz yok');
  await ac(page, '&harfler=01,02,06,15,17');
  await expect(sahne(page)).toHaveAttribute('data-cumle', 'cumle-01');
  await expect(page.locator('.co-resim')).toHaveAttribute('src', /cumle-01\.webp/);
  for (const s of await page.locator('.co-soz').all()) { await s.tap(); await expect(s).toHaveAttribute('data-okundu', 'true'); }
  await page.getByRole('button', { name: 'Bütün cümleyi oku' }).tap();
  await expect(sahne(page)).toHaveAttribute('data-evre', 'yaptir');
  await expect(page.locator('.co-kart')).not.toHaveAttribute('data-yer-tutucu', 'true');
  await page.getByRole('button', { name: 'bal kavanozu' }).tap();
  await expect(page.locator('.co-sonra')).toHaveAttribute('src', /cumle-01-sonra\.webp/);
  // Sahne gerçekleşir, cümle okunur, turun sıradaki cümlesine geçilir.
  await expect(sahne(page)).not.toHaveAttribute('data-cumle', 'cumle-01', { timeout: 10000 });
});

test('Ceren\'in Hikâye Defteri (test kipi, çizimsiz): öykü dört sayfa okunur, son sayfada okuduğunu yaptır, sonunda kitaplar', async ({ page }) => {
  // 1. ses grubu (A N E T İ L) bitmiş; ?oyku=oyku-1 ile "Anne ile bahçe" doğrudan açılır.
  await ac(page, '&harfler=01,17,06,24,12,15&yaptir=1&oyku=oyku-1');
  await expect(page.locator('#baslik')).toHaveText('Anne ile bahçe');
  for (const [id, sozler] of [['oyku-1-1', ['Anne', 'ile', 'lale']], ['oyku-1-2', ['Elli', 'lale']], ['oyku-1-3', ['Anne', 'nane', 'al']]] as const) {
    await expect(sahne(page)).toHaveAttribute('data-cumle', id);
    await expect(page.locator('.co-soz')).toHaveText([...sozler]);
    await expect(sahne(page)).toHaveAttribute('data-evre', 'cocuk');
    for (const s of await page.locator('.co-soz').all()) { await s.tap(); await expect(s).toHaveAttribute('data-okundu', 'true'); }
    await page.getByRole('button', { name: 'Bütün cümleyi oku' }).tap();
  }
  await expect(sahne(page)).toHaveAttribute('data-cumle', 'oyku-1-4');
  await expect(page.locator('#ilerleme i')).toHaveCount(4);
  await expect(sahne(page)).toHaveAttribute('data-evre', 'cocuk');
  for (const s of await page.locator('.co-soz').all()) { await s.tap(); await expect(s).toHaveAttribute('data-okundu', 'true'); }
  await page.getByRole('button', { name: 'Bütün cümleyi oku' }).tap();
  await expect(sahne(page)).toHaveAttribute('data-evre', 'yaptir');
  await page.locator('.co-hedef[aria-label="lale"]').tap();
  // Anladın mı? (a) Hangi sayfa: iki soru; ilkinde bilerek yanlış resim (ceza yok, doğrusu parlar)
  for (let k = 0; k < 2; k++) {
    await expect(sahne(page)).toHaveAttribute('data-evre', 'hangi', { timeout: 10000 });
    await expect(sahne(page)).toHaveAttribute('data-soru', String(k), { timeout: 10000 });
    await expect(sahne(page)).toHaveAttribute('data-bekliyor', 'true', { timeout: 10000 });
    const hedef = (await sahne(page).getAttribute('data-hedef'))!;
    await expect(page.locator('.co-sayfa')).toHaveCount(2);
    if (k === 0) {
      await page.locator(`.co-sayfa:not([data-sayfa="${hedef}"])`).tap();
      await expect(page.locator(`.co-sayfa[data-sayfa="${hedef}"]`)).toHaveClass(/co-parla/);
      await page.waitForTimeout(300);
    }
    await page.locator(`.co-sayfa[data-sayfa="${hedef}"]`).tap();
    await expect(page.locator(`.co-sayfa[data-sayfa="${hedef}"]`)).toHaveClass(/co-dogru/);
  }
  // (b) 5+: Sıraya diz; önce yanlış sayfa (sallanır), sonra 1→4
  await expect(sahne(page)).toHaveAttribute('data-evre', 'sirala', { timeout: 10000 });
  await expect(sahne(page)).toHaveAttribute('data-bekliyor', 'true', { timeout: 10000 });
  await page.locator('.co-karisik .co-sayfa[data-sira="3"]').tap();
  await expect(page.locator('.co-yuva[data-yuva="3"] img, .co-yuva[data-yuva="3"] .co-sayfa-yer')).toHaveCount(0);
  for (let i = 0; i < 4; i++) await page.locator(`.co-karisik .co-sayfa[data-sira="${i}"]`).tap();
  await expect(sahne(page)).toHaveAttribute('data-evre', 'bitti', { timeout: 15000 });
  await expect(page.locator('.co-bitti')).toContainText('Anne ile bahçe öyküsünü okudun!');
  const kayit = await page.evaluate(() => Object.entries(localStorage).find(([k]) => k.startsWith('minkino-cumle-okuma-v1'))?.[1]);
  expect(JSON.parse(kayit!).oykuler).toEqual(['oyku-1']);
});

test('Tur sonunda açık öykü kitap olarak sunulur ve dokununca açılır (test kipi)', async ({ page }) => {
  await ac(page, '&harfler=01,17,06,24,12,15&yaptir=1&yas=5%2B');
  for (let i = 0; i < 3; i++) {
    await expect(sahne(page)).toHaveAttribute('data-evre', 'cocuk', { timeout: 10000 });
    for (const s of await page.locator('.co-soz').all()) { await s.tap(); await expect(s).toHaveAttribute('data-okundu', 'true'); }
    await page.getByRole('button', { name: 'Bütün cümleyi oku' }).tap();
    if (await sahne(page).getAttribute('data-cumle') === 'cumle-38') {
      await expect(sahne(page)).toHaveAttribute('data-evre', 'yaptir');
      await page.locator('.co-hedef').tap();
    }
    await expect(sahne(page)).not.toHaveAttribute('data-evre', 'tumu');
    await page.waitForFunction(() => { const s = document.querySelector<HTMLElement>('.co-sahne'); return s?.dataset.evre === 'cocuk' || s?.dataset.evre === 'bitti' || s?.dataset.evre === 'ceren'; });
  }
  await expect(sahne(page)).toHaveAttribute('data-evre', 'bitti', { timeout: 10000 });
  const kitap = page.getByRole('button', { name: 'Öykü: Anne ile bahçe' });
  await expect(kitap).toHaveAttribute('data-yeni', 'true');
  await kitap.tap();
  await expect(sahne(page)).toHaveAttribute('data-cumle', 'oyku-1-1');
  await expect(page.locator('#baslik')).toHaveText('Anne ile bahçe');
});

test('Oku ve bul (ısınma): yalnız bitirilen harflerle yazılmış sözcükler; 5+ üç resim, yanlışta yeniden seçilir; sonra cümleler', async ({ page }) => {
  // A N E T İ L + O K U R I M bitmiş
  await ac(page, '&okubul=1&harfler=01,17,06,24,12,15,18,14,25,21,11,16');
  const bilinen = new Set('anetilokurım'.split(''));
  for (let k = 0; k < 5; k++) {
    await expect(sahne(page)).toHaveAttribute('data-evre', 'okubul', { timeout: 10000 });
    await expect(sahne(page)).toHaveAttribute('data-soru', String(k), { timeout: 10000 });
    await expect(sahne(page)).toHaveAttribute('data-bekliyor', 'true', { timeout: 10000 });
    const hedef = (await sahne(page).getAttribute('data-hedef'))!;
    const soz = (await page.locator('.co-okubul-soz').innerText()).toLocaleLowerCase('tr');
    expect([...soz].every((c) => bilinen.has(c)), soz).toBe(true);
    await expect(page.locator('.co-okubul-resim')).toHaveCount(3);
    if (k === 0) {
      await page.locator(`.co-okubul-resim:not([data-id="${hedef}"])`).first().tap();
      await expect(sahne(page)).toHaveAttribute('data-bekliyor', 'true', { timeout: 10000 });
      await expect(sahne(page)).toHaveAttribute('data-soru', '0');
    }
    await page.locator(`.co-okubul-resim[data-id="${hedef}"]`).tap();
  }
  await expect(sahne(page)).toHaveAttribute('data-evre', 'cocuk', { timeout: 15000 });
  await expect(sahne(page)).toHaveAttribute('data-cumle', /cumle-\d+/);
});

test('Oku ve bul: 4 yaşta iki resim; okunabilir sözcük yoksa ısınma atlanır', async ({ page }) => {
  await ac(page, '&okubul=1&yas=4&harfler=01,17,06,24,12,15,18,14,25,21,11,16');
  await expect(sahne(page)).toHaveAttribute('data-evre', 'okubul', { timeout: 10000 });
  await expect(page.locator('.co-okubul-resim')).toHaveCount(2);
  // A ve T: "At." okunur ama iki heceli resimli sözcük yok → doğrudan cümle
  await ac(page, '&okubul=1&yas=4&harfler=01,24');
  await expect(sahne(page)).toHaveAttribute('data-evre', /ceren|cocuk/, { timeout: 10000 });
});
