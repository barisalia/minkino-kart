/**
 * Mino'nun Pazarı: müşteri isteklerini üretir ve sepeti denetler (DOM yok; birim testleri bunu kullanır).
 * Ürün adları kart kataloğundan (content/kartlar.json), cümle kalıpları content/pazar.json'dan.
 */
import P from '../../content/pazar.json';
import { buyukHarfBas, sayiAdi } from '../../src/audio/metin';
import { kart } from '../../src/engine/katalog';
import type { Yas } from '../../src/engine/types';
import { meyveSuyuCumleleri } from './meyvesuyu';

export type Rnd = () => number;
export type Tur = 'tek' | 'renk' | 'sayi' | 'iki' | 'ayir' | 'toplama' | 'ode' | 'terazi';
export type Grup = 'meyve' | 'sebze';

export const MUSTERI_SAYISI = 5;
/** Bozuk paralar tezgâhta ürün gibi durur: 'para-1', 'para-5' */
export const PARA = { 'para-1': 1, 'para-5': 5 } as const;
export const paraMi = (id: string): id is keyof typeof PARA => id in PARA;

/**
 * Yaşa göre 5 müşterinin istek türleri: 3 yaş tek ürün, 4 renk + sayma, 5 iki ürün + ayırma + terazi,
 * 6 toplama + para + terazi (ortadaki müşteri teraziyle gelir).
 */
export const PLAN: Record<Yas, Tur[]> = {
  3: ['tek', 'tek', 'tek', 'tek', 'tek'],
  4: ['sayi', 'renk', 'sayi', 'renk', 'sayi'],
  5: ['iki', 'ayir', 'terazi', 'ayir', 'iki'],
  6: ['toplama', 'ode', 'terazi', 'ode', 'toplama'],
};

/**
 * Terazi ağırlıkları (birim). Küçük meyve/sebze 1; ananas 2, karpuz 3. Çocuk sayıyı değil dengeyi arar:
 * 6 yaşta bir karpuzu üç küçük meyve dengeler.
 */
export const AGIRLIK: Record<string, number> = { ananas: 2, karpuz: 3 };
export const agirlik = (id: string) => AGIRLIK[id] ?? 1;
/** Terazide kullanılan küçük (1 birim) ürünler */
const HAFIF = ['elma', 'portakal', 'domates', 'havuc', 'limon', 'armut'];

export interface Istek {
  tur: Tur;
  /** sepete konması gereken ürünler → adet (renk: renkteki ürün; ayir: gruptakiler; ode: boş) */
  istenen: Record<string, number>;
  renk?: string;
  grup?: Grup;
  /** toplama: müşterinin sepetinde zaten olan adet */
  bende?: number;
  /** ode: kasaya konacak lira */
  lira?: number;
  /** tezgâhtaki ürünler (aynı üründen birden çok olabilir), karışık sırada */
  tezgah: string[];
  /** sırayla söylenecek parçalar */
  soz: string[];
  /** balonda yazan */
  yazi: string;
  /** "Ver" düğmesiyle mi bitiyor (sayma işleri), yoksa doğru ürün konunca kendiliğinden mi */
  dugmeli: boolean;
  /** terazi: müşterinin kefesindeki ürünler (toplam ağırlığı dengelenmeli) */
  sol?: string[];
}

export type Sonuc = 'tamam' | 'az' | 'fazla';

const URUN = P.urunler;
const RENKLER = P.renkler as Record<string, string[]>;
const I = P.istek;

export const urunAdi = (id: string) => (kart(id)?.ad ?? id).toLocaleLowerCase('tr');
export const urunGrubu = (id: string): Grup | undefined => kart(id)?.grup as Grup | undefined;
export const urunRengi = (id: string): string | undefined => kart(id)?.renk;

/** Kalıptaki {urun} {sayi} {Sayi} {Renk} yerlerini doldurur. */
export function doldur(kalip: string, d: { urun?: string; sayi?: number; renk?: string }): string {
  let s = kalip;
  if (d.urun !== undefined) s = s.replaceAll('{urun}', urunAdi(d.urun));
  if (d.sayi !== undefined) s = s.replaceAll('{Sayi}', buyukHarfBas(sayiAdi(d.sayi))).replaceAll('{sayi}', sayiAdi(d.sayi));
  if (d.renk !== undefined) s = s.replaceAll('{Renk}', buyukHarfBas(d.renk));
  return s;
}

