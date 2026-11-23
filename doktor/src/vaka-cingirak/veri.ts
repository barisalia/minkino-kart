// Minik Doktor · onuncu vaka: "Mino'nun Kayıp Çıngırağı" (ekip/senaryo/DOKTOR-VAKALAR.md, vaka 10). Mino yürüyünce karnından
// "tıngır" sesi geliyor; şaşkın. Çıngıraklı topu önlüğünün cebine koyup unutmuş. Sekiz adım, her birinin kendi el hareketi,
// animasyonu ve efekti:
//   1 Mino'yu başından aşağı bastırıp bırak: yay gibi zıplar, her zıplayışta "tıngır" (çok bastırırsan "boing", tavana kadar)
//   2 stetoskopla kaçan sesi takip et: top giysinin içinde yuvarlanıyor, ses onunla gezer
//   3 cebin fermuarını soldan sağa çek; dişler tek tek açılır (hızlı çekersen sıkışır, biraz geri al)
//   4 topu cepten yukarı çekip çıkar (hızlı çekersen cep ters döner, kurabiye kırıntıları dökülür)
//   5 ritim: Mino başını sallarken topa vurduğu anda dokun, tıngır tıngır dans eder (yanlış anda dokununca "tık", Mino şaşırır)
//   6 topu Mino'ya fırlat (hızlı kaydır); zayıf atarsan top yuvarlanıp önünde durur, Mino uzanır
//   7 Mino geri atar: düşeceği yerdeki gölgeye eldiveni tut, yakala (kaçarsa top sekip yerine döner)
//   8 topu tasmasına götür, tokasına basılı tut: halka dolunca "çıt" diye kapanır, artık çıngırak boynunda (erken bırakırsan
//     toka açılır, Mino kıkırdar)
// Masada şaka: Mino sevinçle zıplar, boynundan "tıngır"; cebine bakar, kıkırdar.
// Çizimler Astra'dan: anahtar kare Paket Doktor-Y10 (CLAUDE-ASTRA-MESAJLAR.md, 22 Kasım 23:55 ve 23 Kasım eki); parça adları,
// ölçüleri ve kare dizileri ekip/senaryo/DOKTOR-Y8-Y10-PARCALAR.md ile birebirdir. Saf veri ve hesap: DOM yok.
import { HUB, SAHNE, type Kutu, type Nokta, type Yas } from '../vaka/veri';

const dizi = (ad: string, n: number, ilk = 0): string[] => Array.from({ length: n }, (_, i) => `${ad}-${i + ilk}`);

/** Paketin 80 çizimi (assets/doktor/cingirak/<ad>.webp). */
export const CINGIRAK = {
  fon: 'cingirak-fon',
  /** yakın plandaki Mino (belden yukarısı, önden; cep ve tasma ayrı katman): aynı gövde, yirmi ifade */
  bas: {
    uzgun: 'mino-yakin-uzgun', kirp: 'mino-yakin-kirp', ezik: 'mino-yakin-ezik', havada: 'mino-yakin-havada', boing: 'mino-yakin-boing', sasir: 'mino-yakin-sasir',
    kikir: 'mino-yakin-kikir', merak: 'mino-yakin-merak', dinle: 'mino-yakin-dinle', oh: 'mino-yakin-oh', sevin: 'mino-yakin-sevin', dans0: 'mino-yakin-dans-0',
    dans1: 'mino-yakin-dans-1', dans2: 'mino-yakin-dans-2', dans3: 'mino-yakin-dans-3', uzan: 'mino-yakin-uzan', yakala: 'mino-yakin-yakala', firlat: 'mino-yakin-firlat',
    gulen: 'mino-yakin-gulen', utangac: 'mino-yakin-utangac',
  },
  cep: dizi('cep-fermuar', 5), cepTers: 'cep-ters', tutamak: 'fermuar-tutamak', sikisti: 'fermuar-sikisti', disParilti: 'fermuar-parilti',
  tingir: dizi('tingir-cizgi', 3), sesDalga: dizi('ses-dalga', 2), steto: 'cin-steto', stetoDinle: 'cin-steto-dinle',
  top: 'cingirak-top', topCep: 'cingirak-top-cepte', topParla: 'cingirak-top-parla', topEzik: 'cingirak-top-ezik', yuvarlan: dizi('top-yuvarlan', 3), ucus: dizi('top-ucus', 2), golge: 'top-golge',
  kirinti: dizi('kurabiye-kirinti', 2), ezikCizgi: dizi('yay-cizgi', 2), toz: dizi('zipla-toz', 2),
  ritim: dizi('ritim-isik', 3), nota: dizi('tingir-yildiz', 3),
  eldiven: 'eldiven', eldivenTuttu: 'eldiven-tuttu', eldivenKacti: 'eldiven-kacti', hedef: 'dusme-golgesi',
  tasma: 'tasma-cozuk', tasmaBagli: 'tasma-bagli', tasmaParla: 'tasma-parla', toka: 'toka-acik', tokaKapali: 'toka-kapali', cin: dizi('tasma-cin', 2),
  kalp: dizi('cin-kalp', 2),
  uzgun: ['mino-cin-uzgun-0', 'mino-cin-uzgun-1'], uzgunKirp: 'mino-cin-uzgun-kirp', sevinc: ['mino-cin-sevinc-0', 'mino-cin-sevinc-1'], son: ['mino-cin-son-zipla', 'mino-cin-son-tingir', 'mino-cin-son-kikir'],
} as const;
export const CINGIRAK_DOSYALAR: readonly string[] = Object.values(CINGIRAK).flatMap(v => (typeof v === 'string' ? [v] : Array.isArray(v) ? [...v] : Object.values(v as Record<string, string>)));

