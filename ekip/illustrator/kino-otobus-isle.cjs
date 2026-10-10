// Gemini "Kino'nun Otobüsü" seti (ekip/gemini/yeni/kino-otobus/*.png, beyaz zemin, ≥2048) → assets/kino-otobus/<ad>.webp.
// Yeni dosya gelince tekrar çalıştırılır (güvenli: daha büyük mevcut dosya ezilmez, guvenli-yaz.cjs; ZORLA=1 ile ezilir).
//   node ekip/illustrator/kino-otobus-isle.cjs [--girdi <klasör>] [ad ...]   (repo kökünden; girdi varsayılanı ekip/gemini/yeni/kino-otobus)
// Kurallar (IS-LISTESI-YENI.md bölüm A ve D, "Şeffaf" sütunu):
//  - E (şeffaf): gemini-esya.cjs ile zemin KENARDAN akıtılarak silinir (çizimin içindeki beyazlar kalır, kahve kontur halesiz), kırpılır.
//  - H (zemin kalır): ic-arka, pencere-dogumgunu → yalnız küçültülür.
//  - otobus: Gemini tuvali korunur (16:9, otobüs ortada; varliklar.ts → OTOBUS_YERI bu tuvalde ölçüldü).
//  - top-*: ortak tuval, tabandan hizalı (kule yerleşimi tek ölçü: varliklar.ts → YERLESIM.top).
//  - sos-*-ust, serpinti-ust: topun tuvaline oturtulur (topun kubbesini örter, tepeden hizalı) → kulede topla aynı kutu.
//  - kap-*: ortak tuval, tabandan hizalı (dolapta hepsi aynı boy).
//  - Yeniden çizim: <ad>-v2.png (-v3 …) varsa <ad> için en yüksek sürüm kullanılır, eski <ad>.png atlanır; yeni çizim
//    olduğu için mevcut <ad>.webp'yi (daha büyük olsa da) ezer. Çıktı adı sürümsüz <ad>.webp (varliklar.ts anahtarı).
//  - kapak: menü kartı ve açılış resmi (zemin kalır, metinsiz Gemini sahnesi).
const { execFileSync } = require('child_process'), fs = require('fs'), os = require('os'), path = require('path');
const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const guvenliYaz = require('./guvenli-yaz.cjs');
const gi = process.argv.indexOf('--girdi');
const G = gi >= 0 ? process.argv.splice(gi, 2)[1] : 'ekip/gemini/yeni/kino-otobus', O = 'assets/kino-otobus', ARA = path.join(os.tmpdir(), 'kino-otobus-kes');
const ATLA = [];   // bilerek elle düzeltilen dosyalar buraya (betik yeniden üretmesin)
const ARKA = ['ic-arka', 'pencere-dogumgunu', 'kapak'];
/** çıktının uzun kenarı (px): ekranda en büyük hâli × DPR 3 */
const EN = { otobus: 1920, 'kulah-makinesi': 1400,'tezgah-on': 2800, dolap: 2000, 'ic-arka': 3072, 'pencere-dogumgunu': 2752, kapak: 2400, 'sus-flama': 1600, 'sus-ampul': 2400, 'sus-kemik-tabela': 1280, 'kino-onluk': 1280, 'kino-sapka': 1280 };
const VARSAYILAN_EN = 1024;
/**
 * Zemin kalan görsellerde kırpma (oran: tuvalin eni/boyu). pencere-dogumgunu: Gemini kendi pencere çerçevesini ve
 * çubuklu yan camları da çizdi; oyunun kendi çerçevesi (ic-arka) olduğu için yalnız orta camın içindeki bahçe alınır.
 * Kırpma yalnız ilk çizime (v1) uygulanır: pencere-dogumgunu-v2 çerçevesiz, kenardan kenara bahçe partisi (16:9, ortası
 * açık); tamamı alınır ve hem gün içi penceresinde hem tam ekran akşam sahnesinde kullanılır (uzun kenar 2752: DPR 3
 * telefonda tam ekran net).
 */
