// Netlik yeniden çizimleri (ekip/gemini/NETLIK-YENIDEN-CIZIM.md; girdi ekip/gemini/yeni/netlik/*.png, 2752×1536 / 1536×2752)
// → oyundaki eski dosyaların yerine, aynı hiza ve oranla, daha büyük.
//   node ekip/illustrator/netlik-isle.cjs [ad ...]     (repo kökünden; ad: flama, pasta-kapi, kefe, komodin, salincak, banyo)
//
// - Zemin temizliği gemini-esya.cjs ile (kenardan akıtma, halesiz), kayıpsız ara çıktı.
// - flama, pasta-ust, kapi (assets/parti): eski Recraft dosyasının tuval oranı ve iç kutusu korunur (512 ölçekte 8 px
//   pay); yeni çizim eski kutunun enine oturur. Flama tepeden (asıldığı köşeler), kapı tabandan, pasta ortadan hizalanır.
// - terazi-kefe (assets/pazar): kırpılmış hâli; ölçüleri (halka, kenar, dip) pazar/src/tart-legen.ts ve terazi.css'te.
// - komodin-yakin, komodin-yakin-acik (assets/elektrik): Elektrik'teki çekmece yakın çekimi; iki poz aynı tuvalde,
//   gövdeleri sol-alt köşeden üst üste (poz değişince komodin zıplamaz).
// - arka-on-dikey (assets/film/park): Salıncak'ın dikey ön çimeni; gök şeffaf, tuval korunur (1536×2752).
// - arkaplan-dikey (assets/banyo): Banyo'nun dikey arka planı. Sağ alttaki saçaklı beyaz halı (Gemini'nin eklediği;
//   oyunda küvet örtmüyor) ve üstündeki beyaz elips (oyunun desenli paspası ondan yassı, örtmüyordu) silinir: zemin
//   satırın tahta renginden, sağ duvarın tabanı ve karoları iki karo sırası yukarıdan doldurulur.
// Daha yüksek çözünürlüklü mevcut dosya ezilmez (guvenli-yaz.cjs; ZORLA=1).
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
const KOK = path.resolve(__dirname, '..', '..');
const s = require(require.resolve('sharp', { paths: [KOK] }));
const guvenliYaz = require('./guvenli-yaz.cjs');
const G = path.join(KOK, 'ekip/gemini/yeni/netlik');
const ARA = path.join(os.tmpdir(), 'netlik-isle');
const secim = process.argv.slice(2);
const istendi = (ad) => !secim.length || secim.includes(ad);

/** Eski dosyaların tuvali ve içerik kutusu (alfa > 40; değiştirilmeden önce ölçüldü): [en, boy, x0, y0, x1, y1] */
const ESKI = {
  flama: [512, 192, 8, 8, 504, 184],
  'pasta-ust': [507, 512, 8, 8, 499, 504],
  kapi: [312, 512, 8, 8, 304, 504],
};

