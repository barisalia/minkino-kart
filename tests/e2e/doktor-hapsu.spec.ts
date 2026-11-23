import { test, expect, type Page } from '@playwright/test';

// Minik Doktor · beşinci vaka "Pamuk'un Hapşırığı" (doktor/src/vaka-hapsu/). Asıl çizimler (Paket Doktor-Y5) gelene kadar
// geliştirme sunucusunda geçici çizimlerle (?taslak) koşar: sekiz adım gerçek parmak hareketleriyle (çek-kopar, zamanında tut,
// sil, eğerek dök, salla, bastır-tut, boydan boya geçir, aşağıdan yukarı çek), komik kaçan hapşırık ve çok uzun nefes, dokunma
// hedefleri, kısa kapanış ve yeniden oynama.
test.beforeEach(async ({ page }, bilgi) => {
  if (bilgi.project.name === 'iphone') await page.setViewportSize({ width: 844, height: 390 });
  if (bilgi.project.name === 'ipad') await page.setViewportSize({ width: 1024, height: 768 });
});

type Nokta = { x: number; y: number };
type Sayim = { yakalanan: number; hedefHapsu: number; sil: number; hedefSil: number; dokulen: number; hedefDok: number; egim: number; papatya: number; hedefPapatya: number; nefes: number; hedefNefes: number; atki: number; ortu: number; mirr: boolean; kacti: boolean };
const H = <T>(page: Page, ad: string, ...arg: unknown[]) =>
  page.evaluate(([a, g]) => (window as unknown as { __hapsu: Record<string, (...x: unknown[]) => unknown> }).__hapsu[a](...g), [ad, arg] as [string, unknown[]]) as Promise<T>;
const enKucukKenar = async (page: Page, sec: string) => {
  const kutular = await page.locator(sec).evaluateAll(hepsi => {
    const s = document.querySelector('#doktor .vk-sahne')!.getBoundingClientRect().width / 2048;
    return hepsi.filter(e => !(e as HTMLElement).hidden).map(e => Math.min((e as HTMLElement).offsetWidth, (e as HTMLElement).offsetHeight) * s);
  });
  expect(kutular.length, sec).toBeGreaterThan(0);
  return Math.min(...kutular);
};

test('hapşırık vakası: çizimler eksikken açılmaz, ekranda hiçbir görüntü yok', async ({ page }) => {
  await page.goto('./doktor/index.html?oyun=hapsu&test');
  const kok = page.locator('#doktor');
  await expect(kok).toHaveAttribute('data-oyun', 'hapsu', { timeout: 30_000 });
  await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
  test.skip((await kok.getAttribute('data-durum')) === 'hazir', 'çizimler gelmiş');
  await expect(kok.locator('img')).toHaveCount(0);
  await expect(kok.locator('.vk-sahne')).toHaveCount(0);
});

