/**
 * Paket Doktor-Y1 kaynak çizimlerini (ekip/doktor/y1/kaynak/) oyunun tuvallerine oturtur ve webp olarak
 * assets/doktor/vaka/ içine yazar. Çizim bozulmaz: en-boy oranı korunur, yalnız ölçeklenir ve yerine konur.
 *
 *   npx vite-node doktor/araclar/y1-bagla.ts            # hepsi
 *   npx vite-node doktor/araclar/y1-bagla.ts -- kol-temiz sargi-sarili   # yalnız adı verilenler
 *
 * Sonra: npx vite-node doktor/araclar/y1-denetle.ts -- --kesit hepsi
 * Yerleşim sayıları sahne pikselidir (2048 × 1152); oyundaki karşılıkları doktor/src/vaka/veri.ts içinde.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { kenarRenginiYay, type Resim } from './gorsel-mantik';
import { HUB, SAHNE, TUVAL } from '../src/vaka/veri';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const KAYNAK = path.join(KOK, 'ekip/doktor/y1/kaynak');
const HEDEF = path.join(KOK, 'assets/doktor/vaka');
const istenen = process.argv.slice(2).filter(a => !a.startsWith('--'));

interface Kutu { x0: number; y0: number; x1: number; y1: number; }
const oku = async (dosya: string): Promise<Resim> => {
  const { data, info } = await sharp(path.join(KAYNAK, dosya)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { g: info.width, y: info.height, d: new Uint8Array(data.buffer, data.byteOffset, data.length) };
};
const alfa = (r: Resim, x: number, y: number): number => r.d[(y * r.g + x) * 4 + 3];
function kutu(r: Resim, x0 = 0, x1 = r.g - 1): Kutu {
  const k = { x0: r.g, y0: r.y, x1: -1, y1: -1 };
  for (let y = 0; y < r.y; y++) for (let x = x0; x <= x1; x++) if (alfa(r, x, y) > 40) { if (x < k.x0) k.x0 = x; if (x > k.x1) k.x1 = x; if (y < k.y0) k.y0 = y; if (y > k.y1) k.y1 = y; }
  return k;
}
/** Sayfadaki pozlar: boş sütunlarla ayrılan öbekler, soldan sağa. */
function pozlar(r: Resim): Kutu[] {
  const dolu: boolean[] = [];
  for (let x = 0; x < r.g; x++) { let n = 0; for (let y = 0; y < r.y; y++) if (alfa(r, x, y) > 40) n++; dolu.push(n > 2); }
  const araliklar: [number, number][] = [];
  let bas = -1, bos = 0;
  for (let x = 0; x <= r.g; x++) {
    if (x < r.g && dolu[x]) { if (bas < 0) bas = x; bos = 0; } else if (bas >= 0 && (++bos > 25 || x === r.g)) { araliklar.push([bas, x - bos]); bas = -1; }
  }
  return araliklar.filter(a => a[1] - a[0] > 60).map(([a, b]) => kutu(r, a, b));
}
/** Kutunun sağ kenarındaki `en` sütunda görünen piksellerin dikey ortası (uzatılmış patinin ortası). */
function sagUcOrtasi(r: Resim, k: Kutu, en = 50): number {
  let y0 = r.y, y1 = -1;
  for (let y = k.y0; y <= k.y1; y++) for (let x = k.x1 - en; x <= k.x1; x++) if (alfa(r, x, y) > 128) { if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return (y0 + y1) / 2;
}
/** Kutunun sol kenarındaki `en` sütunda, üstten `boy` pikselde görünenlerin dikey ortası (spreyin ağzı). */
function solUcOrtasi(r: Resim, k: Kutu, en = 14, boy = 400): number {
  let y0 = r.y, y1 = -1;
  for (let y = k.y0; y <= Math.min(k.y1, k.y0 + boy); y++) for (let x = k.x0; x <= k.x0 + en; x++) if (alfa(r, x, y) > 128) { if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return (y0 + y1) / 2;
}

/** Kaynağın `k` kutusunu `olcek` ile ölçekler; kutunun (kx, ky) noktası tuvalde (tx, ty)'ye gelir. Tuval dışında kalan kırpılır. */
async function yerlestir(r: Resim, k: Kutu, olcek: number, capa: { kx: number; ky: number; tx: number; ty: number }, tuval: readonly [number, number], hedef: string): Promise<string> {
  const g = k.x1 - k.x0 + 1, y = k.y1 - k.y0 + 1;
  const G = Math.max(1, Math.round(g * olcek)), Y = Math.max(1, Math.round(y * olcek));
  const parca = await sharp(Buffer.from(r.d.buffer, r.d.byteOffset, r.d.length), { raw: { width: r.g, height: r.y, channels: 4 } })
    .extract({ left: k.x0, top: k.y0, width: g, height: y }).resize(G, Y, { kernel: 'lanczos3', fit: 'fill' }).png().toBuffer();
  let sol = Math.round(capa.tx - (capa.kx - k.x0) * olcek), ust = Math.round(capa.ty - (capa.ky - k.y0) * olcek);
  // tuvalin dışına taşan bölüm kesilir (yakın plandaki kol soldan girer)
  let girdi = parca, kesSol = 0, kesUst = 0, kg = G, ky = Y;
  if (sol < 0) { kesSol = -sol; kg -= kesSol; sol = 0; }
  if (ust < 0) { kesUst = -ust; ky -= kesUst; ust = 0; }
  kg = Math.min(kg, tuval[0] - sol); ky = Math.min(ky, tuval[1] - ust);
  if (kesSol || kesUst || kg !== G || ky !== Y) girdi = await sharp(parca).extract({ left: kesSol, top: kesUst, width: kg, height: ky }).png().toBuffer();
  const { data, info } = await sharp({ create: { width: tuval[0], height: tuval[1], channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: girdi, left: sol, top: ust }]).raw().toBuffer({ resolveWithObject: true });
  const son: Resim = { g: info.width, y: info.height, d: new Uint8Array(data.buffer, data.byteOffset, data.length) };
  kenarRenginiYay(son);
  await sharp(Buffer.from(son.d.buffer, son.d.byteOffset, son.d.length), { raw: { width: son.g, height: son.y, channels: 4 } })
    .webp({ quality: 92, alphaQuality: 100, effort: 6 }).toFile(path.join(HEDEF, hedef + '.webp'));
  return `${hedef.padEnd(20)} ölçek ${olcek.toFixed(3)} · tuvalde x ${sol}…${sol + kg}, y ${ust}…${ust + ky}`;
}
/** Kutuyu tuvaldeki bir alana sığdırır (oran korunur), ortalar. */
const sigdir = (r: Resim, k: Kutu, alan: readonly [number, number, number, number], tuval: readonly [number, number], hedef: string): Promise<string> => {
  const g = k.x1 - k.x0 + 1, y = k.y1 - k.y0 + 1, [ax0, ay0, ax1, ay1] = alan;
  const olcek = Math.min((ax1 - ax0) / g, (ay1 - ay0) / y);
  return yerlestir(r, k, olcek, { kx: k.x0 + g / 2, ky: k.y0 + y / 2, tx: (ax0 + ax1) / 2, ty: (ay0 + ay1) / 2 }, tuval, hedef);
};
const birlesik = (a: Kutu, b: Kutu): Kutu => ({ x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0), x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1) });

