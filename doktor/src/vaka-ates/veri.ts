// Minik Doktor · üçüncü vaka: "Bulut'un Ateşi" (ekip/senaryo/DOKTOR-VAKALAR.md, vaka 3). Aynı klinik masası, yeni hasta,
// sekiz adım (Barış'ın temel kuralı, 23 Kasım: her adımda gerçek el hareketi ve gerçek animasyon):
//   1 termometreyi salla ve alna tut · 2 bezi kâseye daldır, kâsenin üstünde aşağı çekerek sık · 3 bezi yüze bastırıp gezdir
//   4 pipetli bardağı ağzına tut · 5 buzu torbaya tek tek at, kapağı çevirerek kapat · 6 torbayı başına koy
//   7 yelpazeyi sağa sola salla (yün kabarır) · 8 termometre yeniden: yeşil.
// Çizimler Astra'dan: anahtar kare Paket Doktor-Y3 (CLAUDE-ASTRA-MESAJLAR.md, 22 Kasım 23:55); parça adları, ölçüleri ve kare
// dizileri ekip/senaryo/DOKTOR-Y3-Y4-PARCALAR.md ile birebirdir (anahtar kare onaylanınca Astra'ya o metin gider).
// Saf veri ve hesap: DOM yok, birim testleri buradan sınar.
import { HUB, SAHNE, VAKA, type Kutu, type Nokta, type Yas } from '../vaka/veri';

const dizi = (ad: string, n: number): string[] => Array.from({ length: n }, (_, i) => `${ad}-${i}`);

/** Paketin 85 çizimi (assets/doktor/ates/<ad>.webp). */
export const ATES = {
  fon: 'ates-fon', kase: 'kase', damla: 'damla', suHalkasi: dizi('su-halkasi', 3), sicrama: dizi('sicrama', 4),
  /** yakın plandaki baş: aynı baş, on dört ifade (kızarıklık, ter ve kabaran yün ayrı katman) */
  bas: {
    sicak: 'bulut-yakin-sicak', kirp: 'bulut-yakin-kirp', bakis: 'bulut-yakin-bakis', sasir: 'bulut-yakin-sasir', kikir: 'bulut-yakin-kikir',
    serin: 'bulut-yakin-serin', keyif: 'bulut-yakin-keyif', gulen: 'bulut-yakin-gulen', urper0: 'bulut-yakin-urper-0', urper1: 'bulut-yakin-urper-1',
    ic0: 'bulut-yakin-ic-0', ic1: 'bulut-yakin-ic-1', ic2: 'bulut-yakin-ic-2', yutkun: 'bulut-yakin-yutkun',
  },
  kizariklik: 'yanak-kizariklik', ter: 'ter', yun: ['yun-1', 'yun-2', 'yun-3'],
  uzgun: ['bulut-uzgun-0', 'bulut-uzgun-1'], uzgunKirp: 'bulut-uzgun-kirp', sevinc: ['bulut-sevinc-0', 'bulut-sevinc-1'], ferah: 'bulut-ferah',
  termometre: 'termometre', termometreSalla: dizi('termometre-salla', 2), gostergeKirmizi: 'gosterge-kirmizi', gostergeYesil: 'gosterge-yesil', termometreIsik: dizi('termometre-isik', 3),
  bezKuru: 'bez-kuru', bezIslak: 'bez-islak', bezBuruk: dizi('bez-buruk', 3), bezAlinda: 'bez-alinda',
  buhar: dizi('buhar', 5), isiDalgasi: 'isi-dalgasi',
  buz: dizi('buz', 3), buzParilti: dizi('buz-parilti', 2), torba: dizi('torba', 5), torbaKapali: 'torba-kapali', kapak: 'kapak', citirti: dizi('citirti', 3), soguk: dizi('soguk', 3),
  bardak: dizi('bardak', 4), kabarcik: dizi('kabarcik', 2),
  yelpazeKapali: 'yelpaze-kapali', yelpazeAcik: 'yelpaze-acik', yelpazeEgik: 'yelpaze-egik', ruzgar: dizi('ruzgar', 3),
} as const;
export const ATES_DOSYALAR: readonly string[] = Object.values(ATES).flatMap(v => (typeof v === 'string' ? [v] : Array.isArray(v) ? [...v] : Object.values(v as Record<string, string>)));
/** Dikenli Pati'den aynen kullanılan çizimler (assets/doktor/vaka/): aynı klinik, aynı çanta, aynı şerit. */
export const ORTAK = { hubFon: VAKA.hubFon, cantaKapali: VAKA.cantaKapali, cantaAcik: VAKA.cantaAcik, serit: VAKA.serit, pof: VAKA.pof, yildiz: VAKA.yildiz } as const;
export const ORTAK_DOSYALAR: readonly string[] = Object.values(ORTAK).flat();

