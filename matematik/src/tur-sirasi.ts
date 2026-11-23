// Matematik'te her oyuncağın yaşa göre tur sırası (Barış'ın ölçüsü: aynı iş iki kez olmasın, gereksiz uzamasın).
// Her sayı bir tur numarasıdır (main.ts → oyna: n); numara, turun işini ve zorluğunu seçer (aşama = n / 4).
// Kural: bir oyuncakta aynı tür en çok iki kez gelir, arka arkaya hiç gelmez. Türü az olan oyuncak bu yüzden kısa kalır.
export type Kose = 'sayi' | 'sekil' | 'olcu' | 'fener';
export type Yol = 'minik' | 'dort' | 'bes';

export const SIRALAR: Record<Yol, Record<Kose, readonly number[]>> = {
  // Sayı masasında 16 ve 17: Hızlı Gözler (anlık sayılama, hizli-gozler.ts); ilk paylaştırmadan sonra gelir.
  // 2–3 yaş: rakam yazma ve en az karşılaştırması yok; miktarlar küçük.
  minik: {
    sayi: [0, 2, 16, 4, 1, 17, 8, 5],
    sekil: [0, 2, 1, 4, 3, 6, 5, 15],
    olcu: [0, 3, 2, 4, 9, 7],
    fener: [3, 0, 10, 3, 4, 10],
  },
  dort: {
    sayi: [1, 2, 16, 3, 4, 8, 6, 7, 5, 12],
    sekil: [0, 2, 1, 4, 3, 6, 5, 8, 7, 15],
    olcu: [0, 3, 2, 8, 6, 7],
    fener: [3, 4, 10, 7, 8, 14],
  },
  bes: {
    // Ceren'in 1–10 dersinden ve on kutuluk kuleden sonra gelir: beş boncukla başlar, 10 − 4 ile biter
    // (5 boncuk · 2'şer paylaştır · hızlı gözler · 4'ü yaz · sipariş · 4 + 3 · daha hızlı gözler · 6'yı yaz ·
    // 9 boncuk ve 3'er paylaştır · 10 − 4).
    // 13: on boncuktan fazlasını geri kaydırıp sonra üç tabağa paylaştırır (sayma da paylaştırma da sayılır).
    sayi: [6, 5, 16, 7, 4, 11, 17, 10, 13, 15],
    sekil: [0, 2, 1, 4, 3, 10, 5, 12, 11, 15],
    olcu: [1, 3, 7, 12, 15, 14],
    fener: [3, 5, 10, 11, 9, 14],
  },
};

/**
 * Ek turlar (yönetici kararı 21 Kasım: oyuncak sıraları uzar; içerik paketi M14–M27, ayrı yuvaya alınan Zıpzıp ve
 * Tahterevalli). Kodları 100'den büyüktür ve eski sıranın sonuna eklenir; Şekil evinde Ay gezgininden önce gelir.
 * Çizimi ya da Ceren'in sözleri eksik ek tur sırada hiç görünmez (etkinSira; kapı ek-turlar.ts → ekAcik): sıra o kadar
 * kısa olur, çizim gelince kendiliğinden uzar. Eski turlar yerinde kalır; Zıpzıp'ın ve Tahterevalli'nin bir ara yerine
 * geçtiği eski turlar (boncukla say ve paylaştır, toplama-çıkarma, terazi) sıraya geri döndü.
 */
