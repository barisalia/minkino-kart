import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { DUZELTME_BEKLIYOR, HARF_YUZU_CIZIMLERI, OLTA_CIZIMLERI, SES_BALONU_CIZIMLERI } from '../../alfabe/src/h14-cizimler';
import { balonDizisi } from '../../alfabe/src/ses-balonu-kurali';

// Paket Harf-H15 (22 Kasım 2026): Keşfet → Ses Balonları (ses-balonlari.ts), 2–3 yaş boyama → Harf uyanır.
describe('Paket Harf-H15', () => {
  it('balon dizisi: iki aynı başlangıç, bir farklı; farklının yeri sıraya göre', () => {
    for (const sira of [0, 1, 2, 5, -1]) {
      const d = balonDizisi(['armut', 'arı'], 'balık', sira);
      expect(d).toHaveLength(3);
      expect(d.filter((b) => b.farkli)).toEqual([{ kart: 'balık', farkli: true }]);
      expect(d.findIndex((b) => b.farkli)).toBe(((sira % 3) + 3) % 3);
      expect(d.filter((b) => !b.farkli).map((b) => b.kart)).toEqual(['armut', 'arı']);
    }
  });
  it('çizim listeleri brief’le aynı: Ses Balonları 6, Harf yüzü 4', () => {
    expect(SES_BALONU_CIZIMLERI).toHaveLength(6);
    expect(HARF_YUZU_CIZIMLERI).toHaveLength(4);
    const brief = readFileSync('CLAUDE-ASTRA-MESAJLAR.md', 'utf8');
    const bolum = brief.slice(brief.indexOf('Paket Harf-H15'));
    for (const ad of [...SES_BALONU_CIZIMLERI, ...HARF_YUZU_CIZIMLERI]) expect(bolum, ad).toContain(ad + '.webp');
  });
  it('yeni Ceren kayıtları var ve metinleri yazılı', () => {
    const metinler = JSON.parse(readFileSync('alfabe/ses-metinleri.json', 'utf8'));
    for (const id of ['balon-yonerge', 'balon-tekrar', 'boya-uyandi', 'kesif-bitti']) {
      expect(existsSync('assets/alfabe/ses/' + id + '.mp3'), id).toBe(true);
      expect(metinler[id], id).toBeTruthy();
    }
  });
  it('düzeltme bekleyen çizimler gerçek adlar ve Astra brief’inde yazılı (22 Kasım denetimi)', () => {
    const adlar = new Set([...OLTA_CIZIMLERI.map((a) => 'olta/' + a), ...SES_BALONU_CIZIMLERI.map((a) => 'ses-balonu/' + a)]);
    const brief = readFileSync('CLAUDE-ASTRA-MESAJLAR.md', 'utf8');
    const bolum = brief.slice(brief.lastIndexOf('Harf-H14/H15 düzeltme'));
    for (const ad of DUZELTME_BEKLIYOR) {
      expect(adlar.has(ad), ad).toBe(true);
      expect(bolum, ad).toContain('assets/alfabe/' + ad + '.webp');
    }
  });
});
