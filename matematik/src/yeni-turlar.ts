// Matematik · eksik üç beceri için yeni oyuncak turları (yönetici kararı 20 Kasım; Antigravity CEVAP-06 B2, C2, D2):
// "Lokum'un İki Kâsesi" (parça-bütün), "Zıpzıp'ın Saklı Fındıkları" (gizli miktar), "Baba'nın Takım Çantası" (sınıflama).
// DOM'suz kurallar (birim testleri buradan sınar). Çizimler: Astra Paket M10–M12.
// Tur sayısı değişmez: yeni tur, sırada aynı türün ikinci kez geldiği bir turun yerine geçer (Boy Duvarı gibi); çizimleri
// ve sesleri tamam değilse eski tur oynar. Kural korunur: bir oyuncakta aynı tür en çok iki kez, arka arkaya değil.
import { EK, ekAdi, type Kose, type Yol } from './tur-sirasi';
import { basamak, gelisSorusu, type Havuzlar } from './derinlik';
import { SOFRA_CIZIMLERI, SOFRA_SOZ } from './aile-sofrasi';
import { ES_CIZIMLERI, ES_SOZ } from './es-kartlar';
import { KUTU_CIZIMLERI, KUTU_SOZ } from './sekil-kutusu';
import { KAYDIRAK_CIZIMLERI, KAYDIRAK_SOZ, SAKLAMBAC_CIZIMLERI, SAKLAMBAC_SOZ, duzSozler } from './konum-sira';

/** Yaşın [kolay, orta, zor] havuzundan bu gelişin sorusu (derinlik.ts; zor: akıllı tekrar defterindeki sayılar). */
const sec = gelisSorusu;

export type YeniTur = 'lokum' | 'zipzip' | 'baba'
  // İçerik paketi M14–M24 (20 Kasım gece; yönetici sırası): Sayı masası, Şekil evi, Fener tiyatrosu.
  | 'sandik' | 'kurabiye' | 'tren' | 'balon' | 'kek' | 'asansor' | 'sekilbahce' | 'resim' | 'buyuyen' | 'bayrak' | 'calgi'
  // Ölçü tezgâhı 2. dalga M25–M27 (danışman ONERI-08 bölüm 6).
  | 'surahi' | 'yarim' | 'gun'
  // 5+ yaşın eksik iki becerisi (21 Kasım): ritmik sayma (Fener tiyatrosu), eşit paylaştırma (Ölçü tezgâhı).
  | 'ritim' | 'pay'
  // Okul öncesinin eksik üç konusu (21 Kasım sabah): geriye sayma, simetri, veri (roket-kelebek-grafik.ts).
  | 'roket' | 'kelebek' | 'grafik'
  // Okul öncesinin eksik iki konusu daha (22 Kasım gecesi): konum sözcükleri, sıra sayıları (konum-sira.ts).
  | 'saklambac' | 'kaydirak'
  // 2–3 yaş yolunun en kısa oyuncağı Ölçü'ye: büyüklüğe göre eşleme ve sıralama (aile-sofrasi.ts).
  | 'sofra'
  // 2–3 yaşın ikinci kısa oyuncağı Fener'e: görsel bellek ve eşleme (es-kartlar.ts).
  | 'eskart'
  // 2–3 yaşın üçüncü kısa oyuncağı Şekil'e: şekil tanıma ve eşleme (sekil-kutusu.ts).
  | 'kutu';
/** Turun oyuncağı (test kipinde ?yenitur=<ad> o oyuncağın her turunda bu turu açar). */
export const YENI_KOSE: Record<YeniTur, Kose> = {
  lokum: 'sayi', zipzip: 'sayi', baba: 'sekil',
  sandik: 'sayi', kurabiye: 'sayi', tren: 'sayi', balon: 'sayi', kek: 'sayi', asansor: 'sayi',
  sekilbahce: 'sekil', resim: 'sekil', buyuyen: 'fener', bayrak: 'fener', calgi: 'fener',
  surahi: 'olcu', yarim: 'olcu', gun: 'olcu', ritim: 'fener', pay: 'olcu',
  roket: 'sayi', kelebek: 'sekil', grafik: 'olcu',
  saklambac: 'sekil', kaydirak: 'fener', sofra: 'olcu', eskart: 'fener', kutu: 'sekil',
};
/**
 * Yer değiştiren yeni turlar: hangi yaşta hangi eski turun (tur numarası) yerine geçer. Lokum ve Baba aynı türün ikinci
 * gelişinin yerindedir. Öbür yeni turlar (Zıpzıp dahil) sıranın sonuna eklenir (tur-sirasi.ts → EK_TURLAR).
 */
export const YENI_TUR: Record<Yol, Partial<Record<Kose, Record<number, YeniTur>>>> = {
  minik: { sekil: { 6: 'baba' } },
  // 4 yaş Sayı masası: ikinci "say" (6) → Lokum.
  dort: { sayi: { 6: 'lokum' }, sekil: { 6: 'baba' } },
  // 5+ yaş: "4 + 3" (11) → Lokum (7 = 4 + 3). Şekil evinde ikinci konum (10) → Baba.
  bes: { sayi: { 11: 'lokum' }, sekil: { 10: 'baba' } },
};
/** Sıradaki tur numarasının yeni turu: ek tur kodu (100+) ya da yer değiştiren tur (Tahterevalli ayrı: tahterevalliYeri). */
export const yeniTur = (yol: Yol, k: Kose, n: number): YeniTur | undefined => {
  const ek = ekAdi(n);
  if (ek) return ek === 'tahterevalli' ? undefined : (ek as YeniTur);
  return YENI_TUR[yol][k]?.[n];
};
/** "Bulut'un Tahterevalli Dengesi" (tahterevalli.ts): Ölçü tezgâhının ek turu (terazi turları yerinde kaldı). */
export const tahterevalliYeri = (_yol: Yol, k: Kose, n: number) => k === 'olcu' && n === EK.tahterevalli;

// ----- Lokum'un İki Kâsesi: aynı sayıyı Kino'nun ve Lokum'un kâselerine iki farklı biçimde böl -----
/** Mandalina sayısı, gelişe göre büyür: 4 yaş 3 → 4 → 5, 5+ 6 → 8 → 10 (zor basamakta 10, 9, 7 sırayla). */
export const lokumSayisi = (yol: Yol, tekrar = 0, zor: readonly number[] = []) =>
  sec<number>(yol === 'bes' ? [[6], [8], [10, 9, 7]] : [[3], [4], [5, 4]], tekrar, zor, (n) => [n]);
/** Kaç farklı bölüşüm istenir (sonra ikisi afiyetle yer). */
export const BOLUSUM = 2;
export type Bolusum = [number, number];
/** Bölüşüm bitti mi: ortada mandalina kalmadı ve ikisi de en az bir tane aldı. */
export const bolusumTamam = (n: number, sol: number, sag: number) => sol + sag === n && sol > 0 && sag > 0;
/** Yeni bölüşüm öncekilerden farklı mı (Kino'ya üç Lokum'a iki, Kino'ya iki Lokum'a üçten farklıdır). */
export const farkliMi = (onceki: readonly Bolusum[], b: Bolusum) => !onceki.some(([a, c]) => a === b[0] && c === b[1]);

