/**
 * Bölüm dosyasındaki komutlardan oyuncunun bir karedeki duruşu (film/src/oyunlu/aktor.ts → Durus). Kuklalar yalnız
 * önden çizildi (yandan görünüş Adobe'den gelecek): yürüyüş yana kayan, ayakları sırayla kalkan önden yürüyüştür;
 * oturma kalçanın inip bacakların kısalmasıdır. Her şey zamanın saf fonksiyonu (aynı t → aynı duruş); kulak, kuyruk
 * ve el yayları aktor.adim()'da kare kare eklenir.
 *
 * Komut türleri (bicim.ts → OYUNCU_OLAY):
 * - yer değiştirme: yuru / kos {x, y?, sure}, kay {x?, y?, sure} (adımsız kayma), yer {x?, y?} (anında; görünmezken)
 * - durumlar (bir sonrakine kadar sürer, gecis sn'de geçer): otur {derinlik 0..1} / kalk, don {aci}, bak {yon},
 *   ifade {gozler, kaslar, agiz}, kulak {durum}, kuyruk {durum}, goster {yalniz?, haric?} / gizle, z {deger}
 * - hareketler (sure boyunca, yumuşak girer çıkar): el-salla {taraf}, el-uzat {taraf, aci}, zipla {yukseklik},
 *   saril {hedef}, hickir, gul, egil {aci}, poz {alanlar: {kolSag: 40, …}}
 */
import { aralik, kirp, kolKaldir, nefes, tasan, yeniDurus, type Durus } from '../oyunlu/aktor';
import { yuruyusPozu } from '../kukla-hareket';
import type { Olay, Oyuncu } from './bicim';

export interface Komut {
  t0: number;
  t1: number;
  yap: string;
  o: Olay;
}
export interface KitBilgi {
  /** ayak ortası (kit karesi) */
  ayak: [number, number];
  /** kalça dönme noktası */
  kalca: [number, number];
}
/** Konuşma ve bakış bilgisi (sahne verir) */
export interface Cevre {
  /** konuşurken ağız ve güç (ses zarfı ya da hece ritmi) */
  agiz(kim: string, t: number): { agiz: string; guc: number } | null;
  /** şu an konuşan (anlatıcı hariç) */
  konusan(t: number): string | null;
  /** oyuncunun ayak noktası */
  konum(kim: string, t: number): { x: number; y: number } | null;
  /** konuşanın o replikteki yüzü */
  replikIfade(kim: string, t: number): { gozler?: string; kaslar?: string; agiz?: string } | null;
}
export interface Kare {
  d: Durus;
  /** ayak noktası (dünya), zıplamada yükselme dahil değil */
  x: number;
  y: number;
  /** zıplama yüksekliği (kit birimi, yukarı -) */
  havaY: number;
  /** oturma derinliği 0..1 (bacaklar kısaltılarak katlanır) */
  otur: number;
  don: number;
  z: number;
  gorunur: boolean;
  yalniz?: string[];
  haric?: string[];
}

const kenet = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const pur = (n: number) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const sayi = (v: unknown, varsayilan: number) => (typeof v === 'number' ? v : varsayilan);

const YER_KOMUT = new Set(['yuru', 'kos', 'kay', 'yer']);
/** komutun varsayılan süresi (sure verilmezse) */
const SURE: Record<string, number> = { 'el-salla': 1.8, 'el-uzat': 1.4, zipla: 0.75, saril: 2.4, hickir: 0.45, gul: 1.2, egil: 1.2, poz: 1.5 };

export class OyuncuHareket {
  private yerler: Komut[];
  private eylemler: Komut[];
  private durumlar: Map<string, Komut[]>;
  readonly tohum: number;

  constructor(
    readonly ad: string,
    readonly tanim: Oyuncu,
    komutlar: Komut[],
    readonly kit: KitBilgi,
  ) {
    const sirali = [...komutlar].sort((a, b) => a.t0 - b.t0);
    this.yerler = sirali.filter((k) => YER_KOMUT.has(k.yap));
    this.eylemler = sirali.filter((k) => SURE[k.yap] !== undefined);
    this.durumlar = new Map();
    for (const k of sirali) {
      if (YER_KOMUT.has(k.yap) || SURE[k.yap] !== undefined) continue;
      const tur = k.yap === 'kalk' ? 'otur' : k.yap === 'gizle' ? 'goster' : k.yap;
      const l = this.durumlar.get(tur) ?? [];
      l.push(k);
      this.durumlar.set(tur, l);
    }
    this.tohum = [...ad].reduce((s, c) => s + c.charCodeAt(0), 0) % 97;
  }

