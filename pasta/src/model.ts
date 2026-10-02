/**
 * Mino'nun Pasta Otobüsü: oyunun saf mantığı (DOM yok; birim testleri buradan sınar).
 * Tasarım: ekip/senaryo/pasta-otobusu.md (ilk sürüm), pasta-otobusu-v2.md (derinleştirme).
 *
 * SADE SÜRÜM (Barış, 2026-10-02: "çok karmaşık yapma, daha basit olmalı, şu an zor"): 3 gün, günde 4 müşteri, sırada
 * en çok 2 müşteri; bir gün ~3 dakika. Sipariş tek kalem: kurabiye (Gün 1 tek kurabiye, sonra en çok 2), şekil
 * yuvarlak / yıldız / kalp, krema pembe / mavi / sarı; Gün 2-3 tek tür süs (çilek, çikolata, muz) kurabiye başına 1-3;
 * Gün 3'te bazı kurabiyeler zigzag kremalı (kolay bir kaydırma). İçecek, bulaşık, yüz, serpinti, kapkek, doğum günü,
 * kafası karışık müşteri, yükseltmeler oyundan çıktı (tipler ve çizimler duruyor; balon ve tezgâh bunları göstermez).
 * - Karşılaştırma ret etmez: farklı olan şeyler listelenir (balonda bir an parlar), müşteri yine yer.
 */
import P from '../../content/pasta.json';
import { buyukHarfBas, sayiAdi } from '../../src/audio/metin';
import { serpintiSeviye, type Desen, type Yuz } from './desen';

export type { Desen, Yuz } from './desen';
export type Sekil = 'yuvarlak' | 'yildiz' | 'kalp' | 'ay';
export type Kalip = Sekil | 'kapkek';
export type Urun = 'kurabiye' | 'kapkek' | 'icecek';
export type Renk = 'pembe' | 'mavi' | 'sari' | 'mor';
export type Sus = 'cilek' | 'havuc' | 'bal' | 'muz' | 'cikolata';
export type Icecek = 'sut' | 'kakao' | 'limonata';
export type Boy = 'kucuk' | 'buyuk';
export type Gun = 1 | 2 | 3;
export type Yer = 'park' | 'okul' | 'plaj' | 'kar' | 'senlik';
export type Fark = 'urun' | 'adet' | 'sekil' | 'renk' | 'desen' | 'yuz' | 'yigin' | 'sus' | 'serpinti' | 'mum' | 'icecek' | 'boy' | 'dolum';

/** Bir günde gelen müşteri */
export const MUSTERI_SAYISI = 4;
/** Aynı anda en çok bu kadar müşteri sırada */
export const EN_COK_MUSTERI = 2;
/** Fırının kapı sayısı (görselde üç kapı; hepsi açık) */
export const FIRIN_GOZ = 3;
/** Bir siparişte en çok bu kadar kurabiye (tepsiye de en çok bu kadar hamur topu) */
export const EN_COK_HAMUR = 2;
/** Bir kurabiyenin üstüne en çok bu kadar süs sığar; fazlası kayıp düşer (Kino yakalar) */
export const EN_COK_SUS = 3;
/** Kapkeğin üstüne en çok bu kadar krema yığını sığar (sade sürümde kapkek yok) */
export const EN_COK_YIGIN = 3;
/** Oynanabilen son gün */
export const SON_OYNANAN = 3;

export const SEKILLER: Sekil[] = ['yuvarlak', 'yildiz', 'kalp'];
export const RENKLER: Renk[] = ['pembe', 'mavi', 'sari'];
export const SUSLER: Sus[] = ['cilek', 'cikolata', 'muz'];

/** Krema renkleri (parlak, iştah açıcı) */
export const RENK_KODU: Record<Renk, string> = { pembe: '#FF8CC0', mavi: '#6CC4FF', sari: '#FFD84A', mor: '#B98BFF' };
/** İçeceklerin rengi (çizimler için; sade sürümde içecek siparişi yok) */
export const ICECEK_KODU: Record<Icecek, string> = { sut: '#FFF3DA', kakao: '#9A5B35', limonata: '#FFE45C' };