const webp = (img, q = 94) => img.webp({ quality: q, alphaQuality: 100, effort: 5 }).toBuffer();
async function yaz(yol, buf) {
  const m = await s(buf).metadata();
  if (await guvenliYaz(path.join(KOK, yol), buf)) console.log(`${yol}: ${m.width}x${m.height}, ${Math.round(buf.length / 1024)} KB`);
}
/** gemini-esya ile zemin temizliği: girdi dosyası → ad.webp (kayıpsız, kırpılmış ya da tuval korunmuş) */
function temizle(isler) {
  const gir = path.join(ARA, 'girdi'), cik = path.join(ARA, 'cikti');
  fs.rmSync(ARA, { recursive: true, force: true });
  fs.mkdirSync(gir, { recursive: true });
  const ayar = {};
  for (const [ad, dosya, o] of isler) {
    fs.copyFileSync(path.join(G, dosya), path.join(gir, ad + '.png'));
    ayar[ad] = o || {};
  }
  execFileSync('node', [path.join(__dirname, 'gemini-esya.cjs'), '--girdi', gir, '--cikti', cik, '--max', '0', '--kayipsiz', '--ayar', JSON.stringify(ayar), ...isler.map((i) => i[0])], { stdio: 'inherit', cwd: KOK });
  return (ad) => fs.readFileSync(path.join(cik, ad + '.webp'));
}
/** Yeni çizimi eski tuvalin oranına ve iç kutusuna oturtur (hiza: ust | alt | orta) */
async function eskiCerceve(ad, buf, hiza, enle = false) {
  const [EW, EH, ex0, ey0, ex1, ey1] = ESKI[ad];
  const m = await s(buf).metadata();
  const kw = ex1 - ex0, kh = ey1 - ey0;
  // eski kutunun en ve boyuna sığan en büyük ölçek (oran farkı varsa kısa yanda boşluk kalır; esnetilmez).
  // enle: eni tutturulur (flama duvarı boydan boya kaplar); boy taşarsa tuval o kadar uzar
  const k = enle ? kw / m.width : Math.min(kw / m.width, kh / m.height); // eski piksel / yeni piksel
  const N = 1 / k; // yeni tuval eski tuvalin N katı
  const TW = Math.round(EW * N), TH = Math.max(Math.round(EH * N), Math.round(ey0 * N + m.height));
  const cw = m.width, ch = m.height;
  const kutu = { x0: ex0 * N, y0: ey0 * N, x1: ex1 * N, y1: ey1 * N };
  const sol = Math.round((kutu.x0 + kutu.x1) / 2 - cw / 2);
  const ust = Math.round(hiza === 'ust' ? kutu.y0 : hiza === 'alt' ? kutu.y1 - ch : (kutu.y0 + kutu.y1) / 2 - ch / 2);
  console.log(`${ad}: eski içerik oranı ${(kw / kh).toFixed(3)}, yeni ${(cw / ch).toFixed(3)}; tuval ${TW}x${TH} (${N.toFixed(2)} kat)`);
  const tuval = await s({ create: { width: TW, height: TH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: buf, left: Math.max(0, sol), top: Math.max(0, ust) }])
    .png()
    .toBuffer();
  return webp(s(tuval));
}
/** alfa kutusu (piksel) */
async function alfaKutu(buf) {
  const { data, info } = await s(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let x0 = info.width, y0 = info.height, x1 = -1, y1 = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) if (data[(y * info.width + x) * 4 + 3] > 40) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  return { x0, y0, x1: x1 + 1, y1: y1 + 1, W: info.width, H: info.height };
}

/** Banyo: saçaklı halıyı ve üstündeki beyaz elipsi sil (sağ alt) */
async function banyoHalisiz() {
  const { data, info } = await s(path.join(G, 'banyo-arka-dikey.png')).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  // sağ duvarın tabanı (zeminle birleştiği eğik çizgi): köşeden (1320, 2395) resmin altına (1535, 2752)
  const duvarX = (y) => 1320 + 0.602 * Math.max(0, y - 2395);
  // kontur rengi (köşe çizgisinden)
  const K = [data[(2380 * W + 1320) * 3], data[(2380 * W + 1320) * 3 + 1], data[(2380 * W + 1320) * 3 + 2]];
  // halının kaba bölgesi (sağ alt) ve kendisi: zemin tarafındaki beyaz/krem (düşük doygunluk) pikseller, 18 px
  // şişirilir (kontur, saçak, kesik çizgiler de girsin)
  const halida = (x, y) => y > 2380 && x > 860 && x < duvarX(y) + 10 && ((x - 1300) / 520) ** 2 + ((y - 2752) / 420) ** 2 <= 1;
  const beyaz = new Uint8Array(W * H);
  for (let y = 2300; y < H; y++)
    for (let x = 820; x < W; x++) {
      const i = (y * W + x) * 3, mn = Math.min(data[i], data[i + 1], data[i + 2]), mx = Math.max(data[i], data[i + 1], data[i + 2]);
      if (halida(x, y) && mn > 222 && mx - mn < 26) beyaz[y * W + x] = 1;
    }
  const R = 18, maske = new Uint8Array(W * H);
  for (let y = 2300; y < H; y++)
    for (let x = 820; x < W; x++) {
      if (!beyaz[y * W + x]) continue;
      for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < H && dx * dx + dy * dy <= R * R) maske[yy * W + xx] = 1; }
    }
  // halının dış sınırı (saçak uçları dahil): içi bütünüyle silinir (renk ölçüsünün kaçırdığı saçak konturları da gitsin)
  const HALI = { cx: 1250, cy: 2700, rx: 388, ry: 324 };
  for (let y = 2300; y < H; y++) for (let x = 820; x < W; x++) if (((x - HALI.cx) / HALI.rx) ** 2 + ((y - HALI.cy) / HALI.ry) ** 2 <= 1) maske[y * W + x] = 1;
  const out = Buffer.from(data);
  let sayi = 0;
  for (let y = 2300; y < H; y++) {
    // zemin: satırın halıdan hemen önceki (solundaki) tahta renginin ortancası; tahta çizgisi satırları kendiliğinden
    // koyu gelir (dikey/eğik ek yerleri ortancada kaybolur: halının altındaki tahtalar uzun görünür)
    let a = -1;
    for (let x = 820; x < W; x++) if (maske[y * W + x] && x < duvarX(y) - 4) { a = x; break; }
    let renk = null;
    if (a > 0) {
      const ch = [[], [], []];
      for (let x = Math.max(0, a - 90); x < a - 8; x++) for (let c = 0; c < 3; c++) ch[c].push(data[(y * W + x) * 3 + c]);
      renk = ch.map((v) => v.sort((p, q) => p - q)[v.length >> 1]);
    }
    for (let x = 820; x < W; x++) {
      if (!maske[y * W + x]) continue;
      const i = (y * W + x) * 3;
      const d = x - duvarX(y);
      if (d > -3.5 && d < 3.5) {
        // taban çizgisi (halının altında kalan kısmı yeniden çizilir; kenarı yumuşak)
        const a = Math.min(1, Math.max(0, 3.5 - Math.abs(d)) / 1.5);
        const z = renk || [data[i], data[i + 1], data[i + 2]];
        const alt = d < 0 ? z : [data[((y - 360) * W + x) * 3], data[((y - 360) * W + x) * 3 + 1], data[((y - 360) * W + x) * 3 + 2]];
        for (let c = 0; c < 3; c++) out[i + c] = Math.round(K[c] * a + alt[c] * (1 - a));
      } else if (d >= 3.5 || !renk) {
        // duvar: iki karo sırası yukarıdan (karolar eğik sıralı; perspektifte sıra boyu ~175 px)
        const j = ((y - 360) * W + x) * 3;
        out[i] = data[j]; out[i + 1] = data[j + 1]; out[i + 2] = data[j + 2];
      } else {
        out[i] = renk[0]; out[i + 1] = renk[1]; out[i + 2] = renk[2];
      }
      sayi++;
    }
  }
  console.log(`banyo: halı silindi (${sayi} piksel: zemin satır renginden, duvar aynadan)`);
  return s(out, { raw: { width: W, height: H, channels: 3 } });
}

