// Mino'nun vektör çiziminden canlandırılabilir SVG üretir → src/mino/mino-svg.ts
// Kaynak: tasarımcının katmanlı çizimi ekip/mino/mino-final.svg (katmanlar <g id="…">).
// Her katman bir sınıf alır ve CSS değişkenleriyle hareket eder:
//   q: kuyruk · g: gövde + fular · kl / kr: sol / sağ kol · k: kafa, gözler ve kodla çizilen ağız
// Eski çizim (karakter-kaynak/kedi-3.svg) path sınıflandırmasıyla kurulmuştu (sinifla.mjs, parcalar.json); artık gerekmez.
// Tembel yüklenen ekler: film ifadeleri → src/mino/mino-ifade-svg.ts, hâller (ıslak, pofuduk) → src/mino/mino-hal-svg.ts,
// burun ifadeleri (kaşıntı, burun tut, hapşu) → src/mino/mino-burun-svg.ts
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
const kapaliGoz = sade(katman('goz-kapali')).replaceAll('#030102', '#3a1210');
// Dudak senkronu ağızları (Adobe; gizli katmanlar agiz-kapali, agiz-az, agiz-orta, agiz-yuvarlak, agiz-dis, agiz-gulumse):
// altısı da çizimde varsa kafaya bağlı, gizli gruplar olarak eklenir; mino.ts konuşurken kod ağzı yerine bunları gösterir.
// Yoksa (bugün) hiçbir şey eklenmez, çıktı değişmez. (Eski agiz-kapali tek başına sayılmaz: altısı birlikte gelir.)
const AGIZ_SEKILLERI = ['kapali', 'az', 'orta', 'yuvarlak', 'dis', 'gulumse'];
const agizSekilVar = AGIZ_SEKILLERI.every((s) => kaynak.includes(`<g id="agiz-${s}"`));
const AGIZ_SEKIL = agizSekilVar
  ? AGIZ_SEKILLERI.map((s) => `<g class="m-agiz-sekil" data-sekil="${s}" style="display:none">${sade(katman(`agiz-${s}`))}</g>`).join('\n') + '\n'
  : '';
// Film ifadeleri (ekip/mino/IFADELER.md): gizli ekler kafaya bağlı, ağız ve gözlerin üstünde; mino.ts → ifade()
const ifade = (ad, ...idler) => `<g class="m-ifade m-${ad}">${idler.map((id) => sade(katman(id))).join('')}</g>`;
const IFADELER = [
  ifade('zorlanma', 'yanak-zorlanma', 'goz-zorlanma'),
  ifade('sersem', 'yanak-sersem', 'goz-sersem', 'agiz-sersem'),
  ifade('kararsiz', 'kas-kararsiz', 'agiz-kararsiz'),
  ifade('goz-kirp', 'goz-kirp'),
].join('\n');

// Hâl ekleri (ekip/mino/IFADELER.md, "Hâl ekleri"): sırılsıklam ve pofuduk; asıl grubun yerine, aynı z-sırasında.
// Asıl çizim <g class="m-asil" data-hal="…"> içinde, hâl çizimi yanındaki boş <g class="m-hal" data-yer="…"> yuvasına
// tembel yüklenir (mino-hal-svg.ts); mino.ts → hal(). data-hal: bu parçayı hangi hâllerin değiştirdiği.
const HAL_PARCA = {
  q: { asil: 'kuyruk', haller: { islak: 'kuyruk-islak', pofuduk: 'kuyruk-pofuduk' } },
  g: { asil: 'govde', haller: { islak: 'govde-islak', pofuduk: 'govde-pofuduk' } },
  kl: { asil: 'kol-sol', haller: { pofuduk: 'kol-sol-pofuduk' } },
  kr: { asil: 'kol-sag', haller: { pofuduk: 'kol-sag-pofuduk' } },
  k: { asil: 'kafa', haller: { islak: 'kafa-islak', pofuduk: 'kafa-pofuduk' } },
};
const asilHal = (yer) => {
  const p = HAL_PARCA[yer];
  return `<g class="m-asil" data-hal="${Object.keys(p.haller).join(' ')}">\n${sade(katman(p.asil))}\n</g>\n<g class="m-hal" data-yer="${yer}"></g>`;
};
const gHal = (yer) => `<g class="${yer}">\n${asilHal(yer)}\n</g>`;
const HALLER = Object.fromEntries(
  Object.entries(HAL_PARCA).map(([yer, p]) => [yer, Object.entries(p.haller).map(([hal, id]) => `<g class="m-hal-${hal}">${sade(katman(id))}</g>`).join('')]),
);