export interface Kalem {
  urun: Urun;
  adet: number;
  /** kurabiyenin şekli (kapkek ve içecekte null) */
  sekil: Sekil | null;
  /** krema rengi (null: kremasız; içecekte null) */
  renk: Renk | null;
  sus: Sus | null;
  /** parça başına süs sayısı */
  susAdet: number;
  /** kapkekte krema yığını sayısı (kurabiyede 0) */
  yigin: number;
  /** kurabiyede krema deseni (yoksa düz) */
  desen?: Desen;
  /** serpinti seviyesi: 0 yok, 1 az, 2 bol (yoksa 0) */
  serpinti?: number;
  yuz?: Yuz | null;
  mum?: number;
  icecek?: Icecek;
  boy?: Boy;
}

export interface Siparis {
  musteri: string;
  kalemler: Kalem[];
}

/** Tepside / fırında / tabakta bir parça */
export interface Parca {
  /** kurabiyenin kreması */
  renk: Renk | null;
  yigin: Renk[];
  susler: Sus[];
  /** krema deseni (yoksa düz) */
  desen?: Desen | null;
  serpinti?: number;
  yuz?: Yuz | null;
  mum?: number;
}
/** Bardak (eski içecek makinesinden; sade sürümde yok) */
export interface Bardak {
  icecek: Icecek | null;
  boy: Boy;
  dolum: number;
}
/** Aynı kalıptan çıkan bir parti (fırının bir gözü, tabağın üstü) */
export interface Parti {
  urun: Urun;
  sekil: Sekil | null;
  parcalar: Parca[];
  bardak?: Bardak;
}

// ---------------------------------------------------------------- günler ve müşteriler
/** Günün yeniliği (açılış kartında resimle) */
export type Yenilik = 'kurabiye' | 'sus' | 'desen';
export interface GunAyari {
  yer: Yer;
  /** günün dört müşterisi (her biri bir kez) */
  musteriler: string[];
  /** ikinci müşterinin gelişi için en kısa süre (ms; sırada en çok iki müşteri: çocuk iki işi birden çevirir) */
  aralik: number;
  /** sabır kalbinin dolma süresi (ms); dolunca müşteri yalnız uyuklar (gitmez, ceza yok) */
  sabir: number;
  /** üç yıldız için mutlu müşteri (sipariş tam aynı) */
  hedef: number;
  /** bu günde ilk kez gelen */
  yeni: Yenilik;
}
/** Üç gün: park (yalnız krema), plaj (süs), karlı bahçe (süs ve zigzag krema) */
export const GUNLER: Record<Gun, GunAyari> = {
  1: { yer: 'park', musteriler: ['tavsan', 'ordek', 'can', 'ada'], aralik: 9000, sabir: 120000, hedef: 3, yeni: 'kurabiye' },
  2: { yer: 'plaj', musteriler: ['ayi', 'elif', 'tavsan', 'can'], aralik: 9000, sabir: 120000, hedef: 3, yeni: 'sus' },
  3: { yer: 'kar', musteriler: ['ordek', 'ada', 'ayi', 'elif'], aralik: 9000, sabir: 120000, hedef: 3, yeni: 'desen' },
};
export const GUN_SAYISI = 3;
export const oynanirMi = (g: number) => g >= 1 && g <= SON_OYNANAN;

/** Müşterinin sevdiği şey siparişine yansır: ördek sarı kremalı */
export const SEVGI: Record<string, { renk?: Renk; sus?: Sus }> = { ordek: { renk: 'sari' } };

// ---------------------------------------------------------------- yıldız
/** Günün yıldızı: 1 gün bitti (her zaman), 2 en az iki mutlu müşteri, 3 hedef (üç mutlu müşteri) */
export function yildizHesapla(mutlu: number, hedef = 3): 1 | 2 | 3 {
  if (mutlu >= hedef) return 3;
  return mutlu >= Math.min(2, hedef - 1) ? 2 : 1;
}

/** Açık olan (kullanılabilen) kalıplar, renkler, süsler; zigzag krema */
export interface Acik {
  sekiller: Sekil[];
  renkler: Renk[];
  susler: Sus[];
  /** zigzag krema (Gün 3) */
  zigzag: boolean;
}

/** Güne göre tezgâhta olanlar: Gün 1 yalnız krema, Gün 2'den itibaren süs kavanozları, Gün 3'te zigzag krema */
export function acikOlanlar(gun: number): Acik {
  return { sekiller: SEKILLER.slice(), renkler: RENKLER.slice(), susler: gun >= 2 ? SUSLER.slice() : [], zigzag: gun >= 3 };
}

