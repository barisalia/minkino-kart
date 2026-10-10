#!/usr/bin/env node
/**
 * Seri 2 mekânları (Gemini, Barış onaylı stil: ekip/gemini/yeni/seri2-mekan/*.png) → assets/film-seri2/.
 *
 * Her mekân:  <ad>.webp  2752×1536 (kaynak boyu; yeniden ölçeklenmez), WebP q88.
 * Ön katmanlar (karakterin ÖNÜNE çizilen kesimler; arka planla aynı kare, aynı konum: x, y kaynakta):
 *   oda-sabah-yorgan.webp   Kino'nun yorganı (yatakta yatan Kino yorganın altında kalır). Kesim: kutuda her sütunda
 *                       yorganın üst ve alt kontur çizgisi bulunur, aradaki her şey alınır (duvar ve zemin dışarıda).
 *   oda-sabah-karyola.webp  Lokum'un karyolasının ön parmaklıkları (Lokum parmaklıkların arkasında durur). Kesim: kutuda
 *                       yalnız ahşap ve koyu kontur pikselleri (duvar, yatak, yastık saydam).
 * Ayna yansıması için:  banyo-*-yumusak.webp  1/4 boy, hafif bulanık (ayna içinde uzak arka plan; canlı filtre yok).
 * Konumlar: YORGAN ve KARYOLA kutuları (aşağıda); film/src/oyunlu/bolum1.ts aynı sayılarla çizer.
 *
 * Kullanım: node ekip/illustrator/seri2-mekan-isle.cjs [kaynak-klasoru]
 * Yalnız .webp repoya girer; kaynak PNG'ler ekip/gemini/ altında kalır.
 */
const fs = require('fs');
const path = require('path');
const sharp = require(require.resolve('sharp', { paths: [process.cwd(), path.resolve(__dirname, '../..')] }));
const yaz = require('./guvenli-yaz.cjs');

const KOK = path.resolve(__dirname, '../..');
const KAYNAK = process.argv[2] ?? 'C:/Users/Minkex/Desktop/Minkino Games/ekip/gemini/yeni/seri2-mekan';
const CIKTI = path.join(KOK, 'assets/film-seri2');

const MEKANLAR = {
  'oda-sabah': 'm1-cocuk-odasi-sabah.png',
  'oda-gece': 'm1-cocuk-odasi-gece.png',
  'banyo-sabah': 'm3-banyo-sabah-v2.png',
  'banyo-aksam': 'm3-banyo-aksam-v2.png',
  bahce: 'm4-bahce.png',
  apartman: 'm0-apartman.png',
  'basamak-yakin': 'm0-basamak-yakin.png',
};
/**
 * Küvetin ön paneli (kuvet-on-kenar.png: banyo v2 ile aynı tuval, yalnız ön panel çizili, gerisi beyaz) →
 * banyo-kuvet-on.webp (kırpılmış; yeri KUVET_ON çıktısında). Akşam banyosunda karakter küvetin içindeyken ön katman.
 * Kesme gemini-esya.cjs ile (zemin kenardan akar, panelin açık içi kalır), tuval korunur; sonra saydam kenar kırpılır.
 * Hizası banyo-sabah / banyo-aksam v2 ile denetlenir (panelin konturu arka planın konturuna düşmeli).
 */
const KUVET = 'kuvet-on-kenar.png';
/** kesim kutuları (kaynak pikseli) */
const YORGAN = { x: 284, y: 920, w: 766, h: 322 };
const KARYOLA = { x: 1556, y: 726, w: 708, h: 450 };

const webp = (s) => s.webp({ quality: 88, alphaQuality: 100, effort: 6 }).toBuffer();
async function yazdir(ad, buf) {
  const hedef = path.join(CIKTI, ad);
  if (await yaz(hedef, buf)) console.log('yazıldı', path.relative(KOK, hedef), (buf.length / 1024).toFixed(0), 'KB');
}
const parlaklik = (d, i) => 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2];
function ton(r, g, b) {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (!d) return [0, 0];
  let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, d / mx];
}

