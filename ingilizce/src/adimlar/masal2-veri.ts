/**
 * Masal 2.0 (22 Kasım 2026) · DOM'suz veri: sayfalar, dokunulacak yerler, geçişler, ses listesi.
 *
 * Neden: Barış masalı zayıf buldu: "önce güzel bir hikâye, sonra oyun". Masal altı sayfalık gerçek bir hikâyedir
 * (mekân → karşılaşma → aksilik → çocuğun dokunarak yardım ettiği an → çözüm → kapanış). Polly her sayfayı kısa bir
 * cümleyle anlatır; sayfanın canlı yeri hafifçe parlar, çocuk dokununca o yer canlanır (ineğe dokun → Moo!). Ana
 * dokunuştan sonra ileri düğmesi çıkar. Göl sayfasında iki adımlı an: göle dokun → ördek fırlar ama başında muz (şaka);
 * ördeğe dokun → ördek dalıp şapkayla çıkar. Masal bitince Masal Oyunu (masal-oyun.ts, soru kümesi `gol`).
 *
 * Çizimler (Astra, Paket 31): `masal2/<ad>-1…6`, `-4b`, `-saka`; 1600 × 1200. Kutular gerçek çizimde ölçüldü (22 Kasım
 * 13:20, %100 boy), çocuk parmağı için birkaç piksel geniş tutuldu. gol-2 14:29'da yeniden çizildi (inek ayakta, başı kalkık): ineğin kutusu
 * yeni çizime göre (x 820–1450, y 518–980) yeniden ölçüldü. Kod çizimi kırpmaz: canlanma sahnenin o noktaya
 * doğru kısa bir yaklaşması, parıltı halkası ve sestir.
 */
import type { SesMetni } from '../icerik';

/** Tuvaldeki kutu, piksel: sol, üst, genişlik, yükseklik (1600 × 1200) */
export type Kutu = readonly [number, number, number, number];
export const M2_TUVAL = { en: 1600, boy: 1200 } as const;

/** Dokunuşta sahnenin yaptığı: yaklaşıp sekme, rüzgârda sallanma, suya sıçrama */
export type Canlanma = 'sek' | 'ruzgar' | 'sicra';

export interface Dokunus {
  id: string;
  kutu: Kutu;
  /** dokununca sırayla çalınanlar (efekt ve Polly) */
  sesler: readonly string[];
  canlanma: Canlanma;
  /** sayfanın ana dokunuşu: ileri düğmesi bundan sonra çıkar, ipucu eli bunu gösterir */
  ana?: true;
  /** dokununca sahne başka bir çizime geçer (göl → şaka → ördek); geçişten sonra o çizimin dokunuşları geçerlidir */
  gecis?: string;
  /**
   * çocuk dokunmadan, önceki ses bitince kendiliğinden canlanır (22 Kasım tempo: muz şakasının ardından ördek hemen şapkayla
   * çıkar; son sayfada Kino kendiliğinden el sallar)
   */
  oto?: true;
  /**
   * dokunulan şeyin İngilizce adı (kelime kimliği): dokununca önce adı söylenir ("cow"), sözcük sahnede o şeyin üstünde kısa
   * bir an parlar (22 Kasım akşam, yönetici: "sözcükler oyunun parçası olsun")
   */
  kelime?: string;
  /** yakın an (C "sinema anı"): hikâyenin doruğunda kamera sayfanın içine dalar, karakterler ekranı doldurur, sonra çekilir */
  yakin?: true;
  /** dokununca hemen çalan kod efekti (Web Audio): kabarcık "pop", kaçış "fırt", suya düşüş "şıp" */
  kodEfekt?: 'pop' | 'firt' | 'sip';
}

/** Kamera: sahnenin hangi noktası ortada (tuval pikseli) ve ne kadar yakın (1 = sahne ekranı tam kaplar) */
export interface Kamera { x: number; y: number; yakin: number }

/**
 * Ayrı çizilmiş katman (karakter ya da eşya; şeffaf zeminli). Sahnenin üstünde kendi kutusunda durur, küçük canlılık
 * verir: nefes (göğüs hafifçe kalkar), sallanma, göz kırpma (`goz`: aynı katmanın gözü kapalı karesi).
 */
