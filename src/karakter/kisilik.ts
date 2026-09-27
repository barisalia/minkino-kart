/**
 * Karakter kişilikleri (pazar müşterileri; ileride film ve diğer oyunlar da kullanır).
 * Her hayvanın kendi yürüyüşü, beklerken huyu, sevinç dansı, ağız noktası ve kafa sallama genliği.
 */
export type Yuruyus = 'paytak' | 'hop' | 'agir' | 'salin' | 'tiris' | 'takla' | 'uc';
export type Huy = 'ayak' | 'burun' | 'esne' | 'gevis' | 'kuyruk' | 'kasin' | 'gaga';
export type Dans = 'paytak' | 'hop' | 'gobek' | 'don' | 'kovala' | 'salto' | 'kanat';

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
  sinir?: { kafa?: number; kulak?: number; bacak?: number; kuyruk?: [number, number] };
}

export const KISILIK: Record<string, Kisilik> = {
  ordek: { yuruyus: 'paytak', adim: 260, gelis: 1500, huy: 'ayak', dans: 'paytak', agiz: [0.5, 0.49], hayir: 10 },
  tavsan: { yuruyus: 'hop', adim: 430, gelis: 1300, huy: 'burun', dans: 'hop', agiz: [0.5, 0.52], hayir: 8 },
  ayi: { yuruyus: 'agir', adim: 720, gelis: 2100, huy: 'esne', dans: 'gobek', agiz: [0.52, 0.56], hayir: 5, kol: [-25, 60], sinir: { kafa: 6, kulak: 10, bacak: 5 } },
  // inek iskeleti: kollar gövdenin önünde (katman sırası JSON'da), kuyruk -40 … +15
  inek: { yuruyus: 'salin', adim: 620, gelis: 1900, huy: 'gevis', dans: 'don', agiz: [0.51, 0.43], hayir: 6, kol: [-10, 60], sinir: { kafa: 6, kulak: 10, bacak: 5, kuyruk: [-40, 15] } },
  kopek: { yuruyus: 'tiris', adim: 220, gelis: 1100, huy: 'kuyruk', dans: 'kovala', agiz: [0.5, 0.5], hayir: 9, kol: [-5, 60] },
  // Kino (ana karakter, köpek yavrusu): coşkulu, hoplayarak yürür, kuyruğu pervane, kulakları uçuşur (sarkık kulak: ±25)
  kino: { yuruyus: 'hop', adim: 300, gelis: 1100, huy: 'kuyruk', dans: 'kovala', agiz: [0.46, 0.49], hayir: 9, kol: [-5, 60], sinir: { kulak: 25 } },
  maymun: { yuruyus: 'takla', adim: 500, gelis: 1400, huy: 'kasin', dans: 'salto', agiz: [0.5, 0.4], hayir: 9 },
  kus: { yuruyus: 'uc', adim: 180, gelis: 1500, huy: 'gaga', dans: 'kanat', agiz: [0.86, 0.36], hayir: 12 },
};
export const kisilik = (ad: string): Kisilik => KISILIK[ad] ?? KISILIK.kopek;
