// Minik Doktor · altıncı vaka: "Polly'nin Karışık Kanadı" (ekip/senaryo/DOKTOR-VAKALAR.md, vaka 6). Sekiz adım (Barış'ın
// temel kuralı, 23 Kasım: her adımda gerçek el hareketi ve gerçek animasyon):
//   1 kanadı ucundan yavaşça aç (hızlı açılırsa Polly "Ouch!") · 2 pıtrakları tutup çek, tepsiye bırak · 3 tüyleri kökten uca
//   tek yönde tara (ters taranırsa tüy kabarır) · 4 eğik tüyü çevirip yuvasına oturt · 5 kanadı ucundan yukarı aşağı çırptır
//   6 askıyı kanadın altına koy, iki ucunu boyunda birleştir · 7 krakeri gagaya uzat, çek, yine uzat (krak krak) · 8 şapkasını tak.
// Polly kısa İngilizce sözlerle konuşur (İngilizce uygulamasındaki Polly'nin sesi). Çizimler Astra'dan: anahtar kare Paket
// Doktor-Y6 (CLAUDE-ASTRA-MESAJLAR.md, 22 Kasım 23:55); parça adları ve ölçüleri ekip/senaryo/DOKTOR-Y5-Y6-PARCALAR.md ile
// birebirdir. Saf veri ve hesap: DOM yok, birim testleri buradan sınar.
import { HUB, SAHNE, type Kutu, type Nokta, type Yas } from '../vaka/veri';

const dizi = (ad: string, n: number, ilk = 0): string[] => Array.from({ length: n }, (_, i) => `${ad}-${i + ilk}`);

/** Paketin 81 çizimi (assets/doktor/kanat/<ad>.webp). */
export const KANAT = {
  fon: 'kanat-fon',
  /** yakın plandaki Polly (baş ve gövde; yaralı kanat ayrı katman): aynı gövde, on beş ifade */
  bas: {
    endise: 'polly-yakin-endise', kirp: 'polly-yakin-kirp', ouch: 'polly-yakin-ouch', sasir: 'polly-yakin-sasir', kikir: 'polly-yakin-kikir', gurur: 'polly-yakin-gurur',
    mutlu: 'polly-yakin-mutlu', bakis: 'polly-yakin-bakis', kirt0: 'polly-yakin-kirt-0', kirt1: 'polly-yakin-kirt-1', yay: 'polly-yakin-yay', hey: 'polly-yakin-hey',
    gaga0: 'polly-yakin-gaga-0', gaga1: 'polly-yakin-gaga-1', huzur: 'polly-yakin-huzur',
  },
  kanat: dizi('kanat', 6), kanatKarisik: 'kanat-karisik', kanatParlak: 'kanat-parlak', kanatCirp: dizi('kanat-cirp', 3),
  pitrak: dizi('pitrak', 3), pitrakGergin: dizi('pitrak-gergin', 2), pitrakTepside: 'pitrak-tepside', pit: dizi('pit', 2),
  tarak: 'tarak', tarakTuylu: 'tarak-tuylu', tarakTara: dizi('tarak-tara', 2), parilti: dizi('parilti-tuy', 3), tuyKabarik: dizi('tuy-kabarik', 2),
  tuyEgik: 'tuy-egik', tuyTik: dizi('tuy-tik', 2), tuyUcan: dizi('tuy-ucan', 4), kanatRuzgar: dizi('kanat-ruzgar', 2),
  aski: 'aski', askiYerinde: dizi('aski-yerinde', 2), askiUcuSol: 'aski-ucu-sol', askiUcuSag: 'aski-ucu-sag', askiDugum: 'aski-dugum',
  kraker: dizi('kraker', 3), krakerKirik: 'kraker-kirik', kirinti: dizi('kirinti', 3),
  sapka: 'sapka', sapkaHavada: 'sapka-havada', sapkaBasta: 'sapka-basta', sapkaYildiz: 'sapka-yildiz', nota: dizi('nota', 3),
  uzgun: ['polly-uzgun-0', 'polly-uzgun-1'], uzgunKirp: 'polly-uzgun-kirp', sevinc: ['polly-sevinc-0', 'polly-sevinc-1'], son: dizi('polly-son', 3),
} as const;
export const KANAT_DOSYALAR: readonly string[] = Object.values(KANAT).flatMap(v => (typeof v === 'string' ? [v] : Array.isArray(v) ? [...v] : Object.values(v as Record<string, string>)));

