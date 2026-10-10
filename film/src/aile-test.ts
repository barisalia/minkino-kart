/**
 * Kino ailesinin kesme kukla deneme klibi (yalnız geliştirme: /film/aile-test.html). ~14 sn, parkta:
 * Anne ile Baba konuşur, Kino arkadan koşup Anne ile Lokum'un arasına gelir, Lokum iki kez zıplar, Kino "Yaşasın!" der, hep birlikte
 * el sallarlar. Dört kit aynı birimde çizildi (assets/karakter/aile-boy.json): hepsi AYNI ölçekle basılır, boylar
 * tablodaki gibi çıkar. Anne ile Baba'nın sesi yok (seslendirme Barış'ın kararı): ağızları hece ritmiyle oynar.
 *
 * Kayıt: node scripts/film/kukla-kayit.mjs --adres http://localhost:<port>/film/aile-test.html --webm <cikti.webm>
 * (sayfa window.kuklaTest ile kare kare çizer). Normal açılışta gerçek zamanlı oynar (tıklayınca sesli baştan).
 */
import { aralik, Kukla, tasan, type KuklaIskelet, type Matris } from './kukla';
import { bacakKur, Ikincil, yuruyusPozu, type AyakHedef } from './kukla-hareket';
import { konusmaAgzi, konusmaGucu, zarfCikar, type Zarf } from './kukla-ses';
import kinoJson from '../../assets/karakter/kino-yeni/kino-yeni.json';
import anneJson from '../../assets/karakter/anne/anne.json';
import babaJson from '../../assets/karakter/baba/baba.json';
import lokumJson from '../../assets/karakter/lokum/lokum.json';

