/**
 * Tıkır Tıkır Lokanta · MİNİ OYUN SÖZLEŞMESİ (tek kaynak; ekip/senaryo/RESTORAN.md §10b).
 *
 * Her mini oyun (restoran/src/mini/<ad>/index.ts → `export const oyun: MiniOyun`) lokantadan BAĞIMSIZ çalışır.
 * Lokanta onu yalnız bu sözleşmeyle çağırır; mini oyun lokantanın hiçbir dosyasını import etmez (yalnız bu dosya,
 * src/ ortakları ve kendi klasörü). Böylece paralel kodcular birbirine dokunmadan çalışır.
 *
 * Kayıt: lokanta mini oyunları `import.meta.glob('./{ad}/index.ts')` ile kendisi bulur (restoran/src/mini/katalog.ts);
 * yeni mini oyun için ortak bir dosyaya satır eklemek GEREKMEZ. Klasör adı = `oyun.ad`.
 *
 * Akış:
 *   1. Çocuk lokantada bir istasyona dokunur → istasyon çerçevesi (restoran/src/istasyon/istasyon.ts) açılır:
 *      istasyonun arka planı, Mino köşesi, sol üstte geri düğmesi, sağ altta TEPSİ düğmesi hazırdır.
 *   2. Çerçeve `oyun.baslat(baglam, girdi)` çağırır. Mini oyun kendi sahnesini `baglam.kok` içine kurar.
 *   3. Mini oyun `baglam.tepsi.dinle(fn)` ile tepsi düğmesini bağlar. Çocuk tepsiye dokununca mini oyun 1 sn'lik ödül
 *      anını oynatır ve `bitti` sözünü ürünlerle çözer. Çerçeve ürünleri tepsiye koyar, `kapat()` çağırır, lokantaya döner.
 *      Az da yapsa olur, hiç yapmasa da olur (boş dizi = tepsiye bir şey gitmedi).
 *   4. İşin doğal sonu gelince (bütün dilimler kesildi) mini oyun `baglam.tepsi.hopla()` der: düğme bir kez hoplar.
 *   5. Çocuk geri düğmesine basarsa (tepsisiz çıkış) çerçeve önce `arkaPlanda?.()`, sonra `kapat()` çağırır.
 *      `arkaPlanda` bir ArkaIs dönerse (tava, kazan, fırın, fritöz) lokantada buhar / cız sesi sürer ve çocuk
 *      istasyona dönünce aynı oyun `girdi.devam = arkaIs.durum` ile yeniden başlatılır: kaldığı yerden devam.
 *
 * Kurallar (Barış): "şuna dokun" yok (Mino durumu anlatır, emir vermez; yasak sözler birim testinde), zoom yok
 * (hiçbir resim kaynak pikselinin üstünde çizilmez: src/ui/netlik.ts, NETLIK_DPR = 3), parça döndürme yok (ezilme-
 * esneme ve poz değişimi), dokunma alanı ≥ 64 css px, dokunuşa aynı karede ses + görüntü, hiçbir şey kömür olmaz.
 */

// ---------------------------------------------------------------- ortak sözlük

export type Yas = 'kucuk' | 'buyuk';

/** Malzeme kimlikleri (ASCII). Mino adını söyler: MALZEME_ADI. Yeni malzeme gerekirse buraya eklenir (ORTAK_NOTLAR'a satır). */
export const MALZEME_ADI = {
  domates: 'Domates',
  salatalik: 'Salatalık',
  sogan: 'Soğan',
  biber: 'Biber',
  maydanoz: 'Maydanoz',
  marul: 'Marul',
  havuc: 'Havuç',
  patates: 'Patates',
  limon: 'Limon',
  yumurta: 'Yumurta',
  ekmek: 'Ekmek',
  zeytin: 'Zeytin',
  zeytinyagi: 'Zeytinyağı',
  tuz: 'Tuz',
  pulbiber: 'Pul biber',
  bal: 'Bal',
  muz: 'Muz',
  cilek: 'Çilek',
  elma: 'Elma',
  kasar: 'Kaşar',
  sut: 'Süt',
  un: 'Un',
  seker: 'Şeker',
  yogurt: 'Yoğurt',
  mercimek: 'Mercimek',
  kofte: 'Köfte',
  sucuk: 'Sucuk',
  portakal: 'Portakal',
  // P6 (v1.1 tarifleri: meyve şiş, sigara böreği, sütlaç)
  kavun: 'Kavun',
  uzum: 'Üzüm',
  peynir: 'Peynir',
  yufka: 'Yufka',
  pirinc: 'Pirinç',
  tarcin: 'Tarçın',
} as const;
export type Malzeme = keyof typeof MALZEME_ADI;

