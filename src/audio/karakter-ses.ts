/**
 * Karakter sesleri (ör. Kino'nun kendi ElevenLabs sesi): content/seslendirme.json → karakter_sesleri.
 *
 * - Oyun: bir karakter cümlesi için önce karakterin kendi kaydı aranır (normal hızda çalar);
 *   yoksa anlatıcı kaydı karakterin tonuyla (ör. Kino 0.92) çalınır — bugünkü davranış.
 * - Seslendirme betiği (scripts/seslendir.ts): ses kimliği dolu karakterlerin cümleleri ayrıca
 *   public/ses/<karakter>/ altına üretilir. Anlatıcı imzası karakter seslerinden etkilenmez;
 *   bir karakterin sesi değişince yalnız o karakterin dosyaları yeniden üretilir.
 *
 * - Seri 2 sesleri (content/seslendirme.json → seri2): listedeki karakterlerin (Anne, Baba, Lokum, Babaanne, Dede,
 *   Bıdık, müşteriler…) ses kimliği content/film2/sesler.json'dan okunur, kendi modeliyle (eleven_v4) ve ayarlarıyla
 *   üretilir. Ses kimliği koda da manifest'e de yazılmaz: imza ve manifest'teki ses_id kimliğin kısa özetidir.
 *   Konuşanı cümle listesi belirtir (cumleler.ts → karakterCumleleri: { karakter: [cümleler] }).
 *
 * Bu dosya saf (fs/ağ yok) — birim testleri buradan sınar.
 */
import { normal } from './cumleler';

/** Karakter adı → ses kimliği. Boş kimlik = karakterin kendi sesi yok (anlatıcı sesi, ton ile). */
export type KarakterSesleri = Record<string, string>;

export interface KarakterManifest<K = string> {
  ses_id: string;
  dosyalar: Record<string, K>;
  imzalar?: Record<string, string>;
}

export interface SesManifest<K = string> {
  ses_id: string | null;
  model?: string | null;
  dosyalar: Record<string, K>;
  /** Her kaydın hangi ses/model/ayarla üretildiği — değişince yeniden üretilir */
  imzalar?: Record<string, string>;
  /** Karakterlerin kendi sesiyle üretilmiş kayıtları (dosya yolu '<karakter>/…mp3') */
  karakterler?: Record<string, KarakterManifest<K>>;
}

// ---------------------------------------------------------------- oyun tarafı

export interface KayitSecenegi {
  /** Konuşan karakter (ör. 'kino'): kendi kaydı varsa o çalınır */
  karakter?: string | null;
  /** Kendi kaydı yoksa anlatıcı kaydının çalınacağı hız/ton (ör. Kino 0.92) */
  ton?: number;
}

export interface SecilenKayit<K> {
  kayit: K;
  /** Çalma hızı: karakterin kendi kaydı 1, anlatıcı kaydı istenen ton */
  hiz: number;
  /** Kaydı kimin sesi: karakter adı ya da null (anlatıcı) */
  karakter: string | null;
}

/** Bir cümle için çalınacak kaydı seçer; hiç kayıt yoksa null (çağıran cihaz sesine düşer). */
export function kayitSec<K>(m: SesManifest<K> | null | undefined, metin: string, secenek: KayitSecenegi = {}): SecilenKayit<K> | null {
  if (!m?.dosyalar) return null;
  const n = normal(metin);
  const kar = secenek.karakter;
  const kendi = kar ? m.karakterler?.[kar]?.dosyalar?.[n] : undefined;
  if (kar && kendi) return { kayit: kendi, hiz: 1, karakter: kar };
  const anlatici = m.dosyalar[n];
  return anlatici ? { kayit: anlatici, hiz: secenek.ton ?? 1, karakter: null } : null;
}

// ---------------------------------------------------------------- seslendirme betiği

export interface SesAyari {
  model: string;
  baglam?: boolean;
  dil?: string | null;
  karakter_sesleri?: KarakterSesleri;
  /** Seri 2 sesleriyle konuşan karakterler (kimlikler content/film2/sesler.json'da) */
  seri2?: { karakterler?: string[] };
}

