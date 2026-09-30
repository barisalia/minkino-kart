/**
 * "Salıncak Kimin?" eşyaları: hepsi kodla çizilir (konturlu SVG). Stil: yuvarlak hatlar, kalın koyu kahve kontur,
 * düz renk + yumuşak gölge ve parlak beyaz vurgu (Gemini referansları: minkino-film-gemini/salincak/; biçim için
 * bakıldı, doğrudan kullanılmadı).
 *
 * Ölçü: her çizimin viewBox birimi 0.1 b (1 b = sahnenin ölçü birimi, --b). Böylece çizimin genişliği b cinsinden
 * viewBox genişliğinin onda biridir. Katmanlı eşyalar (salıncak, kaydırak, kum havuzu, bebek oturağı) arka ve ön
 * parça olarak ayrı çizilir; karakter arada durur.
 */

export const K = '#4a1c12';
const f = (n: number) => n.toFixed(1);

/** Kalın boru: kontur + gövde + yan gölge + parlak çizgi (uçlar yuvarlak) */
function boru(x1: number, y1: number, x2: number, y2: number, w: number, renk: [string, string, string], kontur = 12): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const L = Math.hypot(dx, dy) || 1;
  // sağ-alt yana gölge, sol-üst yana parlaklık (ışık soldan-yukarıdan)
  let nx = -dy / L;
  let ny = dx / L;
  if (nx + ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  const yol = (o: number) => `M${f(x1 + nx * o)} ${f(y1 + ny * o)}L${f(x2 + nx * o)} ${f(y2 + ny * o)}`;
  return (
    `<path d="${yol(0)}" stroke="${K}" stroke-width="${w + kontur}" stroke-linecap="round"/>` +
    `<path d="${yol(0)}" stroke="${renk[1]}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<path d="${yol(-w * 0.2)}" stroke="${renk[2]}" stroke-width="${f(w * 0.36)}" stroke-linecap="round"/>` +
    `<path d="${yol(w * 0.22)}" stroke="${renk[0]}" stroke-width="${f(w * 0.2)}" stroke-linecap="round" opacity=".9"/>`
  );
}

/** Parlak vurgu çizgisi */
const vurgu = (d: string, w: number, o = 0.75) => `<path d="${d}" fill="none" stroke="#fff" stroke-width="${w}" stroke-linecap="round" opacity="${o}"/>`;

// ---------------------------------------------------------------- salıncak çerçevesi (önden, A ayaklı)
/** Çerçeve ölçüsü (b): genişlik, yükseklik (zeminden barın üstüne), barın yüksekliği (merkez) */
export const CERCEVE = { w: 164, h: 47, bar: 44, eklem: 60, disAyak: 80, icAyak: 54.5 };
/** Oturakların asıldığı yer (b; çerçevenin ortasından): büyük salıncak solda, bebek oturağı sağda */
export const ASKI = { buyuk: -24, bebek: 24 };
/** Zincir uzunlukları (b; bardan oturağın üstüne) */
export const ZINCIR = { buyuk: 35.5, bebek: 28 };
/** Oturaklar (b) */
export const OTURAK = { w: 26, h: 6, zincirAra: 21 };
export const KOVA = { w: 16, h: 14, zincirAra: 11.6 };

const KIRMIZI: [string, string, string] = ['#ff9a87', '#ea4b3f', '#b8302a'];
const GRI: [string, string, string] = ['#f4f6f9', '#b9c0ca', '#7d8591'];

