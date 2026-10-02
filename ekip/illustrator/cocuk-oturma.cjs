// Çocuk (Ada, Can, Elif ...) oturma pozu: gizli govde-oturma + bacak-oturma katmanları (önden iskelet, ekip/cocuk/<ad>.svg/.json).
// Oturunca bacaklar kameraya doğru uzanır, etek altından yalnız baldır + ayakkabı görünür: bacak-oturma = iki bacak resminin ALT kısmı (bant), ezilmeden,
// etek hizasına çekilir ve kalçadan hafifçe dışa açılır. govde-oturma = aynı gövde resmi (kucak zaten eteğin altında). Karakter json "oturma.kayma" kadar aşağı alınır.
// node cocuk-oturma.cjs <ad> [bant=0.40] [aci=9] [acilma=40]    (bant: bacağın alt oranı; teslimden sonra yeniden çalıştırılabilir)
const fs = require('fs');
const [ad, bantS = '0.40', aciS = '9', acilmaS = '40'] = process.argv.slice(2);
const BANT = +bantS, ACI = +aciS, ACILMA = +acilmaS;
const svgYol = `ekip/cocuk/${ad}.svg`, jsonYol = `ekip/cocuk/${ad}.json`;
let t = fs.readFileSync(svgYol, 'utf8'); const j = JSON.parse(fs.readFileSync(jsonYol, 'utf8').replace(/^﻿/, ''));
function grup(metin, g) { const bas = metin.indexOf(`<g id="${g}"`); if (bas < 0) return null; const ic = metin.indexOf('>', bas) + 1; let der = 1; const re = /<g\b[^>]*?(\/?)>|<\/g>/g; re.lastIndex = ic;
  for (let m; (m = re.exec(metin)); ) { if (m[0] === '</g>') der--; else if (!m[1]) der++; if (der === 0) return { bas, ic, son: m.index, bitis: m.index + 4 }; } return null; }
const icerik = (g) => { const r = grup(t, g); return t.slice(r.ic, r.son).trim(); };
const kutu = (g) => { const r = grup(t, g); const m = t.slice(r.ic, r.son).match(/<image x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/); return m.slice(1, 5).map(Number); };
const [, sy, , sh] = kutu('bacak-sol'), [, gy, , gh] = kutu('bacak-sag');
const kalcaY = Math.min(sy, gy), ayakY = Math.max(sy + sh, gy + gh);
const L = ayakY - kalcaY, bantY = ayakY - L * BANT, ustY = kalcaY - 30;          // bant üstü, etek ardında kalacak biçimde kalçadan 30 px yukarı çekilir
const KAYMA = Math.round(ayakY - (ustY + (ayakY - bantY)));                       // karakter aşağı alınır: tabanlar yine zeminde
let cid = 0;
const bac = (id, yon) => {
  const k = `ct-${ad}-${cid++}`, [bx, , bw] = kutu(id), merkez = bx + bw / 2;
  return `<clipPath id="${k}"><rect x="0" y="${bantY}" width="2048" height="${ayakY - bantY + 20}"/></clipPath>` +
    `<g transform="translate(${yon * ACILMA},${ustY - bantY}) rotate(${yon * ACI} ${merkez} ${bantY})"><g clip-path="url(#${k})">${icerik(id)}</g></g>`;
};
const E = { 'govde-oturma': icerik('govde'), 'bacak-oturma': bac('bacak-sol', -1) + bac('bacak-sag', 1) };
for (const id of Object.keys(E)) { const r = grup(t, id); if (r) { const b = t.lastIndexOf('\n', r.bas); t = t.slice(0, b) + t.slice(r.bitis); } }
// sıra: govde-oturma govde'nin, bacak-oturma bacak-sag'ın hemen arkasında (kollar ve kafa üstte kalır)
const ek = (sonra, id) => { const r = grup(t, sonra); t = t.slice(0, r.bitis) + `\n  <g id="${id}" display="none">\n    ${E[id]}\n  </g>` + t.slice(r.bitis); };
ek('bacak-sag', 'bacak-oturma'); ek('govde', 'govde-oturma');
fs.writeFileSync(svgYol, t);
const orta = j.donme.govde ? j.donme.govde[0] : 1024;
for (const id of Object.keys(E)) { const sonra = id === 'govde-oturma' ? 'govde' : 'bacak-sag'; j.sira = j.sira.filter((s) => s !== id); j.sira.splice(j.sira.indexOf(sonra) + 1, 0, id);
  j.gizli = [...new Set([...(j.gizli || []), id])]; j.donme[id] = id === 'govde-oturma' ? j.donme.govde : [orta, ustY]; }
j.oturma = { gizle: ['govde', 'bacak-sol', 'bacak-sag'], goster: ['govde-oturma', 'bacak-oturma'], kayma: KAYMA, bant: BANT };
fs.writeFileSync(jsonYol, JSON.stringify(j, null, 2) + '\n');
console.log(ad, 'kalcaY', kalcaY, 'ayakY', ayakY, 'L', L, 'kayma', KAYMA);
