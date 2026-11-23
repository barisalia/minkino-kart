import { test, expect, type Page } from '@playwright/test';

// Minik Doktor · sekizinci vaka "Kuzu'nun Sökük Dikişi" (doktor/src/vaka-kuzu/): oyuncak tamiri, iğne yok. Asıl çizimler (Paket
// Doktor-Y8) gelene kadar geliştirme sunucusunda geçici çizimlerle (?taslak) koşar: pamuk tıkıştır, yama seç-koy-köşelerine bas,
// cırt cırtı yırtık boyunca çek, düğmeyi saat yönünde çevir, kurdeleyi çaprazla ve fiyonku çek, yünü fırçayla kabart.
// Komik yanlış hamleler: hızlı itilen pamuk geri fırlar, kaymış yama düşer, hızlı cırt cırt kıvrılır, ters çevrilen düğme fırlar.
test.beforeEach(async ({ page }, bilgi) => {
  if (bilgi.project.name === 'iphone') await page.setViewportSize({ width: 844, height: 390 });
  if (bilgi.project.name === 'ipad') await page.setViewportSize({ width: 1024, height: 768 });
});

type Nokta = { x: number; y: number };
type Sayim = { itilen: number; hedefPamuk: number; sepettenAlindi: boolean; yamaKondu: boolean; yapisik: number; cirt: number; kivrik: boolean; dugmeTakili: boolean; cevir: number; hedefDugme: number; dugmeBitti: boolean; solTamam: boolean; sagTamam: boolean; bagli: boolean; yun: number; hedefYun: number; geriCikti: boolean; firladi: boolean; kaydi: boolean; kivrildi: boolean };
const H = <T>(page: Page, ad: string, ...arg: unknown[]) =>
  page.evaluate(([a, g]) => (window as unknown as { __kuzu: Record<string, (...x: unknown[]) => unknown> }).__kuzu[a](...g), [ad, arg] as [string, unknown[]]) as Promise<T>;
const enKucukKenar = async (page: Page, sec: string) => {
  const kutular = await page.locator(sec).evaluateAll(hepsi => {
    const s = document.querySelector('#doktor .vk-sahne')!.getBoundingClientRect().width / 2048;
    return hepsi.filter(e => !(e as HTMLElement).hidden).map(e => Math.min((e as HTMLElement).offsetWidth, (e as HTMLElement).offsetHeight) * s);
  });
  expect(kutular.length, sec).toBeGreaterThan(0);
  return Math.min(...kutular);
};

test('kuzu vakası: çizimler eksikken açılmaz, ekranda hiçbir görüntü yok', async ({ page }) => {
  await page.goto('./doktor/index.html?oyun=kuzu&test');
  const kok = page.locator('#doktor');
  await expect(kok).toHaveAttribute('data-oyun', 'kuzu', { timeout: 30_000 });
  await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
  test.skip((await kok.getAttribute('data-durum')) === 'hazir', 'çizimler gelmiş');
  await expect(kok.locator('img')).toHaveCount(0);
});

