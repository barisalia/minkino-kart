/**
 * Paket Doktor-A1 · bağlama: denetimden geçmiş kaynak çizimleri (ekip/doktor/a1/kaynak/<ad>.png) webp olarak
 * assets/doktor/vaka/ içine yazar. Yalnız `a1-onay.ts` → ONAYLI içindeki adlar bağlanır; çizim bozulmaz (Astra tuval
 * ölçüsünde teslim ediyor: ölçü tutmuyorsa bağlanmaz, bildirilir).
 *
 *   npx vite-node doktor/araclar/a1-bagla.ts            # onaylıların hepsi
 *   npx vite-node doktor/araclar/a1-bagla.ts -- durum   # yalnız durum (hiçbir şey yazmaz)
 *
 * Bir aşamanın zorunlu çizimleri tamamlanınca o aşama oyunda kendiliğinden açılır (a1.ts → A1_ASAMA).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { kenarRenginiYay, type Resim } from './gorsel-mantik';
import { GERI, ONAYLI } from './a1-onay';
import { A1_ASAMA, A1_DOSYALAR, A1_EK_DOSYALAR, A1_KIRP_SETLERI, A1_TUVAL } from '../src/vaka/a1';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const KAYNAK = path.join(KOK, 'ekip/doktor/a1/kaynak'), HEDEF = path.join(KOK, 'assets/doktor/vaka');
const YALNIZ_DURUM = process.argv.includes('durum');
const HEPSI = [...A1_DOSYALAR, ...A1_EK_DOSYALAR];
const gelen = new Set(fs.existsSync(KAYNAK) ? fs.readdirSync(KAYNAK).filter(f => f.endsWith('.png')).map(f => f.slice(0, -4)) : []);
const bagli = (ad: string) => fs.existsSync(path.join(HEDEF, ad + '.webp'));

for (const ad of ONAYLI) if (!HEPSI.includes(ad)) throw new Error('onay kaydında pakette olmayan ad: ' + ad);
for (const ad of ONAYLI) if (ad in GERI) throw new Error('aynı kare hem onaylı hem geri: ' + ad);

// Kırpma: tam sahne boyundaki saydam katmanlar (kat kat sargı, lavabo suyu, göğüs pozları) setin ortak dolu alanına kırpılır.
// Yalnız saydam kenar atılır, çizime dokunulmaz; setin bütün kareleri aynı kutuyu alır (üst üste değişirken oynamaz). Kutular
// doktor/src/vaka/a1-kirpma.json içine yazılır; oyun katmanı o kutuya koyar. Bellek: 2048 × 1152'lik her katman 9,4 MB.
const KIRPMA_YOLU = path.join(KOK, 'doktor/src/vaka/a1-kirpma.json');
const kirpma: Record<string, readonly [number, number, number, number]> = {};
if (!YALNIZ_DURUM) for (const set of A1_KIRP_SETLERI) {
  if (!set.every(ad => ONAYLI.includes(ad) && fs.existsSync(path.join(KAYNAK, ad + '.png')))) continue;
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  // görünmeyecek kadar soluk tek tük pikseller (alfa ≤ 8) kutuyu büyütmesin
  for (const ad of set) {
    const { data, info } = await sharp(path.join(KAYNAK, ad + '.png')).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let j = 0; j < info.height; j++) for (let i = 0; i < info.width; i++) if (data[(j * info.width + i) * 4 + 3] > 8) { if (i < x0) x0 = i; if (i > x1) x1 = i; if (j < y0) y0 = j; if (j > y1) y1 = j; }
  }
  const [G, Y] = A1_TUVAL[set[0]];
  const sol = Math.max(0, (x0 - 6) & ~1), ust = Math.max(0, (y0 - 6) & ~1), sag = Math.min(G, (x1 + 8) & ~1), alt = Math.min(Y, (y1 + 8) & ~1);
  for (const ad of set) kirpma[ad] = [sol, ust, sag - sol, alt - ust];
}
if (!YALNIZ_DURUM) fs.writeFileSync(KIRPMA_YOLU, JSON.stringify(kirpma, null, 1).replace(/\n\s+(?=[\d\]])/g, ' ') + '\n');
let yazilan = 0;
const sorun: string[] = [];
if (!YALNIZ_DURUM) for (const ad of ONAYLI) {
  const kaynak = path.join(KAYNAK, ad + '.png'), hedef = path.join(HEDEF, ad + '.webp');
  if (!fs.existsSync(kaynak)) { sorun.push(`${ad}: onaylı ama kaynağı yok`); continue; }
  const kirp = kirpma[ad];
  if (!kirp && fs.existsSync(hedef) && fs.statSync(hedef).mtimeMs >= fs.statSync(kaynak).mtimeMs) continue;      // zaten bağlı ve güncel (kırpılanlar her koşuda yeniden yazılır)
  const { data, info } = await sharp(kaynak).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const [g, y] = A1_TUVAL[ad];
  if (info.width !== g || info.height !== y) { sorun.push(`${ad}: ${info.width} × ${info.height}, beklenen ${g} × ${y}`); continue; }
  const r: Resim = { g, y, d: new Uint8Array(data.buffer, data.byteOffset, data.length) };
  if (ad === 'sargi-serit') for (let j = 0; j < y; j++) for (const [hedefX, kaynakX] of [[0, 1], [g - 1, g - 2]]) for (let c = 0; c < 4; c++) r.d[(j * g + hedefX) * 4 + c] = r.d[(j * g + kaynakX) * 4 + c];      // yinelenen doku: kenar sütunu komşusundan
  let saydam = false;
  for (let i = 3; i < r.d.length; i += 4) if (r.d[i] < 255) { saydam = true; break; }
  const ham = () => sharp(Buffer.from(r.d.buffer, r.d.byteOffset, r.d.length), { raw: { width: g, height: y, channels: 4 } });
  if (saydam && kirp) { kenarRenginiYay(r); await ham().extract({ left: kirp[0], top: kirp[1], width: kirp[2], height: kirp[3] }).webp({ quality: 92, alphaQuality: 100, effort: 6 }).toFile(hedef); }
  else if (saydam) { kenarRenginiYay(r); await ham().webp({ quality: 92, alphaQuality: 100, effort: 6 }).toFile(hedef); }
  else await ham().removeAlpha().webp({ quality: 92, effort: 6 }).toFile(hedef);
  yazilan++;
}

// ——— durum
const durum = (ad: string) => (bagli(ad) ? 'bağlı' : ad in GERI ? 'geri' : gelen.has(ad) ? (ONAYLI.includes(ad) ? 'onaylı' : 'denetlenmedi') : 'gelmedi');
const say = (d: string) => HEPSI.filter(ad => durum(ad) === d);
console.log(`Paket Doktor-A1 · ${HEPSI.length} kare: bağlı ${say('bağlı').length}, geri yazılan ${say('geri').length}, denetlenmemiş ${say('denetlenmedi').length}, gelmeyen ${say('gelmedi').length}` + (yazilan ? ` · bu koşuda yazılan ${yazilan}` : ''));
if (say('denetlenmedi').length) console.log('denetlenecek:', say('denetlenmedi').join(', '));
for (const [asama, adlar] of Object.entries(A1_ASAMA)) {
  const eksik = (adlar as readonly string[]).filter(ad => !bagli(ad));
  console.log(`  aşama ${asama.padEnd(7)} ${eksik.length ? 'kapalı · eksik ' + eksik.length + ': ' + eksik.map(ad => ad + (ad in GERI ? ' (geri)' : gelen.has(ad) ? '' : ' (gelmedi)')).join(', ') : 'AÇIK'}`);
}
for (const s of sorun) console.log('  !', s);
