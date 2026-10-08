/**
 * Dedektif Mino görsel yuvaları (tek liste). Eşyalar kodla çizilmez: her eşya assets/dedektif/<ad>.webp ya da
 * <ad>-<n>.webp dosyasından gelir (Gemini çizer, Adobe temizler; -1, -2 … sürüm eki: en büyük sürüm kullanılır).
 * Yeni görsel gelince yalnız dosyayı klasöre koymak yeter: Vite derlemede klasörü tarar (pasta/src/resimler.ts kalıbı).
 *
 * Bir yuvanın yedekleri olabilir: önce assets/dedektif adayları, sonra depodaki başka bir çizim (ör. zürafa
 * yerine assets/hayvanlar/zurafa). Hiçbiri yoksa: süs eşyası hiç konmaz; zorunlu eşya yerine yumuşak bir yer tutucu.
 * Gemini'ye verilecek liste: EKSIK_LISTESI (ORTAK_NOTLAR.md "Gemini – Dedektif").
 */
const DEDEKTIF = import.meta.glob<string>('../../assets/dedektif/*.webp', { eager: true, query: '?url', import: 'default' });
const BASKA = import.meta.glob<string>(
  [
    '../../assets/film/ev/{arka-uzak,arka-orta,arka-on,oda-dikey}.webp',
    '../../assets/film/mutfak/{arka-uzak,arka-orta}.webp',
    '../../assets/hayvanlar/{zurafa,ordek,kedi}.webp',
    // Vaka 2: Ada'nın balonu (kırmızı balon, CSS ile maviye döner)
    '../../assets/renkler/balon.webp',
  ],
  { eager: true, query: '?url', import: 'default' },
);
/** Vaka 2 "Kino'nun Kayıp Atkısı" çizimleri (assets/dedektif2): adlar Vaka 1'inkilerle çakışmasın diye 'v2/' önekiyle */
const DEDEKTIF2 = import.meta.glob<string>('../../assets/dedektif2/*.webp', { eager: true, query: '?url', import: 'default' });

/** Dosya yollarından ad → en yüksek sürümün adresi ("ad-3.webp" > "ad-1.webp" > "ad.webp") */
export function surumTablosu(dosyalar: Record<string, string>): Map<string, string> {
  const en = new Map<string, { n: number; url: string }>();
  for (const [yol, url] of Object.entries(dosyalar)) {
    const m = /([^/\\]+?)(?:-(\d+))?\.webp$/.exec(yol);
    if (!m) continue;
    // "roman-1" gibi sıra numaralı adlar sürüm değil: adın kendisi tabloda da durur
    const ad = m[1];
    const n = m[2] ? Number(m[2]) : 0;
    const eski = en.get(ad);
    if (!eski || n > eski.n) en.set(ad, { n, url });
    const tam = /([^/\\]+?)\.webp$/.exec(yol)?.[1];
    if (tam && tam !== ad && !en.has(tam)) en.set(tam, { n: -1, url });
  }
  return new Map([...en].map(([ad, v]) => [ad, v.url]));
}

const TABLO = surumTablosu(DEDEKTIF);
const TABLO2 = surumTablosu(DEDEKTIF2);
const baska = (yol: string) => BASKA[`../../assets/${yol}.webp`] ?? null;
/** Vaka 2 çizimi: 'v2/mandal' → assets/dedektif2/mandal.webp */
const v2 = (a: string) => (a.startsWith('v2/') ? (TABLO2.get(a.slice(3)) ?? null) : undefined);

/**
 * Yuvalar: ad → [assets/dedektif adayları, depodaki yedek (assets/ altında yol), zorunlu mu].
 * Zorunlu ve hiç görseli olmayan yuva yumuşak yer tutucuyla gösterilir.
 */
