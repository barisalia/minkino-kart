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
  // servis tezgâhının ortasındaki boş tabak ayrıca kesilir: Tabakla'nın ve masaya giden yemeğin tabağı (alet/tabak);
  // daire [cx, cy, r] bu çizimde ölçüldü (dış kontur r≈552 px); istasyondaki tabakla birebir aynı
  'istasyon-servis': { tur: 'arka', ad: 'istasyon/servis', daire: { 'alet/tabak': [1376, 814, 556] } },
  'sebze-domates': { tur: 'esya', grup: 'yiyecek', max: 0, adlar: ['domates-butun', 'domates-yarim', 'domates-dilim', 'domates-yarimay', 'domates-kup', 'domates-pure', 'domates-damla-1', 'domates-damla-2', 'domates-damla-3'] },
  'sebze-salatalik': { tur: 'esya', grup: 'yiyecek', max: 0, adlar: ['salatalik-butun', 'salatalik-kesit', 'salatalik-dilim', 'salatalik-kup', 'salatalik-kabuk', 'salatalik-boyuna'], don: { 'salatalik-boyuna': -90 } },
  'sebze-sogan-biber': { tur: 'esya', grup: 'yiyecek', max: 0, adlar: ['sogan-butun', 'sogan-soyulmus', 'sogan-dilim', 'sogan-kup', 'sogan-kabuk-1', 'sogan-kabuk-2', 'sogan-kabuk-3', 'biber-butun', 'biber-yarim', 'biber-halka', 'biber-cekirdek'], sutun: 2 },
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
  // P3 (Çalkala ve Doldur): adlar restoran/src/mini/icecek'in aradığı adlar (§11d #29); önden, hepsi yiyecek/
  'ayran-limonata': { tur: 'esya', grup: 'yiyecek', max: 1400, adlar: ['surahi-bos', 'surahi-yogurtlu', 'surahi-ayran', 'bardak-bos', 'bardak-ayran', 'bardak-limonata', 'limon-yarim', 'limon-sikilmis', 'limon-cekirdek', 'buz-kupu', 'kopuk-taci'] },
  'yiyecek-tava': { tur: 'esya', grup: 'yiyecek', max: 1400, adlar: ['menemen-cig', 'menemen-pismis', 'menemen-az-karisik', 'menemen-cok-karisik', 'pankek-hamur', 'pankek-altin', 'pankek-citir', 'pankek-kabarcik'] },
  // ---- R-Gün 4
  'bidik-baba-lokanta-sayfasi': { tur: 'kisi', kim: 'bidik-baba', adlar: MUSTERI_POZ },
  'bidicik-lokanta-sayfasi': { tur: 'kisi', kim: 'bidicik', adlar: MUSTERI_POZ },
  'disci-lokanta-sayfasi': { tur: 'kisi', kim: 'disci', adlar: MUSTERI_POZ },
  'tuhaf-teyze-lokanta-sayfasi': { tur: 'kisi', kim: 'tuhaf-teyze', adlar: MUSTERI_POZ },
  'kasa-defter': { tur: 'esya', grup: 'ui', max: 1400, adlar: ['kasa', 'kasa-acik', 'defter', 'defter-acik', 'kart-cerceve', 'masa-yuvasi', 'levha-kapali', 'levha-acik', 'adisyon', 'mandal-kirmizi', 'mandal-mavi', 'mandal-sari', 'mandal-yesil'] },
  // P5 (Kır ve Çırp, Kazan, Rendele, Pide): adlar restoran/src/mini/{kir-cirp,kazan,rendele,pide} aradığı adlar (§11e #37-39, §11f #43).
  // soyacak-rende P3 (Soy) ile ortak: soyacak ve kabuk kovası onun. Kod yiyecek/ ve alet/ klasörlerinin ikisine de bakar.
  'istasyon-kazan': { tur: 'esya', grup: 'alet', max: 1600, adlar: ['kazan', 'kazan-su', 'kazan-corba', 'kazan-sutlac', 'kazan-kepce', 'corba-kasesi', 'corba-kasesi-dolu', 'nane-kavanozu', 'mercimek-yigin', 'kabarcik'] },
  'soyacak-rende': { tur: 'esya', grup: 'alet', max: 1400, adlar: ['soyacak', 'rende', 'kasar-butun', 'kasar-yarim', 'kasar-rende', 'kabuk-kovasi', 'kabuk-kovasi-dolu'] },
  'yumurta-cirpma': { tur: 'esya', grup: 'alet', max: 1400, adlar: ['kase-yumurta', 'kase-yari', 'kase-puruzsuz', 'un-yigin', 'sut-gol', 'seker-kasik', 'cirpma-teli', 'yumurta-kabuk-parca', 'sut-sisesi', 'un-kavanozu', 'seker-kavanozu'] },
  // P3 (Kızart): adlar restoran/src/mini/kizart'ın aradığı adlar (§11e #36); tuzluk mutfak-aletleri-1'den
  'istasyon-fritoz': { tur: 'esya', grup: 'alet', max: 1600, adlar: ['fritoz', 'sepet-bos', 'sepet-ham', 'sepet-altin', 'kulah', 'kulah-dolu', 'ketcap', 'ketcap-nokta'] },
  'pide-sayfasi': { tur: 'esya', grup: 'yiyecek', max: 1400, adlar: ['hamur-top', 'hamur-yari', 'hamur-kayik', 'hamur-yuvarlak', 'hamur-delik', 'pide-cig', 'pide-kasarli', 'pide-yumurtali', 'sucuk-dilim', 'kasar-serpinti', 'firin-kuregi'] },
  // ---- R-Gün 5
  'istasyon-firin': { tur: 'arka', ad: 'istasyon/firin' },
  'istasyon-firin-dikey': { tur: 'arka', ad: 'istasyon/firin-dikey' },
  'istasyon-mangal': { tur: 'arka', ad: 'istasyon/mangal' },
  'masalar': { tur: 'esya', grup: 'sus', max: 1600, adlar: ['masa', 'masa-kareli', 'masa-cicekli', 'masa-puantiyeli', 'masa-cocuk', 'masa-bahce', 'mama-sandalyesi'] },
  // #47 süs sayfası (P4: lokanta/yerlesim.ts → sus/<ad>; gelene kadar projedeki onaylı eşyalar)
  'sus-1': { tur: 'esya', grup: 'sus', max: 1200, adlar: ['perde', 'saksi', 'bitki', 'resim', 'avize', 'akvaryum', 'gramofon', 'babaanne-foto', 'saat', 'flama', 'fener', 'menu-tahtasi'] },
  'bahce-yatay': { tur: 'arka', ad: 'arka/bahce-yatay' },
  'bahce-dikey': { tur: 'arka', ad: 'arka/bahce-dikey' },
  'lokanta-dis': { tur: 'arka', ad: 'arka/lokanta-dis' },
  // ---- R-Gün 6
  'palyaco-tavsan-lokanta-sayfasi': { tur: 'kisi', kim: 'palyaco-tavsan', adlar: MUSTERI_POZ },
  'kelime-yutan-lokanta-sayfasi': { tur: 'kisi', kim: 'kelime-yutan-tavsan', adlar: MUSTERI_POZ },
  'babaanne-musteri-sayfasi': { tur: 'kisi', kim: 'babaanne-musteri', adlar: MUSTERI_POZ },
  'kapak': { tur: 'arka', ad: 'arka/kapak' },
  // ---- R-GÜN 3/4-A (§11h #65-74, P8): 3/4 lokanta sahnesi, masa-sandalye, 3/4 süsler, HUD, balonlar.
  // Adlar restoran/src/lokanta/{sahne34,hud,istek-gorsel}.ts'in aradığı adlar. Ad sonunda RAKAM YOK (varliklar.ts
  // '-2', '-3' sürüm ekini okur: 'masa-34' masa'nın 34. sürümü sanılırdı).
  'lokanta-34-yatay': { tur: 'arka', ad: 'arka/lokanta-34-yatay' },
  'lokanta-34-yatay-bahceli': { tur: 'arka', ad: 'arka/lokanta-34-yatay-bahceli' },
  'lokanta-34-dikey': { tur: 'arka', ad: 'arka/lokanta-34-dikey' },
  'lokanta-34-dikey-bahceli': { tur: 'arka', ad: 'arka/lokanta-34-dikey-bahceli' },
  'masa-sandalye-34': { tur: 'esya', grup: 'masa', max: 1400, adlar: ['masa', 'masa-kareli', 'masa-cicekli', 'masa-puantiyeli', 'sandalye', 'bahce-masa', 'bahce-sandalye', 'mama-sandalyesi', 'cocuk-masa', 'tabak', 'bardak', 'vazo'] },
  'sus-34': { tur: 'esya', grup: 'sus', max: 1400, adlar: ['feslegen', 'sepet-bitki', 'akvaryum-dolap', 'gramofon-tabure', 'balon-demeti', 'bal-rafi', 'paravan', 'minder', 'fener-asili', 'sardunya', 'bank', 'kedi-uyur', 'kedi-gerin', 'kedi-yalan'] },
  // HUD paneli: iki parça (dikey tabela, yatay şerit), küçültülmez (kenarı 9 dilim olarak gerilir)
  'hud-panel': { tur: 'esya', grup: 'hud', max: 0, adlar: ['panel-dikey', 'panel-yatay'] },
  'hud-parcalar': { tur: 'esya', grup: 'hud', max: 900, adlar: ['takvim-gunes', 'takvim-bulut', 'takvim-yagmur', 'kavanoz-bos', 'kavanoz-dolu', 'sandik-kapali', 'sandik-acik', 'defter', 'liste', 'menu-tahtasi', 'ayar', 'ses'] },
  // balon ikonları: 12 tarif (model.ts TARIFLER sırasıyla) ve durum / ipucu (model.ts IPUCLARI) resimleri
  'balon-ikon-yemek': { tur: 'esya', grup: 'balon', max: 700, adlar: ['yemek-salata', 'yemek-menemen', 'yemek-ayran', 'yemek-patates', 'yemek-corba', 'yemek-pankek', 'yemek-pide', 'yemek-kofte', 'yemek-limonata', 'yemek-sis', 'yemek-borek', 'yemek-sutlac'] },
  // ---- R-GÜN 3/4-B (§11h #75): Kino'nun 3/4 sahne kareleri (önden / arkadan yürüyüş, arkası dönük koyuş, levha, süpürme, kayma)
  'kino-34-yuru': { tur: 'kisi', kim: 'kino', izgara: [4, 2], adlar: ['on-1', 'on-2', 'arka-1', 'arka-2', 'arka-koy', 'levha', 'supur', 'kay'] },
  // #76 sıra sayfası A. Anne'nin 1. satırı yanlışlıkla gözü kapalı çizildi: kullanılmaz (sira-1-hatali), sira-1 yerine duruş
  'sira-sayfasi-a': { tur: 'sira', izgara: [6, 3], kimler: ['lokum', 'anne', 'baba', 'dede', 'babaanne', 'tombi'], adlar: ['sira-1', 'sira-2', 'sira-3'], adlarOzel: { anne: ['sira-hatali', 'sira-2', 'sira-3'] } },
  'sira-sayfasi-b': { tur: 'sira', izgara: [6, 3], kimler: ['zipzip', 'bulut', 'bidik', 'bidicik', 'bidik-baba', 'nehir'], adlar: ['sira-1', 'sira-2', 'sira-3'] },
  'sira-sayfasi-c': { tur: 'sira', izgara: [4, 3], kimler: ['disci', 'tuhaf-teyze', 'palyaco-tavsan', 'kelime-yutan-tavsan'], adlar: ['sira-1', 'sira-2', 'sira-3'] },
  'balon-ikon-durum': { tur: 'esya', grup: 'balon', max: 700, adlar: ['balon-sol', 'balon-sag', 'balon-kucuk', 'balon-dusunce', 'unlem', 'soru', 'kalp', 'zzz', 'hesap', 'ipucu-serin', 'ipucu-doyurucu', 'ipucu-domatesli', 'ipucu-citir', 'ipucu-tatli', 'ipucu-sebzeli', 'sef-sapka'] },
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
  // çizimdeki daire biçimli eşya ayrıca kesilir (tabak): daire dışı saydam, kenar 1,5 px yumuşak
  for (const [hedef, [cx, cy, r]] of Object.entries(o.daire || {})) {
    const l = Math.max(0, cx - r), t = Math.max(0, cy - r), w = Math.min(m.width, cx + r) - l, h = Math.min(m.height, cy + r) - t;
    const { data, info } = await s(f).removeAlpha().extract({ left: l, top: t, width: w, height: h }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
      const d = Math.hypot(x + l + 0.5 - cx, y + t + 0.5 - cy);
      data[(y * info.width + x) * 4 + 3] = Math.round(255 * Math.max(0, Math.min(1, (r - d) / 1.5)));
    }
    const b = await s(data, { raw: { width: info.width, height: info.height, channels: 4 } }).webp({ quality: 94, alphaQuality: 100, effort: 5 }).toBuffer();
    if (await yaz(path.join(CIKTI, hedef + '.webp'), b)) console.log(`${hedef}.webp ${info.width}x${info.height} (${ad} çiziminden)`);
  }
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
  // her kutu etiket ızgarasını da taşır (et: hücre → nesne; kesimde komşunun pikselleri ayıklanır)
  const tutulan = new Set();
  const sonuc = kutular.map((k, id) => ({ ...k, id })).filter((k) => k.alan >= enAzAlan).map((k) => (tutulan.add(k.id), Object.assign(k.k, { id: k.id, et, K, w, tutulan })));
  return sonuc;
}

