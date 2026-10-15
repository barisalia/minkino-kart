// Elektrikler Kesildi! eşya sayfası (Gemini G8, 3 sıra × 4 kare) → assets/elektrik/*.webp (şeffaf, kırpılmış).
// node ekip/illustrator/elektrik-isle.cjs [--girdi ekip/gemini/yeni/elektrik/esya-sayfasi.png] [--cikti assets/elektrik] [--deneme] [--max 1024]
//
// Sayfa sırası (OYUN-GELISTIRME-3GUN.md G8): 1) komodin (kapalı), komodin-acik, fener (kapalı), fener-acik (pil kapağı açık)
// 2) pil, saat, saksi, kemik  3) sandalye, lamba, cadir (dik), cokuk (çökmüş battaniye).
// - Asıl girdi 2K (2752 px en). Başka genişlikte dosya yalnız --deneme ile işlenir ve assets/'e YAZILMAZ (--cikti başka klasör olmalı).
// - Adında GECICI geçen dosya (büyütülmüş yedek) hiç işlenmez.
// - Kareler beyaz boşluklardan bulunur (sıra/sütun aralıkları); bulunamazsa eşit ızgara.
// - Zemin temizliği gemini-esya.cjs ile (tuvalKoru: kare tuvali korunur), kırpma ve çift hizası burada:
//   komodin/komodin-acik ve fener/fener-acik aynı tuvalde, gövdeleri piksel piksel üst üste gelir (poz değişiminde
//   eşya zıplamaz): aynı boya ölçeklenir, sol-alt (komodin) / sol-orta (fener) köşeden hizalanır.
// - Fener aynalanır: camı sağda (kod çiziminde olduğu gibi; ışık konisi ve pil yuvası sağa/sola göre kurulu).
// - Daha yüksek çözünürlüklü mevcut dosya ezilmez (guvenli-yaz.cjs; ZORLA=1).
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
const KOK = path.resolve(__dirname, '..', '..');
const s = require(require.resolve('sharp', { paths: [KOK] }));
const guvenliYaz = require('./guvenli-yaz.cjs');
const arg = (ad, v) => { const i = process.argv.indexOf('--' + ad); return i >= 0 ? process.argv[i + 1] : v; };
const GIRDI = path.resolve(KOK, arg('girdi', 'ekip/gemini/yeni/elektrik/esya-sayfasi.png'));
const CIKTI = path.resolve(KOK, arg('cikti', 'assets/elektrik'));
const DENEME = process.argv.includes('--deneme'), MAX = +arg('max', 1024), ASIL_EN = 2752;

