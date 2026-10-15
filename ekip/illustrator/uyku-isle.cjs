// Uyku Vakti eşya sayfaları (Gemini U1 oda 3×3, U2 yatak 3×4; ekip/senaryo/GECE-ISI.md §5) → assets/uyku/*.webp
// (şeffaf, kırpılmış) + assets/uyku/olcu.json (kod oranları buradan okur: uygulama/src/uyku.ts).
//
// node ekip/illustrator/uyku-isle.cjs [--u1 ekip/gemini/yeni/uyku/oda-sayfasi.png] [--u2 ekip/gemini/yeni/uyku/yatak-sayfasi.png]
//        [--cikti assets/uyku] [--deneme] [--on '{"sepet":{"cx":0.5,"cy":0.4,"rx":0.42,"ry":0.2}}']
//
// - Sayfalardan biri yoksa o atlanır (öbürü işlenir). Asıl girdi en az 2048 px en; daha küçüğü yalnız --deneme ile ve
//   assets/'e YAZILMAZ (--cikti başka klasör olmalı). Adında GECICI geçen dosya hiç işlenmez.
// - Kareler beyaz boşluklardan bulunur (sıra / sütun aralıkları); bulunamazsa eşit ızgara.
// - Zemin temizliği gemini-esya.cjs ile (tuvalKoru), kırpma ve çift hizası burada: pencere-acik / pencere-kapali ve
//   lamba-sonuk / lamba-yanik aynı tuvalde, gövdeleri üst üste (örtüşme en büyük olacak ölçek + kayma aranır; geçişte
//   eşya zıplamaz). Kayma raporlanır (≤ 1 px hedef).
// - Yatağın ön kenarı (sepet-on, minder-on): yatakla AYNI tuvalde, yalnız ön kenar (karakterin önüne gelen kısım).
//   Maske önceliği: 1) tasarımcının elle çizdiği maske ekip/gemini/yeni/uyku/<sepet|minder>-on-maske.png (yatağın kırpılmış
//   çıktısıyla aynı boyda; beyaz = ön kenar), 2) yoksa elips yayı: yatağın kutusunda içi (minder / yastık yüzeyi) bir
//   elips sayılır, elipsin alt yayının altında kalan yatak pikselleri ön kenardır (--on ile ayarlanır). Kontrol için
//   ekip/gemini/yeni/uyku/on-onizleme.png yazılır (ön kenar kırmızımsı).
// - Daha yüksek çözünürlüklü mevcut dosya ezilmez (guvenli-yaz.cjs; ZORLA=1).
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
const KOK = path.resolve(__dirname, '..', '..');
const s = require(require.resolve('sharp', { paths: [KOK] }));
const guvenliYaz = require('./guvenli-yaz.cjs');
const arg = (ad, v) => { const i = process.argv.indexOf('--' + ad); return i >= 0 ? process.argv[i + 1] : v; };
const SAYFA_KL = path.resolve(KOK, 'ekip/gemini/yeni/uyku');
const U1 = path.resolve(KOK, arg('u1', 'ekip/gemini/yeni/uyku/oda-sayfasi.png'));
const U2 = path.resolve(KOK, arg('u2', 'ekip/gemini/yeni/uyku/yatak-sayfasi.png'));
const CIKTI = path.resolve(KOK, arg('cikti', 'assets/uyku'));
const DENEME = process.argv.includes('--deneme'), EN_AZ = 2048;

const SAYFALAR = [
  { dosya: U1, ad: 'U1 oda', adlar: [['pencere-acik', 'pencere-kapali', 'hali'], ['komodin', 'lamba-sonuk', 'lamba-yanik'], ['oyuncak-sepeti', 'raf', 'resim']] },
  { dosya: U2, ad: 'U2 yatak', adlar: [['sepet', 'minder', 'yastik-mino', 'yastik-kino'], ['battaniye-mino', 'battaniye-kino', 'yigin-mino', 'yigin-kino'], ['top', 'kupler', 'tren', 'kemik']] },
];
// gemini-esya ayarları
const AYAR = {
  // pencerenin camları lacivert (zemin değil); çerçevenin beyazı kapalı bölge olarak kalır
  'pencere-acik': { koyu: 190 },
  'pencere-kapali': { koyu: 190 },
  // duvara bantlı resim: kâğıdın beyazı kalır
  resim: { koyu: 200 },
  // sönük lamba açık krem: çizgisi açık kalabiliyor
  'lamba-sonuk': { koyu: 200 },
  // sepetin kulpları, rafın altı: kapalı beyaz boşluk delik
  'oyuncak-sepeti': { delik: true, delikMin: 200 },
  raf: { delik: true, delikMin: 200 },
  sepet: { delik: true, delikMin: 400 },
  yastik: {},
};
const CIFTLER = [
  ['pencere-acik', 'pencere-kapali'],
  ['lamba-sonuk', 'lamba-yanik'],
];
// en uzun kenar sınırı (DPR 3'te kaynak boyundan büyük basılmasın: halı yatay telefonda ~1270 px)
const MAX = { hali: 1600, pencere: 1200, varsayilan: 1024 };
const maxBul = (ad) => (ad === 'hali' ? MAX.hali : ad.startsWith('pencere') ? MAX.pencere : MAX.varsayilan);
// yatağın içi (elips; kutunun oranı): ön kenar bu elipsin alt yayının altında kalan kısım
const ON_VARSAYILAN = { sepet: { cx: 0.5, cy: 0.42, rx: 0.4, ry: 0.22 }, minder: { cx: 0.5, cy: 0.4, rx: 0.4, ry: 0.2 } };
const ON = { ...ON_VARSAYILAN, ...JSON.parse(arg('on', '{}')) };

