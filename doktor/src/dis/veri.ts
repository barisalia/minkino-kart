// Minik Doktor · ikinci vaka: "Mino'nun Kurabiyeli Dişleri" (ekip/senaryo/MINIK-DOKTOR.md vaka 7). Aynı klinik masası,
// yeni hasta ve yeni aletler: ağız feneri, diş macunu (3 tat), diş fırçası, su bardağı. Yeni parmak hareketleri:
// macunu kıllara sürerek sıkmak, ileri geri fırçalamak, şişik yanaklara dokunmak.
// Çizimler Astra'dan: Paket Doktor-Y2 (CLAUDE-ASTRA-MESAJLAR.md, 22 Kasım 19:46); adlar ve ölçüler o brief'le birebirdir.
// Saf veri ve hesap: DOM yok, birim testleri buradan sınar.
import { HUB, SAHNE, VAKA, YAKIN, type Kutu, type Nokta, type Yas } from '../vaka/veri';

/** Paketin 26 çizimi (assets/doktor/dis/<ad>.webp). */
export const DIS = {
  agizFon: 'agiz-fon',
  bas: { kapali: 'mino-yakin-kapali', acik: 'mino-yakin-acik', acikKikir: 'mino-yakin-acik-kikir', sisik: 'mino-yakin-sisik', gulen: 'mino-yakin-gulen' },
  disKirli: 'disler-kirli', disTemiz: 'disler-temiz',
  uzgun: ['mino-uzgun-0', 'mino-uzgun-1'], uzgunKirp: 'mino-uzgun-kirp', sevinc: ['mino-sevinc-0', 'mino-sevinc-1'],
  fenerKapali: 'fener-kapali', fenerAcik: 'fener-acik', firca: 'firca', bardakDolu: 'bardak-dolu', bardakBos: 'bardak-bos',
  macunlar: ['macun-nane', 'macun-portakal', 'macun-sade'], seritler: ['serit-nane', 'serit-portakal', 'serit-sade'],
  isik: 'isik', su: 'su',
} as const;
export const DIS_DOSYALAR: readonly string[] = Object.values(DIS).flatMap(v => (typeof v === 'string' ? [v] : Array.isArray(v) ? [...v] : Object.values(v as Record<string, string>)));
/** Dikenli Pati'den aynen kullanılan çizimler (assets/doktor/vaka/): aynı klinik, aynı çanta, aynı şerit. */
export const ORTAK = { hubFon: VAKA.hubFon, cantaKapali: VAKA.cantaKapali, cantaAcik: VAKA.cantaAcik, serit: VAKA.serit, kopuk: VAKA.kopuk, pof: VAKA.pof, yildiz: VAKA.yildiz } as const;
export const ORTAK_DOSYALAR: readonly string[] = Object.values(ORTAK).flat();

/** Çizimlerin tuval boyutu (px). */
export const TUVAL: Readonly<Record<string, readonly [number, number]>> = {
  'agiz-fon': [2048, 1152],
  'mino-yakin-kapali': [2048, 1152], 'mino-yakin-acik': [2048, 1152], 'mino-yakin-acik-kikir': [2048, 1152], 'mino-yakin-sisik': [2048, 1152], 'mino-yakin-gulen': [2048, 1152],
  'disler-kirli': [2048, 1152], 'disler-temiz': [2048, 1152],
  'mino-uzgun-0': [1000, 940], 'mino-uzgun-1': [1000, 940], 'mino-uzgun-kirp': [1000, 940], 'mino-sevinc-0': [1000, 940], 'mino-sevinc-1': [1000, 940],
  'fener-kapali': [600, 600], 'fener-acik': [600, 600], firca: [600, 600], 'bardak-dolu': [600, 600], 'bardak-bos': [600, 600],
  'macun-nane': [300, 600], 'macun-portakal': [300, 600], 'macun-sade': [300, 600],
  'serit-nane': [220, 70], 'serit-portakal': [220, 70], 'serit-sade': [220, 70],
  isik: [600, 600], su: [200, 400],
};
export const OPAK: readonly string[] = [DIS.agizFon];

