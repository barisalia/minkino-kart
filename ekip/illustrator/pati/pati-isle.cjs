// Pati Dükkânı "İlk Gün" dilimi için görsel hazırlığı (Illustrator'suz; gemini-esya.cjs ile kesim).
//
// 1) Salon arka planı: ekip/gemini/yeni/pati/salon-gunduz-v2.png → assets/pati/salon-gunduz.webp (tam boy, 2752).
// 2) GEÇİCİ raf eşyaları: G4 eşya sayfası gelene kadar salon resminin içinden aynı elden çıkmış eşyalar kesilir
//    (aynı stil): kırmızı mama torbası, mavi mama kabı, tenis topu, pembe kuş oyuncağı (ipli), mor minder ve lamba ipi.
//    Kesimden önce duvar / raf / zemin renkleri beyaza çevrilir (gemini-esya.cjs beyaz zemin bekler), sonra
//    gemini-esya.cjs şeffaf WebP yapar → assets/pati/gecici-<ad>.webp. G4 gelince oyun kendiliğinden esya-*.webp'yi seçer.
// 3) Hayvan poz sayfaları (G1-G3, 2×4): ekip/gemini/yeni/pati/<hayvan>-hareket-sayfasi.png varsa kareler beyaz
//    aralıklardan bulunur, gemini-esya.cjs --esit --esit-hiza alt ile AYNI ölçek ve taban çizgisinde kesilir →
//    assets/pati/<hayvan>-<poz>.webp. Göz kırpma yaması: kare 1 ile kare 2'nin farkının kutusu → <hayvan>-goz-yama.webp
//    + assets/pati/goz-yama.json (konum, ana pozun oranı olarak).
//
// 4) v2 (Pati Dükkânı v2, PATI-V2 §11d): arka planlar, ui-jeton / ui-dolap / eşya / süs sayfaları, hayvanların H-B-T
//    sayfaları ve ziyaretçi sayfaları. Ayrıntı aşağıda "v2" bölümünde.
//
// node ekip/illustrator/pati/pati-isle.cjs [salon] [esya] [poz] [v2 | v2-arka | v2-esya | v2-hayvan | v2-aile]
//   (hiçbiri verilmezse hepsi; tekrar çalıştırmak güvenli)
const fs = require('fs'), os = require('os'), path = require('path'), { execFileSync } = require('child_process');
const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const yaz = require('../guvenli-yaz.cjs');

const KOK = path.resolve(__dirname, '../../..');
const G = path.join(KOK, 'ekip/gemini/yeni/pati');
const CIKTI = path.join(KOK, 'assets/pati');
const ARA = path.join(os.tmpdir(), 'minkino-pati');
const ESYA_KES = path.join(KOK, 'ekip/illustrator/gemini-esya.cjs');
const is = process.argv.slice(2);
const yap = (ad) => !is.length || is.includes(ad);

// ---------------------------------------------------------------- 1) salon
async function salon() {
  const g = path.join(G, 'salon-gunduz-v2.png');
  const buf = await s(g).removeAlpha().webp({ quality: 86, effort: 5 }).toBuffer();
  if (await yaz(path.join(CIKTI, 'salon-gunduz.webp'), buf)) console.log('salon-gunduz.webp', Math.round(buf.length / 1024), 'KB');
}

// ---------------------------------------------------------------- 2) geçici raf eşyaları (salondan)
const DUVAR = [255, 241, 214], RAF = [224, 158, 94], ZEMIN = [234, 173, 111], ZEMIN_ACIK = [232, 216, 154];
/** kutu: salon resminde [x0, y0, x1, y1]; zemin: beyaza çevrilecek renkler (uzaklık < esik) */
const ESYALAR = {
  'gecici-mama-torbasi': { kutu: [2438, 128, 2631, 352], zemin: [DUVAR], esik: 26 },
  'gecici-mama-kabi': { kutu: [1641, 262, 1773, 352], zemin: [DUVAR], esik: 26 },
  'gecici-kus': { kutu: [1030, 0, 1236, 150], zemin: [DUVAR], esik: 30 },
  'gecici-top': { kutu: [903, 1250, 1002, 1342], zemin: [ZEMIN, ZEMIN_ACIK, [214, 150, 92], [205, 140, 86]], esik: 30, daire: [952, 1300, 43], ayar: { minOran: 0.2 } },
  'gecici-minder': { kutu: [930, 1108, 1176, 1272], zemin: [], esik: 30, ac: 6, yalniz: (r, g, b) => (b > g + 12 && r > g) || r * 3 + g * 6 + b < 1100, ayar: { minOran: 0.2 } },
  'gecici-ip': { kutu: [1552, 186, 1594, 306], zemin: [DUVAR], esik: 30, ayar: { minOran: 0.3, tuvalKoru: true } },
};
async function esya() {
  const girdi = path.join(ARA, 'esya-girdi');
  fs.rmSync(girdi, { recursive: true, force: true });
  fs.mkdirSync(girdi, { recursive: true });
  const ayar = {};
  for (const [ad, o] of Object.entries(ESYALAR)) {
    const [x0, y0, x1, y1] = o.kutu;
    const { data, info } = await s(path.join(G, 'salon-gunduz-v2.png')).removeAlpha().extract({ left: x0, top: y0, width: x1 - x0, height: y1 - y0 }).raw().toBuffer({ resolveWithObject: true });
    // kenarda 6 px beyaz pay (kenara değen çizim de zeminden ayrılsın)
    const P = 6, W = info.width + 2 * P, H = info.height + 2 * P, cik = Buffer.alloc(W * H * 3, 255);
    for (let y = 0; y < info.height; y++)
      for (let x = 0; x < info.width; x++) {
        const i = (y * info.width + x) * 3, r = data[i], g = data[i + 1], b = data[i + 2];
        const disarida = o.daire && Math.hypot(x0 + x - o.daire[0], y0 + y - o.daire[1]) > o.daire[2];
        const zemin = disarida || o.zemin.some((z) => Math.hypot(r - z[0], g - z[1], b - z[2]) < o.esik) || (o.yalniz && !o.yalniz(r, g, b));
        const j = ((y + P) * W + x + P) * 3;
        if (!zemin) { cik[j] = r; cik[j + 1] = g; cik[j + 2] = b; }
      }
    // ac: morfolojik açma (r px aşındır + büyüt): komşu eşyanın çizgi kırıntıları (ince) silinir, eşyanın gövdesi kalır
    if (o.ac) {
      const n = W * H, M = new Uint8Array(n);
      for (let i = 0; i < n; i++) M[i] = Math.min(cik[i * 3], cik[i * 3 + 1], cik[i * 3 + 2]) < 250 ? 1 : 0;
      const kare = (A, deger) => { const B = new Uint8Array(n); const r = o.ac; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let v = deger; for (let dy = -r; dy <= r && v === deger; dy++) for (let dx = -r; dx <= r; dx++) { const xx = x + dx, yy = y + dy; const a = xx < 0 || yy < 0 || xx >= W || yy >= H ? 0 : A[yy * W + xx]; if (a !== deger) { v = 1 - deger; break; } } B[y * W + x] = v; } return B; };
      const acik = kare(kare(M, 1), 0);
      for (let i = 0; i < n; i++) if (!acik[i]) cik[i * 3] = cik[i * 3 + 1] = cik[i * 3 + 2] = 255;
    }
    await s(cik, { raw: { width: W, height: H, channels: 3 } }).png().toFile(path.join(girdi, ad + '.png'));
    if (o.ayar) ayar[ad] = o.ayar;
  }
  execFileSync('node', [ESYA_KES, '--girdi', girdi, '--cikti', CIKTI, '--max', '0', '--ayar', JSON.stringify(ayar)], { stdio: 'inherit', cwd: KOK });
  // lamba ipinin salondaki yeri (oyun ipi tam üstüne koyar): kesimden sonra kutunun gerçek yeri
  const yer = {};
  // (tuvalKoru: kırpma yok, kesimde eklenen 6 px beyaz pay kutuya dahil)
  for (const [ad, o] of Object.entries(ESYALAR)) yer[ad] = o.ayar && o.ayar.tuvalKoru ? [o.kutu[0] - 6, o.kutu[1] - 6, o.kutu[2] + 6, o.kutu[3] + 6] : o.kutu;
  fs.writeFileSync(path.join(CIKTI, 'gecici-yer.json'), JSON.stringify(yer, null, 1) + '\n');
}