export interface Katman {
  id: string;
  resim: string;
  kutu: Kutu;
  canlilik?: 'nefes' | 'sallan';
  goz?: string;
  /** yalnız bu çizim ekrandayken görünür (ör. şapka katmanı ancak şapkalı ördek sudan çıkınca, gagasında) */
  cizimde?: string;
}

/** "Hangisi?": Polly sorar ("Where is the duck?"), sayfanın yerleri eşit parlar, çocuk doğrusuna dokunur */
export interface Sec { soru: string; dogru: string }
/** "Söyle, olsun": çocuk sözcüğü söyler (söz tanıma; yedek yıldız), söyleyince `hedef` yeri canlanır */
export interface Soyle { kelime: string; hedef: string }
/** "Sürükle": çocuk `nesne` katmanını `hedef` kutusuna taşır, bırakınca `sonra` yeri canlanır */
export interface Surukle { nesne: string; hedef: Kutu; sonra: string }

/**
 * Sayfanın sırayla oynanan etkileşimleri (Masal 2.0 v2, 22 Kasım gecesi; göl masalının güçlü hâli). Verilirse sayfa bu
 * listeyi baştan sona oynatır, sonra ileri çıkar; verilmezse eski tek etkileşim (sec / soyle / surukle / ana yer).
 *   - dokun: o yer parlar, çocuk dokununca yer canlanır (geçişi varsa resim değişir).
 *   - yakala: kaçan hedef; katman her dokunuşta `kacis`taki bir sonraki noktaya "fırt" diye kaçar, son dokunuşta
 *     `dusme` noktasına düşer ve `sonra` yeri canlanır (ör. şapka göle düşer).
 *   - evethayir: `soru` çalar (ör. Kino: "Is this my hat?"), sahnede iki büyük düğme: Yes / No. Doğruya `sonra` yeri
 *     canlanır; yanlışa ceza yok, komik karşılık (`yanlisSes`, düğme jöle gibi esner) ve soru yinelenir.
 *   - soyle: çocuk sözcüğü söyler (söz tanıma; yedek yıldız). `kelime` bir kelime kimliği ya da "yes" / "no". `onceki`
 *     varsa önce o çalar (ör. Kino'nun sorusu) ve "Say it!" denmez; çocuk kalıbı yakalamıştır.
 *   - surukle: katman hedef kutuya taşınır, sonra yer canlanır.
 *   - hepsi: listedeki yerlerin hepsine (sırası serbest) dokunulunca biter.
 */
export type Etkilesim =
  | { tip: 'dokun'; yer: string }
  | { tip: 'yakala'; nesne: string; kacis: readonly (readonly [number, number])[]; dusme: readonly [number, number]; sonra: string }
  | { tip: 'evethayir'; soru: string; dogru: 'yes' | 'no'; sonra: string; yanlisSes?: string }
  | { tip: 'soyle'; kelime: string; hedef: string; onceki?: string }
  | { tip: 'surukle'; nesne: string; hedef: Kutu; sonra: string }
  | { tip: 'hepsi'; yerler: readonly string[] };

export interface Masal2Sayfa {
  resim: string;
  en: string;
  tr: string;
  ses: string;
  dokunuslar: readonly Dokunus[];
  /** geçişle gelen çizimlerin dokunuşları (çizim adı → dokunuşlar) */
  sonraki?: Readonly<Record<string, readonly Dokunus[]>>;
  /** Masal Oyunu'nun ipucunda gösterilecek çizim (göl sayfasında ördekli hâli) */
  ipucuResmi?: string;
  /** kamera: cümle okunurken `bas`'tan `son`'a yavaşça kayar (verilmezse sahnenin tamamı, hafif yaklaşma) */
  kamera?: { bas: Kamera; son?: Kamera };
  /** ayrı çizilmiş, canlılık veren katmanlar (fonun üstünde) */
  katmanlar?: readonly Katman[];
  /** sayfanın etkileşimi dokunmak değilse: seç, söyle ya da sürükle (her sayfada en az bir etkileşim) */
  sec?: Sec;
  soyle?: Soyle;
  surukle?: Surukle;
  /** sırayla oynanan etkileşimler (verilirse sec / soyle / surukle / ana yerin yerine geçer) */
  etkilesimler?: readonly Etkilesim[];
}

