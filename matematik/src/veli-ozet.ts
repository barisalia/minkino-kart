// Matematik · Büyükler için (veli sayfası): kayıtlardan görünüm modeli. DOM'suz ve saf; birim testleri buradan sınar.
// Kayıtlar yalnız okunur (yazılmaz): oyuncaklar `minkino-matematik-1-[minik-|dort-]<köşe>` (kayit.ts → Tur), Ceren'in
// dersi `minkino-matematik-ceren-sayilar-v1` (ceren-ders-mantik.ts → Kayit). Eski düzendeki kaydı kayit.ts gibi yorumlar.
import { KAYIT_ANAHTARI, dersSayilari, hepsiBitti, kaydiCoz, siradaki } from './ceren-ders-mantik';
import { enBuyuk } from './hizli-gozler';
import type { Tur } from './kayit';
import { ESKI_SON, KAYIT_SURUMU, adimiTasi, etkinSira, surum2Tasi, turTuru, type Kose, type Yol } from './tur-sirasi';
import { ekAcik } from './ek-turlar';
/** Oyuncağın oynanan sırası (kayit.ts → sira ile aynı: eski turlar ve açık ek turlar). */
const siraOf = (yol: Yol, k: Kose) => etkinSira(yol, k, ekAcik);
import { DERS_ADI, yasDersleri, type DersId } from './ders-yolu-mantik';
import { SEKIL_KAYIT_ANAHTARI } from './ders-sekiller-mantik';
import { OLCU_KAYIT_ANAHTARI } from './ders-olcu-mantik';
import { ORUNTU_KAYIT_ANAHTARI } from './ders-oruntu-mantik';
import { TOPLAMA_KAYIT_ANAHTARI } from './ders-toplama-mantik';
import { ONLUK_KAYIT_ANAHTARI } from './ders-onluk-mantik';

export const KOSELER: readonly Kose[] = ['sayi', 'sekil', 'olcu', 'fener'];
/** Tezgâhtaki adlar (kayit.ts → adlar ile aynı; birim testi denetler). */
export const OYUNCAK_ADLARI: Record<Kose, string> = {
  sayi: 'Sayı masası',
  sekil: 'Şekil evi',
  olcu: 'Ölçü tezgâhı',
  fener: 'Fener tiyatrosu',
};

/** Menüdeki yaş (2–6; seçilmemişse null) → Matematik yolu: kayit.ts → seviyeyiYukle ile aynı kural. */
export const yasYolu = (yas: number | null): Yol => (yas !== null && yas < 4 ? 'minik' : yas === 4 ? 'dort' : 'bes');
export const kayitOneki = (yol: Yol) => 'minkino-matematik-1-' + (yol === 'minik' ? 'minik-' : yol === 'dort' ? 'dort-' : '');
export const yasYazisi = (yas: number | null) => (yas === null ? 'Yaş seçilmedi' : yas >= 6 ? '6 yaş ve üzeri' : yas + ' yaş');

// ---------------------------------------------------------------- Türkçe sayı ekleri (1–10)
const YONELME = ['', "1'e", "2'ye", "3'e", "4'e", "5'e", "6'ya", "7'ye", "8'e", "9'a", "10'a"];
const BELIRTME = ['', "1'i", "2'yi", "3'ü", "4'ü", "5'i", "6'yı", "7'yi", "8'i", "9'u", "10'u"];
/** "3'e", "6'ya", "10'a" (1–10; dışında yalnız sayı). */
export const yonelme = (n: number) => YONELME[n] ?? String(n);
/** "3'ü", "6'yı", "10'u" (1–10; dışında yalnız sayı). */
export const belirtme = (n: number) => BELIRTME[n] ?? String(n);

// ---------------------------------------------------------------- oyuncak kaydı
export type OyuncakKaydi = { adim: number; hatira: boolean; tekrar: number; kuleTamam: boolean };
const bosOyuncak = (): OyuncakKaydi => ({ adim: 0, hatira: false, tekrar: 0, kuleTamam: false });

/**
 * Oyuncak kaydını kayit.ts → oku() gibi yorumlar: geçersiz kayıt boş sayılır; eski (16 turluk) ya da sırası kısalmış
 * kayıt yeni sıraya oranlanır; son tura varmış kayıtta hatıra alınmıştır.
 */
