// Deneyler · Zincirleme Top Parkuru efekt sesleri: kodla üretilir (ElevenLabs yalnız konuşma için; müzik yok).
// Her ses saf sinüs/gürültü bileşimi; 44,1 kHz mono → WAV → MP3 (ffmpeg-static). Çıktı: assets/deney/parkur/ses/efekt-<ad>.mp3
// Kullanım: node scripts/deney-parkur-efekt.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ffmpeg = require('ffmpeg-static');
const kok = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const klasor = path.join(kok, 'assets', 'deney', 'parkur', 'ses');
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
  // Kırmızı kol: ağır mekanik "KLANK" (alçak gövde + metal tınısı + kısa tık).
  klank(b = tampon(0.5)) {
    sinus(b, 0, 0.45, (t) => 95 - 35 * Math.min(1, t / 0.2), 0.7, 0.002, 0.16);
    for (const [f, g] of [[820, 0.22], [1370, 0.16], [2240, 0.1]]) sinus(b, 0.012, 0.3, () => f, g, 0.001, 0.07);
    gurultu(b, 0, 0.05, 2500, 2, 0.5, 0.012);
    return b;
  },
  // Parça yuvaya oturdu: mıknatıslı "TIK".
  tik(b = tampon(0.2)) {
    sinus(b, 0, 0.05, (t) => 1800 - 900 * t / 0.05, 0.35, 0.001, 0.015);
    sinus(b, 0.018, 0.12, () => 620, 0.45, 0.002, 0.035);
    return b;
  },
  // Tahta rampada yuvarlanma (döngü): sık, küçük tahta tıkırtıları + alçak uğultu.
  tikir(b = tampon(1.2)) {
    let t = 0;
    while (t < 1.18) {
      gurultu(b, t, 0.02, 700 + 500 * Math.abs(rasgele()), 3, 0.18 + 0.1 * Math.abs(rasgele()), 0.004);
      t += 0.035 + 0.025 * Math.abs(rasgele());
    }
    for (let i = 0; i < b.length; i++) b[i] += Math.sin(2 * Math.PI * 70 * i / SR) * 0.06 * (0.8 + 0.2 * Math.sin(2 * Math.PI * 3 * i / SR));
    // Döngü dikişi olmasın: uçlarda kısa yumuşatma.
    const k = Math.floor(0.02 * SR);
    for (let i = 0; i < k; i++) { b[i] *= i / k; b[b.length - 1 - i] *= i / k; }
    return b;
  },
  // Trambolin: "BOİNG" (yukarı kayan, titreşen yay sesi).
  boing(b = tampon(0.6)) {
    sinus(b, 0, 0.6, (t) => (t < 0.06 ? 150 + 4000 * t : 390 + 110 * Math.sin(2 * Math.PI * 17 * t) * Math.exp(-5 * t)), 0.55, 0.004, 0.22);
    sinus(b, 0, 0.3, (t) => 2 * (t < 0.06 ? 150 + 4000 * t : 390), 0.1, 0.004, 0.08);
    return b;
  },
  // Huni: top dönerken "vuuu" (iki buçuk turda kabarıp sönen hava sesi).
  vuu(b = tampon(0.7)) {
    const n = b.length;
    for (let i = 0; i < n; i++) {
      const t = i / SR, tur = 0.5 - 0.5 * Math.cos(2 * Math.PI * 2.5 * t / 0.62);
      b[i] += Math.sin(2 * Math.PI * (420 - 160 * t) * t) * 0.16 * tur * Math.min(1, (0.68 - t) / 0.08, t / 0.03);
    }
    gurultu(b, 0, 0.66, 900, 1.2, 0.12, 0.3);
    return b;
  },
  // Huniden çıkış: küçük "pıt".
  pit(b = tampon(0.15)) { sinus(b, 0, 0.12, (t) => 900 - 4000 * t, 0.45, 0.001, 0.03); return b; },
  // Top masaya düşer, seker: yumuşak "pıt-pof" (şiddeti kod ayarlar).
  sek(b = tampon(0.25)) {
    sinus(b, 0, 0.2, (t) => 150 - 260 * t, 0.7, 0.002, 0.05);
    gurultu(b, 0, 0.05, 600, 1.5, 0.25, 0.012);
    return b;
  },
  // Yanlış yuvaya bırakılan parça geri seker: oyuncaklı iki nota (iner).
  geri(b = tampon(0.35)) {
    sinus(b, 0, 0.12, () => 660, 0.3, 0.004, 0.05);
    sinus(b, 0.11, 0.2, (t) => 440 - 200 * t, 0.32, 0.004, 0.07);
    return b;
  },
  // Top başa uçar: yukarı kayan yumuşak "fiyuuu".
  uc(b = tampon(0.7)) { sinus(b, 0, 0.65, (t) => 300 + 900 * t, 0.25, 0.08, 0.35); return b; },
  // Zil çalınca konfeti: yukarı çıkan beş ince pırıltı.
  konfeti(b = tampon(0.9)) {
    [1568, 2093, 2637, 3136, 4186].forEach((f, i) => sinus(b, i * 0.06, 0.45, () => f, 0.12, 0.002, 0.12));
    return b;
  },
  // Masa zili "ÇINNN": çan kısmi tonları, uzun sönüm, hafif vuru (iki yakın ton).
  zil(b = tampon(2.2)) {
    const f0 = 1480;
    for (const [oran, g, s] of [[1, 0.42, 0.75], [1.003, 0.2, 0.7], [2.32, 0.16, 0.42], [2.76, 0.12, 0.33], [4.07, 0.07, 0.2]]) sinus(b, 0, 2.2, () => f0 * oran, g, 0.002, s);
    gurultu(b, 0, 0.02, 4000, 2, 0.3, 0.005);
    return b;
  },
};
// Dominolar: tahta ksilofon Do–Re–Mi–Fa (C5 D5 E5 F5): temel + 4. kısmi ton + tahta vuruşu.
for (const [ad, f] of [['do', 523.25], ['re', 587.33], ['mi', 659.25], ['fa', 698.46]]) {
  sesler['not-' + ad] = (b = tampon(0.8)) => {
    sinus(b, 0, 0.8, () => f, 0.5, 0.002, 0.28);
    sinus(b, 0, 0.3, () => f * 4, 0.12, 0.001, 0.05);
    sinus(b, 0, 0.2, () => f * 10, 0.03, 0.001, 0.015);
    gurultu(b, 0, 0.02, 3000, 2, 0.12, 0.004);
    return b;
  };
}

