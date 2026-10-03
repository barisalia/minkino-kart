// Play tablet ekran görüntüleri (9:16, 1440x2560): iPad mağaza görüntülerinden, üst/alt zemin rengiyle genişletilerek
const s = require(process.cwd() + '/node_modules/sharp');
const fs = require('fs');
(async () => {
  for (const dil of ['tr', 'en']) {
    const kay = `assets/uygulama/magaza-ekranlari/${dil}/ipad-2048x2732/`;
    const hed = `assets/uygulama/magaza-ekranlari/${dil}/play-tablet-1440x2560/`;
    fs.mkdirSync(hed, { recursive: true });
    for (const f of fs.readdirSync(kay).filter((x) => x.endsWith('.jpg'))) {
      const ic = await s(kay + f).resize({ width: 1440 }).toBuffer();
      const m = await s(ic).metadata();
      const ust = Math.floor((2560 - m.height) / 2), alt = 2560 - m.height - ust;
      const renk = async (y) => { const { data } = await s(ic).extract({ left: 0, top: y, width: 1440, height: 4 }).resize(1, 1).raw().toBuffer({ resolveWithObject: true }); return { r: data[0], g: data[1], b: data[2] }; };
      const ustR = await renk(0), altR = await renk(m.height - 4);
      const ustB = await s({ create: { width: 1440, height: ust, channels: 3, background: ustR } }).png().toBuffer();
      const altB = await s({ create: { width: 1440, height: alt, channels: 3, background: altR } }).png().toBuffer();
      await s({ create: { width: 1440, height: 2560, channels: 3, background: ustR } })
        .composite([{ input: ustB, top: 0, left: 0 }, { input: ic, top: ust, left: 0 }, { input: altB, top: ust + m.height, left: 0 }])
        .jpeg({ quality: 90 }).toFile(hed + f);
    }
  }
  console.log('tamam');
})();
