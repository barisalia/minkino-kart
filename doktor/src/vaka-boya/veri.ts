// Minik Doktor · dördüncü vaka: "Mila'nın Boya Lekeleri" (ekip/senaryo/DOKTOR-VAKALAR.md, vaka 4). Aynı klinik masası,
// sekiz adım (Barış'ın temel kuralı, 23 Kasım: her adımda gerçek el hareketi ve gerçek animasyon):
//   1 sabunu kovanın kenarındaki süngere sürterek köpürt · 2 süngerle lekeleri ov (köpük rengini alır) · 3 kirlenen süngeri
//   kovada sağa sola çalkala (2 ile 3 gidip gelir) · 4 pamuklu çubukla benekleri nokta nokta al · 5 spreyle püskürt
//   6 havluyla kurula (tüy kabarır) · 7 kovadan yükselen sabun baloncuklarını patlat · 8 aynayı tut (Mila kendini görür).
// Çizimler Astra'dan: anahtar kare Paket Doktor-Y4 (CLAUDE-ASTRA-MESAJLAR.md, 22 Kasım 23:55); parça adları, ölçüleri ve kare
// dizileri ekip/senaryo/DOKTOR-Y3-Y4-PARCALAR.md ile birebirdir (anahtar kare onaylanınca Astra'ya o metin gider).
// Saf veri ve hesap: DOM yok, birim testleri buradan sınar.
import { HUB, SAHNE, VAKA, type Kutu, type Nokta, type Yas } from '../vaka/veri';

const dizi = (ad: string, n: number, ilk = 0): string[] => Array.from({ length: n }, (_, i) => `${ad}-${i + ilk}`);

/** Paketin 83 çizimi (assets/doktor/boya/<ad>.webp). */
export const BOYA = {
  fon: 'boya-fon', kova: 'kova', kovaSu: dizi('kova-su', 3, 1), damla: 'damla', kovaDalga: dizi('kova-dalga', 3), kovaSicrama: dizi('kova-sicrama', 3),
  /** yakın plandaki Mila (baş, omuzlar, iki pati): aynı gövde, on iki ifade; lekeler, ıslak ve kabaran tüy ayrı katmanda */
  bas: {
    kikir: 'mila-yakin-kikir', kirp: 'mila-yakin-kirp', sikik: 'mila-yakin-sikik', saskin: 'mila-yakin-saskin', gulen: 'mila-yakin-gulen', gidik: 'mila-yakin-gidik',
    bakis: 'mila-yakin-bakis', ayna: 'mila-yakin-ayna', iyy: 'mila-yakin-iyy', pati0: 'mila-yakin-pati-0', pati1: 'mila-yakin-pati-1', mor: 'mila-yakin-mor',
  },
  lekeler: 'lekeler', burunMor: 'burun-mor', islak: 'islak', tuyKabarik: 'tuy-kabarik',
  boyali: ['mila-boyali-0', 'mila-boyali-1'], boyaliKirp: 'mila-boyali-kirp', sevinc: ['mila-sevinc-0', 'mila-sevinc-1'], saka: 'mila-saka', sakaKikir: 'mila-saka-kikir',
  sabun: 'sabun', sabunKopuklu: 'sabun-kopuklu', sunger: 'sunger', sungerKopuk: dizi('sunger-kopuk', 2, 1), sungerKirli: dizi('sunger-kirli', 2, 1), sungerSikis: 'sunger-sikis',
  kopukler: { beyaz: 'kopuk-beyaz', sari: 'kopuk-sari', mavi: 'kopuk-mavi', yesil: 'kopuk-yesil', mor: 'kopuk-mor' }, kopukPof: dizi('kopuk-pof', 3),
  baloncuk: dizi('baloncuk', 2), baloncukPatla: dizi('baloncuk-patla', 3), baloncukUcan: 'baloncuk-ucan',
  cubuk: 'cubuk', cubukBoyali: 'cubuk-boyali', benekler: ['benek-turuncu', 'benek-mavi'], benekPit: dizi('benek-pit', 2),
  sprey: 'sprey-sise', spreyBasili: 'sprey-sise-basili', sis: dizi('sis', 3), damlaSuzul: dizi('damla-suzul', 3),
  havluKuru: 'havlu-kuru', havluIslak: 'havlu-islak', havluOvus: dizi('havlu-ovus', 2), tuyPof: dizi('tuy-pof', 2),
  ayna: 'ayna', aynaParilti: dizi('ayna-parilti', 3), kalp: dizi('kalp', 2),
} as const;
export const BOYA_DOSYALAR: readonly string[] = Object.values(BOYA).flatMap(v => (typeof v === 'string' ? [v] : Array.isArray(v) ? [...v] : Object.values(v as Record<string, string>)));
export const ORTAK = { hubFon: VAKA.hubFon, cantaKapali: VAKA.cantaKapali, cantaAcik: VAKA.cantaAcik, serit: VAKA.serit, pof: VAKA.pof, yildiz: VAKA.yildiz } as const;
export const ORTAK_DOSYALAR: readonly string[] = Object.values(ORTAK).flat();