for (const yas of ['2-3', '4', '5+']) {
  test(`hapşırık vakası: ${yas} yaş sekiz adım baştan sona; komik hamleler, hedefler iri, yeniden oyna`, async ({ page }) => {
    test.setTimeout(180_000);
    const hatalar: string[] = [];
    page.on('pageerror', e => hatalar.push(e.message));
    const kok = page.locator('#doktor');
    await page.goto('./doktor/index.html?oyun=hapsu&test&yas=' + encodeURIComponent(yas));
    await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
    if ((await kok.getAttribute('data-durum')) === 'eksik') {
      await page.goto('./doktor/index.html?oyun=hapsu&test&taslak&yas=' + encodeURIComponent(yas));
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
    const farkAl = async (m: Nokta) => { const uc = await H<Nokta | null>(page, 'uc'); expect(uc, 'alet elde').not.toBeNull(); fark = { x: uc!.x - m.x, y: uc!.y - m.y }; };
    const tut = async (m: Nokta) => { await page.mouse.move(m.x, m.y); await page.mouse.down(); await page.mouse.move(m.x + 1, m.y + 1); await farkAl({ x: m.x + 1, y: m.y + 1 }); };
    const git = (q: Nokta, steps = 8) => page.mouse.move(q.x - fark.x, q.y - fark.y, { steps });
    /** kutudan mendil çeker: ağızdan yukarı; kopunca mendil elde */
    const mendilCek = async () => {
      const k = await nokta('kutu');
      await page.mouse.move(k.x, k.y); await page.mouse.down();
      const son = kay(k, 0, -260);
      await page.mouse.move(son.x, son.y, { steps: 12 });
      await expect.poll(() => H<Nokta | null>(page, 'uc'), { timeout: 3000 }).not.toBeNull();
      await farkAl(son);
    };
    const S = await sayim();

    // masa: çanta, burun
    await kok.locator('.vk-canta').click({ force: true });
    await expect(kok.locator('.vk-hub .vk-kol-dugmesi')).toBeVisible();
    expect(await enKucukKenar(page, '#doktor .vk-hub .vk-kol-dugmesi')).toBeGreaterThanOrEqual(64);
    await kok.locator('.vk-hub .vk-kol-dugmesi').click({ force: true });
    await asama('mendil');
    for (const sec of ['.hs-kutu', '.hs-raf', '.vk-dok-aleti']) expect(await enKucukKenar(page, '#doktor ' + sec), sec).toBeGreaterThanOrEqual(64);

    // 1–2 · mendil çek; ilk hapşırık kaçar (mendil uzakta), sonra mendil burnun önünde yakalanır
    await mendilCek();
    await asama('hapsu');
    await expect.poll(async () => (await sayim()).kacti, { timeout: 6000 }).toBe(true);
    const burun = await nokta('burun');
    for (let i = 0; i < S.hedefHapsu; i++) {
      if ((await asamaNe()) === 'mendil') { await page.mouse.up(); await mendilCek(); await asama('hapsu'); }
      await git(burun);
      await expect.poll(async () => (await sayim()).yakalanan, { timeout: 8000 }).toBe(i + 1);
    }
    await asama('sil'); await page.mouse.up();

    // 3 · sil
    await mendilCek();
    for (let k = 0; k < 20 && (await asamaNe()) === 'sil'; k++) for (let a = 0; a <= 8; a++) { const t = (a / 8) * Math.PI * 2; await git(kay(burun, Math.cos(t) * 60, Math.sin(t) * 40), 2); }
    await asama('dok'); await page.mouse.up();

    // 4 · demliği kâsenin üstünde eğerek dök
    await tut(await nokta('demlik'));
    const kase = await nokta('kase');
    await git(kay(kase, 0, -320));
    for (let k = 0; k < 6; k++) await git(kay(kase, 0, -320 + (k + 1) * 15), 2);
    await expect.poll(async () => (await sayim()).egim, { timeout: 3000 }).toBeGreaterThanOrEqual(15);
    await asama('papatya', 20_000); await page.mouse.up();
    expect((await sayim()).dokulen).toBe(S.hedefDok);

    // 5 · papatya kavanozunu kâsenin üstünde salla
    await tut(await nokta('kavanoz'));
    const ust = kay(kase, 0, -260);
    await git(ust);
    for (let k = 0; k < S.hedefPapatya * 3 && (await asamaNe()) === 'papatya'; k++) await git(kay(ust, 0, k % 2 ? -70 : 70), 4);
    await asama('nefes'); await page.mouse.up();

    // 6 · buhara bastır-tut (nefes al), bırak (ver); 4 yaşta bir kez çok uzun tutulur (yanaklar şişer)
    const buhar = await nokta('buhar');
    if (yas === '4') {
      await page.mouse.move(buhar.x, buhar.y); await page.mouse.down();
      await expect.poll(() => H<string>(page, 'poz'), { timeout: 5000 }).toBe('sisik');
      await page.mouse.up();
      await page.waitForTimeout(900);
      expect((await sayim()).nefes).toBe(0);
    }
    for (let k = 0; k < S.hedefNefes; k++) {
      await page.mouse.move(buhar.x, buhar.y); await page.mouse.down();
      await page.waitForTimeout(950);
      await page.mouse.up();
      await expect.poll(async () => (await sayim()).nefes, { timeout: 3000 }).toBe(k + 1);
      await page.waitForTimeout(250);
    }
    await asama('atki');

    // 7 · atkı boynun önünde boydan boya
    await tut(await H<Nokta>(page, 'dugme', '.vk-dok-aleti[aria-label="Atkı"]'));
    await git(await nokta('boyunSol')); await git(await nokta('boyunSag'), 14);
    await asama('ort'); await page.mouse.up();

    // 8 · battaniye aşağıdan yukarı; Pamuk esner, mırlar; kutlama
    await tut(await H<Nokta>(page, 'dugme', '.vk-dok-aleti[aria-label="Battaniye"]'));
    await git(await nokta('gogusAlt')); await git(await nokta('gogusUst'), 14);
    await page.mouse.up();
    await expect.poll(async () => (await sayim()).mirr, { timeout: 5000 }).toBe(true);
    await asama('son', 20_000);
    await expect(kok.locator('.vk-tekrar')).toBeVisible();
    expect(await enKucukKenar(page, '#doktor .vk-tekrar')).toBeGreaterThanOrEqual(64);

    // yeniden oyna
    await kok.locator('.vk-tekrar').click({ force: true });
    await expect(kok).toHaveAttribute('data-asama', 'giris', { timeout: 15_000 });
    await expect(kok).toHaveAttribute('data-durum', 'hazir', { timeout: 15_000 });
    expect(await sayim()).toMatchObject({ yakalanan: 0, sil: 0, dokulen: 0, papatya: 0, nefes: 0, atki: 0, ortu: 0, mirr: false, kacti: false });
    expect(hatalar).toEqual([]);
  });
}
