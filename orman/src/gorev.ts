/**
 * Görev altyapısı: her bölgede yaşa göre 3 görev. Görev mikrofon karelerini (kare) ya da
 * dokunmayı (bas/kaydir/birak) alır; bitince bitti() çağırır. Dokunma her zaman çalışır:
 * mikrofonsuz, gürültülü ortamda ya da konuşma güçlüğü olan çocuk için oyun asla kilitlenmez.
 */
import { AlkisSayaci, PerdeIzci, UflemeBulucu, type Ayar, type Ozellik } from '../../ses-testi/src/analiz';
import type { Soylenecek } from '../../src/audio/konusma';
import type { Yas } from '../../src/engine/types';

export interface Baglam {
  yas: Yas;
  /** 0, 1, 2 */
  tur: number;
  /** görev alanı (bölge sahnesinin üstünde, tam boy) */
  sahne: HTMLElement;
  ayar: Ayar;
  /** başlık balonundaki yazı */
  yaz(t: string): void;
  /** karakter konuşur; bu sırada kulak dinlemez */
  soyle(t: Soylenecek): Promise<void>;
  /** çocuğun adı (Hece Mağarası için; büyük yazdıysa) */
  isim: string;
  /** perde referansı (Kuş Ağacı ilk görevde ölçülür) */
  referans: number | null;
}

export interface Nokta {
  x: number;
  y: number;
}

export interface Gorev {
  /** görev başında söylenen ve yazılan yönerge */
  yonerge: string;
  /** balonda yazılacak kısa metin (yoksa yönerge) */
  yazi?: string;
  kare?(o: Ozellik): void;
  /** her animasyon karesinde (sn) */
  tik?(dt: number): void;
  bas?(p: Nokta): void;
  kaydir?(p: Nokta): void;
  birak?(p: Nokta): void;
  /** görev başladı (yönerge söylendi) */
  basla?(): void;
  kapat?(): void;
}

export type GorevFabrika = (b: Baglam, bitti: () => void) => Gorev;

// ---------------------------------------------------------------- girdi uyarlayıcıları (mikrofon + dokunma)

/** Üfleme: mikrofonda gürültü gibi nefes sesi; dokunmada basılı tutmak. */
export class Ufleme {
  guc = 0;
  sure = 0;
  aktif = false;
  private b: UflemeBulucu;
  private dokunma = false;
  onBasla: () => void = () => undefined;
  onBitti: (sure: number) => void = () => undefined;
  /** kolay: sesli üflemeyi ("fuuu") de sayar, eşik daha düşük (küçük yaşlar ve parti bölümü) */
  constructor(ayar: Ayar, private dokunmaGucu = 0.5, kolay = false) {
    this.b = new UflemeBulucu(ayar, kolay);
  }
  kare(o: Ozellik) {
    if (this.dokunma) return;
    const r = this.b.kare(o);
    this.guc = this.b.aktif ? Math.max(0.15, this.b.guc) : this.b.guc * 0.5;
    this.aktif = this.b.aktif;
    this.sure = this.b.sure;
    if (r.basladi) this.onBasla();
    if (r.bitti) this.onBitti(r.bitti);
  }
  bas() {
    this.dokunma = true;
    this.aktif = true;
    this.sure = 0;
    this.guc = this.dokunmaGucu;
    this.onBasla();
  }
  birak() {
    if (!this.dokunma) return;
    this.dokunma = false;
    this.aktif = false;
    this.guc = 0;
    this.onBitti(this.sure);
    this.sure = 0;
  }
  tik(dt: number) {
    if (this.dokunma) this.sure += dt;
  }
}

/** Alkış: mikrofonda ani vuruş; dokunmada her dokunuş. Seri 1.4 sn sessizlikte biter; aralar birbirine göre ölçülür. */
export class Alkis {
  private a: AlkisSayaci;
  private seri: number[] = [];
  onAlkis: (sira: number) => void = () => undefined;
  onSeri: (zamanlar: number[]) => void = () => undefined;
  constructor(ayar: Ayar, private bitisSuresi = 1.4) {
    this.a = new AlkisSayaci(ayar);
  }
  private vur() {
    this.seri.push(performance.now() / 1000);
    this.onAlkis(this.seri.length);
  }
  kare(o: Ozellik) {
    if (this.a.kare(o).alkis) this.vur();
  }
  dokun() {
    this.vur();
  }
  tik() {
    if (this.seri.length && performance.now() / 1000 - this.seri[this.seri.length - 1] > this.bitisSuresi) {
      const s = this.seri;
      this.seri = [];
      this.onSeri(s);
    }
  }
  get sayi() {
    return this.seri.length;
  }
  sifirla() {
    this.seri = [];
  }
}

/** Ses perdesi: mikrofonda çocuğun kendi sesine göre (yarım ton); dokunmada parmağın yüksekliği. */
export class Perde {
  private p: PerdeIzci;
  private dokunma: number | null = null;
  /** yarım ton farkı (+ ince, − kalın); ses yoksa null */
  fark: number | null = null;
  /** ses var mı (perdeli) */
  sesli = false;
  constructor(ayar: Ayar, referans: number | null) {
    this.p = new PerdeIzci(ayar);
    this.p.referans = referans;
  }
  kare(o: Ozellik) {
    if (this.dokunma !== null) return;
    const r = this.p.kare(o);
    this.fark = r.fark;
    this.sesli = r.perde !== null;
  }
  bas(p: Nokta) {
    this.kaydir(p);
  }
  kaydir(p: Nokta) {
    this.dokunma = (0.5 - p.y) * 20;
    this.fark = this.dokunma;
    this.sesli = true;
  }
  birak() {
    this.dokunma = null;
    this.fark = null;
    this.sesli = false;
  }
  get sinif(): 'ince' | 'kalin' | 'orta' | null {
    if (this.fark === null) return null;
    return this.fark > 2.5 ? 'ince' : this.fark < -2.5 ? 'kalin' : 'orta';
  }
}

/** Ses var mı (herhangi bir ses: konuşma, şarkı): taban + eşik üstü */
export const sesVar = (o: Ozellik, a: Ayar, ek = 12) => o.db > a.taban + ek - a.duyarlilik;

/** Görev için sabit seçim (aynı tur hep aynı olsun ama bölgeye göre değişsin) */
export const sec = <T>(dizi: T[], i: number) => dizi[((i % dizi.length) + dizi.length) % dizi.length];