function bantlar(say, uzunluk, esik, enAz) {
  const b = []; let bas = -1;
  for (let i = 0; i <= uzunluk; i++) {
    const dolu = i < uzunluk && say[i] > esik;
    if (dolu && bas < 0) bas = i;
    if (!dolu && bas >= 0) { if (i - bas >= enAz) b.push([bas, i]); bas = -1; }
  }
  const bir = [];
  for (const x of b) { const o = bir[bir.length - 1]; if (o && x[0] - o[1] < enAz) o[1] = x[1]; else bir.push([...x]); }
  return bir;
}
function nBant(b, n) {
  b = b.map((x) => [...x]);
  while (b.length > n) { let en = 0, ara = Infinity; for (let i = 0; i < b.length - 1; i++) { const a = b[i + 1][0] - b[i][1]; if (a < ara) { ara = a; en = i; } } b.splice(en, 2, [b[en][0], b[en + 1][1]]); }
  return b.length === n ? b : null;
}

/** Sayfayı karelere böler: { ad: png yolu } */
async function sayfaKes(sayfa, tmp) {
  const m = await s(sayfa.dosya).metadata();
  console.log(`${sayfa.ad}: ${path.relative(KOK, sayfa.dosya)} ${m.width}x${m.height}`);
  if (m.width < EN_AZ && !DENEME) { console.log(`  asıl sayfa en az ${EN_AZ} px en olmalı (bu ${m.width}); yalnız deneme için --deneme --cikti <başka klasör>`); return null; }
  const { data, info } = await s(sayfa.dosya).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, SIRA = sayfa.adlar.length, SUT = sayfa.adlar[0].length;
  const dolu = (x, y) => { const i = (y * W + x) * 3, r = data[i], g = data[i + 1], b = data[i + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b); return mn < 215 || mx - mn > 40; };
  const enAz = Math.round(W * 0.006);
  const satir = new Int32Array(H); for (let y = 0; y < H; y++) { let c = 0; for (let x = 0; x < W; x++) c += dolu(x, y); satir[y] = c; }
  let siralar = nBant(bantlar(satir, H, 1, enAz), SIRA);
  if (!siralar) { console.log('  UYARI: sıra aralıkları bulunamadı, eşit ızgara'); siralar = [...Array(SIRA)].map((_, i) => [Math.round((i * H) / SIRA), Math.round(((i + 1) * H) / SIRA)]); }
  const kareler = {};
  for (let r = 0; r < SIRA; r++) {
    const [y0, y1] = siralar[r];
    const sutun = new Int32Array(W); for (let x = 0; x < W; x++) { let c = 0; for (let y = y0; y < y1; y++) c += dolu(x, y); sutun[x] = c; }
    let sutunlar = nBant(bantlar(sutun, W, 1, enAz), SUT);
    if (!sutunlar) { console.log(`  UYARI: ${r + 1}. sıranın sütunları bulunamadı, eşit ızgara`); sutunlar = [...Array(SUT)].map((_, i) => [Math.round((i * W) / SUT), Math.round(((i + 1) * W) / SUT)]); }
    for (let c = 0; c < SUT; c++) {
      const [x0, x1] = sutunlar[c];
      let ky0 = y1, ky1 = y0; for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (dolu(x, y)) { ky0 = Math.min(ky0, y); ky1 = Math.max(ky1, y); break; }
      const pay = Math.round(W * 0.01);
      const kx0 = Math.max(0, x0 - pay), kx1 = Math.min(W, x1 + pay), kyy0 = Math.max(0, ky0 - pay), kyy1 = Math.min(H, ky1 + 1 + pay);
      const ad = sayfa.adlar[r][c];
      await s(sayfa.dosya).removeAlpha().extract({ left: kx0, top: kyy0, width: kx1 - kx0, height: kyy1 - kyy0 }).png().toFile(path.join(tmp, ad + '.png'));
      kareler[ad] = [kx1 - kx0, kyy1 - kyy0];
    }
  }
  console.log('  kareler:', Object.entries(kareler).map(([a, [w, h]]) => `${a} ${w}x${h}`).join(', '));
  return kareler;
}

