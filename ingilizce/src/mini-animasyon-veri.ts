/**
 * Mini animasyonlar · DOM'suz veri (22 Kasım 2026, Barış: "bu animasyonlar gibi küçük animasyonlar yap sen de arada …
 * bizim stilde güzel durur, mantığı anla"). Mantık: tek karakter + tek eşya + küçük bir sürpriz; 2–3 saniyelik, başa
 * dönen, yazısız bir şaka. Bakınca sözcüğün anlamı kendiliğinden anlaşılır.
 *
 * Bir animasyon = Astra'nın dört pozu (aynı tuval, aynı taban çizgisi, aynı baş ölçüsü, şeffaf zemin):
 *   0 başlangıç · 1 hazırlık · 2 sürpriz anı · 3 tepki  →  assets/ingilizce/mini/<id>-<0..3>.webp
 * Hareketi biz kurarız: pozlar sırayla gösterilir, her poza geçişte bir "yay" (CSS esnetme, sekme, yaylanma …) çalar.
 * Kodla çizim yok. Şeffaf video yok (iOS'ta güvenilmez). Siparişi: CLAUDE-ASTRA-MESAJLAR.md · Paket 30.
 */

/** Poza geçişte çalan küçük hareket (mini-animasyon.css · .ing-ma-yay-<ad>) */
export type Yay = 'yok' | 'esne' | 'sek' | 'yaylan' | 'titre' | 'egil';

export interface MiniKare {
  /** bu pozda kalma süresi (ms) */
  ms: number;
  /** poza geçerken çalan hareket */
  yay: Yay;
}

export interface MiniAnimasyon {
  id: string;
  /** pozlardaki karakter (onaylı kadro) */
  kim: 'kino' | 'lokum' | 'mino' | 'bulut' | 'zipzip' | 'polly' | 'mila' | 'pamuk';
  /** anlattığı kelimeler (Kelime.id): kelime dersinde ilk tanıtımda ve Kelimelerim'de bunların yerine oynar */
  kelimeler: readonly string[];
  /** dokununca Polly'nin söylediği kayıtlar */
  ses: readonly string[];
  /** dört poz */
  kareler: readonly [MiniKare, MiniKare, MiniKare, MiniKare];
  /** tur bitince başa dönmeden önce ilk pozda bekleme (ms) */
  ara: number;
}

/**
 * Pilot altı animasyon (Paket 30) ve sonraki altı (Paket 33). Sıra ders sonu kutlamasının dönme sırasıdır.
 * Pozu gelmeyen animasyon hiçbir yerde görünmez; çizim gelince kendiliğinden açılır.
 */
