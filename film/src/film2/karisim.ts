/**
 * Bölümün ses karışımı (YouTube kaydı, önizleme ve uygulama aynı kodla): seslendirme (tam kalite
 * ekip/ses/seri2-gelen/<kimlik>.mp3, uygulamada sıkıştırılmışı assets/film-seri2/ses/<kimlik>.mp3), müzik
 * (assets/muzik, konuşma sırasında kendiliğinden alçalır) ve efektler (dosya varsa assets/film-seri2/efekt/<ad>.mp3,
 * yoksa Web Audio sentezi). OfflineAudioContext'te işlenir: kare kare kayıtla örnek örnek aynı zaman çizgisi.
 * Ses düzeyi (-14 LUFS) kayıt betiğinde ffmpeg loudnorm ile ayarlanır.
 */
import { baglamiDegistir, efektCikisi } from '../../../src/audio/motor';
import { filmMuzikAdresi } from '../muzik';
import { FILM_EFEKT } from '../efekt';
import { EFEKT } from '../oyunlu/ses';

const EFEKT_DOSYA: Record<string, string> = import.meta.glob<string>('../../../assets/film-seri2/efekt/*.{mp3,wav}', { eager: true, query: '?url', import: 'default' });

function efektDosyasi(ad: string): string | null {
  return EFEKT_DOSYA[`../../../assets/film-seri2/efekt/${ad}.mp3`] ?? EFEKT_DOSYA[`../../../assets/film-seri2/efekt/${ad}.wav`] ?? null;
}

// ---------------------------------------------------------------- bu dizinin yeni sentez efektleri
type Baglam = BaseAudioContext;
let gurultu: AudioBuffer | null = null;
function gurultuTamponu(c: Baglam) {
  if (!gurultu || gurultu.sampleRate !== c.sampleRate) {
    gurultu = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = gurultu.getChannelData(0);
    let s = 11;
    for (let i = 0; i < d.length; i++) {
      s = (s * 16807) % 2147483647;
      d[i] = (s / 2147483647) * 2 - 1;
    }
  }
  return gurultu;
}
function ton(c: Baglam, out: AudioNode, t: number, f: number, sure: number, tip: OscillatorType, ses: number, f2?: number) {
  const o = c.createOscillator(), g = c.createGain();
  o.type = tip;
  o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + sure);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(ses, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + sure + 0.05);
}
function hisirti(c: Baglam, out: AudioNode, t: number, sure: number, f1: number, f2: number, ses: number, q = 1, tip: BiquadFilterType = 'bandpass', ofset = 0) {
  const s = c.createBufferSource();
  s.buffer = gurultuTamponu(c);
  const f = c.createBiquadFilter();
  f.type = tip;
  f.Q.value = q;
  f.frequency.setValueAtTime(f1, t);
  f.frequency.exponentialRampToValueAtTime(f2, t + sure);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(ses, t + sure * 0.25);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  s.connect(f).connect(g).connect(out);
  s.start(t, ofset);
  s.stop(t + sure + 0.05);
}
/** dosyası olmayan, dizinin yeni efektleri (bolum-01.md "yeni"): kısa sentez yer tutucular */
export const YENI_EFEKT: Record<string, (c: Baglam, o: AudioNode, t: number) => void> = {
  /** albüm sayfası çevrilir */
  sayfa(c, o, t) {
    hisirti(c, o, t, 0.35, 1800, 5200, 0.09, 0.7, 'bandpass', 0.3);
    hisirti(c, o, t + 0.18, 0.2, 4000, 2500, 0.05, 1, 'bandpass', 0.9);
  },
  /** hıçkırık (battaniyenin altında) */
  hickir(c, o, t) {
    hisirti(c, o, t, 0.22, 600, 1300, 0.05, 2);
    ton(c, o, t + 0.02, 420, 0.16, 'triangle', 0.035, 300);
  },
  /** burun çekme */
  burun(c, o, t) {
    hisirti(c, o, t, 0.28, 2500, 4200, 0.05, 2.5);
    hisirti(c, o, t + 0.34, 0.2, 2800, 4400, 0.04, 2.5);
  },
  /** tahta blok "tok" */
  blok(c, o, t) {
    ton(c, o, t, 780, 0.09, 'sine', 0.16, 520);
    ton(c, o, t, 1560, 0.05, 'triangle', 0.05);
    hisirti(c, o, t, 0.04, 3000, 1800, 0.05, 3);
  },
  /** kapı zili ding-dong */
  'kapi-zili'(c, o, t) {
    ton(c, o, t, 784, 0.9, 'sine', 0.14);
    ton(c, o, t + 0.45, 622, 1.1, 'sine', 0.14);
  },
  /** gece lambası düğmesi */
  'cit-cit'(c, o, t) {
    hisirti(c, o, t, 0.03, 4000, 3000, 0.12, 4);
    hisirti(c, o, t + 0.12, 0.03, 4200, 3200, 0.1, 4);
  },
  /** kısa aile alkışı */
  alkis(c, o, t) {
    for (let i = 0; i < 18; i++) hisirti(c, o, t + i * 0.085 + (i % 3) * 0.013, 0.06, 1500 + (i % 4) * 300, 900, 0.09, 1.2, 'bandpass', (i * 0.37) % 1.5);
  },
  /** sabah kuşları (fon) */
  'kus-cik'(c, o, t) {
    for (let i = 0; i < 3; i++) ton(c, o, t + i * 0.13, 2600 + i * 180, 0.08, 'sine', 0.035, 3400);
  },
};
/** efekt sentezle çalınabilir mi / dosyası var mı */
export function efektVar(ad: string): 'dosya' | 'sentez' | null {
  if (efektDosyasi(ad)) return 'dosya';
  return YENI_EFEKT[ad] || EFEKT[ad] || FILM_EFEKT[ad] ? 'sentez' : null;
}

