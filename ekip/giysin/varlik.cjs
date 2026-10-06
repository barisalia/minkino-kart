/**
 * Kino Ne Giysin? varlık hattı: ekip/giysin/ham/ (Recraft / nano-banana çıktıları) → assets/giysin/*.webp (q86).
 * Beyaz zemin kenardan taşmayla silinir; kenar 1 px konturun içine çekilir, sonra yumuşatılır (hale kalmaz).
 * node ekip/giysin/varlik.cjs
 */
const sharp = require('sharp');
const fs = require('fs');
const H = 'ekip/giysin/ham/';
const C = 'assets/giysin/';
const Q = { quality: 86, alphaQuality: 100, smartSubsample: true };

async function oku(yol, en) {
  let s = sharp(yol).flatten({ background: '#ffffff' });
  if (en) s = s.resize(en);
  const { data, info } = await s.removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { d: data, W: info.width, H: info.height };
}

function tasir(g, tohumlar, gecer) {
  const { W, H: Y } = g;
  const m = new Uint8Array(W * Y);
  const st = [...tohumlar];
  while (st.length) {
    const j = st.pop();
    if (m[j] || !gecer(j)) continue;
    m[j] = 1;
    const x = j % W;
    if (x > 0) st.push(j - 1);
    if (x < W - 1) st.push(j + 1);
    if (j >= W) st.push(j - W);
    if (j < W * (Y - 1)) st.push(j + W);
  }
  return m;
}
const kenarTohum = (W, Y) => {
  const t = [];
  for (let i = 0; i < W; i++) t.push(i, (Y - 1) * W + i);
  for (let i = 0; i < Y; i++) t.push(i * W, i * W + W - 1);
  return t;
};
function asin(m, W, Y, n = 1) {
  for (let k = 0; k < n; k++) {
    const o = new Uint8Array(W * Y);
    for (let y = 1; y < Y - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      o[i] = m[i] && m[i - 1] && m[i + 1] && m[i - W] && m[i + W] ? 1 : 0;
    }
    m = o;
  }
  return m;
}
function genis(m, W, Y, n = 1) {
  for (let k = 0; k < n; k++) {
    const o = new Uint8Array(W * Y);
    for (let y = 1; y < Y - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      o[i] = m[i] || m[i - 1] || m[i + 1] || m[i - W] || m[i + W] ? 1 : 0;
    }
    m = o;
  }
  return m;
}
function delikDoldur(m, W, Y) {
  const dis = tasir({ W, H: Y }, kenarTohum(W, Y), (j) => !m[j]);
  const o = new Uint8Array(W * Y);
  for (let i = 0; i < W * Y; i++) o[i] = dis[i] ? 0 : 1;
  return o;
}
function yumusak(m, W, Y) {
  const a = new Uint8Array(W * Y);
  for (let y = 0; y < Y; y++) for (let x = 0; x < W; x++) {
    let t = 0, n = 0;
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
      const X = x + i, Yy = y + j;
      if (X < 0 || Yy < 0 || X >= W || Yy >= Y) continue;
      const w = i === 0 && j === 0 ? 4 : i === 0 || j === 0 ? 2 : 1;
      t += m[Yy * W + X] * w;
      n += w;
    }
    a[y * W + x] = Math.round((255 * t) / n);
  }
  return a;
}
/** ön plan maskesi: kenardan taşan beyaz zemin dışı; ekTohum: ayrıca silinecek kapalı beyazlar (pencere camı) */
function onPlan(g, ekTohum = [], esik = 236) {
  const { d, W, H: Y } = g;
  const beyaz = (e) => (j) => d[j * 3] >= e && d[j * 3 + 1] >= e && d[j * 3 + 2] >= e;
  const zemin = tasir(g, kenarTohum(W, Y), beyaz(esik));
  const cam = ekTohum.length ? tasir(g, ekTohum, beyaz(244)) : new Uint8Array(W * Y);
  const m = new Uint8Array(W * Y);
  for (let i = 0; i < W * Y; i++) m[i] = zemin[i] || cam[i] ? 0 : 1;
  return m;
}
async function yaz(g, m, yol, { en, kirp = true } = {}) {
  const { d, W, H: Y } = g;
  const a = yumusak(asin(m, W, Y, 1), W, Y);
  const rgba = Buffer.alloc(W * Y * 4);
  for (let i = 0; i < W * Y; i++) {
    rgba[i * 4] = d[i * 3];
    rgba[i * 4 + 1] = d[i * 3 + 1];
    rgba[i * 4 + 2] = d[i * 3 + 2];
    rgba[i * 4 + 3] = a[i];
  }
  let s = sharp(rgba, { raw: { width: W, height: Y, channels: 4 } });
  if (kirp) s = sharp(await s.png().toBuffer()).trim({ threshold: 1 });
  const buf = await s.png().toBuffer({ resolveWithObject: true });
  let s2 = sharp(buf.data);
  if (en && buf.info.width > en) s2 = s2.resize(en);
  const o = await s2.webp(Q).toFile(C + yol);
  console.log(yol, o.width, o.height);
  return { info: buf.info, o };
}
function parcalar(m, W, Y, enAz) {
  const et = new Int32Array(W * Y);
  const liste = [];
  for (let i = 0; i < W * Y; i++) {
    if (!m[i] || et[i]) continue;
    const id = liste.length + 1;
    const st = [i];
    et[i] = id;
    let n = 0, x0 = W, y0 = Y, x1 = 0, y1 = 0;
    while (st.length) {
      const j = st.pop();
      n++;
      const x = j % W, y = (j / W) | 0;
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      for (const k of [x > 0 ? j - 1 : -1, x < W - 1 ? j + 1 : -1, y > 0 ? j - W : -1, y < Y - 1 ? j + W : -1]) if (k >= 0 && m[k] && !et[k]) { et[k] = id; st.push(k); }
    }
    if (n >= enAz) liste.push({ id, n, x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 });
  }
  return { et, liste };
}
const sadece = (et, id) => Uint8Array.from(et, (v) => (v === id ? 1 : 0));

