/**
 * Kino'nun Otobüsü: YER TUTUCU kod çizimleri (Gemini çizimleri gelene kadar; hiçbiri mağazaya çıkmaz).
 * Sade, düz renkli, kalın sıcak kahve konturlu, tek küçük parlama: çocuk kitabı çizimlerinin yanında sırıtmasın diye.
 * Görsel dosyası gelince (assets/kino-otobus/<ad>.webp) bunlar kendiliğinden devreden çıkar (varliklar.ts).
 *
 * Ortak tuvaller (görsel dosyalarının yerleşimi de bu tuvallere göre: varliklar.ts → YERLESIM):
 * - top, sos-ust, serpinti-ust: viewBox "0 0 200 150" (top tuvalin altına oturur, sos ve serpinti topun kubbesine)
 * - kaplar ve eşyalar: viewBox "0 0 200 200" (taban çizgisi altta)
 */
import { SOS_RENK, TAT_RENK, type Sos, type Tat } from './model';

/** kontur rengi (sıcak koyu kahve, siyah değil) */
export const KONTUR = '#5A3423';
const K = KONTUR;
let kimlik = 0;
/** aynı çizim sayfada çok kez bulunur: kırpma yolları her seferinde yeni kimlik alır */
const yeniKimlik = () => `ko-k${++kimlik}`;
const svgAc = (vb: string, ic: string, sinif = '') => `<svg class="ko-yt ${sinif}" viewBox="${vb}" aria-hidden="true">${ic}</svg>`;

// ---------------------------------------------------------------- top (dondurma topu)
/** topun kubbesi ve fırfırlı alt kenarı (tuval 200×150; alt kenar y≈142) */
const TOP_YOL = 'M18 112C14 56 54 14 100 14C146 14 186 56 182 112Q174 132 158 120Q146 138 130 124Q116 142 100 126Q84 142 70 124Q54 138 42 120Q26 132 18 112Z';
export function topSvg(t: Tat): string {
  const r = TAT_RENK[t];
  const benek =
    t === 'cilek'
      ? `<ellipse cx="128" cy="64" rx="4" ry="6" fill="${r.koyu}"/><ellipse cx="84" cy="88" rx="4" ry="6" fill="${r.koyu}"/>`
      : t === 'vanilya'
        ? `<circle cx="120" cy="70" r="3" fill="#7A5A3A"/><circle cx="92" cy="92" r="3" fill="#7A5A3A"/><circle cx="140" cy="94" r="2.6" fill="#7A5A3A"/>`
        : t === 'fistik'
          ? `<circle cx="124" cy="66" r="4" fill="${r.koyu}"/><circle cx="90" cy="94" r="4" fill="${r.koyu}"/>`
          : t === 'yabanmersini'
            ? `<circle cx="126" cy="68" r="5" fill="${r.koyu}"/><circle cx="88" cy="92" r="4" fill="${r.koyu}"/>`
            : '';
  return svgAc(
    '0 0 200 150',
    `<path d="${TOP_YOL}" fill="${r.ana}" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>` +
      `<path d="M30 108Q100 92 170 108Q164 120 158 118Q146 134 130 120Q116 136 100 122Q84 136 70 120Q54 134 42 118Q34 122 30 108Z" fill="${r.koyu}" opacity=".35"/>` +
      benek +
      `<ellipse cx="66" cy="50" rx="18" ry="10" transform="rotate(-28 66 50)" fill="#fff" opacity=".7"/>`,
    'ko-yt-top',
  );
}

/** topun kubbesine oturan sos: kapak gibi, iki yanından damla sarkar (tuval top ile aynı) */
export function sosUstSvg(s: Sos): string {
  const r = SOS_RENK[s];
  return svgAc(
    '0 0 200 150',
    `<path d="M26 74C34 34 66 16 100 16C134 16 166 34 174 74C168 82 160 78 156 74C156 92 150 104 142 104C134 104 132 92 132 80C124 86 112 84 104 78C96 84 82 86 72 80C70 98 64 112 56 112C48 112 46 98 48 80C40 84 30 82 26 74Z" fill="${r.ana}" stroke="${K}" stroke-width="6" stroke-linejoin="round"/>` +
      `<ellipse cx="76" cy="38" rx="16" ry="7" transform="rotate(-20 76 38)" fill="#fff" opacity=".55"/>`,
    'ko-yt-sos-ust',
  );
}

