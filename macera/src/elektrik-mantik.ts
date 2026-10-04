/**
 * "Elektrikler Kesildi!" oyun mantığı (DOM'suz, birim testli: tests/unit/macera-elektrik.test.ts).
 * Senaryo: ekip/senaryo/elektrik.md. Yaş farkı yalnız senaryonun dediği yerlerde (sahne 2, 4, 5, 6).
 */

/** İki yaş grubu: 3-4 ve 5-6 */
export const kucukMu = (yas: number) => yas <= 4;

export interface ElektrikAyar {
  /** sahne 2: fenerin pili yerinde mi (5-6: pilsiz, pil bulunup takılır) */
  pilli: boolean;
  /** sahne 1: bağırınca Kino bir adım geri gider mi (3-4: yalnız titrer) */
  geriAdim: boolean;
  /** sahne 4: ses gelmeden önce susulacak süre (sn) */
  sessiz: number;
  /** sahne 4: ses gelince kaynağı kıpırdar mı (3-4: evet; 5-6: yalnız sesin yönü) */
  kaynakKipir: boolean;
  /** sahne 5: Can'ın iki turdaki fener işaret sayısı */
  isaretler: [number, number];
  /** sahne 6: kamp şarkısında alkış sayısı */
  alkis: number;
}

export function elektrikAyar(yas: number): ElektrikAyar {
  const k = kucukMu(yas);
  return {
    pilli: k,
    geriAdim: !k,
    sessiz: k ? 1.5 : 2.5,
    kaynakKipir: k,
    isaretler: k ? [2, 3] : [3, 5],
    alkis: k ? 6 : 8,
  };
}

/** Kolaylık: her yaşta 2. denemede kabul (1 yanlıştan sonra) */
export const kabulMu = (yanlis: number) => yanlis >= 1;
/** Parmak ipucu: bu kadar saniyede ya da 2 yanlışta */
export const IPUCU_SURE = 7;

// ---------------------------------------------------------------- sahne 1: Kino'yu çağırmak
/** Kino'nun masanın altından çıkış basamakları: kulak → burun → çıktı */
export const CIKIS_ADIM = 3;
export type Cagri = 'yumusak' | 'yuksek';
/** Söyleyişin sonucu (ege-seviye.ts → Soyleyis.sonuc): fısıltı ve kısık ses yumuşak sayılır */
export const cagriSonucu = (sonuc: 'fisilti' | 'kisik' | 'yuksek'): Cagri => (sonuc === 'yuksek' ? 'yuksek' : 'yumusak');
/** Çağrıdan sonra adım (0..CIKIS_ADIM): yumuşak bir ileri; yüksek ses 5-6 yaşta bir geri (0'ın altına inmez) */
export function cikisAdimi(adim: number, c: Cagri, geriAdim: boolean): number {
  if (c === 'yumusak') return Math.min(CIKIS_ADIM, adim + 1);
  return geriAdim ? Math.max(0, adim - 1) : adim;
}

/**
 * Örtüyü okşamak (parmak karşılığı): parmağın örtü üstündeki yolu birikir; her `adimYol` (örtü genişliğinin
 * katı) bir yumuşak çağrı sayılır. Tek dokunuş ya da titreme sayılmaz.
 */
export class Oksama {
  private yol = 0;
  constructor(private adimYol = 1.1) {}
  /** dx, dy: örtü genişliğine oranla hareket. Bir adım tamamlandıysa true */
  hareket(dx: number, dy: number): boolean {
    const d = Math.hypot(dx, dy);
    if (d < 0.004) return false;
    this.yol += Math.min(d, 0.25);
    if (this.yol >= this.adimYol) {
      this.yol = 0;
      return true;
    }
    return false;
  }
  get oran() {
    return this.yol / this.adimYol;
  }
}

