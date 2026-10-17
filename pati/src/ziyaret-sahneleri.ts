/**
 * Pati Dükkânı v2 · ziyaret sahneleri (PATI-V2 §9c, Z1-Z10): SAF kurallar (DOM yok; tests/unit/pati-ziyaret.test.ts).
 * Sahneyi oynatan ziyaret.ts; kişileri çizen ziyaretci.ts. Sözler content/pati.json → v2.ziyaret.
 *
 * İlke: ziyaretçi bir TÜR ister ("yumuşacık biri"), tek doğru ürün değil. Birden çok hayvan uyar; uymayan hayvan da
 * cezasız, komik ve sıcak bir sahne verir ve jeton getirir (uygun 3/5, uymayan 1/2). Ziyaretçi acele etmez.
 *
 *  Z1 kino      Kino yardım ediyor: üç ikramı (kemik bisküvi, havuç, balık yemi) çocuk hangi hayvana isterse verir.
 *  Z2 lokum     Anne + Lokum: "Lokum için yumuşacık biri…" (uygun: tavşan, kobay, kedi).
 *  Z3 liste     Anne'nin unutulan listesi: ipuçlarından eşyayı bul (6 seçenek; 3-4'te balonda resmi).
 *  Z4 baba      Baba uyuyakaldı: hangi hayvan uyandıracak (kedi hapşırtır, köpek gıdıklar, hamster cebe girer, kuş
 *               ninni söyler ve Baba yine uyur; Babaanne'nin çayı rafta kaldıysa çay da).
 *  Z5 babaanne  Babaanne'nin tepsisi: neyi kime (3-4: havuç, elma, bezelye; 5-6: + pişi, börek).
 *  Z6 dede      "Bahçeme sessiz bir arkadaş." (uygun: kaplumbağa, civciv, kedi); giderken Bahçe fikri.
 *  Z7 parti     Mino'nun partisi: 3 müzik (hızlı, yavaş, komik); her hayvan her müziğe aynı tepkiyi vermez.
 *  Z8 can/ada/elif/ege  Sesli Maceralar çocukları: "Bana uygun bir hayvan".
 *  Z9 foto      Dükkân fotoğrafı (5 hayvandan sonra bir kez): en çok 4 hayvan fotoğrafa.
 *  Z10 diken    Gece misafiri Diken (Bahçe açıksa, kapanışta): tabağa ne konacak.
 */
import { HAYVAN_IDLERI, hayvanBilgi, type Yas } from './katalog';
import { kazanc } from './ekonomi';
import type { PatiKayit } from './kayit';
import { tepki } from './tercih';
import { esyaKapsamda, hayvanKapsamda, insanYemegiKapsamda } from './yayin';

export type ZiyaretId = 'kino' | 'lokum' | 'liste' | 'baba' | 'babaanne' | 'dede' | 'parti' | 'can' | 'ada' | 'elif' | 'ege' | 'foto' | 'diken';
/** Sahnede kim var (ziyaretci.ts çizer) */
export type Kisi = 'kino' | 'anne' | 'lokum' | 'baba' | 'babaanne' | 'dede' | 'mino' | 'can' | 'ada' | 'elif' | 'ege-anne' | 'diken';
/** Çocuktan ne bekleniyor */
export type Bekleyis = 'hayvan' | 'ikram' | 'esya' | 'muzik' | 'foto' | 'tabak';

