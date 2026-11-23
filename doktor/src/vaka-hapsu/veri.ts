// Minik Doktor · beşinci vaka: "Pamuk'un Hapşırığı" (ekip/senaryo/DOKTOR-VAKALAR.md, vaka 5). Sekiz adım (Barış'ın temel
// kuralı, 23 Kasım: her adımda gerçek el hareketi ve gerçek animasyon):
//   1 mendili kutudan çekip kopar · 2 hapşırığı mendille yakala (zamanlama; kaçarsa pamuklar uçuşur) · 3 burnunu sil
//   4 demliği kâsenin üstünde eğerek dök · 5 papatya kavanozunu sallayarak serpiştir · 6 buhara bastır ve tut (nefes al, bırak:
//   nefes ver) · 7 atkıyı boynunun önünden boydan boya geçir · 8 battaniyeyi aşağıdan yukarı çek (Pamuk esner, mırlar).
// Çizimler Astra'dan: anahtar kare Paket Doktor-Y5 (CLAUDE-ASTRA-MESAJLAR.md, 22 Kasım 23:55); parça adları, ölçüleri ve kare
// dizileri ekip/senaryo/DOKTOR-Y5-Y6-PARCALAR.md ile birebirdir. Saf veri ve hesap: DOM yok, birim testleri buradan sınar.
import { HUB, SAHNE, type Kutu, type Nokta, type Yas } from '../vaka/veri';

const dizi = (ad: string, n: number, ilk = 0): string[] => Array.from({ length: n }, (_, i) => `${ad}-${i + ilk}`);

/** Paketin 81 çizimi (assets/doktor/hapsu/<ad>.webp). */
export const HAPSU = {
  fon: 'hapsu-fon', mendilKutusu: 'mendil-kutusu', kase: dizi('kase', 4),
  /** yakın plandaki Pamuk: aynı gövde, on altı ifade (burnun pembesi, gözyaşı, atkı ve battaniye ayrı katman) */
  bas: {
    uzgun: 'pamuk-yakin-uzgun', kirp: 'pamuk-yakin-kirp', hap0: 'pamuk-yakin-hap-0', hap1: 'pamuk-yakin-hap-1', hapsu: 'pamuk-yakin-hapsu', rahat: 'pamuk-yakin-rahat',
    sikik: 'pamuk-yakin-sikik', gulen: 'pamuk-yakin-gulen', kasin0: 'pamuk-yakin-kasin-0', kasin1: 'pamuk-yakin-kasin-1', nefesAl: 'pamuk-yakin-nefes-al', nefesVer: 'pamuk-yakin-nefes-ver',
    sisik: 'pamuk-yakin-sisik', esne: 'pamuk-yakin-esne', mirr: 'pamuk-yakin-mirr', kikir: 'pamuk-yakin-kikir',
  },
  burunPembe: 'burun-pembe', gozyasi: 'gozyasi', battaniyeOrtulu: 'battaniye-ortulu', atkiSarili: dizi('atki-sarili', 3), kalp: dizi('kalp', 2),
  uzgun: ['pamuk-uzgun-0', 'pamuk-uzgun-1'], uzgunKirp: 'pamuk-uzgun-kirp', sevinc: ['pamuk-sevinc-0', 'pamuk-sevinc-1'], son: ['pamuk-son-hap', 'pamuk-son-mirr'],
  mendil: 'mendil', mendilCek: dizi('mendil-cek', 3), mendilSisik: 'mendil-sisik', mendilUcan: dizi('mendil-ucan', 2), mendilBuruk: 'mendil-buruk',
  hapsuRuzgar: dizi('hapsu-ruzgar', 3), ucanPamuk: dizi('ucan-pamuk', 2), ucanMendil: 'ucan-mendil',
  demlik: 'demlik', demlikEgik: 'demlik-egik', suAkis: dizi('su-akis', 3), sicrama: dizi('sicrama', 3),
  buhar: dizi('buhar', 4), buharBurun: dizi('buhar-burun', 2), buharPuf: 'buhar-puf', koku: dizi('koku', 2),
  kavanoz: 'papatya-kavanoz', kavanozSalla: 'papatya-kavanoz-salla', papatya: dizi('papatya', 3), papatyaYuzen: dizi('papatya-yuzen', 3, 1),
  atki: 'atki', atkiUcan: 'atki-ucan', battaniye: 'battaniye', battaniyeKivrim: dizi('battaniye-kivrim', 2),
} as const;
export const HAPSU_DOSYALAR: readonly string[] = Object.values(HAPSU).flatMap(v => (typeof v === 'string' ? [v] : Array.isArray(v) ? [...v] : Object.values(v as Record<string, string>)));

