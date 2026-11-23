// Uygulama paketini küçültür: derlenmiş klasördeki (dist) KAYIPSIZ WebP çizimleri kalite 92 ile yeniden kodlar.
// Kaynak dosyalara (assets/) dokunmaz; yalnız `npm run build:app` çıktısını değiştirir (uygulama-ses-kucult.mjs ile aynı
// düzen). Barış, 23 Kasım 2026: "Çizim kalitesine asla ödün vermeyelim" → ölçü, ad ve saydamlık aynı kalır; kalite 92.
//
// - Yalnız kayıpsız (VP8L) ve hareketsiz WebP. Zaten kayıplı olanlar yeniden kodlanmaz (ikinci kez bozulmaz).
// - Saydamlık kayıpsız saklanır (alphaQuality 100) ve HER dosyada denetlenir: yeni dosyanın alfa kanalı eskisiyle piksel
//   piksel aynı değilse dosya olduğu gibi kalır. Böylece alfayla vuruş denetleyen kod (dokunma haritaları, kırpma kutuları)
//   aynı sonucu verir.
// - Rengi piksel piksel okuyan kodun dosyaları dışarıda kalır (aşağıda DISARIDA): Minik Doktor'un bütün çizimleri (çamur
//   maskesi, gölge, kenar uzatma) ve Matematik'in kenar rengi okunan büyük fonları (matematik/src/fon-tasma.ts).
//   Boyama şablonları PNG'dir (alfabe/boyama-resim), bu betik onlara hiç bakmaz.
// - Yeni dosya eskisinin %95'inden küçük değilse eski kalır. Ölçü değişirse eski kalır. Hata olursa eski kalır.
//
// Kullanım: node scripts/uygulama-resim-kucult.mjs [klasör=dist]
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const klasor = process.argv[2] ?? 'dist';
const KALITE = { quality: 92, alphaQuality: 100, effort: 5, smartSubsample: true };
/** Kaynak klasörü bunlardan biriyle başlayan çizimler yeniden kodlanmaz (rengi koddan okunanlar). */
const DISARIDA = [
  { onek: 'assets/doktor/', neden: 'Minik Doktor: çamur maskesi, gölge, kenar uzatma, mercek (getImageData)' },
  { onek: 'assets/matematik/', enAzEn: 1600, neden: 'Matematik fonları: kenar rengi okunur (fon-tasma.ts)' },
];

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.warn('uygulama-resim-kucult: sharp bulunamadı, çizimler olduğu gibi kaldı.');
  process.exit(0);
}
if (!fs.existsSync(klasor)) {
  console.warn(`uygulama-resim-kucult: ${klasor} yok.`);
  process.exit(0);
}
sharp.cache(false);

const md5 = (buf) => crypto.createHash('md5').update(buf).digest('hex');
/** WebP türü: 'kayipsiz' | 'kayipli' | 'hareketli' | null */
function webpTuru(b) {
  if (b.length < 16 || b.toString('latin1', 0, 4) !== 'RIFF' || b.toString('latin1', 8, 12) !== 'WEBP') return null;
  const ilk = b.toString('latin1', 12, 16);
  if (ilk === 'VP8L') return 'kayipsiz';
  if (ilk === 'VP8 ') return 'kayipli';
  if (ilk !== 'VP8X') return null;
  let i = 12;
  let kayipsiz = false;
  while (i + 8 <= b.length) {
    const ad = b.toString('latin1', i, i + 4);
    const n = b.readUInt32LE(i + 4);
    if (ad === 'ANIM' || ad === 'ANMF') return 'hareketli';
    if (ad === 'VP8L') kayipsiz = true;
    if (ad === 'VP8 ' || ad === 'VP8L') break;
    i += 8 + n + (n & 1);
  }
  return kayipsiz ? 'kayipsiz' : 'kayipli';
}

// Dışarıda kalacak kaynak dosyaların özetleri: derlemede ad değişir (ad-HASH.webp), içerik aynı kalır.
const disaridaOzet = new Map();
for (const d of DISARIDA) {
  const kok = d.onek.replace(/\/$/, '');
  if (!fs.existsSync(kok)) continue;
  (function gez(yol) {
    for (const e of fs.readdirSync(yol, { withFileTypes: true })) {
      const y = path.join(yol, e.name);
      if (e.isDirectory()) gez(y);
      else if (e.name.toLowerCase().endsWith('.webp')) disaridaOzet.set(md5(fs.readFileSync(y)), d);
    }
  })(kok);
}

const dosyalar = [];
(function gez(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const y = path.join(d, e.name);
    if (e.isDirectory()) gez(y);
    else if (e.name.toLowerCase().endsWith('.webp')) dosyalar.push(y);
  }
})(klasor);

const say = { kayipsiz: 0, kuculen: 0, disarida: 0, alfaFarkli: 0, kazancsiz: 0, hata: 0 };
let once = 0;
let sonra = 0;
const disaridaListe = [];

async function isle(y) {
  let eski;
  try {
    eski = fs.readFileSync(y);
  } catch {
    return;
  }
  if (webpTuru(eski) !== 'kayipsiz') return;
  say.kayipsiz++;
  once += eski.length;
  const kalsin = () => { sonra += eski.length; };
  try {
    const m = await sharp(eski).metadata();
    const d = disaridaOzet.get(md5(eski));
    if (d && (!d.enAzEn || Math.max(m.width, m.height) >= d.enAzEn)) {
      say.disarida++;
      disaridaListe.push(path.relative(klasor, y));
      return kalsin();
    }
    const yeni = await sharp(eski).webp(KALITE).toBuffer();
    if (yeni.length >= eski.length * 0.95) { say.kazancsiz++; return kalsin(); }
    const my = await sharp(yeni).metadata();
    if (my.width !== m.width || my.height !== m.height || !!my.hasAlpha !== !!m.hasAlpha) { say.hata++; return kalsin(); }
    if (m.hasAlpha) {
      const [a, b] = await Promise.all([sharp(eski).extractChannel('alpha').raw().toBuffer(), sharp(yeni).extractChannel('alpha').raw().toBuffer()]);
      if (!a.equals(b)) { say.alfaFarkli++; return kalsin(); }
    }
    fs.writeFileSync(y, yeni);
    say.kuculen++;
    sonra += yeni.length;
  } catch {
    say.hata++;
    kalsin();
  }
}

let sira = 0;
const isci = async () => { while (sira < dosyalar.length) await isle(dosyalar[sira++]); };
await Promise.all(Array.from({ length: Math.max(2, Math.min(8, os.cpus().length - 1)) }, isci));

const mb = (b) => (b / 1048576).toFixed(1);
console.log(
  `uygulama-resim-kucult: ${dosyalar.length} webp, ${say.kayipsiz} kayıpsız; ${say.kuculen} küçüldü, ${say.disarida} dışarıda (piksel okunan), ` +
    `${say.kazancsiz} kazançsız, ${say.alfaFarkli} alfası değişeceği için bırakıldı, ${say.hata} hata; ${mb(once)} MB → ${mb(sonra)} MB (${mb(once - sonra)} MB kazanç)`,
);
if (disaridaListe.length) fs.writeFileSync(path.join(os.tmpdir(), 'uygulama-resim-kucult-disarida.txt'), disaridaListe.join('\n'));
