import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { UNITELER, ortakSesler, uniteSesleri } from '../../ingilizce/src/icerik';
import { dersSesKimlikleri, ilerisiSesleri, ortakSesler2 } from '../../ingilizce/src/icerik2';
import { YENI_UNITELER } from '../../ingilizce/src/icerik3';

// 13–24. adalar (20 Kasım 2026, ingilizce/src/icerik3.ts): içerik ve sesler tam; çizimler Astra'da (Paket 17–22).
const var_ = (id: string) => existsSync(`assets/ingilizce/ses/${id}.mp3`);
const eksik = (idler: string[]) => idler.filter((id) => !var_(id));

describe('ingilizce · 13–24. adalar', () => {
  it('on iki yeni ada bugünkü kalıpla: 13–24 numaralı, sekizer kelime, çilek yok, kimlikler var olanlarla çakışmaz', () => {
    expect(YENI_UNITELER.map((u) => u.no)).toEqual(Array.from({ length: 12 }, (_, i) => i + 13));
    expect(UNITELER.slice(12)).toEqual(YENI_UNITELER);
    const eski = new Set(UNITELER.slice(0, 12).flatMap((u) => u.kelimeler.map((w) => w.id)));
    for (const u of YENI_UNITELER) {
      expect(u.kelimeler, u.id).toHaveLength(8);
      for (const w of u.kelimeler) expect(eski.has(w.id), w.id).toBe(false);
      expect(u.giris.length, u.id).toBeGreaterThan(10);
    }
    expect(YENI_UNITELER.flatMap((u) => u.kelimeler).some((w) => /strawberr/.test(w.id))).toBe(false);
  });

  it('ortak kayıtlar tam: yeni taşlar ve sorular gelmeden var olan adaların üst seviyeleri kapanırdı', () => {
    expect(eksik(ortakSesler().map((s) => s.id))).toEqual([]);
    expect(eksik(ortakSesler2().map((s) => s.id))).toEqual([]);
  });

  it('her yeni adanın bütün kayıtları diskte: kelimeler, ada girişi, Seviye 2–3 ve derslerin çaldığı her ses', () => {
    for (const u of YENI_UNITELER) {
      expect(eksik(uniteSesleri(u).map((s) => s.id)), u.id).toEqual([]);
      expect(eksik(ilerisiSesleri(u).map((s) => s.id)), u.id).toEqual([]);
      for (const no of [3, 4, 5, 6, 7, 8] as const) expect(eksik(dersSesKimlikleri(u, no)), `${u.id}-${no + 1}`).toEqual([]);
    }
  });
});
