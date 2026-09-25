/**
 * Klasik şekil karşılaştırma (yapay zeka yok, anında):
 *  - kapsama: şablon çizgisinin ne kadarının üstünden geçilmiş (eksik parça buradan çıkar)
 *  - isabet: çocuğun çizgisinin ne kadarı şablona yakın (karalamayı ayıklar)
 *  - oran: bakarak/hafızadan çizimde en-boy oranı tutuyor mu
 * Bakarak ve hafızadan çizimde çizim önce şablona hizalanır (yer ve büyüklük önemsiz).
 */
import canlan from '../../content/canlan.json';
import type { Mod, Nokta, Resim, SablonCizgi } from './resimler';

export interface PuanAyar {
  tolerans: Record<Mod, number>;
  yas_carpani: Record<string, number>;
  yildiz: Record<Mod, number[]>;
  canlanma_yildiz: number;
}
export const AYAR = canlan.puan as unknown as PuanAyar;

/** Çocuk → şablon: sablon = cocuk * s + (tx, ty) */
export interface Donusum {
  s: number;
  tx: number;
  ty: number;
}

export interface Parcali {
  parca: string;
  n: Nokta[];
  kalinlik?: number;
}

export interface PuanSonuc {
  puan: number;
  yildiz: 0 | 1 | 2 | 3;
  kapsama: number;
  isabet: number;
  oran: number;
  murekkep: number;
  tekrar: number;
  eksik: string[];
  /** Parça başına kapsama (0..1) */
  parcaKapsama: Record<string, number>;
  donusum: Donusum;
  /** Çocuğun çizgileri, en yakın şablon parçasına göre bölünmüş (çocuğun koordinatında) */
  parcalar: Parcali[];
}

// ---------- geometri ----------
export function uzunluk(n: Nokta[]): number {
  let t = 0;
  for (let i = 1; i < n.length; i++) t += Math.hypot(n[i][0] - n[i - 1][0], n[i][1] - n[i - 1][1]);
  return t;
}

/** Çizgiyi eşit aralıklı noktalara böler. */
export function ornekle(n: Nokta[], adim: number): Nokta[] {
  if (n.length === 0) return [];
  const out: Nokta[] = [n[0]];
  let kalan = adim;
  for (let i = 1; i < n.length; i++) {
    let [x0, y0] = n[i - 1];
    const [x1, y1] = n[i];
    let d = Math.hypot(x1 - x0, y1 - y0);
    while (d >= kalan) {
      const t = kalan / d;
      x0 += (x1 - x0) * t;
      y0 += (y1 - y0) * t;
      out.push([x0, y0]);
      d -= kalan;
      kalan = adim;
    }
    kalan -= d;
  }
  const son = n[n.length - 1];
  const o = out[out.length - 1];
  if (Math.hypot(son[0] - o[0], son[1] - o[1]) > adim * 0.3) out.push(son);
  return out;
}

/** Nokta bulutu: noktalar + her noktada çizginin yönü (birim vektör). */
interface Bulut {
  n: Nokta[];
  t: Nokta[];
}