// ---------------------------------------------------------------- 3) poz sayfaları
/** Sayfa adı → kare adları (soldan sağa, üstten alta; ekip/OYUN-GELISTIRME-3GUN.md §2 G1-G3) */
const SAYFALAR = {
  findik: ['bos', 'goz', 'ac', 'oyun', 'yiyor', 'uyku', 'sevinc', 'top'],
  tarcin: ['bos', 'goz', 'usudu', 'oyun', 'atla', 'uyku', 'rahat', 'yiyor'],
  piril: ['yuz1', 'yuz2', 'goz', 'ac', 'yiyor', 'sevinc', 'uykulu', 'uyku'],
};
/** G4 eşya sayfası kareleri (soldan sağa, üstten alta) */
const ESYA_SAYFA = ['mama-kabi-bos', 'mama-kabi-dolu', 'su-kabi-bos', 'su-kabi-dolu', 'mama-torbasi', 'olcek', 'yem-kutusu', 'battaniye', 'top', 'tuy-degnek', 'dusunce-balonu', 'gece-lambasi'];
/** Beyaz olmayan piksellerin satır / sütun dağılımından çizim bantları (aralar beyaz) */
function bantlar(dolu, enAzBosluk, enAzBant) {
  const b = [];
  let bas = -1, bos = 0;
  for (let i = 0; i <= dolu.length; i++) {
    const v = i < dolu.length && dolu[i];
    if (v) {
      if (bas < 0) bas = i;
      bos = 0;
    } else if (bas >= 0) {
      bos++;
      if (bos >= enAzBosluk || i === dolu.length) {
        const son = i - bos;
        if (son - bas >= enAzBant) b.push([bas, son]);
        bas = -1;
        bos = 0;
      }
    }
  }
  return b;
}
async function sayfaKes(hayvan, kareler, o = {}) {
  const dosya = (o.dosya ? [o.dosya] : [`${hayvan}-hareket-sayfasi.png`, `${hayvan}-hareket-sayfasi.jpg`]).map((f) => (path.isAbsolute(f) ? f : path.join(G, f))).find((f) => fs.existsSync(f));
  if (!dosya) return console.log(`${o.dosya || hayvan}: sayfa yok (bekleniyor)`), false;
  const { data, info } = await s(dosya).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const cizim = (x, y) => { const i = (y * W + x) * 3; return Math.min(data[i], data[i + 1], data[i + 2]) < 225; };
  // önce satırlar (2), sonra her satırda sütunlar (4): her karede yeniden ölçülür (Gemini ızgarası eşit değil)
  const satirDolu = Array.from({ length: H }, (_, y) => { let n = 0; for (let x = 0; x < W; x += 2) if (cizim(x, y)) n++; return n > 2; });
  // satır sayısı: 12 kare 3 satır, 8 kare 2 satır, 3 kare 1 satır; satırlar birbirine çok yakınsa (esya-5-yatak: lamba
  // kabloları ile peluş arasında ~24 px) daha dar boşlukla yeniden bölünür
  const beklenenSatir = Math.max(1, Math.round(kareler.length / 4));
  let satirlar = [];
  for (const bosluk of [0.02, 0.012, 0.006]) {
    satirlar = bantlar(satirDolu, Math.round(H * bosluk), Math.round(H * 0.12));
    if (satirlar.length >= beklenenSatir) break;
  }
  const kutular = [];
  for (const [y0, y1] of satirlar) {
    const sutunDolu = Array.from({ length: W }, (_, x) => { let n = 0; for (let y = y0; y <= y1; y += 2) if (cizim(x, y)) n++; return n > 1; });
    // 4 sütun beklenir: kareler birbirine çok yakınsa (baloncuk, yem tanesi) daha dar boşlukla yeniden bölünür
    let b = [];
    for (const bosluk of [0.012, 0.006, 0.003]) {
      b = bantlar(sutunDolu, Math.round(W * bosluk), Math.round(W * 0.05));
      if (b.length >= kareler.length / satirlar.length) break;
    }
    // Sütunları üst üste binen kareler (yatan kedinin kuyruğu komşu karenin altına uzanır) arada beyaz sütun bırakmaz:
    // bant içinde bağlı bileşenler ayrılır; büyükler kare olur, küçükler (damla, toz) en yakın kareye gider. Her kare
    // yalnız kendi bileşenleriyle (3 px genişletilmiş maske) kesilir. Çizimler gerçekten değiyorsa en az mürekkepli
    // sütundan bölünür (yalnız birkaç piksellik uç kesilir).
    const beklenen = Math.round(kareler.length / satirlar.length);
    const maskeler = new Map();
    while (b.length < beklenen) {
      const en = b.reduce((m, x, i) => (x[1] - x[0] > b[m][1] - b[m][0] ? i : m), 0);
      const [a0, a1] = b[en];
      const eksik = beklenen - b.length + 1;
      const bw = a1 - a0 + 1, bh = y1 - y0 + 1, n = bw * bh;
      const et = new Int32Array(n).fill(-1), q = new Int32Array(n), bil = [];
      for (let i = 0; i < n; i++) {
        if (et[i] >= 0 || !cizim(a0 + (i % bw), y0 + ((i / bw) | 0))) continue;
        let bb = 0, ee = 0; q[ee++] = i; et[i] = bil.length; let x0_ = bw, x1_ = 0, y0_ = bh, y1_ = 0;
        while (bb < ee) {
          const p = q[bb++], x = p % bw, y = (p / bw) | 0;
          x0_ = Math.min(x0_, x); x1_ = Math.max(x1_, x); y0_ = Math.min(y0_, y); y1_ = Math.max(y1_, y);
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
            const xx = x + dx, yy = y + dy;
            if (xx < 0 || yy < 0 || xx >= bw || yy >= bh) continue;
            const r = yy * bw + xx;
            if (et[r] < 0 && cizim(a0 + xx, y0 + yy)) { et[r] = bil.length; q[ee++] = r; }
          }
        }
        bil.push({ alan: ee, x0: x0_, x1: x1_, y0: y0_, y1: y1_ });
      }
      const enBuyuk = Math.max(...bil.map((c) => c.alan));
      const ana = bil.map((c, i) => [c, i]).filter(([c]) => c.alan >= enBuyuk * 0.15).sort((p, r) => p[0].x0 - r[0].x0);
      if (ana.length === eksik) {
        // küçükler en yakın anaya (kutular arası uzaklık)
        const sahip = bil.map((c, i) => {
          const a = ana.findIndex(([, j]) => j === i);
          if (a >= 0) return a;
          let enI = 0, enU = Infinity;
          ana.forEach(([k], j) => { const u = Math.max(0, k.x0 - c.x1, c.x0 - k.x1) + Math.max(0, k.y0 - c.y1, c.y0 - k.y1); if (u < enU) { enU = u; enI = j; } });
          return enI;
        });
        console.log(`  üst üste binen kareler ${a0}-${a1}: ${ana.length} çizim bileşenlerle ayrıldı`);
        const kayitlar = ana.map((_, j) => {
          const k = bil.filter((__, i) => sahip[i] === j);
          // maske: bu karenin bileşenleri, 3 px genişletilmiş (kenar yumuşatması kalsın)
          const m = new Uint8Array(n);
          for (let i = 0; i < n; i++) if (et[i] >= 0 && sahip[et[i]] === j) m[i] = 1;
          const g = new Uint8Array(n);
          for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
            if (!m[y * bw + x]) continue;
            for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < bw && yy < bh) g[yy * bw + xx] = 1; }
          }
          return [[a0 + Math.min(...k.map((c) => c.x0)), a0 + Math.max(...k.map((c) => c.x1))], { g, a0, y0, bw, bh }];
        });
        b.splice(en, 1, ...kayitlar.map((k) => k[0]));
        for (const [kk, m] of kayitlar) maskeler.set(kk, m);
        continue;
      }
      const parca = Math.round(bw / eksik);
      let enAz = Infinity, kes = -1;
      for (let x = a0 + Math.round(parca * 0.7); x <= Math.min(a1 - 40, a0 + Math.round(parca * 1.3)); x++) {
        let k = 0;
        for (let y = y0; y <= y1; y++) if (cizim(x, y)) k++;
        if (k < enAz) { enAz = k; kes = x; }
      }
      if (kes < 0) break;
      console.log(`  değen kareler ${a0}-${a1} → ${kes}. sütundan bölündü (${enAz} px mürekkep)`);
      b.splice(en, 1, [a0, kes - 1], [kes + 1, a1]);
    }
    for (const x of b) {
      const k = [x[0], y0, x[1], y1];
      if (maskeler.has(x)) k.maske = maskeler.get(x);
      kutular.push(k);
    }
  }
  if (kutular.length !== kareler.length) {
    console.log(`${o.dosya || hayvan}: ${kutular.length} kare bulundu, ${kareler.length} bekleniyordu; kesilmedi`, JSON.stringify(kutular));
    return false;
  }
  // o.girdi: birden çok sayfa aynı klasöre (aynı --esit tuvali: H, B, T sayfaları aynı ölçekte); o.yalnizKare: kesme sonra
  const girdi = o.girdi || path.join(ARA, `poz-${hayvan}`);
  if (!o.girdi) fs.rmSync(girdi, { recursive: true, force: true });
  fs.mkdirSync(girdi, { recursive: true });
  for (let i = 0; i < kutular.length; i++) {
    const [x0, y0, x1, y1] = kutular[i], P = 24;
    const l = Math.max(0, x0 - P), t = Math.max(0, y0 - P);
    const cik = path.join(girdi, `${hayvan}-${kareler[i]}.png`);
    if (o.belden) {
      // belden yukarı kare: gövde karenin altında kesik; kesik yere 4 px kontur çizilir (kapalı siluet, zemin içeri akmaz)
      const h = y1 + 1 - t, w = Math.min(W, x1 + P) - l;
      const { data: d } = await s(dosya).removeAlpha().extract({ left: l, top: t, width: w, height: h }).raw().toBuffer({ resolveWithObject: true });
      for (let x = 0; x < w; x++) {
        let dolu = false;
        for (let y = h - 6; y < h; y++) { const i = (y * w + x) * 3; if (Math.min(d[i], d[i + 1], d[i + 2]) < 225) dolu = true; }
        if (dolu) for (let y = h - 4; y < h; y++) { const i = (y * w + x) * 3; d[i] = 0x3b; d[i + 1] = 0x24; d[i + 2] = 0x16; }
      }
      await s(d, { raw: { width: w, height: h, channels: 3 } }).extend({ top: 8, bottom: 8, left: 8, right: 8, background: '#ffffff' }).png().toFile(cik);
    } else if (kutular[i].maske) {
      // üst üste binen karede yalnız bu karenin çizimi (komşunun kuyruğu beyaza)
      const M = kutular[i].maske, w = Math.min(W, x1 + P) - l, h = Math.min(H, y1 + P) - t;
      const { data: d } = await s(dosya).removeAlpha().extract({ left: l, top: t, width: w, height: h }).raw().toBuffer({ resolveWithObject: true });
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const bx = l + x - M.a0, by = t + y - M.y0;
        if (bx >= 0 && by >= 0 && bx < M.bw && by < M.bh && !M.g[by * M.bw + bx]) { const j = (y * w + x) * 3; d[j] = d[j + 1] = d[j + 2] = 255; }
      }
      await s(d, { raw: { width: w, height: h, channels: 3 } }).extend({ top: 8, bottom: 8, left: 8, right: 8, background: '#ffffff' }).png().toFile(cik);
    } else await s(dosya).removeAlpha().extract({ left: l, top: t, width: Math.min(W, x1 + P) - l, height: Math.min(H, y1 + P) - t }).extend({ top: 8, bottom: 8, left: 8, right: 8, background: '#ffffff' }).png().toFile(cik);
  }
  if (o.yalnizKare) return true;
  // aynı ölçek, aynı taban çizgisi (balık: ortada)
  const hiza = hayvan === 'piril' ? 'orta' : 'alt';
  if (o.esya) {
    // eşya sayfası: her eşya kendi kutusuna kırpılır (ince parçalar ve balonun küçük daireleri korunsun)
    execFileSync('node', [ESYA_KES, '--girdi', girdi, '--cikti', CIKTI, '--max', '1024', '--ayar', JSON.stringify(o.ayar || {})], { stdio: 'inherit', cwd: KOK });
    return true;
  }
  execFileSync('node', [ESYA_KES, '--girdi', girdi, '--cikti', CIKTI, '--esit', `^${hayvan}-`, '--esit-hiza', hiza, '--max', '1100', '--ayar', JSON.stringify(o.ayar || {})], { stdio: 'inherit', cwd: KOK });
  if (o.belden) return true;
  await gozYamasi(hayvan, kareler.includes('bos') ? 'bos' : 'yuz1', 'goz');
  return true;
}

