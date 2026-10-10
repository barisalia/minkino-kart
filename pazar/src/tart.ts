/**
 * Tart Bakalım (pazarın yan dalı): istekler, meyve ağırlıkları, sayma / tartma denetimi, çürük meyve (DOM yok;
 * birim testleri bunu kullanır: tests/unit/tart.test.ts).
 *
 * 3-4 yaş SAYAR: balonda "🍅 ×3"; her meyve leğene düşünce oyun sesli sayar. 5-6 yaş TARTAR: "Bir kilo domates";
 * kadranda renkli yeşil bölge (rakam yok), ibre yeşile girince tamam, geçerse çocuk bir tane çıkarır.
 * Ağırlıklar gerçekçi (iri domates ~180 g); hiçbir meyve yeşil bölgeden daha ağır değil: ibre yeşilin üstünden
 * atlayamaz, sırayla konan meyveler mutlaka bir an yeşilde durur.
 * Çürük: bazı müşterilerde kasada bir çürük domates (kahve lekeler, sinek); komposta atılır. Verilirse müşteri
 * "ııh" yapıp geri verir; ceza yok.
 */
import P from '../../content/pazar.json';
import { buyukHarfBas, sayiAdi } from '../../src/audio/metin';
import type { Yas } from '../../src/engine/types';
import { urunAdi } from './istek';

export type Rnd = () => number;
export type TartMeyve = 'domates' | 'elma' | 'portakal' | 'patates';
export type TartMod = 'say' | 'tart';
export type TartSonuc = 'tamam' | 'az' | 'fazla' | 'curuk';

/** Bir turda kaç müşteri */
export const TART_MUSTERI = 5;
/** Leğene en çok kaç meyve sığar (fizik: en çok ~15 cisim; kasa da sayılınca rahat) */
export const LEGEN_KAPASITE = 10;

/** Tek meyvenin ağırlık aralığı (kg): iri pazar meyveleri: bir kiloda 5-7 tane */
export const AGIRLIK_ARALIGI: Record<TartMeyve, [number, number]> = {
  domates: [0.15, 0.22],
  elma: [0.16, 0.22],
  portakal: [0.18, 0.23],
  patates: [0.15, 0.22],
};
export const TART_MEYVELER = Object.keys(AGIRLIK_ARALIGI) as TartMeyve[];

/** Hedef ağırlıklar ve kadrandaki yeşil bölge (kg). Bölge genişliği her meyveden geniş. */
export const BOLGE: Record<'yarim' | 'kilo', { hedef: number; bolge: [number, number] }> = {
  yarim: { hedef: 0.5, bolge: [0.42, 0.66] },
  kilo: { hedef: 1, bolge: [0.9, 1.15] },
};

/** Kasadaki bir meyve */
export interface KasaMeyve {
  meyve: TartMeyve;
  /** kg (üç basamak) */
  agirlik: number;
  curuk: boolean;
}

export interface TartIstek {
  mod: TartMod;
  meyve: TartMeyve;
  /** say: kaç tane */
  adet?: number;
  /** tart: yarım / bir kilo */
  miktar?: 'yarim' | 'kilo';
  /** tart: kadranın yeşil bölgesi (kg) */
  bolge?: [number, number];
  /** kasadaki meyveler (sırası: piramidin alttan üste dizilişi) */
  kasa: KasaMeyve[];
  soz: string[];
  yazi: string;
}

