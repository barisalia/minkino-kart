// Tasarımcının katmanlı karakter iskeletlerini (ekip/pazar-musteri/<ad>.svg + <ad>.json) oyun varlıklarına aktarır:
// assets/karakter-iskelet/<ad>.svg (olduğu gibi) ve <ad>.json (BOM'suz, sade). Standart: ekip/film/FILM-REHBERI.md §5.
// Çalıştırma: node scripts/karakter/iskelet-al.mjs
import fs from 'node:fs';
import path from 'node:path';

const KAYNAK = ['ekip/pazar-musteri', 'ekip/film/cizim'];
const HEDEF = 'assets/karakter-iskelet';
fs.mkdirSync(HEDEF, { recursive: true });

let n = 0;
for (const klasor of KAYNAK) {
  if (!fs.existsSync(klasor)) continue;
  for (const dosya of fs.readdirSync(klasor)) {
    if (!dosya.endsWith('.json')) continue;
    const ad = path.basename(dosya, '.json');
    const svg = path.join(klasor, `${ad}.svg`);
    if (!fs.existsSync(svg)) continue;
    const bilgi = JSON.parse(fs.readFileSync(path.join(klasor, dosya), 'utf8').replace(/^﻿/, ''));
    if (!bilgi.donme || !bilgi.sira) continue;
    const sade = { ad: bilgi.ad ?? ad, boyut: bilgi.boyut ?? 2048, sira: bilgi.sira, gizli: bilgi.gizli ?? [], bagli: bilgi.bagli ?? {}, donme: bilgi.donme };
    fs.writeFileSync(path.join(HEDEF, `${ad}.json`), JSON.stringify(sade, null, 2) + '\n');
    fs.copyFileSync(svg, path.join(HEDEF, `${ad}.svg`));
    console.log('✓', ad, `${sade.sira.length} katman`, `${Math.round(fs.statSync(svg).size / 1024)} KB`);
    n++;
  }
}
console.log(n, 'iskelet aktarıldı →', HEDEF);
