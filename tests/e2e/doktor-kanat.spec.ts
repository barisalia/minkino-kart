import { test, expect, type Page } from '@playwright/test';

// Minik Doktor · altıncı vaka "Polly'nin Karışık Kanadı" (doktor/src/vaka-kanat/). Asıl çizimler (Paket Doktor-Y6) gelene
// kadar geliştirme sunucusunda geçici çizimlerle (?taslak) koşar: sekiz adım gerçek parmak hareketleriyle (yavaşça aç, çekip
// kopar ve bırak, kökten uca tara, çevirip oturt, yukarı aşağı çırp, koy ve iki ucu bağla, uzat-çek, taşı), komik hamleler
// (hızlı açınca "Ouch!", pıtrak başa, ters tarama), dokunma hedefleri, kapanış ve yeniden oynama.
test.beforeEach(async ({ page }, bilgi) => {
  if (bilgi.project.name === 'iphone') await page.setViewportSize({ width: 844, height: 390 });
  if (bilgi.project.name === 'ipad') await page.setViewportSize({ width: 1024, height: 768 });
});

type Nokta = { x: number; y: number };
type Sayim = { acik: number; pitrak: number; hedefPitrak: number; bant: number; hedefBant: number; tuyAci: number; tuyVar: boolean; cirp: number; hedefCirp: number; bagli: number; isirik: number; hedefIsirik: number; sapka: boolean; ters: number };
const K = <T>(page: Page, ad: string, ...arg: unknown[]) =>
  page.evaluate(([a, g]) => (window as unknown as { __kanat: Record<string, (...x: unknown[]) => unknown> }).__kanat[a](...g), [ad, arg] as [string, unknown[]]) as Promise<T>;
const enKucukKenar = async (page: Page, sec: string) => {
  const kutular = await page.locator(sec).evaluateAll(hepsi => {
    const s = document.querySelector('#doktor .vk-sahne')!.getBoundingClientRect().width / 2048;
    return hepsi.filter(e => !(e as HTMLElement).hidden).map(e => Math.min((e as HTMLElement).offsetWidth, (e as HTMLElement).offsetHeight) * s);
  });
  expect(kutular.length, sec).toBeGreaterThan(0);
  return Math.min(...kutular);
};

test('kanat vakası: çizimler eksikken açılmaz, ekranda hiçbir görüntü yok', async ({ page }) => {
  await page.goto('./doktor/index.html?oyun=kanat&test');
  const kok = page.locator('#doktor');
  await expect(kok).toHaveAttribute('data-oyun', 'kanat', { timeout: 30_000 });
  await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
  test.skip((await kok.getAttribute('data-durum')) === 'hazir', 'çizimler gelmiş');
  await expect(kok.locator('img')).toHaveCount(0);
  await expect(kok.locator('.vk-sahne')).toHaveCount(0);
});