type Is = () => Promise<string[]>;
const isler: Record<string, Is> = {};
const ekle = (adlar: string[], is: Is): void => { for (const ad of adlar) isler[ad] = is; };

// ——— fonlar: tam sahne, opak
for (const ad of ['hub-fon', 'yakin-fon']) ekle([ad], async () => {
  await sharp(path.join(KAYNAK, ad + '.png')).resize(SAHNE.g, SAHNE.y, { kernel: 'lanczos3', fit: 'fill' }).removeAlpha().webp({ quality: 92, effort: 6 }).toFile(path.join(HEDEF, ad + '.webp'));
  return [`${ad.padEnd(20)} ${SAHNE.g} × ${SAHNE.y} opak`];
});

// ——— Zıpzıp: beş pozda aynı ölçek; uzatılmış patinin ucu ve ortası sahnede hep aynı noktada (kol dayanağının üstü)
const ZIPZIP_BOYU = 790; // kulakları dik pozun sahnedeki boyu (anahtar karedeki ölçü)
const PATI_UCU = { x: 1380, y: 453 }; // sahne: patinin sağ ucu, dikey ortası
ekle(['zipzip-uzgun-0', 'zipzip-uzgun-1', 'zipzip-uzgun-kirp', 'zipzip-sevinc-0', 'zipzip-sevinc-1'], async () => {
  const u = await oku('uzgun-sheet.png'), m = await oku('mutlu-sheet.png');
  const up = pozlar(u), mp = pozlar(m);
  if (up.length !== 3 || mp.length !== 2) throw new Error(`poz sayısı: üzgün ${up.length}, mutlu ${mp.length}`);
  const boy = (k: Kutu) => k.y1 - k.y0 + 1;
  const su = ZIPZIP_BOYU / boy(up[1]);
  const sm = ZIPZIP_BOYU / boy(mp[1]);
  const tuval = TUVAL['zipzip-uzgun-0'];
  const hedefNokta = { tx: PATI_UCU.x - HUB.zipzip.sol, ty: PATI_UCU.y - HUB.zipzip.ust };
  // Üzgün üç pozun gövdesi sayfada piksel piksel aynı (sol alt köşeden hizalı): üçü de aynı boyda pencereyle kesilir ve
  // aynı noktadan oturur; göz kırparken ya da kulak düşerken gövde bir piksel bile oynamaz.
  const W = Math.max(...up.map(k => k.x1 - k.x0)) + 1, Hh = Math.max(...up.map(boy));
  const pencere = (k: Kutu): Kutu => ({ x0: k.x0, x1: k.x0 + W - 1, y0: k.y1 - Hh + 1, y1: k.y1 });
  const patiY = sagUcOrtasi(u, up[1]) - (up[1].y1 - Hh + 1); // pencerenin üstünden patinin ortasına
  const uzgun = (k: Kutu, hedef: string) => { const p = pencere(k); return yerlestir(u, p, su, { kx: p.x1, ky: p.y0 + patiY, ...hedefNokta }, tuval, hedef); };
  // Sevinç iki ayrı çizim: uzanan (sargılı) kol ikisinde aynı yerde dursun diye ikinci poz, kolun bölgesindeki fark en az
  // olacak kaymayla oturtulur (el sallarken sargılı kol kıpırdamaz).
  const kolFarki = (dx: number, dy: number): number => {
    const a = mp[0], b = mp[1], ay = Math.round(sagUcOrtasi(m, a)), by = Math.round(sagUcOrtasi(m, b));
    let n = 0;
    for (let y = -70; y <= 70; y += 2) for (let x = 0; x < 230; x += 2) {
      const i = ((ay + y) * m.g + a.x1 - x) * 4, j = ((by + y + dy) * m.g + b.x1 - x + dx) * 4;
      if (Math.abs(m.d[i + 3] - m.d[j + 3]) > 80 || (m.d[i + 3] > 128 && Math.abs(m.d[i] - m.d[j]) + Math.abs(m.d[i + 1] - m.d[j + 1]) + Math.abs(m.d[i + 2] - m.d[j + 2]) > 90)) n++;
    }
    return n;
  };
  let en = { f: Infinity, dx: 0, dy: 0 };
  for (let dx = -8; dx <= 8; dx++) for (let dy = -8; dy <= 8; dy++) { const f = kolFarki(dx, dy); if (f < en.f) en = { f, dx, dy }; }
  const c0 = { kx: mp[0].x1, ky: Math.round(sagUcOrtasi(m, mp[0])), ...hedefNokta };
  const c1 = { kx: mp[1].x1 + en.dx, ky: Math.round(sagUcOrtasi(m, mp[1])) + en.dy, ...hedefNokta };
  // sayfada soldan sağa: kulakları düşük (bekleme karesi 1), kulakları dik (0), gözleri kapalı (kırpma)
  return [
    await uzgun(up[1], 'zipzip-uzgun-0'),
    await uzgun(up[0], 'zipzip-uzgun-1'),
    await uzgun(up[2], 'zipzip-uzgun-kirp'),
    await yerlestir(m, mp[0], sm, c0, tuval, 'zipzip-sevinc-0'),
    await yerlestir(m, mp[1], sm, c1, tuval, 'zipzip-sevinc-1'),
    `sevinç pozlarında kol hizası: kayma (${en.dx}, ${en.dy}), kalan fark ${en.f}`,
  ];
});

