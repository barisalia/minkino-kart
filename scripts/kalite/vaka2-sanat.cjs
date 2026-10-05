// Dedektif Vaka 2 sanatini Recraft sayfalarindan indirip keser.
// Kullanim: node scripts/kalite/vaka2-sanat.cjs <ham-klasor>
// Sayfalar beyaz/acik fonlu; fon kenardan taşkin doldurmayla seffaflanir (ic beyazlar korunur).
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const HAM = process.argv[2] || 'ham';
const CIKTI = 'assets/dedektif2';
fs.mkdirSync(HAM, { recursive: true });
fs.mkdirSync(CIKTI, { recursive: true });

const U = 'https://img.recraft.ai/';
const SAYFALAR = {
  'kino-sheet': U + 'f7Ka43Nel0PHBRttmQgZCIU2RcJwzHg1-Kv2I57-ZUQ/rs:fit:4096:2286:0/raw:1/plain/abs://external/images/4f389a8d-fa6c-423c-b46f-5f467d79e7ba',
  'ordek-sheet': U + 'y8RvOlG7c8zhCT6UXTFnnrJX6Adz2oGV4wQYrI3ODz0/rs:fit:4096:2286:0/raw:1/plain/abs://external/images/db257289-ca11-4add-8bf8-09f213125288',
  roman: U + 'xi61O8jSJn5i9ufhFSXJ5Gn4kkjXiDr87L87HyN5Ky0/rs:fit:4096:3058:0/raw:1/plain/abs://external/images/53549c74-5501-4b6c-a816-9c3b3fbd4ae6',
  'bahce-ip': U + 'OB5aGDty11Py_yOTQOHPZmEpTwTgjeswn4zu7c__N_A/rs:fit:4096:2286:0/raw:1/plain/abs://external/images/ec6623b3-624b-4ad7-9b2f-7dafd2f0d610',
  'bahce-yol': U + '8Huig2kMV1uIe68_s6eilcT9yyN-lbKpaChepzG3t0M/rs:fit:4096:2286:0/raw:1/plain/abs://external/images/ce1a4245-3b90-44ac-a847-15b24a7a0d8b',
  'bahce-golet': U + 'RIrUa0bLU6bX6-H4txn5z_MlgRHqPTZgUf8FhuHWxzs/rs:fit:4096:2286:0/raw:1/plain/abs://external/images/e0fede53-f8d3-4712-979e-59954e2896e8',
  'esya-sheet': U + '5dDDlGJGaQeAIZ9APr5bqAO6J78E7nRZ2bjb-5nyTh4/rs:fit:2688:1536:0/raw:1/plain/abs://external/images/dae15ec6-4a65-418b-91d8-6994cc2ef4e9',
  'kart-sheet': U + 'hKmA_DV_eVvfCMAfEJ7E10Ljn1EsfouJzg4nY1xWj-A/rs:fit:2688:1536:0/raw:1/plain/abs://external/images/120c8136-7cda-452f-9df5-84af53943fe1',
  'atki-sheet': U + '3QY9EDjsi1Ve00V0JujhEOaW3TqXCiqzlSBzQhT31SU/raw:1/plain/abs://prod/images/9adf6ea6-dea4-4848-9be0-4fb1377c47e8',
};