const boyut = (adlar: readonly string[], b: readonly [number, number]) => Object.fromEntries(adlar.map(a => [a, b]));
export const TUVAL: Readonly<Record<string, readonly [number, number]>> = {
  'hapsu-fon': [2048, 1152], 'mendil-kutusu': [360, 360], ...boyut(HAPSU.kase, [520, 300]),
  ...boyut(Object.values(HAPSU.bas), [2048, 1152]), 'burun-pembe': [2048, 1152], gozyasi: [2048, 1152], 'battaniye-ortulu': [2048, 1152], ...boyut(HAPSU.atkiSarili, [2048, 1152]), ...boyut(HAPSU.kalp, [160, 160]),
  ...boyut([...HAPSU.uzgun, HAPSU.uzgunKirp, ...HAPSU.sevinc, ...HAPSU.son], [1000, 940]),
  mendil: [600, 600], ...boyut(HAPSU.mendilCek, [240, 400]), 'mendil-sisik': [600, 600], ...boyut(HAPSU.mendilUcan, [400, 400]), 'mendil-buruk': [600, 600],
  ...boyut(HAPSU.hapsuRuzgar, [600, 400]), ...boyut(HAPSU.ucanPamuk, [200, 200]), 'ucan-mendil': [300, 300],
  demlik: [600, 600], 'demlik-egik': [600, 600], ...boyut(HAPSU.suAkis, [120, 400]), ...boyut(HAPSU.sicrama, [300, 300]),
  ...boyut(HAPSU.buhar, [400, 500]), ...boyut(HAPSU.buharBurun, [400, 400]), 'buhar-puf': [300, 300], ...boyut(HAPSU.koku, [300, 300]),
  'papatya-kavanoz': [600, 600], 'papatya-kavanoz-salla': [600, 600], ...boyut(HAPSU.papatya, [120, 120]), ...boyut(HAPSU.papatyaYuzen, [520, 300]),
  atki: [600, 600], 'atki-ucan': [600, 600], battaniye: [600, 600], ...boyut(HAPSU.battaniyeKivrim, [600, 200]),
};
export const OPAK: readonly string[] = [HAPSU.fon];
export const KARE_MS = { cek: 90, ruzgar: 90, ucan: 140, akis: 90, sicrama: 80, buhar: 160, burun: 180, puf: 300, koku: 220, salla: 120, kasin: 140, atki: 160, kivrim: 180, kalp: 200 } as const;

// ——— masa (Zıpzıp'ın yerinde, aynı tuval)
export const MASA = {
  pamuk: HUB.zipzip,
  /** Pamuk'un burnu (dokunulacak yer), göğsü (yıldızın yeri); tuvalde burun (560, 340), göğüs (560, 540) */
  burun: { x: HUB.zipzip.sol + 560, y: HUB.zipzip.ust + 340 } as Nokta,
  gogus: { x: HUB.zipzip.sol + 560, y: HUB.zipzip.ust + 540 } as Nokta,
  yaklasma: { x: HUB.zipzip.sol + 560, y: HUB.zipzip.ust + 330, olcek: 2.3 },
} as const;

