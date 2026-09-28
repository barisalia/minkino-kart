/**
 * "Şşş, Ege Uyuyor!" oyun mantığı (DOM'suz, birim testli: tests/unit/macera-ege.test.ts).
 * Yaş ayarları (yalnız senaryonun dediği yerlerde: mama, ninni, sessizlik; çıngırak ve cee-ee alanları
 * ege-duzeltme.md ile oyundan çıktı, dışa aktarımlar birim testi için duruyor), ninni melodisi,
 * beşik sallama (yön değişimi = salınım), deneme/ipucu kuralı. Ses algılama eşiklerine dokunulmaz
 * (ekip/SES-SISTEMI.md): kolaylık yalnız oyunun hızından ve kurallarından verilir.
 */
import NINNI_JSON from '../../assets/muzik/ninni.json';
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
 * Ninni Gemini (Lyria) kaydıdır, özgün sözler: "Dandini dandini Ege / Yumdu gözünü bebek / Ay geldi, yıldız geldi /
 * Uyu da büyü Ege". Oyun şarkıdaki notalara göre ilerler: heceler, notalar (midi), vuruşlar ve zamanlar kayıttan
 * ölçüldü (assets/muzik/ninni.json; "tahmini" heceler de kullanılır). Ton bağımsız değerlendirilir: çocuğun
 * kendi ilk notası referans (sarki.ts notaDegerlendir, refMidi = NINNI_REF_MIDI).
 */
interface NinniHece {
  hece: string;
  satir: number;
  basla_ms: number;
  bitir_ms: number;
  midi: number;
  vurus: number;
  tahmini?: boolean;
}
const NINNI_KAYIT = NINNI_JSON as { bpm: number; baslangic_ms: number; sure_ms: number; heceler: NinniHece[] };
/** Kayıttaki dize sayısı (dinlemede hepsi çalar; değerlendirme yaşa göre ilk dizelerden) */
export const NINNI_DIZE = new Set(NINNI_KAYIT.heceler.map((x) => x.satir)).size;
/** Referans nota: ninninin ilk notası ("Dan"; çocuğun tonu buradan ölçülür) */
export const NINNI_REF_MIDI = NINNI_KAYIT.heceler[0].midi;

/** Ninninin ilk `dize` dizesi, kayıttaki notalar ve zamanlarla (basMs: kayıttaki başlangıç, sureMs: sonraki heceye) */
export function ninni(dize = NINNI_DIZE): Nota[] {
  const vurusMs = 60000 / NINNI_KAYIT.bpm;
  const H = NINNI_KAYIT.heceler;
  const ilk = H[0].basla_ms;
  return H.filter((x) => x.satir < dize).map((x, i) => {
    const sonraki = H[i + 1];
    const son = sonraki && sonraki.satir === x.satir ? sonraki.basla_ms : x.bitir_ms;
    return { midi: x.midi, vurus: x.vurus, hece: x.hece, satir: x.satir, bas: (x.basla_ms - ilk) / vurusMs, basMs: x.basla_ms, sureMs: Math.max(120, son - x.basla_ms) };
  });
}
/** Kayıtta verilen dizenin bittiği an (ms, dosyanın başından) */
export function ninniSonuMs(dize = NINNI_DIZE): number {
  const s = NINNI_KAYIT.heceler.filter((x) => x.satir < dize);
  return s[s.length - 1].bitir_ms;
}
/** Kayıttaki satır arası (ms): dizenin son hecesinin bitişinden sonraki dizenin ilk hecesine */
export function ninniSatirArasiMs(satir: number): number {
  const H = NINNI_KAYIT.heceler;
  const son = H.filter((x) => x.satir === satir).pop();
  const sonraki = H.find((x) => x.satir === satir + 1);
  return son && sonraki ? Math.max(0, sonraki.basla_ms - son.bitir_ms) : 0;
}
/**
 * Çocuk kayıttan yavaş söyler (kayıt 77 bpm; hızlı heceler var). 3-4 yaş daha yavaş. Bu kadar kısa notada
 * (ms, yavaşlatılmış) ton puanlanmaz, ses çıkarması yeter.
 */
export const ninniYavas = (yas: number) => (kucukMu(yas) ? 1.7 : 1.45);
export const NINNI_KISA_MS = 330;
/** Ninni vuruşu (sn): kayıt çalınamazsa müzik kutusu bu tempoyla çalar (kayıt 77 bpm ≈ 0.78 sn) */
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
