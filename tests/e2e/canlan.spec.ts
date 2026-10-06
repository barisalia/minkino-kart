import fs from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

type Nokta = [number, number];

/** Şablonun çizgilerini tuvale çizer (dönüşüm: ölçek, kayma, titreme). */
async function ciz(page: Page, id: string, o: { olcek?: number; kay?: Nokta; titreme?: number; atla?: string[] } = {}) {
  const cizgiler = await page.evaluate(
    ({ id, atla }) => {
      const c = (window as unknown as { __canlan: { resim: (id: string) => { cizgiler: { parca: string; n: Nokta[] }[] } } }).__canlan;
      return c.resim(id).cizgiler.filter((x) => !atla.includes(x.parca)).map((x) => x.n);
    },
    { id, atla: o.atla ?? [] },
  );
  const r = (await page.locator('.cc-kagit .ms-tuval').boundingBox())!;
  const s = o.olcek ?? 1;
  const [kx, ky] = o.kay ?? [0, 0];
  let t = 0;
  const ekran = ([x, y]: Nokta) => {
    t += 0.7;
    const j = o.titreme ?? 0;
    return [r.x + ((x - 0.5) * s + 0.5 + kx + Math.sin(t) * j) * r.width, r.y + ((y - 0.5) * s + 0.5 + ky + Math.cos(t * 1.3) * j) * r.height] as const;
  };
  for (const c of cizgiler) {
    const [x0, y0] = ekran(c[0]);
    await page.mouse.move(x0, y0);
    await page.mouse.down();
    // uzun kenarları ara noktalarla böl
    for (let i = 1; i < c.length; i++) {
      const [a, b] = [c[i - 1], c[i]];
      const adim = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.03));
      for (let k = 1; k <= adim; k++) {
        const [x, y] = ekran([a[0] + ((b[0] - a[0]) * k) / adim, a[1] + ((b[1] - a[1]) * k) / adim]);
        await page.mouse.move(x, y);
      }
    }
    if (c.length === 1) await page.mouse.move(x0 + 2, y0 + 1);
    await page.mouse.up();
  }
}

/** Sonuç sahnesinde (çizim koordinatında) bir noktaya dokun. */
async function sahneyeDokun(page: Page, x: number, y: number) {
  const r = (await page.locator('.cc-sonuc .cc-canli').boundingBox())!;
  await page.mouse.click(r.x + x * r.width, r.y + y * r.height);
}

async function sihirliBoyaVeCanlandir(page: Page) {
  await expect(page.locator('.cc-boya-cubugu')).toBeVisible();
  await page.getByRole('button', { name: 'Sihirli boya' }).click();
  await page.getByRole('button', { name: 'Canlandır' }).click();
  await expect(page.locator('.cc-sahne.canli')).toBeVisible();
}

/** Ebeveyn kapısını doğru cevapla geçer (test modunda toplam data-toplam'da). */
async function kapiyiGec(page: Page) {
  const soru = page.locator('.ebeveyn-kapisi .kapi-soru');
  await expect(soru).toBeVisible();
  for (const r of (await soru.getAttribute('data-toplam'))!) await page.locator('.ebeveyn-kapisi .tus', { hasText: new RegExp(`^${r}$`) }).click();
  await page.getByRole('button', { name: 'tamam' }).click();
  await expect(page.locator('.ebeveyn-kapisi')).toHaveCount(0);
}

/** Kâğıtta (0..1) gerçek dokunmatik parmaklar: CDP ile çok parmaklı dokunuş (Chromium). */
async function parmaklar(page: Page) {
  const cdp = await page.context().newCDPSession(page);
  const r = (await page.locator('.cc-kagit .ms-tuval').boundingBox())!;
  const nokta = ([x, y]: Nokta, id: number) => ({ x: r.x + x * r.width, y: r.y + y * r.height, id });
  return (type: 'touchStart' | 'touchMove' | 'touchEnd', noktalar: [Nokta, number][]) =>
    cdp.send('Input.dispatchTouchEvent', { type, touchPoints: noktalar.map(([n, id]) => nokta(n, id)) });
}

