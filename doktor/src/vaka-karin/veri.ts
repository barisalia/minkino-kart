// Minik Doktor · yedinci vaka: "Lokum'un Guruldayan Karnı" (ekip/senaryo/DOKTOR-VAKALAR.md, vaka 7). Lokum çok mandalina yemiş;
// karnı "gurrr" diye konuşuyor. Sekiz adım, her birinin kendi el hareketi, animasyonu ve efekti:
//   1 stetoskopu karında gezdir, gurultunun yerini bul (sıcak-soğuk: yaklaştıkça ses büyür, ekran titrer)
//   2 röntgen çerçevesini karnın üstünde kaydır, üç mandalina dilimini bul (başına tutarsan: aklı mandalinada!)
//   3 patileri hızlı hızlı sürterek ısıt (ısınmadan karna dokunursan: brr, buz gibi!)
//   4 ılık patilerle karnına yavaş daireler çiz (hızlı çizersen gıdıklanıp yuvarlanır)
//   5 papatya çayını kaşıkla karıştır (hızlı karıştırırsan çay sıçrar)
//   6 buharına aşağıdan yukarı üfle (Lokum da yanaklarını şişirip üfler)
//   7 fincanı ağzına götür, üç yudum (burnuna tutarsan koklar)
//   8 kalpli sıcak su torbasını karnına koy, pıt pıt vur; kuyruğunu sallar
// Masada şaka: "Hav!" der, karnından minik bir "gur" kaçar, kızarır.
// Çizimler Astra'dan: anahtar kare Paket Doktor-Y7 (CLAUDE-ASTRA-MESAJLAR.md, 22 Kasım 23:55 ve 23 Kasım eki); parça adları,
// ölçüleri ve kare dizileri ekip/senaryo/DOKTOR-Y7-Y9-PARCALAR.md ile birebirdir. Saf veri ve hesap: DOM yok.
import { HUB, SAHNE, type Kutu, type Nokta, type Yas } from '../vaka/veri';

const dizi = (ad: string, n: number, ilk = 0): string[] => Array.from({ length: n }, (_, i) => `${ad}-${i + ilk}`);

/** Paketin 80 çizimi (assets/doktor/karin/<ad>.webp). */
export const KARIN = {
  fon: 'karin-fon',
  /** yakın plandaki Lokum (sırtüstü, yukarıdan; bütün gövde): aynı gövde, on yedi ifade */
  bas: {
    uzgun: 'lokum-yakin-uzgun', kirp: 'lokum-yakin-kirp', gur: 'lokum-yakin-gur', kikir: 'lokum-yakin-kikir', gidik0: 'lokum-yakin-gidik-0', gidik1: 'lokum-yakin-gidik-1',
    utangac: 'lokum-yakin-utangac', rahat: 'lokum-yakin-rahat', yudum0: 'lokum-yakin-yudum-0', yudum1: 'lokum-yakin-yudum-1', koklar: 'lokum-yakin-koklar',
    hav: 'lokum-yakin-hav', mutlu0: 'lokum-yakin-mutlu-0', mutlu1: 'lokum-yakin-mutlu-1', gulen: 'lokum-yakin-gulen', usudu: 'lokum-yakin-usudu', ufler: 'lokum-yakin-ufler',
  },
  gurultu: dizi('karin-gurultu', 3), gurultuYeri: dizi('gurultu-yeri', 2), titreme: dizi('titreme', 2), gidikCizgi: dizi('gidik-cizgi', 2),
  steto: 'karin-steto', stetoDinle: 'karin-steto-dinle',
  cerceve: 'rontgen-cerceve', rontgen: 'karin-rontgen', dilim: dizi('rontgen-dilim', 2), dilimParilti: 'dilim-parilti',
  /** ovulan karnın ılık ışığı (karnın üstünde, saydam) */ karinIsik: 'karin-isik',
  eller: 'kino-eller', ellerSur: dizi('kino-eller-sur', 2), ellerSicak: 'kino-eller-sicak', sicakParilti: dizi('sicak-parilti', 3), ovIz: dizi('ov-iz', 3),
  fincan: dizi('fincan', 4), fincanEgik: 'fincan-egik', kasik: 'kasik', kasikKaristir: 'kasik-karistir',
  girdap: dizi('cay-girdap', 3), papatya: dizi('cay-papatya', 2), sicrama: dizi('cay-sicrama', 3), buhar: dizi('cay-buhar', 4), dagil: dizi('buhar-dagil', 3),
  torba: 'sicak-torba', torbaYerinde: 'sicak-torba-yerinde', torbaBas: dizi('sicak-torba-bas', 2), kalp: dizi('torba-kalp', 2),
  uzgun: ['lokum-uzgun-0', 'lokum-uzgun-1'], uzgunKirp: 'lokum-uzgun-kirp', sevinc: ['lokum-sevinc-0', 'lokum-sevinc-1'], son: ['lokum-son-hav', 'lokum-son-gur'],
} as const;
export const KARIN_DOSYALAR: readonly string[] = Object.values(KARIN).flatMap(v => (typeof v === 'string' ? [v] : Array.isArray(v) ? [...v] : Object.values(v as Record<string, string>)));

