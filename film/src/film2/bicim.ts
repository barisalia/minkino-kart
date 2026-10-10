/**
 * Kino ve Ailesi (Seri 2) bölüm dosyası biçimi: content/film2/seri.json (dizinin açılışı, jeneriği, mekânlar, kitler)
 * ve content/film2/bolum-NN.json (sahneler). Animatör dosyayı elle düzeltir; bu modül biçimi tanımlar, denetler
 * (dogrula) ve zaman çizelgesini çözer (zamanla). DOM yok: birim testleri ve düğüm betikleri de kullanır.
 *
 * ZAMAN: sahnenin içindeki saniye. Sayı (12.5) ya da bir çapa:
 *   "b01-s4-anne-02"            → o replik başlarken
 *   "b01-s4-anne-02:son"        → o replik biterken
 *   "b01-s4-anne-02:son + 0.4"  → bittikten 0,4 sn sonra (işaretli sayı; boşluk isteğe bağlı)
 *   "anne-girer - 1"            → sahnenin `isaretler` tablosundaki bir isimden 1 sn önce
 * Replikler çapaya bağlanınca gerçek ses gelip süre değişse de hareketler sesle birlikte kayar.
 */
import { sozSuresi } from '../oyunlu/aktor';

export type Zaman = number | string;
export const KISILER = ['anlatici', 'kino', 'anne', 'baba', 'lokum', 'babaanne', 'dede', 'mino'] as const;

