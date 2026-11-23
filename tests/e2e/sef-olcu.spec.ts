import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

// 19 Kasım 2026 Şef ölçümünde bulunan sorunların denetimi:
// tepside sıfıra düşen tabaklar, siparişi verenle masadaki müşterinin ayrışması, raftan sessiz açılan tezgâh,
// katlama adımındaki yanlış yönerge ve telefonda 44 px altı dokunma hedefleri.
test.beforeEach(async ({ page }, info) => {
  // Ortak geliştirme sunucusunda başka oyunların sıcak yenilemesi akışı ortada değiştirmesin.
  if (new URL(info.project.use.baseURL!).port === '5173') await page.routeWebSocket((u) => u.port === '5173', () => {});
});

const kutu = async (p: Page, secici: string) => (await p.locator(secici).first().boundingBox())!;

async function rafCorbasi(p: Page) {
  await p.locator('button[data-tarif=corba]').tap();
  await p.locator('[data-istasyon=dolap]').tap();
  for (const id of ['domates', 'havuc', 'patates']) await p.locator(`[data-sebze="${id}"]`).tap();
  await p.locator('[data-git=tahta]').tap();
  for (const id of ['domates', 'havuc', 'patates']) {
    await p.locator(`button[data-malzeme="${id}"]`).tap();
    for (let n = 1; n <= 4; n++) {
      await expect(p.locator('.kesiyor')).toHaveCount(0);
      await p.locator(`[data-kes="${id}"]`).press('Enter');
      await expect.poll(() => p.evaluate((m) => JSON.parse(localStorage.getItem('minkino-sef-v1')!).siparisler.corba.kesimler[m], id)).toBe(n);
    }
    await p.getByRole('button', { name: 'Parçaları tabağa al' }).tap();
  }
  await p.locator('[data-git=ocak]').tap();
  for (const id of ['domates', 'havuc', 'patates']) await p.locator(`[data-aktar="${id}"]`).press('Enter');
  for (let i = 0; i < 3; i++) await p.locator('.karistirma').press('Enter');
  for (let i = 0; i < 2; i++) {
    await p.locator('[data-porsiyon-al]').tap();
    await p.locator('[data-porsiyon-birak]').tap();
  }
  await p.locator('[data-git=servis]').tap();
  await p.locator('[data-sus=kruton]').tap();
  await p.locator('[data-sun]').tap();
  await p.locator('[data-zil]').tap();
}

test('Raftaki çorba masadaki tepside görünür ve siparişi veren Lokum masasına gider', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./sef/?test=1');
  await page.getByRole('button', { name: 'Sesi kapat' }).tap();
  await rafCorbasi(page);
  await expect(page.getByRole('button', { name: 'Lokum masasına götür' })).toBeAttached();
  const tepsi = await kutu(page, '.salonda-servis-et'), corba = await kutu(page, '.salonda-servis-et .yemek-cizimi');
  // Önceden çorba 0×0, tepsi 32 px genişliğinde boş bir çubuktu.
  expect(corba.width).toBeGreaterThan(tepsi.height * .7);
  expect(corba.height).toBeGreaterThan(tepsi.height * .6);
  expect(hatalar).toEqual([]);
});

async function pizzaYap(p: Page) {
  await p.locator('.siparis-karti[data-tarif=pizza]').tap();
  const hamur = p.getByRole('button', { name: 'Merdaneyi ileri geri yuvarla' });
  for (let i = 0; i < 4; i++) await hamur.press('Space');
  await expect(p.locator('.firin-oyunu')).toHaveAttribute('data-asama', 'sos');
  const sos = p.getByRole('button', { name: 'Sosu hamurun üzerine yay' });
  for (let i = 0; i < 6; i++) await sos.press('Enter');
  await expect(p.locator('.firin-oyunu')).toHaveAttribute('data-asama', 'malzeme');
  await p.locator('.pz-malzeme').first().press('Enter');
  await expect(p.getByRole('button', { name: 'Malzemeyi pizzaya yerleştir' })).toBeFocused();
  await p.keyboard.press('Enter');
  await p.getByRole('button', { name: 'Fırına git', exact: true }).press('Enter');
  await p.getByRole('button', { name: 'Tepsiyi fırına sür' }).press('Space');
  await p.getByRole('button', { name: 'Pizzayı fırından çıkar' }).press('Enter');
  await p.getByRole('button', { name: 'Pizzayı servis tabağına koy' }).press('Enter');
}

