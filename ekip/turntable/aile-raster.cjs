// Aile Turntable kaynakları (iç içe SVG + clipPath) → düz raster: Dönen tabla iç içe SVG'yi kötü okuyor, Kino C'deki gibi önce raster, sonra Illustrator izi.
// node ekip/turntable/aile-raster.cjs [ad ...]  → ekip/turntable/<ad>/<ad>-tt-raster.png (beyaz zemin, uzun kenar 2048) + <ad>-tt-maske.txt (4 px ızgara, '1' = zemin)
const fs = require('fs'), path = require('path');
const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const UZUN = 2048, IZGARA = 4;
const adlar = process.argv.slice(2).length ? process.argv.slice(2) : ['anne', 'baba', 'lokum', 'babaanne', 'dede'];
(async () => {
  for (const ad of adlar) {
    const kl = path.join(__dirname, ad), svg = path.join(kl, ad + '-tt.svg');
    const m = await s(svg).metadata(), k = UZUN / Math.max(m.width, m.height);
    const seffaf = await s(svg, { density: 72 * k }).png().toBuffer();
    const { data, info } = await s(seffaf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const MW = Math.ceil(info.width / IZGARA), MH = Math.ceil(info.height / IZGARA); let maske = '';
    for (let i = 0; i < MH; i++) for (let j = 0; j < MW; j++) { const x = Math.min(info.width - 1, j * IZGARA + 2), y = Math.min(info.height - 1, i * IZGARA + 2); maske += data[(y * info.width + x) * 4 + 3] < 20 ? '1' : '0'; }
    await s(seffaf).flatten({ background: '#ffffff' }).png().toFile(path.join(kl, ad + '-tt-raster.png'));
    fs.writeFileSync(path.join(kl, ad + '-tt-maske.txt'), [info.width, info.height, MW, MH, IZGARA].join(',') + '\n' + maske);
    console.log(ad, info.width + 'x' + info.height);
  }
})();
