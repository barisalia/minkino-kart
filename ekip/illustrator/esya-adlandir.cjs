// Eşya Turntable adlandırma: kaynak 3/4 ön çizim olduğu için dönüşler ona göredir. disa.ps1 45° → "uc-ceyrek", 90° → "yan", 180° → "arka" yazar;
// bu betik: 45° (gerçek yan) → yan.*, 90° (arkadan 3/4) → arka-uc-ceyrek.*, kaynak çizim (3/4 ön) → uc-ceyrek.png; arka aynı.
// node esya-adlandir.cjs <ad>
const fs = require('fs'); const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const ad = process.argv[2], d = `ekip/turntable/${ad}/`;
(async () => { for (const e of ['png', 'svg']) { const a = d + `yan.${e}`, b = d + `uc-ceyrek.${e}`, c = d + `arka-uc-ceyrek.${e}`; if (!fs.existsSync(a) || !fs.existsSync(b)) continue; fs.renameSync(a, c); fs.renameSync(b, d + `yan.${e}`); }
  const src = `assets/film/esya/${ad}.webp`; if (fs.existsSync(src)) await s(src).png().toFile(d + 'uc-ceyrek.png');
  const L = ['yan', 'uc-ceyrek', 'arka-uc-ceyrek', 'arka'].filter((n) => fs.existsSync(d + n + '.png')); const T = 400;
  const im = await Promise.all(L.map((n) => s(d + n + '.png').resize(T, T, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer()));
  await s({ create: { width: T * L.length, height: T, channels: 4, background: '#cfe6fa' } }).composite(im.map((b, i) => ({ input: b, left: i * T, top: 0 }))).png().toFile(d + 'onizleme.png'); console.log(ad, L.join(' ')); })();