test('Serbest pizza tepside kare durur; ikinci pizzayı isteyen Mino, pizzasını kendi masasında alır', async ({ page }) => {
  await page.goto('./sef/?test=1');
  await page.getByRole('button', { name: 'Sesi kapat' }).tap();
  await pizzaYap(page);
  const pizza = await kutu(page, '.salonda-servis-et .pz-pizza');
  // Önceden pizza tepside 32 px'lik bir şeride iniyordu.
  expect(pizza.width).toBeGreaterThan(pizza.height * .85);
  await page.getByRole('button', { name: 'Dede Hasan masasına götür' }).press('Enter');
  await expect(page.locator('.servis-jetonu')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.locator('.siparis-karti[data-tarif=pizza]').tap();
  await expect(page.locator('.pz-fis img').first()).toHaveAttribute('src', /mino/);
  await page.keyboard.press('Escape');
  await pizzaYap(page);
  await expect(page.getByRole('button', { name: 'Mino masasına götür' })).toBeAttached();
  await expect(page.getByRole('button', { name: 'Dede Hasan masasına götür' })).toHaveCount(0);
});

test('Raftan açılan Menemen tezgâhında müşteri siparişini kendi kaydıyla söyler', async ({ page }) => {
  await page.goto('./sef/');
  await page.getByRole('button', { name: 'Sonraki tarif rafı' }).tap();
  const ses = page.waitForResponse((r) => r.url().includes('/musteri-sesi/mino-restoran-biberli-menemen') && r.ok());
  await page.getByRole('button', { name: 'Menemen tezgâhını aç' }).tap();
  await ses;
  await expect(page.locator('.mn-tezgah')).toBeVisible();
});

test('Krep katlanırken katlama yönergesi duyulur, "Yemeğin hazır!" değil', async ({ page }) => {
  await page.goto('./sef/?test=1');
  await page.evaluate(() => {
    localStorage.setItem('minkino-sef-krep-v1', JSON.stringify({
      adim: 'meyve', aktif: true, servis: 0, yon: 3, kat: 0, isiMs: 0, ikinci: true, ilkYuz: 'iyi', sonYuz: 'iyi',
      icerik: ['un', 'yumurta', 'sut'], cirpma: 2, istek: 2, meyve: 'kivi',
      parcalar: [{ meyve: 'kivi', x: 35, y: 45 }, { meyve: 'kivi', x: 61, y: 40 }, { meyve: 'seftali', x: 52, y: 62 }],
    }));
  });
  await page.reload();
  await page.locator('[data-tarif=krep]').tap();
  await page.getByRole('button', { name: 'Meyveleri onayla ve krebi katla' }).tap();
  await expect(page.locator('.krep-oyunu')).toHaveAttribute('data-krep-adim', 'katla');
  await expect(page.locator('.krep-oyunu .yalniz-okuyucu[aria-live]')).toHaveText('Krebin kenarından tut. Önce ikiye, sonra bir daha katla.');
});

test('Telefonda tarif panosu ve mutfak düğmeleri en az 44 px', async ({ page }) => {
  await page.setViewportSize({ width: 667, height: 375 });
  await page.goto('./sef/?test=1');
  await page.getByRole('button', { name: 'Sesi kapat' }).tap();
  const kucukler = () => page.evaluate(() => [...document.querySelectorAll<HTMLElement>('#sef button')]
    .filter((b) => b.offsetParent && !(b as HTMLButtonElement).disabled && !b.closest('[hidden],[inert]'))
    .map((b) => ({ ad: b.getAttribute('aria-label') ?? '', r: b.getBoundingClientRect() }))
    .filter(({ r }) => r.width > 2 && Math.min(r.width, r.height) < 43.5)
    .map(({ ad, r }) => ad + ' ' + Math.round(r.width) + '×' + Math.round(r.height)));
  expect(await kucukler()).toEqual([]);
  await page.locator('button[data-tarif=salata]').tap();
  await page.locator('[data-istasyon=dolap]').tap();
  await page.locator('[data-sebze=marul]').tap();
  await page.locator('[data-git=tahta]').tap();
  await expect(page.locator('.lavaboya-git')).toBeVisible();
  expect(await kucukler()).toEqual([]);
});
