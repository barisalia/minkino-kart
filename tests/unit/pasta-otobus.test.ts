import { describe, expect, it } from 'vitest';
import { boyaFiltresi, boyaMatrisi, OTOBUS, OTOBUS_YERI, otobusSvg, PEMBE_MASKE } from '../../pasta/src/cizim';
import { BOYA } from '../../pasta/src/model';

/** feColorMatrix'i bir renge uygular (0-1, alfa 1) */
function uygula(values: string, [r, g, b]: number[]): number[] {
  const m = values.split(/\s+/).map(Number);
  const sat = (i: number) => Math.min(1, Math.max(0, m[i] * r + m[i + 1] * g + m[i + 2] * b + m[i + 3] + m[i + 4]));
  return [sat(0), sat(5), sat(10), sat(15)];
}
const kanal = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const maske = (hex: string) => uygula(PEMBE_MASKE[0], kanal(hex))[3] * uygula(PEMBE_MASKE[1], kanal(hex))[3];

describe('Pasta otobüsü: görsel varsa görsel, yoksa kod çizimi', () => {
  it('görsel yoksa kod çizimi (assets/pasta/otobus-*.webp henüz yok)', () => {
    expect(otobusSvg(null)).not.toContain('<image');
    expect(OTOBUS).toContain('ps-otobus-svg');
  });
  it('görselli otobüs: aynı hareketli parçalar (gövde, kapak, tente, tezgâh, iki teker)', () => {
    const s = otobusSvg('/x/otobus-1.webp');
    expect(s).toContain('ps-otobus-resimli');
    for (const sinif of ['ps-ob-govde', 'ps-ob-panel', 'ps-ob-tente', 'ps-ob-tezgah', 'ps-ob-acik']) expect(s).toContain(sinif);
    expect(s.match(/class="ps-ob-teker"/g)).toHaveLength(OTOBUS_YERI.teker.length);
    expect(s.match(/href="\/x\/otobus-1\.webp"/g)!.length).toBe(2 + OTOBUS_YERI.teker.length);
    expect(s).toContain('viewBox="0 0 640 420"');
  });
  it('çizilmiş tekerlek döner, ışık katmanı üstünde durur; otobüs görseli tekerlekte kırpılmaz', () => {
    const s = otobusSvg('/x/otobus-1.webp', '/x/teker-1.webp', '/x/teker-isik-1.webp');
    const n = OTOBUS_YERI.cizimTeker.length;
    expect(s.match(/class="ps-ob-teker"/g)).toHaveLength(n);
    expect(s.match(/class="ps-ob-teker-isik"/g)).toHaveLength(n);
    expect(s.match(/href="\/x\/teker-1\.webp"/g)).toHaveLength(n);
    expect(s.match(/href="\/x\/otobus-1\.webp"/g)).toHaveLength(2);
    expect(s).not.toContain('ps-ob-teker-arka"');
    // ışık dönen grubun içinde değil (yanında)
    expect(s).toMatch(/<\/g><g class="ps-ob-teker-isik"/);
  });
  it('boya: pembe gövde tam hedef renge, gölgesi koyu hedefe döner', () => {
    for (const ad of ['nane', 'limon']) {
      const sonuc = uygula(boyaMatrisi(BOYA[ad].govde), kanal(BOYA.pembe.govde));
      kanal(BOYA[ad].govde).forEach((c, i) => expect(sonuc[i]).toBeCloseTo(c, 2));
      expect(boyaFiltresi(ad)).toBe(`url(#ps-boya-${ad})`);
    }
    expect(boyaFiltresi('pembe')).toBe('none');
    expect(boyaFiltresi('yok')).toBe('none');
  });
  it('maske: pembeler içeride; kırmızı, sarı, turuncu, cam mavisi, beyaz, kahve dışarıda', () => {
    for (const p of [BOYA.pembe.govde, BOYA.pembe.koyu, '#C06090']) expect(maske(p)).toBeGreaterThan(0.85);
    for (const d of ['#FF5A5F', '#FFD84A', '#F3B54A', '#9EDCFF', '#6CC4FF', '#FFFFFF', '#6B3A1F', '#4A3A3A', '#C9D4DE']) expect(maske(d)).toBe(0);
  });
});
