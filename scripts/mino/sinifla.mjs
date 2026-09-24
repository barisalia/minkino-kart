// Parçaları gruplara ayırır ve renkli bir kontrol görüntüsü üretir.
import fs from 'node:fs';
import sharp from 'sharp';
export const parcalar = JSON.parse(fs.readFileSync(new URL('./parcalar.json', import.meta.url)));

// Bölgeler (viewBox 1331x2048 koordinatları)
export const BOYUN_Y = 1150;
export function grup(p) {
  const cx = (p.x0 + p.x1) / 2, cy = (p.y0 + p.y1) / 2;
  if (p.i === 0) return 'sil';
  if (p.i === 1) return 'kontur';
  // kuyruk: sağ taraf, kafanın sağında / gövdenin sağında
  // Sadece kuyruğun kıvrık ucu ayrı oynar; gövdeye yapışık kısmı gövdeyle kalır (yarık açılmasın)
  if (p.x1 > 1075 && cy > 850 && cy < 1165) return 'kuyruk';
  if ((p.x1 > 1075 && cy > 850) || (p.x0 >= 830 && cy > 980 && cy < 1560 && cx > 900)) return 'govde';
  if (cy < BOYUN_Y - 10 && p.y1 < BOYUN_Y + 40) return 'kafa';
  return 'govde';
}
const RENK = { kafa: '#3E9DF2', govde: '#5DBE3F', kuyruk: '#FF8A2B', kontur: '#222', sil: 'none' };
if (process.argv[1].endsWith('sinifla.mjs')) {
  const s = fs.readFileSync('karakter-kaynak/kedi-3.svg', 'utf8').replace(/<metadata>[\s\S]*?<\/metadata>/, '');
  let i = 0;
  const cikti = s.replace(/<path\b([^>]*)\/?>/g, (m, a) => {
    const g = grup(parcalar[i++]);
    return `<path${a.replace(/\/\s*$/, "").replace(/fill="[^"]+"/, `fill="${RENK[g]}"`)}/>`;
  });
  await sharp(Buffer.from(cikti)).resize(500).png().toFile(process.argv[2]);
  const say = {};
  parcalar.forEach((p) => (say[grup(p)] = (say[grup(p)] ?? 0) + 1));
  console.log(say);
}
