// Doğum Günü parti pozları, netlik çizimi (ekip/gemini/yeni/netlik/dg-<ad>-pozlar-a|b.png, 2752×1536, sayfa başına 4 poz)
// → assets/parti-ifade/<ad>/<poz>.webp, eski dosyaların yerine: aynı ad, aynı tuval oranı, N kat büyük (N tamsayı).
//   node ekip/illustrator/dg-poz-isle.cjs [ad ...]        (repo kökünden; ad: ada can deniz elif zeynep)
//
// 1) Kesim: dg-poz-bol.cjs (bağlı bileşenler; değen kareler elle dikişle ayrılır).
// 2) Zemin: gemini-esya.cjs (kenardan akıtma, halesiz, kayıpsız ara çıktı).
// 3) Hiza: her yeni poz, oyundaki eski pozuna (ESKI_REF commit'indeki dosya; iskelet bu tuvale göre hizalı,
//    ege-cocuk.ts HIZA) alfa örtüşmesiyle oturtulur: ölçek + yatay kayma IoU'yu en büyütür, ayak (alfa kutusunun altı)
//    eski pozun ayağıyla aynı satırda. Böylece poz başına ölçek ayrıdır (zeynep-b'nin 2. karesi daha küçük çizilmiş:
//    kendi ölçeğiyle büyür, boyu öbürleriyle eşit olur) ve iskeletli duruştan poza geçişte boy / ayak / konum kaymaz.
// 4) Delik: kollar ile gövde/baş arasında kalan kapalı beyaz zemin (gemini-esya kenardan akıtınca kapalı kalır)
//    saydam yapılır: beyaz bölge eski pozda saydam yere düşüyor ve çoğunlukla koyu konturla çevriliyse.
//    Göz akı, diş, ayakkabı, ponpon eski pozda dolu yere düştüğü için kalır.
// 5) Tuval: eski tuval × N (N = karakterin en küçük poz ölçeği, 0.05 aşağı yuvarlanmış; hiçbir poz büyütülmez).
// Kontrol: <ara>/kontrol-<ad>.png (eski pozun kenarı kırmızı çizgi; ayak çizgisi yeşil; gri zemin delikleri gösterir).
// Daha yüksek çözünürlüklü mevcut dosya ezilmez (guvenli-yaz.cjs; ZORLA=1).
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
const KOK = path.resolve(__dirname, '..', '..');
const s = require(require.resolve('sharp', { paths: [KOK] }));
const guvenliYaz = require('./guvenli-yaz.cjs');
const { sayfaBol, SAYFA_POZ, ADLAR, DIKIS } = require('./dg-poz-bol.cjs');

const G = process.env.DG_GIRDI || path.join(KOK, 'ekip/gemini/yeni/netlik');
const ARA = path.join(os.tmpdir(), 'dg-poz-isle');
/** Eski (oyunda onaylı, iskeletle hizalı) pozların commit'i: hiza bunlara göre yapılır, betik tekrar çalıştırılabilir */
const ESKI_REF = 'a7fd532d';
const secim = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const adlar = ADLAR.filter((a) => !secim.length || secim.includes(a));

const eskiDosya = (ad, poz) => execFileSync('git', ['show', `${ESKI_REF}:assets/parti-ifade/${ad}/${poz}.webp`], { cwd: KOK, maxBuffer: 64 << 20 });

async function alfa(buf) {
  const { data, info } = await s(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, W: info.width, H: info.height };
}
function kutu(a, W, H, esik = 40) {
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (a[(y * W + x) * 4 + 3] > esik) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  return { x0, y0, x1: x1 + 1, y1: y1 + 1 };
}
const maske = (a, W, H) => { const m = new Uint8Array(W * H); for (let i = 0; i < W * H; i++) m[i] = a[i * 4 + 3] > 127 ? 1 : 0; return m; };

/**
 * Yeni pozu eskisine oturt: yeni piksel (x, y) → eski tuval (x / k + tx, y / k + ty). Ayak satırı sabit (alttan),
 * k ve tx IoU ile (önce 1/3 çözünürlükte kaba, sonra tam çözünürlükte ince).
 */
