/**
 * Pati Dükkânı v2 · Hayvan Defteri (keşif; PATI-V2 §4h). Yazı yok, hepsi resim.
 *
 *  - Her hayvanın sayfası: büyük resmi, adı ve ihtiyaç satırları (3-4: 4, 5-6: 6). Satırın başında ihtiyacın resmi
 *    (çekmece önündeki resim), yanında o ihtiyaç için denenen eşyaların küçük resimleri ve işaretleri:
 *    altın kalp (sever ★) · gülen yüz (olur) · burun kırıştırma yüzü (sevmez).
 *  - Eşyaya dokununca hayvan o tepkiyi minik olarak gösterir (resmi o poza geçer, ezilip esner).
 *  - 5-6: gizli sevgi bulunmadıysa satırında boş bir kalp durur (soru işareti değil).
 *  - Bütün ihtiyaçların ★'ı bulununca sayfaya Uzman rozeti (yıldızlı pati) gelir; Nehir: "Artık onu çok iyi
 *    tanıyorsun!". Hediye süs paket 3'te (mağaza / süsleme).
 *  - Üst çubuktaki defter düğmesiyle açılır; Bakım Odası'nda o hayvanın sayfası açılır.
 * Görseller: ui-defter (kırmızı defter), ui-altin-kalp; gelene kadar sade yer tutucu (düz SVG).
 */
import { h, TEST_MODU } from '../../src/ui/dom';
import type { Efekt } from '../../kino-otobus/src/efekt';
import { dolapEl, esyaEl, ezil } from './arayuz';
import { ISTE_POZ } from './bakim';
import { NEHIR2, type Yas } from './katalog';
import type { PatiKayit } from './kayit';
import type { Nehir } from './nehir';
import { ses } from './sesler';
import { defterSayfasi, uzmanMi } from './tercih';
import { ALTIN_KALP, DEFTER, pozAdresi, pozVar, type Poz } from './varliklar';

const AZ = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const sakin = () => AZ || TEST_MODU;
const K = '#3B2416';

/** İşaretler (sade düz SVG): altın kalp, gülen yüz, burun kırıştırma yüzü, boş kalp, yıldızlı pati */
const ISARET = {
  sever: `<svg viewBox="0 0 34 31"><path d="M17 28.5C7 21 2.5 15.6 2.5 9.8 2.5 5.4 5.9 2.5 10 2.5c3 0 5.4 1.7 7 4.2 1.6-2.5 4-4.2 7-4.2 4.1 0 7.5 2.9 7.5 7.3 0 5.8-4.5 11.2-14.5 18.7z" fill="#FFD23F" stroke="${K}" stroke-width="2.6" stroke-linejoin="round"/></svg>`,
  olur: `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="13.5" fill="#FFE27A" stroke="${K}" stroke-width="2.6"/><circle cx="11.5" cy="13" r="1.9" fill="${K}"/><circle cx="20.5" cy="13" r="1.9" fill="${K}"/><path d="M10 18.5c3.5 4 8.5 4 12 0" fill="none" stroke="${K}" stroke-width="2.4" stroke-linecap="round"/></svg>`,
  sevmez: `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="13.5" fill="#B9E3A8" stroke="${K}" stroke-width="2.6"/><path d="M9 12.5l4 1.5M23 12.5l-4 1.5" stroke="${K}" stroke-width="2.4" stroke-linecap="round"/><path d="M10 22c2-2 4 0 6-2s4 0 6-2" fill="none" stroke="${K}" stroke-width="2.4" stroke-linecap="round"/></svg>`,
  gizli: `<svg viewBox="0 0 34 31"><path d="M17 28.5C7 21 2.5 15.6 2.5 9.8 2.5 5.4 5.9 2.5 10 2.5c3 0 5.4 1.7 7 4.2 1.6-2.5 4-4.2 7-4.2 4.1 0 7.5 2.9 7.5 7.3 0 5.8-4.5 11.2-14.5 18.7z" fill="#FFF4DD" stroke="${K}" stroke-width="2.4" stroke-dasharray="4 3" stroke-linejoin="round"/></svg>`,
  uzman: `<svg viewBox="0 0 64 64"><path d="M32 4l7.6 15.4 17 2.5-12.3 12 2.9 16.9L32 42.8l-15.2 8 2.9-16.9-12.3-12 17-2.5z" fill="#FFD23F" stroke="${K}" stroke-width="3" stroke-linejoin="round"/><ellipse cx="32" cy="33" rx="7" ry="6" fill="#C98A4B"/><circle cx="24.5" cy="25" r="3" fill="#C98A4B"/><circle cx="32" cy="22.5" r="3" fill="#C98A4B"/><circle cx="39.5" cy="25" r="3" fill="#C98A4B"/></svg>`,
  defter: `<svg viewBox="0 0 48 48"><rect x="9" y="5" width="31" height="38" rx="5" fill="#E8605A" stroke="${K}" stroke-width="3"/><path d="M15 5v38" stroke="${K}" stroke-width="3"/><ellipse cx="28" cy="27" rx="5" ry="4.2" fill="#FFF4DD"/><circle cx="22.8" cy="20.6" r="2.2" fill="#FFF4DD"/><circle cx="28" cy="18.6" r="2.2" fill="#FFF4DD"/><circle cx="33.2" cy="20.6" r="2.2" fill="#FFF4DD"/></svg>`,
};
const isaretEl = (t: keyof typeof ISARET, sinif = 'pt-isaret') => (t === 'sever' && ALTIN_KALP ? h(`span.${sinif}`, { 'data-isaret': t }, h('img', { src: ALTIN_KALP, alt: '' })) : h(`span.${sinif}`, { 'data-isaret': t, html: ISARET[t] }));

