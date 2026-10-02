// Can üzgün yüz (gizli): goz-uzgun (goz-sol + goz-sag yerine), kas-uzgun (kas yerine), agiz-uzgun (agiz yerine). Önden iskelet ekip/cocuk/can.svg/.json.
// goz-uzgun: asıl göz resimleri + dış köşeye doğru sarkan ten renkli üst kapak (koyu kontur) + büyük ıslak parlama + gözyaşı damlası.
// kas-uzgun: kaş resmi ikiye bölünür, iç uçlar yukarı gelecek biçimde ters yönlere döndürülür.
// agiz-uzgun: kapalı, aşağı kıvrık dudak + titrek alt dudak. Tekrar çalıştırmak güvenli. node can-uzgun.cjs
const fs = require('fs'); const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const svgYol = 'ekip/cocuk/can.svg', jsonYol = 'ekip/cocuk/can.json';
let t = fs.readFileSync(svgYol, 'utf8'); const j = JSON.parse(fs.readFileSync(jsonYol, 'utf8').replace(/^﻿/, ''));
function grup(metin, g) { const bas = metin.indexOf(`<g id="${g}"`); if (bas < 0) return null; const ic = metin.indexOf('>', bas) + 1; let der = 1; const re = /<g\b[^>]*?(\/?)>|<\/g>/g; re.lastIndex = ic;
  for (let m; (m = re.exec(metin)); ) { if (m[0] === '</g>') der--; else if (!m[1]) der++; if (der === 0) return { bas, ic, son: m.index, bitis: m.index + 4 }; } return null; }