/** Çerçevenin arka parçası: ayaklar, bar, çapraz destekler, ayak gölgeleri (viewBox birimi 0.1 b; zemin y = 0) */
export function cerceveSvg(): string {
  const { eklem, disAyak, icAyak, bar } = CERCEVE;
  const E = eklem * 10;
  const D = disAyak * 10;
  const I = icAyak * 10;
  const B = -bar * 10;
  const capY = -150;
  const disX = E + (D - E) * ((B - capY) / B);
  const icX = E + (I - E) * ((B - capY) / B);
  let s = '';
  // ayak gölgeleri (temas)
  for (const x of [-D, -I, I, D]) s += `<ellipse cx="${x}" cy="4" rx="46" ry="11" fill="rgba(52,70,20,.28)"/>`;
  for (const yon of [-1, 1]) s += boru(yon * E, B, yon * I, 0, 28, KIRMIZI);
  s += boru(-E - 20, B, E + 20, B, 34, KIRMIZI, 13);
  for (const yon of [-1, 1]) {
    s += boru(yon * E, B, yon * D, 0, 30, KIRMIZI);
    s += boru(yon * icX, capY, yon * disX, capY, 20, KIRMIZI, 11);
  }
  // eklem topları
  for (const yon of [-1, 1])
    s += `<circle cx="${yon * (E + 14)}" cy="${B}" r="31" fill="${KIRMIZI[1]}" stroke="${K}" stroke-width="11"/><circle cx="${yon * (E + 14) - 10}" cy="${B - 10}" r="9" fill="#fff" opacity=".8"/>`;
  return `<svg viewBox="${-D - 30} ${B - 45} ${2 * D + 60} ${-B + 60}" aria-hidden="true">${s}</svg>`;
}
/** Çerçeve SVG'sinin kutusu (b): genişlik, yükseklik ve zeminin altında kalan pay */
export const CERCEVE_KUTU = { w: 2 * CERCEVE.disAyak + 6, h: CERCEVE.bar + 6, alt: 1.5 };

/** Zincir kelepçesi (barın önünde; zincirin tepesini örter) */
export function kelepceSvg(): string {
  return `<svg viewBox="-20 -34 40 68" aria-hidden="true"><rect x="-14" y="-28" width="28" height="56" rx="9" fill="${GRI[1]}" stroke="${K}" stroke-width="7"/><path d="M-6 -20V20" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/></svg>`;
}

/** Zincir (dikey; uzunluk b): baklalar sırayla önden (halka) ve yandan (çubuk); tepede kanca */
export function zincirSvg(boy: number): string {
  const H = boy * 10;
  const adim = 17;
  let s = '';
  const n = Math.floor((H - 14) / adim);
  for (let i = 0; i < n; i++) {
    const y = 14 + i * adim + adim / 2;
    if (i % 2 === 0) {
      s += `<ellipse cx="0" cy="${y}" rx="6.5" ry="10.5" fill="none" stroke="${K}" stroke-width="6.5"/><ellipse cx="0" cy="${y}" rx="6.5" ry="10.5" fill="none" stroke="${GRI[1]}" stroke-width="3"/><path d="M-3 ${y - 6}q-2 5 0 10" stroke="#fff" stroke-width="1.8" fill="none" opacity=".8"/>`;
    } else {
      s += `<rect x="-2.6" y="${y - 10}" width="5.2" height="20" rx="2.6" fill="${GRI[1]}" stroke="${K}" stroke-width="3"/>`;
    }
  }
  s = `<path d="M0 0 V16" stroke="${K}" stroke-width="7" stroke-linecap="round"/><path d="M0 1 V15" stroke="${GRI[2]}" stroke-width="3" stroke-linecap="round"/>` + s;
  return `<svg viewBox="-10 0 20 ${H}" preserveAspectRatio="none" aria-hidden="true">${s}</svg>`;
}

/** Büyük salıncağın ahşap oturağı (0.1 b; zincir halkaları iki uçta, 21 b arayla) */
export function oturakSvg(): string {
  const w = OTURAK.w * 10;
  return `<svg viewBox="0 -4 ${w} ${OTURAK.h * 10 + 8}" aria-hidden="true">
    <path d="M22 18 Q12 17 16 10 L30 2 H${w - 30} L${w - 16} 10 Q${w - 12} 17 ${w - 22} 18 Z" fill="#eaa566" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>
    <rect x="6" y="14" width="${w - 12}" height="38" rx="17" fill="#c9733a" stroke="${K}" stroke-width="8"/>
    <path d="M26 30 Q70 24 118 31 T210 30 M36 42 Q90 38 150 43" fill="none" stroke="#a45a2a" stroke-width="3.5" stroke-linecap="round"/>
    ${vurgu(`M28 21 H${w - 60}`, 4, 0.55)}
    <circle cx="25" cy="8" r="6.5" fill="${GRI[1]}" stroke="${K}" stroke-width="4"/><circle cx="${w - 25}" cy="8" r="6.5" fill="${GRI[1]}" stroke="${K}" stroke-width="4"/>
  </svg>`;
}

