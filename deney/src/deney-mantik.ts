// Ceren Öğretmen ile Deneyler · kurallar (DOM'suz; birim testleri buradan sınar).
// Her deney yaklaşık üç dakika: MERAK (Ceren sorar) → TAHMİN (4 yaş ve üstü; ceza yok, "Bakalım!") → DENE (çocuğun eli)
// → GÖR VE SÖYLE (Ceren gözlemi tek kısa cümleyle söyler). Bitişte Deney Defteri'ne çıkartma ve veliye "Evde dene" kartı.
// Bilim doğru: "ağır olan batar" denmez; cümleler gözlemi anlatır. 5+ yaşa tek cümle: bir şey kendi büyüklüğündeki sudan ağırsa
// batar. Derinlik (matematik/src/derinlik.ts): her gelişte başka nesne takımı, aynı takım art arda iki gelişte gelmez.
import { gelisSorusu, type Havuzlar } from '../../matematik/src/derinlik';

export type DeneyId = 'batar-yuzer' | 'renkler' | 'miknatis' | 'golge' | 'buz' | 'tohum' | 'rampa' | 'muzik';
/** Menüdeki sıra ve Deney Defteri'ndeki çıkartma yeri (defterde sekiz yer). D7–D12 (Paket D6+) kendi çizimleri gelince açılır. */
export const DENEYLER: readonly DeneyId[] = ['batar-yuzer', 'renkler', 'miknatis', 'golge', 'buz', 'tohum', 'rampa', 'muzik'];
/** Paket D: sayfanın kapısı bu ikisinin çizimleri (ortak sahneyle birlikte). Öbürleri seçim ekranına tek tek girer (hazir.ts). */
export const CEKIRDEK: readonly DeneyId[] = ['batar-yuzer', 'renkler'];
export const DENEY_ADI: Record<DeneyId, string> = {
  'batar-yuzer': 'Batar mı, yüzer mi?', renkler: 'Renkleri karıştır', miknatis: 'Mıknatıs neyi çeker?', golge: 'Gölge büyür, küçülür',
  buz: 'Buz nerede çabuk erir?', tohum: 'Tohum nasıl büyür?', rampa: 'Rampadan ne iner?', muzik: 'Bardaklarla müzik',
};

/** Yaş kümesi: 2–3 yaş yalnız dener ve izler; 4 yaş tahmin eder; 5 yaş ve üstü tahmin, ayırma ve sürpriz. */
export type YasKumesi = 'minik' | 'dort' | 'bes';
export const yasKumesi = (yas: number | null): YasKumesi => (yas === null ? 'dort' : yas < 4 ? 'minik' : yas === 4 ? 'dort' : 'bes');

// ---------- Batar mı, yüzer mi? ----------
export const NESNELER = ['elma', 'tas', 'anahtar', 'tahta-kasik', 'plastik-top', 'yaprak', 'madeni-para', 'oyuncak-ordek'] as const;
export type Nesne = (typeof NESNELER)[number] | 'portakal-kabuklu' | 'portakal-soyulmus';
/**
 * Suda ne olur (gerçek deneyle aynı): elma, tahta kaşık, içi boş plastik top, yaprak, lastik ördek yüzer; taş, pirinç
 * anahtar, madeni para batar. Kabuklu portakal yüzer (kabuktaki hava cepleri), soyulmuş portakal batar.
 */
export const YUZER: Record<Nesne, boolean> = {
  elma: true, tas: false, anahtar: false, 'tahta-kasik': true, 'plastik-top': true, yaprak: true, 'madeni-para': false,
  'oyuncak-ordek': true, 'portakal-kabuklu': true, 'portakal-soyulmus': false,
};
export const NESNE_ADI: Record<Nesne, string> = {
  elma: 'Elma', tas: 'Taş', anahtar: 'Anahtar', 'tahta-kasik': 'Tahta kaşık', 'plastik-top': 'Plastik top', yaprak: 'Yaprak',
  'madeni-para': 'Madeni para', 'oyuncak-ordek': 'Oyuncak ördek', 'portakal-kabuklu': 'Portakal', 'portakal-soyulmus': 'Soyulmuş portakal',
};
/** Takımlar: her birinde batan da yüzen de var, ilk ikisi ayrı sonuçlu (çocuk ilk iki denemede iki sonucu da görür). */
const MINIK_TAKIMLAR: Havuzlar<readonly Nesne[]> = [
  [['elma', 'tas', 'oyuncak-ordek']],
  [['tahta-kasik', 'anahtar', 'plastik-top']],
  [['yaprak', 'madeni-para', 'elma'], ['oyuncak-ordek', 'tas', 'tahta-kasik'], ['anahtar', 'plastik-top', 'yaprak']],
];
const BUYUK_TAKIMLAR: Havuzlar<readonly Nesne[]> = [
  [['elma', 'tas', 'oyuncak-ordek', 'anahtar', 'tahta-kasik']],
  [['plastik-top', 'madeni-para', 'yaprak', 'anahtar', 'oyuncak-ordek']],
  [['yaprak', 'tas', 'tahta-kasik', 'madeni-para', 'elma'], ['oyuncak-ordek', 'anahtar', 'plastik-top', 'tas', 'yaprak'], ['tahta-kasik', 'madeni-para', 'elma', 'tas', 'plastik-top']],
];
/** Bu gelişin nesneleri (gelis: deneyin kaçıncı kez bitirildiği, 0 ilk). */
export const gelisNesneleri = (kume: YasKumesi, gelis = 0): readonly Nesne[] =>
  gelisSorusu(kume === 'minik' ? MINIK_TAKIMLAR : BUYUK_TAKIMLAR, gelis);
