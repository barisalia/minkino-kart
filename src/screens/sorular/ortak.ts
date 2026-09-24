import { buyukHarfBas, sayiAdi } from '../../audio/metin';
import { kart, refCoz } from '../../engine/katalog';
import type { KartGirdi, Soru } from '../../engine/types';

/** Doğru cevaptan sonra övgünün ardından söylenecek cümle. */
export function aciklama(s: Soru, g: KartGirdi | undefined): string {
  if (s.dogru_ses) return s.dogru_ses;
  if (!g) return '';
  const r = refCoz(g);
  if (r.yazi) return `${buyukHarfBas(r.yazi.toLocaleLowerCase('tr'))}!`;
  const k = r.kart ? kart(r.kart) : undefined;
  if (!k) return '';
  if (k.tur === 'sayi') return `${k.ad}!`;
  if (r.adet && r.adet > 1) return `${buyukHarfBas(sayiAdi(r.adet))} ${k.ad.toLocaleLowerCase('tr')}!`;
  if (k.tur === 'harf') return k.ses ?? `${k.ad}!`;
  return `${k.ad}!${k.ses && k.tur === 'resim' ? ' ' + k.ses : ''}`;
}
