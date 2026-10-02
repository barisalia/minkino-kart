// Anne: Ege'yi kucakta taşıma pozu (gizli): govde-tasima (yanlarda sarkan eller silinmiş gövde) + kol-tasima (öne gelen iki ön kol, eller ortada kenetli).
// Kullanım: govde gizlenir; govde-tasima ve kol-tasima gösterilir. Ege iki katman arasına (gövdenin önü, kolların arkası) konur, kollar bebeğin altını tutar.
// Kaynak assets/ege/anne.webp (428x1143). node anne-tasima.cjs [svg=ekip/ege/anne.svg] [json=ekip/ege/anne.json]   (tekrar çalıştırmak güvenli)
const fs = require('fs'); const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const svgYol = process.argv[2] || 'ekip/ege/anne.svg', jsonYol = process.argv[3] || 'ekip/ege/anne.json';
let t = fs.readFileSync(svgYol, 'utf8'); const j = JSON.parse(fs.readFileSync(jsonYol, 'utf8').replace(/^﻿/, ''));
function grup(metin, g) { const bas = metin.indexOf(`<g id="${g}"`); if (bas < 0) return null; let der = 0; const re = /<g\b[^>]*?(\/?)>|<\/g>/g; re.lastIndex = bas;
  for (let m; (m = re.exec(metin)); ) { if (m[0] === '</g>') der--; else if (!m[1]) der++; if (der === 0) return { bas, bitis: m.index + 4 }; } return null; }
const f = (n) => Math.round(n * 10) / 10;
(async () => {
  const W = 428, H = 1143;
  // 1) sarkan elleri sil (manşetin altı): sol ve sağ çokgen
  const maske = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#fff"/><polygon points="0,752 60,754 104,780 110,850 0,850" fill="#000"/><polygon points="428,750 366,756 322,782 318,850 428,850" fill="#000"/></svg>`;
  const m = await s(Buffer.from(maske)).greyscale().raw().toBuffer();
  const { data } = await s('assets/ege/anne.webp').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < W * H; i++) if (m[i] < 128) data[i * 4 + 3] = 0;
  const webp = await s(data, { raw: { width: W, height: H, channels: 4 } }).webp({ lossless: true }).toBuffer();
  // 2) kollar: manşetten ortaya, baldır kıvrımı; sağ kol üstte
  const TEN = '#E99E75', KONT = '#2A0C0C', KAZAK = '#C291C2', KAZAK2 = '#B07FAE';
  const kol = (p0, c, p1, ust) => {
    const d = `M${p0[0]},${p0[1]} Q${c[0]},${c[1]} ${p1[0]},${p1[1]}`;
    const t0 = 0.22, a = [p0[0] + (c[0] - p0[0]) * t0, p0[1] + (c[1] - p0[1]) * t0], b2 = [c[0] + (p1[0] - c[0]) * t0, c[1] + (p1[1] - c[1]) * t0], q = [a[0] + (b2[0] - a[0]) * t0, a[1] + (b2[1] - a[1]) * t0];
    const dm = `M${p0[0]},${p0[1]} Q${f(a[0])},${f(a[1])} ${f(q[0])},${f(q[1])}`;      // manşet: eğrinin ilk %22'si
    const el = `<ellipse cx="${p1[0]}" cy="${p1[1]}" rx="25" ry="19" fill="${TEN}" stroke="${KONT}" stroke-width="5"/>` +
      `<path d="M${p1[0] - 10},${p1[1] - 8} q9,8 2,17 M${p1[0] + 2},${p1[1] - 10} q9,9 2,19" fill="none" stroke="${KONT}" stroke-width="3.2" stroke-linecap="round" opacity="0.8"/>`;
    return `<path d="${d}" fill="none" stroke="${KONT}" stroke-width="44" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${TEN}" stroke-width="35" stroke-linecap="round"/>` +
      el + `<path d="${dm}" fill="none" stroke="${KONT}" stroke-width="53" stroke-linecap="round"/><path d="${dm}" fill="none" stroke="${KAZAK}" stroke-width="44" stroke-linecap="round"/>` +
      `<path d="${dm}" fill="none" stroke="${KAZAK2}" stroke-width="10" stroke-linecap="round" transform="translate(0,10)" opacity="0.55"/>`;
  };
  const KOL = kol([86, 768], [150, 778], [214, 738]) + kol([340, 768], [280, 782], [200, 748]);
  const E = { 'govde-tasima': `<image x="0" y="0" width="${W}" height="${H}" xlink:href="data:image/webp;base64,${webp.toString('base64')}"/>`, 'kol-tasima': KOL };
  for (const id of Object.keys(E)) { const r = grup(t, id); if (r) { const b = t.lastIndexOf('\n', r.bas); t = t.slice(0, b) + t.slice(r.bitis); } }
  const rg = grup(t, 'govde'); t = t.slice(0, rg.bitis) + `\n  <g id="govde-tasima" display="none">\n    ${E['govde-tasima']}\n  </g>` + t.slice(rg.bitis);
  const son = t.lastIndexOf('</svg>'); t = t.slice(0, son) + `  <g id="kol-tasima" display="none">\n    ${E['kol-tasima']}\n  </g>\n` + t.slice(son);
  fs.writeFileSync(svgYol, t);
  j.sira = j.sira.filter((x) => x !== 'govde-tasima' && x !== 'kol-tasima'); j.sira.splice(j.sira.indexOf('govde') + 1, 0, 'govde-tasima'); j.sira.push('kol-tasima');
  j.gizli = [...new Set([...(j.gizli || []), 'govde-tasima', 'kol-tasima'])]; j.donme = j.donme || {}; j.donme['govde-tasima'] = j.donme.govde || [214, 1000]; j.donme['kol-tasima'] = [214, 700];
  j.tasima = { gizle: ['govde'], goster: ['govde-tasima', 'kol-tasima'], ege: 'govde-tasima ile kol-tasima arasına; bebeğin merkezi ≈ (214, 700), genişlik ≈ 260' };
  fs.writeFileSync(jsonYol, JSON.stringify(j, null, 2) + '\n'); console.log('ok');
})();
