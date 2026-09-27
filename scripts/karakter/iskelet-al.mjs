// Tasarımcının katmanlı karakter iskeletlerini (ekip/pazar-musteri/<ad>.svg + <ad>.json) oyun varlıklarına aktarır:
// assets/karakter-iskelet/<ad>.svg (olduğu gibi) ve <ad>.json (BOM'suz, sade). Standart: ekip/film/FILM-REHBERI.md §5.
// Ana karakterler kendi klasöründen gelir: ekip/kino/kino-final.svg + .json → kino.
// Çalıştırma: node scripts/karakter/iskelet-al.mjs
import fs from 'node:fs';
import path from 'node:path';

const KAYNAK = ['ekip/pazar-musteri', 'ekip/film/cizim'];
/** [klasör, dosya adı (uzantısız), iskelet adı] */
const ANA = [
  ['ekip/kino', 'kino-final', 'kino'],
  // Bebek Ege (Sesli Maceralar Bölüm 2): kafa, kol, bacak, göz, ağız, kaş katmanları
  ['ekip/ege', 'ege', 'ege'],
];
const HEDEF = 'assets/karakter-iskelet';
fs.mkdirSync(HEDEF, { recursive: true });

let n = 0;
function aktar(jsonYol, svg, ad) {
  if (!fs.existsSync(jsonYol) || !fs.existsSync(svg)) return;
  const bilgi = JSON.parse(fs.readFileSync(jsonYol, 'utf8').replace(/^﻿/, ''));
  if (!bilgi.donme || !bilgi.sira) return;
  const sade = { ad: bilgi.ad ?? ad, boyut: bilgi.boyut ?? 2048, sira: bilgi.sira, gizli: bilgi.gizli ?? [], bagli: bilgi.bagli ?? {}, donme: bilgi.donme };
  fs.writeFileSync(path.join(HEDEF, `${ad}.json`), JSON.stringify(sade, null, 2) + '\n');
  fs.copyFileSync(svg, path.join(HEDEF, `${ad}.svg`));
  console.log('✓', ad, `${sade.sira.length} katman`, `${Math.round(fs.statSync(svg).size / 1024)} KB`);
  n++;
}
for (const klasor of KAYNAK) {
  if (!fs.existsSync(klasor)) continue;
  for (const dosya of fs.readdirSync(klasor)) {
    if (!dosya.endsWith('.json')) continue;
    const ad = path.basename(dosya, '.json');
    aktar(path.join(klasor, dosya), path.join(klasor, `${ad}.svg`), ad);
  }
}
for (const [klasor, dosya, ad] of ANA) aktar(path.join(klasor, `${dosya}.json`), path.join(klasor, `${dosya}.svg`), ad);
console.log(n, 'iskelet aktarıldı →', HEDEF);
