// Deneyler · Köpüren Renk Volkanı efekt sesleri: kodla üretilir (ElevenLabs yalnız konuşma için; müzik yok).
// Saf sinüs ve süzülmüş gürültü; 44,1 kHz mono → WAV → MP3 (ffmpeg-static). Çıktı: assets/deney/volkan/ses/efekt-<ad>.mp3
// Kullanım: node scripts/deney-volkan-efekt.mjs [ad…]   (ad verilirse yalnız onlar yazılır)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ffmpeg = require('ffmpeg-static');
const kok = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const klasor = path.join(kok, 'assets', 'deney', 'volkan', 'ses');
fs.mkdirSync(klasor, { recursive: true });
const SR = 44100;

let tohum = 4242;
const rasgele = () => { tohum = (tohum * 1103515245 + 12345) & 0x7fffffff; return tohum / 0x7fffffff * 2 - 1; };
const tampon = (sn) => new Float32Array(Math.ceil(sn * SR));
const zarf = (t, atak, sonum) => (t < atak ? t / atak : Math.exp(-(t - atak) / sonum));
function sinus(b, bas, sure, frek, genlik, atak = 0.003, sonum = 0.1) {
  let faz = 0;
  const i0 = Math.floor(bas * SR), n = Math.floor(sure * SR);
  for (let i = 0; i < n && i0 + i < b.length; i++) {
    const t = i / SR;
    faz += 2 * Math.PI * frek(t) / SR;
    b[i0 + i] += Math.sin(faz) * genlik * zarf(t, atak, sonum);
  }
}
function gurultu(b, bas, sure, merkez, q, genlik, sonum, atak = 0.001) {
  const i0 = Math.floor(bas * SR), n = Math.floor(sure * SR);
  const w = 2 * Math.PI * merkez / SR, r = Math.exp(-w / (2 * q));
  const a1 = 2 * r * Math.cos(w), a2 = -r * r;
  let y1 = 0, y2 = 0;
  for (let i = 0; i < n && i0 + i < b.length; i++) {
    const y = rasgele() * (1 - r) + a1 * y1 + a2 * y2;
    y2 = y1; y1 = y;
    b[i0 + i] += y * genlik * zarf(i / SR, atak, sonum) * 6;
  }
}
/** Kabarcık "blup": kısa, yukarı kayan yuvarlak ton. */
const blup = (b, bas, f, g) => sinus(b, bas, 0.09, (t) => f * (1 + 6 * t), g, 0.004, 0.03);

