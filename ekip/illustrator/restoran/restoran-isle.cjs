// Tıkır Tıkır Lokanta: Gemini sayfalarını keser (Illustrator'suz; pati-isle.cjs ve kino-otobus-musteri-kes.cjs kalıbı).
// Kaynak: ekip/gemini/yeni/restoran/<dosya>.png (ekip/senaryo/RESTORAN.md §11). Çıktı: assets/restoran/<grup>/<ad>.webp
// Oyun klasörü kendisi tarar (restoran/src/varliklar.ts): dosya gelince yer tutucu kalkar, kod değişmez.
//
//   node ekip/illustrator/restoran/restoran-isle.cjs                 # gelmiş bütün sayfalar
//   node ekip/illustrator/restoran/restoran-isle.cjs lokanta-yatay sebze-domates   # yalnız bunlar
//   --girdi <klasör> --cikti <klasör>   (deneme için; varsayılanlar yukarıda)
//   --liste                             # sayfa listesi ve durum (geldi / bekleniyor)
//
// Sayfa türleri:
//  arka     : arka plan / istasyon (tam boy; uzun kenar en çok 2752; netlik: istasyon ekranda büyütülmez).
//  esya     : nesne sayfası (düz nane yeşili zemin #DFF5E8): zemin beyaza çevrilir, nesneler bağlantılı bileşenlerle
//             bulunur (yakın parçalar tek nesne: küp yığını, damlalar ayrı satırda değilse birleşir), satır satır soldan
//             sağa sıralanır, sayfadaki ad listesiyle birebir eşlenir. Sayı tutmazsa KESİLMEZ: bulunan kutular yazılır
//             (yalnız bozuk kare yeni sohbette düzeltilir; §11a). Şeffaflık gemini-esya.cjs ile.
//  kisi     : 2×4 poz sayfası: aynı ölçek, aynı taban çizgisi (gemini-esya --esit --esit-hiza alt) → kisi/<kim>/<poz>.webp
// Büyük dosya ezilmez (guvenli-yaz.cjs; ZORLA=1 ile ezilir).
const fs = require('fs'), os = require('os'), path = require('path'), { execFileSync } = require('child_process');
const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const yaz = require('../guvenli-yaz.cjs');

const KOK = path.resolve(__dirname, '../../..');
const arg = (ad, v) => { const i = process.argv.indexOf('--' + ad); return i >= 0 ? process.argv[i + 1] : v; };
const G = path.resolve(arg('girdi', path.join(KOK, 'ekip/gemini/yeni/restoran')));
const CIKTI = path.resolve(arg('cikti', path.join(KOK, 'assets/restoran')));
const ARA = path.join(os.tmpdir(), 'minkino-restoran');
const ESYA_KES = path.join(KOK, 'ekip/illustrator/gemini-esya.cjs');
const BAYRAK = new Set(['--girdi', '--cikti']);
const istenen = process.argv.slice(2).filter((x, i, d) => !x.startsWith('--') && !BAYRAK.has(d[i - 1]));

/** LOKANTA-KARELER (müşteri sayfaları, §11a): 8 poz */
const MUSTERI_POZ = ['giris', 'selam', 'otur', 'otur-kirp', 'ye', 'bayildi', 'sasir', 'eksi'];

/**
 * SAYFALAR: dosya adı (uzantısız) → ne olacağı. Ad listeleri §11'deki istem sırasıyla (soldan sağa, üstten alta).
 * grup: assets/restoran altındaki klasör. max: kesilen nesnenin uzun kenarı (0 = küçültme yok; büyük sebzeler
 * ekranda ~330 css px × 3 = 990 px'ten büyük gerekir).
 */
