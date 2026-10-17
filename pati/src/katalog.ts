/**
 * Pati Dükkânı v2: içerik kataloğu (content/pati.json → v2). DOM yok, saf.
 * Hayvan kimliği (HayvanId) türün kendisi (tarcin, findik …) ya da bir renk yavrusu (pamuk, duman …). Renk yavrusu
 * kendi türünün (temel) sevgi tablosunu kullanır; yalnız gizli sevgisi ve bir ✗'si değişir (PATI-V2 §6b).
 */
import P from '../../content/pati.json';
import type { Yas } from './ihtiyac';

export type { Yas };
export const V2 = P.v2;

export type IhtiyacAdi = 'ac' | 'susuz' | 'kirli' | 'sikildi' | 'uykulu' | 'hasta';
export const IHTIYACLAR: readonly IhtiyacAdi[] = ['ac', 'susuz', 'kirli', 'sikildi', 'uykulu', 'hasta'];
export type CekmeceAdi = 'mama' | 'su' | 'oyuncak' | 'temizlik' | 'yatak' | 'ecza';
export type KoseAdi = 'salon' | 'kemirgen' | 'akvaryum' | 'kus' | 'bahce' | 'surungen';
export type MinderRenk = 'kirmizi' | 'mavi' | 'sari' | 'yesil';
/** Vitrine ne zaman gelir: baştan, ilk alımdan sonra, köşesi açılınca */
export type VitrinZamani = 'baslangic' | 'ilk-alim' | 'kose';

export interface Sevgi {
  s: string[];
  o: string[];
  x: string[];
}
export interface HayvanBilgi {
  id: string;
  ad: string;
  tur: string;
  kose: KoseAdi;
  /** [3-4, 5-6] */
  fiyat: [number, number];
  vitrin: VitrinZamani;
  huy: string;
  /** renk yavrusu ise türünün kimliği (görsel yoksa yedek değil: renk kendi sayfasını bekler) */
  temel: string | null;
  ihtiyaclar: IhtiyacAdi[];
  sevgi: Partial<Record<IhtiyacAdi, Sevgi>>;
  ders: { esya: string; kez: number; sonuc: IhtiyacAdi; soz: string } | null;
  gizli: string | null;
}

/** Çekmece → giderdiği ihtiyaç ve açık olduğu yaşlar */
export const CEKMECELER = P.v2.cekmeceler as Record<CekmeceAdi, { ihtiyac: IhtiyacAdi; yas: Yas[] }>;

type HamTur = (typeof P.v2.hayvanlar)[keyof typeof P.v2.hayvanlar] & { ihtiyaclar?: string[]; ders?: HayvanBilgi['ders'] };
type HamRenk = { ad: string; temel: string; fiyat: number[]; vitrin: string; huy: string; gizli: string; x_ek?: Record<string, string>; x_sil?: string[] };

function turBilgi(id: string, t: HamTur): HayvanBilgi {
  const sevgi = t.sevgi as Partial<Record<IhtiyacAdi, Sevgi>>;
  return {
    id,
    ad: t.ad,
    tur: t.tur,
    kose: t.kose as KoseAdi,
    fiyat: [t.fiyat[0], t.fiyat[1]],
    vitrin: t.vitrin as VitrinZamani,
    huy: t.huy,
    temel: null,
    ihtiyaclar: (t.ihtiyaclar as IhtiyacAdi[] | undefined) ?? [...IHTIYACLAR],
    sevgi,
    ders: t.ders ?? null,
    gizli: t.gizli ?? null,
  };
}

function renkBilgi(id: string, r: HamRenk, temel: HayvanBilgi): HayvanBilgi {
  const sevgi: Partial<Record<IhtiyacAdi, Sevgi>> = {};
  const gizliIhtiyac = (Object.keys(CEKMECELER) as CekmeceAdi[]).find((c) => c === (P.v2.esyalar as Record<string, { cekmece: string }>)[r.gizli]?.cekmece);
  for (const [ih, s] of Object.entries(temel.sevgi) as [IhtiyacAdi, Sevgi][]) {
    let x = [...s.x];
    if (r.x_sil?.includes(ih)) x = [];
    const ek = r.x_ek?.[ih];
    if (ek) x = [ek];
    // renk yavrusunun yeni ✗'si ve gizli sevgisi türün listelerinden çıkar (bir eşya hem sever hem sevmez olamaz)
    const gizliBurada = gizliIhtiyac && CEKMECELER[gizliIhtiyac].ihtiyac === ih;
    const temiz = (l: string[]) => l.filter((e) => !x.includes(e) && !(gizliBurada && e === r.gizli));
    let yeni = temiz(s.s);
    // ★ boş kaldıysa (Çikolata: top ✗ oldu) gizli sevgisi açık ★ olur
    if (!yeni.length) yeni = gizliBurada ? [r.gizli] : s.s.filter((e) => !x.includes(e));
    sevgi[ih] = { s: yeni, o: temiz(s.o), x: x.filter((e) => !(gizliBurada && e === r.gizli)) };
  }
  return { ...temel, id, ad: r.ad, fiyat: [r.fiyat[0], r.fiyat[1]], vitrin: r.vitrin as VitrinZamani, huy: r.huy, temel: temel.id, sevgi, gizli: r.gizli, ders: temel.ders };
}