const boyut = (adlar: readonly string[], b: readonly [number, number]) => Object.fromEntries(adlar.map(a => [a, b]));
const TAM = [SAHNE.g, SAHNE.y] as const;
export const TOP_BOYU = 170;
export const TUVAL: Readonly<Record<string, readonly [number, number]>> = {
  'cingirak-fon': TAM, ...boyut(Object.values(CINGIRAK.bas), TAM), ...boyut([...CINGIRAK.cep, CINGIRAK.cepTers], [480, 300]),
  'fermuar-tutamak': [160, 200], 'fermuar-sikisti': [300, 200], 'fermuar-parilti': [200, 200],
  ...boyut(CINGIRAK.tingir, [400, 300]), ...boyut(CINGIRAK.sesDalga, [300, 300]), 'cin-steto': [600, 600], 'cin-steto-dinle': [600, 600],
  ...boyut([CINGIRAK.top, CINGIRAK.topCep, CINGIRAK.topParla, CINGIRAK.topEzik, ...CINGIRAK.yuvarlan, ...CINGIRAK.ucus], [240, 240]), 'top-golge': [300, 120],
  ...boyut(CINGIRAK.kirinti, [300, 300]), ...boyut(CINGIRAK.ezikCizgi, [700, 300]), ...boyut(CINGIRAK.toz, [500, 200]),
  ...boyut(CINGIRAK.ritim, [300, 300]), ...boyut(CINGIRAK.nota, [200, 200]),
  eldiven: [600, 600], 'eldiven-tuttu': [600, 600], 'eldiven-kacti': [600, 600], 'dusme-golgesi': [300, 140],
  'tasma-cozuk': TAM, 'tasma-bagli': TAM, 'tasma-parla': [300, 300], 'toka-acik': [240, 200], 'toka-kapali': [240, 200], ...boyut(CINGIRAK.cin, [200, 200]),
  ...boyut(CINGIRAK.kalp, [160, 160]),
  ...boyut([...CINGIRAK.uzgun, CINGIRAK.uzgunKirp, ...CINGIRAK.sevinc, ...CINGIRAK.son], [1000, 940]),
};
export const OPAK: readonly string[] = [CINGIRAK.fon];
export const KARE_MS = { tingir: 120, dalga: 160, yuvarlan: 90, ucus: 80, kirinti: 110, yay: 90, toz: 110, ritim: 120, nota: 110, cin: 220, kalp: 200, dans: 180 } as const;

// ——— masa (Zıpzıp'ın yerinde, aynı tuval): Mino sedyede ayakta, patisi yanağında, karnından tıngır
export const MASA = {
  mino: HUB.zipzip,
  /** dokunulacak yer cebi, yıldız göğsünden kalkar; tuvalde cep (560, 600), göğüs (560, 470) */
  cep: { x: HUB.zipzip.sol + 560, y: HUB.zipzip.ust + 600 } as Nokta,
  gogus: { x: HUB.zipzip.sol + 560, y: HUB.zipzip.ust + 470 } as Nokta,
  yaklasma: { x: HUB.zipzip.sol + 560, y: HUB.zipzip.ust + 500, olcek: 2.2 },
} as const;

