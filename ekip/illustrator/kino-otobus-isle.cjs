// Gemini "Kino'nun Otobüsü" seti (ekip/gemini/yeni/kino-otobus/*.png, beyaz zemin, ≥2048) → assets/kino-otobus/<ad>.webp.
// Yeni dosya gelince tekrar çalıştırılır (güvenli: daha büyük mevcut dosya ezilmez, guvenli-yaz.cjs; ZORLA=1 ile ezilir).
//   node ekip/illustrator/kino-otobus-isle.cjs [--girdi <klasör>] [ad ...]   (repo kökünden; girdi varsayılanı ekip/gemini/yeni/kino-otobus)
// Kurallar (IS-LISTESI-YENI.md bölüm A ve D, "Şeffaf" sütunu):
//  - E (şeffaf): gemini-esya.cjs ile zemin KENARDAN akıtılarak silinir (çizimin içindeki beyazlar kalır, kahve kontur halesiz), kırpılır.
//  - H (zemin kalır): ic-arka, pencere-dogumgunu → yalnız küçültülür.
//  - otobus: Gemini tuvali korunur (16:9, otobüs ortada; varliklar.ts → OTOBUS_YERI bu tuvalde ölçüldü).
//  - top-*: ortak tuval, tabandan hizalı (kule yerleşimi tek ölçü: varliklar.ts → YERLESIM.top).
//  - sos-*-ust, serpinti-ust: topun tuvaline oturtulur (topun kubbesini örter, tepeden hizalı) → kulede topla aynı kutu.
//  - kap-*: ortak tuval, tabandan hizalı (dolapta hepsi aynı boy).
//  - Yeniden çizim: <ad>-v2.png (-v3 …) varsa <ad> için en yüksek sürüm kullanılır, eski <ad>.png atlanır; yeni çizim
//    olduğu için mevcut <ad>.webp'yi (daha büyük olsa da) ezer. Çıktı adı sürümsüz <ad>.webp (varliklar.ts anahtarı).
//  - kapak: menü kartı ve açılış resmi (zemin kalır, metinsiz Gemini sahnesi).
const { execFileSync } = require('child_process'), fs = require('fs'), os = require('os'), path = require('path');
const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const guvenliYaz = require('./guvenli-yaz.cjs');
const gi = process.argv.indexOf('--girdi');
const G = gi >= 0 ? process.argv.splice(gi, 2)[1] : 'ekip/gemini/yeni/kino-otobus', O = 'assets/kino-otobus', ARA = path.join(os.tmpdir(), 'kino-otobus-kes');
const ATLA = [];   // bilerek elle düzeltilen dosyalar buraya (betik yeniden üretmesin)
const ARKA = ['ic-arka', 'pencere-dogumgunu', 'kapak'];
/** çıktının uzun kenarı (px): ekranda en büyük hâli × DPR 3 */
const EN = { otobus: 1920, 'tezgah-on': 2800, dolap: 2000, 'ic-arka': 3072, 'pencere-dogumgunu': 2752, kapak: 2400, 'sus-flama': 1600, 'sus-ampul': 2400, 'sus-kemik-tabela': 1280, 'kino-onluk': 1280, 'kino-sapka': 1280 };
const VARSAYILAN_EN = 1024;
/**
 * Zemin kalan görsellerde kırpma (oran: tuvalin eni/boyu). pencere-dogumgunu: Gemini kendi pencere çerçevesini ve
 * çubuklu yan camları da çizdi; oyunun kendi çerçevesi (ic-arka) olduğu için yalnız orta camın içindeki bahçe alınır.
 * Kırpma yalnız ilk çizime (v1) uygulanır: pencere-dogumgunu-v2 çerçevesiz, kenardan kenara bahçe partisi (16:9, ortası
 * açık); tamamı alınır ve hem gün içi penceresinde hem tam ekran akşam sahnesinde kullanılır (uzun kenar 2752: DPR 3
 * telefonda tam ekran net).
 */
