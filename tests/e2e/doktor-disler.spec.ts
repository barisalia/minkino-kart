import { test, expect, type Page } from '@playwright/test';

// Minik Doktor · "Mino'nun Kurabiyeli Dişleri" (doktor/src/vaka-dis/, dokuz adım). Asıl çizimler (Paket Doktor-Y2) gelene kadar
// geliştirme sunucusunda geçici çizimlerle (?taslak; npx vite-node doktor/araclar/disler-taslak.ts) koşar: gıdıkla, ağız aynası,
// diş sayma, macun sıkma, fırçalama, su, çalkalama, ip ve gülüş gerçek parmak hareketleriyle; komik yanlış hamleler, dokunma
// hedefleri, kısa kapanış ve yeniden oynama.
test.beforeEach(async ({ page }, bilgi) => {
  if (bilgi.project.name === 'iphone') await page.setViewportSize({ width: 844, height: 390 });
  if (bilgi.project.name === 'ipad') await page.setViewportSize({ width: 1024, height: 768 });
});

type Nokta = { x: number; y: number };
type Durum = { gidik: number; bulunan: number; sayilan: number; tat: number; serit: number; temiz: number; dil: boolean; su: number; calkala: number; ip: number; gulus: number; bas: string; kase: string; burun: boolean;
  hedef: { gidik: number; kirinti: number; say: number; temiz: number; dil: boolean; calkala: number; aralik: number } };
const D = <T>(page: Page, ad: string, ...arg: unknown[]) =>
  page.evaluate(([a, g]) => (window as unknown as { __disler: Record<string, (...x: unknown[]) => unknown> }).__disler[a](...g), [ad, arg] as [string, unknown[]]) as Promise<T>;
const enKucukKenar = async (page: Page, sec: string) => {
  const kutular = await page.locator(sec).evaluateAll(hepsi => {
    const s = document.querySelector('#doktor .vk-sahne')!.getBoundingClientRect().width / 2048;
    return hepsi.filter(e => !(e as HTMLElement).hidden).map(e => Math.min((e as HTMLElement).offsetWidth, (e as HTMLElement).offsetHeight) * s);
  });
  expect(kutular.length, sec).toBeGreaterThan(0);
  return Math.min(...kutular);
};

test('diş vakası (yeni): çizimler eksikken açılmaz, ekranda hiçbir görüntü yok', async ({ page }) => {
  await page.goto('./doktor/index.html?oyun=disler&test');
  const kok = page.locator('#doktor');
  await expect(kok).toHaveAttribute('data-oyun', 'disler', { timeout: 30_000 });
  await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
  test.skip((await kok.getAttribute('data-durum')) === 'hazir', 'çizimler gelmiş');
  await expect(kok.locator('img')).toHaveCount(0);
  await expect(kok.locator('.vk-sahne')).toHaveCount(0);
});

