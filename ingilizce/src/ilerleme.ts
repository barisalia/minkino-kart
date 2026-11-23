/**
 * İlerleme kaydı ve aralıklı tekrar (saf mantık + depolama).
 *
 * Her öğrenilen kelime bir "kutu"da durur (1–5). Çocuk kelimeyi ilk denemede bulursa bir üst kutuya çıkar ve daha
 * seyrek sorulur; bulamazsa bir alt kutuya iner ve daha sık sorulur. Günün Tekrarı ve derslerin ısınma soruları
 * vadesi gelen kelimelerden seçilir (okul öncesinde aralıklı geri çağırma: Leonard ve ark. 2019–2020).
 */
import { TUM_DERSLER, kelimeBul, yeniKelimeler, type Ders } from './icerik';

export const ANAHTAR = 'minkino-ingilizce-v1';
export const GUN_MS = 86_400_000;
/** Kutuların bekleme süresi (gün): 1. kutu hemen, 5. kutu sekiz gün sonra yeniden sorulur */
export const ARALIKLAR = [0, 1, 2, 4, 8] as const;
export const EN_UST_KUTU = ARALIKLAR.length;

export interface KelimeDurumu {
  kutu: number;
  /** kutunun son değiştiği an (ms): bekleme süresi buradan sayılır */
  son: number;
  dogru: number;
  yanlis: number;
}

export interface Kayit {
  surum: 1;
  /** ders kimliği → kazanılan yıldız (1–3) */
  dersler: Record<string, number>;
  kelimeler: Record<string, KelimeDurumu>;
  /** albümdeki çıkartmalar, kazanılma sırasıyla */
  cikartmalar: string[];
  /** Günün Tekrarı: son yapıldığı gün ve o gün kaç kez */
  tekrar: { gun: string; adet: number };
  /** ders ya da tekrar yapılan günler ('2026-11-17'), eskiden yeniye; en çok son 60 gün tutulur */
  gunler: string[];
  /** Ceren ile Polly'nin ilk tanışma konuşması yapıldı mı */
  tanisildi: boolean;
}

const vade = (d: KelimeDurumu): number => d.son + ARALIKLAR[d.kutu - 1] * GUN_MS;

export const bosKayit = (): Kayit => ({ surum: 1, dersler: {}, kelimeler: {}, cikartmalar: [], tekrar: { gun: '', adet: 0 }, gunler: [], tanisildi: false });

