// Minik Doktor · dokuzuncu vaka: "Bulut'un Uğur Böceği" (ekip/senaryo/DOKTOR-VAKALAR.md, vaka 9). Bulut'un uzun kulağının dış
// tüylerinde bir uğur böceği geziyor; Bulut gıdıklanıp kıkırdıyor. Böceğe dokunan alet yok: cımbız yok, ezmek yok. Kulağın içine hiçbir
// şey girmez; her şey dış tüyde olur. Sekiz adım, her birinin kendi el hareketi, animasyonu ve efekti:
//   1 büyüteci kulakta gezdir, kıpırdayan tüyün arkasındaki böceği bul (gözüne tutarsan kocaman göz: Bulut irkilir)
//   2 tüy tutamlarını parmakla iki yana arala; böcek saklambaç oynar, başka tutamın arkasına koşar
//   3 yeşil yaprağı böceğe yavaşça yaklaştır (hızlı gelirse kabuğuna büzülür); böcek yaprağa yürür
//   4 yaprağı pencereye sarsmadan taşı (sallarsan yaprağın altına saklanır; durunca çıkar)
//   5 pervazda yukarı doğru çek: kanatlarını açar, uçar; dönüp Kino'nun burnuna konar, Kino hapşırır, böcek pencereden gider,
//     Bulut el sallar
//   6 kulağın tüylerini yumuşak fırçayla kökten uca tara (ters tararsan tüyler dikilir)
//   7 kulağın ucunu tutup yukarı aşağı salla: "flap flap" (çok sert sallarsan kulak gözlerinin üstüne düşer)
//   8 böcek iki arkadaşıyla teşekküre gelir: her birine dokun, kanat çırpıp kalp çizerek uçarlar
// Çizimler Astra'dan: anahtar kare Paket Doktor-Y9 (CLAUDE-ASTRA-MESAJLAR.md, 22 Kasım 23:55 ve 23 Kasım eki); parça adları,
// ölçüleri ve kare dizileri ekip/senaryo/DOKTOR-Y7-Y9-PARCALAR.md ile birebirdir. Saf veri ve hesap: DOM yok.
import { ALETLER as Y1_ALETLER, HUB, SAHNE, VAKA, mercekCapi, type Kutu, type Nokta, type Yas } from '../vaka/veri';

const dizi = (ad: string, n: number, ilk = 0): string[] => Array.from({ length: n }, (_, i) => `${ad}-${i + ilk}`);

