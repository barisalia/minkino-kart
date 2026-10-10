/**
 * Kino'nun Otobüsü: TEK GÖRSEL HARİTASI. Anahtarlar ekip/gemini/IS-LISTESI-YENI.md'deki dosya adlarıyla birebir aynı
 * (bölüm A ve D: `kino-otobus/<ad>.webp`).
 *
 * Gemini çizimi gelince: Adobe temizler, dosya `assets/kino-otobus/<ad>.webp` (ya da .png) olarak konur. Kod değişmez:
 * Vite derlemede klasörü tarar, dosya varsa o kullanılır (`-1`, `-2` sürüm eki: en büyüğü), yoksa yedeği:
 * - 'yeniden': başka oyunun var olan görseli (jeton, kumbara, flama, manzara),
 * - 'kod': cizim.ts'deki sade yer tutucu kod çizimi (mağazaya çıkmaz).
 *
 * Yerleşim: yeni görsel tuvalde başka yerdeyse yalnız aşağıdaki YERLESIM / OTOBUS_YERI / DOLAP_GOZLERI tablosundaki
 * tek satır değişir.
 */
import {
  ampulSvg,
  catiKulahSvg,
  gofretSvg,
  hamurSurahiSvg,
  jantSvg,
  kalpSekerSvg,
  kaseSvg,
  kemikTabelaSvg,
  kepceSvg,
  kirazSvg,
  kulahHamuruSvg,
  kulahMakinesiKapakSvg,
  kulahMakinesiSvg,
  kulahSvg,
  kupaSvg,
  mumSvg,
  otobusSvg,
  serpintiKavanozSvg,
  serpintiUstSvg,
  semsiyeSvg,
  sosSiseSvg,
  sosUstSvg,
  tatKabiSvg,
  topSvg,
} from './cizim';
import { SOSLAR, TATLAR, type Kap, type Sos, type Sus, type Tat } from './model';

const DOSYALAR = import.meta.glob<string>('../../assets/kino-otobus/*.{webp,png}', { eager: true, query: '?url', import: 'default' });
/** başka oyunlardan yeniden kullanılanlar (IS-LISTESI-YENI.md → "Yeniden kullanılanlar") */
const YENIDEN = import.meta.glob<string>(
  ['../../assets/pasta/jeton-1.webp', '../../assets/pasta/kumbara-kavanoz-1.webp', '../../assets/parti/flama.webp', '../../assets/film/park/*.webp', '../../assets/film/plaj/*.webp'],
  { eager: true, query: '?url', import: 'default' },
);

/** Dosya yollarından ad → en yüksek sürümün adresi ("ad-3.webp" > "ad-1.webp" > "ad.webp"; webp, png'den önce) */
export function surumTablosu(dosyalar: Record<string, string>): Map<string, string> {
  const en = new Map<string, { n: number; url: string }>();
  for (const [yol, url] of Object.entries(dosyalar)) {
    const m = /([^/\\]+?)(?:-(\d+))?\.(webp|png)$/.exec(yol);
    if (!m) continue;
    const ad = m[1];
    const n = (m[2] ? Number(m[2]) : 0) * 2 + (m[3] === 'webp' ? 1 : 0);
    const eski = en.get(ad);
    if (!eski || n > eski.n) en.set(ad, { n, url });
  }
  return new Map([...en].map(([ad, v]) => [ad, v.url]));
}
const TABLO = surumTablosu(DOSYALAR);
const yeniden = (yol: string) => YENIDEN[`../../assets/${yol}.webp`] ?? null;

type Yedek = { tur: 'kod'; svg: () => string } | { tur: 'yeniden'; yol: string } | { tur: 'yok' };
const kod = (svg: () => string): Yedek => ({ tur: 'kod', svg });
const yen = (yol: string): Yedek => ({ tur: 'yeniden', yol });
const YOK: Yedek = { tur: 'yok' };