export interface Masal2 {
  ad: 'gol' | 'kumsal' | 'gol2';
  /** hangi adanın kitabı yerine açılır */
  uniteId: string;
  en: string;
  tr: string;
  /** Masal Kitaplığı'ndaki kapak (yoksa adanın eski kitabının kapağı) */
  kapak?: string;
  giris: SesMetni;
  sayfalar: readonly Masal2Sayfa[];
  metinler: readonly SesMetni[];
}

const hece = (s: string) => (s.toLowerCase().match(/[aeiouy]+/g) ?? []).length || 1;
const polly = (id: string, metin: string): SesMetni => ({ id, kim: 'polly', dil: 'en', metin, hece: hece(metin) });
const ceren = (id: string, metin: string): SesMetni => ({ id, kim: 'ceren', dil: 'tr', metin, hece: (metin.toLocaleLowerCase('tr').match(/[aeıioöuü]/g) ?? []).length });

const P = {
  s1: polly('en/g-gol-1', 'This is Kino. Kino has a big blue hat.'),
  d1: polly('en/g-gol-1-sapka', 'A big blue hat!'),
  s2: polly('en/g-gol-2', 'Kino sees a big cow.'),
  d2: polly('en/g-gol-2-inek', 'Moo! Hello, cow!'),
  s3: polly('en/g-gol-3', 'Whoosh! The wind blows.'),
  d3: polly('en/g-gol-3-sapka', "Oh no! Kino's hat!"),
  s4: polly('en/g-gol-4', 'Splash! The hat falls in the lake. Where is it?'),
  d4saka: polly('en/g-gol-4-saka', 'A duck! With a banana? Silly duck!'),
  d4ordek: polly('en/g-gol-4-ordek', "Look! The duck has Kino's hat!"),
  s5: polly('en/g-gol-5', 'The duck gives the hat to Kino.'),
  d5: polly('en/g-gol-5-ordek', 'Thank you, duck!'),
  s6: polly('en/g-gol-6', 'Kino, the cow and the duck are friends.'),
  d6: polly('en/g-gol-6-kino', 'Bye-bye, friends!'),
} as const;

const giris = ceren('tr/c-gol-giris', 'Şimdi Kino göle gidiyor. Masalı dinle, parlayan yerlere dokun; bak neler olacak!');

