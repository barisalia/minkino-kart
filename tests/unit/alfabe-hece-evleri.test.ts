import { expect, it } from 'vitest';
import veri from '../../alfabe/src/hece-evleri-veri.json';

const BELIRTEC: Record<string, string> = { 'ç': 'cc', 'ş': 'ss', 'ı': 'ii', 'ö': 'oo', 'ü': 'uu' };
const ad = (h: string) => BELIRTEC[h] ?? h;

it('Hece Evleri 20 ünsüz ve 8 sesli harfle 160 ayrı, ASCII adlı hece kaydı ister', () => {
  expect(veri.unsuzler).toHaveLength(20);
  expect(veri.unsuzler).not.toContain('ğ');
  expect(veri.unluler).toEqual(['a', 'e', 'ı', 'i', 'o', 'ö', 'u', 'ü']);
  const kayitlar = veri.unsuzler.flatMap(u => veri.unluler.map(v => 'ev-' + ad(u) + '-' + ad(v)));
  expect(new Set(kayitlar.map(k => k.toLowerCase())).size).toBe(160);
  for (const k of kayitlar) expect(k).toMatch(/^ev-[a-z]+-[a-z]+$/);
  for (const k of kayitlar) expect(veri.sozler).not.toHaveProperty(k);
});

it('Ceren’in Hece Evleri replikleri kısa: en fazla üç cümle', () => {
  for (const metin of Object.values(veri.sozler)) {
    const cumle = metin.replace(/\[[^\]]+\]\s*/g, '').split(/[.!?]+/).filter(s => s.trim()).length;
    expect(cumle).toBeLessThanOrEqual(3);
  }
});

import { kilitliMi } from '../../src/engine/erisim';
it('Hece Evleri’nde L, K, N, M ücretsiz, diğer ünsüzler abonelikle açılır', () => {
  const d = { etkin: true, premium: false };
  // Ücretsiz evler ses grubu sırasındaki ilk dört ünsüz N, T, L, K (Barış 20 Kasım; önceden L, K, N, M).
  for (const u of ['n', 't', 'l', 'k']) expect(kilitliMi('alfabe/hece-evleri-' + u, d)).toBe(false);
  for (const u of ['m', 'y', 'cc', 'j']) expect(kilitliMi('alfabe/hece-evleri-' + u, d)).toBe(true);
  expect(kilitliMi('alfabe/hece-evleri-m', { etkin: true, premium: true })).toBe(false);
  expect(veri.unsuzler.slice(0, 4).every(u => !kilitliMi('alfabe/hece-evleri-' + u, d))).toBe(true);
});