  /** komutun bitişi: sure verilmişse ona göre */
  static bitis(yap: string, o: Olay, t0: number): number {
    const s = typeof o.sure === 'number' ? o.sure : SURE[yap] ?? 0;
    return t0 + s;
  }

  /** ayak noktası (dünya) */
  konum(t: number): { x: number; y: number } {
    let x = this.tanim.x, y = this.tanim.y;
    for (const k of this.yerler) {
      if (t < k.t0) break;
      const hx = sayi(k.o.x, x), hy = sayi(k.o.y, y);
      if (k.yap === 'yer' || t >= k.t1) {
        x = hx;
        y = hy;
        continue;
      }
      const u = (t - k.t0) / Math.max(1e-6, k.t1 - k.t0);
      const e = k.yap === 'kay' ? u * u * (3 - 2 * u) : yolEgrisi(u);
      return { x: x + (hx - x) * e, y: y + (hy - y) * e };
    }
    return { x, y };
  }

  /** durum geçişi: [önceki komut, şimdiki komut, karışım 0..1] */
  private durum(tur: string, t: number): [Komut | null, Komut | null, number] {
    const l = this.durumlar.get(tur);
    if (!l) return [null, null, 1];
    let i = -1;
    for (let k = 0; k < l.length && l[k].t0 <= t; k++) i = k;
    if (i < 0) return [null, null, 1];
    const g = sayi(l[i].o.gecis, tur === 'otur' ? 0.7 : tur === 'don' ? 0.8 : 0.35);
    return [i > 0 ? l[i - 1] : null, l[i], g <= 0 ? 1 : aralik(t, l[i].t0, l[i].t0 + g)];
  }