type Rnd = () => number;
const sec = <T>(a: readonly T[], rnd: Rnd): T => a[Math.floor(rnd() * a.length) % a.length];
const arasi = (a: number, b: number, rnd: Rnd) => a + Math.floor(rnd() * (b - a + 1));

/**
 * Bir kurabiye kalemi. Gün 1: tek kurabiye, yalnız krema. Gün 2-3: 1-2 kurabiye, tek tür süs (kurabiye başına 1-3;
 * iki kurabiyede en çok 2, toplam dokunuş 4'ü geçmez). zigzag: kremanın üstünde zigzag (Gün 3).
 */
export function kurabiyeKalemi(gun: Gun, musteri: string, acik: Acik, rnd: Rnd = Math.random, o: { tek?: boolean; zigzag?: boolean } = {}): Kalem {
  const sevgi = SEVGI[musteri] ?? {};
  const renk = sevgi.renk && acik.renkler.includes(sevgi.renk) ? sevgi.renk : sec(acik.renkler, rnd);
  const sekil = sec(acik.sekiller, rnd);
  const desen: Desen = o.zigzag && acik.zigzag ? 'zigzag' : 'duz';
  if (gun === 1 || !acik.susler.length) return { urun: 'kurabiye', adet: 1, sekil, renk, sus: null, susAdet: 0, yigin: 0, desen, serpinti: 0 };
  const adet = o.tek ? 1 : arasi(1, EN_COK_HAMUR, rnd);
  // açık renk muz dilimi sarı kremada seçilmez (görünsün, sayılsın)
  const sus = sec(acik.susler.filter((s) => !(s === 'muz' && renk === 'sari')), rnd);
  const susAdet = arasi(1, adet === 1 ? EN_COK_SUS : 2, rnd);
  return { urun: 'kurabiye', adet, sekil, renk, sus, susAdet, yigin: 0, desen, serpinti: 0 };
}

/** Aynı karakter arka arkaya gelmesin diye karıştırır */
export function sirala<T>(adlar: T[], rnd: Rnd = Math.random): T[] {
  for (let deneme = 0; deneme < 30; deneme++) {
    const a = adlar.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    if (a.every((x, i) => i === 0 || x !== a[i - 1])) return a;
  }
  return adlar.slice();
}

/**
 * Günün 4 siparişi (sırasıyla). Gün 1: hep tek kurabiye, yalnız krema. Gün 2: ilk müşteri tek kurabiye; süslü.
 * Gün 3: ikisi zigzag kremalı (ilki tek kurabiye), ikisi düz; hepsi süslü. Aynı şekil arka arkaya gelmez (çeşit).
 */
export function gunPlani(gun: Gun, acik: Acik = acikOlanlar(gun), rnd: Rnd = Math.random): Siparis[] {
  const g = GUNLER[gun];
  const adlar = sirala(g.musteriler, rnd);
  const zigzaglar = gun >= 3 ? new Set(sirala([0, 1, 2, 3], rnd).slice(0, 2)) : new Set<number>();
  let onceki: Sekil | null = null;
  return adlar.map((musteri, i) => {
    let k = kurabiyeKalemi(gun, musteri, acik, rnd, { tek: i === 0, zigzag: zigzaglar.has(i) });
    for (let d = 0; d < 6 && k.sekil === onceki; d++) k = { ...k, sekil: sec(acik.sekiller, rnd) };
    onceki = k.sekil;
    return { musteri, kalemler: [k] };
  });
}

/** Sıradaki müşteri: kuyrukta, şu an tezgâhta olmayan ilk karakter (aynı karakter iki kez görünmesin) */
export function siradakiIndeks(kuyruk: readonly Siparis[], mevcut: readonly string[]): number {
  return kuyruk.findIndex((s) => !mevcut.includes(s.musteri));
}

// ---------------------------------------------------------------- karşılaştırma
/** Parçanın krema renkleri (kurabiye: kreması, kapkek: yığınları) */
const parcaRenkleri = (urun: Urun, p: Parca): (Renk | null)[] => (urun === 'kurabiye' ? [p.renk] : p.yigin.length ? p.yigin : [null]);