// ---------------------------------------------------------------- sahne 2: çekmece
export type EsyaAd = 'fener' | 'pil' | 'eldiven' | 'rende';
/** Çekmecedeki eşyalar (soldan sağa); 5-6 yaşta pil de var */
export function cekmeceEsyalari(yas: number): EsyaAd[] {
  return kucukMu(yas) ? ['eldiven', 'fener', 'rende'] : ['rende', 'fener', 'eldiven', 'pil'];
}
/** Her eşyanın sallanınca çıkardığı ses (balon) */
export const ESYA_SESI: Record<EsyaAd, 'tik' | 'tikir' | 'pof' | 'sirr'> = { fener: 'tik', pil: 'tikir', eldiven: 'pof', rende: 'sirr' };
/** Aranan eşya: önce fener; pilsizse fenerden sonra pil */
export function aranan(bulunan: EsyaAd[], pilli: boolean): EsyaAd | null {
  if (!bulunan.includes('fener')) return 'fener';
  if (!pilli && !bulunan.includes('pil')) return 'pil';
  return null;
}

// ---------------------------------------------------------------- sahne 3: ışık lekesi
export type ZiplamaYeri = 'koltuk' | 'perde' | 'masa';
export const ZIPLAMA_YERLERI: ZiplamaYeri[] = ['koltuk', 'perde', 'masa'];
/** Mino'nun zıplaması için ışığın bir yerde durması gereken süre (sn) */
export const DURMA_SURE = 0.45;
/** Kino'nun kafasına konmadan önce kaç farklı yere zıplanır */
export const ZIPLAMA_SAYISI = 3;

// ---------------------------------------------------------------- sahne 4: karanlığın sesleri
export type SesKaynagi = 'saat' | 'saksi' | 'kemik';
export const SES_SIRASI: SesKaynagi[] = ['saat', 'saksi', 'kemik'];
/** Sessizlik ilerlemesi: sessizken dolar, ses olunca yavaşça geri iner (çocuk kaybetmez, yeniden dener) */
export function sessizlikIlerle(gecen: number, dt: number, sessiz: boolean): number {
  return sessiz ? gecen + dt : Math.max(0, gecen - dt * 1.5);
}
/** Stereo yön: sesin kaynağının sahnedeki x'inden (%) −1 (sol) … 1 (sağ) */
export const yon = (x: number) => Math.max(-1, Math.min(1, (x - 50) / 35));

// ---------------------------------------------------------------- sahne 5: Can'ın işaretleri
export type IsaretSonuc = 'dogru' | 'az' | 'cok';
export function isaretSonuc(hedef: number, sayi: number): IsaretSonuc {
  return sayi === hedef ? 'dogru' : sayi < hedef ? 'az' : 'cok';
}

// ---------------------------------------------------------------- sahne 6: çadır
/** Kamp şarkısı (pentatonik, basit; her alkış bir nota): midi */
export const KAMP_SARKISI = [67, 67, 69, 67, 72, 71, 67, 64, 67, 69, 67, 64, 62, 64, 67, 60];
/** Alkış sayısına göre çalınacak notalar (son nota tonik: şarkı bitmiş gibi duyulsun) */
export function kampNotalari(adet: number): number[] {
  const n = KAMP_SARKISI.slice(0, adet);
  n[n.length - 1] = 60 + 12 * (n[n.length - 1] >= 66 ? 1 : 0);
  return n;
}

// ---------------------------------------------------------------- sahne 7: Geldiii!
/** Yüksek ses kuralı (Doğum Günü "Sürpriz!" ile aynı): tabanın 24 dB üstü, toplam 0.18 sn */
export const YUKSEK_DB = 24;
export const YUKSEK_SURE = 0.18;
export class YuksekSes {
  private sure = 0;
  /** ust: tabanın kaç dB üstü; kare: kare süresi (sn). Yeterince yüksek ses olduysa true */
  kare(ust: number, kare: number): boolean {
    if (ust > YUKSEK_DB) this.sure += kare;
    return this.sure > YUKSEK_SURE;
  }
}

