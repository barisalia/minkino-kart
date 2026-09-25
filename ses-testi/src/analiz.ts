/**
 * Uyuyan Orman — ses analizi (kelime tanıma yok, sesin ŞEKLİ):
 * yükseklik (dB), gürültü benzerliği (düzlük), kalın ses oranı, perde (YIN), ani vuruşlar.
 * Hepsi saf fonksiyon/durum makinesi: birim testleriyle yapay seslerle denenir.
 */

// ---------------------------------------------------------------- kare özellikleri
export interface Ozellik {
  /** dBFS (0 = en yüksek) */
  db: number;
  /** spektral düzlük 0..1 (1: gürültü/üfleme, 0: saf ton) */
  duzluk: number;
  /** 400 Hz altındaki enerjinin oranı (üflemede yüksek) */
  kalinOran: number;
  /** spektral ağırlık merkezi (Hz) */
  merkez: number;
  /** perde (Hz) — ses yoksa null */
  perde: number | null;
  /** perde güveni 0..1 */
  perdeGuven: number;
  /** 256 örneklik alt pencerelerin dB değerleri (alkış için) */
  altDb: number[];
}

const dB = (e: number) => 10 * Math.log10(Math.max(1e-12, e));

/** Yerinde radix-2 FFT (re, im uzunluğu 2'nin kuvveti) */
export function fft(re: Float64Array, im: Float64Array) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const a = (-2 * Math.PI) / len;
    const wr = Math.cos(a);
    const wi = Math.sin(a);
    for (let i = 0; i < n; i += len) {
      let cr = 1;
      let ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ur = re[i + k];
        const ui = im[i + k];
        const vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci;
        const vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
        re[i + k] = ur + vr;
        im[i + k] = ui + vi;
        re[i + k + len / 2] = ur - vr;
        im[i + k + len / 2] = ui - vi;
        const t = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = t;
      }
    }
  }
}

/**
 * YIN perde bulma (küçültülmüş örnekle): 75–1000 Hz.
 * Dönüş: [perde Hz | null, güven 0..1]
 */
export function perdeBul(x: Float32Array | number[], sr: number, enAz = 75, enCok = 1000): [number | null, number] {
  // 2 kat küçült (perde için 24 kHz yeter)
  const k = sr > 30000 ? 2 : 1;
  const n = Math.floor(x.length / k);
  const y = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let t = 0;
    for (let j = 0; j < k; j++) t += x[i * k + j];
    y[i] = t / k;
  }
  const r = sr / k;
  const tMin = Math.floor(r / enCok);
  const tMax = Math.min(Math.floor(r / enAz), Math.floor(n / 2));
  const W = n - tMax;
  if (W < 64 || tMax <= tMin + 2) return [null, 0];
  const d = new Float64Array(tMax + 1);
  for (let t = 1; t <= tMax; t++) {
    let s = 0;
    for (let i = 0; i < W; i++) {
      const f = y[i] - y[i + t];
      s += f * f;
    }
    d[t] = s;
  }
  // birikimli ortalamaya göre normalleştir
  const cmnd = new Float64Array(tMax + 1);
  cmnd[0] = 1;
  let top = 0;
  for (let t = 1; t <= tMax; t++) {
    top += d[t];
    cmnd[t] = top > 0 ? (d[t] * t) / top : 1;
  }
  const ESIK = 0.2;
  let tau = -1;
  for (let t = tMin; t <= tMax; t++) {
    if (cmnd[t] < ESIK) {
      while (t + 1 <= tMax && cmnd[t + 1] < cmnd[t]) t++;
      tau = t;
      break;
    }
  }
  if (tau < 0) {
    // eşik altı yok: en küçüğü al ama güven düşük
    let en = tMin;
    for (let t = tMin; t <= tMax; t++) if (cmnd[t] < cmnd[en]) en = t;
    tau = en;
  }
  const guven = Math.max(0, Math.min(1, 1 - cmnd[tau]));
  if (guven < 0.6) return [null, guven];
  // parabolik ince ayar
  const a = cmnd[tau - 1] ?? cmnd[tau];
  const b = cmnd[tau];
  const c = cmnd[tau + 1] ?? cmnd[tau];
  const payda = a - 2 * b + c;
  const ince = payda !== 0 ? tau + (a - c) / (2 * payda) : tau;
  return [r / ince, guven];
}

