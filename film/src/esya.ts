/**
 * Film eşyaları: gerçek çizimler assets/film/<film>/<ad>.webp; olmayanlar için stil kurallarına uygun SVG yer
 * tutucular (yuvarlak hatlar, kalın koyu kahve kontur, az dozda parlaklık).
 */
import { h } from '../../src/ui/dom';

const K = '#5a3617';
// arka-*: motor.ts; mino-sarilma-karpuz yerine karpuz.webp kullanılır
const GORSELLER = import.meta.glob<string>(['../../assets/film/**/*.webp', '!**/arka-*.webp', '!**/mino-sarilma-karpuz.webp'], { eager: true, query: '?url', import: 'default' });

const SVG: Record<string, string> = {
  karpuz: `<svg viewBox="0 0 200 150"><ellipse cx="100" cy="80" rx="92" ry="64" fill="#3f9a3a" stroke="${K}" stroke-width="7"/>
    <path d="M30 60Q60 40 70 80T60 136M80 22Q110 60 95 100T105 144M130 20Q150 60 140 100T150 140M165 40Q185 70 175 110" fill="none" stroke="#1f6a24" stroke-width="10" stroke-linecap="round"/>
    <ellipse cx="62" cy="46" rx="26" ry="11" fill="#fff" opacity=".45" transform="rotate(-18 62 46)"/></svg>`,
  'karpuz-yarim': `<svg viewBox="0 0 200 120"><path d="M8 20h184a92 92 0 0 1-184 0z" fill="#3f9a3a" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M22 20h156a78 78 0 0 1-156 0z" fill="#f7f0c8"/><path d="M30 20h140a70 70 0 0 1-140 0z" fill="#ee3b43"/>
    <ellipse cx="100" cy="20" rx="92" ry="10" fill="#ee3b43" stroke="${K}" stroke-width="6"/><ellipse cx="100" cy="20" rx="80" ry="6" fill="#ff6c6f"/>
    ${[[60, 50], [85, 64], [115, 64], [140, 50], [100, 44], [72, 36], [128, 36]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4.5" ry="7" fill="#3a1f14"/>`).join('')}</svg>`,
  bicak: `<svg viewBox="0 0 200 60"><rect x="4" y="18" width="70" height="26" rx="12" fill="#b9793a" stroke="${K}" stroke-width="6"/>
    <path d="M74 20H176Q198 31 176 42H74Z" fill="#dfe6ee" stroke="${K}" stroke-width="6" stroke-linejoin="round"/><path d="M84 26H168" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`,
  kasa: `<svg viewBox="0 0 200 140"><rect x="6" y="10" width="188" height="124" rx="12" fill="#d8914c" stroke="${K}" stroke-width="7"/>
    <path d="M6 52H194M6 94H194" stroke="${K}" stroke-width="6"/><path d="M20 22H180M20 64H180M20 106H180" stroke="#f3b977" stroke-width="5" stroke-linecap="round" opacity=".8"/></svg>`,
  'karpuz-dilim': `<svg viewBox="0 0 120 110"><path d="M8 20Q60 124 112 20Z" fill="#3f9a3a" stroke="${K}" stroke-width="7" stroke-linejoin="round"/><path d="M18 22Q60 106 102 22Z" fill="#f7f0c8"/><path d="M24 22Q60 96 96 22Z" fill="#ee3b43"/><path d="M8 20H112" stroke="${K}" stroke-width="7" stroke-linecap="round"/>
    ${[[46, 36], [74, 36], [60, 56], [52, 30], [68, 30]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="3.5" ry="5.5" fill="#3a1f14"/>`).join('')}<path d="M30 26Q44 30 58 28" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".5" fill="none"/></svg>`,
  cekirdek: `<svg viewBox="0 0 20 28"><path d="M10 2Q18 12 16 20Q13 27 10 27Q7 27 4 20Q2 12 10 2Z" fill="#3a1f14" stroke="${K}" stroke-width="2"/><ellipse cx="8" cy="12" rx="2" ry="4" fill="#fff" opacity=".4"/></svg>`,
  tabak: `<svg viewBox="0 0 200 60"><ellipse cx="100" cy="30" rx="94" ry="24" fill="#fff" stroke="${K}" stroke-width="6"/><ellipse cx="100" cy="28" rx="62" ry="13" fill="#eef3f7"/></svg>`,
};

/**
 * Katmanlı pozlar (ortak çerçevede üst üste; ekip notu assets/film/<film>/<ad>.json). Karpuz katmanı yerine bizim
 * karpuz.webp dönüşümle yerleşir: sahnedeki karpuz eşyasıyla birebir aynı görünür, geçiş fark edilmez.
 */
const KATMANLI: Record<string, { cerceve: [number, number]; katmanlar: { ad: string; w: number; h: number; donusum?: string }[] }> = {
  'mino-sarilma': {
    cerceve: [1209, 1286],
    katmanlar: [
      { ad: 'mino-sarilma-arka', w: 1209, h: 1286 },
      { ad: 'karpuz', w: 1200, h: 1078, donusum: 'translate(458.8 791.8) rotate(71.26) scale(0.8288 0.882) translate(-599.7 -611.8)' },
      { ad: 'mino-sarilma-on', w: 1209, h: 1286 },
    ],
  },
};

/** Sarılma pozunda karpuz: çerçevedeki merkezi ve (ortalama) ölçeği; motor pozu sahnedeki karpuza hizalar */
export const SARILMA_KARPUZ = { merkez: [458.8, 791.8] as const, olcek: (0.8288 + 0.882) / 2, aci: 71.26, cerceve: [1209, 1286] as const };

/**
 * Başka setlerdeki hazır çizimler (filmin kendi klasöründe yoksa): meyve, banyodaki top, pazar sepeti.
 * Yeni çizim gerekmesin diye (Kino ve Elma Kulesi).
 */
const DIS_GORSEL = import.meta.glob<string>(['../../assets/meyveler/elma.webp', '../../assets/banyo/top.webp', '../../assets/pazar/sepet.webp'], { eager: true, query: '?url', import: 'default' });
const DIS: Record<string, string> = { elma: '../../assets/meyveler/elma.webp', top: '../../assets/banyo/top.webp', sepet: '../../assets/pazar/sepet.webp' };
/** Eşyanın görsel adresi (varsa): önce filmin klasörü, sonra ortak malzeme klasörü, sonra hazır setler */
export function esyaAdresi(tip: string, film: string, malzeme?: string): string | undefined {
  return GORSELLER[`../../assets/film/${film}/${tip}.webp`] ?? (malzeme ? GORSELLER[`../../assets/film/${malzeme}/${tip}.webp`] : undefined) ?? (DIS[tip] ? DIS_GORSEL[DIS[tip]] : undefined);
}

/**
 * Karakter parçasından eşya: iskeletteki tek bir katmanın kopyası (ör. kasanın arkasından çıkan Kino kuyruğu).
 * İskelet SVG'si bir kez indirilir; katman kendi kutusuna kırpılır (viewBox), dönme noktası ESYA_MERKEZ'de.
 */
const ISKELET = import.meta.glob<string>('../../assets/karakter-iskelet/kino.svg', { eager: true, query: '?url', import: 'default' });
const PARCA_ESYA: Record<string, { iskelet: string; katman: string; kutu: [number, number, number, number]; don: [number, number] }> = {
  'kino-kuyruk': { iskelet: 'kino', katman: 'kuyruk', kutu: [1218, 1391, 282, 301], don: [1262, 1648] },
};
const iskeletMetin = new Map<string, Promise<string | null>>();
function parcaEsya(tip: string): HTMLElement {
  const p = PARCA_ESYA[tip];
  const el = h('div.fl-esya-resim.fl-parca-esya');
  let metin = iskeletMetin.get(p.iskelet);
  if (!metin) {
    const url = ISKELET[`../../assets/karakter-iskelet/${p.iskelet}.svg`];
    metin = url ? fetch(url).then((r) => (r.ok ? r.text() : null)).catch(() => null) : Promise.resolve(null);
    iskeletMetin.set(p.iskelet, metin);
  }
  void metin.then((m) => {
    const g = m?.match(new RegExp(`<g[^>]*id="${p.katman}"[^>]*>[\\s\\S]*?</g>`))?.[0];
    if (!g) return;
    const [x, y, w, hh] = p.kutu;
    el.innerHTML = `<svg viewBox="${x} ${y} ${w} ${hh}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${g.replace(/\sid="[^"]*"/, '')}</svg>`;
  });
  return el;
}

/** Eşyanın dönme noktası (kutuya göre %; yoksa merkez): parçadan eşyalar kökünden döner */
export const ESYA_MERKEZ: Record<string, [number, number]> = Object.fromEntries(
  Object.entries(PARCA_ESYA).map(([ad, p]) => [ad, [((p.don[0] - p.kutu[0]) / p.kutu[2]) * 100, ((p.don[1] - p.kutu[1]) / p.kutu[3]) * 100]]),
);

/** Görselin altındaki boş pay (kutu yüksekliğinin oranı): eşya y'ye tam otursun, havada durmasın */
export const ESYA_ALT: Record<string, number> = { elma: 24 / 560, top: 11 / 372, sepet: 24 / 560 };

/** Eşya elemanı: varsa gerçek görsel, yoksa SVG yer tutucu */
export function esyaCiz(tip: string, film: string, malzeme?: string): HTMLElement {
  if (PARCA_ESYA[tip]) return parcaEsya(tip);
  // kendi klasöründe yoksa ortak malzeme ya da hazır setler (katmanlı pozlar hariç: onlar filmin kendi klasöründe)
  const dis = !GORSELLER[`../../assets/film/${film}/${tip}.webp`] && !KATMANLI[tip] ? esyaAdresi(tip, film, malzeme) : undefined;
  if (dis) return h('img.fl-esya-resim', { src: dis, alt: '', draggable: 'false' });
  const kat = KATMANLI[tip];
  if (kat) {
    const [W, H] = kat.cerceve;
    const resimler = kat.katmanlar
      .map((k) => {
        const url = GORSELLER[`../../assets/film/${film}/${k.ad}.webp`] ?? '';
        return `<image href="${url}" width="${k.w}" height="${k.h}"${k.donusum ? ` transform="${k.donusum}"` : ''}/>`;
      })
      .join('');
    return h('div.fl-esya-resim.fl-katmanli', { html: `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${resimler}</svg>` });
  }
  const url = GORSELLER[`../../assets/film/${film}/${tip}.webp`];
  if (url) return h('img.fl-esya-resim', { src: url, alt: '', draggable: 'false' });
  return h('div.fl-esya-resim', { html: SVG[tip] ?? SVG.kasa, 'data-yer-tutucu': '1' });
}

/** Eşyanın en/boy oranı (yer tutucular için) */
export const ESYA_ORAN: Record<string, number> = {
  karpuz: 1.113, 'karpuz-yarim': 1.134, 'karpuz-dilim': 1.077, tabak: 1.362, bicak: 4.082, kasa: 1.429, cekirdek: 20 / 28,
  'mino-sarilma': 1209 / 1286,
  elma: 1, top: 369 / 372, sepet: 1, 'kino-kuyruk': 282 / 301,
};
