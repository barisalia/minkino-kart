#!/usr/bin/env node
/**
 * Blender sahnesi için ön hazırlık (kredi harcamaz, Blender'sız):
 *  1) Sahne JSON'undaki "esya_kaynak" listesi düz renk zeminliyse (beyaz, nane yeşili…) zemini şeffaflaştırır → <is>/hazir/<ad>.png
 *     ("kirp": false → resim boyu korunur, koordinatlar kaynakla aynı kalır). "plakalar": mekân resminden çizili nesneyi
 *     silinmiş temiz plaka, "on_plan": önden geçen figür katmanı (plaka.mjs).
 *  2) Canlılık hareketlerinin küçük çizimlerini (kuş 2 kare, buhar, Zzz) düz 2D SVG'den basar → <is>/hazir/
 *  3) Her repliği (<is>/ses/<kimlik>.mp3) çözer: süre + kare başına ses genliği (ağız için) → <is>/hazir/ses.json
 *   node scripts/film/blender/hazirla.mjs --sahne content/film2/blender/b00-deneme.json --is <klasor>
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { zeminSil, temizPlaka, onPlan } from './plaka.mjs';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const require = createRequire(import.meta.url);
const ANA = path.resolve(KOK, '..', '..', '..'); // worktree içindeysek ana çalışma kopyası (node_modules, ekip/gemini/yeni)
const bul = (...adaylar) => adaylar.find((a) => fs.existsSync(a));
const modul = (ad) => { try { return require(ad); } catch { return require(path.join(ANA, 'node_modules', ad)); } };
const sharp = modul('sharp');
export const FFMPEG = bul(path.join(KOK, 'node_modules/ffmpeg-static/ffmpeg.exe'), path.join(ANA, 'node_modules/ffmpeg-static/ffmpeg.exe')) ?? 'ffmpeg';

const arg = (ad, v) => { const i = process.argv.indexOf(`--${ad}`); return i >= 0 ? process.argv[i + 1] : v; };
const sahneYol = path.resolve(KOK, arg('sahne'));
const sahne = JSON.parse(fs.readFileSync(sahneYol, 'utf8'));
const is = path.resolve(arg('is'));
const hazir = path.join(is, 'hazir');
fs.mkdirSync(hazir, { recursive: true });
const fps = sahne.fps ?? 30;

/** Depoda ya da ana kopyada (Gemini çıktıları depoya girmez) dosyayı bulur. */
export const kaynak = (yol) => bul(path.join(KOK, yol), path.join(ANA, yol));

