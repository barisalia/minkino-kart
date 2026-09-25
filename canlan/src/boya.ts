/**
 * Boyama: çocuk kendi çizdiği şeklin içine dokununca o bölge boyanır (kova ile doldurma).
 * - Çocuğun çizgileri kalınlaştırılarak küçük boşluklar kapatılır (titrek elle kapanmamış şekiller taşmasın).
 * - Yine de taşarsa (bölge kenara değerse) o noktadaki şablon parçasının şekli boyanır.
 * - Her boya bir parçaya bağlanır; canlanınca o parçayla birlikte oynar.
 */
import type { Donusum } from './puan';
import type { Nokta, Resim } from './resimler';
import { SUS } from './susler';

export const BOYUT = 360;

export interface Cizgi {
  n: Nokta[];
  kalinlik: number;
}

const ters = (p: Nokta, d: Donusum): Nokta => [(p[0] - d.tx) / d.s, (p[1] - d.ty) / d.s];

/** Çizgileri ızgaraya basar (her nokta bir disk). ek: boşluk kapatmak için eklenen kalınlık (0..1 biriminde). */
export function cizgiMaskesi(cizgiler: Cizgi[], ek: number, N = BOYUT): Uint8Array {
  const m = new Uint8Array(N * N);
  for (const c of cizgiler) {
    const r = Math.max(1, ((c.kalinlik + ek) * N) / 2);
    const damga = (x: number, y: number) => {
      const cx = x * N;
      const cy = y * N;
      const x0 = Math.max(0, Math.floor(cx - r));
      const x1 = Math.min(N - 1, Math.ceil(cx + r));
      const y0 = Math.max(0, Math.floor(cy - r));
      const y1 = Math.min(N - 1, Math.ceil(cy + r));
      for (let j = y0; j <= y1; j++)
        for (let i = x0; i <= x1; i++) if ((i + 0.5 - cx) ** 2 + (j + 0.5 - cy) ** 2 <= r * r) m[j * N + i] = 1;
    };
    const n = c.n;
    if (n.length === 1) damga(n[0][0], n[0][1]);
    for (let k = 1; k < n.length; k++) {
      const [a, b] = [n[k - 1], n[k]];
      const adim = Math.max(1, Math.ceil((Math.hypot(b[0] - a[0], b[1] - a[1]) * N) / Math.max(1, r * 0.5)));
      for (let t = 0; t <= adim; t++) damga(a[0] + ((b[0] - a[0]) * t) / adim, a[1] + ((b[1] - a[1]) * t) / adim);
    }
  }
  return m;
}

export interface Bolge {
  maske: Uint8Array;
  alan: number;
  kenaraDegdi: boolean;
}

/** Kova ile doldurma (4 komşu). */
export function tasir(engel: Uint8Array, x: number, y: number, N = BOYUT): Bolge | null {
  const i0 = Math.floor(x * N);
  const j0 = Math.floor(y * N);
  if (i0 < 0 || j0 < 0 || i0 >= N || j0 >= N || engel[j0 * N + i0]) return null;
  const maske = new Uint8Array(N * N);
  const kuyruk = new Int32Array(N * N);
  let bas = 0;
  let son = 0;
  kuyruk[son++] = j0 * N + i0;
  maske[j0 * N + i0] = 1;
  let kenaraDegdi = false;
  while (bas < son) {
    const k = kuyruk[bas++];
    const i = k % N;
    const j = (k - i) / N;
    if (i === 0 || j === 0 || i === N - 1 || j === N - 1) kenaraDegdi = true;
    const komsu = [i > 0 ? k - 1 : -1, i < N - 1 ? k + 1 : -1, j > 0 ? k - N : -1, j < N - 1 ? k + N : -1];
    for (const q of komsu)
      if (q >= 0 && !maske[q] && !engel[q]) {
        maske[q] = 1;
        kuyruk[son++] = q;
      }
  }
  return { maske, alan: son / (N * N), kenaraDegdi };
}