// Kesimler: sayfa, ad, [x0,y0,x1,y1] oransal hucre
const g3 = (r, c) => [c / 3, r / 3, (c + 1) / 3, (r + 1) / 3];
const KESIM = [
  ['kino-sheet', 'kino-uzgun', [0, 0, 0.5, 1]],
  ['kino-sheet', 'kino-sarilma', [0.5, 0, 1, 1]],
  ['ordek-sheet', 'ordek-kulucka', [0, 0, 0.405, 1]],
  ['ordek-sheet', 'yavru-atki', [0.405, 0, 0.69, 1]],
  ['ordek-sheet', 'ordek-atki-gaga', [0.69, 0, 1, 1]],
  ['atki-sheet', 'atki-asili', [0, 0, 0.31, 1]],
  ['atki-sheet', 'atki-yerde', [0.31, 0, 0.665, 1]],
  ['atki-sheet', 'ordek-izi', [0.665, 0, 1, 1]],
  ['esya-sheet', 'mandal', g3(0, 2)],
  ['esya-sheet', 'iplik-kirmizi', g3(1, 1)],
  ['esya-sheet', 'ip-mavi', g3(1, 2)],
  ['esya-sheet', 'yaprak', g3(2, 0)],
  ['esya-sheet', 'yuva-yumurta', g3(2, 1)],
  ['esya-sheet', 'yumurta-catlak', g3(2, 2)],
  ['kart-sheet', 'kart-kopek-izi', g3(0, 0)],
  ['kart-sheet', 'kart-tavsan-izi', g3(0, 1)],
  ['kart-sheet', 'kart-ordek-izi', g3(0, 2)],
  ['kart-sheet', 'kart-makas', g3(1, 0)],
  ['kart-sheet', 'kart-ruzgar', g3(1, 1)],
  ['kart-sheet', 'kart-yagmur', g3(1, 2)],
  ['kart-sheet', 'kart-kurbaga', g3(2, 0)],
  ['kart-sheet', 'kart-ari', g3(2, 1)],
];

async function indir(ad) {
  const yol = path.join(HAM, ad + '.png');
  if (!fs.existsSync(yol)) {
    const r = await fetch(SAYFALAR[ad]);
    if (!r.ok) throw new Error(ad + ' ' + r.status);
    await sharp(Buffer.from(await r.arrayBuffer())).png().toFile(yol);
  }
  return yol;
}

// Kenardan taskin doldurma ile fonu seffaflar, yumusak kenar + 1px iceri cekme (hale yok)
async function kes(kaynak, kutu, hedef) {
  const m = await sharp(kaynak).metadata();
  const x0 = Math.round(kutu[0] * m.width), y0 = Math.round(kutu[1] * m.height);
  const w = Math.round(kutu[2] * m.width) - x0, h = Math.round(kutu[3] * m.height) - y0;
  const { data } = await sharp(kaynak).extract({ left: x0, top: y0, width: w, height: h })
    .removeAlpha().raw().toBuffer({ resolveWithObject: true });
  // fon rengi: kose ortalamasi
  let br = 0, bg = 0, bb = 0, n = 0;
  for (const [cx, cy] of [[2, 2], [w - 3, 2], [2, h - 3], [w - 3, h - 3]]) {
    const i = (cy * w + cx) * 3; br += data[i]; bg += data[i + 1]; bb += data[i + 2]; n++;
  }
  br /= n; bg /= n; bb /= n;
  const uzak = new Float32Array(w * h);
  for (let p = 0; p < w * h; p++) {
    const i = p * 3;
    uzak[p] = Math.max(Math.abs(data[i] - br), Math.abs(data[i + 1] - bg), Math.abs(data[i + 2] - bb));
  }
  const ESIK = 28;
  const fon = new Uint8Array(w * h);
  const yigin = [];
  const it = (p) => { if (!fon[p] && uzak[p] < ESIK) { fon[p] = 1; yigin.push(p); } };
  for (let x = 0; x < w; x++) { it(x); it((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { it(y * w); it(y * w + w - 1); }
  while (yigin.length) {
    const p = yigin.pop(), x = p % w, y = (p / w) | 0;
    if (x > 0) it(p - 1); if (x < w - 1) it(p + 1); if (y > 0) it(p - w); if (y < h - 1) it(p + w);
  }
  // alfa: fon 0; fona komsu on plan pikselleri (kenar) 1px kucult + yumusat
  const alfa = new Uint8Array(w * h);
  for (let p = 0; p < w * h; p++) alfa[p] = fon[p] ? 0 : 255;
  const a2 = new Uint8Array(alfa);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const p = y * w + x;
    if (!alfa[p]) continue;
    let k = 0;
    for (const d of [-1, 1, -w, w]) if (!alfa[p + d]) k++;
    if (k) a2[p] = 0; // 1px iceri cek
  }
  const a3 = new Uint8Array(a2);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const p = y * w + x;
    if (!a2[p]) continue;
    let k = 0;
    for (const d of [-1, 1, -w, w, -w - 1, -w + 1, w - 1, w + 1]) if (!a2[p + d]) k++;
    if (k) a3[p] = Math.round(255 * (1 - k / 10));
  }
  // hucre kenarina degen parcalar komsu cizimdendir: at
  const gor = new Uint8Array(w * h);
  const parcalar = [];
  for (let s = 0; s < w * h; s++) {
    if (!a3[s] || gor[s]) continue;
    const liste = [s]; gor[s] = 1; let kenar = false;
    for (let k = 0; k < liste.length; k++) {
      const p = liste[k], x = p % w, y = (p / w) | 0;
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) kenar = true;
      for (const q of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, y > 0 ? p - w : -1, y < h - 1 ? p + w : -1])
        if (q >= 0 && a3[q] && !gor[q]) { gor[q] = 1; liste.push(q); }
    }
    parcalar.push({ liste, kenar });
  }
  const enBuyuk = Math.max(...parcalar.map((q) => q.liste.length));
  for (const q of parcalar)
    if ((q.kenar && q.liste.length < enBuyuk * 0.3) || q.liste.length < 40) for (const p of q.liste) a3[p] = 0;
  // kirpma kutusu bul
  let mx0 = w, my0 = h, mx1 = 0, my1 = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (a3[y * w + x] > 0) {
    if (x < mx0) mx0 = x; if (x > mx1) mx1 = x; if (y < my0) my0 = y; if (y > my1) my1 = y;
  }
  const rgba = Buffer.alloc(w * h * 4);
  for (let p = 0; p < w * h; p++) {
    rgba[p * 4] = data[p * 3]; rgba[p * 4 + 1] = data[p * 3 + 1]; rgba[p * 4 + 2] = data[p * 3 + 2]; rgba[p * 4 + 3] = a3[p];
  }
  const pay = 8;
  const L = Math.max(0, mx0 - pay), T = Math.max(0, my0 - pay);
  const W = Math.min(w, mx1 + pay + 1) - L, H = Math.min(h, my1 + pay + 1) - T;
  await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left: L, top: T, width: W, height: H })
    .webp({ quality: 86, alphaQuality: 100 }).toFile(hedef);
  return [W, H];
}