// ---------------------------------------------------------------- sahne 6: kamp şarkısı (Gemini kaydı)
/**
 * Kayıt: assets/muzik/kamp.json (heceler, vuruslar_ms = kayıttaki el çırpmaları) + kamp-sozlu / kamp-sozsuz.mp3.
 * Kural: oyun şarkıya uyar (kayıt zorlanmaz). Önce sözlü şarkı dinlenir. Sonra yankı oyunu: sözsüz altyapıdan bir
 * parça çalar (vuruşlarında çadırın yıldızları yanar), parça bitince çocuk aynı vuruşları alkışlar (ya da yastığa
 * vurur). Kayıt çalarken mikrofon dinlemez (sırayla konuşma kuralı); çocuk sessizlikte alkışlar.
 * Değerlendirme kayıttaki vuruş aralığına göre, yumuşak toleransla.
 */
export interface KampKayit {
  vuruslar_ms: number[];
  heceler?: { hece: string; satir: number; basla_ms: number; bitir_ms: number }[];
  sure_ms?: number;
}
export interface KampTur {
  /** kayıtta parçanın başı ve sonu (ms) */
  basMs: number;
  bitMs: number;
  /** parçadaki vuruşlar (parçanın başından ms) */
  vuruslar: number[];
  /** kayıttaki ortalama vuruş aralığı (ms) */
  ara: number;
}
/** Her turun kayıttaki ilk vuruşu (şarkının dört satırının başları) */
export const KAMP_TUR_BAS = [2, 10, 18, 26];
/** Tur sayısı ve turdaki vuruş (3-4: 2 × 3; 5-6: 2 × 4; toplam 6 / 8 alkış) */
export const kampTurAyar = (yas: number) => ({ tur: 2, vurus: kucukMu(yas) ? 3 : 4 });

export function kampTurlari(k: KampKayit | null | undefined, yas: number): KampTur[] {
  const v = (k?.vuruslar_ms ?? []).filter((x) => Number.isFinite(x) && x >= 0).sort((a, b) => a - b);
  const { tur, vurus } = kampTurAyar(yas);
  if (v.length < 2) return [];
  const ara = (v[v.length - 1] - v[0]) / (v.length - 1);
  const turlar: KampTur[] = [];
  for (const i0 of KAMP_TUR_BAS) {
    if (turlar.length >= tur) break;
    if (i0 + vurus > v.length) break;
    const bas = v[i0];
    const son = v[i0 + vurus - 1];
    turlar.push({ basMs: Math.max(0, bas - ara * 0.35), bitMs: son + ara * 0.6, vuruslar: v.slice(i0, i0 + vurus).map((x) => x - Math.max(0, bas - ara * 0.35)), ara });
  }
  return turlar;
}

export type YankiSonuc = 'dogru' | 'az' | 'cok' | 'ritim';
/** Yumuşak tolerans: her aralık kayıttaki vuruş aralığının %45'i ile 2,1 katı arasında olmalı */
export const RITIM_ALT = 0.45;
export const RITIM_UST = 2.1;
/**
 * Çocuğun alkışları (ms) kayıttaki vuruşlarla aynı mı: sayı tutmalı; ritim yumuşak (yarı hızda da, biraz hızlı
 * da olur). ritimBak false ise (3-4 yaş) yalnız sayı.
 */
export function yankiSonuc(zamanlar: number[], n: number, ara: number, ritimBak = true): YankiSonuc {
  if (zamanlar.length < n) return 'az';
  if (zamanlar.length > n) return 'cok';
  if (!ritimBak) return 'dogru';
  for (let i = 1; i < zamanlar.length; i++) {
    const d = zamanlar[i] - zamanlar[i - 1];
    if (d < ara * RITIM_ALT || d > ara * RITIM_UST) return 'ritim';
  }
  return 'dogru';
}
/** Sözlü kaydın satır başları (ms): ekranda şarkı sözü o anda değişir */
export function kampSatirBaslari(k: KampKayit | null | undefined): number[] {
  const s = new Map<number, number>();
  for (const h of k?.heceler ?? []) s.set(h.satir, Math.min(s.get(h.satir) ?? Infinity, h.basla_ms));
  return [...s.entries()].sort((a, b) => a[0] - b[0]).map(([, b]) => b);
}