async function bittiyse(page: Page) {
  // yol ve nokta modunda resim tamamlanınca kendiliğinden biter
  const sonuc = page.locator('.cc-sonuc');
  if (await sonuc.waitFor({ timeout: 3000 }).then(() => true, () => false)) return;
  await page.getByRole('button', { name: 'Bitti' }).click({ timeout: 3000 });
}

test('Çiz Canlansın: açılış → liste → 3 yaş yol modunda top → yıldız → canlanma', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  const p = info.project.name;
  await page.goto('./canlan/?test=1&yas=3');
  await expect(page.locator('.cc-logo')).toBeVisible();
  await expect(page.locator('.cc-vitrin .cc-canli path').first()).toBeAttached();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `tests/screens/${p}-30-canlan-acilis.png` });

  await page.getByRole('button', { name: 'Oyna' }).click();
  await expect(page.locator('.cc-resim')).toHaveCount(24);
  await expect(page.locator('.cc-mod.secili')).toHaveAttribute('data-mod', 'iz');
  await page.waitForTimeout(700);
  await page.screenshot({ path: `tests/screens/${p}-31-canlan-liste.png` });

  await page.locator('[data-resim="balik"]').click();
  await expect(page.locator('.cc-yol')).toBeVisible();
  await page.screenshot({ path: `tests/screens/${p}-32-canlan-yol.png` });
  await ciz(page, 'balik', { titreme: 0.012 });
  await page.screenshot({ path: `tests/screens/${p}-33-canlan-yol-boyandi.png` });
  await bittiyse(page);
  const sonuc = page.locator('.cc-sonuc');
  await expect(sonuc).toBeVisible();
  expect(Number(await sonuc.getAttribute('data-yildiz'))).toBeGreaterThanOrEqual(2);
  // Boyama: gövdeye ve kuyruğa dokun
  await expect(page.locator('.cc-boya-cubugu')).toBeVisible();
  await sahneyeDokun(page, 0.45, 0.55);
  await expect(page.locator('[data-parca="govde"] .cc-boya-resim')).toBeAttached();
  await page.locator('.cc-boya-palet [data-renk="#3E9DF2"]').click();
  await sahneyeDokun(page, 0.19, 0.5);
  await expect(page.locator('[data-parca="kuyruk"] .cc-boya-resim')).toBeAttached();
  // dışarıya dokunmak boyamaz
  await sahneyeDokun(page, 0.05, 0.92);
  await expect(page.locator('.cc-boya-resim')).toHaveCount(2);
  await page.screenshot({ path: `tests/screens/${p}-33b-canlan-boya.png` });
  await page.getByRole('button', { name: 'Canlandır' }).click();
  await expect(page.locator('.cc-sahne.canli')).toBeVisible();
  await expect(page.locator('.cc-boya-cubugu')).toBeHidden();
  await expect(page.locator('.cc-sus').first()).toBeAttached();
  await expect(page.locator('.cc-canli.canlaniyor [data-parca="kuyruk"] path').first()).toBeAttached();
  await page.waitForTimeout(2600);
  await page.screenshot({ path: `tests/screens/${p}-34-canlan-canlandi.png` });
  // dokununca hafif tepki (balık sallanır)
  await sahneyeDokun(page, 0.5, 0.5);
  await expect.poll(async () => (await page.locator('.cc-sonuc .cc-tepki').getAttribute('transform')) ?? '').toContain('rotate');
  // kuyruk gerçekten oynuyor mu?
  const d1 = await page.locator('[data-parca="kuyruk"]').getAttribute('transform');
  await page.waitForTimeout(150);
  const d2 = await page.locator('[data-parca="kuyruk"]').getAttribute('transform');
  expect(d1).not.toEqual(d2);

  // Sihirli hâl: kitap illüstrasyonuna dönüşür, tekrar basınca geri döner
  await page.getByRole('button', { name: 'Sihirli hâli' }).click();
  await expect(page.locator('.cc-sonuc .cc-gercek image')).toBeAttached();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `tests/screens/${p}-34b-canlan-sihirli.png` });
  await page.getByRole('button', { name: 'Sihirli hâli' }).click();
  await expect(page.locator('.cc-sonuc .cc-gercek')).toHaveCount(0);
  // Nasıl çizdim? ve kart
  await page.getByRole('button', { name: 'Nasıl çizdim?' }).click();
  await expect(page.locator('.cc-tekrar-katman')).toBeAttached();
  // Kartım: paylaşım uygulamadan çıktığı için önce ebeveyn kapısı; kapatılırsa kart açılmaz
  await page.getByRole('button', { name: 'Kartım' }).click();
  await expect(page.locator('.ebeveyn-kapisi')).toBeVisible();
  await page.screenshot({ path: `tests/screens/${p}-39b-canlan-kart-kapi.png` });
  await page.locator('.ebeveyn-kapisi').getByRole('button', { name: 'Kapat' }).click();
  await expect(page.locator('.ebeveyn-kapisi')).toHaveCount(0);
  await expect(page.locator('.cc-kart-pencere')).toHaveCount(0);
  await page.getByRole('button', { name: 'Kartım' }).click();
  await kapiyiGec(page);
  const kartResmi = page.locator('.cc-kart-pencere img');
  await expect(kartResmi).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(300);
  await kartResmi.screenshot({ path: `tests/screens/${p}-40-canlan-kart.png` });
  await page.getByRole('button', { name: 'Tamam' }).click();
  // Liste yıldızı kaydetti
  await page.getByRole('button', { name: 'Resimler' }).click();
  await expect(page.locator('[data-resim="balik"] .cc-kart-yildiz i.dolu').first()).toBeVisible();
  expect(hatalar).toEqual([]);
});

