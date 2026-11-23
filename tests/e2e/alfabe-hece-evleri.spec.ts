import { test, expect, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

// Harf Atölyesi telefonda yataya kilitlidir (src/kabuk/yon.ts → YATAY_SAYFALAR); telefon projesi yatay boyda oynar.
test.beforeEach(async ({ page }, bilgi) => {
  if (bilgi.project.name === 'iphone') await page.setViewportSize({ width: 844, height: 390 });
});
async function ac(page: Page, yas: number) {
  await page.addInitScript(y => {
    if (!sessionStorage.getItem('he-yas')) { localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: y })); sessionStorage.setItem('he-yas', '1'); }
  }, yas);
  await page.goto('alfabe/?test=1');
  await page.locator('.at-evler-ac').click();
}
const asama = (page: Page) => page.locator('.he-ders');
// Dersin geçtiği bölümleri ve sorulan soruları kaydeder (bir derste aynı iş iki kez olmasın diye sayılır).
async function izle(page: Page) {
  await expect(page.locator('.he-ders[data-unsuz] .he-durum')).toHaveCount(1);
  await page.evaluate(() => {
    const kok = document.querySelector<HTMLElement>('.he-ders[data-unsuz]')!, durum = kok.querySelector('.he-durum')!;
    const w = window as unknown as { asamalar: string[]; sorular: string[] };
    w.asamalar = [kok.dataset.asama!]; w.sorular = [];
    new MutationObserver(() => { if (w.asamalar.at(-1) !== kok.dataset.asama) w.asamalar.push(kok.dataset.asama!); })
      .observe(kok, { attributes: true, attributeFilter: ['data-asama'] });
    new MutationObserver(() => { const t = durum.textContent ?? ''; if (/^\d+\. soru$/.test(t) && !w.sorular.includes(t)) w.sorular.push(t); })
      .observe(durum, { childList: true, characterData: true, subtree: true });
  });
}
const izlenen = (page: Page) => page.evaluate(() => {
  const w = window as unknown as { asamalar: string[]; sorular: string[] };
  return { asamalar: w.asamalar, sorular: w.sorular };
});
async function kapilariAc(page: Page) {
  await expect(asama(page)).toHaveAttribute('data-asama', 'birlikte', { timeout: 30_000 });
  for (let i = 2; i < 8; i++) {
    await expect(page.locator('.he-ev.el-ele')).toHaveCount(0);
    await page.locator('.he-ev[data-i="' + i + '"]').click();
    await expect(page.locator('.he-ev[data-i="' + i + '"]')).toHaveClass(/okundu/, { timeout: 10_000 });
    await page.waitForTimeout(1600);
  }
}

test('Hece Evleri: 5+ yaşta göster, birlikte, sen bul ve anahtar', async ({ page }) => {
  const hatalar = hataTopla(page);
  await ac(page, 6);
  await expect(page.locator('.he-secim-harf')).toHaveCount(20);
  await page.locator('[data-unsuz="l"]').click();
  await expect(page.locator('.he-ev')).toHaveCount(8);
  await izle(page);
  await kapilariAc(page);
  await expect(asama(page)).toHaveAttribute('data-asama', 'sen', { timeout: 40_000 });
  // İlk soruda önce yanlış kapı: kapı kendi hecesini söyler, Ceren soruyu yineler, ders sürer.
  await expect(asama(page)).toHaveAttribute('data-hedef', /\d/, { timeout: 30_000 });
  await page.waitForTimeout(2500);
  const ilk = Number(await asama(page).getAttribute('data-hedef'));
  await page.locator('.he-ev[data-i="' + (ilk + 1) % 8 + '"]').click();
  await expect(page.locator('.he-ev[data-i="' + (ilk + 1) % 8 + '"]')).toHaveClass(/okundu/, { timeout: 10_000 });
  await expect(page.locator('.he-ev.acik')).toHaveCount(0, { timeout: 15_000 });
  await expect(asama(page)).toHaveAttribute('data-hedef', String(ilk));
  // Sonra her soruda doğru kapı (çocuk gibi: ders ilerleyene kadar yeniden dokunur).
  for (let tur = 0; tur < 30 && await asama(page).getAttribute('data-asama') === 'sen'; tur++) {
    await page.locator('.he-ev[data-i="' + await asama(page).getAttribute('data-hedef') + '"]').click();
    await page.waitForTimeout(3000);
  }
  await expect(asama(page)).toHaveAttribute('data-asama', 'hatira', { timeout: 30_000 });
  await expect(page.locator('.he-anahtar .he-etiket')).toHaveText('l');
  // Kapılar açılınca sekiz hece yeniden okunmaz (tekerleme yalnız anahtarda); 5+ yaşta 4 soru.
  expect(await izlenen(page)).toEqual({ asamalar: ['goster', 'birlikte', 'sen', 'hatira'], sorular: ['1. soru', '2. soru', '3. soru', '4. soru'] });
  await expect(page.locator('.he-sonraki')).toBeVisible({ timeout: 20_000 });
  await page.locator('.he-listeye').click();
  await expect(page.locator('[data-unsuz="l"] .he-rozet')).toHaveCount(1);
  expect(hatalar).toEqual([]);
});

test('Hece Evleri: bir harfi bitiren çocuğa kapı çalmanın anlatımı her derste yinelenmez', async ({ page }) => {
  const sesler: string[] = [];
  // Derlemede dosya adına özet eklenir (ev-k-a-XXXX.mp3); adın başı yeter.
  page.on('request', r => { const ad = decodeURIComponent(r.url()).split('/').pop() ?? ''; if (ad.startsWith('ev-')) sesler.push(ad); });
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('he-kayit')) {
      localStorage.setItem('minkino-hece-evleri-v1', JSON.stringify({ biten: ['l'], son: 'k', tanitildi: true }));
      sessionStorage.setItem('he-kayit', '1');
    }
  });
  await ac(page, 6);
  await page.locator('[data-unsuz="k"]').click();
  await expect(asama(page)).toHaveAttribute('data-asama', 'birlikte', { timeout: 30_000 });
  expect(sesler.some(s => s.startsWith('ev-goster'))).toBe(false);
  expect(sesler.some(s => s.startsWith('ev-k-a'))).toBe(true);
  expect(sesler.some(s => s.startsWith('ev-k-e'))).toBe(true);
});

test('Hece Evleri: 2–3 yaşta soru yok, birlikte açılan kapılardan sonra anahtar gelir', async ({ page }) => {
  const hatalar = hataTopla(page);
  await ac(page, 3);
  await page.locator('[data-unsuz="m"]').click();
  await expect(page.locator('.at-adim i')).toHaveCount(3);
  await izle(page);
  await kapilariAc(page);
  await expect(asama(page)).toHaveAttribute('data-asama', 'hatira', { timeout: 40_000 });
  expect((await izlenen(page)).asamalar).toEqual(['goster', 'birlikte', 'hatira']);
  expect(hatalar).toEqual([]);
});