export function oyuncakKaydiCoz(metin: string | null, yol: Yol, k: Kose): OyuncakKaydi {
  const son = siraOf(yol, k).length;
  try {
    const v = JSON.parse(metin || 'null') as Partial<Tur> | null;
    if (
      !v || typeof v !== 'object' ||
      !Number.isInteger(v.adim) || v.adim! < 0 || v.adim! > Math.max(ESKI_SON, son) ||
      !Number.isInteger(v.yer) || v.yer! < 0 || v.yer! > 10 ||
      !Array.isArray(v.secimler) || v.secimler.length > 16 ||
      !v.secimler.every((n: unknown) => Number.isInteger(n) && Number(n) >= 0 && Number(n) <= 10)
    ) return bosOyuncak();
    let adim = v.adim!, hatira = v.hatira === true;
    if (v.surum === 2) ({ adim, hatira } = surum2Tasi(yol, k, adim, hatira, siraOf(yol, k)));
    else if (v.surum !== KAYIT_SURUMU || adim > son) ({ adim, hatira } = adimiTasi(adim, hatira, v.surum === KAYIT_SURUMU ? adim : ESKI_SON, son));
    return {
      adim,
      hatira: hatira || adim === son,
      tekrar: Number.isSafeInteger(v.tekrar) && v.tekrar! >= 0 ? v.tekrar! % 60 : 0,
      kuleTamam: v.kuleTamam === true,
    };
  } catch {
    return bosOyuncak();
  }
}

/**
 * Oyuncak en az bir kez bitti mi: son tura vardı ya da yeniden oynamak için baştan açıldı (kayit.ts → sifirla yalnız
 * bitmiş oyuncakta çağrılır, `tekrar` artar). Sayı masasının hatırası Ceren'in dersinden de gelebildiği için orada
 * hatıra tek başına bitiş sayılmaz.
 */
export const oyuncakBittiMi = (k: Kose, r: OyuncakKaydi, son: number) => r.adim >= son || r.tekrar > 0 || (k !== 'sayi' && r.hatira);

// ---------------------------------------------------------------- beceriler
export type BeceriId = 'sayma' | 'bakis' | 'sekil' | 'olcme' | 'oruntu';
export const BECERILER: readonly BeceriId[] = ['sayma', 'bakis', 'sekil', 'olcme', 'oruntu'];
/** Hangi oyuncağın hangi tur türü hangi beceriye sayılır (tur-sirasi.ts → turTuru). Ceren'in dersi ve kule saymaya sayılır. */
export const BECERI_TURLERI: Record<BeceriId, Partial<Record<Kose, readonly string[]>>> = {
  sayma: { sayi: ['say', 'esle', 'pazar', 'paylas', 'topla-cikar', 'zipzip', 'sandik', 'kurabiye', 'tren', 'balon', 'kek', 'asansor', 'roket'], fener: ['ritim', 'kaydirak'] },
  bakis: { sayi: ['hizli'] },
  sekil: { sekil: ['tekne', 'araba', 'bina', 'konum', 'gezgin', 'sekilbahce', 'resim', 'kelebek', 'saklambac', 'kutu'] },
  olcme: { olcu: ['olc', 'karsilastir', 'denge', 'tahterevalli', 'surahi', 'yarim', 'gun', 'pay', 'grafik', 'sofra'] },
  oruntu: { fener: ['oruntu', 'hafiza', 'besteci', 'buyuyen', 'bayrak', 'calgi', 'eskart'], sekil: ['buyume', 'oruntu'] },
};
/** Turun türü hangi beceriye sayılır ("say+paylas" gibi iki işli tur ilk işinin becerisine). */
export function turunBecerisi(k: Kose, tur: string): BeceriId | undefined {
  const parca = tur.split('+')[0];
  return BECERILER.find((b) => BECERI_TURLERI[b][k]?.includes(parca));
}