async function oturt(yeniBuf, eskiBuf) {
  const E = await alfa(eskiBuf), Y = await alfa(yeniBuf);
  const eK = kutu(E.data, E.W, E.H), yK = kutu(Y.data, Y.W, Y.H);
  const k0 = (yK.y1 - yK.y0) / (eK.y1 - eK.y0);
  const eM = maske(E.data, E.W, E.H);
  async function iou(k, tx, ty, olcu) {
    // eski tuvalde yeni maskeyi olcu çözünürlükte örnekle
    const w = Math.round(E.W * olcu), h = Math.round(E.H * olcu);
    let kes = 0, bir = 0;
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
      const X = (xx + 0.5) / olcu, Yy = (yy + 0.5) / olcu;
      const e = eM[Math.min(E.H - 1, Yy | 0) * E.W + Math.min(E.W - 1, X | 0)];
      const nx = Math.floor((X - tx) * k), ny = Math.floor((Yy - ty) * k);
      const n = nx >= 0 && ny >= 0 && nx < Y.W && ny < Y.H && Y.data[(ny * Y.W + nx) * 4 + 3] > 127 ? 1 : 0;
      if (e && n) kes++;
      if (e || n) bir++;
    }
    return kes / bir;
  }
  const tyIcin = (k) => eK.y1 - yK.y1 / k; // ayak satırı eşit
  const txOrta = (k) => (eK.x0 + eK.x1) / 2 - ((yK.x0 + yK.x1) / 2) / k;
  let en = { iou: -1 };
  for (let k = k0 * 0.86; k <= k0 * 1.14; k += k0 * 0.01) for (let d = -36; d <= 36; d += 3) {
    const tx = txOrta(k) + d, ty = tyIcin(k), v = await iou(k, tx, ty, 1 / 3);
    if (v > en.iou) en = { iou: v, k, tx, ty };
  }
  const kaba = en;
  for (let k = kaba.k - k0 * 0.012; k <= kaba.k + k0 * 0.012; k += k0 * 0.003) for (let d = -3; d <= 3; d += 1) {
    const tx = kaba.tx + d, ty = tyIcin(k), v = await iou(k, tx, ty, 1);
    if (v > en.iou || en === kaba) en = { iou: v, k, tx, ty };
  }
  return { ...en, k0, E, Y, eK, yK };
}

/**
 * Elle işaretli delikler (eski tuval pikseli): eski pozda o yer dolu olduğu için kendiliğinden bulunmayan, ama yeni
 * çizimde kol ile gövde / baş arasında kalan beyaz zemin. Son tuvalde gözle bulundu (göz akı / diş değil).
 */
const ELLE_DELIK = {
  'ada/saskin': [[188.6, 280]],
  'can/saklaniyor': [[276.9, 377.5]],
  'can/selam': [[295.6, 257.5]],
  'deniz/dans': [[296.9, 208.2], [276.4, 228.7], [102.6, 229.7]],
  'deniz/normal': [[120, 360.5], [252.8, 362.6]],
  'elif/dans': [[299.5, 307.3]],
};

