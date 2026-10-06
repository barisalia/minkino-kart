import { expect, test, type Locator, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

interface IstekVerisi {
  istenen: Record<string, number>;
  lira?: number;
  sol?: string[];
}
const AGIR: Record<string, number> = { ananas: 2, karpuz: 3 };

/** Ürünü parmakla (fareyle) sepete (ya da verilen hedefe) sürükler */
async function sepeteSurukle(page: Page, urun: Locator, hedef = '.pz-sepet') {
  const a = (await urun.boundingBox())!;
  const b = (await page.locator(hedef).boundingBox())!;
  const [x0, y0] = [a.x + a.width / 2, a.y + a.height / 2];
  const [x1, y1] = [b.x + b.width / 2, b.y + b.height / 2];
  await page.mouse.move(x0, y0);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(x0 + ((x1 - x0) * i) / 10, y0 + ((y1 - y0) * i) / 10);
  await page.mouse.up();
}

/** Müşteri hazır olunca isteğini okur (test modunda ekranda data-istek) */
async function istek(page: Page): Promise<IstekVerisi> {
  await expect(page.locator('.pz-pazar.pz-aktif')).toBeVisible({ timeout: 8000 });
  return JSON.parse((await page.locator('.pz-pazar').getAttribute('data-istek'))!) as IstekVerisi;
}

test('Mino’nun Pazarı: açılış → pazar, sürükleyerek 1 müşteri (3 yaş)', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./pazar/?test=1&yas=3');
  await expect(page.locator('.pz-logo')).toBeVisible();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `tests/screens/${info.project.name}-a0-pazar-acilis.png` });
  await page.getByRole('button', { name: 'Oyna' }).click();

  const ist = await istek(page);
  const [urun] = Object.keys(ist.istenen);
  await expect(page.locator('.pz-musteri')).toBeVisible();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `tests/screens/${info.project.name}-a1-pazar-3yas.png` });

  // yanlış ürün yumuşakça tezgâha geri döner
  const yanlis = page.locator(`.pz-urunler .pz-urun:not([data-urun="${urun}"])`).first();
  await sepeteSurukle(page, yanlis);
  await page.waitForTimeout(200);
  await expect(page.locator('.pz-sepet-ic .pz-urun')).toHaveCount(0);
  await expect(page.locator('.pz-yildiz.dolu')).toHaveCount(0);

  // doğru ürün → müşteri sevinir, yıldız
  await sepeteSurukle(page, page.locator(`.pz-urunler .pz-urun[data-urun="${urun}"]`));
  // müşteri hemen sevinir; yıldız uçup yerine oturunca dolar
  await expect(page.locator('.pz-musteri.sevindi')).toBeVisible();
  await expect(page.locator('.pz-yildiz.dolu')).toHaveCount(1);
  // sıradaki müşteri gelir
  await expect(page.locator('.pz-pazar.pz-aktif')).toBeVisible({ timeout: 8000 });
  const yildiz = await page.evaluate(() => (window as unknown as { __pazar: { kayit: { yildiz: number } } }).__pazar.kayit.yildiz);
  expect(yildiz).toBeGreaterThanOrEqual(1);
  expect(hatalar).toEqual([]);
});

test('Mino’nun Pazarı: köpek yandan yürüyerek gelir, tezgâhta önden döner, yandan yürüyerek gider', async ({ page }) => {
  const hatalar = hataTopla(page);
  // test modunda yandan yürüyüş kapalı; &yandan=1 açar (yürüyüş gerçek hızda)
  await page.goto('./pazar/?test=1&yandan=1&yas=3&ekran=pazar&musteriler=kopek');
  const mu = page.locator('.pz-musteri[data-musteri="kopek"]');
  await expect(mu).toHaveClass(/pz-yandan/, { timeout: 8000 });
  await expect(mu.locator('.yk-yandan svg')).toBeAttached();
  const ist = await istek(page);
  await expect(mu).not.toHaveClass(/pz-yandan/);
  // tezgâhta önden çizim görünür, yan çizim gizli
  expect(await mu.locator('.kr-karakter').evaluate((e) => Number(getComputedStyle(e).opacity))).toBe(1);
  expect(await mu.locator('.pz-m-yan').evaluate((e) => Number(getComputedStyle(e).opacity))).toBeLessThan(0.01);
  const [urun] = Object.keys(ist.istenen);
  await sepeteSurukle(page, page.locator(`.pz-urunler .pz-urun[data-urun="${urun}"]`));
  await expect(page.locator('.pz-musteri[data-musteri="kopek"].gidiyor.pz-yandan')).toBeAttached({ timeout: 8000 });
  expect(hatalar).toEqual([]);
});

