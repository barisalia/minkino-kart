#!/usr/bin/env node
/**
 * Seri 2 eşyaları (Gemini, beyaz zemin) → assets/film-seri2/esya/*.webp (+ kum-saati.json).
 *
 * Kaynak: ekip/gemini/yeni/seri2-esya/*.png ve seri2-mekan/{yastik,saksi}.png (PNG'ler repoya girmez).
 * 1) Kesme: gemini-esya.cjs (zemin KENARDAN akar; kontur içindeki beyaz / açık renk kalır: macun tüpü, havlu).
 *    macun-tupu.png iki çıktı verir: macun-tupu (gövde + çıkan macun; kapak minOran ile atılır) ve macun-kapak.
 *    macun-kulesi: yalnız kule (fırçanın başı ve sapı kesilir); alt kenar fırçanın kıllarının arkasında kalır.
 *    tabure, kum-saati, saksi: kapalı beyaz boşluklar (bacak arası, direk ile cam arası, saplar arası) delik.
 * 2) Kum saati katmanları (kum-saati.webp ile aynı boy, üst üste tam çakışır):
 *    kum-saati-bos.webp     cam boş: üst haznedeki kum ve kumun konturu camın rengiyle doldurulur
 *    kum-saati-ust-kum.webp yalnız üst haznedeki kum (konturuyla); kodla yukarıdan kırpılır (kum seviyesi iner)
 *    kum-saati-alt-kum.webp alt haznenin kum biçimi (camdan boşluk + kontur, üstteki kumla aynı dil); kodla tepecik
 *                           biçiminde kırpılır (kum birikir)
 *    kum-saati.json         satır satır kum genişlikleri, boyun noktası, renkler (film/src/oyunlu/esya.ts okur)
 *
 * Kullanım: node ekip/illustrator/seri2-esya-isle.cjs [kaynak-klasoru] [--yalniz-kum]   (varsayılan: ekip/gemini/yeni;
 *   --yalniz-kum: kesmeyi atlar, yalnız kum saati katmanlarını mevcut kum-saati.webp'ten yeniden üretir)
 * guvenli-yaz kuralı: mevcut daha büyük dosya ezilmez (ZORLA=1 ile yazılır).
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const KOK = path.resolve(__dirname, '../..');
const sharp = require(require.resolve('sharp', { paths: [process.cwd(), KOK] }));
const yaz = require('./guvenli-yaz.cjs');

const KAYNAK = process.argv.slice(2).find((a) => !a.startsWith('--')) ?? path.join(KOK, 'ekip/gemini/yeni');
const CIKTI = path.join(KOK, 'assets/film-seri2/esya');

const ESYA = ['dis-fircasi-kino', 'dis-fircasi-lokum', 'havlu-kino', 'kum-saati', 'macun-kulesi', 'macun-tupu', 'tabure'];
const MEKAN_ESYA = ['yastik', 'saksi'];
/** gemini-esya.cjs dosya ayarları (kaynak pikseli) */
const AYAR = {
  'macun-tupu': { minOran: 0.2 },
  'macun-kapak': { kes: [460, 870, 710, 1125] },
  tabure: { delik: true, delikNokta: [[470, 250]] },
  'kum-saati': { delik: true, delikNokta: [[200, 640], [440, 640]] },
  'macun-kulesi': { kes: [700, 60, 1290, 868], tohum: [[2, 2]] },
  saksi: { delik: true, delikMin: 40 },
};

function kes() {
  const gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'seri2-esya-'));
  for (const ad of ESYA) fs.copyFileSync(path.join(KAYNAK, 'seri2-esya', `${ad}.png`), path.join(gecici, `${ad}.png`));
  for (const ad of MEKAN_ESYA) fs.copyFileSync(path.join(KAYNAK, 'seri2-mekan', `${ad}.png`), path.join(gecici, `${ad}.png`));
  fs.copyFileSync(path.join(KAYNAK, 'seri2-esya', 'macun-tupu.png'), path.join(gecici, 'macun-kapak.png'));
  execFileSync(process.execPath, [path.join(__dirname, 'gemini-esya.cjs'), '--girdi', gecici, '--cikti', CIKTI, '--ayar', JSON.stringify(AYAR)], { stdio: 'inherit', cwd: KOK });
  fs.rmSync(gecici, { recursive: true, force: true });
}

// ---------------------------------------------------------------- kum saati katmanları
const sari = (r, g, b) => r > 225 && g > 185 && b < 170 && r - b > 90;
const parlak = (r, g, b) => 0.3 * r + 0.59 * g + 0.11 * b;
const hex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

