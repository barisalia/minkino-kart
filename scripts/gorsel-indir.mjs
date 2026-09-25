// Recraft'ta üretilen görselleri indirir, kırpar ve 512x512 WebP olarak assets/ altına koyar.
// Kaynak: assets/recraft/*.json  →  { "hayvanlar/kedi": "https://img.recraft.ai/..." }
// Zaten var olan dosyalar atlanır. Kullanım: node scripts/gorsel-indir.mjs [--hepsi]
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const kok = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const klasor = path.join(kok, 'assets', 'recraft');
const hepsi = process.argv.includes('--hepsi');
const liste = {};
for (const f of fs.readdirSync(klasor).filter((f) => f.endsWith('.json'))) {
  Object.assign(liste, JSON.parse(fs.readFileSync(path.join(klasor, f), 'utf8')));
}

let yeni = 0;
let hata = 0;
for (const [anahtar, url] of Object.entries(liste)) {
  const hedef = path.join(kok, 'assets', `${anahtar}.webp`);
  // Karakter çizimlerinin vektör (SVG) asıllarını da sakla: animasyon için parçalara ayrılacak
  const kaynakSvg = path.join(kok, 'karakter-kaynak', `${path.basename(anahtar)}.svg`);
  const svgGerek = anahtar.startsWith('karakter/') && !fs.existsSync(kaynakSvg);
  if (!hepsi && fs.existsSync(hedef) && !svgGerek) continue;
  try {
    const yanit = await fetch(url);
    if (!yanit.ok) throw new Error(`HTTP ${yanit.status}`);
    const girdi = Buffer.from(await yanit.arrayBuffer());
    const tur = yanit.headers.get('content-type') ?? '';
    if (anahtar.startsWith('karakter/') && (tur.includes('svg') || girdi.subarray(0, 200).toString().includes('<svg'))) {
      fs.mkdirSync(path.dirname(kaynakSvg), { recursive: true });
      fs.writeFileSync(kaynakSvg, girdi);
      console.log('✓ svg', anahtar);
    }
    if (!hepsi && fs.existsSync(hedef)) continue;
    // Sahne arka planları: kırpmadan, kenardan kenara kare
    if (anahtar.startsWith('sahne/')) {
      fs.mkdirSync(path.dirname(hedef), { recursive: true });
      await sharp(girdi).resize(768, 768, { fit: 'cover' }).webp({ quality: 80, effort: 6 }).toFile(hedef);
      yeni++;
      console.log('✓', anahtar);
      continue;
    }
    const kirpik = await sharp(girdi).ensureAlpha().trim({ threshold: 8 }).toBuffer();
    fs.mkdirSync(path.dirname(hedef), { recursive: true });
    await sharp(kirpik)
      .resize(464, 464, { fit: 'inside' })
      .extend({ top: 24, bottom: 24, left: 24, right: 24, background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 82, alphaQuality: 90, effort: 6 })
      .toFile(hedef);
    yeni++;
    console.log('✓', anahtar);
  } catch (e) {
    hata++;
    console.error('✗', anahtar, e.message);
  }
}
console.log(`${yeni} yeni görsel, ${hata} hata, toplam ${Object.keys(liste).length}`);