/** Kesim türü (§8 M1): bütün, ikiye, iri, dilim, ince, küp, şerit, çubuk, kıyım (maydanoz), püre (aşırı kesim) */
export type Kesim = 'butun' | 'yarim' | 'iri' | 'dilim' | 'ince' | 'kup' | 'serit' | 'cubuk' | 'kiyim' | 'pure';

/** Pişme sırası: çiğ → az → altın → çıtır. Çıtır son durak; kömür YOK (§3c). */
export type Pisme = 'cig' | 'az' | 'altin' | 'citir';
export const PISME_SIRASI: readonly Pisme[] = ['cig', 'az', 'altin', 'citir'];

/** Bir malzemenin ürün içindeki hâli */
export interface MalzemeDurumu {
  /** kaç tane / kaç dilim (5-6 özel istekte sayılır) */
  adet: number;
  kesim?: Kesim;
  soyuldu?: boolean;
  temiz?: boolean;
  rende?: boolean;
}

/**
 * Ürünün / yemeğin özellik seti (§4b): müşterinin zevki buna bakar. Bilinmeyen alan boş bırakılır (yok sayılır).
 * Sayısal tat alanları: 0 yok, 1 az, 2 iyi, 3+ çok.
 */
export interface YemekOzelligi {
  malzemeler: Partial<Record<Malzeme, MalzemeDurumu>>;
  pisme?: Pisme;
  tuz?: number;
  /** pul biber */
  aci?: number;
  /** limon */
  eksi?: number;
  /** bal, şeker */
  tatli?: number;
  /** tabakta yüz yapıldı mı (iki yuvarlak + bir yay; M14) */
  yuz?: boolean;
  /** süs (garnitür) parça sayısı */
  sus?: number;
  porsiyon?: 'az' | 'normal' | 'kocaman';
  sicak?: boolean;
  /**
   * yıkandı mı (M2); undefined = yıkama istasyonu açılmamış, sorulmaz. Malzeme düzeyindeki `temiz` daha ayrıntılı;
   * müşteri ikisine birden bakar (yemekTemizligi): bir malzeme bile topraklıysa yemek topraklıdır.
   */
  temiz?: boolean;
  /** karışma oranı 0-1 (yumurta, hamur) */
  karisim?: number;
  /** dolum oranı 0-1 (bardak, kâse) */
  dolum?: number;
}

/** 5-6 yaş özel istek (§4a): sayma ya da şekil */
export interface OzelIstek {
  tur: 'adet' | 'kesim' | 'ornek';
  /** adet: { malzeme, sayi }; kesim: { malzeme, kesim }; ornek: malzeme dizisi (örüntü) */
  deger: { malzeme: Malzeme; sayi: number } | { malzeme: Malzeme; kesim: Kesim } | Malzeme[];
}

/** Tepsiye giden şey: bir kâse doğranmış sebze, bir tava menemen, bir tabak, bir bardak ayran... */
export interface Urun {
  /** benzersiz kimlik (urunId()) */
  id: string;
  /** 'dogranmis' | 'menemen' | 'pankek' | 'tabak' | 'ayran' ... */
  tur: string;
  /** mini oyun hangi yemek olduğunu biliyorsa tarif kimliği ('salata', 'menemen'); bilmiyorsa lokanta özellikten tanır */
  yemek?: string;
  ozellik: YemekOzelligi;
  /** masaya servis edilebilir mi (tabak, bardak). Kâse / tava ürünleri önce Tabakla'dan geçer. */
  servis?: boolean;
  /** Tabakla gibi birleştiren oyunlar: tepsiden kullandığı ürünlerin id'leri (lokanta onları tepsiden kaldırır) */
  kullanilan?: string[];
  /** Tabakla'da parçalara ayrılmaz, tabağa tek öbek olarak (gorsel()) konur: ızgara köfte, şiş, börek (P6) */
  butun?: boolean;
  /** Tabakla'da tabağa konan hâli (kendi tabağı / kâsesi olmadan; yoksa gorsel) */
  yemekGorsel?: () => HTMLElement;
  /** tepside ve masada gösterilecek küçük hâli. Kaynak pikselinin üstüne büyütülmez; kutusunu doldurur (100%×100%). */
  gorsel: () => HTMLElement;
}