/** kare (Chebyshev) değil daire yarıçaplı genişletme */
function genislet(m, W, H, R) {
  const o = new Uint8Array(W * H);
  const ofs = [];
  for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) if (dx * dx + dy * dy <= R * R) ofs.push([dx, dy]);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (!m[y * W + x]) continue;
      for (const [dx, dy] of ofs) {
        const xx = x + dx, yy = y + dy;
        if (xx >= 0 && yy >= 0 && xx < W && yy < H) o[yy * W + xx] = 1;
      }
    }
  return o;
}
/** maskenin dışına uzaklık (3-4 pahlı yaklaşık öklid, piksel) */
function uzaklik(m, W, H) {
  const d = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) d[i] = m[i] ? 1e9 : 0;
  const a = 1, b = Math.SQRT2;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (!d[i]) continue;
      let v = d[i];
      if (x > 0) v = Math.min(v, d[i - 1] + a);
      if (y > 0) v = Math.min(v, d[i - W] + a);
      if (x > 0 && y > 0) v = Math.min(v, d[i - W - 1] + b);
      if (x < W - 1 && y > 0) v = Math.min(v, d[i - W + 1] + b);
      if (x === 0 || y === 0 || x === W - 1) v = Math.min(v, 1);
      d[i] = v;
    }
  for (let y = H - 1; y >= 0; y--)
    for (let x = W - 1; x >= 0; x--) {
      const i = y * W + x;
      if (!d[i]) continue;
      let v = d[i];
      if (x < W - 1) v = Math.min(v, d[i + 1] + a);
      if (y < H - 1) v = Math.min(v, d[i + W] + a);
      if (x < W - 1 && y < H - 1) v = Math.min(v, d[i + W + 1] + b);
      if (x > 0 && y < H - 1) v = Math.min(v, d[i + W - 1] + b);
      if (y === H - 1) v = Math.min(v, 1);
      d[i] = v;
    }
  return d;
}

