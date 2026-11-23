// "Önce Kuzu" kanıt sahnesinin akışı (çekim listesi K1–K5: ekip/senaryo/MINIK-DOKTOR-ZIPZIP-CEKIM-LISTESI.md).
// Her adım ne göründüğünü, hangi kaydın çaldığını ve neyle bittiğini söyler: süre, kaydın bitmesi ya da çocuğun eylemi.
// Konuşma yalnız ağız dizisi olan duruşlarda dudakla oynar; Zıpzıp Kuzu'nun arkasındayken ağzı görünmez (ağız dizisi gerekmez).
// Saf veri ve motor: DOM yok. Sahneyi sahne.ts yürütür, birim testleri buradan sınar.
import { AkisMotoru, yazilanSure as motorSuresi } from '../motor/akis';
import { K1, type AgizDizisi, type DiziAdi } from './diziler';

export type Plan = 'genis' | 'orta' | 'yakin';
export type CocukOlayi = 'steto-alindi' | 'kuzu-dinlendi' | 'gogse-degdi' | 'kalp-tutuldu';

/** Bir karakterin o adımdaki görüntüsü: bir hareket dizisi ya da tutulan tek poz (kırpma anlarıyla). */
export type Gorunum =
  | { dizi: DiziAdi }
  | { poz: string; kirp?: string; kirpAnlari?: readonly number[] }
  /** Kuzu'nun arkasında konuşurken kulaklar sözle oynar: ses varken ilk, sessizken ikinci poz */
  | { kulak: readonly [string, string] };

export interface Konusma {
  kim: 'kino' | 'zipzip';
  ad: string;
  /** adımın başından kaç ms sonra başlar */
  gecikme?: number;
  /** dudakla oynatılacak ağız dizisi; null: ağız görünmüyor ya da tepki sesi */
  agiz: AgizDizisi | null;
  /** ağız dizisi kaydın bu ms'sinden sonra devreye girer (öncesinde adımın pozu görünür) */
  agizBas?: number;
  /** sessizlikte ağız hangi karede dinlenir: 0 kapalı (endişeli), 5 kapalı gülümseme */
  dinlenme?: 0 | 5;
}

export type Bitis =
  | { tur: 'sure'; ms: number }
  /** kayıt bitince, üstüne ek ms */
  | { tur: 'ses'; ek?: number }
  | { tur: 'cocuk'; olay: CocukOlayi };

export interface Adim {
  ad: string;
  plan: Plan;
  /** orta ve geniş plandaki Zıpzıp, Kino; yakın plandaki Zıpzıp. Verilmeyen önceki adımdaki gibi kalır. */
  zipzip?: Gorunum;
  kino?: Gorunum;
  yakin?: Gorunum;
  ses?: Konusma;
  efekt?: readonly { ad: string; gecikme?: number; kazanc?: number }[];
  bitis: Bitis;
}

const z = K1;
const OTUR = z.zipzipOturAgiz[0];
const GOSTER = z.kinoGoster[3];

/** Sahnenin on iki repliği, çalma sırasıyla (assets/doktor/zipzip-diz/ses/<ad>.mp3; Scribe ile doğrulandı). */
export const REPLIKLER: readonly { ad: string; kim: 'kino' | 'zipzip'; metin: string }[] = [
  { ad: 'z1-hop', kim: 'zipzip', metin: 'Hop!' },
  { ad: 'k1-steto', kim: 'kino', metin: 'Bu stetoskop. Kalbin şarkısını dinler.' },
  { ad: 'z1-irkil', kim: 'zipzip', metin: 'Hı!' },
  { ad: 'z1-soguk-mu', kim: 'zipzip', metin: 'O ne? Çok mu soğuk?' },
  { ad: 'k1-once-kuzu', kim: 'kino', metin: 'Önce Kuzu’yu dinleyelim mi?' },
  { ad: 'z1-kuzu-davul', kim: 'zipzip', metin: 'Aa! Kuzu’nun davulu var!' },
  { ad: 'z1-ben-de', kim: 'zipzip', metin: 'Ben de! Ben de!' },
  { ad: 'z1-serin', kim: 'zipzip', metin: 'Hii, serinmiş!' },
  { ad: 'z1-kikir', kim: 'zipzip', metin: '(kıkırdar)' },
  { ad: 'z1-davul', kim: 'zipzip', metin: 'İçimde davul var!' },
  { ad: 'z1-bir-daha', kim: 'zipzip', metin: 'Bir daha, bir daha!' },
  { ad: 'k1-ikiniz', kim: 'kino', metin: 'İkinizin davulu da çok güzel çalıyor!' },
];
/** Kayıtların süresi (ms; kırpılmış dosyalardan ölçüldü). Sahne gerçek süreyi ses dosyasından alır; bu tablo planlama ve test için. */
export const KAYIT_MS: Record<string, number> = {
  'z1-hop': 520, 'k1-steto': 3470, 'z1-irkil': 650, 'z1-soguk-mu': 1820, 'k1-once-kuzu': 1850, 'z1-kuzu-davul': 2060,
  'z1-ben-de': 1430, 'z1-serin': 1640, 'z1-kikir': 1560, 'z1-davul': 1460, 'z1-bir-daha': 1720, 'k1-ikiniz': 2630,
};
/** Sahnenin efektleri (aynı klasörde). */
export const EFEKTLER = ['e1-basamak', 'e1-minder', 'e1-oyuncak-davul', 'e1-deg', 'e1-gum'] as const;

