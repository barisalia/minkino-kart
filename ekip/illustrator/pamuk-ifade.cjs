// Pamuk ifadeleri (gizli, vektör, kafaya bağlı): utanmış, üzgün, mutlu + düşük kulaklar. teslim.ps1 sonrası pamuk-agiz.cjs'den SONRA çalıştırılır (idempotent).
// utanmış: yanak-utanmis (iri pembe yanaklar + çizgiler), goz-utanmis (yarı kapalı, aşağı bakan gözler), agiz-utanmis (küçük dalgalı ağız); + kulak-*-dusuk
// üzgün:   goz-uzgun (kapaklar dış köşeden aşağı, ıslak gözler, gözyaşı), agiz-uzgun (aşağı kıvrık küçük ağız); + kulak-*-dusuk
// mutlu:   goz-mutlu (^ ^ gözler), agiz-mutlu (büyük açık gülüş), yanak-mutlu (hafif allık)
// kulak-sol-dusuk / kulak-sag-dusuk: asıl kulak resimleri tabanından 32° dışa yatmış (kulak-sol / kulak-sag yerine gösterilir, kafanın arkasında).
// node pamuk-ifade.cjs [svg=ekip/pamuk/pamuk-final.svg] [json...]
const fs = require('fs');
const svgYol = process.argv[2] || 'ekip/pamuk/pamuk-final.svg';
const jsonlar = process.argv.length > 3 ? process.argv.slice(3) : ['ekip/pamuk/pamuk-final.json', 'ekip/film/cizim/pamuk-final.json'];
let t = fs.readFileSync(svgYol, 'utf8');
function grup(metin, g) { const bas = metin.indexOf(`<g id="${g}"`); if (bas < 0) return null; const ic = metin.indexOf('>', bas) + 1; let der = 1; const re = /<g\b[^>]*?(\/?)>|<\/g>/g; re.lastIndex = ic;
  for (let m; (m = re.exec(metin)); ) { if (m[0] === '</g>') der--; else if (!m[1]) der++; if (der === 0) return { bas, ic, son: m.index, bitis: m.index + 4 }; } return null; }
const icerik = (g) => { const r = grup(t, g); return t.slice(r.ic, r.son).trim(); };
const f = (n) => Math.round(n * 10) / 10;
const K = '#4A2020', C = '#140A0A', PEMBE = '#F59BAB', PEMBE2 = '#E36F8C', IC = '#6E0A1E', DIL = '#F08088', CX = 1010, Y0 = 959, SW = 14;
const cz = (d, w = SW, renk = C, ek = '') => `<path d="${d}" fill="none" stroke="${renk}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${ek}/>`;
let u = 0; const kid = (p) => `pf-${p}-${u++}`;
const goz = { sol: icerik('goz-sol'), sag: icerik('goz-sag') };
// göz + kapak: göz resmi kapak çizgisinin ALTINDA kalır; kapak çizgisi koyu kahve, dış köşede kirpik fırçaları
const kapakli = (yan, dy, a, b, c, kirpik) => { // a: dış köşe, b: iç köşe (x,y), c: kontrol noktası; dy: göz kayması
  const k = kid('kapak'), yol = `M${a[0]},${a[1]} Q${c[0]},${c[1]} ${b[0]},${b[1]}`;
  const alt = `M${a[0] - 30},${a[1] + 400} L${a[0] - 30},${a[1]} Q${c[0]},${c[1]} ${b[0] + 30},${b[1]} L${b[0] + 30},${b[1] + 400} Z`;
  const [kx, ky, dx, dy2] = kirpik;
  return `<clipPath id="${k}"><path d="${alt}"/></clipPath><g clip-path="url(#${k})"><g transform="translate(0,${dy})">${goz[yan]}</g></g>` +
    cz(yol, 17, K) + cz(`M${kx},${ky} l${dx},${dy2}`, 9, K) + cz(`M${kx + dx * 0.3},${ky + 26} l${dx * 1.05},${dy2 + 6}`, 8, K);
};
const damla = (x, y, r = 24) => `<path d="M${x},${y - r * 1.8} C${x + r * 0.5},${y - r} ${x + r},${y - r * 0.5} ${x + r},${y} A${r},${r} 0 0 1 ${x - r},${y} C${x - r},${y - r * 0.5} ${x - r * 0.5},${y - r} ${x},${y - r * 1.8}Z" fill="#BFE6FF" stroke="#3B6FA3" stroke-width="6"/><ellipse cx="${x - r * 0.35}" cy="${y + r * 0.1}" rx="${r * 0.2}" ry="${r * 0.35}" fill="#fff"/>`;
const omega = (k, dy) => { const xl = CX - 110 * k, xr = CX + 112 * k, ty = 958 + (1 - k) * 28 + dy, cy = 1038 + dy - (1 - k) * 20;
  return cz(`M${f(xl)},${f(ty)} Q${f(CX - 55 * k)},${f(cy)} ${CX},${Y0 + dy} Q${f(CX + 56 * k)},${f(cy)} ${f(xr)},${f(ty)}`); };
