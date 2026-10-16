// Menü kartı resmi: itfaiyeci Mino (kask, yelek, merdiven) → assets/mino-giysin/kart-mino.webp (tek katman: kartın
// parallaxında ayrı katmanlar kayardı; menüde kart canlanınca Mino ezilip esneyerek zıplar).
// Mino tarayıcıda çizilir (oyunun kendi motoru + G-MG1 parçaları; kodla birleştirme, Kino kartının kart.cjs yöntemi).
// Kullanım: önce derleyip kendi portunda sun (npx vite build --outDir dist-mg; npx vite preview --outDir dist-mg --port 4461),
// sonra: node ekip/giysin/kart-mino.cjs [http://localhost:4461]
const sharp = require(require.resolve('sharp', { paths: [process.cwd()] }));
const { chromium } = require(require.resolve('playwright', { paths: [process.cwd()] }));
const kok = (process.argv[2] || 'http://localhost:4461').replace(/\/$/, '');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 600, height: 900 }, deviceScaleFactor: 3 })).newPage();
  const cek = async (ek) => {
    await p.goto(`${kok}/mino-giysin/?onizleme=1&ekran=onizleme&kart=1${ek}`);
    // Mino ilk göz kırpmasını 1,5 sn sonra yapar: ondan önce çek
    await p.waitForTimeout(900);
    // Mino'nun kutusu, şapka ve alet taşabilir diye her yana pay (çizimin dışındaki öğeler girmesin)
    const r = await p.locator('.mg-onizleme .mino-svg').boundingBox();
    return p.screenshot({ omitBackground: true, clip: { x: r.x - r.width * 0.12, y: r.y - r.height * 0.14, width: r.width * 1.24, height: r.height * 1.16 } });
  };
  const tam = await cek('');
  await b.close();
  // sayfanın soluk gölge / hale kalıntıları (alfa < 110; 3x çekim küçültülünce kenar yine yumuşar) atılır, sonra çizimin sınırına kırpılır
  const ham = await sharp(tam).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 3; i < ham.data.length; i += 4) if (ham.data[i] < 110) ham.data[i] = 0;
  const temiz = await sharp(ham.data, { raw: ham.info }).png().toBuffer();
  const { info } = await sharp(temiz).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
  const kutu = { left: -info.trimOffsetLeft, top: -info.trimOffsetTop, width: info.width, height: info.height };
  const yaz = async (buf, ad) => {
    const k = await sharp(buf).extract(kutu).resize(560, 560, { fit: 'inside' }).webp({ quality: 88, alphaQuality: 100 }).toBuffer();
    require('fs').writeFileSync(`assets/mino-giysin/${ad}.webp`, k);
    const m = await sharp(k).metadata();
    console.log(ad, m.width + 'x' + m.height);
  };
  await yaz(temiz, 'kart-mino');
})();
