// Mağaza ekran görüntüleri için ham oyun görüntüleri (Playwright, mobil emülasyon): assets/uygulama/ekran-ham/{telefon-yatay,tablet}/NN-ad.webp (+ ek/ klasörüne yedek sahneler).
// Telefon 932x430 @3x (2796x1290, yatay: telefonda oyunlar yatay kilitli), tablet 768x1024 @2.5x (1920x2560). Uygulama derlemesi gerekir (npm run build:app: ana menü kökte); sunucu: npx vite preview --port 4178 (ya da başka statik http).
// Sıra magaza-ekran.cjs ile aynı (başlıklar MAGAZA-METINLERI.md bölüm 6): 01 ana menü (9 kart), 02 Pazar (müşteri meyve ister), 03 Kino Ne Giysin? (dolap + Kino'nun komik tepkisi),
// 04 Dedektif Mino (pati izi panoda, şüpheli kartları, Kino'nun komik tahmini), 05 Ege (yatay telefonda kukla gösterisi yakın çekim, tablette gösteri sonu: Ege güldü), 06 Çizgi film karesi (Mino'nun Karpuzu), 07 Kino'nun Otobüsü (Gün 3, tezgâhta iki süslü dondurma; eski Pasta karesi ek/pasta).
// Kilit yok: tarayıcıda abonelik kilitleri kapalı (src/engine/erisim.ts), test modu (?test=1) ile ebeveyn kapısı/abonelik ekranı açılmaz.
// node magaza-cekim.cjs [taban=http://localhost:4178] [NN ...] [telefon-yatay|tablet]   ·   DENEME=klasör: @1x, o klasöre png (hızlı bakış)
const fs = require('fs'), path = require('path');
const { chromium } = require(require.resolve('playwright', { paths: [process.cwd()] }));
const sharp = require(require.resolve('sharp', { paths: [process.cwd()] }));
const ARG = process.argv.slice(2);
const TABAN = ARG.find((x) => x.startsWith('http')) || 'http://localhost:4178', NN = ARG.filter((x) => /^\d\d$/.test(x)), TURLER = ARG.filter((x) => ['telefon-yatay', 'tablet'].includes(x));
const DENEME = process.env.DENEME;
const HAM = 'assets/uygulama/ekran-ham/';

const ortasi = async (l) => { const b = await l.boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2, b]; };
async function surukle(p, a, b, adim = 12) {
  await p.mouse.move(a[0], a[1]); await p.mouse.down();
  for (let i = 1; i <= adim; i++) await p.mouse.move(a[0] + ((b[0] - a[0]) * i) / adim, a[1] + ((b[1] - a[1]) * i) / adim);
  await p.mouse.up();
}
/** Kamera kayarken ölçülen yer eskir: kutu iki ölçümde aynı kalana kadar bekle */
async function sabit(l) {
  let o = await l.boundingBox();
  for (let i = 0; i < 30; i++) { await l.page().waitForTimeout(100); const s = await l.boundingBox(); if (o && s && Math.abs(o.x - s.x) < 1 && Math.abs(o.y - s.y) < 1 && Math.abs(o.width - s.width) < 1) return; o = s; }
}
// DENEME + SERI=1: etkileşim sırasında ara kareler (hangi anın en güzel olduğuna bakmak için)
const ara = async (p, ad) => { if (DENEME && process.env.SERI) { fs.mkdirSync(DENEME, { recursive: true }); await p.screenshot({ path: path.join(DENEME, `ara-${ad}.png`) }); } };
async function bekleKadar(fn, ms = 30000) { const t = Date.now(); while (Date.now() - t < ms) { if (await fn()) return true; await new Promise((r) => setTimeout(r, 150)); } throw new Error('zaman aşımı'); }