/** Bebek oturağının arka parçası (sırtlık; Ege'nin arkasında) */
export function kovaArkaSvg(): string {
  return `<svg viewBox="0 0 160 140" aria-hidden="true">
    <path d="M20 86 Q14 16 44 8 H116 Q146 16 140 86 Z" fill="#f2b21c" stroke="${K}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M36 80 Q32 28 54 22 H106 Q128 28 124 80 Z" fill="#ffd54a"/>
    ${vurgu('M48 30 Q46 50 48 66', 6, 0.6)}
    <circle cx="22" cy="54" r="6" fill="${GRI[1]}" stroke="${K}" stroke-width="4"/><circle cx="138" cy="54" r="6" fill="${GRI[1]}" stroke="${K}" stroke-width="4"/>
  </svg>`;
}
/** Bebek oturağının ön parçası (bacak delikli T; Ege'nin önünde) */
export function kovaOnSvg(): string {
  return `<svg viewBox="0 0 160 140" aria-hidden="true">
    <path fill-rule="evenodd" d="M16 76 Q12 64 26 62 H134 Q148 64 144 76 L140 118 Q136 136 116 136 H44 Q24 136 20 118 Z M34 96 Q36 82 52 82 H64 Q72 84 72 96 L70 110 Q66 120 52 120 Q36 118 34 106 Z M126 96 Q124 82 108 82 H96 Q88 84 88 96 L90 110 Q94 120 108 120 Q124 118 126 106 Z" fill="#ffcc2a" stroke="${K}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M24 66 H136" stroke="#ffe27a" stroke-width="7" stroke-linecap="round"/>
    ${vurgu('M30 72 H70', 5, 0.7)}
  </svg>`;
}

// ---------------------------------------------------------------- kaydırak (yandan: merdiven solda, kayma yolu sağa iner)
export const KAYDIRAK = { w: 72, h: 50 };
/** Kayma yolunun orta çizgisi (0.1 b; zemin y=500): kübik Bezier + düz çıkış */
export const KAYMA_YOLU = { p0: [218, 142], c1: [345, 150], c2: [420, 452], p3: [585, 452], son: [690, 452] } as const;
/** Merdivenin alt ve üst ucu (Kino tırmanır; 0.1 b) */
export const MERDIVEN = { alt: [118, 498], ust: [196, 142] } as const;

const MAVI: [string, string, string] = ['#9fd3ff', '#3f97ef', '#2366b5'];
const yolD = (dy = 0) => {
  const { p0, c1, c2, p3, son } = KAYMA_YOLU;
  return `M${p0[0]} ${p0[1] + dy}C${c1[0]} ${c1[1] + dy} ${c2[0]} ${c2[1] + dy} ${p3[0]} ${p3[1] + dy}L${son[0]} ${son[1] + dy}`;
};

/** Kayma yolunda t (0..1) noktası ve eğimi (derece), 0.1 b birimi */
export function kaymaNoktasi(t: number): { x: number; y: number; aci: number } {
  const { p0, c1, c2, p3, son } = KAYMA_YOLU;
  // yolun %85'i eğri, gerisi düz çıkış
  const E = 0.85;
  if (t >= E) {
    const u = (t - E) / (1 - E);
    return { x: p3[0] + (son[0] - p3[0]) * u, y: p3[1], aci: 0 };
  }
  const u = t / E;
  const a = 1 - u;
  const x = a * a * a * p0[0] + 3 * a * a * u * c1[0] + 3 * a * u * u * c2[0] + u * u * u * p3[0];
  const y = a * a * a * p0[1] + 3 * a * a * u * c1[1] + 3 * a * u * u * c2[1] + u * u * u * p3[1];
  const dx = 3 * a * a * (c1[0] - p0[0]) + 6 * a * u * (c2[0] - c1[0]) + 3 * u * u * (p3[0] - c2[0]);
  const dy = 3 * a * a * (c1[1] - p0[1]) + 6 * a * u * (c2[1] - c1[1]) + 3 * u * u * (p3[1] - c2[1]);
  return { x, y, aci: (Math.atan2(dy, dx) * 180) / Math.PI };
}