// ---------------------------------------------------------------- karışım
export interface KarisimPlani {
  sure: number;
  sesler: { url: string; t: number }[];
  muzik: { ad: string; t: number; son: number; ses: number; gir: number; cik: number; dongu: boolean }[];
  efektler: { ad: string; t: number; ses: number }[];
  /** konuşma aralıkları: müzik alçalır */
  konusma: [number, number][];
  /** ana kazanç (dB): uygulamada YouTube kaydının loudnorm düzeltmesi (content/film2/<bolum>-duzey.json) */
  kazancDb?: number;
}
export const ORNEK = 48000;
/** müziğin konuşmada indiği düzey */
const ALCAK = 0.3;

/** çözülmüş sesler (AudioBuffer bağlamdan bağımsız: önizlemede ve uygulamada bir kez çözülür) */
const cozulen = new Map<string, Promise<AudioBuffer>>();
function coz(c: BaseAudioContext, url: string): Promise<AudioBuffer> {
  let p = cozulen.get(url);
  if (!p) {
    p = fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`${url}: ${r.status}`);
        return r.arrayBuffer();
      })
      .then((b) => c.decodeAudioData(b));
    cozulen.set(url, p);
  }
  return p;
}
/** planın bütün dosyalarını önceden çözer (oynatırken bekleme olmasın) */
export async function karisimHazirla(c: BaseAudioContext, p: KarisimPlani) {
  const urller = [...p.sesler.map((s) => s.url), ...p.muzik.map((m) => filmMuzikAdresi(m.ad)), ...p.efektler.map((e) => efektDosyasi(e.ad))];
  await Promise.all(urller.filter((u): u is string => !!u).map((u) => coz(c, u)));
}

/** konuşma aralıkları birleşmiş (aradaki kısa boşlukta müzik kalkmasın) */
function birlestir(a: [number, number][]): [number, number][] {
  const s = [...a].sort((x, y) => x[0] - y[0]);
  const out: [number, number][] = [];
  for (const [b, e] of s) {
    const son = out[out.length - 1];
    if (son && b - son[1] < 0.9) son[1] = Math.max(son[1], e);
    else out.push([b, e]);
  }
  return out;
}
/** müziğin bölüm saati x'teki alçalma çarpanı */
export function alcalma(konusma: [number, number][], x: number): number {
  for (const [a, b] of birlestir(konusma)) {
    if (x < a - 0.35) break;
    if (x < a - 0.05) return 1 + (ALCAK - 1) * ((x - (a - 0.35)) / 0.3);
    if (x <= b + 0.15) return ALCAK;
    if (x < b + 0.75) return ALCAK + (1 - ALCAK) * ((x - b - 0.15) / 0.6);
  }
  return 1;
}

/**
 * Planı bir ses bağlamına kurar: bölüm saati `bas` bağlam saati `sifir`'a denk gelir (çevrimdışı kayıtta ikisi 0;
 * uygulamada duraklat/devam ve ileri sarmada ortadan başlar). YouTube kaydı da uygulama da bu tek fonksiyonla çalar:
 * aynı karışım. Dönüş: durdur (kaynakları keser).
 */
