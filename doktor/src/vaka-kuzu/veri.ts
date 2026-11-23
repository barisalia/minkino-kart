// Minik Doktor · sekizinci vaka: "Kuzu'nun Sökük Dikişi" (ekip/senaryo/DOKTOR-VAKALAR.md, vaka 8). Lokum'un oyuncak Kuzu'su Kino'nun
// kucağında gelir: yanı sökülmüş, pamuğu taşmış, bir düğme gözü düşmüş, kulağı yırtılmış, kurdelesi çözülmüş. Bu bir oyuncak tamiri:
// İĞNE YOK, iplik yok, dikiş yok. Sökük yapışkan yamayla, kulak cırt cırt bantla kapanır; dolgu pamuğu parmakla yerine itilir.
// Kuzu oyuncak bir kuzudur, insan biçimli değildir. Sekiz adım:
//   1 taşan pamukları söküğe tıkıştır (hızlı itersen karşı taraftan biri "pof" diye geri çıkar); büyük yaşta sepetten bir tutam ekle
//   2 üç kumaş yamadan birini seç (kalp, yıldız, pati)
//   3 yamayı söküğün üstüne koy (yanlış yere koyarsan kayıp düşer)
//   4 yamanın dört köşesine bas: her köşe "pıt" diye yapışır
//   5 kulaktaki yırtığı cırt cırt bantla boydan boya kapat (hızlı çekersen bant kıvrılır, yeniden)
//   6 düğme gözü yerine koy, saat yönünde çevirerek tak (ters çevirirsen düğme fırlar, yuvarlanır)
//   7 kurdelenin iki ucunu çaprazla, ilmeği yukarı çek: fiyonk
//   8 yumuşak fırçayla yününü küçük dairelerle kabart (toz bulutları çıkar, yün pofuduk olur)
// Masada şaka: Kuzu'ya dokununca "Mee!"; dışarıdan Lokum'un sesi: "Kuzu'm!"
// Çizimler Astra'dan: anahtar kare Paket Doktor-Y8 (CLAUDE-ASTRA-MESAJLAR.md, 22 Kasım 23:55 ve 23 Kasım eki); parça adları,
// ölçüleri ve kare dizileri ekip/senaryo/DOKTOR-Y8-Y10-PARCALAR.md ile birebirdir. Saf veri ve hesap: DOM yok.
import { HUB, SAHNE, type Kutu, type Nokta, type Yas } from '../vaka/veri';

const dizi = (ad: string, n: number, ilk = 0): string[] => Array.from({ length: n }, (_, i) => `${ad}-${i + ilk}`);

export const YAMA_TURLERI = ['kalp', 'yildiz', 'pati'] as const;
export type YamaTuru = (typeof YAMA_TURLERI)[number];
const yamalar = (ek: string) => Object.fromEntries(YAMA_TURLERI.map(t => [t, `yama-${t}${ek}`])) as Readonly<Record<YamaTuru, string>>;