/** Kaydırağın arka parçası: merdiven, üst korkuluk, arka kenar, kayma yatağı, destek ayakları */
export function kaydirakArkaSvg(): string {
  let s = '';
  // gölge
  s += `<ellipse cx="400" cy="498" rx="330" ry="14" fill="rgba(52,70,20,.25)"/>`;
  // destek ayağı (kayma yolunun ortasının altında)
  s += boru(470, 380, 470, 496, 16, MAVI, 10);
  s += boru(600, 470, 600, 496, 14, MAVI, 10);
  // merdiven: iki ray + basamaklar
  const [ax, ay] = MERDIVEN.alt;
  const [ux, uy] = MERDIVEN.ust;
  for (let i = 1; i <= 6; i++) {
    const t = i / 7;
    const x = ax + (ux - ax) * t;
    const y = ay + (uy - ay) * t;
    s += boru(x - 34, y, x + 46, y, 13, MAVI, 9);
  }
  s += boru(ax - 40, ay, ux - 40, uy - 50, 17, MAVI, 11);
  s += boru(ax + 48, ay, ux + 48, uy - 50, 17, MAVI, 11);
  // üst korkuluk (tepe)
  s += boru(ux - 40, uy - 50, ux - 40, uy - 100, 15, MAVI, 10);
  s += boru(ux - 40, uy - 100, ux + 48, uy - 100, 15, MAVI, 10);
  s += boru(ux + 48, uy - 100, ux + 48, uy - 50, 15, MAVI, 10);
  // tepe platformu
  s += `<rect x="${ux - 52}" y="${uy - 14}" width="118" height="26" rx="10" fill="#3f97ef" stroke="${K}" stroke-width="8"/>`;
  // kayma yatağı: arka kenar (mavi), yatak (sarı), iç gölge, parlaklık
  s += `<path d="${yolD(-40)}" fill="none" stroke="${K}" stroke-width="26" stroke-linecap="round"/><path d="${yolD(-40)}" fill="none" stroke="${MAVI[1]}" stroke-width="15" stroke-linecap="round"/>`;
  s += `<path d="${yolD(-6)}" fill="none" stroke="${K}" stroke-width="72" stroke-linecap="round"/>`;
  s += `<path d="${yolD(-6)}" fill="none" stroke="#f4b21c" stroke-width="58" stroke-linecap="round"/>`;
  s += `<path d="${yolD(-14)}" fill="none" stroke="#ffd84a" stroke-width="30" stroke-linecap="round"/>`;
  s += `<path d="${yolD(-20)}" fill="none" stroke="#fff6c0" stroke-width="6" stroke-linecap="round" stroke-dasharray="60 40" opacity=".9"/>`;
  return `<svg viewBox="0 0 ${KAYDIRAK.w * 10} ${KAYDIRAK.h * 10}" overflow="visible" aria-hidden="true">${s}</svg>`;
}
/** Kaydırağın ön kenarı (Kino'nun önünde) */
export function kaydirakOnSvg(): string {
  return `<svg viewBox="0 0 ${KAYDIRAK.w * 10} ${KAYDIRAK.h * 10}" overflow="visible" aria-hidden="true">
    <path d="${yolD(24)}" fill="none" stroke="${K}" stroke-width="28" stroke-linecap="round"/>
    <path d="${yolD(24)}" fill="none" stroke="${MAVI[1]}" stroke-width="17" stroke-linecap="round"/>
    <path d="${yolD(20)}" fill="none" stroke="${MAVI[0]}" stroke-width="5" stroke-linecap="round" opacity=".9"/>
  </svg>`;
}