const sesler = {
  // Şişeden kolbaya döküş: "gulu-gulu" (alçak, yuvarlak kabarcıklar) + akan suyun hışırtısı.
  dok(b = tampon(0.8)) {
    gurultu(b, 0, 0.75, 1400, 0.8, 0.07, 0.5, 0.05);
    for (const [t, f] of [[0.02, 230], [0.16, 260], [0.3, 210], [0.44, 250], [0.58, 220]]) blup(b, t, f, 0.32);
    return b;
  },
  // Renkler karışırken girdap: yükselen yumuşak ton ve ince kabarcıklar.
  girdap(b = tampon(0.6)) {
    sinus(b, 0, 0.55, (t) => 380 + 500 * t, 0.12, 0.08, 0.25);
    for (const [t, f] of [[0.1, 700], [0.22, 820], [0.34, 760], [0.44, 900]]) blup(b, t, f, 0.1);
    return b;
  },
  // Kaşık kavanoza dalar: kuru tozun "şık"ı.
  kasik(b = tampon(0.3)) { gurultu(b, 0, 0.2, 3200, 1.4, 0.22, 0.05); gurultu(b, 0.06, 0.15, 1800, 1.2, 0.12, 0.04); return b; },
  // Karbonat volkana dökülür: yumuşak "şşş" ve küçük bir "puf".
  karbonat(b = tampon(0.5)) { gurultu(b, 0, 0.45, 5200, 0.6, 0.12, 0.18, 0.04); gurultu(b, 0.3, 0.15, 700, 1, 0.12, 0.05); return b; },
  // Sirke karbonata değince: "fısss-blup-blup" (bir saniye).
  fizz(b = tampon(1.1)) {
    gurultu(b, 0, 1.05, 6000, 0.5, 0.14, 0.7, 0.08);
    for (let i = 0; i < 9; i++) blup(b, 0.08 + i * 0.1 + 0.03 * Math.abs(rasgele()), 380 + 260 * Math.abs(rasgele()), 0.22);
    return b;
  },
  // Köpük taşar: yukarı kabaran "vuuuş" ve bol kabarcık.
  patlama(b = tampon(1.5)) {
    sinus(b, 0, 1.0, (t) => 140 + 260 * Math.min(1, t / 0.35), 0.3, 0.05, 0.35);
    gurultu(b, 0, 1.4, 900, 0.7, 0.2, 0.45, 0.06);
    for (let i = 0; i < 16; i++) blup(b, 0.15 + i * 0.075 + 0.03 * Math.abs(rasgele()), 300 + 500 * Math.abs(rasgele()), 0.2);
    return b;
  },
  // Kolba dolu / boş: komik, yumuşak "bıdık" (iki kısa, düşen ton).
  bidik(b = tampon(0.4)) {
    sinus(b, 0, 0.12, (t) => 620 - 900 * t, 0.28, 0.004, 0.05);
    sinus(b, 0.14, 0.2, (t) => 420 - 500 * t, 0.3, 0.004, 0.07);
    return b;
  },
  // Kabarcık patlar: minik "pıt".
  pit(b = tampon(0.12)) { sinus(b, 0, 0.08, (t) => 1100 - 5000 * t, 0.4, 0.001, 0.02); return b; },
  // Dokunuş: yumuşak "tık" (her parçaya basınca).
  tik(b = tampon(0.15)) { sinus(b, 0, 0.05, (t) => 1500 - 800 * t / 0.05, 0.3, 0.001, 0.015); sinus(b, 0.015, 0.1, () => 640, 0.3, 0.002, 0.03); return b; },
  // Hedef tuttu: yukarı çıkan üç ince pırıltı.
  pirilti(b = tampon(0.8)) { [1319, 1760, 2349].forEach((f, i) => sinus(b, i * 0.08, 0.5, () => f, 0.16, 0.002, 0.14)); return b; },
  // ----- İkinci yazım (23 Kasım): hazırlık, malzemeler, köpüğün akışı, temizlik, defter -----
  // Önlük Kino'ya giyilir: kumaş hışırtısı (iki yumuşak hışırtı).
  kumas(b = tampon(0.5)) { gurultu(b, 0, 0.22, 2400, 0.7, 0.13, 0.08, 0.03); gurultu(b, 0.18, 0.28, 1800, 0.7, 0.12, 0.1, 0.04); return b; },
  // Gözlük takılır: lastik kayışın "çıt"ı.
  cit(b = tampon(0.25)) { gurultu(b, 0, 0.05, 4200, 2, 0.25, 0.012); sinus(b, 0, 0.12, (t) => 1900 - 3000 * t, 0.22, 0.001, 0.03); return b; },
  // Örtü serilir: soldan sağa açılan "fırrt" (merkezi yükselen kısa hışırtılar).
  firt(b = tampon(0.7)) { for (let i = 0; i < 8; i++) gurultu(b, i * 0.065, 0.16, 700 + i * 320, 0.8, 0.075, 0.06, 0.02); return b; },
  // Volkan tezgâha konur: yumuşak, tok "güm".
  gum(b = tampon(0.55)) { sinus(b, 0, 0.45, (t) => 95 - 50 * Math.min(1, t / 0.25), 0.6, 0.004, 0.13); sinus(b, 0, 0.3, (t) => 200 - 110 * Math.min(1, t / 0.2), 0.45, 0.003, 0.09); gurultu(b, 0, 0.14, 650, 0.9, 0.3, 0.05); return b; },
  // Cam kolba konur: ince cam çınlaması.
  cin(b = tampon(1)) { [[2093, 0.16], [3136, 0.1], [4186, 0.06]].forEach(([f, g]) => sinus(b, 0, 0.95, () => f, g, 0.002, 0.3)); return b; },
  // Karbonat tozu pufler: boğuk "puf".
  puf(b = tampon(0.45)) { gurultu(b, 0, 0.4, 850, 0.5, 0.2, 0.12, 0.02); gurultu(b, 0.02, 0.2, 3000, 0.7, 0.05, 0.06, 0.01); return b; },
  // Şişe kasası konur: şişeler birbirine değer, "şıngır".
  singir(b = tampon(0.8)) {
    [[0, 2637], [0.09, 3136], [0.2, 2794], [0.32, 3520]].forEach(([t0, f]) => { sinus(b, t0, 0.45, () => f, 0.13, 0.001, 0.14); sinus(b, t0, 0.3, () => f * 1.5, 0.05, 0.001, 0.06); });
    gurultu(b, 0, 0.1, 500, 0.8, 0.12, 0.03);
    return b;
  },
  // Köpük kaynar: "blup-blup" (sıra sıra kabarcık).
  blup(b = tampon(0.55)) { [[0, 300], [0.1, 380], [0.2, 260], [0.31, 420], [0.4, 330]].forEach(([t0, f]) => blup(b, t0, f, 0.3)); return b; },
  // Köpük tepsiye düşer / çıkartma yapışır: ıslak "şap".
  sap(b = tampon(0.3)) { gurultu(b, 0, 0.18, 1300, 0.6, 0.25, 0.045, 0.002); sinus(b, 0, 0.12, (t) => 220 - 900 * t, 0.25, 0.002, 0.04); return b; },
  // Sünger sürter: döngülük "fış fış" (sekiz kez hışırtı; uçları sessiz, döngü dikişsiz).
  fis(b = tampon(0.5)) {
    const n = b.length;
    for (let k = 0; k < 4; k++) gurultu(b, k * 0.125, 0.12, 3400, 0.6, 0.09, 0.045, 0.02);
    for (let i = 0; i < 300; i++) { b[i] *= i / 300; b[n - 1 - i] *= i / 300; }
    return b;
  },
  // Birikinti temizlendi: tek ince "ting".
  ting(b = tampon(0.7)) { sinus(b, 0, 0.65, () => 2637, 0.17, 0.002, 0.2); sinus(b, 0.05, 0.6, () => 3951, 0.09, 0.002, 0.16); return b; },
  // Deney defteri açılır: sayfa hışırtısı ve küçük kapak sesi.
  sayfa(b = tampon(0.5)) { gurultu(b, 0, 0.3, 2200, 0.5, 0.12, 0.09, 0.04); gurultu(b, 0.25, 0.12, 600, 0.8, 0.15, 0.03); return b; },
  // Parça yerine oturur: "tak".
  tak(b = tampon(0.18)) { sinus(b, 0, 0.1, (t) => 720 - 2500 * t, 0.35, 0.001, 0.025); gurultu(b, 0, 0.03, 2500, 1.5, 0.15, 0.008); return b; },
  // Uçuş: kısa, hafif "vuu".
  vuu(b = tampon(0.45)) { for (let i = 0; i < 6; i++) gurultu(b, i * 0.05, 0.14, 600 + i * 220, 0.9, 0.06, 0.07, 0.04); return b; },
};

function wavYaz(dosya, b) {
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

const gecici = fs.mkdtempSync(path.join(kok, 'node_modules', '.volkan-efekt-'));
const secili = process.argv.slice(2);
for (const [ad, uret] of Object.entries(sesler)) {
  if (secili.length && !secili.includes(ad)) continue;
  const wav = path.join(gecici, ad + '.wav');
  wavYaz(wav, uret());
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', wav, '-codec:a', 'libmp3lame', '-b:a', '96k', path.join(klasor, 'efekt-' + ad + '.mp3')]);
  console.log('✓', ad);
}
fs.rmSync(gecici, { recursive: true, force: true });