const boyut = (adlar: readonly string[], b: readonly [number, number]) => Object.fromEntries(adlar.map(a => [a, b]));
const TAM = [SAHNE.g, SAHNE.y] as const;
export const TUVAL: Readonly<Record<string, readonly [number, number]>> = {
  'karin-fon': TAM, ...boyut(Object.values(KARIN.bas), TAM), ...boyut(KARIN.gurultu, TAM), 'karin-rontgen': TAM, 'karin-isik': TAM,
  ...boyut(KARIN.gurultuYeri, [240, 240]), ...boyut(KARIN.titreme, [800, 600]), ...boyut(KARIN.gidikCizgi, [800, 600]),
  'karin-steto': [600, 600], 'karin-steto-dinle': [600, 600],
  'rontgen-cerceve': [600, 480], ...boyut(KARIN.dilim, [200, 200]), 'dilim-parilti': [300, 300],
  'kino-eller': [600, 600], ...boyut(KARIN.ellerSur, [600, 600]), 'kino-eller-sicak': [600, 600], ...boyut(KARIN.sicakParilti, [300, 300]), ...boyut(KARIN.ovIz, [300, 300]),
  ...boyut(KARIN.fincan, [400, 420]), 'fincan-egik': [400, 420], kasik: [600, 600], 'kasik-karistir': [600, 600],
  ...boyut(KARIN.girdap, [300, 160]), ...boyut(KARIN.papatya, [100, 100]), ...boyut(KARIN.sicrama, [300, 300]), ...boyut(KARIN.buhar, [300, 400]), ...boyut(KARIN.dagil, [400, 400]),
  'sicak-torba': [600, 600], 'sicak-torba-yerinde': [400, 400], ...boyut(KARIN.torbaBas, [400, 400]), ...boyut(KARIN.kalp, [160, 160]),
  ...boyut([...KARIN.uzgun, KARIN.uzgunKirp, ...KARIN.sevinc, ...KARIN.son], [1000, 940]),
};
export const OPAK: readonly string[] = [KARIN.fon];
export const KARE_MS = { gurultu: 220, yer: 260, titreme: 90, gidik: 150, dilim: 120, sur: 90, parilti: 90, iz: 120, girdap: 110, papatya: 160, sicrama: 80, buhar: 170, dagil: 110, torba: 110, kalp: 200, yudum: 260, mutlu: 220 } as const;

// ——— masa (Zıpzıp'ın yerinde, aynı tuval): Lokum sedyede oturmuş, karnını tutuyor
export const MASA = {
  lokum: HUB.zipzip,
  /** dokunulacak yer karnı, yıldız göğsünden kalkar; tuvalde karın (560, 560), göğüs (560, 470) */
  karin: { x: HUB.zipzip.sol + 560, y: HUB.zipzip.ust + 560 } as Nokta,
  gogus: { x: HUB.zipzip.sol + 560, y: HUB.zipzip.ust + 470 } as Nokta,
  yaklasma: { x: HUB.zipzip.sol + 560, y: HUB.zipzip.ust + 500, olcek: 2.2 },
} as const;