// ——— yakın plan (anahtar kare: baş ekseni x 860, baş x 500…1220, y 110…760; önünde kâse x 600…1120, y 720…930)
export const BAS = {
  yuz: { x: 860, y: 430, yariEn: 360, yariBoy: 330 },
  burun: { x: 860, y: 470 } as Nokta,
  agiz: { x: 860, y: 540 } as Nokta,
  /** boynun önü: atkı buradan boydan boya geçer */
  boyun: { sol: 640, sag: 1080, ust: 640, alt: 760 },
  /** battaniye aşağıdan buraya kadar çekilir */
  gogus: { sol: 560, sag: 1160, ust: 760, alt: 1100 },
} as const;
export const MENDIL_KUTUSU = { kutu: { sol: 60, ust: 400, g: 360, y: 360 } as Kutu, agiz: { x: 240, y: 480 } as Nokta } as const;
export const KASE = {
  kutu: { sol: 600, ust: 660, g: 520, y: 300 } as Kutu,
  /** suyun yüzü (kâse çiziminde (260, 100)) */
  yuz: { x: 860, y: 760 } as Nokta,
  /** demliğin ağzı ve kavanozun ağzı bu alandayken dökülür */
  ust: { sol: 620, ust: 380, g: 480, y: 360 } as Kutu,
} as const;
/** Raf (fonda sağ üstte): demlik ve papatya kavanozu durur */
export const RAF = { demlik: { x: 1690, y: 330 } as Nokta, kavanoz: { x: 1880, y: 360 } as Nokta, dugme: 240 } as const;

export type Asama = 'giris' | 'canta' | 'mendil' | 'hapsu' | 'sil' | 'dok' | 'papatya' | 'nefes' | 'atki' | 'ort' | 'kutlama' | 'son';
export const ASAMALAR: readonly Asama[] = ['giris', 'canta', 'mendil', 'hapsu', 'sil', 'dok', 'papatya', 'nefes', 'atki', 'ort', 'kutlama', 'son'];
/** Senaryonun sekiz adımı; mendil ve hapşırık her yakalamada yeniden döner */
export const ADIMLAR: readonly (readonly Asama[])[] = [['mendil'], ['hapsu'], ['sil'], ['dok'], ['papatya'], ['nefes'], ['atki'], ['ort']];

export interface Zorluk {
  /** yakalanacak hapşırık */ hapsu: number;
  /** hapşırığın penceresi: HAPŞU anında mendilin burnun önünde olması için tanınan süre (ms) */ pencere: number;
  /** burnu silme yolu (px) */ sil: number;
  /** demlikten dökülen su (ms, eğik tutarken) ve dökmek için gereken eğim (derece) */ dok: number; egim: number;
  /** papatya için kavanozu sallama (yön değiştirme) */ papatya: number;
  /** nefes al-ver sayısı ve bir nefesin en kısa tutuşu (ms) */ nefes: number; nefesMs: number;
}
export const ZORLUK: Record<Yas, Zorluk> = {
  '2-3': { hapsu: 1, pencere: 900, sil: 500, dok: 900, egim: 15, papatya: 3, nefes: 2, nefesMs: 500 },
  '4': { hapsu: 2, pencere: 700, sil: 700, dok: 1300, egim: 28, papatya: 4, nefes: 3, nefesMs: 650 },
  '5+': { hapsu: 3, pencere: 550, sil: 850, dok: 1600, egim: 32, papatya: 6, nefes: 3, nefesMs: 750 },
};
export const sonrakiAsama = (a: Asama): Asama => ASAMALAR[Math.min(ASAMALAR.length - 1, ASAMALAR.indexOf(a) + 1)];

