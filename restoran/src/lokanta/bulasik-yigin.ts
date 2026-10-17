/**
 * Lavabodaki kirli tabak yığını (§3a/10, §8 M15): Kino'nun topladığı tabaklar lavaboda birikir (komik yığın). Çocuk
 * isterse masadaki kirli tabağı lavaboya kendisi de sürükler. Lavaboya girince Bulaşık mini oyunu bu tabaklarla açılır
 * (zorunlu değil); yıkanınca Babaanne bir bahşiş jetonu bırakır (lokanta kasaya ekler).
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import { surukleBagla, ustunde } from './surukle';

export interface YiginBaglam {
  el: HTMLElement;
  /** lavabo istasyon düğmesi */
  lavabo: () => HTMLElement | undefined;
  /** yığın değişince (lavabo düğmesi açılır / kapanır) */
  degisti: (adet: number) => void;
}

export interface BulasikYigini {
  ekle(tur: string): void;
  turler(): string[];
  adet(): number;
  /** Bulaşık mini oyunundan dönüş: n tabak yıkandı */
  yikandi(n: number): void;
  /** masadaki kirli tabak sürüklenebilir olur; lavaboya bırakılınca kaldir() çağrılır */
  kirliBagla(tabak: HTMLElement, tur: string, kaldir: () => void): void;
  ciz(): void;
}

export function bulasikYiginiKur(b: YiginBaglam): BulasikYigini {
  const yigin: string[] = [];
  const ciz = () => {
    const d = b.lavabo();
    if (!d) return;
    let kat = d.querySelector<HTMLElement>('.rs-lav-yigin');
    if (!kat) {
      kat = h('span.rs-lav-yigin', { 'aria-hidden': 'true' });
      d.append(kat);
    }
    kat.replaceChildren(...yigin.slice(0, 6).map((_, i) => h('i', { style: `--i:${i}` })));
    d.dataset.yigin = String(yigin.length);
    b.degisti(yigin.length);
  };
  const ekle = (tur: string) => {
    yigin.push(tur);
    ciz();
    const d = b.lavabo();
    if (d) {
      d.classList.remove('rs-hopla');
      void d.offsetWidth;
      d.classList.add('rs-hopla');
    }
  };
  return {
    ekle,
    turler: () => yigin.slice(0, 6),
    adet: () => yigin.length,
    yikandi(n) {
      yigin.splice(0, n);
      ciz();
    },
    kirliBagla(tabak, tur, kaldir) {
      tabak.classList.add('rs-tasinir');
      const birak = surukleBagla(tabak, b.el, {
        acik: () => tabak.isConnected,
        birak: (x, y) => {
          const d = b.lavabo();
          if (!d || !ustunde(d, x, y, 24)) return false;
          birak();
          kaldir();
          tabak.remove();
          ekle(tur);
          return true;
        },
      });
      // tabak masadan kalkınca dinleyici de gider
      const g = new MutationObserver(() => {
        if (!tabak.isConnected) {
          birak();
          g.disconnect();
        }
      });
      if (tabak.parentElement) g.observe(tabak.parentElement, { childList: true });
      if (TEST_MODU) tabak.dataset.tasinir = '1';
    },
    ciz,
  };
}