export const GOL_MASALI: Masal2 = {
  ad: 'gol',
  uniteId: 'ciftlik',
  en: 'Kino at the Lake',
  tr: 'Kino Gölde',
  giris,
  sayfalar: [
    {
      resim: 'masal2/gol-1', en: P.s1.metin, tr: "Bu Kino. Kino'nun kocaman mavi bir şapkası var.", ses: P.s1.id,
      // kamera Kino'ya yakından başlar, okunurken şapkaya doğru süzülür
      kamera: { bas: { x: 720, y: 600, yakin: 1.15 }, son: { x: 720, y: 470, yakin: 1.3 } },
      dokunuslar: [{ id: 'sapka', kutu: [540, 175, 380, 215], sesler: [P.d1.id], canlanma: 'sek', ana: true, kelime: 'hat' }],
    },
    {
      resim: 'masal2/gol-2', en: P.s2.metin, tr: 'Kino kocaman bir inek görüyor.', ses: P.s2.id,
      kamera: { bas: { x: 800, y: 650, yakin: 1.05 }, son: { x: 1050, y: 720, yakin: 1.2 } },
      // söyle: çocuk "cow" deyince inek möö der (yedek yıldız)
      soyle: { kelime: 'cow', hedef: 'inek' },
      dokunuslar: [{ id: 'inek', kutu: [815, 510, 650, 480], sesler: ['efekt/cow', P.d2.id], canlanma: 'sek', ana: true, kelime: 'cow' }],
    },
    {
      resim: 'masal2/gol-3', en: P.s3.metin, tr: 'Vuuu! Rüzgâr esiyor.', ses: P.s3.id,
      // kamera Kino'dan uçan şapkaya kayar
      kamera: { bas: { x: 650, y: 650, yakin: 1.1 }, son: { x: 1150, y: 450, yakin: 1.2 } },
      dokunuslar: [{ id: 'sapka', kutu: [1075, 270, 290, 215], sesler: [P.d3.id], canlanma: 'ruzgar', ana: true, kelime: 'hat' }],
    },
    {
      resim: 'masal2/gol-4', en: P.s4.metin, tr: 'Şıp! Şapka göle düşüyor. Nerede şapka?', ses: P.s4.id,
      kamera: { bas: { x: 800, y: 650, yakin: 1 }, son: { x: 880, y: 760, yakin: 1.12 } },
      // göl: Kino'nun durduğu kıyının sağı, suyun tamamı
      dokunuslar: [{ id: 'gol', kutu: [400, 500, 1200, 640], sesler: ['efekt/duck', P.d4saka.id], canlanma: 'sicra', ana: true, gecis: 'masal2/gol-saka' }],
      sonraki: {
        'masal2/gol-saka': [{ id: 'ordek', kutu: [720, 545, 300, 330], sesler: [P.d4ordek.id], canlanma: 'sicra', ana: true, gecis: 'masal2/gol-4b', oto: true, kelime: 'hat', yakin: true }],
        'masal2/gol-4b': [{ id: 'ordek', kutu: [740, 540, 260, 330], sesler: ['efekt/duck', 'en/w-hat'], canlanma: 'sek' }],
      },
      ipucuResmi: 'masal2/gol-4b',
    },
    {
      resim: 'masal2/gol-5', en: P.s5.metin, tr: 'Ördek şapkayı Kino\'ya veriyor.', ses: P.s5.id,
      dokunuslar: [
        // doruk: ördek şapkayı Kino'ya uzatıyor (yakın an)
        { id: 'ordek', kutu: [955, 640, 250, 370], sesler: ['efekt/duck', P.d5.id], canlanma: 'sek', ana: true, kelime: 'duck', yakin: true },
        { id: 'sapka', kutu: [800, 690, 185, 130], sesler: [], canlanma: 'sek', kelime: 'hat' },
      ],
    },
    {
      resim: 'masal2/gol-6', en: P.s6.metin, tr: 'Kino, inek ve ördek artık arkadaş.', ses: P.s6.id,
      kamera: { bas: { x: 800, y: 650, yakin: 1 }, son: { x: 850, y: 700, yakin: 1.1 } },
      // seç: "Where is the duck?" çocuk ördeği bulur (inek yanlıştır, adını söyler); sonra Kino kendiliğinden el sallar
      sec: { soru: 'en/q-duck', dogru: 'ordek' },
      // ördek ineğin ayaklarının önünde: önce o denetlenir (sıra önemli)
      dokunuslar: [
        { id: 'ordek', kutu: [805, 850, 150, 205], sesler: ['efekt/duck'], canlanma: 'sek', kelime: 'duck' },
        { id: 'inek', kutu: [770, 465, 660, 530], sesler: ['efekt/cow'], canlanma: 'sek', kelime: 'cow' },
        { id: 'kino', kutu: [315, 335, 440, 700], sesler: [P.d6.id], canlanma: 'sek', ana: true, oto: true },
      ],
    },
  ],
  metinler: [giris, ...Object.values(P)],
};

/**
 * Masal C · "Lokum at the Beach" (Renkler adası; 22 Kasım 2026, Paket 37). Kahraman Lokum (küçük beyaz köpek, pembe tulum).
 * Mekân kumsal: Lokum sarı kovasıyla kumdan kale yapar, dalga kaleyi yıkar, kumun altından bir yengeç çıkar: başında Lokum'un
 * kovası (şaka), sonra kovayı kaldırıp yardıma gelir; birlikte yeni kale yaparlar, yengeç tepesine deniz yıldızı koyar.
 * Sonda şaka: yengeç kovayı Lokum'un başına geçirir ("Peekaboo! Where is Lokum?"). Cümleler kısa ve gerçek (Barış'ın kuralı).
 */
const K = {
  s1: polly('en/g-kumsal-1', 'This is Lokum. Lokum is at the beach.'),
  d1: polly('en/g-kumsal-1-kova', 'A yellow bucket!'),
  s2: polly('en/g-kumsal-2', 'Lokum makes a sand castle.'),
  d2: polly('en/g-kumsal-2-kale', 'Wow! A big castle!'),
  s3: polly('en/g-kumsal-3', 'Look! A big wave!'),
  d3: polly('en/g-kumsal-3-dalga', 'Splash! Oh no!'),
  s4: polly('en/g-kumsal-4', 'The castle is gone. Lokum is sad.'),
  d4saka: polly('en/g-kumsal-4-saka', 'A crab! In a bucket? Silly crab!'),
  d4yengec: polly('en/g-kumsal-4-yengec', 'The crab wants to help!'),
  s5: polly('en/g-kumsal-5', 'Lokum and the crab make a new castle.'),
  d5: polly('en/g-kumsal-5-yengec', 'Snip, snap! Good job, crab!'),
  s6: polly('en/g-kumsal-6', 'Lokum has a new friend.'),
  d6: polly('en/g-kumsal-6-saka', 'Peekaboo! Where is Lokum?'),
} as const;