const T = P.tart;
const sec = <X>(a: readonly X[], rnd: Rnd): X => a[Math.floor(rnd() * a.length)];
const arasi = (en: number, son: number, rnd: Rnd) => en + Math.floor(rnd() * (son - en + 1));
function karistir<X>(a: X[], rnd: Rnd): X[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

/** Rastgele, aralıkta bir ağırlık (gram hassasiyeti) */
export function agirlikUret(m: TartMeyve, rnd: Rnd): number {
  const [a, b] = AGIRLIK_ARALIGI[m];
  return Math.round((a + rnd() * (b - a)) * 1000) / 1000;
}

/** Bu sıradaki müşteride kasada çürük var mı (ikinci ve dördüncü müşteri: domates ve bir çürük) */
export const curukluMu = (sira: number) => sira === 1 || sira === 3;

/** Kalıbı doldurur: {Sayi} {urun} */
export function tartDoldur(kalip: string, d: { meyve?: TartMeyve; sayi?: number }): string {
  let s = kalip;
  if (d.meyve) s = s.replaceAll('{urun}', urunAdi(d.meyve));
  if (d.sayi !== undefined) s = s.replaceAll('{Sayi}', buyukHarfBas(sayiAdi(d.sayi))).replaceAll('{sayi}', sayiAdi(d.sayi));
  return s;
}

/** Turdaki 5 müşterinin meyveleri: çürüklü sıralarda domates, ötekiler elma / portakal / patates (karışık) */
export function turMeyveleri(rnd: Rnd = Math.random): TartMeyve[] {
  const diger = karistir<TartMeyve>(['elma', 'portakal', 'patates'], rnd);
  return Array.from({ length: TART_MUSTERI }, (_, i) => (curukluMu(i) ? 'domates' : diger.shift() ?? 'elma'));
}

/**
 * İstek üretir. meyve: turMeyveleri()'nden (verilmezse sıraya göre). zorlaCuruk: test / gösterim.
 * 3 yaş 2-3 tane, 4 yaş 3-5 tane sayar. 5 yaş ilk müşteride yarım kilo, sonra bir kilo; 6 yaş bir kilo, arada yarım.
 */
export function tartIstekUret(yas: Yas, sira: number, rnd: Rnd = Math.random, meyve?: TartMeyve, zorlaCuruk?: boolean): TartIstek {
  const m = meyve ?? (curukluMu(sira) ? 'domates' : sec<TartMeyve>(['elma', 'portakal', 'patates'], rnd));
  const curuk = zorlaCuruk ?? curukluMu(sira);
  const kasaYap = (iyi: number): KasaMeyve[] => {
    const k: KasaMeyve[] = Array.from({ length: iyi }, () => ({ meyve: m, agirlik: agirlikUret(m, rnd), curuk: false }));
    // çürük piramidin alt iki sırasından birinde (çocuğun elinin altında, gözden kaçmaz)
    if (curuk) k.splice(arasi(0, Math.min(5, k.length), rnd), 0, { meyve: m, agirlik: agirlikUret(m, rnd), curuk: true });
    return k;
  };
  if (yas <= 4) {
    const adet = yas === 3 ? arasi(2, 3, rnd) : arasi(3, 5, rnd);
    const s = tartDoldur(T.istek_say, { meyve: m, sayi: adet });
    return { mod: 'say', meyve: m, adet, kasa: kasaYap(adet + 2), soz: [s], yazi: s };
  }
  const miktar: 'yarim' | 'kilo' = yas === 5 ? (sira === 0 ? 'yarim' : 'kilo') : sira === 2 ? 'yarim' : 'kilo';
  const { bolge } = BOLGE[miktar];
  // en hafif meyvelerle bile yeşile ulaşılsın: alt sınır / en hafif + bir yedek (en çok 7; çürükle 8: yığın 4+3+1)
  const iyi = Math.min(7, Math.ceil(bolge[0] / AGIRLIK_ARALIGI[m][0]) + 1);
  const s = tartDoldur(miktar === 'kilo' ? T.istek_kilo : T.istek_yarim, { meyve: m });
  return { mod: 'tart', meyve: m, miktar, bolge: [...bolge], kasa: kasaYap(iyi), soz: [s], yazi: s };
}

/** Leğendeki meyvelere göre sonuç (Ver'e basınca). Çürük varsa önce o (müşteri geri verir). */
export function tartDenetle(ist: TartIstek, legen: Pick<KasaMeyve, 'agirlik' | 'curuk'>[]): TartSonuc {
  if (legen.some((x) => x.curuk)) return 'curuk';
  if (ist.mod === 'say') {
    const n = legen.length;
    return n === ist.adet ? 'tamam' : n < (ist.adet ?? 0) ? 'az' : 'fazla';
  }
  const t = toplam(legen);
  const [a, b] = ist.bolge ?? [0, 0];
  return t < a ? 'az' : t > b ? 'fazla' : 'tamam';
}

/** Toplam ağırlık (kg, gram yuvarlamalı) */
export const toplam = (legen: Pick<KasaMeyve, 'agirlik'>[]) => Math.round(legen.reduce((a, x) => a + x.agirlik, 0) * 1000) / 1000;

/** Çocuk istenene ulaştı mı (çürük yok; Ver düğmesi parlar) */
export const hazirMi = (ist: TartIstek, legen: Pick<KasaMeyve, 'agirlik' | 'curuk'>[]) => tartDenetle(ist, legen) === 'tamam';

/**
 * Kadrandaki ibrenin açısı (derece; 0 yukarı, -80 sol, +80 sağ). Tartmada yeşil bölge kadranın tepesinde,
 * ±BOLGE_ACI genişliğinde (çocuk için iri); öncesi ve sonrası doğrusal. Saymada yalnız canlı tepki: dolu leğen sağa yakın.
 */
export const IBRE_EN = 80;
export const BOLGE_ACI = 20;
export function ibreAcisi(ist: Pick<TartIstek, 'mod' | 'bolge' | 'adet' | 'meyve'>, kg: number): number {
  const w = Math.max(0, kg);
  if (ist.mod === 'tart' && ist.bolge) {
    const [a, b] = ist.bolge;
    let aci: number;
    if (w <= a) aci = -IBRE_EN + (w / a) * (IBRE_EN - BOLGE_ACI);
    else if (w <= b) aci = -BOLGE_ACI + ((w - a) / (b - a)) * 2 * BOLGE_ACI;
    else aci = BOLGE_ACI + ((w - b) / (a * 0.6)) * (IBRE_EN - BOLGE_ACI);
    return Math.min(IBRE_EN + 6, aci);
  }
  // sayma: istenen kadar ortalama meyve ibreyi tepenin biraz sağına getirir
  const [x, y] = AGIRLIK_ARALIGI[ist.meyve];
  const dolu = (ist.adet ?? 3) * ((x + y) / 2) * 1.15;
  return Math.min(IBRE_EN + 6, -IBRE_EN + (w / dolu) * (IBRE_EN + 10));
}

/** Meyvenin fizikteki yarıçapı (leğen eni 100 birim): ağır olan biraz iri (küp kökü) */
export const TABAN_YARICAP: Record<TartMeyve, number> = { domates: 8.4, elma: 8.7, portakal: 8.9, patates: 8.5 };
export function yaricap(m: KasaMeyve): number {
  const [a, b] = AGIRLIK_ARALIGI[m.meyve];
  return TABAN_YARICAP[m.meyve] * Math.cbrt(m.agirlik / ((a + b) / 2));
}

/** Kasa yığını (piramit) satırları: alttan üste */
export function yiginSatirlari(n: number): number[] {
  if (n <= 3) return [n];
  if (n <= 5) return [3, n - 3];
  if (n === 6) return [3, 2, 1];
  if (n <= 9) return [4, 3, n - 7].filter(Boolean);
  return [4, 3, 2, 1];
}

/** Tart Bakalım'ın söyleyebileceği bütün cümleler (seslendirme listesi) */
export function tartCumleleri(): string[] {
  const c: string[] = [T.giris];
  for (const m of TART_MEYVELER) {
    for (let n = 2; n <= 5; n++) c.push(tartDoldur(T.istek_say, { meyve: m, sayi: n }));
    c.push(tartDoldur(T.istek_kilo, { meyve: m }), tartDoldur(T.istek_yarim, { meyve: m }));
  }
  c.push(...T.sayilar, T.hazir, T.cikar, T.surukle, T.curuk_gordu, T.curuk_ver, ...T.kompost, T.taze, T.doldu, ...T.dogru);
  return c;
}