let sayac = 0;
/** Ürün kimliği üretir */
export const urunId = (tur: string) => `${tur}-${Date.now().toString(36)}-${(sayac++).toString(36)}`;

// ---------------------------------------------------------------- lokantanın verdiği bağlam

export interface MiniGirdi {
  yas: Yas;
  /** 'salata' | 'menemen' ...; yoksa serbest (personel yemeği, deneme sayfası) */
  tarif?: string;
  /** yan rafta görünecek malzemeler (açılanlara göre, 3-8 tane) */
  malzemeler: Malzeme[];
  /** şu ana kadar hazırlananlar (ör. Tabakla tepsideki her şeyi tabağa dizer) */
  tepsi: Urun[];
  /** 5-6: özel istek */
  ozelIstek?: OzelIstek;
  /** önceki ziyarette ArkaIs.durum olarak bırakılan (tava ocakta pişmeye devam etti); yoksa baştan */
  devam?: unknown;
  /** Bulaşık (P6): lavabodaki kirli tabaklar, her biri o tabakta yenen ürünün türü ('tabak', 'corba' ...) */
  kirliTabaklar?: string[];
  /** ilk oyunun ilk iki müşterisi: ipucu merdiveni biraz erken (§4c) */
  ilkOyun?: boolean;
  /**
   * Lavabo (Yıka) açık mı (Gün 2'den; Babaanne'nin çamurlu pazar sebzeleri). true ise yıkanmamış sebze `temiz: false`
   * sayılır (Doğra'da küçük toprak lekesi, müşteride komik "toprak tadı"); undefined / false: temizlik sorulmaz.
   */
  yikama?: boolean;
  test?: boolean;
}

/** Mino'nun istasyondaki köşesi (sol altta küçük; ekran yüksekliğinin en çok %30'u) */
export type MinoTepki = 'agla' | 'tat' | 'eksi' | 'sevin' | 'sasir' | 'hapsir' | 'zipla' | 'bak';
export interface MinoKose {
  /** kısa poz/ifade (ms: süre; 'agla' kapatılana kadar sürsün istenirse ms = Infinity, sonra tepki('sevin') ya da dur()) */
  tepki(ad: MinoTepki, ms?: number): Promise<void>;
  /** sürmekte olan tepkiyi bitirir (ağlama dahil) */
  dur(): void;
  /**
   * Mino konuşur: metin content/restoran/mini-<oyun>.json'da durmalı (seslendirme oradan toplanır: restoranCumleleri).
   * Kayıt yoksa cihaz sesi / balon. "dokun", "tıkla", "bas", "sürükle", "şimdi şunu" YASAK.
   */
  soyle(metin: string): Promise<void>;
  /** Mino'nun köşedeki elemanı (tadım için kepçe ona sürüklenir) */
  el: HTMLElement;
}

/** Ortak sentez sesleri (restoran/src/sesler.ts; Web Audio, dosya yok) */
export type SesAdi =
  | 'kirt' // salatalık
  | 'slap' // domates ilk kesim
  | 'citir' // soğan kabuğu
  | 'kitir' // havuç, patates
  | 'tok' // boş tahtaya bıçak
  | 'vicik' // püre
  | 'ciz' // tavaya düşme
  | 'fokur'
  | 'pof'
  | 'tik' // yumurta 1
  | 'cat' // yumurta 2
  | 'pit' // sarısı düşer, köpük patlar
  | 'siril' // su
  | 'kopuk'
  | 'ting' // parıltı
  | 'cin' // kasa
  | 'zil' // servis zili
  | 'boing'
  | 'hop'
  | 'yanlis'; // yumuşak "hı?" (ceza değil)