/** Paketin 82 çizimi (assets/doktor/bocek/<ad>.webp). Büyüteç Y1'den aynen (assets/doktor/vaka/buyutec). */
export const BOCEK = {
  fon: 'bocek-fon',
  /** yakın plandaki Bulut'un başı (yandan, kulaksız; kulak ayrı katman): aynı baş, on altı ifade */
  bas: {
    uzgun: 'bulut-yan-uzgun', kirp: 'bulut-yan-kirp', kasin0: 'bulut-yan-kasin-0', kasin1: 'bulut-yan-kasin-1', kikir: 'bulut-yan-kikir', gidik: 'bulut-yan-gidik',
    sasir: 'bulut-yan-sasir', merak: 'bulut-yan-merak', irkil: 'bulut-yan-irkil', sessiz: 'bulut-yan-sessiz', salla0: 'bulut-yan-salla-0', salla1: 'bulut-yan-salla-1',
    kor: 'bulut-yan-kor', ohh: 'bulut-yan-ohh', mutlu: 'bulut-yan-mutlu', gulen: 'bulut-yan-gulen',
  },
  /** uzun kulağın dış yüzü: başta dağınık; taranınca düzgün; sallanırken yukarı / aşağı; çok sert sallanınca gözlerin üstünde */
  kulak: { dagik: 'kulak', tarali: 'kulak-tarali', yukari: 'kulak-yukari', asagi: 'kulak-asagi', gozde: 'kulak-gozde' },
  tutam: 'tutam', tutamAralik: 'tutam-aralik', tutamDik: 'tutam-dik', tuyUcusan: dizi('tuy-ucusan', 2), kipirti: dizi('kipirti', 2), tuyParilti: dizi('tuy-parilti', 3), gidik: dizi('kulak-gidik', 2),
  bak: dizi('bocek-bak', 3), yuru: dizi('bocek-yuru', 4), saklan: dizi('bocek-saklan', 2), otur: dizi('bocek-otur', 2), kanat: dizi('bocek-kanat', 3), uc: dizi('bocek-uc', 3),
  burun: 'bocek-burun', selam: dizi('bocek-selam', 2),
  arkadasA: dizi('arkadas-a', 2), arkadasB: dizi('arkadas-b', 2), arkadasAUc: 'arkadas-a-uc', arkadasBUc: 'arkadas-b-uc',
  yaprak: 'yaprak', yaprakBocekli: dizi('yaprak-bocekli', 2), yaprakSaklanmis: 'yaprak-saklanmis', yaprakSalla: dizi('yaprak-salla', 2), yaprakPervazda: 'yaprak-pervazda',
  firca: 'firca', fircaIz: dizi('firca-iz', 3),
  dal: dizi('pencere-dal', 2), kalp: dizi('bocek-kalp', 2),
  uzgun: ['bulut-kulak-uzgun-0', 'bulut-kulak-uzgun-1'], uzgunKirp: 'bulut-kulak-uzgun-kirp', sevinc: ['bulut-kulak-sevinc-0', 'bulut-kulak-sevinc-1'], son: ['bulut-kulak-son-salla', 'bulut-kulak-son-kikir'],
} as const;
export const BOCEK_DOSYALAR: readonly string[] = Object.values(BOCEK).flatMap(v => (typeof v === 'string' ? [v] : Array.isArray(v) ? [...v] : Object.values(v as Record<string, string>)));
/** Y1'den aynen kullanılan büyüteç */
export const PAYLASILAN: readonly string[] = [VAKA.buyutec];

const boyut = (adlar: readonly string[], b: readonly [number, number]) => Object.fromEntries(adlar.map(a => [a, b]));
const TAM = [SAHNE.g, SAHNE.y] as const;
export const BOCEK_BOYU = 150;
export const TUTAM_BOYU = 280;
export const TUVAL: Readonly<Record<string, readonly [number, number]>> = {
  'bocek-fon': TAM, ...boyut(Object.values(BOCEK.bas), TAM), ...boyut(Object.values(BOCEK.kulak), TAM),
  ...boyut([BOCEK.tutam, BOCEK.tutamAralik, BOCEK.tutamDik], [TUTAM_BOYU, TUTAM_BOYU]), ...boyut(BOCEK.tuyUcusan, [300, 300]), ...boyut(BOCEK.kipirti, [300, 300]),
  ...boyut(BOCEK.tuyParilti, [300, 300]), ...boyut(BOCEK.gidik, [400, 300]),
  ...boyut([...BOCEK.bak, ...BOCEK.yuru, ...BOCEK.saklan, ...BOCEK.otur, ...BOCEK.kanat, ...BOCEK.uc, BOCEK.burun, ...BOCEK.selam], [200, 200]),
  ...boyut([...BOCEK.arkadasA, ...BOCEK.arkadasB, BOCEK.arkadasAUc, BOCEK.arkadasBUc], [200, 200]),
  yaprak: [600, 600], ...boyut(BOCEK.yaprakBocekli, [600, 600]), 'yaprak-saklanmis': [600, 600], ...boyut(BOCEK.yaprakSalla, [600, 600]), 'yaprak-pervazda': [400, 300],
  firca: [600, 600], ...boyut(BOCEK.fircaIz, [400, 200]),
  ...boyut(BOCEK.dal, [500, 480]), ...boyut(BOCEK.kalp, [160, 160]),
  ...boyut([...BOCEK.uzgun, BOCEK.uzgunKirp, ...BOCEK.sevinc, ...BOCEK.son], [1000, 940]),
};
export const OPAK: readonly string[] = [BOCEK.fon];
export const KARE_MS = { kipirti: 160, bak: 140, yuru: 90, saklan: 120, otur: 420, kanat: 100, uc: 70, ucan: 120, gidik: 140, iz: 110, parilti: 90, dal: 900, kalp: 200, salla: 300, selam: 220, arkadas: 260 } as const;

