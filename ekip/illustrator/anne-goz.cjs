// Anne'ye gizli "goz-kapali" katmanı (kapalı, gülümseyen gözler): anne.webp (ayakta) ve anne-sariliyor.webp (sarılma).
// Katman, gözün olduğu bölgenin yamasıdır (tüm bölge: göz akı, iris, kalın üst kirpik, alt kirpikler): üst göz kapağı rengi (pembe) + kapalı göz yayı (∩) + üç kirpik; kenar yumuşatılır.
// Varsayılan görüntü değişmez (katman gizli; govde ve agiz dokunulmaz): tam çözünürlükte piksel farkı 0.
// node ekip/illustrator/anne-goz.cjs   → ekip/ege/anne.svg + anne.json güncellenir, ekip/ege/anne-sariliyor.svg + .json oluşturulur (idempotent), önizleme ekip/ege/anne-goz-onizleme.png
const fs = require('fs'), path = require('path');
const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const mir = (pts, c2) => pts.map(([x, y]) => [c2 - x, y]);   // yüz ortasına göre ayna: x' = c2 − x

const POZ = {
  anne: {
    kaynak: 'assets/ege/anne.webp', svg: 'ekip/ege/anne.svg', json: 'ekip/ege/anne.json', ayna: 427,
    poligon: [[97, 388], [203, 388], [200, 398], [195, 413], [184, 424], [168, 429], [150, 428], [134, 423], [120, 414], [108, 404], [97, 397]],
    yay: { xl: 99, xr: 200, yk: 398, yc: 385 }, kalin: 3.4, kirpik: [[[103, 399], [97, 404.5]], [[109, 400.5], [104.5, 408]], [[115, 402], [112, 409.5]]], c: '#2a0a05',
  },
  'anne-sariliyor': {
    kaynak: 'assets/ege/anne-sariliyor.webp', svg: 'ekip/ege/anne-sariliyor.svg', json: 'ekip/ege/anne-sariliyor.json', ayna: 875,
    poligon: [[322, 268], [421, 268], [419, 280], [414, 289], [406, 300], [392, 310], [376, 314], [362, 310], [350, 301], [340, 290], [332, 281], [322, 278]],
    yay: { xl: 325, xr: 417, yk: 279, yc: 266 }, kalin: 4.2, kirpik: [[[331, 281], [323, 287]], [[338, 284], [332.5, 292.5]], [[346, 287], [342, 296]]], c: '#2a0a05',
  },
};

const bez = (p, t) => { const { xl, xr, yk, yc } = p; const xc = (xl + xr) / 2; return [(1 - t) * (1 - t) * xl + 2 * t * (1 - t) * xc + t * t * xr, (1 - t) * (1 - t) * yk + 2 * t * (1 - t) * yc + t * t * yk]; };

