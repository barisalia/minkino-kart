// Bot / çorap gibi kürk yakalı parçalarda yakanın üstünde kalan bacak parçalarını siler:
// her sütunda ilk beyaz kürk pikselinin `pay` px üstünden yukarısı şeffaf; kürk olmayan sütunlarda `varsayY`nin üstü.
// node ekip/giysin/kurk-ustu.cjs <ad> <pay> <varsayY(2048 koord.)>
const sharp = require('sharp');
const fs = require('fs');
(async () => {
  const [, , ad, payT, vyT] = process.argv;
  const pay = +payT, vy = +vyT;
  const b = require(process.cwd() + `/ekip/giysin/parca/${ad}.json`);
  const yol = `ekip/giysin/parca/${ad}.png`;
  const { data, info } = await sharp(yol).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const kurk = (i) => data[i * 4 + 3] > 200 && Math.min(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]) > 200 && data[i * 4 + 2] - data[i * 4] > -9;
  const ust = new Int32Array(W);
  for (let x = 0; x < W; x++) {
    let y0 = -1;
    for (let y = 0; y < H; y++) if (kurk(y * W + x)) { y0 = y; break; }
    ust[x] = y0 >= 0 ? y0 - pay : -99999;
  }
  // kürksüz sütun: 45 px içindeki en yakın kürk sütununun kesimi (yakanın konturlu ucu), yoksa varsayılan
  const ham = Int32Array.from(ust);
  for (let x = 0; x < W; x++) {
    if (ham[x] !== -99999) continue;
    let en = vy - b.y;
    for (let k = 1; k <= 45; k++) {
      const a = ham[x - k] ?? -99999, c = ham[x + k] ?? -99999;
      if (a !== -99999 || c !== -99999) { en = Math.max(a, c) === -99999 ? en : a !== -99999 && c !== -99999 ? Math.min(a, c) : a !== -99999 ? a : c; break; }
    }
    ust[x] = en;
  }
  // komşu sütunlarla yumuşat (kürk tepeleri dalgalı; kesik çizgi testere gibi olmasın)
  const yum = Int32Array.from(ust, (_, x) => {
    let m = Infinity;
    for (let k = -10; k <= 10; k++) if (x + k >= 0 && x + k < W) m = Math.min(m, ust[x + k]);
    return m;
  });
  for (let x = 0; x < W; x++) for (let y = 0; y < Math.max(0, yum[x]); y++) {
    const i = (y * W + x) * 4 + 3;
    const d = yum[x] - y;
    data[i] = d <= 2 ? Math.round(data[i] * (1 - d / 3)) : 0;
  }
  const buf = await sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
  const k = await sharp(buf).trim({ threshold: 1 }).png().toBuffer({ resolveWithObject: true });
  fs.writeFileSync(yol, k.data);
  const j = { ...b, x: b.x - (k.info.trimOffsetLeft ?? 0), y: b.y - (k.info.trimOffsetTop ?? 0), w: k.info.width, h: k.info.height };
  fs.writeFileSync(`ekip/giysin/parca/${ad}.json`, JSON.stringify(j));
  console.log(j);
})();
