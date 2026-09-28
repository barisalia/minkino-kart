// Pazar hayvanlarına (önden iskelet, ekip/pazar-musteri) dudak senkronu ağızları: agiz-kapali/az/orta/yuvarlak/dis/gulumse (gizli, kafaya bağlı, vektör).
// teslim.ps1 SVG'yi yeniden yazarsa tekrar çalıştırılır (idempotent). node pazar-agiz.cjs <kopek|tavsan|ayi|inek|maymun> <svg> <json...>
const fs = require('fs');
const [kim, svgYol, ...jsonlar] = process.argv.slice(2);
const f = (n) => Math.round(n * 10) / 10;
// stil 'yay': tek ağız çizgisi (L→R, orta noktası Cc'den geçer); 'omega': burundan inen çizgi + iki yay (tavşan, ayı)
const P = {
  kopek: { stil: 'yay', L: [893, 950], R: [1163, 957], Cc: [1028, 1017], kalin: 46, sw: 14, C: '#101010', IC: '#2a0e10', DIL: '#e0707a', DIS: '#f4f0f0', D: 62 },
  inek: { stil: 'yay', L: [888, 856], R: [1165, 836], Cc: [1022, 893], kalin: 0, sw: 15, C: '#401010', IC: '#401010', DIL: '#f0909a', DIS: '#fff6f6', D: 52, kanca: true },
  maymun: { stil: 'yay', L: [762, 800], R: [1092, 722], Cc: [925, 818], kalin: 0, sw: 9, C: '#4a2510', IC: '#5a1a10', DIL: '#e07060', DIS: '#fff2e0', D: 50, kanca: true },
  tavsan: { stil: 'omega', cx: 1025, y0: 1059, W: 112, tipUp: 20, botDY: 15, D: 62, sw: 8, C: '#502020', IC: '#702030', DIL: '#e08090', DIS: '#fafafa', filtrum: 24 },
  ayi: { stil: 'omega', cx: 1057, y0: 1012, W: 160, tipUp: 60, botDY: 6, D: 80, sw: 12, C: '#501010', IC: '#501010', DIL: '#f06060', DIS: '#f5ece4', filtrum: 30 },
}[kim];
const { C, IC, DIL, DIS, sw } = P;
const cz = (d, w = sw, ek = '') => `<path d="${d}" fill="none" stroke="${C}" stroke-width="${f(w)}" stroke-linecap="round" stroke-linejoin="round"${ek}/>`;
const ust = (a, b, t) => a + (b - a) * t;
let uid = 0;
// ortak: kırpılmış iç (iç rengi + üst diş şeridi + alt diş + dil) ve kontur
function lens(d, ic, kontur, ekstra) { const k = `pa-${kim}-${uid++}`;
  return `<clipPath id="${k}"><path d="${d}"/></clipPath><path d="${d}" fill="${IC}"/><g clip-path="url(#${k})">${ic}</g><path d="${d}" fill="none" stroke="${C}" stroke-width="${f(kontur)}" stroke-linejoin="round"/>${ekstra || ''}`; }
const E = {};