/** serpinti: topun kubbesine dağılmış renkli taneler (tuval top ile aynı) */
export function serpintiUstSvg(): string {
  const renk = ['#FF5A7A', '#FFD84A', '#6CC4FF', '#7FE0C4', '#B98BFF', '#FF8A2B'];
  const yer = [
    [62, 40, 20],
    [92, 28, -30],
    [124, 34, 50],
    [148, 52, -10],
    [48, 66, 70],
    [80, 58, -60],
    [110, 54, 15],
    [138, 74, 80],
    [66, 86, -20],
    [100, 80, 40],
    [124, 96, -50],
    [158, 90, 10],
  ];
  return svgAc('0 0 200 150', yer.map(([x, y, a], i) => `<rect x="${x - 8}" y="${y - 3.5}" width="16" height="7" rx="3.5" fill="${renk[i % renk.length]}" stroke="${K}" stroke-width="2" transform="rotate(${a} ${x} ${y})"/>`).join(''), 'ko-yt-serpinti');
}

// ---------------------------------------------------------------- kaplar (tuval 200×200, ağzı üstte)
/** waffle külah: ağız y≈30 (topun oturduğu çizgi), ucu altta */
export function kulahSvg(): string {
  const c = yeniKimlik();
  return svgAc(
    '0 0 200 200',
    `<path d="M34 34L100 194L166 34Z" fill="#E9A84C" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>` +
      `<clipPath id="${c}"><path d="M34 34L100 194L166 34Z"/></clipPath><g clip-path="url(#${c})" stroke="#B9742A" stroke-width="5" opacity=".8"><path d="M20 60L150 200M20 100L130 210M40 30L180 170M80 30L190 140M120 30L200 110"/><path d="M180 60L50 200M180 100L70 210M160 30L20 170M120 30L10 140M80 30L0 110"/></g>` +
      `<rect x="26" y="22" width="148" height="22" rx="11" fill="#F2C06E" stroke="${K}" stroke-width="7"/>` +
      `<path d="M44 29H120" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55"/>`,
    'ko-yt-kap',
  );
}
/** kâğıt kâse: beyaz, buz mavisi çizgili, önde küçük pati izi */
export function kaseSvg(): string {
  const c = yeniKimlik();
  return svgAc(
    '0 0 200 200',
    `<path d="M14 70H186L160 182Q158 192 148 192H52Q42 192 40 182Z" fill="#FFFFFF" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>` +
      `<clipPath id="${c}"><path d="M14 70H186L160 182Q158 192 148 192H52Q42 192 40 182Z"/></clipPath><g clip-path="url(#${c})" fill="#8ED3F2"><path d="M30 70h20l10 130h-20z"/><path d="M80 70h18l2 130h-18z"/><path d="M128 70h18l-6 130h-18z"/><path d="M170 70h20l-14 130h-18z"/></g>` +
      `<path d="M14 70H186L160 182Q158 192 148 192H52Q42 192 40 182Z" fill="none" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>` +
      `<rect x="8" y="58" width="184" height="22" rx="11" fill="#fff" stroke="${K}" stroke-width="7"/>` +
      `<g fill="#9A5B3A"><ellipse cx="100" cy="146" rx="13" ry="11"/><circle cx="84" cy="128" r="5.5"/><circle cx="96" cy="122" r="5.5"/><circle cx="108" cy="122" r="5.5"/><circle cx="118" cy="130" r="5.5"/></g>`,
    'ko-yt-kap',
  );
}
/** büyük cam kupa: geniş ağız, kısa ayak, iki uzun kaşık */
export function kupaSvg(): string {
  return svgAc(
    '0 0 200 200',
    `<path d="M150 20L136 92" stroke="#C9D4DE" stroke-width="8" stroke-linecap="round"/><path d="M150 20L136 92" stroke="${K}" stroke-width="3" stroke-linecap="round" opacity=".5"/>` +
      `<path d="M50 14L66 92" stroke="#C9D4DE" stroke-width="8" stroke-linecap="round"/>` +
      `<path d="M8 60H192Q190 120 130 136H70Q10 120 8 60Z" fill="#DDF3FF" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>` +
      `<path d="M26 74Q40 112 76 122" stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none" opacity=".8"/>` +
      `<path d="M86 136H114V170H86Z" fill="#DDF3FF" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>` +
      `<path d="M48 192Q48 168 100 168Q152 168 152 192Z" fill="#DDF3FF" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>` +
      `<rect x="2" y="50" width="196" height="20" rx="10" fill="#EEF9FF" stroke="${K}" stroke-width="7"/>`,
    'ko-yt-kap',
  );
}

