import { expect, test, type Page } from '@playwright/test';

// Akıllı tekrar (matematik/src/akilli-tekrar.ts) ve tezgâhtaki "Büyükler için" (veli.ts): Hızlı Gözler'deki yanlış
// yaşın defterine yazılır; sonraki turda o sayı ısınma sorusunun ardından gelir, Ceren "Bu sayıyla bir daha oynayalım!"
// der; veli sayfası zorlandığı sayıları gösterir.
test.use({ reducedMotion: 'reduce' });
test.describe.configure({ timeout: 120000 });

const DEFTER = 'minkino-matematik-tekrar-bes-v1';
async function ac(p: Page, kayit: Record<string, unknown>, adres = '/matematik/') {
  const ekran = p.viewportSize();
  if (ekran && ekran.width < 600 && ekran.height > ekran.width) await p.setViewportSize({ width: ekran.height, height: ekran.width });
  await p.addInitScript((k) => {
    const w = window as unknown as { __calan: string[] };
    w.__calan = [];
    const asil = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () { w.__calan.push(decodeURIComponent(this.src.split('/').pop() ?? '')); return asil.call(this); };
    if (sessionStorage.getItem('kuruldu')) return;
    sessionStorage.setItem('kuruldu', '1');
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: 5, ayarlar: { muzik: false } }));
    localStorage.setItem('minkino-matematik-ceren-sayilar-v1', JSON.stringify({ biten: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], simdi: 10, tanitildi: true, bitti: true }));
    for (const [a, v] of Object.entries(k)) localStorage.setItem(a, JSON.stringify(v));
  }, kayit);
  await p.goto(adres);
}
const defter = (p: Page) => p.evaluate((a) => JSON.parse(localStorage.getItem(a) || '{}'), DEFTER);
const soruyaGel = (p: Page, q: number) =>
  expect(p.locator('.pano.hizli-gozler[data-soru="' + q + '"]')).toHaveAttribute('data-durum', 'sor', { timeout: 20000 });

test('Hızlı Gözler: yanlış deftere yazılır; sonraki turda o sayı ısınmadan sonra gelir, Ceren karşılar; iki doğruyla düşer', async ({ page: p }) => {
  // 5 yaş Sayı sırasının 3. adımı (tur 16: 4, 7, 3, 6). Defterde 9 var (son zorlandığı).
  await ac(p, { 'minkino-matematik-1-sayi': { kuleTamam: true, adim: 2, yer: 0, secimler: [], surum: 2 }, [DEFTER]: { 9: { y: 1, d: 0, s: 1 } } });
  await p.locator('.k0').click({ force: true });
  // Isınma: turun kendi ilk sayısı.
  await soruyaGel(p, 0);
  expect(await p.locator('.hg-nesne').count()).toBe(4);
  await p.getByRole('button', { name: '4', exact: true }).click();
  // Zorlandığı 9 hemen ardından; Ceren'in karşılaması çalar.
  await soruyaGel(p, 1);
  expect(await p.locator('.hg-nesne').count()).toBe(9);
  await expect(p.locator('.pano.hizli-gozler')).toHaveAttribute('data-bir-daha', '1');
  expect(await p.evaluate(() => (window as unknown as { __calan: string[] }).__calan)).toContain('ses-119.mp3');
  await p.getByRole('button', { name: '9', exact: true }).click();
  expect((await defter(p))['9']).toMatchObject({ y: 1, d: 1 });
  // Üçüncü soru (7): yanlış seçilir → deftere yazılır, en son zorlanan o olur.
  await soruyaGel(p, 2);
  expect(await p.locator('.hg-nesne').count()).toBe(7);
  const secenek = await p.locator('.hg-rakam').evaluateAll((els) => els.map((e) => Number(e.getAttribute('aria-label'))));
  await p.getByRole('button', { name: String(secenek.find((r) => r !== 7)), exact: true }).click();
  await expect.poll(async () => Object.keys(await defter(p))).toEqual(expect.arrayContaining(['7', '9']));
  await expect(p.locator('.pano.hizli-gozler')).toHaveAttribute('data-durum', 'sor', { timeout: 20000 });
  await p.getByRole('button', { name: '7', exact: true }).click();
  // İkinci bakışta bilmek "öğrendi" saymaz: 7 defterde kalır.
  await soruyaGel(p, 3);
  expect((await defter(p))['7']).toMatchObject({ y: 1, d: 0 });
  // Tur sayısı değişmedi: dört yıldız.
  await expect(p.locator('.hg-yildizlar i')).toHaveCount(4);
  await p.getByRole('button', { name: String(await p.locator('.hg-nesne').count()), exact: true }).click();
  await expect(p.locator('.basari')).toBeVisible({ timeout: 20000 });

  await expect.poll(async () => (await p.evaluate(() => JSON.parse(localStorage['minkino-matematik-1-sayi']))).adim).toBe(3);
  // Sonraki Hızlı Gözler turu (5 yaşta 7. adım, tur 17: 8, 5, 10, 9): ısınma 8, sonra en son zorlanan 7, sonra 9.
  await p.evaluate(() => localStorage.setItem('minkino-matematik-1-sayi', JSON.stringify({ kuleTamam: true, adim: 6, yer: 0, secimler: [], surum: 2 })));
  await p.reload();
  await p.locator('.k0').click({ force: true });
  await soruyaGel(p, 0);
  expect(await p.locator('.hg-nesne').count()).toBe(8);
  await p.getByRole('button', { name: '8', exact: true }).click();
  await soruyaGel(p, 1);
  expect(await p.locator('.hg-nesne').count()).toBe(7);
  await p.getByRole('button', { name: '7', exact: true }).click();
  await soruyaGel(p, 2);
  expect(await p.locator('.hg-nesne').count()).toBe(9);
  await p.getByRole('button', { name: '9', exact: true }).click();
  // 9 yanlıştan sonra iki kez ilk bakışta bilindi: defterden düştü; 7 bir kez.
  await expect.poll(async () => defter(p)).toEqual({ 7: expect.objectContaining({ d: 1 }) });
});

test('Tezgâhta "Büyükler için": ebeveyn kapısından veli sayfası açılır, zorlandığı sayıları gösterir, tezgâha döner', async ({ page: p }) => {
  // Test kipi: kapının sorusu sayfada okunur (data-toplam).
  await ac(p, { [DEFTER]: { 6: { y: 2, d: 0, s: 2 }, 3: { y: 1, d: 1, s: 1 } } }, '/matematik/?test=1');
  const dugme = p.getByRole('button', { name: 'Büyükler için', exact: true });
  await expect(dugme).toBeVisible();
  const kutu = (await dugme.boundingBox())!;
  expect(Math.min(kutu.width, kutu.height)).toBeGreaterThanOrEqual(44);
  await dugme.click();
  const soru = p.locator('.kapi-soru[data-toplam]');
  await expect(soru).toBeVisible();
  for (const r of (await soru.getAttribute('data-toplam'))!) await p.locator(`.kapi-perde .tus[aria-label="${r}"]`).click();
  await p.locator('.kapi-perde .tus.tamam').click();
  const v = p.locator('.mv-veli');
  await expect(v).toBeVisible();
  await expect(v.locator('.mv-zor-sayilar li')).toHaveText(['3', '6']);
  await v.getByRole('button', { name: 'Geri dön' }).click();
  await expect(v).toHaveCount(0);
  await expect(p.getByLabel('Sayı masası', { exact: true })).toBeVisible();
  expect(await p.locator('#sahne').evaluate((e) => (e as HTMLElement).inert)).toBe(false);
});
