// Geliştirme aracı: oyunun karelerini çeker (gerçek hızda), konsol hatalarını yazar.
// node ekip/giysin/cek.cjs <adres-sorgu> <en>x<boy> <cikti-oneki> <ms1,ms2,...> [tikla:secici@ms ...]
const { chromium } = require('playwright');
(async () => {
  const [, , sorgu, boyut, onek, zamanlar, ...islem] = process.argv;
  const [w, hh] = boyut.split('x').map(Number);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: w, height: hh }, deviceScaleFactor: 1, hasTouch: false });
  p.on('console', (m) => m.type() === 'error' && console.log('KONSOL:', m.text()));
  p.on('pageerror', (e) => console.log('HATA:', e.message));
  await p.goto(`http://localhost:4325/giysin/index.html?${sorgu}`, { timeout: 120000 });
  const t0 = Date.now();
  const olaylar = [
    ...zamanlar.split(',').filter(Boolean).map((z) => ({ t: +z, f: async () => { await p.screenshot({ path: `tests/screens/${onek}-${z}.png` }); console.log(z, await p.evaluate(() => document.querySelector('.gy-ekran')?.dataset.adim)); } })),
    ...islem.map((s) => {
      const [tur, geri] = s.split(':');
      const [sec, z] = geri.split('@');
      return {
        t: +z,
        f: async () => {
          if (tur === 'tikla') await p.locator(sec).first().click({ force: true }).catch((e) => console.log('tik', e.message));
          if (tur === 'surukle') {
            const [kaynak, hedef] = sec.split('>');
            const a = await p.locator(kaynak).first().boundingBox();
            const [hx, hy] = hedef.split(',').map(Number);
            const k = await p.locator('.gy-kino').first().boundingBox();
            const tx = k.x + (hx / 2048) * k.width, ty = k.y + (hy / 2048) * k.height + 18;
            await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
            await p.mouse.down();
            for (let i = 1; i <= 12; i++) await p.mouse.move(a.x + a.width / 2 + ((tx - a.x - a.width / 2) * i) / 12, a.y + a.height / 2 + ((ty - a.y - a.height / 2) * i) / 12);
            await p.mouse.up();
          }
        },
      };
    }),
  ].sort((a, b) => a.t - b.t);
  for (const o of olaylar) {
    const kalan = o.t - (Date.now() - t0);
    if (kalan > 0) await new Promise((r) => setTimeout(r, kalan));
    await o.f();
  }
  await b.close();
})();