// ---------------------------------------------------------------- kum havuzu (önden, hafif yukarıdan)
export const KUM = { w: 46, h: 17 };
/** Kum havuzunun arka parçası: arka duvar ve kum yüzeyi (kova ve kürek) */
export function kumArkaSvg(): string {
  const noktalar = [[120, 70], [170, 92], [240, 64], [300, 88], [350, 70], [200, 110], [280, 112], [140, 104]]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#d9a94a"/>`)
    .join('');
  return `<svg viewBox="0 0 460 170" aria-hidden="true">
    <ellipse cx="230" cy="162" rx="226" ry="12" fill="rgba(52,70,20,.25)"/>
    <path d="M14 92 Q14 30 230 26 Q446 30 446 92 Z" fill="#c9773c" stroke="${K}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M34 92 Q40 48 230 46 Q420 48 426 92 Z" fill="#a85a2a"/>
    <path d="M38 96 Q44 56 230 54 Q416 56 422 96 Q420 120 230 124 Q40 120 38 96 Z" fill="#f4d27c" stroke="${K}" stroke-width="6"/>
    <path d="M90 80 Q130 70 170 80 M280 74 Q320 66 360 78" fill="none" stroke="#e2b458" stroke-width="5" stroke-linecap="round"/>
    ${noktalar}
    <g transform="translate(330 50) rotate(18)"><path d="M0 0 L8 44 H26 L34 0 Z" fill="#ef4a43" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><ellipse cx="17" cy="0" rx="17" ry="5" fill="#b8302a" stroke="${K}" stroke-width="4"/><path d="M-2 4 Q17 -26 36 4" fill="none" stroke="${K}" stroke-width="3.5"/></g>
  </svg>`;
}
/** Kum havuzunun ön duvarı (içindekinin önünde) */
export function kumOnSvg(): string {
  let tahta = '';
  for (let x = 70; x < 430; x += 58) tahta += `<path d="M${x} 110 V164" stroke="#a35a2c" stroke-width="4"/>`;
  return `<svg viewBox="0 0 460 170" aria-hidden="true">
    <path d="M10 96 Q14 124 230 128 Q446 124 450 96 L450 142 Q446 168 230 168 Q14 168 10 142 Z" fill="#cf7d40" stroke="${K}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M12 96 Q16 118 230 122 Q444 118 448 96 Q446 108 230 112 Q14 108 12 96 Z" fill="#eaa062" stroke="${K}" stroke-width="5"/>
    ${tahta}
    ${vurgu('M40 116 Q120 126 200 128', 5, 0.5)}
  </svg>`;
}
/** Kum yığını: gömülen Kino'nun kuyruğu dışarıda (sallanan grup: .sl-kuyruk), yanında bir kulak ucu */
export function kumYiginSvg(): string {
  return `<svg viewBox="0 0 300 170" overflow="visible" aria-hidden="true">
    <g class="sl-yigin-kulak"><path d="M66 104 Q52 70 80 62 Q108 60 112 96 Z" fill="#7a4a2a" stroke="${K}" stroke-width="7" stroke-linejoin="round"/></g>
    <g class="sl-kuyruk"><path d="M150 96 Q140 40 156 14 Q168 0 176 12 Q170 44 168 96 Z" fill="#f4e7d4" stroke="${K}" stroke-width="7" stroke-linejoin="round"/><path d="M156 14 Q168 0 176 12 Q174 26 170 34 Q160 28 154 30 Q152 20 156 14 Z" fill="#7a4a2a"/></g>
    <path d="M14 160 Q30 104 90 90 Q150 70 210 88 Q272 104 290 160 Z" fill="#f2d07a" stroke="${K}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M60 128 Q90 116 120 128 M170 120 Q200 110 230 122" fill="none" stroke="#dcae54" stroke-width="5" stroke-linecap="round"/>
    <circle cx="100" cy="146" r="4" fill="#d9a94a"/><circle cx="200" cy="140" r="4" fill="#d9a94a"/><circle cx="150" cy="108" r="3.5" fill="#d9a94a"/>
    ${vurgu('M84 104 Q120 88 150 90', 6, 0.55)}
  </svg>`;
}

// ---------------------------------------------------------------- bank (önden)
export const BANK = { w: 66, h: 32, oturak: 16.5 };
export function bankSvg(): string {
  let citalar = '';
  for (let i = 0; i < 3; i++) {
    const y = 26 + i * 42;
    citalar += `<rect x="70" y="${y}" width="520" height="34" rx="14" fill="#d98543" stroke="${K}" stroke-width="7"/><path d="M96 ${y + 12} H300 M380 ${y + 20} H560" stroke="#b8672f" stroke-width="3.5" stroke-linecap="round"/>${vurgu(`M92 ${y + 8} H200`, 4, 0.55)}`;
  }
  const yan = (yon: 1 | -1) => {
    const x = yon === 1 ? 596 : 64;
    return `<path d="M${x} 12 Q${x + yon * 18} 12 ${x + yon * 16} 40 L${x + yon * 12} 150 Q${x + yon * 56} 150 ${x + yon * 58} 192 Q${x + yon * 58} 214 ${x + yon * 30} 214" fill="none" stroke="${K}" stroke-width="27" stroke-linecap="round" stroke-linejoin="round"/><path d="M${x} 12 Q${x + yon * 18} 12 ${x + yon * 16} 40 L${x + yon * 12} 150 Q${x + yon * 56} 150 ${x + yon * 58} 192 Q${x + yon * 58} 214 ${x + yon * 30} 214" fill="none" stroke="#5fae4a" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>`;
  };
  const ayak = (x: number, yon: 1 | -1) =>
    `<path d="M${x} 206 Q${x + yon * 6} 270 ${x - yon * 10} 318 L${x + yon * 26} 318 Q${x + yon * 36} 262 ${x + yon * 34} 206 Z" fill="#c9733a" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>`;
  return `<svg viewBox="0 0 660 330" aria-hidden="true">
    <ellipse cx="330" cy="322" rx="300" ry="12" fill="rgba(52,70,20,.28)"/>
    ${ayak(118, -1)}${ayak(520, 1)}${ayak(160, 1)}${ayak(478, -1)}
    ${citalar}
    ${yan(-1)}${yan(1)}
    <path d="M40 166 H620 L604 196 H56 Z" fill="#e89a58" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>
    <rect x="44" y="190" width="572" height="30" rx="12" fill="#c46c34" stroke="${K}" stroke-width="7"/>
    ${vurgu('M70 176 H300', 5, 0.6)}
  </svg>`;
}

