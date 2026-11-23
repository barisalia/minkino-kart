// Hece Evleri · heceleri cümle içinde okutup doğrulayan üretim (18 Kasım 2026).
//
// Sorun: tek başına okutulan hece ("Zö!", "Je!", "Sı!") ses motorunda sık sık harf adına ya da başka sese kayıyordu
// ("ze", "ce", "su", "çu"); tek heceyi Scribe de güvenilir yazamıyor, yani denetim de çalışmıyordu.
// Çözüm: hece kısa bir cümlenin SONUNDA okutulur ("Şimdi söyle: zö!"). Cümle bağlamında hem doğru okunur hem Scribe
// doğru yazar. Bütün cümle Scribe'dan geçer; son söz hece değilse kayıt reddedilir ve başka cümleyle yeniden denenir.
// Geçen kayıttan, zaman damgalarıyla yalnız hece kesilir (öncesinde iki nokta duraklaması var: kesik temiz çıkar).
//
// Kullanım (PowerShell): . ./scripts/elevenlabs-ortam.ps1; node scripts/hece-evleri-cumle-ses.mjs <çıktı klasörü> [ev-z-oo ev-j-e …]
// Çıktı klasörüne <ad>.mp3 ve rapor.json yazar; assets'e kendisi kopyalamaz (geliştirme sunucusu açıkken assets'e yazmak onu düşürür).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import ffmpeg from 'ffmpeg-static';

const ANAHTAR = process.env.ELEVENLABS_API_KEY;
if (!ANAHTAR) throw new Error('ELEVENLABS_API_KEY gerekli (. ./scripts/elevenlabs-ortam.ps1).');
const API = 'https://api.elevenlabs.io/v1';
const CIKTI = process.argv[2];
if (!CIKTI) throw new Error('çıktı klasörü gerekli');
mkdirSync(CIKTI, { recursive: true });

const veri = JSON.parse(readFileSync('alfabe/src/hece-evleri-veri.json', 'utf8'));
const sesler = JSON.parse(readFileSync('content/film2/sesler.json', 'utf8').replace(/^﻿/, '')).sesler;
const kitap = JSON.parse(readFileSync('content/kitap-ses.json', 'utf8').replace(/^﻿/, ''));
let SES = sesler[kitap.kimler.ogretmen.ses];
try { SES = JSON.parse(readFileSync('content/elevenlabs-hesap.json', 'utf8')).esleme[SES] ?? SES; } catch { /* eşleme yok */ }

const BELIRTEC = { 'ç': 'cc', 'ş': 'ss', 'ı': 'ii', 'ö': 'oo', 'ü': 'uu' };
const ad = (h) => BELIRTEC[h] ?? h;
let heceler = veri.unsuzler.flatMap((u) => veri.unluler.map((v) => ({ id: `ev-${ad(u)}-${ad(v)}`, hece: u + v })));
const yalniz = process.argv.slice(3);
if (yalniz.length) heceler = heceler.filter((h) => yalniz.includes(h.id));

const buyuk = (s) => s.charAt(0).toLocaleUpperCase('tr') + s.slice(1);
// her deneme başka bir cümle (aynı cümle tutmazsa öteki genelde tutar)
const CUMLELER = [(h) => `Şimdi söyle: ${buyuk(h)}!`, (h) => `Hadi bakalım: ${buyuk(h)}!`, (h) => `Bu hece: ${h}.`, (h) => `Birlikte okuyalım: ${buyuk(h)}!`, (h) => `Dinle: ${h}.`];
// Bağlamla da tutmayan heceler için tanıdık bir kelime: hece o kelimenin başı olarak okunur ("Cuma kelimesinin başı: cu!").
// Ses motoru "cu"yu İngilizce gibi "ku" okuyordu; kelime önden gelince Türkçe "cu" okunuyor.
const KELIME = { cu: 'cuma', ca: 'cami', ce: 'ceviz', ci: 'civciv', co: 'coşku', cö: 'cömert', cü: 'cüce', cı: 'cıvıl', yü: 'yüzük', yu: 'yumurta', yö: 'yön', yı: 'yıldız', jö: 'jöle', je: 'jeton', ju: 'judo', ja: 'jaguar', ji: 'jilet', zö: 'zöbik', zı: 'zıpla', sı: 'sıcak',
  bı: 'bıyık', gı: 'gıdı', vı: 'vızıltı', to: 'top', te: 'tebeşir', pe: 'peynir', ja: 'jandarma', jo: 'jokey', jı: 'jıklet' };
// Türkçe harf adıyla aynı okunan heceler ("te" = T, "pe" = P): Scribe tek harf yazarsa doğru okunmuştur
const HARF_ADI = new Set(['be', 'ce', 'de', 'fe', 'ge', 'he', 'je', 'ke', 'le', 'me', 'ne', 'pe', 're', 'se', 'te', 've', 'ye', 'ze']);
// "jı": ı çok kısa okunur, Scribe yalnız "j" yazar; "j" yazması sesin c (cı) değil j olduğunu gösterir (c ise "c" / "cı" yazar)
const ayniHece = (soz, hece) => soz === hece || (HARF_ADI.has(hece) && soz === hece[0]) || (hece === 'jı' && soz === 'j');
const kelimeCumlesi = (h) => KELIME[h] ? [(x) => `${buyuk(KELIME[x])}! ${buyuk(KELIME[x])} kelimesinin başı: ${buyuk(x)}!`, (x) => `${buyuk(KELIME[x])} der gibi: ${x}.`] : [];
const sade = (s) => s.toLocaleLowerCase('tr').replace(/[^a-zçğıöşü ]/g, ' ').trim();
const bekle = (ms) => new Promise((r) => setTimeout(r, ms));

