// Sahne motorunun saf kısmı: adımlar, akış ve çizilmiş yürüyüşün yer değiştirmesi. Bütün "Zıpzıp'ın Dizi" sahneleri
// bu motorla yürür (ekip/senaryo/MINIK-DOKTOR-ZIPZIP-CEKIM-LISTESI.md). DOM yok; birim testleri buradan sınar.
import type { Dizi } from '../once-kuzu/diziler';

export type Bitis<O extends string = string> =
  | { tur: 'sure'; ms: number }
  /** kayıt bitince, üstüne ek ms */
  | { tur: 'ses'; ek?: number }
  /** çocuğun eylemi */
  | { tur: 'cocuk'; olay: O };

/** Akışın bir adımdan bildiği en az şey. */
export interface AdimTemel<O extends string = string> {
  ad: string;
  ses?: { ad: string; gecikme?: number };
  bitis: Bitis<O>;
  /** adım bitince sıradaki yerine bu ada gidilir (dallanan sahnelerde) */
  sonra?: string;
}

/** Akış motoru: zamanı ilerletir, adım değişimlerini bildirir. Çocuğun eylemini bekleyen adım yalnız o olayla geçer. */
export class AkisMotoru<A extends AdimTemel<O>, O extends string = string> {
  private i = 0;
  private gecenMs = 0;
  private basladi = false;
  private durdu = false;
  constructor(private readonly adimlar: readonly A[], private readonly kayitMs: (ad: string) => number) {}

  get adim(): A | null { return this.durdu ? null : this.adimlar[this.i] ?? null; }
  get sira(): number { return this.i; }
  /** adımın başından beri geçen süre (ms) */
  get gecen(): number { return this.gecenMs; }
  get bitti(): boolean { return this.durdu || this.i >= this.adimlar.length; }

  /** adımın, çocuk beklemiyorsa, ne kadar sürdüğü (ms); çocuk bekliyorsa Infinity */
  adimSuresi(a: A): number {
    if (a.bitis.tur === 'sure') return a.bitis.ms;
    if (a.bitis.tur === 'ses') return (a.ses?.gecikme ?? 0) + (a.ses ? this.kayitMs(a.ses.ad) : 0) + (a.bitis.ek ?? 0);
    return Infinity;
  }
  private sonraki(a: A) {
    if (a.sonra === undefined) { this.i++; return; }
    if (a.sonra === 'son') { this.durdu = true; return; }
    const j = this.adimlar.findIndex(x => x.ad === a.sonra);
    if (j < 0) throw new Error('adım yok: ' + a.sonra);
    this.i = j;
  }

  /** dt ms ilerletir; bu çağrıda girilen adımları sırayla döndürür (ilk çağrıda ilk adım da girilmiş sayılır). */
  ilerlet(dt: number): A[] {
    const girilen: A[] = [];
    if (!this.basladi) { this.basladi = true; const a = this.adim; if (a) girilen.push(a); }
    let kalan = Math.max(0, dt);
    for (let guvenlik = 0; !this.bitti && guvenlik < 1000; guvenlik++) {
      const a = this.adimlar[this.i];
      const sure = this.adimSuresi(a);
      if (this.gecenMs + kalan < sure) { this.gecenMs += kalan; break; }
      kalan -= sure - this.gecenMs;
      this.sonraki(a);
      this.gecenMs = 0;
      const yeni = this.adim;
      if (yeni) girilen.push(yeni);
    }
    return girilen;
  }

  /** Çocuğun eylemi: bekleyen adım o olayı bekliyorsa geçer ve girilen adım döner; değilse null (yok sayılır).
   *  hedef verilirse sıradaki yerine o ada gidilir (çocuğun seçimine göre dallanma). */
  olay(o: O, hedef?: string): A | null {
    const a = this.adim;
    if (!a || a.bitis.tur !== 'cocuk' || a.bitis.olay !== o) return null;
    if (hedef !== undefined) {
      const j = this.adimlar.findIndex(x => x.ad === hedef);
      if (j < 0) throw new Error('adım yok: ' + hedef);
      this.i = j;
    } else this.sonraki(a);
    this.gecenMs = 0;
    this.basladi = true;
    return this.adim;
  }
}

// ——— sahnelerin ortak adım biçimi (once-kuzu kendi daha dar türlerini kullanır)

