// Film kapağı: filmin kendi karesinden 2732×1536 (16:9) WebP (ekip/film/FILM-REHBERI.md §11).
// Önce kare:  npm run film:mp4 -- yatay --film=<ad> --ornek=<sn> --olcek=1.5 --png   → dist-video/ornek-yatay-<sn>.png
// Sonra:      node scripts/film/kapak.mjs <ad> <sn> [yakin sol ust]                    → assets/film/kapak/<ad>.webp
// yakin (ör. 1.2): kapak karenin 1/yakin boyundaki parçası; sol, ust: parçanın sol üst köşesi (karenin oranı, 0-1).
// Yakın kapakta kare daha büyük alınır ki parça yine 2732 px'ten küçük olmasın: --olcek ≥ 1.43 × yakin.
import fs from 'node:fs';
import sharp from 'sharp';

const [ad, sn, yakinY = '1', solY = '0', ustY = '0'] = process.argv.slice(2);
if (!ad || !sn) throw new Error('Kullanım: node scripts/film/kapak.mjs <film> <saniye> [yakin sol ust]');
const kaynak = `dist-video/ornek-yatay-${sn}.png`;
if (!fs.existsSync(kaynak)) throw new Error(`${kaynak} yok: önce npm run film:mp4 -- yatay --film=${ad} --ornek=${sn} --olcek=1.5 --png`);
const EN = 2732;
const BOY = 1536;
const yakin = Number(yakinY);
const m0 = await sharp(kaynak).metadata();
const w = Math.round(m0.width / yakin);
const h = Math.round(m0.height / yakin);
const sol = Math.min(m0.width - w, Math.round(Number(solY) * m0.width));
const ust = Math.min(m0.height - h, Math.round(Number(ustY) * m0.height));
if (w < EN) console.warn(`! parça ${w} px: 2732'den küçük, büyütülür (--olcek'i artırın)`);
const cikti = `assets/film/kapak/${ad}.webp`;
await sharp(kaynak)
  .extract({ left: sol, top: ust, width: w, height: h })
  .resize(EN, BOY, { fit: 'cover', kernel: 'lanczos3' })
  .webp({ quality: 82, effort: 6, smartSubsample: true })
  .toFile(cikti);
const m = await sharp(cikti).metadata();
console.log(`✓ ${cikti}: ${m.width}×${m.height}, ${Math.round(fs.statSync(cikti).size / 1024)} KB (kare ${sn} sn, yakın ${yakin})`);
