/** Kino'nun Otobüsü ilerlemesi (yalnız bu cihazda; localStorage, hata olursa sessizce bellekte kalır). */
import { BOYA, bosAcilan, GUN_SAYISI, ODUL_KATALOGU, type Acilan, type Gun, type Sus, type Tat, type Yas } from './model';

const ANAHTAR = 'minkino-kino-otobus-v1';

export interface OtobusKayit {
  /** oynanabilen en yüksek gün (1-3) */
  acikGun: number;
  /** bitirilen günler */
  biten: number[];
  /** ödülle açılanlar: tat, süs, görünüm (V3 §5; jeton artık birikmez) */
  acilan: Acilan;
  /** otobüsün boyası (BOYA anahtarı; asıl renk buz mavisi) */
  boya: string;
  /** yaş ayarı (ilk açılışta seçilir; ebeveyn değiştirebilir) */
  yas: Yas | null;
  /** her günün en çok mutlu müşterisi */
  mutlu: Record<string, number>;
  /** son oyunlarda gelen müşteriler (önce gelmeyenler seçilir), en yenisi sonda */
  gorulen: string[];
  /** bugünün özel tadı (iki ya da daha çok yeni tat açıldıysa sabah seçilir) */
  ozelTat: Tat | null;
  /** dün açılan (ertesi gün bir müşteri onu ister); oynanınca silinir */
  yeni: { tat?: Tat; sus?: Sus } | null;
}

/** Görülen listesinde tutulan müşteri sayısı (son iki oyun) */
export const GORULEN_EN_COK = 10;

const bos = (): OtobusKayit => ({ acikGun: 1, biten: [], acilan: bosAcilan(), boya: 'buz', yas: null, mutlu: {}, gorulen: [], ozelTat: null, yeni: null });
const gunMu = (g: unknown) => typeof g === 'number' && Number.isInteger(g) && g >= 1 && g <= GUN_SAYISI;
const listeden = <T extends string>(v: unknown, izinli: readonly T[]): T[] => (Array.isArray(v) ? [...new Set(v.filter((x): x is T => typeof x === 'string' && izinli.includes(x as T)))] : []);

export function kayitCoz(ham: string | null | undefined): OtobusKayit {
  if (!ham) return bos();
  try {
    const k = JSON.parse(ham) as Partial<OtobusKayit> & { alinan?: unknown; jeton?: unknown };
    const mutlu: Record<string, number> = {};
    if (k.mutlu && typeof k.mutlu === 'object') for (const [g, n] of Object.entries(k.mutlu)) if (gunMu(Number(g))) mutlu[g] = Math.max(0, Math.min(5, Math.floor(Number(n) || 0)));
    const a = (k.acilan ?? {}) as Partial<Acilan>;
    // eski kayıt (V2): dükkândan alınan süsler görünüme geçer; jeton bırakılır
    const gorunum = listeden([...(Array.isArray(a.gorunum) ? a.gorunum : []), ...(Array.isArray(k.alinan) ? k.alinan : [])], ODUL_KATALOGU.gorunum);
    const tat = listeden(a.tat, ODUL_KATALOGU.tat);
    const sus = listeden(a.sus, ODUL_KATALOGU.sus);
    const y = k.yeni && typeof k.yeni === 'object' ? k.yeni : null;
    const yeni = y && (ODUL_KATALOGU.tat.includes(y.tat as Tat) || ODUL_KATALOGU.sus.includes(y.sus as Sus)) ? { ...(y.tat ? { tat: y.tat } : {}), ...(y.sus ? { sus: y.sus } : {}) } : null;
    return {
      acikGun: Math.min(GUN_SAYISI, Math.max(1, Math.floor(Number(k.acikGun) || 1))),
      biten: Array.isArray(k.biten) ? k.biten.filter(gunMu) : [],
      acilan: { tat, sus, gorunum },
      boya: typeof k.boya === 'string' && BOYA[k.boya] ? k.boya : 'buz',
      yas: k.yas === 'kucuk' || k.yas === 'buyuk' ? k.yas : null,
      mutlu,
      gorulen: Array.isArray(k.gorulen) ? k.gorulen.filter((x): x is string => typeof x === 'string').slice(-GORULEN_EN_COK) : [],
      ozelTat: typeof k.ozelTat === 'string' && tat.includes(k.ozelTat as Tat) ? (k.ozelTat as Tat) : null,
      yeni,
    };
  } catch {
    return bos();
  }
}

function yukle(): OtobusKayit {
  try {
    return kayitCoz(globalThis.localStorage?.getItem(ANAHTAR));
  } catch {
    return bos();
  }
}

export const kayit: OtobusKayit = yukle();

export function kaydet() {
  try {
    globalThis.localStorage?.setItem(ANAHTAR, JSON.stringify(kayit));
  } catch {
    /* gizli sekme, kota: bellekte kalır */
  }
}

/** Test / gösterim: kaydı sıfırlar */
export function sifirla() {
  Object.assign(kayit, bos());
  kaydet();
}

/** Bugün gelen müşteriler görülenlere yazılır (en çok son iki oyun) */
export function gorulduYaz(k: OtobusKayit, adlar: readonly string[]) {
  k.gorulen = [...k.gorulen.filter((x) => !adlar.includes(x)), ...adlar].slice(-GORULEN_EN_COK);
}

/** Gün bitti: bir sonraki gün açılır, en çok mutlu müşteri kalır (jeton artık birikmez: her gün ödül) */
export function gunBitti(k: OtobusKayit, gun: Gun, mutlu: number) {
  if (!k.biten.includes(gun)) k.biten.push(gun);
  k.mutlu[String(gun)] = Math.max(k.mutlu[String(gun)] ?? 0, Math.max(0, Math.min(5, mutlu)));
  k.acikGun = Math.min(GUN_SAYISI, Math.max(k.acikGun, gun + 1));
}

/** Kino'nun kiraz şapkası ve otobüs süsleri (otobus.ts: alınan kimlikler) */
export const gorunumler = (k: OtobusKayit = kayit): string[] => k.acilan.gorunum;
