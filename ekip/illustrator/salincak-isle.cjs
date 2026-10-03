// Salıncak sahnesi görselleri (minkino-film-gemini/salincak) → YALNIZ assets/film/park/<ad>.webp (assets/salincak/ hiç oluşmaz; yönetici kararı 2026-10-03).
// Şimdilik: kume-sol / kume-sag (çalı+lale+mantar+taş öbeği; yer gölgesi atılır; ikisi aynı tuvalde, tabandan hizalı; en uzun kenar 1600 px).
// Gemini içeriği 1256 px olduğundan 1600'e lanczos3 ile yumuşak büyütülür (gemini-esya --max yalnız küçültür). Ara çıktı repo dışında (os.tmpdir()). Mevcut daha büyük dosyanın üstüne yazılmaz (guvenli-yaz.cjs).
// node salincak-isle.cjs   (tekrar çalıştırmak güvenli)
const { execFileSync } = require('child_process'), fs = require('fs'), os = require('os'), path = require('path');
const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const yaz = require('./guvenli-yaz.cjs');
const G = 'C:/Users/Minkex/Desktop/minkino-film-gemini/salincak', ARA = path.join(os.tmpdir(), 'minkino-salincak-ara');
const kume = ['kume-sol', 'kume-sag'].filter((a) => fs.existsSync(`${G}/${a}.png`));
(async () => {
  if (!kume.length) return;
  fs.mkdirSync(ARA, { recursive: true });
  execFileSync('node', ['ekip/illustrator/gemini-esya.cjs', '--girdi', G, '--cikti', ARA, '--max', '0', '--esit', '^(kume)-', '--esit-hiza', 'alt', '--desen', '^kume-(sol|sag)\.', ...kume], { stdio: 'inherit' });
  for (const a of kume) {
    const kaynak = fs.readFileSync(path.join(ARA, a + '.webp')), m = await s(kaynak).metadata(), k = 1600 / Math.max(m.width, m.height);
    const b = await s(kaynak).resize(Math.round(m.width * k), Math.round(m.height * k), { kernel: 'lanczos3' }).webp({ quality: 94, alphaQuality: 100, effort: 5 }).toBuffer();
    if (await yaz(`assets/film/park/${a}.webp`, b)) console.log(a, Math.round(m.width * k) + 'x' + Math.round(m.height * k));
  }
})();
