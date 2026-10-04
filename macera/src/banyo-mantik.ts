/**
 * "Mino Banyo Yapmıyor!" oyun mantığı (DOM'suz, birim testli: tests/unit/macera-banyo.test.ts).
 * Yaş ayarları, su sıcaklığı, baloncuk boyu, ovalama ve deneme/ipucu kuralları burada.
 * Kolaylık yalnız oyunun hızından ve kurallarından verilir; ses algılama eşiklerine dokunulmaz (ekip/SES-SISTEMI.md).
 */
import SARKI_JSON from '../../assets/muzik/banyo.json';
import { sarkiTablosu, type SarkiJson } from '../../src/audio/sarki-kayit';

/** 3-4 yaş grubu mu (5-6: büyük grup) */
export const kucukMu = (yas: number) => yas <= 4;

// ---------------------------------------------------------------- vücut bölümleri
export type KisiAdi = 'mino' | 'kino';
export type Bolum = 'kulak' | 'kuyruk' | 'pati' | 'burun' | 'gobek' | 'sirt' | 'kafa';
/** 'mino-kulak' gibi */
export type BolgeId = `${KisiAdi}-${Bolum}`;

export const bolgeId = (k: KisiAdi, b: Bolum): BolgeId => `${k}-${b}`;
export function bolgeCoz(id: BolgeId): [KisiAdi, Bolum] {
  const [k, b] = id.split('-') as [KisiAdi, Bolum];
  return [k, b];
}

/** "Orası …!" balonu için iyelikli ad */
export const BOLUM_BENIM: Record<Bolum, string> = {
  kulak: 'kulağım',
  kuyruk: 'kuyruğum',
  pati: 'patim',
  burun: 'burnum',
  gobek: 'göbeğim',
  sirt: 'sırtım',
  kafa: 'başım',
};

// ---------------------------------------------------------------- Sahne 1: çamur
export interface CamurPlani {
  /** serbest dokunuş (her dokunulan leke kabul) */
  serbest: BolgeId[];
  /** hedefli soru ("Kino'nun kuyruğunu bul!"): yanlış yere dokununca balon, yeniden denenir */
  hedefli: BolgeId[];
}
export function camurPlani(yas: number): CamurPlani {
  if (kucukMu(yas)) return { serbest: ['mino-kulak', 'kino-burun', 'mino-kuyruk', 'kino-gobek'], hedefli: [] };
  return { serbest: ['mino-kulak', 'kino-burun', 'mino-kuyruk', 'kino-gobek'], hedefli: ['kino-kuyruk', 'mino-pati'] };
}

// ---------------------------------------------------------------- Sahne 3: su
/** Musluk açıklık adımları: küçükte aç/kapa; büyükte dört adım (ayar gerekir) */
export const muslukAdimlari = (yas: number) => (kucukMu(yas) ? [0, 1] : [0, 1 / 3, 2 / 3, 1]);

/** Dokununca sonraki açıklık (döngü) */
export function sonrakiAciklik(simdi: number, yas: number): number {
  const a = muslukAdimlari(yas);
  const i = a.findIndex((x) => Math.abs(x - simdi) < 0.01);
  return a[(i + 1) % a.length];
}

/** Karışımın sıcaklığı: 0 = buz gibi (yalnız mavi), 1 = çok sıcak (yalnız kırmızı); su akmıyorsa null */
export function sicaklik(kirmizi: number, mavi: number): number | null {
  const t = kirmizi + mavi;
  return t < 0.01 ? null : kirmizi / t;
}

export type SuDurumu = 'sicak' | 'soguk' | 'ilik';
/** Yeşil (ılık) bölge: 5-6 yaş göstergesi (geniş: iki musluğu bir adım farkla açmak da ılık sayılır) */
export const ILIK = { alt: 0.35, ust: 0.65 };

