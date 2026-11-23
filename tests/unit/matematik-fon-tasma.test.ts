import { describe, expect, it } from 'vitest';
import { cizgileriAt, konturAtla, yumusat } from '../../matematik/src/fon-tasma';

// Fon taşması (22 Kasım): bant, fonun kenar satırını uzatır; satır koyu bir kontur çizgisiyse içeri geçilir.
describe('Matematik fon taşması · kenar satırı', () => {
  it('düz kenarda en dış satır alınır', () => {
    expect(konturAtla(() => 0, 8)).toBe(0);
  });
  it('en alttaki çerçeve çizgisi (kule masası, manav, tiyatro) atlanır', () => {
    // 0–1. satırlar %96 koyu (kontur), 2. satır zemin.
    const koyu = [0.96, 0.6, 0.02, 0.02];
    expect(konturAtla((i) => koyu[i] ?? 0, 8)).toBe(2);
  });
  it('baştan sona koyu fon (uzay) kenar satırını kullanır', () => {
    expect(konturAtla(() => 1, 8)).toBe(0);
  });
});

describe('Matematik fon taşması · kenar satırındaki ince çizgiler', () => {
  const satir = (renkler: [number, number, number][]) => new Uint8ClampedArray(renkler.flatMap(([r, g, b]) => [r, g, b, 255]));
  const yesil: [number, number, number] = [140, 220, 90], kara: [number, number, number] = [20, 20, 20], kahve: [number, number, number] = [120, 70, 30];
  it('çimenin içindeki 4 px kontur (yaprak sapı) kaybolur, renk çimenin kendi rengi olur', () => {
    const r = satir([...Array(30).fill(yesil), ...Array(4).fill(kara), ...Array(30).fill(yesil)]);
    const c = cizgileriAt(r, 8);
    for (let x = 0; x < 64; x++) expect([c[x * 4], c[x * 4 + 1], c[x * 4 + 2]]).toEqual(yesil);
  });
  it('geniş renk alanı (40 px kahverengi zemin) ve sınırı yerinde kalır', () => {
    const r = satir([...Array(30).fill(yesil), ...Array(40).fill(kahve), ...Array(30).fill(yesil)]);
    const c = cizgileriAt(r, 8);
    expect([c[50 * 4], c[50 * 4 + 1], c[50 * 4 + 2]]).toEqual(kahve);
    expect([c[10 * 4], c[10 * 4 + 1], c[10 * 4 + 2]]).toEqual(yesil);
    expect([c[30 * 4], c[30 * 4 + 1], c[30 * 4 + 2]]).toEqual(kahve);
  });
});

describe('Matematik fon taşması · yumuşatma', () => {
  it('düz satır aynı kalır; dar koyu şerit komşusuna karışır (en koyu yer açılır)', () => {
    const duz = new Uint8ClampedArray(Array(20).fill([100, 200, 50, 255]).flat());
    expect([...yumusat(duz, 4)]).toEqual([...duz]);
    const serit = new Uint8ClampedArray([...Array(20).fill([140, 220, 90, 255]).flat(), ...Array(4).fill([40, 120, 30, 255]).flat(), ...Array(20).fill([140, 220, 90, 255]).flat()]);
    const y = yumusat(serit, 8);
    // Şeridin ortası (x 21) artık 40 değil, çimene yakın bir ara ton.
    expect(y[21 * 4]).toBeGreaterThan(100);
    expect(y[21 * 4]).toBeLessThan(140);
  });
});
