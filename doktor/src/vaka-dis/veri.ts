// Minik Doktor · ikinci vaka, baştan: "Mino'nun Kurabiyeli Dişleri" (ekip/senaryo/DOKTOR-VAKALAR.md, vaka 2). Barış'ın temel
// kuralına göre (KALITE-KURALLARI madde 0) dokuz adım; her adımda gerçek bir el hareketi ve onun kendi kareleri:
//   1 çenesini gıdıkla (kıkırdar, "Aaaa" diye ağzını açar) · 2 ışıklı ağız aynasını gezdir, saklı kırıntıları bul
//   3 dişlere tek tek dokun (her diş bir nota; Kino sayar) · 4 macun seç, fırçanın kıllarına boydan boya sürerek sık
//   5 ileri geri fırçala (köpük birikir, dişler hücre hücre temizlenir; 5+'ta dil de) · 6 bardağı ağzına götürüp su ver
//   7 şişik yanaklara sırayla dokun (çalkalar), kâseye "pfff" · 8 ip çubuğunu diş aralarında aşağı yukarı oynat
//   9 el aynasını tut: Mino parlak dişlerini görür, poz verir.
// Çizimler Astra'dan: Paket Doktor-Y2 (yeni); parça adları, ölçüleri ve kare dizileri ekip/senaryo/DOKTOR-Y2-PARCALAR.md ile
// birebirdir. Saf veri ve hesap: DOM yok, birim testleri buradan sınar. Eski kısa hâl doktor/src/dis/ içinde (klinik onu açar).
import { HUB, type Kutu, type Nokta, type Yas } from '../vaka/veri';

const dizi = (ad: string, n: number): string[] => Array.from({ length: n }, (_, i) => `${ad}-${i}`);
export const TATLAR = ['nane', 'portakal', 'muz'] as const;
export type Tat = (typeof TATLAR)[number];

/** Paketin 99 çizimi (assets/doktor/dis/<ad>.webp). Adlar Dikenli Pati'nin (assets/doktor/vaka/) adlarıyla çakışmaz. */
export const DISLER = {
  fon: 'agiz-fon', kase: dizi('tukur-kase', 3),
  /** yakın plandaki Mino: aynı baş, on yedi ifade (dişler, kırıntılar ve köpük ayrı katman) */
  bas: {
    kapali: 'mino-yakin-kapali', kapaliKirp: 'mino-yakin-kapali-kirp', dudak: 'mino-yakin-dudak', kikir0: 'mino-yakin-kikir-0', kikir1: 'mino-yakin-kikir-1',
    acik: 'mino-yakin-acik', acikKirp: 'mino-yakin-acik-kirp', acikKikir: 'mino-yakin-acik-kikir', acikSasir: 'mino-yakin-acik-sasir', dil: 'mino-yakin-dil',
    sisik: 'mino-yakin-sisik', sisikSol: 'mino-yakin-sisik-sol', sisikSag: 'mino-yakin-sisik-sag', puf: 'mino-yakin-puf',
    gulen: 'mino-yakin-gulen', gulenKirp: 'mino-yakin-gulen-kirp', poz: 'mino-yakin-poz',
  },
  disKirli: 'disler-kirli', disTemiz: 'disler-temiz', disParlak: 'disler-parlak',
  kirinti: dizi('kirinti', 4), kirintiParla: dizi('kirinti-parla', 2),
  uzgun: ['mino-uzgun-0', 'mino-uzgun-1'], uzgunKirp: 'mino-uzgun-kirp', sevinc: ['mino-sevinc-0', 'mino-sevinc-1'], son: ['mino-son-kurabiye', 'mino-son-uzat', 'mino-son-firca'],
  ayna: 'agiz-aynasi', aynaIsik: 'agiz-aynasi-isik', firca: 'firca', fircaMacunlu: TATLAR.map(t => 'firca-' + t),
  bardak: ['bardak-dolu', 'bardak-yari', 'bardak-bos'], ip: 'ip-cubugu', ipGergin: 'ip-cubugu-gergin', elAynasi: 'el-aynasi', elAynasiParlak: 'el-aynasi-parlak',
  macun: TATLAR.map(t => 'macun-' + t), macunSikik: TATLAR.map(t => `macun-${t}-sikik`),
  isikHalka: dizi('isik-halka', 2), disIsik: dizi('dis-isik', 2), nota: dizi('nota', 3),
  serit: TATLAR.map(t => dizi('serit-' + t, 3)), burunMacun: 'burun-macun',
  kopuk: dizi('dis-kopuk', 4), baloncuk: dizi('baloncuk', 3), baloncukPat: dizi('baloncuk-pat', 2),
  bardakSu: dizi('bardak-su', 3), pufSu: dizi('puf-su', 3), ipPit: dizi('ip-pit', 2), disParilti: dizi('dis-parilti', 3),
  yansima: 'ayna-yansima', gulusKalp: dizi('gulus-kalp', 2), kurabiye: 'kurabiye', kurabiyeIsirik: 'kurabiye-isirik',
} as const;
const duz = (x: unknown): string[] => (typeof x === 'string' ? [x] : Array.isArray(x) ? x.flatMap(duz) : x && typeof x === 'object' ? Object.values(x).flatMap(duz) : []);
export const DISLER_DOSYALAR: readonly string[] = duz(DISLER);

