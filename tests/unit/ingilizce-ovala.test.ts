import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { UNITELER, kelimeBul, uniteBul } from '../../ingilizce/src/icerik';
import { dersPlani, type Adim } from '../../ingilizce/src/plan';
import { OVALA_SAHNELERI, OV_TUVAL, ovalaPlani, ovalaSesleri, type Kutu } from '../../ingilizce/src/adimlar/ovala-veri';

// Ovala, Bul (22 Kasım 2026, ingilizce/src/adimlar/ovala-veri.ts)
const ortusur = (a: Kutu, b: Kutu) => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];
let t = 3; const rnd = () => (t = (t * 16807) % 2147483647) / 2147483647;

describe('ingilizce · Ovala, Bul', () => {
  it('sekiz saklanma yeri, hepsi gerçek kelime; küvette bebek (doll) yok, yerine tekne (08:19 kararı); kutular ayrık; kayıtlar diskte', () => {
    for (const s of OVALA_SAHNELERI) {
      const u = uniteBul(s.uniteId)!;
      expect(Object.keys(s.yerler)).toHaveLength(8);
      for (const id of Object.keys(s.yerler)) expect(kelimeBul(id), id).toBeTruthy();
      const disarida = u.kelimeler.map((w) => w.id).filter((id) => !s.yerler[id]);
      expect(disarida, s.ad).toEqual(s.ad === 'kopuk' ? ['doll'] : []);
      expect(Object.keys(s.yerler).includes('doll')).toBe(false);
      const l = Object.entries(s.yerler);
      for (const [id, k] of l) expect(k[0] >= 0 && k[1] >= 0 && k[0] + k[2] <= OV_TUVAL.en && k[1] + k[3] <= OV_TUVAL.boy, `${s.ad}/${id}`).toBe(true);
      for (let i = 0; i < l.length; i++) for (let j = i + 1; j < l.length; j++) expect(ortusur(l[i][1], l[j][1]), `${s.ad}: ${l[i][0]} × ${l[j][0]}`).toBe(false);
      const p = ovalaPlani(u.id, u.kelimeler, '5+', rnd)!;
      for (const id of ovalaSesleri({ ...p, hedefler: Object.keys(s.yerler).map((id) => kelimeBul(id)!) }).filter((x) => !x.includes('-ov-'))) expect(existsSync(`assets/ingilizce/ses/${id}.mp3`), id).toBe(true);
    }
  });

  it('plan: 2–3 yaşta üç, diğerlerinde dört tur; sahnesi olmayan adada yok', () => {
    const u = uniteBul('doga')!;
    expect(ovalaPlani(u.id, u.kelimeler, '2-3', rnd)!.hedefler).toHaveLength(3);
    expect(ovalaPlani(u.id, u.kelimeler.slice(0, 4), '4', rnd)!.hedefler).toHaveLength(4);
    expect(ovalaPlani('odam', uniteBul('odam')!.kelimeler, '4', rnd)).toBeNull();
  });

  it('ders planı: yalnız Oyuncaklar, Meyve ve Doğa\'da; 1. dersin Bul\'u ve şenliğin Obur\'u Besle\'si yerine', () => {
    const plan = (uniteId: string, no: 0 | 1 | 2) => dersPlani({ unite: uniteBul(uniteId)!, no, yas: '4', bilinen: [], isinma: [], ilk: false }, rnd);
    for (const s of OVALA_SAHNELERI) {
      const ilk = plan(s.uniteId, 0).find((x) => x.tip === 'ovala') as Extract<Adim, { tip: 'ovala' }> | undefined;
      expect(ilk?.yedek.tip, s.uniteId).toBe('bul');
      const senlik = plan(s.uniteId, 2).find((x) => x.tip === 'ovala') as Extract<Adim, { tip: 'ovala' }> | undefined;
      expect(senlik?.yedek.tip, s.uniteId).toBe('besle');
      expect(plan(s.uniteId, 1).some((x) => x.tip === 'ovala'), s.uniteId).toBe(false);
    }
    for (const u of UNITELER.filter((x) => !OVALA_SAHNELERI.some((s) => s.uniteId === x.id) && x.id !== 'ciftlik')) {
      expect(plan(u.id, 0).some((a) => a.tip === 'ovala'), u.id).toBe(false);
      expect(plan(u.id, 2).some((a) => a.tip === 'ovala'), u.id).toBe(false);
    }
  });
});