/** kutudan RGBA kesim; tut(i, x, y) → 0..1 */
async function kes(png, kutu, tut) {
  const { data, info } = await sharp(png).extract({ left: kutu.x, top: kutu.y, width: kutu.w, height: kutu.h }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(kutu.w * kutu.h * 4);
  for (let y = 0; y < kutu.h; y++)
    for (let x = 0; x < kutu.w; x++) {
      const i = (y * kutu.w + x) * 3, o = (y * kutu.w + x) * 4;
      out[o] = data[i];
      out[o + 1] = data[i + 1];
      out[o + 2] = data[i + 2];
      out[o + 3] = Math.round(255 * tut(data, i, x, y, kutu));
    }
  // kenar yumuşatma: tek piksellik pürüzleri 1 px bulanık alfa ile al
  const alfa = await sharp(out, { raw: { width: kutu.w, height: kutu.h, channels: 4 } }).extractChannel(3).blur(0.6).raw().toBuffer();
  for (let p = 0; p < kutu.w * kutu.h; p++) out[p * 4 + 3] = Math.min(out[p * 4 + 3], alfa[p] * 1.15);
  return webp(sharp(out, { raw: { width: kutu.w, height: kutu.h, channels: 4 } }));
}

/**
 * yorgan: her sütunda üst kontur (altı yorgan rengi olan ilk koyu çizgi: yastığın konturu atlanır) ile alttan ilk
 * koyu kontur arası
 */
function yorganKesici(data, w, h) {
  const ust = new Int32Array(w).fill(h), alt = new Int32Array(w).fill(-1);
  const koyu = (x, y) => parlaklik(data, (y * w + x) * 3) < 95;
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      if (!koyu(x, y)) continue;
      let e = y;
      while (e < h - 1 && koyu(x, e + 1)) e++;
      const i = (Math.min(h - 1, e + 5) * w + x) * 3;
      if (data[i + 1] - data[i + 2] > 25) { ust[x] = y; break; }
      y = e;
    }
    for (let y = h - 1; y >= 0; y--) if (koyu(x, y)) { alt[x] = y; break; }
  }
  // tek tük kaçan sütunlar (kontur birleşmesi): komşu 9 sütunun ortancası
  const ortanca = (a) => Int32Array.from(a, (_, x) => {
    const k = [];
    for (let j = Math.max(0, x - 4); j <= Math.min(w - 1, x + 4); j++) k.push(a[j]);
    return k.sort((p, q) => p - q)[k.length >> 1];
  });
  const u = ortanca(ust), a = ortanca(alt);
  return (d, i, x, y) => (y >= u[x] - 1 && y <= a[x] + 1 ? 1 : 0);
}
/** karyola: ahşap pikselleri + ahşaba en çok 6 px uzaktaki koyu kontur (yatak ve yastık konturu dışarıda) */
function karyolaKesici(data, w, h) {
  const ahsap = new Uint8Array(w * h);
  for (let p = 0; p < w * h; p++) {
    const i = p * 3, [t, s] = ton(data[i], data[i + 1], data[i + 2]);
    ahsap[p] = t >= 14 && t <= 42 && s > 0.3 && data[i] > 150 ? 1 : 0;
  }
  const R = 6, yakin = new Uint8Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (!ahsap[y * w + x]) continue;
      for (let dy = -R; dy <= R; dy++)
        for (let dx = -R; dx <= R; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && ny >= 0 && nx < w && ny < h) yakin[ny * w + nx] = 1;
        }
    }
  return (d, i, x, y) => (ahsap[y * w + x] || (yakin[y * w + x] && parlaklik(d, i) < 110) ? 1 : 0);
}

