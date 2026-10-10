#!/usr/bin/env node
/**
 * Kino ve Ailesi v5 model sayfası: dört kukla kiti dinlenme duruşunda, AYNI ölçekte yan yana, boy çizgileriyle.
 * v5: yetişkinler (Anne, Baba) Kino C kalitesinde: el işi kol / bacak profili, etek ve pantolon kıvrımları, uzun
 * parmaklı yetişkin eli, oval yetişkin kafası; Baba genç (bıyık ve takke yok, gözlük isteğe bağlı, açık gözler).
 * Yanına önce / sonra karşılaştırması da yazılır (once-sonra.png: v4 sayfasının yetişkin yarısı | v5'inki).
 * Görüntü kitlerin kendi parçalarından kurulur (motorun çizdiği gibi: yuvalarda varsayılan, kollar / bacaklar iki
 * geçişli). Boylar assets/karakter/aile-boy.json tablosundan; çizgiler ölçülen tepe ile çizilir, tablo farkı yazılır.
 *
 * Kullanım: node ekip/film/seri-2/karakter/v5/kaynak/aile-model.cjs [cikti.png]
 *   (varsayılan ekip/film/seri-2/karakter/v5/aile-model.png; karşılaştırma aynı klasörde once-sonra.png)
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const KOK = path.resolve(__dirname, '..', '..', '..', '..', '..', '..');
const KAR = path.join(KOK, 'assets/karakter');
const tablo = JSON.parse(fs.readFileSync(path.join(KAR, 'aile-boy.json'), 'utf8'));
const CIKTI = process.argv[2] || path.join(__dirname, '..', 'aile-model.png');
const OLCEK = 0.3;

/** Kiti dinlenme duruşunda kurar (1:1), saydam PNG; { png, w, h, zemin, tepe } */
async function kur(ad) {
  const dosya = path.join(KAR, tablo.kit[ad]);
  const kl = path.dirname(dosya);
  const isk = JSON.parse(fs.readFileSync(dosya, 'utf8'));
  const [W, H] = isk.boyut;
  const gizli = new Set(isk.gizli ?? []);
  const kat = [];
  const bas = (ad_, dolgu = false) => {
    const p = isk.parcalar[ad_];
    kat.push({ input: path.join(kl, dolgu ? p.dolgu : p.resim), left: Math.round(p.kutu[0]), top: Math.round(p.kutu[1]) });
  };
  for (const c of isk.cizim) {
    if (typeof c === 'string') { if (!gizli.has(c)) bas(c); }
    else if (c.yuva) bas(isk.yuvalar[c.yuva].varsayilan);
    else { for (const a of c.parcalar) bas(a); for (const a of c.parcalar) bas(a, true); }
  }
  const png = await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite(kat).png().toBuffer();
  // tepe: Kino json'unda yok, ölç (alfa > 60 olan ilk satır)
  let tepe = isk.tepe;
  if (tepe == null) {
    const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
    outer: for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) if (data[(y * info.width + x) * 4 + 3] > 60) { tepe = y; break outer; }
  }
  return { png, W, H, zemin: isk.zemin, tepe };
}

