// Oyun kapakları: Astra'nın katmanlarından (assets/uygulama/oyun-kapaklari/katmanlar: <id>-sahne.svg + <id>-logo.svg)
// yeniden birleştirir. Barış 2026-11-10: yazılar daha büyük, gerekirse sağa taşsın. LOGO: genişlik (px) ve sol/üst.
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
const K = process.cwd().split(path.sep).join('/');
const kl = `${K}/assets/uygulama/oyun-kapaklari/katmanlar`;
const LOGO = JSON.parse(process.env.LOGO || '{}');
const ids = fs.readdirSync(kl).filter(f => f.endsWith('-sahne.svg')).map(f => f.replace('-sahne.svg', ''));
const t = await chromium.launch({ channel: 'msedge' });
const s = await t.newPage({ viewport: { width: 1280, height: 720 } });
for (const id of ids) {
  const l = LOGO[id] ?? LOGO['*'] ?? { en: 620, sol: 34, orta: 300 };
  const html = path.join(process.env.CIKIS, id + '-oyun.html');
  fs.writeFileSync(html, `<!doctype html><style>html,body{margin:0;width:1280px;height:720px;overflow:hidden;background:${process.env.ZEMIN || 'transparent'}}
  img{position:absolute}.s{left:0;top:0;width:1280px;height:720px;object-fit:cover}
  .l{left:${l.sol}px;top:${l.orta}px;width:${l.en}px;transform:translateY(-50%);filter:${[[7,0],[-7,0],[0,7],[0,-7],[5,5],[-5,5],[5,-5],[-5,-5]].map(([x,y])=>`drop-shadow(${x}px ${y}px 0 #fff)`).join(' ')} drop-shadow(0 6px 0 rgba(0,0,0,.2))}</style>
  ${process.env.YALNIZ_LOGO ? '' : `<img class="s" src="file:///${kl}/${id}-sahne.svg">`}<img class="l" src="file:///${kl}/${id}-logo.svg">`);
  await s.goto('file:///' + html.split(path.sep).join('/'));
  await s.waitForTimeout(400);
  await s.screenshot({ path: path.join(process.env.CIKIS, id + '-oyun.png') });
}
await t.close();
console.log(ids.join(' '));