const SAYFALAR = {
  // ---- R-Gün 1
  'lokanta-yatay': { tur: 'arka', ad: 'arka/lokanta-yatay' },
  'istasyon-tezgah': { tur: 'arka', ad: 'istasyon/tezgah' },
  'istasyon-ocak': { tur: 'arka', ad: 'istasyon/ocak' },
  'istasyon-servis': { tur: 'arka', ad: 'istasyon/servis' },
  'sebze-domates': { tur: 'esya', grup: 'yiyecek', max: 0, adlar: ['domates-butun', 'domates-yarim', 'domates-dilim', 'domates-yarimay', 'domates-kup', 'domates-pure', 'domates-damla-1', 'domates-damla-2', 'domates-damla-3'] },
  'sebze-salatalik': { tur: 'esya', grup: 'yiyecek', max: 0, adlar: ['salatalik-butun', 'salatalik-kesit', 'salatalik-dilim', 'salatalik-kup', 'salatalik-kabuk', 'salatalik-boyuna'] },
  'sebze-sogan-biber': { tur: 'esya', grup: 'yiyecek', max: 0, adlar: ['sogan-butun', 'sogan-soyulmus', 'sogan-dilim', 'sogan-kup', 'sogan-kabuk-1', 'sogan-kabuk-2', 'sogan-kabuk-3', 'biber-butun', 'biber-yarim', 'biber-cekirdek', 'biber-halka'], sutun: 2 },
  'mutfak-aletleri-1': { tur: 'esya', grup: 'alet', max: 1400, adlar: ['bicak', 'spatula', 'tava', 'kepce', 'zeytinyagi', 'tuzluk', 'pulbiber', 'limon-yarim', 'yumurta', 'yumurta-catlak', 'yumurta-kabuk', 'yumurta-tavada', 'tepsi', 'hesap-tabagi', 'kase', 'ekmek'] },
  'babaanne-lokanta-sayfasi': { tur: 'kisi', kim: 'babaanne', adlar: ['konus', 'anahtar', 'tat', 'alkis', 'gul', 'sasir', 'fikir', 'gule'] },
  'kino-garson-sayfasi': { tur: 'kisi', kim: 'kino', adlar: ['tepsi', 'yuru-1', 'yuru-2', 'koy', 'yaz', 'sallan', 'patates', 'tabaklar'] },
  // ---- R-Gün 2
  'mino-mutfak-sayfasi': { tur: 'kisi', kim: 'mino', adlar: ['mutlu', 'kirp', 'agla', 'tat', 'eksi', 'hapsir', 'sevin', 'bak'] },
  'lokum-lokanta-sayfasi': { tur: 'kisi', kim: 'lokum', adlar: MUSTERI_POZ },
  'anne-lokanta-sayfasi': { tur: 'kisi', kim: 'anne', adlar: MUSTERI_POZ },
  'baba-lokanta-sayfasi': { tur: 'kisi', kim: 'baba', adlar: MUSTERI_POZ },
  'dede-lokanta-sayfasi': { tur: 'kisi', kim: 'dede', adlar: MUSTERI_POZ },
  'tombi-lokanta-sayfasi': { tur: 'kisi', kim: 'tombi', adlar: MUSTERI_POZ },
  'bidik-lokanta-sayfasi': { tur: 'kisi', kim: 'bidik', adlar: MUSTERI_POZ },
  'zipzip-lokanta-sayfasi': { tur: 'kisi', kim: 'zipzip', adlar: MUSTERI_POZ },
  'bulut-lokanta-sayfasi': { tur: 'kisi', kim: 'bulut', adlar: MUSTERI_POZ },
  'efekt-sayfasi': { tur: 'esya', grup: 'efekt', max: 600, adlar: ['buhar', 'duman', 'kulak-duman', 'gozyasi', 'gozyasi-akis', 'ter', 'kalp', 'kalp-pembe', 'yildiz', 'parilti', 'balon', 'kopuk', 'alev', 'damla-kirmizi', 'damla-yesil', 'yag', 'toz', 'zil-parilti', 'jeton', 'jeton-bahsis'] },
  // ---- R-Gün 3
  'lokanta-dikey': { tur: 'arka', ad: 'arka/lokanta-dikey' },
  'istasyon-lavabo': { tur: 'arka', ad: 'istasyon/lavabo' },
  'istasyon-mermer': { tur: 'arka', ad: 'istasyon/mermer' },
  'istasyon-icecek': { tur: 'arka', ad: 'istasyon/icecek' },
  'istasyon-icecek-dikey': { tur: 'arka', ad: 'istasyon/icecek-dikey' },
  'nehir-lokanta-sayfasi': { tur: 'kisi', kim: 'nehir', adlar: MUSTERI_POZ },
  // P2 (Doğra, Tava): adlar restoran/src/mini/dogra/gorsel.ts ve tava/index.ts'in aradığı adlar (§11d #26-28)
  'sebze-patates-havuc': { tur: 'esya', grup: 'yiyecek', max: 0, adlar: ['patates-butun', 'patates-soyulmus', 'patates-dilim', 'patates-cubuk', 'patates-kabuk', 'havuc-butun', 'havuc-soyulmus', 'havuc-dilim', 'havuc-rende', 'havuc-kabuk', 'havuc-kurdan'], sutun: 2 },
  'sebze-yesillik': { tur: 'esya', grup: 'yiyecek', max: 0, adlar: ['maydanoz-butun', 'maydanoz-kiyim', 'maydanoz-yaprak', 'marul-butun', 'marul-yaprak', 'marul-serit', 'ugur-bocegi', 'camur-a', 'camur-b', 'camur-c'] },
  'yiyecek-tava': { tur: 'esya', grup: 'yiyecek', max: 1400, adlar: ['menemen-cig', 'menemen-pismis', 'menemen-az-karisik', 'menemen-cok-karisik', 'pankek-hamur', 'pankek-altin', 'pankek-citir', 'pankek-kabarcik'] },
  // ---- R-Gün 4
  'bidik-baba-lokanta-sayfasi': { tur: 'kisi', kim: 'bidik-baba', adlar: MUSTERI_POZ },
  'bidicik-lokanta-sayfasi': { tur: 'kisi', kim: 'bidicik', adlar: MUSTERI_POZ },
  'disci-lokanta-sayfasi': { tur: 'kisi', kim: 'disci', adlar: MUSTERI_POZ },
  'tuhaf-teyze-lokanta-sayfasi': { tur: 'kisi', kim: 'tuhaf-teyze', adlar: MUSTERI_POZ },
  'kasa-defter': { tur: 'esya', grup: 'ui', max: 1400, adlar: ['kasa', 'kasa-acik', 'defter', 'defter-acik', 'kart-cerceve', 'masa-yuvasi', 'levha-kapali', 'levha-acik', 'adisyon', 'mandal-kirmizi', 'mandal-mavi', 'mandal-sari', 'mandal-yesil'] },
  // ---- R-Gün 5
  'istasyon-firin': { tur: 'arka', ad: 'istasyon/firin' },
  'istasyon-firin-dikey': { tur: 'arka', ad: 'istasyon/firin-dikey' },
  'istasyon-mangal': { tur: 'arka', ad: 'istasyon/mangal' },
  'masalar': { tur: 'esya', grup: 'sus', max: 1600, adlar: ['masa', 'masa-kareli', 'masa-cicekli', 'masa-puantiyeli', 'masa-cocuk', 'masa-bahce', 'mama-sandalyesi'] },
  'bahce-yatay': { tur: 'arka', ad: 'arka/bahce-yatay' },
  'bahce-dikey': { tur: 'arka', ad: 'arka/bahce-dikey' },
  'lokanta-dis': { tur: 'arka', ad: 'arka/lokanta-dis' },
  // ---- R-Gün 6
  'palyaco-tavsan-lokanta-sayfasi': { tur: 'kisi', kim: 'palyaco-tavsan', adlar: MUSTERI_POZ },
  'kelime-yutan-lokanta-sayfasi': { tur: 'kisi', kim: 'kelime-yutan-tavsan', adlar: MUSTERI_POZ },
  'babaanne-musteri-sayfasi': { tur: 'kisi', kim: 'babaanne-musteri', adlar: MUSTERI_POZ },
  'kapak': { tur: 'arka', ad: 'arka/kapak' },
};