const BECERI_ADI: Record<BeceriId, string> = {
  sayma: 'Sayma',
  bakis: 'Bir bakışta görme',
  sekil: 'Şekiller',
  olcme: 'Ölçme',
  oruntu: 'Örüntü ve sıra',
};
/** Becerinin ne olduğu, velinin diliyle (jargonsuz; yaşa göre). */
function beceriAciklamasi(b: BeceriId, yol: Yol): string {
  switch (b) {
    case 'sayma':
      return yol === 'minik'
        ? 'Nesneleri tek tek saymak, her birine bir tane ayırmak, eşit paylaştırmak.'
        : 'Nesneleri tek tek saymak, rakamı miktarla eşleştirmek, eşit paylaştırmak, eklemek ve eksiltmek.';
    case 'bakis':
      return `Birkaç nesnenin kaç tane olduğunu saymadan, bir bakışta söylemek (${yonelme(enBuyuk(yol))} kadar${yol === 'bes' ? ', beşli gruplarla' : ''}).`;
    case 'sekil':
      return 'Kare, üçgen ve daireyi tanımak, parçaları birleştirip yeni bir şey kurmak, sağ, sol ve üst sözlerini anlamak.';
    case 'olcme':
      return yol === 'minik'
        ? 'Eşit parçalarla uzunluk ölçmek, en çok olanı bulmak, terazide dengeyi kurmak.'
        : 'Eşit parçalarla uzunluk ölçmek, en çok ve en az olanı bulmak, terazide dengeyi kurmak.';
    case 'oruntu':
      return 'Tekrar eden sırayı sürdürmek, duyduğu sırayı hatırlamak, olayları sıraya koymak, kendi ritmini kurmak.';
  }
}

// ---------------------------------------------------------------- görünüm modeli
export type Durum = 'yok' | 'suruyor' | 'tamam';
export const DURUM_YAZISI: Record<Durum, string> = { yok: 'Henüz başlamadı', suruyor: 'Öğreniyor', tamam: 'Tamamladı' };

export type DersOzeti = {
  sayilar: { n: number; durum: 'ogrendi' | 'sirada' | 'bekliyor' }[];
  ogrenilen: number;
  toplam: number;
  /** Öğrenilen en büyük sayı (yoksa 0). */
  enBuyuk: number;
  sirada?: number;
  durum: Durum;
  yazi: string;
};
export type OyuncakOzeti = {
  id: Kose;
  ad: string;
  /** Bu oynayışta biten tur (yeniden oynuyorsa baştan sayılır). */
  tamam: number;
  toplam: number;
  /** En az bir kez bitti mi. */
  bitti: boolean;
  hatira: boolean;
  durum: 'yok' | 'bekliyor' | 'suruyor' | 'bitti';
  /** Çubuğun doluluğu (0–1): bittiyse 1. */
  oran: number;
  yazi: string;
};
export type BeceriOzeti = {
  id: BeceriId;
  ad: string;
  aciklama: string;
  yapilan: number;
  toplam: number;
  durum: Durum;
  /** Sıradaki iş (öneri buna göre seçilir): 'ders', 'kule' ya da tur türü; bittiyse yok. */
  sonraki?: string;
};
/** `resim`: Astra'nın öneri sahnesi (assets/matematik/veli/<resim>.webp); yalnız sahnesi olan önerilerde. */
export type Oneri = { beceri: BeceriId | 'hepsi'; metin: string; resim?: OneriResmi };
export type OneriResmi = 'evde-merdiven' | 'evde-sofra' | 'evde-sekil-avi' | 'evde-ritim';
/** Önerinin sahnesi: merdivende sayma, sofrada paylaştırma, şekil avı, alkış ritmi (MV2 brief'i). */
export function oneriResmi(b: Pick<BeceriOzeti, 'id' | 'durum' | 'sonraki'>): OneriResmi | undefined {
  if (b.durum === 'tamam') return undefined;
  if (b.id === 'sayma') return b.sonraki === 'ders' ? 'evde-merdiven' : b.sonraki === 'say' || b.sonraki === 'paylas' ? 'evde-sofra' : undefined;
  if (b.id === 'sekil' && b.durum === 'yok') return 'evde-sekil-avi';
  if (b.id === 'oruntu' && (b.durum === 'yok' || b.sonraki === 'oruntu')) return 'evde-ritim';
  return undefined;
}
// ---------------------------------------------------------------- Bugün Evde 1 Dakika (danışman CEVAP-06, ilk 10'un 5. maddesi)
/** Her dersin akşam evde bir dakikalık oyunu: gerçek ev eşyalarıyla, tek cümle. */
export const EVDE_DERS: Record<DersId, string> = {
  sayilar: 'Merdiven çıkarken basamakları birlikte sayın; son basamakta sayıyı o söylesin.',
  sekiller: 'Evde üç daire bulun: tabak, saat, düğme. Sonra bir kare arayın.',
  olcu: 'Mutfakta iki kaşığı yan yana koyun: hangisi daha uzun? Sonra iki elmanın hangisi daha ağır?',
  oruntu: 'Sofraya kaşık, çatal, kaşık, çatal dizin; sıradakini o koysun.',
  topla: 'Masaya üç ceviz koyun, bir tane ekleyin: kaç oldu? Birini yiyin: kaç kaldı?',
  onluk: 'On makarnayı bir kâseye koyun, yanına üç tane daha: kaç oldu? Birlikte sayın: on bir, on iki, on üç.',
};
export const EVDE_BASLANGIC = 'Akşam yemeğinde tabakları birlikte sayın: bir, iki, üç… Kaç kişi yemek yiyor?';
const DERS_KAYDI: Record<Exclude<DersId, 'sayilar'>, string> = {
  sekiller: SEKIL_KAYIT_ANAHTARI, olcu: OLCU_KAYIT_ANAHTARI, oruntu: ORUNTU_KAYIT_ANAHTARI, topla: TOPLAMA_KAYIT_ANAHTARI, onluk: ONLUK_KAYIT_ANAHTARI,
};
export type BugunEvde = { baslik: string; metin: string; ders?: DersId };

