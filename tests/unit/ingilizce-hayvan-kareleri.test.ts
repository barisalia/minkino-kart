import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { HAYVAN_BOLUMLERI, HAYVAN_DERSI_1, HAYVAN_DERSI_2, kelimeBul } from '../../ingilizce/src/icerik';

// Hayvanların çizilmiş zıplama kareleri (Astra Paket 38, 23 Kasım 2026): kelime/<ad>-z0…z3.
// Bir hayvanın kareleri ya hiç yoktur ya dördü birden vardır: yarım gelen set oyunda yarım hareket oynatır.
const HAYVANLAR = [...HAYVAN_DERSI_1, ...HAYVAN_DERSI_2, ...HAYVAN_BOLUMLERI.flatMap((b) => b.hayvanlar)];
const kare = (id: string, n: number) => `assets/ingilizce/kelime/${id}-z${n}.webp`;

describe('hayvanların zıplama kareleri', () => {
  it('yüz hayvan, hepsi tanımlı ve tekrarsız', () => {
    expect(HAYVANLAR).toHaveLength(100);
    expect(new Set(HAYVANLAR).size).toBe(100);
    for (const id of HAYVANLAR) expect(kelimeBul(id), id).toBeTruthy();
  });

  it('kare seti ya tam (dört kare) ya da hiç yok', () => {
    const yarim = HAYVANLAR.filter((id) => { const n = [0, 1, 2, 3].filter((i) => existsSync(kare(id, i))).length; return n !== 0 && n !== 4; });
    expect(yarim).toEqual([]);
  });

  it('yüz hayvanın her birinin kendi sesi var (pig hariç: derslerde yok)', () => {
    const eksik = HAYVANLAR.filter((id) => id !== 'pig' && !existsSync(`assets/ingilizce/ses/efekt/${id}.mp3`));
    expect(eksik).toEqual([]);
  });

  it('karesi olan hayvanın duran çizimi de var', () => {
    const eksik = HAYVANLAR.filter((id) => existsSync(kare(id, 0)) && !existsSync(`assets/ingilizce/kelime/${id}.webp`));
    expect(eksik).toEqual([]);
  });
});