/** Bütün görsel yuvaları: IS-LISTESI-YENI.md adı → yedek */
export const VARLIK = {
  // ---- A · Gün 1
  otobus: kod(otobusSvg),
  'ic-arka': YOK, // pencere çerçevesi (gri maske şeffaf, 9 dilim: IC_ARKA_CERCEVE); yoksa CSS çerçeve
  'tezgah-on': YOK, // CSS ile çizilen buz mavisi tezgâh yüzü (.ko-tezgah-on)
  dolap: YOK, // CSS ile çizilen dolap (.ko-dolap)
  'kap-cilek': kod(() => tatKabiSvg('cilek')),
  'kap-vanilya': kod(() => tatKabiSvg('vanilya')),
  'kap-cikolata': kod(() => tatKabiSvg('cikolata')),
  'top-cilek': kod(() => topSvg('cilek')),
  'top-vanilya': kod(() => topSvg('vanilya')),
  'top-cikolata': kod(() => topSvg('cikolata')),
  kulah: kod(kulahSvg),
  kase: kod(kaseSvg),
  'sos-cikolata-sise': kod(() => sosSiseSvg('cikolata')),
  'sos-cikolata-ust': kod(() => sosUstSvg('cikolata')),
  kepce: kod(kepceSvg),
  'kino-onluk': YOK, // Kino iskeletine kod çizimi (cizim.ts → KINO_ONLUK)
  'kino-sapka': YOK, // Kino iskeletine kod çizimi (cizim.ts → KINO_SAPKA)
  'sus-kemik-tabela': kod(kemikTabelaSvg),
  'sus-flama': yen('parti/flama'),
  kapak: YOK, // menü kartının zemini (uygulama/src/oyunlar.ts → KINO_OTOBUS_KARTI.zemin) ve ilk açılış (yaş seçimi) perdesi
  // ---- D · Gün 2-3 ve süsler
  'kap-limon': kod(() => tatKabiSvg('limon')),
  'kap-fistik': kod(() => tatKabiSvg('fistik')),
  'kap-yabanmersini': kod(() => tatKabiSvg('yabanmersini')),
  'top-limon': kod(() => topSvg('limon')),
  'top-fistik': kod(() => topSvg('fistik')),
  'top-yabanmersini': kod(() => topSvg('yabanmersini')),
  'sos-cilek-sise': kod(() => sosSiseSvg('cilek')),
  'sos-cilek-ust': kod(() => sosUstSvg('cilek')),
  'sos-karamel-sise': kod(() => sosSiseSvg('karamel')),
  'sos-karamel-ust': kod(() => sosUstSvg('karamel')),
  'serpinti-kavanoz': kod(serpintiKavanozSvg),
  'serpinti-ust': kod(serpintiUstSvg),
  kiraz: kod(kirazSvg), // meyveler/kiraz çift kiraz: saymada karışır, kullanılmaz
  gofret: kod(gofretSvg),
  semsiye: kod(semsiyeSvg),
  'kalp-seker': kod(kalpSekerSvg),
  kupa: kod(kupaSvg),
  mum: kod(() => mumSvg(false)),
  'pencere-dogumgunu': YOK, // v2: çerçevesiz 16:9 bahçe partisi (gün içi pencere + tam ekran akşam); yoksa park manzarası + kodla balon ve flama (gun.ts → manzara)
  'sus-cati-kulah': kod(catiKulahSvg),
  'sus-ampul': kod(ampulSvg),
  'sus-jant': kod(jantSvg),
  'sus-kino-kiraz-sapka': YOK, // Kino'nun kafa grubuna (otobus.ts → KINO_YERI.kirazSapka); yoksa kod çizimi (cizim.ts → KINO_KIRAZ_SAPKA)
  // ---- Ek C · dükkânın içi, dokunsal hazırlık ve yan işler (Gemini; külah makinesi, kapağı, sürahi ve hamur hâlâ yer tutucu)
  'kara-tahta': YOK, // resimli menü (yazısız), duvarda; kutu görselin oranında (dukkan-ic.ts → DUVAR_ORAN)
  'kavanoz-rafi': YOK, // duvar rafı, üç kavanoz
  lamba: YOK, // sarkan lamba (Gemini'nin ışık konisi betikte silinir; parıltı CSS: .ko-duvar-lamba::after)
  'leke-cilek': YOK, // tezgâh lekeleri: üçü aynı biçim ve oran (CSS .ko-leke-g)
  'leke-cikolata': YOK,
  'leke-vanilya': YOK,
  sunger: YOK, // parmağın altındaki sünger (isler.ts → SUNGER_ORAN)
  sinek: YOK, // 5-6 yaş sinek (CSS .ko-sinek)
  'kulah-makinesi': kod(kulahMakinesiSvg),
  'kulah-makinesi-kapak': kod(kulahMakinesiKapakSvg),
  'hamur-surahi': kod(hamurSurahiSvg),
  'kulah-hamuru': kod(kulahHamuruSvg),
  // ---- yeniden kullanılanlar
  jeton: yen('pasta/jeton-1'),
  'kumbara-kavanoz': yen('pasta/kumbara-kavanoz-1'),
} as const satisfies Record<string, Yedek>;
export type VarlikAdi = keyof typeof VARLIK;