const ADLAR = [
  ['komodin', 'komodin-acik', 'fener', 'fener-acik'],
  ['pil', 'saat', 'saksi', 'kemik'],
  ['sandalye', 'lamba', 'cadir', 'cokuk'],
];
// gemini-esya ayarları (kare tuvaline göre oranla verilen noktalar piksele çevrilir)
const AYAR = {
  // arkalığın içindeki boşluk (dört yanı kapalı beyaz) şeffaf olsun
  sandalye: { delik: true, delikMin: 200 },
  cadir: { delik: true, delikMin: 200 },
  komodin: { delik: true, delikMin: 200 },
  'komodin-acik': { delik: true, delikMin: 200 },
  // çalar saat: kadran beyaz kalır (yalnız çanların altındaki kapalı aralık delik)
  saat: { koyu: 190 },
  lamba: { koyu: 190 },
};
// aynı tuvale hizalanan çiftler: [kapalı, açık, hiza]
const CIFTLER = [
  ['komodin', 'komodin-acik', 'sol-alt'],
  ['fener', 'fener-acik', 'sol-orta'],
];
const AYNALA = new Set(['fener', 'fener-acik']);
// kapalı kalan kirli beyaz boşluklar (sandalye arkalığı, çadırdaki sandalyelerin arası): gemini-esya yalnız saf beyazı
// (> 243) delik sayar; Gemini'nin JPEG benzeri zemini 230'larda kalabiliyor
const BEYAZ_DELIK = new Set(['sandalye', 'cadir', 'komodin', 'komodin-acik']);
function beyazDelik(d, W, H, ad) {
  const n = W * H, acik = (i) => { const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2]; return d[i * 4 + 3] > 0 && Math.min(r, g, b) > 222 && Math.max(r, g, b) - Math.min(r, g, b) < 28; };
  const gor = new Uint8Array(n), q = new Int32Array(n), enAz = Math.max(30, Math.round(n * 0.0004));
  let sil = 0;
  for (let i = 0; i < n; i++) {
    if (gor[i] || !acik(i)) continue;
    let b = 0, e = 0; q[e++] = i; gor[i] = 1;
    while (b < e) { const p = q[b++], x = p % W; for (const dd of [-1, 1, -W, W]) { const r = p + dd; if (r < 0 || r >= n || gor[r] || !acik(r)) continue; if ((dd === -1 && x === 0) || (dd === 1 && x === W - 1)) continue; gor[r] = 1; q[e++] = r; } }
    if (e < enAz) continue;
    // bölge + çevresindeki 2 px açık hale şeffaf
    for (let k = 0; k < e; k++) d[q[k] * 4 + 3] = 0;
    for (let tur = 0; tur < 2; tur++) { const yeni = []; for (let k = 0; k < n; k++) { if (!d[k * 4 + 3]) continue; const x = k % W; const kom = [x > 0 ? k - 1 : -1, x < W - 1 ? k + 1 : -1, k - W, k + W].some((r) => r >= 0 && r < n && d[r * 4 + 3] === 0 && gor[r]); if (kom && Math.min(d[k * 4], d[k * 4 + 1], d[k * 4 + 2]) > 160) yeni.push(k); } for (const k of yeni) { d[k * 4 + 3] = 0; gor[k] = 1; } }
    sil += e;
  }
  if (sil) console.log(`  ${ad}: ${sil} px kirli beyaz boşluk şeffaf`);
}

function bantlar(say, uzunluk, esik, enAz) {
  const b = []; let bas = -1;
  for (let i = 0; i <= uzunluk; i++) {
    const dolu = i < uzunluk && say[i] > esik;
    if (dolu && bas < 0) bas = i;
    if (!dolu && bas >= 0) { if (i - bas >= enAz) b.push([bas, i]); bas = -1; }
  }
  // birbirine çok yakın bantları birleştir (eşyanın içindeki ince boşluklar)
  const bir = [];
  for (const x of b) { const o = bir[bir.length - 1]; if (o && x[0] - o[1] < enAz) o[1] = x[1]; else bir.push([...x]); }
  return bir;
}
/** n bant bekleniyor: fazlaysa en yakın komşular birleşir; azsa null */
function nBant(b, n) {
  b = b.map((x) => [...x]);
  while (b.length > n) { let en = 0, ara = Infinity; for (let i = 0; i < b.length - 1; i++) { const a = b[i + 1][0] - b[i][1]; if (a < ara) { ara = a; en = i; } } b.splice(en, 2, [b[en][0], b[en + 1][1]]); }
  return b.length === n ? b : null;
}