const GORSEL: Record<string, string> = {
  ...import.meta.glob<string>('../../assets/karakter/kino-yeni/*.webp', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob<string>('../../assets/karakter/anne/*.webp', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob<string>('../../assets/karakter/baba/*.webp', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob<string>('../../assets/karakter/lokum/*.webp', { eager: true, query: '?url', import: 'default' }),
};
const PARK = import.meta.glob<string>('../../assets/film/park/*.webp', { eager: true, query: '?url', import: 'default' });

const FPS = 30;
const SURE = 14;
const GEN = 844, YUK = 390;
/** ortak ölçek (css px / kare birimi) ve zemin çizgisi */
const O = 0.084, ZEMIN_Y = 374;
const SESLER = [{ dosya: 'ses/kino/d27a032e541b12.mp3', metin: 'Yaşasın!', t: 8.0 }];

type Ad = 'kino' | 'anne' | 'baba' | 'lokum';
const KIT: Record<Ad, { json: unknown; klasor: string }> = {
  kino: { json: kinoJson, klasor: 'kino-yeni' },
  anne: { json: anneJson, klasor: 'anne' },
  baba: { json: babaJson, klasor: 'baba' },
  lokum: { json: lokumJson, klasor: 'lokum' },
};
/** sahnedeki yerler (css px, ayak ortası) */
const YER: Record<Ad, number> = { anne: 236, kino: 384, lokum: 510, baba: 652 };

// ---------- duruş: bir karedeki bütün eklemler ----------
interface Durus {
  kalcaX: number; kalcaY: number; kalcaA: number;
  govdeA: number; govdeSy: number;
  kafaA: number; kafaY: number;
  kuyruk: number;
  kolSag: number; kolSol: number; dirsekSag: number; dirsekSol: number; elSag: number; elSol: number;
  ayakSag: AyakHedef; ayakSol: AyakHedef;
  gozler: string; kaslar: string; agiz: string;
  hava: number;
}
const yeniDurus = (): Durus => ({
  kalcaX: 0, kalcaY: 0, kalcaA: 0, govdeA: 0, govdeSy: 1, kafaA: 0, kafaY: 0, kuyruk: 0,
  kolSag: 0, kolSol: 0, dirsekSag: 0, dirsekSol: 0, elSag: 0, elSol: 0,
  ayakSag: { x: 0, y: 0 }, ayakSol: { x: 0, y: 0 },
  gozler: 'gozler-acik', kaslar: 'kaslar-notr', agiz: 'agiz-gulumse', hava: 0,
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
}

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
/** sahte konuşma (ses yok): hece ritmi; {agiz, guc} ya da null */
function hece(t: number, bas: number, son: number, tohum: number): { agiz: string; guc: number } | null {
  if (t < bas || t > son) return null;
  const x = (t - bas) * 5.4;
  const i = Math.floor(x), f = x - i;
  // her 4-5 hecede kısa duraklama
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
/** el sallama: taraf 'sag' (ekranın solundaki kol) ya da 'sol'; g 0..1 kalkma */
function salla(d: Durus, t: number, bas: number, son: number, taraf: 'sag' | 'sol', hiz = 2.3, genlik = 1, dirsekK = 1) {
  if (t < bas - 0.2 || t > son + 0.6) return 0;
  const kalk = tasan(aralik(t, bas, bas + 0.45), 1.4) * (1 - tasan(aralik(t, son, son + 0.5), 0.9));
  const dalga = Math.sin(2 * Math.PI * hiz * (t - bas - 0.3)) * aralik(t, bas + 0.3, bas + 0.5) * (1 - aralik(t, son - 0.2, son));
  const s = taraf === 'sag' ? 1 : -1;
  if (taraf === 'sag') {
    d.kolSag += 100 * kalk * genlik;
    d.dirsekSag += (50 + 26 * dalga) * kalk * dirsekK;
    d.elSag += 10 * dalga * kalk;
  } else {
    d.kolSol += -100 * kalk * genlik;
    d.dirsekSol += -(50 + 26 * dalga) * kalk * dirsekK;
    d.elSol += -10 * dalga * kalk;
  }
  d.kafaA += 4 * s * kalk;
  d.govdeA += 2 * s * kalk;
  return kalk;
}
function kuyrukSalla(d: Durus, t: number, hiz: number, genlik: number) {
  d.kuyruk += genlik * Math.sin(2 * Math.PI * hiz * t);
}

// ---------- Kino: arkadan koşup gelir ----------
const KOS_BAS = 3.5, ADIM = 11, ADIM_T = 0.29, KOS_SON = KOS_BAS + ADIM * ADIM_T;
const KINO_BAS = { x: YER.kino + 6, y: 286, o: 0.046 }, KINO_SON = { x: YER.kino, y: ZEMIN_Y, o: O };
function ilerle(u: number) {
  const N = ADIM, r = 0.9;
  const v = (x: number) => (x < r ? 0.35 + (0.65 * x) / r : x > N - r ? 0.35 + (0.65 * (N - x)) / r : 1);
  let s = 0, top = 0;
  for (let x = 0; x < N; x += 0.01) {
    const dd = v(x) * 0.01;
    top += dd;
    if (x < u) s += dd;
  }
  return Math.min(1, s / top);
}
interface Sahne { x: number; y: number; o: number; hava: number }

function kinoPoz(t: number, sesler: Zarf[]): { d: Durus; s: Sahne } {
  const d = yeniDurus();
  const u = Math.max(0, Math.min(ADIM, (t - KOS_BAS) / ADIM_T));
  const p = ilerle(u);
  const s: Sahne = { x: KINO_BAS.x + (KINO_SON.x - KINO_BAS.x) * p, y: KINO_BAS.y + (KINO_SON.y - KINO_BAS.y) * p, o: KINO_BAS.o + (KINO_SON.o - KINO_BAS.o) * p, hava: 0 };
  if (t < KOS_BAS) {
    // henüz görünmüyor (sahnenin arkasında); yine de durgun duruş
    nefes(d, t);
    return { d, s };
  }
  if (t < KOS_SON) {
    const genlik = Math.min(1, u / 0.6, (ADIM - u) / 0.6);
    const adim: [number, number] = [((KINO_SON.x - KINO_BAS.x) / ADIM / s.o) * 0.9, ((KINO_SON.y - KINO_BAS.y) / ADIM / s.o) * 0.9];
    const w = yuruyusPozu(u, adim, genlik);
    d.ayakSag = w.ayak.sag;
    d.ayakSol = w.ayak.sol;
    d.kalcaY += w.kalcaY;
    d.kalcaA += w.kalcaA * 1.3;
    d.kalcaX += w.kalcaX;
    d.govdeA -= w.kalcaA * 0.8;
    d.kafaA -= w.kalcaA * 0.6;
    // koşu: kollar dirsekten bükük, güçlü sallanır; adım ortasında gövde havalanır
    d.kolSag += 6 * genlik - 26 * w.kolSalla;
    d.kolSol += -6 * genlik - 26 * w.kolSalla;
    d.dirsekSag += -60 * genlik;
    d.dirsekSol += 60 * genlik;
    s.hava = 70 * w.kalk * genlik;
    d.govdeA += 2 * genlik;
    d.agiz = 'agiz-orta';
    d.kaslar = 'kaslar-kalkik';
    kuyrukSalla(d, t, 3.4, 14);
  }
  const dur = t - KOS_SON;
  if (dur >= -0.05 && dur < 0.7) {
    const x = (dur + 0.05) / 0.6;
    d.kalcaY += 26 * Math.sin(Math.PI * Math.min(1, x)) * Math.exp(-x);
    d.govdeA += -2 * Math.sin(Math.PI * Math.min(1, x));
  }
  if (t >= KOS_SON) {
    nefes(d, t, 0.5);
    d.agiz = 'agiz-genis';
    // ailesine bakar: önce Anne'ye (sol), sonra Baba'ya (sağ)
    if (t < 7.6) d.gozler = 'gozler-sola';
    else if (t > 9.2 && t < 9.9) d.gozler = 'gozler-saga';
  }
  // "Yaşasın!": iki kol havaya
  const ya = aralik(t, 7.85, 8.1) * (1 - aralik(t, 8.9, 9.25));
  if (ya > 0) {
    d.kolSag += 120 * tasan(ya, 1.3);
    d.kolSol += -120 * tasan(ya, 1.3);
    d.dirsekSag += 20 * ya;
    d.dirsekSol += -20 * ya;
    d.gozler = 'gozler-mutlu';
    d.kaslar = 'kaslar-kalkik';
    d.kalcaY += -10 * ya;
    d.kafaA += -3 * ya;
  }
  salla(d, t, 10.15, 13.3, 'sag', 2.4);
  kirp(d, t, [7.3, 9.5, 12.1, 13.6]);
  if (t > 9.2 && t < 9.9) d.gozler = 'gozler-saga';
  const ka = konusmaAgzi(sesler, t, FPS);
  if (ka) {
    d.agiz = ka;
    d.kafaY += -10 * konusmaGucu(sesler, t, FPS);
  }
  if (t >= 10.2) {
    d.agiz = t > 10.6 && t < 12.9 ? 'agiz-genis' : 'agiz-gulumse';
    d.kaslar = 'kaslar-kalkik';
  }
  kuyrukSalla(d, t, 1.8, t > KOS_SON ? 14 : 6);
  return { d, s };
}

// ---------- Anne ----------
function annePoz(t: number): { d: Durus; s: Sahne } {
  const d = yeniDurus();
  nefes(d, t, 0.3, 0.2);
  // 1) Baba'ya döner ve konuşur: sol kol (ekranın sağı) dirsekten bükülür, el anlatır
  const g = aralik(t, 0.3, 0.7) * (1 - aralik(t, 2.0, 2.5));
  if (g > 0) {
    d.kafaA += 6 * g;
    d.govdeA += 1.5 * g;
    d.kolSol += -14 * g;
    d.dirsekSol += 78 * tasan(g, 1.1) + 10 * Math.sin(2 * Math.PI * 1.6 * (t - 0.4)) * g;
    d.elSol += -12 * g;
    d.kaslar = 'kaslar-kalkik';
  }
  if (t > 0.35 && t < 3.55) d.gozler = 'gozler-saga';
  konus(d, t, 0.45, 1.95, 3);
  // 2) Baba konuşurken dinler, güler
  if (t > 2.9 && t < 3.5) {
    d.gozler = 'gozler-mutlu';
    d.agiz = 'agiz-genis';
    d.kafaA += -3;
  }
  // 3) Kino gelince ona bakar (sağa), kollar hafif açılır
  if (t > 3.6 && t < 7.0) {
    d.gozler = 'gozler-saga';
    d.kaslar = 'kaslar-kalkik';
    d.kafaA += 3 * aralik(t, 3.6, 4.0);
  }
  if (t > 6.5) d.agiz = 'agiz-genis';
  // 4) Kino'ya "hoş geldin" (sahte konuşma)
  konus(d, t, 7.0, 7.7, 7);
  // Lokum zıplarken ona bakar (sağda, Kino'nun yanında), güler
  if (t > 7.8 && t < 9.6) {
    d.gozler = t > 8.6 ? 'gozler-mutlu' : 'gozler-saga';
    d.kafaA += 5 * aralik(t, 7.8, 8.1) * (1 - aralik(t, 9.3, 9.6));
    d.agiz = 'agiz-genis';
  }
  salla(d, t, 10.0, 13.3, 'sag', 2.0, 0.85);
  if (t >= 10.0) {
    d.agiz = t > 10.4 && t < 13.0 ? 'agiz-orta' : 'agiz-gulumse';
    d.kaslar = 'kaslar-kalkik';
  }
  kirp(d, t, [2.4, 5.4, 9.8, 12.6]);
  kuyrukSalla(d, t, 1.1, 7);
  return { d, s: { x: YER.anne, y: ZEMIN_Y, o: O, hava: 0 } };
}

// ---------- Baba ----------
function babaPoz(t: number): { d: Durus; s: Sahne } {
  const d = yeniDurus();
  nefes(d, t, 0.25, 0.6);
  // 1) Anne konuşurken dinler, başını sallar
  if (t > 0.5 && t < 2.0) {
    d.gozler = 'gozler-sola';
    d.kafaA += -4 + 3 * Math.sin(2 * Math.PI * 1.2 * (t - 0.5));
  }
  // 2) cevap verir: sağ el (ekranın solu) göbeğinin üstünde, konuşur, sonra güler
  const g = aralik(t, 1.9, 2.3) * (1 - aralik(t, 3.4, 3.9));
  if (g > 0) {
    d.kolSag += 6 * g;
    d.dirsekSag += -84 * tasan(g, 1.1);
    d.elSag += 14 * g;
    d.kafaA += -5 * g;
    d.gozler = 'gozler-sola';
  }
  konus(d, t, 2.05, 2.95, 11);
  if (t > 2.95 && t < 3.55) {
    const ha = Math.sin(2 * Math.PI * 4.4 * (t - 2.95));
    d.gozler = 'gozler-mutlu';
    d.agiz = ha > -0.2 ? 'agiz-kahkaha' : 'agiz-genis';
    d.govdeSy += 0.018 * Math.abs(ha);
    d.kalcaY += 8 * Math.abs(ha);
    d.kafaA += -3 + 2 * ha;
  }
  // 3) Kino'ya bakar (sola)
  if (t > 3.7 && t < 7.4) {
    d.gozler = 'gozler-sola';
    d.kaslar = 'kaslar-kalkik';
    d.kafaA += -3 * aralik(t, 3.7, 4.1);
  }
  if (t > 6.7) d.agiz = 'agiz-genis';
  if (t > 7.8 && t < 9.6) {
    d.gozler = t < 8.1 ? 'gozler-sola' : 'gozler-mutlu';
    d.agiz = t > 8.0 && t < 8.9 ? 'agiz-kahkaha' : 'agiz-genis';
    d.govdeSy += t > 8.0 && t < 8.9 ? 0.012 * Math.abs(Math.sin(2 * Math.PI * 4 * t)) : 0;
  }
  salla(d, t, 10.3, 13.3, 'sol', 1.8, 0.85);
  if (t >= 10.3) {
    d.agiz = t > 10.7 && t < 13.0 ? 'agiz-genis' : 'agiz-gulumse';
    d.kaslar = 'kaslar-kalkik';
  }
  kirp(d, t, [1.2, 4.6, 6.6, 11.6]);
  kuyrukSalla(d, t, 0.9, 6);
  return { d, s: { x: YER.baba, y: ZEMIN_Y, o: O, hava: 0 } };
}

// ---------- Lokum: iki kez zıplar ----------
function lokumPoz(t: number): { d: Durus; s: Sahne } {
  const d = yeniDurus();
  nefes(d, t, 0.45, 0.4);
  const s: Sahne = { x: YER.lokum, y: ZEMIN_Y, o: O, hava: 0 };
  // ilk saniyeler: etrafına bakar, sallanır
  d.kalcaA += 2 * Math.sin(2 * Math.PI * 0.4 * t);
  d.kafaA += 3 * Math.sin(2 * Math.PI * 0.4 * t + 0.6);
  if (t < 3.6) d.gozler = t < 1.6 ? 'gozler-sola' : t < 2.6 ? 'gozler-saga' : 'gozler-acik';
  if (t > 3.8 && t < 7.4) {
    d.gozler = 'gozler-sola';
    d.kaslar = 'kaslar-kalkik';
    d.agiz = t > 6.6 ? 'agiz-genis' : 'agiz-o';
  }
  // zıplamalar
  for (const [hBas, yuk] of [[7.45, 230], [8.35, 280]] as const) {
    const kalk = hBas + 0.26, ini = kalk + 0.48, son = ini + 0.4;
    if (t < hBas || t > son) continue;
    if (t < kalk) {
      const c = Math.sin((Math.PI / 2) * aralik(t, hBas, kalk));
      d.kalcaY += 34 * c;
      d.govdeSy -= 0.04 * c;
      d.kolSag += -8 * c;
      d.kolSol += 8 * c;
      d.gozler = 'gozler-mutlu';
    } else if (t < ini) {
      const tau = (t - kalk) / (ini - kalk);
      s.hava = yuk * 4 * tau * (1 - tau);
      d.govdeSy += 0.03 * (1 - tau);
      d.ayakSag = { x: -4, y: -18 * Math.sin(Math.PI * tau), egim: -8 * Math.sin(Math.PI * tau) };
      d.ayakSol = { x: 4, y: -18 * Math.sin(Math.PI * tau), egim: 8 * Math.sin(Math.PI * tau) };
      d.kolSag += 130 * Math.sin(Math.PI * Math.min(1, tau * 1.25));
      d.kolSol += -130 * Math.sin(Math.PI * Math.min(1, tau * 1.25));
      d.gozler = 'gozler-mutlu';
      d.kaslar = 'kaslar-kalkik';
      d.agiz = 'agiz-kahkaha';
    } else {
      const x = (t - ini) / (son - ini);
      const ez = Math.sin(Math.PI * Math.min(1, x * 1.6)) * Math.exp(-x * 2);
      d.kalcaY += 40 * ez;
      d.govdeSy -= 0.07 * ez;
      d.agiz = 'agiz-genis';
    }
  }
  if (t > 9.2 && t < 10.0) {
    d.gozler = 'gozler-sola';
    d.agiz = 'agiz-genis';
  }
  // el sallama: iki kol birden (bebek)
  salla(d, t, 10.05, 13.3, 'sag', 3.0, 0.92, 1.15);
  salla(d, t, 10.25, 13.3, 'sol', 3.0, 0.92, 1.15);
  if (t >= 10.05) {
    d.agiz = t > 10.4 && t < 13.0 ? 'agiz-genis' : 'agiz-gulumse';
    d.kaslar = 'kaslar-kalkik';
    d.kalcaY += 6 * Math.abs(Math.sin(2 * Math.PI * 1.5 * t)) * aralik(t, 10.2, 10.6) * (1 - aralik(t, 13.0, 13.4));
  }
  kirp(d, t, [1.1, 3.0, 5.8, 9.9, 12.4]);
  kuyrukSalla(d, t, 2.4, t > 7.4 ? 18 : 9);
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
interface Oyuncu { ad: Ad; k: Kukla; ik: Ikincil; ortaX: number; zemin: number; golge: number }
const GOLGE: Record<Ad, number> = { kino: 560, anne: 520, baba: 640, lokum: 420 };
const oyuncular: Oyuncu[] = (Object.keys(KIT) as Ad[]).map((ad) => {
  const isk = KIT[ad].json as KuklaIskelet;
  return { ad, k: new Kukla(isk, (d) => GORSEL[`../../assets/karakter/${KIT[ad].klasor}/${d}`]), ik: new Ikincil(), ortaX: isk.parcalar.kalca.pivot[0], zemin: isk.zemin, golge: GOLGE[ad] };
});
const POZ: Record<Ad, (t: number) => { d: Durus; s: Sahne }> = {
  kino: (t) => kinoPoz(t, sesler),
  anne: annePoz,
  baba: babaPoz,
  lokum: lokumPoz,
};
let arka: HTMLImageElement[] = [];
let sesler: Zarf[] = [];
let son = -1;
const sahneler = new Map<Ad, Sahne>();

function arkaCiz() {
  const h = GEN * (9 / 16);
  const y = -(h - YUK) * 0.72;
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
      const { d, s } = POZ[o.ad](t);
      yaz(o.k, d);
      o.ik.adim(o.k, [s.x / s.o, s.y / s.o - s.hava], dt);
      sahneler.set(o.ad, s);
    }
  }
  son = i;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, tuval.width, tuval.height);
  arkaCiz();
  const t = i * dt;
  // uzaktakiler önce (y küçük); Kino koşu başlamadan görünmez
  const sirali = oyuncular.filter((o) => o.ad !== 'kino' || t >= KOS_BAS).sort((a, b) => sahneler.get(a.ad)!.y - sahneler.get(b.ad)!.y);
  for (const o of sirali) {
    const s = sahneler.get(o.ad)!;
    o.ik.uygula(o.k);
    const golgeO = 1 - Math.min(0.5, s.hava / 600);
    ctx.save();
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.fillStyle = `rgba(40, 70, 20, ${0.22 * golgeO})`;
    ctx.beginPath();
    ctx.ellipse(s.x, s.y - 4 * s.o, o.golge * s.o * golgeO, 70 * s.o * golgeO, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    const ol = s.o * DPR;
    const taban: Matris = [ol, 0, 0, ol, s.x * DPR - o.ortaX * ol, s.y * DPR - (o.zemin + s.hava) * ol];
    o.k.ciz(ctx, taban);
  }
}

const kayit = new URLSearchParams(location.search).has('kayit');
const hazir = (async () => {
  arka = await Promise.all(['arka-uzak', 'arka-on', 'arka-orta-2'].map((a) => resim(PARK[`../../assets/film/park/${a}.webp`])));
  await Promise.all(oyuncular.map((o) => o.k.yukle()));
  const taban = import.meta.env.BASE_URL;
  sesler = await Promise.all(SESLER.map((s) => zarfCikar(`${taban}${s.dosya}`, s.metin, s.t, FPS)));
})();

declare global {
  interface Window {
    kuklaTest: { hazir: Promise<void>; kare: (i: number) => void; fps: number; sure: number; sesler: typeof SESLER };
  }
}
window.kuklaTest = { hazir, kare: kareCiz, fps: FPS, sure: SURE, sesler: SESLER };

if (!kayit) {
  void hazir.then(() => {
    let bas = performance.now();
    const caliyor: HTMLAudioElement[] = [];
    tuval.addEventListener('click', () => {
      bas = performance.now();
      son = -1;
      for (const o of oyuncular) o.ik = new Ikincil();
      for (const a of caliyor) a.pause();
      caliyor.length = 0;
      for (const s of SESLER) {
        const a = new Audio(`${import.meta.env.BASE_URL}${s.dosya}`);
        caliyor.push(a);
        setTimeout(() => void a.play(), s.t * 1000);
      }
    });
    const dongu = () => {
      const t = ((performance.now() - bas) / 1000) % SURE;
      kareCiz(Math.floor(t * FPS));
      requestAnimationFrame(dongu);
    };
    requestAnimationFrame(dongu);
  });
}
