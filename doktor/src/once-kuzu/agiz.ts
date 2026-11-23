// Konuşan karakterin ağzı: kaydın sesinden ağız dizisi (src/audio/dudak-mantik.ts ile aynı kurallar), kare başına 0–5 indeks.
// İndeks sırası çizimlerin sırasıdır: 0 kapalı, 1 az, 2 orta, 3 yuvarlak, 4 diş, 5 kapalı gülümseme.
// Saf mantık: DOM ve Web Audio yok; sahne AudioBuffer'ın örneklerini verir.
import { AGIZ_SEKILLERI, diziSekli, sekilDizisi, zarfCikar, type AgizSekli, type HazirDizi } from '../../../src/audio/dudak-mantik';

const ADIM_MS = 10;

/** Kaydın örneklerinden ağız dizisi (10 ms adım). */
export function agizDizisi(ornekler: ArrayLike<number>, ornekHizi: number): HazirDizi {
  return { sekiller: sekilDizisi(zarfCikar(ornekler, ornekHizi, ADIM_MS), ADIM_MS), adimMs: ADIM_MS, hiz: 1 };
}

/** Şeklin çizim indeksi. Sessizlikte (gülümse) karakter o adımın dinlenme ağzına döner: 0 endişeli kapalı, 5 gülümseme. */
export function agizIndeksi(sekil: AgizSekli | null, dinlenme: 0 | 5 = 5): number {
  if (sekil === null || sekil === 'gulumse') return dinlenme;
  if (sekil === 'kapali') return 0;
  return AGIZ_SEKILLERI.indexOf(sekil);
}

/** Kayıt başladıktan gecenMs sonra hangi ağız karesi (0–5). */
export const agizKaresi = (d: HazirDizi, gecenMs: number, dinlenme: 0 | 5 = 5): number => agizIndeksi(diziSekli(d, gecenMs), dinlenme);

/** Ağzı görünmeyen konuşmada (Kuzu'nun arkasında) kulakların oynaması için: o anda ses var mı. */
export function sesVarMi(d: HazirDizi, gecenMs: number): boolean {
  const s = diziSekli(d, gecenMs);
  return s !== null && s !== 'kapali' && s !== 'gulumse';
}
