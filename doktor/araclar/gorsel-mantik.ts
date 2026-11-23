// Bağlama betiğinin piksel mantığı: zemin türünü tanır, macentayı temizler, kırıntıyı siler, sayfayı pozlara böler,
// boyut ve kenar denetimi yapar. Saf hesap (RGBA dizileri üstünde); dosya ve resim kitaplığı yok, birim testi buradan sınar.

export interface Resim { g: number; y: number; /** RGBA, satır satır */ d: Uint8Array; }
export interface Kutu { x0: number; y0: number; /** dışta */ x1: number; y1: number; }
export type ZeminTuru = 'seffaf' | 'macenta' | 'duz' | 'opak';

/** Pikselin macentaya yakınlığı: kırmızı ve mavinin yeşili aşan ortak payı (0–255). */
export const macentalik = (r: number, g: number, b: number): number => Math.max(0, Math.min(r, b) - g);

/**
 * Zemin türü: saydam pikseli olan çizim "seffaf"; dört kenarı macenta olan "macenta"; kenarı tek düz renk olan "duz"
 * (beyaz zemin gibi: güvenle temizlenemez); kalanı "opak" (fon).
 */
export function zeminTuru(r: Resim): { tur: ZeminTuru; saydamOran: number; kenarMacenta: number; kenarRenk: [number, number, number] } {
  const n = r.g * r.y;
  let saydam = 0;
  for (let i = 0; i < n; i++) if (r.d[i * 4 + 3] < 16) saydam++;
  const saydamOran = saydam / n;
  const K = Math.max(1, Math.min(4, Math.floor(Math.min(r.g, r.y) / 8)));
  let say = 0, mac = 0, sr = 0, sg = 0, sb = 0;
  const kenar: number[] = [];
  for (let y = 0; y < r.y; y++) for (let x = 0; x < r.g; x++) {
    if (x >= K && x < r.g - K && y >= K && y < r.y - K) { x = r.g - K - 1; continue; }
    const i = (y * r.g + x) * 4;
    say++; kenar.push(i);
    if (macentalik(r.d[i], r.d[i + 1], r.d[i + 2]) > 120) mac++;
    sr += r.d[i]; sg += r.d[i + 1]; sb += r.d[i + 2];
  }
  const ort: [number, number, number] = [sr / say, sg / say, sb / say];
  let sapma = 0;
  for (const i of kenar) sapma += Math.abs(r.d[i] - ort[0]) + Math.abs(r.d[i + 1] - ort[1]) + Math.abs(r.d[i + 2] - ort[2]);
  sapma /= say * 3;
  const kenarMacenta = mac / say;
  const tur: ZeminTuru = saydamOran >= 0.02 ? 'seffaf' : kenarMacenta >= 0.6 ? 'macenta' : sapma < 10 ? 'duz' : 'opak';
  return { tur, saydamOran, kenarMacenta, kenarRenk: [Math.round(ort[0]), Math.round(ort[1]), Math.round(ort[2])] };
}

/**
 * Macenta zemini saydam yapar. Yalnız saf macentaya (zemin) en çok 3 piksel uzaklıktaki pikseller değişir: yarı saydam
 * olabilir ve macenta taşması çıkarılır (mor saçak kalmaz); yarı saydam kenar pikselinin rengi içerideki tam opak
 * komşulardan alınır. Çizimin içindeki pembe, lila ve mor alanlar olduğu gibi kalır. Girdinin kendi saydamlığı korunur.
 */
