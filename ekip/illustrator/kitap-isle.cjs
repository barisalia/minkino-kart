// Kitap "Kino Okula Başlıyor": Antigravity çizimlerini kesip kitaba bağlar (Illustrator'suz).
// Dosya adları ve yöntem: ekip/antigravity/KITAP-DOSYA-ADLARI.md. Çıktı: assets/kitap/okul/*.webp + yerlesim.json.
//
//   node ekip/illustrator/kitap-isle.cjs [--girdi <klasör>] [kapak s01 s02 …]     (sayfa verilmezse hepsi; tekrar çalıştırmak güvenli)
//   node ekip/illustrator/kitap-isle.cjs --deneme                                 (yapay çizimlerle betiğin kendini sınaması)
//
// Ne yapar (her sayfa için, dosyası gelenler):
//  1) sNN-zemin.png → sNN-zemin.webp (kare, en çok 2048; netlik: kaynağın üstüne büyütülmez). Yalnız sNN.png geldiyse
//     sNN-tam.webp (canlanmayan tam resim; kitap onu gösterir).
//  2) sNN.png ile sNN-zemin.png farkı → hareketli katmanların yeri: fark bölgeleri, tablodaki yaklaşık yere (kitap/src/
//     okul-canli.ts ile aynı) en yakın katmana verilir; katmanın kutusu bölgelerinin birleşimi. Elle düzeltme:
//     <girdi>/yerlesim-el.json → { "s01": { "kino": [x, y, en, boy] }, "ugur": { "s01": [x, y] }, "kok": { "s01/kino/kuyruk": [x, y] } }
//  3) sNN-<katman>.png (hareket sayfası): pozlar beyaz aralıklardan bulunur (sıra: soldan sağa, üstten alta), zemini
//     şeffaf yapılır (gemini-esya.cjs), AYNI ölçek ve taban çizgisiyle ortak tuvale konur; poz 1'in boyu fark bölgesinin
//     boyuna oturur → katman kutusu. Poz sayısı listedekinden farklıysa kesilmez, nedeni yazılır.
//  4) sNN-<katman>-<parça>.png (kuyruk/kulak dizisi): kareler kökleri hizalı ortak tuvale (kuyruk: alt, kulak: üst);
//     katmanla aynı ölçek; kök noktası yerlesim-el.json → kok (yoksa tahmin: kuyruk kalçada, kulak başta).
//  5) ortak-ugur.png → ortak-ugur-1..4.webp.
//  6) Denetim görüntüsü: <tmp>/minkino-kitap/kontrol-<sayfa>.png (zemin + katman kutuları).
// Mevcut daha büyük dosya ezilmez (guvenli-yaz.cjs; ZORLA=1 ile yazılır).
const fs = require('fs'), os = require('os'), path = require('path'), { execFileSync } = require('child_process');
const s = require(require.resolve('sharp', { paths: [process.cwd(), path.resolve(__dirname, '../..')] }));
const guvenliYaz = require('./guvenli-yaz.cjs');

const KOK = path.resolve(__dirname, '../..');
const arg = (ad, v) => { const i = process.argv.indexOf('--' + ad); return i >= 0 ? process.argv[i + 1] : v; };
const DENEME = process.argv.includes('--deneme');
const ARA = path.join(os.tmpdir(), 'minkino-kitap');
let GIRDI = arg('girdi', process.env.KITAP_GIRDI || path.join(KOK, 'ekip/gemini/yeni/kitap-okul'));
let CIKTI = path.join(KOK, 'assets/kitap/okul');
const ESYA_KES = path.join(__dirname, 'gemini-esya.cjs');
/** Sayfa resminin kaynak boyu (kare): katman pozları bu çözünürlüğe göre ölçeklenir */
const SAYFA_PX = 2048;

