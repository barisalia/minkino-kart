/**
 * Çizim yoldaşı: Çiz Canlansın'da sahnede eşlik eden Mino.
 * Konuşmaz (anlatıcı konuşur, ağzı oynamaz). Çizerken fırçaya bakar, bitince sevinir, canlanan resme şaşırır
 * ve dans eder; sihir beklenirken elinde sihirli değnekle büyü yapar.
 * Bu modül tembel yüklenir (cizim-yoldas-yuva.ts): Mino'nun çizimi oyunların ilk paketine girmez.
 * Yalnız Mino'nun mevcut tepkileri ve bakışı kullanılır (ifade ekleri yüklenmez).
 */
import '../styles/mino.css';
import './cizim-yoldas.css';
import { efekt } from '../audio/ses';
import { h, TEST_MODU } from '../ui/dom';
import { azHareket } from '../ui/hareket';
import { Mino, type Tepki } from './mino';

export interface CizimYoldas {
  el: HTMLElement;
  mino: Mino;
  /** Ekrandaki bir noktaya (fırça ucu) bakar. */
  izle(x: number): void;
  /** Sevinç: sırayla farklı tepkiler. `buyuk`: dans. */
  sevin(buyuk?: boolean): void;
  /** Şaşırır (canlanma anı). */
  sasir(): void;
  dans(): void;
  /** Küçük onay: başını sallar. */
  onayla(): void;
  /** Nazik teselli (sihir olmadı): başını sallar, mırlar. */
  nazik(): void;
  /** Sihirli değnekle büyü döngüsü (açık / kapalı). */
  buyu(acik: boolean): void;
  /** Değneğin yıldız ucunun ekrandaki yeri (değnek yoksa null). */
  asaUcu(): { x: number; y: number } | null;
  /** Dokununca küçük tepki versin mi (çizim alanının üstündeyken kapalı). */
  dokunulur(acik: boolean): void;
  kapat(): void;
}

// Değnek: sağ patinin içinden (kolun katmanında, patinin altında) sağ üste uzanır. Çizimin 2048'lik koordinatları.
const TUT = { x: 1286, y: 1548 };
const UC = { x: 1700, y: 1060 };
function asaSvg(): string {
  const { x: ax, y: ay } = TUT;
  const { x: bx, y: by } = UC;
  // beş köşeli yıldız (kalın koyu kahve kontur, parlak sarı, beyaz parlama)
  const yildiz: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? 60 : 136;
    yildiz.push(`${(bx + Math.cos(a) * r).toFixed(1)} ${(by + Math.sin(a) * r).toFixed(1)}`);
  }
  return (
    `<g class="cy-asa">` +
    `<path d="M${ax - 40} ${ay + 58}L${bx} ${by}" stroke="#3a1210" stroke-width="52" stroke-linecap="round"/>` +
    `<path d="M${ax - 40} ${ay + 58}L${bx} ${by}" stroke="#9b5ce0" stroke-width="28" stroke-linecap="round"/>` +
    `<path d="M${ax - 22} ${ay + 26}L${(ax + bx) / 2} ${(ay + by) / 2}" stroke="#d9c2ff" stroke-width="7" stroke-linecap="round"/>` +
    `<g class="cy-asa-yildiz"><circle class="cy-asa-isik" cx="${bx}" cy="${by}" r="230" fill="#fff6b8"/>` +
    `<path d="M${yildiz.join('L')}Z" fill="#ffc72c" stroke="#3a1210" stroke-width="16" stroke-linejoin="round"/>` +
    `<path d="M${bx - 40} ${by - 22}q14 -30 40 -34" stroke="#fff" stroke-width="14" stroke-linecap="round" fill="none" opacity="0.85"/></g>` +
    `</g>`
  );
}

