/**
 * Tıkır Tıkır Lokanta: SAF kurallar (DOM yok, birim testli; ekip/senaryo/RESTORAN.md §3-§6).
 * Tarifler, müşteriler (sever / sevmez / ses), günün planı (tohumla), istek kabulü, tepki kademesi (bayıldı / mmm /
 * komik; ceza yok), ödeme, söz toplama (restoranCumleleri).
 */
import { yemekTemizligi, type Malzeme, type OzelIstek, type Urun, type Yas, type YemekOzelligi } from './mini/arayuz';

// ---------------------------------------------------------------- tarifler

/** İpucu türleri (§4a): balonda tek resim */
export type Ipucu = 'serin' | 'doyurucu' | 'domatesli' | 'citir' | 'tatli' | 'sebzeli';
export const IPUCLARI: readonly Ipucu[] = ['serin', 'doyurucu', 'domatesli', 'citir', 'tatli', 'sebzeli'];

export interface Tarif {
  id: string;
  /** önerilen mini oyun sırası (yol haritası; zorunlu değil). Parantezli olanlar isteğe bağlı. */
  yol: string[];
  /** istasyon rafında görünen malzemeler */
  malzemeler: Malzeme[];
  /** hangi ipuçlarına uyar */
  ipucu: Ipucu[];
  /** serin / sıcak servis */
  sicak: boolean;
}

export const TARIFLER: Record<string, Tarif> = {
  salata: { id: 'salata', yol: ['dogra', 'tabakla'], malzemeler: ['domates', 'salatalik', 'sogan', 'biber', 'maydanoz', 'limon'], ipucu: ['serin', 'domatesli', 'sebzeli'], sicak: false },
  menemen: { id: 'menemen', yol: ['dogra', 'tava', 'tabakla'], malzemeler: ['domates', 'biber', 'sogan', 'yumurta', 'ekmek'], ipucu: ['doyurucu', 'domatesli', 'sebzeli'], sicak: true },
  ayran: { id: 'ayran', yol: ['icecek'], malzemeler: ['yogurt', 'tuz'], ipucu: ['serin'], sicak: false },
  patates: { id: 'patates', yol: ['soy', 'dogra', 'kizart'], malzemeler: ['patates', 'tuz'], ipucu: ['citir', 'doyurucu'], sicak: true },
  corba: { id: 'corba', yol: ['soy', 'dogra', 'kazan', 'tabakla'], malzemeler: ['mercimek', 'havuc', 'sogan', 'limon', 'tuz', 'pulbiber'], ipucu: ['sebzeli', 'doyurucu'], sicak: true },
  pankek: { id: 'pankek', yol: ['kir-cirp', 'tava', 'tabakla'], malzemeler: ['yumurta', 'sut', 'un', 'seker', 'bal', 'muz', 'cilek'], ipucu: ['tatli'], sicak: true },
  pide: { id: 'pide', yol: ['rendele', 'dogra', 'pide'], malzemeler: ['kasar', 'sucuk', 'domates', 'biber', 'yumurta'], ipucu: ['doyurucu', 'citir'], sicak: true },
  kofte: { id: 'kofte', yol: ['yogur', 'mangal', 'tabakla'], malzemeler: ['kofte', 'sogan', 'maydanoz', 'ekmek', 'biber'], ipucu: ['doyurucu', 'citir'], sicak: true },
  limonata: { id: 'limonata', yol: ['icecek'], malzemeler: ['limon', 'seker'], ipucu: ['serin', 'tatli'], sicak: false },
  // v1.1 (P6): meyve şiş, sigara böreği, sütlaç
  sis: { id: 'sis', yol: ['sis'], malzemeler: ['cilek', 'muz', 'kavun', 'uzum', 'bal'], ipucu: ['tatli', 'serin'], sicak: false },
  borek: { id: 'borek', yol: ['sar'], malzemeler: ['yufka', 'peynir', 'maydanoz'], ipucu: ['citir', 'doyurucu'], sicak: true },
  sutlac: { id: 'sutlac', yol: ['sutlac'], malzemeler: ['sut', 'pirinc', 'seker', 'tarcin'], ipucu: ['tatli', 'serin'], sicak: false },
};
/** Gün 1'de açık tarifler */
export const ILK_TARIFLER = ['salata', 'menemen'];

// ---------------------------------------------------------------- yemeği tanı

