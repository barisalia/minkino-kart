/**
 * DOĞRA · saf kurallar (DOM yok, birim testli: tests/unit/restoran-mini-dogra.test.ts). ekip/senaryo/RESTORAN.md §8 M1.
 *
 * Tahtadaki her sebze bir `SebzeDurum`: içinde parçalar (`Parca`) var. Parmak bir parçanın üstünden geçince `kes()`
 * çağrılır; sebzenin türüne göre parça bölünür ya da hâl değiştirir. Her sebze başka türlü kesilir:
 *   - salatalık (uzun): dik kaydırma yuvarlak dilim; ince şerit dilime devrilir; dilim kesilirse küp; çok kesilirse püre
 *   - domates (ikiye): ilk kesim kocaman "şlap" iki yarım; yarım kesilince dilim (yarım ay), dilim kesilince küp;
 *     aşırı kesim püre ("vıcık")
 *   - soğan: önce kuru kabuk soyulur (parmakla çekip ya da bıçak kabukta kayar, kabuk düşer); sonra yarım, halka, küp;
 *     üçüncü kesimde Mino ağlar (olay)
 *   - biber: ikiye; yarımın içinde çekirdek (silkelenince dökülür); yarım kesilince şerit
 *   - maydanoz (demet): ritimle dokunuş kıyar; her vuruş biraz daha ince
 *   - havuç, patates (sert): iki kaydırmada bir dilim (önce çentik, sonra kesim); 5-6 yaşta patates boyuna + enine = çubuk
 * 3-4 yaş: her kaydırma keser, parçalar iri (kesim yeri en büyük parçanın ortasına yakın). 5-6 yaş: kesim yeri parmağın
 * yeri (dilim kalınlığı çocuğun elinde), yön önemli (boyuna kesim de olur).
 * Koordinatlar: tahta 0-1 (x sağa, y aşağı); boylar tahtanın ENİ cinsinden (en-boy oranı bozulmasın).
 */
import type { Kesim, Malzeme, MalzemeDurumu, Yas } from '../arayuz';

/** Parçanın görünümü */
export type Gorunum =
  | 'kirpik' // bütünün kırpılmış bir bölgesi (bütün resim + pencere): bütün, iri parça, uzun yarım
  | 'yarim' // ikiye kesilmiş: kesit görünür (domates, soğan, biber)
  | 'dilim' // yuvarlak dilim / yarım ay / halka
  | 'yarimdilim' // yarım ay dilim (boyuna kesilmiş salatalık, havuç)
  | 'serit' // biber şeridi
  | 'cubuk' // patates çubuğu
  | 'kup'
  | 'kiyim' // maydanoz
  | 'pure';

export type Eksen = 'x' | 'y';
export type Yon = 'dik' | 'yatay';

export interface Parca {
  id: number;
  gorunum: Gorunum;
  /** merkez (tahta 0-1) */
  x: number;
  y: number;
  /** en ve boy (tahta eni cinsinden) */
  w: number;
  h: number;
  /** kirpik: bütün resmin penceresi [x0, x1, y0, y1] (0-1) */
  r?: [number, number, number, number];
  /** yarım: kesik yüzü nereye bakıyor (yer tutucu yarım daire için) */
  taraf?: 'sol' | 'sag' | 'ust' | 'alt';
  /** yarım: dilimlenecek ne kaldı (1 → 0) */
  kalan?: number;
  /** biber yarımı: içinde kalan çekirdek */
  cekirdek?: number;
  /** sert sebze: yarım kalmış çentik (bir sonraki kaydırma burada keser): kesim ekseninde pencere içi 0-1 */
  centik?: number;
  /** maydanoz kıyımı: incelik */
  ince?: number;
}

export interface SebzeTanim {
  /** kesim biçimi */
  bicim: 'uzun' | 'ikiye' | 'demet';
  /** bütünün eni (tahta eni cinsinden) */
  en: number;
  /** bütün resmin boy/en oranı (görünen kısım) */
  oran: number;
  /** uzun sebzede asıl kesim ekseni (salatalık yatay yatar: x; havuç dik durur: y) */
  eksen: Eksen;
  /** sert: iki kaydırmada bir kesim */
  sert?: boolean;
  /** kuru kabuk sayısı [3-4, 5-6] */
  kabuk?: [number, number];
  /** biber: yarımlarda çekirdek */
  cekirdek?: boolean;
  /** kirpik şerit bu inceliğe (pencere oranı) inince dilime devrilir [3-4, 5-6] */
  dilimEsik: [number, number];
  /** bu kadar kesimden sonra püre [3-4, 5-6]; yoksa püre olmaz */
  pureEsik?: [number, number];
  /** bir yarımdan kaç dilim çıkar [3-4, 5-6] */
  yarimDilim?: [number, number];
  /** dilim / şerit / küp boyları (tahta eni cinsinden) */
  dilimBoy: number;
  kupBoy: number;
  /** ince şerit neye devrilir */
  ince: 'dilim' | 'serit';
}