  kare(t: number, c: Cevre): Kare {
    const d = yeniDurus();
    const tohum = this.tohum;
    const p = this.konum(t);
    let havaY = 0;
    let otur = 0;
    // ---- canlılık: nefes, ağırlık aktarma, kafa salınımı
    nefes(d, t, 0.27 + (tohum % 7) * 0.01, (tohum % 10) / 10);
    d.kalcaX += 5 * Math.sin(2 * Math.PI * (0.09 * t + tohum * 0.13));
    d.kalcaA += 0.6 * Math.sin(2 * Math.PI * (0.09 * t + tohum * 0.13));
    d.kafaA += 1.4 * Math.sin(2 * Math.PI * (0.065 * t + tohum * 0.31));
    // kulak seğirmesi: 5-9 sn'de bir, tek kulak
    {
      let a = 2 + pur(tohum) * 3;
      for (let i = 0; a < t + 0.5 && i < 400; i++) {
        const x = t - a;
        if (x >= 0 && x < 0.35) {
          const g = Math.sin((Math.PI * x) / 0.35);
          if (pur(tohum + i) < 0.5) d.kulakSag -= 9 * g;
          else d.kulakSol += 9 * g;
        }
        a += 5 + 4 * pur(tohum * 3 + i);
      }
    }
    // ---- oturma (kalça iner, bacaklar kısalır, ayaklar dışa ve kameraya)
    {
      const [o, s, u] = this.durum('otur', t);
      const der = (k: Komut | null) => (!k || k.yap === 'kalk' ? 0 : sayi(k.o.derinlik, 1));
      const k = der(o) + (der(s) - der(o)) * u;
      if (k > 0) {
        // önden oturuş: kalça yere iner, uyluk kameraya doğru kısalır (bacaklar öne uzanmış), ayaklar büyür ve açılır
        const bacak = this.kit.ayak[1] - this.kit.kalca[1];
        d.kalcaY += 0.72 * bacak * k;
        d.ayakSag = { x: -0.2 * bacak * k, y: 0, olcek: 1 + 0.22 * k, egim: -12 * k };
        d.ayakSol = { x: 0.2 * bacak * k, y: 0, olcek: 1 + 0.22 * k, egim: 12 * k };
        d.kolSag += 8 * k;
        d.kolSol -= 8 * k;
        otur = k;
      }
    }
    // ---- dönme (yatma: -80)
    let don = this.tanim.don ?? 0;
    {
      const [o, s, u] = this.durum('don', t);
      if (s) don = sayi(o?.o.aci, don) + (sayi(s.o.aci, 0) - sayi(o?.o.aci, don)) * tasan(u, 0.6);
    }
    // ---- yürüyüş / koşu
    for (const k of this.yerler) {
      if ((k.yap !== 'yuru' && k.yap !== 'kos') || t < k.t0 || t >= k.t1) continue;
      const bas = this.konumAn(k.t0), hx = sayi(k.o.x, bas.x);
      const kos = k.yap === 'kos';
      const o = this.tanim.o ?? 0.275;
      const bacak = (this.kit.ayak[1] - this.kit.kalca[1]) * o;
      const adim = Math.max(2, Math.round(Math.abs(hx - bas.x) / (bacak * (kos ? 1.3 : 0.9))));
      const ilerleme = yolEgrisi((t - k.t0) / (k.t1 - k.t0));
      const u = ilerleme * adim;
      const genlik = kenet(Math.min(u / 0.6, (adim - u) / 0.6));
      const w = yuruyusPozu(u, [(hx - bas.x) / adim / o / 2.2, 0], genlik);
      d.ayakSag = w.ayak.sag;
      d.ayakSol = w.ayak.sol;
      d.kalcaY += w.kalcaY * (kos ? 1.2 : 0.7);
      d.kalcaA += w.kalcaA;
      d.kalcaX += w.kalcaX;
      d.govdeA -= w.kalcaA * 0.8 - Math.sign(hx - bas.x) * (kos ? 5 : 2) * genlik;
      d.kafaA -= w.kalcaA * 0.5;
      d.kolSag += (kos ? -26 : -12) * w.kolSalla;
      d.kolSol += (kos ? -26 : -12) * w.kolSalla;
      if (kos) {
        d.dirsekSag -= 55 * genlik;
        d.dirsekSol += 55 * genlik;
        havaY -= 60 * w.kalk * genlik;
      }
      d.gozler = hx < bas.x ? 'gozler-sola' : 'gozler-saga';
    }
    // ---- bakış
    const yon = this.bakYonu(t, c, p);
    if (yon === 'sol' || yon === 'sag') {
      d.gozler = yon === 'sol' ? 'gozler-sola' : 'gozler-saga';
      d.kafaA += yon === 'sol' ? -3 : 3;
    } else if (yon === 'yukari') {
      d.kafaY -= 10;
      d.kafaA += 0;
    } else if (yon === 'asagi') {
      d.kafaY += 14;
      d.gozler = 'gozler-yari';
    }
    // ---- kulak ve kuyruk durumları
    this.karisim('kulak', t, (k, g) => kulakUygula(d, (k?.o.durum as string) ?? 'normal', g));
    let kuyrukVar = false;
    this.karisim('kuyruk', t, (k, g) => {
      kuyrukVar = true;
      kuyrukUygula(d, (k?.o.durum as string) ?? 'normal', g, t);
    });
    if (!kuyrukVar) kuyrukUygula(d, 'normal', 1, t);
    // ---- ifade (bir sonrakine kadar)
    {
      const [, s] = this.durum('ifade', t);
      if (s) {
        if (s.o.gozler) d.gozler = s.o.gozler as string;
        if (s.o.kaslar) d.kaslar = s.o.kaslar as string;
        if (s.o.agiz) d.agiz = s.o.agiz as string;
      }
    }
    // ---- hareketler
    for (const k of this.eylemler) {
      if (t < k.t0 || t > k.t1) continue;
      const gir = sayi(k.o.gir, Math.min(0.35, (k.t1 - k.t0) / 3)), cik = sayi(k.o.cik, Math.min(0.4, (k.t1 - k.t0) / 3));
      const w = aralik(t, k.t0, k.t0 + gir) * (1 - aralik(t, k.t1 - cik, k.t1));
      const u = (t - k.t0) / Math.max(1e-6, k.t1 - k.t0);
      havaY += this.eylem(d, k, w, u, t, c, p);
    }
    // ---- konuşma
    const r = c.replikIfade(this.ad, t);
    if (r) {
      if (r.gozler) d.gozler = r.gozler;
      if (r.kaslar) d.kaslar = r.kaslar;
    }
    const a = c.agiz(this.ad, t);
    if (a) {
      d.agiz = a.agiz;
      d.kafaY += -9 * a.guc;
      d.kafaA += 1.5 * Math.sin(t * 7 + tohum) * a.guc;
    }
    kirp(d, t, tohum + 1);
    // ---- görünürlük ve çizim sırası
    let gorunur = this.tanim.gorunur ?? true, yalniz = this.tanim.yalniz, haric = this.tanim.haric;
    {
      const [, s] = this.durum('goster', t);
      if (s) {
        gorunur = s.yap === 'goster';
        yalniz = (s.o.yalniz as string[] | undefined) ?? undefined;
        haric = (s.o.haric as string[] | undefined) ?? undefined;
      }
    }
    let z = this.tanim.z ?? 10;
    {
      const [, s] = this.durum('z', t);
      if (s) z = sayi(s.o.deger, z);
    }
    return { d, x: p.x, y: p.y, havaY, otur, don, z, gorunur, yalniz, haric };
  }

