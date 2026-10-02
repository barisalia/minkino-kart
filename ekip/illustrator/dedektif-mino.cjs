// Dedektif Mino ekleri (ekip/mino/mino-final.svg içinde, gizli): sapka-dedektif, goz-buyutec, kol-buyutec.
// Kaynak: Gemini minkino-film-gemini/dedektif/mino-dedektif-1.png (1024x1024, beyaz zemin). Şapka ve büyüteç kolu çokgenle kesilir, Mino'nun ölçüsüne oturtulur.
//  - sapka-dedektif: kareli şapka (Gemini 357..665 x 42..274). Fırça alt-orta (515,274) → Mino (985,560); ölçek 2.1. Kafaya bağlı, z-sırada en üstte.
//  - goz-buyutec:    Mino'nun kendi sol gözü (kafa+göz basılı), kaynak merkezi (773,805) cam merkezine (738,779) gelecek biçimde 1.25x büyütülmüş, cam dairesine kırpılı. kol-buyutec'in ALTINDA.
//  - kol-buyutec:    halka (cam içi şeffaf) + sap + el + kol, Gemini çiziminden. Halka merkezi (376,401) → (738,779), ölçek 2.023, -6.5° (kol ucu Mino gövde çizgisine denk gelir). Cam parlaması vektör.
// Gizle: kol-sol (asıl kol), goz-sol, (isteğe bağlı goz-kapali). Hepsi kafaya bağlı. Tekrar çalıştırmak güvenli.
// node dedektif-mino.cjs [svg=ekip/mino/mino-final.svg] [onizleme=ekip/mino/mino-dedektif-onizleme.png]
const fs = require('fs');
const sharp = require(require.resolve('sharp', { paths: [process.cwd()] }));
const KAYNAK = 'C:/Users/Minkex/Desktop/minkino-film-gemini/dedektif/mino-dedektif-1.png';
const svgYol = process.argv[2] || 'ekip/mino/mino-final.svg', onizYol = process.argv[3] || 'ekip/mino/mino-dedektif-onizleme.png';
const U = 3;                       // parça bit eşlemi Gemini px'in 3 katı (SVG'de ölçek S/U ile küçülür)
const KC = [0x3a, 0x12, 0x10];
const TOHUM = [[390, 610]];
const f1 = (n) => Math.round(n * 100) / 100;
const IDLER = ['sapka-dedektif', 'goz-buyutec', 'kol-buyutec'];

