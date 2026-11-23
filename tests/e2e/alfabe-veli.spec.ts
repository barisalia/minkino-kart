import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { HARF_SIRASI, SES_GRUPLARI } from '../../alfabe/src/harf-sirasi';
// Harf Atölyesi "Büyükler için" veli sayfası (alfabe/src/veli.ts): ebeveyn kapısı → çocuğun ilerlemesi.
// Raftaki satır gelene dek sayfa ?test=1&veli=1 ile açılır; modül sayfaya testten yüklenir.
test.use({ reducedMotion: 'reduce' });
test.beforeEach(async ({ page }) => {
  const ekran = page.viewportSize();
  if (ekran && ekran.width < 600 && ekran.height > ekran.width) await page.setViewportSize({ width: ekran.height, height: ekran.width });
});

const ids = (n: number) => Array.from({ length: n }, (_, i) => String(i + 1).padStart(2, '0'));
/** Ders kimliği → büyük harf (harfler.json); sıra harf-sirasi.ts'ten, elle yazılmaz. */
const dersler: { id: string; upper: string }[] = JSON.parse(readFileSync('alfabe/src/harfler.json', 'utf8'));
const heceVerisi: { unsuzler: string[] } = JSON.parse(readFileSync('alfabe/src/hece-evleri-veri.json', 'utf8'));
const harf = (id: string) => dersler.find((d) => d.id === id)!.upper;
const unsuz = (u: string) => u.toLocaleUpperCase('tr');

async function ac(page: Page, yas: Record<string, unknown>, kayit: Record<string, unknown> = {}, kapiyiGec = true) {
  await page.addInitScript(([y, k]) => {
    if (sessionStorage.getItem('kuruldu')) return;
    sessionStorage.setItem('kuruldu', '1');
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ ...y, ayarlar: { muzik: false } }));
    for (const [a, v] of Object.entries(k)) localStorage.setItem(a, JSON.stringify(v));
  }, [yas, kayit] as const);
  await page.goto('/alfabe/?test=1&veli=1');
  await page.waitForLoadState('load');
  await page.addScriptTag({ type: 'module', content: "import '/alfabe/src/veli.ts';" });
  const soru = page.locator('.kapi-soru[data-toplam]');
  await expect(soru).toBeVisible();
  if (!kapiyiGec) return;
  for (const r of (await soru.getAttribute('data-toplam'))!) await page.locator(`.kapi-perde .tus[aria-label="${r}"]`).click();
  await page.locator('.kapi-perde .tus.tamam').click();
  await expect(page.locator('.hv-veli')).toBeVisible();
}

test('kapı kapatılınca sayfa açılmaz, raf tıklanabilir kalır', async ({ page }) => {
  await ac(page, { yas: 5 }, {}, false);
  await page.locator('.kapi-perde .kapat-dugme').click();
  await expect(page.locator('.kapi-perde')).toHaveCount(0);
  await expect(page.locator('.hv-veli')).toHaveCount(0);
  expect(await page.locator('#atolye').evaluate((e) => (e as HTMLElement).inert)).toBe(false);
});

test('boş kayıt: 29 harf, A sırada, günlük yokken son 7 gün bölümü yok', async ({ page }) => {
  await ac(page, { yas: 5 });
  const v = page.locator('.hv-veli');
  await expect(v).toHaveAttribute('data-bos', 'true');
  await expect(v.locator('.hv-harfler li')).toHaveCount(29);
  await expect(v.locator('.hv-harfler li[data-durum="sirada"]')).toHaveText(harf(HARF_SIRASI[0]));
  await expect(v.locator('.hv-anahtarlar li')).toHaveCount(20);
  await expect(v.locator('.hv-zor')).toHaveCount(0);
  // Harfin ev oyunu en üstteki kartta; Evde birlikte heceyle başlar.
  await expect(v.locator('.hv-bugun')).toContainText('Adının ilk harfini');
  await expect(v.locator('.hv-oneriler li').first()).toContainText('Adını alkışlayarak');
  await expect(v.locator('.hv-bugun h2')).toHaveText('Başlarken');
  expect(await page.locator('#atolye').evaluate((e) => (e as HTMLElement).inert)).toBe(true);
});

