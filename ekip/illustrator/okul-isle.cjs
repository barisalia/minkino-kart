// Okula Hazırım yuva görselleri: minkino-film-gemini/okul/*.png → ara klasör (serbest oran, şeffaf, kırpılmış) → assets/okul/<ad>.webp (yuva ölçüsü, oran korunur, okul-yuva.cjs).
// Yuva ölçüleri okul/src/cizim.ts GORSEL_YUVALARI. Gemini bir yuvayı yeniden çizdiyse "<ad>-2.png" gelir (tabak-2, dal-2): o, "<ad>"ın yerine geçer.
// node okul-isle.cjs  (yeni dosya gelirse yeniden çalıştır; güvenli)
const { execFileSync } = require('child_process'), fs = require('fs'), os = require('os'), path = require('path');
const ARA = process.env.OKUL_ARA || path.join(os.tmpdir(), 'minkino-okul-gemini');
const G = 'C:/Users/Minkex/Desktop/minkino-film-gemini/okul';
const HARITA = path.join(G, 'harita');   // okul/harita/: parlak yeni harita simgeleri (bahce, kule, kopru, okul) 2 kat çözünürlükle yuva oranında (OLCEK=2)
const haritaAd = ['bahce', 'kule', 'kopru', 'okul'].filter((a) => fs.existsSync(path.join(HARITA, a + '.png')));
// Recraft ile 3-4 kat keskinleştirilmiş yuvalar (agac 3072, tabak 4096 …): bu betik ASLA dokunmaz (yönetici, 2026-10-03). Yeniden üretmek için ZORLA=1.
const ATLA = process.env.ZORLA ? [] : ['agac', 'dal', 'istasyon', 'kurabiye', 'piknik-ortusu', 'tabak', 'dal-2', 'tabak-2'];
const adlar = fs.readdirSync(G).filter((f) => f.endsWith('.png') && !/^sayfa-/.test(f)).map((f) => f.replace(/\.png$/, '')).filter((a) => !ATLA.includes(a));
const ayar = { agac: { delik: true, delikMin: 150 }, kopru: { delik: true, delikMin: 120 }, bahce: { delik: true, delikMin: 400 }, 'dal-2': { minOran: 0.0002 }, 'tabak-2': { delik: false } };
execFileSync('node', ['ekip/illustrator/gemini-esya.cjs', '--girdi', G, '--cikti', ARA, '--max', '0', '--ayar', JSON.stringify(ayar), ...adlar], { stdio: 'inherit' });
// yeniden çizilen yuvalar: <ad>-2 → <ad>
const yuvalar = [];
for (const a of adlar) { const m = a.match(/^(.+)-2$/); if (m) { fs.copyFileSync(path.join(ARA, a + '.webp'), path.join(ARA, m[1] + '.webp')); console.log(`${a} → ${m[1]} yuvası`); } else yuvalar.push(a); }
execFileSync('node', ['ekip/illustrator/okul-yuva.cjs', ...yuvalar.filter((a) => !haritaAd.includes(a))], { stdio: 'inherit', env: { ...process.env, OKUL_ARA: ARA } });
if (haritaAd.length) {
  execFileSync('node', ['ekip/illustrator/gemini-esya.cjs', '--girdi', HARITA, '--cikti', ARA, '--max', '0', '--ayar', JSON.stringify({ bahce: { delik: true, delikMin: 300 }, kopru: { delik: true, delikMin: 300 } }), ...haritaAd], { stdio: 'inherit' });
  execFileSync('node', ['ekip/illustrator/okul-yuva.cjs', ...haritaAd], { stdio: 'inherit', env: { ...process.env, OKUL_ARA: ARA, OLCEK: '2' } });
}