/** Üst çubuktaki defter düğmesi (ui-defter; yoksa sade kırmızı defter) */
export function defterDugmesi(tik: () => void): HTMLButtonElement {
  const b = h('button.pt-defter-dugme', { type: 'button', 'aria-label': 'Hayvan Defteri' }, DEFTER ? h('img', { src: DEFTER, alt: '', draggable: 'false' }) : h('span', { html: ISARET.defter })) as HTMLButtonElement;
  b.addEventListener('click', tik);
  return b;
}

export interface DefterOrtam {
  efekt: Efekt;
  nehir: Nehir;
  kayit: PatiKayit;
  kaydet: () => void;
  yas: () => Yas;
  etkilesim: () => void;
}

export class Defter {
  readonly el: HTMLElement;
  private sekmeler: HTMLElement;
  private sayfa: HTMLElement;
  private secili: string | null = null;

  constructor(private o: DefterOrtam) {
    this.sekmeler = h('div.pt-defter-sekmeler');
    this.sayfa = h('div.pt-defter-sayfa');
    const kart = h('div.pt-defter-kart', {}, this.sekmeler, this.sayfa);
    this.el = h('div.pt-defter', { role: 'dialog', 'aria-label': 'Hayvan Defteri', 'aria-hidden': 'true' }, kart);
    this.el.addEventListener('click', (e) => {
      if (e.target === this.el) this.kapa();
    });
  }

  get acik() {
    return this.el.classList.contains('acik');
  }