/** Çizimlerin tuval boyutu (px). */
const boyut = (adlar: readonly string[], b: readonly [number, number]) => Object.fromEntries(adlar.map(a => [a, b]));
export const TUVAL: Readonly<Record<string, readonly [number, number]>> = {
  'ates-fon': [2048, 1152], kase: [400, 400], damla: [60, 80], ...boyut(ATES.suHalkasi, [300, 100]), ...boyut(ATES.sicrama, [300, 300]),
  ...boyut(Object.values(ATES.bas), [2048, 1152]), 'yanak-kizariklik': [2048, 1152], ter: [2048, 1152], ...boyut(ATES.yun, [2048, 1152]),
  ...boyut([...ATES.uzgun, ATES.uzgunKirp, ...ATES.sevinc, ATES.ferah], [1000, 940]),
  termometre: [600, 600], ...boyut(ATES.termometreSalla, [600, 600]), 'gosterge-kirmizi': [56, 240], 'gosterge-yesil': [56, 240], ...boyut(ATES.termometreIsik, [200, 200]),
  'bez-kuru': [600, 600], 'bez-islak': [600, 600], ...boyut(ATES.bezBuruk, [600, 600]), 'bez-alinda': [600, 360],
  ...boyut(ATES.buhar, [200, 300]), 'isi-dalgasi': [600, 300],
  ...boyut(ATES.buz, [200, 200]), ...boyut(ATES.buzParilti, [200, 200]), ...boyut(ATES.torba, [400, 400]), 'torba-kapali': [400, 400], kapak: [200, 200], ...boyut(ATES.citirti, [300, 300]), ...boyut(ATES.soguk, [300, 300]),
  ...boyut(ATES.bardak, [600, 600]), ...boyut(ATES.kabarcik, [160, 240]),
  'yelpaze-kapali': [600, 600], 'yelpaze-acik': [600, 600], 'yelpaze-egik': [600, 600], ...boyut(ATES.ruzgar, [400, 300]),
};
export const OPAK: readonly string[] = [ATES.fon];
/** Kare dizilerinin bir karesinin süresi (ms) */
export const KARE_MS = { sicrama: 75, halka: 110, buhar: 90, isik: 90, citirti: 85, soguk: 140, kabarcik: 160, ruzgar: 80, urper: 120, ic: 130, parilti: 140 } as const;

// ——— masa: Bulut, Zıpzıp'ın yerinde oturur (aynı tuval, aynı kutu)
export const MASA = {
  bulut: HUB.zipzip,
  /** Bulut'un alnı (dokunulacak yer) ve göğsü (yıldızın yeri), sahne pikseli; tuvalde alın (560, 230), göğüs (560, 520) */
  alin: { x: HUB.zipzip.sol + 560, y: HUB.zipzip.ust + 230 } as Nokta,
  gogus: { x: HUB.zipzip.sol + 560, y: HUB.zipzip.ust + 520 } as Nokta,
  yaklasma: { x: HUB.zipzip.sol + 560, y: HUB.zipzip.ust + 280, olcek: 2.3 },
} as const;

// ——— yakın plan: Bulut'un başı ve omuzları (anahtar kare: baş ekseni x 900, baş x 480…1320, y 120…900)
export const BAS = {
  yuz: { x: 900, y: 520, yariEn: 420, yariBoy: 380 },
  alin: { x: 900, y: 290, yariEn: 250, yariBoy: 130 },
  yanaklar: [{ x: 690, y: 610 }, { x: 1110, y: 610 }] as readonly Nokta[],
  yanakYaricapi: 150,
  burun: { x: 900, y: 560 } as Nokta,
  /** ağız: pipetin ucu buraya gelince Bulut içer */
  agiz: { x: 900, y: 655 } as Nokta,
  tepe: { x: 880, y: 150 } as Nokta,
  tepeYaricapi: 230,
  /** alındaki bezin yeri (`bez-alinda` 600 × 360 buraya ortalanır) ve başın üstündeki sıcak dalgası */
  bez: { x: 900, y: 300 } as Nokta,
  isi: { x: 900, y: 90 } as Nokta,
} as const;
export const KASE = {
  kutu: { sol: 40, ust: 370, g: 400, y: 400 } as Kutu,
  yuz: { x: 240, y: 520 } as Nokta,
  su: { x: 240, y: 570, yariEn: 175, yariBoy: 115 },
  ust: { sol: 60, ust: 90, g: 370, y: 420 } as Kutu,
} as const;
export const TEPSI = {
  kupler: [{ x: 1660, y: 220 }, { x: 1860, y: 220 }, { x: 1660, y: 370 }, { x: 1860, y: 370 }] as readonly Nokta[],
  kupBoyu: 130,
  dugme: 200,
} as const;
export const TORBA = {
  merkez: { x: 1410, y: 610 } as Nokta,
  boy: 320,
  agiz: { x: 1410, y: 506 } as Nokta,
  atisEn: 190, atisUst: 300, atisAlt: 110,
  kapakBoyu: 130,
  donusIc: 30, donusDis: 460,
} as const;

