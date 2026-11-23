/**
 * Minik Doktor · iskeletli vakaların (Y3–Y10) ve bekleme odasının (K1) çizimlerini bağlar.
 *
 *   npx tsx doktor/araclar-vaka/bagla.mts <paket> [--denetle] [ad …]
 *   paket: y3 (ates) · y4 (boya) · y5 (hapsu) · y6 (kanat) · y7 (karin) · y8 (kuzu) · y9 (bocek) · y10 (cingirak) · k1 (klinik)
 *
 * Kaynak: ekip/doktor/<paket>/kaynak/<ad>.png (Astra'nın teslimi). Hedef: assets/doktor/<klasör>/<ad>.webp.
 * Her çizim için: tuval brief'teki boyda mı (en-boy oranı %2'den fazla tutmuyorsa BAĞLANMAZ, yazılır), zemin (opak fon /
 * saydam katman), köşeler saydam mı, dolu oran, boş mu. Kare dizilerinde taban (alt kenar) ve boy tutarlılığı.
 * --denetle: yalnız ölçer, dosya yazmaz. Ad verilirse yalnız o çizimler. Çizimi gözle %100 boyda denetlemek ayrıca gerekir
 * (KALITE-KURALLARI madde 16): bu araç yalnız teknik kusurları yakalar.
 */
import fs from 'node:fs';
import sharp from 'sharp';

type Paket = { klasor: string; dosyalar: readonly string[]; tuval: Readonly<Record<string, readonly [number, number]>>; opak: readonly string[] };
const yukle = async (yol: string, d: string, t = 'TUVAL', o = 'OPAK'): Promise<Paket['dosyalar'] extends never ? never : Omit<Paket, 'klasor'>> => {
  const m = await import(yol) as Record<string, unknown>;
  return { dosyalar: m[d] as readonly string[], tuval: m[t] as Paket['tuval'], opak: m[o] as readonly string[] };
};
const PAKETLER: Record<string, () => Promise<Paket>> = {
  y3: async () => ({ klasor: 'ates', ...(await yukle('../src/vaka-ates/veri.ts', 'ATES_DOSYALAR')) }),
  y4: async () => ({ klasor: 'boya', ...(await yukle('../src/vaka-boya/veri.ts', 'BOYA_DOSYALAR')) }),
  y5: async () => ({ klasor: 'hapsu', ...(await yukle('../src/vaka-hapsu/veri.ts', 'HAPSU_DOSYALAR')) }),
  y6: async () => ({ klasor: 'kanat', ...(await yukle('../src/vaka-kanat/veri.ts', 'KANAT_DOSYALAR')) }),
  y7: async () => ({ klasor: 'karin', ...(await yukle('../src/vaka-karin/veri.ts', 'KARIN_DOSYALAR')) }),
  y8: async () => ({ klasor: 'kuzu', ...(await yukle('../src/vaka-kuzu/veri.ts', 'KUZU_DOSYALAR')) }),
  y9: async () => ({ klasor: 'bocek', ...(await yukle('../src/vaka-bocek/veri.ts', 'BOCEK_DOSYALAR')) }),
  y10: async () => ({ klasor: 'cingirak', ...(await yukle('../src/vaka-cingirak/veri.ts', 'CINGIRAK_DOSYALAR')) }),
  k1: async () => ({ klasor: 'klinik', ...(await yukle('../src/klinik/veri.ts', 'KLINIK_DOSYALAR')) }),
};

const [paketAdi, ...kalan] = process.argv.slice(2);
const DENETLE = kalan.includes('--denetle');
const yalniz = kalan.filter(a => !a.startsWith('--'));
if (!paketAdi || !PAKETLER[paketAdi]) { console.log('Kullanım: npx tsx doktor/araclar-vaka/bagla.mts <y3…y10|k1> [--denetle] [ad …]'); process.exit(2); }
const P = await PAKETLER[paketAdi]();
const KAYNAK = `ekip/doktor/${paketAdi}/kaynak/`, HEDEF = `assets/doktor/${P.klasor}/`;
if (!DENETLE) fs.mkdirSync(HEDEF, { recursive: true });

