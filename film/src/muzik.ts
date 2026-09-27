/**
 * Film müziği (Web Audio, dosya ve kredi yok): sıcak, akustik hisli kısa bir tema.
 * Ses: tel (Karplus-Strong ile önceden üretilen gitar/ukulele tınısı), yumuşak bas, hafif shaker, gerekince pad.
 * Ruh hâlleri sahne dosyasından değişir ({ kim: 'muzik', yap: 'ruh', ad }) ve bir sonraki ölçü başında geçer:
 *   nese     — neşeli ve meraklı (Do majör, I–V–vi–IV, hoplayan arpej)
 *   uzgun    — köpek üzülünce: yavaş, seyrek, minör (La minör)
 *   aydinlik — paylaşma anı: aydınlanan dönüş (Fa–Sol–Do, pad ile)
 *   kapanis  — son: kadans, son akor çalar ve biter
 * Konuşma sırasında kısılır (ducking). Film duraklayınca durur. Genel müzik ayarı (sessize alma) geçerli.
 */
import { baglam, muzikCikisi } from '../../src/audio/motor';
import { muzikDurdur } from '../../src/audio/muzik';

export type Ruh = 'nese' | 'uzgun' | 'aydinlik' | 'kapanis' | 'yumusak';

interface Tema {
  bpm: number;
  /** ölçü başına akor (MIDI kök + tür) */
  akorlar: [number, 'maj' | 'min'][];
  /** 8'lik adımlarda melodi (0 = sus), 4 ölçü = 32 adım */
  melodi: number[];
  arpej: 'hop' | 'seyrek' | 'dolu';
  shaker: boolean;
  pad: boolean;
}

const TEMA: Record<Ruh, Tema> = {
  nese: {
    bpm: 104,
    akorlar: [[60, 'maj'], [67, 'maj'], [69, 'min'], [65, 'maj']],
    melodi: [76, 0, 79, 0, 81, 79, 76, 0, 74, 0, 79, 0, 74, 0, 0, 0, 72, 0, 76, 0, 79, 76, 72, 0, 77, 0, 76, 74, 72, 0, 0, 0],
    arpej: 'hop',
    shaker: true,
    pad: false,
  },
  uzgun: {
    bpm: 72,
    akorlar: [[57, 'min'], [53, 'maj'], [62, 'min'], [64, 'maj']],
    melodi: [76, 0, 0, 0, 74, 0, 72, 0, 72, 0, 0, 0, 69, 0, 0, 0, 74, 0, 0, 0, 72, 0, 71, 0, 71, 0, 0, 0, 68, 0, 0, 0],
    arpej: 'seyrek',
    shaker: false,
    pad: true,
  },
  aydinlik: {
    bpm: 92,
    akorlar: [[65, 'maj'], [67, 'maj'], [60, 'maj'], [60, 'maj']],
    melodi: [72, 0, 74, 0, 76, 0, 77, 0, 79, 0, 0, 0, 81, 0, 79, 0, 84, 0, 0, 0, 83, 0, 79, 0, 84, 0, 0, 0, 0, 0, 0, 0],
    arpej: 'dolu',
    shaker: true,
    pad: true,
  },
  // özür anı: yavaş, sıcak, yumuşak (Fa majör, seyrek tel + pad); Kino ve Elma Kulesi
  yumusak: {
    bpm: 70,
    akorlar: [[65, 'maj'], [69, 'min'], [70, 'maj'], [60, 'maj']],
    melodi: [81, 0, 0, 0, 79, 0, 77, 0, 76, 0, 0, 0, 72, 0, 0, 0, 74, 0, 0, 0, 77, 0, 76, 0, 72, 0, 0, 0, 0, 0, 0, 0],
    arpej: 'seyrek',
    shaker: false,
    pad: true,
  },
  kapanis: {
    bpm: 88,
    akorlar: [[60, 'maj'], [65, 'maj'], [67, 'maj'], [60, 'maj']],
    melodi: [79, 0, 76, 0, 72, 0, 76, 0, 77, 0, 81, 0, 77, 0, 0, 0, 79, 0, 83, 0, 86, 0, 83, 0, 84, 0, 0, 0, 0, 0, 0, 0],
    arpej: 'dolu',
    shaker: false,
    pad: true,
  },
};

const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
const akorNotalari = (kok: number, tur: 'maj' | 'min') => [kok, kok + (tur === 'maj' ? 4 : 3), kok + 7];