const sayi = (v: unknown, alt: number, ust: number, yoksa: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.max(alt, Math.min(ust, Math.round(v))) : yoksa;

/** Depodan gelen metni güvenli kayda çevirir: tanınmayan ders ve kelimeler atılır, sayılar sınırlanır */
export function kayitCoz(ham: string | null | undefined): Kayit {
  const k = bosKayit();
  if (!ham) return k;
  let o: unknown;
  try { o = JSON.parse(ham); } catch { return k; }
  if (!o || typeof o !== 'object') return k;
  const v = o as Partial<Record<keyof Kayit, unknown>>;
  const dersIdleri = new Set(TUM_DERSLER.map((d) => d.id));
  if (v.dersler && typeof v.dersler === 'object') {
    for (const [id, y] of Object.entries(v.dersler as Record<string, unknown>)) {
      if (dersIdleri.has(id) && typeof y === 'number' && y >= 1) k.dersler[id] = sayi(y, 1, 3, 1);
    }
  }
  if (v.kelimeler && typeof v.kelimeler === 'object') {
    for (const [id, d] of Object.entries(v.kelimeler as Record<string, Partial<KelimeDurumu> | null>)) {
      if (!kelimeBul(id) || !d || typeof d !== 'object') continue;
      k.kelimeler[id] = { kutu: sayi(d.kutu, 1, EN_UST_KUTU, 1), son: sayi(d.son, 0, Number.MAX_SAFE_INTEGER, 0), dogru: sayi(d.dogru, 0, 1e6, 0), yanlis: sayi(d.yanlis, 0, 1e6, 0) };
    }
  }
  if (Array.isArray(v.cikartmalar)) k.cikartmalar = [...new Set(v.cikartmalar.filter((id): id is string => typeof id === 'string' && !!kelimeBul(id)))];
  // bitmiş kelime dersinin çekirdek kelimeleri albümde olur (ders 3 kelimeden 4'e çıkmadan önce bitirilmiş dersler de)
  for (const d of TUM_DERSLER) {
    if (d.no > 1 || !k.dersler[d.id]) continue;
    for (const w of yeniKelimeler(d.unite, d.no)) if (!w.ek && !k.cikartmalar.includes(w.id)) k.cikartmalar.push(w.id);
  }
  // albümde olup tekrar kaydı olmayan kelime (yarım ya da elle değişmiş kayıt) tekrar dışında kalmasın
  for (const id of k.cikartmalar) k.kelimeler[id] ??= { kutu: 1, son: 0, dogru: 0, yanlis: 0 };
  const t = v.tekrar as Partial<Kayit['tekrar']> | undefined;
  if (t && typeof t === 'object' && typeof t.gun === 'string') k.tekrar = { gun: t.gun, adet: sayi(t.adet, 0, 99, 0) };
  if (Array.isArray(v.gunler)) k.gunler = [...new Set(v.gunler.filter((g): g is string => typeof g === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(g)))].sort().slice(-60);
  k.tanisildi = v.tanisildi === true;
  return k;
}

/** Yerel takvim günü: '2026-11-17' */
export function gunDamgasi(simdi: number): string {
  const d = new Date(simdi);
  const iki = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${iki(d.getMonth() + 1)}-${iki(d.getDate())}`;
}

/** Hata sayısından yıldız: neredeyse hatasız 3, birkaç hata 2, gerisi 1. Dersi bitiren her çocuk en az bir yıldız alır. */
export function yildizHesapla(hata: number, soruSayisi: number): 1 | 2 | 3 {
  const oran = hata / Math.max(1, soruSayisi);
  return oran <= 0.13 ? 3 : oran <= 0.36 ? 2 : 1;
}

/**
 * Bir geri çağırma sorusunun sonucu. İlk denemede bildiyse ve kelimenin vadesi gelmişse üst kutuya çıkar; vadesi
 * gelmeden (aynı derste, aynı gün içinde) art arda bilmek kutuyu yükseltmez: kelime bir derste beş kez bilindi diye
 * sekiz gün sonraya atılmaz. Bilemediyse her zaman bir alt kutuya iner ve yeniden sık sorulur.
 */
export function cevapIsle(k: Kayit, kelimeId: string, ilkDenemedeDogru: boolean, simdi: number): Kayit {
  if (!kelimeBul(kelimeId)) return k;
  const eski = k.kelimeler[kelimeId] ?? { kutu: 1, son: 0, dogru: 0, yanlis: 0 };
  const vadeli = vade(eski) <= simdi;
  const yeni: KelimeDurumu = ilkDenemedeDogru
    ? { ...eski, kutu: vadeli ? Math.min(EN_UST_KUTU, eski.kutu + 1) : eski.kutu, dogru: eski.dogru + 1, son: vadeli ? simdi : eski.son }
    : { ...eski, kutu: Math.max(1, eski.kutu - 1), yanlis: eski.yanlis + 1, son: simdi };
  return { ...k, kelimeler: { ...k.kelimeler, [kelimeId]: yeni } };
}

const gunEkle = (gunler: readonly string[], simdi: number): string[] => [...new Set([...gunler, gunDamgasi(simdi)])].sort().slice(-60);
const gunOnce = (simdi: number, kac: number): string => { const d = new Date(simdi); return gunDamgasi(new Date(d.getFullYear(), d.getMonth(), d.getDate() - kac, 12).getTime()); };

/**
 * Art arda çalışılan gün sayısı. Bugün henüz çalışılmadıysa dünden geriye sayılır (gün içinde seri "bozulmuş" görünmez);
 * bir gün atlanınca sessizce sıfırdan başlar: kaçırılan gün için uyarı ya da ceza yoktur.
 */
export function seri(k: Kayit, simdi: number): number {
  const var_ = new Set(k.gunler);
  let n = 0;
  for (let i = var_.has(gunOnce(simdi, 0)) ? 0 : 1; var_.has(gunOnce(simdi, i)); i++) n++;
  return n;
}

/** Bu haftanın (Pazartesi–Pazar) yedi günü: çalışıldı mı; `bugun` haftanın kaçıncı günü (0 = Pazartesi) */
export function haftaDurumu(k: Kayit, simdi: number): { gunler: boolean[]; bugun: number } {
  const bugun = (new Date(simdi).getDay() + 6) % 7;
  const var_ = new Set(k.gunler);
  return { gunler: Array.from({ length: 7 }, (_, i) => var_.has(gunOnce(simdi, bugun - i))), bugun };
}

/** Ders bitti: yıldız (daha yükseği korunur), yeni kelimelerin çıkartmaları albüme girer */
export function dersBitir(k: Kayit, dersId: string, yildiz: number, kelimeIdleri: string[], simdi: number): Kayit {
  const kelimeler = { ...k.kelimeler };
  for (const id of kelimeIdleri) if (kelimeBul(id) && !kelimeler[id]) kelimeler[id] = { kutu: 1, son: simdi, dogru: 0, yanlis: 0 };
  const yeniCikartma = kelimeIdleri.filter((id) => kelimeBul(id) && !k.cikartmalar.includes(id));
  return {
    ...k,
    dersler: { ...k.dersler, [dersId]: Math.max(k.dersler[dersId] ?? 0, sayi(yildiz, 1, 3, 1)) },
    kelimeler,
    cikartmalar: [...k.cikartmalar, ...yeniCikartma],
    gunler: gunEkle(k.gunler, simdi),
  };
}

/** Albümdeki (öğrenilmiş) kelimeler */
export const ogrenilenler = (k: Kayit): string[] => k.cikartmalar;
export const toplamYildiz = (k: Kayit): number => Object.values(k.dersler).reduce((a, b) => a + b, 0);
export const dersBittiMi = (k: Kayit, dersId: string): boolean => (k.dersler[dersId] ?? 0) > 0;

/**
 * Sıradaki ders: önerilen yol sırasında (icerik.ts → TUM_DERSLER), `acik` süzgecinden geçen (çizimi ve sesi hazır),
 * bitmemiş ve aynı adada kendinden önceki dersleri bitmiş ilk ders; hepsi bittiyse null.
 */
export function siradakiDers(k: Kayit, acik: (d: Ders) => boolean = () => true): Ders | null {
  const oncekilerBitti = (d: Ders) => TUM_DERSLER.every((x) => x.unite !== d.unite || x.no >= d.no || dersBittiMi(k, x.id));
  return TUM_DERSLER.find((d) => acik(d) && !dersBittiMi(k, d.id) && oncekilerBitti(d)) ?? null;
}

/** Yeniden sorulma zamanı gelmiş öğrenilmiş kelimeler: önce alt kutudakiler, sonra en eski sorulanlar */
export function vadesiGelenler(k: Kayit, simdi: number): string[] {
  return k.cikartmalar
    .filter((id) => k.kelimeler[id] && vade(k.kelimeler[id]) <= simdi)
    .sort((a, b) => k.kelimeler[a].kutu - k.kelimeler[b].kutu || k.kelimeler[a].son - k.kelimeler[b].son);
}

/**
 * Tekrar için kelime seçimi: önce vadesi gelenler, yetmezse en uzun süredir sorulmayanlar.
 * `haric`: bu derste zaten çalışılacak kelimeler (ısınmada sorulmaz).
 */
export function tekrarSec(k: Kayit, simdi: number, adet: number, haric: readonly string[] = []): string[] {
  const disarida = new Set(haric);
  const vadeli = vadesiGelenler(k, simdi).filter((id) => !disarida.has(id));
  if (vadeli.length >= adet) return vadeli.slice(0, adet);
  const kalan = k.cikartmalar
    .filter((id) => !disarida.has(id) && !vadeli.includes(id) && k.kelimeler[id])
    .sort((a, b) => k.kelimeler[a].son - k.kelimeler[b].son);
  return [...vadeli, ...kalan].slice(0, adet);
}

/** Günün Tekrarı bitti: bugün kaç kez yapıldığı tutulur (ilk kez ise ödül verilir) */
export function tekrarBitir(k: Kayit, simdi: number): Kayit {
  const gun = gunDamgasi(simdi);
  return { ...k, tekrar: { gun, adet: k.tekrar.gun === gun ? k.tekrar.adet + 1 : 1 }, gunler: gunEkle(k.gunler, simdi) };
}
export const bugunTekrarEdildi = (k: Kayit, simdi: number): boolean => k.tekrar.gun === gunDamgasi(simdi) && k.tekrar.adet > 0;

/** Veli köşesi için kelimenin durumu */
export function kelimeDuzeyi(d: KelimeDurumu | undefined): 'yeni' | 'ogreniyor' | 'ogrendi' {
  if (!d) return 'yeni';
  return d.kutu >= 4 ? 'ogrendi' : 'ogreniyor';
}

// ---------------------------------------------------------------- depolama

let bellek: string | null = null;
let bellekte = false;

/** Kayıt okunur; depolama kapalıysa (gizli sekme) oturum boyunca bellekte tutulur */
export function oku(): Kayit {
  if (bellekte) return kayitCoz(bellek);
  try { return kayitCoz(localStorage.getItem(ANAHTAR)); } catch { return kayitCoz(bellek); }
}

export function yaz(k: Kayit): void {
  const ham = JSON.stringify(k);
  try { localStorage.setItem(ANAHTAR, ham); bellekte = false; } catch { bellek = ham; bellekte = true; }
}