  private konumAn(t: number) {
    return this.konum(t - 1e-6);
  }

  private bakYonu(t: number, c: Cevre, p: { x: number }): string {
    const [, s] = this.durum('bak', t);
    let yon = (s?.o.yon as string) ?? 'otomatik';
    if (yon === 'otomatik') {
      const k = c.konusan(t);
      yon = k && k !== this.ad ? k : 'on';
    }
    if (yon !== 'sol' && yon !== 'sag' && yon !== 'on' && yon !== 'yukari' && yon !== 'asagi') {
      const q = c.konum(yon, t);
      if (!q) return 'on';
      return Math.abs(q.x - p.x) < 40 ? 'on' : q.x < p.x ? 'sol' : 'sag';
    }
    return yon;
  }

  /** kategorik durumun yumuşak geçişi: önceki (1-u) ve şimdiki (u) ağırlıkla uygulanır */
  private karisim(tur: string, t: number, uygula: (k: Komut | null, g: number) => void) {
    const [o, s, u] = this.durum(tur, t);
    if (!s) return;
    if (u < 1) uygula(o, 1 - u);
    uygula(s, u);
  }

  /** tek hareketin katkısı; dönüş: zıplama yüksekliği (kit birimi) */
  private eylem(d: Durus, k: Komut, w: number, u: number, t: number, c: Cevre, p: { x: number; y: number }): number {
    const o = k.o;
    const taraf = (o.taraf as 'sag' | 'sol') ?? 'sol';
    switch (k.yap) {
      case 'el-salla': {
        const dalga = Math.sin(2 * Math.PI * 2.3 * (t - k.t0));
        const s = taraf === 'sag' ? 1 : -1;
        const kalk = tasan(w, 1.3);
        if (taraf === 'sag') {
          d.kolSag += 105 * kalk;
          d.dirsekSag += (48 + 26 * dalga) * kalk;
          d.elSag += 10 * dalga * kalk;
        } else {
          d.kolSol -= 105 * kalk;
          d.dirsekSol -= (48 + 26 * dalga) * kalk;
          d.elSol -= 10 * dalga * kalk;
        }
        d.kafaA += 4 * s * kalk;
        d.govdeA += 2 * s * kalk;
        if (d.gozler === 'gozler-acik') d.gozler = 'gozler-mutlu';
        return 0;
      }
      case 'el-uzat':
        kolKaldir(d, taraf, tasan(w, 1.2), sayi(o.aci, 75), sayi(o.dirsek, 10));
        return 0;
      case 'zipla': {
        const yuk = sayi(o.yukseklik, 1);
        const comel = u < 0.2 ? Math.sin((Math.PI * u) / 0.4) : u > 0.82 ? Math.sin((Math.PI * (u - 0.82)) / 0.36) : 0;
        d.kalcaY += 50 * comel;
        d.govdeSy -= 0.04 * comel;
        const hava = u > 0.2 && u < 0.82 ? Math.sin((Math.PI * (u - 0.2)) / 0.62) : 0;
        kolKaldir(d, 'sag', hava, 140, 20);
        kolKaldir(d, 'sol', hava, 140, 20);
        d.ayakSag = { x: -20 * hava, y: -60 * hava, egim: -8 * hava };
        d.ayakSol = { x: 20 * hava, y: -60 * hava, egim: 8 * hava };
        if (hava > 0.1) d.gozler = 'gozler-mutlu';
        return -320 * yuk * hava;
      }
      case 'saril': {
        const hedef = c.konum((o.hedef as string) ?? '', t);
        const yon = hedef ? Math.sign(hedef.x - p.x) || 1 : 1;
        // iki kol öne ve içe (sag kolda eksi içe): önden sarılma
        d.kolSag -= 22 * w;
        d.kolSol += 22 * w;
        d.dirsekSag -= 85 * w;
        d.dirsekSol += 85 * w;
        d.govdeA += 5 * yon * w;
        d.kafaA += 7 * yon * w;
        if (w > 0.5) {
          d.gozler = 'gozler-mutlu';
          d.agiz = 'agiz-gulumse';
        }
        return 0;
      }
      case 'hickir': {
        const g = Math.sin(Math.PI * Math.min(1, u * 1.4)) * w;
        d.kafaY -= 16 * g;
        d.govdeSy -= 0.025 * g;
        d.kolSag += 6 * g;
        d.kolSol -= 6 * g;
        d.kaslar = 'kaslar-uzgun';
        return -12 * g;
      }
      case 'gul': {
        d.agiz = 'agiz-kahkaha';
        d.gozler = 'gozler-mutlu';
        d.kalcaY -= 10 * Math.abs(Math.sin(t * 12)) * w;
        d.kafaA += 4 * Math.sin(t * 9) * w;
        return 0;
      }
      case 'egil':
        d.govdeA += sayi(o.aci, 8) * w;
        d.kafaA += sayi(o.aci, 8) * 0.6 * w;
        return 0;
      case 'poz': {
        const alanlar = (o.alanlar ?? {}) as Record<string, number>;
        const dd = d as unknown as Record<string, unknown>;
        for (const [a, v] of Object.entries(alanlar)) if (typeof dd[a] === 'number' && typeof v === 'number') dd[a] = (dd[a] as number) + v * w;
        return 0;
      }
    }
    return 0;
  }
}

