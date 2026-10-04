// Pamuk tek figürlü görseller (şeffaf kesit): assets/dedektif/pamuk-a.webp ve pamuk-b.webp, kürk oyundaki soğuk beyaz Pamuk'a (pamuk-sogut.cjs).
//  pamuk-a: Gemini'den (minkino-film-gemini/dedektif/pamuk-a.png) kesilir (gemini-esya.cjs, şeffaf, kırpılmış), soğuk beyaza çevrilir, yazılır (yeni dosya).
//  pamuk-b: mevcut assets/dedektif/pamuk-b.webp YERİNDE çevrilir (aynı boyut; tekrar çalıştırmak zararsız: soğuk kürkte ağırlık ~0).
// node pamuk-ab-isle.cjs
const { execFileSync } = require('child_process'), fs = require('fs'), os = require('os'), path = require('path');
const { sogut } = require('./pamuk-sogut.cjs');
const yaz = require('./guvenli-yaz.cjs');
const G = 'C:/Users/Minkex/Desktop/minkino-film-gemini/dedektif', ARA = path.join(os.tmpdir(), 'minkino-pamuk-ab');
(async () => {
  if (fs.existsSync(`${G}/pamuk-a.png`) && !fs.existsSync('assets/dedektif/pamuk-a.webp')) {
    fs.mkdirSync(ARA, { recursive: true });
    execFileSync('node', ['ekip/illustrator/gemini-esya.cjs', '--girdi', G, '--cikti', ARA, '--max', '1024', '--desen', '^pamuk-a\\.', 'pamuk-a'], { stdio: 'inherit' });
    const r = await sogut(fs.readFileSync(path.join(ARA, 'pamuk-a.webp')));
    if (await yaz('assets/dedektif/pamuk-a.webp', r.buf)) console.log(`pamuk-a.webp yazıldı ${r.genislik}x${r.yukseklik}, ${r.degisen} piksel soğuk beyaza çevrildi`);
  }
  for (const a of ['pamuk-b']) {
    const yol = `assets/dedektif/${a}.webp`; if (!fs.existsSync(yol)) continue;
    const r = await sogut(fs.readFileSync(yol)); if (await yaz(yol, r.buf)) console.log(`${a}.webp çevrildi ${r.genislik}x${r.yukseklik}, ${r.degisen} piksel`);
  }
})();
