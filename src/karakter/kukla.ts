/**
 * Kesme (cut-out) kukla: parça parça çizilmiş karakter (assets/karakter/<ad>/<ad>.json + parça görselleri).
 * İlk kukla: Kino C (kino-yeni), kiti ekip/karakter/kino-yeni/kit-kur.cjs üretir.
 *
 * - Koordinatlar çizimin karesinde (Kino: 1792×2432). Her parça ebeveyninin içinde, kendi dönme noktası çevresinde
 *   döner (a, derece, + saat yönü), kayar (x, y: ebeveyn karesinde) ve ölçeklenir (sx, sy).
 * - Yuvalar (göz, kaş, ağız): aynı yerde değişen çizimler; `secim` hangisinin görüneceğini söyler.
 * - Kümeler (kollar, bacaklar): iki geçişli çizim. Önce kümenin bütün parçaları çizgisiyle, sonra çizgisiz dolgu
 *   katmanları üstüne: eklem yerinde çizgi kalmaz, bükülen dirsek / diz tek parça gibi görünür.
 * - Çizim canvas'a (2D). Ekran ölçeği ve DPR çağıranın işi: ciz(ctx, taban) taban dönüşümünü alır.
 */

export interface KuklaParca {
  resim: string;
  /** görselin karedeki yeri: x, y, genişlik, yükseklik */
  kutu: [number, number, number, number];
  pivot: [number, number];
  ust: string | null;
  /** eklem sınırı (derece) */
  sinir?: [number, number];
  yuva?: string;
  kume?: string;
  dolgu?: string;
}
export type KuklaCizim = string | { yuva: string } | { kume: string; parcalar: string[] };
export interface KuklaIskelet {
  ad: string;
  boyut: [number, number];
  /** ayakların bastığı y (kare koordinatı) */
  zemin: number;
  parcalar: Record<string, KuklaParca>;
  cizim: KuklaCizim[];
  yuvalar: Record<string, { varsayilan: string; secenekler: string[] }>;
  /** kendiliğinden görünmeyenler (yuva seçenekleri, kol kalkınca açılan dikiş çizgileri …) */
  gizli?: string[];
}
/** Bir parçanın yerel hareketi */
export interface Eklem {
  a?: number;
  x?: number;
  y?: number;
  sx?: number;
  sy?: number;
  /** saydamlık 0..1 (iskeletin gizli listesindekiler verilmezse 0) */
  o?: number;
}
export type Poz = Record<string, Eklem>;

/** 2B afin dönüşüm [a b c d e f] (canvas setTransform sırası) */
export type Matris = [number, number, number, number, number, number];
export const birim = (): Matris => [1, 0, 0, 1, 0, 0];
export function carp(m: Matris, n: Matris): Matris {
  return [
    m[0] * n[0] + m[2] * n[1],
    m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3],
    m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4],
    m[1] * n[4] + m[3] * n[5] + m[5],
  ];
}
export const uygula = (m: Matris, p: [number, number]): [number, number] => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
const DERECE = Math.PI / 180;

export class Kukla {
  /** parça adı → yerel hareket (her karede baştan yazılabilir) */
  poz: Poz = {};
  /** yuva → seçili parça */
  secim: Record<string, string> = {};
  /** eklem sınırlarına uy (animasyon taşsa da kırılmasın) */
  sinirla = true;
  private resimler = new Map<string, HTMLImageElement>();
  private dunya = new Map<string, Matris>();

  constructor(
    readonly iskelet: KuklaIskelet,
    /** dosya adı → adres (Vite import.meta.glob ?url) */
    private readonly adres: (dosya: string) => string,
  ) {
    for (const [yuva, y] of Object.entries(iskelet.yuvalar)) this.secim[yuva] = y.varsayilan;
  }

  /** Bütün parça görsellerini yükler (çözülmüş olarak: ilk karede takılmasın) */
  async yukle(): Promise<void> {
    const dosyalar = new Set<string>();
    for (const p of Object.values(this.iskelet.parcalar)) {
      dosyalar.add(p.resim);
      if (p.dolgu) dosyalar.add(p.dolgu);
    }
    await Promise.all(
      [...dosyalar].map(async (d) => {
        const img = new Image();
        img.decoding = 'async';
        img.src = this.adres(d);
        await img.decode();
        this.resimler.set(d, img);
      }),
    );
  }

  /** Parçanın kare koordinatından dünya (kukla kökü) koordinatına dönüşümü; ciz() ya da hesapla() sonrası */
  matris(ad: string): Matris {
    return this.dunya.get(ad) ?? birim();
  }

  /** Bir parçanın dönme noktasının dünya konumu (kulak, kuyruk yayları için) */
  nokta(ad: string, p?: [number, number]): [number, number] {
    return uygula(this.matris(ad), p ?? this.iskelet.parcalar[ad].pivot);
  }

