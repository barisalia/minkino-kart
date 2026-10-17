/**
 * Pati Dükkânı v2 · Mino'nun partisi (PATI-V2 §9c Z7). Müzik kutusu süsü konunca (ya da 5 danstan sonra) Mino dans
 * ederek gelir: "Dans zamanı!". Müzik kutusunun üç düğmesi, resimli: tavşan = hızlı, kaplumbağa = yavaş, ördek = komik.
 * Çocuk birini seçer; dükkândaki hayvanlar dans eder ama HER HAYVAN HER MÜZİĞE AYNI TEPKİYİ VERMEZ (ziyaret-sahneleri.ts
 * → dansTepkisi): Tospik yalnız yavaşta dans eder (hızlıda saklanır), köpek ve tavşan hızlıda deli gibi, ördek ve civciv
 * komikte paytak paytak, kedi komikte önce esner. Çocuk müziği değiştirip dener. İlk dansında her hayvan bir jeton
 * bırakır. Yalnız poz değişimi + ezilme-esneme; parça dönmez.
 */
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { ezil } from './arayuz';
import type { Hayvan } from './hayvan';
import { ses } from './sesler';
import { adres, pozAdresi, pozVar } from './varliklar';
import { dansTepkisi, MUZIK, type Muzik } from './ziyaret-sahneleri';

/** Komik müzik düğmesi: Banyo'nun lastik ördeği (onaylı çizim; eski Recraft ördek resmi yerine) */
const ORDEK = import.meta.glob<string>('../../assets/banyo/ordek.webp', { eager: true, query: '?url', import: 'default' })['../../assets/banyo/ordek.webp'];
const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, sure(ms)));

export interface PartiOrtam {
  /** dans edecek hayvanlar (görünen bölümdekiler) */
  hayvanlar: () => { id: string; hv: Hayvan }[];
  /** hayvanın ayağının dibine jeton */
  jetonBirak: (id: string, n: number) => void;
  /** Mino dans eder ve konuşur */
  minoDans: (vurus: number, aralik: number) => Promise<void>;
  minoSoyle: (anahtar: 'yasasin' | 'hihi' | 'super') => Promise<void>;
  etkilesim: () => void;
}

export class Parti {
  readonly el: HTMLElement;
  private calan: Muzik | null = null;
  private dansEden = new Set<string>();
  private secim = 0;
  private kapandi = false;
  /** son seçilen müzik (test) */
  son: Muzik | null = null;
  /** seçimler (test) */
  readonly gecmis: { muzik: Muzik; tepkiler: Record<string, string> }[] = [];

  constructor(private o: PartiOrtam) {
    const dugme = (m: Muzik, resim: string | null) => {
      const b = h('button.pt-parti-dugme', { type: 'button', 'data-muzik': m, 'aria-label': m }, resim ? h('img', { src: resim, alt: '', draggable: 'false' }) : h('span.pt-yer-tutucu'));
      b.addEventListener('click', () => {
        this.o.etkilesim();
        ezil(b, 1.6, 360);
        void this.cal(m);
      });
      return b;
    };
    const kutu = adres('esya-muzik-kutusu');
    this.el = h(
      'div.pt-parti',
      { 'aria-label': 'Müzik kutusu' },
      kutu ? h('img.pt-parti-kutu', { src: kutu, alt: '', draggable: 'false' }) : null,
      h('div.pt-parti-dugmeler', {}, dugme('hizli', pozAdresi('pofuduk', 'bos').url), dugme('yavas', adres('tospik-bos', 'kadro-b-tospik')), dugme('komik', ORDEK ?? null)),
    );
  }

  /** Bir müzik çalar: hayvanlar kendi tepkisiyle dans eder, Mino da */
  async cal(m: Muzik) {
    if (this.kapandi) return;
    this.calan = m;
    this.son = m;
    const no = ++this.secim;
    for (const b of this.el.querySelectorAll<HTMLElement>('.pt-parti-dugme')) b.classList.toggle('secili', b.dataset.muzik === m);
    const { aralik, vurus } = MUZIK[m];
    // müzik: vuruş başına bir nota (Web Audio)
    let i = 0;
    const z = window.setInterval(() => {
      if (this.kapandi || this.secim !== no || i >= vurus) return clearInterval(z);
      ses.partiNota(m, i++);
    }, sure(aralik));
    ses.partiNota(m, i++);
    const tepkiler: Record<string, string> = {};
    const isler = this.o.hayvanlar().map(async ({ id, hv }) => {
      const t = dansTepkisi(id, m);
      tepkiler[id] = t;
      if (t === 'saklan') {
        // kaplumbağa hızlıda kabuğuna çekilir (şaşkın / beğenmedi pozu, ezilerek küçülür)
        await hv.anlik(pozVar(id, 'saskin') ? 'saskin' : 'begenmedi', aralik * vurus);
        return;
      }
      if (t === 'esne') await hv.anlik('esneme', 900);
      if (t === 'paytak') {
        for (let k = 0; k < vurus && !this.kapandi; k++) {
          hv.cevir();
          void hv.zipla(18, aralik * 0.9, k % 2 ? 'sevinc' : undefined);
          await bekle(aralik);
        }
      } else if (t === 'deli') {
        await hv.dans(vurus + 4, aralik * 0.8, (k) => k % 4 === 0 && hv.sesi(1));
        await hv.zipla(70, 420, 'sevinc');
      } else await hv.dans(t === 'esne' ? Math.max(3, vurus - 3) : vurus, aralik, () => undefined);
      // ilk dansında bir jeton
      if (!this.dansEden.has(id) && !this.kapandi) {
        this.dansEden.add(id);
        this.o.jetonBirak(id, 1);
      }
    });
    this.gecmis.push({ muzik: m, tepkiler });
    const sozler: ('yasasin' | 'hihi' | 'super')[] = ['yasasin', 'hihi', 'super'];
    void this.o.minoSoyle(sozler[(this.secim - 1) % 3]);
    await Promise.all([this.o.minoDans(vurus, aralik), ...isler]);
    if (this.secim === no) {
      this.calan = null;
      for (const b of this.el.querySelectorAll<HTMLElement>('.pt-parti-dugme')) b.classList.remove('secili');
    }
  }

  get caliyor() {
    return this.calan !== null;
  }
  get secimSayisi() {
    return this.secim;
  }

  kapat() {
    this.kapandi = true;
    this.el.remove();
    if (TEST_MODU) return;
  }
}
