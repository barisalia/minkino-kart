// Kino'nun Otobüsü yeni müşteriler: Gemini sayfası (ekip/gemini/yeni/kino-otobus/musteri-yeni-sayfasi.png, 2752x1536, beyaz zemin,
// 2 satır x 3 sütun) → assets/kino-otobus/musteri/<ad>.webp (şeffaf, kırpılmış) + olcu.json.
//   node ekip/illustrator/kino-otobus-musteri-kes.cjs      (repo kökünden; güvenli: daha büyük mevcut dosya ezilmez, ZORLA=1 ile ezilir)
// Yöntem:
//  1) Sayfa 3x2 ızgaraya bölünür (sütun sınırı x=917/1834, satır sınırı y=790; hiçbir çizim sınıra değmiyor), parçalar geçici klasöre PNG.
//  2) Zemin silme gemini-esya.cjs ile (kenardan akan beyaz silinir, iç beyazlar kalır: yün, göz, gömlek; kontur halesiz),
//     tuvalKoru ile parça tuvali korunur (koordinatlar sayfaya geri çevrilebilsin), --kayipsiz ara çıktı.
//  3) ÖLÇEK KURALI (Barış): boylar (tepe → ayak / araba tabanı) birim cinsinden BOY tablosunda. Hiçbir şey BÜYÜTÜLMEZ (netlik bozulur).
//     Baba Gemini'de kısa çizildi → baba kendi çözünürlüğünde kalır, ortak ppu = babaBoyu / 2.2; diğerleri ppu * birim boyuna KÜÇÜLTÜLÜR.
//     Zipzip'in 1.25'i KULAKSIZ (başın tepesi → ayak); kulaklar üstüne eklenir. Bir hedef kendi boyundan büyük çıkarsa ortak ppu düşürülür.
//  4) Kenar boşluğu: boyun ~%2'si, her yanda eşit. webp q92, alfa kayıpsız.
//  5) olcu.json: en/boy, tepe/taban (alfa>60 ilk/son satır), bas (kulaksız baş tepesi; Zipzip dışında = tepe), yuz [x0,y0,x1,y1] (göz+ağız
//     kutusu; balonlar yüzü örtmesin), agiz [x,y], bel (tezgâhın gövdeyi keseceği çizgi; Bidicik'te arabanın üst kenarı).
//     yuz/agiz/bel/basX sayfa koordinatında elle ölçüldü (aşağıdaki NOKTA tablosu), son dosyaya ölçekle çevrilir.
const { execFileSync } = require('child_process'), fs = require('fs'), os = require('os'), path = require('path');
const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const guvenliYaz = require('./guvenli-yaz.cjs');
const SAYFA = 'ekip/gemini/yeni/kino-otobus/musteri-yeni-sayfasi.png', O = 'assets/kino-otobus/musteri';
const ARA = path.join(os.tmpdir(), 'kino-otobus-musteri-kes'), GIR = path.join(ARA, 'girdi'), KES = path.join(ARA, 'kes');
const SUTUN = [0, 917, 1834, 2752], SATIR = [0, 790, 1536];
/** sayfadaki yer: [satır, sütun] */
const YER = { bidik: [0, 0], bidicik: [0, 1], 'bidik-baba': [0, 2], tombi: [1, 0], bulut: [1, 1], zipzip: [1, 2] };
/** hedef boy (birim): tepe → ayak (Bidicik araba dahil; Zipzip kulaksız) */
const BOY = { bidik: 1.25, bidicik: 0.8, 'bidik-baba': 2.2, tombi: 1.45, bulut: 1.25, zipzip: 1.25 };
const ESAS = 'bidik-baba';
/**
 * Elle ölçülen noktalar (SAYFA koordinatı, 2752x1536): yuz [x0,y0,x1,y1] gözler+ağız, agiz [x,y], bel y,
 * basBant [x0,x1]: kulaksız baş tepesi bu sütun aralığındaki en üst opak pikselden (yalnız Zipzip: kulakların arası).
 */
const NOKTA = {
  bidik: { yuz: [490, 315, 672, 432], agiz: [580, 412], bel: 590 },               // bel: tulum cebi hizası (eller)
  bidicik: { yuz: [1140, 425, 1280, 503], agiz: [1208, 489], bel: 633 },         // bel: arabanın ön üst kenarı
  'bidik-baba': { yuz: [2060, 208, 2218, 342], agiz: [2141, 326], bel: 588 },    // bel: yeleğin alt kenarı
  tombi: { yuz: [490, 962, 692, 1062], agiz: [597, 1051], bel: 1272 },           // bel: şortun üst kenarı
  bulut: { yuz: [1295, 1042, 1472, 1138], agiz: [1388, 1124], bel: 1312 },       // bel: yün gövdenin ortası (eller)
  zipzip: { yuz: [2062, 1108, 2245, 1200], agiz: [2157, 1184], bel: 1372, basBant: [2140, 2172] },   // bel: tişörtün alt kenarı
};
const ALFA = 60, KENAR = 0.02;