// ----- Zıpzıp'ın Saklı Fındıkları: sepetin altında kaç fındık var -----
export type Sakli = { toplam: number; gizli: number; secenek: number[] };
/** 4 yaş toplam 4–5, 5+ 6–9; gizli en az 1, en az 1 de dışarıda kalır. Seçenekler: doğru ve iki yakın sayı (1…toplam). */
const secenekler = (toplam: number, gizli: number) => {
  const aday = [gizli - 1, gizli + 1, gizli + 2, gizli - 2].filter((x) => x >= 1 && x <= toplam && x !== gizli);
  return [gizli, aday[0], aday[1]].sort((a, b) => a - b);
};
/** Gelişe göre büyür: 4 yaş 4 → 5 → 5 (üçü saklı), 5+ 6 → 7 → 9 (zor basamakta 9, 8 sırayla). [toplam, saklı]; iki parça hiç eşit değil. */
export function sakliSoru(yol: Yol, tekrar = 0, zor: readonly number[] = []): Sakli {
  const h: Havuzlar<readonly [number, number]> = yol === 'bes' ? [[[6, 2]], [[7, 3]], [[9, 4], [8, 5], [9, 5]]] : [[[4, 3]], [[5, 2]], [[5, 3], [4, 1]]];
  const [toplam, gizli] = sec(h, tekrar, zor, ([t, g]) => [g, t - g]);
  return { toplam, gizli, secenek: secenekler(toplam, gizli) };
}
/** Turun iki sorusu: aynı fındıklar; önce bir kısmı, sonra öbür kısmı saklanır (5 = 2 + 3, sonra 3 + 2: parça-bütün). */
export function sakliSorular(yol: Yol, tekrar = 0, zor: readonly number[] = []): Sakli[] {
  const a = sakliSoru(yol, tekrar, zor);
  const g = a.toplam - a.gizli;
  return [a, { toplam: a.toplam, gizli: g, secenek: secenekler(a.toplam, g) }];
}
/**
 * Fındıkların kütükteki yeri (Astra'nın fonu agac-dibi 1672 × 941, piksel; fındığın merkezi). Sepet Astra'nın yerleşimindeki
 * gibi x 630, y 450'de (420 × 300): saklanacaklar onun altında iki sıra (en çok 6), dışarıda kalanlar solda tek sıra (en çok 5).
 * Sayarken hepsi açıkta; sepet inince sağdaki küme kapanır. Sıra: önce dışarıdakiler (soldan sağa değil, sepete yakından), sonra gizliler.
 */
export const FINDIK_BOY = 84;
const DISARI = [590, 502, 414, 326, 238].map((x) => ({ x, y: 690 }));
const SEPET_ALTI = [[840, 696], [755, 696], [925, 696], [840, 616], [755, 616], [925, 616]].map(([x, y]) => ({ x, y }));
export function findikYerleri(toplam: number, gizli: number): { x: number; y: number; gizli: boolean }[] {
  const disari = toplam - gizli;
  if (gizli < 1 || disari < 1 || gizli > SEPET_ALTI.length || disari > DISARI.length) throw new Error('fındık sayısı sığmıyor: ' + toplam + '/' + gizli);
  return [...DISARI.slice(0, disari).reverse().map((p) => ({ ...p, gizli: false })), ...SEPET_ALTI.slice(0, gizli).map((p) => ({ ...p, gizli: true }))];
}

// ----- Baba'nın Takım Çantası: parçaları özelliğe göre iki kutuya ayır -----
export type Renk = 'kirmizi' | 'mavi';
export type Bicim = 'daire' | 'kare';
export type Boy = 'buyuk' | 'kucuk';
export type Parca = { renk: Renk; bicim: Bicim; boy: Boy };
export const parcaAdi = (p: Parca) => p.renk + '-' + p.bicim + '-' + p.boy;
export type Olcut = 'renk' | 'bicim' | 'boy';
/**
 * Sınıflama ölçütleri: 2–3 yaş renk, 4 yaş şekil. 5+ yaşta aynı parçalar önce şekle, sonra boya göre yeniden ayrılır
 * (kuralı değiştirip yeniden sınıflama; iki özellik birden).
 */
/** Gelişe göre: 2–3 yaş renk → şekil → renk ve şekil; 4 yaş şekil → boy → renk ve şekil; 5+ şekil ve boy → renk ve boy → üçü. */
export const babaOlcutleri = (yol: Yol, tekrar = 0): readonly Olcut[] => sec<readonly Olcut[]>(
  yol === 'minik' ? [[['renk']], [['bicim']], [['renk', 'bicim'], ['bicim', 'renk']]]
    : yol === 'dort' ? [[['bicim']], [['boy']], [['renk', 'bicim'], ['bicim', 'boy']]]
      : [[['bicim', 'boy']], [['renk', 'boy']], [['bicim', 'renk', 'boy'], ['boy', 'bicim', 'renk']]], tekrar);
/** Parçanın gittiği kutu (0 sol, 1 sağ). */
export function kutusu(o: Olcut, p: Parca): 0 | 1 {
  if (o === 'renk') return p.renk === 'kirmizi' ? 0 : 1;
  if (o === 'bicim') return p.bicim === 'daire' ? 0 : 1;
  return p.boy === 'buyuk' ? 0 : 1;
}
/** Kutuların ön levhasındaki örnek parça: yalnız ölçütün özelliği değişir, öbürleri aynı (çocuk neye bakacağını görür). */
export const etiket = (o: Olcut): [Parca, Parca] =>
  o === 'renk' ? [{ renk: 'kirmizi', bicim: 'kare', boy: 'buyuk' }, { renk: 'mavi', bicim: 'kare', boy: 'buyuk' }]
    : o === 'bicim' ? [{ renk: 'mavi', bicim: 'daire', boy: 'buyuk' }, { renk: 'mavi', bicim: 'kare', boy: 'buyuk' }]
      : [{ renk: 'kirmizi', bicim: 'daire', boy: 'buyuk' }, { renk: 'kirmizi', bicim: 'daire', boy: 'kucuk' }];
/**
 * Tezgâhtaki altı parça (yeniden oynayışta sıra kayar). Her ölçütte iki kutuya üçer parça düşer; öbür özellikler karışık
 * (renk şekli, şekil boyu ele vermesin). 5+ yaşta aynı altı parça iki ölçütte de üçe üç ayrılır.
 */
export function babaParcalari(yol: Yol, tekrar = 0): Parca[] {
  const P = (renk: Renk, bicim: Bicim, boy: Boy): Parca => ({ renk, bicim, boy });
  const liste = yol === 'minik'
    ? [P('kirmizi', 'daire', 'buyuk'), P('mavi', 'kare', 'kucuk'), P('kirmizi', 'kare', 'kucuk'), P('mavi', 'daire', 'buyuk'), P('kirmizi', 'daire', 'kucuk'), P('mavi', 'kare', 'buyuk')]
    : [P('mavi', 'daire', 'kucuk'), P('kirmizi', 'kare', 'buyuk'), P('kirmizi', 'daire', 'buyuk'), P('mavi', 'kare', 'kucuk'), P('kirmizi', 'kare', 'kucuk'), P('mavi', 'daire', 'buyuk')];
  const kay = tekrar % liste.length;
  return [...liste.slice(kay), ...liste.slice(0, kay)];
}

