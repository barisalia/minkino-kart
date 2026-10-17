/**
 * Pati Dükkânı: TEK GÖRSEL HARİTASI. Dosya adları ekip/senaryo/PATI-V2.md §11 (v1: ekip/OYUN-GELISTIRME-3GUN.md §2-3).
 *
 * Gemini çizimi gelince (ekip/illustrator/pati/pati-isle.cjs keser) dosya `assets/pati/<ad>.webp` olur; kod değişmez:
 * Vite derlemede klasörü tarar, dosya varsa o kullanılır, yoksa sıradaki yedek:
 * - hayvan pozu: `<hayvan>-<poz>.webp` → aynı hâlin yakın pozu (POZ_YEDEK) → ana poz → model / kadro kesimi (geçici;
 *   kod beden hareketiyle anlatır: data-yedek)
 * - eşya: `esya-<ad>.webp` → salonun içinden kesilmiş aynı stildeki `gecici-<ad>.webp`
 * - arayüz (ui-jeton sayfası, Gün 1): gelene kadar SADE YER TUTUCU (Pasta'nın jetonu ve kavanozu, düz kalp); kodla süslü
 *   çizim yok.
 *
 * NETLİK (src/ui/netlik.ts): hiçbir resim kaynak pikselinin üstüne büyütülmez; DPR 3 sayılır → css boyu ≤ doğal px / 3.
 */
import gozYamaJson from '../../assets/pati/goz-yama.json';
import gecici from '../../assets/pati/gecici-yer.json';
import { dogalBoyu, NETLIK_DPR } from '../../src/ui/netlik';

const DOSYALAR = import.meta.glob<string>('../../assets/pati/*.webp', { eager: true, query: '?url', import: 'default' });
const YENIDEN = import.meta.glob<string>(['../../assets/kino-otobus/kase.webp', '../../assets/pasta/jeton-1.webp', '../../assets/pasta/kumbara-kavanoz-1.webp'], { eager: true, query: '?url', import: 'default' });
const yedekDosya = (ad: string) => Object.entries(YENIDEN).find(([y]) => y.endsWith(`/${ad}.webp`))?.[1] ?? null;

const tablo = new Map<string, string>();
for (const [yol, url] of Object.entries(DOSYALAR)) {
  const m = /([^/\\]+)\.webp$/.exec(yol);
  if (m) tablo.set(m[1], url);
}

/** Dosyası olan ilk adın adresi */
export function adres(...adlar: string[]): string | null {
  for (const a of adlar) {
    const u = tablo.get(a);
    if (u) return u;
  }
  return null;
}
export const varMi = (ad: string) => tablo.has(ad);

/** Salon arka planı (gündüz; gece eşi G7 gelince salon-gece) */
export const SALON = adres('salon-gunduz')!;
export const SALON_GECE = adres('salon-gece');
/** v2 arka planları (2752×1536): yavru vitrini, Bakım Odası (paket 2), dükkânın önü (Gün 2; yoksa açılış içeride) */
export const VITRIN = adres('vitrin-ic') ?? SALON;
export const BAKIM_ODASI = adres('bakim-odasi');
export const DIS_VITRIN = adres('dis-vitrin');
export const ARKA_W = 2752;
export const ARKA_H = 1536;

/** Bir resmin ekranda en çok kaç css px boy olabileceği (netlik: doğal px / DPR 3); bilinmiyorsa null */
export function enCokCssBoy(url: string): number | null {
  const d = dogalBoyu(url);
  return d ? d[1] / NETLIK_DPR : null;
}

// ---------------------------------------------------------------- hayvan pozları
/**
 * Hayvanın pozları. H (hareket): bos, goz, ac, oyun, yiyor, uyku, sevinc, ozel (v1: top, atla, rahat, usudu, uykulu,
 * yuz1-2). B (bakım): susamis, iciyor, kirli, fircalanma, esneme, sikildi, hasta, hapsirma. T (tepki ve dans):
 * begenmedi, iyy, saskin, islak, silkelen, dans-a, dans-b, dans-c.
 */
