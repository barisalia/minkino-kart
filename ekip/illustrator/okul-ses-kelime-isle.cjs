// Okula Hazırım ses ve kelime görselleri: minkino-film-gemini/okul-ses (arı karakteri, ses sayfası eşyaları, kule-kat arka planı) ve okul-kelime (eşyalar) → assets/okul/ses ve assets/okul/kelime.
// kule-kat: arka plan, beyaz silinmez, 1920x1080 webp. Ortak tuval grupları (aynı ölçek, üst üste gelince zıplamasın): boya kovaları, bardaklar, kapılar, toplar.
// Kapalı iç beyazlar (kova sapı arası, sepet sapı, ağıl, ip halkası, iğne gözü) DELIK ile şeffaflaşır; EK: açık renkli nesneler (buhar, cam) için koyu eşik.
// sayfa-*.png ızgara kaynağıdır, yok sayılır. node okul-ses-kelime-isle.cjs  (yeni dosya gelince yeniden çalıştır; güvenli)
const { execFileSync } = require('child_process'), fs = require('fs');
const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const G = 'C:/Users/Minkex/Desktop/minkino-film-gemini', B = 'ekip/illustrator/gemini-esya.cjs';
const calistir = (a) => execFileSync('node', [B, ...a], { stdio: 'inherit' });
const liste = (d) => fs.existsSync(`${G}/${d}`) ? fs.readdirSync(`${G}/${d}`).filter((f) => f.endsWith('.png') && !/^sayfa-/.test(f) && !/-(eski|v1).png$/.test(f)).map((f) => f.replace(/\.png$/, '')) : [];
const DELIK = { 'meyve-sepeti-bos': 300, agil: 300, davul: 200, papagan: 200, 'boya-kovasi-kirmizi': 400, 'boya-kovasi-mavi': 400, 'boya-kovasi-sari': 400, 'boya-kovasi-yesil': 400, ip: 800, igne: 60, mum: 200, utu: 300, odul: 300, canta: 100, fincan: 250, valiz: 200, ninni: 150, ihlamur: 200, ulke: 300, ucurtma: 100, dut: 60 };
const EK = { ihlamur: { koyu: 235 }, fincan: { koyu: 235 }, su: { minOran: 0.0003 }, deniz: { minOran: 0.0003 }, mum: { sat: 110 }, 'sicak-corba': { koyu: 235 }, 'bardak-bos': { koyu: 238 }, 'bardak-dolu': { koyu: 238 } };
const KAHRAMAN = '^(tavsan)|^(inek)|^(leylek)|^(nar-yuzlu)|^(elma-yuzlu)';   // harf odası kahramanları: karakter başına ortak tuval (pozlar aynı ölçek; zıplamada ayak yerden kalkar, o yüzden ortalanır)
const ESIT = '^(boya-kovasi)|^(bardak)|^(kapi)|(top)$|^(havlu)';
const ayarlar = (adlar) => JSON.stringify(Object.fromEntries(adlar.filter((a) => DELIK[a] || EK[a]).map((a) => [a, { ...(DELIK[a] ? { delik: true, delikMin: DELIK[a] } : {}), ...(EK[a] || {}) }])));
(async () => {
  const ses = liste('okul-ses'), arka = ses.filter((a) => /-kat$/.test(a)), kahraman = ses.filter((a) => new RegExp(KAHRAMAN).test(a)), tekler = ses.filter((a) => !arka.includes(a) && !kahraman.includes(a));
  fs.mkdirSync('assets/okul/ses', { recursive: true }); fs.mkdirSync('assets/okul/kelime', { recursive: true });
  for (const a of arka) { const i = await s(`${G}/okul-ses/${a}.png`).resize(1920, 1080, { fit: 'cover', position: 'centre', kernel: 'lanczos3' }).removeAlpha().webp({ quality: 90, effort: 5 }).toFile(`assets/okul/ses/${a}.webp`); console.log(a, i.width + 'x' + i.height, Math.round(i.size / 1024) + ' KB'); }
  if (tekler.length) calistir(['--girdi', `${G}/okul-ses`, '--cikti', 'assets/okul/ses', '--max', '0', '--ayar', ayarlar(tekler), '--desen', '^(' + tekler.join('|') + ')\\.', ...tekler]);
  if (kahraman.length) calistir(['--girdi', `${G}/okul-ses`, '--cikti', 'assets/okul/ses', '--max', '900', '--esit', KAHRAMAN, '--desen', '^(' + kahraman.join('|') + ')\.', ...kahraman]);
  // okul-odul: çıkartmalar ve rozetler → assets/okul/odul/<ad>.webp (kopru-senlik istisna: assets/okul/kelime/)
  const odul = liste('okul-odul').filter((a) => !['kopru-senlik'].includes(a)), odulCik = odul.filter((a) => /^cikartma-/.test(a)), odulTek = odul.filter((a) => !/^cikartma-/.test(a));
  if (odulCik.length) { fs.mkdirSync('assets/okul/odul', { recursive: true }); execFileSync('node', ['ekip/illustrator/cikartma-isle.cjs', `${G}/okul-odul`, 'assets/okul/odul', ...odulCik], { stdio: 'inherit' }); }   // çıkartmalar: kalın beyaz kenar içte kalır, dış zemin/gölge şeffaf
  if (odulTek.length) { fs.mkdirSync('assets/okul/odul', { recursive: true }); calistir(['--girdi', `${G}/okul-odul`, '--cikti', 'assets/okul/odul', '--max', '0', '--ayar', ayarlar(odulTek), '--desen', '^(' + odulTek.join('|') + ')\.', ...odulTek]); }
  const SAHNE = ['kopru-senlik'];   // 16:9 sahneler: beyaz silinmez, 1920x1080 opak webp
  for (const a of SAHNE) { const kaynak = [`${G}/okul-odul/${a}.png`, `${G}/okul-kelime/${a}.png`].find((f) => fs.existsSync(f)); if (kaynak) { const i = await s(kaynak).resize(1920, 1080, { fit: 'cover', position: 'centre', kernel: 'lanczos3' }).removeAlpha().webp({ quality: 90, effort: 5 }).toFile(`assets/okul/kelime/${a}.webp`); console.log(a, i.width + 'x' + i.height, Math.round(i.size / 1024) + ' KB (sahne)'); } }
  const kelime = liste('okul-kelime').filter((a) => !['kopru-senlik'].includes(a));
  if (kelime.length) calistir(['--girdi', `${G}/okul-kelime`, '--cikti', 'assets/okul/kelime', '--max', '0', '--esit', ESIT, '--ayar', ayarlar(kelime), '--desen', '^(' + kelime.join('|') + ')\\.', ...kelime]);
  if (fs.existsSync('assets/okul/kelime/kapi-kapali.webp')) execFileSync('node', ['ekip/illustrator/kapi-duzelt.cjs'], { stdio: 'inherit' });   // kapı kenarı cilası (Gemini kapılarında dış kenar konturlu değil)
})();
