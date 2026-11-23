/**
 * İngilizceye Merhaba · Polly ses seçmesi. Barış (17 Kasım): "Polly'nin sesi gelişebilir". Aynı altı sözü birkaç aday
 * sesle üretir ve yan yana dinleme sayfası yazar: ekip/ingilizce/polly-secimi.html. Toplu üretim değildir.
 * Kullanım: . ./scripts/elevenlabs-ortam.ps1; npx vite-node scripts/ingilizce-polly-secimi.ts
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ffmpeg: string = createRequire(import.meta.url)('ffmpeg-static');
const API = 'https://api.elevenlabs.io/v1';
const HIZ = 44100;
const CIKTI = path.join(KOK, 'ekip/ingilizce/polly-secimi');

/** Adaylar: şimdiki ses (aynı ve daha neşeli ayarla) ve hesaptaki dört başka genç / çizgi film sesi */
const ADAYLAR: { kod: string; ad: string; ses: string; etiket: string; stil: number; kararlilik: number }[] = [
  { kod: 'a', ad: 'Şimdiki ses (Jessica)', ses: 'cgSgspJ2msm6clMCkdW9', etiket: '', stil: 0.15, kararlilik: 0.6 },
  { kod: 'b', ad: 'Şimdiki ses, daha neşeli', ses: 'cgSgspJ2msm6clMCkdW9', etiket: '[cheerful, playful] ', stil: 0.45, kararlilik: 0.45 },
  { kod: 'c', ad: 'Çizgi film sesi (Minnie)', ses: 'eppqEXVumQ3CfdndcIBd', etiket: '', stil: 0.3, kararlilik: 0.5 },
  { kod: 'd', ad: 'Çok genç, neşeli (Suhana)', ses: '9vP6R7VVxNwGIGLnpl17', etiket: '', stil: 0.3, kararlilik: 0.5 },
  { kod: 'e', ad: 'Ruby Roo', ses: 'b8gbDO0ybjX1VA89pBdX', etiket: '', stil: 0.3, kararlilik: 0.5 },
  { kod: 'f', ad: 'Canlı, hareketli (Laura)', ses: 'FGY2WhTYpPnrIDTdsKH5', etiket: '', stil: 0.3, kararlilik: 0.5 },
];
const SOZLER: [dosya: string, metin: string, yavas?: true][] = [
  ['hello', 'Hello!'],
  ['sheep', 'Sheep.'],
  ['sheep-yavas', 'Sheep.', true],
  ['its-a-sheep', "It's a sheep."],
  ['where-duck', 'Where is the duck?'],
  ['great-job', 'Great job!'],
];

function ff(args: string[], girdi: Buffer): Buffer {
  const r = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', ...args], { input: girdi, maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(`ffmpeg: ${r.stderr?.toString().slice(0, 200)}`);
  return r.stdout;
}
/** Baş ve sondaki sessizliği al, düzeyi eşitle (adaylar aynı yükseklikte dinlensin) */
function isle(mp3: Buffer): { mp3: Buffer; ms: number } {
  const ham = ff(['-i', 'pipe:0', '-ac', '1', '-ar', String(HIZ), '-f', 'f32le', 'pipe:1'], mp3);
  const x = new Float32Array(ham.buffer, ham.byteOffset, Math.floor(ham.byteLength / 4));
  const kare = Math.round(HIZ * 0.005), n = Math.floor(x.length / kare);
  const rms: number[] = [];
  let tepe = 0;
  for (let i = 0; i < n; i++) { let t = 0; for (let j = 0; j < kare; j++) { const v = x[i * kare + j]; t += v * v; tepe = Math.max(tepe, Math.abs(v)); } rms.push(Math.sqrt(t / kare)); }
  const esik = Math.max(0.0012, Math.max(...rms) * 0.015);
  const ilk = rms.findIndex((v) => v > esik);
  let son = n - 1;
  while (son > ilk && rms[son] <= esik) son--;
  const bas = Math.max(0, ilk * kare - Math.round(HIZ * 0.045)), bit = Math.min(x.length, (son + 1) * kare + Math.round(HIZ * 0.11));
  const kesit = x.slice(bas, bit);
  let t = 0;
  for (const v of kesit) t += v * v;
  let kazanc = Math.pow(10, -19 / 20) / Math.max(1e-6, Math.sqrt(t / kesit.length));
  if (tepe * kazanc > 0.84) kazanc = 0.84 / tepe;
  for (let i = 0; i < kesit.length; i++) kesit[i] *= kazanc;
  const cikti = ff(['-f', 'f32le', '-ar', String(HIZ), '-ac', '1', '-i', 'pipe:0', '-c:a', 'libmp3lame', '-b:a', '96k', '-f', 'mp3', 'pipe:1'], Buffer.from(kesit.buffer, kesit.byteOffset, kesit.byteLength));
  return { mp3: cikti, ms: Math.round(((son - ilk + 1) * kare / HIZ) * 1000) };
}

