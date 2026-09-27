/**
 * "Şşş, Ege Uyuyor!" oyun mantığı (DOM'suz, birim testli: tests/unit/macera-ege.test.ts).
 * Yaş ayarları (yalnız senaryonun dediği yerlerde: çıngırak, mama, cee-ee, ninni, sessizlik), ninni melodisi,
 * beşik sallama (yön değişimi = salınım), deneme/ipucu kuralı. Ses algılama eşiklerine dokunulmaz
 * (ekip/SES-SISTEMI.md): kolaylık yalnız oyunun hızından ve kurallarından verilir.
 */
import type { Nota } from './sarki';

/** 3-4 yaş grubu mu (5-6: büyük grup) */
export const kucukMu = (yas: number) => yas <= 4;

export interface EgeAyar {
  /** çıngırak: 3-4 yaş serbest tık sayısı; 5-6 yaş ritim taklidi */
  tik: number;
  ritim: boolean;
  /** mama: kaşık sayısı; yavaş üfleme gerekir mi (sert üflerse mama uçar) */
  kasik: number;
  yavasUfle: boolean;
  /** cee-ee: yumuşak ses istenir mi (bağırırsa Ege irkilir) */
  yumusak: boolean;
  /** ninni: dize sayısı; melodi yaklaşık tutmalı mı (değilse ses çıkarmak yeter) */
  dize: number;
  melodi: boolean;
  /** sessizlik süresi (sn) */
  sessiz: number;
}

export function egeAyar(yas: number): EgeAyar {
  // 2026-09-27 (Barış: "bazı zor kısımlar var, bir tık kolaylaştır"): 5-6 yaşta ninni 4 → 3 dize, sessizlik
  // 3-4 yaşta 4 → 3.5 sn, 5-6 yaşta 6 → 5 sn. Algılama eşiklerine dokunulmadı; yalnız oyunun süresi ve kuralı.
  return kucukMu(yas)
    ? { tik: 3, ritim: false, kasik: 3, yavasUfle: false, yumusak: false, dize: 2, melodi: false, sessiz: 3.5 }
    : { tik: 3, ritim: true, kasik: 4, yavasUfle: true, yumusak: true, dize: 3, melodi: true, sessiz: 5 };
}

/** Her yaşta aynı: serbest kukla konuşması, cee-ee turları */
export const SERBEST_KUKLA = 4;
export const CEE_TURLARI = ['ada', 'can', 'elif', 'mino', 'hepsi'] as const;
export type CeeTur = (typeof CEE_TURLARI)[number];

/** Ege'nin çıngırak ritmi (tık-tık … tıık): vuruş zamanları (sn); kısa-uzun kalıbı tempodan bağımsız karşılaştırılır */
export const EGE_RITIM = [0, 0.34, 1.04];

// ---------------------------------------------------------------- kolaylık kuralı
/**
 * Bir ses görevi 2 denemede ya da 8 saniyede olmazsa parmak ipucu çıkar; her yaşta 3. denemede kabul edilir
 * (önce 5-6 yaşta 4. denemedeydi; Barış: "bir tık kolaylaştır"). Oyun hiçbir yerde kilitlenmez.
 */
export const IPUCU_SURE = 8;
export const IPUCU_YANLIS = 2;
export function kabulMu(_yas: number, yanlis: number): boolean {
  return yanlis >= 2;
}

// ---------------------------------------------------------------- mama
/** Üfleme gücü bu değerin üstündeyse "sert" (5-6 yaş); algılama eşiği değil, oyunun yorumu (0.85 → 0.92) */
export const SERT_GUC = 0.92;
/** Bu kadar süre sert üflenirse mama kaşıktan fırlar (sn; 0.3 → 0.5). Bir kez fırlayınca bir daha fırlamaz. */
export const SERT_SURE = 0.5;
/** Buhar sönme hızı (saniyede): yavaş üflemede de dolar; kolaylık buradan (0.45 + 0.55g → 0.6 + 0.7g) */
export const buharSonme = (guc: number) => 0.6 + guc * 0.7;

