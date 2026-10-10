/**
 * YouTube çıktısı için ortak araçlar (Kino ve Ailesi bölüm kaydı: bolum-kayit.mjs; ileride oyunlu bölümlerin "Kino
 * kendisi oynar" kaydı da bunları kullanır): kendi geliştirme sunucusu, kare borusu (PNG → H.264), -14 LUFS ses.
 */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
export const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const FFMPEG = require('ffmpeg-static');

/** Bu kayda özel Vite geliştirme sunucusu (başkasının sunucusuna bağlanmaz): verilen portta, kapanınca durur */
export async function sunucuBaslat(port) {
  const { createServer } = await import('vite');
  const sunucu = await createServer({
    root: KOK,
    configFile: path.join(KOK, 'vite.config.ts'),
    logLevel: 'error',
    // node_modules bir bağlantı olabilir (çalışma ağacı): gerçek yolu da sunulabilir
    server: { port, strictPort: true, host: '127.0.0.1', hmr: false, watch: null, fs: { allow: [KOK, fs.realpathSync(path.join(KOK, 'node_modules'))] } },
  });
  await sunucu.listen();
  return { adres: `http://127.0.0.1:${port}`, kapat: () => sunucu.close() };
}

/**
 * PNG kareleri borudan H.264'e (YouTube: yuv420p, BT.709, CRF 18, 30 fps). Dönüş: { yaz(buffer), bitir() }.
 */
export function videoBorusu(cikti, fps = 30, crf = 18) {
  const ff = spawn(
    FFMPEG,
    [
      '-y', '-loglevel', 'error',
      '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
      '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-profile:v', 'high', '-g', String(fps * 2), '-bf', '2',
      '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
      '-r', String(fps), '-movflags', '+faststart', cikti,
    ],
    { stdio: ['pipe', 'inherit', 'inherit'] },
  );
  const bitti = new Promise((coz, red) => ff.on('close', (k) => (k === 0 ? coz() : red(new Error(`ffmpeg video: ${k}`)))));
  return {
    yaz: (b) => new Promise((coz) => (ff.stdin.write(b) ? coz() : ff.stdin.once('drain', coz))),
    bitir: async () => {
      ff.stdin.end();
      await bitti;
    },
  };
}

const ffmpegCalistir = (args) => {
  const r = spawnSync(FFMPEG, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`ffmpeg: ${r.stderr.slice(-2000)}`);
  return r.stderr;
};

/** EBU R128 ölçümü (loudnorm ilk geçiş) */
export function sesOlc(wav, hedef = -14) {
  const e = ffmpegCalistir(['-hide_banner', '-nostats', '-i', wav, '-af', `loudnorm=I=${hedef}:TP=-1.5:LRA=11:print_format=json`, '-f', 'null', '-']);
  const j = e.slice(e.lastIndexOf('{'), e.lastIndexOf('}') + 1);
  return JSON.parse(j);
}

/** İki geçişli loudnorm: hedef -14 LUFS, tepe -1.5 dBTP; dönüş: ölçüm (önce) */
export function sesDuzelt(wav, cikti, hedef = -14) {
  const o = sesOlc(wav, hedef);
  ffmpegCalistir([
    '-y', '-hide_banner', '-i', wav,
    '-af', `loudnorm=I=${hedef}:TP=-1.5:LRA=11:measured_I=${o.input_i}:measured_TP=${o.input_tp}:measured_LRA=${o.input_lra}:measured_thresh=${o.input_thresh}:offset=${o.target_offset}:linear=true:print_format=summary`,
    '-ar', '48000', cikti,
  ]);
  return o;
}

/** Görüntü + düzeltilmiş ses → mp4 (görüntü yeniden kodlanmaz, ses AAC 192k) */
export function birlestir(video, ses, cikti) {
  ffmpegCalistir(['-y', '-hide_banner', '-i', video, '-i', ses, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', cikti]);
}

/** son dosyanın tümleşik ses düzeyi (LUFS) */
export function lufs(dosya) {
  return Number(sesOlc(dosya).input_i);
}