const acik = (a, b, ust, alt, dil) => { const k = kid('agiz'), d = `M${a},${ust} Q${CX},${ust + 8} ${b},${ust} C${b - 6},${f(ust + (alt - ust) * 0.85)} ${f(CX + (b - CX) * 0.5)},${alt} ${CX},${alt} C${f(CX - (CX - a) * 0.5)},${alt} ${a + 6},${f(ust + (alt - ust) * 0.85)} ${a},${ust} Z`;
  return `<clipPath id="${k}"><path d="${d}"/></clipPath><path d="${d}" fill="${IC}"/><g clip-path="url(#${k})"><ellipse cx="${CX + 6}" cy="${alt - 4}" rx="${f((b - a) * 0.3)}" ry="${f((alt - ust) * dil)}" fill="${DIL}"/></g><path d="${d}" fill="none" stroke="${C}" stroke-width="${SW - 2}" stroke-linejoin="round"/>`; };
const yanak = (op, cizgi) => [[705, 1035], [1315, 1035]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="125" ry="56" fill="${PEMBE}" opacity="${op}"/>` +
  (cizgi ? [-34, 0, 34].map((o) => cz(`M${x + o - 14},${y + 20} l22,-34`, 8, PEMBE2)).join('') : '')).join('');
const E = {};
// UTANMIŞ
E['yanak-utanmis'] = yanak(0.92, true);
E['goz-utanmis'] = kapakli('sol', 30, [585, 836], [955, 790], [770, 704], [570, 818, -46, -14]) + kapakli('sag', 30, [1435, 836], [1065, 790], [1250, 704], [1450, 818, 46, -14]);
E['agiz-utanmis'] = cz(`M${CX - 62},1012 q${31},${-22} ${62},0 q${31},${22} ${62},0`, SW) + cz(`M${CX},952 L${CX},${Y0 + 32}`, SW * 0.8);
// ÜZGÜN: kapaklar dış köşeden aşağı, iç köşe yukarı
E['goz-uzgun'] = kapakli('sol', 0, [585, 842], [950, 742], [770, 716], [570, 825, -44, -4]) + kapakli('sag', 0, [1435, 842], [1070, 742], [1250, 716], [1450, 825, 44, -4]) +
  `<ellipse cx="715" cy="880" rx="26" ry="18" fill="#fff" opacity="0.9"/><ellipse cx="1205" cy="880" rx="26" ry="18" fill="#fff" opacity="0.9"/>` +
  cz(`M650,968 Q770,992 900,962`, 9, '#9FCFEE', ' opacity="0.85"') + cz(`M1120,962 Q1250,992 1370,968`, 9, '#9FCFEE', ' opacity="0.85"') + damla(640, 1040);
E['agiz-uzgun'] = cz(`M${CX - 66},1038 Q${CX - 30},994 ${CX},992 Q${CX + 30},994 ${CX + 66},1038`, SW) + cz(`M${CX},952 L${CX},992`, SW * 0.8);
// MUTLU
E['goz-mutlu'] = cz(`M640,880 Q770,720 900,880`, 24, K) + cz(`M1120,880 Q1250,720 1380,880`, 24, K) +
  cz(`M628,846 l-46,-26 M642,818 l-34,-44`, 9, K) + cz(`M1392,846 l46,-26 M1378,818 l34,-44`, 9, K);
E['agiz-mutlu'] = acik(CX - 104, CX + 106, 998, 1092, 0.5) + omega(1.0, 0);
E['yanak-mutlu'] = yanak(0.55, false);
// düşük kulaklar: asıl kulak katmanları tabanından dışa yatık
// kulak katmanı başın dışında kalan hilal parçası; kafa kubbesi ≈ daire (merkez 1005,830) → kulak bu merkez etrafında dönünce kesik kenar baş çizgisi boyunca kayar
const kulak = (id, a) => `<g transform="rotate(${a} 1005 830)">${icerik(id)}</g>`;
const KUL = { 'kulak-sol-dusuk': kulak('kulak-sol', -24), 'kulak-sag-dusuk': kulak('kulak-sag', 24) };
// kafa katmanının üstündeki kulak çizgisi kalıntıları (kısa çizikler): kubbe çizgisinin dışına taşan dar çıkıntılar, açma (erode+dilate) ile silinir
async function kafaTemizle(metin) {
  const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
  const m = metin.match(/<image x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)" xlink:href="data:image\/webp;base64,([^"]+)"/g).map((x) => x.match(/x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)" xlink:href="data:image\/webp;base64,([^"]+)"/)).find((x) => +x[3] > 1200 && +x[4] > 900 && +x[4] < 1000);
  if (!m) return metin;
  const W = +m[3], H = +m[4], { data } = await s(Buffer.from(m[5], 'base64')).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const R = 10, Y = 220, YS = 150, ofs = []; for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) if (dx * dx + dy * dy <= R * R) ofs.push([dx, dy]);
  const a = (x, y) => (x < 0 || y < 0 || x >= W ? 0 : y >= Y + R + 2 ? 1 : data[(y * W + x) * 4 + 3] >= 128 ? 1 : 0);
  const er = new Uint8Array(W * (Y + 2 * R + 4));
  for (let y = 0; y < Y + R + 2; y++) for (let x = 0; x < W; x++) { let ok = 1; for (const [dx, dy] of ofs) if (!a(x + dx, y + dy)) { ok = 0; break; } er[y * W + x] = ok; }
  const op = new Uint8Array(W * Y);
  for (let y = 0; y < Y; y++) for (let x = 0; x < W; x++) { let ok = 0; for (const [dx, dy] of ofs) { const xx = x + dx, yy = y + dy; if (xx >= 0 && xx < W && yy >= 0 && yy < Y + R + 2 && er[yy * W + xx]) { ok = 1; break; } } op[y * W + x] = ok; }
  let sil = 0;
  for (let y = 0; y < YS; y++) for (let x = 0; x < W; x++) { const k = (y * W + x) * 4; if (data[k + 3] === 0) continue; let yakin = 0;
    for (let dy = -1; dy <= 1 && !yakin; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && xx < W && yy >= 0 && yy < Y && op[yy * W + xx]) { yakin = 1; break; } }
    if (!yakin) { data[k + 3] = 0; sil++; } }
  if (!sil) return metin;
  const webp = await s(data, { raw: { width: W, height: H, channels: 4 } }).webp({ lossless: true }).toBuffer();
  console.log('kafa kalinti pikseli silindi:', sil); return metin.replace(m[5], webp.toString('base64'));
}
for (const id of [...Object.keys(E), ...Object.keys(KUL)]) { const r = grup(t, id); if (r) { const b = t.lastIndexOf('\n', r.bas); t = t.slice(0, b) + t.slice(r.bitis); } }
const rk = grup(t, 'kulak-sag'); t = t.slice(0, rk.bitis) + Object.keys(KUL).map((id) => `\n  <g id="${id}" display="none">\n    ${KUL[id]}\n  </g>`).join('') + t.slice(rk.bitis);
const ra = grup(t, 'agiz-gulumse'); t = t.slice(0, ra.bitis) + Object.keys(E).map((id) => `\n  <g id="${id}" display="none">\n    ${E[id]}\n  </g>`).join('') + t.slice(ra.bitis);
(async () => {
t = await kafaTemizle(t);
fs.writeFileSync(svgYol, t);
for (const y of jsonlar) { if (!fs.existsSync(y)) continue; const j = JSON.parse(fs.readFileSync(y, 'utf8').replace(/^﻿/, ''));
  const hepsi = [...Object.keys(E), ...Object.keys(KUL)]; j.sira = j.sira.filter((s) => !hepsi.includes(s));
  j.sira.splice(j.sira.indexOf('kulak-sag') + 1, 0, ...Object.keys(KUL)); j.sira.splice(j.sira.indexOf('agiz-gulumse') + 1, 0, ...Object.keys(E));
  j.gizli = [...new Set([...(j.gizli || []), ...hepsi])];
  for (const id of hepsi) { j.bagli[id] = 'kafa'; }
  for (const id of Object.keys(E)) j.donme[id] = id.startsWith('goz') ? j.donme['goz-kapali'] : j.donme.agiz;
  j.donme['kulak-sol-dusuk'] = j.donme['kulak-sol']; j.donme['kulak-sag-dusuk'] = j.donme['kulak-sag'];
  j.ifadeler = { utanmis: { goster: ['yanak-utanmis', 'goz-utanmis', 'agiz-utanmis', 'kulak-sol-dusuk', 'kulak-sag-dusuk'], gizle: ['goz-sol', 'goz-sag', 'agiz', 'kulak-sol', 'kulak-sag'] },
    uzgun: { goster: ['goz-uzgun', 'agiz-uzgun', 'kulak-sol-dusuk', 'kulak-sag-dusuk'], gizle: ['goz-sol', 'goz-sag', 'agiz', 'kulak-sol', 'kulak-sag'] },
    mutlu: { goster: ['goz-mutlu', 'agiz-mutlu', 'yanak-mutlu'], gizle: ['goz-sol', 'goz-sag', 'agiz'] } };
  fs.writeFileSync(y, JSON.stringify(j, null, 2) + '\n'); }
console.log('pamuk ifade ok');
})();
