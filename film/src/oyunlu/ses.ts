/**
 * Oyunlu filmin sesleri: Web Audio sentezi efektler (dosya ve kredi yok), dosya müziği (film/src/muzik.ts) ve
 * MP4/WebM kaydı için günlük. Kayıtta (?kayit=1) ses çalınmaz: olaylar sahte saatle günlüğe yazılır, sonra
 * OfflineAudioContext'te aynı kodla işlenir (film/src/kayit.ts ile aynı yol).
 *
 * Seslendirme (Seri 2 karakter sesleri, assets/ses-seri2/<söz>.mp3; scripts/film/oyunlu-ses.mjs hazırlar): her söz
 * kendi kaydıyla çalar, konuşurken film müziği kısılır. Ağız kaydın genliğinden, film saatine göre seçilir (canlıda
 * ve kare kare kayıtta aynı kare); sesi olmayan söz hece ritmiyle oynar.
 */
import { sekilDizisi, zarfCikar, type AgizSekli } from '../../../src/audio/dudak-mantik';
import { baglam, baglamiDegistir, efektCikisi, konusmaCikisi } from '../../../src/audio/motor';
import { FILM_EFEKT } from '../efekt';
import { dosyaTamponu, filmMuzik, type DosyaSecenegi } from '../muzik';
import { heceAgzi } from './aktor';
import { agizSec, etiketAn, etiketsiz, type EtiketAralik } from './seslendirme';

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
  tur: 'efekt' | 'muzik' | 'muzikSon' | 'konus';
  ad: string;
  arg?: unknown;
}
export const gunluk: SesOlay[] = [];
/** hiz: test saati hızlandırıyorsa (?hiz=N) seslendirme çalmaz (görüntüye yetişemez) */
export const sesDurum = { kayit: false, saat: 0, hiz: 1 };

// ---------------------------------------------------------------- seslendirme
const SES_DOSYA: Record<string, string> = import.meta.glob<string>('../../../assets/ses-seri2/*.mp3', { eager: true, query: '?url', import: 'default' });
/** sözün kaydının adresi (yoksa null: söz altyazı ve hece ritmiyle) */
export const sesAdresi = (id: string): string | null => SES_DOSYA[`../../../assets/ses-seri2/${id}.mp3`] ?? null;

interface SozSesi {
  tampon: AudioBuffer;
  /** 10 ms'de bir ağız şekli ve genlik (sözün tepesine göre 0..1) */
  sekil: AgizSekli[];
  guc: Float32Array;
}
const ADIM_MS = 10;
const sozSesleri = new Map<string, SozSesi>();
const yuklenen = new Map<string, Promise<void>>();

/** Sözlerin kayıtlarını indirip çözer, ağız dizilerini çıkarır (bir kez; yüklenemeyen söz sessiz kalır) */
export function seslendirmeYukle(idler: string[]): Promise<void> {
  return Promise.all(
    idler.map((id) => {
      const adres = sesAdresi(id);
      if (!adres) return Promise.resolve();
      let p = yuklenen.get(id);
      if (!p) {
        p = (async () => {
          const veri = await (await fetch(adres)).arrayBuffer();
          const OAC = window.OfflineAudioContext ?? (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext }).webkitOfflineAudioContext;
          const tampon = await new OAC(1, 1, 44100).decodeAudioData(veri);
          const x = tampon.getChannelData(0);
          const zarf = zarfCikar(x, tampon.sampleRate, ADIM_MS);
          // genlik: yükselirken hızlı, alçalırken yumuşak; sözün tepesine göre
          const guc = new Float32Array(zarf.length);
          let d = 0;
          for (let i = 0; i < zarf.length; i++) {
            const r = zarf[i].rms;
            d += (r - d) * (r > d ? 0.6 : 0.25);
            guc[i] = d;
          }
          const tepe = Math.max(0.02, ...guc);
          for (let i = 0; i < guc.length; i++) guc[i] = Math.min(1, guc[i] / tepe);
          sozSesleri.set(id, { tampon, sekil: sekilDizisi(zarf, ADIM_MS), guc });
        })().catch(() => undefined);
        yuklenen.set(id, p);
      }
      return p;
    }),
  ).then(() => undefined);
}

