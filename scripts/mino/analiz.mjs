// kedi-3.svg içindeki her path'in sınır kutusu, rengi ve alanı → scripts/mino/parcalar.json
import fs from 'node:fs';
import { svgPathBbox } from 'svg-path-bbox';
const s = fs.readFileSync('karakter-kaynak/kedi-3.svg', 'utf8').replace(/<metadata>[\s\S]*?<\/metadata>/, '');
const yollar = [...s.matchAll(/<path\b([^>]*)\/?>/g)].map((m, i) => {
  const a = m[1];
  const d = a.match(/\sd="([^"]+)"/)[1];
  const fill = (a.match(/fill="([^"]+)"/) ?? [])[1] ?? '';
  const [x0, y0, x1, y1] = svgPathBbox(d);
  return { i, fill, x0: Math.round(x0), y0: Math.round(y0), x1: Math.round(x1), y1: Math.round(y1), w: Math.round(x1 - x0), h: Math.round(y1 - y0) };
});
fs.writeFileSync('scripts/mino/parcalar.json', JSON.stringify(yollar));
const tum = yollar.reduce((a, p) => ({ x0: Math.min(a.x0, p.x0), y0: Math.min(a.y0, p.y0), x1: Math.max(a.x1, p.x1), y1: Math.max(a.y1, p.y1) }), { x0: 1e9, y0: 1e9, x1: 0, y1: 0 });
console.log(yollar.length, 'path; toplam kutu', tum);
for (const p of yollar.filter((p) => p.w * p.h > 60000)) console.log(p);