export const YUVA: Record<string, { adaylar: string[]; yedek?: string; zorunlu: boolean }> = {
  // sahneler
  koridor: { adaylar: ['koridor'], zorunlu: true },
  'yatak-odasi': { adaylar: ['yatak-odasi'], zorunlu: true },
  // yatağın önü (Pamuk arkasında saklanır): yatak-odasi resminden yatağın kendi çizgisiyle kesilmiş saydam katman
  'yatak-on': { adaylar: ['yatak-on'], zorunlu: false },
  // eşyalar
  masa: { adaylar: ['masa', 'calisma-masasi'], zorunlu: true },
  kalemlik: { adaylar: ['kalemlik-devrik', 'kalemlik'], zorunlu: false },
  'lamba-dik': { adaylar: ['lamba-dik'], zorunlu: true },
  'lamba-devrik': { adaylar: ['lamba-devrik'], zorunlu: true },
  sosis: { adaylar: ['sosis'], zorunlu: false },
  buyutec: { adaylar: ['buyutec'], zorunlu: false },
  kapak: { adaylar: ['kapak'], zorunlu: false },
  // ipuçları
  'ipucu-kedi-pati-hali': { adaylar: ['ipucu-kedi-pati-hali'], zorunlu: true },
  'ipucu-beyaz-tuy': { adaylar: ['ipucu-beyaz-tuy'], zorunlu: true },
  'ipucu-sari-kanat-tozu': { adaylar: ['ipucu-sari-kanat-tozu'], zorunlu: true },
  'ipucu-kopek-pati': { adaylar: ['ipucu-kopek-pati'], zorunlu: true },
  // kartlar
  'kart-zurafa-ayagi': { adaylar: ['kart-zurafa-ayagi'], zorunlu: true },
  'kart-ordek-ayagi': { adaylar: ['kart-ordek-ayagi'], zorunlu: true },
  'kart-kedi-pati-izi': { adaylar: ['kart-kedi-pati-izi'], zorunlu: true },
  'kart-kedi-turuncu': { adaylar: ['kart-kedi-turuncu'], zorunlu: true },
  'kart-kedi-siyah': { adaylar: ['kart-kedi-siyah'], zorunlu: true },
  'kart-kedi-beyaz': { adaylar: ['kart-kedi-beyaz'], zorunlu: true },
  'kart-sut-kasesi': { adaylar: ['kart-sut-kasesi'], zorunlu: true },
  'kart-yastik': { adaylar: ['kart-yastik'], zorunlu: true },
  'kart-sari-kelebek': { adaylar: ['kart-sari-kelebek'], zorunlu: true },
  // cevap kartları (Recraft, Minkino stili): gri kedi (Halka 1), beyaz kedinin üç sahnesi (Halka 3)
  'kart-kedi-gri': { adaylar: ['kart-kedi-gri'], yedek: 'hayvanlar/kedi', zorunlu: true },
  'kart-kedi-kelebek': { adaylar: ['kart-kedi-kelebek'], zorunlu: true },
  'kart-kedi-sut': { adaylar: ['kart-kedi-sut'], zorunlu: true },
  'kart-kedi-uyku': { adaylar: ['kart-kedi-uyku'], zorunlu: true },
  // kartın içinden çıkan hayvanlar (yanlış kart kendini anlatır)
  zurafa: { adaylar: ['zurafa'], yedek: 'hayvanlar/zurafa', zorunlu: false },
  ordek: { adaylar: ['ordek'], yedek: 'hayvanlar/ordek', zorunlu: false },
  // Pamuk'un tek resmi (çizgi roman yedeği; asıl Pamuk iskelet: assets/karakter-iskelet/pamuk)
  'pamuk-b': { adaylar: ['pamuk-b', 'pamuk'], zorunlu: true },
  // poz ekleri (Gemini, şeffaf): hikâyenin birkaç anında iskeletin yerine kısa süre (poz.ts); yoksa iskelet kalır
  'poz-kino-kayma': { adaylar: ['poz-kino-kayma'], zorunlu: false },
  'poz-kino-utanc': { adaylar: ['poz-kino-utanc'], zorunlu: false },
  'poz-mino-rahat': { adaylar: ['poz-mino-rahat'], zorunlu: false },
  'poz-pamuk-surunme': { adaylar: ['poz-pamuk-surunme'], zorunlu: false },
  'poz-pamuk-ozur': { adaylar: ['poz-pamuk-ozur'], zorunlu: false },
  'poz-pamuk-el-salla': { adaylar: ['poz-pamuk-el-salla'], zorunlu: false },
  // çizgi roman kareleri (Gemini, aynı stil, 4:3); yoksa sahne çizimlerinden kurulur
  'roman-1': { adaylar: ['roman-1'], zorunlu: false },
  'roman-2': { adaylar: ['roman-2'], zorunlu: false },
  'roman-3': { adaylar: ['roman-3'], zorunlu: false },
  'roman-4': { adaylar: ['roman-4'], zorunlu: false },
  // Vaka 2 poz ekleri (assets/dedektif2): Kino üzgün (atkısız) ve sarılan; Vakvak Anne gagasında atkıyla
  'poz-kino-uzgun': { adaylar: ['v2/kino-uzgun'], zorunlu: true },
  'poz-kino-sarilma': { adaylar: ['v2/kino-sarilma'], zorunlu: true },
  'poz-ordek-atki': { adaylar: ['v2/ordek-atki-gaga'], zorunlu: true },
  'poz-ordek-kulucka': { adaylar: ['v2/ordek-kulucka'], zorunlu: true },
  balon: { adaylar: [], yedek: 'renkler/balon', zorunlu: true },
};