/** Konuşan sözün ağzı (x: sözün içindeki sn): kaydı varsa genlikten, yoksa hece ritminden; söz bittiyse null */
export function konusmaAgzi(s: { id: string; metin: string; x: number; etiketler: readonly EtiketAralik[] }): { agiz: string; guc: number } | null {
  const v = sozSesleri.get(s.id);
  const e = etiketAn(s.etiketler, s.x)?.tur ?? null;
  if (!v) {
    const h = heceAgzi(etiketsiz(s.metin), s.x);
    return h && e ? { agiz: agizSec(e === 'gul' ? 'orta' : 'az', h.guc, e), guc: h.guc } : h;
  }
  const i = Math.floor((s.x * 1000) / ADIM_MS);
  if (i < 0 || i >= v.sekil.length) return null;
  const g = v.guc[i];
  return { agiz: agizSec(v.sekil[i], g, e), guc: v.sekil[i] === 'gulumse' || v.sekil[i] === 'kapali' ? 0 : g };
}

/** Çalan konuşmalar (duraklatınca durur, devamda kaldığı yerden sürer) */
interface CalanSes {
  src: AudioBufferSourceNode;
  tampon: AudioBuffer;
  /** bağlam saatinde başlangıç ve kaydın içinden başlama noktası */
  bas: number;
  ofs: number;
}
let calanSesler: CalanSes[] = [];
let duranSesler: { tampon: AudioBuffer; ofs: number }[] = [];
let sesDurakli = false;

function tamponCal(tampon: AudioBuffer, ofs: number) {
  const c = baglam();
  const cikis = konusmaCikisi();
  if (!c || !cikis || ofs >= tampon.duration - 0.03) return;
  const src = c.createBufferSource();
  src.buffer = tampon;
  src.connect(cikis);
  const t = c.currentTime + 0.01;
  src.start(t, Math.max(0, ofs));
  const k: CalanSes = { src, tampon, bas: t, ofs: Math.max(0, ofs) };
  calanSesler.push(k);
  src.onended = () => {
    calanSesler = calanSesler.filter((x) => x !== k);
    src.disconnect();
  };
  // konuşurken müzik geri planda
  filmMuzik.kis(tampon.duration - ofs + 0.15);
}

/**
 * Sözün kaydını çalar. bas: sözün film saatindeki başlangıcı (kayıtta günlüğe tam o an yazılır; canlıda geç
 * kalınan kısım atlanır).
 */
export function konus(id: string, bas: number) {
  if (sesDurum.kayit) {
    if (sozSesleri.has(id)) gunluk.push({ t: bas, tur: 'konus', ad: id });
    return;
  }
  const v = sozSesleri.get(id);
  if (!v || sesDurum.hiz !== 1) return;
  const ofs = Math.max(0, sesDurum.saat - bas);
  if (sesDurakli) duranSesler.push({ tampon: v.tampon, ofs });
  else tamponCal(v.tampon, ofs);
}

/** Film duraklayınca konuşma da durur; devamda kaldığı yerden */
export function konusmaDuraklat(d: boolean) {
  if (d === sesDurakli) return;
  sesDurakli = d;
  const c = baglam();
  if (d) {
    for (const k of calanSesler) {
      if (c) duranSesler.push({ tampon: k.tampon, ofs: k.ofs + Math.max(0, c.currentTime - k.bas) });
      k.src.onended = null;
      try {
        k.src.stop();
      } catch {
        /* zaten durmuş */
      }
      k.src.disconnect();
    }
    calanSesler = [];
  } else {
    const d2 = duranSesler;
    duranSesler = [];
    for (const k of d2) tamponCal(k.tampon, k.ofs);
  }
}

/** Baştan oynatırken yarım kalan konuşma susar */
export function konusmaSustur() {
  duranSesler = [];
  sesDurakli = false;
  for (const k of calanSesler) {
    k.src.onended = null;
    try {
      k.src.stop();
    } catch {
      /* zaten durmuş */
    }
    k.src.disconnect();
  }
  calanSesler = [];
}

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
    // konuşmalar örnek hassasiyetiyle tam anında başlar (ağız film saatine göre oynar: ses ile aynı kare)
    const cikis = konusmaCikisi();
    for (const o of olaylar) {
      const v = o.tur === 'konus' ? sozSesleri.get(o.ad) : undefined;
      if (!v || !cikis || o.t >= sure) continue;
      const src = oc.createBufferSource();
      src.buffer = v.tampon;
      src.connect(cikis);
      src.start(Math.max(0, o.t));
    }
    let i = 0;
    const cal = (o: SesOlay) => {
      if (o.tur === 'efekt') EFEKT[o.ad]?.(o.arg as number | undefined);
      else if (o.tur === 'muzik') filmMuzik.dosyaCal(o.arg as DosyaSecenegi);
      else if (o.tur === 'konus') {
        const v = sozSesleri.get(o.ad);
        if (v) filmMuzik.kis(v.tampon.duration + 0.15);
      } else filmMuzik.dosyaSon(o.arg as number);
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