test('Çiz Canlansın: 4 yaş noktaları birleştir (ev) — sürükle, noktaya yapışsın', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./canlan/?test=1&yas=4&ekran=ciz&resim=ev&mod=nokta');
  await expect(page.locator('.cc-nokta').first()).toBeVisible();
  await expect(page.locator('.cc-nokta.siradaki.ilk')).toHaveCount(1);
  await expect(page.locator('.cc-adimlar i')).toHaveCount(3);
  // yanlış yerden başlamak: nokta sallanır, bir şey çizilmez
  const r = (await page.locator('.cc-kagit .ms-tuval').boundingBox())!;
  await page.mouse.click(r.x + r.width * 0.9, r.y + r.height * 0.1);
  await expect(page.locator('.cc-nokta.salla')).toHaveCount(1);
  await page.screenshot({ path: `tests/screens/${info.project.name}-35-canlan-nokta.png` });
  // ilk çizgiyi yarıya kadar çizip bırak: yapışan noktalar kalır
  const duvar = await page.evaluate(() => (window as unknown as { __canlan: { resim: (id: string) => { cizgiler: { n: [number, number][] }[] } } }).__canlan.resim('ev').cizgiler[0].n);
  await page.mouse.move(r.x + duvar[0][0] * r.width, r.y + duvar[0][1] * r.height);
  await page.mouse.down();
  for (let k = 1; k <= 14; k++) await page.mouse.move(r.x + duvar[0][0] * r.width, r.y + (duvar[0][1] + ((duvar[1][1] - duvar[0][1]) * k) / 14) * r.height);
  await page.mouse.up();
  await expect(page.locator('.cc-nokta.yandi').first()).toBeAttached();
  await page.screenshot({ path: `tests/screens/${info.project.name}-35b-canlan-nokta-yarim.png` });
  await page.getByRole('button', { name: 'Temizle' }).click();
  await expect(page.locator('.cc-nokta.yandi')).toHaveCount(0);
  await ciz(page, 'ev');
  await bittiyse(page);
  await expect(page.locator('.cc-sonuc')).toBeVisible();
  expect(Number(await page.locator('.cc-sonuc').getAttribute('data-yildiz'))).toBeGreaterThanOrEqual(2);
  expect(hatalar).toEqual([]);
});

