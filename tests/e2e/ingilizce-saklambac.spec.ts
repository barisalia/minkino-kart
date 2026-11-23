// Hide & Seek with Mino (Oyunlar): test kipinde (çizimler gelmeden yer tutucuyla) baştan sona. Oyun yatay oynanır.
import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

test.use({ viewport: { width: 844, height: 390 }, isMobile: false, hasTouch: true });
const tik = { force: true, timeout: 4000 } as const;
const MINO_YERLERI = ['kutu-ic', 'masa-alt', 'yatak-ust', 'sandalye-yan'];
const EDAT: Record<string, string> = { 'kutu-ic': 'in', 'masa-ust': 'on', 'masa-alt': 'under', 'yatak-ust': 'on', 'sandalye-ust': 'on', 'sandalye-yan': 'next to' };

async function ac(page: Page, yas: number) {
  await page.goto('./ingilizce/?test=1');
  await page.evaluate((y) => { localStorage.clear(); localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: y })); }, yas);
  await page.goto('./ingilizce/?test=1&ekran=oyunlar');
  const kart = page.locator('[data-oyun="saklambac"]');
  await expect(kart).toBeVisible();
  await kart.click(tik);
  await expect(page.locator('.ing-sk-oda')).toBeVisible();
}

/** Dört turu oynar; ilk turda bilerek iki kez yanlış yere dokunur (ipucu parlar). Görülen turları döner. */
async function oyna(page: Page, yanlisYap = false, besArti = false): Promise<string[]> {
  const oda = page.locator('.ing-sk-oda');
  const gorulen: string[] = [];
  for (let i = 0; i < 4; i++) {
    // turu numarasıyla bekle (önceki turun hedefi okunmasın)
    await expect(oda).toHaveAttribute('data-no', String(i), { timeout: 15000 });
    await expect(oda).toHaveAttribute('data-bekliyor', 'true', { timeout: 15000 });
    const tur = (await oda.getAttribute('data-tur'))!, hedef = (await oda.getAttribute('data-hedef'))!;
    gorulen.push(tur + ':' + hedef);
    if (tur === 'bul') await expect(page.locator('.ing-sk-mino')).toHaveCount(1);
    else await expect(page.locator('.ing-sk-tepsi .ing-sk-oyuncak')).toHaveCount(1);
    if (yanlisYap && i === 0) {
      const baska = (await page.locator('.ing-sk-bolge').evaluateAll((l) => l.map((b) => (b as HTMLElement).dataset.yer!))).find((y) => y !== hedef)!;
      for (let k = 0; k < 2; k++) {
        await page.locator(`.ing-sk-bolge[data-yer="${baska}"]`).click(tik);
        await expect(oda).toHaveAttribute('data-bekliyor', 'true', { timeout: 15000 });
      }
      await expect(page.locator(`.ing-sk-bolge[data-yer="${hedef}"]`)).toHaveClass(/ing-parla/);
    }
    await page.locator(`.ing-sk-bolge[data-yer="${hedef}"]`).click(tik);
    // bulunan Mino ya da konan oyuncak odada; edat taşı yanar
    if (tur === 'bul') await expect(page.locator('.ing-sk-buldum')).toHaveCount(1);
    else await expect(page.locator('.ing-sk-konan')).toHaveCount(1);
    // 5+: çocuk cümleyi kendi söyler (testte mikrofon yok: yıldız düğmesi)
    if (tur === 'bul' && besArti) {
      const yildiz = page.locator('.ing-sk-alt .ing-yildiz-dugme');
      await expect(yildiz).toBeVisible({ timeout: 10000 });
      await yildiz.click(tik);
    }
  }
  // oyunun test kipindeki izi: her turda doğru yer ve Polly'nin söylediği yer sözü taş olarak yandı
  await expect(page.locator('.ing-sonuc-baslik')).toBeVisible({ timeout: 15000 });
  const iz = await page.evaluate(() => (window as unknown as { __sk: string[] }).__sk);
  expect(iz.filter((x) => x.includes('dogru')).map((x) => x.split(' ')[1])).toEqual(gorulen.map((g) => g.split(':')[1]));
  expect(iz.filter((x) => x.includes('edat')).map((x) => x.slice(x.indexOf('edat ') + 5))).toEqual(gorulen.map((g) => EDAT[g.split(':')[1]]));
  return gorulen;
}

test('Oyunlar kartı açar; 5+ yaş: dört tur, Mino bulunur, oyuncak konur, cümleyi çocuk söyler; yanlış yerde ipucu parlar', async ({ page }) => {
  const hatalar = hataTopla(page);
  await ac(page, 6);
  const gorulen = await oyna(page, true, true);
  expect(gorulen.map((g) => g.split(':')[0])).toEqual(['bul', 'koy', 'bul', 'koy']);
  expect(new Set(gorulen.map((g) => g.split(':')[1])).size).toBe(4);
  expect(gorulen.some((g) => g.endsWith('sandalye-yan'))).toBe(true); // 5+ yaşın yeni sözü: next to
  for (const g of gorulen.filter((x) => x.startsWith('bul'))) expect(MINO_YERLERI).toContain(g.split(':')[1]);
  await expect(page.locator('.ing-sonuc-baslik')).toBeVisible({ timeout: 15000 });
  expect(hatalar).toEqual([]);
});

test('2–3 yaş: yalnız in ve on (kutunun içi, masanın, yatağın, sandalyenin üstü)', async ({ page }) => {
  const hatalar = hataTopla(page);
  await ac(page, 3);
  const gorulen = await oyna(page);
  for (const g of gorulen) expect(['kutu-ic', 'masa-ust', 'yatak-ust', 'sandalye-ust']).toContain(g.split(':')[1]);
  await expect(page.locator('.ing-sonuc-baslik')).toBeVisible({ timeout: 15000 });
  expect(hatalar).toEqual([]);
});