export function macentaTemizle(r: Resim, lo = 40, hi = 235): { resim: Resim; kenar: number; yetim: number } {
  const { g: G, y: Y } = r, N = G * Y, YAKIN = 3, SAF = 200;
  const a = new Float32Array(N);
  const d = new Uint8Array(r.d);
  // saf macentanın YAKIN piksel çevresi (yatay, sonra dikey genişletme)
  const saf = new Uint8Array(N), yatay = new Uint8Array(N), yakin = new Uint8Array(N);
  for (let i = 0; i < N; i++) if (macentalik(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]) >= SAF) saf[i] = 1;
  for (let y = 0; y < Y; y++) for (let x = 0; x < G; x++) {
    if (!saf[y * G + x]) continue;
    for (let k = Math.max(0, x - YAKIN); k <= Math.min(G - 1, x + YAKIN); k++) yatay[y * G + k] = 1;
  }
  for (let y = 0; y < Y; y++) for (let x = 0; x < G; x++) {
    if (!yatay[y * G + x]) continue;
    for (let k = Math.max(0, y - YAKIN); k <= Math.min(Y - 1, y + YAKIN); k++) yakin[k * G + x] = 1;
  }
  for (let i = 0; i < N; i++) {
    const m = macentalik(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]);
    a[i] = (!yakin[i] || m <= lo ? 1 : m >= hi ? 0 : 1 - (m - lo) / (hi - lo)) * (d[i * 4 + 3] / 255);
  }
  // macenta taşması zemine YAKIN piksel içindeki bütün görünen piksellerden çıkarılır: üretilen çizimde konturun dış
  // kenarı macentaya bulanır (koyu mor saçak); bu şerit konturun içinde kalır, içerideki dolgu renklerine dokunmaz
  for (let i = 0; i < N; i++) {
    if (!yakin[i] || a[i] <= 0) continue;
    const tas = Math.min(d[i * 4], d[i * 4 + 2]) - d[i * 4 + 1];
    if (tas > 0) { d[i * 4] -= tas; d[i * 4 + 2] -= tas; }
  }
  const out = new Uint8Array(N * 4);
  let kenar = 0, yetim = 0;
  for (let y = 0; y < Y; y++) for (let x = 0; x < G; x++) {
    const i = y * G + x;
    let cr = d[i * 4], cg = d[i * 4 + 1], cb = d[i * 4 + 2];
    const al = a[i];
    if (yakin[i] && al > 0 && al < d[i * 4 + 3] / 255) {
      kenar++;
      let sr = 0, sg = 0, sb = 0, n = 0;
      for (let R = 1; R <= 3 && n === 0; R++) for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= G || yy >= Y) continue;
        const j = yy * G + xx;
        if (a[j] === 1) { sr += d[j * 4]; sg += d[j * 4 + 1]; sb += d[j * 4 + 2]; n++; }
      }
      if (n) { cr = sr / n; cg = sg / n; cb = sb / n; } else yetim++;
    }
    out[i * 4] = Math.round(cr); out[i * 4 + 1] = Math.round(cg); out[i * 4 + 2] = Math.round(cb); out[i * 4 + 3] = Math.round(al * 255);
  }
  return { resim: { g: G, y: Y, d: out }, kenar, yetim };
}

/**
 * Tam saydam piksellerin rengini çizimin kenar renginden yayar (birkaç piksel dışa), kalanını sıfırlar. Kayıplı webp renk
 * bilgisini komşu piksellerle paylaşır; saydam alanda macenta ya da beyaz kalırsa çizimin kenarında saçak olarak geri gelir.
 * Resmi yerinde değiştirir.
 */
export function kenarRenginiYay(r: Resim, tur = 4): void {
  const { g: G, y: Y } = r, N = G * Y;
  let dolu = new Uint8Array(N);
  for (let i = 0; i < N; i++) dolu[i] = r.d[i * 4 + 3] > 0 ? 1 : 0;
  for (let t = 0; t < tur; t++) {
    const yeni = new Uint8Array(dolu);
    const renk: number[] = [];
    for (let y = 0; y < Y; y++) for (let x = 0; x < G; x++) {
      const i = y * G + x;
      if (dolu[i]) continue;
      let sr = 0, sg = 0, sb = 0, n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= G || yy >= Y) continue;
        const j = yy * G + xx;
        if (dolu[j]) { sr += r.d[j * 4]; sg += r.d[j * 4 + 1]; sb += r.d[j * 4 + 2]; n++; }
      }
      if (n) { renk.push(i, Math.round(sr / n), Math.round(sg / n), Math.round(sb / n)); yeni[i] = 1; }
    }
    for (let k = 0; k < renk.length; k += 4) { const i = renk[k] * 4; r.d[i] = renk[k + 1]; r.d[i + 1] = renk[k + 2]; r.d[i + 2] = renk[k + 3]; }
    dolu = yeni;
  }
  for (let i = 0; i < N; i++) if (!dolu[i]) { r.d[i * 4] = 0; r.d[i * 4 + 1] = 0; r.d[i * 4 + 2] = 0; }
}