// ——— aletler: çizimde (600 × 600) tutulan yer ve iş yapan uç, 0–1 oran
export type AletAdi = 'mendil' | 'demlik' | 'kavanoz' | 'atki' | 'battaniye';
export interface AletOlcu { g: number; y: number; tut: readonly [number, number]; uc: readonly [number, number]; kaldir?: number; }
export const ALETLER: Readonly<Record<AletAdi, AletOlcu>> = {
  mendil: { g: 300, y: 300, tut: [0.5, 120 / 600], uc: [0.5, 330 / 600] },
  demlik: { g: 400, y: 400, tut: [450 / 600, 300 / 600], uc: [90 / 600, 230 / 600] },
  kavanoz: { g: 300, y: 300, tut: [0.5, 420 / 600], uc: [0.5, 120 / 600] },
  atki: { g: 340, y: 340, tut: [0.5, 0.5], uc: [0.5, 0.5] },
  battaniye: { g: 360, y: 360, tut: [0.5, 150 / 600], uc: [0.5, 150 / 600], kaldir: 20 },
};
/** Şerit: atkı (0) ve battaniye (1); mendil kutusu, demlik ve kavanoz sahnede durur */
export const SERIT: readonly AletAdi[] = ['atki', 'battaniye'];
export const asamaAleti = (a: Asama): AletAdi | null =>
  (a === 'mendil' || a === 'hapsu' || a === 'sil' ? 'mendil' : a === 'dok' ? 'demlik' : a === 'papatya' ? 'kavanoz' : a === 'atki' ? 'atki' : a === 'ort' ? 'battaniye' : null);

/** Pamuk'un sözleri (emir yok: duygu ve tepki; assets/doktor/hapsu/ses/). Pamuk'un klonu kurulunca kaydedilir. */
export const SOZLER = {
  'pa-hap': 'Hap... hap... HAPŞU!',
  'pa-canta': 'Mendil var mı? Burnum gıdıklanıyor!',
  'pa-cirt': 'Cırt! Yumuşacık mendil!',
  'pa-yakala': 'Hapşu! Yakaladın!',
  'pa-kacti': 'Hi hi! Pamuklar uçtu!',
  'pa-sil': 'Burnum biraz rahatladı.',
  'pa-papatya': 'Mmm! Papatya kokusu!',
  'pa-nefes': 'Ohh... Burnum açılıyor!',
  'pa-sisik': 'Pöf! Çok uzun oldu!',
  'pa-atki': 'Atkım sıcacık!',
  'pa-esne': 'Uykum geldi... Mırr...',
  'pa-son': 'Hap... hap... Mırrr!',
} as const;
export type SozAdi = keyof typeof SOZLER;
export const EFEKTLER = ['h-cek', 'h-cirt', 'h-hapsu', 'h-pof', 'h-dok', 'h-papatya', 'h-nefes', 'h-ver', 'h-atki', 'h-mirr'] as const;
export type EfektAdi = (typeof EFEKTLER)[number];

// ——— mekaniklerin saf hesabı
const elipste = (p: Nokta, e: { x: number; y: number; yariEn: number; yariBoy: number }) => ((p.x - e.x) / e.yariEn) ** 2 + ((p.y - e.y) / e.yariBoy) ** 2 <= 1;
const kutuda = (p: Nokta, k: Kutu) => p.x >= k.sol && p.x <= k.sol + k.g && p.y >= k.ust && p.y <= k.ust + k.y;
export const yuzdeMi = (p: Nokta): boolean => elipste(p, BAS.yuz);
export const BURUN_YARICAPI = 120;
export const burundaMi = (p: Nokta): boolean => Math.hypot(p.x - BAS.burun.x, p.y - BAS.burun.y) <= BURUN_YARICAPI;
export const kaseUstundeMi = (p: Nokta): boolean => kutuda(p, KASE.ust);
export const KARE_SINIRI = 60;
const yolu = (yol: number) => Math.min(KARE_SINIRI, Math.max(0, yol));

/** Mendil çekme: parmak kutunun ağzından yukarı (ve biraz yana) uzaklaştıkça mendil uzar; eşikte "cırt" kopar. */
export const CEK_ESIGI = 200;
export const cekmeUzunlugu = (parmak: Nokta): number => Math.max(0, MENDIL_KUTUSU.agiz.y - parmak.y) + Math.max(0, Math.abs(parmak.x - MENDIL_KUTUSU.agiz.x) - 60) * 0.3;
export const cekmeKaresi = (uzunluk: number): 0 | 1 | 2 => (Math.min(2, Math.floor((uzunluk / CEK_ESIGI) * 3)) as 0 | 1 | 2);

/**
 * Hapşırık döngüsü: burun kaşınır (hap-0), baş geri gider (hap-1), HAPŞU; sonra kısa dinlenme. Çocuğun işi HAPŞU anında
 * mendili burnun önünde tutmak. Süreler ms.
 */
