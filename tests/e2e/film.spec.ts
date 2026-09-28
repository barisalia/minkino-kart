import { expect, test } from '@playwright/test';
import { hataTopla } from './yardimci';

test('Film: Mino’nun Karpuzu animatiği baştan sona oynar, sonda öğüt kartı', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./film/?test=1');
  await expect(page.locator('.fl-baslik')).toHaveText("Mino'nun Karpuzu");
  await page.screenshot({ path: `tests/screens/${info.project.name}-f0-film-kapak.png` });
  await page.getByRole('button', { name: 'Oynat' }).click();
  // sahne 1: Mino ve karpuz sahnede
  await expect(page.locator('.fl-sahne[data-sahne="1-pazar-kapaniyor"]')).toBeVisible();
  await expect(page.locator('.fl-nesne[data-oyuncu="mino"] .mino-svg')).toBeVisible();
  await expect(page.locator('.fl-nesne[data-esya="karpuz"]')).toBeVisible();
  // sahne 2: köpek (iskeletli karakter) gelir, karpuz ikiye bölünür
  await expect(page.locator('.fl-sahne[data-sahne="2-ac-kopek"]')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('.fl-nesne[data-oyuncu="kopek"] .kr-karakter')).toBeVisible();
  await expect(page.locator('.fl-sahne[data-son-soz="Hav! Teşekkürler!"]')).toBeVisible({ timeout: 15000 });
  await page.screenshot({ path: `tests/screens/${info.project.name}-f1-film-sahne2.png` });
  // son: öğüt kartı
  await expect(page.locator('.fl-ogut')).toContainText('Paylaşmak güzeldir.', { timeout: 15000 });
  await page.screenshot({ path: `tests/screens/${info.project.name}-f2-film-ogut.png` });
  expect(hatalar).toEqual([]);
});

test('Film: Kino ve Elma Kulesi baştan sona oynar (kapakta film seçimi), sonda öğüt kartı', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  // film listesi: karpuz kapağında iki kart; Elma Kulesi kartı o filmi açar
  await page.goto('./film/?test=1');
  await expect(page.locator('.fl-film-kart')).toHaveCount(3);
  await page.locator('.fl-film-kart[data-film="kino-elma-kulesi"]').click();
  // ekran geçişi bitince yalnız yeni kapak kalır
  await expect(page.locator('.fl-baslik')).toHaveCount(1);
  await expect(page.locator('.fl-baslik')).toHaveText('Kino ve Elma Kulesi');
  await expect(page).toHaveURL(/film=kino-elma-kulesi/);
  await page.screenshot({ path: `tests/screens/${info.project.name}-f3-elma-kapak.png` });
  // test modunda film hızlı akar: sahneler ve sözler sırayla kaydedilir (kısa anlar kaçmasın)
  await page.evaluate(() => {
    const w = window as unknown as { __sahneler: string[]; __sozler: string[] };
    w.__sahneler = [];
    w.__sozler = [];
    new MutationObserver((ms) => {
      for (const m of ms) {
        const el = m.target as HTMLElement;
        if (m.attributeName === 'data-sahne' && el.dataset.sahne && w.__sahneler.at(-1) !== el.dataset.sahne) w.__sahneler.push(el.dataset.sahne);
        if (m.attributeName === 'data-son-soz' && el.dataset.sonSoz && w.__sozler.at(-1) !== el.dataset.sonSoz) w.__sozler.push(el.dataset.sonSoz);
      }
    }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['data-sahne', 'data-son-soz'] });
  });
  await page.getByRole('button', { name: 'Oynat' }).click();
  // sahne 1: Mino, 9 elmalık kule, elinde en parlak elma
  await expect(page.locator('.fl-sahne[data-sahne="1-neredeyse-bitti"]')).toBeVisible();
  await expect(page.locator('.fl-nesne[data-oyuncu="mino"] .mino-svg image[data-tasinan="e10"]')).toHaveCount(1);
  await expect(page.locator('.fl-nesne[data-tip="elma"]')).toHaveCount(10);
  // son: Mino öğüdü söyler, öğüt kartı
  await expect(page.locator('.fl-ogut')).toContainText('Hata yapınca özür dileriz.', { timeout: 20000 });
  await page.screenshot({ path: `tests/screens/${info.project.name}-f4-elma-ogut.png` });
  const kayit = await page.evaluate(() => {
    const w = window as unknown as { __sahneler: string[]; __sozler: string[] };
    return { __sahneler: w.__sahneler, __sozler: w.__sozler };
  });
  expect(kayit.__sahneler).toEqual(['1-neredeyse-bitti', '2-top', '3-kasanin-arkasinda', '4-ozur', '5-son-elma']);
  expect(kayit.__sozler).toEqual(['Günaydın! Kulemin son elması bu.', 'Top! Top! Top!', 'Kulem!', 'Özür dilerim, Mino.', 'Olur böyle. Birlikte dizelim!', 'Yaşasın!', 'Hata yapınca özür dileriz.']);
  expect(hatalar).toEqual([]);
});