export interface Bilesen { no: number; alan: number; kutu: Kutu; cx: number; cy: number; }
/** Bağlı görünür bölgeler (8 komşulu). `etiket[i]` pikselin bileşen numarası, görünmeyen pikselde -1. */
export function bilesenler(r: Resim, esik = 8): { etiket: Int32Array; liste: Bilesen[] } {
  const { g: G, y: Y } = r, N = G * Y;
  const etiket = new Int32Array(N).fill(-1);
  const liste: Bilesen[] = [];
  const yigin: number[] = [];
  for (let s = 0; s < N; s++) {
    if (etiket[s] !== -1 || r.d[s * 4 + 3] <= esik) continue;
    const no = liste.length;
    let alan = 0, x0 = G, y0 = Y, x1 = 0, y1 = 0, sx = 0, sy = 0;
    yigin.push(s); etiket[s] = no;
    while (yigin.length) {
      const p = yigin.pop()!;
      const px = p % G, py = (p / G) | 0;
      alan++; sx += px; sy += py;
      if (px < x0) x0 = px; if (px >= x1) x1 = px + 1; if (py < y0) y0 = py; if (py >= y1) y1 = py + 1;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const xx = px + dx, yy = py + dy;
        if (xx < 0 || yy < 0 || xx >= G || yy >= Y) continue;
        const q = yy * G + xx;
        if (etiket[q] === -1 && r.d[q * 4 + 3] > esik) { etiket[q] = no; yigin.push(q); }
      }
    }
    liste.push({ no, alan, kutu: { x0, y0, x1, y1 }, cx: sx / alan, cy: sy / alan });
  }
  return { etiket, liste };
}

/** Küçük kopuk lekeleri (üretim kırıntısı) siler; silinen piksel sayısını döndürür. Resmi yerinde değiştirir. */
export function kirintiSil(r: Resim, enAz = 40, esik = 30): number {
  const { etiket, liste } = bilesenler(r, esik);
  const sil = new Set(liste.filter(b => b.alan < enAz).map(b => b.no));
  if (!sil.size) return 0;
  let n = 0;
  for (let i = 0; i < etiket.length; i++) if (sil.has(etiket[i])) { r.d[i * 4 + 3] = 0; n++; }
  return n;
}

