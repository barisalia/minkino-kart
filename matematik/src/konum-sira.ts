// Matematik · okul öncesinin eksik iki konusu (yönetici, 22 Kasım gecesi: "Matematik'i derinleştir"): DOM'suz kurallar.
// "Lokum'la Saklambaç" (konum: içinde, altında, üstünde, arkasında, önünde, yanında, arasında; Şekil evi, her yaş) ve
// "Kaydırak Sırası" (sıra sayıları: birinci … beşinci, sonuncu; Fener tiyatrosu, her yaş). Çizimler: Astra Paket M33–M34
// (CLAUDE-ASTRA-MESAJLAR.md 22 Kasım). Sahneler main.ts'te (lokumlaSaklambac, kaydirakSirasi). Koordinatlar fonun pikseliyle
// (1672 × 941); Astra'nın brief'indeki sayılarla birebir.
import type { Yol } from './tur-sirasi';
import { gelisSorusu, type Havuzlar } from './derinlik';

// ----- M33 · Lokum'la Saklambaç -----
export const ILISKILER = ['icinde', 'altinda', 'ustunde', 'arkasinda', 'onunde', 'yaninda', 'arasinda'] as const;
export type Iliski = (typeof ILISKILER)[number];
/** Lokum'un saklanabildiği dört yer: her yer tek bir konum sözcüğüyle (sandığın içinde, masanın altında…). */
export type BulIliski = 'icinde' | 'altinda' | 'arkasinda' | 'arasinda';
export type Yer = 'sandik' | 'masa' | 'koltuk' | 'minder';
export type Oyuncak = 'top' | 'ayicik';
export const YERLER: readonly Yer[] = ['sandik', 'masa', 'koltuk', 'minder'];
export const SAKLANMA_YERI: Record<BulIliski, Yer> = { icinde: 'sandik', altinda: 'masa', arkasinda: 'koltuk', arasinda: 'minder' };
/** Toplama işinde her konum tek bir eşya ve tek bir yerle söylenir ("Topu sandığın içine koy"). */
export const KOYMA: Record<Iliski, { yer: Yer; oyuncak: Oyuncak }> = {
  icinde: { yer: 'sandik', oyuncak: 'top' },
  altinda: { yer: 'masa', oyuncak: 'top' },
  onunde: { yer: 'koltuk', oyuncak: 'top' },
  arasinda: { yer: 'minder', oyuncak: 'top' },
  ustunde: { yer: 'masa', oyuncak: 'ayicik' },
  arkasinda: { yer: 'koltuk', oyuncak: 'ayicik' },
  yaninda: { yer: 'sandik', oyuncak: 'ayicik' },
};
export type SaklambacTuru = { bul: BulIliski[]; koy: Iliski[] };
/**
 * Turun işleri gelişe göre: önce Lokum iki kez saklanır (çocuk Ceren'in sözüyle bulur), sonra oda toplanır (2–3 yaşta bir,
 * 4 ve 5+ yaşta iki eşya; ikisi ayrı eşya). 2–3 yaş içinde, altında, arkasında, üstünde; 4 yaş önünde, yanında, arasında
 * da; 5+ yaşta zor basamakta "masanın altına, masanın üstüne" gibi karşıt çiftler. Defterdeki zor konum öne alınır.
 */
export function saklambacTuru(yol: Yol, tekrar = 0, zor: readonly number[] = []): SaklambacTuru {
  const T = (bul: BulIliski[], koy: Iliski[]): SaklambacTuru => ({ bul, koy });
  const h: Havuzlar<SaklambacTuru> = yol === 'minik'
    ? [[T(['icinde', 'altinda'], ['ustunde'])], [T(['altinda', 'arkasinda'], ['icinde'])],
      [T(['arkasinda', 'icinde'], ['altinda']), T(['icinde', 'arkasinda'], ['ustunde'])]]
    : yol === 'dort'
      ? [[T(['arkasinda', 'altinda'], ['icinde', 'yaninda'])], [T(['icinde', 'arasinda'], ['ustunde', 'onunde'])],
        [T(['altinda', 'arasinda'], ['altinda', 'arkasinda']), T(['arasinda', 'arkasinda'], ['arasinda', 'ustunde'])]]
      : [[T(['arasinda', 'arkasinda'], ['onunde', 'arkasinda'])], [T(['altinda', 'arasinda'], ['arasinda', 'yaninda'])],
        [T(['arkasinda', 'icinde'], ['altinda', 'ustunde']), T(['icinde', 'arasinda'], ['icinde', 'arkasinda'])]];
  const s = gelisSorusu(h, tekrar, zor, iliskiNolari);
  return { bul: [...s.bul], koy: [...s.koy] };
}
/** Turun konumlarının numarası (akıllı tekrar: konu defterinde "konum:<ilişki>"; derinlik.ts sayı bekler). */
export const iliskiNo = (i: Iliski) => ILISKILER.indexOf(i);
export const iliskiNolari = (s: SaklambacTuru) => [...s.bul, ...s.koy].map(iliskiNo);