const boyut = (adlar: readonly string[], b: readonly [number, number]) => Object.fromEntries(adlar.map(a => [a, b]));
export const TUVAL: Readonly<Record<string, readonly [number, number]>> = {
  'boya-fon': [2048, 1152], kova: [420, 420], ...boyut(BOYA.kovaSu, [420, 420]), damla: [60, 80], ...boyut(BOYA.kovaDalga, [420, 420]), ...boyut(BOYA.kovaSicrama, [300, 300]),
  ...boyut(Object.values(BOYA.bas), [2048, 1152]), lekeler: [2048, 1152], 'burun-mor': [2048, 1152], islak: [2048, 1152], 'tuy-kabarik': [2048, 1152],
  ...boyut([...BOYA.boyali, BOYA.boyaliKirp, ...BOYA.sevinc, BOYA.saka, BOYA.sakaKikir], [1000, 940]),
  sabun: [600, 600], 'sabun-kopuklu': [600, 600], sunger: [600, 600], ...boyut(BOYA.sungerKopuk, [600, 600]), ...boyut(BOYA.sungerKirli, [600, 600]), 'sunger-sikis': [600, 600],
  ...boyut(Object.values(BOYA.kopukler), [300, 300]), ...boyut(BOYA.kopukPof, [300, 300]),
  ...boyut(BOYA.baloncuk, [240, 240]), ...boyut(BOYA.baloncukPatla, [240, 240]), 'baloncuk-ucan': [300, 300],
  cubuk: [600, 600], 'cubuk-boyali': [600, 600], ...boyut(BOYA.benekler, [90, 90]), ...boyut(BOYA.benekPit, [120, 120]),
  'sprey-sise': [600, 600], 'sprey-sise-basili': [600, 600], ...boyut(BOYA.sis, [300, 300]), ...boyut(BOYA.damlaSuzul, [80, 200]),
  'havlu-kuru': [600, 600], 'havlu-islak': [600, 600], ...boyut(BOYA.havluOvus, [600, 600]), ...boyut(BOYA.tuyPof, [240, 240]),
  ayna: [600, 600], ...boyut(BOYA.aynaParilti, [300, 300]), ...boyut(BOYA.kalp, [160, 160]),
};
export const OPAK: readonly string[] = [BOYA.fon];
export const KARE_MS = { dalga: 110, sicrama: 80, pof: 80, patla: 75, pit: 90, sis: 85, suzul: 260, ovus: 140, tuy: 120, parilti: 110, kalp: 160, baloncuk: 260, pati: 150 } as const;

// ——— masa
export const MASA = {
  mila: HUB.zipzip,
  yuz: { x: HUB.zipzip.sol + 560, y: HUB.zipzip.ust + 330 } as Nokta,
  gogus: { x: HUB.zipzip.sol + 560, y: HUB.zipzip.ust + 540 } as Nokta,
  yaklasma: { x: HUB.zipzip.sol + 560, y: HUB.zipzip.ust + 360, olcek: 2.3 },
} as const;

