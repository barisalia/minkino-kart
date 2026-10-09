/**
 * Vaka 3 yer tutucularının çizimleri (yalnız Gemini çizimi gelene kadar: resimler3.ts). Düz SVG metinleri: sıcak koyu
 * kahve kontur, yumuşak geçişli düz dolgular, az parlama (stil rehberinin çizgisi). Sahne yer tutucuları 4096 × 2286
 * kutusunda çizilir: koordinatlar mantik3.ts'nin oranlarıyla aynı (x × 4096, y × 2286), ipuçları ve kovuklar tam
 * çizimin üstüne oturur.
 */
import { KOVUKLAR, PATIKALAR, type Kovuk } from './mantik3';

export const KONTUR = '#5a3820';
export const SW = 4096;
export const SH = 2286;
const f = (n: number) => n.toFixed(1);

export const svgSar = (w: number, h: number, ic: string, defs = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${ic}</svg>`;

/** Yuvarlak köşeli beş köşeli yıldızın noktaları */
export function yildizNoktalari(cx: number, cy: number, r: number, don = -90, ic = 0.5): string {
  const l: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = ((don + i * 36) * Math.PI) / 180;
    const rr = i % 2 ? r * ic : r;
    l.push(`${f(cx + Math.cos(a) * rr)},${f(cy + Math.sin(a) * rr)}`);
  }
  return l.join(' ');
}
/** Parlak sarı yıldız şeker */
export function yildizSeker(cx: number, cy: number, r: number, don = -90, k = r * 0.16): string {
  return `<polygon points="${yildizNoktalari(cx, cy, r, don, 0.52)}" fill="url(#ys)" stroke="${KONTUR}" stroke-width="${f(k)}" stroke-linejoin="round"/><ellipse cx="${f(cx - r * 0.22)}" cy="${f(cy - r * 0.25)}" rx="${f(r * 0.16)}" ry="${f(r * 0.1)}" fill="#fff" opacity=".75" transform="rotate(-30 ${f(cx - r * 0.22)} ${f(cy - r * 0.25)})"/>`;
}
export const YS_DEFS = `<linearGradient id="ys" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe680"/><stop offset="1" stop-color="#ffbf1f"/></linearGradient>`;

/** Palamut (meşe palamudu): fındık gövdesi, şapkası, sapı */
export function palamut(cx: number, cy: number, s: number, don = 0, k = s * 0.035): string {
  return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${don}) scale(${f(s / 100)})">
<path d="M-34 -4 C-36 30 -16 58 0 64 C16 58 36 30 34 -4 Z" fill="url(#pg)" stroke="${KONTUR}" stroke-width="${f((k * 100) / s)}" stroke-linejoin="round"/>
<ellipse cx="-14" cy="18" rx="7" ry="14" fill="#fff" opacity=".35"/>
<path d="M-42 -2 C-42 -30 -20 -40 0 -40 C20 -40 42 -30 42 -2 C30 4 -30 4 -42 -2 Z" fill="url(#pc)" stroke="${KONTUR}" stroke-width="${f((k * 100) / s)}" stroke-linejoin="round"/>
<path d="M-30 -14 L-20 -30 M-14 -6 L-2 -34 M2 -6 L14 -32 M18 -8 L28 -24 M-34 -20 L32 -20" stroke="#6b4223" stroke-width="3" stroke-linecap="round" opacity=".55"/>
<path d="M0 -40 C2 -52 8 -58 14 -60" fill="none" stroke="${KONTUR}" stroke-width="${f((k * 100) / s)}" stroke-linecap="round"/></g>`;
}
export const PALAMUT_DEFS = `<linearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e7a14f"/><stop offset="1" stop-color="#b8692c"/></linearGradient><linearGradient id="pc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a87447"/><stop offset="1" stop-color="#7a4b28"/></linearGradient>`;

/** Fındık (kabuklu, yuvarlak) */
export function findikTanesi(cx: number, cy: number, s: number, don = 0): string {
  return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${don}) scale(${f(s / 100)})"><path d="M0 -40 C30 -40 44 -6 40 18 C36 40 16 48 0 48 C-16 48 -36 40 -40 18 C-44 -6 -30 -40 0 -40 Z" fill="#b97a43" stroke="${KONTUR}" stroke-width="5"/><path d="M-30 20 C-10 30 10 30 30 20 L34 34 C10 46 -10 46 -34 34 Z" fill="#e7c79a" stroke="${KONTUR}" stroke-width="4"/><ellipse cx="-14" cy="-12" rx="8" ry="13" fill="#fff" opacity=".35"/></g>`;
}