export function sinirKutusu(r: Resim, esik = 8): Kutu | null {
  let x0 = r.g, y0 = r.y, x1 = -1, y1 = -1;
  for (let y = 0; y < r.y; y++) for (let x = 0; x < r.g; x++) if (r.d[(y * r.g + x) * 4 + 3] > esik) {
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  return x1 < 0 ? null : { x0, y0, x1: x1 + 1, y1: y1 + 1 };
}

/** Bileşenlerin ağırlık merkezine göre hücrelere dağılımı (satır satır). Her hücre: o hücreye düşen bileşen numaraları. */
export function hucreyeDagit(liste: readonly Bilesen[], g: number, y: number, sutun: number, satir: number): number[][] {
  const hucre: number[][] = Array.from({ length: sutun * satir }, () => []);
  for (const b of liste) {
    const c = Math.min(sutun - 1, Math.floor(b.cx / (g / sutun))), s = Math.min(satir - 1, Math.floor(b.cy / (y / satir)));
    hucre[s * sutun + c].push(b.no);
  }
  return hucre;
}

/**
 * Sayfanın ızgarasını seçer: n poz için aday ızgaralardan, iri bileşenleri tam n hücreye dağıtan en küçük ızgara.
 * Hiçbiri tam tutmazsa en yakın olanı döndürür (`tam: false`).
 */
export function izgaraSec(liste: readonly Bilesen[], g: number, y: number, n: number): { sutun: number; satir: number; tam: boolean } {
  const enBuyuk = Math.max(0, ...liste.map(b => b.alan));
  const iri = liste.filter(b => b.alan >= enBuyuk * 0.08);
  let en: { sutun: number; satir: number; tam: boolean; puan: number } | null = null;
  for (let satir = 1; satir <= Math.min(4, n); satir++) {
    const sutun = Math.ceil(n / satir);
    const dolu = hucreyeDagit(iri, g, y, sutun, satir).filter(h => h.length).length;
    // hücrenin en-boy oranı: bir poz için aşırı yassı ya da aşırı dar hücre ceza alır
    const oran = (g / sutun) / (y / satir);
    const puan = Math.abs(dolu - n) * 100 + (sutun * satir - n) * 10 + Math.abs(Math.log(oran / 0.9));
    if (!en || puan < en.puan) en = { sutun, satir, tam: dolu === n, puan };
  }
  return en ? { sutun: en.sutun, satir: en.satir, tam: en.tam } : { sutun: n, satir: 1, tam: false };
}

/** Yalnız verilen bileşenlerin piksellerinden oluşan, sıkı kırpılmış poz ve sayfadaki yeri. */
export function pozKes(r: Resim, etiket: Int32Array, liste: readonly Bilesen[], nolar: readonly number[]): { resim: Resim; x: number; y: number } | null {
  if (!nolar.length) return null;
  const sec = new Set(nolar);
  let x0 = r.g, y0 = r.y, x1 = 0, y1 = 0;
  for (const b of liste) if (sec.has(b.no)) { x0 = Math.min(x0, b.kutu.x0); y0 = Math.min(y0, b.kutu.y0); x1 = Math.max(x1, b.kutu.x1); y1 = Math.max(y1, b.kutu.y1); }
  const g = x1 - x0, y = y1 - y0;
  const d = new Uint8Array(g * y * 4);
  for (let yy = 0; yy < y; yy++) for (let xx = 0; xx < g; xx++) {
    const k = (yy + y0) * r.g + xx + x0;
    if (!sec.has(etiket[k])) continue;
    const h = (yy * g + xx) * 4;
    d[h] = r.d[k * 4]; d[h + 1] = r.d[k * 4 + 1]; d[h + 2] = r.d[k * 4 + 2]; d[h + 3] = r.d[k * 4 + 3];
  }
  return { resim: { g, y, d }, x: x0, y: y0 };
}

/** Boyut kararı: tuvalle aynı ("tam"), aynı oranda başka çözünürlük ("oran": ölçeklenir) ya da başka oran ("farkli"). */
export function boyutKarari(g: number, y: number, hedefG: number, hedefY: number): { karar: 'tam' | 'oran' | 'farkli'; olcek: number } {
  if (g === hedefG && y === hedefY) return { karar: 'tam', olcek: 1 };
  const fark = Math.abs(g / y - hedefG / hedefY) / (hedefG / hedefY);
  return fark < 0.01 ? { karar: 'oran', olcek: hedefG / g } : { karar: 'farkli', olcek: hedefG / g };
}

/**
 * Pozun yere bastığı yerin yatay ortası (poz pikseli): en alttaki şeritte (boyun 1/28'i, en az 4 satır) görünen
 * sütunların ortası. Kol ya da kuyruk yana uzanınca kutunun ortası kayar, ayakların ortası kaymaz.
 */
export function altTemasX(r: Resim, esik = 96): number {
  const k = sinirKutusu(r, esik);
  if (!k) return r.g / 2;
  const serit = Math.max(4, Math.floor((k.y1 - k.y0) / 28));
  let sol = r.g, sag = -1;
  for (let y = Math.max(k.y0, k.y1 - serit); y < k.y1; y++) for (let x = k.x0; x < k.x1; x++) if (r.d[(y * r.g + x) * 4 + 3] > esik) { if (x < sol) sol = x; if (x > sag) sag = x; }
  return sag < 0 ? (k.x0 + k.x1) / 2 : (sol + sag + 1) / 2;
}

/**
 * Ölçeklenmiş pozun tuvaldeki yeri: pozun alt kenarı `capa`nın y'sine, `temasX` (poz pikseli; verilmezse kutunun
 * ortası) `capa`nın x'ine oturur. `tasan`: tuvalin dışına taşıyor.
 */
export function yerlestirme(pozG: number, pozY: number, olcek: number, capa: readonly [number, number], tuvalG: number, tuvalY: number, temasX?: number): { sol: number; ust: number; g: number; y: number; tasan: boolean } {
  const g = Math.max(1, Math.round(pozG * olcek)), y = Math.max(1, Math.round(pozY * olcek));
  const sol = Math.round(capa[0] - (temasX ?? pozG / 2) * olcek), ust = Math.round(capa[1] - y);
  return { sol, ust, g, y, tasan: sol < 0 || ust < 0 || sol + g > tuvalG || ust + y > tuvalY };
}

export interface Olcum {
  /** alfa > 40 */ gorunen: number;
  /** 8 < alfa < 247 */ yariSaydam: number;
  /** çizimin kenarında (saydam alana 2 px yakın) macentaya çalan pikseller */ macentaKalinti: number;
  /** görünen piksellerin tuvale oranı */ doluluk: number;
  /** saydam alandan 3–9 piksel içerideki koyu (kontur) piksellerden mora çalanların oranı: macenta zeminden bulaşma */ konturMor: number;
  /** dört kenar çizgisindeki görünen piksel sayısı */ kenar: { ust: number; alt: number; sol: number; sag: number };
  /** dört köşe (sol üst, sağ üst, sol alt, sağ alt) saydam mı */ koseSaydam: [boolean, boolean, boolean, boolean];
  kutu: Kutu | null;
}
export function olc(r: Resim): Olcum {
  const { g: G, y: Y } = r, N = G * Y;
  let gorunen = 0, yariSaydam = 0, macentaKalinti = 0;
  for (let i = 0; i < N; i++) {
    const a = r.d[i * 4 + 3];
    if (a > 8 && a < 247) yariSaydam++;
    if (a > 40) gorunen++;
  }
  const al = (x: number, y: number) => r.d[(y * G + x) * 4 + 3];
  // macenta kalıntısı: yalnız saydam alana 2 piksel yakınlıktaki (kenardaki) macentaya çalan pikseller; içerideki pembe ve mor sayılmaz
  for (let y = 0; y < Y; y++) for (let x = 0; x < G; x++) {
    const i = (y * G + x) * 4;
    if (r.d[i + 3] <= 40 || macentalik(r.d[i], r.d[i + 1], r.d[i + 2]) <= 70) continue;
    let kenarda = false;
    for (let dy = -2; dy <= 2 && !kenarda; dy++) for (let dx = -2; dx <= 2; dx++) {
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= G || yy >= Y || al(xx, yy) <= 8) { kenarda = true; break; }
    }
    if (kenarda) macentaKalinti++;
  }
  // kontur şeridi: saydam alanın 9 piksel çevresi eksi 3 piksel çevresi (en dıştaki şerit temizlikte zaten nötrlenir)
  const genislet = (m: Uint8Array, k: number): Uint8Array => {
    const a = new Uint8Array(N), b = new Uint8Array(N);
    for (let y = 0; y < Y; y++) for (let x = 0; x < G; x++) if (m[y * G + x]) for (let i = Math.max(0, x - k); i <= Math.min(G - 1, x + k); i++) a[y * G + i] = 1;
    for (let y = 0; y < Y; y++) for (let x = 0; x < G; x++) if (a[y * G + x]) for (let i = Math.max(0, y - k); i <= Math.min(Y - 1, y + k); i++) b[i * G + x] = 1;
    return b;
  };
  const bos = new Uint8Array(N);
  for (let i = 0; i < N; i++) bos[i] = r.d[i * 4 + 3] <= 8 ? 1 : 0;
  let koyu = 0, mor = 0;
  if (gorunen && gorunen < N) {
    const ic = genislet(bos, 3), dis = genislet(bos, 9);
    for (let i = 0; i < N; i++) {
      if (!dis[i] || ic[i] || r.d[i * 4 + 3] < 250) continue;
      const cr = r.d[i * 4], cg = r.d[i * 4 + 1], cb = r.d[i * 4 + 2];
      if (0.3 * cr + 0.59 * cg + 0.11 * cb > 90) continue;
      koyu++; if (macentalik(cr, cg, cb) > 30) mor++;
    }
  }
  const kenar = { ust: 0, alt: 0, sol: 0, sag: 0 };
  for (let x = 0; x < G; x++) { if (al(x, 0) > 40) kenar.ust++; if (al(x, Y - 1) > 40) kenar.alt++; }
  for (let y = 0; y < Y; y++) { if (al(0, y) > 40) kenar.sol++; if (al(G - 1, y) > 40) kenar.sag++; }
  const kose = (x: number, y: number) => al(x, y) <= 8;
  return { gorunen, yariSaydam, macentaKalinti, konturMor: koyu > 200 ? mor / koyu : 0, doluluk: gorunen / N, kenar, koseSaydam: [kose(0, 0), kose(G - 1, 0), kose(0, Y - 1), kose(G - 1, Y - 1)], kutu: sinirKutusu(r, 40) };
}