async function yama(ad) {
  const P = POZ[ad]; const { data, info } = await s(P.kaynak).ensureAlpha().raw().toBuffer({ resolveWithObject: true }); const W = info.width, H = info.height;
  const gen = (pts) => { const ys = pts.map((q) => q[1]), ymin = Math.min(...ys), fc = P.ayna / 2, md = Math.max(...pts.map((q) => Math.abs(q[0] - fc))); return pts.map(([x, y]) => { if (y <= ymin + 1) return [x, y]; const dis = Math.abs(x - fc) > 0.72 * md; return [x + (dis ? Math.sign(x - fc) * 4 : 0), y + 7 + (dis ? 3 : 0)]; }); };   // alt kontur ve eski alt kirpikler için genişlet (iç/burun tarafı hariç)
  const polys0 = [gen(P.poligon), gen(mir(P.poligon, P.ayna))], polys = polys0, yaylar = [P.yay, { xl: P.ayna - P.yay.xr, xr: P.ayna - P.yay.xl, yk: P.yay.yk, yc: P.yay.yc }];
  const kirpikler = [P.kirpik, P.kirpik.map(([a, b]) => [[P.ayna - a[0], a[1]], [P.ayna - b[0], b[1]]])];
  const out = Buffer.from(data); const maske = new Uint8Array(W * H);
  const poliSvg = (pts) => `<polygon points="${pts.map((q) => q.join(',')).join(' ')}" fill="#fff"/>`;
  const mBuf = await s(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#000"/>${polys.map(poliSvg).join('')}</svg>`)).greyscale().raw().toBuffer();
  for (let i = 0; i < W * H; i++) maske[i] = mBuf[i] > 127 ? 1 : 0;
  // dolgu: poligonun içi iki bölgeye ayrılır (kapalı göz yayının üstü = göz kapağı, altı = ten); her bölge çevredeki gerçek pikselleri (koyu çizgiler hariç) yumuşakça içeri yayarak doldurulur (Laplace yayılımı) → blush geçişi korunur, sütun izi olmaz
  const px0 = (x, y) => [data[(y * W + x) * 4], data[(y * W + x) * 4 + 1], data[(y * W + x) * 4 + 2]];
  const med = (x, y, hw, hh) => { const Lc = [[], [], []]; for (let yy = y - hh; yy <= y + hh; yy++) for (let xx = x - hw; xx <= x + hw; xx++) { if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; const c = px0(xx, yy); for (let q = 0; q < 3; q++) Lc[q].push(c[q]); } return Lc.map((a) => a.sort((p, q) => p - q)[a.length >> 1]); };
  const px = (x, y) => med(x, y, 7, 1);
  const PX = polys.flat().map((q) => q[0]), PY = polys.flat().map((q) => q[1]); const ymaxAll = Math.ceil(Math.max(...PY)), yminAll = Math.floor(Math.min(...PY));
  const lum = (i4) => 0.3 * data[i4] + 0.59 * data[i4 + 1] + 0.11 * data[i4 + 2];
  const etiket = new Int8Array(W * H).fill(-1);       // 0 = kapak, 1 = ten, -1 = bilinen
  for (let k = 0; k < 2; k++) {
    const pol = polys[k], yay = yaylar[k]; const xs = pol.map((q) => q[0]); const x0 = Math.floor(Math.min(...xs)), x1 = Math.ceil(Math.max(...xs));
    const yTab = new Float32Array(x1 - x0 + 1).fill(NaN); for (let tt = 0; tt <= 1; tt += 0.0005) { const [bx, by] = bez(yay, tt); const xi = Math.round(bx); if (xi >= x0 && xi <= x1) yTab[xi - x0] = by; }
    for (let q = 1; q < yTab.length; q++) if (isNaN(yTab[q])) yTab[q] = yTab[q - 1]; for (let q = yTab.length - 2; q >= 0; q--) if (isNaN(yTab[q])) yTab[q] = yTab[q + 1];
    for (let x = x0; x <= x1; x++) for (let y = 0; y < H; y++) { if (!maske[y * W + x]) continue; if (x < x0 + 0) continue; etiket[y * W + x] = y < yTab[x - x0] ? 0 : 1; }
  }
  const val = new Float32Array(W * H * 3); const bil = new Uint8Array(W * H);
  for (let p = 0; p < W * H; p++) { if (etiket[p] < 0) { bil[p] = 1; val[p * 3] = data[p * 4]; val[p * 3 + 1] = data[p * 4 + 1]; val[p * 3 + 2] = data[p * 4 + 2]; } }
  // başlangıç tahmini: sütun örneği (medyan)
  for (let p = 0; p < W * H; p++) { if (etiket[p] < 0) continue; const x = p % W, y = (p / W) | 0; const c = etiket[p] === 0 ? px(x, Math.max(0, yminAll - 3)) : px(x, Math.min(H - 1, ymaxAll + 6)); val[p * 3] = c[0]; val[p * 3 + 1] = c[1]; val[p * 3 + 2] = c[2]; }
  const bbx0 = Math.max(1, Math.floor(Math.min(...polys.flat().map((q) => q[0]))) - 1), bbx1 = Math.min(W - 2, Math.ceil(Math.max(...polys.flat().map((q) => q[0]))) + 1), bby0 = Math.max(1, Math.floor(Math.min(...polys.flat().map((q) => q[1]))) - 1), bby1 = Math.min(H - 2, Math.ceil(Math.max(...polys.flat().map((q) => q[1]))) + 1);
  for (let it = 0; it < 600; it++) {
    for (let y = bby0; y <= bby1; y++) for (let x = bbx0; x <= bbx1; x++) { const p = y * W + x; if (etiket[p] < 0) continue;
      let n = 0, a = 0, b = 0, c = 0; for (const q of [p - 1, p + 1, p - W, p + W]) {
        if (etiket[q] < 0) { if (lum(q * 4) < 110) continue; } else if (etiket[q] !== etiket[p]) continue;      // koyu çizgi pikselleri ve diğer bölge sayılmaz
        n++; a += val[q * 3]; b += val[q * 3 + 1]; c += val[q * 3 + 2]; }
      if (n) { val[p * 3] = a / n; val[p * 3 + 1] = b / n; val[p * 3 + 2] = c / n; } }
  }
  for (let p = 0; p < W * H; p++) { if (etiket[p] < 0) continue; out[p * 4] = Math.round(val[p * 3]); out[p * 4 + 1] = Math.round(val[p * 3 + 1]); out[p * 4 + 2] = Math.round(val[p * 3 + 2]); out[p * 4 + 3] = 255; }
  // kapalı göz yayı + kirpikler (kenar yumuşak çizim)
  const yayPath = (y) => `M${y.xl},${y.yk} Q${(y.xl + y.xr) / 2},${2 * y.yc - y.yk} ${y.xr},${y.yk}`;
  let cizim = '';
  for (let k = 0; k < 2; k++) { cizim += `<path d="${yayPath(yaylar[k])}" fill="none" stroke="${P.c}" stroke-width="${P.kalin}" stroke-linecap="round"/>`; for (const [a, b] of kirpikler[k]) cizim += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${P.c}" stroke-width="${(P.kalin * 0.45).toFixed(2)}" stroke-linecap="round"/>`; }
  const zemin = await s(out, { raw: { width: W, height: H, channels: 4 } }).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${cizim}</svg>`) }]).raw().toBuffer();
  // alfa = poligon (2 px genişletilmiş) + yay/kirpik çizimi, 1.2 px yumuşatma; dışı şeffaf (asıl görüntüye dokunmaz)
  const aSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#000"/>${polys.map((pts) => `<polygon points="${pts.map((q) => q.join(',')).join(' ')}" fill="#fff" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>`).join('')}</svg>`;
  const aBuf = await s(Buffer.from(aSvg)).greyscale().blur(1.2).raw().toBuffer();
  const tum = Buffer.alloc(W * H * 4); for (let i = 0; i < W * H; i++) { tum[i * 4] = zemin[i * 4]; tum[i * 4 + 1] = zemin[i * 4 + 1]; tum[i * 4 + 2] = zemin[i * 4 + 2]; tum[i * 4 + 3] = aBuf[i]; }
  const tumPng = await s(tum, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
  const xs = polys.flat().map((q) => q[0]), ys = polys.flat().map((q) => q[1]); const pad = 6;
  const left = Math.max(0, Math.floor(Math.min(...xs)) - pad), top = Math.max(0, Math.floor(Math.min(...ys)) - pad), right = Math.min(W, Math.ceil(Math.max(...xs)) + pad), bottom = Math.min(H, Math.ceil(Math.max(...ys)) + pad);
  const kes = await s(tumPng).extract({ left, top, width: right - left, height: bottom - top }).webp({ lossless: true }).toBuffer();
  return { x: left, y: top, w: right - left, h: bottom - top, b64: kes.toString('base64'), merkez: [(Math.min(...xs) + Math.max(...xs)) / 2, (top + bottom) / 2] };
}

(async () => {
  for (const ad of Object.keys(POZ)) {
    const P = POZ[ad]; const L = await yama(ad);
    const katman = `  <g id="goz-kapali" display="none">\n    <image x="${L.x}" y="${L.y}" width="${L.w}" height="${L.h}" xlink:href="data:image/webp;base64,${L.b64}"/>\n  </g>\n`;
    let svg;
    if (fs.existsSync(P.svg)) svg = fs.readFileSync(P.svg, 'utf8');
    else { // anne-sariliyor: yalnız govde
      const m = await s(P.kaynak).metadata(); const b64 = fs.readFileSync(P.kaynak).toString('base64');
      svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${m.width} ${m.height}" width="${m.width}" height="${m.height}">\n  <!-- Anne sarilma pozu (assets/ege/anne-sariliyor.webp) goz kirpma iskeleti; kullanim: ekip/ege/IFADELER.md -->\n  <g id="govde">\n    <image x="0" y="0" width="${m.width}" height="${m.height}" xlink:href="data:image/webp;base64,${b64}"/>\n  </g>\n</svg>\n`;
    }
    svg = svg.replace(/\s*<g id="goz-kapali"[\s\S]*?<\/g>\n?/, '\n');     // idempotent
    svg = svg.replace('</svg>', katman + '</svg>');
    fs.writeFileSync(P.svg, svg);
    let j = fs.existsSync(P.json) ? JSON.parse(fs.readFileSync(P.json, 'utf8').replace(/^﻿/, '')) : null;
    if (!j) { const m = await s(P.kaynak).metadata(); j = { ad, kaynak: P.kaynak, tuval: [m.width, m.height], sira: ['govde'], gizli: [], bagli: {}, donme: {} }; }
    j.sira = j.sira.filter((x) => x !== 'goz-kapali'); const ik = j.sira.indexOf('kol-tasima'); if (ik >= 0) j.sira.splice(ik, 0, 'goz-kapali'); else j.sira.push('goz-kapali');
    j.gizli = (j.gizli || []).filter((x) => x !== 'goz-kapali').concat('goz-kapali'); j.bagli = { ...(j.bagli || {}), 'goz-kapali': 'govde' }; j.donme = { ...(j.donme || {}), 'goz-kapali': L.merkez.map((n) => Math.round(n * 10) / 10) };
    fs.writeFileSync(P.json, JSON.stringify(j) + '\n');
    console.log(ad, 'goz-kapali', `${L.x},${L.y} ${L.w}x${L.h}`, 'dönme', j.donme['goz-kapali']);
  }
})();