export const SEBZE: Partial<Record<Malzeme, SebzeTanim>> = {
  salatalik: { bicim: 'uzun', en: 0.44, oran: 0.84, eksen: 'x', dilimEsik: [0.2, 0.13], pureEsik: [22, 30], dilimBoy: 0.085, kupBoy: 0.04, ince: 'dilim' },
  domates: { bicim: 'ikiye', en: 0.28, oran: 1.02, eksen: 'x', dilimEsik: [0.5, 0.5], pureEsik: [9, 13], yarimDilim: [2, 3], dilimBoy: 0.1, kupBoy: 0.045, ince: 'dilim' },
  sogan: { bicim: 'ikiye', en: 0.25, oran: 1.05, eksen: 'x', kabuk: [1, 3], dilimEsik: [0.5, 0.5], yarimDilim: [2, 3], dilimBoy: 0.095, kupBoy: 0.04, ince: 'dilim' },
  biber: { bicim: 'ikiye', en: 0.28, oran: 1.0, eksen: 'x', cekirdek: true, dilimEsik: [0.5, 0.5], yarimDilim: [2, 4], dilimBoy: 0.11, kupBoy: 0.035, ince: 'serit' },
  maydanoz: { bicim: 'demet', en: 0.3, oran: 0.9, eksen: 'x', dilimEsik: [1, 1], dilimBoy: 0.11, kupBoy: 0.05, ince: 'dilim' },
  havuc: { bicim: 'uzun', en: 0.2, oran: 1.45, eksen: 'y', sert: true, dilimEsik: [0.26, 0.15], dilimBoy: 0.065, kupBoy: 0.035, ince: 'dilim' },
  patates: { bicim: 'uzun', en: 0.3, oran: 0.82, eksen: 'x', sert: true, dilimEsik: [0.3, 0.2], dilimBoy: 0.11, kupBoy: 0.04, ince: 'dilim' },
  limon: { bicim: 'uzun', en: 0.24, oran: 1.12, eksen: 'x', dilimEsik: [0.3, 0.2], dilimBoy: 0.09, kupBoy: 0.04, ince: 'dilim' },
  marul: { bicim: 'uzun', en: 0.32, oran: 0.9, eksen: 'x', dilimEsik: [0.3, 0.2], dilimBoy: 0.1, kupBoy: 0.05, ince: 'serit' },
};

/** Tanımı olmayan malzeme için genel kural (salatalık gibi dilimlenir) */
export const GENEL: SebzeTanim = { bicim: 'uzun', en: 0.26, oran: 1, eksen: 'x', dilimEsik: [0.3, 0.2], dilimBoy: 0.09, kupBoy: 0.04, ince: 'dilim' };
export const tanim = (m: Malzeme): SebzeTanim => SEBZE[m] ?? GENEL;

/** Tahtada bir parça sayısı sınırı (DOM hafif kalsın): bunu aşınca küpler bölünmez, küçülür */
export const PARCA_SINIRI = 26;
/** maydanoz: kaç vuruşta ince kıyım [3-4, 5-6] */
export const KIYIM_ESIK: [number, number] = [5, 8];

export interface SebzeDurum {
  id: number;
  ad: Malzeme;
  parcalar: Parca[];
  /** toplam kesim (püre eşiği buna bakar) */
  kesim: number;
  /** soğan: kalan kuru kabuk */
  kabuk: number;
  /** yarım kalmış (çentik) kesim sayısı: sert sebzede */
  centik: number;
  pure: boolean;
  /** maydanoz vuruşu */
  vurus: number;
}