export const HAPSU_DONGU = { hap0: 700, hap1: 600, hapsu: 380, dinlen: 900 } as const;
export type HapsuEvresi = 'hap0' | 'hap1' | 'hapsu' | 'dinlen';
export function hapsuEvresi(t: number): HapsuEvresi {
  const D = HAPSU_DONGU, n = D.hap0 + D.hap1 + D.hapsu + D.dinlen, d = ((t % n) + n) % n;
  return d < D.hap0 ? 'hap0' : d < D.hap0 + D.hap1 ? 'hap1' : d < D.hap0 + D.hap1 + D.hapsu ? 'hapsu' : 'dinlen';
}
/** HAPŞU anında mendil yakalar mı: mendilin ortası burnun önünde ya da HAPŞU'dan önceki pencere içinde oraya gelmişse */
export const yakaladiMi = (mendilBurunda: boolean, burundaGecen: number, pencere: number): boolean => mendilBurunda || burundaGecen <= pencere;

export const silAdimi = (birikim: number, burunda: boolean, yol: number, dt: number, hedef: number): number =>
  (burunda ? Math.min(hedef, birikim + yolu(yol) + dt * 0.04) : birikim);

/** Demlik: ağzı kâsenin üstündeyken parmak aşağı indikçe eğilir (yukarı kalkınca doğrulur), kâsenin dışında yavaşça doğrulur. */
export const EGIM_EN = 70;
export function egimAdimi(egim: number, ustunde: boolean, dy: number, dt: number): number {
  if (!ustunde) return Math.max(0, egim - dt * 0.12);
  return Math.max(0, Math.min(EGIM_EN, egim + dy * 0.6));
}
/** Dökülen su: eğim eşiği geçince akar; ne kadar eğikse o kadar hızlı */
export const dokAdimi = (birikim: number, egim: number, esik: number, dt: number, hedef: number): number =>
  (egim >= esik ? Math.min(hedef, birikim + dt * (0.6 + 0.4 * (egim / EGIM_EN))) : birikim);
/** Kâsenin su kademesi (0 boş … 3 dolu) */
export const kaseKademesi = (dokulen: number, hedef: number): 0 | 1 | 2 | 3 => (Math.min(3, Math.ceil((dokulen / Math.max(1, hedef)) * 3)) as 0 | 1 | 2 | 3);

/** Yön değiştirme sayacı (kavanozu sallama: dikey) */
export interface SallaDurumu { sayi: number; yon: -1 | 0 | 1; tepe: number | null; uc: number | null; bekleme: number; }
export const sallaBaslangici = (): SallaDurumu => ({ sayi: 0, yon: 0, tepe: null, uc: null, bekleme: 0 });
export const SALLA_GENLIK = 45, SALLA_BEKLEME = 1500;
export function sallaAdimi(d: SallaDurumu, v: number, icinde: boolean, dt: number): SallaDurumu {
  if (!icinde) return { ...d, tepe: null, uc: null, yon: 0 };
  if (d.uc === null || d.tepe === null) return { ...d, tepe: v, uc: v };
  const dv = v - d.uc;
  let { sayi, yon, tepe, bekleme } = d;
  const yeni: -1 | 0 | 1 = Math.abs(dv) < 2 ? 0 : dv > 0 ? 1 : -1;
  if (yeni !== 0 && yon !== 0 && yeni !== yon) { if (Math.abs(d.uc - tepe) >= SALLA_GENLIK) { sayi++; bekleme = 0; } tepe = d.uc; }
  if (yeni !== 0) yon = yeni;
  bekleme += dt;
  if (bekleme >= SALLA_BEKLEME) { bekleme -= SALLA_BEKLEME; sayi++; }
  return { sayi, yon, tepe, uc: v, bekleme };
}
/** Kâsede yüzen papatya kademesi (0 yok … 3 çok) */
export const papatyaKademesi = (sayi: number, hedef: number): 0 | 1 | 2 | 3 => (Math.min(3, Math.ceil((sayi / Math.max(1, hedef)) * 3)) as 0 | 1 | 2 | 3);