/** Çizgi boyunca yön: ±3 örnek ötesine bakılır (titreme yönü bozmasın). */
function yonler(n: Nokta[], w = 3): Nokta[] {
  return n.map((_, i) => {
    const a = n[Math.max(0, i - w)];
    const b = n[Math.min(n.length - 1, i + w)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const u = Math.hypot(dx, dy) || 1;
    return [dx / u, dy / u];
  });
}

function bulut(cizgiler: Nokta[][], adim: number): Bulut {
  const n: Nokta[] = [];
  const t: Nokta[] = [];
  for (const c of cizgiler) {
    const o = c.length > 1 ? ornekle(c, adim) : c;
    n.push(...o);
    t.push(...(o.length > 1 ? yonler(o) : o.map((): Nokta => [0, 0])));
  }
  return { n, t };
}

/** Yakın nokta araması için ızgara (yalnızca "hucre" mesafesine kadar bakar). */
class Izgara {
  private m = new Map<number, number[]>();
  constructor(private b: Bulut, private hucre: number) {
    b.n.forEach(([x, y], i) => {
      const k = this.anahtar(Math.floor(x / hucre), Math.floor(y / hucre));
      const l = this.m.get(k);
      if (l) l.push(i);
      else this.m.set(k, [i]);
    });
  }
  private anahtar(i: number, j: number) {
    return (i + 512) * 4096 + (j + 512);
  }
  /** En iyi eşleşme puanı (0..1): yakınlık × yön uyumu. */
  eslesme(x: number, y: number, tx: number, ty: number, tol: number): number {
    return this.esle(x, y, tx, ty, tol)[0];
  }
  /** [puan, eşleşen noktanın sırası] */
  esle(x: number, y: number, tx: number, ty: number, tol: number): [number, number] {
    const i0 = Math.floor(x / this.hucre);
    const j0 = Math.floor(y / this.hucre);
    let en = 0;
    let sira = -1;
    for (let i = i0 - 1; i <= i0 + 1; i++)
      for (let j = j0 - 1; j <= j0 + 1; j++) {
        const l = this.m.get(this.anahtar(i, j));
        if (!l) continue;
        for (const k of l) {
          const d = Math.hypot(this.b.n[k][0] - x, this.b.n[k][1] - y);
          const v = yumusak(d, tol);
          if (v <= en) continue;
          const [ux, uy] = this.b.t[k];
          // yön: nokta (tek dokunuş) ya da yönsüz noktada ceza yok
          const c = (ux === 0 && uy === 0) || (tx === 0 && ty === 0) ? 1 : Math.abs(ux * tx + uy * ty);
          const yon = c >= 0.8 ? 1 : c <= 0.35 ? 0 : (c - 0.35) / 0.45;
          if (v * yon > en) {
            en = v * yon;
            sira = k;
          }
        }
      }
    return [en, sira];
  }
}

const YUMUSAK = 1.6;
/** İsabette (çocuğun çizgisi şablona ne kadar yakın) biraz daha sıkı tolerans */
const ISABET_TOL = 0.8;
const yumusak = (d: number, tol: number) => (d <= tol ? 1 : d >= YUMUSAK * tol ? 0 : 1 - (d - tol) / ((YUMUSAK - 1) * tol));

function kutu(n: Nokta[]) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of n) {
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
  }
  return { x0, y0, x1, y1, g: Math.max(0.02, x1 - x0), y: Math.max(0.02, y1 - y0), cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
}

const uygula = (p: Nokta, d: Donusum): Nokta => [p[0] * d.s + d.tx, p[1] * d.s + d.ty];
const tasi = (b: Bulut, d: Donusum): Bulut => ({ n: b.n.map((p) => uygula(p, d)), t: b.t });

interface SablonOrnek extends Bulut {
  parca: string[];
  onemli: Set<string>;
  izgara: Izgara;
}
function sablonOrnekle(r: Resim, adim: number, hucre: number): SablonOrnek {
  const parca: string[] = [];
  for (const c of r.cizgiler) for (let i = 0; i < (c.n.length > 1 ? ornekle(c.n, adim).length : 1); i++) parca.push(c.parca);
  const b = bulut(r.cizgiler.map((c) => c.n), adim);
  const kucuk = new Set(r.kucukParcalar ?? []);
  const onemli = new Set(r.cizgiler.map((c) => c.parca).filter((p) => !kucuk.has(p)));
  return { ...b, parca, onemli, izgara: new Izgara(b, hucre) };
}

/**
 * Kapsama (şablon üzerinden; noktalar ve önemli parçalar yarı yarıya), isabet (çocuk üzerinden)
 * ve parça kapsamaları.
 */
