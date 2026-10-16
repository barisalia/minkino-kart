// Mino Ne Giysin? Gemini sayfalarını keser ve oyuna bağlar (ekip/senaryo/MINO-NE-GIYSIN.md §9).
//
//   node ekip/illustrator/mino-giysin-isle.cjs            → iki sayfa da (hangisi geldiyse)
//   node ekip/illustrator/mino-giysin-isle.cjs kostum     → yalnız G-MG1 (12 kostüm parçası)
//   node ekip/illustrator/mino-giysin-isle.cjs pamuk      → yalnız G-MG2 (Pamuk'un 8 ağaç pozu)
//   --sayfa <png>  : sayfayı başka yerden oku (varsayılan ekip/gemini/yeni/mino-giysin/<ad>.png)
//   --cikti <dir>  : deneme çıktısı (varsayılan assets/mino-giysin)
//   ZORLA=1        : daha büyük mevcut çıktıyı da ez (guvenli-yaz.cjs)
//
// G-MG1 kostum-sayfasi.png (3 sıra × 4 sütun): sıra 1 şapkalar, sıra 2 üstler, sıra 3 aletler; sütunlar doktor,
//   itfaiye, aşçı, bahçe → assets/mino-giysin/{bas,ust,alet}-{doktor,itfaiye,asci,bahce}.webp (gemini-esya.cjs; her parça
//   kendi sınırına kırpılır, Mino'daki genişliği YER tablosundan), dolap ikonları
//   assets/mino-giysin/ikon/<ad>.webp (aynı resmin küçük kopyası, uzun kenar 320), hasır şapkanın çiçeği ayrı katman
//   bas-bahce-cicek.webp (şapkanın tuvalinde; tam takım süsü "pıt" diye açar) ve assets/mino-giysin/kostum-yer.json
//   (Mino'nun 2048'lik çizimindeki kutular: genişlik ve tutma noktası korunur, boy resmin oranından).
// G-MG2 pamuk-agac-hareket-sayfasi.png (2 × 4): assets/mino-giysin/pamuk-{bekle,kirp,korku,islak,kokla,kay,atla,yala}.webp
//   (ortak tuval, tabanlar hizalı), kürk Pamuk'un soğuk beyazına (pamuk-sogut.cjs); 'kirp' karosu yalnız göz yaması
//   olarak kullanılır (oyun bekle ↔ kirp arasında göz kırpar).
// Ara dosyalar (karolar) ekip/mino-giysin/ham/ (repoya girmez). Sayfa yoksa hiçbir şey yazılmaz; oyun yer tutucularla
// (assets/mino-giysin/yer-tutucu/*.svg) oynar ve resim gelince kendiliğinden gerçeğe geçer (mino-giysin/src/resimler.ts).
//
// Karolar: sayfada beyaz olmayan lekeler bulunur (küçültülmüş kopyada, şişirilerek), sıralara ve sütunlara dağıtılır.
// Lekeler beklenen sayıda değilse sayfa eşit ızgarayla bölünür (uyarı yazılır: Gemini karolara dokunan bir şey çizdiyse
// o sıra aynı sohbette yeniden istenmeli).
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const guvenliYaz = require('./guvenli-yaz.cjs');
const { sogut } = require('./pamuk-sogut.cjs');

const KOK = path.resolve(__dirname, '../..');
const GEMINI = path.join(KOK, 'ekip/gemini/yeni/mino-giysin');
const arg = (ad, v) => {
  const i = process.argv.indexOf('--' + ad);
  return i >= 0 ? process.argv[i + 1] : v;
};
// --cikti <klasör>: deneme için başka yere yaz (varsayılan assets/mino-giysin)
const CIKTI = path.resolve(arg('cikti', path.join(KOK, 'assets/mino-giysin')));
const HAM = path.join(KOK, 'ekip/mino-giysin/ham');
const ROLLER = ['doktor', 'itfaiye', 'asci', 'bahce'];
const KOSTUM_ADLAR = [...ROLLER.map((r) => `bas-${r}`), ...ROLLER.map((r) => `ust-${r}`), ...ROLLER.map((r) => `alet-${r}`)];
const PAMUK_ADLAR = ['bekle', 'kirp', 'korku', 'islak', 'kokla', 'kay', 'atla', 'yala'].map((a) => `pamuk-${a}`);