// ---------------------------------------------------------------- sesler
const telOnbellek = new Map<string, AudioBuffer>();
/** Karplus-Strong tel: gürültü darbesi, gecikme hattında süzülerek sönen titreşim */
function tel(c: AudioContext, midi: number, parlak = 0.5): AudioBuffer {
  const anahtar = `${midi}-${parlak}`;
  let b = telOnbellek.get(anahtar);
  if (b) return b;
  const sr = c.sampleRate;
  const n = Math.floor(sr * 1.6);
  b = c.createBuffer(1, n, sr);
  const d = b.getChannelData(0);
  const p = Math.max(2, Math.round(sr / hz(midi)));
  const hat = new Float32Array(p);
  for (let i = 0; i < p; i++) hat[i] = (Math.random() * 2 - 1) * (0.6 + 0.4 * Math.sin((i / p) * Math.PI));
  let j = 0;
  const son = 0.996 - (1 - parlak) * 0.004;
  for (let i = 0; i < n; i++) {
    const a = hat[j];
    const s = hat[(j + 1) % p];
    const v = son * 0.5 * (a + s);
    hat[j] = v;
    d[i] = a;
    j = (j + 1) % p;
  }
  telOnbellek.set(anahtar, b);
  return b;
}
let gurultu: AudioBuffer | null = null;

class FilmMuzik {
  private c: AudioContext | null = null;
  cikis: GainNode | null = null;
  private duck: GainNode | null = null;
  ruh: Ruh = 'nese';
  private sonraki: Ruh | null = null;
  private zaman = 0;
  private adim = 0;
  private sayac = 0;
  private calisiyor = false;
  private bitis = false;
  private duckBitis = 0;

  baslat(ruh: Ruh = 'nese') {
    const c = baglam();
    const ana = muzikCikisi();
    if (!c || !ana) return;
    // oyunların ninni müziği filmde susar
    muzikDurdur();
    ana.gain.cancelScheduledValues(c.currentTime);
    ana.gain.setTargetAtTime(1, c.currentTime, 0.3);
    this.c = c;
    if (!this.cikis) {
      this.duck = c.createGain();
      this.cikis = c.createGain();
      this.cikis.gain.value = 0.9;
      this.cikis.connect(this.duck).connect(ana);
    }
    this.cikis.gain.cancelScheduledValues(c.currentTime);
    this.cikis.gain.setTargetAtTime(0.9, c.currentTime, 0.4);
    this.ruh = ruh;
    this.sonraki = null;
    this.bitis = false;
    this.adim = 0;
    this.zaman = c.currentTime + 0.1;
    this.devam();
  }

  /** Ruh hâli değişir (bir sonraki ölçü başında) */
  degis(ruh: Ruh) {
    if (!this.calisiyor && !this.c) return;
    this.sonraki = ruh;
  }

  /** Konuşma sırasında müziği kıs */
  kis(sn: number) {
    if (!this.c || !this.duck) return;
    const t = this.c.currentTime;
    this.duckBitis = Math.max(this.duckBitis, t + sn);
    this.duck.gain.cancelScheduledValues(t);
    this.duck.gain.setTargetAtTime(0.32, t, 0.08);
    this.duck.gain.setTargetAtTime(1, this.duckBitis, 0.35);
  }

  duraklat(d: boolean) {
    if (!this.c || !this.cikis) return;
    if (d) {
      this.durdurZamanlayici();
      this.cikis.gain.setTargetAtTime(0, this.c.currentTime, 0.08);
    } else if (!this.bitis) {
      this.cikis.gain.setTargetAtTime(0.9, this.c.currentTime, 0.2);
      this.zaman = this.c.currentTime + 0.1;
      this.devam();
    }
  }

  /** Yumuşakça sustur */
  dur(sn = 1.5) {
    this.durdurZamanlayici();
    if (this.c && this.cikis) this.cikis.gain.setTargetAtTime(0, this.c.currentTime, sn / 3);
  }

  private devam() {
    if (this.calisiyor) return;
    this.calisiyor = true;
    this.sayac = window.setInterval(() => this.planla(), 90);
    this.planla();
  }
  private durdurZamanlayici() {
    this.calisiyor = false;
    clearInterval(this.sayac);
  }

  /** MP4 kaydı (film/src/kayit.ts): zamanlayıcı yerine çevrimdışı işlemede dışarıdan adım */
  adimAt() {
    if (this.calisiyor) this.planla();
  }

