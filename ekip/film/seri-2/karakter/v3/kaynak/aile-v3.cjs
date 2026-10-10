// Kino ailesi v3: Recraft denemelerini PNG'ye cevirir, secilen Anne/Baba ile
// dogru boy oranli dizilis (SVG + PNG) ve temas sayfasi kurar. Kredi harcamaz.
// Kullanim: node aile-v3.cjs <temas-sayfasi.png>
const fs = require('fs'), path = require('path');
const sharp = require(require.resolve('sharp', { paths: [process.cwd(), 'C:/Users/Minkex/Desktop/Minkino Games'] }));
const KOK = 'C:/Users/Minkex/Desktop/Minkino Games/ekip/film/seri-2/karakter/';
const V1 = KOK + 'v1/', V2 = KOK + 'v2/', V3 = KOK + 'v3/';
const SHEET = process.argv[2];
const SECIM = { anne: 'anne-defne-deneme-4', baba: 'baba-murat-deneme-4' };
const ORAN = { kino: 1, anne: 1.37, baba: 1.48, lokum: 0.62 };
const AD = { kino: 'Kino (C)', anne: 'Anne Defne', baba: 'Baba Murat', lokum: 'Lokum (v2)' };
const DENEME = [
  ['anne-defne-deneme-1', 'Anne 1: yetişkin, burun uzun; yüz bej/akıtmalı (RED)'],
  ['anne-defne-deneme-2', 'Anne 2: yine çocuk kafası, iki göz lekesi (RED)'],
  ['anne-defne-deneme-3', 'Anne 3: yetişkin; eller iri, başta leke'],
  ['anne-defne-deneme-4', 'Anne 4: SEÇİLDİ'],
  ['baba-murat-deneme-1', 'Baba 1: stil iyi ama çocuk oranı (RED)'],
  ['baba-murat-deneme-2', 'Baba 2: göbek açık, eski çizgi film (RED)'],
  ['baba-murat-deneme-3', 'Baba 3: göz stili farklı, sırıtık (RED)'],
  ['baba-murat-deneme-4', 'Baba 4: SEÇİLDİ (bıyık yok)'],
];

const temizSvg = (s) => s.replace(/<metadata>[\s\S]*?<\/metadata>/, '');
// Recraft SVG: ilk yol zemin; saydam icin onu bosalt
const zeminsiz = (s) => temizSvg(s).replace(/fill="[^"]*"/, 'fill="none"');
function parcala(svg) {
  const vb = svg.match(/viewBox="([^"]*)"/)[1].trim().split(/\s+/).map(Number);
  const w = +(svg.match(/<svg[^>]*\swidth="([\d.]+)"/) || [])[1] || vb[2];
  const h = +(svg.match(/<svg[^>]*\sheight="([\d.]+)"/) || [])[1] || vb[3];
  const ic = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  return { vb, w, h, ic };
}
// Recraft cizimleri kare viewBox'u 1792 genislige sikistirir: duz viewBox'a cevir
function duzle(svg) {
  const p = parcala(svg);
  if (Math.abs(p.vb[2] / p.vb[3] - p.w / p.h) < 0.01) return svg;
  const sx = p.w / p.vb[2], sy = p.h / p.vb[3];
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${p.w} ${p.h}" width="${p.w}" height="${p.h}"><g transform="scale(${sx},${sy}) translate(${-p.vb[0]},${-p.vb[1]})">${p.ic}</g></svg>`;
}
async function sikiKutu(svg) { // gorunur alan, viewBox biriminde
  const p = parcala(svg);
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  const m = await sharp(png).metadata();
  const t = await sharp(png).trim({ threshold: 10 }).toBuffer({ resolveWithObject: true });
  const kx = p.vb[2] / m.width, ky = p.vb[3] / m.height;
  return [p.vb[0] - t.info.trimOffsetLeft * kx, p.vb[1] - t.info.trimOffsetTop * ky, t.info.width * kx, t.info.height * ky];
}
const yazi = (x, y, t, size = 34, w = '700', renk = '#401312') =>
  `<text x="${x}" y="${y}" font-family="Segoe UI, Arial, sans-serif" font-size="${size}" font-weight="${w}" fill="${renk}" text-anchor="middle">${t}</text>`;