export interface IfadeAyar {
  gozler?: string;
  kaslar?: string;
  agiz?: string;
}
export interface Replik {
  /** ses dosyasının adı: ekip/ses/seri2-gelen/<kimlik>.mp3 */
  kimlik: string;
  kim: string;
  /** altyazı metni (etiketsiz) */
  metin: string;
  /** seslendirme metni: ElevenLabs ses etiketleriyle ([whispers] …); yoksa metin okunur */
  etiket?: string;
  /** başlangıç; yoksa bir önceki replik bitince + ara */
  t?: Zaman;
  /** önceki replikten sonra bekleme (sn, varsayılan 0.5) */
  ara?: number;
  /** replik boyunca yüz (ağız konuşmaya bırakılır) */
  ifade?: IfadeAyar;
  not?: string;
}
export interface Olay {
  t: Zaman;
  kim: string;
  yap: string;
  not?: string;
  [alan: string]: unknown;
}
export interface KameraNokta {
  t: Zaman;
  /** görüş merkezi (dünya = arka planın pikseli); odak verilirse o oyuncunun göğsü */
  x?: number;
  y?: number;
  odak?: string;
  /** görünen genişlik (dünya birimi): küçük = yakın */
  g: number;
  /** bu noktaya varış süresi (sn, varsayılan 2) */
  gecis?: number;
  not?: string;
}
export interface MuzikIsaret {
  t: Zaman;
  /** assets/muzik/<ad>.mp3; null: müzik söner */
  ad: string | null;
  /** düzey 0..1 (varsayılan 0.35) */
  ses?: number;
  /** giriş ve çıkış (sn) */
  gir?: number;
  cik?: number;
  /** döngü (varsayılan true) */
  dongu?: boolean;
}
export interface EfektIsaret {
  t: Zaman;
  ad: string;
  ses?: number;
}
export interface Pencere {
  /** oyuncu yalnız bu dikdörtgende görünür (dünya: x, y, en, boy) */
  kirp: [number, number, number, number];
  /** arka planın bu parçası oyuncunun önüne yeniden basılır (balkon korkuluğu) */
  on?: [number, number, number, number];
}
export interface Oyuncu {
  /** seri.json → kitler anahtarı (kino, anne, …) */
  kit: string;
  /** ayakların ortası (dünya; kişi dönmüşken bile dönmemiş hâlindeki ayak noktası) */
  x: number;
  y: number;
  /** çizim sırası (büyük önde; varsayılan 10) */
  z?: number;
  /** ölçek (dünya / kit birimi; varsayılan mekânın ölçeği) */
  o?: number;
  gorunur?: boolean;
  /** derece (+ saat yönü; dönme merkezi kalça) */
  don?: number;
  /** yalnız bu parçalar çizilir (ör. ["kuyruk"]) */
  yalniz?: string[];
  haric?: string[];
  pencere?: Pencere;
  /** kostüm (kitin alt klasörü: "pijama") */
  kostum?: string;
  /** bu oyuncunun kucağında (kucak.ts: Anne Lokum'u taşır) */
  kucakta?: string;
}
export interface Bag {
  hedef: string;
  parca: string;
  /** parçanın kit karesindeki nokta (varsayılan dönme noktası) */
  nokta?: [number, number];
}
export interface Esya {
  /** resim: mekân klasöründen görsel; battaniye: resmin tümsekli hâli; albüm, blok: kodla yer tutucu */
  tur: 'resim' | 'battaniye' | 'albüm' | 'blok';
  resim?: string;
  x: number;
  y: number;
  z?: number;
  olcek?: number;
  don?: number;
  renk?: string;
  gorunur?: boolean;
  bagli?: Bag;
  /** ayarlanabilir sayılar (tumsek, ac, sayfa …) başlangıç değerleri */
  deger?: Record<string, number>;
  /** konuşunca kıpırdar (battaniyenin altındaki Kino) */
  canli?: string;
}
export interface Ek {
  /** tam ekran yakın plan (ekleme çekim): albüm sayfası */
  t: Zaman;
  son: Zaman;
  tur: 'albüm';
  sayfa: number;
  /** yumuşak geçiş (sn; kesme yok) */
  gecis?: number;
  /** yavaş yaklaşma: başlangıç ve bitiş büyütmesi */
  yakin?: [number, number];
}
export interface Yazi {
  t: Zaman;
  son: Zaman;
  tur: 'logo' | 'baslik' | 'kart' | 'minkino' | 'jenerik';
  metin?: string;
  satirlar?: string[];
}
export interface Sahne {
  kimlik: string;
  ad: string;
  mekan: string;
  /** sn ya da çapa ("b01-s4-kino-11:son + 3") */
  sure: Zaman;
  /** kararma (sn): giriş ve çıkış */
  kararma?: { gir?: number; cik?: number };
  /** henüz sahnelenmedi (yalnız replikler ve kaba yerleşim) */
  taslak?: boolean;
  not?: string;
  /** arka planı bulanıklaştır (px; kapak) */
  arkaBulanik?: number;
  isaretler?: Record<string, Zaman>;
  oyuncular: Record<string, Oyuncu>;
  esyalar?: Record<string, Esya>;
  kamera: KameraNokta[];
  replikler: Replik[];
  olaylar?: Olay[];
  muzik?: MuzikIsaret[];
  efektler?: EfektIsaret[];
  ekler?: Ek[];
  yazilar?: Yazi[];
}
export interface MekanTanim {
  /** assets/film-seri2/<resim>.webp; düz renk zemin için renk */
  resim?: string;
  renk?: string;
  /** genişlik × yükseklik (düz zemin; resimde resmin boyu) */
  boyut?: [number, number];
  ust?: [number, number];
  alt?: [number, number];
  /** oyuncu ölçeği (dünya / kit birimi) */
  olcek: number;
  /** yerin y'si (bilgi) */
  zemin?: number;
  not?: string;
}
export interface Seri {
  $sema: 'film2-seri-1';
  dizi: string;
  /** karakter → kit json (assets/karakter/ altında) */
  kitler: Record<string, string>;
  mekanlar: Record<string, MekanTanim>;
  acilis: Sahne;
  kapanis: Sahne;
}
export interface Bolum {
  $sema: 'film2-bolum-1';
  kimlik: string;
  numara: number;
  baslik: string;
  /** seri açılışına bu bölümün eklediği (anlatıcının bölüm adı) */
  acilis?: { replikler?: Replik[]; yazilar?: Yazi[] };
  /** jeneriğe eklenen satırlar */
  kapanis?: { yazilar?: Yazi[] };
  kapak?: Sahne & { an?: number };
  sahneler: Sahne[];
}