test('Çiz Canlansın: noktalarla kedi — gözler tek dokunuşla, 3 yıldız', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./canlan/?test=1&yas=4&ekran=ciz&resim=kedi&mod=nokta');
  await expect(page.locator('.cc-nokta').first()).toBeVisible();
  await ciz(page, 'kedi');
  await bittiyse(page);
  await expect(page.locator('.cc-sonuc')).toBeVisible();
  expect(Number(await page.locator('.cc-sonuc').getAttribute('data-yildiz'))).toBe(3);
  expect(hatalar).toEqual([]);
});

test('Çiz Canlansın: 5 yaş bakarak çiz — başka yere küçük çizse de hizalanır', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./canlan/?test=1&yas=5&ekran=ciz&resim=araba&mod=kopya');
  await expect(page.locator('.cc-model svg')).toBeVisible();
  await ciz(page, 'araba', { olcek: 0.6, kay: [0.1, 0.12], titreme: 0.008 });
  await page.screenshot({ path: `tests/screens/${info.project.name}-36-canlan-kopya.png` });
  await page.getByRole('button', { name: 'Bitti' }).click();
  await expect(page.locator('.cc-sonuc')).toBeVisible();
  expect(Number(await page.locator('.cc-sonuc').getAttribute('data-yildiz'))).toBeGreaterThanOrEqual(2);
  await sihirliBoyaVeCanlandir(page);
  await page.waitForTimeout(2600);
  await page.screenshot({ path: `tests/screens/${info.project.name}-37-canlan-araba.png` });
  expect(hatalar).toEqual([]);
});

test('Çiz Canlansın: 6 yaş hafızadan — resim görünür, kaybolur, sonra çizilir', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./canlan/?test=1&yas=6&ekran=ciz&resim=yildiz&mod=hafiza');
  await expect(page.locator('.cc-hafiza-model')).toBeVisible();
  await expect(page.locator('.cc-hafiza-model.gizli')).toBeAttached({ timeout: 8000 });
  await expect(page.locator('.cc-kagit.bakiyor')).toHaveCount(0);
  await ciz(page, 'yildiz', { olcek: 0.8, titreme: 0.01 });
  await page.getByRole('button', { name: 'Bitti' }).click();
  await expect(page.locator('.cc-sonuc')).toBeVisible();
  expect(Number(await page.locator('.cc-sonuc').getAttribute('data-yildiz'))).toBeGreaterThanOrEqual(2);
  await sihirliBoyaVeCanlandir(page);
  await page.waitForTimeout(2400);
  await page.screenshot({ path: `tests/screens/${info.project.name}-38-canlan-yildiz.png` });
  expect(hatalar).toEqual([]);
});

test('Çiz Canlansın: eksik parça — tekerleksiz araba "Tamamla" ile tamamlanır', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./canlan/?test=1&yas=5&ekran=ciz&resim=araba&mod=kopya');
  await ciz(page, 'araba', { atla: ['teker2'] });
  await page.getByRole('button', { name: 'Bitti' }).click();
  const sonuc = page.locator('.cc-sonuc');
  await expect(sonuc).toHaveAttribute('data-eksik', 'teker2');
  await page.getByRole('button', { name: 'Canlandır' }).click();
  await expect(page.getByRole('button', { name: 'Tamamla' })).toBeVisible();
  await expect(page.locator('.cc-hayalet path')).toHaveCount(1);
  await page.screenshot({ path: `tests/screens/${info.project.name}-39-canlan-eksik.png` });
  await page.getByRole('button', { name: 'Tamamla' }).click();
  await expect(page.locator('.cc-kagit')).toBeVisible();
  // önceki çizgiler duruyor, sadece tekerlek eklenir
  await ciz(page, 'araba', { atla: ['govde', 'teker1'] });
  await page.getByRole('button', { name: 'Bitti' }).click();
  await expect(page.locator('.cc-sonuc')).toHaveAttribute('data-eksik', '');
  expect(Number(await page.locator('.cc-sonuc').getAttribute('data-yildiz'))).toBe(3);
  expect(hatalar).toEqual([]);
});

