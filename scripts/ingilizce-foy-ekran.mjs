// İngilizceye Merhaba · gezintinin aldığı ekran görüntülerinden adı verilenleri tek föyde dizer (toplu denetim için).
// Kullanım: node scripts/ingilizce-foy-ekran.mjs <tablet|telefon> <çıktı adı> <görüntü adı> [görüntü adı…]
import { chromium } from 'playwright';
import fs from 'node:fs';
const [cihaz, cikti, ...adlar] = process.argv.slice(2);
const veri = (ad) => 'data:image/png;base64,' + fs.readFileSync(`output/ingilizce/ekran/${cihaz}/${ad}.png`).toString('base64');
const t = await chromium.launch({ channel: 'chrome' });
const s = await t.newPage({ viewport: { width: 1600, height: 100 } });
await s.setContent(`<body style="margin:0;background:#333;font:13px sans-serif;color:#fff;display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:6px">${adlar.filter((ad) => fs.existsSync(`output/ingilizce/ekran/${cihaz}/${ad}.png`)).map((ad) => `<figure style="margin:0"><img src="${veri(ad)}" style="display:block;width:100%"><figcaption>${ad}</figcaption></figure>`).join('')}</body>`);
fs.mkdirSync('output/ingilizce/kontrol', { recursive: true });
await s.screenshot({ path: `output/ingilizce/kontrol/${cikti}.png`, fullPage: true });
await t.close();