// ----- Çizimler ve sözler (kapı: hepsi tamamsa yeni tur açılır; yoksa eski tur oynar) -----
export const YENI_KLASOR: Record<YeniTur, string> = {
  lokum: 'iki-kase', zipzip: 'sakli-findik', baba: 'takim-cantasi',
  sandik: 'elma-sandik', kurabiye: 'kurabiye', tren: 'sayi-treni', balon: 'balonlar', kek: 'kek-firini', asansor: 'asansor',
  sekilbahce: 'yeni-sekiller', resim: 'resim-yap', buyuyen: 'buyuyen-fener', bayrak: 'senlik-bayraklari', calgi: 'kino-calgi',
  surahi: 'surahi', yarim: 'butun-yarim', gun: 'kino-gunu', ritim: 'ritmik-ziplama', pay: 'esit-paylasim',
  roket: 'roket-geri-sayim', kelebek: 'kelebek-kanadi', grafik: 'meyve-grafigi',
  saklambac: 'saklambac', kaydirak: 'kaydirak-sirasi', sofra: 'aile-sofrasi', eskart: 'es-kartlar', kutu: 'sekil-kutusu',
};
export const YENI_CIZIMLER: Record<YeniTur, readonly string[]> = {
  lokum: ['piknik-masasi', 'kase-kino', 'kase-lokum', 'mandalina', 'kino-kase-0', 'kino-kase-1', 'lokum-kase-0', 'lokum-kase-1'],
  zipzip: ['agac-dibi', 'hasir-sepet', 'findik', 'zipzip-sakla-0', 'zipzip-sakla-1', 'zipzip-sakla-2'],
  baba: ['baba-atolyesi', 'takim-kutusu', ...(['kirmizi', 'mavi'] as const).flatMap((r) => (['daire', 'kare'] as const).flatMap((b) => (['buyuk', 'kucuk'] as const).map((y) => r + '-' + b + '-' + y))), 'baba-takim-0', 'baba-takim-1'],
  // Astra M14–M24 (CLAUDE-ASTRA-MESAJLAR.md 20 Kasım 22:20).
  sandik: ['elma-bahcesi', 'onluk-sandik', 'besli-sepet', 'elma', 'dede-elma-0', 'dede-elma-1'],
  kurabiye: ['babaanne-mutfagi', 'tepsi', 'kurabiye', 'kucuk-tabak', 'rakam-bayragi', 'babaanne-kurabiye-0', 'babaanne-kurabiye-1'],
  tren: ['istasyon', 'lokomotif-mino-0', 'lokomotif-mino-1', 'vagon-kirmizi', 'vagon-mavi', 'vagon-sari'],
  balon: ['cayir', 'balon-kirmizi', 'balon-mavi', 'balon-sari', 'bulut-balon-0', 'bulut-balon-1', 'lokum-balon-0', 'lokum-balon-1'],
  kek: ['mutfak-firin', 'kek', 'arti', 'eksi', 'esittir', 'anne-firin-0', 'anne-firin-1'],
  asansor: ['apartman', 'asansor-lokum-0', 'asansor-lokum-1'],
  sekilbahce: ['sekil-bahcesi', 'yumurta', 'oval-ayna', 'deniz-yildizi', 'yildiz-kurabiye', 'kalp-yastik', 'kalp-balon', 'bal-petegi', 'altigen-fayans',
    'oval', 'yildiz', 'kalp', 'altigen', 'kino-sekil-0', 'kino-sekil-1'],
  resim: ['resim-masasi', 'ev-taslak', 'ev-cati', 'ev-govde', 'ev-kapi', 'ev-pencere', 'ev-canli',
    'roket-taslak', 'roket-burun', 'roket-govde', 'roket-pencere', 'roket-kanat-sol', 'roket-kanat-sag', 'roket-canli'],
  buyuyen: ['fener-sahnesi', 'kagit-fener-sari', 'kagit-fener-mavi', 'mino-fener-0', 'mino-fener-1'],
  bayrak: ['bayrak-direkleri', 'bayrak-kirmizi-ucgen', 'bayrak-mavi-kare', 'bayrak-sari-daire', 'bayrak-yesil-ucgen', 'zipzip-bayrak-0', 'zipzip-bayrak-1'],
  calgi: ['muzik-kosesi', 'kart-davul', 'kart-cingirak', 'kart-alkis', 'kino-davul', 'kino-cingirak', 'kino-alkis'],
  // Astra M25–M27 (CLAUDE-ASTRA-MESAJLAR.md 20 Kasım 22:45).
  surahi: ['mutfak-tezgahi', 'bardak-bos', 'bardak-yarim', 'bardak-dolu', 'surahi-dolu', 'surahi-yarim', 'surahi-bos', 'surahi-egik', 'anne-surahi-0', 'anne-surahi-1'],
  yarim: ['kesme-tahtasi', 'tahta-bicak', 'babaanne-yarim-0', 'babaanne-yarim-1', ...['elma', 'armut', 'ekmek', 'simit'].flatMap((y) => [y + '-butun', y + '-sol', y + '-sag'])],
  gun: ['zaman-duvari', 'kart-uyanma', 'kart-oyun', 'kart-uyku', 'kart-kar-yagiyor', 'kart-kardan-adam', 'kart-eriyor', 'kino-gun-0', 'kino-gun-1'],
  // Astra M28, M29 (CLAUDE-ASTRA-MESAJLAR.md 21 Kasım 06:40). Ritim ayrıca 0 rakam bloğunu ister (ek-turlar.ts).
  ritim: ['dere-kenari', 'tas', 'tas-parlak', 'su-halkasi', 'zipzip-zipla-0', 'zipzip-zipla-1', 'zipzip-zipla-2'],
  pay: ['cay-masasi', 'terazi-direk', 'terazi-cubuk-2', 'terazi-cubuk-3', 'askili-tabak', 'babaanne-pay-0', 'babaanne-pay-1', 'kurabiye-yuvarlak', 'kurabiye-kavanozu'],
  // Astra M30–M32 (CLAUDE-ASTRA-MESAJLAR.md 21 Kasım 07:51). Roket ayrıca 0 rakam bloğunu ister (ek-turlar.ts).
  roket: ['roket-alani', 'roket', 'alev', 'duman', 'mino-kask-0', 'mino-kask-1'],
  // Sağ kanat ayrı çizim değil: brief'teki "kanat-sol'un tam ayna görüntüsü", kod aynalar (simetri birebir).
  kelebek: ['cicek-cayiri', 'kelebek-govde', 'kanat-sol', 'benek-mavi', 'benek-turuncu', 'lokum-kelebek-0', 'lokum-kelebek-1'],
  grafik: ['meyve-bahcesi', 'grafik-panosu', 'meyve-sepeti', 'elma-grafik', 'armut-grafik', 'muz-grafik', 'dede-sepet-0', 'dede-sepet-1'],
  // Astra M33–M34 (CLAUDE-ASTRA-MESAJLAR.md 22 Kasım).
  saklambac: SAKLAMBAC_CIZIMLERI,
  kaydirak: KAYDIRAK_CIZIMLERI,
  // Astra M35 (CLAUDE-ASTRA-MESAJLAR.md 22 Kasım sabahı).
  sofra: SOFRA_CIZIMLERI,
  // Astra M36.
  eskart: ES_CIZIMLERI,
  // Astra M37.
  kutu: KUTU_CIZIMLERI,
};
/** Ceren'in sözleri (sozler.json sırası). */
export const YENI_SOZ = {
  lokum: { yonerge: 121, baskaTurlu: 122, ayni: 123, ikisineDe: 124, afiyet: 125 },
  zipzip: { say: 126, sakladi: 127, ipucu: 128, buldun: 129 },
  baba: { renk: 130, bicim: 131, boy: 132, ipucu: 133, bitti: 134 },
  sandik: { yonerge: 135, doldu: 136, hazir: 137 },
  kurabiye: { yonerge: 138, sayalim: 139, afiyet: 140 },
  // 2. ve 3. geliş (derinlik.ts): eksik vagon, büyükten küçüğe, ikişer ikişer.
  tren: { yonerge: 141, ipucu: 142, hazir: 143, eksik: 258, eksikIpucu: 259, geri: 260, ikiser: 261, ikiserIpucu: 262 },
  balon: { say: 144, getirdi: 145, uctu: 146, kac: 147, ipucu: 148 },
  // 3. geliş (derinlik.ts): eksik toplanan ("6 + ? = 9"); "Kaç?" işlemi okurken.
  kek: { yonerge: 149, arti: 150, eksi: 151, esittir: 152, ipucu: 153, hazir: 154, eksik: 263, kac: 264 },
  asansor: { yonerge: 155, fazla: 156, eksik: 157, ipucuFazla: 158, ipucuEksik: 159, vardi: 160 },
  sekilbahce: { tanitOval: 161, tanitYildiz: 162, tanitKalp: 163, tanitAltigen: 164, bulOval: 165, bulYildiz: 166, bulKalp: 167, bulAltigen: 168, ipucu: 169, bitti: 170 },
  resim: { ev: 171, roket: 172, ipucu: 173, ucgen: 174, kare: 175, dikdortgen: 176, daire: 177, evBitti: 178, roketBitti: 179 },
  buyuyen: { yonerge: 180, birFazla: 181, ikiFazla: 182, parladi: 183 },
  bayrak: { yonerge: 184, ipucu: 185, tamam: 186 },
  // 3. geliş 5+ (derinlik.ts): dört kartlık birim.
  calgi: { ikiKart: 187, ucKart: 188, kinoSurdursun: 189, siradaki: 190, guzel: 191, dortKart: 265 },
  surahi: { yonerge: 192, yarim: 193, doldu: 194, dolu: 195, bos: 196, yarimBul: 197, kacBardak: 198, bitti: 199 },
  yarim: { bol: 200, ikiYarim: 201, birlestir: 202, birButun: 203, kacButun: 204, afiyet: 140 },
  gun: { sirala: 205, gunduzGece: 206, sabah: 207, oglen: 208, aksam: 209, gunduz: 210, gece: 211, kar: 212, kardanAdam: 213, eridi: 214, ipucu: 215, bitti: 216 },
  // 3. geliş (derinlik.ts): 5'er 35'e, 10'ar 100'e kadar: 35, 70, 80, 90, 100 de okunur.
  ritim: { iki: 217, bes: 218, on: 219, ipucu: 220, vardi: 221, otuz: 222, kirk: 223, elli: 224, altmis: 225, yetmis: 226, seksen: 227, doksan: 228, yuz: 229, yirmiBes: 235, otuzBes: 257 },
  pay: { ikiTabak: 230, ucTabak: 231, egildi: 232, esit: 233, ayni: 234, afiyet: 140 },
  roket: { yonerge: 236, ipucu: 237, kalkis: 238, ikinci: 239, birlikte: 240, bitti: 241 },
  kelebek: { yonerge: 242, ipucu: 243, ikiRenk: 244, uctu: 245, yeni: 246 },
  grafik: { yonerge: 247, enCok: 248, enAz: 249, elmaArmut: 250, armutMuz: 251, ipucuCok: 252, ipucuAz: 253, ipucuFazla: 254, dogru: 255, bitti: 256 },
  // 266–295 ve göz kapalıyken "Bir. İki. Üç." (32–34); 296–318.
  saklambac: duzSozler(SAKLAMBAC_SOZ),
  kaydirak: duzSozler(KAYDIRAK_SOZ),
  // 319–335 ve Lokum'un "Afiyet olsun!" (125).
  sofra: duzSozler(SOFRA_SOZ),
  // 336–347 ve ikişer sayma (33, 35, 37, 39).
  eskart: duzSozler(ES_SOZ),
  // 348–357.
  kutu: duzSozler(KUTU_SOZ),
} as const;