const kaynak = (ad) => ['.png', '.jpg', '.jpeg', '.webp'].map((u) => path.join(G, ad + u)).find((f) => fs.existsSync(f));

// ---------------------------------------------------------------- arka plan
async function arka(ad, o) {
  const f = kaynak(ad);
  const m = await s(f).metadata();
  if (Math.max(m.width, m.height) < 2048) console.log(`UYARI ${ad}: ${m.width}x${m.height} (2048'in altı; §11a: reddedilir, yeniden çizilmeli)`);
  const buf = await s(f).removeAlpha().resize({ width: m.width >= m.height ? Math.min(2752, m.width) : undefined, height: m.height > m.width ? Math.min(2752, m.height) : undefined, withoutEnlargement: true }).webp({ quality: 88, effort: 5 }).toBuffer();
  const yol = path.join(CIKTI, o.ad + '.webp');
  if (await yaz(yol, buf)) console.log(`${o.ad}.webp ${m.width}x${m.height} ${Math.round(buf.length / 1024)} KB`);
}

// ---------------------------------------------------------------- zemin ve nesne bulma
/** Köşelerden zemin rengi (nane yeşili ya da beyaz) */
function zeminRengi(data, W, H) {
  const ornek = [];
  for (const [x0, y0] of [[0, 0], [W - 24, 0], [0, H - 24], [W - 24, H - 24]])
    for (let y = y0; y < y0 + 24; y += 4) for (let x = x0; x < x0 + 24; x += 4) { const i = (y * W + x) * 3; ornek.push([data[i], data[i + 1], data[i + 2]]); }
  const orta = (k) => ornek.map((p) => p[k]).sort((a, b) => a - b)[ornek.length >> 1];
  return [orta(0), orta(1), orta(2)];
}