/** Bölgeyi r piksel büyütür (boya, kalınlaştırılmış çizginin altına kadar uzansın). */
export function genislet(m: Uint8Array, r: number, N = BOYUT): Uint8Array {
  const yatay = new Uint8Array(N * N);
  for (let j = 0; j < N; j++) {
    let son = -Infinity;
    for (let i = 0; i < N; i++) {
      if (m[j * N + i]) son = i;
      if (i - son <= r) yatay[j * N + i] = 1;
    }
    son = Infinity;
    for (let i = N - 1; i >= 0; i--) {
      if (m[j * N + i]) son = i;
      if (son - i <= r) yatay[j * N + i] = 1;
    }
  }
  const out = new Uint8Array(N * N);
  for (let i = 0; i < N; i++) {
    let son = -Infinity;
    for (let j = 0; j < N; j++) {
      if (yatay[j * N + i]) son = j;
      if (j - son <= r) out[j * N + i] = 1;
    }
    son = Infinity;
    for (let j = N - 1; j >= 0; j--) {
      if (yatay[j * N + i]) son = j;
      if (son - j <= r) out[j * N + i] = 1;
    }
  }
  return out;
}

export function noktaIcinde(p: Nokta, poli: Nokta[]): boolean {
  let ic = false;
  for (let i = 0, j = poli.length - 1; i < poli.length; j = i++) {
    const [xi, yi] = poli[i];
    const [xj, yj] = poli[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) ic = !ic;
  }
  return ic;
}