(async () => {
  for (const ad of Object.keys(SAYFALAR)) await indir(ad);
  // sahneler: opak, 4096 genislik
  for (const s of ['bahce-ip', 'bahce-yol', 'bahce-golet']) {
    await sharp(path.join(HAM, s + '.png')).resize(4096).removeAlpha().webp({ quality: 86 }).toFile(`${CIKTI}/${s}.webp`);
  }
  // roman: 2x2, ic siyah cerceveyi atmak icin hucre iceri kirpilir, 4:3
  const rm = await sharp(path.join(HAM, 'roman.png')).metadata();
  const hw = rm.width / 2, hh = rm.height / 2;
  for (let i = 0; i < 4; i++) {
    const c = i % 2, r = (i / 2) | 0;
    const ix = Math.round(hw * 0.06), iy = Math.round(hh * 0.07);
    let cw = Math.round(hw - 2 * ix), ch = Math.round(cw * 3 / 4);
    if (ch > hh - 2 * iy) { ch = Math.round(hh - 2 * iy); cw = Math.round(ch * 4 / 3); }
    const L = Math.round(c * hw + (hw - cw) / 2), T = Math.round(r * hh + (hh - ch) / 2);
    await sharp(path.join(HAM, 'roman.png')).extract({ left: L, top: T, width: cw, height: ch })
      .resize(2048, 1536).removeAlpha().webp({ quality: 86 }).toFile(`${CIKTI}/roman-${i + 1}.webp`);
  }
  for (const [sayfa, ad, kutu] of KESIM) {
    const r = await kes(path.join(HAM, sayfa + '.png'), kutu, `${CIKTI}/${ad}.webp`);
    console.log(ad, r.join('x'));
  }
  // kart-ordek: mevcut ordek cizimi (model ile birebir ayni)
  await sharp('assets/hayvanlar/ordek.webp').webp({ quality: 86, alphaQuality: 100 }).toFile(`${CIKTI}/kart-ordek.webp`);
  console.log('tamam');
})();