/** Alın termometresinin göstergesi: çizimde (600 × 600) dikey pencere; dolgu çizimleri (56 × 240) pencereye oturur. */
export const GOSTERGE: Kutu = { sol: 272, ust: 190, g: 56, y: 240 };
export const ESKI_OKUMA = 0.55;
export const NORMAL_OKUMA = 0.5;

export type Asama = 'giris' | 'canta' | 'salla' | 'olc' | 'daldir' | 'sik' | 'bez' | 'ic' | 'buz' | 'kapat' | 'koy' | 'yelpaze' | 'olc2' | 'kutlama' | 'son';
export const ASAMALAR: readonly Asama[] = ['giris', 'canta', 'salla', 'olc', 'daldir', 'sik', 'bez', 'ic', 'buz', 'kapat', 'koy', 'yelpaze', 'olc2', 'kutlama', 'son'];
/** Senaryonun sekiz adımı (çocuğun gözünden) ve her adımın aşamaları */
export const ADIMLAR: readonly (readonly Asama[])[] = [['salla', 'olc'], ['daldir', 'sik'], ['bez'], ['ic'], ['buz', 'kapat'], ['koy'], ['yelpaze'], ['olc2']];

/** Yaş basamakları: 2–3'te sallama yok ve iki küp; 5+'ta dört küp, bez iki kez ıslatılır. */
export interface Zorluk {
  salla: number; olc: number; daldir: number; sik: number; bez: number; bezTur: number; buz: number; kapak: number;
  /** pipetten içme süresi (ms; pipet ağızdayken) */ ic: number;
  /** yelpazeleme (sağa sola sallama) sayısı */ yelpaze: number;
}
export const ZORLUK: Record<Yas, Zorluk> = {
  '2-3': { salla: 0, olc: 650, daldir: 300, sik: 260, bez: 0.7, bezTur: 1, buz: 2, kapak: 1, ic: 1300, yelpaze: 4 },
  '4': { salla: 6, olc: 850, daldir: 420, sik: 380, bez: 0.8, bezTur: 1, buz: 3, kapak: 1.25, ic: 1700, yelpaze: 6 },
  '5+': { salla: 8, olc: 950, daldir: 460, sik: 440, bez: 0.85, bezTur: 2, buz: 4, kapak: 1.5, ic: 2000, yelpaze: 8 },
};
export const asamalar = (yas: Yas): Asama[] => ASAMALAR.filter(a => a !== 'salla' || ZORLUK[yas].salla > 0);
export const sonrakiAsama = (yas: Yas, a: Asama): Asama => { const l = asamalar(yas); return l[Math.min(l.length - 1, l.indexOf(a) + 1)]; };

