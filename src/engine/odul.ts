import { albumKartlari, kart, refCoz, TEMALAR } from './katalog';
import { dogruIndeks } from './soru';
import type { Soru, Tema } from './types';

/** Abonelik kilidi. false iken tüm paketler yalnızca albüm ilerlemesiyle açılır (test sürümü). */
export const ABONELIK_AKTIF = false;

/** Tur yıldızı: ilk denemede doğru bilinen soru oranına göre 1-3 (her zaman en az 1). */
export function yildizHesapla(ilkDenemede: number, toplam: number): 1 | 2 | 3 {
  if (toplam <= 0) return 1;
  const oran = ilkDenemede / toplam;
  if (oran >= 0.85) return 3;
  if (oran >= 0.5) return 2;
  return 1;
}

/**
 * Doğru cevaptan sonra albüme verilecek kart.
 * Sıra: sorunun `odul` alanı → doğru kart → gösterge kartları → temanın henüz alınmamış bir kartı.
 */
export function odulKartiSec(s: Soru, tema: string, sahip: Set<string>): string | null {
  const albumdeki = new Set(albumKartlari(tema).map((k) => k.id));
  const adaylar: string[] = [];
  if (s.odul) adaylar.push(s.odul);
  const d = s.kartlar[dogruIndeks(s)];
  if (d) {
    const r = refCoz(d);
    if (r.kart) {
      adaylar.push(r.kart);
      const ornek = kart(r.kart)?.ornek;
      if (ornek) adaylar.push(ornek);
    }
  }
  for (const g of s.gosterge ?? []) {
    const id = refCoz(g).kart;
    if (id) adaylar.push(id);
  }
  if (s.tip === 'HAFIZA') for (const g of s.kartlar) adaylar.push(refCoz(g).kart ?? '');
  for (const id of adaylar) if (albumdeki.has(id) && !sahip.has(id)) return id;
  const kalan = [...albumdeki].find((id) => !sahip.has(id));
  return kalan ?? null;
}

export type TemaDurumu = { acik: true } | { acik: false; sebep: 'kart'; kalan: number } | { acik: false; sebep: 'abonelik' };

export function temaDurumu(t: Tema, albumSayisi: number, premium: boolean, abonelik = ABONELIK_AKTIF): TemaDurumu {
  if (abonelik && !t.ucretsiz && !premium) return { acik: false, sebep: 'abonelik' };
  if (albumSayisi < t.acilis_kart) return { acik: false, sebep: 'kart', kalan: t.acilis_kart - albumSayisi };
  return { acik: true };
}

/** Albüm sayısı öncekinden sonrakine çıkınca yeni açılan temalar. */
export function yeniAcilanlar(onceki: number, sonraki: number, premium: boolean): Tema[] {
  return TEMALAR.filter((t) => temaDurumu(t, onceki, premium).acik === false && temaDurumu(t, sonraki, premium).acik);
}