/**
 * Göz kırpma yaması: ana karede iki göz bebeği bulunur (üst kısımda, yan yana iki koyu yuvarlak küme); gözü kapalı
 * kare o bölgede en az farkı veren kaydırmayla hizalanır; yama kenarları yumuşak (ana pozun üstüne dikişsiz oturur).
 */
async function gozYamasi(hayvan, ana, goz) {
  const a = path.join(CIKTI, `${hayvan}-${ana}.webp`), b = path.join(CIKTI, `${hayvan}-${goz}.webp`);
  if (!fs.existsSync(a) || !fs.existsSync(b)) return;
  const A = await s(a).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = A.info.width, H = A.info.height;
  const B = await s(b).ensureAlpha().resize(W, H).raw().toBuffer({ resolveWithObject: true });
  const lu = (D, i) => (D[i * 4 + 3] < 128 ? 255 : (D[i * 4] * 3 + D[i * 4 + 1] * 6 + D[i * 4 + 2]) / 10);
  // 1) koyu kümeler (üst %70)
  const n = W * H, et = new Int32Array(n).fill(-1), q = new Int32Array(n), kumeler = [];
  for (let i = 0; i < n; i++) {
    if (et[i] >= 0 || i / W > H * 0.7 || lu(A.data, i) > 70) continue;
    let bb = 0, ee = 0; q[ee++] = i; et[i] = kumeler.length; let x0 = W, y0 = H, x1 = 0, y1 = 0;
    while (bb < ee) { const p = q[bb++], x = p % W, y = (p / W) | 0; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      for (const d of [-1, 1, -W, W]) { const r = p + d; if (r < 0 || r >= n || et[r] >= 0 || lu(A.data, r) > 70) continue; if ((d === -1 && x === 0) || (d === 1 && x === W - 1)) continue; et[r] = kumeler.length; q[ee++] = r; } }
    kumeler.push({ alan: ee, x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 });
  }
  // göz bebeği: dolu ve yuvarlağa yakın (kontur çizgileri ince ve uzun: elenir)
  const aday = kumeler.filter((k) => { const w = k.x1 - k.x0 + 1, h = k.y1 - k.y0 + 1; return k.alan > n * 0.0002 && k.alan < n * 0.01 && w / h > 0.5 && w / h < 2 && k.alan > w * h * 0.5; });
  let cift = null, enIyi = Infinity;
  for (const p of aday) for (const r of aday) { if (r === p) continue; const dx = Math.abs(p.cx - r.cx), dy = Math.abs(p.cy - r.cy); if (dx < W * 0.04 || dx > W * 0.35 || dy > H * 0.06) continue; const puan = (p.cy + r.cy) / 2 + dy * 3; if (puan < enIyi) { enIyi = puan; cift = [p, r]; } }
  if (!cift) return console.log(`${hayvan}: göz bulunamadı; göz kırpma kapalı`);
  const gw = Math.max(...cift.map((k) => k.x1 - k.x0)), gh = Math.max(...cift.map((k) => k.y1 - k.y0));
  const k = { x: Math.round(Math.min(cift[0].x0, cift[1].x0) - gw * 0.9), y: Math.round(Math.min(cift[0].y0, cift[1].y0) - gh * 0.9) };
  k.w = Math.round(Math.max(cift[0].x1, cift[1].x1) + gw * 0.9) - k.x; k.h = Math.round(Math.max(cift[0].y1, cift[1].y1) + gh * 0.9) - k.y;
  k.x = Math.max(0, k.x); k.y = Math.max(0, k.y); k.w = Math.min(W - k.x, k.w); k.h = Math.min(H - k.y, k.h);
  // 2) yerel hiza: göz bölgesinin 2 katı pencerede, gözlerin kendisi hariç (gözler zaten farklı)
  const pen = { x0: Math.max(0, k.x - k.w / 2), x1: Math.min(W - 1, k.x + k.w * 1.5), y0: Math.max(0, k.y - k.h), y1: Math.min(H - 1, k.y + k.h * 2) };
  let en = [0, 0], enF = Infinity;
  for (let dy = -30; dy <= 30; dy++)
    for (let dx = -30; dx <= 30; dx++) {
      let f = 0;
      for (let y = pen.y0 | 0; y < pen.y1; y += 3) for (let x = pen.x0 | 0; x < pen.x1; x += 3) {
        if (x >= k.x && x < k.x + k.w && y >= k.y && y < k.y + k.h) continue;
        const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) { f += 255; continue; }
        f += Math.abs(lu(A.data, y * W + x) - lu(B.data, yy * W + xx));
      }
      if (f < enF) { enF = f; en = [dx, dy]; }
    }
  const [ox, oy] = en;
  // 3) yama: kapalı kareden (kaydırılmış), kenarları yumuşak, ana pozun alfasıyla
  const out = Buffer.alloc(k.w * k.h * 4);
  const kenar = Math.max(4, Math.round(Math.min(k.w, k.h) * 0.22));
  for (let y = 0; y < k.h; y++) for (let x = 0; x < k.w; x++) {
    const ax = k.x + x, ay = k.y + y, bx = ax + ox, by = ay + oy, o = (y * k.w + x) * 4;
    if (bx < 0 || by < 0 || bx >= W || by >= H) continue;
    const bi = (by * W + bx) * 4, ai = (ay * W + ax) * 4;
    // yalnız iki gözün kendi kutusu (ağız ve burun yamaya girmez: arada kayma olsa da çift görünmez)
    let yum = 0;
    for (const g of cift) {
      const bx0 = g.x0 - gw * 0.5 - k.x, bx1 = g.x1 + gw * 0.5 - k.x, by0 = g.y0 - gh * 0.75 - k.y, by1 = g.y1 + gh * 0.4 - k.y;
      const ic = Math.min(x - bx0, bx1 - x, y - by0, by1 - y);
      yum = Math.max(yum, Math.min(1, Math.max(0, ic / (gw * 0.22))));
    }
    out[o] = B.data[bi]; out[o + 1] = B.data[bi + 1]; out[o + 2] = B.data[bi + 2];
    out[o + 3] = Math.round(Math.min(A.data[ai + 3], B.data[bi + 3]) * yum);
  }
  const buf = await s(out, { raw: { width: k.w, height: k.h, channels: 4 } }).webp({ quality: 94, alphaQuality: 100 }).toBuffer();
  await yaz(path.join(CIKTI, `${hayvan}-goz-yama.webp`), buf);
  const json = path.join(CIKTI, 'goz-yama.json');
  const tablo = fs.existsSync(json) ? JSON.parse(fs.readFileSync(json, 'utf8')) : {};
  tablo[hayvan] = { x: +(k.x / W).toFixed(4), y: +(k.y / H).toFixed(4), w: +(k.w / W).toFixed(4), h: +(k.h / H).toFixed(4) };
  fs.writeFileSync(json, JSON.stringify(tablo, null, 1) + '\n');
  console.log(`${hayvan}: göz yaması (hiza ${ox},${oy})`, JSON.stringify(tablo[hayvan]));
}