/** content/film2/sesler.json: Seri 2 karakter sesleri (Barış'ın Voice Design sesleri) */
export interface Seri2Sesleri {
  model: string;
  dil?: string | null;
  ayarlar?: Record<string, number | boolean>;
  sesler: Record<string, string>;
}

/** Bir karakterin üretim ayarı */
export interface KarakterUretim {
  sesId: string;
  model: string;
  baglam: boolean;
  dil: string | null;
  /** voice_settings (yoksa anlatıcınınki) */
  ayarlar?: Record<string, number | boolean>;
  /** true: imzada ve manifest'te ses kimliği yerine kısa özeti durur (Seri 2) */
  gizli: boolean;
}

/** Ses kimliğinin geri çevrilemeyen kısa özeti (manifest'e ve loga kimlik yazılmasın) */
export function kimlikOzeti(sesId: string): string {
  let a = 0x811c9dc5;
  let b = 0x01000193;
  for (const c of sesId) {
    a = Math.imul(a ^ c.charCodeAt(0), 0x01000193) >>> 0;
    b = Math.imul(b ^ c.charCodeAt(0), 0x85ebca6b) >>> 0;
  }
  return `o${a.toString(36)}${b.toString(36)}`;
}

/**
 * Kendi sesiyle konuşan karakterler ve üretim ayarları: karakter_sesleri (anlatıcının modeliyle; ör. Kino) önce,
 * sonra seri2.karakterler (film2/sesler.json'daki kimlik ve model; kimliği olmayan atlanır = anlatıcı sesi, ton ile).
 */
export function karakterUretimleri(a: SesAyari, seri2?: Seri2Sesleri | null): Record<string, KarakterUretim> {
  const u: Record<string, KarakterUretim> = {};
  for (const [k, v] of Object.entries(etkinKarakterSesleri(a))) u[k] = { sesId: v, model: a.model, baglam: !!a.baglam, dil: a.dil ?? null, gizli: false };
  if (seri2?.sesler)
    for (const k of a.seri2?.karakterler ?? []) {
      const id = seri2.sesler[k];
      if (u[k] || typeof id !== 'string' || !id.trim()) continue;
      u[k] = { sesId: id.trim(), model: seri2.model, baglam: false, dil: seri2.dil ?? a.dil ?? null, ayarlar: seri2.ayarlar, gizli: true };
    }
  return u;
}

/** Karakter kaydının imzası (eski Kino kayıtlarıyla aynı kalır; Seri 2'de kimlik yerine özet) */
export const karakterImzasi = (u: KarakterUretim) => sesImzasi(u.gizli ? kimlikOzeti(u.sesId) : u.sesId, { model: u.model, baglam: u.baglam, dil: u.dil });

/** Manifest'e yazılan ses_id: Seri 2'de kimliğin özeti */
export const manifestKimligi = (u: KarakterUretim) => (u.gizli ? kimlikOzeti(u.sesId) : u.sesId);

/** Kaydın imzası: ses/model/bağlam/dil değişince kayıt yeniden üretilir. */
export const sesImzasi = (sesId: string, a: SesAyari) => `${sesId}|${a.model}|${a.baglam ? 'baglam' : ''}|${a.dil ?? ''}`;

/** Ses kimliği dolu karakterler (boşlar atlanır = eski davranış). */
export function etkinKarakterSesleri(a: SesAyari): KarakterSesleri {
  const s: KarakterSesleri = {};
  for (const [k, v] of Object.entries(a.karakter_sesleri ?? {})) if (typeof v === 'string' && v.trim()) s[k] = v.trim();
  return s;
}

/** Karakter kayıtlarının klasörü (public/ses altında): anlatıcı dosyalarıyla asla çakışmaz. */
export const karakterKlasoru = (karakter: string) => `${karakter}/`;