// ——— yakın plan
export type Renk = 'sari' | 'mavi' | 'yesil' | 'mor';
export interface Leke { renk: Renk; x: number; y: number; r: number; yer: string; }
export const LEKELER: readonly Leke[] = [
  { renk: 'mavi', x: 1090, y: 500, r: 110, yer: 'yanak' },
  { renk: 'yesil', x: 760, y: 820, r: 100, yer: 'sol pati' },
  { renk: 'sari', x: 880, y: 230, r: 110, yer: 'alın' },
  { renk: 'mor', x: 1000, y: 820, r: 100, yer: 'sağ pati' },
];
export const BURUN: Leke = { renk: 'mor', x: 880, y: 450, r: 70, yer: 'burun' };
/** Küçük benekler: burnun çevresi (turuncu) ve sol kulağın arkası (mavi), sırayla birer birer. */
export const BENEKLER: readonly (Nokta & { renk: 0 | 1 })[] = [
  { x: 840, y: 440, renk: 0 }, { x: 600, y: 230, renk: 1 }, { x: 920, y: 455, renk: 0 }, { x: 640, y: 280, renk: 1 }, { x: 880, y: 500, renk: 0 }, { x: 575, y: 340, renk: 1 },
];
export const BENEK_BOYU = 70;
export const YUZ = { x: 880, y: 440, yariEn: 390, yariBoy: 350 } as const;
export const PATILER: Kutu = { sol: 620, ust: 700, g: 520, y: 220 };
export const KOVA = {
  kutu: { sol: 40, ust: 400, g: 420, y: 420 } as Kutu,
  yuz: { x: 250, y: 530 } as Nokta,
  su: { x: 250, y: 590, yariEn: 180, yariBoy: 120 },
  /** sabunlanacak sünger kovanın kenarında durur */
  sunger: { x: 250, y: 380 } as Nokta,
  sungerBoyu: 300,
} as const;
/** Baloncuklar kovadan yükselip yüzün çevresinde süzülür: duracakları yerler (yaşa göre ilk n tanesi) */
export const BALONCUKLAR: readonly Nokta[] = [
  { x: 1300, y: 300 }, { x: 460, y: 250 }, { x: 1340, y: 660 }, { x: 420, y: 560 }, { x: 1140, y: 140 }, { x: 610, y: 120 }, { x: 1460, y: 460 },
];
export const BALONCUK_BOYU = 220;

export type Asama = 'giris' | 'canta' | 'kopurt' | 'ov' | 'calkala' | 'cubuk' | 'pisk' | 'kurula' | 'baloncuk' | 'ayna' | 'kutlama' | 'son';
export const ASAMALAR: readonly Asama[] = ['giris', 'canta', 'kopurt', 'ov', 'calkala', 'cubuk', 'pisk', 'kurula', 'baloncuk', 'ayna', 'kutlama', 'son'];
export const ADIMLAR: readonly (readonly Asama[])[] = [['kopurt'], ['ov'], ['calkala'], ['cubuk'], ['pisk'], ['kurula'], ['baloncuk'], ['ayna']];

export interface Zorluk {
  leke: number; benek: number; calkala: number; pis: number; ovma: number;
  /** sabunu süngere sürtme sayısı (yön değiştirme) */ kopurt: number;
  /** patlatılacak baloncuk */ baloncuk: number;
  /** aynanın yüze tutulma süresi (ms) */ ayna: number;
}
export const ZORLUK: Record<Yas, Zorluk> = {
  '2-3': { leke: 2, benek: 0, calkala: 3, pis: 2, ovma: 70, kopurt: 4, baloncuk: 3, ayna: 700 },
  '4': { leke: 4, benek: 4, calkala: 4, pis: 3, ovma: 90, kopurt: 6, baloncuk: 5, ayna: 900 },
  '5+': { leke: 4, benek: 6, calkala: 5, pis: 4, ovma: 110, kopurt: 8, baloncuk: 7, ayna: 1000 },
};
export const asamalar = (yas: Yas): Asama[] => ASAMALAR.filter(a => a !== 'cubuk' || ZORLUK[yas].benek > 0);
/** Çalkalama ovmanın içinde gidip gelir; sıradaki aşama bu yüzden ikisini birlikte atlar. */
export const sonrakiAsama = (yas: Yas, a: Asama): Asama => {
  const l = asamalar(yas).filter(x => x !== 'calkala');
  const i = l.indexOf(a === 'calkala' ? 'ov' : a);
  return l[Math.min(l.length - 1, i + 1)];
};
export const secilenLekeler = (yas: Yas): Leke[] => LEKELER.slice(0, ZORLUK[yas].leke);

