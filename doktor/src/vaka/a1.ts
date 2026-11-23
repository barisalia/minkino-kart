// "Zıpzıp'ın Dikenli Patisi" · Paket Doktor-A1 (23 Kasım 2026 00:34 brief'i): oyunu baştan sona elit yapan kareler.
// Giriş (topallama, zıplama), lavabo (doktorun el yıkaması), göğüs (stetoskop), kolda ıslak pamuk ve kat kat sargı,
// ödül (çıkartma defteri, sevinç dansı), tepki pozları ve etkiler. Adlar ve ölçüler brief'le birebir.
// Saf veri ve hesap: DOM yok; birim testleri buradan sınar. Bir aşamanın çizimleri tam gelmeden o aşama oyunda görünmez.
import KIRPMA from './a1-kirpma.json';
import { SAHNE, SECMELI, type Asama, type KinoPozu, type Kutu, type Nokta, type Yas, type Yuz } from './veri';

const dizi = (onek: string, adet: number): string[] => Array.from({ length: adet }, (_, i) => `${onek}-${i}`);

// ————————————————————————————————————————————— adlar (assets/doktor/vaka/<ad>.webp)
export const A1 = {
  // A · masa: giriş ve Kino
  topal: dizi('zipzip-topal', 6), zipla: dizi('zipzip-zipla', 3), bekle: ['zipzip-bekle-bak', 'zipzip-bekle-of'],
  kinoMasa: { karsila: dizi('kino-karsila', 2), kirp: 'kino-kirp', dusun: 'kino-dusun', kahkaha: 'kino-kahkaha', ups: 'kino-ups', yasasin: dizi('kino-yasasin', 2) },
  // B · lavabo
  lavaboFon: 'lavabo-fon', kol: dizi('musluk-kol', 3),
  patiler: { camurlu: 'patiler-camurlu', temiz: 'patiler-temiz', damla: 'patiler-damla', goster: 'patiler-goster' },
  ovma: dizi('ovma', 8),
  ayna: { merak: 'kino-ayna-merak', gidik: 'kino-ayna-gidik', kahkaha: 'kino-ayna-kahkaha', kopuk: 'kino-ayna-kopuk', mutlu: 'kino-ayna-mutlu', kirp: 'kino-ayna-kirp' },
  sabun: dizi('sabun', 3), havlu: dizi('havlu', 3),
  suAkis: dizi('su-akis', 4), suSicrama: dizi('su-sicrama', 4), suDamla: dizi('su-damla', 2), lavaboSu: dizi('lavabo-su', 2),
  kopurme: dizi('kopurme', 6), kabarcik: dizi('kabarcik', 4), kabarcikPat: dizi('kabarcik-pat', 3), kopukAkan: dizi('kopuk-akan', 3),
  // C · kol: mikroplar ve köpük
  mikrop: [0, 1, 2].map(i => ({ kipir: Array.from({ length: 4 }, (_, k) => `mikrop-${i}-k${k}`), kork: `mikrop-${i}-kork`, kopukte: `mikrop-${i}-kopukte` })),
  pofEk: ['pof-2', 'pof-3'], spreyBasili: 'sprey-basili', fiskirma: dizi('kopuk-fiskirma', 3), cimbizYari: 'cimbiz-yari',
  // D · göğüs
  gogusFon: 'gogus-fon',
  gogus: { korkulu: 'zipzip-gogus-korkulu', merak: 'zipzip-gogus-merak', kikir: 'zipzip-gogus-kikir', sakin: 'zipzip-gogus-sakin', kirp: 'zipzip-gogus-kirp', nefes: dizi('zipzip-gogus-nefes', 2) },
  stetoskop: 'stetoskop', stetoskopBasili: 'stetoskop-basili', kinoDinle: dizi('kino-dinle', 2), kalp: dizi('kalp', 3),
  // E · kol: diken, pamuk, sargı, bant
  dikenGergin: dizi('diken-gergin', 3), dikenKopma: dizi('diken-kopma', 3), dikenIzi: 'diken-izi',
  kase: 'kase-su', kaseDalga: dizi('kase-dalga', 2), pamukKuru: 'pamuk-kuru', pamukIslak: 'pamuk-islak', pamukKir: dizi('pamuk-kir', 4),
  sargiRulo: dizi('sargi-rulo', 4), sargiSerit: 'sargi-serit', sargiKat: dizi('sargi-kat', 5),
  bantKagit: dizi('bant-kagit', 3), bantKirisik: 'bant-kirisik', bantDuz: 'bant-duz',
  yuz: { kirp: 'zipzip-yakin-kirp', gozkisik: 'zipzip-yakin-gozkisik', oh: 'zipzip-yakin-oh', gulme: 'zipzip-yakin-gulme', merak: 'zipzip-yakin-merak', utangac: 'zipzip-yakin-utangac' },
  kinoYakin: { bak: dizi('kino-bak', 2), basparmak: 'kino-basparmak', alkisHizli: 'kino-alkis-hizli' },
  // F · etkiler
  parilti: dizi('parilti', 4), konfeti: dizi('konfeti', 6), yildizKuyruk: 'yildiz-kuyruk',
  // G · ödül
  defterFon: 'defter-fon',
  cikartma: ['yildiz', 'kalp', 'pati', 'gokkusagi', 'havuc', 'cicek', 'kemik', 'gunes'].map(a => 'cikartma-' + a),
  soyulma: dizi('cikartma-soyulma', 3), damga: 'damga', damgaBasili: 'damga-basili', damgaIzi: 'damga-izi',
  dans: dizi('zipzip-dans', 8), kinoDans: dizi('kino-dans', 2),
} as const;

