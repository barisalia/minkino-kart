import { test, expect, type Page } from '@playwright/test';

// Minik Doktor · dördüncü vaka "Mila'nın Boya Lekeleri" (doktor/src/vaka-boya/). Asıl çizimler (Paket Doktor-Y4) gelene
// kadar yalnız geliştirme sunucusunda, geçici çizimlerle (?taslak; output/doktor/boya-taslak/) koşar: akışı gerçek parmak
// hareketleriyle (ov, kovada çalkala, nokta nokta dokun, püskürt, kurula), yanlış hamleyi (kirli süngerle ovunca mor burun),
// dokunma hedeflerini, kısa kapanışı ve yeniden oynamayı sınar.
test.beforeEach(async ({ page }, bilgi) => {
  if (bilgi.project.name === 'iphone') await page.setViewportSize({ width: 844, height: 390 });
  if (bilgi.project.name === 'ipad') await page.setViewportSize({ width: 1024, height: 768 });
});

type Nokta = { x: number; y: number };
type Sayim = { kopurt: number; hedefKopurt: number; leke: number; biten: number; oranlar: number[]; toplam: number; kirli: boolean; yikama: number; calkala: number; hedefCalkala: number; morBurun: boolean;
  benek: number; hedefBenek: number; pis: number; hedefPis: number; kopuk: number; damla: number; baloncuk: number; hedefBaloncuk: number; ayna: number; hedefAyna: number; saka: boolean };
const boya = <T>(page: Page, ad: string, ...arg: unknown[]) =>
  page.evaluate(([a, g]) => (window as unknown as { __boya: Record<string, (...x: unknown[]) => unknown> }).__boya[a](...g), [ad, arg] as [string, unknown[]]) as Promise<T>;
const enKucukKenar = async (page: Page, sec: string) => {
  const kutular = await page.locator(sec).evaluateAll(hepsi => {
    const s = document.querySelector('#doktor .vk-sahne')!.getBoundingClientRect().width / 2048;
    return hepsi.filter(e => !(e as HTMLElement).hidden).map(e => Math.min((e as HTMLElement).offsetWidth, (e as HTMLElement).offsetHeight) * s);
  });
  expect(kutular.length, sec).toBeGreaterThan(0);
  return Math.min(...kutular);
};

test('boya vakası: çizimler eksikken açılmaz, ekranda hiçbir görüntü yok', async ({ page }) => {
  const hatalar: string[] = [];
  page.on('pageerror', e => hatalar.push(e.message));
  await page.goto('./doktor/index.html?oyun=boya&test');
  const kok = page.locator('#doktor');
  await expect(kok).toHaveAttribute('data-oyun', 'boya', { timeout: 30_000 });
  await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
  test.skip((await kok.getAttribute('data-durum')) === 'hazir', 'çizimler gelmiş: oyun açık');
  expect(Number(await kok.getAttribute('data-eksik'))).toBeGreaterThan(0);
  await expect(kok.locator('img')).toHaveCount(0);
  await expect(kok.locator('canvas')).toHaveCount(0);
  await expect(kok.locator('.vk-sahne')).toHaveCount(0);
  expect(hatalar).toEqual([]);
});