export type VeliOzeti = {
  yol: Yol;
  yasYazi: string;
  /** Hiçbir şey oynanmadı (Ceren'le tanışma bile yok). */
  bos: boolean;
  ders: DersOzeti;
  oyuncaklar: OyuncakOzeti[];
  turlar: { yapilan: number; toplam: number };
  hatiralar: number;
  beceriler: BeceriOzeti[];
  oneriler: Oneri[];
  /** Akıllı tekrarın zorlandığı sayılar (ileride; boşsa bölüm görünmez). */
  zorlananlar: number[];
  /** Sayının dışında zorlandığı konular (Şekiller, Örüntü, Ölçü, sınıflama); en son takıldığı önce, en çok altı. */
  zorKonular: ZorKonuOzeti[];
  /** En son bitirdiği derse göre (ders yolu sırası) akşam evde bir dakikalık oyun; ilerleme yoksa başlangıç. */
  bugun: BugunEvde;
};
export type VeliGirdisi = {
  /** Menüdeki yaş: src/engine/menu-yas.ts → menuYasiOku(). */
  yas: number | null;
  /** Kayıt okuyucu (localStorage.getItem gibi); yazılmaz. */
  oku: (anahtar: string) => string | null;
  zorlananlar?: readonly number[];
  /** Konu defteri (akilli-tekrar.ts → zorKonular): { alan, konu }; tanınmayanlar atlanır. */
  zorKonular?: readonly { alan: string; konu: string }[];
};
export type ZorKonuOzeti = { alan: string; alanAdi: string; konu: string; ad: string };
const ZOR_KONU_ADI: Record<string, { ad: string; konular: Record<string, string> }> = {
  sekil: { ad: 'Şekiller', konular: { daire: 'daire', kare: 'kare', ucgen: 'üçgen', dikdortgen: 'dikdörtgen', oval: 'oval', yildiz: 'yıldız', kalp: 'kalp', altigen: 'altıgen' } },
  oruntu: { ad: 'Örüntü', konular: { renk: 'renk örüntüsü', sekil: 'şekil örüntüsü', ses: 'ses örüntüsü', kendi: 'kendi örüntüsü' } },
  olcu: { ad: 'Ölçü', konular: { 'buyuk-kucuk': 'büyük ve küçük', 'uzun-kisa': 'uzun ve kısa', 'cok-az': 'çok ve az', 'agir-hafif': 'ağır ve hafif', doluluk: 'dolu, yarım, boş', zaman: 'önce ve sonra' } },
  siniflama: { ad: 'Sınıflama', konular: { renk: 'renge göre ayırma', bicim: 'şekle göre ayırma', boy: 'boya göre ayırma' } },
  // Saklambaç (konum-sira.ts → ILISKILER).
  konum: { ad: 'Konum', konular: { icinde: 'içinde', altinda: 'altında', ustunde: 'üstünde', arkasinda: 'arkasında', onunde: 'önünde', yaninda: 'yanında', arasinda: 'arasında' } },
};
/** Konu defterindeki kayıtları veli diline çevirir (tanınmayanı ve yineleneni atar). */
export function zorKonuOzeti(liste: readonly { alan: string; konu: string }[] = []): ZorKonuOzeti[] {
  const sonuc: ZorKonuOzeti[] = [];
  for (const { alan, konu } of liste) {
    const a = ZOR_KONU_ADI[alan], ad = a?.konular[konu];
    if (!a || !ad || sonuc.some((z) => z.alan === alan && z.konu === konu)) continue;
    sonuc.push({ alan, alanAdi: a.ad, konu, ad });
  }
  return sonuc.slice(0, 6);
}

