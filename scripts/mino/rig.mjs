// Mino'nun vektör çiziminden canlandırılabilir SVG üretir → src/mino/mino-svg.ts
// Kaynak: karakter-kaynak/mino-a.svg (Recraft pro vektör, 2026-09-26 onaylı tasarım).
// Her path sırası korunarak bir sınıf alır (k: kafa, g: gövde, q: kuyruk) ve CSS değişkenleriyle hareket eder.
// Tasarımcının katmanlı sürümü (ekip/mino/mino-final.svg) gelince: katman adları doğrudan k/g/q gruplarına eşlenir.
import fs from 'node:fs';
import { svgPathBbox } from 'svg-path-bbox';

const kaynak = fs.readFileSync('karakter-kaynak/mino-a.svg', 'utf8').replace(/<metadata>[\s\S]*?<\/metadata>/, '');
const defs = (kaynak.match(/<defs>[\s\S]*?<\/defs>/) ?? ['<defs></defs>'])[0];
const yollar = [...kaynak.matchAll(/<path\b([^>]*?)\/?>/g)].map((m) => m[1].replace(/\/\s*$/, ''));
const d = (i) => yollar[i].match(/\sd="([^"]+)"/)[1];
const kutu = (i) => svgPathBbox(d(i));

const ARKA = 0; // beyaz zemin
const KONTUR = 1; // dış kontur (bölgelere kırpılır)
const AGIZ_GIZLE = new Set([6, 7, 8]); // ağız çizgisi, iç ağız, dil: kod çizer
const GOZ_SOL = 14; // sol gözün dış çizgisi
const GOZ_SAG = 25; // sağ gözün dış çizgisi
const KUYRUK = new Set([63, 64, 65, 66]);
const KUYRUK_ANA = 63; // kuyruğun turuncu gövdesi: kalın koyu kenar çizgisi alır
const PATI_SAG = 94; // kuyruğun önündeki pati: maskede geri açılır, kenar çizgisi kalsın
const KENARLI = new Set([KUYRUK_ANA]);

// Dış kontur bölgeleri (viewBox 2048 koordinatları)
const BOLGE = {
  kafa: 'M0 0H2048V1185H1395V1236H0Z',
  govde: 'M0 1236H1395V1185H2048V2048H0Z',
};

const cikti = [];
yollar.forEach((a, i) => {
  if (i === ARKA) return;
  if (i === KONTUR) {
    // kuyruğun durduğu yerde dış kontur çizilmez (maske): kuyruğun kendi kenar çizgisi var, onunla birlikte döner
    cikti.push(`<path class="g" clip-path="url(#m-govde)" mask="url(#m-kuyruksuz)"${a}/>`);
    cikti.push(`<path class="k" clip-path="url(#m-kafa)" mask="url(#m-kuyruksuz)"${a}/>`);
    return;
  }
  if (AGIZ_GIZLE.has(i)) return;
  const [, , , y1] = kutu(i);
  const s = KUYRUK.has(i) ? 'q' : y1 <= 1236 ? 'k' : 'g';
  const kenar = KENARLI.has(i) ? ' stroke="rgb(58,18,16)" stroke-width="34" stroke-linejoin="round" paint-order="stroke"' : '';
  cikti.push(`<path class="${s}"${kenar}${a}/>`);
});

// Ağız: kod eski ölçülerde çizer; grup onu burnun altına taşır ve yeni çizime göre büyütür
const AGIZ = { x: 1024, y: 968, olcek: 1.45 };
const svg = `<svg class="mino-svg" viewBox="264 172 1552 1728" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
${defs.replace('</defs>', `
<clipPath id="m-kafa"><path d="${BOLGE.kafa}"/></clipPath>
<clipPath id="m-govde"><path d="${BOLGE.govde}"/></clipPath>
<mask id="m-kuyruksuz" maskUnits="userSpaceOnUse" x="0" y="0" width="2048" height="2048"><rect width="2048" height="2048" fill="#fff"/><path d="${d(KUYRUK_ANA)}" fill="#000" stroke="#000" stroke-width="44"/><path d="${d(PATI_SAG)}" fill="#fff" stroke="#fff" stroke-width="44"/></mask>
<clipPath id="m-goz-sol"><path d="${d(GOZ_SOL)}"/></clipPath>
<clipPath id="m-goz-sag"><path d="${d(GOZ_SAG)}"/></clipPath>
</defs>`)}
${cikti.join('\n')}
<g class="k" id="m-ust">
  <g class="m-yanak"><ellipse cx="717" cy="1017" rx="80" ry="38"/><ellipse cx="1321" cy="1015" rx="80" ry="38"/></g>
  <g clip-path="url(#m-goz-sol)"><g class="m-kapak" style="--oy:681px"><rect x="600" y="670" width="330" height="320"/></g></g>
  <g clip-path="url(#m-goz-sag)"><g class="m-kapak" style="--oy:710px"><rect x="1120" y="700" width="330" height="290"/></g></g>
  <g class="m-kapali-goz"><path d="M646 866Q766 930 886 866"/><path d="M1163 866Q1283 930 1403 866"/></g>
  <g class="m-mutlu-goz"><path d="M646 870Q766 770 886 870"/><path d="M1163 870Q1283 770 1403 870"/></g>
  <g class="m-agiz" transform="translate(${AGIZ.x} ${AGIZ.y}) scale(${AGIZ.olcek})"><path class="m-agiz-ic"/><path class="m-dil"/><path class="m-agiz-cizgi"/></g>
</g>
</svg>`;

fs.writeFileSync('src/mino/mino-svg.ts', `// Otomatik üretildi: node scripts/mino/rig.mjs — elle düzenlemeyin.\nexport const MINO_SVG = ${JSON.stringify(svg)};\n/** Ağzın çizimdeki yeri ve büyütmesi (mino.ts ağız konumu için) */\nexport const MINO_AGIZ = ${JSON.stringify(AGIZ)};\n`);
console.log('mino-svg.ts', Math.round(svg.length / 1024), 'KB,', cikti.length, 'path');
