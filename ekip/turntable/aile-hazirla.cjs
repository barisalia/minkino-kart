// Kukla kitlerini (assets/karakter/<ad>/) dinlenme duruşunda tek SVG'ye birleştirir → Illustrator Dönen tabla kaynağı.
// node ekip/turntable/aile-hazirla.cjs [ad ...]   (varsayılan: anne baba lokum babaanne dede)
// Çıktı: ekip/turntable/<ad>/<ad>-tt.svg (yalnız varsayılan yüz seçenekleri, gizli parçalar hariç; kalan boşluk kırpılır)
const fs = require('fs'), path = require('path');
const KOK = path.join(__dirname, '../..');
const adlar = process.argv.slice(2).length ? process.argv.slice(2) : ['anne', 'baba', 'lokum', 'babaanne', 'dede'];
for (const ad of adlar) {
  const dir = path.join(KOK, 'assets/karakter', ad);
  const j = JSON.parse(fs.readFileSync(path.join(dir, `${ad}.json`), 'utf8'));
  const varsayilan = new Set(Object.values(j.yuvalar || {}).map((y) => y.varsayilan));
  const gizli = new Set(Array.isArray(j.gizli) ? j.gizli : Object.keys(j.gizli || {}));
  let ic = '', minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
  for (const k of j.sira) {
    const p = j.parcalar[k];
    if (!p || gizli.has(k)) continue;
    if (p.yuva && !varsayilan.has(k)) continue;
    const svgYol = path.join(dir, `${k}.svg`);
    if (!fs.existsSync(svgYol)) continue;
    let s = fs.readFileSync(svgYol, 'utf8');
    const vb = s.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
    // id çakışmasın: her parçanın id'lerine önek
    s = s.replace(/id="([^"]+)"/g, `id="${k}-$1"`).replace(/url\(#([^)]+)\)/g, `url(#${k}-$1)`).replace(/href="#([^"]+)"/g, `href="#${k}-$1"`);
    s = s.replace(/<svg[^>]*>/, `<svg x="${vb[0]}" y="${vb[1]}" width="${vb[2]}" height="${vb[3]}" viewBox="${vb.join(' ')}" overflow="visible">`).replace(/<\?xml[^>]*>/, '');
    ic += s;
    minX = Math.min(minX, vb[0]); minY = Math.min(minY, vb[1]); maxX = Math.max(maxX, vb[0] + vb[2]); maxY = Math.max(maxY, vb[1] + vb[3]);
  }
  const pay = 40, w = maxX - minX + 2 * pay, h = maxY - minY + 2 * pay;
  const cikti = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${minX - pay} ${minY - pay} ${w} ${h}" width="${w}" height="${h}">${ic}</svg>`;
  const hedefDir = path.join(KOK, 'ekip/turntable', ad);
  fs.mkdirSync(hedefDir, { recursive: true });
  fs.writeFileSync(path.join(hedefDir, `${ad}-tt.svg`), cikti);
  console.log(ad, Math.round(w), 'x', Math.round(h));
}