// ——— yakın plan (anahtar kare: baş üstte x 620…1100, y 40…420; yuvarlak karın ortada x 520…1200, y 400…880)
export const BAS = {
  bas: { x: 860, y: 230 } as Nokta, BAS_YARICAPI: 190,
  burun: { x: 860, y: 300 } as Nokta,
  agiz: { x: 860, y: 370 } as Nokta,
} as const;
export const KARIN_ELIPS = { x: 860, y: 640, yariEn: 340, yariBoy: 240 } as const;
/** gurultunun saklanabileceği üç yer (her oynayışta biri) */
export const GURULTU_YERLERI: readonly Nokta[] = [{ x: 720, y: 580 }, { x: 1000, y: 610 }, { x: 860, y: 770 }];
/** röntgende üç mandalina dilimi */
export const DILIMLER: readonly Nokta[] = [{ x: 740, y: 620 }, { x: 980, y: 660 }, { x: 860, y: 790 }];
export const DILIM_BOYU = 150;
/** röntgen çerçevesi: elde 420 × 336 (çizim 600 × 480, %70); içindeki pencere 322 × 238 (çizimde cam x 70…530, y 70…410) */
export const CERCEVE = { g: 420, y: 336, pencereG: 322, pencereY: 238 } as const;
/** papatya çayı solda: fincan çizimi x 60…460, y 400…820; çayın yüzü (260, 520), yarıçap 120; buhar onun üstünde */
export const FINCAN = { kutu: { sol: 60, ust: 400, g: 400, y: 420 } as Kutu, yuz: { x: 260, y: 520 } as Nokta, yaricap: 120 } as const;
export const BUHAR_DUGMESI: Kutu = { sol: 60, ust: 120, g: 400, y: 420 };
export const AGIZ_YARICAPI = 100, BURUN_YARICAPI = 70;

export type Asama = 'giris' | 'canta' | 'dinle' | 'rontgen' | 'isit' | 'ov' | 'karistir' | 'ufle' | 'ic' | 'torba' | 'kutlama' | 'son';
export const ASAMALAR: readonly Asama[] = ['giris', 'canta', 'dinle', 'rontgen', 'isit', 'ov', 'karistir', 'ufle', 'ic', 'torba', 'kutlama', 'son'];
export const ADIMLAR: readonly Asama[] = ['dinle', 'rontgen', 'isit', 'ov', 'karistir', 'ufle', 'ic', 'torba'];
export const sonrakiAsama = (a: Asama): Asama => ASAMALAR[Math.min(ASAMALAR.length - 1, ASAMALAR.indexOf(a) + 1)];

export interface Zorluk {
  /** gurultuyu bulma: stetoskobun yeri bu yarıçapta bu kadar tutulur (ms) */ dinleR: number; dinleMs: number;
  /** röntgende dilimin pencerenin ortasına yakınlığı ve tutuş */ dilimR: number; dilimMs: number;
  /** patileri ısıtmak için yön değiştirme */ isit: number;
  /** karında çizilecek daire (radyan) ve gıdıklamayan en yüksek dönüş hızı (radyan/ms) */ ov: number; ovHiz: number;
  /** çayı karıştırma (radyan) ve sıçratmayan hız */ karistir: number; karistirHiz: number;
  ufle: number; yudum: number; yudumMs: number; pat: number;
}
const TUR = Math.PI * 2;
export const ZORLUK: Record<Yas, Zorluk> = {
  '2-3': { dinleR: 170, dinleMs: 500, dilimR: 150, dilimMs: 300, isit: 4, ov: TUR, ovHiz: 0.014, karistir: TUR, karistirHiz: 0.024, ufle: 2, yudum: 2, yudumMs: 600, pat: 2 },
  '4': { dinleR: 130, dinleMs: 700, dilimR: 120, dilimMs: 400, isit: 6, ov: TUR * 1.5, ovHiz: 0.010, karistir: TUR * 1.5, karistirHiz: 0.018, ufle: 3, yudum: 3, yudumMs: 700, pat: 3 },
  '5+': { dinleR: 105, dinleMs: 850, dilimR: 100, dilimMs: 500, isit: 8, ov: TUR * 2, ovHiz: 0.008, karistir: TUR * 2, karistirHiz: 0.015, ufle: 3, yudum: 3, yudumMs: 800, pat: 3 },
};

