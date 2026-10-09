/**
 * Kino Ne Giysin? konuşması. Bütün cümleler content/giysin.json'dan gelir ve ElevenLabs'ta kayıtlıdır; kaydı çalınamayan
 * bir cümle (ör. oyun açılır açılmaz, ilk dokunuştan önce ses motoru kapalıyken) cihazın robotik sesine DÜŞMEZ:
 * sessiz geçer, Kino'nun düşünce balonu ve ekrandaki işaretler yine görünür.
 */
import { konus, KINO_SESI } from '../../src/audio/konusma';

/** Mino (anlatıcı) */
export const minoSoyle = (t: string) => konus(t, { cihazSesi: false });
/** Kino'nun kendi sesi */
export const kinoSoyle = (t: string) => konus(t, { ...KINO_SESI, cihazSesi: false });
