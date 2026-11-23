import { expect, test } from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

for (const yanlis of [false, true]) {
  test(yanlis ? 'Tabağı diğer salona götürüp yanlış masaya verebilir' : 'Tavşan kendi salatasını sürükleyerek alır', async ({ page }) => {
    await page.setViewportSize({ width: yanlis ? 740 : 568, height: 320 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('./sef/');
    await page.evaluate(() => {
      localStorage.setItem('minkino-sef-v1', JSON.stringify({ sessiz: true, tepsiler: {
        secili: 'tavsan-salata', ekran: 'masa', yanMasadan: true,
        salonKoltuklari: ['tavsan-salata', null, null, 'seftali-makarna', null, null],
        restoran: { sira: 0, menuId: 'corba-sofrasi', evre: 'siparis' },
        masalar: {
          'corba-sofrasi': { sunuldu: false, tabaklar: {} },
          'seftali-makarna': { sunuldu: false, tabaklar: {}, beklemeSn: 90 },
          'tavsan-salata': { sunuldu: false, tabaklar: { salata: { tarifId: 'salata', puan: 3, sus: { id: 'limon', x: .5, y: .5 } } } },
        },
      } }));
    });
    await page.reload();
    const tepsi = page.getByRole('button', { name: 'Yemeği masaya götür' });
    if (yanlis) {
      await tepsi.click();
      await expect(tepsi).toHaveAttribute('aria-pressed', 'true');
      await page.getByRole('button', { name: 'Tepsiyle servis salonuna geç' }).click();
      await page.locator('[data-menu="seftali-makarna"]').click();
    } else {
      await tepsi.dragTo(page.locator('[data-menu="tavsan-salata"]'));
    }
    const kazanc = yanlis ? 1 : 3;
    const teslim = page.getByRole('button', { name: new RegExp('^' + kazanc + ' jeton kazanıldı') });
    await expect(teslim).toBeVisible();
    await page.reload();
    await expect(teslim).toBeVisible();
    const t = await page.evaluate(() => JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
    expect(t.jeton).toBe(kazanc);
    expect(t.itibar).toBe(yanlis ? 45 : 55);
    expect(t.masalar['tavsan-salata'].servisKoltugu).toBe(yanlis ? 3 : 0);
    expect(t.salonKoltuklari.filter(Boolean)).toEqual([yanlis ? 'tavsan-salata' : 'seftali-makarna']);
    if(yanlis)expect(t.masalar['seftali-makarna']).toBeUndefined();
    else expect(t.masalar['seftali-makarna'].beklemeSn).toBeGreaterThanOrEqual(90);
    await expect(page.locator('.yan-servis-tabaklari')).toHaveCount(1);
  });
}

test('Ana masada tepsi Kino’ya sürüklenince Lokum’un siparişi yanlış servis sayılır', async ({ page }) => {
  await page.setViewportSize({ width: 740, height: 360 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./sef/');
  await page.evaluate(() => {
    localStorage.setItem('minkino-sef-v1', JSON.stringify({ sessiz: true, tepsiler: {
      tatliSeviye: 2, secili: 'dondurma', ekran: 'masa', restoranda: true,
      restoran: { sira: 1, menuId: 'dondurma', evre: 'mutfak' },
      masalar: { dondurma: { sunuldu: false, tabaklar: { dondurma: true }, tatliPuani: 3, dondurmaTadi: 'cilek' } },
    } }));
  });
  await page.reload();
  await page.getByRole('button', { name: 'Tepsiyi müşteriye sun' }).dragTo(page.getByRole('button', { name: 'Kino masasına götür' }));
  await expect(page.locator('.servis-jetonu')).toHaveAccessibleName(/^1 jeton/);
  const t = await page.evaluate(() => JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
  expect(t.masalar.dondurma.teslimAlan).toBe('kino');
  expect(t.gun.kazanc).toBe(1);
});

test('Bekleyen konuk ayrılırken masası kapanır ve itibar kaybı bir defa kaydedilir', async ({ page }) => {
  await page.setViewportSize({ width: 667, height: 375 });
  await page.clock.install();
  await page.addInitScript(() => {
    if(localStorage.getItem('minkino-sef-v1'))return;
    localStorage.setItem('minkino-sef-v1', JSON.stringify({ sessiz: true, tepsiler: {
      ekran: 'fisler', yanMasadan: true, secili: 'corba-sofrasi',
      salonKoltuklari: ['tavsan-salata', null, null, null, null, null], salonBekleme: { 'tavsan-salata': 115 },
      konukSirasi: 3, restoran: { sira: 0, menuId: 'corba-sofrasi', evre: 'siparis' },
      masalar: { 'corba-sofrasi': { tabaklar: {}, sunuldu: false } },
    } }));
  });
  await page.goto('./sef/');
  const yer=page.locator('[data-menu="tavsan-salata"]');
  await expect(yer).toBeEnabled();
  await page.clock.runFor(5000);
  await expect(yer).toBeDisabled();
  await page.clock.runFor(5000);
  await expect(yer).toHaveCount(0);
  await expect(page.locator('.salon-itibar')).toHaveText('45');
  await page.reload();
  await expect(page.locator('.salon-itibar')).toHaveText('45');
});