const KIRP = { 'pencere-dogumgunu': { sol: 0.2762, ust: 0.1107, en: 0.4506, boy: 0.7585 } };
/** gemini-esya ayarları (dosya başına) */
// kino-onluk: boyun askısının içi kapalı beyaz bölge → delik (şeffaf)
// kulah-makinesi / -kapak: aynı bakış açısı, ortak tuval (betik kapağı gövdeye oturtur, bkz. makineKapak); delikNokta:
// yalnız kulpun içindeki beyaz boşluk delik olur (sürahinin büyük beyaz parlaması delik olmasın)
const AYAR = {
  otobus: { tuvalKoru: true },
  'kino-onluk': { delik: true },
  'kara-tahta': { delik: true },
  lamba: { sat: 85 },
  'kulah-makinesi': { tuvalKoru: true, delik: true, delikNokta: [[2212, 900]] },
  'kulah-makinesi-kapak': { tuvalKoru: true },
  'hamur-surahi': { delik: true, delikNokta: [[1650, 1024]] },
};
/**
 * Külah makinesi (Gemini 2528×1696, kapaksız) ve kapağı (aynı tuval, yalnız kapak). Elle ölçülenler (orijinal px):
 * - plaka: waffle plakasının iç elipsi (iç konturun içi; hamur buraya yayılır)
 * - kapakOnar: kapağın sağ konturunda Gemini'nin bulanık/kaymış parçası (y aralığı); dış kenar üstündeki ve altındaki
 *   temiz konturdan eğri uydurularak yeniden çizilir
 */
const MAKINE = { plaka: { x0: 278, x1: 2098, y0: 182, y1: 1250 }, kapakOnar: { y0: 915, y1: 1215, kalinlik: 22 } };

const secili = process.argv.slice(2);
// makine ve kapağı birlikte işlenir (ortak tuval)
if (secili.some((a) => /^kulah-makinesi/.test(a))) secili.push('kulah-makinesi', 'kulah-makinesi-kapak');
// ad → en yüksek sürümün dosyası ("ic-arka-v2" > "ic-arka")
const kaynak = new Map();
for (const f of fs.readdirSync(G).filter((f) => f.endsWith('.png')).map((f) => f.replace(/\.png$/, ''))) {
  const m = /-v(\d+)$/.exec(f), ad = m ? f.slice(0, m.index) : f, n = m ? +m[1] : 1, e = kaynak.get(ad);
  if (!e || n > e.n) kaynak.set(ad, { f, n });
}
const tum = [...kaynak.keys()].filter((a) => !ATLA.includes(a) && (!secili.length || secili.includes(a)));
/** yeniden çizilenler (v2+): mevcut dosyayı ezer */
const YENI_CIZIM = new Set(tum.filter((a) => kaynak.get(a).n > 1));
// sürümsüz adlarla geçici girdi klasörü (gemini-esya dosya adını çıktı adı yapar)
const GI = path.join(os.tmpdir(), 'kino-otobus-girdi');
fs.rmSync(GI, { recursive: true, force: true });
fs.mkdirSync(GI, { recursive: true });
for (const a of tum) fs.copyFileSync(path.join(G, kaynak.get(a).f + '.png'), path.join(GI, a + '.png'));
if (YENI_CIZIM.size) console.log('yeniden çizim (ezer):', [...YENI_CIZIM].map((a) => kaynak.get(a).f).join(', '));
const kesilecek = tum.filter((a) => !ARKA.includes(a));