const kumsalGiris = ceren('tr/c-kumsal-giris', 'Şimdi Lokum kumsala gidiyor. Masalı dinle, parlayan yerlere dokun!');

export const KUMSAL_MASALI: Masal2 = {
  ad: 'kumsal',
  uniteId: 'renkler',
  en: 'Lokum at the Beach',
  tr: 'Lokum Kumsalda',
  kapak: 'masal2/kumsal-kapak',
  giris: kumsalGiris,
  sayfalar: [
    {
      resim: 'masal2/kumsal-1', en: K.s1.metin, tr: 'Bu Lokum. Lokum kumsalda.', ses: K.s1.id,
      dokunuslar: [
        { id: 'kova', kutu: [800, 540, 280, 280], sesler: [K.d1.id], canlanma: 'sek', ana: true },
        { id: 'gunes', kutu: [1230, 40, 300, 280], sesler: ['en/w-sun'], canlanma: 'sek' },
      ],
    },
    {
      resim: 'masal2/kumsal-2', en: K.s2.metin, tr: 'Lokum kumdan bir kale yapıyor.', ses: K.s2.id,
      dokunuslar: [{ id: 'kale', kutu: [800, 360, 520, 620], sesler: [K.d2.id], canlanma: 'sek', ana: true }],
    },
    {
      resim: 'masal2/kumsal-3', en: K.s3.metin, tr: 'Bak! Kocaman bir dalga!', ses: K.s3.id,
      dokunuslar: [{ id: 'dalga', kutu: [880, 180, 720, 740], sesler: [K.d3.id], canlanma: 'sicra', ana: true }],
    },
    {
      resim: 'masal2/kumsal-4', en: K.s4.metin, tr: 'Kale gitti. Lokum üzgün.', ses: K.s4.id,
      // kalenin yerindeki ıslak kum tepeciği (üstünde baş aşağı sarı kova, kabarcıklar): dokununca kovanın altından yengeç çıkar
      dokunuslar: [{ id: 'kum', kutu: [630, 580, 460, 400], sesler: [K.d4saka.id], canlanma: 'sicra', ana: true, gecis: 'masal2/kumsal-saka' }],
      sonraki: {
        'masal2/kumsal-saka': [{ id: 'yengec', kutu: [680, 540, 400, 420], sesler: [K.d4yengec.id], canlanma: 'sek', ana: true, gecis: 'masal2/kumsal-4b', oto: true }],
        'masal2/kumsal-4b': [{ id: 'yengec', kutu: [680, 540, 400, 420], sesler: ['en/w-crab'], canlanma: 'sek' }],
      },
      ipucuResmi: 'masal2/kumsal-4b',
    },
    {
      resim: 'masal2/kumsal-5', en: K.s5.metin, tr: 'Lokum ve yengeç yeni bir kale yapıyor.', ses: K.s5.id,
      // sürükle: deniz yıldızı kumda ayrı bir katman; çocuk onu kalenin en yüksek kulesine taşır, "starfish!" (sonra yengeç)
      katmanlar: [{ id: 'yildiz', resim: 'masal2/kumsal-yildiz', kutu: [1180, 860, 130, 120], canlilik: 'sallan' }],
      surukle: { nesne: 'yildiz', hedef: [850, 280, 160, 150], sonra: 'yildiz' },
      dokunuslar: [
        { id: 'yengec', kutu: [1130, 730, 340, 270], sesler: [K.d5.id], canlanma: 'sek', ana: true },
        { id: 'yildiz', kutu: [850, 280, 160, 150], sesler: [], canlanma: 'sek', kelime: 'starfish' },
      ],
    },
    {
      resim: 'masal2/kumsal-6', en: K.s6.metin, tr: "Lokum'un yeni bir arkadaşı var.", ses: K.s6.id,
      // son sayfa beklemez: yengeç kendiliğinden kovayı Lokum'un başına geçirir (sondaki şaka)
      dokunuslar: [{ id: 'yengec', kutu: [880, 760, 290, 240], sesler: [K.d6.id], canlanma: 'sek', ana: true, gecis: 'masal2/kumsal-6b', oto: true }],
      sonraki: { 'masal2/kumsal-6b': [] },
    },
  ],
  metinler: [kumsalGiris, ...Object.values(K)],
};