  /** Defteri açar (id: o hayvanın sayfası; yoksa ilk hayvan) */
  ac(id: string | null) {
    const l = this.o.kayit.hayvanlar;
    if (!l.length) return;
    this.secili = id && l.some((x) => x.id === id) ? id : (this.secili && l.some((x) => x.id === this.secili) ? this.secili : l[0].id);
    ses.cekmece(true);
    this.el.classList.add('acik');
    this.el.removeAttribute('aria-hidden');
    this.ciz();
    if (!sakin()) this.el.firstElementChild!.animate([{ transform: 'translateY(40px) scale(.96)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 260, easing: 'ease-out' });
  }

  kapa() {
    if (!this.acik) return;
    ses.cekmece(false);
    this.el.classList.remove('acik');
    this.el.setAttribute('aria-hidden', 'true');
  }

  private ciz() {
    const k = this.o.kayit;
    const id = this.secili!;
    this.sekmeler.replaceChildren(
      ...k.hayvanlar.map((s) => {
        const b = h(`button.pt-defter-sekme${s.id === id ? '.secili' : ''}`, { type: 'button', 'data-hayvan': s.id, 'aria-label': s.ad }, h('img', { src: pozAdresi(s.id, 'bos').url, alt: '', draggable: 'false' }), k.uzman.includes(s.id) ? isaretEl('uzman', 'pt-sekme-rozet') : null);
        b.addEventListener('click', () => {
          this.o.etkilesim();
          this.secili = s.id;
          ses.cekmece(true);
          this.ciz();
        });
        return b;
      }),
    );
    const s = k.hayvanlar.find((x) => x.id === id)!;
    const resim = h('img.pt-defter-hayvan', { src: pozAdresi(id, 'bos').url, alt: '', draggable: 'false' }) as HTMLImageElement;
    const netlik = () => resim.naturalHeight && (resim.style.maxHeight = `${resim.naturalHeight / 3}px`);
    resim.addEventListener('load', netlik);
    netlik();
    const goster = (p: Poz) => {
      resim.src = pozAdresi(id, pozVar(id, p) ? p : 'bos').url;
      ezil(resim, 1.4, 360);
    };
    const satirlar = defterSayfasi(k, id, this.o.yas());
    const uzman = k.uzman.includes(id);
    this.sayfa.replaceChildren(
      h('div.pt-defter-sol', {}, h('div.pt-defter-resim', {}, resim, uzman ? isaretEl('uzman', 'pt-uzman') : null), h('b.pt-defter-ad', {}, s.ad)),
      h(
        'div.pt-defter-satirlar',
        {},
        ...satirlar.map((r) =>
          h(
            `div.pt-defter-satir${r.sever ? '.bulundu' : ''}`,
            { 'data-ihtiyac': r.ihtiyac },
            h('span.pt-defter-ihtiyac', {}, dolapEl(r.cekmece)),
            h(
              'span.pt-defter-esyalar',
              {},
              ...r.denenen.map((d) => {
                const b = h('button.pt-defter-esya', { type: 'button', 'data-esya': d.esya, 'data-tepki': d.tepki, 'aria-label': d.esya }, esyaEl(d.esya), isaretEl(d.tepki));
                b.addEventListener('click', () => {
                  this.o.etkilesim();
                  ezil(b, 1.2, 300);
                  // hayvan o tepkiyi minik olarak gösterir
                  if (d.tepki === 'sever') {
                    goster(ISTE_POZ[r.ihtiyac]);
                    window.setTimeout(() => goster('sevinc'), 700);
                    ses.kalp(2);
                  } else if (d.tepki === 'olur') {
                    goster('goz');
                    ses.kalp(0);
                  } else {
                    goster(pozVar(id, 'begenmedi') ? 'begenmedi' : 'saskin');
                    ses.hmm();
                  }
                  window.setTimeout(() => this.secili === id && goster('bos'), 1600);
                });
                return b;
              }),
              r.gizliBekliyor ? isaretEl('gizli', 'pt-defter-gizli') : null,
            ),
          ),
        ),
      ),
    );
  }

  /** Bir ★ bulundu: sayfa tamamlandıysa Uzman (bir kez). Dönen: şimdi Uzman oldu mu */
  uzmanKontrol(id: string): boolean {
    const k = this.o.kayit;
    if (k.uzman.includes(id) || !uzmanMi(k, id, this.o.yas())) return false;
    k.uzman.push(id);
    this.o.kaydet();
    void this.o.nehir.soyle(NEHIR2.uzman);
    ses.ksilofon();
    return true;
  }

  kapat() {
    this.el.remove();
  }
}
