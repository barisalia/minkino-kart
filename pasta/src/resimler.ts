/**
 * Pasta Otobüsü görsel yuvaları (tek liste). Her eşya assets/pasta/<ad>.webp ya da <ad>-<n>.webp dosyasından gelir
 * (Gemini çizer, Adobe temizler; -1, -2 … sürüm eki: en büyük sürüm kullanılır). Dosya yoksa cizim.ts'deki yumuşak
 * kod çizimi yedek olarak kalır. Yeni görsel gelince yalnız dosyayı klasöre koymak yeter: Vite derlemede klasörü tarar.
 *
 * Bir yuvanın birden çok aday adı olabilir (ilk bulunan kullanılır), ör. kasa: kasa, kasa-pembe.
 */
import type { Kalip, Renk, Sekil, Sus } from './model';

const DOSYALAR = import.meta.glob<string>('../../assets/pasta/*.webp', { eager: true, query: '?url', import: 'default' });

/** Dosya yollarından ad → en yüksek sürümün adresi ("ad-3.webp" > "ad-1.webp" > "ad.webp") */
export function surumTablosu(dosyalar: Record<string, string>): Map<string, string> {
  const en = new Map<string, { n: number; url: string }>();
  for (const [yol, url] of Object.entries(dosyalar)) {
    const m = /([^/\\]+?)(?:-(\d+))?\.webp$/.exec(yol);
    if (!m) continue;
    const ad = m[1];
    const n = m[2] ? Number(m[2]) : 0;
    const eski = en.get(ad);
    if (!eski || n > eski.n) en.set(ad, { n, url });
  }
  return new Map([...en].map(([ad, v]) => [ad, v.url]));
}

const TABLO = surumTablosu(DOSYALAR);

/** Adaylardan ilk bulunan görselin adresi (yoksa null: kod çizimi kullanılır) */
export function resim(adaylar: readonly string[], tablo: Map<string, string> = TABLO): string | null {
  for (const a of adaylar) {
    const u = tablo.get(a);
    if (u) return u;
  }
  return null;
}

/** Kurabiyenin hâli (görsel adı): hamur topu, kalıptan çıkmış çiğ, altın, yanık, kremalı */
export type KurabiyeHal = 'hamur-topu' | 'cig' | 'altin' | 'yanik' | 'krema';

// ---------------------------------------------------------------- yuvalar (ad kalıpları yalnız burada)
export const YUVA = {
  /** otobüsün içi: fayans duvar, raflar, pencere, tezgâh (opak, 1376×768) */
  arka: ['arka-tezgah-uzak'],
  /** tezgâhın ön yüzü (aynı tuval, üstü şeffaf) */
  tezgahOn: ['tezgah-on'],
  /** önden düz bakan, üst üste 3 gözlü fırın dolabı (311×504; eski çapraz firin-1 artık kullanılmaz) */
  firin: ['firin-dik'],
  tepsi: ['firin-tepsisi', 'tepsi'],
  hamurKasesi: ['hamur-kasesi'],
  kasik: ['tahta-kasik'],
  tabak: ['servis-tabagi', 'tabak'],
  /**
   * Pasta otobüsü (açılış, akşam, raf; gün girişi): yandan, sağa bakar, yan kapağı KAPALI, tekerlekleri takılı; tuval
   * 640:420 (kod çiziminin viewBox'ı), şeffaf zemin. Kapak ve tekerlek yerleri cizim.ts → OTOBUS_YERI (kodun yerleri;
   * çizim başka yerdeyse orası ölçülür). Yoksa kod çizimi.
   */
  otobus: ['otobus'],
  /** otobüsün çizilmiş tekerleği (kare, şeffaf; lastik + jant + göbek): otobüs görselinin tekerleğinin üstüne oturur, jant döner */
  teker: ['teker'],
  kasa: ['kasa', 'kasa-pembe'],
  kumbara: ['kumbara', 'kumbara-otobus', 'kumbara-kavanoz'],
  jeton: ['jeton'],
  /**
   * Kremalı kurabiyenin süs katmanları (Gemini'den istenecek; şeffaf zeminli, kurabiyenin ortasına oturan desen):
   * zikzak krema (yuvarlak, kalp), nokta krema (yıldız, ay), şeker serpintisi (hepsinde). Yoksa kod çizimi.
   */
  desenZigzag: ['desen-zigzag'],
  desenNokta: ['desen-nokta'],
  /** v2 desenleri (beyaz krema; görsel yoksa krema şeridi kodla) */
  desenDalga: ['desen-dalga'],
  desenKalp: ['desen-kalp'],
  serpinti: ['susler-serpinti'],
  // ---- v2 (pasta-otobusu-v2.md 8: Gemini görsel listesi). Yoksa yumuşak kod çizimi (ince sıcak kahve kontur, gölge, parlama).
  /** serpinti kavanozu (sallanır; kapağı delikli) */
  serpintiKavanozu: ['serpinti-kavanozu', 'kavanoz-serpinti'],
  /** yüz süsleri: iki göz (bir arada), gülen ağız, pembe yanak şekeri */
  yuzGoz: ['kurabiye-yuz-goz', 'yuz-goz'],
  yuzAgiz: ['kurabiye-yuz-agiz', 'yuz-agiz'],
  /** şaşkın (O) ağız ve göz kırpma (görsel yoksa krema çizgisi) */
  yuzAgizSaskin: ['kurabiye-yuz-agiz-saskin'],
  yuzKirpma: ['kurabiye-yuz-kirpma'],
  yuzYanak: ['yuz-yanak', 'pembe-seker'],
  /** içecek makinesi (3 musluk: süt, kakao, limonata) ve boş bardaklar (içi şeffaf; dolum kodla) */
  icecekMakinesi: ['icecek-makinesi'],
  bardakKucuk: ['bardak-kucuk'],
  bardakBuyuk: ['bardak-buyuk'],
  /** doğum günü mumu (yanık ve sönük) */
  mum: ['mum', 'mum-yanik'],
  mumSonuk: ['mum-sonuk'],
  /** bulaşık: temiz tabak, kirli tabak */
  temizTabak: ['tabak-temiz'],
  kirliTabak: ['tabak-kirli'],
  /** gün hedefi ve yıldız */
  yildiz: ['yildiz'],
  mutluKalp: ['mutlu-kalp'],
  /** Ege'nin annesi: şekersiz işareti (serpintinin üstü çizili) */
  sekersiz: ['sekersiz'],
} as const satisfies Record<string, readonly string[]>;

