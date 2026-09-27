import { describe, expect, it } from 'vitest';
import P from '../../content/pazar.json';
import kus from '../../assets/karakter-iskelet/kus.json';
import maymun from '../../assets/karakter-iskelet/maymun.json';
import { normal, tumCumleler } from '../../src/audio/cumleler';
import { kisilik } from '../../src/karakter/kisilik';
import { YASLAR } from '../../src/engine/types';
import { BILESEN, dogruSecim, KAPASITE, karisim, meyveSuyuCumleleri, MEYVE_RENGI, msDenetle, msIstekUret, renkKaristir, SU_KODU, tarif, type SuRengi } from '../../pazar/src/meyvesuyu';

/** Tekrarlanabilir rastgele sayı (mulberry32) */
function tohumlu(t: number) {
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

describe('meyve suyu: renk karışımı', () => {
  it('tek meyve kendi rengini verir', () => {
    expect(karisim(['cilek'])).toBe('kırmızı');
    expect(karisim(['muz'])).toBe('sarı');
    expect(karisim(['yabanmersini'])).toBe('mavi');
    expect(karisim(['portakal'])).toBe('turuncu');
    expect(karisim(['uzum'])).toBe('mor');
    expect(karisim(['armut'])).toBe('yeşil');
  });
  it('ana renkler karışır: kırmızı + sarı = turuncu, sarı + mavi = yeşil, kırmızı + mavi = mor', () => {
    expect(karisim(['cilek', 'muz'])).toBe('turuncu');
    expect(karisim(['limon', 'yabanmersini'])).toBe('yeşil');
    expect(karisim(['kiraz', 'yabanmersini'])).toBe('mor');
    expect(renkKaristir('kırmızı', 'sarı')).toBe('turuncu');
    expect(renkKaristir('sarı', 'mavi')).toBe('yeşil');
    expect(renkKaristir('mavi', 'kırmızı')).toBe('mor');
  });
  it('sıra ve tekrar sonucu değiştirmez', () => {
    expect(karisim(['muz', 'cilek'])).toBe(karisim(['cilek', 'muz']));
    expect(karisim(['cilek', 'cilek', 'kiraz'])).toBe('kırmızı');
    expect(karisim(['muz', 'muz', 'cilek'])).toBe('turuncu');
  });
  it('ara renkli meyve ana renklerine ayrılır: portakal + muz yine turuncu, üçü birden kahverengi', () => {
    expect(karisim(['portakal', 'muz'])).toBe('turuncu');
    expect(karisim(['portakal', 'cilek'])).toBe('turuncu');
    expect(karisim(['uzum', 'muz'])).toBe('kahverengi');
    expect(karisim(['cilek', 'muz', 'yabanmersini'])).toBe('kahverengi');
    expect(karisim([])).toBeNull();
  });
  it('her rengin ekranda bir kodu ve tarifi var', () => {
    for (const r of Object.keys(BILESEN) as SuRengi[]) {
      expect(SU_KODU[r]).toMatch(/^#[0-9A-F]{6}$/i);
      expect(tarif(r).length).toBe(BILESEN[r].length);
    }
    expect(tarif('turuncu')).toEqual(['kırmızı', 'sarı']);
  });
  it('bütün meyve görselleri var (yaban mersini kodla çizilir)', () => {
    const gorseller = import.meta.glob('../../assets/meyveler/*.webp');
    for (const m of Object.keys(MEYVE_RENGI)) if (m !== 'yabanmersini') expect(`../../assets/meyveler/${m}.webp` in gorseller).toBe(true);
  });
});

describe('meyve suyu: istekler', () => {
  it('3-4 yaş: tek renk, istenen renkte tek meyve var, tezgâhtaki renkler birbirinden farklı', () => {
    for (const y of [3, 4] as const) {
      for (let t = 1; t <= 200; t++) {
        const ist = msIstekUret(y, t % 4, tohumlu(t));
        expect(ist.karisik).toBe(false);
        expect(ist.tezgah).toHaveLength(y === 3 ? 3 : 4);
        const renkler = ist.tezgah.map((m) => MEYVE_RENGI[m]);
        expect(new Set(renkler).size).toBe(renkler.length);
        expect(renkler.filter((r) => r === ist.hedef)).toHaveLength(1);
        expect(dogruSecim(ist)).toHaveLength(1);
      }
    }
  });
  it('5 yaş: ara renk ister, tezgâhta yalnız ana renkler (karıştırmak şart)', () => {
    for (let t = 1; t <= 200; t++) {
      const ist = msIstekUret(5, t % 4, tohumlu(t));
      expect(ist.karisik).toBe(true);
      expect(['turuncu', 'yeşil', 'mor']).toContain(ist.hedef);
      expect(new Set(ist.tezgah.map((m) => MEYVE_RENGI[m]))).toEqual(new Set(['kırmızı', 'sarı', 'mavi']));
      const d = dogruSecim(ist);
      expect(d).toHaveLength(2);
      expect(karisim(d!)).toBe(ist.hedef);
    }
  });
  it('6 yaş: daha çok seçenek ve istenenden başka bir ara renkli çeldirici; her zaman çözülebilir', () => {
    for (let t = 1; t <= 200; t++) {
      const ist = msIstekUret(6, t % 4, tohumlu(t));
      expect(ist.tezgah.length).toBeGreaterThanOrEqual(4);
      expect(ist.tezgah.some((m) => MEYVE_RENGI[m] === ist.hedef)).toBe(false);
      expect(new Set(ist.tezgah).size).toBe(ist.tezgah.length);
      expect(dogruSecim(ist)).not.toBeNull();
    }
  });
  it('art arda aynı renk istenmez', () => {
    for (const y of YASLAR) {
      for (let t = 1; t <= 50; t++) {
        const a = msIstekUret(y, 0, tohumlu(t));
        const b = msIstekUret(y, 1, tohumlu(t + 1000), a.hedef);
        expect(b.hedef).not.toBe(a.hedef);
      }
    }
  });
  it('denetleme: doğru karışım tamam, başka renk yanlış, boş blender boş', () => {
    const ist = msIstekUret(5, 0, tohumlu(7));
    expect(msDenetle(ist, dogruSecim(ist)!)).toBe('tamam');
    expect(msDenetle(ist, ist.tezgah)).toBe('yanlis'); // üçü birden: kahverengi
    expect(msDenetle(ist, [])).toBe('bos');
    expect(KAPASITE).toBeGreaterThanOrEqual(3);
  });
});

describe('meyve suyu: cümleler', () => {
  const hepsi = new Set(tumCumleler());
  it('söylenen her cümle seslendirme listesinde ve kısa (≤ 30 karakter)', () => {
    for (const c of meyveSuyuCumleleri()) {
      expect(hepsi.has(normal(c))).toBe(true);
      expect(c.length).toBeLessThanOrEqual(30);
    }
  });
  it('istek cümlesi rengi büyük harfle söyler', () => {
    expect(meyveSuyuCumleleri()).toContain('Turuncu meyve suyu lütfen!');
    expect(meyveSuyuCumleleri()).toContain('Kırmızı meyve suyu lütfen!');
  });
  it('düğme ve balon yazıları seslendirilmez', () => {
    for (const k of ['meyvesuyu', 'karistir', 'blender', 'bardak', 'yabanmersini', 'pazar'] as const) expect(hepsi.has(P.arayuz[k])).toBe(false);
  });
});

describe('maymun ve kuş iskeletleri (7 müşterinin hepsi iskeletli)', () => {
  it('maymun: iskelet ve kişilik sınırları', () => {
    expect(maymun.donme.kuyruk).toEqual([1290, 1650]);
    const k = kisilik('maymun');
    expect(k.kol).toEqual([-45, 45]);
    expect(k.sinir).toEqual({ kafa: 5, kulak: 8, bacak: 5, kuyruk: [-12, 12] });
  });
  it('kuş: kafa gövdeyle tek parça, kanat/bacak/kuyruk/gövde sınırları', () => {
    expect(kus.sira).not.toContain('kafa');
    expect(kus.bagli.gaga).toBe('govde');
    expect(kisilik('kus').sinir).toEqual({ bacak: 6, kuyruk: [-8, 8], govde: 3, kanat: [-20, 30] });
  });
  it('her müşterinin iskeleti var', () => {
    const iskeletler = import.meta.glob('../../assets/karakter-iskelet/*.json');
    for (const m of P.musteriler) expect(`../../assets/karakter-iskelet/${m}.json` in iskeletler).toBe(true);
  });
});
