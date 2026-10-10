#!/usr/bin/env node
/**
 * Kino ve Ailesi repliklerini ElevenLabs (eleven_v4) ile seslendirir: bölüm dosyasındaki etiketli metin
 * ("[yawns] Günaydın, Lokum!"; yoksa altyazı metni) karakterin sesiyle okunur ve ekip/ses/seri2-gelen/<kimlik>.mp3
 * olarak yazılır. Var olan dosya atlanır (yeniden üretmek için --zorla). Karakter → ses eşlemesi ve ayarlar:
 * content/film2/sesler.json. Anahtar yalnız ortam değişkeninden (ELEVENLABS_API_KEY); hiçbir yere yazılmaz.
 *
 * KREDİ HARCAR. Önce kuru deneme: node scripts/film/seri2-seslendir.mjs --bolum bolum-01 --kuru
 *   [--sahne s4] (yalnız o sahne; virgülle birden çok) [--kim anne] [--zorla] [--en-cok 40]
 */
import fs from 'node:fs';
import path from 'node:path';
import { KOK, replikler, SES_KLASORU, sesDosyasi } from './seri2-ortak.mjs';

const arg = (ad, varsayilan) => {
  const i = process.argv.indexOf(`--${ad}`);
  return i >= 0 ? process.argv[i + 1] : varsayilan;
};
const var_ = (ad) => process.argv.includes(`--${ad}`);
const bolum = arg('bolum', 'bolum-01');
const sahneler = arg('sahne')?.split(',');
const kimler = arg('kim')?.split(',');
const kuru = var_('kuru');
const zorla = var_('zorla');
const enCok = Number(arg('en-cok', '200'));

const ayar = JSON.parse(fs.readFileSync(path.join(KOK, 'content/film2/sesler.json'), 'utf8'));
const model = ayar.model ?? 'eleven_v4';
const bicim = ayar.bicim ?? 'mp3_44100_128';
const ses = ayar.ayarlar ?? {};
const voiceSettings = {
  stability: ses.stability ?? 0.4,
  similarity_boost: ses.similarity_boost ?? 0.75,
  style: ses.style ?? 0.25,
  use_speaker_boost: ses.use_speaker_boost ?? true,
};

const liste = replikler(bolum).filter((r) => (!sahneler || sahneler.includes(r.sahne)) && (!kimler || kimler.includes(r.kim)));
const yapilacak = [], atla = [], sesYok = [];
for (const r of liste) {
  if (!zorla && fs.existsSync(sesDosyasi(r.kimlik))) atla.push(r);
  else if (!ayar.sesler?.[r.kim]) sesYok.push(r);
  else yapilacak.push(r);
}
const harf = yapilacak.reduce((t, r) => t + (r.etiket ?? r.metin).length, 0);
console.log(`${bolum}${sahneler ? ` (${sahneler.join(',')})` : ''}: ${liste.length} replik · ${atla.length} hazır · ${yapilacak.length} üretilecek (~${harf} harf) · model ${model}`);
for (const r of sesYok) console.log(`  ses eşlemesi yok (content/film2/sesler.json → sesler.${r.kim}): ${r.kimlik}`);
if (yapilacak.length > enCok) {
  console.error(`${yapilacak.length} replik --en-cok ${enCok} sınırını aşıyor; sınırı açıkça yükseltin.`);
  process.exit(1);
}
if (kuru) {
  for (const r of yapilacak) console.log(`  [kuru] ${r.kimlik}.mp3 ← ${r.kim} (${ayar.sesler[r.kim]}): ${r.etiket ?? r.metin}`);
  process.exit(0);
}
const anahtar = process.env.ELEVENLABS_API_KEY;
if (!anahtar) {
  console.error('ELEVENLABS_API_KEY ortam değişkeni yok.');
  process.exit(1);
}
fs.mkdirSync(SES_KLASORU, { recursive: true });
let tamam = 0;
for (const r of yapilacak) {
  const metin = r.etiket ?? r.metin;
  const adres = `https://api.elevenlabs.io/v1/text-to-speech/${ayar.sesler[r.kim]}?output_format=${bicim}`;
  let yanit;
  for (let deneme = 0; deneme < 3; deneme++) {
    yanit = await fetch(adres, {
      method: 'POST',
      headers: { 'xi-api-key': anahtar, 'content-type': 'application/json', accept: 'audio/mpeg' },
      body: JSON.stringify({ text: metin, model_id: model, language_code: ayar.dil ?? 'tr', voice_settings: voiceSettings }),
    });
    if (yanit.ok || (yanit.status !== 429 && yanit.status < 500)) break;
    await new Promise((c) => setTimeout(c, 2000 * (deneme + 1)));
  }
  if (!yanit.ok) {
    // yanıt gövdesi anahtarı içermez; yalnız hata metni yazılır
    console.error(`  HATA ${r.kimlik}: ${yanit.status} ${(await yanit.text()).slice(0, 300)}`);
    continue;
  }
  const veri = Buffer.from(await yanit.arrayBuffer());
  fs.writeFileSync(sesDosyasi(r.kimlik), veri);
  tamam++;
  console.log(`  ${r.kimlik}.mp3 (${(veri.length / 1024).toFixed(0)} KB) ← ${metin}`);
}
console.log(`${tamam}/${yapilacak.length} ses yazıldı: ${SES_KLASORU}`);
