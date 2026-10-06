// Kış eldivenleri (Gemini kis-eldiven-momo-1/2, başparmaklı): beyaz zemin silinir, ters çevrilip (bilek yukarı)
// Kino'nun patilerine oturtulur. Ayarlar: [x, y, en, açı] iskelet tuvalinde (2048). node ekip/giysin/eldiven-momo.cjs
const sharp = require('sharp');
const fs = require('fs');
const YER = {
  // sol pati (ekranın solu): başparmak gövdeye (sağa) baksın
  'eldiven-sol': { kaynak: 'kis-eldiven-momo-2.png', x: 618, y: 1415, en: 210, aci: 180 },
  'eldiven-sag': { kaynak: 'kis-eldiven-momo-1.png', x: 1186, y: 1400, en: 228, aci: 172 },
};
(async () => {
  const yer = JSON.parse(fs.readFileSync('giysin/src/giysi-yer.json', 'utf8'));
  for (const [ad, a] of Object.entries(YER)) {
    const { data, info } = await sharp('ekip/giysin/ham/' + a.kaynak).flatten({ background: '#fff' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const W = info.width, H = info.height;
    // kenardan taşan beyaz zemin
    const zemin = new Uint8Array(W * H);
    const st = [];
    for (let i = 0; i < W; i++) st.push(i, (H - 1) * W + i);
    for (let i = 0; i < H; i++) st.push(i * W, i * W + W - 1);
    const beyaz = (j) => data[j * 3] > 236 && data[j * 3 + 1] > 236 && data[j * 3 + 2] > 236;
    while (st.length) {
      const j = st.pop();
      if (zemin[j] || !beyaz(j)) continue;
      zemin[j] = 1;
      const x = j % W;
      if (x > 0) st.push(j - 1);
      if (x < W - 1) st.push(j + 1);
      if (j >= W) st.push(j - W);
      if (j < W * (H - 1)) st.push(j + W);
    }
    // 1 px içeri + yumuşak kenar (hale yok)
    const m = new Uint8Array(W * H);
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      m[i] = !zemin[i] && !zemin[i - 1] && !zemin[i + 1] && !zemin[i - W] && !zemin[i + W] ? 1 : 0;
    }
    const rgba = Buffer.alloc(W * H * 4);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x;
      let t = 0, n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const X = x + dx, Y = y + dy;
        if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
        t += m[Y * W + X];
        n++;
      }
      rgba[i * 4] = data[i * 3];
      rgba[i * 4 + 1] = data[i * 3 + 1];
      rgba[i * 4 + 2] = data[i * 3 + 2];
      rgba[i * 4 + 3] = Math.round((255 * t) / n);
    }
    const kirp = await sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
    const k2 = await sharp(kirp).trim({ threshold: 1 }).png().toBuffer();
    const don = await sharp(k2).rotate(a.aci, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).resize({ width: a.en }).png().toBuffer({ resolveWithObject: true });
    const son = await sharp(don.data).trim({ threshold: 1 }).png().toBuffer({ resolveWithObject: true });
    fs.writeFileSync(`ekip/giysin/parca/${ad}.png`, son.data);
    await sharp(son.data).webp({ quality: 86, alphaQuality: 100 }).toFile(`assets/giysin/giysi/${ad}.webp`);
    yer[ad] = [a.x, a.y, son.info.width, son.info.height];
    fs.writeFileSync(`ekip/giysin/parca/${ad}.json`, JSON.stringify({ x: a.x, y: a.y, w: son.info.width, h: son.info.height }));
  }
  fs.writeFileSync('giysin/src/giysi-yer.json', JSON.stringify(yer, null, 1) + '\n');
  console.log(yer['eldiven-sol'], yer['eldiven-sag']);
})();
