// Dedektif çizimleri (minkino-film-gemini/dedektif) → assets/dedektif/<ad>.webp
//  kapak, roman-1..4: 4:3 OPAK kareler (orta merkezli "cover" kırpma, en uzun kenar 1600; beyaz silinmez)
//  buyutec: şeffaf, CAMIN İÇİ da şeffaf (delik ayarı), geri kalan nesne şeffaf kırpılmış
//  masa, sosis, kalemlik-devrik: şeffaf, kırpılmış (gölgesiz)
// sayfa-*.png ızgara kaynağıdır, atlanır. node dedektif-yeni-isle.cjs   (yeni dosya gelince yeniden çalıştır; güvenli)
const { execFileSync } = require('child_process'), fs = require('fs');
const guvenliYaz = require('./guvenli-yaz.cjs');
const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const G = 'C:/Users/Minkex/Desktop/minkino-film-gemini/dedektif', OUT = 'assets/dedektif';
const var_ = (a) => fs.existsSync(`${G}/${a}.png`);
const OPAK43 = ['kapak', 'roman-1', 'roman-2', 'roman-3', 'roman-4'].filter(var_);
const SEFFAF = ['buyutec', 'masa', 'sosis', 'kalemlik-devrik'].filter(var_);
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const a of OPAK43) {
    const m = await s(`${G}/${a}.png`).metadata(), hedefW = Math.min(1600, Math.round(Math.max(m.width, (m.height * 4) / 3))), W = hedefW - (hedefW % 4), H = (W * 3) / 4;
    const b = await s(`${G}/${a}.png`).resize(W, H, { fit: 'cover', position: 'centre', kernel: 'lanczos3' }).removeAlpha().webp({ quality: 90, effort: 5 }).toBuffer();
    if (await guvenliYaz(`${OUT}/${a}.webp`, b)) console.log(`${a}: kaynak ${m.width}x${m.height} → ${W}x${H} (4:3 opak), ${Math.round(b.length / 1024)} KB`);
  }
  if (SEFFAF.length) {
    const ayar = { buyutec: { delik: true, delikMin: 400 }, masa: { delik: true, delikMin: 600 }, 'kalemlik-devrik': { delik: true, delikMin: 300 } };
    execFileSync('node', ['ekip/illustrator/gemini-esya.cjs', '--girdi', G, '--cikti', OUT, '--max', '1400', '--ayar', JSON.stringify(ayar), '--desen', '^(' + SEFFAF.join('|') + ')\\.', ...SEFFAF], { stdio: 'inherit' });
  }
})();
