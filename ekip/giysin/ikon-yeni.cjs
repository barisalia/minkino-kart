/**
 * Dolap ikonlarının yeniden çizilmiş hâli (nano_banana_pro, 2×2 sayfa, 2048): ekip/giysin/ikon-nano-{a,b,c}.webp.
 * Eski ikonlar Kino'nun üstünden kesildiği için boyun deliği, kopuk kontur ve komşu giysi parçaları taşıyordu.
 * Beyaz zemin kenardan taşmayla silinir (kontur içindeki beyazlar kalır), her çeyrekteki en büyük parça(lar) alınır,
 * kırpılır, en çok 480 px. Yalnız ikon/ yazılır (Kino'nun üstündeki giysi/ çizimleri değişmez).
 * node ekip/giysin/ikon-yeni.cjs
 */
const sharp = require('sharp');
const fs = require('fs');
const C = 'assets/giysin/ikon/';
const Q = { quality: 90, alphaQuality: 100, smartSubsample: true };
const SAYFA = {
  a: ['hirka', 'mont', 'yagmurluk', 'mayo'],
  b: ['atki', 'sort', 'sandalet', 'corap'],
  c: [null, 'bere', 'bot', 'cizme'],
};
// c sayfasının sol üstü (kısa kollu mayo) a'daki mayodan (askılı) daha doğru: onu al
SAYFA.c[0] = 'mayo';
SAYFA.a[3] = null;
const EN = 480;

async function sayfa(harf, adlar) {
  const { data, info } = await sharp(`ekip/giysin/ikon-nano-${harf}.webp`).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, Y = info.height;
  const beyaz = (j) => Math.min(data[j * 3], data[j * 3 + 1], data[j * 3 + 2]) > 228;
  // kenardan taşma: dışarıdaki beyaz
  const dis = new Uint8Array(W * Y);
  const st = [];
  for (let i = 0; i < W; i++) st.push(i, (Y - 1) * W + i);
  for (let i = 0; i < Y; i++) st.push(i * W, i * W + W - 1);
  while (st.length) {
    const j = st.pop();
    if (dis[j] || !beyaz(j)) continue;
    dis[j] = 1;
    const x = j % W;
    if (x > 0) st.push(j - 1);
    if (x < W - 1) st.push(j + 1);
    if (j >= W) st.push(j - W);
    if (j < W * (Y - 1)) st.push(j + W);
  }
  const rgba = Buffer.alloc(W * Y * 4);
  for (let j = 0; j < W * Y; j++) {
    rgba[j * 4] = data[j * 3];
    rgba[j * 4 + 1] = data[j * 3 + 1];
    rgba[j * 4 + 2] = data[j * 3 + 2];
    let a = dis[j] ? 0 : 255;
    if (!dis[j]) {
      // dışa komşu kenar pikseli: beyazlığına göre yarı saydam (hale kalmaz)
      const x = j % W;
      const komsu = (x > 0 && dis[j - 1]) || (x < W - 1 && dis[j + 1]) || (j >= W && dis[j - W]) || (j < W * (Y - 1) && dis[j + W]);
      if (komsu) a = Math.max(0, Math.min(255, Math.round(((255 - Math.min(data[j * 3], data[j * 3 + 1], data[j * 3 + 2])) / 70) * 255)));
    }
    rgba[j * 4 + 3] = a;
  }
  const yari = W / 2;
  for (let q = 0; q < 4; q++) {
    const ad = adlar[q];
    if (!ad) continue;
    const left = (q % 2) * yari, top = Math.floor(q / 2) * yari;
    const parca = await sharp(rgba, { raw: { width: W, height: Y, channels: 4 } }).extract({ left, top, width: yari, height: yari }).png().toBuffer();
    const kirp = await sharp(parca).trim({ threshold: 1 }).png().toBuffer();
    const yol = `${C}${ad}.webp`;
    await sharp(kirp).resize(EN, EN, { fit: 'inside' }).webp(Q).toFile(yol);
    const m = await sharp(yol).metadata();
    console.log(ad, m.width, m.height);
  }
}

(async () => {
  for (const [h, adlar] of Object.entries(SAYFA)) await sayfa(h, adlar);
  if (!fs.existsSync(C)) throw new Error('ikon klasörü yok');
})();