/**
 * Nehir abla ağızları: taban 5. kare ("a"). 6 "o", 7 "e" aynı duruşta: ağız kutusu bu karelerin farkından bulunur.
 * 1. kare (kapalı gülümseme) biraz daha cepheden: ağzı yerel hizayla tabana oturtulur. Yamalar kenarı yumuşak.
 */
async function nehirAgiz() {
  const yol = (n) => path.join(CIKTI, `nehir-anlatici-${n}.webp`);
  if (!fs.existsSync(yol(5))) return;
  const ilk = await s(yol(5)).metadata();
  const W = ilk.width, H = ilk.height, n = W * H;
  const oku = async (k) => (await s(yol(k)).ensureAlpha().resize(W, H).raw().toBuffer({ resolveWithObject: true })).data;
  const lu = (D, i) => (D[i * 4 + 3] < 128 ? 255 : (D[i * 4] * 3 + D[i * 4 + 1] * 6 + D[i * 4 + 2]) / 10);
  /** iki göz bebeği (koyu yuvarlak, yan yana) */
  const gozler = (D) => {
    const et = new Int32Array(n).fill(-1), q = new Int32Array(n), kumeler = [];
    for (let i = 0; i < n; i++) {
      if (et[i] >= 0 || i / W > H * 0.5 || lu(D, i) > 70) continue;
      let bb = 0, ee = 0; q[ee++] = i; et[i] = kumeler.length; let x0 = W, y0 = H, x1 = 0, y1 = 0;
      while (bb < ee) { const p = q[bb++], x = p % W, y = (p / W) | 0; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
        for (const d of [-1, 1, -W, W]) { const r = p + d; if (r < 0 || r >= n || et[r] >= 0 || lu(D, r) > 70) continue; if ((d === -1 && x === 0) || (d === 1 && x === W - 1)) continue; et[r] = kumeler.length; q[ee++] = r; } }
      kumeler.push({ alan: ee, x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 });
    }
    const aday = kumeler.filter((k) => { const w = k.x1 - k.x0 + 1, h = k.y1 - k.y0 + 1; return k.alan > n * 0.00005 && k.alan < n * 0.01 && w / h > 0.4 && w / h < 2.2 && k.alan > w * h * 0.45; });
    let cift = null, enIyi = Infinity;
    for (const p of aday) for (const r of aday) { if (r === p || p.cx > r.cx) continue; const dx = r.cx - p.cx, dy = Math.abs(p.cy - r.cy); if (dx < W * 0.05 || dx > W * 0.3 || dy > H * 0.03) continue; const puan = Math.abs(p.alan - r.alan) / Math.max(p.alan, r.alan) + dy / 10; if (puan < enIyi) { enIyi = puan; cift = [p, r]; } }
    return cift;
  };
  /** ağzın ortası: gözlerin altındaki bölgede koyu çizgi ve kırmızı ağız içinin ağırlık merkezi */
  const agizOrta = (D, g) => {
    const ara = g[1].cx - g[0].cx, mx = (g[0].cx + g[1].cx) / 2, gy = Math.max(g[0].y1, g[1].y1);
    let sx = 0, sy = 0, k = 0;
    for (let y = Math.round(gy + ara * 0.55); y < gy + ara * 1.1 && y < H; y++) for (let x = Math.round(mx - ara * 0.45); x < mx + ara * 0.45 && x < W; x++) {
      const i = (y * W + x) * 4; if (D[i + 3] < 200) continue;
      const r = D[i], gg = D[i + 1], b = D[i + 2];
      if (lu(D, y * W + x) < 90 || (r > 170 && gg < 130 && b < 130)) { sx += x; sy += y; k++; }
    }
    return k ? { x: sx / k, y: sy / k, ara } : null;
  };
  const A = await oku(5);
  const gA = gozler(A);
  const mA = gA && agizOrta(A, gA);
  if (!mA) return console.log('nehir: taban karede göz/ağız bulunamadı');
  const kw = Math.round(mA.ara * 1.08), kh = Math.round(mA.ara * 0.64);
  const M = { x0: Math.round(mA.x - kw / 2), y0: Math.round(mA.y - kh / 2) };
  const tablo = { agiz: { x: +(M.x0 / W).toFixed(4), y: +(M.y0 / H).toFixed(4), w: +(kw / W).toFixed(4), h: +(kh / H).toFixed(4) } };
  for (const [ad, k] of [['o', 6], ['e', 7], ['kapali', 1]]) {
    const B = await oku(k);
    const gB = gozler(B);
    const mB = gB && agizOrta(B, gB);
    if (!mB) { console.log(`nehir ağız ${ad}: bulunamadı`); continue; }
    const ox = Math.round(mB.x - mA.x), oy = Math.round(mB.y - mA.y);
    const out = Buffer.alloc(kw * kh * 4), kenar = Math.min(kw, kh) * 0.3;
    for (let y = 0; y < kh; y++) for (let x = 0; x < kw; x++) {
      const ax = M.x0 + x, ay = M.y0 + y, bx = ax + ox, by = ay + oy, o2 = (y * kw + x) * 4;
      if (bx < 0 || by < 0 || bx >= W || by >= H || ax < 0 || ay < 0 || ax >= W || ay >= H) continue;
      const bi = (by * W + bx) * 4, ai = (ay * W + ax) * 4;
      // köşeleri yuvarlak, kenarı yumuşak (elips)
      const ex = (x - kw / 2) / (kw / 2), ey = (y - kh / 2) / (kh / 2), r = Math.hypot(ex, ey);
      // içi tam örter (tabandaki açık ağız görünmesin), dışa doğru yumuşar
      const yum = r < 0.78 ? 1 : Math.max(0, (1 - r) / 0.22);
      out[o2] = B[bi]; out[o2 + 1] = B[bi + 1]; out[o2 + 2] = B[bi + 2];
      out[o2 + 3] = Math.round(Math.min(A[ai + 3], B[bi + 3]) * yum);
    }
    await yaz(path.join(CIKTI, `nehir-agiz-${ad}.webp`), await s(out, { raw: { width: kw, height: kh, channels: 4 } }).webp({ quality: 94, alphaQuality: 100 }).toBuffer());
    console.log(`nehir ağız ${ad}: kaydırma ${ox},${oy}`);
  }
  fs.writeFileSync(path.join(CIKTI, 'nehir-agiz.json'), JSON.stringify(tablo, null, 1) + '\n');
  console.log('nehir ağız kutusu', JSON.stringify(tablo.agiz));
}