const boyut = (adlar: readonly string[], b: readonly [number, number]) => Object.fromEntries(adlar.map(a => [a, b]));
/** Çizimlerin tuval boyutu (px). */
export const TUVAL: Readonly<Record<string, readonly [number, number]>> = {
  'agiz-fon': [2048, 1152], ...boyut(DISLER.kase, [380, 270]),
  ...boyut(Object.values(DISLER.bas), [2048, 1152]), ...boyut([DISLER.disKirli, DISLER.disTemiz, DISLER.disParlak], [2048, 1152]),
  ...boyut(DISLER.kirinti, [120, 120]), ...boyut(DISLER.kirintiParla, [200, 200]),
  ...boyut([...DISLER.uzgun, DISLER.uzgunKirp, ...DISLER.sevinc, ...DISLER.son], [1000, 940]),
  ...boyut([DISLER.ayna, DISLER.aynaIsik, DISLER.firca, ...DISLER.fircaMacunlu, ...DISLER.bardak, DISLER.ip, DISLER.ipGergin, DISLER.elAynasi, DISLER.elAynasiParlak], [600, 600]),
  ...boyut([...DISLER.macun, ...DISLER.macunSikik], [300, 600]),
  ...boyut(DISLER.isikHalka, [400, 400]), ...boyut(DISLER.disIsik, [200, 240]), ...boyut(DISLER.nota, [160, 160]),
  ...boyut(DISLER.serit.flat(), [220, 70]), 'burun-macun': [200, 200],
  ...boyut(DISLER.kopuk, [300, 300]), ...boyut(DISLER.baloncuk, [160, 160]), ...boyut(DISLER.baloncukPat, [200, 200]),
  ...boyut(DISLER.bardakSu, [120, 400]), ...boyut(DISLER.pufSu, [500, 400]), ...boyut(DISLER.ipPit, [160, 160]), ...boyut(DISLER.disParilti, [240, 240]),
  'ayna-yansima': [300, 300], ...boyut(DISLER.gulusKalp, [160, 160]), kurabiye: [200, 200], 'kurabiye-isirik': [200, 200],
};
export const OPAK: readonly string[] = [DISLER.fon];
export const KARE_MS = { kikir: 140, halka: 160, parla: 110, isik: 120, nota: 200, baloncuk: 150, pat: 90, su: 90, puf: 110, pit: 90, parilti: 110, kalp: 200 } as const;

