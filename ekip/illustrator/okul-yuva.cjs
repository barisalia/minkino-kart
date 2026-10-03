// Okula Hazırım yuvaları: geçici ara klasör (os.tmpdir()/minkino-okul-gemini; Gemini kesitleri, serbest oran) → assets/okul/<ad>.webp tam yuva ölçüsünde (okul/src/cizim.ts GORSEL_YUVALARI).
// Oyun yerleşimi bu oranlarla kurulu (bazı görseller ok-esnek ile kutuya gerilir), bu yüzden tuval her zaman tam [en, boy]; çizim bozulmasın diye yalnız orantılı sığdırılır. Kip: alt (tabana ortalı) | sol (sola yaslı, dikeyde ortalı); hiçbir kipte germe/sıkıştırma yok.
// node okul-yuva.cjs [ad ...] [--onizle <klasör>]   (--onizle: assets/okul'a yazmaz, o klasöre yazar)
const fs = require('fs'), path = require('path'), os = require('os');
const ARA = process.env.OKUL_ARA || path.join(os.tmpdir(), 'minkino-okul-gemini');   // ara kesitler repo dışında
const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const YUVA = { // ad: [en, boy, hizalama, kenarBosluk %]. Çizim ASLA gerilmez/sıkıştırılmaz: oran korunarak yuvaya sığdırılır (contain), kalan yer şeffaf. alt = tabana ortalı, sol = sola yaslı + dikeyde ortalı
  agac: [768, 560, 'alt', 2], kurabiye: [256, 256, 'alt', 4], tabak: [512, 220, 'alt', 3], vagon: [300, 230, 'alt', 3], 'piknik-ortusu': [800, 340, 'alt', 2], dal: [1000, 140, 'sol', 3],
  istasyon: [360, 300, 'alt', 3], bahce: [400, 340, 'alt', 3], kule: [400, 380, 'alt', 3], kopru: [440, 300, 'alt', 3], okul: [420, 340, 'alt', 3], 'rozet-sayi': [300, 360, 'alt', 3], 'sayi-bloklari': [560, 260, 'alt', 3],
};
const arg = process.argv.slice(2), oi = arg.indexOf('--onizle'), cikti = oi >= 0 ? arg[oi + 1] : 'assets/okul', adlar = arg.filter((x, i) => !x.startsWith('--') && (oi < 0 || i !== oi + 1));
(async () => {
  fs.mkdirSync(cikti, { recursive: true });
  for (const ad of adlar.length ? adlar : Object.keys(YUVA)) {
    if (!YUVA[ad]) continue; const [W, H, kip, pay] = YUVA[ad]; const kaynak = path.join(ARA, ad + '.webp'); const m = await s(kaynak).metadata();
    const pw = Math.round(W * pay / 100), ph = Math.round(H * pay / 100), iw = W - 2 * pw, ih = H - 2 * ph;
    let buf, w, h;
    const k = Math.min(iw / m.width, ih / m.height); w = Math.round(m.width * k); h = Math.round(m.height * k); buf = await s(kaynak).resize(w, h, { kernel: 'lanczos3' }).png().toBuffer();
    const left = kip === 'sol' ? pw : Math.round((W - w) / 2), top = kip === 'alt' ? H - ph - h : Math.round((H - h) / 2);
    const out = await s({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([{ input: buf, left, top }]).webp({ quality: 94, alphaQuality: 100, effort: 5 }).toBuffer();
    fs.writeFileSync(path.join(cikti, ad + '.webp'), out); console.log(`${ad}: ${W}x${H} (${kip}; sanat ${w}x${h}), ${Math.round(out.length / 1024)} KB`);
  }
})();
