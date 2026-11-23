import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Kural (KULLANICI-KURALLARI 15 Kasım; yönetici 22 Kasım): Matematik'te çilek yok. Sayı masası, pazar, piknik ve manav
// turlarının meyve listesi üç ayrı meyve (elma, armut, mandalina); çileğin çizimi hiçbir turda kullanılmaz.
describe('Matematik · çilek yok', () => {
  const kaynak = readFileSync('matematik/src/main.ts', 'utf8');
  it('meyve listesi elma, armut, mandalina', () => {
    const satir = kaynak.split('\n').find((s) => s.startsWith('const meyve = '))!;
    expect(satir).toContain("'elma', 'armut', 'iki-kase/mandalina'");
    expect(satir).not.toMatch(/cilek/);
  });
  it('kodda çileğin çizimi ve adı geçmez (yorum dışında)', () => {
    const kod = kaynak.split('\n').filter((s) => !s.trim().startsWith('//') && !s.trim().startsWith('*'));
    expect(kod.join('\n')).not.toMatch(/cilek|Çilek/);
  });
});
