// Mino'nun vektör çiziminden canlandırılabilir SVG üretir → src/mino/mino-svg.ts
// Kaynak: tasarımcının katmanlı çizimi ekip/mino/mino-final.svg (katmanlar <g id="…">).
// Her katman bir sınıf alır ve CSS değişkenleriyle hareket eder:
//   q: kuyruk · g: gövde + fular · kl / kr: sol / sağ kol · k: kafa, gözler ve kodla çizilen ağız
// Eski çizim (karakter-kaynak/kedi-3.svg) path sınıflandırmasıyla kurulmuştu (sinifla.mjs, parcalar.json); artık gerekmez.
// Durağan resmi de üretir → assets/karakter/mino.webp
// Çalıştırma: node scripts/mino/rig.mjs
import fs from 'node:fs';
import sharp from 'sharp';

const KAYNAK = 'ekip/mino/mino-final.svg';
const kaynak = fs.readFileSync(KAYNAK, 'utf8');

/** Bir katmanın içi (en dıştaki <g id> etiketi hariç) */
function katman(id) {
  const bas = kaynak.indexOf(`<g id="${id}"`);
  if (bas < 0) throw new Error(`Katman yok: ${id}`);
  const ic = kaynak.indexOf('>', bas) + 1;
  // iç içe <g>'leri sayarak kapanışı bul
  let derinlik = 1;
  const re = /<g\b[^>]*?(\/?)>|<\/g>/g;
  re.lastIndex = ic;
  for (let m; (m = re.exec(kaynak)); ) {
    if (m[0] === '</g>') derinlik--;
    else if (!m[1]) derinlik++;
    if (derinlik === 0) return kaynak.slice(ic, m.index).trim();
  }
  throw new Error(`Kapanmayan katman: ${id}`);
}

// Degrade kimlikleri sayfadaki başka SVG'lerle çakışmasın
const kimlikler = [...kaynak.matchAll(/<linearGradient id="([^"]+)"/g)].map((m) => m[1]);
const onekle = (t) => kimlikler.reduce((s, id) => s.replaceAll(`id="${id}"`, `id="m-${id}"`).replaceAll(`url(#${id})`, `url(#m-${id})`), t);
const sade = (t) => onekle(t).replace(/\n\s+/g, '\n');

const defs = sade(kaynak.match(/<defs>[\s\S]*?<\/defs>/)[0]);
const g = (sinif, ...idler) => `<g class="${sinif}">\n${idler.map((id) => sade(katman(id))).join('\n')}\n</g>`;

// Gözler ayrı grupta: göz kırpınca ve sevinince gizlenir, yerine kapalı / mutlu göz çizgisi gelir.
// Tasarımcının ağız katmanı (agiz) kullanılmaz: ağız konuşmaya göre kodla çizilir (mino.ts → agizYollari).
// Ek katmanlardaki (goz-kapali) çizgiler karakterin koyu kahve konturuna çekilir.
// Varsayılan ağız (mino.ts → agizYollari(0.72, 1) çıktısı): SVG canlandırılmadan kullanıldığında da (avatar) ağız görünsün
const AGIZ_IC = 'M951 992Q987 996 1024 966Q1061 996 1097 992Q1105 1067 1024 1080Q943 1067 951 992Z';
const AGIZ_DIL = 'M980 1072Q1024 1043 1068 1072Q1024 1080 980 1072Z';
const AGIZ_KENAR = 'M951 992Q933 974 915 952M1097 992Q1115 974 1133 952M1024 956V966';
const kapaliGoz =sade(katman('goz-kapali')).replaceAll('#030102', '#3a1210');

const svg = `<svg class="mino-svg" viewBox="344 140 1360 1790" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
${defs}
${g('q', 'kuyruk')}
${g('g', 'govde')}
${g('kl', 'kol-sol')}
${g('kr', 'kol-sag')}
${g('g', 'fular')}
<g class="k">
${sade(katman('kafa'))}
<g class="m-yanak"><ellipse cx="690" cy="995" rx="66" ry="34"/><ellipse cx="1358" cy="995" rx="66" ry="34"/></g>
<g class="m-goz">
${sade(katman('goz-sol'))}
${sade(katman('goz-sag'))}
</g>
<g class="m-kapali-goz">
${kapaliGoz}
</g>
<g class="m-mutlu-goz"><path d="M650 900Q768 796 886 900"/><path d="M1162 902Q1282 798 1402 902"/></g>
<g class="m-agiz"><path class="m-agiz-ic" d="${AGIZ_IC}"/><path class="m-dil" d="${AGIZ_DIL}"/><path class="m-agiz-cizgi" d="${AGIZ_IC}${AGIZ_KENAR}"/></g>
</g>
</svg>`;

fs.writeFileSync('src/mino/mino-svg.ts', `// Otomatik üretildi: node scripts/mino/rig.mjs (kaynak ${KAYNAK}) — elle düzenlemeyin.\nexport const MINO_SVG = ${JSON.stringify(svg)};\n`);
console.log('mino-svg.ts', Math.round(svg.length / 1024), 'KB');

// Durağan resim (açılıştaki "Mino ile oyna" düğmesi): diğer karakter görselleriyle aynı biçim, 512 kare şeffaf WebP
const resim = await sharp(Buffer.from(kaynak), { density: 72 }).trim({ threshold: 8 }).toBuffer();
await sharp(resim)
  .resize(464, 464, { fit: 'inside' })
  .extend({ top: 24, bottom: 24, left: 24, right: 24, background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .webp({ quality: 82, alphaQuality: 90, effort: 6 })
  .toFile('assets/karakter/mino.webp');
console.log('assets/karakter/mino.webp');