const duz = (x: unknown): string[] => (typeof x === 'string' ? [x] : Array.isArray(x) ? x.flatMap(duz) : x && typeof x === 'object' ? Object.values(x).flatMap(duz) : []);
/** Paketin 192 karesi (anahtar kareler dışında). */
export const A1_DOSYALAR: readonly string[] = duz(A1);
/** Yöneticinin anahtar kare onayıyla (23 Kasım 01:50) eklenen kare: son çıkartma yapışınca kaygılı resmin üstüne gelen gülen portre. */
export const A1_EK = {
  defterPortre: 'defter-portre-mutlu',
  // Göğüs sahnesinin iri Kino'su (23 Kasım 05:09 eki, 1200 × 1152; tuvalin sol kenarı sahnede x 848'e göre çizildi):
  // bekle = başlık iki patisinin arasında; uzan = kolu Zıpzıp'a uzanmış (pati ve başlık çizili değil, oyundaki başlık oraya gelir);
  // dinle = aynı duruş, gözler kapalı (iki kare, kalp atışıyla baş sallanır).
  gogusBekle: 'kino-gogus-bekle', gogusUzan: 'kino-gogus-uzan', gogusDinle0: 'kino-gogus-dinle-0', gogusDinle1: 'kino-gogus-dinle-1',
  // göz kırpma (07:32 teslimi; isteğe bağlı: yoksa Kino göz kırpmaz)
  gogusBekleKirp: 'kino-gogus-bekle-kirp', gogusUzanKirp: 'kino-gogus-uzan-kirp',
  // defterin 4:3 fonu (2048 × 1536; iPad'de kitap ekranı doldurur). İsteğe bağlı: yoksa yatay fon büyütülür.
  defterFonDik: 'defter-fon-dik',
} as const;
/** göğüs sahnesindeki iri Kino'nun dört karesi */
export const KINO_GOGUS: readonly string[] = [A1_EK.gogusBekle, A1_EK.gogusUzan, A1_EK.gogusDinle0, A1_EK.gogusDinle1];
export const A1_EK_DOSYALAR: readonly string[] = Object.values(A1_EK);

/** Bir aşamanın açılması için hepsi gereken çizimler. Eksik biri varsa aşama oyunda yoktur (yer tutucu yok). */
export const A1_ASAMA = {
  giris: [...A1.topal, ...A1.zipla],
  lavabo: [A1.lavaboFon, ...A1.kol, ...Object.values(A1.patiler), ...A1.ovma, ...A1.sabun, ...A1.havlu, ...A1.suAkis, ...A1.suSicrama, ...A1.kopurme],
  // soluk kareleri (`nefes`) isteğe bağlı: gelmediyse Zıpzıp sakin pozda durur
  gogus: [A1.gogusFon, A1.gogus.korkulu, A1.gogus.merak, A1.gogus.kikir, A1.gogus.sakin, A1.gogus.kirp, A1.stetoskop, A1.stetoskopBasili, ...A1.kalp, ...KINO_GOGUS],
  pamuk: [A1.kase, A1.pamukKuru, A1.pamukIslak, ...A1.pamukKir],
  defter: [A1.defterFon, ...A1.cikartma, ...A1.soyulma, A1.damga, A1.damgaBasili, A1.damgaIzi],
  dans: [...A1.dans],
} as const;
export type A1Asama = keyof typeof A1_ASAMA;
/**
 * Kendi görünümü olan sahnelerin bütün çizimleri (zorunlu ve isteğe bağlı). Bellek için bu sahneler sırası gelince
 * kurulur, işi bitince çizimleriyle birlikte bırakılır: hepsi birden açık durursa sayfa belleği taşar (ölçüldü:
 * lavabo ve göğüs birlikte açıkken sayfa süreci ~870 MB, alet ele alınınca çöküyordu).
 */
export const A1_SAHNE = {
  lavabo: [A1.lavaboFon, ...A1.kol, ...Object.values(A1.patiler), ...A1.ovma, ...Object.values(A1.ayna), ...A1.sabun, ...A1.havlu, ...A1.suAkis, ...A1.suSicrama, ...A1.suDamla, ...A1.lavaboSu, ...A1.kopurme, ...A1.kabarcik, ...A1.kabarcikPat, ...A1.kopukAkan],
  gogus: [A1.gogusFon, ...duz(A1.gogus), A1.stetoskop, A1.stetoskopBasili, ...A1.kalp, ...KINO_GOGUS, A1_EK.gogusBekleKirp, A1_EK.gogusUzanKirp],
  defter: [A1.defterFon, ...A1.cikartma, ...A1.soyulma, A1.damga, A1.damgaBasili, A1.damgaIzi, A1_EK.defterPortre, A1_EK.defterFonDik],
  dans: [...A1.dans, ...A1.kinoDans],
} as const;
export type A1SahneAdi = 'lavabo' | 'gogus' | 'defter';
/**
 * Tam sahne boyundaki saydam katman setleri. Bağlanırken setin ortak dolu alanına kırpılırlar (a1-bagla.ts; yalnız saydam
 * kenar atılır) ve oyunda o kutuya konurlar: 2048 × 1152'lik bir katman bellekte 9,4 MB tutar, sargının katı 0,5 MB.
 */
export const A1_KIRP_SETLERI: readonly (readonly string[])[] = [A1.sargiKat, A1.lavaboSu, [A1.gogus.korkulu, A1.gogus.merak, A1.gogus.kikir, A1.gogus.sakin, A1.gogus.kirp, ...A1.gogus.nefes]];
/** Kırpılmış çizimin sahnedeki kutusu; kırpılmadıysa null (çizim tuvalinin tamamıdır). */
export function kirpKutusu(ad: string): Kutu | null {
  const k = (KIRPMA as Record<string, number[] | undefined>)[ad];
  return k ? { sol: k[0], ust: k[1], g: k[2], y: k[3] } : null;
}
// eski küçük `kino-dinle` kareleri göğüste artık kullanılmıyor (yerini iri Kino aldı): açılışta da yüklenmez
const sonradan = new Set<string>([...Object.values(A1_SAHNE).flat(), ...A1.kinoDinle]);
/** Oyun açılırken yüklenen A1 kareleri (masa ve kol sahnesine ait olanlar); gerisi sahnesi kurulurken yüklenir. */
export const A1_BASTAN: readonly string[] = A1_DOSYALAR.filter(ad => !sonradan.has(ad));
export const asamaAcik = (asama: A1Asama, varMi: (ad: string) => boolean): boolean => A1_ASAMA[asama].every(varMi);

