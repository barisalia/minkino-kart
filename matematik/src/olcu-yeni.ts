// Ölçü tezgâhı · kurdele turunun yerine gelen iki tur (Barış, 19 Kasım 2026: "İkisi de olsun"):
// turun ilk gelişinde Boy Duvarı (hayvanın boyu tahtalarla), ikinci gelişinde Kurbağanın Yaprak Yolu (gölet yapraklarla).
// Çizimler Astra'dan gelir (assets/matematik/olcu/, brief: CLAUDE-ASTRA-MESAJLAR.md 19 Kasım 18:20). Bütün çizimler ve
// Ceren'in sözleri tamam değilse uygulamada eski kurdele turu kalır. Test kipinde (?test=1&olcu=1) yer tutucuyla oynanır;
// yer tutucuların adresi yalnız orada, metin olarak durur (hiçbir yerden içe aktarılmaz, pakete girmez).
import sozler from './sozler.json';

export type OYol = 'minik' | 'dort' | 'bes';
export type Hayvan = 'zurafa' | 'tavsan' | 'ordek' | 'kaplumbaga';

/** Hayvanın boyu (tahta). Astra'nın tuvalinde bir tahta 160 px, ayak tabanı y = 860 (700 × 900). */
export const BOY: Record<Hayvan, number> = { zurafa: 5, ordek: 3, tavsan: 2, kaplumbaga: 1 };
export const TUVAL = { en: 700, boy: 900, taban: 860, tahta: 160 } as const;
export const KURBAGA_TUVAL = { en: 500, boy: 500, temas: 440 } as const;
/** Göletin boş su şeridi (fon 1672 × 941'in oranı): yapraklar buraya dizilir. */
export const SERIT = { sol: 330 / 1672, sag: 1340 / 1672, ust: 520 / 941, alt: 700 / 941 } as const;
/** Bir yaprağın genişliği (sahne eninin oranı): altı yaprak şeridi tam doldurur. */
export const YAPRAK_EN = (SERIT.sag - SERIT.sol) / 6;

/** Boy Duvarı: yaşa göre ölçülen hayvanlar (5+ yaşta iki dost, sonra "Hangisi daha uzun?"). Yeniden oynayışta değişir. */
export function boyHayvanlari(yol: OYol, tekrar = 0): Hayvan[] {
  const secenek: Record<OYol, Hayvan[][]> = {
    minik: [['tavsan'], ['ordek']],
    dort: [['ordek'], ['zurafa']],
    bes: [['zurafa', 'tavsan'], ['ordek', 'kaplumbaga']],
  };
  const l = secenek[yol];
  return l[tekrar % l.length];
}
/** Yaprak Yolu: yolun uzunluğu (yaprak). */
export function yaprakSayisi(yol: OYol, tekrar = 0): number {
  const l: Record<OYol, number[]> = { minik: [2, 3], dort: [4, 5], bes: [6, 5] };
  return l[yol][tekrar % 2];
}
/** 2–3 yaşta birim kendiliğinden yerine süzülür (dokunmak yeter); büyüklerde sürüklenir ya da dokunulur. */

