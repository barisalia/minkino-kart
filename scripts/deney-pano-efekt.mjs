// Deneyler · Mucit Panosu efekt sesleri: kodla üretilir (ElevenLabs yalnız konuşma için; müzik yok).
// Her ses saf sinüs/gürültü bileşimi; 44,1 kHz mono → WAV → MP3 (ffmpeg-static). Çıktı: assets/deney/pano/ses/efekt-<ad>.mp3
// Kullanım: node scripts/deney-pano-efekt.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ffmpeg = require('ffmpeg-static');
const kok = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const klasor = path.join(kok, 'assets', 'deney', 'pano', 'ses');
fs.mkdirSync(klasor, { recursive: true });
const SR = 44100;

// Belirlenimci gürültü (aynı dosya her seferinde aynı çıkar).
let tohum = 12345;
const rasgele = () => { tohum = (tohum * 1103515245 + 12345) & 0x7fffffff; return tohum / 0x7fffffff * 2 - 1; };
const tampon = (sn) => new Float32Array(Math.ceil(sn * SR));
const zarf = (t, atak, sonum) => (t < atak ? t / atak : Math.exp(-(t - atak) / sonum));

/** Frekansı zamanla değişen sinüs (faz birikimli). */
function sinus(b, bas, sure, frek, genlik, atak = 0.003, sonum = 0.1) {
  let faz = 0;
  const i0 = Math.floor(bas * SR), n = Math.floor(sure * SR);
  for (let i = 0; i < n && i0 + i < b.length; i++) {
    const t = i / SR;
    faz += 2 * Math.PI * frek(t) / SR;
    b[i0 + i] += Math.sin(faz) * genlik * zarf(t, atak, sonum);
  }
}
/** Bant geçiren gürültü patlaması (iki kutuplu rezonatör). */
function gurultu(b, bas, sure, merkez, q, genlik, sonum) {
  const i0 = Math.floor(bas * SR), n = Math.floor(sure * SR);
  const w = 2 * Math.PI * merkez / SR, r = Math.exp(-w / (2 * q));
  const a1 = 2 * r * Math.cos(w), a2 = -r * r;
  let y1 = 0, y2 = 0;
  for (let i = 0; i < n && i0 + i < b.length; i++) {
    const y = rasgele() * (1 - r) + a1 * y1 + a2 * y2;
    y2 = y1; y1 = y;
    b[i0 + i] += y * genlik * zarf(i / SR, 0.001, sonum) * 6;
  }
}

const sesler = {
  // Borularda akan su (döngü): kabarcık sesleri ve hafif şırıltı.
  su(b = tampon(1.2)) {
    let t = 0;
    while (t < 1.15) { const f = 300 + 500 * Math.abs(rasgele()); sinus(b, t, 0.07, (x) => f + 2600 * x, 0.12, 0.004, 0.025); t += 0.05 + 0.06 * Math.abs(rasgele()); }
    gurultu(b, 0, 1.2, 700, 0.8, 0.04, 2);
    const k = Math.floor(0.02 * SR);
    for (let i = 0; i < k; i++) { b[i] *= i / k; b[b.length - 1 - i] *= i / k; }
    return b;
  },
  // Açık uçtan su fışkırır: tiz hışırtı ve damlalar.
  fiskir(b = tampon(0.9)) {
    gurultu(b, 0, 0.8, 2600, 0.9, 0.5, 0.3);
    for (let i = 0; i < 6; i++) sinus(b, 0.15 + i * 0.1, 0.06, (x) => 1400 + 3000 * x, 0.1, 0.002, 0.02);
    return b;
  },
  // Kırmızı vana döner: cırcır ve kısa gıcırtı.
  vana(b = tampon(0.55)) {
    for (let i = 0; i < 5; i++) gurultu(b, i * 0.07, 0.03, 1800, 3, 0.35, 0.006);
    sinus(b, 0.05, 0.4, (x) => 700 + 900 * x, 0.08, 0.03, 0.2);
    return b;
  },
  // Su çarkı döner (döngü): tahta tıkırtıları.
  cark(b = tampon(1.0)) {
    for (let t = 0; t < 0.98; t += 0.125) { gurultu(b, t, 0.04, 380, 2, 0.35, 0.015); sinus(b, t, 0.08, () => 160, 0.15, 0.002, 0.03); }
    return b;
  },
  // Şalter iner: tok bir tık.
  salter(b = tampon(0.3)) {
    sinus(b, 0, 0.2, (x) => 140 - 200 * x, 0.6, 0.002, 0.05);
    gurultu(b, 0, 0.03, 3000, 2, 0.4, 0.006);
    return b;
  },
  // Ampul yanar: yükselen ılık uğultu ve parlak bir çın.
  ampul(b = tampon(0.9)) {
    sinus(b, 0, 0.6, (x) => 120 + 220 * x, 0.25, 0.08, 0.3);
    sinus(b, 0.25, 0.6, () => 1760, 0.18, 0.003, 0.25);
    sinus(b, 0.25, 0.4, () => 2637, 0.06, 0.003, 0.15);
    return b;
  },
  // Pervane döner (döngü): hafif rüzgâr vınlaması.
  pervane(b = tampon(1.0)) {
    const n = b.length;
    for (let i = 0; i < n; i++) b[i] += rasgele() * 0.05 * (0.6 + 0.4 * Math.sin(2 * Math.PI * 14 * i / SR));
    sinus(b, 0, 1.0, () => 220, 0.03, 0.05, 5);
    const k = Math.floor(0.02 * SR);
    for (let i = 0; i < k; i++) { b[i] *= i / k; b[n - 1 - i] *= i / k; }
    return b;
  },
  // Devre tamamlanmadı: kısa, yumuşak vızıltı (ceza değil).
  bzz(b = tampon(0.35)) {
    for (let i = 0; i < b.length; i++) { const t = i / SR; b[i] += Math.sign(Math.sin(2 * Math.PI * 95 * t)) * 0.12 * Math.exp(-t / 0.12); }
    return b;
  },
};

function wavYaz(dosya, b) {
  // Tepe -3 dBFS'e çekilir.
  let tepe = 0;
  for (const v of b) tepe = Math.max(tepe, Math.abs(v));
  const k = tepe > 0 ? 0.707 / tepe : 1;
  const veri = Buffer.alloc(44 + b.length * 2);
  veri.write('RIFF', 0); veri.writeUInt32LE(36 + b.length * 2, 4); veri.write('WAVE', 8); veri.write('fmt ', 12);
  veri.writeUInt32LE(16, 16); veri.writeUInt16LE(1, 20); veri.writeUInt16LE(1, 22); veri.writeUInt32LE(SR, 24);
  veri.writeUInt32LE(SR * 2, 28); veri.writeUInt16LE(2, 32); veri.writeUInt16LE(16, 34); veri.write('data', 36); veri.writeUInt32LE(b.length * 2, 40);
  b.forEach((v, i) => veri.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * k * 32767))), 44 + i * 2));
  fs.writeFileSync(dosya, veri);
}

const gecici = fs.mkdtempSync(path.join(kok, 'node_modules', '.pano-efekt-'));
for (const [ad, uret] of Object.entries(sesler)) {
  const wav = path.join(gecici, ad + '.wav');
  wavYaz(wav, uret());
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', wav, '-codec:a', 'libmp3lame', '-b:a', '96k', path.join(klasor, 'efekt-' + ad + '.mp3')]);
  console.log('✓', ad);
}
fs.rmSync(gecici, { recursive: true, force: true });
