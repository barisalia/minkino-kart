import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { UNITELER, uniteBul } from '../../ingilizce/src/icerik';
import { dersPlani, type Adim } from '../../ingilizce/src/plan';
import { YERLESTIR_SAHNELERI, yerlestirPlani, yerlestirSesleri, type Kutu } from '../../ingilizce/src/adimlar/yerlestir-veri';

// Sahneye Taşı (22 Kasım 2026, ingilizce/src/adimlar/yerlestir-veri.ts)
const ortusur = (a: Kutu, b: Kutu) => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];
let t = 11; const rnd = () => (t = (t * 16807) % 2147483647) / 2147483647;

describe('ingilizce · Sahneye Taşı', () => {
  it('her sahnede adanın sekiz kelimesinin yeri var; kutular tuvalde, birbirinin ve karakterin üstüne binmez', () => {
    for (const s of YERLESTIR_SAHNELERI) {
      const u = uniteBul(s.uniteId)!;
      expect(Object.keys(s.yerler).sort(), s.ad).toEqual(u.kelimeler.map((w) => w.id).sort());
      const kutular: [string, Kutu][] = [[s.kim, s.kimKutu], ...Object.entries(s.yerler).map(([id, y]) => [id, y.kutu] as [string, Kutu])];
      for (const [id, k] of kutular) {
        expect(k[0] >= 0 && k[1] >= 0 && k[0] + k[2] <= 100 && k[1] + k[3] <= 100, `${s.ad}/${id}`).toBe(true);
      }
      for (let i = 0; i < kutular.length; i++) for (let j = i + 1; j < kutular.length; j++) {
        expect(ortusur(kutular[i][1], kutular[j][1]), `${s.ad}: ${kutular[i][0]} × ${kutular[j][0]}`).toBe(false);
      }
      // kelime ve cümle kayıtları diskte (Ceren'in girişi ve Polly'nin sonu ayrıca üretilir)
      for (const w of u.kelimeler) {
        expect(existsSync(`assets/ingilizce/ses/en/w-${w.id}.mp3`), w.id).toBe(true);
        expect(existsSync(`assets/ingilizce/ses/en/c-${w.id}.mp3`), w.id).toBe(true);
      }
    }
  });

  it('plan: 2–3 yaşta üç, büyüklerde dört eşya; rafta fazladan adanın kendi eşyası; sesler eksiksiz', () => {
    for (const s of YERLESTIR_SAHNELERI) {
      const u = uniteBul(s.uniteId)!;
      const kucuk = yerlestirPlani(u.id, u.kelimeler.slice(0, 4), u.kelimeler, '2-3', rnd)!;
      expect(kucuk.hedefler).toHaveLength(3);
      expect(kucuk.raf).toHaveLength(4);
      const buyuk = yerlestirPlani(u.id, u.kelimeler, u.kelimeler, '5+', rnd)!;
      expect(buyuk.hedefler).toHaveLength(4);
      expect(buyuk.raf).toHaveLength(6);
      expect(new Set(buyuk.raf.map((w) => w.id)).size).toBe(6);
      for (const w of buyuk.hedefler) expect(buyuk.raf.some((x) => x.id === w.id)).toBe(true);
      const sesler = yerlestirSesleri(buyuk);
      expect(sesler).toContain(s.giris.id);
      expect(sesler).toContain(s.son.id);
    }
    expect(yerlestirPlani('renkler', [], [], '4', rnd)).toBeNull();
  });

  it('ders planı: yalnız Odam, Yiyecekler ve Vahşi\'de 2. derste ve şenlikte gelir, yedeği o dersin eski adımı', () => {
    const tipler = (uniteId: string, no: 1 | 2) => dersPlani({ unite: uniteBul(uniteId)!, no, yas: '4', bilinen: [], isinma: [], ilk: false }, rnd);
    for (const s of YERLESTIR_SAHNELERI) {
      const ikinci = tipler(s.uniteId, 1).find((a) => a.tip === 'yerlestir') as Extract<Adim, { tip: 'yerlestir' }> | undefined;
      expect(ikinci?.yedek.tip, s.uniteId).toBe('eksik');
      const senlik = tipler(s.uniteId, 2).find((a) => a.tip === 'yerlestir') as Extract<Adim, { tip: 'yerlestir' }> | undefined;
      expect(senlik?.yedek.tip, s.uniteId).toBe('besle');
    }
    for (const u of UNITELER.filter((x) => !YERLESTIR_SAHNELERI.some((s) => s.uniteId === x.id) && x.id !== 'ciftlik')) {
      expect(tipler(u.id, 1).some((a) => a.tip === 'yerlestir'), u.id).toBe(false);
      expect(tipler(u.id, 2).some((a) => a.tip === 'yerlestir'), u.id).toBe(false);
    }
  });
});
