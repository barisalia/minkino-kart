// Mağaza görselleri (YEDEK): Gemini'nin magaza\ resimleri gelmezse Mino ve Kino'nun kendi çizimlerinden üretilir.
// Çıktılar: public/ikon-1024.png (App Store/Play ikonu, alfasız), assets/uygulama/ikon-on.png + ikon-arka.png (Android uyarlanabilir 432x432, güvenli alan 264 px daire),
// assets/uygulama/splash.png (2732x2732 krem zemin: ikon + logo), assets/uygulama/one-cikan.png (Play öne çıkan 1024x500, sağda logo), assets/uygulama/ekran-cerceve.png (dikey 1290x2796 zemin).
// Alfasız (App Store/Play kuralı): ikon-1024, ikon-arka, splash, one-cikan, ekran-cerceve; ikon-on şeffaf (uyarlanabilir ön katman).
// Kaynak: ekip/mino/mino-final.png, ekip/kino/kino-final.png, assets/uygulama/logo-minkino-asil.png (Barış'ın verdiği asıl MINKINO logosu). node magaza-yedek.cjs
const fs = require('fs'), path = require('path');
const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const KREM = '#FFF4DD', KONTUR = '#5a3617';
const MINO = 'ekip/mino/mino-final.png', KINO = 'ekip/kino/kino-final.png', LOGO = 'assets/uygulama/logo-minkino-asil.png';
const yaz = async (buf, yol, alfasiz = false) => { if (alfasiz) buf = await s(buf).flatten({ background: KREM }).removeAlpha().png().toBuffer(); fs.mkdirSync(path.dirname(yol), { recursive: true }); fs.writeFileSync(yol, buf); console.log(yol, (await s(buf).metadata()).width + 'x' + (await s(buf).metadata()).height, Math.round(buf.length / 1024) + ' KB'); };
const svg = (w, h, govde) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${govde}</svg>`);
const bulut = (x, y, k, op = 1) => `<g transform="translate(${x} ${y}) scale(${k})" opacity="${op}"><ellipse cx="0" cy="0" rx="150" ry="62" fill="#fff"/><circle cx="-60" cy="-38" r="62" fill="#fff"/><circle cx="35" cy="-62" r="82" fill="#fff"/><circle cx="105" cy="-18" r="52" fill="#fff"/></g>`;
const gokyuzu = (w, h, ust = '#8FD0F8', alt = '#D9F1FF') => `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${ust}"/><stop offset="1" stop-color="${alt}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/>`;
const kirp = async (png, kutu) => s(png).extract({ left: kutu[0], top: kutu[1], width: kutu[2] - kutu[0], height: kutu[3] - kutu[1] }).png().toBuffer();
const { chromium } = require(require.resolve('playwright', { paths: [process.cwd()] }));
async function metin(satirlar, px) {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 400 } });
  await p.setContent(`<body style="margin:0;background:transparent"><div id="m" style="display:inline-block;padding:10px 14px;text-align:center;font:700 ${px}px 'Fredoka',ui-rounded,'Arial Rounded MT Bold',system-ui,sans-serif;line-height:1.12;color:${KONTUR}">${satirlar.join('<br>')}</div>`); await p.waitForTimeout(400);
  const kutu = await (await p.$('#m')).boundingBox(); const tmp = 'assets/uygulama/.metin.png'; await p.screenshot({ path: tmp, omitBackground: true, clip: kutu }); await b.close();
  const r = await s(tmp).png().toBuffer(); fs.unlinkSync(tmp); return r;
}
const oranla = async (buf, k) => { const m = await s(buf).metadata(); return s(buf).resize(Math.round(m.width * k), Math.round(m.height * k), { kernel: 'lanczos3' }).png().toBuffer(); };

(async () => {
  // karakter parçaları
  const minoKafa = await kirp(MINO, [380, 170, 1720, 1420]), kinoKafa = await kirp(KINO, [260, 180, 1740, 1450]);
  const minoTam = await s(MINO).trim().png().toBuffer(), kinoTam = await s(KINO).trim().png().toBuffer();
  const logoBuf = await s(LOGO).png().toBuffer();

  // ---- 1) İkon 1024: gökyüzü + iki bulut + Mino ve Kino (tepeden bakış: bahçe tepeciği önde)
  const ikonYap = async (boy = 1024) => {
    const k = boy / 1024; const M = await oranla(minoKafa, 0.47 * k), Kn = await oranla(kinoKafa, 0.41 * k);
    const mm = await s(M).metadata(), km = await s(Kn).metadata();
    const arka = svg(boy, boy, gokyuzu(boy, boy) + bulut(190 * k, 190 * k, 1.0 * k, 0.95) + bulut(850 * k, 130 * k, 0.75 * k, 0.9) +
      `<circle cx="${boy / 2}" cy="${boy * 0.52}" r="${boy * 0.42}" fill="#fff" opacity="0.28"/>`);
    const tepe = svg(boy, boy, `<path d="M-60,${1024 * k} L-60,${790 * k} C${200 * k},${700 * k} ${420 * k},${690 * k} ${560 * k},${735 * k} C${760 * k},${800 * k} ${900 * k},${705 * k} ${1090 * k},${745 * k} L${1090 * k},${1024 * k} Z" fill="#7FCB5A" stroke="#5FAE3E" stroke-width="${10 * k}"/>` +
      `<path d="M-60,${790 * k} C${200 * k},${700 * k} ${420 * k},${690 * k} ${560 * k},${735 * k} C${760 * k},${800 * k} ${900 * k},${705 * k} ${1090 * k},${745 * k}" fill="none" stroke="#A9E384" stroke-width="${16 * k}" stroke-linecap="round" transform="translate(0 ${12 * k})"/>`);
    return s(arka).composite([{ input: Kn, left: Math.round(boy - km.width), top: Math.round(262 * k) }, { input: M, left: Math.round(-4 * k), top: Math.round(188 * k) }, { input: tepe }]).flatten({ background: '#D9F1FF' }).png().toBuffer();
  };
  const ikon = await ikonYap(1024);
  await yaz(ikon, 'public/ikon-1024.png', true);

  // ---- 2) Android uyarlanabilir: arka = gökyüzü + bulutlar (432); ön = iki karakter (güvenli alan 264 px dairenin içinde, ~262 px genişlik) + tam genişlik tepecik (alt kesikleri örter)
  const A = 432; await yaz(await s(svg(A, A, gokyuzu(A, A) + bulut(100, 100, 0.5, 0.95) + bulut(350, 70, 0.4, 0.9) + `<circle cx="216" cy="216" r="150" fill="#fff" opacity="0.28"/>`)).png().toBuffer(), 'assets/uygulama/ikon-arka.png', true);
  {
    const BK = 1024, M = await oranla(minoKafa, 0.47), Kn = await oranla(kinoKafa, 0.41), km = await s(Kn).metadata();
    const duo = await s({ create: { width: BK, height: BK, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([{ input: Kn, left: BK - km.width, top: 262 }, { input: M, left: -4 > 0 ? -4 : 0, top: 188 }]).png().toBuffer();
    const { data, info } = await s(duo).raw().toBuffer({ resolveWithObject: true }); let x0 = BK, x1 = 0, y0 = BK, y1 = 0;
    for (let y = 0; y < BK; y++) for (let x = 0; x < BK; x++) if (data[(y * BK + x) * 4 + 3] > 20) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const kes = await s(duo).extract({ left: x0, top: y0, width: x1 - x0 + 1, height: Math.min(y1, 700) - y0 + 1 }).png().toBuffer();   // tepecik 700'de başlıyordu: üstü
    const hedefG = 215, ks = await s(kes).resize({ width: hedefG }).png().toBuffer(), km2 = await s(ks).metadata();
    const sol = Math.round((A - km2.width) / 2), ust = Math.round(A / 2 - km2.height / 2 - 14), tepeY = ust + km2.height - 14;
    const tepe = svg(A, A, `<path d="M-20,${A} L-20,${tepeY + 18} C80,${tepeY - 12} 170,${tepeY - 14} 240,${tepeY + 2} C320,${tepeY + 22} 380,${tepeY - 12} 460,${tepeY + 4} L460,${A} Z" fill="#7FCB5A" stroke="#5FAE3E" stroke-width="5"/><path d="M-20,${tepeY + 22} C80,${tepeY - 8} 170,${tepeY - 10} 240,${tepeY + 6} C320,${tepeY + 26} 380,${tepeY - 8} 460,${tepeY + 8}" fill="none" stroke="#A9E384" stroke-width="7" stroke-linecap="round"/>`);
    await yaz(await s({ create: { width: A, height: A, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([{ input: ks, left: sol, top: ust }, { input: tepe }]).png().toBuffer(), 'assets/uygulama/ikon-on.png');
  }

  // ---- 3) Splash 2732: krem zemin; yuvarlatılmış ikon (gölgeli) ortada, altında logo
  const S = 2732, ikBoy = 1200, ik = await s(ikon).resize(ikBoy, ikBoy).png().toBuffer();
  const maske = svg(ikBoy, ikBoy, `<rect width="${ikBoy}" height="${ikBoy}" rx="${ikBoy * 0.225}" fill="#fff"/>`);
  const ikYuv = await s(ik).ensureAlpha().composite([{ input: maske, blend: 'dest-in' }]).png().toBuffer();
  const golge = await s(svg(ikBoy + 120, ikBoy + 120, `<rect x="60" y="86" width="${ikBoy}" height="${ikBoy}" rx="${ikBoy * 0.225}" fill="#5a3617" opacity="0.22"/>`)).blur(26).png().toBuffer();
  const lg = await s(logoBuf).resize({ width: 1750 }).png().toBuffer(), lgm = await s(lg).metadata();
  const ikTop = Math.round((S - (ikBoy + 130 + 430)) / 2);
  await yaz(await s(svg(S, S, `<rect width="${S}" height="${S}" fill="${KREM}"/>`)).composite([{ input: golge, left: Math.round(S / 2 - (ikBoy + 120) / 2), top: ikTop - 60 }, { input: ikYuv, left: Math.round(S / 2 - ikBoy / 2), top: ikTop }, { input: lg, left: Math.round((S - lgm.width) / 2), top: ikTop + ikBoy + 130 }]).flatten({ background: KREM }).png().toBuffer(), 'assets/uygulama/splash.png', true);

  // ---- 4) Play öne çıkan 1024x500: menü gökyüzü; solda Mino ve Kino (boydan boya), sağda logo + slogan
  const W = 1024, H = 500;
  const zemin = svg(W, H, `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CBE6FB"/><stop offset="0.55" stop-color="#FFF4DD"/><stop offset="1" stop-color="#FFE0C2"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/>` +
    bulut(150, 90, 0.7, 0.95) + bulut(930, 60, 0.5, 0.85) + bulut(620, 430, 0.45, 0.5) +
    [...Array(26)].map((_, i) => { const x = (i * 197) % W, y = (i * 113) % H; return `<circle cx="${x}" cy="${y}" r="${4 + (i % 3) * 2}" fill="${['#F0413F', '#FFC72C', '#5DBE3F', '#3E9DF2', '#FF7EB6', '#9B5CE0'][i % 6]}" opacity="0.22"/>`; }).join('') +
    `<ellipse cx="300" cy="470" rx="290" ry="26" fill="#5a3617" opacity="0.12"/>`);
  const mT = await oranla(minoTam, 0.23), kT = await oranla(kinoTam, 0.23); const mtm = await s(mT).metadata(), ktm = await s(kT).metadata();
  const lgF = await s(logoBuf).resize({ width: 400 }).png().toBuffer(), lfm = await s(lgF).metadata();
  const slogan = await metin(['Mino ve Kino ile', 'oyna, öğren!'], 40);
  const lTop = Math.round(H / 2 - lfm.height / 2 - 52);
  await yaz(await s(zemin).composite([{ input: mT, left: 12, top: H - mtm.height - 12 }, { input: kT, left: 12 + mtm.width - 34, top: H - ktm.height - 12 }, { input: lgF, left: 605 + Math.round((400 - lfm.width) / 2), top: lTop }, { input: slogan, left: 605 + Math.round((400 - (await s(slogan).metadata()).width) / 2), top: lTop + lfm.height + 20 }]).flatten({ background: KREM }).png().toBuffer(), 'assets/uygulama/one-cikan.png', true);

  // ---- 5) Ekran görüntüsü çerçevesi: dikey 1290x2796 zemin (menü gökyüzü + bulut + konfeti), ortası boş
  const EW = 1290, EH = 2796;
  await yaz(await s(svg(EW, EH, `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE0FA"/><stop offset="0.5" stop-color="#FFF4DD"/><stop offset="1" stop-color="#FFD9B8"/></linearGradient></defs><rect width="${EW}" height="${EH}" fill="url(#g)"/>` +
    bulut(220, 280, 1.5, 0.95) + bulut(1050, 140, 1.0, 0.9) + bulut(1100, 2500, 1.2, 0.6) + bulut(150, 2640, 0.9, 0.55) +
    [...Array(70)].map((_, i) => { const x = (i * 373) % EW, y = (i * 211) % EH; return `<circle cx="${x}" cy="${y}" r="${8 + (i % 4) * 3}" fill="${['#F0413F', '#FFC72C', '#5DBE3F', '#3E9DF2', '#FF7EB6', '#9B5CE0'][i % 6]}" opacity="0.2"/>`; }).join(''))).flatten({ background: KREM }).png().toBuffer(), 'assets/uygulama/ekran-cerceve.png');
})();