/** yürüyüş yolu: yumuşak kalkış ve duruş, ortası sabit hız */
function yolEgrisi(u: number): number {
  u = kenet(u);
  const r = 0.18;
  // hız profili: 0→1 rampa (r), sabit, 1→0 rampa (r); alan normalize
  const alan = 1 - r;
  if (u < r) return (u * u) / (2 * r) / alan;
  if (u > 1 - r) return (1 - r - ((1 - u) * (1 - u)) / (2 * r)) / alan;
  return (u - r / 2) / alan;
}

function kulakUygula(d: Durus, durum: string, g: number) {
  switch (durum) {
    case 'kalk':
      d.kulakSag -= 16 * g;
      d.kulakSol += 16 * g;
      break;
    case 'in':
      d.kulakSag += 18 * g;
      d.kulakSol -= 18 * g;
      break;
    case 'yayil':
      d.kulakSag += 26 * g;
      d.kulakSol -= 26 * g;
      break;
    case 'sag-kalk':
      d.kulakSag -= 20 * g;
      d.kulakSol -= 10 * g;
      break;
    case 'sol-kalk':
      d.kulakSol += 20 * g;
      d.kulakSag += 10 * g;
      break;
  }
}
function kuyrukUygula(d: Durus, durum: string, g: number, t: number) {
  switch (durum) {
    case 'dik':
      d.kuyruk += (-26 + 5 * Math.sin(2 * Math.PI * 2.2 * t)) * g;
      break;
    case 'salla':
      d.kuyruk += 20 * Math.sin(2 * Math.PI * 2.4 * t) * g;
      break;
    case 'dusuk':
      d.kuyruk += (24 + 4 * Math.sin(2 * Math.PI * 0.35 * t)) * g;
      break;
    default:
      d.kuyruk += 6 * Math.sin(2 * Math.PI * 0.45 * t) * g;
  }
}
