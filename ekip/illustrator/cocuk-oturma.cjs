// Çocuk (Ada, Can, Elif ...) yere oturma pozu: gizli govde-oturma + bacak-oturma (önden iskelet, ekip/cocuk/<ad>.svg/.json).
// Önden yere oturan çocuk: kalça yerde, bacaklar KAMERAYA doğru uzanır (kısalmış), ayaklar dışa açık, ayakkabı TABANLARI bize dönük (tabanın altı görünür), etek/şort kalçanın çevresinde.
// bacak-oturma = iki vektör bacak: giysi kenarının altından çıkan kısa kalın tüp (bacak resminden örneklenen ten rengi) + bize dönük ayakkabı tabanı (bacak resminin ayakkabı renginden).
// govde-oturma = aynı gövde resmi. Karakter json "oturma.kayma" kadar aşağı alınır (kalça yere iner).
// node cocuk-oturma.cjs <ad> [dusme=0.20] [aci=18] [acilma=0.06]   (dusme: ayak tabanının kalçadan öne uzaklığı, bacak boyu oranı; tekrar çalıştırmak güvenli)
const fs = require('fs'); const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const [ad, dS = '0.30', aS = '18', xS = '0.06'] = process.argv.slice(2); const DUSME = +dS, ACI = +aS, ACILMA = +xS;
const svgYol = `ekip/cocuk/${ad}.svg`, jsonYol = `ekip/cocuk/${ad}.json`;
let t = fs.readFileSync(svgYol, 'utf8'); const j = JSON.parse(fs.readFileSync(jsonYol, 'utf8').replace(/^﻿/, ''));
function grup(metin, g) { const bas = metin.indexOf(`<g id="${g}"`); if (bas < 0) return null; const ic = metin.indexOf('>', bas) + 1; let der = 1; const re = /<g\b[^>]*?(\/?)>|<\/g>/g; re.lastIndex = ic;
  for (let m; (m = re.exec(metin)); ) { if (m[0] === '</g>') der--; else if (!m[1]) der++; if (der === 0) return { bas, ic, son: m.index, bitis: m.index + 4 }; } return null; }