export interface Sesler {
  /** tek ses; perde 1 = normal (seri kesimde hafifçe yükselt: 1, 1.06, 1.12 ...), guc 0-1 */
  cal(ad: SesAdi, s?: { perde?: number; guc?: number }): void;
  /** sürekli ses (cızırtı, fokur): durdurma fonksiyonu döner; guc sonradan ayarlanabilir */
  dongu(ad: 'ciz' | 'fokur' | 'siril'): { guc(g: number): void; dur(): void };
}

/**
 * İpucu merdiveni (§4c; çerçeve sayar, son dokunuştan itibaren): 12 sn hedef kendi kendine kıpırdar, 20 sn Mino
 * `soz`ü söyler (durum anlatır, emir değil), 30 sn hedef bir kez yumuşakça parlar, 40 sn yarı saydam minik el
 * `hareket`i bir kez gösterir. Asla: ok, sürekli parlayan hedef. Mini oyun yalnız hedefi bildirir; iş değişince
 * yeniden çağırır (merdiven baştan sayar). null: ipucu yok (ör. ödül anı).
 */
export interface IpucuHedefi {
  /** sıradaki işi bekleyen malzeme ya da araç */
  el: () => HTMLElement | null;
  /** 20 sn'deki durum sözü (mini-<oyun>.json'dan): "Domates hâlâ bütün…" */
  soz?: string;
  /** 40 sn'de minik elin göstereceği hareket */
  hareket?: 'kaydir-dik' | 'kaydir-yatay' | 'daire' | 'surukle' | 'dokun' | 'fiske';
  /** hareket 'surukle' ise elin gideceği yer */
  nereye?: () => HTMLElement | null;
}
export interface IpucuMerdiveni {
  hedef(h: IpucuHedefi | null): void;
}

/** Çerçevenin sağ alttaki tepsi düğmesi */
export interface TepsiDugmesi {
  /** çocuk tepsiye dokununca: mini oyun ödül anını oynatır ve `bitti`yi çözer */
  dinle(fn: () => void): void;
  /** işin doğal sonu: düğme bir kez hoplar */
  hopla(): void;
  /** düğmenin kendisi (ürün kâsesi buraya kayarak gider) */
  el: HTMLElement;
}

export interface MiniBaglam {
  /** çerçevenin açtığı alan (position: relative; arka plan ve Mino köşesi hazır). Mini oyun yalnız buraya çizer. */
  kok: HTMLElement;
  /** istasyon dikeyde 90° döndürüldü mü (üstten çizimler; sprite'lar dönmez, ekranda dik durur) */
  dikey: boolean;
  mino: MinoKose;
  ses: Sesler;
  /** Capacitor Haptics (10-20 ms tık; ayardan kapanır); web'de boş */
  dokunsal: (ms?: number) => void;
  ipucu: IpucuMerdiveni;
  tepsi: TepsiDugmesi;
}

// ---------------------------------------------------------------- mini oyunun verdiği

/** Arka planda süren iş (tava, kazan, fırın, fritöz): lokanta ekranında işaret verir */
export interface ArkaIs {
  /** mini oyunun kaldığı yer (opak; dönüşte MiniGirdi.devam olarak geri gelir). Zaman `performance.now()` ile tutulur. */
  durum: unknown;
  /** lokanta ekranında saniyede bir sorulur: hangi ses, buhar var mı, ne kadar pişti */
  isaret(): { ses: 'ciz' | 'fokur' | 'yok'; buhar: boolean; pisme?: Pisme; surpriz?: string };
}

export interface MiniOturum {
  /** tepsi düğmesiyle (çocuk istediği an) ürünlerle çözülür */
  bitti: Promise<Urun[]>;
  /** geri düğmesiyle çıkılırken: pişmeye devam eden iş varsa onu döner */
  arkaPlanda?: () => ArkaIs | null;
  /** rAF, zamanlayıcı, dinleyici, ses döngüsü temizliği */
  kapat(): void;
}

