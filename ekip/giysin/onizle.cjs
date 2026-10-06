// node ekip/giysin/onizle.cjs <cikti.png> <zemin #hex|yok> ad1 ad2 ...  (yok: Kino'suz, yalnız parçalar)
const sharp = require('sharp');
(async () => {
  const [, , cikti, zemin, ...adlar] = process.argv;
  const katman = [];
  const kinoYok = adlar[0] === '-';
  if (!kinoYok) katman.push({ input: 'ekip/kino/kino-final.png', left: 0, top: 0 });
  for (const ad of adlar.filter((a) => a !== '-')) {
    const b = require(process.cwd() + `/ekip/giysin/parca/${ad}.json`);
    katman.push({ input: `ekip/giysin/parca/${ad}.png`, left: b.x, top: b.y });
  }
  const s = sharp({ create: { width: 2048, height: 2048, channels: 4, background: zemin } }).composite(katman);
  const buf = await s.png().toBuffer();
  await sharp(buf).resize(900).png().toFile(cikti);
})();