async function kumSaati() {
  const kaynak = path.join(CIKTI, 'kum-saati.webp');
  const { data, info } = await sharp(kaynak).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, n = W * H;
  const px = (i) => [data[i * 4], data[i * 4 + 1], data[i * 4 + 2], data[i * 4 + 3]];
  // üst haznedeki kum: sarı pikseller (boyun hizasının üstünde)
  const kum = new Uint8Array(n);
  let enAlt = 0, sr = 0, sg = 0, sb = 0, sn = 0;
  for (let i = 0; i < n; i++) {
    const [r, g, b, a] = px(i);
    if (a > 200 && sari(r, g, b) && i / W < H * 0.62) {
      kum[i] = 1;
      enAlt = Math.max(enAlt, (i / W) | 0);
      sr += r; sg += g; sb += b; sn++;
    }
  }
  if (!sn) throw new Error('kum-saati: sarı kum bulunamadı');
  const KUM = [sr / sn, sg / sn, sb / sn];
  // boyun: kumun en alt satırı (sivri uç), x = o satırın ortası
  let bx = 0, bc = 0;
  for (let x = 0; x < W; x++) if (kum[enAlt * W + x]) { bx += x; bc++; }
  const boyun = [bx / bc, enAlt];
  // kontur rengi ve kalınlığı (kumun kendi konturu: sarıdan dışarı doğru koyu pikseller)
  let kr = 0, kg = 0, kb = 0, kn = 0;
  for (let i = 0; i < n; i++) {
    const [r, g, b, a] = px(i);
    if (a > 250 && Math.max(r, g, b) < 110) { kr += r; kg += g; kb += b; kn++; }
  }
  const KONTUR = [kr / kn, kg / kn, kb / kn];
  // yatay bir satırda kumun konturunun kalınlığı: kumun en geniş satırında sarının sağındaki koyu dizi
  const D = Math.round(W * 0.024); // kum konturunu da içine alan genişleme (cam konturuna değmez)
  const bolge = genislet(kum, W, H, D);
  // sivri ucun konturu sarının birkaç px altına iner: uçtan aşağı dar bir şerit (boynun camına değmez)
  {
    const uc = new Uint8Array(n);
    for (let y = enAlt; y < enAlt + Math.round(W * 0.066); y++) uc[y * W + Math.round(boyun[0])] = 1;
    const ucB = genislet(uc, W, H, Math.round(W * 0.022));
    for (let i = 0; i < n; i++) if (ucB[i]) bolge[i] = 1;
  }
  // ---- boş cam: bölgedeki kum ve kum konturu, komşu cam pikselleriyle içten dışa doldurulur
  const bos = Buffer.from(data);
  const cam = (i) => {
    const [r, g, b, a] = px(i);
    return a > 250 && !sari(r, g, b) && Math.min(r, g, b) > 150 && b >= r;
  };
  // saf cam mavisi kaynak; kontur karışmış kenar pikselleri kaynak değil (bölgedeyse onlar da doldurulur)
  const saf = (i) => cam(i) && data[i * 4 + 2] - data[i * 4] > 40 && data[i * 4 + 2] > 228 && Math.min(data[i * 4], data[i * 4 + 1]) > 170;
  // bölgenin kenarındaki kontur-cam karışımı açık pikseller de bölgeye (ince hale kalmasın)
  for (let tur = 0; tur < 3; tur++) {
    const ek = [];
    for (let i = W; i < n - W; i++) {
      if (bolge[i] || saf(i) || data[i * 4 + 3] < 250 || parlak(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]) < 140) continue;
      if (bolge[i - 1] || bolge[i + 1] || bolge[i - W] || bolge[i + W]) ek.push(i);
    }
    for (const i of ek) bolge[i] = 1;
  }
  // her satırda bölgenin solundaki ve sağındaki en yakın saf cam pikseli arasında doğrusal geçiş (cam düz renk)
  let kalan = 0;
  let onceki = null;
  for (let y = 0; y < H; y++) {
    const xs = [];
    for (let x = 0; x < W; x++) if (bolge[y * W + x] && !saf(y * W + x)) xs.push(x);
    if (!xs.length) continue;
    const bul = (x0, adim) => {
      for (let x = x0, k = 0; x >= 0 && x < W && k < 40; x += adim, k++) if (saf(y * W + x)) return [x, [...data.slice((y * W + x) * 4, (y * W + x) * 4 + 3)]];
      return null;
    };
    const sol = bul(xs[0] - 1, -1), sag = bul(xs[xs.length - 1] + 1, 1);
    const renk = (x) => {
      if (sol && sag) {
        const t = (x - sol[0]) / Math.max(1, sag[0] - sol[0]);
        return [0, 1, 2].map((k) => sol[1][k] * (1 - t) + sag[1][k] * t);
      }
      const tek = sol ?? sag;
      return tek ? tek[1] : onceki;
    };
    for (const x of xs) {
      const c = renk(x);
      if (!c) { kalan++; continue; }
      const i = (y * W + x) * 4;
      bos[i] = c[0]; bos[i + 1] = c[1]; bos[i + 2] = c[2]; bos[i + 3] = 255;
    }
    onceki = renk(xs[xs.length >> 1]) ?? onceki;
  }
  if (kalan) console.log('UYARI kum-saati-bos: doldurulamayan', kalan, 'px');
  // satır satır doldurmanın çizgilerini sil: doldurulan pikseller dikeyde yumuşatılır
  {
    const dolu = (i) => bolge[i] && !saf(i);
    const kopya = Buffer.from(bos);
    const R = 10;
    for (let i = 0; i < n; i++) {
      if (!dolu(i)) continue;
      const x = i % W, y = (i / W) | 0;
      let r = 0, g = 0, b = 0, c = 0;
      for (let dy = -R; dy <= R; dy++)
        for (let dx = -2; dx <= 2; dx++) {
          const xx = x + dx, yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
          const j = yy * W + xx;
          if (!dolu(j)) continue;
          r += kopya[j * 4]; g += kopya[j * 4 + 1]; b += kopya[j * 4 + 2]; c++;
        }
      bos[i * 4] = r / c; bos[i * 4 + 1] = g / c; bos[i * 4 + 2] = b / c;
    }
  }
  // ---- üst kum katmanı: bölgedeki özgün pikseller
  const ust = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) if (bolge[i]) for (let k = 0; k < 4; k++) ust[i * 4 + k] = data[i * 4 + k];
  // üst kum satırları: kumun kontur ortasına kadar (sarı + 3 px)
  const kumK = genislet(kum, W, H, 3);
  const satir = (m, y0, y1) => {
    const s = [];
    for (let y = y0; y <= y1; y++) {
      let a = -1, b = -1;
      for (let x = 0; x < W; x++) if (m[y * W + x]) { if (a < 0) a = x; b = x; }
      s.push(a < 0 ? [0, 0] : [a, b]);
    }
    return s;
  };
  let ustY0 = H;
  for (let i = 0; i < n; i++) if (kumK[i]) { ustY0 = Math.min(ustY0, (i / W) | 0); }
  const ustSatir = satir(kumK, ustY0, enAlt);
  // kenar (yüzey elipsi): kumun üst bölümünde en geniş satır = elipsin ortası
  let kenarY = ustY0, gen = 0;
  for (let k = 0; k < ustSatir.length * 0.35; k++) {
    const w = ustSatir[k][1] - ustSatir[k][0];
    if (w > gen) { gen = w; kenarY = ustY0 + k; }
  }
  // ---- alt hazne: boyun altında, konturla çevrili açık bölge (camın içi)
  const ic = new Uint8Array(n);
  const seed = Math.round(H * 0.8) * W + Math.round(boyun[0]);
  const q = [seed];
  ic[seed] = 1;
  const acik = (i) => data[i * 4 + 3] > 200 && parlak(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]) > 120;
  while (q.length) {
    const p = q.pop();
    const x = p % W, y = (p / W) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || xx >= W || yy <= enAlt + 2 || yy >= H) continue;
      const j = yy * W + xx;
      if (ic[j] || !acik(j)) continue;
      ic[j] = 1;
      q.push(j);
    }
  }
  // camla kum arasındaki boşluk (üstteki kumla aynı): yatayda kumun konturu ile camın konturu arası
  const icD = uzaklik(ic, W, H);
  let bosluk = 0;
  {
    // kumun en geniş satırında (kenarın biraz altında) cam içi ile sarı arası
    const y = Math.round(kenarY + (enAlt - kenarY) * 0.2);
    let camSol = -1, kumSol = -1;
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (camSol < 0 && cam(i) && x > W * 0.15) camSol = x;
      if (kum[i]) { kumSol = x; break; }
    }
    bosluk = Math.max(4, kumSol - camSol);
  }
  const cizgi = Math.max(3, Math.round(W * 0.011));
  const G = Math.max(3, bosluk - cizgi);
  const alt = Buffer.alloc(n * 4);
  const camTaban = [];
  for (let i = 0; i < n; i++) if (ic[i] && cam(i)) camTaban.push(Math.min(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]));
  camTaban.sort((a, b) => a - b);
  const camMin = camTaban[camTaban.length >> 1] ?? 200;
  const altKum = new Uint8Array(n);
  let altY0 = H, altY1 = 0;
  for (let i = 0; i < n; i++) {
    if (!ic[i]) continue;
    const d = icD[i];
    if (d < G) continue;
    const y = (i / W) | 0;
    const dis = Math.min(1, Math.max(0, d - G + 0.5));
    const icK = Math.min(1, Math.max(0, d - G - cizgi + 0.5));
    const golge = 1 - 0.06 * ((y - enAlt) / (H - enAlt));
    let c = KUM.map((v, k) => (v * golge) * icK + KONTUR[k] * (1 - icK));
    let a = dis;
    // camın parlaması kumun üstünde de görünsün: özgün piksel camdan açıksa kum o kadar saydam
    const m = Math.min(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);
    if (icK > 0.5 && m > camMin + 8) a *= 1 - Math.min(0.85, (m - camMin) / Math.max(1, 255 - camMin));
    alt[i * 4] = c[0]; alt[i * 4 + 1] = c[1]; alt[i * 4 + 2] = c[2]; alt[i * 4 + 3] = Math.round(255 * a);
    if (d >= G + cizgi * 0.5) { altKum[i] = 1; altY0 = Math.min(altY0, y); altY1 = Math.max(altY1, y); }
  }
  const altSatir = satir(altKum, altY0, altY1);
  const alan = (s) => s.reduce((t, [a, b]) => t + (b > a ? b - a : 0), 0);
  const ustAlan = alan(ustSatir.slice(kenarY - ustY0));
  console.log(`kum-saati: ${W}x${H}, boyun ${boyun.map(Math.round)}, üst kum ${ustY0}..${enAlt} (kenar ${kenarY}), alt ${altY0}..${altY1}, boşluk ${G}+${cizgi}, alan üst ${ustAlan} / alt ${alan(altSatir)}`);
  const webp = (buf) => sharp(buf, { raw: { width: W, height: H, channels: 4 } }).webp({ quality: 94, alphaQuality: 100, effort: 5 }).toBuffer();
  for (const [ad, buf] of [['kum-saati-bos', bos], ['kum-saati-ust-kum', ust], ['kum-saati-alt-kum', alt]]) {
    if (await yaz(path.join(CIKTI, `${ad}.webp`), await webp(buf))) console.log('yazıldı', ad);
  }
  const json = {
    w: W,
    h: H,
    boyun: boyun.map((v) => Math.round(v)),
    kum: hex(KUM),
    kontur: hex(KONTUR),
    cizgi,
    ust: { y0: ustY0, kenar: kenarY, satir: ustSatir },
    alt: { y0: altY0, satir: altSatir },
  };
  fs.writeFileSync(path.join(CIKTI, 'kum-saati.json'), JSON.stringify(json) + '\n');
}

(async () => {
  fs.mkdirSync(CIKTI, { recursive: true });
  if (!process.argv.includes('--yalniz-kum')) kes();
  await kumSaati();
})();
