/**
 * Oyunlu filmin seslendirmesi (saf mantık; Web Audio yok, birim testleri buradan sınar).
 *
 * Replik metinleri ElevenLabs'e ses etiketleriyle verildi ("[yawns] Günaydın, Lokum!"; ekip/film/seri-2/SESLER.md).
 * - Etiketler seste duyulur, altyazıda görünmez (etiketsiz).
 * - Bedeni oynatan etiketlerin (esneme, gülme, hapşırma, şaşırma) sözün içindeki yaklaşık anı metindeki yerinden
 *   kestirilir: etiketin kendi ses süresi + kalan süre harflere bölünür (etiketZamanlari). Basit ve yaklaşık.
 * - Ağız: sesin genliğinden çıkan şekil (src/audio/dudak-mantik.ts) kitin 8 ağzından birine çevrilir (agizSec).
 */
import type { AgizSekli } from '../../../src/audio/dudak-mantik';
import { kolKaldir, type Durus } from './aktor';

/** altyazı: köşeli parantezli ses etiketleri silinir */
export function etiketsiz(metin: string): string {
  return metin
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,!?…])/g, '$1')
    .trim();
}

export type EtiketTur = 'esne' | 'gul' | 'hapsu' | 'sasir';
export interface EtiketAralik {
  tur: EtiketTur;
  /** sözün içindeki saniye */
  bas: number;
  son: number;
  /** hareketin büyüklüğü (kıkırdama gülmeden küçük) */
  guc: number;
}
/** ses: etiketin seste kapladığı süre (sn); beden: hareketin en kısa süresi */
const ETIKET: Record<string, { tur: EtiketTur; ses: number; beden: number; guc: number }> = {
  yawns: { tur: 'esne', ses: 0.9, beden: 0.9, guc: 1 },
  laughs: { tur: 'gul', ses: 0.7, beden: 0.7, guc: 1 },
  'laughs harder': { tur: 'gul', ses: 0.9, beden: 0.9, guc: 1.2 },
  giggles: { tur: 'gul', ses: 0.6, beden: 0.6, guc: 0.75 },
  chuckles: { tur: 'gul', ses: 0.45, beden: 0.45, guc: 0.5 },
  sneezes: { tur: 'hapsu', ses: 0.7, beden: 0.9, guc: 1 },
  gasps: { tur: 'sasir', ses: 0.3, beden: 0.6, guc: 1 },
  surprised: { tur: 'sasir', ses: 0, beden: 0.6, guc: 0.7 },
};
/** kırpılmış kaydın baştaki ve sondaki payı (scripts/film/oyunlu-ses.mjs) */
const ON = 0.03, SON = 0.1;

/** etiketli metin ve sesin süresi → bedeni oynatan etiketlerin aralıkları */
export function etiketZamanlari(sesMetni: string, sure: number): EtiketAralik[] {
  const parcalar = sesMetni.split(/(\[[^\]]*\])/).filter((p) => p.trim());
  const harf = (p: string) => p.replace(/[\s.,!?…'’]/g, '').length;
  let etiketSes = 0, harfler = 0;
  for (const p of parcalar) {
    const e = p.startsWith('[') ? ETIKET[p.slice(1, -1).trim().toLowerCase()] : undefined;
    if (e) etiketSes += e.ses;
    else if (!p.startsWith('[')) harfler += harf(p);
  }
  const kullan = Math.max(0.1, sure - ON - SON);
  // etiketler sürenin en çok %60'ını alır; kalan harflere eşit bölünür
  const olcek = etiketSes > kullan * 0.6 ? (kullan * 0.6) / etiketSes : 1;
  const harfSn = harfler ? (kullan - etiketSes * olcek) / harfler : 0;
  const sonuc: EtiketAralik[] = [];
  let t = ON;
  for (const p of parcalar) {
    if (!p.startsWith('[')) {
      t += harf(p) * harfSn;
      continue;
    }
    const e = ETIKET[p.slice(1, -1).trim().toLowerCase()];
    if (!e) continue;
    const s = e.ses * olcek;
    sonuc.push({ tur: e.tur, bas: t, son: Math.min(sure, t + Math.max(s, e.beden)), guc: e.guc });
    t += s;
  }
  return sonuc;
}

/** sözün x. saniyesinde süren beden etiketi (yoksa null) */
export function etiketAn(etiketler: readonly EtiketAralik[], x: number): EtiketAralik | null {
  for (const e of etiketler) if (x >= e.bas && x < e.son) return e;
  return null;
}

/**
 * Sesten çıkan ağız şekli → kitin ağzı (8 ağız: gulumse, az, orta, genis, o, e, kahkaha, uzgun). guc: o anın
 * genliği (sözün tepesine göre 0..1). Gülerken ve esnerken ağız kocaman açılır.
 */
export function agizSec(sekil: AgizSekli, guc: number, etiket: EtiketTur | null = null): string {
  const sessiz = sekil === 'kapali' || sekil === 'gulumse';
  if (etiket === 'gul' && !sessiz) return guc > 0.35 ? 'agiz-kahkaha' : 'agiz-genis';
  if (etiket === 'esne') return guc > 0.25 ? 'agiz-kahkaha' : 'agiz-o';
  if (etiket === 'hapsu' && !sessiz) return guc > 0.5 ? 'agiz-genis' : 'agiz-o';
  switch (sekil) {
    case 'az':
      return 'agiz-az';
    case 'orta':
      return guc > 0.72 ? 'agiz-genis' : 'agiz-orta';
    case 'yuvarlak':
      return 'agiz-o';
    case 'dis':
      return 'agiz-e';
    default:
      return 'agiz-gulumse';
  }
}

const yumusak = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));

