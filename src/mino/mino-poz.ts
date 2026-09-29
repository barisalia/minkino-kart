/**
 * Mino'nun poz mantığı (DOM'suz; src/mino/mino.ts ve film/src/oyuncu.ts kullanır, birim testli).
 * Çizimler: ekip/mino/IFADELER.md "Kalkık kollar", "Oturma", "Film 3" → scripts/mino/rig.mjs → mino-poz-svg.ts (tembel).
 */

/** Tam beden pozları: düşünüyor (sağ pati çenede, göz yukarıda, "hımm" ağzı), işaret (kalkık kol + o yana bakan gözler), sarılma */
export type MinoPoz = 'dusun' | 'isaret-sag' | 'isaret-sol' | 'sarilma';
/** Ekranda sol / sağ kol (kol-sol: 840,1290 omzu; kol-sag: 1205,1290) */
export type MinoKolYan = 'sol' | 'sag';

/** Asıl kollar bundan fazla kalkınca kol ucunda kontur izi görünüyor (çizimin bilinen sınırı) */
export const KOL_EN_COK = 24;
/** Asıl kol içe en çok bu kadar */
export const KOL_EN_AZ = -8;
/** Bu açıyı geçince asıl kol gizlenir, kalkık kol (kol-*-yukari) aynı açıyla görünür */
export const KOL_YUKARI_ESIK = 30;
/** Kalkık kolun çizildiği en büyük açı */
export const KOL_YUKARI_EN_COK = 160;
/** İşaret pozunda kalkık kolun açısı */
export const ISARET_ACI = 85;
/** Oturunca bütün karakter bu kadar (çizim birimi) aşağı iner: oturan gövdenin zemini 1845, ayaktayken 1895 */
export const OTUR_Y = 50;
/** Oturan kuyruğun kökü (kuyruk-oturma: translate(-110,40) rotate(40 1260 1680)); oturunca kuyruk buradan sallanır */
export const KUYRUK_OTUR = { x: 1150, y: 1720 };

const sinirla = (a: number, en: number, cok: number) => Math.max(en, Math.min(cok, a));

/**
 * Kolun o karedeki çizimi. poz: kol() ya da işaretin verdiği temel açı (0: yok; eski davranış: kol hiç 24°'yi geçmez),
 * hareket: bekleme + tepki + duruş eklemesi, yukariVar: kalkık kol çizimi yüklü mü.
 * Poz varken toplam açı KOL_YUKARI_ESIK'i geçerse kalkık kol (en çok 160°), yoksa asıl kol (-8 … 24°).
 */
export function kolCoz(poz: number, hareket: number, yukariVar = true): { yukari: boolean; aci: number } {
  const a = poz + hareket;
  if (poz && yukariVar && a > KOL_YUKARI_ESIK) return { yukari: true, aci: Math.min(KOL_YUKARI_EN_COK, a) };
  return { yukari: false, aci: sinirla(a, KOL_EN_AZ, KOL_EN_COK) };
}

/** Pozun kendi kol açısı (işaret: o yandaki kol 85°; diğerleri 0) */
export function pozKolu(poz: MinoPoz | null, yan: MinoKolYan): number {
  return poz === `isaret-${yan}` ? ISARET_ACI : 0;
}

/**
 * Film duruşunun (film/src/oyuncu.ts → durus) Mino'ya özgü alanları; Kino'nun (önden karakter) alanlarıyla aynı adlar:
 * otur (1: oturur), yukSol / yukSag (kol açısı; 30°'yi geçince kalkık kol), dusun (1: düşünüyor), bakan (-1 sola / 1 sağa
 * bakan göz; kol kalkmaz, kolu yukSol / yukSag verir), saril (1: sarılma; yalnız Mino).
 */
export const MINO_POZ_ALAN = ['otur', 'yukSol', 'yukSag', 'dusun', 'bakan', 'saril'] as const;

export interface MinoDurusPozu {
  otur?: boolean;
  yukSol?: number;
  yukSag?: number;
  /** undefined: duruşta poz alanı yok (dokunulmaz); null: poz yok */
  poz?: MinoPoz | null;
}

/** Duruş değerlerinden Mino pozu (yalnız verilmiş alanlar; öncelik: sarılma > düşünme > bakış) */
export function durusPozu(d: Record<string, number>): MinoDurusPozu {
  const r: MinoDurusPozu = {};
  if (typeof d.otur === 'number') r.otur = d.otur > 0.5;
  if (typeof d.yukSol === 'number') r.yukSol = d.yukSol;
  if (typeof d.yukSag === 'number') r.yukSag = d.yukSag;
  if (['saril', 'dusun', 'bakan'].some((k) => typeof d[k] === 'number')) {
    const bakan = d.bakan ?? 0;
    r.poz = (d.saril ?? 0) > 0.5 ? 'sarilma' : (d.dusun ?? 0) > 0.5 ? 'dusun' : bakan > 0.5 ? 'isaret-sag' : bakan < -0.5 ? 'isaret-sol' : null;
  }
  return r;
}
