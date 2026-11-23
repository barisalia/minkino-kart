import { test, expect, type Page } from '@playwright/test';

// Minik Doktor · onuncu vaka "Mino'nun Kayıp Çıngırağı" (doktor/src/vaka-cingirak/). Asıl çizimler (Paket Doktor-Y10) gelene kadar
// geliştirme sunucusunda geçici çizimlerle (?taslak) koşar: bastır-bırak zıplat, kaçan sesi takip et, fermuarı çek, topu çek çıkar,
// vuruşta dokun, fırlat, eldivenle yakala, tokaya basılı tut. Komik hamleler: boing, sıkışan fermuar, ters dönen cep, zayıf atış,
// erken bırakılan toka.
test.beforeEach(async ({ page }, bilgi) => {
  if (bilgi.project.name === 'iphone') await page.setViewportSize({ width: 844, height: 390 });
  if (bilgi.project.name === 'ipad') await page.setViewportSize({ width: 1024, height: 768 });
});

type Nokta = { x: number; y: number };
type Sayim = { zipla: number; hedefZipla: number; fermuar: number; sikisik: boolean; cepTers: boolean; topCikti: boolean; isabet: number; hedefRitim: number; atisNo: number; hedefAtis: number; topUcuyor: boolean; minoBekliyor: boolean; topBoyunda: boolean; bagli: boolean; erken: boolean; boing: boolean; kisa: boolean; sikisti: boolean };
const H = <T>(page: Page, ad: string, ...arg: unknown[]) =>
  page.evaluate(([a, g]) => (window as unknown as { __cingirak: Record<string, (...x: unknown[]) => unknown> }).__cingirak[a](...g), [ad, arg] as [string, unknown[]]) as Promise<T>;
const enKucukKenar = async (page: Page, sec: string) => {
  const kutular = await page.locator(sec).evaluateAll(hepsi => {
    const s = document.querySelector('#doktor .vk-sahne')!.getBoundingClientRect().width / 2048;
    return hepsi.filter(e => !(e as HTMLElement).hidden).map(e => Math.min((e as HTMLElement).offsetWidth, (e as HTMLElement).offsetHeight) * s);
  });
  expect(kutular.length, sec).toBeGreaterThan(0);
  return Math.min(...kutular);
};

test('çıngırak vakası: çizimler eksikken açılmaz, ekranda hiçbir görüntü yok', async ({ page }) => {
  await page.goto('./doktor/index.html?oyun=cingirak&test');
  const kok = page.locator('#doktor');
  await expect(kok).toHaveAttribute('data-oyun', 'cingirak', { timeout: 30_000 });
  await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
  test.skip((await kok.getAttribute('data-durum')) === 'hazir', 'çizimler gelmiş');
  await expect(kok.locator('img')).toHaveCount(0);
});

