/**
 * Mino tezgâhta hiç donmasın: boşta kaldıkça küçük işler yapar. Meyveleri düzeltir, müşteriye el sallar,
 * geçen yayalara bakar, mırlar; çocuk bir ürünü sürüklerken gözleriyle onu izler.
 * Yalnız Mino'nun kendi tepkilerini çağırır (transform); konuşurken ve başka bir tepki oynarken araya girmez.
 */
import { konusuyorMu } from '../../src/audio/ses';
import type { Mino } from '../../src/mino/mino';
import { TEST_MODU } from '../../src/ui/dom';
import { AZ_HAREKET } from './canli';

const ras = (a: number, b: number) => a + Math.random() * (b - a);

export interface MinoCanliSecenek {
  /** tezgâhta düzeltilecek ürün var mı */
  urunVar: () => boolean;
  /** müşteri tezgâhta bekliyor mu */
  musteriVar: () => boolean;
}

export class MinoCanli {
  private z = 0;
  private bakZ = 0;
  private merkez = 0;
  private izliyor = false;
  private kapandi = false;

  constructor(
    private mino: Mino,
    private s: MinoCanliSecenek,
  ) {
    if (TEST_MODU || AZ_HAREKET) return;
    this.planla(ras(1800, 2800));
  }

  private planla(ms: number) {
    clearTimeout(this.z);
    this.z = window.setTimeout(() => this.bir(), ms);
  }

  /** Sıradaki küçük iş (Mino boşsa) */
  private bir() {
    if (this.kapandi) return;
    const m = this.mino;
    if (m.mesgul || this.izliyor || konusuyorMu()) {
      this.planla(ras(700, 1200));
      return;
    }
    const secenekler: [number, () => void][] = [
      [this.s.urunVar() ? 3 : 0, () => m.tepki('duzelt')],
      [2, () => this.bakin(Math.random() < 0.5 ? -1 : 1, ras(1100, 1900))],
      [this.s.musteriVar() ? 1.5 : 0, () => m.tepki('selam')],
      [this.s.musteriVar() ? 1.5 : 0.5, () => this.bakin(-0.8, ras(900, 1500))],
      [1, () => m.tepki('mir', 1.6)],
    ];
    const toplam = secenekler.reduce((a, [w]) => a + w, 0);
    let r = Math.random() * toplam;
    for (const [w, f] of secenekler) {
      r -= w;
      if (r <= 0 && w > 0) {
        f();
        break;
      }
    }
    this.planla(ras(2600, 4600));
  }

  /** Bir yöne bir süre bakar, sonra karşıya döner */
  bakin(yon: number, ms: number) {
    clearTimeout(this.bakZ);
    this.mino.bak(yon);
    this.bakZ = window.setTimeout(() => {
      if (!this.izliyor) this.mino.bak(0);
    }, ms);
  }

  /** Müşteri geliyor: ona bakar ve el sallar */
  karsila() {
    if (this.kapandi) return;
    this.bakin(-0.9, 2200);
    this.mino.tepki('selam');
  }

  /** Müşteri gidiyor: arkasından bakıp el sallar */
  ugurla() {
    if (this.kapandi) return;
    this.bakin(-1, 1600);
    window.setTimeout(() => !this.kapandi && this.mino.tepki('selam', 1.2), 250);
  }

  /** Sürükleme başladı: Mino ürünü gözleriyle izler */
  izleBasla() {
    const r = this.mino.el.getBoundingClientRect();
    this.merkez = r.left + r.width / 2;
    this.izliyor = true;
    clearTimeout(this.bakZ);
  }
  izle(x: number) {
    if (!this.izliyor) return;
    this.mino.bak((x - this.merkez) / 160);
  }
  izleBitti() {
    this.izliyor = false;
    this.bakZ = window.setTimeout(() => this.mino.bak(0), 500);
  }

  kapat() {
    this.kapandi = true;
    clearTimeout(this.z);
    clearTimeout(this.bakZ);
  }
}