/** Görselin adresi: Gemini dosyası, yoksa yeniden kullanılan görsel; ikisi de yoksa null (kod çizimi / CSS) */
export function adres(ad: VarlikAdi, tablo: Map<string, string> = TABLO): string | null {
  const u = tablo.get(ad);
  if (u) return u;
  const y: Yedek = VARLIK[ad];
  return y.tur === 'yeniden' ? yeniden(y.yol) : null;
}
/** Gemini dosyası geldi mi (yer tutucu değil) */
export const geldiMi = (ad: VarlikAdi, tablo: Map<string, string> = TABLO) => tablo.has(ad);

/** <img> ya da yer tutucu kod çizimi (HTML). Görsel de yer tutucu da aynı kutuya oturur (CSS: .ko-g). */
export function gorsel(ad: VarlikAdi, sinif = ''): string {
  const u = adres(ad);
  if (u) return `<img class="ko-g ${sinif}" src="${u}" alt="" draggable="false" decoding="async" data-varlik="${ad}">`;
  const y: Yedek = VARLIK[ad];
  if (y.tur === 'kod') return `<span class="ko-g ko-g-kod ${sinif}" data-varlik="${ad}">${y.svg()}</span>`;
  return `<span class="ko-g ko-g-yok ${sinif}" data-varlik="${ad}"></span>`;
}

/** Hâlâ Gemini dosyası gelmemiş yuvalar (rapor ve geliştirici sayfası için) */
export const yerTutucular = (tablo: Map<string, string> = TABLO): VarlikAdi[] => (Object.keys(VARLIK) as VarlikAdi[]).filter((a) => !tablo.has(a) && !['jeton', 'kumbara-kavanoz'].includes(a));

// ---------------------------------------------------------------- adlar
export const topAdi = (t: Tat) => `top-${t}` as VarlikAdi;
export const tatKabiAdi = (t: Tat) => `kap-${t}` as VarlikAdi;
export const sosSiseAdi = (s: Sos) => `sos-${s}-sise` as VarlikAdi;
export const sosUstAdi = (s: Sos) => `sos-${s}-ust` as VarlikAdi;
export const kapAdi = (k: Kap) => k as VarlikAdi;
export const susAdi = (s: Sus): VarlikAdi => (s === 'serpinti' ? 'serpinti-ust' : s === 'kalp' ? 'kalp-seker' : s);
export const susRafAdi = (s: Sus): VarlikAdi => (s === 'serpinti' ? 'serpinti-kavanoz' : s === 'kalp' ? 'kalp-seker' : s);
// derlemede ad denetimi (yazım hatası olmasın)
TATLAR.forEach((t) => void VARLIK[topAdi(t) as 'top-cilek']);
SOSLAR.forEach((s) => void VARLIK[sosUstAdi(s) as 'sos-cilek-ust']);

