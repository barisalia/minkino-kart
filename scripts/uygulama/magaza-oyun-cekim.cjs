const { chromium } = require(require.resolve('playwright', { paths: [process.cwd()] }));
const [out, tur, ...yalniz] = process.argv.slice(2);
const cihaz = tur === 'ipad' ? { viewport: { width: 1366, height: 1024 }, deviceScaleFactor: 2 } : tur === 'ipadharf' ? { viewport: { width: 1024, height: 768 }, deviceScaleFactor: 2732/1024 } : tur === 'iphone63' ? { viewport: { width: 874, height: 402 }, deviceScaleFactor: 3 } : tur === 'play' ? { viewport: { width: 960, height: 540 }, deviceScaleFactor: 2 } : tur === 'iphone69' ? { viewport: { width: 956, height: 440 }, deviceScaleFactor: 3 } : { viewport: { width: 896, height: 414 }, deviceScaleFactor: 3 };
const T = 'http://localhost:5173/', L = { waitUntil: 'load', timeout: 90000 };
const git = async (p, u, ms = 3500) => { await p.goto(T + u, L); await p.waitForTimeout(ms); };
const S = {
  '1-sen-sec': async p => { await git(p, 'kino-ile-sen-sec/oynat.htm?bolum=bir-gun', 6000); const f = p.frameLocator('#kino-film'); await f.getByText('Başla').click(); await p.waitForTimeout(3000);
    await f.getByText('Karara geç').click(); await p.waitForTimeout(2500); await f.getByText('Trenle oyna').click(); await p.waitForTimeout(6000); await f.getByText('Karara geç').click(); await p.waitForTimeout(3500); },
  '2-sef-restoran': async p => { await git(p, 'sef/?test=1', 1500);
    await p.evaluate(() => { const id = 'aile-kahvaltisi'; const omletServisi = { evre: 'sun', yumurta: 2, cirpma: 1, sure: 6000, icler: [{ tur: 'peynir', x: 30, y: 44 }, { tur: 'domates', x: 35, y: 60 }] };
      localStorage.setItem('minkino-sef-v1', JSON.stringify({ sessiz: true, tepsiler: { restoranda: true, ekran: 'masa', secili: id, restoran: { sira: 7, menuId: id, evre: 'mutfak' }, masalar: { [id]: { aileMasada: true, aileServisi: [], sunuldu: false, tabaklar: { omlet: true, icecek: true }, omletServisi, omletPuan: 3, icecekMeyvesi: 'limon', icecekPuani: 3, icecekMiktari: 3, adim: { tavuk: 0, icecek: 5 } } } } })); });
    await p.reload(L); await p.waitForTimeout(3500); },
  '3-okul-sinif': async p => git(p, 'hazirlik/?test=1&ders=sinif', 4500),
  '4-pati': async p => { await git(p, 'pati-yeni/?test=1', 3000); await p.locator('[aria-label="Fındık, bakıma git"]').evaluate(e => e.click()); await p.waitForTimeout(3000); },
  '5-harf': async p => { await git(p, 'alfabe/?test=1', 3500);
    await p.evaluate(async () => { const H = innerHeight; for (let z = 1; z > 0.3; z -= 0.02) { document.documentElement.style.zoom = z; await new Promise(r => setTimeout(r, 60)); const alt = Math.max(...[...document.body.querySelectorAll('*')].map(e => e.getBoundingClientRect().bottom)); if (alt * z <= H - 4 || alt <= H - 4) break; } scrollTo(0, 0); });
    await p.waitForTimeout(1500); },
  '6-kitap': async p => { await git(p, 'kitap/?test=1', 2000); await p.getByText('Kino Doktora Gidiyor').click(); await p.waitForTimeout(2500); await p.getByText('Kendim bakayım').click(); await p.waitForTimeout(4000); },
  '7-sef-mutfak': async p => { await git(p, 'sef/?test=1', 3000); await p.getByText('Sebze çorbası').click(); await p.waitForTimeout(4000); },
  '8-okul-kres': async p => git(p, 'hazirlik/?test=1&ders=kres', 9000),
};
(async () => {
  const b = await chromium.launch({ channel: 'chrome' });
  for (const [ad, fn] of Object.entries(S)) {
    if (yalniz.length && !yalniz.includes(ad)) continue;
    for (let d = 0; d < 2; d++) {
      const c = await b.newContext({ ...cihaz, hasTouch: true }); const p = await c.newPage();
      try { await fn(p); await p.screenshot({ path: `${out}/${tur}-${ad}.png` }); console.log('ok', ad); await c.close(); break; }
      catch (e) { console.log('hata', ad, e.message.split('\n')[0]); await c.close(); }
    }
  }
  await b.close();
})();