const KIRP = { 'pencere-dogumgunu': { sol: 0.2762, ust: 0.1107, en: 0.4506, boy: 0.7585 } };
/** gemini-esya ayarları (dosya başına) */
// kino-onluk: boyun askısının içi kapalı beyaz bölge → delik (şeffaf)
const AYAR = { otobus: { tuvalKoru: true }, 'kino-onluk': { delik: true } };

const secili = process.argv.slice(2);
// ad → en yüksek sürümün dosyası ("ic-arka-v2" > "ic-arka")
const kaynak = new Map();
for (const f of fs.readdirSync(G).filter((f) => f.endsWith('.png')).map((f) => f.replace(/\.png$/, ''))) {
  const m = /-v(\d+)$/.exec(f), ad = m ? f.slice(0, m.index) : f, n = m ? +m[1] : 1, e = kaynak.get(ad);
  if (!e || n > e.n) kaynak.set(ad, { f, n });
}
const tum = [...kaynak.keys()].filter((a) => !ATLA.includes(a) && (!secili.length || secili.includes(a)));
/** yeniden çizilenler (v2+): mevcut dosyayı ezer */
const YENI_CIZIM = new Set(tum.filter((a) => kaynak.get(a).n > 1));
// sürümsüz adlarla geçici girdi klasörü (gemini-esya dosya adını çıktı adı yapar)
const GI = path.join(os.tmpdir(), 'kino-otobus-girdi');
fs.rmSync(GI, { recursive: true, force: true });
fs.mkdirSync(GI, { recursive: true });
for (const a of tum) fs.copyFileSync(path.join(G, kaynak.get(a).f + '.png'), path.join(GI, a + '.png'));
if (YENI_CIZIM.size) console.log('yeniden çizim (ezer):', [...YENI_CIZIM].map((a) => kaynak.get(a).f).join(', '));
const kesilecek = tum.filter((a) => !ARKA.includes(a));