export type BYAkis = { tahmin: boolean; ayir: boolean; surpriz: boolean };
export const byAkisi = (kume: YasKumesi): BYAkis => ({ tahmin: kume !== 'minik', ayir: kume === 'bes', surpriz: kume === 'bes' });
/** Sonuç cümlesinin kaydı ("Taş battı." / "Elma yüzdü."). */
export function sonucSozu(n: Nesne): string {
  if (n === 'portakal-soyulmus') return 'by-batti-soyulmus';
  if (n === 'portakal-kabuklu') return 'by-yuzdu-portakal';
  return (YUZER[n] ? 'by-yuzdu-' : 'by-batti-') + n;
}
export function sorSozu(n: Nesne): string {
  return n === 'portakal-kabuklu' ? 'by-sor-portakal' : n === 'portakal-soyulmus' ? 'by-sor-soyulmus' : 'by-sor-' + n;
}

// ---------- Renkleri karıştır ----------
export type AnaRenk = 'sari' | 'mavi' | 'kirmizi';
export type KarisimRengi = 'yesil' | 'turuncu' | 'mor';
export type Renk = AnaRenk | KarisimRengi;
export const ANA_RENKLER: readonly AnaRenk[] = ['sari', 'mavi', 'kirmizi'];
export const KARISIM_RENKLERI: readonly KarisimRengi[] = ['yesil', 'turuncu', 'mor'];
/** Karışımın damlatma sırası: sarı + mavi = yeşil, kırmızı + sarı = turuncu, kırmızı + mavi = mor. */
export const KARISIM: Record<KarisimRengi, readonly [AnaRenk, AnaRenk]> = { yesil: ['sari', 'mavi'], turuncu: ['kirmizi', 'sari'], mor: ['kirmizi', 'mavi'] };
export const RENK_ADI: Record<Renk, string> = { sari: 'sarı', mavi: 'mavi', kirmizi: 'kırmızı', yesil: 'yeşil', turuncu: 'turuncu', mor: 'mor' };
/** İki ana rengin karışımı (sıra fark etmez); aynı renk iki kez ise yeni renk olmaz. */
export function karistir(a: AnaRenk, b: AnaRenk): KarisimRengi | null {
  if (a === b) return null;
  return KARISIM_RENKLERI.find((k) => KARISIM[k].includes(a) && KARISIM[k].includes(b)) ?? null;
}
export type RenkPlani = { karisimlar: readonly KarisimRengi[]; tahmin: boolean; gorevler: readonly KarisimRengi[] };
const KARISIM_SIRALARI: Havuzlar<readonly KarisimRengi[]> = [
  [['yesil', 'turuncu', 'mor']],
  [['turuncu', 'mor', 'yesil']],
  [['mor', 'yesil', 'turuncu'], ['yesil', 'mor', 'turuncu'], ['turuncu', 'yesil', 'mor']],
];
/** Görevin rengi her gelişte başka ("yeşil yap" ilk gelişte); 5+ yaşta iki görev. */
const GOREVLER: Havuzlar<readonly KarisimRengi[]> = [
  [['yesil', 'mor']],
  [['mor', 'turuncu']],
  [['turuncu', 'yesil'], ['yesil', 'turuncu'], ['mor', 'yesil']],
];
/** 2–3 yaş: iki rehberli karışım, tahmin ve görev yok. 4 yaş: üç karışım (tahminli) ve bir görev. 5+: üç karışım ve iki görev. */
export function renkPlani(kume: YasKumesi, gelis = 0): RenkPlani {
  const sira = gelisSorusu(KARISIM_SIRALARI, gelis);
  const gorev = gelisSorusu(GOREVLER, gelis);
  if (kume === 'minik') return { karisimlar: sira.slice(0, 2), tahmin: false, gorevler: [] };
  return { karisimlar: sira, tahmin: true, gorevler: kume === 'dort' ? gorev.slice(0, 1) : gorev };
}

