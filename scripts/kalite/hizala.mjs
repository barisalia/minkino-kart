// Genişletilmiş (outpaint) sahnede asıl resmin nerede durduğunu bulur ve istenirse asıl resmi (büyütülmüş hâlini)
// tam o yere yumuşak kenarla yapıştırır; böylece orta kısım asılla birebir aynı kalır.
// Kullanım:
//   node scripts/kalite/hizala.mjs bul <genis.png> <asil.webp>
//       → ölçek ve kaydırma (geniş resmin piksel biriminde): x y w h, hata
//   node scripts/kalite/hizala.mjs yapistir <genis.png> <asil-buyuk.webp> <x> <y> <w> <h> <cikti.png> [kenar=0.04]
import { createRequire } from 'node:module';
import path from 'node:path';

const gerek = createRequire(path.join(process.env.NODE_PATH || process.cwd(), 'x.js'));
let sharp;
try { sharp = createRequire(import.meta.url)('sharp'); } catch { sharp = gerek('./sharp'); }

const [, , komut, ...a] = process.argv;

async function gri(girdi, w, h) {
  return sharp(girdi).removeAlpha().resize(w, h, { fit: 'fill' }).greyscale().raw().toBuffer();
}

async function bul(genis, asil) {
  const mg = await sharp(genis).metadata();
  const ma = await sharp(asil).metadata();
  // kaba arama küçük ölçekte: geniş resim 400 px yükseklik
  const k = 400 / mg.height;
  const GW = Math.round(mg.width * k), GH = 400;
  const G = await gri(genis, GW, GH);
  let en = { hata: Infinity };
  const oran = ma.width / ma.height;
  for (let h = Math.round(GH * 0.85); h <= GH; h += 1) {
    const w = Math.round(h * oran);
    const A = await gri(asil, w, h);
    for (let y = 0; y + h <= GH; y += 1) {
      for (let x = Math.max(0, Math.round((GW - w) / 2) - 40); x + w <= GW && x <= (GW - w) / 2 + 40; x += 1) {
        let s = 0, n = 0;
        for (let yy = 0; yy < h; yy += 4) for (let xx = 0; xx < w; xx += 4) {
          const d = G[(y + yy) * GW + x + xx] - A[yy * w + xx]; s += d * d; n++;
        }
        const e = s / n;
        if (e < en.hata) en = { hata: e, x, y, w, h };
      }
    }
  }
  const t = 1 / k;
  console.log(JSON.stringify({ x: Math.round(en.x * t), y: Math.round(en.y * t), w: Math.round(en.w * t), h: Math.round(en.h * t), hata: Math.round(en.hata), genis: [mg.width, mg.height] }));
}

async function yapistir(genis, asil, x, y, w, h, cikti, kenar = 0.04) {
  [x, y, w, h] = [x, y, w, h].map(Number);
  const mg = await sharp(genis).metadata();
  const parca = await sharp(asil).removeAlpha().resize(w, h, { fit: 'fill', kernel: 'lanczos3' }).raw().toBuffer();
  // yumuşak maske: yalnız sol ve sağ kenarda (geniş resimle birleşen yer) kenar*w genişlikte geçiş
  const kw = Math.max(2, Math.round(Number(kenar) * w));
  const maske = Buffer.alloc(w * h);
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
    const d = Math.min(xx, w - 1 - xx);
    const t = Math.min(1, d / kw);
    maske[yy * w + xx] = Math.round(255 * (t * t * (3 - 2 * t)));
  }
  const rgba = await sharp(parca, { raw: { width: w, height: h, channels: 3 } })
    .joinChannel(maske, { raw: { width: w, height: h, channels: 1 } }).png().toBuffer();
  await sharp(genis).removeAlpha().composite([{ input: rgba, left: x, top: y }]).png().toFile(cikti);
  console.log('yazildi', cikti, mg.width + 'x' + mg.height);
}

if (komut === 'bul') await bul(a[0], a[1]);
else if (komut === 'yapistir') await yapistir(...a);
else console.log('komut: bul | yapistir');