const guvenliOku = (oku: VeliGirdisi['oku'], anahtar: string) => {
  try { return oku(anahtar); } catch { return null; }
};

function dersOzeti(metin: string | null, yol: Yol): DersOzeti {
  const aralik = dersSayilari(yol === 'minik');
  const k = kaydiCoz(metin, aralik);
  const ogrenilenler = aralik.filter((n) => k.biten.includes(n));
  const tamam = hepsiBitti(k, aralik);
  const durum: Durum = tamam ? 'tamam' : ogrenilenler.length || k.tanitildi ? 'suruyor' : 'yok';
  const sirada = tamam ? undefined : k.biten.includes(k.simdi) ? siradaki(k, k.simdi, aralik) : k.simdi;
  const son = aralik[aralik.length - 1];
  const yazi = durum === 'tamam'
    ? `1'den ${yonelme(son)} kadar bütün sayıları öğrendi.`
    : durum === 'yok'
      ? "Henüz başlamadı. Sayı masasına ilk dokunuşta Ceren Öğretmen 1'den başlar."
      : ogrenilenler.length
        ? `${ogrenilenler.length} sayı öğrendi. Sırada ${sirada} var.`
        : `Ceren Öğretmen'le tanıştı. Sırada ${sirada} var.`;
  return {
    sayilar: aralik.map((n) => ({ n, durum: k.biten.includes(n) ? 'ogrendi' : n === sirada ? 'sirada' : 'bekliyor' })),
    ogrenilen: ogrenilenler.length,
    toplam: aralik.length,
    enBuyuk: ogrenilenler.length ? Math.max(...ogrenilenler) : 0,
    sirada,
    durum,
    yazi,
  };
}

function oyuncakOzeti(k: Kose, r: OyuncakKaydi, yol: Yol, ders: DersOzeti): OyuncakOzeti {
  const toplam = siraOf(yol, k).length;
  const bitti = oyuncakBittiMi(k, r, toplam);
  const tamam = Math.min(r.adim, toplam);
  const durum = bitti ? 'bitti' : tamam > 0 ? 'suruyor' : k === 'sayi' && ders.durum !== 'tamam' ? 'bekliyor' : 'yok';
  // Bitirdikten sonra sıraya eklenen yeni turlarda (ilk ek turdan sonra, yeniden oynamadan) "yeni turlar" yazar.
  const ilkEk = siraOf(yol, k).findIndex((n) => n >= 100);
  const yeniTurlarda = r.tekrar === 0 && ilkEk >= 0 && tamam >= ilkEk;
  const yazi = durum === 'bitti'
    ? tamam < toplam ? (yeniTurlarda ? `Bitirdi · yeni turlar (${tamam}/${toplam})` : `Bitirdi · yeniden oynuyor (${tamam}/${toplam})`) : `Bitirdi · ${toplam} tur`
    : durum === 'suruyor' ? `${tamam} / ${toplam} tur`
      : durum === 'bekliyor' ? "Ceren'in dersinden sonra başlar"
        : 'Henüz başlamadı';
  return { id: k, ad: OYUNCAK_ADLARI[k], tamam, toplam, bitti, hatira: r.hatira, durum, oran: bitti ? 1 : tamam / toplam, yazi };
}