export interface Sahne {
  id: ZiyaretId;
  kisiler: Kisi[];
  bekleyis: Bekleyis;
  /** 3-4 resim balonu (eşya ya da hayvan resmi adı; null: balon yok) */
  balon: string | null;
}
export const SAHNELER: Record<ZiyaretId, Sahne> = {
  kino: { id: 'kino', kisiler: ['kino'], bekleyis: 'ikram', balon: null },
  lokum: { id: 'lokum', kisiler: ['anne', 'lokum'], bekleyis: 'hayvan', balon: 'esya-minder' },
  liste: { id: 'liste', kisiler: ['anne'], bekleyis: 'esya', balon: null },
  baba: { id: 'baba', kisiler: ['baba'], bekleyis: 'hayvan', balon: null },
  babaanne: { id: 'babaanne', kisiler: ['babaanne'], bekleyis: 'ikram', balon: null },
  dede: { id: 'dede', kisiler: ['dede'], bekleyis: 'hayvan', balon: 'sus-saksi' },
  parti: { id: 'parti', kisiler: ['mino'], bekleyis: 'muzik', balon: null },
  can: { id: 'can', kisiler: ['can'], bekleyis: 'hayvan', balon: 'esya-top' },
  ada: { id: 'ada', kisiler: ['ada'], bekleyis: 'hayvan', balon: 'esya-minder' },
  elif: { id: 'elif', kisiler: ['elif'], bekleyis: 'hayvan', balon: 'esya-muzik-kutusu' },
  // Ege'nin annesi "yavaş" bir hayvan ister: balonda kaplumbağa; yayında kaplumbağa yoksa (yayin.ts) uygun olan tavşan
  ege: { id: 'ege', kisiler: ['ege-anne'], bekleyis: 'hayvan', balon: hayvanKapsamda('tospik') ? 'kadro-b-tospik' : 'kadro-a-pofuduk' },
  foto: { id: 'foto', kisiler: ['kino', 'anne', 'lokum', 'baba', 'babaanne', 'dede'], bekleyis: 'foto', balon: null },
  diken: { id: 'diken', kisiler: ['diken'], bekleyis: 'tabak', balon: null },
};

/** Ziyaretlerin sırası: ilk Kino; sonra en az gelen önce (son 3 ziyaret tekrar etmez) */
const DONGU_HEPSI: ZiyaretId[] = ['lokum', 'can', 'dede', 'baba', 'ada', 'babaanne', 'liste', 'elif', 'ege', 'kino'];
/**
 * Hayvan isteyen ziyaretçi yalnız dükkânda ona UYGUN bir yavru varsa gelir (yayın kapsamında kuş yok: Elif gelmez).
 * Uymayan hayvan da sahne verir ama çocuk doğruyu hiç bulamazsa ziyaret eksik kalır.
 */
const dongu = (): ZiyaretId[] => DONGU_HEPSI.filter((z) => SAHNELER[z].bekleyis !== 'hayvan' || HAYVAN_IDLERI.some((id) => hayvanSonucu(z, id).uygun));
/** Dükkân fotoğrafı kaç hayvandan sonra (5; dükkânda daha az tür varsa hepsi alınınca) */
export const FOTO_HAYVAN = Math.min(5, HAYVAN_IDLERI.length);
/** Parti: müzik kutusu süsü konduysa ya da toplam 5 danstan sonra */
export const partiHazir = (k: PatiKayit) => k.susler.some((s) => s.ad === 'muzik-kutusu' && !!s.nokta) || k.hayvanlar.reduce((t, h) => t + h.dans, 0) >= 5;

/**
 * Sıradaki ziyaretçi (yoksa null). İlk ziyaret ikinci hayvan alınınca (Kino). Fotoğraf 5 hayvandan sonra bir kez.
 * son: son ziyaretler (en yenisi sonda).
 */
export function siradakiZiyaret(k: PatiKayit, son: readonly ZiyaretId[] = []): ZiyaretId | null {
  if (k.hayvanlar.length < 2) return null;
  const sayi = (id: ZiyaretId) => k.ziyaretler[id] ?? 0;
  if (!sayi('kino')) return 'kino';
  if (k.hayvanlar.length >= FOTO_HAYVAN && !sayi('foto')) return 'foto';
  const yakin = son.slice(-3);
  const DONGU = dongu();
  if (partiHazir(k) && !yakin.includes('parti') && sayi('parti') <= Math.min(...DONGU.map(sayi))) return 'parti';
  const aday = DONGU.filter((z) => !yakin.includes(z));
  aday.sort((a, b) => sayi(a) - sayi(b) || DONGU.indexOf(a) - DONGU.indexOf(b));
  return aday[0] ?? null;
}

// ---------------------------------------------------------------- hayvan istekleri
/** Ziyaretçinin hayvana tepkisi (sahnenin adı) ve uygun mu */
export interface HayvanSonucu {
  uygun: boolean;
  /** komik / sıcak sahnenin adı (ziyaret.ts oynatır) */
  sahne: string;
}
const tur = (id: string) => hayvanBilgi(id).tur;