// Burun ekleri (ekip/mino/IFADELER.md, "Burun ekleri"; Ege 8. sahne): tam vektör, gizli. Ana çizimde yuvaları yok:
// mino.ts → burunEkle() dört parçayı yerine koyar (ana paket büyümesin):
//   kafa: k içinde asıl kafanın hemen üstüne (hâl ekleri gibi; hapşuda asıl kafa gizlenir), göz / ağız eklerinin altında
//   yuz:  k'nin sonuna (kafaya bağlı): göz, burun, ağız, yanak ekleri ve püf
//   kol:  kafanın ve fuların üstüne, gövdeye bağlı (omuzdan döner)
//   pati: en üste, kafaya bağlı (burnu kapatan patiler)
// Kırpma yolu kimlikleri (brn-…) sayfadaki başka SVG'lerle çakışmasın diye m- öneki alır.
const burun = (id) => sade(katman(id)).replaceAll('id="brn-', 'id="m-brn-').replaceAll('url(#brn-', 'url(#m-brn-');
const BURUN = {
  kafa: `<g class="m-burun-kafa">${burun('kafa-hapsu')}</g>`,
  yuz: [
    `<g class="m-ifade m-burun-kasinti">${burun('goz-kasinti')}<g class="m-burun-burun">${burun('burun-kasinti')}</g>${burun('agiz-kasinti')}</g>`,
    `<g class="m-ifade m-burun-tut"><g class="m-burun-yanak">${burun('yanak-burun-tut')}</g>${burun('goz-burun-tut')}</g>`,
    `<g class="m-ifade m-hapsu">${burun('goz-hapsu')}${burun('agiz-hapsu')}<g class="m-hapsu-puf">${burun('puf-hapsu')}</g></g>`,
  ].join(''),
  kol: `<g class="m-ifade m-burun-tut m-burun-kollar"><g class="m-burun-kol-sol">${burun('kol-sol-burun')}</g><g class="m-burun-kol-sag">${burun('kol-sag-burun')}</g></g>`,
  pati: `<g class="m-ifade m-burun-tut m-burun-pati">${burun('pati-burun')}</g>`,
};

const svg = `<svg class="mino-svg" viewBox="344 140 1360 1790" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
${defs}
${gHal('q')}
${gHal('g')}
${gHal('kl')}
${gHal('kr')}
${g('g', 'fular')}
<g class="k">
${asilHal('k')}
<g class="m-yanak"><ellipse cx="690" cy="995" rx="66" ry="34"/><ellipse cx="1358" cy="995" rx="66" ry="34"/></g>
<g class="m-goz">
<g class="m-goz-sol">${sade(katman('goz-sol'))}</g>
<g class="m-goz-sag">${sade(katman('goz-sag'))}</g>
</g>
<g class="m-kapali-goz">
${kapaliGoz}
</g>
<g class="m-mutlu-goz"><path d="M650 900Q768 796 886 900"/><path d="M1162 902Q1282 798 1402 902"/></g>
<g class="m-agiz"><path class="m-agiz-ic" d="${AGIZ_IC}"/><path class="m-dil" d="${AGIZ_DIL}"/><path class="m-agiz-cizgi" d="${AGIZ_IC}${AGIZ_KENAR}"/></g>
${AGIZ_SEKIL}<g class="m-ifadeler"></g>
</g>
</svg>`;

// İfade ekleri ağır (gömülü WebP): ayrı dosya, yalnız ifade() ilk çağrılınca (film) tembel yüklenir
fs.writeFileSync('src/mino/mino-ifade-svg.ts', `// Otomatik üretildi: node scripts/mino/rig.mjs (kaynak ${KAYNAK}) — elle düzenlemeyin.
// Mino'nun film ifadeleri; mino.ts tembel yükler (import()).
export const MINO_IFADE_SVG = ${JSON.stringify(IFADELER)};
`);
console.log('mino-ifade-svg.ts', Math.round(IFADELER.length / 1024), 'KB');
// Hâl ekleri de ağır (tam vektör, ~170 KB): ayrı dosya, yalnız hal() ilk çağrılınca (banyo) tembel yüklenir
fs.writeFileSync('src/mino/mino-hal-svg.ts', `// Otomatik üretildi: node scripts/mino/rig.mjs (kaynak ${KAYNAK}) — elle düzenlemeyin.
// Mino'nun hâlleri (sırılsıklam, pofuduk): yuva (q, g, kl, kr, k) → hâl grupları; mino.ts tembel yükler (import()).
export const MINO_HAL_SVG: Record<string, string> = ${JSON.stringify(HALLER)};
`);
console.log('mino-hal-svg.ts', Math.round(JSON.stringify(HALLER).length / 1024), 'KB');
// Burun ekleri (~40 KB): ayrı dosya, yalnız ifade('burun-kasinti' | 'burun-tut' | 'hapsu') ilk çağrılınca (Ege) tembel yüklenir
fs.writeFileSync('src/mino/mino-burun-svg.ts', `// Otomatik üretildi: node scripts/mino/rig.mjs (kaynak ${KAYNAK}) — elle düzenlemeyin.
// Mino'nun burun ifadeleri (kaşıntı, burun tut, hapşu): yuva (kafa, yuz, kol, pati) → ekler; mino.ts tembel yükler (import()).
export const MINO_BURUN_SVG: Record<'kafa' | 'yuz' | 'kol' | 'pati', string> = ${JSON.stringify(BURUN)};
`);
console.log('mino-burun-svg.ts', Math.round(JSON.stringify(BURUN).length / 1024), 'KB');
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