async function sahne(ad, girdi) {
  // yatay 1920 × 1072, dikey (ortadan 9:16) 1080 × 1920
  const m = await sharp(H + girdi).metadata();
  await sharp(H + girdi).resize(1920).webp(Q).toFile(`${C}${ad}-yatay.webp`);
  const w = Math.round((m.height * 9) / 16);
  await sharp(H + girdi).extract({ left: Math.round((m.width - w) / 2), top: 0, width: w, height: m.height }).resize(1080, 1920).webp(Q).toFile(`${C}${ad}-dikey.webp`);
  console.log(ad, 'yatay + dikey');
}

/**
 * Gemini çizimleri (C:\Users\Minkex\Desktop\minkino-film-gemini\kino-giysi → ekip/giysin/ham):
 * pencere manzarası 3 katman (arka tam; orta ve ön beyaz zeminli), gardırop kapalı / açık (aynı kadraj).
 */
async function gemini() {
  await sharp(H + 'pencere-kis-arka.png').resize(1400).webp(Q).toFile(C + 'pencere-kis-arka.webp');
  for (const k of ['orta', 'on']) {
    const g = await oku(H + `pencere-kis-${k}.png`, 1400);
    let m = onPlan(g, [], k === 'on' ? 215 : 240);
    if (k === 'on') {
      // ön katman: yalnız ağaç (en büyük parça); zemin çizgisi ve kar kırıntıları atılır
      const { et, liste } = parcalar(m, g.W, g.H, 50);
      const en = liste.sort((a, b) => b.n - a.n)[0];
      m = sadece(et, en.id);
      // ağaca bağlı ufuk çizgisi: ağacın dışındaki sütunlar silinir
      for (let i = 0; i < m.length; i++) {
        const x = i % g.W, y = (i / g.W) | 0;
        if (y > g.H * 0.55 && (x < g.W * 0.69 || x > g.W * 0.9)) m[i] = 0;
      }
    }
    await yaz(g, m, `pencere-kis-${k}.webp`, { kirp: false });
  }
  const kg = await oku(H + 'gardirop-kapali.png', 1000);
  const ag = await oku(H + 'gardirop-acik.png', 1000);
  const { W, H: Y, d } = kg;
  const kfg = onPlan(kg), afg = onPlan(ag);
  // kapalı gövdenin sınırları
  let x0 = W, x1 = 0, y0 = Y, y1 = 0;
  for (let i = 0; i < W * Y; i++) if (kfg[i]) { const x = i % W, y = (i / W) | 0; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  // kapaklar: gövdenin iç dikdörtgeni (taç ve ayaklar hariç), ortadaki koyu aralıktan ikiye
  const kx0 = Math.round(x0 + (x1 - x0) * 0.07), kx1 = Math.round(x1 - (x1 - x0) * 0.07);
  const ky0 = Math.round(y0 + (y1 - y0) * 0.075), ky1 = Math.round(y1 - (y1 - y0) * 0.075);
  let ek = Math.round((x0 + x1) / 2), enKoyu = 1e9;
  for (let x = Math.round(W * 0.45); x < W * 0.55; x++) {
    let t = 0;
    for (let y = Math.round(Y * 0.3); y < Y * 0.7; y++) t += d[(y * W + x) * 3];
    if (t < enKoyu) { enKoyu = t; ek = x; }
  }
  const sol = new Uint8Array(W * Y), sag = new Uint8Array(W * Y), ic = new Uint8Array(W * Y);
  for (let i = 0; i < W * Y; i++) {
    const x = i % W, y = (i / W) | 0;
    const kapakta = x >= kx0 && x <= kx1 && y >= ky0 && y <= ky1 && kfg[i];
    if (kapakta && x <= ek + 1) sol[i] = 1;
    if (kapakta && x >= ek - 1) sag[i] = 1;
    // iç: açık resmin gövde sınırları içinde kalanı (yana açılmış kapaklar hariç)
    ic[i] = afg[i] && x >= x0 - 2 && x <= x1 + 2 ? 1 : 0;
  }
  await yaz(kg, kfg, 'dolap-kapali.webp', { kirp: false });
  await yaz(ag, afg, 'dolap-acik.webp', { kirp: false });
  await yaz(ag, ic, 'dolap-ic.webp', { kirp: false });
  await yaz(kg, sol, 'dolap-kapak-sol.webp', { kirp: false });
  await yaz(kg, sag, 'dolap-kapak-sag.webp', { kirp: false });
  const oran = (v, n) => +(v / n).toFixed(4);
  fs.writeFileSync(C + 'dolap.json', JSON.stringify({ en: W, boy: Y, govde: [oran(x0, W), oran(y0, Y), oran(x1, W), oran(y1, Y)], mentese: [oran(kx0, W), oran(kx1, W)] }));
  console.log('gemini dolap', { x0, x1, y0, y1, kx0, kx1, ek });
}

/** dolap ikonları: Kino'nun üstündeki çizimin aynısı (çiftler birlikte, eldivenler yan yana sıkışık), en çok 360 px */
async function ikonlar(yer) {
  const ikon = { bere: ['bere'], atki: ['atki'], mont: ['mont'], eldiven: ['eldiven-sol', 'eldiven-sag'], bot: ['bot'], corap: ['corap'], sort: ['sort'], gozluk: ['gozluk'], hirka: ['hirka'], cizme: ['cizme'], sapka: ['sapka'], mayo: ['mayo'], sandalet: ['sandalet'], yagmurluk: ['yagmurluk'], sepet: ['sepet'], kova: ['kova'], semsiye: ['semsiye-kapali'] };
  for (const [ad, liste] of Object.entries(ikon)) {
    if (liste.some((n) => !yer[n])) continue;
    const konum = {};
    if (ad === 'eldiven') {
      const [s, g] = liste;
      const hh = Math.max(yer[s][3], yer[g][3]);
      konum[s] = [0, hh - yer[s][3]];
      konum[g] = [yer[s][2] + 24, hh - yer[g][3]];
    } else for (const n of liste) konum[n] = [yer[n][0], yer[n][1]];
    const x0 = Math.min(...liste.map((n) => konum[n][0])), y0 = Math.min(...liste.map((n) => konum[n][1]));
    const x1 = Math.max(...liste.map((n) => konum[n][0] + yer[n][2])), y1 = Math.max(...liste.map((n) => konum[n][1] + yer[n][3]));
    const tuval = await sharp({ create: { width: x1 - x0, height: y1 - y0, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite(liste.map((n) => ({ input: `${C}giysi/${n}.webp`, left: konum[n][0] - x0, top: konum[n][1] - y0 })))
      .png()
      .toBuffer();
    await sharp(tuval).resize(360, 360, { fit: 'inside' }).webp(Q).toFile(`${C}ikon/${ad}.webp`);
  }
}

/** Gemini 2. parti: perdeler, dış sahne (karlı tepe), kardan adam parçaları, titreyen Kino pozu (iskelete hizalı) */
async function gemini2() {
  for (const ad of ['perde-sol', 'perde-sag']) {
    const g = await oku(H + ad + '.png', 1000);
    await yaz(g, onPlan(g), ad + '.webp');
  }
  await sahne('dis-kis', 'dis-kis-tepe.png');
  const KARDAN = { 'top-buyuk': 'buyuk', 'top-orta': 'orta', 'top-kucuk': 'kucuk', havuc: 'havuc', 'goz-1': 'goz-1', 'goz-2': 'goz-2', 'kol-1': 'dalSol', 'kol-2': 'dalSag', 'dugme-1': 'dugme-1', 'dugme-2': 'dugme-2', 'dugme-3': 'dugme-3', atki: 'atki' };
  for (const [k, ad] of Object.entries(KARDAN)) {
    const g = await oku(H + `kardan-${k}.png`);
    await yaz(g, onPlan(g), `kardan-${ad}.webp`, { en: 600 });
  }
  // titreyen Kino: iskeletin ön çizimiyle aynı kutuya (baş tepesi 193, ayak 1887 / 2048; orta 1040)
  const g = await oku(H + 'kino-titreme-buyuk.png', 1600);
  const m = onPlan(g);
  let x0 = g.W, x1 = 0, y0 = g.H, y1 = 0;
  for (let i = 0; i < m.length; i++) if (m[i]) { const x = i % g.W, y = (i / g.W) | 0; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const tmp = await yaz(g, m, 'tmp-titreme.webp', { kirp: false });
  void tmp;
  const N = 1024, s = ((1887 - 215) / 2048) * N / (y1 - y0);
  const nw = Math.round(g.W * s), nh = Math.round(g.H * s);
  const kucuk = await sharp(C + 'tmp-titreme.webp').resize(nw, nh).png().toBuffer();
  const sol = Math.round((1040 / 2048) * N - ((x0 + x1) / 2) * s), ust = Math.round((215 / 2048) * N - y0 * s);
  const ic = await sharp({ create: { width: N, height: N, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: kucuk, left: Math.max(0, sol), top: Math.max(0, ust) }])
    .webp(Q)
    .toFile(C + 'kino-titreme.webp');
  try { fs.unlinkSync(C + 'tmp-titreme.webp'); } catch { /* sharp önbelleği tutuyor: elle silinir */ }
  console.log('titreme', ic);
}

/** Kenarları beyaz zeminli tek eşya (Gemini): zemin silinir; yalnız en büyük parça (enBuyuk) ya da hepsi */
async function esya(girdi, cikti, { en = 600, enBuyuk = false, sec, delik = false, filtre } = {}) {
  const g = await oku(H + girdi, 1200);
  let m = onPlan(g);
  if (delik) {
    // sap / kulp içindeki kapalı beyaz boşluklar (büyükleri) de zemin
    const ters = Uint8Array.from(m, (v, i) => (v && g.d[i * 3] >= 236 && g.d[i * 3 + 1] >= 236 && g.d[i * 3 + 2] >= 236 ? 1 : 0));
    const { et, liste } = parcalar(ters, g.W, g.H, 2500);
    for (const p of liste) for (let i = 0; i < m.length; i++) if (et[i] === p.id) m[i] = 0;
  }
  if (filtre) {
    const { et, liste } = parcalar(m, g.W, g.H, 30);
    const tut = new Set(liste.filter((p) => filtre(p, g)).map((p) => p.id));
    m = Uint8Array.from(et, (v) => (tut.has(v) ? 1 : 0));
  } else if (enBuyuk || sec) {
    const { et, liste } = parcalar(m, g.W, g.H, 200);
    const p = sec ? sec(liste, g) : liste.sort((a, b) => b.n - a.n)[0];
    m = sadece(et, p.id);
  }
  return yaz(g, m, cikti, { en });
}

/** Pencere manzarası: arka tam; orta (çit, çalı) ve ön (mevsim ağacı) beyaz zeminli */
async function pencereKatmanlari(m) {
  await sharp(H + `pencere-${m}-arka.png`).resize(1400).webp(Q).toFile(C + `pencere-${m}-arka.webp`);
  for (const k of ['orta', 'on']) {
    const g = await oku(H + `pencere-${m}-${k}.png`, 1400);
    let mk = onPlan(g, [], k === 'on' ? 215 : 240);
    if (k === 'on') {
      // ön katman: yalnız ağaç (en büyük parça; savrulan yaprak / taç yaprağı kırıntıları atılır)
      const { et, liste } = parcalar(mk, g.W, g.H, 50);
      const enB = liste.sort((a, b) => b.n - a.n)[0];
      mk = sadece(et, enB.id);
      // ağaca bağlı ufuk çizgisi: ağacın gövde sütunlarının dışında, alt yarıda silinir
      let x0 = g.W, x1 = 0;
      for (let i = 0; i < mk.length; i++) if (mk[i] && ((i / g.W) | 0) < g.H * 0.5) { const x = i % g.W; x0 = Math.min(x0, x); x1 = Math.max(x1, x); }
      for (let i = 0; i < mk.length; i++) {
        const x = i % g.W, y = (i / g.W) | 0;
        if (y > g.H * 0.55 && (x < x0 - 10 || x > x1 + 10)) mk[i] = 0;
      }
    }
    await yaz(g, mk, `pencere-${m}-${k}.webp`, { kirp: false });
  }
}

/** Dış sahne: yatay 1920 × 1072; dikey 1080 × 1920 (ortası `orta` oranında: sahnenin olay yeri) */
async function sahneOrta(ad, girdi, orta = 0.5) {
  const m = await sharp(H + girdi).metadata();
  await sharp(H + girdi).resize(1920).webp(Q).toFile(`${C}${ad}-yatay.webp`);
  const w = Math.round((m.height * 9) / 16);
  const sol = Math.max(0, Math.min(m.width - w, Math.round(m.width * orta - w / 2)));
  await sharp(H + girdi).extract({ left: sol, top: 0, width: w, height: m.height }).resize(1080, 1920).webp(Q).toFile(`${C}${ad}-dikey.webp`);
  console.log(ad, 'yatay + dikey', { sol });
}

/**
 * Kino'nun patisinde tutulan eşyalar (sepet, kova, şemsiye) iskelet tuvaline (2048) oturtulur; patinin parmakları
 * (ekip/kino/kino-final.png, kapı sapının önünde kalsın diye) ayrı katman olarak eşyanın üstüne çizilir.
 * Çıktı: ekip/giysin/parca/<ad>.png + .json (giysi katmanlarıyla aynı biçim)
 */
async function tutulanlar() {
  const P = 'ekip/giysin/parca/';
  const yerlestir = async (ad, kaynak, { en, x, y, aci = 0 }) => {
    // kaynak: assets/giysin/esya-*.webp (şeffaf); (x, y): resmin üst-orta noktası tuvalde
    let b = await sharp(kaynak).resize({ width: en }).png().toBuffer({ resolveWithObject: true });
    let ox = x - b.info.width / 2, oy = y;
    if (aci) {
      const d = await sharp(b.data).rotate(aci, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer({ resolveWithObject: true });
      ox -= (d.info.width - b.info.width) / 2;
      oy -= (d.info.height - b.info.height) / 2;
      b = d;
    }
    fs.writeFileSync(P + ad + '.png', b.data);
    fs.writeFileSync(P + ad + '.json', JSON.stringify({ x: Math.round(ox), y: Math.round(oy), w: b.info.width, h: b.info.height }));
    console.log(ad, Math.round(ox), Math.round(oy), b.info.width, b.info.height);
  };
  await yerlestir('sepet', C + 'esya-sepet.webp', { en: 390, x: 1330, y: 1462 });
  await yerlestir('kova', C + 'esya-kova.webp', { en: 320, x: 1330, y: 1478 });
  await yerlestir('semsiye-kapali', C + 'esya-semsiye-kapali.webp', { en: 250, x: 1352, y: 860, aci: 6 });
  // açık şemsiye: Kino'nun arkasında (sap başın arkasından geçer, kubbe başın üstünde, kanca patinin altında).
  // Gemini çiziminde sap eğik: önce sap dikleşecek kadar döndürülür, sonra sap uzatılır (kubbe + sap + kanca).
  {
    const kaynak = C + 'esya-semsiye-acik.webp';
    const sat = async (b) => sharp(b).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const olc0 = (d, W, Y) => {
      const gen = (y) => { let a = W, b = -1; for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] > 128) { a = Math.min(a, x); b = Math.max(b, x); } return [a, b]; };
      let enGen = 0;
      for (let y = 0; y < Y; y++) { const [a, b] = gen(y); enGen = Math.max(enGen, b - a); }
      let kubbeAlt = 0;
      for (let y = Math.round(Y * 0.3); y < Y; y++) { const [a, b] = gen(y); if (b - a < enGen * 0.15) { kubbeAlt = y; break; } }
      let kancaUst = Y - 1;
      for (let y = Math.round(kubbeAlt + (Y - kubbeAlt) * 0.45); y < Y; y++) { const [a, b] = gen(y); if (b - a > enGen * 0.045) { kancaUst = y; break; } }
      const orta = (y) => { const [a, b] = gen(y); return (a + b) / 2; };
      return { enGen, kubbeAlt, kancaUst, orta };
    };
    const s0 = await sat(kaynak);
    const o0 = olc0(s0.data, s0.info.width, s0.info.height);
    const y1 = o0.kubbeAlt + (o0.kancaUst - o0.kubbeAlt) * 0.15, y2 = o0.kubbeAlt + (o0.kancaUst - o0.kubbeAlt) * 0.85;
    const aci = (Math.atan2(o0.orta(Math.round(y2)) - o0.orta(Math.round(y1)), y2 - y1) * 180) / Math.PI;
    const dondu = await sharp(kaynak).flop().png().toBuffer(); void aci; // aynalanır: sap kubbeden sağ alta, patiye iner
    const s1 = await sat(dondu);
    const W = s1.info.width, Y = s1.info.height;
    const o1 = olc0(s1.data, W, Y);
    const sapX = o1.orta(o1.kancaUst - 3);
    const KUBBE_EN = 1250, olc = KUBBE_EN / o1.enGen;
    const NW = Math.round(W * olc);
    const parca = (top, h, yeniH) => sharp(dondu).extract({ left: 0, top, width: W, height: h }).resize({ width: NW, height: yeniH ?? Math.round(h * olc), fit: 'fill' }).png().toBuffer({ resolveWithObject: true });
    const kubbe = await parca(0, o1.kubbeAlt + 4);
    const kanca = await parca(o1.kancaUst - 2, Y - o1.kancaUst + 2);
    const sapH = 1150;
    const sap = await parca(o1.kubbeAlt + 2, o1.kancaUst - o1.kubbeAlt, sapH);
    const TH = kubbe.info.height + sapH + kanca.info.height - 10;
    const dik = await sharp({ create: { width: NW, height: TH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: sap.data, left: 0, top: kubbe.info.height - 5 }, { input: kanca.data, left: 0, top: kubbe.info.height + sapH - 10 }, { input: kubbe.data, left: 0, top: 0 }])
      .png()
      .toBuffer();
    // sap patiden başın arkasına doğru sola eğik: kubbe başın üstünde ortalanır
    const EGIM = 0;
    const r = (EGIM * Math.PI) / 180;
    const egik = await sharp(dik).rotate(EGIM, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer({ resolveWithObject: true });
    // kavrama noktası (kancanın üstü) dönmeden önce merkeze göre; dönünce yeni yeri
    const gx = sapX * olc - NW / 2, gy = kubbe.info.height + sapH - 10 - TH / 2;
    const qx = gx * Math.cos(r) - gy * Math.sin(r) + egik.info.width / 2, qy = gx * Math.sin(r) + gy * Math.cos(r) + egik.info.height / 2;
    // kavrama patide: (1300, 1540)
    const x = Math.round(1300 - qx), y = Math.round(1540 - qy);
    fs.writeFileSync(P + 'semsiye-acik.png', egik.data);
    fs.writeFileSync(P + 'semsiye-acik.json', JSON.stringify({ x, y, w: egik.info.width, h: egik.info.height }));
    // kanca: kavrama noktasının altı Kino'nun önünde (pati sapı tutuyor görünür)
    const kesY = Math.round(qy) + 10;
    const alt = await sharp(egik.data).extract({ left: 0, top: kesY, width: egik.info.width, height: egik.info.height - kesY }).png().toBuffer();
    const ka = await sharp(alt).trim({ threshold: 1 }).png().toBuffer({ resolveWithObject: true });
    fs.writeFileSync(P + 'semsiye-kanca.png', ka.data);
    fs.writeFileSync(P + 'semsiye-kanca.json', JSON.stringify({ x: x - (ka.info.trimOffsetLeft ?? 0), y: y + kesY - (ka.info.trimOffsetTop ?? 0), w: ka.info.width, h: ka.info.height }));
    console.log('semsiye-acik', { aci: +aci.toFixed(1), x, y, w: egik.info.width, h: egik.info.height, kanca: ka.info });
  }
  // patinin parmakları: patinin içinden taşma (kontur sınır), bileğin altı; kontur için 5 px genişler
  {
    const { data, info } = await sharp('ekip/kino/kino-final.png').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const W = info.width;
    const acik = (j) => data[j * 4 + 3] > 200 && data[j * 4] * 0.3 + data[j * 4 + 1] * 0.59 + data[j * 4 + 2] * 0.11 > 150;
    const m = tasir({ W, H: info.height }, [[1300, 1555], [1330, 1560], [1280, 1570], [1350, 1545], [1240, 1560], [1320, 1530]].map(([x, y]) => y * W + x), (j) => acik(j) && ((j / W) | 0) >= 1512 && j % W > 1190 && j % W < 1410);
    let mm = genis(m, W, info.height, 6);
    for (let i = 0; i < mm.length; i++) if (data[i * 4 + 3] < 10 || ((i / W) | 0) < 1508) mm[i] = 0;
    const rgba = Buffer.alloc(W * info.height * 4);
    const a = yumusak(mm, W, info.height);
    for (let i = 0; i < W * info.height; i++) {
      rgba[i * 4] = data[i * 4]; rgba[i * 4 + 1] = data[i * 4 + 1]; rgba[i * 4 + 2] = data[i * 4 + 2];
      rgba[i * 4 + 3] = Math.min(a[i], data[i * 4 + 3]);
      if (!rgba[i * 4 + 3]) rgba[i * 4] = rgba[i * 4 + 1] = rgba[i * 4 + 2] = 0;
    }
    const tam = await sharp(rgba, { raw: { width: W, height: info.height, channels: 4 } }).png().toBuffer();
    const k = await sharp(tam).trim({ threshold: 1 }).png().toBuffer({ resolveWithObject: true });
    fs.writeFileSync(P + 'pati-sag.png', k.data);
    fs.writeFileSync(P + 'pati-sag.json', JSON.stringify({ x: -(k.info.trimOffsetLeft ?? 0), y: -(k.info.trimOffsetTop ?? 0), w: k.info.width, h: k.info.height }));
    console.log('pati', k.info);
  }
}

/**
 * Gemini Kino pozu iskeletin kutusuna (1024 kare, iskeletin 2048'ine oranla) hizalanır: yatay orta 1040,
 * görselin üstü `ust`, altı `alt` (2048 biriminde). Pozla iskelet bir an yer değiştirince Kino yerinden oynamaz.
 */
async function poz(girdi, cikti, ust, alt) {
  const g = await oku(H + girdi, 1600);
  const m = onPlan(g);
  let x0 = g.W, x1 = 0, y0 = g.H, y1 = 0;
  for (let i = 0; i < m.length; i++) if (m[i]) { const x = i % g.W, y = (i / g.W) | 0; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const { o } = await yaz(g, m, 'tmp-poz.webp', { kirp: false });
  void o;
  const N = 1024, s = (((alt - ust) / 2048) * N) / (y1 - y0);
  const kucuk = await sharp(C + 'tmp-poz.webp').resize(Math.round(g.W * s), Math.round(g.H * s)).png().toBuffer();
  const sol = Math.round((1040 / 2048) * N - ((x0 + x1) / 2) * s), ustY = Math.round((ust / 2048) * N - y0 * s);
  // tuvalden taşan kısım kırpılır (composite negatif konuma izin vermez)
  const kirpX = Math.max(0, -sol), kirpY = Math.max(0, -ustY);
  const meta = await sharp(kucuk).metadata();
  const parca = await sharp(kucuk).extract({ left: kirpX, top: kirpY, width: Math.min(meta.width - kirpX, N - Math.max(0, sol)), height: Math.min(meta.height - kirpY, N - Math.max(0, ustY)) }).png().toBuffer();
  await sharp({ create: { width: N, height: N, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: parca, left: Math.max(0, sol), top: Math.max(0, ustY) }])
    .webp(Q)
    .toFile(C + cikti);
  sharp.cache(false);
  try { fs.unlinkSync(C + 'tmp-poz.webp'); } catch { /* önbellek tutuyorsa elle silinir (assets'e girmesin) */ }
  console.log('poz', cikti);
}

/** İlkbahar, yaz, sonbahar: pencere katmanları, dış sahneler, eşyalar, yeni giysiler + tutulanlar, ikonlar */
async function mevsimler() {
  for (const m of ['ilkbahar', 'yaz', 'sonbahar']) if (fs.existsSync(H + `pencere-${m}-on.png`)) await pencereKatmanlari(m);
  await sahneOrta('dis-ilkbahar', 'dis-ilkbahar-cicekli-bahce.png', 0.5);
  await sahneOrta('dis-yaz', 'dis-yaz-plaj.png', 0.5);
  if (fs.existsSync(H + 'dis-sonbahar-yagmurlu-sokak.png')) await sahneOrta('dis-sonbahar', 'dis-sonbahar-yagmurlu-sokak.png', 0.6);
  await esya('esya-sepet.png', 'esya-sepet.webp', { enBuyuk: true, delik: true });
  await esya('esya-cicek-demeti.png', 'esya-cicek.webp');
  await esya('esya-gunes-kremi.png', 'esya-krem.webp', { enBuyuk: true });
  await esya('esya-kova-kurek.png', 'esya-kova.webp', { enBuyuk: true, delik: true });
  await esya('esya-kova-kurek.png', 'esya-kurek.webp', { sec: (l) => l.sort((a, b) => b.n - a.n)[1] });
  await esya('giysi-semsiye-kapali.png', 'esya-semsiye-kapali.webp', { enBuyuk: true });
  await esya('giysi-semsiye-acik.png', 'esya-semsiye-acik.webp', { enBuyuk: true, en: 800 });
  // albüm sayfaları (dört mevsim, fotoğraf yeri beyaz), Mevsim Ustası rozeti, Mino'nun yağmurluk topu hâli
  const yuva = {};
  for (const m of ['kis', 'ilkbahar', 'yaz', 'sonbahar']) {
    if (!fs.existsSync(H + `album-sayfa-${m}.png`)) continue;
    await esya(`album-sayfa-${m}.png`, `album-${m}.webp`, { enBuyuk: true, en: 700 });
    // fotoğraf yuvası: sayfanın içindeki en büyük kapalı beyaz alan (oran olarak)
    const { data, info } = await sharp(C + `album-${m}.webp`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const W = info.width, Y = info.height;
    const beyaz = Uint8Array.from({ length: W * Y }, (_, i) => (data[i * 4 + 3] > 200 && data[i * 4] > 238 && data[i * 4 + 1] > 238 && data[i * 4 + 2] > 238 ? 1 : 0));
    const { liste } = parcalar(beyaz, W, Y, 1000);
    const p = liste.sort((a, b) => b.n - a.n)[0];
    yuva[m] = [+(p.x0 / W).toFixed(4), +(p.y0 / Y).toFixed(4), +((p.x1 - p.x0) / W).toFixed(4), +((p.y1 - p.y0) / Y).toFixed(4), +(W / Y).toFixed(4)];
  }
  fs.writeFileSync(C + 'album.json', JSON.stringify(yuva));
  console.log('album yuva', yuva);
  if (fs.existsSync(H + 'esya-rozet-mevsim-ustasi.png')) await esya('esya-rozet-mevsim-ustasi.png', 'rozet-mevsim.webp', { enBuyuk: true, en: 600 });
  if (fs.existsSync(H + 'mino-yagmurluk-topu.png')) await esya('mino-yagmurluk-topu.png', 'mino-yagmurluk.webp', { enBuyuk: true, en: 700 });
  // Recraft eşyaları (dış sahne ve tepkiler): kumdan kale, arı, su sıçraması, çamur birikintisi, dalga
  await esya('r-kale.png', 'esya-kale.webp', { enBuyuk: true });
  await esya('r-ari.png', 'esya-ari.webp', { en: 360 });
  await esya('r-sicrama.png', 'esya-sicrama.webp', { en: 700 });
  await esya('r-camur.png', 'esya-camur.webp', { en: 900 });
  await esya('r-dalga.png', 'esya-dalga.webp', { en: 1100 });
  await esya('r-birikinti.png', 'esya-birikinti.webp', { en: 900 });
  // yağmur bulutu: ıslak Kino pozunun tepesindeki bulut ve damlaları
  if (fs.existsSync(H + 'kino-islak-buyuk.png')) await esya('kino-islak-buyuk.png', 'esya-bulut.webp', { en: 500, filtre: (p, g) => p.cy < g.H * 0.24 });
  // ıslak Kino (sonbahar penceresi): yağmur bulutu dahil, oturmuş; su birikintisi ayak hizasında
  if (fs.existsSync(H + 'kino-islak-buyuk.png')) await poz('kino-islak-buyuk.png', 'kino-islak.webp', 20, 1930);
  await tutulanlar();
  const yer = JSON.parse(fs.readFileSync('giysin/src/giysi-yer.json', 'utf8'));
  for (const ad of ['hirka', 'cizme', 'sapka', 'mayo', 'sandalet', 'yagmurluk', 'sepet', 'kova', 'semsiye-kapali', 'semsiye-acik', 'semsiye-kanca', 'pati-sag']) {
    if (!fs.existsSync(`ekip/giysin/parca/${ad}.json`)) continue;
    const b = JSON.parse(fs.readFileSync(`ekip/giysin/parca/${ad}.json`, 'utf8'));
    await sharp(`ekip/giysin/parca/${ad}.png`).webp(Q).toFile(`${C}giysi/${ad}.webp`);
    yer[ad] = [b.x, b.y, b.w, b.h];
  }
  fs.writeFileSync('giysin/src/giysi-yer.json', JSON.stringify(yer, null, 1) + '\n');
  await ikonlar(yer);
}

(async () => {
  if (process.argv[2] === 'mevsim') return mevsimler();
  if (process.argv[2] === 'tutulan') return tutulanlar();
  if (process.argv[2] === 'gemini') return gemini();
  if (process.argv[2] === 'gemini2') return gemini2();
  if (process.argv[2] === 'ikon') return ikonlar(JSON.parse(fs.readFileSync('giysin/src/giysi-yer.json', 'utf8')));
  fs.mkdirSync(C + 'giysi', { recursive: true });
  fs.mkdirSync(C + 'ikon', { recursive: true });
  await sahne('oda', 'oda.png');
  await sahne('dis-kis', 'dis-kis.png');
  // pencereden görünen manzara: dış sahnenin üst-orta kısmı (gök, tepeler, evler)
  await sharp(H + 'dis-kis.png').extract({ left: 900, top: 200, width: 2300, height: 1700 }).resize(1200).webp(Q).toFile(C + 'pencere-manzara-kis.webp');

  for (const [ad, en] of [['perde', 700], ['agac-kis', 800], ['ayna', 600]]) {
    const g = await oku(H + ad + '.png');
    await yaz(g, onPlan(g), ad + '.webp', { en });
  }
  // pencere: dört cam şeffaf (cam ortalarından taşma)
  {
    const g = await oku(H + 'pencere.png');
    const { W } = g;
    const t = [[310, 340], [590, 340], [310, 730], [590, 730]].map(([x, y]) => y * W + x);
    await yaz(g, onPlan(g, t), 'pencere.webp', { en: 900, kirp: false });
  }
  // dolap: kapalı hâlin iki kapağı ayrı (sarı kapak + kontur), gövde (kapaksız) açık resimden
  {
    const g = await oku(H + 'dolap-kapali.png');
    const { d, W, H: Y } = g;
    const fg = onPlan(g);
    let sari = new Uint8Array(W * Y);
    for (let i = 0; i < W * Y; i++) {
      const r = d[i * 3], gg = d[i * 3 + 1], b = d[i * 3 + 2];
      sari[i] = r > 180 && gg > 120 && b < 140 && r - b > 90 && gg > b + 40 ? 1 : 0;
    }
    sari = genis(delikDoldur(genis(sari, W, Y, 2), W, Y), W, Y, 4);
    // kapı aralığı: ortadaki koyu dikey çizgi
    let ek = Math.round(W / 2), enKoyu = 1e9;
    for (let x = Math.round(W * 0.42); x < W * 0.58; x++) {
      let t = 0;
      for (let y = Math.round(Y * 0.4); y < Y * 0.6; y++) t += d[(y * W + x) * 3];
      if (t < enKoyu) { enKoyu = t; ek = x; }
    }
    const sol = new Uint8Array(W * Y), sag = new Uint8Array(W * Y), govde = new Uint8Array(W * Y);
    for (let i = 0; i < W * Y; i++) {
      const x = i % W;
      if (sari[i] && fg[i]) { if (x <= ek + 1) sol[i] = 1; if (x >= ek - 1) sag[i] = 1; }
      govde[i] = fg[i];
    }
    const a = await yaz(g, sol, 'dolap-kapak-sol.webp', { kirp: false });
    await yaz(g, sag, 'dolap-kapak-sag.webp', { kirp: false });
    await yaz(g, govde, 'dolap-kapali.webp', { kirp: false });
    fs.writeFileSync(C + 'dolap.json', JSON.stringify({ en: W, boy: Y, aralik: ek }));
    void a;
    // açık dolap: kapalı hâlin tuvaline, gövde sınırları çakışacak biçimde (ölçek + kayma)
    const sinir = (m, w, y) => {
      let x0 = w, y0 = y, x1 = 0, y1 = 0;
      for (let i = 0; i < w * y; i++) if (m[i]) { const x = i % w, yy = (i / w) | 0; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, yy); y1 = Math.max(y1, yy); }
      return [x0, y0, x1, y1];
    };
    const kb = sinir(fg, W, Y);
    const ga = await oku(H + 'dolap-acik.png');
    const ab = sinir(onPlan(ga), ga.W, ga.H);
    const s = (kb[2] - kb[0]) / (ab[2] - ab[0]);
    const yeniW = Math.round(ga.W * s), yeniH = Math.round(ga.H * s);
    const kucuk = await sharp(H + 'dolap-acik.png').flatten({ background: '#ffffff' }).resize(yeniW, yeniH).png().toBuffer();
    const dx = Math.round(kb[0] - ab[0] * s), dy = Math.round(kb[1] - ab[1] * s);
    const tuval = await sharp({ create: { width: W, height: Y, channels: 3, background: '#ffffff' } })
      .composite([{ input: kucuk, left: Math.max(0, dx), top: Math.max(0, dy) }])
      .removeAlpha()
      .raw()
      .toBuffer();
    const gacik = { d: tuval, W, H: Y };
    await yaz(gacik, onPlan(gacik), 'dolap-acik.webp', { kirp: false });
    console.log('dolap hiza', { s, dx, dy, kb, ab });
  }
  // kapı: mavi kanat ayrı (açılır), çerçeve ayrı (kanadın yeri boş: arkasından ışık)
  {
    const g = await oku(H + 'kapi.png');
    const { d, W, H: Y } = g;
    const fg = onPlan(g);
    let mavi = new Uint8Array(W * Y);
    for (let i = 0; i < W * Y; i++) mavi[i] = d[i * 3 + 2] > d[i * 3] + 50 ? 1 : 0;
    mavi = genis(delikDoldur(genis(mavi, W, Y, 2), W, Y), W, Y, 3);
    const kanat = new Uint8Array(W * Y), cerceve = new Uint8Array(W * Y);
    for (let i = 0; i < W * Y; i++) { kanat[i] = mavi[i] && fg[i] ? 1 : 0; cerceve[i] = fg[i] && !mavi[i] ? 1 : 0; }
    await yaz(g, kanat, 'kapi-kanat.webp', { kirp: false });
    await yaz(g, cerceve, 'kapi-cerceve.webp', { kirp: false });
  }
  // kardan adam parçaları
  {
    const g = await oku(H + 'kardan.png');
    const { d, W, H: Y } = g;
    const fg = onPlan(g);
    let turuncu = new Uint8Array(W * Y);
    for (let i = 0; i < W * Y; i++) { const r = d[i * 3], gg = d[i * 3 + 1], b = d[i * 3 + 2]; turuncu[i] = r > 200 && gg > 90 && gg < 180 && b < 100 ? 1 : 0; }
    turuncu = genis(turuncu, W, Y, 5);
    const { et, liste } = parcalar(fg, W, Y, 800);
    const sirali = liste.sort((a, b) => b.n - a.n);
    const ad = {};
    for (const p of sirali) {
      if (p.cy < Y * 0.4 && p.cx > W * 0.3 && p.cx < W * 0.7) ad.buyuk ??= p;
      else if (p.cx < W * 0.4 && p.cy > Y * 0.3 && p.cy < Y * 0.62) ad.orta ??= p;
      else if (p.cx < W * 0.7 && p.cy > Y * 0.62) ad.bas ??= p;
      else if (p.cx > W * 0.7 && p.cy > Y * 0.82) ad.atki ??= p;
      else if (p.cx > W * 0.65 && p.cx < W * 0.79) ad.dalSol ??= p;
      else if (p.cx >= W * 0.79) ad.dalSag ??= p;
    }
    for (const [n, p] of Object.entries(ad)) {
      let m = sadece(et, p.id);
      if (n === 'bas') m = Uint8Array.from(m, (v, i) => (v && turuncu[i] ? 1 : 0));
      await yaz(g, m, `kardan-${n === 'bas' ? 'havuc' : n}.webp`);
    }
  }
  // eşyalar: buz sarkıtı, fotoğraf makinesi, polaroid, rozet
  {
    const g = await oku(H + 'esya.png');
    const { W, H: Y } = g;
    const fg = onPlan(g);
    const { et, liste } = parcalar(fg, W, Y, 800);
    for (const p of liste) {
      const n = p.cy < Y * 0.4 ? 'buz' : p.cx > W * 0.68 ? 'rozet' : p.cy > Y * 0.62 ? 'polaroid' : 'kamera';
      await yaz(g, sadece(et, p.id), `${n}.webp`);
    }
  }
  // giysiler: Kino iskeletinin 2048 koordinatında (konum giysin/src/giysi-yer.json)
  const yer = {};
  const GIYSI = { bere: 'bere', atki: 'atki', mont: 'mont-ham', 'eldiven-sol': 'eldiven-sol', 'eldiven-sag': 'eldiven-sag', bot: 'bot2', corap: 'corap', sort: 'sort', gozluk: 'gozluk' };
  for (const [ad, kaynak] of Object.entries(GIYSI)) {
    const b = JSON.parse(fs.readFileSync(`ekip/giysin/parca/${kaynak}.json`, 'utf8'));
    await sharp(`ekip/giysin/parca/${kaynak}.png`).webp(Q).toFile(`${C}giysi/${ad}.webp`);
    yer[ad] = [b.x, b.y, b.w, b.h];
  }
  await ikonlar(yer);
  // Gemini dolabı ve pencere katmanları Recraft'ınkilerin yerine geçer (dolap-*.webp ezilir)
  await gemini();
  fs.writeFileSync('giysin/src/giysi-yer.json', JSON.stringify(yer, null, 1) + '\n');
  console.log(yer);
})();