let sira = 1;
const yeniId = () => sira++;
const yi = (yas: Yas) => (yas === 'kucuk' ? 0 : 1);
const sinirla = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** Tahtaya yeni bir bütün sebze koyar (x, y: yuvanın merkezi) */
export function sebzeKoy(ad: Malzeme, x: number, y: number, yas: Yas): SebzeDurum {
  const t = tanim(ad);
  return {
    id: yeniId(),
    ad,
    parcalar: [{ id: yeniId(), gorunum: 'kirpik', x, y, w: t.en, h: t.en * t.oran, r: [0, 1, 0, 1] }],
    kesim: 0,
    kabuk: t.kabuk ? t.kabuk[yi(yas)] : 0,
    centik: 0,
    pure: false,
    vurus: 0,
  };
}

export type Olay =
  | 'kesti'
  | 'ikiye' // domates "şlap", biber, soğan ilk kesim
  | 'dilim' // ince şerit dilime devrildi
  | 'centik' // sert sebze: bıçak yarıya kadar girdi
  | 'kabuk' // soğan kabuğu düştü
  | 'kabukBitti'
  | 'cekirdek' // biber çekirdeği döküldü
  | 'kiyim'
  | 'pure' // aşırı kesim
  | 'kucuk' // küp daha da küçüldü
  | 'yok'; // kesilecek bir şey yok (ör. püre)

export interface KesSonuc {
  olay: Olay;
  /** bu kesimde doğan parçalar (bu kaydırmada yeniden kesilmesin) */
  yeni: number[];
  /** silinen parça kimlikleri */
  silinen: number[];
  /** sesin malzemesi (salatalık kırt, domates şlap...) */
  ses: 'kirt' | 'slap' | 'citir' | 'kitir' | 'vicik' | 'tok';
  /** düşen çekirdek / kabuk sayısı (parçacık) */
  dokulen?: number;
  /** kesim noktası (parçacık ve leke için, tahta 0-1) */
  x: number;
  y: number;
}

/** Sebzenin kendi kesim sesi */
export function kesimSesi(ad: Malzeme): KesSonuc['ses'] {
  const t = tanim(ad);
  if (t.sert) return 'kitir';
  if (ad === 'domates') return 'slap';
  if (ad === 'sogan' || ad === 'maydanoz') return 'citir';
  return 'kirt';
}

/** Kesim noktasını (tahta) bir kirpik parçanın penceresine çevirir: eksen boyunca 0-1 */
function pencereIci(p: Parca, eksen: Eksen, kx: number, ky: number): number {
  return eksen === 'x' ? (kx - (p.x - p.w / 2)) / p.w : (ky - (p.y - p.h / 2)) / p.h;
}

/** Kirpik parçayı eksen boyunca `oran`dan (0-1, parça içi) ikiye böler; aralık açılır */
function kirpikBol(p: Parca, eksen: Eksen, oran: number): [Parca, Parca] {
  const r = p.r ?? [0, 1, 0, 1];
  const aralik = 0.012;
  if (eksen === 'x') {
    const kx = r[0] + (r[1] - r[0]) * oran;
    const w1 = p.w * oran;
    const w2 = p.w - w1;
    const sol = p.x - p.w / 2;
    return [
      { id: yeniId(), gorunum: 'kirpik', x: sol + w1 / 2 - aralik, y: p.y, w: w1, h: p.h, r: [r[0], kx, r[2], r[3]] },
      { id: yeniId(), gorunum: 'kirpik', x: sol + w1 + w2 / 2 + aralik, y: p.y, w: w2, h: p.h, r: [kx, r[1], r[2], r[3]] },
    ];
  }
  const ky = r[2] + (r[3] - r[2]) * oran;
  const h1 = p.h * oran;
  const h2 = p.h - h1;
  const ust = p.y - p.h / 2;
  return [
    { id: yeniId(), gorunum: 'kirpik', x: p.x, y: ust + h1 / 2 - aralik, w: p.w, h: h1, r: [r[0], r[1], r[2], ky] },
    { id: yeniId(), gorunum: 'kirpik', x: p.x, y: ust + h1 + h2 / 2 + aralik, w: p.w, h: h2, r: [r[0], r[1], ky, r[3]] },
  ];
}

/** Pencerenin eksen boyundaki payı (bütünün ne kadarı) */
const pay = (p: Parca, e: Eksen) => {
  const r = p.r ?? [0, 1, 0, 1];
  return e === 'x' ? r[1] - r[0] : r[3] - r[2];
};

/** Bir sayı üreteci (testte sabit): parçaları biraz dağıtmak için */
export type Rnd = () => number;