const boyut = (adlar: readonly string[], b: readonly [number, number]) => Object.fromEntries(adlar.map(a => [a, b]));
export const TUVAL: Readonly<Record<string, readonly [number, number]>> = {
  'kanat-fon': [2048, 1152], ...boyut(Object.values(KANAT.bas), [2048, 1152]),
  ...boyut([...KANAT.kanat, KANAT.kanatKarisik, KANAT.kanatParlak, ...KANAT.kanatCirp], [2048, 1152]),
  ...boyut(KANAT.pitrak, [160, 160]), ...boyut(KANAT.pitrakGergin, [240, 240]), 'pitrak-tepside': [160, 160], ...boyut(KANAT.pit, [200, 200]),
  tarak: [600, 600], 'tarak-tuylu': [600, 600], ...boyut(KANAT.tarakTara, [600, 600]), ...boyut(KANAT.parilti, [600, 200]), ...boyut(KANAT.tuyKabarik, [300, 300]),
  'tuy-egik': [400, 120], ...boyut(KANAT.tuyTik, [300, 300]), ...boyut(KANAT.tuyUcan, [200, 200]), ...boyut(KANAT.kanatRuzgar, [500, 300]),
  aski: [600, 600], ...boyut(KANAT.askiYerinde, [2048, 1152]), 'aski-ucu-sol': [240, 240], 'aski-ucu-sag': [240, 240], 'aski-dugum': [2048, 1152],
  ...boyut(KANAT.kraker, [400, 400]), 'kraker-kirik': [400, 400], ...boyut(KANAT.kirinti, [300, 300]),
  sapka: [400, 400], 'sapka-havada': [400, 400], 'sapka-basta': [2048, 1152], 'sapka-yildiz': [300, 300], ...boyut(KANAT.nota, [160, 160]),
  ...boyut([...KANAT.uzgun, KANAT.uzgunKirp, ...KANAT.sevinc, ...KANAT.son], [1000, 940]),
};
export const OPAK: readonly string[] = [KANAT.fon];
export const KARE_MS = { pit: 90, parilti: 90, kabarik: 160, tik: 110, ucan: 180, ruzgar: 90, aski: 160, kirinti: 110, yildiz: 100, nota: 220, gaga: 140, kirt: 130 } as const;

// ——— masa (Zıpzıp'ın yerinde, aynı tuval)
export const MASA = {
  polly: HUB.zipzip,
  /** Polly'nin yaralı kanadı (dokunulacak yer), göğsü (yıldızın yeri); tuvalde kanat (700, 420), göğüs (520, 520) */
  kanat: { x: HUB.zipzip.sol + 700, y: HUB.zipzip.ust + 420 } as Nokta,
  gogus: { x: HUB.zipzip.sol + 520, y: HUB.zipzip.ust + 520 } as Nokta,
  yaklasma: { x: HUB.zipzip.sol + 640, y: HUB.zipzip.ust + 420, olcek: 2.3 },
} as const;

// ——— yakın plan (anahtar kare: açık kanat x 420…1420, y 260…860, kök solda, uçlar sağda; baş sol üstte x 120…560, y 60…480)
export const BAS = {
  /** başın ortası, gaga ucu (kraker buraya uzatılır), başın tepesi (şapka buraya) ve boynun arkası (askının düğümü) */
  bas: { x: 330, y: 260 } as Nokta, gaga: { x: 520, y: 300 } as Nokta, tepe: { x: 320, y: 110 } as Nokta, boyun: { x: 300, y: 470 } as Nokta,
  basYaricapi: 210,
} as const;
export const KANAT_YOLU = {
  /** kanadın ucu: kapalıyken ve tam açıkken */ kapali: { x: 760, y: 780 } as Nokta, acik: { x: 1380, y: 420 } as Nokta,
  /** kanadın kökü (açılmanın döndüğü yer) ve kanadın ortası (askının konduğu yer) */ kok: { x: 480, y: 560 } as Nokta, orta: { x: 900, y: 600 } as Nokta,
} as const;
/** Pıtraklar açık kanadın üstünde (yaşa göre ilk n tanesi) */
export const PITRAKLAR: readonly Nokta[] = [{ x: 820, y: 520 }, { x: 1020, y: 640 }, { x: 1220, y: 480 }];
export const PITRAK_BOYU = 160;
/** Tarama şeritleri: kökten uca (soldan sağa), dört bant (yaşa göre ilk n tanesi) */
export const BANTLAR: readonly { y: number; sol: number; sag: number }[] = [
  { y: 420, sol: 560, sag: 1360 }, { y: 520, sol: 540, sag: 1380 }, { y: 620, sol: 540, sag: 1340 }, { y: 720, sol: 560, sag: 1280 },
];
export const BANT_YARIYUKSEKLIK = 48;
/** Eğik tüy: kökü ve yuvasının açısı (derece; 0 sağ, saat yönü artı); başta yuvadan saparak durur */
export const TUY = { kok: { x: 1180, y: 700 } as Nokta, hedefAci: 18, baslangicAci: -40, boy: 400 } as const;
/** Tepsi (fonda sağ üstte): pıtrakların bırakıldığı yer, şapka da başta burada durur */
export const TEPSI = { kutu: { sol: 1580, ust: 300, g: 300, y: 460 } as Kutu, yerler: [{ x: 1660, y: 400 }, { x: 1780, y: 430 }, { x: 1700, y: 500 }] as readonly Nokta[], sapka: { x: 1730, y: 650 } as Nokta } as const;
/** Askının iki ucu (kanat altına konunca belirir) */
export const ASKI = { sol: { x: 560, y: 720 } as Nokta, sag: { x: 1260, y: 800 } as Nokta } as const;

