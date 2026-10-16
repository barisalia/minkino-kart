/**
 * Kitaplar kaydı: YALNIZ BU CİHAZDA (localStorage `minkino-kitap-v1`; uygulamada kabuk Preferences'a da yansıtır).
 * Okuma ilerlemesi, seçilen okuma modu, bulunan sürprizler ve uğur böcekleri. Hiçbir yere gönderilmez.
 */
export type OkumaModu = 'oku' | 'bak';

export interface KitapIlerleme {
  /** Kaldığı yer: 0 = kapak, 1..14 sayfa, 15 = son (ebeveyn sayfası) */
  sayfa: number;
  /** Sonuna kadar okundu mu (kaç kez) */
  bitti: number;
  /** Sayfa → bulunan anlar ('ugur' dahil) */
  bulunan: Record<string, string[]>;
}

export interface KitapKayit {
  mod: OkumaModu | null;
  kitaplar: Record<string, KitapIlerleme>;
}

export const ANAHTAR = 'minkino-kitap-v1';
export const bosKayit = (): KitapKayit => ({ mod: null, kitaplar: {} });

const dizi = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

/** Bozuk / eski kayıt oyunu durdurmaz: tanınmayan alanlar atılır */
export function kayitCoz(ham: string | null): KitapKayit {
  const k = bosKayit();
  if (!ham) return k;
  try {
    const v = JSON.parse(ham) as Partial<KitapKayit>;
    if (v.mod === 'oku' || v.mod === 'bak') k.mod = v.mod;
    for (const [id, i] of Object.entries(v.kitaplar ?? {})) {
      if (!i || typeof i !== 'object') continue;
      const bulunan: Record<string, string[]> = {};
      for (const [s, l] of Object.entries((i as KitapIlerleme).bulunan ?? {})) bulunan[s] = dizi(l);
      const sayfa = Number((i as KitapIlerleme).sayfa);
      k.kitaplar[id] = { sayfa: Number.isFinite(sayfa) ? Math.max(0, Math.round(sayfa)) : 0, bitti: Math.max(0, Number((i as KitapIlerleme).bitti) || 0), bulunan };
    }
  } catch {
    /* bozuk kayıt: baştan */
  }
  return k;
}

let bellek: KitapKayit | null = null;

export function kayitOku(): KitapKayit {
  if (bellek) return bellek;
  let ham: string | null = null;
  try {
    ham = localStorage.getItem(ANAHTAR);
  } catch {
    /* depolama kapalı: bellekte */
  }
  bellek = kayitCoz(ham);
  return bellek;
}

export function kayitYaz(k: KitapKayit) {
  bellek = k;
  try {
    localStorage.setItem(ANAHTAR, JSON.stringify(k));
  } catch {
    /* yer yok / kapalı: bellekte kalır */
  }
}

export function ilerleme(id: string): KitapIlerleme {
  const k = kayitOku();
  return (k.kitaplar[id] ??= { sayfa: 0, bitti: 0, bulunan: {} });
}