/**
 * Izgara kesimi [sütun, satır]: karelerin içindeki eşya / kol (tepsi) komşu kareye değiyorsa bağlantılı bileşen ayıramaz;
 * her kare kendi sınırına kırpılmış kutu olur (soldan sağa, üstten alta). Gemini kareleri eşit dizdiğinde kullanılır.
 */
function izgaraKutulari(zemin, W, H, [sutun, satir]) {
  const kutular = [];
  const et = new Int32Array(1).fill(-1);
  // satırlar eşit aralıklı olmayabilir (uzun karakterin ayağı alt kareye taşar): sütun şeridinde dikey izdüşümle
  // boşluklarla ayrılmış koşular bulunur; tam 'satir' koşu çıkarsa onlar kullanılır
  const sutunKosulari = (cx0, cx1) => {
    const kos = [];
    let bas = -1, bos = 0;
    for (let y = 0; y < H; y++) {
      let n = 0;
      for (let x = cx0 + 2; x < cx1 - 2; x += 2) if (!zemin[y * W + x]) n++;
      if (n > 2) { if (bas < 0) bas = y; bos = 0; }
      else if (bas >= 0 && ++bos > 10) { kos.push([bas, y - bos]); bas = -1; }
    }
    if (bas >= 0) kos.push([bas, H - 1]);
    return kos.filter(([a, b]) => b - a > H * 0.08);
  };
  const koslar = Array.from({ length: sutun }, (_, c) => sutunKosulari(Math.round((c * W) / sutun), Math.round(((c + 1) * W) / sutun)));
  for (let r = 0; r < satir; r++)
    for (let c = 0; c < sutun; c++) {
      const kos = koslar[c].length === satir ? koslar[c][r] : null;
      const cx0 = Math.round((c * W) / sutun), cx1 = Math.round(((c + 1) * W) / sutun), cy0 = kos ? Math.max(0, kos[0] - 3) : Math.round((r * H) / satir), cy1 = kos ? Math.min(H, kos[1] + 4) : Math.round(((r + 1) * H) / satir);
      let x0 = cx1, y0 = cy1, x1 = cx0, y1 = cy0;
      for (let y = cy0 + 2; y < cy1 - 2; y++) for (let x = cx0 + 2; x < cx1 - 2; x++) if (!zemin[y * W + x]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (x1 <= x0) continue;
      kutular.push(Object.assign([x0, y0, x1 + 1, y1 + 1], { id: kutular.length, et, K: W + H, w: 1, tutulan: new Set() }));
    }
  return kutular;
}

/**
 * Nesne sayısı ad listesini tutmazsa birleştirme yarıçapı adım adım küçültülür (Gemini nesneleri sıkı dizdiğinde:
 * üst üste satırlar, damlalar, kabuk yığını). İlk tutan yarıçap kullanılır; hiçbiri tutmazsa null (kesilmez).
 */
function tutanBul(zemin, W, H, R0, enAzAlan, sutun, beklenen) {
  let fazla = null;
  for (let k = 0.96; k >= 0.1; k -= 0.02) {
    const R = Math.max(4, Math.round(R0 * k));
    const ham = nesneler(zemin, W, H, R, enAzAlan);
    if (ham.length === beklenen) return { R, kutular: sirala(ham, W, sutun) };
    if (ham.length > beklenen && !fazla) fazla = { R, ham };
  }
  if (!fazla || fazla.ham.length > beklenen + 4) return null;
  // Hiçbir yarıçap tutmadı (ör. damlalar ayrılmadan küp yığını dağılıyor): ilk fazla çıkan yarıçapta en küçük
  // parça en yakın komşusuna katılır (kutu boşluğu), sayı tutana dek. Etiket ızgarası da birleştirilir.
  const ks = fazla.ham.slice();
  const bosluk = (a, b) => Math.hypot(Math.max(0, a[0] - b[2], b[0] - a[2]), Math.max(0, a[1] - b[3], b[1] - a[3]));
  const alan = (k) => (k[2] - k[0]) * (k[3] - k[1]);
  while (ks.length > beklenen) {
    ks.sort((a, b) => alan(a) - alan(b));
    const kucuk = ks.shift();
    let en = ks[0], eb = Infinity;
    for (const k of ks) { const b = bosluk(kucuk, k); if (b < eb) { eb = b; en = k; } }
    for (let i = 0; i < en.et.length; i++) if (en.et[i] === kucuk.id) en.et[i] = en.id;
    en[0] = Math.min(en[0], kucuk[0]); en[1] = Math.min(en[1], kucuk[1]); en[2] = Math.max(en[2], kucuk[2]); en[3] = Math.max(en[3], kucuk[3]);
  }
  return { R: fazla.R, kutular: sirala(ks, W, sutun) };
}

/**
 * Kişi sayfalarındaki ayak altı gölgesi (zeminin koyu nane tonu, ~#AFDAC6): zemine DEĞEN gölge pikselleri zemin
 * (beyaz) olur. Yalnız zeminden akar: karakterin içindeki açık yeşil/nane renkler kapalı konturla korunur.
 */
function golgeTemizle(data, W, H, zemin, z) {
  const n = W * H;
  const golgeMi = (i) => {
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    return g - r >= z[1] - z[0] - 6 && g - r <= z[1] - z[0] + 40 && b - r >= 4 && g - b >= 6 && g - b <= 40 && r >= z[0] - 75 && r < z[0] + 4;
  };
  const q = new Int32Array(n);
  let bas = 0, son = 0, sayi = 0;
  for (let i = 0; i < n; i++) if (zemin[i]) q[son++] = i;
  while (bas < son) {
    const p = q[bas++], x = p % W;
    for (const d of [-1, 1, -W, W]) {
      const r = p + d;
      if (r < 0 || r >= n || zemin[r]) continue;
      if ((d === -1 && x === 0) || (d === 1 && x === W - 1)) continue;
      if (!golgeMi(r)) continue;
      zemin[r] = 1; data[r * 3] = data[r * 3 + 1] = data[r * 3 + 2] = 255; q[son++] = r; sayi++;
    }
  }
  // gölgenin yumuşak kenarı (zeminle gölge arası ara ton): zemine bitişik, açık nane
  for (let tur = 0; tur < 3; tur++) {
    const sil = [];
    for (let i = 0; i < n; i++) {
      if (zemin[i]) continue;
      const x = i % W;
      if (!((x > 0 && zemin[i - 1]) || (x < W - 1 && zemin[i + 1]) || (i >= W && zemin[i - W]) || (i + W < n && zemin[i + W]))) continue;
      const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
      if (g - r >= 18 && b - r >= 0 && r >= 150) sil.push(i);
    }
    for (const i of sil) { zemin[i] = 1; data[i * 3] = data[i * 3 + 1] = data[i * 3 + 2] = 255; sayi++; }
  }
  return sayi;
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
  if (o.tur === 'kisi') console.log(`${ad}: ayak gölgesi temizlendi (${golgeTemizle(data, W, H, zemin, z)} px)`);
  // yakın parçalar birleşsin: nesne sayfasında %1,2, poz sayfasında %2 (kollar, kuyruk, balon)
  const R = Math.round(Math.max(W, H) * (o.tur === 'kisi' ? 0.02 : o.birlestir || 0.012));
  const enAz = W * H * (o.tur === 'kisi' ? 0.004 : 0.0004);
  let kutular = o.izgara ? izgaraKutulari(zemin, W, H, o.izgara) : sirala(nesneler(zemin, W, H, R, enAz), W, o.sutun || 1);
  // sıra sayfası: her SÜTUN bir karakter (sutunSec), satırlar pozlar
  if (o.izgara && o.sutunSec != null) kutular = kutular.filter((_, i) => i % o.izgara[0] === o.sutunSec);
  if (kutular.length !== o.adlar.length) {
    const t = tutanBul(zemin, W, H, R, enAz, o.sutun || 1, o.adlar.length);
    if (t) {
      console.log(`${ad}: birleştirme yarıçapı ${R} → ${t.R} px (${o.adlar.length} nesne)`);
      kutular = t.kutular;
    } else {
      console.log(`${ad}: ${kutular.length} nesne bulundu, ${o.adlar.length} bekleniyordu; KESİLMEDİ. Kutular (x0,y0,x1,y1):`);
      kutular.forEach((k, i) => console.log(`  ${i + 1}. ${k.slice(0, 4).join(',')}`));
      return false;
    }
  }
  const girdi = path.join(ARA, ad);
  fs.rmSync(girdi, { recursive: true, force: true });
  fs.mkdirSync(girdi, { recursive: true });
  for (let i = 0; i < kutular.length; i++) {
    const kt = kutular[i], [x0, y0, x1, y1] = kt, P = 16;
    const l = Math.max(0, x0 - P), t = Math.max(0, y0 - P), w = Math.min(W, x1 + P) - l, h = Math.min(H, y1 + P) - t;
    // kutu + pay kırpılır; kutuya düşen BAŞKA nesnenin pikselleri (etiket ızgarası) beyazlanır: sıkı dizilmiş
    // sayfada (damlalar, kabuklar, üst üste satırlar) komşu parça kesime girmez
    const parca = Buffer.alloc(w * h * 3);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const X = l + x, Y = t + y, j = (y * w + x) * 3, k = (Y * W + X) * 3;
      const e = kt.et[((Y / kt.K) | 0) * kt.w + ((X / kt.K) | 0)];
      if (e >= 0 && e !== kt.id && kt.tutulan.has(e)) { parca[j] = parca[j + 1] = parca[j + 2] = 255; continue; }
      parca[j] = data[k]; parca[j + 1] = data[k + 1]; parca[j + 2] = data[k + 2];
    }
    await s(parca, { raw: { width: w, height: h, channels: 3 } }).extend({ top: 8, bottom: 8, left: 8, right: 8, background: '#ffffff' }).png().toFile(path.join(girdi, `${o.adlar[i]}.png`));
  }
  const cikti = o.tur === 'kisi' ? path.join(CIKTI, 'kisi', o.kim) : path.join(CIKTI, o.grup);
  fs.mkdirSync(cikti, { recursive: true });
  const ek = o.tur === 'kisi' ? ['--esit', '.', '--esit-hiza', 'alt', '--max', '1400'] : ['--max', String(o.max ?? 1024)];
  execFileSync('node', [ESYA_KES, '--girdi', girdi, '--cikti', cikti, ...ek, '--ayar', JSON.stringify(o.ayar || {})], { stdio: 'inherit', cwd: KOK });
  // yanlış yönde çizilmiş parça döndürülür (ör. boyuna yarım salatalık dik çizilmiş; bütün salatalık gibi yatar)
  for (const [p, derece] of Object.entries(o.don || {})) {
    const f = path.join(cikti, p + '.webp');
    if (!fs.existsSync(f)) continue;
    const b = await s(fs.readFileSync(f)).rotate(derece).webp({ quality: 94, alphaQuality: 100, effort: 5 }).toBuffer();
    fs.writeFileSync(f, b);
    console.log(`${p}: ${derece}° döndürüldü`);
  }
  // kişi sayfası: ölçü (tepe, taban, bel) oyunun boy hesabı için (restoran/src/lokanta/kisi.ts okur)
  if (o.tur === 'kisi') await olcuYaz(cikti, o);
  return true;
}