type Birim = { beceri: BeceriId; is: string; yapildi: boolean };

/** Becerilere sayılan işler, oynanış sırasıyla: önce Ceren'in sayıları ve kule, sonra oyuncakların turları. */
function birimler(yol: Yol, kayitlar: Record<Kose, OyuncakKaydi>, ders: DersOzeti): Birim[] {
  const liste: Birim[] = ders.sayilar.map((s) => ({ beceri: 'sayma', is: 'ders', yapildi: s.durum === 'ogrendi' }));
  const sayiBitti = oyuncakBittiMi('sayi', kayitlar.sayi, siraOf(yol, 'sayi').length);
  liste.push({ beceri: 'sayma', is: 'kule', yapildi: kayitlar.sayi.kuleTamam || sayiBitti });
  for (const k of KOSELER) {
    const sira = siraOf(yol, k), r = kayitlar[k], bitti = oyuncakBittiMi(k, r, sira.length);
    sira.forEach((n, i) => {
      const tur = turTuru(k, n, i, sira.length);
      const beceri = turunBecerisi(k, tur);
      if (beceri) liste.push({ beceri, is: tur.split('+')[0], yapildi: bitti || i < r.adim });
    });
  }
  return liste;
}

// ---------------------------------------------------------------- Evde birlikte
/** Becerinin sıradaki işine göre evde kısa bir oyun (1–2 cümle). */
export function oneriMetni(b: Pick<BeceriOzeti, 'id' | 'durum' | 'sonraki'>, yol: Yol, ders: Pick<DersOzeti, 'enBuyuk' | 'sirada'>): string {
  const is = b.durum === 'tamam' ? 'tamam' : b.sonraki;
  switch (b.id) {
    case 'sayma':
      switch (is) {
        case 'ders':
          return ders.enBuyuk && ders.sirada
            ? `Ceren'le ${yonelme(ders.enBuyuk)} kadar saydı. Merdiven çıkarken birlikte sayın; ${belirtme(ders.sirada)} çocuğunuz söylesin.`
            : 'Merdiven çıkarken basamakları birlikte sayın: bir, iki, üç…';
        case 'kule': return 'Kutuları ya da bardakları üst üste dizin; her katta sayıyı birlikte söyleyin: bir, iki, üç…';
        case 'say': return 'Sofrayı birlikte kurun: herkese bir tabak, bir kaşık. Sonra kaşıkları birlikte sayın.';
        case 'paylas': return 'Üzümleri iki tabağa o paylaştırsın: bir sana, bir bana. Sonunda iki tabak eşit mi, birlikte bakın.';
        case 'esle': return 'Asansörde ya da kitapta bir rakam gösterin; o kadar parmak kaldırsın.';
        case 'pazar': return 'Markette sepete üç elma koymasını isteyin; sayarak koysun.';
        case 'topla-cikar':
          return yol === 'minik'
            ? 'Masaya iki elma, yanına iki elma daha koyun. Hepsi kaç tane, birlikte sayın.'
            : 'Masaya dört elma koyun, bir tane ekleyin: kaç oldu? Birini yiyin: kaç kaldı?';
        default: return 'Gün içinde gördüğü sayıları ona okutun: kapı numarası, asansör düğmesi, kitap sayfası.';
      }
    case 'bakis':
      if (is === 'tamam') {
        return yol === 'minik'
          ? 'Kaşıkları ikişer, üçer gruplayın; saymadan kaç tane olduğunu söylesin.'
          : 'Domino ya da zarla oynayın; noktaları saymadan, bir bakışta söylesin.';
      }
      return yol === 'minik'
        ? 'Avucunuzda iki ya da üç küçük oyuncak gösterip kapatın: kaç tane gördü?'
        : yol === 'dort'
          ? 'Zarla oynayın: zarı atınca noktaları saymadan söylesin.'
          : 'Parmaklarınızla bir an bir sayı gösterin (beş ve iki gibi); saymadan bulsun.';
    case 'sekil':
      if (b.durum === 'yok') return 'Evde şekil avına çıkın: saat yuvarlak, pencere dikdörtgen, peynir dilimi üçgen.';
      switch (is) {
        case 'konum': return 'Oyuncağını kutunun soluna, sağına, üstüne koysun; siz söyleyin, o yapsın.';
        case 'gezgin': return 'Resimli kitapta kare, üçgen ve daire arayın; bulduğunu parmağıyla göstersin.';
        case 'tamam': return 'Yürüyüşte trafik levhalarının şeklini sorun: üçgen mi, daire mi, kare mi?';
        default: return 'Bloklarla siz küçük bir ev yapın; aynısını o kursun, alttaki parçadan başlasın.';
      }
    case 'olcme':
      switch (is) {
        case 'karsilastir':
          return yol === 'minik'
            ? 'İki tabağa meyve koyun: hangisinde daha çok var? Önce tahmin etsin, sonra birlikte sayın.'
            : 'İki tabağa farklı sayıda meyve koyun: hangisinde daha çok, hangisinde daha az var?';
        case 'denge': return 'İki elinde birer oyuncak tutsun: hangisi daha ağır, hangisi daha hafif?';
        case 'tamam': return 'Kek yaparken ölçü kaşığıyla birlikte ölçün; kaç kaşık koyduğunuzu o saysın.';
        default: return 'Masayı kaşıkla ölçün: kaşıkları boşluk bırakmadan uç uca dizsin, kaç kaşık oldu birlikte sayın.';
      }
    case 'oruntu':
      // Başlamamışsa Fener'in ilk işi (örüntü) gibi: malzemesiz bir beden ritmi.
      if (b.durum === 'yok') return 'Alkış, dizlere vur, alkış, dizlere vur… Siz başlatın, sırayı o sürdürsün.';
      switch (is) {
        case 'hafiza': return 'Üç hareketi sırayla yapın: zıpla, alkışla, dön. Aynı sırayla o tekrarlasın.';
        case 'besteci': return 'Tencere ve kaşıkla kısa bir ritim çalsın; siz aynısını çalın, sonra yer değiştirin.';
        case 'buyume': return 'Günün sırasını konuşun: önce kahvaltı, sonra oyun, en son uyku. Karışık söyleyin, o düzeltsin.';
        case 'tamam': return "Boncuk ya da Lego'yla kendi sırasını dizsin (kırmızı, mavi, kırmızı…); sıradakini siz koyun, o denetlesin.";
        default: return 'Alkış, dizlere vur, alkış, dizlere vur… Siz başlatın, sırayı o sürdürsün.';
      }
  }
}
export const HEPSI_BITTI_ONERISI = 'Bütün oyuncakları bitirdi! Bu kez soruları o sorsun: “Kaç tane?”, “Hangisi daha uzun?” Siz cevaplayın.';