// ---------------------------------------------------------------- dolap ve raf eşyaları
/** dolaptaki tat kabı: yukarıdan hafif bakış, içi tat renginde, yüzeyde kepçe izi */
export function tatKabiSvg(t: Tat): string {
  const r = TAT_RENK[t];
  return svgAc(
    '0 0 200 200',
    `<path d="M22 70H178L166 178Q164 190 150 190H50Q36 190 34 178Z" fill="#FFF6E6" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>` +
      `<path d="M28 116H172L169 140H31Z" fill="#8ED3F2"/>` +
      `<ellipse cx="100" cy="70" rx="80" ry="30" fill="${r.ana}" stroke="${K}" stroke-width="7"/>` +
      `<path d="M66 70Q86 52 116 62Q132 68 122 80Q104 90 84 82" fill="none" stroke="${r.koyu}" stroke-width="7" stroke-linecap="round"/>` +
      `<ellipse cx="62" cy="60" rx="14" ry="6" fill="#fff" opacity=".6"/>` +
      `<circle cx="100" cy="128" r="11" fill="${r.ana}" stroke="${K}" stroke-width="4"/>`,
    'ko-yt-kab',
  );
}
/** sos şişesi: yumuşak sıkma şişe, krem kapak, önünde damla */
export function sosSiseSvg(s: Sos): string {
  const r = SOS_RENK[s];
  return svgAc(
    '0 0 200 200',
    `<path d="M92 6L108 6L104 30H96Z" fill="#FFF1D6" stroke="${K}" stroke-width="6" stroke-linejoin="round"/>` +
      `<rect x="70" y="26" width="60" height="30" rx="10" fill="#FFF1D6" stroke="${K}" stroke-width="7"/>` +
      `<path d="M62 56H138Q156 56 156 76V176Q156 194 138 194H62Q44 194 44 176V76Q44 56 62 56Z" fill="${r.ana}" stroke="${K}" stroke-width="7"/>` +
      `<path d="M100 98Q118 124 118 138A18 18 0 0 1 82 138Q82 124 100 98Z" fill="#FFF1D6" stroke="${K}" stroke-width="5"/>` +
      `<path d="M58 80V160" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".45"/>`,
    'ko-yt-sise',
  );
}
export function serpintiKavanozSvg(): string {
  const renk = ['#FF5A7A', '#FFD84A', '#6CC4FF', '#7FE0C4', '#B98BFF'];
  let t = '';
  for (let i = 0; i < 18; i++) {
    const x = 56 + ((i * 37) % 90);
    const y = 96 + ((i * 23) % 80);
    t += `<rect x="${x}" y="${y}" width="14" height="6" rx="3" fill="${renk[i % 5]}" transform="rotate(${(i * 47) % 180} ${x + 7} ${y + 3})"/>`;
  }
  return svgAc(
    '0 0 200 200',
    `<path d="M48 64H152Q170 64 170 84V174Q170 194 150 194H50Q30 194 30 174V84Q30 64 48 64Z" fill="#EEF9FF" stroke="${K}" stroke-width="7"/>` +
      t +
      `<rect x="40" y="34" width="120" height="34" rx="12" fill="#8ED3F2" stroke="${K}" stroke-width="7"/>` +
      `<g fill="${K}"><circle cx="76" cy="51" r="4"/><circle cx="100" cy="51" r="4"/><circle cx="124" cy="51" r="4"/></g>` +
      `<path d="M44 92V164" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".6"/>`,
    'ko-yt-kavanoz',
  );
}
/** tek kiraz: sapı ve küçük yaprağıyla */
export function kirazSvg(): string {
  return svgAc(
    '0 0 200 200',
    `<path d="M100 104Q104 50 136 18" fill="none" stroke="#5E9E3A" stroke-width="9" stroke-linecap="round"/>` +
      `<path d="M126 26Q150 6 172 20Q150 40 126 26Z" fill="#7CC556" stroke="${K}" stroke-width="5" stroke-linejoin="round"/>` +
      `<circle cx="100" cy="138" r="54" fill="#E8253F" stroke="${K}" stroke-width="7"/>` +
      `<ellipse cx="78" cy="118" rx="14" ry="9" transform="rotate(-30 78 118)" fill="#fff" opacity=".7"/>`,
    'ko-yt-sus',
  );
}
export function gofretSvg(): string {
  return svgAc(
    '0 0 200 200',
    `<g transform="rotate(-14 100 100)"><rect x="70" y="10" width="60" height="180" rx="12" fill="#E9A84C" stroke="${K}" stroke-width="7"/>` +
      `<path d="M74 40H126M74 70H126M74 100H126M74 130H126M74 160H126M90 14V186M110 14V186" stroke="#B9742A" stroke-width="5"/>` +
      `<rect x="70" y="10" width="60" height="180" rx="12" fill="none" stroke="${K}" stroke-width="7"/></g>`,
    'ko-yt-sus',
  );
}
export function semsiyeSvg(): string {
  return svgAc(
    '0 0 200 200',
    `<path d="M100 84V190" stroke="#C98B4E" stroke-width="9" stroke-linecap="round"/>` +
      `<path d="M14 92Q100 -10 186 92Q164 80 143 92Q122 78 100 92Q78 78 57 92Q36 80 14 92Z" fill="#FF8DB4" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>` +
      `<path d="M57 92Q70 40 100 18Q130 40 143 92Q122 78 100 92Q78 78 57 92Z" fill="#8ED3F2"/>` +
      `<path d="M14 92Q100 -10 186 92Q164 80 143 92Q122 78 100 92Q78 78 57 92Q36 80 14 92Z" fill="none" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>` +
      `<circle cx="100" cy="16" r="7" fill="#FFF1D6" stroke="${K}" stroke-width="4"/>`,
    'ko-yt-sus',
  );
}
export function kalpSekerSvg(): string {
  return svgAc(
    '0 0 200 200',
    `<path d="M100 178C40 134 14 104 14 70C14 40 38 20 64 20C82 20 94 30 100 44C106 30 118 20 136 20C162 20 186 40 186 70C186 104 160 134 100 178Z" fill="#FF6F9C" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>` +
      `<ellipse cx="62" cy="58" rx="18" ry="10" transform="rotate(-30 62 58)" fill="#fff" opacity=".7"/>`,
    'ko-yt-sus',
  );
}
export function mumSvg(sonuk = false): string {
  const c = yeniKimlik();
  const alev = sonuk
    ? `<path d="M100 40Q90 20 104 6" fill="none" stroke="#BFC6CC" stroke-width="6" stroke-linecap="round" opacity=".8"/>`
    : `<path d="M100 8Q124 40 112 58Q100 70 88 58Q76 40 100 8Z" fill="#FFC93C" stroke="${K}" stroke-width="5"/><path d="M100 30Q110 46 104 54Q96 58 94 50Q92 42 100 30Z" fill="#FFF3B0"/>`;
  return svgAc(
    '0 0 200 200',
    alev +
      `<path d="M100 60V72" stroke="${K}" stroke-width="4"/>` +
      `<rect x="80" y="70" width="40" height="124" rx="10" fill="#FFF" stroke="${K}" stroke-width="7"/>` +
      `<clipPath id="${c}"><rect x="80" y="70" width="40" height="124" rx="10"/></clipPath><g clip-path="url(#${c})" fill="#FF8DB4"><path d="M70 100L130 76V92L70 116Z"/><path d="M70 140L130 116V132L70 156Z"/><path d="M70 180L130 156V172L70 196Z"/></g>` +
      `<rect x="80" y="70" width="40" height="124" rx="10" fill="none" stroke="${K}" stroke-width="7"/>`,
    'ko-yt-sus',
  );
}
/** Kino'nun kepçesi */
export function kepceSvg(): string {
  return svgAc(
    '0 0 200 200',
    `<path d="M108 98L178 178" stroke="#8ED3F2" stroke-width="22" stroke-linecap="round"/><path d="M108 98L178 178" stroke="${K}" stroke-width="5" stroke-linecap="round" opacity=".4"/>` +
      `<path d="M30 70A48 48 0 0 1 126 70Q126 118 78 118Q30 118 30 70Z" fill="#DCE3EA" stroke="${K}" stroke-width="7"/>` +
      `<ellipse cx="62" cy="62" rx="14" ry="8" fill="#fff" opacity=".8"/>`,
    'ko-yt-kepce',
  );
}