/** Yeni parçayı tahtada tutar */
function tahtada(p: Parca): Parca {
  p.x = sinirla(p.x, 0.05 + p.w / 2, 0.95 - p.w / 2);
  p.y = sinirla(p.y, 0.07 + p.h / 2, 0.93 - p.h / 2);
  return p;
}

/** Bir dilimi/küpü (token) parçanın yanında doğurur */
function token(gorunum: Gorunum, x: number, y: number, w: number, h: number, rnd: Rnd, yay = 0.035): Parca {
  return tahtada({ id: yeniId(), gorunum, x: x + (rnd() - 0.5) * 2 * yay, y: y + (rnd() - 0.5) * 2 * yay, w, h });
}

/**
 * Bir kesim: parmak `parcaId` parçasının üstünden geçti. yon: kaydırmanın yönü (ekrana göre). kx, ky: parmağın parçayı
 * geçtiği yer (tahta 0-1). Durumu yerinde değiştirir, olanı döner.
 */
export function kes(d: SebzeDurum, parcaId: number, yon: Yon, kx: number, ky: number, yas: Yas, rnd: Rnd = Math.random): KesSonuc {
  const t = tanim(d.ad);
  const p = d.parcalar.find((q) => q.id === parcaId);
  const sonuc: KesSonuc = { olay: 'yok', yeni: [], silinen: [], ses: kesimSesi(d.ad), x: kx, y: ky };
  if (!p || d.pure) {
    sonuc.ses = d.pure ? 'vicik' : 'tok';
    return sonuc;
  }
  const iy = yi(yas);
  const degistir = (eski: Parca, yeniler: Parca[]) => {
    d.parcalar.splice(d.parcalar.indexOf(eski), 1, ...yeniler);
    sonuc.silinen.push(eski.id);
    sonuc.yeni.push(...yeniler.map((q) => q.id));
  };

  // soğan: kuru kabuk varken bıçak kabukta kayar, bir kabuk düşer (soymanın öbür yolu; kilit yok)
  if (d.kabuk > 0) {
    d.kabuk--;
    sonuc.ses = 'citir';
    sonuc.olay = d.kabuk === 0 ? 'kabukBitti' : 'kabuk';
    sonuc.dokulen = 1;
    return sonuc;
  }

  // maydanoz: her geçiş bir vuruş
  if (t.bicim === 'demet') return kiy(d, kx, ky, yas, rnd);

  // sert sebze: ilk geçiş çentik, ikincisi keser (aynı yerden)
  if (t.sert && p.gorunum === 'kirpik') {
    const e = kesimEkseni(t, yon, yas);
    if (p.centik === undefined) {
      p.centik = sinirla(pencereIci(p, e, kx, ky), 0.12, 0.88);
      d.centik++;
      sonuc.olay = 'centik';
      return sonuc;
    }
  }

  d.kesim++;
  sonuc.olay = 'kesti';

  // püre: aşırı kesim (domates, salatalık): bütün parçalar tek bir "vıcık" birikintisine akar
  if (t.pureEsik && d.kesim >= t.pureEsik[iy]) {
    const ort = d.parcalar.reduce((a, q) => ({ x: a.x + q.x / d.parcalar.length, y: a.y + q.y / d.parcalar.length }), { x: 0, y: 0 });
    const pure: Parca = { id: yeniId(), gorunum: 'pure', x: ort.x, y: ort.y, w: t.en * 0.95, h: t.en * 0.6 };
    sonuc.silinen.push(...d.parcalar.map((q) => q.id));
    d.parcalar = [tahtada(pure)];
    sonuc.yeni.push(pure.id);
    d.pure = true;
    sonuc.olay = 'pure';
    sonuc.ses = 'vicik';
    return sonuc;
  }

  switch (p.gorunum) {
    case 'kirpik': {
      if (t.bicim === 'ikiye' && pay(p, 'x') > 0.9 && pay(p, 'y') > 0.9) {
        // bütün → iki yarım (kesik yüzü birbirine bakar)
        const dik = yon === 'dik' || yas === 'kucuk';
        const boy = t.en * 0.8;
        const a: Parca = { id: yeniId(), gorunum: 'yarim', x: dik ? p.x - t.en * 0.33 : p.x, y: dik ? p.y : p.y - t.en * 0.3, w: dik ? boy * 0.62 : boy, h: dik ? boy : boy * 0.62, taraf: dik ? 'sag' : 'alt', kalan: 1 };
        const b: Parca = { id: yeniId(), gorunum: 'yarim', x: dik ? p.x + t.en * 0.33 : p.x, y: dik ? p.y : p.y + t.en * 0.3, w: a.w, h: a.h, taraf: dik ? 'sol' : 'ust', kalan: 1 };
        if (t.cekirdek) {
          a.cekirdek = 3;
          b.cekirdek = 3;
          sonuc.dokulen = 4; // ikiye kesilince bir kısmı dökülür
        }
        degistir(p, [tahtada(a), tahtada(b)]);
        sonuc.olay = 'ikiye';
        return sonuc;
      }
      const e = kesimEkseni(t, yon, yas);
      let oran = p.centik ?? pencereIci(p, e, kx, ky);
      p.centik = undefined;
      const esik = t.dilimEsik[iy];
      if (yas === 'kucuk') {
        // 3-4: parçalar iri; kesim yeri en çok ortadan biraz kayar, şerit hep anlamlı boyda kalır
        oran = sinirla(oran, 0.3, 0.7);
      } else oran = sinirla(oran, 0.08, 0.92);
      // ince parçayı ikiye bölmek yerine dilime devir
      if (pay(p, e) <= esik * 1.25) {
        degistir(p, [dilimeDevir(p, t, e, d.ad, rnd)]);
        sonuc.olay = 'dilim';
        return sonuc;
      }
      const [a, b] = kirpikBol(p, e, oran);
      const yeniler = [a, b].map((q) => (pay(q, e) <= esik && pay(q, e === 'x' ? 'y' : 'x') > 0.15 ? dilimeDevir(q, t, e, d.ad, rnd) : q));
      degistir(p, yeniler);
      if (yeniler.some((q) => q.gorunum !== 'kirpik')) sonuc.olay = 'dilim';
      return sonuc;
    }
    case 'yarim': {
      // yarımdan bir dilim (yarım ay / halka / şerit) kopar; yarım küçülür, son dilimde kendisi de dilim olur
      const n = t.yarimDilim?.[iy] ?? 3;
      p.kalan = (p.kalan ?? 1) - 1 / n;
      const g: Gorunum = t.ince === 'serit' ? 'serit' : 'dilim';
      const [dw, dh] = tokenBoy(t, g, d.ad);
      const dilim = token(g, kx, ky, dw, dh, rnd);
      if (p.cekirdek) {
        sonuc.dokulen = Math.min(p.cekirdek, 2);
        p.cekirdek -= sonuc.dokulen;
      }
      if (p.kalan <= 0.01) {
        const son = token(g, p.x, p.y, dw, dh, rnd, 0.02);
        degistir(p, [son, dilim]);
      } else {
        const k = 0.72 + 0.28 * p.kalan;
        p.w *= k;
        p.h *= k;
        d.parcalar.push(dilim);
        sonuc.yeni.push(dilim.id);
      }
      return sonuc;
    }
    case 'dilim':
    case 'yarimdilim':
    case 'serit':
    case 'cubuk': {
      // dilim kesilince iki küp
      const [kw, kh] = tokenBoy(t, 'kup', d.ad);
      if (d.parcalar.length >= PARCA_SINIRI) {
        degistir(p, [token('kup', p.x, p.y, kw, kh, rnd, 0.01)]);
        return sonuc;
      }
      degistir(p, [token('kup', p.x - 0.02, p.y, kw, kh, rnd, 0.02), token('kup', p.x + 0.02, p.y, kw, kh, rnd, 0.02)]);
      return sonuc;
    }
    case 'kup': {
      // küp daha da küçülür (sınırdaysa bölünmez); domateste ve salatalıkta sonunda püre
      if (d.parcalar.length < PARCA_SINIRI && p.w > t.kupBoy * 0.6) {
        const w = p.w * 0.8;
        degistir(p, [token('kup', p.x - 0.012, p.y, w, w, rnd, 0.015), token('kup', p.x + 0.012, p.y, w, w, rnd, 0.015)]);
      } else {
        p.w = Math.max(t.kupBoy * 0.45, p.w * 0.88);
        p.h = p.w;
        sonuc.olay = 'kucuk';
      }
      return sonuc;
    }
    default:
      d.kesim--;
      sonuc.olay = 'yok';
      return sonuc;
  }
}

