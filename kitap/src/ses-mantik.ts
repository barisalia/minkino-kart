/**
 * Kitap seslendirmesinin saf kısmı (fs/ağ/DOM yok): kayıt anahtarı ve ElevenLabs zaman damgalarından kelime anları.
 * Hem üretim betiği (scripts/kitap-seslendir.ts) hem kitap (kitap/src/kitap-ses.ts) hem birim testleri kullanır.
 */
import type { Kim } from './tipler';

/** public/ses/kitap/manifest.json */
export interface KitapSesManifest {
  surum: 1;
  /** satirAnahtari → kayıt */
  satirlar: Record<string, KitapSesKaydi>;
}

export interface KitapSesKaydi {
  /** public/ses/kitap/ altındaki dosya */
  d: string;
  /** Üretim imzası (ses özeti, model, ayarlar): değişince yeniden üretilir */
  i: string;
  /** Kaydın süresi (ms) */
  s: number;
  /** Etiketsiz metnin her kelimesinin başladığı an (ms, kaydın başından) */
  k: number[];
}

/** Kayıt anahtarı: konuşan + boşlukları sadeleştirilmiş metin (aynı söz farklı seste ayrı kayıttır) */
export const satirAnahtari = (kim: Kim | string, metin: string) => `${kim}|${metin.replace(/\s+/g, ' ').trim()}`;

/** Metindeki kelimeler (ses etiketleri hariç) ve özgün metindeki yerleri; kitap/src/metin.ts kelimeler() ile aynı sıra */
export function kelimeYerleri(metin: string): { k: string; yer: number }[] {
  const c: { k: string; yer: number }[] = [];
  for (const e of metin.matchAll(/\[[^\]]*\]|[^\s[]+(?:\[[^\]]*\][^\s[]*)*/g)) if (!e[0].startsWith('[')) c.push({ k: e[0], yer: e.index! });
  return c;
}

/** ElevenLabs with-timestamps → alignment */
export interface Hizalama {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

const harfMi = (c: string) => /[\p{L}\p{N}]/u.test(c);
const kucuk = (c: string) => c.toLocaleLowerCase('tr');

/**
 * Her kelimenin başladığı an (ms). Hizalama metni gönderilenle birebir aynıysa doğrudan yer eşlenir; değilse
 * (model metni sadeleştirdiyse) harf harf eşlenir. Bulunamayan kelime öncekinden biraz sonra sayılır.
 */
export function kelimeAnlari(metin: string, h: Hizalama): number[] {
  const yerler = kelimeYerleri(metin);
  const bas = h.character_start_times_seconds;
  const ayni = h.characters.join('') === metin;
  // özgün metindeki her harf yeri → hizalamadaki sırası
  const esle = new Map<number, number>();
  if (ayni) for (let i = 0; i < metin.length; i++) esle.set(i, i);
  else {
    // etiketlerin harfleri (giggles) eşlenmez: model onları seslendirir ya da hiç yazmaz
    const etiket = new Set<number>();
    for (const e of metin.matchAll(/\[[^\]]*\]/g)) for (let i = e.index!; i < e.index! + e[0].length; i++) etiket.add(i);
    let j = 0;
    for (let i = 0; i < metin.length && j < h.characters.length; i++) {
      if (!harfMi(metin[i]) || etiket.has(i)) continue;
      let ara = j;
      while (ara < h.characters.length && kucuk(h.characters[ara]) !== kucuk(metin[i])) ara++;
      if (ara < h.characters.length && ara - j < 12) {
        esle.set(i, ara);
        j = ara + 1;
      }
    }
  }
  const anlar: number[] = [];
  for (const w of yerler) {
    let t: number | undefined;
    for (let i = w.yer; i < w.yer + w.k.length; i++) {
      const a = esle.get(i);
      if (a !== undefined && harfMi(metin[i])) {
        t = bas[a];
        break;
      }
    }
    const once = anlar.at(-1) ?? 0;
    anlar.push(Math.max(once, Math.round((t ?? once / 1000 + 0.25) * 1000)));
  }
  return anlar;
}

/** Konuşmanın bittiği an (ms): son harfin bitişi */
export function konusmaSonu(h: Hizalama): number {
  for (let i = h.characters.length - 1; i >= 0; i--) if (harfMi(h.characters[i])) return Math.round(h.character_end_times_seconds[i] * 1000);
  return 0;
}

/** Çalan kaydın şu anki kelimesi (an ms): başlamış en son kelime */
export function simdikiKelime(anlar: number[], ms: number): number {
  let j = 0;
  while (j + 1 < anlar.length && anlar[j + 1] <= ms) j++;
  return j;
}