export function suDurumu(kirmizi: number, mavi: number, yas: number): SuDurumu | null {
  const t = sicaklik(kirmizi, mavi);
  if (t === null) return null;
  if (kucukMu(yas)) return kirmizi > 0 && mavi > 0 ? 'ilik' : kirmizi > 0 ? 'sicak' : 'soguk';
  return t > ILIK.ust ? 'sicak' : t < ILIK.alt ? 'soguk' : 'ilik';
}

/** Yanlış sıcaklıkta küvet en çok buraya kadar dolar (su ılık olunca dolmaya devam eder) */
export const YANLIS_SU_SINIRI = 0.45;
/** Taşma: dolu (1) üstünde bu kadar birikince su kenardan akar */
export const TASMA = 1.12;

/** Saniyede dolum miktarı (küvet 0 → 1) */
export function dolumHizi(kirmizi: number, mavi: number, durum: SuDurumu | null, seviye: number): number {
  if (!durum) return 0;
  const akis = (kirmizi + mavi) / 2;
  if (durum !== 'ilik' && seviye >= YANLIS_SU_SINIRI) return 0;
  return 0.1 + akis * 0.12;
}

// ---------------------------------------------------------------- Sahne 4: baloncuk
/** Mino'yu küvete çekmek için gereken kocaman baloncuk (Barış: köpük yapma bir tık daha kolay) */
export const gerekenBaloncuk = (yas: number) => (kucukMu(yas) ? 3 : 2);

/** 5-6 yaş: bu kadar (sn) üflemek kocaman baloncuk için yeter (oyunun yorumu; algılama eşiği değil) */
export const KOCAMAN_SURE = 0.5;
/** 5-6 yaş: bundan uzun sert üfleme baloncuğu minik yapar */
export const SERT_SURE = 0.6;

/**
 * 5-6 yaş: yavaş ve uzun üfleme kocaman, sert (güçlü) ya da kısa üfleme minik baloncuk (minik de uçar, her
 * üflemede baloncuk çıkar). sure: üflemenin süresi (sn); sertSure: bu sürede sert üflenen kısım (sn);
 * basarisiz: arka arkaya minik sayısı (2. denemede kabul: 1 minikten sonra her üfleme kocaman; kilitlenme yok).
 */
export function baloncukBoyu(sure: number, sertSure: number, yas: number, basarisiz = 0): 'kocaman' | 'minik' {
  if (kucukMu(yas)) return 'kocaman';
  if (basarisiz >= 1) return 'kocaman';
  return sure >= KOCAMAN_SURE && sertSure < SERT_SURE ? 'kocaman' : 'minik';
}

/** Üfleme gücü bu değerin üstündeyse "sert" (5-6 yaş); algılama eşiği değil, oyunun yorumu */
export const SERT_GUC = 0.8;

// ---------------------------------------------------------------- ovalama / silme / tarama
/**
 * Ovalama: parmağın bölge içinde aldığı yol, bölge yarıçapının katı olarak birikir.
 * Eşik %100'e varınca bölge biter (öneri: senaryo %70 kapsama; yol ölçüsüyle aynı hissi verir, telefonda ucuz).
 */
export class Ovalama {
  private yol = 0;
  constructor(private gereken: number) {}
  /** mesafe: bu harekette bölge içinde alınan yol (bölge yarıçapı biriminde) */
  ekle(mesafe: number) {
    this.yol += Math.max(0, mesafe);
    return this.oran;
  }
  get oran() {
    return Math.min(1, this.yol / this.gereken);
  }
  get bitti() {
    return this.oran >= 1;
  }
}
/** Bölge yarıçapı biriminde gereken yol: birkaç kısa sürtme yeter (küçükler için daha da kısa) */
export const ovalamaYolu = (yas: number) => (kucukMu(yas) ? 2.5 : 3.5);
/** Ovalamada hedef bölgenin dokunma payı (bölge yarıçapının katı): hedefin yakını da sayılır */
export const OVALAMA_PAY = 1.8;

