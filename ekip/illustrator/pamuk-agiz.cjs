// Pamuk (ekip/pamuk/pamuk-final.svg/.json) dudak senkronu ağızları (gizli, kafaya bağlı, vektör):
// agiz-kapali, agiz-az, agiz-orta, agiz-yuvarlak, agiz-dis, agiz-gulumse. Asıl ağız ω çizgisi (uçlar 900,958 ve 1122,958; orta 1010,959) + açık ağız (alt 1062).
// teslim.ps1 SVG'yi baştan yazarsa tekrar çalıştırılır (idempotent). node pamuk-agiz.cjs [svg=ekip/pamuk/pamuk-final.svg] [json...]
const fs = require('fs');
const svgYol = process.argv[2] || 'ekip/pamuk/pamuk-final.svg';
const jsonlar = process.argv.length > 3 ? process.argv.slice(3) : ['ekip/pamuk/pamuk-final.json', 'ekip/film/cizim/pamuk-final.json'];
const f = (n) => Math.round(n * 10) / 10;
const C = '#140A0A', IC = '#6E0A1E', DIL = '#F08088', DIS = '#FFFFFF', SW = 14, CX = 1010, Y0 = 959;
const cz = (d, w = SW) => `<path d="${d}" fill="none" stroke="${C}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const omega = (k = 1, dy = 0) => { const xl = CX - 110 * k, xr = CX + 112 * k, ty = 958 + (1 - k) * 28 + dy, cy = 1038 + dy - (1 - k) * 20;
  return cz(`M${f(xl)},${f(ty)} Q${f(CX - 55 * k)},${f(cy)} ${CX},${Y0 + dy} Q${f(CX + 56 * k)},${f(cy)} ${f(xr)},${f(ty)}`); };
let u = 0;
function acik(a, b, ust, alt, disUst, dil) { // a,b: sol/sağ köşe x; ust: köşe y; alt: alt uç y
  const k = `pa-mouth-${u++}`, d = `M${a},${ust} Q${CX},${ust + 8} ${b},${ust} C${b - 6},${f(ust + (alt - ust) * 0.85)} ${f(CX + (b - CX) * 0.5)},${alt} ${CX},${alt} C${f(CX - (CX - a) * 0.5)},${alt} ${a + 6},${f(ust + (alt - ust) * 0.85)} ${a},${ust} Z`;
  let ic = ''; if (disUst) ic += `<rect x="${a}" y="${ust - 4}" width="${b - a}" height="${disUst}" fill="${DIS}"/>`;
  if (dil) ic += `<ellipse cx="${CX + 6}" cy="${alt - 4}" rx="${f((b - a) * 0.3)}" ry="${f((alt - ust) * dil)}" fill="${DIL}"/>`;
  return `<clipPath id="${k}"><path d="${d}"/></clipPath><path d="${d}" fill="${IC}"/><g clip-path="url(#${k})">${ic}</g><path d="${d}" fill="none" stroke="${C}" stroke-width="${SW - 2}" stroke-linejoin="round"/>`; }
const fil = (y1 = 984) => cz(`M${CX},952 L${CX},${y1}`, SW * 0.8);
const E = {
  'agiz-kapali': cz(`M${CX - 62},990 Q${CX},1008 ${CX + 62},990`, SW + 1) + fil(990),
  'agiz-az': acik(CX - 52, CX + 54, 1000, 1030, 0, 0.45) + omega(0.78, 4),
  'agiz-orta': acik(CX - 72, CX + 74, 1000, 1066, 0, 0.5) + omega(0.95, 0),
  'agiz-yuvarlak': (() => { const k = `pa-mouth-yuv`, e = `cx="${CX}" cy="1028" rx="34" ry="42"`; return `<clipPath id="${k}"><ellipse ${e}/></clipPath><ellipse ${e} fill="${IC}"/><g clip-path="url(#${k})"><ellipse cx="${CX}" cy="1058" rx="26" ry="16" fill="${DIL}"/></g><ellipse ${e} fill="none" stroke="${C}" stroke-width="${SW - 2}"/>` + fil(988); })(),
  'agiz-dis': acik(CX - 92, CX + 94, 1000, 1048, 20, 0) + omega(1.0, 0),
  'agiz-gulumse': omega(1) + fil(960),
};
let t = fs.readFileSync(svgYol, 'utf8');
function grup(g) { const bas = t.indexOf(`<g id="${g}"`); if (bas < 0) return null; let der = 0; const re = /<g\b[^>]*?(\/?)>|<\/g>/g; re.lastIndex = bas;
  for (let m; (m = re.exec(t)); ) { if (m[0] === '</g>') der--; else if (!m[1]) der++; if (der === 0) return { bas, son: m.index + 4 }; } return null; }
for (const id of Object.keys(E)) { const r = grup(id); if (r) t = t.slice(0, t.lastIndexOf('\n', r.bas)) + t.slice(r.son); }
const r = grup('agiz');
t = t.slice(0, r.son) + Object.keys(E).map((id) => `\n  <g id="${id}" display="none">\n    ${E[id]}\n  </g>`).join('') + t.slice(r.son);
fs.writeFileSync(svgYol, t);
for (const y of jsonlar) { if (!fs.existsSync(y)) continue; const j = JSON.parse(fs.readFileSync(y, 'utf8').replace(/^﻿/, ''));
  const i = j.sira.indexOf('agiz'); j.sira = j.sira.filter((s) => !(s in E)); j.sira.splice(i + 1, 0, ...Object.keys(E));
  j.gizli = [...new Set([...(j.gizli || []), ...Object.keys(E)])];
  for (const id of Object.keys(E)) { j.bagli[id] = 'kafa'; j.donme[id] = j.donme.agiz; }
  fs.writeFileSync(y, JSON.stringify(j, null, 2) + '\n'); }
console.log('pamuk ok');
