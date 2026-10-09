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
const { execFileSync } = require('child_process'), fs = require('fs'), os = require('os'), path = require('path');
const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const guvenliYaz = require('./guvenli-yaz.cjs');
const gi = process.argv.indexOf('--girdi');
const G = gi >= 0 ? process.argv.splice(gi, 2)[1] : 'ekip/gemini/yeni/kino-otobus', O = 'assets/kino-otobus', ARA = path.join(os.tmpdir(), 'kino-otobus-kes');
const ATLA = [];   // bilerek elle düzeltilen dosyalar buraya (betik yeniden üretmesin)
const ARKA = ['ic-arka', 'pencere-dogumgunu'];
/** çıktının uzun kenarı (px): ekranda en büyük hâli × DPR 3 */
const EN = { otobus: 1920, 'tezgah-on': 2400, dolap: 1600, 'ic-arka': 2048, 'pencere-dogumgunu': 2048 };
const VARSAYILAN_EN = 1024;
/** gemini-esya ayarları (dosya başına) */
const AYAR = { otobus: { tuvalKoru: true } };

const secili = process.argv.slice(2);
const tum = fs.readdirSync(G).filter((f) => f.endsWith('.png')).map((f) => f.replace(/\.png$/, '')).filter((a) => !ATLA.includes(a) && (!secili.length || secili.includes(a)));
const kesilecek = tum.filter((a) => !ARKA.includes(a));

const webp = (img) => img.webp({ quality: 94, alphaQuality: 100, effort: 5 }).toBuffer();
async function yaz(ad, buf) {
  const m = await s(buf).metadata();
  if (await guvenliYaz(path.join(O, ad + '.webp'), buf)) console.log(`${ad}: ${m.width}x${m.height}, ${Math.round(buf.length / 1024)} KB`);
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

(async () => {
  fs.mkdirSync(O, { recursive: true });
  // 1) şeffaf kesim (tam çözünürlük, ara klasöre)
  if (kesilecek.length) {
    fs.rmSync(ARA, { recursive: true, force: true });
    execFileSync('node', [path.join(__dirname, 'gemini-esya.cjs'), '--girdi', G, '--cikti', ARA, '--max', '0', '--ayar', JSON.stringify(AYAR), ...kesilecek], { stdio: 'inherit' });
  }
  const kes = (ad) => fs.readFileSync(path.join(ARA, ad + '.webp'));
  const var_ = (ad) => kesilecek.includes(ad);

  // 2) arka planlar (zemin kalır)
  for (const ad of tum.filter((a) => ARKA.includes(a))) {
    const img = s(path.join(G, ad + '.png')).removeAlpha(), m = await img.metadata();
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
      const k = Math.min((kubbeEn * 1.08) / enGenis(u.r, 0, u.H), (top.H - ust) / u.H);
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

  // 7) geri kalan tekler: kırpılmış hâli
  const yapilan = new Set(['otobus', ...toplar, ...ustler, ...kaplar]);
  for (const ad of kesilecek.filter((a) => !yapilan.has(a))) {
    const b = kes(ad), m = await s(b).metadata();
    await yaz(ad, await webp(kucult(s(b), m, EN[ad] ?? VARSAYILAN_EN)));
  }
})();
