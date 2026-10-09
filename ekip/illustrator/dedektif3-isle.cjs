// Gemini "Dedektif Vaka 3" seti (IS-LISTESI-YENI.md bölüm B ve E; ekip/gemini/yeni/dedektif3/*.png, ≥2048) → assets/dedektif3/<ad>.webp.
// Dosya klasöre girince oyun kendiliğinden onu kullanır (dedektif/src/resimler3.ts: tek harita; yer tutucu devreden çıkar).
// Yeni dosya gelince tekrar çalıştırılır (güvenli: daha büyük mevcut dosya ezilmez, guvenli-yaz.cjs; ZORLA=1 ile ezilir).
//   node ekip/illustrator/dedektif3-isle.cjs [--girdi <klasör>] [ad ...]   (repo kökünden; girdi varsayılanı ekip/gemini/yeni/dedektif3)
// Kurallar ("Şeffaf" sütunu):
//  - H (zemin kalır): sahneler (otobus-ic, otobus-yani, agac, kiler-ic ve -dikey eşleri), roman-1..4, kapak → yalnız küçültülür.
//  - E (şeffaf): gemini-esya.cjs ile beyaz zemin KENARDAN akıtılarak silinir (çizimin içindeki beyazlar kalır, kahve kontur
//    halesiz), kırpılır. Kartlar (kart-*) ortak tuvale ortalanır: üç kart aynı boy (Barış: "üç kart aynı boy, aynı çerçeve dışı boşluk").
//  - Fındık'ın pozları (findik, findik-*) ortak tuvalde tabandan hizalı: poz değişince Fındık yerinde kalır.
//  - Ön katmanlar (kovuk dudakları, pervaz) ayrı dosya değil: oyun sahnenin kendi resminden elips / şerit biçimiyle keser (dunya3.ts).
const { execFileSync } = require('child_process'), fs = require('fs'), os = require('os'), path = require('path');
const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const guvenliYaz = require('./guvenli-yaz.cjs');
const gi = process.argv.indexOf('--girdi');
const G = gi >= 0 ? process.argv.splice(gi, 2)[1] : 'ekip/gemini/yeni/dedektif3', O = 'assets/dedektif3', ARA = path.join(os.tmpdir(), 'dedektif3-kes');
const ATLA = []; // bilerek elle düzeltilen dosyalar (betik yeniden üretmesin)
const ARKA = /^(otobus-ic|otobus-yani|agac|kiler-ic)(-dikey)?$|^roman-\d$|^kapak$/;
/** çıktının uzun kenarı (px) */
const EN = (ad) => (/^(otobus|agac|kiler)/.test(ad) ? 4096 : /^(roman|kapak)/.test(ad) ? 2048 : /^findik/.test(ad) ? 1280 : 1024);

if (!fs.existsSync(G)) {
  console.log(`Girdi klasörü yok: ${G} (Gemini bölüm B'yi çizince oraya PNG olarak konur)`);
  process.exit(0);
}
const secili = process.argv.slice(2);
const tum = fs.readdirSync(G).filter((f) => f.endsWith('.png')).map((f) => f.replace(/\.png$/, '')).filter((a) => !ATLA.includes(a) && (!secili.length || secili.includes(a)));
const kesilecek = tum.filter((a) => !ARKA.test(a));
const webp = (img) => img.webp({ quality: 94, alphaQuality: 100, effort: 5 }).toBuffer();
async function yaz(ad, buf) {
  const m = await s(buf).metadata();
  if (await guvenliYaz(path.join(O, ad + '.webp'), buf)) console.log(`${ad}: ${m.width}x${m.height}, ${Math.round(buf.length / 1024)} KB`);
}
const kucult = (img, m, n) => (Math.max(m.width, m.height) > n ? img.resize(m.width >= m.height ? n : null, m.width >= m.height ? null : n, { kernel: 'lanczos3' }) : img);

(async () => {
  fs.mkdirSync(O, { recursive: true });
  // 1) arka planlar (zemin kalır)
  for (const ad of tum.filter((a) => ARKA.test(a))) {
    const img = s(path.join(G, ad + '.png')).removeAlpha(), m = await img.metadata();
    await yaz(ad, await kucult(img, m, EN(ad)).webp({ quality: 90, effort: 5 }).toBuffer());
  }
  if (!kesilecek.length) return;
  // 2) şeffaf kesim (tam çözünürlük, ara klasöre)
  fs.rmSync(ARA, { recursive: true, force: true });
  execFileSync('node', [path.join(__dirname, 'gemini-esya.cjs'), '--girdi', G, '--cikti', ARA, '--max', '0', ...kesilecek], { stdio: 'inherit' });
  const kes = (ad) => fs.readFileSync(path.join(ARA, ad + '.webp'));
  /** ortak tuval (kare): ortalı ya da tabandan hizalı; ölçek korunur (Gemini'nin ölçeği) */
  async function ortak(adlar, hiza) {
    const p = await Promise.all(adlar.map(async (ad) => ({ ad, b: kes(ad), m: await s(kes(ad)).metadata() })));
    const T = Math.max(...p.map((x) => Math.max(x.m.width, x.m.height)));
    for (const x of p) {
      const t = await s({ create: { width: T, height: T, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
        .composite([{ input: x.b, left: Math.round((T - x.m.width) / 2), top: hiza === 'alt' ? T - x.m.height : Math.round((T - x.m.height) / 2) }])
        .png()
        .toBuffer();
      const n = Math.min(T, EN(x.ad));
      await yaz(x.ad, await webp(s(t).resize(n, n, { kernel: 'lanczos3' })));
    }
  }
  const kartlar = kesilecek.filter((a) => /^kart-/.test(a));
  const findik = kesilecek.filter((a) => /^findik(-(yanak|utangac|sarilma))?$/.test(a));
  if (kartlar.length) await ortak(kartlar, 'orta');
  if (findik.length) await ortak(findik, 'alt');
  // 3) geri kalanlar (ipuçları, kuyruk ucu, baykuş, palamut, palamut kurabiyesi): kırpılmış hâli
  for (const ad of kesilecek.filter((a) => !kartlar.includes(a) && !findik.includes(a))) {
    const b = kes(ad), m = await s(b).metadata();
    await yaz(ad, await webp(kucult(s(b), m, EN(ad))));
  }
})();
