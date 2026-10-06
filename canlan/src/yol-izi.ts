/**
 * Yol modunda (3 yaş) yolun hangi noktalarının boyandığı. Saf mantık (DOM yok, test edilebilir).
 * Geri al / Temizle / Tamamla'dan sonra tuvaldeki çizgilerden baştan hesaplanır: silinen çizginin boyası da gider.
 */
import type { Nokta } from './resimler';

export class YolIzi {
  readonly dolu: Uint8Array;
  sayi = 0;

  constructor(
    readonly noktalar: readonly Nokta[],
    readonly tol: number,
  ) {
    this.dolu = new Uint8Array(noktalar.length);
  }

  /** Parmağın geçtiği nokta: yakındaki boş yol noktaları dolar; yeni dolanların sırası döner */
  isle([x, y]: Nokta): number[] {
    const yeni: number[] = [];
    this.noktalar.forEach(([a, b], i) => {
      if (!this.dolu[i] && Math.hypot(a - x, b - y) < this.tol) {
        this.dolu[i] = 1;
        this.sayi++;
        yeni.push(i);
      }
    });
    return yeni;
  }

  /** Baştan: yalnız verilen çizgilerin geçtiği noktalar dolu (silgi çizgileri sayılmaz) */
  yenidenHesapla(cizgiler: readonly { silgi: boolean; noktalar: readonly Nokta[] }[]) {
    this.dolu.fill(0);
    this.sayi = 0;
    for (const c of cizgiler) if (!c.silgi) for (const n of c.noktalar) this.isle(n);
  }

  oran() {
    return this.noktalar.length ? this.sayi / this.noktalar.length : 0;
  }
}