/** Tuval boyutları (brief'teki ölçüler). */
export const A1_TUVAL: Readonly<Record<string, readonly [number, number]>> = (() => {
  const t: Record<string, readonly [number, number]> = {};
  const koy = (adlar: readonly string[], boy: readonly [number, number]) => { for (const a of adlar) t[a] = boy; };
  koy([...A1.topal, ...A1.zipla, ...A1.bekle, ...A1.dans], [1000, 940]);
  koy([...duz(A1.kinoMasa), ...A1.kinoDinle, ...duz(A1.kinoYakin), ...A1.kinoDans], [640, 620]);
  koy([A1.lavaboFon, ...A1.lavaboSu, A1.gogusFon, ...duz(A1.gogus), ...A1.sargiKat, A1.defterFon], [2048, 1152]);
  koy(A1.kol, [240, 240]);
  koy([...Object.values(A1.patiler), ...A1.ovma], [900, 700]);
  koy(Object.values(A1.ayna), [480, 480]);
  koy([...A1.sabun, ...A1.havlu, A1.spreyBasili, A1.cimbizYari, A1.stetoskop, A1.stetoskopBasili, ...A1.sargiRulo, A1.damga, A1.damgaBasili], [600, 600]);
  koy(A1.suAkis, [140, 520]); koy(A1.suSicrama, [400, 260]); koy(A1.suDamla, [160, 200]);
  koy(A1.kopurme, [420, 320]); koy(A1.kabarcik, [200, 200]); koy(A1.kabarcikPat, [240, 240]); koy(A1.kopukAkan, [360, 200]);
  koy([...A1.mikrop.flatMap(m => [...m.kipir, m.kork, m.kopukte]), ...A1.pofEk, ...A1.kalp, ...A1.cikartma, ...A1.soyulma, A1.damgaIzi], [300, 300]);
  koy(A1.fiskirma, [300, 200]); koy([...A1.dikenGergin, ...A1.dikenKopma], [300, 200]); koy([A1.dikenIzi, ...A1.konfeti], [120, 120]);
  koy([A1.kase, ...A1.kaseDalga], [520, 380]); koy([A1.pamukKuru, A1.pamukIslak, ...A1.pamukKir], [400, 400]);
  koy([A1.sargiSerit], [400, 100]); koy([...A1.bantKagit, A1.bantKirisik, A1.bantDuz], [360, 150]);
  koy(Object.values(A1.yuz), [640, 460]); koy(A1.parilti, [200, 200]); koy([A1.yildizKuyruk], [400, 200]);
  koy([A1_EK.defterPortre], [400, 400]); koy([...KINO_GOGUS, A1_EK.gogusBekleKirp, A1_EK.gogusUzanKirp], [1200, 1420]); koy([A1_EK.defterFonDik], [2048, 1536]);
  return t;
})();

// ————————————————————————————————————————————— lavabo: doktorun el yıkaması
export const LAVABO = {
  ic: { sol: 520, ust: 300, g: 960, y: 710 } as Kutu,
  gider: { x: 998, y: 911 } as Nokta,               // çizimden ölçüldü
  /** musluğun ağzı; su buradan aşağı akar */
  agiz: { x: 1000, y: 330 } as Nokta,
  /** suyun lavaboya çarptığı yükseklik (pati altındaysa patinin üstü) */
  dip: 840,
  kol: { sol: 1100, ust: 40, g: 240, y: 240 } as Kutu,
  // ayna, sabunluk ve havlu askısı: `lavabo-fon` çiziminden ölçüldü (23 Kasım). Aynanın camı hafif oval; aynadaki Kino
  // camın içine kırpılır (camX, camY: camın yarıçapları, konturun birkaç piksel içi).
  ayna: { x: 295, y: 285, yaricap: 210, camX: 180, camY: 189 },
  sabunluk: { x: 1734, y: 478 } as Nokta,
  havluYeri: { x: 252, y: 800 } as Nokta,
  /** patilerin tuvali (900 × 700) dinlenirken: lavabonun alt yarısında */
  patiYeri: { sol: 550, ust: 452, g: 900, y: 700 } as Kutu,
  /** pati tuvalinde iki patinin merkezi ve yarıçapı */
  patiMerkezleri: [{ x: 300, y: 300 }, { x: 600, y: 300 }] as readonly Nokta[], patiYaricapi: 150,
  /** patiler sürüklenirken tuvalin sol üst köşesinin gezebileceği alan (lavabonun içinde kalır) */
  patiSiniri: { sol: 330, ust: 300, g: 480, y: 220 } as Kutu,
  sabunBoyu: 300, havluBoyu: 360,
} as const;
export type LavaboAdimi = 'ac' | 'islat' | 'sabun' | 'ov' | 'durula' | 'kapat' | 'kurula' | 'bitti';
export const LAVABO_ADIMLARI: readonly LavaboAdimi[] = ['ac', 'islat', 'sabun', 'ov', 'durula', 'kapat', 'kurula', 'bitti'];
export interface LavaboZorluk { /** ıslanma süresi (ms, suyun altında) */ islat: number; /** sabunun patilerde gezmesi gereken yol (px) */ sabun: number; /** ovuşturma vuruşu sayısı */ ov: number; /** durulama süresi (ms, suyun altında) */ durula: number; /** kurulanması gereken pay (0–1) */ kurula: number; }
export const LAVABO_ZORLUK: Record<Yas, LavaboZorluk> = {
  '2-3': { islat: 500, sabun: 450, ov: 6, durula: 900, kurula: 0.55 },
  '4': { islat: 700, sabun: 700, ov: 8, durula: 1300, kurula: 0.7 },
  '5+': { islat: 800, sabun: 900, ov: 12, durula: 1600, kurula: 0.8 },
};
/**
 * Pati tuvalinin sol üst köşesi verilince: patilerden biri akışın altında mı. Dinlenirken su iki patinin ARASINDAN
 * akar (ıslanmazlar); çocuk patileri sağa ya da sola götürünce su birine değer.
 */