// ---------- D7 · Mıknatıs neyi çeker? ----------
// Güvenlik (yönetici, 22 Kasım): 3–6 yaş için kesici ve yutulacak küçük parça yok. Brief'teki ataş, çivi, vida ve bilyeler
// çıkarıldı; yerine büyük ev eşyaları (Astra'ya ek not: CLAUDE-ASTRA-MESAJLAR.md, D6+ ölçü notu).
export const MIKNATIS_NESNELERI = ['kavanoz-kapagi', 'teneke-kutu', 'metal-kova', 'tahta-blok', 'plastik-kasik', 'silgi'] as const;
export type MNesne = (typeof MIKNATIS_NESNELERI)[number] | 'anahtar';
/**
 * Gerçekte ne olur: mıknatıs demiri ve çeliği çeker. Kavanoz kapağı ve teneke kutu çelik sacdan, kova çinko kaplı çelikten
 * (çeker). Tahta, plastik ve silgi çekilmez. Sürpriz (5+): sarı pirinç anahtar metaldir ama mıknatıs çekmez.
 */
export const CEKER: Record<MNesne, boolean> = {
  'kavanoz-kapagi': true, 'teneke-kutu': true, 'metal-kova': true, 'tahta-blok': false, 'plastik-kasik': false, silgi: false, anahtar: false,
};
export const M_ADI: Record<MNesne, string> = {
  'kavanoz-kapagi': 'Kavanoz kapağı', 'teneke-kutu': 'Teneke kutu', 'metal-kova': 'Metal kova', 'tahta-blok': 'Tahta blok',
  'plastik-kasik': 'Plastik kaşık', silgi: 'Silgi', anahtar: 'Anahtar',
};
const MIKNATIS_MINIK: Havuzlar<readonly MNesne[]> = [
  [['kavanoz-kapagi', 'tahta-blok', 'teneke-kutu', 'plastik-kasik']],
  [['plastik-kasik', 'metal-kova', 'silgi', 'kavanoz-kapagi']],
  [['teneke-kutu', 'silgi', 'metal-kova', 'tahta-blok'], ['tahta-blok', 'kavanoz-kapagi', 'plastik-kasik', 'metal-kova']],
];
const MIKNATIS_BUYUK: Havuzlar<readonly MNesne[]> = [
  [['teneke-kutu', 'tahta-blok', 'kavanoz-kapagi', 'silgi', 'metal-kova']],
  [['plastik-kasik', 'metal-kova', 'tahta-blok', 'teneke-kutu', 'silgi']],
  [['kavanoz-kapagi', 'plastik-kasik', 'metal-kova', 'silgi', 'teneke-kutu'], ['silgi', 'teneke-kutu', 'plastik-kasik', 'kavanoz-kapagi', 'tahta-blok']],
];
/** Bu gelişin nesneleri: 2–3 yaş dört, büyükler beş; her takımda çeken de çekmeyen de var, ilk ikisi ayrı sonuçlu. */
export const miknatisNesneleri = (kume: YasKumesi, gelis = 0): readonly MNesne[] => gelisSorusu(kume === 'minik' ? MIKNATIS_MINIK : MIKNATIS_BUYUK, gelis);
export const miknatisAkisi = (kume: YasKumesi) => ({ tahmin: kume !== 'minik', surpriz: kume === 'bes' });
export const mSorSozu = (n: MNesne) => 'mk-sor-' + n;
export const mSonucSozu = (n: MNesne) => (CEKER[n] ? 'mk-cekti-' : 'mk-cekmedi-') + n;