// ---------------------------------------------------------------- eşyalar ve ipuçları
/** Fırın tepsisi (üstten hafif eğik, gümüş, koyu kahve kontur) 1000 × 520 */
export function tepsiSvg(): string {
  return svgSar(
    1000,
    520,
    `<rect x="18" y="24" width="964" height="470" rx="70" fill="url(#tg)" stroke="${KONTUR}" stroke-width="16"/>
<rect x="62" y="70" width="876" height="380" rx="44" fill="url(#ti)" stroke="#8d96a1" stroke-width="8"/>
<path d="M110 60 H860" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity=".7"/>
<path d="M90 470 H910" stroke="#7d8692" stroke-width="10" stroke-linecap="round" opacity=".35"/>`,
    `<linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1f4f7"/><stop offset="1" stop-color="#b7c0ca"/></linearGradient><linearGradient id="ti" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d4dbe2"/><stop offset="1" stop-color="#e8edf1"/></linearGradient>`,
  );
}
/** Un halkası (kurabiyenin bıraktığı soluk iz) 300 × 220 */
export function unHalkaSvg(): string {
  return svgSar(
    300,
    220,
    `<ellipse cx="150" cy="110" rx="128" ry="92" fill="url(#uh)"/>
<g fill="#fffdf6" opacity=".9"><circle cx="40" cy="96" r="5"/><circle cx="62" cy="40" r="4"/><circle cx="246" cy="58" r="5"/><circle cx="262" cy="140" r="4"/><circle cx="118" cy="196" r="5"/><circle cx="196" cy="190" r="4"/><circle cx="150" cy="22" r="4"/></g>`,
    `<radialGradient id="uh"><stop offset=".6" stop-color="#fffaf0" stop-opacity="0"/><stop offset=".76" stop-color="#fffaf0" stop-opacity=".6"/><stop offset=".86" stop-color="#fff6e2" stop-opacity=".45"/><stop offset="1" stop-color="#fff6e2" stop-opacity="0"/></radialGradient>`,
  );
}
/** Kino'nun yarım ekmek dilimi 400 × 380 */
export function ekmekSvg(): string {
  return svgSar(
    400,
    380,
    `<path d="M40 330 L40 150 C20 140 14 90 40 62 C70 30 120 34 150 40 C180 20 250 20 290 46 C330 72 340 120 320 150 L320 200 Z" fill="#d38f4f" stroke="${KONTUR}" stroke-width="14" stroke-linejoin="round"/>
<path d="M68 300 L68 160 C50 150 50 110 68 92 C92 70 130 74 156 82 C186 60 240 62 270 82 C298 100 300 132 290 150 L290 212 Z" fill="#f6deb0"/>
<g fill="#e6c28a"><circle cx="120" cy="160" r="7"/><circle cx="190" cy="130" r="6"/><circle cx="160" cy="220" r="7"/><circle cx="230" cy="180" r="5"/><circle cx="110" cy="250" r="6"/></g>
<path d="M90 110 C110 96 140 96 160 104" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".6" fill="none"/>`,
  );
}
/** Pervazdaki kırıntılar ve minik sarı yıldız şekerler 600 × 360 (B8 yer tutucu) */
export function kirintiSvg(): string {
  const kirinti = (x: number, y: number, s: number, d: number) =>
    `<path transform="translate(${x} ${y}) rotate(${d}) scale(${s})" d="M-20 -12 C-8 -24 14 -22 22 -8 C30 6 18 22 2 20 C-14 26 -30 10 -20 -12 Z" fill="url(#kr)" stroke="${KONTUR}" stroke-width="${(5 / s).toFixed(1)}" stroke-linejoin="round"/>`;
  return svgSar(
    600,
    360,
    [
      kirinti(110, 210, 1.6, 10),
      kirinti(220, 150, 1.1, -30),
      kirinti(300, 240, 1.9, 40),
      kirinti(420, 170, 1.3, 70),
      kirinti(500, 250, 1.0, -10),
      kirinti(170, 290, 0.9, 20),
      kirinti(380, 300, 0.8, -50),
      yildizSeker(250, 260, 26, -80),
      yildizSeker(460, 110, 22, -100),
      yildizSeker(80, 120, 20, -70),
      yildizSeker(360, 90, 18, -95),
    ].join(''),
    `${YS_DEFS}<linearGradient id="kr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6cf86"/><stop offset="1" stop-color="#d9973f"/></linearGradient>`,
  );
}
/** Kuş tohumları (soluk, çizgili) 600 × 360 (B9 yer tutucu) */
export function tohumSvg(): string {
  const t = (x: number, y: number, d: number, s = 1) =>
    `<g transform="translate(${x} ${y}) rotate(${d}) scale(${s})"><ellipse rx="26" ry="14" fill="#f2e6c2" stroke="${KONTUR}" stroke-width="5"/><path d="M-16 -2 C-4 -6 6 -6 16 -2" stroke="#b9a173" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="-8" cy="-6" rx="7" ry="3" fill="#fff" opacity=".7"/></g>`;
  const l = [
    [120, 200, 20],
    [190, 150, -30],
    [250, 230, 60],
    [320, 170, 10],
    [380, 240, -50],
    [450, 190, 35],
    [160, 270, -10],
    [290, 290, 80],
    [500, 260, -25],
    [230, 110, 45],
    [420, 120, -70],
    [90, 130, 70],
  ];
  return svgSar(600, 360, l.map(([x, y, d], i) => t(x, y, d, i % 3 ? 1 : 1.15)).join(''));
}
/** Beş minik parlak sarı yıldız şeker 600 × 360 (B10 yer tutucu) */
export function yildizSekerSvg(): string {
  return svgSar(600, 360, [yildizSeker(130, 220, 52, -80), yildizSeker(250, 130, 46, -100), yildizSeker(330, 250, 56, -88), yildizSeker(450, 150, 44, -70), yildizSeker(500, 270, 40, -95)].join(''), YS_DEFS);
}
/** Yumuşak toprakta minik sincap izleri (dört ince parmak) 700 × 460 (B11 yer tutucu) */
export function elIziSvg(): string {
  const on = (x: number, y: number, d: number) =>
    `<g transform="translate(${x} ${y}) rotate(${d})" fill="#6e4325"><ellipse cx="0" cy="10" rx="16" ry="14"/><ellipse cx="-20" cy="-14" rx="5" ry="10" transform="rotate(-25 -20 -14)"/><ellipse cx="-7" cy="-22" rx="5" ry="11"/><ellipse cx="7" cy="-22" rx="5" ry="11"/><ellipse cx="20" cy="-14" rx="5" ry="10" transform="rotate(25 20 -14)"/></g>`;
  const arka = (x: number, y: number, d: number) =>
    `<g transform="translate(${x} ${y}) rotate(${d})" fill="#6e4325"><ellipse cx="0" cy="14" rx="15" ry="26"/><ellipse cx="-20" cy="-22" rx="5" ry="11" transform="rotate(-20 -20 -22)"/><ellipse cx="-7" cy="-30" rx="5" ry="12"/><ellipse cx="7" cy="-30" rx="5" ry="12"/><ellipse cx="20" cy="-22" rx="5" ry="11" transform="rotate(20 20 -22)"/></g>`;
  return svgSar(
    700,
    460,
    `<path d="M60 240 C40 140 150 70 300 80 C470 60 650 120 640 240 C650 360 500 410 340 400 C180 410 70 350 60 240 Z" fill="url(#to)" stroke="#8a5a35" stroke-width="10"/>
<g opacity=".9">${on(210, 290, 70)}${on(250, 330, 80)}${arka(330, 220, 75)}${arka(380, 270, 85)}${on(470, 200, 72)}${on(510, 240, 80)}</g>`,
    `<radialGradient id="to"><stop offset="0" stop-color="#c8936a"/><stop offset="1" stop-color="#a87149"/></radialGradient>`,
  );
}
/** Kabuğa takılmış kabarık kızıl tüy tutamı 520 × 520 (B12 yer tutucu) */
export function tuySvg(): string {
  return svgSar(
    520,
    520,
    `<path d="M60 120 C80 90 420 70 460 110 C480 200 470 360 450 430 C330 460 150 460 70 430 C50 320 50 210 60 120 Z" fill="#9b6a42" stroke="${KONTUR}" stroke-width="12" stroke-linejoin="round"/>
<path d="M120 140 C130 230 110 330 130 410 M220 120 C240 220 220 320 240 420 M330 120 C320 220 350 320 330 420 M410 140 C420 230 400 330 420 410" stroke="#7a4f2e" stroke-width="10" fill="none" stroke-linecap="round"/>
<path d="M160 270 C130 220 170 170 220 190 C240 140 310 140 330 190 C380 170 420 220 390 270 C430 300 400 360 350 350 C330 400 250 400 230 360 C180 380 130 330 160 270 Z" fill="url(#tu)" stroke="${KONTUR}" stroke-width="12" stroke-linejoin="round"/>
<path d="M200 250 C230 230 260 236 280 250 M250 300 C280 290 310 296 330 310" stroke="#ffd2a0" stroke-width="12" fill="none" stroke-linecap="round"/>`,
    `<radialGradient id="tu" cx=".45" cy=".4"><stop offset="0" stop-color="#ffb46b"/><stop offset="1" stop-color="#e86f2c"/></radialGradient>`,
  );
}
/** Kirpi (önden, patileri birleşik, dostça) 800 × 800 (B17 yer tutucu) */
export function kirpiSvg(): string {
  const diken: string[] = [];
  for (let i = 0; i <= 16; i++) {
    const a = Math.PI * (1.05 + (i / 16) * 0.9);
    const r0 = 250;
    const r1 = 330 + (i % 2 ? 0 : 26);
    const x0 = 400 + Math.cos(a - 0.1) * r0;
    const y0 = 430 + Math.sin(a - 0.1) * r0;
    const x1 = 400 + Math.cos(a) * r1;
    const y1 = 430 + Math.sin(a) * r1;
    const x2 = 400 + Math.cos(a + 0.1) * r0;
    const y2 = 430 + Math.sin(a + 0.1) * r0;
    diken.push(`${f(x0)},${f(y0)} ${f(x1)},${f(y1)} ${f(x2)},${f(y2)}`);
  }
  return svgSar(
    800,
    800,
    `<polygon points="${diken.join(' ')}" fill="#8a5a3a" stroke="${KONTUR}" stroke-width="12" stroke-linejoin="round"/>
<ellipse cx="400" cy="460" rx="270" ry="250" fill="#9c6a45" stroke="${KONTUR}" stroke-width="12"/>
<path d="M190 380 L170 330 M250 300 L240 250 M330 260 L330 205 M470 260 L470 205 M550 300 L560 250 M610 380 L630 330" stroke="#6e4325" stroke-width="12" stroke-linecap="round"/>
<path d="M240 470 C240 330 320 300 400 300 C480 300 560 330 560 470 C560 640 480 700 400 700 C320 700 240 640 240 470 Z" fill="url(#ky)" stroke="${KONTUR}" stroke-width="12"/>
<ellipse cx="335" cy="440" rx="24" ry="30" fill="#2f1d12"/><ellipse cx="465" cy="440" rx="24" ry="30" fill="#2f1d12"/>
<circle cx="343" cy="428" r="9" fill="#fff"/><circle cx="473" cy="428" r="9" fill="#fff"/>
<ellipse cx="300" cy="500" rx="30" ry="18" fill="#ff9cb0" opacity=".55"/><ellipse cx="500" cy="500" rx="30" ry="18" fill="#ff9cb0" opacity=".55"/>
<ellipse cx="400" cy="495" rx="26" ry="20" fill="#2f1d12"/><ellipse cx="392" cy="488" rx="8" ry="5" fill="#fff" opacity=".7"/>
<path d="M370 540 C385 556 415 556 430 540" stroke="${KONTUR}" stroke-width="10" fill="none" stroke-linecap="round"/>
<path d="M330 610 C350 580 390 580 400 600 C410 580 450 580 470 610 C450 640 350 640 330 610 Z" fill="#f2d7b4" stroke="${KONTUR}" stroke-width="10" stroke-linejoin="round"/>
<ellipse cx="320" cy="705" rx="58" ry="28" fill="#7a4f30" stroke="${KONTUR}" stroke-width="10"/><ellipse cx="480" cy="705" rx="58" ry="28" fill="#7a4f30" stroke="${KONTUR}" stroke-width="10"/>`,
    `<radialGradient id="ky" cx=".5" cy=".4"><stop offset="0" stop-color="#fbeedb"/><stop offset="1" stop-color="#ecd1ad"/></radialGradient>`,
  );
}
/** Palamut (B27 yer tutucu) 600 × 600 */
export const palamutSvg = () => svgSar(600, 600, palamut(300, 330, 400, 12, 16), PALAMUT_DEFS);
/** Palamut kurabiyesi: altın hamur, çikolata şapka, krem noktalar 600 × 600 (B28 yer tutucu) */
export function palamutKurabiyeSvg(): string {
  return svgSar(
    600,
    600,
    `<g transform="translate(300 320) rotate(-8)"><path d="M-150 -10 C-156 120 -70 220 0 236 C70 220 156 120 150 -10 Z" fill="url(#hk)" stroke="${KONTUR}" stroke-width="16" stroke-linejoin="round"/>
<ellipse cx="-70" cy="70" rx="26" ry="50" fill="#fff" opacity=".3"/>
<path d="M-176 -6 C-176 -120 -90 -160 0 -160 C90 -160 176 -120 176 -6 C120 18 -120 18 -176 -6 Z" fill="url(#hc)" stroke="${KONTUR}" stroke-width="16" stroke-linejoin="round"/>
<g fill="#fff4dc"><circle cx="-110" cy="-60" r="11"/><circle cx="-50" cy="-100" r="10"/><circle cx="20" cy="-70" r="11"/><circle cx="80" cy="-110" r="9"/><circle cx="120" cy="-50" r="10"/><circle cx="-20" cy="-30" r="9"/></g>
<path d="M0 -160 C6 -200 30 -220 56 -226" fill="none" stroke="${KONTUR}" stroke-width="16" stroke-linecap="round"/></g>`,
    `<linearGradient id="hk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4c47e"/><stop offset="1" stop-color="#d48d43"/></linearGradient><linearGradient id="hc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8b5530"/><stop offset="1" stop-color="#5e3419"/></linearGradient>`,
  );
}
/** Küçük kalp (Fındık'ın sevinci) 200 × 200 */
export const kalpSvg = (renk = '#ff7aa2') =>
  svgSar(200, 200, `<path d="M100 172 C40 130 14 96 22 62 C30 30 74 22 100 54 C126 22 170 30 178 62 C186 96 160 130 100 172 Z" fill="${renk}" stroke="${KONTUR}" stroke-width="10" stroke-linejoin="round"/><ellipse cx="62" cy="64" rx="16" ry="10" fill="#fff" opacity=".6" transform="rotate(-30 62 64)"/>`);
