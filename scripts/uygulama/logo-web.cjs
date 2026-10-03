// Asıl MINKINO logosunun uygulamada kullanılan WebP'leri (1400 px en: 3x telefonda ~460 px'e kadar keskin).
// Kaynak: assets/uygulama/logo-minkino-asil.png (temiz, açık zemin) ve logo-minkino-asil-kenarli.png (beyaz kenar +
// gölge, renkli zemin; scripts/uygulama/logo-kenar.cjs). Çıktı aynı adlarla .webp. src/ui/logo.ts bunları kullanır.
//   node scripts/uygulama/logo-web.cjs
const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const EN = 1400;
(async () => {
  for (const ad of ['logo-minkino-asil', 'logo-minkino-asil-kenarli']) {
    const i = await s(`assets/uygulama/${ad}.png`)
      .resize({ width: EN, kernel: 'lanczos3' })
      .webp({ quality: 92, alphaQuality: 100, effort: 6, smartSubsample: true })
      .toFile(`assets/uygulama/${ad}.webp`);
    console.log(`assets/uygulama/${ad}.webp`, i.width, i.height, i.size);
  }
})();