/** Kapalı beyaz zemin bölgelerini saydam yap (bkz. başlık 4); dönen: silinen bölge sayısı */
function delikSil(Y, E, k, tx, ty, elle = []) {
  const { data, W, H } = Y, n = W * H;
  const b = new Uint8Array(n);
  for (let i = 0; i < n; i++) b[i] = data[i * 4 + 3] > 200 && Math.min(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]) > 236 ? 1 : 0;
  const et = new Int32Array(n).fill(-1), q = new Int32Array(n);
  const sil = new Uint8Array(n);
  let sayi = 0;
  // elle işaretlenen noktalar: kesimdeki en yakın beyaz piksel (6 px içinde)
  const tohum = new Set();
  for (const [X, Yo] of elle) {
    const cx = Math.round((X - tx) * k), cy = Math.round((Yo - ty) * k); let en = -1, ed = 99;
    for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) { const x = cx + dx, y = cy + dy; if (x < 0 || y < 0 || x >= W || y >= H || !b[y * W + x]) continue; const d = Math.hypot(dx, dy); if (d < ed) { ed = d; en = y * W + x; } }
    if (en >= 0) tohum.add(en); else console.log(`  UYARI elle delik (${X}, ${Yo}) beyaz bölge bulunamadı`);
  }
  const eskiSaydam = (x, y) => { const X = Math.floor(x / k + tx), Yy = Math.floor(y / k + ty); return X < 0 || Yy < 0 || X >= E.W || Yy >= E.H || E.data[(Yy * E.W + X) * 4 + 3] < 128; };
  for (let i = 0; i < n; i++) {
    if (!b[i] || et[i] >= 0) continue;
    let bb = 0, e = 0; q[e++] = i; et[i] = 1; const uye = [];
    while (bb < e) { const p = q[bb++], x = p % W; uye.push(p); for (const d of [-1, 1, -W, W]) { const r = p + d; if (r < 0 || r >= n || et[r] >= 0 || !b[r]) continue; if ((d === -1 && x === 0) || (d === 1 && x === W - 1)) continue; et[r] = 1; q[e++] = r; } }
    if (uye.length < 30 && !uye.some((p) => tohum.has(p))) continue;
    let dis = 0; for (const p of uye) if (eskiSaydam(p % W, (p / W) | 0)) dis++;
    // 5 px dışındaki halka: koyu kontur oranı
    let hn = 0, hk = 0; const gor = new Set();
    for (const p of uye) { const x = p % W, y = (p / W) | 0; for (const [dx, dy] of [[5, 0], [-5, 0], [0, 5], [0, -5]]) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; const r = yy * W + xx; if (b[r] || gor.has(r)) continue; gor.add(r); hn++; const v = (data[r * 4] + data[r * 4 + 1] + data[r * 4 + 2]) / 3; if (data[r * 4 + 3] > 128 && v < 90) hk++; } }
    if ((dis / uye.length >= 0.5 && hn && hk / hn >= 0.6) || uye.some((p) => tohum.has(p))) { for (const p of uye) sil[p] = 1; sayi++; }
  }
  // sil + 2 px çevresindeki açık kenar pikselleri (kenar yumuşaması): açıklığa göre saydamlaşır
  for (let i = 0; i < n; i++) if (sil[i]) data[i * 4 + 3] = 0;
  const yakin = new Uint8Array(n);
  for (let i = 0; i < n; i++) if (sil[i]) { const x = i % W, y = (i / W) | 0; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < H && !sil[yy * W + xx]) yakin[yy * W + xx] = 1; } }
  for (let i = 0; i < n; i++) if (yakin[i]) {
    const l = (data[i * 4] * 3 + data[i * 4 + 1] * 6 + data[i * 4 + 2]) / 10;
    if (l > 130) data[i * 4 + 3] = Math.round(data[i * 4 + 3] * Math.max(0, Math.min(1, (250 - l) / 120)));
  }
  return sayi;
}

/**
 * Şapka tuvale sığmıyorsa (deniz, zeynep: a sayfasının şapkası eski çizimdekinden ~1.5 kat uzun; tuval oranı değişmesin
 * diye tuval büyütülmez): şapka biraz küçülür (en çok %20) ve kalanı kadar başa oturur (saça gömülür). Şapkanın
 * altından açılan yer aynı sayfadaki şapkasız "normal" pozun saçıyla doldurulur (aynı ölçek; baş hizası alfa ile).
 * P, R: { data, W, H } (RGBA, kesilmiş tam çözünürlük); T: tepeden kazanılacak piksel (P'nin pikseli). P yerinde değişir.
 */
