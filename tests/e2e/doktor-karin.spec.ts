import { test, expect, type Page } from '@playwright/test';

// Minik Doktor · yedinci vaka "Lokum'un Guruldayan Karnı" (doktor/src/vaka-karin/). Asıl çizimler (Paket Doktor-Y7) gelene kadar
// geliştirme sunucusunda geçici çizimlerle (?taslak) koşar: sekiz adım gerçek parmak hareketleriyle (gezdir-bul, kaydırarak tara,
// sürt, yavaş daire, karıştır, yukarı üfle, ağza götürüp tut, koyup vur), komik yanlış hamleler, dokunma hedefleri ve kısa kapanış.
test.beforeEach(async ({ page }, bilgi) => {
  if (bilgi.project.name === 'iphone') await page.setViewportSize({ width: 844, height: 390 });
  if (bilgi.project.name === 'ipad') await page.setViewportSize({ width: 1024, height: 768 });
});

type Nokta = { x: number; y: number };
type Sayim = { dinle: number; dilim: number; isit: number; hedefIsit: number; ov: number; hedefOv: number; karistir: number; hedefKaristir: number; ufle: number; hedefUfle: number; yudum: number; hedefYudum: number; pat: number; hedefPat: number; torbaKondu: boolean; usudu: boolean; gidik: boolean; koklar: boolean; kafa: boolean };
const H = <T>(page: Page, ad: string, ...arg: unknown[]) =>
  page.evaluate(([a, g]) => (window as unknown as { __karin: Record<string, (...x: unknown[]) => unknown> }).__karin[a](...g), [ad, arg] as [string, unknown[]]) as Promise<T>;
const enKucukKenar = async (page: Page, sec: string) => {
  const kutular = await page.locator(sec).evaluateAll(hepsi => {
    const s = document.querySelector('#doktor .vk-sahne')!.getBoundingClientRect().width / 2048;
    return hepsi.filter(e => !(e as HTMLElement).hidden).map(e => Math.min((e as HTMLElement).offsetWidth, (e as HTMLElement).offsetHeight) * s);
  });
  expect(kutular.length, sec).toBeGreaterThan(0);
  return Math.min(...kutular);
};

test('karın vakası: çizimler eksikken açılmaz, ekranda hiçbir görüntü yok', async ({ page }) => {
  await page.goto('./doktor/index.html?oyun=karin&test');
  const kok = page.locator('#doktor');
  await expect(kok).toHaveAttribute('data-oyun', 'karin', { timeout: 30_000 });
  await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
  test.skip((await kok.getAttribute('data-durum')) === 'hazir', 'çizimler gelmiş');
  await expect(kok.locator('img')).toHaveCount(0);
  await expect(kok.locator('.vk-sahne')).toHaveCount(0);
});

