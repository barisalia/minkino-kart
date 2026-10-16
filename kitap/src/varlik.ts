/**
 * Kitap resimleri: ekip/illustrator/kitap-isle.cjs'in çıktısı (assets/kitap/<id>/*.webp + yerlesim.json).
 * Dosya yoksa o sayfa / katman sade yer tutucuyla durur; gelen dosya derlemede kendiliğinden yerine geçer.
 */
import type { Kutu } from './tipler';

export interface YerlesimParca {
  /** Parça tuvalinin yeri, katmanın kutusuna göre oran (0..1) */
  kutu: Kutu;
  kareler: string[];
}
export interface YerlesimKatman {
  /** Poz tuvalinin sayfa resmindeki yeri (oran); yerSabit katmanlarda yok */
  kutu?: Kutu;
  pozlar: string[];
  parcalar?: Record<string, YerlesimParca>;
}
export interface YerlesimSayfa {
  /** Hareketli karakterleri silinmiş sahne */
  zemin?: string;
  /** Zemin gelmeden yalnız tam sayfa geldiyse: canlanmayan tam resim */
  tam?: string;
  katmanlar?: Record<string, YerlesimKatman>;
  /** Sayfa resminin piksel boyu [en, boy] (kitap-isle.cjs yazar) */
  boy?: [number, number];
  /** Uğur böceğinin elle ayarlanmış yeri (resim gelince) */
  ugur?: [number, number];
}
export interface Yerlesim {
  sayfalar: Record<string, YerlesimSayfa>;
  /** ortak-ugur kareleri */
  ugur?: string[];
}

const okulDosyalar = import.meta.glob('../../assets/kitap/okul/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const okulYerlesim = import.meta.glob('../../assets/kitap/okul/yerlesim.json', { eager: true, import: 'default' }) as Record<string, Yerlesim>;

function dosyaHaritasi(g: Record<string, string>): Map<string, string> {
  const m = new Map<string, string>();
  for (const [yol, url] of Object.entries(g)) m.set(yol.split('/').pop()!, url);
  return m;
}

export interface KitapVarliklari {
  yerlesim: Yerlesim;
  /** dosya adı → derlenmiş adres; yoksa null */
  url(ad: string | undefined): string | null;
}

const BOS: Yerlesim = { sayfalar: {} };

export function kitapVarliklari(id: string): KitapVarliklari {
  if (id !== 'okul') return { yerlesim: BOS, url: () => null };
  const harita = dosyaHaritasi(okulDosyalar);
  const yerlesim = Object.values(okulYerlesim)[0] ?? BOS;
  return { yerlesim, url: (ad) => (ad ? harita.get(ad) ?? null : null) };
}

/** Sayfa anahtarı: 0 = kapak, 1..14 = s01..s14 */
export const sayfaAnahtari = (no: number) => (no === 0 ? 'kapak' : `s${String(no).padStart(2, '0')}`);