export async function karisimKur(c: BaseAudioContext, p: KarisimPlani, cikis: AudioNode, bas = 0, sifir = 0): Promise<() => void> {
  await karisimHazirla(c, p);
  const zaman = (t: number) => sifir + (t - bas);
  const kaynaklar: AudioScheduledSourceNode[] = [];
  const ana = c.createGain();
  ana.gain.value = Math.pow(10, (p.kazancDb ?? 0) / 20);
  ana.connect(cikis);
  const cal = (b: AudioBuffer, t: number, hedef: AudioNode, dongu = false, son = Infinity) => {
    const bitis = Math.min(son, dongu ? Infinity : t + b.duration);
    if (bitis <= bas) return;
    const k = c.createBufferSource();
    k.buffer = b;
    k.loop = dongu;
    k.connect(hedef);
    const ofset = Math.max(0, bas - t);
    k.start(zaman(Math.max(t, bas)), dongu ? ofset % b.duration : ofset);
    if (Number.isFinite(son)) k.stop(zaman(son) + 0.05);
    kaynaklar.push(k);
  };
  // seslendirme
  const konusmaBus = c.createGain();
  konusmaBus.connect(ana);
  for (const s of p.sesler) cal(await coz(c, s.url), s.t, konusmaBus);
  // müzik: konuşma sırasında alçalan bus
  const muzikBus = c.createGain();
  muzikBus.connect(ana);
  const g = muzikBus.gain;
  g.setValueAtTime(alcalma(p.konusma, bas), zaman(bas));
  for (const [a, b] of birlestir(p.konusma)) {
    if (b + 0.75 < bas) continue;
    const noktalar: [number, number, boolean][] = [
      [a - 0.35, 1, false],
      [a - 0.05, ALCAK, true],
      [b + 0.15, ALCAK, false],
      [b + 0.75, 1, true],
    ];
    for (const [x, v, rampa] of noktalar) {
      if (x <= bas) continue;
      if (rampa) g.linearRampToValueAtTime(v, zaman(x));
      else g.setValueAtTime(v, zaman(x));
    }
  }
  for (const m of p.muzik) {
    const url = filmMuzikAdresi(m.ad);
    if (!url) continue;
    const b = await coz(c, url);
    const son = m.dongu ? m.son : Math.min(m.son, m.t + b.duration);
    if (son <= bas) continue;
    const z = c.createGain();
    const gir = Math.max(0.02, m.gir);
    // giriş-çıkış zarfı (ortadan başlarken o anki değerden)
    const deger = (x: number) => Math.max(0.0001, x < m.t + gir ? (m.ses * (x - m.t)) / gir : x > son - m.cik ? (m.ses * (son - x)) / m.cik : m.ses);
    const ilk = Math.max(bas, m.t);
    z.gain.setValueAtTime(deger(ilk), zaman(ilk));
    if (m.t + gir > bas) z.gain.linearRampToValueAtTime(m.ses, zaman(m.t + gir));
    if (son - m.cik > bas) z.gain.setValueAtTime(m.ses, zaman(son - m.cik));
    z.gain.linearRampToValueAtTime(0.0001, zaman(son));
    z.connect(muzikBus);
    cal(b, m.t, z, m.dongu, son);
  }
  // efektler: dosya ya da sentez (motorun efekt kodu bu bağlamda, sahte saatle zamanlanır)
  const efektBus = c.createGain();
  efektBus.gain.value = 0.9;
  efektBus.connect(ana);
  let sahte = 0;
  const vekil = new Proxy(c, {
    get(h, k) {
      if (k === 'state') return 'running';
      if (k === 'currentTime') return sahte;
      if (k === 'destination') return efektBus;
      const v = Reflect.get(h, k, h);
      return typeof v === 'function' ? v.bind(h) : v;
    },
  });
  const geri = baglamiDegistir(vekil as unknown as BaseAudioContext);
  try {
    const eski = efektCikisi();
    if (eski) eski.gain.value = 0.9;
    for (const e of p.efektler) {
      if (e.t < bas) continue;
      const dosya = efektDosyasi(e.ad);
      if (dosya) {
        const kz = c.createGain();
        kz.gain.value = e.ses;
        kz.connect(efektBus);
        cal(await coz(c, dosya), e.t, kz);
      } else if (YENI_EFEKT[e.ad]) {
        const kz = c.createGain();
        kz.gain.value = e.ses;
        kz.connect(efektBus);
        YENI_EFEKT[e.ad](c, kz, zaman(e.t));
      } else if (EFEKT[e.ad] || FILM_EFEKT[e.ad]) {
        sahte = zaman(e.t);
        (EFEKT[e.ad] ?? FILM_EFEKT[e.ad])();
      }
    }
  } finally {
    geri();
  }
  return () => {
    for (const k of kaynaklar)
      try {
        k.stop();
      } catch {
        /* başlamamış */
      }
    ana.disconnect();
  };
}

/** YouTube kaydı: bütün planı çevrimdışı işler (ana kazanç yok: düzeyi ffmpeg loudnorm ayarlar) */
export async function karisimIsle(p: KarisimPlani): Promise<AudioBuffer> {
  const oc = new OfflineAudioContext(2, Math.max(1, Math.ceil(p.sure * ORNEK)), ORNEK);
  await karisimKur(oc, { ...p, kazancDb: 0 }, oc.destination);
  return oc.startRendering();
}

/** 16 bit stereo WAV baytları */
export function wavBayt(b: AudioBuffer): Uint8Array {
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
  return new Uint8Array(veri.buffer);
}