/** Kâğıt kar tanesi süsü (ipte asılı) */
export function karTanesi(cx: number, cy: number, r: number, ipBoy = 0): string {
  const kollar: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i * 60 * Math.PI) / 180;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    const yan = (t: number, s: number) => {
      const px = cx + Math.cos(a) * r * t;
      const py = cy + Math.sin(a) * r * t;
      return `M${f(px)} ${f(py)} L${f(px + Math.cos(a + s) * r * 0.28)} ${f(py + Math.sin(a + s) * r * 0.28)}`;
    };
    kollar.push(`M${f(cx)} ${f(cy)} L${f(x)} ${f(y)} ${yan(0.55, 0.8)} ${yan(0.55, -0.8)}`);
  }
  const d = kollar.join(' ');
  return `${ipBoy ? `<path d="M${f(cx)} ${f(cy - r - ipBoy)} L${f(cx)} ${f(cy - r * 0.9)}" stroke="#e9dcc4" stroke-width="${f(r * 0.04)}"/>` : ''}<path d="${d}" stroke="${KONTUR}" stroke-width="${f(r * 0.22)}" stroke-linecap="round" fill="none"/><path d="${d}" stroke="#f4fbff" stroke-width="${f(r * 0.13)}" stroke-linecap="round" fill="none"/><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.16)}" fill="#f4fbff" stroke="${KONTUR}" stroke-width="${f(r * 0.05)}"/>`;
}
/** Kart çerçevesindeki küçük sahnecikler: parti şapkası (koni) */
export function partiSapkasi(cx: number, cy: number, s: number, don = 0): string {
  return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${don}) scale(${f(s / 100)})"><path d="M0 -70 L40 30 C20 40 -20 40 -40 30 Z" fill="#ff7aa2" stroke="${KONTUR}" stroke-width="6" stroke-linejoin="round"/><path d="M-26 0 L24 -4 M-34 18 L34 14" stroke="#ffe066" stroke-width="8" stroke-linecap="round"/><circle cx="0" cy="-72" r="12" fill="#ffe066" stroke="${KONTUR}" stroke-width="5"/></g>`;
}
/** Konfeti */
export function konfeti(w: number, h: number, adet: number, tohum = 3): string {
  let s = tohum;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const renk = ['#ff7aa2', '#ffd23f', '#6fc3ff', '#8be08b', '#c99bff'];
  const l: string[] = [];
  for (let i = 0; i < adet; i++) l.push(`<rect x="${f(r() * w)}" y="${f(r() * h)}" width="${f(10 + r() * 10)}" height="${f(16 + r() * 12)}" rx="3" fill="${renk[i % renk.length]}" transform="rotate(${f(r() * 180)} ${f(r() * w)} ${f(r() * h)})"/>`);
  return l.join('');
}
/** Kar taneleri (düşen, küçük) */
export function karYagisi(w: number, h: number, adet: number, tohum = 5): string {
  let s = tohum;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const l: string[] = [];
  for (let i = 0; i < adet; i++) l.push(karTanesi(r() * w, r() * h, 14 + r() * 14));
  return l.join('');
}
/** Kuş yuvası (orta kovuğun içinde), içinde tek tüy */
export function yuvaSvgIc(cx: number, cy: number, w: number): string {
  const s = w / 300;
  return `<g transform="translate(${f(cx)} ${f(cy)}) scale(${f(s)})"><path d="M-150 -10 C-140 60 -70 90 0 90 C70 90 140 60 150 -10 C90 10 -90 10 -150 -10 Z" fill="#c99a5e" stroke="${KONTUR}" stroke-width="10" stroke-linejoin="round"/>
<path d="M-130 10 C-60 40 60 40 130 10 M-110 40 C-40 64 40 64 110 40 M-120 -4 L-90 30 M-60 0 L-30 50 M0 4 L20 60 M60 0 L40 54 M110 -4 L90 34" stroke="#9a6d3c" stroke-width="8" fill="none" stroke-linecap="round"/>
<path d="M-150 -10 C-90 -30 90 -30 150 -10" stroke="${KONTUR}" stroke-width="10" fill="none"/>
<path d="M-10 -10 C10 -60 50 -80 70 -70 C60 -40 30 -16 -10 -10 Z" fill="#f2efe6" stroke="${KONTUR}" stroke-width="6"/></g>`;
}

