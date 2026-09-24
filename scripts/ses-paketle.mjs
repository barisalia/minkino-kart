// Tek dosyalık önizleme için: public/ses/*.mp3 → hedef/ses/paket-N.mp3 (en çok ~12 MB) + manifest (bayt aralıkları).
import fs from 'node:fs';
import path from 'node:path';

const hedef = process.argv[2] ?? 'dist-tek';
const m = JSON.parse(fs.readFileSync('public/ses/manifest.json', 'utf8'));
const SINIR = 12 * 1024 * 1024;
const ILK_SINIR = 1.5 * 1024 * 1024; // ilk paket küçük: arayüz cümleleri hemen hazır olsun
// Arayüz cümleleri (metinler.json + tema adları) öne
const oncelikli = new Set();
const metinler = JSON.parse(fs.readFileSync('content/metinler.json', 'utf8'));
for (const v of Object.values(metinler)) for (const c of [v].flat()) oncelikli.add(c.split('{')[0].trim().slice(0, 12));
const onde = (t) => [...oncelikli].some((o) => o && t.startsWith(o));
const sirali = Object.entries(m.dosyalar).sort((a, b) => Number(onde(b[0])) - Number(onde(a[0])));
const paketler = [];
const dosyalar = {};
const cache = new Map();
let parcalar = [];
let boy = 0;
const bitir = () => {
  if (!parcalar.length) return;
  const ad = `paket-${paketler.length}.mp3`;
  fs.mkdirSync(path.join(hedef, 'ses'), { recursive: true });
  fs.writeFileSync(path.join(hedef, 'ses', ad), Buffer.concat(parcalar));
  paketler.push(ad);
  parcalar = [];
  boy = 0;
};
for (const [metin, f] of sirali) {
  if (!cache.has(f)) {
    const b = fs.readFileSync(path.join('public/ses', f));
    if (boy + b.length > (paketler.length === 0 ? ILK_SINIR : SINIR)) bitir();
    cache.set(f, { p: paketler.length, b: boy, u: b.length });
    parcalar.push(b);
    boy += b.length;
  }
  dosyalar[metin] = cache.get(f);
}
bitir();
fs.writeFileSync(path.join(hedef, 'ses', 'manifest.json'), JSON.stringify({ ses_id: m.ses_id, model: m.model, paketler, dosyalar }));
console.log(paketler.length, 'paket', Object.keys(dosyalar).length, 'kayıt');