function olc(s: SablonOrnek, cocuk: Bulut, tol: number) {
  const c = new Izgara(cocuk, tol * YUMUSAK);
  const parcaT = new Map<string, [number, number]>();
  let Rn = 0;
  s.n.forEach(([x, y], i) => {
    const v = c.eslesme(x, y, s.t[i][0], s.t[i][1], tol);
    Rn += v;
    const t = parcaT.get(s.parca[i]) ?? [0, 0];
    parcaT.set(s.parca[i], [t[0] + v, t[1] + 1]);
  });
  // İsabet + tekrar: aynı yerin üstünden defalarca dönmek (kıvrım kıvrım karalama) ayrıca sayılır
  let P = 0;
  let tekrar = 0;
  const sonGecis = new Int32Array(s.n.length).fill(-1);
  cocuk.n.forEach(([x, y], i) => {
    const [v, k] = s.izgara.esle(x, y, cocuk.t[i][0], cocuk.t[i][1], tol * ISABET_TOL);
    P += v;
    if (k < 0 || v < 0.5) return;
    if (sonGecis[k] >= 0 && i - sonGecis[k] > 25) tekrar++;
    sonGecis[k] = i;
  });
  Rn /= Math.max(1, s.n.length);
  P /= Math.max(1, cocuk.n.length);
  tekrar /= Math.max(1, cocuk.n.length);
  const parcalar = new Map([...parcaT].map(([k, [a, b]]) => [k, a / b]));
  const onemliler = [...s.onemli].map((p) => parcalar.get(p) ?? 0);
  const Rp = onemliler.length ? onemliler.reduce((a, b) => a + b, 0) / onemliler.length : Rn;
  return { R: 0.5 * Rn + 0.5 * Rp, P, tekrar, parcalar };
}

/**
 * Köşeler: çizgi yönünün birden döndüğü yerler (evin çatısı, yıldızın uçları).
 * Daire çizip "ev" demek böylece ayırt edilir.
 */
function koseler(n: Nokta[], kapali: boolean, esik: number, w = 3): Nokta[] {
  const k: { p: Nokta; a: number }[] = [];
  const N = n.length;
  if (N < 2 * w + 1) return [];
  const al = (i: number) => (kapali ? n[(i + N) % N] : n[Math.max(0, Math.min(N - 1, i))]);
  for (let i = kapali ? 0 : w; i < (kapali ? N : N - w); i++) {
    const a = al(i - w);
    const b = al(i);
    const c = al(i + w);
    const u = [b[0] - a[0], b[1] - a[1]];
    const v = [c[0] - b[0], c[1] - b[1]];
    const cos = (u[0] * v[0] + u[1] * v[1]) / ((Math.hypot(u[0], u[1]) * Math.hypot(v[0], v[1])) || 1);
    const aci = Math.acos(Math.max(-1, Math.min(1, cos))) / R_DERECE;
    if (aci >= esik) k.push({ p: b, a: aci });
  }
  // aynı köşenin komşu adaylarından en keskinini tut
  k.sort((x, y) => y.a - x.a);
  const out: Nokta[] = [];
  for (const { p } of k) if (out.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) > 0.06)) out.push(p);
  return out;
}
const R_DERECE = Math.PI / 180;

function sablonKoseleri(r: Resim): Nokta[] {
  return r.cizgiler.flatMap((c) => {
    const o = ornekle(c.n, 0.01);
    const kapali = !!c.kapali && o.length > 2 && Math.hypot(o[0][0] - o[o.length - 1][0], o[0][1] - o[o.length - 1][1]) < 0.02;
    return koseler(kapali ? o.slice(0, -1) : o, kapali, 55);
  });
}

/** Şablon köşelerinin kaçında çocuğun da köşesi var (köşesiz şablonda null). */
function koseUyumu(r: Resim, cocuk: Nokta[][], d: Donusum, tol: number): number | null {
  const sk = sablonKoseleri(r);
  if (sk.length < 2) return null;
  const ck = cocuk.flatMap((c) => (c.length > 1 ? koseler(ornekle(c, 0.01).map((p) => uygula(p, d)), false, 40, 4) : []));
  const yakin = sk.filter((p) => ck.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < tol * 2.2)).length;
  return yakin / sk.length;
}

const fSkor = (R: number, P: number, b = 1.25) => (R + P === 0 ? 0 : ((1 + b * b) * P * R) / (b * b * P + R));