// ----- M14 · Dede'nin Elma Sandıkları: ağaçtaki elmalar onluk sandığa (2–3 yaşta beşlik sepete) toplanır -----
/** Elma sayısı gelişe göre büyür: 2–3 yaş 3 → 4 → 5, 4 yaş 6 → 8 → 10, 5+ 11–14 → 15–17 → 18–20. */
export const elmaSayisi = (yol: Yol, tekrar = 0, zor: readonly number[] = []) => sec<number>(
  yol === 'minik' ? [[3, 4], [4, 5], [5, 4]] : yol === 'dort' ? [[6, 7], [8, 9], [10, 9, 8]] : [[12, 11, 13, 14], [15, 16, 17], [18, 20, 19]],
  tekrar, zor, (n) => [n]);
/** Kaplar: 2–3 yaşta bir beşlik sepet, 4 yaşta bir onluk sandık, 5+ yaşta iki onluk sandık (on ve birlikler). */
export type ElmaKabi = 'sepet' | 'sandik';
export const elmaKaplari = (yol: Yol): ElmaKabi[] => (yol === 'minik' ? ['sepet'] : yol === 'dort' ? ['sandik'] : ['sandik', 'sandik']);
export const KAP_GOZU: Record<ElmaKabi, number> = { sepet: 5, sandik: 10 };
/**
 * Ağaçtaki elmaların yeri (Astra'nın fonu elma-bahcesi 1672 × 941, piksel; elmanın merkezi). Taç x 60…600, y 60…440; ağaçta
 * aynı anda en çok on elma (5+ yaşta ilk sandık dolunca ağaçta yenileri belirir). Sol üst köşe (x < 198, y < 208) boş kalır:
 * telefonda "Oyuncaklara dön" düğmesi orada.
 */
export const ELMA_BOY = 96;
export const AGACTA_EN_COK = 10;
const AGAC = [
  ...[250, 350, 450, 550].map((x) => ({ x, y: 150 })),
  ...[200, 300, 400, 500].map((x) => ({ x, y: 245 })),
  ...[150, 250, 350, 450, 550].map((x) => ({ x, y: 340 })),
];
const AGAC_SIRASI = [5, 6, 1, 2, 9, 10, 0, 7, 11, 4, 3, 8, 12];
export const elmaYerleri = (n: number) => AGAC_SIRASI.slice(0, Math.min(n, AGACTA_EN_COK)).map((i) => AGAC[i]);
/**
 * Kabın göz merkezleri (kabın kendi tuvalinde, piksel; Astra'nın çiziminden ölçüldü): sandık 600 × 320 (iki sıra × beş),
 * sepet 400 × 180 (tek sıra beş).
 */
const SANDIK_X = [94, 198, 300, 402, 505], SANDIK_Y = [110, 227];
export function kapGozleri(kap: ElmaKabi): { x: number; y: number }[] {
  if (kap === 'sepet') return [67, 132, 198, 266, 335].map((x) => ({ x, y: 100 }));
  return Array.from({ length: 10 }, (_, i) => ({ x: SANDIK_X[i % 5], y: SANDIK_Y[Math.floor(i / 5)] }));
}

// ----- M15 · Babaanne'nin Kurabiye Tepsileri: tepsideki kurabiyeleri say, doğru rakam bayrağını dik -----
/** Tepsilerdeki kurabiye sayıları gelişe göre büyür: 2–3 yaş iki tepsi 1–5, 4 yaş üç tepsi 1–5 → 3–9 → 6–10, 5+ iki tepsi 11–15 → 16–19 → 17–20. */
export function kurabiyeSayilari(yol: Yol, tekrar = 0, zor: readonly number[] = []): number[] {
  const h: Havuzlar<readonly number[]> = yol === 'minik' ? [[[2, 3], [1, 3]], [[3, 5], [4, 2]], [[5, 4], [4, 5]]]
    : yol === 'dort' ? [[[2, 4, 5], [3, 1, 5]], [[6, 3, 8], [7, 4, 9]], [[8, 10, 7], [9, 6, 10]]]
      // 5+: 11–15 → 16–19 → iki tepsi dolusu (20) ve yakınları.
      : [[[12, 14], [13, 11], [15, 12]], [[16, 18], [17, 19]], [[20, 17], [19, 20], [18, 20]]];
  return sec(h, tekrar, zor, (x) => x).slice();
}
/** Üç bayrak: doğru sayı ve iki yakın sayı (yaşın aralığında), küçükten büyüğe. */
export function bayrakSecenekleri(dogru: number, en: number, ust: number): number[] {
  const aday = [dogru + 1, dogru - 1, dogru + 2, dogru - 2, dogru + 3, dogru - 3].filter((x) => x >= en && x <= ust);
  return [dogru, aday[0], aday[1]].sort((a, b) => a - b);
}
/** Tepsinin yuva merkezleri (tepsi tuvali 520 × 300, piksel; Astra'nın çiziminden ölçüldü): iki sıra × beş. */
export const TEPSI_X = [74, 166, 258, 350, 442], TEPSI_Y = [100, 211];

