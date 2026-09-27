/**
 * Mino yoldaş: kart oyunlarında sahnede eşlik eden kedi. Konuşmaz (anlatıcı konuşur, Mino'nun ağzı oynamaz);
 * doğruda çeşitli sevinç tepkileri, yanlışta doğru karta bakıp başını sallar, beklerken etrafına bakınır.
 * Yalnız Mino'nun mevcut tepkileri ve bakışı kullanılır (ifade ekleri yüklenmez).
 */
import { efekt } from '../audio/ses';
import { Mino, type Tepki } from '../mino/mino';
import { h, TEST_MODU } from '../ui/dom';
import { azHareket } from '../ui/hareket';

export interface Yoldas {
  el: HTMLElement;
  mino: Mino;
  /** Doğru cevap / eşleşme: sırayla farklı sevinç tepkileri. `buyuk`: tur sonu gibi büyük an (dans). */
  sevin(buyuk?: boolean): void;
  /** Yanlış cevap: doğru karta bakar ve cesaretlendirir gibi başını sallar. */
  cesaret(bakilacak?: Element | null): void;
  /** Ekranda bir noktaya (x) kısa süre bakar. */
  bakNokta(x: number, ms?: number): void;
  /** Kartları dağıtan patinin ekrandaki yeri. */
  patiNoktasi(): { x: number; y: number };
  /** Kart dağıtırken el sallar gibi fırlatır. */
  dagit(): void;
  kapat(): void;
}

export function minoYoldas(): Yoldas {
  const mino = new Mino();
  mino.agizSus = true;
  const el = h('div.yoldas', { 'aria-hidden': 'true' }, mino.el);
  const az = azHareket();
  const SEVINC: Tepki[] = az ? ['evet', 'mir'] : ['sevinc', 'zipla', 'evet', 'kolac', 'sevinc', 'gidik'];
  let sonSevinc = -1;
  let bakZaman = 0;
  let bosZaman = 0;
  let sonDokunma = 0;
  let kapandi = false;

  function bakNokta(x: number, ms = 1400) {
    const r = mino.el.getBoundingClientRect();
    const yon = (x - (r.left + r.width / 2)) / Math.max(160, innerWidth * 0.4);
    mino.bak(yon);
    clearTimeout(bakZaman);
    bakZaman = window.setTimeout(() => mino.bak(0), ms);
  }

  // Beklerken bakınma: arada bir sağa sola bakar, kartlara göz atar, keyifle mırlar
  function bosta() {
    clearTimeout(bosZaman);
    if (TEST_MODU || az || kapandi) return;
    bosZaman = window.setTimeout(() => {
      if (kapandi) return;
      if (!mino.mesgul) {
        const r = Math.random();
        if (r < 0.4) {
          mino.bak(Math.random() < 0.5 ? -(0.4 + Math.random() * 0.5) : 0.5 + Math.random() * 0.5);
          clearTimeout(bakZaman);
          bakZaman = window.setTimeout(() => mino.bak(0), 900 + Math.random() * 900);
        } else if (r < 0.62) {
          // önce bir yana, sonra öbür yana bakınır
          mino.bak(-0.8);
          clearTimeout(bakZaman);
          bakZaman = window.setTimeout(() => {
            mino.bak(0.8);
            bakZaman = window.setTimeout(() => mino.bak(0), 800);
          }, 700);
        } else if (r < 0.74) mino.tepki('mir', 1.8);
        else if (r < 0.8) mino.tepki('evet', 0.9);
      }
      bosta();
    }, 2600 + Math.random() * 3000);
  }

  // Mino'ya dokununca küçük tepkiler (konuşmadan, soruyu bölmesin)
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

  bosta();

  return {
    el,
    mino,
    sevin(buyuk = false) {
      if (buyuk && !az) {
        mino.tepki('dans', 2.2);
        return;
      }
      let i = Math.floor(Math.random() * SEVINC.length);
      if (i === sonSevinc) i = (i + 1) % SEVINC.length;
      sonSevinc = i;
      mino.tepki(SEVINC[i]);
      bosta();
    },
    cesaret(bakilacak) {
      if (bakilacak) {
        const r = bakilacak.getBoundingClientRect();
        bakNokta(r.left + r.width / 2, 2000);
      }
      mino.tepki('evet', 1.1);
      bosta();
    },
    bakNokta,
    patiNoktasi() {
      const r = mino.el.getBoundingClientRect();
      return { x: r.left + r.width * 0.7, y: r.top + r.height * 0.66 };
    },
    dagit() {
      if (!az) mino.tepki('selam', 1.1);
    },
    kapat() {
      kapandi = true;
      clearTimeout(bakZaman);
      clearTimeout(bosZaman);
      mino.kapat();
    },
  };
}
