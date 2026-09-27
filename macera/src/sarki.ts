/**
 * Doğum günü şarkısı ve çocuğun söyleyişinin değerlendirilmesi.
 * Şarkı Gemini (Lyria) kaydıdır: "Neşeyle şarkı söyle / Mumları üfle hadi / İyi ki doğdun Ada / Hep mutlu ol Ada".
 * Notalar ve zamanlar kayıttan ölçüldü: assets/muzik/dogumgunu.json. Oyun şarkıdaki notalara göre ilerler.
 * Ton bağımsız: çocuğun kendi ilk notalarından bir referans alınır, sonraki notalar bu referansa göre
 * kaç yarım ton yukarı/aşağı olmalı diye bakılır (çocuk her tonda söyleyebilir).
 */
import KAYIT from '../../assets/muzik/dogumgunu.json';

export interface Nota {
  /** MIDI (60 = do) */
  midi: number;
  /** vuruş cinsinden süre */
  vurus: number;
  hece: string;
  /** satır (0-3) */
  satir: number;
  /** bu notanın başlangıcı (vuruş) */
  bas: number;
  /** kayıtta başlangıç (ms, dosyanın başından) */
  basMs?: number;
  /** kayıtta bir sonraki heceye kadar süre (ms) */
  sureMs?: number;
}

interface KayitHece {
  hece: string;
  satir: number;
  basla_ms: number;
  bitir_ms: number;
  midi: number;
  vurus: number;
}
const HECELER = (KAYIT as { heceler: KayitHece[] }).heceler;
const BPM = (KAYIT as { bpm: number }).bpm;

/** Referans nota: şarkının ilk notası (ilk iki hece aynı notada; çocuğun tonu buradan ölçülür) */
export const REF_MIDI = HECELER[0].midi;

/** Şarkı (kayıttaki notalar ve zamanlarla); satirSayisi: 3 yaşta 2 satır */
export function melodi(satirSayisi = 4): Nota[] {
  const vurusMs = 60000 / BPM;
  const ilk = HECELER[0].basla_ms;
  return HECELER.filter((x) => x.satir < satirSayisi).map((x, i) => {
    const sonraki = HECELER[i + 1];
    const son = sonraki && sonraki.satir === x.satir ? sonraki.basla_ms : x.bitir_ms;
    return { midi: x.midi, vurus: x.vurus, hece: x.hece, satir: x.satir, bas: (x.basla_ms - ilk) / vurusMs, basMs: x.basla_ms, sureMs: Math.max(120, son - x.basla_ms) };
  });
}

/** Kayıtta verilen satırın bittiği an (ms): 3 yaşta kayıt 2. satırın sonunda durur */
export function satirSonuMs(satirSayisi: number): number {
  const s = HECELER.filter((x) => x.satir < satirSayisi);
  return s[s.length - 1].bitir_ms;
}

export const toplamVurus = (n: Nota[]) => (n.length ? n[n.length - 1].bas + n[n.length - 1].vurus : 0);

/** En yüksek nota — 6 yaş için ödüllü an */
export const tepeNota = (n: Nota[]) => n.reduce((a, b) => (b.midi > a.midi ? b : a), n[0]);

export const yarimTon = (f: number, ref: number) => 12 * Math.log2(f / ref);

export type NotaSonucu = 'dogru' | 'tiz' | 'kalin' | 'sessiz' | 'ses';

/**
 * Bir notanın değerlendirmesi.
 * perdeler: nota süresince ölçülen perde (Hz) değerleri; sesli: sesli kare oranı (0..1)
 * referans: çocuğun "sol" notası (ilk iki notadan); tolerans: yarım ton
 * yalnizSes: küçük yaşlar için sadece ses çıkarmak yeter
 */
export function notaDegerlendir(p: { perdeler: number[]; sesli: number; midi: number; referans: number | null; tolerans: number; yalnizSes: boolean; refMidi?: number }): NotaSonucu {
  if (p.sesli < 0.25) return 'sessiz';
  if (p.yalnizSes || !p.referans || p.perdeler.length < 3) return p.yalnizSes ? 'dogru' : 'ses';
  const s = [...p.perdeler].sort((a, b) => a - b);
  const orta = s[Math.floor(s.length / 2)];
  const beklenen = p.midi - (p.refMidi ?? 67);
  let fark = yarimTon(orta, p.referans) - beklenen;
  // oktav farkı affedilir (çocuk bir oktav yukarı/aşağı söyleyebilir)
  while (fark > 6) fark -= 12;
  while (fark < -6) fark += 12;
  if (Math.abs(fark) <= p.tolerans) return 'dogru';
  return fark > 0 ? 'tiz' : 'kalin';
}

/** Referans: ilk iki notanın (ikisi de aynı nota) perdelerinin ortancası */
export function referansBul(perdeler: number[]): number | null {
  if (perdeler.length < 4) return null;
  const s = [...perdeler].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

/** Anlık tepki için: çocuğun şu anki sesi beklenenden kaç yarım ton ince (+) / kalın (−); oktav farkı affedilir */
export function anlikFark(perde: number, referans: number, midi: number, refMidi = 67): number {
  let fark = yarimTon(perde, referans) - (midi - refMidi);
  while (fark > 6) fark -= 12;
  while (fark < -6) fark += 12;
  return fark;
}