// ---------------------------------------------------------------- çayır (önde, kodla)
/**
 * Çayır yükseltisi: dünyanın altından yumuşak bir tepe çizgisine kadar (kenarlarda yüksek: ağaçların dibi ve çizili
 * eşyalar arkasında kalır; ortada alçak: uzaktaki tepeler görünür). viewBox dünyanın b ölçüsü (en × boy), y aşağı.
 * Tepe çizgisi (u: ortadan b, v: alttan b) Catmull-Rom ile yumuşatılır; koyu yeşil kontur ve açık yeşil parlaklık.
 */
export const CAYIR_TEPE: [number, number][] = [
  [-212, 160], [-160, 159], [-112, 155], [-80, 140], [-48, 121], [-4, 113], [40, 116], [72, 131], [100, 147], [148, 153], [212, 158],
];
/** Çayırın tepe çizgisinin u noktasındaki yüksekliği (b; doğrusal ara değer) */
export function cayirTepe(u: number): number {
  const t = CAYIR_TEPE;
  if (u <= t[0][0]) return t[0][1];
  for (let i = 1; i < t.length; i++) if (u <= t[i][0]) return t[i - 1][1] + ((t[i][1] - t[i - 1][1]) * (u - t[i - 1][0])) / (t[i][0] - t[i - 1][0]);
  return t[t.length - 1][1];
}
export function cayirSvg(en: number, boy: number, altPay = 0): string {
  const p = CAYIR_TEPE.map(([u, v]) => [u + en / 2, boy - v - altPay] as [number, number]);
  let d = `M${f(p[0][0])} ${f(p[0][1])}`;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[Math.max(0, i - 1)];
    const b = p[i];
    const c = p[i + 1];
    const e = p[Math.min(p.length - 1, i + 2)];
    d += `C${f(b[0] + (c[0] - a[0]) / 6)} ${f(b[1] + (c[1] - a[1]) / 6)} ${f(c[0] - (e[0] - b[0]) / 6)} ${f(c[1] - (e[1] - b[1]) / 6)} ${f(c[0])} ${f(c[1])}`;
  }
  const alan = `${d}L${en + 20} ${boy + 5}L-20 ${boy + 5}Z`;
  return `<svg viewBox="0 0 ${en} ${boy}" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="slCayir" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b3dc52"/><stop offset=".45" stop-color="#a5d446"/><stop offset=".8" stop-color="#97c93f"/><stop offset="1" stop-color="#8cc03a"/></linearGradient></defs>
    <path d="${alan}" fill="url(#slCayir)"/>
    <path d="${d}" transform="translate(0 2.2)" fill="none" stroke="#c9ea72" stroke-width="1.6" stroke-linecap="round" opacity=".75"/>
    <path d="${d}" fill="none" stroke="#4e7d25" stroke-width="0.9" stroke-linecap="round"/>
  </svg>`;
}

// ---------------------------------------------------------------- zemin süsleri, bekleme çizgisi, fular
/** Sarı bekleme çizgisi (yerde, perspektifle yassı) */
export function beklemeCizgisiSvg(): string {
  let s = '';
  for (let i = 0; i < 9; i++) {
    const x = 20 + i * 70;
    s += `<path d="M${x} 16 L${x + 48} 16 L${x + 44} 30 L${x - 4} 30 Z" fill="#ffd23a" stroke="#8a5a14" stroke-width="3" stroke-linejoin="round"/>`;
  }
  return `<svg viewBox="0 0 660 40" aria-hidden="true">${s}</svg>`;
}