const adlar = P.dosyalar.filter(a => !yalniz.length || yalniz.includes(a));
const eksik: string[] = [], sorun: string[] = [], olcum: Record<string, { kutu: [number, number, number, number] | null }> = {};
let yazilan = 0, boyut = 0;
for (const ad of adlar) {
  const f = KAYNAK + ad + '.png';
  if (!fs.existsSync(f)) { eksik.push(ad); continue; }
  const [g, y] = P.tuval[ad];
  const r = sharp(f), m = await r.metadata();
  const opak = P.opak.includes(ad);
  const { data, info } = await sharp(f).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let x0 = info.width, y0 = info.height, x1 = -1, y1 = -1, dolu = 0;
  for (let yy = 0; yy < info.height; yy++) for (let xx = 0; xx < info.width; xx++) { if (data[(yy * info.width + xx) * 4 + 3] > 24) { dolu++; if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (yy < y0) y0 = yy; if (yy > y1) y1 = yy; } }
  const a = (xx: number, yy: number) => data[(yy * info.width + xx) * 4 + 3];
  const koseSaydam = [a(0, 0), a(info.width - 1, 0), a(0, info.height - 1), a(info.width - 1, info.height - 1)].every(v => v < 10);
  olcum[ad] = { kutu: x1 >= 0 ? [x0, y0, x1, y1] : null };
  const oran = (m.width! / m.height!) / (g / y);
  let bagla = true;
  if (Math.abs(oran - 1) > 0.02) { sorun.push(`${ad}: tuval ${m.width}×${m.height}, brief ${g}×${y} (oran tutmuyor: bağlanmadı)`); bagla = false; }
  else if (m.width !== g || m.height !== y) sorun.push(`${ad}: tuval ${m.width}×${m.height} → ${g}×${y} ölçeklenecek`);
  if (!opak && !koseSaydam) sorun.push(`${ad}: köşeler saydam değil (opak zemin?)`);
  if (opak && !koseSaydam === false && dolu / (info.width * info.height) < 0.98) sorun.push(`${ad}: opak fon olmalı, saydam yerler var`);
  if (x1 < 0) { sorun.push(`${ad}: boş`); bagla = false; }
  if (!DENETLE && bagla) {
    let s = sharp(f); if (m.width !== g || m.height !== y) s = s.resize(g, y, { fit: 'fill' });
    await (opak ? s.removeAlpha() : s.ensureAlpha()).webp({ quality: opak ? 86 : 90, alphaQuality: 100, effort: 5 }).toFile(HEDEF + ad + '.webp');
    boyut += fs.statSync(HEDEF + ad + '.webp').size; yazilan++;
  }
}
// kare dizileri (ad-0, ad-1, …): taban ve boy tutarlılığı
const diziler = new Map<string, string[]>();
for (const ad of Object.keys(olcum)) { const m = /^(.*)-(\d+)$/.exec(ad); if (m) diziler.set(m[1], [...(diziler.get(m[1]) ?? []), ad]); }
for (const [ad, uyeler] of diziler) {
  const k = uyeler.map(u => olcum[u].kutu).filter((x): x is [number, number, number, number] => !!x);
  if (k.length < 2) continue;
  const taban = k.map(x => x[3]), boy = k.map(x => x[3] - x[1]);
  if (Math.max(...taban) - Math.min(...taban) > 12) sorun.push(`${ad}-*: dizide taban ${Math.min(...taban)}…${Math.max(...taban)} (aynı hizada olmalı)`);
  const ort = boy.reduce((p, q) => p + q, 0) / boy.length;
  if (boy.some(b => Math.abs(b - ort) / ort > 0.25)) sorun.push(`${ad}-*: dizide boy ${Math.min(...boy)}…${Math.max(...boy)} (ölçek kayması?)`);
}
console.log(`${paketAdi} (${P.klasor}): ${adlar.length} çizimden ${adlar.length - eksik.length} kaynakta, ${eksik.length} eksik${DENETLE ? '' : `; ${yazilan} webp yazıldı (${(boyut / 1048576).toFixed(1)} MB)`}`);
if (eksik.length) console.log('eksik:', eksik.slice(0, 20).join(' '), eksik.length > 20 ? '…' : '');
console.log('sorun:', sorun.length); for (const s of sorun) console.log('  ', s);