// ----- M16 · Mino'nun Sayı Treni: rakamlı vagonları lokomotifin arkasına sırayla tak -----
/**
 * Trenin işi gelişe göre değişir: 1. geliş ardışık sayıları sırayla tak (2–3 yaş 1–3, 4 yaş 1–5, 5+ 11–15); 2. geliş trende
 * eksik vagon(lar)ı bul (5+ iki eksik); 3. geliş 4 yaş büyükten küçüğe, 5+ ikişer ikişer (ya da büyükten küçüğe).
 * `sayilar` takılış sırası (lokomotifin hemen arkasından başlayarak); `eksik` 2. gelişte boş kalan yerler; `secenek` peronda
 * bekleyen vagonlar (eksikler ve trende olmayan yakın sayılar).
 */
export type TrenIsi = 'sirala' | 'eksik' | 'geri' | 'ikiser';
export type TrenTuru = { is: TrenIsi; sayilar: number[]; eksik: number[]; secenek: number[] };
const ardisik = (bas: number, n: number, adim = 1) => Array.from({ length: n }, (_, i) => bas + i * adim);
function eksikTren(sayilar: number[], eksik: number[], cel: number[]): TrenTuru {
  return { is: 'eksik', sayilar, eksik, secenek: [...eksik.map((i) => sayilar[i]), ...cel].sort((a, b) => a - b) };
}
export function trenTuru(yol: Yol, tekrar = 0, zor: readonly number[] = []): TrenTuru {
  const sirala = (s: number[], is: TrenIsi = 'sirala'): TrenTuru => ({ is, sayilar: s, eksik: [], secenek: s.slice() });
  const h: Havuzlar<TrenTuru> = yol === 'minik'
    ? [[sirala(ardisik(1, 3))], [eksikTren(ardisik(1, 3), [1], [4, 5])], [sirala(ardisik(1, 4)), sirala(ardisik(2, 4))]]
    : yol === 'dort'
      ? [[sirala(ardisik(1, 5)), sirala(ardisik(2, 5))], [eksikTren(ardisik(2, 5), [2], [1, 8]), eksikTren(ardisik(3, 5), [3], [2, 9])],
        [sirala(ardisik(5, 5, -1), 'geri'), sirala(ardisik(8, 5, -1), 'geri'), sirala(ardisik(10, 5, -1), 'geri')]]
      : [[sirala(ardisik(11, 5)), sirala(ardisik(12, 5))], [eksikTren(ardisik(13, 5), [1, 3], [12, 18]), eksikTren(ardisik(14, 5), [1, 3], [13, 19])],
        [sirala(ardisik(12, 5, 2), 'ikiser'), sirala(ardisik(20, 5, -1), 'geri'), sirala(ardisik(11, 5, 2), 'ikiser')]];
  const t = sec(h, tekrar, zor, (x) => (x.is === 'eksik' ? x.eksik.map((i) => x.sayilar[i]) : x.sayilar));
  return { ...t, sayilar: t.sayilar.slice(), eksik: t.eksik.slice(), secenek: t.secenek.slice() };
}
/** Eski adla: trenin takılış sırasındaki sayılar. */
export const trenSayilari = (yol: Yol, tekrar = 0) => trenTuru(yol, tekrar).sayilar;
/** Perondaki karışık sıra (hiçbiri kendi yerinde değil; yeniden oynayışta değişir). */
export function karisikSira(n: number, tekrar = 0): number[] {
  // Döndürme (1…n−1 adım) hiçbir vagonu kendi yerinde bırakmaz.
  const kaydir = 1 + (tekrar % (n - 1));
  return Array.from({ length: n }, (_, i) => (i + kaydir) % n);
}

// ----- M17 · Bulut'un Balonları: nesneyle toplama ve çıkarma -----
/**
 * Turun iki sorusu: önce Lokum balon getirir (toplama), sonra birkaçı uçar (çıkarma; ikinci soru birincinin sonucundan başlar).
 * [başta, gelen, uçan]: 2–3 yaş bir ekle bir uçur (3'e kadar), 4 yaş 5'e kadar, 5+ 10'a kadar.
 */
export type BalonTuru = { basta: number; gelen: number; ucan: number };
/** Gelişe göre büyür: 2–3 yaş 2'ye → 3'e kadar, 4 yaş 3 → 5 → 5 (büyük sıçrama), 5+ 5 → 8 → 10. */
export function balonTuru(yol: Yol, tekrar = 0, zor: readonly number[] = []): BalonTuru {
  const h: Havuzlar<readonly [number, number, number]> = yol === 'minik' ? [[[1, 1, 1]], [[2, 1, 1]], [[2, 1, 2], [1, 2, 2]]]
    : yol === 'dort' ? [[[2, 1, 1], [1, 2, 1]], [[3, 2, 2], [2, 2, 3]], [[1, 4, 3], [3, 2, 4], [2, 3, 4]]]
      : [[[3, 2, 2], [4, 1, 3]], [[5, 3, 4], [4, 4, 3]], [[6, 4, 7], [7, 3, 6], [3, 6, 5]]];
  const [basta, gelen, ucan] = sec(h, tekrar, zor, ([b, g, u]) => [b + g, b + g - u]);
  return { basta, gelen, ucan };
}
/** Üç rakam: doğru sonuç ve iki yakın sayı (0…10). */
export function balonSecenekleri(dogru: number): number[] {
  const aday = [dogru + 1, dogru - 1, dogru + 2, dogru - 2, dogru + 3].filter((x) => x >= 1 && x <= 10);
  return [dogru, aday[0], aday[1]].sort((a, b) => a - b);
}
/** Balonların ipi bir noktada toplanır; gövdeler yelpaze gibi açılır: açı (derece) ve ip uzunluğu çarpanı. */
export function balonYelpazesi(n: number): { aci: number; boy: number }[] {
  // Uzun ipli balon (160 × 520, ip ucu 80, 515). Yelpaze yumruktan sağa ve yukarı açılır (−36°…80°; Astra'nın gerçek tarayıcı
  // denemesi); her balonun tepesi sahnenin üstünden taşmaz: yumruk y 390, kenar payı 20 px.
  return Array.from({ length: n }, (_, i) => {
    const aci = n === 1 ? 10 : -36 + (116 * i) / (n - 1), a = (aci * Math.PI) / 180;
    const eski = n > 4 && i % 2 ? 0.86 : 0.72;
    return { aci, boy: Math.min(eski, (390 - 20) / (515 * Math.cos(a) + 80 * Math.abs(Math.sin(a)))) };
  });
}

// ----- M18 · Anne'nin Kek Fırını: rakamla toplama ve çıkarma -----
/** `bilinmeyen`: soru işaretinin yeri (sonuç ya da eklenen: "6 + ? = 9"). `cevap`: çocuğun seçeceği sayı. */
export type Islem = { a: number; isaret: '+' | '-'; b: number; sonuc: number; bilinmeyen: 'sonuc' | 'b'; cevap: number };
const islem = (a: number, isaret: '+' | '-', b: number): Islem => {
  const sonuc = isaret === '+' ? a + b : a - b;
  return { a, isaret, b, sonuc, bilinmeyen: 'sonuc', cevap: sonuc };
};
/** Eksik toplanan: a + ? = sonuç. */
const eksik = (a: number, sonuc: number): Islem => ({ a, isaret: '+', b: sonuc - a, sonuc, bilinmeyen: 'b', cevap: sonuc - a });
/**
 * Turun iki işlemi gelişe göre: 2–3 yaş küçük toplamalar (resimli) büyür; 4 yaş 4'e kadar → 5'e kadar toplama ve çıkarma →
 * eksik toplanan ("2 + ? = 5"); 5+ 7'ye kadar → 10'a kadar → eksik toplanan ("6 + ? = 9").
 */