for (const yas of ['2-3', '4', '5+']) {
  test(`kanat vakası: ${yas} yaş sekiz adım baştan sona; komik hamleler, hedefler iri, yeniden oyna`, async ({ page }) => {
    test.setTimeout(180_000);
    const hatalar: string[] = [];
    page.on('pageerror', e => hatalar.push(e.message));
    const kok = page.locator('#doktor');
    await page.goto('./doktor/index.html?oyun=kanat&test&yas=' + encodeURIComponent(yas));
    await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
    if ((await kok.getAttribute('data-durum')) === 'eksik') {
      await page.goto('./doktor/index.html?oyun=kanat&test&taslak&yas=' + encodeURIComponent(yas));
      await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
    }
    test.skip((await kok.getAttribute('data-durum')) === 'eksik', 'çizim yok');
    const asamaNe = () => kok.getAttribute('data-asama');
    const asama = (a: string | RegExp, timeout = 15_000) => expect(kok).toHaveAttribute('data-asama', a, { timeout });
    const nokta = async (ad: string, i = 0) => (await K<Nokta | null>(page, 'nokta', ad, i))!;
    const sahnede = (p: Nokta) => K<Nokta>(page, 'ekrana', p);
    const sayim = () => K<Sayim>(page, 'sayim');
    const olcek = await K<number>(page, 'olcek');
    const kay = (q: Nokta, dx: number, dy: number): Nokta => ({ x: q.x + dx * olcek, y: q.y + dy * olcek });
    let fark = { x: 0, y: 0 };
    const tut = async (m: Nokta) => {
      await page.mouse.move(m.x, m.y); await page.mouse.down(); await page.mouse.move(m.x + 1, m.y + 1);
      const uc = await K<Nokta | null>(page, 'uc'); expect(uc, 'alet elde').not.toBeNull();
      fark = { x: uc!.x - (m.x + 1), y: uc!.y - (m.y + 1) };
    };
    const git = (q: Nokta, steps = 8) => page.mouse.move(q.x - fark.x, q.y - fark.y, { steps });
    /** parmağı yavaşça (adım adım, bekleyerek) götürür */
    const yavas = async (a: Nokta, b: Nokta, adim = 30, ms = 35) => { for (let k = 1; k <= adim; k++) { await page.mouse.move(a.x + ((b.x - a.x) * k) / adim, a.y + ((b.y - a.y) * k) / adim); await page.waitForTimeout(ms); } };
    const S = await sayim();
    expect(S.tuyVar).toBe(yas !== '2-3');

    await kok.locator('.vk-canta').click({ force: true });
    await expect(kok.locator('.vk-hub .vk-kol-dugmesi')).toBeVisible();
    await kok.locator('.vk-hub .vk-kol-dugmesi').click({ force: true });
    await asama('ac');
    for (const sec of ['.kn-uc', '.kn-sapka', '.vk-dok-aleti']) expect(await enKucukKenar(page, '#doktor ' + sec), sec).toBeGreaterThanOrEqual(64);

    // 1 · kanadı aç: önce hızlı (Ouch!), sonra yavaşça
    const uc0 = await nokta('uc'), acik = await nokta('acik');
    await page.mouse.move(uc0.x, uc0.y); await page.mouse.down();
    await page.mouse.move(acik.x, acik.y, { steps: 3 });
    await expect.poll(() => K<string>(page, 'poz'), { timeout: 3000 }).toBe('ouch');
    expect((await sayim()).acik).toBeLessThan(0.97);
    await page.mouse.up();
    const ucSimdi = await nokta('uc');
    await page.mouse.move(ucSimdi.x, ucSimdi.y); await page.mouse.down();
    await yavas(ucSimdi, acik, 45, 40);
    await asama('pitrak'); await page.mouse.up();

    // 2 · pıtraklar: ilki başa bırakılır (Hey!), öbürleri tepsiye
    await expect(kok.locator('.kn-pitrak').first()).toBeVisible();
    for (let i = 0; i < S.hedefPitrak; i++) {
      const p = await nokta('pitrak', i);
      await page.mouse.move(p.x, p.y); await page.mouse.down();
      await page.mouse.move(p.x, p.y - 220 * olcek, { steps: 10 });
      await expect.poll(() => K<Nokta | null>(page, 'uc'), { timeout: 3000 }).not.toBeNull();
      const uc = (await K<Nokta>(page, 'uc'));
      fark = { x: uc.x - p.x, y: uc.y - (p.y - 220 * olcek) };
      await git(i === 0 ? await nokta('bas') : await nokta('tepsi'), 10);
      await page.mouse.up();
      if (i === 0) await expect.poll(() => K<string>(page, 'poz'), { timeout: 2000 }).toBe('hey');
      await expect.poll(async () => (await sayim()).pitrak, { timeout: 4000 }).toBe(i + 1);
    }
    await asama('tara');

    // 3 · tara: önce ters (tüy kabarır), sonra her şeridi kökten uca
    await tut(await K<Nokta>(page, 'dugme', '.vk-dok-aleti[aria-label="Tarak"]'));
    await git(await nokta('bantSag', 0)); await git(await nokta('bantSol', 0), 10);
    await expect.poll(async () => (await sayim()).ters, { timeout: 2000 }).toBeGreaterThanOrEqual(1);
    for (let tur = 0; tur < 3 && (await asamaNe()) === 'tara'; tur++) for (let i = 0; i < S.hedefBant; i++) { await git(await nokta('bantSol', i), 4); await git(await nokta('bantSag', i), 20); }
    await asama(yas === '2-3' ? 'cirp' : 'tuy'); await page.mouse.up();
    expect((await sayim()).bant).toBe(S.hedefBant);

    // 4 · eğik tüyü çevirip oturt
    if (S.tuyVar) {
      const t = await nokta('tuy');
      await page.mouse.move(t.x, t.y); await page.mouse.down();
      for (let a = -36; a <= 24; a += 6) { const q = await sahnede({ x: 1180 + Math.cos((a * Math.PI) / 180) * 240, y: 700 + Math.sin((a * Math.PI) / 180) * 240 }); await page.mouse.move(q.x, q.y, { steps: 2 }); if ((await asamaNe()) !== 'tuy') break; }
      await asama('cirp'); await page.mouse.up();
    }

    // 5 · çırp: kanadın ucu yukarı aşağı
    const ucC = await nokta('uc');
    await page.mouse.move(ucC.x, ucC.y); await page.mouse.down();
    for (let k = 0; k < S.hedefCirp * 3 && (await asamaNe()) === 'cirp'; k++) await page.mouse.move(ucC.x, ucC.y + (k % 2 ? -110 : 110) * olcek, { steps: 4 });
    await asama('aski'); await page.mouse.up();

    // 6 · askıyı kanadın altına koy; iki ucunu boynun arkasında birleştir
    await tut(await K<Nokta>(page, 'dugme', '.vk-dok-aleti[aria-label="Kanat askısı"]'));
    await git(await nokta('orta'), 10);
    await asama('dugum'); await page.mouse.up();
    for (const etiket of ['Askının sol ucu', 'Askının sağ ucu']) {
      await expect(kok.locator(`.kn-aski-ucu[aria-label="${etiket}"]`)).toBeVisible();
      await page.waitForTimeout(250);
      await tut(await K<Nokta>(page, 'dugme', `.kn-aski-ucu[aria-label="${etiket}"]`));
      await git(await nokta('boyun'), 10); await page.mouse.up();
    }
    await asama('kraker');
    expect((await sayim()).bagli).toBe(2);

    // 7 · kraker: uzat, çek, yine uzat
    await tut(await K<Nokta>(page, 'dugme', '.vk-dok-aleti[aria-label="Kraker"]'));
    const gaga = await nokta('gaga');
    for (let k = 0; k < S.hedefIsirik; k++) { await git(kay(gaga, 200, 120), 6); await git(gaga, 6); await expect.poll(async () => (await sayim()).isirik, { timeout: 3000 }).toBe(k + 1); }
    await asama('sapka'); await page.mouse.up();

    // 8 · şapkayı başına taşı; kapanış
    await tut(await nokta('sapka'));
    await git(await nokta('tepe'), 12);
    await page.mouse.up();
    await expect.poll(async () => (await sayim()).sapka, { timeout: 4000 }).toBe(true);
    await asama('son', 20_000);
    await expect(kok.locator('.vk-tekrar')).toBeVisible();
    expect(await enKucukKenar(page, '#doktor .vk-tekrar')).toBeGreaterThanOrEqual(64);

    await kok.locator('.vk-tekrar').click({ force: true });
    await expect(kok).toHaveAttribute('data-asama', 'giris', { timeout: 15_000 });
    await expect(kok).toHaveAttribute('data-durum', 'hazir', { timeout: 15_000 });
    expect(await sayim()).toMatchObject({ acik: 0, pitrak: 0, bant: 0, cirp: 0, bagli: 0, isirik: 0, sapka: false, ters: 0 });
    expect(hatalar).toEqual([]);
  });
}