for (const yas of ['2-3', '4', '5+']) {
  test(`boya vakası: ${yas} yaş baştan sona; hedefler iri, boş bant yok, yeniden oyna baştan kurar`, async ({ page }) => {
    test.setTimeout(150_000);
    const hatalar: string[] = [];
    page.on('pageerror', e => hatalar.push(e.message));
    const kok = page.locator('#doktor');
    await page.goto('./doktor/index.html?oyun=boya&test&yas=' + encodeURIComponent(yas));
    await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
    if ((await kok.getAttribute('data-durum')) === 'eksik') {
      await page.goto('./doktor/index.html?oyun=boya&test&taslak&yas=' + encodeURIComponent(yas));
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
    const nokta = async (ad: string, i = 0) => (await boya<Nokta | null>(page, 'nokta', ad, i))!;
    const sayim = () => boya<Sayim>(page, 'sayim');
    const olcek = await boya<number>(page, 'olcek');
    let fark = { x: 0, y: 0 };
    const tut = async (m: Nokta) => {
      await page.mouse.move(m.x, m.y); await page.mouse.down(); await page.mouse.move(m.x + 1, m.y + 1);
      const uc = await boya<Nokta | null>(page, 'uc');
      expect(uc, 'alet parmağa basılınca hemen kalkar').not.toBeNull();
      fark = { x: uc!.x - (m.x + 1), y: uc!.y - (m.y + 1) };
    };
    const git = (q: Nokta, steps = 8) => page.mouse.move(q.x - fark.x, q.y - fark.y, { steps });
    const kay = (q: Nokta, dx: number, dy: number): Nokta => ({ x: q.x + dx * olcek, y: q.y + dy * olcek });
    const daire = async (m: Nokta, r: number, adim = 16) => { for (let k = 0; k <= adim; k++) { const t = (k / adim) * Math.PI * 2; await git(kay(m, Math.cos(t) * r, Math.sin(t) * r), 2); } };
    const S = await sayim();
    expect(S.leke).toBe(yas === '2-3' ? 2 : 4);
    expect(S.hedefBenek).toBe(yas === '2-3' ? 0 : yas === '4' ? 4 : 6);

    // boş bant yok
    const ekran = page.viewportSize()!;
    const sahne = (await kok.locator('.vk-sahne').boundingBox())!;
    const kutu = async (sec: string) => (await kok.locator(sec).boundingBox())!;
    if (sahne.y > 1) { const ust = await kutu('.vk-hub .vk-t-ust'), alt = await kutu('.vk-hub .vk-t-alt'); expect(ust.y).toBeLessThanOrEqual(0.5); expect(alt.y + alt.height).toBeGreaterThanOrEqual(ekran.height - 0.5); }
    if (sahne.x > 1) { const sol = await kutu('.vk-hub .vk-t-sol'), sag = await kutu('.vk-hub .vk-t-sag'); expect(sol.x).toBeLessThanOrEqual(0.5); expect(sag.x + sag.width).toBeGreaterThanOrEqual(ekran.width - 0.5); }

    // masa
    await kok.locator('.vk-canta').click({ force: true });
    await expect(kok.locator('.vk-hub .vk-kol-dugmesi')).toBeVisible();
    expect(await enKucukKenar(page, '#doktor .vk-hub .vk-kol-dugmesi')).toBeGreaterThanOrEqual(64);
    await kok.locator('.vk-hub .vk-kol-dugmesi').click({ force: true });
    await asama('kopurt');
    expect(await enKucukKenar(page, '#doktor .vk-dok-aleti')).toBeGreaterThanOrEqual(64);
    expect(await enKucukKenar(page, '#doktor .by-sunger-yeri')).toBeGreaterThanOrEqual(64);

    // köpürt: sabun kovanın kenarındaki süngerin üstünde ileri geri
    await tut(await nokta('sabun'));
    const sy = await nokta('sunger-yeri');
    await git(sy);
    for (let k = 0; k < S.hedefKopurt * 3 && (await asamaNe()) === 'kopurt'; k++) await git(kay(sy, k % 2 ? -90 : 90, 0), 4);
    await asama('ov'); await page.mouse.up();
    expect((await sayim()).kopurt).toBeGreaterThanOrEqual(S.hedefKopurt);
    await expect(kok.locator('.vk-dok-aleti[aria-label="Sabun"]')).toBeHidden();

    // sünger: lekeleri ov; kirlenince kovada çalkala. 4 ve 5+'ta önce kirli süngerle yüzü ov (yanlış hamle: mor burun)
    await tut(await nokta('sunger'));
    let yanlisDenendi = yas === '2-3';
    for (let tur = 0; tur < 80; tur++) {
      const a = await asamaNe();
      if (a === 'ov') {
        const s = await sayim();
        const i = s.oranlar.findIndex(o => o < 0.9);
        if (i < 0) { await page.waitForTimeout(50); continue; }
        await daire(await nokta('leke', i), 55);
      } else if (a === 'calkala') {
        if (!yanlisDenendi) {
          yanlisDenendi = true;
          // kirlenince ovmayı sürdürmek bir şey yapmaz; yüzden ayrılıp yeniden ovmak burnu mor yapar
          await daire(await nokta('leke', 0), 50, 8);
          expect((await sayim()).morBurun).toBe(false);
          await git(kay(await nokta('kova'), 0, -250));
          await daire(await nokta('yuz'), 60, 10);
          await expect.poll(async () => (await sayim()).morBurun, { timeout: 3000 }).toBe(true);
        }
        const kova = await nokta('kova');
        await git(kova);
        for (let k = 0; k < S.hedefCalkala * 3 && (await asamaNe()) === 'calkala'; k++) await git(kay(kova, k % 2 ? -110 : 110, 0), 4);
      } else break;
    }
    await asama(yas === '2-3' ? 'pisk' : 'cubuk');
    await page.mouse.up();
    const s1 = await sayim();
    expect(s1.biten).toBe(s1.leke);
    expect(s1.leke).toBe(yas === '2-3' ? 2 : 5);          // 4 ve 5+'ta mor burun da temizlendi
    expect(s1.yikama).toBeGreaterThanOrEqual(1);
    expect(s1.kopuk).toBeGreaterThan(0);

    // çubuk: benekleri nokta nokta al
    if (yas !== '2-3') {
      await tut(await nokta('cubuk'));
      for (let i = 0; i < S.hedefBenek; i++) {
        await git(await nokta('benek', i), 6);
        await expect.poll(async () => (await sayim()).benek, { timeout: 3000 }).toBe(i + 1);
      }
      await asama('pisk'); await page.mouse.up();
    }

    // sprey: köpüklü yerlere püskürt (sis memenin solunda)
    await tut(await nokta('sprey'));
    for (let tur = 0; tur < 30 && (await asamaNe()) === 'pisk'; tur++) {
      const k = await boya<Nokta[]>(page, 'kopukler');
      const hedefler = k.length ? k.slice(0, 4) : [await nokta('yuz'), await nokta('leke', 0)];
      for (const p of hedefler) { await git({ x: p.x + 170 * olcek, y: p.y - 10 * olcek }, 4); await page.waitForTimeout(60); }
    }
    await asama('kurula'); await page.mouse.up();
    const s2 = await sayim();
    expect(s2.kopuk).toBe(0); expect(s2.pis).toBeGreaterThanOrEqual(S.hedefPis); expect(s2.damla).toBeGreaterThan(0);

    // havlu: damlaları kurula
    await tut(await nokta('havlu'));
    for (let tur = 0; tur < 30 && (await asamaNe()) === 'kurula'; tur++) {
      for (const d of (await boya<Nokta[]>(page, 'damlalar')).slice(0, 4)) await daire(d, 30, 8);
    }
    await asama('baloncuk'); await page.mouse.up();

    // baloncuklar: kovadan yükselir; dokununca patlar (Mila patileriyle uzanır)
    await expect.poll(async () => (await boya<Nokta[]>(page, 'baloncuklar')).length, { timeout: 4000 }).toBe(S.hedefBaloncuk);
    await page.waitForTimeout(400);
    expect(await enKucukKenar(page, '#doktor .by-baloncuk')).toBeGreaterThanOrEqual(64);
    for (let i = 0; i < S.hedefBaloncuk; i++) {
      const b = (await boya<Nokta[]>(page, 'baloncuklar'))[0];
      await page.mouse.click(b.x, b.y);
      await expect.poll(async () => (await sayim()).baloncuk, { timeout: 3000 }).toBe(i + 1);
      if (i === 0) await expect.poll(() => boya<string>(page, 'poz'), { timeout: 2000 }).toMatch(/^pati[01]$/);
    }
    await asama('ayna');

    // ayna: Mila'nın yüzüne tutulur; önce bakar, sonra poz verir
    await expect(kok.locator('.vk-dok-aleti[aria-label="Ayna"]')).toBeVisible();
    await tut(await nokta('ayna'));
    await git(kay(await nokta('yuz'), 0, -40));
    await expect.poll(() => boya<string>(page, 'poz'), { timeout: 3000 }).toMatch(/^(bakis|ayna|gulen)$/);
    await asama(/kutlama|son/); await page.mouse.up();
    await asama('son');
    await expect(kok.locator('.vk-tekrar')).toBeVisible();
    expect(await enKucukKenar(page, '#doktor .vk-tekrar')).toBeGreaterThanOrEqual(64);
    expect((await sayim()).saka).toBe(true);

    // yeniden oyna
    await kok.locator('.vk-tekrar').click({ force: true });
    await expect(kok).toHaveAttribute('data-asama', 'giris', { timeout: 15_000 });
    await expect(kok).toHaveAttribute('data-durum', 'hazir', { timeout: 15_000 });
    await expect(kok.locator('.vk-sahne')).toHaveCount(1);
    expect(await sayim()).toMatchObject({ kopurt: 0, biten: 0, yikama: 0, morBurun: false, benek: 0, pis: 0, kopuk: 0, damla: 0, baloncuk: 0, ayna: 0, saka: false });
    await kok.locator('.vk-canta').click({ force: true });
    await expect(kok.locator('.vk-hub .vk-kol-dugmesi')).toBeVisible();
    await kok.locator('.vk-hub .vk-kol-dugmesi').click({ force: true });
    await asama('kopurt');
    expect(hatalar).toEqual([]);
  });
}