// ——— masa: Mino, Zıpzıp'ın yerinde durur (aynı tuval, aynı kutu); tuvalde baş merkezi (575, 300), ağız (575, 372)
export const MASA = {
  mino: HUB.zipzip,
  agiz: { x: HUB.zipzip.sol + 575, y: HUB.zipzip.ust + 372 } as Nokta,
  gogus: { x: HUB.zipzip.sol + 575, y: HUB.zipzip.ust + 560 } as Nokta,
  yaklasma: { x: HUB.zipzip.sol + 575, y: HUB.zipzip.ust + 340, olcek: 2.3 },
} as const;
export const AGIZ_DUGMESI: readonly [number, number] = [330, 224];

// ——— yakın plan (2048 × 1152): baş ekseni x 860, baş x 320…1400; açık ağız merkezi (860, 700)
export const AGIZ = {
  merkez: { x: 860, y: 700 } as Nokta,
  /** üst ve alt diş sırası: altışar diş, eşit genişlikte */
  ust: { sol: 610, ust: 585, g: 500, y: 105 } as Kutu, alt: { sol: 630, ust: 765, g: 460, y: 85 } as Kutu,
  dil: { x: 860, y: 735, yaricap: 110 }, burun: { x: 860, y: 505 } as Nokta,
  yanak: [{ x: 500, y: 640 }, { x: 1220, y: 640 }] as readonly Nokta[], yanakDugmesi: 260,
  /** gıdıklanan yer: çene ve yanakların altı */
  gidik: { x: 860, y: 850, rx: 420, ry: 150 },
  /** yüzün elipsi (el aynası buraya tutulur; macun buraya sıkılırsa burna sıçrar) */
  yuz: { x: 860, y: 520, rx: 520, ry: 400 },
} as const;
export const SIRA_DISI = 6, DIS_SAYISI = 12;
/** i. dişin merkezi: 0…5 üst sıra (soldan sağa), 6…11 alt sıra. */
export function disYeri(i: number): Nokta {
  const s = i < SIRA_DISI ? AGIZ.ust : AGIZ.alt, k = i % SIRA_DISI;
  return { x: s.sol + (s.g / SIRA_DISI) * (k + 0.5), y: s.ust + s.y / 2 };
}
/** p hangi dişin üstünde (kenarlarda 18 px pay); hiçbiri değilse −1. Fırçanın hücreleri de bunlardır. */
export function disBul(p: Nokta, pay = 18): number {
  for (const [bas, s] of [[0, AGIZ.ust], [SIRA_DISI, AGIZ.alt]] as const) {
    if (p.x < s.sol - pay || p.x > s.sol + s.g + pay || p.y < s.ust - pay || p.y > s.ust + s.y + pay) continue;
    return bas + Math.max(0, Math.min(SIRA_DISI - 1, Math.floor(((p.x - s.sol) / s.g) * SIRA_DISI)));
  }
  return -1;
}
const elipste = (p: Nokta, e: { x: number; y: number; rx: number; ry: number }): boolean => ((p.x - e.x) / e.rx) ** 2 + ((p.y - e.y) / e.ry) ** 2 <= 1;
export const gidiktaMi = (p: Nokta): boolean => elipste(p, AGIZ.gidik);
export const yuzdeMi = (p: Nokta): boolean => elipste(p, AGIZ.yuz);
/** Kurabiye kırıntıları: dişlerin üstünde ve aralarında yedi yer (yaşa göre ilk N'i). */
export const KIRINTILAR: readonly (Nokta & { cesit: number })[] = [
  { x: 700, y: 650, cesit: 0 }, { x: 1010, y: 640, cesit: 1 }, { x: 860, y: 800, cesit: 2 }, { x: 780, y: 620, cesit: 1 },
  { x: 960, y: 810, cesit: 0 }, { x: 640, y: 790, cesit: 2 }, { x: 1080, y: 660, cesit: 0 },
];
export const AYNA_YARICAPI = 110;
/** Fırçanın durduğu havlu (fonda sağda) ve fırça oradayken kılların üst yüzü (macun buraya sürülür). */
export const HAVLU = { firca: { x: 1730, y: 540 } as Nokta, fircaBoyu: 460 } as const;
export const KILLAR = { sol: HAVLU.firca.x - 230 + (60 / 600) * 460, sag: HAVLU.firca.x - 230 + (260 / 600) * 460, y: HAVLU.firca.y - 230 + (230 / 600) * 460, pay: 80 } as const;
export const killardaMi = (p: Nokta): boolean => p.x >= KILLAR.sol - 30 && p.x <= KILLAR.sag + 30 && Math.abs(p.y - KILLAR.y) <= KILLAR.pay;
/** Tükürme kâsesi (solda önde) ve suyun püskürdüğü yer. */
export const KASE = { kutu: { sol: 40, ust: 650, g: 380, y: 270 } as Kutu, agiz: { x: 230, y: 730 } as Nokta } as const;
/** Diş araları (ip çubuğu): üst sıranın beş aralığı; yaşa göre ortadan başlayarak N'i. */
export const ARALIKLAR: readonly Nokta[] = [3, 2, 4, 1, 5].map(k => ({ x: AGIZ.ust.sol + (AGIZ.ust.g / SIRA_DISI) * k, y: AGIZ.ust.ust + AGIZ.ust.y / 2 }));
export const ARALIK_ENI = 46;
export const aralikBul = (p: Nokta, adet: number): number => ARALIKLAR.slice(0, adet).findIndex(a => Math.abs(p.x - a.x) <= ARALIK_ENI && p.y >= AGIZ.ust.ust - 60 && p.y <= AGIZ.alt.ust + AGIZ.alt.y + 40);