export interface UretimIsi {
  metin: string;
  sesId: string;
  /** karakterin kendi modeli ve voice_settings (yoksa anlatıcınınki) */
  model?: string;
  dil?: string | null;
  ayarlar?: Record<string, number | boolean>;
  imza: string;
  /** public/ses altındaki göreli yol */
  dosya: string;
  /** null = anlatıcı */
  karakter: string | null;
}

export interface PlanGirdisi {
  ayar: SesAyari;
  /** Anlatıcı ses kimliği */
  sesId: string;
  manifest: SesManifest;
  /** tumCumleler() */
  cumleler: string[];
  /** karakterCumleleri() */
  karakterCumleleri: Record<string, string[]>;
  /** Karakterlerin üretim ayarı (karakterUretimleri); verilmezse yalnız karakter_sesleri (eski davranış) */
  karakterler?: Record<string, KarakterUretim>;
  /** Dosya adı (metin + imzadan karma) */
  dosyaAdi: (metin: string, imza: string) => string;
  /** public/ses altındaki göreli yol diskte var mı */
  dosyaVar: (dosya: string) => boolean;
}

/** Üretilmesi gereken (eksik ya da imzası eskimiş) kayıtlar: önce anlatıcı, sonra karakterler. */
export function uretimIsleri(p: PlanGirdisi): UretimIsi[] {
  const isler: UretimIsi[] = [];
  const guncelDegil = (kayit: { dosyalar: Record<string, string>; imzalar?: Record<string, string> } | undefined, c: string, imza: string) => {
    const f = kayit?.dosyalar[c];
    return !f || !p.dosyaVar(f) || kayit?.imzalar?.[c] !== imza;
  };
  const imza = sesImzasi(p.sesId, p.ayar);
  for (const c of p.cumleler) if (guncelDegil(p.manifest, c, imza)) isler.push({ metin: c, sesId: p.sesId, imza, dosya: p.dosyaAdi(c, imza), karakter: null });
  for (const [k, ku] of Object.entries(p.karakterler ?? karakterUretimleri(p.ayar))) {
    const kImza = karakterImzasi(ku);
    const kayit = p.manifest.karakterler?.[k];
    for (const c of p.karakterCumleleri[k] ?? [])
      if (guncelDegil(kayit, c, kImza))
        isler.push({ metin: c, sesId: ku.sesId, model: ku.model, dil: ku.dil, ayarlar: ku.ayarlar, imza: kImza, dosya: karakterKlasoru(k) + p.dosyaAdi(c, kImza), karakter: k });
  }
  return isler;
}

/**
 * Manifest'i güncel içeriğe göre ayıklar: artık söylenmeyen cümleler ve sesi boşaltılmış karakterler çıkar.
 * Dönen küme: kullanılan bütün dosya yolları (diskte bunların dışındaki kayıtlar silinebilir).
 */
export function manifestiAyikla(
  m: SesManifest,
  ayar: SesAyari,
  cumleler: string[],
  karakterCumleleri: Record<string, string[]>,
  /** kendi sesi olan karakterler (karakterUretimleri); verilmezse karakter_sesleri */
  etkin: Record<string, unknown> = karakterUretimleri(ayar),
): Set<string> {
  const gecerli = new Set(cumleler);
  m.imzalar ??= {};
  for (const k of Object.keys(m.dosyalar))
    if (!gecerli.has(k)) {
      delete m.dosyalar[k];
      delete m.imzalar[k];
    }
  for (const [kar, kayit] of Object.entries(m.karakterler ?? {})) {
    if (!etkin[kar]) {
      delete m.karakterler![kar];
      continue;
    }
    const kGecerli = new Set(karakterCumleleri[kar] ?? []);
    for (const c of Object.keys(kayit.dosyalar))
      if (!kGecerli.has(c)) {
        delete kayit.dosyalar[c];
        delete kayit.imzalar?.[c];
      }
  }
  if (m.karakterler && !Object.keys(m.karakterler).length) delete m.karakterler;
  return new Set([...Object.values(m.dosyalar), ...Object.values(m.karakterler ?? {}).flatMap((k) => Object.values(k.dosyalar))]);
}