/** Çimen tutamı, çiçek ve çakıl (ön zemin süsleri); tur 0..3 */
export function cimenSvg(tur: number): string {
  if (tur === 0)
    return `<svg viewBox="0 0 60 40" aria-hidden="true"><path d="M6 40 Q10 18 4 4 Q18 16 20 40 M20 40 Q24 10 30 0 Q34 18 32 40 M32 40 Q40 16 54 8 Q44 24 44 40 Z" fill="#6cb43a" stroke="#3f7a22" stroke-width="3" stroke-linejoin="round"/></svg>`;
  if (tur === 1)
    return `<svg viewBox="0 0 40 50" aria-hidden="true"><path d="M20 50 V22" stroke="#3f7a22" stroke-width="4"/><path d="M20 36 Q8 30 6 20 Q16 22 20 32" fill="#6cb43a" stroke="#3f7a22" stroke-width="2.5"/>${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="20" cy="10" rx="6" ry="9" fill="#fff" stroke="${K}" stroke-width="2.4" transform="rotate(${a} 20 18)"/>`).join('')}<circle cx="20" cy="18" r="5.5" fill="#ffc93a" stroke="${K}" stroke-width="2.4"/></svg>`;
  if (tur === 2)
    return `<svg viewBox="0 0 40 50" aria-hidden="true"><path d="M20 50 V22" stroke="#3f7a22" stroke-width="4"/><path d="M20 38 Q32 32 34 22 Q24 24 20 34" fill="#6cb43a" stroke="#3f7a22" stroke-width="2.5"/><path d="M10 10 Q20 -2 30 10 L28 22 Q20 28 12 22 Z" fill="#ff5f6e" stroke="${K}" stroke-width="2.6" stroke-linejoin="round"/><path d="M15 10 L20 18 L25 10" fill="none" stroke="#c8303f" stroke-width="2.2"/></svg>`;
  return `<svg viewBox="0 0 60 26" aria-hidden="true"><ellipse cx="22" cy="17" rx="18" ry="8" fill="#b8b1a6" stroke="#6b5f55" stroke-width="3"/><ellipse cx="44" cy="19" rx="11" ry="6" fill="#cfc8bd" stroke="#6b5f55" stroke-width="3"/><path d="M12 14 Q18 11 26 12" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".7"/></svg>`;
}

/** Can'ın asık yüzü: ağzın yerine ters kavis (kafa katmanına eklenir; Can iskeletinin ağız noktası 1020,885) */
export const CAN_ASIK_AGIZ = `<path d="M968 912 Q1020 872 1072 912" fill="none" stroke="#5a2418" stroke-width="15" stroke-linecap="round"/>`;
/** Kalkık kaşlar (üzgün): iki kısa eğik çizgi */
export const CAN_UZGUN_KAS = `<path d="M880 648 Q910 628 944 636 M1096 636 Q1130 628 1160 648" fill="none" stroke="#3b2418" stroke-width="16" stroke-linecap="round"/>`;

/** Sayı rozeti için yıldız */
export const YILDIZ_SVG = `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 3 L25 14 L37 15 L28 23 L31 35 L20 29 L9 35 L12 23 L3 15 L15 14 Z" fill="#ffd23a" stroke="${K}" stroke-width="3" stroke-linejoin="round"/></svg>`;

/** Kart için küçük salıncak (açılıştaki bölüm kartı): çerçeve + oturak */
export function kartSalincakSvg(): string {
  return `<svg viewBox="-500 -470 1000 500" aria-hidden="true">
    ${boru(-330, -430, -210, 0, 26, KIRMIZI)}${boru(-330, -430, -300, 0, 24, KIRMIZI)}
    ${boru(330, -430, 210, 0, 26, KIRMIZI)}${boru(330, -430, 300, 0, 24, KIRMIZI)}
    ${boru(-350, -430, 350, -430, 30, KIRMIZI)}
    <path d="M-100 -420 V-110 M100 -420 V-110" stroke="${K}" stroke-width="9" stroke-dasharray="14 8"/><path d="M-100 -420 V-110 M100 -420 V-110" stroke="${GRI[1]}" stroke-width="4" stroke-dasharray="14 8"/>
    <rect x="-130" y="-120" width="260" height="36" rx="16" fill="#c9733a" stroke="${K}" stroke-width="8"/>
  </svg>`;
}