// ---------------------------------------------------------------- otobüs ve süsleri
/**
 * Otobüs (yer tutucu): yandan, sağa bakar, buz mavisi gövde, kahve benekler, krem şerit, kapalı yan kapakta pati izi,
 * çatıda üç toplu külah, yuvarlak pencereler, iki büyük teker. Tuval 1600×900 (A1 görseliyle aynı oran; otobüs
 * ortada). Boya: CSS değişkenleri --boya, --boya-koyu. Süslerin yerleri: varliklar.ts → OTOBUS_YERI.
 */
export function otobusSvg(): string {
  return `<svg class="ko-yt ko-otobus-svg" viewBox="0 0 1600 900" aria-hidden="true">
  <ellipse cx="800" cy="806" rx="560" ry="26" fill="${K}" opacity=".14"/>
  <g class="ko-ob-cati-kulah">
    <path d="M760 250L800 350L840 250Z" fill="#E9A84C" stroke="${K}" stroke-width="10" stroke-linejoin="round"/>
    <circle cx="800" cy="160" r="34" fill="${TAT_RENK.cikolata.ana}" stroke="${K}" stroke-width="10"/>
    <circle cx="776" cy="208" r="36" fill="${TAT_RENK.cilek.ana}" stroke="${K}" stroke-width="10"/>
    <circle cx="826" cy="212" r="34" fill="${TAT_RENK.vanilya.ana}" stroke="${K}" stroke-width="10"/>
    <rect x="750" y="240" width="100" height="20" rx="10" fill="#F2C06E" stroke="${K}" stroke-width="9"/>
  </g>
  <path class="ko-ob-govde" d="M300 330Q300 300 330 300H1150Q1270 300 1310 420L1340 520Q1350 560 1350 600V700Q1350 730 1320 730H300Q270 730 270 700V360Q270 330 300 330Z" fill="var(--boya,#9FDCF5)" stroke="${K}" stroke-width="12" stroke-linejoin="round"/>
  <path d="M276 560H1346V610H276Z" fill="#FFF1D6"/>
  <path d="M300 330Q300 300 330 300H1150Q1270 300 1310 420L1340 520Q1350 560 1350 600V700Q1350 730 1320 730H300Q270 730 270 700V360Q270 330 300 330Z" fill="none" stroke="${K}" stroke-width="12" stroke-linejoin="round"/>
  <g fill="#8C5634" opacity=".75"><ellipse cx="360" cy="660" rx="34" ry="24"/><ellipse cx="1240" cy="380" rx="26" ry="20"/><ellipse cx="1290" cy="660" rx="30" ry="22"/><ellipse cx="420" cy="380" rx="22" ry="17"/></g>
  <rect class="ko-ob-kapak" x="430" y="350" width="640" height="190" rx="26" fill="var(--boya-koyu,#5FB4DC)" stroke="${K}" stroke-width="10"/>
  <g fill="#FFF1D6" stroke="${K}" stroke-width="6"><ellipse cx="750" cy="456" rx="34" ry="28"/><circle cx="716" cy="414" r="13"/><circle cx="740" cy="400" r="13"/><circle cx="764" cy="400" r="13"/><circle cx="786" cy="414" r="13"/></g>
  <path d="M1160 330H1210Q1260 330 1284 410L1300 470H1160Z" fill="#DDF3FF" stroke="${K}" stroke-width="10" stroke-linejoin="round"/>
  <circle cx="1328" cy="580" r="18" fill="#FFE45C" stroke="${K}" stroke-width="8"/>
  <g class="ko-ob-teker" style="transform-origin:470px 730px"><circle cx="470" cy="730" r="78" fill="#3E3A44" stroke="${K}" stroke-width="10"/><circle class="ko-ob-jant" cx="470" cy="730" r="34" fill="#FFF1D6" stroke="${K}" stroke-width="7"/></g>
  <g class="ko-ob-teker" style="transform-origin:1150px 730px"><circle cx="1150" cy="730" r="78" fill="#3E3A44" stroke="${K}" stroke-width="10"/><circle class="ko-ob-jant" cx="1150" cy="730" r="34" fill="#FFF1D6" stroke="${K}" stroke-width="7"/></g>
</svg>`;
}
/** Açık kapak: tente (çizgili) ve içindeki tezgâh ışığı (akşam ve giriş) */
export function tenteSvg(): string {
  const c = yeniKimlik();
  return svgAc(
    '0 0 640 120',
    `<path d="M10 10H630L600 100H40Z" fill="#fff" stroke="${K}" stroke-width="9" stroke-linejoin="round"/>` +
      `<clipPath id="${c}"><path d="M10 10H630L600 100H40Z"/></clipPath><g clip-path="url(#${c})" fill="var(--boya-koyu,#5FB4DC)"><path d="M10 0h70v120h-70z"/><path d="M150 0h70v120h-70z"/><path d="M290 0h70v120h-70z"/><path d="M430 0h70v120h-70z"/><path d="M570 0h70v120h-70z"/></g>` +
      `<path d="M10 10H630L600 100H40Z" fill="none" stroke="${K}" stroke-width="9" stroke-linejoin="round"/>` +
      `<path d="M40 100Q75 124 110 100Q145 124 180 100Q215 124 250 100Q285 124 320 100Q355 124 390 100Q425 124 460 100Q495 124 530 100Q565 124 600 100" fill="#fff" stroke="${K}" stroke-width="7"/>`,
    'ko-yt-tente',
  );
}
export function kemikTabelaSvg(): string {
  return svgAc(
    '0 0 400 200',
    `<path d="M150 6L130 50M250 6L270 50" stroke="#8B8F96" stroke-width="7"/>` +
      `<path d="M70 70A34 34 0 1 1 110 50H290A34 34 0 1 1 330 70A34 34 0 1 1 330 150A34 34 0 1 1 290 170H110A34 34 0 1 1 70 150A34 34 0 1 1 70 70Z" fill="#FFF1D6" stroke="${K}" stroke-width="9" stroke-linejoin="round"/>` +
      `<path d="M184 70L200 140L216 70Z" fill="#E9A84C" stroke="${K}" stroke-width="6" stroke-linejoin="round"/><circle cx="200" cy="64" r="18" fill="${TAT_RENK.cilek.ana}" stroke="${K}" stroke-width="6"/>`,
    'ko-yt-tabela',
  );
}
export function ampulSvg(): string {
  const renk = ['#FFE45C', '#FF8DB4', '#8ED3F2'];
  let a = '';
  for (let i = 0; i < 9; i++) {
    const x = 40 + i * 65;
    const y = 30 + Math.sin((i / 8) * Math.PI) * 40;
    a += `<path d="M${x} ${y}V${y + 14}" stroke="${K}" stroke-width="4"/><ellipse class="ko-ampul" style="--i:${i}" cx="${x}" cy="${y + 34}" rx="16" ry="22" fill="${renk[i % 3]}" stroke="${K}" stroke-width="5"/>`;
  }
  return svgAc('0 0 600 120', `<path d="M10 24Q300 104 590 24" fill="none" stroke="${K}" stroke-width="5"/>${a}`, 'ko-yt-ampul');
}
export function jantSvg(): string {
  return svgAc(
    '0 0 200 200',
    `<path d="M100 10L124 72L190 76L138 118L156 184L100 146L44 184L62 118L10 76L76 72Z" fill="#FFF1D6" stroke="${K}" stroke-width="9" stroke-linejoin="round"/><circle cx="100" cy="106" r="26" fill="#8ED3F2" stroke="${K}" stroke-width="7"/>`,
    'ko-yt-jant',
  );
}
export function catiKulahSvg(): string {
  return svgAc(
    '0 0 200 240',
    `<path d="M62 120L100 236L138 120Z" fill="#E9A84C" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>` +
      `<circle cx="100" cy="40" r="26" fill="${TAT_RENK.fistik.ana}" stroke="${K}" stroke-width="7"/>` +
      `<circle cx="78" cy="78" r="28" fill="${TAT_RENK.cilek.ana}" stroke="${K}" stroke-width="7"/><circle cx="124" cy="80" r="26" fill="${TAT_RENK.vanilya.ana}" stroke="${K}" stroke-width="7"/>` +
      `<circle cx="100" cy="14" r="10" fill="#E8253F" stroke="${K}" stroke-width="5"/>` +
      `<rect x="54" y="108" width="92" height="18" rx="9" fill="#F2C06E" stroke="${K}" stroke-width="6"/>` +
      `<g fill="#FFE45C" stroke="${K}" stroke-width="3"><circle class="ko-ampul" style="--i:0" cx="64" cy="117" r="6"/><circle class="ko-ampul" style="--i:1" cx="88" cy="117" r="6"/><circle class="ko-ampul" style="--i:2" cx="112" cy="117" r="6"/><circle class="ko-ampul" style="--i:3" cx="136" cy="117" r="6"/></g>`,
    'ko-yt-cati',
  );
}

