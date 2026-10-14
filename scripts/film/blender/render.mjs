#!/usr/bin/env node
/**
 * Blender sahnesini düşük öncelikte (BelowNormal) kurar/render eder, sonra kareleri sesle MP4'e çevirir.
 *
 *   node scripts/film/blender/render.mjs --sahne content/film2/blender/b00-deneme.json --is <klasor> \
 *        [--tek 30,200] | [--yuzde 67 --ornek 8] [--cikti video.mp4] [--crf 18] [--hedef-mb 25] [--bulaniklik 0]
 *
 * --tek: yalnız seçilen kareler (<is>/kare/tek-XXXX.png). Aksi hâlde tüm kareler + MP4.
 * Ses: <is>/klipler.json (sahne kurucunun yazdığı replik zamanları) + <is>/ses/*.mp3 → karışım, -14 LUFS.
 * Kurgu sahnesi (JSON'da 'kesitler'): kesitler <is>/kesit-NN/ altına render edilir, MP4'te aralarında çapraz geçiş
 * (klipler.json → kesitler[].bas, gecis). --kesit N: yalnız o kesit. Klipte 'kazanc' (dB) sesi kısar/açar.
 * Ağır iş tek seferde bir tane: bilgisayar paylaşımlı.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const BURA = path.dirname(fileURLToPath(import.meta.url));
const KOK = path.resolve(BURA, '../../..');
const ANA = path.resolve(KOK, '..', '..', '..');
const arg = (ad, v) => { const i = process.argv.indexOf(`--${ad}`); return i >= 0 ? process.argv[i + 1] : v; };
const BLENDER = process.env.BLENDER ?? 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe';
const FFMPEG = [path.join(KOK, 'node_modules/ffmpeg-static/ffmpeg.exe'), path.join(ANA, 'node_modules/ffmpeg-static/ffmpeg.exe')].find((p) => fs.existsSync(p)) ?? 'ffmpeg';

const sahne = arg('sahne');
const is = path.resolve(arg('is'));
const tek = arg('tek');

function blender() {
  const a = ['-b', '--factory-startup', '-P', path.join(BURA, 'sahne_kur.py'), '--', '--sahne', sahne, '--is', is,
    '--yuzde', arg('yuzde', '100'), '--ornek', arg('ornek', '16'), '--bulaniklik', arg('bulaniklik', '1')];
  if (tek) a.push('--tek', tek); else a.push('--render');
  if (arg('blend')) a.push('--blend', arg('blend'));
  if (arg('kesit')) a.push('--kesit', arg('kesit'));
  if (!tek) {
    for (const d of fs.existsSync(is) ? fs.readdirSync(is) : []) {
      if ((d === 'kare' || (/^kesit-\d+$/.test(d) && (!arg('kesit') || d === `kesit-${String(arg('kesit')).padStart(2, '0')}`)))) fs.rmSync(path.join(is, d), { recursive: true, force: true });
    }
  }
  return new Promise((coz, red) => {
    const p = spawn(BLENDER, a, { cwd: KOK, stdio: ['ignore', 'pipe', 'pipe'] });
    try { execFileSync('powershell', ['-NoProfile', '-Command', `(Get-Process -Id ${p.pid}).PriorityClass='BelowNormal'`]); } catch { /* süreç çok kısa sürdüyse */ }
    const gunluk = fs.createWriteStream(path.join(is, 'blender.log'));
    p.stdout.on('data', (d) => { gunluk.write(d); const s = d.toString(); if (/\[sahne\]|Error|Traceback/.test(s)) process.stdout.write(s.split('\n').filter((l) => /\[sahne\]|Error|Traceback|File "/.test(l)).join('\n') + '\n'); });
    p.stderr.on('data', (d) => { gunluk.write(d); process.stderr.write(d); });
    p.on('close', (k) => (k === 0 ? coz() : red(new Error('blender çıkış ' + k))));
  });
}

function sesKaristir(sure) {
  const k = JSON.parse(fs.readFileSync(path.join(is, 'klipler.json'), 'utf8'));
  const girdi = [], suz = [];
  k.klipler.forEach((c, i) => {
    girdi.push('-i', path.join(is, 'ses', `${c.kimlik}.mp3`));
    const ms = Math.max(0, Math.round(c.t * 1000));
    const kaz = c.kazanc ? `,volume=${c.kazanc}dB` : '';
    suz.push(`[${i}:a]aresample=48000,aformat=channel_layouts=stereo${kaz},adelay=${ms}|${ms}[a${i}]`);
  });
  const n = k.klipler.length;
  suz.push(`${k.klipler.map((_, i) => `[a${i}]`).join('')}amix=inputs=${n}:normalize=0:duration=longest,apad,atrim=0:${sure},loudnorm=I=-14:TP=-1.5:LRA=11[ses]`);
  const wav = path.join(is, 'karisim.wav');
  execFileSync(FFMPEG, ['-y', '-v', 'error', ...girdi, '-filter_complex', suz.join(';'), '-map', '[ses]', '-ar', '48000', wav]);
  return wav;
}

function mp4(cikti, crf, olcek) {
  const k = JSON.parse(fs.readFileSync(path.join(is, 'klipler.json'), 'utf8'));
  const wav = sesKaristir(k.sure);
  const sonOlcek = olcek ? `scale=${olcek}:flags=lanczos` : 'scale=trunc(iw/2)*2:trunc(ih/2)*2';
  let girdi, vf;
  if (k.kesitler) {
    // kesitler: xfade zinciri, geçiş kesitin başlangıç anında (kurgu zamanı)
    girdi = k.kesitler.flatMap((c) => ['-framerate', String(k.fps), '-i', path.join(is, c.klasor, '%04d.png')]);
    const z = [];
    let onceki = '[0:v]';
    k.kesitler.slice(1).forEach((c, j) => {
      const ad = `[x${j + 1}]`;
      z.push(`${onceki}[${j + 1}:v]xfade=transition=fade:duration=${k.gecis}:offset=${c.bas}${ad}`);
      onceki = ad;
    });
    z.push(`${onceki}${sonOlcek},format=yuv420p[v]`);
    vf = ['-filter_complex', z.join(';'), '-map', '[v]', '-map', `${k.kesitler.length}:a`];
  } else {
    girdi = ['-framerate', String(k.fps), '-i', path.join(is, 'kare', '%04d.png')];
    vf = ['-vf', sonOlcek];
  }
  execFileSync(FFMPEG, ['-y', '-v', 'error', ...girdi, '-i', wav,
    ...vf, '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    '-c:a', 'aac', '-b:a', '160k', '-shortest', cikti]);
  console.log(cikti, (fs.statSync(cikti).size / 1048576).toFixed(1), 'MB');
}

const t0 = Date.now();
if (!process.argv.includes("--sadece-mp4")) await blender();
console.log(`blender: ${((Date.now() - t0) / 1000).toFixed(0)} sn`);
if (!tek && arg('cikti')) {
  mp4(path.resolve(arg('cikti')), arg('crf', '18'), arg('olcek'));
  if (arg('cikti-720')) mp4(path.resolve(arg('cikti-720')), arg('crf-720', '23'), '1280:720');
}