const SEBZE: Malzeme[] = ['domates', 'salatalik', 'sogan', 'biber', 'maydanoz', 'marul', 'havuc', 'patates'];
const toplamAdet = (o: YemekOzelligi) => Object.values(o.malzemeler).reduce((t, d) => t + (d?.adet ?? 0), 0);
const var_ = (o: YemekOzelligi, m: Malzeme) => (o.malzemeler[m]?.adet ?? 0) > 0;

/** Masaya gelen tabaktaki yemek: mini oyun söylediyse o; yoksa özellikten. 'bos' = görünmez yemek. */
export function yemekTani(u: Pick<Urun, 'yemek' | 'ozellik'>): string {
  if (u.yemek && TARIFLER[u.yemek]) return u.yemek;
  const o = u.ozellik;
  if (toplamAdet(o) === 0) return 'bos';
  if (var_(o, 'yumurta') && o.pisme) return 'menemen';
  if (o.pisme && var_(o, 'patates')) return 'patates';
  if (SEBZE.some((m) => var_(o, m)) && !o.pisme) return 'salata';
  if (o.pisme && SEBZE.some((m) => var_(o, m))) return 'menemen';
  return 'karisik';
}

/** Porsiyon: verilmediyse adetten (az: ≤2 parça, kocaman: ≥10) */
export function porsiyon(o: YemekOzelligi): 'az' | 'normal' | 'kocaman' {
  if (o.porsiyon) return o.porsiyon;
  const n = toplamAdet(o);
  return n <= 2 ? 'az' : n >= 10 ? 'kocaman' : 'normal';
}

/** Yemek bir ipucuna uyuyor mu */
export function ipucunaUyar(ipucu: Ipucu, yemek: string, o: YemekOzelligi): boolean {
  const t = TARIFLER[yemek];
  switch (ipucu) {
    case 'serin':
      return (t ? !t.sicak : false) || (!o.sicak && !o.pisme && toplamAdet(o) > 0);
    case 'doyurucu':
      return (t?.ipucu.includes('doyurucu') ?? false) || porsiyon(o) === 'kocaman';
    case 'domatesli':
      return var_(o, 'domates') || (t?.ipucu.includes('domatesli') ?? false);
    case 'citir':
      return o.pisme === 'citir' || (t?.ipucu.includes('citir') ?? false);
    case 'tatli':
      return (o.tatli ?? 0) > 0 || var_(o, 'bal') || var_(o, 'muz') || var_(o, 'cilek') || (t?.ipucu.includes('tatli') ?? false);
    case 'sebzeli':
      return var_(o, 'havuc') || SEBZE.filter((m) => var_(o, m)).length >= 2;
  }
}

// ---------------------------------------------------------------- müşteriler

/** Zevk koşulu: yemekte bu var mı (temiz: sebzeler Yıka'dan yıkanmış geldi; malzeme zinciri, arayuz.ts) */
export type Zevk =
  | { m: Malzeme }
  | { k: 'kocaman' | 'az' | 'citir' | 'tuzlu' | 'tuzAz' | 'yuz' | 'duzgun' | 'tatli' | 'aci' | 'beyaz' | 'eksi' | 'sicak' | 'tuhaf' | 'temiz' }
  | { t: string };

export interface Musteri {
  id: string;
  /** src/karakter/boy.ts → BOY anahtarı */
  boy: string;
  /** ses tonu (kendi kaydı gelene kadar anlatıcı kaydı bu hızda) */
  ton: number;
  sever: Zevk[];
  sevmez: Zevk[];
  /** komik tepkideki gag (§5c) */
  gag: 'agla' | 'su' | 'bos-tabak' | 'kas' | 'hapsir' | 'sapka' | 'kulak' | 'utangac' | 'pecete' | 'dudak' | 'sakal' | 'omuz';
  /** hangi günden itibaren gelir */
  gun: number;
  /** Kino'nun ailesi (günde en çok 3 kişi) */
  aile?: boolean;
  /** her zaman bununla gelir (aynı masa) */
  eslik?: string;
  /** yalnız eşlikçi olarak gelir */
  eslikci?: boolean;
}