(async () => {
  // 1) Denemeler: beyaz zeminli PNG + saydam PNG
  for (const [ad] of DENEME) {
    const s = fs.readFileSync(V3 + ad + '.svg', 'utf8');
    await sharp(Buffer.from(temizSvg(s))).flatten({ background: '#ffffff' }).png().toFile(V3 + ad + '.png');
  }
  // 2) Secilenler: -on.svg / -on.png / -on-seffaf.png
  for (const [k, ad] of [['anne', 'anne-defne-on'], ['baba', 'baba-murat-on']]) {
    const s = fs.readFileSync(V3 + SECIM[k] + '.svg', 'utf8');
    fs.writeFileSync(V3 + ad + '.svg', s);
    await sharp(Buffer.from(temizSvg(s))).flatten({ background: '#ffffff' }).png().toFile(V3 + ad + '.png');
    await sharp(Buffer.from(zeminsiz(s))).png().toFile(V3 + ad + '-seffaf.png');
  }
  // 3) Dizilis (vektor): ic ice <svg>, tek taban cizgisi
  const kaynak = {
    kino: duzle(zeminsiz(fs.readFileSync(V1 + 'kino-on-c.svg', 'utf8'))),
    anne: duzle(zeminsiz(fs.readFileSync(V3 + 'anne-defne-on.svg', 'utf8'))),
    baba: duzle(zeminsiz(fs.readFileSync(V3 + 'baba-murat-on.svg', 'utf8'))),
    lokum: fs.readFileSync(V2 + 'lokum-on.svg', 'utf8').replace(/<rect x="[^"]*" y="[^"]*" width="[^"]*" height="[^"]*" fill="#ffffff"\/>/, ''),
  };
  const H = 620, bosluk = 80; let x = bosluk; const ogeler = [];
  for (const k of ['kino', 'anne', 'baba', 'lokum']) {
    const p = parcala(kaynak[k]); const kutu = await sikiKutu(kaynak[k]);
    const h = H * ORAN[k], w = h * kutu[2] / kutu[3];
    ogeler.push({ k, p, kutu, w, h, x }); x += w + bosluk;
  }
  const W = Math.ceil(x), taban = Math.ceil(H * 1.48) + 40, HH = taban + 90;
  const govde = ogeler.map((o) =>
    `<svg x="${o.x.toFixed(1)}" y="${(taban - o.h).toFixed(1)}" width="${o.w.toFixed(1)}" height="${o.h.toFixed(1)}" viewBox="${o.kutu.map((v) => v.toFixed(1)).join(' ')}" preserveAspectRatio="none" overflow="visible">${o.p.ic}</svg>` +
    yazi((o.x + o.w / 2).toFixed(1), taban + 62, AD[o.k])).join('');
  // boy cizgileri (Kino boyu ve 1.37 / 1.48 kati), ince ve soluk
  const kilavuz = [1, 1.37, 1.48].map((r) => `<line x1="20" y1="${(taban - H * r).toFixed(1)}" x2="${W - 20}" y2="${(taban - H * r).toFixed(1)}" stroke="#EADFD3" stroke-width="2" stroke-dasharray="10 10"/>`).join('');
  const dizSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${HH}" width="${W}" height="${HH}"><rect width="${W}" height="${HH}" fill="#ffffff"/>${kilavuz}<line x1="30" y1="${taban + 4}" x2="${W - 30}" y2="${taban + 4}" stroke="#DDB4A4" stroke-width="4"/>${govde}</svg>`;
  fs.writeFileSync(V3 + 'aile-dizilis.svg', dizSvg);
  await sharp(Buffer.from(dizSvg)).flatten({ background: '#ffffff' }).png().toFile(V3 + 'aile-dizilis.png');

  // 4) Temas sayfasi: dizilis + denemeler + Kino B/C
  const SW = Math.max(W + 160, 2600);
  const ust = 140, dizY = ust;
  const denY = dizY + HH + 170, DH = 430;
  const denemeler = [];
  for (const [ad, not] of DENEME) {
    const b = await sharp(V3 + ad + '.png').trim({ threshold: 10 }).resize({ height: DH }).png().toBuffer();
    const m = await sharp(b).metadata(); denemeler.push({ b, w: m.width, not });
  }
  // iki sira: anne denemeleri, baba denemeleri
  const sira = [denemeler.slice(0, 4), denemeler.slice(4)];
  const kare = 560; // her denemeye ayrilan genislik
  const kbY = denY + 2 * (DH + 110) + 150, RH = 560;
  const kb = await sharp(V1 + 'kino-on-b.png').trim({ threshold: 10 }).resize({ height: RH }).png().toBuffer();
  const kc = await sharp(V1 + 'kino-on-c.png').trim({ threshold: 10 }).resize({ height: RH }).png().toBuffer();
  const bm = await sharp(kb).metadata(), cm = await sharp(kc).metadata();
  const SH = kbY + RH + 110;
  const xB = SW / 2 - 60 - bm.width, xC = SW / 2 + 60;
  const comp = [{ input: await sharp(V3 + 'aile-dizilis.png').toBuffer(), left: Math.round((SW - W) / 2), top: dizY }];
  let metin = yazi(SW / 2, 80, 'Kino ve Ailesi · v3 (Recraft, yetişkin oranlı Anne ve Baba)', 52);
  metin += `<line x1="80" y1="${denY - 120}" x2="${SW - 80}" y2="${denY - 120}" stroke="#EADFD3" stroke-width="3"/>`;
  metin += yazi(SW / 2, denY - 60, 'Bütün Recraft denemeleri (8 × 12 kredi)', 38, '600');
  sira.forEach((s, i) => {
    const y = denY + i * (DH + 110); const x0 = (SW - kare * s.length) / 2;
    s.forEach((d, j) => {
      const cx = x0 + kare * j + kare / 2;
      comp.push({ input: d.b, left: Math.round(cx - d.w / 2), top: y });
      metin += yazi(cx, y + DH + 50, d.not, 25, d.not.includes('SEÇİLDİ') ? '700' : '500', d.not.includes('RED') ? '#9a7b70' : '#401312');
    });
  });
  metin += `<line x1="80" y1="${kbY - 120}" x2="${SW - 80}" y2="${kbY - 120}" stroke="#EADFD3" stroke-width="3"/>`;
  metin += yazi(SW / 2, kbY - 60, 'Karşılaştırma: onaylı v1 Kino B ve Kino C', 38, '600');
  metin += yazi(xB + bm.width / 2, kbY + RH + 60, 'Kino B (v1)', 32) + yazi(xC + cm.width / 2, kbY + RH + 60, 'Kino C (v1)', 32);
  comp.push({ input: kb, left: Math.round(xB), top: kbY }, { input: kc, left: Math.round(xC), top: kbY });
  comp.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${SW}" height="${SH}">${metin}</svg>`), left: 0, top: 0 });
  await sharp({ create: { width: SW, height: SH, channels: 4, background: '#ffffff' } }).composite(comp).flatten({ background: '#ffffff' }).png().toFile(V3 + 'temas-sayfasi.png');
  if (SHEET) fs.copyFileSync(V3 + 'temas-sayfasi.png', SHEET);
  console.log('ok dizilis', W, HH, 'sayfa', SW, SH);
})().catch((e) => { console.error(e); process.exit(1); });
