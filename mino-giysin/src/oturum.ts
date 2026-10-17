/**
 * Bir oturumun durumu (ekranlar arası; kaydedilmez): Mino'nun kostümü, seçili dert, çözülen dertler (odaya gelen
 * arkadaşlar), ıslak şakanın olup olmadığı. Kalıcı olan yalnız yıldızlar ve yaş (kayit.ts).
 */
import { durum } from '../../src/engine/ilerleme';
import { kilitli } from '../../src/engine/erisim';
import { kayit } from './kayit';
import { DERTLER, yasGrubu, type Dert, type Giyili, type YasGrubu } from './model';

export interface Oturum {
  giyili: Giyili;
  secili: Dert | null;
  cozulen: Dert[];
  suSakasi: boolean;
  /** son komik yorum sırası (aynı cümle art arda gelmesin) */
  karisikSira: number;
  degisimSira: number;
  olmadiSira: number;
  /** kapıya ilk kez alet olmadan dokunuldu mu (şaka bir kez söylenir, sonra kısa tepki) */
  parti: boolean;
  /** bu oturumda oynayan kostüm ek anları ve şakaları ('pamuk:merdiven:sapka', 'saka:itfaiye' …; §4a) */
  kostumAnlari: string[];
}

export const oturum: Oturum = { giyili: {}, secili: null, cozulen: [], suSakasi: false, karisikSira: 0, degisimSira: 0, olmadiSira: 0, parti: false, kostumAnlari: [] };

export function oturumuSifirla() {
  oturum.secili = null;
  oturum.cozulen = [];
  oturum.parti = false;
}

/** Çocuğun yaşı: ?yas= (test / önizleme), yoksa ortak profil, yoksa son kayıt, yoksa 4 */
export function yas(): number {
  const q = new URLSearchParams(location.search).get('yas');
  if (q && +q >= 3 && +q <= 6) return +q;
  return durum.i.yas ?? kayit.yas ?? 4;
}
export const grup = (): YasGrubu => yasGrubu(yas());

/** Kilitsiz dertler (uygulamada abonelik yoksa yalnız Pamuk ve Kino; web'de hepsi) */
export const dertKilitli = (d: Dert) => kilitli(`mino-giysin/${d}`);
export const acikDertler = (): Dert[] => DERTLER.filter((d) => !dertKilitli(d));