export const MUSTERILER: Record<string, Musteri> = {
  lokum: { id: 'lokum', boy: 'lokum', ton: 1.16, sever: [{ m: 'muz' }, { m: 'bal' }, { k: 'yuz' }], sevmez: [{ m: 'sogan' }], gag: 'agla', gun: 1, aile: true },
  anne: { id: 'anne', boy: 'seri2-anne', ton: 1.04, sever: [{ m: 'limon' }, { m: 'maydanoz' }, { k: 'duzgun' }], sevmez: [{ k: 'tuzlu' }], gag: 'su', gun: 1, aile: true },
  baba: { id: 'baba', boy: 'baba', ton: 0.86, sever: [{ k: 'kocaman' }, { k: 'citir' }, { t: 'kofte' }], sevmez: [{ k: 'az' }], gag: 'bos-tabak', gun: 1, aile: true },
  dede: { id: 'dede', boy: 'dede', ton: 0.84, sever: [{ m: 'sogan' }, { m: 'maydanoz' }, { t: 'ayran' }], sevmez: [{ k: 'tatli' }, { k: 'yuz' }], gag: 'kas', gun: 1, aile: true },
  babaanne: { id: 'babaanne', boy: 'babaanne', ton: 0.95, sever: [{ t: 'corba' }, { k: 'tuzAz' }, { k: 'temiz' }], sevmez: [{ k: 'aci' }], gag: 'hapsir', gun: 2, aile: true },
  tombi: { id: 'tombi', boy: 'tombi', ton: 0.9, sever: [{ k: 'kocaman' }, { m: 'bal' }, { t: 'pankek' }], sevmez: [{ k: 'az' }], gag: 'sapka', gun: 1 },
  zipzip: { id: 'zipzip', boy: 'zipzip', ton: 1.18, sever: [{ m: 'havuc' }, { m: 'salatalik' }], sevmez: [{ m: 'sogan' }], gag: 'kulak', gun: 1 },
  bulut: { id: 'bulut', boy: 'bulut', ton: 1.1, sever: [{ k: 'beyaz' }, { t: 'ayran' }], sevmez: [], gag: 'utangac', gun: 1 },
  bidik: { id: 'bidik', boy: 'bidik', ton: 1.12, sever: [{ m: 'marul' }, { m: 'salatalik' }], sevmez: [], gag: 'pecete', gun: 1, eslik: 'bidicik' },
  bidicik: { id: 'bidicik', boy: 'bidicik', ton: 1.25, sever: [], sevmez: [], gag: 'dudak', gun: 1, eslikci: true },
  'bidik-baba': { id: 'bidik-baba', boy: 'bidik-baba', ton: 0.85, sever: [{ t: 'ayran' }, { m: 'kasar' }], sevmez: [{ k: 'aci' }], gag: 'sakal', gun: 2 },
  // P6 gizli sürpriz §9.11: yalnız pencereden Fındık'a dokununca gelir (planda yok); yanında Fındık yerde kendi kabından
  nehir: { id: 'nehir', boy: 'nehir', ton: 1.05, sever: [{ t: 'limonata' }, { m: 'limon' }, { m: 'havuc' }], sevmez: [{ m: 'sogan' }], gag: 'omuz', gun: 99 },
};

/** Zevk koşulunu yemekte ara */
export function zevkVar(z: Zevk, yemek: string, o: YemekOzelligi): boolean {
  if ('m' in z) return var_(o, z.m);
  if ('t' in z) return yemek === z.t;
  switch (z.k) {
    case 'kocaman':
      return porsiyon(o) === 'kocaman';
    case 'az':
      return porsiyon(o) === 'az';
    case 'citir':
      return o.pisme === 'citir';
    case 'tuzlu':
      return (o.tuz ?? 0) >= 3;
    case 'tuzAz':
      return o.tuz !== undefined && o.tuz <= 1;
    case 'yuz':
      return !!o.yuz;
    case 'duzgun':
      return (o.sus ?? 0) >= 1 && (o.sus ?? 0) <= 4 && porsiyon(o) === 'normal';
    case 'tatli':
      return (o.tatli ?? 0) > 0 || var_(o, 'bal');
    case 'aci':
      return (o.aci ?? 0) > 0 || var_(o, 'pulbiber');
    case 'eksi':
      return (o.eksi ?? 0) > 0 || var_(o, 'limon');
    case 'beyaz':
      return ['ayran', 'sutlac'].includes(yemek) || var_(o, 'yogurt') || var_(o, 'sut');
    case 'sicak':
      return !!o.sicak;
    case 'tuhaf':
      return (var_(o, 'muz') || var_(o, 'bal')) && SEBZE.some((m) => var_(o, m));
    case 'temiz':
      return yemekTemizligi(o) === true;
  }
}

// ---------------------------------------------------------------- istek

export type Istek =
  | { tur: 'resimli'; tarif: string }
  | { tur: 'ipuclu'; ipucu: Ipucu }
  | { tur: 'surpriz' }
  | { tur: 'ozel'; tarif: string; ozel: OzelIstek };

