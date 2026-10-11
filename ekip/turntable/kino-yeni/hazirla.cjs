// Kino C (Recraft SVG) → Illustrator Dönen tabla kaynağı: en-boy düzeltilir, düz arka plan dikdörtgeni silinir.
// node ekip/turntable/kino-yeni/hazirla.cjs
const fs = require('fs');
const path = require('path');
const kaynak = path.join(__dirname, '../../film/seri-2/karakter/v1/kino-on-c.svg');
const hedef = path.join(__dirname, 'kino-c-tt.svg');
let s = fs.readFileSync(kaynak, 'utf8');
s = s.replace(/<metadata>[\s\S]*?<\/metadata>/, '');
const m = s.match(/<svg[^>]*>/);
const ic = s.slice(m.index + m[0].length).replace(/<\/svg>\s*$/, '');
// ilk tam kare (arka plan) yolunu at: M0 0 / M 0,0 ile başlayan ve 2432'ye uzanan
const yollar = ic.match(/<path[\s\S]*?\/>/g) || [];
let atildi = 0;
const kalan = yollar.filter((p, i) => {
  const d = (p.match(/ d="([^"]*)"/) || [])[1] || '';
  const tamKare = i < 3 && /^M\s*0[ ,]+0\b/.test(d.trim()) && d.includes('2432');
  if (tamKare) atildi++;
  return !tamKare;
});
const sx = 1792 / 2432;
const cikti = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1792 2432" width="1792" height="2432"><g transform="scale(${sx} 1)">${kalan.join('')}</g></svg>`;
fs.writeFileSync(hedef, cikti);
console.log('yol', yollar.length, 'atildi', atildi, '->', hedef);
