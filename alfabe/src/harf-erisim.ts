// Harf derslerinin kilidi için Harf Atölyesi içindeki eski kullanıcı istisnası (yönetici kararı, 20 Kasım;
// ekip/antigravity/CEVAP-07.md 2(c)). Ücretsiz dört harf A, N, E, T oldu (src/engine/erisim.ts); önceden ücretsiz
// olan B (02), C (03), Ç (04) abonelikte. Bu üç harften birini bu cihazda bitirmiş ya da yarıda bırakmış çocukta
// o harf açık kalır, kilit rozeti de görünmez. Erişim sorgusundan önce bakılır; erisim.ts değişmez. Saf modül:
// tests/unit/alfabe-harf-erisim.test.ts sınar.

/** Önceden ücretsiz olan harfler (A–Z sırasındaki ilk dört harfin A dışındakileri). */
export const ESKI_UCRETSIZ: readonly string[] = ['02', '03', '04'];

/** Bu cihazda başlanmış eski ücretsiz harf mi: kilitlenmez. */
export function eskiUcretsizAcik(id: string, biten: readonly string[], adimlar: Readonly<Record<string, unknown>>): boolean {
  return ESKI_UCRETSIZ.includes(id) && (biten.includes(id) || adimlar[id] !== undefined);
}
