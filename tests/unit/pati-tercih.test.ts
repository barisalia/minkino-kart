import { describe, expect, it } from 'vitest';
import { CEKMECELER, esyaVar, HAYVAN_IDLERI, hayvanBilgi, ihtiyacCekmecesi, type CekmeceAdi } from '../../pati/src/katalog';
import { bosKayit } from '../../pati/src/kayit';
import { cekmece, cekmeceAcik, defterYaz, tepki } from '../../pati/src/tercih';

const CEK = Object.keys(CEKMECELER) as CekmeceAdi[];

describe('Pati v2 tercih', () => {
  it('sevgi tablosundaki her eşya katalogda var', () => {
    for (const id of HAYVAN_IDLERI) {
      const b = hayvanBilgi(id);
      for (const s of Object.values(b.sevgi)) for (const e of [...s!.s, ...s!.o, ...s!.x]) expect(esyaVar(e), `${id}: ${e}`).toBe(true);
      if (b.gizli) expect(esyaVar(b.gizli), `${id} gizli ${b.gizli}`).toBe(true);
      if (b.ders) expect(esyaVar(b.ders.esya)).toBe(true);
    }
  });

  it('her hayvanın her ihtiyacında en az bir ★ var', () => {
    for (const id of HAYVAN_IDLERI) for (const ih of hayvanBilgi(id).ihtiyaclar) expect(hayvanBilgi(id).sevgi[ih]?.s.length, `${id} ${ih}`).toBeGreaterThan(0);
  });

  it('3-4: her türün açık çekmecesinde tam 1 ★ ve 3 eşya', () => {
    for (const id of HAYVAN_IDLERI) {
      for (const c of CEK.filter((x) => cekmeceAcik(x, 'kucuk'))) {
        const ih = CEKMECELER[c].ihtiyac;
        if (!hayvanBilgi(id).ihtiyaclar.includes(ih)) continue;
        const l = cekmece(id, c, 'kucuk');
        expect(new Set(l).size, `${id} ${c}: ${l}`).toBe(3);
        expect(l.filter((e) => tepki(id, ih, e, 'kucuk') === 'sever'), `${id} ${c}: ${l}`).toHaveLength(1);
      }
    }
  });

  it('5-6: çekmecede 4-6 eşya, en az bir ★', () => {
    for (const id of HAYVAN_IDLERI) {
      for (const c of CEK) {
        const ih = CEKMECELER[c].ihtiyac;
        if (!hayvanBilgi(id).ihtiyaclar.includes(ih)) continue;
        const l = cekmece(id, c, 'buyuk');
        expect(l.length, `${id} ${c}: ${l}`).toBeGreaterThanOrEqual(4);
        expect(l.length).toBeLessThanOrEqual(6);
        expect(l.some((e) => tepki(id, ih, e, 'buyuk') === 'sever')).toBe(true);
      }
    }
  });

  it('öğretici zıtlık: su spreyini kedi sevmez, kuş sever', () => {
    expect(tepki('tarcin', 'kirli', 'su-spreyi', 'kucuk')).toBe('sevmez');
    expect(tepki('pofuduk', 'kirli', 'su-spreyi', 'kucuk')).toBe('sevmez');
    expect(tepki('limon', 'kirli', 'su-spreyi', 'kucuk')).toBe('sever');
  });

  it('ders yalnız 5-6; renk yavrusunun kendi ✗ ve gizli sevgisi', () => {
    expect(tepki('tarcin', 'ac', 'sut-kasesi', 'buyuk')).toBe('ders');
    expect(tepki('tarcin', 'ac', 'sut-kasesi', 'kucuk')).not.toBe('ders');
    expect(tepki('findik', 'ac', 'kemik-biskuvi', 'buyuk', { 'kemik-biskuvi': 1 })).toBe('sever');
    expect(tepki('findik', 'ac', 'kemik-biskuvi', 'buyuk', { 'kemik-biskuvi': 2 })).toBe('ders');
    // Pamuk kum banyosunu sevmez; gizli sevgisi yumak (5-6)
    expect(tepki('pamuk', 'kirli', 'kum-banyosu', 'buyuk')).toBe('sevmez');
    expect(tepki('tarcin', 'kirli', 'kum-banyosu', 'buyuk')).toBe('sevmez');
    expect(tepki('pamuk', 'sikildi', 'yumak', 'buyuk')).toBe('sever');
    expect(tepki('pamuk', 'sikildi', 'yumak', 'kucuk')).toBe('olur');
    // Çikolata'nın ★'ı top ✗ olunca boş kalmaz: halat açık ★
    expect(tepki('cikolata', 'sikildi', 'halat', 'kucuk')).toBe('sever');
    // Çikolata tembel: top sevmez; Kakao cesur: topu gizlice sever
    expect(tepki('cikolata', 'sikildi', 'top', 'kucuk')).toBe('sevmez');
    expect(tepki('kakao', 'sikildi', 'top', 'buyuk')).toBe('sever');
    expect(tepki('pofuduk', 'sikildi', 'top', 'buyuk')).toBe('sevmez');
    // Fındık'ın gizli sevgisi havuç: 3-4'te sıradan, 5-6'da ★
    expect(tepki('findik', 'ac', 'havuc', 'buyuk')).toBe('sever');
    expect(tepki('findik', 'ac', 'havuc', 'kucuk')).toBe('olur');
  });

  it('başka ihtiyacın eşyası ve balığın olmayan ihtiyacı', () => {
    expect(tepki('findik', 'ac', 'top', 'kucuk')).toBe('baska-ihtiyac');
    expect(tepki('piril', 'susuz', 'su-kabi', 'kucuk')).toBe('baska-ihtiyac');
    expect(ihtiyacCekmecesi('sikildi')).toBe('oyuncak');
  });

  it('defter: ilk ★ bir kez sayılır', () => {
    const k = bosKayit();
    expect(defterYaz(k, 'findik', 'top', 'sever')).toBe(true);
    expect(defterYaz(k, 'findik', 'top', 'sever')).toBe(false);
    expect(defterYaz(k, 'findik', 'marul', 'sevmez')).toBe(false);
    expect(defterYaz(k, 'findik', 'saman', 'baska-ihtiyac')).toBe(false);
    expect(k.defter.findik).toEqual({ top: 'sever', marul: 'sevmez' });
  });
});