export const EK = {
  zipzip: 101, sandik: 102, kurabiye: 103, tren: 104, balon: 105, kek: 106, asansor: 107,
  sekilbahce: 108, resim: 109, buyuyen: 110, bayrak: 111, calgi: 112, surahi: 113, yarim: 114, gun: 115, tahterevalli: 116,
  ritim: 117, pay: 118,
  // Okul öncesinin eksik üç konusu (21 Kasım sabah): geriye sayma, simetri, veri.
  roket: 119, kelebek: 120, grafik: 121,
  // Okul öncesinin eksik iki konusu daha (22 Kasım gecesi): konum sözcükleri (Saklambaç), sıra sayıları (Kaydırak Sırası).
  saklambac: 122, kaydirak: 123,
  // 2–3 yaş yolunun en kısa oyuncağı Ölçü'ye (22 Kasım sabahı): büyüklüğe göre eşleme ve sıralama (Kino Ailesinin Sofrası).
  sofra: 124,
  // 2–3 yaş yolunda içeriği en az kalan ikinci oyuncak Fener'e: görsel bellek ve eşleme (Mila ile Pamuk'un Eş Kartları).
  eskart: 125,
  // 2–3 yaş yolunda içeriği en az kalan üçüncü oyuncak Şekil'e: şekil tanıma ve eşleme (Dede'nin Şekil Kutusu).
  kutu: 126,
} as const;
export type EkAd = keyof typeof EK;
export const ekAdi = (n: number): EkAd | undefined => (Object.keys(EK) as EkAd[]).find((a) => EK[a] === n);
/**
 * Yaşa göre ek turlar (sırayla). 2–3 yaşta Sayı masası 12, Ölçü 9 (Bütün ve Yarım 4 yaştan sonra); 4 yaşta Kurabiye yok
 * (bu yolda iki eşleme turu zaten var). Saklambaç (Şekil, konum) ve Kaydırak Sırası (Fener, sıra sayıları) her yaşta, sıranın
 * sonunda (22 Kasım gecesi); Kino Ailesinin Sofrası (Ölçü, büyüklüğe göre eşleme) her yaşta sonda (22 Kasım sabahı). Hepsi
 * açıkken Sayı 12 / 17 / 18, Şekil 12 / 15 / 15, Ölçü 10 / 11 / 13, Fener 11 / 11 / 12 (Eş Kartları her yaşta Fener'de,
 * Şekil Kutusu Şekil'de sonda).
 */
export const EK_TURLAR: Record<Yol, Record<Kose, readonly number[]>> = {
  minik: {
    sayi: [EK.sandik, EK.kurabiye, EK.tren, EK.balon],
    sekil: [EK.sekilbahce, EK.resim, EK.saklambac, EK.kutu],
    olcu: [EK.tahterevalli, EK.surahi, EK.gun, EK.sofra],
    fener: [EK.buyuyen, EK.bayrak, EK.calgi, EK.kaydirak, EK.eskart],
  },
  dort: {
    sayi: [EK.sandik, EK.zipzip, EK.tren, EK.balon, EK.kek, EK.asansor, EK.roket],
    sekil: [EK.sekilbahce, EK.resim, EK.kelebek, EK.saklambac, EK.kutu],
    olcu: [EK.tahterevalli, EK.surahi, EK.yarim, EK.gun, EK.sofra],
    fener: [EK.buyuyen, EK.bayrak, EK.calgi, EK.kaydirak, EK.eskart],
  },
  bes: {
    sayi: [EK.sandik, EK.zipzip, EK.kurabiye, EK.tren, EK.balon, EK.kek, EK.asansor, EK.roket],
    sekil: [EK.sekilbahce, EK.resim, EK.kelebek, EK.saklambac, EK.kutu],
    // 5+ yaşın eksik iki becerisi (21 Kasım): eşit paylaştırma Ölçü'de, ritmik sayma Fener'de.
    olcu: [EK.tahterevalli, EK.surahi, EK.yarim, EK.gun, EK.pay, EK.grafik, EK.sofra],
    fener: [EK.buyuyen, EK.bayrak, EK.calgi, EK.ritim, EK.kaydirak, EK.eskart],
  },
};
/** Oyuncağın oynanan sırası: eski turlar ve açık ek turlar (Şekil evinde Ay gezgini en sonda kalır). */
export function etkinSira(yol: Yol, k: Kose, acik: (n: number) => boolean = () => true): number[] {
  const eski = SIRALAR[yol][k], ek = EK_TURLAR[yol][k].filter(acik);
  return k === 'sekil' ? [...eski.slice(0, -1), ...ek, eski[eski.length - 1]] : [...eski, ...ek];
}

