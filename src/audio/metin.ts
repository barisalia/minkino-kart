import metinler from '../../content/metinler.json';

export type MetinAnahtari = keyof typeof metinler;
const M = metinler as Record<string, string | string[]>;

const SAYI_ADLARI = ['sıfır', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz', 'on'];
export const sayiAdi = (n: number) => SAYI_ADLARI[n] ?? String(n);

/** metinler.json'dan bir cümle (dizi ise rastgele biri), {degisken} yerine konur. */
export function metin(anahtar: MetinAnahtari, degiskenler: Record<string, string | number> = {}): string {
  const v = M[anahtar];
  let s = Array.isArray(v) ? v[Math.floor(Math.random() * v.length)] : v;
  for (const [k, d] of Object.entries(degiskenler)) s = s.replaceAll(`{${k}}`, String(d));
  return s;
}

export function buyukHarfBas(s: string): string {
  return s.charAt(0).toLocaleUpperCase('tr') + s.slice(1);
}