test('Mino’nun Pazarı: 4 yaş sayma, "Ver" ile', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./pazar/?test=1&yas=4&ekran=pazar');
  const ist = await istek(page);
  const [urun] = Object.keys(ist.istenen);
  const n = ist.istenen[urun];
  for (let i = 0; i < n; i++) {
    await sepeteSurukle(page, page.locator(`.pz-urunler .pz-urun[data-urun="${urun}"]`).first());
    await page.waitForTimeout(80);
  }
  await expect(page.locator('.pz-sepet-ic .pz-urun')).toHaveCount(n);
  await page.waitForTimeout(200);
  await page.screenshot({ path: `tests/screens/${info.project.name}-a2-pazar-4yas-sayma.png` });
  await page.locator('.pz-ver').click();
  await expect(page.locator('.pz-yildiz.dolu')).toHaveCount(1);
  expect(hatalar).toEqual([]);
});

test('Mino’nun Pazarı: 6 yaş toplama ve para, 5 yaş ayırma, şenlik ekranı açılır', async ({ page }, info) => {
  test.skip(info.project.name !== 'iphone', 'bir kez yeter');
  const hatalar = hataTopla(page);
  await page.goto('./pazar/?test=1&yas=6&ekran=pazar');
  const ist = await istek(page);
  const [urun] = Object.keys(ist.istenen);
  for (let i = 0; i < ist.istenen[urun]; i++) await sepeteSurukle(page, page.locator(`.pz-urunler .pz-urun[data-urun="${urun}"]`).first());
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'tests/screens/iphone-a3-pazar-6yas-toplama.png' });
  await page.locator('.pz-ver').click();
  await expect(page.locator('.pz-yildiz.dolu')).toHaveCount(1);

  // ikinci müşteri: kasaya para
  await expect(page.locator('.pz-pazar[data-tur="ode"].pz-aktif')).toBeVisible({ timeout: 8000 });
  const ode = JSON.parse((await page.locator('.pz-pazar').getAttribute('data-istek'))!) as IstekVerisi;
  const lira = ode.lira ?? 0;
  for (let i = 0; i < Math.floor(lira / 5); i++) await sepeteSurukle(page, page.locator('.pz-urunler .pz-urun[data-urun="para-5"]').first());
  for (let i = 0; i < lira % 5; i++) await sepeteSurukle(page, page.locator('.pz-urunler .pz-urun[data-urun="para-1"]').first());
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'tests/screens/iphone-a4-pazar-6yas-para.png' });
  await page.locator('.pz-ver').click();
  await expect(page.locator('.pz-yildiz.dolu')).toHaveCount(2);

  await page.goto('./pazar/?test=1&yas=5&ekran=pazar');
  await istek(page);
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'tests/screens/iphone-a5-pazar-5yas.png' });

  await page.goto('./pazar/?test=1&yas=5&ekran=senlik');
  await expect(page.locator('.pz-senlik-hayvan')).toHaveCount(5);
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'tests/screens/iphone-a6-pazar-senlik.png' });
  expect(hatalar).toEqual([]);
});

test('Mino’nun Pazarı: terazi — müşterinin kefesini meyveyle dengele (6 yaş)', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./pazar/?test=1&yas=6&ekran=pazar&tur=terazi');
  const ist = await istek(page);
  await expect(page.locator('.pz-terazi')).toBeVisible();
  await expect(page.locator('.pz-t-sol .pz-urun')).toHaveCount(ist.sol!.length);
  const hedef = ist.sol!.reduce((a, id) => a + (AGIR[id] ?? 1), 0);
  // hafif (1 birim) meyvelerle teker teker dengele
  for (let i = 0; i < hedef; i++) {
    await sepeteSurukle(page, page.locator('.pz-urunler .pz-urun:not([data-urun="ananas"]):not([data-urun="karpuz"])').first(), '.pz-t-sag');
    if (i === 0) {
      await page.waitForTimeout(120);
      await page.screenshot({ path: `tests/screens/${info.project.name}-a7-pazar-terazi.png` });
    }
  }
  // dengelenince (test modunda hemen) müşteri sevinir ve yıldız dolar
  await expect(page.locator('.pz-yildiz.dolu')).toHaveCount(1);
  expect(hatalar).toEqual([]);
});