const TABLO = new Map<string, HayvanBilgi>();
for (const [id, t] of Object.entries(P.v2.hayvanlar)) TABLO.set(id, turBilgi(id, t as HamTur));
for (const [id, r] of Object.entries(P.v2.renkler)) TABLO.set(id, renkBilgi(id, r as HamRenk, TABLO.get((r as HamRenk).temel)!));

/** Bütün satılık hayvanlar (türler, sonra renkler; vitrin sırası buna göre) */
export const HAYVAN_IDLERI: readonly string[] = [...TABLO.keys()];
export function hayvanBilgi(id: string): HayvanBilgi {
  const b = TABLO.get(id);
  if (!b) throw new Error(`bilinmeyen hayvan: ${id}`);
  return b;
}
export const hayvanVar = (id: string) => TABLO.has(id);

/** Yaşa göre değer ([3-4, 5-6] çiftinden) */
export const yasla = (cift: readonly number[], yas: Yas) => cift[yas === 'buyuk' ? 1 : 0];

export interface EsyaBilgi {
  id: string;
  cekmece: CekmeceAdi;
  bastan: boolean;
  fiyat: [number, number];
}
const ESYALAR = new Map<string, EsyaBilgi>(
  Object.entries(P.v2.esyalar).map(([id, e]) => {
    const x = e as { cekmece: string; bastan?: boolean; fiyat?: number[] };
    return [id, { id, cekmece: x.cekmece as CekmeceAdi, bastan: !!x.bastan, fiyat: x.fiyat ? [x.fiyat[0], x.fiyat[1]] : [0, 0] }];
  }),
);
export const ESYA_IDLERI: readonly string[] = [...ESYALAR.keys()];
export function esyaBilgi(id: string): EsyaBilgi {
  const e = ESYALAR.get(id);
  if (!e) throw new Error(`bilinmeyen eşya: ${id}`);
  return e;
}
export const esyaVar = (id: string) => ESYALAR.has(id);

export const ihtiyacCekmecesi = (ih: IhtiyacAdi) => (Object.keys(CEKMECELER) as CekmeceAdi[]).find((c) => CEKMECELER[c].ihtiyac === ih)!;

export const KOSELER = P.v2.koseler as Record<KoseAdi, { fiyat: number[]; yer: number; bastan?: boolean; kosul?: string }>;
export const ORTAK_ADLAR: readonly string[] = P.v2.adlar;
export const MINDERLER = P.v2.minderler as MinderRenk[];
export const KALP_SAYISI: number = P.v2.kalp_sayisi;
export const NEHIR2 = P.v2.nehir;

/** Hayvanın seçilebilecek adları: kendi adı + 8 ortak ad (PATI-V2 §4c) */
export const adSecenekleri = (id: string) => [hayvanBilgi(id).ad, ...ORTAK_ADLAR.filter((a) => a !== hayvanBilgi(id).ad)];

// ---------------------------------------------------------------- paket 3: süsler, ziyaret sözleri, temizlik çekmecesi
export type SusYeri = 'duvar' | 'yer' | 'hali';
export interface SusBilgi {
  id: string;
  /** resmin assets altındaki yolu (uzantısız; ör. elektrik/saksi) */
  resim: string;
  yer: SusYeri;
  fiyat: [number, number];
  /** dokununca kendi işi (müzik kutusu: parti) */
  canli: string | null;
}
const SUS_TABLO = new Map<string, SusBilgi>(
  Object.entries(P.v2.susler).map(([id, s]) => {
    const x = s as { resim: string; yer: string; fiyat: number[]; canli?: string };
    return [id, { id, resim: x.resim, yer: x.yer as SusYeri, fiyat: [x.fiyat[0], x.fiyat[1]], canli: x.canli ?? null }];
  }),
);
export const SUS_IDLERI: readonly string[] = [...SUS_TABLO.keys()];
export function susBilgi(id: string): SusBilgi {
  const s = SUS_TABLO.get(id);
  if (!s) throw new Error(`bilinmeyen süs: ${id}`);
  return s;
}
/** 3-4'te temizlik çekmecesi mağazadan alınır (kayit.esyalar → 'temizlik'); 5-6'da baştan var */
export const TEMIZLIK_CEKMECESI = 'temizlik';
export const temizlikFiyati = (yas: Yas) => yasla(P.v2.temizlik_cekmecesi.fiyat, yas);
/** Ziyaret sözleri (content/pati.json → v2.ziyaret) */
export const ZIYARET = P.v2.ziyaret;