async function inatla(f) {
  for (let d = 1; ; d++) {
    try { return await f(); } catch (e) { if (d >= 4) throw e; await bekle(1500 * d * d); }
  }
}
async function seslendir(metin) {
  return inatla(async () => {
    const r = await fetch(`${API}/text-to-speech/${SES}/with-timestamps?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'xi-api-key': ANAHTAR, 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ text: metin, model_id: 'eleven_v4', language_code: 'tr', voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.4, use_speaker_boost: true } }),
    });
    if (!r.ok) throw new Error('TTS ' + r.status + ' ' + (await r.text()).slice(0, 150));
    const j = await r.json();
    return { ses: Buffer.from(j.audio_base64, 'base64'), hiza: j.alignment };
  });
}
async function yaziyaDok(b, model = 'scribe_v1') {
  return inatla(async () => {
    const fd = new FormData();
    fd.append('model_id', model);
    fd.append('language_code', 'tr');
    fd.append('tag_audio_events', 'false');
    fd.append('file', new Blob([b], { type: 'audio/mpeg' }), 'k.mp3');
    const r = await fetch(`${API}/speech-to-text`, { method: 'POST', headers: { 'xi-api-key': ANAHTAR }, body: fd });
    if (!r.ok) throw new Error('Scribe ' + r.status);
    return (await r.json()).text ?? '';
  });
}
function kes(girdi, cikti, bas, son) {
  const c = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', girdi, '-ss', bas.toFixed(3), '-to', son.toFixed(3),
    '-af', 'afade=t=in:d=0.015,areverse,silenceremove=start_periods=1:start_threshold=-50dB,afade=t=in:d=0.06,areverse',
    '-ar', '44100', '-ac', '1', '-b:a', '128k', cikti], { encoding: 'utf8' });
  if (c.status !== 0) throw new Error('ffmpeg: ' + c.stderr);
}
function sure(dosya) {
  const c = spawnSync(ffmpeg, ['-hide_banner', '-i', dosya, '-f', 'null', '-'], { encoding: 'utf8' });
  const t = [...(c.stderr ?? '').matchAll(/time=(\d+):(\d+):([\d.]+)/g)].pop();
  return t ? +t[1] * 3600 + +t[2] * 60 + +t[3] : NaN;
}

const rapor = {};
for (const { id, hece } of heceler) {
  let sonuc = null;
  const denemeler = [];
  const cumleler = [...CUMLELER, ...kelimeCumlesi(hece)];
  for (let i = 0; i < cumleler.length && !sonuc; i++) {
    const metin = cumleler[i](hece);
    const { ses, hiza } = await seslendir(metin);
    // iki yazıya dökücüden biri son sözü hece olarak yazarsa geçer (tek bir modelin tek hecede yanılması kaydı düşürmesin)
    let duyulan = await yaziyaDok(ses, 'scribe_v1');
    const sonSoz = (d) => { const w = sade(d).split(/\s+/).filter(Boolean); return w[w.length - 1] ?? ''; };
    if (!ayniHece(sonSoz(duyulan), hece)) { const d2 = await yaziyaDok(ses, 'scribe_v2'); if (ayniHece(sonSoz(d2), hece)) duyulan = d2 + ' (v2)'; else duyulan += ' | v2: ' + d2; }
    denemeler.push({ metin, duyulan });
    if (!ayniHece(sonSoz(duyulan.replace(' (v2)', '')), hece)) continue;
    // hecenin zaman aralığı: metindeki son geçişi
    const bas = metin.toLocaleLowerCase('tr').lastIndexOf(hece);
    const t0 = hiza.character_start_times_seconds[bas];
    const t1 = hiza.character_end_times_seconds[bas + hece.length - 1];
    const gecici = path.join(CIKTI, `${id}.cumle.mp3`);
    writeFileSync(gecici, ses);
    const cikti = path.join(CIKTI, `${id}.mp3`);
    kes(gecici, cikti, Math.max(0, t0 - 0.06), t1 + 0.4);
    const s = sure(cikti);
    if (!(s >= 0.2 && s <= 1.4)) { denemeler[denemeler.length - 1].red = `süre ${s}`; continue; }
    sonuc = { metin, duyulan, sure: +s.toFixed(2) };
  }
  rapor[id] = { hece, tamam: !!sonuc, ...(sonuc ?? {}), denemeler };
  console.log(`${sonuc ? 'tamam ' : 'OLMADI'} ${id.padEnd(10)} ${hece.padEnd(3)} ${sonuc ? `"${sonuc.metin}" → ${sonuc.duyulan} (${sonuc.sure} sn)` : denemeler.map((d) => d.duyulan).join(' | ')}`);
  writeFileSync(path.join(CIKTI, 'rapor.json'), JSON.stringify(rapor, null, 2));
}
const olmayan = Object.entries(rapor).filter(([, r]) => !r.tamam).map(([k]) => k);
console.log(`\nBitti: ${Object.keys(rapor).length} hece, ${Object.keys(rapor).length - olmayan.length} doğrulandı` + (olmayan.length ? `, olmayan: ${olmayan.join(' ')}` : ''));