export function cizimYoldasi(): CizimYoldas {
  const mino = new Mino();
  mino.agizSus = true;
  const el = h('div.cy-yoldas', { 'aria-hidden': 'true' }, mino.el);
  const az = azHareket();
  const SEVINC: Tepki[] = az ? ['evet', 'mir'] : ['sevinc', 'zipla', 'kolac', 'sevinc', 'evet'];
  let sonSevinc = -1;
  let bakZaman = 0;
  let bosZaman = 0;
  let buyuZaman = 0;
  let sonDokunma = 0;
  let sonIzle = 0;
  let kapandi = false;
  let buyuAcik = false;

  // Değnek sağ kolun katmanına, patinin altına eklenir (kolla birlikte döner)
  const kol = mino.el.querySelector('.kr');
  kol?.insertAdjacentHTML('afterbegin', asaSvg());
  const asaYildiz = mino.el.querySelector<SVGGElement>('.cy-asa-yildiz');

  function bakGeriDon(ms: number) {
    clearTimeout(bakZaman);
    bakZaman = window.setTimeout(() => mino.bak(0), ms);
  }

  function bosta() {
    clearTimeout(bosZaman);
    if (TEST_MODU || az || kapandi) return;
    bosZaman = window.setTimeout(() => {
      if (kapandi) return;
      if (!mino.mesgul && !buyuAcik && performance.now() - sonIzle > 1500) {
        const r = Math.random();
        if (r < 0.45) {
          mino.bak(Math.random() < 0.5 ? -0.6 : 0.6);
          bakGeriDon(900 + Math.random() * 800);
        } else if (r < 0.7) mino.tepki('mir', 1.8);
        else if (r < 0.8) mino.tepki('evet', 0.9);
      }
      bosta();
    }, 3000 + Math.random() * 3000);
  }

  mino.el.addEventListener('pointerdown', (e) => {
    const simdi = performance.now();
    if (simdi - sonDokunma < 700) return;
    sonDokunma = simdi;
    const b = mino.bolge(e.clientX, e.clientY);
    const t: Record<typeof b, Tepki> = { kafa: 'mir', burun: 'hapsu', gobek: 'gidik', kuyruk: 'zipla', ayak: 'evet' };
    mino.tepki(az && t[b] === 'zipla' ? 'evet' : t[b]);
    efekt.secim();
    bosta();
  });

  // Büyü: değnek havada döner, Mino kolunu sallar; arada küçük bir hop
  function buyuDongu() {
    clearTimeout(buyuZaman);
    if (!buyuAcik || kapandi) return;
    if (!mino.mesgul) {
      const r = Math.random();
      mino.tepki(az ? 'evet' : r < 0.7 ? 'selam' : r < 0.85 ? 'evet' : 'sevinc', az ? 1.4 : 1.3);
    }
    buyuZaman = window.setTimeout(buyuDongu, TEST_MODU ? 200 : 1350);
  }

  bosta();

  return {
    el,
    mino,
    izle(x) {
      const simdi = performance.now();
      if (simdi - sonIzle < 110) return;
      sonIzle = simdi;
      const r = mino.el.getBoundingClientRect();
      mino.bak((x - (r.left + r.width / 2)) / Math.max(140, innerWidth * 0.35));
      bakGeriDon(1400);
    },
    sevin(buyuk = false) {
      if (buyuk && !az) {
        mino.tepki('dans', 2.4);
        return;
      }
      let i = Math.floor(Math.random() * SEVINC.length);
      if (i === sonSevinc) i = (i + 1) % SEVINC.length;
      sonSevinc = i;
      mino.tepki(SEVINC[i]);
      bosta();
    },
    sasir() {
      mino.bak(0);
      mino.tepki(az ? 'evet' : 'sasir', 1.1);
    },
    dans() {
      mino.tepki(az ? 'evet' : 'dans', 2.6);
      bosta();
    },
    onayla() {
      if (!mino.mesgul) mino.tepki('evet', 0.8);
    },
    nazik() {
      buyuAcik = false;
      el.classList.remove('buyu');
      mino.bak(0);
      mino.tepki('evet', 1.1);
      window.setTimeout(() => !kapandi && mino.tepki('mir', 1.8), TEST_MODU ? 50 : 1300);
      bosta();
    },
    buyu(acik) {
      buyuAcik = acik;
      el.classList.toggle('buyu', acik);
      if (acik) {
        mino.bak(0.45);
        buyuDongu();
      } else {
        clearTimeout(buyuZaman);
        mino.bak(0);
      }
    },
    asaUcu() {
      if (!buyuAcik || !asaYildiz) return null;
      const r = asaYildiz.getBoundingClientRect();
      if (!r.width) return null;
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    },
    dokunulur(acik) {
      el.classList.toggle('dokunulur', acik);
    },
    kapat() {
      kapandi = true;
      clearTimeout(bakZaman);
      clearTimeout(bosZaman);
      clearTimeout(buyuZaman);
      mino.kapat();
    },
  };
}
