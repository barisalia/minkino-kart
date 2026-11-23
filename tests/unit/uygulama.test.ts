import { describe, expect, it } from 'vitest';
import { kartGorselleri, OYUNLAR } from '../../uygulama/src/oyunlar';

// Depodaki mevcut çizimler (yalnız adları; dosya okunmaz)
const MEVCUT = new Set(Object.keys(import.meta.glob('../../assets/**/*.webp')).map((y) => y.replace('../../assets/', '').replace(/\.webp$/, '')));

describe('Ana menü oyun kartları', () => {
  it('oyun kartları, benzersiz kimlik ve doğru göreli adres', () => {
    expect(OYUNLAR.map((k) => [k.id, k.adres])).toEqual([
      ['matematik', './matematik/'],
      ['alfabe', './alfabe/'],
      ['sef', './sef/'],
      ['kino-ile-sen-sec', './kino-ile-sen-sec/'],
      ['hazirlik', './hazirlik/'],
      ['kartlar', './kartlar/'],
      ['pazar', './pazar/'],
      ['canlan', './canlan/'],
      ['macera', './macera/'],
      ['dedektif', './dedektif/'],
      ['giysin', './giysin/'],
      ['otobus', './otobus/'],
    ]);
  });

  it('her kartın adı ve menü kapağı var', () => {
    // Menü (yatay-menu.ts) kartı assets/uygulama/oyun-kapaklari/<id>.webp kapağıyla çizer; kapağı olmayan eski kart
    // kendi katmanlarıyla çizilir. Ad kapağın şeridine sığmalı ("Ceren Öğretmen ile Harf Atölyesi" en uzunu).
    for (const k of OYUNLAR) {
      expect(k.ad.length).toBeGreaterThan(0);
      expect(k.ad.length, k.id).toBeLessThanOrEqual(36);
      expect(MEVCUT.has(`uygulama/oyun-kapaklari/${k.id}`) || kartGorselleri(k).length > 0, k.id).toBe(true);
    }
  });

  it('kartların kullandığı bütün çizimler assets/ altında mevcut', () => {
    for (const k of OYUNLAR) for (const g of kartGorselleri(k)) expect(MEVCUT.has(g), g).toBe(true);
  });
});