/**
 * Kostüm yerleri (Mino'nun 2048'lik çiziminde): genişlik ve tutma noktası sabit, boy resmin oranından.
 * bas: kulakların arasında, alt kenarı alın çizgisinde (y); ust: fuların altından (üst kenar y) kalçaya;
 * alet: sağ patide tutma noktası (resmin tutma oranı tut: 0 üst, 1 alt).
 */
const YER = {
  'bas-doktor': { tur: 'bas', en: 728, x: 1024, alt: 480 },
  'bas-itfaiye': { tur: 'bas', en: 708, x: 1024, alt: 460 },
  'bas-asci': { tur: 'bas', en: 568, x: 1024, alt: 410 },
  'bas-bahce': { tur: 'bas', en: 768, x: 1024, alt: 460 },
  'ust-doktor': { tur: 'ust', en: 568, x: 1024, ust: 1250 },
  'ust-itfaiye': { tur: 'ust', en: 568, x: 1024, ust: 1250 },
  'ust-asci': { tur: 'ust', en: 568, x: 1024, ust: 1250 },
  'ust-bahce': { tur: 'ust', en: 568, x: 1024, ust: 1250 },
  'alet-doktor': { tur: 'alet', en: 260, x: 1380, tutY: 1560, tut: 0.55 },
  'alet-itfaiye': { tur: 'alet', en: 220, x: 1400, tutY: 1560, tut: 0.66 },
  'alet-asci': { tur: 'alet', en: 160, x: 1380, tutY: 1560, tut: 0.7 },
  'alet-bahce': { tur: 'alet', en: 330, x: 1400, tutY: 1560, tut: 0.5 },
};

/** Sayfadaki çizim lekeleri: küçültülmüş kopyada beyaz olmayan pikseller, şişirilip bağlı bölgeler (tam ölçek kutular) */
async function lekeler(dosya) {
  const m = await s(dosya).metadata();
  const k = Math.min(1, 700 / m.width);
  const W = Math.round(m.width * k);
  const H = Math.round(m.height * k);
  const { data } = await s(dosya).removeAlpha().resize(W, H).raw().toBuffer({ resolveWithObject: true });
  const n = W * H;
  const dolu = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    dolu[i] = Math.min(r, g, b) < 225 || Math.max(r, g, b) - Math.min(r, g, b) > 30 ? 1 : 0;
  }
  // şişir (yakın parçalar, ör. stetoskobun ucu, aynı lekede kalsın)
  const R = Math.max(2, Math.round(W * 0.012));
  const sis = new Uint8Array(n);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (!dolu[y * W + x]) continue;
      for (let dy = -R; dy <= R; dy++)
        for (let dx = -R; dx <= R; dx++) {
          const xx = x + dx, yy = y + dy;
          if (xx >= 0 && yy >= 0 && xx < W && yy < H) sis[yy * W + xx] = 1;
        }
    }
  const et = new Int32Array(n).fill(-1);
  const q = new Int32Array(n);
  const sonuc = [];
  for (let i = 0; i < n; i++) {
    if (!sis[i] || et[i] >= 0) continue;
    let b = 0, e = 0;
    q[e++] = i;
    et[i] = sonuc.length;
    let x0 = W, y0 = H, x1 = 0, y1 = 0, alan = 0;
    while (b < e) {
      const p = q[b++], x = p % W, y = (p / W) | 0;
      if (dolu[p]) alan++;
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      for (const d of [-1, 1, -W, W]) {
        const r = p + d;
        if (r < 0 || r >= n || et[r] >= 0 || !sis[r]) continue;
        if ((d === -1 && x === 0) || (d === 1 && x === W - 1)) continue;
        et[r] = sonuc.length;
        q[e++] = r;
      }
    }
    sonuc.push({ x0: x0 / k, y0: y0 / k, x1: (x1 + 1) / k, y1: (y1 + 1) / k, alan });
  }
  const enBuyuk = Math.max(...sonuc.map((l) => l.alan));
  return { lekeler: sonuc.filter((l) => l.alan > enBuyuk * 0.04), W: m.width, H: m.height };
}