export type Asama = 'giris' | 'canta' | 'gidik' | 'ayna' | 'say' | 'macun' | 'firca' | 'su' | 'calkala' | 'ip' | 'gulus' | 'kutlama' | 'son';
export const ASAMALAR: readonly Asama[] = ['giris', 'canta', 'gidik', 'ayna', 'say', 'macun', 'firca', 'su', 'calkala', 'ip', 'gulus', 'kutlama', 'son'];
/** Senaryonun dokuz adımı. */
export const ADIMLAR: readonly Asama[] = ['gidik', 'ayna', 'say', 'macun', 'firca', 'su', 'calkala', 'ip', 'gulus'];
export const sonrakiAsama = (a: Asama): Asama => ASAMALAR[Math.min(ASAMALAR.length - 1, ASAMALAR.indexOf(a) + 1)];

export interface Zorluk {
  /** gıdıklama: parmak yolu (px) */ gidik: number; /** bulunacak kırıntı */ kirinti: number; /** dokunulacak (sayılacak) diş */ say: number;
  /** macun: kılların üstünde tüple gidilecek yol (px) */ macun: number;
  /** fırça: bir dişi temizleyen yol (px), temizlenecek diş sayısı, dil fırçalanır mı */ dis: number; temiz: number; dil: boolean;
  /** su: bardağın ağızda tutulacağı süre (ms); çalkalama: yanak dokunuşu */ su: number; calkala: number;
  /** ip: aralık sayısı ve aralık başına aşağı yukarı vuruş */ aralik: number; vurus: number; /** el aynasının yüze tutulacağı süre (ms) */ gulus: number;
}
export const ZORLUK: Record<Yas, Zorluk> = {
  '2-3': { gidik: 450, kirinti: 3, say: 4, macun: 110, dis: 90, temiz: 6, dil: false, su: 600, calkala: 2, aralik: 2, vurus: 2, gulus: 600 },
  '4': { gidik: 700, kirinti: 5, say: 6, macun: 140, dis: 130, temiz: 10, dil: false, su: 900, calkala: 4, aralik: 3, vurus: 3, gulus: 900 },
  '5+': { gidik: 900, kirinti: 7, say: 8, macun: 150, dis: 160, temiz: 12, dil: true, su: 1100, calkala: 6, aralik: 5, vurus: 3, gulus: 1100 },
};