// ——— aletler: çizimde (600 × 600) tutulan yer ve iş yapan uç, 0–1 oran
export type AletAdi = 'steto' | 'cerceve' | 'eller' | 'kasik' | 'fincan' | 'torba';
export interface AletOlcu { g: number; y: number; tut: readonly [number, number]; uc: readonly [number, number]; kaldir?: number; }
export const ALETLER: Readonly<Record<AletAdi, AletOlcu>> = {
  /** stetoskop: kulaklıklar üstte (tutulan), dinleme başı altta (450, 470) */
  steto: { g: 360, y: 360, tut: [300 / 600, 140 / 600], uc: [450 / 600, 470 / 600] },
  cerceve: { g: CERCEVE.g, y: CERCEVE.y, tut: [0.5, 0.9], uc: [0.5, 0.5], kaldir: 30 },
  /** Kino'nun iki patisi: avuçların ortası */
  eller: { g: 320, y: 320, tut: [0.5, 0.75], uc: [0.5, 0.45] },
  /** kaşığın ucu (çorba kısmı) altta */
  kasik: { g: 300, y: 300, tut: [0.5, 120 / 600], uc: [0.5, 520 / 600] },
  /** fincanın ağzı üstte; elde biraz küçük */
  fincan: { g: 260, y: 273, tut: [0.5, 0.78], uc: [0.5, 0.18], kaldir: 30 },
  torba: { g: 320, y: 320, tut: [0.5, 0.3], uc: [0.5, 0.55] },
};
export const asamaAleti = (a: Asama): AletAdi | null =>
  (a === 'dinle' ? 'steto' : a === 'rontgen' ? 'cerceve' : a === 'isit' || a === 'ov' ? 'eller' : a === 'karistir' ? 'kasik' : a === 'ic' ? 'fincan' : a === 'torba' ? 'torba' : null);

/** Lokum'un sözleri (emir yok: duygu ve tepki; assets/doktor/karin/ses/). Lokum'un klonu yok: ses kararı Barış'ta, sahne sözsüz de akar. */
export const SOZLER = {
  'lo-canta': 'Doktor çantası! Karnım da merak etti.',
  'lo-buldun': 'Hi hi! Buldun, ses oradan geliyor!',
  'lo-koklar': 'Snif snif... Bu mandalina değil ki!',
  'lo-dilim': 'Mandalina dilimleri! Çok yemişim.',
  'lo-kafa': 'Ay! Aklım hep mandalinada!',
  'lo-usudu': 'Brr! Patilerin buz gibi!',
  'lo-gidik': 'Hi hi hi! Gıdıklanıyorum!',
  'lo-rahat': 'Ohh... Karnım ısındı.',
  'lo-cay': 'Papatya çayı! Mis gibi.',
  'lo-ufle': 'Üf, üf! Ben de üflüyorum!',
  'lo-yudum': 'Mmm! Sıcacık.',
  'lo-torba': 'Kalpli torba! Karnım sustu.',
  'lo-son': 'Hav!',
} as const;
export type SozAdi = keyof typeof SOZLER;
export const EFEKTLER = ['g-gur', 'g-gur-kucuk', 'g-steto', 'g-rontgen', 'g-bidik', 'g-sur', 'g-sicak', 'g-ov', 'g-kasik', 'g-sicrama', 'g-uf', 'g-yudum', 'g-pat', 'g-brr', 'g-snif'] as const;
export type EfektAdi = (typeof EFEKTLER)[number];

