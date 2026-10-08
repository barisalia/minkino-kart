/**
 * Dolabın içi: 2 sütun × 4 sıra göz (nano_banana_pro ile çizildi, ekip/giysin/dolap-goz-nano.webp, 2048).
 * Nano çizimin iç kısmı (askı, raf yerine 8 göz) eski açık dolabın iç dikdörtgenine (çekmecenin üstüne) oturtulur;
 * dış çerçeve, kapaklar ve çekmece eskisinden kalır, açılış animasyonu aynen çalışır.
 * Çıktı: assets/giysin/dolap-acik-goz.webp, dolap-ic-goz.webp (1000). node ekip/giysin/dolap-goz.cjs
 */
const sharp = require('sharp');
const C = 'assets/giysin/';
const Q = { quality: 88, alphaQuality: 100, smartSubsample: true };
// 1000'lik ölçekte: nano çizimde iç [236..766] × [100..932], eski dolapta [236..766] × [100..735]
const X0 = 236, X1 = 766, KY0 = 100, KY1 = 932, HY1 = 735;
const s = 2048 / 1000;

(async () => {
  const yama = await sharp('ekip/giysin/dolap-goz-nano.webp')
    .extract({ left: Math.round(X0 * s), top: Math.round(KY0 * s), width: Math.round((X1 - X0) * s), height: Math.round((KY1 - KY0) * s) })
    .resize(X1 - X0, HY1 - KY0, { fit: 'fill', kernel: 'lanczos3' })
    .ensureAlpha()
    .png()
    .toBuffer();
  for (const [kaynak, hedef] of [['dolap-acik.webp', 'dolap-acik-goz.webp'], ['dolap-ic.webp', 'dolap-ic-goz.webp']]) {
    await sharp(C + kaynak).composite([{ input: yama, left: X0, top: KY0 }]).webp(Q).toFile(C + hedef);
    console.log(hedef);
  }
})();