// ---------------------------------------------------------------- olay sözlüğü
/** oyuncu olayları: zorunlu alanlar */
export const OYUNCU_OLAY: Record<string, string[]> = {
  yuru: ['x', 'sure'],
  kos: ['x', 'sure'],
  kay: ['sure'],
  yer: [],
  otur: [],
  kalk: [],
  don: ['aci'],
  ifade: [],
  bak: ['yon'],
  kulak: ['durum'],
  kuyruk: ['durum'],
  'el-salla': [],
  'el-uzat': [],
  zipla: [],
  saril: [],
  hickir: [],
  gul: [],
  egil: [],
  poz: ['alanlar'],
  goster: [],
  gizle: [],
  z: ['deger'],
};
export const ESYA_OLAY: Record<string, string[]> = {
  ayarla: ['alan', 'deger'],
  bagla: ['hedef', 'parca'],
  birak: [],
  dus: [],
  kay: ['sure'],
  goster: [],
  gizle: [],
  z: ['deger'],
};
export const KULAK = ['normal', 'kalk', 'in', 'yayil', 'sag-kalk', 'sol-kalk'];
export const KUYRUK = ['normal', 'dik', 'salla', 'dusuk'];
export const IFADE: Record<string, string[]> = {
  gozler: ['gozler-acik', 'gozler-yari', 'gozler-kapali', 'gozler-mutlu', 'gozler-sola', 'gozler-saga', 'gozler-saskin'],
  kaslar: ['kaslar-notr', 'kaslar-kalkik', 'kaslar-uzgun', 'kaslar-kizgin'],
  agiz: ['agiz-gulumse', 'agiz-az', 'agiz-orta', 'agiz-genis', 'agiz-o', 'agiz-e', 'agiz-kahkaha', 'agiz-uzgun'],
};

/** etiketleri ([whispers] …) atar, boşlukları sadeleştirir */
export const etiketsiz = (s: string) => s.replace(/\[[^\]]*\]/g, ' ').replace(/\s+/g, ' ').trim();

// ---------------------------------------------------------------- zaman çizelgesi
export interface CozulenReplik extends Replik {
  bas: number;
  son: number;
}
export interface Cizelge {
  replikler: CozulenReplik[];
  isaret: Record<string, number>;
  sure: number;
  coz: (z: Zaman) => number;
}
/** replik süresi: kayıt varsa onun süresi, yoksa metnin hece ritmi */
export type SureBul = (r: Replik) => number | undefined;
export const tahminiSure = (r: Replik) => sozSuresi(r.metin, r.kim === 'anlatici');

const OFSET = /^(.*?)\s*([+-])\s*(\d+(?:\.\d+)?)$/;
/**
 * Sahnenin zamanlarını çözer. Döngü (A B'ye, B A'ya bağlı) ya da bilinmeyen çapa hata fırlatır.
 */
export function zamanla(s: Sahne, sureBul: SureBul = () => undefined): Cizelge {
  const replik = new Map(s.replikler.map((r, i) => [r.kimlik, i]));
  const bas = new Map<number, number>();
  const isaret: Record<string, number> = {};
  const yolda = new Set<string>();
  const sure = (r: Replik) => sureBul(r) ?? tahminiSure(r);
  const repBas = (i: number): number => {
    const v = bas.get(i);
    if (v !== undefined) return v;
    const r = s.replikler[i];
    const anahtar = `r:${r.kimlik}`;
    if (yolda.has(anahtar)) throw new Error(`döngü: ${r.kimlik}`);
    yolda.add(anahtar);
    let t: number;
    if (r.t !== undefined) t = coz(r.t);
    else if (i === 0) t = r.ara ?? 1;
    else {
      const o = s.replikler[i - 1];
      t = repBas(i - 1) + sure(o) + (r.ara ?? 0.5);
    }
    yolda.delete(anahtar);
    bas.set(i, t);
    return t;
  };
  const ad = (a: string): number => {
    const son = a.endsWith(':son');
    const k = son ? a.slice(0, -4) : a;
    const i = replik.get(k);
    if (i !== undefined) return repBas(i) + (son ? sure(s.replikler[i]) : 0);
    if (!son && s.isaretler && k in s.isaretler) {
      if (k in isaret) return isaret[k];
      const anahtar = `i:${k}`;
      if (yolda.has(anahtar)) throw new Error(`döngü: ${k}`);
      yolda.add(anahtar);
      const v = coz(s.isaretler[k]);
      yolda.delete(anahtar);
      isaret[k] = v;
      return v;
    }
    throw new Error(`bilinmeyen çapa: ${a}`);
  };
  const coz = (z: Zaman): number => {
    if (typeof z === 'number') return z;
    const m = z.trim().match(OFSET);
    if (m) {
      // "kimlik-01" gibi tireli adlarla karışmasın: önce bütün metin bir ad mı?
      const butun = z.trim();
      if (!replik.has(butun.replace(/:son$/, '')) && !(s.isaretler && butun in s.isaretler)) {
        const d = Number(m[3]) * (m[2] === '-' ? -1 : 1);
        return ad(m[1].trim()) + d;
      }
    }
    return ad(z.trim());
  };
  const replikler = s.replikler.map((r, i) => {
    const b = repBas(i);
    return { ...r, bas: b, son: b + sure(r) };
  });
  for (const k of Object.keys(s.isaretler ?? {})) ad(k);
  let toplam: number;
  if (typeof s.sure === 'number') toplam = s.sure;
  else toplam = coz(s.sure);
  return { replikler, isaret, sure: toplam, coz };
}

