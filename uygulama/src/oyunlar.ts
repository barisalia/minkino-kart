/**
 * Ana menüdeki oyun kartları. Her kart oyunun kendi görsellerinden (assets/) kurulur; yeni görsel yok.
 *
 * Şimdilik her kart oyunun ayrı sayfasına göreli bağlantıdır. Tek Minkino uygulamasına geçişte
 * bağlantı yerine her oyunun gömülebilir girişi çağrılacak: `oyunuBaslat(kok, { cikis })`
 * (örnek: pazar/src/oyun.ts); `cikis` ana menüye döner.
 */

/** Kart resmindeki bir katman: bir çizim ya da (kalem gibi) küçük bir ikon */
export interface Katman {
  /** assets/ altındaki çizim, uzantısız: 'pazar/tezgah' */
  gorsel?: string;
  /** src/ui/ikonlar.ts içindeki ikon adı */
  ikon?: 'kalem' | 'oyna' | 'sihir';
  /** Yerleşim sınıfı (uygulama.css, önek ug-k-) */
  sinif: string;
  /** Çizim beyaz kartın ya da çerçevenin içinde durur */
  cerceve?: boolean;
}

export interface OyunKarti {
  id: string;
  /** Kısa ad (büyükler için, kartın altında) */
  ad: string;
  /** Ana menü sayfasına (site kökü) göre göreli adres */
  adres: string;
  /** Kartın ana rengi */
  renk: string;
  /** Kart resminin arka planı (assets/ altında, uzantısız); yoksa CSS degrade */
  zemin?: string;
  katmanlar: Katman[];
  /** Kartın köşesindeki küçük rozet: oyunun yeni yan oyunu ya da bölümleri (ör. "Meyve Suyu") */
  rozet?: string;
}

export const OYUNLAR: OyunKarti[] = [
  {
    id: 'kartlar',
    ad: 'Kartlar',
    adres: './kartlar/',
    renk: '#FFC72C',
    rozet: 'Hafıza',
    katmanlar: [
      { gorsel: 'hayvanlar/kedi', sinif: 'ug-k-mini ug-k-mini-sol', cerceve: true },
      { gorsel: 'tasitlar/araba', sinif: 'ug-k-mini ug-k-mini-sag', cerceve: true },
      { gorsel: 'meyveler/elma', sinif: 'ug-k-mini ug-k-mini-orta', cerceve: true },
    ],
  },
  {
    id: 'pazar',
    ad: 'Mino’nun Pazarı',
    adres: './pazar/',
    renk: '#F0413F',
    zemin: 'pazar/arkaplan',
    rozet: 'Meyve Suyu',
    katmanlar: [
      { gorsel: 'pazar/tezgah', sinif: 'ug-k-tezgah' },
      { gorsel: 'pazar/sepet', sinif: 'ug-k-sepet' },
      { gorsel: 'meyveler/elma', sinif: 'ug-k-meyve ug-k-meyve-1' },
      { gorsel: 'meyveler/muz', sinif: 'ug-k-meyve ug-k-meyve-2' },
    ],
  },
  {
    id: 'canlan',
    ad: 'Çiz Canlansın',
    adres: './canlan/',
    renk: '#5DBE3F',
    zemin: 'sahne/cayir',
    rozet: 'Müzem',
    katmanlar: [
      { gorsel: 'canlan/dinozor', sinif: 'ug-k-dinozor' },
      { ikon: 'kalem', sinif: 'ug-k-kalem' },
    ],
  },
  {
    id: 'sanatci',
    ad: 'Minik Sanatçı',
    adres: './sanatci/',
    renk: '#9B5CE0',
    katmanlar: [
      { gorsel: 'sanatci/ornek-kedi-sonuc', sinif: 'ug-k-tablo', cerceve: true },
      { ikon: 'sihir', sinif: 'ug-k-sihir' },
    ],
  },
  {
    id: 'macera',
    ad: 'Sesli Maceralar',
    adres: './macera/',
    renk: '#FF7EB6',
    zemin: 'parti-sahne/oda',
    // macera açılışında üç bölüm kartı var (Doğum Günü, Ege Uyuyor, Banyo): kart doğrudan oraya gider
    // yeni bölüm (Bölüm 5, Salıncak Kimin?) rozette; macera açılışında kartı en üstte
    rozet: 'Yeni: Salıncak',
    katmanlar: [
      { gorsel: 'orman-esya/balon', sinif: 'ug-k-balon' },
      { gorsel: 'parti/pasta', sinif: 'ug-k-pasta' },
      { gorsel: 'parti/ada', sinif: 'ug-k-ada' },
    ],
  },
  {
    id: 'film',
    ad: 'Mini Filmler',
    adres: './film/',
    renk: '#3E9DF2',
    zemin: 'sahne/cayir',
    katmanlar: [
      { gorsel: 'meyveler/karpuz', sinif: 'ug-k-karpuz' },
      { ikon: 'oyna', sinif: 'ug-k-oynat' },
    ],
  },
];

/** Parallax derinliği: zemin arkada durur, katmanlar sırayla öne gelir (0 zemin … 1 en ön) */
export const derinlik = (i: number, n: number) => (n <= 1 ? 1 : 0.45 + (0.55 * i) / (n - 1));

/** Kartın kullandığı bütün çizimler (zemin dahil) */
export function kartGorselleri(k: OyunKarti): string[] {
  return [...(k.zemin ? [k.zemin] : []), ...k.katmanlar.flatMap((c) => (c.gorsel ? [c.gorsel] : []))];
}