// ——— çanta: açık çanta 560 genişlikte; kapalı çanta aynı genişlikte, açık çantanın gövdesinin ortasında
ekle(['canta-acik', 'canta-kapali'], async () => {
  const a = await oku('canta-acik.png'), k = await oku('canta-kapali.png');
  const ka = kutu(a), kk = kutu(k);
  const sa = 560 / (ka.x1 - ka.x0 + 1), sk = 560 / (kk.x1 - kk.x0 + 1);
  const acikBoy = (ka.y1 - ka.y0 + 1) * sa;
  const govdeOrta = 20 + acikBoy * 0.66; // gövde, açık çantanın alt üçte ikisi
  return [
    await yerlestir(a, ka, sa, { kx: ka.x0, ky: ka.y0, tx: 40, ty: 20 }, TUVAL['canta-acik'], 'canta-acik'),
    await yerlestir(k, kk, sk, { kx: kk.x0, ky: (kk.y0 + kk.y1) / 2, tx: 40, ty: govdeOrta }, TUVAL['canta-kapali'], 'canta-kapali'),
  ];
});

// ——— aletler (600 × 600): uç noktaları veri.ts → ALETLER ile aynı
ekle(['buyutec'], async () => {
  const r = await oku('buyutec.png'), k = kutu(r), yaricap = (k.x1 - k.x0 + 1) / 2;
  // merceğin ortası tuvalde (300, 230)
  return [await yerlestir(r, k, 0.428, { kx: k.x0 + yaricap, ky: k.y0 + yaricap, tx: 300, ty: 230 }, TUVAL.buyutec, 'buyutec')];
});
ekle(['sprey'], async () => {
  const r = await oku('sprey.png'), k = kutu(r);
  // ağzın ucu tuvalde (150, 110)
  return [await yerlestir(r, k, 0.4, { kx: k.x0, ky: solUcOrtasi(r, k), tx: 150, ty: 110 }, TUVAL.sprey, 'sprey')];
});
ekle(['cimbiz-acik', 'cimbiz-kapali'], async () => {
  // kapalı: Astra'nın temiz çizdiği ikinci hâl (ilk düzeltmede ek yeri görünüyordu)
  const a = await oku('cimbiz-acik.png'), k = await oku(fs.existsSync(path.join(KAYNAK, 'cimbiz-kapali-v2.png')) ? 'cimbiz-kapali-v2.png' : 'cimbiz-kapali.png');
  if (a.g !== k.g || a.y !== k.y) throw new Error('cımbız çifti aynı tuvalde değil');
  const ortak = birlesik(kutu(a), kutu(k));
  // uçlar tuvalde (300, 40)
  const capa = { kx: (ortak.x0 + ortak.x1) / 2, ky: ortak.y0, tx: 300, ty: 40 };
  return [await yerlestir(a, ortak, 0.415, capa, TUVAL['cimbiz-acik'], 'cimbiz-acik'), await yerlestir(k, ortak, 0.415, capa, TUVAL['cimbiz-kapali'], 'cimbiz-kapali')];
});
ekle(['sargi-rulo'], async () => { const r = await oku('sargi-rulo.png'); return [await sigdir(r, kutu(r), [60, 60, 540, 540], TUVAL['sargi-rulo'], 'sargi-rulo')]; });