/** Bir kalem ile verilen parti arasındaki farklar (boşsa tam aynı) */
export function karsilastir(kalem: Kalem, parti: Parti | null | undefined): Fark[] {
  if (!parti || !parti.parcalar.length) return ['urun'];
  const f = new Set<Fark>();
  if (parti.urun !== kalem.urun) f.add('urun');
  if (parti.parcalar.length !== kalem.adet) f.add('adet');
  if (kalem.urun === 'kurabiye' && parti.urun === 'kurabiye' && parti.sekil !== kalem.sekil) f.add('sekil');
  for (const p of parti.parcalar) {
    if (parcaRenkleri(parti.urun, p).some((r) => r !== kalem.renk)) f.add('renk');
    if (kalem.urun === 'kapkek' && parti.urun === 'kapkek' && p.yigin.length !== kalem.yigin) f.add('yigin');
    if (p.susler.length !== kalem.susAdet || p.susler.some((s) => s !== kalem.sus)) f.add('sus');
    if (kalem.urun === 'kurabiye' && parti.urun === 'kurabiye') {
      // kremasız kurabiyede desen sorulmaz
      if (kalem.renk && p.renk && (p.desen ?? 'duz') !== (kalem.desen ?? 'duz')) f.add('desen');
      if ((p.yuz ?? null) !== (kalem.yuz ?? null)) f.add('yuz');
      if (serpintiSeviye(p.serpinti ?? 0) !== (kalem.serpinti ?? 0)) f.add('serpinti');
    }
  }
  return siraliFark(f);
}
const FARK_SIRA: Fark[] = ['urun', 'adet', 'sekil', 'renk', 'desen', 'yuz', 'yigin', 'sus', 'serpinti', 'mum', 'icecek', 'boy', 'dolum'];
const siraliFark = (f: Set<Fark>) => FARK_SIRA.filter((x) => f.has(x));

/** Verilen parti siparişin hangi kalemine gider: önce aynı üründen boş kalem, yoksa ilk boş kalem (-1: hepsi dolu) */
export function kalemSec(sip: Siparis, verilen: readonly (Parti | null)[], parti: Parti): number {
  const bos = sip.kalemler.map((_, i) => i).filter((i) => !verilen[i]);
  return bos.find((i) => sip.kalemler[i].urun === parti.urun) ?? bos[0] ?? -1;
}

export interface Sonuc {
  ayni: boolean;
  /** kalem kalem farklar */
  farklar: Fark[][];
}
export function siparisSonucu(sip: Siparis, verilen: readonly (Parti | null)[]): Sonuc {
  const farklar = sip.kalemler.map((k, i) => karsilastir(k, verilen[i]));
  return { ayni: farklar.every((f) => !f.length), farklar };
}

/**
 * Tabaktaki (ya da yapılmakta olan) parti hangi müşterinin kalemi için: en çok tutan kalem (şekil, adet, krema
 * rengi); eşitse gelişi en eski müşteri. Parti yoksa gelişi en eski müşterinin kalemi.
 */
export function hedefKalem(bekleyenler: readonly { sip: Siparis; verilen: readonly (Parti | null)[] }[], parti?: Parti | null, renk?: Renk | null): Kalem | null {
  const bos = bekleyenler.flatMap((m) => m.sip.kalemler.filter((_, i) => !m.verilen[i]));
  if (!parti) return bos[0] ?? null;
  let en: Kalem | null = null;
  let enPuan = -1;
  for (const k of bos) {
    if (k.urun !== parti.urun) continue;
    const r = renk ?? parti.parcalar[0]?.renk ?? null;
    const puan = (k.urun !== 'kurabiye' || k.sekil === parti.sekil ? 4 : 0) + (k.adet === parti.parcalar.length ? 2 : 0) + (r && k.renk === r ? 1 : 0);
    if (puan > enPuan) {
      enPuan = puan;
      en = k;
    }
  }
  return en;
}

// ---------------------------------------------------------------- fırın
/**
 * Fırın zamanları (ms): beyaz (çiğ) → altın sarısı (tam kıvamında, "ding") → altın en az 10 sn öyle kalır (kizar'a
 * kadar), sonra yavaşça kızarır → yanık (10 sn daha sonra). Gün 1'de hiç yanmaz (yanik: Infinity).
 */
export const FIRIN = { altin: 5000, kizar: 15000, yanik: 25000 };
export interface FirinZaman {
  altin: number;
  /** altın bu ana kadar hiç koyulaşmaz (yoksa hemen koyulaşmaya başlar) */
  kizar?: number;
  yanik: number;
}
export type FirinHali = 'cig' | 'altin' | 'yanik';