/** Eski düzende her oyuncak 16 turdu; eski kayıtlar bu ölçekte. */
export const ESKI_SON = 16;
/** Yeni kayıtların işareti: 3 = ek turlu sıra; 2 = ek turlardan önceki kısa sıra; işaretsiz = eski 16 turluk ölçek. */
export const KAYIT_SURUMU = 3;
/** Sürüm 2'de Zıpzıp'ın ve Tahterevalli'nin yerine geçtiği eski tur yerleri: o yerdeki yarım hareketler başka işe aitti. */
export const SURUM2_YERINE: Record<Yol, Partial<Record<Kose, number>>> = { minik: { olcu: 5 }, dort: { sayi: 9, olcu: 5 }, bes: { sayi: 8, olcu: 5 } };
/**
 * Sürüm 2 kaydının adımını etkin sıraya taşır. Eski turlar aynı sırada olduğu için çocuk aynı turdan sürer (Şekil'de Ay
 * gezgini sona kaydı). Bitirmiş çocuk ilk ek tura gelir, hatırası ve yıldızı kalır (yeni turlar ona yeni görünür).
 */
export function surum2Tasi(yol: Yol, k: Kose, adim: number, hatira: boolean, etkin: readonly number[]): { adim: number; hatira: boolean; ayniYer: boolean } {
  const eski = SIRALAR[yol][k];
  if (adim >= eski.length) {
    const ilk = etkin.findIndex((n) => n >= 100);
    return { adim: ilk === -1 ? etkin.length : ilk, hatira: true, ayniYer: false };
  }
  let say = -1;
  for (let i = 0; i < etkin.length; i++) if (etkin[i] < 100 && ++say === adim) return { adim: i, hatira, ayniYer: SURUM2_YERINE[yol][k] !== adim };
  return { adim: etkin.length, hatira: true, ayniYer: false };
}

export const yolSonu = (yol: Yol, k: Kose) => SIRALAR[yol][k].length;

/** Turun işi ("+" iki işi birlikte yapan tur: ikisine de sayılır). Şekil evinin son turu her zaman Ay gezgini (main.ts → oyna), Fener'in ilk turu örüntüdür. */
export function turTuru(k: Kose, n: number, sira?: number, son?: number): string {
  // Ek turların her biri kendi türüdür (adı).
  const ek = ekAdi(n);
  if (ek) return ek;
  if (k === 'sekil' && sira !== undefined && son !== undefined && sira === son - 1) return 'gezgin';
  if (k === 'fener' && sira === 0) return 'oruntu';
  if (k === 'sayi') {
    if (n === 16 || n === 17) return 'hizli';
    if (n === 4) return 'pazar';
    if (n === 2 || n === 5) return 'paylas';
    if (n === 9 || n === 13) return 'say+paylas';
    if ([3, 7, 10, 14].includes(n)) return 'esle';
    if ([8, 11, 12, 15].includes(n)) return 'topla-cikar';
    return 'say';
  }
  if (k === 'sekil') {
    if (n === 0) return 'tekne';
    if (n === 1 || n === 9) return 'araba';
    if (n === 4 || n === 5) return 'bina';
    if ([2, 6, 10, 14].includes(n)) return 'konum';
    if ([3, 7, 11, 15].includes(n)) return 'buyume';
    return 'oruntu';
  }
  if (k === 'olcu') {
    if ([2, 7, 11, 14].includes(n)) return 'denge';
    if ([3, 6, 9, 15].includes(n)) return 'karsilastir';
    return 'olc';
  }
  if (n === 10 || n === 14) return 'besteci';
  if ([3, 7, 11, 15].includes(n)) return 'oruntu';
  return 'hafiza';
}

/**
 * Eski (16 turluk) ya da sırası değişmiş bir kaydın adımını yeni sıraya taşır.
 * İlerleme oranı korunur; sona ulaşmış ya da sınırı aşan kayıt hatıraya geçer, çocuk takılmaz.
 */
export function adimiTasi(adim: number, hatira: boolean, eskiSon: number, yeniSon: number) {
  if (adim >= eskiSon) return { adim: yeniSon, hatira: true };
  const yeni = Math.min(yeniSon, Math.floor((adim * yeniSon) / eskiSon));
  return { adim: yeni, hatira: hatira || yeni === yeniSon };
}
