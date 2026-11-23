/**
 * Ders ve oyun planı (saf mantık; birim testi tests/unit/ingilizce-plan.test.ts).
 *
 * Seviye 1 (kelimeler). Üç dersin akışı birbirinden farklıdır (17 Kasım 2026: "derste çok tekrar var"):
 *   1. ders: selam → (ısınma) → tanış × 4 → Bul → Kino'ya Öğret → söyle → veda
 *   2. ders: selam → (ısınma) → tanış × 4 → Balon Patlat → Ne Eksik? → söyle → veda
 *   3. ders (şenlik): selam → (ısınma) → konuşan resim → Obur'u Besle → Eşleştir → söyle → veda
 * Sayılar, hareketler ve aile ünitelerinde ikinci oyunun yerini üniteye özel oyun alır (Kaç Tane?, Polly Diyor ki,
 * Kapıda Kim Var?).
 * Seviye 2 (cümleler): 4. ders anlat × 4 → Hangisi? → cümle kur · 5. ders anlat × 4 → Doğru mu? → cümle kur ·
 *   6. ders (cümle şenliği) cümle hafızası → Polly'nin Dürbünü ya da Say ve Koy → Sen Söyle.
 * Seviye 3 (konuşma): 7. ders soru–cevap → Sen Sor · 8. ders Hangisi? → uzun cümle kurma · 9. ders hikâye → sıraya diz →
 *   hikâyeyi sen anlat. Üst seviye derslerinde selamlaşmaya günlük bir söz eklenir (How are you? · What's your name? ·
 *   How old are you?); üç söz dersten derse döner.
 * Geri çağırma soruları aralıklıdır: aynı kelime art arda sorulmaz, araya başka kelime girer.
 * 18 Kasım 2026 (Barış: "derslerde gereksiz uzamış, o kadar aynı sorulara gerek yok"): her oyunda her kelime bir kez;
 * oyunlar 3–4 soru; cümle oyunları 4 soru. Ders kısa ve tempolu kalır.
 */
import type { Sarki } from './sarkilar';
import type { SaklambacTuru } from './adimlar/saklambac-veri';
import { adaOyunuPlani, adaOyunuSoruSayisi, type AdaOyunu } from './adimlar/ada-oyunlari-veri';
import { yerlestirPlani, type YerlestirPlani } from './adimlar/yerlestir-veri';
import { canlandirPlani, type CanlandirPlani } from './adimlar/canlandir-veri';
import { ovalaPlani, type OvalaPlani } from './adimlar/ovala-veri';
import { UNITELER, dersKelimeleri, kelimeBul, sayiDegeri, yeniKelimeler, type DersNo, type Kelime, type Unite, HAYVAN_BOLUMLERI, HAYVAN_DERSI_1, HAYVAN_DERSI_2, type HayvanGrubu } from './icerik';
import { ilerisi, type Hikaye, type Ifade, type Parca, type Sohbet } from './icerik2';

export type Yas = '2-3' | '4' | '5+';
export type Rnd = () => number;

export interface Soru {
  hedef: Kelime;
  secenekler: Kelime[];
}

export interface OgretSorusu extends Soru {
  /** Kino'nun kaldırdığı resim (hedefle aynıysa doğru cevap "evet") */
  gosterilen: Kelime;
}

export interface EksikTuru {
  gosterilen: Kelime[];
  eksik: Kelime;
  secenekler: Kelime[];
}

export interface SayTuru {
  /** doğru cevap (sayı kelimesi) */
  hedef: Kelime;
  adet: number;
  /** sayılacak şey (daha önce öğrenilmiş bir nesne); yoksa yıldız */
  nesne: Kelime | null;
  secenekler: Kelime[];
}

/** Hangisi?: Polly bir ifade söyler, çocuk resmini seçer */
export interface IfadeSorusu {
  hedef: Ifade;
  secenekler: Ifade[];
}

/** Cümle kurma turu: taşlar karışık gelir (büyüklerde bir de fazladan taş) */
export interface KurTuru {
  ifade: Ifade;
  taslar: Parca[];
}

export interface SohbetTuru {
  soru: Sohbet;
  secenekler: Ifade[];
}

/** Doğru mu?: Polly bir cümle söyler; resim o cümleyi gösteriyorsa cevap "Yes", başka bir cümleyi gösteriyorsa "No" */
export interface DogruMuSorusu {
  soylenen: Ifade;
  gosterilen: Ifade;
}

/** Say ve Koy: çocuk cümledeki sayı kadar nesneyi tepsiye koyar ("Three ducks.") */
/** Hayvanat Bahçesi'nin bir bölümü: hayvanları ve sorulacakları ("Where is the octopus?") */
export interface BahceBolumu { grup: HayvanGrubu; en: string; tr: string; renk: string; hayvanlar: Kelime[]; sorular: Kelime[] }

export interface SasirtTuru { goster: Kelime; soylenen: Kelime }

export interface SayKoyTuru {
  ifade: Ifade;
  adet: number;
  kelime: Kelime;
}

/** Sen Sor: çocuk soruyu sorar, Polly cevaplar */
export interface SenSorTuru {
  soru: Sohbet;
  cevap: Ifade;
  /** Polly bu soruyu önce kendisi söyler (aynı soru ikinci kez geldiğinde örnek yinelenmez) */
  ornekli: boolean;
}

/** Selamlaşmanın günlük sözü: Polly sorar, çocuk cevaplar ("How are you?" – "I'm fine, thank you!") */
export type RutinAdi = 'nasilsin' | 'adin' | 'yasin';
export interface Rutin {
  ad: RutinAdi;
  /** Ceren ne dendiğini Türkçe açıklar (yalnız ilk karşılaşmalarda) */
  aciklamali: boolean;
}
export const RUTINLER: readonly RutinAdi[] = ['nasilsin', 'adin', 'yasin'];