const webp = (img) => img.webp({ quality: 94, alphaQuality: 100, effort: 5 }).toBuffer();
async function yaz(ad, buf) {
  const m = await s(buf).metadata();
  const yol = path.join(O, ad + '.webp');
  const yazildi = YENI_CIZIM.has(ad) ? (fs.writeFileSync(yol, buf), true) : await guvenliYaz(yol, buf);
  if (yazildi) console.log(`${ad}: ${m.width}x${m.height}, ${Math.round(buf.length / 1024)} KB`);
}
/** uzun kenar en çok n px */
const kucult = (img, m, n) => (Math.max(m.width, m.height) > n ? img.resize(m.width >= m.height ? n : null, m.width >= m.height ? null : n, { kernel: 'lanczos3' }) : img);
/** alfa: satır satır [sol, sağ] (boş satır null) */
async function satirlar(buf) {
  const { data, info } = await s(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const r = [];
  for (let y = 0; y < info.height; y++) {
    let a = -1, b = -1;
    for (let x = 0; x < info.width; x++) if (data[(y * info.width + x) * 4 + 3] > 128) { if (a < 0) a = x; b = x; }
    r.push(a < 0 ? null : [a, b]);
  }
  return { r, W: info.width, H: info.height };
}
const enGenis = (r, y0, y1) => Math.max(...r.slice(y0, y1).map((x) => (x ? x[1] - x[0] : 0)));
const ilkSatir = (r) => r.findIndex((x) => x);

/** ic-arka v2 → şeffaf pencereli çerçeve + 9 dilim ölçüleri (çıktı px) */
async function icCerceve() {
  const { data, info } = await s(path.join(GI, 'ic-arka.png')).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, n = W * H;
  const GRI = [203, 203, 203];
  const griMi = (i) => { const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2]; return Math.abs(r - g) < 10 && Math.abs(g - b) < 10 && r > 180 && r < 222; };
  // gri bölge: ortadan akıtılır
  const R = new Uint8Array(n), q = new Int32Array(n); let bas = 0, son = 0;
  const t0 = (H >> 1) * W + (W >> 1); R[t0] = 1; q[son++] = t0;
  while (bas < son) { const p = q[bas++], x = p % W; for (const d of [-1, 1, -W, W]) { const r = p + d; if (r < 0 || r >= n || R[r]) continue; if ((d === -1 && x === 0) || (d === 1 && x === W - 1)) continue; if (!griMi(r)) continue; R[r] = 1; q[son++] = r; } }
  // gri kutu (orta satır / orta sütun)
  const yo = H >> 1, xo = W >> 1;
  let gx0 = 0; while (!R[yo * W + gx0]) gx0++;
  let gx1 = W - 1; while (!R[yo * W + gx1]) gx1--;
  let gy1 = H - 1; while (!R[gy1 * W + xo]) gy1--;
  // fırfırın en alt ucu: sütun sütun ilk gri satırın en büyüğü (köşelerden uzakta)
  let fir = 0;
  for (let x = gx0 + Math.round((gx1 - gx0) * 0.05); x < gx1 - (gx1 - gx0) * 0.05; x++) { let y = 0; while (y < H && !R[y * W + x]) y++; fir = Math.max(fir, y); }
  // çerçevenin dış kenarı: orta satırda griden dışa doğru ilk fayans (açık, sıcak) piksel
  const fayans = (i) => { const r = data[i * 3], b = data[i * 3 + 2]; return r > 215 && r - b > 40; };
  let cx0 = gx0; while (cx0 > 0 && !fayans(yo * W + cx0 - 1)) cx0--;
  let cx1 = gx1; while (cx1 < W - 1 && !fayans(yo * W + cx1 + 1)) cx1++;
  // pervazın alt konturu: griden aşağı, pervazdan sonraki ilk mavi satırdan önce
  const mavi = (i) => data[i * 3 + 2] > data[i * 3] + 40;
  let cy1 = gy1 + 1; while (cy1 < H && !mavi(cy1 * W + xo)) cy1++;
  // alfa: gri bölge 0; çevresindeki 3 px halka griden ayrıştırılır (c = a·F + (1-a)·G; F: 4 px içindeki griden en uzak renk)
  const out = Buffer.alloc(n * 4);
  const uzak = (i) => { const r = data[i * 3] - GRI[0], g = data[i * 3 + 1] - GRI[1], b = data[i * 3 + 2] - GRI[2]; return Math.sqrt(r * r + g * g + b * b); };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, p = i * 4;
    if (R[i]) { out[p + 3] = 0; continue; }
    let yakin = false;
    for (let dy = -3; dy <= 3 && !yakin; dy++) for (let dx = -3; dx <= 3; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < H && R[yy * W + xx]) { yakin = true; break; } }
    if (!yakin) { out[p] = data[i * 3]; out[p + 1] = data[i * 3 + 1]; out[p + 2] = data[i * 3 + 2]; out[p + 3] = 255; continue; }
    let F = null, fd = -1;
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; const j = yy * W + xx; if (R[j]) continue; const d = uzak(j); if (d > fd) { fd = d; F = j; } }
    const c = [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]], f = [data[F * 3], data[F * 3 + 1], data[F * 3 + 2]];
    // c - G = a (F - G) → a, F yönüne izdüşüm
    let num = 0, den = 0; for (let k = 0; k < 3; k++) { num += (c[k] - GRI[k]) * (f[k] - GRI[k]); den += (f[k] - GRI[k]) ** 2; }
    const a = den > 0 ? Math.max(0, Math.min(1, num / den)) : 1;
    out[p] = f[0]; out[p + 1] = f[1]; out[p + 2] = f[2]; out[p + 3] = Math.round(a * 255);
  }
  const kw = cx1 - cx0 + 1, kh = cy1;
  const kirp = await s(out, { raw: { width: W, height: H, channels: 4 } }).extract({ left: cx0, top: 0, width: kw, height: kh }).png().toBuffer();
  const olc = Math.min(1, EN['ic-arka'] / kw), ow = Math.round(kw * olc), oh = Math.round(kh * olc);
  await yaz('ic-arka', await webp(s(kirp).resize(ow, oh, { kernel: 'lanczos3' })));
  const r = (v) => Math.round(v * olc);
  // 9 dilim: sol/sağ = çerçevenin kalınlığı (dış kenardan griye), üst = fırfırın altı, alt = grinin altından pervazın altına
  // camın tepesi (fırfırların arasındaki en üst gri satır): çerçevenin üst kalınlığı
  let gy0 = H;
  for (let x = gx0 + 20; x < gx1 - 20; x++) { let y = 0; while (y < H && !R[y * W + x]) y++; gy0 = Math.min(gy0, y); }
  console.log('IC_ARKA_CERCEVE =', JSON.stringify({ en: ow, boy: oh, sol: r(gx0 - cx0), sag: r(cx1 - gx1), ust: r(fir + 2), cam: r(gy0), alt: r(kh - gy1 - 1) }));
}