/** Mekân (pencere manzarası) katmanları: assets/film/<park|plaj>/arka-uzak, arka-orta, arka-on */
export function manzaraAdres(mekan: 'park' | 'plaj', katman: 'arka-uzak' | 'arka-orta' | 'arka-on'): string {
  return yeniden(`film/${mekan}/${katman}`) ?? yeniden(`film/park/${katman}`) ?? '';
}

// ---------------------------------------------------------------- yerleşim (görsellerin içindeki yerler)
/**
 * Kule yerleşimi (topun eni = 1 birim). Kod çizimleri bu ölçülerle çizildi; Gemini görseli tuvalde başka yerdeyse
 * buradaki tek satır ayarlanır.
 * - kap.en / kap.boy: kabın kutusu; kap.agiz: topun oturduğu çizgi (kabın üstünden aşağı, kabın boyunun oranı)
 * - top.boy: topun kutusunun boyu (en 1), adim: üst üste iki top arası (topun boyunun oranı)
 */
export const YERLESIM = {
  // Gemini görsellerinde ölçüldü (ekip/illustrator/kino-otobus-isle.cjs): külah 664×1024 (ağız elipsinin ortası tepeden
  // %10), kâse 1024×982 (top ağız çizgisinin biraz altına, %20), top 1024×939 ortak tuval (tabandan hizalı)
  kap: {
    kulah: { en: 0.85, boy: 1.31, agiz: 0.054 },
    kase: { en: 1.2, boy: 1.151, agiz: 0.148 },
    kupa: { en: 1.5, boy: 1.5, agiz: 0.3 },
  } satisfies Record<Kap, { en: number; boy: number; agiz: number }>,
  // üstteki topun fırfırı alttakinin kubbesine (tepeden %36) oturur
  top: { boy: 0.917, adim: 0.64 },
};

/**
 * Otobüs süslerinin yeri (otobüs tuvalinin oranı: x, y merkez; en: tuval eninin oranı). A1 görselinde (1920×1080,
 * otobüs ortada; tavan çizgisi y≈0.30, çatıda Gemini'nin üç toplu külahı x 0.35-0.64) ölçüldü. Süsler çatı külahıyla
 * çakışmasın: kemik tabela ön tavanda, çatı külahı arka tavanda.
 */
export const OTOBUS_YERI = {
  tabela: { x: 0.69, y: 0.322, en: 0.12 },
  flama: { x: 0.4775, y: 0.405, en: 0.36 },
  kulah: { x: 0.255, y: 0.2, en: 0.12 },
  // ampul dizisi (D21, uçları görselin tepesinde, ortası sarkık): çatı külahı varsa külahın gövdesinden kolun kırmızı
  // topuna; yoksa çatının arka köşesinden kola (don: derece, eksi = sağ uç yukarı)
  ampul: { x: 0.482, y: 0.305, en: 0.49 },
  ampulKulahsiz: { x: 0.446, y: 0.358, en: 0.56, don: -3.3 },
  jant: [
    { x: 0.3183, y: 0.8372, en: 0.056 },
    { x: 0.6969, y: 0.8366, en: 0.056 },
  ],
  /** tekerlerin merkezi ve yarıçapı (r: tuval eninin oranı); girişte dönen teker katmanı bunlardan kesilir */
  teker: [
    { x: 0.3183, y: 0.8372, r: 0.0478 },
    { x: 0.6969, y: 0.8366, r: 0.0478 },
  ],
  /** açık kapağın (tente ve tezgâh) yeri: yan kapak paneli (altındaki tahta raf açıkta kalır) */
  kapak: { x: 0.4775, y: 0.518, en: 0.342, boy: 0.292 },
  /** tekerlerin yere değdiği çizgi (tuval boyunun oranı) */
  zemin: 0.925,
  /** Kino'nun basamakta durduğu yer (akşam) */
  basamak: { x: 0.8, y: 0.87 },
};

