// Eşya görsellerini (şeffaf webp/png) Turntable girdisi yapar: ekip/adobe-yanci/girdi/turntable/<ad>-on.png (şeffaf) + -on-beyaz.png, 1024 kare, %88 kadraj
// node turntable-girdi-esya.cjs <ad=yol> ...   (yol: webp/png; beyaz zeminli ise BEYAZ=1)
const path = require('path'); const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const out = 'ekip/adobe-yanci/girdi/turntable';
(async () => { for (const c of process.argv.slice(2)) { const [ad, yol] = c.split('=');
  let img = s(yol).ensureAlpha(); const kirp = await img.trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = kirp.info, k = Math.round(1024 * 0.88) / Math.max(w, h);
  const ic = await s(kirp.data).resize(Math.round(w * k), Math.round(h * k)).toBuffer(); const m = await s(ic).metadata(), sol = Math.round((1024 - m.width) / 2), ust = Math.round((1024 - m.height) / 2);
  await s({ create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([{ input: ic, left: sol, top: ust }]).png().toFile(path.join(out, `${ad}-on.png`));
  await s({ create: { width: 1024, height: 1024, channels: 4, background: '#ffffff' } }).composite([{ input: ic, left: sol, top: ust }]).flatten({ background: '#ffffff' }).png().toFile(path.join(out, `${ad}-on-beyaz.png`));
  console.log(ad, w, h); } })();
