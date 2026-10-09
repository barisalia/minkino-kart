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
  ikon?: 'kalem' | 'oyna';
  /** kodla çizilen resim (oyunun kendi SVG çizimi; ör. Pasta Otobüsü'nün otobüsü) */
  kod?: 'otobus';
  /** Yerleşim sınıfı (uygulama.css, önek ug-k-) */
  sinif: string;
  /** Çizim beyaz kartın ya da çerçevenin içinde durur */
  cerceve?: boolean;
}

export interface OyunKarti {
  id: string;
  /** Kısa ad (büyükler için, kartın altında) */
  ad: string;
  /**
   * Adın baş kısmı (uzun adlı oyun: "Mino ile Kino'nun" + "Pasta Otobüsü"): kart resminin sol üstünde küçük tabela
   * olarak yazar, kartın boyu değişmez; erişilebilir ad ikisinin birleşimi.
   */
  ust?: string;
  /** Ana menü sayfasına (site kökü) göre göreli adres */
  adres: string;
  /** Kartın ana rengi */
  renk: string;
  /** Kart resminin arka planı (assets/ altında, uzantısız); yoksa CSS degrade */
  zemin?: string;
  katmanlar: Katman[];
  /** Kartın köşesindeki küçük rozet: oyunun yeni yan oyunu ya da bölümleri (ör. "Meyve Suyu") */
  rozet?: string;
  /**
   * geniş kart (otobüs yatay bir çizim): 8 kartta 3 sütunda (tablet) son sırada iki hücre, 2 ve 4 sütunda (telefon)
   * bir hücre; ızgara her ekranda boşluksuz (uygulama.css → .ug-genis, data-adet='8')
   */
  genis?: boolean;
  /** Mağaza uygulamasında gösterilmez (yalnız web sitesindeki oyunlar için; şu an yok) */
  uygulamadaYok?: boolean;
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
    ad: 'Çizgi Filmler',
    adres: './film/',
    renk: '#3E9DF2',
    // en yeni filmin kapağı (filmin kendi karesi: assets/film/kapak); yeni film gelince bu ad değişir
    zemin: 'film/kapak/kino-oyuncak',
    katmanlar: [{ ikon: 'oyna', sinif: 'ug-k-oynat' }],
  },
  {
    id: 'dedektif',
    ad: 'Dedektif Mino',
    adres: './dedektif/',
    renk: '#8a5cd6',
    // Gemini kapağı: şapkalı Mino büyüteçle, devrik mavi lamba, saklanan Pamuk
    zemin: 'dedektif/kapak',
    rozet: 'Yeni',
    katmanlar: [],
  },
  {
    id: 'giysin',
    ad: 'Kino Ne Giysin?',
    adres: './giysin/',
    renk: '#5BB8F0',
    // karlı tepeler ve kış giysileriyle Kino (ekip/giysin/kart.cjs)
    zemin: 'giysin/dis-kis-yatay',
    rozet: 'Yeni',
    katmanlar: [{ gorsel: 'giysin/kart-kino', sinif: 'ug-k-giysin' }],
  },
  {
    id: 'pasta',
    // tam ad: "Mino ile Kino'nun Pasta Otobüsü" (ekip/senaryo/mino-kino-pasta.md)
    ust: "Mino ile Kino'nun",
    ad: 'Pasta Otobüsü',
    adres: './pasta/',
    renk: '#FF6FA8',
    // parkta pembe pasta otobüsü (otobüs oyunun kendi kod çizimi: pasta/src/cizim.ts)
    zemin: 'film/park/arka-uzak',
    rozet: 'Yeni',
    genis: true,
    katmanlar: [{ kod: 'otobus', sinif: 'ug-k-otobus' }],
  },
];

/**
 * Menüde görünen kartlar (web ve uygulamada aynı kartlar; geniş Pasta hep sonda).
 * - 8 kart: telefon dikeyde 2 × 4 ve yatay telefonda 4 × 2 (Pasta bir hücre), 3 sütunda (tablet) 3 × 3 (Pasta iki hücre).
 * - 9 kart (Kino'nun Otobüsü açılınca, Pasta'dan önce): telefon dikeyde 2 × 5 (Pasta son sırada iki hücre), yatay
 *   telefonda 5 × 2 (Pasta iki hücre), 3 sütunda (tablet) 3 × 3 (Pasta bir hücre). uygulama.css → data-adet='9'.
 */
export function menuOyunlari(uygulama: boolean): OyunKarti[] {
  const hepsi = KINO_OTOBUS_MENUDE ? [...OYUNLAR.filter((k) => !k.genis), KINO_OTOBUS_KARTI, ...OYUNLAR.filter((k) => k.genis)] : OYUNLAR;
  if (!uygulama) return hepsi;
  return hepsi.filter((k) => !k.uygulamadaYok);
}

/**
 * Kino'nun Otobüsü (dondurma): Gün 1'in bütün çizimleri Gemini'den (bölüm A); Gün 2-3'ün tatları, sosları ve süsleri
 * (bölüm D) bekleniyor. Menüde görünmesi için true yapılır: kartın zemini kapak görseli (assets/kino-otobus/kapak.webp),
 * menü 9 kart ızgarasına geçer (uygulama.css → data-adet='9'; testler bayrağa göre 8 ya da 9 kart bekler).
 */
export const KINO_OTOBUS_MENUDE = false;
export const KINO_OTOBUS_KARTI: OyunKarti = {
  id: 'kino-otobus',
  ad: 'Kino’nun Otobüsü',
  adres: './kino-otobus/',
  renk: '#5FB4DC',
  // Gemini kapağı: Kino otobüsün penceresinden üç toplu dondurma uzatıyor, önde tavşan (metinsiz)
  zemin: 'kino-otobus/kapak',
  rozet: 'Yeni',
  katmanlar: [],
};

/** Parallax derinliği: zemin arkada durur, katmanlar sırayla öne gelir (0 zemin … 1 en ön) */
export const derinlik = (i: number, n: number) => (n <= 1 ? 1 : 0.45 + (0.55 * i) / (n - 1));

/** Kartın kullandığı bütün çizimler (zemin dahil) */
export function kartGorselleri(k: OyunKarti): string[] {
  return [...(k.zemin ? [k.zemin] : []), ...k.katmanlar.flatMap((c) => (c.gorsel ? [c.gorsel] : []))];
}