export type Asama = 'giris' | 'canta' | 'ac' | 'pitrak' | 'tara' | 'tuy' | 'cirp' | 'aski' | 'dugum' | 'kraker' | 'sapka' | 'kutlama' | 'son';
export const ASAMALAR: readonly Asama[] = ['giris', 'canta', 'ac', 'pitrak', 'tara', 'tuy', 'cirp', 'aski', 'dugum', 'kraker', 'sapka', 'kutlama', 'son'];
export const ADIMLAR: readonly (readonly Asama[])[] = [['ac'], ['pitrak'], ['tara'], ['tuy'], ['cirp'], ['aski', 'dugum'], ['kraker'], ['sapka']];

export interface Zorluk {
  /** açarken en yüksek hız (sahne pikseli / ms); üstünde Polly "Ouch!" */ hiz: number;
  pitrak: number; bant: number; /** eğik tüy adımı var mı */ tuy: boolean; cirp: number; isirik: number;
}
export const ZORLUK: Record<Yas, Zorluk> = {
  '2-3': { hiz: 2.4, pitrak: 2, bant: 3, tuy: false, cirp: 3, isirik: 2 },
  '4': { hiz: 1.8, pitrak: 3, bant: 4, tuy: true, cirp: 4, isirik: 3 },
  '5+': { hiz: 1.4, pitrak: 3, bant: 4, tuy: true, cirp: 5, isirik: 3 },
};
export const asamalar = (yas: Yas): Asama[] => ASAMALAR.filter(a => a !== 'tuy' || ZORLUK[yas].tuy);
export const sonrakiAsama = (yas: Yas, a: Asama): Asama => { const l = asamalar(yas); return l[Math.min(l.length - 1, l.indexOf(a) + 1)]; };

// ——— aletler (çizimde 600 × 600 ya da yazılan tuval; oran)
export type AletAdi = 'pitrak' | 'tarak' | 'aski' | 'kraker' | 'sapka' | 'ucSol' | 'ucSag';
export interface AletOlcu { g: number; y: number; tut: readonly [number, number]; uc: readonly [number, number]; kaldir?: number; }
export const ALETLER: Readonly<Record<AletAdi, AletOlcu>> = {
  pitrak: { g: 160, y: 160, tut: [0.5, 0.5], uc: [0.5, 0.5], kaldir: 60 },
  tarak: { g: 380, y: 380, tut: [0.5, 160 / 600], uc: [0.5, 430 / 600] },
  aski: { g: 340, y: 340, tut: [0.5, 0.5], uc: [0.5, 0.5] },
  kraker: { g: 220, y: 220, tut: [0.5, 300 / 400], uc: [0.5, 110 / 400] },
  sapka: { g: 280, y: 280, tut: [0.5, 0.5], uc: [0.5, 0.62] },
  ucSol: { g: 160, y: 160, tut: [0.5, 0.5], uc: [0.5, 0.5], kaldir: 50 },
  ucSag: { g: 160, y: 160, tut: [0.5, 0.5], uc: [0.5, 0.5], kaldir: 50 },
};
/** Şerit: tarak (0), askı (1), kraker (2) */
export const SERIT = ['tarak', 'aski', 'kraker'] as const;