export const SU_GENISLIGI = 110;
export function suAltinda(patiSol: number, patiUst: number): boolean {
  return LAVABO.patiMerkezleri.some(m => Math.abs(patiSol + m.x - LAVABO.agiz.x) <= SU_GENISLIGI) && patiUst + 300 > LAVABO.agiz.y + 60;
}
/** Akışın altındaki patinin merkezi (su oraya çarpar); yoksa null. */
export function islananPati(patiSol: number, patiUst: number): Nokta | null {
  const m = LAVABO.patiMerkezleri.find(q => Math.abs(patiSol + q.x - LAVABO.agiz.x) <= SU_GENISLIGI);
  return m && patiUst + 300 > LAVABO.agiz.y + 60 ? { x: patiSol + m.x, y: patiUst + m.y } : null;
}
/** Bir nokta (sabun, havlu, parmak) patilerin üstünde mi. */
export function patiUstunde(p: Nokta, patiSol: number, patiUst: number, pay = 40): boolean {
  return LAVABO.patiMerkezleri.some(m => Math.hypot(p.x - (patiSol + m.x), p.y - (patiUst + m.y)) <= LAVABO.patiYaricapi + pay);
}

/**
 * Patilerdeki köpük: her patinin üstünde altı yuva; her yuvada köpüğün seviyesi (0 yok … KOPUK_SEVIYE en kabarık;
 * seviye N, `kopurme-(N−1)` karesidir). Sabun geçtiği yerdeki yuvaları, ovuşturma hepsini kabartır; su değdiği yuvaları söndürür.
 */
export const KOPUK_SEVIYE = 6;
export const KOPUK_YERLERI: readonly Nokta[] = LAVABO.patiMerkezleri.flatMap(m => ([[0, 0], [-80, -60], [80, -60], [-70, 70], [70, 70], [0, -120]] as const).map(([dx, dy]) => ({ x: m.x + dx, y: m.y + dy })));
/** p'ye (pati tuvali koordinatı) `yaricap` içindeki yuvaların seviyesini `fark` kadar değiştirir; değişen yuva sayısını verir. */
export function kopukDegistir(seviye: number[], p: Nokta, yaricap: number, fark: number): number {
  let n = 0;
  KOPUK_YERLERI.forEach((y, i) => {
    if (Math.hypot(y.x - p.x, y.y - p.y) > yaricap) return;
    const yeni = Math.max(0, Math.min(KOPUK_SEVIYE, seviye[i] + fark));
    if (yeni !== seviye[i]) { seviye[i] = yeni; n++; }
  });
  return n;
}
export const kopukToplami = (seviye: readonly number[]): number => seviye.reduce((a, b) => a + b, 0);
/** ovuşturma karelerinde patiler tuvalin ortasında buluşur */
export const OVMA_MERKEZI: Nokta = { x: 450, y: 300 };

/**
 * İleri geri vuruş sayacı (ovuşturma, fırçalama): parmak yön değiştirince ve o yönde en az `esik` kadar gitmişse bir
 * vuruş sayılır. Titreme (küçük gidip gelme) sayılmaz.
 */
export interface Vurus { /** son dönüş noktası */ uc: number; /** +1 sağa, −1 sola, 0 başlamadı */ yon: -1 | 0 | 1; sayi: number; }
export const vurusBaslangici = (): Vurus => ({ uc: NaN, yon: 0, sayi: 0 });
export function vurusAdimi(v: Vurus, x: number, esik = 55): Vurus {
  if (Number.isNaN(v.uc)) return { uc: x, yon: 0, sayi: 0 };
  const fark = x - v.uc;
  if (v.yon === 0) return Math.abs(fark) >= esik ? { uc: x, yon: fark > 0 ? 1 : -1, sayi: 1 } : v;
  // aynı yönde ilerliyorsa uç ilerler; ters yönde eşik kadar dönerse yeni vuruş
  if (fark * v.yon > 0) return { ...v, uc: x };
  return Math.abs(fark) >= esik ? { uc: x, yon: (v.yon * -1) as -1 | 1, sayi: v.sayi + 1 } : v;
}

/** Kurulama: patilerin üstü kaba bir ızgaraya bölünür; havlunun geçtiği hücreler kurur. */
export const KURU_SUTUN = 8, KURU_SATIR = 4;
/** pati tuvalinde kurulanacak alan (iki patiyi kaplar) */
export const KURU_ALAN: Kutu = { sol: 140, ust: 150, g: 620, y: 310 };
export function kuruHucre(p: Nokta, patiSol: number, patiUst: number): number {
  const x = Math.floor(((p.x - patiSol - KURU_ALAN.sol) / KURU_ALAN.g) * KURU_SUTUN), y = Math.floor(((p.y - patiUst - KURU_ALAN.ust) / KURU_ALAN.y) * KURU_SATIR);
  return x < 0 || y < 0 || x >= KURU_SUTUN || y >= KURU_SATIR ? -1 : y * KURU_SUTUN + x;
}
export const kuruOrani = (kuru: ReadonlySet<number>): number => kuru.size / (KURU_SUTUN * KURU_SATIR);

