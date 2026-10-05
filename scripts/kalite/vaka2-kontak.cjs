// assets/dedektif2 icin kontak sayfasi: her seffaf varlik koyu ve acik fonda yan yana.
const sharp = require('sharp');
const fs = require('fs');
const D = 'assets/dedektif2';
const C = 300;
(async () => {
  const dosyalar = fs.readdirSync(D).filter((f) => f.endsWith('.webp')).sort();
  const kol = 8, sat = Math.ceil(dosyalar.length / kol);
  const parca = [];
  for (let i = 0; i < dosyalar.length; i++) {
    const f = dosyalar[i];
    const x = (i % kol) * C * 2, y = Math.floor(i / kol) * (C + 30);
    for (const [j, renk] of [[0, '#22303a'], [1, '#f4f0e6']]) {
      const img = await sharp(`${D}/${f}`).resize(C - 16, C - 16, { fit: 'inside' }).png().toBuffer();
      const kutu = await sharp({ create: { width: C, height: C, channels: 4, background: renk } })
        .composite([{ input: img, gravity: 'center' }]).png().toBuffer();
      parca.push({ input: kutu, left: x + j * C, top: y });
    }
    const svg = `<svg width="${C * 2}" height="30"><text x="6" y="21" font-size="20" font-family="Arial">${f}</text></svg>`;
    parca.push({ input: Buffer.from(svg), left: x, top: y + C });
  }
  await sharp({ create: { width: kol * C * 2, height: sat * (C + 30), channels: 4, background: '#ffffff' } })
    .composite(parca).png().toFile('tests/screens/vaka2-sanat.png');
  console.log('tests/screens/vaka2-sanat.png', dosyalar.length);
})();
