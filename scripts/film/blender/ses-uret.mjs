#!/usr/bin/env node
/**
 * Blender sahnesinin repliklerini ElevenLabs (content/film2/sesler.json: model, ses kimlikleri, ayarlar) ile üretir.
 * Sahne JSON'undaki "replikler" listesi: [{ kimlik, kim, metin }]. Çıktı: <is>/ses/<kimlik>.mp3 (var olan atlanır).
 * KREDİ HARCAR. Kuru deneme: --kuru. Anahtar: ELEVENLABS_API_KEY (süreçte yoksa Windows kullanıcı ortamından okunur,
 * hiçbir yere yazılmaz/yazdırılmaz).
 *   node scripts/film/blender/ses-uret.mjs --sahne content/film2/blender/b00-deneme.json --is <klasor> [--kuru] [--zorla]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const arg = (ad, v) => { const i = process.argv.indexOf(`--${ad}`); return i >= 0 ? process.argv[i + 1] : v; };
const sahne = JSON.parse(fs.readFileSync(path.resolve(KOK, arg('sahne')), 'utf8'));
const is = path.resolve(arg('is'));
const ayar = JSON.parse(fs.readFileSync(path.join(KOK, 'content/film2/sesler.json'), 'utf8'));
const klasor = path.join(is, 'ses');
fs.mkdirSync(klasor, { recursive: true });

const yap = sahne.replikler.filter((r) => process.argv.includes('--zorla') || !fs.existsSync(path.join(klasor, `${r.kimlik}.mp3`)));
console.log(`${sahne.replikler.length} replik, ${yap.length} üretilecek (${yap.reduce((t, r) => t + r.metin.length, 0)} harf)`);
if (process.argv.includes('--kuru')) { for (const r of yap) console.log(' ', r.kimlik, r.kim, r.metin); process.exit(0); }

let anahtar = process.env.ELEVENLABS_API_KEY;
if (!anahtar && process.platform === 'win32') {
  anahtar = execFileSync('powershell', ['-NoProfile', '-Command', "[Environment]::GetEnvironmentVariable('ELEVENLABS_API_KEY','User')"], { encoding: 'utf8' }).trim();
}
if (!anahtar) { console.error('ELEVENLABS_API_KEY yok'); process.exit(1); }

for (const r of yap) {
  const ses = ayar.sesler[r.kim];
  let y;
  for (let d = 0; d < 3; d++) {
    y = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ses}?output_format=${ayar.bicim}`, {
      method: 'POST',
      headers: { 'xi-api-key': anahtar, 'content-type': 'application/json', accept: 'audio/mpeg' },
      body: JSON.stringify({ text: r.metin, model_id: ayar.model, language_code: ayar.dil, voice_settings: ayar.ayarlar }),
    });
    if (y.ok || (y.status !== 429 && y.status < 500)) break;
    await new Promise((c) => setTimeout(c, 2500 * (d + 1)));
  }
  if (!y.ok) { console.error(`HATA ${r.kimlik}: ${y.status} ${(await y.text()).slice(0, 200)}`); continue; }
  fs.writeFileSync(path.join(klasor, `${r.kimlik}.mp3`), Buffer.from(await y.arrayBuffer()));
  console.log('  ✓', r.kimlik);
}