(async () => {
  fs.rmSync(ARA, { recursive: true, force: true }); fs.mkdirSync(GIR, { recursive: true }); fs.mkdirSync(KES, { recursive: true });
  // 1) ızgara parçaları
  const koken = {};
  for (const [ad, [r, c]] of Object.entries(YER)) {
    const x0 = SUTUN[c], y0 = SATIR[r], w = SUTUN[c + 1] - x0, h = SATIR[r + 1] - y0; koken[ad] = [x0, y0];
    await s(SAYFA).removeAlpha().extract({ left: x0, top: y0, width: w, height: h }).png().toFile(path.join(GIR, ad + '.png'));
  }
  // 2) zemin silme (tuval korunur)
  const ayar = {}; for (const ad of Object.keys(YER)) ayar[ad] = { tuvalKoru: true };
  ayar.bidicik.delik = true; ayar.bidicik.delikMin = 10; ayar.bidicik.delikNokta = [[713, 623]];   // araba sapının tutacağındaki elmas boşluk (parça koordinatı; sayfada 1630,623)
  execFileSync(process.execPath, [path.join(__dirname, 'gemini-esya.cjs'), '--girdi', GIR, '--cikti', KES, '--max', '0', '--kayipsiz', '--ayar', JSON.stringify(ayar)], { stdio: 'inherit' });
  // 3) ölçüm (parça tuvalinde)
  const olc = {};
  for (const ad of Object.keys(YER)) {
    const { data, info } = await s(path.join(KES, ad + '.webp')).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const W = info.width, H = info.height; let bx0 = W, by0 = H, bx1 = -1, by1 = -1, tepe = H, taban = -1;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const a = data[(y * W + x) * 4 + 3]; if (a > 0) { bx0 = Math.min(bx0, x); bx1 = Math.max(bx1, x); by0 = Math.min(by0, y); by1 = Math.max(by1, y); } if (a > ALFA) { tepe = Math.min(tepe, y); taban = Math.max(taban, y); } }
    let bas = tepe; const bb = NOKTA[ad].basBant;
    if (bb) { bas = H; const [kx] = koken[ad]; for (let x = bb[0] - kx; x <= bb[1] - kx; x++) for (let y = 0; y < H; y++) if (data[(y * W + x) * 4 + 3] > ALFA) { bas = Math.min(bas, y); break; } }
    olc[ad] = { data, W, H, kutu: [bx0, by0, bx1, by1], tepe, taban, bas, boyPx: taban - bas + 1 };
  }
  // 4) ortak ölçek: ppu = esas / birim; büyütme gerekiyorsa ppu düşer
  let ppu = olc[ESAS].boyPx / BOY[ESAS]; const ilkPpu = ppu;
  for (const ad of Object.keys(YER)) ppu = Math.min(ppu, olc[ad].boyPx / BOY[ad]);
  if (ppu < ilkPpu) console.log(`UYARI: ${ESAS} kendi boyunda kalamadı (büyütme gerekirdi); ortak ppu ${ilkPpu.toFixed(1)} → ${ppu.toFixed(1)}`);
  console.log('ortak ppu (px/birim):', ppu.toFixed(2));
  // 5) kırp, küçült, boşluk ekle, yaz; olcu.json
  const sonuc = {};
  for (const ad of Object.keys(YER)) {
    const m = olc[ad], [bx0, by0, bx1, by1] = m.kutu, w = bx1 - bx0 + 1, h = by1 - by0 + 1;
    const k = Math.min(1, (ppu * BOY[ad]) / m.boyPx), nw = Math.max(1, Math.round(w * k)), nh = Math.max(1, Math.round(h * k));
    const kx = nw / w, ky = nh / h;   // yuvarlama sonrası gerçek ölçek
    const kirp = await s(m.data, { raw: { width: m.W, height: m.H, channels: 4 } }).extract({ left: bx0, top: by0, width: w, height: h }).png().toBuffer();
    const kucuk = k < 1 ? await s(kirp).resize(nw, nh, { kernel: 'lanczos3' }).png().toBuffer() : kirp;
    const pay = Math.max(4, Math.round(nh * KENAR));
    const son = await s(kucuk).extend({ top: pay, bottom: pay, left: pay, right: pay, background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    const buf = await s(son).webp({ quality: 92, alphaQuality: 100, effort: 6 }).toBuffer();
    const yazildi = await guvenliYaz(path.join(O, ad + '.webp'), buf);
    // son dosyada ölç (webp çözülmüş hâliyle)
    const { data: d2, info: i2 } = await s(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let tepe = i2.height, taban = -1; for (let y = 0; y < i2.height; y++) for (let x = 0; x < i2.width; x++) if (d2[(y * i2.width + x) * 4 + 3] > ALFA) { tepe = Math.min(tepe, y); taban = Math.max(taban, y); }
    const [ox, oy] = koken[ad], N = NOKTA[ad];
    const X = (sx) => Math.round((sx - ox - bx0) * kx + pay), Y = (sy) => Math.round((sy - oy - by0) * ky + pay);
    const bas = N.basBant ? Math.round((m.bas - by0) * ky + pay) : tepe;
    sonuc[ad] = { en: i2.width, boy: i2.height, tepe, taban, bas, yuz: [X(N.yuz[0]), Y(N.yuz[1]), X(N.yuz[2]), Y(N.yuz[3])], agiz: [X(N.agiz[0]), Y(N.agiz[1])], bel: Y(N.bel) };
    console.log(`${ad}: ${i2.width}x${i2.height} (ölçek ${k.toFixed(3)}, boy ${((taban - bas + 1) / ppu).toFixed(3)} birim, ${Math.round(buf.length / 1024)} KB)${yazildi ? '' : ' ATLANDI'}`);
  }
  fs.writeFileSync(path.join(O, 'olcu.json'), JSON.stringify(sonuc, null, 1) + '\n');
  if (!process.env.TUT) fs.rmSync(ARA, { recursive: true, force: true });   // TUT=1: ara dosyalar kalır (ölçüm için)
})();