/**
 * Masal A v2 · "Kino at the Lake", güçlü hâli (22 Kasım gecesi, yönetici onaylı; ayrıntı ekip/ingilizce/MASAL-GOL-V2.md).
 * Dert: rüzgâr Kino'nun en sevdiği mavi şapkayı göle uçurur. Merak: gölde kabarcıklar. Komik kalıp üç kez: "Is this my
 * hat?" (muzlu ördek, yapraklı kurbağa, şapkalı ördek); ikinci kezde çocuk "No!"yu kendisi söyler. Sonda herkesin şapkası.
 * Her sayfada katılım: dokun, söyle, yakala (kaçan şapka), seç (Yes / No), sürükle. Sayfa başına 7–10 sn.
 * Çizimler açılır kitap biçiminde (Paket Masal-K1 anahtar karesi onaylanınca parça brief'i); kutular geçicidir, çizimle
 * birlikte ölçülür. Çizim gelene kadar Çiftlik kitabı bugünkü göl masalını açar; taslak kipinde bu masal açılır.
 */
const kino = (id: string, metin: string): SesMetni => ({ id, kim: 'kino', dil: 'en', metin, hece: hece(metin) });
const G2 = {
  s1: polly('en/g-gol2-1', 'This is Kino. Kino has a blue hat.'),
  s1b: polly('en/g-gol2-1b', 'He loves his hat!'),
  s2: polly('en/g-gol2-2', 'Kino walks to the lake. Look! A cow!'),
  s2b: polly('en/g-gol2-2b', 'Hello, cow!'),
  s3: polly('en/g-gol2-3', 'Whoosh! The wind! Catch the hat!'),
  k3: kino('en/k-gol2-3', 'My hat!'),
  s4: polly('en/g-gol2-4', 'Look! Bubbles! Who is there?'),
  sor: kino('en/k-gol2-sor', 'Is this my hat?'),
  s4b: polly('en/g-gol2-4b', "No! It's a banana!"),
  s5: polly('en/g-gol2-5', 'More bubbles! Who is there?'),
  s5b: polly('en/g-gol2-5b', "No! It's a leaf!"),
  s6: polly('en/g-gol2-6', 'Big bubbles! Who is there?'),
  k6: kino('en/k-gol2-6', 'My hat! Yay!'),
  s6b: polly('en/g-gol2-6b', 'Yes! Thank you, duck!'),
  s7: polly('en/g-gol2-7', 'Now we all have hats!'),
} as const;
const gol2Giris = ceren('tr/c-gol2-giris', "Kino'nun çok sevdiği bir şapkası var. Bak bakalım ne olacak!");

