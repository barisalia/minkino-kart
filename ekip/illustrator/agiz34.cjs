// 3/4 iskeletlerine dudak senkronu ağızları (gizli, kafaya bağlı, vektör): agiz-kapali/az/orta/yuvarlak/dis/gulumse.
// teslim.ps1 SVG'yi yeniden yazar → teslimden SONRA tekrar çalıştırılır (idempotent). node agiz34.cjs <mino|kino> <svg> <json...>
const fs = require('fs');
const [kim, svgYol, ...jsonlar] = process.argv.slice(2);
const f = (n) => Math.round(n * 10) / 10;
// cx: ağız ortası (burun altı), y0: ω üst çizgisi, W: ω yarı genişliği, D: açık ağız derinliği, sw: çizgi, uzak: uzak yanın daralma oranı (perspektif)
const P = {
  mino: { cx: 1352, y0: 976, W: 78, D: 84, sw: 13, C: '#030102', IC: '#75081e', DIL: '#ec7683', DIS: '#fbf6f2', uzak: 0.9 },
  kino: { cx: 1290, y0: 902, W: 150, D: 150, sw: 17, C: '#3A1210', IC: '#3A1210', DIL: '#E8747F', DIS: '#fbf6f2', uzak: 0.95 },
}[kim];
const { cx, y0, W, D, sw, C, IC, DIL, DIS, uzak } = P;
const xl = cx - W, xr = cx + W * uzak;
const cz = (d, w = sw) => `<path d="${d}" fill="none" stroke="${C}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
// ω: iki yay, ortada burundan inen kısa çizgi
const omega = (dy = 0) => cz(`M${f(xl)},${f(y0 - D * 0.12 + dy)} Q${f((xl + cx) / 2)},${f(y0 + D * 0.42 + dy)} ${cx},${f(y0 + dy)} Q${f((xr + cx) / 2)},${f(y0 + D * 0.42 + dy)} ${f(xr)},${f(y0 - D * 0.12 + dy)}`) + cz(`M${cx},${f(y0 - D * 0.2)} L${cx},${f(y0 + dy)}`, sw * 0.85);
// açık ağız: üst kenar ω hattı, alt kenar derin yay; iç + dil + dişler
function acik(id, gen, derin, disUst, disAlt, dil) {
  const a = cx - W * gen, b = cx + W * gen * uzak, ust = y0 + D * 0.12, alt = y0 + D * derin;
  const d = `M${f(a)},${f(ust)} Q${cx},${f(ust + D * 0.14)} ${f(b)},${f(ust)} C${f(b)},${f(alt - D * 0.1)} ${f(cx + W * gen * 0.5)},${f(alt)} ${cx},${f(alt)} C${f(cx - W * gen * 0.5)},${f(alt)} ${f(a)},${f(alt - D * 0.1)} ${f(a)},${f(ust)} Z`;
  const k = `a34-${kim}-${id}`; let ic = '';
  if (disUst) ic += `<rect x="${f(a - 5)}" y="${f(ust - 20)}" width="${f(b - a + 10)}" height="${f(20 + D * disUst)}" fill="${DIS}"/>`;
  if (disAlt) ic += `<ellipse cx="${cx}" cy="${f(alt)}" rx="${f(W * gen * 0.75)}" ry="${f(D * disAlt)}" fill="${DIS}"/>`;
  if (dil) ic += `<ellipse cx="${f(cx + W * gen * 0.1)}" cy="${f(alt)}" rx="${f(W * gen * 0.62)}" ry="${f(D * dil)}" fill="${DIL}"/>`;
  return `<clipPath id="${k}"><path d="${d}"/></clipPath><path d="${d}" fill="${IC}"/><g clip-path="url(#${k})">${ic}</g><path d="${d}" fill="none" stroke="${C}" stroke-width="${sw}" stroke-linejoin="round"/>`;
}
const E = {
  'agiz-kapali': cz(`M${f(cx - W * 0.7)},${f(y0 + D * 0.05)} Q${cx},${f(y0 + D * 0.26)} ${f(cx + W * 0.7 * uzak)},${f(y0 + D * 0.05)}`) + cz(`M${cx},${f(y0 - D * 0.2)} L${cx},${f(y0 + D * 0.15)}`, sw * 0.85),
  'agiz-az': acik('az', 0.45, 0.62, 0.12, 0, 0.3) + omega(),
  'agiz-orta': acik('orta', 0.78, 1.05, 0.1, 0, 0.42) + omega(),
  'agiz-yuvarlak': (() => { const e = `cx="${cx}" cy="${f(y0 + D * 0.5)}" rx="${f(W * 0.3)}" ry="${f(D * 0.42)}"`, k = `a34-${kim}-yuv`;
    return `<clipPath id="${k}"><ellipse ${e}/></clipPath><ellipse ${e} fill="${IC}"/><g clip-path="url(#${k})"><ellipse cx="${cx}" cy="${f(y0 + D * 0.92)}" rx="${f(W * 0.26)}" ry="${f(D * 0.22)}" fill="${DIL}"/></g><ellipse ${e} fill="none" stroke="${C}" stroke-width="${sw}"/>` + cz(`M${cx},${f(y0 - D * 0.2)} L${cx},${f(y0 + D * 0.08)}`, sw * 0.85); })(),
  'agiz-dis': acik('dis', 0.9, 0.62, 0.2, 0.16, 0) + cz(`M${cx},${f(y0 - D * 0.2)} L${cx},${f(y0 + D * 0.12)}`, sw * 0.85),
  'agiz-gulumse': omega(),
};
let t = fs.readFileSync(svgYol, 'utf8');
function grup(g) { const bas = t.indexOf(`<g id="${g}"`); if (bas < 0) return null; const son = t.indexOf('</g>', bas) + 4; return { bas, son }; }
for (const id of Object.keys(E)) { const r = grup(id); if (r) t = t.slice(0, t.lastIndexOf('\n', r.bas)) + t.slice(r.son); }
const r = grup('agiz');
t = t.slice(0, r.son) + Object.keys(E).map((id) => `\n  <g id="${id}" display="none">\n    ${E[id]}\n  </g>`).join('') + t.slice(r.son);
fs.writeFileSync(svgYol, t);
for (const y of jsonlar) { const j = JSON.parse(fs.readFileSync(y, 'utf8').replace(/^﻿/, ''));
  const i = j.sira.indexOf('agiz'); j.sira = j.sira.filter((s) => !(s in E)); j.sira.splice(i + 1, 0, ...Object.keys(E));
  j.gizli = [...new Set([...(j.gizli || []), ...Object.keys(E)])];
  for (const id of Object.keys(E)) { j.bagli[id] = 'kafa'; j.donme[id] = j.donme.agiz; }
  fs.writeFileSync(y, JSON.stringify(j, null, 2) + '\n'); }
console.log(kim, 'ok');
