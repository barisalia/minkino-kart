/**
 * K1 çizimlerini %100 boyda denetlemek için kesitler üretir (uzuv sayımı, model karşılaştırması).
 *
 *   npx vite-node doktor/araclar/tam-boy.ts -- stetoskop muayene-masasi        # tek tek
 *   npx vite-node doktor/araclar/tam-boy.ts -- --yan zipzip-tirman-0 zipzip-tirman-1   # iki poz yan yana, taban hizalı
 *   npx vite-node doktor/araclar/tam-boy.ts -- --zemin "#ffffff" kino-gul-0
 *
 * Her çizim için `output/doktor/k1-onizleme/tam-boy/` içine yazar:
 *   <ad>-genel.png   tuvalin tamamı, kılavuz çizgileriyle (küçültülmüş)
 *   <ad>-1.png …     çizimin kendisi %100 boyda (büyükse 1400 pikseli aşmayan parçalara bölünür)
 * Çizimi değiştirmez; yalnız okur.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp, { type OverlayOptions, type Sharp } from 'sharp';
import { CIZIM_KILAVUZLARI, TUVALLER, cizimBul, type Kilavuz } from './k1-paket';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const HEDEF = path.join(KOK, 'assets/doktor/zipzip-diz');
const CIKTI = path.join(KOK, 'output/doktor/k1-onizleme/tam-boy');
const arg = process.argv.slice(2);
const zi = arg.indexOf('--zemin');
const ZEMIN = zi >= 0 ? arg[zi + 1] : '#d4b5f0';
const YAN = arg.includes('--yan');
const adlar = arg.filter((a, i) => !a.startsWith('--') && !(zi >= 0 && i === zi + 1));
const EN_COK = 1400, PAY = 24;
fs.mkdirSync(CIKTI, { recursive: true });

async function kutu(yol: string): Promise<{ g: number; y: number; x0: number; y0: number; x1: number; y1: number; alfa: boolean }> {
  const { data, info } = await sharp(yol).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let x0 = info.width, y0 = info.height, x1 = -1, y1 = -1, saydam = 0;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    const a = data[(y * info.width + x) * 4 + 3];
    if (a < 250) saydam++;
    if (a > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  return { g: info.width, y: info.height, x0, y0, x1: x1 + 1, y1: y1 + 1, alfa: saydam > 0 };
}
const kilavuzSvg = (g: number, y: number, liste: readonly Kilavuz[]): Buffer => {
  const c: string[] = [];
  for (const k of liste) {
    if (k.tur === 'yatay') c.push(`<line x1="0" y1="${k.konum}" x2="${g}" y2="${k.konum}" stroke="#0b57d0" stroke-width="3" stroke-dasharray="14 10"/><text x="10" y="${k.konum! - 8}" font-size="30" fill="#0b57d0" font-family="Arial">${k.ad} y ${k.konum}</text>`);
    else if (k.tur === 'dikey') c.push(`<line x1="${k.konum}" y1="0" x2="${k.konum}" y2="${y}" stroke="#0b57d0" stroke-width="3" stroke-dasharray="14 10"/><text x="${k.konum! + 8}" y="34" font-size="30" fill="#0b57d0" font-family="Arial">${k.ad} x ${k.konum}</text>`);
    else if (k.tur === 'daire') c.push(`<circle cx="${k.nokta![0]}" cy="${k.nokta![1]}" r="${k.yaricap}" fill="none" stroke="#c2185b" stroke-width="4" stroke-dasharray="14 10"/><text x="${k.nokta![0] - k.yaricap!}" y="${k.nokta![1] - k.yaricap! - 10}" font-size="28" fill="#c2185b" font-family="Arial">${k.ad}</text>`);
    else c.push(`<rect x="${k.kutu![0]}" y="${k.kutu![1]}" width="${k.kutu![2]}" height="${k.kutu![3]}" fill="none" stroke="#c2185b" stroke-width="4" stroke-dasharray="14 10"/><text x="${k.kutu![0] + 8}" y="${k.kutu![1] + 34}" font-size="28" fill="#c2185b" font-family="Arial">${k.ad}</text>`);
  }
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${g}" height="${y}">${c.join('')}</svg>`);
};
const zeminli = (g: number, y: number) => sharp({ create: { width: g, height: y, channels: 4, background: ZEMIN } });
const yazilan: string[] = [];
const kaydet = async (r: Sharp, ad: string) => { const yol = path.join(CIKTI, ad + '.png'); await r.png({ compressionLevel: 6 }).toFile(yol); yazilan.push(path.relative(KOK, yol).split(path.sep).join('/')); };

async function tek(ad: string) {
  const c = cizimBul(ad);
  const yol = path.join(HEDEF, ad + '.webp');
  if (!c || !fs.existsSync(yol)) { console.log(`${ad}: ${c ? 'hedefte yok' : 'K1 adı değil'}`); return; }
  const k = await kutu(yol);
  const t = TUVALLER[c.tuval];
  // genel: tuvalin tamamı, kılavuzlarla, uzun kenar 1200
  const o = Math.min(1, 1200 / Math.max(k.g, k.y));
  const tam = await zeminli(k.g, k.y).composite([{ input: yol }, { input: kilavuzSvg(k.g, k.y, [...t.kilavuzlar, ...(CIZIM_KILAVUZLARI[ad] ?? [])]) }]).png().toBuffer();
  await kaydet(sharp(tam).resize(Math.round(k.g * o), Math.round(k.y * o)), ad + '-genel');
  // %100: çizimin kutusu (opak fon: tuvalin tamamı), EN_COK'u aşarsa parçalara bölünür
  const sol = c.zemin === 'opak' ? 0 : Math.max(0, k.x0 - PAY), ust = c.zemin === 'opak' ? 0 : Math.max(0, k.y0 - PAY);
  const sag = c.zemin === 'opak' ? k.g : Math.min(k.g, k.x1 + PAY), alt = c.zemin === 'opak' ? k.y : Math.min(k.y, k.y1 + PAY);
  const G = sag - sol, Y = alt - ust;
  const duz = await zeminli(k.g, k.y).composite([{ input: yol }]).png().toBuffer();
  const sut = Math.ceil(G / EN_COK), sat = Math.ceil(Y / EN_COK);
  let n = 0;
  for (let s = 0; s < sat; s++) for (let u = 0; u < sut; u++) {
    const pg = Math.ceil(G / sut), py = Math.ceil(Y / sat);
    const x = sol + u * pg, y = ust + s * py;
    n++;
    await kaydet(sharp(duz).extract({ left: x, top: y, width: Math.min(pg, k.g - x), height: Math.min(py, k.y - y) }), `${ad}-${n}`);
  }
  console.log(`${ad}: tuval ${k.g} × ${k.y}` + (c.zemin === 'opak' ? ' (opak)' : ` · çizim x ${k.x0}…${k.x1}, y ${k.y0}…${k.y1} (${k.x1 - k.x0} × ${k.y1 - k.y0})`) + ` · ${n} parça %100`);
}

/** İki (ya da daha çok) pozu %100 boyda yan yana koyar; tuvaller aynı hizada kalır (taban ve baş ölçüsü karşılaştırması). */
async function yanYana(liste: string[]) {
  const var_ = liste.filter(ad => cizimBul(ad) && fs.existsSync(path.join(HEDEF, ad + '.webp')));
  if (var_.length < 2) { for (const ad of liste) await tek(ad); return; }
  const kutular = await Promise.all(var_.map(ad => kutu(path.join(HEDEF, ad + '.webp'))));
  // ortak dikey aralık: bütün pozların üstü ve altı; her poz kendi yatay kutusuyla
  const ust = Math.max(0, Math.min(...kutular.map(k => k.y0)) - PAY), alt = Math.min(kutular[0].y, Math.max(...kutular.map(k => k.y1)) + PAY);
  const parca: OverlayOptions[] = [];
  let x = 0;
  for (let i = 0; i < var_.length; i++) {
    const k = kutular[i];
    const sol = Math.max(0, k.x0 - PAY), g = Math.min(k.g, k.x1 + PAY) - sol;
    parca.push({ input: await sharp(path.join(HEDEF, var_[i] + '.webp')).extract({ left: sol, top: ust, width: g, height: alt - ust }).png().toBuffer(), left: x, top: 0 });
    x += g + 12;
  }
  const ad = var_[0] + '+' + var_.slice(1).map(a => a.replace(/^.*-(?=[^-]+$)/, '')).join('+');
  await kaydet(zeminli(x - 12, alt - ust).composite(parca), ad);
  console.log(`${var_.join(' | ')}: yan yana %100, ${x - 12} × ${alt - ust}` + kutular.map((k, i) => ` · ${var_[i].split('-').pop()}: x ${k.x0}…${k.x1}, y ${k.y0}…${k.y1}`).join(''));
}

if (!adlar.length) console.log('Kullanım: npx vite-node doktor/araclar/tam-boy.ts -- [--yan] [--zemin "#renk"] ad1 ad2 …');
else if (YAN) await yanYana(adlar);
else for (const ad of adlar) await tek(ad);
for (const y of yazilan) console.log('  ' + y);