/** İstek tuttu mu (yanlış yemek de yenir, ödenir; yalnız tepki değişir) */
export function istekKabul(istek: Istek, yemek: string, o: YemekOzelligi): boolean {
  if (yemek === 'bos') return false;
  switch (istek.tur) {
    case 'surpriz':
      return true;
    case 'resimli':
      return yemek === istek.tarif;
    case 'ipuclu':
      return ipucunaUyar(istek.ipucu, yemek, o);
    case 'ozel': {
      if (yemek !== istek.tarif) return false;
      const d = istek.ozel.deger;
      if (Array.isArray(d)) return true;
      const m = o.malzemeler[d.malzeme];
      if (!m) return false;
      if ('sayi' in d) return m.adet === d.sayi;
      return m.kesim === d.kesim;
    }
  }
}

export type Tepki = 'bayildi' | 'mmm' | 'komik';
export interface TepkiSonuc {
  tepki: Tepki;
  /** bayıldıysa hangi sevdiği bulundu (pano: §4b keşif ödülü) */
  sevdigi?: string;
  /** komikse neden: sevmediği bir şey, yıkanmamış sebze (toprak tadı; ceza değil, şaka), istek tutmadı ya da boş tabak */
  neden?: 'sevmez' | 'toprak' | 'istek' | 'bos';
}

const zevkAdi = (z: Zevk) => ('m' in z ? z.m : 't' in z ? z.t : z.k);

/**
 * Tepki kademesi (§4b): istek tuttu + sevdiği var → bayıldı; tuttu → mmm; tutmadı, sevmediği var ya da lavabo açıkken
 * yıkanmamış sebze var ("Hmm, biraz toprak tadı var!") → komik. Komik ceza değildir: yer, öder, güler.
 */
export function tepkiHesapla(m: Musteri, istek: Istek, u: Pick<Urun, 'yemek' | 'ozellik'>): TepkiSonuc {
  const yemek = yemekTani(u);
  const o = u.ozellik;
  if (yemek === 'bos') return { tepki: 'komik', neden: 'bos' };
  const sevmez = m.sevmez.find((z) => zevkVar(z, yemek, o));
  if (sevmez) return { tepki: 'komik', neden: 'sevmez' };
  if (!istekKabul(istek, yemek, o)) return { tepki: 'komik', neden: 'istek' };
  // istek tuttu ama yıkanmamış sebze var: şaka (Kino tabağı yine isteğe uyan masaya götürür)
  if (yemekTemizligi(o) === false) return { tepki: 'komik', neden: 'toprak' };
  const sever = m.sever.find((z) => zevkVar(z, yemek, o));
  if (sever) return { tepki: 'bayildi', sevdigi: zevkAdi(sever) };
  return { tepki: 'mmm' };
}

/** Jeton (§4b, §6a): taban 2 (3-4) / 3 (5-6), bayıldıysa +1 bahşiş */
export function odeme(t: Tepki, yas: Yas): { taban: number; bahsis: number } {
  return { taban: yas === 'kucuk' ? 2 : 3, bahsis: t === 'bayildi' ? 1 : 0 };
}

// ---------------------------------------------------------------- günün planı

export interface PlanMusteri {
  musteri: string;
  istek: Istek;
  /** aynı masaya oturan eşlikçi (Bıdıcık) */
  eslik?: string;
}
export interface GunPlani {
  gun: number;
  musteriler: PlanMusteri[];
  masa: number;
  /** aynı anda masada en çok kaç müşteri */
  ayniAnda: number;
  /** yeni müşteri boş masaya en erken kaç ms sonra */
  aralikMs: number;
}

