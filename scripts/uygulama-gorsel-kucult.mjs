// Uygulama paketini küçültür: derlenmiş klasördeki (dist) WebP çizimlerini kalite 85'e indirir. Kaynak çizimlere
// (assets/, public/) dokunmaz; yalnız `npm run build:app` çıktısını değiştirir.
//
// - Astra'nın çizimleri neredeyse kayıpsız kaydedildiği için kalite 85'te dosya yaklaşık yarıya iner; düz renkli,
//   konturlu çizimlerde göz farkı yoktur (ekip/uygulama/gorsel-karsilastirma/).
// - Saydam alan (alfa) kayıpsız kalır; hareketli (çok kareli) WebP'ler ve 20 KB altı dosyalar olduğu gibi kalır.
// - Küçülmeyen (yeni dosya %80'den büyükse) çizim eskisiyle kalır. sharp yoksa uyarır, derlemeyi durdurmaz.
//
// Kullanım: node scripts/uygulama-gorsel-kucult.mjs [klasör=dist]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const klasor = process.argv[2] ?? 'dist';
const KALITE = 85;
const EN_AZ = 20 * 1024;

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.warn('uygulama-gorsel-kucult: sharp bulunamadı, çizimler olduğu gibi kaldı.');
  process.exit(0);
}
if (!fs.existsSync(klasor)) {
  console.warn(`uygulama-gorsel-kucult: ${klasor} yok.`);
  process.exit(0);
}
sharp.concurrency(1);

const dosyalar = [];
(function gez(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const y = path.join(d, e.name);
    if (e.isDirectory()) gez(y);
    else if (e.name.toLowerCase().endsWith('.webp')) dosyalar.push(y);
  }
})(klasor);

let once = 0;
let sonra = 0;
let kucultulen = 0;
async function isle(y) {
  const boy = fs.statSync(y).size;
  once += boy;
  try {
    if (boy < EN_AZ) throw 0;
    const girdi = fs.readFileSync(y);
    const bilgi = await sharp(girdi).metadata();
    if ((bilgi.pages ?? 1) > 1) throw 0;
    const yeni = await sharp(girdi).webp({ quality: KALITE, alphaQuality: 100, effort: 4, smartSubsample: true }).toBuffer();
    if (yeni.length > 0 && yeni.length < boy * 0.8) {
      fs.writeFileSync(y, yeni);
      sonra += yeni.length;
      kucultulen++;
      return;
    }
  } catch {
    /* bu çizim eskisiyle kalır */
  }
  sonra += boy;
}

const esZaman = Math.max(2, (os.cpus()?.length ?? 4) - 1);
let sira = 0;
await Promise.all(
  Array.from({ length: esZaman }, async () => {
    while (sira < dosyalar.length) await isle(dosyalar[sira++]);
  }),
);
const mb = (n) => (n / 1e6).toFixed(1);
console.log(
  `uygulama-gorsel-kucult: ${dosyalar.length} çizim, ${kucultulen} küçüldü; ${mb(once)} MB → ${mb(sonra)} MB (${mb(once - sonra)} MB kazanç)`,
);