// ---------------------------------------------------------------- denetim
/** Bölüm ve seri dosyasını denetler; dönüş: hata listesi (boş: geçerli) */
export function dogrula(seri: Seri, bolum?: Bolum, muzikler?: string[]): string[] {
  const h: string[] = [];
  if (seri.$sema !== 'film2-seri-1') h.push('seri: $sema film2-seri-1 olmalı');
  const kimlikler = new Map<string, string>();
  const sahneDenetle = (s: Sahne, yer: string) => {
    const y = `${yer}/${s.kimlik}`;
    if (!/^[a-z0-9-]+$/.test(s.kimlik ?? '')) h.push(`${y}: kimlik küçük harf, rakam ve tire olmalı`);
    if (!seri.mekanlar[s.mekan]) h.push(`${y}: bilinmeyen mekân ${s.mekan}`);
    for (const [ad, o] of Object.entries(s.oyuncular ?? {})) {
      if (!seri.kitler[o.kit]) h.push(`${y}: ${ad} bilinmeyen kit ${o.kit}`);
      if (typeof o.x !== 'number' || typeof o.y !== 'number') h.push(`${y}: ${ad} x/y sayı olmalı`);
      if (o.kucakta && !s.oyuncular[o.kucakta]) h.push(`${y}: ${ad} kucakta: bilinmeyen ${o.kucakta}`);
    }
    for (const [ad, e] of Object.entries(s.esyalar ?? {})) {
      if (s.oyuncular[ad]) h.push(`${y}: ${ad} hem oyuncu hem eşya`);
      if (!['resim', 'battaniye', 'albüm', 'blok'].includes(e.tur)) h.push(`${y}: ${ad} bilinmeyen eşya türü ${e.tur}`);
      if ((e.tur === 'resim' || e.tur === 'battaniye') && !e.resim) h.push(`${y}: ${ad} resim gerekli`);
      if (e.bagli && !s.oyuncular[e.bagli.hedef]) h.push(`${y}: ${ad} bilinmeyen bağ ${e.bagli.hedef}`);
    }
    for (const r of s.replikler ?? []) {
      if (!/^[a-z0-9-]+$/.test(r.kimlik)) h.push(`${y}: replik kimliği ${r.kimlik} (küçük harf, rakam, tire)`);
      const onceki = kimlikler.get(r.kimlik);
      if (onceki) h.push(`${y}: replik kimliği iki kez: ${r.kimlik} (${onceki})`);
      kimlikler.set(r.kimlik, y);
      if (!(KISILER as readonly string[]).includes(r.kim)) h.push(`${y}: ${r.kimlik} bilinmeyen konuşan ${r.kim}`);
      if (r.kim !== 'anlatici' && !s.oyuncular[r.kim]) h.push(`${y}: ${r.kimlik} konuşan ${r.kim} sahnede yok`);
      if (!r.metin?.trim()) h.push(`${y}: ${r.kimlik} metin boş`);
      if (/\[/.test(r.metin)) h.push(`${y}: ${r.kimlik} metinde etiket var (etiket alanına yazılır)`);
      if (r.etiket && etiketsiz(r.etiket) !== r.metin.trim()) h.push(`${y}: ${r.kimlik} etiketli metin altyazıyla aynı değil: "${etiketsiz(r.etiket)}" ≠ "${r.metin}"`);
      for (const [k, v] of Object.entries(r.ifade ?? {})) if (!IFADE[k]?.includes(v as string)) h.push(`${y}: ${r.kimlik} ifade ${k}=${v}`);
    }
    let c: Cizelge | null = null;
    try {
      c = zamanla(s);
    } catch (e) {
      h.push(`${y}: ${(e as Error).message}`);
    }
    const zaman = (z: Zaman, ne: string) => {
      if (!c) return;
      try {
        const v = c.coz(z);
        if (!Number.isFinite(v) || v < 0) h.push(`${y}: ${ne} zamanı geçersiz (${z} → ${v})`);
        else if (v > c.sure + 0.01) h.push(`${y}: ${ne} sahne bittikten sonra (${z} → ${v.toFixed(1)} > ${c.sure.toFixed(1)})`);
      } catch (e) {
        h.push(`${y}: ${ne}: ${(e as Error).message}`);
      }
    };
    if (c) {
      if (!(c.sure > 0)) h.push(`${y}: süre geçersiz`);
      for (const r of c.replikler) if (r.son > c.sure + 0.01) h.push(`${y}: ${r.kimlik} sahne bittikten sonra bitiyor (${r.son.toFixed(1)} > ${c.sure.toFixed(1)})`);
    }
    if (!s.kamera?.length) h.push(`${y}: kamera en az bir nokta`);
    for (const k of s.kamera ?? []) {
      zaman(k.t, 'kamera');
      if (!(k.g > 0)) h.push(`${y}: kamera g > 0 olmalı`);
      if (k.odak ? !s.oyuncular[k.odak] : typeof k.x !== 'number' || typeof k.y !== 'number') h.push(`${y}: kamera x/y ya da odak gerekli`);
    }
    for (const o of s.olaylar ?? []) {
      const ne = `${o.kim}.${o.yap}`;
      zaman(o.t, ne);
      const sozluk = s.oyuncular[o.kim] ? OYUNCU_OLAY : s.esyalar?.[o.kim] ? ESYA_OLAY : null;
      if (!sozluk) {
        h.push(`${y}: ${ne} bilinmeyen oyuncu/eşya ${o.kim}`);
        continue;
      }
      const zorunlu = sozluk[o.yap];
      if (!zorunlu) {
        h.push(`${y}: ${ne} bilinmeyen komut (izinli: ${Object.keys(sozluk).join(', ')})`);
        continue;
      }
      for (const a of zorunlu) if (o[a] === undefined) h.push(`${y}: ${ne} alanı eksik: ${a}`);
      if (o.yap === 'kulak' && !KULAK.includes(o.durum as string)) h.push(`${y}: ${ne} durum ${KULAK.join('|')}`);
      if (o.yap === 'kuyruk' && !KUYRUK.includes(o.durum as string)) h.push(`${y}: ${ne} durum ${KUYRUK.join('|')}`);
      if (o.yap === 'ifade') for (const k of ['gozler', 'kaslar', 'agiz']) if (o[k] !== undefined && !IFADE[k].includes(o[k] as string)) h.push(`${y}: ${ne} ${k}=${o[k]}`);
      if (o.yap === 'bagla' && !s.oyuncular[o.hedef as string]) h.push(`${y}: ${ne} bilinmeyen hedef ${o.hedef}`);
      if (o.yap === 'bak' && !['sol', 'sag', 'on', 'yukari', 'asagi', 'otomatik'].includes(o.yon as string) && !s.oyuncular[o.yon as string]) h.push(`${y}: ${ne} yön sol|sag|on|yukari|asagi|otomatik ya da bir oyuncu`);
    }
    for (const m of s.muzik ?? []) {
      zaman(m.t, `müzik ${m.ad}`);
      if (m.ad && muzikler && !muzikler.includes(m.ad)) h.push(`${y}: müzik dosyası yok: assets/muzik/${m.ad}.mp3`);
    }
    for (const e of s.efektler ?? []) zaman(e.t, `efekt ${e.ad}`);
    for (const e of s.ekler ?? []) {
      zaman(e.t, 'ek');
      zaman(e.son, 'ek sonu');
    }
    for (const e of s.yazilar ?? []) {
      zaman(e.t, `yazı ${e.tur}`);
      zaman(e.son, `yazı ${e.tur} sonu`);
    }
  };
  if (seri.acilis) sahneDenetle(bolum ? acilisSahnesi(seri, bolum) : seri.acilis, 'seri');
  else h.push('seri: açılış yok');
  if (seri.kapanis) sahneDenetle(bolum ? kapanisSahnesi(seri, bolum) : seri.kapanis, 'seri');
  else h.push('seri: jenerik yok');
  if (bolum) {
    if (bolum.$sema !== 'film2-bolum-1') h.push(`${bolum.kimlik}: $sema film2-bolum-1 olmalı`);
    if (!bolum.sahneler?.length) h.push(`${bolum.kimlik}: sahne yok`);
    for (const s of bolum.sahneler ?? []) sahneDenetle(s, bolum.kimlik);
    if (bolum.kapak) sahneDenetle(bolum.kapak, `${bolum.kimlik}/kapak`);
  }
  return h;
}

/** bölümün açılışı: serinin açılışı + bölümün eklediği replikler ve yazılar */
export function acilisSahnesi(seri: Seri, b: Bolum): Sahne {
  const a = seri.acilis;
  return { ...a, replikler: [...a.replikler, ...(b.acilis?.replikler ?? [])], yazilar: [...(a.yazilar ?? []), ...(b.acilis?.yazilar ?? [])] };
}
export function kapanisSahnesi(seri: Seri, b: Bolum): Sahne {
  const k = seri.kapanis;
  return { ...k, yazilar: [...(k.yazilar ?? []), ...(b.kapanis?.yazilar ?? [])] };
}
/** bölümün baştan sona parçaları: açılış, sahneler, jenerik */
export function bolumParcalari(seri: Seri, b: Bolum): Sahne[] {
  return [acilisSahnesi(seri, b), ...b.sahneler, kapanisSahnesi(seri, b)];
}
/** bölümün (açılış dahil) bütün replikleri, sırayla */
export function tumReplikler(seri: Seri, b: Bolum): (Replik & { sahne: string })[] {
  return bolumParcalari(seri, b).flatMap((s) => s.replikler.map((r) => ({ ...r, sahne: s.kimlik })));
}

// ---------------------------------------------------------------- altyazı (.srt)
const sa = (t: number) => {
  const ms = Math.max(0, Math.round(t * 1000));
  const p = (n: number, k = 2) => String(n).padStart(k, '0');
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
/** uzun satırı ikiye böler (YouTube: satır başına ~42 harf) */
export function satirla(metin: string, en = 42): string {
  if (metin.length <= en) return metin;
  const k = metin.split(' ');
  let enIyi = metin, fark = Infinity;
  for (let i = 1; i < k.length; i++) {
    const a = k.slice(0, i).join(' '), b = k.slice(i).join(' ');
    // dengeli iki satır; cümle sonunda bölmek daha iyi
    const f = Math.abs(a.length - b.length) - (/[.,!?…:]$/.test(a) ? 14 : 0) + (Math.max(a.length, b.length) > en ? 100 : 0);
    if (f < fark) {
      fark = f;
      enIyi = `${a}\n${b}`;
    }
  }
  return enIyi;
}
/** altyazı satırları (bölüm saati) → .srt metni. Çakışan satırlar bir öncekinin bitişini kısaltır. */
export function srtYaz(satirlar: { bas: number; son: number; metin: string }[]): string {
  const s = [...satirlar].sort((a, b) => a.bas - b.bas);
  return s
    .map((x, i) => {
      const sonraki = s[i + 1];
      // okumaya zaman: en az 1 sn görünür, sonraki başlayınca kalkar
      const son = Math.min(Math.max(x.son + 0.3, x.bas + 1), sonraki ? sonraki.bas - 0.05 : Infinity);
      return `${i + 1}\n${sa(x.bas)} --> ${sa(Math.max(son, x.bas + 0.3))}\n${satirla(x.metin)}\n`;
    })
    .join('\n');
}
