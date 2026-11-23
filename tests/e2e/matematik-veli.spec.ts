import { expect, test, type Page } from '@playwright/test';
// Matematik "Büyükler için" veli sayfası (matematik/src/veli.ts): ebeveyn kapısı → çocuğun ilerlemesi.
// Tezgâhtaki satır gelene dek sayfa ?test=1&veli=1 ile açılır; modül sayfaya testten yüklenir (main.ts bağlayınca
// aynı modül önbellekten gelir, ikinci kez açılmaz).
test.use({ reducedMotion: 'reduce' });
test.beforeEach(async ({ page }) => {
  const ekran = page.viewportSize();
  if (ekran && ekran.width < 600 && ekran.height > ekran.width) await page.setViewportSize({ width: ekran.height, height: ekran.width });
});

const DERS = 'minkino-matematik-ceren-sayilar-v1';
const tur = (adim: number, ek: Record<string, unknown> = {}) => ({ adim, yer: 0, secimler: [], hatira: false, surum: 2, ...ek });
const hepsi = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

async function ac(page: Page, yas: Record<string, unknown>, kayit: Record<string, unknown> = {}, kapiyiGec = true) {
  await page.addInitScript(([y, k]) => {
    if (sessionStorage.getItem('kuruldu')) return;
    sessionStorage.setItem('kuruldu', '1');
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ ...y, ayarlar: { muzik: false } }));
    for (const [a, v] of Object.entries(k)) localStorage.setItem(a, JSON.stringify(v));
  }, [yas, kayit] as const);
  await page.goto('/matematik/?test=1&veli=1');
  await page.waitForLoadState('load');
  await page.addScriptTag({ type: 'module', content: "import '/matematik/src/veli.ts';" });
  const soru = page.locator('.kapi-soru[data-toplam]');
  await expect(soru).toBeVisible();
  if (!kapiyiGec) return;
  for (const r of (await soru.getAttribute('data-toplam'))!) await page.locator(`.kapi-perde .tus[aria-label="${r}"]`).click();
  await page.locator('.kapi-perde .tus.tamam').click();
  await expect(page.locator('.mv-veli')).toBeVisible();
}

test('kapı kapatılınca sayfa açılmaz, tezgâh olduğu gibi kalır', async ({ page }) => {
  await ac(page, { yas: 5 }, {}, false);
  await page.locator('.kapi-perde .kapat-dugme').click();
  await expect(page.locator('.kapi-perde')).toHaveCount(0);
  await expect(page.locator('.mv-veli')).toHaveCount(0);
  await expect(page.getByLabel('Sayı masası', { exact: true })).toBeVisible();
  expect(await page.locator('#sahne').evaluate((e) => (e as HTMLElement).inert)).toBe(false);
});

test('boş kayıt: hiçbir şey başlamadı, sırada 1, ilk öneri merdivende saymak; zorlandığı sayılar yok', async ({ page }) => {
  await ac(page, { yas: 5 });
  const v = page.locator('.mv-veli');
  await expect(v).toHaveAttribute('data-bos', 'true');
  await expect(v.locator('.mv-baslik p')).toHaveText('Matematik · 5 yaş');
  await expect(v.locator('.mv-sayilar li')).toHaveCount(10);
  await expect(v.locator('.mv-sayilar li[data-durum="sirada"]')).toHaveText('1');
  await expect(v.locator('.mv-ders')).toContainText('Henüz başlamadı');
  await expect(v.locator('.mv-oyuncak[data-id="sayi"]')).toContainText("Ceren'in dersinden sonra başlar");
  await expect(v.locator('.mv-beceri[data-durum="yok"]')).toHaveCount(5);
  await expect(v.locator('.mv-oneriler li').first()).toContainText('Merdiven çıkarken basamakları birlikte sayın');
  // Bugün Evde 1 Dakika: en üstte; ilerleme yoksa başlangıç ipucu.
  await expect(v.locator('.mv-bugun h2')).toHaveText('Başlarken');
  expect(await v.locator('.mv-icerik > *').first().getAttribute('class')).toBe('mv-bugun');
  await expect(v.locator('.mv-zor')).toHaveCount(0);
  // Sayfa açıkken tezgâh tıklanmaz.
  expect(await page.locator('#sahne').evaluate((e) => (e as HTMLElement).inert)).toBe(true);
});