/**
 * Etiketin bedeni (konuşanın duruşuna eklenir): esneme (kollar gerinir, gözler kapanır), gülme ve kıkırdama
 * (omuzlar ve kafa sarsılır), hapşırma (kafa geri, sonra öne), şaşırma (kaşlar kalkar). haric: sahnenin kendi
 * hareketi olan etiketler (ör. yatakta esneyen Kino).
 */
export function etiketBedeni(d: Durus, etiketler: readonly EtiketAralik[], x: number, oran = 1, haric: readonly EtiketTur[] = []) {
  const e = etiketAn(etiketler, x);
  if (!e || haric.includes(e.tur)) return;
  const u = (x - e.bas) / Math.max(0.05, e.son - e.bas);
  const zarf = Math.min(1, u / 0.18, (1 - u) / 0.22);
  const g = Math.max(0, zarf) * e.guc * oran;
  if (g <= 0) return;
  const y = x - e.bas;
  if (e.tur === 'esne') {
    const a = yumusak(Math.min(1, u / 0.35)) * yumusak(Math.min(1, (1 - u) / 0.3)) * oran;
    kolKaldir(d, 'sag', a, 140, 30);
    kolKaldir(d, 'sol', a, 140, 30);
    d.govdeSy += 0.03 * a;
    d.kafaA += -6 * a;
    d.kafaY += -10 * a;
    d.kulakSag -= 14 * a;
    d.kulakSol += 14 * a;
    d.gozler = 'gozler-kapali';
    d.kaslar = 'kaslar-kalkik';
  } else if (e.tur === 'gul') {
    // omuzlar hızla iner-kalkar, kafa geriye hafif sallanır
    const s = Math.sin(2 * Math.PI * 7.5 * y);
    d.govdeSy += 0.014 * s * g;
    d.kafaY += -7 * Math.abs(s) * g - 6 * g;
    d.kafaA += -3 * g + 2.2 * Math.sin(2 * Math.PI * 3.5 * y) * g;
    d.kolSag += 6 * s * g;
    d.kolSol -= 6 * s * g;
    d.gozler = 'gozler-mutlu';
  } else if (e.tur === 'hapsu') {
    // %60 nefes alır (kafa geri, gözler kısılır), sonra patlar (kafa öne)
    const al = yumusak(u / 0.6) * (1 - yumusak((u - 0.6) / 0.08));
    const at = u >= 0.6 ? Math.exp(-(u - 0.6) * 9) : 0;
    d.kafaA += (-5 * al + 7 * at) * oran;
    d.kafaY += (-22 * al + 28 * at) * oran;
    d.govdeA += 3 * at * oran;
    d.gozler = 'gozler-kapali';
    d.kaslar = 'kaslar-kalkik';
  } else {
    d.kaslar = 'kaslar-kalkik';
    d.kafaY += -6 * g;
    if (e.guc >= 1) d.gozler = 'gozler-saskin';
  }
}
