// Turntable yan görünüşlerini Gemini'nin temiz yan profilleriyle değiştirir (ayı, maymun, inek, kuş) ve önizlemeleri yeniden üretir.
// Eski yan.png / yan.svg → yan-eski.png / yan-eski.svg (varsa dokunulmaz). yan.svg (vektör) Illustrator izi gerektirir: Illustrator boşken yan.png'den üretilecek (şimdilik yok).
// Önizleme: yan | 3/4 | arka (her hücre 520 px), açık (#CFE6FA) ve koyu (#2B2F3A) zemin; eski önizleme önizleme-eski.png olarak yoksa saklanır.
// node turntable-yan-degistir.cjs [ad ...]   (tekrar çalıştırmak güvenli)
const fs = require('fs'), path = require('path');
const s = require(require.resolve('sharp', { paths: [process.cwd()] }));
const SP = 'C:/Users/Minkex/AppData/Local/Temp/claude/C--Users-Minkex-Desktop-Minkino-Games/dfb36210-e147-43ba-989a-0a95cd2b7646/scratchpad/hyan/';
const KAYNAK = { ayi: 'ayi-yan.png', maymun: 'maymun-yan.png', inek: 'inek-yan.png', kus: 'kus-yan-seffaf.png' };
const adlar = process.argv.length > 2 ? process.argv.slice(2) : Object.keys(KAYNAK);
const HUCRE = 520;
(async () => {
  for (const ad of adlar) {
    const d = `ekip/turntable/${ad}/`; if (!fs.existsSync(d)) { console.log(ad, 'klasör yok'); continue; }
    const yeni = SP + KAYNAK[ad];
    if (!fs.existsSync(d + 'yan-eski.png') && fs.existsSync(d + 'yan.png')) fs.copyFileSync(d + 'yan.png', d + 'yan-eski.png');
    if (!fs.existsSync(d + 'yan-eski.svg') && fs.existsSync(d + 'yan.svg')) fs.renameSync(d + 'yan.svg', d + 'yan-eski.svg');
    const png = await s(yeni).ensureAlpha().png().toBuffer(); fs.writeFileSync(d + 'yan.png', png);
    if (!fs.existsSync(d + 'onizleme-eski.png') && fs.existsSync(d + 'onizleme.png')) fs.copyFileSync(d + 'onizleme.png', d + 'onizleme-eski.png');
    const hucre = [];
    for (const g of ['yan', 'uc-ceyrek', 'arka']) hucre.push(await s(d + g + '.png').resize(HUCRE, HUCRE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer());
    for (const [bg, dosya] of [['#CFE6FA', 'onizleme.png'], ['#2B2F3A', 'onizleme-koyu.png']]) {
      await s({ create: { width: 3 * HUCRE, height: HUCRE, channels: 3, background: bg } }).composite(hucre.map((b, i) => ({ input: b, left: i * HUCRE, top: 0 }))).png().toFile(d + dosya);
    }
    console.log(ad + ': yan.png değişti (Gemini temiz profil), önizleme yenilendi');
  }
})();