for (const yas of ['2-3', '4', '5+']) {
  test(`kuzu vakası: ${yas} yaş sekiz adım baştan sona; iğnesiz tamir, komik hamleler, hedefler iri`, async ({ page }) => {
    test.setTimeout(180_000);
    const hatalar: string[] = [];
    page.on('pageerror', e => hatalar.push(e.message));
    const kok = page.locator('#doktor');
    await page.goto('./doktor/index.html?oyun=kuzu&test&yas=' + encodeURIComponent(yas));
    await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
    if ((await kok.getAttribute('data-durum')) === 'eksik') {
      await page.goto('./doktor/index.html?oyun=kuzu&test&taslak&yas=' + encodeURIComponent(yas));
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
    const yavas = async (a: Nokta, b: Nokta, n: number, bekle = 25) => { for (let i = 1; i <= n; i++) { await git({ x: a.x + ((b.x - a.x) * i) / n, y: a.y + ((b.y - a.y) * i) / n }, 1); await page.waitForTimeout(bekle); } };
    const dok = (etiket: string) => H<Nokta>(page, 'dugme', `.vk-dok-aleti[aria-label="${etiket}"]`);
    const surukle = async (m: Nokta, q: Nokta, steps = 8) => { await page.mouse.move(m.x, m.y); await page.mouse.down(); await page.mouse.move(q.x, q.y, { steps }); await page.mouse.up(); };

    // masa: çanta, sökük
    await kok.locator('.vk-canta').click({ force: true });
    await expect(kok.locator('.vk-hub .vk-kol-dugmesi')).toBeVisible();
    expect(await enKucukKenar(page, '#doktor .vk-hub .vk-kol-dugmesi')).toBeGreaterThanOrEqual(64);
    await kok.locator('.vk-hub .vk-kol-dugmesi').click({ force: true });
    await asama('tikistir');
    for (const sec of ['.kz-pamuk', '.kz-yama', '.vk-dok-aleti']) expect(await enKucukKenar(page, '#doktor ' + sec), sec).toBeGreaterThanOrEqual(64);
    const S = await sayim();

    // 1 · pamuk: ilki yavaşça içeri; ikincisini hızlı itince ilki geri fırlar; sonra hepsi (5+ yaşta sepetten bir tutam)
    const sokuk = await nokta('sokuk');
    await tut(await nokta('pamuk0')); await yavas(await nokta('pamuk0'), sokuk, 8); await page.mouse.up();
    await expect.poll(async () => (await sayim()).itilen, { timeout: 3000 }).toBe(1);
    await tut(await nokta('pamuk1')); await git(sokuk, 2);
    for (let k = 0; k < 6 && !(await sayim()).geriCikti; k++) { await git(kay(sokuk, 60, 0), 1); await git(kay(sokuk, -60, 0), 1); }
    await git(sokuk, 1); await page.mouse.up();
    expect((await sayim()).geriCikti).toBe(true);
    for (let k = 0; k < 8 && (await asamaNe()) === 'tikistir'; k++) {
      const gorunen = kok.locator('.kz-pamuk:not([hidden])');
      const kaynak = (await gorunen.count()) > 0 ? await gorunen.first().evaluate(e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }) : await nokta('sepet');
      await tut(kaynak); await yavas(kaynak, sokuk, 8); await page.mouse.up();
      await page.waitForTimeout(250);
    }
    await asama('sec');
    expect((await sayim()).itilen).toBe(S.hedefPamuk);

    // 2–3 · yama: kalbi seç; önce kaymış yere (düşer), sonra söküğün üstüne
    const kalp = await nokta('yama-kalp');
    await page.mouse.click(kalp.x, kalp.y);
    await asama('yama');
    await tut(kalp); await git(kay(sokuk, 210, 0)); await page.mouse.up();
    await expect.poll(async () => (await sayim()).kaydi, { timeout: 3000 }).toBe(true);
    await page.waitForTimeout(300);
    await tut(kalp); await git(sokuk); await page.mouse.up();
    await asama('kose');

    // 4 · köşeler
    for (let i = 0; i < 4; i++) { const k = await nokta('kose' + i); await page.mouse.click(k.x, k.y); await expect.poll(async () => (await sayim()).yapisik, { timeout: 3000 }).toBe(i + 1); }
    await asama('cirt');

    // 5 · cırt cırt: önce hızlı (kıvrılır), yırtıktan çık; sonra yavaşça boydan boya
    const kb = await nokta('kulakBas'), ks = await nokta('kulakSon');
    await tut(await dok('Cırt cırt bant'));
    await git(kb); await yavas(kb, kay(kb, 50, 7), 4);
    for (let k = 0; k < 6 && !(await sayim()).kivrildi; k++) { await git(ks, 2); await git(kay(kb, 50, 7), 2); }
    expect((await sayim()).kivrildi).toBe(true);
    await git(kay(kb, 0, -300)); await page.waitForTimeout(100);
    await git(kb); await yavas(kb, ks, 30, 30);
    await asama('dugme', 8000); await page.mouse.up();

    // 6 · düğme: yuvaya koy; önce ters çevir (fırlar), yeniden koy, saat yönünde çevir
    const goz = await nokta('goz');
    const daire = async (yon: 1 | -1, tur: number) => {
      await page.mouse.move(goz.x + 90 * olcek, goz.y); await page.mouse.down();
      for (let i = 1; i <= tur * 24; i++) { const a = yon * (i / 24) * Math.PI * 2; await page.mouse.move(goz.x + Math.cos(a) * 90 * olcek, goz.y + Math.sin(a) * 90 * olcek); }
      await page.mouse.up();
    };
    await tut(await dok('Düğme göz')); await git(goz); await page.mouse.up();
    await expect.poll(async () => (await sayim()).dugmeTakili, { timeout: 3000 }).toBe(true);
    await daire(-1, 0.6);
    await expect.poll(async () => (await sayim()).firladi, { timeout: 3000 }).toBe(true);
    await page.waitForTimeout(600);
    await tut(await dok('Düğme göz')); await git(goz); await page.mouse.up();
    await expect.poll(async () => (await sayim()).dugmeTakili, { timeout: 3000 }).toBe(true);
    await daire(1, Math.ceil(S.hedefDugme / (Math.PI * 2)) + 0.3);
    await asama('kurdele', 8000);

    // 7 · kurdele: uçları çaprazla, fiyonku yukarı çek
    const boyun = await nokta('boyun');
    await surukle(await nokta('kurdeleSol'), kay(boyun, 110, 60));
    await expect.poll(async () => (await sayim()).solTamam, { timeout: 3000 }).toBe(true);
    await surukle(await nokta('kurdeleSag'), kay(boyun, -110, 60));
    await expect.poll(async () => (await sayim()).sagTamam, { timeout: 3000 }).toBe(true);
    await surukle(boyun, kay(boyun, 0, -140));
    await asama('kabart', 8000);

    // 8 · kabart: yün kıvrımlarında küçük daireler
    await tut(await dok('Yumuşak fırça'));
    for (let i = 0; i < S.hedefYun; i++) {
      const y = await nokta('yun' + i);
      for (let k = 0; k < 6 && (await sayim()).yun <= i; k++) for (let a = 0; a <= 16; a++) { const t = (a / 16) * Math.PI * 2; await git(kay(y, Math.cos(t) * 60, Math.sin(t) * 60), 1); }
      await expect.poll(async () => (await sayim()).yun, { timeout: 3000 }).toBe(i + 1);
    }
    await page.mouse.up();
    await asama('son', 20_000);
    expect(hatalar).toEqual([]);
  });
}