async function uret(a: (typeof ADAYLAR)[number], metin: string, yavas: boolean): Promise<Buffer> {
  const r = await fetch(`${API}/text-to-speech/${a.ses}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY!, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: (yavas ? '[slowly] ' : a.etiket) + metin, model_id: 'eleven_v4', language_code: 'en', voice_settings: { stability: yavas ? 0.6 : a.kararlilik, similarity_boost: 0.8, style: yavas ? 0.15 : a.stil, use_speaker_boost: true } }),
  });
  if (!r.ok) throw new Error(`TTS ${r.status}: ${(await r.text()).slice(0, 160)}`);
  return Buffer.from(await r.arrayBuffer());
}
async function yaziyaCevir(mp3: Buffer): Promise<string> {
  const form = new FormData();
  form.append('model_id', 'scribe_v2'); form.append('language_code', 'en');
  form.append('file', new Blob([new Uint8Array(mp3)], { type: 'audio/mpeg' }), 'k.mp3');
  const r = await fetch(`${API}/speech-to-text`, { method: 'POST', headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY! }, body: form });
  return r.ok ? (((await r.json()) as { text?: string }).text ?? '').trim() : `STT ${r.status}`;
}
const sade = (m: string) => m.toLowerCase().replace(/[^a-z' ]/g, '').trim();

if (!process.env.ELEVENLABS_API_KEY) throw new Error('ELEVENLABS_API_KEY gerekli (. ./scripts/elevenlabs-ortam.ps1).');
fs.mkdirSync(CIKTI, { recursive: true });
const sonuc: Record<string, Record<string, { ms: number; uyari: string }>> = {};
let harf = 0;
for (const a of ADAYLAR) {
  sonuc[a.kod] = {};
  for (const [dosya, metin, yavas] of SOZLER) {
    const hedef = path.join(CIKTI, `${a.kod}-${dosya}.mp3`);
    if (fs.existsSync(hedef)) { sonuc[a.kod][dosya] = { ms: 0, uyari: '' }; continue; }
    try {
      const ham = await uret(a, metin, !!yavas);
      harf += metin.length;
      const yazi = await yaziyaCevir(ham);
      const { mp3, ms } = isle(ham);
      fs.writeFileSync(hedef, mp3);
      const uyari = sade(yazi) === sade(metin) ? '' : `"${yazi}" diye duyuldu`;
      sonuc[a.kod][dosya] = { ms, uyari };
      console.log(`${a.kod} ${dosya.padEnd(12)} ${String(ms).padStart(5)} ms ${uyari}`);
    } catch (e) { sonuc[a.kod][dosya] = { ms: 0, uyari: `üretilemedi: ${(e as Error).message}` }; console.log(`${a.kod} ${dosya} HATA ${(e as Error).message}`); }
  }
}
const hucre = (a: (typeof ADAYLAR)[number], dosya: string) => {
  const s = sonuc[a.kod][dosya];
  return `<td${s?.uyari ? ' class="supheli"' : ''}><audio controls preload="none" src="polly-secimi/${a.kod}-${dosya}.mp3"></audio>${s?.uyari ? `<small>${s.uyari}</small>` : ''}</td>`;
};
const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Polly ses seçimi</title>
<style>body{font:16px/1.45 "Nunito","Trebuchet MS",system-ui,sans-serif;margin:24px auto;max-width:1180px;padding:0 16px;color:#2a2c24;background:#fff6e6}
h1{font-size:26px;margin:0 0 4px}p{margin:4px 0 14px;color:#5b6257}table{border-collapse:collapse;width:100%;background:#fff8e9;border:2px solid #2a2c24;border-radius:14px;overflow:hidden}
th,td{padding:8px 8px;border-bottom:1px solid #e3d8c2;text-align:left;vertical-align:middle}th{background:#ffe9a6;font-size:14px}th b{font-size:20px;display:block}
audio{height:34px;width:150px;display:block}td:first-child{font-weight:800;font-size:17px;white-space:nowrap}small{color:#9a3b2c;font-size:12px}.supheli{background:#fff0d0}</style></head><body>
<h1>Polly'nin sesi: hangisi olsun?</h1>
<p>Aynı altı söz, altı aday. Sütunun harfini söylemen yeter (örneğin "C olsun"). A şimdi oyundaki ses. Seçtiğin sesle bütün İngilizce kayıtlar yeniden üretilecek.</p>
<table><tr><th>Söz</th>${ADAYLAR.map((a) => `<th><b>${a.kod.toUpperCase()}</b>${a.ad}</th>`).join('')}</tr>
${SOZLER.map(([dosya, metin, yavas]) => `<tr><td lang="en">${metin}${yavas ? ' <small>(yavaş)</small>' : ''}</td>${ADAYLAR.map((a) => hucre(a, dosya)).join('')}</tr>`).join('\n')}
</table></body></html>`;
fs.writeFileSync(path.join(KOK, 'ekip/ingilizce/polly-secimi.html'), html);
console.log(`\nyazıldı: ekip/ingilizce/polly-secimi.html · ${harf} harf harcandı`);