/** Zemini beyaza çevirir (gemini-esya beyaz zemin bekler); zemin maskesi döner */
function beyazla(data, W, H, z, esik = 30) {
  const zemin = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    if (Math.hypot(r - z[0], g - z[1], b - z[2]) < esik) { zemin[i] = 1; data[i * 3] = data[i * 3 + 1] = data[i * 3 + 2] = 255; }
  }
  return zemin;
}

/** Bağlantılı bileşenler (yakın parçalar R px şişirmeyle birleşir) → kutular [x0,y0,x1,y1] */
function nesneler(zemin, W, H, R, enAzAlan) {
  // küçültülmüş ızgarada çalış (hız): 4 px hücre
  const K = 4, w = Math.ceil(W / K), h = Math.ceil(H / K), dolu = new Uint8Array(w * h);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!zemin[y * W + x]) dolu[((y / K) | 0) * w + ((x / K) | 0)]++;
  const m = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) m[i] = dolu[i] > 3 ? 1 : 0;
  const r = Math.max(1, Math.round(R / K)), sis = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { if (!m[y * w + x]) continue; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < w && yy < h) sis[yy * w + xx] = 1; } }
  const et = new Int32Array(w * h).fill(-1), q = new Int32Array(w * h), kutular = [];
  for (let i = 0; i < w * h; i++) {
    if (!sis[i] || et[i] >= 0) continue;
    let b = 0, e = 0, alan = 0, x0 = w, y0 = h, x1 = 0, y1 = 0;
    q[e++] = i; et[i] = kutular.length;
    while (b < e) {
      const p = q[b++], x = p % w, y = (p / w) | 0;
      if (m[p]) { alan++; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      for (const d of [-1, 1, -w, w]) { const n = p + d; if (n < 0 || n >= w * h || et[n] >= 0 || !sis[n]) continue; if ((d === -1 && x === 0) || (d === 1 && x === w - 1)) continue; et[n] = kutular.length; q[e++] = n; }
    }
    kutular.push({ alan: alan * K * K, k: [x0 * K, y0 * K, Math.min(W, (x1 + 1) * K), Math.min(H, (y1 + 1) * K)] });
  }
  return kutular.filter((k) => k.alan >= enAzAlan).map((k) => k.k);
}

/** Satırlara ayır (dikey örtüşme), satır içinde soldan sağa. sutun > 1: sayfa önce dikey yarılara bölünür (§11 iki sebzeli sayfalar). */
function sirala(kutular, W, sutun = 1) {
  const parcalar = Array.from({ length: sutun }, (_, i) => kutular.filter((k) => Math.min(sutun - 1, Math.floor((((k[0] + k[2]) / 2) / W) * sutun)) === i));
  const sonuc = [];
  for (const p of parcalar) {
    const kalan = p.slice().sort((a, b) => a[1] - b[1]);
    const satirlar = [];
    for (const k of kalan) {
      const s = satirlar.find((r) => Math.min(r.y1, k[3]) - Math.max(r.y0, k[1]) > Math.min(r.y1 - r.y0, k[3] - k[1]) * 0.35);
      if (s) { s.k.push(k); s.y0 = Math.min(s.y0, k[1]); s.y1 = Math.max(s.y1, k[3]); } else satirlar.push({ y0: k[1], y1: k[3], k: [k] });
    }
    satirlar.sort((a, b) => a.y0 - b.y0);
    for (const r of satirlar) sonuc.push(...r.k.sort((a, b) => a[0] - b[0]));
  }
  return sonuc;
}

