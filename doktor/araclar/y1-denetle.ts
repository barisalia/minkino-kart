/**
 * Paket Doktor-Y1 ("Zıpzıp'ın Dikenli Patisi") çizimlerini denetler ve %100 boyda kesit üretir.
 *
 *   npx vite-node doktor/araclar/y1-denetle.ts                 # hepsi: var mı, tuval boyutu, zemin, köşe, kenar, saçak
 *   npx vite-node doktor/araclar/y1-denetle.ts -- --kesit zipzip-uzgun-0 canta-acik   # adı verilenlerin %100 kesiti
 *   npx vite-node doktor/araclar/y1-denetle.ts -- --kesit hepsi
 *
 * Kesitler `output/doktor/y1-denetim/` içine yazılır (lila zeminde; büyük çizim 1400 pikseli aşmayan parçalara bölünür).
 * Çizimi değiştirmez. Uzuv sayımı ve model karşılaştırması gözle yapılır.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { denetle, farkSay, olc, type Resim } from './gorsel-mantik';
import { OPAK, TUVAL, VAKA, VAKA_DOSYALAR } from '../src/vaka/veri';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const HEDEF = path.join(KOK, 'assets/doktor/vaka');
const CIKTI = path.join(KOK, 'output/doktor/y1-denetim');
const arg = process.argv.slice(2);
const ki = arg.indexOf('--kesit');
const kesitler = ki >= 0 ? arg.slice(ki + 1).filter(a => !a.startsWith('--')) : [];
const yol = (ad: string) => path.join(HEDEF, ad + '.webp');
async function oku(ad: string): Promise<Resim> {
  const { data, info } = await sharp(yol(ad)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { g: info.width, y: info.height, d: new Uint8Array(data.buffer, data.byteOffset, data.length) };
}

let hata = 0, gelen = 0;
const eksik: string[] = [];
for (const ad of VAKA_DOSYALAR) {
  if (!fs.existsSync(yol(ad))) { eksik.push(ad); continue; }
  gelen++;
  const r = await oku(ad);
  const [g, y] = TUVAL[ad];
  const opak = OPAK.includes(ad);
  // yakın plan katmanları ve büyüteç tuvalin kenarına değebilir (kol soldan girer)
  const bulgular = denetle(olc(r), r.g, r.y, { g, y, zemin: opak ? 'opak' : 'seffaf', altKesik: false })
    .filter(b => !((ad.startsWith('kol-') || ad === 'sargi-sarili') && /kenarına değiyor/.test(b.metin)));
  hata += bulgular.filter(b => b.seviye === 'hata').length;
  console.log(`${bulgular.some(b => b.seviye === 'hata') ? '✗' : bulgular.length ? '!' : '✓'} ${ad.padEnd(20)} ${r.g} × ${r.y}` + (bulgular.length ? ' · ' + bulgular.map(b => b.metin).join(' · ') : ''));
}
// aynı yerde durması gereken çiftler: fark küçük bir alanda kalmalı
const cift = async (a: string, b: string, ne: string) => {
  if (!fs.existsSync(yol(a)) || !fs.existsSync(yol(b))) return;
  const ra = await oku(a), rb = await oku(b);
  const f = farkSay(ra, rb), oa = olc(ra);
  if (f.piksel < 0) { console.log(`✗ ${a} ↔ ${b}: tuval boyutu farklı`); hata++; return; }
  const k = f.kutu;
  console.log(`  ${a} ↔ ${b} (${ne}): değişen %${((f.piksel / Math.max(1, oa.gorunen)) * 100).toFixed(1)}` + (k ? ` · alan ${k.x1 - k.x0} × ${k.y1 - k.y0}, (${k.x0}, ${k.y0})` : ' · birebir aynı'));
};
await cift(VAKA.uzgun[0], VAKA.uzgunKirp, 'yalnız gözler');
await cift(VAKA.uzgun[0], VAKA.uzgun[1], 'kulak, kuyruk, ayak parmakları');
await cift(VAKA.sevinc[0], VAKA.sevinc[1], 'sallayan kol, kuyruk, ayaklar');
await cift(VAKA.kolCamurlu, VAKA.kolTemiz, 'yalnız çamur lekeleri');
await cift(VAKA.cimbizAcik, VAKA.cimbizKapali, 'yalnız uçlar');
console.log(`\nY1: ${gelen} / ${VAKA_DOSYALAR.length} çizim hedefte · ${hata} hata` + (eksik.length ? `\nGelmeyen ${eksik.length}: ${eksik.join(', ')}` : ''));

if (kesitler.length) {
  fs.mkdirSync(CIKTI, { recursive: true });
  const adlar = kesitler.includes('hepsi') ? VAKA_DOSYALAR.filter(ad => fs.existsSync(yol(ad))) : kesitler;
  for (const ad of adlar) {
    if (!fs.existsSync(yol(ad))) { console.log(`${ad}: hedefte yok`); continue; }
    const r = await oku(ad);
    const k = olc(r).kutu ?? { x0: 0, y0: 0, x1: r.g, y1: r.y };
    const opak = OPAK.includes(ad), PAY = 20, EN_COK = 1400;
    const sol = opak ? 0 : Math.max(0, k.x0 - PAY), ust = opak ? 0 : Math.max(0, k.y0 - PAY);
    const G = (opak ? r.g : Math.min(r.g, k.x1 + PAY)) - sol, Y = (opak ? r.y : Math.min(r.y, k.y1 + PAY)) - ust;
    const duz = await sharp({ create: { width: r.g, height: r.y, channels: 4, background: '#d4b5f0' } }).composite([{ input: yol(ad) }]).png().toBuffer();
    const sut = Math.ceil(G / EN_COK), sat = Math.ceil(Y / EN_COK);
    let n = 0;
    for (let s = 0; s < sat; s++) for (let u = 0; u < sut; u++) {
      const pg = Math.ceil(G / sut), py = Math.ceil(Y / sat), x = sol + u * pg, y = ust + s * py;
      n++;
      await sharp(duz).extract({ left: x, top: y, width: Math.min(pg, r.g - x), height: Math.min(py, r.y - y) }).png().toFile(path.join(CIKTI, `${ad}${sut * sat > 1 ? '-' + n : ''}.png`));
    }
    console.log(`kesit: ${ad} · çizim x ${k.x0}…${k.x1}, y ${k.y0}…${k.y1} · ${n} parça → output/doktor/y1-denetim/`);
  }
}
process.exitCode = hata ? 1 : 0;
