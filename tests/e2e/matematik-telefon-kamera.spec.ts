import { test, expect, type Page } from '@playwright/test';

// Matematik · telefon kamerası (matematik/src/telefon-kamera.ts; Matematik denetimi 23 Kasım: "telefonda oyun alanı en az %60").
// Yatay telefonda sahne büyüyüp kayar: dokunulan parçalar ekranı doldurur, hiçbiri ekran dışında kalmaz, üst düğmeler köşede.
test.describe.configure({ timeout: 90000 });

async function ac(p: Page) {
  await p.addInitScript(() => {
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: 4, ayarlar: { muzik: false } }));
    localStorage.setItem('minkino-abonelik-v1', JSON.stringify({ premium: true, zaman: Date.now() }));
  });
  await p.goto('/matematik/');
  await expect(p.locator('.tezgah-oyuncak')).toHaveCount(4, { timeout: 30000 });
}
/** Seçilen öğelerin birleşik kutusunun ekran payı ve hepsi ekranda mı. */
const kutu = (p: Page, secici: string) => p.evaluate((s) => {
  const l = [...document.querySelectorAll(s)].map((e) => e.getBoundingClientRect()).filter((r) => r.width > 2);
  const k = l.reduce((a, r) => ({ l: Math.min(a.l, r.left), t: Math.min(a.t, r.top), r: Math.max(a.r, r.right), b: Math.max(a.b, r.bottom) }), { l: 1e9, t: 1e9, r: -1e9, b: -1e9 });
  return { pay: ((k.r - k.l) * (k.b - k.t)) / (innerWidth * innerHeight), ekranda: l.every((r) => r.left >= -1 && r.top >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1) };
}, secici);

test('telefonda tezgâh: dört oyuncak ve adları ekranın %60\'ından fazlasını kaplar, hiçbiri kırpılmaz; üst düğmeler köşede', async ({ page: p }, bilgi) => {
  test.skip(bilgi.project.name !== 'telefon-yatay', 'kamera yalnız yatay telefonda');
  await ac(p);
  await expect(p.locator('#sahne')).toHaveClass(/tk-acik/, { timeout: 5000 });
  await expect.poll(async () => (await kutu(p, '.tezgah-oyuncak, .oyuncak-adi')).pay, { timeout: 5000 }).toBeGreaterThan(0.6);
  expect((await kutu(p, '.tezgah-oyuncak, .oyuncak-adi')).ekranda).toBe(true);
  const ev = (await p.locator('.nav.ev').boundingBox())!;
  expect(ev.x).toBeGreaterThanOrEqual(0);
  expect(ev.y).toBeGreaterThanOrEqual(0);
  expect(ev.y).toBeLessThan(20);
  expect(Math.min(ev.width, ev.height)).toBeGreaterThanOrEqual(64);
  // Oyuncağa dokunulunca turu açılır; kamera yeni ekrana göre yeniden kurulur, düğmeler yine ekranda.
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
  await expect(p.locator('#sahne')).not.toHaveAttribute('data-ekran', 'menu', { timeout: 10000 });
  await p.waitForTimeout(1200);
  expect((await kutu(p, '#sahne button:not(.nav):not(.buyukler)')).ekranda).toBe(true);
});

test('iPad\'de kamera kapalı', async ({ page: p }, bilgi) => {
  test.skip(bilgi.project.name !== 'ipad-yatay', 'yalnız iPad');
  await ac(p);
  await p.waitForTimeout(800);
  await expect(p.locator('#sahne')).not.toHaveClass(/tk-acik/);
});