test('Mino’nun Pazarı: terazi — fazla konan meyve geri alınıp denge kurulunca tur biter (6 yaş)', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./pazar/?test=1&yas=6&ekran=pazar&tur=terazi');
  const ist = await istek(page);
  await expect(page.locator('.pz-t-sol .pz-urun')).toHaveCount(ist.sol!.length);
  const hedef = ist.sol!.reduce((a, id) => a + (AGIR[id] ?? 1), 0);
  // hedef-1 hafif meyve, sonra ananas (2): denge hiç tutmadan bir fazla olur
  for (let i = 0; i < hedef - 1; i++) {
    await sepeteSurukle(page, page.locator('.pz-urunler .pz-yuva > .pz-urun:not([data-urun="ananas"])').first(), '.pz-t-sag');
  }
  await sepeteSurukle(page, page.locator('.pz-urunler .pz-urun[data-urun="ananas"]'), '.pz-t-sag');
  await expect(page.locator('.pz-t-sag .pz-urun')).toHaveCount(hedef);
  await page.waitForTimeout(500);
  await expect(page.locator('.pz-yildiz.dolu')).toHaveCount(0);
  // kefedeki bir hafif meyveye dokununca tezgâha döner, kefeler denkleşir ve müşteri sevinir
  await page.locator('.pz-t-sag .pz-urun:not([data-urun="ananas"])').first().dispatchEvent('click');
  await expect(page.locator('.pz-t-sag .pz-urun')).toHaveCount(hedef - 1);
  await expect(page.locator('.pz-musteri.sevindi')).toBeVisible();
  await expect(page.locator('.pz-yildiz.dolu')).toHaveCount(1);
  expect(hatalar).toEqual([]);
});

test('Mino’nun Pazarı: terazi — telefon dönünce kefeler kol uçlarında kalır', async ({ page }) => {
  const hatalar = hataTopla(page);
  /** sağ kefenin askı noktası ile kolun sağ ucu arasındaki uzaklık (px) */
  const kayma = () =>
    page.evaluate(() => {
      const uc = document.querySelector('.pz-t-kol-svg circle[cx="370"]')!.getBoundingClientRect();
      const kefe = document.querySelector('.pz-t-sag')!.getBoundingClientRect();
      return Math.hypot(kefe.x + kefe.width / 2 - (uc.x + uc.width / 2), kefe.y - (uc.y + uc.height / 2));
    });
  for (const [w, h] of [
    [390, 844],
    [844, 390],
  ]) {
    await page.setViewportSize({ width: w, height: h });
    if (w === 390) {
      await page.goto('./pazar/?test=1&yas=6&ekran=pazar&tur=terazi');
      await istek(page);
    }
    await page.waitForTimeout(400);
    const genislik = await page.locator('.pz-terazi').evaluate((e) => (e as HTMLElement).offsetWidth);
    expect(await kayma(), `${w}x${h}, terazi ${genislik}px`).toBeLessThan(6);
  }
  expect(hatalar).toEqual([]);
});

// ---------------------------------------------------------------- Meyve Suyu Köşesi (yan dal)
interface MsVeri {
  hedef: string;
  tezgah: string[];
  dogru: string[];
}
/** Müşteri hazır olunca meyve suyu isteğini okur (test modunda ekranda data-istek) */
async function msIstek(page: Page): Promise<MsVeri> {
  await expect(page.locator('.ms-ekran.pz-aktif')).toBeVisible({ timeout: 10000 });
  return JSON.parse((await page.locator('.ms-ekran').getAttribute('data-istek'))!) as MsVeri;
}
/** Meyveleri blender'a atar; Karıştır düğmesi belirir */
async function blendereAt(page: Page, meyveler: string[]) {
  for (const m of meyveler) {
    await sepeteSurukle(page, page.locator(`.pz-urunler .pz-urun[data-urun="${m}"]`), '.ms-blender');
    await page.waitForTimeout(80);
  }
  await expect(page.locator('.ms-meyveler .pz-urun')).toHaveCount(meyveler.length);
  await expect(page.locator('.ms-karistir')).toBeVisible();
}

