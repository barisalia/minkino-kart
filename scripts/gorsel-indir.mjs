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

/** Kenarlardan başlayıp birbirine bağlı (neredeyse) beyaz pikselleri şeffaf yapar; çizgi kenarı yumuşak kalır. */
async function beyaziSil(girdi) {
  const { data, info } = await sharp(girdi).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const beyazMi = (i) => data[i * 4] > 232 && data[i * 4 + 1] > 232 && data[i * 4 + 2] > 232;
  const silindi = new Uint8Array(W * H);
  const kuyruk = new Int32Array(W * H);
  let bas = 0;
  let son = 0;
  const ekle = (i) => {
    if (!silindi[i] && beyazMi(i)) {
      silindi[i] = 1;
      kuyruk[son++] = i;
    }
  };
  for (let x = 0; x < W; x++) {
    ekle(x);
    ekle((H - 1) * W + x);
  }
  for (let y = 0; y < H; y++) {
    ekle(y * W);
    ekle(y * W + W - 1);
  }
  while (bas < son) {
    const i = kuyruk[bas++];
    const x = i % W;
    if (x > 0) ekle(i - 1);
    if (x < W - 1) ekle(i + 1);
    if (i >= W) ekle(i - W);
    if (i < W * (H - 1)) ekle(i + W);
  }
  for (let i = 0; i < W * H; i++) {
    if (silindi[i]) data[i * 4 + 3] = 0;
    else {
      // silinen alana komşu açık renkli kenar pikselleri yarı saydam (tırtık olmasın)
      const x = i % W;
      const komsu = (x > 0 && silindi[i - 1]) || (x < W - 1 && silindi[i + 1]) || (i >= W && silindi[i - W]) || (i < W * (H - 1) && silindi[i + W]);
      if (komsu) {
        const parlak = (data[i * 4] + data[i * 4 + 1] + data[i * 4 + 2]) / 3;
        if (parlak > 200) data[i * 4 + 3] = Math.round(255 * Math.max(0, (255 - parlak) / 55));
      }
    }
  }
  return sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
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
    if (anahtar.startsWith('sahne/') || anahtar.startsWith('orman/') || anahtar === 'pazar/arkaplan') {
      fs.mkdirSync(path.dirname(hedef), { recursive: true });
      const boy = anahtar.startsWith('orman/') || anahtar === 'pazar/arkaplan' ? 1024 : 768;
      await sharp(girdi).resize(boy, boy, { fit: 'cover' }).webp({ quality: 80, effort: 6 }).toFile(hedef);
      yeni++;
      console.log('✓', anahtar);
      continue;
    }
    // Çiz Canlansın, Uyuyan Orman ve Pazar nesneleri beyaz zeminde üretildi: kenardan bağlı beyazı şeffaf yap
    // (pazar/arkaplan yukarıdaki arka plan dalında ayrıldı, buraya gelmez)
    const kaynak = anahtar.startsWith('canlan/') || anahtar.startsWith('orman-karakter/') || anahtar.startsWith('orman-esya/') || anahtar.startsWith('pazar/') ? await beyaziSil(girdi) : girdi;
    const kirpik = await sharp(kaynak).ensureAlpha().trim({ threshold: 8 }).toBuffer();
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
