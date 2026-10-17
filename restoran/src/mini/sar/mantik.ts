/**
 * SİGARA BÖREĞİ: SAR · saf mantık (DOM yok, birim testli). ekip/senaryo/RESTORAN.md §8 M16 (v1.1).
 *
 * Yufka üçgeninin geniş kenarına peynir çizgi gibi konur (az / çok), maydanoz serpilir; yufka yukarı kaydırılarak
 * rulo yapılır (3-4: iki, 5-6: dört kaydırma), ucuna su sürülür (yapışır). Çok peynir: rulo kapanmaz, peynir iki
 * uçtan fışkırır (komik; yine pişer ve yenir). Rulolar kızgın yağda pişer: çiğ → az → altın → çıtır (kömür yok).
 */
import type { Pisme, Yas, YemekOzelligi } from '../arayuz';

export const RULO_ADIM: Record<Yas, number> = { kucuk: 2, buyuk: 4 };
/** peynir çizgisi: 0-1 (kenarın ne kadarı); 1.6 üstü çok (fışkırır) */
export const PEYNIR_COK = 1.6;
export const YAG_HIZ = 0.5; // saniyede pişme

export interface Borek {
  peynir: number;
  maydanoz: number;
  /** rulo ilerlemesi 0-1 */
  rulo: number;
  yapisti: boolean;
  fiskirdi: boolean;
  /** kızartma (0 … 3.6) */
  p: number;
  yagda: boolean;
}

export const yeniBorek = (): Borek => ({ peynir: 0, maydanoz: 0, rulo: 0, yapisti: false, fiskirdi: false, p: 0, yagda: false });

/** Peynir çizgisi uzar (kenar boyunca gezilen yol / kenar uzunluğu) */
export function peynirKoy(b: Borek, oran: number) {
  b.peynir = Math.min(2.2, b.peynir + oran);
}

/** Bir rulo kaydırması. Döner: rulo tamamlandı mı, peynir fışkırdı mı (çok peynirde son kaydırmada) */
export function ruloYap(b: Borek, yas: Yas): { bitti: boolean; fiskirdi: boolean } {
  if (b.rulo >= 1) return { bitti: true, fiskirdi: false };
  b.rulo = Math.min(1, b.rulo + 1 / RULO_ADIM[yas]);
  let fiskirdi = false;
  if (b.rulo >= 1 && b.peynir >= PEYNIR_COK && !b.fiskirdi) {
    b.fiskirdi = true;
    fiskirdi = true;
  }
  return { bitti: b.rulo >= 1, fiskirdi };
}

/** Ucuna su: yapışır (rulo bittiyse) */
export function suSur(b: Borek): boolean {
  if (b.rulo < 1 || b.yapisti) return false;
  b.yapisti = true;
  return true;
}

export const pismeAdi = (p: number): Pisme => (p < 0.8 ? 'cig' : p < 2 ? 'az' : p < 3 ? 'altin' : 'citir');
export const kizart = (b: Borek, sn: number) => {
  if (b.yagda) b.p = Math.min(3.6, b.p + sn * YAG_HIZ);
};

export function borekOzelligi(bs: Borek[]): YemekOzelligi {
  const pismeler = bs.map((b) => b.p);
  const peynir = bs.reduce((t, b) => t + (b.peynir > 0 ? 1 : 0), 0);
  const may = bs.reduce((t, b) => t + b.maydanoz, 0);
  const o: YemekOzelligi = {
    malzemeler: { yufka: { adet: bs.length } },
    pisme: pismeler.length ? pismeAdi(Math.min(...pismeler)) : undefined,
    sicak: true,
    porsiyon: bs.length <= 1 ? 'az' : bs.length >= 4 ? 'kocaman' : 'normal',
  };
  if (peynir) o.malzemeler.peynir = { adet: peynir };
  if (may) o.malzemeler.maydanoz = { adet: may, kesim: 'kiyim' };
  return o;
}