// ——— adımların saf hesabı
/** Gıdıklama: parmak gıdık yerinde gezdikçe birikir; durunca yavaşça söner (Mino yine ağzını kapatır). */
export const GIDIK_SONME = 0.12;
export const gidikAdimi = (birikim: number, yol: number, dt: number, hedef: number): number => Math.max(0, Math.min(hedef, birikim + Math.min(60, yol) - (yol < 0.5 ? dt * GIDIK_SONME : 0)));
export type GidikPozu = 'kapali' | 'kapaliKirp' | 'dudak' | 'kikir0' | 'kikir1';
export function gidikPozu(oran: number, an: number): GidikPozu {
  if (oran < 0.15) return an % 3000 < 140 ? 'kapaliKirp' : 'kapali';
  if (oran < 0.5) return 'dudak';
  return Math.floor(an / KARE_MS.kikir) % 2 ? 'kikir1' : 'kikir0';
}
/** Sayılan n. dişin notası (ses hızı): her dişte bir basamak yükselir. */
export const notaHizi = (n: number): number => 1 + 0.12 * Math.max(0, n - 1);
/** Macun şeridinin kademesi (0: yok … 3: boydan boya). */
export const seritKademesi = (yol: number, hedef: number): number => Math.max(0, Math.min(3, Math.floor((yol / hedef) * 3)));
/** Fırça: i. dişin üstünde gidilen yol birikir; hedefe ulaşınca o diş temizdir. */
export function fircaAdimi(yollar: number[], dis: number, yol: number, hedef: number): boolean {
  if (dis < 0 || yollar[dis] >= hedef) return false;
  yollar[dis] = Math.min(hedef, yollar[dis] + Math.min(50, yol));
  return yollar[dis] >= hedef;
}
export const temizSayisi = (yollar: readonly number[], hedef: number): number => yollar.filter(y => y >= hedef).length;
export const DIL_YOLU = 320;
/** Bardağın karesi: su verildikçe boşalır. */
export const bardakKaresi = (oran: number): 0 | 1 | 2 => (oran < 0.45 ? 0 : oran < 1 ? 1 : 2);
export const AGIZ_MENZILI = 170;
/** Hangi yanak (0 sol, 1 sağ); hiçbiri değilse −1. */
export const yanakBul = (p: Nokta): number => AGIZ.yanak.findIndex(y => Math.hypot(p.x - y.x, p.y - y.y) <= AGIZ.yanakDugmesi / 2 + 20);
/** Çalkalama: su bir yanaktan öbürüne geçtikçe sayılır; aynı yanağa üst üste dokunmak saymaz (komik: su fışkırır). */
export interface Calkala { sayi: number; son: number; }
export const calkalaBaslangici = (): Calkala => ({ sayi: 0, son: -1 });
export const calkalaAdimi = (c: Calkala, yanak: number): Calkala & { sayildi: boolean } => (yanak < 0 || yanak === c.son ? { ...c, sayildi: false } : { sayi: c.sayi + 1, son: yanak, sayildi: true });
/** İp: aralıkta aşağı yukarı gidiş gelişler sayılır (yön her değiştiğinde bir vuruş; en az 36 px). */
export interface IpVurusu { sayi: number; uc: number; yon: number; }
export const IP_ADIMI = 36;
export const ipBaslangici = (y: number): IpVurusu => ({ sayi: 0, uc: y, yon: 0 });
export function ipAdimi(v: IpVurusu, y: number): IpVurusu {
  const fark = y - v.uc;
  if (v.yon === 0) return Math.abs(fark) >= IP_ADIMI ? { sayi: 1, uc: y, yon: Math.sign(fark) } : v;
  if (Math.sign(fark) === v.yon || fark === 0) return { ...v, uc: y };
  return Math.abs(fark) >= IP_ADIMI ? { sayi: v.sayi + 1, uc: y, yon: -v.yon } : v;
}