// ---------------------------------------------------------------- sahneler (4096 × 2286 kutusu)
const X = (v: number) => v * SW;
const Y = (v: number) => v * SH;

/** Bir kovuk: kabuk dudağı (halka) ve karanlık ağız (dudak ayrı bir biçim: ön katmanı bundan kesilir) */
function kovukSvg(k: Kovuk, ic = ''): string {
  const cx = X(k.x);
  const cy = Y(k.y);
  const rx = X(k.rx);
  const ry = Y(k.ry);
  const d = 1 + k.dudak;
  return `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx * d)}" ry="${f(ry * d)}" fill="url(#kd)" stroke="${KONTUR}" stroke-width="12"/>
<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="url(#ka)" stroke="${KONTUR}" stroke-width="10"/>${ic}
<path d="M${f(cx - rx * 0.95)} ${f(cy - ry * 1.12)} C${f(cx - rx * 0.4)} ${f(cy - ry * 1.3)} ${f(cx + rx * 0.4)} ${f(cy - ry * 1.3)} ${f(cx + rx * 0.95)} ${f(cy - ry * 1.12)}" stroke="#d9a97a" stroke-width="14" fill="none" stroke-linecap="round" opacity=".7"/>`;
}
const KOVUK_DEFS = `<radialGradient id="kd" cx=".5" cy=".35"><stop offset="0" stop-color="#b98457"/><stop offset="1" stop-color="#8a5734"/></radialGradient><radialGradient id="ka" cx=".5" cy=".4"><stop offset="0" stop-color="#4a2c17"/><stop offset="1" stop-color="#26150a"/></radialGradient>`;