export type Poz =
  | 'bos' | 'goz' | 'ac' | 'oyun' | 'usudu' | 'yiyor' | 'uyku' | 'sevinc' | 'top' | 'atla' | 'rahat' | 'uykulu' | 'yuz1' | 'yuz2' | 'ozel'
  | 'susamis' | 'iciyor' | 'kirli' | 'fircalanma' | 'esneme' | 'sikildi' | 'hasta' | 'hapsirma'
  | 'begenmedi' | 'iyy' | 'saskin' | 'islak' | 'silkelen' | 'dans-a' | 'dans-b' | 'dans-c';
const POZ_YEDEK: Record<Poz, Poz[]> = {
  bos: [],
  goz: [],
  ac: [],
  oyun: [],
  usudu: [],
  yiyor: ['ac'],
  uyku: ['rahat', 'uykulu'],
  sevinc: ['atla'],
  top: [],
  atla: ['sevinc', 'oyun'],
  rahat: ['uyku'],
  // uyku pozuna düşmez: akşam "Herkes uyusun" denince hayvan uyanık sallanır, dokununca kıvrılır (yoksa dokunuş görünmez)
  uykulu: [],
  yuz1: [],
  yuz2: [],
  ozel: ['oyun'],
  susamis: [],
  iciyor: ['yiyor'],
  kirli: [],
  // okşanma keyfi: gözler kapalı (H sayfasının göz karesi aynı duruşta)
  fircalanma: ['rahat', 'goz'],
  esneme: ['uykulu'],
  sikildi: [],
  hasta: [],
  hapsirma: [],
  begenmedi: [],
  iyy: ['begenmedi'],
  saskin: [],
  islak: [],
  silkelen: [],
  'dans-a': ['sevinc', 'atla'],
  'dans-b': ['oyun', 'atla'],
  'dans-c': ['ozel', 'top', 'sevinc'],
};
export const POZLAR = Object.keys(POZ_YEDEK) as Poz[];

/** Poz sayfası gelmeden kullanılan tek resim (model / kadro kesimi) */
const modelAdlari = (h: string) => [`${h}-model`, `kadro-a-${h}`, `kadro-b-${h}`, `kadro-c-${h}`];
/** Balığın "boş" pozu yüzme karesi */
const anaPoz = (h: string) => (h === 'piril' ? 'yuz1' : 'bos');

/** Hayvanın hiç resmi var mı (renk yavrusu kendi sayfası gelene kadar yok: vitrine çıkmaz) */
export const hayvanGorseliVar = (h: string) => !!adres(`${h}-${anaPoz(h)}`, ...modelAdlari(h));

/** Pozun adresi ve gerçek poz mu (false: modele düştü; kod beden hareketiyle anlatır) */
export function pozAdresi(h: string, p: Poz): { url: string; gercek: boolean } {
  const ad = p === 'bos' ? anaPoz(h) : p;
  for (const x of [ad, ...POZ_YEDEK[p]]) {
    const u = adres(`${h}-${x}`);
    if (u) return { url: u, gercek: true };
  }
  const ana = adres(`${h}-${anaPoz(h)}`);
  return { url: ana ?? adres(...modelAdlari(h)) ?? adres('kadro-a-findik')!, gercek: false };
}
/** Pozun KENDİ çizimi var mı (yedeğe düşmeden) */
export const pozVar = (h: string, p: Poz) => varMi(`${h}-${p === 'bos' ? anaPoz(h) : p}`);
/** Hayvanın tüm poz adresleri (önden yükleme) */
export function hayvanAdresleri(h: string): string[] {
  return [...new Set(POZLAR.map((p) => pozAdresi(h, p).url))];
}