// ——— masa (Zıpzıp'ın yerinde, aynı tuval): Bulut sedyede oturmuş, kulağını kaşıyıp kıkırdıyor
export const MASA = {
  bulut: HUB.zipzip,
  /** dokunulacak yer kulağı, yıldız göğsünden kalkar; tuvalde kulak (720, 250), göğüs (520, 560) */
  kulak: { x: HUB.zipzip.sol + 720, y: HUB.zipzip.ust + 250 } as Nokta,
  gogus: { x: HUB.zipzip.sol + 520, y: HUB.zipzip.ust + 560 } as Nokta,
  yaklasma: { x: HUB.zipzip.sol + 700, y: HUB.zipzip.ust + 260, olcek: 2.4 },
} as const;

// ——— yakın plan (anahtar kare: kulak x 520…1320, y 200…860; yüz solda x 60…560, y 160…700; açık pencere sağ üstte x 1500…2000, y 40…520)
export const BAS = { yuz: { x: 310, y: 430 } as Nokta, goz: { x: 330, y: 360 } as Nokta, GOZ_YARICAPI: 110 } as const;
export const KULAK = { x: 920, y: 530, yariEn: 400, yariBoy: 330 } as const;
/** üç tüy tutamı (böceğin saklandığı yerler) ve kovalamaca bitince böceğin oturduğu açık yer */
export const TUTAMLAR: readonly Nokta[] = [{ x: 760, y: 420 }, { x: 960, y: 610 }, { x: 1150, y: 470 }];
export const ACIK_YER: Nokta = { x: 1000, y: 400 };
export const PENCERE: Kutu = { sol: 1500, ust: 40, g: 500, y: 480 };
/** pervazda yaprağın yeri */
export const PERVAZ: Nokta = { x: 1740, y: 470 };
/** üç böceğin pervazdaki yerleri (teşekkür) */
export const SELAM_YERLERI: readonly Nokta[] = [{ x: 1610, y: 450 }, { x: 1750, y: 430 }, { x: 1890, y: 450 }];
/** fırçanın üç bandı: kökten (sol) uca (sağ) */
export const BANTLAR: readonly { y: number; sol: number; sag: number }[] = [{ y: 410, sol: 640, sag: 1240 }, { y: 530, sol: 620, sag: 1260 }, { y: 650, sol: 640, sag: 1220 }];
export const BANT_YARIM = 60, BANT_TAMAM = 0.85;
/** kulağın ucu: tutup yukarı aşağı sallanır */
export const KULAK_UCU: Nokta = { x: 1260, y: 560 };
export const KULAK_UCU_DUGMESI = 300;
/** yakın plandaki Kino'nun (Y1 pozları, YAKIN.kino kutusu) burnu: böcek buraya konar */
export const KINO_BURUN: Nokta = { x: 1780, y: 930 };

export type Asama = 'giris' | 'canta' | 'bul' | 'arala' | 'yaprak' | 'tasi' | 'ucur' | 'firca' | 'salla' | 'selam' | 'kutlama' | 'son';
export const ASAMALAR: readonly Asama[] = ['giris', 'canta', 'bul', 'arala', 'yaprak', 'tasi', 'ucur', 'firca', 'salla', 'selam', 'kutlama', 'son'];
export const ADIMLAR: readonly Asama[] = ['bul', 'arala', 'yaprak', 'tasi', 'ucur', 'firca', 'salla', 'selam'];
export const sonrakiAsama = (a: Asama): Asama => ASAMALAR[Math.min(ASAMALAR.length - 1, ASAMALAR.indexOf(a) + 1)];