const CIZGI = '#401312';
const svgler = {
  'kus-1': `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="200" viewBox="0 0 120 100">
    <path d="M30 62 Q20 60 12 66 Q22 70 32 68Z" fill="#8a5a3c" stroke="${CIZGI}" stroke-width="3" stroke-linejoin="round"/>
    <ellipse cx="58" cy="62" rx="28" ry="20" fill="#b07a52" stroke="${CIZGI}" stroke-width="3.5"/>
    <ellipse cx="62" cy="68" rx="16" ry="10" fill="#f0d9b5"/>
    <circle cx="84" cy="44" r="15" fill="#b07a52" stroke="${CIZGI}" stroke-width="3.5"/>
    <path d="M97 42 L108 46 L97 50Z" fill="#f2a63b" stroke="${CIZGI}" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="88" cy="41" r="3.2" fill="${CIZGI}"/>
    <path d="M44 56 Q58 40 72 56 Q58 64 44 56Z" fill="#8a5a3c" stroke="${CIZGI}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M54 81 L52 92 M64 81 L66 92" stroke="${CIZGI}" stroke-width="3" stroke-linecap="round"/></svg>`,
  'kus-2': `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="200" viewBox="0 0 120 100">
    <path d="M30 62 Q20 60 12 66 Q22 70 32 68Z" fill="#8a5a3c" stroke="${CIZGI}" stroke-width="3" stroke-linejoin="round"/>
    <ellipse cx="58" cy="62" rx="28" ry="20" fill="#b07a52" stroke="${CIZGI}" stroke-width="3.5"/>
    <ellipse cx="62" cy="68" rx="16" ry="10" fill="#f0d9b5"/>
    <circle cx="84" cy="44" r="15" fill="#b07a52" stroke="${CIZGI}" stroke-width="3.5"/>
    <path d="M97 42 L108 46 L97 50Z" fill="#f2a63b" stroke="${CIZGI}" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="88" cy="41" r="3.2" fill="${CIZGI}"/>
    <path d="M46 56 Q40 22 66 18 Q66 40 70 56Z" fill="#8a5a3c" stroke="${CIZGI}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M54 81 L52 92 M64 81 L66 92" stroke="${CIZGI}" stroke-width="3" stroke-linecap="round"/></svg>`,
  buhar: `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><defs><radialGradient id="g">
    <stop offset="0" stop-color="#fff" stop-opacity="0.85"/><stop offset="0.55" stop-color="#fff" stop-opacity="0.45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
    <circle cx="128" cy="128" r="126" fill="url(#g)"/></svg>`,
  zzz: `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 80 80">
    <path d="M18 22 H58 L20 62 H62" fill="none" stroke="#ffffff" stroke-width="14" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M18 22 H58 L20 62 H62" fill="none" stroke="#5a7bbf" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/></svg>`,
  cay: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="256"><rect x="9" y="0" width="14" height="256" rx="7" fill="#c8551f" opacity="0.92"/>
    <rect x="12" y="0" width="4" height="256" rx="2" fill="#f0a060" opacity="0.8"/></svg>`,
  // yer gölgesi: yumuşak kenarlı koyu elips (nesnenin altında)
  golge: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="128"><defs><radialGradient id="g">
    <stop offset="0" stop-color="#2c3a1c" stop-opacity="0.34"/><stop offset="0.7" stop-color="#2c3a1c" stop-opacity="0.26"/><stop offset="1" stop-color="#2c3a1c" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="256" cy="64" rx="254" ry="62" fill="url(#g)"/></svg>`,
  // kapalı göz kapağı (inek): ten rengi elips + aşağı kıvrık kirpik çizgisi
  kapak: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="130" viewBox="0 0 100 130">
    <ellipse cx="50" cy="65" rx="47" ry="63" fill="#fbefe1"/>
    <path d="M12 70 Q50 100 88 70" fill="none" stroke="#3b2416" stroke-width="10" stroke-linecap="round"/></svg>`,
  // dökülen süt akışı (yukarıdan aşağı)
  'sut-akis': `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="256"><rect x="6" y="0" width="28" height="256" rx="14" fill="#cfd8e2"/>
    <rect x="9" y="0" width="22" height="256" rx="11" fill="#ffffff"/><rect x="13" y="0" width="5" height="256" rx="2.5" fill="#eef3f8"/></svg>`,
  // toz bulutu (kamyon tekerleği / egzoz)
  toz: `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><defs><radialGradient id="g">
    <stop offset="0" stop-color="#efe0c4" stop-opacity="0.95"/><stop offset="0.6" stop-color="#e6d3b0" stop-opacity="0.6"/><stop offset="1" stop-color="#e6d3b0" stop-opacity="0"/></radialGradient></defs>
    <circle cx="128" cy="128" r="126" fill="url(#g)"/></svg>`,
};

for (const [ad, svg] of Object.entries(svgler)) await sharp(Buffer.from(svg)).png().toFile(path.join(hazir, `${ad}.png`));

for (const e of sahne.esya_kaynak ?? []) {
  const giris = kaynak(e.kaynak);
  if (!giris) { console.error('esya kaynağı yok:', e.kaynak); continue; }
  const cikis = path.join(hazir, `${e.ad}.png`);
  if (!fs.existsSync(cikis)) await zeminSil(giris, cikis, { kirp: e.kirp });
}

// temiz plaka (çizili nesnesi silinmiş mekân) ve ön plan katmanı; --plaka ile yeniden üretilir
for (const p of sahne.plakalar ?? []) {
  const cikis = path.join(hazir, `${p.ad}.png`);
  if (fs.existsSync(cikis) && !process.argv.includes('--plaka')) continue;
  await temizPlaka(kaynak(p.resim), cikis, p.bolgeler, p.yasak ?? []);
  console.log('plaka', p.ad);
}
for (const o of sahne.on_plan ?? []) {
  const cikis = path.join(hazir, `${o.ad}.png`);
  if (fs.existsSync(cikis) && !process.argv.includes('--plaka')) continue;
  await onPlan(kaynak(o.resim), cikis, o);
  console.log('ön plan', o.ad);
}

const sesler = {};
for (const r of sahne.replikler ?? []) {
  const mp3 = path.join(is, 'ses', `${r.kimlik}.mp3`);
  if (!fs.existsSync(mp3)) { console.error('ses yok:', r.kimlik); continue; }
  const ham = execFileSync(FFMPEG, ['-v', 'error', '-i', mp3, '-ac', '1', '-ar', '24000', '-f', 'f32le', '-'], { maxBuffer: 1 << 28 });
  const s = new Float32Array(ham.buffer, ham.byteOffset, ham.byteLength / 4);
  const adim = 24000 / fps;
  const zarf = [];
  for (let f = 0; f * adim < s.length; f++) {
    let t = 0, n = 0;
    for (let i = Math.floor(f * adim); i < Math.min(s.length, (f + 1) * adim); i++) { t += s[i] * s[i]; n++; }
    zarf.push(Math.sqrt(t / Math.max(1, n)));
  }
  const tepe = Math.max(...zarf, 1e-6);
  // baştaki/sondaki sessizlik: replik zamanlaması sesin gerçek başlangıcına göre yapılır
  const esik = tepe * 0.06;
  const bas = Math.max(0, zarf.findIndex((v) => v > esik));
  let son = zarf.length - 1; while (son > 0 && zarf[son] <= esik) son--;
  sesler[r.kimlik] = { kim: r.kim, sure: s.length / 24000, bas: bas / fps, son: (son + 1) / fps, zarf: zarf.map((v) => +(v / tepe).toFixed(3)) };
  console.log(r.kimlik, sesler[r.kimlik].sure.toFixed(2), 's  konuşma', (bas / fps).toFixed(2), '-', ((son + 1) / fps).toFixed(2));
}
fs.writeFileSync(path.join(hazir, 'ses.json'), JSON.stringify({ fps, sesler }));
