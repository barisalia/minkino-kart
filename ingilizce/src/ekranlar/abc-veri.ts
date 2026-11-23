/**
 * Polly's ABC · DOM'suz veri: 26 harf, her harfin sözcüğü (resmi), Polly'nin sözleri, oturum planı.
 * Harfin sesi okul öncesi phonics geleneğinde kısa sestir (A /æ/ apple, E /ɛ/ elephant, I /ɪ/ igloo, O /ɒ/ octopus,
 * U /ʌ/ umbrella). X sözcük başında bu yaşa uygun değil: "X is in fox" (ses sözcüğün sonunda).
 * İnsan figürü yok (Q quilt, queen değil); çilek yok.
 */
import type { SesMetni } from '../icerik';
import type { Yas } from '../plan';

export interface AbcHarf {
  /** küçük harf, ses ve kayıt kimliği: 'a' */
  id: string;
  /** sözcük (İngilizce) ve resmi: var olan `kelime/<resim>` ya da yeni `abc/<resim>` */
  soz: string;
  resim: string;
  /** Türkçe karşılığı (veli ve test için) */
  tr: string;
  /** X gibi: ses sözcüğün sonunda */
  sonda?: true;
}

export const ABC: readonly AbcHarf[] = [
  { id: 'a', soz: 'apple', resim: 'kelime/apple', tr: 'elma' },
  { id: 'b', soz: 'ball', resim: 'kelime/ball', tr: 'top' },
  { id: 'c', soz: 'cat', resim: 'kelime/cat', tr: 'kedi' },
  { id: 'd', soz: 'dog', resim: 'kelime/dog', tr: 'köpek' },
  { id: 'e', soz: 'elephant', resim: 'kelime/elephant', tr: 'fil' },
  { id: 'f', soz: 'fish', resim: 'kelime/fish', tr: 'balık' },
  { id: 'g', soz: 'goat', resim: 'kelime/goat', tr: 'keçi' },
  { id: 'h', soz: 'hat', resim: 'kelime/hat', tr: 'şapka' },
  { id: 'i', soz: 'igloo', resim: 'abc/igloo', tr: 'iglo' },
  { id: 'j', soz: 'jacket', resim: 'kelime/jacket', tr: 'ceket' },
  { id: 'k', soz: 'kite', resim: 'kelime/kite', tr: 'uçurtma' },
  { id: 'l', soz: 'lion', resim: 'kelime/lion', tr: 'aslan' },
  { id: 'm', soz: 'milk', resim: 'kelime/milk', tr: 'süt' },
  { id: 'n', soz: 'nose', resim: 'kelime/nose', tr: 'burun' },
  { id: 'o', soz: 'octopus', resim: 'kelime/octopus', tr: 'ahtapot' },
  { id: 'p', soz: 'pig', resim: 'kelime/pig', tr: 'domuz' },
  { id: 'q', soz: 'quilt', resim: 'abc/quilt', tr: 'yorgan' },
  { id: 'r', soz: 'robot', resim: 'kelime/robot', tr: 'robot' },
  { id: 's', soz: 'sun', resim: 'kelime/sun', tr: 'güneş' },
  { id: 't', soz: 'train', resim: 'kelime/train', tr: 'tren' },
  { id: 'u', soz: 'umbrella', resim: 'abc/umbrella', tr: 'şemsiye' },
  { id: 'v', soz: 'van', resim: 'abc/van', tr: 'minibüs' },
  { id: 'w', soz: 'whale', resim: 'kelime/whale', tr: 'balina' },
  { id: 'x', soz: 'fox', resim: 'kelime/fox', tr: 'tilki', sonda: true },
  { id: 'y', soz: 'yo-yo', resim: 'abc/yo-yo', tr: 'yoyo' },
  { id: 'z', soz: 'zebra', resim: 'kelime/zebra', tr: 'zebra' },
];

export const abcBul = (id: string) => ABC.find((h) => h.id === id);
const buyuk = (s: string) => s.toUpperCase();

