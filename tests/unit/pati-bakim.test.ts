import { describe, expect, it } from 'vitest';
import { ISTE_POZ, komik, kullanim } from '../../pati/src/bakim';
import { CEKMECELER, ESYA_IDLERI, HAYVAN_IDLERI, hayvanBilgi, IHTIYACLAR, type CekmeceAdi } from '../../pati/src/katalog';
import { bosKayit } from '../../pati/src/kayit';
import { cekmece, defterSayfasi, defterYaz, tepki, uzmanMi } from '../../pati/src/tercih';
import { POZLAR } from '../../pati/src/varliklar';

describe('Pati v2 · Bakım Odası: el işi ve komik tepkiler (bakim.ts)', () => {
  it('her eşyanın bir el işi var; tanıdık örnekler', () => {
    for (const e of ESYA_IDLERI) expect(['kap', 'at', 'salla', 'firca', 'sprey', 'yatak', 'ortu', 'ver']).toContain(kullanim(e));
    expect(kullanim('kopek-mamasi')).toBe('kap');
    expect(kullanim('su-kabi')).toBe('kap');
    expect(kullanim('top')).toBe('at');
    expect(kullanim('tuy-degnek')).toBe('salla');
    expect(kullanim('yumusak-firca')).toBe('firca');
    expect(kullanim('su-spreyi')).toBe('sprey');
    expect(kullanim('minder')).toBe('yatak');
    expect(kullanim('ilik-su-torbasi')).toBe('ortu');
  });

  it('PATI-V2 §6b komik tepkileri: kedi spreyden kutuya kaçar, köpeğe marul hapşırtır, tavşan toptan ürker', () => {
    expect(komik('kedi', 'su-spreyi')).toBe('kutuya-kac');
    expect(komik('kopek', 'marul')).toBe('hapsir');
    expect(komik('kopek', 'karton-kutu')).toBe('kafaya-gecer');
    expect(komik('tavsan', 'top')).toBe('urker');
    expect(komik('kedi', 'top')).toBe('esne');
  });

  it('her hayvanın her ✗ eşyası bir komik sahne bulur; her ihtiyacın keyif pozu çizim listesinde', () => {
    for (const id of HAYVAN_IDLERI) {
      const b = hayvanBilgi(id);
      for (const ih of b.ihtiyaclar) for (const e of b.sevgi[ih]?.x ?? []) expect(komik(b.tur, e)).toBeTruthy();
    }
    for (const ih of IHTIYACLAR) expect(POZLAR).toContain(ISTE_POZ[ih]);
  });

  it('3-4 çekmecesinde tam bir ★ ve en az bir komik (✗) seçenek: deneme-yanılma var', () => {
    for (const id of ['tarcin', 'findik', 'pofuduk']) {
      for (const c of ['mama', 'su', 'oyuncak', 'yatak'] as CekmeceAdi[]) {
        const l = cekmece(id, c, 'kucuk');
        const t = l.map((e) => tepki(id, CEKMECELER[c].ihtiyac, e, 'kucuk'));
        expect(l).toHaveLength(3);
        expect(t.filter((x) => x === 'sever')).toHaveLength(1);
        expect(t).toContain('sevmez');
      }
    }
  });
});

describe('Pati v2 · Hayvan Defteri (tercih.ts)', () => {
  it('denenen eşyalar ihtiyacının satırına yazılır; 3-4 sayfasında 4 satır, 5-6 da 6', () => {
    const k = bosKayit();
    defterYaz(k, 'tarcin', 'kedi-mamasi', 'sever');
    defterYaz(k, 'tarcin', 'kemik-biskuvi', 'sevmez');
    defterYaz(k, 'tarcin', 'su-kabi', 'olur');
    const s = defterSayfasi(k, 'tarcin', 'kucuk');
    expect(s.map((r) => r.ihtiyac)).toEqual(['ac', 'susuz', 'sikildi', 'uykulu']);
    expect(s[0].denenen).toEqual([{ esya: 'kedi-mamasi', tepki: 'sever' }, { esya: 'kemik-biskuvi', tepki: 'sevmez' }]);
    expect(s[0].sever).toBe(true);
    expect(s[1].sever).toBe(false);
    expect(defterSayfasi(k, 'tarcin', 'buyuk')).toHaveLength(6);
  });

  it('5-6: gizli sevgi bulunana kadar satırında boş kalp; 3-4 de yok', () => {
    const k = bosKayit();
    const satir = (yas: 'kucuk' | 'buyuk') => defterSayfasi(k, 'tarcin', yas).find((r) => r.ihtiyac === 'sikildi')!;
    expect(satir('buyuk').gizliBekliyor).toBe(true);
    expect(satir('kucuk').gizliBekliyor).toBe(false);
    defterYaz(k, 'tarcin', 'cingirakli-top', 'sever');
    expect(satir('buyuk').gizliBekliyor).toBe(false);
  });

  it('Uzman: her satırın ★ bulununca', () => {
    const k = bosKayit();
    for (const e of ['kemik-biskuvi', 'su-kabi', 'top']) defterYaz(k, 'findik', e, 'sever');
    expect(uzmanMi(k, 'findik', 'kucuk')).toBe(false);
    defterYaz(k, 'findik', 'minder', 'sever');
    expect(uzmanMi(k, 'findik', 'kucuk')).toBe(true);
    expect(uzmanMi(k, 'findik', 'buyuk')).toBe(false);
  });
});