// ---------- D8 · Gölge büyür, küçülür ----------
// Fener masada tavşanın önünde, perde arkada. Fener tavşana yaklaştıkça gölge büyür (ışık kaynağı cisme yakınken ışınlar
// daha çok açılır). Derinlik ölçüsü: perde 0, tavşan 1, fener 4 (uzak) … 2 (yakın); gölge / tavşan = z / (z − 1).
export type GolgeAdimi = 'yaklastir' | 'uzaklastir';
/** Fenerin yolda yeri: 0 en uzak, 1 en yakın. */
export const golgeOrani = (t: number) => { const z = 4 - 2 * Math.max(0, Math.min(1, t)); return z / (z - 1); };
/** Hedefe varıldı mı: yaklaştırınca 0,85'e, uzaklaştırınca 0,15'e. */
export const YAKIN = 0.85, UZAK = 0.15;
export const golgeVardi = (adim: GolgeAdimi, t: number) => (adim === 'yaklastir' ? t >= YAKIN - 1e-9 : t <= UZAK + 1e-9);
export type GolgePlani = { baslangic: number; adimlar: readonly GolgeAdimi[]; tahmin: boolean; sondur: boolean };
type GolgeSirasi = { adimlar: readonly GolgeAdimi[]; baslangic: number };
/** Gelişe göre: önce yaklaştır (fener ortada), sonra önce uzaklaştır; zor basamakta fener yolun ucundan başlar (yol uzun). */
const GOLGE_SIRALARI: Havuzlar<GolgeSirasi> = [
  [{ adimlar: ['yaklastir', 'uzaklastir'], baslangic: 0.4 }],
  [{ adimlar: ['uzaklastir', 'yaklastir'], baslangic: 0.6 }],
  [{ adimlar: ['yaklastir', 'uzaklastir'], baslangic: 0.2 }, { adimlar: ['uzaklastir', 'yaklastir'], baslangic: 0.8 }],
];
/** 2–3 yaş: yak, yaklaştır, uzaklaştır. 4 yaş önce tahmin. 5+ sonunda feneri söndürür ("ışık yoksa gölge yok"). */
export function golgePlani(kume: YasKumesi, gelis = 0): GolgePlani {
  const s = gelisSorusu(GOLGE_SIRALARI, gelis);
  return { baslangic: s.baslangic, adimlar: [...s.adimlar], tahmin: kume !== 'minik', sondur: kume === 'bes' };
}

// ---------- D9 · Buz nerede çabuk erir? ----------
// Gerçekte: ılık sudaki buz en çabuk erir (su, sıcaklığı buza havadan çok daha iyi taşır), sonra güneşteki, en son gölgedeki.
// Brief'teki "Güneşteki buz önce eridi" cümlesi bu yüzden kullanılmadı.
export const BUZ_YERLERI = ['gunes', 'golge', 'su'] as const;
export type BuzYeri = (typeof BUZ_YERLERI)[number];
export type BuzHali = 'tam' | 'yarim' | 'az' | 'su' | 'yok';
/** Dokunuşla geçen zaman (0–4): suda buz eriyip kaybolur; masada su birikintisi kalır. */
export const BUZ_ZAMANI: Record<BuzYeri, readonly BuzHali[]> = {
  su: ['tam', 'yarim', 'az', 'yok', 'yok'],
  gunes: ['tam', 'tam', 'yarim', 'az', 'su'],
  golge: ['tam', 'tam', 'tam', 'yarim', 'az'],
};
export const BUZ_ADIM = 4;
export const buzEridi = (h: BuzHali) => h === 'su' || h === 'yok';
/** Erime sırası (önce eriyen başta): zamanda ilk eridiği adıma göre; hiç erimeyen sonda. */
export const erimeSirasi = (): BuzYeri[] => [...BUZ_YERLERI].sort((a, b) => ilkErime(a) - ilkErime(b));
const ilkErime = (y: BuzYeri) => { const i = BUZ_ZAMANI[y].findIndex(buzEridi); return i < 0 ? 99 : i; };
export type BuzPlani = { tahmin: boolean; soru: 'ilk' | 'son'; neden: boolean };
const BUZ_SORULARI: Havuzlar<'ilk' | 'son'> = [['ilk'], ['son'], ['ilk', 'son']];
export const buzPlani = (kume: YasKumesi, gelis = 0): BuzPlani =>
  ({ tahmin: kume !== 'minik', soru: kume === 'minik' ? 'ilk' : gelisSorusu(BUZ_SORULARI, gelis), neden: kume === 'bes' });

// ---------- D10 · Tohum nasıl büyür? ----------
// Gerçekte: tohum filizlenmek için su ister (ve hava, ılıklık); filiz yeşerip büyümek için ışık ister. Susuz saksıda tohum
// filizlenmez. 4 yaş ve üstünde iki saksı: biri her gün sulanır, öbürü hiç sulanmaz.
export const TOHUM_GUNU = 3;
/** Sulanan saksıda gün gün bitki: 1. gün filiz-1, 2. gün filiz-2, 3. gün çiçek (filiz-3). Susuzda hiçbir şey. */
export const filizHali = (gun: number, sulandi: boolean) => (sulandi && gun > 0 ? 'filiz-' + Math.min(TOHUM_GUNU, gun) : null);
export type TohumPlani = { saksi: 1 | 2; sulanan: 0 | 1; tahmin: boolean; neden: boolean };
const SULANAN: Havuzlar<0 | 1> = [[0], [1], [1, 0]];
export const tohumPlani = (kume: YasKumesi, gelis = 0): TohumPlani =>
  kume === 'minik' ? { saksi: 1, sulanan: 0, tahmin: false, neden: false } : { saksi: 2, sulanan: gelisSorusu(SULANAN, gelis), tahmin: true, neden: kume === 'bes' };

