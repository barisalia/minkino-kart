// ElevenLabs Sound Effects ile kısa efektler üretir: content/efektler.json → public/ses/efekt/<ad>.mp3
// Yalnızca eksik (ya da metni/süresi değişmiş) olanlar üretilir. Kullanım: ELEVENLABS_API_KEY=... node scripts/efekt-sesleri.mjs
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const kok = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const ayar = JSON.parse(fs.readFileSync(path.join(kok, 'content', 'efektler.json'), 'utf8'));
const klasor = path.join(kok, 'public', 'ses', 'efekt');
const imzaDosyasi = path.join(klasor, 'imzalar.json');
fs.mkdirSync(klasor, { recursive: true });
const imzalar = fs.existsSync(imzaDosyasi) ? JSON.parse(fs.readFileSync(imzaDosyasi, 'utf8')) : {};
const anahtar = process.env.ELEVENLABS_API_KEY;
if (!anahtar) {
  console.log('ELEVENLABS_API_KEY yok, efektler atlandı');
  process.exit(0);
}

let uretilen = 0;
let kredi = 0;
for (const [ad, s] of Object.entries(ayar.sesler)) {
  const metin = `${s.metin}, ${ayar.ortak}`;
  const imza = createHash('sha1').update(`${metin}|${s.sure}`).digest('hex').slice(0, 12);
  const dosya = path.join(klasor, `${ad}.mp3`);
  if (fs.existsSync(dosya) && imzalar[ad] === imza) continue;
  try {
    const r = await fetch('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_64', {
      method: 'POST',
      headers: { 'xi-api-key': anahtar, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({ text: metin, duration_seconds: s.sure, prompt_influence: 0.6 }),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status} ${(await r.text()).slice(0, 200)}`);
    fs.writeFileSync(dosya, Buffer.from(await r.arrayBuffer()));
    imzalar[ad] = imza;
    uretilen++;
    kredi += Math.ceil(s.sure * 40);
    console.log('✓', ad);
  } catch (e) {
    console.error('✗', ad, e.message);
  }
}
fs.writeFileSync(imzaDosyasi, JSON.stringify(imzalar, null, 2) + '\n');
console.log(`${uretilen} efekt üretildi (~${kredi} kredi)`);