// ——— küçük parçalar: tuvalin ortasında
for (const ad of ['mikrop-0', 'mikrop-1', 'mikrop-2', 'kopuk', 'pof-0', 'pof-1', 'yildiz'])
  ekle([ad], async () => { const r = await oku(ad + '.png'); return [await sigdir(r, kutu(r), [32, 32, 268, 268], TUVAL[ad], ad)]; });
ekle(['diken'], async () => { const r = await oku('diken.png'); return [await sigdir(r, kutu(r), [2, 4, 198, 76], TUVAL.diken, 'diken')]; });
for (const ad of ['bant-yildiz', 'bant-kalp', 'bant-pati', 'bant-gokkusagi'])
  ekle([ad], async () => { if (!fs.existsSync(path.join(KAYNAK, ad + '.png'))) return [`${ad}: kaynak yok`]; const r = await oku(ad + '.png'); return [await sigdir(r, kutu(r), [5, 5, 355, 145], TUVAL[ad] ?? [360, 150], ad)]; });
ekle(['serit'], async () => { const r = await oku('serit.png'); return [await sigdir(r, kutu(r), [3, 3, 1497, 187], TUVAL.serit, 'serit')]; });

// ——— yakın plan: kol çifti ve sargı aynı kaynak tuvalinde, aynı dönüşümle sahneye oturur
export const SARGI_KAYMASI = 222;
export const KOL = { olcek: 0.8, patiUcuX: 1440, ortaY: 550 }; // kol yeni sahnenin solunda, görünmez // sahne: patinin sağ ucu, kolun dikey ortası
ekle(['kol-camurlu', 'kol-temiz', 'sargi-sarili'], async () => {
  const t = await oku('kol-temiz.png'), c = await oku('kol-camurlu.png'), s = await oku('sargi-sarili.png');
  if (c.g !== t.g || c.y !== t.y || s.g !== t.g || s.y !== t.y) throw new Error('kol ve sargı aynı tuvalde değil');
  // Sabit dönüşüm (ilk kol çiziminde ölçüldü): kaynak tuvalde pati ucu x 2137, kol ekseni y 374. Yeni kol aynı
  // tuvale, aynı hizayla çizilir; çizimin biçimi değişse de sahnedeki yeri değişmez.
  if (t.g !== 2172 || t.y !== 724) throw new Error(`kol tuvali ${t.g} × ${t.y}; 2172 × 724 bekleniyor`);
  const capa = { kx: 2137, ky: 374, tx: KOL.patiUcuX, ty: KOL.ortaY };
  const tum: Kutu = { x0: 0, y0: 0, x1: t.g - 1, y1: t.y - 1 };
  const tuval = [SAHNE.g, SAHNE.y] as const;
  return [
    await yerlestir(t, tum, KOL.olcek, capa, tuval, 'kol-temiz'),
    await yerlestir(c, tum, KOL.olcek, capa, tuval, 'kol-camurlu'),
    // sargı kaynakta kolun ortasında çizildi; oyunda bilek tarafına oturur (222 sahne pikseli sağda)
    await yerlestir(s, tum, KOL.olcek, { ...capa, tx: capa.tx + SARGI_KAYMASI }, tuval, 'sargi-sarili'),
  ];
});

