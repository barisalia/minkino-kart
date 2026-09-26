import { durum } from '../engine/ilerleme';

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
      konusmaAnaliz.fftSize = 512;
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

export function seviyeleriUygula() {
  if (!ctx || !ana || !efektKanal) return;
  const a = durum.i.ayarlar;
  ana.gain.setTargetAtTime(a.seviye, ctx.currentTime, 0.05);
  efektKanal.gain.setTargetAtTime(a.efekt ? 0.9 : 0, ctx.currentTime, 0.05);
}

/** Konuşma sırasında müziği kısar. */
let mikrofonDinliyor = false;
/** Arka plan müziğinin olması gereken seviyesi: ayar kapalıysa ya da mikrofon dinliyorsa 0 */
export const muzikSeviyesi = (kis = false) => (durum.i.ayarlar.muzik && !mikrofonDinliyor ? (kis ? 0.3 : 1) : 0);

/**
 * Mikrofon bir görevi dinlerken arka plan müziği susar: yankı iptali kapalı, telefonun hoparlörü mikrofona yakın;
 * oyun kendi müziğini çocuğun sesi (üfleme, alkış) sanmasın.
 */
export function mikrofonDinliyorMu(d: boolean) {
  if (d === mikrofonDinliyor) return;
  mikrofonDinliyor = d;
  if (ctx && muzikKanal) muzikKanal.gain.setTargetAtTime(muzikSeviyesi(), ctx.currentTime, d ? 0.06 : 0.6);
}

export function muzikKis(kis: boolean) {
  if (!ctx || !muzikKanal || !efektKanal) return;
  const a = durum.i.ayarlar;
  muzikKanal.gain.setTargetAtTime(muzikSeviyesi(kis), ctx.currentTime, kis ? 0.08 : 0.4);
  // Konuşma sırasında efektler de geri planda kalsın (ses anlaşılır olsun, cızırdamasın)
  efektKanal.gain.setTargetAtTime(a.efekt ? (kis ? 0.45 : 0.9) : 0, ctx.currentTime, kis ? 0.05 : 0.3);
}

document.addEventListener('visibilitychange', () => {
  if (!ctx) return;
  if (document.hidden) void ctx.suspend();
  else void ctx.resume();
});