// ---------------------------------------------------------------- tablo (kitap/src/okul-canli.ts ile aynı; tests/unit/kitap.test.ts denetler)
// yer: yaklaşık konum [x, y, en, boy] (sayfanın oranı). pozlar: hareket sayfasındaki poz sayısı. parcalar: ad → kare sayısı.
// parcaDosya: dizinin dosya adı kuraldan (sNN-<katman>-<parça>) farklıysa (grup katmanlarında listedeki ad).
// olcme: false → farkla ölçülmez (saçılan blok, pişi, hırka, düşen Kuzu: kod tanımdaki yeri kullanır). kaynak: başka sayfanın pozu.
const K = (id, yer, pozlar, ek = {}) => ({ id, yer, pozlar, ...ek });
const SAYFALAR = {
  kapak: [K('kino', [0.34, 0.3, 0.32, 0.62], 4, { parcalar: { kuyruk: 4 } })],
  s01: [K('kino', [0.16, 0.3, 0.3, 0.6], 6, { parcalar: { kuyruk: 4 } }), K('lokum', [0.6, 0.36, 0.26, 0.3], 4)],
  s02: [K('baba', [0.08, 0.28, 0.34, 0.4], 4), K('lokum', [0.56, 0.52, 0.24, 0.4], 6)],
  s03: [K('anne-kino', [0.12, 0.18, 0.46, 0.76], 4, { parcalar: { 'kuzu-kulak': 3 }, parcaDosya: { 'kuzu-kulak': 's03-kuzu-kulak' } }), K('mino', [0.62, 0.4, 0.22, 0.48], 4)],
  s04: [K('zipzip', [0.04, 0.22, 0.14, 0.24], 4), K('kino', [0.4, 0.4, 0.26, 0.52], 4, { parcalar: { kuyruk: 4 } }), K('anne', [0.46, 0.1, 0.3, 0.86], 1)],
  s05: [K('anne-kino', [0.12, 0.12, 0.72, 0.84], 5)],
  s06: [K('kino', [0.34, 0.38, 0.26, 0.54], 6, { parcalar: { kuyruk: 3 } }), K('canta', [0.66, 0.18, 0.14, 0.24], 4), K('kuzu', [0.67, 0.36, 0.1, 0.1], 2, { olcme: false })],
  s07: [K('kino-kuzu', [0.14, 0.2, 0.68, 0.74], 3, { parcalar: { kuyruk: 4 }, parcaDosya: { kuyruk: 's07-kino-kuyruk' } })],
  s08: [K('kino', [0.14, 0.28, 0.3, 0.62], 4), K('bulut', [0.62, 0.42, 0.26, 0.46], 4)],
  s09: [K('cocuklar', [0.6, 0.04, 0.36, 0.3], 2), K('kule', [0.4, 0.04, 0.18, 0.82], 3), K('bloklar', [0.42, 0.08, 0.08, 0.08], 8, { olcme: false }), K('kino', [0.06, 0.34, 0.28, 0.58], 3), K('bulut', [0.66, 0.46, 0.26, 0.46], 2)],
  s10: [K('zipzip', [0.16, 0.1, 0.18, 0.32], 2), K('tombi', [0.62, 0.08, 0.24, 0.38], 4), K('mino', [0.06, 0.4, 0.22, 0.44], 2), K('kino', [0.38, 0.34, 0.24, 0.54], 3, { parcalar: { kuyruk: 4 } }), K('bulut', [0.72, 0.44, 0.22, 0.42], 2)],
  s11: [K('tombi', [0.74, 0.04, 0.22, 0.3], 4), K('bulut', [0.06, 0.34, 0.24, 0.38], 2), K('kino', [0.36, 0.3, 0.28, 0.42], 3, { parcalar: { kuyruk: 3 } }), K('mino', [0.7, 0.34, 0.24, 0.38], 2), K('pisi', [0.47, 0.66, 0.07, 0.06], 2, { olcme: false })],
  s12: [K('anne', [0.02, 0.12, 0.28, 0.84], 3), K('kino', [0.56, 0.18, 0.24, 0.66], 6), K('blok', [0.6, 0.12, 0.08, 0.07], 1, { olcme: false })],
  s13: [K('kino-lokum', [0.14, 0.2, 0.66, 0.76], 6)],
  s14: [K('baba', [0.02, 0.16, 0.3, 0.58], 3), K('kino', [0.28, 0.44, 0.36, 0.26], 2, { parcalar: { kulak: 3 } }), K('hirka', [0.36, 0.42, 0.18, 0.14], 1, { olcme: false }), K('lokum', [0.7, 0.32, 0.24, 0.34], 2)],
};
const UGUR_KARE = 4;
/** Parça dizisinin dosya adı (uzantısız) */
const parcaAdi = (sayfa, k, parca) => k.parcaDosya?.[parca] ?? `${sayfa}-${k.id}-${parca}`;
module.exports = { SAYFALAR, UGUR_KARE, parcaAdi };
if (require.main !== module) return;

