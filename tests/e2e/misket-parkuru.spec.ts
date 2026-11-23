import { test, expect, type Page } from '@playwright/test';
import {
  BIRIM,
  GOZ,
  KAT,
  donus,
  guzergah,
  pim,
  raylar,
  rayYolu,
  sigar,
  type Tip,
  type Parca,
} from '../../matematik/src/misket-geometri';

// Tezgâhtaki oyuncaklar sürekli "nefes alır" (yalnız hareket azaltılmamışken); Playwright kımıldayan öğeye tıklamaz.
// Oyun, hareket azaltılınca nefesi durdurur (stil.css · prefers-reduced-motion): testler bu ayarla koşar.
test.use({ reducedMotion: 'reduce' });

test('Her ray iki yönde aynı pimlere oturur; iki kısa rayın sonu uzun rayın sonudur', () => {
  const plan: Parca[] = [];
  for (let kat = 0; kat < KAT; kat++) {
    for (let goz = 0; goz < GOZ; goz++) {
      plan.push({ kat, goz, tip: 'kisa' });
      for (const tip of Object.keys(raylar) as Tip[]) {
        const en = raylar[tip].birim;
        if (goz + en > GOZ) continue;
        const nokta = rayYolu({ kat, goz, tip }),
          son = nokta.at(-1)!;
        expect(nokta[0]).toEqual(pim(kat, goz));
        expect(son.x).toBe(pim(kat, goz + en).x);
        expect(son.y).toBeCloseTo(pim(kat, goz + en).y, 9);
        expect(Math.abs(son.x - nokta[0].x)).toBe(en * BIRIM);
      }
    }
    if (kat + 1 < KAT) {
      expect(donus(kat)[0]).toEqual(pim(kat, GOZ));
      expect(donus(kat).at(-1)).toEqual(pim(kat + 1, 0));
    }
  }
  expect(sigar(plan, { kat: 1, goz: 4, tip: 'halka' })).toBe(false);
  expect(guzergah(plan).bos).toBeNull();
  expect(guzergah(plan.filter((p) => p.kat !== 1 || p.goz !== 4)).bos).toEqual({ kat: 1, goz: 4 });
});

