#!/usr/bin/env node
/**
 * Oyunlu çizgi filmin seslendirmesini web'e hazırlar: ekip/ses/seri2-gelen/<söz>.mp3 (ElevenLabs, 128 kbps stereo)
 * → assets/ses-seri2/<söz>.mp3 (mono, 80 kbps). Baştaki ve sondaki sessizlik kırpılır (replik zamanlaması sesin
 * gerçek süresine uysun), ses düzeyi eşitlenir (fısıltılı repliklerle bağıran replikler aynı duyulsun; tepe -1 dB'yi
 * geçmez). Süreler ve en yüksek an (tepe) content/oyunlu/<bölüm>.ses.json'a yazılır (film/src/oyunlu: zaman çizelgesi bu sürelerle kurulur).
 *
 * node scripts/film/oyunlu-ses.mjs [--bolum kinonun-bir-gunu] [--zorla]
 *   Var olan çıktı dosyası yeniden kodlanmaz (--zorla ile kodlanır); süre her seferinde çıktıdan ölçülür.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ffmpeg = require('ffmpeg-static');
const kok = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const arg = (ad, varsayilan) => {
  const i = process.argv.indexOf(`--${ad}`);
  return i >= 0 ? process.argv[i + 1] : varsayilan;
};
const bolum = arg('bolum', 'kinonun-bir-gunu');
const zorla = process.argv.includes('--zorla');
const GELEN = path.join(kok, 'ekip/ses/seri2-gelen');
const CIKTI = path.join(kok, 'assets/ses-seri2');
const icerik = JSON.parse(fs.readFileSync(path.join(kok, `content/oyunlu/${bolum}.json`), 'utf8'));

const HZ = 44100;
/** sessizlik eşiği (RMS, ~ -42 dB) ve kırpmada bırakılan pay (sn) */
const ESIK = 0.008, ON_PAY = 0.03, SON_PAY = 0.1;
/** konuşan kısmın hedef RMS'i (~ -19 dBFS) ve tepe sınırı (-1 dBFS) */
const HEDEF_RMS = 0.11, TEPE = 0.89;

function coz(dosya) {
  const ham = execFileSync(ffmpeg, ['-v', 'error', '-i', dosya, '-ac', '1', '-ar', String(HZ), '-f', 'f32le', '-'], { maxBuffer: 1 << 28 });
  return new Float32Array(ham.buffer.slice(ham.byteOffset, ham.byteOffset + ham.length));
}

fs.mkdirSync(CIKTI, { recursive: true });
const sureler = {};
const eksik = [];
for (const id of Object.keys(icerik.sozler)) {
  const kaynak = path.join(GELEN, `${id}.mp3`);
  const hedef = path.join(CIKTI, `${id}.mp3`);
  if (!fs.existsSync(kaynak) && !fs.existsSync(hedef)) {
    eksik.push(id);
    continue;
  }
  if (fs.existsSync(kaynak) && (zorla || !fs.existsSync(hedef))) {
    const x = coz(kaynak);
    const adim = Math.round(HZ * 0.01);
    const rms = [];
    for (let i = 0; i < x.length; i += adim) {
      let s = 0;
      const n = Math.min(x.length, i + adim) - i;
      for (let j = i; j < i + n; j++) s += x[j] * x[j];
      rms.push(Math.sqrt(s / n));
    }
    const ilk = rms.findIndex((v) => v > ESIK);
    let son = rms.length - 1;
    while (son > 0 && rms[son] <= ESIK) son--;
    const bas = Math.max(0, ilk * 0.01 - ON_PAY);
    const bit = Math.min(x.length / HZ, (son + 1) * 0.01 + SON_PAY);
    // konuşan kısmın gücü (sessiz pencereler hariç) ve tepe
    let e = 0, n = 0, tepe = 0;
    for (let i = 0; i < rms.length; i++) if (rms[i] > ESIK * 3) (e += rms[i] * rms[i], n++);
    for (const v of x) tepe = Math.max(tepe, Math.abs(v));
    const guc = n ? Math.sqrt(e / n) : HEDEF_RMS;
    const kazanc = Math.max(0.5, Math.min(4, HEDEF_RMS / guc, TEPE / Math.max(tepe, 1e-6)));
    const sure = bit - bas;
    const filtre = [
      `atrim=start=${bas.toFixed(3)}:end=${bit.toFixed(3)}`,
      'asetpts=PTS-STARTPTS',
      `volume=${kazanc.toFixed(3)}`,
      'afade=t=in:d=0.015',
      `afade=t=out:st=${Math.max(0, sure - 0.06).toFixed(3)}:d=0.06`,
    ].join(',');
    execFileSync(ffmpeg, ['-v', 'error', '-y', '-i', kaynak, '-af', filtre, '-ac', '1', '-ar', String(HZ), '-c:a', 'libmp3lame', '-b:a', '80k', hedef]);
    console.log(id.padEnd(12), `kırpma ${bas.toFixed(2)}..${bit.toFixed(2)} sn`, `kazanç ${kazanc.toFixed(2)}`);
  }
  // süre ve en yüksek an (30 ms pencere): hapşırık gibi tek patlamalı repliklerde beden bu ana göre oynar
  const y = coz(hedef);
  const pen = Math.round(HZ * 0.03);
  let enGuc = 0, tepeAn = 0;
  for (let i = 0; i + pen <= y.length; i += Math.round(pen / 3)) {
    let s = 0;
    for (let j = i; j < i + pen; j++) s += y[j] * y[j];
    if (s > enGuc) (enGuc = s, tepeAn = (i + pen / 2) / HZ);
  }
  sureler[id] = { sure: Math.round((y.length / HZ) * 1000) / 1000, tepe: Math.round(tepeAn * 100) / 100 };
}

const sesJson = {
  aciklama: `Seslendirme süreleri (sn): scripts/film/oyunlu-ses.mjs üretir, elle değiştirmeyin. Sesler assets/ses-seri2/<söz>.mp3 (kaynak ekip/ses/seri2-gelen, ElevenLabs eleven_v4).`,
  sozler: sureler,
};
fs.writeFileSync(path.join(kok, `content/oyunlu/${bolum}.ses.json`), JSON.stringify(sesJson, null, 2) + '\n');
console.log(`${Object.keys(sureler).length} söz hazır`, eksik.length ? `· eksik: ${eksik.join(', ')}` : '');
