// Mağaza ekran görüntüleri: ham oyun görüntüsünü çerçeveli telefon/tablet içine koyar, üste başlık yazar, ekran-cerceve.png zemininde.
// Girdi:  assets/uygulama/ekran-ham/telefon/NN-*.webp|png (dikey, ≈390x844 oranı) ve assets/uygulama/ekran-ham/tablet/NN-*.webp|png (≈3:4). NN = 01..06, ekip/uygulama/MAGAZA-METINLERI.md bölüm 6 sırası.
// Başlıklar: MAGAZA-METINLERI.md bölüm 6 tablosundan okunur (Türkçe ve English). Çıktı: assets/uygulama/magaza-ekranlari/{tr,en}/{iphone-1290x2796,ipad-2048x2732,android-1080x1920}/NN.jpg
// node magaza-ekran.cjs [tr|en] [iphone|ipad|android] [NN ...]   (verilmezse hepsi)
const fs = require('fs'), path = require('path');
const { chromium } = require(require.resolve('playwright', { paths: [process.cwd()] }));
const sharp = require(require.resolve('sharp', { paths: [process.cwd()] }));
const HAM = 'assets/uygulama/ekran-ham/', CIKTI = 'assets/uygulama/magaza-ekranlari/', ZEMIN = path.resolve('assets/uygulama/ekran-cerceve.png');
const KONTUR = '#5a3617';
const BOYUT = { iphone: { W: 1290, H: 2796, ham: 'telefon', ad: 'iphone-1290x2796' }, ipad: { W: 2048, H: 2732, ham: 'tablet', ad: 'ipad-2048x2732' }, android: { W: 1080, H: 1920, ham: 'telefon', ad: 'android-1080x1920' } };

function basliklar() {
  const md = fs.readFileSync('ekip/uygulama/MAGAZA-METINLERI.md', 'utf8'); const b = md.indexOf('## 6. Ekran görüntüsü başlıkları'); const son = md.indexOf('\n---', b);
  const r = {}; for (const satir of md.slice(b, son).split('\n')) { const m = satir.match(/^\|\s*(\d+)\s*\|[^|]*\|\s*\*\*(.+?)\*\*\s*\|\s*\*\*(.+?)\*\*\s*\|/); if (m) r[m[1].padStart(2, '0')] = { tr: m[2], en: m[3] }; }
  return r;
}
const hamBul = (tur, nn) => { const d = HAM + tur + '/'; if (!fs.existsSync(d)) return null; const f = fs.readdirSync(d).find((x) => x.startsWith(nn + '-') && /\.(webp|png|jpe?g)$/i.test(x)); return f ? path.resolve(d + f) : null; };
const dataUrl = (yol) => `data:image/${path.extname(yol).slice(1).replace('jpg', 'jpeg')};base64,${fs.readFileSync(yol).toString('base64')}`;

// yerleşim: başlık üstte (en fazla 2 satır), çerçeve kalan alana sığar
function yerlesim(k, W, H, ham) {
  const tablet = k === 'ipad', a = ham.w / ham.h;
  const fs_ = Math.round(W * (tablet ? 0.056 : 0.078)), ust = Math.round(H * 0.05), baslikH = Math.round(fs_ * 1.12 * 2);
  const cihazUst = ust + baslikH + Math.round(H * 0.028), altBos = Math.round(H * 0.04);
  const mevH = H - cihazUst - altBos, mevW = Math.round(W * (tablet ? 0.88 : 0.86)), b = Math.round(mevW * (tablet ? 0.026 : 0.03));
  const ih = Math.min(mevH - 2 * b, Math.round((mevW - 2 * b) / a)), iw = Math.round(ih * a), cw = iw + 2 * b, ch = ih + 2 * b;
  return { fs: fs_, ust, baslikH, cw, ch, b, iw, ih, sol: Math.round((W - cw) / 2), top: cihazUst + Math.round((mevH - ch) / 2), r: Math.round(cw * (tablet ? 0.045 : 0.13)) };
}

(async () => {
  const arg = process.argv.slice(2), diller = arg.filter((x) => ['tr', 'en'].includes(x)), cihazlar = arg.filter((x) => BOYUT[x]), nnler = arg.filter((x) => /^\d\d$/.test(x));
  const B = basliklar(); const hepsi = Object.keys(B).sort();
  const br = await chromium.launch(), pg = await br.newPage({ viewport: { width: 1290, height: 2796 } });
  const zeminUrl = dataUrl(ZEMIN); let n = 0;
  for (const dil of diller.length ? diller : ['tr', 'en']) for (const k of cihazlar.length ? cihazlar : Object.keys(BOYUT)) for (const nn of nnler.length ? nnler : hepsi) {
    const { W, H, ham: tur, ad } = BOYUT[k], yol = hamBul(tur, nn); if (!yol) { console.log(`atlandı: ${tur}/${nn}-* yok`); continue; }
    const m = await sharp(yol).metadata(), y = yerlesim(k, W, H, { w: m.width, h: m.height }), baslik = (B[nn] || { tr: '', en: '' })[dil];
    await pg.setViewportSize({ width: W, height: H });
    await pg.setContent(`<body style="margin:0;width:${W}px;height:${H}px;overflow:hidden;position:relative;background:url(${zeminUrl}) center/cover no-repeat">
      <div id="b" style="position:absolute;left:${Math.round(W * 0.05)}px;right:${Math.round(W * 0.05)}px;top:${y.ust}px;height:${y.baslikH}px;display:flex;align-items:center;justify-content:center;text-align:center;font:700 ${y.fs}px 'Fredoka',ui-rounded,'Arial Rounded MT Bold',system-ui,sans-serif;line-height:1.08;color:${KONTUR};-webkit-text-stroke:${Math.round(y.fs * 0.16)}px #fff;paint-order:stroke fill;text-shadow:0 ${Math.round(y.fs * 0.06)}px 0 rgba(90,54,23,.22)"><span id="t">${baslik}</span></div>
      <div style="position:absolute;left:${y.sol}px;top:${y.top}px;width:${y.cw}px;height:${y.ch}px;box-sizing:border-box;padding:${y.b}px;border-radius:${y.r}px;background:#2b1a10;border:${Math.max(4, Math.round(y.cw * 0.006))}px solid ${KONTUR};box-shadow:0 ${Math.round(H * 0.012)}px ${Math.round(H * 0.03)}px rgba(60,35,10,.38)">
        <img src="${dataUrl(yol)}" style="display:block;width:${y.iw}px;height:${y.ih}px;border-radius:${Math.max(6, y.r - y.b)}px;object-fit:cover"></div>`);
    await pg.waitForTimeout(250);
    // başlık taşarsa küçült
    await pg.evaluate(() => { const b = document.getElementById('b'), t = document.getElementById('t'); let f = parseFloat(getComputedStyle(b).fontSize); while ((t.getBoundingClientRect().height > b.clientHeight + 2 || t.scrollWidth > b.clientWidth) && f > 20) { f -= 3; b.style.fontSize = f + 'px'; b.style.webkitTextStrokeWidth = Math.round(f * 0.16) + 'px'; } });
    const png = await pg.screenshot({ type: 'png' }); const cikti = path.join(CIKTI, dil, ad, nn + '.jpg'); fs.mkdirSync(path.dirname(cikti), { recursive: true });
    await sharp(png).removeAlpha().jpeg({ quality: 92, mozjpeg: true }).toFile(cikti); n++; console.log(cikti, `${W}x${H}`);
  }
  await br.close(); console.log('üretilen', n);
})();