// ——— aletler: çizimde tutulan yer ve iş yapan uç, 0–1 oran (tuvale göre)
export type AletAdi = 'termometre' | 'bez' | 'bardak' | 'buz' | 'torba' | 'yelpaze';
export interface Alet { ad: AletAdi; g: number; y: number; tut: readonly [number, number]; uc: readonly [number, number]; }
export const ALETLER: Readonly<Record<AletAdi, Alet>> = {
  termometre: { ad: 'termometre', g: 420, y: 420, tut: [0.5, 0.86], uc: [0.5, 60 / 600] },
  bez: { ad: 'bez', g: 380, y: 380, tut: [0.5, 0.3], uc: [0.5, 0.6] },
  bardak: { ad: 'bardak', g: 380, y: 380, tut: [0.5, 0.7], uc: [190 / 600, 60 / 600] },
  buz: { ad: 'buz', g: 140, y: 140, tut: [0.5, 0.5], uc: [0.5, 0.5] },
  torba: { ad: 'torba', g: 300, y: 300, tut: [0.5, 0.3], uc: [0.5, 0.55] },
  yelpaze: { ad: 'yelpaze', g: 400, y: 400, tut: [0.5, 560 / 600], uc: [0.5, 240 / 600] },
};
export const BEZ_DAMLA: readonly [number, number] = [0.5, 0.9];
/** Şeritteki yuvalar: termometre, bez (alına konunca yerine bardak gelir), buz torbası, yelpaze. */
export const ALET_SIRASI: readonly AletAdi[] = ['termometre', 'bez', 'torba', 'yelpaze'];
export const asamaAleti = (a: Asama): AletAdi | null =>
  (a === 'salla' || a === 'olc' || a === 'olc2' ? 'termometre' : a === 'daldir' || a === 'sik' || a === 'bez' ? 'bez' : a === 'ic' ? 'bardak' : a === 'buz' ? 'buz' : a === 'kapat' || a === 'koy' ? 'torba' : a === 'yelpaze' ? 'yelpaze' : null);

/** Bulut'un sözleri (emir yok: duygu ve tepki; assets/doktor/ates/ses/). Bulut'un klonu kurulunca kaydedilir. */
export const SOZLER = {
  'b-sicak': 'Çok sıcak oldum... Yünüm yapış yapış!',
  'b-canta': 'Aa! Doktor çantası!',
  'b-ates': 'Ateşim mi var?',
  'b-serin': 'Ooh! Serin serin!',
  'b-kikir': 'Hi hi! Burnuma damladı!',
  'b-isindi': 'Bez ısındı!',
  'b-lik': 'Lık lık lık... Oh, serin su!',
  'b-brr': 'Brrr! Buz gibi!',
  'b-oh': 'Oh, oh! Ferah ferah!',
  'b-ruzgar': 'Rüzgâr! Yünüm uçuşuyor!',
  'b-iyi': 'Yeşil oldu! Ateşim düştü!',
  'b-ferah': 'Ferahladım! Yünüm de kabardı!',
} as const;
export type SozAdi = keyof typeof SOZLER;
/** Bu vakaya özgü efektler (assets/doktor/ates/ses/). */
export const EFEKTLER = ['a-sik', 'a-olc', 'a-sap', 'a-damla', 'a-sil', 'a-buz', 'a-cevir', 'a-yudum', 'a-citir', 'a-yelpaze'] as const;
export type EfektAdi = (typeof EFEKTLER)[number];
export const ORTAK_EFEKTLER = ['e-cit', 'e-tik', 'e-vuu', 'e-pof', 'e-cin', 'e-pat', 'e-hihi'] as const;

// ——— mekaniklerin saf hesabı

const elipste = (p: Nokta, e: { x: number; y: number; yariEn: number; yariBoy: number }) => ((p.x - e.x) / e.yariEn) ** 2 + ((p.y - e.y) / e.yariBoy) ** 2 <= 1;
const kutuda = (p: Nokta, k: Kutu) => p.x >= k.sol && p.x <= k.sol + k.g && p.y >= k.ust && p.y <= k.ust + k.y;
export const alindaMi = (p: Nokta): boolean => elipste(p, BAS.alin);
export const yuzdeMi = (p: Nokta): boolean => elipste(p, BAS.yuz);
export const sudaMi = (p: Nokta): boolean => elipste(p, KASE.su);
export const kaseUstundeMi = (p: Nokta): boolean => kutuda(p, KASE.ust) && !sudaMi(p);
export const tepedeMi = (p: Nokta): boolean => Math.hypot(p.x - BAS.tepe.x, p.y - BAS.tepe.y) <= BAS.tepeYaricapi;
export const torbayaMi = (p: Nokta): boolean => Math.abs(p.x - TORBA.agiz.x) <= TORBA.atisEn && p.y >= TORBA.agiz.y - TORBA.atisUst && p.y <= TORBA.agiz.y + TORBA.atisAlt;
/** Pipetin ucu ağızda mı (biraz geniş: küçük parmak tam denk getirmek zorunda değil) */
export const PIPET_YARICAPI = 80;
export const agizdaMi = (p: Nokta): boolean => Math.hypot(p.x - BAS.agiz.x, p.y - BAS.agiz.y) <= PIPET_YARICAPI;
/** Pipet burnun ucuna gelirse (ağızda değilken) gıdıklar */
export const burundaMi = (p: Nokta): boolean => !agizdaMi(p) && Math.hypot(p.x - BAS.burun.x, p.y - BAS.burun.y) <= 60;
/** Yelpaze yüzün önünde mi: yüzün çevresinde geniş alan (yelpazenin ortası) */
export const yelpazeYuzdeMi = (p: Nokta): boolean => elipste(p, { x: BAS.yuz.x, y: BAS.yuz.y, yariEn: BAS.yuz.yariEn * 1.45, yariBoy: BAS.yuz.yariBoy * 1.3 });