test('Çiz Canlansın: Müzem — canlanan resim duvara asılır, dokununca yine canlanır', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  const p = info.project.name;
  // boş müze: soru işaretli çerçeveler + "Hadi çizelim"
  await page.goto('./canlan/?test=1&yas=5&ekran=muze');
  await expect(page.locator('.cc-muze-cerceve.bos')).toHaveCount(3);
  await expect(page.getByRole('button', { name: 'Hadi çizelim' })).toBeVisible();
  await expect(page.locator('.cc-muze-mino .mino')).toBeAttached();
  await page.screenshot({ path: `tests/screens/${p}-41-canlan-muze-bos.png` });

  // bir resim çiz, boya, canlandır: Mino çizimde ve sonuçta eşlik eder
  await page.goto('./canlan/?test=1&yas=5&ekran=ciz&resim=araba&mod=kopya');
  await expect(page.locator('.cc-ciz-mino .mino')).toBeAttached();
  await ciz(page, 'araba', { titreme: 0.006 });
  await page.getByRole('button', { name: 'Bitti' }).click();
  await expect(page.locator('.cc-sonuc-mino .mino')).toBeAttached();
  await sihirliBoyaVeCanlandir(page);
  const muzem = page.getByRole('button', { name: 'Müzem' });
  await expect(muzem).toBeVisible();
  await muzem.click();

  // müze duvarı: çerçeveli, boyalı, süslü resim
  const cerceve = page.locator('.cc-muze-cerceve[data-resim="araba"]');
  await expect(cerceve).toHaveCount(1);
  await expect(cerceve.locator('.cc-canli path').first()).toBeAttached();
  await expect(cerceve.locator('.cc-boya-resim').first()).toBeAttached();
  await expect(cerceve.locator('.cc-plaka')).toContainText('Arabam');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `tests/screens/${p}-42-canlan-muze.png` });

  // dokununca büyür ve yine canlanır; resme dokununca tepki verir
  await cerceve.click();
  const perde = page.locator('.cc-muze-perde');
  await expect(perde).toBeVisible();
  await expect(perde.locator('.cc-canli.canlaniyor')).toBeAttached();
  await expect(perde.locator('.cc-sahne.canli')).toBeAttached();
  // önce çizgiler parlayarak yeniden çizilir, sonra hareket açılır
  await page.waitForTimeout(1400);
  const t1 = await perde.locator('.cc-canli .cc-tum').getAttribute('transform');
  await page.waitForTimeout(200);
  expect(await perde.locator('.cc-canli .cc-tum').getAttribute('transform')).not.toEqual(t1);
  const s = (await perde.locator('.cc-canli').boundingBox())!;
  await page.mouse.click(s.x + s.width / 2, s.y + s.height / 2);
  await expect.poll(async () => (await perde.locator('.cc-tepki').getAttribute('transform')) ?? '').not.toBe('');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `tests/screens/${p}-43-canlan-muze-yakin.png` });
  await page.getByRole('button', { name: 'Kapat' }).click();
  await expect(perde).toHaveCount(0);

  // listede Müzem kartı resim sayısını gösterir; oradan da girilir
  await page.getByRole('button', { name: 'Geri' }).click();
  await expect(page.locator('.cc-muze-karti .cc-muze-sayi')).toHaveText('1');
  await page.locator('.cc-muze-karti').click();
  await expect(page.locator('.cc-muze-cerceve:not(.bos)')).toHaveCount(1);
  // tek resim varken duvar boş kalmaz: yanında soru işaretli çerçeveler ve "Hadi çizelim"
  await expect(page.locator('.cc-muze-cerceve.bos')).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Hadi çizelim' })).toBeVisible();
  expect(hatalar).toEqual([]);
});