test('yarım kayıt (4 yaş): öğrendiği sayılar, oyuncak turları ve düzeye göre öneri', async ({ page }) => {
  await ac(page, { yas: 4 }, {
    [DERS]: { biten: [1, 2, 3], simdi: 4, tanitildi: true, bitti: false },
    'minkino-matematik-1-dort-sekil': tur(3),
  });
  const v = page.locator('.mv-veli');
  await expect(v.locator('.mv-sayilar li[data-durum="ogrendi"]')).toHaveText(['1', '2', '3']);
  await expect(v.locator('.mv-sayilar li[data-durum="sirada"]')).toHaveText('4');
  await expect(v.locator('.mv-kutu[data-ad="sayi"] strong')).toHaveText('3/10');
  await expect(v.locator('.mv-kutu[data-ad="tur"] strong')).toHaveText('3/32');
  await expect(v.locator('.mv-oyuncak[data-id="sekil"]')).toContainText('3 / 10 tur');
  await expect(v.locator('.mv-beceri[data-id="sayma"] .mv-cip')).toHaveText('Öğreniyor');
  // Merdivende sayma en üstteki kartta, Evde birlikte yinelemez.
  await expect(v.locator('.mv-bugun')).toContainText("Ceren'le 3'e kadar saydı");
  await expect(v.locator('.mv-oneriler')).not.toContainText('Merdiven');
  await expect(v.locator('.mv-oneriler li')).toHaveCount(2);
});

test('dolu kayıt: dört hatıra, bütün beceriler tamam; geri düğmesi tezgâha döner', async ({ page }) => {
  await ac(page, { yas: 5 }, {
    [DERS]: { biten: hepsi(10), simdi: 10, tanitildi: true, bitti: true },
    'minkino-matematik-1-sayi': tur(10, { hatira: true, kuleTamam: true }),
    'minkino-matematik-1-sekil': tur(10, { hatira: true }),
    'minkino-matematik-1-olcu': tur(6, { hatira: true }),
    'minkino-matematik-1-fener': tur(6, { hatira: true }),
  });
  const v = page.locator('.mv-veli');
  await expect(v.locator('.mv-hatira[data-alindi="true"]')).toHaveCount(4);
  // Rozet: oyuncağın kendi hatıra çizimi (assets/matematik/hatira-*).
  await expect(v.locator('.mv-oyuncak[data-id="fener"] .mv-hatira-resim')).toHaveAttribute('src', /hatira-fener/);
  await expect(v.locator('.mv-beceri[data-durum="tamam"]')).toHaveCount(5);
  await expect(v.locator('.mv-oneriler li').first()).toContainText('Bütün oyuncakları bitirdi');
  await expect(v.locator('.mv-bugun h2')).toHaveText('Sayılar 1–10 dersini bitirdi');
  const geri = page.getByRole('button', { name: 'Geri dön' });
  const kutu = (await geri.boundingBox())!;
  expect(Math.min(kutu.width, kutu.height)).toBeGreaterThanOrEqual(44);
  // Yatay kaydırma yok; her kart sayfanın içinde.
  expect(await v.evaluate((e) => e.scrollWidth - e.clientWidth)).toBeLessThanOrEqual(0);
  const genislik = page.viewportSize()!.width;
  for (const r of await v.locator('.mv-kart, .mv-kutu').evaluateAll((l) => l.map((e) => e.getBoundingClientRect().toJSON()))) {
    expect(r.left).toBeGreaterThanOrEqual(0);
    expect(r.right).toBeLessThanOrEqual(genislik);
  }
  await geri.click();
  await expect(page.locator('.mv-veli')).toHaveCount(0);
  expect(await page.locator('#sahne').evaluate((e) => (e as HTMLElement).inert)).toBe(false);
  await expect(page.getByLabel('Sayı masası', { exact: true })).toBeVisible();
});

test('3 yaş: ders 1–5, Esc sayfayı kapatır', async ({ page }) => {
  await ac(page, { yas: 3 }, { [DERS]: { biten: hepsi(5), simdi: 5, tanitildi: true, bitti: true } });
  const v = page.locator('.mv-veli');
  await expect(v).toHaveAttribute('data-yol', 'minik');
  await expect(v.locator('.mv-sayilar li')).toHaveText(['1', '2', '3', '4', '5']);
  await expect(v.locator('.mv-ders')).toContainText("1'den 5'e kadar bütün sayıları öğrendi.");
  await page.keyboard.press('Escape');
  await expect(page.locator('.mv-veli')).toHaveCount(0);
});