// ================================================================ v2 (ekip/senaryo/PATI-V2.md §11d)
// Gemini sayfaları ekip/gemini/yeni/pati/v2/<dosya>.png. Gelmeyen sayfa atlanır ("bekleniyor"); gelince aynı komut
// yeniden çalıştırılır, oyun yeni dosyayı kendiliğinden seçer (pati/src/varliklar.ts). Büyük dosya ezilmez (guvenli-yaz).
//   node ekip/illustrator/pati/pati-isle.cjs v2            hepsi
//   node ekip/illustrator/pati/pati-isle.cjs v2-arka       arka planlar (tam boy 2752×1536 → assets/pati/<ad>.webp)
//   node ekip/illustrator/pati/pati-isle.cjs v2-esya       ui-jeton, ui-dolap, eşya ve süs sayfaları
//   node ekip/illustrator/pati/pati-isle.cjs v2-hayvan     hayvanların H (hareket), B (bakım), T (tepki) sayfaları
//   node ekip/illustrator/pati/pati-isle.cjs v2-aile       ziyaretçi sayfaları (Kino ailesi, Nehir) ve kadro-c
const V2 = 'v2';
const ARKA_V2 = ['vitrin-ic', 'bakim-odasi', 'dis-vitrin', 'kemirgen-rafi', 'akvaryum-duvari', 'kus-kosesi', 'surungen-kosesi', 'bahce', 'bahce-gece', 'sevme-kosesi', 'kapak'];
/** Eşya / arayüz sayfaları: dosya → [önek, kare adları (soldan sağa, üstten alta)]; çıktı assets/pati/<önek>-<kare>.webp */
const ESYA_V2 = {
  'ui-jeton': ['ui', ['jeton', 'buyuk-jeton', 'jeton-yigini', 'kumbara', 'etiket', 'kalp-dolu', 'kalp-bos', 'altin-kalp', 'hediye', 'isim-tabelasi', 'defter', 'perde']],
  'ui-dolap': ['dolap', ['mama', 'su', 'oyuncak', 'temizlik', 'yatak', 'ecza']],
  'esya-1-yiyecek': ['esya', ['kopek-mamasi', 'kedi-mamasi', 'kemik-biskuvi', 'konserve', 'sut-kasesi', 'havuc', 'saman', 'marul', 'elma', 'cilek', 'suluk-sisesi', 'kedi-cesmesi']],
  'esya-2-yiyecek': ['esya', ['aycekirdegi', 'kirmizi-biber', 'dari-cubugu', 'kus-tohumu', 'civciv-yemi', 'bezelye', 'ekmek', 'meyve-puresi', 'kus-sulugu', 'sig-su-kabi', 'civciv-sulugu', 'mini-havuz']],
  'esya-3-oyuncak': ['esya', ['halat', 'yumak', 'cingirakli-top', 'frizbi', 'kemirme-cubugu', 'cark', 'tunel', 'karton-kutu', 'ayna', 'can', 'hamster-topu', 'kus-salincagi']],
  'esya-4-temizlik': ['esya', ['yumusak-firca', 'tarak', 'islak-mendil', 'pati-havlusu', 'su-spreyi', 'kum-banyosu', 'kabuk-fircasi', 'cam-silecek', 'kus-banyo-kabi', 'su-kovasi', 'kum-saati', 'yara-bandi']],
  // minder beyaz çizilir: oyun 4 renge kendisi boyar (çarpma karışımı; kontur koyu kalır)
  'esya-5-yatak': ['esya', ['minder', 'sepet-yatak', 'kedi-iglosu', 'saman-yuvasi', 'talas-yuvasi', 'pelus-ayi', 'kafes-ortusu', 'muzik-kutusu', 'isi-lambasi', 'isi-lambasi-acik', 'ilik-su-torbasi', 'surup-kasigi']],
  'esya-6-kose': ['esya', ['tirmanma-dali', 'yaprak-hamak', 'magara-tasi', 'akvaryum-kalesi', 'baloncuk-tasi', 'kum-tepsisi', 'lastik-ordek', 'kirpi-kabi', 'tasima-sepeti', 'yaprak-yigini', 'hayvan-evi', 'kutuk-tunel']],
  'sus-1': ['sus', ['saksi', 'buyuk-bitki', 'flama', 'hali', 'saat', 'kedi-resmi', 'balon', 'isiklar', 'tabure', 'kus-evi', 'sulama-kabi', 'balik-lamba']],
  'sus-2': ['sus', ['cit', 'cicek-kemer', 'pati-tabela', 'cesme', 'semsiye', 'bank', 'fener', 'oyuncak-rafi', 'kaktus', 'balik-mobil', 'kalp-ayna', 'yaprak-tac']],
};
/** İnce parçalı kareler (değnek, kalp çerçevesi, perde ipi) küçük parça diye silinmesin */
const ESYA_V2_AYAR = { 'ui-altin-kalp': { minOran: 0.2 }, 'ui-kalp-bos': { minOran: 0.0005 }, 'ui-perde': { minOran: 0.0005 }, 'esya-dari-cubugu': { minOran: 0.0005 }, 'esya-tirmanma-dali': { minOran: 0.0005 } };
/** Hayvan sayfalarının kare adları (PATI-V2 §8b, §11b) */
const H_KARE = ['bos', 'goz', 'ac', 'oyun', 'yiyor', 'uyku', 'sevinc', 'ozel'];
const B_KARE = ['susamis', 'iciyor', 'kirli', 'fircalanma', 'esneme', 'sikildi', 'hasta', 'hapsirma'];
const T_KARE = ['begenmedi', 'iyy', 'saskin', 'islak', 'silkelen', 'dans-a', 'dans-b', 'dans-c'];
/** Türün H kare sırası (v1 sayfaları kendi sırasıyla çizildi); renk yavrusu türünün sayfasından boyanır, sırası aynı */
const H_OZEL = { findik: SAYFALAR.findik, tarcin: SAYFALAR.tarcin, piril: SAYFALAR.piril, pamuk: SAYFALAR.tarcin, duman: SAYFALAR.tarcin, cikolata: SAYFALAR.findik, diken: ['bos', 'goz', 'kokla', 'yuru1', 'yuru2', 'top', 'yiyor', 'bakis'] };
/** Tarçın'ın H sayfasında "aç" yok: B sayfasının 8. karesi aç (hapşırma yerine) */
const B_OZEL = { tarcin: [...B_KARE.slice(0, 7), 'ac'], pamuk: [...B_KARE.slice(0, 7), 'ac'], duman: [...B_KARE.slice(0, 7), 'ac'] };
const T_OZEL = { piril: ['begenmedi', 'tukur', 'saskin', 'bulanik', 'sikildi', 'dans-a', 'dans-b', 'utangac'] };
/**
 * GPT Image poz sayfaları (ekip/gemini/yeni/restoran/chibi/ISTEK.md §5; 1536×1024, 8 poz): dur, otur, yürü, zıpla-sevin,
 * ye, uyu, şaşır, dans. Göz kapalı karesi yok (göz kırpma yaması çıkmaz).
 * piril-hareket-sayfasi-v2.png BİLEREK KESİLMEZ: Pırıl'ın v1 (Gemini) sayfası tam set + göz kırpma; v2 başka çizim (iki göz
 * önden), yalnız bir kısmı üstüne yazılırsa set karışır ve göz yaması kayar. Değiştirilecekse bütün piril-* birlikte.
 */
