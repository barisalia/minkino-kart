/**
 * Paket Doktor-Y2 (yeni) için GEÇİCİ çizimler: yalnız geliştirme sunucusunda (?taslak) "Mino'nun Kurabiyeli Dişleri"nin
 * akışını ve spec'i denemek için. Uygulamaya ve hiçbir gösterime girmez; çıktı output/doktor/dis-taslak/ (git'te yok).
 *   npx vite-node doktor/araclar/disler-taslak.ts
 * Astra'nın çizimi assets/doktor/dis/ içine gelince oyun onu kullanır; buradaki karşılığı okunmaz.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { AGIZ, DISLER, DISLER_DOSYALAR, OPAK, SIRA_DISI, TUVAL } from '../src/vaka-dis/veri';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const HEDEF = path.join(KOK, 'output/doktor/dis-taslak');
fs.mkdirSync(HEDEF, { recursive: true });
const K = 'stroke="#2b2440" stroke-width="6"';
const renk = (ad: string): string => { let h = 0; for (const c of ad) h = (h * 31 + c.charCodeAt(0)) % 360; return `hsl(${h} 70% 78%)`; };
const etiket = (x: number, y: number, boy: number, ad: string) => `<text x="${x}" y="${y}" font-family="sans-serif" font-size="${boy}" text-anchor="middle" fill="#2b2440">${ad}</text>`;
const svg = (g: number, y: number, ic: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="${g}" height="${y}">${ic}</svg>`;
const disler = (dolgu: string, ek = '') => [AGIZ.ust, AGIZ.alt].map(s => Array.from({ length: SIRA_DISI }, (_, i) => `<rect x="${s.sol + (s.g / SIRA_DISI) * i + 4}" y="${s.ust}" width="${s.g / SIRA_DISI - 8}" height="${s.y}" rx="18" fill="${dolgu}" ${K}/>`).join('')).join('') + ek;

function ciz(ad: string): string {
  const [g, y] = TUVAL[ad];
  if (OPAK.includes(ad)) return svg(g, y, `<rect width="${g}" height="${y}" fill="#dccbfb"/><rect y="640" width="${g}" height="512" fill="#a9e6cc"/><rect x="1430" y="440" width="600" height="200" rx="20" fill="#eafff4" ${K}/>`);
  if (ad === DISLER.disTemiz) return svg(g, y, disler('#ffffff'));
  if (ad === DISLER.disKirli) return svg(g, y, disler('#e9d27a'));
  if (ad === DISLER.disParlak) return svg(g, y, disler('#ffffff', `<path d="M660 600 l14 30 M900 600 l14 30 M1040 780 l12 26" stroke="#8fd3ff" stroke-width="8" fill="none"/>`));
  if ((Object.values(DISLER.bas) as string[]).includes(ad)) {
    // baş: turuncu elips; açık ağızlı pozlarda ağız boşluğu
    const acik = /acik|dil/.test(ad), sisik = /sisik/.test(ad);
    return svg(g, y, `<ellipse cx="860" cy="500" rx="540" ry="440" fill="#f59a3a" ${K}/>`
      + (sisik ? `<circle cx="${ad.endsWith('sag') ? 1220 : 500}" cy="640" r="150" fill="#ffd9a8" ${K}/>${ad.endsWith('sisik') ? `<circle cx="1220" cy="640" r="150" fill="#ffd9a8" ${K}/>` : ''}` : '')
      + (acik ? `<ellipse cx="860" cy="715" rx="290" ry="170" fill="#b0506a" ${K}/><ellipse cx="860" cy="${/dil/.test(ad) ? 790 : 745}" rx="110" ry="70" fill="#f6a0b4"/>` : `<path d="M700 720 q160 ${/gulen|poz/.test(ad) ? 120 : 20} 320 0" stroke="#2b2440" stroke-width="10" fill="${/gulen|poz/.test(ad) ? '#fff' : 'none'}"/>`)
      + etiket(860, 330, 54, ad.replace('mino-yakin-', '')));
  }
  const yuvarlak = /kirinti|baloncuk|kalp|halka|nota|kurabiye|parilti|kopuk|yansima|burun/.test(ad);
  return svg(g, y, (yuvarlak ? `<ellipse cx="${g / 2}" cy="${y / 2}" rx="${g * 0.4}" ry="${y * 0.4}" fill="${renk(ad)}" ${K}/>` : `<rect x="${g * 0.1}" y="${y * 0.08}" width="${g * 0.8}" height="${y * 0.84}" rx="${Math.min(g, y) * 0.16}" fill="${renk(ad)}" ${K}/>`)
    + etiket(g / 2, y / 2 + 6, Math.max(13, Math.min(g, y) / 9), ad));
}

let n = 0;
for (const ad of DISLER_DOSYALAR) { await sharp(Buffer.from(ciz(ad))).png().toFile(path.join(HEDEF, ad + '.png')); n++; }
console.log('geçici çizim:', n, '→', path.relative(KOK, HEDEF));
