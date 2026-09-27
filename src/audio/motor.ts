import { durum } from '../engine/ilerleme';
import { olcumHesapla, type Olcum } from './dudak-mantik';

/** Paylaşılan Web Audio bağlamı. İlk dokunuşta açılır (iOS kuralı). */
let ctx: AudioContext | null = null;
let ana: GainNode | null = null;
let efektKanal: GainNode | null = null;
let muzikKanal: GainNode | null = null;
let konusmaKanal: GainNode | null = null;
let konusmaAnaliz: AnalyserNode | null = null;

export function baglam(): AudioContext | null {
  return ctx;
}
export function efektCikisi(): GainNode | null {
  return efektKanal;
}
export function muzikCikisi(): GainNode | null {
  return muzikKanal;
}
export function konusmaCikisi(): GainNode | null {
  return konusmaKanal;
}
/** Konuşma sesinin anlık gücü (0..1) — karakterin ağız hareketi için. */
let analizTampon: Float32Array<ArrayBuffer> | null = null;
export function konusmaGucu(): number {
  if (!konusmaAnaliz) return 0;
  analizTampon ??= new Float32Array(konusmaAnaliz.fftSize);
  konusmaAnaliz.getFloatTimeDomainData(analizTampon);
  let t = 0;
  for (const v of analizTampon) t += v * v;
  return Math.min(1, Math.sqrt(t / analizTampon.length) * 4.5);
}

/**
 * Konuşma sesinin şu anki ölçümü (yükseklik + parlaklık; dudak senkronu, src/audio/dudak.ts). Aynı karede birden
 * çok karakter sorarsa bir kez ölçülür. Ses bağlamı yoksa null.
 */
let sonOlcum: { ms: number; o: Olcum } | null = null;
export function konusmaOlcum(): Olcum | null {
  if (!konusmaAnaliz || !ctx) return null;
  const simdi = performance.now();
  if (sonOlcum && simdi - sonOlcum.ms < 5) return sonOlcum.o;
  analizTampon ??= new Float32Array(konusmaAnaliz.fftSize);
  konusmaAnaliz.getFloatTimeDomainData(analizTampon);
  sonOlcum = { ms: simdi, o: olcumHesapla(analizTampon, ctx.sampleRate) };
  return sonOlcum.o;
}

export function sesMotorunuAc(): AudioContext | null {
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC({ latencyHint: 'interactive' });
      ana = ctx.createGain();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -12;
      comp.knee.value = 12;
      comp.ratio.value = 3;
      ana.connect(comp).connect(ctx.destination);
      efektKanal = ctx.createGain();
      muzikKanal = ctx.createGain();
      konusmaKanal = ctx.createGain();
      konusmaKanal.gain.value = 1.15;
      efektKanal.connect(ana);
      muzikKanal.connect(ana);
      konusmaKanal.connect(ana);
      konusmaAnaliz = ctx.createAnalyser();
      // ~21 ms'lik pencere: dudak senkronunun ölçümü (yükseklik + parlaklık)
      konusmaAnaliz.fftSize = 1024;
      konusmaAnaliz.smoothingTimeConstant = 0.5;
      konusmaKanal.connect(konusmaAnaliz);
      seviyeleriUygula();
    }
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    ctx = null;
  }
  return ctx;
}

/**
 * Ses bağlamını geçici olarak başkasıyla değiştirir (ör. filmin MP4 kaydında OfflineAudioContext: aynı efekt,
 * müzik ve konuşma kodu dosyaya işlenir). Aynı kanal zinciri yeni bağlamda kurulur; dönen işlev eskisine döndürür.
 * Oyunlarda kullanılmaz.
 */
export function baglamiDegistir(yeni: BaseAudioContext): () => void {
  const eski = { ctx, ana, efektKanal, muzikKanal, konusmaKanal, konusmaAnaliz };
  const c = yeni as AudioContext;
  ctx = c;
  ana = c.createGain();
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -12;
  comp.knee.value = 12;
  comp.ratio.value = 3;
  ana.connect(comp).connect(c.destination);
  efektKanal = c.createGain();
  muzikKanal = c.createGain();
  konusmaKanal = c.createGain();
  konusmaKanal.gain.value = 1.15;
  efektKanal.connect(ana);
  muzikKanal.connect(ana);
  konusmaKanal.connect(ana);
  konusmaAnaliz = null;
  const a = durum.i.ayarlar;
  ana.gain.value = a.seviye;
  efektKanal.gain.value = a.efekt ? 0.9 : 0;
  muzikKanal.gain.value = a.muzik ? 1 : 0;
  return () => {
    ({ ctx, ana, efektKanal, muzikKanal, konusmaKanal, konusmaAnaliz } = eski);
  };
}

export function seviyeleriUygula() {
  if (!ctx || !ana || !efektKanal) return;
  const a = durum.i.ayarlar;
  ana.gain.setTargetAtTime(a.seviye, ctx.currentTime, 0.05);
  efektKanal.gain.setTargetAtTime(a.efekt ? 0.9 : 0, ctx.currentTime, 0.05);
}

/** Konuşma sırasında müziği kısar. */
export function muzikKis(kis: boolean) {
  if (!ctx || !muzikKanal || !efektKanal) return;
  const a = durum.i.ayarlar;
  muzikKanal.gain.setTargetAtTime(a.muzik ? (kis ? 0.3 : 1) : 0, ctx.currentTime, kis ? 0.08 : 0.4);
  // Konuşma sırasında efektler de geri planda kalsın (ses anlaşılır olsun, cızırdamasın)
  efektKanal.gain.setTargetAtTime(a.efekt ? (kis ? 0.45 : 0.9) : 0, ctx.currentTime, kis ? 0.05 : 0.3);
}

if (typeof document !== 'undefined')
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) void ctx.suspend();
    else void ctx.resume();
  });
