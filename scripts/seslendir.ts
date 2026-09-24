/**
 * ElevenLabs ile oyundaki tüm cümleleri seslendirir → public/ses/*.mp3 + public/ses/manifest.json
 *
 *   ELEVENLABS_API_KEY=... npx vite-node scripts/seslendir.ts            # eksik cümleleri üret
 *   ELEVENLABS_API_KEY=... npx vite-node scripts/seslendir.ts -- --ornek # aday seslerle deneme kayıtları (public/ses-ornek)
 *
 * Ses kimliği content/seslendirme.json → ses_id (veya ELEVENLABS_VOICE_ID). Ses değişirse hepsi yeniden üretilir.
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import metinler from '../content/metinler.json';
import { tumCumleler, normal } from '../src/audio/cumleler';
import { sorular } from '../src/engine/katalog';

interface Ayar {
  ses_id: string;
  model: string;
  bicim: string;
  ayarlar: Record<string, number | boolean>;
  aday_sesler: { ad: string; ses_id: string }[];
}
interface Manifest {
  ses_id: string | null;
  model: string | null;
  dosyalar: Record<string, string>;
}

const KOK = process.cwd();
const ayar: Ayar = JSON.parse(fs.readFileSync(path.join(KOK, 'content/seslendirme.json'), 'utf8'));
const ANAHTAR = process.env.ELEVENLABS_API_KEY;
const argv = process.argv.slice(2);
const ORNEK = argv.includes('--ornek');
const sinirIdx = argv.indexOf('--sinir');
const SINIR = sinirIdx >= 0 ? Number(argv[sinirIdx + 1]) : Infinity;

if (!ANAHTAR) {
  console.log('ELEVENLABS_API_KEY yok — seslendirme atlandı.');
  process.exit(0);
}

async function uret(sesId: string, metin: string, hedef: string) {
  const dilZorla = /flash|turbo|v3/.test(ayar.model);
  for (let deneme = 1; deneme <= 5; deneme++) {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${sesId}?output_format=${ayar.bicim}`, {
      method: 'POST',
      headers: { 'xi-api-key': ANAHTAR!, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({ text: metin, model_id: ayar.model, voice_settings: ayar.ayarlar, ...(dilZorla ? { language_code: 'tr' } : {}) }),
    });
    if (r.ok) {
      fs.mkdirSync(path.dirname(hedef), { recursive: true });
      fs.writeFileSync(hedef, Buffer.from(await r.arrayBuffer()));
      return;
    }
    const govde = await r.text();
    if (r.status === 429 || r.status >= 500) {
      await new Promise((c) => setTimeout(c, 1500 * deneme * deneme));
      continue;
    }
    throw new Error(`ElevenLabs ${r.status}: ${govde.slice(0, 300)}`);
  }
  throw new Error('ElevenLabs: çok fazla yeniden deneme');
}

async function havuz<T>(isler: T[], esZaman: number, fn: (x: T, i: number) => Promise<void>) {
  let i = 0;
  await Promise.all(
    Array.from({ length: esZaman }, async () => {
      while (i < isler.length) {
        const n = i++;
        await fn(isler[n], n);
      }
    }),
  );
}

const dosyaAdi = (metin: string) => createHash('sha1').update(normal(metin)).digest('hex').slice(0, 14) + '.mp3';

if (ORNEK) {
  // Aday sesleri karşılaştırmak için kısa, temsil edici cümleler
  const ornekler = [
    metinler.acilis,
    metinler.yas_sor,
    sorular(3, 'hayvanlar')[0].soru_ses!,
    'Harika! Kedi! Miyav miyav!',
    sorular(4, 'harfler')[0].soru_ses!,
    sorular(6, 'sayilar').find((s) => s.islem)?.soru_ses ?? 'Üç elma ve iki elma. Hepsi kaç elma?',
    'Hımm, bir daha bakalım. Parlayan karta bir bak!',
    'Harika oynadın! Üç yıldız kazandın! Yeni kartların albüme yapıştı!',
  ];
  const adaylar = ayar.aday_sesler.length ? ayar.aday_sesler : ayar.ses_id ? [{ ad: 'secili', ses_id: ayar.ses_id }] : [];
  const liste: { ad: string; ses_id: string; dosyalar: { metin: string; dosya: string }[] }[] = [];
  for (const a of adaylar) {
    const dosyalar: { metin: string; dosya: string }[] = [];
    for (const [i, m] of ornekler.entries()) {
      const dosya = `${a.ses_id}/${String(i + 1).padStart(2, '0')}.mp3`;
      await uret(a.ses_id, m, path.join(KOK, 'public/ses-ornek', dosya));
      dosyalar.push({ metin: m, dosya });
      console.log('✓', a.ad, i + 1);
    }
    liste.push({ ...a, dosyalar });
  }
  fs.writeFileSync(path.join(KOK, 'public/ses-ornek/liste.json'), JSON.stringify({ model: ayar.model, sesler: liste }, null, 1));
  process.exit(0);
}

const sesId = process.env.ELEVENLABS_VOICE_ID || ayar.ses_id;
if (!sesId) {
  console.log('content/seslendirme.json içinde ses_id boş — seslendirme atlandı.');
  process.exit(0);
}

const klasor = path.join(KOK, 'public/ses');
const manifestYolu = path.join(klasor, 'manifest.json');
let manifest: Manifest = fs.existsSync(manifestYolu) ? JSON.parse(fs.readFileSync(manifestYolu, 'utf8')) : { ses_id: null, model: null, dosyalar: {} };
if (manifest.ses_id !== sesId || manifest.model !== ayar.model) {
  console.log('Ses veya model değişti — tüm kayıtlar yeniden üretilecek.');
  for (const f of fs.readdirSync(klasor)) if (f.endsWith('.mp3')) fs.unlinkSync(path.join(klasor, f));
  manifest = { ses_id: sesId, model: ayar.model, dosyalar: {} };
}

const cumleler = tumCumleler();
const eksik = cumleler.filter((c) => !manifest.dosyalar[c] || !fs.existsSync(path.join(klasor, manifest.dosyalar[c]))).slice(0, SINIR);
const karakter = eksik.reduce((t, c) => t + c.length, 0);
console.log(`${cumleler.length} cümle, ${eksik.length} eksik (${karakter} karakter)`);

let tamam = 0;
const kaydet = () => fs.writeFileSync(manifestYolu, JSON.stringify(manifest, null, 0));
await havuz(eksik, 3, async (c) => {
  const f = dosyaAdi(c);
  await uret(sesId, c, path.join(klasor, f));
  manifest.dosyalar[c] = f;
  if (++tamam % 25 === 0) {
    kaydet();
    console.log(`… ${tamam}/${eksik.length}`);
  }
});

// Artık kullanılmayan kayıtları temizle
const gecerli = new Set(cumleler);
for (const k of Object.keys(manifest.dosyalar)) if (!gecerli.has(k)) delete manifest.dosyalar[k];
const kullanilan = new Set(Object.values(manifest.dosyalar));
for (const f of fs.readdirSync(klasor)) if (f.endsWith('.mp3') && !kullanilan.has(f)) fs.unlinkSync(path.join(klasor, f));
kaydet();
console.log(`Bitti: ${tamam} yeni kayıt.`);
