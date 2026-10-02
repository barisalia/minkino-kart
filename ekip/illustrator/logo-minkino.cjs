// Ana menüdeki "minkino" logosu (uygulama/src/ekranlar.ts LOGO_RENK + uygulama.css .logo-yazi) → şeffaf PNG: assets/uygulama/logo-minkino.png
// Yedi renkli harf, kahverengi kontur (#5a3617) ve alta kaymış gölge. Yazı tipi uygulamayla aynı yığın: Fredoka, ui-rounded, 'Arial Rounded MT Bold', system-ui
// (bu makinede Fredoka yoksa Arial Rounded MT Bold kullanılır). node logo-minkino.cjs [yükseklik px=480] [çıktı]
const fs = require('fs'), path = require('path');
const { chromium } = require(require.resolve('playwright', { paths: [process.cwd()] }));
const sharp = require(require.resolve('sharp', { paths: [process.cwd()] }));
const RENK = ['#F0413F', '#FF8A2B', '#FFC72C', '#5DBE3F', '#3E9DF2', '#9B5CE0', '#FF7EB6'], KONTUR = '#5a3617';
const boy = +(process.argv[2] || 480), cikti = process.argv[3] || 'assets/uygulama/logo-minkino.png';
(async () => {
  const fs_ = Math.round(boy * 0.62), kont = Math.round(fs_ * 0.1), golge = Math.round(fs_ * 0.075), kenar = kont * 2 + golge + 8;
  const harfler = [...'minkino'].map((c, i) => `<span style="color:${RENK[i]}">${c}</span>`).join('');
  const html = `<body style="margin:0;background:transparent"><div id="l" style="display:inline-flex;padding:${kenar}px;font:700 ${fs_}px 'Fredoka',ui-rounded,'Arial Rounded MT Bold',system-ui,sans-serif;line-height:1;letter-spacing:-0.01em">${harfler}</div><style>#l span{display:inline-block;-webkit-text-stroke:${kont}px ${KONTUR};text-shadow:0 ${golge}px 0 ${KONTUR};paint-order:stroke fill}</style>`;
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 3000, height: 900 } }); await p.setContent(html); await p.waitForTimeout(500);
  const kutu = await (await p.$('#l')).boundingBox(); const tmp = cikti + '.tmp.png';
  fs.mkdirSync(path.dirname(cikti), { recursive: true });
  await p.screenshot({ path: tmp, omitBackground: true, clip: kutu }); await b.close();
  const kes = await sharp(tmp).trim({ threshold: 4 }).toBuffer({ resolveWithObject: true }); fs.unlinkSync(tmp);
  await sharp(kes.data).extend({ top: 12, bottom: 12, left: 12, right: 12, background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(cikti);
  const m = await sharp(cikti).metadata(); console.log('logo', m.width, m.height);
})();