  /** Bütün parçaların dünya dönüşümlerini hesaplar */
  hesapla() {
    this.dunya.clear();
    const pr = this.iskelet.parcalar;
    const hesap = (ad: string): Matris => {
      const var_ = this.dunya.get(ad);
      if (var_) return var_;
      const p = pr[ad];
      const e = this.poz[ad] ?? {};
      let a = e.a ?? 0;
      if (this.sinirla && p.sinir) a = Math.min(p.sinir[1], Math.max(p.sinir[0], a));
      const [px, py] = p.pivot;
      const c = Math.cos(a * DERECE), s = Math.sin(a * DERECE);
      const sx = e.sx ?? 1, sy = e.sy ?? 1;
      // T(p + kayma) · R(a) · S(sx, sy) · T(-p)
      const yerel: Matris = [c * sx, s * sx, -s * sy, c * sy, 0, 0];
      yerel[4] = px + (e.x ?? 0) - (yerel[0] * px + yerel[2] * py);
      yerel[5] = py + (e.y ?? 0) - (yerel[1] * px + yerel[3] * py);
      const m = p.ust ? carp(hesap(p.ust), yerel) : yerel;
      this.dunya.set(ad, m);
      return m;
    };
    for (const ad of Object.keys(pr)) hesap(ad);
  }

  /**
   * Kuklayı çizer. taban: kare koordinatından canvas pikseline dönüşüm (konum, ölçek, DPR).
   * secim (isteğe bağlı): yalnız ya da hariç tutulacak çizim adımları (parça, küme ya da yuva adı). Ör. kucaktaki
   * çocuk için önce kol kümesi hariç beden, sonra çocuk, sonra yalnız kol kümesi (kol çocuğun önünden sarar).
   */
  ciz(ctx: CanvasRenderingContext2D, taban: Matris, secim?: { yalniz?: string[]; haric?: string[] }) {
    if (secim) return this.secerekCiz(ctx, taban, secim);
    this.hesapla();
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    const pr = this.iskelet.parcalar;
    const gizli = new Set(this.iskelet.gizli ?? []);
    const bas = (ad: string, dolgu = false, saydam = 1) => {
      const p = pr[ad];
      const img = this.resimler.get(dolgu ? p.dolgu! : p.resim);
      if (!img || saydam <= 0) return;
      const m = carp(taban, this.matris(ad));
      ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
      ctx.globalAlpha = Math.min(1, saydam);
      ctx.drawImage(img, p.kutu[0], p.kutu[1], p.kutu[2], p.kutu[3]);
      ctx.globalAlpha = 1;
    };
    for (const c of this.iskelet.cizim) {
      if (typeof c === 'string') bas(c, false, this.poz[c]?.o ?? (gizli.has(c) ? 0 : 1));
      else if ('yuva' in c) bas(this.secim[c.yuva] ?? this.iskelet.yuvalar[c.yuva].varsayilan);
      else {
        for (const ad of c.parcalar) bas(ad);
        for (const ad of c.parcalar) bas(ad, true);
      }
    }
    ctx.restore();
  }

  private secerekCiz(ctx: CanvasRenderingContext2D, taban: Matris, secim: { yalniz?: string[]; haric?: string[] }) {
    const ad = (c: KuklaCizim) => (typeof c === 'string' ? c : 'yuva' in c ? c.yuva : c.kume);
    const asil = this.iskelet.cizim;
    const yalniz = secim.yalniz && new Set(secim.yalniz), haric = secim.haric && new Set(secim.haric);
    const sec: KuklaCizim[] = [];
    for (const c of asil) {
      if (typeof c !== 'string' && 'kume' in c) {
        // kümenin içinden parça seçilebilir (ör. yalnız ön kol ve el: kucaktaki çocuğun önünden sarar)
        const tum = (!yalniz || yalniz.has(c.kume)) && !haric?.has(c.kume);
        const parcalar = c.parcalar.filter((p) => (tum || yalniz?.has(p)) && !haric?.has(p));
        if (parcalar.length) sec.push({ kume: c.kume, parcalar });
      } else if ((!yalniz || yalniz.has(ad(c))) && !haric?.has(ad(c))) sec.push(c);
    }
    // geçici çizim sırası (iskelet paylaşılan nesne olabilir: hemen geri konur)
    (this.iskelet as { cizim: KuklaCizim[] }).cizim = sec;
    try {
      this.ciz(ctx, taban);
    } finally {
      (this.iskelet as { cizim: KuklaCizim[] }).cizim = asil;
    }
  }
}

/** Sönümlü yay (kulak, kuyruk, kafa gecikmesi): x hedefe yaylanır; kuvvet dışarıdan itme (ivme) */
export class Yay {
  x = 0;
  v = 0;
  constructor(
    public k = 140,
    public c = 9,
  ) {}
  adim(hedef: number, dt: number, kuvvet = 0): number {
    // yarı örtük Euler, küçük adımlarla kararlı
    const n = Math.max(1, Math.ceil(dt / (1 / 240)));
    const h = dt / n;
    for (let i = 0; i < n; i++) {
      this.v += (this.k * (hedef - this.x) - this.c * this.v + kuvvet) * h;
      this.x += this.v * h;
    }
    return this.x;
  }
}

/** Yumuşak geçişler */
export const yumusak = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
export const aralik = (t: number, a: number, b: number) => yumusak((t - a) / (b - a));
/** a'dan b'ye geçerken hafif taşan (geri yaylanan) yumuşatma */
export function tasan(t: number, tasma = 1.6): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const u = t - 1;
  return 1 + (tasma + 1) * u * u * u + tasma * u * u;
}
