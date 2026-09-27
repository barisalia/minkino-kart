// Mino'nun YANDAN (profil) iskeletinden canlandırılabilir SVG üretir → src/mino/mino-profil-svg.ts
// Kaynak: Adobe'nin katmanlı çizimi ekip/mino/mino-profil.svg (+ dönme noktaları mino-profil.json).
// Her katman <g class="mp-<ad>"> olur; src/mino/mino-profil.ts her karede transform yazar.
// Çizim sağa bakar; sola yürürken dışarıdan aynalanır.
// Çalıştırma: node scripts/mino/profil.mjs
import fs from 'node:fs';

const KAYNAK = 'ekip/mino/mino-profil.svg';
const kaynak = fs.readFileSync(KAYNAK, 'utf8');
const bilgi = JSON.parse(fs.readFileSync('ekip/mino/mino-profil.json', 'utf8').replace(/^﻿/, ''));

/** Bir katmanın içi (en dıştaki <g id> etiketi hariç; katmanlar tek <image>) */
function katman(id) {
  const bas = kaynak.indexOf(`<g id="${id}"`);
  if (bas < 0) throw new Error(`Katman yok: ${id}`);
  const ic = kaynak.indexOf('>', bas) + 1;
  const son = kaynak.indexOf('</g>', ic);
  return kaynak.slice(ic, son).trim().replaceAll('xlink:href=', 'href=');
}

// Görünen alan: önden çizimle (mino-svg.ts, viewBox 344 140 1360 1790) aynı ölçü ve aynı ayak çizgisi; gövde ortada.
// Kuyruk sol kenardan taşar (overflow: visible).
// Ayak çizgisi: önden çizim 140'tan başlarken profilin eski taban çizgisi (1895) onunla hizalıydı; bacaklar
// yeniden çizilince yakın patinin tabanı TABAN'a indi (scripts/mino/pati-olc.mjs ölçer; yuruyus.ts ZEMIN ile aynı),
// görünen alan da o kadar aşağı kayar: yürürken patiler önden çizimin bastığı yere basar.
const TABAN = 1919;
const VIEWBOX = `400 ${140 + TABAN - 1895} 1360 1790`;
// Kalça kökleri ve kol arkası çizimde tam (tasarımcı): bacaklar ±25°, kollar ±25°, kulaklar ±10° döner, ek dolgu gerekmez.
const katmanlar = bilgi.sira
  .map((id) => `<g class="mp-${id}"${bilgi.gizli.includes(id) ? ' style="display:none"' : ''}>${katman(id)}</g>`)
  .join('\n');
const svg = `<svg class="mino-profil-svg" viewBox="${VIEWBOX}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<g class="mp-beden">
${katmanlar}
</g>
</svg>`;

fs.writeFileSync(
  'src/mino/mino-profil-svg.ts',
  `// Otomatik üretildi: node scripts/mino/profil.mjs (kaynak ${KAYNAK}) — elle düzenlemeyin.
// Mino'nun yandan iskeleti (gömülü WebP katmanlar, ağır): mino-profil.ts tembel yükler (import()).
export const MINO_PROFIL_SVG = ${JSON.stringify(svg)};
export const MINO_PROFIL_DONME: Record<string, [number, number]> = ${JSON.stringify(bilgi.donme)};
export const MINO_PROFIL_BAGLI: Record<string, string> = ${JSON.stringify(bilgi.bagli)};
`,
);
console.log('mino-profil-svg.ts', Math.round(svg.length / 1024), 'KB');
