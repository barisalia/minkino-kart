#!/usr/bin/env node
/**
 * Uygulama için seslendirmenin sıkıştırılmış kopyası: ekip/ses/seri2-gelen/<kimlik>.mp3 (tam kalite, YouTube) →
 * assets/film-seri2/ses/<kimlik>.mp3 (mono 64 kbps, 44.1 kHz; uygulama paketi küçük kalır, çevrimdışı çalışır).
 * Süre ve zamanlama aynı kalır (LAME başlığı kodlayıcı gecikmesini taşır, tarayıcı atar). Yalnız bölüm dosyalarında geçen replikler; kaynağı
 * daha yeni olan yeniden üretilir.
 *
 * node scripts/film/seri2-ses-uygulama.mjs [--bolum bolum-01] [--kbps 64]
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { bolumler, replikler, sesDosyasi, UYGULAMA_SES_KLASORU } from './seri2-ortak.mjs';

const require = createRequire(import.meta.url);
const ffmpeg = require('ffmpeg-static');
const arg = (ad, varsayilan) => {
  const i = process.argv.indexOf(`--${ad}`);
  return i >= 0 ? process.argv[i + 1] : varsayilan;
};
const kbps = arg('kbps', '64');
const liste = (arg('bolum') ? [arg('bolum')] : bolumler()).flatMap((b) => replikler(b));
fs.mkdirSync(UYGULAMA_SES_KLASORU, { recursive: true });
let yeni = 0, eksik = 0, toplam = 0;
for (const r of liste) {
  const kaynak = sesDosyasi(r.kimlik);
  if (!fs.existsSync(kaynak)) {
    eksik++;
    continue;
  }
  const hedef = path.join(UYGULAMA_SES_KLASORU, `${r.kimlik}.mp3`);
  if (!fs.existsSync(hedef) || fs.statSync(hedef).mtimeMs < fs.statSync(kaynak).mtimeMs) {
    const s = spawnSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', kaynak, '-ac', '1', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', `${kbps}k`, '-write_xing', '1', hedef], { encoding: 'utf8' });
    if (s.status !== 0) throw new Error(`${r.kimlik}: ${s.stderr}`);
    yeni++;
  }
  toplam += fs.statSync(hedef).size;
}
console.log(`uygulama sesleri: ${yeni} yeni, ${liste.length - eksik} hazır, ${eksik} kayıt bekleniyor · toplam ${(toplam / 1024).toFixed(0)} KB → ${UYGULAMA_SES_KLASORU}`);
