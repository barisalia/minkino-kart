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
  await expect(page.locator('.cc-resim')).toHaveCount(18);
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
  // kuyruk gerçekten oynuyor mu?
  const d1 = await page.locator('[data-parca="kuyruk"]').getAttribute('transform');
  await page.waitForTimeout(150);
  const d2 = await page.locator('[data-parca="kuyruk"]').getAttribute('transform');
  expect(d1).not.toEqual(d2);

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