(async () => {
  fs.mkdirSync(CIKTI, { recursive: true });
  const katmanlar = {};
  for (const [ad, dosya] of Object.entries(MEKANLAR)) {
    const png = path.join(KAYNAK, dosya);
    if (!fs.existsSync(png)) {
      console.log('YOK', png);
      continue;
    }
    const meta = await sharp(png).metadata();
    katmanlar[ad] = { boyut: [meta.width, meta.height], on: {} };
    await yazdir(`${ad}.webp`, await webp(sharp(png)));
    if (ad === 'oda-sabah') {
      const { data } = await sharp(png).extract({ left: YORGAN.x, top: YORGAN.y, width: YORGAN.w, height: YORGAN.h }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      await yazdir(`${ad}-yorgan.webp`, await kes(png, YORGAN, yorganKesici(data, YORGAN.w, YORGAN.h)));
      const k = await sharp(png).extract({ left: KARYOLA.x, top: KARYOLA.y, width: KARYOLA.w, height: KARYOLA.h }).removeAlpha().raw().toBuffer();
      await yazdir(`${ad}-karyola.webp`, await kes(png, KARYOLA, karyolaKesici(k, KARYOLA.w, KARYOLA.h)));
      katmanlar[ad].on = { yorgan: [YORGAN.x, YORGAN.y, YORGAN.w, YORGAN.h], karyola: [KARYOLA.x, KARYOLA.y, KARYOLA.w, KARYOLA.h] };
    }
    if (ad.startsWith('banyo-')) {
      const yumusak = await sharp(png).resize(Math.round(meta.width / 4), Math.round(meta.height / 4)).blur(1.6).modulate({ brightness: 1.02, saturation: 0.85 });
      await yazdir(`${ad}-yumusak.webp`, await webp(yumusak));
    }
  }
  const kuvet = path.join(KAYNAK, KUVET);
  if (fs.existsSync(kuvet)) katmanlar['banyo-kuvet-on'] = await kuvetOn(kuvet);
  // kesimlerin yeri (film/src/oyunlu/bolum1.ts aynı sayıları kullanır)
  console.log('ön katmanlar (x, y, w, h):', JSON.stringify(katmanlar));
})();

async function kuvetOn(png) {
  const os = require('os');
  const { execFileSync } = require('child_process');
  const gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'kuvet-on-'));
  fs.mkdirSync(path.join(gecici, 'g'));
  fs.copyFileSync(png, path.join(gecici, 'g', 'kuvet.png'));
  execFileSync(process.execPath, [path.join(__dirname, 'gemini-esya.cjs'), '--girdi', path.join(gecici, 'g'), '--cikti', path.join(gecici, 'c'), '--max', '0', '--ayar', JSON.stringify({ kuvet: { tuvalKoru: true } })], { stdio: 'inherit', cwd: KOK });
  const tam = fs.readFileSync(path.join(gecici, 'c', 'kuvet.webp'));
  const { data, info } = await sharp(tam).raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  let x0 = W, y0 = H, x1 = 0, y1 = 0;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (data[(y * W + x) * 4 + 3] > 4) {
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      }
  const kutu = { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
  // hiza denetimi: panelin koyu konturu arka planda da koyu mu (±6 px kaydırmalarda en iyisi 0,0 olmalı)
  // iki arka plan aynı kaydırmayı buluyorsa (Gemini tuvali 1-2 px kaymış) konum ona göre düzeltilir
  const kaymalar = [];
  for (const arka of ['m3-banyo-sabah-v2.png', 'm3-banyo-aksam-v2.png']) {
    const yol = path.join(KAYNAK, arka);
    if (!fs.existsSync(yol)) continue;
    const a = await sharp(yol).removeAlpha().raw().toBuffer();
    const k = await sharp(png).removeAlpha().raw().toBuffer();
    const koyu = (d, i) => parlaklik(d, i * 3) < 100;
    const noktalar = [];
    for (let y = kutu.y; y < kutu.y + kutu.h; y += 2) for (let x = kutu.x; x < kutu.x + kutu.w; x += 2) if (koyu(k, y * W + x)) noktalar.push([x, y]);
    let en = { dx: 0, dy: 0, oran: -1 };
    for (let dy = -6; dy <= 6; dy++)
      for (let dx = -6; dx <= 6; dx++) {
        let t = 0;
        for (const [x, y] of noktalar) if (koyu(a, (y + dy) * W + x + dx)) t++;
        const oran = t / noktalar.length;
        if (oran > en.oran) en = { dx, dy, oran };
      }
    let t0 = 0;
    for (const [x, y] of noktalar) if (koyu(a, y * W + x)) t0++;
    kaymalar.push(en);
    console.log(`kuvet-on hiza (${arka}): kaydırmasız ${(100 * t0 / noktalar.length).toFixed(1)}% kontur örtüşür; en iyi kaydırma ${en.dx},${en.dy} → ${(100 * en.oran).toFixed(1)}%`);
  }
  await yazdir('banyo-kuvet-on.webp', await webp(sharp(tam).extract({ left: kutu.x, top: kutu.y, width: kutu.w, height: kutu.h })));
  fs.rmSync(gecici, { recursive: true, force: true });
  const k0 = kaymalar[0];
  const ayni = k0 && kaymalar.every((k) => k.dx === k0.dx && k.dy === k0.dy && k.oran > 0.97);
  const [dx, dy] = ayni ? [k0.dx, k0.dy] : [0, 0];
  if (dx || dy) console.log(`kuvet-on: konum ${dx},${dy} px düzeltildi`);
  return { boyut: [W, H], on: { kuvet: [kutu.x + dx, kutu.y + dy, kutu.w, kutu.h] } };
}
