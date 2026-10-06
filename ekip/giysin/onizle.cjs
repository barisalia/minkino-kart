// node ekip/giysin/onizle.cjs <cikti.png> <zemin #hex|yok> ad1 ad2 ...  (yok: Kino'suz, yalnız parçalar; "<ad": Kino'nun arkasında)
const sharp = require('sharp');
(async () => {
  const [, , cikti, zemin, ...adlar] = process.argv;
  const katman = [];
  const kinoYok = adlar[0] === '-';
  const parca = (ad) => {
    const b = require(process.cwd() + `/ekip/giysin/parca/${ad}.json`);
    return { input: `ekip/giysin/parca/${ad}.png`, left: b.x, top: b.y };
  };
  for (const ad of adlar.filter((a) => a.startsWith('<'))) katman.push(parca(ad.slice(1)));
  if (!kinoYok) katman.push({ input: 'ekip/kino/kino-final.png', left: 0, top: 0 });
  for (const ad of adlar.filter((a) => a !== '-' && !a.startsWith('<'))) katman.push(parca(ad));
  // tuvalden taşan parçalar (şemsiye kubbesi) görünsün: 400 px pay
  for (const k of katman) { k.left += 400; k.top += 400; }
  const s = sharp({ create: { width: 2848, height: 2848, channels: 4, background: zemin } }).composite(katman);
  const buf = await s.png().toBuffer();
  await sharp(buf).resize(900).png().toFile(cikti);
})();