export interface Zorluk {
  /** büyüteçle bulma: camın ortası tutamın bu yarıçapında bu kadar tutulur (ms) */ bulR: number; bulMs: number;
  /** tüyler aralanınca böceğin kaçışı (sonra açıkta oturur) */ kacis: number;
  /** yaprağı yaklaştırma: böceğin 300 px yakınında bundan hızlı gelirse böcek büzülür (px/ms); yaprağa yürümek için tutuş */ yavas: number; yaklasR: number; yaklasMs: number;
  /** taşırken sarsıntı sınırı (px/ms) */ sarsinti: number;
  /** taranacak bant ve kulak sallama */ bant: number; salla: number;
}
export const ZORLUK: Record<Yas, Zorluk> = {
  '2-3': { bulR: 150, bulMs: 400, kacis: 1, yavas: 1.6, yaklasR: 140, yaklasMs: 350, sarsinti: 3.2, bant: 2, salla: 2 },
  '4': { bulR: 120, bulMs: 550, kacis: 2, yavas: 1.1, yaklasR: 115, yaklasMs: 550, sarsinti: 2.2, bant: 3, salla: 3 },
  '5+': { bulR: 100, bulMs: 700, kacis: 3, yavas: 0.85, yaklasR: 100, yaklasMs: 700, sarsinti: 1.7, bant: 3, salla: 4 },
};

// ——— aletler: çizimde (600 × 600) tutulan yer ve iş yapan uç, 0–1 oran
export type AletAdi = 'buyutec' | 'yaprak' | 'firca';
export interface AletOlcu { g: number; y: number; tut: readonly [number, number]; uc: readonly [number, number]; kaldir?: number; }
export const BUYUTEC_BOYU = 560;
export const ALETLER: Readonly<Record<AletAdi, AletOlcu>> = {
  /** Y1'in büyüteci: aynı tutuş ve camın ortası */
  buyutec: { g: BUYUTEC_BOYU, y: BUYUTEC_BOYU, tut: Y1_ALETLER.buyutec.tut, uc: Y1_ALETLER.buyutec.uc },
  /** yaprak: sapından tutulur, böceğin bindiği yer yaprağın ortası (330, 250) */
  yaprak: { g: 320, y: 320, tut: [140 / 600, 520 / 600], uc: [330 / 600, 250 / 600] },
  /** yumuşak fırça: sapı altta, kılların ucu üstte (300, 110) */
  firca: { g: 300, y: 300, tut: [0.5, 500 / 600], uc: [0.5, 110 / 600] },
};
export const MERCEK = { cap: mercekCapi(BUYUTEC_BOYU), buyutme: 1.8 } as const;

/** Bulut'un sözleri (emir yok; assets/doktor/bocek/ses/). Bulut'un klonu yok: ses kararı Barış'ta, sahne sözsüz de akar. */
export const SOZLER = {
  'bu-canta': 'Kulağımda bir şey var! Hi hi!',
  'bu-buldun': 'Bir uğur böceği!',
  'bu-kacti': 'Kaçtı! Saklambaç oynuyor!',
  'bu-goz': 'Ay! Kocaman bir göz!',
  'bu-sakla': 'Şşş... Korkuttuk onu.',
  'bu-yaprak': 'Yaprağa bindi!',
  'bu-gule': 'Güle güle, uğur böceği!',
  'bu-ters': 'Hi hi! Tüylerim dikildi!',
  'bu-firca': 'Tüylerim yumuşacık.',
  'bu-flap': 'Flap flap! Kulağım uçuyor!',
  'bu-kor': 'Hi hi! Göremiyorum!',
  'bu-selam': 'Arkadaşlarını da getirmiş!',
  'bu-son': 'Ne uğurlu bir gün!',
} as const;
export type SozAdi = keyof typeof SOZLER;
export const EFEKTLER = ['u-tikir', 'u-cik', 'u-hisir', 'u-yaprak', 'u-saklan', 'u-vizz', 'u-firca', 'u-flap', 'u-cin', 'u-pervaz'] as const;
/** Kino'nun hapşırığı (Y6'da kaydedildi: assets/doktor/kanat/ses/k-hapsu) */
export const KINO_HAPSU = 'k-hapsu';