/**
 * Kurabiyenin üstündeki tek süs parçası (susler-cilek …; bal için susler-bal-damlasi). Çikolata görselinde üç damla bir
 * arada: sayılabilsin diye ondan ayrılmış tek damla (susler-cikolata-tek, kodla kesildi) önce gelir.
 */
export const susParcaAdlari = (s: Sus): string[] => (s === 'cikolata' ? ['susler-cikolata-tek', 'susler-cikolata'] : [`susler-${s === 'bal' ? 'bal-damlasi' : s}`]);

/** Krema şeridi dokusu (parmak yolu boyunca döşenir), renk renk */
export const seritAdlari = (r: Renk): string[] => [`krema-serit-${r}`];
export const kalipAdlari = (k: Kalip): string[] => (k === 'kapkek' ? ['cupcake-kalip', 'kalip-kapkek', 'kapkek-kalibi'] : [`kalip-${k}`]);
export const kremaAdlari = (r: Renk): string[] => [`krema-${r}`, `krema-torbasi-${r}`];
export const kavanozAdlari = (s: Sus): string[] => [`kavanoz-${s}`, `sus-kavanozu-${s}`];
export function kurabiyeAdlari(sekil: Sekil, hal: KurabiyeHal, renk?: Renk | null): string[] {
  if (hal === 'krema') return renk ? [`kurabiye-${sekil}-krema-${renk}`, `kurabiye-${sekil}-kremali-${renk}`] : [];
  if (hal === 'hamur-topu') return [`kurabiye-${sekil}-hamur-topu`, `kurabiye-${sekil}-top`, 'hamur-topu'];
  return [`kurabiye-${sekil}-${hal}`];
}
/**
 * Kapkek (cupcake): pişmiş gövde (krema yığınları ve süsler kod çizimi üstüne gelir; cupcake-krema-pembe üstünde çilek
 * olduğu için kullanılmaz: sipariş balonunda istenmeyen süs görünürdü). Çiğ hâli ayrı gelirse o da.
 */
export const kapkekAdlari = (cig: boolean): string[] => (cig ? ['cupcake-cig', 'kapkek-cig'] : ['cupcake-pismis', 'cupcake', 'kapkek']);

// ---------------------------------------------------------------- görsellerin içindeki yerler (tuvalin oranı olarak)
/**
 * Arka katmanda pencerenin açıklığı ve tezgâhın çizgileri (arka-tezgah-uzak, tezgah-on aynı tuval). Değerler tuvalin
 * eni / boyu cinsinden (0-1): görselin piksel boyu değişse de geçerli; yeni çizimde pencere başka yerdeyse burası değişir.
 */
