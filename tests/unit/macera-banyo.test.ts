import { describe, expect, it } from 'vitest';
import B from '../../content/macera-banyo.json';
import { normal, tumCumleler } from '../../src/audio/cumleler';
import {
  baloncukBoyu,
  bolgeCoz,
  camurPlani,
  Deneme,
  dolumHizi,
  gerekenBaloncuk,
  kucukMu,
  muslukAdimlari,
  Ovalama,
  sicaklik,
  siraKontrol,
  sonrakiAciklik,
  suDurumu,
  taramaMi,
  ulumaFrekansi,
  ulumaKonturu,
  YANLIS_SU_SINIRI,
} from '../../macera/src/banyo-mantik';

describe('Mino Banyo Yapmıyor: oyun mantığı', () => {
  it('yaş grupları', () => {
    expect(kucukMu(3)).toBe(true);
    expect(kucukMu(4)).toBe(true);
    expect(kucukMu(5)).toBe(false);
    expect(kucukMu(6)).toBe(false);
  });

  it('çamur: 3-4 yaşta 4 serbest leke (her karakterde 2), 5-6 yaşta 6 leke, son ikisi hedefli', () => {
    const k = camurPlani(3);
    expect(k.serbest).toHaveLength(4);
    expect(k.hedefli).toHaveLength(0);
    expect(k.serbest.filter((id) => id.startsWith('mino'))).toHaveLength(2);
    const b = camurPlani(6);
    expect(b.serbest.length + b.hedefli.length).toBe(6);
    expect(b.hedefli).toContain('kino-kuyruk');
    expect(bolgeCoz('kino-kuyruk')).toEqual(['kino', 'kuyruk']);
  });

  it('su: kırmızı sıcak, mavi soğuk, ikisi ılık (3-4); büyüklerde oran yeşil bölgede olmalı', () => {
    expect(sicaklik(0, 0)).toBeNull();
    expect(suDurumu(1, 0, 3)).toBe('sicak');
    expect(suDurumu(0, 1, 3)).toBe('soguk');
    expect(suDurumu(1, 0.2, 3)).toBe('ilik');
    expect(suDurumu(1, 1 / 3, 6)).toBe('sicak');
    expect(suDurumu(1 / 3, 1, 6)).toBe('soguk');
    expect(suDurumu(2 / 3, 2 / 3, 6)).toBe('ilik');
    // bir adım fark da ılık (yeşil bölge geniş)
    expect(suDurumu(2 / 3, 1, 6)).toBe('ilik');
    expect(suDurumu(1 / 3, 2 / 3, 6)).toBe('soguk');
    expect(suDurumu(0, 0, 6)).toBeNull();
  });

  it('musluk adımları: küçükte aç/kapa, büyükte dört adım (döngü)', () => {
    expect(muslukAdimlari(4)).toEqual([0, 1]);
    expect(sonrakiAciklik(0, 4)).toBe(1);
    expect(sonrakiAciklik(1, 4)).toBe(0);
    expect(sonrakiAciklik(0, 6)).toBeCloseTo(1 / 3);
    expect(sonrakiAciklik(1, 6)).toBe(0);
  });

  it('yanlış sıcaklıkta küvet yarıdan fazla dolmaz, ılıkta dolmaya devam eder', () => {
    expect(dolumHizi(1, 0, 'sicak', 0.2)).toBeGreaterThan(0);
    expect(dolumHizi(1, 0, 'sicak', YANLIS_SU_SINIRI)).toBe(0);
    expect(dolumHizi(1, 1, 'ilik', 0.9)).toBeGreaterThan(0);
    expect(dolumHizi(0, 0, null, 0)).toBe(0);
  });

  it('baloncuk: küçüklerde her üfleme sayılır; büyüklerde yarım saniyelik yavaş üfleme kocaman, sert ya da çok kısa minik; 2. denemede kabul', () => {
    expect(gerekenBaloncuk(3)).toBe(3);
    expect(gerekenBaloncuk(6)).toBe(2);
    expect(baloncukBoyu(0.2, 0, 4)).toBe('kocaman');
    expect(baloncukBoyu(1.2, 0.1, 6)).toBe('kocaman');
    expect(baloncukBoyu(0.55, 0, 6)).toBe('kocaman');
    expect(baloncukBoyu(0.3, 0, 6)).toBe('minik');
    expect(baloncukBoyu(1.5, 0.8, 6)).toBe('minik');
    expect(baloncukBoyu(0.3, 0.9, 6, 0)).toBe('minik');
    expect(baloncukBoyu(0.3, 0.9, 6, 1)).toBe('kocaman');
    expect(baloncukBoyu(0.3, 0.9, 6, 2)).toBe('kocaman');
  });

  it('ovalama eşiği ve iki adımlı sıra', () => {
    const o = new Ovalama(5);
    o.ekle(2);
    expect(o.bitti).toBe(false);
    o.ekle(3.5);
    expect(o.bitti).toBe(true);
    expect(o.oran).toBe(1);
    const s = ['kulak', 'kuyruk'];
    expect(siraKontrol(s, 0, 'kuyruk')).toBe('yanlis');
    expect(siraKontrol(s, 0, 'kulak')).toBe('dogru');
    expect(siraKontrol(s, 1, 'kuyruk')).toBe('bitti');
  });

  it('tarak: yalnız yukarıdan aşağı, yeterince uzun darbe sayılır', () => {
    expect(taramaMi(0, 60, 100)).toBe(true);
    expect(taramaMi(0, 20, 100)).toBe(false);
    expect(taramaMi(80, 50, 100)).toBe(false);
    expect(taramaMi(0, -60, 100)).toBe(false);
  });

  it('deneme: 2 yanlışta ya da 12 sn\'de ipucu; her yaşta 2. denemede kabul', () => {
    const d = new Deneme(3);
    expect(d.yanlisEkle()).toBe(false);
    expect(d.kabul).toBe(true);
    expect(d.yanlisEkle()).toBe(true);
    expect(d.kabul).toBe(true);
    const b = new Deneme(6);
    b.yanlisEkle();
    b.yanlisEkle();
    expect(b.kabul).toBe(true);
    expect(b.tik(11)).toBe(false);
    expect(b.tik(1.5)).toBe(true);
    b.hareket();
    expect(b.tik(5)).toBe(false);
    // kolay mod her yaşta: 2 yanlıştan (3. deneme) ya da 12 sn'lik ipucundan sonra
    expect(b.kolay).toBe(true);
    const c = new Deneme(6);
    expect(c.kolay).toBe(false);
    c.tik(12.5);
    expect(c.kolay).toBe(true);
  });

  it('uluma: çocuğun perdesini izler, köpek aralığında kalır', () => {
    expect(ulumaFrekansi(12)).toBeGreaterThan(ulumaFrekansi(0));
    expect(ulumaFrekansi(-12)).toBeLessThan(ulumaFrekansi(0));
    expect(ulumaFrekansi(60)).toBeLessThanOrEqual(1100);
    expect(ulumaFrekansi(-60)).toBeGreaterThanOrEqual(300);
    expect(ulumaKonturu([])).toHaveLength(1);
    expect(ulumaKonturu(Array.from({ length: 200 }, (_, i) => i / 20)).length).toBeLessThanOrEqual(25);
  });
});

describe('Mino Banyo Yapmıyor: cümleler', () => {
  const hepsi = new Set(tumCumleler());
  it('seslendirilecek cümleler listede, balon ve ipuçları değil', () => {
    for (const t of [...Object.values(B.mino), ...Object.values(B.kino)]) expect(hepsi.has(normal(t))).toBe(true);
    expect(hepsi.has(normal(B.balon.slap))).toBe(false);
    expect(hepsi.has(normal(B.ipucu.tipa))).toBe(false);
  });
  it('cümleler kısa (en çok 8 kelime, 48 harf)', () => {
    for (const t of [...Object.values(B.mino), ...Object.values(B.kino)]) {
      expect(t.split(/\s+/).length).toBeLessThanOrEqual(8);
      expect(t.length).toBeLessThanOrEqual(48);
    }
  });
});