/** RGBA ham görüntü */
async function ham(buf) {
  const { data, info } = await s(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { d: data, W: info.width, H: info.height };
}
const hamPng = (r) => s(r.d, { raw: { width: r.W, height: r.H, channels: 4 } }).png().toBuffer();
/** satır satır [sol, sağ] (alfa > 128; boş satır null) */
function hamSatir(r) {
  const out = [];
  for (let y = 0; y < r.H; y++) {
    let a = -1, b = -1;
    for (let x = 0; x < r.W; x++) if (r.d[(y * r.W + x) * 4 + 3] > 128) { if (a < 0) a = x; b = x; }
    out.push(a < 0 ? null : [a, b]);
  }
  return out;
}

/** Kapağın sağ konturundaki bulanık parçayı yeniden çizer: dış kenar, üstteki ve alttaki temiz satırlara uydurulan
 * ikinci derece eğri; kenardan içe `kalinlik` px kontur rengi, içi aynı satırın temiz mavisi. */
function kapakOnar(r, { y0, y1, kalinlik: T }) {
  const sat = hamSatir(r);
  const ornek = [];
  for (let y = y0 - 160; y <= y1 + 160; y++) if ((y < y0 || y > y1) && sat[y]) ornek.push([y, sat[y][1] + 0.5]);
  // en küçük kareler: x = a + b·t + c·t² (t = (y - y0) / 100)
  const M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], V = [0, 0, 0];
  for (const [y, x] of ornek) { const t = (y - y0) / 100, p = [1, t, t * t]; for (let i = 0; i < 3; i++) { V[i] += p[i] * x; for (let j = 0; j < 3; j++) M[i][j] += p[i] * p[j]; } }
  for (let i = 0; i < 3; i++) for (let k = i + 1; k < 3; k++) { const f = M[k][i] / M[i][i]; for (let j = 0; j < 3; j++) M[k][j] -= f * M[i][j]; V[k] -= f * V[i]; }
  const c = [0, 0, 0];
  for (let i = 2; i >= 0; i--) { let t = V[i]; for (let j = i + 1; j < 3; j++) t -= M[i][j] * c[j]; c[i] = t / M[i][i]; }
  const kenar = (y) => { const t = (y - y0) / 100; return c[0] + c[1] * t + c[2] * t * t; };
  // kontur rengi: temiz satırlarda kenarın içindeki koyu piksellerin ortalaması
  let kr = 0, kg = 0, kb = 0, kn = 0;
  for (const [y, x] of ornek) for (let dx = 4; dx < T - 4; dx++) { const p = (y * r.W + Math.round(x) - dx) * 4; kr += r.d[p]; kg += r.d[p + 1]; kb += r.d[p + 2]; kn++; }
  const K = [kr / kn, kg / kn, kb / kn];
  for (let y = y0; y <= y1; y++) {
    const xo = kenar(y), ic = Math.round(xo - T - 70);
    const p0 = (y * r.W + ic) * 4, mavi = [r.d[p0], r.d[p0 + 1], r.d[p0 + 2]];
    for (let x = ic; x < Math.min(r.W, Math.ceil(xo) + 40); x++) {
      const d = xo - x, p = (y * r.W + x) * 4;
      const al = Math.max(0, Math.min(1, d + 0.5));
      // kontur ile mavi arası 1.5 px yumuşak geçiş
      const m = Math.max(0, Math.min(1, (d - T) / 1.5));
      for (let k = 0; k < 3; k++) r.d[p + k] = Math.round(K[k] * (1 - m) + mavi[k] * m);
      r.d[p + 3] = Math.round(al * 255);
    }
  }
}