/** Kişi pozlarının ortak tuvalinde figürün tepe / taban çizgisi (alfa > 60) → <kim>/olcu.json */
async function olcuYaz(klasor, o) {
  // aynı kişinin başka sayfadan gelen pozları korunur (ör. Kino: garson sayfası + kino-34-yuru)
  const eski = path.join(klasor, 'olcu.json');
  const olcu = fs.existsSync(eski) ? JSON.parse(fs.readFileSync(eski, 'utf8')) : {};
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

/**
 * Doğal boy tablosu (assets/restoran/olcu.json): kesilmiş her eşyanın [en, boy] pikseli. Oyun resmi yüklemeden
 * oranını ve netlik sınırını bilsin diye (restoran/src/mini/dogra/gorsel.ts okur). Kişi pozları kendi olcu.json'unda.
 */
async function boyTablosu() {
  const tablo = {};
  for (const grup of fs.existsSync(CIKTI) ? fs.readdirSync(CIKTI) : []) {
    const k = path.join(CIKTI, grup);
    if (grup === 'kisi' || !fs.statSync(k).isDirectory()) continue;
    for (const f of fs.readdirSync(k).filter((x) => x.endsWith('.webp')).sort()) {
      const m = await s(path.join(k, f)).metadata();
      tablo[`${grup}/${f.replace(/\.webp$/, '')}`] = [m.width, m.height];
    }
  }
  fs.writeFileSync(path.join(CIKTI, 'olcu.json'), JSON.stringify(tablo).replace(/\],/g, '],\n ').replace(/^\{/, '{\n ').replace(/\}$/, '\n}') + '\n');
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
      else if (o.tur === 'sira') {
        // §11h #76-78: sütun = karakter, satır = poz (sira-1 bekler, sira-2 gözü kapalı, sira-3 koklar / el kaldırır)
        for (const [c, kim] of o.kimler.entries()) await sayfa(ad, { tur: 'kisi', kim, izgara: o.izgara, sutunSec: c, adlar: o.adlarOzel?.[kim] ?? o.adlar });
      } else await sayfa(ad, o);
      yapilan++;
    } catch (e) {
      console.log(`${ad}: HATA ${e.message}`);
    }
  }
  await boyTablosu();
  console.log(`Bitti: ${yapilan} sayfa işlendi, ${bekleyen} sayfa bekleniyor (${path.relative(KOK, G)}).`);
})();