export const MINI_ANIMASYONLAR: readonly MiniAnimasyon[] = [
  {
    // Hava · rain: Kino şemsiyeyi açar, şemsiyeye iri bir damla "tık" diye düşer, Kino yukarı bakıp güler
    id: 'semsiye', kim: 'kino', kelimeler: ['rain'], ses: ['en/w-rain'],
    kareler: [{ ms: 650, yay: 'yok' }, { ms: 520, yay: 'yaylan' }, { ms: 420, yay: 'sek' }, { ms: 950, yay: 'esne' }], ara: 900,
  },
  {
    // Meyve · apple: Mino elmayı tutar, kocaman bir ısırık alır, yanakları şişer, elmada ısırık izi
    id: 'elma', kim: 'mino', kelimeler: ['apple'], ses: ['en/w-apple'],
    kareler: [{ ms: 600, yay: 'yok' }, { ms: 480, yay: 'esne' }, { ms: 560, yay: 'sek' }, { ms: 950, yay: 'yaylan' }], ara: 900,
  },
  {
    // Hava · cold: Bulut titrer, atkıyı boynuna dolar, burnundan minik bir buhar bulutu, rahatlar
    id: 'soguk', kim: 'bulut', kelimeler: ['cold'], ses: ['en/w-cold'],
    kareler: [{ ms: 700, yay: 'titre' }, { ms: 560, yay: 'yaylan' }, { ms: 520, yay: 'esne' }, { ms: 950, yay: 'yaylan' }], ara: 900,
  },
  {
    // Şekil ve Boy · big / small: Zıpzıp balonu şişirir, balon kocaman olur, sonra söner ve elinde minicik kalır
    id: 'balon', kim: 'zipzip', kelimeler: ['big', 'small'], ses: ['en/w-big', 'en/w-small'],
    kareler: [{ ms: 560, yay: 'yaylan' }, { ms: 700, yay: 'esne' }, { ms: 420, yay: 'titre' }, { ms: 950, yay: 'sek' }], ara: 900,
  },
  {
    // Hareketler · sleep: Lokum (pembe tulumlu) esner, gözleri kapanır, başı yana düşer, minik bir uyku baloncuğu
    id: 'uyku', kim: 'lokum', kelimeler: ['sleep'], ses: ['en/w-sleep'],
    kareler: [{ ms: 750, yay: 'esne' }, { ms: 650, yay: 'yok' }, { ms: 600, yay: 'egil' }, { ms: 1100, yay: 'yaylan' }], ara: 1000,
  },
  {
    // hello (selam): Polly kanat sallar, şapkası kayar, kanadıyla yakalar, göz kırpar
    id: 'merhaba', kim: 'polly', kelimeler: [], ses: ['en/g-hello'],
    kareler: [{ ms: 600, yay: 'sek' }, { ms: 460, yay: 'egil' }, { ms: 460, yay: 'yaylan' }, { ms: 950, yay: 'sek' }], ara: 900,
  },
  // Paket 33 (22 Kasım 2026 gece)
  {
    // Çiftlik · cat: Pamuk yün yumağına pusar, atlar, yumak açılıp kulağına ve kuyruğuna dolanır, Pamuk gururla oturur
    id: 'yumak', kim: 'pamuk', kelimeler: ['cat'], ses: ['en/w-cat'],
    kareler: [{ ms: 600, yay: 'yok' }, { ms: 520, yay: 'esne' }, { ms: 460, yay: 'sek' }, { ms: 950, yay: 'yaylan' }], ara: 900,
  },
  {
    // Günüm · hug: Lokum yüzüstü düşmüş oyuncak Kuzu'yu görür, kaldırır, sımsıkı sarılır, Kuzu'nun kurdelesi havalanır
    id: 'sarilma', kim: 'lokum', kelimeler: ['hug'], ses: ['en/w-hug'],
    kareler: [{ ms: 620, yay: 'yok' }, { ms: 520, yay: 'egil' }, { ms: 520, yay: 'esne' }, { ms: 1000, yay: 'yaylan' }], ara: 900,
  },
  {
    // Hareketler · dance: Mila kurdeleli çubukla döner, kurdele kendine dolanır, popo üstü oturur, kahkahayla alkışlar
    id: 'dans', kim: 'mila', kelimeler: ['dance'], ses: ['en/w-dance'],
    kareler: [{ ms: 560, yay: 'sek' }, { ms: 520, yay: 'egil' }, { ms: 460, yay: 'esne' }, { ms: 950, yay: 'yaylan' }], ara: 900,
  },
  {
    // Hareketler · jump: Zıpzıp çömelir, zıplar, şapkası daha yükseğe uçar, yere iner, şapka başına oturur
    id: 'zipla', kim: 'zipzip', kelimeler: ['jump'], ses: ['en/w-jump'],
    kareler: [{ ms: 520, yay: 'esne' }, { ms: 460, yay: 'sek' }, { ms: 520, yay: 'yok' }, { ms: 950, yay: 'esne' }], ara: 900,
  },
  {
    // Günüm · read: Polly kitabı ters tutar (kapaktaki elmanın sapı aşağıda), şaşırır, çevirir, keyifle okur
    id: 'kitap', kim: 'polly', kelimeler: ['read'], ses: ['en/w-read'],
    kareler: [{ ms: 650, yay: 'yok' }, { ms: 560, yay: 'egil' }, { ms: 460, yay: 'sek' }, { ms: 950, yay: 'yaylan' }], ara: 900,
  },
  {
    // Duygular · happy: Kino hediye kutusunu sallar, kapak fırlar, kırmızı top zıplar, Kino kollarını açıp sevinir
    id: 'hediye', kim: 'kino', kelimeler: ['happy'], ses: ['en/w-happy'],
    kareler: [{ ms: 600, yay: 'titre' }, { ms: 460, yay: 'esne' }, { ms: 480, yay: 'sek' }, { ms: 950, yay: 'yaylan' }], ara: 900,
  },
];