test('Çiz Canlansın: cila videosu (gerçek hız)', async ({ browser }, info) => {
  test.skip(!process.env.CILA_VIDEO || info.project.name !== 'iphone', 'video yalnız CILA_VIDEO=1 ile (telefon)');
  test.setTimeout(240_000);
  const vp = info.project.use.viewport ?? { width: 390, height: 844 };
  const dir = `test-results/video-canlan`;
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'tr-TR', baseURL: info.project.use.baseURL, recordVideo: { dir, size: vp } });
  const page = await ctx.newPage();
  const hatalar = hataTopla(page);
  // liste: kartlar sırayla düşer, Müzem kartı başta
  await page.goto('./canlan/?onizleme=1&yas=5&ekran=liste');
  await page.waitForTimeout(2200);
  await page.locator('[data-resim="balik"]').click({ force: true });
  await expect(page.locator('.cc-model svg')).toBeVisible();
  await page.waitForTimeout(1200);
  // çizerken fırça ucunda parıltı, Mino izler
  await ciz(page, 'balik', { titreme: 0.008 });
  await page.waitForTimeout(700);
  await page.getByRole('button', { name: 'Bitti' }).click({ force: true });
  // yıldızlar tek tek uçar
  await expect(page.locator('.cc-boya-cubugu')).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(600);
  await sahneyeDokun(page, 0.45, 0.55);
  await page.waitForTimeout(500);
  await page.locator('.cc-boya-palet [data-renk="#3E9DF2"]').click({ force: true });
  await sahneyeDokun(page, 0.19, 0.5);
  await page.waitForTimeout(700);
  // sinematik canlanma
  await page.getByRole('button', { name: 'Canlandır' }).click({ force: true });
  await page.waitForTimeout(4200);
  await sahneyeDokun(page, 0.5, 0.5);
  await page.waitForTimeout(1500);
  // Müzem: duvara asılır, dokununca yine canlanır
  await page.getByRole('button', { name: 'Müzem' }).click({ force: true });
  await page.waitForTimeout(2200);
  await page.locator('.cc-muze-cerceve').first().click({ force: true });
  await page.waitForTimeout(3500);
  await page.getByRole('button', { name: 'Kapat' }).click({ force: true });
  await page.waitForTimeout(1000);
  const video = page.video();
  await ctx.close();
  if (video) fs.copyFileSync(await video.path(), 'tests/screens/canlan-cila.webm');
  expect(hatalar).toEqual([]);
});

test('Çiz Canlansın: karalama canlanmaz, "Tekrar" önerilir', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./canlan/?test=1&yas=5&ekran=ciz&resim=ev&mod=kopya');
  const r = (await page.locator('.cc-kagit .ms-tuval').boundingBox())!;
  await page.mouse.move(r.x + r.width * 0.3, r.y + r.height * 0.3);
  await page.mouse.down();
  for (let i = 0; i < 120; i++) {
    const a = i * 0.45;
    const cx = 0.35 + (i / 120) * 0.3;
    await page.mouse.move(r.x + (cx + 0.1 * Math.cos(a)) * r.width, r.y + (0.5 + 0.1 * Math.sin(a)) * r.height);
  }
  await page.mouse.up();
  await page.getByRole('button', { name: 'Bitti' }).click();
  await expect(page.locator('.cc-sonuc')).toBeVisible();
  expect(Number(await page.locator('.cc-sonuc').getAttribute('data-yildiz'))).toBeLessThanOrEqual(1);
  await expect(page.locator('.cc-tekrar.vurgu')).toBeVisible();
  await expect(page.locator('.cc-boya-cubugu')).toBeHidden();
  await expect(page.locator('.cc-sahne.canli')).toHaveCount(0);
  expect(hatalar).toEqual([]);
});

