// Doğum Günü parti pozları (ekip/gemini/yeni/netlik/dg-<ad>-pozlar-a|b.png, 2752×1536, sayfa başına 4 poz) → kare kare kesim.
// Her poz sayfadaki bağlı bileşenlerle ayrılır (dar aralıklı kareler de: elif-b 2-3 arası ~40 px); komşu karenin pikselleri beyaza boyanır.
// Çıktı: <ara>/girdi/<ad>-<poz>.png (beyaz zeminli kesim). Zemin temizliği ve hiza dg-poz-isle.cjs'te.
const fs = require('fs'), path = require('path');
const KOK = path.resolve(__dirname, '..', '..');
const s = require(require.resolve('sharp', { paths: [KOK] }));

const SAYFA_POZ = {
  a: ['normal', 'sapkali', 'alkis', 'dans'],
  b: ['dans2', 'saskin', 'selam', 'saklaniyor'],
  bAda: ['dans2', 'saskin', 'mutlu', 'dilek'],
};
const ADLAR = ['ada', 'can', 'deniz', 'elif', 'zeynep'];

/**
 * Elle dikiş: birbirine değen karelerin sınırı (sayfa px, yukarıdan aşağı [x, y]). Dikişin solu soldaki kareye, sağı
 * sağdakine (genişletme yok; ortak konturun soldaki karede kalan yarısı yeter).
 * can-b: selam elinin parmakları saklanan Can'ın saçına ve kulağına değiyor; dikiş saçın ve kulağın dış konturunda.
 */
const DIKIS = {
  'can-b': [[2125, 0], [2125, 528], [2150, 532], [2154, 560], [2157, 590], [2161, 612], [2166, 635], [2170, 650], [2160, 660], [2151, 675], [2148, 697], [2149, 722], [2154, 760], [2154, 1536]],
};
const dikisX = (d, y) => {
  for (let i = 1; i < d.length; i++) if (y <= d[i][1]) { const [xa, ya] = d[i - 1], [xb, yb] = d[i]; return xa + ((xb - xa) * (y - ya)) / Math.max(1, yb - ya); }
  return d[d.length - 1][0];
};

