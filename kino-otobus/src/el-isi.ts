/**
 * Kino'nun Otobüsü: elle yapılan işlerin saf mantığı (DOM yok, birim testli).
 *
 * - Dokunsal hazırlık: kepçe tatta sürüklendikçe top büyür; sos şişesi kulenin üstünde tutuldukça sos akar; serpinti
 *   kavanozu kulenin üstünde sallandıkça serpinti yağar. Her birinin dokunuş karşılığı var (gun.ts eski dokunuşlar).
 * - Yan işler (isteğe bağlı, hiçbir şeyi beklemez, süre ve hata yok): tezgâhı silme (lekeler, 5-6'da sinek), külah
 *   yapma (5-6'da önce hamur dökülür) ve külahları rafa dizme. Külah hiç bitmez: az kalınca iş köşesi parlar.
 */
import type { Yas } from './model';

const sinirla = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

// ---------------------------------------------------------------- kepçe
/** Topun dolması için kepçenin tatta alması gereken yol (tasarım birimi u; telefonda ~px) */
export const KEPCE_YOL = 64;
/** Tatın dışında sürüklenen yol daha az doldurur (çocuk hemen yuvaya götürse de top oluşur) */
export const KEPCE_DIS_ORAN = 0.6;
/** Bırakınca bundan azsa ve parmak hâlâ tatın üstündeyse top kaba geri döner (vazgeçti) */
export const KEPCE_VAZGEC = 0.35;

/** Kepçenin yeni dolumu: önceki + bu harekette alınan yol (u) */
export function kepceDolum(onceki: number, yolU: number, tatta: boolean): number {
  return sinirla(onceki + (yolU * (tatta ? 1 : KEPCE_DIS_ORAN)) / KEPCE_YOL);
}
/** Bırakınca ne olur: yuvaya mı gider, kaba mı döner */
export const kepceBirak = (dolum: number, tatUstunde: boolean): 'ver' | 'geri' => (tatUstunde && dolum < KEPCE_VAZGEC ? 'geri' : 'ver');

// ---------------------------------------------------------------- sos
/** Şişe kulenin üstünde bu kadar tutulunca sos tamamen akar (ms); bırakılırsa kalan kendiliğinden akar */
export const SOS_DOLU_MS = 700;
export const sosDolum = (onceki: number, ms: number) => sinirla(onceki + ms / SOS_DOLU_MS);

// ---------------------------------------------------------------- serpinti (sallama)
/** Serpintinin tamamlanması için kaç sallama (yön değişimi) */
export const SALLAMA_GEREK = 3;
/** Bir sallama sayılması için bir yönde en az bu kadar gidilmeli (u) */
export const SALLAMA_ESIK = 14;

/**
 * Sallama sayacı: yatay ya da dikey yön değiştirince (o yönde en az SALLAMA_ESIK gidilmişse) bir sallama sayılır.
 * ekle(): bu harekette yeni sallama oldu mu.
 */
export class Sallama {
  sayi = 0;
  private yonX = 0;
  private yonY = 0;
  private yolX = 0;
  private yolY = 0;
  ekle(dxU: number, dyU: number): boolean {
    const x = this.eksen(dxU, 'x');
    const y = this.eksen(dyU, 'y');
    if (x || y) this.sayi++;
    return x || y;
  }
  private eksen(d: number, e: 'x' | 'y'): boolean {
    if (!d) return false;
    const yon = Math.sign(d);
    const eskiYon = e === 'x' ? this.yonX : this.yonY;
    const yol = e === 'x' ? this.yolX : this.yolY;
    let sayildi = false;
    let yeniYol = yol;
    if (yon === eskiYon || eskiYon === 0) yeniYol += Math.abs(d);
    else {
      sayildi = yol >= SALLAMA_ESIK;
      yeniYol = Math.abs(d);
    }
    if (e === 'x') {
      this.yonX = yon;
      this.yolX = yeniYol;
    } else {
      this.yonY = yon;
      this.yolY = yeniYol;
    }
    return sayildi;
  }
}

// ---------------------------------------------------------------- temizlik
/** Bir leke: kir 1 (yeni) → 0 (silindi) */
export interface Leke {
  id: number;
  tat: 'cilek' | 'cikolata' | 'vanilya';
  kir: number;
}
/** Bir lekeyi silmek için süngerle üstünde alınacak yol (u) */
export const SILME_YOL = 150;
/** Dokunuşla silmede her dokunuş bu kadar siler (iki dokunuş: pırıl pırıl) */
export const SILME_DOKUNUS = 0.5;

/** Sünger lekenin üstünde yolU kadar gitti (ya da dokunuldu: yolU null): kalan kir */
export function sil(l: Leke, yolU: number | null): number {
  l.kir = sinirla(l.kir - (yolU === null ? SILME_DOKUNUS : yolU / SILME_YOL));
  if (l.kir < 0.02) l.kir = 0;
  return l.kir;
}
/** Yaşa göre temizlik: 3-4 iki leke; 5-6 üç leke ve bir sinek (kovalanır) */
export const temizlikAyari = (yas: Yas) => (yas === 'buyuk' ? { leke: 3, sinek: true } : { leke: 2, sinek: false });
/**
 * Bu servisten sonra tezgâha leke düşer mi: yoğun anlardan sonra (her ikinci verişte), tezgâh temizse; öğretici
 * (Gün 1, Mino) sırasında hiç.
 */
export const lekeDuserMi = (verilen: number, mevcutLeke: number, ogretici: boolean) => !ogretici && mevcutLeke === 0 && verilen > 0 && verilen % 2 === 0;
const LEKE_TATLARI: Leke['tat'][] = ['cilek', 'cikolata', 'vanilya'];
let lekeNo = 0;
export function lekelerUret(yas: Yas, tohum = 0): Leke[] {
  return Array.from({ length: temizlikAyari(yas).leke }, (_, i) => ({ id: ++lekeNo, tat: LEKE_TATLARI[(i + tohum) % LEKE_TATLARI.length], kir: 1 }));
}

// ---------------------------------------------------------------- külah stoğu ve külah yapımı
/** Külah rafı: gün başında az (sabah hazırlığı), en çok 4; hiç bitmez (en az 1: Kino tezgâhın altından alır) */
export const KULAH_STOK = { bas: 2, dolu: 4, az: 2, enAz: 1 } as const;
export const kulahKullan = (stok: number) => Math.max(KULAH_STOK.enAz, stok - 1);
export const kulahAzMi = (stok: number) => stok <= KULAH_STOK.az;
/** Bir külah yapımı rafı doldurur */
export const kulahYap = () => KULAH_STOK.dolu;

export type KulahAdimi = 'hamur' | 'bas' | 'yuvarla';
/** Külah yapımının adımları: 3-4 kapağı bas ve yuvarla (hamur hazır); 5-6 önce hamuru kendisi döker */
export const kulahAdimlari = (yas: Yas): KulahAdimi[] => (yas === 'buyuk' ? ['hamur', 'bas', 'yuvarla'] : ['bas', 'yuvarla']);
/** Hamur sürahisi makinenin üstünde bu kadar tutulunca hamur tamam (ms) */
export const HAMUR_DOLU_MS = 800;
/** Yuvarlamak için gofretin sürüklenmesi gereken yol (u) */
export const YUVARLA_YOL = 70;