export function kekIslemleri(yol: Yol, tekrar = 0, zor: readonly number[] = []): Islem[] {
  const h: Havuzlar<readonly Islem[]> = yol === 'minik'
    ? [[[islem(1, '+', 1), islem(2, '+', 1)]], [[islem(2, '+', 2), islem(1, '+', 3)]], [[islem(3, '+', 1), islem(2, '+', 3)], [islem(4, '+', 1), islem(3, '+', 2)]]]
    : yol === 'dort'
      ? [[[islem(2, '+', 1), islem(3, '-', 1)], [islem(1, '+', 2), islem(4, '-', 1)]], [[islem(2, '+', 3), islem(5, '-', 2)], [islem(3, '+', 2), islem(4, '-', 3)]],
        [[eksik(2, 5), eksik(3, 4)], [eksik(1, 4), eksik(3, 5)], [eksik(2, 4), eksik(1, 5)]]]
      : [[[islem(4, '+', 3), islem(7, '-', 5)], [islem(5, '+', 2), islem(6, '-', 4)]], [[islem(6, '+', 3), islem(10, '-', 4)], [islem(7, '+', 3), islem(9, '-', 6)]],
        [[eksik(6, 9), eksik(4, 10)], [eksik(5, 8), eksik(3, 7)], [eksik(2, 9), eksik(7, 10)]]];
  return sec(h, tekrar, zor, (x) => x.map((i) => i.cevap)).map((i) => ({ ...i }));
}

// ----- M19 · Lokum'un Asansörü: bir fazla, bir eksik -----
/** Apartmanın beş katı ardışık beş sayı taşır (en alt kat `pencere`); Lokum `bas` katından başlar, her adım +1 ya da −1. */
export type AsansorTuru = { pencere: number; bas: number; adimlar: (1 | -1)[] };
/** Gelişe göre: önce yukarı sonra aşağı, sonra karışık, en son beş adımlı ve yön sık değişen yolculuk. */
export function asansorTuru(yol: Yol, tekrar = 0, zor: readonly number[] = []): AsansorTuru {
  const A = (pencere: number, bas: number, adimlar: (1 | -1)[]): AsansorTuru => ({ pencere, bas, adimlar });
  const h: Havuzlar<AsansorTuru> = yol === 'minik'
    ? [[A(1, 1, [1, 1, 1])], [A(1, 2, [1, 1, 1])], [A(1, 1, [1, 1, 1, 1]), A(1, 2, [1, 1, 1])]]
    : yol === 'dort'
      ? [[A(1, 1, [1, 1, -1, -1]), A(4, 5, [1, 1, -1, -1])], [A(1, 2, [1, 1, -1, 1]), A(6, 8, [-1, 1, 1, -1])],
        [A(3, 5, [1, -1, -1, 1, 1]), A(6, 7, [1, 1, -1, -1, -1]), A(4, 6, [-1, -1, 1, 1, 1])]]
      : [[A(11, 12, [1, 1, -1, -1]), A(13, 14, [1, 1, -1, -1])], [A(14, 16, [-1, 1, 1, -1]), A(12, 13, [1, -1, 1, 1])],
        [A(16, 18, [1, -1, -1, 1, -1]), A(12, 14, [-1, -1, 1, 1, 1]), A(15, 17, [1, 1, -1, -1, -1])]];
  const t = sec(h, tekrar, zor, (x) => x.adimlar.map((_, i) => x.bas + x.adimlar.slice(0, i + 1).reduce((a, b) => a + b, 0)));
  return { ...t, adimlar: t.adimlar.slice() };
}
/** Katın ekrandaki yeri: alttan üste beş kat levhası (fon apartman 1672 × 941, levha merkezleri y 810…130). */
export const KAT_Y = [810, 640, 470, 300, 130];

// ----- M20 · Şekil Bahçesi: oval, yıldız, kalp, altıgen -----
export type YeniSekil = 'yildiz' | 'kalp' | 'oval' | 'altigen';
/** Yaşın şekilleri: 2–3 yaş yıldız ve kalp, 4 yaş + oval, 5+ + altıgen. */
export const yeniSekiller = (yol: Yol): YeniSekil[] => (yol === 'minik' ? ['yildiz', 'kalp'] : yol === 'dort' ? ['yildiz', 'kalp', 'oval'] : ['yildiz', 'kalp', 'oval', 'altigen']);
/**
 * Gelişe göre: 1. geliş her şekil tanıtılır; 2. geliş tanıtım yok, sıra başka; 3. geliş bir sonraki yaşın şekli de gelir
 * (yalnız o tanıtılır; 5+ yaşta dört şekil tanıtımsız). Konu defterinde zorlanılan şekil başa alınır (`zorSekil`).
 */
export function sekilBahcesiTuru(yol: Yol, tekrar = 0, zorSekil: readonly string[] = []): { sekiller: YeniSekil[]; tanit: YeniSekil[] } {
  const yas = yeniSekiller(yol), b = basamak(tekrar);
  const kay = (l: YeniSekil[], n: number) => [...l.slice(n % l.length), ...l.slice(0, n % l.length)];
  let sekiller: YeniSekil[], tanit: YeniSekil[];
  if (b === 0) { sekiller = yas; tanit = yas; }
  else if (b === 1) { sekiller = kay(yas, 1); tanit = []; }
  else {
    const ek: YeniSekil[] = yol === 'minik' ? ['oval'] : yol === 'dort' ? ['altigen'] : [];
    sekiller = [...kay(yas, 2 + tekrar), ...ek];
    tanit = ek;
  }
  const one = sekiller.filter((s) => zorSekil.includes(s));
  return { sekiller: [...one, ...sekiller.filter((s) => !one.includes(s))], tanit };
}
/** Her şeklin örtüdeki iki nesnesi (Astra M20). */
export const SEKIL_NESNESI: Record<YeniSekil, [string, string]> = {
  oval: ['yumurta', 'oval-ayna'], yildiz: ['deniz-yildizi', 'yildiz-kurabiye'], kalp: ['kalp-yastik', 'kalp-balon'], altigen: ['bal-petegi', 'altigen-fayans'],
};
/** Örtüdeki altı nesne: şeklin iki nesnesi ve öbür şekillerden dört çeldirici; yerler yeniden oynayışta kayar. */
export function sekilOrtusu(sekil: YeniSekil, tekrar = 0): { ad: string; dogru: boolean }[] {
  const celdirici = (Object.keys(SEKIL_NESNESI) as YeniSekil[]).filter((s) => s !== sekil).flatMap((s) => SEKIL_NESNESI[s]);
  const kay = (tekrar + sekil.length) % celdirici.length;
  const dort = [...celdirici.slice(kay), ...celdirici.slice(0, kay)].slice(0, 4).map((ad) => ({ ad, dogru: false }));
  const [a, b] = SEKIL_NESNESI[sekil].map((ad) => ({ ad, dogru: true }));
  const sira = [dort[0], a, dort[1], dort[2], b, dort[3]];
  const k = tekrar % 3;
  return [...sira.slice(k), ...sira.slice(0, k)];
}
/** Örtüdeki altı yer (fon sekil-bahcesi 1672 × 941; örtü x 90…1580, y 450…880): iki sıra × üç, nesnenin merkezi. */
export const ORTU_YERI = [{ x: 560, y: 560 }, { x: 900, y: 560 }, { x: 1240, y: 560 }, { x: 500, y: 770 }, { x: 870, y: 770 }, { x: 1240, y: 770 }];

