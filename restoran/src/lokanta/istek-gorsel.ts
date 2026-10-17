/**
 * İstek balonu ve adisyon kartındaki resimler (yazısız): yemek resmi, ipucu resmi, sürpriz (şef şapkası + soru).
 * Gemini çizimi (`yiyecek/<tarif>`, `ui/ipucu-<ad>`, `ui/surpriz`) gelince o; gelene kadar SADE yer tutucu
 * (tek renkli basit şekil; süslü kod çizimi değil). Mini oyun simgeleri (yol haritası) `alet/<oyun>`.
 */
import { h } from '../../../src/ui/dom';
import { kaseGorsel } from '../mini/deneme';
import { izgaraGorsel } from '../mini/mangal';
import { borekTabakGorsel } from '../mini/sar';
import { sisTabakGorsel } from '../mini/sis';
import { sutlacGorsel } from '../mini/sutlac';
import type { Malzeme, YemekOzelligi } from '../mini/arayuz';
import type { Ipucu, Istek } from '../model';
import { TARIFLER } from '../model';
import { varlik } from '../varliklar';

const resim = (u: string, sinif: string) => h(`img.${sinif}`, { src: u, alt: '', draggable: 'false' });

/** Tarifin örnek tabağı (yer tutucu: başlıca malzemeleri renkli parçalar) */
const ORNEK: Record<string, Partial<Record<Malzeme, number>>> = {
  salata: { domates: 3, salatalik: 3, sogan: 1, maydanoz: 1 },
  menemen: { domates: 3, biber: 2, yumurta: 2 },
  ayran: { yogurt: 3 },
  patates: { patates: 6 },
  corba: { mercimek: 4, havuc: 1 },
  pankek: { muz: 2, bal: 1, cilek: 2 },
  pide: { kasar: 3, sucuk: 3 },
  kofte: { kofte: 3, ekmek: 1 },
  limonata: { limon: 3 },
};

/** P6 tarifleri: mini oyunun kendi tabak görünüşü (yer tutucu; Gemini `yiyecek/<tarif>` gelince o) */
const P6_RESIM: Record<string, () => HTMLElement> = {
  kofte: () => izgaraGorsel([0, 1, 2].map(() => ({ tur: 'kofte' as const, bicim: { sekil: 'yassi' as const, boy: 1, benek: [] }, pisme: 'altin', iz: 1 }))),
  sis: () => sisTabakGorsel([{ meyveler: ['cilek', 'muz', 'kavun', 'uzum'], bal: 1 }, { meyveler: ['uzum', 'cilek', 'muz', 'kavun'], bal: 0 }]),
  borek: () => borekTabakGorsel([0, 1, 2].map(() => ({ peynir: 1, maydanoz: 1, rulo: 1, yapisti: true, fiskirdi: false, p: 2.4, yagda: false }))),
  sutlac: () => sutlacGorsel([0, 1].map(() => ({ dolum: 0.85, tasti: false, p: 2.2, tarcin: 2 }))),
};

export function yemekResmi(tarif: string): HTMLElement {
  const u = varlik(`yiyecek/${tarif}`);
  if (u) return resim(u, 'rs-yemek-resmi');
  if (P6_RESIM[tarif]) return h('span.rs-yemek-resmi.rs-p6-resim', { 'data-tarif': tarif }, P6_RESIM[tarif]());
  const oz: YemekOzelligi = { malzemeler: {}, pisme: TARIFLER[tarif]?.sicak ? 'altin' : undefined };
  for (const [m, n] of Object.entries(ORNEK[tarif] ?? {})) oz.malzemeler[m as Malzeme] = { adet: n! };
  const el = kaseGorsel(oz, TARIFLER[tarif]?.sicak ? 'tava' : 'tabak');
  el.classList.add('rs-yemek-resmi');
  return el;
}