/** Göz kırpma yaması: resmin adresi ve ana pozun oranı olarak kutusu (yoksa null: göz kırpma yok) */
export function gozYamasi(h: string): { url: string; x: number; y: number; w: number; h: number } | null {
  const k = (gozYamaJson as Record<string, { x: number; y: number; w: number; h: number }>)[h];
  const u = adres(`${h}-goz-yama`);
  return k && u && varMi(`${h}-${anaPoz(h)}`) ? { url: u, ...k } : null;
}

// ---------------------------------------------------------------- arayüz (ui-jeton sayfası; gelene kadar yer tutucu)
/** Pati jetonu (yer tutucu: Pasta'nın jetonu) */
export const JETON = adres('ui-jeton') ?? yedekDosya('jeton-1')!;
/** Büyük jeton (5-6; yer tutucu: aynı jeton, CSS ile iri ve turuncu kenarlı) */
export const BUYUK_JETON = adres('ui-buyuk-jeton');
/** Kumbara: cam pati kavanozu (yer tutucu: Pasta'nın kavanozu) */
export const KUMBARA = adres('ui-kumbara') ?? yedekDosya('kumbara-kavanoz-1')!;
/** Kalpler (yoksa sade düz kalp, CSS) */
export const KALP_DOLU = adres('ui-kalp-dolu');
export const KALP_BOS = adres('ui-kalp-bos');
/** İsim tabelası (yoksa sade krem levha, CSS) */
export const ISIM_TABELASI = adres('ui-isim-tabelasi');
/** Fiyat etiketi (yoksa vitrinin kendi tahta etiket yuvası + sade levha) */
export const ETIKET = adres('ui-etiket');
/**
 * Minder: esya-5-yatak sayfasının beyaz minderi gelince 4 renge çarpma karışımıyla boyanır (kontur koyu kalır).
 * Gelene kadar v1 battaniyesi renk tonu kaydırılarak (yer tutucu).
 */
export const MINDER_BEYAZ = adres('esya-minder');
export const MINDER_YEDEK = adres('esya-battaniye', 'gecici-minder')!;

// ---------------------------------------------------------------- eşyalar (v2: esya-1..6 sayfaları)
/**
 * v2 eşya → v1'de çizilmiş aynı eşya (v2 sayfasında yoksa ya da gelmeden): su kabı, top, tüy değnek, battaniye,
 * gece lambası v1 G4 sayfasından; köpek maması v1'in dolu mama kabı, balık yemi v1'in yem kutusu.
 */
const ESYA_V1: Record<string, string[]> = {
  'su-kabi': ['esya-su-kabi-dolu'],
  'kopek-mamasi': ['esya-mama-kabi-dolu'],
  'balik-yemi': ['esya-yem-kutusu'],
};
/** Eşyanın resmi (esya-<ad>.webp ya da v1 eşi); çizimi yoksa null: sade yer tutucu (arayuz.ts esyaEl) */
export function esyaResmi(id: string): string | null {
  return adres(`esya-${id}`, ...(ESYA_V1[id] ?? []));
}
/** Çekmece önü resmi (ui-dolap sayfası; yoksa null: etiket ya da sade yer tutucu) */
export const dolapResmi = (c: string) => adres(`dolap-${c}`);
/**
 * ui-dolap gelene kadar çekmece önündeki ETİKET: o çekmecenin onaylı eşya çizimi (PATI-V2 §11d ui-dolap'ın resimlerine en
 * yakın olanlar: boş mama kâsesi, su kabı, kırmızı top, fırça, yastık yerine ay gece lambası, bantlı kalp yerine yara
 * bandı). Yardım balonu da bu resmi gösterir: hayvanın sevmediği bir eşya "cevap" gibi durmasın diye dolu mama kabı ve
 * minder değil (tavşan köpek mamasını ve minderi sevmez).
 */