// ---------- D11 · Rampadan ne iner? ----------
// Gerçekte (tahta rampa): top yuvarlanır, araba tekerlekleriyle iner; düz yüzlü kutu az eğimde sürtünmeyle yerinde kalır,
// dik rampada kayar. Rampa dikleşince hepsi daha hızlı iner.
export const RAMPA_NESNELERI = ['top', 'oyuncak-araba', 'kup-kutu'] as const;
export type RNesne = (typeof RAMPA_NESNELERI)[number];
export type Egim = 'az' | 'dik';
export type Hareket = 'yuvarlanir' | 'tekerlek' | 'kayar' | 'kalir';
export const rampaHareketi = (n: RNesne, e: Egim): Hareket => (n === 'top' ? 'yuvarlanir' : n === 'oyuncak-araba' ? 'tekerlek' : e === 'dik' ? 'kayar' : 'kalir');
/** Rampadan inme süresi (ms): dik rampada daha kısa; kutu dikte kayarken toptan yavaş. Kalan kutu inmez. */
export const inisSuresi = (n: RNesne, e: Egim) => ({ yuvarlanir: e === 'dik' ? 900 : 1700, tekerlek: e === 'dik' ? 1000 : 1800, kayar: 1300, kalir: 0 })[rampaHareketi(n, e)];
export const R_ADI: Record<RNesne, string> = { top: 'Top', 'oyuncak-araba': 'Oyuncak araba', 'kup-kutu': 'Kutu' };
export type RampaPlani = { az: readonly RNesne[]; dik: readonly RNesne[]; tahminKutu: boolean; neden: boolean };
const AZ_SIRALARI: Havuzlar<readonly RNesne[]> = [[['top', 'kup-kutu', 'oyuncak-araba']], [['oyuncak-araba', 'kup-kutu', 'top']], [['kup-kutu', 'top', 'oyuncak-araba'], ['top', 'oyuncak-araba', 'kup-kutu']]];
/** 2–3 yaşta az eğimde iki nesne: biri yuvarlanan (top ya da araba), biri kutu; kutu her gelişte görülür. */
const MINIK_AZ: Havuzlar<readonly RNesne[]> = [[['top', 'kup-kutu']], [['oyuncak-araba', 'kup-kutu']], [['kup-kutu', 'top'], ['kup-kutu', 'oyuncak-araba']]];
/** 2–3 yaş: az eğimde iki nesne, dikte kutu. 4 yaş: az eğimde üçü (kutuda tahmin), dikte kutu. 5+: dikte kutu ve top, "neden?". */
export function rampaPlani(kume: YasKumesi, gelis = 0): RampaPlani {
  const az = gelisSorusu(AZ_SIRALARI, gelis);
  if (kume === 'minik') return { az: gelisSorusu(MINIK_AZ, gelis), dik: ['kup-kutu'], tahminKutu: false, neden: false };
  return { az, dik: kume === 'bes' ? ['kup-kutu', 'top'] : ['kup-kutu'], tahminKutu: true, neden: kume === 'bes' };
}

// ---------- D12 · Bardaklarla müzik ----------
// Gerçekte (bardağa vurunca): su çoksa bardak daha yavaş titreşir, ses kalınlaşır; su azsa ses incedir. (Bardağın ağzına
// üflemek ters sonuç verir; burada yalnız vurulur.) Ses kodla üretilir (Web Audio); ElevenLabs müziği yok.
export const SEVIYELER = [1, 2, 3, 4] as const;
export type Seviye = (typeof SEVIYELER)[number];
/** Su seviyesine göre ton (Hz): az su ince (yüksek), çok su kalın (alçak); dördü pentatonik (C6, A5, G5, E5). */
export const BARDAK_TONU: Record<Seviye, number> = { 1: 1046.5, 2: 880, 3: 784, 4: 659.3 };
export type MuzikPlani = { dizilis: readonly Seviye[]; tahmin: boolean; sirala: boolean; kulak: readonly Seviye[]; neden: boolean };
const DIZILISLER: Havuzlar<readonly Seviye[]> = [[[3, 1, 4, 2]], [[2, 4, 1, 3]], [[4, 2, 3, 1], [1, 3, 2, 4]]];
const KULAK: Havuzlar<readonly Seviye[]> = [[[4, 1]], [[1, 3]], [[2, 4], [3, 1]]];
/** 2–3 yaş: dört bardağı çalar, Ceren inceden kalına çalar. 4 yaş: tahmin ve sıralı çalma. 5+: kulak oyunu ve "neden?". */
export function muzikPlani(kume: YasKumesi, gelis = 0): MuzikPlani {
  const dizilis = gelisSorusu(DIZILISLER, gelis);
  return { dizilis, tahmin: kume !== 'minik', sirala: kume !== 'minik', kulak: kume === 'bes' ? gelisSorusu(KULAK, gelis) : [], neden: kume === 'bes' };
}