export const KARE_SINIRI = 60;
const yolu = (yol: number) => Math.min(KARE_SINIRI, Math.max(0, yol));

/**
 * Yön değiştirme sayacı (termometre sallama, yelpazeleme): her yön değiştirme (en az genlik kadar gidip dönünce) bir sayılır.
 * Yerinde tutmak da çok yavaş ilerletir (bekleme ms'de bir): küçük çocuk takılmaz.
 */
export interface SallaDurumu { sayi: number; yon: -1 | 0 | 1; tepe: number | null; uc: number | null; bekleme: number; }
export const sallaBaslangici = (): SallaDurumu => ({ sayi: 0, yon: 0, tepe: null, uc: null, bekleme: 0 });
export const SALLA_GENLIK = 50;
export const SALLA_BEKLEME = 1600;
export function sallaAdimi(d: SallaDurumu, x: number, dt: number, genlik = SALLA_GENLIK, beklemeMs = SALLA_BEKLEME): SallaDurumu {
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
export const eskiOkuma = (sayi: number, hedef: number): number => (hedef <= 0 ? 0 : ESKI_OKUMA * Math.max(0, 1 - sayi / hedef));
export const olcAdimi = (birikim: number, alinda: boolean, dt: number, hedef: number): number => (alinda ? Math.min(hedef, birikim + dt) : birikim);

export const DALDIR_BEKLEME = 0.25;
export const daldirAdimi = (birikim: number, suda: boolean, yol: number, dt: number, hedef: number): number =>
  (suda ? Math.min(hedef, birikim + yolu(yol) + dt * DALDIR_BEKLEME) : birikim);
export const SIK_BEKLEME = 0.04;
export const sikAdimi = (birikim: number, ustunde: boolean, dy: number, dt: number, hedef: number): number =>
  (ustunde ? Math.min(hedef, birikim + yolu(dy) + dt * SIK_BEKLEME) : birikim);
/** Sıkılan bezin burulma karesi (0–2): sıkmanın üçte biri bir kare */
export const burukKaresi = (sik: number, hedef: number): 0 | 1 | 2 => (Math.min(2, Math.floor((sik / Math.max(1, hedef)) * 3)) as 0 | 1 | 2);

export const KIZARIK_HUCRE = 40;
export const BEZ_YARICAPI = 130;
export const SILME_YOLU = 80;
export const SILME_BEKLEME = 0.05;
export interface KizariklikIzgarasi { merkezler: Nokta[]; deger: Float32Array; }
export function kizariklikIzgarasi(): KizariklikIzgarasi {
  const merkezler: Nokta[] = [];
  for (let y = KIZARIK_HUCRE / 2; y < SAHNE.y; y += KIZARIK_HUCRE) for (let x = KIZARIK_HUCRE / 2; x < SAHNE.g; x += KIZARIK_HUCRE) {
    if (BAS.yanaklar.some(k => Math.hypot(x - k.x, y - k.y) <= BAS.yanakYaricapi)) merkezler.push({ x, y });
  }
  return { merkezler, deger: new Float32Array(merkezler.length) };
}
export function bezAdimi(iz: KizariklikIzgarasi, p: Nokta, yol: number, dt: number): number {
  const once = silinenSayisi(iz);
  const art = (yolu(yol) + dt * SILME_BEKLEME) / SILME_YOLU;
  iz.merkezler.forEach((m, i) => { if (Math.hypot(m.x - p.x, m.y - p.y) <= BEZ_YARICAPI) iz.deger[i] = Math.min(1, iz.deger[i] + art); });
  return silinenSayisi(iz) - once;
}
export const silinenSayisi = (iz: KizariklikIzgarasi): number => { let n = 0; for (const v of iz.deger) if (v >= 1) n++; return n; };
export const kizariklikOrani = (iz: KizariklikIzgarasi): number => (iz.merkezler.length ? silinenSayisi(iz) / iz.merkezler.length : 1);
export const BEZ_ISINMA = 0.5;
export const bezIsindiMi = (oran: number, tur: number, z: Zorluk): boolean => z.bezTur > 1 && tur < z.bezTur && oran >= BEZ_ISINMA;

/** İçme: pipet ağızdayken birikir (yudum yudum); çekilince olduğu yerde kalır. Bardağın su kademesi 0 dolu … 3 boş. */
export const icAdimi = (birikim: number, agizda: boolean, dt: number, hedef: number): number => (agizda ? Math.min(hedef, birikim + dt) : birikim);
export const bardakKademesi = (birikim: number, hedef: number): 0 | 1 | 2 | 3 => (Math.min(3, Math.floor((birikim / Math.max(1, hedef)) * 4)) as 0 | 1 | 2 | 3);
/** Torbanın şişkinlik kademesi (0 boş … 4 dolu): atılan küp sayısına göre */
export const torbaKademesi = (n: number, toplam: number): number => Math.max(0, Math.min(4, Math.round((n / Math.max(1, toplam)) * 4)));
/** Yelpaze: yün üç kademede kabarır */
export const YELPAZE_GENLIK = 60;
export const YELPAZE_BEKLEME = 1800;
export const yunKademesi = (sayi: number, hedef: number): 0 | 1 | 2 | 3 => (Math.min(3, Math.floor((sayi / Math.max(1, hedef)) * 3 + 1e-9)) as 0 | 1 | 2 | 3);

export interface KapakDurumu { aci: number | null; toplam: number; }
export const kapakBaslangici = (): KapakDurumu => ({ aci: null, toplam: 0 });
export function kapakAdimi(d: KapakDurumu, p: Nokta, merkez: Nokta = TORBA.agiz): KapakDurumu {
  const u = Math.hypot(p.x - merkez.x, p.y - merkez.y);
  if (u < TORBA.donusIc || u > TORBA.donusDis) return { aci: null, toplam: d.toplam };
  const aci = Math.atan2(p.y - merkez.y, p.x - merkez.x);
  if (d.aci === null) return { aci, toplam: d.toplam };
  let fark = aci - d.aci;
  if (fark > Math.PI) fark -= 2 * Math.PI; else if (fark < -Math.PI) fark += 2 * Math.PI;
  return { aci, toplam: d.toplam + Math.min(0.25, Math.abs(fark) / (2 * Math.PI)) };
}

/** Yakın plandaki baş pozu. */
export type BasPozu = keyof typeof ATES.bas;
export const KIKIR_MS = 900, SERIN_MS = 650, URPER_MS = 1100, SASIR_MS = 700, KEYIF_MS = 700, YUTKUN_MS = 380;
export interface BasDurumu { asama: Asama; kikirKalan: number; serinKalan: number; urperKalan: number; sasirKalan: number; keyifKalan: number; yutkunKalan: number;
  /** termometre alındayken (ölçüm sürüyor) */ olcuyor: boolean; /** pipet ağızda */ iciyor: boolean; kirp: boolean; /** ms: içme ve ürperme karesi için */ an: number; }
export function basPozu(d: BasDurumu): BasPozu {
  if (d.asama === 'kutlama' || d.asama === 'son') return 'gulen';
  if (d.urperKalan > 0) return Math.floor(d.an / 120) % 2 ? 'urper1' : 'urper0';
  if (d.kikirKalan > 0) return 'kikir';
  if (d.sasirKalan > 0) return 'sasir';
  if (d.yutkunKalan > 0) return 'yutkun';
  if (d.iciyor) return (['ic0', 'ic1', 'ic2'] as const)[Math.floor(d.an / 130) % 3];
  if (d.olcuyor) return 'bakis';
  if (d.keyifKalan > 0) return 'keyif';
  if (d.serinKalan > 0 || d.asama === 'olc2' || d.asama === 'yelpaze') return 'serin';
  return d.kirp ? 'kirp' : 'sicak';
}

export { SAHNE };

/**
 * Kapanış kısa tutulur (bitiş sevinci en çok 2 sn): gösterge yeşile inince kısa parıltı, masaya dönüş (kamera) ve masadaki
 * sevinç (Bulut torba şapkasıyla zıplar, sonunda kollarını açar: "Ferahladım!").
 */
export const KAPANIS = { parlama: 420, kamera: 430, sevinc: 1100 } as const;
export const ALIN_DUGMESI: readonly [number, number] = [330, 224];
export const TORBA_DUGMESI = 380;
