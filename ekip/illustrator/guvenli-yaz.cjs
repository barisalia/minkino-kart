// Güvenli yazım: mevcut dosya yenisinden DAHA YÜKSEK çözünürlükteyse (alan farkı > %5) üstüne yazma (Recraft ile keskinleştirilmiş/büyütülmüş varlıkların yanlışlıkla küçük sürümle ezilmesini önler).
// Zorla yazmak için ortam değişkeni ZORLA=1. Kullanım: const yaz = require('./guvenli-yaz.cjs'); await yaz(yol, buffer)  → true (yazıldı) / false (atlandı)
const fs = require('fs'), path = require('path');
const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
module.exports = async function yaz(yol, buf) {
  if (!process.env.ZORLA && fs.existsSync(yol)) {
    try {
      const e = await s(fs.readFileSync(yol)).metadata(), n = await s(buf).metadata();
      if (e.width * e.height > n.width * n.height * 1.05) { console.log(`ATLANDI ${yol}: mevcut ${e.width}x${e.height}, yenisi ${n.width}x${n.height} (daha küçük); ZORLA=1 ile yazılır`); return false; }
    } catch { /* okunamayan mevcut dosya: üstüne yaz */ }
  }
  fs.mkdirSync(path.dirname(yol), { recursive: true }); fs.writeFileSync(yol, buf); return true;
};