// ——— mekaniklerin saf hesabı
type Elips = { x: number; y: number; yariEn: number; yariBoy: number };
const elipste = (p: Nokta, e: Elips, pay = 1) => ((p.x - e.x) / (e.yariEn * pay)) ** 2 + ((p.y - e.y) / (e.yariBoy * pay)) ** 2 <= 1;
export const karindaMi = (p: Nokta): boolean => elipste(p, KARIN_ELIPS);
export const uzak = (a: Nokta, b: Nokta) => Math.hypot(a.x - b.x, a.y - b.y);
/** ağız ve burun yakın: hangisine daha yakınsa orası sayılır */
export const agizdaMi = (p: Nokta): boolean => uzak(p, BAS.agiz) <= AGIZ_YARICAPI && uzak(p, BAS.agiz) <= uzak(p, BAS.burun);
export const burundaMi = (p: Nokta): boolean => uzak(p, BAS.burun) <= BURUN_YARICAPI && uzak(p, BAS.burun) < uzak(p, BAS.agiz);
export const bastaMi = (p: Nokta): boolean => uzak(p, BAS.bas) <= BAS.BAS_YARICAPI && !agizdaMi(p);

/** Sıcak-soğuk: gurultunun yerine yakınlık (0 uzak … 1 tam üstünde); 600 px'te sıfırlanır */
export const YAKINLIK_ERIMI = 600;
export const yakinlik = (uc: Nokta, hedef: Nokta): number => Math.max(0, 1 - uzak(uc, hedef) / YAKINLIK_ERIMI);
/** yakınken gurultu daha sık duyulur (ms) */
export const gurultuAraligi = (y: number): number => Math.round(1500 - 1100 * Math.min(1, Math.max(0, y)));
/** Bulma: yarıçapın içinde tutulan süre birikir, dışında yavaşça söner */
export const bulmaAdimi = (birikim: number, uzaklik: number, yaricap: number, dt: number): number => (uzaklik <= yaricap ? birikim + dt : Math.max(0, birikim - dt * 0.5));

/** Röntgen penceresi: çerçevenin ortasında, sahne pikseli */
export const pencere = (uc: Nokta): Kutu => ({ sol: uc.x - CERCEVE.pencereG / 2, ust: uc.y - CERCEVE.pencereY / 2, g: CERCEVE.pencereG, y: CERCEVE.pencereY });
export const penceredeMi = (p: Nokta, uc: Nokta): boolean => { const k = pencere(uc); return p.x >= k.sol && p.x <= k.sol + k.g && p.y >= k.ust && p.y <= k.ust + k.y; };

/** Yatay yön değiştirme sayacı (patileri sürtme): en az genlik kadar gidip dönmek bir sayılır */
export interface SurtDurumu { sayi: number; yon: -1 | 0 | 1; tepe: number | null; uc: number | null; }
export const surtBaslangici = (): SurtDurumu => ({ sayi: 0, yon: 0, tepe: null, uc: null });
export const SURT_GENLIK = 50;
export function surtAdimi(d: SurtDurumu, x: number): SurtDurumu {
  if (d.uc === null || d.tepe === null) return { ...d, tepe: x, uc: x };
  const dx = x - d.uc;
  let { sayi, yon, tepe } = d;
  const yeni: -1 | 0 | 1 = Math.abs(dx) < 2 ? 0 : dx > 0 ? 1 : -1;
  if (yeni !== 0 && yon !== 0 && yeni !== yon) { if (Math.abs(d.uc - tepe) >= SURT_GENLIK) sayi++; tepe = d.uc; }
  if (yeni !== 0) yon = yeni;
  return { sayi, yon, tepe, uc: x };
}

/** Daire çizme: merkezin çevresinde dönülen açı (işaretsiz toplanır); karede çok büyük sıçrama sayılmaz */
export interface DaireDurumu { aci: number | null; toplam: number; }
export const daireBaslangici = (): DaireDurumu => ({ aci: null, toplam: 0 });
export function aciFarki(a: number, b: number): number { let d = b - a; while (d > Math.PI) d -= TUR; while (d < -Math.PI) d += TUR; return d; }
/** merkeze çok yakın (yarıçapın altında) dönmek sayılmaz: titreyen parmak dönmüş gibi olmasın */
export function daireAdimi(d: DaireDurumu, p: Nokta, merkez: Nokta, icinde: boolean, enAz = 40): { d: DaireDurumu; fark: number } {
  if (!icinde || uzak(p, merkez) < enAz) return { d: { ...d, aci: null }, fark: 0 };
  const aci = Math.atan2(p.y - merkez.y, p.x - merkez.x);
  if (d.aci === null) return { d: { ...d, aci }, fark: 0 };
  const fark = Math.max(-0.6, Math.min(0.6, aciFarki(d.aci, aci)));
  return { d: { aci, toplam: d.toplam }, fark };
}
/** dönüş hızı (radyan/ms) sınırın altındaysa ilerler; üstündeyse gıdıklar ya da sıçratır */
export const yavasMi = (fark: number, dt: number, sinir: number): boolean => Math.abs(fark) / Math.max(1, dt) <= sinir;
/** karnın gurultusu: ovuldukça üç kademeden sıfıra iner */
export const gurultuKademesi = (oran: number): 0 | 1 | 2 | 3 => (oran >= 1 ? 0 : (3 - Math.floor(Math.min(0.999, Math.max(0, oran)) * 3)) as 1 | 2 | 3);

