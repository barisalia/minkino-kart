// Harf derslerinin öğrenme sırası: okuldaki ses grupları (Barış'ın kararı, 20 Kasım; KULLANICI-KURALLARI.md,
// gerekçe ekip/antigravity/CEVAP-06.md B1 ve D1). Ders kimlikleri, dosyalar, sesler ve kayıtlı ilerleme değişmez;
// değişen yalnız rafın dizilişi ve "sıradaki harf". Bütün yaş grupları için aynı sıra. Albüm alfabetik kalır.
// Saf modül: DOM ve kayıt yok; tests/unit/alfabe-harf-sirasi.test.ts sınar.

/** Beş ses grubu, ders kimlikleriyle (harfler.json): A N E T İ L · O K U R I M · Ü S Ö Y D Z · Ç B G C Ş · P H V Ğ F J */
export const SES_GRUPLARI: readonly (readonly string[])[] = [
  ['01', '17', '06', '24', '12', '15'],
  ['18', '14', '25', '21', '11', '16'],
  ['26', '22', '19', '28', '05', '29'],
  ['04', '02', '08', '03', '23'],
  ['20', '10', '27', '09', '07', '13'],
];
/** Öğrenme sırası, düz liste (29 harf). */
export const HARF_SIRASI: readonly string[] = SES_GRUPLARI.flat();

/** Harfin öğrenme sırasındaki yeri (0…28); listede yoksa -1. */
export const siraNo = (id: string) => HARF_SIRASI.indexOf(id);
/** Harfin ses grubu (0…4); listede yoksa -1. */
export const grupNo = (id: string) => SES_GRUPLARI.findIndex(g => g.includes(id));

/** Sıradaki harf: öğrenme sırasında bitmemiş ilk harf (eski sırayla bitirilenler bitmiş sayılır). Hepsi bitmişse undefined. */
export function siradakiHarf(biten: readonly string[]): string | undefined {
  return HARF_SIRASI.find(id => !biten.includes(id));
}

/** Bir harften sonra gelen bitmemiş harf (sıra sonunda başa döner); ders sonundaki "… harfine geç" için. */
export function sonrakiHarf(id: string, biten: readonly string[]): string | undefined {
  const i = siraNo(id);
  return [...HARF_SIRASI.slice(i + 1), ...HARF_SIRASI.slice(0, Math.max(0, i))].find(h => h !== id && !biten.includes(h));
}