const icerik = (g) => { const r = grup(t, g); return t.slice(r.ic, r.son).trim(); };
const gorsel = (g) => { const m = icerik(g).match(/<image x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)" xlink:href="data:image\/\w+;base64,([^"]+)"/); return { x: +m[1], y: +m[2], w: +m[3], h: +m[4], buf: Buffer.from(m[5], 'base64') }; };
const f = (n) => Math.round(n * 10) / 10, hex = (r) => '#' + r.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
(async () => {
  const sol = gorsel('bacak-sol'), sag = gorsel('bacak-sag');
  const kalcaY = Math.min(sol.y, sag.y), ayakY = Math.max(sol.y + sol.h, sag.y + sag.h), L = ayakY - kalcaY;
  // renkler: bacak resminin orta yüksekliğinden ten, alt %10'undan (tene benzemeyen, çok koyu olmayan) ayakkabı
  const { data, info } = await s(sol.buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true }); const W = info.width, H = info.height;
  const med = (a) => { const o = [0, 0, 0]; for (let c = 0; c < 3; c++) { const v = a.map((p) => p[c]).sort((x, y) => x - y); o[c] = v[v.length >> 1]; } return o; };
  const ten = []; for (let y = Math.round(H * 0.15); y < Math.round(H * 0.28); y++) for (let x = Math.round(W * 0.35); x < Math.round(W * 0.65); x++) { const k = (y * W + x) * 4; if (data[k + 3] > 250) ten.push([data[k], data[k + 1], data[k + 2]]); }
  const TEN = med(ten);
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const ay = []; for (let y = Math.round(H * 0.9); y < H; y++) for (let x = 0; x < W; x++) { const k = (y * W + x) * 4; if (data[k + 3] < 250) continue; const p = [data[k], data[k + 1], data[k + 2]]; const l = (p[0] * 3 + p[1] * 6 + p[2]) / 10; if (dist(p, TEN) > 70 && l > 70) ay.push(p); }
  let AYK = ay.length > 30 ? med(ay) : [200, 50, 60]; if (ad === 'can') AYK = [240, 234, 232];   // Can: beyaz spor ayakkabı (taban açık, kenarı pembe)
  const KONT = '#3A1812', TABAN = hex(AYK.map((v) => v * 0.78)), TABAN2 = ad === 'can' ? '#E58A8E' : hex(AYK.map((v) => v * 0.6)), PARLA = hex(AYK.map((v) => Math.min(255, v * 1.18 + 12)));
  console.log(ad, 'ten', hex(TEN), 'ayakkabi', hex(AYK));
  const HEM = { ada: 1595, can: 1500, elif: 1522 }; const hemY = HEM[ad] || kalcaY + 0.28 * L;   // giysinin görünen alt ucu (ayakta çizimden ölçüldü)
  const rx0 = L * 0.125, ry0 = L * 0.16, solUst = hemY - L * 0.03 + L * DUSME * 0.3, solY = solUst + ry0, bilekY = solY - ry0 * 0.5;
  const bac = (b, yon) => {
    const orta = (sol.x + sol.w / 2 + sag.x + sag.w / 2) / 2, hx = orta + yon * L * 0.15, hy = hemY - L * 0.12, ax = hx + yon * L * 0.05, ay2 = bilekY;
    const tw = L * 0.19, rx = rx0, ry = ry0;
    const d = `M${f(hx)},${f(hy)} L${f(ax)},${f(ay2)}`;
    return `<path d="${d}" stroke="${KONT}" stroke-width="${f(tw + 9)}" stroke-linecap="round" fill="none"/><path d="${d}" stroke="${hex(TEN)}" stroke-width="${f(tw)}" stroke-linecap="round" fill="none"/>` +
      `<g transform="translate(${f(ax)},${f(solY)}) rotate(${yon * ACI})">` +
      `<ellipse cx="0" cy="0" rx="${f(rx)}" ry="${f(ry)}" fill="${TABAN}" stroke="${KONT}" stroke-width="7"/>` +
      `<path d="M${f(-rx * 0.78)},${f(ry * 0.28)} Q0,${f(ry * 0.5)} ${f(rx * 0.78)},${f(ry * 0.28)}" fill="none" stroke="${TABAN2}" stroke-width="6" stroke-linecap="round"/>` +
      `<ellipse cx="0" cy="${f(-ry * 0.38)}" rx="${f(rx * 0.62)}" ry="${f(ry * 0.34)}" fill="${PARLA}" opacity="0.8"/>` +
      `<ellipse cx="0" cy="${f(ry * 0.66)}" rx="${f(rx * 0.55)}" ry="${f(ry * 0.14)}" fill="${TABAN2}" opacity="0.7"/></g>`;
  };
  const E = { 'govde-oturma': icerik('govde'), 'bacak-oturma': bac(sol, -1) + bac(sag, 1) };
  for (const id of Object.keys(E)) { const r = grup(t, id); if (r) { const b = t.lastIndexOf('\n', r.bas); t = t.slice(0, b) + t.slice(r.bitis); } }
  const ek = (sonra, id) => { const r = grup(t, sonra); t = t.slice(0, r.bitis) + `\n  <g id="${id}" display="none">\n    ${E[id]}\n  </g>` + t.slice(r.bitis); };
  ek('bacak-sag', 'bacak-oturma'); ek('govde', 'govde-oturma');
  fs.writeFileSync(svgYol, t);
  const KAYMA = Math.round(ayakY - (solY + ry0));
  const orta = j.donme.govde ? j.donme.govde[0] : 1024;
  for (const id of Object.keys(E)) { const sonra = id === 'govde-oturma' ? 'govde' : 'bacak-sag'; j.sira = j.sira.filter((x) => x !== id); j.sira.splice(j.sira.indexOf(sonra) + 1, 0, id);
    j.gizli = [...new Set([...(j.gizli || []), id])]; j.donme[id] = id === 'govde-oturma' ? j.donme.govde : [orta, hemY]; }
  j.oturma = { gizle: ['govde', 'bacak-sol', 'bacak-sag'], goster: ['govde-oturma', 'bacak-oturma'], kayma: KAYMA };
  fs.writeFileSync(jsonYol, JSON.stringify(j, null, 2) + '\n'); console.log(ad, 'kalcaY', kalcaY, 'ayakY', ayakY, 'L', L, 'kayma', KAYMA);
})();