// ---------------------------------------------------------------- nesne ve poz sayfaları
async function sayfa(ad, o) {
  const f = kaynak(ad);
  const { data, info } = await s(f).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  if (Math.max(W, H) < 2048) console.log(`UYARI ${ad}: ${W}x${H} (2048'in altı)`);
  const z = zeminRengi(data, W, H);
  const zemin = beyazla(data, W, H, z, o.esik || 30);
  // yakın parçalar birleşsin: nesne sayfasında %1,2, poz sayfasında %2 (kollar, kuyruk, balon)
  const R = Math.round(Math.max(W, H) * (o.tur === 'kisi' ? 0.02 : o.birlestir || 0.012));
  let kutular = sirala(nesneler(zemin, W, H, R, W * H * (o.tur === 'kisi' ? 0.004 : 0.0004)), W, o.sutun || 1);
  if (kutular.length !== o.adlar.length) {
    console.log(`${ad}: ${kutular.length} nesne bulundu, ${o.adlar.length} bekleniyordu; KESİLMEDİ. Kutular (x0,y0,x1,y1):`);
    kutular.forEach((k, i) => console.log(`  ${i + 1}. ${k.join(',')}`));
    return false;
  }
  const girdi = path.join(ARA, ad);
  fs.rmSync(girdi, { recursive: true, force: true });
  fs.mkdirSync(girdi, { recursive: true });
  const beyaz = s(data, { raw: { width: W, height: H, channels: 3 } });
  const tam = await beyaz.png().toBuffer();
  for (let i = 0; i < kutular.length; i++) {
    const [x0, y0, x1, y1] = kutular[i], P = 16;
    const l = Math.max(0, x0 - P), t = Math.max(0, y0 - P), w = Math.min(W, x1 + P) - l, h = Math.min(H, y1 + P) - t;
    // kutu + pay kırpılır; komşu nesnenin küçük kırıntısı gemini-esya.cjs'te elenir (minOran: en büyük parçanın %1'i)
    await s(tam).extract({ left: l, top: t, width: w, height: h }).extend({ top: 8, bottom: 8, left: 8, right: 8, background: '#ffffff' }).png().toFile(path.join(girdi, `${o.adlar[i]}.png`));
  }
  const cikti = o.tur === 'kisi' ? path.join(CIKTI, 'kisi', o.kim) : path.join(CIKTI, o.grup);
  fs.mkdirSync(cikti, { recursive: true });
  const ek = o.tur === 'kisi' ? ['--esit', '.', '--esit-hiza', 'alt', '--max', '1400'] : ['--max', String(o.max ?? 1024)];
  execFileSync('node', [ESYA_KES, '--girdi', girdi, '--cikti', cikti, ...ek, '--ayar', JSON.stringify(o.ayar || {})], { stdio: 'inherit', cwd: KOK });
  // kişi sayfası: ölçü (tepe, taban, bel) oyunun boy hesabı için (restoran/src/lokanta/kisi.ts okur)
  if (o.tur === 'kisi') await olcuYaz(cikti, o);
  return true;
}

/** Kişi pozlarının ortak tuvalinde figürün tepe / taban çizgisi (alfa > 60) → <kim>/olcu.json */
async function olcuYaz(klasor, o) {
  const olcu = {};
  for (const p of o.adlar) {
    const f = path.join(klasor, p + '.webp');
    if (!fs.existsSync(f)) continue;
    const { data, info } = await s(f).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let tepe = info.height, taban = 0;
    for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x += 2) if (data[(y * info.width + x) * 4 + 3] > 60) { tepe = Math.min(tepe, y); taban = Math.max(taban, y); }
    olcu[p] = { en: info.width, boy: info.height, tepe, taban };
  }
  fs.writeFileSync(path.join(klasor, 'olcu.json'), JSON.stringify(olcu, null, 1) + '\n');
}

(async () => {
  if (process.argv.includes('--liste')) {
    for (const ad of Object.keys(SAYFALAR)) console.log(`${kaynak(ad) ? 'GELDİ     ' : 'bekleniyor'} ${ad}`);
    return;
  }
  let yapilan = 0, bekleyen = 0;
  for (const [ad, o] of Object.entries(SAYFALAR)) {
    if (istenen.length && !istenen.includes(ad)) continue;
    if (!kaynak(ad)) { bekleyen++; if (istenen.length) console.log(`${ad}: sayfa yok (bekleniyor)`); continue; }
    try {
      if (o.tur === 'arka') await arka(ad, o);
      else await sayfa(ad, o);
      yapilan++;
    } catch (e) {
      console.log(`${ad}: HATA ${e.message}`);
    }
  }
  console.log(`Bitti: ${yapilan} sayfa işlendi, ${bekleyen} sayfa bekleniyor (${path.relative(KOK, G)}).`);
})();
