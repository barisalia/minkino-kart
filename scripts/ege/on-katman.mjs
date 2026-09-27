/**
 * Beşik ve oyuncak sepetinin ÖN katmanını keser (Ege Uyuyor, sahne 1-2 ve 6-9).
 * Aynı tuvalde, yalnız önde kalan parçalar: beşiğin fistolu ön kenarı + gövdesi + ayakları + sağ baş tahtası,
 * sepetin ön hasır kenarı + gövdesi. İçine konan (Ege, battaniye, oyuncaklar) arka resimle ön katman arasında durur.
 * Çalıştırma: node scripts/ege/on-katman.mjs  → assets/ege/besik-on.webp, assets/ege/sepet-on.webp
 * Çokgenler tasarımcının çizimine göre elle çıkarıldı (piksel koordinatı; çizgi kalınlığı ön katmanda kalır).
 */
import sharp from 'sharp';

const KATMANLAR = {
  besik: {
    // fistolu ön kenarın üst çizgisi (soldan sağa), sonra sağ baş tahtasının iç kenarı ve dış çerçeve
    cokgen: [
      [0, 252], [60, 250], [88, 240], [104, 229], [128, 220], [160, 222], [180, 234], [188, 243], [200, 240], [233, 233],
      [262, 236], [280, 245], [290, 252], [300, 248], [336, 240], [365, 242], [380, 249], [390, 259], [400, 256],
      [432, 247], [460, 250], [470, 256], [478, 262], [500, 244], [516, 222], [522, 200], [515, 180], [512, 150],
      [516, 118], [540, 104], [600, 60], [700, 30], [780, 30], [780, 621], [0, 621],
    ],
  },
  sepet: {
    // ön hasır halkanın iç (üst) kenarı
    cokgen: [
      [0, 226], [45, 226], [58, 243], [104, 255], [180, 260], [250, 262], [330, 257], [362, 252], [398, 242], [414, 230],
      [420, 216], [474, 216], [474, 513], [0, 513],
    ],
  },
};

for (const [ad, { cokgen }] of Object.entries(KATMANLAR)) {
  const kaynak = `assets/ege/${ad}.webp`;
  const { width: w, height: h } = await sharp(kaynak).metadata();
  const maske = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><path d="M${cokgen.map((p) => p.join(' ')).join('L')}Z" fill="#fff"/></svg>`,
  );
  await sharp(kaynak)
    .ensureAlpha()
    .composite([{ input: maske, blend: 'dest-in' }])
    .webp({ quality: 88, alphaQuality: 100 })
    .toFile(`assets/ege/${ad}-on.webp`);
  console.log(`assets/ege/${ad}-on.webp`, w, h);
}
