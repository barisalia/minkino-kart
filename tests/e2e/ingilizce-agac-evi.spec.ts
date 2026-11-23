// Polly'nin Yaşayan Ağaç Evi (ingilizce/src/ekranlar/agac-evi.ts): kelime dersleri biten adanın eşyası eve gelir,
// dokununca öbür durumuna geçer ve Polly'nin cümlesi yazılır; durum ve görülenler cihazda kalır. Oyun yatay oynanır.
import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

const ILERLEME = 'minkino-ingilizce-v1';
const EV = 'minkino-ingilizce-agac-v1';
const kayit = (adalar: string[]) => ({
  surum: 1, dersler: Object.fromEntries(adalar.flatMap((u) => [1, 2, 3].map((n) => [`${u}-${n}`, 3]))),
  kelimeler: {}, cikartmalar: [], tekrar: { gun: '', adet: 0 }, gunler: [], tanisildi: true,
});
const cihaz = () => test.info().project.name.split('-')[0];

async function kur(page: Page, adalar: string[]) {
  const ekran = cihaz() === 'ipad' ? { width: 1024, height: 768 } : { width: 844, height: 390 };
  await page.setViewportSize(ekran);
  await page.addInitScript(([k, a, e]) => {
    if (sessionStorage.getItem('kuruldu')) return;
    sessionStorage.setItem('kuruldu', '1');
    localStorage.setItem(k as string, JSON.stringify(a));
    localStorage.removeItem(e as string);
  }, [ILERLEME, kayit(adalar), EV] as const);
}

test('ana ekrandan girilir; biten adaların eşyaları gelir, yeni eşya parlar, dokununca durum ve cümle değişir, kayıt kalır', async ({ page }) => {
  const hatalar = hataTopla(page);
  await kur(page, ['ciftlik', 'renkler']);
  // ana ekrandan giriş 23 Kasım'da kaldırıldı (Barış); ekran doğrudan açılır
  await page.goto('./ingilizce/?test=1&ekran=agac');
  await expect(page.locator('.ing-ae-sahne')).toBeVisible();
  const esyalar = page.locator('.ing-ae-esya');
  await expect(esyalar).toHaveCount(2);
  expect(await esyalar.evaluateAll((l) => l.map((e) => (e as HTMLElement).dataset.esya))).toEqual(['ahir', 'renk-lambasi']);
  await expect(page.locator('.ing-ae-esya.ing-ae-yeni')).toHaveCount(2);
  await expect(page.locator('.ing-ae-sayac')).toHaveText('2 / 24');

  const ahir = page.locator('.ing-ae-esya[data-esya="ahir"]');
  await ahir.click({ force: true });
  await expect(ahir).toHaveAttribute('data-durum', '1');
  await expect(page.locator('.ing-ae-yazi')).toHaveText('Open the barn! Hello, cow!');
  await expect(ahir).not.toHaveClass(/ing-ae-yeni/);
  await ahir.click({ force: true });
  await expect(ahir).toHaveAttribute('data-durum', '0');
  await expect(page.locator('.ing-ae-yazi')).toHaveText('Close the barn. Bye, cow!');
  await page.locator('.ing-ae-esya[data-esya="renk-lambasi"]').click({ force: true });

  // yeniden açılınca durum aynı, eşyalar artık parlamıyor
  await page.goto('./ingilizce/?test=1&ekran=agac');
  await expect(page.locator('.ing-ae-esya[data-esya="renk-lambasi"]')).toHaveAttribute('data-durum', '1');
  await expect(page.locator('.ing-ae-esya.ing-ae-yeni')).toHaveCount(0);

  // eşyalar sahnenin içinde
  const sahne = (await page.locator('.ing-ae-sahne').boundingBox())!;
  for (const b of await esyalar.evaluateAll((l) => l.map((e) => e.getBoundingClientRect().toJSON()))) {
    expect(b.left).toBeGreaterThanOrEqual(sahne.x - 1);
    expect(b.right).toBeLessThanOrEqual(sahne.x + sahne.width + 1);
  }
  expect(hatalar).toEqual([]);
});

test('hiç ada bitmemişse ev boş ve ne yapılacağı yazılı; taslakta 24 eşyalık görüntü', async ({ page }) => {
  await kur(page, []);
  await page.goto('./ingilizce/?test=1&ekran=agac');
  await expect(page.locator('.ing-ae-esya')).toHaveCount(0);
  await expect(page.locator('.ing-ae-bos')).toBeVisible();
  await page.screenshot({ path: `output/ingilizce/agac-evi/${cihaz()}-bos.png` });

  // taslak görünümü: bütün adaların kelime dersleri bitmiş bir çocuk (13–24 de açık), yarısı açık durumda
  const p2 = await page.context().newPage();
  await kur(p2, ['ciftlik', 'renkler', 'sayilar', 'yiyecekler', 'oyuncaklar', 'ailem', 'yuzum', 'kiyafetler', 'odam', 'tasitlar', 'hareketler', 'vahsi',
    'meyve', 'hava', 'doga', 'evim', 'okul', 'duygular', 'sekiller', 'sofra', 'park', 'vucudum', 'gunum', 'sayilar2']);
  await p2.goto('./ingilizce/?test=1&taslak&ekran=agac');
  await expect(p2.locator('.ing-ae-esya')).toHaveCount(24);
  const ids = await p2.locator('.ing-ae-esya').evaluateAll((l) => l.map((e) => (e as HTMLElement).dataset.esya!));
  for (const id of ids.filter((_, i) => i % 2 === 0)) await p2.locator(`.ing-ae-esya[data-esya="${id}"]`).click({ force: true });
  await p2.waitForTimeout(600);
  await p2.screenshot({ path: `output/ingilizce/agac-evi/${cihaz()}-taslak-24.png` });
  await p2.goto('./ingilizce/?test=1&taslak');
  await expect(p2.locator('.ing-ae-giris')).toHaveCount(0);
  await p2.screenshot({ path: `output/ingilizce/agac-evi/${cihaz()}-ana-ekran.png` });
});