const H_GPT = ['bos', 'rahat', 'ozel', 'sevinc', 'yiyor', 'uyku', 'saskin', 'dans-a'];
const GPT_SAYFA = { pofuduk: H_GPT, fistik: H_GPT, kurabiye: H_GPT, limon: H_GPT, tospik: H_GPT };
const HAYVANLAR_V2 = ['findik', 'tarcin', 'pofuduk', 'fistik', 'kurabiye', 'piril', 'limon', 'tospik', 'zumrut', 'cucuk', 'vakvak', 'diken', 'pamuk', 'duman', 'cikolata', 'kakao', 'boncuk'];
/** Ziyaretçi sayfaları (2×4, boydan): <kim>-dukkan-1..8 */
const AILE_V2 = ['kino', 'lokum', 'anne', 'babaanne', 'dede', 'baba', 'nehir'];

/**
 * Köşe arka planları Recraft VEKTÖR çizimi (ekip/gemini/yeni/pati/v2/recraft/<ad>.svg, 2048×1170, düz karşıdan, hayvansız):
 * SVG olduğu gibi assets/pati/<ad>.svg olur (sonsuz net; netlik sınırı SVG'ye uygulanmaz). Aynı adlı PNG gelirse o
 * webp'ye çevrilir ve oyun webp'yi önce seçer (varliklar.ts KOSE_ARKA). Habitatların ölçüleri pati/src/kose.ts KOSE_PLANI.
 */