// ——— aletler
export type AletAdi = 'sabun' | 'sunger' | 'cubuk' | 'sprey' | 'havlu' | 'ayna';
export interface Alet { ad: AletAdi; g: number; y: number; tut: readonly [number, number]; uc: readonly [number, number]; }
export const ALETLER: Readonly<Record<AletAdi, Alet>> = {
  sabun: { ad: 'sabun', g: 300, y: 300, tut: [0.5, 310 / 600], uc: [0.5, 310 / 600] },
  sunger: { ad: 'sunger', g: 300, y: 300, tut: [0.5, 0.35], uc: [0.5, 0.5] },
  cubuk: { ad: 'cubuk', g: 380, y: 380, tut: [0.5, 0.8], uc: [0.5, 60 / 600] },
  sprey: { ad: 'sprey', g: 380, y: 380, tut: [0.6, 0.72], uc: [130 / 600, 140 / 600] },
  havlu: { ad: 'havlu', g: 340, y: 340, tut: [0.5, 0.3], uc: [0.5, 0.55] },
  ayna: { ad: 'ayna', g: 380, y: 380, tut: [0.5, 560 / 600], uc: [0.5, 220 / 600] },
};
/** Şeritteki yuvalar: sabun (köpürtünce yerine sünger), çubuk (sonra ayna), sprey, havlu. */
export const ALET_SIRASI: readonly AletAdi[] = ['sabun', 'cubuk', 'sprey', 'havlu'];
export const asamaAleti = (a: Asama): AletAdi | null =>
  (a === 'kopurt' ? 'sabun' : a === 'ov' || a === 'calkala' ? 'sunger' : a === 'cubuk' ? 'cubuk' : a === 'pisk' ? 'sprey' : a === 'kurula' ? 'havlu' : a === 'ayna' ? 'ayna' : a === 'baloncuk' ? null : null);
export const SIS_UZAKLIGI = 170;
export const sisNoktasi = (uc: Nokta): Nokta => ({ x: uc.x - SIS_UZAKLIGI, y: uc.y + 10 });

export const SOZLER = {
  'mi-boya': 'Parmak boyası yaptım! Her yerim renk renk! Hi hi!',
  'mi-canta': 'Aa! Sünger! Köpük!',
  'mi-kopuk': 'Köpük köpük! Baloncuklar uçuyor!',
  'mi-gidik': 'Hi hi! Köpük gıdıklıyor!',
  'mi-renk': 'Köpük de boyandı!',
  'mi-kirli': 'Sünger rengârenk oldu!',
  'mi-mor': 'Hi hi! Burnum mor oldu!',
  'mi-pit': 'Pıt pıt! Benekler gidiyor!',
  'mi-serin': 'Iyy! Serin serin!',
  'mi-yumusak': 'Mmm, yumuşacık havlu!',
  'mi-baloncuk': 'Baloncuk! Ben de patlatacağım!',
  'mi-temiz': 'Tertemiz oldum!',
} as const;
export type SozAdi = keyof typeof SOZLER;
export const KINO_SOZU = 'k-mila'; // "Mila, Mila! Yine mi boya?" (Scribe ile denetli)
export const EFEKTLER = ['y-ov', 'y-calkala', 'y-pit', 'y-pis', 'y-havlu', 'y-sikis', 'y-sapir', 'y-sabun', 'y-baloncuk', 'y-ayna'] as const;
export type EfektAdi = (typeof EFEKTLER)[number];
export const ORTAK_EFEKTLER = ['e-cit', 'e-tik', 'e-vuu', 'e-pof', 'e-cin', 'e-pat', 'e-hihi'] as const;

// ——— mekaniklerin saf hesabı

const elipste = (p: Nokta, e: { x: number; y: number; yariEn: number; yariBoy: number }) => ((p.x - e.x) / e.yariEn) ** 2 + ((p.y - e.y) / e.yariBoy) ** 2 <= 1;
const kutuda = (p: Nokta, k: Kutu) => p.x >= k.sol && p.x <= k.sol + k.g && p.y >= k.ust && p.y <= k.ust + k.y;
export const mildaMi = (p: Nokta): boolean => elipste(p, YUZ) || kutuda(p, PATILER);
export const kovadaMi = (p: Nokta): boolean => elipste(p, KOVA.su);
/** Sabun süngerin üstünde mi (sürtülen yer) */
export const SUNGER_ALANI = 170;
export const sungerdeMi = (p: Nokta): boolean => Math.hypot(p.x - KOVA.sunger.x, p.y - KOVA.sunger.y) <= SUNGER_ALANI;
/** Ayna yüzün önünde mi (camın ortası) */
export const aynadaMi = (p: Nokta): boolean => elipste(p, { x: YUZ.x, y: YUZ.y - 40, yariEn: YUZ.yariEn * 0.8, yariBoy: YUZ.yariBoy * 0.75 });

