import { test, expect, type Page } from '@playwright/test';

// Minik Doktor · üçüncü vaka "Bulut'un Ateşi" (doktor/src/vaka-ates/). Asıl çizimler (Paket Doktor-Y3) gelene kadar yalnız
// geliştirme sunucusunda, geçici çizimlerle (?taslak; output/doktor/ates-taslak/) koşar: akışı gerçek parmak
// hareketleriyle (salla, tut, daldır, aşağı çekerek sık, gezdir, at, çevir, koy), dokunma hedeflerini, kısa kapanışı ve
// yeniden oynamayı sınar. Çizimler gelince aynı test gerçek çizimlerle koşar.
test.beforeEach(async ({ page }, bilgi) => {
  if (bilgi.project.name === 'iphone') await page.setViewportSize({ width: 844, height: 390 });
  if (bilgi.project.name === 'ipad') await page.setViewportSize({ width: 1024, height: 768 });   // yatay iPad (4:3)
});

type Nokta = { x: number; y: number };
type Sayim = { salla: number; hedefSalla: number; olc: number; olc2: number; hedefOlc: number; daldir: number; sik: number; kizariklik: number; bezTuru: number; ic: number; hedefIc: number; buz: number; hedefBuz: number; kapak: number; hedefKapak: number; torbaBasta: boolean; yelpaze: number; hedefYelpaze: number; yun: number; ferah: boolean };
const ates = <T>(page: Page, ad: string, ...arg: unknown[]) =>
  page.evaluate(([a, g]) => (window as unknown as { __ates: Record<string, (...x: unknown[]) => unknown> }).__ates[a](...g), [ad, arg] as [string, unknown[]]) as Promise<T>;
const enKucukKenar = async (page: Page, sec: string) => {
  // yerleşim boyu × sahne ölçeği: beliriş ve nabız animasyonlarının anlık ölçeği ölçüme karışmaz
  const kutular = await page.locator(sec).evaluateAll(hepsi => {
    const s = document.querySelector('#doktor .vk-sahne')!.getBoundingClientRect().width / 2048;
    return hepsi.filter(e => !(e as HTMLElement).hidden).map(e => Math.min((e as HTMLElement).offsetWidth, (e as HTMLElement).offsetHeight) * s);
  });
  expect(kutular.length, sec).toBeGreaterThan(0);
  return Math.min(...kutular);
};