// ---------- Kayıt ----------
export const KAYIT_ANAHTARI = 'minkino-deney-v1';
export type DeneyKaydi = { gelis: Partial<Record<DeneyId, number>>; cikartma: DeneyId[] };
export function kaydiCoz(ham: string | null): DeneyKaydi {
  const bos: DeneyKaydi = { gelis: {}, cikartma: [] };
  if (!ham) return bos;
  try {
    const v = JSON.parse(ham) as Partial<DeneyKaydi>;
    const gelis: DeneyKaydi['gelis'] = {};
    for (const id of DENEYLER) {
      const g = v.gelis?.[id];
      if (typeof g === 'number' && Number.isFinite(g) && g > 0) gelis[id] = Math.floor(g);
    }
    const cikartma = Array.isArray(v.cikartma) ? DENEYLER.filter((id) => v.cikartma!.includes(id)) : [];
    return { gelis, cikartma };
  } catch {
    return bos;
  }
}
/** Deney bitti: geliş bir artar, çıkartma deftere girer (bir kez). */
export function deneyBitti(k: DeneyKaydi, id: DeneyId): DeneyKaydi {
  return { gelis: { ...k.gelis, [id]: (k.gelis[id] ?? 0) + 1 }, cikartma: k.cikartma.includes(id) ? k.cikartma : DENEYLER.filter((d) => d === id || k.cikartma.includes(d)) };
}
/** Deney Defteri'ndeki sekiz çıkartma yerinin merkezi (deney-defteri.webp, 1000 × 700). */
export const DEFTER_YERLERI: readonly (readonly [number, number])[] = [[190, 250], [390, 250], [190, 490], [390, 490], [610, 250], [810, 250], [610, 490], [810, 490]];

// ---------- Veliye "Evde dene" ----------
export const EVDE_DENE: Record<DeneyId, { baslik: string; adimlar: readonly string[] }> = {
  'batar-yuzer': {
    baslik: 'Evde dene: Batar mı, yüzer mi?',
    adimlar: [
      'Bir kaba su doldurun.',
      'Evden birkaç şey seçin: kaşık, elma, taş, oyuncak.',
      'Her birini suya bırakmadan önce sorun: "Batar mı, yüzer mi?"',
      'Sonra bırakın ve birlikte söyleyin: "Taş battı. Elma yüzdü."',
      'Bir portakalı önce kabuğuyla, sonra soyup deneyin.',
    ],
  },
  renkler: {
    baslik: 'Evde dene: Renkleri karıştır',
    adimlar: [
      'Üç bardağa su koyun.',
      'Gıda boyası ya da sulu boyayla sarı, mavi ve kırmızı su yapın.',
      'İki rengi bir bardakta karıştırın; önce "Ne renk olacak?" diye sorun.',
      'Yeni rengin adını birlikte söyleyin: sarı ile mavi yeşil yapar.',
      'Deneyi bir büyükle yapın; boyalı suyu içmeyin.',
    ],
  },
  miknatis: {
    baslik: 'Evde dene: Mıknatıs neyi çeker?',
    adimlar: [
      'Buzdolabı mıknatısı gibi büyük bir mıknatıs alın.',
      'Evde birlikte dolaşın: buzdolabı kapısı, tahta kapı, cam, kavanoz kapağı.',
      'Önce sorun: "Mıknatıs bunu çeker mi?"',
      'Yapışanları birlikte söyleyin: demir ve çelik çekilir.',
      'Küçük ya da güçlü mıknatısları çocuğa vermeyin; küçük parçaları ağza almayın.',
    ],
  },
  golge: {
    baslik: 'Evde dene: Gölge büyür, küçülür',
    adimlar: [
      'Odayı biraz karartın; bir el feneri alın (mum kullanmayın).',
      'Bir oyuncağı duvarın önüne koyun.',
      'Feneri oyuncağa yaklaştırın: duvardaki gölge büyür.',
      'Feneri uzaklaştırın: gölge küçülür.',
      'Elinizle tavşan, kuş gölgeleri yapın.',
    ],
  },
  buz: {
    baslik: 'Evde dene: Buz nerede çabuk erir?',
    adimlar: [
      'Üç buz küpü alın.',
      'Birini güneşli pencerenin önüne, birini gölgeye, birini ılık suya koyun (sıcak değil, ılık).',
      'Önce sorun: "Hangisi önce erir?"',
      'Biraz sonra bakın: ılık sudaki en önce, gölgedeki en son erir.',
      'Birlikte söyleyin: sıcak, buzu eritir.',
    ],
  },
  tohum: {
    baslik: 'Evde dene: Tohum nasıl büyür?',
    adimlar: [
      'İki küçük saksıya toprak koyun.',
      'Tohumları siz ekin (tohumu ağza almasın); fasulye ya da nohut uygun.',
      'Birini her gün çocukla birlikte sulayın, öbürünü hiç sulamayın.',
      'Saksıları aydınlık bir pencerenin önüne koyun.',
      'Birkaç gün sonra bakın: sulanan tohum filizlenir, susuz tohum filizlenmez.',
    ],
  },
  rampa: {
    baslik: 'Evde dene: Rampadan ne iner?',
    adimlar: [
      'Bir tahtayı ya da kalın kartonu birkaç kitaba yaslayıp rampa yapın.',
      'Tepesinden bir top, bir oyuncak araba ve küçük bir kutu bırakın.',
      'Önce sorun: "Bu iner mi?"',
      'Sonra kitap ekleyip rampayı dikleştirin; yeniden bırakın.',
      'Birlikte söyleyin: rampa dikleşince daha hızlı iner.',
    ],
  },
  muzik: {
    baslik: 'Evde dene: Bardaklarla müzik',
    adimlar: [
      'Dört kalın cam kavanozu masaya dizin; kavanozları siz tutun.',
      'Birine az, birine çok su koyun; öbürlerine arada.',
      'Tahta kaşıkla hafifçe vurun ve dinleyin.',
      'Birlikte söyleyin: su çok, ses kalın; su az, ses ince.',
      'Kavanozlara sert vurmayın; bu deneyi bir büyükle yapın.',
    ],
  },
};