/** Polly'nin sözleri (İngilizce, Polly'nin sesi; assets/doktor/kanat/ses/) ve Kino'nun kapanış hapşırığı */
export const SOZLER = {
  'po-ouch': 'Ouch! My wing!',
  'po-canta': 'Oh! A doctor bag!',
  'po-ouch2': 'Ouch, ouch!',
  'po-pop': 'Pop! Bye-bye, burr!',
  'po-hey': 'Hey! Not on my head!',
  'po-gidik': 'Hee hee! That tickles!',
  'po-parlak': 'Shiny feathers!',
  'po-tik': 'Click! Perfect!',
  'po-yay': 'Yay! I can flap!',
  'po-krak': 'Crunch! Yummy!',
  'po-sapka': 'My hat! Thank you!',
  'po-bless': 'Bless you, Kino!',
} as const;
export type SozAdi = keyof typeof SOZLER;
export const KINO_SOZU = 'k-hapsu'; // "Hap... hapşu!" (Kino'nun sesi)
export const EFEKTLER = ['k-kanat', 'k-pit', 'k-tara', 'k-kabar', 'k-tik', 'k-cirp', 'k-aski', 'k-dugum', 'k-krak', 'k-sapka'] as const;
export type EfektAdi = (typeof EFEKTLER)[number];

// ——— mekaniklerin saf hesabı
export const KARE_SINIRI = 60;
const kutuda = (p: Nokta, k: Kutu) => p.x >= k.sol && p.x <= k.sol + k.g && p.y >= k.ust && p.y <= k.ust + k.y;
export const tepsideMi = (p: Nokta): boolean => kutuda(p, TEPSI.kutu);
export const bastaMi = (p: Nokta): boolean => Math.hypot(p.x - BAS.bas.x, p.y - BAS.bas.y) <= BAS.basYaricapi;
export const GAGA_YARICAPI = 90;
export const gagadaMi = (p: Nokta): boolean => Math.hypot(p.x - BAS.gaga.x, p.y - BAS.gaga.y) <= GAGA_YARICAPI;
export const TEPE_YARICAPI = 160;
export const tepedeMi = (p: Nokta): boolean => Math.hypot(p.x - BAS.tepe.x, p.y - BAS.tepe.y) <= TEPE_YARICAPI;

/** Kanadı açma: parmağın kapalı uçtan açık uca giden yol üzerindeki izdüşümü (0 kapalı … 1 açık) */
export function acilma(p: Nokta): number {
  const a = KANAT_YOLU.kapali, b = KANAT_YOLU.acik, dx = b.x - a.x, dy = b.y - a.y;
  return Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)));
}
/** Yavaşça açılırsa ilerler; hızlı çekilirse (hız sınırın üstünde) ilerlemez, Polly "Ouch!" der ve kanat biraz geri kapanır */
export function acAdimi(oran: number, hedef: number, hiz: number, sinir: number): { oran: number; ouch: boolean } {
  if (hiz > sinir && hedef > oran) return { oran: Math.max(0, oran - 0.08), ouch: true };
  return { oran: Math.max(oran, Math.min(1, hedef)), ouch: false };
}
export const kanatKaresi = (oran: number): number => Math.min(5, Math.floor(oran * 5 + 1e-9));
export const ACIK_TAMAM = 0.97;

/** Pıtrak çekme: parmak pıtraktan uzaklaştıkça gerilir (iki kare), eşikte "pıt" diye kopar */
export const PITRAK_ESIGI = 150;
export const gerilmeKaresi = (uzaklik: number): 0 | 1 => (uzaklik >= PITRAK_ESIGI / 2 ? 1 : 0);

/** Tarama: bir bandın içinde kökten uca (sağa) gidilen yer sayılır; sola gidiş ters taramadır */
export interface BantDurumu { sol: number | null; sag: number | null; }
export const bantBaslangici = (): BantDurumu => ({ sol: null, sag: null });
export const bantBul = (p: Nokta, n: number): number => BANTLAR.slice(0, n).findIndex(b => Math.abs(p.y - b.y) <= BANT_YARIYUKSEKLIK && p.x >= b.sol - 60 && p.x <= b.sag + 60);
export function taraAdimi(d: BantDurumu, i: number, once: Nokta, simdi: Nokta): { d: BantDurumu; ters: boolean } {
  const b = BANTLAR[i], dx = simdi.x - once.x;
  if (dx < -3) return { d, ters: true };
  if (dx <= 0) return { d, ters: false };
  const a = Math.max(b.sol, Math.min(b.sag, once.x)), c = Math.max(b.sol, Math.min(b.sag, simdi.x));
  return { d: { sol: d.sol === null ? a : Math.min(d.sol, a), sag: d.sag === null ? c : Math.max(d.sag, c) }, ters: false };
}
export const bantOrani = (d: BantDurumu, i: number): number => (d.sol === null || d.sag === null ? 0 : (d.sag - d.sol) / (BANTLAR[i].sag - BANTLAR[i].sol));
export const BANT_TAMAM = 0.85;