/** Büyük meşe: kalın gövde, üç kovuk, yeşil taç; s: ölçek, (x, y): gövdenin taban ortası (4096 kutusu) */
export function mese(x: number, y: number, s: number, kovuklar = true): string {
  // gövde ve kökler (ölçeksiz tasarım: taban ortası 0,0; gövde 0.26 en, 0.66 boy)
  const g = `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})">
<path d="M-560 0 C-470 -40 -420 -90 -380 -170 C-340 -420 -330 -820 -300 -1380 L300 -1380 C330 -820 340 -420 380 -170 C420 -90 470 -40 560 0 C380 30 -380 30 -560 0 Z" fill="url(#gv)" stroke="${KONTUR}" stroke-width="16" stroke-linejoin="round"/>
<path d="M-200 -1300 C-180 -1000 -230 -700 -190 -380 M-40 -1340 C-20 -1060 -60 -760 -30 -460 M150 -1300 C170 -1020 130 -720 170 -420 M240 -260 C270 -160 330 -80 420 -30 M-250 -240 C-280 -140 -340 -70 -430 -26" stroke="#6e4325" stroke-width="14" fill="none" stroke-linecap="round" opacity=".7"/>
<path d="M-240 -1340 C-230 -1100 -260 -880 -250 -700" stroke="#c58c5c" stroke-width="22" fill="none" stroke-linecap="round" opacity=".45"/></g>`;
  const tac = (cx: number, cy: number, r: number, renk = 'url(#tc)') => `<circle cx="${f(x + cx * s)}" cy="${f(y + cy * s)}" r="${f(r * s)}" fill="${renk}" stroke="${KONTUR}" stroke-width="16"/>`;
  const taclar = [
    [-900, -1750, 360],
    [900, -1750, 360],
    [-600, -2050, 420],
    [600, -2050, 420],
    [0, -2200, 480],
    [-1200, -2000, 300],
    [1200, -2000, 300],
    [-300, -1800, 380],
    [300, -1800, 380],
  ];
  const parlak = [
    [-640, -2150, 120],
    [-60, -2370, 140],
    [560, -2180, 110],
    [-980, -1870, 90],
  ];
  const tacSvg = taclar.map(([a, b, r]) => tac(a, b, r)).join('') + taclar.map(([a, b, r]) => `<circle cx="${f(x + a * s)}" cy="${f(y + b * s)}" r="${f((r - 16) * s)}" fill="url(#tc)"/>`).join('') + parlak.map(([a, b, r]) => `<ellipse cx="${f(x + a * s)}" cy="${f(y + b * s)}" rx="${f(r * s)}" ry="${f(r * 0.55 * s)}" fill="#c5e88a" opacity=".7"/>`).join('');
  const kv = kovuklar ? kovukSvg(KOVUKLAR.ust) + kovukSvg(KOVUKLAR.orta, yuvaSvgIc(X(KOVUKLAR.orta.x), Y(KOVUKLAR.orta.y + KOVUKLAR.orta.ry * 0.55), X(KOVUKLAR.orta.rx) * 1.7)) + kovukSvg(KOVUKLAR.alt) : '';
  return g + tacSvg + kv;
}
export const MESE_DEFS = `<linearGradient id="gv" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a4a2a"/><stop offset=".45" stop-color="#a86d43"/><stop offset="1" stop-color="#7a4a2a"/></linearGradient><radialGradient id="tc" cx=".4" cy=".35"><stop offset="0" stop-color="#9fd16a"/><stop offset="1" stop-color="#6aa83f"/></radialGradient>${KOVUK_DEFS}${PALAMUT_DEFS}`;