// ——— masa: Mino, Zıpzıp'ın yerinde durur (aynı tuval, aynı kutu)
export const MASA = {
  mino: HUB.zipzip,
  /** Mino'nun ağzı (dokunulacak yer) ve göğsü (yıldızın yeri), sahne pikseli */
  agiz: { x: HUB.zipzip.sol + 575, y: HUB.zipzip.ust + 372 } as Nokta,
  gogus: { x: HUB.zipzip.sol + 575, y: HUB.zipzip.ust + 520 } as Nokta,
  yaklasma: { x: HUB.zipzip.sol + 575, y: HUB.zipzip.ust + 330, olcek: 2.4 },
} as const;

// ——— yakın plan: Mino'nun başı ve açık ağzı
export const AGIZ = {
  merkez: { x: 860, y: 700 } as Nokta,
  /** fenerin "ağzın içinde" sayıldığı elips (yarı eksenler) */
  yariEn: 330, yariBoy: 230,
  ustDis: { sol: 610, ust: 585, g: 500, y: 105 } as Kutu,
  altDis: { sol: 630, ust: 765, g: 460, y: 85 } as Kutu,
  yanaklar: [{ x: 500, y: 640 }, { x: 1220, y: 640 }] as readonly Nokta[],
  yanakYaricapi: 170,
  /** fırça havlunun üstünde durur: çizim tuvalinin (600 × 600) sahnedeki kutusu ve kılların üst yüzü */
  fircaYeri: { sol: 1430, ust: 240, g: 600, y: 600 } as Kutu,
  killar: { sol: 1490, sag: 1690, y: 470 },
  serit: YAKIN.serit,
} as const;

export type Asama = 'giris' | 'canta' | 'fener' | 'macun' | 'firca' | 'bardak' | 'calkala' | 'kutlama' | 'son';
export const ASAMALAR: readonly Asama[] = ['giris', 'canta', 'fener', 'macun', 'firca', 'bardak', 'calkala', 'kutlama', 'son'];
export const sonrakiAsama = (a: Asama): Asama => ASAMALAR[Math.min(ASAMALAR.length - 1, ASAMALAR.indexOf(a) + 1)];

/** Yaş basamakları: küçükte daha az diş bölmesi, daha az sürtme, daha az dokunuş. */
export interface Zorluk { /** bir diş sırasındaki bölme sayısı */ sutun: number; /** bir bölmenin temizlenmesi için fırçanın o bölmede gideceği yol (px) */ surtme: number; /** yanaklara dokunuş sayısı */ calkala: number; }
export const ZORLUK: Record<Yas, Zorluk> = {
  '2-3': { sutun: 3, surtme: 110, calkala: 3 },
  '4': { sutun: 4, surtme: 140, calkala: 4 },
  '5+': { sutun: 5, surtme: 160, calkala: 4 },
};

// ——— aletler: çizimde tutulan yer ve iş yapan uç, 0–1 oran (tuvale göre)
export type AletAdi = 'fener' | 'macun' | 'firca' | 'bardak';
export interface Alet { ad: AletAdi; /** eldeki eni ve boyu (sahne pikseli) */ g: number; y: number; tut: readonly [number, number]; uc: readonly [number, number]; }
export const ALETLER: Readonly<Record<AletAdi, Alet>> = {
  fener: { ad: 'fener', g: 440, y: 440, tut: [0.5, 0.8], uc: [0.5, 60 / 600] },
  macun: { ad: 'macun', g: 210, y: 420, tut: [0.5, 0.3], uc: [0.5, 580 / 600] },
  firca: { ad: 'firca', g: 600, y: 600, tut: [0.75, 0.48], uc: [160 / 600, 235 / 600] },
  bardak: { ad: 'bardak', g: 380, y: 380, tut: [0.5, 0.6], uc: [0.5, 150 / 600] },
};
/** Şeritteki yuvalar: fener, macun (seçim anında üç tüp), fırça (macun aşamasında havluya geçer), bardak. */
export const ALET_SIRASI: readonly AletAdi[] = ['fener', 'macun', 'firca', 'bardak'];
export const asamaAleti = (a: Asama): AletAdi | null => (a === 'fener' || a === 'macun' || a === 'firca' || a === 'bardak' ? a : null);

