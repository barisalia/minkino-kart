// "Lokum'un Hece Köprüsü"nün sözcük seçimi (saf; tests/unit/alfabe-hece-koprusu.test.ts sınar).
// Sözcükler sözcük havuzundan (sozcuk-havuzu.ts), yalnız resmi gelmiş, hece birleştirmeye uygun ve bütün harfleri çocuğun
// bitirdiği harflerden olanlar. 4 yaş iki heceli, 5+ iki ve üç heceli sözcükler; 2–3 yaşta durak yok.
// Bir oturumda 3 sözcük, hiçbiri iki kez gelmez; önce en uzun süredir görülmeyenler.
import type { HavuzSozcugu } from './sozcuk-havuzu';

export type KopruYasi = '4' | '5+';
export const OTURUM_SOZCUK = 3;

/** Bu yaşta ve bu harflerle kurulabilecek sözcükler. bilinen: çocuğun bitirdiği küçük harfler. */
export function kopruAdaylari(havuz: readonly HavuzSozcugu[], bilinen: ReadonlySet<string>, yas: KopruYasi): HavuzSozcugu[] {
  return havuz.filter(s => s.pano && (yas === '4' ? s.heceler.length === 2 : s.heceler.length >= 2 && s.heceler.length <= 3) &&
    [...s.heceler.join('').toLocaleLowerCase('tr')].every(h => bilinen.has(h)));
}

/** Oturumun sözcükleri: hiç görülmemişler önce, sonra en eski görülenler. gorulen: sözcük → son görüldüğü oturum. */
export function kopruOturumu(adaylar: readonly HavuzSozcugu[], gorulen: Readonly<Record<string, number>>, rastgele = Math.random): HavuzSozcugu[] {
  const karisik = [...adaylar].map(s => ({ s, r: rastgele() })).sort((a, b) => (gorulen[a.s.id] ?? -1) - (gorulen[b.s.id] ?? -1) || a.r - b.r);
  return karisik.slice(0, OTURUM_SOZCUK).map(x => x.s);
}

/** Yanlış taş: oturumun başka bir sözcüğünden, bu sözcükte olmayan bir hece (yoksa undefined). */
export function yanlisHece(sozcuk: HavuzSozcugu, oturum: readonly HavuzSozcugu[], rastgele = Math.random): string | undefined {
  const aday = [...new Set(oturum.filter(s => s.id !== sozcuk.id).flatMap(s => s.heceler))].filter(h => !sozcuk.heceler.includes(h));
  return aday.length ? aday[Math.floor(rastgele() * aday.length)] : undefined;
}
