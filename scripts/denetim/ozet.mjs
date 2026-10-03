// gorsel-denetim.mjs çıktılarını (tests/screens/denetim-sonuc*.json) birleştirip özetler: her dosya için cihazlar
// arası en büyük ihtiyaç, büyütme ve en/boy bozulması; kaynak-bul.mjs çıktısı varsa repodaki yolu ve asıl çizimi.
//   node scripts/denetim/ozet.mjs [--hepsi] [--ekran onek] [--json]
import { existsSync, readdirSync, readFileSync } from 'node:fs';

const kayitlar = [];
const hatalar = [];
for (const f of readdirSync('tests/screens').filter((f) => /^denetim-sonuc.*\.json$/.test(f))) {
  const j = JSON.parse(readFileSync('tests/screens/' + f, 'utf8'));
  kayitlar.push(...j.kayitlar);
  hatalar.push(...j.hatalar);
}
const kaynak = existsSync('tests/screens/denetim-kaynak.json') ? JSON.parse(readFileSync('tests/screens/denetim-kaynak.json', 'utf8')) : {};
const hepsi = process.argv.includes('--hepsi');
const ei = process.argv.indexOf('--ekran');
const ekranOnek = ei > 0 ? process.argv[ei + 1] : '';
const YATAY = new Set(['iphone-yatay', 'ipad-yatay', 'android-tablet']);

const grup = new Map();
for (const k of kayitlar) {
  if (ekranOnek && !k.ekran.startsWith(ekranOnek)) continue;
  if (k.vektor || !k.nw) continue;
  const g =
    grup.get(k.src) ??
    { src: k.src, yol: kaynak[k.src]?.kaynak?.[0] ?? k.src, asil: kaynak[k.src]?.asil ?? [], tur: new Set(), ekranlar: new Set(), nw: k.nw, nh: k.nh, bayt: k.bayt, olcek: 0, olcekYatay: 0, bozulma: 0, gerekW: 0, gerekH: 0, gerekYatayW: 0, gerekYatayH: 0, alan: 0, enKotu: null, kural: new Set(), bozukOrnek: null, sinif: new Set() };
  g.tur.add(k.tur);
  g.ekranlar.add(k.ekran);
  g.kural.add(k.kural);
  if (k.sinif) g.sinif.add(String(k.sinif).slice(0, 60));
  g.gerekW = Math.max(g.gerekW, k.gerekW);
  g.gerekH = Math.max(g.gerekH, k.gerekH);
  if (YATAY.has(k.cihaz)) {
    g.gerekYatayW = Math.max(g.gerekYatayW, k.gerekW);
    g.gerekYatayH = Math.max(g.gerekYatayH, k.gerekH);
    g.olcekYatay = Math.max(g.olcekYatay, k.olcek);
  }
  g.alan = Math.max(g.alan, k.alanOran);
  if (k.olcek > g.olcek) {
    g.olcek = k.olcek;
    g.enKotu = `${k.ekran}/${k.cihaz}`;
  }
  if (k.bozulma > g.bozulma) {
    g.bozulma = k.bozulma;
    g.bozukOrnek = `${k.ekran}/${k.cihaz} ${k.kural} ${Math.round(k.dw)}x${Math.round(k.dh)}`;
  }
  grup.set(k.src, g);
}
const liste = [...grup.values()]
  .filter((g) => hepsi || g.olcek > 1.15 || g.bozulma > 0.03 || (g.alan > 0.3 && g.nw < 1200))
  .sort((a, b) => b.olcek * Math.sqrt(b.alan + 0.01) - a.olcek * Math.sqrt(a.alan + 0.01));
if (process.argv.includes('--json')) {
  console.log(JSON.stringify(liste.map((g) => ({ ...g, tur: [...g.tur], ekranlar: [...g.ekranlar], kural: [...g.kural], sinif: [...g.sinif] })), null, 1));
} else {
  for (const g of liste) {
    const bpp = g.bayt && g.nw ? ((g.bayt * 8) / (g.nw * g.nh)).toFixed(2) : '?';
    const asil = g.asil.map((a) => `${a.yol.replace(/^(\.\.[\\/])+/, '')} ${a.w}x${a.h}`).join(', ');
    console.log(
      [g.yol, `${g.nw}x${g.nh}`, `gerek ${g.gerekW}x${g.gerekH} (yatay ${g.gerekYatayW}x${g.gerekYatayH})`, `x${g.olcek} (yatay x${g.olcekYatay})`, `boz ${(g.bozulma * 100).toFixed(1)}%`, `alan ${g.alan}`, `bpp ${bpp}`, [...g.tur].join('/'), g.enKotu, [...g.ekranlar].join(','), [...g.kural].join('|'), g.bozukOrnek ?? '', [...g.sinif].slice(0, 3).join(' ; '), asil ? `ASIL: ${asil}` : ''].join(' · '),
    );
  }
  console.log(`\n${liste.length} dosya; hata: ${hatalar.length}`);
}
for (const h of hatalar) console.error('  ! ' + h);