export const ARKA = {
  /** pencere açıklığı: sol, sağ, üst; alt kenarı tezgâh çizgisi */
  pencere: { sol: 0.3619, sag: 0.6475, ust: 0.2852 },
  /** tezgâhın arka kenarı (üst yüzeyin başladığı çizgi) ve ön kenarı (dolapların başladığı çizgi) */
  tezgah: 0.5443,
  tezgahOn: 0.6576,
};
/**
 * Dik fırın görselinde (firin-dik, 311×504) üst üste üç göz: kapı paneli (dokunma alanı), camı (turuncu ışık; içinde
 * kurabiyeler) ve sağdaki düğme (pişme saati onun üstüne gelir). Değerler tuvalin oranı (ölçüldü). En/boy oranı.
 */
export const FIRIN_ORAN = 311 / 504;
export const FIRIN_GOZLERI = [
  { kapi: { x: 0.07, y: 0.045, w: 0.86, h: 0.282 }, cam: { x: 0.225, y: 0.111, w: 0.531, h: 0.113 }, dugme: { x: 0.852, y: 0.188 } },
  { kapi: { x: 0.07, y: 0.327, w: 0.86, h: 0.275 }, cam: { x: 0.225, y: 0.381, w: 0.531, h: 0.113 }, dugme: { x: 0.852, y: 0.457 } },
  { kapi: { x: 0.07, y: 0.602, w: 0.86, h: 0.28 }, cam: { x: 0.225, y: 0.655, w: 0.531, h: 0.115 }, dugme: { x: 0.852, y: 0.73 } },
];
/**
 * Krema torbası görselleri (338×355 tuval) çapraz çizilmiş; tezgâhta tutacakta dik durur: ana eksen (alfa PCA ile
 * ölçüldü, ~-47°) dikeye döndürülür, ucu aşağıda. aci: döndürme (derece), cx/cy: dönme merkezi, x/y/w/h: dik hâlinin
 * kutusu (tuval pikseli).
 */
export const KREMA_DIK = { aci: -43, cx: 170, cy: 172, x: 88, y: -22, w: 164, h: 426 };

/** Görselin en / boy oranını okur (yüklenince), elemana CSS değişkeni olarak yazar */
export function oranYaz(url: string, el: HTMLElement, degisken: string) {
  const i = new Image();
  i.onload = () => {
    if (i.naturalWidth && i.naturalHeight) el.style.setProperty(degisken, (i.naturalWidth / i.naturalHeight).toFixed(4));
  };
  i.src = url;
}

/** Kısayollar */
export const yuva = (ad: keyof typeof YUVA) => resim(YUVA[ad]);

/** Beklenen bütün görsel adları (eksik listesi için) */
export function beklenenler(sekiller: readonly Sekil[], renkler: readonly Renk[], susler: readonly Sus[]): { ad: string; adaylar: string[] }[] {
  const l: { ad: string; adaylar: string[] }[] = Object.entries(YUVA).map(([ad, a]) => ({ ad, adaylar: [...a] }));
  for (const k of [...sekiller, 'kapkek'] as Kalip[]) l.push({ ad: `kalip-${k}`, adaylar: kalipAdlari(k) });
  for (const r of renkler) l.push({ ad: `krema-${r}`, adaylar: kremaAdlari(r) });
  for (const s of susler) l.push({ ad: `kavanoz-${s}`, adaylar: kavanozAdlari(s) });
  for (const s of susler) l.push({ ad: susParcaAdlari(s)[0], adaylar: susParcaAdlari(s) });
  for (const sk of sekiller) {
    for (const h of ['hamur-topu', 'cig', 'altin', 'yanik'] as const) l.push({ ad: `kurabiye-${sk}-${h}`, adaylar: kurabiyeAdlari(sk, h) });
    for (const r of renkler) l.push({ ad: `kurabiye-${sk}-krema-${r}`, adaylar: kurabiyeAdlari(sk, 'krema', r) });
  }
  l.push({ ad: 'cupcake', adaylar: kapkekAdlari(false) });
  return l;
}
/** Henüz dosyası olmayan yuvalar */
export const eksikler = (sekiller: readonly Sekil[], renkler: readonly Renk[], susler: readonly Sus[], tablo: Map<string, string> = TABLO) =>
  beklenenler(sekiller, renkler, susler)
    .filter((b) => !resim(b.adaylar, tablo))
    .map((b) => b.ad);

/** <img> etiketi (sürüklenmez, dokunuşu düğmeye bırakır) */
export const imgEtiketi = (url: string, sinif: string) => `<img class="ps-r ${sinif}" src="${url}" alt="" draggable="false" decoding="async">`;
/** Görsel varsa <img>, yoksa yedek kod çizimi */
export const resimVeya = (adaylar: readonly string[], yedek: string, sinif: string) => {
  const u = resim(adaylar);
  return u ? imgEtiketi(u, sinif) : yedek;
};
