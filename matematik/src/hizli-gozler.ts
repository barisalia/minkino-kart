// Sayı masası · "Hızlı Gözler" (anlık sayılama): nesneler bir an görünür, saklanır; çocuk kaç tane gördüğünü rakamdan seçer.
// DOM'suz yardımcılar (birim testleri buradan sınar). Tur numaraları 16 ve 17 (tur-sirasi.ts): ikincisi biraz daha hızlı ve büyük.
export type HgYol = 'minik' | 'dort' | 'bes';
export type Dizilis = 'zar' | 'sira' | 'iki-sira' | 'daginik' | 'beslik';
export type Soru = { adet: number; dizilis: Dizilis; nesne: string; sure: number; secenek: number[] };

/** Hızlı Gözler tur numaraları (Sayı masası). */
export const HIZLI_TURLAR = [16, 17] as const;
export const hizliMi = (n: number) => (HIZLI_TURLAR as readonly number[]).includes(n);

/** Görünen nesneler: Matematik'in kendi çizimleri (çilek yok). */
export const HG_NESNELER = ['elma', 'boncuk', 'armut', 'daire', 'tas', 'kare-sari', 'ucgen-yesil'] as const;

/** Sorudaki adetler (yaş · tur). 2–3 yaş 1–3, 4 yaş 1–5, 5+ 1–10; art arda aynı adet yok. */
const ADETLER: Record<HgYol, Record<number, number[]>> = {
  minik: { 16: [2, 1, 3], 17: [3, 1, 2] },
  dort: { 16: [3, 5, 2, 4], 17: [4, 2, 5, 3] },
  bes: { 16: [4, 7, 3, 6], 17: [8, 5, 10, 9] },
};
/** Gösterim süresi (ms): küçükte uzun, büyükte kısa; ikinci tur daha hızlı. */
const SURE: Record<HgYol, Record<number, number>> = {
  minik: { 16: 2200, 17: 1900 },
  dort: { 16: 1500, 17: 1300 },
  bes: { 16: 1200, 17: 950 },
};
/** Yanlıştan sonra bir kez daha, daha uzun gösterilir. */
export const YENIDEN_KAT = 1.8;
export const enBuyuk = (yol: HgYol) => (yol === 'minik' ? 3 : yol === 'dort' ? 5 : 10);

/** Turun kendi adetleri; yeniden oynayışta (tekrar) sıra kayar, sorular aynı kalmaz. */
export function hizliAdetler(yol: HgYol, n: number, tekrar = 0): number[] {
  const liste = ADETLER[yol][n] ?? ADETLER[yol][16];
  const kay = tekrar % liste.length;
  return [...liste.slice(kay), ...liste.slice(0, kay)];
}
/** Bir turun soruları. `sira` verilirse (akıllı tekrarın öne aldığı adetler) o adetlerle kurulur. */
export function hizliSorular(yol: HgYol, n: number, tekrar = 0, sira?: readonly number[]): Soru[] {
  const adetler = sira?.length ? [...sira] : hizliAdetler(yol, n, tekrar);
  return adetler.map((adet, i) => ({
    adet,
    dizilis: dizilisSec(adet, i + tekrar),
    nesne: HG_NESNELER[(n + i * 2 + tekrar) % HG_NESNELER.length],
    sure: SURE[yol][n] ?? SURE[yol][16],
    secenek: secenekler(yol, adet, i + tekrar),
  }));
}

/** 5'ten büyük adet her zaman beşlik (5 + kalan) dizilir; küçüklerde zar, sıra, iki sıra ve dağınık sırayla değişir. */
export function dizilisSec(adet: number, i: number): Dizilis {
  if (adet > 5) return 'beslik';
  const sira: Dizilis[] = ['zar', 'daginik', 'sira', 'iki-sira'];
  for (let k = 0; k < sira.length; k++) {
    const d = sira[(i + k) % sira.length];
    if (d === 'iki-sira' && (adet % 2 || adet < 4)) continue;
    if (d === 'sira' && adet < 2) continue;
    return d;
  }
  return 'zar';
}

/** Seçilecek rakamlar: 2–3 yaşta iki, sonra üç ardışık rakam; doğru olan her seferinde başka yerde. */
export function secenekler(yol: HgYol, adet: number, i: number): number[] {
  const ust = enBuyuk(yol), say = yol === 'minik' ? 2 : 3;
  let bas = adet - (i % say);
  bas = Math.max(1, Math.min(bas, ust - say + 1));
  return Array.from({ length: say }, (_, j) => bas + j);
}