/**
 * Dolap v2 görselinde (A4, 2000×970: tek sıra 4 büyük göz, hafif yukarıdan) tat kaplarının yerleri. Oranlar dolap
 * görselinin kutusuna göre (kutu görselin en-boy oranında, gerilmez; x enin, y boyun oranı, tepeden).
 * Gözlerin koyu içi: x 0.101-0.275 / 0.313-0.477 / 0.517-0.683 / 0.724-0.898, y 0.307-0.579.
 * - Gün 1 (3 tat): kaplar ilk üç göze oturur; dördüncü gözde Kino'nun kepçesi durur.
 * - 6 tatlı günler: dört kap gözlerde (Gün 1 ile aynı boy), kalan iki kap dolabın önünde tezgâhta (aynı boy; yakın
 *   olduğu için arkadakileri örtmez: önün tepesi gözlerin altında).
 * Dokunma kutuları kaptan büyüktür: gözde aralik × (tepeden göz altına), önde onEn × (göz altından dolabın altına);
 * 844×390'da dolap ≈ 172u boy, 355u en → göz kutusu ≈ 73u × 111u, ön kutu ≈ 135u × 73u (en az 72u).
 */
export const DOLAP_GOZLERI = {
  oran: 2000 / 970,
  /** gözlerin ortası (x) */
  goz: [0.188, 0.395, 0.6, 0.811],
  /** göz aralığı: göz dokunma kutusunun eni */
  aralik: 0.205,
  /** gözdeki kabın tabanı (tepeden; gözün koyu içinin dibi) */
  gozAlt: 0.575,
  /** göz dokunma kutusunun altı (tepeden); ön sıranın kutusu buradan başlar */
  sinir: 0.608,
  /** dolabın önündeki kaplar: x ortaları (1 ya da 2 kap), dokunma eni, kabın tabanı */
  on: [[0.5], [0.29, 0.71]],
  onEn: 0.38,
  onAlt: 0.995,
  /** kabın boyu (dolabın boyunun oranı; eni görselin en-boy oranından: 958 / 1024) */
  kapBoy: 0.396,
};

/** Dolapta n tat kabının dokunma kutusu ve içindeki kabın yeri (yüzde, dolap kutusuna göre) */
export function dolapYerleri(n: number): { sol: number; en: number; ust: number; boy: number; kapAlt: number; kapBoy: number }[] {
  const D = DOLAP_GOZLERI;
  const ust = -0.04;
  const gozde = Math.min(n, D.goz.length);
  const onde = Math.min(n - gozde, 2);
  const yer = (x: number, en: number, u: number, a: number, kapTaban: number) => ({
    sol: (x - en / 2) * 100,
    en: en * 100,
    ust: u * 100,
    boy: (a - u) * 100,
    kapAlt: ((a - kapTaban) / (a - u)) * 100,
    kapBoy: (D.kapBoy / (a - u)) * 100,
  });
  return [
    ...D.goz.slice(0, gozde).map((x) => yer(x, D.aralik, ust, D.sinir, D.gozAlt)),
    ...(onde ? D.on[onde - 1] : []).map((x) => yer(x, D.onEn, D.sinir, 1.03, D.onAlt)),
  ];
}

/**
 * İç duvar v2 (A2, geniş pencere): betik gri maskeyi şeffaf yapar, çerçevenin dış kenarından kırpar
 * (ekip/illustrator/kino-otobus-isle.cjs çıktısı, 3072×1018). Pencere kutusuna 9 dilim (CSS border-image) olarak
 * oturur: dilimler görsel px'i (sol/sag: çerçeve kalınlığı, ust: fırfırın alt ucu, alt: grinin altından pervazın altına;
 * cam: fırfırların arasında camın tepesi). olcek: görsel px başına tasarım birimi (--u); fırfır şeridi 844×390
 * telefonda pencerenin enine yaklaşık kendi oranında oturur (yan kalınlık ≈ 30u).
 */
export const IC_ARKA_CERCEVE = { en: 3072, boy: 1018, sol: 123, sag: 123, ust: 176, cam: 124, alt: 75, olcek: 0.244 };