test('yarım kayıt (4 yaş): öğrendiği harfler, yarım ders, anahtarlar, son harfe göre öneri', async ({ page }) => {
  await ac(page, { yas: 4 }, {
    // Ses grubu sırasında ilk beş harf bitti, altıncısı yarıda.
    'minkino-alfabe-v1-yas-4': { biten: HARF_SIRASI.slice(0, 5), son: HARF_SIRASI[5], adimlar: { [HARF_SIRASI[5]]: 1 } },
    'minkino-hece-evleri-v1-yas-4': { biten: heceVerisi.unsuzler.slice(0, 2) },
  });
  const v = page.locator('.hv-veli');
  // Harfler raftaki sırayla, beş ses grubunda.
  await expect(v.locator('.hv-harfler li')).toHaveText(HARF_SIRASI.map(harf));
  await expect(v.locator('.hv-grup')).toHaveCount(SES_GRUPLARI.length);
  for (const [g, grup] of SES_GRUPLARI.entries()) await expect(v.locator('.hv-grup').nth(g).locator('li')).toHaveText(grup.map(harf));
  await expect(v.locator('.hv-harfler li[data-durum="ogrendi"]')).toHaveText(HARF_SIRASI.slice(0, 5).map(harf));
  await expect(v.locator('.hv-harfler li[data-durum="yarim"]')).toHaveText(harf(HARF_SIRASI[5]));
  await expect(v.locator('.hv-harf-kart')).toContainText('MEB 1. sınıf ses grupları sırasıyla');
  // Hece Evleri anahtarları da okul sırasında.
  await expect(v.locator('.hv-anahtarlar li')).toHaveText(heceVerisi.unsuzler.map(unsuz));
  await expect(v.locator('.hv-anahtarlar li[data-alindi="true"]')).toHaveText(heceVerisi.unsuzler.slice(0, 2).map(unsuz));
  await expect(v.locator('.hv-kutu[data-ad="harf"] strong')).toHaveText('5/29');
  // Bugün Evde: en son öğrendiği harf (sıranın beşincisi).
  await expect(v.locator('.hv-bugun h2')).toHaveText(`“${harf(HARF_SIRASI[4])}” harfini öğrendi`);
  await expect(v.locator('.hv-oneriler')).not.toContainText('harfini öğrendi');
});

test('dolu kayıt: hepsi öğrenildi, tekrar kaydı görünür; geri düğmesi ≥44 px, taşma yok', async ({ page }) => {
  await ac(page, { yas: 5 }, {
    'minkino-alfabe-v1': { biten: ids(29), son: '29' },
    'minkino-hece-evleri-v1': { biten: 'lknmtyrdsbzçgşcphvfj'.split('') },
    'minkino-cumle-okuma-v1': { okunan: ['c1', 'c2'] },
    'minkino-alfabe-gunluk-v1': { gunler: {}, yanlis: { '09': 2 } },
  });
  const v = page.locator('.hv-veli');
  await expect(v.locator('.hv-harfler li[data-durum="ogrendi"]')).toHaveCount(29);
  await expect(v.locator('.hv-beceri[data-id="harf"] .hv-cip')).toHaveText('Tamamladı');
  await expect(v.locator('.hv-zor-harfler li')).toHaveText(['Ğ']);
  await expect(v.locator('.hv-hafta li')).toHaveCount(7);
  await expect(v.locator('.hv-zor')).toContainText('Son 7 günde Türkçe dersine girmedi.');
  const geri = page.getByRole('button', { name: 'Derse dön' });
  const kutu = (await geri.boundingBox())!;
  expect(Math.min(kutu.width, kutu.height)).toBeGreaterThanOrEqual(44);
  expect(await v.evaluate((e) => e.scrollWidth - e.clientWidth)).toBeLessThanOrEqual(0);
  const genislik = page.viewportSize()!.width;
  for (const r of await v.locator('.hv-kart, .hv-kutu').evaluateAll((l) => l.map((e) => e.getBoundingClientRect().toJSON()))) {
    expect(r.left).toBeGreaterThanOrEqual(0);
    expect(r.right).toBeLessThanOrEqual(genislik);
  }
  await geri.click();
  await expect(page.locator('.hv-veli')).toHaveCount(0);
  expect(await page.locator('#atolye').evaluate((e) => (e as HTMLElement).inert)).toBe(false);
});

test('2–3 yaş: cümle okuma yok, Esc kapatır', async ({ page }) => {
  await ac(page, { yas: 3 }, { 'minkino-alfabe-v1-yas-2-3': { biten: [HARF_SIRASI[0]], son: HARF_SIRASI[0] } });
  const v = page.locator('.hv-veli');
  await expect(v).toHaveAttribute('data-grup', '2-3');
  await expect(v.locator('.hv-beceri[data-id="cumle"]')).toHaveCount(0);
  // 2–3 yaşta grup adları yok, yalnız beş satır.
  await expect(v.locator('.hv-grup-adi')).toHaveCount(0);
  await expect(v.locator('.hv-grup')).toHaveCount(5);
  await expect(v.locator('.hv-oneriler li').first()).toContainText(`“${harf(HARF_SIRASI[0])}” harfini boyadı`);
  await page.keyboard.press('Escape');
  await expect(page.locator('.hv-veli')).toHaveCount(0);
});
