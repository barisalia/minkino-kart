// Kino ana çiziminde ve bir parçada alfa sınırları (sol/sağ yarı ayrı): node ekip/giysin/olc.cjs [parca]
const sharp = require('sharp');
async function sinir(yol, ox = 0, oy = 0, y0 = 0) {
  const { data, info } = await sharp(yol).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const r = { sol: [1e9, 1e9, -1, -1], sag: [1e9, 1e9, -1, -1] };
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] < 128) continue;
    const X = x + ox, Y = y + oy;
    if (Y < y0) continue;
    const k = r[X < 1024 ? 'sol' : 'sag'];
    k[0] = Math.min(k[0], X); k[1] = Math.min(k[1], Y); k[2] = Math.max(k[2], X); k[3] = Math.max(k[3], Y);
  }
  return r;
}
(async () => {
  const p = process.argv[2];
  console.log('kino ayak (y>1650)', await sinir('ekip/kino/kino-final.png', 0, 0, 1650));
  if (p) {
    const b = require(process.cwd() + `/ekip/giysin/parca/${p}.json`);
    console.log(p, await sinir(`ekip/giysin/parca/${p}.png`, b.x, b.y));
  }
})();