/**
 * Makine + kapak → ortak tuval. Kapak gövdenin eninde ölçeklenir (gövde eni / kapak eni; kulp hariç), gövdenin
 * ortasına ve alt ucu plakanın ön kenarına (gövdenin mavisinin başladığı satır) oturtulur. İki çıktı aynı tuvalde:
 * kapalıyken kapak görseli dönüşümsüz tam oturur. Ölçüler varliklar.ts → KULAH_MAKINESI için yazdırılır.
 */
async function makineKapak(kes) {
  const m = await ham(kes('kulah-makinesi'));
  const k0 = await ham(kes('kulah-makinesi-kapak'));
  kapakOnar(k0, MAKINE.kapakOnar);
  const ms = hamSatir(m), ks = hamSatir(k0);
  const dolu = (sat) => sat.map((x, y) => (x ? y : -1)).filter((y) => y >= 0);
  const my = dolu(ms), ky = dolu(ks);
  const mY0 = my[0], mY1 = my.at(-1), kY0 = ky[0], kY1 = ky.at(-1);
  // gövdenin ortası: alt çeyrekte (kulp yok) satır ortalarının ortalaması; eni: sol kenardan ortaya × 2
  const ort = (sat, a, b) => { let t = 0, n = 0; for (let y = a; y <= b; y++) if (sat[y]) { t += (sat[y][0] + sat[y][1]) / 2; n++; } return t / n; };
  const mOrta = ort(ms, Math.round(mY1 - (mY1 - mY0) * 0.25), mY1);
  const mSol = Math.min(...my.map((y) => ms[y][0]));
  const govdeEn = 2 * (mOrta - mSol);
  const kOrta = ort(ks, Math.round(kY1 - (kY1 - kY0) * 0.4), kY1);
  let kEn = 0, kGenisY = kY0;
  for (const y of ky) if (ks[y][1] - ks[y][0] > kEn) { kEn = ks[y][1] - ks[y][0]; kGenisY = y; }
  const olc = govdeEn / kEn;
  // plakanın ön kenarı: gövdenin ortasındaki sütunda, aşağı inerken mavinin başladığı satır
  const sx = Math.round(mOrta);
  let mavi = Math.round((mY0 + mY1) / 2);
  for (; mavi < mY1; mavi++) { const p = (mavi * m.W + sx) * 4; if (m.d[p + 3] > 200 && m.d[p + 2] > m.d[p] + 50) break; }
  // mavinin üstündeki parlak şerit atlanır: plakanın ön konturunun son koyu satırına kadar geri
  while (mavi > mY0) { const p = ((mavi - 1) * m.W + sx) * 4; if (Math.max(m.d[p], m.d[p + 1], m.d[p + 2]) < 110) break; mavi--; }
  const kw = Math.round(k0.W * olc), kh = Math.round(k0.H * olc);
  const kapakK = await s(await hamPng(k0)).resize(kw, kh, { kernel: 'lanczos3' }).png().toBuffer();
  const kSol = Math.round(mOrta - kOrta * olc), kUst = Math.round(mavi - 1 - kY1 * olc);
  // ortak tuval: iki kutunun birleşimi (+6 px pay)
  const PAY = 6;
  const kx0 = kSol + Math.min(...ky.map((y) => ks[y][0])) * olc, kx1 = kSol + Math.max(...ky.map((y) => ks[y][1])) * olc;
  const X0 = Math.floor(Math.min(mSol, kx0)) - PAY, X1 = Math.ceil(Math.max(...my.map((y) => ms[y][1]), kx1)) + PAY;
  const Y0 = Math.floor(Math.min(mY0, kUst + kY0 * olc)) - PAY, Y1 = mY1 + PAY;
  const TW = X1 - X0 + 1, TH = Y1 - Y0 + 1;
  // geniş bir tuvale (B px pay) konup ortak kutu kesilir (görseller tuvalden taşabilir)
  const B = 800;
  const tuvalde = async (input, left, top) =>
    s(await s({ create: { width: m.W + 2 * B, height: m.H + 2 * B, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([{ input, left: left + B, top: top + B }]).png().toBuffer())
      .extract({ left: X0 + B, top: Y0 + B, width: TW, height: TH }).png().toBuffer();
  const makineT = await tuvalde(await hamPng(m), 0, 0);
  const kapakT = await tuvalde(kapakK, kSol, kUst);
  const son = Math.min(1, EN['kulah-makinesi'] / Math.max(TW, TH)), OW = Math.round(TW * son), OH = Math.round(TH * son);
  await yaz('kulah-makinesi', await webp(s(makineT).resize(OW, OH, { kernel: 'lanczos3' })));
  await yaz('kulah-makinesi-kapak', await webp(s(kapakT).resize(OW, OH, { kernel: 'lanczos3' })));
  // ölçüler (tuvalin oranı)
  const fx = (x) => +((x - X0) / TW).toFixed(4), fy = (y) => +((y - Y0) / TH).toFixed(4);
  const P = MAKINE.plaka;
  const genisY = kUst + kGenisY * olc;
  console.log(`kapak ölçeği ${olc.toFixed(3)} (gövde ${govdeEn.toFixed(0)} px, kapak ${kEn} px), kapağın altı y=${mavi - 1}`);
  console.log('KULAH_MAKINESI =', JSON.stringify({
    oran: +(TW / TH).toFixed(4),
    plaka: { x: fx(P.x0), y: fy(P.y0), en: +((P.x1 - P.x0) / TW).toFixed(4), boy: +((P.y1 - P.y0) / TH).toFixed(4) },
    // menteşe: kapağın en geniş satırında sağ kenarı (kapak buradan döner)
    mentese: { x: fx(kSol + ks[kGenisY][1] * olc), y: fy(genisY) },
    // kapalıyken makine görselinde kapağın en geniş satırından yukarısı yalnız kapağın içinde görünür (plakanın arka kenarı taşmasın)
    kapakAlt: fy(genisY),
    // gövdenin kulbu (maskede açıkta kalan köşe: x'in sağı, y'nin altı). Kulplu satır: sağ kenar, sol kenarın
    // simetriğini 40 px'ten çok geçer; x: kapağın sağ kenarının biraz içi (kulbun kapağa değdiği yer kapağın altında)
    kulp: { x: fx(kSol + ks[kGenisY][1] * olc - 60), y: fy(my.find((y) => ms[y][1] - (2 * mOrta - ms[y][0]) > 40) - 8) },
  }));
}

(async () => {
  fs.mkdirSync(O, { recursive: true });
  // 1) şeffaf kesim (tam çözünürlük, ara klasöre)
  if (kesilecek.length) {
    fs.rmSync(ARA, { recursive: true, force: true });
    execFileSync('node', [path.join(__dirname, 'gemini-esya.cjs'), '--girdi', GI, '--cikti', ARA, '--max', '0', '--ayar', JSON.stringify(AYAR), ...kesilecek], { stdio: 'inherit' });
  }
  const kes = (ad) => fs.readFileSync(path.join(ARA, ad + '.webp'));
  const var_ = (ad) => kesilecek.includes(ad);

  // 2a) iç duvar v2 (gri maske): pencere ÇERÇEVESİ katmanı olur. Gri alan şeffaf (kenarı griden ayrıştırılır, hale yok),
  // çerçevenin dışındaki fayans duvar ve pervazın altı kırpılır; 9 dilim ölçüleri yazdırılır (varliklar.ts → IC_ARKA_CERCEVE)
  if (tum.includes('ic-arka') && kaynak.get('ic-arka').n > 1) {
    await icCerceve();
  }
  // 2) arka planlar (zemin kalır)
  for (const ad of tum.filter((a) => ARKA.includes(a) && !(a === 'ic-arka' && kaynak.get(a).n > 1))) {
    let img = s(path.join(GI, ad + '.png')).removeAlpha(), m = await img.metadata();
    const k = kaynak.get(ad).n > 1 ? null : KIRP[ad];
    if (k) {
      const kutu = { left: Math.round(k.sol * m.width), top: Math.round(k.ust * m.height), width: Math.round(k.en * m.width), height: Math.round(k.boy * m.height) };
      img = s(await img.extract(kutu).png().toBuffer());
      m = { width: kutu.width, height: kutu.height };
    }
    await yaz(ad, await kucult(img, m, EN[ad]).webp({ quality: 90, effort: 5 }).toBuffer());
  }

  // 3) otobüs: tuval korunur, tam 16:9'a tamamlanır (üst/alt eşit boşluk)
  if (var_('otobus')) {
    const b = kes('otobus'), m = await s(b).metadata(), H = Math.round((m.width * 9) / 16), ek = Math.max(0, H - m.height);
    const tuval = await s(b).extend({ top: ek >> 1, bottom: ek - (ek >> 1), left: 0, right: 0, background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    await yaz('otobus', await webp(s(tuval).resize(EN.otobus, Math.round((EN.otobus * 9) / 16), { kernel: 'lanczos3' })));
  }

  // 4) toplar: ortak tuval, tabandan hizalı
  const toplar = kesilecek.filter((a) => /^top-/.test(a));
  let topTuval = null;
  const ortak = async (adlar, adSon) => {
    const parcalar = await Promise.all(adlar.map(async (ad) => ({ ad, b: kes(ad), m: await s(kes(ad)).metadata() })));
    const TW = Math.max(...parcalar.map((p) => p.m.width)), TH = Math.max(...parcalar.map((p) => p.m.height));
    const olc = Math.min(1, VARSAYILAN_EN / Math.max(TW, TH));
    for (const p of parcalar) {
      const t = await s({ create: { width: TW, height: TH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
        .composite([{ input: p.b, left: Math.round((TW - p.m.width) / 2), top: TH - p.m.height }]).png().toBuffer();
      if (adSon) adSon(p.ad, t);
      await yaz(p.ad, await webp(s(t).resize(Math.round(TW * olc), Math.round(TH * olc), { kernel: 'lanczos3' })));
    }
    return { TW, TH, olc };
  };
  if (toplar.length) {
    let ornek = null;
    const t = await ortak(toplar, (ad, buf) => { if (!ornek) ornek = buf; });
    topTuval = { ...t, ornek };
  } else if (fs.existsSync(path.join(O, 'top-cilek.webp'))) {
    const b = fs.readFileSync(path.join(O, 'top-cilek.webp')), m = await s(b).metadata();
    topTuval = { TW: m.width, TH: m.height, olc: 1, ornek: b };
  }

  // 5) topun üstüne oturanlar: sos-*-ust, serpinti-ust → topun tuvali; eni topun kubbesinin 1.08 katı, tepesi topun tepesinden biraz yukarı
  const ustler = kesilecek.filter((a) => /^sos-.*-ust$|^serpinti-ust$/.test(a));
  if (ustler.length && topTuval) {
    const top = await satirlar(topTuval.ornek), kubbeEn = enGenis(top.r, 0, Math.round(top.H * 0.58)), topTepe = ilkSatir(top.r);
    for (const ad of ustler) {
      const b = kes(ad), u = await satirlar(b), ust = Math.max(0, topTepe - Math.round(top.H * 0.012));
      // akıntılar topun tabanını geçmesin: tuvale sığacak kadar
      // tuvalden taşmasın (topun kubbesi tuvalin enine yakınsa 1.08 katı sığmaz)
      const k = Math.min((kubbeEn * 1.08) / enGenis(u.r, 0, u.H), (top.H - ust) / u.H, top.W / u.W);
      const w = Math.round(u.W * k), hh = Math.round(u.H * k);
      const kucuk = await s(b).resize(w, hh, { kernel: 'lanczos3' }).png().toBuffer();
      const t = await s({ create: { width: top.W, height: top.H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
        .composite([{ input: kucuk, left: Math.round((top.W - w) / 2), top: Math.min(ust, top.H - hh) }]).png().toBuffer();
      const olc = Math.min(1, VARSAYILAN_EN / Math.max(top.W, top.H));
      await yaz(ad, await webp(s(t).resize(Math.round(top.W * olc), Math.round(top.H * olc), { kernel: 'lanczos3' })));
    }
  } else if (ustler.length) console.log('UYARI: top görseli yok; sos/serpinti üstleri topa oturtulamadı:', ustler.join(', '));

  // 6) tat kapları: ortak tuval
  const kaplar = kesilecek.filter((a) => /^kap-/.test(a));
  if (kaplar.length) await ortak(kaplar);

  // 7) külah makinesi ve kapağı: ortak tuval, kapak gövdeye oturur
  const makine = var_('kulah-makinesi') && var_('kulah-makinesi-kapak');
  if (makine) await makineKapak(kes);

  // 8) geri kalan tekler: kırpılmış hâli
  const yapilan = new Set(['otobus', ...toplar, ...ustler, ...kaplar, ...(makine ? ['kulah-makinesi', 'kulah-makinesi-kapak'] : [])]);
  for (const ad of kesilecek.filter((a) => !yapilan.has(a))) {
    const b = kes(ad), m = await s(b).metadata();
    await yaz(ad, await webp(kucult(s(b), m, EN[ad] ?? VARSAYILAN_EN)));
  }
})();
