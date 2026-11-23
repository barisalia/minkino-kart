// 1. sahne · bahçede düşüş ve 8. sahne · bahçede kapanış (çekim listesi 1.1–1.3, 8.1–8.4).
// Çizim adları Paket Doktor-K3 brief'iyle birebirdir. İki sahne aynı bahçede, aynı çalının çevresinde geçer:
// başta Zıpzıp topunun peşinde sağdan koşar, çalıya takılıp düşer, top çalıda kalır; sonda klinikten (soldan) döner,
// aynı çalının üstünden bu kez temiz atlar, topunu çıkarır, bandını gösterir.
// Saf veri: DOM yok.
import type { Dizi } from '../once-kuzu/diziler';
import type { Adim, Yuru } from '../motor/akis';

const sira = (onek: string, bas: number, son: number): string[] => Array.from({ length: son - bas + 1 }, (_, i) => onek + (bas + i));
const toplam = (a: readonly number[]) => a.reduce((x, y) => x + y, 0);

// ——— 1. sahne
export const K3_DUSUS = {
  fon: 'fon-bahce',
  cali: 'cali',
  top: sira('top-', 0, 2),
  ugurUcus: sira('ugur-ucus-', 0, 1),
  ugurDur: 'ugur-dur',
  ugurYuru: 'ugur-yuru',
  kosu: sira('zipzip-kosu-', 0, 7),
  dusus: sira('zipzip-dusus-', 0, 7),
  dizeBak: sira('zipzip-dize-bak-', 0, 3),
  dizeAgiz: sira('zipzip-dize-agiz-', 0, 5),
} as const;
/** 1. sahnenin K3'teki kendi çizimleri (35). */
export const DUSUS_DOSYALAR: readonly string[] = Object.values(K3_DUSUS).flat();

const d = K3_DUSUS;
export const DUSUS_DIZI = {
  /** koşu döngüsü: 0 ve 4 temas, 3 ve 7 havada */
  'zipzip-kosu': { kareler: d.kosu, sureler: [90, 90, 80, 100, 90, 90, 80, 100], donus: 0 },
  /** sıçrar, çalının üstünde ayağı takılır (takılma pozunda kalır), devrilir, yere oturur */
  'zipzip-dusus': { kareler: d.dusus, sureler: [220, 140, 160, 420, 180, 200, 320, 0] },
  /** dizine bakar, kulakları düşer, burnunu çeker */
  'dize-bak': { kareler: [d.dizeBak[0], d.dizeBak[1], d.dizeBak[2]], sureler: [600, 500, 0] },
} as const satisfies Record<string, Dizi>;
/** Koşu: dört döngü, her biri 420 px; koşarken katman sürekli ilerler. Sağdan sola. */
export const KOSU: Yuru = { adim: 420, hava: [0, 1, 2, 3, 4, 5, 6, 7], tekrar: 4, yon: -1 };
/** Atlayış: çalının sağından soluna 1650 px. Sıçrarken ve devrilirken ilerler; takılma pozunda (3) havada asılı kalır. */
export const DUSUS_YOLU: Yuru = { adim: 1650, hava: [1, 2, 4], tekrar: 1, yon: -1 };

export type DususOlayi = never;
export const DUSUS_REPLIKLER: readonly { ad: string; kim: 'kino' | 'zipzip'; metin: string }[] = [
  { ad: 'zb-topum', kim: 'zipzip', metin: 'Topum! Bekle!' },
  { ad: 'zb-ay', kim: 'zipzip', metin: 'Ayy!' },
  { ad: 'zb-dizim', kim: 'zipzip', metin: 'Dizim acıyor…' },
];
export const DUSUS_EFEKTLER = ['e2-pat', 'e1-minder'] as const;
export const DUSUS_KAYIT_MS: Record<string, number> = { 'zb-topum': 1460, 'zb-ay': 780, 'zb-dizim': 1280 };
/** topun çalıya varması (ms) */
export const TOP_SURESI = 2000;
const KOSU_MS = toplam(DUSUS_DIZI['zipzip-kosu'].sureler) * KOSU.tekrar;
const TAKILMA_MS = toplam(DUSUS_DIZI['zipzip-dusus'].sureler.slice(0, 3));