test('Çiz Canlansın: ikinci parmak / avuç çizgiye karışmaz (yalnız ilk parmak çizer)', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./canlan/?test=1&yas=5&ekran=ciz&resim=ev&mod=kopya');
  await expect(page.locator('.cc-kagit .ms-tuval')).toBeVisible();
  const dokun = await parmaklar(page);
  // 1. parmak soldan sağa çizer; 2. parmak (avuç) sağ altta durur, biraz kıpırdar, sonra kalkar
  await dokun('touchStart', [[[0.2, 0.3], 1]]);
  await dokun('touchStart', [[[0.2, 0.3], 1], [[0.85, 0.85], 2]]);
  for (let i = 1; i <= 10; i++) await dokun('touchMove', [[[0.2 + i * 0.03, 0.3], 1], [[0.85, 0.85 - i * 0.005], 2]]);
  await dokun('touchMove', [[[0.53, 0.3], 1]]); // 2. parmak kalktı: 1. parmak çizmeye devam eder
  for (let i = 1; i <= 5; i++) await dokun('touchMove', [[[0.53 + i * 0.03, 0.3], 1]]);
  await dokun('touchEnd', []);
  const cizgiler = await page.evaluate(() => (window as unknown as { __tuval: { cizgiler: { noktalar: Nokta[] }[] } }).__tuval.cizgiler.map((c) => c.noktalar));
  expect(cizgiler).toHaveLength(1);
  // bütün noktalar 1. parmağın yolunda (y ≈ 0.3), en sağa kadar
  for (const [, y] of cizgiler[0]) expect(Math.abs(y - 0.3)).toBeLessThan(0.02);
  expect(Math.max(...cizgiler[0].map(([x]) => x))).toBeGreaterThan(0.65);
  expect(hatalar).toEqual([]);
});

test('Çiz Canlansın: yol modunda Temizle / Geri al boyalı yolu da siler', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./canlan/?test=1&yas=3&ekran=ciz&resim=ev&mod=iz');
  await expect(page.locator('.cc-yol')).toBeVisible();
  const dolu = page.locator('.cc-boya-izi circle.dolu');
  // önce duvar, sonra kapı: yol kısmen boyanır, kendiliğinden bitmez
  await ciz(page, 'ev', { atla: ['cati', 'kapi'] });
  await expect.poll(() => dolu.count()).toBeGreaterThan(5);
  const duvarSayisi = await dolu.count();
  await ciz(page, 'ev', { atla: ['duvar', 'cati'] });
  await expect.poll(() => dolu.count()).toBeGreaterThan(duvarSayisi);
  // Geri al: kapının boyası gider, duvarınki kalır
  await page.getByRole('button', { name: 'Geri al' }).click();
  await expect.poll(() => dolu.count()).toBe(duvarSayisi);
  // Temizle: hiç boya kalmaz
  await page.getByRole('button', { name: 'Temizle' }).click();
  await expect(dolu).toHaveCount(0);
  // eski sayımla tek dokunuş resmi bitirmez
  const r = (await page.locator('.cc-kagit .ms-tuval').boundingBox())!;
  await page.mouse.click(r.x + 0.26 * r.width, r.y + 0.6 * r.height);
  await page.waitForTimeout(900);
  await expect(page.locator('.cc-sonuc')).toHaveCount(0);
  expect(hatalar).toEqual([]);
});

