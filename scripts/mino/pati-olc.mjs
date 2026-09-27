// Mino profil bacaklarının yere değen geometrisini ölçer → src/mino/yuruyus.ts içindeki PATI / ZEMIN sabitleri.
// Kaynak: ekip/mino/mino-profil.svg (bacak-on / bacak-arka katmanları tek WebP resim) + mino-profil.json (dönme).
// Bacak kalçadan dönünce en alta inen nokta her zaman bacağın opak piksellerinin DIŞBÜKEY ZARFININ bir köşesidir;
// bu yüzden katmanın opak piksellerinden dışbükey zarf çıkarılır, alttaki (yere değebilecek) köşeler yazdırılır.
// Çizim değişince: node scripts/mino/pati-olc.mjs → çıktıyı yuruyus.ts'e yapıştır (PATI, ZEMIN), profil.mjs'teki
// TABAN'ı güncelle, node scripts/mino/profil.mjs, npm test. (İsteğe bağlı 1. argüman: başka bir profil SVG'si.)
import fs from 'node:fs';
import sharp from 'sharp';

const kaynak = fs.readFileSync(process.argv[2] ?? 'ekip/mino/mino-profil.svg', 'utf8');
const bilgi = JSON.parse(fs.readFileSync('ekip/mino/mino-profil.json', 'utf8').replace(/^﻿/, ''));
/** opaklık eşiği (kenar yumuşatmasının yarısı) */
const ESIK = 128;
/** zarfın yalnız alt kısmı: kalçadan bu kadar aşağıdaki köşeler (±25° dönüşte daha yukarısı yere inemez) */
const ALT_PAY = 150;

function resim(id) {
  const bas = kaynak.indexOf(`<g id="${id}"`);
  const son = kaynak.indexOf('</g>', bas);
  const m = kaynak.slice(bas, son).match(/<image x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"[^>]*href="data:image\/webp;base64,([^"]+)"/);
  if (!m) throw new Error(`Resim yok: ${id}`);
  return { x: +m[1], y: +m[2], w: +m[3], h: +m[4], veri: Buffer.from(m[5], 'base64') };
}

/** Andrew monotone zinciri: dışbükey zarf (saat yönünün tersi, y aşağı) */
function zarf(noktalar) {
  const p = [...noktalar].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cap = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const alt = [];
  for (const q of p) {
    while (alt.length >= 2 && cap(alt[alt.length - 2], alt[alt.length - 1], q) <= 0) alt.pop();
    alt.push(q);
  }
  const ust = [];
  for (const q of p.reverse()) {
    while (ust.length >= 2 && cap(ust[ust.length - 2], ust[ust.length - 1], q) <= 0) ust.pop();
    ust.push(q);
  }
  return alt.slice(0, -1).concat(ust.slice(0, -1));
}

const sonuc = {};
for (const ad of ['bacak-on', 'bacak-arka']) {
  const r = resim(ad);
  const { data, info } = await sharp(r.veri).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const kx = r.w / info.width;
  const ky = r.h / info.height;
  // her satırın en sol / en sağ opak pikseli yeter (zarf bunlardan çıkar); piksel köşeleri çizim birimine
  const nokta = [];
  for (let j = 0; j < info.height; j++) {
    let sol = -1;
    let sag = -1;
    for (let i = 0; i < info.width; i++) {
      if (data[(j * info.width + i) * 4 + 3] >= ESIK) {
        if (sol < 0) sol = i;
        sag = i;
      }
    }
    if (sol < 0) continue;
    for (const [i, dj] of [[sol, 0], [sol, 1], [sag + 1, 0], [sag + 1, 1]]) nokta.push([r.x + i * kx, r.y + (j + dj) * ky]);
  }
  const [, py] = bilgi.donme[ad];
  // alttaki köşeler; yakın köşeler (< 6 birim) birleşir
  const kose = [];
  for (const [x, y] of zarf(nokta)) {
    if (y < py + ALT_PAY) continue;
    const q = [Math.round(x), Math.round(y)];
    if (!kose.some((k) => Math.hypot(k[0] - q[0], k[1] - q[1]) < 6)) kose.push(q);
  }
  // en alttaki (taban) önce: yürüyüşte kaymama ölçüsü bu nokta; eşitse ortadaki
  const enAlt = Math.max(...kose.map((k) => k[1]));
  const taban = kose.filter((k) => k[1] >= enAlt - 1);
  const ortaX = taban.reduce((s, k) => s + k[0], 0) / taban.length;
  kose.sort((a, b) => b[1] - a[1] || Math.abs(a[0] - ortaX) - Math.abs(b[0] - ortaX));
  sonuc[ad] = { taban: enAlt, tabanX: Math.round(ortaX), kose };
}

for (const [ad, s] of Object.entries(sonuc)) {
  console.log(`${ad}: taban y ${s.taban}, orta x ${s.tabanX}, kalça ${bilgi.donme[ad]}`);
}
console.log('\nZEMIN =', Math.max(...Object.values(sonuc).map((s) => s.taban)));
console.log('\nconst PATI = {');
for (const [ad, s] of Object.entries(sonuc)) console.log(`  '${ad}': [${s.kose.map((k) => `[${k[0]}, ${k[1]}]`).join(', ')}],`);
console.log('};');
