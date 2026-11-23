// İngilizceye Merhaba · denetim föyü: assets/ingilizce altına son N dakikada gelen çizimleri klasör klasör tek
// görüntüde dizer (uygulamanın krem kart zemini üstünde), ki teslimler toplu denetlenebilsin. Çizimlere dokunmaz;
// çıktı output/ingilizce/kontrol/foy-<klasör>-<no>.png. Kullanım: node scripts/ingilizce-foy.mjs [dakika=45]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const dakika = Number(process.argv[2] ?? 45);
const sinir = Date.now() - dakika * 60000;
const gruplar = new Map();
const gez = (d) => {
  for (const g of fs.readdirSync(d, { withFileTypes: true })) {
    const y = path.join(d, g.name);
    if (g.isDirectory()) gez(y);
    else if (g.name.endsWith('.webp') && fs.statSync(y).mtimeMs > sinir) {
      const k = path.basename(path.dirname(y));
      gruplar.set(k, [...(gruplar.get(k) ?? []), y.split(path.sep).join('/')]);
    }
  }
};
gez('assets/ingilizce');
fs.mkdirSync('output/ingilizce/kontrol', { recursive: true });
const t = await chromium.launch({ channel: 'chrome' });
for (const [ad, liste] of gruplar) {
  liste.sort();
  for (let i = 0; i < liste.length; i += 12) {
    const parca = liste.slice(i, i + 12);
    const s = await t.newPage({ viewport: { width: 1280, height: 100 } });
    const kutular = parca.map((y) => `<figure style="margin:0;border:1px solid #999"><img src="http://localhost:5173/${y}" style="display:block;width:100%;height:230px;object-fit:contain"><figcaption style="text-align:center">${y.split('/').slice(-2).join('/')}</figcaption></figure>`);
    await s.setContent(`<body style="margin:0;background:#fff8e9;font:14px sans-serif;display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:6px">${kutular.join('')}</body>`);
    await s.waitForLoadState('networkidle').catch(() => {});
    await s.screenshot({ path: `output/ingilizce/kontrol/foy-${ad}-${i / 12}.png`, fullPage: true });
    await s.close();
    console.log(`foy-${ad}-${i / 12}.png`, parca.length);
  }
}
await t.close();