export function hayvanSonucu(z: ZiyaretId, id: string): HayvanSonucu {
  const t = tur(id);
  switch (z) {
    case 'lokum':
      if (['tavsan', 'kobay', 'kedi'].includes(t)) return { uygun: true, sahne: 'oksar' };
      if (t === 'kopek') return { uygun: false, sahne: id === 'findik' ? 'abi' : 'yalar' };
      if (t === 'kus') return { uygun: false, sahne: 'basa-konar' };
      if (t === 'balik') return { uygun: false, sahne: 'cam' };
      if (t === 'kaplumbaga' || t === 'gekko') return { uygun: false, sahne: 'bekler' };
      return { uygun: false, sahne: 'koklar' };
    case 'can':
      if (t === 'kopek' || id === 'kakao') return { uygun: true, sahne: 'top' };
      if (t === 'kaplumbaga') return { uygun: false, sahne: 'yavas-top' };
      return { uygun: false, sahne: 'koklar' };
    case 'ada':
      if (['kedi', 'tavsan', 'kobay'].includes(t)) return { uygun: true, sahne: 'kucakta-uyur' };
      if (t === 'civciv') return { uygun: false, sahne: 'cikcik' };
      return { uygun: false, sahne: 'koklar' };
    case 'elif':
      if (t === 'kus') return { uygun: true, sahne: 'sarki' };
      if (t === 'kopek') return { uygun: false, sahne: 'uluma' };
      return { uygun: false, sahne: 'koklar' };
    case 'ege':
      if (['kaplumbaga', 'gekko', 'tavsan'].includes(t)) return { uygun: true, sahne: 'yavas' };
      if (t === 'kopek') return { uygun: false, sahne: 'yalar' };
      return { uygun: false, sahne: 'koklar' };
    case 'baba':
      if (t === 'kedi') return { uygun: true, sahne: 'hapsu' };
      if (t === 'kopek') return { uygun: true, sahne: 'gidik' };
      if (t === 'hamster' || t === 'kobay') return { uygun: true, sahne: 'cep' };
      if (t === 'kus') return { uygun: false, sahne: 'kus' };
      return { uygun: false, sahne: 'uyur' };
    case 'dede':
      if (['kaplumbaga', 'civciv', 'kedi'].includes(t)) return { uygun: true, sahne: 'guzel' };
      if (t === 'kopek') return { uygun: false, sahne: 'kasket' };
      if (t === 'kus') return { uygun: false, sahne: 'kasket-kus' };
      if (t === 'balik') return { uygun: false, sahne: 'goz-kirp' };
      return { uygun: false, sahne: 'koklar' };
    default:
      return { uygun: false, sahne: 'koklar' };
  }
}

/** Ziyaretin jetonu (uygun 3/5, uymayan 1/2) */
export const ziyaretJetonu = (uygun: boolean, yas: Yas) => kazanc(uygun ? 'ziyaret_uyan' : 'ziyaret_uymayan', yas);

// ---------------------------------------------------------------- ikramlar (Kino, Babaanne)
/** Kino'nun tezgâhtaki üç ikramı */
export const KINO_IKRAM = ['kemik-biskuvi', 'havuc', 'balik-yemi'] as const;
/** Babaanne'nin tepsisi (3-4 yalnız sağlıklı yiyecek; 5-6 pişi ve börek de) */
export function babaanneTepsisi(yas: Yas): string[] {
  const l = yas === 'buyuk' ? ['havuc', 'elma', 'bezelye', 'pisi', 'borek'] : ['havuc', 'elma', 'bezelye'];
  // yayın kapsamı (yayin.ts): bezelyenin çizimi yok → çilek; pişinin çizimi yok → tepside yok
  return l.map((e) => (e === 'bezelye' && !esyaKapsamda(e) ? 'cilek' : e)).filter((e) => (INSAN_YEMEGI.includes(e) ? insanYemegiKapsamda(e) : esyaKapsamda(e)));
}
/** İnsan yemeği (eşya değil; çizimi gelene kadar sade yer tutucu) */
export const INSAN_YEMEGI = ['pisi', 'borek'];

export type IkramSonucu = 'sever' | 'olur' | 'sevmez' | 'insan-kapar' | 'insan-iter';
/** Bir ikramı bir hayvana verince */
export function ikramSonucu(id: string, ikram: string, yas: Yas): IkramSonucu {
  if (INSAN_YEMEGI.includes(ikram)) return tur(id) === 'kopek' ? 'insan-kapar' : 'insan-iter';
  const t = tepki(id, 'ac', ikram, 'kucuk');
  void yas;
  return t === 'sever' ? 'sever' : t === 'olur' ? 'olur' : 'sevmez';
}

