// Akıllı tekrar (yol haritası adım 2): çocuğun takıldığı sayılar yaşın kendi defterine yazılır; Sayı masasının sonraki
// Hızlı Gözler turlarında bu sayılar öne alınır, bilinen sayılar seyrekleşir. Yanlıştan sonra iki kez doğru bilinen sayı
// defterden düşer. Tur ve soru sayısı değişmez; bir turda aynı sayı iki kez sorulmaz.
// Yazanlar: Hızlı Gözler'deki yanlış seçim, boncuk sayma turunda yanlış onay. Okuyan: veli sayfası ("Biraz daha tekrar").
// Sayının dışındaki konular (yönetici 20 Kasım, madde 5) ayrı bir defterde: Şekiller, Örüntü ve Ölçü derslerindeki ilk yanlış,
// Baba'nın Takım Çantası'nda yanlış kutu. Aynı kural: yanlıştan sonra iki kez ilk denemede doğru, konu defterden düşer.

export type TekrarYolu = 'minik' | 'dort' | 'bes';
/** Bir sayının izi: y = yanlış sayısı, d = son yanlıştan sonraki doğrular, s = son yanlışın sırası (yeniden eskiye). */
export type Iz = { y: number; d: number; s: number };
export type Defter = Record<string, Iz>;

/** Yanlıştan sonra bu kadar doğru: sayı öğrenildi, defterden düşer. */
export const OGRENILDI = 2;
/** Bir turda öne alınan en çok sayı (kalan sorular turun kendi sayıları). */
export const EN_COK_ONE = 2;
export const defterAnahtari = (yol: TekrarYolu) => 'minkino-matematik-tekrar-' + yol + '-v1';

const temiz = (d: unknown): Defter => {
  const sonuc: Defter = {};
  if (!d || typeof d !== 'object') return sonuc;
  for (const [k, v] of Object.entries(d as Record<string, Partial<Iz>>)) {
    const n = Number(k);
    if (!Number.isInteger(n) || n < 0 || n > 20 || !v || typeof v !== 'object') continue;
    const y = Number(v.y), dd = Number(v.d), s = Number(v.s);
    if (y > 0) sonuc[k] = { y, d: dd >= 0 ? dd : 0, s: s >= 0 ? s : 0 };
  }
  return sonuc;
};

export function yanlisYaz(d: Defter, sayi: number | string): Defter {
  const sira = Math.max(0, ...Object.values(d).map((i) => i.s)) + 1;
  const eski = d[sayi];
  return { ...d, [sayi]: { y: (eski?.y ?? 0) + 1, d: 0, s: sira } };
}
export function dogruYaz(d: Defter, sayi: number | string): Defter {
  const eski = d[sayi];
  if (!eski) return d;
  const yeni = { ...d };
  if (eski.d + 1 >= OGRENILDI) delete yeni[sayi];
  else yeni[sayi] = { ...eski, d: eski.d + 1 };
  return yeni;
}
/** Defterin anahtarları: en son takıldığı önce. */
const sonTakilanOnce = (d: Defter) => Object.entries(d).sort((a, b) => b[1].s - a[1].s).map(([k]) => k);
/** Zorlanılan sayılar: en son takıldığı önce. */
export const zorlananSayilar = (d: Defter): number[] => sonTakilanOnce(d).map(Number);

/**
 * Turun adetleri, zorlanılan sayılar öne alınmış hâlde: ilk soru ısınma (turun kendi sayısı), hemen ardından yaşın
 * aralığındaki (1…ust) en çok EN_COK_ONE zor sayı gelir; tur zaten içeriyorsa yalnız öne taşınır. Uzunluk değişmez,
 * sayılar tekrarlanmaz, kalan sıra korunur.
 */
export function oneAl(adetler: readonly number[], zor: readonly number[], ust: number): number[] {
  const one = zor.filter((n) => n >= 1 && n <= ust).slice(0, Math.min(EN_COK_ONE, adetler.length - 1));
  if (!one.length) return [...adetler];
  const kalan = adetler.filter((n) => !one.includes(n));
  return [kalan[0], ...one, ...kalan.slice(1)].slice(0, adetler.length);
}