export type Adim =
  | { tip: 'selam'; ilk: boolean; giris?: string; rutin?: Rutin }
  | { tip: 'anlat'; ifade: Ifade; sira: number; toplam: number; aciklama?: string }
  | { tip: 'tarif'; sorular: IfadeSorusu[]; giris: string }
  | { tip: 'kur'; turlar: KurTuru[] }
  | { tip: 'sohbet'; turlar: SohbetTuru[]; aciklama: string }
  | { tip: 'hikaye'; hikaye: Hikaye; aciklama: string; /** Masal Kitaplığı: açık kitabın sayfalarında */ kitap?: true }
  | { tip: 'sirala'; sayfalar: Ifade[]; karisik: Ifade[] }
  | { tip: 'dogrumu'; sorular: DogruMuSorusu[] }
  | { tip: 'yakala'; sorular: IfadeSorusu[] }
  | { tip: 'hafiza2'; ifadeler: Ifade[] }
  | { tip: 'soyle2'; ifadeler: Ifade[]; giris: string; hikaye?: true }
  | { tip: 'saykoy'; turlar: SayKoyTuru[] }
  | { tip: 'sensor'; turlar: SenSorTuru[] }
  | { tip: 'posta'; evler: Ifade[]; mektuplar: Ifade[] }
  /** Kino'yu Giydir; çizimi ya da sesi gelmemişse ders `yedek` adımı oynar */
  | { tip: 'giydir'; hedefler: Kelime[]; raf: Kelime[]; yedek: Adim }
  /** şenlik dersinin sonunda adanın şarkısı (dosyası yoksa ders.ts çıkarır) */
  | { tip: 'sarki'; sarki: Sarki }
  /** Masal Oyunu: masaldan sonra resimli anlama soruları (sorular adım kurulurken seçilir: masal-oyun.ts) */
  /** Şakacı Polly: resim gösterilir, Polly doğrusunu ya da bilerek komik bir yanlışı söyler; çocuk Yes / No */
  | { tip: 'sasirt'; turlar: SasirtTuru[] }
  | { tip: 'masaloyun'; uniteId: string; sayfalar: Ifade[]; /** masalın adı (giriş kapağında) */ baslik?: string; /** soruların kümesi (Masal 2.0: `gol`); yoksa ada */ soruKumesi?: string; /** giriş kapağı (Masal 2.0'ın kendi kapağı); yoksa `kitap/<ada>` */ kapak?: string }
  /** Açılır kitap: 3 boyutlu kitap sahnesi (adimlar/kitap.ts; şimdilik göl masalının kanıt sayfası) */
  | { tip: 'kitap'; kitap: string }
  /** Masal 2.0: altı sayfalık, dokununca canlanan masal (adimlar/masal2.ts) */
  | { tip: 'masal2'; masal: string }
  /** Hayvan Geçidi: hayvanlar gölge olarak gelir, çocuk dokununca renklenir ve adını duyar */
  | { tip: 'gecit'; hayvanlar: Kelime[]; sahne: string }
  /** Hayvanat Bahçesi: bölüm bölüm hayvanlar tanıtılır, sonra sorulur */
  | { tip: 'bahce'; bolumler: BahceBolumu[] }
  /** Hide & Seek with Mino (Oyunlar): in, on, under, next to (adimlar/saklambac.ts) */
  | { tip: 'saklambac'; turlar: SaklambacTuru[] }
  /** 13–24. adalara özel oyun (6. ders; adimlar/ada-oyunlari.ts); çizimi ya da sesi eksikse ders `yedek` adımı oynar */
  | { tip: 'adaoyunu'; oyun: AdaOyunu; yedek: Adim }
  /** Sahneye Taşı (Odam, Yiyecekler, Vahşi; adimlar/yerlestir.ts); çizimi ya da sesi eksikse ders `yedek` adımı oynar */
  | { tip: 'yerlestir'; plan: YerlestirPlani; yedek: Adim }
  /** Söyle, Canlansın (Yüzüm, Renkler, Taşıtlar; adimlar/canlandir.ts): düz söyleme adımının sahneli hâli; eksikse `yedek` */
  | { tip: 'canlandir'; plan: CanlandirPlani; yedek: Adim }
  /** Ovala, Bul (Oyuncaklar, Meyve, Doğa; adimlar/ovala.ts): örtüyü parmakla silip sorulanı bulmak; eksikse `yedek` */
  | { tip: 'ovala'; plan: OvalaPlani; yedek: Adim }
  | { tip: 'tekrar'; sorular: Soru[] }
  | { tip: 'tanis'; kelime: Kelime; sira: number; toplam: number }
  | { tip: 'bul'; sorular: Soru[] }
  | { tip: 'ogret'; sorular: OgretSorusu[] }
  | { tip: 'balon'; sorular: Soru[] }
  | { tip: 'eksik'; turlar: EksikTuru[] }
  | { tip: 'besle'; sorular: Soru[] }
  | { tip: 'eslestir'; kelimeler: Kelime[] }
  | { tip: 'say'; turlar: SayTuru[] }
  | { tip: 'yap'; sorular: Soru[] }
  | { tip: 'kapi'; sorular: Soru[] }
  | { tip: 'resim'; kelimeler: Kelime[]; sorular: Kelime[] }
  | { tip: 'soyle'; kelimeler: Kelime[] }
  | { tip: 'fener'; sahneler: FenerSahnesi[] }
  | { tip: 'veda'; unite: boolean };

/** Fener Avı'nın bir sahnesi: adanın gece sahnesi; sahnedeki bütün kelimeler durur, öğrenilmişler sorulur */
export interface FenerSahnesi {
  uniteId: string;
  kelimeler: Kelime[];
  sorular: Kelime[];
}

export type OyunTipi = 'bul' | 'ogret' | 'balon' | 'eksik' | 'besle' | 'eslestir' | 'say' | 'yap' | 'kapi';

