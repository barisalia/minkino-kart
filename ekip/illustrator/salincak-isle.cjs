// Salıncak sahnesi görselleri (minkino-film-gemini/salincak) → assets/salincak/<ad>.webp (Gemini boyutu) ve assets/film/park/<ad>.webp (en uzun kenar 1600). Şimdilik: kume-sol / kume-sag (çalı+lale+mantar+taş öbeği; yer gölgesi atılır; ikisi aynı tuvalde, tabandan hizalı; en uzun kenar 1600 px).
// node salincak-isle.cjs   (tekrar çalıştırmak güvenli)
const { execFileSync } = require('child_process'), fs = require('fs');
const G = 'C:/Users/Minkex/Desktop/minkino-film-gemini/salincak';
const kume = ['kume-sol', 'kume-sag'].filter((a) => fs.existsSync(`${G}/${a}.png`));
if (kume.length) execFileSync('node', ['ekip/illustrator/gemini-esya.cjs', '--girdi', G, '--cikti', 'assets/salincak', '--max', '0', '--esit', '^(kume)-', '--esit-hiza', 'alt', '--desen', '^kume-(sol|sag)\.', ...kume], { stdio: 'inherit' });   // yuva: assets/salincak (Gemini boyutu 1256 px)
if (kume.length) execFileSync('node', ['ekip/illustrator/gemini-esya.cjs', '--girdi', G, '--cikti', 'assets/film/park', '--max', '1600', '--esit', '^(kume)-', '--esit-hiza', 'alt', '--desen', '^kume-(sol|sag)\.', ...kume], { stdio: 'inherit' });
// --max yalnız küçültür; yönetici en uzun kenar 1600 istedi: Gemini içeriği 1256 px olduğundan yumuşak (lanczos3) büyütülür
const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
(async () => { for (const a of kume) { const f = `assets/film/park/${a}.webp`, m = await s(fs.readFileSync(f)).metadata(), k = 1600 / Math.max(m.width, m.height);
  if (Math.abs(k - 1) < 0.001) continue;
  const b = await s(fs.readFileSync(f)).resize(Math.round(m.width * k), Math.round(m.height * k), { kernel: 'lanczos3' }).webp({ quality: 94, alphaQuality: 100, effort: 5 }).toBuffer(); await require('./guvenli-yaz.cjs')(f, b); console.log(a, Math.round(m.width * k) + 'x' + Math.round(m.height * k)); } })();