/** Çimen zemini (üst kenarı dalgalı) */
function cimen(y0: number): string {
  return `<path d="M0 ${f(Y(y0))} C${f(X(0.2))} ${f(Y(y0 - 0.025))} ${f(X(0.4))} ${f(Y(y0 + 0.02))} ${f(X(0.6))} ${f(Y(y0 - 0.01))} C${f(X(0.75))} ${f(Y(y0 - 0.03))} ${f(X(0.9))} ${f(Y(y0 + 0.015))} ${SW} ${f(Y(y0))} L${SW} ${SH} L0 ${SH} Z" fill="url(#cm)" stroke="${KONTUR}" stroke-width="10"/>`;
}
const CIMEN_DEFS = `<linearGradient id="cm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a8d86c"/><stop offset="1" stop-color="#7fbf4c"/></linearGradient>`;

/** Ağaç sahnesinin ön planı (gök ve tepeler park resminden: resimler3.ts) */
export function agacOnSvg(): string {
  const aga = mese(X(0.5), Y(0.955), 1.0);
  const toprak = `<ellipse cx="${f(X(0.5))}" cy="${f(Y(0.94))}" rx="${f(X(0.24))}" ry="${f(Y(0.07))}" fill="url(#tp)" stroke="#8a5a35" stroke-width="10"/>`;
  const palamutlar = [
    [0.7, 0.95, 70, -20],
    [0.735, 0.93, 60, 25],
    [0.27, 0.955, 64, -10],
    [0.66, 0.965, 50, 30],
  ]
    .map(([x, y, s, d]) => palamut(X(x), Y(y), s, d, 6))
    .join('');
  return svgSar(SW, SH, cimen(0.82) + toprak + aga + palamutlar, MESE_DEFS + CIMEN_DEFS + `<radialGradient id="tp"><stop offset="0" stop-color="#c8936a"/><stop offset="1" stop-color="#a5714b"/></radialGradient>`);
}

