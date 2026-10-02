/**
 * Mağaza sürümü için seslendirme denetimi: kaydı olmayan (oyunda cihaz sesine düşecek) cümleleri listeler.
 *
 *   npx vite-node scripts/ses-denetim.ts            # liste (çıkış kodu 0)
 *   npx vite-node scripts/ses-denetim.ts -- --sert  # uygulamadaki oyunlarda eksik varsa çıkış kodu 1
 *
 * Bir cümle için anlatıcı kaydı (public/ses/manifest.json → dosyalar) ya da bir karakter kaydı varsa cihaz sesine
 * düşmez. Uyuyan Orman ve Minik Sanatçı uygulamada yok: onların cümleleri ayrıca gösterilir (yayını engellemez).
 * Kayıtlar CI'da (yayinla.yml → scripts/seslendir.ts) üretilir; bu betik kredi harcamaz, yalnız sayar.
 */
import fs from 'node:fs';
import path from 'node:path';
import { karakterCumleleri, tumCumleler } from '../src/audio/cumleler';
import type { SesManifest } from '../src/audio/karakter-ses';

const KOK = process.cwd();
const klasor = path.join(KOK, 'public/ses');
const manifest: SesManifest = JSON.parse(fs.readFileSync(path.join(klasor, 'manifest.json'), 'utf8'));
const var_ = (f: string | undefined) => !!f && fs.existsSync(path.join(klasor, f));

/** Yalnız web sitesindeki oyunların içerik metni (uygulamada yok) */
const yalnizWeb = ['content/orman.json', 'content/sanatci.json'].map((d) => fs.readFileSync(path.join(KOK, d), 'utf8')).join('\n');

const kCumleler = karakterCumleleri();
const karakterKaydi = (c: string) =>
  Object.entries(manifest.karakterler ?? {}).some(([k, kayit]) => (kCumleler[k] ?? []).includes(c) && var_(kayit.dosyalar[c]));

const eksik = tumCumleler().filter((c) => !var_(manifest.dosyalar[c]) && !karakterKaydi(c));
const web = eksik.filter((c) => yalnizWeb.includes(c));
const uygulama = eksik.filter((c) => !yalnizWeb.includes(c));

console.log(`Toplam ${tumCumleler().length} cümle; kaydı olmayan ${eksik.length} (uygulamadaki oyunlarda ${uygulama.length}, yalnız web: ${web.length}).`);
if (uygulama.length) {
  console.log('\nUygulamada cihaz sesine düşecek cümleler:');
  for (const c of uygulama) console.log(`  - ${c}`);
}
if (web.length) {
  console.log('\nYalnız web (Uyuyan Orman / Minik Sanatçı):');
  for (const c of web) console.log(`  - ${c}`);
}
if (process.env.GITHUB_STEP_SUMMARY) {
  const ozet = [`### Seslendirme denetimi`, `Uygulamada kaydı olmayan cümle: **${uygulama.length}**`, ...uygulama.map((c) => `- ${c}`)].join('\n');
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, ozet + '\n');
}
if (process.argv.includes('--sert') && uygulama.length) process.exit(1);