/** Görünür kaldıkça kaç tur döner; sonra ilk pozda durur (dokununca bir tur daha) */
export const TUR_SAYISI = 3;

export const pozYolu = (a: Pick<MiniAnimasyon, 'id'>, n: number) => `mini/${a.id}-${n}`;
export const turSuresi = (a: MiniAnimasyon) => a.kareler.reduce((t, k) => t + k.ms, 0);

/** Kelimenin animasyonu (yoksa undefined) */
export const kelimeninAnimasyonu = (kelimeId: string) => MINI_ANIMASYONLAR.find((a) => a.kelimeler.includes(kelimeId));

/**
 * Ders sonu kutlaması için animasyon: hazır olanlardan, bu derste oynamamış ve bir önceki kutlamada gösterilmemiş olan;
 * sıra listeden döner (her seferinde başka biri). Hiçbiri yoksa undefined.
 */
export function kutlamaAnimasyonu(hazir: (a: MiniAnimasyon) => boolean, oynayanlar: ReadonlySet<string>, son: string | null): MiniAnimasyon | undefined {
  const aday = MINI_ANIMASYONLAR.filter((a) => hazir(a) && !oynayanlar.has(a.id));
  if (!aday.length) return undefined;
  const i = MINI_ANIMASYONLAR.findIndex((a) => a.id === son);
  // sonuncunun ardından gelen ilk aday; sonuncudan başka aday yoksa o da olur
  for (let k = 1; k <= MINI_ANIMASYONLAR.length; k++) {
    const a = MINI_ANIMASYONLAR[(i + k + MINI_ANIMASYONLAR.length) % MINI_ANIMASYONLAR.length];
    if (aday.includes(a) && a.id !== son) return a;
  }
  return aday[0];
}

/** Derste aynı animasyon iki kez oynamaz: ders bağlamındaki anahtar */
export const dersAnahtari = (a: Pick<MiniAnimasyon, 'id'>) => `mini-${a.id}`;

/** Doğru cevaptan sonra kısa ödül: ilk denemede kaç doğru üst üste gelince, derste en çok kaç kez */
export const ODUL_SERISI = 3;
export const ODUL_EN_COK = 2;

/**
 * Doğru cevap ödülü (22 Kasım 2026 gece): ilk denemede ODUL_SERISI doğru üst üste gelince köşede bir tur oynar.
 * Derste en çok ODUL_EN_COK kez; bu derste oynamış olan gelmez; ders sonu kapanışına en az bir animasyon kalır.
 * Önce cevaplanan kelimenin kendi animasyonu, yoksa sıradaki.
 */
export function odulAnimasyonu(hazir: (a: MiniAnimasyon) => boolean, oynayanlar: ReadonlySet<string>, son: string | null, kelimeId: string, seri: number, verilen: number): MiniAnimasyon | undefined {
  if (seri < ODUL_SERISI || verilen >= ODUL_EN_COK) return undefined;
  const aday = MINI_ANIMASYONLAR.filter((a) => hazir(a) && !oynayanlar.has(a.id));
  if (aday.length < 2) return undefined;
  const kendi = kelimeninAnimasyonu(kelimeId);
  if (kendi && aday.includes(kendi)) return kendi;
  return kutlamaAnimasyonu(hazir, oynayanlar, son);
}