for (const yas of ['2-3', '4', '5+']) {
  test(`diş vakası (yeni): ${yas} yaş dokuz adım baştan sona; komik hamleler, hedefler iri, yeniden oyna`, async ({ page }) => {
    test.setTimeout(180_000);
    const hatalar: string[] = [];
    page.on('pageerror', e => hatalar.push(e.message));
    const kok = page.locator('#doktor');
    await page.goto('./doktor/index.html?oyun=disler&test&yas=' + encodeURIComponent(yas));
    await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
    if ((await kok.getAttribute('data-durum')) === 'eksik') {
      await page.goto('./doktor/index.html?oyun=disler&test&taslak&yas=' + encodeURIComponent(yas));
      await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
    }
    test.skip((await kok.getAttribute('data-durum')) === 'eksik', 'çizim yok');
    const kirik = await page.evaluate(async () => { const h = [...document.querySelectorAll<HTMLImageElement>('#doktor img')]; await Promise.all(h.map(i => i.decode().catch(() => undefined))); return h.filter(i => i.src && !i.naturalWidth).length; });
    test.skip(kirik > 0, 'geçici çizimler bu makinede yok (npx vite-node doktor/araclar/disler-taslak.ts)');

    const asamaNe = () => kok.getAttribute('data-asama');
    const asama = (a: string | RegExp, timeout = 15_000) => expect(kok).toHaveAttribute('data-asama', a, { timeout });
    const durum = () => D<Durum>(page, 'durum');
    const nokta = async (ad: string, ...arg: unknown[]) => (await D<Nokta | null>(page, ad, ...arg))!;
    const dugme = async (etiket: string) => (await D<Nokta | null>(page, 'dugme', `[aria-label="${etiket}"]`))!;
    const olcek = await D<number>(page, 'olcek');
    const dokun = async (q: Nokta) => { await page.mouse.move(q.x, q.y); await page.mouse.down(); await page.mouse.up(); };
    let fark = { x: 0, y: 0 };
    const tut = async (m: Nokta) => {
      await page.mouse.move(m.x, m.y); await page.mouse.down(); await page.mouse.move(m.x + 1, m.y + 1);
      const uc = await D<Nokta | null>(page, 'uc'); expect(uc, 'alet parmağa basılınca hemen kalkar').not.toBeNull();
      fark = { x: uc!.x - (m.x + 1), y: uc!.y - (m.y + 1) };
    };
    const git = (q: Nokta, steps = 6) => page.mouse.move(q.x - fark.x, q.y - fark.y, { steps });
    const Z = (await durum()).hedef;

    // masa: çanta, Mino'nun ağzı
    await dokun(await nokta('canta'));
    await asama('canta');
    await expect(kok.locator('.vk-kol-dugmesi')).toBeVisible();
    expect(await enKucukKenar(page, '#doktor .vk-kol-dugmesi')).toBeGreaterThanOrEqual(64);
    await dokun(await nokta('hasta'));
    await asama('gidik');

    // 1) gıdıkla: ağız kapalı; parmak çenenin altında gezdikçe kıkırdar, sonunda açar
    expect((await durum()).bas).toMatch(/mino-yakin-kapali/);
    const g = await nokta('gidikYeri');
    await page.mouse.move(g.x, g.y); await page.mouse.down();
    let kikirdadi = false;
    for (let k = 0; k < 80 && (await asamaNe()) === 'gidik'; k++) {
      await page.mouse.move(g.x + (k % 2 ? -150 : 150) * olcek, g.y, { steps: 4 });
      if (/kikir/.test((await durum()).bas)) kikirdadi = true;
    }
    await page.mouse.up();
    await asama('ayna');
    expect(kikirdadi, 'ağzını açmadan önce kıkırdar').toBe(true);
    expect((await durum()).bas).toMatch(/mino-yakin-acik/);
    expect(await enKucukKenar(page, '#doktor .vk-dok-aleti')).toBeGreaterThanOrEqual(64);

    // 2) ağız aynası: saklı kırıntılar ışığın altında belirir
    await expect(kok.locator('.ds-kirinti.ds-bulundu')).toHaveCount(0);
    await tut(await dugme('Ağız aynası'));
    for (let i = 0; i < Z.kirinti; i++) { await git(await nokta('kirinti', i)); await expect.poll(async () => (await durum()).bulunan, { timeout: 5000 }).toBeGreaterThan(i); }
    await asama('say'); await page.mouse.up();
    await expect(kok.locator('.ds-kirinti.ds-bulundu')).toHaveCount(Z.kirinti);

    // 3) dişleri say: her dokunuş bir diş; aynı dişe ikinci dokunuş saymaz
    await dokun(await nokta('dis', 0));
    await expect.poll(async () => (await durum()).sayilan).toBe(1);
    await dokun(await nokta('dis', 0));
    expect((await durum()).sayilan).toBe(1);
    for (let i = 1; i < Z.say; i++) { await dokun(await nokta('dis', i)); await expect.poll(async () => (await durum()).sayilan).toBe(i + 1); }
    await asama('macun');
    await expect(kok.getByRole('button', { name: 'portakal macunu' })).toBeVisible();

    // 4) macun: önce yüze sıkılır (burna konar, komik), sonra fırçanın kıllarına boydan boya
    await tut(await dugme('portakal macunu'));
    const burun = await nokta('burun');
    await git({ x: burun.x - 60 * olcek, y: burun.y }); await git({ x: burun.x + 60 * olcek, y: burun.y }, 3);
    await expect.poll(async () => (await durum()).burun, { timeout: 4000 }).toBe(true);
    expect((await durum()).serit).toBe(0);
    const killar = await D<Nokta[]>(page, 'killar');
    for (let k = 0; k < 80 && (await asamaNe()) === 'macun'; k++) { await git(killar[k % 2], 4); await page.waitForTimeout(20); }
    await asama('firca'); await page.mouse.up();
    expect((await durum()).tat).toBe(1);

    // 5) fırçala: dişler birer birer temizlenir, köpük birikir; 5+ yaşta dil de
    const kopukPikseli = () => page.evaluate(() => { const c = document.querySelector<HTMLCanvasElement>('#doktor .vk-kopuk-tuvali')!; const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 16) if (d[i] > 40) n++; return n; });
    await tut(await nokta('firca'));
    for (let d = 0; d < 12 && (await asamaNe()) === 'firca' && !(await durum()).dil; d++) {
      const p = await nokta('dis', d), once = (await durum()).temiz;
      for (let k = 0; k < 40 && (await asamaNe()) === 'firca' && (await durum()).temiz <= once && !(await durum()).dil; k++) { await git({ x: p.x + (k % 2 ? -26 : 26) * olcek, y: p.y }, 2); await page.waitForTimeout(16); }
    }
    if (Z.dil) {
      await expect.poll(async () => (await durum()).dil).toBe(true);
      expect((await durum()).bas).toBe('mino-yakin-dil');
      const dil = await nokta('dil');
      for (let k = 0; k < 60 && (await asamaNe()) === 'firca'; k++) { await git({ x: dil.x + (k % 2 ? -60 : 60) * olcek, y: dil.y }, 2); await page.waitForTimeout(16); }
    }
    await asama('su'); await page.mouse.up();
    expect((await durum()).temiz).toBeGreaterThanOrEqual(Z.temiz);
    expect(await kopukPikseli(), 'köpük fırçanın yolunda birikir').toBeGreaterThan(100);

    // 6) su: bardak ağzın yanında tutulur; boşalır, yanaklar şişer
    await tut(await dugme('Su bardağı'));
    await git(await nokta('agiz'));
    await asama('calkala'); await page.mouse.up();
    expect((await durum()).bas).toBe('mino-yakin-sisik');
    expect(await enKucukKenar(page, '#doktor .ds-yanak')).toBeGreaterThanOrEqual(64);

    // 7) çalkala: aynı yanağa iki kez dokunmak saymaz; sırayla dokununca su gidip gelir, sonunda kâseye püskürtür
    await dokun(await nokta('yanak', 0));
    await expect.poll(async () => (await durum()).calkala).toBe(1);
    await dokun(await nokta('yanak', 0));
    expect((await durum()).calkala).toBe(1);
    for (let k = 1; k < Z.calkala; k++) { await dokun(await nokta('yanak', k % 2)); await expect.poll(async () => (await durum()).calkala).toBe(k + 1); }
    await asama('ip');
    await expect.poll(async () => (await durum()).kase).toBe('tukur-kase-2');
    await expect.poll(kopukPikseli, { timeout: 5000 }).toBe(0);

    // 8) ip: çubuk her aralıkta aşağı yukarı oynatılır
    await tut(await dugme('İp çubuğu'));
    for (let i = 0; i < Z.aralik; i++) {
      const a = await nokta('aralik', i);
      await git(a);
      for (let k = 0; k < 30 && (await durum()).ip <= i && (await asamaNe()) === 'ip'; k++) { await git({ x: a.x, y: a.y + (k % 2 ? -60 : 60) * olcek }, 3); await page.waitForTimeout(16); }
      expect((await durum()).ip, 'aralık temizlenir').toBeGreaterThan(i);
    }
    await asama('gulus'); await page.mouse.up();

    // 9) gülüş: el aynası yüze tutulur; Mino poz verir, masada kutlama
    await tut(await dugme('El aynası'));
    await git(await nokta('yuz'));
    await asama(/kutlama|son/); await page.mouse.up();
    await asama('son');
    await expect(kok.locator('.vk-tekrar')).toBeVisible();
    // yeniden oyna: baştan kurulur
    await kok.locator('.vk-tekrar').click({ force: true });
    await asama('giris');
    expect((await durum()).bulunan).toBe(0);
    expect(hatalar).toEqual([]);
  });
}