// ————————————————————————————————————————————— göğüs: stetoskop
export const GOGUS = {
  // Yerler `zipzip-gogus-*` çizimlerinden ölçüldü (23 Kasım): gömlek x 481…1152, y 552…847; kalp göğsün üst yanında.
  kalp: { x: 900, y: 700 } as Nokta,
  /** atan kalp çizimi göğsün üstünde değil, başın yanındaki boşlukta belirir (başlık kalbin üstündeyken görünsün) */
  kalpGoster: { x: 1050, y: 590 } as Nokta,
  /**
   * Kino sağda, iri ve yakın (onaylı anahtar karedeki kadraj). Ölçüler `kino-gogus-*` karelerinden (1200 × 1152):
   * `uzan` ve `dinle`de açık manşetin ucu tuvalde (34, 705); `bekle`de başlık patilerin arasında, merkezi (520, 760).
   */
  // `uzan` ve `dinle` kareleri 1420 boyunda (06:41 teslimi): etek ve ayaklar sahnenin altına taşar; iPad'de alt bantta görünür,
  // Kino yukarı uzanınca da kesik kenar çıkmaz. `bekle` 1152 boyunda, kutunun üstüne oturur.
  kino: { sol: 890, ust: 0, g: 1200, y: 1420 } as Kutu,
  /** Kino evindeyken başlığın manşete oturduğu yer: başlığın üçte biri manşetin içinde kalır */
  manset: { x: 900, y: 705 } as Nokta,
  /** Kino başlığın peşinden bu kadar uzanır (sahne pikseli); ötesinde hortum manşetten uzar */
  uzanma: { sol: -170, sag: 330, yukari: -120, asagi: 215 },
  /**
   * Başlığın gezebildiği alan (başlığın merkezi): Kino'nun uzanabildiği yerden en çok yarım başlık boyu yukarı çıkar;
   * solda hortum manşetten 150 px uzar, Kino Zıpzıp'ın bacaklarını örtmez.
   */
  gezme: { sol: 580, ust: 530, g: 920, y: 390 } as Kutu,
  /** stetoskopun gezebileceği göğüs alanı (gömlek ve çevresi) */
  alan: { sol: 430, ust: 500, g: 800, y: 420 } as Kutu,
  /**
   * Başlığın beklediği yer: Kino'nun patilerinin arası (`bekle` karesindeki çizili başlığın üstü). Oyundaki başlık
   * Kino'nun altında durur; evdeyken görünmez, çocuk çekince manşetin ucundan çıkar.
   * `baslik`: başlığın 600'lük tuvaldeki merkezi, çizim saat yönünde çeyrek tur döndükten sonra (hortum sağa, manşete uzanır).
   */
  ev: { x: 1410, y: 760 } as Nokta, baslik: { x: 155, y: 300 } as Nokta,
  /** bu kadar yakınsa kalp duyulur; bu kadar uzaktan itibaren sıcak-soğuk başlar */
  duyma: 120, menzil: 620,
  stetoskopBoyu: 380,
} as const;
/** Kalbi dinleme: başlık kalbin üstünde tutuldukça süre birikir; uzaklaşınca yavaşça geri gider. */
export const DINLEME_MS: Record<Yas, number> = { '2-3': 1600, '4': 2400, '5+': 3200 };
export const dinlemeAdimi = (birikim: number, uzaklik: number, dt: number, hedef: number): number =>
  (uzaklik <= GOGUS.duyma ? Math.min(hedef, birikim + dt) : Math.max(0, birikim - dt * 0.5));
/** Sıcak-soğuk: 0 (uzak) … 1 (kalbin üstü). Atışın sesi ve kalbin büyüklüğü buna bağlı. */
export const kalpYakinligi = (uzaklik: number): number => Math.max(0, Math.min(1, 1 - (uzaklik - GOGUS.duyma) / (GOGUS.menzil - GOGUS.duyma)));
/** Kalp atışı arası (ms): Zıpzıp korkuluyken hızlı, dinlendikçe sakinleşir. */
export const atisArasi = (dinlenen: number, hedef: number): number => 430 + 330 * Math.min(1, dinlenen / hedef);

// ————————————————————————————————————————————— kol: ıslak pamuk
export const PAMUK = {
  /** su kâsesi kol sahnesinde sağ üstte, tepsinin üstünde durur (çizimin 0,73'ü kadar; tepsi ve dikenler görünür kalır) */
  kase: { sol: 1560, ust: 24, g: 380, y: 278 } as Kutu,
  kaseAgzi: { x: 1750, y: 150, yaricap: 150 },
  /** pamuğun dinlendiği yer (kâsenin solu) ve eldeki boyu */
  yer: { x: 1440, y: 170 } as Nokta, boy: 230,
  /** silinecek alan: kolun bileğe yakın bölümü */
  alan: { sol: 120, ust: 400, g: 1240, y: 290 } as Kutu,
  sutun: 12, satir: 3,
  /** bir daldırışla silinebilecek hücre sayısı: pamuk dolunca (çok kirli) silmez, kâsede çalkalanır */
  kapasite: 14,
} as const;
export const PAMUK_HEDEF: Record<Yas, number> = { '2-3': 0.5, '4': 0.7, '5+': 0.85 };
export function pamukHucre(p: Nokta): number {
  const a = PAMUK.alan, x = Math.floor(((p.x - a.sol) / a.g) * PAMUK.sutun), y = Math.floor(((p.y - a.ust) / a.y) * PAMUK.satir);
  return x < 0 || y < 0 || x >= PAMUK.sutun || y >= PAMUK.satir ? -1 : y * PAMUK.sutun + x;
}
export const pamukOrani = (silinen: ReadonlySet<number>): number => silinen.size / (PAMUK.sutun * PAMUK.satir);
/** Pamuğun kir karesi (0 temiz … 3 çok kirli): o daldırıştan beri sildiği hücre sayısına göre. */
export const pamukKiri = (sildigi: number): 0 | 1 | 2 | 3 => (sildigi >= PAMUK.kapasite ? 3 : sildigi >= PAMUK.kapasite * 0.55 ? 2 : sildigi >= 2 ? 1 : 0);
export const kasede = (p: Nokta): boolean => Math.hypot(p.x - PAMUK.kaseAgzi.x, p.y - PAMUK.kaseAgzi.y) <= PAMUK.kaseAgzi.yaricap;

// ————————————————————————————————————————————— kol: kat kat sargı
/** Sargının görünen karesi: −1 hiç yok, 0…4 `sargi-kat-N`. Tur ilerledikçe kat artar. */
export const sargiKati = (oran: number): number => (oran <= 0.02 ? -1 : Math.min(4, Math.floor(oran * 5)));
/** Rulonun karesi (0 tam … 3 ince). */
export const ruloKaresi = (oran: number): number => Math.min(3, Math.floor(Math.max(0, oran) * 4));

