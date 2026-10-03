// Gemini pasta seti (minkino-film-gemini/pasta) → assets/pasta/*.webp. Tüm kuralları tek yerde tutar; yeni dosya gelince bu betik tekrar çalıştırılır (güvenli).
//  arka-tezgah-uzak-1 (opak), tezgah-on-1 (şeffaf, tam tuval), eşyalar (kırpılmış), kalıplar (delik), krema/kavanoz/kurabiye/cupcake (ortak tuval; cupcake tabandan hizalı).
// node pasta-isle.cjs
const { execFileSync } = require('child_process'), fs = require('fs');
const G = 'C:/Users/Minkex/Desktop/minkino-film-gemini/pasta', O = 'assets/pasta', B = 'ekip/illustrator/gemini-esya.cjs';
const var_ = (ad) => fs.existsSync(`${G}/${ad}.png`);
const calistir = (a) => execFileSync('node', [B, '--girdi', G, '--cikti', O, ...a], { stdio: 'inherit' });
const ATLA = ['firin-1'];   // bilerek silindi: fırın artık assets/pasta/firin-dik-1.webp (yönetici/kodcu); betik yeniden üretmesin
const tum = fs.readdirSync(G).filter((f) => f.endsWith('.png')).map((f) => f.replace(/\.png$/, '')).filter((a) => !ATLA.includes(a));
const al = (re) => tum.filter((a) => re.test(a));
if (var_('tezgah-uzak-1')) calistir(['--arka', '^tezgah-uzak', 'tezgah-uzak-1']);
if (var_('tezgah-on-1')) calistir(['--max', '0', '--ayar', '{"tezgah-on-1":{"kenarKapali":true,"tohum":[[700,100]],"tuvalKoru":true}}', 'tezgah-on-1']);
const tekler = tum.filter((a) => !/^(sayfa-|tezgah-|krema-|kavanoz-|kurabiye-|cupcake-|kalip-)/.test(a));
if (tekler.length) calistir(tekler);
const kalip = al(/^kalip-/); if (kalip.length) calistir(['--ayar', JSON.stringify(Object.fromEntries(kalip.map((a) => [a, { delik: true }]))), ...kalip]);
for (const on of ['krema', 'kavanoz', 'kurabiye']) { const g = al(new RegExp('^' + on + '-')); if (g.length) calistir(['--esit', '^' + on, '--desen', '^' + on + '-', ...g]); }
const cup = al(/^cupcake-/); if (cup.length) calistir(['--esit', '^cupcake', '--esit-hiza', 'alt', '--desen', '^cupcake-', ...cup]);