/** Mino'nun sözleri (emir yok: duygu ve tepki) ve bu vakaya özgü efektler (assets/doktor/dis/ses/). */
export const SOZLER = {
  'm-yapis': 'Çok kurabiye yedim! Dişlerim yapış yapış!',
  'm-canta': 'Aa! Diş fırçası!',
  'm-aaa': 'Aaaaa!',
  'm-nane': 'Mmm, nane!',
  'm-portakal': 'Mmm, portakal!',
  'm-sade': 'Mmm, mis gibi!',
  'm-gidik': 'Hi hi! Fırça gıdıklıyor!',
  'm-parlak': 'Bak! Dişlerim yıldız gibi parlıyor!',
  'm-tesekkur': 'Teşekkürler doktor!',
} as const;
export type SozAdi = keyof typeof SOZLER;
export const MACUN_SOZLERI: readonly SozAdi[] = ['m-nane', 'm-portakal', 'm-sade'];
export const EFEKTLER = ['d-fener', 'd-fist', 'd-fircala', 'd-likir', 'd-blup', 'd-isilti'] as const;
export type EfektAdi = (typeof EFEKTLER)[number];
/** Dikenli Pati'den aynen kullanılan efektler (assets/doktor/vaka/ses/). */
export const ORTAK_EFEKTLER = ['e-cit', 'e-tik', 'e-vuu', 'e-pof', 'e-cin', 'e-pat'] as const;

// ——— mekaniklerin saf hesabı

/** Fener: ucu ağzın içine bakıyor mu? */
export const agizdaMi = (p: Nokta): boolean => ((p.x - AGIZ.merkez.x) / AGIZ.yariEn) ** 2 + ((p.y - AGIZ.merkez.y) / AGIZ.yariBoy) ** 2 <= 1;
export const AC_MS = 320;      // fener bu kadar ağza tutulunca Mino "Aaaa" der
export const INCELE_MS = 900;  // ağız açıkken ışık bu kadar gezdirilince kırıntılar görülmüş sayılır
/** Fener birikimi: ağza tutuldukça artar; çekilince yavaşça azalır (ağız açıldıktan sonra geri gitmez). */
export const fenerAdimi = (birikim: number, agizda: boolean, dt: number): number => (agizda ? Math.min(AC_MS + INCELE_MS, birikim + dt) : birikim >= AC_MS ? birikim : Math.max(0, birikim - dt * 0.5));

/** Macun: tüpün ucu kılların üstünde gezdikçe şerit uzar. Şerit, ucun gezdiği en sol ve en sağ nokta arasıdır. */
export interface MacunDurumu { sol: number | null; sag: number | null; }
export const macunBaslangici = (): MacunDurumu => ({ sol: null, sag: null });
export const MACUN_YAKINLIGI = 95;
export function macunAdimi(d: MacunDurumu, uc: Nokta): MacunDurumu {
  const k = AGIZ.killar;
  if (Math.abs(uc.y - k.y) > MACUN_YAKINLIGI || uc.x < k.sol - 50 || uc.x > k.sag + 50) return d;
  const x = Math.max(k.sol, Math.min(k.sag, uc.x));
  return { sol: d.sol === null ? x : Math.min(d.sol, x), sag: d.sag === null ? x : Math.max(d.sag, x) };
}
export const macunOrani = (d: MacunDurumu): number => (d.sol === null || d.sag === null ? 0 : (d.sag - d.sol) / (AGIZ.killar.sag - AGIZ.killar.sol));
export const MACUN_TAMAM = 0.85;