// ————————————————————————————————————————————— ödül: çıkartma defteri
/** Defterin bir yerleşimi: yatay fon (16:9) ya da dik fon (4:3). Bütün yerler sahne pikseli. */
export interface DefterDuzeni {
  fon: string; fonKutu: Kutu;
  yuvalar: readonly Nokta[]; yuvaCapi: number;
  portre: Nokta; portreBoyu: number;
  tabaka: readonly Nokta[]; hucre: number;
  damgaYeri: Nokta; damgaHedefi: Nokta; damgaBoyu: number;
  /** damganın iz bırakabildiği alan (sol sayfa) ve izin boyu */
  damgaAlani: Kutu; izBoyu: number;
  kitap: Kutu; guvenliEn: number;
  oturma: number; soyma: number;
}
export const DEFTER: DefterDuzeni = {
  fon: A1.defterFon, fonKutu: { sol: 0, ust: 0, g: 2048, y: 1152 },
  damgaAlani: { sol: 180, ust: 160, g: 820, y: 840 }, izBoyu: 210,
  // Yerler `defter-fon` çiziminden ölçüldü (23 Kasım): yuvaların kesik çizgili daireleri 209 px, portre dairesi 404 px;
  // sağ sayfanın çerçevesi x 1062…1930, y 150…1027; damga yastığı x 1569…1887, y 702…1004.
  yuvalar: [{ x: 292, y: 826 }, { x: 538, y: 826 }, { x: 787, y: 826 }] as readonly Nokta[], yuvaCapi: 196,
  /** sol sayfada Zıpzıp'ın yuvarlak resmi (yarıçap 190); gülen portre (400 × 400) aynı merkeze oturur */
  // gülen portrenin dairesi tuvalin 380 px'i (400'de); fondaki 404 px'lik daireyi konturuyla örtmesi için 432 px gösterilir
  portre: { x: 526, y: 441 } as Nokta, portreBoyu: 432,
  /** çıkartma tabakası: 4 × 2 */
  tabaka: [1196, 1396, 1596, 1796].flatMap(x => [300, 510].map(y => ({ x, y }))).sort((a, b) => a.y - b.y || a.x - b.x) as readonly Nokta[], hucre: 190,
  damgaYeri: { x: 1728, y: 880 } as Nokta,
  /** damganın basılacağı yer: sol sayfada Zıpzıp'ın resminin sağ altı */
  damgaHedefi: { x: 850, y: 500 } as Nokta, damgaBoyu: 360,
  /** kitabın fondaki kutusu (kırmızı kapağın dışı; çizimden ölçüldü) ve içeriğin sığması gereken en az genişlik */
  kitap: { sol: 40, ust: 73, g: 1968, y: 1024 } as Kutu, guvenliEn: 1820,
  /** çıkartmanın yuvaya oturması için gereken yakınlık */
  oturma: 120,
  /** soyulma: çıkartma yerinden bu kadar çekilince tamamen kalkar */
  soyma: 110,
};
/**
 * Dik yerleşim (iPad, 4:3): `defter-fon-dik` 2048 × 1536; sahnenin 192 px üstünden başlar, 192 px altında biter.
 * Yerler çizimden ölçüldü (23 Kasım 08:15) ve sahneye çevrildi (y − 192): kitap x 38…2008, y 95…1462; portre dairesi
 * merkez (525, 560), çap 532; yuvalar çap 274, merkezler (250 | 538 | 826, 1160); yastık x 1508…1891, y 967…1331;
 * sağ sayfanın çerçevesi x 1065…1925, y 201…1368.
 */
const DIK = 192;
export const DEFTER_DIK: DefterDuzeni = {
  fon: A1_EK.defterFonDik, fonKutu: { sol: 0, ust: -DIK, g: 2048, y: 1536 },
  yuvalar: [{ x: 250, y: 1160 - DIK }, { x: 538, y: 1160 - DIK }, { x: 826, y: 1160 - DIK }], yuvaCapi: 284,
  portre: { x: 525, y: 560 - DIK }, portreBoyu: 569,
  tabaka: [370, 620].flatMap(y => [1183, 1391, 1599, 1807].map(x => ({ x, y: y - DIK }))), hucre: 204,
  damgaYeri: { x: 1700, y: 1181 - DIK }, damgaHedefi: { x: 840, y: 830 - DIK }, damgaBoyu: 434,
  damgaAlani: { sol: 100, ust: 215 - DIK, g: 870, y: 1140 }, izBoyu: 240,
  kitap: { sol: 38, ust: 95 - DIK, g: 1970, y: 1367 }, guvenliEn: 1850,
  oturma: 150, soyma: 110,
};
/** Ekrana (sahne pikseli) hangi yerleşim uyar: kitabı sığdırınca ekranın daha çoğunu kaplayan; dik fon yoksa yatay. */
export function defterDuzeni(ekranG: number, ekranY: number, dikVar: boolean): DefterDuzeni {
  if (!dikVar || !(ekranG > 0) || !(ekranY > 0)) return DEFTER;
  const kaplama = (d: DefterDuzeni) => { const k = Math.min(ekranG / d.kitap.g, ekranY / d.kitap.y); return k * k * d.kitap.g * d.kitap.y; };
  return kaplama(DEFTER_DIK) > kaplama(DEFTER) ? DEFTER_DIK : DEFTER;
}
/** Yaşa göre yapıştırılacak çıkartma sayısı. */
export const CIKARTMA_SAYISI: Record<Yas, number> = { '2-3': 1, '4': 2, '5+': 3 };
/** Soyulma karesi (−1: yerinde, 0…2): çıkartma tabakadaki yerinden ne kadar çekildiyse. */
export const soyulmaKaresi = (cekis: number): number => (cekis < 12 ? -1 : cekis >= DEFTER.soyma ? 2 : cekis >= DEFTER.soyma * 0.5 ? 1 : 0);
/** Bırakılan çıkartmanın oturacağı boş yuva; yoksa −1. */
export function yuvaBul(p: Nokta, dolu: readonly boolean[], d: DefterDuzeni = DEFTER): number {
  let en = -1, enUzak: number = d.oturma;
  d.yuvalar.forEach((y, i) => { const u = Math.hypot(p.x - y.x, p.y - y.y); if (!dolu[i] && u <= enUzak) { en = i; enUzak = u; } });
  return en;
}
/** Damga: hedefe yeterince yakın bastırılırsa iz kalır. */
export const damgaOturur = (p: Nokta, d: DefterDuzeni = DEFTER): boolean => p.x > d.damgaAlani.sol && p.x < d.damgaAlani.sol + d.damgaAlani.g && p.y > d.damgaAlani.ust && p.y < d.damgaAlani.ust + d.damgaAlani.y;
export const DAMGA_BASMA_MS = 220;

