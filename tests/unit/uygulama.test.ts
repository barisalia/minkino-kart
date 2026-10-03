import { describe, expect, it } from 'vitest';
import { kartGorselleri, OYUNLAR } from '../../uygulama/src/oyunlar';

// Depodaki mevcut çizimler (yalnız adları; dosya okunmaz)
const MEVCUT = new Set(Object.keys(import.meta.glob('../../assets/**/*.webp')).map((y) => y.replace('../../assets/', '').replace(/\.webp$/, '')));

describe('Ana menü oyun kartları', () => {
  it('yedi oyun, benzersiz kimlik ve doğru göreli adres', () => {
    expect(OYUNLAR.map((k) => [k.id, k.adres])).toEqual([
      ['kartlar', './kartlar/'],
      ['pazar', './pazar/'],
      ['canlan', './canlan/'],
      ['macera', './macera/'],
      ['film', './film/'],
      ['okul', './okul/'],
      ['pasta', './pasta/'],
    ]);
  });

  it('her kartın kısa adı ve en az bir çizimi var', () => {
    for (const k of OYUNLAR) {
      expect(k.ad.length).toBeGreaterThan(0);
      expect(k.ad.length).toBeLessThanOrEqual(16);
      expect(kartGorselleri(k).length).toBeGreaterThan(0);
    }
  });

  it('kartların kullandığı bütün çizimler assets/ altında mevcut (yeni görsel yok)', () => {
    for (const k of OYUNLAR) for (const g of kartGorselleri(k)) expect(MEVCUT.has(g), g).toBe(true);
  });
});