(async () => {
  const isler = [];
  if (istendi('flama')) isler.push(['flama', 'dg-flama.png']);
  if (istendi('pasta-kapi')) isler.push(['pasta-ust', 'dg-pasta-kapi.png', { kes: [0, 0, 1376, 1536] }], ['kapi', 'dg-pasta-kapi.png', { kes: [1376, 0, 2752, 1536] }]);
  if (istendi('kefe')) isler.push(['terazi-kefe', 'tart-kefe.png', { delik: true, delikMin: 400 }]);
  if (istendi('komodin'))
    isler.push(['komodin-yakin', 'elektrik-cekmece-yakin.png', { kes: [0, 0, 1376, 1536], delik: true, delikMin: 400 }], ['komodin-yakin-acik', 'elektrik-cekmece-yakin.png', { kes: [1376, 0, 2752, 1536], delik: true, delikMin: 400 }]);
  if (istendi('salincak')) isler.push(['arka-on-dikey', 'salincak-arka-dikey.png', { tuvalKoru: true }]);
  const al = isler.length ? temizle(isler) : null;

  if (istendi('flama')) await yaz('assets/parti/flama.webp', await eskiCerceve('flama', al('flama'), 'ust', true));
  if (istendi('pasta-kapi')) {
    await yaz('assets/parti/pasta-ust.webp', await eskiCerceve('pasta-ust', al('pasta-ust'), 'orta'));
    await yaz('assets/parti/kapi.webp', await eskiCerceve('kapi', al('kapi'), 'alt'));
  }
  if (istendi('kefe')) await yaz('assets/pazar/terazi-kefe.webp', await webp(s(al('terazi-kefe'))));
  if (istendi('komodin')) {
    // iki poz aynı tuvalde: gövdenin sol-alt köşesi üst üste (açık pozda çekmece sağa taşar)
    const k = al('komodin-yakin'), a = al('komodin-yakin-acik');
    const mk = await s(k).metadata(), ma = await s(a).metadata();
    const TW = Math.max(mk.width, ma.width), TH = Math.max(mk.height, ma.height);
    for (const [ad, b, m] of [['komodin-yakin', k, mk], ['komodin-yakin-acik', a, ma]]) {
      const t = await s({ create: { width: TW, height: TH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([{ input: b, left: 0, top: TH - m.height }]).png().toBuffer();
      await yaz(`assets/elektrik/${ad}.webp`, await webp(s(t)));
    }
  }
  if (istendi('salincak')) await yaz('assets/film/park/arka-on-dikey.webp', await webp(s(al('arka-on-dikey')), 92));
  if (istendi('banyo')) await yaz('assets/banyo/arkaplan-dikey.webp', await (await banyoHalisiz()).webp({ quality: 90, effort: 5 }).toBuffer());
})();
module.exports = { alfaKutu };