// 03 Kino Ne Giysin? (kış, gerçek hız ?onizleme=1: tepkiler kısalmasın): dolap açık; Kino çorap, bot, atkı, bere giymiş;
// sonra şort giyer: kışa uymaz, titrer (burnunda buz sarkıtı, mavi yanaklar, takırdayan dişler), o an
async function giysinTepki(p) {
  await p.locator('.gy-raf.acik').waitFor({ timeout: 15000 }); await p.waitForTimeout(1200);
  const giydir = async (id, tx, ty, sonra = 1800) => {
    const [x0, y0] = await ortasi(p.locator(`.gy-giysi[data-giysi="${id}"]`));
    const k = await p.locator('.gy-kino').first().boundingBox();
    await surukle(p, [x0, y0], [k.x + (tx / 2048) * k.width, k.y + (ty / 2048) * k.height + 18], 10);
    await p.waitForTimeout(sonra);
  };
  for (const [id, x, y] of [['corap', 1050, 1810], ['bot', 1050, 1810], ['atki', 1000, 1000], ['bere', 975, 330]]) await giydir(id, x, y);
  await p.waitForTimeout(1200);
  await giydir('sort', 1030, 1600, 750);
}
// 04 Dedektif Mino · Vaka 1 (gerçek hız ?onizleme=1): büyüteç halıdaki pati izini bulur; iz fotoğrafı panoya asılır, altında üç
// şüpheli kartı; Mino "Bir iz! Bu iz kimin?", Kino "Zürafa! Kesin zürafa!" (komik tahmin), o an
async function dedektifBuyutec(p) {
  await bekleKadar(async () => (await p.locator('.dd-vaka').getAttribute('data-adim')) === 'ara-iz', 45000);
  await p.waitForTimeout(1500);
  const [x, y] = await ortasi(p.locator('.dd-sahne [data-ipucu="pati-hali"]'));
  await p.mouse.click(x + 40, y - 30);
  for (const t of [300, 600, 900, 1200]) { await p.waitForTimeout(t); await ara(p, 'd1-' + t); }
  await p.waitForTimeout(Number(process.env.DEDEKTIF_MS || 1100));
}
// 05 Sesli Maceralar · Şşş, Ege Uyuyor!: battaniye, mama, sepet; kuklalar Ada'ya ve Can'a; kukla gösterisi (yakın çekim), Ege kahkaha atar
async function egeKukla(p) {
  const gorev = async () => (await p.locator('.eg-sahne').getAttribute('data-eg-gorev')) ?? '';
  const gorevBekle = async (adlar) => { await bekleKadar(async () => adlar.includes(await gorev())); return gorev(); };
  const e = (ad) => p.locator(`[data-ege="${ad}"]`).first();
  const sur = async (a, b) => { await sabit(a); if (!Array.isArray(b)) await sabit(b); await surukle(p, await ortasi(a), Array.isArray(b) ? b : await ortasi(b), 14); };
  const dokun = async (l) => { const [x, y] = await ortasi(l); await p.mouse.click(x, y); };
  const vp = p.viewportSize();
  await gorevBekle(['battaniye']); await p.waitForTimeout(300);
  await sur(e('battaniye'), [vp.width * 0.85, vp.height * 0.35]); await p.waitForTimeout(1000);
  await sur(e('battaniye'), p.locator('[data-ege="anne"] .eg-anne-gov'));
  await gorevBekle(['onluk']); await p.waitForTimeout(400);
  await sur(e('onluk'), e('bebek'));
  for (let i = 0; i < 40; i++) {
    const g = await gorevBekle(['daldir', 'ufle', 'ver', 'sil']);
    if (g === 'sil') break;
    if (g === 'daldir') { await p.waitForTimeout(150); await sur(e('kasik'), e('kase')); await bekleKadar(async () => (await gorev()) !== 'daldir'); }
    else if (g === 'ufle') { const [x, y] = await ortasi(e('kasik')); await p.mouse.move(x, y); await p.mouse.down(); await bekleKadar(async () => (await gorev()) !== 'ufle', 10000); await p.mouse.up(); }
    else { await p.waitForTimeout(200); await sur(e('kasik'), e('agiz')); await bekleKadar(async () => (await gorev()) !== 'ver'); }
  }
  await p.waitForTimeout(300);
  for (let i = 0; i < 16 && (await gorev()) === 'sil'; i++) {
    const [ax, ay] = await ortasi(e('pecete')), [bx, by] = await ortasi(e('agiz'));
    await p.mouse.move(ax, ay); await p.mouse.down();
    for (let j = 0; j <= 34; j++) { const t = Math.min(1, j / 8); await p.mouse.move(ax + (bx - ax) * t + Math.sin(j * 0.9) * 34, ay + (by - ay) * t + Math.cos(j * 1.3) * 26 - 10); }
    await p.mouse.up(); await p.waitForTimeout(150);
  }
  await gorevBekle(['sepet']); await p.waitForTimeout(300);
  for (let i = 0; i < 12 && (await gorev()) === 'sepet'; i++) {
    await p.waitForTimeout(300);
    const kalan = p.locator('.eg-oyuncak:not([data-cikti])').first();
    if (!(await kalan.count())) break;
    await dokun(kalan);
  }
  await gorevBekle(['kukla-tak']); await p.waitForTimeout(500);
  await sur(e('kukla-ayi'), p.locator('.mc-oyuncu[data-ad="ada"]')); await p.waitForTimeout(300);
  await sur(e('kukla-civciv'), p.locator('.mc-oyuncu[data-ad="can"]'));
  await gorevBekle(['civciv']); await ara(p, 'k1'); await dokun(e('kukla-civciv'));
  await gorevBekle(['ayi']); await dokun(e('kukla-ayi'));
  // yatay telefonda kukla gösterisinin yakın çekimi kadrajı doldurur (ayı, Ege, civciv büyük): ilk serbest dokunuştan hemen sonra
  const yatayTelefon = vp.width > vp.height;
  for (let i = 0; i < 4; i++) {
    await gorevBekle(['serbest']); await dokun(e(i % 2 ? 'kukla-ayi' : 'kukla-civciv'));
    if (yatayTelefon) { await p.waitForTimeout(150); return; }
    if (i < 3) await ara(p, 'k4-' + i);
  }
  // dikey tablette yakın çekim boş duvarda kalır; gösteri biter: "Güldü! Ege güldü!" (ışık açılır, herkes kadrajda, kuklalar Ada'nın ve Can'ın elinde)
  await p.waitForTimeout(Number(process.env.KUKLA_MS || 500));
}
// 06 Çizgi film: Mino'nun Karpuzu kayıt görünümünde (düğmesiz, ekranı dolduran kadraj; test modu YOK), Oynat'tan FILM_SN saniye sonraki kare
// Kare kesin: scripts/film/mp4.mjs gibi sahte saat (sayfa açılmadan kurulur, aşağıda saatKur) 30 fps adımla ilerler, CSS/WAAPI animasyonları ona sarılır
async function filmKare(p) {
  await p.locator('.fl-oynat').waitFor();
  await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(() => window.__filmKayit);
  await p.clock.pauseAt((await p.evaluate(() => Date.now())) + 100);
  await p.evaluate(() => {
    const m = new WeakMap();
    window.__animSenk = (now) => {
      for (const a of document.getAnimations()) {
        let b = m.get(a);
        if (b === undefined) { b = now - (a.currentTime ?? 0); m.set(a, b); a.pause(); }
        a.currentTime = Math.max(0, (now - b) * (a.playbackRate || 1));
      }
    };
  });
  await p.evaluate(() => document.querySelector('.fl-oynat').click());
  // 50 sn: karpuz ikiye bölünmüş, Mino paylaşıyor (yatay telefon ve tablet); dikey telefonda 26 sn (Mino karpuzun üstünde, altyazısız)
  const sn = Number(process.env.FILM_SN || (p.viewportSize().width > 500 ? 50 : 26)), dt = 1000 / 30;
  for (let g = 0; g < sn - 1e-6; g += dt / 1000) await p.clock.runFor(dt);
  await p.evaluate(() => window.__animSenk(performance.now()));
  await p.evaluate(() => Promise.all([...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => (i.onload = i.onerror = r)))));
}
filmKare.saatKur = true;
// 07 Pasta Otobüsü: sipariş ortası. Parlayan (sıradaki) işe dokunulur; tabakta kremalı kurabiye, süs sırası gelince durulur
async function pastaSiparis(p) {
  await p.locator('.ps-gun').waitFor({ timeout: 30000 });
  for (let i = 0; i < 40; i++) {
    const adim = await p.locator('.ps-gun').getAttribute('data-adim'); if (process.env.SERI) console.log('pasta adim', i, adim);
    if (adim === 'sus' || adim === 'servis') break;
    const s = p.locator('.ps-sirada').first();
    if (await s.count()) await s.click({ force: true }).catch(() => {});
    await p.waitForTimeout(900);
    if (i % 3 === 0) await ara(p, 'p' + String(i).padStart(2, '0') + '-' + (await p.locator('.ps-gun').getAttribute('data-adim')));
  }
  await p.waitForTimeout(1200);
}
// 07 Kino'nun Otobüsü · Gün 3 (5-6 yaş, doğum günü bahçesi; bütün tezgâh açık: 6 tat, 3 kap, 8 sos/süs). Önce test
// kısayoluyla Gün 3 açılır (kayıt), sonra gerçek hızda (?onizleme=1) yalnız parlayan işe dokunularak oynanır.
// Varsayılan (mağaza karesi): KO_AN=ver:4 + KO_IKI: kuşun şemsiyeli-kalpli kâsesi hazırken bekletilir, öbür yuvada Mino'nun
// kirazlı doğum günü kupası da yapılır: tezgâhta iki süslü dondurma, pencerede iki müşteri resimli istekleriyle.
// KO_AN=ver:N → N. dondurma bitip "ver" sırası gelince; KO_IKI=0 → tek dondurma;
// KO_AN=mutlu:N → N. dondurma verildikten KO_MS ms sonra (müşteri seviniyor: kalpler, konfeti; denendi, kareler zayıf)
async function kinoDondurma(p) {
  const taban = p.url().split('/kino-otobus/')[0];
  await p.goto(taban + '/kino-otobus/?test=1&sifirla=1&yas=buyuk&ekran=gun&gun=3&alinan=flama,jant', { waitUntil: 'load' });
  await p.locator('.ko-gun').waitFor({ timeout: 30000 });
  await p.goto(taban + '/kino-otobus/?onizleme=1&ekran=gun&gun=3', { waitUntil: 'load' });
  await p.locator('.ko-musteri.ko-hazir').first().waitFor({ timeout: 30000 });
  await p.waitForTimeout(1500);
  const [tur, nS] = (process.env.KO_AN || 'ver:4').split(':'), N = Number(nS) || 1;
  let verSayisi = 0, oncekiAdim = '', ikinci = false;
  for (let i = 0; i < 400; i++) {
    const adim = await p.locator('.ko-gun').getAttribute('data-adim').catch(() => null);
    const s = p.locator('.ko-gun .ko-sirada').first();
    if (!adim || !(await s.count())) { await p.waitForTimeout(200); continue; }
    if (adim === 'ver' && oncekiAdim !== 'ver') {
      if (ikinci) { await p.waitForTimeout(Number(process.env.KO_MS || 900)); return; }
      verSayisi++;
      await ara(p, `ver-${verSayisi}`);
      if (tur === 'ver' && verSayisi === N) {
        // KO_IKI=1: bu dondurma bekletilir, öbür yuvadaki müşterininki de yapılır: tezgâhta iki hazır dondurma
        if (process.env.KO_IKI !== '0') {
          ikinci = true; oncekiAdim = '';
          await p.locator('.ko-yuva:not(.ko-aktif)').first().click({ position: { x: 20, y: 30 }, force: true });
          await p.waitForTimeout(600);
          continue;
        }
        await p.waitForTimeout(Number(process.env.KO_MS || 900)); return;
      }
    }
    oncekiAdim = adim;
    await s.click({ force: true }).catch(() => {});
    if (adim === 'ver' && tur === 'mutlu' && verSayisi === N) {
      const ms = Number(process.env.KO_MS || 2200);
      for (let t = 400; t <= ms; t += 400) { await p.waitForTimeout(400); await ara(p, `mutlu-${N}-${t}`); }
      return;
    }
    await p.waitForTimeout(adim === 'top' ? 650 : 750);
  }
}
// [klasör, ad, adres, bekleme ms, (isteğe bağlı) etkileşim]. Uygulama derlemesi (npm run build:app): ana menü sitenin kökünde
const LISTE = [
  ['', '01-ana-menu', '/', 5000],
  ['', '02-pazar', '/pazar/?test=1&yas=5&ekran=pazar', 4500],
  ['', '03-giysin', '/giysin/?onizleme=1&sifirla=1&mevsim=kis&adim=giyin', 1500, giysinTepki],
  ['', '04-dedektif', '/dedektif/?onizleme=1&sifirla=1&adim=iz', 500, dedektifBuyutec],
  ['', '05-ege', '/macera/?test=1&ekran=bolum&yas=5&bolum=ege', 500, egeKukla],
  ['', '06-film', '/film/?film=mino-karpuz&kayit=1&kadraj=dolu&sessiz=1', 2500, filmKare],
  ['', '07-otobus', '/kino-otobus/?test=1&sifirla=1', 1000, kinoDondurma],
  ['ek/', 'pasta', '/pasta/?test=1&sifirla=1&ekran=gun&gun=2&firin=600,600000', 6000, pastaSiparis], // eski 07: sipariş ortası (parlayan işe dokunarak)
  ['ek/', 'meyve-suyu', '/pazar/?test=1&yas=4&ekran=meyvesuyu', 4500],
  ['ek/', 'banyo', '/macera/?test=1&ekran=bolum&yas=5&bolum=banyo', 4500],
  ['ek/', 'salincak', '/macera/?test=1&ekran=bolum&yas=5&bolum=salincak', 4500],
  ['ek/', 'film-liste', '/film/?test=1', 4000],
  ['ek/', 'kartlar-bul', '/kartlar/?test=1&yas=5&tema=hayvanlar&tip=BUL', 3500],
  ['ek/', 'pasta-acilis', '/pasta/?test=1', 4500],
  ['ek/', 'canlan-ciz', '/canlan/?test=1&yas=5&ekran=ciz&resim=araba&mod=kopya', 4500],
  ['ek/', 'dedektif-vakalar', '/dedektif/?test=1&sifirla=1&cozuldu=1', 4000],
];
// Telefonda oyunlar yatay kilitli (src/kabuk/yon.ts): telefon kareleri yatay 932x430 @3x = 2796x1290 (iPhone 6.7" yatay); tablet her yönde serbest, dikey kalır
const CIHAZ = { 'telefon-yatay': { viewport: { width: 932, height: 430 }, deviceScaleFactor: 3 }, tablet: { viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2.5 } };
(async () => {
  const br = await chromium.launch();
  for (const [tur, c] of Object.entries(CIHAZ)) {
    if (TURLER.length && !TURLER.includes(tur)) continue;
    const ctx = await br.newContext({ ...c, ...(DENEME ? { deviceScaleFactor: 1 } : {}), isMobile: true, hasTouch: true, locale: 'tr-TR' });
    for (const [alt, ad, adres, bekle, etkilesim] of LISTE) {
      if (NN.length ? !(alt === '' && NN.includes(ad.slice(0, 2))) : DENEME && alt) continue;
      const p = await ctx.newPage();
      try {
        if (etkilesim && etkilesim.saatKur) await p.clock.install({ time: 1_000_000 });
        await p.goto(TABAN + adres, { waitUntil: 'load', timeout: 30000 }); await p.waitForTimeout(bekle);
        if (etkilesim) await etkilesim(p);
        // fare imleci / odak halkası görünmesin
        await p.mouse.move(-10, -10).catch(() => {});
        await p.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
        const buf = await p.screenshot({ type: 'png' });
        if (DENEME) { fs.mkdirSync(DENEME, { recursive: true }); const y = path.join(DENEME, `${tur}-${ad}.png`); fs.writeFileSync(y, buf); console.log(y); }
        else {
          const yol = path.join(HAM, tur, alt ? 'ek' : '', ad + '.webp'); fs.mkdirSync(path.dirname(yol), { recursive: true });
          await sharp(buf).removeAlpha().webp({ quality: 95, effort: 5 }).toFile(yol); console.log(yol);
        }
      } catch (e) { console.log(tur, ad, 'HATA', String(e).slice(0, 160)); }
      await p.close();
    }
    await ctx.close();
  }
  await br.close();
})();