/** Basit tohumlu rastgele (mulberry32) */
export function rastgele(tohum: number): () => number {
  let a = tohum >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Günün müşteri sayısı (§3b): masa × 2, en çok 6 (3-4) / 8 (5-6); Gün 1: 4 / 5 */
export function musteriSayisi(gun: number, yas: Yas, masa: number): number {
  if (gun <= 1) return yas === 'kucuk' ? 4 : 5;
  return Math.min(masa * 2, yas === 'kucuk' ? 6 : 8);
}

/** İlk oyunun Gün 1'i (§13 dilim): Anne salata ister, Lokum kırmızı bir şey, Baba kocaman, Tombi sürpriz (+5-6'da Zıpzıp) */
export function ilkGunPlani(yas: Yas): PlanMusteri[] {
  const p: PlanMusteri[] = [
    { musteri: 'anne', istek: { tur: 'resimli', tarif: 'salata' } },
    { musteri: 'lokum', istek: { tur: 'ipuclu', ipucu: 'domatesli' } },
    { musteri: 'baba', istek: { tur: 'ipuclu', ipucu: 'doyurucu' } },
    { musteri: 'tombi', istek: { tur: 'surpriz' } },
  ];
  if (yas === 'buyuk') p.push({ musteri: 'zipzip', istek: { tur: 'ipuclu', ipucu: 'sebzeli' } });
  return p;
}

/** Menüdeki yemeklerden en az ikisine uyan ipuçları (ipuçlu istekte birden çok doğru olsun) */
export function gecerliIpuclari(menu: string[]): Ipucu[] {
  return IPUCLARI.filter((ip) => {
    const uyan = menu.filter((t) => TARIFLER[t]?.ipucu.includes(ip));
    // 'doyurucu' kocaman porsiyonla her yemekte tutar
    return uyan.length >= 2 || (ip === 'doyurucu' && uyan.length >= 1 && menu.length >= 2);
  });
}

export interface PlanGirdi {
  gun: number;
  yas: Yas;
  tohum: number;
  menu: string[];
  masa: number;
  /** son iki günün müşterileri (önce gelmeyenler gelir) */
  gorulen?: string[];
  /** önce gelsin (test: &musteriler=lokum,zipzip) */
  once?: string[];
  /** dün yeni alınan tarif: bugün mutlaka bir müşteri onu ister */
  yeniTarif?: string;
}

/** Günün planı (§3b, §4a, §5c kuralları): aynı müşteri iki kez gelmez, aile ≤ 3, Bıdıcık Bıdık'la */
export function gunPlani(g: PlanGirdi): GunPlani {
  const r = rastgele(g.tohum);
  const sayi = musteriSayisi(g.gun, g.yas, g.masa);
  const havuz = Object.values(MUSTERILER).filter((m) => !m.eslikci && m.gun <= Math.max(1, g.gun));
  const gorulen = new Set(g.gorulen ?? []);
  const sirali = havuz
    .map((m) => ({ m, p: (g.once?.includes(m.id) ? -10 + g.once.indexOf(m.id) : 0) + (gorulen.has(m.id) ? 2 : 0) + r() }))
    .sort((a, b) => a.p - b.p)
    .map((x) => x.m);
  const secilen: Musteri[] = [];
  let aile = 0;
  for (const m of sirali) {
    if (secilen.length >= sayi) break;
    if (m.aile && aile >= 3) continue;
    if (m.aile) aile++;
    secilen.push(m);
  }
  const menu = g.menu.length ? g.menu : ILK_TARIFLER;
  const ipuclari = gecerliIpuclari(menu);
  const oranlar = g.yas === 'kucuk' ? { resimli: 0.5, ipuclu: 0.3, surpriz: 0.2, ozel: 0 } : { resimli: 0.3, ipuclu: 0.35, surpriz: 0.2, ozel: 0.15 };
  let ozelVar = false;
  const musteriler: PlanMusteri[] = secilen.map((m, i) => {
    let istek: Istek;
    const x = r();
    const sec = <T>(d: readonly T[]) => d[Math.floor(r() * d.length)];
    if (i === 0 && g.yeniTarif && menu.includes(g.yeniTarif)) istek = { tur: 'resimli', tarif: g.yeniTarif };
    else if (x < oranlar.resimli) istek = { tur: 'resimli', tarif: sec(menu) };
    else if (x < oranlar.resimli + oranlar.ipuclu && ipuclari.length) istek = { tur: 'ipuclu', ipucu: sec(ipuclari) };
    else if (x < oranlar.resimli + oranlar.ipuclu + oranlar.surpriz || ozelVar || !menu.includes('salata')) istek = { tur: 'surpriz' };
    else {
      ozelVar = true;
      istek = { tur: 'ozel', tarif: 'salata', ozel: { tur: 'adet', deger: { malzeme: 'salatalik', sayi: 3 } } };
    }
    return m.eslik ? { musteri: m.id, istek, eslik: m.eslik } : { musteri: m.id, istek };
  });
  // aynı tür üç kez üst üste gelmesin (çeşitlilik): üçüncüyü sürprize çevir
  for (let i = 2; i < musteriler.length; i++) {
    const [a, b, c] = [musteriler[i - 2].istek, musteriler[i - 1].istek, musteriler[i].istek];
    if (a.tur === b.tur && b.tur === c.tur) musteriler[i].istek = c.tur === 'surpriz' ? { tur: 'resimli', tarif: menu[i % menu.length] } : { tur: 'surpriz' };
  }
  return {
    gun: g.gun,
    musteriler,
    masa: g.masa,
    ayniAnda: g.yas === 'kucuk' ? Math.min(2, g.masa) : g.masa,
    aralikMs: 6000,
  };
}

// ---------------------------------------------------------------- sözler

import lokantaJson from '../../content/restoran/lokanta.json';
const MINI_SOZLER = import.meta.glob<Record<string, unknown>>('../../content/restoran/mini-*.json', { eager: true, import: 'default' });
const DIGER_SOZLER = import.meta.glob<Record<string, unknown>>('../../content/restoran/*.json', { eager: true, import: 'default' });

export const L = lokantaJson;
const topla = (v: unknown): string[] => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(topla) : v && typeof v === 'object' ? Object.values(v).flatMap(topla) : []);

