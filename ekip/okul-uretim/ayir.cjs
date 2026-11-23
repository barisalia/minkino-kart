const sharp = require("sharp");
// Follow each opaque silhouette across cell boundaries so a neighbouring pose cannot enter its crop.
module.exports = async function separate(file) {
  const {
    data,
    info: { width: w, height: h },
  } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const marks = new Int32Array(w * h),
    queue = new Int32Array(w * h),
    parts = [];
  let id = 0;
  for (let j = 0; j < w * h; j++) {
    if (marks[j] || data[j * 4 + 3] < 32) continue;
    let head = 0,
      count = 1,
      left = w,
      right = 0,
      top = h,
      bottom = 0;
    queue[0] = j;
    marks[j] = ++id;
    while (head < count) {
      const p = queue[head++],
        x = p % w,
        y = Math.floor(p / w);
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
      for (const k of [x ? p - 1 : -1, x + 1 < w ? p + 1 : -1, p - w, p + w])
        if (k >= 0 && k < marks.length && !marks[k] && data[k * 4 + 3] >= 32) {
          marks[k] = id;
          queue[count++] = k;
        }
    }
    if (count > 1024) parts.push({ id, left, right, top, bottom, count });
  }
  const ordered = parts
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)
    .sort((a, b) => a.top + a.bottom - (b.top + b.bottom));
  for (const start of [0, 2]) {
    if (ordered[start].left > ordered[start + 1].left)
      [ordered[start], ordered[start + 1]] = [
        ordered[start + 1],
        ordered[start],
      ];
  }
  return Promise.all(
    ordered.map(async (b) => {
      const ww = b.right - b.left + 5,
        hh = b.bottom - b.top + 5,
        raw = Buffer.alloc(ww * hh * 4);
      for (let y = 0; y < hh; y++)
        for (let x = 0; x < ww; x++) {
          const k = (b.top + y - 2) * w + b.left + x - 2;
          if (
            marks[k] === b.id ||
            (!marks[k] &&
              [k - 1, k + 1, k - w, k + w].some((n) => marks[n] === b.id))
          )
            data.copy(raw, 4 * (y * ww + x), 4 * k, 4 * k + 4);
        }
      return sharp(raw, { raw: { width: ww, height: hh, channels: 4 } })
        .png()
        .toBuffer();
    }),
  );
};