// ----- M21 · Şekillerle Resim Yap: ev ve roket parçaları taslaktaki yerlerine -----
export type ResimParcasi = { ad: string; sekil: 'ucgen' | 'kare' | 'dikdortgen' | 'daire'; yer: [number, number, number, number] };
export type Resim = { ad: 'ev' | 'roket'; tuval: [number, number]; parcalar: ResimParcasi[] };
/** Taslakların parça yerleri (Astra'nın taslak tuvalinde x, y, en, boy; brief M21 ile birebir). */
export const RESIMLER: Record<'ev' | 'roket', Resim> = {
  ev: { ad: 'ev', tuval: [600, 640], parcalar: [
    { ad: 'ev-govde', sekil: 'kare', yer: [100, 240, 400, 400] },
    { ad: 'ev-cati', sekil: 'ucgen', yer: [40, 20, 520, 220] },
    { ad: 'ev-kapi', sekil: 'dikdortgen', yer: [250, 470, 100, 170] },
    { ad: 'ev-pencere', sekil: 'kare', yer: [140, 300, 80, 80] },
    { ad: 'ev-pencere', sekil: 'kare', yer: [380, 300, 80, 80] },
  ] },
  roket: { ad: 'roket', tuval: [400, 700], parcalar: [
    { ad: 'roket-govde', sekil: 'dikdortgen', yer: [120, 180, 160, 380] },
    { ad: 'roket-burun', sekil: 'ucgen', yer: [120, 20, 160, 160] },
    { ad: 'roket-pencere', sekil: 'daire', yer: [160, 260, 80, 80] },
    { ad: 'roket-kanat-sol', sekil: 'ucgen', yer: [30, 420, 90, 200] },
    { ad: 'roket-kanat-sag', sekil: 'ucgen', yer: [280, 420, 90, 200] },
  ] },
};
/**
 * Yaşın resimleri gelişe göre: 2–3 yaşta ev, önce iki penceresi hazır, sonra biri, en son hiçbiri; 4 ve 5+ yaşta ev → roket →
 * ikisi birden (4 yaş evden, 5+ roketten başlar).
 */
export function resimSirasi(yol: Yol, tekrar = 0): { resim: Resim; hazir: number[] }[] {
  const ev = (hazir: number[] = []) => ({ resim: RESIMLER.ev, hazir }), roket = { resim: RESIMLER.roket, hazir: [] as number[] };
  const h: Havuzlar<{ resim: Resim; hazir: number[] }[]> = yol === 'minik'
    ? [[[ev([3, 4])]], [[ev([4])]], [[ev()], [ev([3])]]]
    : yol === 'dort' ? [[[ev()]], [[roket]], [[ev(), roket], [roket, ev()]]]
      : [[[ev()]], [[roket]], [[roket, ev()], [ev(), roket]]];
  return sec(h, tekrar).map((r) => ({ resim: r.resim, hazir: r.hazir.slice() }));
}
/** Parça bu yere girer mi (aynı parça; iki pencere birbirinin yerine geçer). */
export const parcaYereUyar = (r: Resim, parca: number, yer: number) => r.parcalar[parca].ad === r.parcalar[yer].ad;

// ----- M22 · Mino'nun Büyüyen Fenerleri: büyüyen örüntü (yeni-turlar.ts) -----
export type BuyuyenDesen = { bas: number; adim: number; goster: number };
/**
 * Turun desenleri gelişe göre (en çok on fener): 2–3 yaş 1, 2, ? → 2, 3, ? → 1, 2, 3, ?; 4 yaş birer → 3'ten birer ve iki
 * sütunla → ikişer; 5+ ikişer → 3'ten ikişer ve üçer → yalnız iki sütun gösterilir (üçer ya da ikişer).
 */
export function buyuyenDesenler(yol: Yol, tekrar = 0): BuyuyenDesen[] {
  const D = (bas: number, adim: number, goster: number): BuyuyenDesen => ({ bas, adim, goster });
  const h: Havuzlar<BuyuyenDesen[]> = yol === 'minik'
    ? [[[D(1, 1, 2)]], [[D(2, 1, 2)]], [[D(1, 1, 3)], [D(2, 1, 3)]]]
    : yol === 'dort' ? [[[D(1, 1, 3), D(2, 1, 3)]], [[D(3, 1, 3), D(2, 1, 2)]], [[D(1, 2, 3), D(2, 2, 3)], [D(2, 2, 3), D(1, 2, 3)]]]
      : [[[D(1, 2, 3), D(2, 2, 3)]], [[D(3, 2, 3), D(1, 3, 3)]], [[D(2, 3, 2), D(3, 2, 2)], [D(1, 3, 2), D(4, 2, 2)]]];
  return sec(h, tekrar).map((d) => ({ ...d }));
}
export const desenCevabi = (d: BuyuyenDesen) => d.bas + d.adim * d.goster;

// ----- M23 · Zıpzıp'ın Şenlik Bayrakları: eksik parçayı bul -----
export type BayrakTuru = 'kirmizi-ucgen' | 'mavi-kare' | 'sari-daire' | 'yesil-ucgen';
export type BayrakDizisi = { dizi: BayrakTuru[]; bosluk: number[] };
const tekrarla = (birim: BayrakTuru[], kac: number) => Array.from({ length: kac }, () => birim).flat();
/**
 * İpteki diziler gelişe göre (boşluklar ortada): AB → AAB → ABC. 2–3 yaş AB → AB iki boşluk → AAB; 4 yaş AB → AAB → ABC;
 * 5+ AAB ve ABC → ABC iki boşluk → dört renk (ABCD) ya da AABC, iki boşluk.
 */
export function bayrakDizileri(yol: Yol, tekrar = 0): BayrakDizisi[] {
  const k: BayrakTuru = 'kirmizi-ucgen', m: BayrakTuru = 'mavi-kare', s: BayrakTuru = 'sari-daire', y: BayrakTuru = 'yesil-ucgen';
  const B = (birim: BayrakTuru[], kac: number, bosluk: number[]): BayrakDizisi => ({ dizi: tekrarla(birim, kac), bosluk });
  const h: Havuzlar<BayrakDizisi[]> = yol === 'minik'
    ? [[[B([k, m], 4, [5])]], [[B([s, m], 4, [2, 5])]], [[B([s, s, m], 3, [4])], [B([k, k, m], 3, [5])]]]
    : yol === 'dort' ? [[[B([k, m], 4, [5]), B([s, y], 4, [2])]], [[B([s, s, m], 3, [4]), B([k, m, m], 3, [5])]], [[B([k, m, s], 3, [4]), B([y, s, m], 3, [7])], [B([s, k, m], 3, [5]), B([m, y, s], 3, [4])]]]
      : [[[B([s, s, m], 3, [4]), B([k, m, s], 3, [5])]], [[B([k, m, s], 3, [3, 7]), B([y, s, m], 3, [4, 6])]],
        [[B([k, m, s, y], 2, [2, 5]), B([k, k, m, s], 2, [3, 6])], [B([y, s, m, k], 2, [3, 5]), B([m, m, s, y], 2, [2, 6])]]];
  return sec(h, tekrar).map((d) => ({ dizi: d.dizi.slice(), bosluk: d.bosluk.slice() }));
}
export const BAYRAK_TURLERI: BayrakTuru[] = ['kirmizi-ucgen', 'mavi-kare', 'sari-daire', 'yesil-ucgen'];