const yuvarla = (v) => Math.round(v * 10000) / 10000;
const dosya = (ad) => ['.png', '.jpg', '.jpeg', '.webp'].map((u) => path.join(GIRDI, ad + u)).find((f) => fs.existsSync(f));
const elOku = () => { const f = path.join(GIRDI, 'yerlesim-el.json'); try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {}; } catch (e) { console.log('yerlesim-el.json okunamadı:', e.message); return {}; } };

/** Beyaz olmayan piksellerin dağılımından bantlar (aralar beyaz) */
function bantlar(dolu, enAzBosluk, enAzBant) {
  const b = []; let bas = -1, bos = 0;
  for (let i = 0; i <= dolu.length; i++) {
    const v = i < dolu.length && dolu[i];
    if (v) { if (bas < 0) bas = i; bos = 0; }
    else if (bas >= 0) { bos++; if (bos >= enAzBosluk || i === dolu.length) { const son = i - bos; if (son - bas >= enAzBant) b.push([bas, son]); bas = -1; bos = 0; } }
  }
  return b;
}

/** Beyaz zeminli sayfadaki kareler (satır satır, soldan sağa); beklenen sayı tutmazsa null */
async function kareleriBul(f, beklenen) {
  const { data, info } = await s(f).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const cizim = (x, y) => { const i = (y * W + x) * 3; return Math.min(data[i], data[i + 1], data[i + 2]) < 225; };
  const satirDolu = Array.from({ length: H }, (_, y) => { let n = 0; for (let x = 0; x < W; x += 2) if (cizim(x, y)) n++; return n > 2; });
  const satirlar = bantlar(satirDolu, Math.round(H * 0.02), Math.round(H * 0.06));
  const kutular = [];
  for (const [y0, y1] of satirlar) {
    const sutunDolu = Array.from({ length: W }, (_, x) => { let n = 0; for (let y = y0; y <= y1; y += 2) if (cizim(x, y)) n++; return n > 1; });
    let b = [];
    for (const bosluk of [0.012, 0.006, 0.003]) { b = bantlar(sutunDolu, Math.round(W * bosluk), Math.round(W * 0.02)); if (kutular.length + b.length >= beklenen) break; }
    for (const [x0, x1] of b) {
      // karenin kendi dikey sınırı (satır bandı geniş olabilir)
      let ky0 = y1, ky1 = y0;
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x += 2) if (cizim(x, y)) { if (y < ky0) ky0 = y; if (y > ky1) ky1 = y; break; }
      kutular.push([x0, ky0, x1, ky1]);
    }
  }
  if (kutular.length !== beklenen) { console.log(`  ${path.basename(f)}: ${kutular.length} kare bulundu, ${beklenen} bekleniyordu; KESİLMEDİ`); return null; }
  return { kutular, W, H };
}

