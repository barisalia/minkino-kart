// Parçanın sol (x<1024) ve sağ yarısını kendi alt-orta noktası çevresinde ölçekler (botlar ayağı tam örtsün).
// node ekip/giysin/olcekle.cjs <ad> <yeni-ad> <sx> <sy> [dy]
const sharp = require('sharp');
const fs = require('fs');
(async () => {
  const [, , ad, yeni, sxT, syT, dyT] = process.argv;
  const sx = +sxT, sy = +syT, dy = +(dyT || 0);
  const b = require(process.cwd() + `/ekip/giysin/parca/${ad}.json`);
  const { data, info } = await sharp(`ekip/giysin/parca/${ad}.png`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const yari = 1024 - b.x;
  const katman = [];
  const pay = 200;
  const T = { w: W + pay * 2, h: H + pay * 2 };
  for (const [x0, x1] of [[0, yari], [yari, W]]) {
    if (x1 <= x0) continue;
    const parca = await sharp(data, { raw: { width: W, height: H, channels: 4 } }).extract({ left: x0, top: 0, width: x1 - x0, height: H }).png().toBuffer();
    const nw = Math.round((x1 - x0) * sx), nh = Math.round(H * sy);
    const buyuk = await sharp(parca).resize(nw, nh, { fit: 'fill', kernel: 'lanczos3' }).png().toBuffer();
    const cx = (x0 + x1) / 2;
    katman.push({ input: buyuk, left: Math.round(pay + cx - nw / 2), top: Math.round(pay + H - nh + dy) });
  }
  const tuval = await sharp({ create: { width: T.w, height: T.h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite(katman).png().toBuffer();
  const kirp = await sharp(tuval).trim({ threshold: 1 }).png().toBuffer({ resolveWithObject: true });
  const o = kirp.info;
  fs.writeFileSync(`ekip/giysin/parca/${yeni}.png`, kirp.data);
  const j = { x: b.x - pay - (o.trimOffsetLeft ?? 0) * 1, y: b.y - pay - (o.trimOffsetTop ?? 0) * 1, w: o.width, h: o.height };
  fs.writeFileSync(`ekip/giysin/parca/${yeni}.json`, JSON.stringify(j));
  console.log(j, o);
})();