// ---------- Çizimler ve sesler (hepsi gelmeden deney uygulamada görünmez) ----------
export const CEREN_POZLARI = ['sorar', 'bekler', 'sevinir'] as const;
export const KINO_POZLARI = ['merak', 'saskin', 'sevinc'] as const;
const ORTAK_CIZIMLER = [
  'deney-atolyesi', 'deney-masasi', 'ceren-onluk-konus-0', 'ceren-onluk-konus-1', 'ceren-onluk-konus-2', 'ceren-onluk-konus-3',
  ...CEREN_POZLARI.map((p) => 'ceren-onluk-' + p), ...KINO_POZLARI.map((p) => 'kino-onluk-' + p), 'deney-defteri', 'evde-dene',
];
export const DENEY_CIZIMLERI: Record<DeneyId, readonly string[]> = {
  'batar-yuzer': ['legen-arka', 'legen-on', 'su-sicramasi', 'sepet', 'rozet-batar', 'rozet-yuzer', ...NESNELER, 'portakal-kabuklu', 'portakal-soyulmus', 'cikartma-batar-yuzer'],
  renkler: [
    'cam-bardak', 'sivi-su', ...ANA_RENKLER.map((r) => 'sivi-' + r), ...KARISIM_RENKLERI.map((r) => 'sivi-' + r), 'karistirma-cubugu',
    ...ANA_RENKLER.map((r) => 'sise-' + r), ...ANA_RENKLER.map((r) => 'damla-' + r), 'damlalik', 'cikartma-renkler',
  ],
  // Paket D6+ (CLAUDE-ASTRA-MESAJLAR.md 22 Kasım 01:34 ve ölçü notu). Mıknatıs sürprizi Paket D'nin `anahtar`ını, müzik
  // bardağına vuruş Paket D'nin `karistirma-cubugu`nu kullanır (ikisi Paket D'de: sayfa açıkken hep var).
  miknatis: ['miknatis', ...MIKNATIS_NESNELERI, 'cikartma-miknatis'],
  golge: ['el-feneri-kapali', 'el-feneri-acik', 'isik-huzmesi', 'oyuncak-tavsan', 'tavsan-golgesi', 'golge-perdesi', 'cikartma-golge'],
  buz: ['buz-tam', 'buz-yarim', 'buz-az', 'su-birikintisi', 'gunes-isigi', 'golgelik', 'ilik-su-kabi', 'cikartma-buz'],
  tohum: ['saksi-bos', 'tohum', 'filiz-1', 'filiz-2', 'filiz-3', 'sulama-kabi', 'cikartma-tohum'],
  rampa: ['rampa-az', 'rampa-dik', ...RAMPA_NESNELERI, 'cikartma-rampa'],
  muzik: ['muzik-bardagi', ...SEVIYELER.map((s) => 'su-seviye-' + s), 'cikartma-muzik'],
};
/** Sayfanın kapısı (hazir.ts → deneyHazir): ortak sahne ve Paket D'nin iki deneyi. */
export const GEREKLI_CIZIMLER: readonly string[] = [...ORTAK_CIZIMLER, ...CEKIRDEK.flatMap((id) => DENEY_CIZIMLERI[id])];
/** Bir deneyin seçim ekranına girmesi için: ortak sahne, Paket D (sayfa) ve kendi çizimleri. */
export const deneyCizimleri = (id: DeneyId): readonly string[] => [...GEREKLI_CIZIMLER, ...(CEKIRDEK.includes(id) ? [] : DENEY_CIZIMLERI[id])];
/** Kapak ana menünün (assets/uygulama/oyun-kapaklari/deney.webp); Dersler kartı ondan açılır. */
export const KAPAK = 'deney';