const icerik = (g) => { const r = grup(t, g); return t.slice(r.ic, r.son).trim(); };
(async () => {
  // ten rengi: kafa resminden göz üstü
  const kf = icerik('kafa').match(/<image x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)" xlink:href="data:image\/\w+;base64,([^"]+)"/);
  const { data, info } = await s(Buffer.from(kf[5], 'base64')).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = (x, y) => { const k = (Math.round(y - +kf[2]) * info.width + Math.round(x - +kf[1])) * 4; return [data[k], data[k + 1], data[k + 2]]; };
  const ort = (pts) => { const a = [0, 0, 0]; for (const [x, y] of pts) { const p = px(x, y); for (let c = 0; c < 3; c++) a[c] += p[c]; } return a.map((v) => Math.round(v / pts.length)); };
  const hex = (r) => '#' + r.map((v) => v.toString(16).padStart(2, '0')).join('');
  const TEN = hex(ort([[860, 640], [900, 650], [830, 650], [1150, 650], [1200, 650], [1110, 650]]));
  const K = '#2B1010', f = (n) => Math.round(n * 10) / 10;
  console.log('ten', TEN);
  const kapak = (yon) => { // yon -1: sol göz (iç = sağ), +1: sağ göz (iç = sol)
    const x0 = yon < 0 ? 756 : 1070, x1 = yon < 0 ? 960 : 1276; const ic = yon < 0 ? x1 : x0, dis = yon < 0 ? x0 : x1;
    const yIc = 700, yDis = 748; const poly = [[x0, 640], [x1, 640], [x1, yon < 0 ? yIc : yDis], [x0, yon < 0 ? yDis : yIc]];
    return `<path d="M${poly.map((p) => p.join(',')).join(' L')} Z" fill="${TEN}"/>` +
      `<path d="M${ic},${yIc} Q${(ic + dis) / 2},${(yIc + yDis) / 2 - 6} ${dis},${yDis}" stroke="${K}" stroke-width="9" stroke-linecap="round" fill="none"/>`; };
  const parilti = (cx, cy) => `<ellipse cx="${cx}" cy="${cy}" rx="26" ry="20" fill="#fff"/><ellipse cx="${cx + 36}" cy="${cy + 40}" rx="11" ry="9" fill="#fff" opacity="0.9"/>`;
  const damla = (x, y) => `<path d="M${x},${y - 36} C${x + 10},${y - 18} ${x + 20},${y - 8} ${x + 20},${y + 5} A20,20 0 0 1 ${x - 20},${y + 5} C${x - 20},${y - 8} ${x - 10},${y - 18} ${x},${y - 36}Z" fill="#bfe6ff" stroke="#3b6fa3" stroke-width="5"/><ellipse cx="${x - 8}" cy="${y + 4}" rx="5" ry="8" fill="#fff"/>`;
  const E = {};
  E['goz-uzgun'] = icerik('goz-sol') + icerik('goz-sag') + kapak(-1) + kapak(1) + parilti(840, 755) + parilti(1160, 763) +
    `<path d="M780,812 Q860,832 940,806" stroke="#9fcfee" stroke-width="9" stroke-linecap="round" fill="none" opacity="0.8"/><path d="M1100,812 Q1180,834 1255,808" stroke="#9fcfee" stroke-width="9" stroke-linecap="round" fill="none" opacity="0.8"/>` + damla(812, 868);
  // kaş: asıl kaş resmi iki yarıya bölünür; sol kaşın iç ucu (sağ) yukarı: saat yönü döndür(+), sağ kaşın iç ucu (sol) yukarı: saat yönünün tersi (-)
  const kasImg = icerik('kas'); const kb = kasImg.match(/<image x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/); const [kx, ky, kw, kh] = kb.slice(1, 5).map(Number); const orta = j.donme.kas ? j.donme.kas[0] : kx + kw / 2;
  const yar = (id, x0, x1, merkez, aci) => `<clipPath id="${id}"><rect x="${x0}" y="${ky - 80}" width="${x1 - x0}" height="${kh + 160}"/></clipPath><g clip-path="url(#${id})"><g transform="translate(0,-14) rotate(${aci} ${merkez} ${ky + kh / 2})">${kasImg}</g></g>`;
  E['kas-uzgun'] = yar('cu-kl', kx - 40, orta, kx + 40, -15) + yar('cu-kr', orta, kx + kw + 40, kx + kw - 40, 15);
  const cx = 1020, cy = 900;
  E['agiz-uzgun'] = `<path d="M${cx - 92},${cy + 18} Q${cx - 40},${cy - 40} ${cx},${cy - 42} Q${cx + 40},${cy - 40} ${cx + 92},${cy + 18}" fill="none" stroke="#3B1210" stroke-width="14" stroke-linecap="round"/>` +
    `<path d="M${cx - 92},${cy + 18} q-8,-6 -14,-22 M${cx + 92},${cy + 18} q8,-6 14,-22" fill="none" stroke="#3B1210" stroke-width="10" stroke-linecap="round"/>` +
    `<path d="M${cx - 34},${cy + 36} Q${cx},${cy + 18} ${cx + 34},${cy + 36}" fill="none" stroke="#C9806D" stroke-width="9" stroke-linecap="round" opacity="0.7"/>`;
  for (const id of Object.keys(E)) { const r = grup(t, id); if (r) { const b = t.lastIndexOf('\n', r.bas); t = t.slice(0, b) + t.slice(r.bitis); } }
  const son = t.lastIndexOf('</svg>'); t = t.slice(0, son) + Object.keys(E).map((id) => `  <g id="${id}" display="none">\n    ${E[id]}\n  </g>\n`).join('') + t.slice(son);
  fs.writeFileSync(svgYol, t);
  const piv = { 'goz-uzgun': [1024, 740], 'kas-uzgun': j.donme.kas || [1024, 610], 'agiz-uzgun': j.donme.agiz };
  for (const id of Object.keys(E)) { j.sira = j.sira.filter((x) => x !== id); j.sira.push(id); j.gizli = [...new Set([...(j.gizli || []), id])]; j.bagli[id] = 'kafa'; j.donme[id] = piv[id]; }
  fs.writeFileSync(jsonYol, JSON.stringify(j, null, 2) + '\n'); console.log('ok');
})();