/** Patika: baştan sona daralan toprak yol (çokgen) */
function patikaYolu([x0, y0]: [number, number], [x1, y1]: [number, number], egri: number, w0: number, w1: number): string {
  const ax = X(x0);
  const ay = Y(y0);
  const bx = X(x1);
  const by = Y(y1);
  const kx = (ax + bx) / 2 + egri * SW;
  const ky = (ay + by) / 2 - Math.abs(egri) * SH * 0.2;
  const nokta = (t: number) => {
    const x = (1 - t) ** 2 * ax + 2 * (1 - t) * t * kx + t * t * bx;
    const y = (1 - t) ** 2 * ay + 2 * (1 - t) * t * ky + t * t * by;
    const dx = 2 * (1 - t) * (kx - ax) + 2 * t * (bx - kx);
    const dy = 2 * (1 - t) * (ky - ay) + 2 * t * (by - ky);
    const n = Math.hypot(dx, dy) || 1;
    const w = (w0 + (w1 - w0) * t) * SH;
    return [x, y, (-dy / n) * w, (dx / n) * w];
  };
  const sol: string[] = [];
  const sag: string[] = [];
  for (let i = 0; i <= 24; i++) {
    const [x, y, nx, ny] = nokta(i / 24);
    sol.push(`${f(x + nx)},${f(y + ny)}`);
    sag.unshift(`${f(x - nx)},${f(y - ny)}`);
  }
  return `<polygon points="${[...sol, ...sag].join(' ')}" fill="url(#py)" stroke="#a87a4c" stroke-width="10" stroke-linejoin="round"/>`;
}
/** Otobüsün yanı: çimen, üç patika, gölet ve sazlar, uzakta ağaç (otobüs ve bank resimlerden: resimler3.ts) */
export function yaniOnSvg(): string {
  const golet = `<ellipse cx="${f(X(0.6))}" cy="${f(Y(0.635))}" rx="${f(X(0.085))}" ry="${f(Y(0.045))}" fill="url(#gl)" stroke="${KONTUR}" stroke-width="10"/><ellipse cx="${f(X(0.585))}" cy="${f(Y(0.627))}" rx="${f(X(0.04))}" ry="${f(Y(0.012))}" fill="#fff" opacity=".45"/>`;
  const saz = [0.53, 0.545, 0.665, 0.68]
    .map((x, i) => `<path d="M${f(X(x))} ${f(Y(0.64))} C${f(X(x) + 10)} ${f(Y(0.58))} ${f(X(x) - 6)} ${f(Y(0.55))} ${f(X(x) + (i % 2 ? 14 : -10))} ${f(Y(0.52))}" stroke="#5f9a3a" stroke-width="12" fill="none" stroke-linecap="round"/><ellipse cx="${f(X(x) + (i % 2 ? 14 : -10))}" cy="${f(Y(0.535))}" rx="12" ry="30" fill="#8a5a35" stroke="${KONTUR}" stroke-width="6"/>`)
    .join('');
  const yollar = [patikaYolu(PATIKALAR.golet.bas, PATIKALAR.golet.son, -0.03, 0.026, 0.008), patikaYolu(PATIKALAR.bank.bas, PATIKALAR.bank.son, 0.02, 0.028, 0.01), patikaYolu(PATIKALAR.agac.bas, PATIKALAR.agac.son, 0.05, 0.026, 0.014)].join('');
  const uzakAgac = mese(X(0.95), Y(0.86), 0.42, false);
  return svgSar(SW, SH, cimen(0.6) + golet + saz + uzakAgac + yollar, CIMEN_DEFS + MESE_DEFS + `<linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd6f5"/><stop offset="1" stop-color="#4aa8dc"/></linearGradient><linearGradient id="py" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2c193"/><stop offset="1" stop-color="#cfa16c"/></linearGradient>`);
}

/** Otobüsün içine eklenen sürgü (kapının iç sürgüsü) ve aralık pencerenin gölgesi */
export function icEkSvg(): string {
  const sx = X(0.112);
  const sy = Y(0.6);
  const surgu = `<rect x="${f(sx - 70)}" y="${f(sy - 26)}" width="140" height="52" rx="18" fill="#c48a52" stroke="${KONTUR}" stroke-width="10"/><rect x="${f(sx - 110)}" y="${f(sy - 12)}" width="120" height="24" rx="10" fill="#9a6a3c" stroke="${KONTUR}" stroke-width="8"/><circle cx="${f(sx + 30)}" cy="${f(sy - 40)}" r="16" fill="#c48a52" stroke="${KONTUR}" stroke-width="8"/>`;
  // pencere aralık: üst kanat hafif içeri açılmış (koyu ince aralık ve kanadın gölgesi)
  const aralik = `<path d="M${f(X(0.37))} ${f(Y(0.3))} L${f(X(0.63))} ${f(Y(0.3))} L${f(X(0.625))} ${f(Y(0.33))} L${f(X(0.375))} ${f(Y(0.33))} Z" fill="#7aa6c9" opacity=".55"/>`;
  return svgSar(SW, SH, surgu + aralik);
}

