import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

/**
 * Oyunlu çizgi film deneme sayfası (oyunlu/kinonun-bir-gunu.html) duman testi: kapak → Sahne 1 → Sahne 2 → köprü →
 * Oyun 1 Kum Saati (parmak köpüğün peşinden gider) → dönüş → son ekranı. ?hiz=N saati hızlandırır.
 */
declare global {
  interface Window {
    oyunlu?: {
      parca: () => string | undefined;
      kopuk: () => [number, number] | null;
      kum: () => number;
      evre: () => string;
      sozler: () => { id: string; bas: number; sure: number }[];
      altyazi: () => boolean;
    };
  }
}

/** seslendirme: hiçbir söz bir öncekinin üstüne binmez, araya nefes payı girer */
async function konusmalarSirali(page: Page) {
  const s = await page.evaluate(() => window.oyunlu!.sozler());
  expect(s.length).toBeGreaterThan(5);
  const sirali = [...s].sort((a, b) => a.bas - b.bas);
  for (let i = 1; i < sirali.length; i++) {
    const o = sirali[i - 1];
    expect(sirali[i].bas - (o.bas + o.sure), `${o.id} → ${sirali[i].id}`).toBeGreaterThanOrEqual(0.15);
  }
  return sirali.map((x) => x.id);
}

async function oyunaKadar(page: Page, adres: string) {
  await page.goto(adres);
  await expect(page.locator('.oy-kapak-baslik')).toHaveText("Kino'nun Bir Günü");
  await page.getByRole('button', { name: 'Oynat' }).click();
  await expect(page.locator('#oyunlu')).toHaveAttribute('data-parca', 'oyun1-kum-saati', { timeout: 60_000 });
}

/** parmağı köpüğe koyar ve peşinden gider (oyun bitene kadar) */
async function kopuguIzle(page: Page) {
  const ilk = await page.evaluate(() => window.oyunlu!.kopuk());
  expect(ilk).not.toBeNull();
  await page.mouse.move(ilk![0], ilk![1]);
  await page.mouse.down();
  let enCokKum = 0;
  for (let i = 0; i < 1200; i++) {
    const k = await page.evaluate(() => [window.oyunlu!.kopuk(), window.oyunlu!.kum(), window.oyunlu!.evre()] as const);
    enCokKum = Math.max(enCokKum, k[1]);
    if (k[2] !== 'oyun' || !k[0]) break;
    await page.mouse.move(k[0][0], k[0][1]);
    await page.waitForTimeout(30);
  }
  await page.mouse.up();
  return enCokKum;
}

test.describe('telefon yatay 844×390', () => {
  test.use({ viewport: { width: 844, height: 390 } });
  test('Sahne 1-2 akar, oyun parmakla oynanır, film kaldığı yerden sürer', async ({ page }, info) => {
    const hatalar = hataTopla(page);
    await page.goto('./oyunlu/kinonun-bir-gunu.html?hiz=6&yas=3');
    await page.screenshot({ path: `tests/screens/${info.project.name}-oyunlu-0-kapak-yatay.png` });
    await page.getByRole('button', { name: 'Oynat' }).click();
    await expect(page.locator('#oyunlu')).toHaveAttribute('data-parca', 'sahne1-gunaydin', { timeout: 30_000 });
    // seslendirme var: altyazı varsayılan kapalı, ebeveyn düğmesiyle açılır ve seçim saklanır
    expect(await page.evaluate(() => window.oyunlu!.altyazi())).toBe(false);
    await page.getByRole('button', { name: 'Altyazıyı aç' }).click();
    expect(await page.evaluate(() => window.oyunlu!.altyazi())).toBe(true);
    await page.getByRole('button', { name: 'Altyazıyı kapat' }).click();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('minkino-oyunlu-v1') ?? '{}').altyazi)).toBe(false);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `tests/screens/${info.project.name}-oyunlu-1-sahne1-yatay.png` });
    await expect(page.locator('#oyunlu')).toHaveAttribute('data-parca', 'sahne2-lavabo', { timeout: 30_000 });
    await expect(page.locator('#oyunlu')).toHaveAttribute('data-parca', 'oyun1-kum-saati', { timeout: 30_000 });
    // dokunuş hemen geçerli: köpük var, kum dolu
    expect(await page.evaluate(() => window.oyunlu!.kum())).toBeLessThan(0.05);
    await page.screenshot({ path: `tests/screens/${info.project.name}-oyunlu-2-oyun-yatay.png` });
    const kum = await kopuguIzle(page);
    expect(kum).toBeGreaterThan(0.9);
    await expect.poll(() => page.evaluate(() => window.oyunlu!.evre()), { timeout: 20_000 }).toMatch(/bitis|sonra/);
    await expect(page.locator('#oyunlu')).toHaveAttribute('data-parca', 'sahne2-donus', { timeout: 20_000 });
    await expect(page.locator('#oyunlu')).toHaveAttribute('data-durum', 'son', { timeout: 20_000 });
    await expect(page.getByRole('button', { name: 'Baştan izle' })).toBeVisible();
    await page.screenshot({ path: `tests/screens/${info.project.name}-oyunlu-3-son-yatay.png` });
    // kayıt yalnız cihazda
    const kayit = await page.evaluate(() => JSON.parse(localStorage.getItem('minkino-oyunlu-v1') ?? '{}'));
    expect(kayit.oyunlar['kum-saati'].kez).toBe(1);
    const sira = await konusmalarSirali(page);
    expect(sira.slice(0, 3)).toEqual(['s1-anl1', 's1-lok1', 's1-kino1']);
    expect(sira).toContain('o1-bitti');
    expect(hatalar).toEqual([]);
  });
});

test('dikey: an tekrarı, hiç dokunulmazsa yardım merdiveni oyunu kendisi bitirir (5-6 yaş)', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await oyunaKadar(page, './oyunlu/kinonun-bir-gunu.html?hiz=8&yas=5&an=kum-saati');
  await page.screenshot({ path: `tests/screens/${info.project.name}-oyunlu-4-oyun-dikey.png` });
  await expect.poll(() => page.evaluate(() => window.oyunlu!.evre()), { timeout: 60_000 }).toMatch(/bitis|sonra/);
  await expect(page.locator('#oyunlu')).toHaveAttribute('data-durum', 'son', { timeout: 30_000 });
  // yardım cümleleri ve sayma sırayla: üst üste binmez; 5-6'da Kino dörde kadar sayar
  const sira = await konusmalarSirali(page);
  expect(sira.filter((id) => /^o1-(bir|iki|uc|dort)$/.test(id))).toEqual(['o1-bir', 'o1-iki', 'o1-uc', 'o1-dort']);
  expect(sira).toEqual(expect.arrayContaining(['o1-cagri', 'o1-yukari', 'o1-yardim', 'o1-bak', 'o1-bitirim', 'o1-pft', 'o1-bitti']));
  // diş oyunu tekrar: yeni oyun dolu kum saatiyle başlar
  await page.getByRole('button', { name: 'Diş oyununu tekrar oyna' }).click();
  await expect(page.locator('#oyunlu')).toHaveAttribute('data-parca', 'oyun1-kum-saati', { timeout: 30_000 });
  expect(await page.evaluate(() => window.oyunlu!.kum())).toBeLessThan(0.05);
  expect(hatalar).toEqual([]);
});