export function poligonMaskesi(poli: Nokta[], N = BOYUT): Uint8Array {
  const m = new Uint8Array(N * N);
  let y0 = 1, y1 = 0, x0 = 1, x1 = 0;
  for (const [x, y] of poli) {
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  for (let j = Math.max(0, Math.floor(y0 * N)); j <= Math.min(N - 1, Math.ceil(y1 * N)); j++)
    for (let i = Math.max(0, Math.floor(x0 * N)); i <= Math.min(N - 1, Math.ceil(x1 * N)); i++)
      if (noktaIcinde([(i + 0.5) / N, (j + 0.5) / N], poli)) m[j * N + i] = 1;
  return m;
}

/** Bir parçanın boyanabilir alanları (şablon koordinatında). */
export function parcaAlanlari(r: Resim, parca: string): Nokta[][] {
  const ozel = SUS[r.id]?.alanlar?.[parca];
  if (ozel) return ozel;
  return r.cizgiler.filter((c) => c.parca === parca && c.kapali).map((c) => c.n);
}

/** Bütün boyanabilir alanlar: [parça, çokgen] (şablon koordinatında). */
export function tumAlanlar(r: Resim): [string, Nokta[]][] {
  const adlar = [...new Set(r.cizgiler.map((c) => c.parca))];
  return adlar.flatMap((p) => parcaAlanlari(r, p).map((a): [string, Nokta[]] => [p, a]));
}

function agirlikMerkezi(poli: Nokta[]): Nokta {
  let x = 0, y = 0;
  for (const p of poli) {
    x += p[0];
    y += p[1];
  }
  return [x / poli.length, y / poli.length];
}

export interface Boya {
  parca: string;
  renk: string;
  maske: Uint8Array;
}

/**
 * Dokunulan noktadaki bölgeyi bulur. Taşan bölgede şablon parçasına düşer; boşlukta (dışarıda) null.
 * p: çocuğun çizim koordinatında (0..1).
 */
export function boyaBolgesi(r: Resim, cizgiler: Cizgi[], d: Donusum, p: Nokta, N = BOYUT): { parca: string; maske: Uint8Array } | null {
  const ek = 0.03;
  const engel = cizgiMaskesi(cizgiler, ek, N);
  // çizginin tam üstüne dokunduysa yakındaki boş noktayı ara
  let q = p;
  const bosMu = (a: Nokta) => {
    const i = Math.floor(a[0] * N);
    const j = Math.floor(a[1] * N);
    return i >= 0 && j >= 0 && i < N && j < N && !engel[j * N + i];
  };
  if (!bosMu(q)) {
    let bulundu: Nokta | null = null;
    for (let rr = 1; rr <= 14 && !bulundu; rr++)
      for (let a = 0; a < 16 && !bulundu; a++) {
        const c: Nokta = [p[0] + (Math.cos((a / 16) * Math.PI * 2) * rr) / N, p[1] + (Math.sin((a / 16) * Math.PI * 2) * rr) / N];
        if (bosMu(c)) bulundu = c;
      }
    if (!bulundu) return null;
    q = bulundu;
  }
  // hangi parçanın içinde? (şablon koordinatına çevirip bak)
  const sp: Nokta = [q[0] * d.s + d.tx, q[1] * d.s + d.ty];
  const alanlar = tumAlanlar(r);
  // iç içe alanlarda (duvarın içindeki kapı) en küçüğü
  const icindeki = alanlar.filter(([, a]) => noktaIcinde(sp, a)).sort((x, y) => alanBuyuklugu(x[1]) - alanBuyuklugu(y[1]));
  const b = tasir(engel, q[0], q[1], N);
  const genislik = Math.round((ek / 2) * N + 1);
  if (b && !b.kenaraDegdi && b.alan < 0.6) {
    const parca = icindeki[0]?.[0] ?? enYakinParca(alanlar, b.maske, d, N) ?? r.cizgiler[0].parca;
    return { parca, maske: genislet(b.maske, genislik, N) };
  }
  // taştı: şablon şeklini boya (en küçük içeren alan)
  if (!icindeki.length) return null;
  const [parca, alan] = icindeki[0];
  return { parca, maske: poligonMaskesi(alan.map((n) => ters(n, d)), N) };
}

function alanBuyuklugu(a: Nokta[]) {
  let s = 0;
  for (let i = 0, j = a.length - 1; i < a.length; j = i++) s += (a[j][0] + a[i][0]) * (a[j][1] - a[i][1]);
  return Math.abs(s / 2);
}

function enYakinParca(alanlar: [string, Nokta[]][], m: Uint8Array, d: Donusum, N: number): string | null {
  let x = 0, y = 0, n = 0;
  for (let k = 0; k < m.length; k += 3)
    if (m[k]) {
      x += (k % N) + 0.5;
      y += Math.floor(k / N) + 0.5;
      n++;
    }
  if (!n || !alanlar.length) return null;
  const sp: Nokta = [(x / n / N) * d.s + d.tx, (y / n / N) * d.s + d.ty];
  let en = Infinity;
  let parca: string | null = null;
  for (const [p, a] of alanlar) {
    const c = agirlikMerkezi(a);
    const u = Math.hypot(c[0] - sp[0], c[1] - sp[1]);
    if (u < en) {
      en = u;
      parca = p;
    }
  }
  return parca;
}

/** Sihirli boya: her parçayı önerilen renge boyar (çizgilerle bölünmüş alanın bütün parçalarını). */
export function sihirliBoya(r: Resim, cizgiler: Cizgi[], d: Donusum, N = BOYUT): Boya[] {
  const renkler = SUS[r.id]?.boya ?? {};
  const out: Boya[] = [];
  const engel = cizgiMaskesi(cizgiler, 0.03, N);
  for (const [parca, alan] of tumAlanlar(r)) {
    const renk = renkler[parca];
    if (!renk) continue;
    const ilk = boyaBolgesi(r, cizgiler, d, ters(icNokta(alan), d), N);
    if (!ilk) continue;
    const maske = ilk.maske;
    // alanın içinde kalan ama boyanmamış başka bölmeler (topun şeridin altı gibi) varsa onları da doldur
    let x0 = 1, y0 = 1, x1 = 0, y1 = 0;
    for (const [x, y] of alan) {
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
    for (let i = 1; i < 9; i++)
      for (let j = 1; j < 9; j++) {
        const sp: Nokta = [x0 + ((x1 - x0) * i) / 9, y0 + ((y1 - y0) * j) / 9];
        if (!noktaIcinde(sp, alan)) continue;
        const q = ters(sp, d);
        const k = Math.floor(q[1] * N) * N + Math.floor(q[0] * N);
        if (k < 0 || k >= maske.length || maske[k] || engel[k]) continue;
        const b = tasir(engel, q[0], q[1], N);
        if (!b || b.kenaraDegdi || b.alan > 0.6) continue;
        const g = genislet(b.maske, Math.round(0.015 * N + 1), N);
        for (let m = 0; m < maske.length; m++) if (g[m]) maske[m] = 1;
      }
    out.push({ parca, renk, maske });
  }
  return out;
}

/** Çokgenin içinde kalan, kenarlardan uzak bir nokta (ağırlık merkezi dışarıdaysa en iyi aday). */
export function icNokta(a: Nokta[]): Nokta {
  const c = agirlikMerkezi(a);
  if (noktaIcinde(c, a)) return c;
  let en: Nokta = a[0];
  let enU = -1;
  let x0 = 1, y0 = 1, x1 = 0, y1 = 0;
  for (const [x, y] of a) {
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  for (let i = 1; i < 12; i++)
    for (let j = 1; j < 12; j++) {
      const p: Nokta = [x0 + ((x1 - x0) * i) / 12, y0 + ((y1 - y0) * j) / 12];
      if (!noktaIcinde(p, a)) continue;
      const u = Math.min(...a.map((q) => Math.hypot(q[0] - p[0], q[1] - p[1])));
      if (u > enU) {
        enU = u;
        en = p;
      }
    }
  return en;
}

/** Boyaları parlak, yumuşak gölgeli bir resme çevirir (tarayıcıda). */
export function boyaResmi(boyalar: Boya[], N = BOYUT): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = N;
  const x = c.getContext('2d')!;
  for (const b of boyalar) {
    const k = document.createElement('canvas');
    k.width = k.height = N;
    const kx = k.getContext('2d')!;
    const img = kx.createImageData(N, N);
    const [r, g, bl] = hex(b.renk);
    let x0 = N, y0 = N, x1 = 0, y1 = 0;
    for (let i = 0; i < b.maske.length; i++)
      if (b.maske[i]) {
        img.data[i * 4] = r;
        img.data[i * 4 + 1] = g;
        img.data[i * 4 + 2] = bl;
        img.data[i * 4 + 3] = 255;
        const px = i % N;
        const py = (i - px) / N;
        x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py);
      }
    kx.putImageData(img, 0, 0);
    // parlak çizgi film görünümü: sol üstte ışık, alt kenarda gölge
    kx.globalCompositeOperation = 'source-atop';
    const w = Math.max(4, x1 - x0);
    const hh = Math.max(4, y1 - y0);
    const isik = kx.createRadialGradient(x0 + w * 0.32, y0 + hh * 0.28, 0, x0 + w * 0.32, y0 + hh * 0.28, Math.max(w, hh) * 0.6);
    isik.addColorStop(0, 'rgba(255,255,255,0.45)');
    isik.addColorStop(1, 'rgba(255,255,255,0)');
    kx.fillStyle = isik;
    kx.fillRect(0, 0, N, N);
    const golge = kx.createLinearGradient(0, y0 + hh * 0.55, 0, y1);
    golge.addColorStop(0, 'rgba(60,20,0,0)');
    golge.addColorStop(1, 'rgba(60,20,0,0.18)');
    kx.fillStyle = golge;
    kx.fillRect(0, 0, N, N);
    x.drawImage(k, 0, 0);
  }
  return c;
}

function hex(h: string): [number, number, number] {
  const v = parseInt(h.replace('#', ''), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}
