#!/usr/bin/env node
/**
 * Kino'nun pijama kostümü (KARAKTER-KITI §8.1 K8 yerine, Recraft'sız): Kino C kitinin parçaları yeniden boyanır.
 * Krem zemin, küçük yeşil yıldızlar; çizgi, gölge ve eklem kapakları kitteki gibi kalır (aynı dönme noktaları).
 *
 *   govde            yeşil tişört      → krem pijama üstü (koyu yeşil gölge → krem gölge)
 *   kol-ust-sag/sol  yeşil kol ağzı    → krem kol (beyaz tüy kısmı olduğu gibi; kol kalkınca açılan dikişler de)
 *   kalca, bacak-ust beyaz tüy         → krem pijama şortu (pembe-kahve tüy gölgesi → krem gölge)
 *   ayak-sag/sol     kırmızı ayakkabı  → yalınayak beyaz pati (kodla çizilir: çizgi kalınlığı ve rengi kitten)
 * Yıldız deseni kit karesinde (1792×2432) tek desen: parçalar dönse de komşu parçalarda desen kaymaz.
 * .dolgu katmanları (iki geçişli çizim, film/src/kukla.ts) aynı eşlemeyle boyanır.
 *
 * Çıktı: assets/karakter/kino-yeni/pijama/<parca>.webp (+ .dolgu.webp). Kostüm takası: film/src/oyunlu/kostum.ts.
 * Kullanım: node ekip/illustrator/kino-pijama.cjs
 */
const fs = require('fs');
const path = require('path');
const sharp = require(require.resolve('sharp', { paths: [process.cwd(), path.resolve(__dirname, '../..')] }));
const yaz = require('./guvenli-yaz.cjs');

const KOK = path.resolve(__dirname, '../..');
const KIT = path.join(KOK, 'assets/karakter/kino-yeni');
const CIKTI = path.join(KIT, 'pijama');
const iskelet = JSON.parse(fs.readFileSync(path.join(KIT, 'kino-yeni.json'), 'utf8'));

const CIZGI = [64, 18, 17];
const KREM = [255, 243, 214];
const KREM_GOLGE = [236, 214, 170];
const YILDIZ = [104, 178, 84];
const YILDIZ_GOLGE = [84, 150, 72];

function hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
const karis = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const parlak = (c) => 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2];
const L_CIZGI = parlak(CIZGI);

/** beş köşeli yıldız (merkez, dış yarıçap) içinde mi: işaretli uzaklık (<0 içeride), yumuşak kenar için */
function yildizUzaklik(x, y, R) {
  // kutupsal: yıldız sınırı r(θ) iç ve dış yarıçap arasında doğrusal (yaklaşık, yumuşak)
  const r = Math.hypot(x, y);
  if (r < 1e-6) return -R;
  let a = Math.atan2(x, -y); // tepe yukarı
  const dilim = (2 * Math.PI) / 5;
  a = ((a % dilim) + dilim) % dilim;
  const u = Math.abs(a / dilim - 0.5) * 2; // 1: tepe, 0: iki tepe arası
  const ic = R * 0.48;
  const sinir = ic + (R - ic) * Math.pow(u, 1.35);
  return r - sinir;
}
/** kit koordinatında yıldız deseni: 0..1 kaplama */
function desen(kx, ky) {
  const ARA = 118, R = 21;
  const satir = Math.floor(ky / ARA + 0.5);
  const kay = satir % 2 ? ARA / 2 : 0;
  const sutun = Math.floor((kx - kay) / ARA + 0.5);
  const cx = sutun * ARA + kay, cy = satir * ARA;
  // her yıldız hafifçe döner (el yapımı kumaş hissi, ama düzenli)
  const don = (((sutun * 37 + satir * 61) % 7) - 3) * 0.09;
  const dx = kx - cx, dy = ky - cy;
  const x = dx * Math.cos(don) - dy * Math.sin(don), y = dx * Math.sin(don) + dy * Math.cos(don);
  const d = yildizUzaklik(x, y, R);
  return Math.max(0, Math.min(1, 0.5 - d / 1.6));
}

/**
 * Bir pikseli boyar. tur: 'yesil' (tişört yeşili krem olur) ya da 'beyaz' (beyaz tüy krem olur).
 * Dönüş: [r,g,b, kaplama(0..1: yıldız konabilir mi)] ya da null (dokunma).
 */
function boya(r, g, b, tur) {
  const [h, s, l] = hsl(r, g, b);
  const L = parlak([r, g, b]);
  if (tur === 'yesil') {
    if (!(h > 70 && h < 185 && s > 0.22)) return null;
    const golge = h > 135; // koyu deniz yeşili gölge
    const hedef = golge ? KREM_GOLGE : KREM;
    const anaL = golge ? parlak([16, 136, 96]) : parlak([128, 192, 96]);
    const k = Math.max(0, Math.min(1, (L - L_CIZGI) / (anaL - L_CIZGI)));
    return [...karis(CIZGI, hedef, k), k, golge ? 1 : 0];
  }
  // beyaz tüy ve tüy gölgesi
  const kroma = Math.max(r, g, b) - Math.min(r, g, b);
  if (L > 130 && kroma < 24) {
    const k = Math.max(0, Math.min(1, (L - L_CIZGI) / (248 - L_CIZGI)));
    return [...karis(CIZGI, KREM, k), k, 0];
  }
  if ((h < 40 || h > 330) && kroma >= 24 && kroma < 90 && L > 110) {
    const k = Math.max(0, Math.min(1, (L - L_CIZGI) / (parlak([216, 176, 160]) - L_CIZGI)));
    return [...karis(CIZGI, KREM_GOLGE, k), k, 1];
  }
  return null;
}