export const ONCE_KUZU: readonly Adim[] = [
  // K1 · geniş: Kuzu kolunda, basamaktan muayene masasına çıkar
  { ad: 'k1-bekle', plan: 'genis', zipzip: { poz: z.zipzipTirman[0] }, kino: { poz: z.kinoGoster[0] }, bitis: { tur: 'sure', ms: 500 } },
  { ad: 'k1-tirman', plan: 'genis', zipzip: { dizi: 'zipzip-tirman' }, ses: { kim: 'zipzip', ad: 'z1-hop', gecikme: 690, agiz: null },
    efekt: [{ ad: 'e1-basamak', gecikme: 520 }, { ad: 'e1-minder', gecikme: 1080 }], bitis: { tur: 'sure', ms: 1600 } },
  { ad: 'k1-yerles', plan: 'genis', zipzip: { poz: OTUR, kirp: z.zipzipOturKirp, kirpAnlari: [450] }, bitis: { tur: 'sure', ms: 1100 } },
  // K2 · orta: Kino stetoskobu gösterir, Zıpzıp irkilip Kuzu'nun arkasına saklanır
  { ad: 'k2-goster', plan: 'orta', kino: { dizi: 'kino-goster' }, zipzip: { poz: z.zipzipOturBak }, bitis: { tur: 'sure', ms: 900 } },
  { ad: 'k2-steto', plan: 'orta', kino: { poz: GOSTER }, ses: { kim: 'kino', ad: 'k1-steto', agiz: 'kino-steto', dinlenme: 5 }, bitis: { tur: 'ses', ek: 150 } },
  { ad: 'k2-irkil', plan: 'orta', zipzip: { dizi: 'zipzip-saklan' }, kino: { poz: GOSTER, kirp: z.kinoKirp, kirpAnlari: [520] },
    ses: { kim: 'zipzip', ad: 'z1-irkil', agiz: null }, bitis: { tur: 'sure', ms: 900 } },
  { ad: 'k2-soguk-mu', plan: 'orta', zipzip: { kulak: [z.zipzipSaklan[2], z.zipzipSaklan[3]] }, ses: { kim: 'zipzip', ad: 'z1-soguk-mu', agiz: null }, bitis: { tur: 'ses', ek: 300 } },
  // K3 · orta: önce Kuzu dinlenir
  { ad: 'k3-once-kuzu', plan: 'orta', zipzip: { poz: z.zipzipSaklan[3] }, kino: { poz: GOSTER }, ses: { kim: 'kino', ad: 'k1-once-kuzu', agiz: 'kino-steto', dinlenme: 5 }, bitis: { tur: 'ses', ek: 100 } },
  { ad: 'k3-egil', plan: 'orta', kino: { dizi: 'kino-egil' }, bitis: { tur: 'sure', ms: 700 } },
  { ad: 'k3-al', plan: 'orta', kino: { poz: z.kinoEgil[3] }, bitis: { tur: 'cocuk', olay: 'steto-alindi' } },
  { ad: 'k3-kuzu', plan: 'orta', kino: { poz: z.kinoEgilBos }, bitis: { tur: 'cocuk', olay: 'kuzu-dinlendi' } },
  { ad: 'k3-davul', plan: 'orta', zipzip: { dizi: 'zipzip-merak-cik' }, efekt: [{ ad: 'e1-oyuncak-davul' }], bitis: { tur: 'sure', ms: 900 } },
  { ad: 'k3-kuzu-davul', plan: 'orta', zipzip: { poz: z.zipzipMerak[1] }, ses: { kim: 'zipzip', ad: 'z1-kuzu-davul', agiz: null }, bitis: { tur: 'ses', ek: 150 } },
  { ad: 'k3-ben', plan: 'orta', zipzip: { dizi: 'zipzip-merak-ben' }, bitis: { tur: 'sure', ms: 800 } },
  // K4 · yakın plan: çocuk Zıpzıp'ın kalbini dinler
  { ad: 'k4-yaklas', plan: 'yakin', yakin: { poz: z.yakinBak }, bitis: { tur: 'sure', ms: 950 } },
  { ad: 'k4-ben-de', plan: 'yakin', yakin: { poz: z.yakinAgiz[5] }, ses: { kim: 'zipzip', ad: 'z1-ben-de', agiz: 'zipzip-yakin', dinlenme: 5 }, bitis: { tur: 'ses', ek: 250 } },
  { ad: 'k4-dinle', plan: 'yakin', yakin: { poz: z.yakinDinle, kirp: z.yakinKirp, kirpAnlari: [900, 4200, 7800] }, bitis: { tur: 'cocuk', olay: 'gogse-degdi' } },
  { ad: 'k4-serin', plan: 'yakin', yakin: { dizi: 'yakin-saskin' }, ses: { kim: 'zipzip', ad: 'z1-serin', agiz: 'zipzip-yakin', agizBas: 560, dinlenme: 5 },
    efekt: [{ ad: 'e1-deg' }], bitis: { tur: 'ses', ek: 200 } },
  { ad: 'k4-kalp', plan: 'yakin', yakin: { poz: z.yakinDinle, kirp: z.yakinKirp, kirpAnlari: [1500, 5200, 9000] }, bitis: { tur: 'cocuk', olay: 'kalp-tutuldu' } },
  { ad: 'k4-kikir', plan: 'yakin', yakin: { dizi: 'yakin-kikir' }, ses: { kim: 'zipzip', ad: 'z1-kikir', agiz: null }, bitis: { tur: 'ses', ek: 50 } },
  { ad: 'k4-davul', plan: 'yakin', yakin: { poz: z.yakinAgiz[5] }, ses: { kim: 'zipzip', ad: 'z1-davul', agiz: 'zipzip-yakin', dinlenme: 5 }, bitis: { tur: 'ses', ek: 350 } },
  { ad: 'k4-bir-daha', plan: 'yakin', yakin: { poz: z.yakinAgiz[5] }, ses: { kim: 'zipzip', ad: 'z1-bir-daha', agiz: 'zipzip-yakin', dinlenme: 5 }, bitis: { tur: 'ses', ek: 200 } },
  { ad: 'k4-serbest', plan: 'yakin', yakin: { poz: z.yakinDinle, kirp: z.yakinKirp, kirpAnlari: [800] }, bitis: { tur: 'sure', ms: 2600 } },
  // K5 · orta: geri açılır, sevinç
  { ad: 'k5-ac', plan: 'orta', zipzip: { dizi: 'zipzip-kuzu-kaldir' }, kino: { poz: GOSTER }, bitis: { tur: 'sure', ms: 900 } },
  { ad: 'k5-ikiniz', plan: 'orta', kino: { poz: GOSTER }, ses: { kim: 'kino', ad: 'k1-ikiniz', agiz: 'kino-steto', dinlenme: 5 }, bitis: { tur: 'ses', ek: 100 } },
  { ad: 'k5-gul', plan: 'orta', kino: { dizi: 'kino-gul' }, bitis: { tur: 'sure', ms: 1700 } },
];

/** Bir görünümün kullanabileceği bütün çizimler (denetim ve ön yükleme için). */
export function gorunumCizimleri(g: Gorunum | undefined, diziKareleri: (ad: DiziAdi) => readonly string[]): string[] {
  if (!g) return [];
  if ('dizi' in g) return [...diziKareleri(g.dizi)];
  if ('kulak' in g) return [...g.kulak];
  return g.kirp ? [g.poz, g.kirp] : [g.poz];
}

/** Akış motoru ortak modülde (motor/akis.ts); burada bu sahnenin adım ve olay türleriyle kullanılır. */
export class Akis extends AkisMotoru<Adim, CocukOlayi> {}

/** Çocuğun eylemleri dışında sahnenin süresi (ms). */
export const yazilanSure = (adimlar: readonly Adim[] = ONCE_KUZU, kayitMs: (ad: string) => number = ad => KAYIT_MS[ad] ?? 0): number => motorSuresi(adimlar, kayitMs);
