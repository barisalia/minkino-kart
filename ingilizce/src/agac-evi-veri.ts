/**
 * Polly'nin Yaşayan Ağaç Evi (İngilizce yol haritası #4, 21 Kasım 2026) · DOM'suz veri. Ekran: ekranlar/agac-evi.ts.
 * Her ada bitince (kelime dersleri, Seviye 1) eve bir eşya gelir; eşyanın iki durumu var. Dokununca durum değişir,
 * Polly o duruma ait kısa İngilizce cümleyi söyler; ikinci dokunuşta tersi. Puan, mağaza, satın alma yok.
 * Danışmanın listesi (ekip/antigravity/ONERI-08, bölüm 2) elden geçti: insan figürü yok (aile fotoğrafı yerine
 * anneye kart), her cümle o adanın bir kelimesini taşır, iki durumun da kendi cümlesi var.
 *
 * Çizim (Astra, İngilizce Paket 24): ağaç evinin içi 1920 × 1080 fon; her eşyanın iki durumu aynı tuvalde, tuval fonda
 * aşağıdaki dikdörtgene birebir oturur (x, y sol üst köşe; g, y genişlik ve yükseklik; fon pikseli). Duran eşyaların
 * tabanı tuvalin alt kenarındadır: raf çizgisi y 620, masa üstü y 870, döşeme y 1010.
 */
import type { SesMetni } from './icerik';

export interface Esya {
  /** eşyanın kimliği (dosya adı: agac-evi/<id>-0.webp ve -1.webp) */
  id: string;
  /** getiren ada */
  ada: string;
  tr: string;
  /** fondaki yer: sol, üst, genişlik, yükseklik (1920 × 1080 fon pikseli) */
  yer: readonly [number, number, number, number];
  /** 0: ilk durum (ev açılınca) · 1: dokununca */
  durum: readonly [string, string];
  /** Polly'nin cümlesi: [1. duruma geçerken, 0. duruma dönerken] */
  soz: readonly [string, string];
}

export const FON = { g: 1920, y: 1080 } as const;
/** Polly fonda tünekte: tuvali (iki poz aynı) */
export const POLLY_YERI = [940, 140, 280, 420] as const;