/** Nesnenin genişliği (kutu eninin oranı): az nesne büyük görünür, kalabalık dizilişte küçülür. */
// Az nesne tahtayı doldursun (1–3'te eskisinin ~1,6–1,8 katı): 2–3 yaşta bir bakışta görmek kolaylaşır.
export const nesneBoyu = (adet: number) => ([0, 0.34, 0.32, 0.3][adet] ?? (adet <= 5 ? 0.16 : 0.135));
/** Nesnelerin yeri (kutunun 0–1 ölçüsünde, merkezler). */
export type Yer = { x: number; y: number };
const ZAR: Record<number, Yer[]> = (() => {
  const g = (c: number, r: number): Yer => ({ x: [0.3, 0.5, 0.7][c], y: [0.2, 0.5, 0.8][r] });
  return {
    1: [g(1, 1)],
    // Büyük nesneler: köşegen ortaya yakın.
    2: [{ x: 0.35, y: 0.38 }, { x: 0.65, y: 0.62 }],
    3: [{ x: 0.22, y: 0.32 }, g(1, 1), { x: 0.78, y: 0.68 }],
    4: [g(0, 0), g(2, 0), g(0, 2), g(2, 2)],
    5: [g(0, 0), g(2, 0), g(1, 1), g(0, 2), g(2, 2)],
    6: [g(0, 0), g(0, 1), g(0, 2), g(2, 0), g(2, 1), g(2, 2)],
  };
})();
/** Elle yerleştirilmiş dağınık dizilişler (birbirine değmez, kutudan taşmaz). */
const DAGINIK: Record<number, Yer[]> = {
  1: [{ x: 0.46, y: 0.46 }],
  2: [{ x: 0.32, y: 0.36 }, { x: 0.66, y: 0.62 }],
  3: [{ x: 0.2, y: 0.62 }, { x: 0.5, y: 0.36 }, { x: 0.8, y: 0.64 }],
  4: [{ x: 0.2, y: 0.3 }, { x: 0.46, y: 0.72 }, { x: 0.62, y: 0.26 }, { x: 0.82, y: 0.68 }],
  5: [{ x: 0.16, y: 0.62 }, { x: 0.34, y: 0.24 }, { x: 0.52, y: 0.7 }, { x: 0.68, y: 0.28 }, { x: 0.85, y: 0.66 }],
};
export function yerlesim(dizilis: Dizilis, adet: number, tohum = 0): Yer[] {
  if (dizilis === 'zar' && ZAR[adet]) return ZAR[adet];
  if (dizilis === 'daginik' && DAGINIK[adet]) {
    // Yeniden oynayışta ayna: aynı adet başka biçimde görünür.
    return tohum % 2 ? DAGINIK[adet].map((p) => ({ x: 1 - p.x, y: p.y })) : DAGINIK[adet];
  }
  if (dizilis === 'iki-sira') {
    const yarim = adet / 2;
    return Array.from({ length: adet }, (_, j) => ({ x: 0.5 + ((j % yarim) - (yarim - 1) / 2) * 0.17, y: j < yarim ? 0.28 : 0.72 }));
  }
  if (dizilis === 'beslik') {
    // Beşlik çerçeve: üstte beş, altta kalan, soldan (5 + kalan bir bakışta görülür).
    return Array.from({ length: adet }, (_, j) => ({ x: 0.5 + ((j % 5) - 2) * 0.16, y: j < 5 ? 0.28 : 0.72 }));
  }
  // Tek sıra: aralık nesnenin boyuna göre (birbirine değmez)
  const aralik = nesneBoyu(adet) + 0.02;
  return Array.from({ length: adet }, (_, j) => ({ x: 0.5 + (j - (adet - 1) / 2) * aralik, y: 0.5 }));
}

/**
 * Doğru cevaptan sonra nesneler kendini sayar. Beşlikte üst sıra birlikte "beş" der, kalanlar "altı, yedi…" diye sürer
 * (üstüne sayma; tek tek on saymaktan kısa). Dönen dizi: her adımda zıplayan nesnelerin sırası ve söylenen sayı.
 */
export function kendiniSay(dizilis: Dizilis, adet: number): { nesneler: number[]; sayi: number }[] {
  if (dizilis === 'beslik' && adet > 5) {
    return [{ nesneler: [0, 1, 2, 3, 4], sayi: 5 }, ...Array.from({ length: adet - 5 }, (_, j) => ({ nesneler: [5 + j], sayi: 6 + j }))];
  }
  return Array.from({ length: adet }, (_, j) => ({ nesneler: [j], sayi: j + 1 }));
}
