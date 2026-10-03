// node kirp.cjs <png> <x0> <y0> <w> <h> <olcek> <out>  -> ızgaralı (20 px) büyütme
const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const [, , png, x0, y0, w, h, k, out] = process.argv; const X = +x0, Y = +y0, W = +w, H = +h, K = +k;
(async () => { let g = ''; for (let x = Math.ceil(X / 20) * 20; x < X + W; x += 20) g += `<line x1="${(x - X) * K}" y1="0" x2="${(x - X) * K}" y2="${H * K}" stroke="${x % 100 ? '#0af' : '#f0a'}" stroke-width="${x % 100 ? 1 : 2}" opacity="0.55"/>${x % 100 === 0 || (x % 40 === 0) ? `<text x="${(x - X) * K + 3}" y="14" font-size="14" fill="#c00">${x}</text>` : ''}`;
  for (let y = Math.ceil(Y / 20) * 20; y < Y + H; y += 20) g += `<line x1="0" y1="${(y - Y) * K}" x2="${W * K}" y2="${(y - Y) * K}" stroke="${y % 100 ? '#0af' : '#f0a'}" stroke-width="${y % 100 ? 1 : 2}" opacity="0.55"/>${y % 100 === 0 || y % 40 === 0 ? `<text x="3" y="${(y - Y) * K - 3}" font-size="14" fill="#c00">${y}</text>` : ''}`;
  const base = await s(png).extract({ left: X, top: Y, width: W, height: H }).flatten({ background: '#CFE6FA' }).resize({ width: W * K, kernel: 'lanczos3' }).png().toBuffer();
  await s(base).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W * K}" height="${H * K}">${g}</svg>`) }]).png().toFile(out); })();