async function ac(p: Page, yas: number, dogrudan = false) {
  await p.setViewportSize({ width: 844, height: 390 });
  await p.addInitScript((y) => {
    if (!localStorage.getItem('minkino-kartlar-v1'))
      localStorage.setItem(
        'minkino-kartlar-v1',
        JSON.stringify({ yas: y, ayarlar: { muzik: false, konusma: false } }),
      );
  }, yas);
  await p.goto('/matematik/' + (dogrudan ? '?oyun=misket' : ''));
  if (!dogrudan) await p.getByRole('button', { name: 'Ölçü tezgâhı', exact: true }).click();
  await expect(p.locator('.mk-makine')).toBeVisible();
}
async function surukle(p: Page, ilk: { x: number; y: number }, son: { x: number; y: number }) {
  const r = (await p.locator('.mk-makine').boundingBox())!;
  const x = (v: number) => r.x + (v * r.width) / 1120,
    y = (v: number) => r.y + (v * r.height) / 630;
  await p.mouse.move(x(ilk.x), y(ilk.y));
  await p.mouse.down();
  await p.mouse.move(x(son.x), y(son.y), { steps: 14 });
  await p.mouse.up();
}
test('Misket açıklıkta yakalanır; çocuk tam ölçülü rayı takar, üç katı geçer ve tekrar oynar', async ({
  page: p,
}) => {
  test.setTimeout(90000);
  await ac(p, 5);
  const s = p.locator('.mk-makine'),
    yuva = p.locator('[data-yuva]');
  await expect(yuva).toHaveCount(12);
  await surukle(p, { x: 100, y: 541 }, { x: 105, y: 81 });
  await expect(s).toHaveAttribute('data-asama', 'yuklu');
  await surukle(p, { x: 153, y: 49 }, { x: 182, y: 92 });
  await expect(s).toHaveAttribute('data-asama', 'dustu');
  await expect(s).toHaveAttribute('data-asama', 'kur');
  await expect(p.locator('[data-yuva="0:2"]')).toHaveClass(/mk-hedef/);
  await surukle(p, { x: 214, y: 557 }, { x: 365, y: 110 });
  await expect(yuva).toHaveCount(11);
  await p.locator('[data-tip=halka]').click();
  await p.locator('[data-yuva="0:3"]').click();
  await expect(yuva).toHaveCount(11);
  for (const [tip, yer] of [['vadi','0:3'], ['uzun','1:4'], ['vadi','1:6'], ['halka','2:3'], ['uzun','2:6']]) {
    await p.locator(`[data-tip="${tip}"]`).click();
    await p.locator(`[data-yuva="${yer}"]`).click();
  }
  await expect(yuva).toHaveCount(0);
  await p.reload();
  await p.getByLabel('Ölçü tezgâhı', { exact: true }).click();
  await expect(yuva).toHaveCount(0);
  await p.getByLabel('Mavi topu al', { exact: true }).click();
  await p.getByLabel('Kırmızı kolu çek ve topu gönder').click();
  await expect(s).toHaveAttribute('data-asama', 'caldi', { timeout: 30000 });
  // Zil çaldı: ölçü oyunlarına geçiş oku çocuğu çağırır.
  await expect(p.locator('.mk-devam')).toHaveClass(/mk-devam-cagir/);
  await expect(s).toHaveAttribute('data-asama', 'kur');
  await p.getByLabel('Mavi topu al', { exact: true }).click();
  await expect(s).toHaveAttribute('data-asama', 'yuklu');
  await p.getByLabel('Diğer ölçü oyunlarına geç').click();
  await expect
    .poll(() => p.evaluate(() => JSON.parse(localStorage.getItem('minkino-matematik-1-olcu')!).adim))
    .toBe(1);
});
test('Serbest parkur hazır düzeni korur; parça iki yönde takılır, sökülür, geri alınır ve kaydedilir', async ({
  page: p,
}) => {
  await ac(p, 5, true);
  const hazir = await p.locator('[data-ray]').count();
  await p.getByLabel('Kendi parkurunu kur').click();
  await expect(p.locator('[data-yuva]')).toHaveCount(30);
  await surukle(p, { x: 803, y: 559 }, { x: 285, y: 104 });
  await expect(p.locator('[data-ray="0:0"]')).toBeVisible();
  await expect(p.locator('[data-yuva]')).toHaveCount(27);
  await p.locator('[data-yuva="1:7"]').click();
  await p.locator('[data-tip=halka]').click();
  const parca = p.locator('[data-ray="1:7"]');
  await expect(parca).toHaveAttribute('transform', /scale\(-1 1\)/);
  await parca.focus();
  await p.keyboard.press('Enter');
  await expect(parca).toHaveCount(0);
  await p.getByLabel('Son ray değişikliğini geri al').click();
  await expect(parca).toBeVisible();
  await p.getByLabel('Hazır parkuru tamamla').click();
  await expect(p.locator('[data-ray]')).toHaveCount(hazir);
  await p.getByLabel('Kendi parkurunu kur').click();
  await p.reload();
  await expect(parca).toBeVisible();
  await p.getByLabel('Mavi topu al').click();
  await p.getByLabel('Kırmızı kolu çek ve topu gönder').click();
  await p.getByLabel('Oyuncaklara dön').click();
  await expect(p.locator('.kose')).toHaveCount(4);
});

for (const yas of [2, 3, 4]) {
  test(`${yas} yaşta doğrudan bağlantı menüye açılır; parkur yok, eski yarım ölçü kaydı ilk ölçü turuna baştan geçer`, async ({page}) => {
    await page.addInitScript(y => {
      const grup = y === 4 ? 'dort' : 'minik';
      localStorage.setItem('minkino-matematik-1-' + grup + '-olcu', JSON.stringify({adim:0, yer:0, secimler:[1,2]}));
    }, yas);
    await page.goto('/matematik/?oyun=misket');
    await page.getByLabel(yas + ' yaş', {exact:true}).click();
    await page.reload();
    await expect(page.locator('.kose')).toHaveCount(4);
    await page.getByLabel('Ölçü tezgâhı', {exact:true}).click();
    await expect(page.locator('.mk-makine,.mk-giris')).toHaveCount(0);
    await expect(page.locator('.taslar .var')).toHaveCount(0);
    await page.getByLabel('Bir ölçü taşı yerleştir').click();
    await expect(page.locator('.taslar .var')).toHaveCount(1);
  });
}
test('Başlangıçta yaş sorulur; 6+ seçiminden sonra parkur açılır', async ({page}) => {
  await page.goto('/matematik/?oyun=misket');
  await expect(page.locator('.mk-makine')).toHaveCount(0);
  await page.getByLabel('6 yaş ve üzeri', {exact:true}).click();
  await expect(page.locator('.mk-makine')).toBeVisible();
});