/** Nefes: buhara bastırıp tutmak nefes almak, bırakmak vermek; en kısa tutuş dolmadan bırakılırsa sayılmaz. Çok uzun tutmak komik. */
export const NEFES_UZUN = 2600;
export function nefesBitti(tutulanMs: number, enKisa: number): 'kisa' | 'tamam' | 'uzun' { return tutulanMs < enKisa ? 'kisa' : tutulanMs >= NEFES_UZUN ? 'uzun' : 'tamam'; }

/** Atkı: boynun önünde gezilen en sol ve en sağ nokta arası; boynun eni kadar geçilince sarılır */
export interface AtkiDurumu { sol: number | null; sag: number | null; }
export const atkiBaslangici = (): AtkiDurumu => ({ sol: null, sag: null });
export function atkiAdimi(d: AtkiDurumu, p: Nokta): AtkiDurumu {
  const b = BAS.boyun;
  if (p.y < b.ust - 60 || p.y > b.alt + 60 || p.x < b.sol - 80 || p.x > b.sag + 80) return d;
  const x = Math.max(b.sol, Math.min(b.sag, p.x));
  return { sol: d.sol === null ? x : Math.min(d.sol, x), sag: d.sag === null ? x : Math.max(d.sag, x) };
}
export const atkiOrani = (d: AtkiDurumu): number => (d.sol === null || d.sag === null ? 0 : (d.sag - d.sol) / (BAS.boyun.sag - BAS.boyun.sol));
export const ATKI_TAMAM = 0.85;

/** Battaniye: göğsün eninde aşağıdan yukarı çekildikçe örtülür (0 açık … 1 göğse kadar) */
export function ortuAdimi(oran: number, p: Nokta): number {
  const g = BAS.gogus;
  if (p.x < g.sol || p.x > g.sag) return oran;
  return Math.max(oran, Math.min(1, (g.alt - p.y) / (g.alt - g.ust)));
}
export const ORTU_TAMAM = 0.9;

/** Yakın plandaki yüz ifadesi */
export type BasPozu = keyof typeof HAPSU.bas;
export interface BasDurumu { asama: Asama; evre: HapsuEvresi | null; sikikKalan: number; rahatKalan: number; kikirKalan: number; sisikKalan: number; nefes: 'al' | 'ver' | null; esneKalan: number; mirr: boolean; kirp: boolean; an: number; }
export function basPozu(d: BasDurumu): BasPozu {
  if (d.asama === 'kutlama' || d.asama === 'son') return 'gulen';
  if (d.mirr) return 'mirr';
  if (d.esneKalan > 0) return 'esne';
  if (d.sisikKalan > 0) return 'sisik';
  if (d.kikirKalan > 0) return 'kikir';
  if (d.nefes === 'al') return 'nefesAl';
  if (d.nefes === 'ver') return 'nefesVer';
  if (d.evre === 'hapsu') return 'hapsu';
  if (d.evre === 'hap1') return 'hap1';
  if (d.evre === 'hap0') return 'hap0';
  if (d.rahatKalan > 0) return 'rahat';
  if (d.sikikKalan > 0) return 'sikik';
  // beklerken burnu kaşınır (iki kare) ya da göz kırpar
  if (d.asama === 'mendil' || d.asama === 'sil' || d.asama === 'giris' || d.asama === 'canta') { const k = Math.floor(d.an / 140) % 24; if (k === 3) return 'kasin0'; if (k === 4) return 'kasin1'; }
  return d.kirp ? 'kirp' : 'uzgun';
}

export { SAHNE };
export const KAPANIS = { parlama: 400, kamera: 430, sevinc: 1150 } as const;
export const BURUN_DUGMESI: readonly [number, number] = [300, 240];
export const KUTU_DUGMESI = 360;
/** buhar düğmesi: kâse ve üstündeki buhar */
export const BUHAR_DUGMESI: Kutu = { sol: 600, ust: 560, g: 520, y: 380 };