const sec = <T>(a: readonly T[], rnd: Rnd): T => a[Math.floor(rnd() * a.length)];
const arasi = (en: number, son: number, rnd: Rnd) => en + Math.floor(rnd() * (son - en + 1));
function karistir<T>(a: T[], rnd: Rnd): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}
/** havuzdan, haric dışında, birbirinden farklı n tane */
function farkli(havuz: readonly string[], n: number, rnd: Rnd, haric: string[] = []): string[] {
  return karistir(havuz.filter((x) => !haric.includes(x)), rnd).slice(0, n);
}
const tekrarla = (id: string, n: number) => Array.from({ length: n }, () => id);
/** İkinci cümle parçası küçük harfle başlasın (yazıda) */
const kucukBas = (s: string) => s.charAt(0).toLocaleLowerCase('tr') + s.slice(1);

/** zorla: test ve gösterim için belli bir istek türü */
export function istekUret(yas: Yas, sira: number, rnd: Rnd = Math.random, zorla?: Tur): Istek {
  const tur = zorla ?? PLAN[yas][sira % MUSTERI_SAYISI];
  const tum = [...new Set([...URUN.meyve, ...URUN.sebze])];
  switch (tur) {
    case 'tek': {
      const u = sec(URUN.say, rnd);
      const s = doldur(I.tek, { urun: u });
      return { tur, istenen: { [u]: 1 }, tezgah: karistir([u, ...farkli(tum, 2, rnd, [u])], rnd), soz: [s], yazi: s, dugmeli: false };
    }
    case 'renk': {
      const renk = sec(Object.keys(RENKLER), rnd);
      const u = sec(RENKLER[renk], rnd);
      // çeldiriciler: renkleri hem istenenden hem birbirinden farklı
      const digerRenk = farkli(Object.keys(RENKLER), 2, rnd, [renk]);
      const celdirici = digerRenk.map((r) => sec(RENKLER[r], rnd));
      const s = doldur(I.renk, { renk });
      return { tur, istenen: { [u]: 1 }, renk, tezgah: karistir([u, ...celdirici], rnd), soz: [s], yazi: s, dugmeli: false };
    }
    case 'sayi': {
      const u = sec(URUN.say, rnd);
      const n = arasi(1, 5, rnd);
      const s = doldur(I.sayi, { urun: u, sayi: n });
      const tezgah = [...tekrarla(u, Math.min(n + 2, 7)), ...farkli(tum, 2, rnd, [u])];
      return { tur, istenen: { [u]: n }, tezgah: karistir(tezgah, rnd), soz: [s], yazi: s, dugmeli: true };
    }
    case 'iki': {
      const [a, b] = farkli(URUN.say, 2, rnd);
      const na = arasi(1, 3, rnd);
      const nb = arasi(1, 2, rnd);
      const s1 = doldur(I.iki, { urun: a, sayi: na });
      const s2 = doldur(I.sayi, { urun: b, sayi: nb });
      const tezgah = [...tekrarla(a, na + 1), ...tekrarla(b, nb + 1), ...farkli(tum, 1, rnd, [a, b])];
      return { tur, istenen: { [a]: na, [b]: nb }, tezgah: karistir(tezgah, rnd), soz: [s1, s2], yazi: `${s1} ${kucukBas(s2)}`, dugmeli: true };
    }
    case 'ayir': {
      const grup: Grup = rnd() < 0.5 ? 'meyve' : 'sebze';
      const istenen = farkli(URUN[grup], 3, rnd);
      const diger = farkli(URUN[grup === 'meyve' ? 'sebze' : 'meyve'], 3, rnd);
      const s = I[grup];
      return { tur, istenen: Object.fromEntries(istenen.map((u) => [u, 1])), grup, tezgah: karistir([...istenen, ...diger], rnd), soz: [s], yazi: s, dugmeli: false };
    }
    case 'toplama': {
      const u = sec(URUN.say, rnd);
      const bende = arasi(1, 3, rnd);
      const daha = arasi(1, Math.min(3, 5 - bende), rnd);
      const s1 = doldur(I.bende, { urun: u, sayi: bende });
      const s2 = doldur(I.daha, { sayi: daha });
      const tezgah = [...tekrarla(u, daha + 2), ...farkli(tum, 1, rnd, [u])];
      return { tur, istenen: { [u]: daha }, bende, tezgah: karistir(tezgah, rnd), soz: [s1, s2], yazi: `${s1} ${s2}`, dugmeli: true };
    }
    case 'terazi': {
      const s = I.terazi;
      if (yas <= 5) {
        // 5 yaş: kefede 2-4 aynı küçük meyve; hepsi aynı ağırlıkta, eşit sayıda koymak dengeler
        const u = sec(HAFIF, rnd);
        const n = arasi(2, 4, rnd);
        const tezgah = [...tekrarla(u, n + 1), ...farkli(HAFIF, 2, rnd, [u])];
        return { tur, istenen: {}, sol: tekrarla(u, n), tezgah: karistir(tezgah, rnd), soz: [s], yazi: s, dugmeli: false };
      }
      // 6 yaş: kefede ağır bir meyve (ananas 2 / karpuz 3), bazen yanında bir küçük; çocuk küçüklerle ya da bir ananasla dengeler
      const agir = sec(['ananas', 'karpuz'], rnd);
      const sol = rnd() < 0.5 ? [agir] : [agir, sec(HAFIF, rnd)];
      const tezgah = [...farkli(HAFIF, 5, rnd), 'ananas'];
      return { tur, istenen: {}, sol, tezgah: karistir(tezgah, rnd), soz: [s], yazi: s, dugmeli: false };
    }
    case 'ode': {
      const lira = arasi(2, 9, rnd);
      const s = doldur(I.ode, { sayi: lira });
      // 5 tane 1 lira + 2 tane 5 lira: 2..9 arası her tutar yapılabilir
      return { tur, istenen: {}, lira, tezgah: [...tekrarla('para-5', 2), ...tekrarla('para-1', 5)], soz: [s], yazi: s, dugmeli: true };
    }
  }
}