export const KARE_SINIRI = 60;
const yolu = (yol: number) => Math.min(KARE_SINIRI, Math.max(0, yol));

export const LEKE_HUCRE = 36;
export const SUNGER_YARICAPI = 120;
export const OVMA_BEKLEME = 0.05;
export interface LekeIzgarasi { lekeler: Leke[]; merkezler: Nokta[]; leke: Int8Array; deger: Float32Array; }
export function lekeIzgarasi(lekeler: readonly Leke[]): LekeIzgarasi {
  const merkezler: Nokta[] = [], hangi: number[] = [];
  for (let y = LEKE_HUCRE / 2; y < SAHNE.y; y += LEKE_HUCRE) for (let x = LEKE_HUCRE / 2; x < SAHNE.g; x += LEKE_HUCRE) {
    const i = lekeler.findIndex(l => Math.hypot(x - l.x, y - l.y) <= l.r);
    if (i >= 0) { merkezler.push({ x, y }); hangi.push(i); }
  }
  return { lekeler: [...lekeler], merkezler, leke: Int8Array.from(hangi), deger: new Float32Array(merkezler.length) };
}
export function lekeEkle(iz: LekeIzgarasi, l: Leke): LekeIzgarasi {
  const yeni = lekeIzgarasi([l]);
  const i = iz.lekeler.length;
  return {
    lekeler: [...iz.lekeler, l],
    merkezler: [...iz.merkezler, ...yeni.merkezler],
    leke: Int8Array.from([...iz.leke, ...yeni.merkezler.map(() => i)]),
    deger: Float32Array.from([...iz.deger, ...yeni.deger]),
  };
}
export function ovAdimi(iz: LekeIzgarasi, p: Nokta, yol: number, dt: number, ovma: number): number[] {
  const art = (yolu(yol) + dt * OVMA_BEKLEME) / ovma;
  const sayi = iz.lekeler.map(() => 0);
  iz.merkezler.forEach((m, i) => {
    if (iz.deger[i] >= 1 || Math.hypot(m.x - p.x, m.y - p.y) > SUNGER_YARICAPI) return;
    iz.deger[i] = Math.min(1, iz.deger[i] + art);
    if (iz.deger[i] >= 1) sayi[iz.leke[i]]++;
  });
  return sayi;
}
export function lekeBul(iz: LekeIzgarasi, p: Nokta): number {
  let en = -1, u = Infinity;
  iz.merkezler.forEach((m, i) => { if (iz.deger[i] < 1) { const d = Math.hypot(m.x - p.x, m.y - p.y); if (d <= SUNGER_YARICAPI && d < u) { u = d; en = iz.leke[i]; } } });
  return en;
}
export const lekeOrani = (iz: LekeIzgarasi, i: number): number => { let n = 0, t = 0; iz.leke.forEach((l, j) => { if (l === i) { t++; if (iz.deger[j] >= 1) n++; } }); return t ? n / t : 1; };
export const toplamOran = (iz: LekeIzgarasi): number => (iz.merkezler.length ? iz.deger.filter(v => v >= 1).length / iz.merkezler.length : 1);
export const LEKE_TAMAM = 0.9;
export const lekeBittiMi = (iz: LekeIzgarasi, i: number): boolean => lekeOrani(iz, i) >= LEKE_TAMAM;
export const KIRLENME = 0.85;
export const kirSiniri = (iz: LekeIzgarasi, lekeSayisi: number): number => Math.max(6, Math.round((iz.merkezler.length / Math.max(1, lekeSayisi)) * KIRLENME));
/** Süngerin kirlilik kademesi (0 temiz, 1 biraz, 2 çok): kir sınırının yarısında birinci kademe */
export const kirKademesi = (kir: number, sinir: number): 0 | 1 | 2 => (kir >= sinir ? 2 : kir >= sinir / 2 ? 1 : 0);
/** Kovanın su rengi kademesi (0 berrak … 3 koyu): yıkama sayısına göre */
export const suKademesi = (yikama: number, toplamYikama: number): 0 | 1 | 2 | 3 => (Math.min(3, Math.ceil((yikama / Math.max(1, toplamYikama)) * 3)) as 0 | 1 | 2 | 3);