let pencere: Float64Array | null = null;
/** Bir karenin özellikleri. x: son 2048 örnek (ya da daha kısa), sr: örnekleme hızı */
export function ozellikCikar(x: Float32Array, sr: number): Ozellik {
  const N = 1024;
  const son = x.subarray(Math.max(0, x.length - N));
  let e = 0;
  for (const v of son) e += v * v;
  const db = dB(e / son.length);
  const altDb: number[] = [];
  for (let i = 0; i + 256 <= son.length; i += 256) {
    let s = 0;
    for (let j = i; j < i + 256; j++) s += son[j] * son[j];
    altDb.push(dB(s / 256));
  }
  // spektrum
  if (!pencere || pencere.length !== N) pencere = Float64Array.from({ length: N }, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1)));
  const re = new Float64Array(N);
  const im = new Float64Array(N);
  for (let i = 0; i < son.length; i++) re[i] = son[i] * pencere[i];
  fft(re, im);
  let logTop = 0;
  let top = 0;
  let agirlik = 0;
  let kalin = 0;
  const bin = sr / N;
  const ilk = Math.max(1, Math.round(60 / bin));
  const sonB = Math.min(N / 2, Math.round(8000 / bin));
  for (let k = ilk; k < sonB; k++) {
    const g = re[k] * re[k] + im[k] * im[k] + 1e-14;
    logTop += Math.log(g);
    top += g;
    agirlik += g * k * bin;
    if (k * bin < 400) kalin += g;
  }
  const m = sonB - ilk;
  const duzluk = Math.exp(logTop / m) / (top / m);
  const [perde, perdeGuven] = db > -60 ? perdeBul(x, sr) : [null, 0];
  return { db, duzluk, kalinOran: kalin / top, merkez: agirlik / top, perde, perdeGuven, altDb };
}

// ---------------------------------------------------------------- ortam ölçümü
export class OrtamOlcer {
  private dbler: number[] = [];
  ekle(o: Ozellik) {
    this.dbler.push(o.db);
  }
  get hazir() {
    return this.dbler.length >= 10;
  }
  /** Ortam gürültüsü (medyan dB) */
  get taban(): number {
    if (!this.dbler.length) return -70;
    const s = [...this.dbler].sort((a, b) => a - b);
    return Math.max(-90, s[Math.floor(s.length / 2)]);
  }
}

/** Duyarlılık: pozitif = daha hassas (eşikleri düşürür), dB cinsinden */
export interface Ayar {
  taban: number;
  duyarlilik: number;
  /** kare süresi (sn) */
  kare: number;
}

// ---------------------------------------------------------------- 1. Üfleme
/** Üfleme: sesli (perdeli) değil, gürültü gibi, kalın ağırlıklı ve süren bir ses. */
export class UflemeBulucu {
  private art = 0;
  private bos = 0;
  /** şu anki üfleme gücü 0..1 */
  guc = 0;
  /** bu üflemenin süresi (sn) */
  sure = 0;
  aktif = false;
  toplamUfleme = 0;
  constructor(private a: Ayar) {}
  kare(o: Ozellik): { basladi?: boolean; bitti?: number } {
    const esik = this.a.taban + 14 - this.a.duyarlilik;
    const ufleme = o.db > esik && o.perde === null && (o.kalinOran > 0.28 || o.db > esik + 16) && o.duzluk > 0.025;
    const sonuc: { basladi?: boolean; bitti?: number } = {};
    if (ufleme) {
      this.art++;
      this.bos = 0;
      this.guc = Math.max(0, Math.min(1, (o.db - esik) / 25));
      if (!this.aktif && this.art >= 4) {
        this.aktif = true;
        this.sure = this.art * this.a.kare;
        sonuc.basladi = true;
      } else if (this.aktif) this.sure += this.a.kare;
    } else {
      this.bos++;
      this.guc *= 0.8;
      if (this.bos >= 4) {
        if (this.aktif) {
          sonuc.bitti = this.sure;
          this.toplamUfleme++;
        }
        this.aktif = false;
        this.art = 0;
        this.sure = 0;
      }
    }
    return sonuc;
  }
}