// ——— yakın plan (anahtar kare: baş ekseni x 880, baş x 540…1220, y 60…560; ön cep x 640…1120, y 600…900)
/** Mino'yu zıplatmak için bastırılan yer: başı ve omuzları */
export const MINO_DUGMESI: Kutu = { sol: 600, ust: 80, g: 560, y: 460 };
export const CEP: Kutu = { sol: 640, ust: 600, g: 480, y: 300 };
/** fermuar cebin ağzında soldan sağa: tutamak (690, 640) → (1070, 640) */
export const FERMUAR = { bas: { x: 690, y: 640 } as Nokta, son: { x: 1070, y: 640 } as Nokta, dis: 12 } as const;
/** topun cepteki yeri; cepten çıkınca sedyede durduğu yer */
export const TOP_CEPTE: Nokta = { x: 880, y: 770 };
export const TOP_YERI: Nokta = { x: 1330, y: 800 };
/** sesin giysinin içinde gezdiği yol (elips), ortası ve yarıçapları */
export const SES_YOLU = { x: 880, y: 760, rx: 190, ry: 110, tur: 4200 } as const;
/** Mino'nun patileri (top buraya atılır) ve boynu (tasma) */
export const PATILER: Nokta = { x: 880, y: 500 };
export const BOYUN: Nokta = { x: 880, y: 575 };
/** tasmanın tokası (topun altında) */
export const TOKA: Nokta = { x: 880, y: 640 };
/** Mino'nun geri attığı topun düşebileceği üç yer */
export const DUSME_YERLERI: readonly Nokta[] = [{ x: 560, y: 860 }, { x: 900, y: 880 }, { x: 1260, y: 860 }];

export type Asama = 'giris' | 'canta' | 'zipla' | 'dinle' | 'fermuar' | 'cikar' | 'ritim' | 'firlat' | 'yakala' | 'toka' | 'kutlama' | 'son';
export const ASAMALAR: readonly Asama[] = ['giris', 'canta', 'zipla', 'dinle', 'fermuar', 'cikar', 'ritim', 'firlat', 'yakala', 'toka', 'kutlama', 'son'];
export const ADIMLAR: readonly Asama[] = ['zipla', 'dinle', 'fermuar', 'cikar', 'ritim', 'firlat', 'yakala', 'toka'];
export const sonrakiAsama = (a: Asama): Asama => ASAMALAR[Math.min(ASAMALAR.length - 1, ASAMALAR.indexOf(a) + 1)];

export interface Zorluk {
  zipla: number; dinleR: number; dinleMs: number;
  /** fermuarı sıkıştırmayan en yüksek el hızı (px/ms) */ fermuarHiz: number;
  /** topu çekme boyu ve cebi ters çevirmeyen hız */ cek: number; cekHiz: number;
  ritim: number; /** vuruşun penceresi (ms, iki yana) */ pencere: number;
  /** fırlatma için en düşük kaydırma hızı (px/ms) */ firlat: number;
  atis: number; yakalaR: number; /** gölgenin büyüyüp topun düştüğü süre */ dusme: number;
  /** tokayı kapatmak için basılı tutma (ms) */ toka: number;
}
export const ZORLUK: Record<Yas, Zorluk> = {
  '2-3': { zipla: 2, dinleR: 160, dinleMs: 600, fermuarHiz: 2.2, cek: 150, cekHiz: 3.2, ritim: 2, pencere: 260, firlat: 0.9, atis: 1, yakalaR: 180, dusme: 1700, toka: 500 },
  '4': { zipla: 3, dinleR: 130, dinleMs: 800, fermuarHiz: 1.5, cek: 190, cekHiz: 2.4, ritim: 3, pencere: 200, firlat: 1.3, atis: 2, yakalaR: 150, dusme: 1400, toka: 700 },
  '5+': { zipla: 3, dinleR: 110, dinleMs: 1000, fermuarHiz: 1.1, cek: 220, cekHiz: 1.9, ritim: 4, pencere: 160, firlat: 1.7, atis: 3, yakalaR: 125, dusme: 1150, toka: 850 },
};

// ——— aletler: çizimde (600 × 600) tutulan yer ve iş yapan uç, 0–1 oran
export type AletAdi = 'steto' | 'eldiven' | 'top';
export interface AletOlcu { g: number; y: number; tut: readonly [number, number]; uc: readonly [number, number]; kaldir?: number; }
export const ALETLER: Readonly<Record<AletAdi, AletOlcu>> = {
  /** stetoskop: kulaklıklar üstte (tutulan), dinleme başı altta (450, 470) */
  steto: { g: 360, y: 360, tut: [300 / 600, 140 / 600], uc: [450 / 600, 470 / 600] },
  /** yakalama eldiveni: avucun ortası */
  eldiven: { g: 330, y: 330, tut: [0.5, 490 / 600], uc: [0.5, 250 / 600] },
  /** top elde (tasmaya götürülürken) */
  top: { g: TOP_BOYU, y: TOP_BOYU, tut: [0.5, 0.5], uc: [0.5, 0.5], kaldir: 60 },
};

