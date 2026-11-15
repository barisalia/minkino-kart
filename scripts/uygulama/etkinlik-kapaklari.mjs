// Uygulamadaki altı etkinlik aynı bantlı kâğıt etiketi kullanır.
import { chromium } from 'playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const kapaklar = [
  ['matematik', 'Matematik Atölyesi', '#65c7b4', '#24534d', '#ffcca2', '#ebb185'],
  ['alfabe', 'Ceren ile Harf Atölyesi', '#ff997b', '#453054', '#e4d6fa', '#cab8e6'],
  ['hazirlik', 'Okula Hazırlanalım', '#ffb84d', '#173f37', '#bfe8da', '#98cebb'],
  ['kartlar', 'Bil Bakalım', '#9770d9', '#4a2a08', '#ffe08a', '#ecc267'],
  ['canlan', 'Çiz Canlansın', '#ff88b6', '#21462a', '#d6eda8', '#b1d484'],
  ['macera', 'Sesli Maceralar', '#63b4e6', '#5a1736', '#ffd0e2', '#ecadc9'],
];
const hedef = process.env.CIKIS || 'assets/uygulama/oyun-kapaklari';
const font = async (bolge) => (await readFile('node_modules/@fontsource/fredoka/files/fredoka-' + bolge + '-700-normal.woff2')).toString('base64');
const [latin, ek] = await Promise.all([font('latin'), font('latin-ext')]);
await mkdir(hedef, { recursive: true });
const browser = await chromium.launch(process.platform === 'win32' ? { channel: 'msedge' } : {});
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  for (const [id, ad, bant, renk, kagit, nokta] of kapaklar) {
    const kaynak = await readFile('assets/uygulama/etkinlik-resimleri/' + id + '.webp');
    await page.setContent(`<!doctype html><html lang="tr"><meta charset="utf-8"><style>
      @font-face{font-family:F;src:url(data:font/woff2;base64,${latin});font-weight:700}
      @font-face{font-family:G;src:url(data:font/woff2;base64,${ek});font-weight:700}
      *{box-sizing:border-box}body{margin:0;height:100vh;color:${renk};background-color:${kagit};
        background-image:radial-gradient(circle,${nokta} 5px,transparent 6px);
        background-position:11px 8px;background-size:53px 53px}
      img{position:absolute;width:92%;height:78%;left:4%;top:3%;object-fit:contain}
      .portre{height:85%;top:1%;object-position:center bottom}
      .etiket{position:absolute;bottom:21px;left:50%;transform:translateX(-50%) rotate(-1.5deg);
        white-space:nowrap;border:5px solid #30251f;border-radius:24px;background:#fffdf3;
        padding:8px 41px 12px;box-shadow:0 7px 0 #37282066;font:700 ${ad.length < 16 ? 92 : 80}px/1 F,G,sans-serif}
      .etiket:before,.etiket:after{content:'';position:absolute;top:-12px;width:80px;height:28px;
        background:${bant};border:3px solid #352920;border-radius:4px}
      .etiket:before{left:-27px;transform:rotate(-24deg)}.etiket:after{right:-27px;transform:rotate(24deg)}
      </style><img class="${id === 'alfabe' || id === 'hazirlik' ? 'portre' : ''}" src="data:image/webp;base64,${kaynak.toString('base64')}"><span class="etiket">${ad}</span></html>`);
    await page.evaluate(async () => { await document.fonts.ready; await document.images[0].decode(); });
    const png = await page.screenshot({ animations: 'disabled' });
    if (process.env.CIKIS) await writeFile(path.join(hedef, id + '.png'), png);
    else await sharp(png).webp({ quality: 94, smartSubsample: true }).toFile(path.join(hedef, id + '.webp'));
  }
} finally { await browser.close(); }
