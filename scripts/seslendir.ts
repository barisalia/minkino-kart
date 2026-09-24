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
import { tumCumleler, normal } from '../src/audio/cumleler';

interface Uretim {
  model: string;
  /** Duyulmayan Türkçe bağlam cümlesi (previous_text) — kısa kelimelerin İngilizceye kaymasını önler */
  baglam?: boolean;
  /** Dili zorla (language_code) — yalnızca destekleyen modellerde */
  dil?: string | null;
  ayarlar?: Record<string, number | boolean>;
}
interface Ayar extends Uretim {
  otomatik?: boolean;
  es_zaman?: number;
  bekleme_ms?: number;
  en_hizli_harf_sn?: number;
  butce_karakter?: number;
  ses_id: string;
  bicim: string;
  ayarlar: Record<string, number | boolean>;
  baglam_metni: string;
  karsilastirma?: { kelimeler: string[]; secenekler: (Uretim & { kod: string; ad: string })[] };
}
interface Manifest {
  ses_id: string | null;
  model: string | null;
  dosyalar: Record<string, string>;
  /** Her kaydın hangi ses/model/ayarla üretildiği — değişince yeniden üretilir */
  imzalar?: Record<string, string>;
}

const KOK = process.cwd();
const ayar: Ayar = JSON.parse(fs.readFileSync(path.join(KOK, 'content/seslendirme.json'), 'utf8'));
const ANAHTAR = process.env.ELEVENLABS_API_KEY;
const argv = process.argv.slice(2);
const KARSILASTIR = argv.includes('--karsilastir');
const sinirIdx = argv.indexOf('--sinir');
const SINIR = sinirIdx >= 0 ? Number(argv[sinirIdx + 1]) : Infinity;

if (!ANAHTAR) {
  console.log('ELEVENLABS_API_KEY yok — seslendirme atlandı.');
  process.exit(0);
}

