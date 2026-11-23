import { test, expect, type Page } from '@playwright/test';

// Deneyler menüde ve tamamen premium (Barış 23 Kasım 2026: "tamamlayın, kilitli bir şekilde açın"; deney/src/bayrak.ts,
// src/engine/erisim.ts, deney/src/giris.ts). Uygulama taklidiyle (?uygulama=ios): abone olmayan çocuk menüde kilit rozetini
// görür, sayfaya doğrudan gelirse kilit anı açılır ve parkur kurulmaz; abone çocukta rozet yok, parkur açılır.
test.describe.configure({ timeout: 90000 });

const abone = (p: Page, premium: boolean) => p.addInitScript((pr) => {
  localStorage.setItem('minkino-menu-yas', '4–5 yaş');
  if (pr) localStorage.setItem('minkino-abonelik-v1', JSON.stringify({ premium: true, zaman: Date.now() }));
  else localStorage.removeItem('minkino-abonelik-v1');
}, premium);
const rozet = (p: Page, id: string) => p.locator(`.ym-icerik-kap:has(.ym-icerik[data-oyun="${id}"]) .ym-kilit .mk-kilit`);
async function etkinlikler(p: Page) {
  await p.goto('/?test=1&uygulama=ios');
  await p.getByRole('button', { name: 'Etkinlikler', exact: true }).click();
  await expect(p.locator('.ym-icerik[data-oyun="deney"]')).toBeVisible({ timeout: 15000 });
}

test('abone olmayan: menüde Deneyler kartı kapağıyla ve Doktor\'daki gibi kilit rozetiyle; sayfada kilit anı, parkur kurulmaz', async ({ page: p }) => {
  await abone(p, false);
  await etkinlikler(p);
  // Kapak (yazılı yedek başlık yok) ve kilit rozeti
  await expect(p.locator('.ym-icerik[data-oyun="deney"] img')).toHaveCount(1);
  await expect(p.locator('.ym-icerik[data-oyun="deney"] .ym-baslik')).toHaveCount(0);
  await expect(rozet(p, 'deney')).toHaveCount(1);
  await expect(p.locator('.ym-icerik[data-oyun="deney"]')).toHaveAttribute('data-kilitli', '');
  // Karta dokununca sayfaya gidilmez, kilit anı açılır
  await p.locator('.ym-icerik[data-oyun="deney"]').click();
  await expect(p.getByRole('button', { name: 'Büyükler için', exact: true })).toBeVisible({ timeout: 10000 });
  await expect(p).not.toHaveURL(/deney/);
  // Sayfaya doğrudan gelinirse de kilit
  await p.goto('/deney/?test=1&uygulama=ios');
  await expect(p.getByRole('button', { name: 'Büyükler için', exact: true })).toBeVisible({ timeout: 15000 });
  await expect(p.locator('body')).toHaveAttribute('data-durum', 'kilitli');
  await expect(p.locator('.pk-nav')).toHaveCount(0);
});

// Menüde sahte mağaza açılışta durumu tazeler (abone kaydı sıfırlanır; doktor-kilit.spec.ts'teki gibi): abone durumu sayfaya
// doğrudan gelerek sınanır.
test('abone: uygulamada Deneyler kilit sormadan açılır ve parkur kurulur', async ({ page: p }) => {
  await abone(p, true);
  await p.goto('/deney/?test=1&uygulama=ios');
  await expect(p.locator('.pk-nav.pk-ev')).toBeVisible({ timeout: 20000 });
  await expect(p.locator('body')).not.toHaveAttribute('data-durum', 'kilitli');
  await expect(p.getByRole('button', { name: 'Büyükler için', exact: true })).toHaveCount(0);
});

test('web sitesinde (uygulama değil) kilit yok: kart rozetsiz, sayfa açılır', async ({ page: p }) => {
  await abone(p, false);
  await p.goto('/?test=1');
  await p.getByRole('button', { name: 'Etkinlikler', exact: true }).click();
  await expect(p.locator('.ym-icerik[data-oyun="deney"]')).toBeVisible({ timeout: 15000 });
  await expect(rozet(p, 'deney')).toHaveCount(0);
  await p.goto('/deney/?test=1');
  await expect(p.locator('.pk-nav.pk-ev')).toBeVisible({ timeout: 20000 });
});