// ——— aletler: tuvalde (600 × 600; macun 300 × 600) tutulan yer ve iş yapan uç, 0–1 oran
export type AletAdi = 'ayna' | 'firca' | 'bardak' | 'ip' | 'elAynasi' | `macun-${Tat}`;
export interface AletOlcu { g: number; y: number; tut: readonly [number, number]; uc: readonly [number, number]; kaldir?: number; }
const tup: AletOlcu = { g: 180, y: 360, tut: [0.5, 200 / 600], uc: [0.5, 570 / 600], kaldir: 0 };
export const ALETLER: Readonly<Record<AletAdi, AletOlcu>> = {
  ayna: { g: 400, y: 400, tut: [0.5, 480 / 600], uc: [0.5, 130 / 600] },
  firca: { g: HAVLU.fircaBoyu, y: HAVLU.fircaBoyu, tut: [450 / 600, 290 / 600], uc: [160 / 600, 230 / 600] },
  bardak: { g: 360, y: 360, tut: [330 / 600, 360 / 600], uc: [140 / 600, 150 / 600] },
  ip: { g: 340, y: 340, tut: [0.5, 480 / 600], uc: [0.5, 90 / 600] },
  elAynasi: { g: 440, y: 440, tut: [0.5, 490 / 600], uc: [0.5, 220 / 600] },
  'macun-nane': tup, 'macun-portakal': tup, 'macun-muz': tup,
};
export const asamaAleti = (a: Asama): 'ayna' | 'macun' | 'firca' | 'bardak' | 'ip' | 'elAynasi' | null =>
  (a === 'ayna' ? 'ayna' : a === 'macun' ? 'macun' : a === 'firca' ? 'firca' : a === 'su' ? 'bardak' : a === 'ip' ? 'ip' : a === 'gulus' ? 'elAynasi' : null);
export const KAPANIS = { parlama: 450, kamera: 430, sevinc: 1100 } as const;

/** Sözler (duygu ve tepki; emir yok). Kayıtlar 23 Kasım'da geldi (Mino'nun klonuyla 14 söz, Kino'nun 2 sözü;
 *  assets/doktor/dis/ses/, klinik oturumu kaydetti, Scribe'dan geçti): 16 sözün ve 12 efektin hepsinin dosyası var. */
export const SOZLER = {
  'mn-mmm': 'Mmm! Açmam!', 'mn-canta': 'Aa, doktor çantası!', 'mn-gidik': 'Hi hi hi! Gıdıklanıyorum!', 'mn-aaa': 'Aaaa!',
  'mn-kirinti': 'Kurabiyem orada kalmış!', 'mn-tin': 'Dişlerim şarkı söylüyor!', 'mn-macun': 'Mis gibi kokuyor!', 'mn-burun': 'Burnuma macun geldi!',
  'mn-kopuk': 'Köpük köpük oldum!', 'mn-su': 'Glu glu glu!', 'mn-puf': 'Pfff!', 'mn-ip': 'Bir tane daha çıktı!', 'mn-parlak': 'Dişlerim pırıl pırıl!', 'mn-son': 'Bir kurabiye... Sonra yine fırça!',
  'kn-say': 'Bir, iki, üç... Sayalım!', 'kn-aferin': 'Tertemiz oldu!',
} as const;
/** Efektler: eski kısa hâlin altı kaydı (assets/doktor/dis/ses/) ve Dikenli Pati'ninkiler. Yeni hareketlerin efektleri kayıt bekliyor. */
export const EFEKTLER = ['d-blup', 'd-fener', 'd-fircala', 'd-fist', 'd-isilti', 'd-likir', 'e-tingir', 'e-pit', 'e-his', 'l-su', 'p-sip', 'z-kikir'] as const;