async function parcaBoya(dosya, parcaAd, tur) {
  const p = iskelet.parcalar[parcaAd];
  const { data, info } = await sharp(path.join(KIT, dosya)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const olX = p.kutu[2] / info.width, olY = p.kutu[3] / info.height;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * 4;
      if (data[i + 3] === 0) continue;
      const s = boya(data[i], data[i + 1], data[i + 2], tur);
      if (!s) continue;
      let c = s.slice(0, 3);
      const k = s[3], golge = s[4];
      const yd = desen(p.kutu[0] + (x + 0.5) * olX, p.kutu[1] + (y + 0.5) * olY) * Math.max(0, (k - 0.85) / 0.15);
      if (yd > 0) c = karis(c, golge ? YILDIZ_GOLGE : YILDIZ, yd);
      data[i] = Math.round(c[0]);
      data[i + 1] = Math.round(c[1]);
      data[i + 2] = Math.round(c[2]);
    }
  }
  const buf = await sharp(data, { raw: info }).webp({ quality: 92, alphaQuality: 100, effort: 6 }).toBuffer();
  const hedef = path.join(CIKTI, dosya);
  if (await yaz(hedef, buf)) console.log('yazıldı', path.relative(KOK, hedef));
}

/** yalınayak pati: ayakkabının kutusunda, bilek noktasının altında; kitin çizgi rengi ve kalınlığıyla */
async function pati(taraf) {
  const p = iskelet.parcalar[`ayak-${taraf}`];
  const [kx, ky, w, hh] = p.kutu;
  const cx = p.pivot[0] - kx + (taraf === 'sag' ? -10 : 10);
  const zemin = iskelet.zemin - ky;
  const t = iskelet.cizgi?.kalinlik ?? 8.5;
  const yon = taraf === 'sag' ? -1 : 1;
  // önden pati: yuvarlak, altı hafif düz; üst kenarı bacağın ucunu örter (ayak bacaktan sonra çizilir)
  const rx = 112, ry = 70, py = zemin - ry - 2;
  const C = `rgb(${CIZGI.join(',')})`;
  const sekil = `M ${cx - rx} ${py + 8} C ${cx - rx} ${py - ry * 1.15}, ${cx + rx} ${py - ry * 1.15}, ${cx + rx} ${py + 8} C ${cx + rx} ${py + ry * 0.9}, ${cx + rx * 0.6} ${py + ry}, ${cx} ${py + ry} C ${cx - rx * 0.6} ${py + ry}, ${cx - rx} ${py + ry * 0.9}, ${cx - rx} ${py + 8} Z`;
  const parmak = [-0.3, 0.3].map((u) => cx + u * rx);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${hh}" viewBox="0 0 ${w} ${hh}">
  <defs><clipPath id="k"><path d="${sekil}"/></clipPath></defs>
  <path d="${sekil}" fill="#f8f8f8"/>
  <g clip-path="url(#k)">
    <ellipse cx="${cx + yon * rx * 0.2}" cy="${py + ry * 1.0}" rx="${rx * 1.15}" ry="${ry * 0.4}" fill="#d8b0a0"/>
    <ellipse cx="${cx - yon * rx * 0.38}" cy="${py - ry * 0.4}" rx="${rx * 0.26}" ry="${ry * 0.16}" fill="#ffffff"/>
  </g>
  <path d="${sekil}" fill="none" stroke="${C}" stroke-width="${t}" stroke-linejoin="round"/>
  ${parmak.map((x) => `<path d="M ${x} ${py + ry - 3} q ${yon * 3} ${-ry * 0.26} 0 ${-ry * 0.46}" fill="none" stroke="${C}" stroke-width="${t * 0.85}" stroke-linecap="round"/>`).join('\n  ')}
</svg>`;
  const buf = await sharp(Buffer.from(svg)).webp({ quality: 92, alphaQuality: 100, effort: 6 }).toBuffer();
  const hedef = path.join(CIKTI, `ayak-${taraf}.webp`);
  if (await yaz(hedef, buf)) console.log('yazıldı', path.relative(KOK, hedef));
}

(async () => {
  fs.mkdirSync(CIKTI, { recursive: true });
  for (const [ad, tur] of [['govde', 'yesil'], ['kol-ust-sag', 'yesil'], ['kol-ust-sol', 'yesil'], ['kol-ust-sag-dikis', 'yesil'], ['kol-ust-sol-dikis', 'yesil'], ['kalca', 'beyaz'], ['bacak-ust-sag', 'beyaz'], ['bacak-ust-sol', 'beyaz']]) {
    const p = iskelet.parcalar[ad];
    await parcaBoya(p.resim, ad, tur);
    if (p.dolgu) await parcaBoya(p.dolgu, ad, tur);
  }
  await pati('sag');
  await pati('sol');
})();
