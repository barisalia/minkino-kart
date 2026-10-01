// Mino oturma: govde-oturma (gövde bacaksız + kucak/uyluk + öne uzanan iki pati), kuyruk-oturma (yere yatık kuyruk). Gizli.
// node oturma.cjs <girdi.svg> <cikti.svg>
const fs = require('fs');
const [girdi, cikti] = process.argv.slice(2);
let t = fs.readFileSync(girdi, 'utf8');
const K = '#3a1210', KURK = '#fa9e3c', KURK2 = '#e07a2e', KREM = '#e8dfd0', KREM2 = '#e6cdb5', SW = 15;
function grup(metin, g) { const bas = metin.indexOf(`<g id="${g}"`); if (bas < 0) return null; const ic = metin.indexOf('>', bas) + 1; let der = 1; const re = /<g\b[^>]*?(\/?)>|<\/g>/g; re.lastIndex = ic;
  for (let m; (m = re.exec(metin)); ) { if (m[0] === '</g>') der--; else if (!m[1]) der++; if (der === 0) return { bas, ic, son: m.index, bitis: m.index + 4 }; } }
const icerik = (g) => { const r = grup(t, g); return t.slice(r.ic, r.son).trim(); };
const KES = +(process.env.KES || 1672);   // gövde bu y'nin altında kesilir (bacaklar gider)
// kucak: gövdenin altında iki yana taşan uyluklar, altta düz oturma çizgisi
const KUCAK = 'M808,1560 C772,1616 742,1676 738,1726 C734,1770 764,1796 820,1800 L1220,1800 C1280,1796 1310,1770 1304,1724 C1298,1674 1270,1614 1236,1560 Z';
const GOLGE = 'M738,1740 C760,1706 800,1700 850,1712 C930,1734 1110,1734 1190,1712 C1240,1700 1284,1706 1306,1740 L1306,1810 L738,1810 Z';
// uyluk kıvrımı: gövdenin yan konturu kesimde biter, uyluğun üstünde kısa kıvrım çizgisi devam eder
const KIVRIM = 'M805,1660 C810,1712 832,1740 862,1752 M1229,1660 C1226,1712 1210,1740 1182,1752';
function pati(cx, ayna) { const s = ayna ? -1 : 1, X = (x) => cx + s * x;
  const d = `M${X(-80)},${1790} C${X(-86)},${1744} ${X(-50)},${1714} ${X(0)},${1714} C${X(50)},${1714} ${X(86)},${1744} ${X(80)},${1790} C${X(76)},${1824} ${X(44)},${1836} ${X(0)},${1836} C${X(-44)},${1836} ${X(-76)},${1824} ${X(-80)},${1790} Z`;
  const alt = `M${X(-80)},${1790} C${X(-60)},${1808} ${X(60)},${1808} ${X(80)},${1790} C${X(76)},${1824} ${X(44)},${1836} ${X(0)},${1836} C${X(-44)},${1836} ${X(-76)},${1824} ${X(-80)},${1790} Z`;
  const parmak = [-28, 28].map((dx) => `M${X(dx)},${1834} C${X(dx - s * 6)},${1812} ${X(dx - s * 2)},${1792} ${X(dx + s * 10)},${1778}`).join(' ');
  return `<path d="${d}" fill="${KREM}"/><path d="${alt}" fill="${KREM2}"/><path d="${d}" fill="none" stroke="${K}" stroke-width="${SW}"/>` +
    `<path d="${parmak}" fill="none" stroke="${K}" stroke-width="9" stroke-linecap="round"/>`; }
const govdeOturma = `<clipPath id="otur-kucak"><path d="${KUCAK}"/></clipPath><clipPath id="otur-kes"><rect x="0" y="0" width="2048" height="${KES}"/></clipPath>` +
  `<path d="${KUCAK}" fill="${KURK}"/><g clip-path="url(#otur-kucak)"><path d="${GOLGE}" fill="${KURK2}"/></g><path d="${KUCAK}" fill="none" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round"/>` +
  `<g clip-path="url(#otur-kes)">${icerik('govde')}</g>` +
  `<path d="${KIVRIM}" fill="none" stroke="${K}" stroke-width="11" stroke-linecap="round"/>` + pati(920, false) + pati(1124, true);
// kuyruk: aynı kuyruk, kökü kalçada; aşağı yatırılıp yere doğru kıvrılır
const kuyrukOturma = `<g transform="${process.env.KT || 'translate(-110,40) rotate(40 1260 1680)'}">${icerik('kuyruk')}</g>`;
const E = { 'kuyruk-oturma': kuyrukOturma, 'govde-oturma': govdeOturma };
for (const id of Object.keys(E)) { const r = grup(t, id); if (r) { const bas = t.lastIndexOf('\n', r.bas); t = t.slice(0, bas) + t.slice(r.bitis); } }
// sıra: kuyruk-oturma asıl kuyruğun, govde-oturma asıl gövdenin hemen arkasında (kolların altında kalır)
for (const [id, sonra] of [['kuyruk-oturma', 'kuyruk'], ['govde-oturma', 'govde']]) { const r = grup(t, sonra); t = t.slice(0, r.bitis) + `\n  <g id="${id}" display="none">\n    ${E[id]}\n  </g>` + t.slice(r.bitis); }
fs.writeFileSync(cikti, t); console.log('ok');
