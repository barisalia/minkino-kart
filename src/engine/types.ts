export type SoruTipi = 'BUL' | 'ESLESTIR' | 'SAY' | 'FARKLI' | 'SIRADAKI' | 'HAFIZA';
export const SORU_TIPLERI: SoruTipi[] = ['BUL', 'ESLESTIR', 'SAY', 'FARKLI', 'SIRADAKI', 'HAFIZA'];

export type Bicim = 'normal' | 'golge' | 'yuva' | 'renk';

/** Bir kartın ekranda nasıl gösterileceği. */
export interface KartRef {
  kart?: string;
  yazi?: string;
  adet?: number;
  olcek?: number;
  bicim?: Bicim;
  /** Çıkarma sorularında üstü çizili nesne sayısı */
  carpi?: number;
}
export type KartGirdi = string | KartRef;

export interface Soru {
  tip: SoruTipi;
  soru_metni: string;
  soru_ses?: string;
  kartlar: KartGirdi[];
  dogru?: string | number;
  gosterge?: KartGirdi[];
  ipucu?: string;
  dogru_ses?: string;
  ikon?: string;
  odul?: string;
  islem?: '+' | '-';
}

export interface IcerikDosyasi {
  yas: number;
  tema: string;
  sorular: Soru[];
}

export type KartTuru = 'resim' | 'renk' | 'sekil' | 'sayi' | 'harf';

export interface Kart {
  id: string;
  ad: string;
  tema: string;
  tur: KartTuru;
  gorsel?: string;
  ses?: string;
  renk?: string;
  deger?: string;
  ornek?: string;
  grup?: string;
  album?: boolean;
}

export interface Tema {
  id: string;
  ad: string;
  kapak: string;
  renk: string;
  acilis_kart: number;
  ucretsiz: boolean;
}

export type Yas = 3 | 4 | 5 | 6;
export const YASLAR: Yas[] = [3, 4, 5, 6];