const webp = (img) => img.webp({ quality: 94, alphaQuality: 100, effort: 5 }).toBuffer();
async function yaz(ad, buf) {
  const m = await s(buf).metadata();
  const yol = path.join(O, ad + '.webp');
  const yazildi = YENI_CIZIM.has(ad) ? (fs.writeFileSync(yol, buf), true) : await guvenliYaz(yol, buf);
  if (yazildi) console.log(`${ad}: ${m.width}x${m.height}, ${Math.round(buf.length / 1024)} KB`);
}
/** uzun kenar en çok n px */
const kucult = (img, m, n) => (Math.max(m.width, m.height) > n ? img.resize(m.width >= m.height ? n : null, m.width >= m.height ? null : n, { kernel: 'lanczos3' }) : img);
/** alfa: satır satır [sol, sağ] (boş satır null) */
async function satirlar(buf) {
  const { data, info } = await s(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const r = [];
  for (let y = 0; y < info.height; y++) {
    let a = -1, b = -1;
    for (let x = 0; x < info.width; x++) if (data[(y * info.width + x) * 4 + 3] > 128) { if (a < 0) a = x; b = x; }
    r.push(a < 0 ? null : [a, b]);
  }
  return { r, W: info.width, H: info.height };
}
const enGenis = (r, y0, y1) => Math.max(...r.slice(y0, y1).map((x) => (x ? x[1] - x[0] : 0)));
const ilkSatir = (r) => r.findIndex((x) => x);

/** ic-arka v2 → şeffaf pencereli çerçeve + 9 dilim ölçüleri (çıktı px) */
async function icCerceve() {
  const { data, info } = await s(path.join(GI, 'ic-arka.png')).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, n = W * H;
  const GRI = [203, 203, 203];
  const griMi = (i) => { const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2]; return Math.abs(r - g) < 10 && Math.abs(g - b) < 10 && r > 180 && r < 222; };
  // gri bölge: ortadan akıtılır
  const R = new Uint8Array(n), q = new Int32Array(n); let bas = 0, son = 0;
  const t0 = (H >> 1) * W + (W >> 1); R[t0] = 1; q[son++] = t0;
  while (bas < son) { const p = q[bas++], x = p % W; for (const d of [-1, 1, -W, W]) { const r = p + d; if (r < 0 || r >= n || R[r]) continue; if ((d === -1 && x === 0) || (d === 1 && x === W - 1)) continue; if (!griMi(r)) continue; R[r] = 1; q[son++] = r; } }
  // gri kutu (orta satır / orta sütun)
  const yo = H >> 1, xo = W >> 1;
  let gx0 = 0; while (!R[yo * W + gx0]) gx0++;
  let gx1 = W - 1; while (!R[yo * W + gx1]) gx1--;
  let gy1 = H - 1; while (!R[gy1 * W + xo]) gy1--;
  // fırfırın en alt ucu: sütun sütun ilk gri satırın en büyüğü (köşelerden uzakta)
  let fir = 0;
  for (let x = gx0 + Math.round((gx1 - gx0) * 0.05); x < gx1 - (gx1 - gx0) * 0.05; x++) { let y = 0; while (y < H && !R[y * W + x]) y++; fir = Math.max(fir, y); }
  // çerçevenin dış kenarı: orta satırda griden dışa doğru ilk fayans (açık, sıcak) piksel
  const fayans = (i) => { const r = data[i * 3], b = data[i * 3 + 2]; return r > 215 && r - b > 40; };
  let cx0 = gx0; while (cx0 > 0 && !fayans(yo * W + cx0 - 1)) cx0--;
  let cx1 = gx1; while (cx1 < W - 1 && !fayans(yo * W + cx1 + 1)) cx1++;
  // pervazın alt konturu: griden aşağı, pervazdan sonraki ilk mavi satırdan önce
  const mavi = (i) => data[i * 3 + 2] > data[i * 3] + 40;
  let cy1 = gy1 + 1; while (cy1 < H && !mavi(cy1 * W + xo)) cy1++;
  // alfa: gri bölge 0; çevresindeki 3 px halka griden ayrıştırılır (c = a·F + (1-a)·G; F: 4 px içindeki griden en uzak renk)
  const out = Buffer.alloc(n * 4);
  const uzak = (i) => { const r = data[i * 3] - GRI[0], g = data[i * 3 + 1] - GRI[1], b = data[i * 3 + 2] - GRI[2]; return Math.sqrt(r * r + g * g + b * b); };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, p = i * 4;
    if (R[i]) { out[p + 3] = 0; continue; }
    let yakin = false;
    for (let dy = -3; dy <= 3 && !yakin; dy++) for (let dx = -3; dx <= 3; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < H && R[yy * W + xx]) { yakin = true; break; } }
    if (!yakin) { out[p] = data[i * 3]; out[p + 1] = data[i * 3 + 1]; out[p + 2] = data[i * 3 + 2]; out[p + 3] = 255; continue; }
    let F = null, fd = -1;
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; const j = yy * W + xx; if (R[j]) continue; const d = uzak(j); if (d > fd) { fd = d; F = j; } }
    const c = [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]], f = [data[F * 3], data[F * 3 + 1], data[F * 3 + 2]];
    // c - G = a (F - G) → a, F yönüne izdüşüm
    let num = 0, den = 0; for (let k = 0; k < 3; k++) { num += (c[k] - GRI[k]) * (f[k] - GRI[k]); den += (f[k] - GRI[k]) ** 2; }
    const a = den > 0 ? Math.max(0, Math.min(1, num / den)) : 1;
    out[p] = f[0]; out[p + 1] = f[1]; out[p + 2] = f[2]; out[p + 3] = Math.round(a * 255);
  }
  const kw = cx1 - cx0 + 1, kh = cy1;
  const kirp = await s(out, { raw: { width: W, height: H, channels: 4 } }).extract({ left: cx0, top: 0, width: kw, height: kh }).png().toBuffer();
  const olc = Math.min(1, EN['ic-arka'] / kw), ow = Math.round(kw * olc), oh = Math.round(kh * olc);
  await yaz('ic-arka', await webp(s(kirp).resize(ow, oh, { kernel: 'lanczos3' })));
  const r = (v) => Math.round(v * olc);
  // 9 dilim: sol/sağ = çerçevenin kalınlığı (dış kenardan griye), üst = fırfırın altı, alt = grinin altından pervazın altına
  // camın tepesi (fırfırların arasındaki en üst gri satır): çerçevenin üst kalınlığı
  let gy0 = H;
  for (let x = gx0 + 20; x < gx1 - 20; x++) { let y = 0; while (y < H && !R[y * W + x]) y++; gy0 = Math.min(gy0, y); }
  console.log('IC_ARKA_CERCEVE =', JSON.stringify({ en: ow, boy: oh, sol: r(gx0 - cx0), sag: r(cx1 - gx1), ust: r(fir + 2), cam: r(gy0), alt: r(kh - gy1 - 1) }));
}