/** Paketin 84 çizimi (assets/doktor/kuzu/<ad>.webp). */
export const KUZU = {
  fon: 'kuzu-fon',
  /** yakın plandaki Kuzu (sedyede yan yatmış oyuncak; yüz ve göz ayrı katman): dolgunun dört kademesi, iki tepki */
  govde: dizi('kuzu-yakin', 4), govdePof: 'kuzu-yakin-pof', govdeMee: 'kuzu-yakin-mee',
  /** Kuzu'nun işlemeli yüzü (gözsüz; gözler ayrı): dokuz ifade */
  yuz: {
    uzgun: 'kuzu-yuz-uzgun', mee: 'kuzu-yuz-mee', sasir: 'kuzu-yuz-sasir', gulen: 'kuzu-yuz-gulen', kikir: 'kuzu-yuz-kikir', mutlu: 'kuzu-yuz-mutlu',
    utangac: 'kuzu-yuz-utangac', gidik: 'kuzu-yuz-gidik', merak: 'kuzu-yuz-merak',
  },
  sokuk: 'sokuk', pamuk: dizi('pamuk', 3), pof: dizi('pamuk-pof', 3), pamukParca: dizi('pamuk-parca', 2), sepet: 'pamuk-sepeti', sepetBos: 'pamuk-sepeti-bos', sepetPamuk: 'sepet-pamugu',
  yama: yamalar(''), yamaYerinde: yamalar('-yerinde'), yamaYapisik: yamalar('-yapisik'), yamaIsik: 'yama-secim-isigi', kayma: dizi('yama-kayma', 2), kosePit: dizi('kose-pit', 2),
  kulakSokuk: 'kulak-sokuk', cirt: 'cirt-bant', cirtYarim: 'cirt-bant-yarim', cirtTamam: 'cirt-bant-tamam', cirtKivrik: 'cirt-bant-kivrik', cirtIz: dizi('cirt-iz', 3), kulakSallan: dizi('kulak-sallan', 2),
  dugme: 'dugme-goz', dugmeYerinde: dizi('dugme-goz-yerinde', 2), dugmeYuvarlan: 'dugme-yuvarlan', dugmePit: 'dugme-pit', vida: dizi('vida-cizgi', 2),
  kurdeleCozuk: 'kurdele-cozuk', kurdeleSol: 'kurdele-sol-uc', kurdeleSag: 'kurdele-sag-uc', kurdeleCapraz: 'kurdele-capraz', kurdeleFiyonk: dizi('kurdele-fiyonk', 2), kurdeleBagli: 'kurdele-bagli',
  firca: 'kuzu-firca', toz: dizi('yun-toz', 3), yun: dizi('yun-kivrim', 2), yunParilti: 'yun-parilti',
  kalp: dizi('kuzu-kalp', 2), mee: dizi('mee-cizgi', 2),
  uzgun: ['kuzu-masa-uzgun-0', 'kuzu-masa-uzgun-1'], uzgunKirp: 'kuzu-masa-egik', sevinc: ['kuzu-masa-sevinc-0', 'kuzu-masa-sevinc-1'], son: ['kuzu-masa-son-mee', 'kuzu-masa-son-kuzum'],
} as const;
export const KUZU_DOSYALAR: readonly string[] = Object.values(KUZU).flatMap(v => (typeof v === 'string' ? [v] : Array.isArray(v) ? [...v] : Object.values(v as Record<string, string>)));

const boyut = (adlar: readonly string[], b: readonly [number, number]) => Object.fromEntries(adlar.map(a => [a, b]));
const TAM = [SAHNE.g, SAHNE.y] as const;
export const PAMUK_BOYU = 170, YAMA_BOYU = 260, DUGME_BOYU = 120;
export const TUVAL: Readonly<Record<string, readonly [number, number]>> = {
  'kuzu-fon': TAM, ...boyut([...KUZU.govde, KUZU.govdePof, KUZU.govdeMee], TAM), ...boyut(Object.values(KUZU.yuz), [400, 400]),
  sokuk: [360, 300], ...boyut([...KUZU.pamuk, ...KUZU.pof], [240, 240]), ...boyut(KUZU.pamukParca, [300, 300]), 'pamuk-sepeti': [360, 360], 'pamuk-sepeti-bos': [360, 360], 'sepet-pamugu': [240, 240],
  ...boyut([...Object.values(KUZU.yama), ...Object.values(KUZU.yamaYerinde), ...Object.values(KUZU.yamaYapisik)], [300, 300]), 'yama-secim-isigi': [360, 360], ...boyut(KUZU.kayma, [300, 300]), ...boyut(KUZU.kosePit, [160, 160]),
  'kulak-sokuk': [400, 200], 'cirt-bant': [600, 600], 'cirt-bant-yarim': [400, 200], 'cirt-bant-tamam': [400, 200], 'cirt-bant-kivrik': [400, 300], ...boyut(KUZU.cirtIz, [300, 200]), ...boyut(KUZU.kulakSallan, [500, 400]),
  'dugme-goz': [240, 240], ...boyut(KUZU.dugmeYerinde, [240, 240]), 'dugme-yuvarlan': [240, 240], 'dugme-pit': [300, 300], ...boyut(KUZU.vida, [300, 300]),
  'kurdele-cozuk': TAM, 'kurdele-sol-uc': [200, 200], 'kurdele-sag-uc': [200, 200], 'kurdele-capraz': [400, 300], ...boyut(KUZU.kurdeleFiyonk, [400, 300]), 'kurdele-bagli': TAM,
  'kuzu-firca': [600, 600], ...boyut(KUZU.toz, [300, 300]), ...boyut(KUZU.yun, [260, 260]), 'yun-parilti': [300, 300],
  ...boyut(KUZU.kalp, [160, 160]), ...boyut(KUZU.mee, [400, 300]),
  ...boyut([...KUZU.uzgun, KUZU.uzgunKirp, ...KUZU.sevinc, ...KUZU.son], [1000, 940]),
};
export const OPAK: readonly string[] = [KUZU.fon];
export const KARE_MS = { pof: 90, parca: 120, kayma: 110, pit: 100, iz: 100, sallan: 160, vida: 120, fiyonk: 160, toz: 110, kalp: 200, mee: 160 } as const;