/** Lekeleri sıra × sütun düzenine koyar; olmazsa eşit ızgara */
async function karolar(dosya, sira, sutun) {
  const { lekeler: L, W, H } = await lekeler(dosya);
  if (L.length === sira * sutun) {
    const cy = (l) => (l.y0 + l.y1) / 2;
    const yli = [...L].sort((a, b) => cy(a) - cy(b));
    const sonuc = [];
    for (let r = 0; r < sira; r++) sonuc.push(...yli.slice(r * sutun, (r + 1) * sutun).sort((a, b) => a.x0 + a.x1 - b.x0 - b.x1));
    return sonuc.map((l) => {
      const pay = 0.02 * W;
      return { x0: Math.max(0, l.x0 - pay), y0: Math.max(0, l.y0 - pay), x1: Math.min(W, l.x1 + pay), y1: Math.min(H, l.y1 + pay) };
    });
  }
  console.warn(`UYARI ${path.basename(dosya)}: ${L.length} leke bulundu (${sira * sutun} bekleniyordu); sayfa eşit ızgarayla bölünüyor`);
  const sonuc = [];
  for (let r = 0; r < sira; r++)
    for (let c = 0; c < sutun; c++) sonuc.push({ x0: (c * W) / sutun, y0: (r * H) / sira, x1: ((c + 1) * W) / sutun, y1: ((r + 1) * H) / sira });
  return sonuc;
}

async function karolariYaz(dosya, adlar, sira, sutun, klasor) {
  fs.rmSync(klasor, { recursive: true, force: true });
  fs.mkdirSync(klasor, { recursive: true });
  const k = await karolar(dosya, sira, sutun);
  for (let i = 0; i < adlar.length; i++) {
    const r = k[i];
    const left = Math.round(r.x0), top = Math.round(r.y0);
    await s(dosya)
      .removeAlpha()
      .extract({ left, top, width: Math.round(r.x1) - left, height: Math.round(r.y1) - top })
      .extend({ top: 24, bottom: 24, left: 24, right: 24, background: '#ffffff' })
      .png()
      .toFile(path.join(klasor, adlar[i] + '.png'));
  }
}

/** gemini-esya.cjs ile kesim; esit verilirse grup ortak tuvalde (Gemini'nin ölçeği korunur, tabanlar hizalı) */
function esyaKes(girdi, esit, ekAyar = {}) {
  const ek = esit ? ['--esit', esit, '--esit-hiza', 'alt'] : [];
  execFileSync(process.execPath, [path.join(__dirname, 'gemini-esya.cjs'), '--girdi', girdi, '--cikti', CIKTI, ...ek, '--max', '1400', '--ayar', JSON.stringify(ekAyar)], { stdio: 'inherit', cwd: KOK });
}

/** Hasır şapkanın çiçeği: pembe pikseller ve çevresi (konturuyla) ayrı katman, şapkayla aynı tuvalde */
async function cicekKatmani() {
  const yol = path.join(CIKTI, 'bas-bahce.webp');
  const { data, info } = await s(yol).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (data[i + 3] > 200 && r > 200 && b > 140 && r - g > 50) {
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      }
    }
  if (x1 < 0) return console.warn('UYARI bas-bahce: pembe çiçek bulunamadı; bas-bahce-cicek yazılmadı');
  const pay = Math.round(Math.max(x1 - x0, y1 - y0) * 0.18);
  x0 = Math.max(0, x0 - pay); y0 = Math.max(0, y0 - pay); x1 = Math.min(W - 1, x1 + pay); y1 = Math.min(H - 1, y1 + pay);
  const out = Buffer.alloc(W * H * 4);
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const i = (y * W + x) * 4;
      data.copy(out, i, i, i + 4);
    }
  const buf = await s(out, { raw: { width: W, height: H, channels: 4 } }).webp({ quality: 94, alphaQuality: 100, effort: 5 }).toBuffer();
  await guvenliYaz(path.join(CIKTI, 'bas-bahce-cicek.webp'), buf);
  console.log(`bas-bahce-cicek: ${x1 - x0 + 1}x${y1 - y0 + 1} (tuval ${W}x${H})`);
}