export const GOL2_MASALI: Masal2 = {
  ad: 'gol2',
  uniteId: 'ciftlik',
  en: 'Kino at the Lake',
  tr: 'Kino Gölde',
  giris: gol2Giris,
  sayfalar: [
    {
      resim: 'masal2/gol2-1', en: G2.s1.metin, tr: "Bu Kino. Kino'nun mavi bir şapkası var.", ses: G2.s1.id,
      kamera: { bas: { x: 760, y: 560, yakin: 1.1 }, son: { x: 740, y: 420, yakin: 1.25 } },
      dokunuslar: [{ id: 'sapka', kutu: [560, 170, 360, 230], sesler: [G2.s1b.id], canlanma: 'sek', ana: true, kelime: 'hat' }],
      etkilesimler: [{ tip: 'dokun', yer: 'sapka' }],
    },
    {
      resim: 'masal2/gol2-2', en: G2.s2.metin, tr: 'Kino göle yürüyor. Bak! Bir inek!', ses: G2.s2.id,
      dokunuslar: [{ id: 'inek', kutu: [820, 500, 640, 420], sesler: ['efekt/cow', G2.s2b.id], canlanma: 'sek', kelime: 'cow' }],
      etkilesimler: [{ tip: 'soyle', kelime: 'cow', hedef: 'inek' }],
    },
    {
      resim: 'masal2/gol2-3', en: G2.s3.metin, tr: 'Vuuu! Rüzgâr! Şapkayı yakala!', ses: G2.s3.id,
      // uçan şapka ayrı katman: çocuk dokundukça kaçar, üçüncüde göle düşer (çocuk kaybetmez, düşmesi hikâyedir)
      katmanlar: [{ id: 'sapka', resim: 'masal2/gol2-sapka', kutu: [620, 170, 240, 160], canlilik: 'sallan' }],
      dokunuslar: [{ id: 'gol', kutu: [760, 620, 760, 440], sesler: [G2.k3.id], canlanma: 'sicra', kodEfekt: 'sip', gecis: 'masal2/gol2-3b' }],
      sonraki: { 'masal2/gol2-3b': [] },
      etkilesimler: [{ tip: 'yakala', nesne: 'sapka', kacis: [[1010, 290], [1260, 400]], dusme: [1120, 820], sonra: 'gol' }],
    },
    {
      resim: 'masal2/gol2-4', en: G2.s4.metin, tr: 'Bak! Kabarcıklar! Kim var orada?', ses: G2.s4.id,
      dokunuslar: [{ id: 'kabarcik', kutu: [820, 700, 300, 240], sesler: [], canlanma: 'sicra', kodEfekt: 'pop', gecis: 'masal2/gol2-4b' }],
      sonraki: { 'masal2/gol2-4b': [{ id: 'muz', kutu: [780, 480, 360, 420], sesler: ['efekt/duck', G2.s4b.id], canlanma: 'sek', kelime: 'banana' }] },
      ipucuResmi: 'masal2/gol2-4b',
      // birinci kez: muzlu ördek; çocuk "No" seçer (Yes'e ördek "vak?" der, soru yinelenir)
      etkilesimler: [{ tip: 'dokun', yer: 'kabarcik' }, { tip: 'evethayir', soru: G2.sor.id, dogru: 'no', sonra: 'muz', yanlisSes: 'efekt/duck' }],
    },
    {
      resim: 'masal2/gol2-5', en: G2.s5.metin, tr: 'Daha çok kabarcık! Kim var orada?', ses: G2.s5.id,
      dokunuslar: [{ id: 'kabarcik', kutu: [500, 700, 300, 240], sesler: [], canlanma: 'sicra', kodEfekt: 'pop', gecis: 'masal2/gol2-5b' }],
      sonraki: { 'masal2/gol2-5b': [{ id: 'yaprak', kutu: [460, 470, 400, 430], sesler: ['efekt/frog', G2.s5b.id], canlanma: 'sek', kelime: 'leaf' }] },
      // ikinci kez: çocuk kalıbı yakaladı, "No!"yu kendisi söyler
      etkilesimler: [{ tip: 'dokun', yer: 'kabarcik' }, { tip: 'soyle', kelime: 'no', hedef: 'yaprak', onceki: G2.sor.id }],
    },
    {
      resim: 'masal2/gol2-6', en: G2.s6.metin, tr: 'Kocaman kabarcıklar! Kim var orada?', ses: G2.s6.id,
      // şapka ayrı katman: şapkalı ördek sudan çıkınca gagasında görünür, çocuk onu Kino'nun başına taşır
      katmanlar: [{ id: 'sapka', resim: 'masal2/gol2-sapka', kutu: [700, 540, 200, 140], cizimde: 'masal2/gol2-6b' }],
      dokunuslar: [{ id: 'kabarcik', kutu: [820, 700, 300, 240], sesler: [], canlanma: 'sicra', kodEfekt: 'pop', gecis: 'masal2/gol2-6b' }],
      sonraki: {
        'masal2/gol2-6b': [
          // doruk: ördek şapkayı uzatıyor (yakın an)
          { id: 'ordek', kutu: [880, 480, 360, 440], sesler: ['efekt/duck'], canlanma: 'sek', kelime: 'duck', yakin: true },
          { id: 'kino', kutu: [240, 380, 400, 640], sesler: [G2.k6.id, G2.s6b.id], canlanma: 'sek', kelime: 'hat' },
        ],
      },
      ipucuResmi: 'masal2/gol2-6b',
      etkilesimler: [
        { tip: 'dokun', yer: 'kabarcik' },
        { tip: 'evethayir', soru: G2.sor.id, dogru: 'yes', sonra: 'ordek' },
        { tip: 'surukle', nesne: 'sapka', hedef: [300, 330, 280, 190], sonra: 'kino' },
      ],
    },
    {
      resim: 'masal2/gol2-7', en: G2.s7.metin, tr: 'Artık hepimizin şapkası var!', ses: G2.s7.id,
      dokunuslar: [
        { id: 'ordek', kutu: [700, 700, 220, 260], sesler: ['efekt/duck'], canlanma: 'sek', kelime: 'banana' },
        { id: 'kurbaga', kutu: [960, 720, 220, 240], sesler: ['efekt/frog'], canlanma: 'sek', kelime: 'leaf' },
        { id: 'inek', kutu: [1180, 440, 380, 460], sesler: ['efekt/cow'], canlanma: 'sek', kelime: 'cow' },
        { id: 'kino', kutu: [260, 400, 380, 620], sesler: [], canlanma: 'sek', kelime: 'hat' },
      ],
      // sonda herkesin şapkası: çocuk üç arkadaşa da dokunur (sırası serbest)
      etkilesimler: [{ tip: 'hepsi', yerler: ['ordek', 'kurbaga', 'inek'] }],
    },
  ],
  metinler: [gol2Giris, ...Object.values(G2)],
};

