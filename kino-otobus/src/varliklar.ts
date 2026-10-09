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
  jantSvg,
  kalpSekerSvg,
  kaseSvg,
  kemikTabelaSvg,
  kepceSvg,
  kirazSvg,
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
  'ic-arka': YOK, // CSS ile çizilen krem fayans duvar (kino-otobus.css → .ko-duvar)
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
  kapak: YOK, // menü kartı (gelince uygulama/src/oyunlar.ts → KINO_OTOBUS_KARTI.zemin)
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
  'pencere-dogumgunu': YOK, // park manzarası + kodla balon ve flama (gun.ts → manzara)
  'sus-cati-kulah': kod(catiKulahSvg),
  'sus-ampul': kod(ampulSvg),
  'sus-jant': kod(jantSvg),
  'sus-kino-kiraz-sapka': YOK, // Kino iskeletine kod çizimi (cizim.ts → KINO_KIRAZ_SAPKA)
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
  kap: {
    kulah: { en: 1.0, boy: 1.0, agiz: 0.17 },
    kase: { en: 1.25, boy: 1.25, agiz: 0.36 },
    kupa: { en: 1.5, boy: 1.5, agiz: 0.3 },
  } satisfies Record<Kap, { en: number; boy: number; agiz: number }>,
  top: { boy: 0.75, adim: 0.62 },
};

/**
 * Otobüs süslerinin yeri (otobüs tuvalinin oranı: x, y merkez; en: tuval eninin oranı). Kod otobüsünün yerleri; A1
 * görseli gelince bu tablo görselde ölçülür.
 */
export const OTOBUS_YERI = {
  tabela: { x: 0.48, y: 0.275, en: 0.2 },
  flama: { x: 0.47, y: 0.37, en: 0.42 },
  kulah: { x: 0.5, y: 0.16, en: 0.13 },
  ampul: { x: 0.5, y: 0.35, en: 0.62 },
  jant: [
    { x: 0.294, y: 0.811, en: 0.075 },
    { x: 0.719, y: 0.811, en: 0.075 },
  ],
  teker: [
    { x: 0.294, y: 0.811 },
    { x: 0.719, y: 0.811 },
  ],
  /** açık kapağın (tente ve tezgâh) yeri */
  kapak: { x: 0.469, y: 0.494, en: 0.4, boy: 0.211 },
  /** Kino'nun basamakta durduğu yer (akşam) */
  basamak: { x: 0.8, y: 0.87 },
};