async function ikonlar() {
  fs.mkdirSync(path.join(CIKTI, 'ikon'), { recursive: true });
  for (const ad of KOSTUM_ADLAR) {
    const yol = path.join(CIKTI, ad + '.webp');
    if (!fs.existsSync(yol)) continue;
    const buf = await s(yol).trim({ threshold: 1 }).resize(320, 320, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 92, alphaQuality: 100 }).toBuffer();
    await guvenliYaz(path.join(CIKTI, 'ikon', ad + '.webp'), buf);
  }
}

async function yerleriYaz() {
  const dosya = path.join(CIKTI, 'kostum-yer.json');
  const yer = fs.existsSync(dosya) ? JSON.parse(fs.readFileSync(dosya, 'utf8')) : {};
  for (const [ad, y] of Object.entries(YER)) {
    const yol = path.join(CIKTI, ad + '.webp');
    if (!fs.existsSync(yol)) continue;
    const m = await s(yol).metadata();
    const boy = Math.round((y.en * m.height) / m.width);
    const x = Math.round(y.x - y.en / 2);
    const top = y.tur === 'bas' ? y.alt - boy : y.tur === 'ust' ? y.ust : Math.round(y.tutY - boy * y.tut);
    yer[ad] = [x, top, y.en, boy];
    if (ad === 'bas-bahce') yer['bas-bahce-cicek'] = [x, top, y.en, boy];
  }
  // kutular tek satırda (elle düzeltmesi kolay)
  fs.writeFileSync(dosya, JSON.stringify(yer, null, 2).replace(/\[\s+(-?\d+),\s+(-?\d+),\s+(-?\d+),\s+(-?\d+)\s+\]/g, '[$1, $2, $3, $4]') + '\n');
  console.log('kostum-yer.json güncellendi (elle ince ayar: oyunda ?test=1&ekran=onizleme)');
}

async function kostum() {
  const sayfa = arg('sayfa', path.join(GEMINI, 'kostum-sayfasi.png'));
  if (!fs.existsSync(sayfa)) return console.log(`G-MG1 yok (${path.relative(KOK, sayfa)}): kostüm yer tutucuyla kalır`);
  const klasor = path.join(HAM, 'kostum');
  await karolariYaz(sayfa, KOSTUM_ADLAR, 3, 4, klasor);
  // her parça kendi sınırına kırpılır: Mino'daki yeri ve genişliği YER tablosundan (şapka alında, üst fuların altında, alet patide)
  esyaKes(klasor, null);
  await cicekKatmani();
  await ikonlar();
  await yerleriYaz();
}

async function pamuk() {
  const sayfa = arg('sayfa', path.join(GEMINI, 'pamuk-agac-hareket-sayfasi.png'));
  if (!fs.existsSync(sayfa)) return console.log(`G-MG2 yok (${path.relative(KOK, sayfa)}): Pamuk iskeletiyle oynar`);
  const klasor = path.join(HAM, 'pamuk');
  await karolariYaz(sayfa, PAMUK_ADLAR, 2, 4, klasor);
  esyaKes(klasor, '^(pamuk-)');
  for (const ad of PAMUK_ADLAR) {
    const yol = path.join(CIKTI, ad + '.webp');
    if (!fs.existsSync(yol)) continue;
    const { buf, degisen } = await sogut(fs.readFileSync(yol));
    fs.writeFileSync(yol, buf);
    console.log(`${ad}: soğuk beyaz (${degisen} piksel)`);
  }
}

(async () => {
  const ne = process.argv.slice(2).filter((a) => !a.startsWith('--') && !process.argv[process.argv.indexOf(a) - 1]?.startsWith('--'));
  if (!ne.length || ne.includes('kostum')) await kostum();
  if (!ne.length || ne.includes('pamuk')) await pamuk();
})();