/** Kareleri kesip zeminini şeffaf yapar (gemini-esya.cjs, kayıpsız ara çıktı); her karenin kendi kırpımı */
async function kareleriKes(f, ad, beklenen) {
  const k = await kareleriBul(f, beklenen);
  if (!k) return null;
  const girdi = path.join(ARA, 'kes-' + ad), cikti = path.join(ARA, 'kesik-' + ad);
  fs.rmSync(girdi, { recursive: true, force: true }); fs.rmSync(cikti, { recursive: true, force: true });
  fs.mkdirSync(girdi, { recursive: true });
  const P = 24;
  for (let i = 0; i < k.kutular.length; i++) {
    const [x0, y0, x1, y1] = k.kutular[i];
    const l = Math.max(0, x0 - P), t = Math.max(0, y0 - P);
    await s(f).removeAlpha().extract({ left: l, top: t, width: Math.min(k.W, x1 + P) - l, height: Math.min(k.H, y1 + P) - t }).extend({ top: 8, bottom: 8, left: 8, right: 8, background: '#ffffff' }).png().toFile(path.join(girdi, `${ad}-${i + 1}.png`));
  }
  execFileSync('node', [ESYA_KES, '--girdi', girdi, '--cikti', cikti, '--kayipsiz', '--max', '0'], { stdio: 'pipe', cwd: KOK });
  const kareler = [];
  for (let i = 1; i <= beklenen; i++) {
    const p = path.join(cikti, `${ad}-${i}.webp`);
    const m = await s(p).metadata();
    kareler.push({ buf: fs.readFileSync(p), w: m.width, h: m.height });
  }
  return kareler;
}

