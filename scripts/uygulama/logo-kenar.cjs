// Asıl logoya kalın beyaz kenar + yumuşak gölge ekler (simge ve açılış ekranı için)
const s = require(process.cwd() + '/node_modules/sharp');
(async () => {
  const pad = 70;
  const base = await s('assets/uygulama/logo-minkino-asil.png').extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const m = await s(base).metadata();
  const a = await s(base).extractChannel(3).blur(16).raw().toBuffer({ resolveWithObject: true });
  const w = m.width, h = m.height, n = w * h;
  const kenar = Buffer.alloc(n * 4), golge = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) {
    const v = a.data[i * a.info.channels];
    const al = v > 24 ? 255 : Math.round((v / 24) * 255);
    kenar[i * 4] = kenar[i * 4 + 1] = kenar[i * 4 + 2] = 255; kenar[i * 4 + 3] = al;
    golge[i * 4] = 70; golge[i * 4 + 1] = 40; golge[i * 4 + 2] = 20; golge[i * 4 + 3] = Math.round(al * 0.35);
  }
  const g = await s(golge, { raw: { width: w, height: h, channels: 4 } }).blur(8).png().toBuffer();
  const k = await s(kenar, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
  await s({ create: { width: w, height: h + 16, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: g, top: 16, left: 0 }, { input: k, top: 0, left: 0 }, { input: base, top: 0, left: 0 }])
    .png().toBuffer().then((b) => s(b).trim({ threshold: 1 }).png().toFile('assets/uygulama/logo-minkino-asil-kenarli.png'));
})();