/** Adaylardan ilk bulunan görselin adresi; yoksa yedek; o da yoksa null. 'v2/ad': Vaka 2 çizimi (assets/dedektif2). */
export function resim(ad: string, tablo: Map<string, string> = TABLO): string | null {
  const y = YUVA[ad];
  for (const a of y?.adaylar ?? [ad]) {
    const u = v2(a) ?? tablo.get(a);
    if (u) return u;
  }
  return y?.yedek ? baska(y.yedek) : null;
}

/** Vaka 2'nin bütün çizim adları (birim testi: her kullanılan ad bir dosya) */
export const VAKA2_RESIMLERI = [...TABLO2.keys()];

/** Çalışma odası ve mutfak katmanları (film arka planları) */
export const filmKatmani = (oda: 'ev' | 'mutfak', ad: 'arka-uzak' | 'arka-orta' | 'arka-on' | 'oda-dikey') => baska(`film/${oda}/${ad}`) ?? '';

/** Henüz kendi dosyası olmayan (yedekle ya da yer tutucuyla duran) yuvalar */
export function eksikler(tablo: Map<string, string> = TABLO): string[] {
  return Object.entries(YUVA)
    .filter(([, y]) => !y.adaylar.some((a) => (a.startsWith('v2/') ? TABLO2.has(a.slice(3)) : tablo.has(a))))
    .map(([ad]) => ad);
}

/**
 * Gemini'ye verilecek eksik çizim listesi (ORTAK_NOTLAR.md "Gemini – Dedektif" ile aynı): dosya adı → ne.
 * Hepsi beyaz zeminde tek nesne, Mino stili (parlak 2D çizgi film, sıcak koyu kahve kontur, yumuşak gölge).
 */
export const EKSIK_LISTESI: Record<string, string> = {
  masa: 'çalışma masası (ahşap, önden ve hafif yukarıdan; üst yüzü düz ve boş, dört ayaklı; yatay ~3:2)',
  'kalemlik-devrik': 'masada devrilmiş kalemlik ve etrafa dökülmüş 4-5 renkli kalem (yatay, alçak)',
  sosis: 'tek pembe sosis (Kino\'nun sabah atıştırması), hafif kıvrık',
  buyutec: 'el büyüteci: pirinç halka, koyu ahşap sap, cam içi BOŞ ve şeffaf olacak (Adobe camı siler); dik',
  kapak: 'ana menü kartı: dedektif şapkalı Mino büyüteçle bakıyor, yanında devrik mavi lamba ve beyaz kedi Pamuk saklanıyor (yatay 4:3)',
  'roman-1': 'çizgi roman karesi 1: halıda bir kedi pati izi, üstünde büyüteç (4:3)',
  'roman-2': 'çizgi roman karesi 2: beyaz kedi Pamuk masaya zıplıyor (4:3)',
  'roman-3': 'çizgi roman karesi 3: Pamuk kelebeği kovalarken mavi masa lambası devriliyor (4:3)',
  'roman-4': 'çizgi roman karesi 4: Pamuk yatağın altından utangaç bakıyor, kuyruğu dışarıda (4:3)',
};