/** Kovuğun içi (kiler): tahta raflar, palamutlar ve fındıklar, kâğıt kar tanesi; ağız çerçeve gibi önde */
export function kilerSvg(): string {
  const raf = (y: number, x0: number, x1: number) => `<rect x="${f(X(x0))}" y="${f(Y(y))}" width="${f(X(x1 - x0))}" height="${f(Y(0.05))}" rx="22" fill="url(#rf)" stroke="${KONTUR}" stroke-width="12"/><path d="M${f(X(x0) + 30)} ${f(Y(y) + 22)} H${f(X(x1) - 30)}" stroke="#e2b27c" stroke-width="10" stroke-linecap="round" opacity=".6"/>`;
  const ust = Array.from({ length: 8 }, (_, i) => palamut(X(0.33 + i * 0.075), Y(0.39), 150, (i % 2 ? 8 : -6), 10)).join('');
  const alt = Array.from({ length: 4 }, (_, i) => findikTanesi(X(0.36 + i * 0.065), Y(0.655), 130, i * 12 - 10)).join('');
  const ic = `<rect width="${SW}" height="${SH}" fill="url(#ki)"/>
<path d="M${f(X(0.1))} ${f(Y(0.2))} C${f(X(0.3))} ${f(Y(0.12))} ${f(X(0.7))} ${f(Y(0.12))} ${f(X(0.9))} ${f(Y(0.2))} M${f(X(0.08))} ${f(Y(0.85))} C${f(X(0.3))} ${f(Y(0.92))} ${f(X(0.7))} ${f(Y(0.92))} ${f(X(0.92))} ${f(Y(0.85))}" stroke="#7a4b2a" stroke-width="18" fill="none" opacity=".5"/>
${raf(0.45, 0.28, 0.95)}${raf(0.72, 0.28, 0.95)}${ust}${alt}${karTanesi(X(0.2), Y(0.3), Y(0.085), Y(0.22))}`;
  // ağzın kabuk çerçevesi: elips delikli dikdörtgen (evenodd), kalın dudak
  const cer = `<path fill-rule="evenodd" d="M0 0 H${SW} V${SH} H0 Z M${f(X(0.5) - X(0.47))} ${f(Y(0.5))} A${f(X(0.47))} ${f(Y(0.47))} 0 1 0 ${f(X(0.5) + X(0.47))} ${f(Y(0.5))} A${f(X(0.47))} ${f(Y(0.47))} 0 1 0 ${f(X(0.5) - X(0.47))} ${f(Y(0.5))} Z" fill="url(#cr)"/>
<ellipse cx="${f(X(0.5))}" cy="${f(Y(0.5))}" rx="${f(X(0.47))}" ry="${f(Y(0.47))}" fill="none" stroke="${KONTUR}" stroke-width="18"/>
<ellipse cx="${f(X(0.5))}" cy="${f(Y(0.5))}" rx="${f(X(0.485))}" ry="${f(Y(0.49))}" fill="none" stroke="#c99568" stroke-width="16" opacity=".6"/>`;
  return svgSar(
    SW,
    SH,
    ic + cer,
    `<radialGradient id="ki" cx=".55" cy=".45"><stop offset="0" stop-color="#c88a52"/><stop offset=".7" stop-color="#8a5532"/><stop offset="1" stop-color="#5e361c"/></radialGradient><linearGradient id="rf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d39a5e"/><stop offset="1" stop-color="#a86d3b"/></linearGradient><radialGradient id="cr" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#9a6a42"/><stop offset="1" stop-color="#6e4325"/></radialGradient>${PALAMUT_DEFS}`,
  );
}
/** Ay ve yıldızlar (roman: gece) */
export function geceSvg(w: number, h: number): string {
  const yildizlar = [
    [0.15, 0.2],
    [0.3, 0.12],
    [0.72, 0.18],
    [0.85, 0.3],
    [0.55, 0.08],
  ]
    .map(([x, y]) => `<polygon points="${yildizNoktalari(x * w, y * h, w * 0.012, -90, 0.45)}" fill="#fff6c2"/>`)
    .join('');
  return svgSar(w, h, `<rect width="${w}" height="${h}" fill="#1d2a5c" opacity=".55"/>${yildizlar}<circle cx="${f(w * 0.72)}" cy="${f(h * 0.2)}" r="${f(w * 0.06)}" fill="#fff4c4" stroke="${KONTUR}" stroke-width="8"/><circle cx="${f(w * 0.745)}" cy="${f(h * 0.185)}" r="${f(w * 0.055)}" fill="#3a4a80" opacity=".0"/>`);
}
/** Şişmiş yanaklar (Fındık'ın yanak pozu yer tutucusu): iki yuvarlak balon yanak, kenarı çizgili */
export function yanakSvg(w: number, h: number, sol: [number, number], sag: [number, number], r: number, renk: string): string {
  const y = (x: number, yy: number) => `<ellipse cx="${f(x)}" cy="${f(yy)}" rx="${f(r)}" ry="${f(r * 0.86)}" fill="${renk}" stroke="${KONTUR}" stroke-width="${f(r * 0.07)}"/><ellipse cx="${f(x)}" cy="${f(yy + r * 0.2)}" rx="${f(r * 0.5)}" ry="${f(r * 0.3)}" fill="#ff8fa3" opacity=".5"/><ellipse cx="${f(x - r * 0.35)}" cy="${f(yy - r * 0.35)}" rx="${f(r * 0.22)}" ry="${f(r * 0.13)}" fill="#fff" opacity=".6"/>`;
  return svgSar(w, h, y(...sol) + y(...sag));
}
