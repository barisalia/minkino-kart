// Okula Hazırım ses ve kelime görselleri: minkino-film-gemini/okul-ses (arı karakteri, kule-kat arka planı) ve okul-kelime (eşyalar) → assets/okul/ses ve assets/okul/kelime.
// kule-kat: arka plan, beyaz silinmez, 1920x1080 webp. Boya kovaları ortak tuvalde. Kapalı iç beyazlar (kova sapı arası, sepet sapı, ağıl) delik ayarıyla şeffaflaşır.
// sayfa-*.png ızgara kaynağıdır, yok sayılır. node okul-ses-kelime-isle.cjs  (yeni dosya gelince yeniden çalıştır; güvenli)
const { execFileSync } = require('child_process'), fs = require('fs');
const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const G = 'C:/Users/Minkex/Desktop/minkino-film-gemini', B = 'ekip/illustrator/gemini-esya.cjs';
const calistir = (a) => execFileSync('node', [B, ...a], { stdio: 'inherit' });
const liste = (d) => fs.existsSync(`${G}/${d}`) ? fs.readdirSync(`${G}/${d}`).filter((f) => f.endsWith('.png') && !/^sayfa-/.test(f)).map((f) => f.replace(/\.png$/, '')) : [];
const DELIK = { 'meyve-sepeti-bos': 300, agil: 300, davul: 200, papagan: 200, 'boya-kovasi-kirmizi': 400, 'boya-kovasi-mavi': 400, 'boya-kovasi-sari': 400, 'boya-kovasi-yesil': 400 };
(async () => {
  const ses = liste('okul-ses'), arka = ses.filter((a) => /^(kule-kat)/.test(a) || /-kat$/.test(a)), ari = ses.filter((a) => !arka.includes(a));
  fs.mkdirSync('assets/okul/ses', { recursive: true }); fs.mkdirSync('assets/okul/kelime', { recursive: true });
  for (const a of arka) { const i = await s(`${G}/okul-ses/${a}.png`).resize(1920, 1080, { fit: 'cover', position: 'centre', kernel: 'lanczos3' }).removeAlpha().webp({ quality: 90, effort: 5 }).toFile(`assets/okul/ses/${a}.webp`); console.log(a, i.width + 'x' + i.height, Math.round(i.size / 1024) + ' KB'); }
  if (ari.length) calistir(['--girdi', `${G}/okul-ses`, '--cikti', 'assets/okul/ses', '--max', '0', '--desen', '^(' + ari.join('|') + ')\.', ...ari]);
  const kelime = liste('okul-kelime'); if (kelime.length) {
    const ayar = Object.fromEntries(kelime.filter((a) => DELIK[a]).map((a) => [a, { delik: true, delikMin: DELIK[a] }]));
    calistir(['--girdi', `${G}/okul-kelime`, '--cikti', 'assets/okul/kelime', '--max', '0', '--esit', '^boya-kovasi', '--ayar', JSON.stringify(ayar), '--desen', '^(' + kelime.join('|') + ')\.', ...kelime]); }
})();
