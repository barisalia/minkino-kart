/**
 * Okula Hazırım! altyapısı: bölgeler ve etkinlik kaydı. Ünite 2 (Sayı Bahçesi) burada kayıtlı; Ünite 1 (Ses Kulesi) ve
 * Ünite 3 (Kelime Köprüsü) aynı yolla eklenir:
 *
 *   etkinlikKaydet({ id: 'ses-odasi', bolge: 'ses', cikartma: …, oyna: async (s) => { … } });
 *
 * `oyna(s)` bir etkinliği baştan sona oynatır; `s` (Sahne, sahne.ts) ortak sahneyi verir: Mino ve Kino, konuşma
 * sırası, sayı kartları, ipucu (2 yanlıştan sonra doğru cevap parlar), Kino'nun hata anı, efektler. Söz bitince
 * ortak sonuç ekranı (çıkartma yapıştırma, rozet) açılır.
 */
import O from '../../content/okul.json';
import type { Ekran, Uygulama } from '../../src/uygulama';
import type { Sahne } from './sahne';

export type BolgeId = 'sayi' | 'ses' | 'kelime';

export interface Bolge {
  id: BolgeId;
  ad: string;
  rozet: string;
  renk: string;
  /** ilk sürümde açık mı (Ses Kulesi ve Kelime Köprüsü "yakında") */
  acik: boolean;
  /** Bölgenin kendi ekranı (Kelime Köprüsü: köprü); yoksa ortak durak ekranı (ekranlar.ts → bolgeEkrani) */
  ekran?: (app: Uygulama, p: { bolge?: BolgeId }) => Ekran;
  /** Rozet görseli (HTML) ve töreni sözü; yoksa Sayı Ustası'nınkiler */
  rozetResim?: () => string;
  rozetSoz?: string;
}

export const BOLGELER: Bolge[] = [
  { id: 'sayi', ad: O.arayuz.bolgeler.sayi, rozet: O.arayuz.rozetler.sayi, renk: '#5DBE3F', acik: true },
  { id: 'ses', ad: O.arayuz.bolgeler.ses, rozet: O.arayuz.rozetler.ses, renk: '#9B5CE0', acik: false },
  { id: 'kelime', ad: O.arayuz.bolgeler.kelime, rozet: O.arayuz.rozetler.kelime, renk: '#3E9DF2', acik: true },
];
export const bolge = (id: string) => BOLGELER.find((b) => b.id === id);

export interface EtkinlikTanim {
  id: string;
  bolge: BolgeId;
  /** ekranda yazan ad (okunmaz) */
  ad: string;
  /** en küçük yaş (Kuşlar geldi!: 5); yoksa herkes */
  yasEnAz?: number;
  /**
   * Abonelik olmadan oynanabilir mi. Yalnız bilgi: erişim denetimi src/engine/erisim.ts (paketleme dalı) gelince
   * oradan okunacak; bu dosya kilit koymaz.
   */
  ucretsiz?: boolean;
  /** Durak ve çıkartma simgesi (HTML); yoksa cizim.ts → etkinlikSimgesi'nin kendi listesi */
  simge?: () => string;
  /** Etkinliği oynatır; bitince çözülür */
  oyna: (s: Sahne) => Promise<void>;
}

const KAYIT: EtkinlikTanim[] = [];

export function etkinlikKaydet(e: EtkinlikTanim) {
  const i = KAYIT.findIndex((x) => x.id === e.id);
  if (i >= 0) KAYIT[i] = e;
  else KAYIT.push(e);
}
export const etkinlik = (id: string) => KAYIT.find((e) => e.id === id);
/** Bölgenin etkinlikleri, kayıt sırasıyla (belgedeki sıra) */
export const bolgeEtkinlikleri = (b: BolgeId) => KAYIT.filter((e) => e.bolge === b);
export const yasUygun = (e: EtkinlikTanim, yas: number) => !e.yasEnAz || yas >= e.yasEnAz;
/** Bu yaşta oynanan etkinliklerin kimlikleri (bölge rozeti bunlar bitince) */
export const oynananlar = (b: BolgeId, yas: number) => bolgeEtkinlikleri(b).filter((e) => yasUygun(e, yas)).map((e) => e.id);