/** Aynı tuvaldeki iki çizimin farkı: belirgin biçimde değişen piksel sayısı ve bunların kutusu. */
export function farkSay(a: Resim, b: Resim, esik = 60): { piksel: number; kutu: Kutu | null } {
  if (a.g !== b.g || a.y !== b.y) return { piksel: -1, kutu: null };
  let piksel = 0, x0 = a.g, y0 = a.y, x1 = -1, y1 = -1;
  for (let y = 0; y < a.y; y++) for (let x = 0; x < a.g; x++) {
    const i = (y * a.g + x) * 4;
    const aa = a.d[i + 3] / 255, ba = b.d[i + 3] / 255;
    const f = Math.abs(a.d[i] * aa - b.d[i] * ba) + Math.abs(a.d[i + 1] * aa - b.d[i + 1] * ba) + Math.abs(a.d[i + 2] * aa - b.d[i + 2] * ba) + Math.abs(a.d[i + 3] - b.d[i + 3]);
    if (f > esik) { piksel++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  return { piksel, kutu: x1 < 0 ? null : { x0, y0, x1: x1 + 1, y1: y1 + 1 } };
}

export type Seviye = 'hata' | 'uyari' | 'bilgi';
export interface Bulgu { seviye: Seviye; metin: string; }

/** Bağlanmış bir çizimin denetimi: boyut, zemin, köşeler, kenara değme, macenta kalıntısı, boş çizim. */
export function denetle(o: Olcum, g: number, y: number, beklenen: { g: number; y: number; zemin: 'seffaf' | 'opak'; altKesik: boolean }): Bulgu[] {
  const b: Bulgu[] = [];
  if (g !== beklenen.g || y !== beklenen.y) b.push({ seviye: 'hata', metin: `boyut ${g} × ${y}; beklenen ${beklenen.g} × ${beklenen.y}` });
  if (beklenen.zemin === 'opak') {
    if (o.gorunen < g * y) b.push({ seviye: 'uyari', metin: `fonda ${g * y - o.gorunen} saydam piksel var (opak olmalı)` });
    return b;
  }
  if (o.doluluk < 0.005) b.push({ seviye: 'hata', metin: 'çizim boş görünüyor (görünen piksel %0,5\'in altında)' });
  if (o.koseSaydam.some(k => !k)) b.push({ seviye: 'hata', metin: 'dört köşe saydam değil (zemin temizlenmemiş olabilir)' });
  const k = o.kenar;
  const degen = [k.ust && `üst ${k.ust}`, k.sol && `sol ${k.sol}`, k.sag && `sağ ${k.sag}`, !beklenen.altKesik && k.alt && `alt ${k.alt}`].filter(Boolean);
  if (degen.length) b.push({ seviye: 'uyari', metin: `çizim tuvalin kenarına değiyor (${degen.join(', ')} px): uzuv kesilmiş olabilir` });
  if (o.macentaKalinti > 60) b.push({ seviye: 'uyari', metin: `${o.macentaKalinti} kenar pikselinde macenta kalıntısı (mor saçak; %100 boyda koyu zeminde bak)` });
  if (o.konturMor > 0.03) b.push({ seviye: 'uyari', metin: `kontur mora çalıyor (koyu kenar piksellerinde mor oranı %${Math.round(o.konturMor * 100)}): macenta zeminden bulaşma olabilir, %100 boyda beyaz zeminde bak` });
  if (o.gorunen && o.yariSaydam / o.gorunen > 0.15) b.push({ seviye: 'uyari', metin: `yarı saydam piksel oranı %${Math.round(o.yariSaydam / o.gorunen * 100)} (bulanık kenar ya da yarı saydam gövde)` });
  return b;
}