/** Kaydırmanın yönüne ve yaşa göre kirpik parçanın hangi eksende bölüneceği */
export function kesimEkseni(t: SebzeTanim, yon: Yon, yas: Yas): Eksen {
  if (yas === 'kucuk') return t.eksen; // 3-4: yön önemli değil, hep dilim yönünde
  // ekran yönü → bölme ekseni: dik kaydırma x'i böler, yatay kaydırma y'yi
  return yon === 'dik' ? 'x' : 'y';
}

/** Dilim / küp / şerit boyu (tahta eni cinsinden) */
export function tokenBoy(t: SebzeTanim, g: Gorunum, ad: Malzeme): [number, number] {
  switch (g) {
    case 'serit':
      return [t.dilimBoy, t.dilimBoy * 0.3];
    case 'cubuk':
      return [t.dilimBoy * 1.05, t.dilimBoy * 0.26];
    case 'yarimdilim':
      return [t.dilimBoy, t.dilimBoy * 0.55];
    case 'kup':
      return [t.kupBoy, t.kupBoy];
    case 'kiyim':
      return [t.dilimBoy, t.dilimBoy * 0.7];
    default:
      return ad === 'domates' ? [t.dilimBoy, t.dilimBoy * 0.62] : [t.dilimBoy, t.dilimBoy];
  }
}

