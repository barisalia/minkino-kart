/**
 * Paket Doktor-A1 · yerleşim denetimi (yalnız geliştirme): kaynak çizimleri koddaki ölçülerle sahneye oturtup tek resim
 * üretir. Oyunu açmadan hizaya bakmak için; çıktı output/doktor/a1-denetim/ (git'te yok).
 *   npx vite-node doktor/araclar/a1-yerlesim.ts -- lavabo
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { A1, DEFTER, GOGUS, KOPURME, KOPUK_YERLERI, LAVABO } from '../src/vaka/a1';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const KAYNAK = path.join(KOK, 'ekip/doktor/a1/kaynak'), HEDEF = path.join(KOK, 'output/doktor/a1-denetim');
fs.mkdirSync(HEDEF, { recursive: true });
const var_ = (ad: string) => fs.existsSync(path.join(KAYNAK, ad + '.png'));
type Parca = { ad: string; sol: number; ust: number; g: number; y: number };
const eksik: string[] = [];

async function diz(cikti: string, fon: string, parcalar: Parca[]) {
  if (!var_(fon)) { console.log(cikti, ': fon yok (' + fon + ')'); return; }
  const katman = [];
  for (const p of parcalar) {
    if (!var_(p.ad)) { eksik.push(p.ad); continue; }
    const g = Math.round(p.g), y = Math.round(p.y);
    let girdi = await sharp(path.join(KAYNAK, p.ad + '.png')).resize(g, y, { fit: 'fill' }).png().toBuffer();
    // sahnenin dışına taşan parça kırpılır
    let sol = Math.round(p.sol), ust = Math.round(p.ust), kx = 0, ky = 0, kg = g, kyuk = y;
    if (sol < 0) { kx = -sol; kg -= kx; sol = 0; } if (ust < 0) { ky = -ust; kyuk -= ky; ust = 0; }
    kg = Math.min(kg, 2048 - sol); kyuk = Math.min(kyuk, 1152 - ust);
    if (kg <= 0 || kyuk <= 0) continue;
    if (kx || ky || kg !== g || kyuk !== y) girdi = await sharp(girdi).extract({ left: kx, top: ky, width: kg, height: kyuk }).png().toBuffer();
    katman.push({ input: girdi, left: sol, top: ust });
  }
  await sharp(path.join(KAYNAK, fon + '.png')).resize(2048, 1152, { fit: 'fill' }).composite(katman).png().toFile(path.join(HEDEF, cikti + '.png'));
  console.log(cikti, '→', path.relative(KOK, path.join(HEDEF, cikti + '.png')), '· parça', katman.length);
}
const ortada = (ad: string, m: { x: number; y: number }, g: number, y: number): Parca => ({ ad, sol: m.x - g / 2, ust: m.y - y / 2, g, y });

const hangi = process.argv.slice(2).filter(a => a !== '--');
if (!hangi.length || hangi.includes('lavabo')) {
  const L = LAVABO, dip = L.dip;
  // 1) başlangıç: musluk kapalı, patiler çamurlu, sabun ve havlu yerinde
  await diz('lavabo-baslangic', A1.lavaboFon, [
    { ad: A1.kol[0], ...L.kol }, { ad: var_(A1.patiler.camurlu) ? A1.patiler.camurlu : A1.patiler.temiz, ...L.patiYeri },
    ortada(A1.sabun[0], L.sabunluk, L.sabunBoyu, L.sabunBoyu), ortada(A1.havlu[0], L.havluYeri, L.havluBoyu, L.havluBoyu), ortada(A1.ayna.merak, L.ayna, 480, 480),
  ]);
  // 2) su açık: akış lavabonun dibine, sıçrama; kol açık; köpüklü patiler
  await diz('lavabo-su', A1.lavaboFon, [
    { ad: A1.kol[2], ...L.kol }, { ad: A1.suAkis[0], sol: L.agiz.x - 70, ust: L.agiz.y, g: 140, y: dip - L.agiz.y },
    { ad: A1.patiler.temiz, ...L.patiYeri },
    ...KOPUK_YERLERI.map((k, i) => ({ ad: A1.kopurme[i % 6], sol: L.patiYeri.sol + k.x - KOPURME.merkez.x * KOPURME.olcek, ust: L.patiYeri.ust + k.y - KOPURME.merkez.y * KOPURME.olcek, g: 420 * KOPURME.olcek, y: 320 * KOPURME.olcek })),
    { ad: A1.suSicrama[2], sol: L.agiz.x - 160, ust: dip - 200, g: 320, y: 208 },
    ortada(A1.sabun[2], L.sabunluk, L.sabunBoyu, L.sabunBoyu), ortada(A1.havlu[2], L.havluYeri, L.havluBoyu, L.havluBoyu), ortada(A1.ayna.kahkaha, L.ayna, 480, 480),
  ]);
  // 3) bitiş: temiz patiler, damlalar, parıltı
  await diz('lavabo-bitis', A1.lavaboFon, [
    { ad: A1.kol[0], ...L.kol }, { ad: A1.patiler.goster, ...L.patiYeri }, { ad: A1.patiler.damla, ...L.patiYeri },
    ortada(A1.sabun[0], L.sabunluk, L.sabunBoyu, L.sabunBoyu), ortada(A1.havlu[1], L.havluYeri, L.havluBoyu, L.havluBoyu), ortada(A1.ayna.mutlu, L.ayna, 480, 480),
  ]);
}
if (!hangi.length || hangi.includes('gogus')) {
  await diz('gogus', A1.gogusFon, [
    { ad: A1.gogus.merak, sol: 0, ust: 0, g: 2048, y: 1152 },
    ortada(A1.kalp[1], GOGUS.kalp, 300, 300),
  ]);
}
if (!hangi.length || hangi.includes('defter')) {
  await diz('defter', A1.defterFon, [
    ...A1.cikartma.map((ad, i) => ortada(ad, DEFTER.tabaka[i], DEFTER.hucre, DEFTER.hucre)),
    ...DEFTER.yuvalar.map((m, i) => ortada(A1.cikartma[i], m, DEFTER.yuvaCapi, DEFTER.yuvaCapi)).slice(0, 1),
    ortada(A1.damga, { x: DEFTER.damgaYeri.x, y: DEFTER.damgaYeri.y - DEFTER.damgaBoyu * 0.3 }, DEFTER.damgaBoyu, DEFTER.damgaBoyu),
    ortada(A1.damgaIzi, DEFTER.damgaHedefi, 210, 210),
  ]);
}
if (eksik.length) console.log('henüz gelmeyen:', [...new Set(eksik)].join(', '));