export const ESYALAR: readonly Esya[] = [
  { id: 'ahir', ada: 'ciftlik', tr: 'oyuncak ahır', yer: [40, 780, 260, 230], durum: ['kapıları kapalı', 'kapıları açık, içinden küçük bir oyuncak inek bakıyor'], soz: ['Open the barn! Hello, cow!', 'Close the barn. Bye, cow!'] },
  { id: 'renk-lambasi', ada: 'renkler', tr: 'renk lambası', yer: [1500, 440, 120, 180], durum: ['sönük, şeffaf küre', 'yanıyor: küre kırmızı, mavi ve sarı ışık saçıyor'], soz: ['Look! Red, blue and yellow!', 'Good night, red and blue!'] },
  { id: 'kup-kule', ada: 'sayilar', tr: 'sayı küpleri', yer: [1640, 420, 120, 200], durum: ['beş küp tabanda dağınık yığın', 'beş küp üst üste kule, üzerlerinde 1–5 rakamları'], soz: ['One, two, three, four, five! A tower!', 'Oops! Five blocks fall down.'] },
  { id: 'meyve-kasesi', ada: 'yiyecekler', tr: 'meyve kâsesi', yer: [1180, 910, 140, 100], durum: ['boş kâse', 'kâsede bir elma, bir muz, bir armut'], soz: ['Yummy! An apple and a banana!', 'No more bananas!'] },
  { id: 'davul', ada: 'oyuncaklar', tr: 'davul', yer: [500, 500, 110, 120], durum: ['iki baget davulun üstünde çapraz duruyor', 'bir baget davula vuruyor, üstünde iki nota uçuyor'], soz: ['Play the drum! Boom!', 'Shh! Quiet, drum.'] },
  { id: 'kart', ada: 'ailem', tr: 'anneye kart', yer: [1380, 500, 100, 120], durum: ['kapalı kart, önünde küçük kalp', 'açık kart, içinde büyük kırmızı kalp'], soz: ['Open the card! I love you, Mom!', 'Close the card for Mom.'] },
  { id: 'ayna', ada: 'yuzum', tr: 'duvar aynası', yer: [1260, 220, 160, 220], durum: ['sade ayna, hafif yansıma', 'aynada Polly’nin yüzü göz kırpıyor, köşede pırıltı'], soz: ['Look! I see my eyes.', 'Close your eyes!'] },
  { id: 'dolap', ada: 'kiyafetler', tr: 'giysi dolabı', yer: [1640, 630, 260, 380], durum: ['kapakları kapalı', 'kapaklar açık: askıda şapka, ceket ve atkı'], soz: ['Open the closet! I see a hat.', 'Close the closet. Bye, jacket!'] },
  { id: 'gece-lambasi', ada: 'odam', tr: 'gece lambası', yer: [1780, 460, 100, 160], durum: ['sönük', 'yanıyor, sıcak sarı ışık'], soz: ['Turn on the lamp!', 'Turn off the lamp. Good night!'] },
  { id: 'tren', ada: 'tasitlar', tr: 'oyuncak tren', yer: [250, 490, 230, 130], durum: ['rafta duruyor', 'bacasından buhar bulutu, tekerlekler hızlı (hareket çizgileri)'], soz: ['All aboard! Go, train!', 'Stop, train!'] },
  { id: 'muzik-kutusu', ada: 'hareketler', tr: 'müzik kutusu', yer: [620, 520, 100, 100], durum: ['kapağı kapalı', 'kapağı açık, üstünde dönen küçük bir yıldız, iki nota'], soz: ['Let’s dance!', 'Stop! Time to sleep.'] },
  { id: 'fanus', ada: 'vahsi', tr: 'balık fanusu', yer: [1225, 450, 140, 170], durum: ['turuncu balık dipte duruyor', 'balık suyun üstüne zıplamış, baloncuklar'], soz: ['Look! The fish can swim!', 'Bye, little fish!'] },
  { id: 'sepet', ada: 'meyve', tr: 'sebze sepeti', yer: [540, 880, 160, 130], durum: ['kapaklı hasır sepet, kapalı', 'kapak açık: havuç, domates ve mısır görünüyor'], soz: ['Open the basket! Carrots and corn!', 'Close the basket. Bye, carrots!'] },
  { id: 'pencere', ada: 'hava', tr: 'yuvarlak pencere', yer: [560, 140, 340, 340], durum: ['kepenkler kapalı', 'kepenkler açık: dışarıda gökkuşağı'], soz: ['Open the window! I see a rainbow!', 'Close the window. It’s cold!'] },
  { id: 'saksi', ada: 'doga', tr: 'çiçek saksısı', yer: [1040, 670, 100, 200], durum: ['yeşil kapalı tomurcuk', 'açmış kırmızı çiçek'], soz: ['Look! The flower is open!', 'Good night, flower.'] },
  { id: 'kapi', ada: 'evim', tr: 'küçük kapı', yer: [320, 650, 200, 360], durum: ['kapalı, kilitte anahtar', 'açık: dışarıda yeşil bahçe ve çiçekler'], soz: ['Turn the key. Look, the garden!', 'Close the door. Bye, garden!'] },
  { id: 'canta', ada: 'okul', tr: 'okul çantası', yer: [1480, 850, 140, 160], durum: ['kapalı çanta', 'çanta açık: kitap görünüyor'], soz: ['Open your bag! A book!', 'Close your bag.'] },
  { id: 'bulut', ada: 'duygular', tr: 'bulut yastık', yer: [720, 870, 160, 140], durum: ['pelüş bulut uykulu (gözler kapalı)', 'pelüş bulut mutlu (gözler açık, gülüyor)'], soz: ['The cloud is happy!', 'The cloud is sleepy.'] },
  { id: 'donence', ada: 'sekiller', tr: 'şekil dönencesi', yer: [260, 0, 240, 300], durum: ['tavandan sarkan daire, kare, üçgen, kalp; duruyor', 'şekiller dönüyor (hareket çizgileri)'], soz: ['Spin! Circle, square, triangle, heart!', 'Stop! Where is the heart?'] },
  { id: 'bardak', ada: 'sofra', tr: 'bardak', yer: [920, 770, 90, 100], durum: ['boş bardak', 'bardak portakal suyuyla dolu, pipet'], soz: ['A cup of juice! Yummy!', 'Drink the juice! All gone.'] },
  { id: 'salincak', ada: 'park', tr: 'ip salıncak', yer: [40, 0, 180, 560], durum: ['tavandan sarkan salıncak dimdik duruyor', 'salıncak yana savrulmuş (hareket çizgileri)'], soz: ['Swing up high! Wheee!', 'Stop the swing.'] },
  { id: 'robot', ada: 'vucudum', tr: 'oyuncak robot', yer: [1340, 790, 120, 220], durum: ['kolları aşağıda', 'kolları yukarıda'], soz: ['Robot, arms up!', 'Robot, arms down!'] },
  { id: 'saat', ada: 'gunum', tr: 'duvar saati', yer: [260, 300, 140, 140], durum: ['kadranda ay ve yıldız (gece)', 'kadranda güneş (sabah)'], soz: ['Wake up! Good morning!', 'Good night! Give me a hug.'] },
  { id: 'yildiz-fener', ada: 'sayilar2', tr: 'altın yıldız feneri', yer: [1460, 0, 180, 260], durum: ['tavandan sarkan sönük yıldız fener', 'altın sarısı parlıyor, çevresine ışık'], soz: ['Look! A gold star!', 'Bye, gold star!'] },
];

export const esyaSesi = (e: Esya, durum: 0 | 1) => `en/g-ev-${e.id}-${durum}`;
export const esyaResmi = (e: Esya, durum: 0 | 1) => `agac-evi/${e.id}-${durum}`;
export const AGAC_CIZIMLERI = ['agac-evi/fon', 'agac-evi/polly-0', 'agac-evi/polly-1'] as const;

const hece = (s: string) => (s.toLowerCase().match(/[aeiouy]+/g) ?? []).length || 1;
const polly = (id: string, metin: string): SesMetni => ({ id, kim: 'polly', dil: 'en', metin, hece: hece(metin) });

/** Ağaç evinin bütün kayıtları (her biri ayrı ElevenLabs isteği; scripts/ingilizce-ses.ts --id) */
export function agacEviSesMetinleri(): SesMetni[] {
  return [
    { id: 'tr/c-agac-giris', kim: 'ceren', dil: 'tr', metin: 'Burası Polly’nin ağaç evi! Her adayı bitirdiğinde eve yeni bir eşya gelir. Eşyalara dokun, Polly ne olduğunu söylesin.', hece: 40 },
    polly('en/g-tree-house', 'Welcome to my tree house!'),
    polly('en/g-something-new', 'Look! Something new!'),
    ...ESYALAR.flatMap((e) => [polly(esyaSesi(e, 1), e.soz[0]), polly(esyaSesi(e, 0), e.soz[1])]),
  ];
}