async function sayfaBol(dosya, pozlar, cikDizin, onek, dikis = null) {
  const { data, info } = await s(dosya).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, n = W * H;
  const fg = new Uint8Array(n);
  for (let i = 0; i < n; i++) { const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b); fg[i] = mn < 228 || mx - mn > 30 ? 1 : 0; }
  // bağlı bileşenler (8 komşu)
  const et = new Int32Array(n).fill(-1), q = new Int32Array(n), bil = [];
  for (let i = 0; i < n; i++) {
    if (!fg[i] || et[i] >= 0) continue;
    let b = 0, e = 0; q[e++] = i; et[i] = bil.length; let x0 = W, y0 = H, x1 = 0, y1 = 0, sx = 0;
    while (b < e) { const p = q[b++], x = p % W, y = (p / W) | 0; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); sx += x;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; const r = yy * W + xx; if (fg[r] && et[r] < 0) { et[r] = bil.length; q[e++] = r; } } }
    bil.push({ alan: e, x0, y0, x1, y1, cx: sx / e });
  }
  // birbirine değen iki kare (ör. can-b: selam eli yandakinin saçına değiyor): en geniş büyük parça, ortadaki en ince sütunundan ikiye
  const ciftler = []; // [sol bileşen, sağ bileşen]
  for (;;) {
    const enb = Math.max(...bil.map((b) => b.alan));
    const buyukler = bil.map((b, i) => ({ ...b, i })).filter((b) => b.alan >= enb * 0.15);
    if (buyukler.length >= pozlar.length) break;
    const B = buyukler.sort((a, b) => b.x1 - b.x0 - (a.x1 - a.x0))[0];
    const sutun = new Int32Array(W);
    for (let y = B.y0; y <= B.y1; y++) for (let x = B.x0; x <= B.x1; x++) if (et[y * W + x] === B.i) sutun[x]++;
    const w = B.x1 - B.x0;
    let kes = -1, en = 1e9;
    for (let x = B.x0 + Math.round(w * 0.3); x <= B.x0 + Math.round(w * 0.7); x++) if (sutun[x] < en) { en = sutun[x]; kes = x; }
    const yeni = bil.length, k1 = { alan: 0, sx: 0, x0: W, y0: H, x1: 0, y1: 0 }, k2 = { alan: 0, sx: 0, x0: W, y0: H, x1: 0, y1: 0 };
    for (let y = B.y0; y <= B.y1; y++) for (let x = B.x0; x <= B.x1; x++) {
      const i = y * W + x; if (et[i] !== B.i) continue;
      const sag = dikis ? x >= dikisX(dikis, y) : x >= kes;
      const k = sag ? k2 : k1; if (sag) et[i] = yeni;
      k.alan++; k.sx += x; k.x0 = Math.min(k.x0, x); k.x1 = Math.max(k.x1, x); k.y0 = Math.min(k.y0, y); k.y1 = Math.max(k.y1, y);
    }
    const bk = (k) => ({ alan: k.alan, x0: k.x0, y0: k.y0, x1: k.x1, y1: k.y1, cx: k.sx / k.alan });
    bil[B.i] = bk(k1); bil.push(bk(k2)); ciftler.push([B.i, yeni]);
    console.log(`${onek}: değen kareler x=${kes} sütunundan ayrıldı (${en} px temas)${dikis ? ', elle dikişten' : ''}`);
  }
  const sirali = bil.map((b, i) => ({ ...b, i })).sort((a, b) => b.alan - a.alan);
  const buyuk = sirali.slice(0, pozlar.length).sort((a, b) => a.cx - b.cx);
  if (Math.min(...buyuk.map((b) => b.alan)) < sirali[0].alan * 0.15) throw new Error(`${onek}: ${pozlar.length} büyük parça bulunamadı (kareler birbirine değiyor olabilir)`);
  // küçük parçalar (ponpon, ayrık çizgi) en yakın kareye
  const kare = new Int32Array(bil.length).fill(-1);
  buyuk.forEach((b, k) => (kare[b.i] = k));
  for (const b of sirali.slice(pozlar.length)) {
    if (b.alan < 12) continue;
    const mx = (b.x0 + b.x1) / 2, my = (b.y0 + b.y1) / 2;
    let en = 1e9, ek = -1;
    buyuk.forEach((B, k) => { const dx = Math.max(B.x0 - mx, 0, mx - B.x1), dy = Math.max(B.y0 - my, 0, my - B.y1), d = Math.hypot(dx, dy); if (d < en) { en = d; ek = k; } });
    if (en < 120) kare[b.i] = ek;
  }
  const kutular = buyuk.map(() => ({ x0: W, y0: H, x1: 0, y1: 0 }));
  for (let i = 0; i < bil.length; i++) { const k = kare[i]; if (k < 0) continue; const b = bil[i], K = kutular[k]; K.x0 = Math.min(K.x0, b.x0); K.y0 = Math.min(K.y0, b.y0); K.x1 = Math.max(K.x1, b.x1); K.y1 = Math.max(K.y1, b.y1); }
  const PAY = 24, KOMSU = 4;
  const sonuc = [];
  for (let k = 0; k < buyuk.length; k++) {
    const K = kutular[k], x0 = Math.max(0, K.x0 - PAY), y0 = Math.max(0, K.y0 - PAY), x1 = Math.min(W - 1, K.x1 + PAY), y1 = Math.min(H - 1, K.y1 + PAY);
    const w = x1 - x0 + 1, h = y1 - y0 + 1, out = Buffer.alloc(w * h * 3);
    // bu kareye ait olmayan her bileşen (ve KOMSU px çevresi) beyaz
    const yabanci = new Uint8Array(w * h);
    const kendi = buyuk[k].i;
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
      const e = et[y * W + x]; if (e < 0 || kare[e] === k) continue;
      // ayrılmış çift: genişletmeden yalnız dikişe göre (genişletme yok)
      const cift = ciftler.find((c) => c.includes(e) && c.includes(kendi));
      if (cift) { const dx = dikis ? dikisX(dikis, y) : x; if (kendi === cift[0] && x < dx) continue; yabanci[(y - y0) * w + x - x0] = 1; continue; }
      for (let dy = -KOMSU; dy <= KOMSU; dy++) for (let dx = -KOMSU; dx <= KOMSU; dx++) { const xx = x - x0 + dx, yy = y - y0 + dy; if (xx >= 0 && yy >= 0 && xx < w && yy < h) yabanci[yy * w + xx] = 1; } }
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const o = (y * w + x) * 3, i = ((y + y0) * W + x + x0) * 3; if (yabanci[y * w + x]) { out[o] = out[o + 1] = out[o + 2] = 255; } else { out[o] = data[i]; out[o + 1] = data[i + 1]; out[o + 2] = data[i + 2]; } }
    // dikişin solundaki karede, dikişe 16 px yakın koyu pikseller (öbür karenin saç konturu) ten yakınında değilse silinir;
    // parmak uçlarının kesik kenarındaki koyu çizgi (ten yanında) kontur olarak kalır
    const solKare = ciftler.some((c) => c[0] === buyuk[k].i);
    if (dikis && solKare) {
      const px = (xx, yy) => (yy * w + xx) * 3;
      const ten = (o) => out[o] > 190 && out[o + 1] > 120 && Math.min(out[o], out[o + 1], out[o + 2]) < 235;
      const sil = [];
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const dx = dikisX(dikis, y + y0) - (x + x0); if (dx < 0 || dx > 16) continue;
        const o = px(x, y); if ((out[o] * 3 + out[o + 1] * 6 + out[o + 2]) / 10 > 140) continue;
        let yakin = false;
        for (let yy = Math.max(0, y - 6); yy <= Math.min(h - 1, y + 6) && !yakin; yy++) for (let xx = Math.max(0, x - 6); xx <= Math.min(w - 1, x + 6); xx++) if (ten(px(xx, yy))) { yakin = true; break; }
        if (!yakin) sil.push(o);
      }
      for (const o of sil) out[o] = out[o + 1] = out[o + 2] = 255;
    }
    const ad = `${onek}-${pozlar[k]}`;
    await s(out, { raw: { width: w, height: h, channels: 3 } }).png().toFile(path.join(cikDizin, ad + '.png'));
    sonuc.push({ ad, x0, y0, w, h, ayak: K.y1 });
  }
  return sonuc;
}

module.exports = { sayfaBol, SAYFA_POZ, ADLAR, DIKIS };

if (require.main === module) {
  (async () => {
    const G = process.argv[2], CIK = process.argv[3];
    fs.mkdirSync(CIK, { recursive: true });
    for (const ad of ADLAR) for (const y of ['a', 'b']) {
      const pozlar = y === 'a' ? SAYFA_POZ.a : ad === 'ada' ? SAYFA_POZ.bAda : SAYFA_POZ.b;
      const r = await sayfaBol(path.join(G, `dg-${ad}-pozlar-${y}.png`), pozlar, CIK, ad, DIKIS[`${ad}-${y}`]);
      console.log(r.map((x) => `${x.ad} ${x.w}x${x.h} ayak ${x.ayak}`).join(' | '));
    }
  })();
}