// ---------------------------------------------------------------- 2. İnce / kalın
export const yarimTon = (f: number, ref: number) => 12 * Math.log2(f / ref);

/** Çocuğun kendi "normal" sesine göre ince/kalın. Referans yoksa 280 Hz. */
export class PerdeIzci {
  referans: number | null = null;
  private olcumler: number[] = [];
  /** yumuşatılmış son perde */
  perde: number | null = null;
  constructor(private a: Ayar) {}
  kare(o: Ozellik): { perde: number | null; fark: number | null; sinif: 'ince' | 'kalin' | 'orta' | null } {
    const sesli = o.perde !== null && o.db > this.a.taban + 10 - this.a.duyarlilik;
    if (!sesli) {
      this.perde = null;
      return { perde: null, fark: null, sinif: null };
    }
    this.perde = this.perde ? this.perde * 0.6 + o.perde! * 0.4 : o.perde!;
    const ref = this.referans ?? 280;
    const fark = yarimTon(this.perde, ref);
    return { perde: this.perde, fark, sinif: fark > 3 ? 'ince' : fark < -3 ? 'kalin' : 'orta' };
  }
  /** Referans kaydı: "aaa" derken çağrılır */
  referansEkle(o: Ozellik) {
    if (o.perde !== null && o.db > this.a.taban + 10) this.olcumler.push(o.perde);
  }
  referansBitir(): number | null {
    if (this.olcumler.length < 5) return null;
    const s = [...this.olcumler].sort((a, b) => a - b);
    this.referans = s[Math.floor(s.length / 2)];
    this.olcumler = [];
    return this.referans;
  }
}

// ---------------------------------------------------------------- 3. Alkış
/** Alkış: çok ani yükselen, kısa, gürültü gibi vuruş. Aralar birbirine göre (uzun/kısa) değerlendirilir. */
export class AlkisSayaci {
  private gecmis: number[] = [];
  private sonVurus = -1;
  /** onay bekleyen vuruş: alkış hızla söner; sönmezse (konuşma, müzik) alkış değildir */
  private aday: { t: number; tepe: number } | null = null;
  zaman = 0;
  vuruslar: number[] = [];
  constructor(private a: Ayar) {}
  /** Dönüş: bu karede alkış onaylandı mı; seri bitti mi (1.5 sn sessizlik) */
  kare(o: Ozellik): { alkis: boolean; seriBitti?: number[] } {
    let alkis = false;
    const esik = this.a.taban + 18 - this.a.duyarlilik;
    const alt = this.a.kare / o.altDb.length;
    o.altDb.forEach((d, i) => {
      const t = this.zaman + i * alt;
      if (this.aday) {
        this.aday.tepe = Math.max(this.aday.tepe, t - this.aday.t < 0.03 ? d : this.aday.tepe);
        if (d < this.aday.tepe - 10) {
          // söndü: alkış
          this.vuruslar.push(this.aday.t);
          this.sonVurus = this.aday.t;
          alkis = true;
          this.aday = null;
        } else if (t - this.aday.t > 0.16) this.aday = null; // sürüyor: alkış değil
      } else {
        const onceki = this.gecmis.length ? this.gecmis.slice(-4).reduce((x, y) => x + y, 0) / Math.min(4, this.gecmis.length) : this.a.taban;
        if (d > esik && d - onceki > 9 && t - this.sonVurus > 0.13) this.aday = { t, tepe: d };
      }
      this.gecmis.push(d);
      if (this.gecmis.length > 16) this.gecmis.shift();
    });
    this.zaman += this.a.kare;
    const sonuc: { alkis: boolean; seriBitti?: number[] } = { alkis };
    if (this.vuruslar.length && !this.aday && this.zaman - this.vuruslar[this.vuruslar.length - 1] > 1.5) {
      sonuc.seriBitti = this.vuruslar;
      this.vuruslar = [];
    }
    return sonuc;
  }
}