export type Istasyon = 'tezgah' | 'mermer' | 'ocak' | 'lavabo' | 'mangal' | 'servis' | 'firin' | 'icecek';

export interface MiniOyun {
  /** klasör adıyla aynı: 'dogra' */
  ad: string;
  istasyon: Istasyon;
  /** lokantadaki istasyonda birden çok oyun varsa seçim düğmesinin resmi (alet). Yoksa istasyon resmi. */
  simge?: () => HTMLElement;
  baslat(b: MiniBaglam, g: MiniGirdi): MiniOturum;
}

// ---------------------------------------------------------------- malzeme zinciri (Yıka → Soy → Doğra → Tava / Kazan / Kızart → Tabakla → müşteri)

/** Lavabo açıkken yıkanmamışsa topraklı sayılan malzemeler (Yıka'nın yıkayabildikleri) */
export const YIKANIR: readonly Malzeme[] = ['domates', 'salatalik', 'biber', 'marul', 'havuc', 'patates', 'maydanoz', 'limon', 'elma', 'sogan'];

/** Bir malzemenin zincirdeki hâli: yıkandı mı, soyuldu mu (undefined = sorulmadı) */
export type Hal = Pick<MalzemeDurumu, 'temiz' | 'soyuldu'>;

/** İki "bilinmiyor / evet / hayır" birleşir: biri hayırsa hayır, biri evetse evet, yoksa bilinmiyor */
const ikili = (a?: boolean, b?: boolean) => (a === false || b === false ? false : a || b ? true : undefined);

/**
 * Aynı malzemenin iki kısmı bir yemekte birleşir (kâse + kâse, tava, tabak): adet toplanır; bir kısım topraklıysa
 * ya da soyulmamışsa bütünü öyle; kesim öncekinden kalır (çağıran isterse değiştirir). Bilinmeyen alan yazılmaz.
 */
export function durumTopla(a: MalzemeDurumu | undefined, b: MalzemeDurumu): MalzemeDurumu {
  if (!a) return { ...b };
  const r: MalzemeDurumu = { ...a, adet: a.adet + b.adet };
  const temiz = ikili(a.temiz, b.temiz);
  const soyuldu = ikili(a.soyuldu, b.soyuldu);
  if (temiz === undefined) delete r.temiz;
  else r.temiz = temiz;
  if (soyuldu === undefined) delete r.soyuldu;
  else r.soyuldu = soyuldu;
  if (a.rende || b.rende) r.rende = true;
  if (!r.kesim && b.kesim) r.kesim = b.kesim;
  return r;
}

/**
 * TEK bir sebzenin hâli, geçtiği istasyonlardan (Yıka süzgeci, Soy kâsesi): soyulduysa toprak kabuğuyla gitti
 * (temiz); hiç yıkanmadıysa ve lavabo açıksa topraklı; lavabo kapalıysa sorulmaz.
 */
export function sebzeHali(m: Malzeme, kaynaklar: Hal[], yikama?: boolean): Hal {
  const soyuldu = kaynaklar.some((k) => k.soyuldu) ? true : kaynaklar.some((k) => k.soyuldu === false) ? false : undefined;
  let temiz = kaynaklar.some((k) => k.temiz) ? true : kaynaklar.some((k) => k.temiz === false) ? false : undefined;
  if (temiz === undefined && yikama && YIKANIR.includes(m)) temiz = false;
  if (soyuldu && temiz === false) temiz = true;
  const h: Hal = {};
  if (temiz !== undefined) h.temiz = temiz;
  if (soyuldu !== undefined) h.soyuldu = soyuldu;
  return h;
}

/** Yemeğin temizliği: bir malzeme bile topraklıysa false, yıkanmış malzeme varsa true, hiç sorulmadıysa undefined */
export function yemekTemizligi(o: YemekOzelligi): boolean | undefined {
  let t = o.temiz;
  for (const d of Object.values(o.malzemeler)) if (d && d.adet > 0) t = ikili(t, d.temiz);
  return t;
}

