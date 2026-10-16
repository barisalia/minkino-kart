/**
 * Tıkır Tıkır Lokanta görselleri: TEK HARİTA. Gemini sayfaları ekip/illustrator/restoran/restoran-isle.cjs ile
 * kesilip `assets/restoran/<grup>/<ad>.webp` olur (grup: arka, istasyon, kisi/<kim>, yiyecek, alet, sus, efekt, ui).
 * Kod değişmez: Vite klasörü tarar, dosya varsa o kullanılır (`-2`, `-3` sürüm eki: en büyüğü), yoksa `null` ve
 * çağıran sade yer tutucuyu (CSS) çizer. Yer tutucular mağazaya çıkmaz (ORTAK_NOTLAR: KALAN İŞ).
 */
const DOSYALAR = import.meta.glob<string>('../../assets/restoran/**/*.{webp,png}', { eager: true, query: '?url', import: 'default' });

/** Göreli yol (grup/ad, uzantısız) → en yüksek sürümün adresi ("ad-3" > "ad-2" > "ad"; webp, png'den önce) */
export function surumTablosu(dosyalar: Record<string, string>): Map<string, string> {
  const en = new Map<string, { n: number; url: string }>();
  for (const [yol, url] of Object.entries(dosyalar)) {
    const m = /assets\/restoran\/(.+?)(?:-(\d+))?\.(webp|png)$/.exec(yol.replace(/\\/g, '/'));
    if (!m) continue;
    const ad = m[1];
    const n = (m[2] ? Number(m[2]) : 0) * 2 + (m[3] === 'webp' ? 1 : 0);
    const eski = en.get(ad);
    if (!eski || n > eski.n) en.set(ad, { n, url });
  }
  return new Map([...en].map(([ad, v]) => [ad, v.url]));
}
const TABLO = surumTablosu(DOSYALAR);

/** 'istasyon/tezgah' → adres ya da null (çizim henüz gelmedi) */
export const varlik = (yol: string): string | null => TABLO.get(yol) ?? null;
/** Yüklü bütün görsel yolları (test ve önizleme) */
export const varlikYollari = () => [...TABLO.keys()];

/** Başka oyunların var olan görselleri (yeniden kullanım; yeni çizim gelene kadar ya da kalıcı) */
const YENIDEN = import.meta.glob<string>(
  ['../../assets/kino-otobus/musteri/*.webp', '../../assets/pasta/jeton-1.webp', '../../assets/kino-otobus/kara-tahta.webp'],
  { eager: true, query: '?url', import: 'default' },
);
export const yeniden = (yol: string): string | null => YENIDEN[`../../assets/${yol}.webp`] ?? null;