/** Çizilmiş yürüyüş: dizi yerinde döner, katman ilerler. Ayağın yerde olduğu pozlarda katman kaymaz (ayak kaymasın);
 *  havadaki pozlarda ilerler. Ölçüler çizim pikseli. Katman, yürüyüşün BİTECEĞİ yerde durur; kayma oraya göre verilir. */
export interface Yuru {
  /** bir döngüde gidilen yol (px) */
  adim: number;
  /** dizide ayağın yerde olmadığı karelerin indeksleri */
  hava: readonly number[];
  /** kaç döngü */
  tekrar: number;
  /** ilerleme yönü: -1 sola, 1 sağa */
  yon: 1 | -1;
}

export type Gorunum =
  | { dizi: string; yuru?: Yuru }
  | { poz: string; kirp?: string; kirpAnlari?: readonly number[] }
  /** ağzı görünmeden konuşurken: ses varken ilk, sessizken ikinci poz */
  | { kulak: readonly [string, string] }
  /** katman görünmez */
  | { yok: true };

export interface Konusma {
  kim: 'kino' | 'zipzip';
  ad: string;
  gecikme?: number;
  /** dudakla oynatılacak ağız dizisinin adı; null: ağız görünmüyor ya da tepki sesi */
  agiz: string | null;
  agizBas?: number;
  /** sessizlikte ağız: 0 kapalı (endişeli), 5 kapalı gülümseme */
  dinlenme?: 0 | 5;
}

export interface Adim<O extends string = string> extends AdimTemel<O> {
  plan: string;
  /** katman adı → görünüm; verilmeyen katman önceki adımdaki gibi kalır */
  katman?: Readonly<Record<string, Gorunum>>;
  ses?: Konusma;
  efekt?: readonly { ad: string; gecikme?: number; kazanc?: number }[];
}

const toplam = (a: readonly number[]) => a.reduce((x, y) => x + y, 0);
/** Yürüyüşün süresi (ms): döngü sayısı × döngü süresi. */
export const yuruSuresi = (d: Dizi, y: Yuru): number => toplam(d.sureler) * y.tekrar;
/** Yürüyüş başladıktan t ms sonra gidilen yol (px, 0 … adim × tekrar). Yalnız havadaki pozlarda artar. */
export function yuruYolu(d: Dizi, y: Yuru, t: number): number {
  const dongu = toplam(d.sureler);
  if (dongu <= 0) return 0;
  const tt = Math.max(0, Math.min(t, dongu * y.tekrar));
  const tam = Math.min(y.tekrar, Math.floor(tt / dongu));
  if (tam >= y.tekrar) return y.adim * y.tekrar;
  const havaToplam = toplam(y.hava.map(i => d.sureler[i] ?? 0));
  let kalan = tt - tam * dongu, hava = 0;
  for (let i = 0; i < d.sureler.length && kalan > 0; i++) {
    const s = Math.min(kalan, d.sureler[i]);
    if (y.hava.includes(i)) hava += s;
    kalan -= s;
  }
  return y.adim * (tam + (havaToplam > 0 ? hava / havaToplam : 0));
}
/** Katmanın o andaki kayması (px): yürüyüş bitince 0 (katman varış yerinde durur). */
export const yuruKaymasi = (d: Dizi, y: Yuru, t: number): number => -y.yon * (y.adim * y.tekrar - yuruYolu(d, y, t));

/** Bir görünümün kullanabileceği bütün çizimler. */
export function gorunumCizimleri(g: Gorunum | undefined, diziKareleri: (ad: string) => readonly string[]): string[] {
  if (!g || 'yok' in g) return [];
  if ('dizi' in g) return [...diziKareleri(g.dizi)];
  if ('kulak' in g) return [...g.kulak];
  return g.kirp ? [g.poz, g.kirp] : [g.poz];
}

/** Çocuğun eylemleri ve dallar dışında, adımların sırayla süresi (ms). */
export const yazilanSure = <A extends AdimTemel>(adimlar: readonly A[], kayitMs: (ad: string) => number): number =>
  adimlar.reduce((t, a) => {
    if (a.bitis.tur === 'sure') return t + a.bitis.ms;
    if (a.bitis.tur === 'ses') return t + (a.ses?.gecikme ?? 0) + (a.ses ? kayitMs(a.ses.ad) : 0) + (a.bitis.ek ?? 0);
    return t;
  }, 0);
