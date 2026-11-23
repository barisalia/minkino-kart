/**
 * İngilizceye Merhaba · dinleme sayfası: bir ünitenin (ve ortak sözlerin) bütün kayıtlarını Barış'ın tek tek
 * dinleyebileceği sayfaya dizer. Ben sesi duyamıyorum; ses onayı Barış'ın kulağındadır.
 * Kullanım: npx vite-node scripts/ingilizce-dinleme.ts -- ciftlik yiyecekler
 * Çıktı: ekip/ingilizce/dinle.html (ses dosyalarına göreli yol; tarayıcıda açılır)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { UNITELER, ekSesler, ortakSesler, uniteSesleri, type SesMetni } from '../ingilizce/src/icerik';
import { ilerisiSesleri, ortakSesler2 } from '../ingilizce/src/icerik2';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const istenen = process.argv.slice(2).filter((a) => a !== '--');
const uniteler = UNITELER.filter((u) => istenen.includes(u.id));
const rapor: { id: string; uyari: string[] }[] = fs.existsSync(path.join(KOK, 'output/ingilizce/ses-rapor.json'))
  ? JSON.parse(fs.readFileSync(path.join(KOK, 'output/ingilizce/ses-rapor.json'), 'utf8')) : [];
const var_ = (id: string) => fs.existsSync(path.join(KOK, 'assets/ingilizce/ses', `${id}.mp3`));
const kacis = (m: string) => m.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const KIM = { polly: 'Polly', ceren: 'Ceren Öğretmen', kino: 'Kino' } as const;

const satir = (s: SesMetni) => {
  const uyari = rapor.find((r) => r.id === s.id)?.uyari ?? [];
  return `<tr${uyari.length ? ' class="supheli"' : ''}><td>${KIM[s.kim]}</td><td lang="${s.dil}">${kacis(s.metin)}${s.yavas ? ' <i>(yavaş)</i>' : ''}</td><td>${var_(s.id) ? `<audio controls preload="none" src="../../assets/ingilizce/ses/${s.id}.mp3"></audio>` : '<b>kayıt yok</b>'}</td><td class="kimlik">${s.id}</td></tr>`;
};
const tablo = (baslik: string, sesler: SesMetni[]) => `<h2>${kacis(baslik)}</h2><table><tr><th>Kim</th><th>Söz</th><th>Dinle</th><th>Dosya</th></tr>${sesler.map(satir).join('')}</table>`;

const efektler = uniteler.flatMap((u) => u.kelimeler.filter((w) => w.efekt).map((w) => `<tr><td>ses</td><td>${kacis(w.tr)} sesi</td><td>${var_(`efekt/${w.id}`) ? `<audio controls preload="none" src="../../assets/ingilizce/ses/efekt/${w.id}.mp3"></audio>` : '<b>kayıt yok</b>'}</td><td class="kimlik">efekt/${w.id}</td></tr>`));

const html = `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>İngilizceye Merhaba · dinleme</title>
<style>
body{font:16px/1.45 "Nunito","Trebuchet MS",system-ui,sans-serif;margin:24px auto;max-width:980px;padding:0 16px;color:#2a2c24;background:#fff6e6}
h1{font-size:26px;margin:0 0 4px}h2{font-size:20px;margin:30px 0 8px}p{margin:4px 0;color:#5b6257}
table{border-collapse:collapse;width:100%;background:#fff8e9;border:2px solid #2a2c24;border-radius:14px;overflow:hidden}
th,td{padding:7px 10px;border-bottom:1px solid #e3d8c2;text-align:left;vertical-align:middle}th{background:#ffe9a6;font-size:14px}
audio{height:34px;width:230px}.kimlik{font-size:12px;color:#8a8472}td[lang=en]{font-weight:800;font-size:18px}
.supheli td{background:#fff0d0}i{font-weight:400;color:#8a5b00}
</style></head><body>
<h1>İngilizceye Merhaba · dinleme sayfası</h1>
<p>Her kayıt ayrı üretildi ve otomatik denetimden geçti (süre, kesik baş/son, söylenen söz). Kulağına ters gelen olursa dosya adını söyle, yeniden üretirim.</p>
${uniteler.map((u) => tablo(`${u.no}. ünite · ${u.tr} (${u.en})`, uniteSesleri(u))).join('')}
${efektler.length ? `<h2>Hayvan sesleri</h2><table><tr><th></th><th>Ses</th><th>Dinle</th><th>Dosya</th></tr>${efektler.join('')}</table>` : ''}
${tablo('Her derste geçen ortak sözler', [...ortakSesler(), ...ekSesler()])}
<h1 style="margin-top:40px">2. ve 3. seviye (cümleler, soru–cevap, hikâye)</h1>
<p>Şüpheli işaretli (sarı) kayıtların çoğu, yazıya çevirmenin "Polly" adını "Poli" diye yazmasından ya da yavaş okunuşun biraz hızlı bulunmasından; yine de kulakla bak.</p>
${uniteler.map((u) => tablo(`${u.no}. ünite · ${u.tr} · cümleler ve hikâye`, ilerisiSesleri(u))).join('')}
${tablo('2. ve 3. seviyenin ortak sözleri ve cümle taşları', ortakSesler2())}
</body></html>`;
const hedef = path.join(KOK, 'ekip/ingilizce/dinle.html');
fs.writeFileSync(hedef, html);
console.log(`yazıldı: ${path.relative(KOK, hedef)} (${uniteler.map((u) => u.id).join(', ')})`);