const ADLAR: Record<Hayvan, { ad: string; belirtme: string }> = {
  zurafa: { ad: 'Zürafa', belirtme: 'zürafayı' },
  tavsan: { ad: 'Tavşan', belirtme: 'tavşanı' },
  ordek: { ad: 'Ördek', belirtme: 'ördeği' },
  kaplumbaga: { ad: 'Kaplumbağa', belirtme: 'kaplumbağayı' },
};
const SAYI_ADI = ['sıfır', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz', 'on'];

/** Ceren'in sözleri (sozler.json'daki metinler; kayıtlar assets/matematik/ses/ses-<sıra>.mp3). */
export const SOZ = {
  boyYonerge: (h: Hayvan) => ADLAR[h].ad + ' kaç tahta boyunda? Tahtaları yanına üst üste koy.',
  boyIkinci: (h: Hayvan) => 'Şimdi ' + ADLAR[h].belirtme + ' ölçelim!',
  boySonuc: (h: Hayvan) => ADLAR[h].ad + ' ' + SAYI_ADI[BOY[h]] + ' tahta boyunda!',
  hangisi: 'Hangisi daha uzun? Ona dokun.',
  yolYonerge: 'Kurbağa çiçeğe gitmek istiyor. Yaprakları suya uç uca diz, yol olsun.',
  yolHazir: 'Yol hazır! Kurbağa, zıpla!',
  yolSonuc: (n: number) => 'Yol ' + SAYI_ADI[n] + ' yaprak uzunluğunda!',
};
const HAYVANLAR = Object.keys(BOY) as Hayvan[];
/** Bütün sözler (kapı ve ses üretimi için). */
export const OLCU_SOZLERI: string[] = [
  ...HAYVANLAR.flatMap((h) => [SOZ.boyYonerge(h), SOZ.boyIkinci(h), SOZ.boySonuc(h)]),
  SOZ.hangisi, SOZ.yolYonerge, SOZ.yolHazir,
  ...[2, 3, 4, 5, 6].map(SOZ.yolSonuc),
];

/** Astra'nın 27 çizimi (assets/matematik/olcu/). */
export const OLCU_CIZIMLERI: string[] = [
  ...HAYVANLAR.flatMap((h) => [0, 1, 2].map((p) => h + '-' + p)),
  'tahta', 'tahta-yigini', 'boy-kosesi',
  ...[0, 1, 2, 3, 4, 5].map((p) => 'kurbaga-' + p),
  'yaprak', 'sepet-dolu', 'sepet-bos', 'nilufer-cicegi', 'su-halkasi', 'golet',
];

/**
 * Yer tutucular (yalnız test kipi): var olan çizimler, görünür sınırlarıyla (görselin üst ve alt kenarının oranı) —
 * hayvan, tahta boyuna oturtulurken bu sınırlar kullanılır. Gerçek çizimde sınır Astra'nın ölçüsüdür.
 */
export const YER_TUTUCU: Record<string, { yol: string; ust?: number; alt?: number }> = {
  zurafa: { yol: 'hayvanlar/zurafa', ust: 0.043, alt: 0.957 },
  tavsan: { yol: 'hayvanlar/tavsan', ust: 0.043, alt: 0.957 },
  ordek: { yol: 'hayvanlar/ordek', ust: 0.091, alt: 0.909 },
  kaplumbaga: { yol: 'hayvanlar/kaplumbaga', ust: 0.189, alt: 0.811 },
  kurbaga: { yol: 'hayvanlar/kurbaga', ust: 0.055, alt: 0.945 },
  tahta: { yol: 'matematik/kule-kutusu' },
  'boy-kosesi': { yol: 'matematik/kule-masasi' },
  yaprak: { yol: 'hazirlik/kres/deney-yaprak' },
  'sepet-dolu': { yol: 'sef/piknik/sepet' },
  'sepet-bos': { yol: 'sef/piknik/sepet' },
  'nilufer-cicegi': { yol: 'orman-esya/cicek' },
  golet: { yol: 'hazirlik/kres/oyuncak-ordek-havuz' },
};

/** Kapı: bütün çizimler ve sözlerin kayıtları diskte mi? (Ceren dersindeki yöntem.) */
export function olcuHazirMi(cizimVar: (ad: string) => boolean, sesVar: (sira: number) => boolean) {
  return OLCU_CIZIMLERI.every(cizimVar) && OLCU_SOZLERI.every((m) => {
    const i = (sozler as string[]).indexOf(m);
    return i >= 0 && sesVar(i);
  });
}

/** Turun ilk gelişi Boy Duvarı, ikinci gelişi Yaprak Yolu (ölçü türü bir oyuncakta en çok iki kez gelir). */
export const olcuTuru = (oncekiOlcuSayisi: number): 'boy' | 'yol' => (oncekiOlcuSayisi === 0 ? 'boy' : 'yol');