/** Üfleme: buharın içinde başlayan, yukarı doğru en az bu kadar giden çekiş bir üfleme */
export const UFLE_BOY = 140;
export const ufleme = (bas: Nokta, simdi: Nokta): boolean => bas.y - simdi.y >= UFLE_BOY && Math.abs(simdi.x - bas.x) <= bas.y - simdi.y + 80;

/** Yudum: fincanın ağzı Lokum'un ağzındayken süre birikir; her yudumMs bir yudum */
export const yudumAdimi = (birikim: number, agizda: boolean, dt: number): number => (agizda ? birikim + dt : Math.max(0, birikim - dt));
/** fincanın kademesi (0 dolu … 3 boş) */
export const fincanKademesi = (yudum: number, hedef: number): 0 | 1 | 2 | 3 => (Math.min(3, Math.round((yudum / Math.max(1, hedef)) * 3)) as 0 | 1 | 2 | 3);
/** torbanın karın üstündeki yeri: karnın içine çekilir */
export function torbaYeri(p: Nokta): Nokta {
  const e = KARIN_ELIPS, dx = (p.x - e.x) / (e.yariEn * 0.6), dy = (p.y - e.y) / (e.yariBoy * 0.6), r = Math.hypot(dx, dy);
  return r <= 1 ? p : { x: e.x + (dx / r) * e.yariEn * 0.6, y: e.y + (dy / r) * e.yariBoy * 0.6 };
}

/** Yakın plandaki yüz ifadesi */
export type BasPozu = keyof typeof KARIN.bas;
export interface BasDurumu {
  asama: Asama; gurKalan: number; kikirKalan: number; gidikKalan: number; utanKalan: number; rahatKalan: number; usuduKalan: number; koklarKalan: number;
  uflerKalan: number; yudumKalan: number; mutluKalan: number; havKalan: number; kirp: boolean; an: number;
}
export function basPozu(d: BasDurumu): BasPozu {
  if (d.asama === 'kutlama' || d.asama === 'son') return 'gulen';
  if (d.havKalan > 0) return 'hav';
  if (d.mutluKalan > 0) return Math.floor(d.an / KARE_MS.mutlu) % 2 ? 'mutlu1' : 'mutlu0';
  if (d.yudumKalan > 0) return Math.floor(d.an / KARE_MS.yudum) % 2 ? 'yudum1' : 'yudum0';
  if (d.gidikKalan > 0) return Math.floor(d.an / KARE_MS.gidik) % 2 ? 'gidik1' : 'gidik0';
  if (d.usuduKalan > 0) return 'usudu';
  if (d.uflerKalan > 0) return 'ufler';
  if (d.koklarKalan > 0) return 'koklar';
  if (d.utanKalan > 0) return 'utangac';
  if (d.kikirKalan > 0) return 'kikir';
  if (d.gurKalan > 0) return 'gur';
  if (d.rahatKalan > 0) return 'rahat';
  if (d.kirp) return 'kirp';
  // ovulduktan sonra rahat bekler
  return ADIMLAR.indexOf(d.asama) >= ADIMLAR.indexOf('karistir') ? 'rahat' : 'uzgun';
}

export { SAHNE };
export const KAPANIS = { parlama: 400, kamera: 430, sevinc: 1150 } as const;
export const KARIN_DUGMESI: readonly [number, number] = [340, 300];
export const TORBA_DUGMESI = 260;