/** Yön değiştirme sayacı (kovada çalkalama, sabunu süngere sürtme): en az genlik kadar gidip dönmek bir sayılır. */
export interface CalkalaDurumu { sayi: number; yon: -1 | 0 | 1; tepe: number | null; uc: number | null; bekleme: number; }
export const calkalaBaslangici = (): CalkalaDurumu => ({ sayi: 0, yon: 0, tepe: null, uc: null, bekleme: 0 });
export const CALKALA_GENLIK = 60;
export const CALKALA_BEKLEME = 1500;
export function gidipGelAdimi(d: CalkalaDurumu, x: number, icinde: boolean, dt: number, genlik = CALKALA_GENLIK, beklemeMs = CALKALA_BEKLEME): CalkalaDurumu {
  if (!icinde) return { ...d, tepe: null, uc: null, yon: 0 };
  if (d.uc === null || d.tepe === null) return { ...d, tepe: x, uc: x };
  const dx = x - d.uc;
  let { sayi, yon, tepe, bekleme } = d;
  const yeniYon: -1 | 0 | 1 = Math.abs(dx) < 2 ? 0 : dx > 0 ? 1 : -1;
  if (yeniYon !== 0 && yon !== 0 && yeniYon !== yon) {
    if (Math.abs(d.uc - tepe) >= genlik) { sayi++; bekleme = 0; }
    tepe = d.uc;
  }
  if (yeniYon !== 0) yon = yeniYon;
  bekleme += dt;
  if (bekleme >= beklemeMs) { bekleme -= beklemeMs; sayi++; }
  return { sayi, yon, tepe, uc: x, bekleme };
}
export const calkalaAdimi = (d: CalkalaDurumu, p: Nokta, dt: number): CalkalaDurumu => gidipGelAdimi(d, p.x, kovadaMi(p), dt);
export const KOPURT_GENLIK = 50;
export const kopurtAdimi = (d: CalkalaDurumu, p: Nokta, dt: number): CalkalaDurumu => gidipGelAdimi(d, p.x, sungerdeMi(p), dt, KOPURT_GENLIK);
/** Süngerdeki köpük kademesi (0 kuru, 1 biraz, 2 kabarık) */
export const kopukKademesi = (sayi: number, hedef: number): 0 | 1 | 2 => (sayi >= hedef ? 2 : sayi >= hedef / 2 ? 1 : 0);

export const BENEK_MS = 110;
export const BENEK_YARICAPI = 60;
export function benekAdimi(kalan: number[], benekler: readonly Nokta[], uc: Nokta, dt: number): { kalan: number[]; alinanlar: number[] } {
  const yeni = [...kalan];
  const alinanlar: number[] = [];
  benekler.forEach((b, i) => {
    if (yeni[i] <= 0) return;
    if (Math.hypot(b.x - uc.x, b.y - uc.y) <= BENEK_YARICAPI) { yeni[i] = Math.max(0, yeni[i] - dt); if (yeni[i] === 0) alinanlar.push(i); }
    else yeni[i] = BENEK_MS;
  });
  return { kalan: yeni, alinanlar };
}

export interface OvmaSayaci { x: { yon: -1 | 0 | 1; tepe: number | null; uc: number | null }; y: { yon: -1 | 0 | 1; tepe: number | null; uc: number | null }; sayi: number; }
export const ovmaSayaciBaslangici = (): OvmaSayaci => ({ x: { yon: 0, tepe: null, uc: null }, y: { yon: 0, tepe: null, uc: null }, sayi: 0 });
export const OVMA_GENLIGI = 40;
export const YANLIS_OVMA = 2;
export function ovmaSayaciAdimi(d: OvmaSayaci, p: Nokta): OvmaSayaci {
  let sayi = d.sayi;
  const eksen = (e: OvmaSayaci['x'], v: number): OvmaSayaci['x'] => {
    if (e.uc === null || e.tepe === null) return { yon: 0, tepe: v, uc: v };
    const fark = v - e.uc;
    const yon: -1 | 0 | 1 = Math.abs(fark) < 2 ? 0 : fark > 0 ? 1 : -1;
    let tepe = e.tepe;
    if (yon !== 0 && e.yon !== 0 && yon !== e.yon) { if (Math.abs(e.uc - tepe) >= OVMA_GENLIGI) sayi++; tepe = e.uc; }
    return { yon: yon || e.yon, tepe, uc: v };
  };
  const x = eksen(d.x, p.x), y = eksen(d.y, p.y);
  return { x, y, sayi };
}