// ---------------------------------------------------------------- kuklalar
/** Ege'nin gülmesi: her konuşmada büyür; çok ince seste katıla katıla */
export function gulme(konusmaSayisi: number, inceFark: number): 'kikir' | 'kahkaha' {
  return konusmaSayisi >= 4 || inceFark > 7 ? 'kahkaha' : 'kikir';
}

// ---------------------------------------------------------------- ninni
/**
 * "Dandini dandini dastana" (geleneksel, anonim). Kulaktan sade düzenleme, ninni ölçüsünde; ilk nota 67 (çocuğun
 * kendi "sol"üne göre ton bağımsız değerlendirilir: sarki.ts notaDegerlendir).
 */
const NINNI_SATIRLAR: [string[], number[], number[]][] = [
  [['Dan', 'di', 'ni', 'dan', 'di', 'ni', 'das', 'ta', 'na'], [67, 67, 69, 67, 67, 69, 70, 69, 67], [1, 1, 1, 1, 1, 1, 1, 1, 2]],
  [['Da', 'na', 'lar', 'gir', 'miş', 'bos', 'ta', 'na'], [65, 65, 67, 69, 67, 65, 64, 62], [1, 1, 1, 1, 1, 1, 1, 2]],
  [['Kov', 'bos', 'tan', 'cı', 'da', 'na', 'yı'], [67, 69, 70, 69, 67, 65, 64], [1, 1, 1, 1, 1, 1, 2]],
  [['Ye', 'me', 'sin', 'la', 'ha', 'na', 'yı'], [65, 64, 62, 64, 65, 64, 62], [1, 1, 1, 1, 1, 1, 2]],
];

export function ninni(dize = 4): Nota[] {
  const notalar: Nota[] = [];
  let t = 0;
  NINNI_SATIRLAR.slice(0, dize).forEach(([heceler, midiler, sureler], satir) => {
    heceler.forEach((hece, i) => {
      notalar.push({ midi: midiler[i], vurus: sureler[i], hece, satir, bas: t });
      t += sureler[i];
    });
    t += 1;
  });
  return notalar;
}
/** Ninni vuruşu (sn): yavaş */
export const NINNI_VURUS = 0.72;

// ---------------------------------------------------------------- beşik sallama
/**
 * Beşiği parmakla sağa-sola sürükleme: her yön değişimi bir salınım (bir nota). Titreme sayılmasın diye yön
 * değişmeden önce en az `enAz` piksel gidilmiş olmalı.
 */
export class Salinim {
  private yon = 0;
  private yol = 0;
  sayi = 0;
  constructor(private enAz = 22) {}
  /** dx: bu hareketteki yatay kayma (px). Salınım tamamlandıysa true */
  hareket(dx: number): boolean {
    if (!dx) return false;
    const y = Math.sign(dx);
    if (y === this.yon || this.yon === 0) {
      this.yon = y;
      this.yol += Math.abs(dx);
      return false;
    }
    // yön değişti
    const tamam = this.yol >= this.enAz;
    this.yon = y;
    this.yol = Math.abs(dx);
    if (tamam) this.sayi++;
    return tamam;
  }
  sifirla() {
    this.yon = 0;
    this.yol = 0;
    this.sayi = 0;
  }
}

// ---------------------------------------------------------------- sessizlik
/** Ses çıkınca ay ne kadar geri iner (sn; 1.2 → 0.8) */
export const AY_GERI = 0.8;
/** Mino'nun burnu ay dolmaya bu kadar kala kaşınır (dolum oranı) */
export const BURUN_ORAN = 0.8;
/** Burnu tutma süresi (sn): parmak bu kadar basılı kalırsa hapşırık tutulur (1.6 → 1.2) */
export const BURUN_TUT = 1.2;
/** Burnu tutmak için süre (sn): geçerse HAPŞU (7 → 9) */
export const BURUN_SURE = 9;
/** Ninni: notaların bu oranı iyi söylenirse (ya da sallanırsa) geçer (0.5 → 0.4) */
export const NINNI_GECER = 0.4;