/** Tepside bütün hâlde hazırlanmış sebze mi (Yıka süzgeci, Soy kâsesi): kesilmemiş, pişmemiş, hâli belli */
export function hazirlikMi(u: Urun): boolean {
  const d = Object.values(u.ozellik.malzemeler).filter((x): x is MalzemeDurumu => !!x && x.adet > 0);
  return !u.servis && !u.ozellik.pisme && d.length > 0 && d.every((x) => !x.kesim || x.kesim === 'butun') && d.some((x) => x.temiz !== undefined || x.soyuldu !== undefined);
}

/** Birden çok üründen bir malzemenin toplu hâli (Kazan, Kızart: kullandığı tepsi ürünleri) */
export function urunlerdekiHal(urunler: Urun[], m: Malzeme): Hal {
  let r: MalzemeDurumu | undefined;
  for (const u of urunler) {
    const d = u.ozellik.malzemeler[m];
    if (d && d.adet > 0) r = durumTopla(r, d);
  }
  const h: Hal = {};
  if (r?.temiz !== undefined) h.temiz = r.temiz;
  if (r?.soyuldu !== undefined) h.soyuldu = r.soyuldu;
  return h;
}

/**
 * Tepsideki hazırlık ürünlerinden (Yıka, Soy) sebze sebze alım: Doğra raftan bir sebze aldıkça o malzemenin bir
 * tanesi her hazırlık üründen düşülür (yıkanıp soyulan patates iki üründe de bir tane). Ödülde: kullanılan ürünlerin
 * id'leri (lokanta tepsiden kaldırır) ve artanlar (aynı tür, kalan malzemeyle; resminde alınan sebzeler gizlenir).
 */
export function hazirlikStogu(tepsi: Urun[], yikama?: boolean) {
  const stok = tepsi.filter(hazirlikMi).map((u) => ({
    u,
    kalan: Object.fromEntries(Object.entries(u.ozellik.malzemeler).map(([m, d]) => [m, d?.adet ?? 0])) as Partial<Record<Malzeme, number>>,
    alinan: {} as Partial<Record<Malzeme, number>>,
  }));
  return {
    /** raftan bir sebze alındı: hâli (varsa hazırlık ürünlerinden birer tane düşer) */
    al(m: Malzeme): Hal {
      const kaynaklar: Hal[] = [];
      for (const s of stok) {
        if ((s.kalan[m] ?? 0) <= 0) continue;
        s.kalan[m]!--;
        s.alinan[m] = (s.alinan[m] ?? 0) + 1;
        const d = s.u.ozellik.malzemeler[m]!;
        kaynaklar.push({ temiz: d.temiz, soyuldu: d.soyuldu });
      }
      return sebzeHali(m, kaynaklar, yikama);
    },
    /** en az bir sebzesi alınan hazırlık ürünleri */
    kullanilan: () => stok.filter((s) => Object.keys(s.alinan).length).map((s) => s.u.id),
    artanlar(): Urun[] {
      return stok
        .filter((s) => Object.keys(s.alinan).length && Object.values(s.kalan).some((n) => (n ?? 0) > 0))
        .map((s) => {
          const kaynak = s.u;
          const malzemeler: Partial<Record<Malzeme, MalzemeDurumu>> = {};
          for (const [m, n] of Object.entries(s.kalan)) if (n && n > 0) malzemeler[m as Malzeme] = { ...kaynak.ozellik.malzemeler[m as Malzeme]!, adet: n };
          const ozellik: YemekOzelligi = { ...kaynak.ozellik, malzemeler };
          if (kaynak.ozellik.temiz !== undefined) ozellik.temiz = Object.values(malzemeler).every((d) => d!.temiz !== false);
          const alinan = { ...s.alinan };
          return {
            ...kaynak,
            id: urunId(kaynak.tur),
            ozellik,
            gorsel: () => {
              const el = kaynak.gorsel();
              const say = { ...alinan };
              for (const c of Array.from(el.querySelectorAll<HTMLElement>('[data-malzeme]'))) {
                const m = c.dataset.malzeme as Malzeme;
                if ((say[m] ?? 0) > 0) {
                  say[m]!--;
                  c.remove();
                }
              }
              return el;
            },
          };
        });
    },
  };
}