// ----- M24 · Sen Başlat, Kino Sürdürsün: kendi örüntüsü -----
export type Calgi = 'davul' | 'cingirak' | 'alkis';
export const CALGILAR: Calgi[] = ['davul', 'cingirak', 'alkis'];
/** Birim uzunluğu: 2–3 ve 4 yaş iki kart, 5+ üç kart. Örüntü sayılması için en az iki farklı çalgı. */
export const calgiBirimi = (yol: Yol) => (yol === 'bes' ? 3 : 2);
/**
 * Gelişe göre: birim uzunluğu ve Kino çaldıktan sonra çocuğun bulacağı kart sayısı (sondaki boşluk). 2–3 yaş 2 kart bir boşluk
 * → iki boşluk → üç kartlık birim; 4 yaş 2 → 3 → 3 kart iki boşluk; 5+ 3 → 3 kart iki boşluk → 4 kartlık birim.
 */
export function calgiTuru(yol: Yol, tekrar = 0): { birim: number; bos: number } {
  const C = (birim: number, bos: number) => ({ birim, bos });
  return sec(yol === 'minik' ? [[C(2, 1)], [C(2, 2)], [C(3, 1), C(2, 2)]] : yol === 'dort' ? [[C(2, 1)], [C(3, 1)], [C(3, 2), C(2, 2)]]
    : [[C(3, 1)], [C(3, 2)], [C(4, 1), C(3, 2)]], tekrar);
}
export const birimGecerli = (birim: readonly Calgi[]) => new Set(birim).size >= 2;

// ----- M25 · Anne'nin Sürahileri: dolu, yarım, boş; bir sürahi kaç bardak? -----
export type Doluluk = 'bos' | 'yarim' | 'dolu';
/** Yaşın soruları: 2–3 yaş dolu ve boş; 4 yaş dolu, boş, yarım; 5+ ayrıca sürahi kaç bardak doldurur (yeniden oynayışta 3 ya da 4). */
/**
 * Gelişe göre: 2–3 yaş dolu-boş → boş-dolu → sürahi 2 bardak doldurur (yarım bu yaşta sorulmaz); 4 yaş dolu-boş → üçü →
 * üçü ve sürahi 2 bardak; 5+ sürahi 2 → 3 → 4 bardak (zor basamakta 4 ve 3 sırayla).
 */
export function surahiSorulari(yol: Yol, tekrar = 0, zor: readonly number[] = []): { bul: Doluluk[]; kacBardak: number } {
  const S = (bul: Doluluk[], kacBardak = 0) => ({ bul, kacBardak });
  const h: Havuzlar<{ bul: Doluluk[]; kacBardak: number }> = yol === 'minik'
    ? [[S(['dolu', 'bos'])], [S(['bos', 'dolu'])], [S(['dolu', 'bos'], 2), S(['bos', 'dolu'], 2)]]
    : yol === 'dort' ? [[S(['dolu', 'bos'])], [S(['yarim', 'bos', 'dolu'])], [S(['bos', 'dolu', 'yarim'], 2), S(['dolu', 'yarim', 'bos'], 2)]]
      : [[S(['dolu', 'yarim', 'bos'], 2)], [S(['yarim', 'bos', 'dolu'], 3)], [S(['bos', 'dolu', 'yarim'], 4), S(['dolu', 'bos', 'yarim'], 3)]];
  const t = sec(h, tekrar, zor, (x) => (x.kacBardak ? [x.kacBardak] : []));
  return { bul: t.bul.slice(), kacBardak: t.kacBardak };
}
/** Tezgâhtaki üç bardağın sırası (doğru cevap hep aynı yerde olmasın). */
export const bardakSirasi = (soru: number, tekrar = 0): Doluluk[] => ([['yarim', 'dolu', 'bos'], ['bos', 'yarim', 'dolu'], ['dolu', 'bos', 'yarim']] as Doluluk[][])[(soru + tekrar) % 3];

// ----- M26 · Babaanne'nin Bütün ve Yarımı -----
export type Yiyecek = 'elma' | 'armut' | 'ekmek' | 'simit';
/**
 * Gelişe göre yiyecek elma → armut → ekmek → simit. 2–3 yaş bölüp birleştirir; 4 yaş iki yiyecek → öbür ikisi → bir yiyecek
 * ve "iki yarım kaç bütün?"; 5+ elma ve iki yarım → armut, ekmek ve dört yarım → simit ve altı yarım (kaç bütün eder?).
 */
export function yarimTuru(yol: Yol, tekrar = 0, zor: readonly number[] = []): { bol: Yiyecek[]; kacYarim: number } {
  const Y = (bol: Yiyecek[], kacYarim = 0) => ({ bol, kacYarim });
  const h: Havuzlar<{ bol: Yiyecek[]; kacYarim: number }> = yol === 'minik'
    ? [[Y(['elma'])], [Y(['armut', 'ekmek'])], [Y(['simit', 'elma']), Y(['ekmek', 'armut'])]]
    : yol === 'dort' ? [[Y(['elma', 'armut'])], [Y(['ekmek', 'simit'])], [Y(['armut'], 2), Y(['simit'], 2)]]
      : [[Y(['elma'], 2)], [Y(['armut', 'ekmek'], 4)], [Y(['simit'], 6), Y(['ekmek'], 4), Y(['elma'], 6)]];
  const t = sec(h, tekrar, zor, (x) => (x.kacYarim ? [x.kacYarim / 2] : []));
  return { bol: t.bol.slice(), kacYarim: t.kacYarim };
}

// ----- M27 · Kino'nun Günü: zaman sırası -----
export type GunKarti = 'uyanma' | 'oyun' | 'uyku' | 'kar-yagiyor' | 'kardan-adam' | 'eriyor';
/** Yaşın dizileri (doğru sırayla): 2–3 yaş gündüz ve gece (iki kart), 4 yaş sabah-öğlen-akşam, 5+ önce günüm sonra kardan adam. */
const GUNUM: GunKarti[] = ['uyanma', 'oyun', 'uyku'], KARDAN: GunKarti[] = ['kar-yagiyor', 'kardan-adam', 'eriyor'];
export function gunDizileri(yol: Yol, tekrar = 0): GunKarti[][] {
  return gunTuru(yol, tekrar).diziler;
}
/**
 * Gelişe göre: 2–3 yaş gündüz-gece → günüm (üç kart) → kardan adam; 4 yaş günüm → kardan adam → ikisi ve rafta öbür
 * diziden bir çeldirici (dört kart); 5+ günüm ve kardan adam → çeldiricili → ters sırayla çeldiricili.
 */
export function gunTuru(yol: Yol, tekrar = 0): { diziler: GunKarti[][]; celdirici: boolean } {
  const G = (diziler: GunKarti[][], celdirici = false) => ({ diziler, celdirici });
  const h: Havuzlar<{ diziler: GunKarti[][]; celdirici: boolean }> = yol === 'minik'
    ? [[G([['oyun', 'uyku']])], [G([GUNUM])], [G([KARDAN]), G([GUNUM], true)]]
    : yol === 'dort' ? [[G([GUNUM])], [G([KARDAN])], [G([GUNUM, KARDAN], true), G([KARDAN, GUNUM], true)]]
      : [[G([GUNUM, KARDAN])], [G([GUNUM, KARDAN], true)], [G([KARDAN, GUNUM], true), G([GUNUM, KARDAN], true)]];
  const t = sec(h, tekrar);
  return { diziler: t.diziler.map((d) => d.slice()), celdirici: t.celdirici };
}
/** Dizinin çeldiricisi: öbür diziden bir kart (gelişe göre değişir). */
export const gunCeldirici = (dizi: readonly GunKarti[], tekrar = 0): GunKarti => {
  const obur = dizi.includes('uyanma') || dizi.includes('oyun') ? KARDAN : GUNUM;
  return obur[tekrar % obur.length];
};
/** Raftaki karışık sıra (hiçbir kart kendi yerinde değil). */
export const gunKarisik = (dizi: readonly GunKarti[], tekrar = 0): GunKarti[] => karisikSira(dizi.length, tekrar).map((i) => dizi[i]);
