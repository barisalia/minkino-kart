import { durum } from '../engine/ilerleme';
import { baglam, muzikCikisi } from './motor';

/**
 * Hafif arka plan müziği: Web Audio ile çalınan yumuşak, pentatonik bir ninni-döngüsü.
 * Dosya gerekmez; ileride gerçek müzik dosyasıyla değiştirilebilir.
 */
const TEMPO = 92;
const VURUS = 60 / TEMPO / 2; // sekizlik
// 32 sekizlik: melodi (MIDI, 0 = sus)
const MELODI = [
  72, 0, 76, 0, 79, 0, 76, 74, 72, 0, 74, 0, 76, 0, 0, 0,
  69, 0, 72, 0, 76, 0, 74, 72, 74, 0, 72, 0, 67, 0, 0, 0,
  72, 0, 76, 0, 79, 0, 81, 79, 76, 0, 79, 0, 84, 0, 0, 0,
  81, 0, 79, 0, 76, 0, 74, 76, 72, 0, 0, 0, 0, 0, 0, 0,
];
const BAS = [48, 48, 45, 45, 41, 41, 43, 43];

let calisiyor = false;
let sonraki = 0;
let adim = 0;
let zamanlayici: number | undefined;

const hz = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

function nota(c: AudioContext, cikis: AudioNode, frek: number, t: number, sure: number, ses: number, tip: OscillatorType) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = tip;
  o.frequency.value = frek;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(ses, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  o.connect(g).connect(cikis);
  o.start(t);
  o.stop(t + sure + 0.05);
}

function planla() {
  const c = baglam();
  const cikis = muzikCikisi();
  if (!c || !cikis || !calisiyor) return;
  while (sonraki < c.currentTime + 0.3) {
    const m = MELODI[adim % MELODI.length];
    if (m) {
      nota(c, cikis, hz(m), sonraki, VURUS * 2.6, 0.045, 'sine');
      nota(c, cikis, hz(m) * 2, sonraki, VURUS * 1.2, 0.012, 'triangle');
    }
    if (adim % 8 === 0) {
      const b = BAS[Math.floor(adim / 8) % BAS.length];
      nota(c, cikis, hz(b), sonraki, VURUS * 7, 0.05, 'triangle');
    }
    if (adim % 4 === 2) nota(c, cikis, hz(BAS[Math.floor(adim / 8) % BAS.length] + 19), sonraki, VURUS * 1.5, 0.014, 'sine');
    sonraki += VURUS;
    adim++;
  }
}

export function muzikBaslat() {
  const c = baglam();
  const cikis = muzikCikisi();
  if (!c || !cikis || calisiyor) return;
  calisiyor = true;
  sonraki = c.currentTime + 0.1;
  cikis.gain.cancelScheduledValues(c.currentTime);
  cikis.gain.setValueAtTime(0, c.currentTime);
  cikis.gain.linearRampToValueAtTime(durum.i.ayarlar.muzik ? 1 : 0, c.currentTime + 2);
  zamanlayici = window.setInterval(planla, 100);
  planla();
}

export function muzikDurdur() {
  calisiyor = false;
  if (zamanlayici) clearInterval(zamanlayici);
  zamanlayici = undefined;
}

export function muzikAyarUygula() {
  const c = baglam();
  const cikis = muzikCikisi();
  if (!c || !cikis) return;
  cikis.gain.setTargetAtTime(durum.i.ayarlar.muzik ? 1 : 0, c.currentTime, 0.2);
}