  /** önümüzdeki ~0.35 sn'nin notalarını zamanla */
  private planla() {
    const c = this.c;
    if (!c || !this.cikis) return;
    while (this.zaman < c.currentTime + 0.35 && this.calisiyor) {
      if (this.adim % 8 === 0 && this.sonraki) {
        this.ruh = this.sonraki;
        this.sonraki = null;
        this.adim = 0;
      }
      const tema = TEMA[this.ruh];
      const sekizlik = 60 / tema.bpm / 2;
      this.adimCal(tema, this.adim, this.zaman, sekizlik);
      this.zaman += sekizlik;
      this.adim++;
      if (this.adim >= 32) {
        if (this.ruh === 'kapanis') {
          // son akor çınlar, müzik biter
          this.sonAkor(this.zaman);
          this.bitis = true;
          this.durdurZamanlayici();
          return;
        }
        this.adim = 0;
      }
    }
  }

  private adimCal(tema: Tema, adim: number, t: number, sekizlik: number) {
    const olcu = Math.floor(adim / 8);
    const ic = adim % 8;
    const [kok, tur] = tema.akorlar[olcu % tema.akorlar.length];
    const nota = akorNotalari(kok, tur);
    // bas: ölçü başı ve 3. vuruş (üzgünde yalnız ölçü başı)
    if (ic === 0 || (ic === 4 && tema.arpej !== 'seyrek')) this.bas(kok - 24 + (kok > 64 ? -12 : 0) + 12, t, sekizlik * (tema.arpej === 'seyrek' ? 7 : 3.5));
    // arpej (tel)
    const desen: Record<Tema['arpej'], (number | null)[]> = {
      hop: [0, 2, 1, 2, 0, 2, 1, 2],
      seyrek: [0, null, 1, null, 2, null, 1, null],
      dolu: [0, 1, 2, 1, 0, 1, 2, 1],
    };
    const k = desen[tema.arpej][ic];
    if (k !== null) this.telCal(nota[k] - 12 + (k === 2 && ic % 4 === 2 ? 12 : 0), t, tema.arpej === 'seyrek' ? 0.1 : 0.085, 0.45);
    // melodi (daha parlak tel, ukulele gibi)
    const m = tema.melodi[adim];
    if (m) this.telCal(m, t, 0.11, 0.8);
    // shaker (arka vuruşlarda)
    if (tema.shaker && ic % 2 === 1) this.shaker(t, ic % 4 === 3 ? 0.05 : 0.03);
    // pad (ölçü başında, sıcak akor)
    if (tema.pad && ic === 0) this.pad(nota, t, sekizlik * 8);
  }

  private telCal(midi: number, t: number, ses: number, parlak: number) {
    const c = this.c!;
    const s = c.createBufferSource();
    s.buffer = tel(c, midi, parlak);
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 2400 + parlak * 2600;
    const g = c.createGain();
    g.gain.value = ses;
    s.connect(f).connect(g).connect(this.cikis!);
    s.start(t);
    s.stop(t + 1.6);
  }

  private bas(midi: number, t: number, sure: number) {
    const c = this.c!;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'triangle';
    o.frequency.value = hz(midi);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
    o.connect(g).connect(this.cikis!);
    o.start(t);
    o.stop(t + sure + 0.05);
  }

  private shaker(t: number, ses: number) {
    const c = this.c!;
    if (!gurultu) {
      gurultu = c.createBuffer(1, c.sampleRate / 2, c.sampleRate);
      const d = gurultu.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const s = c.createBufferSource();
    s.buffer = gurultu;
    const f = c.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 6000;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(ses, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    s.connect(f).connect(g).connect(this.cikis!);
    s.start(t);
    s.stop(t + 0.1);
  }

  private pad(nota: number[], t: number, sure: number) {
    const c = this.c!;
    for (const n of nota) {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'sine';
      o.frequency.value = hz(n);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.028, t + sure * 0.3);
      g.gain.linearRampToValueAtTime(0.0001, t + sure);
      o.connect(g).connect(this.cikis!);
      o.start(t);
      o.stop(t + sure + 0.05);
    }
  }

  private sonAkor(t: number) {
    for (const [i, n] of [48, 60, 64, 67, 72, 76].entries()) this.telCal(n, t + i * 0.05, 0.1, 0.6);
    this.pad([60, 64, 67], t, 3);
    this.bas(48, t, 3);
  }
}

export const filmMuzik = new FilmMuzik();
// test / gösterim: sayfadan durumu okunabilsin (Playwright ile müziğin çaldığı ölçülür)
if (typeof location !== 'undefined' && /[?&](test|onizleme)=/.test(location.search)) (window as unknown as { __filmMuzik: unknown }).__filmMuzik = filmMuzik;