/** Fırça: dişler bölmelere ayrılır (üst sıra, sonra alt sıra). Fırça bir bölmenin üstünde yol aldıkça o bölme temizlenir. */
export interface Bolme extends Kutu { sira: 0 | 1; }
export function bolmeler(sutun: number): Bolme[] {
  const b: Bolme[] = [];
  ([AGIZ.ustDis, AGIZ.altDis] as const).forEach((d, sira) => {
    for (let i = 0; i < sutun; i++) b.push({ sol: d.sol + (d.g / sutun) * i, ust: d.ust, g: d.g / sutun, y: d.y, sira: sira as 0 | 1 });
  });
  return b;
}
/** Fırçanın başı hangi bölmenin üstünde (dişin biraz dışına taşmak da sayılır); yoksa −1. */
export function bolmeBul(b: readonly Bolme[], p: Nokta, pay = 45): number {
  return b.findIndex(k => p.x >= k.sol && p.x < k.sol + k.g && p.y >= k.ust - pay && p.y <= k.ust + k.y + pay);
}
/** Bir adımda sayılan en uzun yol: parmak sıçrarsa (çok hızlı kare) bölme bir anda dolmaz. */
export const ADIM_SINIRI = 80;
export function fircaAdimi(yol: readonly number[], b: readonly Bolme[], once: Nokta | null, simdi: Nokta): { yol: number[]; bolme: number } {
  const i = bolmeBul(b, simdi);
  if (i < 0 || !once) return { yol: [...yol], bolme: i };
  const yeni = [...yol];
  yeni[i] += Math.min(ADIM_SINIRI, Math.hypot(simdi.x - once.x, simdi.y - once.y));
  return { yol: yeni, bolme: i };
}
export const temizBolme = (yol: readonly number[], surtme: number): number => yol.filter(v => v >= surtme).length;
/** Fırçalama biter: en çok bir bölme eksik kalabilir (küçük parmak köşeyi kaçırırsa takılmaz). */
export const fircaBitti = (yol: readonly number[], surtme: number): boolean => temizBolme(yol, surtme) >= yol.length - 1;

/** Bardak: ağız kenarı Mino'nun ağzına tutulunca su dökülür. */
export const DOK_MS = 550;
export const dokmeAdimi = (birikim: number, agizda: boolean, dt: number): number => (agizda ? Math.min(DOK_MS, birikim + dt) : Math.max(0, birikim - dt));

/** Çalkalama: hangi yanağa dokunuldu (0 sol, 1 sağ); yoksa −1. */
export const yanakBul = (p: Nokta): number => AGIZ.yanaklar.findIndex(y => Math.hypot(p.x - y.x, p.y - y.y) <= AGIZ.yanakYaricapi);

/** Yakın plandaki baş pozu. */
export type BasPozu = keyof typeof DIS.bas;
export const KIKIR_MS = 800;
export function basPozu(d: { asama: Asama; agizAcik: boolean; suAgizda: boolean; kikirKalan: number }): BasPozu {
  if (d.asama === 'kutlama' || d.asama === 'son') return 'gulen';
  if (d.asama === 'calkala' || (d.asama === 'bardak' && d.suAgizda)) return 'sisik';
  if (d.asama === 'firca') return d.kikirKalan > 0 ? 'acikKikir' : 'acik';
  if (d.asama === 'bardak') return 'acik';
  if (d.asama === 'fener') return d.agizAcik ? 'acik' : 'kapali';
  return 'kapali';
}
/** Dişler ayrı katmandır; yalnız ağız açıkken görünür. */
export const dislerGorunur = (p: BasPozu): boolean => p === 'acik' || p === 'acikKikir';

export { SAHNE };

/**
 * Kapanış kısa tutulur (bitiş sevinci en çok 2 sn): son çalkalamadan sonra dişlerin parlaması, masaya dönüş (kamera) ve
 * masadaki sevinç; toplamı dolunca "yeniden oyna" düğmesi hazırdır.
 */
export const KAPANIS = { parlama: 450, kamera: 430, sevinc: 1100 } as const;
/** Şeritteki macun tüpünün ve masadaki ağız düğmesinin dokunma kutusu (çizim içinde ortalanır). */
export const TUP_DUGMESI: readonly [number, number] = [200, 200];
export const AGIZ_DUGMESI: readonly [number, number] = [330, 224];
