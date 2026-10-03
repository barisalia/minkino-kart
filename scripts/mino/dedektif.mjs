// Dedektif Mino ekleri (ekip/mino/IFADELER.md "Dedektif Mino"): şapka ve büyüteç → src/mino/mino-dedektif-svg.ts
// Kaynak: ekip/mino/mino-final.svg içindeki gizli katmanlar sapka-dedektif, goz-buyutec, kol-buyutec
// (ekip/illustrator/dedektif-mino.cjs ile eklendi). Ağır (gömülü WebP, ~190 KB): mino.ts → dedektif() tembel yükler.
// rig.mjs'ten ayrı: ana Mino paketine ve öbür eklere dokunmaz. Tekrar çalıştırmak güvenli.
// Çalıştırma: node scripts/mino/dedektif.mjs
import fs from 'node:fs';

const KAYNAK = 'ekip/mino/mino-final.svg';
const kaynak = fs.readFileSync(KAYNAK, 'utf8').replace(/\r\n/g, '\n');

/** Bir katmanın içi (en dıştaki <g id> etiketi hariç); rig.mjs → katman() ile aynı */
function katman(id) {
  const bas = kaynak.indexOf(`<g id="${id}"`);
  if (bas < 0) throw new Error(`Katman yok: ${id}`);
  const ic = kaynak.indexOf('>', bas) + 1;
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

// kırpma yolu kimliği sayfadaki başka SVG'lerle çakışmasın (m- öneki, rig.mjs'teki gibi)
const sade = (t) => t.replaceAll('id="kol-buyutec-klip"', 'id="m-kol-buyutec-klip"').replaceAll('url(#kol-buyutec-klip)', 'url(#m-kol-buyutec-klip)').replace(/\n\s+/g, '\n');

const EKLER = {
  // kafaya bağlı, bütün katmanların en üstünde (gözlerin, ağzın, kulakların)
  sapka: `<g class="m-dedektif m-dedektif-sapka">${sade(katman('sapka-dedektif'))}</g>`,
  // büyütülmüş sol göz (cam dairesine kırpılı) + halka, sap, el, kol; kafaya bağlı (kafayla döner)
  buyutec: `<g class="m-dedektif m-dedektif-buyutec">${sade(katman('goz-buyutec'))}${sade(katman('kol-buyutec'))}</g>`,
};

fs.writeFileSync(
  'src/mino/mino-dedektif-svg.ts',
  `// Otomatik üretildi: node scripts/mino/dedektif.mjs (kaynak ${KAYNAK}) — elle düzenlemeyin.
// Dedektif Mino: şapka ve büyüteç (kafaya bağlı ekler); mino.ts → dedektif() tembel yükler (import()).
export const MINO_DEDEKTIF_SVG: Record<'sapka' | 'buyutec', string> = ${JSON.stringify(EKLER)};
`,
);
console.log('mino-dedektif-svg.ts', Math.round(JSON.stringify(EKLER).length / 1024), 'KB');
