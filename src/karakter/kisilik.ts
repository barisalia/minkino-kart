/**
 * Karakter kişilikleri (pazar müşterileri; ileride film ve diğer oyunlar da kullanır).
 * Her hayvanın kendi yürüyüşü, beklerken huyu, sevinç dansı, ağız noktası ve kafa sallama genliği.
 */
export type Yuruyus = 'paytak' | 'hop' | 'agir' | 'salin' | 'tiris' | 'takla' | 'uc';
export type Huy = 'ayak' | 'burun' | 'esne' | 'gevis' | 'kuyruk' | 'kasin' | 'gaga';
export type Dans = 'paytak' | 'hop' | 'gobek' | 'don' | 'kovala' | 'salto' | 'kanat' | 'kino';

export interface Kisilik {
  yuruyus: Yuruyus;
  /** bir adımın süresi (ms) */
  adim: number;
  /** varış süresi (ms) */
  gelis: number;
  huy: Huy;
  dans: Dans;
  /** ağzın yeri (kutuya göre 0..1) */
  agiz: [number, number];
  /** kafa sallama genliği (derece) */
  hayir: number;
  /** kol açısı sınırı [içe, dışa] (yoksa -5 … 110) */
  kol?: [number, number];
  /** iskelette kafa eğilmesinin genliği (varsayılan 1.8) */
  kafaGenlik?: number;
  /** iskelete özel açı sınırları (±derece): fazlasında eklem yerinde boşluk açılan karakterler için */
  sinir?: {
    kafa?: number;
    /** kafa açısı aralığı [en az, en çok] (derece, genlik çarpanından sonra; - = izleyicinin soluna yatar) */
    kafaAci?: [number, number];
    /** kafanın boyunda kalkıp inmesi [en az, en çok] (Poz.kafaY: boyun %'si, - = yukarı) */
    kafaY?: [number, number];
    kulak?: number;
    /**
     * Kulak başına dönme aralığı [en az, en çok] (Poz değeri, + = dışa / kalkar; kulak ±'dan sonra uygulanır).
     * Aşan kısım kulakEsne varsa esnemeye, yoksa yok sayılır.
     */
    kulakSol?: [number, number];
    kulakSag?: [number, number];
    bacak?: number;
    kuyruk?: [number, number];
    /**
     * Kuyruk tek yöne döner: açı 0 … R arasında katlanır (sallanma, pervane dönüşü hep bu aralıkta gidip gelir).
     * Kökü bir yöne dönünce kesik yeri açılan kuyruklar için.
     */
    kuyrukKatla?: number;
    govde?: number;
    kanat?: [number, number];
    topuz?: number;
  };
  /** İskeletin dönme noktası düzeltmesi (çizimin 2048'lik koordinatı; JSON'dakinin yerine) */
  donme?: Record<string, [number, number]>;
  /**
   * Sarkık kulak (Kino): çizimde kulak kökten aşağı sarkar; Poz'daki "+ = dışa açılır / kalkar" için dönme yönü
   * dik kulağın tersidir. true: Karakter çevirir (hareketler, film duruşu ve banyo aynı anlamı kullanır).
   */
  kulakTers?: boolean;
  /**
   * Kulak aralığını (sinir.kulakSol / kulakSag) aşan kısım dönme yerine esnemeye çevrilir:
   * [iç kenarın x'i, derece başına yatay oran, derece başına dikey oran]. Kulak iç kenarından (x) ve kökünden
   * (dönme noktasının y'si) esner: iç kenar ve kök yerinde kalır, kafadan hiç ayrılmaz. Dışa (kalkma, +): kulak
   * genişler; içe (sarkma, düşme, -): daralır ve uzayıp aşağı sarkar (dikey oran yalnız içe).
   */
  kulakEsne?: Partial<Record<'kulak-sol' | 'kulak-sag', [number, number, number]>>;
}

