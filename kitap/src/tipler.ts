/**
 * Kitaplar: içerik ve canlanma tanımlarının tipleri.
 *
 * Metin content/kitap-<id>.json'da (senaristten birebir), canlanan anlar kitap/src/<id>-canli.ts'te (kod davranışı).
 * Resimler ekip/antigravity/KITAP-DOSYA-ADLARI.md'deki adlarla gelir, ekip/illustrator/kitap-isle.cjs keser:
 * assets/kitap/<id>/*.webp + yerlesim.json. Gelmeyen her şey sade yer tutucuyla durur.
 */

/** Konuşan: anlatıcı, karakterler ya da ses yazısı ("GÜM!") */
export type Kim = 'anlatici' | 'kino' | 'anne' | 'baba' | 'lokum' | 'mino' | 'ogretmen' | 'bulut' | 'tombi' | 'cocuklar' | 'ses';

export interface Satir {
  kim: Kim;
  /** Senaryodaki metin, ses etiketleriyle ([excited] …); sayfaya etiketsiz basılır */
  metin: string;
  /** Yalnız yönerge (ör. "iki parmağını kaldırarak"): sayfada basılmaz, okunmaz */
  not?: string;
}

export interface KitapSayfasi {
  no: number;
  ad: string;
  /** Yer tutucunun düz rengi */
  renk: string;
  /** Yer tutucuda görünen kısa resim tarifi */
  tarif: string;
  satirlar: Satir[];
}

export interface KitapIcerik {
  id: string;
  baslik: string;
  kapak: { renk: string; tarif: string; satirlar: Satir[] };
  sayfalar: KitapSayfasi[];
  ebeveyn: { baslik: string; sorular: string[]; not: string };
}

/** Sayfa resmindeki konum: [x, y, en, boy], resmin oranı olarak (0..1) */
export type Kutu = [number, number, number, number];

/** Hareketli katman (karakter, eşya): hareket sayfasının pozları + varsa küçük parça dizileri (kuyruk, kulak) */
export interface KatmanTanim {
  id: string;
  /** Yer tutucuda yazan ad */
  ad: string;
  /** Yer tutucunun konumu (resim gelince yerlesim.json'daki ölçü geçer) */
  yer: Kutu;
  /** Hareket sayfasındaki poz sayısı (KITAP-DOSYA-ADLARI.md ile aynı) */
  pozlar: number;
  /** Parça dizileri: ad → kare sayısı */
  parcalar?: Record<string, number>;
  /** Önce gizli, yalnız canlanırken görünür (düşen Kuzu, dağıtılan pişi) */
  gizli?: boolean;
  /** Dokunulmaz (yalnız başka bir anın parçası) */
  dokunulmaz?: boolean;
  /** Hep görünen parçalar (pozlar o parça olmadan çizilir; parça ilk karesiyle durur) */
  hep?: string[];
  /** Boştaki poz (varsayılan 1) */
  ana?: number;
  /** Resmi başka bir hareket sayfasının pozundan (s09 bloklar: ['bloklar', 3]) */
  kaynak?: [string, number];
  /** Resim gelse de yeri tanımdan (ölçülemeyen eşyalar: saçılan blok, pişi); boyu resmin oranına uyar */
  yerSabit?: boolean;
}

/** Kodla yapılan hareket: ezilme, esneme, zıplama, nefes, yana sallanma (döndürme yok) */
export type Efekt = 'ez' | 'esne' | 'zipla' | 'nefes' | 'salla' | 'kipir';

/** Bir canlanma adımı. ms: adımın süresi (sonraki adım bu kadar sonra; birlikte: beklemeden) */
export interface Adim {
  /** Katman (yoksa yalnız bekleme / ses) */
  k?: string;
  /** Poz (1'den); 0 = poz değişmez */
  poz?: number;
  /** Parça karesi: [parça, kare]; kare 0 = parça gizli */
  parca?: [string, number];
  ef?: Efekt;
  /** Kayma (resmin oranı olarak, başlangıç yerine göre; [0,0] = yerine dön) */
  kay?: [number, number];
  /** Görünürlük (gizli katmanlar) */
  gor?: boolean;
  ms?: number;
  birlikte?: boolean;
  /** Ses efekti (src/audio/efekt.ts) */
  efekt?: 'pof' | 'sicrama' | 'tink' | 'dokunma' | 'vicik' | 'cevir' | 'dagit' | 'ucus';
  /** Kısa söz (cihaz sesi; seslendirme listesine eklenmez) */
  soz?: { kim: Kim; metin: string };
}

export interface CanliAn {
  id: string;
  /** Bu katmanlardan birine dokununca oynar ('bolge:<ad>' = görünmez dokunma bölgesi) */
  dokun: string[];
  adimlar: Adim[];
  /** Sayfa açılınca bir kez kendiliğinden (ör. kuyruk yavaşça iner) */
  acilista?: boolean;
  /** Boşta ara ara kendiliğinden (ms aralık); dokunma ile de tetiklenebilir */
  bosta?: number;
  /** Her dokunuşta sıradaki adım grubu (parmak sayma: bir, iki, üç) */
  sirali?: Adim[][];
}

export interface SayfaCanli {
  katmanlar: KatmanTanim[];
  anlar: CanliAn[];
  /** Görünmez dokunma bölgeleri (askıdaki resim, beslenme kutusu) */
  bolgeler?: Record<string, Kutu>;
  /** Saklı uğur böceği (resmin oranı; [x, y] merkez); bagli: bir katmanla birlikte kayar */
  ugur: [number, number];
  ugurBagli?: string;
  /**
   * Yalnız tam sayfa resmi varken (zemin ve poz katmanları gelmeden): karakter kesilip oynatılmaz; dokunma bölgeleri
   * çizimdeki yerlerde, an hafif efektle oynar (parıltı, ses, resmin ufak sekmesi). Uğur böceği çizimin içinde:
   * ayrı katman yok, dokunma alanı çizimdeki yerinde. Ölçüler 1376×768 tam sayfa çizimlerinden (2026-10-17),
   * resmin oranı olarak; çizim değişirse yeniden ölçülür.
   */
  tam?: {
    ugur: [number, number];
    /** An'ın dokunma anahtarı (katman id ya da 'bolge:ad') → çizimdeki kutu(lar) */
    yerler: Record<string, Kutu | Kutu[]>;
  };
}