// ——— masa (Zıpzıp'ın yerinde, aynı tuval): Kuzu sedyede oturtulmuş, yanından pamuk taşıyor
export const MASA = {
  kuzu: HUB.zipzip,
  /** dokunulacak yer söküğü, yıldız göğsünden kalkar; tuvalde sökük (620, 560), göğüs (520, 500) */
  sokuk: { x: HUB.zipzip.sol + 620, y: HUB.zipzip.ust + 560 } as Nokta,
  gogus: { x: HUB.zipzip.sol + 520, y: HUB.zipzip.ust + 500 } as Nokta,
  yaklasma: { x: HUB.zipzip.sol + 600, y: HUB.zipzip.ust + 520, olcek: 2.2 },
} as const;

// ——— yakın plan (anahtar kare: Kuzu sedyede yan yatıyor x 420…1400, y 220…880; başı solda; yamalar sağ üstte x 1560…1960, y 140…520;
// pamuk sepeti solda x 60…420, y 420…780)
export const YUZ: Nokta = { x: 600, y: 430 };
/** düşmüş düğme gözün yuvası; öbür göz yerinde */
export const GOZ: Nokta = { x: 650, y: 380 };
export const SOKUK: Nokta = { x: 940, y: 620 };
export const SOKUK_YARICAPI = 95;
/** söküğün dışına taşmış üç pamuk */
export const PAMUKLAR: readonly Nokta[] = [{ x: 860, y: 540 }, { x: 1040, y: 580 }, { x: 960, y: 730 }];
export const SEPET: Kutu = { sol: 60, ust: 420, g: 360, y: 360 };
export const SEPET_PAMUGU: Nokta = { x: 240, y: 520 };
export const YAMA_YERLERI: Readonly<Record<YamaTuru, Nokta>> = { kalp: { x: 1660, y: 260 }, yildiz: { x: 1860, y: 260 }, pati: { x: 1760, y: 430 } };
/** yama söküğün üstünde: dört köşesi */
export const KOSELER: readonly Nokta[] = [{ x: SOKUK.x - 115, y: SOKUK.y - 105 }, { x: SOKUK.x + 115, y: SOKUK.y - 105 }, { x: SOKUK.x + 115, y: SOKUK.y + 105 }, { x: SOKUK.x - 115, y: SOKUK.y + 105 }];
/** kulaktaki yırtık: soldan sağa */
export const KULAK_YIRTIK = { bas: { x: 500, y: 290 } as Nokta, son: { x: 720, y: 320 } as Nokta, yari: 70 } as const;
export const KURDELE = { boyun: { x: 780, y: 560 } as Nokta, sol: { x: 680, y: 630 } as Nokta, sag: { x: 880, y: 630 } as Nokta } as const;
/** fırçayla kabartılacak yün kıvrımları */
export const YUNLER: readonly Nokta[] = [{ x: 1080, y: 420 }, { x: 1250, y: 520 }, { x: 1140, y: 790 }, { x: 1300, y: 700 }];
export const YUN_YARICAPI = 110;

export type Asama = 'giris' | 'canta' | 'tikistir' | 'sec' | 'yama' | 'kose' | 'cirt' | 'dugme' | 'kurdele' | 'kabart' | 'kutlama' | 'son';
export const ASAMALAR: readonly Asama[] = ['giris', 'canta', 'tikistir', 'sec', 'yama', 'kose', 'cirt', 'dugme', 'kurdele', 'kabart', 'kutlama', 'son'];
export const ADIMLAR: readonly Asama[] = ['tikistir', 'sec', 'yama', 'kose', 'cirt', 'dugme', 'kurdele', 'kabart'];
export const sonrakiAsama = (a: Asama): Asama => ASAMALAR[Math.min(ASAMALAR.length - 1, ASAMALAR.indexOf(a) + 1)];

export interface Zorluk {
  /** yerine itilecek pamuk (üçten fazlası sepetten) ve geri pofurdatan itiş hızı (px/ms) */ pamuk: number; itHiz: number;
  /** cırt cırtı kıvırmayan hız */ cirtHiz: number;
  /** düğmeyi takmak için saat yönünde dönüş (radyan) */ dugme: number;
  /** kabartılacak yün ve her birinde çizilecek daire (radyan) */ yun: number; yunOv: number;
}
const TUR = Math.PI * 2;
export const ZORLUK: Record<Yas, Zorluk> = {
  '2-3': { pamuk: 3, itHiz: 3.0, cirtHiz: 2.6, dugme: TUR, yun: 2, yunOv: TUR * 0.6 },
  '4': { pamuk: 3, itHiz: 2.2, cirtHiz: 1.8, dugme: TUR * 1.5, yun: 3, yunOv: TUR * 0.8 },
  '5+': { pamuk: 4, itHiz: 1.7, cirtHiz: 1.4, dugme: TUR * 2, yun: 4, yunOv: TUR },
};