export const DUSUS_ADIMLAR: readonly Adim<DususOlayi>[] = [
  // 1.1 · top çalıya doğru seker, Zıpzıp peşinden koşar
  { ad: 's1-top', plan: 'genis', katman: { cali: { poz: d.cali }, zipzip: { yok: true }, yuz: { yok: true } }, bitis: { tur: 'sure', ms: 900 } },
  { ad: 's1-kosu', plan: 'genis', katman: { zipzip: { dizi: 'zipzip-kosu', yuru: KOSU } }, ses: { kim: 'zipzip', ad: 'zb-topum', gecikme: 300, agiz: null }, bitis: { tur: 'sure', ms: KOSU_MS } },
  // 1.2 · çalının üstünden atlamaya kalkar, takılır, düşer
  { ad: 's1-dusus', plan: 'orta', katman: { zipzip: { dizi: 'zipzip-dusus', yuru: DUSUS_YOLU } }, ses: { kim: 'zipzip', ad: 'zb-ay', gecikme: TAKILMA_MS + 60, agiz: null },
    efekt: [{ ad: 'e1-minder', gecikme: TAKILMA_MS + 420 + 180, kazanc: 1.1 }], bitis: { tur: 'sure', ms: toplam(DUSUS_DIZI['zipzip-dusus'].sureler) + 900 } },
  // 1.3 · yakın: dizine bakar, sonra kliniğe
  { ad: 's1-yakin', plan: 'yakin', katman: { yuz: { dizi: 'dize-bak' } }, bitis: { tur: 'sure', ms: 1700 } },
  { ad: 's1-dizim', plan: 'yakin', katman: { yuz: { poz: d.dizeAgiz[0] } }, ses: { kim: 'zipzip', ad: 'zb-dizim', agiz: 'zipzip-dize', dinlenme: 0 }, bitis: { tur: 'ses', ek: 300 } },
  { ad: 's1-umut', plan: 'yakin', katman: { yuz: { poz: d.dizeBak[3] } }, bitis: { tur: 'sure', ms: 1700 }, sonra: 'son' },
];

// ——— 8. sahne
export const K3_KAPANIS = {
  yuru: sira('zipzip-yuru-', 0, 7),
  atla: sira('zipzip-atla-', 0, 7),
  topAl: sira('zipzip-top-al-', 0, 3),
  topAlKirp: 'zipzip-top-al-kirp',
  bantGoster: sira('zipzip-bant-goster-', 0, 5),
  gosterAgiz: sira('zipzip-goster-agiz-', 0, 5),
  topSektir: sira('zipzip-top-sektir-', 0, 5),
  elSalla: sira('kino-el-salla-', 0, 5),
  sallaAgiz: sira('kino-salla-agiz-', 0, 5),
} as const;
/** 8. sahnenin K3'teki kendi çizimleri (51). */
export const KAPANIS_DOSYALAR: readonly string[] = Object.values(K3_KAPANIS).flat();
/** 1. ve 7. sahnenin çizimlerinden kullanılanlar: bahçe, çalı, çalıdaki top, uğur böceği, bant işaretleri, yıldızlar. */
export const KAPANIS_ODUNC: readonly string[] = [d.fon, d.cali, d.top[0], ...d.ugurUcus, d.ugurDur,
  'bant-isaret-yildiz', 'bant-isaret-kalp', 'bant-isaret-gokkusagi', 'bant-isaret-pati', 'yildiz-sari', 'yildiz-nane', 'yildiz-mavi'];

