/**
 * Dudak senkronu: konuşma sesinden ağız şekli (saf mantık; DOM / Web Audio yok, birim testleri buradan sınar).
 *
 * Ölçüm her ~20 ms'lik pencerede iki sayı: ses yüksekliği (RMS) ve kaba parlaklık (etkin frekans, Hz: dalganın
 * ardışık farklarının enerjisi / kendi enerjisi; tek bir sinüste tam o sinüsün frekansı). Oyunda AnalyserNode'un
 * pencereleri, filmin MP4 kaydında çözülmüş ses dosyası aynı hesapla ölçülür (src/audio/dudak.ts).
 *
 * Şekil: sessiz → kapali; parlak (s, ş, ç, i: > ~1700 Hz) → dis; koyu (o, u, ü, m: < ~550 Hz) → yuvarlak;
 * yoksa yüksekliğe göre az / orta. Titremesin diye bir şekil en az 70 ms kalır; ses ~0.26 sn susunca ağız
 * gülümsemeye (karakterin dinlenme ağzı) döner. Yükseklik o konuşmanın tepesine göre (kısık / yüksek kayıt fark etmez).
 */
export type AgizSekli = 'kapali' | 'az' | 'orta' | 'yuvarlak' | 'dis' | 'gulumse';
/** Adobe'nin çizeceği gizli katmanlar: agiz-kapali, agiz-az, agiz-orta, agiz-yuvarlak, agiz-dis, agiz-gulumse */
export const AGIZ_SEKILLERI: readonly AgizSekli[] = ['kapali', 'az', 'orta', 'yuvarlak', 'dis', 'gulumse'];

/** Ağzın ne kadar açık olduğu (0..1): tek parça açılan ağızlar (gaga, yandan Mino) için */
export const AGIZ_ACIKLIK: Record<AgizSekli, number> = { kapali: 0, az: 0.35, orta: 0.9, yuvarlak: 0.7, dis: 0.3, gulumse: 0 };

export interface Olcum {
  /** ses yüksekliği (RMS, 0..1) */
  rms: number;
  /** parlaklık: etkin frekans (Hz) */
  frekans: number;
}

/** Bir pencerenin ölçümü (x: örnekler, [bas, son) aralığı) */
export function olcumHesapla(x: ArrayLike<number>, ornekHizi: number, bas = 0, son = x.length): Olcum {
  const n = son - bas;
  if (n < 2) return { rms: 0, frekans: 0 };
  let e = 0;
  let d = 0;
  let onceki = x[bas];
  for (let i = bas; i < son; i++) {
    const v = x[i];
    e += v * v;
    const f = v - onceki;
    d += f * f;
    onceki = v;
  }
  const oran = e > 1e-12 ? d / e : 0;
  return { rms: Math.sqrt(e / n), frekans: (ornekHizi / Math.PI) * Math.asin(Math.min(1, Math.sqrt(oran) / 2)) };
}

/** Eşikler (ElevenLabs kayıtlarında ölçüldü: konuşma RMS'si ~0.1-0.5, a/e ~700-1500 Hz, u/m ~200-500, s/ş 4000+) */
export const DUDAK = {
  /** bu RMS'nin altı sessizlik */
  sessiz: 0.018,
  /** tepenin bu oranının altı da sessizlik (nefes, yankı) */
  goreceSessiz: 0.1,
  /** tepeye göre: altı "az", üstü "orta" açık */
  az: 0.45,
  /** bu frekansın üstü dişler (s, ş, ç, z, i) */
  disHz: 1700,
  /** bu frekansın altı yuvarlak (o, u, ö, ü) … */
  yuvarlakHz: 550,
  /** … ses yeterince güçlüyse (kısık uğultu "az" kalır) */
  yuvarlakEnAz: 0.3,
  /** bir şekil en az bu kadar kalır (ms) */
  enAzMs: 70,
  /** bu kadar sessizlikten sonra ağız gülümsemeye döner (ms) */
  gulumseMs: 260,
  /** konuşmanın tepe yüksekliği: başlangıç, en az, yarılanma süresi (ms) */
  tepeIlk: 0.3,
  tepeEnAz: 0.12,
  tepeYarilanmaMs: 2500,
  /** yumuşatma zaman sabitleri (ms): ses yükselirken, alçalırken, parlaklık */
  yukselMs: 12,
  alcalMs: 35,
  frekansMs: 20,
};
export type DudakAyar = typeof DUDAK;