for (const yas of ['2-3', '4', '5+']) {
  test(`karın vakası: ${yas} yaş sekiz adım baştan sona; komik hamleler, hedefler iri`, async ({ page }) => {
    test.setTimeout(180_000);
    const hatalar: string[] = [];
    page.on('pageerror', e => hatalar.push(e.message));
    const kok = page.locator('#doktor');
    await page.goto('./doktor/index.html?oyun=karin&test&yas=' + encodeURIComponent(yas));
    await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
    if ((await kok.getAttribute('data-durum')) === 'eksik') {
      await page.goto('./doktor/index.html?oyun=karin&test&taslak&yas=' + encodeURIComponent(yas));
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
    /** merkezin çevresinde yavaş daire (her adımdan sonra bir kare beklenir) */
    const daire = async (m: Nokta, rx: number, ry: number, tur: number, adim: number, bekle: number, kosul: () => Promise<boolean>) => {
      for (let i = 0; i <= tur * adim; i++) {
        const a = (i / adim) * Math.PI * 2;
        await git(kay(m, Math.cos(a) * rx, Math.sin(a) * ry), 1);
        if (bekle) await page.waitForTimeout(bekle);
        if (i % 8 === 0 && !(await kosul())) return;
      }
    };

    // masa: çanta, karın
    await kok.locator('.vk-canta').click({ force: true });
    await expect(kok.locator('.vk-hub .vk-kol-dugmesi')).toBeVisible();
    expect(await enKucukKenar(page, '#doktor .vk-hub .vk-kol-dugmesi')).toBeGreaterThanOrEqual(64);
    await kok.locator('.vk-hub .vk-kol-dugmesi').click({ force: true });
    await asama('dinle');
    for (const sec of ['.gr-fincan', '.vk-dok-aleti']) expect(await enKucukKenar(page, '#doktor ' + sec), sec).toBeGreaterThanOrEqual(64);

    // 1 · stetoskop: önce burna (koklar), sonra karında gezdirip gurultunun yerinde tut
    await tut(await dok('Stetoskop'));
    await git(await nokta('burun'));
    await expect.poll(async () => (await sayim()).koklar, { timeout: 3000 }).toBe(true);
    const karin = await nokta('karin');
    await git(kay(karin, -250, 0)); await git(kay(karin, 250, 50));
    await git(await nokta('gurultu'));
    await asama('rontgen', 8000); await page.mouse.up();

    // 2 · röntgen: başına tut (aklı mandalinada), sonra üç dilim
    await tut(await dok('Röntgen çerçevesi'));
    await git(await nokta('bas'));
    await expect.poll(async () => (await sayim()).kafa, { timeout: 3000 }).toBe(true);
    for (let i = 0; i < 3; i++) {
      await git(await nokta('dilim' + i));
      await expect.poll(async () => (await sayim()).dilim, { timeout: 4000 }).toBe(i + 1);
    }
    await asama('isit'); await page.mouse.up();

    // 3 · patiler: ısınmadan karna dokununca üşür; karnın dışında sağa sola sürt
    await tut(await dok('Kino\'nun patileri'));
    await git(karin);
    await expect.poll(async () => (await sayim()).usudu, { timeout: 3000 }).toBe(true);
    const disari = kay(karin, 620, -300);
    await git(disari);
    const S = await sayim();
    for (let k = 0; k < S.hedefIsit * 3 && (await asamaNe()) === 'isit'; k++) { await git(kay(disari, k % 2 ? -110 : 110, 0), 4); await page.waitForTimeout(30); }
    await asama('ov');

    // 4 · ov: önce hızlı daire (gıdıklanır), sonra yavaş daireler
    await daire(karin, 200, 150, 1, 6, 0, async () => true);
    await expect.poll(async () => (await sayim()).gidik, { timeout: 3000 }).toBe(true);
    await page.waitForTimeout(950);
    await daire(karin, 200, 150, 4, 72, 22, async () => (await asamaNe()) === 'ov');
    await asama('karistir', 10_000); await page.mouse.up();

    // 5 · karıştır: çayın içinde yavaş daireler
    await tut(await dok('Kaşık'));
    const fincan = await nokta('fincan');
    await git(kay(fincan, 70, 0));
    await daire(fincan, 70, 50, 4, 60, 22, async () => (await asamaNe()) === 'karistir');
    await asama('ufle', 10_000); await page.mouse.up();

    // 6 · üfle: buharın içinden yukarı çek
    const buhar = await nokta('buhar');
    for (let k = 0; k < S.hedefUfle; k++) {
      await page.mouse.move(buhar.x, buhar.y); await page.mouse.down();
      const ust = kay(buhar, 0, -220);
      await page.mouse.move(ust.x, ust.y, { steps: 8 }); await page.mouse.up();
      await expect.poll(async () => (await sayim()).ufle, { timeout: 3000 }).toBe(k + 1);
    }
    await asama('ic');

    // 7 · iç: fincanı ağza götürüp tut (üç yudum)
    await tut(await H<Nokta>(page, 'dugme', '.gr-fincan'));
    await git(await nokta('agiz'));
    await asama('torba', 10_000); await page.mouse.up();
    expect((await sayim()).yudum).toBe(S.hedefYudum);

    // 8 · torba: karnın dışına bırakılırsa geri döner; karna koy, pıt pıt vur
    await tut(await dok('Sıcak su torbası'));
    await git(await nokta('bas')); await page.mouse.up();
    await page.waitForTimeout(300);
    expect((await sayim()).torbaKondu).toBe(false);
    await tut(await dok('Sıcak su torbası'));
    await git(karin); await page.mouse.up();
    await expect.poll(async () => (await sayim()).torbaKondu, { timeout: 3000 }).toBe(true);
    for (let k = 0; k < S.hedefPat; k++) {
      const t = await nokta('torba');
      await page.mouse.click(t.x, t.y);
      await expect.poll(async () => (await sayim()).pat, { timeout: 3000 }).toBe(k + 1);
    }
    await asama('son', 20_000);
    expect(hatalar).toEqual([]);
  });
}