const DOLAP_ETIKET: Record<string, string> = { mama: 'esya-mama-kabi-bos', su: 'esya-su-kabi-dolu', oyuncak: 'esya-top', temizlik: 'esya-yumusak-firca', yatak: 'esya-gece-lambasi', ecza: 'esya-yara-bandi' };
export const dolapEtiketi = (c: string) => (DOLAP_ETIKET[c] ? adres(DOLAP_ETIKET[c]) : null);
/** Bakım Odası'nın kesitleri ve eşyaları için: altın kalp etiketi, hediye kutusu, defter, perde (ui-jeton sayfası) */
export const ALTIN_KALP = adres('ui-altin-kalp');
export const DEFTER = adres('ui-defter');
export const HEDIYE = adres('ui-hediye');
export const PERDE = adres('ui-perde');
/** Boş mama kabı (G4; yoksa kap yalnız dökünce görünür) */
export const MAMA_KABI_BOS = adres('esya-mama-kabi-bos');
/** Düşünce balonu (G4; yoksa CSS balon) ve ay gece lambası */
export const DUSUNCE_BALONU = adres('esya-dusunce-balonu');
export const GECE_LAMBASI = adres('esya-gece-lambasi');
/** Dolu mama kabı (G4: esya-mama-kabi-dolu) */
export const MAMA_KABI = adres('esya-mama-kabi-dolu', 'gecici-mama-kabi')!;
/** Tavan lambasının ipi (salondan kesilmiş; çekilince esner) ve salondaki kutusu (tasarım birimi) */
export const IP = adres('gecici-ip')!;
export const IP_KUTU = (gecici as Record<string, number[]>)['gecici-ip'];

/** Nehir abla (anlatıcı sayfası G6 gelene kadar 3/4 model) */
export const NEHIR = adres('nehir-anlatici-5', 'nehir-34')!;

// ---------------------------------------------------------------- paket 3: süsler, köşeler
/**
 * Süsler: Gemini sus-1 / sus-2 sayfaları gelince `sus-<ad>.webp` (pati-isle.cjs v2-esya); gelene kadar başka oyunların
 * ONAYLI çizimleri (content/pati.json → v2.susler.<ad>.resim). Kodla çizim yok.
 */
const SUS_DOSYA = import.meta.glob<string>(
  ['../../assets/elektrik/saksi.webp', '../../assets/elektrik/saat.webp', '../../assets/kino-otobus/sus-flama.webp', '../../assets/uyku/hali.webp', '../../assets/film/esya/balon.webp', '../../assets/uyku/resim.webp', '../../assets/uyku/oyuncak-sepeti.webp', '../../assets/film-seri2/esya/tabure.webp'],
  { eager: true, query: '?url', import: 'default' },
);
export function susResmi(id: string, yol: string): string | null {
  const kendi = adres(`sus-${id}`);
  if (kendi) return kendi;
  if (yol.startsWith('pati/')) return adres(yol.slice(5));
  return SUS_DOSYA[`../../assets/${yol}.webp`] ?? null;
}
/**
 * Köşe arka planları: Recraft VEKTÖR çizimleri (assets/pati/<ad>.svg, 2048×1170; pati-isle.cjs v2-arka). Aynı adlı raster
 * (webp) gelirse önce o. SVG sonsuz net: netlik sınırı (src/ui/netlik.ts) SVG'ye uygulanmaz. Habitat ölçüleri kose.ts.
 */
const KOSE_SVG = import.meta.glob<string>('../../assets/pati/*.svg', { eager: true, query: '?url', import: 'default' });
const koseArka = (ad: string) => adres(ad) ?? Object.entries(KOSE_SVG).find(([y]) => y.endsWith(`/${ad}.svg`))?.[1] ?? null;
export const KOSE_ARKA: Record<string, string | null> = {
  kemirgen: koseArka('kemirgen-rafi'),
  akvaryum: koseArka('akvaryum-duvari'),
  kus: koseArka('kus-kosesi'),
  surungen: koseArka('surungen-kosesi'),
  bahce: koseArka('bahce'),
};
/** Köşe çiziminin birimi (SVG viewBox) */
export const KOSE_W = 2048;
export const KOSE_H = 1170;
export const BAHCE_GECE = adres('bahce-gece');