/** İpucu resimleri: sade yer tutucu SVG (çizim gelene kadar) */
const IPUCU_SVG: Record<Ipucu, string> = {
  serin: `<svg viewBox="0 0 64 64"><circle cx="26" cy="26" r="13" fill="#FFD449" stroke="#3B2416" stroke-width="3"/><path d="M48 30c4 7 6 10 6 13a6 6 0 0 1-12 0c0-3 2-6 6-13z" fill="#8FD3FF" stroke="#3B2416" stroke-width="3"/></svg>`,
  doyurucu: `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="34" rx="22" ry="17" fill="#C9473F" stroke="#3B2416" stroke-width="3"/><ellipse cx="32" cy="40" rx="11" ry="6" fill="#F28C8C"/></svg>`,
  domatesli: `<svg viewBox="0 0 64 64"><path d="M32 10c10 16 16 24 16 32a16 16 0 0 1-32 0c0-8 6-16 16-32z" fill="#E8483A" stroke="#3B2416" stroke-width="3"/></svg>`,
  citir: `<svg viewBox="0 0 64 64"><rect x="14" y="14" width="10" height="38" rx="4" fill="#F0B84A" stroke="#3B2416" stroke-width="3"/><rect x="28" y="10" width="10" height="42" rx="4" fill="#F0B84A" stroke="#3B2416" stroke-width="3"/><rect x="42" y="16" width="10" height="36" rx="4" fill="#F0B84A" stroke="#3B2416" stroke-width="3"/></svg>`,
  tatli: `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="36" rx="14" ry="11" fill="#FFC93C" stroke="#3B2416" stroke-width="3"/><path d="M24 34h16M24 40h16" stroke="#3B2416" stroke-width="3"/><ellipse cx="22" cy="22" rx="8" ry="6" fill="#fff" stroke="#3B2416" stroke-width="3"/><ellipse cx="42" cy="22" rx="8" ry="6" fill="#fff" stroke="#3B2416" stroke-width="3"/></svg>`,
  sebzeli: `<svg viewBox="0 0 64 64"><path d="M20 22l28 4-22 30z" fill="#F2902F" stroke="#3B2416" stroke-width="3" stroke-linejoin="round"/><path d="M22 20c-2-6 2-10 6-12M24 20c4-4 10-4 12 0" fill="none" stroke="#4FA83D" stroke-width="4" stroke-linecap="round"/></svg>`,
};
const SURPRIZ_SVG = `<svg viewBox="0 0 64 64"><path d="M16 36c-6-2-6-12 2-12 0-10 12-12 14-4 4-8 16-4 14 4 8 0 8 10 2 12v12H16z" fill="#fff" stroke="#3B2416" stroke-width="3" stroke-linejoin="round"/><text x="32" y="45" text-anchor="middle" font-size="18" font-family="Fredoka, sans-serif" font-weight="700" fill="#5FB8AE">?</text></svg>`;

/** P8 §7e: balon ikonlarının adresleri (Gemini balon-ikon-yemek / balon-ikon-durum; restoran-isle.cjs aynı adlarla keser) */
export const balonYemekYolu = (tarif: string) => `balon/yemek-${tarif}`;
export const balonIpucuYolu = (ip: Ipucu) => `balon/ipucu-${ip}`;

export function ipucuResmi(ip: Ipucu): HTMLElement {
  const u = varlik(balonIpucuYolu(ip)) ?? varlik(`ui/ipucu-${ip}`);
  return u ? resim(u, 'rs-ipucu-resmi') : h('span.rs-ipucu-resmi', { html: IPUCU_SVG[ip], 'data-ipucu': ip });
}

export function istekResmi(i: Istek): HTMLElement {
  if (i.tur === 'resimli' || i.tur === 'ozel') {
    const b = varlik(balonYemekYolu(i.tarif));
    const r = b ? resim(b, 'rs-yemek-resmi') : yemekResmi(i.tarif);
    if (i.tur !== 'ozel') return r;
    const d = i.ozel.deger;
    const sayi = !Array.isArray(d) && 'sayi' in d ? d.sayi : 0;
    return h('span.rs-istek-ozel', {}, r, h('span.rs-istek-nokta', {}, ...Array.from({ length: sayi }, () => h('i'))));
  }
  if (i.tur === 'ipuclu') return ipucuResmi(i.ipucu);
  const u = varlik('balon/soru') ?? varlik('ui/surpriz');
  return u ? resim(u, 'rs-ipucu-resmi') : h('span.rs-ipucu-resmi', { html: SURPRIZ_SVG, 'data-ipucu': 'surpriz' });
}

/** Yol haritası: tarifin mini oyunlarının alet resimleri (yazısız; çizim yoksa küçük renkli nokta) */
const YOL_RENK: Record<string, string> = { dogra: '#4FA83D', tava: '#3C3330', tabakla: '#5FB8AE', yika: '#8FD3FF', soy: '#E9C77B', kizart: '#F0B84A', icecek: '#FFF6E0', kazan: '#F2902F', 'kir-cirp': '#FFD449', rendele: '#C9C9C9', pide: '#D9A15B', yogur: '#B5654A', mangal: '#C9473F', sis: '#E5404F', sar: '#F3E0BB', sutlac: '#FBEFCF' };
export function yolHaritasi(tarif: string): HTMLElement {
  const t = TARIFLER[tarif];
  return h(
    'span.rs-yol',
    {},
    ...(t?.yol ?? []).map((o) => {
      const u = varlik(`alet/${o}`);
      return u ? resim(u, 'rs-yol-alet') : h('i.rs-yol-alet', { style: `background:${YOL_RENK[o] ?? '#ccc'}`, 'data-oyun': o });
    }),
  );
}
