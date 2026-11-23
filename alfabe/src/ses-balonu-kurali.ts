// Ses Balonları'nın saf kuralı (ses-balonlari.ts; birim testi tests/unit/alfabe-h15.test.ts).

/** Üç balonun dizilişi: iki aynı başlangıç, bir farklı; farklının yeri `sira` ile (0…2). */
export function balonDizisi<T>(ayni: [T, T], farkli: T, sira: number): { kart: T; farkli: boolean }[] {
  const l = ayni.map((kart) => ({ kart, farkli: false }));
  l.splice(((sira % 3) + 3) % 3, 0, { kart: farkli, farkli: true });
  return l;
}
