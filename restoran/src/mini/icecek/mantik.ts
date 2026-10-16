/**
 * ÇALKALA VE DOLDUR (ayran, limonata) mini oyununun saf kuralları (DOM yok; tests/unit/restoran-mini-p3.test.ts).
 * RESTORAN.md §8 M12. Sürahiye ne konduğu içeceği belirler: yoğurt → ayran, limon suyu → limonata, ikisi birden →
 * "limonlu ayran" (tuhaf ama içilir; Tuhaf Teyze bayılır). Kapaklı çalkalayınca köpük olur; kapaksız çalkalarsan
 * fışkırır. 3-4: bardak dolum çizgisinde kendiliğinden durur; 5-6: kendisi durdurur, taşarsa tezgâha yayılır.
 */
import type { Malzeme, MalzemeDurumu, Yas, YemekOzelligi } from '../arayuz';

/** sürahide (birim: kaşık / döküş) */
export interface Icerik {
  yogurt: number;
  su: number;
  limon: number;
  seker: number;
  tuz: number;
}
export const bosIcerik = (): Icerik => ({ yogurt: 0, su: 0, limon: 0, seker: 0, tuz: 0 });

/** sürahi seviyesine katkı (sürahi = 1) */
const HACIM = { yogurt: 0.13, su: 0.16, limon: 0.05, seker: 0, tuz: 0 } as const;
export const seviye = (i: Icerik) => Math.min(1.2, i.yogurt * HACIM.yogurt + i.su * HACIM.su + i.limon * HACIM.limon);

export type Icecek = 'ayran' | 'limonata' | 'karisik' | 'su' | 'bos';
export function icecekTuru(i: Icerik): Icecek {
  if (seviye(i) <= 0.001) return 'bos';
  if (i.yogurt > 0 && i.limon > 0) return 'karisik';
  if (i.yogurt > 0) return 'ayran';
  if (i.limon > 0) return 'limonata';
  return 'su';
}

/** çalkalama: karışma ve köpük (yoğurtlu içecek çok köpürür) */
export const CALKALA = { karisim: 0.14, kopukAyran: 0.13, kopukDiger: 0.04 } as const;
export function calkala(d: { karisim: number; kopuk: number }, i: Icerik) {
  if (seviye(i) <= 0.02) return;
  d.karisim = Math.min(1, d.karisim + CALKALA.karisim);
  d.kopuk = Math.min(1, d.kopuk + (i.yogurt > 0 ? CALKALA.kopukAyran : CALKALA.kopukDiger));
}

/** kapaksız çalkalama: fışkırır, sürahinin bu kadarı gider */
export const FISKIRMA = 0.3;
export function fiskir(i: Icerik) {
  for (const k of ['yogurt', 'su', 'limon', 'seker', 'tuz'] as const) i[k] = i[k] * (1 - FISKIRMA);
}

/** bardak: dolum çizgisi ve saniyede dolma */
export const BARDAK = { cizgi: 0.85, hiz: 0.42, sinir: 1.25 } as const;
/** sürahinin bir bardaklık kısmı (bardak dolunca sürahiden bu kadar seviye gider) */
export const BARDAK_SURAHI = 0.55;

export interface Bardak {
  dolum: number;
  /** bardağa dökülenlerin toplamı (sürahi birimi) */
  icerik: Icerik;
  kopuk: number;
  karisim: number;
  buz: number;
  tasan: number;
}
export const bosBardak = (): Bardak => ({ dolum: 0, icerik: bosIcerik(), kopuk: 0, karisim: 0, buz: 0, tasan: 0 });

/**
 * dt saniye dök: sürahiden bardağa. 3-4 çizgide durur (true döner: durdu). 5-6 çizgiyi geçer, 1'in üstü taşar.
 * Döndürür: { durdu, tasti (bu adımda taşan) }
 */
export function dok(s: Icerik, sd: { kopuk: number; karisim: number }, b: Bardak, dt: number, yas: Yas): { durdu: boolean; tasti: number } {
  const sv = seviye(s);
  if (sv <= 0.001) return { durdu: true, tasti: 0 };
  const ust = yas === 'kucuk' ? BARDAK.cizgi : BARDAK.sinir;
  if (b.dolum >= ust) return { durdu: true, tasti: 0 };
  let artis = Math.min(BARDAK.hiz * dt, ust - b.dolum, (sv / BARDAK_SURAHI) * 1);
  if (artis <= 0) return { durdu: true, tasti: 0 };
  // sürahiden giden pay (oranlar korunur)
  const pay = Math.min(1, (artis * BARDAK_SURAHI) / sv);
  const onceDolum = b.dolum;
  for (const k of ['yogurt', 'su', 'limon', 'seker', 'tuz'] as const) {
    const x = s[k] * pay;
    s[k] -= x;
    b.icerik[k] += x;
  }
  b.kopuk = Math.max(b.kopuk, sd.kopuk);
  b.karisim = onceDolum + artis > 0 ? (b.karisim * onceDolum + sd.karisim * artis) / (onceDolum + artis) : sd.karisim;
  b.dolum += artis;
  let tasti = 0;
  if (b.dolum > 1) {
    tasti = b.dolum - 1;
    b.tasan += tasti;
    b.dolum = 1;
    artis = 0;
  }
  return { durdu: yas === 'kucuk' && b.dolum >= BARDAK.cizgi - 1e-6, tasti };
}

/** limon yarısı: daire başına sıkılan (2 tur = bitti), bir yarım 2 birim su verir */
export const LIMON = { tur: Math.PI * 2 * 2, su: 2, cekirdek: 3 } as const;

const duzey = (x: number) => (x <= 0.05 ? 0 : x < 1.2 ? 1 : x < 2.5 ? 2 : 3);

export function icecekOzeti(b: Bardak): YemekOzelligi {
  const i = b.icerik;
  const malzemeler: Partial<Record<Malzeme, MalzemeDurumu>> = {};
  if (i.yogurt > 0.05) malzemeler.yogurt = { adet: Math.max(1, Math.round(i.yogurt)) };
  if (i.limon > 0.05) malzemeler.limon = { adet: Math.max(1, Math.round(i.limon / LIMON.su)) };
  if (i.seker > 0.05) malzemeler.seker = { adet: Math.max(1, Math.round(i.seker)) };
  if (i.tuz > 0.05) malzemeler.tuz = { adet: Math.max(1, Math.round(i.tuz)) };
  return {
    malzemeler,
    tuz: duzey(i.tuz * 1.2),
    eksi: duzey(i.limon / 1.5),
    tatli: duzey(i.seker * 1.2),
    dolum: Math.min(1, b.dolum),
    karisim: b.karisim,
    sicak: false,
    porsiyon: b.dolum < 0.45 ? 'az' : b.tasan > 0.05 || b.dolum >= 0.98 ? 'kocaman' : 'normal',
  };
}