/** Tek bir ölçümün şekli (en kısa süre / gülümseme yok) */
export function hamSekil(rms: number, frekans: number, tepe: number, a: DudakAyar = DUDAK): Exclude<AgizSekli, 'gulumse'> {
  if (rms < a.sessiz || rms < tepe * a.goreceSessiz) return 'kapali';
  const g = rms / Math.max(tepe, 1e-6);
  if (frekans >= a.disHz) return 'dis';
  if (frekans <= a.yuvarlakHz && g >= a.yuvarlakEnAz) return 'yuvarlak';
  return g < a.az ? 'az' : 'orta';
}

/**
 * Ölçüm akışından ağız şekli: yumuşatma, en kısa süre, sessizlikte gülümseme. Hem canlı (her karede bir ölçüm)
 * hem çevrimdışı (ses dosyasının zarfı, sabit adımla) aynı sınıfla çalışır.
 */
export class DudakIzleyici {
  sekil: AgizSekli = 'gulumse';
  private sekilBas = -Infinity;
  private sessizBas: number | null = null;
  private tepe: number;
  private duz = 0;
  private duzF = 0;
  private sonMs: number | null = null;

  constructor(private readonly a: DudakAyar = DUDAK) {
    this.tepe = a.tepeIlk;
  }

  /** o: bu anın ölçümü (null: ses yok), ms: şimdiki zaman */
  adim(o: Olcum | null, ms: number): AgizSekli {
    const a = this.a;
    const dt = this.sonMs === null ? 16 : Math.max(0, ms - this.sonMs);
    this.sonMs = ms;
    const rms = o?.rms ?? 0;
    const k = (tau: number) => 1 - Math.exp(-dt / tau);
    this.duz += (rms - this.duz) * k(rms > this.duz ? a.yukselMs : a.alcalMs);
    if (o && o.rms >= a.sessiz) this.duzF = this.duzF ? this.duzF + (o.frekans - this.duzF) * k(a.frekansMs) : o.frekans;
    this.tepe = Math.max(a.tepeEnAz, this.duz, this.tepe * 0.5 ** (dt / a.tepeYarilanmaMs));
    let hedef: AgizSekli = hamSekil(this.duz, this.duzF, this.tepe, a);
    if (hedef === 'kapali') {
      this.sessizBas ??= ms;
      // dinlenirken (gülümseme) sessizlik ağzı kapatmaz; konuşma arasındaki kısa boşlukta kapanır
      if (this.sekil === 'gulumse' || ms - this.sessizBas >= a.gulumseMs) hedef = 'gulumse';
    } else this.sessizBas = null;
    if (hedef !== this.sekil && ms - this.sekilBas >= a.enAzMs) {
      this.sekil = hedef;
      this.sekilBas = ms;
    }
    return this.sekil;
  }
}

/** Ses örneklerinin zarfı: adimMs'de bir, pencereMs genişliğinde ölçüm */
export function zarfCikar(x: ArrayLike<number>, ornekHizi: number, adimMs = 10, pencereMs = 20): Olcum[] {
  const adim = Math.max(1, Math.round((ornekHizi * adimMs) / 1000));
  const yarim = Math.max(1, Math.round((ornekHizi * pencereMs) / 2000));
  const cikti: Olcum[] = [];
  for (let m = 0; m < x.length; m += adim) cikti.push(olcumHesapla(x, ornekHizi, Math.max(0, m - yarim), Math.min(x.length, m + yarim)));
  return cikti;
}

/** Önceden çıkarılmış ağız dizisi (filmin MP4 kaydı): kaydın kendi zamanında adimMs'de bir şekil; hiz: çalma hızı */
export interface HazirDizi {
  sekiller: AgizSekli[];
  adimMs: number;
  hiz: number;
}

/** Zarftan ağız dizisi (izleyici aynı kurallarla çalışır) */
export function sekilDizisi(zarf: Olcum[], adimMs = 10, a: DudakAyar = DUDAK): AgizSekli[] {
  const iz = new DudakIzleyici(a);
  return zarf.map((o, i) => iz.adim(o, i * adimMs));
}

/** Dizinin süresi (sn, çalma hızıyla) */
export const diziSuresi = (d: HazirDizi) => (d.sekiller.length * d.adimMs) / 1000 / d.hiz;

/** Dizide o anın şekli (gecenMs: çalmaya başlayalı geçen gerçek süre); dizi bittiyse null */
export function diziSekli(d: HazirDizi, gecenMs: number): AgizSekli | null {
  const i = Math.floor((Math.max(0, gecenMs) * d.hiz) / d.adimMs);
  return i < d.sekiller.length ? d.sekiller[i] : null;
}