async function uret(sesId: string, metin: string, hedef: string, u: Uretim = ayar) {
  const govdeVerisi = {
    text: metin,
    model_id: u.model,
    voice_settings: u.ayarlar ?? ayar.ayarlar,
    ...(u.dil ? { language_code: u.dil } : {}),
    ...(u.baglam ? { previous_text: ayar.baglam_metni } : {}),
  };
  for (let deneme = 1; deneme <= 5; deneme++) {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${sesId}?output_format=${ayar.bicim}`, {
      method: 'POST',
      headers: { 'xi-api-key': ANAHTAR!, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify(govdeVerisi),
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

const dosyaAdi = (metin: string, imza: string) => createHash('sha1').update(`${imza}|${normal(metin)}`).digest('hex').slice(0, 14) + '.mp3';

if (KARSILASTIR) {
  // Aynı kelimeleri farklı model/ayarlarla seslendirip yan yana dinlemek için (public/ses-ornek)
  const k = ayar.karsilastirma!;
  const sonuc: { kod: string; ad: string; hata?: string; dosyalar: { metin: string; dosya: string }[] }[] = [];
  for (const sec of k.secenekler) {
    const dosyalar: { metin: string; dosya: string }[] = [];
    let hata: string | undefined;
    try {
      for (const [i, m] of k.kelimeler.entries()) {
        const dosya = `${sec.kod}/${String(i + 1).padStart(2, '0')}.mp3`;
        await uret(ayar.ses_id, m, path.join(KOK, 'public/ses-ornek', dosya), sec);
        dosyalar.push({ metin: m, dosya });
      }
      console.log('✓', sec.kod, sec.ad);
    } catch (e) {
      hata = (e as Error).message;
      console.error('✗', sec.kod, hata);
    }
    sonuc.push({ kod: sec.kod, ad: sec.ad, hata, dosyalar });
  }
  fs.mkdirSync(path.join(KOK, 'public/ses-ornek'), { recursive: true });
  fs.writeFileSync(path.join(KOK, 'public/ses-ornek/liste.json'), JSON.stringify({ sesler: sonuc }, null, 1));
  process.exit(0);
}

const DUZELT = argv.includes('--duzelt');
if (ayar.otomatik === false && !argv.includes('--zorla') && !DUZELT) {
  console.log('content/seslendirme.json → otomatik: false — seslendirme bekletiliyor.');
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
// Ses/model/ayar değişince eski kayıtlar SİLİNMEZ; yenisi üretilene kadar oyunda çalmaya devam eder.
const imza = `${sesId}|${ayar.model}|${ayar.baglam ? 'baglam' : ''}|${ayar.dil ?? ''}`;
manifest.imzalar ??= {};
manifest.ses_id = sesId;
manifest.model = ayar.model;

const cumleler = tumCumleler();

if (DUZELT) {
  // Sadece sorunlu kayıtları yeniden üret: kısa (1-2 kelime, İngilizceye kayabilen) ve fazla hızlı olanlar
  const harfSay = (t: string) => [...t].filter((c) => /\p{L}/u.test(c)).length;
  const kbps = Number(ayar.bicim.split('_')[2] ?? 64);
  let silinen = 0;
  for (const c of cumleler) {
    const f = manifest.dosyalar[c];
    if (!f || !fs.existsSync(path.join(klasor, f))) continue;
    const kisa = c.split(/\s+/).length <= 2;
    const sure = (fs.statSync(path.join(klasor, f)).size * 8) / (kbps * 1000);
    const hizli = harfSay(c) >= 6 && harfSay(c) / sure > 14;
    if (kisa || hizli) {
      delete manifest.dosyalar[c];
      silinen++;
    }
  }
  console.log(`Düzeltme: ${silinen} kayıt yeniden üretilecek.`);
}
const guncelDegil = (c: string) => !manifest.dosyalar[c] || !fs.existsSync(path.join(klasor, manifest.dosyalar[c])) || manifest.imzalar![c] !== imza;
const eksik = cumleler.filter(guncelDegil).slice(0, SINIR);
const karakter = eksik.reduce((t, c) => t + c.length, 0);
console.log(`${cumleler.length} cümle, ${eksik.length} eksik (${karakter} karakter)`);

let tamam = 0;
const kaydet = () => fs.writeFileSync(manifestYolu, JSON.stringify(manifest, null, 0));
const bekle = (ms: number) => new Promise((c) => setTimeout(c, ms));
/** mp3 (sabit bit hızı) süresi → saniyedeki harf sayısı */
function hiz(metin: string, dosya: string): number {
  const kbps = Number(ayar.bicim.split('_')[2] ?? 64);
  const sure = (fs.statSync(dosya).size * 8) / (kbps * 1000);
  return [...metin].filter((c) => /\p{L}/u.test(c)).length / Math.max(0.3, sure);
}
const SINIR_HIZ = ayar.en_hizli_harf_sn ?? 15;
let yeniden = 0;
let harcanan = 0;
const BUTCE = ayar.butce_karakter ?? Infinity;

try {
  await havuz(eksik, ayar.es_zaman ?? 1, async (c) => {
    const f = dosyaAdi(c, imza);
    const hedef = path.join(klasor, f);
    if (harcanan + c.length > BUTCE) throw new Error(`Karakter bütçesi (${BUTCE}) doldu`);
    harcanan += c.length;
    await uret(sesId, c, hedef);
    // Aceleye gelmiş (fazla hızlı) kayıtları en çok 2 kez yeniden üret, en yavaşını tut
    const harf = [...c].filter((x) => /\p{L}/u.test(x)).length;
    if (harf >= 6) {
      let en = { h: hiz(c, hedef), veri: fs.readFileSync(hedef) };
      for (let d = 0; d < 2 && en.h > SINIR_HIZ; d++) {
        yeniden++;
        await bekle(ayar.bekleme_ms ?? 400);
        if (harcanan + c.length > BUTCE) break;
        harcanan += c.length;
        await uret(sesId, c, hedef);
        const h = hiz(c, hedef);
        if (h < en.h) en = { h, veri: fs.readFileSync(hedef) };
      }
      fs.writeFileSync(hedef, en.veri);
    }
    await bekle(ayar.bekleme_ms ?? 400);
    manifest.dosyalar[c] = f;
    manifest.imzalar![c] = imza;
    if (++tamam % 25 === 0) {
      kaydet();
      console.log(`… ${tamam}/${eksik.length}`);
    }
  });
} catch (e) {
  // Yarım kalan işi kaybetme: üretilenleri kaydet, sonraki çalıştırma kalanından devam eder
  kaydet();
  console.error(`Durdu (${tamam} kayıt üretildi, ${harcanan} karakter):`, (e as Error).message);
  process.exit(1);
}

// Artık kullanılmayan kayıtları temizle
const gecerli = new Set(cumleler);
for (const k of Object.keys(manifest.dosyalar)) if (!gecerli.has(k)) {
  delete manifest.dosyalar[k];
  delete manifest.imzalar![k];
}
const kullanilan = new Set(Object.values(manifest.dosyalar));
for (const f of fs.readdirSync(klasor)) if (f.endsWith('.mp3') && !kullanilan.has(f)) fs.unlinkSync(path.join(klasor, f));
kaydet();
console.log(`Bitti: ${tamam} yeni kayıt, hız nedeniyle ${yeniden} yeniden üretim, ${harcanan} karakter.`);