// ————————————————————————————————————————————— giriş: topallayarak gelir, sedyeye zıplar
export const GIRIS = {
  /** Zıpzıp'ın tuvalinin (1000 × 940) sol kenarı: ekranın solundan girer, sedyenin önünde durur, üç zıplayışla çıkar */
  baslangic: -760, durak: -140, zipSayisi: 3,
  /** yürüme hızı (px/ms) ve kare hızı */
  hiz: 0.26, kareMs: 110,
} as const;
/** n. zıplayıştan sonra Zıpzıp'ın tuvalinin sol kenarı (son zıplayışta sedyedeki yerine varır). */
export const zipDuragi = (n: number, sedyeSol: number): number => Math.round(GIRIS.durak + ((sedyeSol - GIRIS.durak) * Math.min(GIRIS.zipSayisi, n)) / GIRIS.zipSayisi);

// ————————————————————————————————————————————— kare dizileri
/** Döngüdeki kare: t ms, kare başına `kareMs`. */
export const dongudekiKare = (t: number, adet: number, kareMs: number): number => (adet <= 0 ? 0 : Math.floor(Math.max(0, t) / kareMs) % adet);
/** Baştan sona bir kez oynayan dizide kare (son karede kalır). */
export const dizidekiKare = (t: number, adet: number, kareMs: number): number => Math.min(adet - 1, Math.floor(Math.max(0, t) / kareMs));
/** Sahne içinde mi (taşma payı dışında). */
export const sahnede = (p: Nokta): boolean => p.x >= 0 && p.y >= 0 && p.x <= SAHNE.g && p.y <= SAHNE.y;

// ————————————————————————————————————————————— tepki pozları (çizimleri gelince Y1 pozlarının arasına girer)
/** Yakın plandaki yüz: Y1'in dört ifadesi temeldir; A1'in altı yüzü ayrıntıyı verir. */
export interface YuzAyrinti { asama: Asama; /** cımbız dikeni tutuyor */ kilitli: boolean; /** büyüteç elde */ buyutecElde: boolean; an: number; /** diken çıktıktan sonra "oh" süresi (ms) */ ohKalan: number; /** mikrop "pof" olduktan sonra kahkaha süresi (ms) */ pofKalan: number; /** sırası gelmemiş aletin şakasından sonra gülme süresi (ms) */ sakaKalan?: number; }
export function yuzKaresi(temel: Yuz, d: YuzAyrinti): string {
  if (temel === 'ayy') return d.kilitli ? A1.yuz.gozkisik : SECMELI.yuz.ayy;            // çekilirken dişini sıkar; çıktığı an "ay!"
  if ((d.sakaKalan ?? 0) > 0) return A1.yuz.gulme;                                       // sırası gelmemiş alet şaka yaptı: Zıpzıp güler
  if (temel === 'kikir') return d.pofKalan > 0 ? A1.yuz.gulme : SECMELI.yuz.kikir;
  if (d.ohKalan > 0) return A1.yuz.oh;                                                   // diken çıktı: rahat bir nefes
  if (temel === 'rahat') return d.asama === 'bant' || d.asama === 'defter' ? A1.yuz.utangac : SECMELI.yuz.rahat;
  if (d.an % 3200 < 140) return A1.yuz.kirp;                                             // endişeliyken de göz kırpar
  return d.buyutecElde ? A1.yuz.merak : SECMELI.yuz.endise;
}
/** Yakın plandaki Kino: izlerken eğilip bakar (göz kırpar), sevinince başparmak; büyük sevinçte coşkuyla alkışlar. */
export function kinoYakinKaresi(poz: KinoPozu, an: number, buyukSevinc: boolean, ups = false): string {
  if (poz === 'sasir') return ups ? A1.kinoMasa.ups : SECMELI.kino.sasir;              // sırası gelmemiş alet: "ups" (kızgın değil, komik)
  if (poz === 'sevin') return buyukSevinc ? A1.kinoYakin.alkisHizli : A1.kinoYakin.basparmak;
  return an % 3000 < 140 ? A1.kinoYakin.bak[1] : A1.kinoYakin.bak[0];
}
/** Masadaki Kino. */
export interface KinoMasaDurumu { asama: Asama; an: number; /** aşamanın başından beri (ms) */ t: number; sasirdi: boolean; ups: boolean; kahkaha: boolean; karsiliyor: boolean; /** çocuk bir süredir dokunmadı */ bos: boolean; }
export function kinoMasaKaresi(d: KinoMasaDurumu): string {
  if (d.asama === 'kutlama' || d.asama === 'son') return A1.kinoMasa.yasasin[Math.floor(d.t / 150) % 2];
  if (d.ups) return A1.kinoMasa.ups;
  if (d.kahkaha) return A1.kinoMasa.kahkaha;
  if (d.karsiliyor) return A1.kinoMasa.karsila[Math.floor(d.an / 220) % 2];
  if (d.sasirdi) return SECMELI.kino.sasir;
  if (d.an % 3400 < 140) return A1.kinoMasa.kirp;
  return d.bos ? A1.kinoMasa.dusun : SECMELI.kino.goster;
}
/** Masada bekleyen Zıpzıp'ın araya giren kareleri: arada patisine bakar; çocuk bir süredir dokunmadıysa iç çeker. */
export function bekleEki(an: number, bos: boolean): string | null {
  const f = an % 5200;
  if (f < 900) return A1.bekle[0];
  return bos && f >= 2600 && f < 3700 ? A1.bekle[1] : null;
}
/** Kutlamada Kino: dans kareleri (dört dans karesinde bir değişir) */
export const kinoDansKaresi = (gecen: number): string => A1.kinoDans[Math.floor(Math.max(0, gecen) / 440) % 2];
/** Mikrobun karesi: köpüğe gömülmüşse o hâli, büyüteçten kaçıyorsa korkmuş hâli, yoksa kıpırdama döngüsü. */
export function mikropKaresi(i: number, d: { an: number; kaciyor: boolean; kopukte: boolean }): string {
  const k = A1.mikrop[i];
  return d.kopukte ? k.kopukte : d.kaciyor ? k.kork : k.kipir[dongudekiKare(d.an + i * 90, k.kipir.length, 120)];
}
/** Köpürme kareleri (420 × 320): öbek her yanı yuvarlaktır, merkezi tuvalde (210, 180); sahnede 0,6 ölçekte durur. */
export const KOPURME = { merkez: { x: 210, y: 180 } as Nokta, olcek: 0.6 } as const;
/** Diken çekilirken gösterilecek gerilme karesi (0…2): çekiş eşiğe yaklaştıkça tüy daha çok kalkar. */
export const gerginKaresi = (cekis: number, esik: number): 0 | 1 | 2 => (cekis < esik * 0.4 ? 0 : cekis < esik * 0.75 ? 1 : 2);
/** Gerilme karelerinde dikenin boyu (tuval pikseli; Y1 dikeni 200): battığı yer (40, 100), ucu x = 240, 255, 270. */
export const GERGIN_BOY = [200, 215, 230] as const;
/** Dikenin battığı yer (gerilme ve kopma karelerinin tuvalinde) ve "pıt" karelerinin süresi. */
export const DIKEN_KOKU: Nokta = { x: 40, y: 100 };
export const KOPMA_KARE_MS = 70;
/** Bir kare dizisini bir kez oynatmak için i. karenin saydamlık anahtarları (adet kare, eşit süre). */
export const kareAnahtarlari = (i: number, adet: number): { opacity: number; offset: number }[] => [
  { opacity: 0, offset: 0 }, { opacity: 0, offset: i / adet }, { opacity: 1, offset: i / adet }, { opacity: 1, offset: (i + 1) / adet }, { opacity: 0, offset: (i + 1) / adet }, { opacity: 0, offset: 1 },
];
/** Kayan yıldız çiziminde (400 × 200) yıldızın merkezi ve sahnedeki ölçeği (yıldız 160 px çizilir, sahnede 120 px durur); kuyruk solda. */
// (Gelen çizimden ölçüldü, 23 Kasım: yıldızın merkezi (325, 97), yıldız beyaz kenarıyla ~112 px.)
export const YILDIZ_KUYRUK = { merkez: { x: 325, y: 97 } as Nokta, olcek: 1.07 } as const;
/** Bant yapışınca kırışıktır; üstünden parmakla geçilince düzelir (yaşa göre vuruş sayısı). */
export const BANT_DUZLEME: Record<Yas, number> = { '2-3': 1, '4': 2, '5+': 3 };