export function firinHali(gecen: number, z: FirinZaman = FIRIN): FirinHali {
  return gecen >= z.yanik ? 'yanik' : gecen >= z.altin ? 'altin' : 'cig';
}
/** Pişme: 0 çiğ … 1 altın (kizar'a kadar) … 2 yanık (renk geçişi için, sınırlı) */
export function pisme(gecen: number, z: FirinZaman = FIRIN): number {
  if (gecen <= 0) return 0;
  if (gecen < z.altin) return gecen / z.altin;
  const k = z.kizar ?? z.altin;
  if (gecen < k || !Number.isFinite(z.yanik)) return 1;
  return Math.min(2, 1 + (gecen - k) / Math.max(1, z.yanik - k));
}

/** İki renk (#rrggbb) arasında doğrusal geçiş */
export function renkKaristir(a: string, b: string, t: number): string {
  const u = Math.max(0, Math.min(1, t));
  const p = (s: string, i: number) => parseInt(s.slice(1 + i * 2, 3 + i * 2), 16);
  return '#' + [0, 1, 2].map((i) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * u).toString(16).padStart(2, '0')).join('');
}
/** Hamurun rengi: beyaz → altın → kahverengi */
export const HAMUR_RENK = { cig: '#FBF0DC', altin: '#F3B54A', yanik: '#7B4526' };
export function hamurRengi(pismeDegeri: number): string {
  return pismeDegeri <= 1 ? renkKaristir(HAMUR_RENK.cig, HAMUR_RENK.altin, pismeDegeri) : renkKaristir(HAMUR_RENK.altin, HAMUR_RENK.yanik, pismeDegeri - 1);
}

// ---------------------------------------------------------------- jeton
/** Sabır kalbi bu orandan önce servis edilirse (ve müşteri uyuklamadıysa) bahşiş */
export const HIZLI = 0.75;
/**
 * Tam aynıysa 3 jeton (+1 bahşiş: müşteri uyuklamadan servis), farklıysa 2 jeton. Ret yok, ceza yok.
 * sabir: servis anında sabır kalbinin doluluğu (0..1).
 */
export function jetonHesapla(ayni: boolean, sabir: number, uyudu: boolean): { jeton: number; bahsis: number } {
  if (!ayni) return { jeton: 2, bahsis: 0 };
  return { jeton: 3, bahsis: !uyudu && sabir < HIZLI ? 1 : 0 };
}

/**
 * Akşam kumbara sayımı: 10'a kadar tek tek ("Bir!" … "On!"), fazlası beşer beşer ("Beş!", "On!", "On beş!", "Yirmi!").
 * Dönen: söylenecek sayılar ve her sözde kumbaraya düşen jeton sayısı.
 */
export function sayim(n: number): { soz: string[]; adim: number[] } {
  if (n <= 0) return { soz: [], adim: [] };
  if (n <= 10) return { soz: Array.from({ length: n }, (_, i) => sayiSozu(i + 1)), adim: Array.from({ length: n }, () => 1) };
  const besli = P.parca.besli;
  const soz: string[] = [];
  const adim: number[] = [];
  let sayilan = 0;
  for (let i = 0; i < besli.length && sayilan + 5 <= n; i++) {
    soz.push(besli[i]);
    adim.push(5);
    sayilan += 5;
  }
  // artan jetonlar sessizce düşer (ekranda sayı görünür)
  if (n > sayilan) adim.push(n - sayilan);
  return { soz, adim };
}

// ---------------------------------------------------------------- dükkân rafı (yalnız süs: şapka ve otobüs boyası)
export type RafTuru = 'sapka' | 'boya';
export interface RafUrunu {
  id: string;
  tur: RafTuru;
  deger: string;
  fiyat: number;
}
/** Akşam dükkân rafı: fiyatlar jetonla (çocuk "yeter mi?" diye sayar); oyunu değiştirmez, yalnız süs */
export const RAF: RafUrunu[] = [
  { id: 'sapka', tur: 'sapka', deger: 'sapka', fiyat: 5 },
  { id: 'boya-nane', tur: 'boya', deger: 'nane', fiyat: 10 },
  { id: 'boya-limon', tur: 'boya', deger: 'limon', fiyat: 10 },
];
/** Otobüs boyaları (varsayılan pembe) */
export const BOYA: Record<string, { govde: string; koyu: string }> = {
  pembe: { govde: '#FF8CC0', koyu: '#E2609E' },
  nane: { govde: '#7FE0C4', koyu: '#3FB596' },
  limon: { govde: '#FFD84A', koyu: '#E8AE1E' },
};