function sapkaSigdir(P, R, T) {
  const { data, W, H } = P, n = W * H;
  const lum = (d, i) => (d[i * 4] * 3 + d[i * 4 + 1] * 6 + d[i * 4 + 2]) / 10;
  // a) şapka çekirdeği: pembe / açık mavi şeritler (üst %40), ponpon (şeridin tepesinin üstündeki açık renk)
  const cekirdek = new Uint8Array(n);
  let ux0 = W, uy0 = H, ux1 = 0, uy1 = 0;
  for (let y = 0; y < H * 0.4; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    if (data[i * 4 + 3] < 200) continue;
    const pembe = r > 190 && r - g > 70 && b - g > 15, mavi = b > 170 && b - r > 55 && g > 120; // ten ve yanak: b < g
    if (pembe || mavi) { cekirdek[i] = 1; ux0 = Math.min(ux0, x); ux1 = Math.max(ux1, x); uy0 = Math.min(uy0, y); uy1 = Math.max(uy1, y); }
  }
  // en büyük bağlı parça şapkadır (kıyafet şeridi vb. üst %40'a girmesin)
  {
    const et = new Int32Array(n).fill(-1), q = new Int32Array(n); let enb = -1, enA = 0; const alan = [];
    for (let i = 0; i < n; i++) { if (!cekirdek[i] || et[i] >= 0) continue; let b = 0, e = 0; q[e++] = i; et[i] = alan.length;
      while (b < e) { const p = q[b++], x = p % W; for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const xx = x + dx, r = p + dy * W + dx; if (xx < 0 || xx >= W || r < 0 || r >= n || !cekirdek[r] || et[r] >= 0) continue; et[r] = alan.length; q[e++] = r; } }
      if (e > enA) { enA = e; enb = alan.length; } alan.push(e); }
    ux0 = W; uy0 = H; ux1 = 0; uy1 = 0;
    for (let i = 0; i < n; i++) if (cekirdek[i]) { if (et[i] !== enb) { cekirdek[i] = 0; continue; } const x = i % W, y = (i / W) | 0; ux0 = Math.min(ux0, x); ux1 = Math.max(ux1, x); uy0 = Math.min(uy0, y); uy1 = Math.max(uy1, y); }
  }
  // ponpon: şeritlerin tepesinin üstünde, ortaya yakın açık renkli (ve koyu konturlu) her şey
  const tepeX = (() => { let s = 0, c = 0; for (let y = uy0; y < uy0 + 6; y++) for (let x = ux0; x <= ux1; x++) if (cekirdek[y * W + x]) { s += x; c++; } return s / c; })();
  for (let y = 0; y < uy0 + 4; y++) for (let x = 0; x < W; x++) { const i = y * W + x; if (data[i * 4 + 3] > 40 && Math.abs(x - tepeX) < (ux1 - ux0) * 0.35) cekirdek[i] = 1; }
  // b) şapka katmanı: çekirdeğin dışbükey örtüsü (şeritteki parlak beyazlar dahil) + 16 px içindeki kontur / kenar pikselleri
  const sol = new Int32Array(H).fill(W), sag = new Int32Array(H).fill(-1);
  for (let i = 0; i < n; i++) if (cekirdek[i]) { const x = i % W, y = (i / W) | 0; sol[y] = Math.min(sol[y], x); sag[y] = Math.max(sag[y], x); }
  const sapka = new Uint8Array(n);
  for (let y = 0; y < H; y++) for (let x = sol[y]; x <= sag[y]; x++) sapka[y * W + x] = 1;
  const D = 16, yakin = new Uint8Array(n);
  for (let i = 0; i < n; i++) if (sapka[i]) { const x = i % W, y = (i / W) | 0; for (let dy = -D; dy <= D; dy++) for (let dx = -D; dx <= D; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < H && dx * dx + dy * dy <= D * D) yakin[yy * W + xx] = 1; } }
  for (let i = 0; i < n; i++) if (yakin[i] && !sapka[i] && (lum(data, i) < 110 || data[i * 4 + 3] < 250)) sapka[i] = 1;
  // satır satır doldur: kontur ile şerit arasındaki açık parlamalar da şapkanın
  { const s0 = new Int32Array(H).fill(W), s1 = new Int32Array(H).fill(-1); for (let i = 0; i < n; i++) if (sapka[i]) { const x = i % W, y = (i / W) | 0; s0[y] = Math.min(s0[y], x); s1[y] = Math.max(s1[y], x); } for (let y = 0; y < H; y++) for (let x = s0[y]; x <= s1[y]; x++) sapka[y * W + x] = 1; }
  let sy1 = 0; for (let i = 0; i < n; i++) if (sapka[i]) sy1 = Math.max(sy1, (i / W) | 0);
  // eski konturun en dış yumuşak pikselleri de gitsin: 3 px genişlet (dikiş temiz saçta kalır)
  { const g = Uint8Array.from(sapka); for (let i = 0; i < n; i++) if (g[i]) { const x = i % W, y = (i / W) | 0; for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < H) sapka[yy * W + xx] = 1; } } }
  // c) normal pozu başa hizala: şapkanın altındaki saç bandında alfa örtüşmesi
  const bant0 = uy1 + 10, bant1 = Math.min(H, uy1 + Math.round(H * 0.18));
  let en = { v: -1, dx: 0, dy: 0 };
  const dy0 = R.H - H, dx0 = Math.round((R.W - W) / 2); // ilk tahmin: ayaklar (kesimin altı) aynı satırda, ortalar üst üste
  for (let dy = dy0 - 50; dy <= dy0 + 50; dy += 2) for (let dx = dx0 - 50; dx <= dx0 + 50; dx += 2) {
    let k = 0, b = 0;
    for (let y = bant0; y < bant1; y += 2) for (let x = 0; x < W; x += 2) {
      const p = data[(y * W + x) * 4 + 3] > 127, rx = x + dx, ry = y + dy;
      const r = rx >= 0 && ry >= 0 && rx < R.W && ry < R.H && R.data[(ry * R.W + rx) * 4 + 3] > 127;
      if (p && r) k++; if (p || r) b++;
    }
    if (k / b > en.v) en = { v: k / b, dx, dy };
  }
  // d) taban: şapkanın yeri normal pozun saçıyla (kenarda 5 px yumuşak geçiş)
  const sapkaKatman = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) if (sapka[i]) for (let c = 0; c < 4; c++) sapkaKatman[i * 4 + c] = data[i * 4 + c];
  const uzak = new Float32Array(n).fill(99);
  for (let i = 0; i < n; i++) if (sapka[i]) { const x = i % W, y = (i / W) | 0; let m = 99; for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H || !sapka[yy * W + xx]) m = Math.min(m, Math.hypot(dx, dy)); } uzak[i] = m; }
  for (let i = 0; i < n; i++) if (sapka[i]) {
    const x = i % W, y = (i / W) | 0, rx = x + en.dx, ry = y + en.dy;
    const rr = rx >= 0 && ry >= 0 && rx < R.W && ry < R.H ? (ry * R.W + rx) * 4 : -1;
    // kenarda yumuşak geçiş yalnız P saçken (koyu kontur / şapka pikseli eski şapkanın izi olarak kalmasın)
    const t = lum(data, i) < 120 || cekirdek[i] || data[i * 4 + 3] < 230 ? 1 : Math.min(1, uzak[i] / 5);
    for (let c = 0; c < 4; c++) { const rv = rr >= 0 ? R.data[rr + c] : 0; data[i * 4 + c] = Math.round(data[i * 4 + c] * (1 - t) + rv * t); }
  }
  // e) şapka: küçült (pivot ağız ortası), kalan kadar aşağı
  let tepe = H; for (let i = 0; i < n; i++) if (sapka[i] && sapkaKatman[i * 4 + 3] > 40) tepe = Math.min(tepe, (i / W) | 0);
  const sh = sy1 - tepe; // şapka yüksekliği
  const f = Math.max(0.8, 1 - T / 2 / sh), in_ = T - sh * (1 - f);
  const px = tepeX, py = sy1;
  const yeni = Buffer.alloc(n * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const sx = px + (x - px) / f, sy = py + (y - in_ - py) / f; // ters dönüşüm, çift doğrusal
    const x0 = Math.floor(sx), y0 = Math.floor(sy); if (x0 < 0 || y0 < 0 || x0 >= W - 1 || y0 >= H - 1) continue;
    const ax = sx - x0, ay = sy - y0; let a = 0; const c3 = [0, 0, 0];
    for (const [ddx, ddy, w] of [[0, 0, (1 - ax) * (1 - ay)], [1, 0, ax * (1 - ay)], [0, 1, (1 - ax) * ay], [1, 1, ax * ay]]) { const j = ((y0 + ddy) * W + x0 + ddx) * 4, aa = sapkaKatman[j + 3] * w; a += aa; for (let c = 0; c < 3; c++) c3[c] += sapkaKatman[j + c] * aa; }
    if (a < 0.5) continue; const o = (y * W + x) * 4; for (let c = 0; c < 3; c++) yeni[o + c] = Math.round(c3[c] / a); yeni[o + 3] = Math.round(a);
  }
  for (let i = 0; i < n; i++) { const a = yeni[i * 4 + 3] / 255; if (!a) continue; const ta = data[i * 4 + 3] / 255, oa = a + ta * (1 - a);
    for (let c = 0; c < 3; c++) data[i * 4 + c] = Math.round((yeni[i * 4 + c] * a + data[i * 4 + c] * ta * (1 - a)) / oa); data[i * 4 + 3] = Math.round(oa * 255); }
  return { f, in: in_, sh, hiza: en, sapka, cekirdek };
}

