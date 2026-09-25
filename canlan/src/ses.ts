/**
 * Canlanan resme dokununca çalan kısa ses efektleri (ElevenLabs Sound Effects, public/ses/efekt/<ad>.mp3).
 * Efekt kanalından çalar (sessize alma ve ses seviyesi geçerli). Dosya yoksa küçük bir sentez sesi.
 */
import { efekt } from '../../src/audio/ses';
import { baglam, efektCikisi } from '../../src/audio/motor';

const onbellek = new Map<string, Promise<AudioBuffer | null>>();
let sonCalan: AudioBufferSourceNode | null = null;

function yukle(ad: string): Promise<AudioBuffer | null> {
  let p = onbellek.get(ad);
  if (!p) {
    p = (async () => {
      const c = baglam();
      if (!c) return null;
      try {
        // uygulamada site kökündeki ses/, tek dosyalık önizlemede yanındaki ses/
        for (const kok of ['../ses/efekt/', './ses/efekt/']) {
          const r = await fetch(`${kok}${ad}.mp3`).catch(() => null);
          if (r?.ok && (r.headers.get('content-type') ?? '').includes('audio')) return await c.decodeAudioData(await r.arrayBuffer());
        }
        return null;
      } catch {
        return null;
      }
    })();
    onbellek.set(ad, p);
  }
  return p;
}

/** Önceden yükle (canlanınca), dokunuşta gecikme olmasın. */
export const resimSesiHazirla = (ad: string) => void yukle(ad);

export async function resimSesi(ad: string) {
  const c = baglam();
  const cikis = efektCikisi();
  const b = await yukle(ad);
  if (!c || !cikis || !b) {
    efekt.secim();
    return;
  }
  try {
    sonCalan?.stop();
  } catch {
    /* zaten bitti */
  }
  const k = c.createBufferSource();
  k.buffer = b;
  k.connect(cikis);
  k.start();
  sonCalan = k;
}
