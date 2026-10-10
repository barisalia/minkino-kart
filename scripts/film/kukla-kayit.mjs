#!/usr/bin/env node
/**
 * Kino kukla deneme klibini kare kare kaydeder (film/kukla-test.html, ?kayit=1).
 * Sayfa her kareyi kendi saatine göre çizer (gerçek zaman beklenmez, kare atlamaz); kareler PNG, sonra ffmpeg ile
 * webm (VP9) + Kino'nun sesleri doğru anlarına yerleşir.
 *
 * Önce geliştirme sunucusu: npx vite --port 5297
 * node scripts/film/kukla-kayit.mjs --webm <cikti.webm> [--adres http://localhost:5297/film/kukla-test.html]
 *   [--dpr 2] [--kareler 30,120,200 --kare-klasoru <klasor>]   (yalnız seçili kareleri PNG olarak yazar)
 */
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const arg = (ad, varsayilan) => {
  const i = process.argv.indexOf(`--${ad}`);
  return i >= 0 ? process.argv[i + 1] : varsayilan;
};
const adres = arg('adres', 'http://localhost:5297/film/kukla-test.html');
const dpr = Number(arg('dpr', '2'));
const webm = arg('webm');
const secili = arg('kareler');
const kareKlasoru = arg('kare-klasoru', fs.mkdtempSync(path.join(os.tmpdir(), 'kukla-')));

const tarayici = await chromium.launch();
try {
  const sayfa = await tarayici.newPage({ viewport: { width: 844, height: 390 }, deviceScaleFactor: dpr });
  const hatalar = [];
  sayfa.on('pageerror', (e) => hatalar.push(String(e)));
  sayfa.on('console', (m) => m.type() === 'error' && hatalar.push(m.text()));
  await sayfa.goto(`${adres}?kayit=1`);
  await sayfa.waitForFunction(() => window.kuklaTest);
  await sayfa.evaluate(() => window.kuklaTest.hazir);
  const { fps, sure, sesler } = await sayfa.evaluate(() => ({ fps: window.kuklaTest.fps, sure: window.kuklaTest.sure, sesler: window.kuklaTest.sesler }));
  const kareler = secili ? secili.split(',').map(Number) : [...Array(Math.round(fps * sure)).keys()];
  fs.mkdirSync(kareKlasoru, { recursive: true });
  for (const i of kareler) {
    const veri = await sayfa.evaluate((k) => {
      window.kuklaTest.kare(k);
      return document.querySelector('canvas').toDataURL('image/png');
    }, i);
    const ad = secili ? `kare-${String(i).padStart(4, '0')}.png` : `k${String(i).padStart(5, '0')}.png`;
    fs.writeFileSync(path.join(kareKlasoru, ad), Buffer.from(veri.split(',')[1], 'base64'));
  }
  if (hatalar.length) console.error('sayfa hataları:\n' + hatalar.join('\n'));
  if (webm && !secili) {
    const ffmpeg = require('ffmpeg-static');
    const girdi = ['-y', '-framerate', String(fps), '-i', path.join(kareKlasoru, 'k%05d.png')];
    const filtre = [];
    sesler.forEach((s, i) => {
      girdi.push('-i', path.join(KOK, 'public', s.dosya));
      const ms = Math.round(s.t * 1000);
      filtre.push(`[${i + 1}:a]adelay=${ms}|${ms}[s${i}]`);
    });
    filtre.push(`${sesler.map((_, i) => `[s${i}]`).join('')}amix=inputs=${sesler.length}:normalize=0,apad[ses]`);
    const cikti = ['-filter_complex', filtre.join(';'), '-map', '0:v', '-map', '[ses]', '-t', String(sure), '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '24', '-row-mt', '1', '-pix_fmt', 'yuv420p', '-c:a', 'libopus', '-b:a', '96k', webm];
    execFileSync(ffmpeg, [...girdi, ...cikti], { stdio: 'inherit' });
    console.log('webm:', webm);
  }
  console.log('kareler:', kareKlasoru);
} finally {
  await tarayici.close();
}
