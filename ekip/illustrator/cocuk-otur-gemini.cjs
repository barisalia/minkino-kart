// Çocuk bağdaş oturma pozu (Gemini çizimi): govde-oturma (gövde + kollar + kucak) ve bacak-oturma (ayak/ayakkabı kısmı, önde) gizli katmanları.
// Kaynak: ekip/cocuk/kaynak/<ad>-otur.webp (Gemini cocuk-poz/<ad>-otur-1.png, beyaz zemin silinmiş, 2048 tuval). Kafa ve baş eklentileri asıl iskeletten gelir.
// Ölçek: kafa genişliği asıl kafa katmanıyla eşit; hizalama: çene noktası asıl çeneye. Gövde çene-40 px'ten aşağısı (üstü asıl kafanın altında kalır, 30 px yumuşak geçiş).
// node cocuk-otur-gemini.cjs <ad>    (tekrar çalıştırmak güvenli; teslimden sonra yeniden çalıştırılır)
const fs = require('fs'); const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const ad = process.argv[2];
// k: ölçek (asıl kafa genişliği / Gemini kafa genişliği), xg/xo: kafa merkezi x (Gemini / asıl), yg/yo: çene y (Gemini / asıl), kes: ayak katmanının başladığı y (Gemini), gizle: oturunca gizlenen ek katmanlar
const P = {
  ada: { k: 530 / 474, xg: 1030, xo: 1024, yg: 969, yo: 689, kes: 1690, ust: -40, fade: 30, gizle: [] },
  can: { k: 824 / 782, xg: 1013, xo: 1008, yg: 1091, yo: 1013, kes: 1630, ust: 10, fade: 10, gizle: [] },
  elif: { k: 549 / 522, xg: 1039, xo: 1021, yg: 945, yo: 921, kes: 1650, ust: -40, fade: 150, gizle: [] },
}[ad];
const svgYol = `ekip/cocuk/${ad}.svg`, jsonYol = `ekip/cocuk/${ad}.json`;
let t = fs.readFileSync(svgYol, 'utf8'); const j = JSON.parse(fs.readFileSync(jsonYol, 'utf8').replace(/^\uFEFF/, ''));
function grup(metin, g) { const bas = metin.indexOf(`<g id="${g}"`); if (bas < 0) return null; const ic = metin.indexOf('>', bas) + 1; let der = 1; const re = /<g\b[^>]*?(\/?)>|<\/g>/g; re.lastIndex = ic;
  for (let m; (m = re.exec(metin)); ) { if (m[0] === '</g>') der--; else if (!m[1]) der++; if (der === 0) return { bas, ic, son: m.index, bitis: m.index + 4 }; } return null; }
(async () => {
  const kaynak = await s(`ekip/cocuk/kaynak/${ad}-otur.webp`).ensureAlpha().raw().toBuffer({ resolveWithObject: true }); const W = kaynak.info.width;
  const { k, xg, xo, yg, yo, kes } = P;
  // 2048 tuvalde ölçekle ve hizala: yeni(x,y) = (xo + (x-xg)*k, yo + (y-yg)*k)
  const sw = Math.round(W * k), ox = Math.round(xo - xg * k), oy = Math.round(yo - yg * k);
  const olcekli = await s(kaynak.data, { raw: { width: W, height: kaynak.info.height, channels: 4 } }).resize(sw, sw, { kernel: 'lanczos3' }).raw().toBuffer();
  const tuval = Buffer.alloc(2048 * 2048 * 4);
  for (let y = 0; y < sw; y++) { const Y = y + oy; if (Y < 0 || Y >= 2048) continue; for (let x = 0; x < sw; x++) { const X = x + ox; if (X < 0 || X >= 2048) continue; const a = (y * sw + x) * 4, b = (Y * 2048 + X) * 4; tuval[b] = olcekli[a]; tuval[b + 1] = olcekli[a + 1]; tuval[b + 2] = olcekli[a + 2]; tuval[b + 3] = olcekli[a + 3]; } }
  const yUst = Math.round(yo + P.ust), yKes = Math.round(yo + (kes - yg) * k);
  const parca = async (y0, y1, solukUst) => { const b = Buffer.from(tuval); for (let y = 0; y < 2048; y++) for (let x = 0; x < 2048; x++) { const i = (y * 2048 + x) * 4 + 3; if (y < y0 || y >= y1) b[i] = 0; else if (solukUst && y < y0 + P.fade) b[i] = Math.round(b[i] * (y - y0) / P.fade); }
    const tr = await s(b, { raw: { width: 2048, height: 2048, channels: 4 } }).png().toBuffer(); const kr = await s(tr).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
    const w = await s(kr.data).webp({ quality: 92, alphaQuality: 100, effort: 6 }).toBuffer(); return { x: -kr.info.trimOffsetLeft, y: -kr.info.trimOffsetTop, w: kr.info.width, h: kr.info.height, b64: w.toString('base64') }; };
  const govde = await parca(yUst, yKes, true), bacak = await parca(yKes, 2048, false);
  const img = (p) => `<image x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" xlink:href="data:image/webp;base64,${p.b64}"/>`;
  const E = { 'govde-oturma': img(govde), 'bacak-oturma': img(bacak) };
  for (const id of Object.keys(E)) { const r = grup(t, id); if (r) { const b = t.lastIndexOf('\n', r.bas); t = t.slice(0, b) + t.slice(r.bitis); } }
  const ek = (sonra, id) => { const r = grup(t, sonra); t = t.slice(0, r.bitis) + `\n  <g id="${id}" display="none">\n    ${E[id]}\n  </g>` + t.slice(r.bitis); };
  ek('govde', 'govde-oturma'); ek('govde-oturma', 'bacak-oturma');
  fs.writeFileSync(svgYol, t);
  const alt = yo + (1890 - yg) * k, ayakY = Math.max(...['bacak-sol', 'bacak-sag'].map((g) => { const r = grup(t, g); const m = t.slice(r.ic, r.son).match(/<image x="[\d.]+" y="([\d.]+)" width="[\d.]+" height="([\d.]+)"/); return +m[1] + +m[2]; }));
  const KAYMA = Math.round(ayakY - alt);
  const orta = j.donme.govde ? j.donme.govde[0] : 1024;
  for (const id of Object.keys(E)) { const sonra = id === 'govde-oturma' ? 'govde' : 'govde-oturma'; j.sira = j.sira.filter((x) => x !== id); j.sira.splice(j.sira.indexOf(sonra) + 1, 0, id); j.gizli = [...new Set([...(j.gizli || []), id])]; j.donme[id] = id === 'govde-oturma' ? j.donme.govde : [orta, yKes]; }
  j.sira = j.sira.filter((x) => x !== 'bacak-oturma'); j.sira.splice(j.sira.indexOf('govde-oturma') + 1, 0, 'bacak-oturma');
  j.oturma = { gizle: ['govde', 'bacak-sol', 'bacak-sag', 'kol-sol', 'kol-sag', ...P.gizle], goster: ['govde-oturma', 'bacak-oturma'], kayma: KAYMA, kaynak: `kaynak/${ad}-otur.webp` };
  fs.writeFileSync(jsonYol, JSON.stringify(j, null, 2) + '\n'); console.log(ad, 'kayma', KAYMA, 'govde', govde.w + 'x' + govde.h, 'bacak', bacak.w + 'x' + bacak.h);
})();
