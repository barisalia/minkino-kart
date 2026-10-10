/**
 * Babaanne ile Dede'nin kesme kukla deneme klibi (yalnız geliştirme: /film/aile-buyukler.html). 10 sn, salonda bütün aile:
 * Babaanne börek tepsisiyle sağdan gelir ("Sizin için yaptım, sıcacık!"), Dede kasketini düzeltir ("Bak sen şu işe."),
 * sonra hep birlikte el sallarlar. Altı kit aynı birimde çizildi (assets/karakter/aile-boy.json): hepsi AYNI ölçekle
 * basılır, boylar tablodaki gibi çıkar. Seslendirme yok (Barış'ın kararı): ağızlar hece ritmiyle oynar.
 *
 * Kayıt: node scripts/film/kukla-kayit.mjs --adres http://localhost:<port>/film/aile-buyukler.html --kare-klasoru <klasor>
 * (sayfa window.kuklaTest ile kare kare çizer). Normal açılışta gerçek zamanlı döngüyle oynar.
 */
import { aralik, Kukla, tasan, type KuklaIskelet, type Matris, type Poz } from './kukla';
import { bacakKur, Ikincil, yuruyusPozu, type AyakHedef } from './kukla-hareket';
import kinoJson from '../../assets/karakter/kino-yeni/kino-yeni.json';
import anneJson from '../../assets/karakter/anne/anne.json';
import babaJson from '../../assets/karakter/baba/baba.json';
import lokumJson from '../../assets/karakter/lokum/lokum.json';
import babaanneJson from '../../assets/karakter/babaanne/babaanne.json';
import dedeJson from '../../assets/karakter/dede/dede.json';

