import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { UNITELER } from '../../ingilizce/src/icerik';
import { ESYALAR, FON, POLLY_YERI, agacEviSesMetinleri } from '../../ingilizce/src/agac-evi-veri';

// Polly'nin Yaşayan Ağaç Evi (21 Kasım 2026, ingilizce/src/agac-evi-veri.ts)
describe('ingilizce · ağaç evi', () => {
  it('her adaya bir eşya; her cümle o adanın bir kelimesini taşır; çilek ve insan yok', () => {
    expect(ESYALAR.map((e) => e.ada)).toEqual(UNITELER.map((u) => u.id));
    expect(new Set(ESYALAR.map((e) => e.id)).size).toBe(ESYALAR.length);
    for (const e of ESYALAR) {
      const u = UNITELER.find((x) => x.id === e.ada)!;
      for (const s of e.soz) {
        expect(u.kelimeler.some((w) => s.toLowerCase().includes(w.en.toLowerCase())), `${e.id}: ${s}`).toBe(true);
        expect(s.split(/\s+/).length, s).toBeLessThanOrEqual(7);
      }
      expect(e.soz[0]).not.toBe(e.soz[1]);
      expect(`${e.durum.join(' ')} ${e.tr}`).not.toMatch(/çilek|insan|çocuk|anne |baba |kız|oğlan|domuz/i);
    }
  });

  it('eşyalar fonun içinde ve birbirinin üstüne binmiyor (Polly’nin tüneği dahil)', () => {
    const kutular = [...ESYALAR.map((e) => ({ id: e.id, r: e.yer })), { id: 'polly', r: POLLY_YERI }];
    for (const { id, r: [x, y, g, h] } of kutular) {
      expect(x >= 0 && y >= 0 && x + g <= FON.g && y + h <= FON.y, id).toBe(true);
    }
    for (let i = 0; i < kutular.length; i++) for (let j = i + 1; j < kutular.length; j++) {
      const [a, b] = [kutular[i].r, kutular[j].r];
      const ust = a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];
      expect(ust, `${kutular[i].id} × ${kutular[j].id}`).toBe(false);
    }
  });

  it('kayıtlar diskte: Ceren’in girişi, Polly’nin karşılaması ve 48 eşya cümlesi', () => {
    const sesler = agacEviSesMetinleri();
    expect(sesler).toHaveLength(51);
    expect(sesler.filter((s) => !existsSync(`assets/ingilizce/ses/${s.id}.mp3`)).map((s) => s.id)).toEqual([]);
  });
});