test('Film: Kino ve Kaydırak: açılış kartı, 5 sahne, öğüt kartı ve kapanış jeneriği', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./film/?test=1&film=kino-kaydirak');
  await expect(page.locator('.fl-baslik')).toHaveText('Kino ve Kaydırak');
  await expect(page.locator('.fl-film-kart')).toHaveCount(3);
  await page.screenshot({ path: `tests/screens/${info.project.name}-f5-kaydirak-kapak.png` });
  await page.evaluate(() => {
    const w = window as unknown as { __sahneler: string[]; __sozler: string[] };
    w.__sahneler = [];
    w.__sozler = [];
    new MutationObserver((ms) => {
      for (const m of ms) {
        const el = m.target as HTMLElement;
        if (m.attributeName === 'data-sahne' && el.dataset.sahne && w.__sahneler.at(-1) !== el.dataset.sahne) w.__sahneler.push(el.dataset.sahne);
        if (m.attributeName === 'data-son-soz' && el.dataset.sonSoz && w.__sozler.at(-1) !== el.dataset.sonSoz) w.__sozler.push(el.dataset.sonSoz);
      }
    }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['data-sahne', 'data-son-soz'] });
  });
  await page.getByRole('button', { name: 'Oynat' }).click();
  // önce başlık kartı (film-acilis jeneriği), sonra film
  await expect(page.locator('.fl-acilis-baslik')).toHaveText('Kino ve Kaydırak');
  await expect(page.locator('.fl-sahne[data-sahne="1-siranin-basi"]')).toBeVisible();
  // yan görünüşlü oyuncular ve önden Kino
  await expect(page.locator('.fl-nesne[data-oyuncu="ada"] .yk-yandan')).toBeVisible();
  await expect(page.locator('.fl-nesne[data-oyuncu="mino"] .mino-svg')).toBeVisible();
  // son: Mino öğüdü söyler, öğüt kartı; kapanış jeneriği bitince ekran "tamam"
  await expect(page.locator('.fl-ogut')).toContainText('Sırayı beklemek güzeldir.', { timeout: 25000 });
  await expect(page.locator('.fl-ekran[data-tamam]')).toHaveCount(1, { timeout: 5000 });
  await page.screenshot({ path: `tests/screens/${info.project.name}-f6-kaydirak-ogut.png` });
  const kayit = await page.evaluate(() => {
    const w = window as unknown as { __sahneler: string[]; __sozler: string[] };
    return { sahneler: w.__sahneler, sozler: w.__sozler };
  });
  expect(kayit.sahneler).toEqual(['1-siranin-basi', '2-sira-arkada', '3-sona-git', '4-bekleme', '5-sira-bende']);
  expect(kayit.sozler).toEqual(['Parkta kaydırak sırası vardı.', 'Kaydırak! Kaydırak!', 'Ben önce!', 'Kino, sıra arkada.', 'Sıra herkese gelir.', 'Sabrediyorum!', 'Sıra bende!', 'Yaşasın!', 'Sırayı beklemek güzeldir.']);
  expect(hatalar).toEqual([]);
});

test('Film: duraklat / devam', async ({ page }, info) => {
  test.skip(info.project.name !== 'iphone', 'bir kez yeter');
  await page.goto('./film/?onizleme=1&sessiz=1');
  await page.getByRole('button', { name: 'Oynat' }).click();
  // önce açılış kartı (jenerik 7,9 sn), sonra film başlar ve Duraklat düğmesi görünür
  await expect(page.locator('.fl-acilis-baslik')).toBeVisible();
  await expect(page.locator('.fl-sahne[data-sahne]')).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: 'Duraklat' }).click();
  await expect(page.locator('.fl-sahne.duraklatildi')).toBeVisible();
  const kamera = await page.locator('.fl-orta').evaluate((e) => e.style.transform);
  await page.waitForTimeout(700);
  expect(await page.locator('.fl-orta').evaluate((e) => e.style.transform)).toBe(kamera);
  await page.getByRole('button', { name: 'Devam' }).click();
  await expect(page.locator('.fl-sahne.duraklatildi')).toHaveCount(0);
});