const RECRAFT_SVG = ['kemirgen-rafi', 'akvaryum-duvari', 'kus-kosesi', 'surungen-kosesi', 'bahce'];
async function arkaV2() {
  for (const ad of RECRAFT_SVG) {
    const g = path.join(G, V2, 'recraft', `${ad}.svg`);
    if (!fs.existsSync(g)) continue;
    fs.copyFileSync(g, path.join(CIKTI, `${ad}.svg`));
    console.log(`${ad}.svg (Recraft vektör)`, Math.round(fs.statSync(g).size / 1024), 'KB');
  }
  for (const ad of ARKA_V2) {
    const g = path.join(G, V2, `${ad}.png`);
    if (!fs.existsSync(g)) { if (!RECRAFT_SVG.includes(ad)) console.log(`${ad}: arka plan yok (bekleniyor)`); continue; }
    const m = await s(g).metadata();
    if (m.width < 2048) { console.log(`${ad}: ${m.width}×${m.height} küçük (2048 altı reddedilir, PATI-V2 §11a); kesilmedi`); continue; }
    const buf = await s(g).removeAlpha().webp({ quality: 86, effort: 5 }).toBuffer();
    if (await yaz(path.join(CIKTI, `${ad}.webp`), buf)) console.log(`${ad}.webp`, m.width, '×', m.height, Math.round(buf.length / 1024), 'KB');
  }
}

async function esyaV2() {
  for (const [dosya, [onek, kareler]] of Object.entries(ESYA_V2))
    await sayfaKes(onek, kareler, { dosya: path.join(V2, `${dosya}.png`), esya: true, ayar: ESYA_V2_AYAR });
}

/**
 * GPT Image sayfaları NANE zeminli ve her pozun altında koyu nane gölge elipsi var: kesimden önce zemin ve gölge beyaza
 * çevrilir (zemin ölçütü: yeşil ve mavisi kırmızısından belirgin yüksek, yeşil ≥ 190, mavi ≥ 160; Limon'un yeşili ve
 * mavi yanağı, Tospik'in kabuğu bu ölçüte girmez). Zeminle kontur arasındaki 2 px'lik yeşilimsi karışım şeridi de beyaz
 * olur (kahve konturda kırmızı > yeşil: korunur). Beyaz zeminli sayfa olduğu gibi döner.
 */
async function naneBeyaz(dosya) {
  const { data, info } = await s(dosya).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, n = W * H;
  const nane = (i) => { const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2]; return g >= 190 && b >= 160 && g > r + 30 && b > r + 10; };
  if (!nane(2 * W + 2)) return dosya;
  const M = new Uint8Array(n);
  for (let i = 0; i < n; i++) M[i] = nane(i) ? 1 : 0;
  const cik = Buffer.from(data);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      let beyaz = M[i] === 1;
      if (!beyaz && data[i * 3 + 1] > data[i * 3]) {
        for (let dy = -2; dy <= 2 && !beyaz; dy++) for (let dx = -2; dx <= 2; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < H && M[yy * W + xx]) { beyaz = true; break; } }
      }
      if (beyaz) cik[i * 3] = cik[i * 3 + 1] = cik[i * 3 + 2] = 255;
    }
  const yeni = path.join(ARA, `beyaz-${path.basename(dosya)}`);
  await s(cik, { raw: { width: W, height: H, channels: 3 } }).png().toFile(yeni);
  console.log(`  nane zemin beyazlatıldı: ${path.basename(dosya)}`);
  return yeni;
}