// ——— aletler: çizimde (600 × 600) tutulan yer ve iş yapan uç, 0–1 oran
export type AletAdi = 'pamuk' | 'yama' | 'cirt' | 'dugme' | 'firca';
export interface AletOlcu { g: number; y: number; tut: readonly [number, number]; uc: readonly [number, number]; kaldir?: number; }
export const ALETLER: Readonly<Record<AletAdi, AletOlcu>> = {
  pamuk: { g: PAMUK_BOYU, y: PAMUK_BOYU, tut: [0.5, 0.5], uc: [0.5, 0.5], kaldir: 50 },
  yama: { g: YAMA_BOYU, y: YAMA_BOYU, tut: [0.5, 0.5], uc: [0.5, 0.5], kaldir: 60 },
  /** cırt cırt bant: sol ucundan tutulur, bandın ucu sağda (520, 300) */
  cirt: { g: 300, y: 300, tut: [120 / 600, 300 / 600], uc: [520 / 600, 300 / 600] },
  dugme: { g: DUGME_BOYU, y: DUGME_BOYU, tut: [0.5, 0.5], uc: [0.5, 0.5], kaldir: 50 },
  /** yumuşak fırça: sapı altta, kıllar üstte (300, 110) */
  firca: { g: 300, y: 300, tut: [0.5, 500 / 600], uc: [0.5, 110 / 600] },
};

/** Kuzu'nun "mee"si ve Lokum'un dışarıdan sözleri (assets/doktor/kuzu/ses/). Lokum'un klonu yok: sözler yazılı, sahne sözsüz de akar. */
export const SOZLER = {
  'lk-canta': 'Kuzu\'m yırtıldı! İyileşir mi?',
  'lk-pamuk': 'Pamukları yerine koyuyorsun!',
  'lk-yama': 'Ne güzel yama!',
  'lk-kulak': 'Kulağı da yapıştı!',
  'lk-goz': 'Gözü geri geldi!',
  'lk-kurdele': 'Kurdelesi bağlandı!',
  'lk-son': 'Kuzu\'m!',
} as const;
export type SozAdi = keyof typeof SOZLER;
export const EFEKTLER = ['kz-mee', 'kz-pof', 'kz-it', 'kz-yama', 'kz-pit', 'kz-kay', 'kz-cirt', 'kz-kivril', 'kz-vida', 'kz-firla', 'kz-kurdele', 'kz-firca', 'kz-toz'] as const;

// ——— mekaniklerin saf hesabı
export const uzak = (a: Nokta, b: Nokta) => Math.hypot(a.x - b.x, a.y - b.y);
export const sokuktaMi = (p: Nokta): boolean => uzak(p, SOKUK) <= SOKUK_YARICAPI;
/** yama nereye kondu: tam (söküğün üstü), kayar (yakın ama kaymış: düşer), uzak */
export type YamaYeri = 'tam' | 'kayar' | 'uzak';
export const yamaYeri = (p: Nokta): YamaYeri => { const d = uzak(p, SOKUK); return d <= 120 ? 'tam' : d <= 300 ? 'kayar' : 'uzak'; };
export const KOSE_YARICAPI = 90;
export const KOSE_DUGMESI = 200;
export const koseBul = (p: Nokta, yapisik: readonly boolean[]): number => KOSELER.findIndex((k, i) => !yapisik[i] && uzak(p, k) <= KOSE_YARICAPI);

