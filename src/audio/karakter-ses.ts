/**
 * Karakter sesleri (ör. Kino'nun kendi ElevenLabs sesi): content/seslendirme.json → karakter_sesleri.
 *
 * - Oyun: bir karakter cümlesi için önce karakterin kendi kaydı aranır (normal hızda çalar);
 *   yoksa anlatıcı kaydı karakterin tonuyla (ör. Kino 0.92) çalınır — bugünkü davranış.
 * - Seslendirme betiği (scripts/seslendir.ts): ses kimliği dolu karakterlerin cümleleri ayrıca
 *   public/ses/<karakter>/ altına üretilir. Anlatıcı imzası karakter seslerinden etkilenmez;
 *   bir karakterin sesi değişince yalnız o karakterin dosyaları yeniden üretilir.
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
}

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
  for (const [k, kSes] of Object.entries(etkinKarakterSesleri(p.ayar))) {
    const kImza = sesImzasi(kSes, p.ayar);
    const kayit = p.manifest.karakterler?.[k];
    for (const c of p.karakterCumleleri[k] ?? [])
      if (guncelDegil(kayit, c, kImza)) isler.push({ metin: c, sesId: kSes, imza: kImza, dosya: karakterKlasoru(k) + p.dosyaAdi(c, kImza), karakter: k });
  }
  return isler;
}

/**
 * Manifest'i güncel içeriğe göre ayıklar: artık söylenmeyen cümleler ve sesi boşaltılmış karakterler çıkar.
 * Dönen küme: kullanılan bütün dosya yolları (diskte bunların dışındaki kayıtlar silinebilir).
 */
export function manifestiAyikla(m: SesManifest, ayar: SesAyari, cumleler: string[], karakterCumleleri: Record<string, string[]>): Set<string> {
  const gecerli = new Set(cumleler);
  m.imzalar ??= {};
  for (const k of Object.keys(m.dosyalar))
    if (!gecerli.has(k)) {
      delete m.dosyalar[k];
      delete m.imzalar[k];
    }
  const etkin = etkinKarakterSesleri(ayar);
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
