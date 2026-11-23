import { describe, expect, it } from 'vitest';
import { ESKI_UCRETSIZ, eskiUcretsizAcik } from '../../alfabe/src/harf-erisim';
import { kilitliMi } from '../../src/engine/erisim';

// Ücretsiz harfler A, N, E, T oldu (Barış, 20 Kasım). Eski ücretsiz B, C, Ç'ye bu cihazda başlamış çocukta açık kalır.
describe('eski ücretsiz harfler', () => {
  const abonesiz = { etkin: true, premium: false };
  it('B, C, Ç artık abonelikte; A, N, E, T ücretsiz', () => {
    for (const id of ['01', '17', '06', '24']) expect(kilitliMi('alfabe/harf-' + id, abonesiz)).toBe(false);
    for (const id of ESKI_UCRETSIZ) expect(kilitliMi('alfabe/harf-' + id, abonesiz)).toBe(true);
  });
  it('bitirilmiş ya da yarıda bırakılmış B, C, Ç açık kalır', () => {
    expect(eskiUcretsizAcik('02', ['01', '02'], {})).toBe(true);
    expect(eskiUcretsizAcik('03', [], { '03': 4 })).toBe(true);
    expect(eskiUcretsizAcik('04', ['04'], {})).toBe(true);
  });
  it('başlanmamış B, C, Ç ve başka harfler istisna değildir', () => {
    expect(eskiUcretsizAcik('02', ['01'], {})).toBe(false);
    expect(eskiUcretsizAcik('03', [], { '02': 1 })).toBe(false);
    expect(eskiUcretsizAcik('12', ['12'], { '12': 0 })).toBe(false);
    expect(eskiUcretsizAcik('05', ['05'], {})).toBe(false);
  });
});
