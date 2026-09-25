/**
 * Orman sesleri: hayvan sesleri (ElevenLabs efektleri, public/ses/efekt) + sentezlenen davul, rüzgar, nota.
 * Oyun ses çıkarırken kulak susturulur (çocuğun sesi sanılmasın).
 */
import { baglam, efektCikisi } from '../../src/audio/motor';
import { efekt } from '../../src/audio/ses';
import { resimSesi, resimSesiHazirla } from '../../canlan/src/ses';
import { kulak } from './kulak';

export type HayvanSesi = 'inek' | 'kopek' | 'kedi' | 'kus' | 'ayi' | 'sincap' | 'maymun' | 'baykus' | 'horlama' | 'fisek' | 'tavsan';

export function hayvanCal(ad: HayvanSesi, sus = 1600) {
  kulak.sustur(sus);
  void resimSesi(ad);
}
export const hayvanHazirla = (...adlar: HayvanSesi[]) => adlar.forEach(resimSesiHazirla);

function hazir(): [AudioContext, AudioNode] | null {
  const c = baglam();
  const o = efektCikisi();
  return c && o && c.state === 'running' ? [c, o] : null;
}

let gurultu: AudioBuffer | null = null;
function gurultuTamponu(c: AudioContext) {
  if (!gurultu) {
    gurultu = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = gurultu.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return gurultu;
}

/** Davul vuruşu: kalın (uzun vuruş) ya da ince (kısa). */
export function davul(kalin = true, ses = 0.5) {
  const h = hazir();
  kulak.sustur(260);
  if (!h) return;
  const [c, cikis] = h;
  const t = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(kalin ? 150 : 240, t);
  o.frequency.exponentialRampToValueAtTime(kalin ? 55 : 110, t + 0.18);
  g.gain.setValueAtTime(ses, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
  o.connect(g).connect(cikis);
  o.start(t);
  o.stop(t + 0.4);
  const s = c.createBufferSource();
  s.buffer = gurultuTamponu(c);
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = kalin ? 900 : 2200;
  const g2 = c.createGain();
  g2.gain.setValueAtTime(ses * 0.35, t);
  g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
  s.connect(f).connect(g2).connect(cikis);
  s.start(t);
  s.stop(t + 0.1);
}

/** Yumuşak çan notası (melodi görevleri, ilerleme). midi: 60 = do */
export function nota(midi: number, sure = 0.6, ses = 0.22) {
  const h = hazir();
  kulak.sustur(sure * 1000 + 200);
  if (!h) return;
  const [c, cikis] = h;
  const t = c.currentTime;
  const f = 440 * Math.pow(2, (midi - 69) / 12);
  for (const [k, s, tip] of [[1, ses, 'sine'], [2, ses * 0.3, 'sine'], [3, ses * 0.08, 'triangle']] as const) {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = tip;
    o.frequency.value = f * k;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(s, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
    o.connect(g).connect(cikis);
    o.start(t);
    o.stop(t + sure + 0.05);
  }
}

/** Küçük başarı sesi (görev içi adım) */
export function adim(sira: number) {
  kulak.sustur(500);
  efekt.nota(sira);
}

/** Büyük başarı (görev bitti) */
export function basari() {
  kulak.sustur(900);
  efekt.dogru();
}

/** Hata değil, "hımm" (yumuşak) */
export function hmm() {
  kulak.sustur(600);
  efekt.yanlis();
}