export interface Cuzdan {
  jeton: number;
  alinan: string[];
}
/** Alınabilir mi: alınmamış ve jeton yetiyor */
export const alinabilir = (c: Cuzdan, u: RafUrunu) => !c.alinan.includes(u.id) && c.jeton >= u.fiyat;
/** Satın alır (jeton düşer); olmadıysa false */
export function satinAl(c: Cuzdan, id: string): boolean {
  const u = RAF.find((x) => x.id === id);
  if (!u || !alinabilir(c, u)) return false;
  c.jeton -= u.fiyat;
  c.alinan.push(u.id);
  return true;
}

// ---------------------------------------------------------------- konuşma
/** "İki!" (mevcut sayı kayıtları) */
export const sayiSozu = (n: number) => `${buyukHarfBas(sayiAdi(n))}!`;

/** Siparişin okunuşu (parçalı kayıt): {sayı} {şekil} kurabiye, {renk} kremalı, {desen}, {süs}lü! */
export function okuma(sip: Siparis): string[] {
  return sip.kalemler.flatMap((k) => kalemOkumasi(k));
}
export function kalemOkumasi(k: Kalem): string[] {
  if (k.urun === 'icecek') return [(P.parca.icecek as Record<string, string>)[`${k.boy ?? 'kucuk'}-${k.icecek ?? 'sut'}`]];
  const sekil = P.parca.sekil[k.urun === 'kapkek' ? 'kapkek' : (k.sekil ?? 'yuvarlak')];
  const ekler: string[] = [];
  if (k.urun === 'kurabiye' && k.desen && k.desen !== 'duz') ekler.push((P.parca.desen as Record<string, string>)[k.desen]);
  if (k.yuz) ekler.push(P.parca.yuz[k.yuz]);
  if (k.sus) ekler.push(P.parca.sus[k.sus]);
  if (k.serpinti) ekler.push(k.serpinti >= 2 ? P.parca.serpinti.bol : P.parca.serpinti.az);
  const renk = k.renk ? [(ekler.length ? P.parca.renk_ara : P.parca.renk_son)[k.renk]] : [];
  return [sayiSozu(k.adet), sekil, ...renk, ...ekler];
}

/** Müşterinin teşekkürü: sevdiği şey tabaktaysa birinci cümle (ör. ördek "Vak, şahane!"), yoksa rastgele biri */
export function tesekkur(musteri: string, verilen: readonly (Parti | null)[], rnd: Rnd = Math.random): string {
  const t = (P.musteri as unknown as Record<string, string[]>)[musteri];
  if (!t) return P.mino.afiyet;
  const sevgi = SEVGI[musteri];
  if (sevgi) {
    const parcalar = verilen.flatMap((v) => v?.parcalar ?? []);
    const var_ = parcalar.some((p) => (sevgi.sus && p.susler.includes(sevgi.sus)) || (sevgi.renk && (p.renk === sevgi.renk || p.yigin.includes(sevgi.renk))));
    return var_ ? t[0] : t[1];
  }
  // tavşanın "Mmm, havuç!" ve ayının "Ballı, nefis!" sözleri sade sürümde (havuç, bal yok) söylenmez
  if (musteri === 'tavsan' || musteri === 'ayi') return t[1];
  return sec(t, rnd);
}

const topla = (v: unknown): string[] => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(topla) : v && typeof v === 'object' ? Object.values(v).flatMap(topla) : []);

/** Anlatıcı sesiyle seslendirilecek bütün cümleler (Mino, müşteriler, parçalar, sayılar) */
export function pastaCumleleri(): string[] {
  const c = [...topla(P.mino), ...topla(P.musteri), ...topla(P.parca), ...Array.from({ length: 10 }, (_, i) => sayiSozu(i + 1))];
  return [...new Set(c)];
}
/** Kino'nun kendi sesiyle seslendirilecek cümleler */
export function pastaKinoCumleleri(): string[] {
  return topla(P.kino);
}