/** Bakarak/hafızadan çizimi şablonun üstüne oturtur. */
function hizala(r: Resim, cocukCizgiler: Nokta[][], tol: number): Donusum {
  const kaba = sablonOrnekle(r, 0.02, tol * YUMUSAK);
  const kabaCocuk = bulut(cocukCizgiler, 0.02);
  const kc = kutu(kabaCocuk.n);
  const ks = kutu(kaba.n);
  const s0 = Math.max(ks.g, ks.y) / Math.max(kc.g, kc.y);
  let en: Donusum = { s: s0, tx: ks.cx - kc.cx * s0, ty: ks.cy - kc.cy * s0 };
  let enF = -1;
  const dene = (d: Donusum) => {
    const m = olc(kaba, tasi(kabaCocuk, d), tol);
    const f = fSkor(m.R, m.P);
    if (f > enF) {
      enF = f;
      en = d;
    }
  };
  for (const k of [0.86, 0.93, 1, 1.07, 1.15]) {
    const s = s0 * k;
    const tx0 = ks.cx - kc.cx * s;
    const ty0 = ks.cy - kc.cy * s;
    for (const dx of [-0.06, -0.03, 0, 0.03, 0.06]) for (const dy of [-0.06, -0.03, 0, 0.03, 0.06]) dene({ s, tx: tx0 + dx, ty: ty0 + dy });
  }
  // ince ayar
  const b = en;
  for (const k of [0.97, 1, 1.03]) for (const dx of [-0.015, 0, 0.015]) for (const dy of [-0.015, 0, 0.015]) dene({ s: b.s * k, tx: b.tx + dx, ty: b.ty + dy });
  return en;
}

/** Çocuğun çizgilerini en yakın şablon parçasına göre böler (canlanmada her parça ayrı oynar). */
export function parcalaraBol(r: Resim, cizgiler: Nokta[][], d: Donusum): Parcali[] {
  const s = sablonOrnekle(r, 0.01, 10);
  const out: Parcali[] = [];
  const enYakinParca = (p: Nokta) => {
    const q = uygula(p, d);
    let en = Infinity;
    let parca = r.cizgiler[0]?.parca ?? '';
    s.n.forEach(([x, y], i) => {
      const u = Math.hypot(x - q[0], y - q[1]);
      if (u < en) {
        en = u;
        parca = s.parca[i];
      }
    });
    return parca;
  };
  for (const c of cizgiler) {
    const n = c.length > 1 ? ornekle(c, 0.008) : c;
    if (!n.length) continue;
    const etiket = n.map(enYakinParca);
    // kısa (titrek) geçişleri yumuşat
    for (let i = 1; i < n.length - 1; i++) {
      let j = i;
      while (j < n.length && etiket[j] === etiket[i]) j++;
      if (j - i < 4 && etiket[i - 1] !== etiket[i] && (j >= n.length || etiket[j] === etiket[i - 1])) for (let k = i; k < j; k++) etiket[k] = etiket[i - 1];
    }
    let bas = 0;
    for (let i = 1; i <= n.length; i++) {
      if (i === n.length || etiket[i] !== etiket[bas]) {
        // uçlar birleşik kalsın diye sınır noktası iki parçada da var
        out.push({ parca: etiket[bas], n: n.slice(Math.max(0, bas - 1), i) });
        bas = i;
      }
    }
  }
  return out;
}

