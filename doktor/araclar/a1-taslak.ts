/**
 * Paket Doktor-A1 için GEÇİCİ çizimler: yalnız geliştirme sunucusunda (?taslak) yeni aşamaların akışını ve spec'i
 * denemek için. Uygulamaya ve hiçbir gösterime girmez; çıktı output/doktor/vaka-taslak/ (git'te yok).
 *   npx vite-node doktor/araclar/a1-taslak.ts
 * Astra'nın çizimi assets/doktor/vaka/ içine gelince oyun onu kullanır; buradaki karşılığı okunmaz.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { A1, A1_DOSYALAR, A1_EK_DOSYALAR, A1_TUVAL } from '../src/vaka/a1';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const HEDEF = path.join(KOK, 'output/doktor/vaka-taslak');
fs.mkdirSync(HEDEF, { recursive: true });
const K = 'stroke="#2b2440" stroke-width="6"';
const renk = (ad: string): string => { let h = 0; for (const c of ad) h = (h * 31 + c.charCodeAt(0)) % 360; return `hsl(${h} 70% 78%)`; };
const etiket = (g: number, y: number, ad: string) => `<text x="${g / 2}" y="${y / 2}" font-family="sans-serif" font-size="${Math.max(14, Math.min(g, y) / 9)}" text-anchor="middle" fill="#2b2440">${ad}</text>`;
const svg = (g: number, y: number, ic: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="${g}" height="${y}">${ic}</svg>`;

function ciz(ad: string): string {
  const [g, y] = A1_TUVAL[ad];
  // fonlar: opak düz zemin ve sahnenin ana biçimleri
  if (ad === A1.lavaboFon) return svg(g, y, `<rect width="${g}" height="${y}" fill="#f6ead8"/><rect x="520" y="300" width="960" height="710" rx="120" fill="#fffdf6" ${K}/><rect x="900" y="30" width="200" height="270" rx="40" fill="#cfd6de" ${K}/><circle cx="300" cy="280" r="210" fill="#d9f1ff" ${K}/><rect x="1590" y="370" width="300" height="200" rx="40" fill="#c8f0dc" ${K}/>`);
  if (ad === A1.gogusFon) return svg(g, y, `<rect width="${g}" height="${y}" fill="#dccbfb"/><rect y="300" width="${g}" height="852" fill="#a9e6cc"/>`);
  if (ad === A1.defterFon) return svg(g, y, `<rect width="${g}" height="${y}" fill="#f3d9b8"/><rect x="180" y="120" width="820" height="900" rx="20" fill="#fffaf0" ${K}/><rect x="1050" y="120" width="820" height="900" rx="20" fill="#fffaf0" ${K}/><circle cx="590" cy="400" r="190" fill="#ffd9a8" ${K}/>${[410, 590, 770].map(x => `<circle cx="${x}" cy="780" r="85" fill="none" stroke="#2b2440" stroke-width="4" stroke-dasharray="12 10"/>`).join('')}`);
  // patiler: iki pati; çamurlu olanda lekeler; damla yalnız damlalar
  if (ad === A1.patiler.temiz || ad === A1.patiler.camurlu || ad === A1.patiler.goster || A1.ovma.includes(ad as never)) {
    const ov = A1.ovma.indexOf(ad as never);
    const merkez = ov >= 0 ? [[400 + (ov % 2) * 30, 300], [500 - (ov % 2) * 30, 300 + ((ov >> 1) % 2) * 30]] : [[300, 300], [600, 300]];
    let ic = merkez.map(([x, yy]) => `<rect x="${x - 70}" y="${yy + 60}" width="140" height="${700 - yy}" fill="#fff" ${K}/><circle cx="${x}" cy="${yy}" r="130" fill="#fff" ${K}/><circle cx="${x}" cy="${yy + 20}" r="50" fill="#f6b6c2" stroke="none"/>`).join('');
    if (ad === A1.patiler.camurlu) ic += [[250, 250], [340, 340], [300, 200], [560, 260], [650, 330], [600, 380]].map(([x, yy]) => `<ellipse cx="${x}" cy="${yy}" rx="46" ry="34" fill="#7a4a22"/>`).join('');
    if (ad === A1.patiler.goster) ic += `<path d="M120 200 l20 40 l40 20 l-40 20 l-20 40 l-20 -40 l-40 -20 l40 -20z M780 200 l20 40 l40 20 l-40 20 l-20 40 l-20 -40 l-40 -20 l40 -20z" fill="#ffe27a"/>`;
    return svg(g, y, ic + (ov >= 0 ? etiket(g, 1300, ad) : ''));
  }
  if (ad === A1.patiler.damla) return svg(g, y, Array.from({ length: 12 }, (_, i) => `<ellipse cx="${200 + (i % 6) * 100}" cy="${230 + Math.floor(i / 6) * 140 + (i % 2) * 30}" rx="16" ry="22" fill="#8fd3ff" stroke="#2b2440" stroke-width="3"/>`).join(''));
  // tam sahne, şeffaf katmanlar
  if (g === 2048 && y === 1152) {
    if (A1.sargiKat.includes(ad as never)) { const n = A1.sargiKat.indexOf(ad as never) + 1; return svg(g, y, `<rect x="560" y="432" width="${(446 * n) / 5}" height="236" rx="20" fill="#fffaf0" ${K}/>`); }
    if (A1.lavaboSu.includes(ad as never)) return svg(g, y, `<ellipse cx="1000" cy="860" rx="${300 + A1.lavaboSu.indexOf(ad as never) * 40}" ry="90" fill="#8fd3ff" opacity=".5"/>`);
    // Zıpzıp'ın gövdesi (göğüs sahnesi)
    return svg(g, y, `<ellipse cx="540" cy="330" rx="330" ry="270" fill="#f59a3a" ${K}/><rect x="700" y="${ad.endsWith('nefes-1') ? 400 : 420}" width="800" height="580" rx="120" fill="#19a8b8" ${K}/>${etiket(1080, 660, ad.replace('zipzip-gogus-', ''))}`);
  }
  // su: dikey akış (kareler arasında çizgi kayar)
  if (A1.suAkis.includes(ad as never)) { const k = A1.suAkis.indexOf(ad as never); return svg(g, y, `<rect x="30" width="80" height="${y}" fill="#8fd3ff"/>${[0, 1, 2, 3].map(i => `<rect x="60" y="${((i * 130 + k * 32) % 520)}" width="12" height="60" fill="#fff"/>`).join('')}`); }
  // diğerleri: adını taşıyan yuvarlak köşeli biçim (oran ve boy doğru)
  const yuvarlak = /cikartma|kalp|kabarcik|pamuk|damga-izi|parilti/.test(ad);
  return svg(g, y, (yuvarlak ? `<ellipse cx="${g / 2}" cy="${y / 2}" rx="${g * 0.42}" ry="${y * 0.42}" fill="${renk(ad)}" ${K}/>` : `<rect x="${g * 0.08}" y="${y * 0.08}" width="${g * 0.84}" height="${y * 0.84}" rx="${Math.min(g, y) * 0.16}" fill="${renk(ad)}" ${K}/>`) + etiket(g, y, ad));
}

let n = 0;
for (const ad of [...A1_DOSYALAR, ...A1_EK_DOSYALAR]) { await sharp(Buffer.from(ciz(ad))).png().toFile(path.join(HEDEF, ad + '.png')); n++; }
console.log('geçici çizim:', n, '→', path.relative(KOK, HEDEF));