// ——— Kino (isteğe bağlı): dört pozda kulak açıklığı aynı ende, baş ekseni ve baş tepesi tuvalde aynı yerde
export const KINO = { kulakEni: 540, eksenX: 360, tepeY: 20 };
ekle(['kino-goster', 'kino-sasir', 'kino-alkis-0', 'kino-alkis-1'], async () => {
  for (const f of ['kino-goster.png', 'kino-sasir.png', 'kino-alkis-sheet.png']) if (!fs.existsSync(path.join(KAYNAK, f))) return ['kino: kaynak yok (' + f + ')'];
  // kulak açıklığı: pozun üst %40'ındaki en geniş yatay aralık (işaret eden pati daha aşağıda kalır)
  const kulak = (r: Resim, k: Kutu): { x0: number; x1: number } => {
    let x0 = r.g, x1 = -1;
    const alt = k.y0 + Math.round((k.y1 - k.y0) * 0.4);
    for (let y = k.y0; y <= alt; y++) for (let x = k.x0; x <= k.x1; x++) if (alfa(r, x, y) > 128) { if (x < x0) x0 = x; if (x > x1) x1 = x; }
    return { x0, x1 };
  };
  const koy = (r: Resim, k: Kutu, hedef: string, ortak?: { x0: number; x1: number }) => {
    const u = ortak ?? kulak(r, k), olcek = KINO.kulakEni / (u.x1 - u.x0 + 1);
    return yerlestir(r, k, olcek, { kx: (u.x0 + u.x1) / 2, ky: k.y0, tx: KINO.eksenX, ty: KINO.tepeY }, TUVAL[hedef], hedef);
  };
  const g = await oku('kino-goster.png'), s = await oku('kino-sasir.png'), a = await oku('kino-alkis-sheet.png');
  const ap = pozlar(a);
  if (ap.length !== 2) throw new Error('kino alkış poz sayısı ' + ap.length);
  // alkışın iki pozu sayfada aynı aralıkla durur: ikisi de kendi kutusunun aynı noktasından oturur (baş kıpırdamaz)
  const u0 = kulak(a, ap[0]), kay = ap[1].x0 - ap[0].x0;
  return [
    await koy(g, kutu(g), 'kino-goster'),
    await koy(s, kutu(s), 'kino-sasir'),
    await koy(a, ap[0], 'kino-alkis-0', u0),
    await koy(a, { ...ap[1], y0: ap[0].y0, y1: ap[0].y1 }, 'kino-alkis-1', { x0: u0.x0 + kay, x1: u0.x1 + kay }),
  ];
});