// --- 1) Gemini beyaz zemin → alfa (kenara bağlı beyaz; kenar halkasında beyaz kontur rengine göre alfadan çıkarılır)
async function kesit() {
  const { data, info } = await sharp(KAYNAK).removeAlpha().raw().toBuffer({ resolveWithObject: true }); const W = info.width, H = info.height, n = W * H;
  const beyaz = new Uint8Array(n); for (let i = 0; i < n; i++) beyaz[i] = Math.min(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]) > 232 ? 1 : 0;
  const zemin = new Uint8Array(n), q = new Int32Array(n); let bas = 0, son = 0;
  for (let i = 0; i < n; i++) { const x = i % W, y = (i / W) | 0; if (beyaz[i] && (x === 0 || y === 0 || x === W - 1 || y === H - 1) && !zemin[i]) { zemin[i] = 1; q[son++] = i; } }
  for (const [sx, sy] of TOHUM) { const i = sy * W + sx; if (beyaz[i] && !zemin[i]) { zemin[i] = 1; q[son++] = i; } }   // kapalı beyaz boşluklar (çene ile kol arası)
  while (bas < son) { const p = q[bas++], x = p % W; for (const d of [-1, 1, -W, W]) { const r = p + d; if (r < 0 || r >= n || zemin[r] || !beyaz[r]) continue; if ((d === -1 && x === 0) || (d === 1 && x === W - 1)) continue; zemin[r] = 1; q[son++] = r; } }
  const uz = new Uint8Array(n).fill(255); let sinir = []; for (let i = 0; i < n; i++) if (zemin[i]) { uz[i] = 0; sinir.push(i); }
  for (let k = 1; k <= 3; k++) { const yeni = []; for (const p of sinir) { const x = p % W; for (const d of [-1, 1, -W, W]) { const r = p + d; if (r < 0 || r >= n || uz[r] <= k) continue; if ((d === -1 && x === 0) || (d === 1 && x === W - 1)) continue; uz[r] = k; yeni.push(r); } } sinir = yeni; }
  const out = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) { const o = i * 4, c = [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]];
    if (zemin[i]) { out[o + 3] = 0; continue; }
    if (uz[i] <= 3) { let a = 0; for (let j = 0; j < 3; j++) a = Math.max(a, (255 - c[j]) / Math.max(1, 255 - KC[j])); a = Math.min(1, a);
      if (a < 0.02) { out[o + 3] = 0; continue; }
      for (let j = 0; j < 3; j++) out[o + j] = Math.max(0, Math.min(255, Math.round((c[j] - (1 - a) * 255) / a))); out[o + 3] = Math.round(a * 255); }
    else { out[o] = c[0]; out[o + 1] = c[1]; out[o + 2] = c[2]; out[o + 3] = 255; } }
  return { data: out, W, H };
}
// çokgen/daire maskesi (kenar yumuşak), 0..255
async function maske(W, H, govde) { return sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#000"/>${govde}</svg>`)).greyscale().raw().toBuffer(); }
const poli = (p) => `<polygon points="${p.map((q) => q.join(',')).join(' ')}" fill="#fff"/>`;

// --- 2) parçalar (Gemini koordinatları)
const SAPKA = [[360.5, 238], [357.5, 215], [357.5, 190], [361.5, 170], [368.5, 152], [377.5, 137], [387, 125], [387, 30], [644, 30], [644, 133], [653.5, 150], [660.5, 167], [665.5, 193], [666.5, 225], [658.5, 236], [646.5, 247], [627, 258], [604, 265], [579, 270], [545, 272], [515, 273.5], [480, 272], [445, 269], [415, 264], [393, 256.5], [376.5, 245.5]];
const LENS = [376, 401], R_DIS = 116.6, R_IC = 91.5;
const KOL = [[322, 505], [317, 540], [312, 579], [255, 579], [255, 690], [268, 722], [330, 722], [330, 700], [335, 697], [350, 700], [370, 703], [390, 705], [402, 698], [406, 680], [413, 660], [419, 640], [424, 621], [415, 620], [400, 623.5], [385, 624.5], [372, 623], [358, 617], [346, 611], [344, 607], [349, 597], [356, 572], [361, 548], [354, 526], [356, 505]];

async function parca(G, ad) {
  let m;
  if (ad === 'sapka') m = await maske(G.W, G.H, poli(SAPKA));
  else { m = await maske(G.W, G.H, poli(KOL) + `<circle cx="${LENS[0]}" cy="${LENS[1]}" r="${R_DIS}" fill="#fff"/>`); }
  const px = Buffer.from(G.data);
  let x0 = G.W, y0 = G.H, x1 = 0, y1 = 0;
  for (let y = 0; y < G.H; y++) for (let x = 0; x < G.W; x++) { const i = y * G.W + x, o = i * 4;
    let a = px[o + 3] * (m[i] / 255);
    if (ad === 'kol') {
      const r = Math.hypot(x - LENS[0], y - LENS[1]);
      if (r < R_IC + 0.5) a *= Math.max(0, Math.min(1, r - R_IC + 0.5));                                  // cam içi şeffaf
      else if (r > R_DIS && y < 580) { const R = px[o], Gc = px[o + 1], B = px[o + 2]; if (Math.abs(R - 232) < 16 && Math.abs(Gc - 216) < 16 && Math.abs(B - 198) < 20) a = 0; } // boyun çevresindeki yanak (krem)
    }
    px[o + 3] = Math.round(a); if (a > 8) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } }
  x0 = Math.max(0, x0 - 2); y0 = Math.max(0, y0 - 2); x1 = Math.min(G.W - 1, x1 + 2); y1 = Math.min(G.H - 1, y1 + 2);
  const w = x1 - x0 + 1, h = y1 - y0 + 1;
  const buyuk = await sharp(await sharp(px, { raw: { width: G.W, height: G.H, channels: 4 } }).extract({ left: x0, top: y0, width: w, height: h }).png().toBuffer()).resize({ width: w * U, height: h * U, kernel: 'lanczos3' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const d = buyuk.data; // alfayı keskinleştir (büyütme yumuşatması)
  for (let i = 3; i < d.length; i += 4) { const t = Math.max(0, Math.min(1, (d[i] / 255 - 0.3) / 0.4)); d[i] = Math.round(255 * t * t * (3 - 2 * t)); }
  const webp = await sharp(d, { raw: { width: w * U, height: h * U, channels: 4 } }).webp({ quality: 92, alphaQuality: 100 }).toBuffer();
  return { x0, y0, w, h, b64: webp.toString('base64') };
}

(async () => {
  const G = await kesit();
  const sp = await parca(G, 'sapka'), ko = await parca(G, 'kol');
  // --- 3) yerleştirme dönüşümleri (Gemini → Mino 2048)
  const S_H = 2.1, S_K = 2.023, ACI = -6.5, GOZ = [738, 779];
  const dSapka = `translate(985 560) scale(${f1(S_H / U)}) translate(${-515 * U} ${-274 * U})`;
  const dKol = `translate(${GOZ[0]} ${GOZ[1]}) rotate(${ACI}) scale(${f1(S_K / U)}) translate(${-LENS[0] * U} ${-LENS[1] * U})`;
  const img = (p) => `<image x="${p.x0 * U}" y="${p.y0 * U}" width="${p.w * U}" height="${p.h * U}" xlink:href="data:image/webp;base64,${p.b64}"/>`;
  // cam parlaması (Gemini koordinatlarında, halka merkezli): üst-sol yay + küçük nokta + hafif mavi ton, alt-sağ silik yay
  const L = LENS, yay = (a0, a1, r) => { const p = (a) => [f1((L[0] + r * Math.cos((a * Math.PI) / 180)) * U), f1((L[1] - r * Math.sin((a * Math.PI) / 180)) * U)]; const A = p(a0), B = p(a1); return `M${A[0]},${A[1]} A${r * U},${r * U} 0 0 1 ${B[0]},${B[1]}`; };
  const camVektor = `<circle cx="${L[0] * U}" cy="${L[1] * U}" r="${R_IC * U}" fill="#CFEFFF" opacity="0.10"/>` +
    `<path d="${yay(150, 112, 78)}" fill="none" stroke="#fff" stroke-width="${7 * U}" stroke-linecap="round" opacity="0.85"/>` +
    `<circle cx="${(L[0] - 62) * U}" cy="${(L[1] - 52) * U}" r="${4.5 * U}" fill="#fff" opacity="0.9"/>` +
    `<path d="${yay(-35, -70, 80)}" fill="none" stroke="#fff" stroke-width="${4.5 * U}" stroke-linecap="round" opacity="0.45"/>`;
  // --- 4) büyütülmüş göz: Mino'nun varsayılan hâli (ekler gizli), 1.25x, cam dairesine kırpılı
  let t = fs.readFileSync(svgYol, 'utf8');
  const grup = (metin, g) => { const bas = metin.indexOf(`<g id="${g}"`); if (bas < 0) return null; const ic = metin.indexOf('>', bas) + 1; let der = 1; const re = /<g\b[^>]*?(\/?)>|<\/g>/g; re.lastIndex = ic;
    for (let m; (m = re.exec(metin)); ) { if (m[0] === '</g>') der--; else if (!m[1]) der++; if (der === 0) return { bas, ic, son: m.index, bitis: m.index + 4 }; } return null; };
  for (const id of IDLER) { const r = grup(t, id); if (r) { const b = t.lastIndexOf('\n', r.bas); t = t.slice(0, b) + t.slice(r.bitis); } }
  fs.writeFileSync(svgYol, t);                                   // eski dedektif katmanları çıkmış temiz SVG
  const KIRP = [[815, 1180], [1100, 1180], [1100, 1500], [790, 1500], [800, 1423], [815.5, 1377], [833, 1336], [848.7, 1300], [864, 1267], [851, 1257], [836, 1241.6], [826, 1229], [818, 1216]];   // gövde çizgisinin (sol dış kenar) ve fular ucunun sağı
  const PM = [773, 805];   // büyütmenin kaynak merkezi: Mino'nun sol iris merkezi (785,815) cam merkezine (738,779) yakın düşsün
  const MAG = 1.25, RG = R_IC * S_K + 5, SRC = (RG / MAG) * 2, K = 1.2 * MAG; // kaynak kutusu SRC px; çıktı px = SRC*K
  const { chromium } = require(require.resolve('playwright', { paths: [process.cwd()] }));
  const br = await chromium.launch(), pg = await br.newPage({ viewport: { width: 600, height: 600 } });
  const gorsel = async (svg, vb, W, H, yol) => { await pg.setViewportSize({ width: W, height: H }); await pg.setContent(`<body style="margin:0;background:transparent"><img style="display:block;width:${W}px;height:${H}px" src="data:image/svg+xml;base64,${Buffer.from(svg.replace(/viewBox="[^"]+"/, `viewBox="${vb}"`).replace(/width="2048" height="2048"/, `width="${W}" height="${H}"`)).toString('base64')}">`); await pg.waitForTimeout(1500); await pg.screenshot({ path: yol, omitBackground: true }); };
  const tmp = onizYol.replace(/\.png$/, '-goz.png'), ow = Math.round(SRC * K);
  await gorsel(t, `${PM[0] - SRC / 2} ${PM[1] - SRC / 2} ${SRC} ${SRC}`, ow, ow, tmp);
  const daire = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${ow}" height="${ow}"><circle cx="${ow / 2}" cy="${ow / 2}" r="${(RG / MAG) * K}" fill="#fff"/></svg>`);
  const gozPng = await sharp(tmp).composite([{ input: daire, blend: 'dest-in' }]).webp({ quality: 92, alphaQuality: 100 }).toBuffer(); fs.unlinkSync(tmp);
  const gDis = RG * 2;
  const E = {
    'sapka-dedektif': `<g transform="${dSapka}">${img(sp)}</g>`,
    'goz-buyutec': `<image x="${f1(GOZ[0] - RG)}" y="${f1(GOZ[1] - RG)}" width="${f1(gDis)}" height="${f1(gDis)}" xlink:href="data:image/webp;base64,${gozPng.toString('base64')}"/>`,
    'kol-buyutec': `<clipPath id="kol-buyutec-klip"><path clip-rule="evenodd" d="M0,0H2048V2048H0Z M${KIRP.map((q) => q.join(',')).join(' L')} Z"/></clipPath><g clip-path="url(#kol-buyutec-klip)"><g transform="${dKol}">${img(ko)}${camVektor}</g></g>`,
  };
  const son = t.lastIndexOf('</svg>');
  t = t.slice(0, son) + IDLER.map((id) => `  <g id="${id}" display="none">\n    ${E[id]}\n  </g>\n`).join('') + t.slice(son);
  fs.writeFileSync(svgYol, t);
  // --- 5) önizleme: varsayılan | dedektif (açık + koyu zemin)
  const goster = (m, ids) => ids.reduce((s, g) => s.replace(`<g id="${g}" display="none">`, `<g id="${g}">`), m), gizle = (m, ids) => ids.reduce((s, g) => s.replace(`<g id="${g}">`, `<g id="${g}" display="none">`), m);
  const ded = goster(gizle(t, ['kol-sol', 'goz-sol']), IDLER);
  const W = 640, H = 640, VB = '300 40 1500 1500', cell = [['varsayilan', t], ['dedektif', ded]];
  let html = '<body style="margin:0;font:bold 16px sans-serif">';
  for (const z of ['#CFE6FA', '#1F1A28']) { html += `<div style="display:flex;background:${z}">`; for (const [n, s] of cell) html += `<div style="position:relative"><img style="width:${W}px;height:${H}px;display:block" src="data:image/svg+xml;base64,${Buffer.from(s.replace(/viewBox="[^"]+"/, `viewBox="${VB}"`).replace(/width="2048" height="2048"/, `width="${W}" height="${H}"`)).toString('base64')}"><div style="position:absolute;left:8px;top:6px;color:#e33">${n}</div></div>`; html += '</div>'; }
  await pg.setViewportSize({ width: W * 2, height: H * 2 }); await pg.setContent(html); await pg.waitForTimeout(2500); await pg.screenshot({ path: onizYol }); await br.close();
  console.log('dedektif ok', 'sapka', sp.w, sp.h, 'kol', ko.w, ko.h, 'svg KB', Math.round(fs.statSync(svgYol).size / 1024));
})();