/** İnce şerit yana devrilir: içi görünen dilim (salatalık dairesi, havuç halkası) ya da patates çubuğu */
function dilimeDevir(p: Parca, t: SebzeTanim, e: Eksen, ad: Malzeme, rnd: Rnd): Parca {
  const diger = pay(p, e === 'x' ? 'y' : 'x');
  let g: Gorunum = diger < 0.62 ? 'yarimdilim' : t.ince === 'serit' ? 'serit' : 'dilim';
  if (ad === 'patates' && diger < 0.62) g = 'cubuk';
  const [w, h] = tokenBoy(t, g, ad);
  return token(g, p.x, p.y + (rnd() - 0.5) * 0.04, w, h, rnd, 0.02);
}

/** Maydanoz: ritimli kıyım. İlk vuruş demeti üç öbeğe ayırır, sonrakiler inceltir (öbekler hafifçe küçülür). */
export function kiy(d: SebzeDurum, kx: number, ky: number, yas: Yas, rnd: Rnd = Math.random): KesSonuc {
  const t = tanim(d.ad);
  d.vurus++;
  d.kesim++;
  const sonuc: KesSonuc = { olay: 'kiyim', yeni: [], silinen: [], ses: 'citir', x: kx, y: ky };
  const demet = d.parcalar.find((p) => p.gorunum === 'kirpik');
  if (demet) {
    const [w, h] = tokenBoy(t, 'kiyim', d.ad);
    const yeniler = [-1, 0, 1].map((i) => token('kiyim', demet.x + i * demet.w * 0.3, demet.y + (i === 0 ? -0.02 : 0.02), w * 1.25, h * 1.25, rnd, 0.015));
    yeniler.forEach((q) => (q.ince = 0));
    d.parcalar.splice(d.parcalar.indexOf(demet), 1, ...yeniler);
    sonuc.silinen.push(demet.id);
    sonuc.yeni.push(...yeniler.map((q) => q.id));
    return sonuc;
  }
  const esik = KIYIM_ESIK[yi(yas)];
  for (const p of d.parcalar) {
    p.ince = Math.min(esik, (p.ince ?? 0) + 1);
    const k = p.ince >= esik ? 1 : 0.95;
    p.w = Math.max(t.dilimBoy * 0.8, p.w * k);
    p.h = Math.max(t.dilimBoy * 0.55, p.h * k);
  }
  return sonuc;
}

/** Soğan kabuğunu parmakla çekip soyar (bıçaksız yol) */
export function soy(d: SebzeDurum): KesSonuc['olay'] {
  if (d.kabuk <= 0) return 'yok';
  d.kabuk--;
  return d.kabuk === 0 ? 'kabukBitti' : 'kabuk';
}

/** Biber yarımını silkeler: içindeki çekirdekler dökülür; dökülen sayı */
export function silkele(d: SebzeDurum, parcaId: number): number {
  const p = d.parcalar.find((q) => q.id === parcaId);
  if (!p?.cekirdek) return 0;
  const n = Math.min(p.cekirdek, 2);
  p.cekirdek -= n;
  return n;
}

/** Sebzenin işi bitti mi (doğal son: bütün dilimler kesildi) */
export function bittiMi(d: SebzeDurum, yas: Yas): boolean {
  const t = tanim(d.ad);
  if (d.pure) return true;
  if (d.kabuk > 0) return false;
  if (t.bicim === 'demet') return d.vurus >= KIYIM_ESIK[yi(yas)];
  return d.parcalar.every((p) => p.gorunum !== 'kirpik' && p.gorunum !== 'yarim');
}