(async () => {
  if (/GECICI/i.test(path.basename(GIRDI))) { console.log('GECICI (büyütülmüş) dosya işlenmez:', GIRDI); process.exit(1); }
  if (!fs.existsSync(GIRDI)) { console.log('girdi yok:', GIRDI); process.exit(1); }
  const m = await s(GIRDI).metadata();
  console.log(`girdi ${path.relative(KOK, GIRDI)}: ${m.width}x${m.height}`);
  if (m.width !== ASIL_EN && !DENEME) { console.log(`asıl dosya ${ASIL_EN} px en olmalı (bu ${m.width}); yalnız deneme için --deneme --cikti <başka klasör>`); process.exit(1); }
  if (DENEME && path.resolve(CIKTI) === path.resolve(KOK, 'assets/elektrik')) { console.log('--deneme çıktısı assets/elektrik olamaz'); process.exit(1); }
  const { data, info } = await s(GIRDI).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const dolu = (x, y) => { const i = (y * W + x) * 3, r = data[i], g = data[i + 1], b = data[i + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b); return mn < 215 || mx - mn > 40; };
  const enAz = Math.round(W * 0.006);
  // sıralar
  const satir = new Int32Array(H); for (let y = 0; y < H; y++) { let c = 0; for (let x = 0; x < W; x++) c += dolu(x, y); satir[y] = c; }
  let siralar = nBant(bantlar(satir, H, 1, enAz), 3);
  if (!siralar) { console.log('UYARI: sıra aralıkları bulunamadı, eşit ızgara'); siralar = [0, 1, 2].map((i) => [Math.round((i * H) / 3), Math.round(((i + 1) * H) / 3)]); }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'elektrik-isle-'));
  const kareler = {};
  for (let r = 0; r < 3; r++) {
    const [y0, y1] = siralar[r];
    const sutun = new Int32Array(W); for (let x = 0; x < W; x++) { let c = 0; for (let y = y0; y < y1; y++) c += dolu(x, y); sutun[x] = c; }
    let sutunlar = nBant(bantlar(sutun, W, 1, enAz), 4);
    if (!sutunlar) { console.log(`UYARI: ${r + 1}. sıranın sütunları bulunamadı, eşit ızgara`); sutunlar = [0, 1, 2, 3].map((i) => [Math.round((i * W) / 4), Math.round(((i + 1) * W) / 4)]); }
    for (let c = 0; c < 4; c++) {
      const [x0, x1] = sutunlar[c];
      // karenin kendi dikey sınırı (sıra bandı içinde bu sütunun dolu satırları)
      let ky0 = y1, ky1 = y0; for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (dolu(x, y)) { ky0 = Math.min(ky0, y); ky1 = Math.max(ky1, y); break; }
      const pay = Math.round(W * 0.01);
      const kx0 = Math.max(0, x0 - pay), kx1 = Math.min(W, x1 + pay), kyy0 = Math.max(0, ky0 - pay), kyy1 = Math.min(H, ky1 + 1 + pay);
      const ad = ADLAR[r][c];
      let img = s(GIRDI).removeAlpha().extract({ left: kx0, top: kyy0, width: kx1 - kx0, height: kyy1 - kyy0 });
      if (AYNALA.has(ad)) img = img.flop();
      await img.png().toFile(path.join(tmp, ad + '.png'));
      kareler[ad] = [kx1 - kx0, kyy1 - kyy0];
    }
  }
  console.log('kareler:', Object.entries(kareler).map(([a, [w, h]]) => `${a} ${w}x${h}`).join(', '));
  // zemin temizliği (tuval korunur)
  const ayar = {}; for (const ad of Object.keys(kareler)) ayar[ad] = { tuvalKoru: true, ...(AYAR[ad] || {}) };
  const temiz = path.join(tmp, 'temiz');
  execFileSync(process.execPath, [path.join(__dirname, 'gemini-esya.cjs'), '--girdi', tmp, '--cikti', temiz, '--max', '0', '--ayar', JSON.stringify(ayar)], { cwd: KOK, stdio: 'inherit' });
  // kırpma kutuları
  const kutu = {};
  const ham = {};
  for (const ad of Object.keys(kareler)) {
    const { data: d, info: i } = await s(path.join(temiz, ad + '.webp')).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    if (BEYAZ_DELIK.has(ad)) beyazDelik(d, i.width, i.height, ad);
    let x0 = i.width, y0 = i.height, x1 = -1, y1 = -1;
    for (let y = 0; y < i.height; y++) for (let x = 0; x < i.width; x++) if (d[(y * i.width + x) * 4 + 3] > 12) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    kutu[ad] = [x0, y0, x1 + 1, y1 + 1];
    ham[ad] = await s(d, { raw: { width: i.width, height: i.height, channels: 4 } }).extract({ left: x0, top: y0, width: x1 + 1 - x0, height: y1 + 1 - y0 }).png().toBuffer();
  }
  const olcu = {};
  const yaz = async (ad, buf) => {
    const mm = await s(buf).metadata(); const k = MAX && Math.max(mm.width, mm.height) > MAX ? MAX / Math.max(mm.width, mm.height) : 1;
    const son = k < 1 ? await s(buf).resize(Math.round(mm.width * k), Math.round(mm.height * k), { kernel: 'lanczos3' }).png().toBuffer() : buf;
    const webp = await s(son).webp({ quality: 94, alphaQuality: 100, effort: 5 }).toBuffer();
    const sm = await s(son).metadata();
    const yazildi = await guvenliYaz(path.join(CIKTI, ad + '.webp'), webp);
    olcu[ad] = [sm.width, sm.height];
    console.log(`${ad}: ${sm.width}x${sm.height}${yazildi ? '' : ' (ATLANDI)'}`);
  };
  fs.mkdirSync(CIKTI, { recursive: true });
  const ciftte = new Set(CIFTLER.flatMap(([a, b]) => [a, b]));
  for (const [a, b] of CIFTLER) {
    // açık poz kapalının üstüne oturtulur: ölçek ve kayma, iki siluetin örtüşmesi (IoU) en büyük olacak şekilde aranır
    // (gövdeler üst üste gelir; çekmece / kapak gibi farklı kısımlar azınlıkta kaldığı için aramayı bozmaz)
    const wa = kutu[a][2] - kutu[a][0], ha = kutu[a][3] - kutu[a][1];
    const wb = kutu[b][2] - kutu[b][0], hb = kutu[b][3] - kutu[b][1];
    const K = 160 / Math.max(wa, ha); // arama küçük ölçekte
    const maske = async (buf, w, h) => { const { data: d } = await s(buf).resize(Math.max(1, Math.round(w)), Math.max(1, Math.round(h))).ensureAlpha().raw().toBuffer({ resolveWithObject: true }); const m = new Uint8Array(Math.round(w) * Math.round(h)); for (let i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] > 128 ? 1 : 0; return m; };
    const aw = Math.round(wa * K), ah = Math.round(ha * K), mA = await maske(ham[a], aw, ah);
    let en = { iou: -1 };
    for (let ks = 0.9; ks <= 1.101; ks += 0.01) {
      const bw = Math.round(wb * K * ks * (ha / hb)), bh = Math.round(hb * K * ks * (ha / hb)), mB = await maske(ham[b], bw, bh);
      for (let dy = -Math.round(ah * 0.12); dy <= Math.round(ah * 0.12); dy++) for (let dx = -Math.round(aw * 0.3); dx <= Math.round(aw * 0.3); dx++) {
        let kes = 0, bir = 0;
        const x0 = Math.min(0, dx), y0 = Math.min(0, dy), x1 = Math.max(aw, dx + bw), y1 = Math.max(ah, dy + bh);
        for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
          const va = x >= 0 && y >= 0 && x < aw && y < ah ? mA[y * aw + x] : 0, xb = x - dx, yb = y - dy;
          const vb = xb >= 0 && yb >= 0 && xb < bw && yb < bh ? mB[yb * bw + xb] : 0;
          kes += va & vb; bir += va | vb;
        }
        const iou = kes / Math.max(1, bir);
        if (iou > en.iou) en = { iou, ks, dx: dx / K, dy: dy / K };
      }
    }
    const k = en.ks * (ha / hb), wbk = Math.round(wb * k), hbk = Math.round(hb * k);
    const bBuf = await s(ham[b]).resize(wbk, hbk, { kernel: 'lanczos3' }).png().toBuffer();
    const bx = Math.round(en.dx), by = Math.round(en.dy);
    const X0 = Math.min(0, bx), Y0 = Math.min(0, by), TW = Math.max(wa, bx + wbk) - X0, TH = Math.max(ha, by + hbk) - Y0;
    for (const [ad, buf, l, t] of [[a, ham[a], -X0, -Y0], [b, bBuf, bx - X0, by - Y0]]) {
      const tuval = await s({ create: { width: TW, height: TH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([{ input: buf, left: l, top: t }]).png().toBuffer();
      await yaz(ad, tuval);
    }
    console.log(`  çift ${a}/${b}: ortak tuval ${TW}x${TH}; açık poz ×${k.toFixed(3)}, kayma ${bx},${by} px, örtüşme ${en.iou.toFixed(3)}`);
  }
  for (const ad of Object.keys(kareler)) if (!ciftte.has(ad)) await yaz(ad, ham[ad]);
  // oranlar (kod bunları elektrik-cizim.ts → RESIM_ORAN'da kullanır)
  fs.writeFileSync(path.join(CIKTI, 'olcu.json'), JSON.stringify({ kaynak: path.relative(KOK, GIRDI).replace(/\\/g, '/'), en: m.width, olcu }, null, 1) + '\n');
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('bitti →', path.relative(KOK, CIKTI) || CIKTI);
})();