/** Kareleri ortak tuvale koyar (aynı ölçek): hiza 'alt' (taban), 'ust' (kök üstte) ya da 'orta' */
async function ortakTuval(kareler, hiza) {
  const TW = Math.max(...kareler.map((k) => k.w)), TH = Math.max(...kareler.map((k) => k.h));
  const cik = [];
  for (const k of kareler) {
    const top = hiza === 'alt' ? TH - k.h : hiza === 'ust' ? 0 : Math.round((TH - k.h) / 2);
    const left = Math.round((TW - k.w) / 2);
    cik.push({ buf: await s({ create: { width: TW, height: TH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([{ input: k.buf, left, top }]).png().toBuffer(), left, top, w: k.w, h: k.h });
  }
  return { TW, TH, cik };
}

async function webpYaz(ad, buf, olcek = 1) {
  let b = buf;
  if (olcek < 0.999) { const m = await s(buf).metadata(); b = await s(buf).resize(Math.max(1, Math.round(m.width * olcek)), Math.max(1, Math.round(m.height * olcek)), { kernel: 'lanczos3' }).png().toBuffer(); }
  const w = await s(b).webp({ quality: 92, alphaQuality: 100, effort: 5 }).toBuffer();
  await guvenliYaz(path.join(CIKTI, ad + '.webp'), w);
  return ad + '.webp';
}

/** Fark maskesi → bölgeler (sayfanın oranı olarak kutular) */
async function farkBolgeleri(tamF, zeminF) {
  const N = 512;
  const a = await s(tamF).removeAlpha().resize(N, N, { fit: 'fill' }).blur(1.2).raw().toBuffer();
  const b = await s(zeminF).removeAlpha().resize(N, N, { fit: 'fill' }).blur(1.2).raw().toBuffer();
  const m = new Uint8Array(N * N);
  for (let i = 0; i < N * N; i++) m[i] = Math.abs(a[i * 3] - b[i * 3]) + Math.abs(a[i * 3 + 1] - b[i * 3 + 1]) + Math.abs(a[i * 3 + 2] - b[i * 3 + 2]) > 70 ? 1 : 0;
  // kapama: 3 px şişir + 3 px aşındır (kontur aralarındaki delikler kapansın)
  const sis = (src, r, deger) => { const o = new Uint8Array(N * N); for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { let v = deger ? 0 : 1; for (let dy = -r; dy <= r && (deger ? !v : v); dy++) for (let dx = -r; dx <= r; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= N || yy >= N) continue; if (deger ? src[yy * N + xx] : !src[yy * N + xx]) { v = deger ? 1 : 0; break; } } o[y * N + x] = v; } return o; };
  const kapali = sis(sis(m, 3, true), 3, false);
  const et = new Int32Array(N * N).fill(-1), q = new Int32Array(N * N), bolgeler = [];
  for (let i = 0; i < N * N; i++) {
    if (!kapali[i] || et[i] >= 0) continue;
    let bs = 0, sn = 0, x0 = N, y0 = N, x1 = 0, y1 = 0; q[sn++] = i; et[i] = bolgeler.length;
    while (bs < sn) { const p = q[bs++], x = p % N, y = (p / N) | 0; if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; for (const d of [-1, 1, -N, N]) { const r = p + d; if (r < 0 || r >= N * N || et[r] >= 0 || !kapali[r]) continue; if ((d === -1 && x === 0) || (d === 1 && x === N - 1)) continue; et[r] = bolgeler.length; q[sn++] = r; } }
    bolgeler.push({ alan: sn, kutu: [x0 / N, y0 / N, (x1 + 1) / N, (y1 + 1) / N] });
  }
  return bolgeler.filter((b) => b.alan > N * N * 0.002);
}

/** Bölgeleri tablodaki yaklaşık yere en yakın (örtüşen) katmana verir; katman kutusu = bölgelerinin birleşimi */
function bolgeleriDagit(bolgeler, katmanlar) {
  const sonuc = {};
  for (const b of bolgeler) {
    const [bx0, by0, bx1, by1] = b.kutu, bcx = (bx0 + bx1) / 2, bcy = (by0 + by1) / 2;
    let en = null, enP = Infinity;
    for (const k of katmanlar) {
      const [x, y, w, h] = k.yer;
      const ort = Math.max(0, Math.min(bx1, x + w) - Math.max(bx0, x)) * Math.max(0, Math.min(by1, y + h) - Math.max(by0, y));
      const uzak = Math.hypot(bcx - (x + w / 2), bcy - (y + h / 2));
      const puan = uzak - ort * 4;
      if (puan < enP) { enP = puan; en = k; }
    }
    if (!en) continue;
    const s0 = sonuc[en.id];
    sonuc[en.id] = s0 ? [Math.min(s0[0], bx0), Math.min(s0[1], by0), Math.max(s0[2], bx1), Math.max(s0[3], by1)] : [bx0, by0, bx1, by1];
  }
  for (const id of Object.keys(sonuc)) { const [x0, y0, x1, y1] = sonuc[id]; sonuc[id] = [x0, y0, x1 - x0, y1 - y0]; }
  return sonuc;
}

async function sayfaIsle(sayfa, yerlesim, el) {
  const katmanlar = SAYFALAR[sayfa];
  const tamF = dosya(sayfa), zeminF = dosya(`${sayfa}-zemin`);
  const y = (yerlesim.sayfalar[sayfa] = yerlesim.sayfalar[sayfa] || {});
  if (!tamF && !zeminF) { console.log(`${sayfa}: sayfa resmi yok (bekleniyor)`); return; }
  console.log(`${sayfa}:`);
  for (const [f, son] of [[zeminF, 'zemin'], [!zeminF ? tamF : null, 'tam']]) {
    if (!f) continue;
    const m = await s(f).metadata();
    if (Math.min(m.width, m.height) < SAYFA_PX * 0.98) console.log(`  UYARI ${path.basename(f)} ${m.width}x${m.height}: kare 2048'den küçük (Gemini 2K kare isteyin)`);
    const kenar = Math.min(m.width, m.height, SAYFA_PX);
    // kare değilse ortadan kare kırpılır (kitap kare resim bekler)
    const kare = Math.min(m.width, m.height);
    const buf = await s(f).removeAlpha().extract({ left: Math.floor((m.width - kare) / 2), top: Math.floor((m.height - kare) / 2), width: kare, height: kare }).resize(kenar, kenar, { kernel: 'lanczos3' }).webp({ quality: 90, effort: 5 }).toBuffer();
    if (await guvenliYaz(path.join(CIKTI, `${sayfa}-${son}.webp`), buf)) console.log(`  ${sayfa}-${son}.webp ${kenar}x${kenar}`);
    y[son] = `${sayfa}-${son}.webp`;
  }
  if (zeminF) delete y.tam;
  if (el.ugur?.[sayfa]) y.ugur = el.ugur[sayfa];
  // katman yerleri: fark (ya da elle)
  let yerler = {};
  if (tamF && zeminF) yerler = bolgeleriDagit(await farkBolgeleri(tamF, zeminF), katmanlar.filter((k) => k.olcme !== false));
  Object.assign(yerler, el[sayfa] || {});
  y.katmanlar = y.katmanlar || {};
  const kontrol = [];
  for (const k of katmanlar) {
    const f = dosya(`${sayfa}-${k.id}`);
    if (!f) { console.log(`  ${k.id}: hareket sayfası yok (yer tutucu kalır)`); continue; }
    const kareler = await kareleriKes(f, `${sayfa}-${k.id}`, k.pozlar);
    if (!kareler) continue;
    const t = await ortakTuval(kareler, 'alt');
    const kayit = { pozlar: [] };
    // ölçek: poz 1 fark bölgesinin boyuna; ölçülmeyen katman: tanımdaki enine
    const yer = yerler[k.id];
    let olcek;
    if (k.olcme !== false && yer) olcek = (yer[3] * SAYFA_PX) / kareler[0].h;
    else olcek = (k.yer[2] * SAYFA_PX) / Math.max(...kareler.map((q) => q.w));
    if (olcek > 1.001) console.log(`  UYARI ${k.id}: hareket sayfası küçük (×${olcek.toFixed(2)} büyütmek gerekirdi; büyütülmedi, ekranda netlik kuralı sınırında). Daha büyük çizim isteyin.`);
    const o = Math.min(1, olcek);
    for (let i = 0; i < t.cik.length; i++) kayit.pozlar.push(await webpYaz(`${sayfa}-${k.id}-${i + 1}`, t.cik[i].buf, o));
    if (k.olcme !== false && yer) {
      // poz 1'in tabanı ve ortası fark bölgesinin tabanına ve ortasına oturur
      const p1 = t.cik[0];
      const TWs = (t.TW * olcek) / SAYFA_PX, THs = (t.TH * olcek) / SAYFA_PX;
      const p1x = ((p1.left + p1.w / 2) * olcek) / SAYFA_PX, p1y = ((p1.top + p1.h) * olcek) / SAYFA_PX;
      const hedefX = yer[0] + yer[2] / 2, hedefY = yer[1] + yer[3];
      kayit.kutu = [hedefX - p1x, hedefY - p1y, TWs, THs].map(yuvarla);
      kontrol.push({ id: k.id, kutu: kayit.kutu });
    } else if (k.olcme !== false) console.log(`  ${k.id}: yeri ölçülemedi (sNN.png + sNN-zemin.png gerekli ya da yerlesim-el.json); tanımdaki yer kullanılır`);
    for (const [parca, n] of Object.entries(k.parcalar || {})) {
      const pf = dosya(parcaAdi(sayfa, k, parca));
      if (!pf) { console.log(`  ${k.id}-${parca}: dizi yok`); continue; }
      const pk = await kareleriKes(pf, `${sayfa}-${k.id}-${parca}`, n);
      if (!pk) continue;
      const ust = /kulak/.test(parca);
      const pt = await ortakTuval(pk, ust ? 'ust' : 'alt');
      const kareAd = [];
      for (let i = 0; i < pt.cik.length; i++) kareAd.push(await webpYaz(`${sayfa}-${k.id}-${parca}-${i + 1}`, pt.cik[i].buf, o));
      // kök: katman kutusunun oranı olarak (elle ya da tahmin); parçanın kök ucu (alt/üst orta) oraya gelir
      const kokEl = el.kok?.[`${sayfa}/${k.id}/${parca}`];
      const kok = kokEl || (ust ? [0.5, 0.22] : [0.3, 0.66]);
      if (!kokEl) console.log(`  ${k.id}-${parca}: kök noktası tahmin (${kok}); yerlesim-el.json → kok ile düzeltin`);
      const pw = (pt.TW * olcek) / SAYFA_PX, ph = (pt.TH * olcek) / SAYFA_PX;
      const lw = kayit.kutu ? kayit.kutu[2] : k.yer[2], lh = kayit.kutu ? kayit.kutu[3] : k.yer[3];
      const kw = pw / lw, kh = ph / lh;
      kayit.parcalar = kayit.parcalar || {};
      kayit.parcalar[parca] = { kutu: [kok[0] - kw / 2, ust ? kok[1] : kok[1] - kh, kw, kh].map(yuvarla), kareler: kareAd };
    }
    y.katmanlar[k.id] = kayit;
    console.log(`  ${k.id}: ${kayit.pozlar.length} poz${kayit.kutu ? ' · yer ' + kayit.kutu.join(', ') : ''}`);
  }
  // denetim görüntüsü
  const z = zeminF || tamF;
  if (z && kontrol.length) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">${kontrol.map((c) => `<rect x="${c.kutu[0] * 1024}" y="${c.kutu[1] * 1024}" width="${c.kutu[2] * 1024}" height="${c.kutu[3] * 1024}" fill="none" stroke="#e0352b" stroke-width="4"/><text x="${c.kutu[0] * 1024 + 6}" y="${c.kutu[1] * 1024 + 26}" font-size="24" fill="#e0352b">${c.id}</text>`).join('')}</svg>`;
    fs.mkdirSync(ARA, { recursive: true });
    await s(z).resize(1024, 1024, { fit: 'fill' }).composite([{ input: Buffer.from(svg) }]).png().toFile(path.join(ARA, `kontrol-${sayfa}.png`));
  }
}

async function ugurIsle(yerlesim) {
  const f = dosya('ortak-ugur');
  if (!f) return console.log('ortak-ugur: yok (yer tutucu kalır)');
  const k = await kareleriKes(f, 'ortak-ugur', UGUR_KARE);
  if (!k) return;
  const t = await ortakTuval(k, 'orta');
  // uğur böceği ekranda en çok sayfanın %6'sı: 2048 × 0.06 ≈ 123 px yeter; 256'ya küçültülür
  const o = Math.min(1, 256 / Math.max(t.TW, t.TH));
  yerlesim.ugur = [];
  for (let i = 0; i < t.cik.length; i++) yerlesim.ugur.push(await webpYaz(`ortak-ugur-${i + 1}`, t.cik[i].buf, o));
  console.log(`ortak-ugur: ${yerlesim.ugur.length} kare`);
}

// ---------------------------------------------------------------- deneme: yapay çizimler
async function denemeHazirla() {
  const d = path.join(ARA, 'deneme-girdi');
  fs.rmSync(d, { recursive: true, force: true });
  fs.mkdirSync(d, { recursive: true });
  const kont = '#3b2416';
  const sahne = (ic) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="2048"><rect width="2048" height="2048" fill="#cfe3f2"/><rect y="1500" width="2048" height="548" fill="#e8c9a0"/>${ic}</svg>`);
  const kino = (x, y, s = 1, ek = '') => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-90" y="-420" width="180" height="420" rx="70" fill="#7fc35a" stroke="${kont}" stroke-width="10"/><circle cx="0" cy="-470" r="90" fill="#fff" stroke="${kont}" stroke-width="10"/>${ek}</g>`;
  const lokum = (x, y) => `<g transform="translate(${x} ${y})"><circle cx="0" cy="-130" r="130" fill="#ff9ccc" stroke="${kont}" stroke-width="10"/></g>`;
  await s(sahne(kino(620, 1600) + lokum(1450, 1300))).png().toFile(path.join(d, 's01.png'));
  await s(sahne('')).png().toFile(path.join(d, 's01-zemin.png'));
  // hareket sayfası: 6 poz, 2 sıra × 4 (son sıra 2); ölçek sayfadakinin 1.2 katı
  const poz = (i) => kino(0, 0, 1.2, i % 2 ? `<rect x="80" y="-300" width="140" height="40" fill="#7fc35a" stroke="${kont}" stroke-width="8"/>` : '');
  let ic = '';
  for (let i = 0; i < 6; i++) ic += `<g transform="translate(${360 + (i % 4) * 680} ${i < 4 ? 720 : 1500})">${poz(i)}</g>`;
  await s(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="2752" height="1536"><rect width="2752" height="1536" fill="#fff"/><g transform="scale(0.98)">${ic}</g></svg>`)).png().toFile(path.join(d, 's01-kino.png'));
  let lk = '';
  for (let i = 0; i < 4; i++) lk += `<g transform="translate(${400 + i * 650} 1000)">${lokum(0, 0)}</g>`;
  await s(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="2752" height="1536"><rect width="2752" height="1536" fill="#fff"/>${lk}</svg>`)).png().toFile(path.join(d, 's01-lokum.png'));
  let ku = '';
  for (let i = 0; i < 4; i++) ku += `<rect x="${300 + i * 650}" y="${600 - i * 40}" width="60" height="${300 + i * 40}" rx="30" fill="#a0612f" stroke="${kont}" stroke-width="8"/>`;
  await s(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="2752" height="1536"><rect width="2752" height="1536" fill="#fff"/>${ku}</svg>`)).png().toFile(path.join(d, 's01-kino-kuyruk.png'));
  let ug = '';
  for (let i = 0; i < 4; i++) ug += `<ellipse cx="${400 + i * 650}" cy="760" rx="${120 + i * 30}" ry="120" fill="#e0352b" stroke="${kont}" stroke-width="10"/>`;
  await s(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="2752" height="1536"><rect width="2752" height="1536" fill="#fff"/>${ug}</svg>`)).png().toFile(path.join(d, 'ortak-ugur.png'));
  return d;
}

