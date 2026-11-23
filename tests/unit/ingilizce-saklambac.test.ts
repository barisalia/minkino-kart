import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { YERLER, saklambacPlani, saklambacSesMetinleri, saklambacSesleri, type YerId } from '../../ingilizce/src/adimlar/saklambac-veri';

// Hide & Seek with Mino: yer bildiren sözler (in, on, under, next to), üç basamak, oturumda dört tur.
const EDATLAR = { '2-3': ['in', 'on'], '4': ['in', 'on', 'under'], '5+': ['in', 'on', 'under', 'next to'] } as const;
const tohum = (n: number) => { let x = n * 9301 + 49297; return () => ((x = (x * 9301 + 49297) % 233280) / 233280); };

describe('Hide & Seek with Mino · plan', () => {
  for (const yas of ['2-3', '4', '5+'] as const) {
    it(`${yas}: dört tur (bul, koy, bul, koy), aynı yer iki kez yok, yalnız o yaşın sözleri; en yeni söz mutlaka`, () => {
      for (let n = 0; n < 200; n++) {
        const p = saklambacPlani(yas, tohum(n));
        expect(p.turlar.map((t) => t.tur)).toEqual(['bul', 'koy', 'bul', 'koy']);
        const yerler = p.turlar.map((t) => t.yer);
        expect(new Set(yerler).size).toBe(4);
        for (const t of p.turlar) {
          expect(EDATLAR[yas] as readonly string[]).toContain(YERLER[t.yer].edat);
          if (t.tur === 'bul') expect(YERLER[t.yer].mino, t.yer).toBeTruthy();
          else expect(['ball', 'teddy-bear']).toContain(t.nesne);
        }
        expect(p.turlar[1].nesne).not.toBe(p.turlar[3].nesne);
        if (yas !== '2-3') expect(yerler.some((id) => YERLER[id].edat === EDATLAR[yas].at(-1))).toBe(true);
      }
    });
  }
});

describe('Hide & Seek with Mino · oda ve sesler', () => {
  it('dokunma bölgeleri odanın içinde, en az %10 eninde ve birbirine binmez', () => {
    const l = Object.entries(YERLER) as [YerId, (typeof YERLER)[YerId]][];
    for (const [id, y] of l) {
      const [s, u, sg, al] = y.bolge;
      expect(s >= 0 && u >= 0 && sg <= 100 && al <= 100 && sg - s >= 10 && al - u >= 12, id).toBe(true);
      expect(y.dayanak[0] > s && y.dayanak[0] < sg, id).toBe(true);
    }
    for (const [a, x] of l) for (const [b, z] of l) {
      if (a >= b) continue;
      const kesisir = x.bolge[0] < z.bolge[2] && z.bolge[0] < x.bolge[2] && x.bolge[1] < z.bolge[3] && z.bolge[1] < x.bolge[3];
      expect(kesisir, a + ' / ' + b).toBe(false);
    }
  });
  it('Mino dört yerde saklanır: in the box, under the table, on the bed, next to the chair', () => {
    expect(Object.values(YERLER).filter((y) => y.mino).map((y) => `${y.edat} ${y.esya}`).sort()).toEqual(['in box', 'next to chair', 'on bed', 'under table']);
  });
  it('her söz ayrı kayıt ve diskte; planın çaldığı her kayıt bu listede', () => {
    const metinler = saklambacSesMetinleri();
    expect(new Set(metinler.map((s) => s.id)).size).toBe(metinler.length);
    for (const s of metinler) expect(existsSync('assets/ingilizce/ses/' + s.id + '.mp3'), s.id).toBe(true);
    const idler = new Set([...metinler.map((s) => s.id), 'en/g-yes', 'en/g-now-you']);
    for (const yas of ['2-3', '4', '5+'] as const) for (let n = 0; n < 50; n++) for (const id of saklambacSesleri(saklambacPlani(yas, tohum(n)))) expect(idler.has(id), id).toBe(true);
    // yeni dört söz
    for (const w of ['in', 'on', 'under', 'next-to']) expect(metinler.some((s) => s.id === 'en/w-' + w)).toBe(true);
  });
});
