// Turntable yan görünüşü olmayan köpek, tavşan, ördek: yan.png'yi oyundaki profil iskeletinin dinlenme duruşundan (assets/karakter-iskelet/<ad>-profil.svg) üretir
// (2048 tuval, şeffaf), önizlemeleri (yan | 3/4 | arka; açık ve koyu zemin) yeniler. Eski önizleme önizleme-eski.png olarak yoksa saklanır; mevcut yan.png varsa yan-eski.png'ye alınır.
// Not: yan.svg (vektör iz) Illustrator ister; atlanır. node turntable-yan-iskeletten.cjs [ad ...]   (tekrar çalıştırmak güvenli)
const fs = require('fs');
const { chromium } = require(require.resolve('playwright', { paths: [process.cwd()] }));
const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const adlar = process.argv.length > 2 ? process.argv.slice(2) : ['kopek', 'tavsan', 'ordek'];
const HUCRE = 520;
(async () => {
  const br = await chromium.launch(), pg = await br.newPage({ viewport: { width: 2048, height: 2048 } });
  for (const ad of adlar) {
    const d = `ekip/turntable/${ad}/`, svgYol = `assets/karakter-iskelet/${ad}-profil.svg`;
    if (!fs.existsSync(d) || !fs.existsSync(svgYol)) { console.log(ad, 'klasör ya da iskelet yok'); continue; }
    const j = JSON.parse(fs.readFileSync(`assets/karakter-iskelet/${ad}-profil.json`, 'utf8').replace(/^﻿/, '')), svg = fs.readFileSync(svgYol, 'utf8');
    const html = `<body style="margin:0;background:transparent">${svg.replace(/width="2048" height="2048"/, 'width="2048" height="2048" style="display:block"')}</body>`;
    await pg.setContent(html); await pg.waitForTimeout(800);
    const png = await pg.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: 2048, height: 2048 } });
    if (!fs.existsSync(d + 'yan-eski.png') && fs.existsSync(d + 'yan.png')) fs.copyFileSync(d + 'yan.png', d + 'yan-eski.png');
    fs.writeFileSync(d + 'yan.png', png);
    if (!fs.existsSync(d + 'onizleme-eski.png') && fs.existsSync(d + 'onizleme.png')) fs.copyFileSync(d + 'onizleme.png', d + 'onizleme-eski.png');
    const hucre = [];
    for (const g of ['yan', 'uc-ceyrek', 'arka']) hucre.push(await s(d + g + '.png').resize(HUCRE, HUCRE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer());
    for (const [bg, dosya] of [['#CFE6FA', 'onizleme.png'], ['#2B2F3A', 'onizleme-koyu.png']]) {
      const taban = await s({ create: { width: 3 * HUCRE, height: HUCRE, channels: 3, background: bg } }).png().toBuffer();
      await s(taban).composite(hucre.map((b, i) => ({ input: b, left: i * HUCRE, top: 0 }))).png().toFile(d + dosya);
    }
    console.log(`${ad}: yan.png (iskelet dinlenme, ${j.sira.length} katman) ve önizleme yenilendi`);
  }
  await br.close();
})();