export type Kutu = { x: number; y: number; w: number; h: number };
const K = (x: number, y: number, w: number, h: number): Kutu => ({ x, y, w, h });
/**
 * Fon `lokum-odasi` (1672 × 941): arka sırada sandık, masa ve berjer (zemine değdikleri çizgi y 760); önde iki minder
 * (taban y 935). Her yerin çizimi kendi tuvalinde, tuval bu kutunun ölçüsünde (1 px = fonun 1 pikseli).
 */
export const YER_KUTUSU: Record<Yer, Kutu> = {
  sandik: K(100, 440, 360, 320),
  masa: K(620, 400, 470, 360),
  koltuk: K(1240, 380, 380, 380),
  minder: K(560, 720, 550, 215),
};
/** Lokum'un saklanınca kırpıldığı alan (sandıkta ve minderlerde aşağıdan yükselir; alt kenar yerin tabanı). */
export const KIRPMA: Partial<Record<Yer, Kutu>> = { sandik: K(110, 200, 340, 560), minder: K(560, 300, 550, 635) };
/**
 * Lokum'un saklıyken ve bulununca durduğu kutu (poz tuvali). Sandıkta ve minderlerde `lokum-cik` (300 × 380) aşağıdan çıkar;
 * masada `lokum-emekle` (360 × 240) örtünün altından sağa emekler; berjerde `lokum-bak` (300 × 380) arkadan sola eğilip bakar.
 */
export const LOKUM_SAKLI: Record<Yer, Kutu> = {
  sandik: K(130, 770, 300, 380), masa: K(680, 515, 360, 240), koltuk: K(1290, 380, 300, 380), minder: K(685, 945, 300, 380),
};
export const LOKUM_CIKTI: Record<Yer, Kutu> = {
  sandik: K(130, 330, 300, 380), masa: K(980, 515, 360, 240), koltuk: K(1110, 380, 300, 380), minder: K(685, 555, 300, 380),
};
/** Oda toplanırken Lokum'un ayakta durduğu yer, sağ önde (`lokum-sevinc`, 300 × 380, taban tuvalde y 370). */
export const LOKUM_AYAKTA: Kutu = K(1360, 560, 300, 380);
export const LOKUM_POZU: Record<Yer, 'cik' | 'emekle' | 'bak'> = { sandik: 'cik', masa: 'emekle', koltuk: 'bak', minder: 'cik' };
/** Eşyaların yerdeki başlangıcı (önde, solda) ve tuvalleri: top 120 × 120, ayıcık 170 × 200. */
export const OYUNCAK_BASI: Record<Oyuncak, Kutu> = { top: K(150, 815, 120, 120), ayicik: K(300, 735, 170, 200) };
/** Eşyanın konduğu yer. `arkada`: yerin çiziminin arkasında kalır (sandığın içi, masanın altı, berjerin arkası). */
export const KONAK: Record<Iliski, Kutu & { arkada: boolean }> = {
  icinde: { ...K(220, 470, 120, 120), arkada: true },
  altinda: { ...K(1010, 640, 120, 120), arkada: true },
  onunde: { ...K(1300, 700, 120, 120), arkada: false },
  arasinda: { ...K(775, 815, 120, 120), arkada: false },
  ustunde: { ...K(770, 250, 170, 200), arkada: false },
  arkasinda: { ...K(1160, 560, 170, 200), arkada: true },
  yaninda: { ...K(466, 560, 170, 200), arkada: false },
};
/** Bırakma alanları (fon pikseli; birbirine değmez). Parmağın bırakıldığı nokta hangi alandaysa eşya oraya gider. */
export const BIRAKMA: Record<Iliski, Kutu> = {
  icinde: K(100, 380, 362, 380),
  yaninda: K(462, 480, 158, 240),
  ustunde: K(620, 300, 470, 170),
  altinda: K(620, 470, 470, 250),
  arkasinda: K(1240, 300, 382, 390),
  onunde: K(1240, 690, 382, 210),
  arasinda: K(560, 720, 550, 221),
};
const icerde = (b: Kutu, x: number, y: number) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
/** Bırakılan noktanın konumu (yoksa undefined). */
export const birakmaIliskisi = (x: number, y: number): Iliski | undefined => ILISKILER.find((i) => icerde(BIRAKMA[i], x, y));
/** Dokunulan noktanın saklanma yeri (Lokum'u ararken). */
export const dokunulanYer = (x: number, y: number): Yer | undefined => YERLER.find((y0) => icerde(YER_KUTUSU[y0], x, y));

