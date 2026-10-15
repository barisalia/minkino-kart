/**
 * Pati Dükkânı: TEK GÖRSEL HARİTASI. Dosya adları ekip/OYUN-GELISTIRME-3GUN.md §2-3 ile aynı.
 *
 * Gemini çizimi gelince (ekip/illustrator/pati/pati-isle.cjs keser) dosya `assets/pati/<ad>.webp` olur; kod değişmez:
 * Vite derlemede klasörü tarar, dosya varsa o kullanılır, yoksa sıradaki yedek:
 * - hayvan pozu: `<hayvan>-<poz>.webp` → aynı hâlin yakın pozu → hayvanın modeli / kadro kesimi (geçici)
 * - eşya: `esya-<ad>.webp` (G4) → salonun içinden kesilmiş aynı stildeki `gecici-<ad>.webp`
 * Kodla çizilmiş eşya yok.
 */
import gozYamaJson from '../../assets/pati/goz-yama.json';
import gecici from '../../assets/pati/gecici-yer.json';
import type { EsyaAdi, HayvanAdi } from './ihtiyac';

const DOSYALAR = import.meta.glob<string>('../../assets/pati/*.webp', { eager: true, query: '?url', import: 'default' });
const YENIDEN = import.meta.glob<string>('../../assets/kino-otobus/kase.webp', { eager: true, query: '?url', import: 'default' });

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

// ---------------------------------------------------------------- hayvan pozları
/** Hayvanın hâlleri; her biri bir poz ister. Yoksa aynı satırdaki yedek pozlar, en sonda model. */
export type Poz = 'bos' | 'ac' | 'oyun' | 'usudu' | 'yiyor' | 'uyku' | 'sevinc' | 'top' | 'atla' | 'rahat' | 'uykulu' | 'yuz2';
const POZ_YEDEK: Record<Poz, Poz[]> = {
  bos: [],
  ac: [],
  oyun: [],
  usudu: [],
  yiyor: ['ac'],
  uyku: ['rahat', 'uykulu'],
  sevinc: ['atla'],
  top: [],
  atla: ['sevinc', 'oyun'],
  rahat: ['uyku'],
  uykulu: ['uyku'],
  yuz2: [],
};
/** Poz sayfası gelmeden kullanılan tek resim (kadro kesimi / model) */
const MODEL: Record<HayvanAdi, string[]> = {
  findik: ['findik-model', 'kadro-a-findik'],
  tarcin: ['tarcin-model', 'kadro-a-tarcin'],
  piril: ['piril-model', 'kadro-b-piril'],
};
/** Balığın "boş" pozu yüzme karesi */
const ANA: Record<HayvanAdi, string> = { findik: 'bos', tarcin: 'bos', piril: 'yuz1' };

/** Pozun adresi ve gerçek poz mu (false: modele düştü; kod beden hareketiyle anlatır) */
export function pozAdresi(h: HayvanAdi, p: Poz): { url: string; gercek: boolean } {
  const ad = p === 'bos' ? ANA[h] : p;
  for (const x of [ad, ...POZ_YEDEK[p]]) {
    const u = adres(`${h}-${x}`);
    if (u) return { url: u, gercek: true };
  }
  const ana = adres(`${h}-${ANA[h]}`);
  return { url: ana ?? adres(...MODEL[h])!, gercek: false };
}
/** Hayvanın tüm poz adresleri (önden yükleme) */
export function hayvanAdresleri(h: HayvanAdi): string[] {
  return [...new Set((Object.keys(POZ_YEDEK) as Poz[]).map((p) => pozAdresi(h, p).url))];
}

/** Göz kırpma yaması: resmin adresi ve ana pozun oranı olarak kutusu (yoksa null: göz kırpma yok) */
export function gozYamasi(h: HayvanAdi): { url: string; x: number; y: number; w: number; h: number } | null {
  const k = (gozYamaJson as Record<string, { x: number; y: number; w: number; h: number }>)[h];
  const u = adres(`${h}-goz-yama`);
  return k && u && varMi(`${h}-${ANA[h]}`) ? { url: u, ...k } : null;
}

// ---------------------------------------------------------------- eşyalar
const ESYA: Record<EsyaAdi, string[]> = {
  mama: ['esya-mama-torbasi', 'gecici-mama-torbasi'],
  top: ['esya-top', 'gecici-top'],
  kus: ['esya-tuy-degnek', 'gecici-kus'],
  minder: ['esya-battaniye', 'gecici-minder'],
  yem: ['esya-yem-kutusu'],
};
export function esyaAdresi(e: EsyaAdi): string {
  return adres(...ESYA[e]) ?? (e === 'yem' ? YENIDEN['../../assets/kino-otobus/kase.webp'] : null) ?? adres('gecici-mama-torbasi')!;
}
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
