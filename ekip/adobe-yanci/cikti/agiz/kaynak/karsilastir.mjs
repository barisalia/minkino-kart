// Her PNG'yi karakterin üstüne (agiz gizli) bindirip yüz yakın planı → karsilastirma.png (2 satır × 6 sütun)
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const req = createRequire('C:/Users/Minkex/Desktop/Minkino Games/package.json'); const { chromium } = req('playwright'); const sharp = req('sharp');
const ROOT = 'C:/Users/Minkex/Desktop/Minkino Games'; const OUT = `${ROOT}/ekip/adobe-yanci/cikti/agiz`; const TMP = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\//, '')), 'bilesik'); fs.mkdirSync(TMP, { recursive: true });
const ADLAR = ['agiz-kapali', 'agiz-az', 'agiz-orta', 'agiz-yuvarlak', 'agiz-dis', 'agiz-gulumse'];
const KAR = { mino: { svg: `${ROOT}/ekip/mino/mino-final.svg`, hide: ['agiz'], crop: { x: 824, y: 860, width: 400, height: 300 } }, kino: { svg: `${ROOT}/ekip/kino/kino-final.svg`, hide: ['agiz', 'dil'], crop: { x: 715, y: 800, width: 400, height: 300 } } };
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 2048, height: 2048 } });
const cells = [];
for (const [kar, k] of Object.entries(KAR)) {
  const svg = fs.readFileSync(k.svg, 'utf8');
  for (const ad of ADLAR) {
    const png = fs.readFileSync(`${OUT}/${kar}/${ad}.png`).toString('base64');
    const html = `<html><body style="margin:0;background:#fff"><div style="position:relative;width:2048px;height:2048px">${svg}<img src="data:image/png;base64,${png}" style="position:absolute;left:0;top:0;width:2048px;height:2048px"></div></body></html>`;
    await pg.setContent(html); await pg.evaluate((ids) => { for (const id of ids) document.getElementById(id)?.setAttribute('display', 'none'); }, k.hide); await pg.waitForTimeout(150);
    const f = path.join(TMP, `${kar}-${ad}.png`); await pg.screenshot({ path: f, clip: k.crop }); cells.push({ f, ad: `${kar} · ${ad.replace('agiz-', '')}` });
  }
}
await b.close();
const w = 400, h = 300, cap = 34, pad = 6, cols = 6; let caps = ''; const comp = cells.map((c, i) => { const x = (i % cols) * (w + pad), y = Math.floor(i / cols) * (h + cap + pad); caps += `<text x="${x + 8}" y="${y + h + 25}" font-family="Arial" font-size="22" fill="#222">${c.ad}</text>`; return { input: c.f, left: x, top: y }; });
const W = cols * (w + pad), H = 2 * (h + cap + pad); comp.push({ input: Buffer.from(`<svg width="${W}" height="${H}">${caps}</svg>`), left: 0, top: 0 });
await sharp({ create: { width: W, height: H, channels: 4, background: '#e6e6e6' } }).composite(comp).png().toFile(`${OUT}/karsilastirma.png`); console.log('ok', `${OUT}/karsilastirma.png`);