const GORSEL: Record<string, string> = {
  ...import.meta.glob<string>('../../assets/karakter/kino-yeni/*.webp', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob<string>('../../assets/karakter/anne/*.webp', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob<string>('../../assets/karakter/baba/*.webp', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob<string>('../../assets/karakter/lokum/*.webp', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob<string>('../../assets/karakter/babaanne/*.webp', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob<string>('../../assets/karakter/dede/*.webp', { eager: true, query: '?url', import: 'default' }),
};
const EV = import.meta.glob<string>('../../assets/film/ev/*.webp', { eager: true, query: '?url', import: 'default' });

const FPS = 30;
const SURE = 10;
const GEN = 844, YUK = 390;
/** ortak ölçek (css px / kare birimi) ve zemin çizgisi */
const O = 0.072, ZEMIN_Y = 376;

type Ad = 'dede' | 'baba' | 'anne' | 'kino' | 'lokum' | 'babaanne';
const KIT: Record<Ad, { json: unknown; klasor: string }> = {
  dede: { json: dedeJson, klasor: 'dede' },
  baba: { json: babaJson, klasor: 'baba' },
  anne: { json: anneJson, klasor: 'anne' },
  kino: { json: kinoJson, klasor: 'kino-yeni' },
  lokum: { json: lokumJson, klasor: 'lokum' },
  babaanne: { json: babaanneJson, klasor: 'babaanne' },
};
/** sahnedeki yerler (css px, ayak ortası); çocuklar bir tık önde (önce büyükler çizilir) */
const YER: Record<Ad, { x: number; y: number }> = {
  dede: { x: 82, y: ZEMIN_Y },
  baba: { x: 212, y: ZEMIN_Y },
  anne: { x: 334, y: ZEMIN_Y },
  kino: { x: 448, y: ZEMIN_Y + 4 },
  lokum: { x: 544, y: ZEMIN_Y + 6 },
  babaanne: { x: 652, y: ZEMIN_Y },
};
const GOLGE: Record<Ad, number> = { dede: 520, baba: 640, anne: 520, kino: 560, lokum: 420, babaanne: 660 };

// ---------- duruş: bir karedeki bütün eklemler ----------
interface Durus {
  kalcaX: number; kalcaY: number; kalcaA: number;
  govdeA: number; govdeSy: number;
  kafaA: number; kafaY: number;
  kuyruk: number;
  kolSag: number; kolSol: number; dirsekSag: number; dirsekSol: number; elSag: number; elSol: number;
  ayakSag: AyakHedef; ayakSol: AyakHedef;
  gozler: string; kaslar: string; agiz: string;
  /** kite özgü parçalar (kasket, tepsi, buhar …) */
  ek: Poz;
}
const yeniDurus = (): Durus => ({
  kalcaX: 0, kalcaY: 0, kalcaA: 0, govdeA: 0, govdeSy: 1, kafaA: 0, kafaY: 0, kuyruk: 0,
  kolSag: 0, kolSol: 0, dirsekSag: 0, dirsekSol: 0, elSag: 0, elSol: 0,
  ayakSag: { x: 0, y: 0 }, ayakSol: { x: 0, y: 0 },
  gozler: 'gozler-acik', kaslar: 'kaslar-notr', agiz: 'agiz-gulumse', ek: {},
});
function yaz(k: Kukla, d: Durus) {
  k.poz = {};
  const P = k.poz;
  k.secim.gozler = d.gozler;
  k.secim.kaslar = d.kaslar;
  k.secim.agiz = d.agiz;
  P.kalca = { a: d.kalcaA, x: d.kalcaX, y: d.kalcaY };
  P.govde = { a: d.govdeA, sx: 1 + (1 - d.govdeSy) * 0.5, sy: d.govdeSy };
  P.kafa = { a: d.kafaA, y: d.kafaY };
  P.kuyruk = { a: d.kuyruk };
  P['kol-ust-sag'] = { a: d.kolSag };
  P['kol-ust-sol'] = { a: d.kolSol };
  // Kino'nun kitinde kol kalkınca açılan omuz dikişi (öbür kitlerde bu parça yok)
  const dikis = (a: number) => ({ o: Math.max(0, Math.min(1, (Math.abs(a) - 6) / 18)) });
  P['kol-ust-sag-dikis'] = dikis(d.kolSag);
  P['kol-ust-sol-dikis'] = dikis(d.kolSol);
  P['kol-alt-sag'] = { a: d.dirsekSag };
  P['kol-alt-sol'] = { a: d.dirsekSol };
  P['el-sag'] = { a: d.elSag };
  P['el-sol'] = { a: d.elSol };
  bacakKur(k, 'sag', d.ayakSag, d.kalcaA, d.kalcaY);
  bacakKur(k, 'sol', d.ayakSol, d.kalcaA, d.kalcaY);
  for (const [ad, e] of Object.entries(d.ek)) P[ad] = { ...P[ad], ...e };
}

// ---------- kol çözücü: bileği gövde karesinde bir noktaya götürür (dirsek dışa bükülür) ----------
const DER = 180 / Math.PI;
const aciNorm = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180;
function kolCoz(isk: KuklaIskelet, taraf: 'sag' | 'sol', hedef: [number, number]): { omuz: number; dirsek: number } {
  const p = isk.parcalar;
  const S = p[`kol-ust-${taraf}`].pivot, E = p[`kol-alt-${taraf}`].pivot, W = p[`el-${taraf}`].pivot;
  const L1 = Math.hypot(E[0] - S[0], E[1] - S[1]), L2 = Math.hypot(W[0] - E[0], W[1] - E[1]);
  const dx = hedef[0] - S[0], dy = hedef[1] - S[1];
  const d = Math.max(Math.abs(L1 - L2) + 1, Math.min(L1 + L2 - 1, Math.hypot(dx, dy)));
  const taban = Math.atan2(dy, dx);
  const ic = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
  // iki çözümden dirseği dışta olan (sag: ekranın solu, x küçük)
  const adaylar = [taban + ic, taban - ic].map((u) => ({ u, ex: S[0] + L1 * Math.cos(u), ey: S[1] + L1 * Math.sin(u) }));
  const sec = taraf === 'sag' ? (adaylar[0].ex < adaylar[1].ex ? adaylar[0] : adaylar[1]) : adaylar[0].ex > adaylar[1].ex ? adaylar[0] : adaylar[1];
  const omuz = aciNorm((sec.u - Math.atan2(E[1] - S[1], E[0] - S[0])) * DER);
  const u2 = Math.atan2(hedef[1] - sec.ey, hedef[0] - sec.ex);
  const dirsek = aciNorm((u2 - Math.atan2(W[1] - E[1], W[0] - E[0])) * DER - omuz);
  return { omuz, dirsek };
}
const karis = (a: number, b: number, t: number) => a + (b - a) * t;

// ---------- ortak hareketler ----------
function nefes(d: Durus, t: number, hiz = 0.35, faz = 0) {
  const n = Math.sin(2 * Math.PI * (t * hiz + faz));
  d.govdeSy += 0.006 * n;
  d.kafaY += -3 * n;
}
function kirp(d: Durus, t: number, anlar: number[]) {
  for (const a of anlar) {
    const x = t - a;
    if (x < 0 || x > 0.2 || d.gozler === 'gozler-mutlu') continue;
    d.gozler = x < 0.05 || x >= 0.14 ? 'gozler-yari' : 'gozler-kapali';
  }
}
/** sahte konuşma (ses yok): hece ritmi */
function hece(t: number, bas: number, son: number, tohum: number): { agiz: string; guc: number } | null {
  if (t < bas || t > son) return null;
  const x = (t - bas) * 5.2;
  const i = Math.floor(x), f = x - i;
  if ((i + tohum) % 5 === 4) return { agiz: 'agiz-gulumse', guc: 0 };
  const h = Math.abs(Math.sin((i + 1) * 12.9898 + tohum * 78.233) * 43758.5453) % 1;
  const a = Math.sin(Math.PI * f) * (0.55 + 0.45 * h);
  if (a < 0.18) return { agiz: 'agiz-az', guc: a };
  if (h < 0.18) return { agiz: 'agiz-o', guc: a };
  if (h > 0.85) return { agiz: 'agiz-e', guc: a };
  return { agiz: a < 0.5 ? 'agiz-az' : a < 0.8 ? 'agiz-orta' : 'agiz-genis', guc: a };
}
function konus(d: Durus, t: number, bas: number, son: number, tohum: number) {
  const h = hece(t, bas, son, tohum);
  if (!h) return 0;
  d.agiz = h.agiz;
  d.kafaY += -8 * h.guc;
  d.kafaA += 2 * Math.sin(t * 7 + tohum) * h.guc;
  return h.guc;
}
/** el sallama: taraf 'sag' (ekranın solundaki kol) ya da 'sol'; döner: kalkma 0..1 */
function salla(d: Durus, t: number, bas: number, son: number, taraf: 'sag' | 'sol', hiz = 2.3, genlik = 1, dirsekK = 1) {
  if (t < bas - 0.2 || t > son + 0.6) return 0;
  const kalk = tasan(aralik(t, bas, bas + 0.45), 1.4) * (1 - tasan(aralik(t, son, son + 0.5), 0.9));
  const dalga = Math.sin(2 * Math.PI * hiz * (t - bas - 0.3)) * aralik(t, bas + 0.3, bas + 0.5) * (1 - aralik(t, son - 0.2, son));
  // kalkarken / inerken dirsek fazladan bükülür: el gövdeye yakın yükselir, komşunun başının üstünden yatay geçmez
  const katla = 55 * Math.sin(Math.PI * Math.min(1, Math.max(0, kalk)));
  const s = taraf === 'sag' ? 1 : -1;
  if (taraf === 'sag') {
    d.kolSag += 100 * kalk * genlik;
    d.dirsekSag += (50 + 26 * dalga) * kalk * dirsekK + katla;
    d.elSag += 10 * dalga * kalk;
  } else {
    d.kolSol += -100 * kalk * genlik;
    d.dirsekSol += -(50 + 26 * dalga) * kalk * dirsekK - katla;
    d.elSol += -10 * dalga * kalk;
  }
  d.kafaA += 4 * s * kalk;
  d.govdeA += 2 * s * kalk;
  return kalk;
}
function kuyrukSalla(d: Durus, t: number, hiz: number, genlik: number) {
  d.kuyruk += genlik * Math.sin(2 * Math.PI * hiz * t);
}
interface Sahne { x: number; y: number; o: number; hava: number }
const yerinde = (ad: Ad): Sahne => ({ x: YER[ad].x, y: YER[ad].y, o: O, hava: 0 });

// ---------- zaman çizelgesi ----------
const GEL_BAS = 0.25, ADIM = 8, ADIM_T = 0.34, GEL_SON = GEL_BAS + ADIM * ADIM_T; // ≈ 2.97
const BAB_X0 = 950;
const SOZ_B = [3.25, 4.75] as const; // "Sizin için yaptım, sıcacık!"
const KASKET = [5.0, 6.6] as const; // Dede kasketini düzeltir
const SOZ_D = [5.55, 6.35] as const; // "Bak sen şu işe."
const SALLA = 7.0, SALLA_SON = 9.45;

/** Babaanne'nin girişi: yavaşlayarak durur */
function ilerle(u: number) {
  const N = ADIM, r = 1.2;
  const v = (x: number) => (x < r ? 0.45 + (0.55 * x) / r : x > N - r ? 0.3 + (0.7 * (N - x)) / r : 1);
  let s = 0, top = 0;
  for (let x = 0; x < N; x += 0.01) {
    const dd = v(x) * 0.01;
    top += dd;
    if (x < u) s += dd;
  }
  return Math.min(1, s / top);
}

// ---------- Babaanne: tepsiyle gelir, sunar, tek eliyle el sallar ----------
function babaannePoz(t: number, isk: KuklaIskelet): { d: Durus; s: Sahne } {
  const d = yeniDurus();
  const s = yerinde('babaanne');
  const u = Math.max(0, Math.min(ADIM, (t - GEL_BAS) / ADIM_T));
  const p = ilerle(u);
  s.x = BAB_X0 + (YER.babaanne.x - BAB_X0) * p;
  // sunuş: tepsiyi biraz kaldırıp öne uzatır (dirsekler açılır), sonra geri
  const sun = aralik(t, SOZ_B[0] - 0.1, SOZ_B[0] + 0.35) * (1 - aralik(t, SOZ_B[1] - 0.2, SOZ_B[1] + 0.3));
  const tepsiY = -60 * sun;
  // tepsi iki elde: bilekler tepsinin iki yanında (gövde karesinde; kit: tepsi merkezi 1150, 1990)
  const tutSag = kolCoz(isk, 'sag', [1150 - 300, 2030 + tepsiY]), tutSol = kolCoz(isk, 'sol', [1150 + 300, 2030 + tepsiY]);
  d.kolSag += tutSag.omuz; d.dirsekSag += tutSag.dirsek; d.elSag += -18;
  d.kolSol += tutSol.omuz; d.dirsekSol += tutSol.dirsek; d.elSol += 18;
  d.ek.tepsi = { o: 1, y: tepsiY };
  // buhar: yükselip kaybolan iki dalga (tepside sürekli)
  const bf = (t * 0.7) % 1;
  d.ek.buhar = { o: 0.85 * Math.sin(Math.PI * bf) * aralik(t, 0.4, 1.0), y: -70 * bf, x: 10 * Math.sin(t * 2.2) };
  nefes(d, t, 0.3, 0.1);
  if (t < GEL_SON) {
    const genlik = Math.min(1, u / 0.6, (ADIM - u) / 0.8);
    const adim: [number, number] = [((YER.babaanne.x - BAB_X0) / ADIM / O) * 0.32, 0];
    const w = yuruyusPozu(u, adim, genlik);
    d.ayakSag = w.ayak.sag;
    d.ayakSol = w.ayak.sol;
    d.kalcaY += w.kalcaY * 0.8;
    d.kalcaA += w.kalcaA * 1.4;
    d.kalcaX += w.kalcaX;
    // tombul yürüyüş: gövde iki yana yaylanır, kafa ters yöne
    d.govdeA += -w.kalcaA * 1.1;
    d.kafaA += w.kalcaA * 0.5;
    d.gozler = 'gozler-sola';
    d.agiz = 'agiz-genis';
    kuyrukSalla(d, t, 2.2, 10);
  }
  const dur = t - GEL_SON;
  if (dur >= -0.05 && dur < 0.7) {
    const x = (dur + 0.05) / 0.6;
    d.kalcaY += 18 * Math.sin(Math.PI * Math.min(1, x)) * Math.exp(-x);
  }
  if (t >= GEL_SON && t < SOZ_B[0]) d.gozler = 'gozler-sola';
  if (sun > 0) {
    d.kaslar = 'kaslar-kalkik';
    d.kafaA += -4 * sun;
    d.govdeA += -1.5 * sun;
  }
  konus(d, t, SOZ_B[0], SOZ_B[1], 4);
  // "sıcacık!": sonda gözler mutlu
  if (t > SOZ_B[1] - 0.3 && t < SOZ_B[1] + 0.6) d.gozler = 'gozler-mutlu';
  // Dede'ye bakar, güler
  if (t > KASKET[0] + 0.2 && t < KASKET[1]) {
    d.gozler = t > SOZ_D[1] ? 'gozler-mutlu' : 'gozler-sola';
    d.agiz = 'agiz-genis';
  }
  // el sallama: sağ eli (ekranın solu) tepsiden bırakır, tepsi sol elde kalır
  // tepsi tutuşundan el sallamaya geçiş: tutuş pozu sallama kalktıkça söner (sallama pozu kalkışla ölçekli gelir)
  const ws = yeniDurus();
  const m = Math.max(0, Math.min(1, salla(ws, t, SALLA, SALLA_SON, 'sag', 2.1, 1.15)));
  if (m > 0) {
    d.kolSag = karis(d.kolSag, 0, m) + ws.kolSag;
    d.dirsekSag = karis(d.dirsekSag, 0, m) + ws.dirsekSag;
    d.elSag = karis(d.elSag, 0, m) + ws.elSag;
    d.kafaA += ws.kafaA;
    d.govdeA += ws.govdeA;
  }
  if (t >= SALLA) {
    d.agiz = t > SALLA + 0.4 && t < SALLA_SON ? 'agiz-genis' : 'agiz-gulumse';
    d.kaslar = 'kaslar-kalkik';
    d.gozler = t > SALLA + 0.5 && t < SALLA + 1.6 ? 'gozler-mutlu' : d.gozler;
  }
  kirp(d, t, [1.4, 5.2, 8.6]);
  if (t >= GEL_SON) kuyrukSalla(d, t, 1.2, 8);
  return { d, s };
}

// ---------- Dede: önce sakin, kasketini düzeltir, tek cümle, el sallar ----------
function dedePoz(t: number, isk: KuklaIskelet): { d: Durus; s: Sahne } {
  const d = yeniDurus();
  nefes(d, t, 0.22, 0.5);
  // yaşlı duruş: kafa hafif öne-aşağı, ara ara başını sallar
  d.kafaY += 6;
  if (t > 0.6 && t < 3.0) d.gozler = 'gozler-saga';
  if (t > 1.2 && t < 2.6) d.kafaA += 2 * Math.sin(2 * Math.PI * 0.9 * (t - 1.2));
  if (t > 3.0 && t < KASKET[0]) {
    d.gozler = t > SOZ_B[1] - 0.4 ? 'gozler-mutlu' : 'gozler-saga';
    d.kaslar = 'kaslar-kalkik';
    d.agiz = t > SOZ_B[1] - 0.5 ? 'agiz-genis' : 'agiz-gulumse';
  }
  // kasket: sağ el (ekranın solu) siperliğe gider, kasketi kaldırıp hafif çevirir, yerine oturtur
  const [k0, k1] = KASKET;
  const g = tasan(aralik(t, k0, k0 + 0.5), 1.2) * (1 - aralik(t, k1 - 0.45, k1));
  if (g > 0) {
    // bilek hedefi (gövde karesinde): siperliğin sol ucunun yanı; düzeltirken öne-arkaya küçük itiş
    const it = Math.sin(2 * Math.PI * 1.4 * (t - k0 - 0.45)) * aralik(t, k0 + 0.45, k0 + 0.6) * (1 - aralik(t, k1 - 0.6, k1 - 0.45));
    const kep: [number, number] = [1050 - 330 + 14 * it, 660 - 10 * it], dur0 = isk.parcalar['el-sag'].pivot;
    const c = kolCoz(isk, 'sag', [karis(dur0[0], kep[0], g), karis(dur0[1], kep[1], g)]);
    d.kolSag += c.omuz;
    d.dirsekSag += c.dirsek;
    d.elSag += -16 * g;
    // kasket elle birlikte: önce biraz kalkar, sağa-sola oynar, oturur
    const kalk = aralik(t, k0 + 0.35, k0 + 0.6) * (1 - aralik(t, k1 - 0.75, k1 - 0.45));
    d.ek.kasket = { y: -26 * kalk + 4 * it * kalk, a: 6 * it * kalk - 3 * kalk };
    d.kafaA += -3 * g;
    d.gozler = t < k0 + 0.5 ? 'gozler-yari' : d.gozler;
    d.kaslar = 'kaslar-kalkik';
  }
  if (konus(d, t, SOZ_D[0], SOZ_D[1], 9) > 0) d.kaslar = 'kaslar-kalkik';
  if (t > SOZ_D[1] && t < SALLA) {
    d.gozler = 'gozler-mutlu';
    d.agiz = 'agiz-genis';
  }
  // yaşlı el sallama: kol az kalkar, dirsek çok bükülür (el baş hizasında, küçük ve sakin)
  salla(d, t, SALLA + 0.15, SALLA_SON, 'sag', 1.7, 0.78, 1.5);
  if (t >= SALLA + 0.15) {
    d.agiz = t > SALLA + 0.5 && t < SALLA_SON ? 'agiz-genis' : 'agiz-gulumse';
    d.kaslar = 'kaslar-kalkik';
  }
  kirp(d, t, [2.2, 4.4, 8.2]);
  kuyrukSalla(d, t, 0.8, 5);
  return { d, s: yerinde('dede') };
}

// ---------- Anne, Baba, Kino, Lokum: gelişe bakar, güler, el sallar ----------
function ebeveynPoz(ad: 'anne' | 'baba', t: number): { d: Durus; s: Sahne } {
  const d = yeniDurus();
  const anne = ad === 'anne';
  nefes(d, t, anne ? 0.3 : 0.25, anne ? 0.2 : 0.6);
  if (t > 0.5 && t < KASKET[0]) {
    d.gozler = 'gozler-saga';
    d.kafaA += 3 * aralik(t, 0.5, 0.9);
    d.kaslar = 'kaslar-kalkik';
    if (t > 2.2) d.agiz = 'agiz-genis';
  }
  if (t > SOZ_B[1] - 0.3 && t < SOZ_B[1] + 0.5) d.gozler = 'gozler-mutlu';
  // Baba: "çay?" değil börek: göbeğine dokunup güler
  if (!anne) {
    const g = aralik(t, 3.5, 3.9) * (1 - aralik(t, 4.9, 5.3));
    if (g > 0) {
      d.kolSol += -6 * g;
      d.dirsekSol += 84 * tasan(g, 1.1);
      d.elSol += -14 * g;
      d.gozler = 'gozler-mutlu';
      d.agiz = 'agiz-kahkaha';
      d.govdeSy += 0.012 * Math.abs(Math.sin(2 * Math.PI * 4 * t)) * g;
    }
  }
  // Dede kasketini düzeltirken ona bakar
  if (t > KASKET[0] + 0.1 && t < SALLA) {
    d.gozler = t > SOZ_D[1] ? 'gozler-mutlu' : 'gozler-sola';
    d.kafaA += -3 * aralik(t, KASKET[0], KASKET[0] + 0.4);
    d.agiz = t > SOZ_D[1] ? 'agiz-kahkaha' : 'agiz-gulumse';
  }
  salla(d, t, SALLA + (anne ? 0.05 : 0.2), SALLA_SON, 'sag', anne ? 2.0 : 1.8, anne ? 1.22 : 0.85, anne ? 1 : 1.4);
  if (t >= SALLA) {
    d.agiz = t > SALLA + 0.4 && t < SALLA_SON ? (anne ? 'agiz-orta' : 'agiz-genis') : 'agiz-gulumse';
    d.kaslar = 'kaslar-kalkik';
  }
  kirp(d, t, anne ? [2.4, 6.9, 8.9] : [1.2, 4.6, 8.1]);
  kuyrukSalla(d, t, anne ? 1.1 : 0.9, 6);
  return { d, s: yerinde(ad) };
}
function kinoPoz(t: number): { d: Durus; s: Sahne } {
  const d = yeniDurus();
  nefes(d, t, 0.5);
  if (t > 0.35 && t < KASKET[0]) {
    d.gozler = 'gozler-saga';
    d.kaslar = 'kaslar-kalkik';
    d.agiz = t > 1.0 ? 'agiz-genis' : 'agiz-o';
  }
  // börek gelince iki kolu havaya: "Yaşasın!"
  const ya = aralik(t, 3.0, 3.25) * (1 - aralik(t, 3.9, 4.25));
  if (ya > 0) {
    d.kolSag += 120 * tasan(ya, 1.3);
    d.kolSol += -120 * tasan(ya, 1.3);
    d.dirsekSag += 20 * ya;
    d.dirsekSol += -20 * ya;
    d.gozler = 'gozler-mutlu';
    d.agiz = 'agiz-kahkaha';
    d.kalcaY += -12 * ya;
  }
  if (t > KASKET[0] + 0.1 && t < SALLA) {
    d.gozler = t > SOZ_D[1] ? 'gozler-mutlu' : 'gozler-sola';
    d.agiz = t > SOZ_D[1] ? 'agiz-kahkaha' : 'agiz-genis';
  }
  salla(d, t, SALLA, SALLA_SON, 'sag', 2.5, 1.15);
  if (t >= SALLA) {
    d.agiz = t > SALLA + 0.3 && t < SALLA_SON ? 'agiz-genis' : 'agiz-gulumse';
    d.kaslar = 'kaslar-kalkik';
  }
  kirp(d, t, [2.6, 6.8, 9.6]);
  kuyrukSalla(d, t, 1.9, t > 1 ? 15 : 6);
  return { d, s: yerinde('kino') };
}
function lokumPoz(t: number): { d: Durus; s: Sahne } {
  const d = yeniDurus();
  nefes(d, t, 0.45, 0.4);
  const s = yerinde('lokum');
  d.kalcaA += 2 * Math.sin(2 * Math.PI * 0.4 * t);
  d.kafaA += 3 * Math.sin(2 * Math.PI * 0.4 * t + 0.6);
  if (t > 0.3 && t < KASKET[0]) {
    d.gozler = 'gozler-saga';
    d.agiz = t > 1.5 ? 'agiz-genis' : 'agiz-o';
    d.kaslar = 'kaslar-kalkik';
  }
  // tepsi yanına gelince bir zıplama ("Daha!")
  const hBas = 3.35, kalk = hBas + 0.24, ini = kalk + 0.44, son = ini + 0.38;
  if (t >= hBas && t <= son) {
    if (t < kalk) {
      const c = Math.sin((Math.PI / 2) * aralik(t, hBas, kalk));
      d.kalcaY += 30 * c;
      d.govdeSy -= 0.04 * c;
    } else if (t < ini) {
      const tau = (t - kalk) / (ini - kalk);
      s.hava = 220 * 4 * tau * (1 - tau);
      d.ayakSag = { x: -4, y: -16 * Math.sin(Math.PI * tau), egim: -8 * Math.sin(Math.PI * tau) };
      d.ayakSol = { x: 4, y: -16 * Math.sin(Math.PI * tau), egim: 8 * Math.sin(Math.PI * tau) };
      d.kolSag += 120 * Math.sin(Math.PI * Math.min(1, tau * 1.25));
      d.kolSol += -120 * Math.sin(Math.PI * Math.min(1, tau * 1.25));
      d.agiz = 'agiz-kahkaha';
    } else {
      const x = (t - ini) / (son - ini);
      const ez = Math.sin(Math.PI * Math.min(1, x * 1.6)) * Math.exp(-x * 2);
      d.kalcaY += 36 * ez;
      d.govdeSy -= 0.06 * ez;
    }
    d.gozler = 'gozler-mutlu';
  }
  if (t > KASKET[0] + 0.1 && t < SALLA) {
    d.gozler = t > SOZ_D[1] ? 'gozler-mutlu' : 'gozler-sola';
    d.agiz = 'agiz-genis';
  }
  salla(d, t, SALLA + 0.1, SALLA_SON, 'sag', 3.0, 0.92, 1.15);
  salla(d, t, SALLA + 0.3, SALLA_SON, 'sol', 3.0, 0.92, 1.15);
  if (t >= SALLA) {
    d.agiz = t > SALLA + 0.4 && t < SALLA_SON ? 'agiz-genis' : 'agiz-gulumse';
    d.kaslar = 'kaslar-kalkik';
  }
  kirp(d, t, [1.1, 6.2, 9.0]);
  kuyrukSalla(d, t, 2.4, 12);
  return { d, s };
}

// ---------- sahne ----------
const tuval = document.getElementById('sahne') as HTMLCanvasElement;
const DPR = Math.max(1, Math.min(3, Math.round(window.devicePixelRatio || 1)));
tuval.width = GEN * DPR;
tuval.height = YUK * DPR;
tuval.style.width = `${GEN}px`;
tuval.style.height = `${YUK}px`;
const ctx = tuval.getContext('2d')!;

const resim = async (a: string) => {
  const i = new Image();
  i.src = a;
  await i.decode();
  return i;
};
interface Oyuncu { ad: Ad; k: Kukla; ik: Ikincil; ortaX: number; zemin: number }
const SIRA: Ad[] = ['dede', 'baba', 'anne', 'babaanne', 'kino', 'lokum'];
const oyuncular: Oyuncu[] = SIRA.map((ad) => {
  const isk = KIT[ad].json as KuklaIskelet;
  return { ad, k: new Kukla(isk, (d) => GORSEL[`../../assets/karakter/${KIT[ad].klasor}/${d}`]), ik: new Ikincil(), ortaX: isk.parcalar.kalca.pivot[0], zemin: isk.zemin };
});
const POZ: Record<Ad, (t: number, isk: KuklaIskelet) => { d: Durus; s: Sahne }> = {
  dede: dedePoz,
  baba: (t) => ebeveynPoz('baba', t),
  anne: (t) => ebeveynPoz('anne', t),
  kino: kinoPoz,
  lokum: lokumPoz,
  babaanne: babaannePoz,
};
let arka: HTMLImageElement[] = [];
let son = -1;
const sahneler = new Map<Ad, Sahne>();

function arkaCiz() {
  const h = GEN * (2286 / 4096);
  const y = -(h - YUK) * 0.78;
  for (const i of arka) ctx.drawImage(i, 0, y * DPR, GEN * DPR, h * DPR);
}

function kareCiz(i: number) {
  const dt = 1 / FPS;
  if (i <= son) {
    for (const o of oyuncular) o.ik = new Ikincil();
    son = -1;
  }
  for (let j = son + 1; j <= i; j++) {
    const t = j * dt;
    for (const o of oyuncular) {
      const { d, s } = POZ[o.ad](t, o.k.iskelet);
      yaz(o.k, d);
      o.ik.adim(o.k, [s.x / s.o, s.y / s.o - s.hava], dt);
      sahneler.set(o.ad, s);
    }
  }
  son = i;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, tuval.width, tuval.height);
  arkaCiz();
  // önce gölgeler (hepsi zeminde), sonra kuklalar: uzaktakiler önce (y küçük), eşitse SIRA
  const sirali = [...oyuncular].sort((a, b) => sahneler.get(a.ad)!.y - sahneler.get(b.ad)!.y);
  ctx.save();
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  for (const o of sirali) {
    const s = sahneler.get(o.ad)!;
    const golgeO = 1 - Math.min(0.5, s.hava / 600);
    ctx.fillStyle = `rgba(70, 40, 20, ${0.2 * golgeO})`;
    ctx.beginPath();
    ctx.ellipse(s.x, s.y - 4 * s.o, GOLGE[o.ad] * s.o * golgeO, 70 * s.o * golgeO, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  for (const o of sirali) {
    const s = sahneler.get(o.ad)!;
    o.ik.uygula(o.k);
    const ol = s.o * DPR;
    const taban: Matris = [ol, 0, 0, ol, s.x * DPR - o.ortaX * ol, s.y * DPR - (o.zemin + s.hava) * ol];
    o.k.ciz(ctx, taban);
  }
}

const kayit = new URLSearchParams(location.search).has('kayit');
const hazir = (async () => {
  arka = await Promise.all(['arka-uzak', 'arka-orta', 'arka-on'].map((a) => resim(EV[`../../assets/film/ev/${a}.webp`])));
  await Promise.all(oyuncular.map((o) => o.k.yukle()));
})();

declare global {
  interface Window {
    kuklaTest: { hazir: Promise<void>; kare: (i: number) => void; fps: number; sure: number; sesler: { dosya: string; metin: string; t: number }[] };
  }
}
window.kuklaTest = { hazir, kare: kareCiz, fps: FPS, sure: SURE, sesler: [] };

if (!kayit) {
  void hazir.then(() => {
    const bas = performance.now();
    const dongu = () => {
      const t = ((performance.now() - bas) / 1000) % SURE;
      kareCiz(Math.floor(t * FPS));
      requestAnimationFrame(dongu);
    };
    requestAnimationFrame(dongu);
  });
}