/** Vuruş aralarını uzun/kısa olarak adlandırır (en kısa araya göre, tempodan bağımsız). */
export function ritimKalibi(vuruslar: number[]): ('uzun' | 'kisa')[] {
  if (vuruslar.length < 2) return [];
  const aralar = vuruslar.slice(1).map((t, i) => t - vuruslar[i]);
  const enKisa = Math.min(...aralar);
  return aralar.map((a) => (a > enKisa * 1.6 ? 'uzun' : 'kisa'));
}

/** İki ritmi karşılaştırır: vuruş sayısı aynı ve uzun/kısa kalıbı tutuyor mu */
export function ritimAyniMi(hedef: number[], cocuk: number[]): boolean {
  if (hedef.length !== cocuk.length) return false;
  const a = ritimKalibi(hedef);
  const b = ritimKalibi(cocuk);
  return a.every((x, i) => x === b[i]);
}

// ---------------------------------------------------------------- 4. Ses şekli
export interface SesParcasi {
  bas: number;
  sure: number;
  /** perde eğrisi (Hz, sesli karelerde) */
  perdeler: number[];
  enYuksekDb: number;
}
export type Egri = 'yukselen' | 'alcalan' | 'yukselip-alcalan' | 'duz' | 'bilinmiyor';

/** Sesleri parçalara böler: 150 ms'den kısa boşluklar birleşir, 0.9 sn sessizlikte dizi biter. */
export class SesSekli {
  private simdiki: SesParcasi | null = null;
  private bosluk = 0;
  private parcalar: SesParcasi[] = [];
  zaman = 0;
  constructor(private a: Ayar) {}
  kare(o: Ozellik): { dizi?: SesParcasi[]; sesVar: boolean } {
    const ses = o.db > this.a.taban + 12 - this.a.duyarlilik;
    const sonuc: { dizi?: SesParcasi[]; sesVar: boolean } = { sesVar: ses };
    if (ses) {
      if (!this.simdiki) this.simdiki = { bas: this.zaman, sure: 0, perdeler: [], enYuksekDb: o.db };
      this.simdiki.sure = this.zaman + this.a.kare - this.simdiki.bas;
      this.simdiki.enYuksekDb = Math.max(this.simdiki.enYuksekDb, o.db);
      if (o.perde !== null) this.simdiki.perdeler.push(o.perde);
      this.bosluk = 0;
    } else if (this.simdiki) {
      this.bosluk += this.a.kare;
      if (this.bosluk > 0.15) {
        if (this.simdiki.sure >= 0.08) this.parcalar.push(this.simdiki);
        this.simdiki = null;
      }
    } else if (this.parcalar.length) {
      this.bosluk += this.a.kare;
      if (this.bosluk > 0.9) {
        sonuc.dizi = this.parcalar;
        this.parcalar = [];
        this.bosluk = 0;
      }
    }
    this.zaman += this.a.kare;
    return sonuc;
  }
}

/** Perde eğrisinin şekli (yarım ton cinsinden) */
export function egri(perdeler: number[]): Egri {
  if (perdeler.length < 4) return 'bilinmiyor';
  const ref = perdeler[0];
  const y = perdeler.map((p) => yarimTon(p, ref));
  const ucte = Math.max(1, Math.floor(y.length / 3));
  const ort = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
  const bas = ort(y.slice(0, ucte));
  const orta = ort(y.slice(ucte, y.length - ucte));
  const son = ort(y.slice(-ucte));
  const enYuksek = Math.max(...y);
  if (enYuksek - bas > 2 && enYuksek - son > 2 && orta > bas + 1 && orta > son + 1) return 'yukselip-alcalan';
  if (son - bas > 2) return 'yukselen';
  if (bas - son > 2) return 'alcalan';
  return 'duz';
}

