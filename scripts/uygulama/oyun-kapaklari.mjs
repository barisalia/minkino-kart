// Oyun kapakları: Astra'nın katmanlarından (assets/uygulama/oyun-kapaklari/katmanlar: <id>-sahne.svg + <id>-logo.svg)
// yeniden birleştirir. Barış 2026-11-10: yazılar daha büyük, gerekirse sağa taşsın. LOGO: genişlik (px) ve sol/üst.
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
const K = process.cwd().split(path.sep).join('/');
const kl = `${K}/assets/uygulama/oyun-kapaklari/katmanlar`;
const LOGO = JSON.parse(process.env.LOGO || '{}');
// Her kadrajın odağı farklı: yakınlaştırırken yüzleri ve oyun nesnesini içeride tut.
const kadrajlar = {
  sef: { en: 530, sol: 32, orta: 337, zoom: 1, odak: 'center' },
  pati: { en: 585, sol: 26, orta: 330, zoom: 1, odak: 'center' },
  pazar: { en: 450, sol: 25, orta: 170, zoom: 1, odak: 'center' },
  dedektif: { en: 665, sol: 38, orta: 220, zoom: 1.10, odak: '90% 76%' },
  giysin: { en: 455, sol: 25, orta: 175, zoom: 1, odak: 'center' },
  otobus: { en: 410, sol: 25, orta: 154, zoom: 1, odak: 'center' },
  'kino-ile-sen-sec': { en: 510, sol: 32, orta: 244, zoom: 1, odak: 'center' },
};
const ids = fs.readdirSync(kl).filter(f => f.endsWith('-sahne.svg')).map(f => f.replace('-sahne.svg', ''));
const t = await chromium.launch({ channel: 'msedge' });
const s = await t.newPage({ viewport: { width: 1280, height: 720 } });
for (const id of ids) {
  const l = { ...kadrajlar[id], ...(LOGO[id] ?? LOGO['*']) };
  const html = path.join(process.env.CIKIS, id + '-oyun.html');
  fs.writeFileSync(html, `<!doctype html><style>html,body{margin:0;width:1280px;height:720px;overflow:hidden;background:${process.env.ZEMIN || 'transparent'}}
  img{position:absolute}.s{left:0;top:0;width:1280px;height:720px;object-fit:cover;transform:scale(${l.zoom});transform-origin:${l.odak}}
  .l{left:${l.sol}px;top:${l.orta}px;width:${l.en}px;transform:translateY(-50%)}</style>
  ${process.env.YALNIZ_LOGO ? '' : `<img class="s" src="file:///${kl}/${id}-sahne.svg">`}<img class="l" src="file:///${kl}/${id}-logo.svg">`);
  await s.goto('file:///' + html.split(path.sep).join('/'));
  await s.waitForTimeout(400);
  await s.screenshot({ path: path.join(process.env.CIKIS, id + '-oyun.png') });
}
await t.close();
console.log(ids.join(' '));