/** Eğik tüy: parmağın tüy köküne göre açısı (derece); yuvanın açısına bu kadar yaklaşınca "tık" diye oturur */
export const TUY_TOLERANS = 8;
export const tuyAcisi = (p: Nokta): number => (Math.atan2(p.y - TUY.kok.y, p.x - TUY.kok.x) * 180) / Math.PI;
export const tuyOturduMu = (aci: number): boolean => Math.abs(aci - TUY.hedefAci) <= TUY_TOLERANS;

/** Çırpma: kanadın ucu yukarı aşağı; yön değiştirme sayılır (en az genlik kadar) */
export interface CirpDurumu { sayi: number; yon: -1 | 0 | 1; tepe: number | null; uc: number | null; }
export const cirpBaslangici = (): CirpDurumu => ({ sayi: 0, yon: 0, tepe: null, uc: null });
export const CIRP_GENLIK = 70, CIRP_ALANI = 300;
export function cirpAdimi(d: CirpDurumu, p: Nokta): CirpDurumu {
  if (Math.hypot(p.x - KANAT_YOLU.acik.x, p.y - KANAT_YOLU.acik.y) > CIRP_ALANI) return { ...d, tepe: null, uc: null, yon: 0 };
  const v = p.y;
  if (d.uc === null || d.tepe === null) return { ...d, tepe: v, uc: v };
  const dv = v - d.uc;
  let { sayi, yon, tepe } = d;
  const yeni: -1 | 0 | 1 = Math.abs(dv) < 2 ? 0 : dv > 0 ? 1 : -1;
  if (yeni !== 0 && yon !== 0 && yeni !== yon) { if (Math.abs(d.uc - tepe) >= CIRP_GENLIK) sayi++; tepe = d.uc; }
  if (yeni !== 0) yon = yeni;
  return { sayi, yon, tepe, uc: v };
}

/** Askı: kanadın ortasına bu kadar yaklaşınca yerine oturur; uçlar boynun arkasına bu kadar yaklaşınca bağlanır */
export const ASKI_YARICAPI = 220, DUGUM_YARICAPI = 140;
export const askiYerindeMi = (p: Nokta): boolean => Math.hypot(p.x - KANAT_YOLU.orta.x, p.y - KANAT_YOLU.orta.y) <= ASKI_YARICAPI;
export const dugumdeMi = (p: Nokta): boolean => Math.hypot(p.x - BAS.boyun.x, p.y - BAS.boyun.y) <= DUGUM_YARICAPI;

/** Kraker: gagaya her girişte bir ısırık (dışarı çıkıp yeniden girmek gerekir) */
export function krakerAdimi(d: { isirik: number; icerde: boolean }, gagada: boolean): { isirik: number; icerde: boolean; isirdi: boolean } {
  if (gagada && !d.icerde) return { isirik: d.isirik + 1, icerde: true, isirdi: true };
  return { isirik: d.isirik, icerde: gagada, isirdi: false };
}

/** Yakın plandaki yüz ifadesi */
export type BasPozu = keyof typeof KANAT.bas;
export interface BasDurumu { asama: Asama; ouchKalan: number; heyKalan: number; kikirKalan: number; kirtKalan: number; yayKalan: number; sasirKalan: number; gururKalan: number; konusuyor: boolean; bakiyor: boolean; kirp: boolean; an: number; }
export function basPozu(d: BasDurumu): BasPozu {
  if (d.asama === 'kutlama' || d.asama === 'son') return 'mutlu';
  if (d.ouchKalan > 0) return 'ouch';
  if (d.heyKalan > 0) return 'hey';
  if (d.kirtKalan > 0) return Math.floor(d.an / 130) % 2 ? 'kirt1' : 'kirt0';
  if (d.kikirKalan > 0) return 'kikir';
  if (d.yayKalan > 0) return 'yay';
  if (d.gururKalan > 0) return 'gurur';
  if (d.sasirKalan > 0) return 'sasir';
  if (d.konusuyor) return Math.floor(d.an / 140) % 2 ? 'gaga1' : 'gaga0';
  if (d.bakiyor) return 'bakis';
  if (d.asama === 'cirp' || d.asama === 'aski' || d.asama === 'dugum' || d.asama === 'kraker' || d.asama === 'sapka') return d.kirp ? 'kirp' : 'huzur';
  return d.kirp ? 'kirp' : 'endise';
}

export { SAHNE };
export const KAPANIS = { parlama: 400, kamera: 430, sevinc: 1150 } as const;
export const KANAT_DUGMESI: readonly [number, number] = [340, 260];
export const UC_DUGMESI = 260, PITRAK_DUGMESI = 200, SAPKA_DUGMESI = 260, TUY_DUGMESI = 260;