/** Hayvan sesi kalıpları: "hav hav" iki kısa, "möö" bir uzun kalın, "miyav" yükselip alçalan */
export function hayvanSesi(dizi: SesParcasi[], referans: number | null): { hayvan: 'kopek' | 'inek' | 'kedi' | null; aciklama: string } {
  const kisa = dizi.filter((p) => p.sure < 0.45).length;
  const uzun = dizi.length - kisa;
  const tarif = dizi.map((p) => `${p.sure < 0.45 ? 'kısa' : 'uzun'} (${Math.round(p.sure * 1000)} ms, ${egriAdi(egri(p.perdeler))})`).join(' + ');
  if (dizi.length >= 2 && dizi.length <= 3 && uzun === 0) return { hayvan: 'kopek', aciklama: `${dizi.length} kısa ses → köpek (hav hav): ${tarif}` };
  if (dizi.length === 1) {
    const p = dizi[0];
    const e = egri(p.perdeler);
    if (p.sure >= 0.5 && (e === 'yukselip-alcalan' || e === 'yukselen')) return { hayvan: 'kedi', aciklama: `uzun, yükselip alçalan → kedi (miyav): ${tarif}` };
    const ort = p.perdeler.length ? p.perdeler.reduce((a, b) => a + b, 0) / p.perdeler.length : null;
    const kalin = ort !== null && ort < (referans ?? 280) * 0.95;
    if (p.sure >= 0.6 && (kalin || e === 'duz' || e === 'alcalan')) return { hayvan: 'inek', aciklama: `bir uzun${kalin ? ', kalın' : ''} ses → inek (möö): ${tarif}` };
  }
  return { hayvan: null, aciklama: `tanınmadı: ${tarif || 'ses yok'}` };
}

export const egriAdi = (e: Egri) =>
  ({ yukselen: 'yükselen', alcalan: 'alçalan', 'yukselip-alcalan': 'yükselip alçalan', duz: 'düz', bilinmiyor: 'perde yok' })[e];

// ---------------------------------------------------------------- 5. Sessizlik ve ses seviyesi
export type Seviye = 'sessiz' | 'fisilti' | 'konusma' | 'bagirma';
export function seviye(o: Ozellik, a: Ayar): Seviye {
  const ust = o.db - a.taban + a.duyarlilik;
  if (ust < 8) return 'sessiz';
  if (ust > 36) return 'bagirma';
  // fısıltı: perdesiz, tiz ağırlıklı
  if (o.perde === null && o.merkez > 1500 && ust < 26) return 'fisilti';
  return 'konusma';
}

/** "N saniye sessiz kal": gürültü olunca sayaç sıfırlanır (kısa çıtırtılar affedilir). */
export class SessizlikSayaci {
  gecen = 0;
  private gurultu = 0;
  constructor(private a: Ayar) {}
  kare(o: Ozellik): { gecen: number; bozuldu: boolean } {
    const s = seviye(o, this.a);
    let bozuldu = false;
    if (s === 'sessiz' || s === 'fisilti' && o.db - this.a.taban < 12) {
      this.gecen += this.a.kare;
      this.gurultu = 0;
    } else {
      this.gurultu += this.a.kare;
      if (this.gurultu > 0.12) {
        bozuldu = this.gecen > 0.5;
        this.gecen = 0;
      }
    }
    return { gecen: this.gecen, bozuldu };
  }
}

// ---------------------------------------------------------------- Türkçe heceleme (Hece Mağarası için)
const UNLU = 'aeıioöuüâîû';
/** Türkçe kelimeyi hecelerine böler (her hecede bir ünlü; ünlüden önceki tek ünsüz sonraki heceye geçer). */
export function hecele(kelime: string): string[] {
  const k = kelime.toLocaleLowerCase('tr').replace(/[^a-zçğıöşüâîû]/g, '');
  const unlu = [...k].map((c) => UNLU.includes(c));
  const yerler = unlu.flatMap((u, i) => (u ? [i] : []));
  if (yerler.length <= 1) return k ? [k] : [];
  const heceler: string[] = [];
  let bas = 0;
  for (let n = 0; n < yerler.length - 1; n++) {
    const a = yerler[n];
    const b = yerler[n + 1];
    const arada = b - a - 1; // iki ünlü arasındaki ünsüz sayısı
    const kes = arada === 0 ? b : b - 1; // bir ünsüz sonraki heceye geçer
    heceler.push(k.slice(bas, kes));
    bas = kes;
  }
  heceler.push(k.slice(bas));
  return heceler;
}
