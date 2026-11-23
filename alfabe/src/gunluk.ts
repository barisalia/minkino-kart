// Harf Atölyesi günlüğü: veli ilerlemesi için (src/screens/ebeveyn.ts → alfabe/src/veli-ilerlemesi.ts).
// Yalnız bu cihazda tutulur, dışarı gönderilmez. Yaş grubundan bağımsızdır: hangi yaş oynarsa oynasın aynı günlük.
// - gunler: gün (YYYY-AA-GG) → o gün biten ders adımı sayısı; son 14 gün tutulur.
// - yanlis: harf numarası → yanlış dokunuş sayısı (Keşfet, Mıknatıslar, Resimde Bul).
export const GUNLUK_ANAHTARI = 'minkino-alfabe-gunluk-v1';
export type Gunluk = { gunler: Record<string, number>; yanlis: Record<string, number> };

export function gunKodu(t = new Date()) {
  return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
}
export function gunlukOku(): Gunluk {
  const bos: Gunluk = { gunler: {}, yanlis: {} };
  try {
    const k = JSON.parse(localStorage.getItem(GUNLUK_ANAHTARI) || 'null');
    if (!k || typeof k !== 'object') return bos;
    const sayilar = (o: unknown) => Object.fromEntries(Object.entries(o && typeof o === 'object' ? o : {})
      .filter((g): g is [string, number] => Number.isInteger(g[1]) && (g[1] as number) > 0));
    return { gunler: sayilar(k.gunler), yanlis: sayilar(k.yanlis) };
  } catch { return bos; }
}
function yaz(g: Gunluk) {
  const sinir = gunKodu(new Date(Date.now() - 13 * 864e5));
  g.gunler = Object.fromEntries(Object.entries(g.gunler).filter(([gun]) => gun >= sinir));
  try { localStorage.setItem(GUNLUK_ANAHTARI, JSON.stringify(g)); } catch { /* Depolama kapalıysa günlük tutulmaz; ders etkilenmez. */ }
}
/** Bir ders adımı bitti. */
export function gunlukAdim() {
  const g = gunlukOku(), bugun = gunKodu();
  g.gunler[bugun] = (g.gunler[bugun] ?? 0) + 1;
  yaz(g);
}
/** Çocuk bir harfte yanlış yere dokundu. */
export function gunlukYanlis(harfId: string) {
  const g = gunlukOku();
  g.yanlis[harfId] = (g.yanlis[harfId] ?? 0) + 1;
  yaz(g);
}
