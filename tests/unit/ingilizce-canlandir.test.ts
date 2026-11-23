import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { UNITELER, uniteBul } from '../../ingilizce/src/icerik';
import { dersPlani, type Adim } from '../../ingilizce/src/plan';
import { CANLANDIR_SAHNELERI, TUVAL, canlandirPlani, canlandirSesleri, type Kutu } from '../../ingilizce/src/adimlar/canlandir-veri';

// Söyle, Canlansın (22 Kasım 2026, ingilizce/src/adimlar/canlandir-veri.ts)
const ortusur = (a: Kutu, b: Kutu) => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];
let t = 5; const rnd = () => (t = (t * 16807) % 2147483647) / 2147483647;

describe('ingilizce · Söyle, Canlansın', () => {
  it('bahçe ve taşıtlarda adanın sekiz kelimesinin yeri var; kardan adamda yalnız yüz (head, eyes, nose, mouth; 08:19 kararı); kutular ayrık; kayıtlar diskte', () => {
    const KARDAN = ['eyes', 'head', 'mouth', 'nose'];
    for (const s of CANLANDIR_SAHNELERI) {
      const u = uniteBul(s.uniteId)!;
      expect(Object.keys(s.yerler).sort(), s.ad).toEqual(s.ad === 'kardan' ? KARDAN : u.kelimeler.map((w) => w.id).sort());
      const hepsi = Object.entries(s.yerler).flatMap(([id, y]) => y.kutular.map((k) => [id, k] as const));
      for (const [id, k] of hepsi) expect(k[0] >= 0 && k[1] >= 0 && k[0] + k[2] <= TUVAL.en && k[1] + k[3] <= TUVAL.boy, `${s.ad}/${id}`).toBe(true);
      for (let i = 0; i < hepsi.length; i++) for (let j = i + 1; j < hepsi.length; j++) {
        if (hepsi[i][0] === hepsi[j][0]) continue;
        expect(ortusur(hepsi[i][1], hepsi[j][1]), `${s.ad}: ${hepsi[i][0]} × ${hepsi[j][0]}`).toBe(false);
      }
      const p = canlandirPlani(u.id, u.kelimeler, '5+', rnd)!;
      for (const id of canlandirSesleri({ ...p, kelimeler: u.kelimeler }).filter((x) => !x.includes('-sc-'))) expect(existsSync(`assets/ingilizce/ses/${id}.mp3`), id).toBe(true);
      for (const w of u.kelimeler) expect(existsSync(`assets/ingilizce/ses/en/w-${w.id}-yavas.mp3`), w.id).toBe(true);
    }
  });

  it('plan: düz söyleme adımının kelimelerinden 2–3 yaşta üç, diğerlerinde dört; sahnesi olmayan adada yok', () => {
    const u = uniteBul('tasitlar')!;
    expect(canlandirPlani(u.id, u.kelimeler, '2-3', rnd)!.kelimeler).toHaveLength(3);
    expect(canlandirPlani(u.id, u.kelimeler.slice(0, 4), '4', rnd)!.kelimeler).toHaveLength(4);
    expect(canlandirPlani('odam', uniteBul('odam')!.kelimeler, '4', rnd)).toBeNull();
    expect(canlandirSesleri(canlandirPlani(u.id, u.kelimeler, '4', rnd)!).some((x) => x.startsWith('efekt/'))).toBe(true);
    expect(canlandirSesleri(canlandirPlani('renkler', uniteBul('renkler')!.kelimeler, '4', rnd)!).some((x) => x.startsWith('efekt/'))).toBe(false);
  });

  it('ders planı: yalnız Yüzüm, Renkler ve Taşıtlar\'da 2. dersin ve şenliğin söyleme adımının yerinde; 1. ders değişmez', () => {
    const plan = (uniteId: string, no: 0 | 1 | 2) => dersPlani({ unite: uniteBul(uniteId)!, no, yas: '4', bilinen: [], isinma: [], ilk: false }, rnd);
    // Yüzüm'ün 2. dersi (hands, feet, head, legs) kardan adamda yok: düz söyleme kalır; şenlikte sahne gelir
    expect(plan('yuzum', 1).some((x) => x.tip === 'canlandir')).toBe(false);
    expect(plan('yuzum', 1).some((x) => x.tip === 'soyle')).toBe(true);
    for (const s of CANLANDIR_SAHNELERI) {
      for (const no of [1, 2] as const) {
        if (s.uniteId === 'yuzum' && no === 1) continue;
        const a = plan(s.uniteId, no);
        const c = a.find((x) => x.tip === 'canlandir') as Extract<Adim, { tip: 'canlandir' }> | undefined;
        expect(c?.yedek.tip, `${s.uniteId} ${no}`).toBe('soyle');
        expect(a.some((x) => x.tip === 'soyle'), `${s.uniteId} ${no}`).toBe(false);
        // yeni söyleme eklenmez: söylenen kelime sayısı düz adımdakini geçmez
        expect(c!.plan.kelimeler.length).toBeLessThanOrEqual((c!.yedek as Extract<Adim, { tip: 'soyle' }>).kelimeler.length);
      }
      expect(plan(s.uniteId, 0).some((x) => x.tip === 'canlandir')).toBe(false);
    }
    for (const u of UNITELER.filter((x) => !CANLANDIR_SAHNELERI.some((s) => s.uniteId === x.id) && x.id !== 'ciftlik')) {
      expect(plan(u.id, 1).some((a) => a.tip === 'canlandir'), u.id).toBe(false);
    }
  });
});