// Sonradan eklenenler (22 Kasım gecesi, yönetici: parkur daha zevkli): sona eklenir ki öbür seslerin gürültüsü aynı kalsın.
// Yanlış yuvaya bırakılan parça: yumuşak, komik bir "püf" (hava çıkışı ve küçük düşen ton).
sesler.puf = (b = tampon(0.45)) => {
  gurultu(b, 0, 0.3, 900, 0.7, 0.35, 0.09);
  sinus(b, 0.02, 0.3, (x) => 420 - 700 * x, 0.25, 0.004, 0.09);
  return b;
};
// Kol bırakılınca yay gibi geri teper: kısa metal yay titreşimi.
sesler.yay = (b = tampon(0.5)) => {
  sinus(b, 0, 0.45, (x) => 300 + 60 * Math.sin(2 * Math.PI * 22 * x) * Math.exp(-6 * x), 0.3, 0.002, 0.14);
  gurultu(b, 0, 0.03, 2400, 3, 0.25, 0.006);
  return b;
};

// Paket Deney-A1 (23 Kasım gecesi): altı bölüm, çekmece, harita. Sona eklenir (öncekilerin gürültüsü aynı kalır).
const blup = (b, bas, f, g) => sinus(b, bas, 0.09, (t) => f * (1 + 6 * t), g, 0.004, 0.03);
// Çekmece açılır: tahta kayma sesi ve yaylanma "boyng".
sesler.cekmece = (b = tampon(0.6)) => {
  gurultu(b, 0, 0.25, 500, 0.8, 0.18, 0.12, 0.02);
  sinus(b, 0.18, 0.4, (x) => 260 + 50 * Math.sin(2 * Math.PI * 14 * x) * Math.exp(-7 * x), 0.22, 0.004, 0.12);
  return b;
};
// Yuva parçayı çeker: yükselen ince mıknatıs vızıltısı.
sesler.miknatis = (b = tampon(0.4)) => { sinus(b, 0, 0.35, (x) => 700 + 900 * x, 0.12, 0.03, 0.15); sinus(b, 0, 0.35, (x) => 1400 + 1800 * x, 0.04, 0.03, 0.1); return b; };
// Top kaykaya iner: tahta "tok" ve teker tıkırtısı.
sesler['kaykay-bin'] = (b = tampon(0.35)) => { sinus(b, 0, 0.2, (x) => 180 - 200 * x, 0.5, 0.002, 0.06); gurultu(b, 0, 0.04, 1800, 2, 0.2, 0.01); return b; };
// Kaykay takoza çarpar: kuru tahta "takk".
sesler.takoz = (b = tampon(0.3)) => { gurultu(b, 0, 0.06, 1200, 2.5, 0.45, 0.02); sinus(b, 0, 0.18, (x) => 240 - 300 * x, 0.45, 0.002, 0.05); return b; };
// Kaykay tekerleri (döngü): hızlı küçük tıkırtılar ve alçak uğultu.
sesler.kaykay = (b = tampon(1.0)) => {
  let t = 0;
  while (t < 0.98) { gurultu(b, t, 0.015, 1400, 3, 0.12, 0.003); t += 0.05; }
  for (let i = 0; i < b.length; i++) b[i] += Math.sin(2 * Math.PI * 95 * i / SR) * 0.05;
  const k = Math.floor(0.02 * SR);
  for (let i = 0; i < k; i++) { b[i] *= i / k; b[b.length - 1 - i] *= i / k; }
  return b;
};
// Yay sıkışır: gıcırdayan yay.
sesler['yay-sik'] = (b = tampon(0.35)) => { sinus(b, 0, 0.3, (x) => 520 - 300 * x + 30 * Math.sin(2 * Math.PI * 30 * x), 0.2, 0.01, 0.12); return b; };
// Pota: ağdan süzülen "fışşş" ve küçük alkış gibi pıtırtı.
sesler.pota = (b = tampon(0.6)) => { gurultu(b, 0, 0.45, 4200, 0.6, 0.14, 0.18, 0.02); [0.3, 0.38, 0.44].forEach((t) => blup(b, t, 900, 0.12)); return b; };
// Musluk kolu devrilir: metal "klik" ve su başlar.
sesler.musluk = (b = tampon(0.4)) => { sinus(b, 0, 0.08, (x) => 1800 - 6000 * x, 0.3, 0.001, 0.02); gurultu(b, 0.05, 0.3, 2500, 0.5, 0.1, 0.15, 0.05); return b; };
// Akan su (döngü): şırıl şırıl hışırtı ve kabarcıklar.
sesler.su = (b = tampon(1.2)) => {
  gurultu(b, 0, 1.2, 2200, 0.4, 0.09, 99, 0.05);
  let t = 0.05;
  while (t < 1.1) { blup(b, t, 500 + 400 * Math.abs(rasgele()), 0.08); t += 0.09 + 0.05 * Math.abs(rasgele()); }
  const k = Math.floor(0.03 * SR);
  for (let i = 0; i < k; i++) { b[i] *= i / k; b[b.length - 1 - i] *= i / k; }
  return b;
};
// Su masaya taşar: "şlap" ve yayılan su.
sesler['su-tasma'] = (b = tampon(0.6)) => { gurultu(b, 0, 0.5, 1600, 0.5, 0.25, 0.2, 0.005); return b; };
// Kova topu alır ya da bırakır: tahta kova "tonk".
sesler.kova = (b = tampon(0.3)) => { sinus(b, 0, 0.25, (x) => 300 - 120 * x, 0.4, 0.002, 0.08); sinus(b, 0, 0.12, () => 900, 0.08, 0.001, 0.03); return b; };
// Körük basılır: "puff".
sesler.koruk = (b = tampon(0.4)) => { gurultu(b, 0, 0.35, 700, 0.7, 0.3, 0.12, 0.01); return b; };
// Balon şişer: yükselen lastik gıcırtısı (1,2 sn).
sesler.balon = (b = tampon(1.25)) => { sinus(b, 0, 1.2, (x) => 220 + 260 * x + 25 * Math.sin(2 * Math.PI * 9 * x), 0.14, 0.1, 99); for (let i = Math.floor(1.1 * SR); i < b.length; i++) b[i] *= Math.max(0, 1 - (i / SR - 1.1) / 0.15); return b; };
// Hava kaçar: komik "pfffft".
sesler.hava = (b = tampon(0.7)) => { gurultu(b, 0, 0.65, 900, 1.2, 0.2, 0.3, 0.02); sinus(b, 0, 0.6, (x) => 360 - 200 * x + 40 * Math.sin(2 * Math.PI * 25 * x), 0.12, 0.02, 0.25); return b; };
// Çan kulesi: büyük pirinç çan "DAN… DAN" (iki vuruş, uzun sönüm).
sesler.can = (b = tampon(2.8)) => {
  const f0 = 392;
  for (const bas of [0, 0.9]) for (const [oran, g, s] of [[1, 0.4, 1.1], [2.0, 0.18, 0.7], [2.76, 0.14, 0.5], [5.4, 0.06, 0.25]]) sinus(b, bas, 2.8 - bas, () => f0 * oran, g * (bas ? 0.8 : 1), 0.003, s);
  gurultu(b, 0, 0.03, 3000, 2, 0.3, 0.008);
  return b;
};
// Haritada adım: yumuşak iki "pıt".
sesler.adim = (b = tampon(0.4)) => { sinus(b, 0, 0.08, (x) => 500 - 900 * x, 0.25, 0.002, 0.03); sinus(b, 0.2, 0.08, (x) => 460 - 900 * x, 0.22, 0.002, 0.03); return b; };

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

const gecici = fs.mkdtempSync(path.join(kok, 'node_modules', '.parkur-efekt-'));
// Komut satırında ad verilirse yalnız onlar yazılır (öbür dosyalar dokunulmadan kalır).
const secili = process.argv.slice(2);
for (const [ad, uret] of Object.entries(sesler)) {
  if (secili.length && !secili.includes(ad)) continue;
  const wav = path.join(gecici, ad + '.wav');
  wavYaz(wav, uret());
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', wav, '-codec:a', 'libmp3lame', '-b:a', '96k', path.join(klasor, 'efekt-' + ad + '.mp3')]);
  console.log('✓', ad);
}
fs.rmSync(gecici, { recursive: true, force: true });