(async () => {
  const sira = ['baba', 'anne', 'kino', 'lokum'];
  const ADLAR = { baba: 'Baba Murat', anne: 'Anne Defne', kino: 'Kino', lokum: 'Lokum' };
  const k = {};
  for (const a of sira) k[a] = await kur(a);
  // kırp: her figürün yatay sınırı
  const parca = [];
  for (const a of sira) {
    const { data, info } = await sharp(k[a].png).resize(Math.round(k[a].W * OLCEK)).raw().toBuffer({ resolveWithObject: true });
    let x0 = info.width, x1 = 0;
    for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) if (data[(y * info.width + x) * 4 + 3] > 10) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); }
    const img = await sharp(k[a].png).resize(Math.round(k[a].W * OLCEK)).extract({ left: x0, top: 0, width: x1 - x0 + 1, height: Math.round(k[a].H * OLCEK) }).png().toBuffer();
    parca.push({ a, img, w: x1 - x0 + 1, zemin: k[a].zemin * OLCEK, tepe: k[a].tepe * OLCEK });
  }
  const SOL = 250, ARA = 70, UST = 70, ALT = 150;
  const zeminY = UST + Math.max(...parca.map((p) => p.zemin - p.tepe)) + 10;
  const GEN = SOL + parca.reduce((s, p) => s + p.w, 0) + ARA * (parca.length - 1) + 60;
  const YUK = Math.round(zeminY + ALT);
  const kinoBoy = (k.kino.zemin - k.kino.tepe) * OLCEK;
  let x = SOL;
  const yerler = [];
  for (const p of parca) {
    yerler.push({ ...p, x, y: Math.round(zeminY - p.zemin) });
    x += p.w + ARA;
  }
  // boy çizgileri ve yazılar
  const yazi = (x_, y_, t, boy = 26, renk = '#401312', agir = 700, hiza = 'start') => `<text x="${x_}" y="${y_}" font-family="Segoe UI, Arial, sans-serif" font-size="${boy}" font-weight="${agir}" fill="${renk}" text-anchor="${hiza}">${t}</text>`;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${GEN}" height="${YUK}"><rect width="100%" height="100%" fill="#fcfbf9"/>`;
  for (const p of yerler) {
    const tepeY = zeminY - (p.zemin - p.tepe);
    const oran = (p.zemin - p.tepe) / kinoBoy;
    svg += `<line x1="${SOL - 20}" x2="${p.x + p.w + 10}" y1="${tepeY}" y2="${tepeY}" stroke="#c9a493" stroke-width="2" stroke-dasharray="10 8"/>`;
    svg += yazi(16, tepeY + 9, `${ADLAR[p.a].split(' ')[0]} ×${oran.toFixed(2)}`, 24, '#7a4a3a', 600);
    // kafa sayısı cetveli: figürün solunda
    const ks = tablo.kafaSayisi[p.a];
    const kafa = (p.zemin - p.tepe) / ks;
    for (let i = 0; i <= Math.floor(ks); i++) svg += `<line x1="${p.x - 26}" x2="${p.x - 12}" y1="${tepeY + i * kafa}" y2="${tepeY + i * kafa}" stroke="#7ab" stroke-width="3"/>`;
    svg += `<line x1="${p.x - 19}" x2="${p.x - 19}" y1="${tepeY}" y2="${zeminY}" stroke="#7ab" stroke-width="2"/>`;
    svg += yazi(p.x + p.w / 2, zeminY + 52, ADLAR[p.a], 34, '#401312', 700, 'middle');
    svg += yazi(p.x + p.w / 2, zeminY + 90, `boy ×${tablo.boy[p.a]} · ${ks} kafa`, 24, '#7a4a3a', 500, 'middle');
  }
  svg += `<line x1="${SOL - 20}" x2="${GEN - 30}" y1="${zeminY}" y2="${zeminY}" stroke="#c9a493" stroke-width="4"/>`;
  svg += yazi(16, zeminY + 9, 'zemin', 24, '#7a4a3a', 600);
  svg += yazi(GEN - 30, YUK - 18, 'Kino ve Ailesi · kukla kitleri v5 (Kino C ile aynı ölçek) · mavi çentikler: kafa boyu', 20, '#a08070', 500, 'end');
  svg += '</svg>';
  const taban = await sharp(Buffer.from(svg)).png().toBuffer();
  await sharp(taban).composite(yerler.map((p) => ({ input: p.img, left: p.x, top: p.y }))).png().toFile(CIKTI);
  for (const p of yerler) console.log(p.a.padEnd(6), 'boy/kino', ((p.zemin - p.tepe) / kinoBoy).toFixed(3), 'tablo', tablo.boy[p.a]);
  console.log(CIKTI);

  // ---------- önce / sonra: v4 sayfasının yetişkin yarısı | v5'inki (aynı yükseklikte yan yana) ----------
  const V4 = path.join(__dirname, '..', '..', 'v4', 'aile-model.png');
  if (fs.existsSync(V4)) {
    const m4 = await sharp(V4).metadata();
    // v4 düzeninde Kino 1150 px civarından başlar (sayfa donmuş): yetişkinler 0-1140
    const a4 = await sharp(V4).extract({ left: 0, top: 0, width: 1140, height: m4.height }).png().toBuffer();
    const kes = yerler.find((p) => p.a === 'kino').x - 40;
    const a5 = await sharp(CIKTI).extract({ left: 0, top: 0, width: kes, height: YUK }).png().toBuffer();
    const H2 = 1300, BAS = 80;
    const r4 = await sharp(a4).resize({ height: H2 }).png().toBuffer({ resolveWithObject: true });
    const r5 = await sharp(a5).resize({ height: H2 }).png().toBuffer({ resolveWithObject: true });
    const W2 = r4.info.width + r5.info.width + 40;
    const ust = `<svg xmlns="http://www.w3.org/2000/svg" width="${W2}" height="${H2 + BAS}"><rect width="100%" height="100%" fill="#fcfbf9"/>` +
      yazi(r4.info.width / 2, 54, 'ÖNCE · v4', 40, '#7a4a3a', 700, 'middle') +
      yazi(r4.info.width + 40 + r5.info.width / 2, 54, 'SONRA · v5', 40, '#401312', 700, 'middle') +
      `<line x1="${r4.info.width + 20}" x2="${r4.info.width + 20}" y1="20" y2="${H2 + BAS - 20}" stroke="#c9a493" stroke-width="3"/></svg>`;
    const cikti2 = path.join(path.dirname(CIKTI), 'once-sonra.png');
    await sharp(Buffer.from(ust)).composite([{ input: r4.data, left: 0, top: BAS }, { input: r5.data, left: r4.info.width + 40, top: BAS }]).png().toFile(cikti2);
    console.log(cikti2);
  }
})().catch((e) => { console.error(e); process.exit(1); });