test('ateş vakası: çizimler eksikken açılmaz, ekranda hiçbir görüntü yok', async ({ page }) => {
  const hatalar: string[] = [];
  page.on('pageerror', e => hatalar.push(e.message));
  await page.goto('./doktor/index.html?oyun=ates&test');
  const kok = page.locator('#doktor');
  await expect(kok).toHaveAttribute('data-oyun', 'ates', { timeout: 30_000 });
  await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
  test.skip((await kok.getAttribute('data-durum')) === 'hazir', 'çizimler gelmiş: oyun açık');
  expect(Number(await kok.getAttribute('data-eksik'))).toBeGreaterThan(0);
  await expect(kok.locator('img')).toHaveCount(0);
  await expect(kok.locator('canvas')).toHaveCount(0);
  await expect(kok.locator('.vk-sahne')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Geri' })).toBeVisible();
  expect(hatalar).toEqual([]);
});

for (const yas of ['2-3', '4', '5+']) {
  test(`ateş vakası: ${yas} yaş baştan sona; hedefler iri, boş bant yok, yeniden oyna baştan kurar`, async ({ page }) => {
    test.setTimeout(150_000);
    const hatalar: string[] = [];
    page.on('pageerror', e => hatalar.push(e.message));
    const kok = page.locator('#doktor');
    await page.goto('./doktor/index.html?oyun=ates&test&yas=' + encodeURIComponent(yas));
    await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
    if ((await kok.getAttribute('data-durum')) === 'eksik') {
      await page.goto('./doktor/index.html?oyun=ates&test&taslak&yas=' + encodeURIComponent(yas));
      await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
    }
    test.skip((await kok.getAttribute('data-durum')) === 'eksik', 'çizimler gelmedi ve geçici çizim yok (derlenmiş sayfa)');
    const kirik = await page.evaluate(async () => {
      const hepsi = [...document.querySelectorAll<HTMLImageElement>('#doktor img')];
      await Promise.all(hepsi.map(i => i.decode().catch(() => undefined)));
      return hepsi.filter(i => i.src && !i.naturalWidth).map(i => i.src);
    });
    test.skip(kirik.length > 0, 'geçici çizimler bu makinede yok');

    const asamaNe = () => kok.getAttribute('data-asama');
    const asama = (a: string | RegExp) => expect(kok).toHaveAttribute('data-asama', a, { timeout: 15_000 });
    const nokta = async (ad: string, i = 0) => (await ates<Nokta | null>(page, 'nokta', ad, i))!;
    const sayim = () => ates<Sayim>(page, 'sayim');
    const olcek = await ates<number>(page, 'olcek');
    let fark = { x: 0, y: 0 };
    const tut = async (m: Nokta) => {
      await page.mouse.move(m.x, m.y); await page.mouse.down(); await page.mouse.move(m.x + 1, m.y + 1);
      const uc = await ates<Nokta | null>(page, 'uc');
      expect(uc, 'alet parmağa basılınca hemen kalkar').not.toBeNull();
      fark = { x: uc!.x - (m.x + 1), y: uc!.y - (m.y + 1) };
    };
    /** aletin ucunu q'ya götürür */
    const git = (q: Nokta, steps = 8) => page.mouse.move(q.x - fark.x, q.y - fark.y, { steps });
    const kay = (q: Nokta, dx: number, dy: number): Nokta => ({ x: q.x + dx * olcek, y: q.y + dy * olcek });
    const S = await sayim();
    expect(S.hedefBuz).toBe(yas === '2-3' ? 2 : yas === '4' ? 3 : 4);
    expect(S.hedefSalla > 0).toBe(yas !== '2-3');

    // boş bant yok: sahnenin dışında kalan pay kenar uzantısıyla dolu
    const ekran = page.viewportSize()!;
    const sahne = (await kok.locator('.vk-sahne').boundingBox())!;
    const kutu = async (sec: string) => (await kok.locator(sec).boundingBox())!;
    if (sahne.y > 1) { const ust = await kutu('.vk-hub .vk-t-ust'), alt = await kutu('.vk-hub .vk-t-alt'); expect(ust.y).toBeLessThanOrEqual(0.5); expect(alt.y + alt.height).toBeGreaterThanOrEqual(ekran.height - 0.5); }
    if (sahne.x > 1) { const sol = await kutu('.vk-hub .vk-t-sol'), sag = await kutu('.vk-hub .vk-t-sag'); expect(sol.x).toBeLessThanOrEqual(0.5); expect(sag.x + sag.width).toBeGreaterThanOrEqual(ekran.width - 0.5); }

    // masa: çanta, alın
    await kok.locator('.vk-canta').click({ force: true });
    await expect(kok.locator('.vk-hub .vk-kol-dugmesi')).toBeVisible();
    expect(await enKucukKenar(page, '#doktor .vk-hub .vk-kol-dugmesi')).toBeGreaterThanOrEqual(64);
    await kok.locator('.vk-hub .vk-kol-dugmesi').click({ force: true });
    await asama(yas === '2-3' ? 'olc' : 'salla');
    expect(await enKucukKenar(page, '#doktor .vk-dok-aleti')).toBeGreaterThanOrEqual(64);
    expect(await enKucukKenar(page, '#doktor .at-kup')).toBeGreaterThanOrEqual(64);

    // termometre: önce salla (hızlı ileri geri), sonra alına tut
    await tut(await nokta('termometre'));
    const alin = await nokta('alin');
    if (yas !== '2-3') {
      const orta = kay(alin, -420, 120);
      await git(orta);
      for (let k = 0; k < S.hedefSalla * 3 && (await asamaNe()) === 'salla'; k++) await git(kay(orta, k % 2 ? -110 : 110, 0), 4);
      await asama('olc');
      expect((await sayim()).salla).toBeGreaterThanOrEqual(S.hedefSalla);
    }
    await git(alin);
    await asama('daldir');
    await page.mouse.up();
    expect((await sayim()).olc).toBe(S.hedefOlc);

    // bez: kâseye daldır, kâsenin üstünde aşağı çekerek sık, yüzde gezdir (5+'ta bez ısınır, yeniden ıslatılır)
    await tut(await nokta('bez'));
    const su = await nokta('su'), ust = await nokta('kase-ust');
    for (let tur = 0; tur < 40; tur++) {
      const a = await asamaNe();
      if (a === 'daldir') { await git(su); for (let k = 0; k < 6; k++) await git(kay(su, k % 2 ? -60 : 60, 10), 3); }
      else if (a === 'sik') { await git(ust, 4); await git(kay(ust, 0, 250), 8); }
      else if (a === 'bez') {
        for (const i of [0, 1]) { const y = await nokta('yanak', i); for (let k = 0; k <= 16; k++) { const t = (k / 16) * Math.PI * 2; await git(kay(y, Math.cos(t) * 80, Math.sin(t) * 80), 2); } }
      } else break;
    }
    await asama('ic');
    await page.mouse.up();
    const s1 = await sayim();
    expect(s1.kizariklik).toBeGreaterThanOrEqual(1);
    expect(s1.bezTuru).toBe(yas === '5+' ? 2 : 1);

    // su: pipet önce burna (gıdıklar, Bulut kıkırdar), sonra ağza; Bulut yudum yudum içer
    await expect(kok.locator('.vk-dok-aleti[aria-label="Su bardağı"]')).toBeVisible();
    await tut(await nokta('bardak'));
    await git(await nokta('burun'));
    await expect.poll(() => ates<string>(page, 'poz'), { timeout: 3000 }).toBe('kikir');
    await git(await nokta('agiz'));
    await expect.poll(() => ates<string>(page, 'poz'), { timeout: 3000 }).toMatch(/^(ic[012]|yutkun)$/);
    await asama('buz');
    await page.mouse.up();
    expect((await sayim()).ic).toBe((await sayim()).hedefIc);

    // buz: küpler torbaya tek tek; önce biri burna değer (komik), tepsiye döner
    await expect(kok.locator('.at-torba')).toBeVisible();
    const agiz = await nokta('torba-agiz');
    await tut(await nokta('kup', 0)); await git(await nokta('burun')); await page.mouse.up();
    await page.waitForTimeout(250);
    expect((await sayim()).buz).toBe(0);
    for (let i = 0; i < S.hedefBuz; i++) {
      await tut(await nokta('kup', i)); await git(kay(agiz, 0, -90)); await page.mouse.up();
      await expect.poll(async () => (await sayim()).buz, { timeout: 4000 }).toBe(i + 1);
    }
    await asama('kapat');

    // kapak: torbanın ağzının çevresinde parmakla çevir
    expect(await enKucukKenar(page, '#doktor .at-torba-dugmesi')).toBeGreaterThanOrEqual(64);
    const torba = await nokta('torba');
    await page.mouse.move(torba.x, torba.y); await page.mouse.down();
    for (let k = 0; k <= 48 * 3 && (await asamaNe()) === 'kapat'; k++) { const t = (k / 48) * Math.PI * 2; await page.mouse.move(agiz.x + Math.cos(t) * 150 * olcek, agiz.y + Math.sin(t) * 150 * olcek, { steps: 1 }); }
    await page.mouse.up();
    await asama('koy');
    expect((await sayim()).kapak).toBeGreaterThanOrEqual(S.hedefKapak);

    // torba başa: Bulut ürperir
    await tut(torba); await git(await nokta('tepe'));
    await asama('yelpaze'); await page.mouse.up();
    expect((await sayim()).torbaBasta).toBe(true);
    await expect.poll(() => ates<string>(page, 'poz'), { timeout: 3000 }).toMatch(/^urper[01]$/);

    // yelpaze: yüzün yanında sağa sola; yün kabarır
    await tut(await nokta('yelpaze'));
    const yuz = await nokta('yuz');
    const yan = kay(yuz, 420, -40);
    await git(yan);
    for (let k = 0; k < S.hedefYelpaze * 3 && (await asamaNe()) === 'yelpaze'; k++) await git(kay(yan, k % 2 ? -120 : 120, 0), 4);
    await asama('olc2'); await page.mouse.up();
    const s2 = await sayim();
    expect(s2.yelpaze).toBeGreaterThanOrEqual(S.hedefYelpaze); expect(s2.yun).toBe(3);

    // termometre yeniden: yeşil
    await tut(await nokta('termometre')); await git(alin);
    await asama(/kutlama|son/); await page.mouse.up();
    await asama('son');
    await expect(kok.locator('.vk-tekrar')).toBeVisible();
    expect((await sayim()).ferah).toBe(true);
    expect(await enKucukKenar(page, '#doktor .vk-tekrar')).toBeGreaterThanOrEqual(64);

    // yeniden oyna: her şey baştan
    await kok.locator('.vk-tekrar').click({ force: true });
    await expect(kok).toHaveAttribute('data-asama', 'giris', { timeout: 15_000 });
    await expect(kok).toHaveAttribute('data-durum', 'hazir', { timeout: 15_000 });
    await expect(kok.locator('.vk-sahne')).toHaveCount(1);
    expect(await sayim()).toMatchObject({ salla: 0, olc: 0, olc2: 0, daldir: 0, sik: 0, kizariklik: 0, ic: 0, buz: 0, kapak: 0, torbaBasta: false, yelpaze: 0, yun: 0, ferah: false });
    await kok.locator('.vk-canta').click({ force: true });
    await expect(kok.locator('.vk-hub .vk-kol-dugmesi')).toBeVisible();
    await kok.locator('.vk-hub .vk-kol-dugmesi').click({ force: true });
    await asama(yas === '2-3' ? 'olc' : 'salla');
    expect(hatalar).toEqual([]);
  });
}

test('ateş vakası: dikey telefonda "yan çevir" işareti çıkar, oyun görünmez', async ({ page }, bilgi) => {
  test.skip(bilgi.project.name !== 'iphone', 'yalnız telefonda');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./doktor/index.html?oyun=ates&test&taslak');
  const kok = page.locator('#doktor');
  await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
  await expect(page.locator('.vk-cevir')).toBeVisible();
  expect(await kok.evaluate(e => getComputedStyle(e).visibility)).toBe('hidden');
});