// ---------------------------------------------------------------- Kino'nun kıyafeti (iskeletin 2048 tuvaline)
/**
 * Kino'ya şapka: kulakların arasına oturan ters külah biçimli yumuşak şapka (kafa katmanına eklenir; kafa dönünce o da
 * döner). Kino iskeletinde kulaklar y≈380, kafanın ortası x≈975 (assets/karakter-iskelet/kino.json → donme).
 */
export const KINO_SAPKA = `<g class="ko-kino-sapka"><path d="M820 330Q980 380 1140 330L1110 420Q980 450 850 420Z" fill="#9FDCF5" stroke="${K}" stroke-width="22" stroke-linejoin="round"/><path d="M860 334L980 120L1100 334Z" fill="#E9A84C" stroke="${K}" stroke-width="22" stroke-linejoin="round"/><circle cx="980" cy="130" r="70" fill="${TAT_RENK.cilek.ana}" stroke="${K}" stroke-width="20"/><ellipse cx="955" cy="105" rx="22" ry="13" fill="#fff" opacity=".7"/></g>`;
/** Kino'ya kiraz tepeli şapka (dükkân süsü): pembe dondurma topu biçiminde, tepesinde kiraz */
export const KINO_KIRAZ_SAPKA = `<g class="ko-kino-sapka ko-kino-kiraz"><path d="M800 380C800 220 880 170 980 170C1080 170 1160 220 1160 380Q1120 410 1090 384Q1060 414 1030 386Q1000 416 980 388Q950 416 920 386Q890 414 860 384Q830 410 800 380Z" fill="${TAT_RENK.cilek.ana}" stroke="${K}" stroke-width="22" stroke-linejoin="round"/><path d="M980 150Q990 90 1030 60" fill="none" stroke="#5E9E3A" stroke-width="18" stroke-linecap="round"/><circle cx="980" cy="150" r="52" fill="#E8253F" stroke="${K}" stroke-width="18"/><ellipse cx="900" cy="236" rx="30" ry="16" fill="#fff" opacity=".6"/></g>`;
/** Kino'ya önlük: gövdeye, fuların altına (buz mavisi, krem cep, cepte minik külah) */
export const KINO_ONLUK = `<g class="ko-kino-onluk"><path d="M820 1290Q1030 1250 1240 1290L1270 1700Q1030 1760 790 1700Z" fill="#9FDCF5" stroke="${K}" stroke-width="22" stroke-linejoin="round"/><rect x="930" y="1440" width="200" height="150" rx="34" fill="#FFF1D6" stroke="${K}" stroke-width="18"/><path d="M1005 1480L1030 1560L1055 1480Z" fill="#E9A84C" stroke="${K}" stroke-width="10" stroke-linejoin="round"/><circle cx="1030" cy="1478" r="24" fill="${TAT_RENK.cilek.ana}" stroke="${K}" stroke-width="10"/></g>`;

