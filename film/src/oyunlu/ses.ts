/**
 * Oyunlu filmin sesleri: Web Audio sentezi efektler (dosya ve kredi yok), dosya müziği (film/src/muzik.ts) ve
 * MP4/WebM kaydı için günlük. Kayıtta (?kayit=1) ses çalınmaz: olaylar sahte saatle günlüğe yazılır, sonra
 * OfflineAudioContext'te aynı kodla işlenir (film/src/kayit.ts ile aynı yol).
 * Konuşma seslendirmesi yok (yeni sesleri Barış seçecek): cümleler altyazıyla, ağız hece ritmiyle oynar.
 */
import { baglam, baglamiDegistir, efektCikisi } from '../../../src/audio/motor';
import { FILM_EFEKT } from '../efekt';
import { dosyaTamponu, filmMuzik, type DosyaSecenegi } from '../muzik';

const hazir = (): [BaseAudioContext, AudioNode] | null => {
  const c = baglam() as BaseAudioContext | null;
  const o = efektCikisi();
  return c && o && (c as AudioContext).state === 'running' ? [c, o] : null;
};
let gurultu: AudioBuffer | null = null;
function gurultuTamponu(c: BaseAudioContext) {
  if (!gurultu || gurultu.sampleRate !== c.sampleRate) {
    gurultu = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = gurultu.getChannelData(0);
    let s = 7;
    for (let i = 0; i < d.length; i++) {
      s = (s * 16807) % 2147483647;
      d[i] = (s / 2147483647) * 2 - 1;
    }
  }
  return gurultu;
}
function ton(frek: number, bas: number, sure: number, tip: OscillatorType, ses: number, bitis?: number) {
  const hz = hazir();
  if (!hz) return;
  const [c, cikis] = hz;
  const t = c.currentTime + bas;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = tip;
  o.frequency.setValueAtTime(frek, t);
  if (bitis) o.frequency.exponentialRampToValueAtTime(bitis, t + sure);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(ses, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  o.connect(g).connect(cikis);
  o.start(t);
  o.stop(t + sure + 0.05);
}
function hisirti(bas: number, sure: number, f1: number, f2: number, ses: number, q = 1, tip: BiquadFilterType = 'bandpass') {
  const hz = hazir();
  if (!hz) return;
  const [c, cikis] = hz;
  const t = c.currentTime + bas;
  const s = c.createBufferSource();
  s.buffer = gurultuTamponu(c);
  const f = c.createBiquadFilter();
  f.type = tip;
  f.Q.value = q;
  f.frequency.setValueAtTime(f1, t);
  f.frequency.exponentialRampToValueAtTime(f2, t + sure);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(ses, t + sure * 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  s.connect(f).connect(g).connect(cikis);
  s.start(t, Math.random() * 1.5);
  s.stop(t + sure + 0.05);
}
/** pentatonik "ting" notaları (her dişte bir üst nota) */
const NOTA = [784, 880, 988, 1175, 1319, 1568, 1760, 1976, 2349];

/** Bu bölümün yeni efektleri (oyunlu-bolum-01.md "Yeni (Web Audio sentezi yeter)") + filmin mevcut efektleri */
export const EFEKT: Record<string, (n?: number) => void> = {
  /** fışır fışır: fırça kılları (fırçalarken ~0,3 sn'de bir) */
  fircala() {
    hisirti(0, 0.13, 2600, 4200, 0.09, 1.4);
    hisirti(0.12, 0.12, 3600, 2400, 0.07, 1.4);
  },
  /** ince kum akışı */
  kum() {
    hisirti(0, 0.5, 5200, 6400, 0.018, 0.8, 'highpass');
  },
  /** dişin üstünden geçince: yükselen nota */
  ting(n = 0) {
    const f = NOTA[Math.min(NOTA.length - 1, n)];
    ton(f, 0, 0.35, 'sine', 0.09);
    ton(f * 2, 0, 0.18, 'sine', 0.025);
  },
  /** kum bitti: zil */
  ding() {
    ton(1568, 0, 1.4, 'sine', 0.16);
    ton(2093, 0.02, 1.1, 'sine', 0.07);
    ton(3136, 0.04, 0.6, 'sine', 0.03);
  },
  /** yumuşak çan (yardım merdiveni 5 sn) */
  can() {
    ton(1047, 0, 0.9, 'sine', 0.08);
    ton(1568, 0.08, 0.7, 'sine', 0.05);
  },
  /** gargara */
  gulu() {
    for (let i = 0; i < 9; i++) ton(170 + (i % 3) * 35, i * 0.1, 0.09, 'triangle', 0.05, 120);
    hisirti(0, 1.0, 500, 900, 0.03, 3);
  },
  /** tükürme */
  pft() {
    hisirti(0, 0.16, 1400, 700, 0.18, 1.2);
    ton(260, 0, 0.08, 'triangle', 0.05, 140);
  },
  /** su sıçraması */
  sapir() {
    hisirti(0, 0.28, 3000, 900, 0.16, 0.9);
    for (let i = 0; i < 4; i++) ton(900 + i * 260, 0.04 + i * 0.05, 0.06, 'sine', 0.03, 1500 + i * 200);
  },
  /** hapşırık: nefes alma + patlama */
  hapsu() {
    hisirti(0, 0.45, 900, 1800, 0.05, 1);
    hisirti(0.5, 0.22, 3000, 700, 0.22, 0.7);
    ton(320, 0.5, 0.14, 'triangle', 0.06, 180);
  },
  /** esneme: yavaş yükselip inen hırıltılı ton */
  esne() {
    ton(330, 0, 1.0, 'triangle', 0.035, 220);
    hisirti(0, 1.1, 700, 400, 0.03, 2);
  },
  /** küçük kabarcıklar (köpük) */
  kopuk() {
    for (let i = 0; i < 3; i++) ton(1400 + i * 300, i * 0.05, 0.05, 'sine', 0.025, 2200);
  },
  /** macun sıkma: uzun ıslak hışırtı */
  macun() {
    hisirti(0, 0.9, 600, 1400, 0.06, 2.5);
  },
  /** kum saati lavaboya konur */
  tak() {
    ton(520, 0, 0.12, 'sine', 0.12, 300);
    hisirti(0, 0.05, 2500, 1500, 0.06, 2);
  },
};
for (const ad of ['kus', 'kikir', 'tik', 'pof', 'parilti', 'hop', 'inen', 'ayak', 'kosu', 'pit'])
  if (FILM_EFEKT[ad]) EFEKT[ad] ??= () => FILM_EFEKT[ad]();

// ---------------------------------------------------------------- günlük ve çalma
export interface SesOlay {
  /** saniye (film saati) */
  t: number;
  tur: 'efekt' | 'muzik' | 'muzikSon';
  ad: string;
  arg?: unknown;
}
export const gunluk: SesOlay[] = [];
export const sesDurum = { kayit: false, saat: 0 };

export function efekt(ad: string, n?: number) {
  if (sesDurum.kayit) gunluk.push({ t: sesDurum.saat, tur: 'efekt', ad, arg: n });
  else EFEKT[ad]?.(n);
}
export function muzik(a: DosyaSecenegi) {
  if (sesDurum.kayit) gunluk.push({ t: sesDurum.saat, tur: 'muzik', ad: a.ad, arg: a });
  else filmMuzik.dosyaCal(a);
}
export function muzikSon(sn = 1.2) {
  if (sesDurum.kayit) gunluk.push({ t: sesDurum.saat, tur: 'muzikSon', ad: '', arg: sn });
  else filmMuzik.dosyaSon(sn);
}

/** Günlüğü OfflineAudioContext'te işler (kayıt sonunda). Dönüş: 16 bit stereo WAV, base64 */
export async function sesiIsle(sure: number): Promise<string> {
  const ORNEK = 48000, ADIM = 0.02;
  const oc = new OfflineAudioContext(2, Math.ceil(sure * ORNEK), ORNEK);
  const vekil = new Proxy(oc, {
    get(h, k) {
      if (k === 'state') return 'running';
      const v = Reflect.get(h, k, h);
      return typeof v === 'function' ? v.bind(h) : v;
    },
  });
  const geri = baglamiDegistir(vekil);
  try {
    for (const o of gunluk) if (o.tur === 'muzik') await dosyaTamponu(vekil as unknown as BaseAudioContext, o.ad);
    const olaylar = [...gunluk].sort((a, b) => a.t - b.t);
    let i = 0;
    const cal = (o: SesOlay) => {
      if (o.tur === 'efekt') EFEKT[o.ad]?.(o.arg as number | undefined);
      else if (o.tur === 'muzik') filmMuzik.dosyaCal(o.arg as DosyaSecenegi);
      else filmMuzik.dosyaSon(o.arg as number);
    };
    while (i < olaylar.length && olaylar[i].t <= 0) cal(olaylar[i++]);
    for (let t = ADIM; t < sure - ADIM; t += ADIM) {
      void oc
        .suspend(t)
        .then(() => {
          while (i < olaylar.length && olaylar[i].t <= oc.currentTime + 1e-6) cal(olaylar[i++]);
          void oc.resume();
        })
        .catch(() => undefined);
    }
    const b = await oc.startRendering();
    return wav(b);
  } finally {
    geri();
  }
}

function wav(b: AudioBuffer): string {
  const n = b.length, kanal = b.numberOfChannels;
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
