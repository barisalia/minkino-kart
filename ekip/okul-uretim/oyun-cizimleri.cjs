const sharp = require("sharp"),
  fs = require("fs"),
  path = require("path");
const out = path.join(__dirname, "../../assets/okul");
const sheets = {
  mekan: ["perde", "masa", "sepet", "dolap"],
  oyuncak: ["kamyon", "davul", "fener", "kol"],
  sosyal: ["tuvalet", "kumsaati", "kalemtiras", null],
  deney: ["sari", "kirmizi", "mavi", "corap"],
  bilye: [null, "cark", "kova", "can"],
  tepkiler: ["canta-tok", "canta-puf", "kurbaga-hop", "kurbaga-islak"],
  "sofra-ince": ["peynir", "pisi", "salatalik", "sandvic"],
};
async function food(input, id) {
  const {
    data,
    info: { width: w, height: h },
  } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  // Distance from the transparent silhouette, in source pixels. Keep a fine ink stroke at the displayed size.
  const d = new Float32Array(w * h);
  for (let i = 0; i < d.length; i++)
    d[i] =
      data[4 * i + 3] < 128
        ? 0
        : Math.min(
            (i % w) + 1,
            w - (i % w),
            Math.floor(i / w) + 1,
            h - Math.floor(i / w),
          );
  for (let y = 1; y < h; y++)
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      d[i] = Math.min(
        d[i],
        d[i - 1] + 1,
        d[i - w] + 1,
        d[i - w - 1] + 1.414,
        d[i - w + 1] + 1.414,
      );
    }
  for (let y = h - 2; y >= 0; y--)
    for (let x = w - 2; x >= 1; x--) {
      const i = y * w + x;
      d[i] = Math.min(
        d[i],
        d[i + 1] + 1,
        d[i + w] + 1,
        d[i + w + 1] + 1.414,
        d[i + w - 1] + 1.414,
      );
    }
  for (let i = 0; i < d.length; i++) {
    if (!data[i * 4 + 3]) continue;
    const ink = Math.max(0, Math.min(1, Math.max(w, h) * 0.008 + 0.5 - d[i]));
    if (id === "pisi") {
      data[i * 4] = 246;
      data[i * 4 + 1] = 168;
      data[i * 4 + 2] = 71;
    }
    for (let k = 0; k < 3; k++)
      data[i * 4 + k] = Math.round(data[i * 4 + k] * (1 - ink));
  }
  let im = sharp(data, { raw: { width: w, height: h, channels: 4 } });
  if (id === "pisi") {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="' +
      w +
      '" height="' +
      h +
      '" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M34 52 C41 58 51 57 59 50 Q62 48 65 48" fill="none" stroke="#ce792c" stroke-width="1.35" stroke-linecap="round"/></svg>';
    im = im.composite([{ input: Buffer.from(svg) }]);
  }
  return im.png().toBuffer();
}
(async () => {
  for (const [sheet, ids] of Object.entries(sheets)) {
    const file = path.join(__dirname, sheet + ".png"),
      m = await sharp(file).metadata(),
      w = Math.floor(m.width / 2),
      h = Math.floor(m.height / 2);
    const isolated =
      sheet === "sofra-ince" ? await require("./ayir.cjs")(file) : null;
    for (const [i, id] of ids.entries()) {
      if (!id) continue;
      const cell = isolated
        ? isolated[i]
        : await sharp(file)
            .extract({
              left: (i % 2) * w,
              top: Math.floor(i / 2) * h,
              width: w,
              height: h,
            })
            .png()
            .toBuffer();
      let buf = await sharp(cell)
        .trim({ threshold: 10 })
        .resize({ width: 450, height: 475, fit: "inside" })
        .png()
        .toBuffer();
      if (sheet === "sofra-ince") buf = await food(buf, id);
      await sharp(buf)
        .webp({
          lossless: sheet === "sofra-ince",
          quality: 93,
          alphaQuality: 100,
        })
        .toFile(path.join(out, id + ".webp"));
    }
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