/** Bir hayvanın gelmiş bütün sayfaları (H v1 ya da v2, B, T) aynı klasörde kesilir: hepsi aynı ölçek ve taban çizgisinde */
async function hayvanV2(id) {
  const girdi = path.join(ARA, `v2-${id}`);
  fs.rmSync(girdi, { recursive: true, force: true });
  const gpt = path.join(V2, `${id}-hareket-sayfasi.png`);
  const sayfalar = [
    GPT_SAYFA[id] && fs.existsSync(path.join(G, gpt)) ? [[gpt], GPT_SAYFA[id]] : [[path.join(V2, `${id}-hareket-sayfasi.png`), `${id}-hareket-sayfasi.png`], H_OZEL[id] || H_KARE],
    [[path.join(V2, `${id}-bakim-sayfasi.png`)], B_OZEL[id] || B_KARE],
    [[path.join(V2, `${id}-tepki-sayfasi.png`)], T_OZEL[id] || T_KARE],
  ];
  let n = 0;
  for (const [adaylar, kareler] of sayfalar) {
    let dosya = adaylar.find((f) => fs.existsSync(path.join(G, f)));
    if (!dosya) continue;
    dosya = await naneBeyaz(path.join(G, dosya));
    if (await sayfaKes(id, kareler, { dosya, girdi, yalnizKare: true })) n++;
  }
  if (!n) return console.log(`${id}: sayfa yok (bekleniyor)`);
  const hiza = id === 'piril' ? 'orta' : 'alt';
  execFileSync('node', [ESYA_KES, '--girdi', girdi, '--cikti', CIKTI, '--esit', `^${id}-`, '--esit-hiza', hiza, '--max', '1100'], { stdio: 'inherit', cwd: KOK });
  await gozYamasi(id, id === 'piril' ? 'yuz1' : 'bos', 'goz');
}

async function aileV2() {
  const adlar = ['1', '2', '3', '4', '5', '6', '7', '8'];
  for (const kim of AILE_V2) await sayfaKes(`${kim}-dukkan`, adlar, { dosya: path.join(V2, `${kim}-dukkan-sayfasi.png`) });
  await sayfaKes('kadro-c', ['cucuk', 'vakvak', 'zumrut'], { dosya: path.join(V2, 'kadro-c.png'), esya: true });
}

(async () => {
  fs.mkdirSync(ARA, { recursive: true });
  const v2 = (ad) => is.includes('v2') || is.includes(ad) || !is.length;
  if (v2('v2-arka')) await arkaV2();
  if (v2('v2-esya')) await esyaV2();
  if (v2('v2-hayvan')) for (const id of HAYVANLAR_V2) await hayvanV2(id);
  if (v2('v2-aile')) await aileV2();
  if (is.length && is.every((a) => a.startsWith('v2'))) return;
  if (is[0] === 'goz') { for (const h of Object.keys(SAYFALAR)) await gozYamasi(h, h === 'piril' ? 'yuz1' : 'bos', 'goz'); return; }
  if (yap('salon')) await salon();
  if (yap('esya')) await esya();
  if (yap('poz')) for (const [h, k] of Object.entries(SAYFALAR)) await sayfaKes(h, k);
  // G5 köşe sayfası (1×3): köpek köşesi (çit + minder), kedi köşesi (tırmalama ağacı + kutu), balıksız akvaryum.
  // Çitin tahta araları ve akvaryumun su üstü kapalı beyaz: delik olarak açılır (arkadaki duvar görünür)
  if (yap('kose-sayfa'))
    await sayfaKes('kose', ['kopek', 'kedi', 'akvaryum'], { dosya: 'kose-sayfasi.png', esya: true, ayar: { 'kose-kopek': { delik: true, delikMin: 300 }, 'kose-akvaryum': { delik: true, delikMin: 300 } } });
  // G6 Nehir anlatıcı sayfası (2×4, belden yukarı): nehir-anlatici-1..8; ağız yamaları 5. karenin üstüne
  if (yap('nehir')) {
    const adlar = ['1', '2', '3', '4', '5', '6', '7', '8'];
    const ayar = Object.fromEntries(adlar.map((a) => [`nehir-anlatici-${a}`, { delik: true, delikMin: 400 }]));
    await sayfaKes('nehir-anlatici', adlar, { dosya: 'nehir-anlatici-sayfasi.png', belden: true, ayar });
    await nehirAgiz();
    // göz kırpma: kahkaha karesinin (8) kapalı gözleri, tabanın (5) gözlerine yerel hizayla
    await gozYamasi('nehir-anlatici', '5', '8');
  }
  // G7 gece salonu: Gemini düzenlemesi gündüzden biraz büyümüş (ölçüldü: x × 1.0124 − 1.6, y × 1.0107 − 7.0 px;
  // 9 bölgede kenar haritası eşleştirmesiyle). Gündüzle piksel piksel çakışsın diye ters dönüşümle yeniden örneklenir.
  if (yap('gece')) {
    const g = path.join(G, 'salon-gece.png'), P = 40, W = 2752, H = 1536;
    const sx = 1.0124, cx = -1.6, sy = 1.0107, cy = -7.0;
    const genis = await s(g).removeAlpha().extend({ top: P, bottom: P, left: P, right: P, extendWith: 'copy' }).png().toBuffer();
    const sol = Math.round(P + cx), ust = Math.round(P + cy);
    const buf = await s(genis).extract({ left: sol, top: ust, width: Math.round(W * sx), height: Math.round(H * sy) }).resize(W, H, { kernel: 'lanczos3' }).webp({ quality: 86, effort: 5 }).toBuffer();
    if (await yaz(path.join(CIKTI, 'salon-gece.webp'), buf)) console.log('salon-gece.webp', Math.round(buf.length / 1024), 'KB');
  }
  // G4 eşya sayfası (3×4): esya-<ad>.webp; oyun geçici eşyaların yerine bunları kendiliğinden seçer
  if (yap('esya-sayfa'))
    await sayfaKes('esya', ESYA_SAYFA, { dosya: 'esya-sayfasi.png', esya: true, ayar: { 'esya-dusunce-balonu': { minOran: 0.0005 }, 'esya-tuy-degnek': { minOran: 0.0005 } } });
})();
