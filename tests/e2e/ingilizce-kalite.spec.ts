// İngilizce · kalite denetimi bulguları (ekip/uygulama/KALITE-DENETIM-22.md bölüm 2, 23 Kasım). Bütün adalarda ortak kod:
// şarkı ve hayvan geçidi sahnesi telefonda ene göre büyür ve ortalanır; vurgulanan sözcük şeridin içinde kalır; hayvanlar,
// geri ve "yeniden dinle" en az 64 px; şarkıda sırası gelen hayvana dokunmak katılımdır (yıldız sayacı); "Bul" adımında
// kartlar adımla birlikte gelir (giriş sözü kartların üstünde söylenir).
import { expect, test, type Locator, type Page } from '@playwright/test';

test.beforeEach(async ({ page }, bilgi) => {
  if (bilgi.project.name.startsWith('telefon') || bilgi.project.name === 'iphone') await page.setViewportSize({ width: 844, height: 390 });
});

const kutu = async (l: Locator) => (await l.boundingBox())!;
/** .ing çerçevesinin içinde iki yandaki boşluk */
async function yanBosluk(page: Page, sec: string) {
  const c = await kutu(page.locator('.ing'));
  const k = await kutu(page.locator(sec).first());
  return { sol: k.x - c.x, sag: c.x + c.width - (k.x + k.width), oran: k.width / c.width };
}
const enKucuk = async (l: Locator) => {
  const kutular = await l.evaluateAll(hepsi => hepsi.filter(e => !(e as HTMLElement).hidden).map(e => { const b = e.getBoundingClientRect(); return Math.min(b.width, b.height); }));
  expect(kutular.length).toBeGreaterThan(0);
  return Math.min(...kutular);
};

test('Kalite · şarkı: sahne ene göre ve ortada; sözcük şeridin içinde; hayvanlar ve düğmeler 64 px; sırası gelen hayvana dokununca yıldız', async ({ page }) => {
  const hatalar: string[] = [];
  page.on('pageerror', e => hatalar.push(e.message));
  // an 21,5 sn: köpek sahnede, "Woof!" söyleniyor; ?sarki-dur: adım kendiliğinden geçmez
  await page.goto('./ingilizce/?test=1&ders=ciftlik-1&adim=sarki&sarki-an=21500&sarki-dur');
  await expect(page.locator('.ing-sarki-sahne')).toBeVisible({ timeout: 20000 });
  await page.waitForTimeout(1200);   // giriş animasyonları otursun

  const ekran = page.viewportSize()!;
  const y = await yanBosluk(page, '.ing-sarki-sahne');
  expect(Math.abs(y.sol - y.sag), 'sahne ortada').toBeLessThanOrEqual(6);
  if (ekran.width / ekran.height >= 1.7) expect(y.oran, 'telefonda sahne ene yayılır').toBeGreaterThanOrEqual(0.9);

  expect(await enKucuk(page.locator('.ing-ust .ing-simge'))).toBeGreaterThanOrEqual(64);
  expect(await enKucuk(page.locator('.ing-sarki-hayvan'))).toBeGreaterThanOrEqual(64);

  // vurgulanan sözcük şeridin içinde
  const serit = await kutu(page.locator('.ing-sarki-satir'));
  const vurgu = await kutu(page.locator('.ing-sarki-satir .ing-simdi'));
  expect(vurgu.y).toBeGreaterThanOrEqual(serit.y - 0.5);
  expect(vurgu.y + vurgu.height).toBeLessThanOrEqual(serit.y + serit.height + 0.5);
  expect(vurgu.x).toBeGreaterThanOrEqual(serit.x - 0.5);
  expect(vurgu.x + vurgu.width).toBeLessThanOrEqual(serit.x + serit.width + 0.5);

  // katılım: sırası gelen hayvan parlar; dokununca yıldızı sayaca gelir, sırası biter
  const davetli = page.locator('.ing-sarki-hayvan.ing-davet');
  await expect(davetli).toHaveCount(1);
  await expect(davetli).toHaveAttribute('data-kelime', 'dog');
  await expect(page.locator('.ing-sarki-toplanan i')).toHaveCount(0);
  await davetli.click({ force: true });
  await expect(page.locator('.ing-sarki-toplanan i')).toHaveCount(1);
  await expect(page.locator('.ing-sarki-hayvan.ing-davet')).toHaveCount(0);
  await expect(page.locator('.ing-sarki-hayvan[data-kelime="dog"]')).toHaveClass(/ing-yakalandi/);
  // sıradaki (sırası geçmiş) hayvana dokunmak yalnız dans ettirir, sayaç değişmez
  await page.locator('.ing-sarki-hayvan[data-kelime="cow"]').click({ force: true });
  await expect(page.locator('.ing-sarki-toplanan i')).toHaveCount(1);
  expect(hatalar).toEqual([]);
});

test('Kalite · hayvan geçidi: sahne ve ad ene yayılır, ortada; sıradaki hayvanlar 64 px', async ({ page }) => {
  await page.goto('./ingilizce/?test=1&ders=ciftlik-1&adim=gecit');
  await expect(page.locator('.ing-gecit-sahne')).toBeVisible({ timeout: 20000 });
  // iki hayvan tanıtılır: ilki sıraya geçer (her tıklamadan önce yeni gölgenin gelmesi beklenir)
  for (let k = 0; k < 2; k++) {
    const golge = page.locator('.ing-gecit-hayvan.ing-gecit-golge');
    await expect(golge).toHaveCount(1, { timeout: 6000 });
    await golge.click({ force: true, timeout: 4000 });
    await expect(golge).toHaveCount(0, { timeout: 4000 });
  }
  await expect(page.locator('.ing-gecit-hayvan.ing-sirada').first()).toBeVisible({ timeout: 6000 });
  await page.waitForTimeout(700);
  const ekran = page.viewportSize()!;
  const y = await yanBosluk(page, '.ing-gecit');
  expect(Math.abs(y.sol - y.sag)).toBeLessThanOrEqual(6);
  if (ekran.width / ekran.height >= 1.7) expect(y.oran).toBeGreaterThanOrEqual(0.9);
  expect(await enKucuk(page.locator('.ing-gecit-hayvan.ing-sirada'))).toBeGreaterThanOrEqual(64);
  expect(await enKucuk(page.locator('.ing-ust .ing-simge'))).toBeGreaterThanOrEqual(64);
});

test('Kalite · Bul: kartlar adımla birlikte gelir (giriş sözü beklenmez)', async ({ page }) => {
  // adımın kabı sayfaya girdiği ilk anda kaç kart var: ölçüm sayfa açılmadan kurulur
  await page.addInitScript(() => {
    const w = window as unknown as { __bulIlk?: number };
    new MutationObserver(() => {
      if (w.__bulIlk === undefined && document.querySelector('.ing-bul')) w.__bulIlk = document.querySelectorAll('.ing-bul .ing-secim').length;
    }).observe(document, { childList: true, subtree: true });
  });
  await page.goto('./ingilizce/?test=1&ders=ciftlik-1&adim=bul');
  await expect(page.locator('.ing-bul .ing-secim').first()).toBeVisible({ timeout: 20000 });
  const ilk = await page.evaluate(() => (window as unknown as { __bulIlk?: number }).__bulIlk);
  expect(ilk, 'adım açıldığı anda kartlar ekranda').toBeGreaterThan(0);
  expect(await enKucuk(page.locator('.ing-ust .ing-simge'))).toBeGreaterThanOrEqual(64);
});