/**
 * İki öneri: önce öğrenmekte olduğu beceriler (pekişsin), sonra başlamadıkları (hazırlık), en son bitirdiği bir beceri.
 * Hepsi bittiyse kutlayan bir öneri ve saymayı canlı tutan bir öneri.
 */
function oneriSec(beceriler: BeceriOzeti[], yol: Yol, ders: DersOzeti, haric?: BeceriId): Oneri[] {
  // Bugün Evde kartı bir beceriyi zaten anlatıyorsa (Sayılar) aynı öneri burada yinelenmez.
  const adaylar = [...beceriler.filter((b) => b.durum === 'suruyor'), ...beceriler.filter((b) => b.durum === 'yok')].filter((b) => b.id !== haric);
  const biten = beceriler.filter((b) => b.durum === 'tamam');
  const sec = [...adaylar, ...biten].slice(0, 2);
  if (!adaylar.length) return [{ beceri: 'hepsi', metin: HEPSI_BITTI_ONERISI }, { beceri: 'sayma', metin: oneriMetni(beceriler[0], yol, ders) }];
  return sec.map((b) => {
    const resim = oneriResmi(b);
    return { beceri: b.id, metin: oneriMetni(b, yol, ders), ...(resim ? { resim } : {}) };
  });
}

/** Kayıtlar → veli sayfasının görünüm modeli (saf: aynı girdiye aynı sonuç). */
export function veliOzeti(g: VeliGirdisi): VeliOzeti {
  const yol = yasYolu(g.yas);
  const ders = dersOzeti(guvenliOku(g.oku, KAYIT_ANAHTARI), yol);
  const kayitlar = Object.fromEntries(KOSELER.map((k) => [k, oyuncakKaydiCoz(guvenliOku(g.oku, kayitOneki(yol) + k), yol, k)])) as Record<Kose, OyuncakKaydi>;
  const oyuncaklar = KOSELER.map((k) => oyuncakOzeti(k, kayitlar[k], yol, ders));
  const isler = birimler(yol, kayitlar, ders);
  const beceriler = BECERILER.map((id): BeceriOzeti => {
    const benim = isler.filter((b) => b.beceri === id);
    const yapilan = benim.filter((b) => b.yapildi).length;
    return {
      id,
      ad: BECERI_ADI[id],
      aciklama: beceriAciklamasi(id, yol),
      yapilan,
      toplam: benim.length,
      durum: yapilan === 0 ? 'yok' : yapilan === benim.length ? 'tamam' : 'suruyor',
      sonraki: benim.find((b) => !b.yapildi)?.is,
    };
  });
  const zorlananlar = [...new Set((g.zorlananlar ?? []).filter((n) => Number.isInteger(n) && n >= 0 && n <= 20))].sort((a, b) => a - b);
  const bugun = bugunEvde(g, yol, ders);
  return {
    yol,
    yasYazi: yasYazisi(g.yas),
    bos: ders.durum === 'yok' && oyuncaklar.every((o) => o.durum === 'yok' || o.durum === 'bekliyor') && !kayitlar.sayi.kuleTamam,
    ders,
    oyuncaklar,
    turlar: {
      yapilan: oyuncaklar.reduce((t, o) => t + (o.bitti ? o.toplam : o.tamam), 0),
      toplam: oyuncaklar.reduce((t, o) => t + o.toplam, 0),
    },
    hatiralar: oyuncaklar.filter((o) => o.hatira).length,
    beceriler,
    // Kart merdivende saymayı anlatıyorsa (Sayılar dersi yarıda) aynı öneri Evde birlikte'de yinelenmez; kule, paylaştırma gibi öbür işler kalır.
    oneriler: oneriSec(beceriler, yol, ders, bugun.ders === 'sayilar' && beceriler[0].sonraki === 'ders' ? 'sayma' : undefined),
    zorlananlar,
    zorKonular: zorKonuOzeti(g.zorKonular),
    bugun,
  };
}

