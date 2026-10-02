// Okula Hazırım görselleri: minkino-film-gemini/okul/*.png → geçici ara klasör (serbest oran, şeffaf, kırpılmış) → assets/okul/<ad>.webp (yuva ölçüsü, okul-yuva.cjs).
// Yuva ölçüleri okul/src/cizim.ts GORSEL_YUVALARI. node okul-isle.cjs  (yeni dosya gelirse yeniden çalıştır; güvenli)
const { execFileSync } = require('child_process'), fs = require('fs'), os = require('os'), path = require('path');
const ARA = process.env.OKUL_ARA || path.join(os.tmpdir(), 'minkino-okul-gemini');
const G = 'C:/Users/Minkex/Desktop/minkino-film-gemini/okul';
const adlar = fs.readdirSync(G).filter((f) => f.endsWith('.png') && !/^sayfa-/.test(f)).map((f) => f.replace(/\.png$/, ''));
const ayar = { agac: { delik: true, delikMin: 150 }, kopru: { delik: true, delikMin: 120 }, bahce: { delik: true, delikMin: 400 } };
execFileSync('node', ['ekip/illustrator/gemini-esya.cjs', '--girdi', G, '--cikti', ARA, '--max', '0', '--ayar', JSON.stringify(ayar), ...adlar], { stdio: 'inherit' });
execFileSync('node', ['ekip/illustrator/okul-yuva.cjs', ...adlar], { stdio: 'inherit', env: { ...process.env, OKUL_ARA: ARA } });