test('Çiz Canlansın: noktada "Tamamla" kaldığı şekilden devam eder, eski çizgiler kalır', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./canlan/?test=1&yas=4&ekran=ciz&resim=ev&mod=nokta');
  await expect(page.locator('.cc-nokta').first()).toBeVisible();
  const cizgiSayisi = () => page.evaluate(() => (window as unknown as { __tuval: { cizgiler: unknown[] } }).__tuval.cizgiler.length);
  // yalnız duvarı birleştir (yarım resim)
  await ciz(page, 'ev', { atla: ['cati', 'kapi'] });
  await expect(page.locator('.cc-adimlar i.bitti')).toHaveCount(1);
  const duvar = await page.evaluate(() => (window as unknown as { __tuval: { cizgiler: unknown[] } }).__tuval.cizgiler);
  expect(duvar).toHaveLength(1);
  // sonuç ekranındaki "Tamamla" ile aynı çağrı: biten çizgilerle çizime dön
  await page.evaluate(
    (devam) => (window as unknown as { __canlan: { app: { git: (a: string, p: unknown) => void } } }).__canlan.app.git('ciz', { id: 'ev', mod: 'nokta', devam, hata: 0 }),
    duvar,
  );
  await expect(page.locator('.cc-ciz:not(.cikiyor) .cc-adimlar i')).toHaveCount(3);
  // 2. şekilden (çatı) başlar; duvar çizgisi tuvalde
  await expect(page.locator('.cc-ciz:not(.cikiyor) .cc-adimlar i.bitti')).toHaveCount(1);
  await expect(page.locator('.cc-ciz:not(.cikiyor) .cc-adimlar i').nth(1)).toHaveClass('simdi');
  await page.waitForTimeout(500);
  expect(await cizgiSayisi()).toBe(1);
  // çatıyı birleştirince duvar silinmez
  await ciz(page, 'ev', { atla: ['duvar', 'kapi'] });
  await expect(page.locator('.cc-adimlar i.bitti')).toHaveCount(2);
  expect(await cizgiSayisi()).toBe(2);
  await ciz(page, 'ev', { atla: ['duvar', 'cati'] });
  await expect(page.locator('.cc-sonuc')).toBeVisible();
  expect(Number(await page.locator('.cc-sonuc').getAttribute('data-yildiz'))).toBe(3);
  expect(hatalar).toEqual([]);
});

test('Çiz Canlansın: Kartım kapısı ve kart penceresi telefonda (844×390, 390×844, DPR 3)', async ({ browser }, info) => {
  test.skip(info.project.name !== 'iphone', 'telefon boyları tek projede');
  for (const vp of [{ width: 844, height: 390 }, { width: 390, height: 844 }]) {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: 'tr-TR', baseURL: info.project.use.baseURL });
    const page = await ctx.newPage();
    const hatalar = hataTopla(page);
    await page.goto('./canlan/?test=1&yas=3&ekran=ciz&resim=balik&mod=iz');
    await expect(page.locator('.cc-yol')).toBeVisible();
    await ciz(page, 'balik');
    await bittiyse(page);
    await expect(page.locator('.cc-sonuc')).toBeVisible();
    await page.getByRole('button', { name: 'Canlandır' }).click();
    await expect(page.locator('.cc-sahne.canli')).toBeVisible();
    await page.getByRole('button', { name: 'Kartım' }).click();
    const kapi = page.locator('.ebeveyn-kapisi');
    await expect(kapi).toBeVisible();
    // kapı ekrana sığar: onay ve kapat düğmeleri görünür alanda
    for (const el of [kapi.getByRole('button', { name: 'tamam' }), kapi.getByRole('button', { name: 'Kapat' })]) {
      const b = (await el.boundingBox())!;
      expect(b.y).toBeGreaterThanOrEqual(0);
      expect(b.y + b.height).toBeLessThanOrEqual(vp.height + 1);
    }
    await page.screenshot({ path: `tests/screens/canlan-kart-kapi-${vp.width}x${vp.height}.png` });
    await kapiyiGec(page);
    const pencere = page.locator('.cc-kart-pencere');
    await expect(pencere.locator('img')).toBeVisible({ timeout: 10000 });
    await expect(pencere).toContainText('Resmi basılı tutup kaydedebilirsin.');
    const tamam = (await pencere.getByRole('button', { name: 'Tamam' }).boundingBox())!;
    expect(tamam.y + tamam.height).toBeLessThanOrEqual(vp.height + 1);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `tests/screens/canlan-kart-pencere-${vp.width}x${vp.height}.png` });
    await pencere.getByRole('button', { name: 'Tamam' }).click();
    expect(hatalar).toEqual([]);
    await ctx.close();
  }
});
