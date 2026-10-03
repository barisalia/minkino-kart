/**
 * Açılış görseli (splash): tasarımcının assets/uygulama/splash.png'sinden (2732², krem zemin, ortada Mino-Kino ikonu
 * + asıl MINKINO logosu; kaynağı scripts/uygulama/splash-tasarla.cjs kurar) Android ve iOS yerel açılış resimlerini üretir. Yeni paket yok (sharp zaten var).
 *
 *   node scripts/uygulama/acilis-gorseli.mjs
 *
 * - Android (Android 11 ve öncesi): res/drawable[-port|-land]-*dpi/splash.png, her ekran oranında ortada, kırpılmaz.
 *   Android 12+ sistemin kendi açılışını gösterir (uygulama ikonu, krem zemin: res/values/styles.xml).
 * - iOS: LaunchScreen.storyboard görseli "aspect fill" ile kırpar; bu yüzden içerik karenin ortasında küçük durur
 *   (telefonda dikeyde ekranın ~%75'i kadar). Zemin rengi storyboard'da da krem.
 */
import sharp from 'sharp';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const ZEMIN = { r: 255, g: 244, b: 221, alpha: 1 }; // #FFF4DD (capacitor.config.ts ile aynı)
const KAYNAK = 'assets/uygulama/splash.png';

// içerik kutusu: kremi kırp (gölge payı kalsın diye biraz boşlukla)
const { data, info } = await sharp(KAYNAK).trim({ background: '#FFF4DD', threshold: 12 }).png().toBuffer({ resolveWithObject: true });
const icerik = data;
console.log(`içerik ${info.width}×${info.height}`);

async function yaz(dosya, en, boy, oran) {
  const kutu = Math.round(Math.min(en, boy) * oran);
  const ic = await sharp(icerik).resize(kutu, kutu, { fit: 'inside' }).toBuffer({ resolveWithObject: true });
  await sharp({ create: { width: en, height: boy, channels: 4, background: ZEMIN } })
    .composite([{ input: ic.data, left: Math.round((en - ic.info.width) / 2), top: Math.round((boy - ic.info.height) / 2) }])
    .flatten({ background: ZEMIN })
    .png({ compressionLevel: 9 })
    .toFile(dosya);
  console.log(dosya, en, boy);
}

// Android: mevcut dosyaların boyutları korunur
const RES = 'android/app/src/main/res';
for (const d of readdirSync(RES).filter((d) => d.startsWith('drawable'))) {
  const dosya = join(RES, d, 'splash.png');
  let m;
  try {
    m = await sharp(dosya).metadata();
  } catch {
    continue;
  }
  await yaz(dosya, m.width, m.height, 0.62);
}

// iOS: üç ölçek de aynı 2732² görsel
const IOS = 'ios/App/App/Assets.xcassets/Splash.imageset';
for (const ad of ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png']) await yaz(join(IOS, ad), 2732, 2732, 0.34);
