/**
 * Kino'nun Otobüsü: dükkânın içi (yalnız süs, hiçbiri dokunuşu almaz). Sıcak ışık, pencerenin tepesinde sallanan
 * külah zinciri (var olan külah ve top görselleri), duvarda resimli kara tahta menü, kavanozlu raf ve sarkan lamba
 * (Ek C yer tutucuları), dolabın camından yükselen soğuk buhar.
 *
 * Duvar süsleri ses düğmesinin solunda ve sos rafının üstünde kalan boş duvara yerleşir (duvarYerlestir: her ölçüde
 * yeniden; yer yoksa o süs gizlenir). Dikey ekranda (tablet dikey) duvar yok: yalnız ışık, zincir ve buhar.
 */
import { h } from '../../src/ui/dom';
import { type Tat } from './model';
import { gorsel, topAdi } from './varliklar';

const ZINCIR_TATLARI: Tat[] = ['cilek', 'vanilya', 'cikolata', 'limon', 'fistik', 'yabanmersini', 'cilek'];

/** Pencerenin tepesinde, fırfırın altında sarkan külah zinciri (her külah kendi sarkacıyla sallanır) */
export function kulahZinciri(): HTMLElement {
  const n = ZINCIR_TATLARI.length;
  const kulahlar = ZINCIR_TATLARI.map((t, i) => {
    const x = (i + 0.5) / n;
    // ip sarkık: ortadakiler daha aşağıda (parabol)
    const sark = 4 * x * (1 - x);
    return h(
      'i.ko-zincir-kulah',
      { style: `left:${(x * 100).toFixed(2)}%;--sark:${sark.toFixed(3)};--i:${i}` },
      h('span.ko-zincir-top', { html: gorsel(topAdi(t)) }),
      h('span.ko-zincir-kap', { html: gorsel('kulah') }),
    );
  });
  const ip = `<svg class="ko-zincir-ip" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0Q50 20 100 0" fill="none" stroke="#5A3423" stroke-width="2.2" vector-effect="non-scaling-stroke"/></svg>`;
  return h('div.ko-zincir', { 'aria-hidden': 'true', html: ip }, ...kulahlar);
}

/** Sıcak ışık: lambadan yayılan amber parıltı ve köşelerde yumuşak gölge (dokunuşları geçirir) */
export const sicakIsik = () => h('div.ko-sicak-isik', { 'aria-hidden': 'true' }, h('i.ko-isik-parilti'), h('i.ko-isik-golge'));

/** Dolabın camından yükselen soğuk buhar (dört tutam, sırayla) */
export const dolapBuhari = () => h('div.ko-buhar', { 'aria-hidden': 'true' }, ...[0, 1, 2, 3].map((i) => h('i', { style: `--i:${i}` })));

interface Bos {
  sol: number;
  ust: number;
  en: number;
  boy: number;
}
export interface Duvar {
  el: HTMLElement;
  /**
   * Boş duvara yerleştirir (px; ust-kat'a göre). yan: ses düğmesinin solu (tepeden ses düğmesinin altına kadar);
   * alti: ses düğmesinin altından sos rafına kadar, tam en (Gün 1'de geniş; raf iki sıralıyken yok).
   */
  yerlestir(yan: Bos, alti: Bos, u: number): void;
  gizle(): void;
}

/** Duvar süsleri: kara tahta, kavanoz rafı, lamba */
export function duvarSusleri(): Duvar {
  const tahta = h('div.ko-duvar-tahta', { html: gorsel('kara-tahta') });
  const kavanoz = h('div.ko-duvar-kavanoz', { html: gorsel('kavanoz-rafi') });
  const lamba = h('div.ko-duvar-lamba', { html: gorsel('lamba') });
  const el = h('div.ko-duvar', { 'aria-hidden': 'true' }, lamba, tahta, kavanoz);
  const koy = (e: HTMLElement, x: number, y: number, en: number, boy: number) => {
    e.hidden = false;
    e.style.cssText = `left:${x.toFixed(1)}px;top:${y.toFixed(1)}px;width:${en.toFixed(1)}px;height:${boy.toFixed(1)}px`;
  };
  const gizle = () => {
    for (const e of [tahta, kavanoz, lamba]) e.hidden = true;
  };
  return {
    el,
    gizle,
    yerlestir(b, alti, u) {
      gizle();
      const TAHTA = 240 / 180;
      const KAV = 240 / 150;
      const pay = 6 * u;
      if (alti.boy >= 40 * u && alti.en >= 80 * u) {
        // Gün 1 (raf tek sıra): kara tahta ses düğmesinin solunda, kavanoz rafı altında tam enle
        const tBoy = Math.min(b.boy - 2 * pay, 72 * u, (b.en - pay) / TAHTA);
        if (tBoy >= 36 * u) koy(tahta, b.sol + (b.en - tBoy * TAHTA) / 2, b.ust + pay, tBoy * TAHTA, tBoy);
        // geniş duvarda (tablet) kara tahtanın solunda sarkan lamba
        const lEn = 30 * u;
        const bosSol = (b.en - tBoy * TAHTA) / 2;
        if (bosSol >= lEn + 2 * pay) koy(lamba, b.sol + bosSol / 2 - lEn / 2, b.ust - 4 * u, lEn, lEn * 1.6);
        const kBoy = Math.min(alti.boy - pay, 64 * u, (alti.en - 2 * pay) / KAV);
        koy(kavanoz, alti.sol + (alti.en - kBoy * KAV) / 2, alti.ust + alti.boy - kBoy, kBoy * KAV, kBoy);
        return;
      }
      if (b.en < 60 * u || b.boy < 44 * u) return;
      // geniş ve alçak duvar (Gün 2-3): sağda kara tahta, solunda kavanoz rafı ya da lamba
      const tBoy = Math.min(b.boy - pay, 72 * u);
      const tEn = tBoy * TAHTA;
      if (tEn > b.en) return;
      koy(tahta, b.sol + b.en - tEn, b.ust + (b.boy - tBoy) / 2, tEn, tBoy);
      let kalan = b.en - tEn - pay;
      const kBoy = Math.min(tBoy * 0.75, 54 * u);
      if (kalan >= kBoy * KAV) {
        koy(kavanoz, b.sol + kalan - kBoy * KAV, b.ust + b.boy - kBoy, kBoy * KAV, kBoy);
        kalan -= kBoy * KAV + pay;
      }
      const lEn = 30 * u;
      if (kalan >= lEn) koy(lamba, b.sol + Math.max(0, kalan / 2 - lEn / 2), b.ust - 4 * u, lEn, Math.min(b.boy * 0.9, lEn * 1.6));
    },
  };
}
