// İngilizceye Merhaba · Polly'nin Şarkıları: şarkıyı Barış Gemini'den üretir (20 Kasım 2026: ElevenLabs'te müzik
// üretilmez). Bu betik yalnız gelen dosyayı denetler: sözleri Scribe ile yazıya çevirir ve sözcük zamanlarını çıkarır
// (şarkı ekranında sözcükler o anda yanar, hayvan o anda sahneye gelir). Anahtar ortamdan gelir, asla yazdırılmaz.
// Kullanım: . ./scripts/elevenlabs-ortam.ps1; node scripts/ingilizce-sarki.mjs <şarkı.mp3> <ad>
//   → output/ingilizce/sarki/<ad>-zaman.json  ([sözcük, başlangıç ms, bitiş ms] dizisi)
import fs from 'node:fs';
import path from 'node:path';

const [dosya, ad] = process.argv.slice(2);
if (!dosya || !ad || !fs.existsSync(dosya)) throw new Error('kullanım: node scripts/ingilizce-sarki.mjs <şarkı.mp3> <ad>');
const anahtar = process.env.ELEVENLABS_API_KEY;
if (!anahtar) throw new Error('ELEVENLABS_API_KEY yok: önce . ./scripts/elevenlabs-ortam.ps1');

const form = new FormData();
form.append('model_id', 'scribe_v1');
form.append('language_code', 'en');
form.append('timestamps_granularity', 'word');
form.append('file', new Blob([fs.readFileSync(dosya)], { type: 'audio/mpeg' }), path.basename(dosya));
const r = await fetch('https://api.elevenlabs.io/v1/speech-to-text', { method: 'POST', headers: { 'xi-api-key': anahtar }, body: form });
if (!r.ok) throw new Error(`scribe ${r.status}: ${(await r.text()).slice(0, 300)}`);
const j = await r.json();
const sozler = (j.words ?? []).filter((w) => w.type === 'word').map((w) => [w.text, Math.round(w.start * 1000), Math.round(w.end * 1000)]);
const cikti = path.resolve('output/ingilizce/sarki');
fs.mkdirSync(cikti, { recursive: true });
fs.writeFileSync(path.join(cikti, `${ad}-zaman.json`), JSON.stringify(sozler));
console.log('duyulan:', j.text);
console.log('sözcük:', sozler.length, '→', path.relative(process.cwd(), path.join(cikti, `${ad}-zaman.json`)));
