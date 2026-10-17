/**
 * Pati Dükkânı · YAYIN KAPSAMI (2026-10-18 yayını). Barış: "yeni iş yok, olan işleri düzeltip bitiriyoruz; yer tutucu
 * yayına çıkmaz."
 *
 * Yayında YALNIZ gerçek çizimi tamamlanmış içerik görünür. Hiçbir şey silinmez: gizlenenlerin kodu, içeriği ve testleri
 * yerinde durur. Gemini sayfaları gelince (ekip/illustrator/pati/pati-isle.cjs) ilgili ad buradaki listeye eklenir.
 *
 *  - hayvanlar: vitrine, mağazaya, ziyaret sahnelerine yalnız bunlar çıkar.
 *      Tarçın, Fındık: hareket + bakım + tepki sayfaları (24 poz).
 *      Pofuduk: yalnız kadro resmi (poz sayfaları yok); bütün gövde hareketi (zıplama, ezilme, titreme) kabul edildi.
 *      Pırıl: hareket sayfası (8 poz). Fıstık, Kurabiye, Limon, Tospik: GPT Image hareket sayfaları (8 poz: dur, otur,
 *      yürü, sevinç, ye, uyu, şaşır, dans; pati-isle.cjs v2-hayvan, nane zemin beyazlatılır). Bakım/tepki sayfaları yok:
 *      o pozlar en yakın poza düşer, kod bütün gövdeyle anlatır (Pofuduk gibi).
 *      Yayında ★'ı çizilmemiş ihtiyaç açılmaz (katalog.ts turBilgi: Fıstık/Kurabiye/Limon aç, Limon/Tospik susuz,
 *      Pırıl sıkılmış; ★'ları esya-2/6 sayfalarında).
 *      Diken (gece misafiri) satılmaz: Bahçe açıksa gündüz evinin önünde durur, kapanışta tabağına gelir.
 *      GİZLİ: Zümrüt, Cücük, Vakvak, Pamuk, Duman, Çikolata, Kakao, Boncuk (çizimleri yok).
 *  - koseler: salon + Recraft vektör çizimli 5 köşe (Kemirgen Rafı, Akvaryum, Kuş Köşesi, Bahçe, Sürüngen Köşesi;
 *    assets/pati/<ad>.svg). Çizimi olmayan hayvanın yuvası (Zümrüt'ün teraryumu, ikinci akvaryum …) boş habitat kalır.
 *  - esyalar: Gemini eşya sayfalarında (esya-1/3/4/5) ve v1 G4 sayfasında çizilmiş olanlar. esya-2 ve esya-6 sayfaları
 *    gelmedi: onların eşyaları (ayçekirdeği, bezelye, tırmanma dalı …) çekmecede ve mağazada görünmez.
 *  - susler: başka oyunların onaylı çizimleri (hepsi çizili).
 *
 * BAYRAK: YAYIN_KAPSAMI_ACIK = false → bütün içerik (yer tutucularla) açılır. Geliştirirken bayrağa dokunmadan
 * /pati/?tam=1 ile de bütün içerik görülür (e2e testlerinin tam oyun bölümleri böyle çalışır). Birim testleri (vitest)
 * tam içerikle çalışır; kapsamın kendisi tests/unit/pati-yayin.test.ts'te denetlenir.
 */

/** Yayın kapsamı açık mı (false: bütün içerik, yer tutucularla) */
export const YAYIN_KAPSAMI_ACIK = true;

export const YAYIN_KAPSAMI = {
  hayvanlar: ['tarcin', 'findik', 'pofuduk', 'fistik', 'kurabiye', 'piril', 'limon', 'tospik'],
  koseler: ['salon', 'kemirgen', 'akvaryum', 'kus', 'bahce', 'surungen'],
  esyalar: [
    // mama
    'kopek-mamasi', 'kedi-mamasi', 'saman', 'kemik-biskuvi', 'konserve', 'sut-kasesi', 'havuc', 'marul', 'elma', 'cilek', 'balik-yemi',
    // su
    'su-kabi', 'suluk-sisesi', 'kedi-cesmesi',
    // oyuncak
    'top', 'tuy-degnek', 'tunel', 'halat', 'yumak', 'cingirakli-top', 'frizbi', 'kemirme-cubugu', 'cark', 'hamster-topu', 'ayna', 'can', 'kus-salincagi',
    // temizlik
    'yumusak-firca', 'pati-havlusu', 'su-spreyi', 'tarak', 'islak-mendil', 'kum-banyosu', 'kabuk-fircasi', 'cam-silecek', 'kus-banyo-kabi', 'su-kovasi', 'kum-saati',
    // yatak
    'minder', 'battaniye', 'karton-kutu', 'sepet-yatak', 'kedi-iglosu', 'saman-yuvasi', 'talas-yuvasi', 'pelus-ayi', 'kafes-ortusu', 'gece-lambasi', 'muzik-kutusu', 'isi-lambasi',
    // ecza (5-6)
    'ilik-su-torbasi', 'surup-kasigi', 'yara-bandi',
  ],
  susler: ['saksi', 'saat', 'flama', 'hali', 'balon', 'resim', 'oyuncak-sepeti', 'tabure', 'muzik-kutusu'],
  /** Babaanne'nin tepsisindeki insan yemekleri: yalnız çizimi olan (börek = Babaanne kitinin börek tabağı) */
  insanYemegi: ['borek'],
} as const;

const tamIstendi = typeof location !== 'undefined' && new URLSearchParams(location.search).has('tam');
/** Birim testleri (vitest) bütün içerikle çalışır */
const birimTesti = !!(globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.VITEST;

/** Şu an yayın kapsamı uygulanıyor mu */
export const YAYIN = YAYIN_KAPSAMI_ACIK && !tamIstendi && !birimTesti;

const kume = (l: readonly string[]) => new Set<string>(l);
const HAYVAN = kume(YAYIN_KAPSAMI.hayvanlar);
const KOSE = kume(YAYIN_KAPSAMI.koseler);
const ESYA = kume(YAYIN_KAPSAMI.esyalar);
const SUS = kume(YAYIN_KAPSAMI.susler);
const INSAN = kume(YAYIN_KAPSAMI.insanYemegi);

export const hayvanKapsamda = (id: string) => !YAYIN || HAYVAN.has(id);
export const koseKapsamda = (k: string) => !YAYIN || KOSE.has(k);
export const esyaKapsamda = (id: string) => !YAYIN || ESYA.has(id);
export const susKapsamda = (id: string) => !YAYIN || SUS.has(id);
export const insanYemegiKapsamda = (id: string) => !YAYIN || INSAN.has(id);
