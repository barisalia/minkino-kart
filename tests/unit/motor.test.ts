import { describe, expect, it } from 'vitest';
import { albumKartlari, sorular, TEMALAR } from '../../src/engine/katalog';
import { kaydet, varsayilan, yukle, type Depo } from '../../src/engine/ilerleme';
import { odulKartiSec, temaDurumu, yeniAcilanlar, yildizHesapla } from '../../src/engine/odul';
import { cevapDogruMu, dogruIndeks } from '../../src/engine/soru';
import { soruHazirla, turOlustur } from '../../src/engine/tur';
import { saySonucu } from '../../src/engine/dogrula';
import type { Soru } from '../../src/engine/types';

function tohumlu(t = 42) {
  return () => {
    t = (t * 16807) % 2147483647;
    return (t - 1) / 2147483646;
  };
}

describe('soru', () => {
  const s: Soru = { tip: 'BUL', soru_metni: 'Kedi hangisi?', kartlar: ['kopek', 'kedi'], dogru: 'kedi' };
  it('doğru indeksi id ve sıra numarasıyla bulur', () => {
    expect(dogruIndeks(s)).toBe(1);
    expect(dogruIndeks({ ...s, dogru: 0 })).toBe(0);
    expect(dogruIndeks({ ...s, dogru: 'fil' })).toBe(-1);
    expect(cevapDogruMu(s, 1)).toBe(true);
    expect(cevapDogruMu(s, 0)).toBe(false);
  });
  it('karıştırınca doğru cevap aynı kartta kalır', () => {
    for (let t = 1; t < 30; t++) {
      const h = soruHazirla({ ...s, kartlar: ['kopek', 'kedi', 'fil', 'at'] }, tohumlu(t));
      expect(h.kartlar[h.dogru as number]).toBe('kedi');
    }
  });
  it('SAY toplama ve çıkarma sonucu', () => {
    expect(saySonucu({ tip: 'SAY', soru_metni: '', kartlar: [], gosterge: [{ kart: 'elma', adet: 3 }, { kart: 'elma', adet: 2 }], islem: '+' })).toBe(5);
    expect(saySonucu({ tip: 'SAY', soru_metni: '', kartlar: [], gosterge: [{ kart: 'elma', adet: 5, carpi: 2 }], islem: '-' })).toBe(3);
  });
});

describe('tur', () => {
  it('her yaş ve temada 8 soru, en çok 1 hafıza, ilk soru hafıza değil', () => {
    for (const yas of [3, 4, 5, 6] as const) {
      for (const t of TEMALAR) {
        for (let k = 1; k < 6; k++) {
          const tur = turOlustur(yas, t.id, tohumlu(k * 7 + yas));
          expect(tur).toHaveLength(8);
          expect(tur.filter((q) => q.tip === 'HAFIZA').length).toBeLessThanOrEqual(1);
          expect(tur[0].tip).not.toBe('HAFIZA');
        }
      }
    }
  });
  it('bir turda aynı soru iki kez gelmez (havuz yeterliyse)', () => {
    const tur = turOlustur(5, 'hayvanlar', tohumlu(3));
    expect(new Set(tur.map((q) => q.soru_metni + JSON.stringify(q.gosterge))).size).toBe(8);
    expect(sorular(5, 'hayvanlar').length).toBeGreaterThanOrEqual(12);
  });
});

describe('ödül', () => {
  it('yıldız 1-3 arası, kaybetme yok', () => {
    expect(yildizHesapla(8, 8)).toBe(3);
    expect(yildizHesapla(7, 8)).toBe(3);
    expect(yildizHesapla(5, 8)).toBe(2);
    expect(yildizHesapla(0, 8)).toBe(1);
  });
  it('doğru kartı albüme verir, yoksa temadan eksik bir kart', () => {
    const s: Soru = { tip: 'BUL', soru_metni: '', kartlar: ['kopek', 'kedi'], dogru: 'kedi' };
    expect(odulKartiSec(s, 'hayvanlar', new Set())).toBe('kedi');
    const sonraki = odulKartiSec(s, 'hayvanlar', new Set(['kedi']));
    expect(sonraki).not.toBe('kedi');
    expect(albumKartlari('hayvanlar').map((k) => k.id)).toContain(sonraki);
    const hepsi = new Set(albumKartlari('hayvanlar').map((k) => k.id));
    expect(odulKartiSec(s, 'hayvanlar', hepsi)).toBeNull();
  });
  it('sayı sorusunda sayı kartı, duygu kartında (albüm dışı) başka kart verilir', () => {
    const say: Soru = { tip: 'SAY', soru_metni: '', gosterge: [{ kart: 'elma', adet: 3 }], kartlar: ['sayi-2', 'sayi-3', 'sayi-4'], dogru: 'sayi-3' };
    expect(odulKartiSec(say, 'sayilar', new Set())).toBe('sayi-3');
    const duygu: Soru = { tip: 'BUL', soru_metni: '', kartlar: ['duygu-mutlu', 'duygu-uzgun'], dogru: 'duygu-mutlu' };
    expect(odulKartiSec(duygu, 'hayvanlar', new Set())).not.toBe('duygu-mutlu');
  });
  it('ilk iki tema açık, diğerleri kart toplandıkça açılır', () => {
    const [h, m, t] = TEMALAR;
    expect(temaDurumu(h, 0, false).acik).toBe(true);
    expect(temaDurumu(m, 0, false).acik).toBe(true);
    expect(temaDurumu(t, 0, false)).toEqual({ acik: false, sebep: 'kart', kalan: t.acilis_kart });
    expect(temaDurumu(t, t.acilis_kart, false).acik).toBe(true);
    expect(yeniAcilanlar(0, 8, false).map((x) => x.id)).toEqual(['tasitlar']);
  });
  it('abonelik açıkken ücretli paketler Premium ister', () => {
    const t = TEMALAR[2];
    expect(temaDurumu(t, 999, false, true)).toEqual({ acik: false, sebep: 'abonelik' });
    expect(temaDurumu(t, 999, true, true).acik).toBe(true);
  });
});

describe('ilerleme', () => {
  function bellek(): Depo & { v: Map<string, string> } {
    const v = new Map<string, string>();
    return { v, getItem: (k) => v.get(k) ?? null, setItem: (k, d) => void v.set(k, d), removeItem: (k) => void v.delete(k) };
  }
  it('kaydedip geri yükler', () => {
    const d = bellek();
    const i = varsayilan();
    i.yas = 4;
    i.album = ['kedi'];
    kaydet(i, d);
    expect(yukle(d).yas).toBe(4);
    expect(yukle(d).album).toEqual(['kedi']);
  });
  it('bozuk veri varsayılana döner', () => {
    const d = bellek();
    d.setItem('minkino-kartlar-v1', '{bozuk');
    expect(yukle(d)).toEqual(varsayilan());
  });
  it('depo hata verirse çökmez', () => {
    const kotu: Depo = { getItem: () => { throw new Error('x'); }, setItem: () => { throw new Error('x'); }, removeItem: () => undefined };
    expect(() => kaydet(varsayilan(), kotu)).not.toThrow();
    expect(yukle(kotu)).toEqual(varsayilan());
  });
});