(async () => {
  const gir = path.join(ARA, 'girdi'), cik = path.join(ARA, 'cikti');
  fs.rmSync(ARA, { recursive: true, force: true });
  fs.mkdirSync(gir, { recursive: true });
  for (const ad of adlar) for (const y of ['a', 'b']) {
    const pozlar = y === 'a' ? SAYFA_POZ.a : ad === 'ada' ? SAYFA_POZ.bAda : SAYFA_POZ.b;
    await sayfaBol(path.join(G, `dg-${ad}-pozlar-${y}.png`), pozlar, gir, ad, DIKIS[`${ad}-${y}`]);
  }
  execFileSync('node', [path.join(__dirname, 'gemini-esya.cjs'), '--girdi', gir, '--cikti', cik, '--max', '0', '--kayipsiz'], { stdio: 'inherit', cwd: KOK });

  for (const ad of adlar) {
    const pozlar = [...SAYFA_POZ.a, ...(ad === 'ada' ? SAYFA_POZ.bAda : SAYFA_POZ.b)];
    const sonuc = [];
    for (const poz of pozlar) {
      const yeni = fs.readFileSync(path.join(cik, `${ad}-${poz}.webp`));
      const o = await oturt(yeni, eskiDosya(ad, poz));
      // tepe eski tuvalde en az 3 px içeride kalmalı (bkz. sapkaSigdir)
      const tepe = o.ty + o.yK.y0 / o.k;
      if (tepe < 3) {
        const R = await alfa(fs.readFileSync(path.join(cik, `${ad}-normal.webp`)));
        const once = Buffer.from(o.Y.data);
        const r = sapkaSigdir(o.Y, R, Math.ceil((3 - tepe) * o.k));
        if (process.env.DG_IZ) { // iz: şapka maskesi (kırmızı), çekirdek (sarı), önce / sonra
          const iz = Buffer.from(once); for (let i = 0; i < o.Y.W * o.Y.H; i++) { if (r.sapka[i]) { iz[i * 4] = 255; iz[i * 4 + 3] = 255; } if (r.cekirdek[i]) { iz[i * 4 + 1] = 255; } }
          const a = await s(iz, { raw: { width: o.Y.W, height: o.Y.H, channels: 4 } }).png().toBuffer(), b = await s(Buffer.from(o.Y.data), { raw: { width: o.Y.W, height: o.Y.H, channels: 4 } }).png().toBuffer();
          await s({ create: { width: o.Y.W * 2, height: o.Y.H, channels: 4, background: '#2a3a4a' } }).composite([{ input: a, left: 0, top: 0 }, { input: b, left: o.Y.W, top: 0 }]).png().toFile(path.join(ARA, `iz-${ad}-${poz}.png`));
        }
        console.log(`  ${ad}/${poz}: şapka tuvale sığdırıldı (tepe ${tepe.toFixed(1)} px): %${Math.round(r.f * 100)} boy, ${Math.round(r.in)} px başa (şapka ${r.sh} px; saç: normal poz ${r.hiza.dx},${r.hiza.dy}, örtüşme ${r.hiza.v.toFixed(2)})`);
      }
      const delik = delikSil(o.Y, o.E, o.k, o.tx, o.ty, ELLE_DELIK[`${ad}/${poz}`]);
      sonuc.push({ poz, ...o, delik });
      console.log(`${ad}/${poz}: ölçek ${o.k.toFixed(3)} (boy oranı ${o.k0.toFixed(3)}), kayma x ${(o.tx - (o.eK.x0 + o.eK.x1) / 2 + ((o.yK.x0 + o.yK.x1) / 2) / o.k).toFixed(1)} px, IoU ${o.iou.toFixed(3)}, delik ${delik}`);
    }
    const N = Math.floor(Math.min(...sonuc.map((r) => r.k)) * 20) / 20; // 0.05 adım; tuval oranı yuvarlamayla ‰1 içinde
    const [EW, EH] = [sonuc[0].E.W, sonuc[0].E.H];
    const TW = Math.round(EW * N), TH = Math.round(EH * N);
    console.log(`${ad}: tuval ${EW}x${EH} → ${TW}x${TH} (${N} kat, oran ${(EW / EH).toFixed(4)} → ${(TW / TH).toFixed(4)}); poz ölçekleri ${sonuc.map((r) => r.k.toFixed(2)).join(' ')}`);
    const kontrol = [];
    for (const r of sonuc) {
      const f = N / r.k; // yeni piksel → yeni tuval pikseli (≤ 1: küçültme)
      const w = Math.round(r.Y.W * f), h = Math.round(r.Y.H * f);
      const kucuk = await s(Buffer.from(r.Y.data), { raw: { width: r.Y.W, height: r.Y.H, channels: 4 } }).resize(w, h, { kernel: 'lanczos3' }).png().toBuffer();
      let sol = Math.round(r.tx * N), ust = Math.round(r.ty * N);
      // ayak satırı: yeni kutunun altı = eski ayak × N
      const kk = kutu((await alfa(kucuk)).data, w, h);
      ust = Math.round(r.eK.y1 * N) - kk.y1;
      // tuval dışına taşan kısım kırpılır (olmamalı; uyar)
      const kirp = { left: Math.max(0, -sol), top: Math.max(0, -ust) };
      if (sol + kk.x0 < 0 || ust + kk.y0 < 0 || sol + kk.x1 > TW || ust + kk.y1 > TH) console.log(`  UYARI ${ad}/${r.poz}: tuvalden taşıyor (sol ${sol}, üst ${ust}, ${w}x${h} / ${TW}x${TH})`);
      const pw = Math.min(w - kirp.left, TW - Math.max(0, sol)), ph = Math.min(h - kirp.top, TH - Math.max(0, ust));
      const parca = await s(kucuk).extract({ left: kirp.left, top: kirp.top, width: pw, height: ph }).png().toBuffer();
      const tuval = await s({ create: { width: TW, height: TH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([{ input: parca, left: Math.max(0, sol), top: Math.max(0, ust) }]).png().toBuffer();
      const buf = await s(tuval).webp({ quality: 94, alphaQuality: 100, effort: 6 }).toBuffer();
      const yol = path.join(KOK, `assets/parti-ifade/${ad}/${r.poz}.webp`);
      if (!process.argv.includes('--kuru') && (await guvenliYaz(yol, buf))) console.log(`  ${ad}/${r.poz}.webp ${TW}x${TH}, ${Math.round(buf.length / 1024)} KB`);
      // kontrol karesi: eski (kırmızı, büyütülmüş) + yeni + ayak çizgisi
      const ea = await alfa(await s(eskiDosya(ad, r.poz)).resize(TW, TH).png().toBuffer());
      const kenar = Buffer.alloc(TW * TH * 4);
      for (let y = 1; y < TH - 1; y++) for (let x = 1; x < TW - 1; x++) {
        const i = y * TW + x, ic = ea.data[i * 4 + 3] > 127;
        if (ic && (ea.data[(i - 1) * 4 + 3] <= 127 || ea.data[(i + 1) * 4 + 3] <= 127 || ea.data[(i - TW) * 4 + 3] <= 127 || ea.data[(i + TW) * 4 + 3] <= 127)) { kenar[i * 4] = 255; kenar[i * 4 + 3] = 255; }
      }
      const eskiB = await s(kenar, { raw: { width: TW, height: TH, channels: 4 } }).png().toBuffer();
      const cizgi = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${TW}" height="${TH}"><line x1="0" x2="${TW}" y1="${r.eK.y1 * N}" y2="${r.eK.y1 * N}" stroke="#0a0" stroke-width="2"/><text x="8" y="30" font-size="26" fill="#000">${r.poz} ${r.k.toFixed(2)}</text></svg>`);
      kontrol.push(await s({ create: { width: TW, height: TH, channels: 4, background: '#6f8296' } }).composite([{ input: tuval }, { input: eskiB, blend: 'over' }, { input: cizgi }]).png().toBuffer());
    }
    await s({ create: { width: TW * kontrol.length, height: TH, channels: 4, background: '#fff' } }).composite(kontrol.map((input, i) => ({ input, left: i * TW, top: 0 }))).png().toFile(path.join(ARA, `kontrol-${ad}.png`));
  }
  console.log('kontrol: ' + ARA);
})();
