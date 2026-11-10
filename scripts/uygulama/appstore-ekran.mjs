// App Store ekran görüntüleri (yatay): iPhone 6.3" 2622x1206 ve iPad 13" 2752x2064. Geliştirme sunucusu açık olmalı (5173).
import { chromium } from 'playwright';
const KOK = 'http://localhost:5173/';
const cihazlar = { iphone: { width: 874, height: 402, olcek: 3 }, ipad: { width: 1376, height: 1032, olcek: 2 } };
const t = await chromium.launch({ channel: 'msedge' });
for (const [ad, c] of Object.entries(cihazlar)) {
  const b = await t.newContext({ viewport: { width: c.width, height: c.height }, deviceScaleFactor: c.olcek });
  const s = await b.newPage();
  const cek = async (n) => { await s.waitForTimeout(1200); await s.screenshot({ path: `ekip/uygulama/appstore-ekran/${ad}-${n}.png` }); };
  await s.goto(KOK); await s.waitForTimeout(3500);
  await s.locator('.ym-yas-kart').nth(1).click().catch(() => {});
  await s.waitForTimeout(600); await cek('1-menu');
  for (const [n, bolum] of [['2-oyunlar', 'Oyunlar'], ['3-etkinlikler', 'Etkinlikler'], ['4-kitaplar', 'Kitaplar'], ['5-filmler', 'Çizgi Filmler']]) {
    await s.locator(`.ym-ana [aria-label="${bolum}"], .ym-yan [aria-label="${bolum}"]`).first().click();
    await cek(n);
  }
  await b.close();
}
await t.close();