/** Cırt cırt: bandın ucu yırtık boyunca soldan sağa; yırtığın en sol ve en sağ noktası arası kaplanır */
export interface CirtDurumu { sol: number | null; sag: number | null; }
export const cirtBaslangici = (): CirtDurumu => ({ sol: null, sag: null });
export function yirtikta(p: Nokta): boolean {
  const { bas, son, yari } = KULAK_YIRTIK, t = (p.x - bas.x) / (son.x - bas.x);
  if (t < -0.15 || t > 1.15) return false;
  return Math.abs(p.y - (bas.y + (son.y - bas.y) * Math.min(1, Math.max(0, t)))) <= yari;
}
export function cirtAdimi(d: CirtDurumu, p: Nokta): CirtDurumu {
  if (!yirtikta(p)) return d;
  const { bas, son } = KULAK_YIRTIK, x = Math.max(bas.x, Math.min(son.x, p.x));
  return { sol: d.sol === null ? x : Math.min(d.sol, x), sag: d.sag === null ? x : Math.max(d.sag, x) };
}
export const cirtOrani = (d: CirtDurumu): number => (d.sol === null || d.sag === null ? 0 : (d.sag - d.sol) / (KULAK_YIRTIK.son.x - KULAK_YIRTIK.bas.x));
export const CIRT_TAMAM = 0.85;

/** Düğme çevirme: yuvanın çevresinde açı; saat yönü (ekranda y aşağı: açı artar) ilerletir, tersi düğmeyi fırlatır */
export function aciFarki(a: number, b: number): number { let d = b - a; while (d > Math.PI) d -= TUR; while (d < -Math.PI) d += TUR; return d; }
export interface CevirDurumu { aci: number | null; toplam: number; ters: number; }
export const cevirBaslangici = (): CevirDurumu => ({ aci: null, toplam: 0, ters: 0 });
export const DUGME_YARICAPI = 230, TERS_SINIRI = 1.4;
export function cevirAdimi(d: CevirDurumu, p: Nokta): CevirDurumu {
  const r = uzak(p, GOZ);
  if (r < 35 || r > DUGME_YARICAPI) return { ...d, aci: null };
  const aci = Math.atan2(p.y - GOZ.y, p.x - GOZ.x);
  if (d.aci === null) return { ...d, aci };
  const f = Math.max(-0.6, Math.min(0.6, aciFarki(d.aci, aci)));
  return f >= 0 ? { aci, toplam: d.toplam + f, ters: Math.max(0, d.ters - f * 0.5) } : { aci, toplam: d.toplam, ters: d.ters - f };
}
export const yarimTur = (toplam: number): number => Math.floor(toplam / Math.PI + 1e-6);
export const firladiMi = (d: CevirDurumu): boolean => d.ters >= TERS_SINIRI;

/** Kurdele: uçlar çaprazlandı mı; fiyonk çekişi */
export const CAPRAZ_PAYI = 50, FIYONK_CEK = 90;
export const solGecti = (x: number): boolean => x >= KURDELE.boyun.x + CAPRAZ_PAYI;
export const sagGecti = (x: number): boolean => x <= KURDELE.boyun.x - CAPRAZ_PAYI;

/** Yün kabartma: kıvrımın çevresinde küçük daireler (radyan); en yakın kabartılmamış kıvrım */
export const yunBul = (p: Nokta, bitti: readonly boolean[], kac: number): number => YUNLER.slice(0, kac).findIndex((y, i) => !bitti[i] && uzak(p, y) <= YUN_YARICAPI);

/** Yakın plandaki yüz */
export type YuzPozu = keyof typeof KUZU.yuz;
export interface YuzDurumu { asama: Asama; meeKalan: number; sasirKalan: number; kikirKalan: number; utanKalan: number; gidikKalan: number; merakKalan: number; mutluKalan: number; an: number; }
export function yuzPozu(d: YuzDurumu): YuzPozu {
  if (d.asama === 'kutlama' || d.asama === 'son') return 'gulen';
  if (d.meeKalan > 0) return 'mee';
  if (d.sasirKalan > 0) return 'sasir';
  if (d.gidikKalan > 0) return 'gidik';
  if (d.kikirKalan > 0) return 'kikir';
  if (d.utanKalan > 0) return 'utangac';
  if (d.mutluKalan > 0) return 'mutlu';
  if (d.merakKalan > 0) return 'merak';
  return ADIMLAR.indexOf(d.asama) >= ADIMLAR.indexOf('dugme') ? 'mutlu' : 'uzgun';
}
/** gövdenin dolgu kademesi (0 sönük … 3 dolgun) */
export const dolguKademesi = (itilen: number, hedef: number): 0 | 1 | 2 | 3 => (Math.min(3, Math.round((itilen / Math.max(1, hedef)) * 3)) as 0 | 1 | 2 | 3);

export { SAHNE };
export const KAPANIS = { parlama: 400, kamera: 430, sevinc: 1150 } as const;
export const SOKUK_DUGMESI: readonly [number, number] = [320, 300];
export const SEC_DUGMESI = 230;
export const KURDELE_DUGMESI = 200;