(async () => {
  if (DENEME && path.resolve(CIKTI) === path.resolve(KOK, 'assets/uyku')) { console.log('--deneme çıktısı assets/uyku olamaz'); process.exit(1); }
  const var_ = SAYFALAR.filter((p) => fs.existsSync(p.dosya) && !/GECICI/i.test(path.basename(p.dosya)));
  for (const p of SAYFALAR) if (!var_.includes(p)) console.log(`${p.ad}: yok (${path.relative(KOK, p.dosya)}), atlandı`);
  if (!var_.length) { console.log('işlenecek sayfa yok'); process.exit(1); }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'uyku-isle-'));
  const kareler = {};
  for (const p of var_) Object.assign(kareler, (await sayfaKes(p, tmp)) ?? {});
  if (!Object.keys(kareler).length) process.exit(1);
  // zemin temizliği (tuval korunur)
  const ayar = {}; for (const ad of Object.keys(kareler)) ayar[ad] = { tuvalKoru: true, ...(AYAR[ad] || {}) };
  const temiz = path.join(tmp, 'temiz');
  execFileSync(process.execPath, [path.join(__dirname, 'gemini-esya.cjs'), '--girdi', tmp, '--cikti', temiz, '--max', '0', '--ayar', JSON.stringify(ayar)], { cwd: KOK, stdio: 'inherit' });
  // kırpma
  const ham = {};
  for (const ad of Object.keys(kareler)) {
    const { data: d, info: i } = await s(path.join(temiz, ad + '.webp')).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let x0 = i.width, y0 = i.height, x1 = -1, y1 = -1;
    for (let y = 0; y < i.height; y++) for (let x = 0; x < i.width; x++) if (d[(y * i.width + x) * 4 + 3] > 12) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    if (x1 < 0) { console.log(`  UYARI: ${ad} boş çıktı, atlandı`); continue; }
    ham[ad] = await s(d, { raw: { width: i.width, height: i.height, channels: 4 } }).extract({ left: x0, top: y0, width: x1 + 1 - x0, height: y1 + 1 - y0 }).png().toBuffer();
  }
  const olcu = {};
  fs.mkdirSync(CIKTI, { recursive: true });
  const yaz = async (ad, buf, enCok = maxBul(ad)) => {
    const mm = await s(buf).metadata(); const k = enCok && Math.max(mm.width, mm.height) > enCok ? enCok / Math.max(mm.width, mm.height) : 1;
    const son = k < 1 ? await s(buf).resize(Math.round(mm.width * k), Math.round(mm.height * k), { kernel: 'lanczos3' }).png().toBuffer() : buf;
    const webp = await s(son).webp({ quality: 94, alphaQuality: 100, effort: 5 }).toBuffer();
    const sm = await s(son).metadata();
    const yazildi = await guvenliYaz(path.join(CIKTI, ad + '.webp'), webp);
    olcu[ad] = [sm.width, sm.height];
    console.log(`${ad}: ${sm.width}x${sm.height}${yazildi ? '' : ' (ATLANDI)'}`);
    return son;
  };
  // çiftler aynı tuvalde (elektrik-isle.cjs yöntemi: siluet örtüşmesi en büyük ölçek + kayma)
  const ciftte = new Set();
  for (const [a, b] of CIFTLER) {
    if (!ham[a] || !ham[b]) continue;
    ciftte.add(a); ciftte.add(b);
    const ma = await s(ham[a]).metadata(), mb = await s(ham[b]).metadata();
    const wa = ma.width, ha = ma.height, wb = mb.width, hb = mb.height;
    const K = 160 / Math.max(wa, ha);
    const maske = async (buf, w, h) => { const { data: d } = await s(buf).resize(Math.max(1, Math.round(w)), Math.max(1, Math.round(h))).ensureAlpha().raw().toBuffer({ resolveWithObject: true }); const m = new Uint8Array(Math.round(w) * Math.round(h)); for (let i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] > 128 ? 1 : 0; return m; };
    const aw = Math.round(wa * K), ah = Math.round(ha * K), mA = await maske(ham[a], aw, ah);
    let en = { iou: -1 };
    for (let ks = 0.9; ks <= 1.101; ks += 0.01) {
      const bw = Math.round(wb * K * ks * (ha / hb)), bh = Math.round(hb * K * ks * (ha / hb)), mB = await maske(ham[b], bw, bh);
      for (let dy = -Math.round(ah * 0.12); dy <= Math.round(ah * 0.12); dy++) for (let dx = -Math.round(aw * 0.15); dx <= Math.round(aw * 0.15); dx++) {
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
    // kalan kayma: arama küçük ölçekte (1 adım = 1/K px); tam ölçekte bu kadar belirsizlik kalır
    console.log(`  çift ${a}/${b}: ortak tuval ${TW}x${TH}; ikinci ×${k.toFixed(3)}, kayma ${bx},${by} px, örtüşme ${en.iou.toFixed(3)} (arama adımı ~${(1 / K).toFixed(1)} px)`);
  }
  // yataklar ve ön kenarları (aynı tuval)
  const onizleme = [];
  for (const yatak of ['sepet', 'minder']) {
    if (!ham[yatak]) continue;
    ciftte.add(yatak);
    const son = await yaz(yatak, ham[yatak]);
    const { data: d, info: i } = await s(son).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const W = i.width, H = i.height;
    const elMaske = path.join(SAYFA_KL, `${yatak}-on-maske.png`);
    let onMi;
    if (fs.existsSync(elMaske)) {
      const { data: m } = await s(elMaske).resize(W, H, { fit: 'fill' }).greyscale().raw().toBuffer({ resolveWithObject: true });
      onMi = (x, y) => m[y * W + x] / 255;
      console.log(`  ${yatak}-on: elle çizilmiş maske (${path.relative(KOK, elMaske)})`);
    } else {
      const o = ON[yatak];
      onMi = (x, y) => {
        const u = x / W, v = y / H, t = (u - o.cx) / o.rx;
        const yay = Math.abs(t) < 1 ? o.cy + o.ry * Math.sqrt(1 - t * t) : o.cy;
        // 1.5 px yumuşak geçiş (kenarda tırtık olmasın)
        return Math.max(0, Math.min(1, ((v - yay) * H) / 1.5 + 0.5));
      };
      console.log(`  ${yatak}-on: elips yayı ${JSON.stringify(o)} (ayar: --on; elle maske: ${path.relative(KOK, elMaske)})`);
    }
    const on = Buffer.from(d);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const j = (y * W + x) * 4; on[j + 3] = Math.round(d[j + 3] * onMi(x, y)); }
    const onPng = await s(on, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
    await yaz(`${yatak}-on`, onPng, 0);
    // önizleme: yatak + ön kenar kırmızımsı
    const kirmizi = Buffer.from(on);
    for (let j = 0; j < kirmizi.length; j += 4) if (kirmizi[j + 3]) { kirmizi[j] = 230; kirmizi[j + 1] = 60; kirmizi[j + 2] = 60; kirmizi[j + 3] = Math.round(kirmizi[j + 3] * 0.55); }
    onizleme.push(await s(son).composite([{ input: await s(kirmizi, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer() }]).flatten({ background: '#ffffff' }).png().toBuffer());
  }
  if (onizleme.length && !DENEME) {
    const ms = await Promise.all(onizleme.map((b) => s(b).metadata()));
    const TW = ms.reduce((t, m) => t + m.width + 20, 0), TH = Math.max(...ms.map((m) => m.height));
    let x = 0; const parca = onizleme.map((b, i) => { const p = { input: b, left: x, top: 0 }; x += ms[i].width + 20; return p; });
    await s({ create: { width: TW, height: TH, channels: 3, background: '#ffffff' } }).composite(parca).png().toFile(path.join(SAYFA_KL, 'on-onizleme.png'));
    console.log('ön kenar önizlemesi →', path.relative(KOK, path.join(SAYFA_KL, 'on-onizleme.png')));
  }
  for (const ad of Object.keys(ham)) if (!ciftte.has(ad)) await yaz(ad, ham[ad]);
  // oranlar (uygulama/src/uyku.ts → OLCU); önceki olcu.json'daki (bu sefer işlenmeyen sayfanın) değerler korunur
  const olcuYol = path.join(CIKTI, 'olcu.json');
  let eski = {}; try { eski = JSON.parse(fs.readFileSync(olcuYol, 'utf8')).olcu ?? {}; } catch { /* yok */ }
  fs.writeFileSync(olcuYol, JSON.stringify({ kaynak: var_.map((p) => path.relative(KOK, p.dosya).replace(/\\/g, '/')), olcu: { ...eski, ...olcu } }, null, 1) + '\n');
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('bitti →', path.relative(KOK, CIKTI) || CIKTI);
})();
