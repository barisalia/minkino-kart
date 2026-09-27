/**
 * Filmin MP4 kaydı için ses (scripts/film/mp4.mjs): kayıt sırasında günlüğe yazılan olaylar (efekt, müzik, konuşma)
 * OfflineAudioContext'te AYNI kodla, aynı zamanlamayla yeniden çalınır ve WAV olarak verilir. Görüntü kare kare
 * çekildiği için gerçek zamanlı ses kaydı yok; kare atlaması da olmaz.
 *
 * Yalnız ?kayit=1'de yüklenir (film/src/main.ts).
 */
import { baglamiDegistir, konusmaCikisi, muzikKis } from '../../src/audio/motor';
import { dudakDizisiHazirla } from '../../src/audio/dudak';
import { kayitlariHazirla, kayitTamponu } from '../../src/audio/kayit';
import type { KayitSecenegi } from '../../src/audio/karakter-ses';
import { FILM_EFEKT } from './efekt';
import { filmBul } from './ekranlar';
import { gunlukDurum, konusSecenegi, sesGunlugu, type SesOlayi } from './motor';
import { filmMuzik, type Ruh } from './muzik';

const ORNEK = 48000;
/** askıya alma aralığı (sn): olaylar bu aralıkla yerine konur, müzik planlayıcısı bu aralıkla ilerler */
const ADIM = 128 * 16 / ORNEK;

/**
 * Sesi işler. t0: videonun 0. karesinin (sahte) saati, sure: videonun süresi (sn).
 * Dönüş: 16 bit stereo WAV, base64.
 */
async function sesiIsle(t0: number, sure: number): Promise<string> {
  const oc = new OfflineAudioContext(2, Math.ceil(sure * ORNEK), ORNEK);
  // efekt / konuşma kodu bağlamın "running" olmasını bekler; askıdayken de öyle görünsün
  const vekil = new Proxy(oc, {
    get(h, k) {
      if (k === 'state') return 'running';
      const v = Reflect.get(h, k, h);
      return typeof v === 'function' ? v.bind(h) : v;
    },
  });
  const geri = baglamiDegistir(vekil);
  gunlukDurum.kapali = true;
  try {
    const olaylar: (SesOlayi & { s: number })[] = sesGunlugu.map((o) => ({ ...o, s: Math.max(0, o.t - t0) })).filter((o) => o.s < sure).sort((a, b) => a.s - b.s);
    // konuşma kayıtlarını önceden çöz (askıdayken beklemeyelim)
    const tampon = new Map<SesOlayi, { tampon: AudioBuffer; hiz: number } | null>();
    for (const o of olaylar) if (o.tur === 'konus') tampon.set(o, await kayitTamponu(o.ad, (o.arg ?? {}) as KayitSecenegi));
    let i = 0;
    const cal = (o: SesOlayi) => {
      if (o.tur === 'efekt') FILM_EFEKT[o.ad]?.();
      else if (o.tur === 'muzik') {
        const m = filmMuzik as unknown as Record<string, (a?: unknown) => void>;
        if (o.ad === 'baslat' || o.ad === 'degis') m[o.ad](o.arg as Ruh);
        else m[o.ad](o.arg);
      } else {
        const k = tampon.get(o);
        const cikis = konusmaCikisi();
        if (!k || !cikis) return;
        const src = oc.createBufferSource();
        src.buffer = k.tampon;
        src.playbackRate.value = k.hiz;
        src.connect(cikis);
        src.start(oc.currentTime);
        // konuşurken müzik ve efekt geri planda (oyundaki gibi)
        muzikKis(true);
        const bitis = oc.currentTime + k.tampon.duration / k.hiz;
        void oc.suspend(Math.min(sure - ADIM, Math.ceil(bitis / ADIM) * ADIM + ADIM / 2)).then(() => {
          muzikKis(false);
          void oc.resume();
        }).catch(() => undefined);
      }
    };
    // 0. an: baştaki olaylar
    while (i < olaylar.length && olaylar[i].s <= 0) cal(olaylar[i++]);
    filmMuzik.adimAt();
    for (let t = ADIM; t < sure - ADIM; t += ADIM) {
      void oc.suspend(t).then(() => {
        while (i < olaylar.length && olaylar[i].s <= oc.currentTime + 1e-6) cal(olaylar[i++]);
        filmMuzik.adimAt();
        void oc.resume();
      }).catch(() => undefined);
    }
    const b = await oc.startRendering();
    return wav(b);
  } finally {
    gunlukDurum.kapali = false;
    geri();
  }
}

/** AudioBuffer → 16 bit PCM WAV (base64) */
function wav(b: AudioBuffer): string {
  const n = b.length;
  const kanal = b.numberOfChannels;
  const veri = new DataView(new ArrayBuffer(44 + n * kanal * 2));
  const yaz = (o: number, s: string) => [...s].forEach((c, k) => veri.setUint8(o + k, c.charCodeAt(0)));
  yaz(0, 'RIFF');
  veri.setUint32(4, 36 + n * kanal * 2, true);
  yaz(8, 'WAVE');
  yaz(12, 'fmt ');
  veri.setUint32(16, 16, true);
  veri.setUint16(20, 1, true);
  veri.setUint16(22, kanal, true);
  veri.setUint32(24, b.sampleRate, true);
  veri.setUint32(28, b.sampleRate * kanal * 2, true);
  veri.setUint16(32, kanal * 2, true);
  veri.setUint16(34, 16, true);
  yaz(36, 'data');
  veri.setUint32(40, n * kanal * 2, true);
  const kanallar = Array.from({ length: kanal }, (_, k) => b.getChannelData(k));
  let o = 44;
  for (let i = 0; i < n; i++)
    for (let k = 0; k < kanal; k++) {
      const v = Math.max(-1, Math.min(1, kanallar[k][i]));
      veri.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true);
      o += 2;
    }
  const bayt = new Uint8Array(veri.buffer);
  let s = '';
  for (let i = 0; i < bayt.length; i += 0x8000) s += String.fromCharCode(...bayt.subarray(i, i + 0x8000));
  return btoa(s);
}

/**
 * Dudak senkronu: kayıtta ses çalmadığı (ve saat sahte olduğu) için ağız canlı ölçülemez; filmdeki bütün cümlelerin
 * kayıtları önceden çözülür, zarfından ağız dizisi çıkarılır (src/audio/dudak.ts). Motor cümleyi söyletirken diziyi
 * zamana göre oynatır. Kaydedici (__filmKayit) bunlar bitince hazır sayılır.
 */
async function dudaklariHazirla() {
  await kayitlariHazirla();
  const dosya = filmBul(new URLSearchParams(location.search).get('film') ?? 'mino-karpuz');
  for (const s of dosya?.sahneler ?? []) {
    const olaylar = (s as { olaylar?: { kim: string; yap: string; metin?: unknown }[] }).olaylar ?? [];
    for (const o of olaylar) if (o.yap === 'soyle' && o.metin) await dudakDizisiHazirla(String(o.metin), konusSecenegi(o.kim === 'anlatici' ? '' : o.kim));
  }
}

void dudaklariHazirla()
  .catch(() => undefined)
  .then(() => {
    (window as unknown as { __filmKayit: unknown }).__filmKayit = { sesiIsle, gunluk: () => sesGunlugu.length };
  });
