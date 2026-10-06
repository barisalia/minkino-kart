const sharp = require('sharp');
(async () => {
  await sharp('ekip/kino/kino-final.png').flatten({ background: '#ffffff' }).png().toFile('ekip/giysin/ham/kino-beyaz.png');
  await sharp('assets/film/park/arka-uzak.webp').png().toFile('ekip/giysin/ham/park.png');
  console.log(await sharp('assets/film/park/arka-uzak.webp').metadata().then((m) => [m.width, m.height]));
})();
