// dist/assets içindeki karma adlı dosyayı (arka-uzak-BKIrYRzV.webp) repodaki kaynağına (içerik eşleşmesiyle) ve
// varsa daha büyük asıl çizimine (ekip/, karakter-kaynak/, ../minkino-film-gemini, ../gemini-kaynak) bağlar.
//   node scripts/denetim/kaynak-bul.mjs   → tests/screens/denetim-kaynak.json
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import sharp from 'sharp';

const md5 = (p) => createHash('md5').update(readFileSync(p)).digest('hex');
const RESIM = /\.(webp|png|jpe?g)$/i;

// repodaki izlenen resimler (içerik karması → yol)
const izlenen = execSync('git ls-files', { encoding: 'utf8', maxBuffer: 64 << 20 })
  .split('\n')
  .filter((f) => RESIM.test(f) && !f.startsWith('dist') && !f.startsWith('tests/'));
const karma = new Map();
for (const f of izlenen) {
  if (!existsSync(f)) continue;
  const h = md5(f);
  if (!karma.has(h)) karma.set(h, []);
  karma.get(h).push(f);
}

// asıl çizim klasörleri: ada göre
const ASIL_KOKLER = ['ekip', 'karakter-kaynak', '../../../../minkino-film-gemini', '../../../../gemini-kaynak', '../../../../minkino-parti-gemini/assets'];
const asil = new Map();
const tara = (d, derin = 0) => {
  if (derin > 6 || !existsSync(d)) return;
  for (const a of readdirSync(d)) {
    const p = join(d, a);
    let s;
    try {
      s = statSync(p);
    } catch {
      continue;
    }
    if (s.isDirectory()) {
      if (a === 'node_modules' || a.startsWith('.')) continue;
      tara(p, derin + 1);
    } else if (RESIM.test(a) || /\.(svg|ai)$/i.test(a)) {
      const ad = basename(a, extname(a)).replace(/-(\d|beyaz|on|temiz)$/, '');
      if (!asil.has(ad)) asil.set(ad, []);
      asil.get(ad).push(p);
    }
  }
};
for (const k of ASIL_KOKLER) tara(k);

const sonuc = {};
for (const f of readdirSync('dist/assets')) {
  if (!RESIM.test(f)) continue;
  const p = join('dist/assets', f);
  const kaynak = karma.get(md5(p)) ?? [];
  const ad = basename(f, extname(f)).replace(/-[A-Za-z0-9_-]{8}$/, '');
  const adaylar = [];
  for (const a of asil.get(ad) ?? []) {
    if (/\.(svg|ai)$/i.test(a)) adaylar.push({ yol: a, w: 'vektor', h: '' });
    else {
      try {
        const m = await sharp(a).metadata();
        adaylar.push({ yol: a, w: m.width, h: m.height });
      } catch {}
    }
  }
  sonuc['/assets/' + f] = { kaynak, asil: adaylar };
}
// gömülü (data:) resimler: base64 gövdesinin FNV-1a karması (gorsel-denetim.mjs ile aynı)
const fnv = (s) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
  return h.toString(16);
};
for (const f of izlenen) {
  if (!existsSync(f) || statSync(f).size > 4 << 20) continue;
  const k = 'data:' + fnv(readFileSync(f).toString('base64'));
  if (!sonuc[k]) sonuc[k] = { kaynak: [f], asil: [] };
}
writeFileSync('tests/screens/denetim-kaynak.json', JSON.stringify(sonuc, null, 1));
console.log(Object.keys(sonuc).length + ' dosya eşlendi');