/** Ürün için kesimin özeti: en çok bulunan parça türü → Kesim; adet: o türden kaç parça */
export function kesimOzeti(d: SebzeDurum, yas: Yas): MalzemeDurumu {
  const t = tanim(d.ad);
  if (d.pure) return { adet: 1, kesim: 'pure' };
  if (t.bicim === 'demet') {
    if (d.vurus === 0) return { adet: 1, kesim: 'butun' };
    return { adet: d.parcalar.length, kesim: d.vurus >= KIYIM_ESIK[yi(yas)] ? 'kiyim' : 'iri' };
  }
  const say = new Map<Gorunum, number>();
  for (const p of d.parcalar) say.set(p.gorunum, (say.get(p.gorunum) ?? 0) + 1);
  if (d.parcalar.length === 1 && d.parcalar[0].gorunum === 'kirpik' && pay(d.parcalar[0], 'x') > 0.9 && pay(d.parcalar[0], 'y') > 0.9) return { adet: 1, kesim: 'butun' };
  const sirali = [...say].sort((a, b) => b[1] - a[1] || ONCELIK.indexOf(a[0]) - ONCELIK.indexOf(b[0]));
  const [g, n] = sirali[0];
  const KESIM: Record<Gorunum, Kesim> = { kirpik: 'iri', yarim: 'yarim', dilim: 'dilim', yarimdilim: 'dilim', serit: 'serit', cubuk: 'cubuk', kup: 'kup', kiyim: 'kiyim', pure: 'pure' };
  let kesim = KESIM[g];
  // ince dilim: 5-6'da çok kesilmiş salatalık / havuç (dilimler incecik)
  if (kesim === 'dilim' && yas === 'buyuk' && n >= 9 && t.bicim === 'uzun') kesim = 'ince';
  return { adet: n, kesim };
}
const ONCELIK: Gorunum[] = ['pure', 'kup', 'cubuk', 'serit', 'dilim', 'yarimdilim', 'kiyim', 'yarim', 'kirpik'];

/** Dilim sayısı (Mino sayar; 5-6 "3 dilim" özel isteği) */
export const dilimSayisi = (d: SebzeDurum) => d.parcalar.filter((p) => p.gorunum === 'dilim' || p.gorunum === 'yarimdilim' || p.gorunum === 'serit' || p.gorunum === 'cubuk').length;

/** Seri kesim: arka arkaya hızlı kesimde ses tonu hafifçe yükselir (Fruit Ninja hissi) */
export function seriPerde(seri: number): number {
  return Math.min(1.5, 1 + Math.max(0, seri - 1) * 0.06);
}
/** Seri sayacı: son kesimden bu yana geçen süreye göre */
export const SERI_ARA_MS = 420;
export function seriSay(onceki: number, araMs: number): number {
  return araMs <= SERI_ARA_MS ? onceki + 1 : 1;
}

/**
 * Yön: kaydırma vektöründen. Dik: |dy| baskın. (Ekran koordinatı; istasyon dikeyde döndürülse de sebzeler ekranda
 * dik durur, yön ekrana göredir.)
 */
export const yonBul = (dx: number, dy: number): Yon => (Math.abs(dy) >= Math.abs(dx) * 0.8 ? 'dik' : 'yatay');

/**
 * Doğru parçası bir dikdörtgeni geçiyor mu; geçiyorsa kesim noktası (dikdörtgenin içindeki, merkezine en yakın nokta).
 * Bütün değerler aynı birimde (px). Parmak hızlı gidince bir karede parçayı baştan sona geçebilir: o da sayılır.
 */
export function gecis(ax: number, ay: number, bx: number, by: number, r: { x: number; y: number; w: number; h: number }, pay = 0): { x: number; y: number } | null {
  const sol = r.x - r.w / 2 - pay;
  const sag = r.x + r.w / 2 + pay;
  const ust = r.y - r.h / 2 - pay;
  const alt = r.y + r.h / 2 + pay;
  // Liang-Barsky kırpma
  let t0 = 0;
  let t1 = 1;
  const dx = bx - ax;
  const dy = by - ay;
  const p = [-dx, dx, -dy, dy];
  const q = [ax - sol, sag - ax, ay - ust, alt - ay];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return null;
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) t0 = Math.max(t0, t);
      else t1 = Math.min(t1, t);
    }
  }
  if (t0 > t1) return null;
  // kırpılan parçanın merkeze en yakın noktası
  const cx = ax + dx * t0;
  const cy = ay + dy * t0;
  const ex = ax + dx * t1;
  const ey = ay + dy * t1;
  const vx = ex - cx;
  const vy = ey - cy;
  const l = vx * vx + vy * vy;
  const u = l ? sinirla(((r.x - cx) * vx + (r.y - cy) * vy) / l, 0, 1) : 0;
  return { x: cx + vx * u, y: cy + vy * u };
}