test('Meyve Suyu: 3 yaş — açılıştan girilir, yanlış renkte yüz buruşturma (ceza yok), doğru renkte yıldız', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./pazar/?test=1&yas=3');
  await page.getByRole('button', { name: 'Meyve Suyu' }).click();
  const ist = await msIstek(page);
  await expect(page.locator('.ms-blender')).toBeVisible();
  await expect(page.locator('.pz-urunler .pz-urun')).toHaveCount(3);
  // balonda istenen renkte bardak
  await expect(page.locator('.pz-istek-balon .ms-bardak')).toBeVisible();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `tests/screens/${info.project.name}-m1-meyvesuyu-3yas.png` });

  // yanlış renk: müşteri içer, yüzünü buruşturur; yıldız yok, meyveler tezgâha döner
  const yanlis = ist.tezgah.find((m) => !ist.dogru.includes(m))!;
  await blendereAt(page, [yanlis]);
  await page.locator('.ms-karistir').click();
  await expect(page.locator('.ms-ekran[data-sonuc="yanlis"]')).toBeAttached({ timeout: 10000 });
  await expect(page.locator('.pz-yildiz.dolu')).toHaveCount(0);
  const tekrar = await msIstek(page);
  expect(tekrar.hedef).toBe(ist.hedef);
  await expect(page.locator('.ms-meyveler .pz-urun')).toHaveCount(0);
  await expect(page.locator('.pz-urunler .pz-urun')).toHaveCount(3);

  // doğru renk: müşteri içer, sevinir, yıldız
  await blendereAt(page, ist.dogru);
  await page.waitForTimeout(150);
  await page.screenshot({ path: `tests/screens/${info.project.name}-m2-meyvesuyu-blender.png` });
  await page.locator('.ms-karistir').click();
  await expect(page.locator('.pz-yildiz.dolu')).toHaveCount(1, { timeout: 10000 });
  // sıradaki müşteri başka bir renk ister
  const ikinci = await msIstek(page);
  expect(ikinci.hedef).not.toBe(ist.hedef);
  expect(hatalar).toEqual([]);
});

test('Meyve Suyu: 4 yaş — tek meyve tek renk (dört müşteri, şenlik)', async ({ page }, info) => {
  test.skip(info.project.name !== 'iphone', 'bir kez yeter');
  const hatalar = hataTopla(page);
  await page.goto('./pazar/?test=1&yas=4&ekran=meyvesuyu');
  for (let i = 0; i < 4; i++) {
    const ist = await msIstek(page);
    expect(ist.tezgah).toHaveLength(4);
    expect(ist.dogru).toHaveLength(1);
    await blendereAt(page, ist.dogru);
    await page.locator('.ms-karistir').click();
    await expect(page.locator('.pz-yildiz.dolu')).toHaveCount(i + 1, { timeout: 10000 });
  }
  // dört müşteri mutlu: şenlik; "Bir daha" meyve suyuna, yanındaki düğme pazara götürür
  await expect(page.locator('.pz-senlik-hayvan')).toHaveCount(4, { timeout: 15000 });
  await expect(page.locator('.pz-senlik .pz-yildiz.dolu')).toHaveCount(4);
  await expect(page.getByRole('button', { name: 'Pazar' })).toBeVisible();
  expect(hatalar).toEqual([]);
});

for (const yas of [5, 6] as const) {
  test(`Meyve Suyu: ${yas} yaş — iki rengi karıştır (kırmızı + sarı = turuncu …)`, async ({ page }, info) => {
    const hatalar = hataTopla(page);
    await page.goto(`./pazar/?test=1&yas=${yas}&ekran=meyvesuyu`);
    const ist = await msIstek(page);
    expect(['turuncu', 'yeşil', 'mor']).toContain(ist.hedef);
    expect(ist.dogru).toHaveLength(2);
    // tek ana renk yetmez: yanlış; balonda ipucu formülü (● + ● =) belirir
    await blendereAt(page, [ist.dogru[0]]);
    await page.locator('.ms-karistir').click();
    await expect(page.locator('.ms-ekran[data-sonuc="yanlis"]')).toBeAttached({ timeout: 10000 });
    await msIstek(page);
    await expect(page.locator('.pz-istek-balon .ms-formul')).toBeVisible();
    await expect(page.locator('.pz-istek-balon .ms-nokta')).toHaveCount(2);
    await page.waitForTimeout(200);
    await page.screenshot({ path: `tests/screens/${info.project.name}-m3-meyvesuyu-${yas}yas-ipucu.png` });
    // iki ana renk: doğru karışım
    await blendereAt(page, ist.dogru);
    await page.locator('.ms-karistir').click();
    await expect(page.locator('.pz-yildiz.dolu')).toHaveCount(1, { timeout: 10000 });
    expect(hatalar).toEqual([]);
  });
}

test('Meyve Suyu: pazar şenliğinden ikinci oyun olarak açılır', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./pazar/?test=1&yas=5&ekran=senlik');
  await page.getByRole('button', { name: 'Meyve Suyu' }).click();
  await msIstek(page);
  await expect(page.locator('.ms-blender')).toBeVisible();
  expect(hatalar).toEqual([]);
});
