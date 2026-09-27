/**
 * Dudak senkronu (çalma tarafı): konuşan karakterin ağız şekli. Kural ve eşikler: src/audio/dudak-mantik.ts.
 *
 * Her karakter kendi Dudak'ını tutar ve her karede kare(ms, konusuyor) ile şeklini alır. Kaynak sırası:
 * 1. Önceden çıkarılmış dizi (filmin MP4 kaydı: sahte saatle kare kare çekilirken ses çalmaz; kaydın zarfı
 *    önceden çıkarılır, ağız zamana göre seçilir: dudakDizisiHazirla / dudakDizisi).
 * 2. Çalan gerçek kayıt (ElevenLabs): konuşma kanalındaki AnalyserNode ile ölçülür (konusmaOlcum).
 * 3. Cihaz sesi (TTS) ya da hiç ses yok (sessiz animatik, test): metnin hece ritmi.
 * Konuşmuyorken ağız kısa kapanır, sonra gülümsemeye (karakterin kendi dinlenme ağzı) döner.
 *
 * Kimin ağzının oynadığına çağıran karar verir (konuşan karakter konusuyor=true verir, ötekiler false).
 */
import { normal } from './cumleler';
import { diziSekli, diziSuresi, DudakIzleyici, ritimSekli, sekilDizisi, zarfCikar, type AgizSekli, type HazirDizi } from './dudak-mantik';
import type { KayitSecenegi } from './karakter-ses';
import { kayitOrnekleri } from './kayit';
import { konusmaAni, konusuyorMu } from './konusma';
import { konusmaOlcum } from './motor';

export type { AgizSekli, HazirDizi } from './dudak-mantik';

/** Konuşma başlarken verilebilecek bilgi: metin (ritim için) ve önceden çıkarılmış dizi (MP4 kaydı) */
export interface KonusBilgi {
  metin?: string;
  dizi?: HazirDizi | null;
}

export class Dudak {
  private iz = new DudakIzleyici();
  private acikti = false;
  private acilis = 0;
  private bilgi: KonusBilgi = {};
  /** hazirla() çağrıldı: konuşmanın başı o an (bir sonraki kare değil) */
  private yeni = false;

  /** Konuşma başlıyor: bilgisi (cümle, MP4 dizisi); zaman bu andan sayılır */
  hazirla(bilgi: KonusBilgi = {}) {
    this.bilgi = bilgi;
    this.acilis = performance.now();
    this.yeni = true;
  }

  /** Şu anki şekil. konusuyor: bu karakter konuşuyor mu; sesli: çalan konuşma sesi bu karakterin mi */
  kare(ms: number, konusuyor: boolean, sesli = true): AgizSekli {
    if (konusuyor && !this.acikti && !this.yeni) this.acilis = ms;
    this.yeni = false;
    this.acikti = konusuyor;
    if (!konusuyor) {
      this.bilgi = {};
      return this.iz.adim(null, ms);
    }
    const { dizi, metin = '' } = this.bilgi;
    if (dizi) return diziSekli(dizi, ms - this.acilis) ?? this.iz.adim(null, ms);
    if (sesli) {
      const an = konusmaAni();
      if (an?.kaynak === 'kayit') return this.iz.adim(konusmaOlcum(), ms);
      if (an) return ritimSekli(an.metin, ms - an.bas);
      // ses sırada (kayıt çözülüyor, cihaz sesi gecikiyor): başlayınca oynar
      if (konusuyorMu()) return this.iz.adim(null, ms);
    }
    return ritimSekli(metin, ms - this.acilis);
  }
}

// ---------------------------------------------------------------- MP4 kaydı: önceden çıkarılan diziler
const ADIM_MS = 10;
const diziler = new Map<string, HazirDizi>();
const anahtar = (metin: string, karakter?: string | null) => `${karakter ?? ''}|${normal(metin)}`;

/** Cümlenin kaydını çözüp ağız dizisini çıkarır ve saklar (kayıt yoksa null) */
export async function dudakDizisiHazirla(metin: string, secenek: KayitSecenegi = {}): Promise<HazirDizi | null> {
  const k = anahtar(metin, secenek.karakter);
  const eski = diziler.get(k);
  if (eski) return eski;
  const o = await kayitOrnekleri(metin, secenek);
  if (!o) return null;
  const d: HazirDizi = { sekiller: sekilDizisi(zarfCikar(o.ornek, o.hz, ADIM_MS), ADIM_MS), adimMs: ADIM_MS, hiz: o.hiz };
  diziler.set(k, d);
  return d;
}

/** Saklanmış dizi (dudakDizisiHazirla ile; yoksa null) */
export function dudakDizisi(metin: string, karakter?: string | null): HazirDizi | null {
  return diziler.get(anahtar(metin, karakter)) ?? null;
}

export { diziSuresi };