export function karistir<T>(dizi: readonly T[], rnd: Rnd): T[] {
  const a = dizi.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Her kelimenin `tur` kez geçtiği soru sırası. Aynı kelime art arda gelmez (tek kelime varsa kaçınılmaz).
 * Her turda kelimeler yeniden karılır; turun ilk kelimesi önceki turun son kelimesi olmaz.
 */
export function araliDizi(kelimeler: readonly Kelime[], tur: number, rnd: Rnd): Kelime[] {
  const sonuc: Kelime[] = [];
  for (let t = 0; t < tur; t++) {
    let sira = karistir(kelimeler, rnd);
    if (sonuc.length && sira.length > 1 && sira[0].id === sonuc[sonuc.length - 1].id) sira = [...sira.slice(1), sira[0]];
    sonuc.push(...sira);
  }
  return sonuc;
}

/** Hedef + çeldiriciler. Çeldiriciler önce `yakin` havuzdan (aynı dersin kelimeleri), yetmezse `uzak` havuzdan gelir. */
export function soruUret(hedef: Kelime, yakin: readonly Kelime[], uzak: readonly Kelime[], adet: number, rnd: Rnd): Soru {
  const gorulen = new Set([hedef.id]);
  const celdirici: Kelime[] = [];
  for (const havuz of [karistir(yakin, rnd), karistir(uzak, rnd)]) {
    for (const w of havuz) {
      if (celdirici.length >= adet - 1) break;
      if (gorulen.has(w.id)) continue;
      gorulen.add(w.id);
      celdirici.push(w);
    }
  }
  return { hedef, secenekler: karistir([hedef, ...celdirici], rnd) };
}

/** Yaşa ve sıraya göre seçenek sayısı: küçüklerde hep 2; 4 yaşta 2'den 3'e; 5+ yaşta 3'ten 4'e çıkar */
export function secenekSayisi(yas: Yas, sira: number, toplam: number): number {
  const ikinciYari = sira >= Math.ceil(toplam / 2);
  if (yas === '2-3') return 2;
  if (yas === '4') return ikinciYari ? 3 : 2;
  return ikinciYari ? 4 : 3;
}

function sorular(hedefler: readonly Kelime[], yakin: readonly Kelime[], uzak: readonly Kelime[], yas: Yas, rnd: Rnd, enAz = 2): Soru[] {
  return hedefler.map((h, i) => soruUret(h, yakin, uzak, Math.max(enAz, secenekSayisi(yas, i, hedefler.length)), rnd));
}

/** Kino'ya Öğret: soruların yarısında Kino doğru resmi kaldırır, yarısında yanlışı */
export function ogretSorulari(kelimeler: readonly Kelime[], uzak: readonly Kelime[], adet: number, rnd: Rnd): OgretSorusu[] {
  const hedefler = araliDizi(kelimeler, Math.ceil(adet / Math.max(1, kelimeler.length)), rnd).slice(0, adet);
  const dogrular = karistir(hedefler.map((_, i) => i % 2 === 0), rnd);
  return hedefler.map((hedef, i) => {
    const s = soruUret(hedef, kelimeler, uzak, 3, rnd);
    const yanlis = s.secenekler.find((w) => w.id !== hedef.id);
    return { ...s, gosterilen: dogrular[i] || !yanlis ? hedef : yanlis };
  });
}

/** Ne Eksik: üç resim görünür, biri kaybolur */
export function eksikTurlari(kelimeler: readonly Kelime[], uzak: readonly Kelime[], adet: number, yas: Yas, rnd: Rnd): EksikTuru[] {
  const havuz = [...kelimeler, ...uzak.filter((w) => !kelimeler.some((x) => x.id === w.id))];
  const boy = Math.min(yas === '2-3' ? 2 : 3, havuz.length);
  const hedefler = araliDizi(kelimeler, Math.ceil(adet / Math.max(1, kelimeler.length)), rnd).slice(0, adet);
  return hedefler.map((eksik) => {
    const diger = karistir(havuz.filter((w) => w.id !== eksik.id), rnd).slice(0, boy - 1);
    const gosterilen = karistir([eksik, ...diger], rnd);
    // seçenekler: kaybolan + sahnede kalanlardan biri (çocuk "hâlâ duran"la "kaybolan"ı ayırır)
    const secenekler = karistir([eksik, ...diger.slice(0, yas === '2-3' ? 1 : 2)], rnd);
    return { gosterilen, eksik, secenekler };
  });
}

/**
 * Kaç Tane?: her turda bir sayı hedeftir; masaya o kadar nesne konur. Seçenekler önce aynı dersin sayılarından gelir.
 * Sayılacak nesne her turda değişir (öğrenilmiş, tek tek sayılabilen şeyler: hayvanlar, meyveler).
 */
export function sayTurlari(sayilar: readonly Kelime[], digerSayilar: readonly Kelime[], nesneler: readonly Kelime[], adet: number, yas: Yas, rnd: Rnd): SayTuru[] {
  const hedefler = araliDizi(sayilar, Math.ceil(adet / Math.max(1, sayilar.length)), rnd).slice(0, adet);
  const havuz = karistir(nesneler, rnd);
  return hedefler.map((hedef, i) => ({
    hedef,
    adet: sayiDegeri(hedef),
    nesne: havuz.length ? havuz[i % havuz.length] : null,
    secenekler: soruUret(hedef, sayilar, digerSayilar, yas === '2-3' ? 2 : 3, rnd).secenekler.sort((a, b) => sayiDegeri(a) - sayiDegeri(b)),
  }));
}

export interface DersGirdisi {
  unite: Unite;
  no: DersNo;
  yas: Yas;
  /** daha önce öğrenilmiş kelimeler (bu dersin kelimeleri hariç): çeldirici havuzu */
  bilinen: readonly Kelime[];
  /** ısınmada sorulacak kelimeler (vadesi gelenler); boşsa ısınma adımı olmaz */
  isinma: readonly Kelime[];
  /** çocuğun ilk dersi mi (Ceren ile Polly tanışma konuşması yapar) */
  ilk: boolean;
  /** çizimi ve sesi hazır kelimeler (ünitenin sonradan eklenen kelimeleri gelene kadar derse girmez); yoksa hepsi */
  acik?: (w: Kelime) => boolean;
  /** çocuğun bitirdiği üst seviye (2. ve 3. seviye) ders sayısı: selamlaşmanın günlük sözü buna göre döner */
  ustDersSayisi?: number;
}

/** Hangisi? sorusu: hedef + aynı dersin öbür ifadelerinden çeldiriciler */
export function ifadeSorusu(hedef: Ifade, havuz: readonly Ifade[], adet: number, rnd: Rnd): IfadeSorusu {
  const celdirici = karistir(havuz.filter((x) => x.id !== hedef.id), rnd).slice(0, Math.max(1, adet - 1));
  return { hedef, secenekler: karistir([hedef, ...celdirici], rnd) };
}

/** Her ifadenin en az bir kez geçtiği, aynı ifadenin art arda gelmediği soru sırası */
function ifadeSirasi(ifadeler: readonly Ifade[], adet: number, rnd: Rnd): Ifade[] {
  const sonuc: Ifade[] = [];
  while (sonuc.length < adet && ifadeler.length) {
    let sira = karistir(ifadeler, rnd);
    if (sonuc.length && sira.length > 1 && sira[0].id === sonuc[sonuc.length - 1].id) sira = [...sira.slice(1), sira[0]];
    sonuc.push(...sira);
  }
  return sonuc.slice(0, adet);
}

export function tarifSorulari(ifadeler: readonly Ifade[], adet: number, yas: Yas, rnd: Rnd): IfadeSorusu[] {
  return ifadeSirasi(ifadeler, adet, rnd).map((hedef) => ifadeSorusu(hedef, ifadeler, yas === '2-3' ? 2 : 3, rnd));
}

const ayniTas = (a: Parca, b: Parca) => a.en.toLowerCase() === b.en.toLowerCase();

/**
 * Cümle kurma turları: taşlar karışık dizilir (doğru sırayla başlamaz). 5 yaş ve üstünde dersin başka bir cümlesinden
 * fazladan bir taş da gelir (çocuk dinlediğini taşla eşleştirmek zorunda kalır).
 */
export function kurTurlari(cumleler: readonly Ifade[], yas: Yas, rnd: Rnd): KurTuru[] {
  const kurulabilir = cumleler.filter((c) => c.parcalar.length >= 2);
  return kurulabilir.map((ifade) => {
    let taslar = karistir(ifade.parcalar, rnd);
    if (taslar.every((t, i) => t === ifade.parcalar[i])) taslar = [...taslar.slice(1), taslar[0]];
    if (yas === '5+') {
      const fazla = karistir(kurulabilir.filter((c) => c.id !== ifade.id).flatMap((c) => c.parcalar), rnd).find((p) => !ifade.parcalar.some((x) => ayniTas(x, p)));
      if (fazla) taslar.splice(Math.floor(rnd() * (taslar.length + 1)), 0, fazla);
    }
    return { ifade, taslar };
  });
}

export function sohbetTurlari(turlar: readonly Sohbet[], adet: number, yas: Yas, rnd: Rnd): SohbetTuru[] {
  const sira: Sohbet[] = [...turlar];
  // dört soru bittikten sonra ikisi yeniden sorulur (bu kez çocuk daha çabuk cevaplar)
  for (const t of karistir(turlar, rnd)) { if (sira.length >= adet) break; if (sira[sira.length - 1] !== t) sira.push(t); }
  const cevaplar = [...new Map(turlar.map((t) => [t.dogru.id, t.dogru])).values()];
  return sira.slice(0, adet).map((soru) => {
    if (soru.secenekler) return { soru, secenekler: soru.secenekler };
    const celdirici = karistir(cevaplar.filter((c) => c.id !== soru.dogru.id), rnd).slice(0, yas === '2-3' ? 1 : 2);
    return { soru, secenekler: karistir([soru.dogru, ...celdirici], rnd) };
  });
}

/** Resmin konusu: iki ifade aynı şeyi gösteriyorsa (anne / kalpli anne) biri ötekinin "yanlış resmi" olamaz */
const konu = (f: Ifade): string => f.g.ozel ?? [f.g.k, f.g.ile, f.g.adet, f.g.boy, f.g.kino].join('|');
/** Resmin öznesi: hafıza kartlarında aynı özneden iki ayrı çift olmaz (büyük inek ile küçük inek karışır) */
const ozne = (f: Ifade): string => f.g.ozel ?? `${f.g.k}+${f.g.ile ?? ''}`;

/** Öznesi birbirinden farklı en çok `adet` ifade (karışık sırayla) */
export function farkliOzneler(ifadeler: readonly Ifade[], adet: number, rnd: Rnd): Ifade[] {
  const gorulen = new Set<string>();
  const secilen: Ifade[] = [];
  for (const f of karistir(ifadeler, rnd)) {
    if (secilen.length >= adet) break;
    if (gorulen.has(ozne(f))) continue;
    gorulen.add(ozne(f));
    secilen.push(f);
  }
  return secilen;
}

/**
 * Doğru mu? soruları: yarısında resim söylenen cümleyi gösterir, yarısında aynı dersin başka bir cümlesini.
 * Yanlış resim, söylenen cümleyle aynı konuyu göstermez (cevap tartışmalı olmasın).
 */
export function dogruMuSorulari(ifadeler: readonly Ifade[], adet: number, rnd: Rnd): DogruMuSorusu[] {
  const sira = ifadeSirasi(ifadeler, adet, rnd);
  const dogrular = karistir(sira.map((_, i) => i % 2 === 0), rnd);
  return sira.map((soylenen, i) => {
    const baska = karistir(ifadeler.filter((f) => f.id !== soylenen.id && konu(f) !== konu(soylenen) && ozne(f) !== ozne(soylenen)), rnd)[0]
      ?? karistir(ifadeler.filter((f) => f.id !== soylenen.id && konu(f) !== konu(soylenen)), rnd)[0];
    return { soylenen, gosterilen: dogrular[i] || !baska ? soylenen : baska };
  });
}

/** Sayılabilen ifade: tek bir kelime resminden belirli sayıda ("Three ducks.", "I have two balls.") */
const sayilabilir = (f: Ifade): boolean => !!f.g.k && !!f.g.adet && !f.g.ile && !f.g.ozel;

/** Say ve Koy turları: art arda aynı sayı gelmez */
export function sayKoyTurlari(ifadeler: readonly Ifade[], kelimeAra: (id: string) => Kelime | undefined, adet: number, rnd: Rnd): SayKoyTuru[] {
  const turlar: SayKoyTuru[] = [];
  const kalan = karistir(ifadeler.filter((f) => sayilabilir(f) && !!kelimeAra(f.g.k!)), rnd);
  while (turlar.length < adet) {
    // sıradaki tur öncekinden farklı bir sayı ister (iki / üç / iki …); kalmadıysa durulur
    const i = kalan.findIndex((f) => f.g.adet !== turlar[turlar.length - 1]?.adet);
    if (i < 0) break;
    const [ifade] = kalan.splice(i, 1);
    turlar.push({ ifade, adet: ifade.g.adet!, kelime: kelimeAra(ifade.g.k!)! });
  }
  return turlar;
}

/** Sen Sor turları: çocuk soruyu sorar, Polly cevaplar. Evet / hayır sorularında Polly'nin cevabı sırayla değişir. */
export function senSorTurlari(turlar: readonly Sohbet[], adet: number, rnd: Rnd): SenSorTuru[] {
  const sorulan = new Set<string>();
  return karistir(turlar, rnd).slice(0, adet).map((soru, i) => {
    const ornekli = !sorulan.has(soru.en);
    sorulan.add(soru.en);
    const cevap = soru.serbest && soru.secenekler ? soru.secenekler[i % soru.secenekler.length] : soru.dogru;
    return { soru, cevap, ornekli };
  });
}

/** Selamlaşmanın günlük sözü: üç söz sırayla döner; Ceren ilk iki karşılaşmada açıklar */
export function rutinSec(ustDersSayisi: number): Rutin {
  const n = Math.max(0, Math.floor(ustDersSayisi));
  return { ad: RUTINLER[n % RUTINLER.length], aciklamali: n < RUTINLER.length * 2 };
}

/**
 * Seviye 2 ve 3 derslerinin adımları. Altı dersin oyunları birbirinden farklıdır (17 Kasım 2026: "sürekli aynı şeyler"):
 *   4. ders: anlat × 4 → Hangisi? → Cümle Kur            5. ders: anlat × 4 → Doğru mu? → Polly'nin Postası
 *   6. ders (şenlik): cümle hafızası → Polly'nin Dürbünü (sayılı kalıplarda Say ve Koy) → Sen Söyle
 *   7. ders: soru – cevap → Sen Sor (çocuk sorar, Polly cevaplar)
 *   8. ders: Hangisi? (uzun cümleler) → Cümle Kur         9. ders: hikâye → Sıraya Diz → hikâyeyi sen anlat
 */
function ileriPlani(g: DersGirdisi, rnd: Rnd): Adim[] {
  const { unite, no, yas, bilinen, isinma } = g;
  const x = ilerisi(unite);
  const kucuk = yas === '2-3';
  const adimlar: Adim[] = [{ tip: 'selam', ilk: g.ilk, rutin: g.ustDersSayisi === undefined ? undefined : rutinSec(g.ustDersSayisi) }];
  if (!x) return [...adimlar, { tip: 'veda', unite: false }];
  const isin = () => { if (isinma.length && bilinen.length >= 2) adimlar.push({ tip: 'tekrar', sorular: sorular(isinma.slice(0, 2), [...bilinen], [], yas, rnd) }); };

  if (no === 3 || no === 4) {
    const ders = no === 3 ? x.a : x.b;
    isin();
    ders.ifadeler.forEach((ifade, sira) => adimlar.push({ tip: 'anlat', ifade, sira, toplam: ders.ifadeler.length, aciklama: sira === 0 ? `tr/d-${unite.id}-${no === 3 ? 'a' : 'b'}` : undefined }));
    if (no === 3) adimlar.push({ tip: 'tarif', sorular: tarifSorulari(ders.ifadeler, 4, yas, rnd), giris: 'tr/c-tarif-giris' });
    else adimlar.push({ tip: 'dogrumu', sorular: dogruMuSorulari(ders.ifadeler, 4, rnd) });
    // 19 Kasım 2026: Cümle Kur bir adada üç derste geçiyordu; 5. derste yerine Polly'nin Postası (mektubu doğru eve götür)
    if (no === 3) adimlar.push({ tip: 'kur', turlar: kurTurlari(karistir(ders.ifadeler, rnd).slice(0, kucuk ? 2 : 3), yas, rnd) });
    else adimlar.push(postaPlani(ders.ifadeler, yas, rnd));
  } else if (no === 5) {
    const hepsi = [...x.a.ifadeler, ...x.b.ifadeler];
    isin();
    adimlar.push({ tip: 'hafiza2', ifadeler: farkliOzneler(hepsi, yas === '5+' ? 4 : 3, rnd) });
    // sayılı kalıpların adasında (sayılar, oyuncaklar, taşıtlar) çocuk söylenen kadarını tepsiye koyar
    const sayili = sayKoyTurlari([...hepsi, ...x.kur], kelimeBul, kucuk ? 3 : 4, rnd);
    const yedek: Adim = sayili.length >= 3 ? { tip: 'saykoy', turlar: sayili }
      : { tip: 'yakala', sorular: tarifSorulari(hepsi, 4, yas, rnd).map((q) => ({ ...q, secenekler: yakalaSirasi(q, rnd) })) };
    // 13–24. adalarda Dürbün'ün (sayılı adalarda Say ve Koy'un) yerine adanın kendi oyunu; çizimi ya da sesi
    // eksikse ders yedeği oynar (ada-oyunlari-veri.ts)
    const oyun = adaOyunuPlani(unite.id, yas, rnd);
    adimlar.push(oyun ? { tip: 'adaoyunu', oyun, yedek } : yedek);
    adimlar.push({ tip: 'soyle2', ifadeler: farkliOzneler(hepsi, kucuk ? 2 : 3, rnd), giris: 'tr/c-soyle2-giris' });
  } else if (no === 6) {
    adimlar.push({ tip: 'sohbet', turlar: sohbetTurlari(x.sohbet.turlar, 4, yas, rnd), aciklama: `tr/d-${unite.id}-s` });
    adimlar.push({ tip: 'sensor', turlar: senSorTurlari(x.sohbet.turlar, kucuk ? 2 : 3, rnd) });
  } else if (no === 7) {
    // uzun cümleler yenidir: çocuk önce dinleyip resmini seçer, sonra taşlarla kurar
    adimlar.push({ tip: 'tarif', sorular: tarifSorulari(x.kur, 4, yas, rnd), giris: 'tr/c-tarif-giris' });
    adimlar.push({ tip: 'kur', turlar: kurTurlari(x.kur, yas, rnd) });
  } else {
    const sayfalar = x.hikaye.sayfalar;
    adimlar.push({ tip: 'hikaye', hikaye: x.hikaye, aciklama: `tr/d-${unite.id}-h` });
    let karisik = karistir(sayfalar, rnd);
    if (karisik.every((p, i) => p === sayfalar[i])) karisik = [...karisik.slice(1), karisik[0]];
    adimlar.push({ tip: 'masaloyun', uniteId: unite.id, sayfalar, baslik: x.hikaye.en });
    adimlar.push({ tip: 'sirala', sayfalar, karisik });
    // 22 Kasım 2026 (Barış: "masalda önce güzel bir hikâye, sonra oyun; devamlı ses soruyorsun, tekrara kaçıyorsun"):
    // yankı okuma yerine Masal Oyunu (resimli anlama soruları), sonra Sıraya Diz
    void kucuk;
  }
  adimlar.push({ tip: 'veda', unite: no % 3 === 2 });
  return adimlar;
}

/**
 * Polly'nin Postası: sokaktaki evler dersin cümleleridir (küçüklerde üç, büyüklerde dört ev); üç mektup üç ayrı eve gider.
 * Büyüklerde son mektupta bile iki boş ev kalır (son teslim tahmine dönmez).
 */
export function postaPlani(ifadeler: readonly Ifade[], yas: Yas, rnd: Rnd): Adim {
  const evler = karistir(ifadeler, rnd).slice(0, yas === '2-3' ? 3 : 4);
  return { tip: 'posta', evler, mektuplar: karistir(evler, rnd).slice(0, 3) };
}

/**
 * Kino'yu Giydir: komut sırası karışık, küçüklerde üç büyüklerde dört giysi; askıda en çok altı giysi durur
 * (istenenlerin hepsi ve dersin öbür giysileri).
 */
export function giydirPlani(hedefler: readonly Kelime[], raf: readonly Kelime[], yas: Yas, rnd: Rnd, yedek: Adim): Adim {
  const secilen = karistir(hedefler, rnd).slice(0, yas === '2-3' ? 3 : 4);
  const diger = karistir(raf.filter((w) => !secilen.some((x) => x.id === w.id)), rnd).slice(0, Math.max(0, 6 - secilen.length));
  return { tip: 'giydir', hedefler: secilen, raf: karistir([...secilen, ...diger], rnd), yedek };
}

/**
 * Hayvan dersleri: Çiftlik adasının ilk üç dersi (20 Kasım 2026, Barış: "3 hayvanla bitirdin… 1. derste 10–15, 2. derste 30,
 * 3. derste 100 hayvan"). Kelimeler tek tek kutudan açılmaz (12 hayvanda dakikalar sürerdi): Hayvan Geçidi'nde gölge olarak
 * gelir, çocuk dokununca renklenir ve adını duyar. Sıra:
 *   1. ders (12): Geçit → Bul → adanın şarkısı (aynı 12 hayvan) → Söyle
 *   2. ders (+18 = 30): ısınma → Geçit → Balon → Söyle
 *   3. ders (+70 = 100): Hayvanat Bahçesi (altı bölüm; her bölümde adlar ve bir iki soru)
 */
export function hayvanPlani(g: { no: 0 | 1 | 2; yas: Yas; ilk: boolean; isinma: readonly Kelime[]; acik?: (w: Kelime) => boolean; sarki?: Sarki }, rnd: Rnd = Math.random): Adim[] {
  const ac = g.acik ?? (() => true);
  const bul = (ids: readonly string[]) => ids.map((id) => kelimeBul(id)).filter((w): w is Kelime => !!w && ac(w));
  const kucuk = g.yas === '2-3';
  const a1 = bul(HAYVAN_DERSI_1), a2 = bul(HAYVAN_DERSI_2);
  const adimlar: Adim[] = [{ tip: 'selam', ilk: g.ilk, giris: g.no === 0 ? 'tr/u-ciftlik' : undefined }];
  if (g.no === 0) {
    adimlar.push({ tip: 'gecit', hayvanlar: a1, sahne: 'ciftlik' });
    adimlar.push({ tip: 'bul', sorular: sorular(karistir(a1, rnd).slice(0, 4), a1, [], g.yas, rnd) });
    if (g.sarki) adimlar.push({ tip: 'sarki', sarki: g.sarki });
    adimlar.push({ tip: 'soyle', kelimeler: karistir(a1, rnd).slice(0, kucuk ? 3 : 4) });
    adimlar.push({ tip: 'veda', unite: false });
  } else if (g.no === 1) {
    if (g.isinma.length >= 2 && a1.length >= 2) adimlar.push({ tip: 'tekrar', sorular: sorular(g.isinma.slice(0, 2), a1, [], g.yas, rnd) });
    adimlar.push({ tip: 'gecit', hayvanlar: a2, sahne: 'vahsi' });
    adimlar.push({ tip: 'balon', sorular: sorular(karistir(a2, rnd).slice(0, 4), a2, a1, g.yas, rnd, kucuk ? 2 : 3) });
    adimlar.push({ tip: 'sasirt', turlar: sasirtTurlari(a2, rnd) });
    adimlar.push({ tip: 'soyle', kelimeler: karistir(a2, rnd).slice(0, kucuk ? 3 : 4) });
    adimlar.push({ tip: 'veda', unite: false });
  } else {
    const bolumler: BahceBolumu[] = HAYVAN_BOLUMLERI.map((b) => {
      const hayvanlar = bul(b.hayvanlar);
      return { grup: b.grup, en: b.en, tr: b.tr, renk: b.renk, hayvanlar, sorular: karistir(hayvanlar, rnd).slice(0, kucuk ? 1 : 2) };
    }).filter((b) => b.hayvanlar.length >= 3);
    adimlar.push({ tip: 'bahce', bolumler });
    adimlar.push({ tip: 'veda', unite: true });
  }
  return adimlar;
}

/**
 * Şakacı Polly'nin iki turu: biri doğru (resim ne ise o söylenir), biri bilerek komik yanlış (ilk on iki adanın başka bir
 * adasından, resimle ilgisi olmayan bir şey: elmaya "It's an elephant."). Sıra karışık; her derste bir şaka mutlaka vardır.
 */
export function sasirtTurlari(kelimeler: readonly Kelime[], rnd: Rnd): SasirtTuru[] {
  // hareket kelimelerinde "Can you jump?" sorusuna Yes / No belirsiz kalır: orada şaka yok
  if (kelimeler.some((w) => w.tur === 'eylem')) return [];
  const [ilk, ikinci] = karistir(kelimeler, rnd);
  if (!ilk) return [];
  const havuz = UNITELER.slice(0, 12).filter((u) => !u.kelimeler.some((w) => kelimeler.some((k) => k.id === w.id)))
    .flatMap((u) => u.kelimeler).filter((w) => w.tur === 'tekil' && !w.ek);
  if (!havuz.length) return [];
  const saka = havuz[Math.floor(rnd() * havuz.length)];
  return karistir([{ goster: ilk, soylenen: ilk }, { goster: ikinci ?? ilk, soylenen: saka }], rnd);
}

/** Dürbünden geçecek resimlerin sırası: söylenen resim ilk gelmez (çocuk beklemeyi ve seçmeyi öğrenir) */
function yakalaSirasi(q: IfadeSorusu, rnd: Rnd): Ifade[] {
  const sira = karistir(q.secenekler, rnd);
  return sira.length > 1 && sira[0].id === q.hedef.id ? [...sira.slice(1), sira[0]] : sira;
}

/** Bir dersin adımları */
export function dersPlani(g: DersGirdisi, rnd: Rnd = Math.random): Adim[] {
  if (g.no >= 3) return ileriPlani(g, rnd);
  const { unite, no, yas, bilinen, isinma } = g;
  const ac = g.acik ?? (() => true);
  const yeni = yeniKelimeler(unite, no).filter(ac);
  const calisilan = dersKelimeleri(unite, no).filter(ac);
  // çeldirici olarak ünitenin daha önce öğrenilmiş kelimeleri de kullanılır (2. derste 1. dersin kelimeleri)
  const uniteOnceki = no === 1 ? yeniKelimeler(unite, 0).filter(ac) : [];
  const uzak = [...uniteOnceki, ...bilinen.filter((w) => !calisilan.some((x) => x.id === w.id) && !uniteOnceki.some((x) => x.id === w.id))];
  const kucuk = yas === '2-3';
  // sayılar ünitesi: oyun adımı gerçek sayma işidir (Kaç Tane?); sayılacak şeyler daha önce öğrenilmiş nesnelerdir
  const sayiUnitesi = calisilan.every((w) => w.tur === 'sayi');
  const sayilacak = bilinen.filter((w) => w.tur === 'tekil');
  // hareketler ünitesi: oyun adımı Polly Diyor ki (Kino komutu yapar)
  const eylemUnitesi = calisilan.every((w) => w.tur === 'eylem');
  // ailem ünitesi: oyun adımı Kapıda Kim Var?
  const kisiUnitesi = calisilan.every((w) => w.tur === 'kisi');
  // Ceren ünitenin girişini yalnız ünitenin ilk dersinde söyler (her derste aynı söz yinelenmez)
  const adimlar: Adim[] = [{ tip: 'selam', ilk: g.ilk, giris: no === 0 ? `tr/u-${unite.id}` : undefined }];

  const isinmaHavuzu = [...bilinen];
  if (isinma.length && isinmaHavuzu.length >= 2) {
    adimlar.push({ tip: 'tekrar', sorular: sorular(isinma.slice(0, 2), isinmaHavuzu, [], yas, rnd) });
  }

  /** üniteye özel oyun (varsa): Kaç Tane? · Polly Diyor ki · Kapıda Kim Var? */
  /** kıyafetler adası: oyun adımı Kino'yu Giydir (çizimi gelmeden yedek oyun oynanır) */
  const giydir = (hedefler: Kelime[], raf: readonly Kelime[], yedek: Adim): Adim =>
    unite.id === 'kiyafetler' ? giydirPlani(hedefler, raf, yas, rnd, yedek) : yedek;
  /**
   * Sahneye Taşı (22 Kasım 2026): adaya özel etkinliği olmayan Odam, Yiyecekler ve Vahşi'de 2. dersin Eksik'i ve şenliğin
   * Obur'u Besle'si yerine adanın sahnesi (çocuk eşyayı sahneye sürükler, sahne canlanır)
   */
  const sahneyeTasi = (hedefler: Kelime[], raf: readonly Kelime[], yedek: Adim): Adim => {
    const plan = yerlestirPlani(unite.id, hedefler, raf, yas, rnd);
    return plan ? { tip: 'yerlestir', plan, yedek } : yedek;
  };
  /**
   * Söyle, Canlansın (22 Kasım 2026): Yüzüm, Renkler ve Taşıtlar'da 2. dersin ve şenliğin sonundaki düz söyleme adımı
   * yerine sahnesi; yeni söyleme eklenmez, var olan söyleme sahneye bağlanır
   */
  /**
   * Ovala, Bul (22 Kasım 2026): Oyuncaklar, Meyve ve Doğa'da 1. dersin Bul'u ve şenliğin Obur'u Besle'si yerine;
   * çocuk sahnedeki örtüyü (köpük, toprak, sis) parmağıyla siler
   */
  const ovalaVeya = (kelimeler: readonly Kelime[], yedek: Adim): Adim => {
    const plan = ovalaPlani(unite.id, kelimeler, yas, rnd);
    return plan ? { tip: 'ovala', plan, yedek } : yedek;
  };
  /** `havuz`: şenlikte sahne, dersin bütün kelimelerinden yeri olanları seçer (düz adımın rastgele dördüyle sınırlı kalmaz) */
  const sahneliSoyle = (yedek: Extract<Adim, { tip: 'soyle' }>, tam = false, havuz: readonly Kelime[] = yedek.kelimeler): Adim => {
    const plan = canlandirPlani(unite.id, havuz, yas, rnd, tam);
    return plan ? { tip: 'canlandir', plan, yedek } : yedek;
  };
  const ozelOyun = (hedefler: Kelime[], havuz: readonly Kelime[], adet: number): Adim | null => {
    if (sayiUnitesi) return { tip: 'say', turlar: sayTurlari(hedefler, havuz.filter((w) => !hedefler.some((x) => x.id === w.id)), sayilacak, adet, yas, rnd) };
    const sorulacak = araliDizi(hedefler, Math.ceil(adet / Math.max(1, hedefler.length)), rnd).slice(0, adet);
    if (eylemUnitesi) return { tip: 'yap', sorular: sorular(sorulacak, havuz, [], yas, rnd, kucuk ? 2 : 3) };
    if (kisiUnitesi) return { tip: 'kapi', sorular: sorular(sorulacak, havuz, [], yas, rnd, kucuk ? 2 : 3) };
    return null;
  };

  if (no === 2) {
    // şenlik: kelimeler önce sahnede yaşar, sonra iki oyun; sonunda yalnız dört kelime söylenir (hepsi değil)
    adimlar.push({ tip: 'resim', kelimeler: calisilan, sorular: araliDizi(calisilan, 1, rnd).slice(0, kucuk ? 3 : 4) });
    adimlar.push(giydir(calisilan, calisilan, ozelOyun(calisilan, calisilan, 4)
      ?? sahneyeTasi(calisilan, calisilan, ovalaVeya(calisilan, { tip: 'besle', sorular: sorular(araliDizi(calisilan, 1, rnd).slice(0, 4), calisilan, uzak, yas, rnd, kucuk ? 2 : 3) }))));
    adimlar.push({ tip: 'eslestir', kelimeler: karistir(calisilan, rnd).slice(0, yas === '5+' ? 4 : 3) });
    adimlar.push(sahneliSoyle({ tip: 'soyle', kelimeler: karistir(calisilan, rnd).slice(0, kucuk ? 3 : 4) }, false, calisilan));
    adimlar.push({ tip: 'veda', unite: true });
    return adimlar;
  }

  yeni.forEach((kelime, sira) => adimlar.push({ tip: 'tanis', kelime, sira, toplam: yeni.length }));
  // ilk geri çağırma: her yeni kelime bir kez (18 Kasım 2026, Barış: "o kadar aynı sorulara gerek yok"; fazladan tur yok)
  const hedefler = araliDizi(yeni, 1, rnd);
  if (no === 0) {
    adimlar.push(ovalaVeya(hedefler, { tip: 'bul', sorular: sorular(hedefler, yeni, uzak, yas, rnd) }));
    adimlar.push(giydir(yeni, yeni, ozelOyun(yeni, [...yeni, ...uniteOnceki], 3) ?? { tip: 'ogret', sorular: ogretSorulari(yeni, uzak, kucuk ? 2 : 3, rnd) }));
  } else {
    adimlar.push({ tip: 'balon', sorular: sorular(hedefler, [...yeni, ...uniteOnceki], uzak, yas, rnd, kucuk ? 2 : 3) });
    // 22 Kasım 2026: 2. dersin ortasında Şakacı Polly (gülmece molası). 1. derste yok: orada Kino'ya Öğret aynı
    // resim + Yes / No işini yapıyor, art arda gelirse tekrar olur.
    adimlar.push({ tip: 'sasirt', turlar: sasirtTurlari(yeni, rnd) });
    adimlar.push(giydir(yeni, [...yeni, ...uniteOnceki], ozelOyun(yeni, [...yeni, ...uniteOnceki], 3) ?? sahneyeTasi(yeni, [...yeni, ...uniteOnceki], { tip: 'eksik', turlar: eksikTurlari(yeni, uniteOnceki, 3, yas, rnd) })));
  }
  adimlar.push(no === 1 ? sahneliSoyle({ tip: 'soyle', kelimeler: yeni }, true) : { tip: 'soyle', kelimeler: yeni });
  adimlar.push({ tip: 'veda', unite: false });
  return adimlar;
}

/** Oyunlar bölümü: öğrenilmiş kelimelerle tek bir oyun turu. `odak`: turun kelimeleri (en çok 6), `diger`: çeldirici havuzu */
export function oyunPlani(tip: OyunTipi, odak: readonly Kelime[], diger: readonly Kelime[], yas: Yas, rnd: Rnd = Math.random): Adim {
  const kucuk = yas === '2-3';
  const tur = odak.length >= 6 ? 1 : 2;
  const hedefler = araliDizi(odak, tur, rnd).slice(0, kucuk ? 4 : 6);
  switch (tip) {
    case 'bul': return { tip: 'bul', sorular: sorular(araliDizi(odak, tur, rnd).slice(0, 8), odak, diger, yas, rnd, kucuk ? 2 : 3) };
    case 'ogret': return { tip: 'ogret', sorular: ogretSorulari(odak, diger, kucuk ? 3 : 5, rnd) };
    case 'balon': return { tip: 'balon', sorular: sorular(hedefler, odak, diger, yas, rnd, kucuk ? 2 : 3) };
    case 'eksik': return { tip: 'eksik', turlar: eksikTurlari(odak, diger, kucuk ? 3 : 5, yas, rnd) };
    case 'besle': return { tip: 'besle', sorular: sorular(hedefler, odak, diger, yas, rnd, kucuk ? 2 : 3) };
    case 'eslestir': return { tip: 'eslestir', kelimeler: karistir(odak, rnd).slice(0, yas === '5+' ? 4 : 3) };
    case 'kapi': {
      const kisiler = [...odak, ...diger].filter((w) => w.tur === 'kisi');
      return { tip: 'kapi', sorular: sorular(araliDizi(kisiler, kisiler.length >= 6 ? 1 : 2, rnd).slice(0, kucuk ? 4 : 6), kisiler, [], yas, rnd, kucuk ? 2 : 3) };
    }
    case 'yap': {
      // yalnız öğrenilmiş hareket kelimeleriyle oynanır
      const eylemler = [...odak, ...diger].filter((w) => w.tur === 'eylem');
      return { tip: 'yap', sorular: sorular(araliDizi(eylemler, eylemler.length >= 6 ? 1 : 2, rnd).slice(0, kucuk ? 4 : 6), eylemler, [], yas, rnd, kucuk ? 2 : 3) };
    }
    case 'say': {
      // odak: öğrenilmiş sayı kelimeleri; diger: sayılacak nesneler
      const sayilar = odak.filter((w) => w.tur === 'sayi');
      return { tip: 'say', turlar: sayTurlari(sayilar, [], diger.filter((w) => w.tur === 'tekil'), kucuk ? 4 : 6, yas, rnd) };
    }
  }
}

/**
 * Fener Avı (Oyunlar bölümünün tek oyunu, 18 Kasım 2026): öğrenilmiş kelimelerin adalarından en çok iki gece sahnesi.
 * Her sahnede 3 soru (tek sahne varsa 4); unutulmak üzere olan (`oncelik`) kelimeler önce sorulur, aynı kelime iki kez
 * sorulmaz. Sahne seçimi her oyunda değişir (çeşit). `adaylar`: öğrenilmiş en az üç kelimesi olan sahneli adalar.
 */
export function fenerPlani(adaylar: readonly { uniteId: string; kelimeler: Kelime[]; ogrenilen: Kelime[] }[], oncelik: readonly string[], rnd: Rnd = Math.random): Adim {
  const uygun = adaylar.filter((x) => x.ogrenilen.length >= 3);
  const puan = (x: (typeof uygun)[number]) => x.ogrenilen.filter((w) => oncelik.includes(w.id)).length;
  // vadesi gelen kelimesi olan ada önde; eşitlikte rastgele (her oyunda başka ada)
  const sirali = karistir(uygun, rnd).sort((a, b) => puan(b) - puan(a)).slice(0, 2);
  const soruAdedi = sirali.length === 1 ? 4 : 3;
  const sahneler = sirali.map((x) => {
    const once = karistir(x.ogrenilen.filter((w) => oncelik.includes(w.id)), rnd);
    const sonra = karistir(x.ogrenilen.filter((w) => !oncelik.includes(w.id)), rnd);
    return { uniteId: x.uniteId, kelimeler: x.kelimeler, sorular: karistir([...once, ...sonra].slice(0, soruAdedi), rnd) };
  });
  return { tip: 'fener', sahneler };
}

/** Bir oyunun açılması için gereken en az öğrenilmiş kelime sayısı */
export const OYUN_ESIGI: Record<OyunTipi, number> = { bul: 3, ogret: 3, balon: 3, eksik: 3, besle: 3, eslestir: 3, say: 3, yap: 3, kapi: 3 };

/** Planın geri çağırma sorusu sayısı (yıldız hesabında payda) */
export function soruSayisi(adimlar: readonly Adim[]): number {
  let n = 0;
  for (const a of adimlar) {
    if (a.tip === 'bul' || a.tip === 'tekrar' || a.tip === 'balon' || a.tip === 'besle' || a.tip === 'ogret' || a.tip === 'yap' || a.tip === 'kapi' || a.tip === 'tarif') n += a.sorular.length;
    else if (a.tip === 'dogrumu' || a.tip === 'yakala') n += a.sorular.length;
    else if (a.tip === 'hafiza2') n += a.ifadeler.length;
    else if (a.tip === 'saykoy' || a.tip === 'saklambac') n += a.turlar.length;
    else if (a.tip === 'posta') n += a.mektuplar.length;
    else if (a.tip === 'giydir') n += a.hedefler.length;
    else if (a.tip === 'masaloyun') n += 3;
    else if (a.tip === 'sasirt') n += a.turlar.length;
    else if (a.tip === 'bahce') n += a.bolumler.reduce((t, x) => t + x.sorular.length, 0);
    else if (a.tip === 'kur') n += a.turlar.length;
    else if (a.tip === 'sohbet') n += a.turlar.filter((t) => !t.soru.serbest).length;
    else if (a.tip === 'sirala') n += a.sayfalar.length;
    else if (a.tip === 'eksik' || a.tip === 'say') n += a.turlar.length;
    else if (a.tip === 'resim') n += a.sorular.length;
    else if (a.tip === 'fener') n += a.sahneler.reduce((t, x) => t + x.sorular.length, 0);
    else if (a.tip === 'eslestir') n += a.kelimeler.length;
    else if (a.tip === 'adaoyunu') n += adaOyunuSoruSayisi(a.oyun);
    else if (a.tip === 'yerlestir' || a.tip === 'ovala') n += a.plan.hedefler.length;
  }
  return n;
}
