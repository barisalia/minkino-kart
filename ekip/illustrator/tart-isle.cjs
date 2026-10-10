// Gemini "Tart Bakalım" seti (IS-LISTESI-YENI.md Ek B; ekip/gemini/yeni/pazar/*.png) → assets/pazar/<ad>.webp.
//   node ekip/illustrator/tart-isle.cjs   (repo kökünden)
// - Zemin gemini-esya.cjs ile KENARDAN akıtılarak silinir (içteki beyazlar kalır, halesiz), kırpılır.
// - domates-curuk: sağlam domatesin (assets/meyveler/domates.webp) kare tuvalindeki yerine oturtulur (aynı en, aynı taban):
//   oyunda sağlam ve çürük domates yan yana aynı boyda durur.
// - kompost ve kompost-kapak: kırpılmış hâli (kapağın gövdeye oturuşu tart.css'te: .tb-kompost.tb-resimli).
// Güvenli: daha büyük mevcut dosya ezilmez (guvenli-yaz.cjs; ZORLA=1 ile ezilir).
const { execFileSync } = require('child_process'), fs = require('fs'), os = require('os'), path = require('path');
const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const guvenliYaz = require('./guvenli-yaz.cjs');
const G = 'ekip/gemini/yeni/pazar', O = 'assets/pazar', ARA = path.join(os.tmpdir(), 'tart-kes');
const ADLAR = ['domates-curuk', 'kompost', 'kompost-kapak'].filter((a) => fs.existsSync(path.join(G, a + '.png')));
if (!ADLAR.length) {
  console.log(`Girdi yok: ${G}/{domates-curuk,kompost,kompost-kapak}.png`);
  process.exit(0);
}
const webp = (img) => img.webp({ quality: 94, alphaQuality: 100, effort: 5 }).toBuffer();
/** alfa kutusu (oran) */
async function kutu(yol) {
  const { data, info } = await s(yol).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let x0 = info.width, y0 = info.height, x1 = -1, y1 = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) if (data[(y * info.width + x) * 4 + 3] > 40) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  return { x0: x0 / info.width, y0: y0 / info.height, x1: (x1 + 1) / info.width, y1: (y1 + 1) / info.height };
}
async function yaz(ad, buf) {
  const m = await s(buf).metadata();
  if (await guvenliYaz(path.join(O, ad + '.webp'), buf)) console.log(`${ad}: ${m.width}x${m.height}, ${Math.round(buf.length / 1024)} KB`);
}
(async () => {
  fs.rmSync(ARA, { recursive: true, force: true });
  execFileSync('node', [path.join(__dirname, 'gemini-esya.cjs'), '--girdi', G, '--cikti', ARA, '--max', '1024', ...ADLAR], { stdio: 'inherit' });
  for (const ad of ADLAR) {
    const b = fs.readFileSync(path.join(ARA, ad + '.webp'));
    if (ad !== 'domates-curuk') { await yaz(ad, await webp(s(b))); continue; }
    // sağlam domatesin çerçevesi: aynı en, aynı taban, yatayda aynı orta
    const N = 1024, k = await kutu('assets/meyveler/domates.webp'), m = await s(b).metadata();
    const w = Math.round((k.x1 - k.x0) * N), h = Math.round((w * m.height) / m.width);
    const ic = await s(b).resize(w, h, { kernel: 'lanczos3' }).png().toBuffer();
    const sol = Math.round(((k.x0 + k.x1) / 2) * N - w / 2), ust = Math.max(0, Math.round(k.y1 * N) - h);
    const tuval = await s({ create: { width: N, height: N, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([{ input: ic, left: sol, top: ust }]).png().toBuffer();
    await yaz(ad, await webp(s(tuval)));
  }
})();