export const SAKLAMBAC_SOZ = {
  giris: 266, gozler: 267, ac: 268,
  bul: { icinde: 269, altinda: 270, arkasinda: 271, arasinda: 272 } as Record<BulIliski, number>,
  yok: 273,
  buldun: { icinde: 274, altinda: 275, arkasinda: 276, arasinda: 277 } as Record<BulIliski, number>,
  topla: 278,
  koy: { icinde: 279, ustunde: 280, altinda: 281, arkasinda: 282, onunde: 283, yaninda: 284, arasinda: 285 } as Record<Iliski, number>,
  baska: 286,
  kondu: { icinde: 287, ustunde: 288, altinda: 289, arkasinda: 290, onunde: 291, yaninda: 292, arasinda: 293 } as Record<Iliski, number>,
  oyuncak: 294, bitti: 295,
  /** Göz kapalıyken birlikte sayılır: "Bir. İki. Üç." (sözler 32–34). */
  bir: 32, iki: 33, uc: 34,
} as const;
/** Astra M33 (`assets/matematik/saklambac/`): fon, dört saklanma yeri (sandığın arka ve ön yüzü ayrı), Lokum'un dört pozu, iki eşya. */
export const SAKLAMBAC_CIZIMLERI = [
  'lokum-odasi', 'sandik-arka', 'sandik-on', 'masa', 'koltuk', 'minderler',
  'lokum-cik', 'lokum-emekle', 'lokum-bak', 'lokum-sevinc', 'top', 'ayicik',
] as const;
/** Kapı ve yeni-turlar.ts → YENI_SOZ için iç içe söz numaralarının düz listesi ("koy.icinde": 279 …). */
export function duzSozler(o: object): Record<string, number> {
  const d: Record<string, number> = {};
  for (const [a, v] of Object.entries(o)) {
    if (typeof v === 'number') d[a] = v;
    else for (const [b, n] of Object.entries(v as Record<string, number>)) d[a + '.' + b] = n;
  }
  return d;
}

// ----- M34 · Kaydırak Sırası -----
export const DOSTLAR = ['kino', 'lokum', 'mino', 'zipzip', 'bulut'] as const;
export type Dost = (typeof DOSTLAR)[number];
export const DOST_ADI: Record<Dost, string> = { kino: 'Kino', lokum: 'Lokum', mino: 'Mino', zipzip: 'Zıpzıp', bulut: 'Bulut' };
/** "kim": o sıradaki arkadaşa dokun; "son": sonuncuya dokun; "kacinci": o sıradaki arkadaşın sırasını rakamla seç (5+). */
export type SiraSorusu = { tur: 'kim'; sira: number } | { tur: 'son' } | { tur: 'kacinci'; sira: number };
export type KaydirakTuru = { dizi: Dost[]; sorular: SiraSorusu[] };
const kim = (sira: number): SiraSorusu => ({ tur: 'kim', sira }), son: SiraSorusu = { tur: 'son' };
const kac = (sira: number): SiraSorusu => ({ tur: 'kacinci', sira });
/**
 * Turun dizisi ve soruları gelişe göre. Her sorudan sonra birinci kayar ve sıranın sonuna geçer (sıra ilerler, herkesin
 * sırası değişir); sorular o anki sıraya göre. 2–3 yaş üç arkadaş, birinci ve sonuncu (zor basamakta ikinci); 4 yaş dört
 * arkadaş, ikinci–dördüncü ve sonuncu; 5+ beş arkadaş, beşinciye kadar ve "Bulut kaçıncı sırada?" (rakam kartı).
 */