for (const yas of ['2-3', '4', '5+']) {
  test(`çıngırak vakası: ${yas} yaş sekiz adım baştan sona; komik hamleler, hedefler iri`, async ({ page }) => {
    test.setTimeout(180_000);
    const hatalar: string[] = [];
    page.on('pageerror', e => hatalar.push(e.message));
    const kok = page.locator('#doktor');
    await page.goto('./doktor/index.html?oyun=cingirak&test&yas=' + encodeURIComponent(yas));
    await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
    if ((await kok.getAttribute('data-durum')) === 'eksik') {
      await page.goto('./doktor/index.html?oyun=cingirak&test&taslak&yas=' + encodeURIComponent(yas));
      await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
    }
    test.skip((await kok.getAttribute('data-durum')) === 'eksik', 'çizim yok');
    const asamaNe = () => kok.getAttribute('data-asama');
    const asama = (a: string | RegExp, timeout = 15_000) => expect(kok).toHaveAttribute('data-asama', a, { timeout });
    const nokta = async (ad: string) => (await H<Nokta | null>(page, 'nokta', ad))!;
    const sayim = () => H<Sayim>(page, 'sayim');
    const olcek = await H<number>(page, 'olcek');
    const kay = (q: Nokta, dx: number, dy: number): Nokta => ({ x: q.x + dx * olcek, y: q.y + dy * olcek });
    let fark = { x: 0, y: 0 };
    const tut = async (m: Nokta) => {
      await page.mouse.move(m.x, m.y); await page.mouse.down(); await page.mouse.move(m.x + 1, m.y + 1);
      const uc = await H<Nokta | null>(page, 'uc'); expect(uc, 'alet elde').not.toBeNull(); fark = { x: uc!.x - m.x - 1, y: uc!.y - m.y - 1 };
    };
    const git = (q: Nokta, steps = 8) => page.mouse.move(q.x - fark.x, q.y - fark.y, { steps });
    const dok = (etiket: string) => H<Nokta>(page, 'dugme', `.vk-dok-aleti[aria-label="${etiket}"]`);
    const bas = async (m: Nokta, q: Nokta, steps: number, bekle = 0) => {
      await page.mouse.move(m.x, m.y); await page.mouse.down();
      for (let i = 1; i <= steps; i++) { await page.mouse.move(m.x + ((q.x - m.x) * i) / steps, m.y + ((q.y - m.y) * i) / steps); if (bekle) await page.waitForTimeout(bekle); }
    };

    // masa: çanta, cep
    await kok.locator('.vk-canta').click({ force: true });
    await expect(kok.locator('.vk-hub .vk-kol-dugmesi')).toBeVisible();
    expect(await enKucukKenar(page, '#doktor .vk-hub .vk-kol-dugmesi')).toBeGreaterThanOrEqual(64);
    await kok.locator('.vk-hub .vk-kol-dugmesi').click({ force: true });
    await asama('zipla');
    const S = await sayim();

    // 1 · zıplat: önce çok derin (boing), sonra normal
    const mino = await nokta('mino');
    await bas(mino, kay(mino, 0, 260), 6); await page.mouse.up();
    await expect.poll(async () => (await sayim()).boing, { timeout: 3000 }).toBe(true);
    for (let k = 1; k < S.hedefZipla; k++) { await page.waitForTimeout(150); await bas(mino, kay(mino, 0, 110), 4); await page.mouse.up(); }
    await asama('dinle', 5000);

    // 2 · stetoskopla kaçan sesi takip et
    await tut(await dok('Stetoskop'));
    for (let k = 0; k < 120 && (await asamaNe()) === 'dinle'; k++) { await git(await nokta('ses'), 1); await page.waitForTimeout(20); }
    await asama('fermuar'); await page.mouse.up();
    expect(await enKucukKenar(page, '#doktor .cn-tutamak')).toBeGreaterThanOrEqual(64);

    // 3 · fermuar: biraz yavaş, sonra hızlı (sıkışır), geri al, yavaşça sona
    const t0 = await nokta('tutamak'), son = await nokta('fermuarSon');
    await bas(t0, kay(t0, 50, 0), 10, 30);
    for (let i = 1; i <= 9; i++) await page.mouse.move(t0.x + (50 + i * 30) * olcek, t0.y);
    await expect.poll(async () => (await sayim()).sikisik, { timeout: 2000 }).toBe(true);
    let x = t0.x + (50 + 9 * 30) * olcek;
    for (let i = 1; i <= 100 && (await sayim()).sikisik; i++) { x -= 4 * olcek; await page.mouse.move(x, t0.y); await page.waitForTimeout(25); }
    expect((await sayim()).sikisik).toBe(false);
    for (let i = 0; i < 160 && (await asamaNe()) === 'fermuar'; i++) { x = Math.min(son.x + 20 * olcek, x + 5 * olcek); await page.mouse.move(x, t0.y); await page.waitForTimeout(30); }
    await page.mouse.up();
    await asama('cikar');

    // 4 · topu cepten hızlıca yukarı çek: cep ters döner, top çıkar
    const tc = await nokta('topCep');
    await page.mouse.move(tc.x, tc.y); await page.mouse.down();
    for (let i = 1; i <= 7; i++) await page.mouse.move(tc.x, tc.y - i * 64 * olcek);
    await page.mouse.up();
    await asama('ritim');
    expect((await sayim()).cepTers).toBe(true);

    // 5 · ritim: önce yanlış anda (tık), sonra vuruşlarda
    const top = await nokta('top');
    const vurus = async () => { const kalan = await H<number>(page, 'vurus'); await page.waitForTimeout(Math.max(0, kalan - 15)); await page.mouse.click(top.x, top.y); };
    { const kalan = await H<number>(page, 'vurus'); await page.waitForTimeout((kalan + 360) % 720); await page.mouse.click(top.x, top.y); }
    expect((await sayim()).isabet).toBe(0);
    for (let k = 0; k < S.hedefRitim + 4 && (await asamaNe()) === 'ritim'; k++) await vurus();
    await asama('firlat', 5000);

    // 6–7 · fırlat ve yakala: önce zayıf atış (kısa düşer), sonra hızlı atış; eldivenle gölgeyi tut
    const pati = await nokta('patiler');
    const yon = { x: top.x + (pati.x - top.x) * 0.45, y: top.y + (pati.y - top.y) * 0.45 };
    await bas(top, yon, 12, 40); await page.mouse.up();
    await expect.poll(async () => (await sayim()).kisa, { timeout: 3000 }).toBe(true);
    await expect.poll(async () => (await sayim()).topUcuyor, { timeout: 5000 }).toBe(false);
    for (let k = 0; k < S.hedefAtis + 2 && (await asamaNe()) !== 'toka'; k++) {
      await bas(top, yon, 2); await page.mouse.up();
      await asama('yakala', 5000);
      await tut(await dok('Eldiven'));
      await git(await nokta('dusme'), 4);
      await expect(kok).toHaveAttribute('data-asama', /firlat|toka/, { timeout: 8000 });
      await page.mouse.up();
      await expect.poll(async () => (await sayim()).topUcuyor, { timeout: 5000 }).toBe(false);
    }
    await asama('toka');
    expect((await sayim()).atisNo).toBe(S.hedefAtis);

    // 8 · toka: topu boyna götür; önce erken bırak, sonra basılı tut
    await tut(top); await git(await nokta('boyun')); await page.mouse.up();
    await expect.poll(async () => (await sayim()).topBoyunda, { timeout: 3000 }).toBe(true);
    const toka = await nokta('toka');
    await page.mouse.move(toka.x, toka.y); await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up();
    expect((await sayim()).erken).toBe(true);
    await page.mouse.move(toka.x, toka.y); await page.mouse.down();
    await expect.poll(async () => (await sayim()).bagli, { timeout: 4000 }).toBe(true);
    await page.mouse.up();
    await asama('son', 20_000);
    expect(hatalar).toEqual([]);
  });
}