// ---------------------------------------------------------------- Anne'nin listesi
export interface Liste {
  cevap: string;
  ipuclari: string[];
}
export const LISTELER: Liste[] = [
  { cevap: 'top', ipuclari: ['ipucu-yuvarlak', 'ipucu-ziplar', 'ipucu-kirmizi'] },
  { cevap: 'minder', ipuclari: ['ipucu-yumusak', 'ipucu-yatilir'] },
  { cevap: 'havuc', ipuclari: ['ipucu-uzun', 'ipucu-kulakli'] },
  { cevap: 'su-spreyi', ipuclari: ['ipucu-fis'] },
];
const LISTE_HAVUZ = ['top', 'minder', 'havuc', 'su-spreyi', 'pelus-ayi', 'kum-saati', 'tuy-degnek', 'kemik-biskuvi'];
/** Bu ziyaretin listesi (sırayla döner) ve rafta duran 6 seçenek (cevap dahil; sıra karışık) */
export function listeSec(kacinci: number, rastgele: () => number = Math.random): { liste: Liste; secenekler: string[] } {
  const liste = LISTELER[kacinci % LISTELER.length];
  const oteki = LISTE_HAVUZ.filter((e) => e !== liste.cevap);
  // şaka eşyaları (sprey, peluş, kum saati) hep rafta: yanlış seçim komik olsun
  const sakalar = ['su-spreyi', 'pelus-ayi', 'kum-saati'].filter((e) => e !== liste.cevap);
  const kalan = oteki.filter((e) => !sakalar.includes(e));
  const secenekler = [liste.cevap, ...sakalar, ...kalan].slice(0, 6);
  for (let i = secenekler.length - 1; i > 0; i--) {
    const j = Math.floor(rastgele() * (i + 1));
    [secenekler[i], secenekler[j]] = [secenekler[j], secenekler[i]];
  }
  return { liste, secenekler };
}
export type ListeSonucu = 'buldun' | 'islandim' | 'sarilir' | 'kum' | 'olmadi';
export function listeSonucu(l: Liste, esya: string): ListeSonucu {
  if (esya === l.cevap) return 'buldun';
  if (esya === 'su-spreyi') return 'islandim';
  if (esya === 'pelus-ayi') return 'sarilir';
  if (esya === 'kum-saati') return 'kum';
  return 'olmadi';
}

// ---------------------------------------------------------------- parti
export type Muzik = 'hizli' | 'yavas' | 'komik';
export type DansTepkisi = 'dans' | 'deli' | 'saklan' | 'paytak' | 'esne';
/** Her hayvan her müziğe aynı tepkiyi vermez: Tospik yalnız yavaşta dans eder, Fındık hızlıda deli gibi, ördek komikte paytak */
export function dansTepkisi(id: string, m: Muzik): DansTepkisi {
  const t = tur(id);
  if (t === 'kaplumbaga') return m === 'yavas' ? 'dans' : 'saklan';
  if (t === 'kopek') return m === 'hizli' ? 'deli' : 'dans';
  if (t === 'ordek' || t === 'civciv') return m === 'komik' ? 'paytak' : 'dans';
  if (t === 'kedi') return m === 'komik' ? 'esne' : 'dans';
  if (t === 'tavsan') return m === 'hizli' ? 'deli' : 'dans';
  return 'dans';
}
/** Müziğin vuruşu (ms) ve vuruş sayısı */
export const MUZIK: Record<Muzik, { aralik: number; vurus: number }> = { hizli: { aralik: 250, vurus: 16 }, yavas: { aralik: 620, vurus: 7 }, komik: { aralik: 400, vurus: 10 } };

// ---------------------------------------------------------------- gece misafiri Diken
export const DIKEN_TABAK = ['kedi-mamasi', 'elma', 'su-kabi', 'sut-kasesi'] as const;
export type DikenSonucu = 'sever' | 'olur' | 'sevmez';
export const dikenSonucu = (e: string): DikenSonucu => (e === 'kedi-mamasi' || e === 'su-kabi' ? 'sever' : e === 'elma' ? 'olur' : 'sevmez');