export const PIS_ARALIGI = 140;
export const PIS_MS = 380;
export interface PisDurumu { son: Nokta | null; bekleme: number; sayi: number; }
export const pisBaslangici = (): PisDurumu => ({ son: null, bekleme: 0, sayi: 0 });
export function pisAdimi(d: PisDurumu, sis: Nokta, dt: number): { d: PisDurumu; pis: boolean } {
  if (!mildaMi(sis)) return { d: { ...d, bekleme: 0 }, pis: false };
  const uzak = !d.son || Math.hypot(sis.x - d.son.x, sis.y - d.son.y) >= PIS_ARALIGI;
  const bekleme = d.bekleme + dt;
  if (uzak || bekleme >= PIS_MS) return { d: { son: sis, bekleme: 0, sayi: d.sayi + 1 }, pis: true };
  return { d: { ...d, bekleme }, pis: false };
}
export const PIS_YARICAPI = 230;

export interface Damla extends Nokta { kalan: number; }
export const KURULA_YOLU = 70;
export const HAVLU_YARICAPI = 150;
export const KURULA_BEKLEME = 0.05;
export function kurulaAdimi(damlalar: Damla[], p: Nokta, yol: number, dt: number): number[] {
  const emilen: number[] = [];
  damlalar.forEach((d, i) => {
    if (d.kalan <= 0 || Math.hypot(d.x - p.x, d.y - p.y) > HAVLU_YARICAPI) return;
    d.kalan = Math.max(0, d.kalan - yolu(yol) - dt * KURULA_BEKLEME);
    if (d.kalan === 0) emilen.push(i);
  });
  return emilen;
}
export const PIS_DAMLASI = 2, EN_COK_DAMLA = 12;

/** Ayna: camın ortası yüzün önündeyken birikir; çekilince olduğu yerde kalır. */
export const aynaAdimi = (birikim: number, onunde: boolean, dt: number, hedef: number): number => (onunde ? Math.min(hedef, birikim + dt) : birikim);

/** Yakın plandaki yüz ifadesi. */
export type BasPozu = keyof typeof BOYA.bas;
export const SIKIK_MS = 500, SASKIN_MS = 650, KIKIR_MS = 900, IYY_MS = 600, GIDIK_MS = 700, MOR_MS = 1200, PATI_MS = 600;
export interface BasDurumu { asama: Asama; sikikKalan: number; saskinKalan: number; iyyKalan: number; gidikKalan: number; morKalan: number; patiKalan: number;
  /** ayna yüzün önündeyken 0–1 (yarıyı geçince poz verir) */ ayna: number; kirp: boolean; an: number; }
export function basPozu(d: BasDurumu): BasPozu {
  if (d.asama === 'kutlama' || d.asama === 'son') return 'gulen';
  if (d.ayna > 0) return d.ayna >= 0.5 ? 'ayna' : 'bakis';
  if (d.morKalan > 0) return 'mor';
  if (d.patiKalan > 0) return Math.floor(d.an / 150) % 2 ? 'pati1' : 'pati0';
  if (d.iyyKalan > 0) return 'iyy';
  if (d.saskinKalan > 0) return 'saskin';
  if (d.gidikKalan > 0) return 'gidik';
  if (d.sikikKalan > 0) return 'sikik';
  return d.kirp ? 'kirp' : 'kikir';
}

export { SAHNE };

export const KAPANIS = { parlama: 380, kamera: 430, sevinc: 1150 } as const;
export const YUZ_DUGMESI: readonly [number, number] = [330, 260];
/** Kovanın kenarındaki süngerin ve baloncukların dokunma kutusu (en küçük ekranda da 64 px) */
export const SUNGER_DUGMESI = 260;
export const BALONCUK_DUGMESI = 220;