// sıra önemli: bir adanın birden çok masalı varsa hazır olan ilki açılır (v2 çizimleri gelince v2, gelene kadar v1)
export const MASALLAR2: readonly Masal2[] = [GOL2_MASALI, GOL_MASALI, KUMSAL_MASALI];
export const masal2Bul = (ad: string) => MASALLAR2.find((m) => m.ad === ad);
export const masal2Adadan = (uniteId: string) => MASALLAR2.find((m) => m.uniteId === uniteId);

/** Masalın bütün çizimleri (geçişle gelenler dahil) */
export const masal2Cizimleri = (m: Masal2): string[] => [...new Set(m.sayfalar.flatMap((s) => [
  s.resim, ...Object.keys(s.sonraki ?? {}), ...(s.katmanlar ?? []).flatMap((k) => [k.resim, ...(k.goz ? [k.goz] : [])]),
]))];

/** Masalın bütün sesleri: giriş, sayfa cümleleri, dokunuşların sesleri, son */
export const masal2Sesleri = (m: Masal2): string[] => [...new Set([
  m.giris.id, 'en/g-story-time', 'en/g-the-end',
  ...m.sayfalar.flatMap((s) => {
    const hepsi = [...s.dokunuslar, ...Object.values(s.sonraki ?? {}).flat()];
    return [
      s.ses, ...hepsi.flatMap((d) => [...d.sesler, ...(d.kelime ? [`en/w-${d.kelime}`] : [])]),
      ...(s.sec ? [s.sec.soru] : []),
      ...(s.soyle ? ['en/g-say-it', `en/w-${s.soyle.kelime}`, `en/w-${s.soyle.kelime}-yavas`, 'en/g-yes'] : []),
      ...(s.etkilesimler ?? []).flatMap(etkilesimSesleri),
    ];
  }),
])];

/** "yes" / "no" Polly'nin kısa sözüdür (en/g-yes, en/g-no); öbürleri kelime kayıtları (en/w-<id>, yavaşı) */
export const sozSesi = (kelime: string) => (kelime === 'yes' || kelime === 'no' ? `en/g-${kelime}` : `en/w-${kelime}`);
function etkilesimSesleri(e: Etkilesim): string[] {
  if (e.tip === 'evethayir') return [e.soru, 'en/g-yes', 'en/g-no', ...(e.yanlisSes ? [e.yanlisSes] : [])];
  if (e.tip === 'soyle') {
    const ornek = e.kelime === 'yes' || e.kelime === 'no' ? [] : [`en/w-${e.kelime}-yavas`];
    return [...(e.onceki ? [e.onceki] : ['en/g-say-it']), sozSesi(e.kelime), ...ornek, 'en/g-listen'];
  }
  return [];
}

export const masal2SesMetinleri = (): SesMetni[] => MASALLAR2.flatMap((m) => [...m.metinler]);

/** Kutunun içinde mi (tuval pikseli) */
export const kutuda = (k: Kutu, x: number, y: number) => x >= k[0] && x <= k[0] + k[2] && y >= k[1] && y <= k[1] + k[3];
