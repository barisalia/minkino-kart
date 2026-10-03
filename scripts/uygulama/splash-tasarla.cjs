// Açılış görseli kaynağı: assets/uygulama/splash.png (2732², krem #FFF4DD). Üstte Mino-Kino simge kutusu
// (assets/uygulama/splash-simge.png, eski splash'tan kesildi, krem zeminli gölgesiyle), altında asıl MINKINO logosu
// (assets/uygulama/logo-minkino-asil.png; krem zemin açık olduğu için kenarsız temiz logo). Yerel açılış resimleri için
// sonra: node scripts/uygulama/acilis-gorseli.mjs
//   node scripts/uygulama/splash-tasarla.cjs
const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const KREM = { r: 255, g: 244, b: 221, alpha: 1 };
const KENAR = 2732, LOGO_EN = 1760, ARA = 120;

(async () => {
  const simge = await s('assets/uygulama/splash-simge.png').toBuffer({ resolveWithObject: true });
  const logo = await s('assets/uygulama/logo-minkino-asil.png').resize({ width: LOGO_EN, kernel: 'lanczos3' }).toBuffer({ resolveWithObject: true });
  // logonun altına çok hafif sıcak gölge: krem zeminde açık yeşil harfler kaybolmasın
  const golge = await s(logo.data)
    .ensureAlpha()
    .linear([0, 0, 0, 0.22], [90, 54, 23, 0])
    .blur(14)
    .png()
    .toBuffer();
  const sh = simge.info.height, lh = logo.info.height;
  const ust = Math.round((KENAR - (sh + ARA + lh)) / 2);
  const simgeSol = Math.round((KENAR - simge.info.width) / 2), logoSol = Math.round((KENAR - logo.info.width) / 2), logoUst = ust + sh + ARA;
  await s({ create: { width: KENAR, height: KENAR, channels: 4, background: KREM } })
    .composite([
      { input: simge.data, left: simgeSol, top: ust },
      { input: golge, left: logoSol, top: logoUst + 18 },
      { input: logo.data, left: logoSol, top: logoUst },
    ])
    .flatten({ background: KREM })
    .removeAlpha()
    .png({ compressionLevel: 9 })
    .toFile('assets/uygulama/splash.png');
  console.log('assets/uygulama/splash.png', { simge: [simge.info.width, sh], logo: [logo.info.width, lh], ust });
})();