/** Bu ürün bu müşteriye uyar mı? Uymazsa tezgâha geri döner (sepete hiç girmez). */
export function uygunMu(ist: Istek, id: string): boolean {
  switch (ist.tur) {
    case 'renk':
      return urunRengi(id) === ist.renk;
    case 'ayir':
      return urunGrubu(id) === ist.grup;
    case 'ode':
      return paraMi(id);
    case 'terazi':
      return !paraMi(id);
    default:
      return id in ist.istenen;
  }
}

/** Sepetteki (çocuğun koyduğu) ürünlere göre sonuç. */
export function denetle(ist: Istek, sepet: string[]): Sonuc {
  if (ist.tur === 'ode') {
    const t = sepet.reduce((a, id) => a + (paraMi(id) ? PARA[id] : 0), 0);
    return t === ist.lira ? 'tamam' : t < (ist.lira ?? 0) ? 'az' : 'fazla';
  }
  if (ist.tur === 'terazi') {
    const hedef = (ist.sol ?? []).reduce((a, id) => a + agirlik(id), 0);
    const t = sepet.reduce((a, id) => a + agirlik(id), 0);
    return t === hedef ? 'tamam' : t < hedef ? 'az' : 'fazla';
  }
  if (ist.tur === 'renk') return sepet.some((id) => urunRengi(id) === ist.renk) ? 'tamam' : 'az';
  const say = (id: string) => sepet.filter((x) => x === id).length;
  const istenen = Object.entries(ist.istenen);
  if (istenen.some(([id, n]) => say(id) > n)) return 'fazla';
  if (istenen.some(([id, n]) => say(id) < n)) return 'az';
  return 'tamam';
}

/** Oyunun söyleyebileceği bütün pazar cümleleri (seslendirme listesi, src/audio/cumleler.ts). */
export function pazarCumleleri(): string[] {
  const c: string[] = [];
  for (const u of URUN.say) {
    c.push(doldur(I.tek, { urun: u }));
    for (let n = 1; n <= 5; n++) c.push(doldur(I.sayi, { urun: u, sayi: n }));
    for (let n = 1; n <= 3; n++) c.push(doldur(I.iki, { urun: u, sayi: n }), doldur(I.bende, { urun: u, sayi: n }));
  }
  for (const renk of Object.keys(RENKLER)) c.push(doldur(I.renk, { renk }));
  for (let n = 1; n <= 3; n++) c.push(doldur(I.daha, { sayi: n }));
  for (let n = 2; n <= 9; n++) c.push(doldur(I.ode, { sayi: n }));
  c.push(I.meyve, I.sebze, I.terazi);
  c.push(P.hosgeldin, P.basla, ...P.dogru, ...P.yanlis, P.az, P.fazla, P.meyve_degil, P.sebze_degil, P.yardim, P.sayalim, P.surukle, P.senlik, P.senlik_dokun);
  // Meyve Suyu Köşesi (yan dal)
  c.push(...meyveSuyuCumleleri());
  return [...new Set(c)];
}