(async () => {
  fs.mkdirSync(O, { recursive: true });
  // 1) şeffaf kesim (tam çözünürlük, ara klasöre)
  if (kesilecek.length) {
    fs.rmSync(ARA, { recursive: true, force: true });
    execFileSync('node', [path.join(__dirname, 'gemini-esya.cjs'), '--girdi', GI, '--cikti', ARA, '--max', '0', '--ayar', JSON.stringify(AYAR), ...kesilecek], { stdio: 'inherit' });
  }
  const kes = (ad) => fs.readFileSync(path.join(ARA, ad + '.webp'));
  const var_ = (ad) => kesilecek.includes(ad);

  // 2a) iç duvar v2 (gri maske): pencere ÇERÇEVESİ katmanı olur. Gri alan şeffaf (kenarı griden ayrıştırılır, hale yok),
  // çerçevenin dışındaki fayans duvar ve pervazın altı kırpılır; 9 dilim ölçüleri yazdırılır (varliklar.ts → IC_ARKA_CERCEVE)
  if (tum.includes('ic-arka') && kaynak.get('ic-arka').n > 1) {
    await icCerceve();
  }
  // 2) arka planlar (zemin kalır)
  for (const ad of tum.filter((a) => ARKA.includes(a) && !(a === 'ic-arka' && kaynak.get(a).n > 1))) {
    let img = s(path.join(GI, ad + '.png')).removeAlpha(), m = await img.metadata();
    const k = kaynak.get(ad).n > 1 ? null : KIRP[ad];
    if (k) {
      const kutu = { left: Math.round(k.sol * m.width), top: Math.round(k.ust * m.height), width: Math.round(k.en * m.width), height: Math.round(k.boy * m.height) };
      img = s(await img.extract(kutu).png().toBuffer());
      m = { width: kutu.width, height: kutu.height };
    }
    await yaz(ad, await kucult(img, m, EN[ad]).webp({ quality: 90, effort: 5 }).toBuffer());
  }

  // 3) otobüs: tuval korunur, tam 16:9'a tamamlanır (üst/alt eşit boşluk)
  if (var_('otobus')) {
    const b = kes('otobus'), m = await s(b).metadata(), H = Math.round((m.width * 9) / 16), ek = Math.max(0, H - m.height);
    const tuval = await s(b).extend({ top: ek >> 1, bottom: ek - (ek >> 1), left: 0, right: 0, background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    await yaz('otobus', await webp(s(tuval).resize(EN.otobus, Math.round((EN.otobus * 9) / 16), { kernel: 'lanczos3' })));
  }

  // 4) toplar: ortak tuval, tabandan hizalı
  const toplar = kesilecek.filter((a) => /^top-/.test(a));
  let topTuval = null;
  const ortak = async (adlar, adSon) => {
    const parcalar = await Promise.all(adlar.map(async (ad) => ({ ad, b: kes(ad), m: await s(kes(ad)).metadata() })));
    const TW = Math.max(...parcalar.map((p) => p.m.width)), TH = Math.max(...parcalar.map((p) => p.m.height));
    const olc = Math.min(1, VARSAYILAN_EN / Math.max(TW, TH));
    for (const p of parcalar) {
      const t = await s({ create: { width: TW, height: TH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
        .composite([{ input: p.b, left: Math.round((TW - p.m.width) / 2), top: TH - p.m.height }]).png().toBuffer();
      if (adSon) adSon(p.ad, t);
      await yaz(p.ad, await webp(s(t).resize(Math.round(TW * olc), Math.round(TH * olc), { kernel: 'lanczos3' })));
    }
    return { TW, TH, olc };
  };
  if (toplar.length) {
    let ornek = null;
    const t = await ortak(toplar, (ad, buf) => { if (!ornek) ornek = buf; });
    topTuval = { ...t, ornek };
  } else if (fs.existsSync(path.join(O, 'top-cilek.webp'))) {
    const b = fs.readFileSync(path.join(O, 'top-cilek.webp')), m = await s(b).metadata();
    topTuval = { TW: m.width, TH: m.height, olc: 1, ornek: b };
  }

  // 5) topun üstüne oturanlar: sos-*-ust, serpinti-ust → topun tuvali; eni topun kubbesinin 1.08 katı, tepesi topun tepesinden biraz yukarı
  const ustler = kesilecek.filter((a) => /^sos-.*-ust$|^serpinti-ust$/.test(a));
  if (ustler.length && topTuval) {
    const top = await satirlar(topTuval.ornek), kubbeEn = enGenis(top.r, 0, Math.round(top.H * 0.58)), topTepe = ilkSatir(top.r);
    for (const ad of ustler) {
      const b = kes(ad), u = await satirlar(b), ust = Math.max(0, topTepe - Math.round(top.H * 0.012));
      // akıntılar topun tabanını geçmesin: tuvale sığacak kadar
      // tuvalden taşmasın (topun kubbesi tuvalin enine yakınsa 1.08 katı sığmaz)
      const k = Math.min((kubbeEn * 1.08) / enGenis(u.r, 0, u.H), (top.H - ust) / u.H, top.W / u.W);
      const w = Math.round(u.W * k), hh = Math.round(u.H * k);
      const kucuk = await s(b).resize(w, hh, { kernel: 'lanczos3' }).png().toBuffer();
      const t = await s({ create: { width: top.W, height: top.H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
        .composite([{ input: kucuk, left: Math.round((top.W - w) / 2), top: Math.min(ust, top.H - hh) }]).png().toBuffer();
      const olc = Math.min(1, VARSAYILAN_EN / Math.max(top.W, top.H));
      await yaz(ad, await webp(s(t).resize(Math.round(top.W * olc), Math.round(top.H * olc), { kernel: 'lanczos3' })));
    }
  } else if (ustler.length) console.log('UYARI: top görseli yok; sos/serpinti üstleri topa oturtulamadı:', ustler.join(', '));

  // 6) tat kapları: ortak tuval
  const kaplar = kesilecek.filter((a) => /^kap-/.test(a));
  if (kaplar.length) await ortak(kaplar);

  // 7) geri kalan tekler: kırpılmış hâli
  const yapilan = new Set(['otobus', ...toplar, ...ustler, ...kaplar]);
  for (const ad of kesilecek.filter((a) => !yapilan.has(a))) {
    const b = kes(ad), m = await s(b).metadata();
    await yaz(ad, await webp(kucult(s(b), m, EN[ad] ?? VARSAYILAN_EN)));
  }
})();