/**
 * Parmak parçanın içinden ne kadar geçti: kesim sayılması için parçanın merkez çizgisini geçmeli (kenarına sürtmek
 * kesmez). Doğru, parçanın merkezinden geçen dik ya da yatay çizgiyi kesiyor mu.
 */
export function ortadanGecti(ax: number, ay: number, bx: number, by: number, r: { x: number; y: number; w: number; h: number }, pay = 0): { x: number; y: number } | null {
  const g = gecis(ax, ay, bx, by, r, pay);
  if (!g) return null;
  // yatay merkez çizgisi (dik kaydırma) ya da dik merkez çizgisi (yatay kaydırma)
  const dikGecti = (ay - r.y) * (by - r.y) <= 0 && ay !== by;
  const yatayGecti = (ax - r.x) * (bx - r.x) <= 0 && ax !== bx;
  if (!dikGecti && !yatayGecti) return null;
  if (dikGecti) {
    const t = (r.y - ay) / (by - ay);
    const x = ax + (bx - ax) * t;
    if (x >= r.x - r.w / 2 - pay && x <= r.x + r.w / 2 + pay) return { x, y: r.y };
  }
  if (yatayGecti) {
    const t = (r.x - ax) / (bx - ax);
    const y = ay + (by - ay) * t;
    if (y >= r.y - r.h / 2 - pay && y <= r.y + r.h / 2 + pay) return { x: r.x, y };
  }
  return null;
}

/**
 * Parçalar birbirinin üstüne yığılmasın: daire gibi itişirler (birkaç tur). Kirpik (büyük, bütün parça) ağırdır, az
 * kayar; dilim ve küp hafiftir. ar: tahtanın en/boy oranı (bw/bh) — y uzaklığı tahta eni cinsine çevrilir.
 * Değişen parçaların kimliklerini döner. Saf (birim testli).
 */
export function itis(parcalar: Parca[], ar: number, tur = 5): Set<number> {
  const degisen = new Set<number>();
  const yaricap = (p: Parca) => (p.gorunum === 'kirpik' ? Math.min(p.w, p.h) * 0.42 : Math.min(p.w, p.h) * 0.25 + Math.max(p.w, p.h) * 0.22);
  const agir = (p: Parca) => (p.gorunum === 'kirpik' ? 4 : p.gorunum === 'yarim' ? 2 : p.gorunum === 'pure' ? 6 : 1);
  for (let k = 0; k < tur; k++) {
    let oynadi = false;
    for (let i = 0; i < parcalar.length; i++) {
      for (let j = i + 1; j < parcalar.length; j++) {
        const a = parcalar[i];
        const b = parcalar[j];
        // bütünün kırpık şeritleri yan yana durur (sebze dağılmasın)
        if (a.gorunum === 'kirpik' && b.gorunum === 'kirpik') continue;
        const dx = b.x - a.x;
        const dy = (b.y - a.y) / ar;
        const d = Math.hypot(dx, dy) || 0.0001;
        const en = yaricap(a) + yaricap(b);
        if (d >= en) continue;
        const fark = (en - d) * 0.5;
        const wa = agir(b) / (agir(a) + agir(b));
        const ux = d > 0.0002 ? dx / d : 1;
        const uy = d > 0.0002 ? dy / d : 0;
        a.x -= ux * fark * wa;
        a.y -= uy * fark * wa * ar;
        b.x += ux * fark * (1 - wa);
        b.y += uy * fark * (1 - wa) * ar;
        degisen.add(a.id);
        degisen.add(b.id);
        oynadi = true;
      }
    }
    for (const p of parcalar) {
      p.x = sinirla(p.x, 0.04 + p.w / 2, 0.96 - p.w / 2);
      p.y = sinirla(p.y, 0.05 + (p.h * ar) / 2, 0.95 - (p.h * ar) / 2);
    }
    if (!oynadi) break;
  }
  return degisen;
}
