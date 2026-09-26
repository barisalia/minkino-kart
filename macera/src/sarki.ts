/**
 * Doğum günü şarkısı ("Mutlu yıllar sana", telifsiz melodi) ve çocuğun söyleyişinin değerlendirilmesi.
 * Ton bağımsız: çocuğun kendi ilk notalarından bir referans alınır, sonraki notalar bu referansa göre
 * kaç yarım ton yukarı/aşağı olmalı diye bakılır (çocuk her tonda söyleyebilir).
 */
export interface Nota {
  /** MIDI (67 = sol) */
  midi: number;
  /** vuruş cinsinden süre */
  vurus: number;
  hece: string;
  /** satır (0-3) */
  satir: number;
  /** bu notanın başlangıcı (vuruş) */
  bas: number;
}

const SATIRLAR: [string[], number[], number[]][] = [
  [['Mut', 'lu', 'yıl', 'lar', 'sa', 'na'], [67, 67, 69, 67, 72, 71], [0.75, 0.25, 1, 1, 1, 2]],
  [['Mut', 'lu', 'yıl', 'lar', 'sa', 'na'], [67, 67, 69, 67, 74, 72], [0.75, 0.25, 1, 1, 1, 2]],
  [['İ', 'yi', 'ki', 'doğ', 'dun', 'A', 'da'], [67, 67, 79, 76, 72, 71, 69], [0.75, 0.25, 1, 1, 1, 1, 2]],
  [['Mut', 'lu', 'yıl', 'lar', 'sa', 'na'], [77, 77, 76, 72, 74, 72], [0.75, 0.25, 1, 1, 1, 2]],
];

/** Bütün şarkı (satır aralarında 1 vuruş nefes) */
export function melodi(satirSayisi = 4): Nota[] {
  const notalar: Nota[] = [];
  let t = 0;
  SATIRLAR.slice(0, satirSayisi).forEach(([heceler, midiler, sureler], satir) => {
    heceler.forEach((hece, i) => {
      notalar.push({ midi: midiler[i], vurus: sureler[i], hece, satir, bas: t });
      t += sureler[i];
    });
    t += 1;
  });
  return notalar;
}

export const toplamVurus = (n: Nota[]) => (n.length ? n[n.length - 1].bas + n[n.length - 1].vurus : 0);

/** En yüksek nota ("ki") — 6 yaş için ödüllü an */
export const tepeNota = (n: Nota[]) => n.reduce((a, b) => (b.midi > a.midi ? b : a), n[0]);

export const yarimTon = (f: number, ref: number) => 12 * Math.log2(f / ref);

export type NotaSonucu = 'dogru' | 'tiz' | 'kalin' | 'sessiz' | 'ses';

/**
 * Bir notanın değerlendirmesi.
 * perdeler: nota süresince ölçülen perde (Hz) değerleri; sesli: sesli kare oranı (0..1)
 * referans: çocuğun "sol" notası (ilk iki notadan); tolerans: yarım ton
 * yalnizSes: küçük yaşlar için sadece ses çıkarmak yeter
 */
export function notaDegerlendir(p: { perdeler: number[]; sesli: number; midi: number; referans: number | null; tolerans: number; yalnizSes: boolean }): NotaSonucu {
  if (p.sesli < 0.25) return 'sessiz';
  if (p.yalnizSes || !p.referans || p.perdeler.length < 3) return p.yalnizSes ? 'dogru' : 'ses';
  const s = [...p.perdeler].sort((a, b) => a - b);
  const orta = s[Math.floor(s.length / 2)];
  const beklenen = p.midi - 67;
  let fark = yarimTon(orta, p.referans) - beklenen;
  // oktav farkı affedilir (çocuk bir oktav yukarı/aşağı söyleyebilir)
  while (fark > 6) fark -= 12;
  while (fark < -6) fark += 12;
  if (Math.abs(fark) <= p.tolerans) return 'dogru';
  return fark > 0 ? 'tiz' : 'kalin';
}

/** Referans: ilk iki notanın (ikisi de "sol") perdelerinin ortancası */
export function referansBul(perdeler: number[]): number | null {
  if (perdeler.length < 4) return null;
  const s = [...perdeler].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

/** Anlık tepki için: çocuğun şu anki sesi beklenenden kaç yarım ton ince (+) / kalın (−); oktav farkı affedilir */
export function anlikFark(perde: number, referans: number, midi: number): number {
  let fark = yarimTon(perde, referans) - (midi - 67);
  while (fark > 6) fark -= 12;
  while (fark < -6) fark += 12;
  return fark;
}
