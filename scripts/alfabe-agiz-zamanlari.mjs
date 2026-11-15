// node scripts/alfabe-agiz-zamanlari.mjs
import { readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import ts from 'typescript';
import { chromium } from '@playwright/test';

const kok = fileURLToPath(new URL('../', import.meta.url));
const sesler = path.join(kok, 'assets/alfabe/ses');
const cikti = path.join(kok, 'alfabe/src/agiz-zamanlari.json');
const gecici = cikti + '.' + process.pid + '.tmp';
// Konuşma dersindeki kayitlar glob'u, kullanım dışı sahne kayıtlarını pakete almıyor.
const eskiSahne = /^(?:kopru|ada|sahne|yer)-|^tren-(?:az|cok|giris|son|varis)\.mp3$/;
const kayitlar = (await readdir(sesler)).filter(ad => ad.endsWith('.mp3') && !eskiSahne.test(ad)).sort();
if (!kayitlar.length) throw new Error('Ceren’in ses dosyaları bulunamadı.');

const dudakKaynak = await readFile(path.join(kok, 'src/audio/dudak-mantik.ts'), 'utf8');
const { outputText } = ts.transpileModule(dudakKaynak, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const tarayici = await chromium.launch({channel:'chrome'});
try {
  const sayfa = await tarayici.newPage();
  // Üretim çalışan bir Vite sunucusuna veya ses çıkış aygıtına bağlı değil.
  await sayfa.evaluate(async kaynak => {
    const adres = URL.createObjectURL(new Blob([kaynak], {type:'text/javascript'}));
    try { window.dudak = await import(adres); }
    finally { URL.revokeObjectURL(adres); }
    window.cozucu = new OfflineAudioContext(1, 1, 48000);
  }, outputText);

  const satirlar = [];
  for (const ad of kayitlar) {
    const mp3 = await readFile(path.join(sesler, ad));
    const zamanlar = await sayfa.evaluate(async veri => {
      const bayt = Uint8Array.from(atob(veri), c => c.charCodeAt(0));
      const kayit = await window.cozucu.decodeAudioData(bayt.buffer);
      const {DUDAK, sekilDizisi, zarfCikar} = window.dudak;
      const zarf = zarfCikar(kayit.getChannelData(0), kayit.sampleRate);
      const sekiller = sekilDizisi(zarf, 10, {...DUDAK, enAzMs:88});
      const pozlar = {kapali:0, gulumse:0, az:1, dis:1, orta:2, yuvarlak:3};
      const degisimler = [];
      let onceki;
      for (const [kare, sekil] of sekiller.entries()) {
        const poz = pozlar[sekil];
        if (poz !== onceki) degisimler.push([kare * 10, poz]);
        onceki = poz;
      }
      return degisimler;
    }, mp3.toString('base64'));
    if (!zamanlar.length) throw new Error(ad + ' için ağız hareketi okunamadı.');
    satirlar.push('  ' + JSON.stringify(path.basename(ad, '.mp3')) + ': ' + JSON.stringify(zamanlar));
  }

  await writeFile(gecici, '{\n' + satirlar.join(',\n') + '\n}\n', 'utf8');
  await rename(gecici, cikti);
  console.log(kayitlar.length + ' kaydın ağız zamanları yazıldı.');
} finally {
  await tarayici.close();
  await rm(gecici, {force:true});
}
