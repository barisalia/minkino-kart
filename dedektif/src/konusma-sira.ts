/**
 * Dedektif oyuncularının konuşma sırası için DOM'suz küçük yardımcılar (birim testli: tests/unit/dedektif-konusma.test.ts).
 */

/**
 * Konuşma balonunun kapanışı: söz bitince balon kısa süre sonra kapanır. Aynı konuşan hemen yeni bir söze geçtiyse
 * (aynı balon yeniden açıldı) eski sözün kapanışı yeni sözü kapatmaz; yalnız son açılışın kapanışı geçerli.
 */
export class BalonNobeti<K extends string> {
  private nesil: Partial<Record<K, number>> = {};
  /** Balon yeni bir söz için açıldı: bu açılışın numarası */
  ac(k: K): number {
    const n = (this.nesil[k] ?? 0) + 1;
    this.nesil[k] = n;
    return n;
  }
  /** Bu açılış hâlâ balonun son açılışı mı (kapanış ve başı izleme yalnız o zaman) */
  gecerli(k: K, n: number): boolean {
    return this.nesil[k] === n;
  }
}

/**
 * "Tekrar dinle": art arda dokunuşlar birikmez. Bir tekrar sıradayken ya da çalarken yeni dokunuş yok sayılır; o tekrar
 * bitince (ya da hata verince) yeniden dokunulabilir. Döner: dokunuş yeni bir tekrar başlattı mı.
 */
export function tekTekrar(): (calis: () => Promise<unknown>) => boolean {
  let suren: Promise<unknown> | null = null;
  return (calis) => {
    if (suren) return false;
    const is = calis();
    suren = is;
    void is
      .catch(() => undefined)
      .then(() => {
        if (suren === is) suren = null;
      });
    return true;
  };
}
