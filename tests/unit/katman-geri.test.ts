import { describe, expect, it } from 'vitest';
import { GERI_OLAYI, katmanAc } from '../../src/kabuk/yon';

// node ortamı: pencere yerine düz EventTarget yeter
(globalThis as unknown as { window: EventTarget }).window ??= new EventTarget();
const geri = () => !window.dispatchEvent(new CustomEvent(GERI_OLAYI, { cancelable: true }));
const katman = (bagli = true) => ({ isConnected: bagli }) as unknown as Element;

describe('Android geri tuşu: açık katman önce kapanır', () => {
  it('en üstteki katman kapanır, sonra alttaki; boşsa sayfa işlemez', () => {
    const kapanan: string[] = [];
    katmanAc(katman(), () => kapanan.push('alt'));
    katmanAc(katman(), () => kapanan.push('ust'));
    expect(geri()).toBe(true);
    expect(geri()).toBe(true);
    expect(kapanan).toEqual(['ust', 'alt']);
    expect(geri()).toBe(false);
  });
  it('başka yoldan kapanan (bırakılan) ya da sayfadan kalkan katman atlanır', () => {
    const kapanan: string[] = [];
    const birak = katmanAc(katman(), () => kapanan.push('birakildi'));
    birak();
    katmanAc(katman(false), () => kapanan.push('kalkti'));
    expect(geri()).toBe(false);
    expect(kapanan).toEqual([]);
  });
});