// ——— mekaniklerin saf hesabı
export const uzak = (a: Nokta, b: Nokta) => Math.hypot(a.x - b.x, a.y - b.y);
export const kulaktaMi = (p: Nokta): boolean => ((p.x - KULAK.x) / KULAK.yariEn) ** 2 + ((p.y - KULAK.y) / KULAK.yariBoy) ** 2 <= 1;
export const gozdeMi = (p: Nokta): boolean => uzak(p, BAS.goz) <= BAS.GOZ_YARICAPI;
export const penceredeMi = (p: Nokta): boolean => p.x >= PENCERE.sol && p.x <= PENCERE.sol + PENCERE.g && p.y >= PENCERE.ust && p.y <= PENCERE.ust + PENCERE.y;
/** Bulma: yarıçapın içinde tutulan süre birikir, dışında yavaşça söner */
export const bulmaAdimi = (birikim: number, uzaklik: number, yaricap: number, dt: number): number => (uzaklik <= yaricap ? birikim + dt : Math.max(0, birikim - dt * 0.5));
/** Tutam aralama: parmak tutamın üstünde basıp iki yana en az bu kadar gidince tüyler aralanır */
export const ARALA_BOY = 110;
export const aralandiMi = (basX: number, simdiX: number): boolean => Math.abs(simdiX - basX) >= ARALA_BOY;
/** Kaçış: böcek bulunduğu tutamdan başka bir tutama koşar (sırayla, aynı yere dönmez) */
export const kacisYeri = (simdi: number, tur: number): number => (simdi + 1 + (tur % 2)) % TUTAMLAR.length;
/** hız (px/ms) */
export const hiz = (yol: number, dt: number): number => yol / Math.max(1, dt);
/** Yaprak böceğin 300 px yakınında hızlı gelirse böcek büzülür */
export const URKME_ERIMI = 300;
export const urkerMi = (uzaklik: number, v: number, sinir: number): boolean => uzaklik <= URKME_ERIMI && v > sinir;
/** saklanmış böcek, yaprak bu kadar durgun kalınca (ms) çıkar */
export const DURGUN_MS = 500, DURGUN_HIZ = 0.25;

/** Fırça bandı: yalnız kökten uca (sağa) giden fırça bandı kaplar; ters gidiş tüyleri diker */
export interface BantDurumu { sol: number | null; sag: number | null; }
export const bantBaslangici = (): BantDurumu => ({ sol: null, sag: null });
export const bantBul = (p: Nokta): number => BANTLAR.findIndex(b => Math.abs(p.y - b.y) <= BANT_YARIM && p.x >= b.sol - 40 && p.x <= b.sag + 40);
export function bantAdimi(d: BantDurumu, i: number, once: Nokta, simdi: Nokta): { d: BantDurumu; ters: boolean } {
  const dx = simdi.x - once.x, b = BANTLAR[i];
  if (dx < -4) return { d, ters: true };
  if (dx <= 1) return { d, ters: false };
  const a = Math.max(b.sol, Math.min(b.sag, once.x)), z = Math.max(b.sol, Math.min(b.sag, simdi.x));
  return { d: { sol: d.sol === null ? a : Math.min(d.sol, a), sag: d.sag === null ? z : Math.max(d.sag, z) }, ters: false };
}
export const bantOrani = (d: BantDurumu, i: number): number => (d.sol === null || d.sag === null ? 0 : (d.sag - d.sol) / (BANTLAR[i].sag - BANTLAR[i].sol));