// ——— yakın plandaki yüz (isteğe bağlı): dört ifade aynı pencereyle kesilir, baş bir piksel oynamaz
const YUZLER = ['zipzip-yakin-endise', 'zipzip-yakin-ayy', 'zipzip-yakin-kikir', 'zipzip-yakin-rahat'];
ekle(YUZLER, async () => {
  const tuval = TUVAL[YUZLER[0]];
  const sayfa = ['yuz-sheet.png', 'zipzip-yakin-sheet.png'].find(f => fs.existsSync(path.join(KAYNAK, f)));
  const parcalar: { r: Resim; k: Kutu }[] = [];
  if (sayfa) {
    const r = await oku(sayfa), p = pozlar(r);
    if (p.length !== 4) throw new Error(`yüz sayfasında ${p.length} poz var (4 bekleniyor; iki satırlıysa dört ayrı dosya ver)`);
    for (const k of p) parcalar.push({ r, k });
  } else {
    for (const ad of YUZLER) { if (!fs.existsSync(path.join(KAYNAK, ad + '.png'))) return ['yüz: kaynak yok (' + ad + ')']; const r = await oku(ad + '.png'); parcalar.push({ r, k: kutu(r) }); }
  }
  // ortak pencere: en geniş ve en yüksek poz; hepsi sol üst köşeden hizalı (omuz tuvalin sol ve alt kenarına taşar)
  const W = Math.max(...parcalar.map(p => p.k.x1 - p.k.x0)) + 1, H = Math.max(...parcalar.map(p => p.k.y1 - p.k.y0)) + 1;
  const olcek = Math.min(tuval[0] / W, tuval[1] / H);
  const satirlar: string[] = [];
  for (let i = 0; i < 4; i++) {
    const { r, k } = parcalar[i];
    satirlar.push(await yerlestir(r, { x0: k.x0, y0: k.y0, x1: Math.min(r.g - 1, k.x0 + W - 1), y1: Math.min(r.y - 1, k.y0 + H - 1) }, olcek, { kx: k.x0, ky: k.y0, tx: 0, ty: 0 }, tuval, YUZLER[i]));
  }
  return satirlar;
});

fs.mkdirSync(HEDEF, { recursive: true });
const yapilan = new Set<Is>();
for (const [ad, is] of Object.entries(isler)) {
  if (istenen.length && !istenen.includes(ad)) continue;
  if (yapilan.has(is)) continue;
  yapilan.add(is);
  for (const satir of await is()) console.log(satir);
}
