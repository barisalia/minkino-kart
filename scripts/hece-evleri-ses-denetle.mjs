// Hece Evleri kayıtlarını denetler: süre (ffmpeg) ve ElevenLabs Scribe ile yazıya döküp metinle karşılaştırma.
// Kısaltma gibi okunan ("mon" → "Pazartesi") ya da başka sözcüğe dönen heceler listelenir.
// Kullanım (PowerShell): . ./scripts/elevenlabs-ortam.ps1; node scripts/hece-evleri-ses-denetle.mjs [rapor.json] [kayıt adları…]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';

const ANAHTAR = process.env.ELEVENLABS_API_KEY;
if (!ANAHTAR) throw new Error('ELEVENLABS_API_KEY gerekli.');
const veri = JSON.parse(readFileSync('alfabe/src/hece-evleri-veri.json', 'utf8'));
const BELIRTEC = { 'ç': 'cc', 'ş': 'ss', 'ı': 'ii', 'ö': 'oo', 'ü': 'uu' };
const ad = h => BELIRTEC[h] ?? h;
const kayitlar = [];
for (const [id, metin] of Object.entries(veri.sozler)) kayitlar.push({ id, metin, hece: false });
for (const u of veri.unsuzler) for (const v of veri.unluler) kayitlar.push({ id: 'ev-' + ad(u) + '-' + ad(v), metin: u + v, hece: true });
const yalniz = process.argv.slice(3);
if (yalniz.length) kayitlar.splice(0, kayitlar.length, ...kayitlar.filter(k => yalniz.includes(k.id)));
const sade = s => s.replace(/\[[^\]]+\]/g, '').toLocaleLowerCase('tr').replace(/[^a-zçğıöşü]/g, '');
const bekle = ms => new Promise(r => setTimeout(r, ms));

function sure(dosya) {
  const c = spawnSync(ffmpeg, ['-hide_banner', '-i', dosya, '-f', 'null', '-'], { encoding: 'utf8' });
  const m = /time=(\d+):(\d+):([\d.]+)/g, t = [...(c.stderr ?? '').matchAll(m)].pop();
  return t ? +t[1] * 3600 + +t[2] * 60 + +t[3] : NaN;
}
async function yaziyaDok(dosya) {
  for (let deneme = 1; deneme <= 4; deneme++) {
    const fd = new FormData();
    fd.append('model_id', 'scribe_v1');
    fd.append('language_code', 'tr');
    fd.append('tag_audio_events', 'false');
    fd.append('file', new Blob([readFileSync(dosya)], { type: 'audio/mpeg' }), 'kayit.mp3');
    const r = await fetch('https://api.elevenlabs.io/v1/speech-to-text', { method: 'POST', headers: { 'xi-api-key': ANAHTAR }, body: fd });
    if (r.ok) return (await r.json()).text ?? '';
    if (r.status === 429 || r.status >= 500) { await bekle(1500 * deneme * deneme); continue; }
    throw new Error('Scribe ' + r.status);
  }
  throw new Error('Scribe: çok fazla deneme');
}

const rapor = [];
for (const k of kayitlar) {
  const dosya = 'assets/alfabe/ses/' + k.id + '.mp3';
  if (!existsSync(dosya)) { rapor.push({ ...k, sorun: 'kayıt yok' }); continue; }
  const sn = sure(dosya);
  const duyulan = await yaziyaDok(dosya);
  const a = sade(duyulan), b = sade(k.metin);
  const sorunlar = [];
  if (k.hece && !(sn < 1.4)) sorunlar.push('uzun (' + sn.toFixed(2) + ' sn)');
  if (k.hece ? !(a === b || a === b + b || (a.length <= 4 && a.startsWith(b))) : a !== b) sorunlar.push('duyulan: ' + duyulan.trim());
  rapor.push({ id: k.id, metin: k.metin, sn: +sn.toFixed(2), duyulan: duyulan.trim(), sorun: sorunlar.join('; ') });
  process.stdout.write(sorunlar.length ? '!' : '.');
}
const hatali = rapor.filter(r => r.sorun);
writeFileSync(process.argv[2] ?? 'hece-evleri-ses-raporu.json', JSON.stringify(rapor, null, 1));
console.log('\n' + rapor.length + ' kayıt, ' + hatali.length + ' şüpheli');
for (const r of hatali) console.log(r.id, '|', r.metin, '|', r.sorun);