// ---------------------------------------------------------------- cihaz sesi (TTS): metinden ritim
/** Cihaz sesinin bir hecesi (ms): hız 0.92'de Türkçe ~5 hece / sn */
export const HECE_MS = 190;
const SESLI: Record<string, AgizSekli> = { a: 'orta', â: 'orta', e: 'dis', i: 'dis', î: 'dis', ı: 'az', o: 'yuvarlak', ö: 'yuvarlak', u: 'yuvarlak', ü: 'yuvarlak', û: 'yuvarlak' };
const ritimOnbellek = new Map<string, [AgizSekli, number][]>();

/**
 * Metnin ağız ritmi: her ünlü bir hece (ünlünün şekli, sonra kısa kapanış), kelime arası ve noktalama ek kapanış.
 * Ses verisi olmadığında (cihaz sesi, sessiz animatik) kullanılır. Dönüş: [şekil, ms] parçaları (hepsi ≥ 70 ms).
 */
export function metinRitmi(metin: string, heceMs = HECE_MS): [AgizSekli, number][] {
  const anahtar = `${heceMs}|${metin}`;
  const hazir = ritimOnbellek.get(anahtar);
  if (hazir) return hazir;
  const r: [AgizSekli, number][] = [];
  const acik = Math.round(heceMs * 0.62);
  const kapa = Math.max(DUDAK.enAzMs, heceMs - acik);
  const ekle = (s: AgizSekli, ms: number) => {
    const son = r[r.length - 1];
    if (son && son[0] === s) son[1] += ms;
    else r.push([s, ms]);
  };
  for (const c of metin.toLocaleLowerCase('tr')) {
    const s = SESLI[c];
    if (s) {
      ekle(s, acik);
      ekle('kapali', kapa);
    } else if (/[.,!?;:…]/.test(c)) ekle('kapali', 160);
    else if (c === ' ') ekle('kapali', 60);
  }
  if (!r.length) for (const s of ['orta', 'dis', 'yuvarlak', 'az'] as const) (ekle(s, acik), ekle('kapali', kapa));
  if (ritimOnbellek.size > 200) ritimOnbellek.clear();
  ritimOnbellek.set(anahtar, r);
  return r;
}

/** Ritimde o anın şekli (gecenMs: konuşma başlayalı; ritim bitince baştan döner: cihaz sesinin süresi belirsiz) */
export function ritimSekli(metin: string, gecenMs: number, heceMs = HECE_MS): AgizSekli {
  const r = metinRitmi(metin, heceMs);
  const top = r.reduce((t, p) => t + p[1], 0);
  let t = ((Math.max(0, gecenMs) % top) + top) % top;
  for (const [s, ms] of r) {
    if (t < ms) return s;
    t -= ms;
  }
  return r[0][0];
}

// ---------------------------------------------------------------- iskelet katmanları
export interface AgizKatmani {
  /** gösterilecek katman */
  id: string;
  /** katmanın ağız noktası etrafında ek ölçeği */
  sx: number;
  sy: number;
}

/**
 * Şekil için iskeletin katmanı: önce Adobe'nin "agiz-<şekil>" katmanı; yoksa bugünkü açık ağız (agiz-acik)
 * ölçeklenerek (az: küçük, orta: büyük, yuvarlak: dar, dis: geniş-yassı); kapali yalnız agiz-kapali varsa.
 * gulumse ve karşılığı olmayan şekil: null (karakterin kendi ağzı kalır).
 */
export function agizKatmaniSec(sekil: AgizSekli, varMi: (id: string) => boolean): AgizKatmani | null {
  const kendi = `agiz-${sekil}`;
  if (varMi(kendi)) return { id: kendi, sx: 1, sy: 1 };
  // kapalı ağız katmanı yoksa karakterin kendi (kapalı gülen) ağzı kalır
  if (sekil === 'gulumse' || sekil === 'kapali') return null;
  if (!varMi('agiz-acik')) return null;
  switch (sekil) {
    case 'az':
      return { id: 'agiz-acik', sx: 0.85, sy: 0.6 };
    case 'orta':
      return { id: 'agiz-acik', sx: 1.1, sy: 1.2 };
    case 'yuvarlak':
      return { id: 'agiz-acik', sx: 0.8, sy: 1.05 };
    case 'dis':
      return { id: 'agiz-acik', sx: 1.25, sy: 0.55 };
  }
}
