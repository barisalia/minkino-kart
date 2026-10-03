// Okula Hazırım yuva görselleri: minkino-film-gemini/okul/*.png → ara klasör (serbest oran, şeffaf, kırpılmış) → assets/okul/<ad>.webp (yuva ölçüsü, oran korunur, okul-yuva.cjs).
// Yuva ölçüleri okul/src/cizim.ts GORSEL_YUVALARI. Gemini bir yuvayı yeniden çizdiyse "<ad>-2.png" gelir (tabak-2, dal-2): o, "<ad>"ın yerine geçer.
// node okul-isle.cjs  (yeni dosya gelirse yeniden çalıştır; güvenli)
const { execFileSync } = require('child_process'), fs = require('fs'), os = require('os'), path = require('path');
const ARA = process.env.OKUL_ARA || path.join(os.tmpdir(), 'minkino-okul-gemini');
const G = 'C:/Users/Minkex/Desktop/minkino-film-gemini/okul';
const adlar = fs.readdirSync(G).filter((f) => f.endsWith('.png') && !/^sayfa-/.test(f)).map((f) => f.replace(/\.png$/, ''));
const ayar = { agac: { delik: true, delikMin: 150 }, kopru: { delik: true, delikMin: 120 }, bahce: { delik: true, delikMin: 400 }, 'dal-2': { minOran: 0.0002 }, 'tabak-2': { delik: false } };
execFileSync('node', ['ekip/illustrator/gemini-esya.cjs', '--girdi', G, '--cikti', ARA, '--max', '0', '--ayar', JSON.stringify(ayar), ...adlar], { stdio: 'inherit' });
// yeniden çizilen yuvalar: <ad>-2 → <ad>
const yuvalar = [];
for (const a of adlar) { const m = a.match(/^(.+)-2$/); if (m) { fs.copyFileSync(path.join(ARA, a + '.webp'), path.join(ARA, m[1] + '.webp')); console.log(`${a} → ${m[1]} yuvası`); } else yuvalar.push(a); }
execFileSync('node', ['ekip/illustrator/okul-yuva.cjs', ...yuvalar], { stdio: 'inherit', env: { ...process.env, OKUL_ARA: ARA } });