/** Bir harfin turu: tanıtım (2–3 yaş yalnız bu), 4 yaş + "üç resimden bul", 5+ + "büyük harfin küçüğünü bul" */
export interface AbcTuru {
  harf: string;
  /** 4 yaş ve üstü: üç resim (biri harfin sözcüğü), karışık */
  bul?: string[];
  /** 5+: üç küçük harf (biri doğru), karışık */
  eslestir?: string[];
}
type Rnd = () => number;
const karistir = <T>(l: readonly T[], rnd: Rnd): T[] => { const a = [...l]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
/** Birbirine benzeyen küçük harfler: eşleştirmede çeldirici olarak öne alınır */
const BENZER: Record<string, string> = { b: 'd', d: 'b', p: 'q', q: 'p', m: 'n', n: 'm', u: 'n', i: 'j', j: 'i', v: 'w', w: 'v', c: 'o', o: 'c' };

/**
 * Bir oturum: sıradaki `adet` harf (alfabe sırasıyla, `bas` harfinden). Bul turunda çeldiriciler başka harflerin
 * sözcükleri; aynı ses iki kez gelmez. Eşleştirmede bir çeldirici benzer harf (b/d, p/q, m/n …).
 */
export function abcPlani(yas: Yas, bas = 0, adet = 3, rnd: Rnd = Math.random): AbcTuru[] {
  const turlar: AbcTuru[] = [];
  for (let k = 0; k < adet; k++) {
    const h = ABC[(bas + k) % ABC.length];
    const t: AbcTuru = { harf: h.id };
    if (yas !== '2-3') {
      const diger = karistir(ABC.filter((x) => x.id !== h.id && x.soz[0] !== h.soz[0]), rnd).slice(0, 2).map((x) => x.id);
      t.bul = karistir([h.id, ...diger], rnd);
    }
    if (yas === '5+') {
      const benzer = BENZER[h.id];
      const havuz = karistir(ABC.map((x) => x.id).filter((x) => x !== h.id && x !== benzer), rnd);
      t.eslestir = karistir([h.id, benzer ?? havuz[1], havuz[0]], rnd);
    }
    turlar.push(t);
  }
  return turlar;
}

// ---------------------------------------------------------------- sesler (her biri ayrı ElevenLabs isteği)

/** Ses motoru tek harfi yanlış okuyor ("U." → "uh", "Y." → "yeah"): harf adı okunuşuyla yazılır. */
const AD_OKUNUS: Record<string, string> = { u: 'You.', y: 'Why.' };
const hece = (s: string) => Math.max(1, (s.toLowerCase().match(/[aeiouy]+/g) ?? []).length);
const polly = (id: string, metin: string): SesMetni => ({ id: `en/${id}`, kim: 'polly', dil: 'en', metin, hece: hece(metin) });
/**
 * Harf başına üç kayıt: adı ("B."), sesi (sözcük kaydının başından kesilir: `en/abc-ses-<h>`, ayrı betik), cümlesi
 * ("B is for ball."). Sözcüğün kendisi: var olan `en/w-<soz>` kaydı; yeni sözcükler için `en/w-<soz>`.
 */
export function abcSesMetinleri(): SesMetni[] {
  return [
    { id: 'tr/c-abc-giris', kim: 'ceren', dil: 'tr', metin: 'Polly sana İngilizce harfleri öğretecek. Her harfin bir adı, bir de sesi var. Dinle ve tekrar et!', hece: 32 },
    polly('g-abc-hello', 'Let’s learn the ABC!'),
    polly('g-abc-which', 'Which one starts with this sound?'),
    polly('g-abc-which-x', 'Which one has this sound?'),
    polly('g-abc-small', 'Find the small letter!'),
    ...ABC.flatMap((h) => [
      polly(`abc-ad-${h.id}`, AD_OKUNUS[h.id] ?? `${buyuk(h.id)}.`),
      polly(`abc-cumle-${h.id}`, h.sonda ? `X is in fox.` : `${buyuk(h.id)} is for ${h.soz}.`),
    ]),
    ...['igloo', 'quilt', 'umbrella', 'van', 'yo-yo'].map((w) => polly(`w-${w}`, `${w.charAt(0).toUpperCase()}${w.slice(1)}.`)),
  ];
}
/** Sesin kaydı: sözcüğün başından (X: sonundan) kesilmiş kısa ses */
export const sesKaydi = (h: AbcHarf) => `en/abc-ses-${h.id}`;
export const sozKaydi = (h: AbcHarf) => `en/w-${h.soz}`;
/** Bir oturumun çaldığı kayıtlar */
export function abcSesleri(turlar: readonly AbcTuru[]): string[] {
  const idler = new Set(['en/g-abc-hello', 'en/g-yes', 'en/g-no', 'en/g-great-job']);
  for (const t of turlar) {
    const h = abcBul(t.harf)!;
    [`en/abc-ad-${h.id}`, sesKaydi(h), `en/abc-cumle-${h.id}`, sozKaydi(h)].forEach((x) => idler.add(x));
    if (t.bul) { idler.add(h.sonda ? 'en/g-abc-which-x' : 'en/g-abc-which'); t.bul.forEach((x) => idler.add(sozKaydi(abcBul(x)!))); }
    if (t.eslestir) idler.add('en/g-abc-small');
  }
  return [...idler];
}

// ---------------------------------------------------------------- Alphabet Train

/** 5+ yaş eksik vagon turu: beş ardışık harf, biri boş (uçlarda değil); üç seçenek (biri doğru, ikisi dizide yok) */
export interface TrenTuru { dizi: string[]; eksik: string; secenekler: string[] }
export function trenEksikTurlari(adet = 3, rnd: Rnd = Math.random): TrenTuru[] {
  const turlar: TrenTuru[] = [];
  const kullanilan = new Set<number>();
  while (turlar.length < adet) {
    const bas = Math.floor(rnd() * (ABC.length - 4));
    if ([...kullanilan].some((k) => Math.abs(k - bas) < 5)) { if (kullanilan.size > 4) kullanilan.clear(); continue; }
    kullanilan.add(bas);
    const dizi = ABC.slice(bas, bas + 5).map((x) => x.id);
    const eksik = dizi[1 + Math.floor(rnd() * 3)];
    const diger = karistir(ABC.map((x) => x.id).filter((x) => !dizi.includes(x)), rnd).slice(0, 2);
    turlar.push({ dizi, eksik, secenekler: karistir([eksik, ...diger], rnd) });
  }
  return turlar;
}
/** Trenin sözleri (her biri ayrı kayıt) */
export function trenSesMetinleri(): SesMetni[] {
  return [
    { id: 'tr/c-tren-giris', kim: 'ceren', dil: 'tr', metin: 'Alfabe treni geldi! Vagonlara dokun, Polly her harfi söylesin.', hece: 20 },
    polly('g-tren-aboard', 'All aboard the Alphabet Train!'),
    polly('g-tren-missing', 'Oh no! Which letter is missing?'),
    polly('g-tren-go', 'Choo choo! Here we go!'),
  ];
}
export const trenSesleri = (): string[] => [...trenSesMetinleri().map((s) => s.id), ...ABC.map((x) => `en/abc-ad-${x.id}`), 'en/g-yes', 'en/g-no', 'en/g-great-job'];