// ---------------------------------------------------------------- küçük simgeler
export const KALP = `<svg viewBox="0 0 40 36" aria-hidden="true"><path d="M20 34C8 25 2 19 2 11.5C2 6 6.5 2 11.5 2C15 2 18 4 20 7C22 4 25 2 28.5 2C33.5 2 38 6 38 11.5C38 19 32 25 20 34Z" fill="#FF5A7A" stroke="${K}" stroke-width="3" stroke-linejoin="round"/><ellipse cx="11" cy="10" rx="4" ry="2.5" fill="#fff" opacity=".7"/></svg>`;
export const KILIT = `<svg viewBox="0 0 40 44" aria-hidden="true"><path d="M11 20V13A9 9 0 0 1 29 13V20" fill="none" stroke="${K}" stroke-width="5"/><path d="M11 20V13A9 9 0 0 1 29 13V20" fill="none" stroke="#C9D4DE" stroke-width="2.4"/><rect x="5" y="19" width="30" height="22" rx="6" fill="#FFD23F" stroke="${K}" stroke-width="4"/><circle cx="20" cy="29" r="3.5" fill="${K}"/></svg>`;
/** buz yıldızı (boşluğa dokununca) */
export const BUZ_YILDIZ = `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 2V38M2 20H38M7 7L33 33M33 7L7 33" stroke="#BDE9FF" stroke-width="5" stroke-linecap="round"/><path d="M20 2V38M2 20H38M7 7L33 33M33 7L7 33" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`;
/** güneş (sıcak gün balonu) */
export const GUNES = `<svg viewBox="0 0 60 60" aria-hidden="true"><g stroke="#F5A623" stroke-width="5" stroke-linecap="round"><path d="M30 3V11M30 49V57M3 30H11M49 30H57M11 11L16 16M44 44L49 49M49 11L44 16M16 44L11 49"/></g><circle cx="30" cy="30" r="15" fill="#FFD23F" stroke="${K}" stroke-width="3.5"/></svg>`;
/** ter damlası (sıcak gün müşterisi) */
export const TER = `<svg viewBox="0 0 20 28" aria-hidden="true"><path d="M10 2Q18 14 18 19A8 8 0 0 1 2 19Q2 14 10 2Z" fill="#8ED3F2" stroke="${K}" stroke-width="2.5"/><ellipse cx="7" cy="18" rx="2" ry="3" fill="#fff" opacity=".8"/></svg>`;
/** "+" işareti (bir fazla balonu) */
export const ARTI = `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 6V34M6 20H34" stroke="${K}" stroke-width="11" stroke-linecap="round"/><path d="M20 6V34M6 20H34" stroke="#7FE0C4" stroke-width="5" stroke-linecap="round"/></svg>`;
/** "?" topu (örüntü balonu): kesik çizgili boş top */
export const SORU_TOPU = svgAc('0 0 200 150', `<path d="${TOP_YOL}" fill="#fff" stroke="${K}" stroke-width="6" stroke-dasharray="14 10" stroke-linejoin="round"/><text x="100" y="98" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="76" fill="${K}">?</text>`, 'ko-yt-top ko-soru-top');
/** ok (paylaşma balonu: kupadan kâselere) */
export const OK = `<svg viewBox="0 0 60 30" aria-hidden="true"><path d="M4 15H48M38 5L52 15L38 25" fill="none" stroke="${K}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// ---------------------------------------------------------------- külah yapma (Ek C yer tutucuları: makine, kapak, sürahi, hamur)
/** külah makinesinin altı: buz mavisi yuvarlak gövde, açık waffle plakası (önden hafif yukarıdan). Tuval 240×160 */
export function kulahMakinesiSvg(): string {
  const c = yeniKimlik();
  return svgAc(
    '0 0 240 160',
    `<path d="M24 82Q24 148 120 148Q216 148 216 82Z" fill="#9FDCF5" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>` +
      `<path d="M40 104Q60 132 120 134" stroke="#fff" stroke-width="6" stroke-linecap="round" fill="none" opacity=".5"/>` +
      `<ellipse cx="120" cy="82" rx="96" ry="40" fill="#5FB4DC" stroke="${K}" stroke-width="7"/>` +
      `<ellipse cx="120" cy="82" rx="76" ry="30" fill="#7A8794" stroke="${K}" stroke-width="5"/>` +
      `<clipPath id="${c}"><ellipse cx="120" cy="82" rx="76" ry="30"/></clipPath><g clip-path="url(#${c})" stroke="#56616B" stroke-width="4"><path d="M44 66H196M44 78H196M44 90H196M44 102H196"/><path d="M70 50V114M95 50V114M120 50V114M145 50V114M170 50V114"/></g>` +
      `<rect x="200" y="96" width="36" height="16" rx="8" fill="#FFF1D6" stroke="${K}" stroke-width="5"/>` +
      `<circle cx="120" cy="134" r="6" fill="#FF8DB4" stroke="${K}" stroke-width="3"/>`,
    'ko-yt-makine',
  );
}
/** külah makinesinin kapağı (kapalıyken plakanın üstüne oturur). Tuval 240×160 */
export function kulahMakinesiKapakSvg(): string {
  return svgAc(
    '0 0 240 160',
    `<path d="M24 86Q24 30 120 30Q216 30 216 86Q216 100 120 100Q24 100 24 86Z" fill="#9FDCF5" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>` +
      `<path d="M56 56Q84 40 120 40" stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none" opacity=".6"/>` +
      `<rect x="100" y="16" width="40" height="18" rx="9" fill="#FFF1D6" stroke="${K}" stroke-width="5"/>` +
      `<g fill="${K}" opacity=".8"><ellipse cx="120" cy="70" rx="9" ry="8"/><circle cx="108" cy="58" r="4"/><circle cx="116" cy="54" r="4"/><circle cx="124" cy="54" r="4"/><circle cx="132" cy="58" r="4"/></g>`,
    'ko-yt-makine-kapak',
  );
}
/** hamur sürahisi: krem sürahi, solda ağız, içi açık sarı hamur. Tuval 160×180 */
export function hamurSurahiSvg(): string {
  return svgAc(
    '0 0 160 180',
    `<path d="M120 60Q156 60 152 96Q148 126 118 126" fill="none" stroke="${K}" stroke-width="16" stroke-linecap="round"/><path d="M120 60Q156 60 152 96Q148 126 118 126" fill="none" stroke="#FFF1D6" stroke-width="7" stroke-linecap="round"/>` +
      `<path d="M30 30L10 44L32 52L32 158Q32 172 46 172H112Q126 172 126 158V30Z" fill="#FFF1D6" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>` +
      `<path d="M34 36H124V54Q100 60 78 54Q56 48 34 54Z" fill="#FFE29A" stroke="${K}" stroke-width="4"/>` +
      `<path d="M34 100H124" stroke="#8ED3F2" stroke-width="12"/><path d="M48 70V150" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".7"/>`,
    'ko-yt-surahi',
  );
}
/** pişmiş gofret: altın yuvarlak, kafes deseni (rulo yapılınca külah olur). Tuval 200×200 */
export function kulahHamuruSvg(): string {
  const c = yeniKimlik();
  return svgAc(
    '0 0 200 200',
    `<circle cx="100" cy="100" r="88" fill="#F2C06E" stroke="${K}" stroke-width="7"/>` +
      `<clipPath id="${c}"><circle cx="100" cy="100" r="80"/></clipPath><g clip-path="url(#${c})" stroke="#C98B4E" stroke-width="6" opacity=".85"><path d="M0 40L160 200M0 80L120 200M0 120L80 200M40 0L200 160M80 0L200 120M120 0L200 80"/><path d="M200 40L40 200M200 80L80 200M200 120L120 200M160 0L0 160M120 0L0 120M80 0L0 80"/></g>` +
      `<ellipse cx="66" cy="58" rx="18" ry="9" transform="rotate(-35 66 58)" fill="#fff" opacity=".5"/>`,
    'ko-yt-gofret-disk',
  );
}