/** Ekranda görünen ama seslendirilmeyen anahtarlar */
const SESSIZ = new Set(['aciklama', 'balon', 'arayuz']);
const sesliTopla = (o: Record<string, unknown>, haric: string[] = []): string[] =>
  Object.entries(o)
    .filter(([k]) => !SESSIZ.has(k) && !haric.includes(k))
    .flatMap(([, v]) => topla(v));

/**
 * Anlatıcı sesiyle seslendirilecek bütün lokanta sözleri: Mino, yemek adları, müşteri sözleri (kendi sesleri
 * gelene kadar anlatıcı kaydı müşterinin tonuyla çalar) ve mini oyunların sözleri (content/restoran/mini-*.json;
 * her paket kendi dosyasını yazar, burası hepsini toplar). Kino'nunkiler ayrı (restoranKinoCumleleri).
 */
export function restoranCumleleri(): string[] {
  const c: string[] = [...sesliTopla(L as unknown as Record<string, unknown>, ['kino'])];
  for (const [yol, j] of Object.entries(DIGER_SOZLER)) {
    if (/lokanta\.json$/.test(yol)) continue;
    // babaanne ve müşteriler yalnız kendi sesiyle (yeni dosyalarda anlatıcı yedeği yok; lokanta.json'dakiler duruyor)
    c.push(...sesliTopla(j, ['kino', 'babaanne', 'musteri']));
  }
  return [...new Set(c.map((t) => t.replace(/\s+/g, ' ').trim()).filter(Boolean))];
}
/**
 * Kendi Seri 2 sesiyle (eleven_v4) konuşanların cümleleri: her content/restoran/*.json'daki "musteri.<ad>" (anahtar =
 * konuşan) ve "babaanne" bölümü. Oyun bunları konus(metin, { karakter: ad }) ile çalar.
 */
export function restoranKarakterCumleleri(): Record<string, string[]> {
  const r: Record<string, Set<string>> = {};
  const ekle = (kim: string, v: unknown) => {
    const s = (r[kim] ??= new Set());
    for (const t of topla(v)) if (t.trim()) s.add(t.replace(/\s+/g, ' ').trim());
  };
  for (const j of Object.values(DIGER_SOZLER)) {
    const o = j as { musteri?: Record<string, unknown>; babaanne?: unknown };
    for (const [ad, v] of Object.entries(o.musteri ?? {})) ekle(ad, v);
    if (o.babaanne) ekle('babaanne', o.babaanne);
  }
  return Object.fromEntries(Object.entries(r).map(([k, s]) => [k, [...s]]));
}
/** Kino'nun kendi sesiyle seslendirilecek cümleler (lokanta + mini oyunların "kino" bölümleri) */
export function restoranKinoCumleleri(): string[] {
  const c = topla(L.kino);
  for (const [yol, j] of Object.entries(DIGER_SOZLER)) if (!/lokanta\.json$/.test(yol) && j.kino) c.push(...topla(j.kino));
  return [...new Set(c)];
}
/** Mini oyun sözleri (test: yasak kelime denetimi) */
export const miniSozleri = (): string[] => Object.values(MINI_SOZLER).flatMap((j) => sesliTopla(j));

/** Anlatıcının emir sözleri (birim testi denetler; §4c) */
export const YASAK_DESEN = /(^|[^\p{L}])(dokun\p{L}*|tıkla\p{L}*|bas|basın|bastır\p{L}*|sürükle\p{L}*|şimdi şunu)(?=[^\p{L}]|$)/iu;