export function kaydirakTuru(yol: Yol, tekrar = 0): KaydirakTuru {
  const T = (dizi: Dost[], sorular: SiraSorusu[]): KaydirakTuru => ({ dizi, sorular });
  const h: Havuzlar<KaydirakTuru> = yol === 'minik'
    ? [[T(['kino', 'lokum', 'mino'], [kim(1), son])], [T(['mino', 'kino', 'lokum'], [son, kim(1)])],
      [T(['lokum', 'mino', 'kino'], [kim(1), kim(2)]), T(['kino', 'mino', 'lokum'], [son, kim(2)])]]
    : yol === 'dort'
      ? [[T(['kino', 'lokum', 'mino', 'zipzip'], [kim(2), kim(3), son])], [T(['zipzip', 'mino', 'kino', 'lokum'], [kim(3), son, kim(2)])],
        [T(['lokum', 'zipzip', 'kino', 'mino'], [kim(4), kim(2), kim(3)]), T(['mino', 'kino', 'zipzip', 'lokum'], [son, kim(3), kim(2)])]]
      : [[T(['kino', 'lokum', 'mino', 'zipzip', 'bulut'], [kim(3), kac(4), kim(5)])], [T(['bulut', 'zipzip', 'kino', 'mino', 'lokum'], [kim(4), kac(3), son])],
        [T(['mino', 'bulut', 'lokum', 'kino', 'zipzip'], [kac(5), kim(2), kac(3)]), T(['zipzip', 'kino', 'bulut', 'lokum', 'mino'], [kim(5), kac(2), kim(4)])]];
  const s = gelisSorusu(h, tekrar);
  return { dizi: [...s.dizi], sorular: s.sorular.map((q) => ({ ...q })) };
}
/** Sorunun cevabı: kaydırağa en yakın 1 olmak üzere sıra. */
export const cevapSirasi = (dizi: readonly Dost[], q: SiraSorusu) => (q.tur === 'son' ? dizi.length : q.sira);
/** Birinci kaydı, sıranın sonuna geçti: herkes bir öne. */
export const siraIlerle = (dizi: readonly Dost[]): Dost[] => [...dizi.slice(1), dizi[0]];
/** Soru sırasında dizi (her sorudan önce sıra bir kez ilerlemiştir). */
export const soruDizisi = (t: KaydirakTuru, soru: number): Dost[] => {
  let d = [...t.dizi];
  for (let i = 0; i < soru; i++) d = siraIlerle(d);
  return d;
};
/** "Kaçıncı?" için kartlar: 1'den dizinin boyuna kadar rakamlar. */
export const siraKartlari = (n: number) => Array.from({ length: n }, (_, i) => i + 1);
/**
 * Fon `park-kaydirak` (1672 × 941): solda kaydırak. Merdiven tabanı (610, 860), tepesi platform (480, 345); kayma oluğu
 * platformun sol ucundan (420, 360) aşağı (70, 770); oluğun ucu yere paralel (20…150, y 790). Sıra yerleri sağa doğru,
 * ayak ortaları x 720, 910, 1100, 1290, 1480; zemin y 860. Arkadaş pozu 320 × 400, ayak tabanı tuvalde y 390.
 */
export const SIRA_X = [720, 910, 1100, 1290, 1480] as const;
export const ZEMIN_Y = 860;
export const POZ = { w: 320, h: 400, taban: 390, dokun: 170 } as const;
export const MERDIVEN = { alt: { x: 610, y: 860 }, ust: { x: 480, y: 345 } } as const;
export const OLUK = { bas: { x: 420, y: 360 }, son: { x: 70, y: 770 }, uc: { x: 20, y: 790 } } as const;
/** Kayış pozu (320 × 300): oturma noktası tuvalde (160, 230) oluğun üstünde kayar. */
export const KAYIS = { w: 320, h: 300, oturma: { x: 160, y: 230 } } as const;
export const KAYDIRAK_SOZ = {
  giris: 296,
  kim: { 1: 297, 2: 298, 3: 299, 4: 300, 5: 301 } as Record<number, number>,
  son: 302,
  kac: { kino: 303, lokum: 304, mino: 305, zipzip: 306, bulut: 307 } as Record<Dost, number>,
  ipucu: 308,
  sira: { 1: 309, 2: 310, 3: 311, 4: 312, 5: 313 } as Record<number, number>,
  sonuncu: 314, kaydi: 315, hepsi: 316, bitti: 317, evet: 318,
} as const;
/** Astra M34 (`assets/matematik/kaydirak-sirasi/`): park fonu (kaydırak fonun içinde), her arkadaşın bekleme ve kayış pozu. */
export const KAYDIRAK_CIZIMLERI = ['park-kaydirak', ...DOSTLAR.flatMap((d) => [d + '-bekle', d + '-kay'])] as const;
/** Sorunun Ceren sözü (o anki diziye göre). */
export const soruSozu = (dizi: readonly Dost[], q: SiraSorusu) =>
  q.tur === 'son' ? KAYDIRAK_SOZ.son : q.tur === 'kim' ? KAYDIRAK_SOZ.kim[q.sira] : KAYDIRAK_SOZ.kac[dizi[q.sira - 1]];
