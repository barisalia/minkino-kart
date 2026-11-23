import { test, expect, type Page } from '@playwright/test';

// Minik Doktor · dokuzuncu vaka "Bulut'un Uğur Böceği" (doktor/src/vaka-bocek/). Asıl çizimler (Paket Doktor-Y9) gelene kadar
// geliştirme sunucusunda geçici çizimlerle (?taslak) koşar: büyüteçle bul, tüyleri arala (saklambaç), yaprağı yavaşça yaklaştır,
// sarsmadan taşı, pervazdan uçur (Kino'nun burnuna konar), kökten uca fırçala, kulağı salla, teşekküre gelen üç böceğe dokun.
// Komik yanlış hamleler: göze büyüteç, hızlı yaprak, sarsılan yaprak, ters fırça, çok sert sallama.
test.beforeEach(async ({ page }, bilgi) => {
  if (bilgi.project.name === 'iphone') await page.setViewportSize({ width: 844, height: 390 });
  if (bilgi.project.name === 'ipad') await page.setViewportSize({ width: 1024, height: 768 });
});

type Nokta = { x: number; y: number };
type Sayim = { bocekTutam: number; gizli: boolean; mesgul: boolean; kacis: number; hedefKacis: number; yapraktaSakli: boolean; bantlar: number[]; hedefBant: number; salla: number; hedefSalla: number; selam: number; saklandi: boolean; goz: boolean; ters: boolean; kor: boolean };
const H = <T>(page: Page, ad: string, ...arg: unknown[]) =>
  page.evaluate(([a, g]) => (window as unknown as { __bocek: Record<string, (...x: unknown[]) => unknown> }).__bocek[a](...g), [ad, arg] as [string, unknown[]]) as Promise<T>;
const enKucukKenar = async (page: Page, sec: string) => {
  const kutular = await page.locator(sec).evaluateAll(hepsi => {
    const s = document.querySelector('#doktor .vk-sahne')!.getBoundingClientRect().width / 2048;
    return hepsi.filter(e => !(e as HTMLElement).hidden).map(e => Math.min((e as HTMLElement).offsetWidth, (e as HTMLElement).offsetHeight) * s);
  });
  expect(kutular.length, sec).toBeGreaterThan(0);
  return Math.min(...kutular);
};

test('uğur böceği vakası: çizimler eksikken açılmaz, ekranda hiçbir görüntü yok', async ({ page }) => {
  await page.goto('./doktor/index.html?oyun=bocek&test');
  const kok = page.locator('#doktor');
  await expect(kok).toHaveAttribute('data-oyun', 'bocek', { timeout: 30_000 });
  await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
  test.skip((await kok.getAttribute('data-durum')) === 'hazir', 'çizimler gelmiş');
  await expect(kok.locator('img')).toHaveCount(0);
  await expect(kok.locator('.vk-sahne')).toHaveCount(0);
});