(async () => {
  let sayfalar = process.argv.slice(2).filter((x, i, d) => !x.startsWith('--') && d[i - 1] !== '--girdi');
  if (DENEME) {
    GIRDI = await denemeHazirla();
    CIKTI = path.join(ARA, 'deneme-cikti');
    fs.rmSync(CIKTI, { recursive: true, force: true });
    sayfalar = ['s01'];
  }
  if (!fs.existsSync(GIRDI)) { console.log(`Girdi klasörü yok: ${GIRDI} (Antigravity çizimleri gelince)`); return; }
  fs.mkdirSync(CIKTI, { recursive: true });
  const yerYol = path.join(CIKTI, 'yerlesim.json');
  const yerlesim = fs.existsSync(yerYol) ? JSON.parse(fs.readFileSync(yerYol, 'utf8')) : { sayfalar: {} };
  const el = elOku();
  for (const sayfa of sayfalar.length ? sayfalar : Object.keys(SAYFALAR)) {
    if (!SAYFALAR[sayfa]) { console.log(`${sayfa}: tabloda yok`); continue; }
    await sayfaIsle(sayfa, yerlesim, el);
  }
  await ugurIsle(yerlesim);
  fs.writeFileSync(yerYol, JSON.stringify(yerlesim, null, 1) + '\n');
  console.log(`yerlesim.json yazıldı: ${path.relative(KOK, yerYol) || yerYol}`);
  if (DENEME) {
    const s01 = yerlesim.sayfalar.s01;
    const tamam = s01?.zemin && s01.katmanlar?.kino?.pozlar?.length === 6 && s01.katmanlar.kino.kutu && s01.katmanlar.lokum?.kutu && s01.katmanlar.kino.parcalar?.kuyruk?.kareler.length === 4 && yerlesim.ugur?.length === 4;
    const [x, y, w, h] = s01?.katmanlar?.kino?.kutu ?? [];
    console.log(JSON.stringify(s01, null, 1));
    // yapay Kino sayfada x≈0.30 ortada, tabanı y≈0.78
    const yerDogru = Math.abs(x + w / 2 - 620 / 2048) < 0.02 && Math.abs(y + h - 1605 / 2048) < 0.02;
    console.log(tamam && yerDogru ? 'DENEME GEÇTİ' : 'DENEME KALDI');
    process.exitCode = tamam && yerDogru ? 0 : 1;
  }
})();
