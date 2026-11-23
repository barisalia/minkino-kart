// Uygulama paketini küçültür: derlenmiş klasördeki (dist) KONUŞMA kayıtlarını 128 kb/s tek kanaldan 64 kb/s tek
// kanala indirir. Kaynak dosyalara (assets/, public/) dokunmaz; yalnız `npm run build:app` çıktısını değiştirir.
//
// - Yalnız tek kanallı (mono) ve 96 kb/s üstü kayıtlar. Konuşma için 64 kb/s duyulur fark yaratmaz; boyut yarıya iner.
// - Şarkı, müzik, ninni, tekerleme, efekt ve gösteri müzikleri DOKUNULMADAN kalır (ad ve klasörüne göre).
// - Harf Atölyesi'nin sesli adımı kayıtlara değil önceden çıkarılmış tabloya bakar (alfabe/src/ses-modelleri.json):
//   etkilenmez.
// - Küçülmeyen (yeni dosya %80'den büyükse) kayıt eskisiyle kalır. ffmpeg yoksa uyarır, derlemeyi durdurmaz.
//
// Kullanım: node scripts/uygulama-ses-kucult.mjs [klasör=dist]
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const calistir = promisify(execFile);
const klasor = process.argv[2] ?? 'dist';
const HEDEF = '64k';
const ATLA = /muzik|music|sarki|şarkı|ninni|tekerleme|melodi|efekt|jingle|ritim|davul|gosteri|sozlu|sozsuz/i;

let ffmpeg;
try {
  ffmpeg = (await import('ffmpeg-static')).default;
} catch {
  ffmpeg = null;
}
if (!ffmpeg || !fs.existsSync(ffmpeg)) {
  console.warn('uygulama-ses-kucult: ffmpeg bulunamadı, kayıtlar olduğu gibi kaldı.');
  process.exit(0);
}
if (!fs.existsSync(klasor)) {
  console.warn(`uygulama-ses-kucult: ${klasor} yok.`);
  process.exit(0);
}

const dosyalar = [];
(function gez(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const y = path.join(d, e.name);
    if (e.isDirectory()) gez(y);
    else if (e.name.toLowerCase().endsWith('.mp3')) dosyalar.push(y);
  }
})(klasor);

async function bilgi(y) {
  // ffmpeg -i girdisiz çıktı vermeden hata koduyla döner; akış bilgisi stderr'dedir
  const r = await calistir(ffmpeg, ['-hide_banner', '-i', y], { windowsHide: true }).catch((e) => e);
  const m = /Audio: mp3, (\d+) Hz, (mono|stereo|[^,]+), [^,]+, (\d+) kb\/s/.exec(String(r.stderr ?? ''));
  return m ? { kanal: m[2], kbps: Number(m[3]) } : null;
}

let once = 0;
let sonra = 0;
let kucultulen = 0;
let atlanan = 0;
async function isle(y) {
  const boy = fs.statSync(y).size;
  once += boy;
  const b = ATLA.test(y.replace(/\\/g, '/')) ? null : await bilgi(y);
  if (!b || b.kanal !== 'mono' || b.kbps < 96) {
    sonra += boy;
    atlanan++;
    return;
  }
  const gecici = y + '.kucuk.mp3';
  try {
    await calistir(ffmpeg, ['-v', 'error', '-y', '-i', y, '-map_metadata', '-1', '-ac', '1', '-c:a', 'libmp3lame', '-b:a', HEDEF, gecici], {
      windowsHide: true,
    });
    const yeni = fs.statSync(gecici).size;
    if (yeni > 0 && yeni < boy * 0.8) {
      fs.renameSync(gecici, y);
      sonra += yeni;
      kucultulen++;
      return;
    }
  } catch {
    /* bu kayıt eskisiyle kalır */
  }
  fs.rmSync(gecici, { force: true });
  sonra += boy;
  atlanan++;
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
  `uygulama-ses-kucult: ${dosyalar.length} kayıt, ${kucultulen} küçüldü, ${atlanan} olduğu gibi; ${mb(once)} MB → ${mb(sonra)} MB (${mb(once - sonra)} MB kazanç)`,
);
