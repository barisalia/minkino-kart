// Film MP4 dikey / kare kadrajı için zemin uzantısı: ön katmanın (arka-on) kasasız, yalnız taş kısmı + onun yatay
// aynası yan yana (yan kenarlar dikişsiz). Motor dünyanın altına bunu dikey ayna / düz dizer (film.css → fl-zemin-alt).
// Çalıştırma: node scripts/film/zemin-uzanti.mjs [film]   (Adobe arka-on'u değiştirirse yeniden çalıştırın)
import sharp from 'sharp';

const film = process.argv[2] ?? 'mino-karpuz';
const kaynak = `assets/film/${film}/arka-on.webp`;
// taş zeminin kasa / saksı olmayan orta bölgesi (2752 × 1536 çerçevede)
const BOLGE = { left: 700, top: 1330, width: 1350, height: 206 };
const parca = await sharp(kaynak).extract(BOLGE).toBuffer();
const ayna = await sharp(parca).flop().toBuffer();
await sharp({ create: { width: BOLGE.width * 2, height: BOLGE.height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([
    { input: parca, left: 0, top: 0 },
    { input: ayna, left: BOLGE.width, top: 0 },
  ])
  .webp({ quality: 82 })
  .toFile(`assets/film/${film}/arka-zemin.webp`);
console.log(`✓ assets/film/${film}/arka-zemin.webp`);