// Tarayıcıda: yaşın defteri localStorage'da (erişilemezse sessizce boş).
export function defterOku(yol: TekrarYolu): Defter {
  try { return temiz(JSON.parse(localStorage.getItem(defterAnahtari(yol)) || 'null')); } catch { return {}; }
}
function defterYaz(yol: TekrarYolu, d: Defter) {
  try { localStorage.setItem(defterAnahtari(yol), JSON.stringify(d)); } catch { /* özel pencere */ }
}
export const zorlandi = (yol: TekrarYolu, sayi: number) => defterYaz(yol, yanlisYaz(defterOku(yol), sayi));
export const basardi = (yol: TekrarYolu, sayi: number) => {
  const d = defterOku(yol);
  if (d[sayi]) defterYaz(yol, dogruYaz(d, sayi));
};
export const zorlananlar = (yol: TekrarYolu) => zorlananSayilar(defterOku(yol));

// ----- Konu defteri: Şekiller, Örüntü, Ölçü, sınıflama, konum (anahtar "alan:konu", ör. sekil:kare, olcu:uzun-kisa,
// konum:arkasinda; Saklambaç 22 Kasım) -----
export type TekrarAlani = 'sekil' | 'oruntu' | 'olcu' | 'siniflama' | 'konum';
export type ZorKonu = { alan: TekrarAlani; konu: string };
export const konuDefteriAnahtari = (yol: TekrarYolu) => 'minkino-matematik-konu-tekrar-' + yol + '-v1';
const KONU = /^(sekil|oruntu|olcu|siniflama|konum):[a-z-]{1,24}$/;
const konuTemiz = (d: unknown): Defter => {
  const sonuc: Defter = {};
  if (!d || typeof d !== 'object') return sonuc;
  for (const [k, v] of Object.entries(d as Record<string, Partial<Iz>>)) {
    if (!KONU.test(k) || !v || typeof v !== 'object') continue;
    const y = Number(v.y), dd = Number(v.d), s = Number(v.s);
    if (y > 0) sonuc[k] = { y, d: dd >= 0 ? dd : 0, s: s >= 0 ? s : 0 };
  }
  return sonuc;
};
/** Zorlanılan konular, en son takıldığı önce (veli sayfası en çok altısını gösterir). */
export const zorKonuListesi = (d: Defter): ZorKonu[] =>
  sonTakilanOnce(d).map((k) => { const i = k.indexOf(':'); return { alan: k.slice(0, i) as TekrarAlani, konu: k.slice(i + 1) }; });
export function konuDefteriOku(yol: TekrarYolu): Defter {
  try { return konuTemiz(JSON.parse(localStorage.getItem(konuDefteriAnahtari(yol)) || 'null')); } catch { return {}; }
}
function konuDefteriYaz(yol: TekrarYolu, d: Defter) {
  try { localStorage.setItem(konuDefteriAnahtari(yol), JSON.stringify(d)); } catch { /* özel pencere */ }
}
const konuAnahtari = (alan: TekrarAlani, konu: string) => (KONU.test(alan + ':' + konu) ? alan + ':' + konu : '');
export const konudaZorlandi = (yol: TekrarYolu, alan: TekrarAlani, konu: string) => {
  const a = konuAnahtari(alan, konu);
  if (a) konuDefteriYaz(yol, yanlisYaz(konuDefteriOku(yol), a));
};
export const konudaBasardi = (yol: TekrarYolu, alan: TekrarAlani, konu: string) => {
  const a = konuAnahtari(alan, konu), d = konuDefteriOku(yol);
  if (a && d[a]) konuDefteriYaz(yol, dogruYaz(d, a));
};
export const zorKonular = (yol: TekrarYolu) => zorKonuListesi(konuDefteriOku(yol));
