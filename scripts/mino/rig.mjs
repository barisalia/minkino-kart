// Mino'nun vektör çiziminden canlandırılabilir SVG üretir → src/mino/mino-svg.ts
// Her path, sırası korunarak bir sınıf alır (k: kafa, g: gövde, q: kuyruk) ve CSS değişkenleriyle hareket eder.
import fs from 'node:fs';
import { grup, parcalar } from './sinifla.mjs';

const kaynak = fs.readFileSync('karakter-kaynak/kedi-3.svg', 'utf8').replace(/<metadata>[\s\S]*?<\/metadata>/, '');
const defs = kaynak.match(/<defs>[\s\S]*?<\/defs>/)[0];
const yollar = [...kaynak.matchAll(/<path\b([^>]*?)\/?>/g)].map((m) => m[1].replace(/\/\s*$/, ''));
const d = (i) => yollar[i].match(/\sd="([^"]+)"/)[1];

// Ağız: 62 (iç), 63 (dil) gizlenir; 61 (burun+ağız çizgisi) sadece burun kısmı kalacak şekilde kırpılır.
const AGIZ_GIZLE = new Set([62, 63]);
const AGIZ_CIZGI = 61;
const GOZ_SOL = 46; // sol gözün dış çizgisi
const GOZ_SAG = 3; // sağ gözün dış çizgisi

// Dış kontur (path 1) bölgelere kırpılır
const BOLGE = {
  kafa: 'M0 0H1075V850H1000V1150H0Z',
  kuyruk: 'M1000 850H1331V1165H1000Z',
  govde: 'M0 1150H1000V1165H1331V2048H0Z',
};

let govde = [];
const cikti = [];
yollar.forEach((a, i) => {
  const g = grup(parcalar[i]);
  if (g === 'sil') return;
  if (g === 'kontur') {
    cikti.push(`<path class="g" clip-path="url(#m-govde)"${a}/>`);
    cikti.push(`<path class="q" clip-path="url(#m-kuyruk)"${a}/>`);
    cikti.push(`<path class="k" clip-path="url(#m-kafa)"${a}/>`);
    return;
  }
  if (AGIZ_GIZLE.has(i)) return;
  if (i === AGIZ_CIZGI) {
    cikti.push(`<path class="k" clip-path="url(#m-burun)"${a}/>`);
    return;
  }
  const s = g === 'kafa' ? 'k' : g === 'kuyruk' ? 'q' : 'g';
  cikti.push(`<path class="${s}"${a}/>`);
});

const svg = `<svg class="mino-svg" viewBox="140 400 1180 1310" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
${defs.replace('</defs>', `
<clipPath id="m-kafa"><path d="${BOLGE.kafa}"/></clipPath>
<clipPath id="m-kuyruk"><path d="${BOLGE.kuyruk}"/></clipPath>
<clipPath id="m-govde"><path d="${BOLGE.govde}"/></clipPath>
<clipPath id="m-burun"><rect x="400" y="700" width="400" height="178"/></clipPath>
<clipPath id="m-goz-sol"><path d="${d(GOZ_SOL)}"/></clipPath>
<clipPath id="m-goz-sag"><path d="${d(GOZ_SAG)}"/></clipPath>
</defs>`)}
${cikti.join('\n')}
<g class="k" id="m-ust">
  <g class="m-yanak"><ellipse cx="300" cy="930" rx="60" ry="30"/><ellipse cx="870" cy="930" rx="60" ry="30"/></g>
  <g clip-path="url(#m-goz-sol)"><g class="m-kapak" style="--oy:638px"><rect x="260" y="600" width="250" height="300"/><path class="m-kirpik" d="M270 900H510"/></g></g>
  <g clip-path="url(#m-goz-sag)"><g class="m-kapak" style="--oy:659px"><rect x="640" y="600" width="270" height="300"/><path class="m-kirpik" d="M640 900H910"/></g></g>
  <g class="m-kapali-goz"><path d="M300 785Q385 835 470 785"/><path d="M690 775Q775 825 860 775"/></g>
  <g class="m-mutlu-goz"><path d="M300 770Q385 690 470 770"/><path d="M690 760Q775 680 860 760"/></g>
  <g class="m-agiz"><path class="m-agiz-ic"/><path class="m-dil"/><path class="m-agiz-cizgi"/></g>
</g>
</svg>`;

fs.writeFileSync('src/mino/mino-svg.ts', `// Otomatik üretildi: node scripts/mino/rig.mjs — elle düzenlemeyin.\nexport const MINO_SVG = ${JSON.stringify(svg)};\n`);
console.log('mino-svg.ts', Math.round(svg.length / 1024), 'KB,', cikti.length, 'path');