export function puanla(r: Resim, cizgiler: Nokta[][], mod: Mod, yas: number, ayar: PuanAyar = AYAR): PuanSonuc {
  const tol = ayar.tolerans[mod] * (ayar.yas_carpani[String(yas)] ?? 1);
  const cocukHam = cizgiler.filter((c) => c.length > 0);
  const cocukUzunluk = cocukHam.reduce((t, c) => t + Math.max(uzunluk(c), 0.01), 0);
  const sablonUzunluk = r.cizgiler.reduce((t, c) => t + uzunluk(c.n), 0);
  const bos: PuanSonuc = { puan: 0, yildiz: 0, kapsama: 0, isabet: 0, oran: 0, murekkep: 0, tekrar: 0, eksik: [], parcaKapsama: {}, donusum: { s: 1, tx: 0, ty: 0 }, parcalar: [] };
  if (cocukUzunluk < 0.04) return bos;

  const serbest = mod === 'kopya' || mod === 'hafiza';
  const donusum = serbest ? hizala(r, cocukHam, tol) : { s: 1, tx: 0, ty: 0 };
  const cocuk = bulut(cocukHam, 0.01);
  const s = sablonOrnekle(r, 0.01, tol * YUMUSAK);
  const m = olc(s, tasi(cocuk, donusum), tol);

  let oran = 1;
  if (serbest) {
    const kc = kutu(cocuk.n);
    const ks = kutu(s.n);
    oran = Math.max(0, Math.min(1, 1 - Math.abs(Math.log(kc.g / kc.y / (ks.g / ks.y))) / Math.log(2.2)));
  }
  const murekkep = (cocukUzunluk * donusum.s) / sablonUzunluk;
  // Karalama cezası: şablondan uzak mürekkep, fazla mürekkep ve aynı yerde dönüp durmak
  const fazla = murekkep * (1 - m.P);
  const sinir = serbest ? 1.45 : 1.6;
  const ceza =
    Math.max(0.3, 1 - Math.max(0, fazla - 0.35) * 0.8) *
    (murekkep > sinir ? (sinir / murekkep) ** 1.5 : 1) *
    Math.max(0.4, 1 - Math.max(0, m.tekrar - 0.25) * 1.5);
  const kose = koseUyumu(r, cocukHam, donusum, tol);
  const f = kose === null ? fSkor(m.R, m.P) : 0.75 * fSkor(m.R, m.P) + 0.25 * kose;
  const puan = Math.max(0, Math.min(1, (serbest ? 0.85 * f + 0.15 * oran : f) * ceza));

  const esik = ayar.yildiz[mod];
  let yildiz = (puan >= esik[2] ? 3 : puan >= esik[1] ? 2 : puan >= esik[0] ? 1 : 0) as PuanSonuc['yildiz'];
  // Emek verdiyse en az bir yıldız: okul öncesinde "sıfır" yok
  if (yildiz === 0 && murekkep >= 0.3) yildiz = 1;

  const kucuk = new Set(r.kucukParcalar ?? []);
  const onemli = [...new Set(r.cizgiler.map((c) => c.parca))].filter((p) => !kucuk.has(p));
  let eksik = onemli.filter((p) => (m.parcalar.get(p) ?? 0) < 0.42);
  if (eksik.length >= onemli.length || m.R < 0.25) eksik = [];
  // Önemli bir parça eksikse üçüncü yıldız yok: "Bir şey eksik!" deyip tamamlatırız
  if (eksik.length && yildiz === 3) yildiz = 2;

  return {
    puan,
    yildiz,
    kapsama: m.R,
    isabet: m.P,
    oran,
    murekkep,
    tekrar: m.tekrar,
    eksik,
    parcaKapsama: Object.fromEntries(m.parcalar),
    donusum,
    parcalar: parcalaraBol(r, cocukHam, donusum),
  };
}

/** Nokta birleştirme için bir çizginin noktaları. Küçük kapalı şekiller (göz) tek nokta olur. */
export function noktaDizisi(c: SablonCizgi): Nokta[] {
  const L = uzunluk(c.n);
  if (c.kapali && L < 0.25) {
    const k = kutu(c.n);
    return [[k.cx, k.cy]];
  }
  let n: Nokta[];
  if (c.n.length <= 12) {
    n = [c.n[0]];
    for (let i = 1; i < c.n.length; i++) {
      const [a, b] = [c.n[i - 1], c.n[i]];
      const parca = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.3);
      for (let k = 1; k <= parca; k++) n.push([a[0] + ((b[0] - a[0]) * k) / parca, a[1] + ((b[1] - a[1]) * k) / parca]);
    }
  } else {
    const adet = Math.max(4, Math.min(10, Math.round(L / 0.1)));
    n = ornekle(c.n, L / adet);
  }
  // kapalı şekilde başa dönen son nokta tekrar gösterilmez
  const [a, b] = [n[0], n[n.length - 1]];
  if (n.length > 2 && Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.03) n.pop();
  // en çok 10 nokta (4 yaş ona kadar sayar; sayı seslendirmeleri Bir…On)
  if (n.length > 10) n = Array.from({ length: 10 }, (_, i) => n[Math.round((i * (n.length - 1)) / 9)]);
  return n;
}

/** Yıldızdan sonraki adım: canlanır mı? */
export const canlanirMi = (y: number, ayar: PuanAyar = AYAR) => y >= ayar.canlanma_yildiz;
