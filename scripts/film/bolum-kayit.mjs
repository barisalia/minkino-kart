#!/usr/bin/env node
/**
 * Kino ve Ailesi bölümünü YouTube için kaydeder (content/film2/<bolum>.json): kare kare (gerçek zaman beklenmez,
 * kare atlamaz) 1920×1080 30 fps H.264 CRF 18 + AAC 192k, ses -14 LUFS (iki geçişli loudnorm), altyazı ayrı .srt.
 * Kendi Vite sunucusunu açar (varsayılan port 4317); sayfa: film/bolum.html?kayit=1.
 *
 * node scripts/film/bolum-kayit.mjs --cikti <klasor> [--bolum bolum-01] [--parca tum|acilis|s4|s4,kapanis]
 *   [--ad <dosya-adi>] [--port 4317] [--boy 1920x1080] [--kareler 0,300,900 (yalnız PNG kareler)]
 *   [--srt] (yalnız altyazı) [--kapak] (1280×720 YouTube kapağı PNG + JPG) [--duzey-yaz] (uygulama için ses düzeyi: content/film2/<bolum>-duzey.json)
 * Ses dosyası olmayan replikler sessiz kalır (yer tutucu ses üretilmez); eksikler listelenir: <ad>.eksikler.txt.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { birlestir, KOK, lufs, sesDuzelt, sunucuBaslat, videoBorusu } from './youtube-ortak.mjs';

const arg = (ad, varsayilan) => {
  const i = process.argv.indexOf(`--${ad}`);
  return i >= 0 ? process.argv[i + 1] : varsayilan;
};
const var_ = (ad) => process.argv.includes(`--${ad}`);
const cikti = path.resolve(arg('cikti', path.join(KOK, 'dist-video')));
const bolum = arg('bolum', 'bolum-01');
const parca = arg('parca', 'tum');
const ad = arg('ad', `${bolum}${parca === 'tum' ? '' : `-${parca.replace(/,/g, '-')}`}`);
const port = Number(arg('port', '4317'));
const boy = arg('boy', '1920x1080');
const secili = arg('kareler');
fs.mkdirSync(cikti, { recursive: true });

const sunucu = await sunucuBaslat(port);
const tarayici = await chromium.launch();
try {
  const [w, h] = boy.split('x').map(Number);
  const sayfa = await tarayici.newPage({ viewport: { width: Math.min(w, 1920), height: Math.min(h, 1080) }, deviceScaleFactor: 1 });
  const hatalar = [];
  sayfa.on('pageerror', (e) => hatalar.push(String(e)));
  sayfa.on('console', (m) => m.type() === 'error' && hatalar.push(m.text()));

  if (var_('kapak')) {
    await sayfa.goto(`${sunucu.adres}/film/bolum.html?kapak=1&bolum=${bolum}`);
    await sayfa.waitForFunction(() => window.film2Kapak);
    await sayfa.evaluate(() => window.film2Kapak.hazir);
    const veri = await sayfa.evaluate(() => window.film2Kapak.png());
    const png = path.join(cikti, `${bolum}-kapak.png`);
    fs.writeFileSync(png, Buffer.from(veri.split(',')[1], 'base64'));
    const sharp = (await import('sharp')).default;
    await sharp(png).jpeg({ quality: 92, mozjpeg: true }).toFile(path.join(cikti, `${bolum}-kapak.jpg`));
    console.log('kapak:', png);
  } else {
    await sayfa.goto(`${sunucu.adres}/film/bolum.html?kayit=1&bolum=${bolum}&parca=${parca}&boy=${boy}`);
    await sayfa.waitForFunction(() => window.film2Kayit);
    await sayfa.evaluate(() => window.film2Kayit.hazir);
    const { fps, n, sure, eksikler, denetim } = await sayfa.evaluate(() => ({
      fps: window.film2Kayit.fps,
      n: window.film2Kayit.kareSayisi(),
      sure: window.film2Kayit.sure(),
      eksikler: window.film2Kayit.eksikler(),
      denetim: window.film2Kayit.hatalar(),
    }));
    if (denetim.length) console.warn(`bölüm dosyası denetimi (${denetim.length}):\n  ${denetim.join('\n  ')}`);
    console.log(`${bolum} ${parca}: ${n} kare, ${sure.toFixed(2)} sn`);
    if (var_('srt')) {
      // yalnız altyazı (görüntü kaydı yok)
      fs.writeFileSync(path.join(cikti, `${ad}.srt`), await sayfa.evaluate(() => window.film2Kayit.srt()), 'utf8');
      console.log('srt:', path.join(cikti, `${ad}.srt`));
    } else if (secili) {
      const istek = secili.split(',').map(Number).sort((a, b) => a - b);
      for (let i = 0, j = 0; i <= istek[istek.length - 1]; i++) {
        await sayfa.evaluate((k) => window.film2Kayit.kare(k), i);
        if (i === istek[j]) {
          const veri = await sayfa.evaluate(() => window.film2Kayit.png());
          fs.writeFileSync(path.join(cikti, `${ad}-kare-${String(i).padStart(5, '0')}.png`), Buffer.from(veri.split(',')[1], 'base64'));
          j++;
        }
      }
      console.log('kareler:', cikti);
    } else {
      const geciciVideo = path.join(cikti, `${ad}.gecici.mp4`);
      const boru = videoBorusu(geciciVideo, fps, 18);
      const bas = Date.now();
      for (let i = 0; i < n; i++) {
        const veri = await sayfa.evaluate((k) => {
          window.film2Kayit.kare(k);
          return window.film2Kayit.png();
        }, i);
        await boru.yaz(Buffer.from(veri.slice(veri.indexOf(',') + 1), 'base64'));
        if (i % 150 === 0) console.log(`kare ${i}/${n} (${((Date.now() - bas) / 1000).toFixed(0)} sn)`);
      }
      await boru.bitir();
      // ses: tarayıcıda aynı zaman çizgisiyle işlenir, parça parça alınır
      const boyut = await sayfa.evaluate(() => window.film2Kayit.sesHazirla());
      const hamWav = path.join(cikti, `${ad}.ham.wav`);
      const fd = fs.openSync(hamWav, 'w');
      const PARCA = 4 * 1024 * 1024;
      for (let o = 0; o < boyut; o += PARCA) {
        const b64 = await sayfa.evaluate(([a, b]) => window.film2Kayit.sesParca(a, b), [o, PARCA]);
        fs.writeSync(fd, Buffer.from(b64, 'base64'));
      }
      fs.closeSync(fd);
      const duzWav = path.join(cikti, `${ad}.ses.wav`);
      const olcum = sesDuzelt(hamWav, duzWav, -14);
      const mp4 = path.join(cikti, `${ad}.mp4`);
      birlestir(geciciVideo, duzWav, mp4);
      for (const f of [geciciVideo, hamWav, duzWav]) fs.rmSync(f, { force: true });
      const srt = await sayfa.evaluate(() => window.film2Kayit.srt());
      fs.writeFileSync(path.join(cikti, `${ad}.srt`), srt, 'utf8');
      const kazancDb = Math.round((-14 - Number(olcum.input_i)) * 10) / 10;
      console.log(`ses: ham ${olcum.input_i} LUFS → -14 hedef; son dosya ${lufs(mp4).toFixed(1)} LUFS (uygulama kazancı ${kazancDb} dB)`);
      if (var_('duzey-yaz')) {
        fs.writeFileSync(path.join(KOK, 'content/film2', `${bolum}-duzey.json`), JSON.stringify({ aciklama: 'YouTube kaydının loudnorm ölçümü: uygulama aynı düzeyde çalsın (scripts/film/bolum-kayit.mjs --duzey-yaz)', kazancDb, hamLufs: Number(olcum.input_i) }, null, 2) + '\n');
      }
      console.log('mp4:', mp4);
      console.log('srt:', path.join(cikti, `${ad}.srt`));
    }
    fs.writeFileSync(path.join(cikti, `${ad}.eksikler.txt`), eksikler.join('\n') + '\n', 'utf8');
    console.log(`eksikler (${eksikler.length}): ${path.join(cikti, `${ad}.eksikler.txt`)}`);
  }
  if (hatalar.length) console.error('sayfa hataları:\n' + hatalar.join('\n'));
} finally {
  await tarayici.close();
  await sunucu.kapat();
}