/** Kulak sallama: dikey yön değiştirme (en az genlik); başlangıçtan çok uzağa çekmek "çok sert" */
export interface SallaDurumu { sayi: number; yon: -1 | 0 | 1; tepe: number | null; uc: number | null; }
export const sallaBaslangici = (): SallaDurumu => ({ sayi: 0, yon: 0, tepe: null, uc: null });
export const SALLA_GENLIK = 60, SERT_SALLA = 300;
export function sallaAdimi(d: SallaDurumu, v: number): SallaDurumu {
  if (d.uc === null || d.tepe === null) return { ...d, tepe: v, uc: v };
  const dv = v - d.uc;
  let { sayi, yon, tepe } = d;
  const yeni: -1 | 0 | 1 = Math.abs(dv) < 2 ? 0 : dv > 0 ? 1 : -1;
  if (yeni !== 0 && yon !== 0 && yeni !== yon) { if (Math.abs(d.uc - tepe) >= SALLA_GENLIK) sayi++; tepe = d.uc; }
  if (yeni !== 0) yon = yeni;
  return { sayi, yon, tepe, uc: v };
}
export const sertMi = (basY: number, v: number): boolean => Math.abs(v - basY) >= SERT_SALLA;
/** sallarken kulağın pozu */
export const kulakPozu = (dy: number): 'yukari' | 'asagi' | 'tarali' => (dy > 25 ? 'asagi' : dy < -25 ? 'yukari' : 'tarali');

/** Uçuş yolu: pervazdan odada bir tur, Kino'nun burnuna (0…1) */
export function ucusNoktasi(t: number, bas: Nokta, son: Nokta): Nokta {
  const u = Math.min(1, Math.max(0, t));
  const orta = { x: (bas.x + son.x) / 2 - 500, y: Math.min(bas.y, son.y) - 120 };
  // ikinci dereceden Bezier ve üstüne küçük bir dalga (böcek dümdüz uçmaz)
  const x = (1 - u) ** 2 * bas.x + 2 * (1 - u) * u * orta.x + u ** 2 * son.x;
  const y = (1 - u) ** 2 * bas.y + 2 * (1 - u) * u * orta.y + u ** 2 * son.y + Math.sin(u * Math.PI * 4) * 40 * (1 - u);
  return { x, y };
}
/** Kalp yolu (teşekkür): kalp eğrisi, 0…1 */
export function kalpNoktasi(t: number, merkez: Nokta, boy: number): Nokta {
  const a = Math.PI * 2 * t;
  return { x: merkez.x + boy * 16 * Math.sin(a) ** 3 / 16, y: merkez.y - (boy * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a))) / 16 };
}

/** Yakın plandaki yüz ifadesi */
export type BasPozu = keyof typeof BOCEK.bas;
export interface BasDurumu {
  asama: Asama; sallaKalan: number; korKalan: number; irkilKalan: number; sasirKalan: number; kikirKalan: number; gidikKalan: number; ohhKalan: number;
  tasiyor: boolean; yakinda: boolean; kirp: boolean; an: number;
}
export function basPozu(d: BasDurumu): BasPozu {
  if (d.asama === 'kutlama' || d.asama === 'son') return 'gulen';
  if (d.sallaKalan > 0) return Math.floor(d.an / KARE_MS.salla) % 2 ? 'salla1' : 'salla0';
  if (d.korKalan > 0) return 'kor';
  if (d.irkilKalan > 0) return 'irkil';
  if (d.sasirKalan > 0) return 'sasir';
  if (d.gidikKalan > 0) return 'gidik';
  if (d.kikirKalan > 0) return 'kikir';
  if (d.ohhKalan > 0) return 'ohh';
  if (d.tasiyor) return 'sessiz';
  if (d.yakinda) return 'merak';
  if (d.kirp) return 'kirp';
  const i = ADIMLAR.indexOf(d.asama);
  if (i >= ADIMLAR.indexOf('firca')) return 'mutlu';
  // böcek kulaktayken ara ara kulağını kaşır (iki kare)
  const k = Math.floor(d.an / 150) % 26; if (k === 5) return 'kasin0'; if (k === 6) return 'kasin1';
  return 'uzgun';
}

export { SAHNE };
export const KAPANIS = { parlama: 400, kamera: 430, sevinc: 1150 } as const;
export const KULAK_DUGMESI: readonly [number, number] = [320, 300];
export const BOCEK_DUGMESI = 240;
export const TUTAM_DUGMESI = 240;