for (const yas of ['2-3', '4', '5+']) {
  test(`uğur böceği vakası: ${yas} yaş sekiz adım baştan sona; böceğe alet dokunmaz; komik hamleler, hedefler iri`, async ({ page }) => {
    test.setTimeout(180_000);
    const hatalar: string[] = [];
    page.on('pageerror', e => hatalar.push(e.message));
    const kok = page.locator('#doktor');
    await page.goto('./doktor/index.html?oyun=bocek&test&yas=' + encodeURIComponent(yas));
    await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
    if ((await kok.getAttribute('data-durum')) === 'eksik') {
      await page.goto('./doktor/index.html?oyun=bocek&test&taslak&yas=' + encodeURIComponent(yas));
      await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
    }
    test.skip((await kok.getAttribute('data-durum')) === 'eksik', 'çizim yok');
    const asamaNe = () => kok.getAttribute('data-asama');
    const asama = (a: string | RegExp, timeout = 15_000) => expect(kok).toHaveAttribute('data-asama', a, { timeout });
    const nokta = async (ad: string) => (await H<Nokta | null>(page, 'nokta', ad))!;
    const sayim = () => H<Sayim>(page, 'sayim');
    const olcek = await H<number>(page, 'olcek');
    const kay = (q: Nokta, dx: number, dy: number): Nokta => ({ x: q.x + dx * olcek, y: q.y + dy * olcek });
    let fark = { x: 0, y: 0 }, son: Nokta = { x: 0, y: 0 };
    const tut = async (m: Nokta) => {
      await page.mouse.move(m.x, m.y); await page.mouse.down(); await page.mouse.move(m.x + 1, m.y + 1);
      const uc = await H<Nokta | null>(page, 'uc'); expect(uc, 'alet elde').not.toBeNull(); fark = { x: uc!.x - m.x - 1, y: uc!.y - m.y - 1 }; son = uc!;
    };
    const git = async (q: Nokta, steps = 8) => { await page.mouse.move(q.x - fark.x, q.y - fark.y, { steps }); son = q; };
    /** yavaş yürüyüş: her adım en çok `adim` sahne pikseli, adımlar arasında bekleme */
    const yavas = async (q: Nokta, adim: number, bekle = 24) => {
      const a = son, d = Math.hypot(q.x - a.x, q.y - a.y) / olcek, n = Math.max(1, Math.ceil(d / adim));
      for (let i = 1; i <= n; i++) { await git({ x: a.x + ((q.x - a.x) * i) / n, y: a.y + ((q.y - a.y) * i) / n }, 1); await page.waitForTimeout(bekle); }
    };
    const dok = (etiket: string) => H<Nokta>(page, 'dugme', `.vk-dok-aleti[aria-label="${etiket}"]`);
    const bosta = () => expect.poll(async () => (await sayim()).mesgul, { timeout: 6000 }).toBe(false);

    // masa: çanta, kulak
    await kok.locator('.vk-canta').click({ force: true });
    await expect(kok.locator('.vk-hub .vk-kol-dugmesi')).toBeVisible();
    expect(await enKucukKenar(page, '#doktor .vk-hub .vk-kol-dugmesi')).toBeGreaterThanOrEqual(64);
    await kok.locator('.vk-hub .vk-kol-dugmesi').click({ force: true });
    await asama('bul');
    for (const sec of ['.bc-tutam', '.vk-dok-aleti']) expect(await enKucukKenar(page, '#doktor ' + sec), sec).toBeGreaterThanOrEqual(64);

    // 1 · büyüteç: önce göze (kocaman göz, Bulut irkilir), sonra kıpırdayan tutamda tut
    await tut(await dok('Büyüteç'));
    await git(await nokta('goz'));
    await expect.poll(async () => (await sayim()).goz, { timeout: 3000 }).toBe(true);
    await git(await nokta('gizlenen'));
    await asama('arala', 8000); await page.mouse.up();
    await bosta();

    // 2 · arala: boş bir tutam (gıdıklanır), sonra böceğin tutamı; böcek kaçtıkça yeni tutamı
    const S = await sayim();
    const bos = await nokta('tutam' + ((S.bocekTutam + 1) % 3));
    await page.mouse.move(bos.x, bos.y); await page.mouse.down(); await page.mouse.move(bos.x + 160 * olcek, bos.y, { steps: 6 }); await page.mouse.up();
    expect(await asamaNe()).toBe('arala');
    for (let k = 0; k <= S.hedefKacis + 1 && (await asamaNe()) === 'arala'; k++) {
      await bosta();
      const g = (await sayim()).bocekTutam;
      const t = await nokta('tutam' + g);
      await page.mouse.move(t.x, t.y); await page.mouse.down(); await page.mouse.move(t.x - 160 * olcek, t.y, { steps: 6 }); await page.mouse.up();
      await expect.poll(async () => (await sayim()).kacis + ((await asamaNe()) === 'yaprak' ? 99 : 0), { timeout: 6000 }).toBeGreaterThan(k);
    }
    await asama('yaprak'); await bosta();

    // 3 · yaprak: hızlı gelince böcek büzülür; yavaş yaklaşınca yaprağa yürür
    await tut(await dok('Yeşil yaprak'));
    const bocek = await nokta('bocek');
    await git(kay(bocek, 0, 260), 2);
    for (let k = 0; k < 3; k++) { await git(kay(bocek, 0, 40), 2); await git(kay(bocek, 0, 240), 2); }
    await git(kay(bocek, 0, 40), 2);
    await expect.poll(async () => (await sayim()).saklandi, { timeout: 3000 }).toBe(true);
    await page.waitForTimeout(1300);
    await yavas(kay(bocek, 0, 160), 6);
    await yavas(bocek, 3, 30);
    await asama('tasi', 10_000); await bosta();

    // 4 · taşı: sarsınca saklanır, durunca çıkar; yavaşça pencereye
    const sarsBas = son;
    for (let k = 0; k < 4; k++) { await git(kay(sarsBas, 160, 0), 2); await git(sarsBas, 2); }
    await expect.poll(async () => (await sayim()).yapraktaSakli, { timeout: 3000 }).toBe(true);
    await expect.poll(async () => (await sayim()).yapraktaSakli, { timeout: 4000 }).toBe(false);
    await yavas(await nokta('pervaz'), 6);
    await asama('ucur', 10_000); await page.mouse.up();

    // 5 · uçur: pervazdaki böceği yukarı çek; Kino'nun burnuna konar, sonra pencereden gider
    const p = await nokta('pervaz');
    await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.mouse.move(p.x, p.y - 180 * olcek, { steps: 8 }); await page.mouse.up();
    await asama('firca', 15_000);

    // 6 · fırça: ters fırça tüyleri diker; kökten uca her bant
    await tut(await dok('Yumuşak fırça'));
    await git(await nokta('bant0sag')); await page.waitForTimeout(60); await git(await nokta('bant0sol'), 10);
    await expect.poll(async () => (await sayim()).ters, { timeout: 3000 }).toBe(true);
    for (let i = 0; i < S.hedefBant; i++) {
      await git(await nokta(`bant${i}sol`), 6); await page.waitForTimeout(40);
      await git(await nokta(`bant${i}sag`), 16); await page.waitForTimeout(40);
    }
    await asama('salla', 8000); await page.mouse.up();

    // 7 · salla: kulağın ucunu tut; önce çok sert (kulak gözlerine düşer), sonra yukarı aşağı
    const u = await nokta('kulakUcu');
    await page.mouse.move(u.x, u.y); await page.mouse.down();
    await page.mouse.move(u.x, u.y + 330 * olcek, { steps: 6 });
    await expect.poll(async () => (await sayim()).kor, { timeout: 3000 }).toBe(true);
    await page.mouse.move(u.x, u.y, { steps: 6 }); await page.waitForTimeout(950);
    for (let k = 0; k < S.hedefSalla * 2 + 2 && (await asamaNe()) === 'salla'; k++) { await page.mouse.move(u.x, u.y + (k % 2 ? -110 : 110) * olcek, { steps: 5 }); await page.waitForTimeout(30); }
    await page.mouse.up();
    await asama('selam', 8000);

    // 8 · selam: üç böcek pervaza konar; her birine dokun
    await bosta();
    for (let i = 0; i < 3; i++) {
      const s = await nokta('selam' + i);
      await page.mouse.click(s.x, s.y);
      await expect.poll(async () => (await sayim()).selam, { timeout: 3000 }).toBe(i + 1);
    }
    await asama('son', 20_000);
    expect(hatalar).toEqual([]);
  });
}