const k = K3_KAPANIS;
export const KAPANIS_DIZI = {
  /** rahat yürüyüş döngüsü */
  'zipzip-yuru': { kareler: k.yuru, sureler: [110, 110, 100, 110, 110, 110, 100, 110], donus: 0 },
  /** geri çekilir, atılır, sıçrar, tepede kalır, iner, doğrulur (ilk poz, çalıya bakış, ayrı adımda) */
  'zipzip-atla': { kareler: k.atla.slice(1), sureler: [300, 160, 150, 380, 160, 200, 0] },
  /** çalıya uzanır, iki patisini içine sokar */
  'top-uzan': { kareler: [k.topAl[0], k.topAl[1]], sureler: [300, 0] },
  /** topu çekip çıkarır, başının üstüne kaldırır */
  'top-cek': { kareler: [k.topAl[2], k.topAl[3]], sureler: [450, 0] },
  /** bantlı bacağını öne atar, bandı gösterir */
  'bant-goster': { kareler: [k.bantGoster[0], k.bantGoster[1], k.bantGoster[2]], sureler: [350, 300, 0] },
  /** böcek konar: dizine bakar, kıkırdar, böceğe eğilir */
  'bant-bocek': { kareler: [k.bantGoster[2], k.bantGoster[3], k.bantGoster[4], k.bantGoster[5]], sureler: [900, 600, 700, 0] },
  /** topu sektirme döngüsü (son kare: mini animasyon gibi döner) */
  'top-sektir': { kareler: k.topSektir, sureler: [220, 140, 120, 160, 160, 260], donus: 0 },
  /** Kino elini kaldırır, sallar, uğurlama pozunda kalır */
  'kino-el-salla': { kareler: k.elSalla, sureler: [300, 200, 220, 220, 220, 0] },
} as const satisfies Record<string, Dizi>;
/** Dönüş yürüyüşü: klinikten (soldan) çalıya, beş döngü × 300 px; yürürken katman sürekli ilerler. */
export const YURU: Yuru = { adim: 300, hava: [0, 1, 2, 3, 4, 5, 6, 7], tekrar: 5, yon: 1 };
/** Temiz atlayış: çalının solundan sağına 1650 px; atılırken, sıçrarken, tepede ve inerken ilerler (dizinin 1–4. kareleri). */
export const ATLA_YOLU: Yuru = { adim: 1650, hava: [1, 2, 3, 4], tekrar: 1, yon: 1 };

export type KapanisOlayi = never;
export const KAPANIS_REPLIKLER: readonly { ad: string; kim: 'kino' | 'zipzip'; metin: string }[] = [
  { ad: 'zk-dikkat', kim: 'zipzip', metin: 'Hmm… Bu sefer dikkatli.' },
  { ad: 'z1-hop', kim: 'zipzip', metin: 'Hop!' },
  { ad: 'zk-topum', kim: 'zipzip', metin: 'Topum!' },
  { ad: 'zk-cesur', kim: 'zipzip', metin: 'Bak, artık cesurum!' },
  { ad: 'z1-kikir', kim: 'zipzip', metin: '(kıkırdar)' },
  { ad: 'kk-doktor', kim: 'kino', metin: 'Kalbi sakin, dizi tertemiz. Çok nazik bir doktorsun.' },
];
export const KAPANIS_EFEKTLER = ['e8-zipla', 'e2-pat'] as const;
export const KAPANIS_KAYIT_MS: Record<string, number> = { 'zk-dikkat': 2270, 'z1-hop': 520, 'zk-topum': 830, 'zk-cesur': 1850, 'z1-kikir': 1560, 'kk-doktor': 4720 };
const YURU_MS = toplam(KAPANIS_DIZI['zipzip-yuru'].sureler) * YURU.tekrar;
/** böceğin banda konması (ms, 's8-bocek' adımının başından) */
export const BOCEK_KONMA_MS = 900;

