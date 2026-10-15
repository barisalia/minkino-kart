/**
 * Uyku Vakti (ekip/senaryo/GECE-ISI.md): saf mantık, DOM'suz (birim testli: tests/unit/uyku.test.ts).
 * Akşam saati, sabaha kadar kilit, ritüel adımlarının sırası ve yardım merdiveni.
 */

/**
 * Özelliğin bayrağı. Barış onaylayana kadar KAPALI: menüde ay lambası, Ebeveyn Köşesi düğmesi, "uygulama sabaha kadar
 * uyur" kilidi ve sabah "Günaydın!" hiç devreye girmez. Denemek için adrese ?uyku=1 eklenir (saat taklidi: &saat=21).
 */
export const UYKU_ACIK = false;

/** localStorage anahtarı: { bitti: <ms>, gunaydin?: true } */
export const UYKU_ANAHTAR = 'minkino-uyku-v1';

/** Akşam başlangıcı ve sabah sınırı (cihaz saati) */
export const AKSAM_SAAT = 19;
export const SABAH_SAAT = 6;

/** Yardım merdiveni (ms): ipucu eli, cümleyi tekrar, kendiliğinden yapılır */
export const YARDIM_MS = [4000, 10000, 18000] as const;

export interface UykuKaydi {
  /** ritüelin bittiği an (ms, Date.now) */
  bitti: number;
  /** sabah "Günaydın!" söylendi mi */
  gunaydin?: boolean;
}

/** Adres parametreleri: ?uyku=1 özelliği bayraktan bağımsız açar; ?saat=21 (0-23) cihaz saatinin yerine geçer */
export function uykuEtkin(q: URLSearchParams, acik = UYKU_ACIK): boolean {
  return acik || q.get('uyku') === '1';
}

/** Saat taklidi: ?saat=21 verilirse bugünün o saati (dakika 0), yoksa gerçek zaman */
export function simdiBul(q: URLSearchParams, gercek = new Date()): Date {
  const s = q.get('saat');
  if (s === null || s === '') return gercek;
  const n = Number(s);
  if (!Number.isFinite(n)) return gercek;
  const d = new Date(gercek);
  const saat = Math.floor(n);
  const dakika = Math.round((n - saat) * 100);
  d.setHours(((saat % 24) + 24) % 24, Math.max(0, Math.min(59, dakika)), 0, 0);
  return d;
}

/** 19:00-05:59 akşam (ay lambası görünür) */
export function aksamMi(saat: number): boolean {
  return saat >= AKSAM_SAAT || saat < SABAH_SAAT;
}

/** Kaydın kilidinin kalktığı an: bittiği andan sonraki ilk 06:00 */
export function kilitSonu(bitti: number): number {
  const d = new Date(bitti);
  const sinir = new Date(d);
  sinir.setHours(SABAH_SAAT, 0, 0, 0);
  if (d.getTime() >= sinir.getTime()) sinir.setDate(sinir.getDate() + 1);
  return sinir.getTime();
}

/** Uyuyan oda kilidi var mı (gece yarısını geçen kayıt dahil; sabah 06:00'da kalkar) */
export function kilitVarMi(kayit: UykuKaydi | null | undefined, simdi: Date | number): boolean {
  if (!kayit || !Number.isFinite(kayit.bitti)) return false;
  const t = typeof simdi === 'number' ? simdi : simdi.getTime();
  return t >= kayit.bitti - 60_000 && t < kilitSonu(kayit.bitti);
}

/** Açılışta ne olur: uyuyan oda, sabah selamı (bir kez) ya da hiçbir şey */
export function acilisDurumu(kayit: UykuKaydi | null | undefined, simdi: Date | number): 'kilit' | 'gunaydin' | 'yok' {
  if (!kayit) return 'yok';
  if (kilitVarMi(kayit, simdi)) return 'kilit';
  return kayit.gunaydin ? 'yok' : 'gunaydin';
}

export function kayitOku(metin: string | null): UykuKaydi | null {
  if (!metin) return null;
  try {
    const v = JSON.parse(metin) as Partial<UykuKaydi>;
    return typeof v?.bitti === 'number' ? { bitti: v.bitti, gunaydin: !!v.gunaydin } : null;
  } catch {
    return null;
  }
}

/** Ritüelin adımları (sırasıyla). 'oda': uyuyan oda (son durum, ekran böyle kalır) */
export const ADIMLAR = ['acilis', 'oyuncak', 'yastik', 'battaniye', 'perde', 'lamba', 'uyku', 'oda'] as const;
export type Adim = (typeof ADIMLAR)[number];

export function sonrakiAdim(a: Adim): Adim {
  const i = ADIMLAR.indexOf(a);
  return ADIMLAR[Math.min(ADIMLAR.length - 1, i + 1)];
}

/** Oyuncak adımı: üç oyuncak sepette ve kemik Kino'da mı */
export function oyuncakBittiMi(sepette: number, kemikAlindi: boolean, toplam = 3): boolean {
  return sepette >= toplam && kemikAlindi;
}

/** Bekleme süresine göre yardım basamağı: 0 yok, 1 ipucu eli, 2 cümle tekrarı, 3 kendiliğinden */
export function yardimBasamagi(gecenMs: number, olcek = 1): 0 | 1 | 2 | 3 {
  if (gecenMs >= YARDIM_MS[2] * olcek) return 3;
  if (gecenMs >= YARDIM_MS[1] * olcek) return 2;
  if (gecenMs >= YARDIM_MS[0] * olcek) return 1;
  return 0;
}

/** Yastık / battaniye sahibi: yanlış yatağa bırakılan eşya geri seker */
export type Sahip = 'mino' | 'kino';
export const dogruYatakMi = (esyaSahibi: Sahip, yatak: Sahip | null) => yatak === esyaSahibi;