/** Bugün Evde: yaşın ders yolunda bitmiş en ileri ders; yoksa Sayılar yarıdaysa onun, hiçbir şey yoksa başlangıç ipucu. */
function bugunEvde(g: VeliGirdisi, yol: Yol, ders: DersOzeti): BugunEvde {
  const bitti = (d: DersId) => {
    if (d === 'sayilar') return ders.durum === 'tamam';
    try { return (JSON.parse(guvenliOku(g.oku, DERS_KAYDI[d]) || 'null') as { bitti?: unknown } | null)?.bitti === true; } catch { return false; }
  };
  const son = [...yasDersleri(g.yas)].reverse().find(bitti);
  const ad = (d: DersId) => (d === 'sayilar' && yol === 'minik' ? 'Sayılar 1–5' : DERS_ADI[d]);
  if (son) return { ders: son, baslik: `${ad(son)} dersini bitirdi`, metin: EVDE_DERS[son] };
  if (ders.durum === 'suruyor' && ders.enBuyuk && ders.sirada) {
    return { ders: 'sayilar', baslik: `Ceren'le ${yonelme(ders.enBuyuk)} kadar saydı`, metin: `Merdiven çıkarken birlikte sayın; ${belirtme(ders.sirada)} çocuğunuz söylesin.` };
  }
  return { baslik: 'Başlarken', metin: EVDE_BASLANGIC };
}