export const KAPANIS_ADIMLAR: readonly Adim<KapanisOlayi>[] = [
  // 8.1 · klinikten döner, çalının önünde durur
  { ad: 's8-yuru', plan: 'genis', katman: { cali: { poz: d.cali }, top: { poz: d.top[0] }, kino: { yok: true }, zipzip: { dizi: 'zipzip-yuru', yuru: YURU } }, bitis: { tur: 'sure', ms: YURU_MS } },
  { ad: 's8-dur', plan: 'orta', katman: { zipzip: { poz: k.atla[0] } }, ses: { kim: 'zipzip', ad: 'zk-dikkat', gecikme: 300, agiz: null }, bitis: { tur: 'ses', ek: 300 } },
  // 8.2 · temiz atlar, topunu çıkarır
  { ad: 's8-atla', plan: 'orta', katman: { zipzip: { dizi: 'zipzip-atla', yuru: ATLA_YOLU } }, ses: { kim: 'zipzip', ad: 'z1-hop', gecikme: 460, agiz: null },
    efekt: [{ ad: 'e8-zipla', gecikme: 460, kazanc: 0.8 }, { ad: 'e2-pat', gecikme: 1150, kazanc: 0.8 }], bitis: { tur: 'sure', ms: 1900 } },
  { ad: 's8-uzan', plan: 'orta', katman: { zipzip: { dizi: 'top-uzan' } }, bitis: { tur: 'sure', ms: 800 } },
  { ad: 's8-cek', plan: 'orta', katman: { top: { yok: true }, zipzip: { dizi: 'top-cek' } }, ses: { kim: 'zipzip', ad: 'zk-topum', gecikme: 250, agiz: null }, bitis: { tur: 'ses', ek: 600 } },
  // 8.3 · bandını gösterir; uğur böceği konar; Kino el sallar
  { ad: 's8-goster', plan: 'orta', katman: { zipzip: { dizi: 'bant-goster' } }, bitis: { tur: 'sure', ms: 1100 } },
  { ad: 's8-cesur', plan: 'orta', katman: { zipzip: { poz: k.gosterAgiz[5] } }, ses: { kim: 'zipzip', ad: 'zk-cesur', agiz: 'zipzip-goster', dinlenme: 5 }, bitis: { tur: 'ses', ek: 400 } },
  { ad: 's8-bocek', plan: 'orta', katman: { zipzip: { dizi: 'bant-bocek' } }, ses: { kim: 'zipzip', ad: 'z1-kikir', gecikme: 1500, agiz: null }, bitis: { tur: 'sure', ms: 3300 } },
  { ad: 's8-kino', plan: 'genis', katman: { kino: { dizi: 'kino-el-salla' }, zipzip: { dizi: 'top-sektir' } }, bitis: { tur: 'sure', ms: 1400 } },
  // 8.4 · son söz; Zıpzıp topunu sektirir (döngü)
  { ad: 's8-doktor', plan: 'genis', katman: { kino: { poz: k.elSalla[5] } }, ses: { kim: 'kino', ad: 'kk-doktor', agiz: 'kino-salla', dinlenme: 5 }, bitis: { tur: 'ses', ek: 600 } },
];

/** Bahçenin yerleşimi (sahne birimi; çizim pikseli × 0,4). Fon gelince çalının ve kapının yeri ölçülüp güncellenir. */
export const BAHCE_OLCEK = 0.4;
export const BAHCE = {
  yer: 790,
  /** çalının ortası; Zıpzıp'ın çalının solunda ve sağında durduğu yerler (1650 px = 660 birim arayla) */
  caliX: 750, solX: 420, sagX: 1080,
  /** çalıdaki oyuk (topun sıkıştığı yer) */
  oyuk: { x: 750, y: 640 }, topBoyu: 104,
  /** uzaktaki klinik kapısı: Kino burada küçük görünür (çizim pikseli × 0,16) */
  kapi: { x: 300, yer: 560, olcek: 0.16 },
} as const;
export const BAHCE_KAMERA = {
  genis: { olcek: 1, x: 800, y: 450 },
  orta: { olcek: 1.3, x: 750, y: 540 },
  yakin: { olcek: 2.4, x: 420, y: 640, yakin: true },
} as const;