/** Mino'nun sözleri (emir yok; assets/doktor/cingirak/ses/). Mino'nun klonu yok: ses kararı Barış'ta, sahne sözsüz de akar. */
export const SOZLER = {
  'mn-tingir-canta': 'Karnımdan tıngır sesi geliyor!',
  'mn-boing': 'Boing! Tavana çıktım!',
  'mn-dinle': 'Ses kaçıyor! Hi hi!',
  'mn-cep': 'Cebimde mi? Unutmuşum!',
  'mn-sikisti': 'Ay, fermuar sıkıştı!',
  'mn-top': 'Çıngıraklı topum! Buldun!',
  'mn-ters': 'Hi hi! Kurabiye kırıntıları!',
  'mn-dans': 'Tıngır tıngır, dans ediyorum!',
  'mn-yakala': 'Yakaladım! Şimdi sen yakala!',
  'mn-kisa': 'Yetişemedim! Bir daha!',
  'mn-tasma': 'Boynumda çıngırak! Artık kaybolmaz.',
  'mn-tingir-son': 'Tıngır tıngır! Hi hi!',
} as const;
export type SozAdi = keyof typeof SOZLER;
export const EFEKTLER = ['c-tingir', 'c-boing', 'c-yay', 'c-zip', 'c-sikis', 'c-pop', 'c-kirinti', 'c-tik', 'c-vuus', 'c-yakala', 'c-sek', 'c-yuvarlan', 'c-toka', 'c-cin'] as const;

// ——— mekaniklerin saf hesabı
export const uzak = (a: Nokta, b: Nokta) => Math.hypot(a.x - b.x, a.y - b.y);
const kutuda = (p: Nokta, k: Kutu) => p.x >= k.sol && p.x <= k.sol + k.g && p.y >= k.ust && p.y <= k.ust + k.y;
export const cepteMi = (p: Nokta): boolean => kutuda(p, CEP);

/** Zıplatma: bastırma derinliği (px, aşağı) → zıplayış; eşik altında sayılmaz, çok derin "boing" */
export const ZIPLA_ESIGI = 50, BOING_ESIGI = 220;
export type Ziplayis = 'yok' | 'zipla' | 'boing';
export const ziplayis = (derinlik: number): Ziplayis => (derinlik >= BOING_ESIGI ? 'boing' : derinlik >= ZIPLA_ESIGI ? 'zipla' : 'yok');
/** bastırırken Mino'nun basılma oranı (0…1; görünüşte en çok %22 basılır) */
export const basilma = (derinlik: number): number => Math.min(1, Math.max(0, derinlik) / BOING_ESIGI);

/** Kaçan ses: giysinin içinde elips üstünde gezer (t ms) */
export function sesYeri(t: number): Nokta {
  const a = (t / SES_YOLU.tur) * Math.PI * 2;
  return { x: SES_YOLU.x + Math.cos(a) * SES_YOLU.rx, y: SES_YOLU.y + Math.sin(a * 2) * SES_YOLU.ry * 0.6 + Math.sin(a) * SES_YOLU.ry * 0.4 };
}
export const takipAdimi = (birikim: number, uzaklik: number, yaricap: number, dt: number): number => (uzaklik <= yaricap ? birikim + dt : Math.max(0, birikim - dt * 0.6));
export const yakinlik = (uc: Nokta, hedef: Nokta): number => Math.max(0, 1 - uzak(uc, hedef) / 600);

/** Fermuar: tutamak fermuar boyunca yalnız ileri gider; ilerleme 0…1 ve açılan diş sayısı */
export function fermuarIlerleme(p: Nokta, once: number): number {
  const { bas, son } = FERMUAR;
  if (Math.abs(p.y - bas.y) > 110) return once;
  const o = (p.x - bas.x) / (son.x - bas.x);
  return Math.max(once, Math.min(1, o));
}
export const acikDis = (ilerleme: number): number => Math.round(ilerleme * FERMUAR.dis);
export const cepKademesi = (ilerleme: number): 0 | 1 | 2 | 3 | 4 => (Math.min(4, Math.floor(ilerleme * 4 + 0.001)) as 0 | 1 | 2 | 3 | 4);
/** sıkışınca tutamak biraz geri alınmalı (px) */
export const GERI_AL = 40;