const ORTAK_SESLER = ['giris', 'sec', 'bakalim', 'harika', 'defter', 'evde'];
export const DENEY_SESLERI: Record<DeneyId, readonly string[]> = {
  'batar-yuzer': [
    'by-giris', 'by-birak', ...NESNELER.map((n) => 'by-sor-' + n), 'by-sor-portakal', 'by-sor-soyulmus',
    ...NESNELER.map((n) => sonucSozu(n)), 'by-yuzdu-portakal', 'by-batti-soyulmus',
    'by-ayir', 'by-ayir-ipucu', 'by-ayir-tamam', 'by-surpriz', 'by-soy', 'by-neden', 'by-agir',
  ],
  renkler: [
    'rk-giris', ...ANA_RENKLER.map((r) => 'rk-damlat-' + r), 'rk-sik', ...ANA_RENKLER.map((r) => 'rk-su-' + r), 'rk-karistir', 'rk-tahmin',
    ...KARISIM_RENKLERI.map((r) => 'rk-oldu-' + r), ...KARISIM_RENKLERI.map((r) => 'rk-gorev-' + r), ...KARISIM_RENKLERI.map((r) => 'rk-ipucu-' + r),
    'rk-yeniden', 'rk-bosalt', 'rk-iki-renk',
  ],
  miknatis: [
    'mk-giris', 'mk-yaklastir', ...MIKNATIS_NESNELERI.map(mSorSozu), ...MIKNATIS_NESNELERI.map(mSonucSozu),
    'mk-surpriz', 'mk-sor-anahtar', 'mk-cekmedi-anahtar', 'mk-neden', 'mk-sonuc',
  ],
  golge: ['gl-giris', 'gl-yak', 'gl-golge', 'gl-tahmin-yaklastir', 'gl-tahmin-uzaklastir', 'gl-yaklastir', 'gl-uzaklastir', 'gl-buyudu', 'gl-kuculdu', 'gl-sondur', 'gl-yok', 'gl-neden'],
  buz: ['bz-giris', 'bz-koy', 'bz-tahmin-ilk', 'bz-tahmin-son', 'bz-dokun', 'bz-kuculuyor', 'bz-su-eridi', 'bz-gunes-eridi', 'bz-golge-duruyor', 'bz-sonuc', 'bz-neden'],
  tohum: ['th-giris', 'th-ek', 'th-ek-iki', 'th-sula', 'th-sula-biri', 'th-tahmin', 'th-her-gun', 'th-gun-1', 'th-gun-2', 'th-gun-3', 'th-susuz', 'th-sonuc-tek', 'th-sonuc-iki', 'th-neden'],
  rampa: ['rp-giris', 'rp-koy', 'rp-birak', 'rp-tahmin-kutu', 'rp-top', 'rp-araba', 'rp-kutu-kaldi', 'rp-dik', 'rp-kutu-kaydi', 'rp-top-hizli', 'rp-sonuc', 'rp-neden'],
  muzik: ['mz-giris', 'mz-tahmin', 'mz-kalin', 'mz-sirala', 'mz-ipucu', 'mz-indi', 'mz-kulak', 'mz-kulak-evet', 'mz-kulak-tekrar', 'mz-dinle', 'mz-sonuc', 'mz-neden'],
};
export const GEREKLI_SESLER: readonly string[] = [...ORTAK_SESLER, ...DENEYLER.flatMap((id) => DENEY_SESLERI[id])];
/** Bir deneyin sesleri (ortak sözlerle). */
export const deneySesleri = (id: DeneyId): readonly string[] => [...ORTAK_SESLER, ...DENEY_SESLERI[id]];