/** Tarak darbesi: yukarıdan aşağı, yeterince uzun ve dikey */
export const taramaMi = (dx: number, dy: number, boy: number) => dy > boy * 0.3 && dy > Math.abs(dx) * 1.2;

/** İki adımlı sıra (5-6 yaş): beklenen sırada doğru bölge mi */
export function siraKontrol(beklenen: readonly string[], sira: number, dokunulan: string): 'dogru' | 'yanlis' | 'bitti' {
  if (beklenen[sira] !== dokunulan) return 'yanlis';
  return sira + 1 >= beklenen.length ? 'bitti' : 'dogru';
}

// ---------------------------------------------------------------- deneme ve ipucu
/**
 * Kolaylık kuralı: bir görev 2 denemede ya da 12 saniyede olmazsa parmak ipucu çıkar.
 * 3-4 yaşta 3. denemede kabul edilir. Hiçbir koşulda kilitlenmez.
 */
export class Deneme {
  yanlis = 0;
  private gecen = 0;
  private gosterildi = false;
  constructor(
    readonly yas: number,
    private ipucuSure = 12,
    private ipucuYanlis = 2,
  ) {}
  /** yanlış deneme; ipucu zamanı geldiyse true */
  yanlisEkle(): boolean {
    this.yanlis++;
    this.gecen = 0;
    return this.yanlis >= this.ipucuYanlis;
  }
  /** zaman geçer (sn); ipucu zamanı geldiyse (her 12 sn'de bir) true */
  tik(dt: number): boolean {
    this.gecen += dt;
    if (this.gecen >= this.ipucuSure) {
      this.gecen = 0;
      this.gosterildi = true;
      return true;
    }
    return false;
  }
  /** kullanıcı bir şey yaptı: süre baştan */
  hareket() {
    this.gecen = 0;
  }
  /** bu (yeni) deneme kabul edilir mi: her yaşta ikinci denemede */
  get kabul(): boolean {
    return this.yanlis >= 1;
  }
  get ipucuGosterildi() {
    return this.gosterildi;
  }
  /**
   * Kolay mod (her yaşta): 2 yanlıştan sonra (3. deneme) ya da 12 sn'de ipucu çıktıktan sonra görev
   * cömertleşir (köpük yapma: yanlış yer de sayılır, her üfleme kocaman baloncuk).
   */
  get kolay(): boolean {
    return this.yanlis >= 1 || this.gosterildi;
  }
}

// ---------------------------------------------------------------- Sahne 6: uluma
/** Kino'nun uluma perdesi (Hz): çocuğun kendi sesine göre farkı (yarım ton) izler, köpek aralığında kalır */
export function ulumaFrekansi(fark: number | null): number {
  const f = 520 * Math.pow(2, ((fark ?? 0) * 0.75) / 12);
  return Math.max(300, Math.min(1100, f));
}
/** Perde dizisinden yankı konturu: en çok n nokta, uç değerler budanır */
export function ulumaKonturu(farklar: number[], n = 24): number[] {
  if (!farklar.length) return [ulumaFrekansi(0)];
  const adim = Math.max(1, farklar.length / n);
  const cikti: number[] = [];
  for (let i = 0; i < farklar.length; i += adim) cikti.push(ulumaFrekansi(farklar[Math.floor(i)]));
  return cikti;
}
/** Uluma görevi için toplam ses süresi (sn) */
export const ULUMA_HEDEF = 3;

// ---------------------------------------------------------------- köpük şarkısı
/** Köpük şarkısının sözleri (Gemini kaydı assets/muzik/banyo.json; heceleri kayıttakilerle eşleşir) */
export const BANYO_SOZ = ['Köpük köpük baloncuk', 'Mino oldu pamukçuk', 'Ovala ovala tertemiz', 'Şarkı söyle hep beraber'];
/** Kaydın hece / vuruş tablosu: oyun şarkının notalarına ve ritmine göre ilerler */
export const BANYO_SARKI = sarkiTablosu(SARKI_JSON as SarkiJson);