if (P.stil === 'yay') {
  const { L, R, Cc, kalin, D } = P; const ctrl = [2 * Cc[0] - (L[0] + R[0]) / 2, 2 * Cc[1] - (L[1] + R[1]) / 2];
  const B = (t, a = L, c = ctrl, b = R) => [(1 - t) * (1 - t) * a[0] + 2 * t * (1 - t) * c[0] + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * t * (1 - t) * c[1] + t * t * b[1]];
  const alt = (t1, t2) => { const q0 = B(t1), q2 = B(t2), q1 = [0, 1].map((i) => L[i] * (1 - t1) * (1 - t2) + ctrl[i] * ((1 - t1) * t2 + t1 * (1 - t2)) + R[i] * t1 * t2); return [q0, q1, q2]; };
  const yol = ([a, c, b]) => `M${f(a[0])},${f(a[1])} Q${f(c[0])},${f(c[1])} ${f(b[0])},${f(b[1])}`;
  const yolDevam = ([a, c, b]) => ` Q${f(c[0])},${f(c[1])} ${f(b[0])},${f(b[1])}`;
  // ağız çizgisi: ince → sw; kopekte kalın hilal (üst yay, alt yay orta noktada 'kalin' aşağıda)
  const hilal = (t1, t2, k) => { const [a, c, b] = alt(t1, t2); const cAlt = [c[0], c[1] + 2 * k]; return `M${f(a[0])},${f(a[1])} Q${f(c[0])},${f(c[1])} ${f(b[0])},${f(b[1])} Q${f(cAlt[0])},${f(cAlt[1])} ${f(a[0])},${f(a[1])} Z`; };
  const kanca = (t, yon) => { if (!P.kanca) return ''; const p = B(t), q = B(t + (yon > 0 ? -0.04 : 0.04)); const dx = p[0] - q[0], dy = p[1] - q[1], n = Math.hypot(dx, dy) || 1; return cz(`M${f(p[0])},${f(p[1])} q${f(dx / n * 8)},${f(dy / n * 8 - 12)} ${f(dx / n * 4 + (yon > 0 ? 4 : -4))},${f(dy / n * 4 - 24)}`, sw * 0.8); };
  const gulus = (t1, t2) => kalin ? `<path d="${hilal(t1, t2, kalin / 2)}" fill="${C}"/>` : cz(yol(alt(t1, t2))) + kanca(t2, 1) + (t1 < 0.05 ? kanca(t1, -1) : '');
  // açık ağız: üst kenar = yayın orta parçası, alt kenar aşağı sarkan yay (derinlik d)
  function acik(id, g, d, disUst, disAlt, dil) {
    const t1 = 0.5 - g / 2, t2 = 0.5 + g / 2, [a, c, b] = alt(t1, t2), mid = B(0.5), cAlt = [mid[0], mid[1] + 2 * d + (kalin ? kalin / 2 : 0)];
    const dd = `M${f(a[0])},${f(a[1])} Q${f(c[0])},${f(c[1])} ${f(b[0])},${f(b[1])} Q${f(cAlt[0])},${f(cAlt[1])} ${f(a[0])},${f(a[1])} Z`;
    let ic = ''; const w = b[0] - a[0], yb = mid[1] + d * 0.85;
    if (disUst) ic += `<rect x="${f(a[0])}" y="${f(Math.min(a[1], b[1]) - 10)}" width="${f(w)}" height="${f(Math.abs(mid[1] - Math.min(a[1], b[1])) + 10 + d * disUst)}" fill="${DIS}"/>`;
    if (disAlt) ic += `<ellipse cx="${f(mid[0])}" cy="${f(mid[1] + d * 1.15)}" rx="${f(w * 0.36)}" ry="${f(d * disAlt)}" fill="${DIS}"/>`;
    if (dil) ic += `<ellipse cx="${f(mid[0] + w * 0.05)}" cy="${f(mid[1] + d * 1.05)}" rx="${f(w * 0.3)}" ry="${f(d * dil)}" fill="${DIL}"/>`;
    return lens(dd, ic, sw * 0.9);
  }
  const yu = (() => { const m = B(0.5), rx = (R[0] - L[0]) * 0.075, ry = D * 0.62, cy = m[1] + ry * 0.55, e = `cx="${f(m[0])}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}"`, k = `pa-${kim}-yuv`;
    return `<clipPath id="${k}"><ellipse ${e}/></clipPath><ellipse ${e} fill="${IC}"/><g clip-path="url(#${k})"><ellipse cx="${f(m[0])}" cy="${f(cy + ry * 0.85)}" rx="${f(rx * 0.85)}" ry="${f(ry * 0.45)}" fill="${DIL}"/></g><ellipse ${e} fill="none" stroke="${C}" stroke-width="${f(sw * 0.9)}"/>`; })();
  E['agiz-kapali'] = kalin ? `<path d="${hilal(0.2, 0.8, kalin * 0.18)}" fill="${C}"/>` : cz(yol(alt(0.22, 0.78)), sw * 1.05);
  E['agiz-az'] = acik('az', 0.42, D * 0.42, 0.14, 0, 0.32) + (kalin ? '' : '');
  E['agiz-orta'] = acik('orta', 0.62, D * 0.98, 0.1, 0, 0.5);
  E['agiz-yuvarlak'] = yu;
  E['agiz-dis'] = acik('dis', 0.6, D * 0.55, 0.28, 0.2, 0);
  E['agiz-gulumse'] = gulus(0, 1);
} else { // omega
  const { cx, y0, W, tipUp, botDY, D, filtrum } = P;
  const om = (k = 1, dy = 0) => { const tipY = y0 - tipUp * k + dy, ctrl = y0 + 2 * botDY * k + (tipUp * k) / 2 + dy - 0 * 0, xl = cx - W * k, xr = cx + W * k;
    return `M${f(xl)},${f(tipY)} Q${f(cx - W * k / 2)},${f(ctrl)} ${cx},${f(y0 + dy)} Q${f(cx + W * k / 2)},${f(ctrl)} ${f(xr)},${f(tipY)}`; };
  const fil = (dy = 0) => cz(`M${cx},${f(y0 - filtrum)} L${cx},${f(y0 + dy)}`, sw * 0.9);
  function acik(id, k, d, disUst, disAlt, dil) {
    const tipY = y0 - tipUp * k, xl = cx - W * k, xr = cx + W * k, ctrl = y0 + 2 * botDY * k + (tipUp * k) / 2, bot = y0 + d;
    const dd = `${om(k)} C${f(xr)},${f(bot - d * 0.15)} ${f(cx + W * k * 0.55)},${f(bot)} ${cx},${f(bot)} C${f(cx - W * k * 0.55)},${f(bot)} ${f(xl)},${f(bot - d * 0.15)} ${f(xl)},${f(tipY)} Z`;
    let ic = '';
    if (disUst) ic += `<rect x="${f(xl)}" y="${f(tipY - 10)}" width="${f(xr - xl)}" height="${f(tipY - tipY + 10 + (y0 - tipY) + d * disUst)}" fill="${DIS}"/>`;
    if (disAlt) ic += `<ellipse cx="${cx}" cy="${f(bot)}" rx="${f(W * k * 0.7)}" ry="${f(d * disAlt)}" fill="${DIS}"/>`;
    if (dil) ic += `<ellipse cx="${f(cx + W * k * 0.05)}" cy="${f(bot - d * 0.05)}" rx="${f(W * k * 0.55)}" ry="${f(d * dil)}" fill="${DIL}"/>`;
    return lens(dd, ic, sw * 0.9, fil());
  }
  const yu = (() => { const rx = W * 0.2, ry = D * 0.5, cy = y0 + ry * 0.55, e = `cx="${cx}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}"`, k = `pa-${kim}-yuv`;
    return `<clipPath id="${k}"><ellipse ${e}/></clipPath><ellipse ${e} fill="${IC}"/><g clip-path="url(#${k})"><ellipse cx="${cx}" cy="${f(cy + ry * 0.85)}" rx="${f(rx * 0.85)}" ry="${f(ry * 0.45)}" fill="${DIL}"/></g><ellipse ${e} fill="none" stroke="${C}" stroke-width="${f(sw * 0.9)}"/>` + fil(0); })();
  E['agiz-kapali'] = cz(`M${f(cx - W * 0.62)},${f(y0 + botDY * 0.4)} Q${cx},${f(y0 + botDY * 1.9)} ${f(cx + W * 0.62)},${f(y0 + botDY * 0.4)}`, sw * 1.05) + fil(botDY);
  E['agiz-az'] = acik('az', 0.42, D * 0.4, 0.14, 0, 0.3);
  E['agiz-orta'] = acik('orta', 0.78, D * 1.0, 0.1, 0, 0.46);
  E['agiz-yuvarlak'] = yu;
  E['agiz-dis'] = acik('dis', 0.72, D * 0.5, 0.26, 0.2, 0);
  E['agiz-gulumse'] = cz(om(1)) + fil();
}

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
console.log(kim, 'ok');