/** Topu çekme: cebin ağzından yukarı uzaklaşma */
export const cekmeBoyu = (p: Nokta): number => Math.max(0, CEP.ust + 40 - p.y);

/** Ritim: Mino başını her VURUS ms'de bir sallar; vuruşa en yakın an */
export const VURUS = 720;
export const vurusaUzaklik = (t: number): number => { const k = ((t % VURUS) + VURUS) % VURUS; return Math.min(k, VURUS - k); };
export const vurusta = (t: number, pencere: number): boolean => vurusaUzaklik(t) <= pencere;

/** Fırlatma: kaydırma hızı ve yönü; Mino'ya doğru (açı farkı 55° içinde) ve yeterince hızlı olmalı */
export type Atis = 'tam' | 'kisa' | 'yanlis';
export function atis(bas: Nokta, son: Nokta, ms: number, enAz: number): Atis {
  const dx = son.x - bas.x, dy = son.y - bas.y, boy = Math.hypot(dx, dy);
  if (boy < 60) return 'yanlis';
  const hedef = Math.atan2(PATILER.y - bas.y, PATILER.x - bas.x), yon = Math.atan2(dy, dx);
  let fark = Math.abs(yon - hedef); if (fark > Math.PI) fark = Math.PI * 2 - fark;
  if (fark > (55 * Math.PI) / 180) return 'yanlis';
  return boy / Math.max(1, ms) >= enAz ? 'tam' : 'kisa';
}
/** atışın yayı (0…1): yukarı kavis */
export function yayNoktasi(a: Nokta, b: Nokta, t: number, yukseklik = 260): Nokta {
  const u = Math.min(1, Math.max(0, t));
  return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u - Math.sin(u * Math.PI) * yukseklik };
}
/** Mino'nun geri atışında düşme yeri (sırayla değişir) */
export const dusmeYeri = (atisNo: number): Nokta => DUSME_YERLERI[(atisNo * 2 + 1) % DUSME_YERLERI.length];
export const yakaladiMi = (eldiven: Nokta | null, yer: Nokta, yaricap: number): boolean => !!eldiven && uzak(eldiven, yer) <= yaricap;

/** Toka: basılı tutuldukça halka dolar (0…1) */
export const tokaDolumu = (ms: number, hedef: number): number => Math.min(1, Math.max(0, ms) / Math.max(1, hedef));
export const TASMA_YARICAPI = 120;

/** Yakın plandaki yüz ifadesi */
export type BasPozu = keyof typeof CINGIRAK.bas;
export interface BasDurumu {
  asama: Asama; ezikKalan: number; havadaKalan: number; boingKalan: number; sasirKalan: number; kikirKalan: number; merakKalan: number; ohKalan: number; sevinKalan: number;
  dansKalan: number; uzanKalan: number; yakalaKalan: number; firlatKalan: number; utanKalan: number; dinliyor: boolean; kirp: boolean; an: number;
}
export function basPozu(d: BasDurumu): BasPozu {
  if (d.asama === 'kutlama' || d.asama === 'son') return 'gulen';
  if (d.boingKalan > 0) return 'boing';
  if (d.havadaKalan > 0) return 'havada';
  if (d.ezikKalan > 0) return 'ezik';
  if (d.yakalaKalan > 0) return 'yakala';
  if (d.firlatKalan > 0) return 'firlat';
  if (d.uzanKalan > 0) return 'uzan';
  if (d.dansKalan > 0) return (['dans0', 'dans1', 'dans2', 'dans3'] as const)[Math.floor(d.an / KARE_MS.dans) % 4];
  if (d.ohKalan > 0) return 'oh';
  if (d.sevinKalan > 0) return 'sevin';
  if (d.sasirKalan > 0) return 'sasir';
  if (d.utanKalan > 0) return 'utangac';
  if (d.kikirKalan > 0) return 'kikir';
  if (d.merakKalan > 0) return 'merak';
  if (d.dinliyor) return 'dinle';
  if (d.kirp) return 'kirp';
  return ADIMLAR.indexOf(d.asama) >= ADIMLAR.indexOf('cikar') ? 'sevin' : 'uzgun';
}

export { SAHNE };
export const KAPANIS = { parlama: 400, kamera: 430, sevinc: 1150 } as const;
export const CEP_DUGMESI: readonly [number, number] = [320, 280];
export const TOP_DUGMESI = 220;
export const TUTAMAK_DUGMESI = 200;
export const TOKA_DUGMESI = 220;