// ————————————————————————————————————————————— masa ve sesler
/** masadaki lavabonun ortası (hub-fon'da ölçüldü): lavabo düğmesi buraya gelir */
export const HUB_LAVABO: Nokta = { x: 1796, y: 216 };
/** Yeni replikler (Kino ve Zıpzıp'ın sesi; assets/doktor/vaka/ses/<ad>.mp3). Emir yok: duygu, davet ve tepki. */
export const A1_SOZLER = {
  'z-topal': 'Ay, ay, ay! Patim!',
  'k-eller': 'Önce ellerimiz tertemiz olsun!',
  'k-kopuk': 'Köpük köpük, ovuştur ovuştur!',
  'k-tertemiz': 'Mis gibi oldu!',
  'k-kalp': 'Bakalım kalbi ne diyor?',
  'z-soguk': 'Hi hi! Soğukmuş!',
  'z-kalp': 'Kalbim güm güm atıyor!',
  'z-pamuk': 'Oh, serin serin!',
  'k-defter': 'Çıkartma zamanı!',
  'z-cikartma': 'Bana mı? Yaşasın!',
} as const;
/** Yeni efektler: lavabo (l-), göğüs (g-), pamuk (p-), defter (d-). */
export const A1_EFEKTLER = ['l-su-ac', 'l-su', 'l-sabun', 'l-ov', 'l-damla', 'l-havlu', 'l-parla', 'g-gum', 'p-sip', 'p-sil', 'd-cirt', 'd-damga'] as const;

/** Kino'nun başlığın peşinden kayması: başlık manşetten ne kadar uzaksa o kadar, sınırlar içinde. */
export function kinoUzanmasi(baslik: Nokta): Nokta {
  const u = GOGUS.uzanma;
  return { x: Math.max(u.sol, Math.min(u.sag, baslik.x - GOGUS.manset.x)), y: Math.max(u.yukari, Math.min(u.asagi, baslik.y - GOGUS.manset.y)) };
}

/**
 * Defterin kadrajı: kitap, merkezi çevresinde bu kadar büyütülür (ekran ölçüleri sahne pikseli).
 * Kitap bütünüyle sığıp ekranın boyunu dolduruyorsa (telefon, 16:9) kenara kadar büyür. Daha dik ekranda (iPad) kitabın
 * kırmızı kapağı yanlardan taşacak kadar büyütülür: sayfalar ekranı doldurur, içerik (yuvalar, tabaka, damga) ekranda kalır.
 */
export function defterKadraji(ekranG: number, ekranY: number, d: DefterDuzeni = DEFTER): number {
  const k = d.kitap;
  if (!(ekranG > 0) || !(ekranY > 0)) return 1;
  const tam = Math.min(ekranG / k.g, ekranY / k.y);
  if (k.y * tam >= ekranY * 0.9) return tam;
  return Math.max(tam, Math.min(ekranY / k.y, ekranG / d.guvenliEn));
}
