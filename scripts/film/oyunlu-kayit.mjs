#!/usr/bin/env node
/**
 * Oyunlu çizgi filmi (oyunlu/kinonun-bir-gunu.html) kare kare MP4'e kaydeder: sayfa ?kayit=1 ile sahte saatle
 * çizer (gerçek zaman beklenmez, kare atlamaz), oyunu sanal parmak oynar; ses günlüğü OfflineAudioContext'te
 * aynı kodla işlenir (efektler + müzik; seslendirme henüz yok, altyazı görüntüde).
 *
 * Önce sunucu: npx vite --port 43xx  (ya da derleme + vite preview)
 * node scripts/film/oyunlu-kayit.mjs --adres http://localhost:43xx/oyunlu/kinonun-bir-gunu.html --mp4 <cikti.mp4>
 *   [--dpr 2] [--boy 844x390] [--yas 3] [--kareler 30,600 --kare-klasoru <klasor>]  (yalnız seçili kareler PNG)
 */
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const arg = (ad, varsayilan) => {
  const i = process.argv.indexOf(`--${ad}`);
  return i >= 0 ? process.argv[i + 1] : varsayilan;
};
const adres = arg('adres');
const mp4 = arg('mp4');
const dpr = Number(arg('dpr', '2'));
const boy = arg('boy', '844x390');
const yas = arg('yas', '3');
const secili = arg('kareler');
const klasor = arg('kare-klasoru', fs.mkdtempSync(path.join(os.tmpdir(), 'oyunlu-')));
if (!adres) throw new Error('--adres gerekli');

const tarayici = await chromium.launch();
try {
  const [w, h] = boy.split('x').map(Number);
  const sayfa = await tarayici.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const hatalar = [];
  sayfa.on('pageerror', (e) => hatalar.push(String(e)));
  sayfa.on('console', (m) => m.type() === 'error' && hatalar.push(m.text()));
  await sayfa.goto(`${adres}?kayit=1&dpr=${dpr}&boy=${boy}&yas=${yas}`);
  await sayfa.waitForFunction(() => window.oyunluKayit);
  await sayfa.evaluate(() => window.oyunluKayit.hazir);
  const fps = await sayfa.evaluate(() => window.oyunluKayit.fps);
  fs.mkdirSync(klasor, { recursive: true });
  const istek = secili ? new Set(secili.split(',').map(Number)) : null;
  const son = istek ? Math.max(...istek) : Infinity;
  let i = 0;
  for (; i <= son; i++) {
    const bitti = await sayfa.evaluate(() => window.oyunluKayit.bitti());
    if (bitti) break;
    if (!istek || istek.has(i)) {
      const veri = await sayfa.evaluate(() => document.querySelector('canvas').toDataURL('image/png'));
      const ad = istek ? `kare-${String(i).padStart(5, '0')}.png` : `k${String(i).padStart(5, '0')}.png`;
      fs.writeFileSync(path.join(klasor, ad), Buffer.from(veri.split(',')[1], 'base64'));
    }
    await sayfa.evaluate(() => window.oyunluKayit.adim(1));
    if (i % 300 === 0) console.log('kare', i);
  }
  const sure = i / fps;
  console.log('kare sayısı', i, 'süre', sure.toFixed(1), 'sn');
  if (mp4 && !istek) {
    const wavYol = path.join(klasor, 'ses.wav');
    const b64 = await sayfa.evaluate((s) => window.oyunluKayit.sesiIsle(s), sure);
    fs.writeFileSync(wavYol, Buffer.from(b64, 'base64'));
    const ffmpeg = require('ffmpeg-static');
    execFileSync(
      ffmpeg,
      ['-y', '-framerate', String(fps), '-i', path.join(klasor, 'k%05d.png'), '-i', wavYol, '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', mp4],
      { stdio: 'inherit' },
    );
    console.log('mp4:', mp4);
  }
  if (hatalar.length) console.error('sayfa hataları:\n' + hatalar.join('\n'));
  console.log('kareler:', klasor);
} finally {
  await tarayici.close();
}