export const KISILIK: Record<string, Kisilik> = {
  ordek: { yuruyus: 'paytak', adim: 260, gelis: 1500, huy: 'ayak', dans: 'paytak', agiz: [0.5, 0.49], hayir: 10 },
  tavsan: { yuruyus: 'hop', adim: 430, gelis: 1300, huy: 'burun', dans: 'hop', agiz: [0.5, 0.52], hayir: 8 },
  ayi: { yuruyus: 'agir', adim: 720, gelis: 2100, huy: 'esne', dans: 'gobek', agiz: [0.52, 0.56], hayir: 5, kol: [-25, 60], sinir: { kafa: 6, kulak: 10, bacak: 5 } },
  // inek iskeleti: kollar gövdenin önünde (katman sırası JSON'da), kuyruk -40 … +15
  inek: { yuruyus: 'salin', adim: 620, gelis: 1900, huy: 'gevis', dans: 'don', agiz: [0.51, 0.43], hayir: 6, kol: [-10, 60], sinir: { kafa: 6, kulak: 10, bacak: 5, kuyruk: [-40, 15] } },
  kopek: { yuruyus: 'tiris', adim: 220, gelis: 1100, huy: 'kuyruk', dans: 'kovala', agiz: [0.5, 0.5], hayir: 9, kol: [-5, 60] },
  // Kino (ana karakter, köpek yavrusu): coşkulu, hoplayarak yürür, kuyruğu pervane, kulakları uçuşur.
  // Çizimi tek resimden kesilmiş parçalar (ekip/kino/kino-final.svg): kolların, sağ kulağın ve kuyruğun altı boş
  // ya da konturu kesik. Denetim (2026-09-27, kino-denetim-*.png): kol 1°'den sonra omuzda / patide çift kontur ve
  // kopuk uç. Sağ kulak (kafanın önünde) kökten döndükçe kafadan ayrılıyordu: dışa 1°'de yanağın düz kesiği
  // görünmeye başlar, 10°'de ~25 px (2048'lik çizimde) boşluk, 25°'de kulak başın yanında havada; içe 2°'den sonra
  // kök ucunda kontur çentiği, 10°'den sonra kulak gözün üstüne biner. Sol kulak (kafanın arkasında) dışa serbest,
  // içe 4°'den sonra beyaz şerit. Bu yüzden kulak dönmesi dar, fazlası kökten esneme (kulakEsne). Kuyruk eski
  // noktasından (1262,1648) her yöne kopuyordu: kökü patinin altındaki kontur ekine (1390,1470) alındı, yalnız
  // aşağı-dışa (0 … 14°) döner. Adobe parçaları tamamlayınca bu sınırlar açılır.
  kino: {
    yuruyus: 'hop',
    adim: 300,
    gelis: 1100,
    huy: 'kuyruk',
    dans: 'kino',
    agiz: [0.46, 0.49],
    hayir: 9,
    kol: [0, 1],
    // baş: izleyicinin soluna 3,5°'den, yukarı boyun %0,6'sından fazla kalkınca çenenin altında konturu olmayan soluk boyun
    // dolgusu (kutu gibi) görünüyor
    sinir: { kulak: 25, kulakSol: [-3, 25], kulakSag: [-1.5, 0], kuyrukKatla: 14, kafaAci: [-3.5, 18], kafaY: [-0.6, 4] },
    donme: { kuyruk: [1390, 1470] },
    kulakTers: true,
    kulakEsne: { 'kulak-sol': [640, 0.005, 0.004], 'kulak-sag': [1405, 0.006, 0.004] },
  },
  // Bebek Ege (Sesli Maceralar Bölüm 2; oturan bebek): iskelet sınırları kafa ±10, kol -40…+35, bacak ±8
  ege: { yuruyus: 'salin', adim: 600, gelis: 1500, huy: 'ayak', dans: 'gobek', agiz: [0.5, 0.41], hayir: 7, kol: [-40, 35], kafaGenlik: 1, sinir: { kafa: 10, bacak: 8 } },
  // maymun iskeleti: kollar -45 … +45 (fazlasında omuzda boşluk), kafa ±5, kulak ±8, bacak ±5, kuyruk ±12
  maymun: { yuruyus: 'takla', adim: 500, gelis: 1400, huy: 'kasin', dans: 'salto', agiz: [0.5, 0.4], hayir: 9, kol: [-45, 45], sinir: { kafa: 5, kulak: 8, bacak: 5, kuyruk: [-12, 12] } },
  // kuş iskeleti: kafa ve gövde tek parça (gaga, gözler gövdeye bağlı); kanat -20 … +30, bacak ±6, kuyruk ±8, gövde ±3
  kus: { yuruyus: 'uc', adim: 180, gelis: 1500, huy: 'gaga', dans: 'kanat', agiz: [0.86, 0.36], hayir: 12, sinir: { bacak: 6, kuyruk: [-8, 8], govde: 3, kanat: [-20, 30] } },
};
/**
 * Çocuk karakterler (ekip/cocuk iskeletleri; Sesli Maceralar). Sınırlar tasarımcının: kol -40 (içe) … +120 (yukarı),
 * bacak ±14, kafa ±12, saç topuzu ±12. Ada neşeli ve zıplayan, Can hareketli ve koşturan.
 */
const COCUK_SINIR = { kafa: 12, bacak: 14, topuz: 12, kulak: 12 };
KISILIK.ada = { yuruyus: 'hop', adim: 380, gelis: 1200, huy: 'ayak', dans: 'hop', agiz: [0.5, 0.28], hayir: 8, kol: [-40, 120], kafaGenlik: 1.3, sinir: COCUK_SINIR };
KISILIK.can = { yuruyus: 'tiris', adim: 240, gelis: 900, huy: 'ayak', dans: 'kovala', agiz: [0.5, 0.43], hayir: 9, kol: [-40, 120], kafaGenlik: 1.3, sinir: COCUK_SINIR };
KISILIK.elif = { ...KISILIK.ada, yuruyus: 'salin', adim: 420 };
export const kisilik = (ad: string): Kisilik => KISILIK[ad] ?? KISILIK.kopek;
